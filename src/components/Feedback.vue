<script setup>
/**
 * Feedback submission form. Validates that the feedback field is not empty, then
 * POSTs the text and current auditID to the API. Shows a SweetAlert success dialog
 * on submission and an error dialog on failure, then clears the textarea.
 *
 * @inject config - Application configuration provided by `main.js`; used in the
 *                  error dialog to display the author contact email.
 */
import { ref, inject } from "vue";
import { api } from "@/assets/api.js";
import Swal from "sweetalert2";
import { data } from "../assets/data.js";

const config = inject("config");

const feedbackText = ref("");

/**
 * Validates and submits the current feedback text.
 * No-ops with a warning dialog if the field is empty.
 * Clears the textarea after a successful submission.
 *
 * @returns {Promise<void>}
 */
const submitFeedback = async () => {
  if (!feedbackText.value.trim()) {
    Swal.fire({
      title: "Feedback cannot be empty",
      text: "Please enter your feedback before submitting.",
      icon: "warning",
      iconColor: "black",
      confirmButtonColor: "#ec0000",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    const response = await api("feedback", {
      feedbackText: feedbackText.value,
      auditID: data.value.auditID,
    });
    Swal.fire({
      title: "Feedback submitted",
      text: "Thank you for your feedback!",
      icon: "success",
      iconColor: "black",
      confirmButtonColor: "#ec0000",
      confirmButtonText: "OK",
    });
    // Clear the feedback text area after submission
    feedbackText.value = "";
  } catch (error) {
    console.log("Error submitting feedback:", error);
    Swal.fire({
      title: "Error submitting feedback",
      text:
        "There was an error submitting your feedback: " +
        error[0].msg +
        ". If the problem persists, please contact me via " +
        config.value.author.email,
      icon: "error",
      iconColor: "black",
      confirmButtonColor: "#ec0000",
      confirmButtonText: "OK",
    });
  }
};
</script>

<template>
  <!--quick feedback-->
  <div class="card mb-4 border-dark">
    <div class="card-body">
      <div class="mb-1">
        We would love to hear your feedback on the calculator, and any suggestions for
        improvement. Please share your thoughts below.
        <textarea
          class="form-control mt-2"
          id="feedbackText"
          rows="3"
          v-model="feedbackText"
        ></textarea>
        <div class="text-center">
          <button
            type="button"
            @click="submitFeedback"
            class="btn btn-secondary mt-2"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
