// Prüft nach dem Build die wichtigsten SEO- und Sicherheitsregeln.
// FEHLER (rot) brechen den Build ab: die bisherige Website bleibt dann unverändert online.
// WARNUNGEN (gelb) werden nur angezeigt.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const ORIGIN = 'https://sparwurzeln.de';
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

if (!existsSync(DIST)) {
  console.error('[check-seo] dist/ fehlt. Zuerst bauen.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(DIST);
const pages = files
  .filter((f) => f.endsWith('.html'))
  .map((f) => relative(DIST, f));

const info = new Map(); // Pfad -> { noindex, canonical }
for (const rel of pages) {
  const html = readFileSync(join(DIST, rel), 'utf8');
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  info.set(rel, { noindex, canonical });

  if (!title) err(`${rel}: Title fehlt`);
  else if (title.length > 70) warn(`${rel}: Title ist ${title.length} Zeichen lang (empfohlen bis ca. 60)`);
  if (!desc) err(`${rel}: Meta-Beschreibung fehlt`);
  else if (!noindex && desc.length > 165) warn(`${rel}: Meta-Beschreibung ist ${desc.length} Zeichen lang (empfohlen bis ca. 155)`);
  if (h1s !== 1) warn(`${rel}: ${h1s} H1-Überschriften (erwartet: 1)`);

  if (noindex) {
    if (canonical) warn(`${rel}: noindex-Seite hat ein Canonical`);
  } else {
    if (!canonical) err(`${rel}: Canonical fehlt`);
    else {
      if (!canonical.startsWith(ORIGIN)) err(`${rel}: Canonical zeigt nicht auf ${ORIGIN}: ${canonical}`);
      if (/\.html|workers\.dev|pages\.dev/.test(canonical)) err(`${rel}: Canonical enthält .html oder eine Testdomain: ${canonical}`);
    }
  }
  if (/workers\.dev|pages\.dev/.test(html)) err(`${rel}: Seite verweist auf eine Cloudflare-Testdomain`);
}

// Sitemap
const sitemapPath = join(DIST, 'sitemap.xml');
if (!existsSync(sitemapPath)) err('sitemap.xml fehlt');
else {
  const xml = readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const inSitemap = new Set();
  for (const loc of locs) {
    if (!loc.startsWith(ORIGIN)) {
      err(`Sitemap: URL nicht auf ${ORIGIN}: ${loc}`);
      continue;
    }
    const path = loc.slice(ORIGIN.length) || '/';
    const rel = path === '/' ? 'index.html' : path.replace(/^\//, '') + '.html';
    inSitemap.add(rel);
    if (!info.has(rel)) err(`Sitemap: Seite existiert nicht: ${loc}`);
    else if (info.get(rel).noindex) err(`Sitemap: enthält noindex-Seite: ${loc}`);
    else if (info.get(rel).canonical !== (path === '/' ? ORIGIN + '/' : ORIGIN + path)) {
      warn(`Sitemap: URL weicht vom Canonical ab: ${loc}`);
    }
  }
  for (const [rel, i] of info) {
    if (rel === '404.html' || i.noindex) continue;
    if (!inSitemap.has(rel)) warn(`${rel}: indexierbare Seite fehlt in der Sitemap`);
  }
}

// Der frühere Verwaltungsbereich darf nicht mehr ausgeliefert werden
if (existsSync(join(DIST, 'admin'))) err('dist/admin existiert noch (Verwaltungsbereich wurde entfernt)');
if (existsSync(join(DIST, 'api'))) err('dist/api existiert noch');

// robots.txt
const robotsPath = join(DIST, 'robots.txt');
if (!existsSync(robotsPath)) err('robots.txt fehlt');
else {
  const robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) err('robots.txt: Sitemap-Zeile fehlt oder ist falsch');
  if (/^Disallow:\s*\/\s*$/m.test(robots)) err('robots.txt sperrt die gesamte Website (Disallow: /)');
}

// Entwürfe dürfen nie als Seite erscheinen
const artDir = 'src/content/artikel';
if (existsSync(artDir)) {
  for (const f of readdirSync(artDir).filter((x) => x.endsWith('.md'))) {
    const slug = f.replace(/\.md$/, '');
    const text = readFileSync(join(artDir, f), 'utf8');
    const status = (text.match(/^status:\s*["']?([\w-]+)/m) || [])[1] ?? 'entwurf';
    const cat = (text.match(/^category:\s*["']?([\w-]+)/m) || [])[1] ?? '';
    if (status !== 'freigegeben' && existsSync(join(DIST, cat, `${slug}.html`))) {
      err(`Ratgeber „${slug}“ hat Status „${status}“, wurde aber veröffentlicht`);
    }
  }
}
for (const rel of pages.filter((p) => p.includes('/') && !p.startsWith('kategorie/') && p !== 'ratgeber/index.html')) {
  const html = readFileSync(join(DIST, rel), 'utf8');
  if (/\[PRÜFEN/i.test(html)) err(`${rel}: enthält noch [PRÜFEN]-Markierungen`);
}

for (const w of warnings) console.warn(`\x1b[33m[check-seo] Warnung: ${w}\x1b[0m`);
for (const e of errors) console.error(`\x1b[31m[check-seo] FEHLER: ${e}\x1b[0m`);
console.log(`[check-seo] ${pages.length} Seiten geprüft: ${errors.length} Fehler, ${warnings.length} Warnungen.`);
process.exit(errors.length > 0 ? 1 : 0);
