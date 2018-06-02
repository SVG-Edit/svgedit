/* eslint-env qunit */
import * as contextmenu from '../editor/contextmenu.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

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

  contextmenu.add({id: 'justanid'});
  assert.ok(!contextmenu.hasCustomHandler('justanid'), 'menu item with just an id is invalid');

  contextmenu.add({id: 'idandlabel', label: 'anicelabel'});
  assert.ok(!contextmenu.hasCustomHandler('idandlabel'), 'menu item with just an id and label is invalid');

  contextmenu.add({id: 'idandlabel', label: 'anicelabel', action: 'notafunction'});
  assert.ok(!contextmenu.hasCustomHandler('idandlabel'), 'menu item with action that is not a function is invalid');
});

QUnit.test('Test svgedit.contextmenu adds valid menu item', function (assert) {
  assert.expect(2);

  const validItem = {id: 'valid', label: 'anicelabel', action () { alert('testing'); }};
  contextmenu.add(validItem);

  assert.ok(contextmenu.hasCustomHandler('valid'), 'Valid menu item is added.');
  assert.equal(contextmenu.getCustomHandler('valid'), validItem.action, 'Valid menu action is added.');
  tearDown();
});

QUnit.test('Test svgedit.contextmenu rejects valid duplicate menu item id', function (assert) {
  assert.expect(1);

  const validItem1 = {id: 'valid', label: 'anicelabel', action () { alert('testing'); }};
  const validItem2 = {id: 'valid', label: 'anicelabel', action () { alert('testingtwice'); }};
  contextmenu.add(validItem1);
  contextmenu.add(validItem2);

  assert.equal(contextmenu.getCustomHandler('valid'), validItem1.action, 'duplicate menu item is rejected.');
  tearDown();
});
