import { defineCollection, z } from 'astro:content';

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
    lastUpdated: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    category: z.enum(['Results', 'Methodology', 'Comparison', 'Meta']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { publications, blog };
