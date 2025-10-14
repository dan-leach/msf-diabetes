<script setup>
import { inject } from "vue";
const config = inject("config");
</script>

<template>
  <div class="container my-4 needs-validation">
    <div class="card border-danger mb-3" v-if="config.underDevelopment">
      <div class="card-body">
        <h5 class="card-title">Development version</h5>
        <p class="card-text">
          This version is for demonstration purposes only. Do not use for real
          clinical cases.
        </p>
      </div>
    </div>

    <h2 class="display-3">Welcome</h2>
    <p class="mx-1">
      The {{ config.appName }} allows clinicians to calculate variables for
      managing paediatric diabetic ketoacidosis based on the 2024 MSF paediatric
      guidelines.
    </p>
    <div class="card border-warning mb-3" hidden>
      <div class="card-body">
        <h5 class="card-title">What's new in the February 2025 update?</h5>
        <p class="card-text">
          The {{ config.appName }} has had a number of changes...
          <a href="#" data-bs-toggle="collapse" data-bs-target="#changes"
            >Read more about clinically relevant changes...</a
          >
        </p>
        <div class="collapse my-2" id="changes">
          <ul>
            <li>Change 1 etc</li>
          </ul>
          You can
          <a :href="config.client.repo.changelog" target="_blank"
            >read the full changelog here</a
          >.
        </div>
      </div>
    </div>
    <p class="mx-1">
      We're always trying to improve. If you have suggestions or queries, please
      contact
      <a :href="'mailto:' + config.author.email">{{ config.author.email }}</a
      >.
    </p>
    <div class="d-grid gap-2 mb-4">
      <button
        type="button"
        @click="$router.push('/form-disclaimer')"
        class="btn btn-lg btn-primary btn-block"
      >
        Start
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 750px;
}
.btn-secondary {
  min-width: 100px;
  height: 40px;
}
.btn-lg {
  font-size: 30px;
}
</style>
