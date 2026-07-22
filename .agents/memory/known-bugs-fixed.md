---
name: Known bugs fixed
description: Real bugs caught and fixed during the JSDoc documentation pass.
---

## Feedback.vue — missing config inject

`config` was referenced in the catch handler of the feedback submission function but was never injected into the component. This caused a runtime `ReferenceError` whenever the API call failed.

**Fix:** Added `inject` to the Vue import and added `const config = inject("config")` at the top of `<script setup>`.

**How to apply:** Any component that needs the app config must explicitly call `inject("config")` — it is not available globally, only via Vue's provide/inject mechanism (provided in `main.js`).

## Safari/iOS offline — config fetch fails before app loads

On Safari/iOS, `TypeError: Load failed` was not caught as a recoverable network error in `fetchConfig.js`, so the app showed "Sorry, something went wrong..." even when valid cached config was available. See `safari-offline-fix.md` for full detail.

## offlineCalculator.js — catch block masking non-validation errors

The catch block attempted `JSON.parse(error.message)` unconditionally. This worked for `validate.js` errors (which stringify an array) but threw a `SyntaxError` for plain-string errors from other pipeline steps (`checkWeightWithinLimit`, `calculateVariables`, `encrypt`, `localStorage`), masking the original error.

**Fix:** Wrapped the `JSON.parse` attempt in a nested try/catch. The inner catch silently falls through to `console.error("Offline calculation error:", error.message)` for non-JSON errors. The original error is always re-thrown regardless.
