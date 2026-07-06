/**
 * @component GCS
 * @description Reference page displaying the Glasgow Coma Scale (GCS) scoring tables.
 *
 * Provides two static reference tables:
 *   - Table 1: Paediatric GCS — for infants and children ≤ 2 years old.
 *              Uses age-adapted verbal and motor criteria appropriate for
 *              pre-verbal and early-verbal developmental stages.
 *   - Table 2: Standard GCS  — for older children (≥ 5 years) and adults.
 *              Uses conventional verbal and motor criteria.
 *
 * For children aged 2–5 years, either scale may be used depending on their
 * developmental stage and verbal ability.
 *
 * Both scales score 3–15. Scores are reported per domain (E, V, M) and as a total.
 *
 * This is a read-only reference page; it does not interact with form data.
 *
 * @requires config — application configuration injected from App.vue (not used in
 *                    template currently, retained for consistency with other views).
 * @requires data   — imported but not used in template; retained for future use.
 */
<script setup>
import { data } from "../assets/data.js";
import { inject } from "vue";

/** @type {Object} Application configuration injected from the root provider in App.vue. */
const config = inject("config");
</script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 text-center">GCS</h2>
    <p>
      The Glasgow Coma Scale (GCS) is widely used to assess brain injury and
      neurological status in children and adults. Young children should be
      assessed using an adapted version of the GCS which takes into account
      their relatively immature verbal and motor developmental level. There is
      no universally accepted Paediatric Glasgow Coma Scale and variations exist
      in practice. It is generally recommended that children 2 years and younger
      should use an adapted GCS, and children 5 years and older should use the
      conventional adult GCS. For children between the ages of 2 and 5 years
      (i.e. 3- and 4-year-olds), either scale can be used depending on their
      level of development and verbal abilities.
    </p>
    <p>
      Both the GCS and Paediatric GCS have a minimum score of 3 and a maximum
      score of 15. It is useful to give a score for each criterion as well as
      the total score e.g. E4 + V3 + M5 = 12/15.
    </p>

    <!-- Table 1: Paediatric GCS (adapted for infants and children ≤ 2 years) -->
    <div>
      <h2 class="table-title">
        Table 1: Paediatric Glasgow Coma Scale (infants and children ≤ 2 years
        old)
      </h2>
      <p>Note: scroll down for standard GCS for older patients.</p>
      <table>
        <thead>
          <tr class="dark-blue">
            <th>CRITERIA</th>
            <th>BEST RESPONSE</th>
            <th>SCORE</th>
          </tr>
        </thead>
        <tbody>
          <!-- Eye opening response (max 4) -->
          <tr>
            <td rowspan="5" class="light-blue">Eye opening response</td>
            <td>Opens eyes spontaneously</td>
            <td>4</td>
          </tr>
          <tr>
            <td>Opens eyes in response to speech/noise</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Opens eyes in response to painful stimulus*</td>
            <td>2</td>
          </tr>
          <tr>
            <td>Does not open eyes</td>
            <td>1</td>
          </tr>
          <tr class="light-blue">
            <td>TOTAL EYE OPENING SCORE</td>
            <td>_/4</td>
          </tr>

          <!-- Verbal response — adapted for pre-verbal/early-verbal children (max 5) -->
          <tr>
            <td rowspan="6" class="light-blue">Verbal response</td>
            <td>Coos, babbles, alert</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Irritable cries, but consolable</td>
            <td>4</td>
          </tr>
          <tr>
            <td>
              Cries/wails in response to painful stimulus*, persistently
              irritable
            </td>
            <td>3</td>
          </tr>
          <tr>
            <td>Moans in response to painful stimulus*, inconsolable</td>
            <td>2</td>
          </tr>
          <tr>
            <td>No verbal response</td>
            <td>1</td>
          </tr>
          <tr class="light-blue">
            <td>TOTAL VERBAL SCORE</td>
            <td>_/5</td>
          </tr>

          <!-- Motor response — adapted for early motor development (max 6) -->
          <tr>
            <td rowspan="7" class="light-blue">Motor response</td>
            <td>Moves spontaneously and purposefully</td>
            <td>6</td>
          </tr>
          <tr>
            <td>Withdraws from touch</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Withdraws from painful stimulus*</td>
            <td>4</td>
          </tr>
          <tr>
            <td>
              Abnormal flexion to painful stimulus* (decorticate response)
            </td>
            <td>3</td>
          </tr>
          <tr>
            <td>Extension to painful stimulus* (decerebrate response)</td>
            <td>2</td>
          </tr>
          <tr>
            <td>No motor response</td>
            <td>1</td>
          </tr>
          <tr class="light-blue">
            <td>TOTAL MOTOR SCORE</td>
            <td>_/6</td>
          </tr>

          <!-- Total row -->
          <tr class="dark-blue">
            <td colspan="2" style="text-align: right">
              GCS TOTAL SCORE = E__ + V__ + M__
            </td>
            <td>_/15</td>
          </tr>
        </tbody>
      </table>
      * A painful stimulus can be given by applying supra-orbital pressure at
      the supraorbital notch or by applying pressure to the nailbed.
    </div>

    <!-- Table 2: Standard GCS (for children ≥ 5 years and adults) -->
    <div class="mt-4">
      <h2 class="table-title">Table 2: Glasgow Coma Scale</h2>
      <table>
        <thead>
          <tr class="dark-blue">
            <th>CRITERIA</th>
            <th>BEST RESPONSE</th>
            <th>SCORE</th>
          </tr>
        </thead>
        <tbody>
          <!-- Eye opening response (max 4) -->
          <tr>
            <td rowspan="5" class="light-blue">Eye opening response</td>
            <td>Opens eyes spontaneously</td>
            <td>4</td>
          </tr>
          <tr>
            <td>Opens eyes in response to speech</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Opens eyes in response to painful stimuli*</td>
            <td>2</td>
          </tr>
          <tr>
            <td>Does not open eyes</td>
            <td>1</td>
          </tr>
          <tr class="light-blue">
            <td>TOTAL EYE OPENING SCORE</td>
            <td>_/4</td>
          </tr>

          <!-- Verbal response — standard adult criteria (max 5) -->
          <tr>
            <td rowspan="6" class="light-blue">Verbal response</td>
            <td>Orientated, words or sentences to usual ability</td>
            <td>5</td>
          </tr>
          <tr>
            <td>
              Confused, disorientated, words or sentences less than usual
              ability
            </td>
            <td>4</td>
          </tr>
          <tr>
            <td>Inappropriate words</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Incomprehensible sounds, moaning</td>
            <td>2</td>
          </tr>
          <tr>
            <td>No verbal response</td>
            <td>1</td>
          </tr>
          <tr class="light-blue">
            <td>TOTAL VERBAL SCORE</td>
            <td>_/5</td>
          </tr>

          <!-- Motor response — standard adult criteria (max 6) -->
          <tr>
            <td rowspan="7" class="light-blue">Motor response</td>
            <td>Obeys commands</td>
            <td>6</td>
          </tr>
          <tr>
            <td>Localises painful stimuli</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Withdraws from painful stimuli*</td>
            <td>4</td>
          </tr>
          <tr>
            <td>Abnormal flexion to painful stimuli* (decorticate response)</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Extension to painful stimuli* (decerebrate response)</td>
            <td>2</td>
          </tr>
          <tr>
            <td>No motor response</td>
            <td>1</td>
          </tr>
          <tr class="light-blue">
            <td>TOTAL MOTOR SCORE</td>
            <td>_/6</td>
          </tr>

          <!-- Total row -->
          <tr class="dark-blue">
            <td colspan="2" style="text-align: right">
              GCS TOTAL SCORE = E__ + V__ + M__
            </td>
            <td>_/15</td>
          </tr>
        </tbody>
      </table>
      * A painful stimulus can be given by applying supra-orbital pressure at
      the supraorbital notch or by applying pressure to the nailbed.
    </div>
  </div>
</template>

<style scoped>
/* Header rows: dark background with white text */
.dark-blue {
  background-color: #38698d;
  color: white;
}
/* Category label cells and subtotal rows: light background */
.light-blue {
  background-color: #e1e9f2;
}
td {
  padding: 0.3rem;
}
table {
  border-collapse: collapse;
  border: 1px solid #ccc;
  width: 100%;
}

table td,
table th {
  border: 1px solid #ccc;
  padding: 0.3rem;
}
.table-title {
  font-size: 1.3rem;
}
</style>
