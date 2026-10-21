# Lucas Mateus · personal portfolio

Bilingual personal site at https://lucas-mateus-hq.github.io/. Astro static build with local fonts and images, LinkedIn-only contact and no visitor analytics.

Migrated from lucas-capability-os-pages, source release 37dbd2d96347234cc8f39b42711d265b9ad6f174. Visual identity and content unchanged. Legacy laboratory utilities and unrelated automations were not copied.

Node 22: `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, `npm run test:static`. CI also runs personal browser journeys, responsive geometry, retired-route checks and Lighthouse gates.

GitHub Pages publishing source must be GitHub Actions. PRs validate; main validates then deploys. The release receipt checks deployed SHA, all eight locale routes, assets and removed technical paths.
