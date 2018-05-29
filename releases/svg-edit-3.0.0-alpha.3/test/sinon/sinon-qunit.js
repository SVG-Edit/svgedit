// Adapted from https://www.npmjs.com/package/sinon-test

export default function ({sinon, QUnit}) {
  sinon.assert.fail = function (msg) {
    QUnit.ok(false, msg);
  };

  sinon.assert.pass = function (assertion) {
    QUnit.ok(true, assertion);
  };

  const qTest = QUnit.test;
  QUnit.test = function (testName, callback) {
    return qTest(testName, sinon.test(callback));
  };
}
