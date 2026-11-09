# One-time Cloudflare Git import — interview intake (26/10/2026)

Goal: avoid manual copying/deploying Worker source, avoid manual local shell and minimize owner setup. The existing D1 `lucas-lessons-intake` was created in the Cloudflare dashboard, and its public UUID is pinned in `backend/lesson-intake/wrangler.toml`. All sensitive values remain outside the repository.

## What the owner needs to do only once

1. In Cloudflare **Workers & Pages** → **Create application** → **GitHub** (Import repository). Authorize Cloudflare to access `lucas-mateus-hq/lucas-mateus-hq.github.io` if prompted. Select that repository, `main` branch, Worker name **`lucas-lessons-intake`**, and **Root directory `backend/lesson-intake`**. Deploy command `npx wrangler deploy` (default); no Astro build command here. The checked-in Wrangler file prevents Workers autoconfig from trying to deploy the portfolio instead of the dedicated Worker. Choose a free Workers plan; do not upgrade. This deployment is still **not** approval to display the public form.
2. The private D1 database is empty until its schema is applied. In the D1 Console, run the SQL already checked in at `backend/lesson-intake/migrations/0001_intake.sql` (one-time setup), or use authenticated `wrangler d1 migrations apply lucas-lessons-intake --remote` once the deployment permissions are available. Do **not** apply both approaches repeatedly; versioned Wrangler migration bookkeeping is only created by the migrations command. If choosing Console for initial setup, future migration tracking will need a baseline; do not assume automatically tracked history.
3. Create a Cloudflare Turnstile widget for `lucas-mateus-hq.github.io`; add its **secret** only to the Worker at Settings → Variables and Secrets, type **Secret**, name `TURNSTILE_SECRET_KEY`. Do not paste the secret into ChatGPT, GitHub issues or public variables. Worker environment is `INTAKE_ENABLED=true`, but until a real secret and D1 schema exist it rejects submissions. Keep `WHATSAPP_COST_POLICY=zero` and WhatsApp disabled.
4. In GitHub Actions Variables, set `PUBLIC_LESSON_API_URL` to `https://<your-worker-name>.<your-subdomain>.workers.dev/v1/lesson-requests` (use the actual URL from the Worker), `PUBLIC_TURNSTILE_SITE_KEY` to the *public* Turnstile key and `INTAKE_RELEASE_APPROVED=true` only once the Worker preflight checks pass. Trigger the Pages workflow on `main`, then confirm a real browser submission is present in **private D1** before marketing the page as bookable.

## Boundaries

- A Cloudflare Git connection **automates subsequent Worker deployments**, but does not by itself install the D1 schema, create a Turnstile widget or demonstrate live requests.
- This repo does **not** contain Cloudflare login tokens, Turnstile secrets, payment details or personal customer information.
- A working Worker is not an automatic owner notification: D1 must be checked manually until a separate notification workflow exists.
- If the Cloudflare Git import UI differs from this guide, follow the verified root-directory, Worker name and zero-cost constraints; do not guess credentials or deploy the Astro site as a Worker.
- After finishing account setup, follow `docs/GO_LIVE_INTERVIEW.md` for final acceptance and rollback gates.
