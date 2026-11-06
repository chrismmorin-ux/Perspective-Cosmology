'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CORPUS_RELATIVE = 'kit/data/constitutional-detector-corpus.yaml';

function corpusPath(rootDir) {
  return path.join(rootDir, CORPUS_RELATIVE);
}

/**
 * Hash the corpus CONTENT, not its checkout.
 *
 * This hashed raw bytes until 2026-09-21, and on Windows (`core.autocrlf=true`,
 * no `.gitattributes` rule for this path) that made the answer depend on which
 * machine last checked the file out. Measured: identical content hashes
 * 5bc8a55c064d with LF and c5e914baf89a with CRLF — and c5e914ba is exactly
 * what AI-Personal, melody-hill-app and deckside had recorded. `/fleet-update`'s
 * constitutional-drift gate therefore refused every fleet push, reporting drift
 * on a corpus file that had not changed since 2026-04-26.
 *
 * That is the WS-755 failure repeating in a second gate: a safety gate held
 * permanently shut by a proxy that was never the hazard. Normalising CRLF to LF
 * before hashing makes the hash mean "this corpus", which is the only thing the
 * gate ever wanted to compare.
 *
 * Existing repos carrying a CRLF-era hash re-record on their next push
 * (/fleet-update Step 4.7), after which the value is checkout-independent.
 */
function corpusHash(rootDir) {
  const p = corpusPath(rootDir);
  if (!fs.existsSync(p)) return null;
  const normalized = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 12);
}

module.exports = { corpusPath, corpusHash, CORPUS_RELATIVE };
