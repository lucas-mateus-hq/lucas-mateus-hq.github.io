# Lucas Mateus: site pessoal

Site bilíngue em Astro, publicado no GitHub Pages: https://lucas-mateus-hq.github.io/.

## Estado deste candidato

A home apresenta um único serviço: **Acompanhamento Individual para Entrevistas em Inglês**, R$320, sessão inicial de 30 minutos + duas de 60 minutos pelo Google Meet. Relatório e Interview Map em até 3 dias úteis após a última sessão. Aplicação antes do pagamento, combinado pela Hotmart após aprovação. REIA é o único produto disponível nesta versão. Reta Final não está anunciado; sua integração comercial futura depende da oferta e do pacote aprovados.

**Aplicações: Tally, ainda sem ativação real verificada.** São dois formulários localizados para o mesmo serviço. Worker, D1 e Turnstile não participam do site nem do workflow de publicação. O código histórico do Worker continua em `backend/lesson-intake/`; nenhum recurso ou dado Cloudflare foi excluído. O vínculo externo Cloudflare Workers Builds é uma configuração da conta, não é removido editando o site.

**Medição:** código de consentimento reaproveitado do PR #18, desabilitado por padrão. Ativar somente após verificar Enhanced measurement desligado no destino GA4 e revisar a configuração. Testes locais não provam recebimento no Analytics.

Veja [ativação das aplicações](docs/TALLY_FORMS_MIGRATION.md) e [integração e revisão dos lotes](artifacts/site-consolidation/REVIEW.md). Não tratar os runbooks antigos de aulas/Worker como instruções de ativação desta versão.

## Desenvolvimento

Node 22 ou superior e Python 3 para servir o build estático nos testes:

```
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run test:static
npm run test:intake
npm run test:analytics
npm run test:e2e
npm run test:fresh-eyes
npm run test:relay
```

`npm run test:tally-ui` exige build com IDs sintéticos documentados no workflow; todos os pedidos ao provedor são interceptados. `npm run test:legacy-intake` executa apenas a regressão histórica local do Worker/SQL, sem ativá-lo.

PRs validam; alterações aprovadas na `main` publicam no GitHub Pages. Os lotes são candidatos locais até envio, revisão e aprovação expressa de Luke. Não fazer merge/deploy automático.

Para futuras ofertas, veja [integração de produtos](docs/PRODUCT_INTEGRATION.md). O catálogo separa conteúdo comercial, página própria, imagem, idioma e checkout; não cria novas contas ou backend.
