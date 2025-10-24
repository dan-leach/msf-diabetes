<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
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
  document
    .getElementById("form-equipment-availability")
    .classList.add("was-validated");

  // Check if the form is valid and navigate to the next route
  if (data.value.form.isValid(2)) {
    router.push("/form-clinical-details");
  }
};

if (!data.value.form.isValid(1)) {
  router.push("/form-patient-details");
} else if (
  data.value.inputs.weight.limit.override &&
  !data.value.inputs.weight.limit.overrideConfirm
) {
  router.push("/form-override-confirm");
}

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <form
    id="form-equipment-availability"
    class="container my-4 needs-validation"
  >
    <h2 class="display-3 text-center">Equipment availability</h2>
    <!--bloodGasAvailable-->
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
    <!--bloodKetonesAvailable-->
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
    <!--syringeDriverAvailable-->
    <div class="mb-4 text-center">
      <p class="m-2">
        {{ data.inputs.syringeDriverAvailable.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#syringeDriverAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center flex-wrap gap-2">
        <input
          type="radio"
          class="btn-check"
          name="syringeDriverAvailable"
          id="syringeDriverAvailableTrue"
          value="true"
          v-model="data.inputs.syringeDriverAvailable.val"
          @change="data.inputs.syringeDriverAvailable.isValid()"
          autocomplete="off"
          required
        />
        <label
          class="btn btn-outline-secondary"
          for="syringeDriverAvailableTrue"
          >Yes</label
        >

        <input
          type="radio"
          class="btn-check"
          name="syringeDriverAvailable"
          id="syringeDriverAvailableFalse"
          value="false"
          v-model="data.inputs.syringeDriverAvailable.val"
          @change="data.inputs.syringeDriverAvailable.isValid()"
          autocomplete="off"
        />
        <label
          class="btn btn-outline-secondary"
          for="syringeDriverAvailableFalse"
          >No</label
        >
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="syringeDriverAvailableErrors"
      >
        {{ data.inputs.syringeDriverAvailable.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="syringeDriverAvailableInfo"
      >
        {{ data.inputs.syringeDriverAvailable.info }}
      </div>
    </div>
    <!--infusionPumpAvailable-->
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
    <!--dropFactor-->
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

    <div class="d-flex flex-row justify-content-evenly">
      <!--back-->
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-patient-details')"
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
  width: 200px;
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
