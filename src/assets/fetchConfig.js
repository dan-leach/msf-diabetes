import { ref } from "vue";
import { syncOfflineData } from "@/assets/offlineCalculator/syncOfflineData";

/**
 * Reactive reference object containing the application configuration fetched from the server.
 * @type {import('vue').Ref<Object>}
 */
let config = ref({});

/**
 * Flag indicating whether the client is running in development mode.
 * When true, uses the development API endpoint and logs debug information.
 * @type {boolean}
 */
const underDevelopment = true;
//Set API development mode with NODE_ENV

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
const clientVersion = 0.4;

/**
 * Last update date of the client application (YYYY-MM-DD format).
 * @type {string}
 */
const clientLastUpdated = "2026-02-10";

/**
 * Version of the offline calculator algorithm.
 * Should match the API version that checkWeightWithinLimits.js and calculateVariables.js are aligned with.
 * @type {number}
 */
const offlineCalculatorVersion = 0.4;

/**
 * API base URL. Uses development endpoint when underDevelopment is true, otherwise production.
 * @type {string}
 */
const url = underDevelopment
  ? "https://dev-api.msf.dka-calculator.co.uk/"
  : "https://api.msf.dka-calculator.co.uk/";

/**
 * Request timeout duration in milliseconds.
 * @type {number}
 */
const timeoutDuration = 15000;

/**
 * Fetches application configuration from the API server.
 * Retrieves config data, enriches it with client-side version and mode information,
 * and triggers syncing of any offline data stored locally.
 *
 * @async
 * @returns {Promise<Object>} - The configuration object from the API response.
 * @throws {Array<{msg: string}>} - Throws an array of error objects with descriptive messages on failure.
 *
 * @remarks
 * - Sets `config.value` as a reactive reference with merged client and API configuration.
 * - Automatically calls `syncOfflineData()` after successful fetch to upload any pending calculations.
 * - Handles network timeouts by aborting the request after `timeoutDuration` ms.
 * - Logs development information when `underDevelopment` flag is true.
 */
async function fetchConfig() {
  if (underDevelopment) console.log("***Client underDevelopment***");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  try {
    const response = await fetch(`${url}config`, {
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

    config.value.api.url = url;
    config.value.client.underDevelopment = underDevelopment;
    config.value.client.version = clientVersion;
    config.value.client.lastUpdated = clientLastUpdated;
    config.value.client.offlineCalculatorVersion = offlineCalculatorVersion;

    syncOfflineData();

    return jsonResponse;
  } catch (error) {
    // Handle errors (including timeout and network issues)
    if (error.name === "AbortError") {
      const errorStr = "API error: The request timed out.";
      console.error(errorStr);
      throw [{ msg: errorStr }];
    } else if (error.errors) {
      //is a jsonResponse with errors array
      console.error("API errors: ", error.errors);
      throw error.errors;
    } else {
      //another unexpected error
      console.log("API error: ", error);
      throw [{ msg: "API error: " + error.toString() }];
    }
  }
}

export { config, fetchConfig };
