/**
 * @component FormPatientDetails
 * @description Step 1 of the episode form flow — collects patient demographics
 * and operational context.
 *
 * Fields collected:
 *   - episodeType        — real patient episode or test/training episode.
 *   - patientDOB        — date of birth, or age expressed as years + months via a toggle.
 *   - patientSex        — male or female (used with weight to look up age-appropriate limits).
 *   - weight            — patient weight in kg. Min/max are computed dynamically from
 *                         the patient's age and sex. If the entered weight exceeds the
 *                         ±2 SD range, an override checkbox is shown; enabling it routes
 *                         the user through FormOverrideConfirm before proceeding.
 *   - operationalCentre — selected from config.operationalCentres.
 *   - project           — filtered by the selected operational centre; shown only after
 *                         an operational centre has been chosen (fade-in transition).
 *
 * Guard: if form step 0 (legal agreement) is not complete, the current implementation
 * calls `data.value.form.joeBloggs()` to pre-fill test data instead of redirecting.
 * (The redirect to `/form-disclaimer` is currently commented out during development.)
 *
 * Navigation after "Continue":
 *   - → `/form-override-confirm` if weight.limit.override is set.
 *   - → `/form-equipment-availability` otherwise.
 *
 * Form flow: Disclaimer → **PatientDetails** → (OverrideConfirm?) → EquipmentAvailability
 *            → ClinicalDetails → Generate → Guidance
 *
 * @requires config — application configuration injected from App.vue.
 * @requires data   — global reactive data store from assets/data.js.
 * @requires router — Vue Router instance for programmatic navigation.
 * @requires Swal   — SweetAlert2 for the reset confirmation dialog.
 */
<script setup>
import { ref, onMounted, inject } from "vue";
import { data } from "../assets/data.js";
import router from "../router";
import Swal from "sweetalert2";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");

/**
 * @type {import('vue').Ref<boolean>}
 * Controls whether validation error messages are displayed beneath each field.
 * Set to true on the first "Continue" attempt; errors remain visible thereafter.
 */
let showErrors = ref(false);

/**
 * Handles the "Continue" button click.
 *
 * Enables error display, applies Bootstrap's `was-validated` class to the form,
 * and navigates to the next step if all step-1 inputs are valid.
 * If a weight limit override is pending, routes to FormOverrideConfirm;
 * otherwise routes directly to FormEquipmentAvailability.
 */
const continueClick = () => {
  showErrors.value = true;
  document
    .getElementById("form-patient-details")
    .classList.add("was-validated");
  if (data.value.form.isValid(1)) {
    const nextRoute = data.value.inputs.weight.limit.override
      ? "/form-override-confirm"
      : "/form-equipment-availability";
    router.push(nextRoute);
  }
};

/**
 * Prompts the user for confirmation then resets the entire form to its default state.
 *
 * Uses a SweetAlert2 dialog to prevent accidental data loss.
 * On confirmation: clears all input values, hides errors, removes Bootstrap
 * validation styling, and navigates back to the start page.
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
      router.push("/");
    }
  });
};

/**
 * Sets the `min` and `max` attributes on the date-of-birth input element.
 *
 * - `max` is set to today's date so future dates cannot be selected.
 * - `min` is set via `data.inputs.patientDOB.minDate()` which returns the
 *   earliest date the calculator supports (based on the configured maximum age).
 *
 * Called on mount after the DOM is ready, because the input element must exist
 * before its attributes can be set imperatively.
 */
const setMinMaxPatientDOB = () => {
  const today = new Date();
  document.getElementById("patientDOB").max = today
    .toISOString()
    .substring(0, 10);
  document.getElementById("patientDOB").min = data.value.inputs.patientDOB
    .minDate()
    .toISOString()
    .substring(0, 10);
};

// Guard: if the legal agreement step has not been completed, pre-fill with test
// data for development convenience. In production this would redirect to /form-disclaimer.
if (!data.value.form.isValid(0)) {
  //router.push("/form-disclaimer");
  data.value.form.joeBloggs();
}

onMounted(() => {
  setMinMaxPatientDOB();
  window.scrollTo(0, 0);
});
</script>

<template>
  <form id="form-patient-details" class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Patient details</h2>
    <p class="mx-1">
      To calculate values for your patient please complete the form below. For
      more information about how this data is used refer to the
      <RouterLink to="/privacy-policy" target="_blank" class=""
        >privacy policy
        <font-awesome-icon
          :icon="['fas', 'up-right-from-square']" /></RouterLink
      >.
    </p>
    <p class="mx-1">
      For more information about each field click the
      <font-awesome-icon :icon="['fas', 'circle-info']" /> icon.
    </p>

    <!-- Episode type: real patient or test/training — affects audit logging server-side -->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.episodeType.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#episodeTypeInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
          <input
            type="radio"
            class="btn-check"
            name="episodeType"
            id="episodeTypeReal"
            value="real"
            v-model="data.inputs.episodeType.val"
            @change="data.inputs.episodeType.isValid()"
            autocomplete="off"
            required
          />
          <label
            class="btn btn-outline-secondary me-2 episode-type-btn py-3"
            for="episodeTypeReal"
            >For a real patient</label
          >

          <input
            type="radio"
            class="btn-check"
            name="episodeType"
            id="episodeTypeTest"
            value="test"
            v-model="data.inputs.episodeType.val"
            @change="data.inputs.episodeType.isValid()"
            autocomplete="off"
          />
          <label class="btn btn-outline-secondary" for="episodeTypeTest"
            >For testing or training purposes</label
          >
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="episodeTypeErrors"
      >
        {{ data.inputs.episodeType.errors }}
      </div>
      <div class="collapse form-text text-center mx-1" id="episodeTypeInfo">
        {{ data.inputs.episodeType.info }}
      </div>
    </div>

    <!--
      Patient date of birth.
      The user can enter either a full date of birth OR an age in years and months
      (toggled by the switch below the date field). The toggle disables the date
      input and shows two number fields (years / months) instead.
      min/max attributes are set imperatively in setMinMaxPatientDOB() on mount.
      An additional error link to adult DKA guidance is shown if the age exceeds
      the configured maximum paediatric age.
    -->
    <div class="mb-4">
      <div class="input-group">
        <div class="form-floating">
          <input
            type="date"
            class="form-control"
            id="patientDOB"
            v-model="data.inputs.patientDOB.val"
            @change="data.inputs.patientDOB.isValid()"
            placeholder="x"
            max=""
            min=""
            required
            autocomplete="off"
            :disabled="data.inputs.patientDOB.yearsMonths.switch.val"
          />
          <label for="patientDOB">{{ data.inputs.patientDOB.label }}</label>
        </div>
        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#patientDOBInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <!-- Toggle: switch between date-of-birth input and years/months inputs -->
      <div class="form-check form-switch mt-1">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="useYearsMonthsSwitch"
          v-model="data.inputs.patientDOB.yearsMonths.switch.val"
          @change="data.inputs.patientDOB.yearsMonths.switch.change()"
        />
        <label class="form-check-label" for="glucoseHighSwitch"
          >Use age in years and months instead of date of birth</label
        >
      </div>
      <!-- Years/months inputs — only shown when the toggle is on -->
      <div
        class="input-group"
        v-if="data.inputs.patientDOB.yearsMonths.switch.val"
      >
        <div class="form-floating">
          <input
            type="number"
            class="form-control"
            id="ageYears"
            v-model="data.inputs.patientDOB.yearsMonths.yearsVal"
            @change="data.inputs.patientDOB.isValid()"
            placeholder="x"
            max="19"
            min="0"
            required
            autocomplete="off"
          />
          <label for="ageYears">Years old</label>
        </div>
        <div class="form-floating">
          <input
            type="number"
            class="form-control"
            id="ageMonths"
            v-model="data.inputs.patientDOB.yearsMonths.monthsVal"
            @change="data.inputs.patientDOB.isValid()"
            placeholder="x"
            max="11"
            min="0"
            required
            autocomplete="off"
          />
          <label for="ageMonths">Months old</label>
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="patientDOBErrors"
      >
        {{ data.inputs.patientDOB.errors }}
      </div>
      <!-- Extra error: links to adult DKA guidance when the patient exceeds max paediatric age -->
      <div
        v-if="
          showErrors &&
          data.inputs.patientDOB.patientAge.val >=
            config.validation.patientAge.max
        "
        class="form-text text-danger mx-1"
        id="patientDOBErrors"
      >
        <a href="/msf-adult-dka-guidance.pdf" target="_blank">
          View adult DKA guidance.
        </a>
      </div>
      <div
        class="collapse form-text mx-1"
        id="patientDOBInfo"
        v-html="data.inputs.patientDOB.info"
      ></div>
    </div>

    <!-- Patient sex: used with age to compute weight-for-age centile limits -->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.patientSex.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#patientSexInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
          <input
            type="radio"
            class="btn-check"
            name="patientSex"
            id="male"
            value="male"
            v-model="data.inputs.patientSex.val"
            @change="data.inputs.patientSex.isValid()"
            autocomplete="off"
            required
          />
          <label class="btn btn-outline-secondary me-2" for="male">Male</label>

          <input
            type="radio"
            class="btn-check"
            name="patientSex"
            id="female"
            value="female"
            v-model="data.inputs.patientSex.val"
            @change="data.inputs.patientSex.isValid()"
            autocomplete="off"
          />
          <label class="btn btn-outline-secondary" for="female">Female</label>
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="patientSexErrors"
      >
        {{ data.inputs.patientSex.errors }}
      </div>
      <div class="collapse form-text text-center mx-1" id="patientSexInfo">
        {{ data.inputs.patientSex.info }}
      </div>
    </div>

    <!--
      Patient weight.
      min/max are computed dynamically from the patient's age and sex.
      If the weight exceeds the age-appropriate ±2 SD range, an override toggle
      appears. Enabling it sets weight.limit.override = true, which causes
      continueClick() to route to FormOverrideConfirm rather than directly to
      FormEquipmentAvailability. The override toggle is hidden when the weight
      exceeds the absolute maximum (weight.max()), as no override is possible.
    -->
    <div class="mb-4">
      <div class="input-group">
        <div class="form-floating">
          <input
            type="number"
            class="form-control"
            id="weight"
            v-model="data.inputs.weight.val"
            @change="data.inputs.weight.isValid()"
            placeholder="x"
            :min="data.inputs.weight.min()"
            :max="data.inputs.weight.max()"
            :step="data.inputs.weight.step"
            autocomplete="off"
            required
          />
          <label for="weight">{{ data.inputs.weight.label }}</label>
        </div>
        <span class="input-group-text">kg</span>
        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#weightInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <!-- Weight errors: shown on validation attempt or when the limit has already been exceeded -->
      <div
        v-if="showErrors || data.inputs.weight.limit.exceeded"
        class="form-text text-danger mx-1"
        id="weightErrors"
      >
        {{ data.inputs.weight.errors }}
      </div>
      <!-- Override toggle: shown when weight is outside the ±2 SD range but below the hard max -->
      <div
        class="form-check form-switch ms-1 my-1"
        v-if="
          data.inputs.weight.limit.exceeded &&
          data.inputs.weight.val < data.inputs.weight.max()
        "
      >
        <input
          class="form-check-input"
          type="checkbox"
          v-model="data.inputs.weight.limit.override"
          @change="data.inputs.weight.isValid()"
          id="weightLimitOverride"
        />
        <label class="form-check-label" for="weightLimitOverride">{{
          data.inputs.weight.limit.overrideLabel
        }}</label>
      </div>
      <div
        class="collapse form-text mx-1"
        id="weightInfo"
        v-html="data.inputs.weight.info"
      ></div>
    </div>

    <!-- Operational centre: populated from config.operationalCentres -->
    <div class="mb-4">
      <div class="input-group">
        <select
          name="operationalCentre"
          class="form-select"
          v-model="data.inputs.operationalCentre.val"
          @change="data.inputs.operationalCentre.isValid()"
          autocomplete="off"
          required
        >
          <option value="" disabled>
            {{ data.inputs.operationalCentre.label }}
          </option>
          <option
            v-for="operationalCentre in config.operationalCentres"
            :value="operationalCentre.name"
          >
            {{ operationalCentre.name }}
          </option>
          <option value="Other">Other</option>
        </select>

        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#operationalCentreInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="operationalCentreErrors"
      >
        {{ data.inputs.operationalCentre.errors }}
      </div>
      <div class="collapse form-text mx-1" id="operationalCentreInfo">
        {{ data.inputs.operationalCentre.info }}
      </div>
    </div>

    <!--
      Project: only shown (with a fade-in transition) once an operational centre
      has been selected. Options are filtered by the selected centre via
      data.inputs.project.options. Disabled until a centre is chosen.
    -->
    <transition>
      <div class="mb-4" v-if="data.inputs.operationalCentre.val">
        <div class="input-group">
          <select
            name="project"
            class="form-select"
            v-model="data.inputs.project.val"
            @change="data.inputs.project.isValid()"
            autocomplete="off"
            required
            :disabled="!data.inputs.operationalCentre.val"
          >
            <option value="" disabled>{{ data.inputs.project.label }}</option>
            <option
              v-for="projectOption in data.inputs.project.options"
              :value="projectOption"
            >
              {{ projectOption }}
            </option>
            <option value="Other">Other</option>
          </select>

          <span
            class="input-group-text"
            data-bs-toggle="collapse"
            data-bs-target="#projectInfo"
            ><font-awesome-icon :icon="['fas', 'circle-info']"
          /></span>
        </div>
        <div
          v-if="showErrors"
          class="form-text text-danger mx-1"
          id="projectErrors"
        >
          {{ data.inputs.project.errors }}
        </div>
        <div class="collapse form-text mx-1" id="projectInfo">
          {{ data.inputs.project.info }}
        </div>
      </div>
    </transition>

    <!-- Navigation: Back / Reset / Continue -->
    <div class="d-flex flex-row justify-content-evenly">
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-disclaimer')"
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
  width: 150px;
  background-color: white;
}
/* Taller button for episode type options to accommodate two-line labels */
.episode-type-btn {
  height: 62px;
}
/* Fade-in transition for the project dropdown when operational centre is selected */
.v-enter-active {
  transition: all 0.5s ease;
}
.v-enter-from {
  opacity: 0;
}
</style>
