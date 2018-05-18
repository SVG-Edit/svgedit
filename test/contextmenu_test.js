/* eslint-disable no-var */
/* eslint-env qunit */
/* globals svgedit, $, equals */
$(function () {
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
    ok(svgedit.contextmenu.add, 'contextmenu.add registered correctly');
    ok(svgedit.contextmenu.hasCustomHandler, 'contextmenu hasCustomHandler registered correctly');
    ok(svgedit.contextmenu.getCustomHandler, 'contextmenu getCustomHandler registered correctly');
  });

  test('Test svgedit.contextmenu does not add invalid menu item', function () {
    expect(3);

    svgedit.contextmenu.add({id: 'justanid'});
    ok(!svgedit.contextmenu.hasCustomHandler('justanid'), 'menu item with just an id is invalid');

    svgedit.contextmenu.add({id: 'idandlabel', label: 'anicelabel'});
    ok(!svgedit.contextmenu.hasCustomHandler('idandlabel'), 'menu item with just an id and label is invalid');

    svgedit.contextmenu.add({id: 'idandlabel', label: 'anicelabel', action: 'notafunction'});
    ok(!svgedit.contextmenu.hasCustomHandler('idandlabel'), 'menu item with action that is not a function is invalid');
  });

  test('Test svgedit.contextmenu adds valid menu item', function () {
    expect(2);

    var validItem = {id: 'valid', label: 'anicelabel', action: function () { alert('testing'); }};
    svgedit.contextmenu.add(validItem);

    ok(svgedit.contextmenu.hasCustomHandler('valid'), 'Valid menu item is added.');
    equals(svgedit.contextmenu.getCustomHandler('valid'), validItem.action, 'Valid menu action is added.');
    tearDown();
  });

  test('Test svgedit.contextmenu rejects valid duplicate menu item id', function () {
    expect(1);

    var validItem1 = {id: 'valid', label: 'anicelabel', action: function () { alert('testing'); }};
    var validItem2 = {id: 'valid', label: 'anicelabel', action: function () { alert('testingtwice'); }};
    svgedit.contextmenu.add(validItem1);
    svgedit.contextmenu.add(validItem2);

    equals(svgedit.contextmenu.getCustomHandler('valid'), validItem1.action, 'duplicate menu item is rejected.');
    tearDown();
  });
});
