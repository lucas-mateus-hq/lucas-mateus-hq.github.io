# Missão Imediata 01: revisão para Muse e Luke

Status: implementação, ajuste adicional e validação local concluídos; sem merge ou deploy. Base: `af7ab597ee6b8e54c8ed560d69d51ff037bc80c4`. Branch: `mission/imediata-01-reta-final-capa-reia`. Ajuste de texto/testes: commit `71f3c3b31e325e82180334d353c85db299aeec75`.

## Alterações

- Retiradas as páginas Astro do Reta Final, os cards das homes PT/EN e as duas entradas do sitemap.
- As URLs antigas agora são redirecionamentos estáticos gerados pelo Astro: `/criacoes/reta-final/` → `/` e `/en/criacoes/reta-final/` → `/en/`. São HTML com meta refresh, canonical, noindex e link de fallback, não HTTP 301/308. Funcionamento observado com JavaScript ligado e desligado.
- `public/images/reia-cover.webp` substituído pelo insumo corrigido do Drive, sem mudar código, nome ou caminho de uso.
- Contratos de navegação, links, rotas aposentadas e verificação de publicação ajustados ao comportamento solicitado. Rotas técnicas aposentadas continuam 404.
- Ajuste adicional aprovado por Luke em 8 nov 2026: removida do parágrafo `.lesson-separation` a segunda frase que citava o Reta Final, em PT e EN. A primeira frase foi preservada: “Nas aulas, você trabalha diretamente comigo.” / “Lessons involve working directly with me.” Nenhum outro conteúdo da seção Aulas foi alterado.

## Passo 0 aprovado sobre os insumos atuais

Documento: `SITE_MISSAO_IMEDIATA_01_RetaFinal_e_CapaREIA.md`, relido após a correção. Escopo fechado, destinos explícitos e critérios verificáveis. Nome do insumo e composição corrigidos.

Capa nova: 1200 × 1200 px, 33.896 bytes; referência: 300 × 300 px, 6.702 bytes. Comparação visual confirma capa vertical centralizada, margens laterais e proporções preservadas. Título, autor e faixa coral inferior completos, sem novos cortes. Texto mais definido em alta resolução e observado na página do REIA em desktop e celular. Nenhuma arte foi recriada ou retocada pelo executor.

## Metadados

Inspeção estrutural RIFF/WebP: nova capa e referência têm somente um bloco `VP8 ` de imagem. Não há EXIF, XMP, ICC, campos de autor, software ou datas embutidas. Nada precisou ser removido da capa recebida; os bytes aprovados foram preservados.

As capturas foram exportadas para WebP sem copiar metadados. Verificação de todos os WebP entregues confirma somente `VP8 `, sem blocos adicionais. Este relatório e os arquivos de código são texto simples, sem front matter ou propriedades documentais de autoria/software/datas. O nome visível do autor na arte foi preservado como conteúdo editorial. Metadados operacionais do Git/GitHub e do Drive não são propriedades embutidas nos arquivos e não foram alterados.

## Validação observada

Ambiente local: Linux, Node 24.22.1, npm 11.9.0, dependências do lock; Chromium 140.0.7339.16 (Playwright build 1187). Execução em 7 nov 2026; ajuste registrado em 8 nov 2026.

- `npm run build`: PASS, zero erros, zero warnings Astro.
- `npm run test:static`: PASS, 15 testes, incluindo links/âncoras/ativos, ausência de links para rotas aposentadas, sitemap, redirecionamentos, dimensões e metadados da capa. O novo contrato verifica a frase preservada e a ausência da menção em PT/EN.
- `npm run test:e2e`, `npm run test:fresh-eyes` e `npm run test:relay`: PASS, 47 testes no total. Inclui o novo teste de texto visível nas duas localidades, geometria em 320, 390, 768 e 1440 px, navegação PT/EN, teclado, redirects com/sem JavaScript e antigas rotas técnicas 404.
- `npm run test:intake`: PASS, 49 testes locais de regressão. Não é teste de integração com provedores nem envio real.
- `npm run test:intake-ui`: PASS, 7 testes com variáveis e desafio Turnstile sintéticos do workflow; provedores interceptados e sem envio real.
- `git diff --check`: PASS.
- HTML gerado das páginas REIA, portfólios PT/EN e privacidade PT/EN idêntico byte a byte ao build da base. Formulários e código de captação sem alterações.
- Navegador servido pelo `python -m http.server 4321 --bind 127.0.0.1 --directory dist`, sobre o mesmo artefato estático do build. Não foi teste em produção.

## Revisão editorial e limite de escopo

Teste de cinco segundos: homes mantêm trajetória profissional, serviço e criação REIA; a seção Criações apresenta o guia disponível e acesso à página existente. A página do REIA preserva proposta, conteúdo e checkout Hotmart.

**Revisão editorial concluída:** a frase remanescente que encaminhava ao Reta Final foi removida por autorização adicional de Luke. A frase sobre trabalho direto nas aulas permanece nos dois idiomas. Nenhuma outra parte da seção Aulas, promessa, preço ou CTA do Reta Final foi criada ou alterada.

**Nota de cobertura:** uma execução exploratória de `npx playwright test` sobre todos os arquivos também seleciona `tests/reia.spec.ts`, que não faz parte dos comandos do workflow `validate`. Um caso dessa spec falha na verificação `img.complete && naturalWidth > 0` da foto lazy do autor antes de trazê-la à viewport. A spec e a página REIA não foram alteradas nesta missão. Os comandos de navegador do workflow e o bloco separado `intake-ui` passaram.

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
