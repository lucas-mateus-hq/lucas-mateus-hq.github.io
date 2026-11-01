## 2026-10-31 - Standalone pages require dedicated skip-to-content links
**Learning:** While layouts like `PersonalLayout` provide top-level accessibility features (e.g. skip-links), standalone pages like `PortfolioPage` and `PrivacyPage` bypass shared layouts and require explicit skip-to-content anchors pointing to their respective main containers with `tabindex="-1"` and `:focus-visible` outlines.
**Action:** Always verify that every top-level page template provides a skip-to-content mechanism and programmatically manages initial focus into `<main>`.
