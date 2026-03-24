import { createRouter, createWebHistory } from "vue-router";
import Start from "../views/Start.vue";
import { fetchConfig } from "../assets/fetchConfig";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "start",
      component: Start,
    },
    {
      path: "/form-disclaimer",
      name: "form-disclaimer",
      component: () => import("../views/FormDisclaimer.vue"),
    },
    {
      path: "/form-patient-details",
      name: "form-patient-details",
      component: () => import("../views/FormPatientDetails.vue"),
    },
    {
      path: "/form-override-confirm",
      name: "form-override-confirm",
      component: () => import("../views/FormOverrideConfirm.vue"),
    },
    {
      path: "/form-equipment-availability",
      name: "form-equipment-availability",
      component: () => import("../views/FormEquipmentAvailability.vue"),
    },
    {
      path: "/form-clinical-details",
      name: "form-clinical-details",
      component: () => import("../views/FormClinicalDetails.vue"),
    },
    {
      path: "/generate",
      name: "generate",
      component: () => import("../views/Generate.vue"),
    },
    {
      path: "/guidance",
      name: "guidance",
      component: () => import("../views/Guidance.vue"),
    },
    {
      path: "/calculations",
      name: "calculations",
      component: () => import("../views/Calculations.vue"),
    },
    {
      path: "/privacy-policy",
      name: "privacy-policy",
      component: () => import("../views/PrivacyPolicy.vue"),
      beforeEnter: async (to, from) => {
        await fetchConfig();
      },
    },
    {
      path: "/gcs",
      name: "gcs",
      component: () => import("../views/GCS.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: () => import("../views/404.vue"),
    },
  ],
});

export default router;
