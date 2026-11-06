#!/usr/bin/env node
/**
 * cwos-pr — every session branch becomes a pull request, and each pull request
 * says in its first line whether it lands itself or waits for the founder's tap.
 *
 * WHY THIS EXISTS
 *
 * Weekend of 2026-09-25..27: every piece of work that stranded had no pull
 * request, and every piece that had one landed (16 self-merges in 4-18s where a
 * standing grant existed; one founder tap where it did not). A branch without a
 * pull request is invisible in the founder's GitHub-app list, which is his
 * confirming surface (2026-09-28). So the rule is not "merge faster", it is
 * "never leave work where he cannot see it", plus two lanes:
 *
 *   self  records, docs, ordinary code whose checks pass -> the session merges it
 *   tap   money, security settings, kit releases, or anything a commit marks
 *         `Needs-Founder: <the decision in plain words>` -> waits for his tap
 *
 * The lane comes from .claude/landing.yaml (built-in defaults when absent).
 * A cloud session cannot push anything but its own branch and has no `gh`; it
 * runs `plan` and uses the GitHub MCP tools with the body `plan` wrote. On a node
 * `open` and `land` do the same through `gh`.
 *
 *   plan        lane + PR title/body for the current branch (--out <file> writes the body)
 *   open        (gh) create or update the branch's PR with that body
 *   land        (gh) run the policy's checks, then merge; refuses the tap lane
 *   check-turn  Stop hook: a claude/* branch with unlanded commits and no PR
 *               opened this session is told to open one (exit 2, once per turn)
 *
 * HEALTH BEFORE LANE (WS-986, MIS-015). 2026-10-01: kit 3.43.0's release PR #40
 * opened in the tap lane, this script wrote "🟡 Needs your tap", and the session
 * told the founder it was ready — while atomic-state-writes.test.js was RED and
 * the full kit sweep had never completed against that code (BLIND). The lane
 * says WHO decides; it never said whether there was anything ready to decide.
 * So plan/open now compute the branch head's health in the fleet vocabulary
 * (OK checked-and-fine · RED known wrong · BLIND nobody checked): every
 * landing.yaml `checks:` command, plus — when kit/VERSION or kit/hashes-* is in
 * the diff — the per-commit sweep record for the head (lib/test-sweep-record.js;
 * missing → BLIND, failed → RED). No checks configured is BLIND, not OK. A TAP
 * PR whose health is not OK is opened (or turned back into) a DRAFT whose first
 * line reads "⚪ Not ready — WRITTEN · health RED|BLIND — <checks> — ME"; the
 * "Needs your tap" header appears only at OK, and re-running `open` flips the
 * draft to ready once it is. The result is recorded per PR in
 * <workstreamDir>/state/pr-health.json, which the check-reply judge reads.
 *
 * FOUR LANES (docs/designs/pr-flow-end-to-end.md v2, DECIDED 2026-10-31). The 2026-10-31 clear
 * merged ~33 of 83 open PRs and 50 were open again by evening, because sessions kept opening PRs
 * nobody reviews. So:
 *
 *   direct  records, docs, state (never code) straight to the default branch, no PR. Off unless
 *           the BASE copy of landing.yaml says `direct_enabled: true`; only `direct.paths` may go,
 *           and never a FLOOR path, a repo `tap:` path or a code file. Enforced by `prepush` (the
 *           kit pre-push lane kit/scripts/git-hooks/pre-push-direct-lane.sh).
 *   self    everything not on the floor: the session merges it once its checks pass.
 *   tap     the always-tap FLOOR (below, in code: a YAML cannot remove it), the repo's own `tap:`
 *           rules, a `No-Auto-Land:` trailer, or the repo's own classifier asking for him.
 *   decide  a `Needs-Founder:` trailer or the `held:founder-decision` label: the PR is a DRAFT and
 *           the question goes on the founder desk; plan/open print the exact desk command. The kit
 *           never files it itself (the desk lives in ai-personal).
 *
 * POLICY COMES FROM THE BASE BRANCH (origin/<default>), never from the PR's own tree: a PR cannot
 * widen its own lane, and `.claude/landing.yaml` is itself on the floor. The lane is the STRICTER of
 * landing.yaml and the repo's classifier when one exists on the base (ServeYourNote
 * scripts/classify-change.py: any tier above T0 or rigor R2+ is tap; deckside
 * infrastructure/scripts/pr-risk.js: T3 is tap). The base copy of the classifier is run; one that
 * is present and errors fails closed to tap.
 *
 * THE LOW-RISK SELF LANE (docs/designs/low-risk-self-lane.md, founder 2026-11-01: "We need to widen
 * the self approval lanes", LOW-RISK ONLY). A repo whose base landing.yaml says `default_lane: tap`
 * may list `self: {records, docs, tests, tooling}` globs. A PR lands itself only when EVERY changed
 * file is on one of those lists, no file is on the floor, a repo `tap:` rule, the declared sensitive
 * set (fleet-contract.yaml `sensitive:` on the base) or the built-in NEVER_SELF list (session
 * instructions, configs, snapshots), no file is run by a workflow, a hook or a lane check (gate code,
 * found from the base copies of those files), nothing is deleted, and no test is weakened. Records
 * and docs may not be code. Detected by path and content, never by label. With no landing.yaml, or
 * one that does not parse, the lane is TAP: unassessed is not low.
 *
 * LAND ASKS GITHUB, NOT ITS OWN TREE. `land` fetches the base, refuses when its own lane code
 * (this file and kit/scripts/lib) differs from the base copy, refuses in a repo whose own gate merges
 * (`merge_owner: repo-gate`, or deckside/swim-model pr-gate, women-s-health system/gates/land.js),
 * and merges only when GitHub reports the PR open, not a draft, on the default branch, at exactly
 * the head that was judged, CLEAN, with at least one check and every check passed. The merge is
 * pinned with --match-head-commit and a comment records lane, head and base policy.
 *
 * ONE SESSION PR PER REPO PER DAY. `open` refuses to open a second PR in the same lane while a
 * claude/* PR opened today (UTC) is still open and not in the founder's queue, and prints how to add
 * the work to it. It does NOT push onto that PR's branch itself: another session may still be live
 * on it, and a push there would race that session and drop any approval he gave. `--new-pr` opens a
 * separate one on purpose.
 *
 * Draws on ai-personal's auto-land.js draft (2026-09-27): conflicts are predicted
 * with `git merge-tree` without touching the working tree, and history is never
 * rewritten. Unlike that draft it goes through a pull request, because a cloud
 * session cannot push to main and the pull request is where the founder looks.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');
const { parseYAML, writeFileAtomic, findWorkstreamDir } = require('./lib/cwos-utils');
const sweepRecord = require('./lib/test-sweep-record');

const CLI = {
  name: 'cwos-pr',
  summary: 'turn the session branch into a pull request in the right lane (self-merge or founder tap)',
  usage: 'cwos-pr <plan|open|land|check-turn> [options]',
  subcommands: {
    plan: 'print the lane and the PR title/body for the current branch',
    open: '(gh) create or update the pull request for the current branch',
    land: '(gh) run the policy checks, then merge — only in the self lane',
    'check-turn': 'Stop hook: nudge (exit 2, once per turn) when a claude/* branch has unlanded commits and no PR',
    prepush: "pre-push lane: refuse a push to the default branch outside the direct lane (git's refs on stdin, <remote> as the first argument)",
  },
  flags: {
    out: { type: 'string', placeholder: 'file', describe: 'plan/open: also write the PR body to this file' },
    pr: { type: 'string', placeholder: 'number', describe: 'plan: record the computed health for this PR number in state/pr-health.json (open records it itself)' },
    json: { type: 'boolean', describe: 'plan: machine-readable output' },
    'dry-run': { type: 'boolean', describe: 'open/land: say what would happen, change nothing' },
    repo: { type: 'string', placeholder: 'path', describe: 'repository to act on (default: current directory)' },
    'new-pr': { type: 'boolean', describe: 'open: open a separate PR although a claude/* PR in the same lane was opened today' },
    rec: { type: 'string', placeholder: 'text', describe: 'plan/open, decide lane: the recommendation for the desk question (else a `Recommend:` commit trailer)' },
  },
  notes: [
    'Lane policy: .claude/landing.yaml ON THE BASE BRANCH — default_lane, direct_enabled, direct: {paths}, tap: [{reason, paths}], checks: [commands], nudge_branches: [globs]. The working-tree copy is never read.',
    'Lanes: direct (records straight to main, enforced by `prepush`) · self · tap · decide.',
    'The always-tap FLOOR (money, auth, CI, settings, secrets, children\'s-data guards, regulated documents, kit releases, landing.yaml, the gates) is built into this script; a repo adds its own paths under `tap:`.',
    'A commit trailer `Needs-Founder: <decision>` or the label held:founder-decision puts the PR in the DECIDE lane (a draft plus a founder-desk question; optional `Recommend: <text>` trailer). `No-Auto-Land: <reason>` holds it in TAP.',
    '`cwos-pr.js --self-test` runs the pure checks, no network.',
    'Health (WS-986): OK / RED / BLIND for the branch head, from landing.yaml checks plus, for a kit release diff, the per-commit test sweep record (cwos-test-sweep.js --commit). A TAP PR that is not OK opens as a draft headed "Not ready"; re-run `open` to flip it ready once OK.',
    'Exit codes: 0 ok, 1 refused/failed (reason on stderr), 2 bad command line or (check-turn) nudge.',
  ],
};

// No landing.yaml on the base, or one that does not parse: TAP (low-risk design, finding H1). Until
// 2026-11-01 the built-in default was self, which meant a repo that had never written a policy
// self-landed everything off the floor.
const DEFAULT_POLICY = {
  default_lane: 'tap',
  self: { records: [], docs: [], tests: [], tooling: [] },
  self_errors: [],
  merge_owner: 'cwos-pr',
  tap: [
    { reason: 'it changes security settings (permissions, hooks or CI)', paths: ['.claude/settings*.json', '.github/workflows/**', '**/.env*', '**/*secret*', '**/*credential*'] },
    { reason: 'it touches money code', paths: ['**/payment*/**', '**/billing/**', '**/ledger/**', '**/invoice*/**'] },
    { reason: 'it is a kit release', paths: ['kit/VERSION', 'kit/hashes-*.yaml'] },
  ],
  checks: [],
  nudge_branches: ['claude/*'],
  direct_enabled: false,
  direct_paths: [],
};

// The always-tap floor (design §3, founder 2026-10-31: "self by default, with a fixed always-tap
// floor"). It lives in code, not in landing.yaml, so no repo's YAML can remove it; a repo ADDS its
// own paths under `tap:`. Generic globs on purpose: a repo-specific name belongs in that repo's
// landing.yaml, not here.
const FLOOR = [
  { reason: 'it touches money or payments (always-tap floor)', paths: [
    '**/payment/**', '**/payments/**', '**/*payment*.*', '**/billing/**', '**/*billing*.*', '**/ledger/**', '**/*ledger*.*',
    '**/invoice*/**', '**/invoice*.*', '**/stripe/**', '**/stripe*.*', '**/escrow/**', '**/payout*/**', '**/waterfall*.*',
  ],
  // The git-hygiene disposition ledger is a record of branches and stashes, not money. Matching it
  // by the word "ledger" sent every hygiene pass's records PR to the founder's tap (2026-11-01,
  // HomeBase #143). Exact paths only: anything else named *ledger* stays on the floor.
  except: ['.claude/hygiene/ledger.jsonl'] },
  { reason: 'it touches auth or permissions (always-tap floor)', paths: [
    '**/auth/**', '**/auth.*', '**/*_auth.*', '**/*-auth.*', '**/authn/**', '**/authz/**',
    '**/permission*/**', '**/permission*.*', '**/*_permission*.*', '**/rbac/**', '**/CODEOWNERS',
  ] },
  { reason: 'it changes CI or the session settings (always-tap floor)', paths: [
    '.github/workflows/**', '.github/actions/**', '.claude/settings*.json', '.claude/hooks/**', '.mcp.json',
    // Low-risk review H7: other agents' hook config, and the files that grant trust or guards.
    '.codex/hooks.json', '**/*.trust.json', '**/guards.yaml',
  ] },
  // Founder 2026-11-01: migrations wait for his tap. Migration directories and SQL only: a name
  // match would catch kit/scripts/cwos-migrate.js (the kit upgrader) and docs about migrations.
  { reason: 'it changes a database migration (always-tap floor)', paths: [
    '**/migrations/**', '**/migrate/**', '**/alembic/**', '**/*.sql',
  ] },
  // The contract declares the sensitive set and the required checks this script reads: changing it
  // changes what may land (low-risk review H9).
  { reason: "it changes the repo's fleet contract (sensitive set, required checks) (always-tap floor)", paths: ['fleet-contract.yaml'] },
  { reason: 'it touches secrets (always-tap floor)', paths: [
    '**/.env*', '**/*secret*', '**/*credential*', '**/*.pem', '**/*.key', '**/id_rsa*', '**/id_ed25519*',
  ] },
  { reason: "it touches children's data or its guards (always-tap floor)", paths: [
    '**/swimmer-data*', '**/swimmer-data*/**', 'infrastructure/scripts/*gate*', '**/*allowlist*',
  ] },
  { reason: 'it changes a regulated document or email template (always-tap floor)', paths: [
    'backend/templates/documents/**', 'backend/templates/emails/**',
  ] },
  { reason: 'it is a kit release (always-tap floor)', paths: ['kit/VERSION', 'kit/hashes-*'] },
  { reason: 'it changes the lane rules or the gates themselves (always-tap floor)', paths: [
    '.claude/landing.yaml', 'kit/templates/landing.yaml', 'kit/scripts/cwos-pr.js', 'kit/scripts/git-hooks/**',
    'kit/scripts/install-git-hooks.sh', 'kit/scripts/lib/**', '.githooks/**', '.husky/**',
    '.github/scripts/**', 'kit/templates/github/**', 'scripts/classify-change.py', 'infrastructure/scripts/pr-risk.js',
    'infrastructure/scripts/pr-review.js', '.claude/rules/merge-gates.md', '.claude/rules/merge-by-founder-label.md',
  ] },
];

/**
 * The floor matches case-insensitively (a `.GitHub/Workflows/x.yml` or `Kit/VERSION` on a
 * case-insensitive filesystem is the same file). Returns the first floor rule a path hits, or null.
 */
function floorRule(file) { return FLOOR.find((r) => matchesAny(file, r.paths, true) && !(r.except && matchesAny(file, r.except, true))) || null; }

// What a lane-deciding diff must be asked for: no rename detection (a rename would list only its
// destination, so `git mv .claude/landing.yaml docs/x.md` hid the floor path), NUL-separated names
// (a path with a newline or quote is not mangled), and --raw, because the PATH alone is not what
// lands: a symlink `docs/lnk -> ../.github/workflows` is a docs path whose content is a floor path
// (second review, H1). Modes travel with every entry.
const DIFF_RAW = ['diff', '--raw', '--no-renames', '-z', '--no-abbrev'];
const SYMLINK = '120000';
const GITLINK = '160000';
const EXEC = '100755';

/** Pure: parse `git diff --raw -z` output into [{ path, oldMode, newMode, status }]. */
function parseRaw(out) {
  const t = String(out || '').split('\0');
  const entries = [];
  for (let i = 0; i < t.length - 1; i += 2) {
    const m = /^:(\d{6}) (\d{6}) \S+ \S+ (\S+)$/.exec(t[i]);
    if (!m) continue;
    entries.push({ oldMode: m[1], newMode: m[2], status: m[3], path: t[i + 1] });
  }
  return entries;
}

/** Run a lane-deciding diff. Returns { ok, files, entries, err }. */
function diffNames(cwd, range) {
  const r = spawnSync('git', [...DIFF_RAW, ...range], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return { ok: false, files: [], entries: [], err: (r.stderr || r.error?.message || `exit ${r.status}`).trim() };
  const entries = parseRaw(r.stdout);
  return { ok: true, files: entries.map((e) => e.path), entries, err: '' };
}

/**
 * Pure: entries whose MODE makes them more than a record, whatever their path: a symlink or a
 * submodule (gitlink) added or changed to, anywhere. `exec` also flags an exec bit gained; the direct
 * lane refuses that, the PR lanes do not (a script gaining +x on a PR is ordinary).
 */
function specialEntries(entries, { exec = false } = {}) {
  const out = [];
  for (const e of entries || []) {
    if (e.newMode === SYMLINK) out.push({ file: e.path, why: 'it is a symbolic link, which can point at a floor path' });
    else if (e.newMode === GITLINK) out.push({ file: e.path, why: 'it is a submodule (gitlink), whose content is not reviewed here' });
    else if (exec && e.newMode === EXEC && e.oldMode !== EXEC) out.push({ file: e.path, why: 'it gains the executable bit' });
  }
  return out;
}

// The kit knows these repos' own classifiers: their absence on the base is not "no classifier", it
// is a missing gate, and fails closed to tap. A repo can declare one with `classifier:` too.
const KNOWN_CLASSIFIERS = { serveyournote: 'scripts/classify-change.py', deckside: 'infrastructure/scripts/pr-risk.js' };

// The direct lane never carries code, whatever a repo lists (design §3: "never code").
const CODE_FILE = /\.(c?js|mjs|tsx?|jsx|py|sh|bash|zsh|ps1|psm1|bat|cmd|rb|go|rs|java|kts?|php|pl|c|h|cc|cpp|hpp|cs|swift|sql|html?|vue|svelte|lua|r)$/i;

const NEEDS_FOUNDER = /^Needs-Founder:\s*(.+)$/im;
const NO_AUTO_LAND = /^No-Auto-Land:\s*(.+)$/im;
const RECOMMEND = /^Recommend:\s*(.+)$/im;
const DECIDE_LABEL = 'held:founder-decision';
// Labels that put a PR in the founder's queue: never batch onto, never repair.
const QUEUE_LABELS = ['founder-approved', 'waiting:founder', DECIDE_LABEL];

// A diff touching these is a kit release: its health also needs a completed,
// green test sweep of the exact code (WS-986). Kept separate from the TAP rule
// in landing.yaml on purpose — a repo can retune who decides a release without
// thereby deciding what a release must prove.
const RELEASE_PATHS = ['kit/VERSION', 'kit/hashes-*.yaml'];
const CHECK_TIMEOUT_MS = 10 * 60000;

// ---------------------------------------------------------------------------
// git helpers

function git(cwd, args, opts = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', input: opts.input });
  if (!opts.allowFail && r.status !== 0) throw new Error(`git ${args.join(' ')}: ${(r.stderr || '').trim()}`);
  return { status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function defaultBranch(cwd) {
  const sym = git(cwd, ['symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD'], { allowFail: true });
  if (sym.status === 0 && sym.out) return sym.out.replace('refs/remotes/origin/', '');
  for (const b of ['main', 'master']) {
    if (git(cwd, ['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${b}`], { allowFail: true }).status === 0) return b;
  }
  return 'main';
}

// ---------------------------------------------------------------------------
// policy

function globToRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      // `**/` is "any directories, or none" — anchored at a path boundary, so `**/auth.*` matches
      // `auth.js` and `src/auth.js` but not `src/oauth.js`.
      if (glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function matchesAny(file, globs, ci = false) {
  return (globs || []).some((g) => { const re = globToRegex(g); return (ci ? new RegExp(re.source, 'i') : re).test(file); });
}

// ---------------------------------------------------------------------------
// the low-risk self lane (design docs/designs/low-risk-self-lane.md)

const SELF_KINDS = ['records', 'docs', 'tests', 'tooling'];

// Never on a low-risk list, whatever a repo writes (review H7, M18, M19): the instructions every
// session obeys, other agents' configuration, snapshot baselines, build and dependency config, the
// invariants file whose check commands are gates, and kit templates that ship to the fleet. These
// are not the floor: a repo on `default_lane: self` keeps its own call on them. They only keep the
// LOW-RISK lane low.
const NEVER_SELF = [
  '.claude/**', '**/CLAUDE.md', '**/AGENTS.md', '**/AGENTS.override.md', '**/SKILL.md', '.codex/**', '.agents/**',
  'kit/commands/**', 'kit/templates/**', 'engines/**', '.github/**', 'system/invariants.md',
  '**/conftest.py', '**/__snapshots__/**', '**/*.snap', '**/*-snapshots/**', '**/*.config.*', '**/setup*.py',
  '**/package.json', '**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml', '**/requirements*.txt', '**/pyproject.toml',
  '**/Makefile', '**/Dockerfile*', '**/docker-compose*', '**/Procfile', '.gitattributes', '**/.gitignore', '**/.npmrc',
];
// `.claude/workstream/**` is records, the one part of `.claude/` a low-risk list may name.
const NEVER_SELF_EXCEPT = ['.claude/workstream/**'];
// A glob this wide is not a list (review M17a): it is the old self-by-default, by another name.
const TOO_BROAD = new Set(['**', '**/*', '*', '*/**', '**/**', './**']);
// What a test file looks like. A `tests:` glob that matches a non-test file does not carry it.
const TEST_FILE = /(^|\/)(tests?|__tests__|specs?)\/|[._-](test|spec)\.[a-z0-9]+$|(^|\/)test_[^/]+\.[a-z0-9]+$/i;

const isNeverSelf = (f) => matchesAny(f, NEVER_SELF, true) && !matchesAny(f, NEVER_SELF_EXCEPT, true);

/** Pure: a landing.yaml `self:` block -> { lists: {records, docs, tests, tooling}, errors: [string] }. */
function parseSelf(raw) {
  const lists = { records: [], docs: [], tests: [], tooling: [] };
  const errors = [];
  if (raw == null) return { lists, errors };
  if (typeof raw !== 'object' || Array.isArray(raw)) return { lists, errors: ['`self:` must be a map of records, docs, tests, tooling'] };
  for (const [k, v] of Object.entries(raw)) {
    if (!SELF_KINDS.includes(k)) { errors.push(`\`self.${k}\` is not one of ${SELF_KINDS.join(', ')}`); continue; }
    const arr = Array.isArray(v) ? v : v == null ? [] : [v];
    for (const g0 of arr) {
      const g = String(g0).trim();
      if (!g) continue;
      if (TOO_BROAD.has(g)) { errors.push(`\`self.${k}\` lists "${g}", which is every path`); continue; }
      // "Anywhere in the tree" is allowed only for tests, whose files are checked by name too.
      if (g.startsWith('**/') && k !== 'tests') { errors.push(`\`self.${k}\` lists "${g}", which matches at any depth; name the directory`); continue; }
      lists[k].push(g);
    }
  }
  return { lists, errors };
}

/**
 * Pure (low-risk review H1, H7, M18, M19): is every changed file on this repo's low-risk lists?
 * `ctx.weakened` is [{file, why}] from testWeakening. Returns { ok, misses: [{file, why}] }.
 */
function lowRiskVerdict(policy, files, entries = [], ctx = {}) {
  const lists = policy.self || DEFAULT_POLICY.self;
  if (!SELF_KINDS.some((k) => (lists[k] || []).length)) return { ok: false, misses: [], none: true };
  if (!files.length) return { ok: false, misses: [{ file: '', why: 'nothing changed' }] };
  const misses = [];
  const byPath = new Map((entries || []).map((e) => [e.path, e]));
  for (const f of files) {
    const e = byPath.get(f);
    if (f.includes('\\')) { misses.push({ file: f, why: 'a backslash in a name reads as a different path on Windows' }); continue; }
    if (isNeverSelf(f)) { misses.push({ file: f, why: 'session instructions, agent or build configuration never land themselves' }); continue; }
    if (e && e.status === 'D') { misses.push({ file: f, why: 'it deletes a file, which can remove a check' }); continue; }
    const kind = SELF_KINDS.find((k) => matchesAny(f, lists[k] || []));
    if (!kind) { misses.push({ file: f, why: 'not on this repo\'s low-risk lists (records, docs, tests, tooling)' }); continue; }
    if ((kind === 'records' || kind === 'docs') && CODE_FILE.test(f)) { misses.push({ file: f, why: `a code file under a ${kind} path` }); continue; }
    if (kind === 'tests' && !TEST_FILE.test(f)) { misses.push({ file: f, why: 'under a tests path but not named like a test' }); continue; }
    if (kind !== 'tooling' && e && e.newMode === EXEC && e.oldMode !== EXEC) { misses.push({ file: f, why: 'it gains the executable bit' }); continue; }
  }
  for (const w of ctx.weakened || []) misses.push(w);
  return { ok: misses.length === 0, misses };
}

// Added lines that switch a test off, in the frameworks this fleet uses.
const SKIP_ADDED = /\b(?:it|test|describe|suite)\.(?:skip|todo)\s*\(|\bx(?:it|test|describe)\s*\(|pytest\.mark\.(?:skip|xfail)|@unittest\.skip|\.only\s*\(|\bt\.skip\s*\(/;
const ASSERTION = /\b(?:assert\w*|expect)\s*[.(]|\bassert\s/;

/**
 * Pure (review M18): a unified diff (-U0) of the tests-path files -> [{file, why}] for each file
 * that adds a skip/only or loses more assertion lines than it gains. A test that only grows passes.
 */
function testWeakening(diffText) {
  const out = [];
  let file = null, added = 0, removed = 0, skip = false;
  const flush = () => {
    if (!file) return;
    if (skip) out.push({ file, why: 'it switches a test off (skip, only, xfail)' });
    else if (removed > added) out.push({ file, why: `it removes ${removed - added} more assertion line(s) than it adds` });
  };
  for (const line of String(diffText || '').split('\n')) {
    const m = /^\+\+\+ b\/(.+)$/.exec(line);
    if (m) { flush(); file = m[1]; added = 0; removed = 0; skip = false; continue; }
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (line.startsWith('+')) { if (SKIP_ADDED.test(line)) skip = true; if (ASSERTION.test(line)) added++; }
    else if (line.startsWith('-')) { if (ASSERTION.test(line)) removed++; }
  }
  flush();
  return out;
}

/** Pure: the `sensitive:` list of a parsed fleet-contract.yaml -> normalised prefixes. */
function sensitiveFromContract(c) {
  const s = c && Array.isArray(c.sensitive) ? c.sensitive : [];
  return s.map((x) => String(x).trim().replace(/^\.\//, '')).filter(Boolean);
}
const inSensitive = (f, set) => set.some((p) => (p.endsWith('/') ? f.toLowerCase().startsWith(p.toLowerCase()) : f.toLowerCase() === p.toLowerCase() || f.toLowerCase().startsWith(`${p.toLowerCase()}/`)));

// A path a workflow, a hook or a lane check names is gate code (review H5, H8).
const SCRIPT_TOKEN = /[A-Za-z0-9_.\/${}-]+\.(?:c?js|mjs|cjs|tsx?|py|sh|bash|ps1|rb)\b/g;

/** Pure: texts of gate-running files -> the set of script paths (and bare names) they name. */
function gateTokens(texts) {
  const tokens = new Set();
  for (const t of texts) {
    for (const raw of String(t || '').match(SCRIPT_TOKEN) || []) {
      const norm = raw.replace(/^(?:\$\{?[A-Za-z_]+\}?\/)+/, '').replace(/^(?:\.\/|\/)+/, '');
      if (norm) tokens.add(norm);
    }
  }
  return tokens;
}
// A code file named like a guard, a gate or a hook is gate code wherever it sits (driver evidence
// 2026-11-01: PR #138 changed kit/scripts/cwos-git.js, the PreToolUse git guard, and self-landed).
const GATE_NAME = /(^|[/_.-])(guards?|gates?|hooks?)([/_.-]|$)/i;
// What a kit MANIFEST row's `impact:` says when the script runs as a hook, a guard or a gate.
const HOOKISH = /\b(hooks?|guard(s|ed|ing)?|gates?|gating|PreToolUse|PostToolUse|SessionStart|UserPromptSubmit|PermissionDenied|pre-commit|pre-push|post-commit|containment)\b/i;

/** Pure: kit/MANIFEST.yaml text -> the `source:` paths whose `impact:` names a hook, guard or gate. */
function manifestGateSources(text) {
  const out = [];
  let src = null;
  for (const line of String(text || '').split('\n')) {
    const s = /^\s*-\s*source:\s*["']?([^"'\s#]+)/.exec(line);
    if (s) { src = s[1]; continue; }
    const i = /^\s*impact:\s*(.*)$/.exec(line);
    if (i && src && HOOKISH.test(i[1])) out.push(src);
  }
  return out;
}

/** Pure: is `f` named by any token (a full path, a path suffix, or a bare file name)? */
function isGateReferenced(f, tokens) {
  const base = f.split('/').pop();
  for (const t of tokens) {
    if (t === f || t.endsWith(`/${f}`) || f.endsWith(`/${t}`) || (!t.includes('/') && t === base)) return true;
  }
  return false;
}

/**
 * What the base branch says about gates and sensitivity: the declared sensitive set
 * (fleet-contract.yaml) and the scripts named by workflows, hooks and the lane's own checks.
 * Unreadable is reported, never silently empty.
 */
function loadBaseContext(root, baseRef, policy) {
  const out = { sensitive: [], sensitiveSource: null, gateTokens: new Set(), errors: [] };
  const c = git(root, ['show', `${baseRef}:fleet-contract.yaml`], { allowFail: true });
  if (c.status === 0) {
    try { out.sensitive = sensitiveFromContract(parseYAML(c.out)); out.sensitiveSource = `fleet-contract.yaml on ${baseRef}`; }
    catch (e) { out.errors.push(`fleet-contract.yaml on ${baseRef} does not parse (${e.message})`); }
  }
  const ls = git(root, ['ls-tree', '-r', '--name-only', baseRef, '--', '.github/workflows', '.github/actions', '.githooks', '.husky'], { allowFail: true });
  const files = (ls.status === 0 ? ls.out.split('\n') : []).filter(Boolean)
    .concat(['.claude/settings.json', '.codex/hooks.json', 'package.json', '.pre-commit-config.yaml', 'lefthook.yml']);
  const texts = [];
  for (const f of files) {
    const r = git(root, ['show', `${baseRef}:${f}`], { allowFail: true });
    if (r.status === 0) texts.push(r.out);
  }
  texts.push(...(policy.checks || []));
  // The kit's own hook registry: every script install-claude-hooks.mjs wires into a session.
  const reg = git(root, ['show', `${baseRef}:kit/scripts/install-claude-hooks.mjs`], { allowFail: true });
  if (reg.status === 0) texts.push(reg.out);
  out.gateTokens = gateTokens(texts);
  // The kit MANIFEST (HomeBase): every shipped script whose stated job is a hook, guard or gate.
  const man = git(root, ['show', `${baseRef}:kit/MANIFEST.yaml`], { allowFail: true });
  if (man.status === 0) for (const s of manifestGateSources(man.out)) out.gateTokens.add(s);
  return out;
}

/** Pure: a parsed landing.yaml (or null) -> the policy object. */
function policyFromYaml(y, source) {
  if (!y || typeof y !== 'object') return { ...DEFAULT_POLICY, source };
  const direct = y.direct && typeof y.direct === 'object' ? y.direct : {};
  const self = parseSelf(y.self);
  return {
    // Only an explicit `default_lane: self` is self (review H1): an absent or misspelt key is tap.
    default_lane: y.default_lane === 'self' ? 'self' : 'tap',
    self: self.lists,
    self_errors: self.errors,
    merge_owner: y.merge_owner === 'repo-gate' ? 'repo-gate' : 'cwos-pr',
    tap: Array.isArray(y.tap) ? y.tap : DEFAULT_POLICY.tap,
    checks: Array.isArray(y.checks) ? y.checks : [],
    nudge_branches: Array.isArray(y.nudge_branches) ? y.nudge_branches : DEFAULT_POLICY.nudge_branches,
    direct_enabled: y.direct_enabled === true,
    direct_paths: Array.isArray(direct.paths) ? direct.paths.map(String) : [],
    classifier: (Array.isArray(y.classifier) ? y.classifier : y.classifier ? [y.classifier] : []).map(String),
    source,
  };
}

/**
 * The policy is the BASE branch's `.claude/landing.yaml` (design §3: "Policy is read from the base
 * branch, never from the PR's own copy"). The working tree is never read: a branch that edits
 * landing.yaml cannot change its own lane. `present` says whether the base has one at all.
 */
function loadPolicy(root, baseRef) {
  const ref = baseRef || `origin/${defaultBranch(root)}`;
  const r = git(root, ['show', `${ref}:.claude/landing.yaml`], { allowFail: true });
  if (r.status !== 0) {
    return { ...DEFAULT_POLICY, present: false, source: `built-in defaults (no .claude/landing.yaml on ${ref})` };
  }
  let y;
  try { y = parseYAML(r.out); } catch (e) {
    return { ...DEFAULT_POLICY, present: true, error: e.message, source: `built-in defaults (.claude/landing.yaml on ${ref} did not parse: ${e.message})` };
  }
  // A file that reads as nothing (an empty or non-map document) is not a policy (review M17b).
  if (!y || typeof y !== 'object' || Array.isArray(y)) {
    return { ...DEFAULT_POLICY, present: true, error: 'it is not a map', source: `built-in defaults (.claude/landing.yaml on ${ref} is not a map)` };
  }
  return { ...policyFromYaml(y, `.claude/landing.yaml on ${ref}`), present: true };
}

/**
 * Pure: decide the lane from changed files, commit messages, the repo classifier's verdicts and
 * the PR's labels. Stricter wins: decide > tap > self. The FLOOR applies whatever the policy says.
 */
function decideLane(policy, files, commits, extra = {}) {
  const reasons = [];
  // An unreadable diff is never an empty one (a missing base ref or a shallow clone with no merge
  // base used to produce files=[] and land as self, with no classifier run).
  if (extra.diffError) reasons.push({ reason: `could not read the diff (${extra.diffError}), so nothing about it is known`, files: [] });
  // A policy that did not parse dropped its own tap rules: nothing it says is trusted (review M17b).
  if (policy.error) reasons.push({ reason: `the base .claude/landing.yaml could not be read (${policy.error}), so its rules are unknown`, files: [] });
  for (const e of extra.contextErrors || []) reasons.push({ reason: `${e}, so the sensitive set is unknown`, files: [] });
  const sensitive = extra.sensitive || [];
  const sens = files.filter((f) => inSensitive(f, sensitive));
  if (sens.length) reasons.push({ reason: "it touches this repo's declared sensitive set (fleet-contract.yaml)", files: sens });
  const gated = files.filter((f) => (extra.gateTokens && isGateReferenced(f, extra.gateTokens)) || (CODE_FILE.test(f) && GATE_NAME.test(f)));
  if (gated.length) reasons.push({ reason: 'it changes code a workflow, a hook or a lane check runs (gate code)', files: gated });
  // A symlink or a submodule is tap whatever its path: its content can be a floor path (second review H1).
  const special = specialEntries(extra.entries);
  if (special.length) reasons.push({ reason: 'it adds a symbolic link or a submodule, whose target is not reviewed by path', files: special.map((s) => s.file) });
  for (const rule of FLOOR) {
    const hit = files.filter((f) => matchesAny(f, rule.paths, true) && !(rule.except && matchesAny(f, rule.except, true)));
    if (hit.length) reasons.push({ reason: rule.reason, files: hit });
  }
  for (const rule of policy.tap || []) {
    const hit = files.filter((f) => matchesAny(f, rule.paths));
    if (hit.length && !reasons.some((r) => r.reason === rule.reason)) reasons.push({ reason: rule.reason, files: hit });
  }
  for (const c of extra.classifiers || []) {
    if (c.lane === 'tap') reasons.push({ reason: c.why, files: [], classifier: c.name });
  }
  const asked = [];
  const held = [];
  let recommend = null;
  for (const c of commits) {
    const body = c.body || '';
    const m = body.match(NEEDS_FOUNDER);
    // A follow-up commit often repeats the trailer; one decision is asked once.
    if (m && !asked.includes(m[1].trim())) asked.push(m[1].trim());
    const h = body.match(NO_AUTO_LAND);
    if (h && !held.includes(h[1].trim())) held.push(h[1].trim());
    const r = body.match(RECOMMEND);
    if (r) recommend = r[1].trim();
  }
  const labelled = (extra.labels || []).includes(DECIDE_LABEL);
  for (const h of held) reasons.push({ reason: `held: ${h}`, files: [] });
  let lane = 'self';
  let lowRisk = null;
  if (asked.length || labelled) lane = 'decide';
  else if (reasons.length) lane = 'tap';
  else if (policy.default_lane === 'tap') {
    // The low-risk lane: only when every file is on the repo's lists (design §2).
    lowRisk = lowRiskVerdict(policy, files, extra.entries, { weakened: extra.weakened });
    if (!lowRisk.ok) {
      lane = 'tap';
      if (!lowRisk.none) {
        const off = lowRisk.misses;
        reasons.push({ reason: `not every file is low-risk (${off.slice(0, 3).map((m) => `${m.file || '-'}: ${m.why}`).join('; ')}${off.length > 3 ? ' …' : ''})`, files: off.map((m) => m.file).filter(Boolean) });
      }
      for (const e of policy.self_errors || []) reasons.push({ reason: `the low-risk lists were not all read: ${e}`, files: [] });
    }
  }
  return { lane, reasons, asked, labelled, recommend, lowRisk: lowRisk ? lowRisk.ok : false };
}

/**
 * Pure: may this push to the default branch go straight in (the direct lane)? `files` is what the
 * push brings to the default branch. Returns { ok, why, refused: [{file, why}] }.
 */
//
// BY DESIGN (review finding 12): only the NET diff between the remote tip and the pushed tip is
// judged. A push whose commits cancel out (add then revert code) has an empty net diff and passes,
// and a force-push passes when its net diff from the old tip is records only. Neither puts anything
// on the branch that is not a record; history rewriting is branch protection's job.
function decideDirect(policy, files, { headHasPolicy = false, entries = [] } = {}) {
  if (!policy.present) {
    // Rolling the policy out by a direct push is refused (review finding 3): the push that brings
    // the lane's own rules is exactly the one the lane must not wave through.
    if (headHasPolicy) {
      return { ok: false, why: 'this push brings a .claude/landing.yaml the default branch does not have yet; land the policy through a pull request', refused: [{ file: '.claude/landing.yaml', why: 'the lane rules arrive by PR' }] };
    }
    return { ok: true, inert: true, why: `no .claude/landing.yaml on the default branch, so the direct lane is not configured here and nothing is enforced (${policy.source})`, refused: [] };
  }
  if (policy.error) return { ok: false, why: `the default branch's .claude/landing.yaml does not parse (${policy.error}); refusing rather than guessing`, refused: [] };
  if (!policy.direct_enabled) {
    return { ok: false, why: 'the direct lane is off in this repo (`direct_enabled` is not true on the default branch): every change goes through a pull request', refused: files.map((f) => ({ file: f, why: 'direct lane off' })) };
  }
  // Mode before path (second review H1, L4): a symlink, a submodule or a newly executable file is
  // refused whatever path it sits at.
  const refused = specialEntries(entries, { exec: true });
  for (const f of files) {
    if (refused.some((r) => r.file === f)) continue;
    const floor = floorRule(f) || (policy.tap || []).find((r) => matchesAny(f, r.paths));
    if (f.includes('\\')) refused.push({ file: f, why: 'a backslash in a name reads as a different path on Windows' });
    else if (floor) refused.push({ file: f, why: floor.reason });
    else if (CODE_FILE.test(f)) refused.push({ file: f, why: 'code never goes through the direct lane' });
    else if (!matchesAny(f, policy.direct_paths)) refused.push({ file: f, why: 'not on the direct lane\'s path list (`direct.paths`)' });
  }
  if (refused.length) return { ok: false, why: `${refused.length} file(s) are not direct-lane records`, refused };
  return { ok: true, why: `${files.length} file(s), all on the direct lane`, refused };
}

// ---------------------------------------------------------------------------
// the repo's own classifier (design §3: "the lane is the stricter of landing.yaml and the repo's
// own classifier"; it can only raise a lane, never lower it)

const CLASSIFIER_TIMEOUT_MS = 2 * 60000;

/** Pure: ServeYourNote classify-change.py output -> verdict. Tier above T0 or rigor R2+ is tap. */
function judgeClassifyChange(r) {
  if (r.status === null || r.error) return { lane: 'tap', error: true, why: `did not run (${r.error || 'timed out'})` };
  const out = `${r.stdout || ''}`;
  if (r.status === 1) return { lane: 'tap', why: 'it derives Tier 2/3 (founder review required)' };
  if (r.status === 2) return { lane: 'tap', why: 'some changed paths are unclassified (nothing was cleared)' };
  if (r.status !== 0) return { lane: 'tap', error: true, why: `exited ${r.status}` };
  const t = out.match(/^Decision tier:\s*T(\d)/m);
  const g = out.match(/^Rigor:\s*R(\d)/m);
  if (!t || !g) return { lane: 'tap', error: true, why: 'its output carried no `Decision tier:` / `Rigor:` line' };
  const tier = Number(t[1]), rigor = Number(g[1]);
  if (tier > 0 || rigor >= 2) return { lane: 'tap', why: `it derives T${tier} / R${rigor}` };
  return { lane: 'self', why: `it derives T${tier} / R${rigor}` };
}

/** Pure: deckside pr-risk.js `classify --json` output -> verdict. T3 is tap. */
function judgePrRisk(r) {
  if (r.status === null || r.error) return { lane: 'tap', error: true, why: `did not run (${r.error || 'timed out'})` };
  if (r.status !== 0) return { lane: 'tap', error: true, why: `exited ${r.status}` };
  let j;
  try { j = JSON.parse(r.stdout); } catch { return { lane: 'tap', error: true, why: 'its --json output did not parse' }; }
  if (!j || !Number.isInteger(j.tier)) return { lane: 'tap', error: true, why: 'its output carried no tier' };
  if (j.tier >= 3) return { lane: 'tap', why: `it derives ${j.tierName || `T${j.tier}`}` };
  return { lane: 'self', why: `it derives ${j.tierName || `T${j.tier}`}` };
}

function runPython(script, args, cwd) {
  for (const py of ['python3', 'python']) {
    const r = spawnSync(py, [script, ...args], { cwd, encoding: 'utf8', timeout: CLASSIFIER_TIMEOUT_MS });
    if (r.error && r.error.code === 'ENOENT') continue;
    return { status: r.status, stdout: r.stdout, stderr: r.stderr, error: r.error ? r.error.message : null };
  }
  return { status: null, error: 'no python3 or python on PATH' };
}

const CLASSIFIERS = [
  {
    name: 'scripts/classify-change.py',
    path: 'scripts/classify-change.py',
    dirs: ['scripts'],
    // argparse reads a name starting with "-" as an option, and `--` would end --files: such a
    // change cannot be passed safely, so it fails closed (review finding 8).
    run: (tmp, ctx) => (ctx.files.some((f) => f.startsWith('-'))
      ? { status: null, error: 'a changed path starts with "-", which the classifier would read as an option' }
      : runPython(path.join(tmp, 'scripts', 'classify-change.py'), ['--files', ...ctx.files], ctx.root)),
    judge: judgeClassifyChange,
  },
  {
    name: 'infrastructure/scripts/pr-risk.js',
    path: 'infrastructure/scripts/pr-risk.js',
    dirs: ['infrastructure/scripts', 'kit/scripts/lib'],
    run: (tmp, ctx) => {
      const r = spawnSync(process.execPath, [path.join(tmp, 'infrastructure', 'scripts', 'pr-risk.js'), 'classify', '--base', ctx.mergeBase, '--head', ctx.head, '--json', '--repo', ctx.root],
        { cwd: ctx.root, encoding: 'utf8', timeout: CLASSIFIER_TIMEOUT_MS });
      return { status: r.status, stdout: r.stdout, stderr: r.stderr, error: r.error ? r.error.message : null };
    },
    judge: judgePrRisk,
  },
];

/** Copy `dirs` from the base ref into a fresh temp dir, so the BASE copy of a classifier runs. */
function extractFromBase(root, baseRef, dirs) {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cwos-pr-classifier-'));
  for (const d of dirs) {
    const a = spawnSync('git', ['archive', '--format=tar', baseRef, '--', d], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
    if (a.status !== 0) continue;   // an optional sibling dir the base does not have
    const x = spawnSync('tar', ['-x', '-C', tmp], { input: a.stdout });
    if (x.status !== 0) throw new Error(`could not unpack ${d} from ${baseRef}: ${String(x.stderr || x.error || '').trim()}`);
  }
  return tmp;
}

/**
 * Run every classifier the BASE branch carries. Returns [{name, lane, why, error?}]. A classifier
 * that is absent is not run; one that is present and fails is a tap verdict (fail closed).
 */
function runClassifiers(root, baseRef, files, opts = {}) {
  const out = [];
  if (!files.length) return out;
  // Paths that MUST be there (review finding 8): declared by the base landing.yaml (`classifier:`),
  // or known to the kit for this repo. Absent on the base -> tap, never "no classifier".
  const known = opts.repoName ? KNOWN_CLASSIFIERS[String(opts.repoName).toLowerCase()] : null;
  const expected = new Set([...(opts.declared || []), ...(known ? [known] : [])]);
  for (const p of expected) {
    if (!CLASSIFIERS.some((c) => c.path === p)) out.push({ name: p, lane: 'tap', error: true, why: `the repo declares the classifier ${p}, which cwos-pr has no judge for, so it fails closed to tap` });
  }
  for (const c of CLASSIFIERS) {
    if (git(root, ['cat-file', '-e', `${baseRef}:${c.path}`], { allowFail: true }).status !== 0) {
      if (expected.has(c.path)) out.push({ name: c.name, lane: 'tap', error: true, why: `the repo's classifier ${c.name} is expected here but absent on ${baseRef}, so it fails closed to tap` });
      continue;
    }
    let tmp = null;
    try {
      tmp = extractFromBase(root, baseRef, c.dirs);
      const head = git(root, ['rev-parse', 'HEAD']).out;
      const mergeBase = git(root, ['merge-base', baseRef, 'HEAD'], { allowFail: true }).out || baseRef;
      const v = c.judge(c.run(tmp, { root, files, head, mergeBase }));
      out.push({ name: c.name, lane: v.lane, error: !!v.error, why: `the repo's classifier ${c.name} ${v.error ? `could not decide (${v.why}), so it fails closed to tap` : v.why}` });
    } catch (e) {
      out.push({ name: c.name, lane: 'tap', error: true, why: `the repo's classifier ${c.name} could not run (${e.message}), so it fails closed to tap` });
    } finally {
      if (tmp) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* temp */ } }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// health (WS-986)

/** Pure: RED if anything is known wrong, else BLIND if anything went unchecked, else OK. */
function aggregateHealth(checks) {
  if (!checks.length) return 'BLIND';
  if (checks.some((c) => c.result === 'RED')) return 'RED';
  if (checks.some((c) => c.result !== 'OK')) return 'BLIND';
  return 'OK';
}

function lastLine(text, n) {
  const t = String(text || '').trim().split('\n').map((l) => l.trim()).filter(Boolean);
  return (t[t.length - 1] || '').slice(0, n);
}

function runCheck(cwd, cmd) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', timeout: CHECK_TIMEOUT_MS });
  // A check that never finished checked nothing: BLIND, not RED and not OK.
  if (r.status === null) {
    return { name: cmd, result: 'BLIND', detail: r.error ? `did not run: ${r.error.message}` : `did not finish in ${CHECK_TIMEOUT_MS / 60000} min` };
  }
  if (r.status === 0) return { name: cmd, result: 'OK', detail: '' };
  const last = lastLine(`${r.stdout || ''}\n${r.stderr || ''}`, 160);
  return { name: cmd, result: 'RED', detail: `exit ${r.status}${last ? ` — ${last}` : ''}` };
}

/** The release check: the per-commit sweep record for HEAD (or HEAD's identical kit/scripts tree). */
function sweepCheck(cwd, root, headSha) {
  const name = 'kit test sweep (per-commit)';
  const tree = git(cwd, ['rev-parse', 'HEAD:kit/scripts'], { allowFail: true }).out || null;
  const found = sweepRecord.recordForCommit(sweepRecord.recordDir(root), headSha, tree);
  if (!found) {
    return { name, result: 'BLIND', detail: `no completed sweep of ${String(headSha).slice(0, 7)} — run \`node kit/scripts/cwos-test-sweep.js --commit\` in this checkout` };
  }
  const r = found.record;
  const at = `${String(r.head_sha).slice(0, 7)}${found.via === 'tree' ? ' (same kit/scripts tree as HEAD)' : ''}`;
  const failed = Array.isArray(r.failed) ? r.failed : [];
  if (r.health === 'RED') {
    return { name, result: 'RED', detail: `${failed.length} suite(s) failing at ${at}: ${failed.slice(0, 4).map((f) => f.suite).join(', ')}${failed.length > 4 ? ' …' : ''}` };
  }
  if (r.health === 'BLIND') {
    const allNm = Array.isArray(r.not_measured) && r.suites_total > 0 && r.not_measured.length >= r.suites_total;
    const why = allNm ? 'every suite NOT MEASURED (machine paging) — nothing was measured; re-run off-peak'
      : !r.finished_at || r.cut_short ? `cut short at ${r.suites_run}/${r.suites_total}`
      : r.dirty_kit_scripts ? 'ran with kit/scripts dirty, so it tested no commit' : 'incomplete';
    return { name, result: 'BLIND', detail: `sweep of ${at} ${why}` };
  }
  const unmeasured = Array.isArray(r.not_measured) ? r.not_measured : [];
  const nm = unmeasured.length
    ? ` — NOT MEASURED (machine paging): ${unmeasured.map((f) => f.suite).join(', ')}` : '';
  const reds = Array.isArray(found.reds_on_tree) ? found.reds_on_tree : [];
  const warn = reds.length
    ? ` — WARNING: ${reds.length} RED attempt(s) on this same kit/scripts tree (newest ${String(reds[0].head_sha).slice(0, 7)} at ${reds[0].finished_at}: ${(reds[0].failed || []).map((f) => f.suite).join(', ')}); policy pending, verdict unchanged`
    : '';
  return { name, result: 'OK', detail: `${r.suites_run - unmeasured.length}/${r.suites_total} suites green at ${at}${nm}${warn}` };
}

/** Health of the branch head. Runs the policy's checks — never call this on a hot path. */
function computeHealth(cwd, root, policy, files) {
  const headSha = git(cwd, ['rev-parse', 'HEAD']).out;
  const checks = (policy.checks || []).map((cmd) => runCheck(cwd, cmd));
  if (!checks.length) checks.push({ name: 'landing.yaml checks', result: 'BLIND', detail: 'none configured, so nothing verified this head' });
  if (files.some((f) => matchesAny(f, RELEASE_PATHS))) checks.push(sweepCheck(cwd, root, headSha));
  return { head_sha: headSha, health: aggregateHealth(checks), checks };
}

/** Contract 2: <workstreamDir>/state/pr-health.json, keyed by PR number. Returns the path or null. */
function recordPrHealth(root, prNumber, p) {
  let ws;
  try { ws = findWorkstreamDir(root); } catch { return null; }
  const file = path.join(ws, 'state', 'pr-health.json');
  let all = {};
  try { all = JSON.parse(fs.readFileSync(file, 'utf8')) || {}; } catch { all = {}; }
  if (typeof all !== 'object' || Array.isArray(all)) all = {};
  all[String(prNumber)] = { branch: p.branch, head_sha: p.head_sha, lane: p.lane, health: p.health, checks: p.checks, at: new Date().toISOString() };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  writeFileAtomic(file, `${JSON.stringify(all, null, 2)}\n`);
  return file;
}

function notOkSummary(checks) {
  return checks.filter((c) => c.result !== 'OK').map((c) => `${c.result} ${c.name}${c.detail ? `: ${c.detail}` : ''}`).join('; ');
}

// ---------------------------------------------------------------------------
// plan

function gatherBranch(cwd) {
  const branch = git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']).out;
  const base = defaultBranch(cwd);
  const baseRef = `origin/${base}`;
  // Every read that feeds the lane is checked (review finding 2): a missing base ref, a failed log
  // or diff, or commits with an empty diff (a shallow clone with no merge base) is `diffError`,
  // which decideLane turns into tap. It is never an empty, self-lane change.
  let diffError = null;
  if (git(cwd, ['rev-parse', '--verify', '--quiet', `${baseRef}^{commit}`], { allowFail: true }).status !== 0) {
    diffError = `${baseRef} is not in this clone`;
  }
  const lg = git(cwd, ['log', '--format=%H%x00%s%x00%B%x01', `${baseRef}..HEAD`], { allowFail: true });
  if (!diffError && lg.status !== 0) diffError = `git log ${baseRef}..HEAD failed: ${lg.err}`;
  const commits = lg.out.split('\x01').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [sha, subject, body] = s.split('\x00');
    return { sha, subject, body };
  });
  const d = diffNames(cwd, [`${baseRef}...HEAD`]);
  if (!diffError && !d.ok) diffError = `git diff ${baseRef}...HEAD failed: ${d.err}`;
  const files = d.files;
  const entries = d.entries;
  if (!diffError && commits.length && !files.length) diffError = `${commits.length} commit(s) but an empty diff against ${baseRef} (no merge base?)`;
  const mt = git(cwd, ['merge-tree', '--write-tree', '--name-only', baseRef, 'HEAD'], { allowFail: true });
  // Output: the tree, the conflicted paths, a blank line, then git's informational messages
  // ("Auto-merging x", "CONFLICT (content): ..."), which are not paths.
  const conflicts = mt.status === 1 ? mt.out.split('\n\n')[0].split('\n').slice(1).filter(Boolean) : [];
  return { branch, base, commits, files, entries, conflicts, diffError };
}

/** owner/name from the origin URL (https, ssh, or a proxy path ending in /owner/name). */
function repoSlug(cwd) {
  const u = git(cwd, ['remote', 'get-url', 'origin'], { allowFail: true }).out;
  const m = /[/:]([^/:]+)\/([^/]+?)(?:\.git)?\/?$/.exec(u || '');
  return m ? `${m[1]}/${m[2]}` : null;
}

const shq = (s) => `"${String(s).replace(/(["\\$`])/g, '\\$1')}"`;

/**
 * Pure: the founder-desk command for a decide-lane PR (ai-personal infrastructure/scripts/
 * founder-desk.js; the kit never calls the desk itself). Every field the desk requires is filled.
 */
function deskCommand({ repo, subject, rec, prUrl }) {
  return [
    'node infrastructure/scripts/founder-desk.js ask --kind decide',
    `--repo ${shq(repo || 'REPO')}`,
    `--subject ${shq(subject)}`,
    `--rec ${shq(rec || 'FILL IN: your recommendation, one line, before running this')}`,
    `--source ${shq(prUrl || 'FILL IN: the PR link')}`,
    '--impact medium --risk medium --minutes 2 --where phone',
  ].join(' ');
}

function buildPlan(cwd, opts = {}) {
  const root = git(cwd, ['rev-parse', '--show-toplevel']).out;
  const b = gatherBranch(cwd);
  const baseRef = `origin/${b.base}`;
  const policy = loadPolicy(root, baseRef);
  const slug0 = repoSlug(cwd);
  const classifiers = b.commits.length
    ? runClassifiers(root, baseRef, b.files, { declared: policy.classifier, repoName: slug0 ? slug0.split('/')[1] : null })
    : [];
  const ctx = loadBaseContext(root, baseRef, policy);
  // Only tests-list files are read for weakening; the diff is the same three-dot range the lane read.
  const testFiles = b.files.filter((f) => matchesAny(f, (policy.self && policy.self.tests) || []));
  let weakened = [];
  if (testFiles.length && !b.diffError) {
    const td = spawnSync('git', ['diff', '-U0', '--no-renames', '--no-color', `${baseRef}...HEAD`, '--', ...testFiles], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    weakened = td.status === 0 ? testWeakening(td.stdout) : testFiles.map((f) => ({ file: f, why: 'its diff could not be read to check for weakened tests' }));
  }
  const d = decideLane(policy, b.files, b.commits, {
    classifiers, labels: opts.labels || [], diffError: b.diffError, entries: b.entries,
    sensitive: ctx.sensitive, gateTokens: ctx.gateTokens, contextErrors: ctx.errors, weakened,
  });
  const title = b.commits.length === 1 ? b.commits[0].subject : (b.commits[b.commits.length - 1] || {}).subject || b.branch;
  // Nothing to land means nothing to check — don't pay for the checks.
  const h = b.commits.length
    ? computeHealth(cwd, root, policy, b.files)
    : { head_sha: git(cwd, ['rev-parse', 'HEAD']).out, health: 'BLIND', checks: [] };
  const slug = repoSlug(cwd);
  const prUrl = opts.prUrl || (opts.prNumber && slug ? `https://github.com/${slug}/pull/${opts.prNumber}` : null);
  const decision = d.asked.length ? d.asked.join(' / ') : 'the decision this PR is held for (label held:founder-decision)';
  const desk = d.lane === 'decide'
    ? deskCommand({ repo: slug ? slug.split('/')[1] : null, subject: decision, rec: opts.rec || d.recommend, prUrl })
    : null;
  const lines = [];
  if (d.lane === 'decide') {
    lines.push(`🟣 **A decision for you, asked on the founder desk** — ${decision}. This PR is a draft and waits for your answer there; it is not a merge request.`);
  } else if (d.lane === 'self' && d.lowRisk) {
    lines.push('🟢 **Lands itself (low-risk)** — every file is on this repo\'s records, docs, tests or tooling lists; `cwos-pr land` merges it once GitHub says every check passed.');
  } else if (d.lane === 'self') {
    lines.push('🟢 **Lands itself** — nothing here needs your judgment; the session merges it once its checks pass.');
  } else {
    const why = d.reasons.length ? d.reasons.map((r) => r.reason) : ['this repo\'s default lane is tap'];
    if (h.health === 'OK') {
      lines.push(`🟡 **Needs your tap** — ${why.join('; ')}.`);
    } else {
      // MIS-015: never ask for a tap on something nobody has shown works.
      lines.push(`⚪ Not ready — WRITTEN · health ${h.health} — ${notOkSummary(h.checks)} — ME`);
      lines.push('', `This is a draft, not a request. Once its health is OK it will need your tap because ${why.join('; ')}; until then the session fixes what is ${h.health} and re-runs \`cwos-pr open\`, which takes it out of draft.`);
    }
  }
  if (b.conflicts.length) lines.push('', `⚠️ Conflicts with \`${b.base}\` in: ${b.conflicts.join(', ')} — the session must merge \`${b.base}\` in first.`);
  lines.push('', `**What changed** (${b.commits.length} commit${b.commits.length === 1 ? '' : 's'}, ${b.files.length} file${b.files.length === 1 ? '' : 's'}):`);
  for (const c of b.commits.slice(0, 20)) lines.push(`- ${c.subject}`);
  if (b.commits.length > 20) lines.push(`- … and ${b.commits.length - 20} more`);
  if (h.checks.length) {
    lines.push('', `**Health ${h.health}** at \`${String(h.head_sha).slice(0, 7)}\`:`);
    for (const c of h.checks) lines.push(`- ${c.result} — \`${c.name}\`${c.detail ? ` — ${c.detail}` : ''}`);
  }
  for (const r of d.reasons) lines.push('', `<sub>Tap because ${r.reason}${r.files.length ? `: ${r.files.slice(0, 8).join(', ')}${r.files.length > 8 ? ' …' : ''}` : ''}</sub>`);
  for (const c of classifiers.filter((x) => x.lane === 'self')) lines.push('', `<sub>Checked: ${c.why}.</sub>`);
  lines.push('', `<!-- cwos-pr lane=${d.lane} health=${h.health} head=${h.head_sha} policy="${policy.source}" -->`);
  return { ...b, root, baseRef, lane: d.lane, lowRisk: d.lowRisk, reasons: d.reasons, asked: d.asked, labelled: d.labelled, classifiers, policy, title, head_sha: h.head_sha, health: h.health, checks: h.checks, desk, recommend: d.recommend, body: lines.join('\n') };
}

const laneWhy = (p) => [...p.asked, ...p.reasons.map((r) => r.reason)].join('; ') || (p.labelled ? `labelled ${DECIDE_LABEL}` : p.policy.default_lane === 'tap' ? 'this repo\'s default lane is tap' : '');

function runPlan(values) {
  const cwd = values.repo || process.cwd();
  if (values.pr !== undefined && !/^\d+$/.test(String(values.pr))) {
    process.stderr.write(`cwos-pr: --pr must be a pull request number (got "${values.pr}")\n`);
    return 2;
  }
  const p = buildPlan(cwd, { prNumber: values.pr, rec: values.rec });
  if (values.out) writeFileAtomic(values.out, p.body + '\n');
  const recorded = values.pr !== undefined && p.commits.length ? recordPrHealth(p.root, values.pr, p) : null;
  if (values.json) {
    process.stdout.write(JSON.stringify({
      branch: p.branch, base: p.base, lane: p.lane, health: p.health, head_sha: p.head_sha, checks: p.checks,
      commits: p.commits.length, files: p.files.length, conflicts: p.conflicts, reasons: p.reasons, asked: p.asked, title: p.title, recorded,
      classifiers: p.classifiers, policy: p.policy.source, desk: p.desk, low_risk: p.lowRisk, self_errors: p.policy.self_errors || [],
    }, null, 2) + '\n');
    return 0;
  }
  if (!p.commits.length) { process.stdout.write(`${p.branch}: nothing to land — no commits beyond origin/${p.base}.\n`); return 0; }
  process.stdout.write(`branch ${p.branch} -> ${p.base}   lane: ${p.lane.toUpperCase()}   health: ${p.health}   (${p.policy.source})\n`);
  process.stdout.write(`title: ${p.title}\n\n${p.body}\n\n`);
  if (p.lane === 'decide') {
    process.stdout.write('Next: open the PR as a DRAFT (gh: cwos-pr open does it; cloud: create_pull_request with draft: true). It never lands until he answers.\n'
      + `Then, from an ai-personal checkout, put the question on his desk (the kit does not call the desk${p.desk.includes('FILL IN') ? '; replace every FILL IN first: re-run plan with --pr <n> and --rec "<text>" to fill them' : ''}):\n  ${p.desk}\n`);
  } else if (p.lane === 'self') {
    // Review H4: only `land` merges, because only land reads GitHub's checks and pins the head. A
    // cloud session (no gh) opens the PR and leaves it; it never merges with the MCP merge tool.
    process.stdout.write('Next: open the PR (gh: cwos-pr open; cloud: mcp__github__create_pull_request with this body). Only `node kit/scripts/cwos-pr.js land` on a node merges it, once GitHub says every check passed; a cloud session never merges it itself.\n');
  } else if (p.health === 'OK') {
    process.stdout.write('Next: open the PR and STOP — it waits for Chris to tap merge. Tell him the decision in one line.\n');
  } else {
    process.stdout.write(`Next: open the PR as a DRAFT (gh: cwos-pr open does it; cloud: create_pull_request with draft: true) — it is NOT ready for Chris. Fix what is ${p.health}, then re-run open. Report it as "PR #N — WRITTEN · health ${p.health} — ME", never as ready.\n`);
  }
  if (recorded) process.stdout.write(`recorded health for PR #${values.pr} in ${recorded}\n`);
  return 0;
}

// ---------------------------------------------------------------------------
// open / land (gh — nodes only)

function gh(cwd, args) {
  // CWOS_PR_GH names a node script standing in for gh — the tests' fake, so
  // every gh-dependent path runs without network. Nothing else should set it.
  const fake = process.env.CWOS_PR_GH;
  const r = fake
    ? spawnSync(process.execPath, [fake, ...args], { cwd, encoding: 'utf8' })
    : spawnSync('gh', args, { cwd, encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || r.error?.message || '').trim() };
}

function existingPr(cwd, branch) {
  const r = gh(cwd, ['pr', 'list', '--head', branch, '--state', 'open', '--json', 'number,url,isDraft,labels', '--limit', '1']);
  if (r.status !== 0) throw new Error(`gh unavailable or not authenticated: ${r.err} (a cloud session opens the PR with the GitHub MCP tools instead)`);
  const arr = JSON.parse(r.out || '[]');
  return arr[0] || null;
}

const labelNames = (pr) => ((pr && pr.labels) || []).map((l) => (typeof l === 'string' ? l : l && l.name)).filter(Boolean);
const laneMarker = (body) => ((/<!-- cwos-pr lane=(\w+)/.exec(String(body || '')) || [])[1] || null);

/**
 * Pure (C, one session PR per repo per day): the open PR this branch's work should join instead of
 * opening another, or null. A sibling is a PR from the same session branch family (`nudge_branches`,
 * claude/* by default) opened the same UTC day, in the SAME lane (read from the marker cwos-pr
 * writes into every body; mixing lanes would drag self work into his queue), not from a fork, and
 * not in his queue (founder-approved, waiting:founder, held:founder-decision: a push there would drop
 * his approval). Decide-lane PRs are never batched: one question per PR.
 */
function pickSessionSibling(prs, { branch, lane, globs, now }) {
  if (lane === 'decide') return null;
  const today = new Date(now).toISOString().slice(0, 10);
  return (prs || []).find((p) => p && p.headRefName !== branch
    && matchesAny(String(p.headRefName || ''), globs)
    && String(p.createdAt || '').slice(0, 10) === today
    && !p.isCrossRepository
    && !labelNames(p).some((l) => QUEUE_LABELS.includes(l))
    && laneMarker(p.body) === lane) || null;
}

function siblingRefusal(p, sib) {
  const b = sib.headRefName;
  return [
    `cwos-pr: REFUSED — today's session PR in the ${p.lane.toUpperCase()} lane is already open: ${sib.url} (branch ${b}, opened ${sib.createdAt}).`,
    'One session PR per repo per day (docs/designs/pr-flow-end-to-end.md §3), so a day of small changes is one tap, not N.',
    'This script does not push onto that branch for you: another session may still be live on it, and a push there would race it.',
    'If that session has finished, add this work to its PR:',
    `  git fetch origin ${b} && git switch -c ${b} origin/${b}`,
    `  git cherry-pick origin/${p.base}..${p.branch}`,
    `  git push origin HEAD:refs/heads/${b}     # then re-run: node kit/scripts/cwos-pr.js open (on ${b})`,
    'If it is still live, or this work must land on its own, open a separate PR on purpose:',
    '  node kit/scripts/cwos-pr.js open --new-pr',
    '',
  ].join('\n');
}

function runOpen(values) {
  const cwd = values.repo || process.cwd();
  const dry = Boolean(values['dry-run']);
  const branch = git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']).out;
  let pr = null;
  let ghErr = null;
  try { pr = existingPr(cwd, branch); } catch (e) { ghErr = e; }
  if (ghErr && !dry) { process.stderr.write(`cwos-pr: ${ghErr.message}\n`); return 1; }
  const p = buildPlan(cwd, { labels: labelNames(pr), prUrl: pr && pr.url, rec: values.rec });
  if (p.branch === p.base) { process.stderr.write(`cwos-pr: on ${p.base} itself; nothing to open.\n`); return 1; }
  if (!p.commits.length) { process.stdout.write('nothing to open — no commits beyond the base.\n'); return 0; }
  if (values.out) writeFileAtomic(values.out, p.body + '\n');
  // A decision is never a merge request: always a draft. A TAP PR is a draft until its health is
  // OK; a self-lane PR is gated by `land` running the same checks.
  const wantDraft = p.lane === 'decide' || (p.lane === 'tap' && p.health !== 'OK');
  // C. Only when this branch has no PR yet: an existing PR is always updated in place.
  if (!pr && !ghErr && !values['new-pr']) {
    const l = gh(cwd, ['pr', 'list', '--state', 'open', '--json', 'number,url,headRefName,createdAt,isDraft,labels,body,isCrossRepository', '--limit', '100']);
    if (l.status !== 0) {
      process.stdout.write(`  (could not list today's open PRs (${l.err}), so the one-PR-per-day check did not run)\n`);
    } else {
      let list = [];
      try { list = JSON.parse(l.out || '[]'); } catch { list = []; }
      const sib = pickSessionSibling(list, { branch: p.branch, lane: p.lane, globs: p.policy.nudge_branches, now: Date.now() });
      if (sib) { process.stderr.write(siblingRefusal(p, sib)); return 1; }
    }
  }
  const bodyFile = path.join(require('os').tmpdir(), `cwos-pr-${process.pid}.md`);
  writeFileAtomic(bodyFile, p.body + '\n');
  try {
    if (dry) {
      process.stdout.write(`would push ${p.branch} and open/update its PR (lane ${p.lane}, health ${p.health}${wantDraft ? ', as a DRAFT' : ''})\n`);
      if (p.desk) process.stdout.write(`then the desk question:\n  ${p.desk}\n`);
      return 0;
    }
    git(cwd, ['push', '--quiet', '-u', 'origin', `HEAD:refs/heads/${p.branch}`]);
    const r = pr
      ? gh(cwd, ['pr', 'edit', String(pr.number), '--body-file', bodyFile])
      : gh(cwd, ['pr', 'create', '--base', p.base, '--head', p.branch, '--title', p.title, '--body-file', bodyFile, ...(wantDraft ? ['--draft'] : [])]);
    if (r.status !== 0) { process.stderr.write(`cwos-pr: gh failed: ${r.err}\n`); return 1; }
    const url = pr ? pr.url : r.out;
    const number = pr ? pr.number : (String(r.out).match(/\/pull\/(\d+)/) || [])[1];
    // Re-running open re-evaluates: a draft whose health reached OK becomes
    // ready, and a ready PR that went RED/BLIND (or became a decision) goes back to draft.
    let flipped = '';
    if (pr && !!pr.isDraft !== wantDraft) {
      const f = gh(cwd, wantDraft ? ['pr', 'ready', String(pr.number), '--undo'] : ['pr', 'ready', String(pr.number)]);
      if (f.status !== 0) { process.stderr.write(`cwos-pr: could not ${wantDraft ? 'convert the PR to a draft' : 'mark the PR ready'}: ${f.err}\n`); return 1; }
      flipped = wantDraft ? ' — moved back to DRAFT' : ' — marked ready (out of draft)';
    }
    const recorded = number ? recordPrHealth(p.root, number, p) : null;
    const tail = p.lane === 'decide' ? '  DRAFT — a decision, not a merge request' : wantDraft ? '  DRAFT — not ready for Chris' : '';
    process.stdout.write(`${pr ? 'updated' : 'opened'} ${url}  lane ${p.lane.toUpperCase()}  health ${p.health}${tail}${flipped}\n`);
    if (!recorded) process.stdout.write('  (health not recorded: no PR number or no workstream dir — the reply judge will read this PR as BLIND)\n');
    if (p.lane === 'decide') {
      const slug = repoSlug(cwd);
      const desk = deskCommand({ repo: slug ? slug.split('/')[1] : null, subject: p.asked.join(' / ') || `the decision PR ${url} is held for`, rec: values.rec || p.recommend, prUrl: url });
      process.stdout.write(`\nNow put the question on his desk, from an ai-personal checkout (the kit never calls the desk)${desk.includes('FILL IN') ? '. Replace FILL IN first, or re-run with --rec "<text>"' : ''}:\n  ${desk}\n`);
    }
    return 0;
  } finally { try { fs.unlinkSync(bodyFile); } catch { /* gone */ } }
}

// Repos whose own gate merges (design pr-flow-end-to-end §3: "this design never calls merge where a
// gate owns that"; review H10). Present on the base, land refuses there.
const OWN_GATE_FILES = ['.github/workflows/pr-gate.yml', 'system/gates/land.js'];
// The lane code land itself runs: it must be the base's, or the PR is judging itself (review H3).
const LANE_CODE = ['kit/scripts/cwos-pr.js', 'kit/scripts/lib'];
const PASSED = new Set(['SUCCESS', 'NEUTRAL', 'SKIPPED']);

/**
 * Pure (review H4, H6): GitHub's view of the PR -> { ok, why }. Requires the PR open, not a draft,
 * on the default branch, at exactly the judged head, CLEAN, with at least one check that passed and
 * none that failed or is still running. "Every required check is green" is read here, from GitHub,
 * never from this machine's tree.
 */
function judgeGithub(view, { head, base }) {
  if (!view || typeof view !== 'object') return { ok: false, why: 'GitHub\'s view of the PR could not be read' };
  if (view.state && view.state !== 'OPEN') return { ok: false, why: `the PR is ${String(view.state).toLowerCase()}` };
  if (view.isDraft) return { ok: false, why: 'the PR is a draft' };
  if (view.baseRefName !== base) return { ok: false, why: `the PR targets ${view.baseRefName}, not ${base}; the lane judged it against ${base}` };
  if (view.headRefOid !== head) return { ok: false, why: `GitHub's head is ${String(view.headRefOid).slice(0, 7)} but this checkout judged ${String(head).slice(0, 7)}; fetch and re-run` };
  if (view.mergeStateStatus !== 'CLEAN') return { ok: false, why: `GitHub says ${view.mergeStateStatus || 'nothing'}, not CLEAN` };
  const checks = Array.isArray(view.statusCheckRollup) ? view.statusCheckRollup : [];
  const name = (c) => c.name || c.context || '?';
  const verdict = (c) => (c.__typename === 'StatusContext' || c.state !== undefined && c.conclusion === undefined
    ? (c.state === 'SUCCESS' ? 'pass' : ['PENDING', 'EXPECTED'].includes(c.state) ? 'pending' : 'fail')
    : (c.status !== 'COMPLETED' ? 'pending' : PASSED.has(c.conclusion) ? (c.conclusion === 'SUCCESS' ? 'pass' : 'neutral') : 'fail'));
  const failed = checks.filter((c) => verdict(c) === 'fail').map(name);
  const pending = checks.filter((c) => verdict(c) === 'pending').map(name);
  if (failed.length) return { ok: false, why: `check(s) not passed: ${failed.join(', ')}` };
  if (pending.length) return { ok: false, why: `check(s) still running: ${pending.join(', ')}` };
  if (!checks.some((c) => verdict(c) === 'pass')) return { ok: false, why: 'no check has passed on this head, so nothing verified it' };
  return { ok: true, why: `${checks.length} check(s), none failed or pending` };
}

function runLand(values) {
  const cwd = values.repo || process.cwd();
  const refuse = (why) => { process.stderr.write(`cwos-pr: REFUSED — ${why}\n`); return 1; };
  const root = git(cwd, ['rev-parse', '--show-toplevel']).out;
  const base = defaultBranch(cwd);
  const baseRef = `origin/${base}`;
  // Judge against the base as it is now, not the last fetch (review H6c).
  const f = git(cwd, ['fetch', '--quiet', 'origin', base], { allowFail: true });
  if (f.status !== 0) return refuse(`could not fetch origin/${base} (${f.err}), so the lane policy on the base is not known`);
  for (const gf of OWN_GATE_FILES) {
    if (git(root, ['cat-file', '-e', `${baseRef}:${gf}`], { allowFail: true }).status === 0) return refuse(`this repo's own gate merges its PRs (${gf} on ${baseRef}); cwos-pr never merges around it`);
  }
  // The script judging the PR must be the base's own copy, byte for byte, working tree included.
  const lc = git(root, ['diff', '--quiet', baseRef, '--', ...LANE_CODE], { allowFail: true });
  if (lc.status !== 0) return refuse(`this checkout's lane code (${LANE_CODE.join(', ')}) differs from ${baseRef}; a PR may not judge itself. Merge ${baseRef} in, or run land from a checkout of ${base}'s code`);
  const p = buildPlan(cwd);
  if (p.policy.merge_owner === 'repo-gate') return refuse(`.claude/landing.yaml on ${baseRef} says this repo's own gate merges (merge_owner: repo-gate)`);
  if (p.lane !== 'self') {
    process.stderr.write(`cwos-pr: REFUSED — lane is ${p.lane.toUpperCase()} (${laneWhy(p)}). It waits for Chris${p.lane === 'decide' ? "'s answer on the desk" : "'s tap"}.\n`);
    return 1;
  }
  if (p.conflicts.length) return refuse(`conflicts with ${p.base} in ${p.conflicts.join(', ')}. Merge origin/${p.base} into the branch first; never rebase a pushed branch.`);
  if (git(cwd, ['status', '--porcelain', '--untracked-files=no'], { allowFail: true }).out) return refuse('the working tree has uncommitted changes, so the checks below would not test the head');
  for (const cmd of p.policy.checks) {
    const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', timeout: CHECK_TIMEOUT_MS });
    if (r.status !== 0) { process.stderr.write(`cwos-pr: REFUSED — check ${r.status === null ? 'did not finish' : 'failed'}: ${cmd}\n${(r.stdout || '').slice(-800)}${(r.stderr || '').slice(-400)}\n`); return 1; }
    process.stdout.write(`check passed: ${cmd}\n`);
  }
  const pr = existingPr(cwd, p.branch);
  if (!pr) return refuse('no open PR for this branch — run `cwos-pr open` first.');
  const queued = labelNames(pr).filter((l) => QUEUE_LABELS.includes(l));
  if (queued.length) return refuse(`${pr.url} carries ${queued.join(', ')}: it is in the founder's queue, and his gate merges it, not a session.`);
  const v = gh(cwd, ['pr', 'view', String(pr.number), '--json', 'state,isDraft,baseRefName,headRefOid,mergeStateStatus,statusCheckRollup']);
  let view = null;
  try { view = v.status === 0 ? JSON.parse(v.out) : null; } catch { view = null; }
  const jg = judgeGithub(view, { head: p.head_sha, base: p.base });
  if (!jg.ok) return refuse(`${pr.url}: ${jg.why}${view ? '' : ` (${v.err})`}`);
  if (values['dry-run']) { process.stdout.write(`would merge ${pr.url} at ${p.head_sha.slice(0, 7)} (${jg.why})\n`); return 0; }
  const r = gh(cwd, ['pr', 'merge', String(pr.number), '--merge', '--match-head-commit', p.head_sha]);
  if (r.status !== 0) { process.stderr.write(`cwos-pr: merge failed: ${r.err}\n`); return 1; }
  // The record of who merged what under which rule (review L20): gh runs as Chris, so without
  // this a session's merge reads as his.
  const policySha = git(root, ['rev-parse', `${baseRef}:.claude/landing.yaml`], { allowFail: true }).out || 'none';
  const note = path.join(require('os').tmpdir(), `cwos-pr-land-${process.pid}.md`);
  writeFileAtomic(note, [`Landed by a session with \`cwos-pr land\`, not by Chris: lane SELF${p.lowRisk ? ' (low-risk)' : ''}, head \`${p.head_sha}\`, base policy blob \`${policySha}\` on \`${baseRef}\`, GitHub: ${jg.why}.`, '', `Files (${p.files.length}): ${p.files.slice(0, 40).join(', ')}${p.files.length > 40 ? ' …' : ''}`, ''].join('\n'));
  const c = gh(cwd, ['pr', 'comment', String(pr.number), '--body-file', note]);
  try { fs.unlinkSync(note); } catch { /* gone */ }
  process.stdout.write(`merged ${pr.url}${c.status === 0 ? '' : ` (the landing comment was not posted: ${c.err})`}\n`);
  return 0;
}

// ---------------------------------------------------------------------------
// prepush (A. the direct lane) — kit/scripts/git-hooks/pre-push-direct-lane.sh runs this with
// git's pre-push stdin (`<local ref> <local sha> <remote ref> <remote sha>` per line) and the
// remote name. Exit 0 clean, 1 refused, 2 could not run (the dispatcher keeps the three apart).

const ZERO = /^0+$/;
/**
 * Which configured remote is this push going to? git passes the remote NAME as $1 when one was
 * used, or the URL itself (`git push https://… master`), with the URL as $2. A push to a URL that
 * matches a configured remote is that remote (review finding 3).
 */
function resolveRemote(root, arg1, arg2) {
  const names = git(root, ['remote'], { allowFail: true }).out.split('\n').map((s) => s.trim()).filter(Boolean);
  if (arg1 && names.includes(arg1)) return arg1;
  const norm = (u) => String(u || '').replace(/\.git\/?$/, '').replace(/\/+$/, '');
  for (const n of names) {
    const urls = git(root, ['remote', 'get-url', '--all', n], { allowFail: true }).out.split('\n').map(norm);
    if ([arg1, arg2].filter(Boolean).map(norm).some((u) => urls.includes(u))) return n;
  }
  return null;
}

/**
 * The remote's default branch: its tracking `<remote>/HEAD`, else what the remote itself says
 * (`git ls-remote --symref <remote> HEAD`). Never a guess between main and master (second review H2).
 */
function remoteDefault(root, remote, target) {
  if (remote) {
    const sym = git(root, ['symbolic-ref', '--quiet', `refs/remotes/${remote}/HEAD`], { allowFail: true });
    if (sym.status === 0 && sym.out) return sym.out.replace(`refs/remotes/${remote}/`, '');
  }
  const ls = git(root, ['ls-remote', '--symref', target || remote, 'HEAD'], { allowFail: true });
  const m = ls.status === 0 ? /^ref: refs\/heads\/(\S+)\s+HEAD$/m.exec(ls.out) : null;
  return m ? m[1] : null;
}

function runPrepush(positionals) {
  let input = '';
  try { input = fs.readFileSync(0, 'utf8'); } catch { input = ''; }
  let root;
  try { root = git(process.cwd(), ['rev-parse', '--show-toplevel']).out; }
  catch (e) { process.stderr.write(`BLOCKED — direct-lane check COULD NOT RUN: ${e.message}\n`); return 2; }
  const lines = input.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\s+/));
  if (!lines.length) return 0;
  const remote = resolveRemote(root, positionals[0], positionals[1]);
  const target = remote || positionals[1] || positionals[0];
  const localPolicy = fs.existsSync(path.join(root, '.claude', 'landing.yaml'))
    || git(root, ['cat-file', '-e', 'HEAD:.claude/landing.yaml'], { allowFail: true }).status === 0;
  const base = remoteDefault(root, remote, target);
  if (!base) {
    // Cannot tell which branch is the default. A repo that has the lane configured (its policy
    // file in the tree or at HEAD) refuses a push to main or master rather than waving it through.
    const risky = lines.filter((l) => /^refs\/heads\/(main|master)$/.test(l[2] || ''));
    if (localPolicy && risky.length) {
      process.stderr.write(`direct lane: REFUSED — cannot tell the default branch of ${positionals[0] || 'this remote'} (no ${remote || '?'}/HEAD here, and the remote did not say), and this repo has a .claude/landing.yaml. Fetch, then push again, or open a pull request.\n`);
      return 1;
    }
    process.stdout.write(`direct lane: ${positionals[0] || 'the remote'} has no known default branch here; nothing configured to check.\n`);
    return 0;
  }
  const toBase = lines.filter((f) => f[2] === `refs/heads/${base}`);
  if (!toBase.length) return 0;
  let refused = 0;
  for (const [, localSha, , remoteSha] of toBase) {
    if (!localSha || ZERO.test(localSha)) {
      process.stderr.write(`direct lane: REFUSED — this push deletes ${base}.\n`);
      refused++; continue;
    }
    // The policy is the one ON THE REMOTE, read at the sha git says the remote has (second review
    // H2). A local tracking ref can be deleted or stale; git's own remoteSha cannot.
    if (!remoteSha || ZERO.test(remoteSha)) {
      if (localPolicy) {
        process.stderr.write(`BLOCKED — direct-lane check COULD NOT RUN: ${base} does not exist on the remote yet, so its policy cannot be read, and this repo has a .claude/landing.yaml. Create ${base} through a pull request.\n`);
        return 2;
      }
      process.stdout.write(`direct lane: ${base} is new on the remote and nothing here configures the lane; nothing to check.\n`);
      continue;
    }
    if (git(root, ['cat-file', '-e', `${remoteSha}^{commit}`], { allowFail: true }).status !== 0) {
      git(root, ['fetch', '--quiet', '--no-tags', target, `refs/heads/${base}`], { allowFail: true });
    }
    if (git(root, ['cat-file', '-e', `${remoteSha}^{commit}`], { allowFail: true }).status !== 0) {
      process.stderr.write(`BLOCKED — direct-lane check COULD NOT RUN: the remote's ${base} (${remoteSha.slice(0, 7)}) is not in this clone and could not be fetched. Fetch, then push again.\n`);
      return 2;
    }
    const policy = loadPolicy(root, remoteSha);
    const d = diffNames(root, [remoteSha, localSha]);
    if (!d.ok) { process.stderr.write(`BLOCKED — direct-lane check COULD NOT RUN: git diff ${remoteSha} ${localSha}: ${d.err}\n`); return 2; }
    const headHasPolicy = git(root, ['cat-file', '-e', `${localSha}:.claude/landing.yaml`], { allowFail: true }).status === 0;
    const v = decideDirect(policy, d.files, { headHasPolicy, entries: d.entries });
    if (v.inert) { process.stdout.write(`direct lane: ${v.why}.\n`); continue; }
    if (v.ok) { process.stdout.write(`direct lane: ${v.why} — pushing to ${base}.\n`); continue; }
    refused++;
    process.stderr.write(`direct lane: REFUSED — a push to ${base} must be records only, and ${v.why}.\n`);
    for (const r of v.refused.slice(0, 25)) process.stderr.write(`  ${r.file} — ${r.why}\n`);
    if (v.refused.length > 25) process.stderr.write(`  … and ${v.refused.length - 25} more\n`);
    process.stderr.write(`Push to a branch and open a pull request instead: node kit/scripts/cwos-pr.js open (policy: .claude/landing.yaml at the remote's ${base} ${remoteSha.slice(0, 7)}).\n`);
  }
  return refused ? 1 : 0;

}


// ---------------------------------------------------------------------------
// check-turn (Stop hook)

const PR_EVIDENCE = /mcp__github__(create_pull_request|merge_pull_request|update_pull_request)|\bgh pr (create|merge|edit)\b|cwos-pr(\.js)? (open|land)\b/;

/** Pure: did this session open or merge a PR? Looks at tool_use entries only. */
function sessionOpenedPr(entries) {
  for (const e of entries) {
    const c = e && e.message && e.message.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (!b || b.type !== 'tool_use') continue;
      if (PR_EVIDENCE.test(String(b.name || '')) || PR_EVIDENCE.test(JSON.stringify(b.input || {}))) return true;
    }
  }
  return false;
}

function runCheckTurn() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return 0; }
  const cwd = input.cwd || process.cwd();
  try {
    if (git(cwd, ['rev-parse', '--is-inside-work-tree'], { allowFail: true }).out !== 'true') return 0;
    const root = git(cwd, ['rev-parse', '--show-toplevel']).out;
    const policy = loadPolicy(root);
    const branch = git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']).out;
    if (!matchesAny(branch, policy.nudge_branches)) return 0;
    const base = defaultBranch(cwd);
    const ahead = Number(git(cwd, ['rev-list', '--count', `origin/${base}..HEAD`], { allowFail: true }).out || 0);
    if (!ahead) return 0;
    let entries = [];
    if (input.transcript_path && fs.existsSync(input.transcript_path)) {
      entries = fs.readFileSync(input.transcript_path, 'utf8').split('\n').filter(Boolean)
        .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    }
    if (sessionOpenedPr(entries)) return 0;
    if (input.stop_hook_active) return 0;
    process.stderr.write(
      `Branch ${branch} has ${ahead} commit(s) that are not on ${base}, and no pull request was opened this session — Chris cannot see this work in his pull-request list.\n`
      + `Run \`node kit/scripts/cwos-pr.js plan --out pr-body.md\`, then open the PR with that title and body (GitHub MCP: mcp__github__create_pull_request, or \`node kit/scripts/cwos-pr.js open\` where gh works).\n`
      + 'If the plan says SELF, merge it once its checks pass; if TAP, leave it and tell Chris in one line; if DECIDE, open it as a draft and file the desk question plan prints.\n',
    );
    return 2;
  } catch {
    return 0; // the nudge must never break a session
  }
}

// ---------------------------------------------------------------------------
// --self-test: the pure decisions, no git, no network

function selfTest() {
  // The cases below were written when an unset default_lane meant self; they test the floor and the
  // other lanes, so they keep that policy explicitly. The low-risk cases use `tapPol`.
  const pol = (y) => ({ ...policyFromYaml({ default_lane: 'self', ...y }, 'test'), present: true });
  const tapPol = (self, y = {}) => ({ ...policyFromYaml({ default_lane: 'tap', self, ...y }, 'test'), present: true });
  const LR = { records: ['.claude/workstream/**'], docs: ['docs/**'], tests: ['tests/**', '**/__tests__/**'], tooling: ['scripts/**'] };
  const lr = (files, extra = {}) => decideLane(tapPol(LR), files, [], extra);
  const on = pol({ direct_enabled: true, direct: { paths: ['docs/**', '.claude/workstream/**', 'system/**'] } });
  const now = Date.parse('2026-10-31T15:00:00Z');
  const sib = (o) => ({ headRefName: 'claude/other-x1', createdAt: '2026-10-31T09:00:00Z', labels: [], body: '<!-- cwos-pr lane=tap health=OK -->', url: 'u', ...o });
  const pick = (prs, lane = 'tap') => pickSessionSibling(prs, { branch: 'claude/me-y2', lane, globs: ['claude/*'], now });
  const cls = (status, stdout) => judgeClassifyChange({ status, stdout });
  const cases = [
    // B. floor
    ['floor: a payments file is tap even when landing.yaml lists no tap rules', decideLane(pol({ tap: [] }), ['app/payments/refund.js'], []).lane === 'tap'],
    ['floor: landing.yaml itself is tap', decideLane(pol({ tap: [] }), ['.claude/landing.yaml'], []).lane === 'tap'],
    ['floor: workflows, settings, secrets, kit release, regulated templates, gates', ['.github/workflows/ci.yml', '.claude/settings.json', 'config/.env.prod', 'kit/VERSION', 'kit/hashes-3.48.0.yaml',
      'backend/templates/emails/welcome.html', 'infrastructure/scripts/swimmer-data-gate.js', 'infrastructure/swimmer-data-allowlist.json', '.github/scripts/cwos-founder-approval.js']
      .every((f) => decideLane(pol({ tap: [] }), [f], []).lane === 'tap')],
    ['floor: a docs change stays self', decideLane(pol({ tap: [] }), ['docs/a.md'], []).lane === 'self'],
    ['floor: the hygiene disposition ledger is a record, not money', decideLane(pol({ tap: [] }), ['.claude/hygiene/ledger.jsonl'], []).lane === 'self' && floorRule('.claude/hygiene/ledger.jsonl') === null],
    ['floor: any other *ledger* file is still money', ['app/ledger/post.js', 'src/ledger.js', '.claude/hygiene/ledger-export.js', 'other/.claude/hygiene/ledger.jsonl']
      .every((f) => decideLane(pol({ tap: [] }), [f], []).lane === 'tap')],
    ['floor: `**/auth.*` does not catch oauth', !matchesAny('src/oauth.js', ['**/auth.*']) && matchesAny('src/auth.js', ['**/auth.*']) && matchesAny('auth.js', ['**/auth.*'])],
    ['classifier tap raises a self lane', decideLane(pol({}), ['docs/a.md'], [], { classifiers: [{ name: 'c', lane: 'tap', why: 'x' }] }).lane === 'tap'],
    ['classifier self never lowers a floor tap', decideLane(pol({}), ['kit/VERSION'], [], { classifiers: [{ name: 'c', lane: 'self', why: 'x' }] }).lane === 'tap'],
    ['classify-change: T0/R0 is self', cls(0, 'Decision tier: T0\nRigor: R0 (docs only)\n').lane === 'self'],
    ['classify-change: T1 is tap', cls(0, 'Decision tier: T1\nRigor: R1\n').lane === 'tap'],
    ['classify-change: R2 is tap', cls(0, 'Decision tier: T0\nRigor: R2\n').lane === 'tap'],
    ['classify-change: exit 1 / exit 2 are tap', cls(1, '').lane === 'tap' && cls(2, '').lane === 'tap'],
    ['classify-change: unreadable output fails closed', cls(0, 'garbage').lane === 'tap' && cls(0, 'garbage').error === true],
    ['classify-change: a crash fails closed', judgeClassifyChange({ status: null, error: 'ENOENT' }).lane === 'tap'],
    ['pr-risk: T3 is tap, T2 is self, junk fails closed', judgePrRisk({ status: 0, stdout: '{"tier":3}' }).lane === 'tap' && judgePrRisk({ status: 0, stdout: '{"tier":2}' }).lane === 'self' && judgePrRisk({ status: 0, stdout: 'x' }).lane === 'tap'],
    // D. decide
    ['Needs-Founder makes it decide', decideLane(pol({}), ['docs/a.md'], [{ body: 'x\n\nNeeds-Founder: pick a studio' }]).lane === 'decide'],
    ['label held:founder-decision makes it decide', decideLane(pol({}), ['docs/a.md'], [], { labels: [DECIDE_LABEL] }).lane === 'decide'],
    ['No-Auto-Land holds it in tap, not decide', decideLane(pol({}), ['docs/a.md'], [{ body: 'x\n\nNo-Auto-Land: counsel' }]).lane === 'tap'],
    ['Recommend: trailer is carried', decideLane(pol({}), [], [{ body: 'x\n\nNeeds-Founder: a\nRecommend: take it' }]).recommend === 'take it'],
    ['desk command carries subject, rec and link', /--subject "pick" --rec "take" --source "https:\/\/x\/pull\/1"/.test(deskCommand({ repo: 'r', subject: 'pick', rec: 'take', prUrl: 'https://x/pull/1' }))],
    ['desk command quotes shell-special text', deskCommand({ repo: 'r', subject: 'a "b" $c', rec: 'r', prUrl: 'u' }).includes('"a \\"b\\" \\$c"')],
    // A. direct
    ['direct: no landing.yaml on base is inert, not a refusal', decideDirect({ ...DEFAULT_POLICY, present: false, source: 's' }, ['src/a.js']).inert === true],
    ['direct: present but off refuses everything', decideDirect(pol({}), ['docs/a.md']).ok === false],
    ['direct: an unparseable landing.yaml refuses', decideDirect({ ...DEFAULT_POLICY, present: true, error: 'bad' }, ['docs/a.md']).ok === false],
    ['direct: records on the path list pass', decideDirect(on, ['docs/a.md', '.claude/workstream/queue/WS-1.yaml', 'system/state.md']).ok === true],
    ['direct: a code file is refused even under a listed path', decideDirect(on, ['docs/tool.js']).ok === false],
    ['direct: a path off the list is refused', decideDirect(on, ['README.md']).ok === false],
    ['direct: a floor path is refused even if listed', decideDirect(pol({ direct_enabled: true, direct: { paths: ['**'] } }), ['.claude/landing.yaml']).ok === false],
    ['direct: a repo tap path is refused', decideDirect(pol({ direct_enabled: true, direct: { paths: ['**'] }, tap: [{ reason: 'r', paths: ['CLAUDE.md'] }] }), ['CLAUDE.md']).ok === false],
    ['direct: `direct_enabled: "true"` (a string) is not on', decideDirect(pol({ direct_enabled: 'true', direct: { paths: ['docs/**'] } }), ['docs/a.md']).ok === false],
    // C. one per day
    ['sibling: same family, same day, same lane is found', pick([sib({})]) !== null],
    ['sibling: yesterday is not', pick([sib({ createdAt: '2026-10-30T23:59:00Z' })]) === null],
    ['sibling: another lane is not', pick([sib({ body: '<!-- cwos-pr lane=self -->' })]) === null],
    ['sibling: in his queue is not', pick([sib({ labels: [{ name: 'waiting:founder' }] })]) === null && pick([sib({ labels: [{ name: 'founder-approved' }] })]) === null],
    ['sibling: a fork is not', pick([sib({ isCrossRepository: true })]) === null],
    ['sibling: outside the family is not', pick([sib({ headRefName: 'feature/x' })]) === null],
    ['sibling: own branch is not', pick([sib({ headRefName: 'claude/me-y2' })]) === null],
    // review 2026-10-31
    ['review 2: an unreadable diff is tap, never an empty self change', decideLane(pol({}), [], [{ body: 'x' }], { diffError: 'no base' }).lane === 'tap'],
    ['review 9: hooks, installer and kit libs are on the floor', ['kit/scripts/git-hooks/pre-commit-x.sh', 'kit/scripts/install-git-hooks.sh', 'kit/scripts/lib/cwos-utils.js', '.githooks/pre-push', '.husky/pre-push']
      .every((f) => decideLane(pol({}), [f], []).lane === 'tap')],
    ['review 9: the floor is case-insensitive', decideLane(pol({}), ['.GitHub/Workflows/ci.yml'], []).lane === 'tap' && decideLane(pol({}), ['Kit/VERSION'], []).lane === 'tap'],
    ['review 9: a case-variant floor path is refused by the direct lane', decideDirect(pol({ direct_enabled: true, direct: { paths: ['**'] } }), ['.Claude/Landing.yaml']).ok === false],
    ['review 3: a push bringing landing.yaml to a base without one is refused, not inert', decideDirect({ ...DEFAULT_POLICY, present: false, source: 's' }, ['docs/a.md'], { headHasPolicy: true }).ok === false],
    ['review 8: `classifier:` is read from landing.yaml', JSON.stringify(policyFromYaml({ classifier: 'scripts/classify-change.py' }, 't').classifier) === '["scripts/classify-change.py"]'],
    ['review 8: a name starting with "-" is not passed to classify-change.py', judgeClassifyChange(CLASSIFIERS[0].run('/nonexistent', { files: ['-rf'], root: '.' })).lane === 'tap'],
    // second review 2026-10-31
    ['review2 H1: --raw output parses into path and modes', (() => { const e = parseRaw(':000000 120000 0000 abcd A\0docs/lnk\0:100644 100755 a b M\0x.md\0'); return e.length === 2 && e[0].newMode === SYMLINK && e[0].path === 'docs/lnk' && e[1].newMode === EXEC; })()],
    ['review2 H1: a symlink or gitlink entry makes the lane tap', decideLane(pol({}), ['docs/lnk'], [], { entries: [{ path: 'docs/lnk', oldMode: '000000', newMode: SYMLINK }] }).lane === 'tap'
      && decideLane(pol({}), ['docs/sub'], [], { entries: [{ path: 'docs/sub', oldMode: '000000', newMode: GITLINK }] }).lane === 'tap'],
    ['review2 H1: the direct lane refuses a symlink under a listed path', decideDirect(on, ['docs/lnk'], { entries: [{ path: 'docs/lnk', oldMode: '000000', newMode: SYMLINK }] }).ok === false],
    ['review2 L4: the direct lane refuses a gained exec bit and a backslash', decideDirect(on, ['docs/a.md'], { entries: [{ path: 'docs/a.md', oldMode: '100644', newMode: EXEC }] }).ok === false && decideDirect(on, ['docs/a\\b.md']).ok === false],
    ['review2 L4: a PR lane does not refuse an exec bit (ordinary for scripts)', decideLane(pol({}), ['docs/a.md'], [], { entries: [{ path: 'docs/a.md', oldMode: '100644', newMode: EXEC }] }).lane === 'self'],
    ['sibling: decide lane is never batched', pick([sib({ body: '<!-- cwos-pr lane=decide -->' })], 'decide') === null],
    // low-risk self lane, 2026-11-01
    ['low-risk: no landing.yaml is tap (built-in default), not self', decideLane({ ...DEFAULT_POLICY }, ['docs/a.md'], []).lane === 'tap'],
    ['low-risk: a landing.yaml without default_lane is tap', decideLane({ ...policyFromYaml({ tap: [] }, 't') }, ['docs/a.md'], []).lane === 'tap'],
    ['low-risk: docs, records, tests and tooling on the lists are self', lr(['docs/a.md', '.claude/workstream/queue/WS-1.yaml', 'tests/a.test.js', 'scripts/report.js']).lane === 'self'
      && lr(['docs/a.md']).lowRisk === true],
    ['low-risk: one product file makes the whole PR tap', lr(['docs/a.md', 'src/app/invite.ts']).lane === 'tap'],
    ['low-risk: code under a docs path is tap', lr(['docs/tool.js']).lane === 'tap'],
    ['low-risk: a tests path file not named like a test is tap', decideLane(tapPol({ tests: ['src/**'] }), ['src/helpers.js'], []).lane === 'tap' && decideLane(tapPol({ tests: ['src/**'] }), ['src/a.test.js'], []).lane === 'self'],
    ['low-risk: rules, CLAUDE.md, agents, commands, skills, configs and snapshots are never low-risk', ['.claude/rules/x.md', 'docs/CLAUDE.md', '.claude/agents/a.md', 'kit/commands/next.md',
      'docs/skills/SKILL.md', 'tests/__snapshots__/a.snap', 'tests/vitest.config.js', '.codex/agents/x.toml', 'scripts/package.json'].every((f) => lr([f]).lane === 'tap')],
    ['low-risk: a deletion is tap', lr(['docs/a.md'], { entries: [{ path: 'docs/a.md', status: 'D', oldMode: '100644', newMode: '000000' }] }).lane === 'tap'],
    ['low-risk: the sensitive set is tap in every lane', lr(['docs/medical/x.md'], { sensitive: ['docs/medical/'] }).lane === 'tap'
      && decideLane(pol({}), ['legal/a.md'], [], { sensitive: ['legal/'] }).lane === 'tap' && decideLane(pol({}), ['financial_reality.md'], [], { sensitive: ['financial_reality.md'] }).lane === 'tap'],
    ['low-risk: gate code (named by a workflow, hook or check) is tap in every lane', lr(['scripts/check.js'], { gateTokens: gateTokens(['run: node scripts/check.js']) }).lane === 'tap'
      && decideLane(pol({}), ['kit/scripts/cwos-verify.js'], [], { gateTokens: gateTokens(['node kit/scripts/cwos-verify.js --only INV-002']) }).lane === 'tap'],
    ['low-risk: gate tokens strip $VAR/ and ./ prefixes', isGateReferenced('scripts/a.py', gateTokens(['python ${GITHUB_WORKSPACE}/scripts/a.py', './x/b.sh'])) && isGateReferenced('x/b.sh', gateTokens(['./x/b.sh']))],
    ['low-risk: a weakened test is tap', lr(['tests/a.test.js'], { weakened: testWeakening(['+++ b/tests/a.test.js', "+it.skip('x', () => {})", ''].join('\n')) }).lane === 'tap'],
    ['low-risk: testWeakening flags lost assertions, not grown ones', testWeakening(['+++ b/t.test.js', '-  expect(a).toBe(1)', '-  expect(b).toBe(2)', '+  expect(a).toBe(1)', ''].join('\n')).length === 1
      && testWeakening(['+++ b/t.test.js', '+  expect(a).toBe(1)', ''].join('\n')).length === 0],
    ['low-risk: a too-broad or any-depth list entry is refused, not honoured', (() => { const s = parseSelf({ docs: ['**'], tooling: ['**/scripts/**'], tests: ['**/test/**'], bogus: ['x'] }); return s.lists.docs.length === 0 && s.lists.tooling.length === 0 && s.lists.tests.length === 1 && s.errors.length === 3; })()],
    ['low-risk: an unparseable policy is tap with the reason', decideLane({ ...DEFAULT_POLICY, default_lane: 'self', error: 'bad' }, ['docs/a.md'], []).lane === 'tap'],
    ['low-risk: migrations and the fleet contract are on the floor', ['app/migrations/0042_x.py', 'db/schema.sql', 'fleet-contract.yaml', 'nodes/claude-init/morin.trust.json', '.codex/hooks.json']
      .every((f) => decideLane(pol({}), [f], []).lane === 'tap') && decideLane(pol({}), ['docs/migration-plan.md'], []).lane === 'self'],
    ['land: GitHub must say CLEAN, same head and base, >=1 check passed, none failed or pending', (() => {
      const okv = { state: 'OPEN', isDraft: false, baseRefName: 'main', headRefOid: 'abc', mergeStateStatus: 'CLEAN', statusCheckRollup: [{ __typename: 'CheckRun', name: 't', status: 'COMPLETED', conclusion: 'SUCCESS' }] };
      const j = (o) => judgeGithub({ ...okv, ...o }, { head: 'abc', base: 'main' }).ok;
      return j({}) && !j({ mergeStateStatus: 'UNSTABLE' }) && !j({ headRefOid: 'def' }) && !j({ baseRefName: 'side' }) && !j({ isDraft: true })
        && !j({ statusCheckRollup: [] }) && !j({ statusCheckRollup: [{ status: 'IN_PROGRESS', name: 'x' }] })
        && !j({ statusCheckRollup: [...okv.statusCheckRollup, { __typename: 'StatusContext', context: 'c', state: 'FAILURE' }] })
        && j({ statusCheckRollup: [...okv.statusCheckRollup, { __typename: 'CheckRun', name: 's', status: 'COMPLETED', conclusion: 'SKIPPED' }] });
    })()],
  ];
  let fail = 0;
  for (const [name, ok] of cases) { if (!ok) fail++; process.stdout.write(`${ok ? 'PASS' : 'FAIL'}  ${name}\n`); }
  process.stdout.write(`${cases.length - fail}/${cases.length} passed\n`);
  return fail ? 1 : 0;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--self-test') return selfTest();
  const { values, positionals, sub } = cliGate(argv, CLI);
  if (sub === 'plan') return runPlan(values);
  if (sub === 'open') return runOpen(values);
  if (sub === 'land') return runLand(values);
  if (sub === 'check-turn') return runCheckTurn();
  if (sub === 'prepush') {
    try { return runPrepush(positionals); }
    catch (e) { process.stderr.write(`BLOCKED — direct-lane check COULD NOT RUN: ${e.message}\n`); return 2; }
  }
  return 2;
}

if (require.main === module) {
  try { process.exitCode = main(); }
  catch (e) { process.stderr.write(`cwos-pr: ${e.message}\n`); process.exitCode = 1; }
}

module.exports = {
  globToRegex, matchesAny, decideLane, decideDirect, sessionOpenedPr, loadPolicy, policyFromYaml, DEFAULT_POLICY, FLOOR,
  NEVER_SELF, parseSelf, lowRiskVerdict, testWeakening, gateTokens, isGateReferenced, sensitiveFromContract, judgeGithub, loadBaseContext, manifestGateSources, GATE_NAME,
  buildPlan, aggregateHealth, RELEASE_PATHS, sweepCheck, pickSessionSibling, deskCommand, judgeClassifyChange, judgePrRisk, DECIDE_LABEL,
};
