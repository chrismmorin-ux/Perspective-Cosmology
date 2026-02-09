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

export const collections = { publications };
