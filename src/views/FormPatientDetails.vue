<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";
import { inject } from "vue";
const config = inject("config");

// Reactive variable to control error display.
let showErrors = ref(false);

/**
 * Function to handle the 'Continue' button click event.
 * Validates the patient details form and navigates to the clinical details form if valid.
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
 * Sets the minimum and maximum allowed dates for the patient date of birth input field.
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
    <h2 class="display-3">Patient details</h2>
    <p class="mx-1">
      To calculate values for your patient please complete the form below. For
      more information about how this data is used click the
      <font-awesome-icon :icon="['fas', 'circle-info']" /> icon by each field or
      refer to the
      <RouterLink to="/privacy-policy" target="_blank" class=""
        >privacy policy</RouterLink
      >.
    </p>
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
    <!--patientName-->
    <div class="mb-4">
      <div class="input-group">
        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            id="patientName"
            v-model="data.inputs.patientName.val"
            @change="data.inputs.patientName.isValid()"
            placeholder="x"
            :minlength="data.inputs.patientName.minLength"
            :maxlength="data.inputs.patientName.maxLength"
            required
            autocomplete="off"
          />
          <label for="patientName">{{ data.inputs.patientName.label }}</label>
        </div>
        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#patientNameInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="patientNameErrors"
      >
        {{ data.inputs.patientName.errors }}
      </div>
      <div class="collapse form-text mx-1" id="patientNameInfo">
        {{ data.inputs.patientName.info }}
      </div>
    </div>
    <!--patientDOB-->
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
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="patientDOBErrors"
      >
        {{ data.inputs.patientDOB.errors }}
      </div>
      <div
        class="collapse form-text mx-1"
        id="patientDOBInfo"
        v-html="data.inputs.patientDOB.info"
      ></div>
    </div>
    <!--patientSex-->
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
    <!--weight-->
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
      <div
        v-if="showErrors || data.inputs.weight.limit.exceeded"
        class="form-text text-danger mx-1"
        id="weightErrors"
      >
        {{ data.inputs.weight.errors }}
      </div>
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

    <div class="d-flex flex-row justify-content-evenly">
      <!--back-->
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-disclaimer')"
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
.btn-outline-secondary {
  width: 150px;
  background-color: white;
}
.episode-type-btn {
  height: 62px;
}
.v-enter-active {
  transition: all 0.5s ease;
}
.v-enter-from {
  opacity: 0;
}
</style>
