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

## Lote 2: consolidação Tally, privacidade e futuras ofertas

Branch `mission/site-lote2-tally`, sobre o commit local do Lote 1 `72ef85fa7b3e0a344f8a43971ab861e022830995`.

### Reconciliação das decisões

- O W2 do Muse ainda exigia Worker/Turnstile, enquanto Luke reafirmou nesta sessão que o Cloudflare foi retirado do backend. Prevaleceu essa correção: Tally no código ativo e no Pages. Não ligar prontidão sem prova real de recebimento.
- PR #15 (`c920865d…`): reutilizada a arquitetura Tally; adaptados os quatro fluxos antigos para **duas aplicações localizadas do serviço único**. Não mergeado integralmente para não reintroduzir aulas/sessão avulsa. O iframe agora tem `src` nativo, sem depender de script externo no documento pai, mais fallback externo e referrerpolicy=no-referrer.
- PR #6 (Formspree): alternativa histórica, não combinada com Tally e não ativada. Nenhum roteamento ou coleta dupla.
- PR #18 (`16318b36…`): consentimento e testes reaproveitados, sem segunda tag ou GTM. Adicionada desativação por padrão até verificar Enhanced measurement e configuração da conta. Consentimento futuro/malformado não autoriza tracking. Não houve acesso/configuração da conta GA4 nem prova de recebimento.
- PR #20 (`5bcb681…`): preservado como base, incluindo capa REIA e aposentadoria comercial do Reta Final.

### Implementação

Aplicação com nome do serviço, explicação dos campos, currículo via link + resumo, vaga real/hipotética e data opcional. Os campos reais pertencem ao Tally: seu contrato está no runbook e **não foi criado/verificado na conta**. Não há novo payload `lesson-request`, Worker, D1 ou Turnstile no site. Histórico Worker/SQL preservado no backend, com regressão separada e runbooks antigos sinalizados como históricos.

Privacidade PT/EN atualizada para a aplicação, Tally, currículo/vaga, tratamento manual, sessões Google Meet e prazo de 3 dias úteis. Analytics opcional descrito com condição de ativação. Não alegamos gravação, transcrição, pagamento integrado, exclusão automática, entrega de e-mail ou conversão medidos.

Catálogo em `src/data/products.ts`, renderizado por `ProductShelf.astro`, com idioma, ativo real, página e checkout separados da aplicação. Só REIA cadastrado. [Procedimento para futura integração de produtos](../../docs/PRODUCT_INTEGRATION.md).

### Validação local

Build normal e configurado sinteticamente: zero erros/avisos Astro. Contratos estáticos: **16/16 em cada modo**. Configuração/prontidão da aplicação: **6/6**. Consentimento: **4/4**. Navegador geral: **53/53**. Navegador Tally/Analytics configurados: **5/5**, com requisições externas interceptadas e dados sintéticos. Verificados idiomas, iframe correto, fallback, ausência de parâmetros privados encaminhados, referrer policy, recusa/aceite/revogação e link sem JavaScript no documento pai. Isso não testa o formulário real do Tally nem prova que o provedor funciona sem JavaScript.

Lighthouse do build local sem integrações ativadas: gates desktop/mobile aprovados, duas execuções de cada; [métricas](lighthouse-summary.json). O Chrome completo não abriu nesta sandbox por restrição de socket; execução concluída com Chromium headless_shell já instalado, sem enfraquecer thresholds. Integrações reais ativadas ainda precisam de medição própria após configuração.

### Resultado e pendências reais

**Implementação local concluída; integração externa e lançamento comercial não concluídos.**

1. Dois formulários reais na conta Tally com campos/idiomas/aviso, resposta no painel e notificação na caixa de entrada verificados; só então habilitar prontidão. Currículo utiliza link + resumo neste candidato, sem upload.
2. Conferir Enhanced measurement desligado e destino GA4 antes de ativar medição. Código preparado fica inativo.
3. Recomendações LinkedIn: nomes/relações presentes; textos das citações não recuperados. Não inventados.
4. Vínculo externo Cloudflare Workers Builds permanece na conta. Alterar código/Pages não desconecta esse Git hook. Não foi removido nenhum recurso/banco/dado na Cloudflare.
5. Envio dos dois candidatos ao GitHub foi bloqueado pela revisão automática por entender ausente autorização explícita para push. Readback remoto não encontrou as branches novas. Não contornar o bloqueio. PRs novos, CI remoto, merge e deploy: **NOT_EXECUTED**. Somente PR #20 já existia remotamente. Antes do envio, respeitar as regras de assinatura do repositório; o commit local do Lote 1 não é assinado.

Sequência pretendida para revisão/publicação: PR #20 → Lote 1 → Lote 2, com os lotes publicados juntos após a aprovação do Luke e os testes de recebimento real. Não reaplicar os PRs #6/#15/#18 por cima desta consolidação sem revisão do diff, pois reintroduziriam fluxos antigos ou duplicariam Analytics.

Capturas finais locais (aplicação inativa): [PT desktop](final-pt-1440.webp), [PT mobile](final-pt-390.webp), [EN desktop](final-en-1440.webp), [EN mobile](final-en-390.webp).

Capturas do **provedor interceptado, não formulário real**: [PT com JS](lote2-pt-js.webp), [PT sem JS](lote2-pt-nojs.webp), [EN com JS](lote2-en-js.webp), [EN sem JS](lote2-en-nojs.webp).
