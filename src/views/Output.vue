<script setup>
import { onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";
const config = inject("config");

if (!data.value.auditID) router.push("/form-clinical-details");

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3">Output</h2>
    <div v-if="data.auditID">
      <h3>Audit ID: {{ data.auditID }}</h3>
      <!--severity-->
      <div class="card mb-4">
        <div class="card-header">DKA severity</div>
        <div class="card-body">
          <h3>{{ capitalizeFirst(data.calculations.severity.val) }}</h3>
          <div class="mb-2">
              Treat your patient as having {{ data.calculations.severity.val }} severity DKA with a deficit of {{ data.calculations.deficit.percentage.val }}%.
          </div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#severityWorking" role="button" aria-expanded="false" aria-controls="collapseExample">
              Show working
            </a>
          </p>
          <div class="collapse" id="severityWorking">
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
          <div class="mb-2" v-else-if="data.calculations.bolus.volume.val > 0 && data.gcs.val > config.validation.gcs.noBolusThreshold">
              Administer a fluid bolus of {{ data.calculations.bolus.volume.val.toFixed(0) }} Ringer lactate (or sodium chloride 0.9%) IV at {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour.
          </div>
          <div class="mb-2" v-else-if="data.calculations.bolus.volume.val === 0 && data.gcs.val <= config.validation.gcs.noBolusThreshold">
              Do not give a fluid bolus. Start IV maintenance fluids as below.
          </div>
          <div class="mb-2 text-danger" v-else>
              Error generating fluid bolus guidance.
          </div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#fluidBolusWorking" role="button" aria-expanded="false" aria-controls="collapseExample">
              Show working
            </a>
          </p>
          <div class="collapse" id="fluidBolusWorking">
            <!--bolus volume-->
            <div class="card mb-4">
              <div class="card-header">Bolus volume</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.bolus.volume.formula"></span>
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
                    <span v-html="data.calculations.bolus.volume.working"></span>
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
            <!--bolus duration-->
            <div class="card mb-4">
              <div class="card-header">Bolus duration</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.bolus.duration.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.bolus.duration.working"></span>
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
          </div>
        </div>
      </div>

      <!--fluid replacement-->
      <div class="card mb-4">
        <div class="card-header">Fluid replacement</div>
        <div class="card-body">
          <div v-if="data.calculations.severity.val === 'standard'">
            <h3>
              Standard-speed: {{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }} mL/hr<br></br>
              Half-standard-speed: {{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }} mL/hr<br></br>
              High-speed: {{ data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1) }} mL/hr*
            </h3>
            <small>* For standard severity DKA the high-speed regime is used only in case of hypoglycaemia</small>
          </div>
          <h3 v-else-if="data.calculations.severity.val === 'severe'">
            High-speed: {{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }} mL/hr<br></br>
            Half-high-speed: {{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }} mL/hr
          </h3>
          <h3 v-else class="text-danger">Error generating fluid replacement guidance</h3>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Blood gluocse level</th>
                <th>Which bag(s) at what speed?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <!--very high glucose-->
                <td>>{{ config.bagSpeedGlucoseThresholds[data.inputs.glucose.unit][0] }} {{ data.inputs.glucose.unit }}</td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  Bag #1 at standard-speed: <strong>{{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
                  None of bag #2*
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  Bag #1 at high-speed: <strong>{{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
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
                  Bag #1 at half-standard-speed: <strong>{{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
                  Bag #2 at half-standard-speed: <strong>{{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  Bag #1 at half-high-speed: <strong>{{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
                  Bag #2 at half-high-speed: <strong>{{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
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
                  Bag #2 at standard-speed: <strong>{{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  None of bag #1<br></br>
                  Bag #2 at high-speed: <strong>{{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }} mL/hr</strong><br></br>
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
                  Bag #2 at high-speed: <strong>{{ data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1) }} mL/hr</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#fluidReplacementWorking" role="button" aria-expanded="false" aria-controls="collapseExample">
              How was this calculated?
            </a>
          </p>
          <div class="collapse" id="fluidReplacementWorking">
            <!--deficit volume-->
            <div class="card mb-4">
              <div class="card-header">Deficit volume</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.deficit.standardSpeedVolume.formula || data.calculations.deficit.highSpeedVolume.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Limit</span>
                    <span v-html="data.calculations.deficit.standardSpeedVolume.limit || data.calculations.deficit.highSpeedVolume.limit"></span>
                    <small>Based on weight of {{ config.caps.weight }}kg</small>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.deficit.standardSpeedVolume.working || data.calculations.deficit.highSpeedVolume.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.deficit.standardSpeedVolume.val.toFixed(0) || data.calculations.deficit.highSpeedVolume.val.toFixed(0) }}mL
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
                    <span v-html="data.calculations.deficit.standardSpeedRate.formula || data.calculations.deficit.highSpeedRate.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.deficit.standardSpeedRate.working || data.calculations.deficit.highSpeedRate.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.deficit.standardSpeedRate.val.toFixed(1) || data.calculations.deficit.highSpeedRate.val.toFixed(1) }}mL/hour
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
                    <span v-html="data.calculations.maintenance.volume.limit"></span>
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
                    <span v-html="data.calculations.maintenance.rate.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.maintenance.rate.working"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Output</span>
                    {{ data.calculations.maintenance.rate.val.toFixed(1) }}mL/hour
                  </div>
                </div>
              </div>
            </div>
            <div v-if="data.calculations.bagSpeeds.standardSpeed">
              <!--standard speed bag-->
              <div class="card mb-4">
                <div class="card-header">Standard speed bag</div>
                <div class="card-body">
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Formula</span>
                      <span
                        v-html="data.calculations.bagSpeeds.standardSpeed.formula"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Working</span>
                      <span
                        v-html="data.calculations.bagSpeeds.standardSpeed.working"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Output</span>
                      {{ data.calculations.bagSpeeds.standardSpeed.val.toFixed(1) }}mL/hour
                    </div>
                  </div>
                </div>
              </div>
              <!--half standard speed bag-->
              <div class="card mb-4">
                <div class="card-header">Half standard speed bag</div>
                <div class="card-body">
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Formula</span>
                      <span
                        v-html="data.calculations.bagSpeeds.halfStandardSpeed.formula"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Working</span>
                      <span
                        v-html="data.calculations.bagSpeeds.halfStandardSpeed.working"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Output</span>
                      {{ data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(1) }}mL/hour
                    </div>
                  </div>
                </div>
              </div>
              <!--hypo speed bag-->
              <div class="card mb-4">
                <div class="card-header">High speed bag (for managing hypoglycaemia)</div>
                <div class="card-body">
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Formula</span>
                      <span
                        v-html="data.calculations.bagSpeeds.hypoSpeed.formula"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Working</span>
                      <span
                        v-html="data.calculations.bagSpeeds.hypoSpeed.working"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Output</span>
                      {{ data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1) }}mL/hour
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="data.calculations.bagSpeeds.highSpeed">
              <!--high speed bag-->
              <div class="card mb-4" v-if="data.calculations.bagSpeeds.highSpeed">
                <div class="card-header">High speed bag</div>
                <div class="card-body">
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Formula</span>
                      <span
                        v-html="data.calculations.bagSpeeds.highSpeed.formula"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Working</span>
                      <span
                        v-html="data.calculations.bagSpeeds.highSpeed.working"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Output</span>
                      {{ data.calculations.bagSpeeds.highSpeed.val.toFixed(1) }}mL/hour
                    </div>
                  </div>
                </div>
              </div>
              <!--half high speed bag-->
              <div class="card mb-4">
                <div class="card-header">Half high speed bag</div>
                <div class="card-body">
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Formula</span>
                      <span
                        v-html="data.calculations.bagSpeeds.halfHighSpeed.formula"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Working</span>
                      <span
                        v-html="data.calculations.bagSpeeds.halfHighSpeed.working"
                      ></span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <div class="card p-2">
                      <span class="text-muted m-0">Output</span>
                      {{ data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1) }}mL/hour
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--insulin TODO!!!!-->
      <div class="card mb-4">
        <div class="card-header">Fluid bolus</div>
        <div class="card-body">
          <h3>{{ data.calculations.bolus.volume.val.toFixed(0) }}mL over {{ data.calculations.bolus.duration.val * 60 }} minutes</h3>
          <div class="mb-2" v-if="data.inputs.shockPresent.val">
              Administer a fluid bolus of {{ data.calculations.bolus.volume.val.toFixed(0) }}mL Ringer lactate (or sodium chloride 0.9%) IV at {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour then reassess after. If signs of shock persist, repeat another bolus.
          </div>
          <div class="mb-2" v-else-if="data.calculations.bolus.volume.val > 0 && data.gcs.val > config.validation.gcs.noBolusThreshold">
              Administer a fluid bolus of {{ data.calculations.bolus.volume.val.toFixed(0) }} Ringer lactate (or sodium chloride 0.9%) IV at {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour.
          </div>
          <div class="mb-2" v-else-if="data.calculations.bolus.volume.val === 0 && data.gcs.val <= config.validation.gcs.noBolusThreshold">
              Do not give a fluid bolus. Start IV maintenance fluids as below.
          </div>
          <div class="mb-2 text-danger" v-else>
              Error generating fluid bolus guidance.
          </div>
          <p>
            <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#fluidBolusWorking" role="button" aria-expanded="false" aria-controls="collapseExample">
              Show working
            </a>
          </p>
          <div class="collapse" id="fluidBolusWorking">
            <!--bolus volume-->
            <div class="card mb-4">
              <div class="card-header">Bolus volume</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.bolus.volume.formula"></span>
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
                    <span v-html="data.calculations.bolus.volume.working"></span>
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
            <!--bolus duration-->
            <div class="card mb-4">
              <div class="card-header">Bolus duration</div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Formula</span>
                    <span v-html="data.calculations.bolus.duration.formula"></span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="card p-2">
                    <span class="text-muted m-0">Working</span>
                    <span v-html="data.calculations.bolus.duration.working"></span>
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
          </div>
        </div>
      </div>
      <hr></hr>
      
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
              Note: Insulin should NOT be started immediately. Wait 1 hour after
              starting IV fluid therapy.
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
              Note: Insulin should NOT be started immediately. Wait 1 hour after
              starting IV fluid therapy.
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
