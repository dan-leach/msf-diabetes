---
name: API error shape
description: The normalised error format thrown by api.js and fetchConfig.js.
---

All errors thrown by `api.js` and `fetchConfig.js` are arrays of objects:

```js
[{ msg: "Human-readable error string" }]
```

**Why:** Normalising to this shape means every caller can handle errors uniformly without branching on error type.

**How to apply:** Any component or module catching errors from `api()` or `fetchConfig()` should expect `error[0].msg` for display. Do not assume a plain string or an `Error` instance.

**Exception — offline pipeline:** `validate.js` throws `new Error(JSON.stringify(validationErrors))` where `validationErrors` is an array of `{ msg }` objects. `offlineCalculator.js` unwraps this via `JSON.parse(error.message)` in a nested try/catch. Other offline pipeline steps throw plain `Error` instances with string messages.
