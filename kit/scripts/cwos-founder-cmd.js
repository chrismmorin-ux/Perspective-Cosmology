#!/usr/bin/env node
/**
 * cwos-founder-cmd — hand the founder a command he runs himself, and check that
 * every reply which asks him to run one went through this tool.
 *
 * WHY THIS EXISTS
 *
 * The founder does not know PowerShell and cannot repair a command. A command
 * wrapped across lines, or split into three lines he is expected to paste in
 * turn, arrives broken: he edits the line breaks out by hand and then runs
 * something nobody wrote. Founder, 2026-09-28: "this is like a regular thing ...
 * we need to fix it now." A rule in CLAUDE.md is the prose tier, which measurably
 * fails under load, so the rule is enforced in two mechanical places instead:
 *
 *   give         the only way a session hands him a command. Refuses anything
 *                that is not one line of plain ASCII, puts it on his clipboard
 *                (no trailing newline, so pasting never runs it early), and
 *                prints the marker line the reply must carry.
 *   check-reply  a Stop hook. Reads the turn's transcript; if the reply asks him
 *                to paste or run a fenced command, that command must be one line
 *                and must have gone through `give` this turn. Otherwise the
 *                reply is sent back (exit 2) with the reason.
 *                A second judge on the same entry point (WS-986, MIS-015): a
 *                reply that calls a PR or kit release ready / NEEDS YOU / DONE /
 *                OK while <workstreamDir>/state/pr-health.json records it RED,
 *                or records nothing (BLIND), is sent back the same way with the
 *                correct wording. No settings change: the Stop hook already
 *                runs check-reply.
 *                A third judge (WS-941) wants evidence beside done / verified /
 *                passing. A fourth (WS-986, founder ruling 2026-10-17) wants the
 *                LINK to the live result beside a claim that work reached him: a
 *                PR merged (the link to that PR), something live or deployed, a
 *                desk card closed, a LIVE / SHOWN / ACCEPTED report line.
 *
 * The marker is for him: a command from a session WITHOUT the line
 * "📋 On your clipboard" is one that slipped past, and he can see it.
 *
 * Zero dependencies beyond lib/cli.js. CommonJS.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { cliGate } = require('./lib/cli');

const MARKER = '📋 On your clipboard';
const MARKER_NO_CLIP = '📋 Not on your clipboard';
// Why the copy failed, in his words. Measured 2026-10-12: a locked screen
// (LogonUI running) makes every Set-Clipboard fail with "Requested Clipboard
// operation did not succeed", and the old wording blamed the machine.
function noClipReason() {
  if (process.platform !== 'win32') return 'no clipboard on this machine';
  try {
    const locked = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      '[bool](Get-Process LogonUI -ErrorAction SilentlyContinue)'], { encoding: 'utf8', timeout: 15000 }).trim();
    if (locked === 'True') return 'the laptop screen is locked';
  } catch { /* fall through */ }
  return 'the clipboard was busy';
}
const MAX_LEN = 2000;

const CLI = {
  name: 'cwos-founder-cmd',
  summary: 'hand Chris a one-line command on his clipboard; Stop-hook check that replies did',
  usage: 'cwos-founder-cmd give [--where <text>] [--expect <text>] [--shell powershell|bash|cmd] (--file <path> | -- <command>)\n       cwos-founder-cmd check-reply   (Stop hook: reads hook JSON on stdin)',
  subcommands: {
    give: 'validate a command, copy it to the clipboard, print the marker block to quote in the reply',
    'check-reply': 'Stop hook: exit 2 if the reply asks Chris to run a command that did not go through give, or calls a PR ready/healthy that state/pr-health.json records RED or not at all (BLIND), or claims done/verified/passing with no evidence beside it (WS-941), or calls a PR merged / something live, deployed or a desk card closed with no link to the live result beside it (WS-986)',
  },
  flags: {
    where: { type: 'string', placeholder: 'text', describe: 'where he pastes it, e.g. "the admin PowerShell window"' },
    expect: { type: 'string', placeholder: 'text', describe: 'what it prints when it worked, e.g. "DONE"' },
    shell: { type: 'string', placeholder: 'name', describe: 'powershell (default) | bash | cmd — enables shell-specific checks' },
    file: { type: 'string', placeholder: 'path', describe: 'read the command from a file (avoids shell quoting); trailing newline ignored' },
    'no-clipboard': { type: 'boolean', describe: 'validate and print only; do not touch the clipboard (tests)' },
  },
  notes: [
    'Exit codes: give 0 = handed over, 1 = refused (reason on stderr), 2 = bad command line.',
    '            check-reply 0 = reply may go, 2 = reply sent back with the reason on stderr.',
    `The reply must quote the marker line give prints ("${MARKER} ...").`,
  ],
};

// ---------------------------------------------------------------------------
// give
// ---------------------------------------------------------------------------

/** Returns a list of reasons the command cannot be handed to the founder. */
function validateCommand(cmd, shell = 'powershell') {
  const problems = [];
  if (!cmd || !cmd.trim()) problems.push('the command is empty');
  if (/[\r\n]/.test(cmd)) problems.push('it is more than one line; join the steps with ";" so he pastes exactly one line');
  if (cmd.length > MAX_LEN) problems.push(`it is ${cmd.length} characters (limit ${MAX_LEN}); put the work in a script file and hand him the one line that runs it`);
  // eslint-disable-next-line no-control-regex
  if (/[^\x09\x20-\x7e]/.test(cmd)) problems.push('it contains non-ASCII characters (smart quotes, dashes, emoji); Windows PowerShell 5.1 mis-parses them');
  if (shell === 'powershell' && /(^|[^|&])(&&|\|\|)([^|&]|$)/.test(cmd)) {
    problems.push('it uses && or ||, which Windows PowerShell 5.1 rejects as a parse error; use ";" or if ($?) { ... }');
  }
  return problems;
}

function copyToClipboard(text) {
  if (process.platform !== 'win32') return false;
  try {
    // Set-Clipboard reads the value from stdin, so no quoting of the command is needed.
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      '$v = [Console]::In.ReadToEnd(); Set-Clipboard -Value $v'], { input: text, stdio: ['pipe', 'ignore', 'ignore'], timeout: 15000 });
    const back = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '(Get-Clipboard) -join "`n"'],
      { encoding: 'utf8', timeout: 15000 }).replace(/\r?\n$/, '');
    return back === text;
  } catch {
    return false;
  }
}

function giveBlock(cmd, { where, expect, onClipboard, reason }) {
  const lines = [];
  lines.push(onClipboard ? `${MARKER} — 1 line, checked.` : `${MARKER_NO_CLIP} (${reason || 'no clipboard on this machine'}) — 1 line, checked. Copy it from the box below.`);
  if (where) lines.push(`Paste into: ${where}${onClipboard ? ' (right-click pastes in a terminal window)' : ''}, then press Enter.`);
  if (expect) lines.push(`When it worked it prints: ${expect}`);
  lines.push(`COMMAND: ${cmd}`);
  return lines.join('\n');
}

function runGive(values, positionals) {
  let cmd;
  if (values.file) {
    cmd = fs.readFileSync(values.file, 'utf8').replace(/\r?\n$/, '');
  } else {
    cmd = positionals.join(' ');
  }
  const shell = values.shell || 'powershell';
  if (!['powershell', 'bash', 'cmd'].includes(shell)) {
    process.stderr.write(`cwos-founder-cmd: --shell must be powershell, bash or cmd (got ${shell})\n`);
    return 2;
  }
  const problems = validateCommand(cmd, shell);
  if (problems.length) {
    process.stderr.write('cwos-founder-cmd: REFUSED — not handed to Chris:\n' + problems.map((p) => `  - ${p}`).join('\n') + '\n');
    return 1;
  }
  const onClipboard = values['no-clipboard'] ? false : copyToClipboard(cmd);
  const reason = onClipboard || values['no-clipboard'] ? undefined : noClipReason();
  process.stdout.write(giveBlock(cmd, { where: values.where, expect: values.expect, onClipboard, reason }) + '\n');
  return 0;
}

// ---------------------------------------------------------------------------
// check-reply (Stop hook)
// ---------------------------------------------------------------------------

const CMD_LANGS = new Set(['powershell', 'pwsh', 'ps', 'ps1', 'bash', 'sh', 'shell', 'zsh', 'cmd', 'bat', 'batch', 'console', 'terminal']);
// Language asking HIM to run something, as opposed to showing him code.
const RUN_CUE = /\b(paste|right-click|press enter|run (this|these|it|that|the (line|command|following))|type (this|these|the following)|copy (this|these|that|the (line|command))|run as administrator|open (an? |the )?(admin(istrator)? )?(powershell|terminal|command prompt))\b/i;

/** Pull fenced code blocks out of markdown text. */
function fencedBlocks(text) {
  const out = [];
  const re = /```([^\n`]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) out.push({ lang: m[1].trim().toLowerCase(), body: m[2].replace(/\n$/, '') });
  return out;
}

function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

/**
 * Split a transcript (array of JSONL entries) into the current turn: every
 * entry after the last genuine user prompt (a user entry that is not only
 * tool results). Returns { replyText, givenCommands }.
 */
function currentTurn(entries) {
  const isPrompt = (e) => {
    if (e.type !== 'user' || !e.message) return false;
    const c = e.message.content;
    if (typeof c === 'string') return true;
    if (!Array.isArray(c)) return false;
    return c.some((b) => b && b.type === 'text') && !c.some((b) => b && b.type === 'tool_result');
  };
  let start = 0;
  for (let i = entries.length - 1; i >= 0; i--) if (isPrompt(entries[i])) { start = i + 1; break; }
  const turn = entries.slice(start);

  const texts = [];
  const given = [];
  // finalTexts: assistant text AFTER the turn's last tool result — the reply he
  // reads. The health judge looks only here: "PR #40 is ready, let me check"
  // narrated before a tool call is a working note, not a status he acts on.
  let finalTexts = [];
  for (const e of turn) {
    const c = e.message && e.message.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (!b) continue;
      if (e.type === 'assistant' && b.type === 'text' && b.text) { texts.push(b.text); finalTexts.push(b.text); }
      if (e.type === 'user' && b.type === 'tool_result') finalTexts = [];
      if (e.type === 'user' && b.type === 'tool_result') {
        const body = typeof b.content === 'string' ? b.content
          : Array.isArray(b.content) ? b.content.map((x) => (x && x.text) || '').join('\n') : '';
        if (body.includes('📋') && /^COMMAND: /m.test(body)) {
          for (const line of body.split(/\r?\n/)) {
            const mm = line.match(/^COMMAND: (.*)$/);
            if (mm) given.push(norm(mm[1]));
          }
        }
      }
    }
  }
  return { replyText: texts.join('\n\n'), finalText: finalTexts.join('\n\n'), givenCommands: given };
}

/** Pure decision: returns [] when the reply may go, else the reasons it may not. */
function judgeReply(replyText, givenCommands) {
  const problems = [];
  if (!RUN_CUE.test(replyText)) return problems;
  const blocks = fencedBlocks(replyText).filter((b) => b.lang === '' || CMD_LANGS.has(b.lang));
  if (!blocks.length) return problems;
  const given = new Set(givenCommands.map(norm));
  for (const b of blocks) {
    const nonEmpty = b.body.split('\n').filter((l) => l.trim());
    if (nonEmpty.length > 1) {
      problems.push(`a command block for Chris has ${nonEmpty.length} lines; he pastes exactly one. Join it with ";" and hand it over with cwos-founder-cmd give.`);
      continue;
    }
    if (!given.has(norm(b.body))) {
      problems.push(`the command "${norm(b.body).slice(0, 80)}" was not handed over with cwos-founder-cmd give this turn, so it is not on his clipboard and was never checked.`);
    }
  }
  if (blocks.length && !replyText.includes('📋')) {
    problems.push(`the reply does not carry the "${MARKER}" line give printed; he relies on it to know the command was checked.`);
  }
  return problems;
}

// ---------------------------------------------------------------------------
// check-reply, judge 2: a PR called ready while its recorded health is not OK
// ---------------------------------------------------------------------------
//
// MIS-015, 2026-10-01: a session opened the kit-3.43.0 release PR #40, cwos-pr
// printed "🟡 Needs your tap", and the session told the founder it was ready —
// while atomic-state-writes.test.js was RED and the full kit sweep had never
// finished (BLIND). The vocabulary that forbids that had been ruled on
// 2026-09-21 (ai-personal .claude/rules/state-words.md): health is OK / RED /
// BLIND, BLIND is never reported as OK, and ❌ NEEDS YOU means blocked on him
// ALONE. Prose had already failed once, so the rule is checked here, at the one
// point every reply passes through, against the record cwos-pr writes
// (<workstreamDir>/state/pr-health.json, WS-986 contract 2). No record is not
// OK — it is BLIND, which is exactly the state the session misreported.
//
// Phrase lists follow claude-poker-tracker's retreat-detector: a BLOCKING set of
// near-diagnostic claims, a WEAK set that only blocks when nothing in the
// sentence says the health honestly, and a SOFT set that is reported, never
// blocking. A false positive costs one re-read (and the second pass goes through
// on stop_hook_active); a false negative costs him tapping merge on RED code.

// Near-diagnostic: in a sentence about a PR these ARE the claim, whatever else
// the sentence says. DONE and NEEDS YOU are matched as the labels (upper case
// for DONE, which as a lower-case word is too common to mean the label).
// mergeWord: the phrase only ever describes something mergeable, so a sentence
// with no reference of its own is about the PR the reply last named — the
// MIS-015 shape is "Opened PR #40 (kit 3.43.0 release)." then, a paragraph
// later, the relayed cwos-pr header "🟡 Needs your tap". The general labels
// (DONE, NEEDS YOU, ✅) only borrow a reference from their own paragraph.
const HEALTH_CLAIM_BLOCKING = [
  { re: /\bneeds your tap\b/i, mergeWord: true },
  { re: /\bready (?:to (?:merge|ship|tap|land|release)|for (?:your |a )?(?:tap|merge|review))\b/i, mergeWord: true },
  { re: /\bsafe to (?:merge|ship|tap)\b/i, mergeWord: true },
  { re: /\bneeds you\b/i },
  { re: /\bDONE\b/ },
  { re: /✅/ },
];
// Health words used as an all-clear. Exempt when the same sentence names a real
// health state (RED / BLIND): "221 of 223 suites passed; health RED" is the
// vocabulary used correctly, not a claim.
const HEALTH_CLAIM_WEAK = [
  { re: /\bOK\b/ },
  { re: /\bgreen\b/i },
  { re: /\bpass(?:es|ing|ed)\b/i },
];
// Reported in the message for self-review; never block on their own.
const HEALTH_CLAIM_SOFT = [
  { word: 'ready', re: /\bready\b/i }, { word: 'done', re: /\bdone\b/i }, { word: 'merged', re: /\bmerged\b/i },
  { word: 'shipped', re: /\bshipped\b/i }, { word: 'looks good', re: /\blooks good\b/i },
  { word: 'LGTM', re: /\blgtm\b/i }, { word: 'all clear', re: /\ball clear\b/i },
];
// A claim word inside one of these is not a claim of the present state: "not
// ready", "isn't green yet", "will be ready once the sweep passes".
const NEGATION_OR_CONDITION = /^(?:not|never|no|nor|neither|isn'?t|aren'?t|wasn'?t|weren'?t|won'?t|can'?t|cannot|without|until|unless|once|if|when|after|before|whether|will|would)$/i;
const HONEST_HEALTH = /\b(?:RED|BLIND)\b/;

/** Remove what is quoted rather than said: fenced blocks and `inline code`. Bold/italic markers dropped so "PR **#40**" still reads as a reference. */
function speakableText(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\*\*|__/g, '');
}

/** PR numbers and kit release versions a sentence refers to. */
function prRefs(unit) {
  const prs = new Set();
  const kits = new Set();
  let m;
  const direct = /\b(?:PRs?|pull requests?)\s*#\s*(\d+)/gi;
  while ((m = direct.exec(unit))) prs.add(m[1]);
  const url = /\/pull\/(\d+)\b/g;
  while ((m = url.exec(unit))) prs.add(m[1]);
  // "#N near PR": a sentence that says PR anywhere owns every #N in it ("the
  // release PR (#40)", "PRs #40 and #41").
  if (/\b(?:PRs?|pull requests?)\b/i.test(unit)) {
    const bare = /(?:^|[^\w&/])#(\d+)\b/g;
    while ((m = bare.exec(unit))) prs.add(m[1]);
  }
  if (/\brelease\b/i.test(unit)) {
    const kit = /\bkit[-\s]?v?(\d+\.\d+\.\d+)\b/gi;
    while ((m = kit.exec(unit))) kits.add(m[1]);
  }
  return { prs: [...prs], kits: [...kits] };
}

/**
 * First claim of each strength in a sentence, skipping negated/conditional
 * ones: { word (as he would read it), mergeWord } or null.
 */
function claimsIn(unit) {
  const found = (list) => {
    for (const c of list) {
      const re = new RegExp(c.re.source, c.re.flags + 'g');
      let m;
      while ((m = re.exec(unit))) {
        const before = unit.slice(0, m.index).replace(/\u2019/g, "'").replace(/[^\w'\s]/g, ' ').trim().split(/\s+/).slice(-3);
        if (!before.some((w) => NEGATION_OR_CONDITION.test(w))) return { word: m[0], mergeWord: Boolean(c.mergeWord) };
      }
    }
    return null;
  };
  const strong = found(HEALTH_CLAIM_BLOCKING);
  const weak = HONEST_HEALTH.test(unit) ? null : found(HEALTH_CLAIM_WEAK);
  return { strong, weak };
}

/**
 * Pure: every place the reply claims a PR (or a kit release) is ready or healthy.
 * Unit is the sentence. A sentence with a BLOCKING claim and no reference of its
 * own borrows one: from its own line first, then the nearest earlier line of its
 * paragraph, and — for a merge word only — the last reference anywhere earlier
 * in the reply. Weak claims (OK / green / passes) never borrow.
 */
function findPrClaims(replyText) {
  const out = [];
  const lines = speakableText(replyText).split(/\r?\n/);
  let paraRefs = null; // refs of the nearest earlier line in this paragraph
  let lastRefs = null; // refs of the nearest earlier line anywhere in the reply
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { paraRefs = null; continue; }
    // ";" does not end a sentence: "221 of 223 passed; health RED" is one honest statement.
    const sentences = line.split(/(?<=[.!?])\s+/).filter(Boolean);
    const lineRefs = prRefs(line);
    const lineHasRefs = lineRefs.prs.length || lineRefs.kits.length;
    for (const s of sentences) {
      const { strong, weak } = claimsIn(s);
      if (!strong && !weak) continue;
      const claim = (strong || weak).word;
      let refs = prRefs(s);
      if (!refs.prs.length && !refs.kits.length && strong) {
        refs = lineHasRefs ? lineRefs : (paraRefs || (strong.mergeWord && lastRefs) || refs);
      }
      for (const pr of refs.prs) out.push({ kind: 'pr', ref: pr, claim, text: s });
      // A sentence naming both a PR and a kit release is judged by the PR: it is
      // the more specific reference, and a release branch need not carry its version.
      if (!refs.prs.length) for (const v of refs.kits) out.push({ kind: 'kit', ref: v, claim, text: s });
    }
    if (lineHasRefs) { paraRefs = lineRefs; lastRefs = lineRefs; }
  }
  return out;
}

function failingChecks(rec) {
  return (rec && Array.isArray(rec.checks) ? rec.checks : []).filter((c) => c && c.result !== 'OK');
}

/**
 * Pure decision: claims from findPrClaims judged against pr-health records
 * (contract 2: { "<pr>": { branch, head_sha, lane, health, checks[], at } }).
 * A kit release is matched to the records whose branch carries its version.
 * Returns [] when the reply may go, else one reason per misreported PR.
 */
function judgeHealthClaims(replyText, records, source = 'pr-health.json') {
  const claims = findPrClaims(replyText);
  if (!claims.length) return [];
  const recs = records && typeof records === 'object' ? records : {};
  const seen = new Set();
  const problems = [];
  for (const c of claims) {
    let targets;
    if (c.kind === 'pr') {
      targets = [{ label: `PR #${c.ref}`, rec: recs[c.ref] }];
    } else {
      const hits = Object.entries(recs).filter(([, r]) => r && typeof r.branch === 'string' && r.branch.includes(c.ref));
      targets = hits.length ? hits.map(([n, r]) => ({ label: `PR #${n} (kit ${c.ref} release)`, rec: r }))
        : [{ label: `the kit ${c.ref} release`, rec: undefined }];
    }
    for (const t of targets) {
      const health = t.rec && ['OK', 'RED', 'BLIND'].includes(t.rec.health) ? t.rec.health : 'BLIND';
      if (health === 'OK' || seen.has(t.label)) continue;
      seen.add(t.label);
      const failing = failingChecks(t.rec);
      const why = !t.rec ? `no health record in ${source}`
        : failing.length ? failing.map((f) => `${f.name} ${f.result || 'BLIND'}${f.detail ? ` (${f.detail})` : ''}`).join('; ')
          : `recorded ${health} with no failing check named`;
      const short = !t.rec ? 'no health record' : (failing.map((f) => f.name).join(', ') || 'unchecked');
      problems.push(
        `${t.label} is called "${c.claim}" but its recorded health is ${health} — ${why}.`
        + ` Say instead: "${t.label} — WRITTEN · health ${health} (${short}) — ME".`,
      );
    }
  }
  if (problems.length) {
    const said = speakableText(replyText);
    const soft = HEALTH_CLAIM_SOFT.filter((c) => c.re.test(said)).map((c) => c.word);
    if (soft.length) problems.push(`also present (soft, not blocking): ${soft.join(', ')}`);
  }
  return problems;
}

// ---------------------------------------------------------------------------
// check-reply, judge 3: a closing claim with no evidence behind it
// ---------------------------------------------------------------------------
//
// WS-941 gap 1 (edge-claim-truth, "an adversary whose job is to test each claim
// before the jury hears it"). Engines have cross-critics; an ordinary session's
// "done", "verified" or "tests pass" met nobody before the founder read it, and
// he acts on it without opening the code (docs/MISSION.md promise 2). The
// lexicon's evidence family (docs/system-spec/lexicon.yaml, id: evidence) says
// what a claim needs: Observed carries a pointer, Cited names its source,
// Assumed names the check that would settle it. This judge asks for one of the
// three at the moment the claim is made.
//
// Unit is the sentence; proof may sit anywhere in its paragraph, because a
// bullet that says "suite passes" under a line quoting `node x.test.js` (12 of
// 12) is backed. Proof is read from the RAW text — a backtick span is the
// commonest pointer — while claims are read from speakable text, so a claim
// word quoted inside code is never a claim. A false positive costs one re-read
// and the second pass goes through on stop_hook_active.

// Backtested 2026-10-02 against the last 60 local transcripts (681 final
// replies): the passive "is done by", the noun "a test pass", and "been done
// in" were the false positives, and are shaped out below.
const CLOSING_CLAIMS = [
  /\b(?:is|are|now|marked|all)\s+done\b(?!\s+(?:by|in|via|through|with)\b)/i,
  /\bverified\b/i,
  /\b(?:tests|suites|checks)\s+(?:all\s+|now\s+|still\s+)?(?:pass(?:ed)?|passing|green)\b/i,
  /\b(?:test|suite|check|build|lint)\s+(?:now\s+|still\s+)?(?:passes|passed|passing|is green)\b/i,
  /\ball\s+(?:tests?\s+|suites?\s+|checks?\s+)?(?:pass(?:es|ed)?|green)\b/i,
  /\bconfirmed\b/i,
  /\b(?:is|are|now|been)\s+fixed\b/i,
  /\b(?:works now|now works)\b/i,
];

// What makes a claim Observed, Cited or Assumed rather than bare.
const CLAIM_PROOF = [
  /`[^`\n]+`/,                                              // a command, path or output quoted
  /\b[\w./\\-]+\.[A-Za-z]{1,6}:\d+\b/,                      // file:line
  /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/,    // a commit sha (a digit AND a hex letter)
  /\b\d+\s*(?:of|\/)\s*\d+\b/,                              // 12 of 12, 221/223
  /\b\d+\s+(?:passed|passing|failed|tests?|suites?|checks?|files?)\b/i,
  /\b(?:Observed|Cited|Assumed)\b/,                         // the lexicon labels, as labels
  /\bexit(?:ed)?\s+(?:code\s+)?\d+\b/i,
  /https?:\/\/\S+/,
  // A date is a pointer in the lexicon's own words ("command, file and line, or date").
  /\b\d{4}-\d{2}-\d{2}\b/,
  /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:Z|UTC|am|pm)?\b/i,
  /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i,
];

/** Words in quotation marks are mentioned, not claimed: a "done" that never was. */
function unquoted(text) {
  return String(text).replace(/"[^"\n]*"/g, ' ').replace(/“[^”\n]*”/g, ' ');
}

/** First un-negated closing claim in a sentence, or null. */
function closingClaimIn(sentence) {
  if (/\?\s*$/.test(sentence)) return null; // a question claims nothing
  for (const re of CLOSING_CLAIMS) {
    const g = new RegExp(re.source, re.flags + 'g');
    let m;
    while ((m = g.exec(sentence))) {
      const before = sentence.slice(0, m.index).replace(/’/g, "'").replace(/[^\w'\s]/g, ' ').trim().split(/\s+/).slice(-3);
      if (!before.some((w) => NEGATION_OR_CONDITION.test(w))) return m[0];
    }
  }
  return null;
}

/**
 * Pure: every closing claim in the reply whose paragraph carries no proof.
 * Returns [{ claim, text }]. Fenced code and `>` quotes are not the session
 * speaking; they are skipped.
 */
function findUnbackedClaims(replyText) {
  const out = [];
  const raw = String(replyText || '').replace(/```[\s\S]*?```/g, '\n');
  const paragraphs = raw.split(/\r?\n\s*\r?\n/);
  for (const para of paragraphs) {
    const lines = para.split(/\r?\n/).filter((l) => l.trim() && !/^\s*>/.test(l));
    if (!lines.length) continue;
    const paraRaw = lines.join('\n');
    if (CLAIM_PROOF.some((re) => re.test(paraRaw))) continue;
    for (const line of lines) {
      const said = unquoted(speakableText(line)).trim();
      for (const s of said.split(/(?<=[.!?])\s+/).filter(Boolean)) {
        const claim = closingClaimIn(s);
        if (claim) out.push({ claim, text: s.replace(/^[\s*\-+\d.|]+/, '').slice(0, 140) });
      }
    }
  }
  return out;
}

/** Pure decision for judge 3: [] when every closing claim is backed. */
function judgeClosingClaims(replyText) {
  return findUnbackedClaims(replyText).slice(0, 5).map((c) =>
    `"${c.claim}" with nothing behind it: "${c.text}". Add the pointer (the command and what it printed, a file:line, or the commit), or relabel it "Assumed — <the check that would settle it>".`);
}

// ---------------------------------------------------------------------------
// check-reply, judge 4: a live-result claim with no link to the live result
// ---------------------------------------------------------------------------
//
// WS-986, founder ruling 2026-10-17 (WS-1001 round 4): "the proof that ends his
// re-checking is a link to the live result (merged PR, deployed page, closed
// desk card) beside every done claim." Judge 3 accepts any evidence — a sha, a
// date, "12 of 12" — so "PR #160 merged at 22:48 UTC" passed it and he still
// had to go and look. This judge asks, for the claims that say work REACHED
// him, for the one thing he can tap.
//
// Scope is deliberately narrow. Backtested 2026-11-03 against 601 final replies
// from the last 120 local transcripts: requiring a link for every done / pushed
// / closed would have held 169 (28%) — a guard that cries wolf gets switched
// off. The claims below are the after-merge rungs of the founder lexicon and
// their plain-English forms. See the test file's header for the measured rate.
//
// Unit is the sentence; the link may sit in the claim's paragraph or the next
// one ("LIVE: …" headline, then the paragraph that carries the links). A
// numbered PR needs the link to THAT PR — a link to something else does not end
// the re-check. Everything else takes any https link.

const LIVE_CLAIMS = [
  // A PR merged or landed. Only counts when the sentence names a PR number;
  // "merged up from master" / "merged master in" is the reverse direction.
  { kind: 'merged', re: /\b(?:merged|landed)\b(?!\s+(?:up\b|in\s+from\b|from\b|master\b|main\b|origin\b|ledger\b|branch\b|copy\b|state\b|view\b|list\b|result\b|version\b|diff\b|commit\b))/i },
  // Something live or deployed. "two sessions are live" is liveness, not a result.
  { kind: 'live', re: /(?<!\bsessions?\s)(?<!\bsessions?\s(?:are|is)\s)(?:\b(?:is|are|now|went|been)|(?<=\b(?:it|that|this|everything|they))['’](?:s|re))\s+(?:now\s+)?live\b(?!-)(?!\s+(?:app|site|record|report|data|copy|version|session|state)\b)(?!\s+(?:in|on)\s+(?:this|the same|that)\s+(?:folder|checkout|tree)\b)/i },
  { kind: 'live', re: /\b(?:deployed\s+(?:(?:it|them|this|that|the \w+)\s+)?to|(?:is|are|now|been)\s+deployed)\b/i },
  // A desk card or ask closed or answered — either voice, with or without its id.
  { kind: 'desk', re: /\b(?:desk\s+)?(?:cards?|asks?)(?:\s+[A-Z]{2,}-\d+)?\s+(?:is\s+|are\s+|now\s+|been\s+|was\s+|were\s+)?(?:closed|answered)\b/i },
  { kind: 'desk', re: /\b(?:closed|answered)\s+(?:(?:the|your|his|a|that|this|both|all|\d+)\s+)?(?:desk\s+)?(?:cards?|asks?)\b/i },
];
// The report line, ladder word first, at an after-merge rung. Upper case only:
// "live" as a lower-case word is too common to be the label. A list number or a
// table cell may open the line.
const LIVE_HEADLINE = /^[\s*#>_|\-]{0,6}(?:\d+[.)]\s+)?[\s*_|]{0,4}(?:LIVE|SHOWN|ACCEPTED)\b(?!\s+is\b)/;
// What makes a live claim a plan, a hope or a premise rather than a report.
// Derived 2026-11-03 after three inspector rounds of guessing the opener's
// tense failed in turn: the CLAIM's own tense is what separates them.
//   - Only report-shaped verbs are claims at all: "merged", "went live", "is
//     live", "closed". "Goes live" and "merges" never are.
//   - A conditional opener (if / unless / whether / assuming) governs the
//     whole sentence.
//   - After a temporal opener (once / until / when / after / before / as soon
//     as) a claim inside the opener's own comma clause is the condition, not the
//     report ("Once they've merged, …"). In the main clause a PAST claim reports
//     ("After review, PR #160 merged.") and a PRESENT one is the plan ("When
//     it's merged, the page is live.").
//   - A future or a hope anywhere before the claim makes it a plan ("I'll …
//     confirm the build is live"); a negation inside the claim's own comma
//     clause makes it not a claim; "gets merged" / "where they now live" /
//     "after it's live" are read from the two words before.
const OPENER_CONDITIONAL = /^(?:if|unless|whether|assuming)$/i;
const OPENER_TEMPORAL = /^(?:once|until|when|after|before|as\s+soon\s+as)\b/i;
const LIVE_MODAL = /^(?:will|would|should|could|might|may|need|needs|assumed|assumes|expect|expected|expects|hope|hoped|hopes|[a-z]+'ll|[a-z]+'d|let's|won'?t|tomorrow|later)$/i;
const LIVE_NEGATE = /^(?:not|never|nobody|nothing|none|neither|nor|isn'?t|aren'?t|wasn'?t|weren'?t|hasn'?t|haven'?t|hadn'?t|can'?t|cannot|without)$/i;
const LIVE_NEAR = /^(?:no|gets|get|getting|where|after|before|once|until|unless|if|when)$/i;
const LIVE_SUBORDINATE = /^(?:until|unless|once|if|whether)$/i;
// A claim in the present tense: "is live", "it's live", "are closed", "now deployed".
const PRESENT_CLAIM = /^(?:is|are|now|['’](?:s|re))\b|\b(?:is|are|now)\s+(?:closed|answered|deployed)\b/i;

function words(text) {
  return text.replace(/’/g, "'").replace(/[^\w'\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
}

/** How the sentence opens, computed once per sentence. */
function openerOf(sentence) {
  const lead = sentence.replace(/^[^\w]+/, '');
  const first = words(lead)[0] || '';
  if (OPENER_CONDITIONAL.test(first)) return { kind: 'conditional' };
  if (!OPENER_TEMPORAL.test(lead)) return null;
  const comma = sentence.search(/[,;:]/);
  return { kind: 'temporal', clauseEnd: comma === -1 ? -1 : comma };
}

function hedgedBefore(sentence, index, opener, claimText) {
  const before = sentence.slice(0, index);
  const all = words(before);
  // "is merged", "are closed": the auxiliary before the matched word sets the tense.
  const present = PRESENT_CLAIM.test(claimText.trim()) || /^(?:is|are|be|being)$/i.test(all[all.length - 1] || '');
  if (opener && all.length) {
    if (opener.kind === 'conditional') return true;
    if (opener.clauseEnd !== -1 && index < opener.clauseEnd) return true; // the condition itself
    if (present) return true; // "When it's merged, the page is live."
  }
  // A present claim with its condition AFTER it: "PR #160 is merged once you tap
  // the label." A past claim with a trailing "after CI passed" still reports.
  // Only within the claim's own clause ("The page is live — if anything looks
  // off, tell me" reports), and "after"/"before" only when someone acts next
  // ("after you tap"), not "after the deploy" (inspector round 5).
  const rest = sentence.slice(index + claimText.length).split(/[,;:(—–]|\s-\s/)[0];
  if (present && (/\b(?:once|when|until|unless|if|as\s+soon\s+as)\b/i.test(rest)
    || /\b(?:after|before)\s+(?:you|we|i|they|he|she|someone|ci|your)\b/i.test(rest))) return true;
  if (all.some((w) => LIVE_MODAL.test(w))) return true;
  // The claim's own comma clause: a negation, or a subordinator that makes it a
  // background clause ("red until #139 passes and is merged"). The sentence's
  // own opener was judged above, so it is not counted again here.
  const parts = before.split(/[,;:]/);
  let clause = words(parts[parts.length - 1]);
  if (opener && parts.length === 1) clause = clause.slice(/^as\s+soon\s+as\b/i.test(before.replace(/^[^\w]+/, '')) ? 3 : 1);
  if (clause.some((w) => LIVE_NEGATE.test(w) || LIVE_SUBORDINATE.test(w))) return true;
  return all.slice(-2).some((w) => LIVE_NEAR.test(w));
}

/** "log entry #1", "FD-032 #2", "issue #5": a numbered thing that is not a PR. */
function notAPr(sentence, hashIndex) {
  return /(?:entry|entries|item|row|step|card|issue|issues|question|[A-Z]{2,}-\d+)\s*$/i.test(sentence.slice(0, hashIndex).trimEnd());
}

/** PR numbers a merged-claim sentence names: prRefs plus bare #N (the sentence says "merged"). */
function mergedPrNumbers(sentence) {
  const prs = new Set(prRefs(sentence).prs);
  const bare = /#(\d+)\b/g;
  let m;
  while ((m = bare.exec(sentence))) {
    const prev = sentence[m.index - 1];
    if (prev && /[\w&/]/.test(prev)) continue;
    if (notAPr(sentence, m.index)) { prs.delete(m[1]); continue; }
    prs.add(m[1]);
  }
  return [...prs];
}

/**
 * Pure: every live-result claim in the reply, with whether its link is beside
 * it. Returns [{ kind, claim, text, prs, missing }] where missing lists the PR
 * numbers with no /pull/N link (or ['link'] for a claim that takes any link).
 * Fenced code, `inline code`, quotes and `>` lines are not the session speaking.
 */
function findLiveClaims(replyText) {
  const out = [];
  const raw = String(replyText || '').replace(/```[\s\S]*?```/g, '\n');
  const paragraphs = raw.split(/\r?\n\s*\r?\n/);
  paragraphs.forEach((para, pi) => {
    const lines = para.split(/\r?\n/).filter((l) => l.trim() && !/^\s*>/.test(l));
    if (!lines.length) return;
    const window = lines.join('\n') + '\n' + (paragraphs[pi + 1] || '');
    const anyLink = /https?:\/\/\S+/.test(window);
    const pulled = new Set();
    let pm;
    const pullRe = /https?:\/\/\S*?\/pull\/(\d+)\b/g;
    while ((pm = pullRe.exec(window))) pulled.add(pm[1]);

    for (const line of lines) {
      const said = unquoted(speakableText(line));
      const headline = LIVE_HEADLINE.test(said);
      let lineHasClaim = false;
      for (const s of said.split(/(?<=[.!?])\s+/).filter(Boolean)) {
        if (/\?\s*$/.test(s)) continue; // a question claims nothing
        const opener = openerOf(s);
        for (const c of LIVE_CLAIMS) {
          const g = new RegExp(c.re.source, c.re.flags + 'g');
          let m;
          let hit = null;
          while ((m = g.exec(s))) {
            // "what is LIVE" names the label; LIVE as a claim is the headline's job.
            if (c.kind === 'live' && /LIVE/.test(m[0])) continue;
            if (!hedgedBefore(s, m.index, opener, m[0])) { hit = m; break; }
          }
          if (!hit) continue;
          const prs = c.kind === 'merged' ? mergedPrNumbers(s) : prRefs(s).prs;
          if (c.kind === 'merged' && !prs.length) continue; // "the fix merged" names nothing to link
          const missing = prs.length ? prs.filter((n) => !pulled.has(n)) : (anyLink ? [] : ['link']);
          out.push({ kind: c.kind, claim: hit[0], text: s.replace(/^[\s*\-+\d.|#]+/, '').trim().slice(0, 140), prs, missing });
          lineHasClaim = true;
          break; // one claim per sentence is enough to judge it
        }
      }
      if (headline && !lineHasClaim) {
        const word = said.match(/(LIVE|SHOWN|ACCEPTED)/)[1];
        const prs = prRefs(said).prs;
        const missing = prs.length ? prs.filter((n) => !pulled.has(n)) : (anyLink ? [] : ['link']);
        out.push({ kind: 'headline', claim: word, text: said.replace(/^[\s*#>_-]+/, '').trim().slice(0, 140), prs, missing });
      }
    }
  });
  return out;
}

/** Pure: the live-result claims whose link is not beside them. */
function findUnlinkedLiveClaims(replyText) {
  return findLiveClaims(replyText).filter((c) => c.missing.length);
}

/** Pure decision for judge 4: [] when every live-result claim carries its link. */
function judgeLiveLinks(replyText) {
  return findUnlinkedLiveClaims(replyText).slice(0, 5).map((c) => {
    if (c.missing[0] === 'link') {
      return `"${c.claim}" with no link to the live result: "${c.text}". Put the link he would tap beside it (the deployed page, the desk card, the commit on GitHub).`;
    }
    const nums = c.missing.map((n) => `#${n}`).join(', ');
    return `${nums} called merged/live with no link to ${c.missing.length > 1 ? 'those PRs' : 'that PR'}: "${c.text}". Put each link beside it: https://github.com/<owner>/<repo>/pull/${c.missing[0]}.`;
  });
}

/** Read <workstreamDir>/state/pr-health.json for the session's cwd. Missing or unreadable = no records (everything BLIND). */
/**
 * Judge 2 applies only in a repo whose PRs go through cwos-pr — the one place a
 * health record CAN exist. This Stop hook runs for every repo on the machine;
 * without the scope, a session in a repo that never had cwos-pr would be held
 * back as BLIND for "PR #12 passes — CI run 1234 green", evidence and all, and
 * a guard that cries wolf gets switched off. Marker: .claude/landing.yaml (the
 * cwos-pr lane policy) in the checkout or any parent, or a pr-health.json
 * already written for it.
 */
function usesPrHealth(cwd) {
  let dir = path.resolve(cwd || '.');
  for (;;) {
    if (fs.existsSync(path.join(dir, '.claude', 'landing.yaml'))) return true;
    if (fs.existsSync(path.join(dir, '.claude', 'workstream', 'state', 'pr-health.json'))) return true;
    const up = path.dirname(dir);
    if (up === dir) return false;
    dir = up;
  }
}

function loadPrHealth(cwd) {
  let file = null;
  try {
    const { findWorkstreamDir } = require('./lib/cwos-utils');
    file = path.join(findWorkstreamDir(cwd), 'state', 'pr-health.json');
  } catch { return { file: `pr-health.json (no .claude/workstream/ found from ${cwd})`, records: {} }; }
  try { return { file, records: JSON.parse(fs.readFileSync(file, 'utf8')) || {} }; }
  catch { return { file, records: {} }; }
}

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function runCheckReply() {
  let input = {};
  try { input = JSON.parse(readStdin() || '{}'); } catch { return 0; }
  // One retry only: if the reply was already sent back once, let it through
  // rather than loop. The miss is still logged.
  const tp = input.transcript_path;
  if (!tp || !fs.existsSync(tp)) return 0;
  let entries;
  try {
    entries = fs.readFileSync(tp, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return 0; }
  const { replyText, finalText, givenCommands } = currentTurn(entries);
  const cmdProblems = judgeReply(replyText, givenCommands);
  // Judge 2 reads pr-health.json only when the reply actually claims something
  // about a PR, so the common reply costs no file read.
  let healthProblems = [];
  if (findPrClaims(finalText).length && usesPrHealth(input.cwd || process.cwd())) {
    const { file, records } = loadPrHealth(input.cwd || process.cwd());
    healthProblems = judgeHealthClaims(finalText, records, file);
  }
  const claimProblems = judgeClosingClaims(finalText);
  const linkProblems = judgeLiveLinks(finalText);
  if (!cmdProblems.length && !healthProblems.length && !claimProblems.length && !linkProblems.length) return 0;
  logMiss(input, [...cmdProblems, ...healthProblems, ...claimProblems, ...linkProblems]);
  if (input.stop_hook_active) return 0;
  const out = [];
  if (cmdProblems.length) {
    out.push('Reply held back: it asks Chris to run a command that did not go through cwos-founder-cmd.\n'
      + cmdProblems.map((p) => `  - ${p}`).join('\n')
      + '\nFix: write the command to a file, run `node C:/Users/chris/repos/homebase/kit/scripts/cwos-founder-cmd.js give --file <path> --where "<where>" --expect "<what it prints>"`, then rewrite the reply to quote the marker block it prints.\n');
  }
  if (healthProblems.length) {
    out.push('Reply held back: it calls a PR ready or healthy that its recorded health does not back (MIS-015; vocabulary: ai-personal .claude/rules/state-words.md).\n'
      + healthProblems.map((p) => `  - ${p}`).join('\n')
      + '\nFix: say the rung, the health and the owner — WRITTEN · health RED|BLIND — ME — and fix the failing checks; `cwos-pr.js open` re-records health and flips the PR to ready when it is OK. BLIND is never OK. If the word was genuinely not a claim about that PR (quoting, a rejected option), say so in one line and re-send.\n');
  }
  if (claimProblems.length) {
    out.push('Reply held back: it tells Chris something is done, verified or passing without the evidence behind it (WS-941; lexicon evidence family: Observed / Cited / Assumed).\n'
      + claimProblems.map((p) => `  - ${p}`).join('\n')
      + '\nFix: he cannot open the code, so the pointer is his only check. Put it next to the claim, or say plainly that it is Assumed. If the word was not a claim (quoting, a plan), reword it and re-send.\n');
  }
  if (linkProblems.length) {
    out.push('Reply held back: it tells Chris work reached him (merged, live, deployed, a desk card closed) without the link to the live result (WS-986; founder ruling 2026-10-17).\n'
      + linkProblems.map((p) => `  - ${p}`).join('\n')
      + '\nFix: the link is what ends his re-checking. Put it beside the claim, in the same paragraph or the next. If it was not a claim (a plan, a premise), reword it and re-send.\n');
  }
  process.stderr.write(out.join('\n'));
  return 2;
}

function logMiss(input, problems) {
  try {
    const dir = path.join(os.homedir(), '.claude', 'founder-cmd');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'misses.jsonl'), JSON.stringify({
      ts: new Date().toISOString(), session: input.session_id || null, cwd: input.cwd || null,
      resent: Boolean(input.stop_hook_active), problems,
    }) + '\n');
  } catch { /* logging must never break the hook */ }
}

// ---------------------------------------------------------------------------

function main() {
  const { values, sub, positionals } = cliGate(process.argv.slice(2), CLI);
  if (sub === 'give') return runGive(values, positionals);
  if (sub === 'check-reply') return runCheckReply();
  process.stderr.write(`cwos-founder-cmd: unknown or missing subcommand; see --help\n`);
  return 2;
}

if (require.main === module) process.exitCode = main();

module.exports = {
  validateCommand, fencedBlocks, currentTurn, judgeReply, giveBlock, MARKER,
  findPrClaims, judgeHealthClaims, loadPrHealth, prRefs,
  findUnbackedClaims, judgeClosingClaims,
  findLiveClaims, findUnlinkedLiveClaims, judgeLiveLinks,
};
