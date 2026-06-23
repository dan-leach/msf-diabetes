<script setup>
import { onMounted, ref } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import Swal from "sweetalert2";
import ViewWorking from "../components/ViewWorking.vue";
import { inject } from "vue";
const config = inject("config");

import Feedback from "../components/Feedback.vue";
import { useInstallPrompt } from "../assets/useInstallPrompt.js";
const { deferredPrompt, install } = useInstallPrompt();
const installBannerDismissed = ref(false);

if (!data.value.auditID) router.push("/form-clinical-details");

const viewWorkingExample = ref({
  val: "highlighted",
  working: `
    The calculation steps to reach the output value will be displayed here.
  `,
});

let showGuidance = ref({
  dkaSeverity: false,
  fluidBolus: false,
  whichBagsAtWhatSpeed: false,
  ivInsulinRate: false,
  imInsulinDose: false,
});

const formatDatetime = (iso) => {
  const date = new Date(iso);

  return date.toLocaleString(undefined, {
    dateStyle: "short", // or "medium" / "long" / "full"
    timeStyle: "short", // short time (e.g. 23:30)
  });
};

/**
 * Function to reset the patient details form to its default state.
 * Resets all input values to their default values, hides error messages, and removes validation styling from the form.
 */
const resetForm = () => {
  Swal.fire({
    title: "Reset?",
    text: "This will clear all data you have entered on the form.",
    icon: "info",
    iconColor: "black",
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonColor: "#ec0000",
    confirmButtonText: "Reset",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      data.value.form.reset();
      router.push("/");
    }
  });
};

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <!--install PWA banner-->
    <div
      v-if="deferredPrompt && !installBannerDismissed"
      class="alert d-flex align-items-center justify-content-between mb-3 py-2 border-info bg-transparent"
      role="alert"
    >
      <span>
        Install this app for faster access and offline use.
      </span>
      <div class="d-flex gap-2 ms-3 flex-shrink-0 align-items-center">
        <button type="button" class="btn btn-sm btn-primary" @click="install">
          Install app
        </button>
        <button
          type="button"
          class="btn-close"
          aria-label="Dismiss"
          @click="installBannerDismissed = true"
        ></button>
      </div>
    </div>
    <h2 class="display-3 mb-4 text-center">Guidance</h2>
    <div v-if="data.auditID">
      <!--check guidelines alert box-->
      <div class="card border-danger mb-3">
        <div class="card-body d-flex flex-row align-items-center">
          <font-awesome-icon
            :icon="['fas', 'triangle-exclamation']"
            size="2xl"
            class="me-4"
          />
          <p class="card-text">
            Refer to the MSF paediatric diabetes guidelines for how to use these
            calculated values.
          </p>
        </div>
      </div>

      <!--offline alert box-->
      <div class="card border-danger mb-3" v-if="data.mode === 'offline'">
        <div class="card-body d-flex flex-row align-items-center">
          <img
            alt="Audit ID icon"
            class="icon me-4"
            src="@/assets/images/offline-icon.svg"
            width="35"
            height="35"
          />
          <p class="card-text">
            This guidance was generated in offline mode based on algorithms up
            to date as of {{ formatDatetime(config.fetchDatetime) }}. Audit data
            will upload when {{ config.appName }} is next online.
          </p>
        </div>
      </div>

      <!--info box-->
      <div class="card border-info mb-3">
        <div class="card-body d-flex flex-row align-items-top">
          <font-awesome-icon
            :icon="['fas', 'circle-info']"
            size="2xl"
            class="me-4"
          />
          <p class="card-text">
            <ol>
              <li>
                Assess the patient using a structured ABCDE approach and manage any life-threatening issues.
              </li>
              <li>
                Refer to MSF Paediatric Care section 9.2 diabetic ketoacidoisis
                for guidance on diagnostic criteria and resuscitation of
                patients with DKA.
              </li>
              <li>
                Use a MSF Paediatric DKA Fluid and Insulin Prescription Sheet (<a
                  href="/msf-dka-fluid-insulin-prescription.pdf"
                  target="_blank"
                  >download here</a
                >) to
                transcribe and prescribe the values below. Calculated values are
              <ViewWorking
                :param="viewWorkingExample"
                paramKey="viewWorkingExample"
                heading="View working example"
              />
              and can be clicked to check how the calculation was performed. You
              can also
              <a href="#" @click="router.push('/calculations')"
                >view the full calculation logic here</a
              >.
              </li>
              <li>
                Start by giving the fluid bolus shown below.
              </li>
              <li>
                While this is running, prepare the IV fluids for the two-bag
                method per <strong><i>Preparation of IV fluids for two-bag method</i></strong> guidance below.
              </li>
              <li>
                Once the fluid bolus is complete, unless further boluses are
                clinically indicated, proceed to start the fluid replacement at
                the rates specified and according to the blood glucose.
              </li>
              <li>
                Once shock corrected, and one hour after starting IV fluid
                replacement, start IV insulin.
              </li>
            </ol>
          </p>
        </div>
      </div>

      <!--auditID-->
      <div class="card mb-4">
        <div class="card-header">
          <img
            alt="Audit ID icon"
            class="icon"
            src="@/assets/images/audit-id-icon.svg"
            width="24"
            height="24"
          />
          Audit ID
        </div>
        <div class="card-body">
          <h3>{{ data.auditID }}</h3>
          <div class="mb-2">
            Please record this audit ID in the patient notes.
          </div>
        </div>
      </div>

      <!--severity-->
      <div class="card mb-4">
        <div class="card-header">
          <img
            alt="Severity icon"
            class="icon"
            src="@/assets/images/severity-icon.svg"
            width="24"
            height="24"
          />
          DKA severity
        </div>
        <div class="card-body">
          <h3 class="d-flex flex-row flex-wrap gap-2">
            <ViewWorking
              :param="data.calculations.severity"
              paramKey="severity"
              captitalizeFirst="true"
            />
            <ViewWorking
              :param="data.calculations.deficit.percentage"
              unit="% fluid deficit"
              heading="Fluid deficit percentage"
              paramKey="deficitPercentage"
            />
          </h3>
          <div class="mb-2">
            Treat your patient as having
            {{ data.calculations.severity.val }} severity DKA with a fluid
            deficit of {{ data.calculations.deficit.percentage.val }}%.
          </div>
        </div>
      </div>

      <!--fluid bolus-->
      <div class="card mb-4">
        <div class="card-header">
          <img
            alt="IV bag icon"
            class="icon"
            src="@/assets/images/intravenous-bag-icon.svg"
            width="24"
            height="24"
          />
          Fluid bolus
        </div>
        <div class="card-body">
          <h3 class="d-flex flex-row flex-wrap gap-1">
            <ViewWorking
              :param="data.calculations.bolus.volume"
              paramKey="bolusVolume"
              heading="Bolus volume"
              unit="mL"
              :decimals="config.decimals.bolusVolume"
            />
            <span
              >over
              <ViewWorking
                :param="data.calculations.bolus.duration"
                paramKey="bolusDuration"
                heading="Bolus duration"
                unit=" minutes"
            /></span>
            <span
              >at
              <ViewWorking
                :param="data.calculations.bolus.rate"
                paramKey="bolusRate"
                heading="Bolus rate"
                unit="mL/hour"
                :decimals="config.decimals.bolusRate"
            /></span>
            <span v-if="data.calculations.bolus.drops"
              >which is
              <ViewWorking
                :param="data.calculations.bolus.drops"
                paramKey="bolusDrops"
                heading="Bolus drop rate"
                unit=" drops/minute"
                :decimals="config.decimals.drops"
            /></span>
          </h3>
          <div class="mb-2" v-if="data.inputs.shockPresent.val">
            Administer a fluid bolus of
            {{
              data.calculations.bolus.volume.val.toFixed(
                config.decimals.bolusVolume,
              )
            }}mL Ringer lactate (or sodium chloride 0.9%) IV at
            {{
              data.calculations.bolus.rate.val.toFixed(
                config.decimals.bolusRate,
              )
            }}mL/hour
            <span v-if="data.calculations.bolus.drops"
              >(which is
              {{
                data.calculations.bolus.drops.val.toFixed(config.decimals.drops)
              }}
              drops/minute)</span
            >
            then reassess.
            <span v-if="data.inputs.shockPresent.val == 'true'"
              >If signs of shock persist, repeat another bolus.</span
            >
          </div>
          <div
            class="mb-2"
            v-else-if="
              data.calculations.bolus.volume.val > 0 &&
              data.inputs.gcs.val > config.validation.gcs.noBolusThreshold
            "
          >
            Administer a fluid bolus of
            {{ data.calculations.bolus.volume.val.toFixed(0) }} Ringer lactate
            (or sodium chloride 0.9%) IV at
            <ViewWorking
              :param="data.calculations.bolus.rate"
              paramKey="bolusRate"
              heading="Bolus rate"
              unit="mL/hour"
            />.
          </div>
          <div
            class="mb-2"
            v-else-if="
              data.calculations.bolus.volume.val === 0 &&
              data.inputs.gcs.val <= config.validation.gcs.noBolusThreshold
            "
          >
            Do not give a fluid bolus. Start IV maintenance fluids as below.
          </div>
          <div class="mb-2 text-danger" v-else>
            Error generating fluid bolus guidance.
          </div>
        </div>
      </div>

      <!--fluid replacement-->
      <div class="card mb-4">
        <div class="card-header">
          <img
            alt="IV bag icon"
            class="icon"
            src="@/assets/images/intravenous-bag-icon.svg"
            width="24"
            height="24"
          />
          Fluid replacement
        </div>
        <div class="card-body">
          <div class="d-flex flex-row flex-wrap gap-1">
              <!--which bag(s) at what speed guidance-->
              <div class="mb-2">
                <p>Select starting rate by checking blood glucose when IV fluids for two-bag method have been made up. Adjust according to blood glucose checks at least once per hour.</p>
                <!--header-->
                <div class="row bg-light">
                  <div class="col-4 d-none d-sm-block">
                    <strong>Blood glucose level</strong>
                  </div>
                  <div class="col">
                    <strong>Which bag(s) at what speed?</strong>
                  </div>
                </div>
                <!--very high glucose-->
                <div class="row">
                  <!--glucose col-->
                  <div class="col-4 d-none d-sm-block">
                    >{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][0]
                    }}
                    {{ data.inputs.glucose.unit }}
                  </div>
                  <!--rate col-->
                  <div class="col">
                    <!--narrow screen glucose-->
                    <div class="d-block d-sm-none mb-2">
                      Blood glucose >{{
                        config.bagSpeedGlucoseThresholds[
                          data.inputs.glucose.unit
                        ][0]
                      }}
                      {{ data.inputs.glucose.unit }}
                    </div>
                    <!--bag speed for standard-->
                    <div v-if="data.calculations.severity.val === 'standard'">
                      <div class="mb-2">
                        <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                          <span class="bag-1-text"
                            >Bag #1 at standard-speed:
                            <ViewWorking
                              :param="data.calculations.bagSpeeds.standardSpeed"
                              paramKey="standardSpeed"
                              heading="Standard speed bag rate"
                              unit="mL/hour"
                              :decimals="config.decimals.bagSpeed"
                          /></span>
                          <span
                            v-if="
                              data.calculations.bagSpeeds.standardSpeedDrops
                            "
                          >
                            which is
                            <ViewWorking
                              :param="
                                data.calculations.bagSpeeds.standardSpeedDrops
                              "
                              paramKey="standardSpeedDrops"
                              heading="Standard-speed drop rate"
                              unit=" drops/minute"
                              :decimals="config.decimals.drops"
                          /></span>
                        </div>
                      </div>
                      <span class="bag-2-text">None of bag #2*</span>
                    </div>
                    <!--bag speed for severe-->
                    <div
                      v-else-if="data.calculations.severity.val === 'severe'"
                    >
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-1-text"
                          >Bag #1 at high-speed:
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.highSpeed"
                            paramKey="highSpeed"
                            heading="High speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span v-if="data.calculations.bagSpeeds.highSpeedDrops">
                          which is
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.highSpeedDrops"
                            paramKey="highSpeedDrops"
                            heading="High-speed drop rate"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                      <span class="bag-2-text">None of bag #2*</span>
                    </div>
                    <!--error-->
                    <div class="text-danger" v-else>
                      Error generating fluid rate guidance.
                    </div>
                  </div>
                </div>
                <!--high glucose-->
                <div class="row bg-light">
                  <!--glucose col-->
                  <div class="col-4 d-none d-sm-block">
                    {{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][1]
                    }}
                    to
                    {{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][0]
                    }}
                    {{ data.inputs.glucose.unit }}
                  </div>
                  <!--rate col-->
                  <div class="col">
                    <!--narrow screen glucose-->
                    <div class="d-block d-sm-none mb-2">
                      Blood glucose
                      {{
                        config.bagSpeedGlucoseThresholds[
                          data.inputs.glucose.unit
                        ][1]
                      }}
                      to
                      {{
                        config.bagSpeedGlucoseThresholds[
                          data.inputs.glucose.unit
                        ][0]
                      }}
                      {{ data.inputs.glucose.unit }}
                    </div>
                    <!--bag speed for standard-->
                    <div v-if="data.calculations.severity.val === 'standard'">
                      <div class="mb-2">
                        <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                          <span class="bag-1-text"
                            >Bag #1 at half-speed:
                            <ViewWorking
                              :param="
                                data.calculations.bagSpeeds.halfStandardSpeed
                              "
                              paramKey="halfStandardSpeed"
                              heading="Half standard-speed bag rate"
                              unit="mL/hour"
                              :decimals="config.decimals.bagSpeed"
                          /></span>
                          <span
                            v-if="
                              data.calculations.bagSpeeds.halfStandardSpeedDrops
                            "
                          >
                            which is
                            <ViewWorking
                              :param="
                                data.calculations.bagSpeeds
                                  .halfStandardSpeedDrops
                              "
                              paramKey="halfStandardSpeedDrops"
                              heading="Half-standard-speed drop rate"
                              unit=" drops/minute"
                              :decimals="config.decimals.drops"
                          /></span>
                        </div>
                      </div>
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-2-text"
                          >Bag #2 at half-speed:
                          <ViewWorking
                            :param="
                              data.calculations.bagSpeeds.halfStandardSpeed
                            "
                            paramKey="halfStandardSpeed"
                            heading="Half standard-speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span
                          v-if="
                            data.calculations.bagSpeeds.halfStandardSpeedDrops
                          "
                        >
                          which is
                          <ViewWorking
                            :param="
                              data.calculations.bagSpeeds.halfStandardSpeedDrops
                            "
                            paramKey="halfStandardSpeedDrops"
                            heading="Half-standard-speed drop rate"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                    </div>
                    <!--bag speed for severe-->
                    <div
                      v-else-if="data.calculations.severity.val === 'severe'"
                    >
                      <div class="mb-2">
                        <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                          <span class="bag-1-text"
                            >Bag #1 at half-speed:
                            <ViewWorking
                              :param="data.calculations.bagSpeeds.halfHighSpeed"
                              paramKey="halfHighSpeed"
                              heading="Half high-speed bag rate"
                              unit="mL/hour"
                              :decimals="config.decimals.bagSpeed"
                          /></span>
                          <span
                            v-if="
                              data.calculations.bagSpeeds.halfHighSpeedDrops
                            "
                          >
                            which is
                            <ViewWorking
                              :param="
                                data.calculations.bagSpeeds.halfHighSpeedDrops
                              "
                              paramKey="halfHighSpeedDrops"
                              heading="Half-high-speed drop rate"
                              unit=" drops/minute"
                              :decimals="config.decimals.drops"
                          /></span>
                        </div>
                      </div>
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-2-text"
                          >Bag #2 at half-speed:
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.halfHighSpeed"
                            paramKey="halfHighSpeed"
                            heading="Half high-speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span
                          v-if="data.calculations.bagSpeeds.halfHighSpeedDrops"
                        >
                          which is
                          <ViewWorking
                            :param="
                              data.calculations.bagSpeeds.halfHighSpeedDrops
                            "
                            paramKey="halfHighSpeedDrops"
                            heading="Half-high-speed drop rate"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                    </div>
                    <!--error-->
                    <div class="text-danger" v-else>
                      Error generating fluid rate guidance.
                    </div>
                  </div>
                </div>
                <!--moderate glucose-->
                <div class="row">
                  <!--glucose col-->
                  <div class="col-4 d-none d-sm-block">
                    {{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][2]
                    }}
                    to &lt;{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][1]
                    }}
                    {{ data.inputs.glucose.unit }}
                  </div>
                  <!--rate col-->
                  <div class="col">
                    <!--narrow screen glucose-->
                    <div class="d-block d-sm-none mb-2">
                      Blood glucose
                      {{
                        config.bagSpeedGlucoseThresholds[
                          data.inputs.glucose.unit
                        ][2]
                      }}
                      to &lt;{{
                        config.bagSpeedGlucoseThresholds[
                          data.inputs.glucose.unit
                        ][1]
                      }}
                      {{ data.inputs.glucose.unit }}
                    </div>
                    <!--bag speeds for standard-->
                    <div v-if="data.calculations.severity.val === 'standard'">
                      <div class="mb-2">
                        <span class="bag-1-text">None of bag #1</span>
                      </div>
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-2-text"
                          >Bag #2 at standard-speed:
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.standardSpeed"
                            paramKey="standardSpeed"
                            heading="Standard speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span
                          v-if="data.calculations.bagSpeeds.standardSpeedDrops"
                        >
                          which is
                          <ViewWorking
                            :param="
                              data.calculations.bagSpeeds.standardSpeedDrops
                            "
                            paramKey="standardSpeedDrops"
                            heading="Standard-speed drop rate"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                    </div>
                    <!--bag speeds for severe-->
                    <div
                      v-else-if="data.calculations.severity.val === 'severe'"
                    >
                      <div class="mb-2">
                        <span class="bag-1-text">None of bag #1</span>
                      </div>
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-2-text"
                          >Bag #2 at high-speed:
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.highSpeed"
                            paramKey="highSpeed"
                            heading="High speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span v-if="data.calculations.bagSpeeds.highSpeedDrops">
                          which is
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.highSpeedDrops"
                            paramKey="highSpeedDrops"
                            heading="High-speed drop rate"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                    </div>
                    <!--error-->
                    <div class="text-danger" v-else>
                      Error generating fluid rate guidance.
                    </div>
                  </div>
                </div>
                <!--low glucose-->
                <div class="row bg-light">
                  <!--glucose col-->
                  <div class="col-4 d-none d-sm-block mb-2">
                    &lt;{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][2]
                    }}
                    {{ data.inputs.glucose.unit }}
                    <div class="mt-2"><i>Call clinician immediately</i></div>
                  </div>
                  <!--rate col-->
                  <div class="col">
                    <!--narrow screen glucose-->
                    <div class="d-block d-sm-none mb-2">
                      Blood glucose &lt;{{
                        config.bagSpeedGlucoseThresholds[
                          data.inputs.glucose.unit
                        ][2]
                      }}
                      {{ data.inputs.glucose.unit }}
                    </div>
                    <!--bag speed for standard-->
                    <div v-if="data.calculations.severity.val === 'standard'">
                      <div class="mb-2">
                        <span class="bag-1-text">None of bag #1</span>
                      </div>
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-2-text"
                          >Bag #2 at high-speed:
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.hypoSpeed"
                            paramKey="hypoSpeed"
                            heading="Hypo-speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span v-if="data.calculations.bagSpeeds.hypoSpeedDrops">
                          which is
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.hypoSpeedDrops"
                            paramKey="hypoSpeedDrops"
                            heading="High-speed drop rate (for hypoglycaemia)"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                    </div>
                    <!--bag speed for severe-->
                    <div
                      v-else-if="data.calculations.severity.val === 'severe'"
                    >
                      <div class="mb-2">
                        <span class="bag-1-text">None of bag #1</span>
                      </div>
                      <div class="mb-2 d-flex flex-row flex-wrap gap-1">
                        <span class="bag-2-text"
                          >Bag #2 at high-speed:
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.highSpeed"
                            paramKey="highSpeed"
                            heading="High-speed bag rate"
                            unit="mL/hour"
                            :decimals="config.decimals.bagSpeed"
                        /></span>
                        <span v-if="data.calculations.bagSpeeds.highSpeedDrops">
                          which is
                          <ViewWorking
                            :param="data.calculations.bagSpeeds.highSpeedDrops"
                            paramKey="highSpeedDrops"
                            heading="High-speed drop rate"
                            unit=" drops/minute"
                            :decimals="config.decimals.drops"
                        /></span>
                      </div>
                    </div>
                    <!--error-->
                    <div class="text-danger" v-else>
                      Error generating fluid rate guidance.
                    </div>
                    <!--narrow screen glucose-->
                    <div class="d-block d-sm-none mt-2">
                      <i>Call clinician immediately</i>
                    </div>
                  </div>
                </div>
                <p class="mt-2">
                  * These patients are receiving insulin but no glucose at this
                  stage.
                </p>
                <p>
                  ** For standard severity DKA this high-speed rate is only
                  continued long enough to raise the glucose, then immediately
                  decrease the rate to standard-speed rate. If BGL decreases too
                  rapidly despite adjusting the fluid rates, insulin dose needs
                  to be decreased (see full guidelines).
                </p>
              </div>

          </div>

          <!--making up IV fluids guidance-->
          <div class="card border-info p-2 mb-2">
            <a
              class="btn text-black btn-sm btn-view-guidance"
              data-bs-toggle="collapse"
              href="#makingUpIVFluidsGuidance"
              role="button"
              aria-expanded="false"
              aria-controls="collapseMakingUpIVFluidsGuidance"
              @click="
                showGuidance.makingUpIVFluids = !showGuidance.makingUpIVFluids
              "
            >
              <span class="d-flex justify-content-center">
                {{ !showGuidance.makingUpIVFluids ? "Show" : "Hide" }} preparation of IV fluids for two-bag method guidance
                <img
                  alt="Guidance icon"
                  class="icon mx-2"
                  src="@/assets/images/guidance-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="makingUpIVFluidsGuidance">
              <!--IV fluid bags guidance-->
              <div class="card mb-2">
                <div class="card-header">Make IV fluid bag #1</div>
                <div class="card-body">
                  <ul>
                    <li>
                      Add 40 mmol/L KCl (use KCl 15%, 150 mg/mL = 2 mmol/mL (10
                      mL ampoule))
                    </li>
                  </ul>

                  <table
                    cellpadding="5"
                    cellspacing="0"
                    class="table table-bordered"
                  >
                    <thead>
                      <tr>
                        <th class="fw-normal">
                          <strong>RL</strong> (or NaCl 0.9%)
                        </th>
                        <th>Volume of KCl 15% to add</th>
                        <th>Final IV fluid bag #1</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1000 mL</td>
                        <td>20 mL (2 ampoules)</td>
                        <td rowspan="2">
                          RL + 40 mmol/L KCl<br />
                          (or NaCl 0.9% + 40 mmol/L KCl)
                        </td>
                      </tr>
                      <tr>
                        <td>500 mL</td>
                        <td>10 mL (1 ampoule)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card mb-2">
                <div class="card-header">Make IV fluid bag #2</div>
                <div class="card-body">
                  <ol>
                    <li>
                      Add glucose (dextrose) 50% (G50%) to a bag of Ringer
                      lactate (RL) to make G10%-RL (or G10%-NaCl 0.9%). Follow
                      instructions below.
                    </li>
                    <li>Add 40 mmol/L KCl.</li>
                  </ol>

                  <p><strong>1. Make G10%-RL</strong> (or G10%-NaCl 0.9%)</p>

                  <table
                    cellpadding="5"
                    cellspacing="0"
                    class="table table-bordered"
                  >
                    <thead>
                      <tr>
                        <th class="fw-normal">
                          <strong>RL</strong> (or NaCl 0.9%)
                        </th>
                        <th>Remove</th>
                        <th>Add</th>
                        <th>Intermediary solution</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1000 mL</td>
                        <td>200 mL</td>
                        <td>G50% 200 mL</td>
                        <td>1000 mL G10%-RL (or G10%-NaCl 0.9%)</td>
                      </tr>
                      <tr>
                        <td>500 mL</td>
                        <td>100 mL</td>
                        <td>G50% 100 mL</td>
                        <td>500 mL G10%-RL (or G10%-NaCl 0.9%)</td>
                      </tr>
                    </tbody>
                  </table>

                  <p>
                    <strong
                      >2. Add potassium to make final IV fluid bag #2</strong
                    >
                  </p>

                  <table
                    cellpadding="5"
                    cellspacing="0"
                    class="table table-bordered"
                  >
                    <thead>
                      <tr>
                        <th class="fw-normal">
                          <strong>G10%-RL</strong> (or G10%-NaCl 0.9%)
                        </th>

                        <th>Volume of KCl 15% to add</th>
                        <th>Final IV fluid bag #2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1000 mL</td>
                        <td>20 mL (2 ampoules)</td>
                        <td rowspan="2">
                          G10%-RL + 40 mmol/L KCl<br />
                          (or G10%-NaCl 0.9% + 40 mmol/L KCl)
                        </td>
                      </tr>
                      <tr>
                        <td>500 mL</td>
                        <td>10 mL (1 ampoule)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p>* RL = Ringer lactate, G = glucose, NaCl = sodium chloride, KCl =
              potassium chloride</p>
              <p>Start fluid replacement without potassium if no urine output and add potassium to fluids only once urine output confirmed.</p>
            </div>
          </div>
        </div>
      </div>

      <!--iv insulin rate-->
      <div
        class="card mb-4"
        v-if="data.inputs.syringePumpAvailable.val == 'true'"
      >
        <div class="card-header">
          <img
            alt="IV pump icon"
            class="icon"
            src="@/assets/images/infusion-pump-icon.svg"
            width="24"
            height="24"
          />
          IV insulin rate
        </div>
        <div class="card-body">
          <h3>
            <ViewWorking
              :param="data.calculations.insulinRate"
              paramKey="ivInsulinRate"
              heading="IV insulin rate"
              unit=" Units/hour"
              :decimals="config.decimals.ivInsulinRate"
            />
          </h3>
          <div class="mb-2">
            {{
              data.inputs.shockPresent
                ? "Once shock corrected, and one"
                : "One"
            }}
            hour after starting IV fluid replacement, start IV insulin at a
            rate of
            {{ data.calculations.insulinRate.val.toFixed(2) }} Units/hour.
          </div>

          <!--show guidance-->
          <div class="card border-info p-2">
            <a
              class="btn text-black btn-sm btn-view-guidance"
              data-bs-toggle="collapse"
              href="#ivInsulinRateGuidance"
              role="button"
              aria-expanded="false"
              aria-controls="collapseIvInsulinRateGuidance"
              @click="
                showGuidance.ivInsulinRate = !showGuidance.ivInsulinRate
              "
            >
              <span class="d-flex justify-content-center">
                {{ !showGuidance.ivInsulinRate ? "Show" : "Hide" }} making up
                IV insulin guidance
                <img
                  alt="Guidance icon"
                  class="icon mx-2"
                  src="@/assets/images/guidance-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="ivInsulinRateGuidance">
              <!--IV insulin guidance-->
              <div class="card mb-2">
                <div class="card-header">Making up IV insulin</div>
                <div class="card-body">
                  Add 50 IU of soluble insulin to 49.5 mL sodium chloride 0.9%
                  to make a total of 50 mL. Ensure insulin preparation is
                  double checked by two qualified healthcare professionals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--insulin dose-->
      <div class="card mb-4" v-else>
        <div class="card-header">
          <img
            alt="Syringe icon"
            class="icon"
            src="@/assets/images/syringe-icon.svg"
            width="24"
            height="24"
          />
          IM insulin dose
        </div>
        <div class="card-body">
          <div>
            <div class="card border-danger mb-3">
              <div class="card-body d-flex flex-row align-items-center">
                <font-awesome-icon
                  :icon="['fas', 'triangle-exclamation']"
                  size="2xl"
                  class="me-4"
                />
                <ul class="card-text m-0">
                  <li>
                    IM (intramuscular) insulin dosing guidance is currently
                    unavailable pending review.
                  </li>
                  <li>
                    Please refer to MSF Paediatric Care written guidance
                    instead.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!--disabled IM insulin dosing panel pending further guidance-->
          <div hidden>
            <h3>
              <ViewWorking
                :param="data.calculations.insulinDose"
                paramKey="imInsulinDose"
                heading="IM insulin dose"
                unit=" Units 2-hourly"
                :decimals="config.decimals.imInsulinDose"
              />
            </h3>
            <div class="mb-2">
              Administer IM (intramuscular) insulin
              {{ data.calculations.insulinDose.val.toFixed(1) }} Units every 2
              hours.
            </div>

            <div class="card border-danger mb-3">
              <div class="card-body d-flex flex-row align-items-center">
                <font-awesome-icon
                  :icon="['fas', 'triangle-exclamation']"
                  size="2xl"
                  class="me-4"
                />
                <ul class="card-text m-0">
                  <li>
                    IV (intravenous) route must not be used for bolus insulin
                    as rapid hypoglycaemia will occur
                  </li>
                  <li>
                    SC (subcutaneous) route must not be used due to unreliable
                    absorption during DKA
                  </li>
                </ul>
              </div>
            </div>

            <!--show guidance-->
            <div class="card border-info p-2">
              <a
                class="btn text-black btn-sm btn-view-guidance"
                data-bs-toggle="collapse"
                href="#imInsulinDoseGuidance"
                role="button"
                aria-expanded="false"
                aria-controls="collapseImInsulinDoseGuidance"
                @click="
                  showGuidance.imInsulinDose = !showGuidance.imInsulinDose
                "
              >
                <span class="d-flex justify-content-center">
                  {{ !showGuidance.imInsulinDose ? "Show" : "Hide" }} making
                  up IM insulin guidance
                  <img
                    alt="Guidance icon"
                    class="icon mx-2"
                    src="@/assets/images/guidance-icon.svg"
                    width="24"
                    height="24"
                  />
                </span>
              </a>
              <div class="collapse" id="imInsulinDoseGuidance">
                <!--IM insuling guidance-->
                <div class="card mb-2">
                  <div class="card-header">Making up IM insulin</div>
                  <div class="card-body">To do</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Feedback />
    </div>
    <div class="d-flex flex-row justify-content-evenly">
      <!--back-->
      <button
        type="button"
        @click="router.push('/form-clinical-details')"
        class="btn btn-lg btn-secondary"
      >
        Back to form
      </button>
      <!--reset-->
      <div class="text-center">
        <button
          type="button"
          @click="resetForm"
          class="btn btn-lg btn-secondary"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 950px;
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
  padding: 10px;
}
.bag-1-text {
  color: #6610f2;
}
.bag-2-text {
  color: #ff1a1a;
}
</style>
