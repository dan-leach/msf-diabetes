/**
 * @component Calculations
 * @description Displays the full calculation working for a completed episode.
 *
 * This is an audit/transparency page linked from the Guidance view. It shows:
 *   - The raw input values submitted for the episode.
 *   - Step-by-step HTML working for each calculated output (severity, deficit,
 *     bolus, bag speeds, insulin rate/dose), rendered via `v-html` from the
 *     server or offline calculator response.
 *
 * Sections are conditionally rendered based on the episode context:
 *   - Drop rate sections only appear when no infusion pump is available.
 *   - Bag speed sections branch on `severity.val`: "standard" shows three speeds
 *     (standard, half-standard, hypo); "severe" shows two (high, half-high).
 *   - Insulin section shows IV rate (syringe pump) or IM dose (no syringe pump).
 *
 * Guard: if no `auditID` is present (i.e. no calculation has been performed),
 * the user is redirected to FormClinicalDetails.
 *
 * @requires config — application configuration injected from App.vue.
 * @requires data   — global reactive data store from assets/data.js.
 * @requires router — Vue Router instance for programmatic navigation.
 */
<script setup>
import { onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");

// Guard: calculations are only available after a successful Generate run
if (!data.value.auditID) router.push("/form-clinical-details");

/** Scroll to top on mount so the page title is visible immediately. */
onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 mb-4 text-center">Calculations</h2>
    <div v-if="data.auditID">
      <!-- Return to guidance link at the top for quick navigation -->
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/guidance')"
          class="btn btn-secondary mb-2"
        >
          Go back to guidance
        </button>
      </div>

      <!--
        Provided values — lists the raw inputs submitted for this episode.
        Conditional list items are only shown when the relevant field was populated
        (e.g. pH/bicarbonate only when blood gas was available).
      -->
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
            <li>Syringe pump available: <i>{{ data.inputs.syringePumpAvailable.val }}</i></li>
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

      <!-- DKA severity working -->
      <div class="mb-4">
        <h3>DKA severity</h3>
        <div v-html="data.calculations.severity.working"></div>
      </div>
      <hr></hr>

      <!-- Deficit percentage working -->
      <div class="mb-4">
        <h3>Deficit percentage</h3>
        <div v-html="data.calculations.deficit.percentage.working"></div>
      </div>
      <hr></hr>

      <!-- Bolus working sections -->
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

      <!-- Bolus drop rate — only shown when no infusion pump is available -->
      <div class="mb-4" v-if="data.inputs.infusionPumpAvailable.val == 'false'">
        <h3>Bolus drop rate</h3>
        <div v-html="data.calculations.bolus.drops.working"></div>
        <hr></hr>
      </div>

      <!--
        Bag speed sections — branch on DKA severity:
          "standard" severity: three speeds (standard, half-standard, hypo)
          "severe"   severity: two speeds (high, half-high)
        Each speed also has a drop-rate variant shown when no infusion pump is available.
      -->
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
      <!-- Fallback: severity value is neither 'standard' nor 'severe' -->
      <div v-else>
        <div class="mb-4">
          <h3 class="text-danger">Error: unable to select DKA severity</h3>
        </div>
        <hr></hr>
      </div>

      <!--
        Insulin section: IV rate when syringe pump is available; IM dose otherwise.
      -->
      <div class="mb-4" v-if="data.inputs.syringePumpAvailable.val == 'true'">
        <h3>IV insulin rate</h3>
        <div v-html="data.calculations.insulinRate.working"></div>
      </div>
      <div class="mb-4" v-else>
        <h3>IM insulin dose</h3>
        <div v-html="data.calculations.insulinDose.working"></div>
      </div>
    </div>

    <!-- Return to guidance link at the bottom -->
    <div class="text-center">
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
/* These button classes are retained from an earlier design iteration */
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
