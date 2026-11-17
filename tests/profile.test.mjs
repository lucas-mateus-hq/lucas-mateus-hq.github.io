import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { extract, assertComplete } from '../scripts/aeo-layer.mjs';

const out = 'dist-reta-final';
const email = readFileSync('src/config/reta-final.ts', 'utf8').match(/retaFinalContactEmail = '([^']+)'/)[1];
const greenn = 'https://greenn.com.br/politica-de-privacidade/';
// Trava de publicação: com checkout definido, a privacidade precisa ter contato real e nenhum placeholder.
const assertPublishable = (html, checkoutDefined) => {
  if (!checkoutDefined) return;
  if (html.includes('será informado aqui')) throw new Error('Privacidade ainda tem o placeholder de contato com o checkout definido');
  if (!html.includes(`mailto:${email}`)) throw new Error('Privacidade sem o e-mail de contato com o checkout definido');
};
const build = (checkout = '') => execSync('npx astro build && node scripts/prune-profile.mjs ' + out, {
  stdio: 'pipe',
  env: { ...process.env, PUBLIC_SITE_PROFILE: 'reta-final', PUBLIC_RETA_FINAL_CHECKOUT_URL: checkout },
});
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const read = (p) => readFileSync(join(out, p), 'utf8');

test('perfil reta-final fechado: só / e /privacidade/, domínio próprio, sem sitemap, noindex', () => {
  build('');
  const pages = walk(out).filter((f) => f.endsWith('.html')).map((f) => f.slice(out.length + 1)).sort();
  assert.deepEqual(pages, ['index.html', 'privacidade/index.html']);
  const home = read('index.html'), privacy = read('privacidade/index.html');
  assert.match(home, /<link rel="canonical" href="https:\/\/lucasmateus\.app\/">/);
  assert.match(home, /<meta property="og:url" content="https:\/\/lucasmateus\.app\/">/);
  assert.match(home, /name="robots" content="noindex,nofollow"/);
  assert.match(privacy, /<link rel="canonical" href="https:\/\/lucasmateus\.app\/privacidade\/">/);
  assert.match(privacy, /Greenn/);
  assert.ok(privacy.includes(`href="${greenn}"`) && /rel="noopener noreferrer"/.test(privacy));
  assert.match(privacy, /entregues por e-mail e WhatsApp/);
  assert.match(privacy, /planilha privada do produtor, no Google Sheets/);
  assert.ok(privacy.includes(`href="mailto:${email}"`));
  assert.doesNotMatch(privacy, /será informado aqui/);
  assert.equal(existsSync(join(out, 'sitemap.xml')), false);
  assert.equal(read('robots.txt'), 'User-agent: *\nDisallow: /\n');
  assert.equal(existsSync(join(out, 'llms.txt')), false, 'llms.txt só existe com o checkout ativo');
  for (const page of ['index.html', 'privacidade/index.html']) assert.doesNotMatch(read(page), /application\/ld\+json/, page + ' sem JSON-LD no build fechado');
  for (const file of walk(out)) {
    if (/\.(html|css|js|txt|xml|svg)$/.test(file)) assert.doesNotMatch(readFileSync(file, 'utf8'), /Hotmart|renda-extra|github\.io|lucas-mateus-hq/i, file);
  }
  assert.equal(walk(out).filter((f) => f.endsWith('.js')).length, 0);
  assert.equal(walk(join(out, 'images')).some((f) => /reia|social-/.test(f)), false);
});

test('perfil reta-final com checkout (build descartável): index,follow e sitemap só desse perfil', () => {
  build('https://pay.example.test/checkout');
  const home = read('index.html');
  assert.match(home, /name="robots" content="index,follow"/);
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.deepEqual(sitemap.match(/<loc>[^<]+<\/loc>/g), ['<loc>https://lucasmateus.app/</loc>', '<loc>https://lucasmateus.app/privacidade/</loc>']);
  for (const [, date] of sitemap.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)) assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
  assert.doesNotMatch(sitemap, /github\.io|pages\.dev|noindex/);
  // Toda página indexável do build está no sitemap; nenhuma página noindex entra.
  for (const file of walk(out).filter((f) => f.endsWith('index.html'))) {
    const route = '/' + file.slice(out.length + 1).replace(/index\.html$/, '');
    const indexable = !/<meta name="robots" content="[^"]*noindex/.test(readFileSync(file, 'utf8'));
    assert.equal(sitemap.includes(`<loc>https://lucasmateus.app${route}</loc>`), indexable, route);
  }
  assertPublishable(read('privacidade/index.html'), true);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/lucasmateus\.app\/sitemap\.xml/);
  assert.equal((home.match(/href="https:\/\/pay\.example\.test\/checkout"/g) ?? []).length, 3);
  build('');
});

const ldBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
const noEmpty = (v, path = '$') => {
  assert.ok(v !== undefined && v !== null && v !== '' && !/\bundefined\b|\[object|\bnull\b/.test(String(typeof v === 'object' ? '' : v)), `valor vazio em ${path}`);
  if (Array.isArray(v)) { assert.ok(v.length > 0, `lista vazia em ${path}`); v.forEach((x, i) => noEmpty(x, `${path}[${i}]`)); }
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) noEmpty(x, `${path}.${k}`);
};
const strip = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ');

test('camada AEO com checkout ativo: robots para IA, llms.txt e JSON-LD fiéis ao conteúdo visível', async () => {
  build('https://pay.example.test/checkout');
  const home = read('index.html'), privacy = read('privacidade/index.html');
  const visible = strip(home);
  // robots.txt: crawlers de IA liberados e sitemap referenciado
  const robots = read('robots.txt');
  for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) assert.match(robots, new RegExp(`User-agent: ${agent}\\nAllow: /\\n`), agent);
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.doesNotMatch(robots, /Disallow:\s*\//);
  assert.match(robots, /Sitemap: https:\/\/lucasmateus\.app\/sitemap\.xml\n$/);
  // JSON-LD: válido, sem vazio, tipos por rota
  const homeLd = ldBlocks(home), privacyLd = ldBlocks(privacy);
  assert.deepEqual(homeLd.map((b) => [].concat(b['@type']).join('+')), ['Course', 'FAQPage']);
  assert.deepEqual(privacyLd.map((b) => b['@type']), ['WebPage']);
  [...homeLd, ...privacyLd].forEach((b) => { assert.equal(b['@context'], 'https://schema.org'); noEmpty(b); });
  const [product, faq] = homeLd;
  assert.equal(product.url, 'https://lucasmateus.app/');
  assert.equal(product.inLanguage, 'pt-BR');
  assert.equal(product.author.name, 'Lucas Mateus');
  assert.equal(product.provider.name, 'Lucas Mateus');
  assert.ok(!('brand' in product) && !('image' in product), 'sem campos de Product (listagens do comerciante)');
  assert.equal(product.offers['@type'], 'Offer');
  assert.equal(product.offers.availability, 'https://schema.org/InStock');
  assert.equal(product.offers.priceCurrency, 'BRL');
  assert.ok(visible.includes(`R$ ${product.offers.price.replace('.', ',')}`), 'o preço do JSON-LD é o preço visível');
  assert.equal(product.offers.url, 'https://pay.example.test/checkout');
  assert.ok(faq.mainEntity.length >= 3);
  for (const q of faq.mainEntity) { assert.ok(visible.includes(q.name), 'pergunta visível: ' + q.name); assert.ok(visible.includes(q.acceptedAnswer.text.slice(0, 60)), 'resposta visível: ' + q.name); }
  assert.equal(privacyLd[0].url, 'https://lucasmateus.app/privacidade/');
  assert.equal(privacyLd[0].isPartOf.url, 'https://lucasmateus.app/');
  // llms.txt: estrutura da especificação e só fatos que estão na página
  const llms = read('llms.txt');
  assert.match(llms, /^# .+\n\n> .+\n\n## Páginas principais\n/);
  for (const h of ['## Páginas principais', '## Detalhes da oferta', '## Perguntas frequentes', '## Autoria e contato']) assert.ok(llms.includes(h), h);
  assert.ok(llms.includes('(https://lucasmateus.app/)') && llms.includes('(https://lucasmateus.app/privacidade/)'));
  assert.ok(llms.includes(`R$ ${product.offers.price.replace('.', ',')}`) && llms.includes('7 materiais, 25 áudios') && llms.includes('Garantia de 7 dias'));
  assert.doesNotMatch(llms, /undefined|\[object|<[a-z]|MP3|7 PDFs|[Aa]té 6x|57,00/);
  assert.ok(llms.includes(`Contato: ${email}`));
  assert.doesNotMatch(llms, /github\.io|pages\.dev|pay\.example/);
  // servido pelo preview local: 200 e corpo não vazio
  const server = createServer((req, res) => {
    const path = req.url.split('?')[0];
    const file = join(out, path.endsWith('/') ? path + 'index.html' : path);
    if (!existsSync(file) || !statSync(file).isFile()) { res.statusCode = 404; return res.end(); }
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const path of ['/', '/privacidade/', '/llms.txt', '/robots.txt', '/sitemap.xml']) {
      const res = await fetch(base + path);
      assert.equal(res.status, 200, path);
      assert.ok((await res.text()).length > 100 || path === '/robots.txt', path + ' com conteúdo');
    }
  } finally { server.close(); }
  build('');
});

test('trava: checkout definido com placeholder ou sem e-mail de contato é recusado', () => {
  assert.throws(() => assertPublishable('<p>O canal de contato será informado aqui</p>', true), /placeholder/);
  assert.throws(() => assertPublishable('<p>sem contato</p>', true), /sem o e-mail/);
  assert.doesNotThrow(() => assertPublishable(`<a href="mailto:${email}">x</a>`, true));
  assert.doesNotThrow(() => assertPublishable('<p>fechado</p>', false));
});

test('build padrão não publica rota do perfil nem canonical da página de vendas', () => {
  assert.equal(existsSync('dist/perfil-reta-final'), false);
  assert.doesNotMatch(readFileSync('dist/reta-final/index.html', 'utf8'), /rel="canonical"|og:url/);
});

test('camada AEO recusa HTML sem os dados esperados e valores vazios', () => {
  assert.throws(() => extract('<title>x</title>', '<title>y</title>', 'https://lucasmateus.app'), /não consegui extrair/);
  assert.throws(() => assertComplete({ a: { b: '' } }), /vazio/);
  assert.throws(() => assertComplete({ a: [undefined] }), /vazio/);
  assert.throws(() => assertComplete({ a: 'preço undefined' }), /inválido/);
  assert.doesNotThrow(() => assertComplete({ a: ['ok'], b: { c: 'x' } }));
});
