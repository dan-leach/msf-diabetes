/**
 * @component FormEquipmentAvailability
 * @description Step 2 of the episode form flow — collects information about
 * available clinical equipment.
 *
 * The answers given here determine which clinical pathways and calculation
 * branches are available on the guidance page:
 *   - bloodGasAvailable    — unlocks pH and bicarbonate inputs on FormClinicalDetails.
 *   - bloodKetonesAvailable — selects blood vs. urine ketone input on FormClinicalDetails.
 *   - syringePumpAvailable  — determines IV insulin rate vs. IM insulin dose output.
 *   - infusionPumpAvailable — determines whether drop-rate calculations are required.
 *   - dropFactor            — only shown when infusionPumpAvailable is false; selects
 *                             the giving set to use for drop-rate calculations.
 *
 * Guards (run at setup time, before mount):
 *   - If form step 1 is invalid, redirects to FormPatientDetails.
 *   - If a weight override is pending but not yet confirmed, redirects to FormOverrideConfirm.
 *
 * Form flow: Disclaimer → PatientDetails → (OverrideConfirm?) → **EquipmentAvailability**
 *            → ClinicalDetails → Generate → Guidance
 *
 * @requires config  — application configuration injected from App.vue.
 * @requires data    — global reactive data store from assets/data.js.
 * @requires router  — Vue Router instance for programmatic navigation.
 * @requires Swal    — SweetAlert2 for the reset confirmation dialog.
 */
<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import Swal from "sweetalert2";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");

/**
 * @type {import('vue').Ref<boolean>}
 * Controls whether validation error messages are displayed.
 * Set to true on the first "Continue" attempt; errors then remain visible
 * for all subsequent interactions.
 */
let showErrors = ref(false);

/**
 * Handles the "Continue" button click.
 *
 * Enables error display, applies Bootstrap's `was-validated` styling to the form,
 * and navigates to FormClinicalDetails if all step-2 inputs are valid.
 */
const continueClick = () => {
  showErrors.value = true;
  // Apply Bootstrap validation styling to trigger native constraint feedback
  document
    .getElementById("form-equipment-availability")
    .classList.add("was-validated");

  if (data.value.form.isValid(2)) {
    router.push("/form-clinical-details");
  }
};

/**
 * Prompts the user for confirmation then resets the entire form to its default state.
 *
 * Uses a SweetAlert2 dialog to prevent accidental data loss.
 * On confirmation: clears all input values, hides error messages, and removes
 * Bootstrap validation styling from the patient details form element.
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

// Guard: redirect if form step 1 is incomplete
if (!data.value.form.isValid(1)) {
  router.push("/form-patient-details");
} else if (
  // Guard: redirect if a weight override was triggered but not yet confirmed
  data.value.inputs.weight.limit.override &&
  !data.value.inputs.weight.limit.overrideConfirm
) {
  router.push("/form-override-confirm");
}

/** Scroll to top on mount so the heading is visible immediately. */
onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <form
    id="form-equipment-availability"
    class="container my-4 needs-validation"
  >
    <h2 class="display-3 text-center">Equipment availability</h2>

    <!--
      Each equipment question follows the same pattern:
        - Radio button pair (Yes / No) bound to the input's `.val`
        - Inline info icon that toggles a Bootstrap collapse with the input's `.info` text
        - Conditional error text shown when showErrors is true and validation fails
    -->

    <!-- Blood gas analyser availability -->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.bloodGasAvailable.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#bloodGasAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center flex-wrap gap-2">
        <input
          type="radio"
          class="btn-check"
          name="bloodGasAvailable"
          id="bloodGasAvailableTrue"
          value="true"
          v-model="data.inputs.bloodGasAvailable.val"
          @change="data.inputs.bloodGasAvailable.isValid()"
          autocomplete="off"
          required
        />
        <label class="btn btn-outline-secondary" for="bloodGasAvailableTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="bloodGasAvailable"
          id="bloodGasAvailableFalse"
          value="false"
          v-model="data.inputs.bloodGasAvailable.val"
          @change="data.inputs.bloodGasAvailable.isValid()"
          autocomplete="off"
        />
        <label class="btn btn-outline-secondary" for="bloodGasAvailableFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="bloodGasAvailableErrors"
      >
        {{ data.inputs.bloodGasAvailable.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="bloodGasAvailableInfo"
      >
        {{ data.inputs.bloodGasAvailable.info }}
      </div>
    </div>

    <!-- Blood ketone meter availability -->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.bloodKetonesAvailable.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#bloodKetonesAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center flex-wrap gap-2">
        <input
          type="radio"
          class="btn-check"
          name="bloodKetonesAvailable"
          id="bloodKetonesAvailableTrue"
          value="true"
          v-model="data.inputs.bloodKetonesAvailable.val"
          @change="data.inputs.bloodKetonesAvailable.isValid()"
          autocomplete="off"
          required
        />
        <label class="btn btn-outline-secondary" for="bloodKetonesAvailableTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="bloodKetonesAvailable"
          id="bloodKetonesAvailableFalse"
          value="false"
          v-model="data.inputs.bloodKetonesAvailable.val"
          @change="data.inputs.bloodKetonesAvailable.isValid()"
          autocomplete="off"
        />
        <label
          class="btn btn-outline-secondary"
          for="bloodKetonesAvailableFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="bloodKetonesAvailableErrors"
      >
        {{ data.inputs.bloodKetonesAvailable.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="bloodKetonesAvailableInfo"
      >
        {{ data.inputs.bloodKetonesAvailable.info }}
      </div>
    </div>

    <!-- Syringe pump (driver) availability — determines IV vs. IM insulin route -->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.syringePumpAvailable.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#syringePumpAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center flex-wrap gap-2">
        <input
          type="radio"
          class="btn-check"
          name="syringePumpAvailable"
          id="syringePumpAvailableTrue"
          value="true"
          v-model="data.inputs.syringePumpAvailable.val"
          @change="data.inputs.syringePumpAvailable.isValid()"
          autocomplete="off"
          required
        />
        <label class="btn btn-outline-secondary" for="syringePumpAvailableTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="syringePumpAvailable"
          id="syringePumpAvailableFalse"
          value="false"
          v-model="data.inputs.syringePumpAvailable.val"
          @change="data.inputs.syringePumpAvailable.isValid()"
          autocomplete="off"
        />
        <label class="btn btn-outline-secondary" for="syringePumpAvailableFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="syringePumpAvailableErrors"
      >
        {{ data.inputs.syringePumpAvailable.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="syringePumpAvailableInfo"
      >
        {{ data.inputs.syringePumpAvailable.info }}
      </div>
    </div>

    <!-- Infusion pump availability — if No, drop-rate calculation is required -->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.infusionPumpAvailable.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#infusionPumpAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center flex-wrap gap-2">
        <input
          type="radio"
          class="btn-check"
          name="infusionPumpAvailable"
          id="infusionPumpAvailableTrue"
          value="true"
          v-model="data.inputs.infusionPumpAvailable.val"
          @change="data.inputs.infusionPumpAvailable.isValid()"
          autocomplete="off"
          required
        />
        <label class="btn btn-outline-secondary" for="infusionPumpAvailableTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="infusionPumpAvailable"
          id="infusionPumpAvailableFalse"
          value="false"
          v-model="data.inputs.infusionPumpAvailable.val"
          @change="data.inputs.infusionPumpAvailable.isValid()"
          autocomplete="off"
        />
        <label
          class="btn btn-outline-secondary"
          for="infusionPumpAvailableFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="infusionPumpAvailableErrors"
      >
        {{ data.inputs.infusionPumpAvailable.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="infusionPumpAvailableInfo"
      >
        {{ data.inputs.infusionPumpAvailable.info }}
      </div>
    </div>

    <!--
      Drop factor — only shown when infusion pump is NOT available.
      Options are driven by config.validation.dropFactor so new giving set types
      can be added centrally without modifying this template.
    -->
    <div
      class="mb-4 text-center"
      v-if="data.inputs.infusionPumpAvailable.val == 'false'"
    >
      <p class="m-2">
        {{ data.inputs.dropFactor.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#dropFactorInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center flex-wrap gap-2">
        <div v-for="dropFactor in config.validation.dropFactor">
          <input
            type="radio"
            class="btn-check"
            name="dropFactor"
            :id="'dropFactor' + dropFactor.drops"
            :value="dropFactor.drops"
            v-model="data.inputs.dropFactor.val"
            @change="data.inputs.dropFactor.isValid()"
            autocomplete="off"
            required
          />
          <label
            class="btn btn-outline-secondary"
            :for="'dropFactor' + dropFactor.drops"
            >{{ dropFactor.drops }} drops/mL<br />({{ dropFactor.type }})</label
          >
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="dropFactorErrors"
      >
        {{ data.inputs.dropFactor.errors }}
      </div>
      <div class="collapse form-text text-center mx-1" id="dropFactorInfo">
        {{ data.inputs.dropFactor.info }}
      </div>
    </div>

    <!-- Navigation: Back / Reset / Continue -->
    <div class="d-flex flex-row justify-content-evenly">
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-patient-details')"
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
/* Fixed width keeps all equipment option buttons uniform in size */
.btn-outline-secondary {
  width: 200px;
  background-color: white;
}
/* Retained from earlier iteration — not currently used but kept for future option buttons */
.episode-type-btn {
  height: 62px;
}
.preventable-factors-category-btn {
  height: 65px;
  width: 170px;
}
.preventable-factors-factor-btn {
  font-size: smaller;
  width: 170px;
}
/* Fade-in transition for conditionally rendered elements (e.g. dropFactor) */
.v-enter-active {
  transition: all 0.5s ease;
}
.v-enter-from {
  opacity: 0;
}
</style>
