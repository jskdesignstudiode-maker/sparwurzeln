# Sparwurzeln – Architekturentscheidung

## Entscheidung

**Astro (statisch) + Cloudflare Workers Static Assets + Inhalte als Dateien in GitHub.**

| Baustein | Wahl | Grund |
|---|---|---|
| Website | Astro, statisch erzeugte Seiten | Sehr schnell, SEO-freundlich, kaum JavaScript |
| Hosting | Cloudflare Workers Static Assets | Gratis-Kontingent, kein eigener Server, Domain-Anbindung inklusive |
| Versionsverwaltung | GitHub | Änderungen nachvollziehbar, jederzeit rückgängig zu machen |
| Inhalte (Artikel, Produkte) | Dateien im Repository (Markdown/JSON) | Dauerhaft gespeichert, unabhängig von Code-Updates, keine Datenbank nötig |
| Datenbank (D1) | Zunächst **nicht** | Wird nur ergänzt, wenn es einen klaren Bedarf gibt (z. B. Newsletter) |

## Warum Inhalte im Repository?

Die Vorgabe lautet: Inhalte und Produktdaten müssen dauerhaft erhalten bleiben, auch wenn der Website-Code aktualisiert wird. Liegen sie als eigene Dateien in einem eigenen Ordner (`src/content/`), sind sie von Code-Änderungen getrennt, versioniert und gesichert. Es entstehen keine Datenbankkosten.

## Wie werden Inhalte verwaltet?

Es gibt **keinen Verwaltungsbereich**. Claude schreibt Ratgeber direkt als Dateien in `src/content/artikel/`, führt Build und SEO-Prüfung aus, pusht zu GitHub, und Cloudflare veröffentlicht automatisch. Ob ein Artikel erscheint, entscheidet das Feld `status` (`entwurf`, `in-pruefung`, `freigegeben`, `archiviert`) plus Pflichtangaben (`src/lib/content.ts`). Regeln: `REDAKTIONSRICHTLINIE.md`.

## Kosten

- Cloudflare Workers Static Assets: im Gratis-Kontingent
- GitHub: kostenlos
- Domain: bereits bei Hostinger vorhanden
- KI-Assistent (Phase 4): nur auf ausdrücklichen Wunsch, dann mit eigenem API-Schlüssel und Kostenlimit

Keine kostenpflichtigen Dienste werden ohne deine Zustimmung eingebunden.

## Erweiterbarkeit

- Kategorien und Unterkategorien: `src/content/kategorien/` (im Admin verwaltbar)
- Weitere Sprachen, Newsletter, PDF-Downloads: Struktur lässt Platz dafür, wird bei Bedarf ergänzt

---

## Stand (Vereinfachung)

- **Inhalte**: Dateien in `src/content/` (`artikel/*.md`, `kategorien/*.json`, `produkte/*.json`), eingelesen über Astro Content Collections. Neue Ratgeber erscheinen ohne Codeänderung in Kategorie, Startseite und „Alle Ratgeber“.
- **Entfernt**: `/admin/`, Decap CMS, GitHub-OAuth, KI-Endpunkt, CSV-Export und zugehörige Secrets und Skripte.
- **Worker** (`src/worker/index.ts`): nur noch `noindex` und gesperrte robots.txt für Test-Adressen (`*.workers.dev`, `*.pages.dev`).
- **SEO**: eigene `sitemap.xml` (nur indexierbare Seiten), `robots.txt`, Canonical auf `https://sparwurzeln.de`, Prüfskript `scripts/check-seo.mjs` bei jedem Build (Fehler brechen den Build ab).
- **Zeitplan**: täglicher GitHub-Workflow stößt Builds für Artikel mit Veröffentlichungsdatum an (nicht getestet).
