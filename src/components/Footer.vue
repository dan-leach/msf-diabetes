<script setup>
/**
 * Site-wide footer component. Displays two pieces of information:
 *  - An offline-readiness indicator (service worker active check via `navigator.serviceWorker`).
 *  - A clickable device-label panel that opens a Bootstrap modal containing version info,
 *    author details, MSF address, contact email, and the full legal disclaimer.
 *
 * The service worker status is checked once on mount; the indicator does not update
 * dynamically if the SW registers after the component is mounted.
 *
 * @inject config - Application configuration provided by `main.js`.
 */
import { inject, ref, onMounted } from "vue";
const config = inject("config");
const swActive = ref(false);

onMounted(async () => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    swActive.value = !!registration.active;
  }
});
</script>

<template>
  <footer id="footer" class="footer mt-auto">
    <nav
      class="navbar bg-grey d-flex flex-column align-items-center"
    >
      <div
        class="device-label-div mb-1 mx-4 d-flex flex-column align-items-center p-2"
        data-bs-toggle="modal"
        data-bs-target="#deviceLabelModal"
        style="cursor: pointer"
      >
      <div class="mb-1 text-black">
        <div v-if="swActive">
          <font-awesome-icon icon="check-circle" class="text-success" />
          Ready for offline use
        </div>
        <div v-else>
          <font-awesome-icon icon="circle-xmark" class="text-danger" />
          Not ready for offline use
        </div>
      </div>
        <p class="footer-text d-flex flex-row flex-wrap align-items-center justify-content-center text-center">
          <span
            ><strong>{{ config.appName }}&nbsp;</strong></span
          >
          <span class="text-decoration-underline mx-3">View device label 
            <img
                alt="Guidance icon"
                class="icon mx-2"
                src="@/assets/images/guidance-icon.svg"
                width="24"
                height="24"
              /></span>
        </p>
        <div class="footer-text text-xxs text-center">
        This application should only be used by medical professionals. Decisions
        about patient care remain the treating clinician's responsibility.<br></br>You
        must ensure the input values provided are accurate and that output
        values are checked carefully for suitability before use.
      </div>
      </div>
    </nav>
  </footer>

  <!-- Modal -->
  <div
    class="modal fade"
    id="deviceLabelModal"
    tabindex="-1"
    aria-labelledby="deviceLabelModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ config.appName }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <table class="table align-middle">
            <tr>
              <td class="left-col"><font-awesome-icon :icon="['fas', 'file-code']" size="2xl" /></td>
              <td>
                Client <a
                  :href="config.client.repo.changelog"
                  target="_blank"
                  class="p-0"
                  >v{{ config.client.version }}</a
                > ({{ config.client.underDevelopment ? 'development' : 'production' }})<br></br>
                Last updated: {{ config.client.lastUpdated }}
                <br></br>
                <br></br>
                API <a :href="config.api.repo.changelog" target="_blank" class="p-0"
                  >v{{ config.api.version }}</a
                > ({{ config.api.underDevelopment ? 'development' : 'production' }})
                <br></br>
                Last updated: {{ config.api.lastUpdated }}
              </td>
            </tr>
            <br />
            <tr>
              <td class="left-col">
                <font-awesome-icon :icon="['fas', 'industry']" size="2xl" />
              </td>
              <td>
                Created by <a class="p-0" :href="config.author.url">{{config.author.name}}</a> for <a
                  :href="config.organisations.msf.main"
                  target="_blank"
                  class="p-0"
                  >{{ config.organisations.msf.fullName }}</a
                ><br />
                La Fondation MSF<br />
                Service donateurs<br />
                14-34 avenue Jean Jaurès<br />
                75019 Paris
              </td>
            </tr>
            <br />
            <tr>
              <td class="left-col"><font-awesome-icon :icon="['fas', 'envelope']" size="2xl" /></td>
              <td>
                <a :href="'mailto:' + config.author.email" class="p-0">{{
                  config.author.email
                }}</a>
              </td>
            </tr>
            <br />
            <tr>
              <td class="left-col">
                <font-awesome-icon
                  :icon="['fas', 'triangle-exclamation']"
                  size="2xl"
                />
              </td>
              <td>
                This application should only be used by medical
                professionals.<br />
                Decisions about patient care remain the treating clinician's
                responsibility.<br />
                You must ensure the input values provided are accurate and that
                output values are checked carefully for suitability before
                use.<br />
                Use of the application requires agreement to the legal
                disclaimer and privacy policy.
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-text {
  color: black;
  text-decoration: none;
  margin: 0;
}
@media (max-width: 600px) {
  .footer-text {
    font-size: 14px; /* Smaller font size for small screens */
  }
}

.device-label-div {
  transition: all 0.3s ease;
  border: 1px solid #000000;
  border-radius: 8px;
}

.device-label-div:hover {
  background-color: rgba(255, 255, 102, 0.3); /* Light yellow highlight */
}

.left-col {
  font-weight: bold;
  float: right;
  margin-right: 25px;
}
table {
  border-spacing: 0 25px; /* Adds 10px space between rows */
}
.text-xxs {
  font-size: xx-small;
}
</style>
