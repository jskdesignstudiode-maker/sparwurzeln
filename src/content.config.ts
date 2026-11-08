import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Hilfen: Das Admin-Werkzeug schreibt leere Felder manchmal als "" oder null.
const text = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() !== '' ? v : undefined));
const date = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.coerce.date().optional(),
);

export const ICONS = ['coin', 'sprout', 'pot', 'jar', 'tools'] as const;
export const ARTICLE_STATUS = ['entwurf', 'in-pruefung', 'freigegeben', 'archiviert'] as const;

const kategorien = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/kategorien' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(100),
    icon: z.enum(ICONS).default('sprout'),
    short: z.string(),
    description: z.string(),
    metaDescription: z.string(),
    subcategories: z.array(z.object({ title: z.string() })).default([]),
  }),
});

const produkte = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/produkte' }),
  schema: z.object({
    name: z.string(),
    category: text, // Kategorie-ID (Dateiname der Kategorie)
    network: z.enum(['amazon', 'awin', 'direkt', 'eigenes-produkt', 'sonstige']).default('sonstige'),
    url: z.string().url(),
    description: z.string(),
    features: z.array(z.string()).default([]), // geprüfte Eigenschaften
    image: text, // nur zulässige, selbst hochgeladene Bilder
    imageAlt: text,
    status: z.enum(['entwurf', 'veroeffentlicht', 'archiviert']).default('entwurf'),
    lastChecked: date, // letzter Prüftermin
  }),
});

const artikel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artikel' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(ARTICLE_STATUS).default('entwurf'),
    category: z.string(), // Kategorie-ID; unbekannte IDs werden beim Build gemeldet, nicht veröffentlicht
    description: text, // Meta-Beschreibung
    seoTitle: text,
    publishDate: date, // geplante Veröffentlichung (leer = sofort nach Freigabe)
    lastReviewed: date, // letzter Prüftermin
    sensitiveTopic: z.boolean().default(false), // Gesundheit, Finanzen, Lebensmittelsicherheit
    image: text,
    imageAlt: text,
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    products: z.array(z.string()).default([]), // Produkt-IDs; fehlende Produkte werden einfach übersprungen
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
    pinterest: z
      .object({
        title: text,
        description: text,
        image: text,
        status: z.enum(['offen', 'bereit', 'gepostet']).default('offen'),
      })
      .nullish()
      .transform((v) => v ?? undefined),
    reviewNotes: text, // interne Prüfhinweise, werden nie angezeigt
  }),
});

export const collections = { kategorien, produkte, artikel };
