import assertionWrapper from './assertion-wrapper.js';

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
  return {result, message, actual, expected};
}

/**
 * @param {external:chai} _chai
 * @param {external:chai_utils} utils
 * @returns {void}
 */
function setAssertionMethods (_chai, utils) {
  const wrap = assertionWrapper(_chai, utils);

  assert.expectOutOfBoundsException = wrap(expectOutOfBoundsException);
}

export default setAssertionMethods;
