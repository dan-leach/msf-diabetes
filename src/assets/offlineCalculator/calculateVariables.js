/**
 * @module calculateVariables
 * @description Computes all clinical parameters required for the MSF paediatric DKA
 * management protocol given a validated patient payload.
 *
 * Every calculation exposes a numeric `val` and an HTML `working` string that
 * explains the step-by-step arithmetic for display to the clinician.
 *
 * All input values must have already been validated by `validate.js` before this
 * module is called — no defensive type-checking is performed here.
 *
 * @see validate.js
 * @see offlineCalculator.js — orchestrates validate → calculateVariables → encrypt
 */
import { config } from "../fetchConfig.js";

/**
 * Computes all clinical variables required for the MSF paediatric DKA protocol.
 *
 * Derives: DKA severity, IV bolus (volume / rate / drop rate), fluid deficit
 * (volume / rate — standard and high-speed variants), daily maintenance
 * (volume / rate), combined IV bag speeds (standard, high, half-speed, and
 * hypoglycaemia), IV insulin infusion rate, and IM insulin dose.
 *
 * @param {Object}  data                       - Validated patient and clinical payload.
 * @param {number}  data.weight                - Patient weight in kg.
 * @param {number|string} data.patientAge      - Patient age in years. Note: offlineCalculator.js
 *                                               converts this to a string via `.toFixed(2)` before
 *                                               calling this function, so comparisons here rely on
 *                                               implicit JS string-to-number coercion.
 * @param {number}  [data.pH]                  - Arterial pH; if present (and truthy), the
 *                                               blood-gas severity pathway is used.
 * @param {number}  [data.bicarbonate]         - Bicarbonate in mmol/L; used alongside pH when
 *                                               pH alone does not meet the severe threshold.
 * @param {boolean} data.shockPresent          - Whether the patient is in circulatory shock;
 *                                               drives bolus duration and the clinical-indicators
 *                                               severity pathway.
 * @param {number}  [data.gcs]                 - Glasgow Coma Scale score; required when
 *                                               shockPresent is false; drives noBolus logic and
 *                                               the clinical-indicators severity pathway.
 * @param {boolean} [data.respiratorySupport]  - Whether the patient is on supplementary O₂ or
 *                                               respiratory support; required under the same
 *                                               conditions as gcs.
 * @param {number}  [data.bloodKetones]        - Blood ketone level; at least one ketone value must
 *                                               be present to establish a severity pathway.
 * @param {number}  [data.urineKetones]        - Urine ketone dipstick level; see bloodKetones.
 * @param {number}  [data.dropFactor]          - Drops/mL for gravity infusion sets; when provided,
 *                                               drop rates are calculated for the bolus and bag speeds.
 *
 * @returns {{
 *   severity:    { val: string, working: string },
 *   bolus:       { volume: Object, duration: Object, rate: Object, drops: Object|null },
 *   deficit:     { percentage: Object, standardSpeedVolume: Object, standardSpeedRate: Object,
 *                  highSpeedVolume: Object, highSpeedRate: Object },
 *   maintenance: { volume: Object, rate: Object },
 *   bagSpeeds:   Object,
 *   insulinRate: { val: number, working: string },
 *   insulinDose: { val: number, working: string },
 *   errors:      Array
 * }} Calculated values; each sub-object exposes a numeric `val` and an HTML `working` string.
 *
 * @throws {Error} If DKA severity cannot be determined (pH/ketone values fall outside all
 *                 defined thresholds, or neither ketones nor pH are provided), or if
 *                 working-string generation encounters an unexpected state. These errors
 *                 propagate to the caller rather than being collected in the `errors` array.
 */
const calculateVariables = (data) => {
  const errors = [];
  const weight = data.weight;

  /**
   * Utility function: converts a volume into a rate per unit time.
   * @param {number} volume - The total volume.
   * @param {number} unitTime - The time period over which the volume is administered.
   * @returns {number} - The rate of volume per unit time.
   */
  const volumeToRate = (volume, unitTime) => volume / unitTime;

  /**
   * Utility function: converts a rate in mL/hour to a drop rate using the drop factor.
   * @param {number} rate - The rate in mL/hour.
   * @param {number} dropFactor - The drop factor (drops per mL).
   * @returns {number} - The drop rate in drops/minute.
   */
  const rateToDrops = (rate, dropFactor) => (rate / 60) * dropFactor;

  /**
   * Determines DKA severity using either the blood-gas pathway (pH ± bicarbonate) or the
   * clinical-indicators pathway (GCS, shock, respiratory support), whichever applies.
   *
   * Pathway selection:
   *  - pH truthy AND at least one ketone present → blood-gas pathway (pH takes precedence).
   *  - At least one ketone present, no pH        → clinical-indicators pathway.
   *  - Neither ketones nor pH present            → throws; insufficient data.
   *
   * @returns {{ val: string, working: string }} Severity result — `val` is "severe" or
   *   "standard"; `working` is an HTML explanation of how the grade was reached.
   * @throws {Error} If pH and ketones are present but pH falls outside all defined severity
   *   thresholds; if working-string generation encounters an unexpected pH range; or if
   *   neither ketones nor pH are provided.
   */
  const calculateSeverity = () => {
    /**
     * Evaluates severity from the provided blood-gas and/or ketone values.
     *
     * Blood-gas pathway: severe if pH < severe upper bound; standard if bicarbonate or pH
     * meet the standard threshold; throws if neither threshold is met.
     * Clinical-indicators pathway: severe if GCS ≤ severeThreshold, shockPresent, or
     * respiratorySupport; otherwise standard.
     *
     * @returns {"severe"|"standard"} The matched severity grade.
     * @throws {Error} If pH and ketones are present but pH does not meet any severity
     *   threshold, or if neither pH nor ketones are provided.
     */
    const calculateVal = () => {
      if (data.pH && (data.bloodKetones || data.urineKetones)) {
        // Must check that ketones are also present
        if (data.pH < config.value.severity.severe.pHRange.upper) {
          return "severe";
        }
        if (
          data.bicarbonate &&
          data.bicarbonate < config.value.severity.standard.bicarbonateBelow
        ) {
          return "standard";
        }
        if (data.pH < config.value.severity.standard.pHRange.upper) {
          return "standard";
        }
        // Log error if no valid severity is found
        throw new Error(
          `pH of ${data.pH} and bicarbonate of ${data.bicarbonate}mmol/L does not meet the diagnostic threshold for DKA.`,
        );
      } else if (data.bloodKetones || data.urineKetones) {
        if (
          data.gcs <= config.value.validation.gcs.severeThreshold ||
          data.shockPresent ||
          data.respiratorySupport
        )
          return "severe";
        return "standard";
      } else {
        throw new Error(
          "Insufficient data to determine DKA severity: pH, blood ketones or urine ketones required.",
        );
      }
    };
    const val = calculateVal();

    /**
     * Builds an HTML string explaining how the severity grade was reached, mirroring
     * the branch logic of calculateVal, for display to the clinician.
     *
     * Note: when the clinical-indicators pathway is used (no pH), the working string
     * interpolates `data.gcs` and `data.respiratorySupport` directly. If either field
     * is undefined (e.g. shockPresent was true so they were not required), the string
     * will render the literal text "undefined" for those values.
     *
     * @returns {string|false} HTML working string, or false if `val` is falsy.
     * @throws {Error} If pH is present but falls outside all expected display ranges
     *   (should not occur if calculateVal returned without throwing).
     */
    const working = () => {
      if (!val) return false;
      let working;
      if (data.pH) {
        working = `Since pH ${
          data.bicarbonate ? "and bicarbonate have " : "has "
        }been provided use these (rather than clinical severity indicators) to select severity.<br>`;
        if (data.pH >= config.value.severity.standard.pHRange.upper) {
          //pH too high,therefore check bicarb
          if (
            data.bicarbonate < config.value.severity.standard.bicarbonateBelow
          ) {
            //Bicarb diagnostic
            working += `pH of ${data.pH} is above upper limit of ${config.value.severity.standard.pHRange.upper}, but bicarbonate of ${data.bicarbonate}mmol/L is below upper limit of ${config.value.severity.standard.bicarbonateBelow} mmol/L.<br>Therefore, severity is ${val}.`;
          } else {
            //pH and bicarb too high
            throw new Error("Unable to generate working for severity.");
          }
        } else if (
          data.pH < config.value.severity.standard.pHRange.upper &&
          data.pH >= config.value.severity.standard.pHRange.lower
        ) {
          //pH in standard range
          working += `pH of <strong>${data.pH}</strong> is within the range ${config.value.severity.standard.pHRange.lower} to <${config.value.severity.standard.pHRange.upper}.<br>Therefore, severity is <strong>${val}</strong>.`;
        } else if (
          data.pH < config.value.severity.severe.pHRange.upper &&
          data.pH >= config.value.severity.severe.pHRange.lower
        ) {
          //pH in severe range
          working += `pH of <strong>${data.pH}</strong> is within the range ${config.value.severity.severe.pHRange.lower} to <${config.value.severity.severe.pHRange.upper}.<br>Therefore, severity is <strong>${val}</strong>.`;
        } else {
          //pH not in expected range
          throw new Error("Unable to generate working for severity.");
        }
      } else {
        working = `In the absence of blood gas data, severity is decided using clinical indicators.<br><br>DKA is severe if any of these features are present, or standard if all are absent:<ul><li>Shock (provided value: <strong>${
          data.shockPresent
        }</strong>)</li><li>GCS <${
          config.value.validation.gcs.severeThreshold + 1
        } (provided value: <strong>${
          data.gcs
        }</strong>)</li><li>On supplementary O<sub>2</sub> or respiratory support (provided value: <strong>${
          data.respiratorySupport
        }</strong>)</li></ul>Therefore, severity is <strong>${val}</strong>.`;
      }
      return working;
    };

    return {
      val,
      working: working(),
    };
  };
  // ---------------------------------------------------------------------------
  // Severity — evaluated once; all downstream calculations reference severity.val
  // ---------------------------------------------------------------------------
  const severity = calculateSeverity();

  // ---------------------------------------------------------------------------
  // Bolus — IV fluid resuscitation volume, duration, rate, and optional drop rate
  // ---------------------------------------------------------------------------
  /**
   * Calculates the IV bolus volume, duration, rate, and optional drop rate.
   *
   * Volume is weight-based and capped at the protocol maximum. A noBolus override
   * applies when GCS is at or below the no-bolus threshold and shock is absent.
   * Duration depends on whether the patient is shocked or not.
   *
   * @returns {{ volume: Object, duration: Object, rate: Object, drops: Object|null }}
   *   Each sub-object exposes `val` (number) and `working` (HTML string).
   *   `drops` is null when no dropFactor was provided.
   */
  const calculateBolus = () => {
    /**
     * Calculates the bolus volume based on patient weight and a given mL/kg rate.
     * @returns {Object} - An object containing the bolus volume, formula, limit, and other details.
     */
    const calculateVolume = () => {
      const mlsPerKg = config.value.bolus.mlsPerKg;
      const cap = config.value.caps.bolus;

      // Calculate the uncapped bolus volume based on mL/kg.
      const raw = weight * mlsPerKg;

      // Determines if no bolus should be given based on GCS and shock presence.
      const noBolus =
        data.gcs <= config.value.validation.gcs.noBolusThreshold &&
        !data.shockPresent;

      // Checks if the uncapped bolus volume exceeds the cap.
      const isCapped = raw > cap;

      // Select the bolus volume to use between capped or uncapped volumes.
      let val = isCapped ? cap : raw;

      // Override bolus volume to 0 if no bolus criteria are met.
      if (noBolus) val = 0;

      // Generate string showing working calculation for the bolus volume.
      let working = `
        The default bolus is ${mlsPerKg}mL/kg x weight in kilograms (provided value: <strong>${weight}kg</strong>) = ${raw.toFixed(
          config.value.decimals.bolusVolume,
        )}mL<br><br>
        The default bolus is overriden in the following circumstances:
        <ul><li>No bolus is given if GCS <=${
          config.value.validation.gcs.noBolusThreshold
        } (provided value: <strong>${
          data.gcs
        }</strong>) and the patient is not shocked (provided value: <strong>${
          data.shockPresent ? "shocked" : "not shocked"
        }</strong>)</li>
        <li>The bolus is capped if it exceeds the limit of ${cap}mL (based on ${mlsPerKg}mL/kg for ${
          config.value.caps.weight
        }kg patient)</li></ul>
        The calculated bolus is therefore <strong>${val.toFixed(
          config.value.decimals.bolusVolume,
        )}mL</strong>.
      `;

      return {
        val,
        working,
      };
    };
    const volume = calculateVolume();

    /**
     * Determines the bolus infusion duration in minutes based on shock status.
     * Shocked patients receive the bolus faster than non-shocked patients.
     *
     * @returns {{ val: number, working: string }} Duration in minutes and HTML working string.
     */
    const calculateDuration = () => {
      // Get the bolus duration in hours based on shock status.
      const val = data.shockPresent
        ? config.value.bolus.duration.shock
        : config.value.bolus.duration.noShock;

      const working = `Bolus duration is linked to the presence of shock:<ul><li>Shocked = ${
        config.value.bolus.duration.shock
      } minutes</li><li>Not shocked = ${
        config.value.bolus.duration.noShock
      } minutes</li></ul>Patient is <strong>${
        data.shockPresent ? "shocked" : "not shocked"
      }</strong>, therefore bolus duration is <strong>${val}</strong> minutes.`;

      return {
        val,
        working,
      };
    };
    const duration = calculateDuration();

    /**
     * Calculates the bolus infusion rate in mL/hour.
     * Rate = bolus volume ÷ duration (converted from minutes to hours).
     *
     * @returns {{ val: number, working: string }} Rate in mL/hour and HTML working string.
     */
    const calculateRate = () => {
      // Calculate the bolus rate in mL/hour.
      const val = volumeToRate(volume.val, duration.val / 60);

      // Generate string showing working calculation for the bolus rate.
      const working = `
        Bolus rate is calculated by dividing the bolus volume (calculated value: <strong>${volume.val.toFixed(
          config.value.decimals.bolusVolume,
        )}mL</strong>) by the bolus duration (in hours) (calculated value: <strong>${
          duration.val / 60
        }</strong> hours).<br><br>
        [${volume.val.toFixed(config.value.decimals.bolusVolume)}mL] ÷ [${
          duration.val / 60
        } hours] = <strong>${val.toFixed(
          config.value.decimals.bolusRate,
        )}mL/hour</strong>`;

      return {
        val,
        working,
      };
    };
    const rate = calculateRate();

    /**
     * Converts the bolus rate to a gravity-drip rate in drops/minute.
     * Only called when a dropFactor has been provided.
     *
     * @returns {{ val: number, working: string }} Drop rate in drops/minute and HTML working string.
     */
    const calculateDrops = () => {
      const val = rateToDrops(rate.val, data.dropFactor);

      const working = `
        Drop rate is calculated by dividing the rate (in mL/hour) by 60 (to give a rate in mL/minute) and then multiplying by the drop factor (provided value: <strong>${
          data.dropFactor
        }</strong> drops/mL).<br><br>
        ([${rate.val.toFixed(
          config.value.decimals.bolusRate,
        )}mL/hour] ÷ [60 minutes]) x ${
          data.dropFactor
        } drops/mL = <strong>${val.toFixed(
          config.value.decimals.drops,
        )} drops/minute</strong>`;

      return {
        val,
        working,
      };
    };

    return {
      volume,
      duration,
      rate,
      drops: data.dropFactor ? calculateDrops() : null,
    };
  };

  // ---------------------------------------------------------------------------
  // Deficit — fluid deficit volume and replacement rate (standard and high-speed)
  // ---------------------------------------------------------------------------
  /**
   * Calculates the fluid deficit percentage, volume, and replacement rate for both
   * the standard-speed and high-speed (severe) regimes.
   *
   * Both speed variants are always calculated regardless of severity — the caller
   * (calculateBagSpeeds) selects the appropriate one based on severity.val.
   *
   * @returns {{
   *   percentage:          { val: number, working: string },
   *   standardSpeedVolume: { val: number, working: string },
   *   standardSpeedRate:   { val: number, working: string },
   *   highSpeedVolume:     { val: number, working: string },
   *   highSpeedRate:       { val: number, working: string }
   * }}
   */
  const calculateDeficit = () => {
    /**
     * Determines the deficit percentage based on severity.
     * @returns {Object} - An object containing the deficit percentage, formula, and working calculation.
     */
    const calculatePercentage = () => {
      const val = config.value.severity[severity.val].deficitPercentage;

      const working = `Deficit percentage is linked to severity:<ul><li>Standard DKA = ${config.value.severity.standard.deficitPercentage}% deficit</li><li>Severe DKA = ${config.value.severity.severe.deficitPercentage}% deficit</li></ul>Calculated severity is <strong>${severity.val}</strong>, therefore deficit is <strong>${val}%</strong>.`;

      return {
        val,
        working,
      };
    };
    const percentage = calculatePercentage();

    /**
     * Calculates the deficit volume based on the deficit percentage and patient weight.
     * @returns {Object} - An object containing deficit volume, formula, limit, working calculation, and capped status.
     */
    const calculateStandardSpeedVolume = () => {
      // Calculate the uncapped deficit volume.
      const raw =
        config.value.severity.standard.deficitPercentage * weight * 10;

      const cap = config.value.caps.deficitStandard;

      // Check if the uncapped deficit volume exceeds the cap.
      const isCapped = raw > cap;

      // Calculate the deficit volume to use, selecting between capped or uncapped volumes.
      const val = isCapped ? cap : raw;

      /**
       * Shows the working calculation for the deficit volume.
       * @returns {string} - A string showing the detailed calculation.
       */
      const working = `
        The deficit volume is calculated by multiplying the deficit percentage (calculated value: <strong>${
          config.value.severity.standard.deficitPercentage
        }%</strong>) by patient weight (provided value: <strong>${weight}kg</strong>) by a factor of 10.<br><br>
        [${
          config.value.severity.standard.deficitPercentage
        }%] x [${weight.toFixed(
          config.value.decimals.weight,
        )}kg] x 10 = ${raw.toFixed(config.value.decimals.deficitVolume)}mL<br><br>
        The volume is capped if it exceeds the limit of ${cap}mL (based on deficit volume for ${
          config.value.caps.weight
        }kg patient).<br><br>
        The calculated deficit volume is therefore <strong>${val.toFixed(
          config.value.decimals.deficitVolume,
        )}mL</strong>.`;

      return {
        val,
        working,
      };
    };
    const standardSpeedVolume = calculateStandardSpeedVolume();

    /**
     * FOR HIGH-SPEED HYPOGLYCAMIA REGIME: Calculates the deficit volume based on the deficit percentage and patient weight.
     * @returns {Object} - An object containing deficit volume, formula, limit, working calculation, and capped status.
     */
    const calculateHighSpeedVolume = () => {
      // Calculate the uncapped deficit volume.
      const raw = config.value.severity.severe.deficitPercentage * weight * 10;

      const cap = config.value.caps.deficitSevere;

      // Check if the uncapped deficit volume exceeds the cap.
      const isCapped = raw > cap;

      // Calculate the deficit volume to use, selecting between capped or uncapped volumes.
      const val = isCapped ? cap : raw;

      const working = `
        The deficit volume is calculated by multiplying the deficit percentage (calculated value: <strong>${
          config.value.severity.severe.deficitPercentage
        }%</strong>) by patient weight (provided value: <strong>${weight}kg</strong>) by a factor of 10.<br><br>
        [${
          config.value.severity.severe.deficitPercentage
        }%] x [${weight.toFixed(
          config.value.decimals.weight,
        )}kg] x 10 = ${raw.toFixed(config.value.decimals.deficitVolume)}mL<br><br>
        The volume is capped if it exceeds the limit of ${cap}mL (based on deficit volume for ${
          config.value.caps.weight
        }kg patient).<br><br>
        The calculated deficit volume is therefore <strong>${val.toFixed(
          config.value.decimals.deficitVolume,
        )}mL</strong>.`;

      return {
        val,
        working,
      };
    };
    const highSpeedVolume = calculateHighSpeedVolume();

    /**
     * Calculates the rate at which a given deficit volume should be replaced.
     *
     * @param {number} vol - Deficit volume in mL to replace (capped or uncapped variant).
     * @returns {{ val: number, working: string }} Rate in mL/hour and HTML working string.
     */
    const calculateRate = (vol) => {
      const replacementDuration = config.value.deficitReplacementDuration;
      //Calculate the fluid replacement rate in mL/hour.
      const val = volumeToRate(vol, replacementDuration);

      // Generate string showing the working calculation for the fluid replacement rate.
      const working = `
        The deficit replacement rate is calculated by dividing the deficit volume by the deficit replacement duration of ${replacementDuration} hours.<br><br>
        [${vol.toFixed(
          config.value.decimals.deficitVolume,
        )}mL] ÷ [${replacementDuration} hours] = <strong>${val.toFixed(
          config.value.decimals.deficitRate,
        )}mL/hour</strong>`;

      return {
        val,
        working,
      };
    };

    return {
      percentage,
      standardSpeedVolume,
      standardSpeedRate: calculateRate(standardSpeedVolume.val),
      highSpeedVolume,
      highSpeedRate: calculateRate(highSpeedVolume.val),
    };
  };
  const deficit = calculateDeficit();

  // ---------------------------------------------------------------------------
  // Maintenance — daily maintenance fluid volume and hourly rate
  // ---------------------------------------------------------------------------
  /**
   * Calculates the daily maintenance fluid volume and hourly rate based on patient weight
   * using the Holliday-Segar formula (100/50/20 mL/kg/day), capped at the protocol maximum.
   *
   * @returns {{ volume: { val: number, working: string }, rate: { val: number, working: string } }}
   */
  const calculateMaintenance = () => {
    /**
     * Calculates the daily maintenance volume based on patient weight.
     * @returns {Object} - An object containing the volume, formula, limit, and working calculation.
     */
    const calculateVolume = () => {
      const cap = config.value.caps.maintenance;
      /**
       * Calculates the uncapped maintenance volume.
       * @returns {number} - The uncapped maintenance volume in mL.
       */
      const calculateRaw = () => {
        if (weight < 10) return weight * 100;
        if (weight < 20) return (weight - 10) * 50 + 1000;
        return (weight - 20) * 20 + 1500;
      };
      const raw = calculateRaw();

      // Check if the uncapped maintenance volume exceeds the cap.
      const isCapped = raw > cap;

      // Calculate the maintenance volume to use, selecting between capped or uncapped volumes.
      const val = isCapped ? cap : raw;

      /**
       * Shows the working calculation for the maintenance volume.
       * @returns {string} - A string showing the detailed calculation.
       */
      let working = `
        The daily maintenance volume is based on the patient weight (provided value: <strong>${weight}kg</strong>):
        <ul><li>100mL/kg for the first 10kg</li>
        <li>then 50mL/kg for the second 10kg</li>
        <li>then 20mL/kg for the remainder</li></ul>
      `;
      if (weight > 20) {
        working += `
          100mL/kg x 10kg = 1000mL<br>
          50mL/kg x 10kg = 500mL<br>
          20mL/kg x ${weight - 20}kg = ${((weight - 20) * 20).toFixed(
            config.value.decimals.maintenanceVolume,
          )}mL<br><br>
        1000mL + 500mL + ${((weight - 20) * 20).toFixed(
          config.value.decimals.maintenanceVolume,
        )}mL = <strong>${val.toFixed(
          config.value.decimals.maintenanceVolume,
        )}mL</strong>
        `;
      } else if (weight > 10) {
        working += `
          100mL/kg x 10kg = 1000mL<br>
          50mL/kg x ${weight - 10}kg = ${((weight - 10) * 50).toFixed(
            config.value.decimals.maintenanceVolume,
          )}mL<br><br>
          1000mL + ${((weight - 10) * 50).toFixed(
            config.value.decimals.maintenanceVolume,
          )}mL = <strong>${val.toFixed(
            config.value.decimals.maintenanceVolume,
          )}mL</strong>
        `;
      } else if (weight > config.value.validation.weight.min) {
        working += `100mL/kg x ${weight}kg = <strong>${val.toFixed(
          config.value.decimals.maintenanceVolume,
        )}mL</strong>`;
      } else {
        throw new Error("Unable to generate maintenance volume working.");
      }

      working += `<br><br>
        The volume is capped if it exceeds the limit of ${cap}mL (based on maintenance volume for ${
          config.value.caps.weight
        }kg patient).<br><br>
        The calculated daily maintenance volume is therefore <strong>${val.toFixed(
          config.value.decimals.maintenanceVolume,
        )}mL</strong>.`;

      return {
        val,
        working,
      };
    };
    const volume = calculateVolume();

    /**
     * Calculates the daily maintenance fluid rate.
     * @returns {Object} - An object containing the rate, formula, and working calculation.
     */
    const calculateRate = () => {
      // Calculate the daily maintenance fluid rate in mL/hour.
      const val = volume.val / 24;

      // Generate string showing the working calculation for the daily maintenance fluid rate.
      const working = `
        The daily maintenance rate is calculated by dividing the daily maintenance volume by 24 hours.<br><br>
        [${volume.val.toFixed(
          config.value.decimals.maintenanceVolume,
        )}mL] ÷ 24 hours = <strong>${val.toFixed(
          config.value.decimals.maintenanceRate,
        )}mL/hour</strong>`;

      return {
        val,
        working,
      };
    };

    return {
      volume,
      rate: calculateRate(),
    };
  };
  const maintenance = calculateMaintenance();

  // ---------------------------------------------------------------------------
  // Bag speeds — combined IV rates (deficit + maintenance) for standard, high,
  // half-speed, and hypoglycaemia regimes, with optional drop rates
  // ---------------------------------------------------------------------------
  /**
   * Combines deficit and maintenance rates into the final IV bag speeds for each regime.
   *
   * Produces different sub-sets depending on severity.val:
   *  - "standard" → standardSpeed, halfStandardSpeed, hypoSpeed (+ drop rates if dropFactor)
   *  - "severe"   → highSpeed, halfHighSpeed (+ drop rates if dropFactor)
   *
   * Note: `hypoSpeed` shares the same volumes as `highSpeed` (severe deficit percentage)
   * regardless of the patient's actual DKA severity, so a standard-DKA patient has a
   * hypo bag running faster than their standard maintenance bag.
   *
   * @returns {Object} Bag speed sub-objects for the applicable severity regime.
   * @throws {Error} If severity.val is neither "standard" nor "severe".
   */
  const calculateBagSpeeds = () => {
    // Calculate the speed fluid rate by summing deficit and maintenance rates.
    const calculateSpeed = (
      deficitVolume,
      deficitRate,
      maintenanceVolume,
      maintenanceRate,
      // Note: a 5th argument (deficitPercentage) is passed by each call site below but
      // is not declared in this signature and is therefore silently ignored. It is unused
      // in the body — consider removing it from the call sites.
    ) => {
      // Calculate the speed fluid rate in mL/hour.
      const val = deficitRate.val + maintenanceRate.val;

      // Generate string showing the working calculation for the fluid rate.
      const working = `
        <div class="card mb-2">
          <div class="card-header">
            1. Calculate deficit replacement rate
          </div>
          <div class="card-body">
            ${deficitVolume.working}<br><br>
            ${deficitRate.working}
          </div>
        </div>
        <div class="card mb-2">
          <div class="card-header">
            2. Calculate maintenance rate
          </div>
          <div class="card-body">
            ${maintenanceVolume.working}<br><br>
            ${maintenanceRate.working}
          </div>
        </div>
        <div class="card mb-2">
          <div class="card-header">
            3. Calculate bag speed
          </div>
          <div class="card-body">
            The bag speed is calculated by summing the deficit rate with the daily maintenance rate.<br><br>
            [${deficitRate.val.toFixed(
              config.value.decimals.deficitRate,
            )}mL/hour] + [${maintenanceRate.val.toFixed(
              config.value.decimals.maintenanceRate,
            )}mL/hour] = <strong>${val.toFixed(
              config.value.decimals.bagSpeed,
            )}mL/hour</strong>
          </div>
        </div>
      `;

      return {
        val,
        working,
      };
    };

    // Calculate the half-speed fluid rate by dividing by 2.
    const calculateHalfSpeed = (rate) => {
      // Calculate the half-speed fluid rate in mL/hour.
      const val = rate / 2;

      // Generate string showing the working calculation for the half-speed fluid rate.
      const working = `
        The half bag speed is calculated by dividing the relevant rate (calculated value: <strong>${rate.toFixed(
          config.value.decimals.bagSpeed,
        )}mL/hour</strong>) by 2.<br><br>
        [${rate.toFixed(
          config.value.decimals.bagSpeed,
        )}mL/hour] ÷ 2 = <strong>${val.toFixed(
          config.value.decimals.bagSpeed,
        )}mL/hour</strong>`;

      return {
        val,
        working,
      };
    };

    const calculateDrops = (rate) => {
      // Calculate the drop rate in drops/minute.
      const val = rateToDrops(rate.val, data.dropFactor);

      // Generate string showing working calculation for the bolus rate.
      const working = `
        Drop rate is calculated by dividing the rate (in mL/hour) by 60 (to give a rate in mL/minute) and then multiplying by the drop factor (provided value: <strong>${
          data.dropFactor
        }</strong> drops/mL).<br><br>
        ([${rate.val.toFixed(
          config.value.decimals.bagSpeed,
        )}mL/hour] ÷ [60 minutes]) x ${
          data.dropFactor
        } drops/mL = <strong>${val.toFixed(
          config.value.decimals.drops,
        )} drops/minute</strong>`;

      return {
        val,
        working,
      };
    };

    const standardSpeed = calculateSpeed(
      deficit.standardSpeedVolume,
      deficit.standardSpeedRate,
      maintenance.volume,
      maintenance.rate,
      config.value.severity.standard.deficitPercentage,
    );

    const halfStandardSpeed =
      severity.val === "standard"
        ? calculateHalfSpeed(standardSpeed.val)
        : null;

    const highSpeed = calculateSpeed(
      deficit.highSpeedVolume,
      deficit.highSpeedRate,
      maintenance.volume,
      maintenance.rate,
      config.value.severity.severe.deficitPercentage,
    );

    const halfHighSpeed =
      severity.val === "severe" ? calculateHalfSpeed(highSpeed.val) : null;

    const hypoSpeed = highSpeed;
    hypoSpeed.working =
      `For managing hypoglycaemia the relevant deficit rate is as for severe DKA (i.e. using a deficit percentage of ${config.value.severity.severe.deficitPercentage}%). Therefore, if the actual DKA severity is standard the hypoglycaemia high-speed bag rate is faster than the standard-speed bag rate.<br><br>` +
      hypoSpeed.working;

    if (severity.val === "standard") {
      const standardSpeedDrops = data.dropFactor
        ? calculateDrops(standardSpeed)
        : null;
      const halfStandardSpeedDrops = data.dropFactor
        ? calculateDrops(halfStandardSpeed)
        : null;
      const hypoSpeedDrops = data.dropFactor ? calculateDrops(hypoSpeed) : null;
      return {
        standardSpeed,
        standardSpeedDrops,
        halfStandardSpeed,
        halfStandardSpeedDrops,
        hypoSpeed,
        hypoSpeedDrops,
      };
    } else if (severity.val === "severe") {
      const highSpeedDrops = data.dropFactor ? calculateDrops(highSpeed) : null;
      const halfHighSpeedDrops = data.dropFactor
        ? calculateDrops(halfHighSpeed)
        : null;
      return {
        highSpeed,
        highSpeedDrops,
        halfHighSpeed,
        halfHighSpeedDrops,
      };
    } else {
      throw new Error("Unable to select bag speed options as severity");
    }
  };

  // ---------------------------------------------------------------------------
  // IV insulin rate — continuous infusion rate (Units/hour) based on age and weight
  // ---------------------------------------------------------------------------
  /**
   * Calculates the IV insulin infusion rate in Units/hour based on patient weight and age.
   *
   * A lower weight-based rate applies below the age threshold (younger children);
   * a higher rate applies at or above it. Both rates are capped at the protocol maximum
   * for the applicable age band.
   *
   * @returns {{ val: number, working: string }} Rate in Units/hour and HTML working string.
   */
  const calculateInsulinRate = () => {
    // Select rate based on patient age.
    const rateUnitsPerKgPerHour =
      data.patientAge < config.value.insulin.ageThreshold
        ? config.value.insulin.rateOptions[0]
        : config.value.insulin.rateOptions[1];

    // Select cap based on patient age.
    const cap =
      data.patientAge < config.value.insulin.ageThreshold
        ? config.value.caps.insulinRate005
        : config.value.caps.insulinRate01;

    // Calculate the uncapped insulin rate (in units/hr) based on patient weight and insulin rate in units/kg/hr.
    const raw = rateUnitsPerKgPerHour * weight;

    // Check if the uncapped insulin rate exceeds the cap.
    const isCapped = raw > cap;

    // Calculate the insulin rate to use, selecting between capped or uncapped rates.
    const val = isCapped ? cap : raw;

    // Generate string showing the working calculation for the insulin rate.
    const working = `
      The insulin rate (in Units/hour) is calculated by multiplying the weight-based rate (in Units/kg/hour) by the patient weight (provided value: <strong>${weight.toFixed(
        config.value.decimals.weight,
      )}kg</strong>).<br><br> The relevant weight-based rate is based on the patient age (provided value: ${
        data.patientAge
      } years):
      <ul><li>Age <${config.value.insulin.ageThreshold} years = ${
        config.value.insulin.rateOptions[0]
      } Units/kg/hour</li>
      <li>Age >=${config.value.insulin.ageThreshold} years = ${
        config.value.insulin.rateOptions[0]
      } Units/kg/hour</li></ul>
      
      [${rateUnitsPerKgPerHour} Units/kg/hour] x [${weight.toFixed(
        config.value.decimals.weight,
      )}kg] = <strong>${raw.toFixed(
        config.value.decimals.ivInsulinRate,
      )} Units/hour</strong><br><br>
      
      The rate is capped if it exceeds the limit of ${cap} Units/hour (based on ${rateUnitsPerKgPerHour} Units/kg/hour for ${
        config.value.caps.weight
      }kg patient).<br><br>
        The calculated rate is therefore <strong>${val.toFixed(
          config.value.decimals.ivInsulinRate,
        )}mL</strong>.
      `;

    return {
      val,
      working,
    };
  };

  // ---------------------------------------------------------------------------
  // IM insulin dose — single subcutaneous/IM dose (Units) based on age and weight
  // ---------------------------------------------------------------------------
  /**
   * Calculates the IM insulin dose in Units based on patient weight and age.
   *
   * A lower weight-based dose applies below the age threshold; a higher dose applies
   * at or above it. The raw dose is rounded to the nearest 0.5 Units, then capped at
   * the protocol maximum for the applicable age band.
   *
   * @returns {{ val: number, working: string }} Dose in Units and HTML working string.
   */
  const calculateInsulinDose = () => {
    // Select dose based on patient age.
    const doseUnitsPerKg =
      data.patientAge < config.value.insulin.ageThreshold
        ? config.value.insulin.doseOptions[0]
        : config.value.insulin.doseOptions[1];

    // Select cap based on patient age.
    const cap =
      data.patientAge < config.value.insulin.ageThreshold
        ? config.value.caps.insulinDose01
        : config.value.caps.insulinDose02;

    // Calculate the uncapped insulin dose (in units) based on patient weight and insulin dose in units/kg.
    const raw = doseUnitsPerKg * weight;

    const double = raw * 2;

    const roundedDouble = Math.round(double);

    const rounded = roundedDouble / 2;

    // Check if the uncapped insulin dose exceeds the cap.
    const isCapped = rounded > cap;

    // Calculate the insulin dose to use, selecting between capped or uncapped doses.
    const val = isCapped ? cap : rounded;

    // Generate string showing the working calculation for the insulin dose.
    const working = `
      The insulin dose is calculated by multiplying the weight-based dose (in Units/kg) by the patient weight (provided value: <strong>${weight.toFixed(
        config.value.decimals.weight,
      )}kg</strong>).<br><br>
      The relevant weight-based dose is based on the patient age (provided value: <strong>${parseFloat(
        data.patientAge,
      ).toFixed(config.value.decimals.age)} years</strong>):
      <ul><li>Age <${config.value.insulin.ageThreshold} years = ${
        config.value.insulin.doseOptions[0]
      } Units/kg</li>
      <li>Age >=${config.value.insulin.ageThreshold} years = ${
        config.value.insulin.doseOptions[1]
      } Units/kg</li></ul>
      
      [${doseUnitsPerKg} Units/kg] x [${weight.toFixed(
        config.value.decimals.weight,
      )}kg] = <strong>${raw.toFixed(
        config.value.decimals.imInsulinDose,
      )} Units</strong><br><br>
      The dose is rounded to the nearest half-unit.<br><br>
      The dose is capped if it exceeds the limit of ${cap} Units (based on ${doseUnitsPerKg} Units/kg for ${
        config.value.caps.weight
      }kg patient).<br><br>
        The calculated dose is therefore <strong>${val.toFixed(
          config.value.decimals.imInsulinDose,
        )} Units</strong>.
      `;

    return {
      val,
      working,
    };
  };

  // ---------------------------------------------------------------------------
  // Return — all calculated values for the caller (offlineCalculator.js)
  //
  // Note: `errors` is initialised at the top of this function and returned here
  // for API consistency, but it is never populated — all error paths in this
  // function throw rather than pushing to the array. It will always be [].
  // ---------------------------------------------------------------------------
  return {
    severity,
    bolus: calculateBolus(),
    deficit,
    maintenance,
    bagSpeeds: calculateBagSpeeds(),
    insulinRate: calculateInsulinRate(),
    insulinDose: calculateInsulinDose(),
    errors: errors,
  };
};

export { calculateVariables };
