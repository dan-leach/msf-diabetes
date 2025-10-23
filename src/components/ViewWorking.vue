<script setup>
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
    class="btn btn-view-working btn-sm btn-outline-dark py-0 px-2 m-0 position-relative"
    data-bs-toggle="modal"
    :data-bs-target="'#' + paramKey + 'ViewWorkingModal'"
  >
    {{ val }}{{ unit }}
    <span
      class="position-absolute top-0 start-100 translate-middle badge rounded-pill magnifying-glass"
    >
      <img
        alt="Magnifying glass icon"
        class="icon mx-2"
        src="@/assets/images/magnifying-glass.png"
        width="20"
        height="20"
      />
    </span>
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
}
.magnifying-glass {
  top: -0.8rem !important; /* nudge down */
  left: calc(100% - 2px) !important;
  transform: translateX(-50%) !important; /* keep horizontal centering only */
}
</style>
