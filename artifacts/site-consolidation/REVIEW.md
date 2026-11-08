# Consolidação do site: Lote 1

Base exata: PR #20, `5bcb681a9938093cd3a7185d442203a019a93eef`. Branch `mission/site-lote1-home`, empilhada sobre `mission/imediata-01-reta-final-capa-reia`. Sem merge/deploy.

Fonte de escopo: [W1 atual no Drive](https://drive.google.com/file/d/1PYESomasvckp8ZEeEv-3c0I1Og850TVS/view). Implementação autorizada por Luke nesta sessão.

Home PT/EN com serviço único de R$320: 30 min + 2 × 60 min, Google Meet, relatório e Interview Map em até 3 dias úteis da última sessão. Pagamento Hotmart após aprovação e antes da primeira sessão, sem checkout do serviço no site. REIA permanece com página própria e checkout existente. Aulas e sessão avulsa removidas da home/navegação; trajetória profissional preservada. Reta Final continua fora da superfície comercial conforme PR #20; sua futura publicação precisa do material/oferta aprovados.

Direção D6/D8: prova/sobre em marfim, tipografia Source Serif 4 local, assinatura petróleo–menta–marfim, callout Soft Mint e rota com movimento apenas transform/opacity e reduced-motion. Corrigido overflow com espaçamento de texto ampliado, sem esconder conteúdo.

## Leitura de cinco segundos
Público: profissionais preparando entrevistas em inglês. Benefício: organizar exemplos e praticar respostas. Prova: experiência profissional existente, claramente separada de resultados de clientes. Próximo passo: área de aplicação; neste lote ela comunica indisponibilidade real até a integração do Lote 2. A home não está liberada para lançamento comercial.

## Recomendações: pendência editorial
Chris Silva Upson, Gustavo Chaves e Leo Labra aparecem com nome/relação, sem citações. Textos públicos do LinkedIn **não recuperados/verificados nesta execução**. Nenhum texto atribuído foi inventado. Inserir citações somente após recuperar a fonte exata.

## Validação observada
Linux, Node 24.22.1, Chromium Playwright 1187. `npm run build`: zero erros/avisos Astro. `npm run test:static`: 15/15. `npm run test:intake`: 49/49, regressão histórica local, sem serviço externo. Playwright (personal, fresh-eyes, relay-zero-cost, reia): **53/53**, sem skips, cobrindo 320/390/768/1440, teclado, idiomas, espaçamento, reduced-motion e redirects. A spec REIA agora rola e espera a foto lazy carregar antes de verificar sua integridade. Servidor estático Python no mesmo processo de teste para evitar o daemon do preview neste ambiente.

Capturas reproduzidas da base e do candidato PT/EN, desktop/mobile:

| Idioma/largura | Antes | Depois |
| --- | --- | --- |
| PT 1440 | [Antes](before-pt-1440.webp) | [Depois](lote1-pt-1440.webp) |
| PT 390 | [Antes](before-pt-390.webp) | [Depois](lote1-pt-390.webp) |
| EN 1440 | [Antes](before-en-1440.webp) | [Depois](lote1-en-1440.webp) |
| EN 390 | [Antes](before-en-390.webp) | [Depois](lote1-en-390.webp) |

Privacidade/backend não alterados no Lote 1. Merge conjunto somente após revisão de Luke; Lote 2 será empilhado nesta branch. Nenhum formulário real submetido.
