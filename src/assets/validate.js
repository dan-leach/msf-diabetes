import { config } from "./fetchConfig.js"; // cached config

/**
 * Validates the payload against configured rules for all form fields.
 * @param {Object} payload - The form data to validate.
 * @returns {Object} - An object containing validation results.
 * @returns {boolean} returns.isValid - Indicates if the payload passed all validations.
 * @returns {Array} returns.errors - Array of error objects with field and message properties.
 */
function validate(payload) {
  const errors = [];

  // legalAgreement
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

  // episodeType
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

  // patientSex
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

  // weight
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

  // operationalCentre
  if (typeof payload.operationalCentre !== "string") {
    errors.push({
      field: "operationalCentre",
      message: "Operational centre field must be data type [string].",
    });
  }

  // project
  if (typeof payload.project !== "string") {
    errors.push({
      field: "project",
      message: "Project field must be data type [string].",
    });
  }

  // patientAge
  if (
    typeof payload.patientAge !== "number" ||
    payload.patientAge < config.value.validation.patientAge.min ||
    payload.patientAge > config.value.validation.patientAge.max
  ) {
    errors.push({
      field: "patientAge",
      message: `Patient age must be a decimal in the range ${config.value.validation.patientAge.min} to ${config.value.validation.patientAge.max}.`,
    });
  }

  // weightLimitOverride
  if (typeof payload.weightLimitOverride !== "boolean") {
    errors.push({
      field: "weightLimitOverride",
      message: "Weight limit override field must be data type [boolean].",
    });
  }

  // use2SD
  if (typeof payload.use2SD !== "boolean") {
    errors.push({
      field: "use2SD",
      message: "Used 2SD weight function field must be data type [boolean].",
    });
  }

  // equipment availability
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

  // dropFactor (conditional)
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

  // glucoseUnit
  if (
    !Object.keys(config.value.validation.glucose.units).includes(
      payload.glucoseUnit,
    )
  ) {
    errors.push({
      field: "glucoseUnit",
      message: "Invalid glucose unit option provided.",
    });
  }

  // glucose
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
        field: "glucose",
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

  // bloodKetones / urineKetones (mutually exclusive)
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

  // diagnosticFeatures
  if (
    typeof payload.diagnosticFeatures !== "boolean" ||
    !payload.diagnosticFeatures
  ) {
    errors.push({
      field: "diagnosticFeatures",
      message: "Diagnosis requires clinical features of DKA.",
    });
  }

  // optional clinical values
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

  // shockPresent
  if (typeof payload.shockPresent !== "boolean") {
    errors.push({
      field: "shockPresent",
      message: "Clinical shock status field must be data type [boolean].",
    });
  }

  // gcs (conditional)
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

  // respiratorySupport (conditional)
  if (
    !payload.shockPresent &&
    payload.gcs >= config.value.validation.gcs.severeThreshold &&
    typeof payload.respiratorySupport !== "boolean"
  ) {
    errors.push({
      field: "respiratorySupport",
      message: "Respiratory support status field must be data type [boolean].",
    });
  }

  // appVersion
  if (
    typeof payload.appVersion !== "object" ||
    !Object.values(payload.appVersion).every((v) => typeof v === "string")
  ) {
    errors.push({
      field: "appVersion",
      message: "Each app version property value must be a string.",
    });
  }

  // clientUseragent
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
