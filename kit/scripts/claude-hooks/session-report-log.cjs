#!/usr/bin/env node
/**
 * session-report-log — Stop hook: keep what this session last told the founder.
 *
 * The last message of a session was not a file, so what he was told could not be
 * recalled or graded (edge-repo-founder, gap "the deck log", WS-945). This hook
 * writes the assistant text of the turn that just ended to ONE file per session,
 * .claude/workstream/reports/<date>-<session8>.md, overwritten every turn. The
 * last write is therefore the session's final report.
 *
 * Recording only. Grading it with cwos-voice waits for its own item (behind the
 * WS-1061 census freeze). The file sits in the workstream dir, so
 * cwos-state-autocommit carries it at the next session start, and
 * clean-tree-check treats it as hook-written rather than this session's work.
 *
 * Bounded: only the newest 200 reports are kept (headless runs fire Stop too).
 * Opt out per repo with `session_report_log: false` in .cwos-config.yaml.
 * Never blocks: always exits 0.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const MAX_CHARS = 20000;
// Headless runs fire Stop too, so the log is bounded: the newest KEEP files stay.
const KEEP = 200;

/** Assistant text since the last real user message (tool results are not user messages). */
function lastTurnText(transcriptPath) {
  const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  const texts = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    let e;
    try { e = JSON.parse(lines[i]); } catch { continue; }
    const msg = e.message || {};
    const content = Array.isArray(msg.content) ? msg.content : (typeof msg.content === 'string' ? [{ type: 'text', text: msg.content }] : []);
    if (e.type === 'user') {
      const isToolResult = content.length && content.every((c) => c.type === 'tool_result');
      if (!isToolResult && !e.isMeta) break;
      continue;
    }
    if (e.type === 'assistant') {
      for (const c of content) if (c.type === 'text' && c.text) texts.unshift(c.text);
    }
  }
  return texts.join('\n\n').trim();
}

function optedOut(root) {
  try {
    const cfg = fs.readFileSync(path.join(root, '.cwos-config.yaml'), 'utf8');
    return /^session_report_log:\s*false\b/m.test(cfg);
  } catch { return false; }
}

/** One file per session: reuse the one this session already started, else name it by today's date. */
function reportPath(dir, sessionId, now) {
  const short = String(sessionId).slice(0, 8);
  try {
    const hit = fs.readdirSync(dir).find((f) => f.endsWith(`-${short}.md`));
    if (hit) return path.join(dir, hit);
  } catch { /* no dir yet */ }
  return path.join(dir, `${now.toISOString().slice(0, 10)}-${short}.md`);
}

function prune(dir) {
  const files = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)).sort();
  for (const f of files.slice(0, Math.max(0, files.length - KEEP))) {
    try { fs.unlinkSync(path.join(dir, f)); } catch { /* best effort */ }
  }
}

/**
 * What git and the transcript MEASURE at this turn end. A session's handoff is
 * checked against these, never against its own account of git (session-handoff).
 * Each figure is null when unreadable: unknown is not zero.
 */
function measureFacts(repoDir, transcriptPath, sessionId) {
  const { execFileSync } = require('child_process');
  const git = (args) => execFileSync('git', args, { cwd: repoDir, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
  const facts = { branch: null, dirty: null, unpushed: null, contextTokens: null };
  try { facts.branch = git(['branch', '--show-current']).trim() || null; } catch { /* not a repo */ }
  try {
    // The same excusals clean-tree-check applies, so "dirty" means the same thing to both hooks.
    let isHookWritten = () => false;
    let porcelainPath = (l) => l.slice(3);
    try { ({ isHookWritten, porcelainPath } = require('./clean-tree-check.cjs')); } catch { /* count everything */ }
    const lines = git(['status', '--porcelain', '--untracked-files=all']).split('\n').filter(Boolean);
    facts.dirty = lines.filter((l) => !isHookWritten(porcelainPath(l), sessionId)).length;
  } catch { /* unknown */ }
  // Commits no remote has: the at-risk count whether or not the branch has an upstream.
  try { facts.unpushed = parseInt(git(['rev-list', '--count', 'HEAD', '--not', '--remotes']).trim(), 10); } catch { /* unknown */ }
  try {
    const { lastContextTokens } = require('../lib/session-handoff');
    const st = fs.statSync(transcriptPath);
    const len = Math.min(st.size, 256 * 1024);
    const fd = fs.openSync(transcriptPath, 'r');
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, st.size - len);
    fs.closeSync(fd);
    facts.contextTokens = lastContextTokens(buf.toString('utf8'));
  } catch { /* unknown */ }
  return facts;
}

/** Frontmatter lines for the rolling handoff, or '' when the lib is missing (older kit). */
function handoffLines(prevText, text, facts, nowIso) {
  try {
    const H = require('../lib/session-handoff');
    const prev = prevText ? H.fromFrontmatter(prevText) : null;
    const rec = H.rollHandoff(prev, H.parseHandoff(text), facts, nowIso);
    return H.toFrontmatter(rec);
  } catch { return ''; }
}

function record(input, { cwd = process.cwd(), now = new Date() } = {}) {
  if (!input || !input.transcript_path || !input.session_id) return null;
  const { findWorkstreamDir, writeFileAtomic } = require('../lib/cwos-utils');
  const ws = findWorkstreamDir(input.cwd || cwd);
  if (!ws) return null;
  if (optedOut(path.resolve(ws, '..', '..'))) return null;
  let text = lastTurnText(input.transcript_path);
  if (!text) return null;
  if (text.length > MAX_CHARS) text = `${text.slice(0, MAX_CHARS)}\n\n[... cut at ${MAX_CHARS} characters]`;
  const dir = path.join(ws, 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const file = reportPath(dir, input.session_id, now);
  let prev = null;
  try { prev = fs.readFileSync(file, 'utf8'); } catch { /* first turn */ }
  // Git is measured in the checkout the session stands in (a worktree's own branch),
  // while the report lives in the main tree's workstream.
  const facts = measureFacts(input.cwd || cwd, input.transcript_path, input.session_id);
  const extra = handoffLines(prev, text, facts, now.toISOString());
  const body = `---\nsession: ${input.session_id}\nupdated_at: ${now.toISOString()}\n${extra ? `${extra}\n` : ''}---\n\n${text}\n`;
  const stable = (s) => s.replace(/^updated_at: .*$/m, '').replace(/^facts: .*$/m, '').replace(/"at":"[^"]*"/g, '');
  if (prev && stable(prev) === stable(body)) return file;
  writeFileAtomic(file, body);
  prune(dir);
  return file;
}

function main() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* not a hook call */ }
  try { record(input); } catch { /* never block a session from ending */ }
}

if (require.main === module) main();

module.exports = { lastTurnText, record, reportPath, measureFacts };
