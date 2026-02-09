/**
 * Sync publications from source (publications/) into website content collection.
 * Adds frontmatter required by Astro content collections.
 * Run: npm run sync-publications
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

const publications = [
  {
    source: 'publications/PC_MATHEMATICAL_FOUNDATIONS.md',
    dest: 'website/src/content/publications/math-foundations.md',
    frontmatter: {
      title: 'Perspective Cosmology: Mathematical Foundations',
      description: 'Complete, self-contained mathematical development from axioms to consequences',
      version: '1.0',
      lastUpdated: '2026-02-09',
    },
  },
];

for (const pub of publications) {
  const srcPath = resolve(root, pub.source);
  const destPath = resolve(root, pub.dest);

  const content = readFileSync(srcPath, 'utf-8');
  const fm = Object.entries(pub.frontmatter)
    .map(([k, v]) => `${k}: '${v}'`)
    .join('\n');
  const output = `---\n${fm}\n---\n\n${content}`;

  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, output, 'utf-8');
  console.log(`Synced: ${pub.source} -> ${pub.dest}`);
}

console.log('Done.');
