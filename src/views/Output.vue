<script setup>
import { onMounted, ref } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";
const config = inject("config");

if (!data.value.auditID) router.push("/form-clinical-details");

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

let showWorking = ref({
  dkaSeverity: false,
  fluidBolus: false,
  fluidReplacement: false,
  ivInsulinRate: false,
  imInsulinRate: false
}); 

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 mb-4">Calculations</h2>
    <div v-if="data.auditID">
      <!--severity-->
      <div class="card mb-4">
        <div class="card-header">Audit ID</div>
        <div class="card-body">
          <h3>{{ data.auditID }}</h3>
          <div class="mb-2">
              Please record this audit ID in the patient notes.
          </div>
        </div>
      </div>
      <!--severity-->
      <div class="card mb-4">
        <div class="card-header">DKA severity</div>
        <div class="card-body">
          <h3>{{ capitalizeFirst(data.calculations.severity.val) }} ({{ data.calculations.deficit.percentage.val }}% deficit)</h3>
          <div class="mb-2">
              Treat your patient as having {{ data.calculations.severity.val }} severity DKA with a deficit of {{ data.calculations.deficit.percentage.val }}%.
          </div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#dkaSeverityWorking" role="button" aria-expanded="false" aria-controls="collapseDkaSeverityWorking" @click="showWorking.dkaSeverity = !showWorking.dkaSeverity">
              {{ showWorking.dkaSeverity ? 'Hide working' : 'Show working' }}
            </a>
          </p>
          <div class="collapse" id="dkaSeverityWorking">
            <!--severity-->
            <div class="card mb-4">
              <div class="card-header">Severity</div>
              <div class="card-body">
                <span v-html="data.calculations.severity.working"></span>
              </div>
            </div>
            <!--deficit percentage-->
            <div class="card mb-4">
              <div class="card-header">Deficit percentage</div>
              <div class="card-body">
                <span
                  v-html="data.calculations.deficit.percentage.working"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--fluid bolus-->
      <div class="card mb-4">
        <div class="card-header">Fluid bolus</div>
        <div class="card-body">
          <h3>{{ data.calculations.bolus.volume.val.toFixed(0) }}mL over {{ data.calculations.bolus.duration.val * 60 }} minutes</h3>
          <div class="mb-2" v-if="data.inputs.shockPresent.val">
              Administer a fluid bolus of {{ data.calculations.bolus.volume.val.toFixed(0) }}mL Ringer lactate (or sodium chloride 0.9%) IV at {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour then reassess after. If signs of shock persist, repeat another bolus.
          </div>
          <div class="mb-2" v-else-if="data.calculations.bolus.volume.val > 0 && data.inputs.gcs.val > config.validation.gcs.noBolusThreshold">
              Administer a fluid bolus of {{ data.calculations.bolus.volume.val.toFixed(0) }} Ringer lactate (or sodium chloride 0.9%) IV at {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour.
          </div>
          <div class="mb-2" v-else-if="data.calculations.bolus.volume.val === 0 && data.inputs.gcs.val <= config.validation.gcs.noBolusThreshold">
              Do not give a fluid bolus. Start IV maintenance fluids as below.
          </div>
          <div class="mb-2 text-danger" v-else>
              Error generating fluid bolus guidance.
          </div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#fluidBolusWorking" role="button" aria-expanded="false" aria-controls="collapseFluidBolusWorking" @click="showWorking.fluidBolus = !showWorking.fluidBolus">
              {{ showWorking.fluidBolus ? 'Hide working' : 'Show working' }}
            </a>
          </p>
          <div class="collapse" id="fluidBolusWorking">
            <!--bolus volume-->
            <div class="card mb-4">
              <div class="card-header">Bolus volume</div>
              <div class="card-body">
                <span v-html="data.calculations.bolus.volume.working"></span>
              </div>
            </div>
            <!--bolus duration-->
            <div class="card mb-4">
              <div class="card-header">Bolus duration/rate</div>
              <div class="card-body">
                <span v-html="data.calculations.bolus.duration.working"></span>
              </div>
            </div>
            <!--bolus rate-->
            <div class="card mb-4">
              <div class="card-header">Bolus rate</div>
              <div class="card-body">
                <span v-html="data.calculations.bolus.rate.working"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--fluid replacement-->
      <div class="card mb-4">
        <div class="card-header">Fluid replacement</div>
        <div class="card-body">
          <table class="table table-striped d-none d-sm-block">
            <thead>
              <tr>
                <th>Blood glucose level</th>
                <th>Which bag(s) at what speed?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <!--very high glucose-->
                <td>>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}</td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  Bag #1 at standard-speed: <strong>{{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  None of bag #2*
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  Bag #1 at high-speed: <strong>{{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  None of bag #2*
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--high glucose-->
              <tr>
                <td>
                  {{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][1] }} to {{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}
                </td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  Bag #1 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  Bag #2 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  Bag #1 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  Bag #2 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--moderate glucose-->
              <tr>
                <td>
                  {{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][2] }} to <{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][1] }} {{ data.inputs.glucose.unit }}
                </td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  None of bag #1<br></br>
                  Bag #2 at standard-speed: <strong>{{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  None of bag #1<br></br>
                  Bag #2 at high-speed: <strong>{{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--low glucose-->
              <tr>
                <td>
                  <{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][2] }} {{ data.inputs.glucose.unit }}<br>
                  <i>Call clinician immediately</i>
                </td>
                <td>None of bag #1<br></br>
                  Bag #2 at high-speed: <strong>{{ data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1) }}mL/hour**</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <table class="table table-striped d-sm-none">
            <thead>
              <tr>
                <th>Which bag(s) at what speed?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <!--very high glucose-->
                <td v-if="data.calculations.severity.val === 'standard'">
                  <strong>>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  Bag #1 at standard-speed: <strong>{{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  None of bag #2*
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  <strong>>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  Bag #1 at high-speed: <strong>{{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  None of bag #2*
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--high glucose-->
              <tr>
                <td v-if="data.calculations.severity.val === 'standard'">
                  <strong>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][1] }} to {{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  Bag #1 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  Bag #2 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  <strong>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][1] }} to {{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  Bag #1 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                  Bag #2 at half-speed: <strong>{{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--moderate glucose-->
              <tr>
                <td v-if="data.calculations.severity.val === 'standard'">
                  <strong>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][2] }} to <{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][1] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  None of bag #1<br></br>
                  Bag #2 at standard-speed: <strong>{{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  <strong>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][2] }} to <{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][1] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  None of bag #1<br></br>
                  Bag #2 at high-speed: <strong>{{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }}mL/hr</strong><br></br>
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--low glucose-->
              <tr>
                <td>
                  <strong><{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][2] }} {{ data.inputs.glucose.unit }}</strong><br></br>
                  None of bag #1<br></br>
                  Bag #2 at high-speed: <strong>{{ data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1) }}mL/hour**</strong><br></br>
                  <i>Call clinician immediately</i>
                </td>
              </tr>
            </tbody>
          </table>
          <p>
             * These patients are receiving insulin but no glucose at this stage.<br></br>
            ** For standard severity DKA this high-speed rate is only continued long enough to raise the glucose, then immediately decrease the rate to standard-speed rate. If BGL decreases too rapidly 
            despite adjusting the fluid rates, insulin dose needs to be decreased (see full guidelines).
          </p>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#fluidReplacementWorking" role="button" aria-expanded="false" aria-controls="collapseFluidReplacementWorking" @click="showWorking.fluidReplacement = !showWorking.fluidReplacement">
              {{ showWorking.fluidReplacement ? 'Hide working' : 'Show working' }}
            </a>
          </p>
          <div class="collapse" id="fluidReplacementWorking">
            <!--deficit volume-->
            <div class="card mb-4">
              <div class="card-header">Deficit volume</div>
              <div class="card-body">
                <span v-html="data.calculations.deficit.standardSpeedVolume.working || data.calculations.deficit.highSpeedVolume.working"></span>
              </div>
            </div>
            <!--deficit rate-->
            <div class="card mb-4">
              <div class="card-header">Deficit replacement rate</div>
              <div class="card-body">
                <span v-html="data.calculations.deficit.standardSpeedRate.working || data.calculations.deficit.highSpeedRate.working"></span>
              </div>
            </div>
            <!--maintenance volume-->
            <div class="card mb-4">
              <div class="card-header">Daily maintenance volume</div>
              <div class="card-body">
                <span v-html="data.calculations.maintenance.volume.working"></span>
              </div>
            </div>
            <!--maintenance rate-->
            <div class="card mb-4">
              <div class="card-header">Daily maintenance rate</div>
              <div class="card-body">
                <span v-html="data.calculations.maintenance.rate.working"></span>
              </div>
            </div>
            <div v-if="data.calculations.bagSpeeds.standardSpeed">
              <!--standard speed bag-->
              <div class="card mb-4">
                <div class="card-header">Standard speed bag</div>
                <div class="card-body">
                  <span v-html="data.calculations.bagSpeeds.standardSpeed.working"></span>
                </div>
              </div>
              <!--half standard speed bag-->
              <div class="card mb-4">
                <div class="card-header">Half standard speed bag</div>
                <div class="card-body">
                  <span v-html="data.calculations.bagSpeeds.halfStandardSpeed.working"></span>
                </div>
              </div>
              <!--hypo speed bag-->
              <div class="card mb-4">
                <div class="card-header">High speed bag (for managing hypoglycaemia)</div>
                <div class="card-body">
                  <span v-html="data.calculations.bagSpeeds.hypoSpeed.working"></span>
                </div>
              </div>
            </div>
            <div v-else-if="data.calculations.bagSpeeds.highSpeed">
              <!--high speed bag-->
              <div class="card mb-4" v-if="data.calculations.bagSpeeds.highSpeed">
                <div class="card-header">High speed bag</div>
                <div class="card-body">
                  <span v-html="data.calculations.bagSpeeds.highSpeed.working"></span>
                </div>
              </div>
              <!--half high speed bag-->
              <div class="card mb-4">
                <div class="card-header">Half high speed bag</div>
                <div class="card-body">
                 <span v-html="data.calculations.bagSpeeds.halfHighSpeed.working"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--iv insulin rate-->
      <div class="card mb-4" v-if="data.inputs.syringeDriverAvailable.val == 'true'">
        <div class="card-header">IV insulin rate</div>
        <div class="card-body">
          <h3>{{ data.calculations.insulinRate.val.toFixed(2) }} Units/hour </h3>
          <div class="mb-2">{{ data.inputs.shockPresent ? 'Once shock corrected, and one' : 'One' }} hour after starting IV fluid replacement, start IV insulin at a rate of {{ data.calculations.insulinRate.val.toFixed(2) }} Units/hour.</div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#insulinRateWorking" role="button" aria-expanded="false" aria-controls="collapseInsulinRateWorking" @click="showWorking.insulinRate = !showWorking.insulinRate">
              {{ showWorking.insulinRate ? 'Hide working' : 'Show working' }}
            </a>
          </p>
          <div class="collapse" id="insulinRateWorking">
            <!--im insulin rate-->
            <div class="card mb-4">
              <div class="card-header">Insulin rate</div>
              <div class="card-body">
                <span v-html="data.calculations.insulinRate.working"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--insulin dose-->
      <div class="card mb-4" v-else>
        <div class="card-header">IM insulin dose</div>
        <div class="card-body">
          <h3>{{ data.calculations.insulinDose.val.toFixed(1) }} Units 2-hourly </h3>
          <div class="mb-2">As no syringe pump available administer IM insulin {{ data.calculations.insulinDose.val.toFixed(1) }} Units every 2 hours.</div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#insulinDoseWorking" role="button" aria-expanded="false" aria-controls="collapseInsulinDoseWorking" @click="showWorking.insulinDose = !showWorking.insulinDose">
              {{ showWorking.insulinDose ? 'Hide working' : 'Show working' }}
            </a>
          </p>
          <div class="collapse" id="insulinDoseWorking">
            <!--insulin dose-->
            <div class="card mb-4">
              <div class="card-header">Insulin dose</div>
              <div class="card-body">
                <span v-html="data.calculations.insulinDose.working"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-warning mb-3">
        <div class="card-body">
          <p class="card-text">
            Note: Refer to the MSF paediatric diabetes guidelines for how to use
            these calculated values.
          </p>
        </div>
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
