import { ref } from "vue";
import { config } from "./fetchConfig.js";

// Utility functions
/**
 * Checks the length of a string value against given min and max lengths.
 * @param {string} val - The value to check.
 * @param {number} minLength - Minimum allowable length.
 * @param {number} maxLength - Maximum allowable length.
 * @param {Array} errors - Array to store error messages.
 * @param {string} fieldName - Name of the field being validated.
 */
const checkLength = (val, minLength, maxLength, errors, fieldName) => {
  if (val.length < minLength)
    errors.push(`${fieldName} must be at least ${minLength} characters.`);
  if (val.length > maxLength)
    errors.push(`${fieldName} must be no more than ${maxLength} characters.`);
};

/**
 * Checks if a number is within a specified range.
 * @param {number} val - The value to check.
 * @param {string} units - The units applicable to the value being checked.
 * @param {number} min - Minimum allowable value.
 * @param {number} max - Maximum allowable value.
 * @param {Array} errors - Array to store error messages.
 * @param {string} fieldName - Name of the field being validated.
 */
const checkNumberRange = (val, units, min, max, errors, fieldName) => {
  if (val < min) errors.push(`${fieldName} must be at least ${min}${units}.`);
  if (val > max)
    errors.push(`${fieldName} must be no more than ${max}${units}.`);
};

/**
 * Calculates age in years (as a decimal) from the given date of birth.
 * @param {string} dob - Date of birth in ISO format.
 * @returns {number} - Age in years (including decimal).
 */
const ageInYears = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);

  const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000; // average year length accounting for leap years
  const ageInMilliseconds = today - birthDate;

  const decimalAge = ageInMilliseconds / millisecondsPerYear;
  return decimalAge;
};

export const data = ref({
  form: {
    /**
     * Checks if the form with the given index is valid.
     * @param {number} formIndex - The index of the form to validate.
     * @returns {boolean} - True if the form is valid, false otherwise.
     */
    isValid(formIndex) {
      let isValid = true;
      for (let i in data.value.inputs) {
        let input = data.value.inputs[i];
        let isOptional = false;
        if (input.optionalForForms) {
          if (input.optionalForForms.includes(formIndex)) isOptional = true;
        }
        if (input.form.includes(formIndex)) {
          //console.log(`Validating ${i}`, input.isValid(isOptional));
          if (!input.isValid(isOptional)) isValid = false;
        }
      }
      return isValid;
    },
    joeBloggs() {
      data.value.inputs.legalAgreement.val = "true";
      data.value.inputs.episodeType.val = "test";
      data.value.inputs.patientDOB.val = "2019-03-31";
      data.value.inputs.patientSex.val = "male";
      data.value.inputs.weight.val = 20;
      data.value.inputs.operationalCentre.val = "Paris";
      data.value.inputs.operationalCentre.isValid();
      data.value.inputs.project.val = "OCP-12345-ProjectName";

      data.value.inputs.bloodGasAvailable.val = "false";
      data.value.inputs.bloodKetonesAvailable.val = "false";
      data.value.inputs.syringeDriverAvailable.val = "true";

      data.value.inputs.glucose.val = 250;
      data.value.inputs.urineKetones.val = 3;
      data.value.inputs.diagnosticFeatures.val = "true";
      data.value.inputs.shockPresent.val = "false";
      data.value.inputs.gcs.val = 14;
      data.value.inputs.respiratorySupport.val = "false";

      console.log("Joe Bloggs data filled");
    },
  },
  inputs: {
    legalAgreement: {
      val: false,
      label: "Agreement to legal disclaimer",
      privacyInfo: "Your agreement to the legal disclaimer is recorded.",
      form: [0],
      isValid() {
        return this.val;
      },
    },
    episodeType: {
      val: "",
      label: "What is this protocol being used for?",
      privacyLabel: "Episode type",
      form: [1],
      info: "If you are just trying out the calculator and do not intend to use the calculations for a real clinical case, select 'For testing or training purposes' to exclude the case from data analysis of real cases.",
      privacyInfo:
        "Episode type (real / test) is stored by the calculator for audit purposes and to allow exclusion of test cases from data analysis.",
      /**
       * Validates the episode type.
       * @returns {boolean} - True if the type is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val) this.errors += "Episode type must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    patientDOB: {
      val: "",
      label: "Date of birth",
      form: [1],
      info: "Patient date of birth is used to find the patient age which is used to check the weight against a sex-specific age-based safety range, to select the IV insulin rate or IM insulin doses. The date of birth is not stored by the calculator but the patient age is stored for audit and data analysis.",
      /**
       * Builds the patient's age in years from the date of birth.
       */
      patientAge: {
        build() {
          this.val = ageInYears(data.value.inputs.patientDOB.val);
        },
      },
      /**
       * Computes the minimum allowable date of birth based on age limit.
       * @returns {Date} - The minimum allowable date.
       */
      minDate() {
        const minDate = new Date();
        minDate.setFullYear(
          minDate.getFullYear() - (config.value.validation.patientAge.max + 1)
        );
        return minDate;
      },
      /**
       * Calculates the age in months from the date of birth.
       * @returns {number} - Age in months.
       */
      ageMonths() {
        return (ageInYears(this.val) * 12).toFixed(0);
      },
      /**
       * Validates the date of birth.
       * @returns {boolean} - True if the date of birth is valid, false otherwise.
       */
      isValid(triggerFunc) {
        const errors = [];
        const dateVal = new Date(this.val);
        if (isNaN(Date.parse(this.val)))
          errors.push("A valid date must be entered for date of birth.");
        if (dateVal > new Date())
          errors.push("Date of birth cannot be after today.");

        this.patientAge.build();
        if (this.patientAge.val > config.value.validation.patientAge.max) {
          errors.push(
            `Patient age cannot be greater than ${config.value.validation.patientAge.max.toFixed(
              0
            )} years.`
          );
        }

        this.errors = errors.join(" ");

        if (triggerFunc != "weightIsValid") data.value.inputs.weight.isValid();

        return !errors.length;
      },
      errors: "",
    },
    patientSex: {
      val: "",
      label: "Patient sex",
      form: [1],
      info: "Patient sex is used to check the weight against a sex-specific age-based safety range. It is stored by the calculator for audit and data analysis.",
      /**
       * Validates the patient sex.
       * @returns {boolean} - True if the sex is selected, false otherwise.
       */
      isValid(triggerFunc) {
        this.errors = this.val ? "" : "Patient sex must be selected.";
        if (triggerFunc != "weightIsValid") data.value.inputs.weight.isValid();
        return !this.errors;
      },
      errors: "",
    },
    weight: {
      val: null,
      label: "Weight",
      form: [1],
      info: "Weight is used to perform fluid and insulin calculations. If the weight provided falls outside 2 standard deviations of the mean for age you will need to override a warning, providing you are confident the value is correct.",
      privacyInfo:
        "Weight is used to perform fluid and insulin calculations. It is stored by the calculator for audit and data analysis. If the weight provided falls outside 2 standard deviations of the mean for age, whether or not you override this limit is also recorded.",
      min() {
        return config.value.validation.weight.min;
      },
      max() {
        return config.value.validation.weight.max;
      },
      step: 0.01,
      limit: {
        /**
         * Returns the lower weight limit based on patient sex and age in months.
         * @returns {number} - The lower weight limit.
         */
        lower() {
          return config.value.weightLimits[data.value.inputs.patientSex.val]
            .lower[data.value.inputs.patientDOB.ageMonths()];
        },
        /**
         * Returns the upper weight limit based on patient sex and age in months, capped by the maximum allowed weight.
         * @returns {number} - The upper weight limit.
         */
        upper() {
          let upper =
            config.value.weightLimits[data.value.inputs.patientSex.val].upper[
              data.value.inputs.patientDOB.ageMonths()
            ];
          if (upper > config.value.weightLimits.max)
            upper = config.value.weightLimits.max;
          return upper;
        },
        exceeded: false,
        override: false,
        overrideConfirm: false,
        use2SD: false,
        overrideLabel: "Override weight limit",
      },
      /**
       * Validates the weight.
       * @returns {boolean} - True if the weight is valid, false otherwise.
       */
      isValid() {
        const errors = [];
        this.errors = "";
        if (!this.val) {
          this.errors += "Weight must be provided. ";
          return false;
        }

        if (!data.value.inputs.patientDOB.isValid("weightIsValid")) {
          this.errors +=
            "Cannot check weight against safety range without a valid date of birth. ";
          return false;
        }

        if (!data.value.inputs.patientSex.isValid("weightIsValid")) {
          this.errors +=
            "Cannot check weight against safety range without a selected patient sex. ";
          return false;
        }

        //if was set to +2SD from override page and then subsequently changed, remove use2SD flag
        if (this.val != this.limit.upper().toFixed(2))
          this.limit.use2SD = false;

        this.val = Number.parseFloat(this.val).toFixed(2);

        checkNumberRange(
          Number.parseFloat(this.val),
          "",
          this.min(),
          this.max(),
          errors,
          "Weight"
        );

        this.errors = errors.join(" ");
        if (errors.length) return false;

        if (
          Number.parseFloat(this.val) < this.limit.lower().toFixed(2) ||
          Number.parseFloat(this.val) > this.limit.upper().toFixed(2)
        ) {
          this.limit.exceeded = true;
          if (!this.limit.override) {
            this.errors += `Weight must be within 2 standard deviations of the mean for age (upper limit ${
              config.value.weightLimits.max
            } kg) (range ${this.limit.lower().toFixed(2)} kg to ${this.limit
              .upper()
              .toFixed(2)} kg).`;
          }
        } else {
          this.limit.exceeded = false;
          this.limit.override = false;
        }

        if (this.errors) return false;
        return true;
      },
      errors: "",
    },
    operationalCentre: {
      val: "",
      label: "Select operational centre",
      privacyLabel: "Operational centre",
      form: [1],
      info: "Operational centre is stored by the calculator for audit purposes.",
      /**
       * Validates the OC selection and updates the project options based on the selected OC.
       * @returns {boolean} - True if the OC is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val) {
          this.errors += "Operational centre must be selected. ";
        } else {
          for (let operationalCentre of config.value.operationalCentres) {
            if (operationalCentre.name == this.val)
              data.value.inputs.project.options = operationalCentre.projects;
          }
        }
        return !this.errors;
      },
      errors: "",
    },
    project: {
      val: "",
      label: "Please select the project",
      privacyLabel: "Project",
      options: [],
      form: [1],
      info: "Project is stored by the calculator for audit purposes.",
      /**
       * Validates the project selection.
       * @returns {boolean} - True if the project is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val) this.errors += "Project must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    bloodGasAvailable: {
      val: null,
      label: "Blood gas available?",
      form: [2],
      info: "If blood gas is available you will be asked to provide a value for blood pH and (optionally) bicarbonate. These values are used to determine DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "Blood gas availability is stored for audit and data analysis.",
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Availability of blood gas must be selected. ";
        if (this.val != "true") {
          data.value.inputs.pH.val = null;
          data.value.inputs.bicarbonate.val = null;
        }
        return !this.errors;
      },
      errors: "",
    },
    bloodKetonesAvailable: {
      val: null,
      label: "Blood ketones available?",
      form: [2],
      info: "If blood ketones are available this value is used to establish DKA diagnosis, whereas urine ketones will be used if not.",
      privacyInfo:
        "Blood ketone availability is stored for audit and data analysis.",
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Availability of blood ketones must be selected. ";
        if (this.val != "true") {
          data.value.inputs.bloodKetones.val = null;
        } else {
          data.value.inputs.urineKetones.val = null;
        }
        return !this.errors;
      },
      errors: "",
    },
    syringeDriverAvailable: {
      val: null,
      label: "Syringe driver available?",
      form: [2],
      info: "If a syringe driver is available IV insulin infusion rate will be provided, otherwise 2-hourly IM doses.",
      privacyInfo:
        "Syringe driver availability is stored for audit and data analysis.",
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Availability of syringe driver must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    glucose: {
      val: null,
      unit: null,
      unitChange() {
        if (!this.unit) {
          //set the default unit
          this.unit = Object.keys(config.value.validation.glucose.units).find(
            (key) => config.value.validation.glucose.units[key].default
          );
        } else {
          //update the min/max and (if shown) the invalid message
          this.min();
          this.max();
          this.isValid();
        }
      },
      label: "Glucose",
      info: "Glucose is used to confirm the diagnosis of DKA is correct.",
      privacyInfo:
        "Glucose is used to confirm the diagnosis of DKA is correct and is stored for audit and data analysis.",
      form: [3],
      min() {
        if (!this.unit) this.unitChange();
        return config.value.validation.glucose.units[this.unit].min;
      },
      max() {
        if (!this.unit) this.unitChange();
        return config.value.validation.glucose.units[this.unit].max;
      },
      step: 0.1,
      /**
       * Validates the glucose value.
       * @returns {boolean} - True if the glucose value is valid, false otherwise.
       */
      isValid() {
        const errors = [];
        if (!this.unit) this.unitChange();
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push("Glucose must be provided. ");
        } else {
          this.val = Number.parseFloat(this.val).toFixed(1);
          checkNumberRange(
            this.val,
            this.unit,
            this.min(),
            this.max(),
            errors,
            "Glucose"
          );
        }
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },
    bloodKetones: {
      val: null,
      label: "Blood ketones",
      info: "Blood ketone value (if provided) is used to check the diagnostic threshold for DKA is reached.",
      privacyInfo:
        "Blood ketone value (if provided) is used to check the diagnostic threshold for DKA is reached and is stored for audit and data analysis.",
      form: [3],
      min() {
        return config.value.validation.bloodKetones.min;
      },
      max() {
        return config.value.validation.bloodKetones.max;
      },
      step: 0.1,
      /**
       * Validates the bloodKetones level.
       * @returns {boolean} - True if the bloodKetones level is valid, false otherwise.
       */
      isValid() {
        if (data.value.inputs.bloodKetonesAvailable.val === "false")
          return true;
        if (this.val === null || isNaN(this.val) || this.val == "") {
          this.errors = "Blood ketones must be provided. ";
          return false;
        } else if (this.val < config.value.validation.bloodKetones.min) {
          this.errors = `Biochemical threshold for DKA not met: blood ketones should be >=${config.value.validation.bloodKetones.min}mmol/L.`;
          return false;
        }
        const errors = [];
        this.val = Number.parseFloat(this.val).toFixed(1);
        checkNumberRange(
          this.val,
          "mmol/L",
          this.min(),
          this.max(),
          errors,
          "Blood ketones"
        );
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
      available: {
        val: null,
        label: "Blood ketones available?",
        info: "If blood ketones are available this is used to confirm DKA diagnosis. It is stored for audit purposes.",
        isValid() {
          this.errors = "";
          if (!this.val)
            this.errors += "Availability of blood ketones must be selected. ";
          if (this.val === "true") data.value.inputs.urineKetones.val = null;
          if (this.val === "false") data.value.inputs.bloodKetones.val = null;
          return !this.errors;
        },
        errors: "",
      },
    },
    urineKetones: {
      val: null,
      setVal(newVal) {
        this.val = newVal;
        this.isValid();
      },
      label: "Urine ketones",
      info: "Urine ketone value (if provided) is used to check the diagnostic threshold for DKA is reached.",
      privacyInfo:
        "Urine ketone value (if provided) is used to check the diagnostic threshold for DKA is reached and is stored for audit and data analysis.",
      form: [3],
      min() {
        return config.value.validation.urineKetones.min;
      },
      max() {
        return config.value.validation.urineKetones.max;
      },
      step: 0.1,
      /**
       * Validates the urineKetones level.
       * @returns {boolean} - True if the urineKetones level is valid, false otherwise.
       */
      isValid() {
        if (data.value.inputs.bloodKetonesAvailable.val === "true") return true;
        if (isNaN(this.val) || this.val === null || this.val == "") {
          this.errors = "Urine ketones must be provided. ";
          return false;
        } else if (this.val < config.value.validation.urineKetones.min) {
          this.errors = `Biochemical threshold for DKA not met: urine ketones should be >=${config.value.validation.urineKetones.min}+.`;
          return false;
        }
        const errors = [];
        this.val = Number.parseInt(this.val);
        checkNumberRange(
          this.val,
          "+",
          this.min(),
          this.max(),
          errors,
          "Urine ketones"
        );
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },
    diagnosticFeatures: {
      val: null,
      label: "Clinical features of DKA?",
      form: [3],
      info: "The presence of clinical features of DKA is used to check the diagnostic threshold for DKA is reached.",
      privacyInfo:
        "The presence of clinical features of DKA is used to check the diagnostic threshold for DKA is reached and is stored for audit and data analysis.",

      isValid() {
        this.errors = "";
        if (this.val !== "true")
          this.errors += "Diagnosis requires clinical features of DKA. ";
        return !this.errors;
      },
      errors: "",
    },
    pH: {
      val: null,
      label: "pH",
      form: [3],
      info: "pH (if provided) is used to determine DKA severity which is used in fluid deficit calculations. It is stored by the calculator for audit purposes.",
      privacyInfo:
        "pH (if provided) is used to determine DKA severity which is used in fluid deficit calculations and is stored by the calculator for audit purposes.",
      min() {
        return config.value.validation.pH.min;
      },
      max() {
        return config.value.validation.pH.max;
      },
      step: 0.01,
      /**
       * Validates the pH value.
       * @returns {boolean} - True if the pH value is valid, false otherwise.
       */
      isValid() {
        if (data.value.inputs.bloodGasAvailable.val === "false") return true;
        const errors = [];
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push("pH must be provided. ");
        } else {
          this.val = Number.parseFloat(this.val).toFixed(2);
          checkNumberRange(this.val, "", this.min(), this.max(), errors, "pH");
        }
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },
    bicarbonate: {
      val: null,
      label: "Bicarbonate (optional)",
      form: [3],
      info: "Bicarbonate (if provided) is used to check the diagnostic threshold for DKA is reached.",
      privacyInfo:
        "Bicarbonate (if provided) is used to check the diagnostic threshold for DKA is reached and is stored by the calculator for audit purposes.",
      min() {
        return config.value.validation.bicarbonate.min;
      },
      max() {
        return config.value.validation.bicarbonate.max;
      },
      step: 0.1,
      /**
       * Validates the bicarbonate value.
       * @returns {boolean} - True if the bicarbonate value is valid, false otherwise.
       */
      isValid() {
        if (data.value.inputs.bloodGasAvailable.val === "false") return true;
        if (
          data.value.inputs.pH.val <
          config.value.validation.pH.diagnosticThreshold
        )
          return true;
        const errors = [];
        if (isNaN(this.val)) {
          errors.push(
            `Bicarbonate must be provided if pH above diagnostic threshold of ${config.value.validation.pH.diagnosticThreshold}. `
          );
        } else {
          this.val = Number.parseFloat(this.val).toFixed(1);
          checkNumberRange(
            this.val,
            "mmol/L",
            this.min(),
            this.max(),
            errors,
            "Bicarbonate"
          );
        }
        if (
          data.value.inputs.pH.val <
            config.value.validation.pH.diagnosticThreshold &&
          this.val >= config.value.validation.bicarbonate.diagnosticThreshold
        )
          errors.push(
            `Biochemical threshold for DKA not met: if blood gas testing available pH should be <${config.value.validation.pH.diagnosticThreshold} or bicarbonate should be <${config.value.validation.bicarbonate.diagnosticThreshold}.`
          );
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },
    shockPresent: {
      val: "",
      label: "Is the patient clinically shocked?",
      privacyLabel: "Clinical shock status",
      form: [3],
      info: "Clinical shock status is used to determine bolus duration/rate, and DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "Clinical shock status is used to determine bolus duration/rate, and DKA severity which impacts on fluid calculations. It is stored by the calculator for audit and data analysis.",
      /**
       * Validates the clinical shock status.
       * @returns {boolean} - True if the status is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Clinical shock status must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    gcs: {
      val: null,
      label: "GCS",
      form: [3],
      info: "GCS is used to determine DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "GCS is used to determine DKA severity which impacts on fluid calculations. It is stored by the calculator for audit and data analysis.",
      min() {
        return config.value.validation.gcs.min;
      },
      max() {
        return config.value.validation.gcs.max;
      },
      step: 1,
      /**
       * Validates the gcs value.
       * @returns {boolean} - True if the gcs value is valid, false otherwise.
       */
      isValid() {
        const errors = [];
        if (data.value.inputs.shockPresent.val == "true") return true;
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push("GCS must be provided. ");
        } else {
          this.val = Number.parseFloat(this.val).toFixed(0);
          checkNumberRange(this.val, "", this.min(), this.max(), errors, "GCS");
        }
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },
    respiratorySupport: {
      val: "",
      label: "Is the patient on oxygen or respiratory support?",
      privacyLabel: "Respiratory support status",
      form: [3],
      info: "Respiratory support status is used to determine DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "Respiratory support status is used to determine DKA severity which impacts on fluid calculations. It is stored by the calculator for audit and data analysis.",
      /**
       * Validates the respiratory support status.
       * @returns {boolean} - True if the status is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (data.value.inputs.shockPresent.val == "true") return true;
        if (
          data.value.inputs.gcs.val <=
          config.value.validation.gcs.severeThreshold
        )
          return true;
        if (
          data.value.inputs.pH.val < config.value.validation.pH.severeThreshold
        )
          return true;
        if (!this.val)
          this.errors += "Respiratory support status must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    other: {
      privacyLabel: "Other data recorded",
      form: [],
      privacyInfo:
        "In addition to the input fields above, the following data are recorded to enable audit, security and performance monitoring: <ul><li>The audit ID (unique to each set of calculations performed) which should also be recorded in the patient notes and can be used for audit data linkage</li><li>Software version of the calculator used for the episode</li><li>The results of the calculations performed by the calculator including DKA severity, fluid and insulin calculations</li><li>The date/time when the protocol was generated</li><li>The browser type (useragent) used to access the calculator</li><li>The IP address of the device used to access the calculator</li></ul>",
    },
  },
  calculations: {},
  auditID: "",
});
