import type { Env } from './env';
import { hasWriteAccess, json } from './util';

// Optionales KI-Modul: erstellt aus einem Thema einen Ratgeber-ENTWURF.
// Sicherheitsprinzipien:
//  - Standardmäßig AUS (AI_ENABLED muss bewusst auf "true" gesetzt und ein API-Schlüssel hinterlegt werden).
//  - Nur Personen mit Schreibrechten auf das Repository dürfen es nutzen (verhindert fremde Kosten).
//  - Ergebnis ist immer Status "entwurf". Es wird nie automatisch veröffentlicht.
//  - Keine erfundenen Erfahrungen, Tests, Quellen oder Sparversprechen (siehe SYSTEM_PROMPT).

const SYSTEM_PROMPT = `Du schreibst Entwürfe für Ratgeberartikel der deutschsprachigen Website "Sparwurzeln" (günstiger, einfacher, selbstbestimmter leben).

Harte Regeln:
- Keine erfundenen persönlichen Erfahrungen (nie "ich habe getestet", "bei uns im Garten" o. Ä.).
- Keine erfundenen Produkttests, Produktnamen, Bewertungen oder Preise.
- Keine unbelegten Sparversprechen oder Zahlen. Rechenbeispiele nur mit klar genannten, nachvollziehbaren Annahmen und als "Beispielrechnung" gekennzeichnet.
- Keine erfundenen Quellen. Das Feld "sources" bleibt leer.
- Jede Tatsachenbehauptung, die geprüft werden muss (Zahlen, Fristen, Temperaturen, Mengen, rechtliche oder sicherheitsrelevante Angaben), kennzeichnest du im Text mit [PRÜFEN] direkt dahinter und listest sie zusätzlich in "reviewNotes".
- Bei Gesundheit, Finanzen, Lebensmittelsicherheit, Elektrik, Gas oder Recht: "sensitiveTopic": true und besonders vorsichtig formulieren; auf Fachleute verweisen, wo nötig.
- Ansprache: "Sie". Ton: warm, sachlich, klar. Keine Werbesprache, keine Floskeln.
- Produkte nur als Produkttypen vorschlagen (Feld "suggestedProducts"), niemals mit Links.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt (kein Text davor oder danach) mit diesen Feldern:
{
  "title": "verständlicher Titel",
  "slug": "kurzer-url-name-ohne-umlaute",
  "description": "Meta-Beschreibung, höchstens 155 Zeichen",
  "seoTitle": "SEO-Titel, höchstens 60 Zeichen",
  "sensitiveTopic": true oder false,
  "body": "Markdown-Text OHNE Überschrift erster Ebene, mit ## Überschriften: Einleitung mit konkretem Problem, Schritt-für-Schritt-Lösung, Praktische Tipps, Häufige Fehler, Sinnvolle Alternativen",
  "faq": [ { "question": "...", "answer": "..." } ],
  "pinterest": { "title": "höchstens 100 Zeichen", "description": "höchstens 500 Zeichen" },
  "reviewNotes": [ "Was vor der Veröffentlichung geprüft werden muss" ],
  "suggestedInternalLinks": [ "Thema eines passenden anderen Ratgebers" ],
  "suggestedProducts": [ "Produkttyp, der im Ratgeber sinnvoll sein könnte" ]
}`;

const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.trim().slice(0, max) : '');
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export async function handleAiDraft(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method', message: 'Nur POST erlaubt.' }, 405);

  if (env.AI_ENABLED !== 'true' || !env.ANTHROPIC_API_KEY) {
    return json(
      {
        error: 'ki-deaktiviert',
        message:
          'Das KI-Modul ist nicht aktiviert. Es verursacht erst Kosten, wenn Sie es bewusst einschalten (siehe ANLEITUNG-ADMIN.md).',
      },
      503,
    );
  }

  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token || !(await hasWriteAccess(token, env))) {
    return json({ error: 'unauthorized', message: 'Bitte zuerst im Verwaltungsbereich anmelden.' }, 401);
  }

  const body = (await request.json().catch(() => null)) as { topic?: string; category?: string; notes?: string } | null;
  const topic = clean(body?.topic, 300);
  const category = clean(body?.category, 80);
  const notes = clean(body?.notes, 1000);
  if (topic.length < 5 || !category) {
    return json({ error: 'input', message: 'Bitte Thema (mind. 5 Zeichen) und Kategorie angeben.' }, 400);
  }

  const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.AI_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Thema: ${topic}${notes ? `\nHinweise der Redaktion: ${notes}` : ''}\nKategorie-ID: ${category}`,
        },
      ],
    }),
  });
  if (!apiRes.ok) {
    return json({ error: 'ki-fehler', message: `Die KI-Anfrage ist fehlgeschlagen (Status ${apiRes.status}).` }, 502);
  }
  const apiData = (await apiRes.json()) as { content?: { type: string; text?: string }[] };
  const text = apiData.content?.find((c) => c.type === 'text')?.text ?? '';
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  let draft: Record<string, any>;
  try {
    draft = JSON.parse(text.slice(start, end + 1));
  } catch {
    return json({ error: 'ki-format', message: 'Die KI-Antwort war nicht lesbar. Bitte erneut versuchen.' }, 502);
  }

  const title = clean(draft.title, 150) || topic;
  const slug = slugify(clean(draft.slug, 100) || title) || 'neuer-ratgeber';
  const faq = Array.isArray(draft.faq)
    ? draft.faq
        .map((f: any) => ({ question: clean(f?.question, 300), answer: clean(f?.answer, 1500) }))
        .filter((f: { question: string; answer: string }) => f.question && f.answer)
        .slice(0, 8)
    : [];
  const reviewNotes = [
    ...(Array.isArray(draft.reviewNotes) ? draft.reviewNotes.map((n: unknown) => clean(n, 400)).filter(Boolean) : []),
    ...(Array.isArray(draft.suggestedInternalLinks)
      ? draft.suggestedInternalLinks.map((n: unknown) => `Interner Link prüfen: ${clean(n, 200)}`)
      : []),
    ...(Array.isArray(draft.suggestedProducts)
      ? draft.suggestedProducts.map((n: unknown) => `Mögliche Produktart (nur wenn sinnvoll): ${clean(n, 200)}`)
      : []),
  ].filter(Boolean);

  // Frontmatter als JSON-Werte (gültiges YAML). Status ist IMMER "entwurf".
  const fm: Record<string, unknown> = {
    title,
    status: 'entwurf',
    category,
    description: clean(draft.description, 200),
    seoTitle: clean(draft.seoTitle, 80),
    sensitiveTopic: draft.sensitiveTopic === true,
    faq,
    pinterest: {
      title: clean(draft.pinterest?.title, 120),
      description: clean(draft.pinterest?.description, 600),
      status: 'offen',
    },
    reviewNotes: reviewNotes.map((n) => `- ${n}`).join('\n'),
  };
  const frontmatter = Object.entries(fm)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  const markdown = `---\n${frontmatter}\n---\n\n${clean(draft.body, 20000)}\n`;

  return json({ slug, title, repo: env.GITHUB_REPO, markdown });
}
