<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";
import { inject } from "vue";
const config = inject("config");

// Reactive variable to control error display.
const showErrors = ref(false);

/**
 * Handle continue button click event
 * Show validation errors and navigate based on form validity
 */
const continueClick = () => {
  showErrors.value = true;
  document
    .getElementById("form-clinical-details")
    .classList.add("was-validated");

  if (data.value.form.isValid(3)) {
    router.push("/calculate");
  }
};

if (!data.value.form.isValid(1)) router.push("/form-equipment-availability");

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <form id="form-clinical-details" class="container my-4 needs-validation">
    <h2 class="display-3">Clinical details</h2>
    <!--glucose-->
    <div class="mb-1 flex-grow-1">
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
            required
          />
          <label for="glucose">{{ data.inputs.glucose.label }}</label>
        </div>
        <select
          class="form-select w-auto glucose-unit-select"
          id="glucoseUnitSelect"
          v-model="data.inputs.glucose.unit"
          @change="data.inputs.glucose.unitChange()"
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
    <!--bloodKetones-->
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
    <!--urineKetones-->
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
    <!--diagnosticFeatures-->
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
    <div v-if="data.inputs.bloodGasAvailable.val === 'true'">
      <!--pH-->
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
      <!--bicarbonate-->
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
    <!--shockPresent-->
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
    <!--gcs-->
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
        <div
          class="collapse form-text mx-1"
          id="gcsInfo"
          v-html="data.inputs.gcs.info"
        ></div>
      </div>
    </transition>
    <!--respiratorySupport-->
    <transition>
      <div
        class="mb-4 text-center"
        v-if="
          data.inputs.shockPresent.val === 'false' &&
          data.inputs.gcs.val >= config.validation.gcs.severeThreshold &&
          data.inputs.pH.val < config.validation.pH.severeThreshold
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

    <div class="d-flex flex-row justify-content-evenly">
      <!--back-->
      <div class="text-center">
        <button
          type="button"
          @click="router.push('/form-equipment-availability')"
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
.flex-wrap {
  column-gap: 20px;
}
.insulin-rate-btn {
  height: 62px;
}
.v-enter-active {
  transition: all 0.5s ease;
}
.v-enter-from {
  opacity: 0;
}
.urineKetonesActive {
  background-color: #6c757d;
  color: white;
}
.input-group > .glucose-unit-select {
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  display: inline-block;
  padding-right: 2em; /* optional */
}
</style>
