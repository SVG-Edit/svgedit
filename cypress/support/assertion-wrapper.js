/**
 * @param {external:chai} _chai
 * @param {external:chai_utils} utils
 * @returns {void}
 */
function setAssertionMethods (_chai, utils) {
  return (method) => {
    return (...args) => {
      const {result, message, actual, expected} = method(...args);
      const assertion = new _chai.Assertion();
      assertion.assert(result, `Expected ${actual} to be ${expected}`, message);
    };
  };
}
export default setAssertionMethods;
