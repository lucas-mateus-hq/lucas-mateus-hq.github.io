# Missão Imediata 01: revisão para Muse e Luke

Status: implementação e validação locais concluídas; sem merge ou deploy. Base: `af7ab597ee6b8e54c8ed560d69d51ff037bc80c4`. Branch: `mission/imediata-01-reta-final-capa-reia`.

## Alterações

- Retiradas as páginas Astro do Reta Final, os cards das homes PT/EN e as duas entradas do sitemap.
- As URLs antigas agora são redirecionamentos estáticos gerados pelo Astro: `/criacoes/reta-final/` → `/` e `/en/criacoes/reta-final/` → `/en/`. São HTML com meta refresh, canonical, noindex e link de fallback, não HTTP 301/308. Funcionamento observado com JavaScript ligado e desligado.
- `public/images/reia-cover.webp` substituído pelo insumo corrigido do Drive, sem mudar código, nome ou caminho de uso.
- Contratos de navegação, links, rotas aposentadas e verificação de publicação ajustados ao comportamento solicitado. Rotas técnicas aposentadas continuam 404.

## Passo 0 aprovado sobre os insumos atuais

Documento: `SITE_MISSAO_IMEDIATA_01_RetaFinal_e_CapaREIA.md`, relido após a correção. Escopo fechado, destinos explícitos e critérios verificáveis. Nome do insumo e composição corrigidos.

Capa nova: 1200 × 1200 px, 33.896 bytes; referência: 300 × 300 px, 6.702 bytes. Comparação visual confirma capa vertical centralizada, margens laterais e proporções preservadas. Título, autor e faixa coral inferior completos, sem novos cortes. Texto mais definido em alta resolução e observado na página do REIA em desktop e celular. Nenhuma arte foi recriada ou retocada pelo executor.

## Metadados

Inspeção estrutural RIFF/WebP: nova capa e referência têm somente um bloco `VP8 ` de imagem. Não há EXIF, XMP, ICC, campos de autor, software ou datas embutidas. Nada precisou ser removido da capa recebida; os bytes aprovados foram preservados.

As capturas foram exportadas para WebP sem copiar metadados. Verificação de todos os WebP entregues confirma somente `VP8 `, sem blocos adicionais. Este relatório e os arquivos de código são texto simples, sem front matter ou propriedades documentais de autoria/software/datas. O nome visível do autor na arte foi preservado como conteúdo editorial. Metadados operacionais do Git/GitHub e do Drive não são propriedades embutidas nos arquivos e não foram alterados.

## Validação observada

Ambiente local: Linux, Node 24.22.1, npm 11.9.0, dependências do lock; Chromium Playwright 1187.

- `npm run build`: PASS, zero erros, zero warnings Astro.
- `npm run test:static`: PASS, 15 testes, incluindo links/âncoras/ativos, ausência de links para rotas aposentadas, sitemap, redirecionamentos, dimensões e metadados da capa.
- `npx playwright test tests/personal.spec.ts tests/relay-zero-cost.spec.ts tests/fresh-eyes.spec.ts`: PASS, 47 testes. Geometria em 320, 390, 768 e 1440 px; navegação PT/EN, teclado, redirects com/sem JavaScript e antigas rotas técnicas 404.
- `npm run test:intake`: PASS, 49 testes locais de regressão. Não é teste de integração com provedores nem envio real.
- `git diff --check`: PASS.
- HTML gerado das páginas REIA, portfólios PT/EN e privacidade PT/EN idêntico byte a byte ao build da base. Formulários e código de captação sem alterações.
- Navegador servido pelo `python -m http.server 4321 --bind 127.0.0.1 --directory dist`, sobre o mesmo artefato estático do build. Não foi teste em produção.

## Revisão editorial e limite de escopo

Teste de cinco segundos: homes mantêm trajetória profissional, serviço e criação REIA; a seção Criações apresenta o guia disponível e acesso à página existente. A página do REIA preserva proposta, conteúdo e checkout Hotmart.

**Pendência editorial para decisão:** `src/components/EnglishLessons.astro` já contém, em PT e EN, uma frase de encaminhamento ao Reta Final na próxima seção. Foi preservada porque a missão proíbe alterar textos fora do escopo. Não é um hyperlink e não quebra a checagem de links, mas torna-se uma referência textual desatualizada. Nenhuma promessa, preço ou CTA novo do Reta Final foi criado. Remover essa frase exige ampliar explicitamente o escopo de texto da seção Aulas.

## Capturas antes/depois

Todas são capturas reais do build local, com fontes e imagens carregadas. As homes completas incluem a seção Aulas preservada. Há recortes de Criações para facilitar a comparação. Exportação WebP qualidade 90; os recortes do topo REIA mostram o encaixe da capa.

| Página | Antes | Depois |
| --- | --- | --- |
| home-pt 1440px | [Antes](before-home-pt-1440.webp) | [Depois](after-home-pt-1440.webp) |
| home-pt 390px | [Antes](before-home-pt-390.webp) | [Depois](after-home-pt-390.webp) |
| home-en 1440px | [Antes](before-home-en-1440.webp) | [Depois](after-home-en-1440.webp) |
| home-en 390px | [Antes](before-home-en-390.webp) | [Depois](after-home-en-390.webp) |
| reia 1440px | [Antes](before-reia-1440.webp) | [Depois](after-reia-1440.webp) |
| reia 390px | [Antes](before-reia-390.webp) | [Depois](after-reia-390.webp) |
| Criações home-pt 1440px | [Antes](before-home-pt-1440-criacoes.webp) | [Depois](after-home-pt-1440-criacoes.webp) |
| Criações home-pt 390px | [Antes](before-home-pt-390-criacoes.webp) | [Depois](after-home-pt-390-criacoes.webp) |
| Criações home-en 1440px | [Antes](before-home-en-1440-criacoes.webp) | [Depois](after-home-en-1440-criacoes.webp) |
| Criações home-en 390px | [Antes](before-home-en-390-criacoes.webp) | [Depois](after-home-en-390-criacoes.webp) |
| Topo REIA 1440px | [Antes](before-reia-1440-top.webp) | [Depois](after-reia-1440-top.webp) |
