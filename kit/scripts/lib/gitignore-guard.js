#!/usr/bin/env node
/**
 * gitignore-guard — never add an ignore rule that covers files already tracked.
 *
 * WHY THIS IS A LIB AND NOT A FUNCTION IN ONE SCRIPT. There are two independent
 * places that write ignore rules into a founder's repo, and on 2026-08-23 only
 * one of them was guarded, so the defect reappeared on the very next upgrade:
 *
 *   cwos-kit-upgrade.js   appends the managed ADR-058 block
 *   lib/merge-strategy.js appends missing lines under "# CWOS - added by
 *                         kit upgrade" (the `additive` merge strategy, also
 *                         reached from the /adopt install path)
 *
 * Measured in Claude-Poker-Tracker: upgrading re-added
 * `.claude/workstream/events/` to a repo holding 40 tracked event chunks — 0
 * tracked-but-ignored files before, 40 after — silently recreating the
 * condition that had stranded 19 chunks (2,005 events, 1.3 MB) on a single
 * machine, because nothing adds a chunk while the directory is ignored. The
 * repo had removed that rule four hours earlier as a recorded decision.
 *
 * This is INV-079's predicate, run BEFORE the write instead of after.
 *
 * Everything here FAILS OPEN: if git cannot be consulted, the caller's content
 * goes out unchanged. Withholding the managed block would be a worse outcome
 * than the condition being guarded, and INV-079 catches it after the fact.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

// Which of `lines` would ignore a path this repo currently tracks?
// Returns a Set of the offending pattern strings (empty on any failure).
// Comments, blanks and `!` negations are never offenders — a negation
// un-ignores, so it cannot strand anything.
function trackedIgnoreOffenders(repoPath, lines) {
  const empty = new Set();
  let tracked;
  try {
    const ls = spawnSync('git', ['ls-files', '-z'], {
      cwd: repoPath, encoding: 'utf8', timeout: 20000, maxBuffer: 64 * 1024 * 1024,
    });
    if (ls.error || ls.status !== 0) return empty;
    tracked = ls.stdout;
    if (!tracked || tracked.split('\0').filter(Boolean).length === 0) return empty;
  } catch { return empty; }

  const candidates = lines
    .map((l) => String(l).trim())
    .filter((t) => t && !t.startsWith('#') && !t.startsWith('!'));
  if (candidates.length === 0) return empty;

  const offending = new Set();
  let tmp;
  try {
    tmp = path.join(repoPath, `.cwos-gitignore-probe-${process.pid}`);
    fs.writeFileSync(tmp, candidates.join('\n') + '\n');
    // core.excludesFile makes OUR candidate list a rule source `-v` can name,
    // which is what lets us drop the offending LINE rather than the whole block.
    const r = spawnSync('git', ['-c', `core.excludesFile=${tmp}`, 'check-ignore', '--stdin', '-z', '--no-index', '-v'], {
      cwd: repoPath, input: tracked, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024,
    });
    // 0 = something ignored, 1 = nothing ignored, >1 = a real error.
    if (r.status !== 0 && r.status !== 1) return empty;
    const parts = (r.stdout || '').split('\0').filter(Boolean);
    for (let i = 0; i + 3 < parts.length; i += 4) {
      const source = parts[i];
      const pattern = parts[i + 2];
      // Only rules sourced from our probe count; the repo's own .gitignore
      // matching a tracked file is INV-079's business, not ours.
      if (!source.includes('.cwos-gitignore-probe-')) continue;
      if (pattern.startsWith('!')) continue;
      offending.add(pattern);
    }
  } catch { return empty; }
  finally { if (tmp) { try { fs.unlinkSync(tmp); } catch { /* best effort */ } } }

  return offending;
}

// Return `block` with every offending pattern line commented out, each left in
// place carrying the reason it was withheld. Per LINE, not per block.
function filterIgnoreLinesAgainstTracked(repoPath, block) {
  const lines = String(block).split(/\r?\n/);
  const offending = trackedIgnoreOffenders(repoPath, lines);
  if (offending.size === 0) return block;

  return lines.map((line) => {
    const t = line.trim();
    if (t && !t.startsWith('#') && !t.startsWith('!') && offending.has(t)) {
      return `# ${t}   <- withheld by kit-upgrade: this repo tracks files under it`;
    }
    return line;
  }).join('\n');
}

module.exports = { trackedIgnoreOffenders, filterIgnoreLinesAgainstTracked };
