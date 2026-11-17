// Camada AEO do build do domínio próprio do Reta Final: JSON-LD e llms.txt.
// Tudo é extraído do HTML já construído das páginas (única fonte da verdade): nada é digitado aqui.
// Se o HTML mudar de forma que a extração falhe, o build para em vez de publicar dado vazio ou inventado.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
export const plain = (html) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([.,;:!?)])/g, '$1').replace(/\(\s+/g, '(').trim();

const need = (value, what) => {
  if (value === undefined || value === null || (typeof value === 'string' && (value.trim() === '' || /undefined|null|\[object/.test(value)))) {
    throw new Error(`AEO: não consegui extrair "${what}" do HTML construído`);
  }
  return value;
};
const first = (html, re, what) => need(html.match(re)?.[1], what);

export function assertComplete(value, path = '$') {
  if (value === undefined || value === null || value === '') throw new Error(`AEO: valor vazio em ${path}`);
  if (typeof value === 'string' && /\bundefined\b|\[object|\bnull\b/.test(value)) throw new Error(`AEO: valor inválido em ${path}`);
  if (Array.isArray(value)) {
    if (value.length === 0) throw new Error(`AEO: lista vazia em ${path}`);
    value.forEach((v, i) => assertComplete(v, `${path}[${i}]`));
  } else if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) assertComplete(v, `${path}.${k}`);
  }
}

export const jsonLdTag = (data) => {
  assertComplete(data);
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
};

export function extract(homeHtml, privacyHtml, site) {
  const title = plain(first(homeHtml, /<title>(.*?)<\/title>/s, 'título da página'));
  const description = decode(first(homeHtml, /<meta name="description" content="([^"]*)"/, 'descrição da página'));
  const productName = plain(first(homeHtml, /<div class="rf-card-h"><strong>(.*?)<\/strong>/s, 'nome do produto'));
  const priceText = first(homeHtml, /<p class="rf-price"><small>R\$<\/small>([\d.,]+)<\/p>/, 'preço');
  const price = priceText.replace(/\./g, '').replace(',', '.');
  if (!/^\d+\.\d{2}$/.test(price)) throw new Error(`AEO: preço fora do formato esperado: ${priceText}`);
  const priceLabel = plain(first(homeHtml, /<p class="rf-was">(.*?)<\/p>/s, 'rótulo do preço'));
  const payment = plain(first(homeHtml, /<p class="rf-pay">(.*?)<\/p>/s, 'meios de pagamento'));
  const checkout = first(homeHtml, /<a class="rf-cta[^"]*" href="(https:\/\/[^"]+)" data-rf-checkout>/, 'link de checkout');
  const bullets = [...first(homeHtml, /<p class="rf-pay">.*?<\/a><ul>(.*?)<\/ul>/s, 'lista da oferta').matchAll(/<li>(.*?)<\/li>/gs)].map((m) => plain(m[1]));
  const items = homeHtml.split(/<div class="rf-item(?=[ "])/).slice(1).map((block) => {
    const head = block.match(/<span class="rf-seal">\d+<\/span><div class="rf-item-h">(?:<svg.*?<\/svg>)?<h3[^>]*>(.*?)<\/h3>((?:<span class="rf-chip">.*?<\/span>)*)<\/div><p>(.*?)<\/p>/s);
    if (!head) return null;
    const groups = [...(block.match(/<ul class="rf-audio-groups">(.*?)<\/ul>/s)?.[1] ?? '').matchAll(/<li>(.*?)<\/li>/gs)].map((g) => plain(g[1]).replace(/\.$/, ''));
    return {
      name: plain(head[1]),
      chips: [...head[2].matchAll(/<span class="rf-chip">(.*?)<\/span>/gs)].map((c) => plain(c[1])),
      text: [plain(head[3]), groups.join('; ') + (groups.length ? '.' : '')].filter(Boolean).join(' '),
    };
  }).filter(Boolean);
  const faq = [...homeHtml.matchAll(/<details[^>]*><summary>(.*?)<\/summary>(.*?)<\/details>/gs)].map((m) => ({ question: plain(m[1]), answer: plain(m[2]) }));
  const authorBlock = first(homeHtml, /<div class="rf-author-copy">(.*?)<\/div>/s, 'bloco do autor');
  const author = [...authorBlock.matchAll(/<p class="rf-lede">(.*?)<\/p>/gs)].map((m) => plain(m[1]));
  const authorName = need(author[0]?.match(/^Sou ([^.]+)\./)?.[1], 'nome do autor');
  const guarantee = plain(first(homeHtml, /<span class="rf-label">(?:<svg.*?<\/svg>)?(Garantia[^<]*)<\/span>/s, 'garantia'));
  const privacyTitle = plain(first(privacyHtml, /<title>(.*?)<\/title>/s, 'título da privacidade'));
  const privacyDescription = decode(first(privacyHtml, /<meta name="description" content="([^"]*)"/, 'descrição da privacidade'));
  const contactEmail = first(privacyHtml, /href="mailto:([^"]+)"/, 'e-mail de contato');
  const homeUrl = `${site}/`;
  const privacyUrl = `${site}/privacidade/`;
  if (items.length < 6) throw new Error(`AEO: esperava os itens do pacote, achei ${items.length}`);
  if (faq.length < 3) throw new Error(`AEO: esperava as perguntas frequentes, achei ${faq.length}`);
  return { title, description, productName, price, priceText, priceLabel, payment, checkout, bullets, items, faq, author, authorName, guarantee, privacyTitle, privacyDescription, contactEmail, homeUrl, privacyUrl };
}

export function homeJsonLd(d) {
  return [
    jsonLdTag({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: d.productName,
      description: d.description,
      url: d.homeUrl,
      inLanguage: 'pt-BR',
      author: { '@type': 'Person', name: d.authorName },
      provider: { '@type': 'Person', name: d.authorName },
      offers: { '@type': 'Offer', price: d.price, priceCurrency: 'BRL', availability: 'https://schema.org/InStock', url: d.checkout },
    }),
    jsonLdTag({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: d.faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    }),
  ].join('');
}

export const privacyJsonLd = (d) => jsonLdTag({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: d.privacyTitle,
  description: d.privacyDescription,
  url: d.privacyUrl,
  inLanguage: 'pt-BR',
  isPartOf: { '@type': 'WebSite', name: d.productName, url: d.homeUrl },
});

export function llmsTxt(d) {
  const lines = [
    `# ${d.title}`,
    '',
    `> ${d.description}`,
    '',
    '## Páginas principais',
    `- [${d.productName}](${d.homeUrl}): página de vendas com o que o pacote inclui, o preço, a garantia e as perguntas frequentes.`,
    `- [${d.privacyTitle}](${d.privacyUrl}): ${d.privacyDescription}`,
    '',
    '## Detalhes da oferta',
    `- ${d.priceLabel}: R$ ${d.priceText}, pagamento único. ${d.payment}.`,
    ...d.bullets.map((b) => `- ${b}`),
    '',
    '## O que o pacote inclui',
    ...d.items.map((i) => `- ${i.name}${i.chips.length ? ` (${i.chips.join(', ')})` : ''}: ${i.text}`),
    '',
    '## Perguntas frequentes',
    ...d.faq.map((f) => `- ${f.question} ${f.answer}`),
    '',
    '## Autoria e contato',
    ...d.author.map((p) => `- ${p}`),
    `- Contato: ${d.contactEmail}`,
    '',
  ];
  return lines.join('\n');
}
