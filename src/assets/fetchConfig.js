import { ref } from "vue";
let config = ref({});

// Set client development mode here.
const underDevelopment = false;
// Set API development mode with NODE_ENV

// Set client version here.
const clientDevInterimCode = "c6";
console.log("clientDevInterimCode", clientDevInterimCode);
const clientVersion = 0.3;
const clientLastUpdated = "2026-01-14";
const offlineCalculatorVersion = 0.3; //The API version which checkWeightWithinLimits.js and calculateVariables.js are aligned with
// Set API development mode with environment variables

const url = underDevelopment
  ? "https://dev-api.msf.dka-calculator.co.uk/"
  : "https://api.msf.dka-calculator.co.uk/";

const timeoutDuration = 15000;

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
