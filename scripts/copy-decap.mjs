// Kopiert das Admin-Werkzeug (Decap CMS) aus node_modules nach public/admin,
// damit es von der eigenen Domain geladen wird (kein fremder Server, feste Version).
import { cpSync, mkdirSync, readdirSync, existsSync } from 'node:fs';

const src = 'node_modules/decap-cms/dist';
const dest = 'public/admin';

if (!existsSync(src)) {
  console.error('[copy-decap] node_modules/decap-cms fehlt. Bitte "npm install" ausführen.');
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
let n = 0;
for (const f of readdirSync(src)) {
  // Nur die Dateien des "decap-cms"-Bundles (Hauptdatei + Teildateien), keine Source-Maps
  if (f.endsWith('decap-cms.js') || f.endsWith('decap-cms.js.LICENSE.txt')) {
    cpSync(`${src}/${f}`, `${dest}/${f}`);
    n++;
  }
}
console.log(`[copy-decap] ${n} Dateien nach ${dest} kopiert.`);
