# Smart B2B Tier & Gift

Shopify app that adds tiered order discounts, a free gift at a cart threshold, and a B2B minimum-order check (via the `b2b` customer tag).

**Stack:** React Router · Prisma (Postgres) · Shopify Functions · Checkout / Theme / Admin UI extensions

## What it does

- **Tier discount** — percent off when cart subtotal reaches a threshold
- **Free gift** — customer picks a gift in checkout; Cart Transform adds it at $0
- **B2B minimum** — blocks checkout for tagged `b2b` customers below a minimum
- **Theme block** — progress bars toward discount / gift thresholds
- **Admin blocks** — B2B tag toggle on customer; order insights

Rules are saved in the app (Prisma) and synced to the shop metafield `$app.tier_rules` for Functions and extensions.

## Requirements

- Node.js 20.19+ or 22.12+
- Docker (local Postgres) or any Postgres URL
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)
- Partner account + development store (Checkout UI needs Plus / Plus-dev)

## Setup

```bash
cp .env.example .env
# fill SHOPIFY_API_KEY / SHOPIFY_API_SECRET (shopify app env)

docker compose up -d
npm install
npm run setup
```

## Run locally

```bash
npm run dev
```

Press **P** to open the app URL, install on the store, then in App Home:

1. **Activate shop features** (discount + cart transform + validation)
2. Configure thresholds / gift variants and **Save**
3. Add **Tier progress** in the theme editor and **Free gift** in the checkout editor

## Staging deploy

One environment. App Home on Render; extensions/functions via Shopify CDN.

1. Deploy Blueprint / Docker service from this repo (`render.yaml`).
2. Set `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL` (= Render URL), `DATABASE_URL`.
3. Put the same Render URL into `shopify.app.toml` (`application_url` + `auth.redirect_urls`).
4. `shopify app deploy` → Release → install / Activate on the store.

## Useful commands

```bash
npm run lint
npm run typecheck
npm run deploy
```
