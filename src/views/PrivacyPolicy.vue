/**
 * @component PrivacyPolicy
 * @description Displays the application's privacy policy.
 *
 * The overarching principle is that patient-identifiable data never leaves the device;
 * only anonymised audit data is transmitted and stored server-side.
 *
 * The policy body is generated dynamically from `data.inputs`: for each input field,
 * the component renders either `privacyLabel`/`privacyInfo` (if defined) or the
 * generic `label`/`info` fields. This ensures the policy stays in sync with the
 * data model without requiring manual duplication.
 *
 * @requires config — application configuration injected from App.vue.
 * @requires data   — global reactive data store from assets/data.js.
 */
<script setup>
import { data } from "../assets/data.js";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Privacy policy</h2>
    <p>
      This policy explains how the data you enter into the
      {{ config.appName }} is used and stored. The overarching principle is that
      patient identifiable data does not leave the device on which you are
      generating the protocol, however some anonymised data is transmitted and
      stored for audit.
    </p>
    <p>
      Data stored by the {{ config.appName }} can be requested by the clinical
      team for the treating centre to support local audit.
    </p>
    <p>
      If you have any questions please contact
      <a :href="'mailto:' + config.author.email">{{ config.author.email }}</a
      >.
    </p>

    <!--
      Per-field privacy entries, driven by the data.inputs array.
      Each input may declare:
        - privacyLabel / privacyInfo  — privacy-specific heading and text (preferred)
        - label / info                — fallback to the generic field label and info text
    -->
    <div v-for="input of data.inputs">
      <h3 v-if="input.privacyLabel">{{ input.privacyLabel }}</h3>
      <h3 v-else>{{ input.label }}</h3>
      <p v-html="input.privacyInfo" v-if="input.privacyInfo"></p>
      <p v-html="input.info" v-else></p>
    </div>
  </div>
</template>
