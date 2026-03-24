import { validate } from "./validate";
import { checkWeightWithinLimit } from "./checkWeightWithinLimit";
import { calculateVariables } from "./calculateVariables";
import { generateAuditId } from "./generateAuditId";
import { encrypt } from "./encrypt";

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

    // Step 3: Format patientAge to 2 decimal places (as string) to avoid deanonymisation
    payload.patientAge = payload.patientAge.toFixed(2);

    // Step 4: Perform calculations
    const calculations = calculateVariables(payload);

    // Step 5: Set undefined optional values to null
    payload.pH = payload.pH || null;
    payload.bicarbonate = payload.bicarbonate || null;
    payload.bloodKetones = payload.bloodKetones || null;
    payload.urineKetones = payload.urineKetones || null;
    payload.gcs = payload.gcs || null;
    payload.respiratorySupport = payload.respiratorySupport || null;
    payload.dropFactor = payload.dropFactor || null;

    // Step 6: Generate audit ID
    const auditID = generateAuditId();

    // Step 7: Encrypt the data
    const encryptedData = await encrypt({
      patientSex: payload.patientSex,
      weight: payload.weight,
      patientAge: payload.patientAge,
      glucose: payload.glucose,
      glucoseUnit: payload.glucoseUnit,
      bloodKetones: payload.bloodKetones,
      urineKetones: payload.urineKetones,
      diagnosticFeatures: payload.diagnosticFeatures,
      pH: payload.pH,
      bicarbonate: payload.bicarbonate,
      shockPresent: payload.shockPresent,
      gcs: payload.gcs,
      respiratorySupport: payload.respiratorySupport,
      calculations: calculations,
    });

    // Step 8: store in local storage, for later upload when online
    const offlineData = {
      data: {
        episodeType: payload.episodeType,
        appVersion: payload.appVersion,
        legalAgreement: payload.legalAgreement,
        operationalCentre: payload.operationalCentre,
        project: payload.project,
        clientUseragent: payload.clientUseragent,
        weightLimitOverride: payload.weightLimitOverride,
        use2SD: payload.use2SD,
        bloodGasAvailable: payload.bloodGasAvailable,
        bloodKetonesAvailable: payload.bloodKetonesAvailable,
        syringePumpAvailable: payload.syringePumpAvailable,
        infusionPumpAvailable: payload.infusionPumpAvailable,
        dropFactor: payload.dropFactor,
        offlineTimestamp: new Date().toISOString(),
      },
      encryptedData,
    };

    const offlineStoreIDs = JSON.parse(
      localStorage.getItem("offlineStoreIDs") || "[]",
    );
    offlineStoreIDs.push(auditID);
    localStorage.setItem("offlineStoreIDs", JSON.stringify(offlineStoreIDs));
    localStorage.setItem(auditID, JSON.stringify(offlineData));

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
