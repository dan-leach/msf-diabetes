<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";

import { inject } from "vue";
const config = inject("config");

// Reactive variable to control error display.
let showErrors = ref(false);

/**
 * Handles the 'Continue' button click event.
 * Shows validation errors and navigates to the next step if the form is valid.
 */
const continueClick = () => {
  showErrors.value = true;
  // Add validation class to the form
  document.getElementById("form-audit-details").classList.add("was-validated");

  // Check if the form is valid and navigate to the next route
  if (data.value.form.isValid(3)) {
    router.push("/generate-protocol");
  }
};

/**
 * Lifecycle hook that runs when the component is mounted.
 * Checks the validity of previous form steps and redirects if necessary.
 * Scrolls to the top of the page.
 */
onMounted(() => {
  if (!data.value.form.isValid(0)) {
    router.push("/form-disclaimer");
  } else if (!data.value.form.isValid(1)) {
    router.push("/form-patient-details");
  } else if (!data.value.form.isValid(2)) {
    router.push("/form-clinical-details");
  } else if (
    data.value.inputs.weight.limit.override &&
    !data.value.inputs.weight.limit.overrideConfirm
  ) {
    router.push("/form-override-confirm");
  } else {
    // Scroll to top
    window.scrollTo(0, 0);
  }
});
</script>

<template>
  <form id="form-audit-details" class="container my-4 needs-validation">
    <h2 class="display-3">Audit details</h2>
    <!--episodeType-->
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
    <!--operationalCentre-->
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
    <!--project-->
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

    <!--preExistingDiabetes-->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.preExistingDiabetes.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#preExistingDiabetesInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
          <input
            type="radio"
            class="btn-check"
            name="preExistingDiabetes"
            id="preExistingDiabetesTrue"
            value="true"
            v-model="data.inputs.preExistingDiabetes.val"
            @change="data.inputs.preExistingDiabetes.isValid()"
            autocomplete="off"
            required
          />
          <label
            class="btn btn-outline-secondary me-2"
            for="preExistingDiabetesTrue"
            >Yes</label
          >

          <input
            type="radio"
            class="btn-check"
            name="preExistingDiabetes"
            id="preExistingDiabetesFalse"
            value="false"
            v-model="data.inputs.preExistingDiabetes.val"
            @change="data.inputs.preExistingDiabetes.isValid()"
            autocomplete="off"
          />
          <label
            class="btn btn-outline-secondary"
            for="preExistingDiabetesFalse"
            >No</label
          >
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="preExistingDiabetesErrors"
      >
        {{ data.inputs.preExistingDiabetes.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="preExistingDiabetesInfo"
      >
        {{ data.inputs.preExistingDiabetes.info }}
      </div>
    </div>
    <!--underFollowUp-->
    <transition>
      <div class="mb-4" v-if="data.inputs.preExistingDiabetes.val == 'true'">
        <p class="text-center m-2">
          {{ data.inputs.underFollowUp.label }}
          <font-awesome-icon
            :icon="['fas', 'circle-info']"
            data-bs-toggle="collapse"
            data-bs-target="#underFollowUpInfo"
            class="ms-2"
          />
        </p>
        <div class="d-flex justify-content-center">
          <div>
            <input
              type="radio"
              class="btn-check"
              name="underFollowUp"
              id="underFollowUpTrue"
              value="true"
              v-model="data.inputs.underFollowUp.val"
              @change="data.inputs.underFollowUp.isValid()"
              autocomplete="off"
              required
            />
            <label
              class="btn btn-outline-secondary me-2"
              for="underFollowUpTrue"
              >Yes</label
            >

            <input
              type="radio"
              class="btn-check"
              name="underFollowUp"
              id="underFollowUpFalse"
              value="false"
              v-model="data.inputs.underFollowUp.val"
              @change="data.inputs.underFollowUp.isValid()"
              autocomplete="off"
            />
            <label class="btn btn-outline-secondary" for="underFollowUpFalse"
              >No</label
            >
          </div>
        </div>
        <div
          v-if="showErrors"
          class="form-text text-danger text-center mx-1"
          id="underFollowUpErrors"
        >
          {{ data.inputs.underFollowUp.errors }}
        </div>
        <div class="collapse form-text text-center mx-1" id="underFollowUpInfo">
          {{ data.inputs.underFollowUp.info }}
        </div>
      </div>
    </transition>
    <div class="d-flex flex-row justify-content-evenly">
      <!--back-->
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-clinical-details')"
          class="btn btn-lg btn-secondary"
        >
          Back
        </button>
      </div>
      <!--next-->
      <div class="text-center">
        <button
          type="button"
          @click="continueClick"
          class="btn btn-lg btn-primary"
        >
          Generate protocol
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.container {
  max-width: 750px;
}
.btn-outline-secondary {
  width: 150px;
  background-color: white;
}
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
.v-enter-active {
  transition: all 0.5s ease;
}
.v-enter-from {
  opacity: 0;
}
</style>
