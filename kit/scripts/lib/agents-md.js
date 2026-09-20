/**
 * agents-md — keep AGENTS.md's command list identical to the repo's own
 * declared Vital Signs.
 *
 * WHY THIS EXISTS (WS-527 / ADR-069)
 *
 * AGENTS.md is the vendor-neutral convention for repo-level agent
 * instructions. CWOS ships one so a repo survives a change of harness. The
 * failure mode of shipping a second instructions file is not that it is wrong
 * on the day it lands — it is that it is a duplicate, and duplicates drift.
 * Six months later AGENTS.md tells a foreign agent to run a test command that
 * was renamed, and nothing ever said so.
 *
 * So exactly one part of AGENTS.md is generated rather than written: the
 * command list. Its source of truth is the Vital Signs table in
 * `{system_dir}/state.md` — the same table CLAUDE.md's protocol sends every
 * session to, and the same one `cwos-state.js` executes. Checking AGENTS.md
 * against that table IS checking it against CLAUDE.md's own answer to "how do
 * I build and test this repo", because that table is the only place CLAUDE.md
 * keeps that answer as data rather than prose.
 *
 * Everything else in AGENTS.md is hand-written prose and stays that way.
 *
 * THE ONE RULE
 *
 *   The generated block contains exactly the Vital Signs rows that carry a
 *   runnable command, in table order.
 *
 * Not a curated subset, not a family taxonomy of "test-ish" areas. One rule,
 * mechanically decidable, with nothing to argue about at review time.
 *
 * AN AGENTS.md WITHOUT THE MARKERS IS NOT MANAGED
 *
 * A repo may already carry a hand-written AGENTS.md from before CWOS, or from
 * another tool. Absent the markers this module reports `unmanaged` and checks
 * nothing. A guard that goes red over a file it was never given authority to
 * shape is a guard people learn to skip.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { systemPath } = require('./kit-artifacts');
const { parseMarkdownTable, writeFileAtomic, splitTableCells, escapeTableCell } = require('./cwos-utils');

const MARK_START = '<!-- cwos:commands:start';
const MARK_END = '<!-- cwos:commands:end -->';

const BLOCK_HEADER = [
  '| Area | Command |',
  '|------|---------|',
];

/** An em-dash, a bare hyphen or a `<placeholder>` is a declared absence, not a command. */
function isRunnable(cmd) {
  const c = String(cmd || '').trim();
  if (!c) return false;
  if (/^[—–-]+$/.test(c)) return false;
  if (/^<.*>$/.test(c)) return false;
  if (/^(TBD|N\/A|none)$/i.test(c)) return false;
  return true;
}

/**
 * The Vital Signs table is hand-written, and the fleet writes it four ways.
 * Surveyed 2026-09-10 across every repo on this node:
 *
 *   HomeBase, melody-hill-app, ai-personal  | Area  | Status | Check Command | Detail |
 *   Claude-Poker-Tracker                    | Area  | Status | Check         | Detail |
 *   ServeYourNote                           | Check | Command | Expected | Last Result | Status |
 *
 * Reading only `Area` + `Check Command` would have found ZERO rows in two of
 * five repos and reported that as "nothing declared" — an absence
 * indistinguishable from a repo that declares nothing, which is the failure
 * shape MIS-006 is about. So the columns are resolved, not assumed.
 */
function resolveColumns(columns) {
  const has = (name) => columns.includes(name);
  const area = has('Area') ? 'Area' : (has('Check') ? 'Check' : null);
  const command = has('Check Command') ? 'Check Command'
    : (has('Command') ? 'Command'
      : (has('Check') && area !== 'Check' ? 'Check' : null));
  return { area, command };
}

/**
 * A command cell STARTS with the command.
 *
 * Real cells carry trailing prose — ServeYourNote's lint row is
 * "`ruff check .` (container; `ruff` is not on the host PATH)" — so the first
 * backticked span is the command and the rest is commentary. But a cell that
 * opens with prose is not a command at all: Claude-Poker-Tracker's test row
 * reads "CI `test` job (~67 min) — use it, not a local run", where taking the
 * first span would publish `test` as something to run. Requiring the cell to
 * begin with the backtick separates the two without guessing.
 */
function commandFromCell(raw) {
  const cell = String(raw || '').trim();
  if (!cell) return '';
  if (cell.startsWith('`')) {
    const end = cell.indexOf('`', 1);
    return end === -1 ? cell.slice(1).trim() : cell.slice(1, end).trim();
  }
  // No backticks anywhere: the whole cell is the command (HomeBase's style).
  if (!cell.includes('`')) return cell;
  // Prose that happens to quote something — not a command.
  return '';
}

/**
 * The repo's declared command surface: every Vital Signs row with a runnable
 * command. Returns null when state.md is missing entirely, and [] when it
 * exists but declares nothing runnable yet — a real state for a repo
 * mid-adoption, not an error.
 */
function readVitalSigns(repoRoot) {
  const statePath = systemPath(repoRoot, 'state.md');
  if (!fs.existsSync(statePath)) return null;
  let text;
  try { text = fs.readFileSync(statePath, 'utf8'); } catch { return null; }
  const table = parseMarkdownTable(text, 'Vital Signs');
  if (!table || !table.rows || !table.rows.length) return [];
  const { area, command } = resolveColumns(table.columns || []);
  if (!area || !command) return [];
  return table.rows
    .map((r) => ({
      area: String(r[area] || '').trim().replace(/\*\*/g, ''),
      command: commandFromCell(r[command]),
    }))
    .filter((r) => r.area && isRunnable(r.command));
}

/** The generated block's body (between the markers), as the table it should be. */
function renderBlock(rows) {
  if (!rows.length) {
    return [...BLOCK_HEADER, '| _(no vital sign declares a runnable command yet)_ | — |'].join('\n');
  }
  // A command may legitimately contain a pipe (`… | wc -l`). Inside a table
  // cell that pipe must be written `\|` or it reads as a cell boundary and the
  // command is published truncated — see splitTableCells in cwos-utils.
  return [
    ...BLOCK_HEADER,
    ...rows.map((r) => `| ${escapeTableCell(r.area)} | \`${escapeTableCell(r.command)}\` |`),
  ].join('\n');
}

/**
 * Locate the generated block. `found:false` means unmanaged — see the header
 * note. A start marker with no end marker is a torn file and IS reported,
 * because that one a human broke by hand.
 */
function extractBlock(text) {
  const s = text.indexOf(MARK_START);
  if (s === -1) return { found: false, torn: false };
  const lineEnd = text.indexOf('\n', s);
  const markerLineEnd = lineEnd === -1 ? text.length : lineEnd;
  const e = text.indexOf(MARK_END, markerLineEnd);
  if (e === -1) return { found: false, torn: true };
  return {
    found: true,
    torn: false,
    bodyStart: markerLineEnd + 1,
    bodyEnd: e,
    body: text.slice(markerLineEnd + 1, e),
  };
}

/** Read the commands a managed block currently publishes. */
function parseBlockCommands(body) {
  const out = [];
  for (const raw of String(body).split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|?$/.test(line)) continue;                  // separator
    const cells = splitTableCells(line).filter((c) => c !== '').map((c) => c.trim());
    if (cells.length < 2) continue;
    if (/^area$/i.test(cells[0])) continue;                      // header
    const area = cells[0];
    if (/^_\(/.test(area)) continue;                             // empty-state row
    out.push({ area, command: cells[1].replace(/^`|`$/g, '').trim() });
  }
  return out;
}

function agentsPath(repoRoot) {
  return path.join(repoRoot, 'AGENTS.md');
}

/**
 * @returns {{status:'absent'|'unmanaged'|'torn'|'no-state'|'pass'|'fail',
 *            problems:string[], expected:Array, actual:Array, detail:string}}
 */
function checkAgentsMd(repoRoot) {
  const file = agentsPath(repoRoot);
  const nil = { problems: [], expected: [], actual: [] };
  if (!fs.existsSync(file)) {
    return { ...nil, status: 'absent', detail: 'No AGENTS.md — nothing to keep in sync.' };
  }
  const text = fs.readFileSync(file, 'utf8');
  const block = extractBlock(text);
  if (block.torn) {
    return {
      ...nil,
      status: 'torn',
      detail: `AGENTS.md has a \`${MARK_START}\` marker with no closing \`${MARK_END}\` — the generated block cannot be located.`,
    };
  }
  if (!block.found) {
    return {
      ...nil,
      status: 'unmanaged',
      detail: 'AGENTS.md is hand-written (no cwos:commands markers) — not checked. Run `cwos-agents-md.js adopt` to bring its command list under sync.',
    };
  }
  const expected = readVitalSigns(repoRoot);
  if (expected === null) {
    return {
      ...nil,
      status: 'no-state',
      detail: 'AGENTS.md declares a synced command block but state.md is missing — the source of truth is gone.',
    };
  }
  const actual = parseBlockCommands(block.body);

  const problems = [];
  const byArea = new Map(expected.map((r) => [r.area.toLowerCase(), r.command]));
  const seen = new Set();
  for (const a of actual) {
    const key = a.area.toLowerCase();
    seen.add(key);
    if (!byArea.has(key)) {
      problems.push(`AGENTS.md publishes "${a.area}: ${a.command}" — no such vital sign. A foreign agent would run a command this repo no longer declares.`);
      continue;
    }
    const want = byArea.get(key);
    if (want !== a.command) {
      problems.push(`"${a.area}" contradicts state.md — AGENTS.md says \`${a.command}\`, Vital Signs says \`${want}\`.`);
    }
  }
  for (const e of expected) {
    if (!seen.has(e.area.toLowerCase())) {
      problems.push(`"${e.area}" is a declared vital sign (\`${e.command}\`) and AGENTS.md omits it.`);
    }
  }

  return {
    status: problems.length ? 'fail' : 'pass',
    problems,
    expected,
    actual,
    detail: problems.length
      ? `${problems.length} AGENTS.md/state.md contradiction(s):\n  ` + problems.join('\n  ')
      : `AGENTS.md command block matches state.md Vital Signs (${expected.length} command(s)).`,
  };
}

/**
 * Rewrite the generated block from the Vital Signs table.
 * @returns {{ok:boolean, changed:boolean, reason?:string, count:number}}
 */
function syncAgentsMd(repoRoot, { dryRun = false } = {}) {
  const file = agentsPath(repoRoot);
  if (!fs.existsSync(file)) return { ok: false, changed: false, reason: 'absent', count: 0 };
  const text = fs.readFileSync(file, 'utf8');
  const block = extractBlock(text);
  if (!block.found) {
    return { ok: false, changed: false, reason: block.torn ? 'torn' : 'unmanaged', count: 0 };
  }
  const rows = readVitalSigns(repoRoot);
  if (rows === null) return { ok: false, changed: false, reason: 'no-state', count: 0 };

  const rendered = renderBlock(rows) + '\n';
  if (block.body === rendered) return { ok: true, changed: false, count: rows.length };
  const next = text.slice(0, block.bodyStart) + rendered + text.slice(block.bodyEnd);
  if (!dryRun) writeFileAtomic(file, next);
  return { ok: true, changed: true, count: rows.length };
}

module.exports = {
  MARK_START,
  MARK_END,
  agentsPath,
  isRunnable,
  resolveColumns,
  commandFromCell,
  readVitalSigns,
  renderBlock,
  extractBlock,
  parseBlockCommands,
  checkAgentsMd,
  syncAgentsMd,
};
