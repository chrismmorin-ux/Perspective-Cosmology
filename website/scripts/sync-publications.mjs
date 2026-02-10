/**
 * Sync publications from source (publications/) into website content collection.
 * Reads publication entries from SYNC_MANIFEST.json.
 * Adds Astro frontmatter, strips any existing YAML frontmatter from source.
 * Auto-detects lastUpdated from git history.
 *
 * Usage:
 *   npm run sync-publications             # sync all
 *   npm run sync-publications -- --dry-run # preview without writing
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const manifestPath = resolve(__dirname, '..', 'SYNC_MANIFEST.json');
const dryRun = process.argv.includes('--dry-run');

// ── Helpers ──────────────────────────────────────────────────────────

function gitLastModifiedDate(filePath) {
  try {
    const out = execSync(`git log -1 --format=%ci -- "${filePath}"`, {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return out ? out.slice(0, 10) : null; // YYYY-MM-DD
  } catch {
    return null;
  }
}

function gitVersion(filePath) {
  try {
    const out = execSync(`git log --oneline -- "${filePath}"`, {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    const commits = out.split('\n').filter(Boolean).length;
    return `1.${commits}`;
  } catch {
    return '1.0';
  }
}

function stripExistingFrontmatter(content) {
  // Remove YAML frontmatter (--- ... ---) if present at the start
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (match) {
    return content.slice(match[0].length);
  }
  return content;
}

// ── Main ─────────────────────────────────────────────────────────────

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

if (dryRun) {
  console.log('[DRY RUN] No files will be written.\n');
}

let synced = 0;
let skipped = 0;

for (const [slug, pub] of Object.entries(manifest.publications)) {
  const srcPath = resolve(root, pub.source);
  const destPath = resolve(root, pub.dest);

  if (!existsSync(srcPath)) {
    console.log(`[SKIP] ${slug} -- source not found: ${pub.source}`);
    skipped++;
    continue;
  }

  // Read and strip existing frontmatter
  let content = readFileSync(srcPath, 'utf-8');
  content = stripExistingFrontmatter(content);

  // Auto-detect metadata from git
  const lastUpdated = gitLastModifiedDate(pub.source) || 'unknown';
  const version = gitVersion(pub.source);

  // Build Astro frontmatter
  const fm = [
    `title: '${pub.frontmatter.title.replace(/'/g, "''")}'`,
    `description: '${pub.frontmatter.description.replace(/'/g, "''")}'`,
    `version: '${version}'`,
    `lastUpdated: '${lastUpdated}'`,
  ].join('\n');

  const output = `---\n${fm}\n---\n\n${content}`;

  if (dryRun) {
    console.log(`[WOULD SYNC] ${pub.source} -> ${pub.dest}`);
    console.log(`             title: ${pub.frontmatter.title}`);
    console.log(`             lastUpdated: ${lastUpdated}, version: ${version}`);
  } else {
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, output, 'utf-8');
    console.log(`[SYNCED] ${pub.source} -> ${pub.dest}`);
  }
  synced++;
}

console.log(`\nDone. ${synced} synced, ${skipped} skipped.`);
