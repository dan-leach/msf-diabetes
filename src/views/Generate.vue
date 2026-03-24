<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";
const config = inject("config");
import { api } from "@/assets/api.js";
import { runOfflineCalculation } from "@/assets/offlineCalculator/offlineCalculator.js";

const steps = ref({
  //build the payload
  buildPayload: {
    description: "Preparing data",
    status: "pre", //pre -> active -> complete -> fail (or hidden)
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

      payload.bloodGasAvailable =
        data.value.inputs.bloodGasAvailable.val == "true";
      payload.bloodKetonesAvailable =
        data.value.inputs.bloodKetonesAvailable.val == "true";
      payload.syringePumpAvailable =
        data.value.inputs.syringePumpAvailable.val == "true";
      payload.infusionPumpAvailable =
        data.value.inputs.infusionPumpAvailable.val == "true";
      if (data.value.inputs.dropFactor.val)
        payload.dropFactor = parseFloat(data.value.inputs.dropFactor.val);

      if (data.value.inputs.glucose.high.val) {
        payload.glucoseHigh = data.value.inputs.glucose.high.val;
      } else {
        payload.glucose = parseFloat(data.value.inputs.glucose.val);
        payload.glucoseUnit = data.value.inputs.glucose.unit;
      }
      if (data.value.inputs.bloodKetones.val)
        payload.bloodKetones = parseFloat(data.value.inputs.bloodKetones.val);
      if (data.value.inputs.urineKetones.val)
        payload.urineKetones = parseFloat(data.value.inputs.urineKetones.val);
      payload.diagnosticFeatures =
        data.value.inputs.diagnosticFeatures.val == "true";
      if (data.value.inputs.pH.val)
        payload.pH = parseFloat(data.value.inputs.pH.val);
      if (data.value.inputs.bicarbonate.val)
        payload.bicarbonate = parseFloat(data.value.inputs.bicarbonate.val);
      payload.shockPresent = data.value.inputs.shockPresent.val == "true";
      payload.gcs = parseFloat(data.value.inputs.gcs.val);
      payload.respiratorySupport =
        data.value.inputs.respiratorySupport.val == "true";

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
  //send to server and await calculations
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
  //perform calculations locally
  calculateClient: {
    description: "Server unavailable, performing calculations locally",
    status: "hidden",
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

const generate = async () => {
  steps.value.buildPayload.status = "pre";
  steps.value.calculateAPI.status = "pre";
  steps.value.calculateClient.status = "hidden";
  // step 1 - build payload
  const payload = steps.value.buildPayload.action();

  let response = {};

  // step 2 - attempt to calculate via API
  let networkFailed = false;
  try {
    response = await steps.value.calculateAPI.action(payload);
  } catch (error) {
    networkFailed =
      error.some?.(
        (e) =>
          e.msg?.includes("timed out") ||
          e.msg?.includes("Network") ||
          e.msg?.includes("fetch"),
      ) || error.name === "AbortError";
    console.log("networkFailed?", networkFailed);
    if (!networkFailed) {
      // other API error
      return;
    }
  }

  // step 3 - if network failed, perform local calculation
  if (networkFailed) {
    try {
      response = await steps.value.calculateClient.action(payload);
    } catch (error) {
      return;
    }
  }

  data.value.auditID = response.auditID;
  data.value.mode = response.mode;
  data.value.calculations = response.calculations;
  router.push("/guidance");
};

if (!data.value.form.isValid(3)) router.push("/form-clinical-details");

onMounted(() => {
  window.scrollTo(0, 0);

  // Start the generation process
  generate();
});
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Performing calculations</h2>
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
      <span
        class="spinner-border spinner-border-sm align-middle"
        v-if="step.status === 'active'"
      ></span>
      <span v-if="step.status === 'complete'"
        ><font-awesome-icon :icon="['fas', 'check']" style="color: green"
      /></span>
      <span v-if="step.status === 'error'"
        ><font-awesome-icon :icon="['fas', 'xmark']" style="color: red"
      /></span>
      <div v-if="step.status === 'error'">
        <span class="text-danger ms-2" v-for="error in step.errors">
          {{ error.msg || error.message }}<br /> </span
        ><br />
        <!--retry-->
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
