import type { APIRoute } from 'astro';
import { getCategories, getPublishedArticles, effectiveDate, isoDate } from '../lib/content';
import { site } from '../data/site';

// Eigene Sitemap: nimmt nur indexierbare Seiten auf.
// Nicht enthalten: Kategorien ohne Ratgeber, 404-Seite, Entwürfe.
export const GET: APIRoute = async () => {
  const [categories, articles] = await Promise.all([getCategories(), getPublishedArticles()]);

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    { loc: '/ueber-uns' },
    { loc: '/kontakt' },
    { loc: '/affiliate-hinweis' },
    { loc: '/impressum' },
    { loc: '/datenschutz' },
  ];
  if (articles.length > 0) urls.push({ loc: '/ratgeber' });

  for (const c of categories) {
    const inCat = articles.filter((a) => a.data.category === c.id);
    if (inCat.length === 0) continue;
    const newest = inCat.map((a) => a.data.lastReviewed ?? effectiveDate(a)).sort((x, y) => y.getTime() - x.getTime())[0];
    urls.push({ loc: `/kategorie/${c.id}`, lastmod: isoDate(newest) });
  }
  for (const a of articles) {
    urls.push({ loc: `/ratgeber/${a.id}`, lastmod: isoDate(a.data.lastReviewed ?? effectiveDate(a)) });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${site.url}${u.loc === '/' ? '/' : u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
