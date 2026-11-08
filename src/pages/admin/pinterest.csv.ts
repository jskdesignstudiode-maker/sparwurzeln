import type { APIRoute } from 'astro';
import { getPublishedArticles, getCategories } from '../../lib/content';
import { site } from '../../data/site';

// CSV-Export für die Pinterest-Planung. Enthält nur bereits veröffentlichte Ratgeber
// (deren Texte sind ohnehin öffentlich). Entwürfe erscheinen hier bewusst nicht.
const esc = (v: string | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;

export const GET: APIRoute = async () => {
  const [articles, categories] = await Promise.all([getPublishedArticles(), getCategories()]);
  const catTitle = (id: string) => categories.find((c) => c.id === id)?.data.title ?? id;
  const abs = (src?: string) => (src ? (src.startsWith('http') ? src : site.url + src) : '');

  const header = ['Pin-Titel', 'Pin-Beschreibung', 'Ziel-URL', 'Pin-Bild', 'Kategorie', 'Pinterest-Status'];
  const rows = articles.map((a) => {
    const p = a.data.pinterest;
    return [
      p?.title ?? a.data.title,
      p?.description ?? a.data.description,
      `${site.url}/ratgeber/${a.id}`,
      abs(p?.image),
      catTitle(a.data.category),
      p?.status ?? 'offen',
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n';
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sparwurzeln-pinterest.csv"',
    },
  });
};
