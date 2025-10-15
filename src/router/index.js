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
      path: "/calculate",
      name: "calculate",
      component: () => import("../views/Calculate.vue"),
    },
    {
      path: "/output",
      name: "output",
      component: () => import("../views/Output.vue"),
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
      path: "/:pathMatch(.*)*",
      name: "404",
      component: () => import("../views/404.vue"),
    },
  ],
});

export default router;
