import { validate } from "./validate";
import { checkWeightWithinLimit } from "./checkWeightWithinLimit";
import { calculateVariables } from "./calculateVariables";
import { generateAuditId } from "./generateAuditId";

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
      parsedError
    );
    throw error;
  }
}

export { runOfflineCalculation };
