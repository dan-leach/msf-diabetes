/**
 * @module syncOfflineData
 * @description Uploads any DKA calculations that were completed while the device was
 * offline. Records are stored in localStorage by `offlineCalculator.js` and flushed
 * here to the server as soon as connectivity is restored (called automatically after
 * a successful config fetch).
 *
 * Each record is removed from localStorage once the server confirms receipt.
 * If the upload fails the user is presented with a SweetAlert dialog; they may
 * optionally clear all pending offline logs from within that dialog.
 *
 * @exports syncOfflineData - Async function that iterates and uploads all pending records.
 */
import { api } from "@/assets/api.js";
import Swal from "sweetalert2";

/**
 * Synchronizes offline calculation data stored in localStorage with the server.
 * Retrieves all offline calculation records from localStorage, sends them to the server API,
 * and removes them from local storage upon successful sync.
 *
 * Offline records are stored with their auditID as the key, and a list of auditIDs is
 * maintained in the "offlineStoreIDs" localStorage key.
 *
 * @async
 * @returns {Promise<void>} - Resolves when sync is complete (success or failure).
 * @throws {Error} - Errors are caught and displayed to the user via SweetAlert dialogs.
 *
 * @remarks
 * - On success: Shows a toast notification and removes synced records from localStorage.
 * - On network failure: Shows an info dialog suggesting the user go online and refresh.
 * - On other errors: Shows an error dialog with error details.
 */
async function syncOfflineData() {
  try {
    const offlineStoreIDs = JSON.parse(
      localStorage.getItem("offlineStoreIDs") || "[]",
    );
    console.log("offlineStoreIDs: ", offlineStoreIDs);
    for (const auditID of offlineStoreIDs) {
      const offlineData = JSON.parse(localStorage.getItem(auditID));
      console.log("Syncing offline data with auditID: ", auditID, offlineData);
      const response = await api("sync-offline-data", {
        auditID,
        data: offlineData.data,
        encryptedData: offlineData.encryptedData,
      });
      console.log("Sync response: ", response);
      // Remove the offline data from localStorage after successful sync
      localStorage.removeItem(auditID);
      // Remove the auditID from the offlineStoreIDs list
      const updatedOfflineStoreIDs = JSON.parse(
        localStorage.getItem("offlineStoreIDs") || "[]",
      ).filter((id) => id !== auditID);
      localStorage.setItem(
        "offlineStoreIDs",
        JSON.stringify(updatedOfflineStoreIDs),
      );
    }
    if (offlineStoreIDs.length) {
      Swal.fire({
        text: "Offline episode logs uploaded successfully",
        icon: "success",
        iconColor: "black",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error syncing offline data: ", error);
    if (
      error[0] &&
      (error[0].msg.includes("Failed to fetch") ||
        error[0].msg.includes("Load failed") ||
        error[0].msg.includes("timed out"))
    ) {
      Swal.fire({
        text: "There are offline episode logs waiting to upload: go online when able and refresh this page.",
        icon: "info",
        iconColor: "black",
        showConfirmButton: true,
        confirmButtonColor: "#ec0000",
      });
    } else {
      Swal.fire({
        text:
          "Offline episode logs syncronisation failed: " +
          (error?.message || error?.[0]?.msg || JSON.stringify(error)),
        icon: "error",
        iconColor: "black",
        confirmButtonText: "OK, try again later",
        denyButtonText: "Clear logs",
        showDenyButton: true,
        confirmButtonColor: "#ec0000",
        denyButtonColor: "#757575",
      }).then((result) => {
        if (result.isDenied) {
          // Clear all offline logs
          const offlineStoreIDs = JSON.parse(
            localStorage.getItem("offlineStoreIDs") || "[]",
          );
          for (const auditID of offlineStoreIDs) {
            localStorage.removeItem(auditID);
          }
          localStorage.removeItem("offlineStoreIDs");
          Swal.fire({
            text: "Offline episode logs cleared",
            icon: "info",
            iconColor: "black",
            toast: true,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    }
  }
}

export { syncOfflineData };
