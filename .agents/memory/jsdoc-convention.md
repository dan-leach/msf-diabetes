---
name: JSDoc convention
description: Documentation style used throughout the codebase, including the Unicode restriction.
---

All JS modules and exported functions carry full JSDoc. The style established in this project is:

**Module header (every .js file):**
```js
/**
 * @module moduleName
 * @description One or two sentences. Lists @exports, @requires.
 */
```

**Functions:**
- `@param {type} name — description` for every parameter, including destructured sub-fields
- `@returns {type} — description`
- `@throws` where applicable
- `@async` on async functions

**Section dividers inside functions:**
```js
// ---------------------------------------------------------------------------
// Section name — brief clinical or logical context
// ---------------------------------------------------------------------------
```

**Vue components:** `@component` tag in the `<script setup>` block; `@prop`, `@emits`, `@inject` documented.

## Unicode restriction in JS comments

**Rule:** Do not use Unicode mathematical or special symbols in JS source file comments or JSDoc. Use ASCII equivalents.

| Forbidden | Use instead |
|---|---|
| `≤` | `<=` |
| `≥` | `>=` |
| `±` | `+/-` |
| `₂` | `2` (e.g. `O2`) |
| `÷` in comments | `/` |

**Why:** Vite's `vite:import-analysis` plugin (esbuild under the hood) rejects files containing these characters in source, throwing "Failed to parse source for import analysis because the content contains invalid JS syntax." This is not a JS spec issue — esbuild is stricter than the spec.

**Safe to use:** Em dash `—` and right arrow `→` in comments are fine. `÷` inside string/template-literal content (not comments) is also fine and exists in the original `calculateVariables.js` working strings.
