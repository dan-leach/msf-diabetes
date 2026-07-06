/** * @component FormOverrideConfirm * @description Weight safety override
confirmation step in the episode form flow. * * This view is shown when the
patient weight entered in FormPatientDetails falls * outside the expected ±2 SD
range for age, or exceeds the configured maximum weight. * It presents the
clinician with three options: * * 1. Go back and review — returns to
FormPatientDetails to re-enter the weight. * 2. Use +2SD weight — automatically
sets weight to the upper age-appropriate limit * (shown only when the weight is
above the upper limit and the * upper limit is below the hard maximum cap). * 3.
Proceed with current weight — confirms the override and advances to *
FormEquipmentAvailability, with a `border-danger` warning. * * When the entered
weight is *below* the lower limit (< -2 SD for age), options 2 and 3 * are still
available but the text reflects the under-weight scenario. * * Guard: if form
step 1 is not valid, the user is redirected to FormPatientDetails. * * Form
flow: Disclaimer → PatientDetails → **OverrideConfirm** → EquipmentAvailability
* → ClinicalDetails → Generate → Guidance * * @requires config — application
configuration injected from App.vue. * @requires data — global reactive data
store from assets/data.js. * @requires router — Vue Router instance for
programmatic navigation. * @requires Swal — SweetAlert2 for confirmation toasts.
*/
<script setup>
import { onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";
import Swal from "sweetalert2";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");

/**
 * Handles the "Proceed with current weight" button click.
 *
 * Records that the clinician has explicitly confirmed the weight override and
 * navigates to the equipment availability step.
 */
const continueClick = () => {
  data.value.inputs.weight.limit.overrideConfirm = true;
  router.push("/form-equipment-availability");
};

/**
 * Handles the "Use +2SD weight instead" button click.
 *
 * Sets the patient weight to the upper age-appropriate limit (+2 SD above the
 * mean for age), navigates back to FormPatientDetails so the user can see the
 * updated value, then shows a brief success toast to confirm the change.
 *
 * A 1-second delay is used before updating the weight value to allow the router
 * navigation to complete and the PatientDetails form to mount, so the updated
 * value is reflected in the rendered input.
 *
 * @returns {Promise<void>}
 */
const use2SD = async () => {
  router.push("/form-patient-details");
  // Wait for FormPatientDetails to mount before updating the reactive value
  await new Promise((resolve) => setTimeout(resolve, 1000));
  data.value.inputs.weight.val = data.value.inputs.weight.limit.upper();
  data.value.inputs.weight.limit.overrideConfirm = false;
  data.value.inputs.weight.limit.override = false;
  data.value.inputs.weight.isValid();
  data.value.inputs.weight.limit.use2SD = true;
  Swal.fire({
    text: "Weight updated to use +2SD above the mean for age",
    icon: "success",
    toast: true,
    timer: 2000,
    showConfirmButton: false,
  });
};

// Guard: if step 1 of the form is not valid, redirect back to patient details
if (!data.value.form.isValid(1)) router.push("/form-patient-details");

/** Scroll to top on mount so the heading and warning are visible immediately. */
onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <form id="form-disclaimer" class="container my-4 needs-validation">
    <h2 class="display-3 text-danger text-center">
      You are overriding the weight safety range
    </h2>

    <!--
      Above-upper-limit scenario: weight exceeds +2SD for age (or hard cap).
      Lists the absolute calculation caps that apply even after override.
    -->
    <div v-if="data.inputs.weight.val > data.inputs.weight.limit.lower()">
      <p>
        You should only continue if you are sure {{ data.inputs.weight.val }}kg
        is the correct weight and you have considered using a maximum weight of
        the 98th centile weight for age.
      </p>
      <p>
        You can proceed with a weight that is outside the expected range,
        however the calculator has upper limits that cannot be overriden. These
        are based on a maximum weight of 75kg. Any calculated values that exceed
        this will be capped as follows:
      </p>
      <ul>
        <li>
          Daily maintenance volume is capped at 2600mL (Holliday-Segar formula
          for 75kg)
        </li>
        <li>
          Deficit volume is capped at 7500mL for patients with severe DKA (10%
          dehydration for 75kg)
        </li>
        <li>
          Deficit volume is capped at 5625mL for patients with standard severity
          DKA (7.5% dehydration for 75kg)
        </li>
        <li>Bolus volumes are capped at 750mL (10mL/kg for 75kg)</li>
        <li>
          IV insulin rate is capped at 7.5 Units/hour if insulin rate of 0.1
          Units/kg/hour is selected (0.1 Units/kg/hour for 75kg patient)
        </li>
        <li>
          IV insulin rate is capped at 3.75 Units/hour if insulin rate of 0.05
          Units/kg/hour is selected (0.05 Units/kg/hour for 75kg patient)
        </li>
        <li>
          IM insulin rate is capped at 15 Units if insulin dose of 0.2 Units/kg
          is selected (0.2 Units/kg for 75kg patient)
        </li>
        <li>
          IM insulin rate is capped at 7.5 Units if insulin dose of 0.2 Units/kg
          is selected (0.1 Units/kg for 75kg patient)
        </li>
      </ul>
      <p>
        <strong
          >Calculations will be based on {{ data.inputs.weight.val }}kg and only
          capped if they exceed the values above.</strong
        ><br />
        Bear in mind that these caps could still allow significantly excessive
        values especially if your patient is much smaller than 75kg.
      </p>
    </div>

    <!--
      Below-lower-limit scenario: weight is less than -2SD for age.
      Simpler message as there are no hard lower caps to enumerate.
    -->
    <p v-else mx-4>
      The weight you have entered is less than 2 standard deviations below the
      mean for age.
    </p>

    <p>Proceed if you are sure {{ data.inputs.weight.val }}kg is correct.</p>

    <div class="d-flex flex-row justify-content-evenly flex-wrap">
      <!-- Option 1: return to FormPatientDetails to re-enter the weight -->
      <div class="text-center mb-2">
        <button
          type="button"
          @click="router.push('/form-patient-details')"
          class="btn btn-lg btn-secondary"
        >
          Go back and review
        </button>
      </div>

      <!--
        Option 2: use the +2SD upper limit weight instead.
        Hidden when the upper limit equals the hard maximum (config.weightLimits.max),
        because in that case there is no meaningful alternative to offer.
        Also hidden in the below-lower-limit scenario.
      -->
      <div
        class="text-center mx-2 mb-2"
        v-if="
          data.inputs.weight.limit.upper() != config.weightLimits.max &&
          data.inputs.weight.val > data.inputs.weight.limit.lower()
        "
      >
        <button type="button" @click="use2SD" class="btn btn-lg btn-primary">
          Use weight of {{ data.inputs.weight.limit.upper().toFixed(2) }}kg<sup
            >*</sup
          >
          instead
        </button>
        <br /><small>* plus 2 standard deviations above mean for age</small>
      </div>

      <!--
        Option 3: proceed with the entered weight.
        Uses btn-danger to reinforce that this is a non-standard action.
        Button label changes when the weight meets or exceeds the hard cap to
        make clear that calculations will be capped.
      -->
      <div class="text-center mb-2">
        <button
          type="button"
          @click="continueClick"
          class="btn btn-lg btn-danger"
          v-html="
            data.inputs.weight.val >= config.weightLimits.max
              ? `Proceed with current weight<br /><small>(Calculations will be capped as above)</small>`
              : `Proceed with weight of ${data.inputs.weight.val}kg`
          "
        ></button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.container {
  max-width: 950px;
}
.btn-outline-secondary {
  width: 150px;
}
</style>
