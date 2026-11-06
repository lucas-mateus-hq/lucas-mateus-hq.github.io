import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://lucas-mateus-hq.github.io',
  base: '/',
  trailingSlash: 'always',
  redirects: {
    '/criacoes/reta-final/': '/',
    '/en/criacoes/reta-final/': '/en/',
  },
});
