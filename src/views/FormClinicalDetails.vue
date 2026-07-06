/** * @component FormClinicalDetails * @description Step 3 of the episode form
flow — collects the patient's clinical * observations at the time of DKA
assessment. * * Fields collected (some conditional on earlier equipment/blood
gas choices): * * - glucose — blood glucose reading. Accepts a numeric value
with a * selectable unit (mmol/L or mg/dL). A "reads high/hi" toggle * disables
the numeric input and signals an unquantifiable * hyperglycaemia to the
calculator. * * - bloodKetones — shown when bloodKetonesAvailable === 'true'.
Numeric * input in mmol/L. * * - urineKetones — shown when bloodKetonesAvailable
!== 'true'. Button-group * picker for dipstick result (-, +, ++, +++, ++++). * *
- diagnosticFeatures — yes/no: whether clinical diagnostic features of DKA * are
present. * * - pH — shown only when bloodGasAvailable === 'true'. * * -
bicarbonate — shown only when bloodGasAvailable === 'true' AND pH is * at or
above the configured diagnostic threshold (i.e. not * severely acidotic). Fades
in via Vue transition. * * - shockPresent — yes/no. When shock is present, GCS
and respiratory support * inputs are hidden (assumed to be in shock protocol). *
* - gcs — shown only when shockPresent === 'false'. Links to the * GCS reference
page in a new tab. * * - respiratorySupport — shown only when shockPresent ===
'false', GCS is above * the severe threshold, and pH (if available) is not
severely * acidotic. Controls whether respiratory support is factored * into the
severity classification. * * Guard: if form step 1 is not valid (patient details
incomplete), redirects to * FormEquipmentAvailability. Note: this guard checks
step 1 rather than step 2, * which may be a bug — step 2 (equipment) is the
immediately preceding step. * * Form flow: Disclaimer → PatientDetails →
(OverrideConfirm?) → EquipmentAvailability * → **ClinicalDetails** → Generate →
Guidance * * @requires config — application configuration injected from App.vue.
* @requires data — global reactive data store from assets/data.js. * @requires
router — Vue Router instance for programmatic navigation. * @requires Swal —
SweetAlert2 for the reset confirmation dialog. */
<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";
import Swal from "sweetalert2";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");

/**
 * @type {import('vue').Ref<boolean>}
 * Controls whether validation error messages are displayed beneath each field.
 * Set to true on the first "Continue" attempt; errors remain visible thereafter.
 */
const showErrors = ref(false);

/**
 * Handles the "Continue" button click.
 *
 * Enables error display, applies Bootstrap's `was-validated` class to the form,
 * and navigates to the Generate view if all step-3 inputs are valid.
 */
const continueClick = () => {
  showErrors.value = true;
  document
    .getElementById("form-clinical-details")
    .classList.add("was-validated");

  if (data.value.form.isValid(3)) {
    router.push("/generate");
  }
};

/**
 * Prompts the user for confirmation then resets the entire form to its default state.
 *
 * Uses a SweetAlert2 dialog to prevent accidental data loss.
 * On confirmation: clears all input values, hides errors, and removes Bootstrap
 * validation styling.
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
      showErrors.value = false;
      document
        .getElementById("form-patient-details")
        .classList.remove("was-validated");
    }
  });
};

// Guard: redirect if patient details (step 1) are not complete
if (!data.value.form.isValid(1)) router.push("/form-equipment-availability");

/** Scroll to top on mount so the heading is visible immediately. */
onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <form id="form-clinical-details" class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Clinical details</h2>

    <!--
      Glucose.
      Accepts a numeric value with a user-selectable unit (mmol/L or mg/dL).
      The unit selector is driven by config.validation.glucose.units so new
      units can be added centrally. A toggle disables the number input and
      flags a "reads high/hi" result instead.
    -->
    <div class="mb-4 flex-grow-1">
      <div class="input-group">
        <div class="form-floating">
          <input
            type="number"
            class="form-control"
            id="glucose"
            v-model="data.inputs.glucose.val"
            @change="data.inputs.glucose.isValid()"
            placeholder="x"
            :min="data.inputs.glucose.min()"
            :max="data.inputs.glucose.max()"
            :step="data.inputs.glucose.step"
            autocomplete="off"
            :disabled="data.inputs.glucose.high.val"
            required
          />
          <label for="glucose">{{ data.inputs.glucose.label }}</label>
        </div>
        <!-- Unit selector: width is auto so it doesn't stretch the input group -->
        <select
          class="form-select w-auto glucose-unit-select"
          id="glucoseUnitSelect"
          v-model="data.inputs.glucose.unit"
          @change="data.inputs.glucose.unitChange()"
          :disabled="data.inputs.glucose.high.val"
        >
          <option
            v-for="(unit, unitKey) in config.validation.glucose.units"
            :key="unitKey"
            :value="unitKey"
            :selected="unit.default === true"
          >
            {{ unitKey }}
          </option>
        </select>
        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#glucoseInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <!-- "Reads high/hi" toggle: disables numeric input and flags the value in the payload -->
      <div class="form-check form-switch mt-1">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="glucoseHighSwitch"
          v-model="data.inputs.glucose.high.val"
          @change="data.inputs.glucose.high.change()"
        />
        <label class="form-check-label" for="glucoseHighSwitch"
          >Glucose reads 'high' or 'hi'</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="glucoseErrors"
      >
        {{ data.inputs.glucose.errors }}
      </div>
      <div
        class="collapse form-text mx-1"
        id="glucoseInfo"
        v-html="data.inputs.glucose.info"
      ></div>
    </div>

    <!--
      Ketones: mutually exclusive blood vs. urine input.
      Which is shown is determined by the bloodKetonesAvailable answer from FormEquipmentAvailability.
    -->

    <!-- Blood ketones — shown when a blood ketone meter is available -->
    <div class="mb-4" v-if="data.inputs.bloodKetonesAvailable.val === 'true'">
      <div class="input-group">
        <div class="form-floating">
          <input
            type="number"
            class="form-control"
            id="pH"
            v-model="data.inputs.bloodKetones.val"
            @change="data.inputs.bloodKetones.isValid()"
            placeholder="x"
            :min="data.inputs.bloodKetones.min()"
            :max="data.inputs.bloodKetones.max()"
            :step="data.inputs.bloodKetones.step"
            autocomplete="off"
            required
          />
          <label for="bloodKetones">{{ data.inputs.bloodKetones.label }}</label>
        </div>
        <span class="input-group-text">mmol/L</span>
        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#bloodKetonesInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="bloodKetonesErrors"
      >
        {{ data.inputs.bloodKetones.errors }}
      </div>
      <div
        class="collapse form-text mx-1"
        id="bloodKetonesInfo"
        v-html="data.inputs.bloodKetones.info"
      ></div>
    </div>

    <!--
      Urine ketones — shown when a blood ketone meter is NOT available.
      Button-group picker for dipstick result: -, +, ++, +++, ++++
      (values 0–4). The active selection is highlighted via `urineKetonesActive`.
    -->
    <div class="mb-4" v-else>
      <p class="text-center m-2">
        {{ data.inputs.urineKetones.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#urineKetonesInfo"
          class="ms-2"
        />
      </p>
      <div
        class="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2"
      >
        <button
          class="btn btn-outline-secondary btn-urineKetones"
          :class="{ urineKetonesActive: data.inputs.urineKetones.val === 0 }"
          type="button"
          @click="data.inputs.urineKetones.setVal(0)"
        >
          -
        </button>

        <button
          class="btn btn-outline-secondary btn-urineKetones"
          :class="{ urineKetonesActive: data.inputs.urineKetones.val === 1 }"
          type="button"
          @click="data.inputs.urineKetones.setVal(1)"
        >
          +
        </button>

        <button
          class="btn btn-outline-secondary btn-urineKetones"
          :class="{ urineKetonesActive: data.inputs.urineKetones.val === 2 }"
          type="button"
          @click="data.inputs.urineKetones.setVal(2)"
        >
          ++
        </button>

        <button
          class="btn btn-outline-secondary btn-urineKetones"
          :class="{ urineKetonesActive: data.inputs.urineKetones.val === 3 }"
          type="button"
          @click="data.inputs.urineKetones.setVal(3)"
        >
          +++
        </button>

        <button
          class="btn btn-outline-secondary btn-urineKetones"
          :class="{ urineKetonesActive: data.inputs.urineKetones.val === 4 }"
          type="button"
          @click="data.inputs.urineKetones.setVal(4)"
        >
          ++++
        </button>
      </div>
      <div
        v-if="showErrors"
        class="text-center form-text text-danger mx-1"
        id="urineKetonesErrors"
      >
        {{ data.inputs.urineKetones.errors }}
      </div>
      <div
        class="text-center collapse form-text mx-1"
        id="urineKetonesInfo"
        v-html="data.inputs.urineKetones.info"
      ></div>
    </div>

    <!-- Diagnostic features of DKA: yes/no -->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.diagnosticFeatures.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#diagnosticFeaturesInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <input
          type="radio"
          class="btn-check"
          name="diagnosticFeatures"
          id="diagnosticFeaturesTrue"
          value="true"
          v-model="data.inputs.diagnosticFeatures.val"
          @change="data.inputs.diagnosticFeatures.isValid()"
          autocomplete="off"
          required
        />
        <label class="btn btn-outline-secondary" for="diagnosticFeaturesTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="diagnosticFeatures"
          id="diagnosticFeaturesFalse"
          value="false"
          v-model="data.inputs.diagnosticFeatures.val"
          @change="data.inputs.diagnosticFeatures.isValid()"
          autocomplete="off"
        />
        <label class="btn btn-outline-secondary" for="diagnosticFeaturesFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="diagnosticFeaturesErrors"
      >
        {{ data.inputs.diagnosticFeatures.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="diagnosticFeaturesInfo"
      >
        {{ data.inputs.diagnosticFeatures.info }}
      </div>
    </div>

    <!--
      Blood gas inputs — only shown when bloodGasAvailable === 'true'.
      pH is always shown in this block.
      Bicarbonate is only shown (with a fade-in transition) when pH is at or
      above the diagnostic threshold configured in config.validation.pH.diagnosticThreshold,
      because at severely low pH values bicarbonate adds no additional discriminatory value.
    -->
    <div v-if="data.inputs.bloodGasAvailable.val === 'true'">
      <!-- pH -->
      <div class="mb-4">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="number"
              class="form-control"
              id="pH"
              v-model="data.inputs.pH.val"
              @change="data.inputs.pH.isValid()"
              placeholder="x"
              :min="data.inputs.pH.min()"
              :max="data.inputs.pH.max()"
              :step="data.inputs.pH.step"
              autocomplete="off"
              required
            />
            <label for="pH">{{ data.inputs.pH.label }}</label>
          </div>
          <span
            class="input-group-text"
            data-bs-toggle="collapse"
            data-bs-target="#pHInfo"
            ><font-awesome-icon :icon="['fas', 'circle-info']"
          /></span>
        </div>
        <div v-if="showErrors" class="form-text text-danger mx-1" id="pHErrors">
          {{ data.inputs.pH.errors }}
        </div>
        <div
          class="collapse form-text mx-1"
          id="pHInfo"
          v-html="data.inputs.pH.info"
        ></div>
      </div>

      <!-- Bicarbonate — fades in once pH is at or above the diagnostic threshold -->
      <transition>
        <div
          class="mb-4"
          v-if="data.inputs.pH.val >= config.validation.pH.diagnosticThreshold"
        >
          <div class="input-group">
            <div class="form-floating">
              <input
                type="number"
                class="form-control"
                id="bicarbonate"
                v-model="data.inputs.bicarbonate.val"
                @change="data.inputs.bicarbonate.isValid()"
                placeholder="x"
                :min="data.inputs.bicarbonate.min()"
                :max="data.inputs.bicarbonate.max()"
                :step="data.inputs.bicarbonate.step"
                autocomplete="off"
                required
              />
              <label for="bicarbonate">{{
                data.inputs.bicarbonate.label
              }}</label>
            </div>
            <span class="input-group-text">mmol/L</span>
            <span
              class="input-group-text"
              data-bs-toggle="collapse"
              data-bs-target="#bicarbonateInfo"
              ><font-awesome-icon :icon="['fas', 'circle-info']"
            /></span>
          </div>
          <div
            v-if="showErrors"
            class="form-text text-danger mx-1"
            id="bicarbonateErrors"
          >
            {{ data.inputs.bicarbonate.errors }}
          </div>
          <div
            class="collapse form-text mx-1"
            id="bicarbonateInfo"
            v-html="data.inputs.bicarbonate.info"
          ></div>
        </div>
      </transition>
    </div>

    <!-- Shock present: yes/no. When true, GCS and respiratory support are hidden. -->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.shockPresent.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#shockPresentInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <input
          type="radio"
          class="btn-check"
          name="shockPresent"
          id="shockPresentTrue"
          value="true"
          v-model="data.inputs.shockPresent.val"
          @change="data.inputs.shockPresent.isValid()"
          autocomplete="off"
          required
        />
        <label class="btn btn-outline-secondary" for="shockPresentTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="shockPresent"
          id="shockPresentFalse"
          value="false"
          v-model="data.inputs.shockPresent.val"
          @change="data.inputs.shockPresent.isValid()"
          autocomplete="off"
        />
        <label class="btn btn-outline-secondary" for="shockPresentFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="shockPresentErrors"
      >
        {{ data.inputs.shockPresent.errors }}
      </div>
      <div class="collapse form-text text-center mx-1" id="shockPresentInfo">
        {{ data.inputs.shockPresent.info }}
      </div>
    </div>

    <!--
      GCS — fades in when shockPresent === 'false'.
      Links to the GCS reference page in a new tab to help the user score correctly.
    -->
    <transition>
      <div class="mb-4" v-if="data.inputs.shockPresent.val === 'false'">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="number"
              class="form-control"
              id="gcs"
              v-model="data.inputs.gcs.val"
              @change="data.inputs.gcs.isValid()"
              placeholder="x"
              :min="data.inputs.gcs.min()"
              :max="data.inputs.gcs.max()"
              :step="data.inputs.gcs.step"
              autocomplete="off"
              required
            />
            <label for="gcs">{{ data.inputs.gcs.label }}</label>
          </div>
          <span
            class="input-group-text"
            data-bs-toggle="collapse"
            data-bs-target="#gcsInfo"
            ><font-awesome-icon :icon="['fas', 'circle-info']"
          /></span>
        </div>
        <div
          v-if="showErrors"
          class="form-text text-danger mx-1"
          id="gcsErrors"
        >
          {{ data.inputs.gcs.errors }}
        </div>
        <RouterLink to="/GCS" target="_blank" class="ms-1"
          >View GCS charts
          <font-awesome-icon
            :icon="['fas', 'up-right-from-square']" /></RouterLink
        >.
        <div
          class="collapse form-text mx-1"
          id="gcsInfo"
          v-html="data.inputs.gcs.info"
        ></div>
      </div>
    </transition>

    <!--
      Respiratory support — fades in only when:
        1. Shock is not present, AND
        2. GCS is above the severe threshold (patient not deeply unconscious), AND
        3. Either no blood gas is available, OR pH is at or above the severe threshold.
      This mirrors the clinical logic: severely unwell patients (low GCS or severe
      acidosis) are already classified as severe DKA and respiratory support is moot.
    -->
    <transition>
      <div
        class="mb-4 text-center"
        v-if="
          data.inputs.shockPresent.val === 'false' &&
          data.inputs.gcs.val > config.validation.gcs.severeThreshold &&
          (data.inputs.bloodGasAvailable.val === 'false' ||
            data.inputs.pH.val >= config.validation.pH.severeThreshold)
        "
      >
        <p class="m-2">
          {{ data.inputs.respiratorySupport.label }}
          <font-awesome-icon
            :icon="['fas', 'circle-info']"
            data-bs-toggle="collapse"
            data-bs-target="#respiratorySupportInfo"
            class="ms-2"
          />
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <input
            type="radio"
            class="btn-check"
            name="respiratorySupport"
            id="respiratorySupportTrue"
            value="true"
            v-model="data.inputs.respiratorySupport.val"
            @change="data.inputs.respiratorySupport.isValid()"
            autocomplete="off"
            required
          />
          <label class="btn btn-outline-secondary" for="respiratorySupportTrue"
            >Yes</label
          >

          <input
            type="radio"
            class="btn-check"
            name="respiratorySupport"
            id="respiratorySupportFalse"
            value="false"
            v-model="data.inputs.respiratorySupport.val"
            @change="data.inputs.respiratorySupport.isValid()"
            autocomplete="off"
          />
          <label class="btn btn-outline-secondary" for="respiratorySupportFalse"
            >No</label
          >
        </div>
        <div
          v-if="showErrors"
          class="form-text text-danger text-center mx-1"
          id="respiratorySupportErrors"
        >
          {{ data.inputs.respiratorySupport.errors }}
        </div>
        <div
          class="collapse form-text text-center mx-1"
          id="respiratorySupportInfo"
        >
          {{ data.inputs.respiratorySupport.info }}
        </div>
      </div>
    </transition>

    <!-- Navigation: Back / Reset / Continue -->
    <div class="d-flex flex-row justify-content-evenly">
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-equipment-availability')"
          class="btn btn-lg btn-secondary"
        >
          Back
        </button>
      </div>
      <div class="text-center">
        <button
          type="button"
          @click="resetForm"
          class="btn btn-lg btn-secondary"
        >
          Reset
        </button>
      </div>
      <div class="text-center">
        <button
          type="button"
          @click="continueClick"
          class="btn btn-lg btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.container {
  max-width: 750px;
}
/* Fixed width keeps all option buttons uniform */
.btn-outline-secondary {
  width: 200px;
  background-color: white;
}
.flex-wrap {
  column-gap: 20px;
}
/* Retained from earlier design — not currently used */
.insulin-rate-btn {
  height: 62px;
}
/* Fade-in transition for conditionally revealed fields (bicarbonate, GCS, etc.) */
.v-enter-active {
  transition: all 0.5s ease;
}
.v-enter-from {
  opacity: 0;
}
/* Active state for the selected urine ketones dipstick button */
.urineKetonesActive {
  background-color: #6c757d;
  color: white;
}
/*
 * Glucose unit select: overrides Bootstrap's flex-grow default so the dropdown
 * stays narrow and doesn't stretch to fill remaining input-group space.
 */
.input-group > .glucose-unit-select {
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  display: inline-block;
  padding-right: 2em;
}
</style>
