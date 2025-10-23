<script setup>
import { onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { inject } from "vue";
const config = inject("config");

if (!data.value.auditID) router.push("/form-clinical-details");

onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 mb-4">Calculations</h2>
    <div v-if="data.auditID">
      <!--back-->
      <button
        type="button"
        @click="router.push('/guidance')"
        class="btn btn-secondary mb-2"
      >
        Back to output
      </button>
      <div class="mb-4">
        <h3>DKA severity</h3>
        <div v-html="data.calculations.severity.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Deficit percentage</h3>
        <div v-html="data.calculations.deficit.percentage.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Bolus volume</h3>
        <div v-html="data.calculations.bolus.volume.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Bolus duration</h3>
        <div v-html="data.calculations.bolus.duration.working"></div>
      </div>
      <hr></hr>
      <div class="mb-4">
        <h3>Bolus rate</h3>
        <div v-html="data.calculations.bolus.rate.working"></div>
      </div>
      <hr></hr>
      <div v-if="data.calculations.severity.val === 'standard'">
        <div class="mb-4">
          <h3>Bag speed: standard-speed</h3>
          <div v-html="data.calculations.bagSpeeds.standardSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4">
          <h3>Bag speed: half-standard-speed</h3>
          <div v-html="data.calculations.bagSpeeds.halfStandardSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4">
          <h3>Bag speed: high-speed (for hypoglycaemia)</h3>
          <div v-html="data.calculations.bagSpeeds.hypoSpeed.working"></div>
        </div>
        <hr></hr>
      </div>
      <div v-else-if="data.calculations.severity.val === 'severe'">
        <div class="mb-4">
          <h3>Bag speed: high-speed</h3>
          <div v-html="data.calculations.bagSpeeds.highSpeed.working"></div>
        </div>
        <hr></hr>
        <div class="mb-4">
          <h3>Bag speed: half-high-speed</h3>
          <div v-html="data.calculations.bagSpeeds.highSpeed.working"></div>
        </div>
        <hr></hr>
      </div>
      <div v-else>
        <div class="mb-4">
          <h3 class="text-danger">Error: unable to select DKA severity</h3>
        </div>
        <hr></hr>
      </div>
      <div class="mb-4" v-if="data.inputs.syringeDriverAvailable.val == 'true'">
        <h3>IV insulin rate</h3>
        <div v-html="data.calculations.insulinRate.working"></div>
      </div>
      <div class="mb-4" v-else>
        <h3>IM insulin dose</h3>
        <div v-html="data.calculations.insulinDose.working"></div>
      </div>
    </div>
    <!--back-->
    <button
      type="button"
      @click="router.push('/guidance')"
      class="btn btn-secondary"
    >
      Back to output
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
.btn-view-working,
.btn-view-guidance {
  min-width: 100%;
}
.btn-view-working:active,
.btn-view-guidance:active {
  border-color: transparent;
}
.bg-light {
  background-color: lightgray !important;
}
.row {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
