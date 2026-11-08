export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Repository im Format "besitzer/name" (in wrangler.jsonc) */
  GITHUB_REPO: string;
  /** Secrets (nur im Cloudflare-Dashboard hinterlegen, nie im Code): */
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  /** KI-Modul: nur aktiv, wenn "true" (in wrangler.jsonc) UND ANTHROPIC_API_KEY gesetzt ist */
  AI_ENABLED?: string;
  AI_MODEL?: string;
}
