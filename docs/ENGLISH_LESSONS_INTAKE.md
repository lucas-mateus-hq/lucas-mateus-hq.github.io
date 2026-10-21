# English lessons: screening and private WhatsApp alerts

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

CallMeBot was researched, not integrated: its page limits its free API to
personal use and reported no new activation slots during this inspection:
https://www.callmebot.com/blog/free-api-whatsapp-messages/
Do not relabel a commercial lead workflow as a personal home-automation use.

## Activation runbook (owner/account operator)

1. Check the Cloudflare account and Free plan. Create a Worker and private D1
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
   initially. Verify a synthetic request against the real endpoint and check
   D1 persistence, duplicate protection, Turnstile and retention configuration.
4. If the Founder approves messaging costs, configure Meta's sending account
   and a template with one body text parameter: the request UUID. Suggested
   original template text: “Nova solicitação de aulas recebida. Protocolo: {{1}}.
   Consulte a base privada de solicitações.” Meta decides template approval
   and category. Set supported `META_GRAPH_VERSION`, template name/language;
   put `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID` and `WHATSAPP_TO` as secrets.
   Set both `WHATSAPP_ENABLED` and `WHATSAPP_BILLING_APPROVED` to `true` only
   after these prerequisites are satisfied. Confirm an actual test notification
   on the owner's receiving device before claiming delivery.
5. Configure repository Actions variables `PUBLIC_LESSON_API_URL` (exact
   HTTPS workers.dev URL ending `/v1/lesson-requests`) and
   `PUBLIC_TURNSTILE_SITE_KEY` (public site key only). Rebuild and publish.
   The Worker secrets are not GitHub Pages build inputs.
6. Verify PT/EN, phone absent from browser source/network responses, real
   persistence, inbox access and one actual notification. The live receipt must
   distinguish accepted, delivered and read. Disable public activation variables
   and rebuild if backend intake cannot be supported; LinkedIn stays available.

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
