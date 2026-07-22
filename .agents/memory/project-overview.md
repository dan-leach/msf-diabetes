---
name: Project overview
description: Stack, purpose, repo links, production URL, and team wiki location.
---

Vue 3 / Vite PWA for calculating paediatric DKA management variables (2024 MSF guidelines).

**Production URL:** https://diabetes.msf.net
**Client repo:** https://github.com/dan-leach/msf-diabetes
**API repo:** https://github.com/dan-leach/msf-diabetes-api
**Team wiki (governance, clinical logic, architecture):** https://github.com/dan-leach/msf-diabetes/wiki

**Stack:** Vue 3 `<script setup>`, Vite 5, Vue Router 4, Bootstrap 5, FontAwesome 6, vite-plugin-pwa + Workbox, SweetAlert2, pdfmake, vue-loading-overlay.

**Dev server:** `npm run dev` on port 5000.

**Key versions (as of this session):** client 0.6, API 0.6, offline calculator 0.6. Three version numbers tracked independently — offline calculator version matters for clinical audit if client and API differ.

**Why:** All routing is in `src/router/index.js`. Only `Start.vue` is eagerly loaded; all other views are lazy-loaded. `README.md` has the full route map and project structure tree.
