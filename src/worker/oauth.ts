import type { Env } from './env';
import { hasWriteAccess, htmlPage, randomHex } from './util';

// GitHub-Anmeldung für das Admin-Werkzeug (Decap CMS).
// Ablauf: /api/auth -> GitHub -> /api/callback -> Token wird per postMessage an das Admin-Fenster übergeben.
// Client-ID und Secret liegen ausschließlich als Cloudflare-Secrets vor.

export function handleAuth(_request: Request, env: Env): Response {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return htmlPage(
      'Anmeldung noch nicht eingerichtet',
      '<p>Die GitHub-Zugangsdaten (GITHUB_CLIENT_ID und GITHUB_CLIENT_SECRET) fehlen noch in Cloudflare. Siehe ANLEITUNG-ADMIN.md.</p>',
      503,
    );
  }
  const state = randomHex(16);
  const params = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, scope: 'repo,user', state });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('Cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

export async function handleCallback(request: Request, env: Env): Promise<Response> {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return htmlPage('Anmeldung noch nicht eingerichtet', '<p>GitHub-Zugangsdaten fehlen in Cloudflare.</p>', 503);
  }
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = readCookie(request, 'oauth_state');

  if (!code || !state || !cookieState || state !== cookieState) {
    return htmlPage('Anmeldung abgebrochen', '<p>Die Anmeldung konnte nicht bestätigt werden. Bitte Fenster schließen und erneut versuchen.</p>', 400);
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'sparwurzeln-worker' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
  });
  const tokenData = (await tokenRes.json().catch(() => ({}))) as { access_token?: string; error?: string };
  const token = tokenData.access_token;
  if (!token) {
    return htmlPage('Anmeldung fehlgeschlagen', '<p>GitHub hat keinen Zugang erteilt. Bitte erneut versuchen.</p>', 400);
  }

  // Nur Personen mit Schreibrechten auf das Repository dürfen den Admin nutzen.
  if (!(await hasWriteAccess(token, env))) {
    return htmlPage(
      'Kein Zugriff',
      '<p>Dieses GitHub-Konto hat keine Schreibrechte auf das Sparwurzeln-Repository.</p>',
      403,
    );
  }

  const payload = JSON.stringify({ token, provider: 'github' }).replace(/</g, '\\u003c');
  const script = `
(function () {
  var message = 'authorization:github:success:' + ${JSON.stringify(payload)};
  function receive(e) {
    if (e.origin !== window.location.origin) return;
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', window.location.origin);
})();`;
  return new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Anmeldung</title></head><body><p>Anmeldung erfolgreich. Dieses Fenster schließt sich gleich.</p><script>${script}</script></body></html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0',
      },
    },
  );
}
