<script setup>
import { ref, onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router/index.js";
import { api } from "@/assets/api.js";
import { inject } from "vue";
const config = inject("config");
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3">Output</h2>
    <!--severity-->
    <div class="card mb-4">
      <div class="card-header">Severity</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.severity.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.severity.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.severity.valText }}
          </div>
        </div>
      </div>
    </div>
    <!--bolus volume-->
    <div class="card mb-4">
      <div class="card-header">Bolus volume</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.bolus.volume.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Limit</span>
            <span v-html="data.calculations.bolus.volume.limit"></span>
            <small>Based on weight of {{ config.caps.weight }}kg</small>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.bolus.volume.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.bolus.volume.val.toFixed(0) }}mL
          </div>
        </div>
      </div>
    </div>
    <!--bolus duration-->
    <div class="card mb-4">
      <div class="card-header">Bolus duration</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.bolus.duration.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.bolus.duration.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.bolus.duration.val.toFixed(0) }} hours
          </div>
        </div>
      </div>
    </div>
    <!--bolus rate-->
    <div class="card mb-4">
      <div class="card-header">Bolus rate</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.bolus.rate.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.bolus.rate.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.bolus.rate.val.toFixed(0) }}mL/hour
          </div>
        </div>
      </div>
    </div>
    <!--deficit percentage-->
    <div class="card mb-4">
      <div class="card-header">Deficit percentage</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.deficit.percentage.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.deficit.percentage.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.deficit.percentage.val }}%
          </div>
        </div>
      </div>
    </div>
    <!--deficit volume-->
    <div class="card mb-4">
      <div class="card-header">Deficit volume</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.deficit.volume.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Limit</span>
            <span v-html="data.calculations.deficit.volume.limit"></span>
            <small>Based on weight of {{ config.caps.weight }}kg</small>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.deficit.volume.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.deficit.volume.val.toFixed(0) }}mL
          </div>
        </div>
      </div>
    </div>
    <!--deficit rate-->
    <div class="card mb-4">
      <div class="card-header">Deficit replacement rate</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.deficit.rate.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.deficit.rate.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.deficit.rate.val.toFixed(1) }}mL/hour
          </div>
        </div>
      </div>
    </div>
    <!--maintenance volume-->
    <div class="card mb-4">
      <div class="card-header">Daily maintenance volume</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.maintenance.volume.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Limit</span>
            <span v-html="data.calculations.maintenance.volume.limit"></span>
            <small>Based on weight of {{ config.caps.weight }}kg</small>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.maintenance.volume.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.maintenance.volume.val.toFixed(0) }}mL
          </div>
        </div>
      </div>
    </div>
    <!--maintenance rate-->
    <div class="card mb-4">
      <div class="card-header">Daily maintenance rate</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.maintenance.rate.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.maintenance.rate.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.maintenance.rate.val.toFixed(1) }}mL/hour
          </div>
        </div>
      </div>
    </div>
    <!--full speed bag-->
    <div class="card mb-4">
      <div class="card-header">Full speed bag</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.bagSpeeds.fullSpeed.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.bagSpeeds.fullSpeed.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.bagSpeeds.fullSpeed.val.toFixed(1) }}mL/hour
          </div>
        </div>
      </div>
    </div>
    <!--half speed bag-->
    <div class="card mb-4">
      <div class="card-header">Half speed bag</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.bagSpeeds.halfSpeed.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.bagSpeeds.halfSpeed.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.bagSpeeds.halfSpeed.val.toFixed(1) }}mL/hour
          </div>
        </div>
      </div>
    </div>
    <!--IV insulin rate-->
    <div class="card mb-4">
      <div class="card-header">IV insulin rate</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.insulinRate.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Limit</span>
            <span v-html="data.calculations.insulinRate.limit"></span>
            <small>Based on weight of {{ config.caps.weight }}kg</small>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.insulinRate.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.insulinRate.val.toFixed(2) }}
            Units/hour
          </div>
        </div>
        <div class="mb-2">
          <div class="card border-warning p-2">
            Note: Insulin should NOT be started immediately. Wait 1 hour after
            starting IV fluid therapy.
          </div>
        </div>
      </div>
    </div>
    <!--IM insulin dose-->
    <div class="card mb-4">
      <div class="card-header">IM insulin rate</div>
      <div class="card-body">
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Formula</span>
            <span v-html="data.calculations.insulinDose.formula"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Limit</span>
            <span v-html="data.calculations.insulinDose.limit"></span>
            <small>Based on weight of {{ config.caps.weight }}kg</small>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Working</span>
            <span v-html="data.calculations.insulinDose.working"></span>
          </div>
        </div>
        <div class="mb-2">
          <div class="card p-2">
            <span class="text-muted m-0">Output</span>
            {{ data.calculations.insulinDose.val.toFixed(2) }}
            Units
          </div>
        </div>
        <div class="mb-2">
          <div class="card border-warning p-2">
            Note: Insulin should NOT be started immediately. Wait 1 hour after
            starting IV fluid therapy.
          </div>
        </div>
      </div>
    </div>
    <div class="card border-warning mb-3">
      <div class="card-body">
        <p class="card-text">
          Note: Refer to the MSF paediatric diabetes guidelines for how to use
          these calculated values.
        </p>
      </div>
    </div>
    <!--back-->
    <button
      type="button"
      @click="router.push('/form-clinical-details')"
      class="btn btn-secondary"
    >
      Back to form
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
</style>
