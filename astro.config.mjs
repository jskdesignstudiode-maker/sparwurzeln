import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sparwurzeln.de',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
