// Cartão social, ícones e manifest do domínio próprio do Reta Final. Só roda no build do perfil com checkout ativo
// (chamado por scripts/prune-profile.mjs). Textos vêm do HTML construído; as letras são contornos pré-gerados da
// Inter (scripts/og/glyphs.json), então o PNG não depende de fontes do sistema nem de navegador.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { plain } from './aeo-layer.mjs';

const glyphs = JSON.parse(readFileSync(new URL('./og/glyphs.json', import.meta.url), 'utf8'));
const C = { midnight: '#0c2038', midnightLine: '#2a4d72', white: '#ffffff', sky: '#c5d6e6', skyMuted: '#7fa3c4', signal: '#e8641b' };
export const OG = { width: 1200, height: 630, maxBytes: 300 * 1024 };

const need = (v, what) => {
  if (!v || /undefined|null/.test(v)) throw new Error(`Social: não consegui extrair "${what}" do HTML construído`);
  return v;
};

// Título, subtítulo e números do destaque, lidos da página (nada digitado aqui).
export function extractSocial(homeHtml, site) {
  const title = plain(need(homeHtml.match(/<title>(.*?)<\/title>/s)?.[1], 'título'));
  const [brand, subtitle] = title.split(' · ');
  need(brand, 'marca'); need(subtitle, 'subtítulo');
  const stages = need(plain(homeHtml.match(/<div class="rf-hero-foot">.*?(\d+ etapas)/s)?.[1] ?? ''), 'etapas');
  const terms = plain(homeHtml.match(/<p class="rf-terms">(.*?)<\/p>/s)?.[1] ?? '');
  const materials = need(terms.match(/(\d+) materiais/)?.[0], 'materiais');
  const audios = need(terms.match(/(\d+) áudios/)?.[0], 'áudios');
  return { brand, subtitle, highlight: `${stages} · ${materials} · ${audios} de treino`, domain: new URL(site).host, themeColor: C.midnight };
}

function text(str, x, y, size, weight, fill, spacing = 0) {
  const table = glyphs[weight];
  let cursor = 0;
  let out = '';
  for (const ch of str) {
    const g = table[ch];
    if (!g) throw new Error(`Social: falta o glifo "${ch}" em scripts/og/glyphs.json (rode scripts/og/make-glyphs.py)`);
    if (g.d) out += `<path transform="translate(${(x + cursor * size / 1000).toFixed(2)} ${y}) scale(${size / 1000})" d="${g.d}"/>`;
    cursor += g.w + spacing * 1000;
  }
  return { svg: `<g fill="${fill}">${out}</g>`, width: cursor * size / 1000 };
}

const arrow = (x, y, size, stroke) => `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="M3 21L20 4M9 4H20V15" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="square"/></g>`;

export function ogSvg(d) {
  const left = 84;
  const title = text(d.brand, left, 330, 168, 'bold', C.white, -0.025);
  if (title.width > OG.width - left * 2) throw new Error('Social: o título não cabe na imagem');
  const sub = text(d.subtitle, left, 410, 46, 'medium', C.sky, -0.005);
  const hi = text(d.highlight, left, 500, 34, 'medium', C.skyMuted);
  if (Math.max(sub.width, hi.width) > OG.width - left * 2) throw new Error('Social: o texto não cabe na imagem');
  const dom = text(d.domain, left, 580, 26, 'medium', C.skyMuted, 0.01);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="${OG.height}" viewBox="0 0 ${OG.width} ${OG.height}">
<rect width="${OG.width}" height="${OG.height}" fill="${C.midnight}"/>
<rect x="0" y="0" width="14" height="${OG.height}" fill="${C.signal}"/>
${arrow(left - 6, 74, 96, C.signal)}
${title.svg}${sub.svg}
<rect x="${left}" y="440" width="64" height="4" fill="${C.signal}"/>
${hi.svg}
<rect x="${left}" y="535" width="${OG.width - left * 2}" height="1" fill="${C.midnightLine}"/>
${dom.svg}
</svg>`;
}

const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${C.midnight}"/>${arrow(size * 0.2, size * 0.2, size * 0.6, C.signal)}</svg>`;

// ICO com um PNG 32x32 dentro (formato aceito por todos os navegadores atuais).
const ico = (png) => {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
  head[6] = 32; head[7] = 32; head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
  head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  return Buffer.concat([head, png]);
};

export async function socialFiles(d) {
  let sharp;
  try { sharp = createRequire(import.meta.url)('sharp'); } catch { throw new Error('Social: o pacote "sharp" (instalado com o Astro) não está disponível'); }
  const png = (svg, opts = {}) => sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, ...opts }).toBuffer();
  const og = await png(ogSvg(d));
  if (og.length > OG.maxBytes) throw new Error(`Social: og-image.png com ${og.length} bytes passa de ${OG.maxBytes}`);
  const manifest = {
    name: d.brand, short_name: d.brand, lang: 'pt-BR', start_url: '/', display: 'browser',
    theme_color: d.themeColor, background_color: d.themeColor,
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
  };
  return {
    'og-image.png': og,
    'apple-touch-icon.png': await png(iconSvg(180)),
    'icon-192.png': await png(iconSvg(192)),
    'icon-512.png': await png(iconSvg(512)),
    'favicon.ico': ico(await png(iconSvg(32))),
    'site.webmanifest': Buffer.from(JSON.stringify(manifest, null, 2) + '\n'),
  };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const meta = (attr, name, content) => `<meta ${attr}="${name}" content="${esc(content)}">`;

// Tags sociais de uma página; título, descrição e URL são os que a própria página já declara.
export function socialTags(html, d, site) {
  const get = (re, what) => need(html.match(re)?.[1], what);
  const title = get(/<meta property="og:title" content="([^"]*)"/, 'og:title');
  const description = get(/<meta property="og:description" content="([^"]*)"/, 'og:description');
  const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<');
  const image = `${site}/og-image.png`;
  return [
    meta('property', 'og:site_name', d.brand), meta('property', 'og:locale', 'pt_BR'),
    meta('property', 'og:image', image), meta('property', 'og:image:width', String(OG.width)), meta('property', 'og:image:height', String(OG.height)),
    meta('property', 'og:image:alt', `${d.brand} · ${d.subtitle}`),
    meta('name', 'twitter:card', 'summary_large_image'), meta('name', 'twitter:title', unesc(title)), meta('name', 'twitter:description', unesc(description)), meta('name', 'twitter:image', image),
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join('');
}
