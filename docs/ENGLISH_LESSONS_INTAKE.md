# English lessons: screening and private WhatsApp alerts

## Decisão vigente: R$ 0 por mês (21 de outubro de 2026)

O Founder fixou o orçamento dos avisos em **R$ 0/mês**. Não habilitar cobrança,
upgrade, trial com conversão paga ou fallback para um provedor pago.
`WHATSAPP_COST_POLICY="zero"` impede o adaptador Meta existente de enviar,
mesmo com `WHATSAPP_BILLING_APPROVED="true"` e credenciais antigas presentes.
Política ausente ou desconhecida também bloqueia. Alterar a política para
`billable_approved` exigiria uma nova autorização explícita; os testes desse
modo são sintéticos e não representam a configuração autorizada.

**Estado real:** seção publicada; formulário implementado e testado localmente;
backend, banco, Turnstile e entrega real de WhatsApp ainda não ativados.
O contato público continua sendo LinkedIn. O número privado não é publicado.

Há uma possibilidade gratuita para avisos ao próprio dono: o tutorial oficial
do CallMeBot para Shopify descreve expressamente esse uso, incluindo eventos
de uma loja. Isso corrige a interpretação anterior de que qualquer aviso
relacionado a um negócio seria excluído pelo termo “personal use”. Não é uma
permissão para enviar mensagens a clientes, nem comprovação de autorização da
Meta. Em 21/10/2026 a página de ativação informa que o bot está cheio e esconde
o telefone; portanto **não há ativação nova disponível demonstrada**.

Fontes verificadas:
- https://www.callmebot.com/blog/whatsapp-messages-from-shopify/
- https://www.callmebot.com/blog/free-api-whatsapp-messages/
- https://www.callmebot.com/terms-of-service/
- https://www.callmebot.com/privacy-policy/

Não há adaptador CallMeBot implementado nem teste de entrega real. Não tentar
números antigos encontrados em terceiros. Quando houver vagas, a adesão deve
ser feita pelo dono no próprio WhatsApp, pelo procedimento publicado no site
oficial. A chave recebida seria cadastrada como segredo no servidor, nunca no
chat, GitHub ou HTML. Antes de integrar: verificar novamente condições e
privacidade, transmitir apenas um aviso mínimo sem nome/e-mail/respostas do
lead e confirmar uma entrega real ao dono. O provedor conhecerá o telefone de
destino e a mensagem; “não público no site” não significa invisível ao provedor.

**Próxima ação independente do WhatsApp:** abrir/criar uma conta Cloudflare
Free em https://dash.cloudflare.com/ e seguir os passos 1–3 abaixo para ativar
o recebimento privado. Não é necessário comprar domínio. A autenticação deve
ser feita pelo titular no provedor; não compartilhar senha ou token no chat.
Se o formulário for ativado antes dos avisos, o dono precisará consultar a
base privada manualmente. Não anunciar notificações automáticas nessa etapa.

## Actual release boundary

The PT/EN lessons section is publishable with the existing LinkedIn contact.
The form is implemented but not rendered unless both public activation settings
are configured. No live backend, D1 database, Turnstile widget, Meta business
account, approved template, billable messaging or real delivery is established
by this commit. Tests with intercepted providers are not production integration.

The owner phone number is never committed, embedded in assets, included in a
`wa.me` link or returned by the endpoint. It belongs only in `WHATSAPP_TO`, a
server-side secret. Do not copy the owner's private number into this document,
CI variables, screenshots, issue comments or pull requests.

## Research before wording (21 October 2026)

The author inspected actual service pages/form labels rather than treating a
marketplace's marketing promises as evidence of results:

- https://speaknation.com.br/ — four-question precontact form: name, objective,
  current level and main difficulty, then a transparent handoff to WhatsApp.
- https://englishcenter.nl/business-english-courses-in-the-netherlands/job-interview-coaching/
  — actual contact form asks for name, phone, email, preferred contact,
  interest and message. Its preparation process considers role, timeline and
  needs. The new portfolio form does not reproduce its extensive fields.
- https://www.teachingenglish.org.uk/sites/teacheng/files/needsanalysis.pdf
  — British Council/BBC needs analysis identifies work-related communication
  tasks and the learner's main goal. Used as conceptual reference; the PDF's
  wording/layout/material is not copied or redistributed.
- https://offers.talaera.com/english-culture-lessons — describes role, level
  and goal as inputs to matching; embedded form fields were not independently
  inspectable in retrieved HTML. Not claimed as a completed form inspection.
- https://www.nngroup.com/articles/better-link-labels/ — link labels should
  truthfully describe the action/destination.

Adaptation: ask about speaking in everyday descriptions rather than claiming a
CEFR diagnosis. Required: name, reply email, objective, speaking description,
time frame, short context, acknowledgement of purpose. Optional: availability
and time zone. No employer name, budget, résumé, audio, file upload, identity
document or payment is required. No marketing enrolment. PT/EN questions are
original writing. No guarantee of interviews, employment or fluency.

Visual QA also reproduced a nested-form language-switch issue: a sticky-header
focus change could replace the form fragment with its parent section. The
navigation enhancement now preserves an explicit marked nested fragment while
its parent remains the current section. The configured-form browser regression
checks the equivalent form route in English.

## Data flow

GitHub Pages form -> Cloudflare Worker -> private D1 record -> optional Meta
WhatsApp template alert containing the reference only. Records are saved before
attempting a notification. The visitor receives a reference only after storage
succeeds, even if notification fails. The alert does not forward the visitor's
name, email or answers to WhatsApp.

The owner opens Cloudflare Dashboard -> Workers & Pages -> D1 -> the bound
intake database -> Console/table view. This is an authenticated provider view,
not a public inbox. Find an alert's record with a parameterized management tool
or a carefully quoted UUID query. Do not paste personal data into public GitHub
issues. There is deliberately no public list/get endpoint or administration UI.

Live records expire after 30 days, purged by a daily scheduled Worker. Provider
backups and technical records follow Cloudflare's retention. If a client hires
the owner, necessary contractual records need separate retention handling.
Deletion requests can be received through the existing LinkedIn channel.
Requests are preliminary steps for a service at the visitor's request; no broad
marketing consent is added. The privacy notice switches with actual activation.

## Worker controls and limitations

- Exact portfolio Origin and POST-only JSON. CORS is not authentication.
- Bounded body (8 KiB, including streaming), strict field allowlist, limits,
  enum checks, UUID and acknowledgement checks; SQL parameters only.
- Server-side Turnstile validation, expected hostname and action, honeypot.
- At most 100 saved requests and 20 notification attempts per rolling 24 hours.
  These caps are atomic SQL conditions, not a promise of availability or zero
  hosting costs under all abuse. Use Cloudflare Free, and verify account plans.
- Idempotency is scoped to the same UUID and normalized content during the
  record's retention window. A new browser session/changed payload can create
  a new request. There is no cross-device identity matching.
- Notification: `pending`, `sending`, `accepted_by_provider`,
  `rejected_by_provider` or `unknown`. API acceptance is not delivered/read.
- No automatic notification retries. A timeout may have produced a message;
  resending automatically risks duplicate sends and charges. Operator checks
  the private record and provider status before manually deciding a retry.
- No claim of live D1/Workers integration based on local SQLite tests. No
  delivery webhook, high-availability guarantee or full CRM is implemented.
- No application logging of payloads, destination, credentials or raw provider
  errors. Worker observability is disabled in the example configuration;
  providers may still keep their own infrastructure records.

## Why WhatsApp is not enabled yet

GitHub Pages is static and cannot hide a phone or API credential in client JS:
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Meta's official pricing is per delivered message, with category/market rules:
https://business.whatsapp.com/products/platform-pricing
https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started

An unsolicited operational alert to the owner is not assumed to qualify for a
free customer-service window. A real business sending number, access token,
approved template, supported Graph version and cost approval are prerequisites.
The owner's receiving number is not silently registered/migrated as a sending
number. Template approval/category and actual delivery remain unverified.

The zero-budget decision above supersedes the earlier cost-approval path.
The Meta template adapter is retained for compatibility but blocked by the
current policy; no assumption about free service windows or free quotas can
enable it. A runtime flag cannot verify or control the provider account plan.

## Activation runbook (owner/account operator)

1. Check that the account is on **Workers Free**, not Workers Paid. Do not
   upgrade or add a billable fallback. Workers Free currently permits 100,000
   requests/day; D1 Free permits 5 million rows read/day, 100,000 written/day
   and 5 GB total storage. D1 rejects operations when its free limits are
   exhausted instead of silently upgrading. These are shared account limits,
   not guaranteed capacity for this form. Excess usage may interrupt intake;
   it does not authorize spending. Create a Worker and private D1
   database in that account; configure Turnstile for the exact portfolio hostname.
   Relevant provider limits:
   https://developers.cloudflare.com/workers/platform/pricing/
   https://developers.cloudflare.com/d1/platform/pricing/
   https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
2. Copy `wrangler.example.toml` to untracked `wrangler.toml`, replace database
   ID, apply `migrations/0001_intake.sql` using Wrangler D1 migrations, then
   configure `TURNSTILE_SECRET_KEY` with `wrangler secret put`. Account
   authentication must occur privately; do not put tokens in chat or source.
3. Deploy the backend with `INTAKE_ENABLED=true`, leaving WhatsApp disabled
   initially, with `WHATSAPP_COST_POLICY="zero"`. Verify a synthetic request
   against the real endpoint and check D1 persistence, duplicate protection,
   Turnstile and retention configuration.
4. **Do not execute this step under the current R$0 authorization.** Only if
   the Founder subsequently authorizes billable messaging, configure Meta's
   sending account and a template with one body text parameter: the request UUID. Suggested
   original template text: “Nova solicitação de aulas recebida. Protocolo: {{1}}.
   Consulte a base privada de solicitações.” Meta decides template approval
   and category. Set supported `META_GRAPH_VERSION`, template name/language;
   put `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID` and `WHATSAPP_TO` as secrets.
   Explicitly set `WHATSAPP_COST_POLICY="billable_approved"`, and set both
   `WHATSAPP_ENABLED` and `WHATSAPP_BILLING_APPROVED` to `true` only
   after these prerequisites are satisfied. Confirm an actual test notification
   on the owner's receiving device before claiming delivery.
5. Configure repository Actions variables `PUBLIC_LESSON_API_URL` (exact
   HTTPS workers.dev URL ending `/v1/lesson-requests`) and
   `PUBLIC_TURNSTILE_SITE_KEY` (public site key only). Rebuild and publish.
   The Worker secrets are not GitHub Pages build inputs.
6. Verify PT/EN, phone absent from browser source/network responses, real
   persistence and private inbox access. If notifications are later enabled,
   verify one actual notification separately. The live receipt must distinguish
   stored, accepted by provider, delivered and read; intake activation alone
   does not prove notification delivery. Disable public activation variables
   and rebuild if backend intake cannot be supported; LinkedIn stays available.

## Zero-budget regression evidence

Local execution on 21 October 2026: `npm run test:intake` passed 42 tests
(0 failed, 0 skipped); `npm run build` completed; `npm run test:static` passed
10 tests (0 failed, 0 skipped). Seven new checks cover the zero/missing/invalid
policy and the tracked deployment defaults. With stale billing approval and
synthetic credentials, blocked sends make no Meta request, preserve the stored
lead and acknowledge a replay without duplicating effects. Existing adapter
checks remain synthetic and require an explicit test-only billable policy.
No Cloudflare deployment, real lead or WhatsApp delivery was executed.

## Reproducible verification

- `npm run build && npm run test:static`: public default build.
- `npm run test:intake`: Node handler plus real local SQLite adapter, with
  synthetic Turnstile/Meta responses. No external provider calls.
- `npm run test:e2e`, `npm run test:fresh-eyes`, `npm run test:relay`:
  existing Chromium journeys, responsive geometry and retired routes in CI.
- Configured-form CI job sets a synthetic workers.dev endpoint and test site
  key, builds and runs `npm run test:intake-ui`. All external provider requests
  in its form scenarios are intercepted; it is not a real submission test.
- GitHub Pages production build has no activation settings by default and
  never exposes an unconnected form as a functioning collection channel.

## Required completion states

Track separately: section publication, local executor/SQL validation, configured
form browser validation, deployed backend, actual persisted lead, provider
acceptance, actual WhatsApp delivery and any cost approval. Do not collapse
these into “automation working”. No new private data from the teaching brief
or the owner's phone number is included in public evidence.
