'use strict';
/**
 * kit-hash — the ONE hash-comparison rule for kit file integrity (WS-600).
 *
 * Before this module, four incompatible input rules coexisted: the baseline
 * generator hashed raw bytes, two stamp writers hashed utf8 strings,
 * cwos-migrate EOL-normalized before comparing, and cwos-kit-upgrade used a
 * three-variant set. Two sites hashing the same file could legitimately
 * disagree — which is fatal for a check whose whole job is deciding whether
 * two hashes SHOULD agree.
 *
 * The line-ending variant set is non-optional on this fleet: 127 shipped
 * files carry CRLF, git autocrlf differs per checkout, and a comparison that
 * ignores this flags essentially everything on Windows (the WS-544 lesson,
 * see cwos-kit-upgrade's original rationale).
 */

const crypto = require('crypto');

function sha256(content) {
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * All hashes this buffer could legitimately carry across line-ending
 * conversions: raw bytes, all-LF, all-CRLF.
 */
function lineEndingVariantHashes(buf) {
  const raw = Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf), 'utf8');
  const text = raw.toString('utf8');
  const lf = text.replace(/\r\n/g, '\n');
  const crlf = lf.replace(/\n/g, '\r\n');
  return new Set([sha256(raw), sha256(lf), sha256(crlf)]);
}

/** Does this content match an expected `sha256:` hash, up to line endings? */
function hashMatchesBaseline(buf, expected) {
  if (!expected) return false;
  return lineEndingVariantHashes(buf).has(expected);
}

/**
 * The bytes git would store for this working-tree file — what a plain LF
 * checkout (CI, a cloud session) reads back (WS-1083).
 *
 * `indexEol` is the `i/` column of `git ls-files --eol` for the path. A blob
 * that already holds CRLF (`crlf`, `mixed`) or that git treats as binary
 * (`-text`) is checked out as it is stored, so its bytes are used raw. Every
 * other text file (`lf`, `none`, untracked, or no git at all) has CRLF turned
 * back into LF: that undoes core.autocrlf / eol=crlf on checkout exactly,
 * because such a blob held no CR to begin with. A buffer with a NUL byte is
 * binary and stays raw. Byte-level (latin1) so no UTF-8 decode can alter it.
 */
function gitCanonicalBytes(buf, indexEol) {
  const raw = Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf), 'utf8');
  if (indexEol === 'crlf' || indexEol === 'mixed' || indexEol === '-text') return raw;
  if (raw.includes(0)) return raw;
  if (!raw.includes(13)) return raw;
  return Buffer.from(raw.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
}

module.exports = { sha256, lineEndingVariantHashes, hashMatchesBaseline, gitCanonicalBytes };
