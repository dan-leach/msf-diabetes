<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { api } from "@/assets/api.js";
import { inject } from "vue";
const config = inject("config");

/**
 * Steps of the generation process.
 * @type {Object<string, Step>}
 */
const generateSteps = ref({
  /**
   * @typedef {Object} Step
   * @property {string} text - Description of the step.
   * @property {boolean} complete - Indicates if the step is complete.
   * @property {string} fail - Error message if the step fails.
   * @property {boolean} current - Indicates if the step is currently being executed.
   */
  transmit: {
    //Generate the payload
    text: "Transmitting data to calculator",
    complete: false,
    fail: "",
    current: false,
  },
  calculate: {
    //await the response from the server
    text: "Calculating protocol variables",
    complete: false,
    fail: "",
    current: false,
  },
  audit: {
    //is completed at the same time as the calculate step
    text: "Logging audit data",
    complete: false,
    fail: "",
    current: false,
  },
});

const generate = {
  /**
   * Performs the generation process by executing each step in sequence.
   * Handles errors and updates the status of each step.
   */
  start: async function () {
    for (let step in generateSteps.value) {
      generateSteps.value[step].fail = "";
      generateSteps.value[step].complete = false;
      generateSteps.value[step].current = false;
    }

    // Generate payload to send to server
    let payload = {};
    if (
      !(await generate.executeStep("transmit", generate.buildPayload, payload))
    )
      return;

    // Send the payload to server and receive calculations and auditID
    try {
      generateSteps.value.calculate.current = true;
      const res = await api("calculate", payload);
      data.value.auditID = res.auditID;
      data.value.calculations = res.calculations;
    } catch (error) {
      generateSteps.value.calculate.fail = error;
      generateSteps.value.calculate.current = false;
      return;
    }
    if (!(await generate.executeStep("calculate"))) return;
    generateSteps.value.audit.complete = true;

    router.push("/output");
  },

  /**
   * Executes a step in the generation process.
   * @param {string} step - The step name.
   * @param {Function} [action] - The action to execute.
   * @param {...any} [params] - Parameters for the action.
   * @returns {boolean} - Returns true if the step is successful, false otherwise.
   */
  executeStep: async function (step, action, ...params) {
    generateSteps.value[step].current = true;
    try {
      if (action) {
        await action(...params);
      }
      generateSteps.value[step].complete = true;
    } catch (error) {
      generateSteps.value[step].fail = [{ msg: error.toString() }];
      console.error(error);
      return false;
    } finally {
      generateSteps.value[step].current = false;
    }
    return true;
  },

  /**
   * Builds the payload to send to the server.
   * @returns {Object} Payload containing input values.
   */
  buildPayload: async function (payload) {
    for (let input in data.value.inputs) {
      payload[input] = data.value.inputs[input].val;
    }

    payload.legalAgreement = payload.legalAgreement == "true";
    payload.protocolStartDatetime = new Date(payload.protocolStartDatetime);
    if (payload.pH) {
      payload.pH = parseFloat(payload.pH);
    } else {
      delete payload.pH;
    }
    if (payload.bicarbonate) {
      payload.bicarbonate = parseFloat(payload.bicarbonate);
    } else {
      delete payload.bicarbonate;
    }
    payload.glucose = parseFloat(payload.glucose);
    payload.glucoseUnit = data.value.inputs.glucose.unit;
    if (payload.bloodKetones) {
      payload.bloodKetones = parseFloat(payload.bloodKetones);
      delete payload.urineKetones;
    } else {
      payload.urineKetones = parseInt(payload.urineKetones);
      delete payload.bloodKetones;
    }
    payload.weight = parseFloat(payload.weight);
    payload.shockPresent = payload.shockPresent == "true";
    payload.gcs = parseInt(payload.gcs);
    payload.insulinRate = parseFloat(payload.insulinRate);
    payload.preExistingDiabetes = payload.preExistingDiabetes == "true";
    if (payload.preExistingDiabetes) {
      payload.underFollowUp = payload.underFollowUp == "true";
    } else {
      delete payload.underFollowUp;
    }

    const excludedFields = [
      "patientName",
      "patientIdentifier",
      "patientDOB",
      "other",
    ];
    for (const field of excludedFields) {
      delete payload[field];
    }

    payload.patientAge = data.value.inputs.patientDOB.patientAge.val;
    payload.weightLimitOverride = data.value.inputs.weight.limit.override;
    payload.use2SD = data.value.inputs.weight.limit.use2SD;
    payload.appVersion = {
      client: config.value.client.version,
      api: config.value.api.version,
    };
    payload.clientDatetime = new Date();
    payload.clientUseragent = navigator.userAgent;

    return payload;
  },
};

// Reactive variable to control button text
let showWorkingBtnText = ref("Show working");

if (!data.value.form.isValid(3)) router.push("/form-clinical-details");

onMounted(() => {
  window.scrollTo(0, 0);

  // Start the generation process
  generate.start();
});
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3">Performing calculations</h2>
    <div v-for="(step, index) in generateSteps" class="mb-3">
      <span
        class="step-text"
        :class="
          step.complete || step.fail || step.current ? '' : 'text-black-50'
        "
        >{{ step.text }}&nbsp;&nbsp;</span
      >
      <span
        class="spinner-border spinner-border-sm align-middle"
        v-if="step.current"
      ></span>
      <span v-if="step.complete"
        ><font-awesome-icon :icon="['fas', 'check']" style="color: green"
      /></span>
      <span v-if="step.fail"
        ><font-awesome-icon :icon="['fas', 'xmark']" style="color: red"
      /></span>
      <div v-if="step.fail">
        <span class="text-danger ms-2" v-for="error in step.fail">
          {{ error.msg }}<br /> </span
        ><br />
        <!--retry-->
        <button
          type="button"
          @click="generate.start"
          class="btn btn-primary mb-4"
        >
          Retry
        </button>
      </div>
    </div>
    <!--back-->
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
.step-text {
  font-size: larger;
}
</style>
