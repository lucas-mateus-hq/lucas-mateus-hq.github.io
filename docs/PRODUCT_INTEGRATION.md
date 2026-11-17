# Integrar futuras ofertas

O catálogo público mora em `src/data/products.ts`; `ProductShelf.astro` renderiza as versões PT/EN. Hoje só REIA está cadastrado. O serviço individual tem aplicação independente: adicionar um produto não deve alterar Tally nem misturar dados de clientes.

Para incluir Reta Final ou outro produto, usar a oferta aprovada, ativos reais e checkout verificado. Criar a página, adicionar as traduções e o item do catálogo, atualizar sitemap e conferir idiomas, links, preço, promessa, compra e acesso mobile. Não reutilizar a rota aposentada do Reta Final sem substituir seus redirecionamentos e respectivos testes na mesma mudança. A página de vendas do Reta Final está preparada em `/reta-final/` (`RetaFinalSalesPage.astro`), fora do catálogo, do sitemap e da navegação. Sem `PUBLIC_RETA_FINAL_CHECKOUT_URL` ela mostra a compra como indisponível e não é indexada. A página não escreve domínio nem URL canônica: o domínio e o checkout entram só na publicação, depois de uma compra e entrega reais testadas.

Teste o build e os percursos reais da nova oferta antes de pedir aprovação para publicar. Um checkout que abre não comprova compra e acesso ao material. Analytics opcional e sua atribuição são uma integração separada; não habilitar só por adicionar uma oferta.

## Reta Final · oferta de lançamento e entrega

**Oferta vigente (Fase 1):** preço de lançamento de R$ 97,00, pagamento único pela Greenn e garantia de 7 dias. Não usar preço riscado, prazo, contagem regressiva nem parcelamento que não tenha sido conferido no checkout. Se o preço subir no futuro, ele muda nos três CTAs, no cartão da oferta e nos testes. O preço anterior não vira âncora.

**A página é uma listicle de 10 blocos:** hero, reconhecimento, 5 razões com páginas reais do material, como funciona, o que você recebe, como usar, para quem é, oferta, FAQ e CTA final. A fonte da verdade do layout é o canvas do Claude Design; o arquivo `.astro` é gerado a partir dele. A versão anterior, de 7 dobras, fica no board "Controle" do canvas para o Experimento 1 (controle × listicle). As demonstrações em `public/images/reta-final/exemplo-*.webp` formam um conjunto fechado de 7 páginas reais do Core Workbook, cada uma com 480×680 px: capa, sumário (p. 2), Preparation plan (p. 4), Interview map (p. 8), STAR story builder (p. 20 e 21) e Interview day card (p. 46). As páginas de ferramenta aparecem preenchidas com um único exemplo fictício: Mariana, analista de operações, vaga de Logistics Operations Analyst na "Example Retail Co.". A legenda "Exemplo fictício" fica no HTML (figcaption), nunca dentro da imagem. A p. 21 substitui a p. 19, que só tem caixas de marcar. Nenhuma outra página do material é publicada, e os testes garantem que só esses 7 arquivos existam em `dist/images/reta-final/`. Para trocar uma demonstração, preencher a página com a mesma persona fictícia (o script de preenchimento fica fora do repo, junto com os PDFs) e atualizar o conjunto nos testes. Nenhum arquivo pago (`.mp3`, `.zip` ou PDF completo) entra no repositório nem em `dist/`, e os testes verificam isso.

**Os 25 áudios fazem parte do produto,** não são bônus, brinde nem conteúdo opcional.

### Inventário entregue ao comprador

| Item | Conteúdo |
|---|---|
| `00_COMECE_AQUI.txt` | Guia de início: rota, etapas, uso dos áudios, preenchimento e salvamento |
| `01_Reta_Final_Preparacao_para_Entrevistas_em_Ingles.pdf` | Core Workbook, 48 páginas, 4 etapas, 10 ferramentas, preenchível |
| `02_Interview_Day_Card.pdf` | 3 páginas, preenchível |
| `03_Most_Common_Job_Interview_Questions.pdf` | 6 páginas, 12 perguntas, preenchível |
| `04_Business_English_para_Entrevistas.pdf` | 10 páginas, preenchível |
| `05_Transcricoes_Modulos.pdf` | 15 páginas, transcrições L1–L6 e S1–S6 |
| `06_Transcricoes_Mock_Interviews.pdf` | 26 páginas, transcrições M1–M5 em Listening e Speaking Practice |
| `07_Transcricoes_Useful_English_Labs.pdf` | 5 páginas, transcrições P1–P3 (Ouça e repita) |
| `08_Audios_Modulos_de_Entrevista/` | 12 MP3: `01_L1_…_Listening` a `12_S6_…_Speaking_Practice` |
| `09_Audios_Mock_Interviews/` | 10 MP3: `01_M1_Listening_Recruiter_Screen` a `10_M5_Speaking_Practice_Making_a_Recommendation` |
| `10_Audios_Useful_English_Labs/` | 3 MP3: `01_P1_Ownership_and_Results`, `02_P2_Pause_Clarify_and_Continue`, `03_P3_Interview_Facts_and_Professional_Vocabulary` |

São 7 PDFs (113 páginas), 25 MP3 (cerca de 83 MB) e o guia. A fonte é a pasta "Reta Final | Pacote do comprador (versão final)" no Drive do proprietário. Pastas marcadas como recuperadas ou não homologadas não entram na entrega.

`SHA256SUMS.txt` serve só para a validação interna de QA e integração. Ele não vai na raiz do `.zip` do comprador.

### Sequência de publicação (exige aprovação expressa do proprietário)

1. Transferir e configurar o domínio (CNAME, DNS e `site`). Isso move o portfólio inteiro, não só esta rota.
2. Fazer o merge com a compra ainda fechada (`noindex`).
3. Informar a URL da página no campo "Página de Vendas" da Greenn e configurar a entrega do pacote. Se o `.zip` passar do limite de arquivo da Greenn, usar um link somente leitura para a pasta de entrega.
4. Definir `PUBLIC_RETA_FINAL_CHECKOUT_URL`. Os três CTAs viram links e a página passa a ser indexável.
5. Antes de anunciar, fazer uma compra de teste real com o checklist abaixo.

### Checklist da compra de teste

- [ ] O e-mail de acesso da Greenn chega e o link abre no celular e no computador.
- [ ] O pacote baixado tem 7 PDFs, `00_COMECE_AQUI.txt` e 25 MP3 (12 + 10 + 3), com os nomes da tabela acima.
- [ ] Os arquivos conferem com o `SHA256SUMS.txt` interno (`sha256sum -c`).
- [ ] Uma faixa de cada pasta toca no celular e no computador, e a transcrição correspondente é encontrada pelo nome.
- [ ] Um campo do Workbook é preenchido, salvo e continua lá depois de reabrir o arquivo (Acrobat Reader no celular e Chrome no computador).
- [ ] O reembolso dentro da garantia está disponível na Greenn.

### Card da Greenn

`docs/assets/reta-final-greenn-512.png` (512×512): nome do produto, "Workbook + 25 áudios" e o motivo da escada. O card não tem preço, então não precisa ser refeito quando o preço mudar. Ele foi conferido em 96px, o tamanho em que aparece nas listagens.

## Ordem de ativação do checkout do Reta Final (Greenn)
1. Produto criado em rascunho na Greenn e link de checkout em mãos.
2. Compra de teste concluída: arquivos íntegros, PDFs preenchíveis, áudios tocando.
3. Só então definir `PUBLIC_RETA_FINAL_CHECKOUT_URL` na hospedagem e refazer o build.
4. Conferir `robots` = `index,follow` e os 3 botões abrindo o checkout.

Pendências para o dia da publicação (não resolvidas no PR #29): `canonical` e `og:url` (dependem do domínio final e do `site`), `og:image` aprovada, contato no rodapé, link de termos/reembolso e a URL da política de privacidade da Greenn. A privacidade já nomeia a Greenn para o Reta Final e mantém a Hotmart só para a REIA. Não copiar `sck` da REIA para o Reta Final antes de testar na Greenn.

## Build do domínio próprio do Reta Final (perfil `reta-final`)
- Comando: `npm run build:reta-final` (equivale a `PUBLIC_SITE_PROFILE=reta-final` + `astro build` + `scripts/prune-profile.mjs`). Saída: `dist-reta-final/`, ignorada pelo git.
- Publica só `/` (página de vendas) e `/privacidade/` (`RetaFinalPrivacyPage.astro`, sem REIA, Hotmart, GA4 nem aulas), com `site=https://lucasmateus.app`, `canonical` e `og:url`. O domínio vive apenas em `astro.config.mjs`; nenhuma página escrita à mão o contém.
- `robots.txt` bloqueia tudo e não há `sitemap.xml` enquanto `PUBLIC_RETA_FINAL_CHECKOUT_URL` estiver vazia. Com o checkout definido, o script gera o sitemap com `/` e `/privacidade/` e a linha `Sitemap` no `robots.txt`.
- O build padrão (sem a variável de perfil) não muda: a rota interna `perfil-reta-final/[page].astro` não gera nada nele. Conferido por hash de todo o `dist/`.
- Testes: `npm run test:profile` (faz seus próprios builds em `dist-reta-final/`). Ainda não roda no CI; o workflow do GitHub Pages não foi alterado.
- Pendências: contato e termos (T4), link da política da Greenn, texto de hospedagem do perfil (hoje neutro: "provedor de hospedagem") até saber onde o domínio será hospedado.

## Deploy do perfil Reta Final na Cloudflare (a pessoa executa; nada foi publicado)
- Projeto **separado** na Cloudflare, mesmo repositório. Quem cria o projeto é a pessoa responsável; o repositório só documenta.
- Comando de build: `npm run build:reta-final`. Diretório de saída: `dist-reta-final`.
- `PUBLIC_RETA_FINAL_CHECKOUT_URL` definida **só neste projeto**, e só depois da compra de teste aprovada (ordem de ativação acima).
- O domínio `lucasmateus.app` aponta só para este projeto. O `.app` exige HTTPS, que a Cloudflare emite. Para usar o domínio comprado no name.com `[PREMISSA]`: adicioná-lo como site na conta da Cloudflare e trocar os nameservers no name.com.
- **Opção A (preferida): Cloudflare Pages com Git.** Raiz do repositório, comando `npm run build:reta-final`, saída `dist-reta-final`. Não exige arquivo novo.
- **Opção B: Workers com static assets**, só se a tela de criação não oferecer Pages: um `wrangler.reta-final.jsonc` mínimo com `assets.directory` em `./dist-reta-final`, sem tocar `backend/lesson-intake/wrangler.toml`. O arquivo seria mostrado antes de entrar no repositório.
- O site pessoal é publicado pelo GitHub Pages (`.github/workflows/pages.yml`, job `deploy`, artefato de `dist`). A única configuração Cloudflare do repositório é o Worker do formulário de aulas (`backend/lesson-intake`). `[LACUNA]` Como o Worker `lucas-mateus-hq-github-io` do painel foi criado não está no repositório.
- O CI roda `npm run test:profile` só como teste; ele constrói em `dist-reta-final` e nunca publica nada.
- A política de privacidade do perfil não nomeia a Cloudflare até a decisão depois do primeiro deploy fechado.
- Antes de definir o checkout: o teste recusa o build se a privacidade tiver o placeholder de contato ou não tiver o e-mail.

## Sitemap e robots do domínio do Reta Final
- Método: script pós-build (`scripts/prune-profile.mjs`), sem plugin, para não alterar o build padrão do site pessoal.
- O `sitemap.xml` lista as páginas indexáveis realmente construídas (hoje `/` e `/privacidade/`), com `<lastmod>` da data do último commit que tocou os arquivos de origem de cada rota. Sem checkout ativo, não há sitemap e o `robots.txt` bloqueia tudo.
- Com checkout ativo, o `robots.txt` libera o rastreamento e aponta para `https://lucasmateus.app/sitemap.xml`.
- Endereço para o Google Search Console: `https://lucasmateus.app/sitemap.xml` (no campo "Adicionar um novo sitemap", digitar `sitemap.xml`).

## Cabeçalhos de segurança do domínio do Reta Final
- Só no build do perfil com checkout ativo, `scripts/prune-profile.mjs` gera `dist-reta-final/_headers` (Cloudflare Pages). Sem checkout não há `_headers` e o build padrão do site pessoal não muda (`dist/` idêntico por hash).
- Conteúdo: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` sem câmera, microfone, geolocalização e pagamento, `Strict-Transport-Security: max-age=31536000` e uma CSP restrita (`script-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'`, imagens, fontes e CSS só do próprio domínio; `style-src` mantém `'unsafe-inline'` porque o Astro embute CSS no HTML).
- O link da Greenn não aparece na CSP: a compra é um link comum, e CSP não limita navegação por link. Se um dia houver formulário, script, imagem ou fonte externa na página, a política precisa ser ampliada em `scripts/prune-profile.mjs`; `npm run test:profile` falha antes disso chegar ao ar.
- HSTS sem `includeSubDomains` e sem `preload` de propósito: o `preload` é difícil de desfazer e `includeSubDomains` afetaria qualquer subdomínio sem HTTPS. Decisão do proprietário, se quiser endurecer.
- Se o Cloudflare Web Analytics estiver ligado no projeto, o script dele será bloqueado pela CSP; não está em uso hoje.

## Camada AEO (llms.txt e JSON-LD) do domínio do Reta Final
- Só no build do perfil com checkout ativo. Sem checkout: `robots.txt` bloqueia tudo, sem `llms.txt` e sem JSON-LD. O build padrão do site pessoal não muda (`dist/` idêntico por hash).
- `scripts/aeo-layer.mjs` extrai do HTML construído o nome, a descrição, o preço, o link de checkout, os itens do pacote, as perguntas frequentes, o autor e o contato; se algo não for encontrado, o build para.
- `llms.txt` (em `https://lucasmateus.app/llms.txt`): título, resumo, páginas principais, detalhes da oferta, itens do pacote, perguntas frequentes, autoria e contato.
- JSON-LD: `/` com `Course` (com `author`, `provider` e `Offer`) e `FAQPage`; o tipo `Product` foi evitado porque o Google o trata como listagem do comerciante e exige `image`, frete e política de devolução; `/privacidade/` com `WebPage`. O valor do preço vem da página.
- `robots.txt` com permissão explícita para OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot e Google-Extended, além de `*`.
- O e-mail de contato aparece no `llms.txt` porque já está público na privacidade; para tirá-lo, remova a linha `Contato:` em `scripts/aeo-layer.mjs`.

## Cartão social, ícones e manifest do domínio do Reta Final
- Só no build do perfil com checkout ativo (`scripts/generate-og.mjs`, chamado por `scripts/prune-profile.mjs`). Sem checkout nada disso é gerado e o `dist/` padrão do site pessoal não muda (idêntico por hash).
- Arquivos gerados na raiz de `dist-reta-final`: `og-image.png` (1200×630, PNG, abaixo de 300 KB; hoje ~21 KB), `apple-touch-icon.png` (180×180), `icon-192.png`, `icon-512.png`, `favicon.ico` (32×32) e `site.webmanifest` (`name` e `short_name` "Reta Final", `start_url` `/`, `display` `browser`).
- Texto da imagem extraído do HTML construído: marca e subtítulo do `<title>`, e "4 etapas · 7 materiais · 25 áudios de treino" dos números da própria página; domínio vem do `site`. Se algo não for encontrado, falta glifo ou o texto não cabe, o build para.
- As letras são contornos da Inter em `scripts/og/glyphs.json` (regerar com `python3 scripts/og/make-glyphs.py`, precisa de `fonttools` e `brotli`), então o PNG não depende de fontes do sistema nem de navegador. O PNG é renderizado com o `sharp`, que já vem junto com o Astro.
- Tags nas duas rotas (`/` e `/privacidade/`): `og:type`, `og:title`, `og:description` e `og:url` (já existiam), mais `og:site_name`, `og:locale` (`pt_BR`), `og:image` (`https://lucasmateus.app/og-image.png`), `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`, `rel="icon"` para o `.ico`, `apple-touch-icon` e `manifest`. O `rel="icon"` SVG do Reta Final (seta laranja) continua.
- A imagem não entra no JSON-LD `Course` (evita risco de aviso no Teste de Pesquisa Aprimorada).
- Depois do deploy, redes sociais guardam o cartão em cache: use o Depurador de Compartilhamento do Facebook, o Post Inspector do LinkedIn ou um link novo (`?v=2`) para forçar a releitura.
