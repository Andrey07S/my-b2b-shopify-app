# App architecture (FSD)

Routes stay in `app/routes/*` (thin entrypoints). Domain code uses FSD under `app/`.

Import alias: `@/*` → `app/*` (e.g. `@/shared/config/constants`).

Layers: `shared`, `entities`, `features`, `widgets`, `pages`.
