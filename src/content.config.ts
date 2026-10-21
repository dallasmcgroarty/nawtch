import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const updates = defineCollection({
  loader: file('src/data/updates.json', {
    parser: (text) => {
      const entries = JSON.parse(text) as Array<{ date: string; title: string; [key: string]: unknown }>;
      return entries.map((entry) => ({
        ...entry,
        id: `${entry.date}-${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      }));
    },
  }),
  schema: z.object({
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
      .refine((date) => {
        const parsed = new Date(`${date}T00:00:00Z`);
        return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
      }, 'Date must be a valid calendar date'),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    category: z.enum(['New', 'Improved', 'Fixed']),
    link: z.string()
      .refine((link) => link.startsWith('/') && !link.startsWith('//'), 'Link must be a relative site URL')
      .optional(),
  }),
});

export const collections = { updates };