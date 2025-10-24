import { ref } from "vue";
let config = ref({});

// Set client development mode here.
const underDevelopment = true;
// Set API development mode with NODE_ENV

// Set client version here.
const clientVersion = 0.2;
const clientLastUpdated = "2025-10-24";
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
    config.value.api.url = url;
    config.value.client.underDevelopment = underDevelopment;
    config.value.client.version = clientVersion;
    config.value.client.lastUpdated = clientLastUpdated;
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
