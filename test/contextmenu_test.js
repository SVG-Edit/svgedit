/* eslint-env qunit */
/* globals svgedit, equals */

// log function
QUnit.log = function (details) {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
};

function tearDown () {
  svgedit.contextmenu.resetCustomMenus();
}

module('svgedit.contextmenu');

test('Test svgedit.contextmenu package', function () {
  expect(4);

  ok(svgedit.contextmenu, 'contextmenu registered correctly');
  ok(svgedit.addContextMenuItem, 'addContextMenuItem registered correctly');
  ok(svgedit.contextmenu.hasCustomMenuItemHandler, 'contextmenu hasCustomHandler registered correctly');
  ok(svgedit.contextmenu.getCustomMenuItemHandler, 'contextmenu getCustomHandler registered correctly');
});

test('Test svgedit.contextmenu does not add invalid menu item', function () {
  expect(3);

  svgedit.addContextMenuItem({id: 'justanid'});
  ok(!svgedit.contextmenu.hasCustomMenuItemHandler('justanid'), 'menu item with just an id is invalid');

  svgedit.addContextMenuItem({id: 'idandlabel', label: 'anicelabel'});
  ok(!svgedit.contextmenu.hasCustomMenuItemHandler('idandlabel'), 'menu item with just an id and label is invalid');

  svgedit.addContextMenuItem({id: 'idandlabel', label: 'anicelabel', action: 'notafunction'});
  ok(!svgedit.contextmenu.hasCustomMenuItemHandler('idandlabel'), 'menu item with action that is not a function is invalid');
});

test('Test svgedit.contextmenu adds valid menu item', function () {
  expect(2);

  const validItem = {id: 'valid', label: 'anicelabel', action () { alert('testing'); }};
  svgedit.addContextMenuItem(validItem);

  ok(svgedit.contextmenu.hasCustomMenuItemHandler('valid'), 'Valid menu item is added.');
  equals(svgedit.contextmenu.getCustomMenuItemHandler('valid'), validItem.action, 'Valid menu action is added.');
  tearDown();
});

test('Test svgedit.contextmenu rejects valid duplicate menu item id', function () {
  expect(1);

  const validItem1 = {id: 'valid', label: 'anicelabel', action () { alert('testing'); }};
  const validItem2 = {id: 'valid', label: 'anicelabel', action () { alert('testingtwice'); }};
  svgedit.addContextMenuItem(validItem1);
  svgedit.addContextMenuItem(validItem2);

  equals(svgedit.contextmenu.getCustomMenuItemHandler('valid'), validItem1.action, 'duplicate menu item is rejected.');
  tearDown();
});
