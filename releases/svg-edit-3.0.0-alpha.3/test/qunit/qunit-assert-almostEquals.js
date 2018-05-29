const NEAR_ZERO = 5e-6; // 0.000005, Firefox fails at higher levels of precision.

function almostEquals (actual, expected, message) {
  message = message || (actual + ' did not equal ' + expected);
  this.pushResult({
    result: Math.abs(actual - expected) < NEAR_ZERO,
    actual,
    expected,
    message
  });
}

export default function extend (QUnit) {
  QUnit.extend(QUnit.assert, {
    almostEquals
  });
  return QUnit;
}
