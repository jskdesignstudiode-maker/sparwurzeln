# Anleitung: Verwaltungsbereich von Sparwurzeln

Mit dem Verwaltungsbereich erstellst, bearbeitest und veröffentlichst du Ratgeber, Kategorien und Affiliate-Produkte, ohne zu programmieren. Du erreichst ihn unter **/admin/** (zum Beispiel `https://sparwurzeln.jskdesignstudiode.workers.dev/admin/`, später `https://sparwurzeln.de/admin/`).

## 1. Einmalige Einrichtung (ca. 10 Minuten)

Damit nur du dich anmelden kannst, läuft die Anmeldung über dein GitHub-Konto. Dafür brauchst du eine „OAuth App“.

**Schritt A: bei GitHub**
1. Öffne github.com → Profilbild → *Settings* → ganz unten *Developer settings* → *OAuth Apps* → *New OAuth App*.
2. Trage ein:
   - *Application name*: `Sparwurzeln Verwaltung`
   - *Homepage URL*: `https://sparwurzeln.jskdesignstudiode.workers.dev`
   - *Authorization callback URL*: `https://sparwurzeln.jskdesignstudiode.workers.dev/api/callback`
3. Klicke auf *Register application*. Kopiere die **Client ID**.
4. Klicke auf *Generate a new client secret* und kopiere das **Secret** sofort (es wird nur einmal angezeigt).

**Schritt B: bei Cloudflare**
1. *Workers und Pages* → `sparwurzeln` → *Einstellungen* → *Variablen und Geheimnisse*.
2. Füge zwei Einträge vom Typ **Geheimnis (Secret)** hinzu:
   - `GITHUB_CLIENT_ID` = die Client ID
   - `GITHUB_CLIENT_SECRET` = das Secret
3. Speichern und, falls Cloudflare danach fragt, neu bereitstellen.

**Schritt C: anmelden**
Öffne `/admin/` und klicke auf *Mit GitHub einloggen*. Fertig.

> **Wichtig, wenn die Domain sparwurzeln.de verbunden wird:** Ändere bei der GitHub OAuth App beide Adressen auf `https://sparwurzeln.de` und `https://sparwurzeln.de/api/callback`. GitHub erlaubt pro OAuth App nur eine Adresse.

Es können sich nur GitHub-Konten anmelden, die Schreibrechte auf das Repository haben. Weitere Personen lädst du bei GitHub unter *Settings → Collaborators* ein.

## 2. Einen neuen Ratgeber erstellen

1. *Ratgeber* → *Neuer Ratgeber*.
2. Titel und Kategorie wählen. Der Ratgeber erscheint später **automatisch** in dieser Kategorie, auf der Startseite und unter „Alle Ratgeber“.
3. Text schreiben. Meta-Beschreibung (ca. 120–155 Zeichen) ausfüllen.
4. Bei Bedarf: FAQ, Quellen, Produkte, Pinterest-Texte, Titelbild.
5. Speichern.

### Der Ablauf: Entwurf → Prüfung → Veröffentlichung

| Status | Bedeutung |
|---|---|
| **Entwurf** | In Arbeit, nicht sichtbar |
| **In Prüfung** | Fertig geschrieben, wird geprüft, nicht sichtbar |
| **Freigegeben** | Wird veröffentlicht (nach dem nächsten Build, meist 1–2 Minuten) |
| **Archiviert** | Wird nicht mehr angezeigt, bleibt aber gespeichert |

Ein freigegebener Ratgeber erscheint nur, wenn:
- die **Meta-Beschreibung** ausgefüllt ist,
- ein **Letzter Prüftermin** eingetragen ist,
- bei **sensiblen Themen** (Gesundheit, Finanzen, Lebensmittelsicherheit, Strom/Gas/Wasser, Recht) mindestens eine **Quelle** angegeben ist,
- der Text keine `[PRÜFEN]`-Markierungen mehr enthält,
- das Veröffentlichungsdatum erreicht ist.

Fehlt etwas, bleibt der Ratgeber unsichtbar und die Website selbst funktioniert normal weiter. Im Build-Protokoll bei Cloudflare steht dann eine Zeile „WARNUNG: … wird NICHT veröffentlicht: …“.

### Geplante Veröffentlichung
Trage bei *Veröffentlichung ab* ein Datum ein und stelle den Status auf *Freigegeben*. Ein täglicher GitHub-Workflow (`.github/workflows/geplante-veroeffentlichung.yml`) stößt am Tag der Veröffentlichung automatisch einen neuen Build an. Dieser Workflow konnte in der Entwicklungsumgebung nicht getestet werden. Prüfe ihn bei der ersten geplanten Veröffentlichung (GitHub → *Actions*).

### Archivieren und Aktualisieren
- Archivieren: Status auf *Archiviert* setzen.
- Aktualisieren: Text ändern, **Letzten Prüftermin** auf heute setzen, speichern.

## 3. Kategorien
*Kategorien* → bestehende ändern oder neue anlegen (Name, Reihenfolge, Symbol, Beschreibungen, Unterkategorien). Neue Kategorien erscheinen automatisch in der Navigation. Eine Kategorie ohne veröffentlichte Ratgeber ist für Google ausgeblendet (`noindex`) und steht nicht in der Sitemap.

## 4. Affiliate-Produkte
*Produkte (Affiliate)* → *Neues Produkt*: Name, Netzwerk, Partnerlink, eigene Beschreibung, geprüfte Eigenschaften, optional Bild, Status, Prüftermin.
- Produkte gehören keinem Ratgeber fest, sondern werden im Ratgeber unter *Passende Produkte* ausgewählt (mehrere Ratgeber möglich).
- Den **Partnerlink tauschst du an einer Stelle**, er gilt dann überall.
- Links sind automatisch als **Anzeige** gekennzeichnet und mit `rel="sponsored nofollow"` versehen. Bei Amazon erscheint der Pflichthinweis.
- Es werden **keine** Preise, Bewertungen oder Verfügbarkeiten angezeigt. Verwende nur Bilder, deren Nutzung ausdrücklich erlaubt ist.
- Nur Produkte mit Status *Veröffentlicht* erscheinen.

## 5. Optionale KI-Funktion (standardmäßig aus)
Aus einem Thema entsteht ein **Entwurf** mit Titel, Gliederung, Text, FAQ, SEO-Titel, Meta-Beschreibung und Pinterest-Texten. Alles, was geprüft werden muss, ist mit `[PRÜFEN]` markiert und in den Prüfhinweisen aufgelistet. Sie veröffentlicht nie etwas selbst und erfindet keine Quellen.

**Einschalten (verursacht Kosten bei Anthropic, Abrechnung nach Verbrauch):**
1. Lege bei console.anthropic.com einen API-Schlüssel an. Prüfe dort die Preise und setze ein Ausgabenlimit.
2. Cloudflare → Variablen und Geheimnisse → Geheimnis `ANTHROPIC_API_KEY` mit dem Schlüssel.
3. Bei GitHub die Datei `wrangler.jsonc` öffnen und `"AI_ENABLED": "false"` auf `"true"` ändern.
4. Nach dem Build `/admin/ki.html` öffnen (vorher unter `/admin/` angemeldet sein).

**Ausschalten:** `AI_ENABLED` zurück auf `"false"` oder das Secret löschen.
Diese Funktion konnte ohne echten Schlüssel nur bis zur Abschaltprüfung getestet werden. Die erste echte Nutzung bitte aufmerksam kontrollieren.

## 5a. Entwürfe von Claude (ohne zusätzliche Kosten)
Du schreibst mir im Chat Thema und Kategorie. Ich recherchiere Quellen, schreibe den Ratgeber und speichere ihn als **Entwurf** im Projekt. Er erscheint im Admin unter *Ratgeber* mit Status *Entwurf* und ist auf der Website unsichtbar. Regeln: `REDAKTIONSRICHTLINIE.md`.
Freigeben: Entwurf öffnen → Quellen und Text prüfen → *Letzten Prüftermin* eintragen → Status *Freigegeben* → *Veröffentlichen* → *Jetzt veröffentlichen*. Nach 1–2 Minuten ist er online.

## 6. Pinterest
Jeder Ratgeber hat einen Bereich *Pinterest* (Titel, Beschreibung, Hochkant-Grafik, Status). Eine CSV-Liste aller **veröffentlichten** Ratgeber für die Planung lädst du unter `/admin/pinterest.csv`. Eine automatische Anbindung ist nicht eingebaut.

## 7. Testadresse und Google
- Die Cloudflare-Testadresse (`…workers.dev`) sendet automatisch `noindex` und sperrt sich per robots.txt. Alle Seiten haben außerdem ein Canonical auf `https://sparwurzeln.de`.
- Sobald `sparwurzeln.de` verbunden ist: Cloudflare → `sparwurzeln` → *Einstellungen → Domains und Routen* → die `workers.dev`-Adresse **deaktivieren**.
- Impressum und Datenschutz sind Platzhalter (noindex, nicht in der Sitemap). Sie müssen vor dem Start mit deinen Angaben gefüllt und rechtlich geprüft werden.

## 8. Automatische Prüfungen beim Build
Bei jedem Build prüft `scripts/check-seo.mjs` unter anderem Title, Meta-Beschreibung, Canonical, Sitemap, robots.txt und dass kein Entwurf veröffentlicht wurde. Bei einem **Fehler** bricht der Build ab, die bisherige Website bleibt unverändert online, und im Protokoll steht der Grund.
