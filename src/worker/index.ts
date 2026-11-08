// Der Worker macht nur eines: Test-Adressen von Cloudflare (*.workers.dev, *.pages.dev)
// bekommen "noindex" und eine gesperrte robots.txt, damit sie nie in Google erscheinen.
// Die endgültige Domain ist sparwurzeln.de. Alles andere liefert Cloudflare als statische Dateien aus.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const TEST_HOST = /\.(workers|pages)\.dev$/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isTestHost = TEST_HOST.test(url.hostname);

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
