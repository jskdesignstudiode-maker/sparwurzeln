import type { Env } from './env';
import { handleAuth, handleCallback } from './oauth';
import { handleAiDraft } from './ai';
import { json } from './util';

// Test-Adressen von Cloudflare dürfen nie in Google erscheinen.
// Die endgültige Domain ist sparwurzeln.de.
const TEST_HOST = /\.(workers|pages)\.dev$/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isTestHost = TEST_HOST.test(url.hostname);

    if (url.pathname === '/api/auth') return handleAuth(request, env);
    if (url.pathname === '/api/callback') return handleCallback(request, env);
    if (url.pathname === '/api/ai/draft') return handleAiDraft(request, env);
    if (url.pathname.startsWith('/api/')) return json({ error: 'not-found' }, 404);

    if (isTestHost && url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    const response = await env.ASSETS.fetch(request);
    if (!isTestHost) return response;

    const guarded = new Response(response.body, response);
    guarded.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return guarded;
  },
};
