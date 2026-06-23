/**
 * @component Generate
 * @description Calculation orchestration view — builds the API payload, submits it,
 * and navigates to the Guidance page on success.
 *
 * The view renders a live step-by-step progress list while the calculation runs.
 * Each step has a `status` of: `pre` | `active` | `complete` | `error` | `hidden`.
 *
 * Three sequential steps are executed by `generate()`:
 *
 *   1. **buildPayload** — synchronous; assembles the API request object from the
 *      reactive data store. Handles type coercion (string → number / boolean) and
 *      only includes optional fields (pH, bicarbonate, ketones, etc.) when present.
 *
 *   2. **calculateAPI** — asynchronous; POSTs the payload to the server API. If the
 *      server returns a non-network error (e.g. validation failure), execution stops
 *      and the error is displayed. If a network/timeout error occurs, falls through
 *      to step 3.
 *
 *   3. **calculateClient** — asynchronous; runs the bundled offline calculator when
 *      the server is unreachable. Starts as `hidden` and only becomes visible if a
 *      network failure is detected in step 2.
 *
 * On success, `data.calculations`, `data.auditID`, and `data.mode` are populated
 * from the response and the router navigates to `/guidance`.
 *
 * Guard: if form step 3 is not valid, redirects to FormClinicalDetails.
 *
 * Form flow: Disclaimer → PatientDetails → (OverrideConfirm?) → EquipmentAvailability
 *            → ClinicalDetails → **Generate** → Guidance
 *
 * @requires config               — application configuration injected from App.vue.
 * @requires data                 — global reactive data store from assets/data.js.
 * @requires router               — Vue Router instance for programmatic navigation.
 * @requires api                  — API helper from assets/api.js.
 * @requires runOfflineCalculation — bundled offline calculator fallback.
 */
<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";
const config = inject("config");
import { api } from "@/assets/api.js";
import { runOfflineCalculation } from "@/assets/offlineCalculator/offlineCalculator.js";

/**
 * @type {import('vue').Ref<Object>}
 * Reactive map of calculation steps, each with a `description`, `status`, `errors`,
 * and `action` function. The template iterates over this object to render the
 * progress list.
 */
const steps = ref({
  /**
   * Step 1: Build the API payload from the current reactive data store.
   *
   * Performs type coercion for fields stored as strings in the form
   * (e.g. radio button values are strings; the API expects booleans/numbers).
   * Optional fields are only included in the payload when they have a value.
   *
   * @returns {Object} The assembled payload object ready for the API.
   */
  buildPayload: {
    description: "Preparing data",
    status: "pre", // pre → active → complete | error
    errors: "",
    action: function () {
      this.status = "active";

      const payload = {};

      payload.legalAgreement = data.value.inputs.legalAgreement.val == true;

      payload.episodeType = data.value.inputs.episodeType.val;
      payload.patientSex = data.value.inputs.patientSex.val;
      payload.weight = parseFloat(data.value.inputs.weight.val);
      payload.operationalCentre = data.value.inputs.operationalCentre.val;
      payload.project = data.value.inputs.project.val;

      payload.weightLimitOverride = data.value.inputs.weight.limit.override;
      payload.use2SD = data.value.inputs.weight.limit.use2SD;

      payload.patientAge = data.value.inputs.patientDOB.patientAge.val;
      payload.useYearsMonths =
        data.value.inputs.patientDOB.yearsMonths.switch.val;

      // Boolean coercion: radio buttons store "true"/"false" strings
      payload.bloodGasAvailable =
        data.value.inputs.bloodGasAvailable.val == "true";
      payload.bloodKetonesAvailable =
        data.value.inputs.bloodKetonesAvailable.val == "true";
      payload.syringePumpAvailable =
        data.value.inputs.syringePumpAvailable.val == "true";
      payload.infusionPumpAvailable =
        data.value.inputs.infusionPumpAvailable.val == "true";

      // Optional: only include dropFactor when an infusion pump is unavailable
      if (data.value.inputs.dropFactor.val)
        payload.dropFactor = parseFloat(data.value.inputs.dropFactor.val);

      // Glucose: either a "high" flag (glucose too high to measure) or a numeric value
      if (data.value.inputs.glucose.high.val) {
        payload.glucoseHigh = data.value.inputs.glucose.high.val;
      } else {
        payload.glucose = parseFloat(data.value.inputs.glucose.val);
        payload.glucoseUnit = data.value.inputs.glucose.unit;
      }

      // Optional ketone fields: only one of blood/urine will be present
      if (data.value.inputs.bloodKetones.val)
        payload.bloodKetones = parseFloat(data.value.inputs.bloodKetones.val);
      if (data.value.inputs.urineKetones.val)
        payload.urineKetones = parseFloat(data.value.inputs.urineKetones.val);

      payload.diagnosticFeatures =
        data.value.inputs.diagnosticFeatures.val == "true";

      // Optional blood gas values: only present when blood gas is available
      if (data.value.inputs.pH.val)
        payload.pH = parseFloat(data.value.inputs.pH.val);
      if (data.value.inputs.bicarbonate.val)
        payload.bicarbonate = parseFloat(data.value.inputs.bicarbonate.val);

      payload.shockPresent = data.value.inputs.shockPresent.val == "true";
      payload.gcs = parseFloat(data.value.inputs.gcs.val);
      payload.respiratorySupport =
        data.value.inputs.respiratorySupport.val == "true";

      // Audit metadata: client version and mode are included for server-side logging
      payload.clientUseragent = navigator.userAgent;
      payload.appVersion = {
        client: config.value.client.version.toString(),
        clientMode: config.value.client.underDevelopment
          ? "development"
          : "production",
      };

      this.status = "complete";

      return payload;
    },
  },

  /**
   * Step 2: Submit the payload to the remote API and await the calculation response.
   *
   * On success, returns the full API response object.
   * On failure, sets status to "error", stores the error details, and re-throws
   * so the caller can determine whether the failure was network-related.
   *
   * @param {Object} payload - The assembled payload from buildPayload.
   * @returns {Promise<Object>} The API response containing calculations and auditID.
   */
  calculateAPI: {
    description: "Waiting for server to perform calculations",
    status: "pre",
    errors: "",
    action: async function (payload) {
      this.status = "active";
      try {
        const response = await api("calculate", payload);
        this.status = "complete";
        return response;
      } catch (error) {
        this.status = "error";
        this.errors = error;
        throw error;
      }
    },
  },

  /**
   * Step 3: Run the bundled offline calculator as a fallback when the API is unreachable.
   *
   * This step starts as `hidden` and is only made visible when a network failure
   * is detected in step 2. Uses the same payload object as the API call.
   *
   * @param {Object} payload - The assembled payload from buildPayload.
   * @returns {Promise<Object>} The offline calculation response.
   */
  calculateClient: {
    description: "Server unavailable, performing calculations locally",
    status: "hidden", // remains hidden unless network failure detected in step 2
    errors: "",
    action: async function (payload) {
      this.status = "active";
      try {
        const response = await runOfflineCalculation(payload);
        console.log("calculateClient response:", response);
        this.status = "complete";
        return response;
      } catch (error) {
        this.status = "error";
        this.errors = JSON.parse(error.message);
        throw error;
      }
    },
  },
});

/**
 * Orchestrates the full calculation sequence.
 *
 * Resets step statuses, builds the payload, attempts the API call, and falls back
 * to the offline calculator if a network failure is detected. On success, stores
 * the results in the data store and navigates to the Guidance view.
 *
 * Network failures are distinguished from other API errors by checking the error
 * messages for timeout/network/fetch keywords or an AbortError name.
 *
 * @returns {Promise<void>}
 */
const generate = async () => {
  steps.value.buildPayload.status = "pre";
  steps.value.calculateAPI.status = "pre";
  steps.value.calculateClient.status = "hidden";

  // Step 1: build payload
  const payload = steps.value.buildPayload.action();

  let response = {};

  // Step 2: attempt API calculation
  let networkFailed = false;
  try {
    response = await steps.value.calculateAPI.action(payload);
  } catch (error) {
    // Distinguish network/timeout errors from API validation errors
    networkFailed =
      error.some?.(
        (e) =>
          e.msg?.includes("timed out") ||
          e.msg?.includes("Network") ||
          e.msg?.includes("fetch"),
      ) || error.name === "AbortError";
    console.log("networkFailed?", networkFailed);
    if (!networkFailed) {
      // Non-network API error — show the error and stop; do not fall back offline
      return;
    }
  }

  // Step 3: fall back to offline calculator on network failure
  if (networkFailed) {
    try {
      response = await steps.value.calculateClient.action(payload);
    } catch (error) {
      return;
    }
  }

  // Store results and navigate to guidance
  data.value.auditID = response.auditID;
  data.value.mode = response.mode;
  data.value.calculations = response.calculations;
  router.push("/guidance");
};

// Guard: redirect if clinical details form is incomplete
if (!data.value.form.isValid(3)) router.push("/form-clinical-details");

onMounted(() => {
  window.scrollTo(0, 0);
  // Start the generation process automatically on mount
  generate();
});
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Performing calculations</h2>

    <!--
      Step progress list. Each step shows:
        - Step description (greyed out until active)
        - Spinner while active
        - Green tick on complete
        - Red cross and error details on error
        - Retry button on error (shown for the failing step when no fallback remains)
    -->
    <div v-for="(step, index) in steps" class="mb-3">
      <span
        class="step-text"
        :class="
          step.status === 'active' ||
          step.status === 'error' ||
          step.status === 'complete'
            ? ''
            : 'text-black-50'
        "
        :hidden="step.status === 'hidden'"
        >{{ step.description }}&nbsp;&nbsp;</span
      >
      <!-- Spinner: shown while the step is in progress -->
      <span
        class="spinner-border spinner-border-sm align-middle"
        v-if="step.status === 'active'"
      ></span>
      <!-- Success icon -->
      <span v-if="step.status === 'complete'"
        ><font-awesome-icon :icon="['fas', 'check']" style="color: green"
      /></span>
      <!-- Error icon -->
      <span v-if="step.status === 'error'"
        ><font-awesome-icon :icon="['fas', 'xmark']" style="color: red"
      /></span>
      <div v-if="step.status === 'error'">
        <span class="text-danger ms-2" v-for="error in step.errors">
          {{ error.msg || error.message }}<br /> </span
        ><br />
        <!--
          Retry button: shown on the offline calculator step, or on the API step
          when the offline fallback is still hidden (meaning no fallback was attempted).
        -->
        <button
          type="button"
          @click="generate()"
          class="btn btn-primary mb-4"
          v-if="
            index === 'calculateClient' ||
            (index === 'calculateAPI' &&
              steps.calculateClient.status === 'hidden')
          "
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Back button: allows the user to return and correct clinical details -->
    <button
      type="button"
      @click="router.push('/form-clinical-details')"
      class="btn btn-secondary"
    >
      Back to form
    </button>
  </div>
</template>

<style scoped>
.container {
  max-width: 750px;
}
.btn-outline-secondary {
  width: 150px;
}
/* Step description text is rendered slightly larger than body copy */
.step-text {
  font-size: larger;
}
</style>
