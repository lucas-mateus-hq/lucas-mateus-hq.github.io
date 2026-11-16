import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const prefix = '/';
const intakeConfigured=Boolean(process.env.PUBLIC_LESSON_API_URL && process.env.PUBLIC_TURNSTILE_SITE_KEY);
const origin = 'https://lucas-mateus-hq.github.io';
const routes = ['', 'en/', 'portfolio/', 'portfolio/pt/', 'privacy/', 'privacidade/', 'renda-extra-com-ia/'];
const fileFor = (path) => `dist/${path}${path.endsWith('/') || !path ? 'index.html' : ''}`;
const html = (route) => readFileSync(fileFor(route), 'utf8');

test('unconfigured publication keeps LinkedIn contact, accurate privacy and retired dashboard assets', () => {
  for(const route of routes) {
    assert.doesNotMatch(html(route),/mailto:|wa\.me|META_ACCESS_TOKEN|WHATSAPP_TO/);
    if(['', 'en/'].includes(route)) {
      if(intakeConfigured)assert.match(html(route),/data-mock-form/);
      else { assert.match(html(route),/Agendamento online em preparação|Online booking is being prepared/); assert.doesNotMatch(html(route),/data-mock-form|<form\b/); }
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


test('home creations retain REIA and exclude the retired product', () => {
  for(const route of ['', 'en/']) {
    const page = html(route);
    assert.doesNotMatch(page, /id="reta-final"|href="[^"]*criacoes\/reta-final/);
    assert.match(page, /id="reia"/);
    assert.ok(page.includes('href="/renda-extra-com-ia/"'));
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
  for(const content of ['id="aulas"','Business English','id="reia"'])assert.ok(page.includes(content));
  assert.ok(page.includes(route==='en/'?'<p class="lesson-separation">Lessons involve working directly with me.</p>':'<p class="lesson-separation">Nas aulas, você trabalha diretamente comigo.</p>'));
  assert.doesNotMatch(page.match(/<p class="lesson-separation">.*?<\/p>/)?.[0]??'',/Reta Final|Reta Final toolkit/);
  assert.doesNotMatch(page,/wa\.me|api\.whatsapp\.com|META_ACCESS_TOKEN|WHATSAPP_TO|R\$\s*550/);
  if(intakeConfigured)assert.match(page,/data-mock-form/);
  else { assert.match(page,/Agendamento online em preparação|Online booking is being prepared/);assert.doesNotMatch(page,/data-mock-form/); }
  assert.match(page,/R\$ 80/);
  assert.ok(page.includes(route==='en/'?'Practice your next job interview in English':'Treine sua próxima entrevista em inglês'));
  assert.ok(page.includes(route==='en/'?'within 2 hours of the end of the session':'em até 2 horas após a sessão'));
  assert.doesNotMatch(page,/R\$ 149|BRL 149|45-minute mock/);
  assert.ok(page.includes(route==='en/'?'one 60-minute session + written report':'1 hora de prática + relatório'));
  assert.ok(page.includes(intakeConfigured?(route==='en/'?'Request a session':'Solicitar simulação'):(route==='en/'?'Booking opens soon':'Agendamento em breve')));
  if(!intakeConfigured){assert.doesNotMatch(page,/data-lesson-form/);assert.match(page,/href="https:\/\/www.linkedin.com\/in\/lucasmateus\/"/);}
  else {assert.match(page,/data-lesson-form/);assert.match(page,/data-active="true"/);}
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

test('reia sales page delivers authentic Hotmart narrative and external checkout without collecting data', () => {
  const reia = html('renda-extra-com-ia/');
  assert.match(reia, /lang="pt-BR"/);
  assert.match(reia, /Renda Extra com IA: Teste, Entregue, Repita/);
  assert.match(reia, /5 motivos concretos para transformar IA em renda extra/);
  assert.match(reia, /Fim da paralisia por excesso de teoria/);
  assert.match(reia, /Diagnóstico ágil do serviço certo para seu perfil/);
  assert.match(reia, /Abordagem profissional sem parecer amador ou invasivo/);
  assert.match(reia, /Economia de tempo com templates prontos para o mercado/);
  assert.match(reia, /Entenda o que está comprando antes de decidir/);
  assert.match(reia, /Bússola de Renda com IA/);
  assert.match(reia, /Primeiro Cliente IA/);
  assert.match(reia, /Dúvidas comuns sobre o REIA/);
  assert.match(reia, /Confira a oferta antes de comprar/);
  assert.doesNotMatch(reia, /risco zero|garantia incondicional/i);
  assert.match(reia, /Lucas Mateus/);
  assert.match(reia, /src="\/lucas-mateus\.webp"[^>]*alt="Foto de Lucas Mateus"/);
  assert.doesNotMatch(reia, /Nota de transparência/);
  assert.doesNotMatch(reia, /Transparência e Entrega|Produto digital registrado sob o código de referência Hotmart/);
  assert.match(reia, /aria-label="Links do rodapé"/);
  assert.match(reia, /Política de Privacidade/);
  assert.match(reia, /Termos Hotmart/);

  // No forms, no data inputs, no embedded payment mechanisms
  assert.doesNotMatch(reia, /<form\b|<input\b|<textarea\b/);

  // External checkout links exclusively point to Hotmart
  const ctas = [...reia.matchAll(/href="(https:\/\/pay\.hotmart\.com\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(ctas.length >= 2, 'Must have at least 2 strategic checkout CTAs');
  for (const cta of ctas) {
    assert.equal(cta, 'https://pay.hotmart.com/I108167656O');
  }

  // Skip link & main container focus
  assert.match(reia, /href="#reia-main"/);
  assert.match(reia, /id="reia-main" tabindex="-1"/);
});

test('REIA sales route is discoverable from both home languages', () => {
  for (const route of ['', 'en/']) {
    const page = html(route);
    assert.match(page, /href="\/renda-extra-com-ia\/"/);
    assert.match(page, /Renda Extra com IA: Teste, Entregue, Repita/);
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

test('REIA cover is 1200 square and contains only image data, with no embedded metadata', () => {
  const cover = readFileSync('dist/images/reia-cover.webp');
  assert.equal(cover.length, 33896);
  assert.equal(cover.toString('ascii', 0, 4), 'RIFF');
  assert.equal(cover.readUInt32LE(4) + 8, cover.length);
  assert.equal(cover.toString('ascii', 8, 12), 'WEBP');
  const chunks = [];
  for (let offset = 12; offset < cover.length;) {
    chunks.push(cover.toString('ascii', offset, offset + 4));
    const length = cover.readUInt32LE(offset + 4);
    offset += 8 + length + (length % 2);
    assert.ok(offset <= cover.length);
  }
  assert.deepEqual(chunks, ['VP8 ']);
  assert.equal(cover.toString('hex', 23, 26), '9d012a');
  assert.equal(cover.readUInt16LE(26) & 0x3fff, 1200);
  assert.equal(cover.readUInt16LE(28) & 0x3fff, 1200);
});

// The Reta Final sales route is prepared ahead of launch: no domain, no checkout, not listed anywhere.
test('Reta Final sales route carries no fixed domain and stays unavailable and unlisted until a checkout is configured', () => {
  const page = html('reta-final/');
  assert.match(page, /<html lang="pt-BR">/);
  assert.equal((page.match(/<h1[\s>]/g) ?? []).length, 1);
  const absolute = (page.match(/https?:\/\/[^\s"'<>)]+/g) ?? []).filter(url => !url.startsWith('http://www.w3.org/'));
  assert.deepEqual(absolute, [], 'no absolute URL or domain may be written in the page');
  assert.doesNotMatch(page, /rel="canonical"|og:url|github\.io|hreflang/);
  assert.match(page, /<meta name="robots" content="noindex,nofollow"/);
  assert.match(page, /data-rf-state="closed"/);
  assert.doesNotMatch(page, /data-rf-checkout/);
  assert.equal((page.match(/data-rf-unavailable/g) ?? []).length, 3);
  assert.match(page, /As vendas do Reta Final ainda não foram abertas/);
  for (const fact of ['97,00', 'Preço de lançamento', '48 páginas', '4 etapas e 10 ferramentas', 'Garantia incondicional de 7 dias', '12 perguntas mais recorrentes', '7 materiais, 25 áudios']) assert.ok(page.includes(fact), fact);
  for (const gone of ['57,00', '127,00', 'até 6x', 'aula particular', 'sem professor', 'R$ 120']) assert.ok(!page.includes(gone), gone);
  assert.equal((page.match(/data-rf-status/g) ?? []).length, 2);
  assert.equal((page.match(/class="rf-tool"/g) ?? []).length, 10);
  assert.equal((page.match(/class="rf-item[ "]/g) ?? []).length, 7);
  assert.equal((page.match(/class="rf-reason[ "]/g) ?? []).length, 5);
  // The 25 audios are part of the product: listed in the inventory with their real grouping, never framed as a gift.
  const inventory = page.slice(page.indexOf('id="rf-recebe"'), page.indexOf('id="rf-uso"'));
  assert.match(inventory, /25 áudios de prática/);
  for (const [count, group] of [['12', 'Módulos de entrevista'], ['10', 'Mock interviews'], ['3', 'Useful English Labs']]) assert.match(inventory, new RegExp(`<b>${count}</b><span><strong[^>]*>${group}</strong>`), group);
  assert.match(page.slice(page.indexOf('id="oferta"')), /7 materiais, 25 áudios/);
  const text = page.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(text, /b[ôo]nus|brinde|gr[áa]tis|de presente|\bextras?\b/i, 'audios are part of the product, not a giveaway');
  assert.doesNotMatch(page, /evid[êe]ncia/i);
  // Buyers see materials and audios, not file formats or file counts; no author credit in the footer.
  assert.doesNotMatch(text, /MP3|7 PDFs|criação de Lucas Mateus/);
  // Demonstrations are a small, fixed set of real pages: cover, contents, and tool pages filled with a fictional example.
  // The caption, not the image, says the example is fictional; no other page of the paid material ships.
  const images = [...page.matchAll(/<figure class="rf-page"><img src="(\/images\/reta-final\/[a-z0-9-]+\.webp)"[^>]*>(?:<\/img>)?<figcaption>(.*?)<\/figcaption><\/figure>/g)];
  const sampled = ['preparation-plan', 'interview-map', 'star-20', 'star-21', 'interview-day-card'];
  assert.deepEqual(images.map(([, src]) => src.replace(/.*exemplo-|\.webp/g, '')).sort(), ['capa', 'sumario', ...sampled].sort());
  for (const [tag, src, caption] of images) {
    assert.ok(existsSync('dist' + src), src);
    assert.match(tag, /alt="[^"]{20,}"/); assert.match(tag, /width="480" height="680"/); assert.match(tag, /loading="lazy"/);
    assert.equal(sampled.some(name => src.endsWith(`exemplo-${name}.webp`)), caption.includes('Exemplo fictício'), src);
    // Lossy WebP stores the width at bytes 26-27; previews stay at 480px.
    const file = readFileSync('dist' + src);
    assert.equal(file.toString('ascii', 12, 16), 'VP8 ', src);
    assert.ok((file.readUInt16LE(26) & 0x3fff) <= 480, `${src} is wider than a preview`);
    assert.ok(file.length < 40_000, `${src} is heavier than a preview`);
  }
  assert.deepEqual(readdirSync('dist/images/reta-final').filter(f => !f.startsWith('exemplo-')), ['autor-lucas-mateus.webp'], 'only the author portrait ships besides the previews');
  // Author section: before the offer, exact copy, light square portrait, no call to action.
  const author = page.match(/<section class="rf-sec" aria-labelledby="rf-autor">(.*?)<\/section>/s)?.[1] ?? '';
  assert.ok(author && page.indexOf('aria-labelledby="rf-autor"') < page.indexOf('id="oferta"'), 'author section sits before the offer');
  assert.match(author, /<h2[^>]*>Quem fez o Reta Final<\/h2>/);
  const authorParagraphs = [...author.matchAll(/<p class="rf-lede">(.*?)<\/p>/gs)].map(m => m[1]);
  assert.deepEqual(authorParagraphs, [
    'Sou Lucas Mateus. Trabalhei com recrutamento (TikTok e Reckitt) e com aprendizagem corporativa global (Wellhub), e ensino inglês há mais de cinco anos. No recrutamento, no ensino de inglês e no desenvolvimento de pessoas, encontrei situações que pedem mais do que uma orientação pronta. O que funciona depende de quem está ali, do que essa pessoa já viveu e das possibilidades que tem naquele momento.',
    'O Reta Final é um trabalho autoral que reúne o que aprendi vendo de perto como entrevistas em inglês funcionam e como aplicar técnicas usadas no mercado na preparação de quem vai passar por essa experiência.',
  ]);
  assert.match(author, /<img[^>]*src="\/images\/reta-final\/autor-lucas-mateus\.webp"[^>]*alt="Retrato ilustrado de Lucas Mateus"[^>]*>/);
  assert.doesNotMatch(author, /<a\b|<button\b|aprovad|contratad|★|depoimento/i);
  const portrait = readFileSync('dist/images/reta-final/autor-lucas-mateus.webp');
  assert.equal(portrait.toString('ascii', 12, 16), 'VP8 ');
  assert.equal(portrait.readUInt16LE(26) & 0x3fff, portrait.readUInt16LE(28) & 0x3fff, 'portrait is square');
  assert.ok(portrait.length <= 150_000, 'portrait is at most ~150 KB');
  const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
  assert.deepEqual(walk('dist').filter(f => /\.(mp3|m4a|wav|zip)$/i.test(f)), []);
  assert.doesNotMatch(page, /\.mp3|lucasmateus\.app/);
  assert.doesNotMatch(page, /\p{Extended_Pictographic}/u, 'the design system uses icons, never emoji');
  assert.doesNotMatch(readFileSync('dist/sitemap.xml', 'utf8'), /reta-final/);
  for (const route of routes) assert.ok(!html(route).includes('href="/reta-final/"'), route);
  for (const asset of ['fonts/inter-latin-opsz-normal.woff2', 'images/reta-final-lockup-white.svg', 'images/reta-final-mark.svg']) assert.ok(page.includes('/' + asset) && existsSync('dist/' + asset), asset);
});
