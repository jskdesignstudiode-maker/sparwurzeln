import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sparwurzeln.de',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      // Rechtsseiten-Entwürfe bleiben bis zur Prüfung aus der Sitemap
      filter: (page) => !/\/(impressum|datenschutz)$/.test(page),
    }),
  ],
});
