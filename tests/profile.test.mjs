import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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
  assert.match(privacy, /planilha privada do produtor, no Google Sheets/);
  assert.ok(privacy.includes(`href="mailto:${email}"`));
  assert.doesNotMatch(privacy, /será informado aqui/);
  assert.equal(existsSync(join(out, 'sitemap.xml')), false);
  assert.equal(read('robots.txt'), 'User-agent: *\nDisallow: /\n');
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
  assert.equal(read('sitemap.xml').match(/<loc>[^<]+<\/loc>/g).join(''), '<loc>https://lucasmateus.app/</loc><loc>https://lucasmateus.app/privacidade/</loc>');
  assertPublishable(read('privacidade/index.html'), true);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/lucasmateus\.app\/sitemap\.xml/);
  assert.equal((home.match(/href="https:\/\/pay\.example\.test\/checkout"/g) ?? []).length, 3);
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
