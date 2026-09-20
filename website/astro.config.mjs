import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Run #1's redirects are NOT configured here. Astro's static `redirects` would
// need every concrete path enumerated -- a `[...slug]` source is a dynamic
// route and fails the build with get-static-paths-required, because in static
// mode there is nothing to expand it against. The site deploys to Cloudflare
// Pages, which reads wildcard rules from `public/_redirects`; that file is the
// source of truth for the /<section>/* -> /run-1/<section>/* moves.
export default defineConfig({
  site: 'https://perspectivecosmology.com',
  integrations: [
    react(),
    tailwind(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
