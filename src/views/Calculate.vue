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

/**
 * Lifecycle hook that runs when the component is mounted.
 * Checks the validity of previous form steps and redirects if necessary.
 * Scrolls to the top of the page.
 * Starts the protocol generation process
 */
onMounted(() => {
  // Validate previous form steps and redirect if necessary
  if (!data.value.form.isValid(0)) {
    router.push("/form-disclaimer");
  } else if (!data.value.form.isValid(1)) {
    router.push("/form-patient-details");
  } else if (
    data.value.inputs.weight.limit.override &&
    !data.value.inputs.weight.limit.overrideConfirm
  ) {
    router.push("/form-override-confirm");
  } else if (!data.value.form.isValid(2)) {
    router.push("/form-equipment-availability");
  } else if (!data.value.form.isValid(3)) {
    console.log(data.value.form.isValid(3));
    router.push("/form-clinical-details");
  } else {
    // Scroll to top
    window.scrollTo(0, 0);
    // Start the generation process
    generate.start();

    // Handle show/hide working button text
    let showWorkingCollapse = document.getElementById("showWorking");
    showWorkingCollapse.addEventListener(
      "hidden.bs.collapse",
      () => (showWorkingBtnText.value = "Show working")
    );
    showWorkingCollapse.addEventListener(
      "shown.bs.collapse",
      () => (showWorkingBtnText.value = "Hide working")
    );
  }
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
      <span v-if="index == 'calculate'">
        <!--show working-->
        <button
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#showWorking"
          class="btn btn-sm btn-primary mx-2"
          :disabled="!step.complete"
        >
          {{ showWorkingBtnText }}
        </button>

        <div class="collapse my-2" id="showWorking">
          <div v-if="step.complete">
            <!--severity-->
            <div class="card mb-4">
              <div class="card-header">Severity</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.severity.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.severity.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.severity.valText }}
                  </div>
                </div>
              </div>
            </div>
            <!--bolus volume-->
            <div class="card mb-4">
              <div class="card-header">Bolus volume</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.bolus.volume.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Limit</span>
                    <span v-html="data.calculations.bolus.volume.limit"></span>
                    <small>Based on weight of {{ config.caps.weight }}kg</small>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.bolus.volume.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.bolus.volume.val.toFixed(0) }}mL
                  </div>
                </div>
              </div>
            </div>
            <!--bolus volume-->
            <div class="card mb-4">
              <div class="card-header">Bolus duration</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.bolus.duration.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.bolus.duration.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.bolus.duration.val.toFixed(0) }} hours
                  </div>
                </div>
              </div>
            </div>
            <!--bolus rate-->
            <div class="card mb-4">
              <div class="card-header">Bolus rate</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.bolus.rate.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.bolus.rate.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour
                  </div>
                </div>
              </div>
            </div>
            <!--deficit percentage-->
            <div class="card mb-4">
              <div class="card-header">Deficit percentage</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.deficit.percentage.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.deficit.percentage.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.deficit.percentage.val }}%
                  </div>
                </div>
              </div>
            </div>
            <!--deficit volume-->
            <div class="card mb-4">
              <div class="card-header">Deficit volume</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.deficit.volume.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Limit</span>
                    <span
                      v-html="data.calculations.deficit.volume.limit"
                    ></span>
                    <small>Based on weight of {{ config.caps.weight }}kg</small>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.deficit.volume.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.deficit.volume.val.toFixed(0) }}mL
                  </div>
                </div>
              </div>
            </div>
            <!--deficit rate-->
            <div class="card mb-4">
              <div class="card-header">Deficit replacement rate</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.deficit.rate.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.deficit.rate.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.deficit.rate.val.toFixed(1) }}mL/hour
                  </div>
                </div>
              </div>
            </div>
            <!--maintenance volume-->
            <div class="card mb-4">
              <div class="card-header">Daily maintenance volume</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.maintenance.volume.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Limit</span>
                    <span
                      v-html="data.calculations.maintenance.volume.limit"
                    ></span>
                    <small>Based on weight of {{ config.caps.weight }}kg</small>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.maintenance.volume.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.maintenance.volume.val.toFixed(0) }}mL
                  </div>
                </div>
              </div>
            </div>
            <!--maintenance rate-->
            <div class="card mb-4">
              <div class="card-header">Daily maintenance rate</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.maintenance.rate.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.maintenance.rate.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{
                      data.calculations.maintenance.rate.val.toFixed(1)
                    }}mL/hour
                  </div>
                </div>
              </div>
            </div>
            <!--full speed bag-->
            <div class="card mb-4">
              <div class="card-header">Full speed bag</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.bagSpeeds.fullSpeed.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.bagSpeeds.fullSpeed.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{
                      data.calculations.bagSpeeds.fullSpeed.val.toFixed(1)
                    }}mL/hour
                  </div>
                </div>
              </div>
            </div>
            <!--half speed bag-->
            <div class="card mb-4">
              <div class="card-header">Half speed bag</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span
                      v-html="data.calculations.bagSpeeds.halfSpeed.formula"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span
                      v-html="data.calculations.bagSpeeds.halfSpeed.working"
                    ></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{
                      data.calculations.bagSpeeds.halfSpeed.val.toFixed(1)
                    }}mL/hour
                  </div>
                </div>
              </div>
            </div>
            <!--IV insulin rate-->
            <div class="card mb-4">
              <div class="card-header">IV insulin rate</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.insulinRate.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Limit</span>
                    <span v-html="data.calculations.insulinRate.limit"></span>
                    <small>Based on weight of {{ config.caps.weight }}kg</small>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.insulinRate.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.insulinRate.val.toFixed(2) }}
                    Units/hour
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card border-warning p-2">
                    Note: Insulin should NOT be started immediately. Wait 1 hour
                    after starting IV fluid therapy.
                  </div>
                </div>
              </div>
            </div>
            <!--IM insulin dose-->
            <div class="card mb-4">
              <div class="card-header">IM insulin rate</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.insulinDose.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Limit</span>
                    <span v-html="data.calculations.insulinDose.limit"></span>
                    <small>Based on weight of {{ config.caps.weight }}kg</small>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.insulinDose.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.insulinDose.val.toFixed(2) }}
                    Units
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card border-warning p-2">
                    Note: Insulin should NOT be started immediately. Wait 1 hour
                    after starting IV fluid therapy.
                  </div>
                </div>
              </div>
            </div>
            <div class="card border-warning mb-3">
              <div class="card-body">
                <p class="card-text">
                  Note: Refer to the MSF paediatric diabetes guidelines for how
                  to use these calculated values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </span>
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
