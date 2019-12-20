import '../../instrumented/jquery.min.js';

import * as units from '../../instrumented/units.js';

describe('units', function () {
  /**
   * Set up tests, supplying mock data.
   * @returns {void}
   */
  beforeEach(() => {
    document.body.textContent = '';
    const anchor = document.createElement('div');
    anchor.id = 'anchor';
    anchor.style.visibility = 'hidden';

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'elementsContainer';

    const uniqueId = document.createElement('div');
    uniqueId.id = 'uniqueId';
    uniqueId.style.visibility = 'hidden';

    const nonUniqueId = document.createElement('div');
    nonUniqueId.id = 'nonUniqueId';
    nonUniqueId.style.visibility = 'hidden';

    elementsContainer.append(uniqueId, nonUniqueId);

    document.body.append(anchor, elementsContainer);

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
  });

  it('Test svgedit.units package', function () {
    assert.ok(units);
    assert.equal(typeof units, typeof {});
  });

  it('Test svgedit.units.shortFloat()', function () {
    assert.ok(units.shortFloat);
    assert.equal(typeof units.shortFloat, typeof function () { /* */ });

    const {shortFloat} = units;
    assert.equal(shortFloat(0.00000001), 0);
    assert.equal(shortFloat(1), 1);
    assert.equal(shortFloat(3.45678), 3.4568);
    assert.equal(shortFloat(1.23443), 1.2344);
    assert.equal(shortFloat(1.23455), 1.2346);
  });

  it('Test svgedit.units.isValidUnit()', function () {
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

  it('Test svgedit.units.convertUnit()', function () {
    assert.ok(units.convertUnit);
    assert.equal(typeof units.convertUnit, typeof function () { /* */ });
    // cm in default setup
    assert.equal(units.convertUnit(42), 1.1113);
    assert.equal(units.convertUnit(42, 'px'), 42);
  });
});
