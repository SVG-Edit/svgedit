import '../../instrumented/jquery.min.js';
import * as contextmenu from '../../instrumented/contextmenu.js';

describe('contextmenu', function () {
  /**
   * Tear down tests, resetting custom menus.
   * @returns {void}
   */
  afterEach(() => {
    contextmenu.resetCustomMenus();
  });

  it('Test svgedit.contextmenu package', function () {
    assert.ok(contextmenu, 'contextmenu registered correctly');
    assert.ok(contextmenu.add, 'add registered correctly');
    assert.ok(contextmenu.hasCustomHandler, 'contextmenu hasCustomHandler registered correctly');
    assert.ok(contextmenu.getCustomHandler, 'contextmenu getCustomHandler registered correctly');
  });

  it('Test svgedit.contextmenu does not add invalid menu item', function () {
    assert.throws(
      () => contextmenu.add({id: 'justanid'}),
      null, null,
      'menu item with just an id is invalid'
    );

    assert.throws(
      () => contextmenu.add({id: 'idandlabel', label: 'anicelabel'}),
      null, null,
      'menu item with just an id and label is invalid'
    );

    assert.throws(
      () => contextmenu.add({id: 'idandlabel', label: 'anicelabel', action: 'notafunction'}),
      null, null,
      'menu item with action that is not a function is invalid'
    );
  });

  it('Test svgedit.contextmenu adds valid menu item', function () {
    const validItem = {id: 'valid', label: 'anicelabel', action () { /* */ }};
    contextmenu.add(validItem);

    assert.ok(contextmenu.hasCustomHandler('valid'), 'Valid menu item is added.');
    assert.equal(contextmenu.getCustomHandler('valid'), validItem.action, 'Valid menu action is added.');
  });

  it('Test svgedit.contextmenu rejects valid duplicate menu item id', function () {
    const validItem1 = {id: 'valid', label: 'anicelabel', action () { /**/ }};
    const validItem2 = {id: 'valid', label: 'anicelabel', action () { /**/ }};
    contextmenu.add(validItem1);

    assert.throws(
      () => contextmenu.add(validItem2),
      null, null,
      'duplicate menu item is rejected.'
    );
  });
});
