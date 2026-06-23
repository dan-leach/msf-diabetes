<script setup>
import { ref } from "vue";
import { api } from "@/assets/api.js";
import Swal from "sweetalert2";
import { data } from "../assets/data.js";
/**
 * Function to submit user feedback. Validates that feedback is not empty, then sends it to the API. Displays success or error messages based on the API response.
 * After submission, the feedback text area is cleared.
 */
const feedbackText = ref("");
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
  <div class="card border-dark mb-4">
    <div class="card-header">
      <img
        alt="Megaphone icon"
        class="icon"
        src="@/assets/images/megaphone-icon.svg"
        width="24"
        height="24"
      />
      Give us some quick feedback?
    </div>
    <div class="card-body">
      <div class="mb-1">
        We would love to hear your feedback on the calculator, and any suggestions for
        improvement. Please share your thoughts below.
        <textarea
          class="form-control"
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
