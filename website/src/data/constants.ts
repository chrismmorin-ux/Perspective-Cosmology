/**
 * Centralized framework constants for the Perspective Cosmology website.
 *
 * Update these values when theory evolves (new sessions, new scripts, claim changes).
 * Run `npm run check-sync` to detect when these may be stale.
 *
 * Source mapping: see website/SYNC_MANIFEST.json for where each value comes from.
 */
export const FRAMEWORK = {
  scriptCount: '737+',
  scriptCountShort: '~737',
  passRate: '99.8%',
  runRate: '99.9%',
  probabilityRange: '25-40%',
  probabilityRangeNdash: '25\u201340%',
  iraCount: 4,
  falsifiedCount: 14,
  retractionCount: 3,
  tier1Count: 12,
  blindPredictionCount: 9,
  blindPValue: '2.5e-7',
  blindPValueFormatted: '2.5\u00d710\u207b\u2077',
  predictionCount: 45,
  testablePredictionCount: 8,
  sessionCount: '370+',
  sessionCountShort: '~370',
  overallGrade: 'B-',
  domainCount: 12,
} as const;

export type FrameworkConstants = typeof FRAMEWORK;
