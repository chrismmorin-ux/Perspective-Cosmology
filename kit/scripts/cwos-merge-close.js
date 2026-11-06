#!/usr/bin/env node
/**
 * cwos-merge-close — close queue items that merged work already finished.
 *
 * Work done outside the main tree (a cloud session, a worktree, an unattended
 * lane) lands as commits on the default branch, but the queue item it finished
 * stays `backlog` until someone remembers to run `cwos-item done`. Cloud
 * sessions are not allowed to write queue state (WS-576), so they cannot close
 * their own items, and the queue drifts behind the code: an item gets picked up
 * a second time for work that already shipped (WS-1093, 2026-10-11).
 *
 * The contract is a commit-message line, written by whoever did the work:
 *
 *     Closes WS-1096
 *     Closes: WS-1096, WS-1097
 *
 * This script reads the default branch's history for those lines and, for each
 * named item that is not already done, closes it with `cwos-item done --commit
 * <sha>` — the commit is the proof. Run it from the main tree (the broker does,
 * after a merge). Dry run unless --apply.
 */

'use strict';

const path = require('path');
const { execFileSync } = require('child_process');
const { cliGate } = require('./lib/cli');
const { readYAMLFile, findWorkstreamDir, findRepoRoot } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-merge-close',
  summary: 'close queue items named by "Closes WS-NNN" lines in merged commits',
  usage: 'cwos-merge-close [--ref <branch>] [--since <git date>] [--apply] [--human]',
  flags: {
    ref: { type: 'string', placeholder: 'branch', describe: 'history to read (default: origin/master, else master, else HEAD)' },
    since: { type: 'string', placeholder: 'git date', describe: 'how far back to read (default: "30 days ago")' },
    apply: { type: 'boolean', describe: 'close the items (default: dry run, report only)' },
    human: { type: 'boolean', describe: 'readable output instead of JSON' },
  },
  notes: ['Exit 0 ran (dry run or applied), 1 an apply failed, 2 bad arguments.'],
};

const CLOSES = /^[ \t]*closes:?[ \t]+((?:WS-\d+[ \t,]*)+)$/gim;

/** Pure: WS ids named by Closes lines in one commit message. */
function closesIn(message) {
  const ids = new Set();
  let m;
  CLOSES.lastIndex = 0;
  while ((m = CLOSES.exec(message)) !== null) {
    for (const id of m[1].match(/WS-\d+/gi) || []) ids.add(id.toUpperCase());
  }
  return [...ids];
}

/** Pure: given commits [{sha, subject, body}] and an item-status lookup, the closures owed. */
function plan(commits, statusOf) {
  const owed = new Map(); // id -> {id, sha, subject, status}
  const skipped = [];
  // git log is newest first; keep the OLDEST commit that closed an item as its proof
  for (const c of [...commits].reverse()) {
    for (const id of closesIn(`${c.subject}\n${c.body}`)) {
      if (owed.has(id)) continue;
      const status = statusOf(id);
      if (status === null) { skipped.push({ id, sha: c.sha, reason: 'no such item' }); continue; }
      if (status === 'done' || status === 'dismissed') { skipped.push({ id, sha: c.sha, reason: `already ${status}` }); continue; }
      owed.set(id, { id, sha: c.sha, subject: c.subject, status });
    }
  }
  return { owed: [...owed.values()], skipped };
}

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function pickRef(root, wanted) {
  for (const r of wanted ? [wanted] : ['origin/master', 'master', 'HEAD']) {
    try { git(root, ['rev-parse', '--verify', '--quiet', r]); return r; } catch (_) { /* next */ }
  }
  return null;
}

function readCommits(root, ref, since) {
  const SEP = '\x1e', FS = '\x1f';
  const out = git(root, ['log', ref, `--since=${since}`, `--format=%H${FS}%s${FS}%b${SEP}`]);
  return out.split(SEP).map((r) => r.trim()).filter(Boolean).map((r) => {
    const [sha, subject, body] = r.split(FS);
    return { sha, subject: subject || '', body: body || '' };
  });
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const root = findRepoRoot() || process.cwd();
  const wsDir = findWorkstreamDir();
  if (!wsDir) { process.stderr.write('cwos-merge-close: no .claude/workstream directory\n'); process.exit(2); }
  const ref = pickRef(root, values.ref);
  if (!ref) { process.stderr.write(`cwos-merge-close: ref ${values.ref || 'origin/master|master|HEAD'} not found\n`); process.exit(2); }
  const since = values.since || '30 days ago';

  const statusOf = (id) => {
    const item = readYAMLFile(path.join(wsDir, 'queue', `${id}.yaml`));
    return item ? String(item.status || 'backlog') : null;
  };
  const { owed, skipped } = plan(readCommits(root, ref, since), statusOf);

  const applied = [];
  const failed = [];
  if (values.apply) {
    const itemScript = path.join(__dirname, 'cwos-item.js');
    for (const o of owed) {
      try {
        execFileSync(process.execPath, [itemScript, 'done', o.id, '--commit', o.sha,
          '--notes', `closed by merged commit ${o.sha.slice(0, 8)}: ${o.subject}`],
          { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
        applied.push(o.id);
      } catch (e) {
        failed.push({ id: o.id, error: String((e.stderr || e.message || '')).trim().split('\n')[0] });
      }
    }
  }

  const out = { ref, since, mode: values.apply ? 'apply' : 'dry-run', owed, skipped, applied, failed };
  if (values.human) {
    const lines = [`cwos-merge-close (${out.mode}) — ${ref} since ${since}`];
    for (const o of owed) lines.push(`  ${applied.includes(o.id) ? 'closed' : 'owed  '} ${o.id} (${o.status}) ← ${o.sha.slice(0, 8)} ${o.subject}`);
    for (const f of failed) lines.push(`  FAILED ${f.id}: ${f.error}`);
    for (const s of skipped) lines.push(`  skip   ${s.id}: ${s.reason}`);
    if (!owed.length) lines.push('  nothing owed');
    process.stdout.write(lines.join('\n') + '\n');
  } else {
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  }
  process.exit(failed.length ? 1 : 0);
}

if (require.main === module) main();

module.exports = { closesIn, plan };
