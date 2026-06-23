/**
 * @module fetchConfig
 * @description Fetches and exposes the application configuration from the server (or a
 * local static file in development). The resolved config is stored in a reactive Vue ref
 * so that all consuming components stay in sync via Vue's reactivity system.
 *
 * Config is enriched client-side with version metadata before being made available, and
 * any offline data stored in localStorage is synced to the server immediately after a
 * successful fetch.
 *
 * @exports config        - Reactive ref holding the resolved configuration object.
 * @exports fetchConfig   - Async function that initiates the config fetch.
 */
import { ref } from "vue";
import { syncOfflineData } from "@/assets/offlineCalculator/syncOfflineData";

/**
 * Reactive reference object containing the application configuration fetched from the server.
 * @type {import('vue').Ref<Object>}
 */
let config = ref({});

/**
 * Flag indicating whether the client is running in development mode.
 * @type {boolean}
 */
const underDevelopment = true;

/**
 * Current client application version.
 * @type {number}
 */
const clientVersion = 0.6;

/**
 * Last update date of the client application (YYYY-MM-DD format).
 * @type {string}
 */
const clientLastUpdated = "2026-06-23";

/**
 * Version of the offline calculator algorithm.
 * @type {number}
 */
const offlineCalculatorVersion = 0.6;

/**
 * Request timeout duration in milliseconds.
 * @type {number}
 */
const timeoutDuration = 15000;

/**
 * Config URL: local static file in dev (avoids CORS/bot-protection on the real API),
 * real API endpoint in production where browser requests are not blocked.
 * @type {string}
 */
const configUrl = import.meta.env.DEV
  ? "/config.json"
  : underDevelopment
    ? "https://dev-api.msf.dka-calculator.co.uk/config"
    : "https://api.msf.dka-calculator.co.uk/config";

/**
 * Fetches application configuration.
 * In development uses a local config.json; in production fetches from the real API.
 * Enriches the response with client-side version and mode information,
 * and triggers syncing of any offline data stored locally.
 *
 * @async
 * @returns {Promise<Object>} - The configuration object.
 * @throws {Array<{msg: string}>} - Throws an array of error objects on failure.
 */
async function fetchConfig() {
  if (underDevelopment) console.log("***Client underDevelopment***");
  if (import.meta.env.DEV)
    console.warn(
      "⚠️ DEV MODE: config loaded from local public/config.json — not the live API. Do not use for real clinical cases.",
    );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  try {
    const response = await fetch(configUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorResponse = await response.json();
      throw errorResponse;
    }

    const jsonResponse = await response.json();
    config.value = jsonResponse;

    console.log("Config fetched:", config.value.fetchDatetime);

    config.value.client.underDevelopment = underDevelopment;
    config.value.client.version = clientVersion;
    config.value.client.lastUpdated = clientLastUpdated;
    config.value.client.offlineCalculatorVersion = offlineCalculatorVersion;

    syncOfflineData();

    return jsonResponse;
  } catch (error) {
    if (error.name === "AbortError") {
      const errorStr = "API error: The request timed out.";
      console.error(errorStr);
      throw [{ msg: errorStr }];
    } else if (error.errors) {
      console.error("API errors: ", error.errors);
      throw error.errors;
    } else {
      console.log("API error: ", error);
      throw [{ msg: "API error: " + error.toString() }];
    }
  }
}

export { config, fetchConfig };
