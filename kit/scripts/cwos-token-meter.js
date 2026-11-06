#!/usr/bin/env node
/**
 * cwos-token-meter — where a repo's Claude Code tokens go, measured from the
 * transcripts on disk rather than estimated (WS-1099, prog-token-economy).
 *
 * Claude Code writes every session to <config>/projects/<project-dir>/<uuid>.jsonl
 * (subagents under <uuid>/subagents/). Assistant lines carry message.usage. One
 * reply is written as several lines with the SAME message.id, so usage is
 * counted once per message.id: summing lines over-counts ~2.3x (measured
 * 2026-10-11: 907 usage lines, 399 replies). Which line's usage to keep matters
 * too: in subagent transcripts output_tokens GROWS line by line and only the last
 * line is complete, so the meter keeps the field-wise MAX per message id. Keeping
 * the first line (the WS-1099 rule) undercounted subagent output ~6x (WS-1169;
 * evidence in lib/transcript-usage.js).
 *
 *   cwos-token-meter                     this repo, human report
 *   cwos-token-meter --since 2026-10-01  only replies on/after then (sessions untouched since are skipped)
 *   cwos-token-meter --until 2026-10-08  only replies before then
 *   cwos-token-meter --all               every project dir under the config root
 *   cwos-token-meter --write             also record a dated baseline under
 *                                        .claude/workstream/telemetry/token-meter/
 *   cwos-token-meter --json
 *
 * What it reports, per scope:
 *   - totals: uncached input, cache write, cache read, output (main + subagents)
 *   - list-price equivalent (WS-1305): dollars per token kind, cache writes
 *     priced by their recorded TTL (a 5m-1h range where none was recorded),
 *     per model and per session; prices live only in lib/model-pricing.js and
 *     anything it cannot price is listed as UNPRICED, never counted as $0
 *   - by model, main vs subagent; by repo; by account (config dir, from each
 *     config dir's history.jsonl — lanes share one projects folder, so location
 *     cannot say which account ran a session)
 *   - delegation: Agent dispatches per 100 main replies, the share that named a
 *     model, and requested -> actual model
 *   - startup prefix: context tokens on each session's first reply, and the
 *     composition of what was loaded before it, in chars and ~tokens
 *   - context per reply: mean and peak — what a long session re-sends each turn
 *   - tool-result volume by tool, with Bash/PowerShell calls attributed to the
 *     cwos-* script they ran, and slash-command bodies by command
 *
 * Chars are converted at ~4 chars/token and labelled "~"; usage numbers are exact.
 * Transcripts are streamed, never read whole. Read-only unless --write.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const os = require('os');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { mergeUsageMax, forEachLine, projectLabel } = require('./lib/transcript-usage');
const pricing = require('./lib/model-pricing');

const CLI = {
  name: 'cwos-token-meter',
  summary: 'measure where Claude Code tokens go, from the transcripts on disk',
  usage: 'cwos-token-meter [--repo <path>] [--all] [--since <date>] [--until <date>] [--root <dir>] [--top <n>] [--write] [--json]',
  flags: {
    repo: { type: 'string', describe: 'repo whose transcripts to read (default: cwd)' },
    all: { type: 'boolean', describe: 'read every project dir under the transcripts root' },
    since: { type: 'string', describe: 'count only replies on/after this date (ISO); sessions untouched since are skipped' },
    until: { type: 'string', describe: 'count only replies before this date (ISO)' },
    root: { type: 'string', describe: 'transcripts root (default: $CLAUDE_CONFIG_DIR/projects or ~/.claude/projects)' },
    top: { type: 'string', describe: 'rows per breakdown table (default 12)' },
    write: { type: 'boolean', describe: 'record a dated baseline under .claude/workstream/telemetry/token-meter/' },
    json: { type: 'boolean', describe: 'machine-readable output' },
  },
};

const CHARS_PER_TOKEN = 4;
const SCRIPT_RE = /(cwos-[a-z0-9-]+)\.(?:js|py)/;
const COMMAND_RE = /<command-name>\/?([^<\s]+)<\/command-name>/;
const DISPATCH_TOOLS = new Set(['Agent', 'Task']);
const UNATTRIBUTED = 'unattributed (session in no config dir history)';

// ─── locating transcripts ───────────────────────────────────────────────────

function transcriptsRoot(override) {
  if (override) return path.resolve(override);
  const base = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  return path.join(base, 'projects');
}

/** Same encoding Claude Code uses: every non-alphanumeric char becomes '-'. */
function projectDirName(repoPath) {
  // A drive-letter path is resolved as Windows on every platform: path.resolve
  // on POSIX treats `C:\\Users\\…` as relative and prefixes the cwd.
  const resolve = /^[A-Za-z]:[\\/]/.test(String(repoPath)) ? path.win32.resolve : path.resolve;
  return resolve(repoPath).replace(/[^A-Za-z0-9]/g, '-');
}

function listSessions(projectDir, sinceMs) {
  if (!fs.existsSync(projectDir)) return [];
  const out = [];
  for (const f of fs.readdirSync(projectDir)) {
    if (!f.endsWith('.jsonl')) continue;
    const file = path.join(projectDir, f);
    const st = fs.statSync(file);
    const id = f.slice(0, -'.jsonl'.length);
    const subDir = path.join(projectDir, id, 'subagents');
    const subagents = fs.existsSync(subDir)
      ? fs.readdirSync(subDir).filter((s) => s.endsWith('.jsonl')).map((s) => path.join(subDir, s))
      : [];
    // A session is skipped only when neither it nor any of its subagents changed since the window opened.
    const latest = Math.max(st.mtimeMs, ...subagents.map((s) => { try { return fs.statSync(s).mtimeMs; } catch { return 0; } }));
    if (sinceMs && latest < sinceMs) continue;
    out.push({ id, file, mtime: new Date(st.mtimeMs).toISOString(), subagents });
  }
  return out;
}

// ─── parsing one transcript ─────────────────────────────────────────────────

function emptyUsage() {
  return { input: 0, cache_write: 0, cache_write_5m: 0, cache_write_1h: 0, cache_read: 0, output: 0, replies: 0 };
}

function addUsage(acc, u) {
  acc.input += u.input_tokens || 0;
  acc.cache_write += u.cache_creation_input_tokens || 0;
  acc.cache_write_5m += u.cache_write_5m || 0;
  acc.cache_write_1h += u.cache_write_1h || 0;
  acc.cache_read += u.cache_read_input_tokens || 0;
  acc.output += u.output_tokens || 0;
  acc.replies += 1;
}

function sumInto(acc, u) {
  for (const k of Object.keys(acc)) acc[k] += u[k] || 0;
  return acc;
}

const usageTokens = (u) => u.input + u.cache_write + u.cache_read + u.output;
const contextOf = (u) => (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
const sizeOf = (v) => (typeof v === 'string' ? v.length : JSON.stringify(v == null ? '' : v).length);
const bump = (map, key, n) => { map[key] = (map[key] || 0) + n; };

function toolLabel(block) {
  const name = block.name || '?';
  if (name === 'Bash' || name === 'PowerShell') {
    const m = String((block.input && block.input.command) || '').match(SCRIPT_RE);
    if (m) return `script:${m[1]}`;
  }
  if (name === 'Skill' && block.input && block.input.skill) return `skill:${block.input.skill}`;
  return name;
}

/**
 * Parse one transcript file, streamed (never held whole in memory).
 *
 * Usage is the field-wise MAX over each message id's lines. opts.sinceMs /
 * opts.untilMs window the reply-level figures (usage, byModel, contexts,
 * agentCalls) by the timestamp of a reply's first line; with a window set, a
 * line with no timestamp is outside it. firstContext, prefix and tool volume
 * describe the whole session and are not windowed. '<synthetic>' replies are
 * written by Claude Code itself, not by an API call, and are not counted.
 */
function parseTranscript(file, opts = {}) {
  const { sinceMs = null, untilMs = null } = opts;
  const windowed = sinceMs != null || untilMs != null;
  const inWindow = (ts) => {
    if (!windowed) return true;
    const t = ts ? Date.parse(ts) : NaN;
    if (Number.isNaN(t)) return false;
    return (sinceMs == null || t >= sinceMs) && (untilMs == null || t < untilMs);
  };
  const replies = new Map();
  const order = [];
  const prefix = {};
  const toolChars = {};
  const toolCalls = {};
  const commandChars = {};
  const pending = new Map();
  const agentCalls = new Map();
  const resolved = {};
  let firstContext = null;
  let pendingCommand = null;
  let anon = 0;
  let entrypoint = null;

  const ok = forEachLine(file, (line) => {
    let j;
    try { j = JSON.parse(line); } catch { return; }
    const m = j.message;
    const before = firstContext === null;
    if (entrypoint === null && typeof j.entrypoint === 'string') entrypoint = j.entrypoint;

    if (j.type === 'attachment' && j.attachment && before) {
      const a = j.attachment;
      const key = a.hookName ? `hook:${a.hookName}` : a.type;
      bump(prefix, key, sizeOf(a));
    }

    if (j.type === 'assistant' && m) {
      const model = m.model || 'unknown';
      if (Array.isArray(m.content)) {
        for (const c of m.content) {
          if (!c || c.type !== 'tool_use') continue;
          const label = toolLabel(c);
          pending.set(c.id, label);
          bump(toolCalls, label, 1);
          if (DISPATCH_TOOLS.has(c.name) && !agentCalls.has(c.id)) {
            const input = c.input || {};
            agentCalls.set(c.id, {
              id: c.id,
              requested: typeof input.model === 'string' && input.model ? input.model : null,
              subagent_type: input.subagent_type || null,
              parent_model: model,
              in_window: inWindow(j.timestamp),
            });
          }
        }
      }
      if (m.usage && model !== '<synthetic>') {
        const key = m.id || `line:${j.uuid || anon++}`;
        let r = replies.get(key);
        if (!r) {
          r = { usage: null, model, inWindow: inWindow(j.timestamp) };
          replies.set(key, r);
          order.push(r);
        }
        r.usage = mergeUsageMax(r.usage, m.usage);
        if (firstContext === null) firstContext = contextOf(m.usage);
      }
    }

    if (j.type === 'user' && m) {
      const content = m.content;
      const tur = j.toolUseResult;
      if (tur && typeof tur === 'object' && tur.resolvedModel && Array.isArray(content)) {
        for (const c of content) if (c && c.tool_use_id) resolved[c.tool_use_id] = tur.resolvedModel;
      }
      if (typeof content === 'string') {
        const cm = content.match(COMMAND_RE);
        if (cm) pendingCommand = cm[1];
        if (before) bump(prefix, 'user_prompt', content.length);
      } else if (Array.isArray(content)) {
        for (const c of content) {
          if (c && c.type === 'tool_result') {
            bump(toolChars, pending.get(c.tool_use_id) || 'unattributed', sizeOf(c.content));
          } else if (c && c.type === 'text') {
            const cm = String(c.text || '').match(COMMAND_RE);
            if (cm) { pendingCommand = cm[1]; continue; }
            if (pendingCommand) {
              bump(commandChars, `/${pendingCommand}`, String(c.text || '').length);
              if (before) bump(prefix, `command:/${pendingCommand}`, String(c.text || '').length);
              pendingCommand = null;
            } else if (before) {
              bump(prefix, 'user_prompt', String(c.text || '').length);
            }
          }
        }
      }
    }
  });
  if (!ok) return null;

  // A reply's final usage is only known once all of its lines have been read.
  const usage = emptyUsage();
  const byModel = {};
  const byPrice = {};
  const contexts = [];
  for (const r of order) {
    if (!r.inWindow) continue;
    addUsage(usage, r.usage);
    addUsage(byModel[r.model] || (byModel[r.model] = emptyUsage()), r.usage);
    const pk = pricing.priceKey(r.model, r.usage);
    addUsage(byPrice[pk] || (byPrice[pk] = emptyUsage()), r.usage);
    contexts.push(contextOf(r.usage));
  }
  const calls = [...agentCalls.values()].filter((c) => c.in_window)
    .map(({ in_window: _w, ...c }) => ({ ...c, actual: resolved[c.id] || null }));

  return { usage, byModel, byPrice, firstContext, contexts, prefix, toolChars, toolCalls, commandChars, agentCalls: calls, entrypoint };
}

// ─── aggregation ────────────────────────────────────────────────────────────

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

function mergeInto(target, src) {
  for (const [k, v] of Object.entries(src)) bump(target, k, v);
}

const pct = (n, d) => (d ? Math.round((1000 * n) / d) / 10 : null);

/** Delegation summary over a list of agent calls and the main-reply count they came from. */
function delegationSummary(calls, mainReplies) {
  const fromMain = calls.filter((c) => c.scope === 'main');
  const named = calls.filter((c) => c.requested);
  const requested = {};
  const actual = {};
  const pairs = {};
  for (const c of calls) {
    const req = c.requested || '(inherit)';
    const act = c.actual || '(no result seen)';
    bump(requested, req, 1);
    bump(actual, act, 1);
    bump(pairs, `${req} -> ${act}`, 1);
  }
  return {
    agent_calls: calls.length,
    from_main: fromMain.length,
    from_subagents: calls.length - fromMain.length,
    main_replies: mainReplies,
    per_100_replies: mainReplies ? Math.round((1000 * fromMain.length) / mainReplies) / 10 : null,
    named_model: named.length,
    named_pct: pct(named.length, calls.length),
    requested, actual, requested_to_actual: pairs,
  };
}

/**
 * List-price-equivalent cost over [priceKey, usage] pairs (WS-1305). Prices
 * come from lib/model-pricing.js only. Anything it cannot price is listed with
 * its token count and reason, never folded into the total as zero.
 */
function priceSummary(pairs) {
  const kinds = { input: 0, write_low: 0, write_high: 0, read: 0, output: 0 };
  const byKey = [];
  const unpriced = [];
  let low = 0;
  let high = 0;
  let ttlUnknown = 0;
  for (const [key, u] of pairs) {
    const tokens = usageTokens(u);
    if (!tokens) continue;
    const c = pricing.costOf(key, u);
    if (!c) {
      const reason = / \(fast mode\)$/.test(key) ? 'fast-mode cache rates are not published'
        : 'model not in the price table';
      unpriced.push({ key, tokens, reason });
      continue;
    }
    for (const k of Object.keys(kinds)) kinds[k] += c[k];
    low += c.total_low;
    high += c.total_high;
    ttlUnknown += c.write_ttl_unknown_tokens;
    byKey.push({ key, priced_as: c.priced_as, read_basis: c.read_basis, tokens, total_low: c.total_low, total_high: c.total_high,
      read: c.read, write_low: c.write_low, write_high: c.write_high });
  }
  byKey.sort((a, b) => b.total_high - a.total_high);
  return {
    basis: 'list-price equivalent (USD), not spend and not plan usage',
    prices_as_of: pricing.PRICES_AS_OF,
    prices_source: pricing.PRICES_SOURCE,
    total_low: low, total_high: high,
    by_kind: kinds,
    write_ttl_unknown_tokens: ttlUnknown,
    by_key: byKey,
    unpriced,
    unpriced_tokens: unpriced.reduce((s, x) => s + x.tokens, 0),
  };
}

/**
 * Measure a set of project dirs.
 * opts.untilMs — upper bound of the reply window.
 * opts.accountOf(sessionId) -> account label, or null when unknown. When the
 *   function is absent, by_account is left empty rather than guessed.
 */
function measure(projectDirs, sinceMs, opts = {}) {
  const { untilMs = null, accountOf = null } = opts;
  const window = { sinceMs, untilMs };
  const main = emptyUsage();
  const sub = emptyUsage();
  const byModel = {};
  const byPrice = {};
  const byRepo = {};
  const byAccount = {};
  const calls = [];
  const firstContexts = [];
  const allContexts = [];
  const prefixSamples = [];
  const toolChars = {};
  const toolCalls = {};
  const commandChars = {};
  const sessions = [];

  const priceRow = (k) => byPrice[k] || (byPrice[k] = { main: emptyUsage(), subagents: emptyUsage() });
  const modelRow = (m) => byModel[m] || (byModel[m] = { main: emptyUsage(), subagents: emptyUsage() });
  const groupRow = (map, k) => map[k] || (map[k] = { sessions: 0, main: emptyUsage(), subagents: emptyUsage(), agent_calls: 0 });

  for (const dir of projectDirs) {
    const repo = projectLabel(path.basename(dir));
    for (const s of listSessions(dir, sinceMs)) {
      const t = parseTranscript(s.file, window);
      if (!t) continue;
      const subUsage = emptyUsage();
      const sessPrice = {};
      const subCalls = [];
      for (const f of s.subagents) {
        const st = parseTranscript(f, window);
        if (!st) continue;
        sumInto(subUsage, st.usage);
        for (const [m, u] of Object.entries(st.byModel)) sumInto(modelRow(m).subagents, u);
        for (const [k, u] of Object.entries(st.byPrice)) { sumInto(priceRow(k).subagents, u); sumInto(sessPrice[k] || (sessPrice[k] = emptyUsage()), u); }
        for (const c of st.agentCalls) subCalls.push({ ...c, scope: 'subagent' });
        mergeInto(toolChars, st.toolChars);
        mergeInto(toolCalls, st.toolCalls);
      }
      if (!t.usage.replies && !subUsage.replies) continue;

      sumInto(main, t.usage);
      sumInto(sub, subUsage);
      for (const [m, u] of Object.entries(t.byModel)) sumInto(modelRow(m).main, u);
      for (const [k, u] of Object.entries(t.byPrice)) { sumInto(priceRow(k).main, u); sumInto(sessPrice[k] || (sessPrice[k] = emptyUsage()), u); }
      const sessCost = priceSummary(Object.entries(sessPrice));
      const sessCalls = [...t.agentCalls.map((c) => ({ ...c, scope: 'main' })), ...subCalls];
      calls.push(...sessCalls);

      const account = accountOf ? (accountOf(s.id) || UNATTRIBUTED) : null;
      for (const [map, key] of [[byRepo, repo], ...(account ? [[byAccount, account]] : [])]) {
        const row = groupRow(map, key);
        row.sessions += 1;
        sumInto(row.main, t.usage);
        sumInto(row.subagents, subUsage);
        row.agent_calls += sessCalls.length;
      }

      if (t.firstContext != null) firstContexts.push(t.firstContext);
      allContexts.push(...t.contexts);
      prefixSamples.push(t.prefix);
      mergeInto(toolChars, t.toolChars);
      mergeInto(toolCalls, t.toolCalls);
      mergeInto(commandChars, t.commandChars);
      sessions.push({
        id: s.id, project: path.basename(dir), repo, account, entrypoint: t.entrypoint, mtime: s.mtime, replies: t.usage.replies,
        first_context: t.firstContext, peak_context: t.contexts.length ? Math.max(...t.contexts) : null,
        tokens: usageTokens(t.usage), subagent_tokens: usageTokens(subUsage), subagents: s.subagents.length,
        list_price_low: sessCost.total_low, list_price_high: sessCost.total_high, unpriced_tokens: sessCost.unpriced_tokens,
      });
    }
  }

  // Prefix composition: median chars per component across sessions that loaded it.
  const keys = new Set(prefixSamples.flatMap((p) => Object.keys(p)));
  const prefix = [...keys].map((k) => {
    const vals = prefixSamples.map((p) => p[k]).filter((v) => v);
    return { component: k, sessions: vals.length, median_chars: median(vals), approx_tokens: Math.round(median(vals) / CHARS_PER_TOKEN) };
  }).sort((a, b) => b.median_chars - a.median_chars);

  let ctxSum = 0;
  let ctxPeak = null;
  for (const c of allContexts) { ctxSum += c; if (ctxPeak === null || c > ctxPeak) ctxPeak = c; }
  const meanContext = allContexts.length ? Math.round(ctxSum / allContexts.length) : null;
  const rankGroups = (map) => Object.entries(map)
    .map(([k, v]) => ({ name: k, ...v, tokens: usageTokens(v.main) + usageTokens(v.subagents) }))
    .sort((a, b) => b.tokens - a.tokens);
  return {
    window: { since: sinceMs ? new Date(sinceMs).toISOString() : null, until: untilMs ? new Date(untilMs).toISOString() : null },
    sessions_count: sessions.length,
    main, subagents: sub,
    by_model: Object.entries(byModel)
      .map(([model, v]) => ({ model, ...v, tokens: usageTokens(v.main) + usageTokens(v.subagents), output: v.main.output + v.subagents.output }))
      .sort((a, b) => b.tokens - a.tokens),
    by_repo: rankGroups(byRepo),
    by_account: accountOf ? rankGroups(byAccount) : null,
    delegation: delegationSummary(calls, main.replies),
    cost: priceSummary(Object.entries(byPrice).map(([k, v]) => [k, sumInto(sumInto(emptyUsage(), v.main), v.subagents)])),
    startup: { median_first_context: median(firstContexts), prefix_composition: prefix },
    context_per_reply: { mean: meanContext, median: median(allContexts), peak: ctxPeak },
    tool_results: Object.entries(toolChars).map(([k, v]) => ({ tool: k, calls: toolCalls[k] || 0, chars: v, approx_tokens: Math.round(v / CHARS_PER_TOKEN) }))
      .sort((a, b) => b.chars - a.chars),
    command_bodies: Object.entries(commandChars).map(([k, v]) => ({ command: k, chars: v, approx_tokens: Math.round(v / CHARS_PER_TOKEN) }))
      .sort((a, b) => b.chars - a.chars),
    sessions: sessions.sort((a, b) => b.tokens - a.tokens),
  };
}

/** Every project dir under a transcripts root. */
function allProjectDirs(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).map((d) => path.join(root, d)).filter((d) => { try { return fs.statSync(d).isDirectory(); } catch { return false; } });
}

/** accountOf for the config dirs that share this transcripts root, or null when none can be found. */
function accountResolver(root, lanesFile = null) {
  const { discoverConfigDirs, sessionAccountMap } = require('./lib/claude-accounts');
  let real;
  try { real = fs.realpathSync(root); } catch { return null; }
  const dirs = discoverConfigDirs({ lanesFile }).filter((c) => c.projects && c.projects.toLowerCase() === real.toLowerCase());
  if (!dirs.length) return null;
  const map = sessionAccountMap(dirs);
  return { configDirs: dirs, accountOf: (id) => map.get(id) || null };
}

// ─── output ─────────────────────────────────────────────────────────────────

const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('en-US'));

const money = (n) => `$${n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString('en-US')}`;
/** A dollar figure, or a range when the cache-write TTL was not recorded. */
const usd = (low, high) => (low == null ? '-' : Math.abs(high - low) < 0.005 ? money(low) : `${money(low)}-${money(high)}`);
const share = (part, whole) => (whole ? `${Math.round((100 * part) / whole)}%` : '-');

function renderCost(c, top) {
  const L = [];
  const tot = c.total_high;
  L.push(`List-price equivalent (USD; prices as of ${c.prices_as_of}; not spend, not plan usage):`);
  L.push(`  ${'cache write'.padEnd(32)}${usd(c.by_kind.write_low, c.by_kind.write_high).padStart(18)}  ${share(c.by_kind.write_high, tot).padStart(5)}`);
  L.push(`  ${'cache read'.padEnd(32)}${usd(c.by_kind.read, c.by_kind.read).padStart(18)}  ${share(c.by_kind.read, tot).padStart(5)}`);
  L.push(`  ${'output'.padEnd(32)}${usd(c.by_kind.output, c.by_kind.output).padStart(18)}  ${share(c.by_kind.output, tot).padStart(5)}`);
  L.push(`  ${'uncached input'.padEnd(32)}${usd(c.by_kind.input, c.by_kind.input).padStart(18)}  ${share(c.by_kind.input, tot).padStart(5)}`);
  L.push(`  ${'all priced'.padEnd(32)}${usd(c.total_low, c.total_high).padStart(18)}`);
  if (c.write_ttl_unknown_tokens) L.push(`  ${fmt(c.write_ttl_unknown_tokens)} cache-write tokens had no TTL recorded: priced 5-minute (low) to 1-hour (high).`);
  if (c.by_key.length > 1) {
    L.push('  by model:');
    for (const k of c.by_key.slice(0, top)) L.push(`    ${k.key.padEnd(28)}${usd(k.total_low, k.total_high).padStart(18)}${k.read_basis === 'rule' ? '   (read price = 0.1x input rule)' : ''}`);
  } else if (c.by_key.length === 1 && c.by_key[0].read_basis === 'rule') {
    L.push('  read price is the 0.1x-input rule, not a listed figure.');
  }
  if (c.unpriced.length) {
    L.push(`  UNPRICED (not in the figure above): ${fmt(c.unpriced_tokens)} tokens`);
    for (const u of c.unpriced.slice(0, top)) L.push(`    ${u.key.padEnd(36)}${fmt(u.tokens).padStart(15)}  ${u.reason}`);
  }
  return L;
}

function render(r, scope, top) {
  const L = [];
  L.push(`Token meter — ${scope}`);
  L.push(`  sessions ${r.sessions_count} · replies ${fmt(r.main.replies)} (+${fmt(r.subagents.replies)} subagent)`);
  L.push('');
  L.push('Totals (exact, from usage)            main            subagents');
  for (const [label, k] of [['uncached input', 'input'], ['cache write', 'cache_write'], ['cache read', 'cache_read'], ['output', 'output']]) {
    L.push(`  ${label.padEnd(32)}${fmt(r.main[k]).padStart(14)}${fmt(r.subagents[k]).padStart(18)}`);
  }
  L.push(`  ${'all'.padEnd(32)}${fmt(usageTokens(r.main)).padStart(14)}${fmt(usageTokens(r.subagents)).padStart(18)}`);
  L.push('');
  L.push(...renderCost(r.cost, top));
  L.push('');
  L.push('By model (all tokens · output · replies, main / subagents):');
  for (const m of r.by_model.slice(0, top)) {
    L.push(`    ${m.model.padEnd(28)}${fmt(m.tokens).padStart(15)}  out ${fmt(m.output).padStart(11)}  replies ${fmt(m.main.replies)} / ${fmt(m.subagents.replies)}`);
  }
  const d = r.delegation;
  L.push('');
  L.push(`Delegation: ${fmt(d.agent_calls)} Agent dispatches (${fmt(d.from_main)} from main sessions) = ${d.per_100_replies == null ? 'unknown (no main replies)' : `${d.per_100_replies} per 100 main replies`}`);
  L.push(`  named a model: ${fmt(d.named_model)} (${d.named_pct == null ? '-' : `${d.named_pct}%`}); requested -> actual:`);
  for (const [k, v] of Object.entries(d.requested_to_actual).sort((a, b) => b[1] - a[1]).slice(0, top)) L.push(`    ${k.padEnd(48)}${fmt(v).padStart(6)}`);
  if (r.by_repo.length > 1) {
    L.push('');
    L.push('By repo (all tokens · sessions · dispatches):');
    for (const g of r.by_repo.slice(0, top)) L.push(`    ${g.name.padEnd(36)}${fmt(g.tokens).padStart(15)}  ${String(g.sessions).padStart(4)}  ${String(g.agent_calls).padStart(5)}`);
  }
  if (r.by_account) {
    L.push('');
    L.push('By account (config dir; from each config dir\'s history.jsonl):');
    for (const g of r.by_account) L.push(`    ${g.name.padEnd(48)}${fmt(g.tokens).padStart(15)}  ${String(g.sessions).padStart(4)} sessions`);
  }
  L.push('');
  L.push(`Startup: median context on a session's first reply = ${fmt(r.startup.median_first_context)} tokens`);
  L.push('  loaded before it (median per session that loaded it; ~4 chars/token):');
  for (const p of r.startup.prefix_composition.slice(0, top)) {
    L.push(`    ${p.component.padEnd(44)}~${fmt(p.approx_tokens).padStart(8)}   in ${p.sessions} session(s)`);
  }
  L.push('    (system prompt + tool schemas make up the rest; they are not itemized in transcripts)');
  L.push('');
  L.push(`Context re-sent per reply: mean ${fmt(r.context_per_reply.mean)} · median ${fmt(r.context_per_reply.median)} · peak ${fmt(r.context_per_reply.peak)}`);
  L.push('');
  L.push('Tool-result volume (~tokens, calls):');
  for (const t of r.tool_results.slice(0, top)) L.push(`    ${t.tool.padEnd(44)}~${fmt(t.approx_tokens).padStart(8)}  ${fmt(t.calls).padStart(6)}`);
  if (r.command_bodies.length) {
    L.push('');
    L.push('Slash-command bodies loaded (~tokens, all invocations):');
    for (const c of r.command_bodies.slice(0, top)) L.push(`    ${c.command.padEnd(44)}~${fmt(c.approx_tokens).padStart(8)}`);
  }
  L.push('');
  L.push('Heaviest sessions (main + subagent tokens incl. cache read · list-price equivalent of the same):');
  for (const s of r.sessions.slice(0, Math.min(top, 8))) {
    L.push(`    ${s.id.slice(0, 8)} ${s.mtime.slice(0, 10)}  ${fmt(s.tokens + s.subagent_tokens).padStart(13)}  ${usd(s.list_price_low, s.list_price_high).padStart(17)}  replies ${String(s.replies).padStart(4)}  peak ctx ${fmt(s.peak_context)}${s.subagents ? `  +${s.subagents} subagents` : ''}${s.unpriced_tokens ? `  (${fmt(s.unpriced_tokens)} tokens unpriced)` : ''}`);
  }
  return L.join('\n');
}

// ─── main ───────────────────────────────────────────────────────────────────

function parseDateFlag(name, v) {
  if (!v) return null;
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) { console.error(`cwos-token-meter: --${name} "${v}" is not a date`); process.exit(2); }
  return ms;
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const root = transcriptsRoot(values.root);
  const top = values.top ? parseInt(values.top, 10) : 12;
  if (!Number.isInteger(top) || top < 1) { console.error('cwos-token-meter: --top must be a positive integer'); process.exit(2); }
  const sinceMs = parseDateFlag('since', values.since);
  const untilMs = parseDateFlag('until', values.until);

  let dirs;
  let scope;
  if (values.all) {
    dirs = allProjectDirs(root);
    scope = `all projects under ${root}`;
  } else {
    const repo = values.repo || process.cwd();
    dirs = [path.join(root, projectDirName(repo))];
    scope = path.resolve(repo);
  }
  if (sinceMs) scope += ` since ${values.since}`;
  if (untilMs) scope += ` until ${values.until}`;

  const accounts = accountResolver(root);
  const report = measure(dirs, sinceMs, { untilMs, accountOf: accounts ? accounts.accountOf : null });
  report.measured_at = new Date().toISOString();
  report.scope = scope;
  report.root = root;

  if (values.write) {
    const { findWorkstreamDir, writeFileAtomic } = require('./lib/cwos-utils');
    const outDir = path.join(findWorkstreamDir(), 'telemetry', 'token-meter');
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, `${report.measured_at.slice(0, 10)}${values.all ? '-all' : ''}.json`);
    const { sessions, ...summary } = report;
    summary.heaviest_sessions = sessions.slice(0, 10);
    writeFileAtomic(out, JSON.stringify(summary, null, 2) + '\n', { skipSizeGate: true });
    if (!values.json) console.error(`baseline written: ${path.relative(process.cwd(), out)}`);
  }

  if (values.json) console.log(JSON.stringify(report, null, 2));
  else console.log(render(report, scope, top));
}

if (require.main === module) main();

module.exports = { parseTranscript, measure, priceSummary, projectDirName, transcriptsRoot, allProjectDirs, accountResolver, delegationSummary, usageTokens, UNATTRIBUTED };
