<script setup>
/**
 * Reusable inline button that displays a formatted value and opens a Bootstrap modal
 * containing the full step-by-step working for that value when clicked.
 * Used throughout `Calculations.vue` to let clinicians inspect how each figure
 * was derived.
 *
 * The modal is teleported to `<body>` to prevent it inheriting parent typography styles.
 *
 * @prop {Object}  param            - Object with `val` (number|string) and `working`
 *                                    (HTML string) from `calculateVariables`.
 * @prop {string}  paramKey         - Unique key used as the modal's DOM ID.
 * @prop {string}  [heading]        - Modal title; defaults to `paramKey` with first
 *                                    letter capitalised.
 * @prop {string}  [unit]           - Unit suffix appended to the displayed value (e.g. "mL").
 * @prop {number}  [decimals]       - If provided, `val` is formatted with `.toFixed(decimals)`.
 * @prop {boolean} [captitalizeFirst] - If true, capitalises the first character of `val`
 *                                    (note: prop name has a typo — two 'i's).
 */
import { ref } from "vue";
const props = defineProps([
  "param",
  "paramKey",
  "heading",
  "unit",
  "decimals",
  "captitalizeFirst",
]);

let val = ref(props.param.val);

if (typeof props.decimals === "number")
  val.value = val.value.toFixed(props.decimals);

if (props.captitalizeFirst) val.value = capitalizeFirst(val.value);

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>

<template>
  <button
    type="button"
    class="btn btn-view-working btn-sm py-0 px-1 m-0 position-relative"
    data-bs-toggle="modal"
    :data-bs-target="'#' + paramKey + 'ViewWorkingModal'"
  >
    {{ val }}{{ unit }}
  </button>
  <!-- Modal -->
  <!-- teleport modal to body to avoid inheriting parent typography -->
  <teleport to="body">
    <div
      class="modal fade"
      :id="paramKey + 'ViewWorkingModal'"
      tabindex="-1"
      :aria-labelledby="paramKey + 'ViewWorkingModal'"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ heading ? heading : capitalizeFirst(paramKey) }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body" v-html="param.working"></div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.btn-view-working {
  vertical-align: baseline;
  font: inherit; /* inherit font-size, family, weight */
  color: inherit; /* inherit text color from parent */
  border: 1px solid currentColor; /* border inherits text color */
  background: none;
  background-color: yellow;
}

.btn-view-working:hover {
  text-decoration: underline;
}
</style>
