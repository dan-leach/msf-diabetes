import { validate } from "./validate";
import { checkWeightWithinLimit } from "./checkWeightWithinLimit";
import { calculateVariables } from "./calculateVariables";
import { generateAuditId } from "./generateAuditId";

/**
 * Performs offline calculation by validating payload, checking weight limits, and calculating variables.
 * @param {Object} payload - The patient and clinical data to process.
 * @returns {Promise<Object>} - A promise resolving to an object containing calculations, mode, and auditID.
 * @returns {Object} returns.calculations - The calculation results from calculateVariables.
 * @returns {string} returns.mode - The mode indicator ('offline').
 * @returns {string} returns.auditID - A unique identifier for this calculation.
 * @throws {Error} - Throws error if validation, weight check, or calculations fail.
 */
async function runOfflineCalculation(payload) {
  try {
    // Step 1: Validate
    const validation = validate(payload);
    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    // Step 2: Check weight within limits
    const check = checkWeightWithinLimit(payload);
    if (!check.pass) {
      console.log("checkWeightWithinLimit failed");
      throw new Error(check.error);
    }

    // Step 3: Perform calculations
    const calculations = calculateVariables(payload);

    // Step 4: Generate audit ID
    const auditID = generateAuditId();

    return {
      calculations,
      mode: "offline",
      auditID,
    };
  } catch (error) {
    const parsedError = JSON.parse(error.message);
    console.error(
      `Offline calculation error (count: ${parsedError.length}): ${parsedError.message}`,
      parsedError,
    );
    throw error;
  }
}

export { runOfflineCalculation };
