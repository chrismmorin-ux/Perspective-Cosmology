/**
 * cwos-utils.js — Shared utilities for CWOS deterministic scripts.
 * Zero external dependencies. Handles the CWOS YAML subset, file I/O,
 * date math, and markdown table parsing.
 */

'use strict';

// Pre-flight: ensure Node.js version is adequate
const [_cwosNodeMajor] = process.versions.node.split('.').map(Number);
if (_cwosNodeMajor < 14) {
  process.stderr.write(
    `Error: Node.js v14+ is required (found v${process.versions.node}).\n` +
    `Install or update Node.js: https://nodejs.org/\n`
  );
  process.exit(1);
}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Files worth protecting with the writeFileAtomic size-gate. A shrink to
// <max(100, 50% of prior size) on these paths is refused as likely corruption.
// New files (no prior stat) are exempt. See WS-137 / FIND-066.
const SIZE_GATE_PATH_RE =
  /(?:^|[\\/])(?:kit[\\/]commands[\\/].+\.md|\.claude[\\/]commands[\\/].+\.md|engines[\\/](?:standard|library)[\\/].+\.md|kit[\\/]claude-preamble\.md|kit[\\/]MANIFEST\.yaml)$/;

// writeFileAtomic rename-retry tuning. Win32 raises these when the target is
// open in any other process; POSIX rename(2) never does. See writeFileAtomic.
const RENAME_RETRY_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);
const RENAME_MAX_ATTEMPTS = 60;

// Monotonic suffix so two writes from one process cannot share a tmp name.
let tmpCounter = 0;

/** Block the thread without spinning the CPU. Sync by necessity — the whole
 *  write path is sync, and an async pause here would reorder callers. */
function sleepSync(ms) {
  if (ms <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

class SafeWriteError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SafeWriteError';
    this.code = code;
  }
}

// ─── YAML Parser (CWOS subset) ─────────────────────────────────────────────

/**
 * Parse a CWOS YAML file into a plain object.
 * Handles: scalars, quoted strings, block sequences (- item), inline arrays ([a, b]),
 * block scalars (| and >), nested mappings (up to 2 levels), and comments.
 */
/**
 * Split a mapping line into its key and the colon that ends it.
 *
 * WS-548: the key used to be `trimmed.substring(0, trimmed.indexOf(':'))`, which
 * kept the surrounding quotes on a QUOTED key. Every key in every
 * kit/hashes-<version>.yaml is quoted (they are file paths), so
 * `baseline.files['kit/scripts/foo.js']` resolved against a mapping whose keys
 * were all `'"kit/scripts/foo.js"'` and returned undefined — for all 370 of
 * them. detectLocalMods() skips on a missing baseline entry, so /kit-upgrade
 * reported "✓ No local kit modifications" with full confidence for every repo,
 * every time. Same failure direction as WS-544: the answer that loses your edits.
 *
 * Finding the colon AFTER the closing quote also fixes quoted keys that contain
 * a colon, which the naive indexOf split at the wrong character.
 */
function splitKey(trimmed) {
  const q = trimmed[0];
  if (q === '"' || q === "'") {
    const close = trimmed.indexOf(q, 1);
    if (close !== -1) {
      const colonIdx = trimmed.indexOf(':', close + 1);
      if (colonIdx !== -1) return { colonIdx, key: trimmed.slice(1, close) };
    }
  }
  const colonIdx = trimmed.indexOf(':');
  return { colonIdx, key: colonIdx === -1 ? '' : trimmed.substring(0, colonIdx).trim() };
}

function parseYAML(text, warnings) {
  // Accept an optional warnings array. If omitted, warnings are silently
  // dropped (preserves prior behavior for ad-hoc callers like attribution-
  // test). readYAMLFile always supplies one and surfaces it to callers
  // so the data-loss path becomes observable. WS-147.
  const w = Array.isArray(warnings) ? warnings : null;
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const result = {};
  let i = 0;

  while (i < lines.length) {
    i = parseMapping(lines, i, 0, result, w);
  }
  return result;
}

function parseMapping(lines, i, baseIndent, target, warnings) {
  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue; }

    const indent = lineIndent(line);
    if (indent < baseIndent) return i; // dedent — return to parent

    const trimmed = line.trim();

    // Block sequence at this level (- item)
    if (trimmed.startsWith('- ')) {
      // Orphan block-sequence item at mapping scope — malformed input.
      // Typically caused by a previous block sequence terminating early
      // on a continuation line that orphans subsequent items. Historically
      // dropped silently; WS-147 records a warning so consumers can see
      // truncation. Advance i to avoid the infinite-loop fixed in 2026-04-20.
      if (warnings) {
        warnings.push({
          line: i + 1,
          reason: 'orphan-block-sequence-item',
          snippet: trimmed.length > 80 ? trimmed.slice(0, 77) + '...' : trimmed,
        });
      }
      i++;
      continue;
    }

    const { colonIdx, key } = splitKey(trimmed);
    if (colonIdx === -1) { i++; continue; } // not a key-value line

    const afterColon = stripInlineComment(trimmed.substring(colonIdx + 1).trim());

    // WS-295: detect duplicate keys within the same mapping. Last-wins
    // semantics preserved (the assignment below proceeds); the warning
    // surfaces the silent overwrite for strict-mode callers and any
    // consumer that inspects the warnings array. FIND-128 was 22 days of
    // silent staleness from this exact pattern.
    if (warnings && Object.prototype.hasOwnProperty.call(target, key)) {
      warnings.push({
        line: i + 1,
        reason: `duplicate_key:${key}`,
        snippet: trimmed.length > 80 ? trimmed.slice(0, 77) + '...' : trimmed,
      });
    }

    // WS-538: block-scalar headers carry optional chomping (-/+) and explicit
    // indentation indicators. The old test compared afterColon to the bare
    // strings '|' and '>', so `foo: >-` — extremely common in hand-written
    // queue YAML — fell through to parseScalar and bound the LITERAL TWO
    // CHARACTERS ">-" as the value. 22 such fields existed across 20 state
    // files when this was found, all silently empty to every reader.
    const blockHeader = /^([|>])([-+]?)(\d*)$/.exec(afterColon);

    if (afterColon === '' || blockHeader) {
      // Check what follows: nested mapping, block sequence, or block scalar
      const nextNonEmpty = peekNextNonEmpty(lines, i + 1);
      if (nextNonEmpty === null) {
        target[key] = afterColon === '' ? null : '';
        i++;
        continue;
      }

      const nextIndent = lineIndent(lines[nextNonEmpty]);
      if (nextIndent <= indent) {
        target[key] = null;
        i++;
        continue;
      }

      if (blockHeader) {
        // Block scalar. style '|' keeps line breaks, '>' folds them to spaces.
        const { value, nextLine } = readBlockScalar(
          lines, i + 1, nextIndent, blockHeader[1], blockHeader[2]
        );
        target[key] = value;
        i = nextLine;
      } else if (lines[nextNonEmpty].trim().startsWith('- ')) {
        // Block sequence
        const { arr, nextLine } = readBlockSequence(lines, i + 1, nextIndent, warnings);
        target[key] = arr;
        i = nextLine;
      } else {
        // Nested mapping
        const nested = {};
        i = parseMapping(lines, i + 1, nextIndent, nested, warnings);
        target[key] = nested;
      }
    } else if (afterColon.startsWith('[')) {
      // Inline array
      target[key] = parseInlineArray(afterColon);
      i++;
    } else if (afterColon.startsWith('{')) {
      // Inline (flow) mapping — WS-560, gap 2 of FIND-YAML-parser-robustness.
      target[key] = parseInlineMapping(afterColon);
      i++;
    } else {
      // Scalar value
      target[key] = parseScalar(afterColon);
      i++;
    }
  }
  return i;
}

/**
 * Read a block scalar body.
 *
 * @param style '|' (literal — keep line breaks) or '>' (folded — line breaks
 *              become spaces; a blank line is a paragraph break and survives as
 *              a newline; a line that is MORE indented than the block is a
 *              "more-indented" line and is not folded, per YAML).
 * @param chomp '-' strip trailing newlines, '+' keep them, '' clip.
 *
 * Deliberate deviation from the YAML spec on clip: '' behaves as strip rather
 * than keeping one trailing newline. Every CWOS consumer treats these fields as
 * prose values and none want a trailing "\n"; matching the spec here would
 * append one to essentially every description and accept_criteria in the fleet.
 * Only '+' opts into retained trailing blank lines. WS-538.
 */
function readBlockScalar(lines, start, scalarIndent, style, chomp) {
  const raw = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      raw.push('');
      i++;
      continue;
    }
    const indent = lineIndent(line);
    if (indent < scalarIndent) break;
    raw.push(line.substring(scalarIndent));
    i++;
  }

  // Chomping applies to trailing blank lines only.
  const body = raw.slice();
  if (chomp !== '+') {
    while (body.length > 0 && body[body.length - 1] === '') body.pop();
  }

  if (style !== '>') {
    return { value: body.join('\n'), nextLine: i };
  }

  // Folded: join runs of equally-indented non-empty lines with a single space.
  // Blank lines separate paragraphs and emit a newline. More-indented lines are
  // preserved verbatim so embedded snippets/lists inside a folded block survive.
  const out = [];
  let buf = null;
  for (const line of body) {
    if (line === '') {
      if (buf !== null) { out.push(buf); buf = null; }
      out.push('');
      continue;
    }
    if (/^\s/.test(line)) {
      // more-indented than the block: not folded
      if (buf !== null) { out.push(buf); buf = null; }
      out.push(line);
      continue;
    }
    buf = buf === null ? line : `${buf} ${line}`;
  }
  if (buf !== null) out.push(buf);

  // Collapse the paragraph markers: consecutive blanks fold to one newline
  // boundary, matching how these fields render today.
  const value = out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return { value, nextLine: i };
}

function readBlockSequence(lines, start, seqIndent, warnings) {
  const arr = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue; }
    const indent = lineIndent(line);
    if (indent < seqIndent) break;
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) break;

    const itemText = stripInlineComment(trimmed.substring(2).trim());

    // Check if this sequence item starts a nested mapping
    const nextLine = i + 1;
    const nextNonEmpty = peekNextNonEmpty(lines, nextLine);
    if (nextNonEmpty !== null && lineIndent(lines[nextNonEmpty]) > indent) {
      const itemTrimmed = itemText;
      if (itemTrimmed.includes(':')) {
        // Sequence of mappings: - key: value\n  key2: value2
        const nested = {};
        const colonIdx = itemTrimmed.indexOf(':');
        const k = itemTrimmed.substring(0, colonIdx).trim();
        const v = itemTrimmed.substring(colonIdx + 1).trim();
        if (v) nested[k] = parseScalar(v);
        const childIndent = lineIndent(lines[nextNonEmpty]);
        i = parseMapping(lines, nextLine, childIndent, nested, warnings);
        arr.push(nested);
        continue;
      }
    }

    arr.push(parseScalar(itemText));
    i++;
  }
  return { arr, nextLine: i };
}

// Split a flow-collection body on its TOP-LEVEL commas, honouring nesting and
// quotes. A naive `.split(',')` breaks `["a, b"]` into two entries and
// `{a: {b: 1, c: 2}}` into three. WS-560.
function splitFlowEntries(inner) {
  const parts = [];
  let depth = 0, inSingle = false, inDouble = false, start = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inDouble) { if (c === '"') inDouble = false; continue; }
    if (inSingle) { if (c === "'") inSingle = false; continue; }
    if (c === '"') { inDouble = true; continue; }
    if (c === "'") { inSingle = true; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') depth--;
    else if (c === ',' && depth === 0) { parts.push(inner.slice(start, i)); start = i + 1; }
  }
  parts.push(inner.slice(start));
  return parts.map(s => s.trim()).filter(s => s !== '');
}

// Index of the `:` separating key from value in a flow-mapping entry — the
// first one at depth 0 and outside quotes, so `{url: "http://x"}` and
// `{a: {b: 1}}` both split at the right place.
function flowColonIndex(entry) {
  let depth = 0, inSingle = false, inDouble = false;
  for (let i = 0; i < entry.length; i++) {
    const c = entry[i];
    if (inDouble) { if (c === '"') inDouble = false; continue; }
    if (inSingle) { if (c === "'") inSingle = false; continue; }
    if (c === '"') { inDouble = true; continue; }
    if (c === "'") { inSingle = true; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') depth--;
    else if (c === ':' && depth === 0) return i;
  }
  return -1;
}

// A flow value may itself be a collection, so recurse before falling back to
// scalar coercion.
function parseFlowValue(text) {
  const t = text.trim();
  if (t.startsWith('[')) return parseInlineArray(t);
  if (t.startsWith('{')) return parseInlineMapping(t);
  return parseScalar(t);
}

/**
 * Parse a single-line flow mapping: `{}`, `{a: 1, b: two}`, `{a: {b: 1}}`.
 *
 * WS-560 — gap 2 of FIND-YAML-parser-robustness. Before this, parseYAML had a
 * branch for inline `[...]` but none for `{...}`, so every flow mapping fell
 * through to parseScalar and became the literal STRING of its own source text.
 * `tiers: {}` produced `"{}"`, which is truthy, is not an object, and passes
 * any `if (x)` guard while failing every `typeof x === 'object'` test.
 *
 * The blast radius was wide and silent: `{}` appears in kit/templates/
 * cwos-config.yaml, cwos-onboarding.yaml, kit/data/archetypes.yaml and the
 * engine registry, so it shipped to every adopted repo. capability-detect's
 * detectGovernance() reads `last_run_by_protocol.baseline.date` and returned
 * false for any repo whose program YAMLs used flow style — nutrition converted
 * 17 program files to block style as a workaround rather than fix this.
 */
function parseInlineMapping(text) {
  const inner = text.trim().replace(/^\{/, '').replace(/\}$/, '').trim();
  const out = {};
  if (inner === '') return out;
  for (const entry of splitFlowEntries(inner)) {
    const idx = flowColonIndex(entry);
    if (idx === -1) continue; // malformed entry — skip rather than corrupt the map
    const key = entry.slice(0, idx).trim().replace(/^(["'])(.*)\1$/, '$2');
    if (key === '') continue;
    out[key] = parseFlowValue(entry.slice(idx + 1));
  }
  return out;
}

function parseInlineArray(text) {
  // Remove brackets
  const inner = text.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  if (inner === '') return [];
  return splitFlowEntries(inner).map(parseFlowValue);
}

// Strip a trailing inline comment from a scalar/flow line. YAML rules:
// a `#` starts a comment only when it is at the start of the (already-trimmed)
// content or preceded by whitespace, and only outside quoted strings. This
// preserves `#` inside quotes ("#ff0000") and mid-token (a#b, http://x/#frag)
// while removing ` # comment` tails. WS-497: without this, values like
// `kit_version: "3.7.1"  # WS-406` parsed as the whole string incl. the
// comment, poisoning fleet-scan numbers (NaN health) and version compares.
function stripInlineComment(text) {
  // Quote-state opens only at position 0, mirroring parseScalar: a YAML value
  // is quoted iff it STARTS with a quote. A bare apostrophe in unquoted prose
  // ("don't ship") must not open a string, else the # guard below never fires
  // and the comment leaks back into the value (FIND-327 regression on WS-497).
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && !inSingle && (inDouble || i === 0)) inDouble = !inDouble;
    else if (c === "'" && !inDouble && (inSingle || i === 0)) inSingle = !inSingle;
    else if (c === '#' && !inSingle && !inDouble && (i === 0 || /\s/.test(text[i - 1]))) {
      return text.slice(0, i).replace(/\s+$/, '');
    }
  }
  return text;
}

/**
 * Undo the escaping a double-quoted YAML scalar carries (WS-735).
 *
 * This reader used to strip the quotes and hand back the raw inner text, which
 * broke in both directions at once:
 *
 *   - GROWTH. Every writer that escapes on the way out (`"` → `\"`) read its
 *     own output back with the escape still in it and escaped it again. The
 *     runs doubled per sweep: one title in fleet/maintenance/findings.yaml
 *     reached 1,048,701 characters, and an evidence field 98,537.
 *   - SILENCE. YAML written CORRECTLY was delivered wrong. Every regex in
 *     kit/data/stage-detection-signals.yaml is authored `"(?i)\\b(deploy...)"`,
 *     which is the right way to mean `\b` — and arrived as a literal backslash,
 *     so all five signals compiled to patterns that matched nothing at all.
 *
 * Decodes EXACTLY the two escapes this codebase's writers emit — `\\` and
 * `\"` — and nothing else. That is deliberately narrower than the YAML spec,
 * and the narrowness is the safety property:
 *
 *   `\n`, `\r` and `\t` are NOT decoded. Full YAML would turn them into
 *   control characters, and this fleet stores Windows paths:
 *   `C:\Users\chris\repos\nutrition` contains `\r` and `\n`. A path written
 *   without escaping would be silently torn in half. Measured while repairing
 *   the corrupted findings — the first repair pass produced
 *   `C:\Users\chris` + CR + `epos` + LF + `utrition`.
 *
 *   Nothing is lost by omitting them: serializeYAML writes multi-line strings
 *   as block scalars (`key: |`), so no writer here emits a `\n` escape for a
 *   reader to decode.
 *
 * An unrecognised sequence is left EXACTLY as found rather than guessed at —
 * `\d` in a stored regex and `\U` in a path both survive untouched.
 *
 * Single-quoted scalars are not touched: YAML gives them no backslash escapes
 * at all (only '' for a literal quote), so unescaping them would corrupt data.
 */
function unescapeDoubleQuoted(s) {
  if (s.indexOf('\\') === -1) return s;
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '\\' || i === s.length - 1) { out += s[i]; continue; }
    const n = s[i + 1];
    if (n === '\\') { out += '\\'; i++; }
    else if (n === '"') { out += '"'; i++; }
    else out += s[i]; // every other sequence, including \n and \r, is content
  }
  return out;
}

function parseScalar(text) {
  if (text === '' || text === 'null' || text === '~') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;

  // Quoted string
  if (text.startsWith('"') && text.endsWith('"') && text.length >= 2) {
    return unescapeDoubleQuoted(text.slice(1, -1));
  }
  if (text.startsWith("'") && text.endsWith("'") && text.length >= 2) {
    // YAML single-quoted: '' is the ONLY escape there is.
    return text.slice(1, -1).replace(/''/g, "'");
  }

  // Number
  const num = Number(text);
  if (!isNaN(num) && text !== '') return num;

  return text;
}

function lineIndent(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function peekNextNonEmpty(lines, start) {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].trim() !== '' && !lines[i].trim().startsWith('#')) return i;
  }
  return null;
}

// ─── YAML Serializer ────────────────────────────────────────────────────────

/**
 * Serialize a plain object to YAML text.
 * Handles scalars, arrays (inline for simple, block for objects), and nested objects.
 */
function serializeYAML(obj, indent = 0) {
  const lines = [];
  const pad = ' '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      lines.push(`${pad}${key}: null`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${pad}${key}: []`);
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        // Block sequence of mappings
        lines.push(`${pad}${key}:`);
        for (const item of value) {
          const entries = Object.entries(item);
          if (entries.length === 0) continue;
          const [firstKey, firstVal] = entries[0];
          lines.push(`${pad}  - ${firstKey}: ${formatScalar(firstVal)}`);
          for (let e = 1; e < entries.length; e++) {
            const [k, v] = entries[e];
            if (Array.isArray(v)) {
              lines.push(`${pad}    ${k}: ${formatInlineArray(v)}`);
            } else if (typeof v === 'object' && v !== null) {
              lines.push(`${pad}    ${k}:`);
              const nested = serializeYAML(v, indent + 6);
              lines.push(nested);
            } else {
              lines.push(`${pad}    ${k}: ${formatScalar(v)}`);
            }
          }
          lines.push('');
        }
      } else {
        // Inline array for simple values
        lines.push(`${pad}${key}: ${formatInlineArray(value)}`);
      }
    } else if (typeof value === 'object') {
      lines.push(`${pad}${key}:`);
      lines.push(serializeYAML(value, indent + 2));
    } else if (typeof value === 'string' && value.includes('\n')) {
      lines.push(`${pad}${key}: |`);
      for (const vline of value.split('\n')) {
        lines.push(`${pad}  ${vline}`);
      }
    } else {
      lines.push(`${pad}${key}: ${formatScalar(value)}`);
    }
  }

  return lines.join('\n');
}

/**
 * escapeYamlString — canonical escaper for the INTERIOR of a double-quoted
 * YAML scalar. Returns the escaped body only; the caller supplies the quotes.
 *
 * Canonicalised by WS-485. Three incompatible copies previously existed:
 *   - cwos-asn-transition.js  escaped \ and " but NOT newlines, so a --reason
 *     containing one wrote malformed YAML that the hand-rolled parser (INV-022)
 *     then choked on. That was the live bug.
 *   - lib/cwos-reconcile-core.js  escaped \ and " and collapsed \n to a space.
 *   - formatScalar (below)  takes a different route entirely, switching to a
 *     block scalar for multiline values.
 *
 * Newlines collapse to a single space rather than becoming a literal \n escape.
 * The hand-rolled reader in this file does not process escape sequences inside
 * quoted scalars, so emitting "\\n" would round-trip as the two characters
 * backslash-n rather than a newline. Collapsing loses line structure but always
 * produces parseable YAML; the previous behaviour produced neither. Callers
 * that must preserve line structure should use formatScalar/serializeYAML,
 * which emit a block scalar instead.
 *
 * Escape order matters: backslashes first, or the backslashes introduced when
 * escaping quotes get double-escaped.
 */
function escapeYamlString(str) {
  if (str === null || str === undefined || str === '') return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, ' ')
    .replace(/[\n\r]/g, ' ');
}

/**
 * verifyHardlink — do these two paths actually share one inode?
 *
 * WS-382. fs.linkSync() resolving without throwing is NOT proof a hardlink
 * exists. The install paths in cwos-genesis-scaffold.js reported
 * `mode: 'hardlink'` purely because linkSync did not throw, and reported
 * `ok: true` on the copy fallback as well, so no caller could tell a real link
 * from a copy. When the "link" is silently a copy, edits stop propagating and
 * the two files drift — the documented root cause of the SYN /next-disappeared
 * family (OneDrive severs hardlinks during sync).
 *
 * Windows-aware, per the item's title:
 *   - Node populates st.ino on NTFS from the file index, so the comparison is
 *     meaningful there. Some filesystems (and some network mounts) report 0.
 *   - ino === 0 means "cannot verify", NOT "verified different". Returning
 *     false there is deliberate: callers must treat unverifiable as unproven
 *     and degrade to the copy-with-warning path rather than claim a hardlink.
 *   - st.dev is compared too — inode numbers are only unique within a volume,
 *     and the cross-volume case is exactly when linkSync falls back to a copy.
 *
 * @returns {boolean} true only when both paths provably share one inode.
 */
function verifyHardlink(a, b) {
  try {
    const sa = fs.statSync(a);
    const sb = fs.statSync(b);
    return sa.ino !== 0 &&
      String(sa.ino) === String(sb.ino) &&
      String(sa.dev) === String(sb.dev);
  } catch {
    return false;
  }
}

function formatScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    // Quote if contains special chars or looks like a number
    if (/[:#\[\]{},&*!|>'"%@`]/.test(value) || value === '' ||
        value === 'true' || value === 'false' || value === 'null' ||
        value === 'yes' || value === 'no' || value === 'on' || value === 'off' ||
        value === 'Yes' || value === 'No' || value === 'On' || value === 'Off' ||
        value === 'YES' || value === 'NO' || value === 'ON' || value === 'OFF' ||
        (!isNaN(Number(value)) && value.trim() !== '')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  return String(value);
}

function formatInlineArray(arr) {
  if (arr.length === 0) return '[]';
  return '[' + arr.map(v => formatScalar(v)).join(', ') + ']';
}

// ─── YAML Patch (read-modify-write preserving structure) ────────────────────

/**
 * Patch specific top-level scalar fields in a YAML file.
 * Preserves comments, ordering, and unmodified content.
 *
 * REPLACE-ONLY, AND THAT IS A LOADED GUN (WS-529).
 *
 * A patch whose key is absent from the file is DROPPED. The write still
 * happens, the function still returns, and the caller has no way to tell the
 * difference between "updated" and "silently did nothing" — which is the exact
 * shape of WS-561, one layer further down.
 *
 * It cost a real defect. `cwos-claims.claimItems` patches
 * `{ claimed_by, claimed_at }` onto a queue item, and HomeBase queue YAMLs do
 * not scaffold those keys. So every claim since WS-533 wrote nothing and
 * reported the item claimed: SPR-194 sat `approved` with both of its items
 * still `status: backlog, claimed_by: null`, visible to any other session's
 * `/next` as free work. WS-564 hit the same edge on `host:` and worked around
 * it by re-stamping on every heartbeat.
 *
 * Two changes, neither of which alters what an existing caller writes:
 *
 *   1. It RETURNS `{ patched, missing }`. A caller that cares can now tell.
 *      Nothing forces it to look — but "the information was unavailable" stops
 *      being true, and that is the difference between a bug and a decision.
 *   2. `opts.insertMissing` appends absent keys instead of dropping them.
 *      Opt-in, because inserting a key the caller only meant to update would
 *      change the shape of files some callers deliberately treat as fixed.
 *
 * For a field that must land, prefer `upsertYAMLScalarField` — it inserts,
 * fills an explicit null, leaves a real value alone, and preserves line
 * endings. This function stays for the callers that genuinely mean
 * update-if-present.
 *
 * @returns {{ patched: string[], missing: string[] }}
 */
function patchYAMLFile(filePath, patches, opts = {}) {
  let content = fs.readFileSync(filePath, 'utf8');
  const patched = [];
  const missing = [];
  for (const [key, value] of Object.entries(patches)) {
    const regex = new RegExp(`^(${escapeRegex(key)}:\\s*).*$`, 'm');
    const formatted = formatScalar(value);
    if (regex.test(content)) {
      content = content.replace(regex, `$1${formatted}`);
      patched.push(key);
    } else if (opts.insertMissing) {
      const eol = /\r\n/.test(content) ? '\r\n' : '\n';
      content = content.replace(/\s*$/, '') + eol + `${key}: ${formatted}` + eol;
      patched.push(key);
    } else {
      missing.push(key);
    }
  }
  writeFileAtomic(filePath, content);
  return { patched, missing };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Value-aware scalar upsert (WS-561) ─────────────────────────────────────

/**
 * Is a raw YAML scalar (the text after `key:`) semantically UNSET?
 *
 * WS-561: the five closure-write sites each hand-rolled `!/^key:/m.test(text)`
 * to mean "this field needs filling". That asks whether the KEY is present,
 * not whether it has a VALUE — so an item scaffolding `completed_at: null`
 * while open matched the regex, the guard went false, and the timestamp was
 * never written while the CLI reported success. 104 items across two repos
 * closed with null provenance that way.
 *
 * The asymmetry that shapes this function: over-matching (treating a real
 * value as unset) OVERWRITES founder data; under-matching merely reproduces
 * the original bug. So every form below is an explicit, enumerated YAML null —
 * nothing is inferred.
 *
 * Quoted "null" / 'null' is deliberately NOT unset. It is a real string value
 * — almost certainly a data-quality problem worth seeing — and folding it into
 * the fill path would silently destroy the evidence of it.
 */
function isUnsetYAMLScalar(raw) {
  if (raw === undefined || raw === null) return true;
  const v = String(raw).trim();
  if (v === '') return true;                       // `key:` with nothing after it
  if (v === '~') return true;                      // YAML null shorthand
  if (v === 'null' || v === 'Null' || v === 'NULL') return true;
  // Quoted empty is an emptied field, not a value. This is the shape a RELEASED
  // lease has: `releaseClaimedItems` (cwos-session-recovery) and the queue-item
  // template in commands/workstream.md both write `claimed_by: ""`. Reading it
  // as a real value made the field permanently unfillable — an item released by
  // recovery, or scaffolded from the template, could never be claimed again.
  // Measured 2026-08-04: SPR-196 approved with claimed: [] over all 4 items,
  // every one of them sitting at `claimed_by: ""` and free for a peer's /next.
  // Distinct from quoted "null" below, which stays a real string on purpose.
  if (v === '""' || v === "''") return true;
  return false;                                    // includes "null" and 'null'
}

/**
 * Insert-or-fill a top-level scalar field, leaving real values untouched.
 *
 *   key absent            → insert (after `afterKey` when given, else append)
 *   key present, unset    → replace the value in place
 *   key present, real     → return content unchanged (idempotence)
 *
 * Returns { content, action: 'inserted' | 'filled' | 'unchanged' }.
 *
 * Line endings: the inserted line copies the ending of the line it anchors to,
 * so a CRLF file does not acquire a lone LF (or vice versa). Mixed endings are
 * common here — multiple tools and two OSes touch these files.
 *
 * Anchoring is `^`-with-`m` on a NON-INDENTED key, so a `completed_at:` living
 * inside a block scalar (`description: |`) or a nested map cannot be mistaken
 * for the top-level field. The old sites matched indented text too.
 */
function upsertYAMLScalarField(content, key, value, opts = {}) {
  const k = escapeRegex(key);
  // Top-level only: no leading whitespace before the key.
  const present = new RegExp(`^${k}:([^\\r\\n]*)$`, 'm');
  const m = content.match(present);

  if (m) {
    if (!isUnsetYAMLScalar(m[1])) return { content, action: 'unchanged' };
    return {
      content: content.replace(present, `${key}: ${formatScalar(value)}`),
      action: 'filled',
    };
  }

  const line = `${key}: ${formatScalar(value)}`;
  const afterKey = opts.after ? escapeRegex(opts.after) : null;
  if (afterKey) {
    const anchor = new RegExp(`^${afterKey}:[^\\r\\n]*(\\r?\\n|$)`, 'm');
    const am = content.match(anchor);
    if (am) {
      const eol = am[1] && am[1].length ? am[1] : '\n';
      return {
        content: content.replace(anchor, `${am[0].replace(/\r?\n$/, '')}${eol}${line}${eol}`),
        action: 'inserted',
      };
    }
  }
  const eol = /\r\n/.test(content) ? '\r\n' : '\n';
  return { content: content.trimEnd() + eol + line + eol, action: 'inserted' };
}

// ─── File I/O ───────────────────────────────────────────────────────────────

function readYAMLFile(filePath, opts) {
  const strict = opts && opts.strict === true;
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const warnings = [];
    const data = parseYAML(text, warnings);
    if (strict && warnings.length > 0) {
      const first = warnings[0];
      return {
        ok: false,
        error: `${first.reason} at line ${first.line}: ${first.snippet}`,
        warnings,
      };
    }
    return { ok: true, data, warnings };
  } catch (err) {
    return { ok: false, error: err.message, warnings: [] };
  }
}

/**
 * Rewrite a file in place, durably, without unlinking or replacing its inode.
 *
 * Corruption-safe sequence (WS-137 / FIND-066):
 *   1. Write full new content at offset 0 (may leave trailing bytes from the
 *      prior content, but bytes 0..N are the complete new content).
 *   2. fsync — persist the DATA before changing the length.
 *   3. Truncate to the exact length — drops any trailing garbage.
 *   4. fsync — persist the new length.
 *
 * Interrupted before step 1, the old content is intact. Interrupted between 1
 * and 3, readers see valid new content plus possible trailers — a parser may
 * choke, which is recoverable; zero-byte corruption is not. After step 4 the
 * file is exactly the new content.
 *
 * Then read back and compare, retrying once. Catches an OS-level partial write
 * that silently reported success.
 *
 * Used for two cases: hardlinked targets (where rename would break every other
 * link), and rename-contended targets on Win32 (where rename cannot proceed at
 * all). Not atomic — a concurrent reader can observe a partial state — so it is
 * strictly the fallback, never the default.
 */
function writeInPlaceDurable(filePath, buf, whatFor) {
  const rewrite = () => {
    const fd = fs.openSync(filePath, 'r+');
    try {
      fs.writeSync(fd, buf, 0, buf.length, 0);
      fs.fsyncSync(fd);
      fs.ftruncateSync(fd, buf.length);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  };

  rewrite();
  if (buffersEqual(fs.readFileSync(filePath), buf)) return;
  rewrite();
  if (buffersEqual(fs.readFileSync(filePath), buf)) return;

  throw new SafeWriteError(
    `content hash mismatch post-write on ${whatFor}: ${filePath} ` +
    `(retried once). Possible filesystem corruption.`,
    'HASH_MISMATCH',
  );
}

function writeFileAtomic(filePath, content, opts = {}) {
  const preserveHardlinks = opts.preserveHardlinks !== false;
  const skipSizeGate = opts.skipSizeGate === true;

  // Detect if target is hardlinked (nlink > 1). If so, write in-place to
  // preserve the inode — otherwise rename creates a new inode and breaks
  // every other path pointing to the original. Critical for kit/commands
  // <-> .claude/commands/ hardlinks on NTFS.
  let linkCount = 1;
  let priorSize = -1;
  try {
    if (fs.existsSync(filePath)) {
      const st = fs.statSync(filePath);
      linkCount = st.nlink;
      priorSize = st.size;
    }
  } catch { /* new file */ }

  const buf = Buffer.from(content, 'utf8');

  // Size gate — refuse suspicious shrinks on protected paths. New files exempt.
  // Covers writeFileAtomic interrupt-corruption AND upstream bugs that try to
  // overwrite command files with empty/truncated content.
  if (!skipSizeGate && priorSize >= 0 && SIZE_GATE_PATH_RE.test(filePath)) {
    const floor = Math.max(100, Math.floor(priorSize * 0.5));
    if (buf.length < floor) {
      throw new SafeWriteError(
        `refused suspicious shrink: ${filePath} prior=${priorSize}B new=${buf.length}B (floor=${floor}B). ` +
        `Pass { skipSizeGate: true } to override (not recommended).`,
        'SHRINK_REFUSED',
      );
    }
  }

  if (linkCount > 1 && preserveHardlinks) {
    // In-place write for hardlinked files — preserves inode so every hardlink
    // (kit/commands/ <-> .claude/commands/) sees the updated content.
    //
    // Corruption-safe sequence (see WS-137 / FIND-066):
    //   1. Write full new content at offset 0 (may leave trailing bytes from
    //      prior content, but content bytes 0..N are the new full content).
    //   2. fsync — durably persist bytes BEFORE changing the length.
    //   3. Truncate to exact length — removes any trailing garbage.
    //   4. fsync — durably persist the new length.
    //
    // If interrupted BEFORE step 1 completes, the old content is intact.
    // If interrupted AFTER step 1 but before step 3, the file has the full
    // new content plus possibly some trailing bytes from the prior version
    // (readers see valid new content; YAML/MD parsers may choke on trailers,
    // but crash-on-trailers is recoverable — zero-byte corruption is not).
    // After step 4 completes, the file is fully and exactly the new content.
    //
    // NOTE: hooks (cwos-heartbeat.js, cwos-session-recovery.js) do NOT write
    // to hardlinked command files as of 2026-04-20 (verified for WS-137) — so
    // no cross-process lockfile is needed. If a future hook writes to a
    // hardlinked path, add O_EXCL lockfile serialization here.
    writeInPlaceDurable(filePath, buf, 'hardlinked file');
    return;
  }

  // Default path — atomic via tmp + rename. Creates new inode (intentional
  // for non-hardlinked files; safer against partial writes).
  //
  // Three properties this sequence must hold, each learned the hard way on
  // NTFS / Windows (measured on MorinComputer 2026-08-19, WS-643):
  //
  //  1. DURABILITY. The tmp file's DATA must reach disk before the rename
  //     publishes it. NTFS journals the metadata op (the rename) but not the
  //     file contents, so without the fsync a power cut between the two can
  //     leave the directory entry pointing at a file whose blocks were never
  //     flushed — i.e. the target reads back zero-length. G16 dies from
  //     battery exhaustion routinely, so this is the expected condition, not
  //     an edge case. `fs.fsyncSync` on the tmp fd is what closes it.
  //     (The POSIX companion trick — fsync the parent DIRECTORY to persist the
  //     new dirent — is unavailable here: opening a directory for fsync fails
  //     EPERM on Windows. NTFS's metadata journal is what covers that half.)
  //
  //  2. UNIQUENESS. The tmp name must not be a fixed `<target>.tmp`. Two CWOS
  //     sessions run concurrently by design (see CLAUDE.md), and a shared tmp
  //     name lets one writer's partial buffer be renamed into place by the
  //     other. pid + counter + random makes collision impossible.
  //
  //  3. RETRY. On Win32 a rename onto a target that ANY process currently has
  //     open — including open for READ — fails EPERM (sharing violation);
  //     POSIX rename(2) simply succeeds. This is not rare: a 400-write probe
  //     against one concurrent reader needed 271 retries. Without the loop,
  //     converting a call site to this helper would trade silent corruption
  //     for a loud crash, which is why the naive version could not just be
  //     mass-adopted. Bounded backoff, then surface the real error.
  const tmpPath = `${filePath}.${process.pid}.${(tmpCounter = (tmpCounter + 1) >>> 0)
    .toString(36)}${crypto.randomBytes(3).toString('hex')}.tmp`;

  const fd = fs.openSync(tmpPath, 'w');
  try {
    fs.writeFileSync(fd, buf);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  let lastErr = null;
  for (let attempt = 0; attempt < RENAME_MAX_ATTEMPTS; attempt++) {
    try {
      fs.renameSync(tmpPath, filePath);
      return;
    } catch (err) {
      if (!RENAME_RETRY_CODES.has(err.code)) {
        try { fs.unlinkSync(tmpPath); } catch { /* best-effort */ }
        throw err;
      }
      lastErr = err;
      sleepSync(Math.min(2 + attempt * 2, 25));
    }
  }

  // Never leave the scratch file behind for a glob to trip over.
  try { fs.unlinkSync(tmpPath); } catch { /* best-effort */ }

  // The rename is permanently blocked — some process holds the target open and
  // is not letting go (measured: a pinned read handle blocks rename forever on
  // Win32, however long we retry). Falling back matters because the raw
  // `fs.writeFileSync` these call sites used BEFORE WS-643 *succeeds* in this
  // exact situation — Node opens the target with FILE_SHARE_READ, so a reader
  // does not block it. Throwing here would therefore have made migration a
  // net availability regression: files that used to be written would stop
  // being written.
  //
  // So degrade to the in-place durable rewrite instead. It is not atomic — a
  // concurrent reader can catch a partial state — but it fsyncs the data before
  // shortening the file, which strictly dominates the raw writeFileSync it
  // replaced. We give up atomicity only in the case where atomicity was
  // impossible anyway, and never give up durability.
  if (fs.existsSync(filePath)) {
    try {
      writeInPlaceDurable(filePath, buf, 'rename-contended file');
      return;
    } catch (err) {
      lastErr = err;
    }
  }

  throw new SafeWriteError(
    `atomic rename kept failing after ${RENAME_MAX_ATTEMPTS} attempts and the ` +
    `in-place fallback did not succeed: ${filePath} ` +
    `(last: ${lastErr && (lastErr.code || lastErr.message)}). ` +
    `Another process is holding the file open.`,
    'RENAME_CONTENDED',
  );
}

// ─── Path-Traversal Containment (WS-430 / INV-055) ──────────────────────────
// Adopter-controlled values flowing into path.join must pass through these.
// boundedSystemDir: validates a single-segment relative directory name like
//   'system' or 'cwos-system'. boundedPathInRepo: resolves a relative path
//   against a repo root and asserts the result stays inside that root.

function boundedSystemDir(value) {
  if (typeof value !== 'string') {
    throw new SafeWriteError(
      `system_dir must be a string (got ${typeof value})`,
      'SYSTEM_DIR_INVALID',
    );
  }
  if (value.length === 0 || value.trim() !== value) {
    throw new SafeWriteError(
      `system_dir must not be empty or contain leading/trailing whitespace (got ${JSON.stringify(value)})`,
      'SYSTEM_DIR_INVALID',
    );
  }
  if (value.includes('..') || value.includes('/') || value.includes('\\') || value.includes('\0')) {
    throw new SafeWriteError(
      `system_dir must be a single path segment without '..', '/', '\\', or NUL (got ${JSON.stringify(value)})`,
      'SYSTEM_DIR_INVALID',
    );
  }
  if (path.isAbsolute(value)) {
    throw new SafeWriteError(
      `system_dir must be relative (got absolute path ${JSON.stringify(value)})`,
      'SYSTEM_DIR_INVALID',
    );
  }
  return value;
}

function boundedPathInRepo(repoRoot, rel) {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    throw new SafeWriteError(
      `boundedPathInRepo: repoRoot must be a non-empty string`,
      'BOUNDED_PATH_INVALID',
    );
  }
  if (typeof rel !== 'string') {
    throw new SafeWriteError(
      `boundedPathInRepo: rel must be a string (got ${typeof rel})`,
      'BOUNDED_PATH_INVALID',
    );
  }
  const root = path.resolve(repoRoot);
  const abs = path.resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    throw new SafeWriteError(
      `boundedPathInRepo: ${JSON.stringify(rel)} escapes repo root ${JSON.stringify(root)} (resolved to ${JSON.stringify(abs)})`,
      'BOUNDED_PATH_ESCAPE',
    );
  }
  return abs;
}

function buffersEqual(a, b) {
  if (a.length !== b.length) return false;
  // Prefer native compare; fall back to SHA-256 for very small buffers or
  // environments where Buffer.compare is flaky.
  if (typeof a.equals === 'function') return a.equals(b);
  return crypto.createHash('sha256').update(a).digest('hex') ===
         crypto.createHash('sha256').update(b).digest('hex');
}

function globFiles(dir, pattern) {
  try {
    const files = fs.readdirSync(dir);
    const regex = globToRegex(pattern);
    return files
      .filter(f => regex.test(f))
      .sort((a, b) => {
        // Numeric sort by ID when possible
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      })
      .map(f => path.join(dir, f));
  } catch {
    return [];
  }
}

function globToRegex(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + escaped + '$');
}

// ─── Date Utilities ─────────────────────────────────────────────────────────

/**
 * Days between two date strings (ISO format: YYYY-MM-DD or full ISO).
 * Returns positive if b is after a.
 */
function dateDiffDays(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db - da) / (1000 * 60 * 60 * 24));
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── Markdown Table Parser ──────────────────────────────────────────────────

/**
 * Split one table row into cells on UNESCAPED pipes, then unescape `\|`.
 *
 * GitHub-flavored Markdown escapes a literal pipe inside a cell as `\|`, and a
 * naive `line.split('|')` reads that escape as a cell boundary — silently
 * truncating the cell at the pipe and shifting every column after it. Measured
 * 2026-09-11 (WS-827): ServeYourNote's Vital Signs row
 *
 *   | Flake markers | `git grep -cE "..." backend/apps/ \| wc -l` | ≤ 5 | ... |
 *
 * parsed into six cells instead of five, and `cwos-agents-md.js adopt`
 * published the command as `git grep -cE "..." backend/apps/ \` — a command
 * ending in a dangling backslash, which cannot run. AGENTS.md exists to stop a
 * foreign agent being told to do something impossible; publishing a truncated
 * command is that same failure one layer down.
 *
 * Empty-cell semantics are deliberately unchanged: callers still filter them,
 * which is wrong for a genuinely blank middle cell but is pre-existing and not
 * this function's to decide.
 */
function splitTableCells(line) {
  const cells = [];
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\' && line[i + 1] === '|') { cur += '|'; i++; continue; }
    if (line[i] === '|') { cells.push(cur); cur = ''; continue; }
    cur += line[i];
  }
  cells.push(cur);
  return cells;
}

/** Inverse of splitTableCells for one cell: a literal pipe must go back out as `\|`. */
function escapeTableCell(value) {
  return String(value == null ? '' : value).replace(/\|/g, '\\|');
}

/**
 * Extract a markdown table from a section identified by heading.
 * Returns { rows: [{col1: val1, ...}, ...], startLine, endLine }
 */
function parseMarkdownTable(text, sectionHeading) {
  const lines = text.split('\n');
  let inSection = false;
  let headerLine = -1;
  let separatorLine = -1;
  let columns = [];
  const rows = [];
  let startLine = -1;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Find section
    if (line.startsWith('##') && line.includes(sectionHeading)) {
      inSection = true;
      continue;
    }
    if (inSection && line.startsWith('##') && !line.includes(sectionHeading)) {
      // Left the section
      break;
    }

    if (!inSection) continue;

    // Find table header
    if (headerLine === -1 && line.startsWith('|')) {
      headerLine = i;
      startLine = i;
      columns = splitTableCells(line).filter(c => c.trim()).map(c => c.trim());
      continue;
    }

    // Skip separator
    if (headerLine !== -1 && separatorLine === -1 && line.match(/^\|[\s-|]+\|?$/)) {
      separatorLine = i;
      continue;
    }

    // Parse data rows
    if (separatorLine !== -1 && line.startsWith('|')) {
      const cells = splitTableCells(line).filter(c => c !== '').map(c => c.trim());
      const row = {};
      columns.forEach((col, idx) => { row[col] = cells[idx] || ''; });
      rows.push(row);
      endLine = i;
      continue;
    }

    // Non-table line after table started — table is done
    if (separatorLine !== -1 && !line.startsWith('|') && line !== '') {
      break;
    }
  }

  return { columns, rows, startLine, endLine };
}

/**
 * Serialize rows back into a markdown table string.
 */
function serializeMarkdownTable(columns, rows) {
  // Escape first, then measure: `\|` is two characters wider than the pipe it
  // encodes, so widths computed on the raw value misalign the rendered table.
  const cellOf = (row, col) => escapeTableCell(row[col] || '');
  const widths = columns.map(col => {
    const maxData = rows.reduce((max, row) => Math.max(max, cellOf(row, col).length), 0);
    return Math.max(col.length, maxData);
  });

  const header = '| ' + columns.map((c, i) => c.padEnd(widths[i])).join(' | ') + ' |';
  const sep = '|' + widths.map(w => '-'.repeat(w + 2)).join('|') + '|';
  const body = rows.map(row =>
    '| ' + columns.map((c, i) => cellOf(row, c).padEnd(widths[i])).join(' | ') + ' |'
  );

  return [header, sep, ...body].join('\n');
}

// ─── Workstream Directory Finder ────────────────────────────────────────────

/**
 * Resolve the ONE canonical `.claude/workstream/` for a repo (WS-576).
 *
 * A linked git worktree has `.claude/workstream/` checked out — it is tracked —
 * so the plain upward walk below finds the worktree's own forked copy on its
 * very first iteration and never reaches the main tree. Deterministic, not
 * probabilistic:
 *
 *     cwd: .claude/worktrees/probe
 *     walk -> .claude/worktrees/probe/.claude/workstream    (the fork)
 *
 * That fork is the root of the whole worktree-state problem. `allocateNextWsId`
 * scanning "the local queue dir" and `events/` "not travelling into a worktree"
 * — the two reasons `worktree-guard.js` gives for refusing state writes — are
 * both consequences of it, not independent facts.
 *
 * It also quietly violates the replay contract. INV-031/044 assume
 * state = f(replay(THE event log)) — one well-defined object. Two worktrees
 * accumulating separate writes makes "the log" ambiguous, with no fact of the
 * matter about which is canonical. ADR-058 already settled the identical
 * question between nodes: exactly one write-authoritative copy of tracked
 * state, everything else derived and rebuildable. This is that rule applied
 * inside a repo.
 *
 * ENFORCEMENT IS STRUCTURAL, NOT ADVISORY. `assertMainTree` was the guard
 * against forked writes and had exactly ONE live consumer (`core/events.js`
 * `appendEvent`) while 57 files resolve state — so 56 write paths were never
 * gated at all. Rather than add 56 assertions to remember, the fork is removed
 * at the source: no caller can write to a forked path because no caller can
 * obtain one. The guard is left in place and becomes a VERIFICATION that this
 * resolver did its job — it inspects the resolved directory, so it passes
 * naturally once resolution is correct, and fires again if this ever regresses.
 *
 * Cost is two filesystem calls, cached per repo root by `describeTree`. There
 * is deliberately no `git` subprocess: `worktree-guard.js` recovers the main
 * tree by reading the `.git` file's `gitdir:` pointer, so a non-worktree costs
 * one `statSync` and a directory with no `.git` at all — every temp-dir test
 * fixture — falls straight through to the walk below, unchanged.
 *
 * Returns null when `start` is not inside a linked worktree, or when the main
 * tree has no workstream dir (an odd setup that should degrade to the walk
 * rather than to an error).
 */
function canonicalWorkstreamDir(start) {
  try {
    // Guarded require: the established idiom here for a dependency whose
    // absence must degrade rather than crash (see the factory comment below).
    const { describeTree } = require('./worktree-guard');
    const info = describeTree(start);
    if (!info || !info.linked || !info.mainTree) return null;
    const candidate = path.join(info.mainTree, '.claude', 'workstream');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  } catch { /* not a worktree, or the guard is unavailable — use the walk */ }
  return null;
}

/**
 * Find the canonical .claude/workstream/ directory for `startDir`.
 *
 * Resolution order, and the order matters: the linked-worktree redirect runs
 * FIRST, because the defect being fixed is precisely that the local copy wins.
 * Checking locally first would reproduce it.
 */
function findWorkstreamDir(startDir) {
  const start = path.resolve(startDir || process.cwd());

  const canonical = canonicalWorkstreamDir(start);
  if (canonical) return canonical;

  let dir = start;
  for (let depth = 0; depth < 10; depth++) {
    const candidate = path.join(dir, '.claude', 'workstream');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Throwing (rather than returning `start` the way findRepoRoot does on a
  // miss) is the deliberate choice for this resolver: every caller writes
  // state, and a silent wrong answer here corrupts the queue. The two
  // resolvers in this file answer different questions and are allowed to
  // differ — but each states its policy rather than inheriting one by copy.
  throw new Error(
    `Could not find .claude/workstream/ directory (searched up from ${start}). ` +
    'If this is a linked git worktree, the primary tree has no workstream dir either.'
  );
}

// ─── Repo Root Finder ──────────────────────────────────────────────────────
//
// Walk up from startDir looking for marker files. Default markers: ['.git'].
// Companion to findWorkstreamDir — repo root sits one level outside the
// workstream dir but isn't always derivable that way (test fixtures, sim
// repos, fleet ops point at non-CWOS roots). Replaces 16 local copies.
//
// opts.markers: array of relative paths to look for (default: ['.git'])
// opts.requireAll: when true (default), all markers must exist at a level
//                  before that level counts. When false, any one suffices.
// opts.maxDepth: depth limit on the upward walk (default: 10).
//
// Returns startDir as a fallback if no marker is found — matches the
// behavior of the local copies it replaces (most return start unchanged
// when nothing is hit, so callers don't break on test fixtures).

// Resolve the directory that holds calibration files — findings-feedback.yaml,
// finding-lifecycle.yaml, change-impacts.yaml. In HomeBase these live under
// docs/evolution/ (the Product Evolution apparatus, which never propagates to
// adopters). In an adopted repo docs/evolution/ does not exist, so the same
// files must land under .claude/workstream/ or every calibration write silently
// no-ops. Detection is directory presence — a provable no-op in HomeBase, where
// docs/evolution/ exists and the resolver returns the identical path.
// WS-421 / INV-059.
function resolveEvolutionDir(rootDir) {
  const home = path.join(rootDir, 'docs', 'evolution');
  return fs.existsSync(home) ? home : path.join(rootDir, '.claude', 'workstream');
}

function findRepoRoot(startDir, opts = {}) {
  const start = path.resolve(startDir || process.cwd());
  const markers = opts.markers || ['.git'];
  const requireAll = opts.requireAll !== false;
  const maxDepth = typeof opts.maxDepth === 'number' ? opts.maxDepth : 10;
  let dir = start;
  for (let depth = 0; depth < maxDepth; depth++) {
    const present = markers.map((m) => fs.existsSync(path.join(dir, m)));
    if (requireAll ? present.every(Boolean) : present.some(Boolean)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

/**
 * The repo root a FILE belongs to — which is not the repo root that owns the
 * workstream registry, and conflating the two is FND-141.
 *
 * `findWorkstreamDir` deliberately REDIRECTS a linked worktree to the primary
 * tree, because that is where the canonical records live. Callers then derived
 * the repo root as `path.resolve(wsDir, '..', '..')` and relativised file paths
 * against it. Correct in the primary tree; wrong in every worktree, where it
 * yields a path starting with `..` that the caller drops on the floor. The
 * observable effect was that `files_locked` was never written for any session
 * working in a worktree — 15 of 16 checkouts, and the configuration
 * `session-tree.sh` instructs every session to use.
 *
 * Returns null rather than a plausible guess when it cannot tell. That matters
 * more than it looks: `findRepoRoot` falls back to `startDir` on a miss, and
 * relativising a file against its own directory yields a BARE FILENAME with no
 * `..` in it — a wrong answer wearing a right answer's shape, which the caller
 * then writes to the registry as though it had succeeded. A caller must be able
 * to tell "nothing to record" from "could not work out where this belongs".
 */
function repoRootForPath(filePath) {
  const dir = path.dirname(path.resolve(filePath));
  const root = findRepoRoot(dir);
  // Only a root that actually carries the marker is an answer — findRepoRoot's
  // startDir fallback does not. In a linked worktree `.git` is a FILE, not a
  // directory, which is why this is existsSync and not isDirectory.
  if (!fs.existsSync(path.join(root, '.git'))) return null;
  return root;
}

// ─── Workstream Path Constants ─────────────────────────────────────────────
//
// Canonical relative-segment names for the most-referenced workstream files.
// Use these instead of hardcoding strings — eliminates the rename-scatter
// risk if directory layout shifts. ~75 hardcoded references across 17 scripts
// today; opt-in migration (existing strings stay until touched).
//
// Usage: path.join(findWorkstreamDir(), WS_PATHS.QUEUE_INDEX)

const WS_PATHS = Object.freeze({
  QUEUE_INDEX: 'queue-index.yaml',
  FINDINGS_INDEX: 'findings-index.yaml',
  SPRINT_INDEX: 'sprint-index.yaml',
  PROGRAMS_REGISTRY: 'programs/registry.yaml',
  RUNS_DIR: 'runs',
  CONFIG_YAML: 'config.yaml',
});

// ─── Shadow-event emitter factory ──────────────────────────────────────────
//
// Wraps the guarded-import pattern duplicated in 20+ scripts:
//   let appendEvent = null;
//   try { ({ appendEvent } = require('./core/events')); } catch {}
//   function emitEvent(track, tag, payload) { ... }
//
// Returns a function with the same (track, tag, payload) signature so
// callers can drop in without changing call sites. Failure stays silent
// per AS-23 (shadow-event writes must never fail the caller).
//
// The require is lazy (inside the factory) to avoid a circular dep:
// core/events.js imports findWorkstreamDir + withFileLock from this file.

function makeEventEmitter() {
  let appendEvent = null;
  try { ({ appendEvent } = require('../core/events')); } catch { /* events.js missing or harness-mode */ }
  return function emitEvent(track, tag, payload) {
    if (!appendEvent) return;
    try { appendEvent({ source_track: track, track_tag: tag, payload: payload || {} }); }
    catch (err) {
      // WS-532: AS-23 says a shadow-log failure must not break the host
      // command. A worktree refusal is not a failure — it is a deliberate
      // policy stop, and this emitter is the path 20+ scripts use, so
      // swallowing here would mute the guard almost everywhere it matters.
      if (err && err.code === 'CWOS_WORKTREE_WRITE_REFUSED') throw err;
      /* swallow per AS-23 */
    }
  };
}

/**
 * The real payload of an event, following a spill to blobs/ when there was one.
 *
 * core/events.js replaces any payload over PAYLOAD_INLINE_CAP_BYTES (2 KB) with
 * a `{payload_ref, payload_hash}` stub and writes the content to
 * `events/blobs/<sha>.json`. Every reader that reaches for a payload FIELD
 * rather than just the envelope has to undo that, and until WS-578 not one did
 * — `core/render-events.js` prints `blob:<ref>` and everything else silently
 * read `undefined`.
 *
 * That is a quiet, size-dependent data loss: short events read fine and long
 * ones come back empty, so the failure hides until something important is
 * verbose. It surfaced when a migrated 1,629-character friction entry rendered
 * as `detail: ""` while seven shorter ones beside it were perfect.
 *
 * Returns the inline payload unchanged when there is no spill, and an empty
 * object when the blob cannot be read — never the stub, which is the shape
 * that reads as "this event has no content".
 */
function resolveEventPayload(workstreamDir, ev) {
  const p = (ev && ev.payload) || {};
  if (!p.payload_ref) return p;
  try {
    const blob = path.join(workstreamDir, 'events', p.payload_ref);
    const inner = JSON.parse(fs.readFileSync(blob, 'utf8'));
    return (inner && typeof inner === 'object') ? inner : {};
  } catch {
    return {};
  }
}

// Loads { appendEvent, ensureCommandId } from core/events + core/composition with
// the same guarded-import pattern as makeEventEmitter. Use this when a script
// needs raw appendEvent (e.g. to inject command_id from ensureCommandId — the
// composed-event protocol). Returned values are null if the underlying core/
// modules are missing (harness-mode / fleet repos without the runtime).

function loadEventDeps() {
  let appendEvent = null;
  try { ({ appendEvent } = require('../core/events')); } catch { /* events.js missing or harness-mode */ }
  let ensureCommandId = null;
  try { ({ ensureCommandId } = require('../core/composition')); } catch { /* composition.js missing */ }
  return { appendEvent, ensureCommandId };
}

// ─── Token-Jaccard similarity (WS-227 — promoted from cwos-constitutional-audit.js) ───
//
// Used by cwos-constitutional-audit.js for P2/P3 near-miss detection (WS-226)
// and the same script's --check-text mode for anti-goal / failed-state
// matching against sprint goals + item titles in /next Step 4a (WS-227).
// Both consumers share one implementation; if a third consumer needs
// corpus-driven similarity, point it at this lib too.

function tokenize(text, stopwords) {
  const stop = new Set(stopwords || []);
  return new Set(
    String(text).toLowerCase()
      .split(/\W+/)
      .filter(t => t && !stop.has(t))
  );
}

function tokenJaccard(a, b, stopwords) {
  const A = tokenize(a, stopwords);
  const B = tokenize(b, stopwords);
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

// Loads a corpus YAML file. Returns { detectors, anti_goals, failed_states,
// stopwords }. Tiny inline parser — no external dep. Robust to missing
// sections (returns empty defaults). `corpusPath` is the absolute path.
function loadCorpus(corpusPath) {
  const empty = {
    detectors: {},
    anti_goals: { canonical_phrases: [], similarity_threshold: 0.45 },
    failed_states: { canonical_phrases: [], similarity_threshold: 0.45 },
    stopwords: [],
  };
  if (!fs.existsSync(corpusPath)) return empty;
  const raw = fs.readFileSync(corpusPath, 'utf8');
  const corpus = {
    detectors: {},
    anti_goals: { canonical_phrases: [], similarity_threshold: 0.45 },
    failed_states: { canonical_phrases: [], similarity_threshold: 0.45 },
    stopwords: [],
  };
  const lines = raw.split('\n');
  // section markers carry the current scope
  let section = null;
  let currentDetector = null;
  let currentScope = null; // 'detector' | 'anti_goals' | 'failed_states' | 'stopwords'
  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').replace(/\s+$/, '');
    if (!line.trim()) continue;
    // Top-level markers (no leading whitespace)
    if (/^stopwords:\s*$/.test(line)) { section = 'stopwords'; currentDetector = null; currentScope = 'stopwords'; continue; }
    if (/^detectors:\s*$/.test(line)) { section = 'detectors'; currentDetector = null; currentScope = null; continue; }
    if (/^anti_goals:\s*$/.test(line)) { section = 'anti_goals'; currentDetector = null; currentScope = 'anti_goals'; continue; }
    if (/^failed_states:\s*$/.test(line)) { section = 'failed_states'; currentDetector = null; currentScope = 'failed_states'; continue; }
    // Detector block (2-space indent under detectors:)
    const detMatch = line.match(/^  ([A-Z][A-Z0-9-]+):\s*$/);
    if (section === 'detectors' && detMatch) {
      currentDetector = detMatch[1];
      corpus.detectors[currentDetector] = { canonical_phrases: [], similarity_threshold: 0.45 };
      section = `detector:${currentDetector}`;
      currentScope = 'detector';
      continue;
    }
    // Threshold — depth 4 (detectors block) or 2 (anti_goals / failed_states)
    const t4 = line.match(/^    similarity_threshold:\s*([\d.]+)/);
    const t2 = line.match(/^  similarity_threshold:\s*([\d.]+)/);
    if (currentScope === 'detector' && currentDetector && t4) {
      corpus.detectors[currentDetector].similarity_threshold = parseFloat(t4[1]);
      continue;
    }
    if ((currentScope === 'anti_goals' || currentScope === 'failed_states') && t2) {
      corpus[currentScope].similarity_threshold = parseFloat(t2[1]);
      continue;
    }
    // Phrase list start
    if (currentScope === 'detector' && currentDetector && /^    canonical_phrases:\s*$/.test(line)) {
      section = `canonical_phrases:detector:${currentDetector}`;
      continue;
    }
    if ((currentScope === 'anti_goals' || currentScope === 'failed_states') && /^  canonical_phrases:\s*$/.test(line)) {
      section = `canonical_phrases:${currentScope}`;
      continue;
    }
    // Phrase items — depth 6 (detector) or 4 (anti_goals/failed_states)
    if (section && section.startsWith('canonical_phrases:detector:')) {
      const m = line.match(/^      -\s*["']?(.+?)["']?\s*$/);
      if (m) { corpus.detectors[currentDetector].canonical_phrases.push(m[1].toLowerCase()); continue; }
    }
    if (section === 'canonical_phrases:anti_goals') {
      const m = line.match(/^    -\s*["']?(.+?)["']?\s*$/);
      if (m) { corpus.anti_goals.canonical_phrases.push(m[1].toLowerCase()); continue; }
    }
    if (section === 'canonical_phrases:failed_states') {
      const m = line.match(/^    -\s*["']?(.+?)["']?\s*$/);
      if (m) { corpus.failed_states.canonical_phrases.push(m[1].toLowerCase()); continue; }
    }
    // Stopword items — depth 2
    if (currentScope === 'stopwords') {
      const m = line.match(/^  -\s*["']?([\w-]+)["']?/);
      if (m) corpus.stopwords.push(m[1].toLowerCase());
    }
  }
  return corpus;
}

// ─── File-based advisory lock (WS-228 — generalized from core/events.js) ────
//
// Atomic create-exclusive lockfile. fs.openSync(path, 'wx') succeeds only when
// the path doesn't exist (POSIX O_EXCL / equivalent on NTFS), making the lock
// acquisition race-free against itself. Caller wraps the protected work in fn;
// release happens in a finally so an exception still cleans the lockfile.
//
// Stale-lock recovery: if an existing lockfile's content includes an ISO
// timestamp older than `staleAfterMs` (default 30s), treat it as orphaned and
// overwrite. This handles the case where a Node process crashed without
// reaching the finally block. 30s is conservative for sub-second protected
// regions (stamp writes, recovery loops); raise it for long operations.
//
// Lockfile content format: "<pid>:<owner-label>:<iso-timestamp>" — useful for
// debugging when a lock is stuck (founder can `cat` the lockfile to see who
// holds it and how old it is).
//
// CONTENTION IS NOT ALWAYS EEXIST (WS-455). On Win32, openSync(path, 'wx')
// against a lockfile another process holds — or is mid-unlink on — reports
// EPERM (errno -4048), not EEXIST. Treating only EEXIST as "held, retry" meant
// the loser of a race THREW instead of waiting, which is why INV-036's
// hook-race trial passed and failed in the same session. Measured 2026-08-26:
// events.test.js's concurrent-writers case failed ~1 run in 3 this way.
//
// This is the same Win32 shape WS-643 already absorbed for renameSync
// (RENAME_RETRY_CODES). The lock path never got the same treatment.
//
// The cost of widening: a genuine permission fault (read-only directory, ACL
// denial) now spins to maxWaitMs instead of failing fast. So the timeout error
// carries the last errno — the diagnosis is delayed, never lost.
//
// Used by:
//   - cwos-heartbeat.js + cwos-session-recovery.js for stampHookLiveness
//     read-modify-write protection (closes FAIL-007 S1)
//   - cwos-session-recovery.js for SessionStart double-recovery mutex
//     (closes FAIL-007 S3)

// Errno values that mean "someone else holds it, wait" rather than "you cannot
// have it". EEXIST is the POSIX answer; the rest are what Win32 returns for the
// same situation depending on how the holder has the handle open.
const LOCK_CONTENTION_CODES = new Set(['EEXIST', 'EPERM', 'EACCES', 'EBUSY']);

function withFileLock(lockPath, fn, opts = {}) {
  const maxWaitMs = typeof opts.maxWaitMs === 'number' ? opts.maxWaitMs : 5000;
  const retryMs = typeof opts.retryMs === 'number' ? opts.retryMs : 25;
  const staleAfterMs = typeof opts.staleAfterMs === 'number' ? opts.staleAfterMs : 30000;
  const ownerLabel = opts.ownerLabel || 'unknown';
  const start = Date.now();
  const lockContent = `${process.pid}:${ownerLabel}:${new Date().toISOString()}`;
  let fd = null;
  let lastErr = null;
  while (fd === null) {
    try {
      fd = fs.openSync(lockPath, 'wx');
      fs.writeSync(fd, lockContent);
    } catch (err) {
      if (!LOCK_CONTENTION_CODES.has(err.code)) throw err;
      lastErr = err;
      // Stale-lock recovery: parse existing lockfile timestamp; if older than
      // staleAfterMs, the holder is presumed dead and we overwrite.
      try {
        const existing = fs.readFileSync(lockPath, 'utf8');
        const m = existing.match(/:(\d{4}-\d{2}-\d{2}T[\d:.]+Z)$/);
        if (m) {
          const age = Date.now() - new Date(m[1]).getTime();
          if (age > staleAfterMs) {
            try { fs.unlinkSync(lockPath); } catch { /* ignore */ }
            continue; // retry acquire on next iteration
          }
        }
      } catch { /* lockfile vanished mid-read or unparseable — fall through to wait */ }
      if (Date.now() - start > maxWaitMs) {
        throw new Error(`withFileLock: timeout after ${maxWaitMs}ms (owner=${ownerLabel}, lockfile=${lockPath}, lastErrno=${lastErr ? lastErr.code : 'none'})`);
      }
      const jitter = Math.floor(Math.random() * retryMs);
      const end = Date.now() + retryMs + jitter;
      while (Date.now() < end) { /* busy wait — sub-50ms window */ }
    }
  }
  try {
    return fn();
  } finally {
    try { fs.closeSync(fd); } catch { /* ignore */ }
    try { fs.unlinkSync(lockPath); } catch { /* ignore */ }
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  LOCK_CONTENTION_CODES,
  parseYAML,
  serializeYAML,
  patchYAMLFile,
  upsertYAMLScalarField,
  resolveEventPayload,
  isUnsetYAMLScalar,
  readYAMLFile,
  writeFileAtomic,
  SafeWriteError,
  boundedSystemDir,
  boundedPathInRepo,
  globFiles,
  dateDiffDays,
  todayISO,
  parseMarkdownTable,
  serializeMarkdownTable,
  splitTableCells,
  escapeTableCell,
  findWorkstreamDir,
  findRepoRoot,
  repoRootForPath,
  resolveEvolutionDir,
  WS_PATHS,
  makeEventEmitter,
  loadEventDeps,
  formatScalar,
  formatInlineArray,
  escapeYamlString,
  verifyHardlink,
  tokenize,
  tokenJaccard,
  loadCorpus,
  withFileLock,
};
