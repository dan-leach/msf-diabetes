---
name: Safari offline fix
description: Why Safari/iOS PWA fails offline when the service worker cache is unavailable, and how the localStorage fallback solves it.
---

## The problem

On Safari/iOS (particularly home-screen PWAs), `fetch()` throws `TypeError: Load failed` when offline — equivalent to Chrome's `TypeError: Failed to fetch`. However, Safari has known gaps in cross-origin service worker interception, so the Workbox `StaleWhileRevalidate` cache for the config endpoint is not reliably served before the app's `onMounted` fires. If the SW cache is cold (device never used the app online, or SW not yet activated), `fetchConfig()` throws and `App.vue` shows the "Sorry, something went wrong..." error screen before the user can do anything.

## The fix

Two files changed — no architectural change, no SW config change.

### `fetchConfig.js`
- On every **successful** API fetch: persist the raw JSON response to `localStorage` under key `"cachedConfig"` (wrapped in try/catch so a full localStorage quota error doesn't break the online path).
- On **network failure** (`error instanceof TypeError` or `error.name === "AbortError"`): attempt to restore from `localStorage.getItem("cachedConfig")`. If found: parse it, repopulate `config.value`, re-apply client-side enrichment fields, and return — skipping `syncOfflineData()` (nothing to sync while offline). If not found: fall through to the original error throw.
- Server-side errors (`error.errors`) are intentionally NOT caught by this branch — they are real API failures the user must see.

### `syncOfflineData.js`
- The network-error check `error[0].msg.includes("Failed to fetch")` was extended to also include `"Load failed"` and `"timed out"`. This ensures the "go online when able and refresh" dialog appears on Safari instead of the generic error dialog when the sync fires while still offline.

## Why localStorage and not the Cache API

The Cache API would require knowing the exact cache name and URL, and has its own Safari quirks. `localStorage` is synchronous, universally supported, and survives across PWA launches on all platforms.

**Why:** The Workbox SW and `StaleWhileRevalidate` remain in place as a belt-and-braces layer. The localStorage fallback is the reliable primary path for offline starts.

**How to apply:** If the config shape changes server-side in a breaking way, stale `cachedConfig` values in localStorage could cause parse errors. The existing `config.value.client = config.value.client || {}` guard handles absent `client` sub-objects, but if deeper structural changes are made, consider versioning the `cachedConfig` key or adding a shape-validation step.
