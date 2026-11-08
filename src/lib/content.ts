import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'artikel'>;
export type Category = CollectionEntry<'kategorien'>;
export type Product = CollectionEntry<'produkte'>;

export async function getCategories(): Promise<Category[]> {
  const all = await getCollection('kategorien');
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'de'));
}

/** Gründe, warum ein freigegebener Ratgeber (noch) nicht erscheinen darf. */
export function publishProblems(a: Article, categoryIds: Set<string>): string[] {
  const d = a.data;
  const problems: string[] = [];
  if (!categoryIds.has(d.category)) problems.push(`Kategorie „${d.category}“ existiert nicht`);
  if (!d.description) problems.push('Meta-Beschreibung fehlt');
  if (!d.lastReviewed) problems.push('Letzter Prüftermin fehlt');
  if (d.sensitiveTopic && d.sources.length === 0) problems.push('Sensibles Thema, aber keine Quellen angegeben');
  if (!a.body || a.body.trim() === '') problems.push('Text ist leer');
  if (a.body && /\[PRÜFEN/i.test(a.body)) problems.push('Text enthält noch [PRÜFEN]-Markierungen');
  return problems;
}

/** Veröffentlichungsdatum für Sortierung und Anzeige. */
export function effectiveDate(a: Article): Date {
  return a.data.publishDate ?? a.data.lastReviewed ?? new Date(0);
}

/**
 * Nur Ratgeber mit Status „freigegeben“, deren Veröffentlichungsdatum erreicht ist
 * und die alle Pflichtangaben haben. Alles andere wird nicht gebaut (auch nicht als Seite).
 */
const warned = new Set<string>();

export async function getPublishedArticles(): Promise<Article[]> {
  const [all, cats] = await Promise.all([getCollection('artikel'), getCategories()]);
  const categoryIds = new Set(cats.map((c) => c.id));
  const now = new Date();
  const out: Article[] = [];
  for (const a of all) {
    if (a.data.status !== 'freigegeben') continue;
    if (a.data.publishDate && a.data.publishDate > now) continue; // geplant
    const problems = publishProblems(a, categoryIds);
    if (problems.length > 0) {
      if (!warned.has(a.id)) {
        warned.add(a.id);
        console.warn(
          `[Sparwurzeln] WARNUNG: „${a.data.title}“ ist freigegeben, wird aber NICHT veröffentlicht: ${problems.join('; ')}.`,
        );
      }
      continue;
    }
    out.push(a);
  }
  return out.sort((x, y) => effectiveDate(y).getTime() - effectiveDate(x).getTime());
}

let productsPromise: Promise<Map<string, Product>> | undefined;
export function getPublishedProducts(): Promise<Map<string, Product>> {
  // Einmal pro Build lesen (Footer und Ratgeber-Seiten fragen mehrfach)
  productsPromise ??= getCollection('produkte').then(
    (all) => new Map(all.filter((p) => p.data.status === 'veroeffentlicht').map((p) => [p.id, p])),
  );
  return productsPromise;
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}
export const articlePath = (a: Article) => `/${a.data.category}/${a.id}`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
