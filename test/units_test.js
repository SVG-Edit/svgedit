/* eslint-env qunit */
import * as units from '../editor/units.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

/**
 * Set up tests, supplying mock data.
 * @returns {void}
 */
function setUp () {
  units.init(
    /**
    * @implements {module:units.ElementContainer}
    */
    {
      getBaseUnit () { return 'cm'; },
      getHeight () { return 600; },
      getWidth () { return 800; },
      getRoundDigits () { return 4; },
      getElement (elementId) { return document.getElementById(elementId); }
    }
  );
}

QUnit.test('Test svgedit.units package', function (assert) {
  assert.expect(2);
  assert.ok(units);
  assert.equal(typeof units, typeof {});
});

QUnit.test('Test svgedit.units.shortFloat()', function (assert) {
  assert.expect(7);

  setUp();

  assert.ok(units.shortFloat);
  assert.equal(typeof units.shortFloat, typeof function () { /* */ });

  const {shortFloat} = units;
  assert.equal(shortFloat(0.00000001), 0);
  assert.equal(shortFloat(1), 1);
  assert.equal(shortFloat(3.45678), 3.4568);
  assert.equal(shortFloat(1.23443), 1.2344);
  assert.equal(shortFloat(1.23455), 1.2346);
});

QUnit.test('Test svgedit.units.isValidUnit()', function (assert) {
  assert.expect(18);

  setUp();

  assert.ok(units.isValidUnit);
  assert.equal(typeof units.isValidUnit, typeof function () { /* */ });

  const {isValidUnit} = units;
  assert.ok(isValidUnit('0'));
  assert.ok(isValidUnit('1'));
  assert.ok(isValidUnit('1.1'));
  assert.ok(isValidUnit('-1.1'));
  assert.ok(isValidUnit('.6mm'));
  assert.ok(isValidUnit('-.6cm'));
  assert.ok(isValidUnit('6000in'));
  assert.ok(isValidUnit('6px'));
  assert.ok(isValidUnit('6.3pc'));
  assert.ok(isValidUnit('-0.4em'));
  assert.ok(isValidUnit('-0.ex'));
  assert.ok(isValidUnit('40.123%'));

  assert.equal(isValidUnit('id', 'uniqueId', document.getElementById('uniqueId')), true);
  assert.equal(isValidUnit('id', 'newId', document.getElementById('uniqueId')), true);
  assert.equal(isValidUnit('id', 'uniqueId'), false);
  assert.equal(isValidUnit('id', 'uniqueId', document.getElementById('nonUniqueId')), false);
});

QUnit.test('Test svgedit.units.convertUnit()', function (assert) {
  assert.expect(4);

  setUp();

  assert.ok(units.convertUnit);
  assert.equal(typeof units.convertUnit, typeof function () { /* */ });
  // cm in default setup
  assert.equal(units.convertUnit(42), 1.1113);
  assert.equal(units.convertUnit(42, 'px'), 42);
});
