# Sentinel Security Journal

This journal tracks critical security architecture insights and patterns.

## 2026-11-05 - Worker API Defense-in-Depth Security Headers
**Vulnerability:** API endpoints returning JSON may omit standard defensive headers such as `X-Frame-Options`, `Content-Security-Policy: frame-ancestors 'none'`, and `Referrer-Policy`, relying solely on `X-Content-Type-Options: nosniff`. In cases of misinterpretation or browser navigation to JSON endpoints, framing or referrer leaks could occur.
**Learning:** Cloudflare Workers acting as API microservices should explicitly include `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, and `Referrer-Policy: strict-origin-when-cross-origin` across all API responses (both standard responses and OPTIONS preflights) to provide full defense in depth.
**Prevention:** Standardize baseline security headers across all API response helpers and preflight responses.
