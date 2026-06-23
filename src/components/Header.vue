<script setup>
/**
 * Site-wide header component. Displays the MSF logo and application name as a
 * home-page link. Shows a "Development version" warning banner when either the
 * client or the API is flagged as under development. Renders an "Install app"
 * button when the browser has a deferred PWA install prompt available.
 *
 * @inject config - Application configuration provided by `main.js`.
 */
import { RouterLink } from "vue-router";
import { inject } from "vue";
const config = inject("config");

import { useInstallPrompt } from "../assets/useInstallPrompt.js";
const { deferredPrompt, install } = useInstallPrompt();
</script>

<template>
  <nav id="header" class="navbar bg-grey position-relative">
    <div
      class="container-fluid d-flex flex-column align-items-center justify-content-center justify-content-lg-between"
    >
      <RouterLink
        to="/"
        class="navbar-brand d-flex flex-row flex-wrap align-items-center justify-content-center p-0 m-0"
        ><img alt="MSF logo" class="logo" src="@/assets/images/msf-logo.jpg" />
        <h1 class="display-5 mx-1 my-0">
          {{ config.appName }}
        </h1>
      </RouterLink>
      <h2
        class="text-danger align-middle"
        v-if="config.client.underDevelopment || config.api.underDevelopment"
      >
        Development version
      </h2>
    </div>
    <button
      v-if="deferredPrompt"
      type="button"
      class="btn btn-sm btn-primary install-btn"
      @click="install"
    >
      Install app
    </button>
  </nav>
</template>

<style scoped>
.logo {
  width: 15vw;
}
.site-title {
  font-size: 3vw;
  margin: 0;
  margin-left: 10px;
}
.navbar {
  padding: 0;
}
.install-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
}
@media only screen and (max-width: 600px) {
  .logo {
    width: 40vw;
  }
}
</style>
