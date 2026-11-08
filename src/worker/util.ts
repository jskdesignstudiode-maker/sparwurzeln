import type { Env } from './env';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function htmlPage(title: string, bodyHtml: string, status = 200): Response {
  const page = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:4rem auto;padding:0 1rem;line-height:1.6;color:#303d32}h1{font-size:1.4rem}</style></head><body><h1>${title}</h1>${bodyHtml}</body></html>`;
  return new Response(page, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/** Prüft bei GitHub, ob das Token Schreibrechte auf das Repository hat. */
export async function hasWriteAccess(token: string, env: Env): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'sparwurzeln-worker',
      },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { permissions?: { push?: boolean } };
    return data.permissions?.push === true;
  } catch {
    return false;
  }
}

export function randomHex(bytes = 16): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}
