import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const prefix = '/';
const intakeConfigured=Boolean(process.env.PUBLIC_LESSON_API_URL && process.env.PUBLIC_TURNSTILE_SITE_KEY);
const origin = 'https://lucas-mateus-hq.github.io';
const routes = ['', 'en/', 'portfolio/', 'portfolio/pt/', 'privacy/', 'privacidade/'];
const fileFor = (path) => `dist/${path}${path.endsWith('/') || !path ? 'index.html' : ''}`;
const html = (route) => readFileSync(fileFor(route), 'utf8');

test('unconfigured publication keeps LinkedIn contact, accurate privacy and retired dashboard assets', () => {
  for(const route of routes) {
    assert.doesNotMatch(html(route),/mailto:|wa\.me|META_ACCESS_TOKEN|WHATSAPP_TO/);
    if(['', 'en/'].includes(route)) {
      assert.doesNotMatch(html(route),/data-mock-form/);
      if(intakeConfigured)assert.match(html(route),/data-lesson-form/);
      else assert.doesNotMatch(html(route),/data-lesson-form|<form\b/);
    } else assert.doesNotMatch(html(route),/<input\b|<form\b/);
  }
  for(const route of ['privacidade/','privacy/']){
    const source=html(route);
    for(const id of ['purchase-reta-final','responsibility','hosting','browsing','contact','mock-report','publishing','rights','changes'])assert.ok(source.includes(`id="${id}"`),route+': '+id);
    assert.ok(source.includes('https://www.linkedin.com/in/lucasmateus/'));
    assert.ok(source.includes('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement'));
    assert.ok(source.includes('2026'));
    assert.match(source,/GitHub Pages/);assert.doesNotMatch(source,/wa\.me|id="relay"/);if(!intakeConfigured)assert.doesNotMatch(source.replace(/<section id="purchase-reta-final"[^>]*>.*?<\/section>/s,''),/WhatsApp/);else assert.match(source,/id="lesson-inquiries"/);assert.match(source,/LGPD/);
  }
  for(const path of ['live-telemetry.js','telemetry.json','responsive-guard.css'])assert.equal(existsSync('dist/'+path),false,path);
});

test('every locale serves cacheable raster assets, an SVG favicon and a 1200×630 social card', () => {
  for (const route of routes) {
    const source=html(route);
    assert.doesNotMatch(source, /data:image\/(?:webp|png|jpeg);base64/);
    assert.match(source, /rel="icon" type="image\/svg\+xml"/);
    const match=source.match(/property="og:image" content="([^"]+)"/);
    assert.ok(match,route);
    const url=new URL(match[1]);
    assert.equal(url.origin,origin);
    assert.ok(url.pathname.startsWith(prefix));
    const png=readFileSync('dist/'+url.pathname.slice(prefix.length));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
    assert.match(source, /name="twitter:card" content="summary_large_image"/);
  }
});

test('all canonical public pages build, use the correct base and stay indexable', () => {
  for (const route of routes) {
    const source = html(route);
    assert.match(source, /<h1\b/);
    assert.ok(source.includes(`href="${origin}${prefix}${route}"`), route);
    assert.match(source, /name="robots" content="index,follow/);
    assert.doesNotMatch(source, /live-telemetry\.js|data-capability-registry|data-impact-demo/);
  }
});

test('every internal navigation link, anchor, stylesheet and image resolves in the built artifact', () => {
  for (const route of routes) {
    const source = html(route);
    for (const match of source.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replaceAll('&amp;', '&');
      const url = new URL(value, origin + prefix + route);
      if (url.origin !== origin) continue;
      assert.ok(url.pathname.startsWith(prefix), `${route}: escaped repository base ${value}`);
      const target = url.pathname.slice(prefix.length);
      const file = fileFor(target);
      assert.ok(existsSync(file), `${route}: missing ${value} => ${file}`);
      if (url.hash) assert.ok(readFileSync(file,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: missing anchor ${value}`);
    }
  }
});

test('home is personal and preserves approved public destinations', () => {
  const home = html('');
  assert.match(home, /lang="pt-BR"/);
  for (const content of ['Lucas Mateus','Wellhub','Reckitt','TikTok','id="criacoes"','id="trabalho"','id="escritos"','id="sobre"']) assert.ok(home.includes(content),content);
  assert.doesNotMatch(home, /Capability Lab|Billi Lab|C Lab|Telemetry Mode|Scaffold/);
  assert.ok(home.includes(`src="${prefix}lucas-mateus.webp"`), 'serve an optimized copy of the existing public profile portrait');
  assert.ok(existsSync('dist/lucas-mateus.webp'));
  for(const route of ['', 'en/']){assert.doesNotMatch(html(route),/Disponível em português brasileiro|Available in Brazilian Portuguese|Materiais educacionais e projetos|Learning materials and projects/);}
  for(const route of ['', 'portfolio/pt/']){assert.ok(html(route).includes('projetos práticos'));assert.doesNotMatch(html(route),/organização de trabalhos complexos/);}
  for(const route of ['en/', 'portfolio/'])assert.ok(html(route).includes('practical projects'));
});

test('professional evidence remains present and technical utility files are not published', () => {
  const portfolio = html('portfolio/');
  for (const value of ['Talent Acquisition','Recruiting Operations','14 of 15 (93%)','Wellhub','Reckitt','TikTok','RealLife English','degree not completed','id="rnd"']) assert.ok(portfolio.includes(value),value);
  assert.doesNotMatch(portfolio,/Capability Lab/);
  for (const path of ['protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md','protocol/capability-evidence-receipt.schema.json','relay/index.html','relay/app.js','relay/AI_HANDOFF_CONTRACT.md','protocol/examples/example-receipt.json','fonts/README.md','images/README.md','images/social-pt.svg','images/social-en.svg']) assert.equal(existsSync(`dist/${path}`),false,path);
});

test('actual editorial identity and product text pairs meet WCAG AA contrast', () => {
  const luminance = (hex) => {
    const rgb = hex.match(/[0-9a-f]{2}/gi).map((x) => parseInt(x,16)/255).map((x) => x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4);
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  };
  const pairs=[
    ['071b20','f7f3ea'],['071b20','bdccc9'],['071b20','c58a45'],['071b20','73cdba'],
    ['102c31','f7f3ea'],['102c31','bdccc9'],['102c31','c58a45'],
    ['103039','f7f3ea'],['103039','bdccc9'],['103039','73cdba'],['103039','c58a45'],
    ['123a3b','f7f3ea'],['123a3b','bdccc9'],['123a3b','73cdba'],
    ['19353a','f7f3ea'],['19353a','bdccc9'],['19353a','73cdba'],
    ['0b2429','f7f3ea'],['0b2429','bdccc9'],['0b2429','c58a45'],
    ['0f6b61','f7f3ea'],['73cdba','071b20'],
    ['102a43','d0dce8'],['102a43','abcbe5'],['d3e5d2','203d35'],
    ['e7641b','0c2037'],['081a2b','b9cbd9'],
    // REIA palette actual pairs
    ['F5F0E8','93351F'],['F5F0E8','172027'],['F5F0E8','465057'],
    ['EADFCC','93351F'],['EADFCC','172027'],['EADFCC','465057'],
    ['FFFFFF','93351F'],['FFFFFF','172027'],['FFFFFF','465057'],
    ['F57456','172027'],['93351F','FFFFFF']
  ];
  for (const [bg,fg] of pairs) {
    const values=[luminance(bg),luminance(fg)].sort((a,b)=>a-b);
    assert.ok((values[1]+.05)/(values[0]+.05)>=4.5,`${fg} on ${bg}`);
  }
});


test('locale pairs have reciprocal language links and preserve assets and evidence', () => {
  for (const [pt,en] of [['','en/'],['portfolio/pt/','portfolio/'],['privacidade/','privacy/']]) {
    const a=html(pt),b=html(en);
    assert.match(a, /<html lang="pt-BR"/); assert.match(b, /<html lang="en-US"/);
    for(const page of [a,b]) for(const [lang,route] of [['pt-BR',pt],['en-US',en]]) assert.ok(page.includes(`hreflang="${lang}" href="${origin}${prefix}${route}"`),`${pt} / ${en}: alternate ${lang}`);
    const images = x=>[...x.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(images(a),images(b));
    const sections=x=>[...x.matchAll(/<section[^>]*id="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(sections(a),sections(b));
    assert.doesNotMatch(a+b,/translate\.google|localStorage|document\.cookie/);
  }
  assert.match(html('en/'), /Available in Portuguese/);
  assert.match(html('portfolio/pt/'), /14 de 15 \(93%\)/);
  assert.match(html('portfolio/pt/'), /graduação não concluída/);
});


test('home creations exclude REIA and the retired Reta Final route', () => {
  for(const route of ['', 'en/']) {
    const page = html(route);
    assert.doesNotMatch(page, /id="reta-final"|href="[^"]*criacoes\/reta-final/);
    assert.doesNotMatch(page, /id="reia"|renda-extra-com-ia|Renda Extra com IA|pay\.hotmart\.com/);
    assert.doesNotMatch(page, /public-case|case-links|Este portfólio, por dentro|This portfolio, from the inside/);
    assert.doesNotMatch(page, /github\.com\/lucas-mateus-hq\/lucas-capability-os-pages\/pull\/28|actions\/workflows\/pages\.yml/);
    for(const section of ['trabalho', 'criacoes', 'sobre', 'contato']) {
      assert.ok(page.includes(`id="${section}"`));
    }
  }
});


test('lessons expose existing and one-off offers and keep the owner phone and inactive collection out of public pages',()=>{
 for(const route of ['', 'en/']){
  const page=html(route);
  for(const content of ['id="aulas"','Business English','id="reta-final-produto"'])assert.ok(page.includes(content));
  assert.ok(page.includes(route==='en/'?'<p class="lesson-separation">Lessons involve working directly with me.</p>':'<p class="lesson-separation">Nas aulas, você trabalha diretamente comigo.</p>'));
  assert.doesNotMatch(page.match(/<p class="lesson-separation">.*?<\/p>/)?.[0]??'',/Reta Final|Reta Final toolkit/);
  assert.doesNotMatch(page,/wa\.me|api\.whatsapp\.com|META_ACCESS_TOKEN|WHATSAPP_TO|R\$\s*550/);
  // A oferta de simulação de entrevista (R$ 80) foi retirada da home a pedido do Founder (21/11/2026).
  assert.doesNotMatch(page,/data-mock-form|pedido-simulacao|mock-offer|R\$ ?80\b|Treine sua próxima entrevista|Practice your next job interview|Solicitar simulação|Request a session|Agendamento em breve|Booking opens soon/);
  if(!intakeConfigured){assert.doesNotMatch(page,/data-lesson-form/);assert.match(page,/href="https:\/\/www.linkedin.com\/in\/lucasmateus\/"/);}
  else {assert.match(page,/data-lesson-form/);assert.match(page,/data-lesson-form data-api="https:\/\/[^"]+" data-site-key="[^"]+"/);}
 }
});

test('portfolio explains AI work to ordinary visitors without internal engineering jargon',()=>{
 const cases=[
  {route:'portfolio/',language:'en',nav:'AI projects',heading:'What I’m building and learning with AI.',phrase:'I try practical ways to use AI'},
  {route:'portfolio/pt/',language:'pt',nav:'Projetos com IA',heading:'O que estou criando e aprendendo com IA.',phrase:'Experimento formas práticas de usar IA'}
 ];
 for(const {route,nav,heading,phrase} of cases){
  const page=html(route);
  for(const copy of [nav,heading,phrase])assert.ok(page.includes(copy),route+': '+copy);
  assert.doesNotMatch(page,/AI orchestration literacy|Knowledge & state architecture|Independent Applied R&D|Arquitetura de conhecimento e estado|Conhecimento aplicado de orquestração de IA|Pesquisa aplicada independente/);
  assert.match(page,/id="rnd"/); // Existing deep links remain valid after changing the visitor-facing label.
 }
});

// Retired product URLs stay reachable only as static redirects, never as sales pages.
test('retired Reta Final routes redirect to their locale home and leave the sitemap and navigation', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  assert.doesNotMatch(sitemap, /reta-final/);
  for (const [route, destination] of [['criacoes/reta-final/', '/'], ['en/criacoes/reta-final/', '/en/']]) {
    const redirect = html(route);
    assert.match(redirect, /http-equiv="refresh"/);
    assert.ok(redirect.includes(`url=${destination}`), route);
    assert.ok(redirect.includes(`href="${destination}"`), 'accessible fallback');
    assert.doesNotMatch(redirect, /<h1|Toolkit|Hotmart|checkout/);
    assert.match(redirect, /noindex/);
    for (const activeRoute of routes) assert.ok(!html(activeRoute).includes('/' + route), activeRoute);
  }
});

// The Reta Final sales page moved to its own repository and domain; this site no longer publishes it.
test('Reta Final sales route is not published by the personal site', () => {
  assert.equal(existsSync('dist/reta-final/index.html'), false);
  assert.equal(existsSync('dist/perfil-reta-final'), false);
  assert.doesNotMatch(readFileSync('dist/sitemap.xml', 'utf8'), /reta-final/);
});

// Card do Reta Final na home: aponta para o domínio próprio do produto (lucasmateus.app), não para a rota antiga aposentada.
test('home shows the Reta Final card linking to its own domain, in both languages', () => {
  for (const route of ['', 'en/']) {
    const page = html(route);
    const card = page.match(/<article class="reia-feature" id="reta-final-produto".*?<\/article>/s)?.[0] ?? '';
    assert.ok(card, route + ': card do Reta Final presente');
    assert.ok(card.includes('href="https://lucasmateus.app/"'), route + ': link para lucasmateus.app');
    assert.match(card, /Reta Final/);
    assert.match(card, /Lucas Mateus/);
    assert.doesNotMatch(card, /criacoes\/reta-final|Hotmart|pay\.|greenn|R\$|Lançamento em breve|Coming soon/i, route + ': sem preço, checkout nem estado antigo');
    assert.doesNotMatch(page, /id="reta-final"|href="[^"]*criacoes\/reta-final/, route + ': a rota antiga segue aposentada');
  }
});

// REIA saiu do site em 21/11/2026: a página de vendas dele volta a ser a da Hotmart.
test('REIA is not published by the personal site', () => {
  assert.equal(existsSync('dist/renda-extra-com-ia/index.html'), false);
  assert.equal(existsSync('dist/images/reia-cover.webp'), false);
  assert.doesNotMatch(readFileSync('dist/sitemap.xml', 'utf8'), /renda-extra-com-ia/);
});
