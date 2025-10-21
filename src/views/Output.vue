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
  imInsulinDose: false,
  showWorkingText: "Show calculation steps",
  hideWorkingText: "Hide calculation steps"
});

let showGuidance = ref({
  dkaSeverity: false,
  fluidBolus: false,
  fluidReplacement: false,
  ivInsulinRate: false,
  imInsulinDose: false,
});

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 mb-4">Calculations</h2>
    <div v-if="data.auditID">
      <!--auditID-->
      <div class="card mb-4">
        <div class="card-header">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.414 10.9785L14.9783 9.58613L12.0983 12.5559L11.0362 11.438L9.58625 12.8155L12.0835 15.4441L16.414 10.9785Z"
              fill="currentColor"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 4C6 2.89543 6.89543 2 8 2H16.1066L18.2531 4.34168L21 7.63795V17C21 18.1046 20.1046 19 19 19H8C6.89543 19 6 18.1046 6 17V4ZM14.6667 4H8V17H19V9H16.6667C15.5621 9 14.6667 8.10457 14.6667 7V4ZM16.6667 5.5708L16.7469 5.65832L17.865 7H16.6667V5.5708Z"
              fill="currentColor"
            />
            <path d="M5 5.5V6.5H3V5.5H5Z" fill="currentColor" />
            <path
              d="M16.4999 22H7.5C6.47412 22 5.36987 21.5464 4.52475 20.7985C3.66222 20.0351 3 18.9013 3 17.5V6.5H5V17.5C5 18.231 5.33778 18.8472 5.85025 19.3008C6.38013 19.7697 7.02588 20 7.5 20H16.4994L16.4999 22Z"
              fill="currentColor"
            />
            <path
              d="M16.4994 20H17.5V22H16.4999L16.4994 20Z"
              fill="currentColor"
            />
          </svg>
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.05941 19.2531C1.87003 19.5864 2.11078 20.0001 2.49414 20.0001H19.5258C19.9092 20.0001 20.1499 19.5864 19.9605 19.2531L17.6909 15.2585C17.5348 15.2761 17.3762 15.2851 17.2157 15.2851C16.4338 15.2851 15.7017 15.0723 15.0741 14.7014L16.9483 18.0001H5.07163L11.01 7.54859L12.9999 11.0509C13.004 10.0985 13.3239 9.22064 13.8603 8.51665L11.4447 4.2652C11.253 3.92788 10.7669 3.92787 10.5753 4.2652L2.05941 19.2531Z"
              fill="currentColor"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.4136 9.49039C14.9654 8.51326 16.0135 7.85356 17.2157 7.85356C18.9917 7.85356 20.4314 9.29331 20.4314 11.0693C20.4314 11.6231 20.2914 12.1442 20.0449 12.5992L21.9999 14.5542L20.7005 15.8535L18.7456 13.8985C18.2906 14.1451 17.7695 14.2851 17.2157 14.2851C17.1895 14.2851 17.1633 14.2848 17.1373 14.2842C16.0756 14.2588 15.1413 13.7188 14.5743 12.904C14.2122 12.3837 13.9999 11.7513 13.9999 11.0693M17.2157 12.4475C17.9768 12.4475 18.5938 11.8305 18.5938 11.0693C18.5938 10.3082 17.9768 9.69114 17.2157 9.69114C16.4545 9.69114 15.8375 10.3082 15.8375 11.0693C15.8375 11.8305 16.4545 12.4475 17.2157 12.4475Z"
              fill="currentColor"
            />
            <path
              d="M13.9999 11.0693C13.9999 10.4955 14.1502 9.95679 14.4136 9.49039L13.9999 11.0693Z"
              fill="currentColor"
            />
            <path
              d="M10.2499 16.9992V15.5H11.7499V16.9992H10.2499Z"
              fill="currentColor"
            />
            <path
              d="M10.9999 11.0002C10.5857 11.0002 10.2499 11.3359 10.2499 11.7502V14.2502C10.2499 14.6644 10.5857 15.0002 10.9999 15.0002C11.4141 15.0002 11.7499 14.6644 11.7499 14.2502V11.7502C11.7499 11.3359 11.4141 11.0002 10.9999 11.0002Z"
              fill="currentColor"
            />
          </svg>
          DKA severity
        </div>
        <div class="card-body">
          <h3>
            {{ capitalizeFirst(data.calculations.severity.val) }} ({{
              data.calculations.deficit.percentage.val
            }}% deficit)
          </h3>
          <div class="mb-2">
            Treat your patient as having
            {{ data.calculations.severity.val }} severity DKA with a deficit of
            {{ data.calculations.deficit.percentage.val }}%.
          </div>
          <div class="card border-info p-2">
            <a
              class="btn text-black btn-sm btn-view-working"
              data-bs-toggle="collapse"
              href="#dkaSeverityWorking"
              role="button"
              aria-expanded="false"
              aria-controls="collapseDkaSeverityWorking"
              @click="showWorking.dkaSeverity = !showWorking.dkaSeverity"
            >
              <span
                v-if="!showWorking.dkaSeverity"
                class="d-flex justify-content-center"
              >
                {{ showWorking.showWorkingText }}
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                {{ showWorking.hideWorkingText }}
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="dkaSeverityWorking">
              <!--severity-->
              <div class="card mb-2">
                <div class="card-header">Severity</div>
                <div class="card-body">
                  <span v-html="data.calculations.severity.working"></span>
                </div>
              </div>
              <!--deficit percentage-->
              <div class="card mb-2">
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
      </div>

      <!--fluid bolus-->
      <div class="card mb-4">
        <div class="card-header">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.3485 2.8667H16C17.6569 2.8667 19 4.20984 19 5.8667V16C19 17.3114 18.1586 18.4262 16.9863 18.8341C16.9953 18.8881 17 18.9435 17 19C17 19.5523 16.5523 20 16 20H15V22H13V20H11.2396C11.2396 20.5523 10.7919 21 10.2396 21H10C9.44772 21 9 20.5523 9 20H8C7.44772 20 7 19.5523 7 19C7 18.9435 7.00469 18.8881 7.0137 18.8341C5.84136 18.4262 5 17.3114 5 16V5.8667C5 4.20985 6.34315 2.8667 8 2.8667H9.6515C10.2793 2.33266 11.0937 2 12 2C12.9063 2 13.7207 2.33266 14.3485 2.8667ZM16 17H8C7.44772 17 7 16.5523 7 16V14.9901C7.23662 14.9793 7.50661 14.9586 7.80665 14.9226C8.96852 14.7832 10.5774 14.4149 12.4369 13.5117C13.9052 12.7985 15.1206 12.9484 15.9738 13.2556C16.4099 13.4126 16.757 13.6138 16.9924 13.7738C16.9949 13.7756 16.9975 13.7773 17 13.779V16C17 16.5523 16.5523 17 16 17ZM17 11.5108C16.8887 11.4634 16.7724 11.4174 16.6512 11.3738C15.3794 10.916 13.5948 10.7258 11.5631 11.7127C9.92258 12.5096 8.53148 12.8213 7.56835 12.9369C7.35803 12.9621 7.16796 12.978 7 12.9875V5.8667C7 5.31441 7.44772 4.8667 8 4.8667H10.5563C10.8445 4.34859 11.3831 4 12 4C12.6169 4 13.1556 4.34859 13.4437 4.8667H16C16.5523 4.8667 17 5.31441 17 5.8667V11.5108Z"
              fill="currentColor"
            />
          </svg>
          Fluid bolus
        </div>
        <div class="card-body">
          <h3>
            {{ data.calculations.bolus.volume.val.toFixed(0) }}mL over
            {{ data.calculations.bolus.duration.val * 60 }} minutes
          </h3>
          <div class="mb-2" v-if="data.inputs.shockPresent.val">
            Administer a fluid bolus of
            {{ data.calculations.bolus.volume.val.toFixed(0) }}mL Ringer lactate
            (or sodium chloride 0.9%) IV at
            {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour then
            reassess after. If signs of shock persist, repeat another bolus.
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
            {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour.
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
          <div class="card border-info p-2">
            <a
              class="btn text-black btn-sm btn-view-working"
              data-bs-toggle="collapse"
              href="#fluidBolusWorking"
              role="button"
              aria-expanded="false"
              aria-controls="collapseFluidBolusWorking"
              @click="showWorking.fluidBolus = !showWorking.fluidBolus"
            >
              <span
                v-if="!showWorking.fluidBolus"
                class="d-flex justify-content-center"
              >
                {{ showWorking.showWorkingText }}
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                {{ showWorking.hideWorkingText }}
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="fluidBolusWorking">
              <!--bolus volume-->
              <div class="card mb-2">
                <div class="card-header">Bolus volume</div>
                <div class="card-body">
                  <span v-html="data.calculations.bolus.volume.working"></span>
                </div>
              </div>
              <!--bolus duration-->
              <div class="card mb-2">
                <div class="card-header">Bolus duration/rate</div>
                <div class="card-body">
                  <span v-html="data.calculations.bolus.duration.working"></span>
                </div>
              </div>
              <!--bolus rate-->
              <div class="card mb-2">
                <div class="card-header">Bolus rate</div>
                <div class="card-body">
                  <span v-html="data.calculations.bolus.rate.working"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--fluid replacement-->
      <div class="card mb-4">
        <div class="card-header">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.3485 2.8667H16C17.6569 2.8667 19 4.20984 19 5.8667V16C19 17.3114 18.1586 18.4262 16.9863 18.8341C16.9953 18.8881 17 18.9435 17 19C17 19.5523 16.5523 20 16 20H15V22H13V20H11.2396C11.2396 20.5523 10.7919 21 10.2396 21H10C9.44772 21 9 20.5523 9 20H8C7.44772 20 7 19.5523 7 19C7 18.9435 7.00469 18.8881 7.0137 18.8341C5.84136 18.4262 5 17.3114 5 16V5.8667C5 4.20985 6.34315 2.8667 8 2.8667H9.6515C10.2793 2.33266 11.0937 2 12 2C12.9063 2 13.7207 2.33266 14.3485 2.8667ZM16 17H8C7.44772 17 7 16.5523 7 16V14.9901C7.23662 14.9793 7.50661 14.9586 7.80665 14.9226C8.96852 14.7832 10.5774 14.4149 12.4369 13.5117C13.9052 12.7985 15.1206 12.9484 15.9738 13.2556C16.4099 13.4126 16.757 13.6138 16.9924 13.7738C16.9949 13.7756 16.9975 13.7773 17 13.779V16C17 16.5523 16.5523 17 16 17ZM17 11.5108C16.8887 11.4634 16.7724 11.4174 16.6512 11.3738C15.3794 10.916 13.5948 10.7258 11.5631 11.7127C9.92258 12.5096 8.53148 12.8213 7.56835 12.9369C7.35803 12.9621 7.16796 12.978 7 12.9875V5.8667C7 5.31441 7.44772 4.8667 8 4.8667H10.5563C10.8445 4.34859 11.3831 4 12 4C12.6169 4 13.1556 4.34859 13.4437 4.8667H16C16.5523 4.8667 17 5.31441 17 5.8667V11.5108Z"
              fill="currentColor"
            />
          </svg>
          Fluid replacement
        </div>
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
                <td>
                  >{{
                    config.bagSpeedGlucoseThresholds[
                      data.inputs.glucose.unit
                    ][0]
                  }}
                  {{ data.inputs.glucose.unit }}
                </td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  Bag #1 at standard-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.standardSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                  None of bag #2*
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  Bag #1 at high-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.highSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                  None of bag #2*
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--high glucose-->
              <tr>
                <td>
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
                </td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  Bag #1 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(
                        1
                      )
                    }}mL/hr</strong
                  ><br />
                  Bag #2 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(
                        1
                      )
                    }}mL/hr</strong
                  ><br />
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  Bag #1 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                  Bag #2 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--moderate glucose-->
              <tr>
                <td>
                  {{
                    config.bagSpeedGlucoseThresholds[
                      data.inputs.glucose.unit
                    ][2]
                  }}
                  to <{{
                    config.bagSpeedGlucoseThresholds[
                      data.inputs.glucose.unit
                    ][1]
                  }}
                  {{ data.inputs.glucose.unit }}
                </td>
                <td v-if="data.calculations.severity.val === 'standard'">
                  None of bag #1<br />
                  Bag #2 at standard-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.standardSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  None of bag #1<br />
                  Bag #2 at high-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.highSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--low glucose-->
              <tr>
                <td>
                  <{{
                    config.bagSpeedGlucoseThresholds[
                      data.inputs.glucose.unit
                    ][2]
                  }}
                  {{ data.inputs.glucose.unit }}<br />
                  <i>Call clinician immediately</i>
                </td>
                <td>
                  None of bag #1<br />
                  Bag #2 at high-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1)
                    }}mL/hour**</strong
                  >
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
                  <strong
                    >>{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][0]
                    }}
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  Bag #1 at standard-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.standardSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                  None of bag #2*
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  <strong
                    >>{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][0]
                    }}
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  Bag #1 at high-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.highSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                  None of bag #2*
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--high glucose-->
              <tr>
                <td v-if="data.calculations.severity.val === 'standard'">
                  <strong
                    >{{
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
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  Bag #1 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(
                        1
                      )
                    }}mL/hr</strong
                  ><br />
                  Bag #2 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfStandardSpeed.val.toFixed(
                        1
                      )
                    }}mL/hr</strong
                  ><br />
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  <strong
                    >{{
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
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  Bag #1 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                  Bag #2 at half-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.halfHighSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--moderate glucose-->
              <tr>
                <td v-if="data.calculations.severity.val === 'standard'">
                  <strong
                    >{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][2]
                    }}
                    to <{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][1]
                    }}
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  None of bag #1<br />
                  Bag #2 at standard-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.standardSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                </td>
                <td v-else-if="data.calculations.severity.val === 'severe'">
                  <strong
                    >{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][2]
                    }}
                    to <{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][1]
                    }}
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  None of bag #1<br />
                  Bag #2 at high-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.highSpeed.val.toFixed(1)
                    }}mL/hr</strong
                  ><br />
                </td>
                <td class="text-danger" v-else>
                  Error generating fluid rate guidance.
                </td>
              </tr>
              <!--low glucose-->
              <tr>
                <td>
                  <strong
                    ><{{
                      config.bagSpeedGlucoseThresholds[
                        data.inputs.glucose.unit
                      ][2]
                    }}
                    {{ data.inputs.glucose.unit }}</strong
                  ><br />
                  None of bag #1<br />
                  Bag #2 at high-speed:
                  <strong
                    >{{
                      data.calculations.bagSpeeds.hypoSpeed.val.toFixed(1)
                    }}mL/hour**</strong
                  ><br />
                  <i>Call clinician immediately</i>
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            * These patients are receiving insulin but no glucose at this
            stage.<br />
            ** For standard severity DKA this high-speed rate is only continued
            long enough to raise the glucose, then immediately decrease the rate
            to standard-speed rate. If BGL decreases too rapidly despite
            adjusting the fluid rates, insulin dose needs to be decreased (see
            full guidelines).
          </p>

          <!--view working-->
          <div class="card border-info p-2 mb-3">
            <a
              class="btn text-black btn-sm btn-view-working"
              data-bs-toggle="collapse"
              href="#fluidReplacementWorking"
              role="button"
              aria-expanded="false"
              aria-controls="collapseFluidReplacementWorking"
              @click="
                showWorking.fluidReplacement = !showWorking.fluidReplacement
              "
            >
              <span
                v-if="!showWorking.fluidReplacement"
                class="d-flex justify-content-center"
              >
                {{ showWorking.showWorkingText }}
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                {{ showWorking.hideWorkingText }}
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="fluidReplacementWorking">
            <!--deficit volume-->
            <div class="card mb-2">
              <div class="card-header">Deficit volume</div>
              <div class="card-body">
                <span
                  v-html="
                    data.calculations.deficit.standardSpeedVolume.working ||
                    data.calculations.deficit.highSpeedVolume.working
                  "
                ></span>
              </div>
            </div>
            <!--deficit rate-->
            <div class="card mb-2">
              <div class="card-header">Deficit replacement rate</div>
              <div class="card-body">
                <span
                  v-html="
                    data.calculations.deficit.standardSpeedRate.working ||
                    data.calculations.deficit.highSpeedRate.working
                  "
                ></span>
              </div>
            </div>
            <!--maintenance volume-->
            <div class="card mb-2">
              <div class="card-header">Daily maintenance volume</div>
              <div class="card-body">
                <span
                  v-html="data.calculations.maintenance.volume.working"
                ></span>
              </div>
            </div>
            <!--maintenance rate-->
            <div class="card mb-2">
              <div class="card-header">Daily maintenance rate</div>
              <div class="card-body">
                <span
                  v-html="data.calculations.maintenance.rate.working"
                ></span>
              </div>
            </div>
            <div v-if="data.calculations.bagSpeeds.standardSpeed">
              <!--standard speed bag-->
              <div class="card mb-2">
                <div class="card-header">Standard speed bag</div>
                <div class="card-body">
                  <span
                    v-html="data.calculations.bagSpeeds.standardSpeed.working"
                  ></span>
                </div>
              </div>
              <!--half standard speed bag-->
              <div class="card mb-2">
                <div class="card-header">Half standard speed bag</div>
                <div class="card-body">
                  <span
                    v-html="
                      data.calculations.bagSpeeds.halfStandardSpeed.working
                    "
                  ></span>
                </div>
              </div>
              <!--hypo speed bag-->
              <div class="card mb-2">
                <div class="card-header">
                  High speed bag (for managing hypoglycaemia)
                </div>
                <div class="card-body">
                  <span
                    v-html="data.calculations.bagSpeeds.hypoSpeed.working"
                  ></span>
                </div>
              </div>
            </div>
            <div v-else-if="data.calculations.bagSpeeds.highSpeed">
              <!--high speed bag-->
              <div
                class="card mb-2"
                v-if="data.calculations.bagSpeeds.highSpeed"
              >
                <div class="card-header">High speed bag</div>
                <div class="card-body">
                  <span
                    v-html="data.calculations.bagSpeeds.highSpeed.working"
                  ></span>
                </div>
              </div>
              <!--half high speed bag-->
              <div class="card mb-2">
                <div class="card-header">Half high speed bag</div>
                <div class="card-body">
                  <span
                    v-html="data.calculations.bagSpeeds.halfHighSpeed.working"
                  ></span>
                </div>
              </div>
            </div>
          </div>
          </div>

          <!--show guidance-->
          <div class="card border-info p-2">
            <a
              class="btn text-black btn-sm btn-view-guidance"
              data-bs-toggle="collapse"
              href="#fluidReplacementGuidance"
              role="button"
              aria-expanded="false"
              aria-controls="collapseFluidReplacementGuidance"
              @click="showGuidance.fluidReplacement = !showGuidance.fluidReplacement"
            >
              <span
                v-if="!showGuidance.fluidReplacement"
                class="d-flex justify-content-center"
              >
                Show making up IV fluid bags guidance
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                Hide making up IV fluid bags guidance
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="fluidReplacementGuidance">
            <!--IV fluid bags guidance-->
            <div class="card mb-2">
              <div class="card-header">Making up IV fluid bags</div>
              <div class="card-body">
                To do
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!--iv insulin rate-->
      <div
        class="card mb-4"
        v-if="data.inputs.syringeDriverAvailable.val == 'true'"
      >
        <div class="card-header">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.1223 3.57541H10.9974C12.4686 3.57541 13.6612 4.76805 13.6612 6.23923V12.9659C13.6612 14.4371 12.4686 15.6297 10.9974 15.6297H10.6215C10.4988 16.0431 10.116 16.3445 9.66278 16.3445H9.48384V16.8918C9.50396 17.1605 9.57259 17.4248 9.68741 17.6743C9.82592 17.9753 10.0289 18.2487 10.2849 18.4791C10.5408 18.7094 10.8447 18.8922 11.1791 19.0168C11.5135 19.1415 11.8719 19.2057 12.2339 19.2057C12.5958 19.2057 12.9543 19.1415 13.2887 19.0168C13.6231 18.8922 13.9269 18.7094 14.1829 18.4791C14.4388 18.2487 14.6419 17.9753 14.7804 17.6743C14.8951 17.425 14.9637 17.1609 14.9839 16.8925V11C14.9839 10.606 15.0615 10.2159 15.2122 9.85195C15.363 9.48797 15.584 9.15726 15.8626 8.87868C16.1411 8.6001 16.4719 8.37913 16.8358 8.22836C17.1998 8.0776 17.5899 8 17.9839 8C18.3779 8 18.768 8.0776 19.1319 8.22836C19.4959 8.37913 19.8266 8.6001 20.1052 8.87868C20.3838 9.15725 20.6048 9.48797 20.7555 9.85195C20.9063 10.2159 20.9839 10.606 20.9839 11V12H18.9839V11L18.9851 11C18.9851 10.8685 18.9592 10.7383 18.9089 10.6169C18.8586 10.4954 18.7848 10.385 18.6919 10.292C18.5989 10.1991 18.4885 10.1253 18.367 10.075C18.2456 10.0247 18.1154 9.99878 17.9839 9.99878C17.8524 9.99878 17.7222 10.0247 17.6007 10.075C17.4793 10.1253 17.3689 10.1991 17.2759 10.292C17.1829 10.385 17.1092 10.4954 17.0589 10.6169C17.0086 10.7383 16.9827 10.8685 16.9827 11H16.9839V17H16.974C16.9406 17.4673 16.822 17.9272 16.6223 18.361C16.3836 18.8796 16.0337 19.3509 15.5926 19.7479C15.1516 20.1449 14.6279 20.4597 14.0516 20.6746C13.4753 20.8894 12.8577 21 12.2339 21C11.6101 21 10.9924 20.8894 10.4161 20.6746C9.83984 20.4597 9.31621 20.1449 8.87513 19.7479C8.43405 19.3509 8.08417 18.8796 7.84546 18.361C7.64581 17.9272 7.52719 17.4673 7.49372 17H7.48384V16.3445H6.99829C6.54509 16.3445 6.16231 16.0431 6.03954 15.6297H5.66382C4.19263 15.6297 3 14.4371 3 12.9659V6.23923C3 4.76805 4.19263 3.57541 5.66382 3.57541H6.53882C7.03904 3.21722 7.65424 3 8.33055 3C9.00686 3 9.62206 3.21722 10.1223 3.57541ZM9.29229 5.57541H10.9974C11.364 5.57541 11.6612 5.87262 11.6612 6.23923V9.62331C11.6219 9.60797 11.5818 9.59293 11.5409 9.57827C10.6245 9.2495 9.34162 9.11663 7.89487 9.81693C6.83847 10.3283 5.9479 10.5259 5.33917 10.5987C5.214 10.6137 5.1006 10.6234 5 10.6294V6.23923C5 5.87262 5.2972 5.57541 5.66382 5.57541H7.36881C7.56076 5.23144 7.91957 5 8.33055 5C8.74152 5 9.10034 5.23144 9.29229 5.57541ZM11.6398 11.8946C11.6396 11.8945 11.6395 11.8944 11.6612 11.8713V12.9659C11.6612 13.3325 11.364 13.6297 10.9974 13.6297H5.66382C5.2972 13.6297 5 13.3325 5 12.9659V12.632C5.16904 12.6247 5.36208 12.6102 5.57665 12.5846C6.38343 12.4881 7.49122 12.2343 8.76625 11.6171C9.65093 11.1889 10.3664 11.2817 10.8655 11.4608C11.1245 11.5537 11.3308 11.6729 11.4697 11.767C11.5384 11.8136 11.5885 11.8526 11.6178 11.8766C11.6324 11.8885 11.6417 11.8966 11.6454 11.8999L11.6466 11.9009L11.6439 11.8985L11.6417 11.8964L11.6398 11.8946Z"
              fill="currentColor"
            />
            <path
              d="M19.9837 13C19.9837 13 19.544 13.4697 19.1696 14.0972C18.8921 14.5625 18.6504 15.1145 18.6504 15.6263C18.6504 16.385 19.2473 17 19.9837 17C20.7201 17 21.3171 16.385 21.3171 15.6263C21.3171 15.1145 21.0754 14.5625 20.7978 14.0972C20.4234 13.4697 19.9837 13 19.9837 13Z"
              fill="currentColor"
            />
          </svg>
          IV insulin rate
        </div>
        <div class="card-body">
          <h3>{{ data.calculations.insulinRate.val.toFixed(2) }} Units/hour</h3>
          <div class="mb-2">
            {{
              data.inputs.shockPresent ? "Once shock corrected, and one" : "One"
            }}
            hour after starting IV fluid replacement, start IV insulin at a rate
            of {{ data.calculations.insulinRate.val.toFixed(2) }} Units/hour.
          </div>
          <!--show working-->
          <div class="card border-info p-2 mb-3">
            <a
              class="btn text-black btn-sm btn-view-working"
              data-bs-toggle="collapse"
              href="#insulinRateWorking"
              role="button"
              aria-expanded="false"
              aria-controls="collapseInsulinRateWorking"
              @click="showWorking.insulinRate = !showWorking.insulinRate"
            >
              <span
                v-if="!showWorking.insulinRate"
                class="d-flex justify-content-center"
              >
                {{ showWorking.showWorkingText }}
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                {{ showWorking.hideWorkingText }}
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="insulinRateWorking">
            <!--iv insulin rate-->
            <div class="card mb-2">
              <div class="card-header">Insulin rate</div>
              <div class="card-body">
                <span v-html="data.calculations.insulinRate.working"></span>
              </div>
            </div>
          </div>
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
              @click="showGuidance.ivInsulinRate = !showGuidance.ivInsulinRate"
            >
              <span
                v-if="!showGuidance.ivInsulinRate"
                class="d-flex justify-content-center"
              >
                Show making up IV insulin guidance
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                Hide making up IV insulin guidance
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
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
                To do
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!--insulin dose-->
      <div class="card mb-4" v-else>
        <div class="card-header">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.20711 3.70711C7.59763 3.31658 7.59763 2.68342 7.20711 2.29289C6.81658 1.90237 6.18342 1.90237 5.79289 2.29289L2.29289 5.79289C1.90237 6.18342 1.90237 6.81658 2.29289 7.20711C2.68342 7.59763 3.31658 7.59763 3.70711 7.20711L3.75 7.16421L6.58579 10L4.29289 12.2929L5.70711 13.7071L7 12.4142L13.7322 19.1464C14.7085 20.1228 16.2915 20.1228 17.2678 19.1464L17.6768 18.7374L19.4697 20.5303L20.5303 19.4697L18.7374 17.6768L19.1464 17.2678C20.1228 16.2915 20.1228 14.7085 19.1464 13.7322L12.4142 7L13.7071 5.70711L12.2929 4.29289L10 6.58579L7.16421 3.75L7.20711 3.70711ZM5.75 5.16421L5.16421 5.75L8 8.58579L8.58579 8L5.75 5.16421ZM11 8.41421L8.41421 11L10.4268 13.0126L11.4697 11.9697C11.7626 11.6768 12.2374 11.6768 12.5303 11.9697C12.8232 12.2626 12.8232 12.7374 12.5303 13.0303L11.4874 14.0732L12.9268 15.5126L13.9697 14.4697C14.2626 14.1768 14.7374 14.1768 15.0303 14.4697C15.3232 14.7626 15.3232 15.2374 15.0303 15.5303L13.9874 16.5732L15.1464 17.7322C15.3417 17.9275 15.6583 17.9275 15.8536 17.7322L17.7322 15.8536C17.9275 15.6583 17.9275 15.3417 17.7322 15.1464L11 8.41421Z"
              fill="currentColor"
            />
          </svg>
          IM insulin dose
        </div>
        <div class="card-body">
          <h3>
            {{ data.calculations.insulinDose.val.toFixed(1) }} Units 2-hourly
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
              <p class="card-text">
                <ul class="m-0">
                  <li>
                    IV (intravenous) route must not be used for bolus insulin as rapid hypoglycaemia will occur
                  </li>
                  <li>
                    SC (subcutaneous) route must not be used due to unreliable absorption during DKA
                  </li>
                </ul>
              </p>
            </div>
          </div>

          <!--show working-->
          <div class="card border-info p-2 mb-3">
            <a
              class="btn text-black btn-sm btn-view-working"
              data-bs-toggle="collapse"
              href="#insulinDoseWorking"
              role="button"
              aria-expanded="false"
              aria-controls="collapseInsulinDoseWorking"
              @click="showWorking.insulinDose = !showWorking.insulinDose"
            >
              <span
                v-if="!showWorking.insulinDose"
                class="d-flex justify-content-center"
              >
                {{ showWorking.showWorkingText }}
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                {{ showWorking.hideWorkingText }}
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="insulinDoseWorking">
            <!--insulin dose-->
            <div class="card mb-2">
              <div class="card-header">Insulin dose</div>
              <div class="card-body">
                <span v-html="data.calculations.insulinDose.working"></span>
              </div>
            </div>
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
              @click="showGuidance.imInsulinDose = !showGuidance.imInsulinDose"
            >
              <span
                v-if="!showGuidance.imInsulinDose"
                class="d-flex justify-content-center"
              >
                Show making up IM insulin guidance
                <img
                  alt="Zoom in icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-in-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
              <span v-else class="d-flex justify-content-center">
                Hide making up IM insulin guidance
                <img
                  alt="Zoom out icon"
                  class="icon mx-2"
                  src="@/assets/images/zoom-out-icon.svg"
                  width="24"
                  height="24"
                />
              </span>
            </a>
            <div class="collapse" id="imInsulinDoseGuidance">
            <!--IM insuling guidance-->
            <div class="card mb-2">
              <div class="card-header">Making up IM insulin</div>
              <div class="card-body">
                To do
              </div>
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
.btn-view-working, .btn-view-guidance {
  min-width: 100%;
}
.btn-view-working:active, .btn-view-guidance:active {
  border-color: transparent;
}
</style>
