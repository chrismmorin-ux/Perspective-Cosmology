/**
 * model-pricing — list prices per Claude model, and the arithmetic that turns
 * transcript usage into a list-price-equivalent dollar figure (WS-1305).
 * Zero dependencies. Pure CommonJS.
 *
 * WHY THIS EXISTS. Summing token kinds makes cache reads look like the cost:
 * 97% of 14.7B fleet tokens were cache reads on 2026-10-11 (WS-1105). Priced,
 * one 1-hour cache-write token costs what 40 cache-read tokens cost on Opus 5.5
 * ($8.00 vs $0.20 per MTok). On 2026-11-01 one cloud session measured 89% of
 * its tokens as reads and about 83% of its dollars as writes.
 *
 * THIS IS THE ONE PLACE A PRICE LIVES. Do not restate a rate anywhere else.
 * Source: the claude-api skill's model table (cached 2026-10-06) and its
 * prompt-caching reference: writes are 1.25x base input for the 5-minute TTL
 * and 2x for the 1-hour TTL; reads are ~0.1x base input except where a model
 * lists its own read price (read_basis 'listed'). A 'rule' read price is the
 * 0.1x rule applied, not a published figure.
 *
 * WHAT THE FIGURE IS NOT. It is list price, so it is not a bill on a contract
 * rate, and on a subscription it is not plan usage: Anthropic does not publish
 * how each token kind weighs against plan limits (Claude Code docs say only
 * that re-reads count "at the cached token rate"). Label it "list-price
 * equivalent", never "spend".
 *
 * Opus 4.7 and 4.6 ($5/$25) are rows of that same skill table, not inferred.
 *
 * Claude Haiku 5.5 prompts over 100K tokens use its long-prompt card ($0.50 /
 * $2.50), with cache rates from the same multipliers (model-migration guide,
 * Haiku 5.5 section: reads 0.1x and writes 1.25x/2x "the input rate").
 *
 * WHAT IT REFUSES TO PRICE (reported as unpriced, never guessed):
 *   - a model not in the table;
 *   - fast-mode replies (usage.speed === 'fast', or a retired '-fast' model
 *     id): fast input/output prices are published, fast cache rates are not.
 */

'use strict';

const PRICES_AS_OF = '2026-10-06';
const PRICES_SOURCE = 'claude-api skill model table (cached 2026-10-06) + prompt-caching reference';
const WRITE_5M_MULT = 1.25;
const WRITE_1H_MULT = 2;
const READ_RULE_MULT = 0.1;
const HAIKU_55_TIER_TOKENS = 100000;

// $ per million tokens. Order matters: first match wins, so longer ids first.
const TABLE = [
  { id: 'claude-fable-5-1', input: 10, output: 50, read: 0.25, read_basis: 'listed' },
  { id: 'claude-mythos-5-1', input: 10, output: 50, read: 0.25, read_basis: 'listed' },
  { id: 'claude-fable-5', input: 10, output: 50 },
  { id: 'claude-mythos-5', input: 10, output: 50 },
  { id: 'claude-opus-5-5', input: 4, output: 20, read: 0.20, read_basis: 'listed' },
  { id: 'claude-opus-5', input: 5, output: 25 },
  { id: 'claude-opus-4-8', input: 5, output: 25 },
  { id: 'claude-opus-4-7', input: 5, output: 25 },
  { id: 'claude-opus-4-6', input: 5, output: 25 },
  { id: 'claude-sonnet-5-5', input: 2, output: 10, read: 0.20, read_basis: 'listed' },
  { id: 'claude-sonnet-5', input: 2, output: 10 },
  { id: 'claude-sonnet-4-6', input: 3, output: 15 },
  { id: 'claude-haiku-5-5', input: 0.10, output: 0.50, tiered: true, long: { input: 0.50, output: 2.50 } },
  { id: 'claude-haiku-4-5', input: 1, output: 5 },
];

/** Strip a platform prefix ("anthropic.", "us.anthropic.") and a "[1m]"-style suffix. */
function normalizeModel(model) {
  return String(model || '').replace(/^(?:[a-z]+\.)?anthropic\./, '').replace(/\[[^\]]*\]$/, '').toLowerCase();
}

/** The rates for a model id, or null when the table does not hold it. */
function priceFor(model, opts = {}) {
  const m = normalizeModel(model);
  const row = TABLE.find((r) => m === r.id || m.startsWith(r.id + '-') || m.startsWith(r.id + '@'));
  if (!row) return null;
  const card = opts.longPrompt && row.long ? row.long : row;
  const read = card === row && row.read != null ? row.read : card.input * READ_RULE_MULT;
  return {
    id: row.id + (card === row ? '' : ' (prompt >100K)'),
    input: card.input,
    output: card.output,
    write_5m: card.input * WRITE_5M_MULT,
    write_1h: card.input * WRITE_1H_MULT,
    read,
    read_basis: card === row ? (row.read_basis || 'rule') : 'rule',
    tiered: !!row.tiered,
  };
}

const isFastId = (model) => /-fast(?:$|[-@\[])/.test(normalizeModel(model));

/**
 * The bucket a reply is priced under: the model id, or the model id with the
 * reason it cannot be priced. `usage` is the merged usage of one reply.
 */
function priceKey(model, usage) {
  const base = String(model || 'unknown');
  if ((usage && usage.speed === 'fast') || isFastId(base)) return `${base} (fast mode)`;
  const p = priceFor(base);
  if (p && p.tiered) {
    const prompt = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
    if (prompt > HAIKU_55_TIER_TOKENS) return `${base} (prompt >100K)`;
  }
  return base;
}

const UNPRICED_SUFFIX = / \(fast mode\)$/;
const LONG_SUFFIX = / \(prompt >100K\)$/;

/**
 * Price aggregated usage for one price key.
 * u: { input, cache_write, cache_write_5m, cache_write_1h, cache_read, output }
 * Writes whose TTL the transcript did not record are priced as a range:
 * 5-minute rate (low) to 1-hour rate (high). Returns null when unpriceable.
 */
function costOf(key, u) {
  if (UNPRICED_SUFFIX.test(key)) return null;
  const p = priceFor(key.replace(LONG_SUFFIX, ''), { longPrompt: LONG_SUFFIX.test(key) });
  if (!p) return null;
  const per = (tokens, rate) => (tokens * rate) / 1e6;
  let w5 = u.cache_write_5m || 0;
  let w1 = u.cache_write_1h || 0;
  // The split is merged field-wise, so it can in principle exceed the recorded
  // write total; never price more write tokens than were recorded.
  const cw = u.cache_write || 0;
  if (w5 + w1 > cw) { const k = cw / (w5 + w1); w5 *= k; w1 *= k; }
  const wUnknown = Math.max(0, (u.cache_write || 0) - w5 - w1);
  const input = per(u.input || 0, p.input);
  const read = per(u.cache_read || 0, p.read);
  const output = per(u.output || 0, p.output);
  const writeKnown = per(w5, p.write_5m) + per(w1, p.write_1h);
  const writeLow = writeKnown + per(wUnknown, p.write_5m);
  const writeHigh = writeKnown + per(wUnknown, p.write_1h);
  return {
    priced_as: p.id,
    read_basis: p.read_basis,
    input, read, output,
    write_low: writeLow, write_high: writeHigh,
    write_ttl_unknown_tokens: wUnknown,
    total_low: input + read + output + writeLow,
    total_high: input + read + output + writeHigh,
  };
}

module.exports = {
  PRICES_AS_OF, PRICES_SOURCE, WRITE_5M_MULT, WRITE_1H_MULT, READ_RULE_MULT,
  normalizeModel, priceFor, priceKey, costOf,
};
