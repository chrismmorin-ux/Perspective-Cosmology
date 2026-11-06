/**
 * transcript-usage — the shared rules for reading usage out of Claude Code
 * transcripts (WS-1169). Zero dependencies. Pure CommonJS.
 *
 * THE DEDUPE RULE, MEASURED 2026-10-15. Claude Code writes one reply as several
 * transcript lines with the same message.id while the content streams. In MAIN
 * transcripts every line repeats the same usage. In SUBAGENT transcripts the
 * input/cache fields repeat but output_tokens GROWS line by line, and only the
 * last line (the one carrying stop_reason) holds the full count. Measured over
 * 380 transcripts touched since 2026-10-10: 10,137 subagent replies, 2,249 with
 * growing output; first-line output summed to 348,078, last-line and max-line
 * both to 2,142,783 (6.2x), and in 0 replies was the last line below the max.
 * So usage is the field-wise MAX over a message id's lines: equal to the last
 * line on every reply measured, and still right if lines ever arrive out of order.
 * Keeping the first line (the previous rule) undercounted subagent output ~6x.
 */

'use strict';

const fs = require('fs');

const USAGE_FIELDS = ['input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens'];

/**
 * Field-wise max of two usage objects (either may be null). Returns a new object.
 * Also carries the cache-write split by TTL, flattened to cache_write_5m /
 * cache_write_1h (from usage.cache_creation.ephemeral_*_input_tokens, or the
 * already-flattened fields of a previous merge), and speed ('fast' if any line
 * says so). The split fields are absent from older transcripts and stay 0;
 * pricing treats the unsplit remainder as TTL-unknown (WS-1305).
 */
function mergeUsageMax(prev, u) {
  const out = {};
  for (const k of USAGE_FIELDS) out[k] = Math.max((prev && prev[k]) || 0, (u && u[k]) || 0);
  const split = (x, flat, nested) => (x && (x[flat] || (x.cache_creation && x.cache_creation[nested]))) || 0;
  out.cache_write_5m = Math.max(split(prev, 'cache_write_5m', 'ephemeral_5m_input_tokens'), split(u, 'cache_write_5m', 'ephemeral_5m_input_tokens'));
  out.cache_write_1h = Math.max(split(prev, 'cache_write_1h', 'ephemeral_1h_input_tokens'), split(u, 'cache_write_1h', 'ephemeral_1h_input_tokens'));
  if ((prev && prev.speed === 'fast') || (u && u.speed === 'fast')) out.speed = 'fast';
  return out;
}

const usageTotal = (u) => USAGE_FIELDS.reduce((s, k) => s + ((u && u[k]) || 0), 0);

/**
 * Call fn(line) for every line of a file without holding the file in memory.
 * Reads fixed-size chunks and only decodes complete lines, so a multi-byte
 * UTF-8 character split across a chunk boundary is never corrupted.
 * Returns false when the file could not be opened.
 */
function forEachLine(file, fn, chunkSize = 1 << 20) {
  let fd;
  try { fd = fs.openSync(file, 'r'); } catch { return false; }
  const buf = Buffer.allocUnsafe(chunkSize);
  let carry = null;
  try {
    for (;;) {
      const n = fs.readSync(fd, buf, 0, chunkSize, null);
      if (n <= 0) break;
      let chunk = buf.subarray(0, n);
      if (carry) { chunk = Buffer.concat([carry, chunk]); carry = null; }
      let start = 0;
      for (let i = chunk.indexOf(10, start); i !== -1; i = chunk.indexOf(10, start)) {
        if (i > start) fn(chunk.toString('utf8', start, i));
        start = i + 1;
      }
      if (start < chunk.length) carry = Buffer.from(chunk.subarray(start));
    }
    if (carry && carry.length) fn(carry.toString('utf8'));
  } finally {
    fs.closeSync(fd);
  }
  return true;
}

/**
 * A readable label for a Claude Code project dir name. Worktree dirs fold into
 * their repo; scratchpad clones fold into one bucket. Lossy by construction (the
 * dir encoding maps every non-alphanumeric char to '-'), so it is a label, not a path.
 */
function projectLabel(dirName) {
  let s = String(dirName);
  let suffix = '';
  const wt = s.search(/--claude-worktrees-/);
  if (wt !== -1) { s = s.slice(0, wt); suffix = ' (worktrees)'; }
  if (/-AppData-Local-Temp-/.test(s)) return 'scratchpad clones';
  const m = s.match(/^[A-Za-z]--Users-[^-]+-repos-(.+)$/);
  if (m) return m[1] + suffix;
  const home = s.match(/^[A-Za-z]--Users-([^-]+)$/);
  if (home) return '(home dir)';
  return s + suffix;
}

module.exports = { USAGE_FIELDS, mergeUsageMax, usageTotal, forEachLine, projectLabel };
