import type { APIRoute } from 'astro';
import { getCategories } from '../../lib/content';

// Wird von der KI-Seite im Admin genutzt, um die Kategorieauswahl anzuzeigen.
export const GET: APIRoute = async () => {
  const categories = await getCategories();
  const body = categories.map((c) => ({ id: c.id, title: c.data.title }));
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
