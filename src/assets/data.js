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
 * Formats a UK postcode by converting to uppercase and removing spaces.
 * @param {string} val - The postcode to format.
 * @returns {string} - The formatted postcode.
 */
const formatPostcode = (val) => val.toUpperCase().replace(/\s/g, "");

/**
 * Builds an ISO string for the given date.
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
const buildDateString = (date) => {
  const pad = (num) => (num < 10 ? `0${num}` : num);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
          if (!input.isValid(isOptional)) isValid = false;
        }
      }
      return isValid;
    },
    joeBloggs() {
      data.value.inputs.legalAgreement.val = 'true'
      data.value.inputs.patientName.val = "Joe Bloggs"
      data.value.inputs.patientDOB.val = "2019-03-31"
      data.value.inputs.patientSex.val = "male"
      data.value.inputs.patientIdentifier.val = "ABC123"
      data.value.inputs.pH.available.val = 'false'
      data.value.inputs.bloodKetones.available.val = 'false'
      data.value.inputs.bloodKetones.available.isValid()
      data.value.inputs.urineKetones.val = 3
      data.value.inputs.glucose.val = 25
      data.value.inputs.weight.val = 20
      data.value.inputs.shockPresent.val = 'false'
      data.value.inputs.insulinRate.val = 0.05
      data.value.inputs.episodeType.val = 'test'
      data.value.inputs.region.val = 'South West'
      data.value.inputs.region.isValid()
      data.value.inputs.centre.val = 'Taunton and Somerset'
      data.value.inputs.preExistingDiabetes.val = 'false'
      console.log('Joe Bloggs data filled')
    }
  },
  inputs: {
    legalAgreement: {
      val: false,
      label: "Agreement to legal disclaimer",
      info: "Your agreement to the legal disclaimer is recorded.",
      form: [0],
      isValid() {
        return this.val;
      },
    },
    patientName: {
      val: "",
      label: "Full name",
      form: [1],
      info: "Patient name is printed onto the generated care pathway document in the patient demographics area. It is not stored by the DKA Calculator.",
      minLength: 5,
      maxLength: 80,
      /**
       * Validates the patient name.
       * @returns {boolean} - True if the name is valid, false otherwise.
       */
      isValid() {
        const errors = [];
        checkLength(this.val, this.minLength, this.maxLength, errors, "Name");
        this.errors = errors.join(" ");
        return !errors.length;
      },
      errors: "",
    },
    patientDOB: {
      val: "",
      label: "Date of birth",
      form: [1, 4],
      info: "Patient date of birth is printed onto the generated care pathway document in the patient demographics area. It is not stored directly by the DKA Calculator, but is used to calculate a patient age (in decimal years) which is used to check the patient weight is within the expected range. The decimal age is stored for audit purposes. To allow linkage of audit data between episodes the patient date of birth is also used (together with the NHS number) to generate a unique patient ID which is stored. The patient date of birth cannot be found from the calculated unique patient ID (<a href='https://www.codecademy.com/resources/blog/what-is-hashing/' target='_blank'>read more about secure cryptographic hashing</a>).",
      updateInfo:
        "Patient date of birth is not stored directly by the DKA Calculator. It is used to generate a unique patient ID which is compared with the unique ID generated when the episode was created to ensure the correct record is being updated. The patient date of birth cannot be found from the calculated unique patient ID (<a href='https://www.codecademy.com/resources/blog/what-is-hashing/' target='_blank'>read more about secure cryptographic hashing</a>).",
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
      isValid() {
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
        return !errors.length;
      },
      errors: "",
    },
    patientSex: {
      val: "",
      label: "Patient sex",
      form: [1],
      info: "Patient sex is printed onto the generated care pathway. It is stored by the DKA Calculator for audit purposes.",
      /**
       * Validates the patient sex.
       * @returns {boolean} - True if the sex is selected, false otherwise.
       */
      isValid() {
        this.errors = this.val ? "" : "Patient sex must be selected.";
        return !this.errors;
      },
      errors: "",
    },
    patientIdentifier: {
      val: "",
      label: "Patient identifier",
      form: [1],
      info: "Patient identifier is printed onto the generated care pathway document in the patient demographics area. It is not stored directly by the Calculator. To allow linkage of audit data between episodes the patient identifier is used to generate a unique patient hash which is stored. The patient identifier cannot be found from the calculated unique patient hash (<a href='https://www.codecademy.com/resources/blog/what-is-hashing/' target='_blank'>read more about secure cryptographic hashing</a>).",
      minLength: 4,
      maxLength: 20,
      /**
       * Validates the patient identifier.
       * @returns {boolean} - True if the patient identifier is valid, false otherwise.
       */
      isValid() {
        const errors = [];
        checkLength(
          this.val,
          this.minLength,
          this.maxLength,
          errors,
          "Patient identifier"
        );
        this.errors = errors.join(" ");
        return !errors.length;
      },
      errors: "",
    },
    protocolStartDatetime: {
      val: "",
      label: "Protocol start date/time",
      form: [2],
      info: "The protocol start date/time is used to calculate recommended review date/times on the serial data sheet on the care pathway. It is stored by the DKA Calculator for audit purposes.",
      todayString: {
        /**
         * Generates a string for today's date and assigns it to this.val.
         */
        build() {
          this.val = buildDateString(new Date());
        },
        val: "",
      },
      minDate: {
        /**
         * Generates a datetime object of the earliest allowable time the protocolStartDatetime can be set to and assigns it to this.val.
         */
        build() {
          const today = new Date();
          this.val = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            today.getHours() -
              config.value.validation.protocolStartDatetime.withinPastHours,
            today.getMinutes()
          );
        },
        val: null,
      },
      minDateString: {
        /**
         * Generates a string for minDate and assigns that value to this.val.
         */
        build() {
          this.val = buildDateString(
            data.value.inputs.protocolStartDatetime.minDate.val
          );
        },
        val: "",
      },
      maxDate: {
        /**
         * Generates a datetime object of the latest allowable time the protocolStartDatetime can be set to and assigns it to this.val.
         */
        build() {
          const today = new Date();
          this.val = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            today.getHours() +
              config.value.validation.protocolStartDatetime.withinFutureHours,
            today.getMinutes()
          );
        },
        val: null,
      },
      maxDateString: {
        /**
         * Generates a string for maxDate and assigns that value to this.val.
         */
        build() {
          this.val = buildDateString(
            data.value.inputs.protocolStartDatetime.maxDate.val
          );
        },
        val: "",
      },
      /**
       * Validates the protocol start date/time.
       * @returns {boolean} - True if the date/time is valid, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (isNaN(Date.parse(this.val))) {
          this.errors =
            "A valid date/time must be entered for protocol start date/time. ";
          return false;
        }
        const dateVal = new Date(this.val);
        if (dateVal < this.minDate.val) {
          this.errors = `Protocol start must be within the past ${config.value.validation.protocolStartDatetime.withinPastHours} hours of the current date/time. `;
          return false;
        }
        if (dateVal > this.maxDate.val) {
          this.errors = `Protocol start must be no more than ${
            config.value.validation.protocolStartDatetime.withinFutureHours
          } ${
            config.value.validation.protocolStartDatetime.withinFutureHours ===
            1
              ? "hour"
              : "hours"
          } ahead of the current date/time. `;
          return false;
        }
        return true;
      },
      errors: "",
    },
    pH: {
      val: null,
      label: "pH",
      form: [2],
      info: "pH is added to the relevant field in the care pathway. pH is used to determine DKA severity which is used in fluid deficit calculations. It is stored by the DKA Calculator for audit purposes.",
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
        if (!this.available.isValid()) return false
        if (this.available.val === 'false') return true
        const errors = [];
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push("pH must be provided. ");
        } else if (this.val >= config.value.severity.mild.pHRange.upper) {
            errors.push(
              `To meet the diagnostic criteria for DKA, pH must be below ${config.value.severity.mild.pHRange.upper} (if provided). `
            );
        } else {
          this.val = Number.parseFloat(this.val).toFixed(2);
          checkNumberRange(this.val, "", this.min(), this.max(), errors, "pH");
        }
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
      available: {
        val: null,
        label: "pH available?",
        info: "If pH is available this is used to deterime DKA severity. It is stored for audit purposes.",
        isValid() {
          this.errors = "";
          if (!this.val)
            this.errors += "Availability of pH must be selected. ";
          return !this.errors;
        },
        errors: ""
      }
    },
    bloodKetones: {
      val: null,
      label: "Blood ketones",
      info:
        "If provided, blood ketone level will be added to the relevant field in the care pathway. Blood ketone level is used to check the diagnostic threshold for DKA is reached. It is stored by the DKA Calculator for audit purposes.",
      form: [2],
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
        if (!this.available.isValid()) return false
        if (this.available.val === 'false') return true
        if (this.val === null || isNaN(this.val) || this.val == "") {
          this.errors = "Blood ketones must be provided. ";
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
          if (this.val === 'true') data.value.inputs.urineKetones.val = null
          if (this.val === 'false') data.value.inputs.bloodKetones.val = null
          return !this.errors;
        },
        errors: ""
      }
    },
    urineKetones: {
      val: null,
      setVal(newVal) {
        this.val = newVal
        this.isValid()
      },
      label: "Urine ketones",
      info:
        "If provided, urine ketone level will be added to the relevant field in the care pathway. Urine ketone level is used to check the diagnostic threshold for DKA is reached. It is stored by the DKA Calculator for audit purposes.",
      form: [2],
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
        if (!data.value.inputs.bloodKetones.available.isValid()) return false
        if (data.value.inputs.bloodKetones.available.val === 'true') return true
        if (isNaN(this.val)) {
          this.errors = "Urine ketones must be provided. ";
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
    glucose: {
      val: null,
      label: "Glucose",
      info:
        "Glucose will be added to the relevant field in the care pathway. It is stored by the DKA Calculator for audit purposes.",
      form: [2, 5],
      min() {
        return config.value.validation.glucose.min;
      },
      max() {
        return config.value.validation.glucose.max;
      },
      step: 0.1,
      /**
       * Validates the glucose value.
       * @returns {boolean} - True if the glucose value is valid, false otherwise.
       */
      isValid() {
        const errors = [];
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push("Glucose must be provided. ");
        } else {
          this.val = Number.parseFloat(this.val).toFixed(1);
          checkNumberRange(
            this.val,
            "mmol/L",
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
    weight: {
      val: null,
      label: "Weight",
      form: [2],
      info: "Weight is used to calculate fluid volumes for boluses, deficit replacement and maintenance. It is stored by the DKA Calculator for audit purposes. If the weight provided falls outside 2 standard deviations of the mean for age, whether or not you override this limit is also recorded.",
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
        this.errors = ""
        if (!this.val) {
          this.errors += "Weight must be provided. ";
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
    shockPresent: {
      val: "",
      label: "Is the patient clinically shocked?",
      privacyLabel: "Clinical shock status",
      form: [2],
      info: "Clinical shock status is used to indicate initial resuscitation strategy on the care pathway and to determine if the initial bolus is subtracted from the fluid deficit as part of the fluid calculations. It is stored by the DKA Calculator for audit purposes.",
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
    insulinRate: {
      val: "",
      label: "What starting rate of insulin is required?",
      privacyLabel: "Insulin starting rate",
      form: [2],
      info: "Insulin starting rate (in Units/kg/hour) is used to calculate an insulin rate in Units/hr. It is stored by the DKA Calculator for audit purposes.",
      /**
       * Validates the insulin starting rate.
       * @returns {boolean} - True if the rate is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Insulin starting rate must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    episodeType: {
      val: "",
      label: "What is this protocol being used for?",
      privacyLabel: "Episode type",
      form: [3],
      info: "Episode type is stored by the DKA Calculator for audit purposes.",
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
    region: {
      val: "",
      label: "Please select your region",
      privacyLabel: "Region",
      form: [3],
      info: "Region is stored by the DKA Calculator for audit purposes.",
      /**
       * Validates the region selection and updates the centre options based on the selected region.
       * @returns {boolean} - True if the region is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val) {
          this.errors += "Region must be selected. ";
        } else {
          for (let region of config.value.regions) {
            if (region.name == this.val)
              data.value.inputs.centre.options = region.centres;
          }
        }
        return !this.errors;
      },
      errors: "",
    },
    centre: {
      val: "",
      label: "Please select the treating centre",
      privacyLabel: "Treating centre",
      options: [],
      form: [3],
      info: "Treating centre is stored by the DKA Calculator for audit purposes.",
      /**
       * Validates the treating centre selection.
       * @returns {boolean} - True if the centre is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val) this.errors += "Treating centre must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    preExistingDiabetes: {
      val: "",
      label:
        "Was the patient known to have diabetes prior to the current episode of DKA?",
      privacyLabel: "Pre-existing diabetes status",
      form: [3],
      info: "If the patient has pre-existing diabetes, it is used to indicate the approach to managing existing insulin therapy on the care pathway. Pre-existing diabetes status also determines the preventable factors options that can be selected. It is stored by the DKA Calculator for audit purposes.",
      updateInfo:
        "Pre-existing diabetes status determines the preventable factors options that can be selected and is stored by the DKA Calculator for audit purposes.",
      /**
       * Validates the pre-existing diabetes status.
       * @returns {boolean} - True if the status is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (this.val == "false")
          data.value.inputs.underFollowUp.val = "";
        if (!this.val)
          this.errors += "Pre-existing diabetes status must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    underFollowUp: {
      val: "",
      label: "Is the patient under MSF diabetes follow up?",
      privacyLabel: "Under follow up",
      form: [3],
      info: "The under follow up status is stored by the DKA Calculator for audit purposes.",
      /**
       * Validates the follow up status.
       * @returns {boolean} - True if the method is selected, false otherwise.
       */
      isValid() {
        this.errors = "";
        if (!this.val && data.value.inputs.preExistingDiabetes.val == "true")
          this.errors += "Under follow up status must be selected. ";
        return !this.errors;
      },
      errors: "",
    },
    other: {
      privacyLabel: "Other data recorded",
      form: [],
      privacyInfo:
        "In addition to the input fields above, the following data are recorded to enable audit, security and performance monitoring: <ul><li>The audit ID (unique to for each care pathway generated) which is also printed on the generated PDF document and can be used for audit data linkage</li><li>Software version of the DKA Calculator used for the episode</li><li>The results of the calculations performed by the DKA Calculator including DKA severity, fluid and insulin calculations, corrected sodium and effective osmolality calculations</li><li>The date/time when the protocol was generated</li><li>The browser type (useragent) used to access the DKA Calculator</li><li>The IP address of the device used to access the DKA Calculator</li></ul>",
    },
  },
  calculations: {},
  auditID: "",
});
