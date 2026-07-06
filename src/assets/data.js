/**
 * @module data
 * @description Global reactive data store for the MSF Diabetes Calculator.
 *
 * Exports a single Vue `ref` (`data`) that holds the entire episode state:
 *
 * ```
 * data.value
 * ├── form          — form-level helpers (validation, reset, test pre-fill)
 * ├── inputs        — one entry per clinical input field (see below)
 * ├── calculations  — populated by Generate.vue after a successful API/offline response
 * └── auditID       — unique identifier returned by the server for the episode
 * ```
 *
 * Each entry in `inputs` follows a common shape:
 * ```
 * {
 *   val          — current value (null / "" / boolean / number / string)
 *   defaultVal   — value restored on form.reset() (omitted = null)
 *   label        — display label shown in the form template
 *   privacyLabel — alternative heading used on the Privacy Policy page
 *   info         — HTML/text shown in the collapsible info panel
 *   privacyInfo  — text shown on the Privacy Policy page instead of `info`
 *   form         — array of form-step indices this field belongs to
 *                  (0 = disclaimer, 1 = patient details, 2 = equipment,
 *                   3 = clinical details)
 *   errors       — string of current validation error messages (empty = valid)
 *   isValid()    — validates the field, sets `errors`, returns boolean
 * }
 * ```
 *
 * Utility functions (`checkNumberRange`, `ageInYears`) are
 * module-private and not exported.
 *
 * @requires vue           — for `ref`
 * @requires ./fetchConfig — for the shared `config` reactive ref
 * @requires sweetalert2  — for the reset confirmation dialog in `form.reset()`
 */
import { ref } from "vue";
import { config } from "./fetchConfig.js";
import Swal from "sweetalert2";

// ---------------------------------------------------------------------------
// Module-private utility functions
// ---------------------------------------------------------------------------

/**
 * Validates a numeric value against minimum and maximum bounds.
 * Pushes a human-readable error message into `errors` for each bound violated.
 *
 * @param {number}   val       - The numeric value to check.
 * @param {string}   units     - Unit string appended to the error message (e.g. "kg", "mmol/L").
 * @param {number}   min       - Minimum allowable value (inclusive).
 * @param {number}   max       - Maximum allowable value (inclusive).
 * @param {string[]} errors    - Mutable array to which error messages are appended.
 * @param {string}   fieldName - Display name of the field, used in error messages.
 */
const checkNumberRange = (val, units, min, max, errors, fieldName) => {
  if (val < min) errors.push(`${fieldName} must be at least ${min}${units}.`);
  if (val > max)
    errors.push(`${fieldName} must be no more than ${max}${units}.`);
};

/**
 * Calculates a patient's age in decimal years from their date of birth.
 *
 * Uses 365.25 days per year to account for leap years, giving a continuously
 * accurate decimal age rather than a floored integer.
 *
 * @param {string} dob - Date of birth as an ISO 8601 string (e.g. "2019-03-31").
 * @returns {number} Age in decimal years (e.g. 5.25 for 5 years and 3 months).
 */
const ageInYears = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);

  const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000; // average year length accounting for leap years
  const ageInMilliseconds = today - birthDate;

  const decimalAge = ageInMilliseconds / millisecondsPerYear;
  return decimalAge;
};

// ---------------------------------------------------------------------------
// Global reactive data store
// ---------------------------------------------------------------------------

export const data = ref({
  // -------------------------------------------------------------------------
  // form — episode-level helpers
  // -------------------------------------------------------------------------
  form: {
    /**
     * Checks whether all inputs belonging to a given form step are currently valid.
     *
     * Iterates over every input in `data.inputs`. For each input whose `form` array
     * includes `formIndex`, calls `input.isValid()`.
     *
     * Form step indices:
     *   0 — legal disclaimer (legalAgreement only)
     *   1 — patient details (episodeType, patientDOB, patientSex, weight,
     *                        operationalCentre, project)
     *   2 — equipment availability (bloodGasAvailable, bloodKetonesAvailable,
     *                               syringePumpAvailable, infusionPumpAvailable,
     *                               dropFactor)
     *   3 — clinical details (glucose, ketones, diagnosticFeatures, pH,
     *                         bicarbonate, shockPresent, gcs, respiratorySupport)
     *
     * @param {number} formIndex - The form step index to validate.
     * @returns {boolean} True if all required inputs for the step are valid.
     */
    isValid(formIndex) {
      let isValid = true;
      for (let i in data.value.inputs) {
        let input = data.value.inputs[i];
        if (input.form.includes(formIndex)) {
          if (!input.isValid()) isValid = false;
        }
      }
      return isValid;
    },

    /**
     * Resets the entire episode back to its initial state.
     *
     * For every input field: restores `val` to `defaultVal` (or null if none defined).
     * Also clears derived state that cannot be reset through `val` alone:
     *   - `inputs.project.options`  — project list is populated by operationalCentre.isValid()
     *   - `inputs.glucose.unit`     — unit is set lazily via unitChange()
     *   - `calculations`            — populated after a successful Generate run
     *   - `auditID`                 — returned by the server; cleared to prevent stale guidance
     */
    reset() {
      for (let i in data.value.inputs) {
        let input = data.value.inputs[i];
        input.val = input.defaultVal ? input.defaultVal : null;
      }
      data.value.inputs.project.options = [];
      data.value.inputs.glucose.unit = null;
      data.value.calculations = {};
      data.value.auditID = "";
    },

    /**
     * Pre-fills the form with a fixed set of test values ("Joe Bloggs").
     *
     * Used as a development convenience when the user navigates directly to a form
     * page without completing the disclaimer step. Pre-populates all required fields
     * with realistic but fictitious data so the rest of the form flow can be tested
     * without having to re-enter data each time.
     *
     * This should only be called in development mode
     * (`config.value.client.underDevelopment === true`).
     */
    joeBloggs() {
      data.value.inputs.legalAgreement.val = true;
      data.value.inputs.episodeType.val = "test";
      data.value.inputs.patientDOB.val = "2019-03-31";
      data.value.inputs.patientSex.val = "male";
      data.value.inputs.weight.val = 20;
      data.value.inputs.operationalCentre.val = "Paris";
      data.value.inputs.operationalCentre.isValid(); // triggers project.options population
      data.value.inputs.project.val = "Other";

      data.value.inputs.bloodGasAvailable.val = "false";
      data.value.inputs.bloodKetonesAvailable.val = "false";
      data.value.inputs.syringePumpAvailable.val = "true";
      data.value.inputs.infusionPumpAvailable.val = "true";

      data.value.inputs.glucose.val = 250;
      data.value.inputs.glucose.unit = "mg/dL";
      data.value.inputs.urineKetones.val = 3;
      data.value.inputs.diagnosticFeatures.val = "true";
      data.value.inputs.shockPresent.val = "false";
      data.value.inputs.gcs.val = 14;
      data.value.inputs.respiratorySupport.val = "false";

      console.log("Joe Bloggs data filled");
    },
  },

  // -------------------------------------------------------------------------
  // inputs — one object per clinical input field
  // -------------------------------------------------------------------------
  inputs: {
    /**
     * Legal agreement — records that the user has accepted the disclaimer.
     * Form step 0. Not shown in the form directly; set programmatically by
     * FormDisclaimer.vue on "Agree and continue".
     */
    legalAgreement: {
      val: false,
      defaultVal: false,
      label: "Agreement to legal disclaimer",
      privacyInfo: "Your agreement to the legal disclaimer is recorded.",
      form: [0],
      /**
       * Valid if the user has agreed (val === true).
       * @returns {boolean}
       */
      isValid() {
        return this.val;
      },
    },

    /**
     * Episode type — real clinical use or test/training.
     * Stored for audit; test episodes are excluded from real-case data analysis.
     * Form step 1.
     */
    episodeType: {
      val: "",
      label: "What is this protocol being used for?",
      privacyLabel: "Episode type",
      form: [1],
      info: "If you are just trying out the calculator and do not intend to use the calculations for a real clinical case, select 'For testing or training purposes' to exclude the case from data analysis of real cases.",
      privacyInfo:
        "Episode type (real / test) is stored by the calculator for audit purposes and to allow exclusion of test cases from data analysis.",
      /**
       * Valid if a value has been selected.
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (!this.val) this.errors += "Episode type must be selected. ";
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Patient date of birth — used to derive decimal age in years and in months.
     *
     * Supports two input modes toggled by `yearsMonths.switch.val`:
     *   - false (default): ISO date string entered in a date picker.
     *   - true: separate integer fields for years and months.
     *
     * Derived values:
     *   - `patientAge.val` — decimal age in years (built by `patientAge.build()`).
     *   - `ageMonths()`    — integer age in months (used for weight centile lookup).
     *
     * Side effect on validation: calls `weight.isValid()` (unless suppressed by
     * the `"weightIsValid"` sentinel) so the weight field re-validates whenever
     * the age changes.
     *
     * Form step 1.
     */
    patientDOB: {
      val: "",
      label: "Date of birth",
      /**
       * Years/months alternative input mode.
       * When `switch.val` is true the date picker is disabled and two number
       * inputs (years, months) are shown instead.
       */
      yearsMonths: {
        switch: {
          val: false,
          /**
           * Clears the opposing input mode's values when the toggle changes,
           * preventing stale data from the hidden mode being submitted.
           */
          change() {
            if (this.val) {
              // Switching TO years/months: clear the date string
              data.value.inputs.patientDOB.val = "";
            } else {
              // Switching TO date picker: clear years/months values
              data.value.inputs.patientDOB.yearsMonths.yearsVal = null;
              data.value.inputs.patientDOB.yearsMonths.monthsVal = null;
            }
          },
        },
        yearsVal: null,
        monthsVal: null,
      },
      form: [1],
      info: "Patient date of birth is used to find the patient age which is used to check the weight against a sex-specific age-based safety range, to select the IV insulin rate or IM insulin doses. The date of birth is not stored by the calculator but the patient age is stored for audit and data analysis.",
      /**
       * Derived patient age in decimal years.
       * `val` is populated by calling `build()`.
       */
      patientAge: {
        /**
         * Computes `patientAge.val` from whichever input mode is active.
         * Must be called before reading `patientAge.val`.
         */
        build() {
          if (data.value.inputs.patientDOB.yearsMonths.switch.val) {
            this.val =
              data.value.inputs.patientDOB.yearsMonths.yearsVal +
              data.value.inputs.patientDOB.yearsMonths.monthsVal / 12;
          } else {
            this.val = ageInYears(data.value.inputs.patientDOB.val);
          }
        },
      },
      /**
       * Returns the earliest (oldest) allowable date of birth.
       * Based on the maximum supported patient age in config.
       *
       * @returns {Date} The minimum allowable date of birth.
       */
      minDate() {
        const minDate = new Date();
        minDate.setFullYear(
          minDate.getFullYear() - (config.value.validation.patientAge.max + 1),
        );
        return minDate;
      },
      /**
       * Returns the patient's age in whole months.
       * Used to index into the sex-specific weight centile lookup tables.
       *
       * @returns {string} Age in months as a fixed-point integer string.
       */
      ageMonths() {
        if (data.value.inputs.patientDOB.yearsMonths.switch.val) {
          return (
            this.yearsMonths.yearsVal * 12 +
            this.yearsMonths.monthsVal
          ).toFixed(0);
        } else {
          return (ageInYears(this.val) * 12).toFixed(0);
        }
      },
      /**
       * Validates the date of birth (or years/months values).
       *
       * Side effects:
       *   - Calls `patientAge.build()` to keep the derived age in sync.
       *   - Calls `weight.isValid()` unless the `"weightIsValid"` sentinel is
       *     passed as `triggerFunc` (used to break mutual recursion when weight
       *     validation calls back into DOB validation).
       *
       * @param {string} [triggerFunc] - Pass `"weightIsValid"` to suppress the
       *   weight re-validation side effect.
       * @returns {boolean} True if the DOB is valid and within the supported age range.
       */
      isValid(triggerFunc) {
        const errors = [];
        if (this.yearsMonths.switch.val) {
          // Validate years/months mode
          if (
            isNaN(this.yearsMonths.yearsVal) ||
            this.yearsMonths.yearsVal === null ||
            this.yearsMonths.yearsVal === "" ||
            this.yearsMonths.yearsVal < 0 ||
            isNaN(this.yearsMonths.monthsVal) ||
            this.yearsMonths.monthsVal === null ||
            this.yearsMonths.monthsVal === "" ||
            this.yearsMonths.monthsVal < 0 ||
            this.yearsMonths.monthsVal > 11
          ) {
            errors.push("A valid age in years and months must be entered.");
          }
          this.patientAge.build();
        } else {
          // Validate date picker mode
          const dateVal = new Date(this.val);
          if (isNaN(Date.parse(this.val)))
            errors.push("A valid date must be entered for date of birth.");
          if (dateVal > new Date())
            errors.push("Date of birth cannot be after today.");

          this.patientAge.build();
        }

        // Age range check — must be below the configured maximum paediatric age
        if (this.patientAge.val >= config.value.validation.patientAge.max) {
          errors.push(
            "Patient age must be less than " +
              config.value.validation.patientAge.max.toFixed(0) +
              " years.",
          );
        }

        this.errors = errors.join(" ");

        // Re-validate weight whenever age changes (age affects the centile limits)
        if (triggerFunc != "weightIsValid") data.value.inputs.weight.isValid();

        return !errors.length;
      },
      errors: "",
    },

    /**
     * Patient sex — male or female.
     * Used with age to select the correct sex-specific weight centile table.
     * Stored for audit and data analysis.
     * Form step 1.
     */
    patientSex: {
      val: "",
      label: "Patient sex",
      form: [1],
      info: "Patient sex is used to check the weight against a sex-specific age-based safety range. It is stored by the calculator for audit and data analysis.",
      /**
       * Valid if a value has been selected.
       * Side effect: calls `weight.isValid()` (unless suppressed) because sex
       * affects the centile lookup used in weight validation.
       *
       * @param {string} [triggerFunc] - Pass `"weightIsValid"` to suppress weight re-validation.
       * @returns {boolean}
       */
      isValid(triggerFunc) {
        this.errors = this.val ? "" : "Patient sex must be selected.";
        if (triggerFunc != "weightIsValid") data.value.inputs.weight.isValid();
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Weight — patient weight in kg.
     *
     * Validation checks:
     *   1. Value is present and within the absolute numeric bounds from config.
     *   2. Requires a valid DOB and sex to perform centile range checking.
     *   3. Compares against `limit.lower()` and `limit.upper()` (+/-2 SD for age/sex).
     *      If outside this range: sets `limit.exceeded = true` and shows an error
     *      unless `limit.override` is true (user has confirmed via FormOverrideConfirm).
     *   4. If weight was set to the +2SD value via use2SD and subsequently changed,
     *      the `use2SD` flag is cleared.
     *
     * `limit` sub-object:
     *   - `lower()`        — -2 SD weight for age/sex (from config centile tables)
     *   - `upper()`        — +2 SD weight for age/sex, capped at config.weightLimits.max
     *   - `exceeded`       — true when weight is outside the +/-2 SD range
     *   - `override`       — true when the user has checked the override toggle
     *   - `overrideConfirm`— true when the user has confirmed the override on the
     *                        FormOverrideConfirm page
     *   - `use2SD`         — true when the weight was auto-set to +2SD by FormOverrideConfirm
     *
     * Form step 1.
     */
    weight: {
      val: null,
      label: "Weight",
      form: [1],
      info: "Weight is used to perform fluid and insulin calculations. If the weight provided falls outside 2 standard deviations of the mean for age you will need to override a warning, providing you are confident the value is correct.",
      privacyInfo:
        "Weight is used to perform fluid and insulin calculations. It is stored by the calculator for audit and data analysis. If the weight provided falls outside 2 standard deviations of the mean for age, whether or not you override this limit is also recorded.",
      /** @returns {number} Absolute minimum weight from config validation rules. */
      min() {
        return config.value.validation.weight.min;
      },
      /** @returns {number} Absolute maximum weight from config validation rules. */
      max() {
        return config.value.validation.weight.max;
      },
      step: 0.01,
      limit: {
        /**
         * Returns the -2 SD weight limit for the patient's current age and sex.
         * Indexed by age in whole months from the config centile lookup table.
         *
         * @returns {number} Lower weight limit in kg.
         */
        lower() {
          return config.value.weightLimits[data.value.inputs.patientSex.val]
            .lower[data.value.inputs.patientDOB.ageMonths()];
        },
        /**
         * Returns the +2 SD weight limit for the patient's current age and sex,
         * capped at the configured hard maximum (config.weightLimits.max).
         *
         * @returns {number} Upper weight limit in kg.
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
        exceeded: false, // true when weight is outside the +/-2 SD range
        override: false, // true when the user has enabled the override toggle
        overrideConfirm: false, // true when confirmed on the FormOverrideConfirm page
        use2SD: false, // true when weight was auto-set to +2SD value
        overrideLabel: "Override weight limit",
      },
      /**
       * Validates the weight value.
       *
       * Depends on DOB and sex being valid (needed for centile lookup).
       * Normalises val to 2 decimal places on success.
       *
       * @returns {boolean} True if weight passes all validation checks.
       */
      isValid() {
        const errors = [];
        this.errors = "";
        if (!this.val) {
          this.errors += "Weight must be provided. ";
          return false;
        }

        // DOB and sex must be valid before centile range can be checked
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

        // If the weight was set to +2SD from the override page but has since been
        // changed manually, remove the use2SD flag to avoid misleading the API
        if (
          Number.parseFloat(this.val).toFixed(2) !=
          this.limit.upper().toFixed(2)
        )
          this.limit.use2SD = false;

        this.val = Number.parseFloat(this.val).toFixed(2);

        // Check against absolute numeric bounds (not age-based)
        checkNumberRange(
          Number.parseFloat(this.val),
          "",
          this.min(),
          this.max(),
          errors,
          "Weight",
        );

        this.errors = errors.join(" ");
        if (errors.length) return false;

        // Check against age/sex-specific +/-2 SD centile range
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
          // Weight is within range: clear the override flags
          this.limit.exceeded = false;
          this.limit.override = false;
        }

        if (this.errors) return false;
        return true;
      },
      errors: "",
    },

    /**
     * Operational centre — MSF operational centre managing the treating facility.
     * Selecting a centre populates `project.options` with the centre's projects.
     * Stored for audit. Form step 1.
     */
    operationalCentre: {
      val: "",
      label: "Select operational centre",
      privacyLabel: "Operational centre",
      form: [1],
      info: "Operational centre is stored by the calculator for audit purposes.",
      /**
       * Validates the selection and, on success, populates the project options list
       * from the matching entry in config.operationalCentres.
       *
       * @returns {boolean} True if a centre has been selected.
       */
      isValid() {
        this.errors = "";
        if (!this.val) {
          this.errors += "Operational centre must be selected. ";
        } else {
          // Populate the project dropdown for the selected centre
          for (let operationalCentre of config.value.operationalCentres) {
            if (operationalCentre.name == this.val)
              data.value.inputs.project.options = operationalCentre.projects;
          }
        }
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Project — the specific MSF project within the selected operational centre.
     * Options are populated dynamically by `operationalCentre.isValid()`.
     * Stored for audit. Form step 1.
     */
    project: {
      val: "",
      label: "Please select the project",
      privacyLabel: "Project",
      options: [], // populated when operationalCentre.isValid() runs
      form: [1],
      info: "Project is stored by the calculator for audit purposes.",
      /**
       * Valid if a project has been selected.
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (!this.val) this.errors += "Project must be selected. ";
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Blood gas available — whether a blood gas analyser is accessible.
     *
     * Affects downstream form steps:
     *   - true  → pH and bicarbonate inputs are shown on FormClinicalDetails.
     *   - false → pH and bicarbonate are cleared and not submitted in the payload.
     *
     * Form step 2.
     */
    bloodGasAvailable: {
      val: null,
      label: "Blood gas available?",
      form: [2],
      info: "If blood gas is available you will be asked to provide a value for blood pH and (optionally) bicarbonate. These values are used to determine DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "Blood gas availability is stored for audit and data analysis.",
      /**
       * Valid if a value has been selected.
       * Side effect: clears pH and bicarbonate when blood gas is not available.
       *
       * @returns {boolean}
       */
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

    /**
     * Blood ketones available — whether a blood ketone meter is accessible.
     *
     * Determines which ketone input is shown on FormClinicalDetails:
     *   - true  → blood ketones (numeric, mmol/L). Clears urineKetones.
     *   - false → urine ketones (dipstick picker, - to ++++). Clears bloodKetones.
     *
     * Form step 2.
     */
    bloodKetonesAvailable: {
      val: null,
      label: "Blood ketones available?",
      form: [2],
      info: "If blood ketones are available this value is used to establish DKA diagnosis, whereas urine ketones will be used if not.",
      privacyInfo:
        "Blood ketone availability is stored for audit and data analysis.",
      /**
       * Valid if a value has been selected.
       * Side effect: clears the unused ketone value to prevent stale data submission.
       *
       * @returns {boolean}
       */
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

    /**
     * Syringe pump available — whether a syringe driver is accessible.
     *
     * Determines the insulin delivery route on the Guidance page:
     *   - true  → IV insulin infusion rate (Units/hour).
     *   - false → IM insulin dose (Units, given 2-hourly).
     *
     * Form step 2.
     */
    syringePumpAvailable: {
      val: null,
      label: "Syringe pump available?",
      form: [2],
      info: "If a syringe pump is available IV insulin infusion rate will be provided, otherwise 2-hourly IM doses. IV insulin infusion cannot be safely given without a syringe pump.",
      privacyInfo:
        "Syringe pump availability is stored for audit and data analysis.",
      /**
       * Valid if a value has been selected.
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Availability of syringe pump must be selected. ";
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Infusion pump available — whether an electronic infusion pump is accessible.
     *
     * When not available, fluid rates are provided in both mL/hour and drops/min,
     * and the `dropFactor` input becomes required.
     * Side effect on validation: clears `dropFactor.val` when pump IS available,
     * so drop factor is not submitted unnecessarily.
     *
     * Form step 2.
     */
    infusionPumpAvailable: {
      val: null,
      label: "Infusion pump available?",
      form: [2],
      info: "If an infusion pump is not available, fluid rates will be provided both in mL/hour and drops/min.",
      privacyInfo:
        "Infusion pump availability is stored for audit and data analysis.",
      /**
       * Valid if a value has been selected.
       * Side effect: clears dropFactor when pump is available (drops not needed).
       *
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Availability of infusion pump must be selected. ";
        if (this.val === "true") data.value.inputs.dropFactor.val = null;
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Drop factor — the giving set calibration in drops per mL.
     *
     * Required only when infusionPumpAvailable === "false".
     * Options are driven by `config.validation.dropFactor` so new giving set
     * types can be added centrally.
     *
     * Form step 2.
     */
    dropFactor: {
      val: null,
      label: "Select a drop factor.",
      form: [2],
      info: "You must select a drop factor based on the infusion set you are using to allow accurate drops/minute to be calculated.",
      privacyInfo: "Drop factor is stored for audit and data analysis.",
      /**
       * Valid if infusion pump is available (drop factor not needed), or if a
       * drop factor has been selected when no pump is available.
       *
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (data.value.inputs.infusionPumpAvailable.val === "true") return true;
        if (!this.val)
          this.errors +=
            "Drop factor must be selected if infusion pump unavailable. ";
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Glucose — blood glucose reading at the time of assessment.
     *
     * Supports two modes:
     *   - Normal: numeric value with a selectable unit (mmol/L or mg/dL).
     *             Unit options are driven by `config.validation.glucose.units`.
     *   - High:   `high.val === true` disables the numeric input and signals an
     *             unquantifiable hyperglycaemia (meter reads "high"/"hi") to the
     *             calculator.
     *
     * `unit` is initialised lazily via `unitChange()` on first access, using the
     * unit marked `default: true` in config.
     *
     * Form step 3.
     */
    glucose: {
      val: null,
      /**
       * "Reads high/hi" toggle state and change handler.
       * When activated: clears `glucose.val` and re-validates to remove errors.
       */
      high: {
        val: false,
        /**
         * Called when the "Glucose reads high/hi" toggle changes.
         * Clears the numeric value when switching to high mode so it is
         * not submitted alongside the high flag.
         */
        change() {
          if (this.val) {
            data.value.inputs.glucose.val = null;
          }
          data.value.inputs.glucose.isValid();
        },
      },
      unit: null, // lazily initialised to the default unit from config
      /**
       * Initialises or responds to a change in the selected glucose unit.
       *
       * On first call (unit is null): sets unit to the config default.
       * On subsequent calls: re-runs min/max and isValid() so error messages
       * reflect the newly selected unit's bounds.
       */
      unitChange() {
        if (!this.unit) {
          // Lazy initialisation: find the unit flagged as default in config
          this.unit = Object.keys(config.value.validation.glucose.units).find(
            (key) => config.value.validation.glucose.units[key].default,
          );
        } else {
          // Unit changed: refresh bounds and re-validate
          this.min();
          this.max();
          this.isValid();
        }
      },
      label: "Glucose",
      info: "Glucose is used to confirm the diagnosis of DKA is correct. You can select your prefered unit: mg/dL or mmol/L using the drop-down select menu. If the glucose meter reads 'high' or 'hi' (i.e. above the maximum reading limit of the meter) select the 'Glucose high' checkbox.",
      privacyInfo:
        "Glucose is used to confirm the diagnosis of DKA is correct and is stored for audit and data analysis.",
      form: [3],
      /** @returns {number} Minimum glucose value for the current unit. */
      min() {
        if (!this.unit) this.unitChange();
        return config.value.validation.glucose.units[this.unit].min;
      },
      /** @returns {number} Maximum glucose value for the current unit. */
      max() {
        if (!this.unit) this.unitChange();
        return config.value.validation.glucose.units[this.unit].max;
      },
      step: 1,
      /**
       * Validates the glucose value.
       *
       * Skips numeric validation when `high.val` is true (high flag is the value).
       * Normalises val to 1 decimal place on success.
       *
       * @returns {boolean}
       */
      isValid() {
        const errors = [];
        if (!this.unit) this.unitChange();
        if (this.high.val) return true; // "reads high" — no numeric value required
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
            "Glucose",
          );
        }

        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Blood ketones — quantitative blood ketone level in mmol/L.
     *
     * Only shown (and validated) when `bloodKetonesAvailable === "true"`.
     * Validated against the biochemical diagnostic threshold for DKA from config.
     *
     * Form step 3.
     */
    bloodKetones: {
      val: null,
      label: "Blood ketones",
      info: "Blood ketone value is used to check the diagnostic threshold for DKA is reached. If you only have urine ketones available, go back to the previous page and update your answer to 'Blood ketones available?'",
      privacyInfo:
        "Blood ketone value (if provided) is used to check the diagnostic threshold for DKA is reached and is stored for audit and data analysis.",
      form: [3],
      /** @returns {number} Minimum blood ketone value from config. */
      min() {
        return config.value.validation.bloodKetones.min;
      },
      /** @returns {number} Maximum blood ketone value from config. */
      max() {
        return config.value.validation.bloodKetones.max;
      },
      step: 0.1,
      /**
       * Valid if blood ketones are not available (field is hidden and not required),
       * or if a value is provided that meets the DKA biochemical threshold and
       * is within the absolute numeric bounds.
       *
       * @returns {boolean}
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
          "Blood ketones",
        );
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Urine ketones — semiquantitative urine dipstick result.
     *
     * Only shown (and validated) when `bloodKetonesAvailable !== "true"`.
     * Values: 0 (−), 1 (+), 2 (++), 3 (+++), 4 (++++).
     * Selected via a button-group picker; `setVal()` updates the value and validates.
     *
     * Form step 3.
     */
    urineKetones: {
      val: null,
      /**
       * Sets the urine ketone value and immediately validates.
       * Called by each button in the dipstick picker.
       *
       * @param {number} newVal - Dipstick result (0–4).
       */
      setVal(newVal) {
        this.val = newVal;
        this.isValid();
      },
      label: "Urine ketones",
      info: "Urine ketone value is used to check the diagnostic threshold for DKA is reached. If you have a blood ketone value go back to the previous page and update your answer to 'Blood ketones available?'",
      privacyInfo:
        "Urine ketone value (if provided) is used to check the diagnostic threshold for DKA is reached and is stored for audit and data analysis.",
      form: [3],
      /** @returns {number} Minimum urine ketone value from config. */
      min() {
        return config.value.validation.urineKetones.min;
      },
      /** @returns {number} Maximum urine ketone value from config. */
      max() {
        return config.value.validation.urineKetones.max;
      },
      step: 0.1,
      /**
       * Valid if blood ketones are available (urine ketones not required),
       * or if a value has been selected that meets the DKA biochemical threshold.
       *
       * @returns {boolean}
       */
      isValid() {
        if (data.value.inputs.bloodKetonesAvailable.val === "true") return true;
        if (isNaN(this.val) || this.val === null || this.val === "") {
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
          "Urine ketones",
        );
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Diagnostic features — presence of clinical features of DKA.
     *
     * Required to be true for a valid episode: if no clinical features are present
     * the DKA diagnosis is not supported and the calculator should not be used.
     * Features include: Kussmaul breathing, fruity breath, reduced consciousness,
     * dehydration signs, abdominal pain, vomiting, shock.
     *
     * Form step 3.
     */
    diagnosticFeatures: {
      val: null,
      label: "Clinical features of DKA?",
      form: [3],
      info: "The presence of clinical features of DKA is used to check the diagnostic threshold for DKA is reached. One or more of the following clinical features are required: Kussmaul breathing, fruity breath, decreased level of consciousness, signs of dehydration, abdominal pain and/or vomiting, shock.",
      privacyInfo:
        "The presence of clinical features of DKA is used to check the diagnostic threshold for DKA is reached and is stored for audit and data analysis.",
      /**
       * Valid only when `val === "true"`.
       * Answering "No" (no clinical features) blocks progression: the calculator
       * should not be used when DKA is not clinically supported.
       *
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (this.val !== "true")
          this.errors += "Diagnosis requires clinical features of DKA. ";
        return !this.errors;
      },
      errors: "",
    },

    /**
     * pH — arterial/venous blood pH from blood gas analysis.
     *
     * Only shown (and validated) when `bloodGasAvailable === "true"`.
     * Used to classify DKA severity (severe vs. standard) for fluid calculations.
     *
     * Side effect on validation: clears `respiratorySupport.val` when pH falls
     * below the severe threshold, as respiratory support becomes irrelevant when
     * the patient is already classified as severely unwell.
     *
     * Form step 3.
     */
    pH: {
      val: null,
      label: "pH",
      form: [3],
      info: "pH is used to determine DKA severity which is used in fluid deficit calculations. If you do not have a blood pH value available go back to the previous page and change your answer to 'Blood gas available?'.",
      privacyInfo:
        "pH (if provided) is used to determine DKA severity which is used in fluid deficit calculations and is stored by the calculator for audit purposes.",
      /** @returns {number} Minimum allowable pH from config. */
      min() {
        return config.value.validation.pH.min;
      },
      /** @returns {number} Maximum allowable pH from config. */
      max() {
        return config.value.validation.pH.max;
      },
      step: 0.01,
      /**
       * Valid if blood gas is not available (field hidden), or if pH is provided
       * and within the configured numeric bounds.
       *
       * Normalises val to 2 decimal places on success.
       * Side effect: clears `respiratorySupport.val` when pH is below the severe
       * threshold — but only when a valid pH value has been entered (guarded inside
       * the `else` block to prevent firing on null/empty input).
       *
       * @returns {boolean}
       */
      isValid() {
        if (data.value.inputs.bloodGasAvailable.val === "false") return true;
        const errors = [];
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push("pH must be provided. ");
        } else {
          this.val = Number.parseFloat(this.val).toFixed(2);
          checkNumberRange(this.val, "", this.min(), this.max(), errors, "pH");
          // Severely low pH → clear respiratory support (not clinically applicable)
          if (this.val < config.value.validation.pH.severeThreshold)
            data.value.inputs.respiratorySupport.val = null;
        }
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Bicarbonate — serum bicarbonate from blood gas analysis (mmol/L).
     *
     * Only shown (and validated) when `bloodGasAvailable === "true"` AND
     * pH is at or above `config.validation.pH.diagnosticThreshold`.
     * At severely low pH, bicarbonate adds no additional diagnostic information.
     *
     * Used as an alternative biochemical criterion for DKA diagnosis when pH is
     * borderline (above the diagnostic threshold but bicarbonate is still low).
     *
     * Form step 3.
     */
    bicarbonate: {
      val: null,
      label: "Bicarbonate",
      form: [3],
      info: `Bicarbonate is used to check the diagnostic threshold for DKA is reached. This is relevant if the pH is above the diagnostic threshold for DKA in which case bicarbonate can be used to establish the biochemical criteria for diagnosis instead.`,
      privacyInfo:
        "Bicarbonate (if provided) is used to check the diagnostic threshold for DKA is reached and is stored by the calculator for audit purposes.",
      /** @returns {number} Minimum allowable bicarbonate from config. */
      min() {
        return config.value.validation.bicarbonate.min;
      },
      /** @returns {number} Maximum allowable bicarbonate from config. */
      max() {
        return config.value.validation.bicarbonate.max;
      },
      step: 0.1,
      /**
       * Valid if blood gas is not available, or if pH is below the diagnostic
       * threshold (bicarbonate field is hidden in these cases).
       * Otherwise: required (null/empty/NaN all treated as missing) and must be
       * within the configured numeric bounds.
       *
       * Also checks the biochemical DKA criterion: at this point in the function
       * pH is known to be at or above the diagnostic threshold (otherwise we would
       * have already returned true), so if bicarbonate is also above its diagnostic
       * threshold the DKA biochemical criteria are not met.
       *
       * @returns {boolean}
       */
      isValid() {
        if (data.value.inputs.bloodGasAvailable.val === "false") return true;
        // Bicarbonate not shown when pH is below the diagnostic threshold
        if (
          data.value.inputs.pH.val <
          config.value.validation.pH.diagnosticThreshold
        )
          return true;
        const errors = [];
        if (this.val === null || isNaN(this.val) || this.val == "") {
          errors.push(
            `Bicarbonate must be provided if pH above diagnostic threshold of ${config.value.validation.pH.diagnosticThreshold}. `,
          );
        } else {
          this.val = Number.parseFloat(this.val).toFixed(1);
          checkNumberRange(
            this.val,
            "mmol/L",
            this.min(),
            this.max(),
            errors,
            "Bicarbonate",
          );
        }
        // Biochemical criterion check: both pH and bicarbonate above threshold = no DKA
        if (this.val >= config.value.validation.bicarbonate.diagnosticThreshold)
          errors.push(
            `Biochemical threshold for DKA not met: if blood gas testing available pH should be <${config.value.validation.pH.diagnosticThreshold} or bicarbonate should be <${config.value.validation.bicarbonate.diagnosticThreshold}.`,
          );
        this.errors = errors.join(" ");
        return !this.errors;
      },
      errors: "",
    },

    /**
     * Shock present — whether the patient meets criteria for circulatory shock.
     *
     * Criteria: weak radial pulse/severe tachycardia + lower limb temperature
     * gradient + CRT >= 3 seconds (all three must be present).
     *
     * Side effects on validation when `val === "true"`:
     *   - Clears `respiratorySupport.val` (not applicable in shock protocol).
     *   - Clears `gcs.val` (GCS is not assessed when shock is present).
     *
     * Form step 3.
     */
    shockPresent: {
      val: "",
      label: "Is the patient in shock?",
      privacyLabel: "Clinical shock status",
      form: [3],
      info: "Clinical shock status is used to determine bolus duration/rate, and DKA severity which impacts on fluid calculations. Signs of impaired circulation: Weak radial pulse/severe tachycardia, lower limb temperature gradient, CRT of 3 or more seconds. If all 3 signs of circulatory impairment are present, the child is in shock.",
      privacyInfo:
        "Clinical shock status is used to determine bolus duration/rate, and DKA severity which impacts on fluid calculations. It is stored by the calculator for audit and data analysis.",
      /**
       * Valid if a value has been selected.
       * Side effect: clears GCS and respiratory support when shock is present.
       *
       * @returns {boolean}
       */
      isValid() {
        this.errors = "";
        if (!this.val)
          this.errors += "Clinical shock status must be selected. ";
        if (this.val === "true") {
          // Shock present: GCS and respiratory support are not assessed
          data.value.inputs.respiratorySupport.val = null;
          data.value.inputs.gcs.val = null;
        }
        return !this.errors;
      },
      errors: "",
    },

    /**
     * GCS — Glasgow Coma Scale total score (3–15).
     *
     * Only shown (and validated) when `shockPresent === "false"`.
     * Used to determine DKA severity (GCS <= severe threshold -> severe DKA).
     *
     * The GCS reference page (`/GCS`) is linked from the form to help the
     * clinician apply the correct scale for the patient's age.
     *
     * Form step 3.
     */
    gcs: {
      val: null,
      label: "GCS",
      form: [3],
      info: "GCS is used to determine DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "GCS is used to determine DKA severity which impacts on fluid calculations. It is stored by the calculator for audit and data analysis.",
      /** @returns {number} Minimum GCS score (3) from config. */
      min() {
        return config.value.validation.gcs.min;
      },
      /** @returns {number} Maximum GCS score (15) from config. */
      max() {
        return config.value.validation.gcs.max;
      },
      step: 1,
      /**
       * Valid if shock is present (GCS not required), or if a value is provided
       * within the valid GCS range (3–15).
       *
       * Normalises val to an integer on success.
       *
       * @returns {boolean}
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

    /**
     * Respiratory support — whether the patient is receiving oxygen or other
     * respiratory support at the time of assessment.
     *
     * Only shown (and validated) when all three conditions hold:
     *   1. Shock is not present.
     *   2. GCS is above the severe threshold.
     *   3. Blood gas is not available, OR pH is at or above the severe threshold.
     *
     * When these conditions are not met the patient is already classified as
     * severe DKA and respiratory support status does not further affect the
     * severity classification.
     *
     * Form step 3.
     */
    respiratorySupport: {
      val: "",
      label: "Is the patient on oxygen or respiratory support?",
      privacyLabel: "Respiratory support status",
      form: [3],
      info: "Respiratory support status is used to determine DKA severity which impacts on fluid calculations.",
      privacyInfo:
        "Respiratory support status is used to determine DKA severity which impacts on fluid calculations. It is stored by the calculator for audit and data analysis.",
      /**
       * Valid if any of the short-circuit conditions apply (field is not shown),
       * or if a value has been selected.
       *
       * Short-circuits (field auto-passes):
       *   - Shock is present.
       *   - GCS is at or below the severe threshold.
       *   - pH (when available) is below the severe threshold.
       *
       * @returns {boolean}
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

    /**
     * Other — a privacy-policy-only entry with no associated form input.
     *
     * Documents additional data recorded server-side that is not directly
     * entered by the user: audit ID, software version, calculation results,
     * timestamp, browser useragent, and IP address.
     *
     * `form: []` ensures this entry is never included in form validation.
     */
    other: {
      privacyLabel: "Other data recorded",
      form: [],
      privacyInfo:
        "In addition to the input fields above, the following data are recorded to enable audit, security and performance monitoring: <ul><li>The audit ID (unique to each set of calculations performed) which should also be recorded in the patient notes and can be used for audit data linkage</li><li>Software version of the calculator used for the episode</li><li>The results of the calculations performed by the calculator including DKA severity, fluid and insulin calculations</li><li>The date/time when the protocol was generated</li><li>The browser type (useragent) used to access the calculator</li><li>The IP address of the device used to access the calculator</li></ul>",
    },
  },

  // -------------------------------------------------------------------------
  // Top-level episode output fields
  // -------------------------------------------------------------------------

  /** Calculation results object — populated by Generate.vue after a successful response. */
  calculations: {},

  /** Unique audit ID returned by the server for this episode. Empty string between episodes. */
  auditID: "",
});
