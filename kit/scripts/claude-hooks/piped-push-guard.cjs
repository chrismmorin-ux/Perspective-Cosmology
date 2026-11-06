#!/usr/bin/env node
/**
 * piped-push-guard.cjs — PreToolUse(Bash) hook. A `git push` whose output is piped into a
 * filter is refused (WS-1172, MIS-067).
 *
 * THE MISTAKE, TWICE. An agent ran `git push ... 2>&1 | tail -3`. A shell pipeline reports
 * the exit status of its LAST command, so the pre-push gate's refusal came back as exit 0
 * from `tail`, and the agent reported a push that had not happened. Recorded in
 * claude-poker-tracker as MIS-067, as a repeat: the prose lesson had already failed once.
 * A filter that closes early (`head -1`) can also SIGPIPE git mid-push. So the boundary
 * moves from prose to this hook.
 *
 * WHAT IS REFUSED. In any pipeline, a stage that runs `git [global options] push` followed
 * by a stage whose command is one of FILTERS. Pipes inside `( … )`, `{ …; }` and `$( … )`
 * count. WHAT IS NOT: `git push` alone, `git push > push.log 2>&1` (any redirect to a file),
 * a pipe on a different command in the same line, and text that only MENTIONS a push —
 * quoted strings, heredoc bodies and comments are blanked before anything is parsed.
 *
 * Exit 2 blocks with the reason on stderr; exit 0 allows. FAILS OPEN on an unreadable
 * payload or an internal error: a broken guard must never strand a session.
 */
'use strict';

const FILTERS = new Set(['tail', 'head', 'grep', 'egrep', 'fgrep', 'rg', 'sed', 'awk', 'gawk', 'less', 'more', 'tee', 'cut', 'wc']);

/** Drop heredoc bodies: everything after a `<<WORD` line up to the line that is WORD. */
function stripHeredocs(src) {
  const lines = String(src).split(/\r?\n/);
  const out = [];
  let end = null;
  let dash = false;
  for (const line of lines) {
    if (end !== null) {
      if ((dash ? line.replace(/^\t+/, '') : line).trim() === end) end = null;
      out.push('');
      continue;
    }
    out.push(line);
    const m = line.match(/(?<!<)<<(?!<)(-?)\s*(['"]?)([A-Za-z_][\w.-]*)\2/);
    if (m) { dash = m[1] === '-'; end = m[3]; }
  }
  return out.join('\n');
}

/** Blank quoted text and comments, keeping the shell structure (operators, parens) intact. */
function blankQuotesAndComments(src) {
  let out = '';
  let i = 0;
  const s = String(src);
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') { out += '__'; i += 2; continue; }
    if (c === "'") {
      const j = s.indexOf("'", i + 1);
      out += "''";
      i = j < 0 ? s.length : j + 1;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < s.length && s[j] !== '"') j += s[j] === '\\' ? 2 : 1;
      out += '""';
      i = j + 1;
      continue;
    }
    if (c === '#' && (i === 0 || /[\s;&|(]/.test(s[i - 1]))) {
      while (i < s.length && s[i] !== '\n') i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * Split at depth 0 into pipelines (on ; & && || newline) and each pipeline into stages
 * (on | and |&). Bracketed spans `( … )`, `$( … )`, `{ … }` stay inside their stage and
 * are returned separately so they are checked as pipelines of their own.
 */
function parse(src) {
  const pipelines = [];
  const nested = [];
  let stages = [];
  let cur = '';
  let depth = 0;
  let open = -1;
  const endStage = () => { stages.push(cur); cur = ''; };
  const endPipeline = () => { endStage(); if (stages.some((x) => x.trim())) pipelines.push(stages); stages = []; };
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    // `{` opens a group only where a command can start, or as `${`; brace expansion does not.
    if (c === '(' || (c === '{' && /(^|[\s;&|($])$/.test(src.slice(0, i)))) {
      if (depth === 0) open = i + 1;
      depth++;
      cur += c;
      continue;
    }
    if ((c === ')' || c === '}') && depth > 0) {
      depth--;
      if (depth === 0) nested.push(src.slice(open, i));
      cur += c;
      continue;
    }
    if (depth > 0) { cur += c; continue; }
    if (c === '|' && src[i + 1] === '|') { endPipeline(); i++; continue; }
    if (c === '|') { endStage(); if (src[i + 1] === '&') i++; continue; }
    if (c === '&' && src[i + 1] === '&') { endPipeline(); i++; continue; }
    if (c === '&' && src[i - 1] !== '>' && src[i + 1] !== '>') { endPipeline(); continue; }
    if (c === ';' || c === '\n') { endPipeline(); continue; }
    cur += c;
  }
  endPipeline();
  return { pipelines, nested };
}

const GIT_PUSH = /(^|[\s;&|({`])(?:[A-Za-z_]\w*=\S*\s+)*(?:\S*[\\/])?git(?:\.exe)?((?:\s+(?:-C\s+\S+|-c\s+\S+|--[\w-]+(?:=\S+)?|-[pP]))*)\s+push(?=$|[\s;&|)}])/;

/** The command word a stage starts with: past brackets, env assignments and `command`/`exec`. */
function firstWord(stage) {
  const words = String(stage).replace(/^[\s({]+/, '').split(/\s+/).filter(Boolean);
  let k = 0;
  while (k < words.length && (/^[A-Za-z_]\w*=/.test(words[k]) || words[k] === 'command' || words[k] === 'exec')) k++;
  const w = words[k] || '';
  return w.replace(/[`)}]+$/, '').replace(/^.*[\\/]/, '').replace(/\.exe$/i, '');
}

/** null when the command is allowed; otherwise { filter } naming what the push was piped into. */
function findPipedPush(command) {
  const clean = blankQuotesAndComments(stripHeredocs(command));
  const queue = [clean];
  let guard = 0;
  while (queue.length && guard++ < 200) {
    const { pipelines, nested } = parse(queue.shift());
    for (const stages of pipelines) {
      for (let i = 0; i < stages.length - 1; i++) {
        if (!GIT_PUSH.test(stages[i])) continue;
        const filter = firstWord(stages[i + 1]);
        if (FILTERS.has(filter)) return { filter };
      }
    }
    queue.push(...nested);
  }
  return null;
}

function message(filter) {
  return [
    `BLOCKED (MIS-067): \`git push\` is piped into \`${filter}\`.`,
    '',
    `  A pipeline reports the exit status of its LAST command, so a push the pre-push gate`,
    `  refused (or the remote rejected) comes back as ${filter}'s exit 0 and reads as success.`,
    `  That is MIS-067, recorded twice. A filter that exits early can also kill git mid-push.`,
    '',
    '  Redirect to a file instead, then read it and confirm:',
    '    git push <args> > push.log 2>&1; echo "push exit $?"; tail -20 push.log',
    '    git status -sb',
  ].join('\n');
}

function main() {
  let command = '';
  try {
    const raw = require('node:fs').readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) return 0;
    const p = JSON.parse(raw);
    command = (p && p.tool_input && p.tool_input.command) || '';
  } catch { return 0; } // unparseable payload: not ours to judge
  if (!/\bpush\b/.test(command)) return 0;
  const hit = findPipedPush(command);
  if (!hit) return 0;
  process.stderr.write(message(hit.filter) + '\n');
  return 2;
}

module.exports = { findPipedPush, FILTERS };

if (require.main === module) {
  let code = 0;
  try { code = main(); } catch { code = 0; }
  process.exit(code);
}
