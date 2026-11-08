# Redaktionsrichtlinie für KI-gestützte Ratgeber-Entwürfe

Diese Regeln gelten, wenn Claude im Chat aus „Thema + Kategorie“ einen Ratgeber-Entwurf erstellt und im Projekt speichert. Sie ersetzen keine Prüfung durch die Redaktion.

## Ablauf
1. Du nennst mir Thema und Kategorie (optional: Zielgruppe, Schwerpunkt).
2. Ich recherchiere seriöse Quellen, lese sie und schreibe den Artikel samt SEO-Daten, FAQ, internen Links und Pinterest-Texten.
3. **Gewöhnliche Themenanfrage:** Ich speichere `src/content/artikel/<slug>.md` mit `status: entwurf`, pushe das und zeige dir den Text. Der Entwurf ist nicht öffentlich. Du sagst „freigeben“ oder nennst Änderungen.
4. **„Erstelle und veröffentliche einen Artikel“:** Nach den Qualitätsprüfungen unten setze ich `status: freigegeben` und den Prüftermin, führe Build und SEO-Prüfung aus, pushe, kontrolliere das Deployment und nenne dir den Link.
5. Falls ein Check fehlschlägt oder eine Aussage nicht belegbar ist, veröffentliche ich nicht, sondern bleibe beim Entwurf und sage dir warum.

Dateien, Felder: Veröffentlichungsdatum = `publishDate` (leer = sofort), Aktualisierungsdatum = `lastReviewed`, Slug = Dateiname, Affiliate = `products` (IDs aus `src/content/produkte/`).

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

## Qualitätsprüfungen vor jeder Veröffentlichung
- Quellen gelesen, Zahlen und Sicherheitsaussagen gegengeprüft
- Pflichtfelder vollständig, kein `[PRÜFEN`-Marker, keine erfundenen Erfahrungen oder Versprechen
- Ein konkretes Problem wird gelöst, keine dünne Massenware; kostenlose Lösungen zuerst
- Interne Links zeigen auf vorhandene, veröffentlichte Seiten
- `npm run build` meldet 0 Fehler in der SEO-Prüfung
- Affiliate: nur mit von dir gelieferten Partnerlinks, Kennzeichnung „Anzeige“ und `rel="sponsored"`, keine Preise, Bewertungen oder fremden Produktbilder
- Titelbilder nur mit Nutzungsrecht
