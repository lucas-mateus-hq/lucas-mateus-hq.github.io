// Pós-build do perfil reta-final. Deixa em dist-reta-final só / e /privacidade/ e os arquivos que elas usam,
// e gera robots.txt (e sitemap.xml somente com checkout ativo). Uso: node scripts/prune-profile.mjs [dir]
import { readdirSync, readFileSync, rmSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist-reta-final';
const site = (process.env.PUBLIC_SITE_ORIGIN ?? 'https://lucasmateus.app').replace(/\/$/, '');
const checkoutActive = /^https:\/\/[^\s"'<>]+$/.test((process.env.PUBLIC_RETA_FINAL_CHECKOUT_URL ?? '').trim());
if (!existsSync(dir)) throw new Error(`${dir} não existe; rode o build do perfil antes.`);

// 1. As duas páginas do perfil vêm de rotas internas; viram / e /privacidade/.
const home = join(dir, 'reta-final', 'index.html');
const privacy = join(dir, 'perfil-reta-final', 'privacidade', 'index.html');
for (const f of [home, privacy]) if (!existsSync(f)) throw new Error(`Faltou ${f}`);
const staged = { home: readFileSync(home), privacy: readFileSync(privacy) };
const keepTop = new Set(['_astro', 'fonts', 'images', 'identity.svg']);
for (const entry of readdirSync(dir)) if (!keepTop.has(entry)) rmSync(join(dir, entry), { recursive: true, force: true });
writeFileSync(join(dir, 'index.html'), staged.home);
mkdirSync(join(dir, 'privacidade'), { recursive: true });
writeFileSync(join(dir, 'privacidade', 'index.html'), staged.privacy);

// 2. Mantém só os arquivos referenciados pelas duas páginas (e pelos CSS que elas carregam).
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const text = () => [join(dir, 'index.html'), join(dir, 'privacidade', 'index.html'), ...walk(dir).filter((f) => f.endsWith('.css'))].map((f) => readFileSync(f, 'utf8')).join('\n');
for (const sub of ['_astro', 'images', 'fonts']) {
  const corpus = text();
  for (const file of walk(join(dir, sub))) {
    const rel = file.slice(dir.length + 1).replace(/\\/g, '/');
    if (/LICENSE/.test(rel)) continue;
    if (!corpus.includes(rel.split('/').pop())) rmSync(file);
  }
}

// 3. robots e sitemap. O sitemap é montado a partir das páginas realmente construídas: entra toda rota
// indexável (sem noindex). Cada rota precisa declarar abaixo os arquivos de origem, para o <lastmod> ser
// a data do último commit que mexeu nela. Rota nova sem declaração derruba o build de propósito.
const sources = {
  '/': ['src/components/pages/RetaFinalSalesPage.astro', 'src/styles/reta-final.css', 'src/config/reta-final.ts', 'public/images/reta-final'],
  '/privacidade/': ['src/components/pages/RetaFinalPrivacyPage.astro', 'src/config/reta-final.ts'],
};
const routes = walk(dir).filter((f) => f.endsWith('index.html')).map((f) => {
  const rel = f.slice(dir.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
  return { route: '/' + rel, indexable: !/<meta name="robots" content="[^"]*noindex/.test(readFileSync(f, 'utf8')) };
}).sort((a, b) => a.route.localeCompare(b.route));
for (const { route } of routes) if (!sources[route]) throw new Error(`Rota ${route} sem origem declarada em scripts/prune-profile.mjs (sitemap e lastmod)`);
const lastmod = (route) => {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...sources[route]], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : '';
  } catch { return ''; }
};
const entries = routes.filter((r) => r.indexable).map(({ route }) => {
  const date = lastmod(route);
  return `  <url><loc>${site}${route}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`;
});

if (checkoutActive && entries.length > 0) {
  writeFileSync(join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
  writeFileSync(join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`);
} else {
  writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}
