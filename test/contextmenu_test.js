/* eslint-env qunit */
import * as contextmenu from '../editor/contextmenu.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

/**
 * Tear down tests, resetting custom menus.
 * @returns {void}
 */
function tearDown () {
  contextmenu.resetCustomMenus();
}

QUnit.module('svgedit.contextmenu');

QUnit.test('Test svgedit.contextmenu package', function (assert) {
  assert.expect(4);

  assert.ok(contextmenu, 'contextmenu registered correctly');
  assert.ok(contextmenu.add, 'add registered correctly');
  assert.ok(contextmenu.hasCustomHandler, 'contextmenu hasCustomHandler registered correctly');
  assert.ok(contextmenu.getCustomHandler, 'contextmenu getCustomHandler registered correctly');
});

QUnit.test('Test svgedit.contextmenu does not add invalid menu item', function (assert) {
  assert.expect(3);

  assert.throws(
    () => contextmenu.add({id: 'justanid'}),
    'menu item with just an id is invalid'
  );

  assert.throws(
    () => contextmenu.add({id: 'idandlabel', label: 'anicelabel'}),
    'menu item with just an id and label is invalid'
  );

  assert.throws(
    () => contextmenu.add({id: 'idandlabel', label: 'anicelabel', action: 'notafunction'}),
    'menu item with action that is not a function is invalid'
  );
});

QUnit.test('Test svgedit.contextmenu adds valid menu item', function (assert) {
  assert.expect(2);

  const validItem = {id: 'valid', label: 'anicelabel', action () { console.log('testing'); }};
  contextmenu.add(validItem);

  assert.ok(contextmenu.hasCustomHandler('valid'), 'Valid menu item is added.');
  assert.equal(contextmenu.getCustomHandler('valid'), validItem.action, 'Valid menu action is added.');
  tearDown();
});

QUnit.test('Test svgedit.contextmenu rejects valid duplicate menu item id', function (assert) {
  assert.expect(1);

  const validItem1 = {id: 'valid', label: 'anicelabel', action () { console.log('testing'); }};
  const validItem2 = {id: 'valid', label: 'anicelabel', action () { console.log('testingtwice'); }};
  contextmenu.add(validItem1);

  assert.throws(
    () => contextmenu.add(validItem2),
    'duplicate menu item is rejected.'
  );

  tearDown();
});
