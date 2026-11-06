'use strict';

/**
 * github-milestone — every CWOS sprint is a GitHub milestone, so GitHub shows
 * sprint progress natively (founder decision 2026-10-31).
 *
 * Lifecycle, driven from cwos-next.js:
 *   approve          -> ensureMilestone: create `SPR-NNN: <title>`, or adopt a
 *                       milestone that already carries that title.
 *   done             -> closeMilestone.
 *   done --abandon   -> closeMilestone with the reason appended to the
 *                       description as `Abandoned: <reason>`.
 *
 * THE DESCRIPTION IS A CONTRACT. A fleet-wide sweep (ai-personal) reads OPEN
 * milestones over the GitHub API and attaches pull requests to them by WS id.
 * It reads two lines, and both are always present, each on its own line:
 *   Sprint: SPR-NNN
 *   Items: WS-123, WS-456
 * The goal text above them is free prose; a goal line that would itself start
 * with `Sprint:` or `Items:` is defanged so the sweep can never read it.
 *
 * FAIL LOUD, NOT FATAL. No gh, no auth, offline, no GitHub origin: every
 * function here returns `{ error: "<one-line reason>" }` instead of throwing,
 * and the caller prints one `WARN github-milestone:` line, records the reason
 * on the sprint as `github_milestone_error`, and lets the sprint operation
 * succeed. A sprint is never refused because GitHub was unreachable.
 *
 * Opt-out: CWOS_NO_GITHUB_MILESTONE=1 skips everything (tests, offline runs).
 * Test seam: CWOS_MILESTONE_GH names a node script standing in for `gh` (the
 * cwos-pr.js CWOS_PR_GH pattern), and every function also takes `deps.gh` /
 * `deps.git` so unit tests inject runners directly. Nothing else should set
 * CWOS_MILESTONE_GH.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const OPT_OUT_ENV = 'CWOS_NO_GITHUB_MILESTONE';
const FAKE_GH_ENV = 'CWOS_MILESTONE_GH';
const TITLE_MAX = 100;
const GOAL_MAX = 400;
const GH_TIMEOUT_MS = 20000;
const MAX_LIST_PAGES = 10;

function optedOut(env = process.env) {
  const v = env[OPT_OUT_ENV];
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s !== '' && s !== '0' && s !== 'false' && s !== 'no';
}

/** owner/repo from a GitHub remote URL (https, ssh://, scp-style), or null. */
function parseGithubSlug(url) {
  const s = String(url || '').trim();
  const m = /^(?:https?|ssh|git):\/\/(?:[^@/]+@)?github\.com(?::\d+)?\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(s)
    || /^(?:[^@\s/]+@)?github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(s);
  return m ? `${m[1]}/${m[2]}` : null;
}

/** A reason that fits one WARN line and one double-quoted YAML scalar. */
function oneLine(s, max = 240) {
  const flat = String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/["\\]/g, "'").trim();
  return flat.length > max ? flat.slice(0, max - 1) + '…' : flat;
}

function truncate(s, max) {
  const str = String(s || '');
  return str.length > max ? str.slice(0, max - 1).trimEnd() + '…' : str;
}

function sprintTitle(sprint) {
  if (sprint && sprint.title) return String(sprint.title);
  const goal = sprint && sprint.goal ? String(sprint.goal) : '';
  return goal.split('\n')[0];
}

function milestoneTitle(sprintId, sprint) {
  const t = sprintTitle(sprint).trim();
  return truncate(t ? `${sprintId}: ${t}` : sprintId, TITLE_MAX);
}

function itemIds(sprint) {
  return (Array.isArray(sprint && sprint.items) ? sprint.items : [])
    .map((it) => (it && typeof it === 'object' ? it.id : it))
    .filter(Boolean)
    .map(String);
}

function milestoneDescription(sprintId, sprint) {
  // The contract lines must be the only lines the sweep can match, so a goal
  // line that starts the same way is defanged before it is cut to length.
  const goal = truncate(String((sprint && sprint.goal) || '').trim().replace(/^(\s*)(Sprint|Items):/gim, '$1$2 -'), GOAL_MAX);
  const ids = itemIds(sprint);
  const lines = [];
  if (goal) lines.push(goal, '');
  lines.push(`Sprint: ${sprintId}`);
  lines.push(`Items:${ids.length ? ' ' + ids.join(', ') : ''}`);
  return lines.join('\n');
}

// ─── runners (injectable) ──────────────────────────────────────────────────

function defaultGh(args, cwd, env = process.env) {
  const fake = env[FAKE_GH_ENV];
  const r = fake
    ? spawnSync(process.execPath, [fake, ...args], { cwd, encoding: 'utf8', env, timeout: GH_TIMEOUT_MS })
    : spawnSync('gh', args, { cwd, encoding: 'utf8', env, timeout: GH_TIMEOUT_MS, windowsHide: true });
  let err = (r.stderr || '').trim();
  if (r.error) {
    err = r.error.code === 'ENOENT' ? 'gh is not installed (not on PATH)'
      : r.error.code === 'ETIMEDOUT' ? `gh timed out after ${GH_TIMEOUT_MS / 1000}s (offline?)`
        : r.error.message;
  }
  return { status: r.error ? null : r.status, out: (r.stdout || '').trim(), err };
}

function defaultGit(args, cwd) {
  // The ceiling stops discovery at `cwd`: a repo with no git dir of its own
  // must never borrow a parent checkout's origin and touch its GitHub.
  const env = Object.assign({}, process.env, { GIT_CEILING_DIRECTORIES: path.dirname(path.resolve(cwd)) });
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env, windowsHide: true });
  return { status: r.error ? null : r.status, out: (r.stdout || '').trim(), err: (r.stderr || (r.error && r.error.message) || '').trim() };
}

function runners(deps) {
  return { gh: (deps && deps.gh) || defaultGh, git: (deps && deps.git) || defaultGit };
}

function ghFailure(r) {
  const text = `${r.err || ''} ${r.out || ''}`;
  if (/auth login|not logged in|authentication required|HTTP 401/i.test(text)) return `gh is not authenticated (${oneLine(r.err || r.out, 120)})`;
  return oneLine(r.err || r.out || `gh exited ${r.status}`);
}

function ghJson(gh, cwd, args) {
  const r = gh(args, cwd);
  if (r.status !== 0) return { error: ghFailure(r) };
  try {
    return { data: r.out ? JSON.parse(r.out) : null };
  } catch (e) {
    return { error: `gh returned non-JSON output (${oneLine(e.message, 80)})` };
  }
}

function resolveSlug(git, cwd) {
  const r = git(['remote', 'get-url', 'origin'], cwd);
  if (r.status !== 0 || !r.out) return { error: `no git origin remote in ${cwd}` };
  const slug = parseGithubSlug(r.out);
  if (!slug) return { error: `origin is not a GitHub remote (${oneLine(r.out, 120)})` };
  return { slug };
}

function findByTitle(gh, cwd, slug, title) {
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const r = ghJson(gh, cwd, ['api', `repos/${slug}/milestones?state=all&per_page=100&page=${page}`]);
    if (r.error) return { error: r.error };
    const list = Array.isArray(r.data) ? r.data : [];
    const hit = list.find((m) => m && m.title === title);
    if (hit) return { milestone: hit };
    if (list.length < 100) break;
  }
  return { milestone: null };
}

function recordedNumber(sprint) {
  const n = Number(sprint && sprint.github_milestone);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ─── lifecycle ─────────────────────────────────────────────────────────────

/**
 * Make sure the sprint has a milestone. Idempotent twice over: a recorded
 * `github_milestone` short-circuits with no GitHub call, and an existing
 * milestone with the same title is adopted rather than duplicated.
 *
 * @returns {{action:'skipped', reason}|{action:'existing'|'adopted'|'created', number, title}|{error}}
 */
function ensureMilestone({ sprintId, sprint, cwd, deps, env = process.env }) {
  if (optedOut(env)) return { action: 'skipped', reason: `${OPT_OUT_ENV} is set` };
  const existing = recordedNumber(sprint);
  if (existing) return { action: 'existing', number: existing };
  const { gh, git } = runners(deps);

  const s = resolveSlug(git, cwd);
  if (s.error) return { error: s.error };
  const title = milestoneTitle(sprintId, sprint);
  const description = milestoneDescription(sprintId, sprint);

  const found = findByTitle(gh, cwd, s.slug, title);
  if (found.error) return { error: found.error };
  if (found.milestone) {
    const number = found.milestone.number;
    if (found.milestone.state === 'closed') {
      // Titles are unique per repo and carry the sprint id, so a closed one is
      // this sprint's own from an earlier attempt. It is being approved now.
      const re = ghJson(gh, cwd, ['api', '-X', 'PATCH', `repos/${s.slug}/milestones/${number}`, '-f', 'state=open']);
      if (re.error) return { error: `adopted closed milestone #${number} but could not reopen it: ${re.error}`, number };
    }
    return { action: 'adopted', number, title };
  }

  const created = ghJson(gh, cwd, ['api', '-X', 'POST', `repos/${s.slug}/milestones`, '-f', `title=${title}`, '-f', `description=${description}`]);
  if (created.error) return { error: created.error };
  const number = created.data && created.data.number;
  if (!Number.isInteger(number)) return { error: 'gh created a milestone but returned no number' };
  return { action: 'created', number, title };
}

/**
 * Close the sprint's milestone. With `abandonReason`, also append
 * `Abandoned: <reason>` to its description (once). A sprint with no recorded
 * milestone has nothing to close: skipped, no GitHub call.
 *
 * @returns {{action:'skipped', reason}|{action:'closed', number}|{error, number}}
 */
function closeMilestone({ sprint, cwd, deps, abandonReason = null, env = process.env }) {
  if (optedOut(env)) return { action: 'skipped', reason: `${OPT_OUT_ENV} is set` };
  const number = recordedNumber(sprint);
  if (!number) return { action: 'skipped', reason: 'no github_milestone recorded on this sprint' };
  const { gh, git } = runners(deps);

  const s = resolveSlug(git, cwd);
  if (s.error) return { error: s.error, number };
  const url = `repos/${s.slug}/milestones/${number}`;
  const args = ['api', '-X', 'PATCH', url, '-f', 'state=closed'];
  if (abandonReason) {
    const cur = ghJson(gh, cwd, ['api', url]);
    if (cur.error) return { error: cur.error, number };
    const desc = String((cur.data && cur.data.description) || '');
    if (!/^Abandoned:/m.test(desc)) {
      const reason = String(abandonReason).replace(/\s+/g, ' ').trim();
      args.push('-f', `description=${desc ? desc.replace(/\s+$/, '') + '\n\n' : ''}Abandoned: ${reason}`);
    }
  }
  const r = ghJson(gh, cwd, args);
  if (r.error) return { error: r.error, number };
  return { action: 'closed', number };
}

module.exports = {
  OPT_OUT_ENV,
  FAKE_GH_ENV,
  optedOut,
  parseGithubSlug,
  milestoneTitle,
  milestoneDescription,
  oneLine,
  ensureMilestone,
  closeMilestone,
};
