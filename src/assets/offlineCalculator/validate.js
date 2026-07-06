/**
 * @module validate
 * @description Server-side/offline payload validator for the MSF Diabetes Calculator.
 *
 * This module mirrors the field-level validation performed by the Vue frontend
 * (`src/assets/data.js`) but operates on the raw JSON payload that is submitted
 * to the API (or passed to the offline calculator). Its role is to act as a
 * second line of defence — catching malformed or tampered payloads before they
 * reach the calculation logic.
 *
 * Key differences from the frontend validator:
 *   - Works with plain values (not Vue refs).
 *   - Validates types explicitly (the frontend uses HTML inputs which constrain
 *     types naturally).
 *   - Conditional fields (dropFactor, glucose, gcs, respiratorySupport) are
 *     validated based on sibling boolean flags in the payload rather than
 *     reactive UI state.
 *
 * @requires ../fetchConfig — for the shared `config` reactive ref (config.value)
 */
import { config } from "../fetchConfig.js"; // cached config

/**
 * Validates a submitted payload against the configured rules for every form field.
 *
 * Iterates all expected fields in order (following the form flow), accumulating
 * errors rather than short-circuiting, so the caller receives a complete list of
 * all problems in a single call.
 *
 * Conditional fields:
 *   - `dropFactor`         — only validated when `infusionPumpAvailable` is false.
 *   - `glucoseUnit`/`glucose` — only validated when `glucoseHigh` is false.
 *   - `gcs`               — only validated when `shockPresent` is false.
 *   - `respiratorySupport` — only validated when `shockPresent` is false AND
 *                            `gcs` is strictly above the severe threshold AND
 *                            pH (if present) is at or above the pH severe threshold.
 *   - `pH`/`bicarbonate`  — validated only if present (optional; undefined is
 *                            accepted, but if provided the value must be numeric
 *                            and within bounds).
 *
 * @param {Object}  payload                    - The raw form submission to validate.
 * @param {boolean} payload.legalAgreement     - Must be boolean true.
 * @param {string}  payload.episodeType        - Must be one of config episodeType options.
 * @param {string}  payload.patientSex         - Must be one of config patientSex options.
 * @param {number}  payload.weight             - Must be a number within config weight bounds.
 * @param {string}  payload.operationalCentre  - Must be a string.
 * @param {string}  payload.project            - Must be a string.
 * @param {number}  payload.patientAge         - Decimal years; min <= age < max from config.
 * @param {boolean} payload.weightLimitOverride - Whether the +/-2 SD weight limit was overridden.
 * @param {boolean} payload.use2SD             - Whether weight was set to the +2 SD value.
 * @param {boolean} payload.useYearsMonths     - Whether age was entered as years+months.
 * @param {boolean} payload.bloodGasAvailable  - Whether blood gas was available.
 * @param {boolean} payload.bloodKetonesAvailable - Whether blood ketones were available.
 * @param {boolean} payload.syringePumpAvailable  - Whether a syringe pump was available.
 * @param {boolean} payload.infusionPumpAvailable - Whether an infusion pump was available.
 * @param {number}  [payload.dropFactor]       - Required when infusionPumpAvailable is false.
 * @param {boolean} payload.glucoseHigh        - True when meter reads "high/hi".
 * @param {string}  [payload.glucoseUnit]      - Required when glucoseHigh is false.
 * @param {number}  [payload.glucose]          - Required when glucoseHigh is false.
 * @param {number}  [payload.bloodKetones]     - mmol/L; present when bloodKetonesAvailable.
 * @param {number}  [payload.urineKetones]     - Dipstick integer; present when not bloodKetonesAvailable.
 * @param {boolean} payload.diagnosticFeatures - Must be boolean true (DKA criteria met).
 * @param {number}  [payload.pH]               - Optional; if present, validated against bounds.
 * @param {number}  [payload.bicarbonate]      - Optional; if present, validated against bounds.
 * @param {boolean} payload.shockPresent       - Whether the patient is in circulatory shock.
 * @param {number}  [payload.gcs]              - Required when shockPresent is false.
 * @param {boolean} [payload.respiratorySupport] - Required when shockPresent is false,
 *                                               gcs is strictly above the severe threshold,
 *                                               and pH (if present) is at or above the
 *                                               pH severe threshold.
 * @param {Object}  payload.appVersion         - Object whose every value is a string.
 * @param {string}  payload.clientUseragent    - Browser useragent string.
 *
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }> }}
 *   `isValid` is true only when `errors` is empty.
 */
function validate(payload) {
  const errors = [];

  // ---------------------------------------------------------------------------
  // Legal agreement — must be explicitly true (not just truthy)
  // ---------------------------------------------------------------------------
  if (typeof payload.legalAgreement !== "boolean") {
    errors.push({
      field: "legalAgreement",
      message: "Legal agreement field must be data type [boolean].",
    });
  } else if (!payload.legalAgreement) {
    errors.push({
      field: "legalAgreement",
      message: "You must agree to the legal disclaimer.",
    });
  }

  // ---------------------------------------------------------------------------
  // Episode type — must be one of the allowed options from config
  // ---------------------------------------------------------------------------
  if (typeof payload.episodeType !== "string") {
    errors.push({
      field: "episodeType",
      message: "Episode type field must be data type [string].",
    });
  } else if (
    !config.value.validation.episodeType.options.includes(payload.episodeType)
  ) {
    errors.push({
      field: "episodeType",
      message: "Invalid episode type option provided.",
    });
  }

  // ---------------------------------------------------------------------------
  // Patient sex — must be one of the allowed options from config
  // ---------------------------------------------------------------------------
  if (typeof payload.patientSex !== "string") {
    errors.push({
      field: "patientSex",
      message: "Patient sex field must be data type [string].",
    });
  } else if (
    !config.value.validation.patientSex.options.includes(payload.patientSex)
  ) {
    errors.push({
      field: "patientSex",
      message: "Invalid patient sex option provided.",
    });
  }

  // ---------------------------------------------------------------------------
  // Weight — numeric, within the absolute bounds from config
  // (age/sex centile range validation is handled by checkWeightWithinLimit.js)
  // ---------------------------------------------------------------------------
  if (
    typeof payload.weight !== "number" ||
    payload.weight < config.value.validation.weight.min ||
    payload.weight > config.value.validation.weight.max
  ) {
    errors.push({
      field: "weight",
      message: `Weight must be a valid number between ${config.value.validation.weight.min} and ${config.value.validation.weight.max}.`,
    });
  }

  // ---------------------------------------------------------------------------
  // Operational centre — string type check only; allowed values are managed
  // by the frontend dropdown and are not enumerated in a flat config list
  // ---------------------------------------------------------------------------
  if (typeof payload.operationalCentre !== "string") {
    errors.push({
      field: "operationalCentre",
      message: "Operational centre field must be data type [string].",
    });
  }

  // ---------------------------------------------------------------------------
  // Project — string type check only (projects are per-centre, not flat-listed)
  // ---------------------------------------------------------------------------
  if (typeof payload.project !== "string") {
    errors.push({
      field: "project",
      message: "Project field must be data type [string].",
    });
  }

  // ---------------------------------------------------------------------------
  // Patient age — decimal years; lower bound is inclusive, upper is exclusive
  // ---------------------------------------------------------------------------
  if (
    typeof payload.patientAge !== "number" ||
    payload.patientAge < config.value.validation.patientAge.min ||
    payload.patientAge >= config.value.validation.patientAge.max
  ) {
    errors.push({
      field: "patientAge",
      message: `Patient age must be a decimal in the range ${config.value.validation.patientAge.min} to <${config.value.validation.patientAge.max} years.`,
    });
  }

  // ---------------------------------------------------------------------------
  // Weight limit flags — boolean audit fields, always required
  // ---------------------------------------------------------------------------
  if (typeof payload.weightLimitOverride !== "boolean") {
    errors.push({
      field: "weightLimitOverride",
      message: "Weight limit override field must be data type [boolean].",
    });
  }

  if (typeof payload.use2SD !== "boolean") {
    errors.push({
      field: "use2SD",
      message: "Used 2SD weight function field must be data type [boolean].",
    });
  }

  // ---------------------------------------------------------------------------
  // Age input mode flag — boolean audit field, always required
  // ---------------------------------------------------------------------------
  if (typeof payload.useYearsMonths !== "boolean") {
    errors.push({
      field: "useYearsMonths",
      message: "Used years/months function field must be data type [boolean].",
    });
  }

  // ---------------------------------------------------------------------------
  // Equipment availability — all four must be boolean
  // Validated as a group since the pattern is identical for each
  // ---------------------------------------------------------------------------
  [
    "bloodGasAvailable",
    "bloodKetonesAvailable",
    "syringePumpAvailable",
    "infusionPumpAvailable",
  ].forEach((field) => {
    if (typeof payload[field] !== "boolean") {
      errors.push({
        field,
        message: `${field} field must be data type [boolean].`,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Drop factor — conditional on infusion pump being unavailable.
  // Must match one of the allowed drops/mL values from config.
  // Not validated when infusionPumpAvailable is true (field is not submitted).
  // ---------------------------------------------------------------------------
  if (!payload.infusionPumpAvailable) {
    const allowedDrops = config.value.validation.dropFactor.map((d) =>
      Number(d.drops),
    );
    if (!allowedDrops.includes(payload.dropFactor)) {
      errors.push({
        field: "dropFactor",
        message:
          "Drop factor field must match one of the allowed drops/minute values.",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Glucose — glucoseHigh must be a boolean when provided. When true, the meter
  // reads "HI/HIGH" and no numeric glucose value is expected, so the glucose
  // value and unit checks are skipped. Otherwise, a numeric glucose value is
  // required and is validated against the selected unit's min/max bounds. The
  // glucose value is only validated after the unit has been confirmed valid to
  // avoid reporting a misleading range error caused by an invalid unit.
  // ---------------------------------------------------------------------------

  if (
    payload.glucoseHigh !== undefined &&
    typeof payload.glucoseHigh !== "boolean"
  ) {
    errors.push({
      field: "glucoseHigh",
      message: "Glucose high field must be data type [boolean].",
    });
  } else if (payload.glucoseHigh === true) {
    // High reading - nothing else to validate.
  } else {
    if (typeof payload.glucose !== "number") {
      errors.push({
        field: "glucose",
        message: "Glucose field must be data type [float].",
      });
    } else {
      const unitConfig =
        config.value.validation.glucose.units[payload.glucoseUnit];
      if (!unitConfig) {
        errors.push({
          field: "glucoseUnit",
          message: "Invalid glucose unit option provided.",
        });
      } else if (
        payload.glucose < unitConfig.min ||
        payload.glucose > unitConfig.max
      ) {
        errors.push({
          field: "glucose",
          message: `Glucose must be in range ${unitConfig.min} to ${unitConfig.max} ${payload.glucoseUnit}.`,
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Ketones — blood and urine are mutually exclusive; exactly one must be
  // present. Only the minimum threshold is checked (biochemical DKA criterion);
  // the upper range bound is not validated because these fields carry clinical
  // meaning up to and including the maximum meter reading.
  //   - At least one of bloodKetones / urineKetones must be provided.
  //   - bloodKetones: validated when urineKetones is absent/falsy and the value
  //     is present as a number.
  //   - urineKetones: validated when bloodKetones is absent/falsy.
  // ---------------------------------------------------------------------------
  if (
    typeof payload.bloodKetones !== "number" &&
    (payload.urineKetones === undefined || payload.urineKetones === null)
  ) {
    errors.push({
      field: "bloodKetones",
      message: "Either blood ketones or urine ketones must be provided.",
    });
  }
  if (
    !payload.urineKetones &&
    typeof payload.bloodKetones === "number" &&
    payload.bloodKetones < config.value.validation.bloodKetones.min
  ) {
    errors.push({
      field: "bloodKetones",
      message: `If provided, blood ketones must be a decimal at least ${config.value.validation.bloodKetones.min}mmol/L.`,
    });
  }
  if (
    !payload.bloodKetones &&
    Number(payload.urineKetones) < config.value.validation.urineKetones.min
  ) {
    errors.push({
      field: "urineKetones",
      message: `If provided, urine ketones must be an integer at least ${config.value.validation.urineKetones.min}+.`,
    });
  }

  // ---------------------------------------------------------------------------
  // Diagnostic features — must be a boolean, and must be true.
  // Two failure modes are distinguished:
  //   - Wrong type: field is malformed (data integrity issue).
  //   - False value: field is valid but clinical DKA criteria not met.
  // ---------------------------------------------------------------------------
  if (typeof payload.diagnosticFeatures !== "boolean") {
    errors.push({
      field: "diagnosticFeatures",
      message: "Diagnostic features field must be data type [boolean].",
    });
  } else if (!payload.diagnosticFeatures) {
    errors.push({
      field: "diagnosticFeatures",
      message: "Diagnosis requires clinical features of DKA.",
    });
  }

  // ---------------------------------------------------------------------------
  // pH and bicarbonate — optional fields (only present when bloodGasAvailable).
  // If provided, each must be a number within the configured bounds.
  // Undefined is accepted without error (field simply absent from payload).
  // ---------------------------------------------------------------------------
  ["pH", "bicarbonate"].forEach((field) => {
    if (
      payload[field] !== undefined &&
      (typeof payload[field] !== "number" ||
        payload[field] < config.value.validation[field].min ||
        payload[field] > config.value.validation[field].max)
    ) {
      errors.push({
        field,
        message: `${field} must be a decimal in the range ${config.value.validation[field].min} to ${config.value.validation[field].max}.`,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Shock present — always required boolean
  // ---------------------------------------------------------------------------
  if (typeof payload.shockPresent !== "boolean") {
    errors.push({
      field: "shockPresent",
      message: "Clinical shock status field must be data type [boolean].",
    });
  }

  // ---------------------------------------------------------------------------
  // GCS — conditional on shockPresent being false.
  // When shock is present GCS is not assessed, so the field is not submitted.
  // ---------------------------------------------------------------------------
  if (
    !payload.shockPresent &&
    (typeof payload.gcs !== "number" ||
      payload.gcs < config.value.validation.gcs.min ||
      payload.gcs > config.value.validation.gcs.max)
  ) {
    errors.push({
      field: "gcs",
      message: `GCS must be an integer in the range ${config.value.validation.gcs.min} to ${config.value.validation.gcs.max}.`,
    });
  }

  // ---------------------------------------------------------------------------
  // Respiratory support — only required when severity is not already established
  // by another criterion. Not required if ANY of the following are true:
  //   1. shockPresent is true (shock protocol applies regardless of severity)
  //   2. GCS <= severeThreshold (severe DKA established by GCS alone)
  //   3. pH is present in the payload AND pH < pH.severeThreshold
  //      (severe DKA established by pH; pH absent = blood gas unavailable,
  //       so pH cannot contribute to severity and the question still applies)
  // ---------------------------------------------------------------------------
  if (
    !payload.shockPresent &&
    payload.gcs > config.value.validation.gcs.severeThreshold &&
    !(
      payload.pH !== undefined &&
      payload.pH < config.value.validation.pH.severeThreshold
    ) &&
    typeof payload.respiratorySupport !== "boolean"
  ) {
    errors.push({
      field: "respiratorySupport",
      message: "Respiratory support status field must be data type [boolean].",
    });
  }

  // ---------------------------------------------------------------------------
  // App version — must be a non-null object whose every value is a string.
  // The explicit null check is required because typeof null === "object" in JS;
  // without it, Object.values(null) would throw a TypeError rather than pushing
  // a clean validation error.
  // ---------------------------------------------------------------------------
  if (
    payload.appVersion === null ||
    typeof payload.appVersion !== "object" ||
    !Object.values(payload.appVersion).every((v) => typeof v === "string")
  ) {
    errors.push({
      field: "appVersion",
      message: "Each app version property value must be a string.",
    });
  }

  // ---------------------------------------------------------------------------
  // Client useragent — string, always required for audit/security logging
  // ---------------------------------------------------------------------------
  if (typeof payload.clientUseragent !== "string") {
    errors.push({
      field: "clientUseragent",
      message: "Client useragent field must be data type [string].",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export { validate };
