# Quality Engine Run History

Append-only log of quality scan summaries. Each entry records date, issue counts, and trend.

---

<!-- Entries appended by /quality-engine runs -->

## Run 1 — 2026-02-02
Issues: 104. Structural: 92 (2 auto-fixable orphans, 90 size/header). Content: 24 (8 untagged, 2 unverified, 14 incomplete chains). Consistency: 3 (2 status mismatches, 1 minor terminology). Investigations scored: 20. Top priority: Recursive gap tower meta-rank-4 (14.4). Trend: FIRST RUN.

## Run 2 — 2026-02-03
Issues: 332 (deeper scan). Structural: 254 (34 broken refs, 100 missing headers, 22 orphans, 98 size violations). Content: 64 (7 untagged, 3 unverified, 4 incomplete chains, 50 stale). Consistency: 14 (5 status mismatches, 2 dependency, 3 layer purity, 4 terminology). Investigations scored: 15. Top priority: Herm(2) = spacetime spectral geometry (14.4). Improvements: THM_0497 mismatch resolved, orphaned investigations 2->0, investigation Status compliance 92%->99.3%. Trend: EXPANDED SCAN (deeper coverage, not degradation).

## Run 3 — 2026-02-03
Issues: 175 (47% reduction). Structural: 118 (0 broken refs, 0 missing headers, ~21 orphaned scripts, 97 size violations). Content: 52 (8 untagged, 14 unverified/phantom, 4 chains, 26 stale). Consistency: 5 (1 mismatch, 2 dependency, 0 purity, 2 terminology). Key fixes: Last Updated 90→0 missing, derivations_summary 121KB→1.9KB, layer purity 3→0, stale ACTIVE 42→~4, broken refs 29→0. New finding: 22 header/footer contradictions. Trend: IMPROVING.

## Run 4 — 2026-02-03
Issues: 251 raw / 130 normalized (deep orphan scan). Structural: 207 (0 broken refs, 13 missing session dates, 142 orphaned scripts, 52 size violations). Content: 41 (5 untagged, 14 unverified, 5 chains, 17 stale). Consistency: 3 (1 mismatch, 0 dependency, 0 purity, 2 terminology). Key fixes since Run 3: header/footer contradictions 22→1, untagged claims 8→5, consistency 5→3. New findings: 142 orphaned scripts (deep scan vs ~21 estimate), 14 stale ACTIVE investigations, 2 unverified cosmological claims (HRS trigger). Priorities stable; quick wins: Cyclotomic 43, QCD lattice. Top priority: Herm(2) = spacetime (14.4). Trend: IMPROVING (normalized 26% reduction).

## Run 5 — 2026-02-07
Issues: 118 (normalized, 9% reduction from Run 4). Structural: 88 (1 phantom index ref, 0 missing headers, ~65 unlisted sessions, ~355 orphaned scripts, 22 size violations). Content: 46 (8 untagged, 14 unverified critical, 10 incomplete chains, 5 stale, 8 planned scripts). Consistency: 7 (4 status mismatches, 1 HIGH dependency violation [AXM_0120], 1 layer mixing, 1 terminology). Key changes since Run 4: 8 EQ items RESOLVED (EQ-001/004/005/007/009/010/020/022), stale content 17→5, header contradictions 1→0. NEW HIGH issue: AXM_0120 [PROPOSED] supporting CANONICAL axioms (dependency hierarchy violation). Top priority: Om_m = 63/200 mechanism (13.3). Trend: IMPROVING.

## Run 6 — 2026-02-07
Issues: 80 (32% reduction from Run 5). Structural: 59 (0 broken refs, 0 missing headers, ~93 unlisted sessions, ~359 orphaned scripts, 58 size violations). Content: 12 (5 untagged, 1 doc error, 0 critical HRS unverified, 6 planned scripts archived). Consistency: 1 (1 LOW status mismatch THM_0486). Key fixes since Run 5: S264 quality session resolved ALL Run 5 critical/high items (AXM_0120 promoted, CMB boundary tagged, sound horizon error budget, phantom ref removed, terminology 2102 replacements, INDEX.md trimmed). ALL 4 HIGH HRS files now verified. Dependency violations 3→0 (CCP chain CANONICAL). Layer purity 2→0. EQ-039 rescored to #3 (S266: C=24/11, 0.0002 ppm). Top priority: Om_m = 63/200 mechanism (13.3). Trend: IMPROVING (strongest run-over-run improvement).

## Run 7 — 2026-02-07
Issues: 109 (80 standard + 29 lifecycle). Structural: 61 (3 broken refs LOW, 0 headers, 58 size). Content: 9 (2 untagged, 5 unverified, 2 chains). Consistency: 5 (2 mismatches, 2 deps, 1 stale). Lifecycle: 29 (13 superseded, 8 overlap groups, 78 deprecation candidates [5 READY, 5 BLOCKED, 1 REVIEW]). **FIRST Phase 5 scan**: 2 CRITICAL (_INDEX status conflicts, P-008 unmarked falsification), 1 HIGH (alpha 95% redundancy group). EQ-039 rescored 9.6→10.0 (S269: N_colored=24 DERIVED). EQ-041 new (Z_3 confinement, score 4.0). Top priority: Om_m = 63/200 mechanism (13.3). Trend: EXPANDED SCAN (standard phases stable, lifecycle adds new coverage).

## Run 8 — 2026-02-07
Issues: ~14 actionable (cleanest run). Structural: 3 (1 broken ref LOW, 0 headers, 3 size with correct thresholds). Content: 0 actionable (0 untagged, 0 unverified active, 1 controlled chain gap, 0 stale). Consistency: 1 (1 carried MEDIUM THM_0486, 0 deps, 0 purity, 0 terminology). Lifecycle: 10 (0 superseded, 2 redundancy clusters LOW-MEDIUM, ~34 ARCHIVE files in active dirs LOW, 4 OPEN items all LOW-MEDIUM). S271-S281: 10 sessions, ~38 new files, 500+ new tests all PASS. EQ-039 rescored 10.0→9.0 (G:5→4, progress on N_colored + Weinberg coefficient). EQ-038 rescored 5.6→6.0 (D:4→5, mu=0 locus resolved). Dependency violations 2→0. Top priority: Om_m = 63/200 mechanism (13.3). Trend: IMPROVING (78% reduction from Run 7; 0 CRITICAL, 0 HIGH).

## Run 9 — 2026-02-07
Issues: ~22 actionable (expanded scan). Structural: 3 (0 broken refs, 0 headers, 31 size cosmetic). Content: 1 (1 carried chain gap, ~4 stale ACTIVE). Consistency: 1 (1 carried THM_0486). Lifecycle: 8 (8 ARCHIVE in active dirs). Hallucination: 6 precision flags, scripts 689 (99.9% run, 87.5% adjusted all-PASS [84.2% raw, 23 false positives]), 0 tag downgrades, 0 circularities. Propagation: 13 entries, 6 stale refs (5 CRITICAL in publications), completeness 75%. **FIRST full Phase 6+7 run.** 1 CRITICAL: publications say "6 irreducible" (should be 4, S304). 3 missing manifest entries (IRA-01/08/09/10 resolutions). EQ-006/008 RESOLVED, EQ-039 ESSENTIALLY COMPLETE. IRA 6->4. S282-S306: 24 sessions, ~62 new files. Top priority: EQ-015 colored pNGB mass (15.0). Trend: EXPANDED SCAN (Phases 6+7 operational; 1 CRITICAL propagation issue found).

## Run 10 — 2026-02-09
Issues: ~25 actionable. Structural: 3 (0 broken refs, 0 headers, 36 size cosmetic). Content: 1 (1 carried chain gap, 0 stale ACTIVE). Consistency: 1 (1 carried THM_0486). Lifecycle: 2 (3 retractions HANDLED, 2 QUARANTINE in active dirs). Hallucination: 10 precision flags, scripts 713 (100% run, 90.3% adjusted all-PASS), 0 tag downgrades, 0 circularities. Propagation: 20 entries, 8 stale refs (5 CRITICAL in publications CARRIED), completeness ~72%. S307-S320: 14 sessions, 25 new scripts, 8020 PASS assertions. S320 retraction cascade (SU(3)=color correction) properly handled with HP-013. **CRITICAL: publications STILL show "6 irreducible" (should be 4) — carried 2 runs.** 5 EQ items resolved (EQ-013/039/042/006*/008*). EQ-043 NEW (asymmetric DM). Session propagation compliance 14% (1/7 with triggers). Top priority: EQ-015 colored pNGB mass (15.0). Trend: STABLE (core quality excellent; propagation debt carried; retraction handling strong).
