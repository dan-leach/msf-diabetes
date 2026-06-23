/**
 * @component FormDisclaimer
 * @description Step 0 of the episode form flow — displays the legal disclaimer.
 *
 * The user must agree to the disclaimer before entering patient data.
 * Clicking "Agree and continue" records legal agreement in the shared data store
 * and navigates to the patient details form.
 *
 * This is the entry point of the form; it does not guard against missing prior
 * steps because it is itself the first step.
 *
 * Form flow: Disclaimer → PatientDetails → (OverrideConfirm?) → EquipmentAvailability
 *            → ClinicalDetails → Generate → Guidance
 *
 * @requires config — application configuration injected from App.vue.
 * @requires data   — global reactive data store from assets/data.js.
 * @requires router — Vue Router instance for programmatic navigation.
 */
<script setup>
import { onMounted } from "vue";
import { data } from "../assets/data.js";
import router from "../router";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");

/**
 * Handles the "Agree and continue" button click.
 *
 * Records that the user has accepted the legal disclaimer and navigates
 * to the first data-entry step of the form flow.
 */
const continueClick = () => {
  data.value.inputs.legalAgreement.val = true;
  router.push("/form-patient-details");
};

/**
 * Scrolls to the top of the page when the component mounts.
 * Ensures the user always reads the disclaimer from the beginning,
 * even if they navigated here from a later step via the back button.
 */
onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <form id="form-disclaimer" class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Legal disclaimer</h2>

    <!-- Full disclaimer text — all paragraphs must remain visible; do not truncate -->
    <div>
      <p>
        By using this website and by using the calculated values, and the
        calculation formulae, you confirm that you accept the terms of this
        disclaimer. If you do not agree to such terms, you must not use this
        site.
      </p>
      <p>
        We are the owner or the licensee of all intellectual property rights in
        our site. Our site is made available free of charge. We do not guarantee
        that our site, or any content on it, will always be available or be
        uninterrupted. We may suspend or withdraw or restrict the availability
        of all or any part of our site for business and operational reasons.
      </p>
      <p>
        Although we make reasonable efforts to check this website and the
        calculation formulae and calculated values for accuracy, we make no
        representations, warranties or guarantees, whether express or implied,
        that the content on our site is accurate, complete, free from error or
        up to date, and it remains strictly the treating clinician's
        responsibility to check the calculated values produced by this website
        manually. The content on our site is provided for general information
        only. It is not intended to amount to advice on which you should rely.
      </p>
      <!--
        Weight limit disclaimer — values are drawn from config so they stay in
        sync if the limits are updated centrally.
      -->
      <p>
        The {{ config.appName }} allows a maximum weight for age of +2SDS or
        {{ config.caps.weight }}kg (whichever is lower), and a minimum weight
        for age of -2SDS. There is the facility to override these weight limits
        but clinicians do this at their own risk and the
        {{ config.organisations.msf.shortName }} accepts no liability for any
        adverse events. Neither the {{ config.organisations.msf.shortName }} nor
        the website authors accept any liability for any errors arising from the
        use of this tool or protocols generated.
      </p>
      <p>
        We exclude all implied conditions, warranties, representations or other
        terms that may apply to our site or any content on it.
      </p>
      <p>
        We will not be liable to you for any loss or damage, whether in
        contract, tort (including negligence), breach of statutory duty, or
        otherwise, even if foreseeable, arising under or in connection with, use
        of, or inability to use, our site; or use of or reliance upon calculated
        values produced on our site.
      </p>
      <p>
        We do not guarantee that our site will be secure or free from bugs or
        viruses. You are responsible for configuring your information
        technology, computer programmes and platform to access our site. You
        should use your own virus protection software. You must not misuse our
        site by knowingly introducing viruses, trojans, worms, logic bombs or
        other material that is malicious or technologically harmful.
      </p>
      <p>
        The terms of this disclaimer, its subject matter and its formation (and
        any non-contractual disputes or claims) are governed by English law. By
        using this website and the template protocol, and the calculation
        formulae contained within it, you confirm that you agree to the
        exclusive jurisdiction of the courts of England and Wales.
      </p>
    </div>

    <!-- Agreement button — clicking records consent and advances to the form -->
    <div class="text-center">
      <button
        type="button"
        @click="continueClick"
        class="btn btn-lg btn-primary"
      >
        Agree and continue
      </button>
    </div>
  </form>
</template>

<style scoped>
.container {
  max-width: 750px;
}
.btn-outline-secondary {
  width: 150px;
}
</style>
