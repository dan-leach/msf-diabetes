/**
 * @component NotFound
 * @description Catch-all 404 page shown when a route cannot be matched.
 *
 * Displays a simple "page not found" message and a button that navigates
 * the user back to the start page.
 */
<script setup></script>

<template>
  <div class="container my-4 needs-validation">
    <h2 class="display-3 text-center">Page not found (404)</h2>
    <p class="mx-1 text-center">
      The page you are trying to reach was not found.
    </p>
    <!-- Returns the user to the start page -->
    <div class="text-center my-5">
      <button
        type="button"
        @click="$router.push('/')"
        class="btn btn-lg btn-primary"
      >
        Go to start page
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 750px;
}
</style>
