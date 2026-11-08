# Sparwurzeln: so arbeitest du mit Claude

Du brauchst keine Verwaltungsoberfläche und keine Konten außer GitHub und Cloudflare.

- **Entwurf:** „Schreibe einen Ratgeber zu …, Kategorie …“ → ich speichere ihn als Entwurf (nicht öffentlich) und zeige ihn dir.
- **Veröffentlichen:** „Erstelle und veröffentliche einen Artikel zu …“ oder „Gib den Entwurf … frei“.
- **Ändern oder archivieren:** „Ändere im Artikel … “ oder „Archiviere …“.
- **Affiliate:** Schicke mir den Partnerlink und sage, wohin er gehört. Ich lege eine Produktdatei an und verknüpfe sie.
- **Voraussetzung:** In der Sitzung muss das GitHub-Repository angebunden sein (bei einer neuen Sitzung gibst du es einmal frei).

Regeln für Qualität und Quellen: `REDAKTIONSRICHTLINIE.md`. Technik: `ARCHITEKTUR.md`.

## Einmalig aufräumen (nur du kannst das)
1. Cloudflare → Workers → `sparwurzeln` → Einstellungen → Variablen und Geheimnisse: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, falls angelegt auch `ANTHROPIC_API_KEY` löschen.
2. GitHub → Settings → Developer settings → OAuth Apps → „Sparwurzeln Verwaltung“ löschen, falls angelegt.
3. Wenn sparwurzeln.de verbunden ist: die `workers.dev`-Adresse deaktivieren.
