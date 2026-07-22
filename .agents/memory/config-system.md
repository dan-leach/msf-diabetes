---
name: Config system
description: How app configuration is fetched, cached, and distributed to all components.
---

Config is fetched once at startup by `src/assets/fetchConfig.js` and stored in a Vue `ref`.

**Distribution:** `main.js` calls `app.provide("config", config)` — components access it via `inject("config")`. The `config` ref is reactive, so all consumers stay in sync automatically.

**Endpoint selection** (two independent flags in `fetchConfig.js`):
- `import.meta.env.DEV` — Vite-managed. When true (i.e. `npm run dev`), loads from `public/config.json` (no network call). A console warning is printed.
- `underDevelopment` (manual boolean) — controls which live API endpoint a production build targets: `true` → `dev-api.msf.dka-calculator.co.uk`, `false` → `api.msf.dka-calculator.co.uk`. Must be set to `false` before any production release.

**After fetch:** Config is enriched client-side with `client.version`, `client.lastUpdated`, `client.underDevelopment`, and `client.offlineCalculatorVersion` before being made available.

**Sync trigger:** `syncOfflineData()` is called immediately after a successful config fetch. This is the mechanism that uploads any locally stored offline records.

**Caching:** Workbox caches the config endpoint with `StaleWhileRevalidate`, 30-day max age (`config-cache`).

**Why:** Components must never hardcode threshold values — always read from `config.value.*`. This allows clinical thresholds to be updated server-side without a client release.
