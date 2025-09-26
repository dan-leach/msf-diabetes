<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";

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

  if (data.value.form.isValid(2)) {
    const nextRoute = data.value.inputs.weight.limit.override
      ? "/form-override-confirm"
      : "/form-audit-details";
    router.push(nextRoute);
  }
};

/**
 * Lifecycle hook that runs when the component is mounted.
 * Checks the validity of previous form steps and redirects if necessary.
 * Sets initial form state.
 * Scrolls to the top of the page.
 */
onMounted(() => {
  if (!data.value.form.isValid(0)) {
    router.push("/form-disclaimer");
  } else if (!data.value.form.isValid(1)) {
    router.push("/form-patient-details");
  } else {
    // Scroll to top
    window.scrollTo(0, 0);

    // Build date-related values and set input min/max attributes
    const { protocolStartDatetime } = data.value.inputs;
    protocolStartDatetime.todayString.build();
    protocolStartDatetime.val = protocolStartDatetime.todayString.val;
    protocolStartDatetime.minDate.build();
    protocolStartDatetime.minDateString.build();
    protocolStartDatetime.maxDate.build();
    protocolStartDatetime.maxDateString.build();

    const protocolInput = document.getElementById("protocolStartDatetime");
    protocolInput.min = protocolStartDatetime.minDateString.val;
    protocolInput.max = protocolStartDatetime.maxDateString.val;
  }
});
</script>

<template>
  <form id="form-clinical-details" class="container my-4 needs-validation">
    <h2 class="display-3">Clinical details</h2>
    <!--protocolStartDatetime-->
    <div class="mb-4">
      <div class="input-group">
        <div class="form-floating">
          <input
            type="datetime-local"
            class="form-control"
            id="protocolStartDatetime"
            v-model="data.inputs.protocolStartDatetime.val"
            @change="data.inputs.protocolStartDatetime.isValid()"
            placeholder="x"
            min=""
            max=""
            required
            autocomplete="off"
          />
          <label for="protocolStartDatetime">{{
            data.inputs.protocolStartDatetime.label
          }}</label>
        </div>
        <span
          class="input-group-text"
          data-bs-toggle="collapse"
          data-bs-target="#protocolStartDatetimeInfo"
          ><font-awesome-icon :icon="['fas', 'circle-info']"
        /></span>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger mx-1"
        id="protocolStartDatetimeErrors"
      >
        {{ data.inputs.protocolStartDatetime.errors }}
      </div>
      <div class="collapse form-text mx-1" id="protocolStartDatetimeInfo">
        {{ data.inputs.protocolStartDatetime.info }}
      </div>
    </div>
    <!--pH available-->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.pH.available.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#pHAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
          <input
            type="radio"
            class="btn-check"
            name="pHAvailable"
            id="pHAvailableTrue"
            value="true"
            v-model="data.inputs.pH.available.val"
            @change="data.inputs.pH.available.isValid()"
            autocomplete="off"
            required
          />
          <label class="btn btn-outline-secondary me-2" for="pHAvailableTrue"
            >Yes</label
          >

          <input
            type="radio"
            class="btn-check"
            name="pHAvailable"
            id="pHAvailableFalse"
            value="false"
            v-model="data.inputs.pH.available.val"
            @change="data.inputs.pH.available.isValid()"
            autocomplete="off"
          />
          <label class="btn btn-outline-secondary" for="pHAvailableFalse"
            >No</label
          >
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="pHAvailableErrors"
      >
        {{ data.inputs.pH.available.errors }}
      </div>
      <div class="collapse form-text text-center mx-1" id="pHAvailableInfo">
        {{ data.inputs.pH.available.info }}
      </div>
    </div>
    <transition>
      <div v-if="data.inputs.pH.available.val === 'true'">
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
          <div
            v-if="showErrors"
            class="form-text text-danger mx-1"
            id="pHErrors"
          >
            {{ data.inputs.pH.errors }}
          </div>
          <div
            class="collapse form-text mx-1"
            id="pHInfo"
            v-html="data.inputs.pH.info"
          ></div>
        </div>
        <!--bicarbonate-->
        <div class="mb-4">
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
      </div>
    </transition>
    <!--bloodKetones available-->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.bloodKetones.available.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#bloodKetonesAvailableInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
          <input
            type="radio"
            class="btn-check"
            name="bloodKetonesAvailable"
            id="bloodKetonesAvailableTrue"
            value="true"
            v-model="data.inputs.bloodKetones.available.val"
            @change="data.inputs.bloodKetones.available.isValid()"
            autocomplete="off"
            required
          />
          <label
            class="btn btn-outline-secondary me-2"
            for="bloodKetonesAvailableTrue"
            >Yes</label
          >

          <input
            type="radio"
            class="btn-check"
            name="bloodKetonesAvailable"
            id="bloodKetonesAvailableFalse"
            value="false"
            v-model="data.inputs.bloodKetones.available.val"
            @change="data.inputs.bloodKetones.available.isValid()"
            autocomplete="off"
          />
          <label
            class="btn btn-outline-secondary"
            for="bloodKetonesAvailableFalse"
            >No</label
          >
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="bloodKetonesAvailableErrors"
      >
        {{ data.inputs.bloodKetones.available.errors }}
      </div>
      <div
        class="collapse form-text text-center mx-1"
        id="bloodKetonesAvailableInfo"
      >
        {{ data.inputs.bloodKetones.available.info }}
      </div>
    </div>
    <!--bloodKetones-->
    <transition>
      <div
        class="mb-4"
        v-if="data.inputs.bloodKetones.available.val === 'true'"
      >
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
            <label for="bloodKetones">{{
              data.inputs.bloodKetones.label
            }}</label>
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
    </transition>
    <!--urineKetones-->
    <transition>
      <div
        class="mb-4"
        v-if="data.inputs.bloodKetones.available.val === 'false'"
      >
        <p class="text-center m-2">
          {{ data.inputs.urineKetones.label }}
          <font-awesome-icon
            :icon="['fas', 'circle-info']"
            data-bs-toggle="collapse"
            data-bs-target="#urineKetonesInfo"
            class="ms-2"
          />
        </p>
        <div class="d-flex justify-content-center">
          <button
            class="btn btn-outline-secondary me-2"
            :class="{ urineKetonesActive: data.inputs.urineKetones.val === 0 }"
            type="button"
            @click="data.inputs.urineKetones.setVal(0)"
          >
            -
          </button>

          <button
            class="btn btn-outline-secondary me-2"
            :class="{ urineKetonesActive: data.inputs.urineKetones.val === 1 }"
            type="button"
            @click="data.inputs.urineKetones.setVal(1)"
          >
            +
          </button>

          <button
            class="btn btn-outline-secondary me-2"
            :class="{ urineKetonesActive: data.inputs.urineKetones.val === 2 }"
            type="button"
            @click="data.inputs.urineKetones.setVal(2)"
          >
            ++
          </button>

          <button
            class="btn btn-outline-secondary me-2"
            :class="{ urineKetonesActive: data.inputs.urineKetones.val === 3 }"
            type="button"
            @click="data.inputs.urineKetones.setVal(3)"
          >
            +++
          </button>

          <button
            class="btn btn-outline-secondary me-2"
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
    </transition>
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
        <span class="input-group-text">mmol/L</span>
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
    <!--shockPresent-->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.shockPresent.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#shockPresentInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
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
          <label class="btn btn-outline-secondary me-2" for="shockPresentTrue"
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
    <div class="mb-4">
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
      <div v-if="showErrors" class="form-text text-danger mx-1" id="gcsErrors">
        {{ data.inputs.gcs.errors }}
      </div>
      <div
        class="collapse form-text mx-1"
        id="gcsInfo"
        v-html="data.inputs.gcs.info"
      ></div>
    </div>
    <!--insulinRate-->
    <div class="mb-4">
      <p class="text-center m-2">
        {{ data.inputs.insulinRate.label }}
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          data-bs-toggle="collapse"
          data-bs-target="#insulinRateInfo"
          class="ms-2"
        />
      </p>
      <div class="d-flex justify-content-center">
        <div>
          <input
            type="radio"
            class="btn-check"
            name="insulinRate"
            id="0.05"
            value="0.05"
            v-model="data.inputs.insulinRate.val"
            @change="data.inputs.insulinRate.isValid()"
            autocomplete="off"
            required
          />
          <label class="btn btn-outline-secondary text-nowrap me-2" for="0.05"
            >0.05 units/kg/hour<br />
            (Default for <2 years)</label
          >

          <input
            type="radio"
            class="btn-check"
            name="insulinRate"
            id="0.1"
            value="0.1"
            v-model="data.inputs.insulinRate.val"
            @change="data.inputs.insulinRate.isValid()"
            autocomplete="off"
          />
          <label class="btn btn-outline-secondary text-nowrap me-2" for="0.1"
            >0.1 units/kg/hour<br />
            (Default for ≥2 years)</label
          >
        </div>
      </div>
      <div
        v-if="showErrors"
        class="form-text text-danger text-center mx-1"
        id="insulinRateErrors"
      >
        {{ data.inputs.insulinRate.errors }}
      </div>
      <div class="collapse form-text text-center mx-1" id="insulinRateInfo">
        {{ data.inputs.insulinRate.info }}
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
</style>
