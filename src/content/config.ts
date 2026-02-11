import { defineCollection, z } from 'astro:content';

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
  }).passthrough(),
});

export const collections = {
  'products': productsCollection,
};
