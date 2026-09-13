/**
 * Drift detection: compares theory source files against website data files.
 * Reads SYNC_MANIFEST.json and uses git to detect staleness.
 *
 * Run: npm run check-sync
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const manifestPath = resolve(__dirname, '..', 'SYNC_MANIFEST.json');

// ── Helpers ──────────────────────────────────────────────────────────

function gitLastModified(filePath) {
  try {
    const abs = resolve(root, filePath);
    if (!existsSync(abs)) return null;
    const out = execSync(`git log -1 --format=%ci -- "${filePath}"`, {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return out ? new Date(out) : null;
  } catch {
    return null;
  }
}

function countFiles(dir, pattern) {
  const abs = resolve(root, dir);
  if (!existsSync(abs)) return 0;
  const ext = pattern.replace('*', '');
  return readdirSync(abs).filter(f => f.endsWith(ext)).length;
}

// ── Main ─────────────────────────────────────────────────────────────

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

let staleData = 0;
let stalePublications = 0;
let okData = 0;
let okPublications = 0;
let unknownCount = 0;

console.log('=== Website Sync Status ===\n');

// ── Data Files ───────────────────────────────────────────────────────

console.log('DATA FILES:');
for (const [name, info] of Object.entries(manifest.dataFiles)) {
  const destPath = resolve(root, info.websitePath);
  if (!existsSync(destPath)) {
    console.log(`  [UNKNOWN]  ${name} -- website file missing`);
    unknownCount++;
    continue;
  }

  const destDate = gitLastModified(info.websitePath);

  // Check each source for staleness
  let staleSource = null;
  for (const src of info.sources) {
    // For directory sources, check the directory itself
    const srcAbs = resolve(root, src);
    if (!existsSync(srcAbs)) continue;

    const srcDate = gitLastModified(src);
    if (srcDate && destDate && srcDate > destDate) {
      staleSource = src;
      break;
    }
  }

  // Special: script count check
  if (info.special?.type === 'script_count') {
    const actual = countFiles(info.special.directory, info.special.pattern);
    if (actual !== info.special.lastKnownCount) {
      console.log(
        `  [STALE]    ${name} -- script count changed: ${info.special.lastKnownCount} -> ${actual}`
      );
      staleData++;
      continue;
    }
  }

  if (staleSource) {
    console.log(`  [STALE]    ${name} -- ${staleSource} changed since ${info.lastSyncedSession}`);
    staleData++;
  } else {
    console.log(`  [OK]       ${name}`);
    okData++;
  }
}

// ── Publications ─────────────────────────────────────────────────────

console.log('\nPUBLICATIONS:');
for (const [slug, info] of Object.entries(manifest.publications)) {
  const srcAbs = resolve(root, info.source);
  const destAbs = resolve(root, info.dest);

  if (!existsSync(srcAbs)) {
    console.log(`  [UNKNOWN]  ${slug} -- source missing: ${info.source}`);
    unknownCount++;
    continue;
  }

  if (!existsSync(destAbs)) {
    console.log(`  [STALE]    ${slug} -- not yet synced (${info.source})`);
    stalePublications++;
    continue;
  }

  const srcDate = gitLastModified(info.source);
  const destDate = gitLastModified(info.dest);

  if (srcDate && destDate && srcDate > destDate) {
    console.log(`  [STALE]    ${slug} -- source updated since last sync`);
    stalePublications++;
  } else {
    console.log(`  [OK]       ${slug}`);
    okPublications++;
  }
}

// ── Summary ──────────────────────────────────────────────────────────

console.log('\n--- Summary ---');
console.log(
  `Data files:   ${staleData} stale, ${okData} ok` +
    (unknownCount > 0 ? `, ${unknownCount} unknown` : '')
);
console.log(`Publications: ${stalePublications} stale, ${okPublications} ok`);

if (staleData + stalePublications === 0 && unknownCount === 0) {
  console.log('\nAll synced.');
} else {
  console.log(
    `\n${staleData + stalePublications} item(s) need attention.`
  );
}
