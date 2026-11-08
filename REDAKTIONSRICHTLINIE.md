# Redaktionsrichtlinie für KI-gestützte Ratgeber-Entwürfe

Diese Regeln gelten, wenn Claude im Chat aus „Thema + Kategorie“ einen Ratgeber-Entwurf erstellt und im Projekt speichert. Sie ersetzen keine Prüfung durch die Redaktion.

## Ablauf
1. Du nennst Thema und Kategorie (optional: Zielgruppe, Schwerpunkt).
2. Claude recherchiert seriöse Quellen, liest sie und schreibt den Artikel.
3. Claude speichert die Datei `src/content/artikel/<slug>.md` mit `status: entwurf`. Der Entwurf ist auf der Website unsichtbar.
4. Du prüfst im Admin (`/admin/` → Ratgeber) und gibst frei.

Claude setzt **nie** `freigegeben`, **nie** ein Veröffentlichungsdatum und **nie** einen Prüftermin. Das ist deine Entscheidung.

## Pflichtangaben im Entwurf
- `title`, `category` (gültige ID), `description` (ca. 120–155 Zeichen), `seoTitle` (bis 60 Zeichen)
- `faq`, `sources`, `pinterest` (Status `offen`), `reviewNotes`
- `sensitiveTopic: true` bei Lebensmittelsicherheit, Ernährung, Gesundheit, Finanzen/Recht, Strom/Gas/Wasser, Reparaturen mit Verletzungs- oder Brandgefahr

## Inhaltsregeln
- Keine erfundenen Erfahrungen, Tests, Zitate, Quellen, Preise oder Sparbeträge. Kein „ich habe getestet“.
- Jede Zahl und jede Sicherheitsaussage stammt aus einer genannten Quelle, die wirklich gelesen wurde. Abweichende Angaben werden beide genannt.
- Quellen: nur öffentliche, abrufbare Seiten (Behörden, Verbraucherzentralen, Fachinstitute, Hochschulen). Titel, URL und Stand stehen im Feld `sources`.
- Was nicht belegt ist, bleibt draußen oder wird mit `[PRÜFEN: …]` markiert. Solange ein `[PRÜFEN`-Marker im Text steht, wird der Artikel nicht veröffentlicht.
- Sparrechnungen nur als Formel zum Selbstrechnen, nie als Versprechen.
- Produkte: In `reviewNotes` nur Produktarten vorschlagen, keine Links, keine Wertung. Verlinkt wird nur, was du als Produkt im Admin anlegst.
- Gefährliche Anleitungen (Strom, Gas, Einkochen mit Botulismusrisiko usw.) nur mit klarem Hinweis auf Grenzen und Fachbetrieb bzw. amtliche Quelle.
- Website-Text spricht Leserinnen und Leser mit „Sie“ an.

## Freigabe-Checkliste für dich
- [ ] Die Quellen-Links öffnen und die wichtigsten Aussagen gegenprüfen
- [ ] Titelbild mit Nutzungsrecht einfügen und Alt-Text ausfüllen
- [ ] `reviewNotes` lesen, danach leeren oder behalten (wird nie angezeigt)
- [ ] „Letzter Prüftermin“ auf heute setzen
- [ ] Status auf „Freigegeben“ stellen und speichern
