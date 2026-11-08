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

## Wie passen Admin-Bereich und statische Seiten zusammen? (Phase 2)

1. Die öffentlichen Seiten bleiben statisch (schnell, gut für Google).
2. Der Admin-Bereich läuft unter `/admin`, geschützt durch **Cloudflare Access** (Anmeldung per E-Mail-Code, im Gratis-Kontingent für kleine Teams), nicht durch ein Passwort im Code.
3. Beim Speichern schreibt der Admin die Datei per GitHub-Schnittstelle ins Repository.
4. Cloudflare baut daraufhin die Seite automatisch neu und veröffentlicht sie (meist in 1–2 Minuten).
5. Entwürfe haben den Status `draft` und werden nicht veröffentlicht, bis Sie freigeben.

Die genaue Umsetzung (eigener Editor oder ein bestehendes, kostenloses Werkzeug) entscheiden wir zu Beginn von Phase 2.

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

## Stand Phase 2 (Admin und Redaktionsworkflow)

- **Inhalte** liegen als Dateien in `src/content/` (`artikel/*.md`, `kategorien/*.json`, `produkte/*.json`) und werden mit Astro Content Collections eingelesen. Neue Kategorien und Ratgeber erscheinen ohne Codeänderung.
- **Admin** unter `/admin/`: Decap CMS (Open Source, lokal mitgeliefert, kein Fremdserver). Gespeichert wird per GitHub-Anmeldung direkt ins Repository; Cloudflare baut danach neu.
- **Redaktionsworkflow** über das Feld `status` (Entwurf, In Prüfung, Freigegeben, Archiviert) plus Pflichtangaben (`src/lib/content.ts`). Nur Freigegebenes mit vollständigen Angaben wird gebaut.
- **Worker** (`src/worker/`): GitHub-Anmeldung für den Admin, `noindex` auf Test-Domains (`workers.dev`), optionaler KI-Endpunkt (standardmäßig aus, nur für Personen mit Schreibrechten).
- **SEO** : eigene `sitemap.xml` (nur indexierbare Seiten), `robots.txt`, Canonical auf `sparwurzeln.de`, Prüfskript `scripts/check-seo.mjs` bei jedem Build.
- **Zeitplan**: täglicher GitHub-Workflow stößt Builds für geplante Veröffentlichungen an.
- Bedienung: siehe `ANLEITUNG-ADMIN.md`.
