/**
 * Expects an out of bounds `INDEX_SIZE_ERR` exception.
 * @param {GenericObject} obj
 * @param {GenericCallback} fn
 * @param {any} arg1
 * @returns {void}
 */
function expectOutOfBoundsException (obj, fn, arg1) {
  const expected = true;
  const message = 'Caught an INDEX_SIZE_ERR exception';
  let result = false;
  try {
    obj[fn](arg1);
  } catch (e) {
    if (e.code === 1) {
      result = true;
    }
  }
  const actual = result;
  this.pushResult({result, actual, expected, message});
}

/**
 * @param {external:qunit} QUnit
 * @returns {external:qunit} The same instance passed in after extending
 */
export default function extend (QUnit) {
  QUnit.extend(QUnit.assert, {
    expectOutOfBoundsException
  });
  return QUnit;
}
