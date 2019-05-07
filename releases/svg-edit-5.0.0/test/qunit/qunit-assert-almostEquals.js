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
  this.pushResult({
    result: Math.abs(actual - expected) < NEAR_ZERO,
    actual,
    expected,
    message
  });
}

/**
 * @param {external:qunit} QUnit
 * @returns {external:qunit} The same instance passed in after extending
 */
export default function extend (QUnit) {
  QUnit.extend(QUnit.assert, {
    almostEquals
  });
  return QUnit;
}
