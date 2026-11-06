'use strict';

/**
 * session-handoff — a session's final words are its handoff (founder, 2026-11-03).
 *
 * MEASURED BEFORE BUILT. 150 session endings, Oct 22 – Nov 3:
 *   - ~100% named the founder's next action; 1 of 150 gave a prompt a NEW
 *     session could start from (and only because he asked).
 *   - 75 of 150 final messages were a reply to clean-tree-check's "Work is still
 *     loose", so the real reason for stopping sat one message earlier.
 *   - 12 stopped at a usage or login wall and left nothing: a session cannot
 *     write last words after it is cut off. So the handoff is ROLLING — kept on
 *     disk every turn — not only final.
 *   - None stopped for context; he rotates sessions himself with /clear. The
 *     handoff is what makes that rotation lossless.
 *
 * THE BLOCK. Last thing in a reply, when work stops with anything left:
 *
 *   ```handoff
 *   reason: decision
 *   done: cockpit board built, PR #161 open
 *   left: relay design, WS-1350
 *   git: all committed and pushed on claude/session-handoff
 *   needs: desk item homebase-approve-... (https://...)
 *   Ready to hand off. Start a new session with:
 *   > In HomeBase, PR #161 merged. Build cockpit phase 2 (WS-1349) per docs/designs/session-cockpit.md.
 *   ```
 *
 * The hook (session-report-log) parses it, adds facts it MEASURES (branch,
 * uncommitted paths, unpushed commits, context size) and keeps both in the
 * report's frontmatter. The model's word is never trusted for git state.
 */

/** Stop reasons, from the 150-ending classification. `ready` is what each must have. */
const REASONS = {
  done: 'everything committed and pushed; `left:` names the next item, or says nothing',
  'needs-you': 'the founder action is on his desk or his PR list, with its link',
  decision: 'the question is on his desk with a recommendation, and the block links it',
  waiting: 'names what is running, where, and when to check (`check:`)',
  blocked: 'names what holds it and who can clear it (`blocked-by:`)',
  'low-memory': 'unfinished work is in a WIP commit, so nothing is only on disk',
};

const FIELDS = ['reason', 'done', 'left', 'git', 'needs', 'check', 'blocked-by'];
const PROMPT_CUE = /start (?:a )?new session with:?\s*$/i;
// A prompt that leans on the conversation it came from is no prompt for a new one.
const LEANS_ON_CONTEXT = /\b(as (discussed|above|before)|see above|the above|this (conversation|session|thread)|from earlier|you (just|already) (saw|did))\b/i;
const LINK = /https?:\/\/\S+|\b[a-z0-9]+(?:-[a-z0-9]+){3,}\b/i; // a URL, or a desk item id
const MIN_PROMPT = 40;

/** The LAST ```handoff block in a reply -> {reason, done, left, git, needs, check, blockedBy, prompt}, or null. */
function parseHandoff(text) {
  const blocks = [...String(text || '').matchAll(/```handoff[^\n]*\n([\s\S]*?)```/g)];
  if (!blocks.length) return null;
  const body = blocks[blocks.length - 1][1];
  const h = { reason: null, done: null, left: null, git: null, needs: null, check: null, blockedBy: null, prompt: null };
  const promptLines = [];
  let inPrompt = false;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (inPrompt) {
      if (line) promptLines.push(line.replace(/^>\s?/, ''));
      continue;
    }
    if (PROMPT_CUE.test(line)) { inPrompt = true; continue; }
    const m = line.match(/^([a-z-]+):\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (!FIELDS.includes(key)) continue;
    h[key === 'blocked-by' ? 'blockedBy' : key] = m[2].trim() || null;
  }
  if (h.reason) h.reason = h.reason.toLowerCase().split(/\s/)[0];
  h.prompt = promptLines.join(' ').trim() || null;
  return h;
}

/** True when `left:` says nothing is left. */
function nothingLeft(h) {
  return !h.left || /^(nothing|none|n\/a|-)\b/i.test(h.left);
}

/**
 * The block against its reason's standard, and against MEASURED facts.
 * facts: {dirty, unpushed} (numbers, or null when unknown). Returns problems[].
 */
function checkHandoff(h, facts = {}) {
  const problems = [];
  if (!h) return ['no handoff block'];
  if (!h.reason || !REASONS[h.reason]) {
    problems.push(`reason must be one of: ${Object.keys(REASONS).join(', ')}`);
    return problems;
  }
  const done = h.reason === 'done' && nothingLeft(h);
  if (!done) {
    if (!h.prompt) problems.push('no start prompt after "Start a new session with:"');
    else {
      if (h.prompt.length < MIN_PROMPT) problems.push(`start prompt is ${h.prompt.length} characters; a new session needs the repo, the item and the next step`);
      if (LEANS_ON_CONTEXT.test(h.prompt)) problems.push('start prompt leans on this conversation ("above", "as discussed"); a new session cannot see it');
    }
  }
  const dirty = Number.isFinite(facts.dirty) ? facts.dirty : null;
  const unpushed = Number.isFinite(facts.unpushed) ? facts.unpushed : null;
  if ((h.reason === 'done' || h.reason === 'low-memory') && ((dirty || 0) > 0 || (unpushed || 0) > 0)) {
    problems.push(`${h.reason} needs nothing loose, but git measures ${dirty || 0} uncommitted path(s) and ${unpushed || 0} unpushed commit(s)`);
  }
  if ((h.reason === 'needs-you' || h.reason === 'decision') && !LINK.test(`${h.needs || ''} ${h.left || ''}`)) {
    problems.push(`${h.reason} needs a link or desk item id in \`needs:\``);
  }
  if (h.reason === 'waiting' && !h.check) problems.push('waiting needs `check:` (what, where, when)');
  if (h.reason === 'blocked' && !h.blockedBy) problems.push('blocked needs `blocked-by:` (what holds it, who clears it)');
  return problems;
}

/**
 * The rolling record kept in the report frontmatter. A turn with a block
 * replaces the handoff; a turn without one keeps the last block (so a session
 * cut off by a usage limit still has one) and refreshes only the facts.
 */
function rollHandoff(prev, parsed, facts, nowIso) {
  const handoff = parsed
    ? { ...parsed, at: nowIso }
    : (prev && prev.handoff) || null;
  const problems = handoff ? checkHandoff(handoff, facts) : null;
  return {
    handoff: handoff ? { ...handoff, ready: problems.length === 0, problems } : null,
    facts: { ...facts, at: nowIso },
  };
}

/**
 * The context the model last saw = input + cache read + cache creation tokens on
 * the last assistant turn of a transcript tail. Null when the tail holds no usage.
 */
function lastContextTokens(tail) {
  const lines = String(tail || '').split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.includes('"usage"')) continue;
    try {
      const j = JSON.parse(line);
      const u = (j.message && j.message.usage) || j.usage;
      if (!u || typeof u.input_tokens !== 'number') continue;
      return u.input_tokens + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
    } catch { /* the first line of a tail is usually cut */ }
  }
  return null;
}

/** One frontmatter line each. JSON is valid YAML flow, and this file is read by us. */
function toFrontmatter(rec) {
  const lines = [];
  if (rec.handoff) lines.push(`handoff: ${JSON.stringify(rec.handoff)}`);
  if (rec.facts) lines.push(`facts: ${JSON.stringify(rec.facts)}`);
  return lines.join('\n');
}

/** Report text -> {handoff, facts}, each null when absent or unreadable. */
function fromFrontmatter(text) {
  const fm = String(text || '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = { handoff: null, facts: null };
  if (!fm) return out;
  for (const key of ['handoff', 'facts']) {
    const m = fm[1].match(new RegExp(`^${key}: (\\{.*\\})\\s*$`, 'm'));
    if (m) { try { out[key] = JSON.parse(m[1]); } catch { /* torn line */ } }
  }
  return out;
}

module.exports = { REASONS, parseHandoff, checkHandoff, rollHandoff, toFrontmatter, fromFrontmatter, nothingLeft, lastContextTokens };
