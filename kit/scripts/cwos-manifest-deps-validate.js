#!/usr/bin/env node
/**
 * cwos-manifest-deps-validate — publish-time completeness gate for kit/MANIFEST.yaml.
 *
 * kit/MANIFEST.yaml is a hand-maintained map of every file the kit ships, and
 * nothing verified it was COMPLETE. A script could be registered while a module
 * it require()s was not, and the omission stayed invisible until an adopted repo
 * crashed at require-time.
 *
 * That is WS-544: upgrading claude-poker-tracker 3.8.0 -> 3.8.1 overwrote four
 * scripts with versions that eagerly require('./lib/cli'), a module the manifest
 * never shipped. All four died at require(). The upgrade's own validation gate
 * still reported 7/7 green — it exercises reconcile / next / pulse / audit and
 * never loads those scripts. Registering the missing files by hand fixed the
 * instances and left the class intact; this gate closes the class.
 *
 * WHAT IT CHECKS, over every .js registered in the manifest:
 *
 *   unregistered-dep  a resolved relative require() target is absent from the
 *                     manifest — it would not ship, and the consumer would die
 *                     at require() in every adopted repo.
 *   tier-inversion    the target ships at a LATER capability tier than its
 *                     consumer, so a repo enabling the consumer's tier installs
 *                     the script without the module. Capability tiers are
 *                     cumulative (see lib/capability-map.js closeDownward), so
 *                     the rule is dep.tier <= consumer.tier.
 *   absent-source     a manifest `source:` does not exist on disk. Install pushes
 *                     "Source missing:" into state.errors and CONTINUES, so this
 *                     is otherwise recorded once per adoption and never read.
 *
 * AND, over kit/data (WS-607):
 *
 *   unshipped-dist-data  a file exists under kit/data/ that neither MANIFEST
 *                     ships nor lib/kit-data-manifest.js declares genesis-only.
 *                     Scripts resolve that directory from the DIST ROOT, so in
 *                     an adopted repo the file is simply absent and the first
 *                     symptom is a runtime ENOENT in a downstream command.
 *
 * AND, over the M0 seed list in lib/m0-manifest.js (WS-611):
 *
 *   m0-unshipped-dep  a script /genesis installs at M0 hard-requires a module
 *                     /genesis does not install. The scaffolded repo has the
 *                     consumer and not the dependency, so the founder's first
 *                     command dies at require() — which is precisely what
 *                     happened: M0_SCRIPTS listed lib/tier-mapper.js and not the
 *                     lib/kit-paths.js it requires, and `cwos-stage.js resolve`
 *                     died `Cannot find module './kit-paths'` in every repo
 *                     /genesis ever scaffolded.
 *   m0-absent-source  an M0 entry (script or schema directory) does not exist in
 *                     the distribution. installAsset() treats a missing script
 *                     as skipped and continues, so this is otherwise silent
 *                     until the founder runs the command.
 *
 * WHY M0 COVERAGE LIVES IN THIS GATE, TOO. Same argument as kit/data above, one
 * list further on. /genesis is a THIRD distribution path with all of MANIFEST's
 * responsibilities and none of its guarantees: the list was a JavaScript array
 * inside cwos-genesis-scaffold.js, so no gate could see it, and the omission was
 * found by scaffolding a probe repo and running the command rather than by any
 * check. Moving the list to lib/m0-manifest.js makes it data; asking the same
 * closure question here makes it governed. Being here, it inherits
 * cwos-hash-manifest's refusal to write a release baseline on violations: a kit
 * version can no longer be cut with an M0 install that cannot require itself.
 *
 * WHAT THE M0 CHECK DELIBERATELY DOES NOT DO:
 *
 *   derive the list  Closure over hard AND guarded requires is 38 modules
 *                    against 23 seeded. Deriving would push 15 more files into
 *                    every scaffolded repo, 13 of them optional by design. M0 is
 *                    a deliberately small dormant install; silently tripling it
 *                    to satisfy a gate is a behaviour change to a working path.
 *                    Curated list, gated closure (WS-611 decision).
 *   fail on commands M0_COMMANDS names 7 command markdown files that between
 *                    them invoke 15 scripts M0 does not install. Those are
 *                    reported under `m0_command_coverage` and never failed, for
 *                    the reason INV-073 declines the same fight: a command is
 *                    prose a session can degrade around (CLAUDE.md, Graceful
 *                    Degradation), a require() is not. Landing a hard gate over
 *                    15 pre-existing gaps would be an outage, not a gate.
 *
 * WHY DATA COVERAGE LIVES IN THIS GATE. This script asked "does MANIFEST ship
 * everything the kit needs?" about require() and never about data, and WS-596
 * fell straight through that gap: kit/data had zero manifest rows while
 * tier-mapper.js read it from the dist root, so four of ten adopted repos could
 * not run the archetype/stage commands at all — and /kit-upgrade could not
 * repair it, because it syncs MANIFEST-listed files and these were not listed.
 * The asymmetry between code-coverage and data-coverage WAS the bug, so the fix
 * belongs inside this gate rather than beside it. Being here, it inherits
 * cwos-hash-manifest's refusal to write a release baseline on violations: a kit
 * version can no longer be cut with an unshipped data file.
 *
 * It is a DIRECTORY-COVERAGE check, not static analysis of read expressions.
 * The known readers resolve kit/data five different ways — path.join(
 * resolveDistRoot(),'kit','data') in lib/tier-mapper.js, rp('kit/data/...') in
 * cwos-constitutional-audit.js, path.join(__dirname,'..','data',...) in
 * cwos-stage-detect.js, and more. Parsing all of them is fragile and would
 * still miss the sixth form someone writes next. "Every file in the directory
 * is accounted for" cannot be fooled by a new expression shape, and it catches
 * the failure that actually happens: a file was added and nobody shipped it.
 *
 * WHAT IT DELIBERATELY DOES NOT FAIL ON:
 *
 *   guarded requires  `try { x = require('./y'); } catch {}` is the established
 *                     idiom for optional deps (20+ call sites; see the factory
 *                     comment in lib/cwos-utils.js). Those tolerate absence by
 *                     design. Reported under `optional`, never as a violation.
 *   dynamic requires  require(<expression>) cannot be resolved statically.
 *                     Reported under `unanalyzable` so the blind spot is visible
 *                     rather than silently assumed safe.
 *
 * TWO THINGS THAT LOOK LIKE DETAILS AND ARE NOT:
 *
 *   1. Comments are stripped before scanning. lib/cwos-utils.js:901 is a COMMENT
 *      illustrating the guarded-import pattern; a raw regex reads it as a real
 *      require of './core/events' (which does not exist — the live requires two
 *      lines down use '../core/events'). A gate that cries wolf gets disabled.
 *   2. Directory modules resolve. core/defer-translators is a directory with an
 *      index.js; a naive existsSync(spec + '.js') reads it as missing.
 *
 * Usage:
 *   node kit/scripts/cwos-manifest-deps-validate.js            # JSON to stdout
 *   node kit/scripts/cwos-manifest-deps-validate.js --human
 *   node kit/scripts/cwos-manifest-deps-validate.js --root <p>
 *
 * Exit codes: 0 = clean | 1 = violation(s) | 2 = invalid arg / manifest unreadable.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { readYAMLFile } = require('./lib/cwos-utils');
const { CAPABILITY_ORDER } = require('./lib/capability-map');
const { classifyDataFiles } = require('./lib/kit-data-manifest');
const m0Manifest = require('./lib/m0-manifest');

const CLI = {
  name: 'cwos-manifest-deps-validate',
  summary: 'verify kit/MANIFEST.yaml ships every module its registered scripts require',
  flags: {
    human: { type: 'boolean', describe: 'render a readable report instead of JSON' },
    root: { type: 'string', placeholder: 'path', describe: 'HomeBase root (default: walk up from this script)' },
  },
  notes: [
    'Also covers kit/data distribution coverage (WS-607) and the /genesis M0 seed',
    'list in lib/m0-manifest.js (WS-611) — three distribution paths, one gate.',
    '',
    'Runs at publish time from cwos-hash-manifest.js, so an unregistered dependency',
    'cannot reach a kit release, and as INV-064 in cwos-verify.js.',
    '',
    'Guarded requires (try/catch) and dynamic require(<expr>) are reported but never',
    'fail the gate — the first are optional by design, the second are unanalyzable.',
  ].join('\n'),
};

// ─── source scanning ────────────────────────────────────────────────────────

/**
 * Blank out comment content so commented-out or illustrative require() calls are
 * not mistaken for real ones, returning an array of lines with line numbers
 * intact.
 *
 * This is a character scanner rather than a regex pass, and both properties are
 * load-bearing. A `text.replace(/\/\*[\s\S]*?\*\//g, '')` implementation fails
 * twice on real kit sources:
 *
 *   - it deletes the newlines inside block comments, so every line number after
 *     the first block comment is wrong (core/state-store.js: 552 lines -> 457);
 *   - it is blind to `/*` inside a string literal. state-store.js has 11 `/*`
 *     and 7 `*​/`; the unmatched openers pair with a later close and SWALLOW the
 *     code between them — which is exactly how the real dynamic require at
 *     state-store.js:513 went undetected. Silently skipping code is a worse
 *     failure than not scanning at all.
 *
 * Strings (all three quote styles) are tracked so their contents can never open
 * a comment. Comment characters are replaced with spaces, preserving offsets so
 * the `try`-before-require test still sees the original column layout.
 */
function stripComments(text) {
  const src = String(text);
  const out = new Array(src.length);
  let i = 0;
  let state = 'code'; // code | line | block | sq | dq | tpl

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    const isNewline = c === '\n';

    if (state === 'code') {
      if (c === '/' && next === '/') { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i += 2; continue; }
      if (c === '/' && next === '*') { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i += 2; continue; }
      if (c === "'") state = 'sq';
      else if (c === '"') state = 'dq';
      else if (c === '`') state = 'tpl';
      out[i] = c; i++; continue;
    }

    if (state === 'line') {
      // Newlines always survive so line numbering is preserved.
      out[i] = isNewline ? c : ' ';
      if (isNewline) state = 'code';
      i++; continue;
    }

    if (state === 'block') {
      if (c === '*' && next === '/') { out[i] = ' '; out[i + 1] = ' '; state = 'code'; i += 2; continue; }
      out[i] = isNewline ? c : ' ';
      i++; continue;
    }

    // Inside a string literal: copy verbatim, honour escapes, and bail out at a
    // newline so an unterminated quote cannot swallow the rest of the file.
    out[i] = c;
    if (c === '\\' && i + 1 < src.length) { out[i + 1] = src[i + 1]; i += 2; continue; }
    if (isNewline) { state = 'code'; i++; continue; }
    if ((state === 'sq' && c === "'") || (state === 'dq' && c === '"') || (state === 'tpl' && c === '`')) {
      // Closing quote only when it is not the opening one we just entered on.
      state = 'code';
    }
    i++;
  }

  return out.join('').split('\n');
}

const RELATIVE_REQUIRE = /require\(\s*(['"])(\.[^'"]*)\1\s*\)/;
// Matched against the STRUCTURAL view, where string contents are blanked to
// spaces. So a literal require('./x') reads as `require(        )` and must NOT
// match: the first meaningful character after the paren has to be neither
// whitespace nor a closing paren. Excluding quote and backslash keeps regex
// literals and any unblanked quote from registering as a call site.
const DYNAMIC_REQUIRE = /require\(\s*[^)\s'"\\]/;

/**
 * Blank string CONTENTS as well as comments, yielding a view safe for counting
 * braces. Needed because `{` and `}` inside a string literal would otherwise
 * corrupt block-depth tracking.
 */
function structuralView(text) {
  const lines = stripComments(text);
  return lines.map((line) => {
    let out = '';
    let quote = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quote) {
        if (c === '\\') { out += '  '; i++; continue; }
        out += ' ';
        if (c === quote) quote = null;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') { quote = c; out += ' '; continue; }
      out += c;
    }
    return out;
  });
}

/**
 * Return a Set of 1-based line numbers that sit inside a `try { … }` block.
 *
 * Guarded requires are the established idiom for optional dependencies, and the
 * kit writes them BOTH ways — single-line
 *   `try { ({ appendEvent } = require('../core/events')); } catch {}`
 * and multi-line
 *   `try {`
 *   `  const { runSweep } = require('./cwos-engine-complete');`
 * A same-line `try` test only catches the first, which would report every
 * multi-line guarded require as a violation. Depth tracking catches both.
 */
function tryGuardedLines(text) {
  const lines = structuralView(text);
  const guarded = new Set();
  let depth = 0;
  const openTries = []; // depths at which a try block body began

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    if (openTries.length) guarded.add(lineNo);

    // Scan tokens left-to-right so `try {` on this line guards this line too.
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '{') {
        // A `try` immediately preceding this brace opens a guarded body.
        if (/\btry\s*$/.test(line.slice(0, i))) {
          depth++;
          openTries.push(depth);
          guarded.add(lineNo);
          continue;
        }
        depth++;
      } else if (c === '}') {
        if (openTries.length && openTries[openTries.length - 1] === depth) openTries.pop();
        depth--;
      }
    }
  });

  return guarded;
}

/**
 * Resolve a relative specifier the way Node does, including directory modules.
 * Returns a repo-relative POSIX path, or null when nothing exists on disk.
 */
function resolveRequire(root, fromRel, spec) {
  const baseAbs = path.resolve(root, path.dirname(fromRel), spec);
  const candidates = [baseAbs, `${baseAbs}.js`, path.join(baseAbs, 'index.js'), `${baseAbs}.json`];
  for (const abs of candidates) {
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      return path.relative(root, abs).split(path.sep).join('/');
    }
  }
  return null;
}

/**
 * Extract every relative require from a file, tagging each as guarded or hard.
 * A require is "guarded" when it sits inside a `try { … }` block — the idiom
 * kit/scripts uses for optional dependencies, which tolerate absence by design.
 */
function scanRequires(text) {
  const out = [];
  const guarded = tryGuardedLines(text);
  stripComments(text).forEach((line, i) => {
    let rest = line;
    for (;;) {
      const m = RELATIVE_REQUIRE.exec(rest);
      if (!m) break;
      out.push({ spec: m[2], line: i + 1, guarded: guarded.has(i + 1) });
      rest = rest.slice(m.index + m[0].length);
    }
  });
  return out;
}

/**
 * Detect require(<expression>) call sites. Runs against the STRUCTURAL view, not
 * merely the comment-stripped one: prose like "dynamic require(<expr>) is
 * reported" inside a doc string is not a call site, and reporting the scanner's
 * own help text as an unanalyzable dependency is exactly the kind of noise that
 * teaches people to ignore the output.
 */
function hasDynamicRequire(text) {
  return structuralView(text).some((line) => DYNAMIC_REQUIRE.test(line));
}

// ─── the check ──────────────────────────────────────────────────────────────

function tierIndex(capability) {
  return CAPABILITY_ORDER.indexOf(capability);
}

// ─── M0 seed-list closure (WS-611) ──────────────────────────────────────────

/**
 * Ask of lib/m0-manifest.js exactly what this gate asks of kit/MANIFEST.yaml:
 * does every hard require of everything it ships resolve to something it also
 * ships?
 *
 * Same scanner, same guarded-require tolerance, same shape of answer — the M0
 * list is a distribution list, so it gets the distribution list's question. The
 * `lists` argument exists for the test suite: passing a deliberately incomplete
 * list is how the gate is proven to fail on its own target bug, without
 * mutating the shipped one.
 *
 * KIT-SOURCE ONLY, and that is not a shortcut. The question "does the
 * distribution contain everything /genesis will copy" is only answerable where
 * the distribution is whole — the hub. An adopted repo holds the subset its
 * capability tier installs, so cwos-pulse.js (governance) is legitimately absent
 * from a core-tier repo and reporting that as a violation would fail this
 * invariant everywhere it is not the invariant's business. Same reasoning as
 * INV-075's HomeBase-only scope. `fleet/registry.yaml` is the hub marker
 * (lib/kit-paths.js HOMEBASE_MARKER); everything else gets `skipped`, which is
 * printed, so "not checked" never reads as "checked and clean".
 */
function checkM0Closure(root, lists) {
  const m0 = lists || m0Manifest;
  if (!m0 || !Array.isArray(m0.M0_SCRIPTS)) {
    return { ok: true, skipped: 'lib/m0-manifest.js unavailable', violations: [], optional: [] };
  }
  if (!fs.existsSync(path.join(root, 'fleet', 'registry.yaml'))) {
    return { ok: true, skipped: 'not the kit source hub — /genesis ships from HomeBase only', violations: [], optional: [] };
  }

  const listed = new Set(m0.M0_SCRIPTS.map((s) => String(s).split('\\').join('/')));
  const violations = [];
  const optional = [];

  // m0-absent-source: an entry the distribution does not actually contain.
  // installAsset() records a missing script as `skipped` and carries on, so
  // without this the scaffold reports success over an incomplete install.
  for (const rel of listed) {
    if (!fs.existsSync(path.join(root, rel))) {
      violations.push({
        kind: 'm0-absent-source',
        source: rel,
        detail: `lib/m0-manifest.js ships ${rel} at M0 but it does not exist — /genesis records it as skipped and continues`,
      });
    }
  }
  for (const dirRel of m0.M0_SCHEMA_DIRS || []) {
    const abs = path.join(root, dirRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
      violations.push({
        kind: 'm0-absent-source',
        source: dirRel,
        detail: `lib/m0-manifest.js mirrors ${dirRel} at M0 but it is not a directory — scaffolded repos get no event schemas`,
      });
    }
  }

  // m0-unshipped-dep: the WS-611 defect. A listed script hard-requires a module
  // the list omits, so the scaffolded repo has the consumer without the
  // dependency. Guarded requires are optional by design (see the header).
  for (const rel of listed) {
    const abs = path.join(root, rel);
    if (!rel.endsWith('.js') || !fs.existsSync(abs)) continue;

    for (const req of scanRequires(fs.readFileSync(abs, 'utf8'))) {
      const target = resolveRequire(root, rel, req.spec);
      if (!target || listed.has(target)) continue;

      const rec = {
        kind: 'm0-unshipped-dep',
        source: rel,
        line: req.line,
        spec: req.spec,
        target,
        detail:
          `${rel} is installed at M0 and hard-requires ${target}, which lib/m0-manifest.js does not install — ` +
          "a /genesis-scaffolded repo dies `Cannot find module` on the first command that loads it (this is WS-611)",
      };
      if (req.guarded) optional.push({ ...rec, kind: 'm0-unshipped-guarded' });
      else violations.push(rec);
    }
  }

  return {
    ok: violations.length === 0,
    scripts_checked: listed.size,
    violations,
    optional,
  };
}

/**
 * The M0 command edges, reported and never failed.
 *
 * INV-073's question, asked of the M0 list: does every script an M0 command
 * invokes actually get installed at M0? It cannot be a gate for INV-073's own
 * stated reason — a command is prose a session degrades around, and 15 of the
 * ~26 edges are gaps that predate the check. Reporting them keeps the question
 * answerable, which is the whole failure mode WS-596 lived inside: nobody could
 * say whether anything had looked.
 *
 * Degrades to `null` (not an empty answer) when the command-side scanner or the
 * command tree is absent, so "no gaps" can never be confused with "no look".
 */
function m0CommandCoverage(root) {
  const m0 = m0Manifest;
  if (!m0 || !Array.isArray(m0.M0_COMMANDS)) return null;
  // Kit-source only, for the same reason checkM0Closure is.
  if (!fs.existsSync(path.join(root, 'fleet', 'registry.yaml'))) return null;

  let scanInvocations, normalizeRef;
  try { ({ scanInvocations, normalizeRef } = require('./cwos-command-deps-validate')); }
  catch { return null; }

  const listed = new Set(m0.M0_SCRIPTS.map((s) => String(s).split('\\').join('/')));
  const gaps = [];
  let edges = 0;
  let commands = 0;

  for (const cmd of m0.M0_COMMANDS) {
    const file = path.join(root, 'kit', 'commands', `${cmd}.md`);
    if (!fs.existsSync(file)) {
      gaps.push({ command: cmd, target: null, detail: `kit/commands/${cmd}.md does not exist — /genesis hardlinks nothing for it` });
      continue;
    }
    commands += 1;
    const refs = new Set();
    for (const inv of scanInvocations(fs.readFileSync(file, 'utf8'))) {
      const target = normalizeRef(inv.raw);
      if (target) refs.add(target);
    }
    for (const target of refs) {
      edges += 1;
      if (!listed.has(target)) gaps.push({ command: cmd, target });
    }
  }

  return { commands, edges, gaps };
}

/**
 * Pure check. Returns a plain result object; never exits, never writes.
 * Exported so cwos-verify.js and the test suite can call it directly.
 */
function checkManifestDeps(root) {
  const manifestPath = path.join(root, 'kit', 'MANIFEST.yaml');
  const read = readYAMLFile(manifestPath);
  if (!read.ok) {
    return { ok: false, exit_code: 2, error: `cannot read kit/MANIFEST.yaml: ${read.error}`, violations: [] };
  }
  const entries = read.data && read.data.files;
  if (!Array.isArray(entries)) {
    return { ok: false, exit_code: 2, error: 'kit/MANIFEST.yaml has no files array', violations: [] };
  }

  const bySource = new Map();
  for (const e of entries) {
    if (e && e.source) bySource.set(String(e.source).split('\\').join('/'), e);
  }

  const violations = [];
  const optional = [];
  const unanalyzable = [];

  // absent-source: every declared source must exist on disk.
  for (const [src, entry] of bySource) {
    if (!fs.existsSync(path.join(root, src))) {
      violations.push({
        kind: 'absent-source',
        source: src,
        capability: entry.capability || null,
        detail: `manifest declares ${src} but it does not exist — /adopt records "Source missing:" in state.errors and continues`,
      });
    }
  }

  // unshipped-dist-data (WS-607): every file under kit/data must be reachable
  // by one of the two distribution paths. See lib/kit-data-manifest.js for why
  // there are two and why only one of them is legitimate.
  let dataCoverage = null;
  try {
    dataCoverage = classifyDataFiles(root);
    for (const rel of dataCoverage.unaccounted) {
      violations.push({
        kind: 'unshipped-dist-data',
        source: rel,
        detail:
          `${rel} exists under kit/data but kit/MANIFEST.yaml does not ship it and it is not declared ` +
          'genesis-only — scripts resolve kit/data from the DIST ROOT, so in an adopted repo it is absent ' +
          'and the first symptom is a runtime ENOENT (this is WS-596)',
      });
    }
  } catch (err) {
    // A manifest this script already parsed cannot normally fail here, so this
    // is a real fault, not an absent optional input. Surface it rather than
    // letting the coverage check quietly contribute nothing.
    violations.push({
      kind: 'unshipped-dist-data',
      source: 'kit/data',
      detail: `could not compute kit/data coverage: ${err.message}`,
    });
  }

  // m0-unshipped-dep / m0-absent-source (WS-611): the /genesis M0 seed list is
  // the third distribution path, and until now the only ungoverned one.
  let m0Closure = null;
  try {
    m0Closure = checkM0Closure(root);
    violations.push(...m0Closure.violations);
    optional.push(...m0Closure.optional);
  } catch (err) {
    violations.push({
      kind: 'm0-unshipped-dep',
      source: 'kit/scripts/lib/m0-manifest.js',
      detail: `could not compute M0 seed-list closure: ${err.message}`,
    });
  }

  let m0Commands = null;
  try { m0Commands = m0CommandCoverage(root); } catch { m0Commands = null; }

  // require-graph checks over registered .js only.
  for (const [src, entry] of bySource) {
    if (!src.endsWith('.js')) continue;
    const abs = path.join(root, src);
    if (!fs.existsSync(abs)) continue; // already reported as absent-source

    const text = fs.readFileSync(abs, 'utf8');
    if (hasDynamicRequire(text)) unanalyzable.push({ source: src, reason: 'dynamic require(<expression>)' });

    for (const req of scanRequires(text)) {
      const target = resolveRequire(root, src, req.spec);

      if (!target) {
        // Nothing on disk at all. Guarded ones are tolerated by design.
        const rec = {
          kind: 'unresolvable-require',
          source: src,
          line: req.line,
          spec: req.spec,
          detail: `require('${req.spec}') resolves to nothing on disk`,
        };
        if (req.guarded) optional.push({ ...rec, kind: 'unresolvable-guarded' });
        else violations.push(rec);
        continue;
      }

      const targetEntry = bySource.get(target);

      if (!targetEntry) {
        const rec = {
          kind: 'unregistered-dep',
          source: src,
          line: req.line,
          spec: req.spec,
          target,
          detail: `${src} requires ${target}, which kit/MANIFEST.yaml does not ship`,
        };
        if (req.guarded) optional.push({ ...rec, kind: 'unregistered-guarded' });
        else violations.push(rec);
        continue;
      }

      const consumerTier = tierIndex(entry.capability);
      const depTier = tierIndex(targetEntry.capability);
      if (consumerTier >= 0 && depTier >= 0 && depTier > consumerTier) {
        const rec = {
          kind: 'tier-inversion',
          source: src,
          line: req.line,
          target,
          consumer_capability: entry.capability,
          dep_capability: targetEntry.capability,
          detail: `${src} [${entry.capability}] requires ${target} [${targetEntry.capability}] — a repo at the consumer's tier installs the script without the module`,
        };
        if (req.guarded) optional.push({ ...rec, kind: 'tier-inversion-guarded' });
        else violations.push(rec);
      }
    }
  }

  return {
    ok: violations.length === 0,
    exit_code: violations.length === 0 ? 0 : 1,
    entries_checked: bySource.size,
    scripts_checked: [...bySource.keys()].filter((s) => s.endsWith('.js')).length,
    data_coverage: dataCoverage,
    m0_closure: m0Closure,
    m0_command_coverage: m0Commands,
    violations,
    optional,
    unanalyzable,
  };
}

// ─── rendering ──────────────────────────────────────────────────────────────

function renderHuman(result) {
  const out = [];
  if (result.error) return `manifest-deps: ERROR — ${result.error}\n`;

  out.push(`manifest-deps: ${result.entries_checked} manifest entries, ${result.scripts_checked} registered .js scanned.`);

  if (!result.violations.length) {
    out.push('  OK — every hard require resolves to a registered file at or below its consumer\'s tier.');
  } else {
    out.push(`  ${result.violations.length} violation(s):`);
    for (const v of result.violations) out.push(`    [${v.kind}] ${v.detail}`);
  }

  // Stated on every run, pass or fail. A coverage check that only speaks when
  // it fails leaves "did it even look at kit/data?" unanswerable — and an
  // unanswerable version of that question is what WS-596 lived inside.
  if (result.data_coverage) {
    const d = result.data_coverage;
    out.push(
      `  kit/data: ${d.on_disk_count} file(s) — ${d.shipped.length} shipped by MANIFEST, ` +
      `${d.genesis_only.length} genesis-only, ${d.unaccounted.length} unaccounted.`
    );
  }

  // Stated on every run, same reasoning as kit/data above. The M0 list was
  // ungoverned for its whole life and nobody could tell, because nothing said
  // anything about it either way.
  if (result.m0_closure) {
    const m = result.m0_closure;
    out.push(
      m.skipped
        ? `  M0 seed list: not checked — ${m.skipped}.`
        : `  M0 seed list: ${m.scripts_checked} file(s) installed by /genesis, ` +
          `${m.violations.length} unshipped hard dep(s), ${m.optional.length} guarded.`
    );
  }
  if (result.m0_command_coverage) {
    const c = result.m0_command_coverage;
    out.push(
      `  M0 commands: ${c.commands} command(s), ${c.edges} script invocation(s), ` +
      `${c.gaps.length} naming a script M0 does not install (reported, not failed — see header).`
    );
    for (const g of c.gaps.slice(0, 20)) {
      out.push(`    /${g.command} -> ${g.target || g.detail}`);
    }
    if (c.gaps.length > 20) out.push(`    … and ${c.gaps.length - 20} more`);
  }

  if (result.optional.length) {
    out.push(`  ${result.optional.length} guarded require(s) — optional by design, not failing:`);
    for (const o of result.optional.slice(0, 10)) {
      out.push(`    [${o.kind}] ${o.source}${o.line ? ':' + o.line : ''} -> ${o.target || o.spec}`);
    }
    if (result.optional.length > 10) out.push(`    … and ${result.optional.length - 10} more`);
  }

  if (result.unanalyzable.length) {
    out.push(`  ${result.unanalyzable.length} file(s) use dynamic require() and cannot be statically verified:`);
    for (const u of result.unanalyzable) out.push(`    ${u.source}`);
  }

  return out.join('\n') + '\n';
}

// ─── entry point ────────────────────────────────────────────────────────────

function findRoot(override) {
  if (override) return path.resolve(override);
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'kit', 'MANIFEST.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // WS-549: kit/MANIFEST.yaml is distribution content, so the fallback is the
  // distribution root rather than a hop count.
  return require('./lib/kit-paths').resolveDistRoot();
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const root = findRoot(values.root);
  const result = checkManifestDeps(root);

  if (values.human) process.stdout.write(renderHuman(result));
  else process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  process.exit(result.exit_code);
}

module.exports = {
  checkManifestDeps,
  checkM0Closure,
  m0CommandCoverage,
  stripComments,
  scanRequires,
  resolveRequire,
  renderHuman,
};

if (require.main === module) main();
