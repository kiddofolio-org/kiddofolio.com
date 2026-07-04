# kiddofolio.com

Marketing / sales site for **Kiddofolio** — a done-for-you service that turns
children's physical artwork into custom-built gallery websites for families.

Static HTML / CSS / minimal JS. No framework. Hosted on Cloudflare Pages.

## Owner TODOs
- [ ] Stripe Payment Links (3 — one per tier deposit) — replace `STRIPE_*_DEPOSIT_LINK_TODO`
- [ ] Formspree endpoint — replace `REPLACE_ENDPOINT` in the contact form
- [ ] Connect `kiddofolio.com` domain to Cloudflare Pages
- [ ] Final legal copy: Terms, Privacy Policy, Refund Policy
- [ ] Post-purchase intake form (Google Form or similar)

## Structure
- `index.html` — the single page
- `assets/css/style.css` — design system + components
- `assets/js/main.js` — theme toggle, mobile nav, FAQ, scroll reveal
- `assets/img/` — logos (WebP) + generated brand images
- `design-test.html` — design-system proof page
