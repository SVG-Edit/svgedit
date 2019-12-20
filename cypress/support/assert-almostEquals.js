import assertionWrapper from './assertion-wrapper.js';

const NEAR_ZERO = 5e-6; // 0.000005, Firefox fails at higher levels of precision.

/**
 * Checks that the supplied values are equal with a high though not absolute degree of precision.
 * @param {Float} actual
 * @param {Float} expected
 * @param {string} message
 * @returns {void}
 */
function almostEquals (actual, expected, message) {
  message = message || (actual + ' did not equal ' + expected);
  const result = Math.abs(actual - expected) < NEAR_ZERO;
  return {result, message, actual, expected};
}

/**
 * @param {external:chai} _chai
 * @param {external:chai_utils} utils
 * @returns {void}
 */
function setAssertionMethods (_chai, utils) {
  const wrap = assertionWrapper(_chai, utils);

  assert.almostEquals = wrap(almostEquals);
}

export default setAssertionMethods;
