---
name: Online vs offline mode
description: How Generate.vue chooses between API and local calculation, and how offline sync works.
---

`Generate.vue` attempts the API first. If the request fails (network error or timeout), it falls back to the offline pipeline.

**Online mode:** POST payload to API → API validates, calculates, and returns results → displayed to clinician → record stored in server database.

**Offline pipeline** (orchestrated by `src/assets/offlineCalculator/offlineCalculator.js`):
1. `validate.js` — validates payload against config rules; throws JSON-stringified error array on failure
2. `checkWeightWithinLimit.js` — checks weight against WHO/MSF centile limits from config
3. Age truncated to 2 d.p. string (re-identification risk mitigation)
4. `calculateVariables.js` — computes all clinical variables (severity, bolus, deficit, maintenance, insulin)
5. Absent optional fields set to null for consistent storage shape
6. `generateAuditId.js` — generates base-62, 10-char audit ID
7. `encrypt.js` — patient-identifiable fields encrypted with AES-256-GCM; AES key wrapped with RSA public key from config
8. Encrypted record + non-identifiable metadata stored in `localStorage` keyed by audit ID; audit IDs tracked in `offlineStoreIDs` array

**Result shape returned to caller:** `{ calculations, mode: "offline", auditID }`

**Sync:** `syncOfflineData.js` is called after every successful `fetchConfig()`. It iterates `offlineStoreIDs`, POSTs each record to the API (`sync-offline-data` route), and removes successfully uploaded records from localStorage.

**Why the catch block matters:** `validate.js` throws `JSON.stringify(errors)` (an array); other pipeline steps throw plain strings. `offlineCalculator.js` catch block attempts `JSON.parse(error.message)` in a nested try/catch to handle both shapes without masking the original error.
