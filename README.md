# kiddofolio.com

Marketing / sales site for **Kiddofolio** — a done-for-you service that turns
children's physical artwork into custom-built gallery websites for families.

Static HTML / CSS / minimal JS. No framework. Hosted on Cloudflare Pages.

**Repo:** https://github.com/kiddofolio-org/kiddofolio.com

## Owner TODOs

### 1. Stripe Payment Links (3 — one per tier deposit)
Create three Stripe Payment Links and replace the placeholders in `index.html`:
- `STRIPE_STARTER_DEPOSIT_LINK_TODO` → Starter deposit ($1,000)
- `STRIPE_SIGNATURE_DEPOSIT_LINK_TODO` → Signature deposit ($1,500)
- `STRIPE_LEGACY_DEPOSIT_LINK_TODO` → Legacy deposit ($2,000)

### 2. Formspree endpoint — DONE
Contact form posts to `https://formspree.io/f/xlgyvqyp`. Submissions arrive with
subject "New Kiddofolio inquiry"; a hidden `_gotcha` honeypot filters bot spam.
Manage notification email / recipients in the Formspree dashboard.

### 3. Connect Cloudflare Pages (auto-deploy from this repo)
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select **kiddofolio-org/kiddofolio.com**.
3. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = `/`** (root — the site is static, no build step).
4. Deploy. Cloudflare will publish to `kiddofolio.pages.dev` and auto-deploy on
   every push to `main`.
5. **Custom domain:** in the Pages project → **Custom domains** → add
   `kiddofolio.com` (and `www.kiddofolio.com`). If the domain's DNS is already on
   Cloudflare, records are added automatically; otherwise point DNS as instructed.

### 4. Final legal copy
Replace the footer `#` placeholder links with real pages: Terms, Privacy Policy,
Refund Policy.

### 5. Post-purchase intake
Add a post-deposit intake form (Google Form or similar) so families can send
shipping details and artwork counts after reserving.

## Structure
- `index.html` — the single page
- `assets/css/style.css` — design system + components
- `assets/js/main.js` — theme toggle (no localStorage), mobile nav, FAQ, scroll reveal
- `assets/img/` — logos (WebP) + generated brand images
- `design-test.html` — design-system proof page
