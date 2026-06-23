<script setup>
import { inject, ref } from "vue";
const config = inject("config");

import Feedback from "../components/Feedback.vue";

const isOnline = ref(navigator.onLine);
const dataNeededOpen = ref(false);

const formatDatetime = (iso) => {
  const date = new Date(iso);

  return date.toLocaleString(undefined, {
    dateStyle: "short", // or "medium" / "long" / "full"
    timeStyle: "short", // short time (e.g. 23:30)
  });
};
</script>

<template>
  <div class="container my-4 needs-validation">
    <!--under development alert card-->
    <div
      class="card border-danger mb-3"
      v-if="config.client.underDevelopment || config.api.underDevelopment"
    >
      <div class="card-body">
        <div class="d-flex flex-row align-items-center">
          <font-awesome-icon
            :icon="['fas', 'triangle-exclamation']"
            size="2xl"
            class="me-4"
          />
          <div>
            <h5 class="card-title">Development version</h5>
            <p class="card-text">
              Client version {{ config.client.version }} ({{ config.client.lastUpdated }} | {{
                config.client.underDevelopment ? "development" : "production"
              }})<br></br>
              API version {{ config.api.version }} ({{ config.api.lastUpdated }} | {{
                config.api.underDevelopment ? "development" : "production"
              }})<br></br>
              This version is for demonstration purposes only. Do not use
              for real clinical cases.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!--offline calculator version misalignment alert card-->
    <div
      class="card border-danger mb-3"
      v-if="config.api.version != config.client.offlineCalculatorVersion"
    >
      <div class="card-body">
        <div class="d-flex flex-row align-items-center">
          <font-awesome-icon
            :icon="['fas', 'triangle-exclamation']"
            size="2xl"
            class="me-4"
          />
          <div>
            <h5 class="card-title">API / offline calculator versions misaligned</h5>
            <p class="card-text">
              API version {{ config.api.version }} does not match offline calculator version {{ config.client.offlineCalculatorVersion }}.
              <br></br>
              Contact administrator. Do not use in offline mode.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!--offline alert box-->
      <div class="card border-info mb-3" v-if="!isOnline">
        <div class="card-body d-flex flex-row align-items-center">
          <img
            alt="Offline icon"
            class="icon me-4"
            src="@/assets/images/offline-icon.svg"
            width="35"
            height="35"
          />
          <p class="card-text">
            The {{ config.appName }} is currently offline.<br>
            Calculations will be performed using the offline calculator which is up to date as of {{ formatDatetime(config.fetchDatetime) }}.<br>
            Episode logs will be uploaded when you next go online.
          </p>
        </div>
      </div>

    <h2 class="display-3 text-center">Welcome</h2>
    <p class="mx-1">
      The {{ config.appName }} allows clinicians to calculate variables for
      managing paediatric diabetic ketoacidosis based on the 2024 MSF paediatric
      guidelines.
    </p>
    <div class="card border-warning mb-3" hidden>
      <div class="card-body">
        <h5 class="card-title">What's new in the February 2025 update?</h5>
        <p class="card-text">
          The {{ config.appName }} has had a number of changes...
          <a href="#" data-bs-toggle="collapse" data-bs-target="#changes"
            >Read more about clinically relevant changes...</a
          >
        </p>
        <div class="collapse my-2" id="changes">
          <ul>
            <li>Change 1 etc</li>
          </ul>
          You can
          <a :href="config.client.repo.changelog" target="_blank"
            >read the full changelog here</a
          >.
        </div>
      </div>
    </div>
    <p class="mx-1">
      We're always trying to improve. If you have suggestions or queries, please
      contact
      <a :href="'mailto:' + config.author.email">{{ config.author.email }}</a
      >.
    </p>

    <!--quick start guide info box-->
    <div class="card border-info mb-3">
      <div class="card-body d-flex flex-row align-items-center">
        <font-awesome-icon
          :icon="['fas', 'circle-info']"
          size="2xl"
          class="me-4 flex-shrink-0"
        />
        <div>
          <p class="card-text mb-2">
            Before using this calculator for the first time, please read the
            <a href="/msf-diabetes-calculator-quick-start-guide.pdf" target="_blank"
              >Quick Start Guide</a
            >.
          </p>
          <a
            href="#"
            class="text-decoration-none"
            data-bs-toggle="collapse"
            data-bs-target="#dataNeededCollapse"
            :aria-expanded="dataNeededOpen"
            aria-controls="dataNeededCollapse"
            @click.prevent="dataNeededOpen = !dataNeededOpen"
          >
            What data will I need to use the calculator?
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="chevron ms-1"
              :class="{ 'chevron-open': dataNeededOpen }"
            />
          </a>
          <div class="collapse mt-2" id="dataNeededCollapse">
            <ul class="mb-2">
              <li>Patient date of birth (or age in years and months)</li>
              <li>Patient sex</li>
              <li>Patient weight</li>
              <li>Operational centre and project</li>
              <li>Whether a blood gas analyser, blood ketone meter, syringe driver, and/or infusion pump is available</li>
              <li>Blood glucose reading</li>
              <li>
                If blood gas available: pH and bicarbonate
              </li>
              <li>
                If blood ketone meter available: blood ketones;
                otherwise urine ketone dipstick result
              </li>
              <li>You will also be asked about the clinical status of your patient (features of DKA, shock, GCS, respiratory support)
              </li>
            </ul>
            <p class="mb-0 fst-italic small">
              Refer to the
              <a href="/msf-diabetes-calculator-quick-start-guide.pdf" target="_blank"
                >Quick Start Guide</a
              >
              for guidance on how to assess each of these items.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="d-grid gap-2 mb-4">
      <button
        type="button"
        @click="$router.push('/form-disclaimer')"
        class="btn btn-lg btn-primary btn-block"
      >
        Start
      </button>
    </div>
    <Feedback />
  </div>
</template>

<style scoped>
.container {
  max-width: 750px;
}
.btn-secondary {
  min-width: 100px;
  height: 40px;
}
.btn-lg {
  font-size: 30px;
}

.chevron {
  transition: transform 0.25s ease;
}
.chevron-open {
  transform: rotate(180deg);
}
</style>
