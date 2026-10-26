# Lucas Mateus · personal portfolio

Bilingual personal site at https://lucas-mateus-hq.github.io/. Astro static build with local fonts and images. A verified private intake is required before publishing the paid interview offer; no visitor analytics.

Migrated from lucas-capability-os-pages, source release 37dbd2d96347234cc8f39b42711d265b9ad6f174. Visual identity and content unchanged. Legacy laboratory utilities and unrelated automations were not copied.

Node 22: `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, `npm run test:static`. CI also runs personal browser journeys, responsive geometry, retired-route checks and Lighthouse gates.

GitHub Pages publishing source must be GitHub Actions. PRs validate; main validates then deploys. The release receipt checks deployed SHA, all eight locale routes, assets and removed technical paths.


## Mock interview offer (approved for gated release)

The bilingual home page now includes a **60-minute one-off mock job interview in English** priced at **R$80**, distinct from ongoing English lessons and the self-guided Reta Final toolkit. The dedicated request form asks for name, email, target role and scheduling availability, plus optional context. This is a new commercial service; prior hiring and English-teaching experience must not be described as a sales record for mock interviews. After each completed session, the owner commits to send a concise, human-reviewed personalized written feedback report by email **within two hours of the session ending**, whether or not any future transcription tool is used.

When PUBLIC_LESSON_API_URL and PUBLIC_TURNSTILE_SITE_KEY are configured, the new form sends the same allowlisted lesson-request payload to the existing private Cloudflare Worker; the context field identifies the mock-interview service. No new backend permissions, storage tables or payment integrations are introduced.

While intake is not activated, the site shows a clear 'online booking being prepared' notice and **does not accept any mock interview inquiries**. The GitHub Pages deployment job is gated on real Worker/Turnstile configuration and an explicit owner readiness variable. See docs/GO_LIVE_INTERVIEW.md for account setup, preflight and post-release tests. No real payments or confirmed bookings are implied. Meeting bots, recording, automatic transcripts, analytics and email delivery are not configured by this PR. Take manual notes for the first sessions; never add a recording bot without explicit informed agreement and a documented provider/storage/retention policy. See docs/MOCK_INTERVIEW_DELIVERY.md.
