/**
 * @module main
 * @description Application entry point. Bootstraps the Vue 3 app by:
 *  - Importing Bootstrap CSS and JS
 *  - Registering the PWA service-worker update handler (auto-reloads on new SW)
 *  - Adding required FontAwesome icons to the global library
 *  - Providing the reactive `config` ref application-wide via Vue's provide/inject
 *  - Registering `<font-awesome-icon>` as a global component
 *  - Attaching Vue Router
 *  - Mounting the root `<App>` component to `#app`
 */
// Import styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./assets/main.css";

// Import the core Vue library
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// PWA update helper
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Called when a new SW is installed but waiting to activate
    console.log("New version available, reloading...");
    window.location.reload();
  },
});

// Import FontAwesome core and Vue component
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// Import specific FontAwesome icons
import {
  faQuestionCircle,
  faInfoCircle,
  faCheck,
  faXmark,
  faIndustry,
  faTriangleExclamation,
  faUpRightFromSquare,
  faFileCode,
  faEnvelope,
  faCheckCircle,
  faCircleXmark,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
// Add icons to the FontAwesome library
library.add(
  faQuestionCircle,
  faInfoCircle,
  faCheck,
  faXmark,
  faIndustry,
  faTriangleExclamation,
  faUpRightFromSquare,
  faFileCode,
  faEnvelope,
  faCheckCircle,
  faCircleXmark,
  faChevronDown,
);

// Create Vue application
const app = createApp(App);

// Import config and inject
import { config } from "./assets/fetchConfig";
app.provide("config", config);

// Register FontAwesomeIcon component globally
app.component("font-awesome-icon", FontAwesomeIcon);

// Use Vue Router
app.use(router);

// Mount Vue application to the DOM
app.mount("#app");
