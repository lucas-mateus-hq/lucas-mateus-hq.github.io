import { defineConfig } from 'astro/config';

// Perfil de build. Sem a variável o site pessoal é gerado como sempre.
// PUBLIC_SITE_PROFILE=reta-final gera só a página do Reta Final e a privacidade dela, no domínio próprio.
const profile = process.env.PUBLIC_SITE_PROFILE === 'reta-final' ? 'reta-final' : 'default';

export default defineConfig({
  output: 'static',
  site: profile === 'reta-final' ? 'https://lucasmateus.app' : 'https://lucas-mateus-hq.github.io',
  outDir: profile === 'reta-final' ? './dist-reta-final' : './dist',
  base: '/',
  trailingSlash: 'always',
  redirects: {
    '/criacoes/reta-final/': '/',
    '/en/criacoes/reta-final/': '/en/',
  },
});
