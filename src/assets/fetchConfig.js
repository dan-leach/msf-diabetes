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
const underDevelopment = false;

/**
 * Development interim code for tracking client versions during development.
 * @type {string}
 */
const clientDevInterimCode = "D";
console.log("clientDevInterimCode", clientDevInterimCode);

/**
 * Current client application version.
 * @type {number}
 */
const clientVersion = 0.6;

/**
 * Last update date of the client application (YYYY-MM-DD format).
 * @type {string}
 */
const clientLastUpdated = "2026-05-06";

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
  if (import.meta.env.DEV) console.log("***Vite DEV mode: using local config.json***");

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
