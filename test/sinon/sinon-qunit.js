// Adapted from https://www.npmjs.com/package/sinon-test

/**
 * @external QUnit
 */
/**
 * @external sinon
 */

/**
 * Adds methods to Sinon using a QUnit implementation.
 * @param {PlainObject} implementations
 * @param {external:sinon} implementations.sinon
 * @param {external:QUnit} implementations.QUnit
 * @returns {void}
 */
export default function sinonQunit ({sinon, QUnit}) {
  sinon.assert.fail = function (msg) {
    QUnit.ok(false, msg);
  };

  sinon.assert.pass = function (assertion) {
    QUnit.ok(true, assertion);
  };

  const qTest = QUnit.test;
  QUnit.test = function (testName, callback) { // eslint-disable-line promise/prefer-await-to-callbacks
    return qTest(testName, sinon.test(callback));
  };
}
