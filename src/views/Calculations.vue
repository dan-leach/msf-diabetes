<script setup>
import { onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";
const config = inject("config");

if (!data.value.auditID) router.push("/form-clinical-details");

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 mb-4 text-center">Calculations</h2>
    <div v-if="data.auditID">
      <div class="text-center">
        <!--back-->
        <button
          type="button"
          @click="router.push('/guidance')"
          class="btn btn-secondary mb-2"
        >
          Go back to guidance
        </button>
      </div>
      <div class="mb-4">
        <h3>Provided values</h3>
        <div>
          Calculations and guidance provided by the {{ config.appName }} relies upon accurate data from the user. The following relevant data were provided for this episode:
          <ul>
            <li>PatientAge: <i>{{ data.inputs.patientDOB.patientAge.val }} years</i></li>
            <li>Patient sex: <i>{{ data.inputs.patientSex.val }}</i></li>
            <li>Weight: <i>{{ data.inputs.weight.val }}kg</i></li>
            <li>Blood gas available: <i>{{ data.inputs.bloodGasAvailable.val }}</i></li>
            <li>Blood ketones available: <i>{{ data.inputs.bloodKetonesAvailable.val }}</i></li>
            <li>Syringe driver available: <i>{{ data.inputs.syringeDriverAvailable.val }}</i></li>
            <li>Infusion pump available: <i>{{ data.inputs.infusionPumpAvailable.val }}</i></li>
            <li v-if="data.inputs.dropFactor.val">Drop factor: <i>{{ data.inputs.dropFactor.val }}drops/mL</i></li>
            <li>Glucose: <i>{{ data.inputs.glucose.val }}{{ data.inputs.glucose.unit }}</i></li>
            <li v-if="data.inputs.urineKetones.val">Urine ketones: <i>{{ data.inputs.urineKetones.val }}+</i></li>
            <li v-if="data.inputs.bloodKetones.val">Blood ketones: <i>{{ data.inputs.bloodKetones.val }}mmol/L</i></li>
            <li>Diagnostic features of DKA: <i>{{ data.inputs.diagnosticFeatures.val }}</i></li>
            <li v-if="data.inputs.pH.val">pH: <i>{{ data.inputs.pH.val }}</i></li>
            <li v-if="data.inputs.bicarbonate.val">Bicarbonate: <i>{{ data.inputs.bicarbonate.val }}mmol/L</i></li>
            <li>Shock present: <i>{{ data.inputs.shockPresent.val }}</i></li>
            <li v-if="data.inputs.gcs.val">GCS: <i>{{ data.inputs.gcs.val }}</i></li>
            <li v-if="data.inputs.respiratorySupport.val">Respiratory support: <i>{{ data.inputs.respiratorySupport.val }}</i></li>
          </ul>
        </div>
      </div>
      <div class="mb-4">
        <h3>DKA severity</h3>
        <div v-html="data.calculations.severity.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Deficit percentage</h3>
        <div v-html="data.calculations.deficit.percentage.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Bolus volume</h3>
        <div v-html="data.calculations.bolus.volume.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Bolus duration</h3>
        <div v-html="data.calculations.bolus.duration.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Bolus rate</h3>
        <div v-html="data.calculations.bolus.rate.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
        <h3>Bolus drop rate</h3>
        <div v-html="data.calculations.bolus.drops.working"></div>
        <hr></hr>
      </div>
      <div v-if="data.calculations.severity.val === 'standard'">
        <div class="mb-4">
          <h3>Bag speed: standard-speed</h3>
          <div v-html="data.calculations.bagSpeeds.standardSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
          <h3>Standard-speed drop rate</h3>
          <div v-html="data.calculations.bagSpeeds.standardSpeedDrops.working"></div>
          <hr></hr>
        </div>
        <div class="mb-4">
          <h3>Bag speed: half-standard-speed</h3>
          <div v-html="data.calculations.bagSpeeds.halfStandardSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
          <h3>Half-standard-speed drop rate</h3>
          <div v-html="data.calculations.bagSpeeds.halfStandardSpeedDrops.working"></div>
          <hr></hr>
        </div>
        <div class="mb-4">
          <h3>Bag speed: high-speed (for hypoglycaemia)</h3>
          <div v-html="data.calculations.bagSpeeds.hypoSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
          <h3>High-speed drop rate (for hypoglycaemia)</h3>
          <div v-html="data.calculations.bagSpeeds.hypoSpeedDrops.working"></div>
          <hr></hr>
        </div>
      </div>
      <div v-else-if="data.calculations.severity.val === 'severe'">
        <div class="mb-4">
          <h3>Bag speed: high-speed</h3>
          <div v-html="data.calculations.bagSpeeds.highSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
          <h3>High-speed drop rate</h3>
          <div v-html="data.calculations.bagSpeeds.highSpeedDrops.working"></div>
          <hr></hr>
        </div>
        <div class="mb-4">
          <h3>Bag speed: half-high-speed</h3>
          <div v-html="data.calculations.bagSpeeds.highSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
          <h3>Half-high-speed drop rate</h3>
          <div v-html="data.calculations.bagSpeeds.halfHighSpeedDrops.working"></div>
          <hr></hr>
        </div>
      </div>
      <div v-else>
        <div class="mb-4">
          <h3 class="text-danger">Error: unable to select DKA severity</h3>
        </div>
        <hr></hr>
      </div>
      <div class="mb-4" v-if="data.inputs.syringeDriverAvailable.val == 'true'">
        <h3>IV insulin rate</h3>
        <div v-html="data.calculations.insulinRate.working"></div>
      </div>
      <div class="mb-4" v-else>
        <h3>IM insulin dose</h3>
        <div v-html="data.calculations.insulinDose.working"></div>
      </div>
    </div>
    <div class="text-center">
      <!--back-->
      <button
        type="button"
        @click="router.push('/guidance')"
        class="btn btn-secondary"
      >
        Go back to guidance
      </button>
    </div>
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
.btn-view-working,
.btn-view-guidance {
  min-width: 100%;
}
.btn-view-working:active,
.btn-view-guidance:active {
  border-color: transparent;
}
.bg-light {
  background-color: lightgray !important;
}
.row {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
