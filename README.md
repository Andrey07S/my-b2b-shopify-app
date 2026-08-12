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

## Environments

| | Partner app | Config | App Home | Database |
|--|-------------|--------|----------|----------|
| **Local** | `my-b2b-smart-app-local` | `shopify.app.local.toml` | `shopify app dev` (tunnel) | Docker Postgres |
| **Staging** | `my-b2b-smart-app` | `shopify.app.toml` | Render | Render Postgres |

Two independent apps — local work does not change staging URLs or data.

## Requirements

- Node.js 20.19+ or 22.12+
- Docker Desktop (local Postgres)
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)
- Partner account + development store (Checkout UI needs Plus / Plus-dev)

## Setup

```bash
cp .env.example .env
```

In `.env` set at least:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/my_b2b_smart_app?schema=public
```

`SHOPIFY_*` for local are injected by `shopify app dev` from `shopify.app.local.toml` (use `#` for comments in `.env`, not `;`).

```bash
docker compose up -d
npm install
npm run setup
```

## Local development

```bash
docker compose up -d
shopify app config use shopify.app.local.toml
npm run setup          # first time / after Prisma changes
npm run dev
```

Press **P** → install/open the **local** app on the store.

In App Home:

1. **Activate shop features** (discount + cart transform + validation)
2. Configure thresholds / gift variants and **Save**
3. Add **Tier progress** in the theme editor and **Free gift** in the checkout editor

After changing scopes or extensions for local:

```bash
shopify app deploy --config shopify.app.local.toml
```

## Staging deploy

App Home on Render; extensions/functions via Shopify CDN (`shopify.app.toml`).

1. Render: Free **Postgres** + Free **Web Service** (Docker, this repo).
2. Env on Render: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SCOPES`, `SHOPIFY_APP_URL` (= Render URL), `DATABASE_URL`.
3. Same Render URL in `shopify.app.toml` (`application_url` + `auth.redirect_urls`).
4. Deploy staging app config + extensions:

```bash
shopify app config use shopify.app.toml
shopify app deploy --config shopify.app.toml
```

5. Install / open the **staging** app → Activate → smoke-test.

## Useful commands

```bash
npm run lint
npm run typecheck
shopify app config use shopify.app.local.toml   # switch to local
shopify app config use shopify.app.toml         # switch to staging
```
