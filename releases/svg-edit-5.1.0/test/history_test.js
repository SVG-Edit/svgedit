/* eslint-env qunit */

import {NS} from '../editor/namespaces.js';
import * as transformlist from '../editor/svgtransformlist.js';
import * as utilities from '../editor/utilities.js';
import * as hstory from '../editor/history.js';

// TODO(codedread): Write tests for handling history events.

// Mocked out methods.
transformlist.changeRemoveElementFromListMap((elem) => { /* */ });

utilities.mock({
  getHref (elem) { return '#foo'; },
  setHref (elem, val) { /* */ },
  getRotationAngle (elem) { return 0; }
});

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

// const svg = document.createElementNS(NS.SVG, 'svg');
let undoMgr = null;
const divparent = document.getElementById('divparent');
const div1 = document.getElementById('div1');
const div2 = document.getElementById('div2');
const div3 = document.getElementById('div3');
const div4 = document.getElementById('div4');
const div5 = document.getElementById('div5');

QUnit.module('svgedit.history');

class MockCommand {
  constructor (optText) { this.text_ = optText; }
  apply () { /* */ } // eslint-disable-line class-methods-use-this
  unapply () { /* */ } // eslint-disable-line class-methods-use-this
  getText () { return this.text_; }
  elements () { return []; } // eslint-disable-line class-methods-use-this
}

/*
class MockHistoryEventHandler {
  handleHistoryEvent (eventType, command) {}
}
*/

/**
 * Set up tests (with undo manager).
 * @returns {void}
 */
function setUp () {
  undoMgr = new hstory.UndoManager();
}
/**
 * Tear down tests, destroying undo manager.
 * @returns {void}
 */
function tearDown () {
  undoMgr = null;
}

QUnit.test('Test svgedit.history package', function (assert) {
  assert.expect(13);

  assert.ok(hstory);
  assert.ok(hstory.MoveElementCommand);
  assert.ok(hstory.InsertElementCommand);
  assert.ok(hstory.ChangeElementCommand);
  assert.ok(hstory.RemoveElementCommand);
  assert.ok(hstory.BatchCommand);
  assert.ok(hstory.UndoManager);
  assert.equal(typeof hstory.MoveElementCommand, typeof function () { /* */ });
  assert.equal(typeof hstory.InsertElementCommand, typeof function () { /* */ });
  assert.equal(typeof hstory.ChangeElementCommand, typeof function () { /* */ });
  assert.equal(typeof hstory.RemoveElementCommand, typeof function () { /* */ });
  assert.equal(typeof hstory.BatchCommand, typeof function () { /* */ });
  assert.equal(typeof hstory.UndoManager, typeof function () { /* */ });
});

QUnit.test('Test UndoManager methods', function (assert) {
  assert.expect(14);
  setUp();

  assert.ok(undoMgr);
  assert.ok(undoMgr.addCommandToHistory);
  assert.ok(undoMgr.getUndoStackSize);
  assert.ok(undoMgr.getRedoStackSize);
  assert.ok(undoMgr.resetUndoStack);
  assert.ok(undoMgr.getNextUndoCommandText);
  assert.ok(undoMgr.getNextRedoCommandText);

  assert.equal(typeof undoMgr, typeof {});
  assert.equal(typeof undoMgr.addCommandToHistory, typeof function () { /* */ });
  assert.equal(typeof undoMgr.getUndoStackSize, typeof function () { /* */ });
  assert.equal(typeof undoMgr.getRedoStackSize, typeof function () { /* */ });
  assert.equal(typeof undoMgr.resetUndoStack, typeof function () { /* */ });
  assert.equal(typeof undoMgr.getNextUndoCommandText, typeof function () { /* */ });
  assert.equal(typeof undoMgr.getNextRedoCommandText, typeof function () { /* */ });

  tearDown();
});

QUnit.test('Test UndoManager.addCommandToHistory() function', function (assert) {
  assert.expect(3);

  setUp();

  assert.equal(undoMgr.getUndoStackSize(), 0);
  undoMgr.addCommandToHistory(new MockCommand());
  assert.equal(undoMgr.getUndoStackSize(), 1);
  undoMgr.addCommandToHistory(new MockCommand());
  assert.equal(undoMgr.getUndoStackSize(), 2);

  tearDown();
});

QUnit.test('Test UndoManager.getUndoStackSize() and getRedoStackSize() functions', function (assert) {
  assert.expect(18);

  setUp();

  undoMgr.addCommandToHistory(new MockCommand());
  undoMgr.addCommandToHistory(new MockCommand());
  undoMgr.addCommandToHistory(new MockCommand());

  assert.equal(undoMgr.getUndoStackSize(), 3);
  assert.equal(undoMgr.getRedoStackSize(), 0);

  undoMgr.undo();
  assert.equal(undoMgr.getUndoStackSize(), 2);
  assert.equal(undoMgr.getRedoStackSize(), 1);

  undoMgr.undo();
  assert.equal(undoMgr.getUndoStackSize(), 1);
  assert.equal(undoMgr.getRedoStackSize(), 2);

  undoMgr.undo();
  assert.equal(undoMgr.getUndoStackSize(), 0);
  assert.equal(undoMgr.getRedoStackSize(), 3);

  undoMgr.undo();
  assert.equal(undoMgr.getUndoStackSize(), 0);
  assert.equal(undoMgr.getRedoStackSize(), 3);

  undoMgr.redo();
  assert.equal(undoMgr.getUndoStackSize(), 1);
  assert.equal(undoMgr.getRedoStackSize(), 2);

  undoMgr.redo();
  assert.equal(undoMgr.getUndoStackSize(), 2);
  assert.equal(undoMgr.getRedoStackSize(), 1);

  undoMgr.redo();
  assert.equal(undoMgr.getUndoStackSize(), 3);
  assert.equal(undoMgr.getRedoStackSize(), 0);

  undoMgr.redo();
  assert.equal(undoMgr.getUndoStackSize(), 3);
  assert.equal(undoMgr.getRedoStackSize(), 0);

  tearDown();
});

QUnit.test('Test UndoManager.resetUndoStackSize() function', function (assert) {
  assert.expect(4);

  setUp();

  undoMgr.addCommandToHistory(new MockCommand());
  undoMgr.addCommandToHistory(new MockCommand());
  undoMgr.addCommandToHistory(new MockCommand());
  undoMgr.undo();

  assert.equal(undoMgr.getUndoStackSize(), 2);
  assert.equal(undoMgr.getRedoStackSize(), 1);

  undoMgr.resetUndoStack();

  assert.equal(undoMgr.getUndoStackSize(), 0);
  assert.equal(undoMgr.getRedoStackSize(), 0);

  tearDown();
});

QUnit.test('Test UndoManager.getNextUndoCommandText() function', function (assert) {
  assert.expect(9);

  setUp();

  assert.equal(undoMgr.getNextUndoCommandText(), '');

  undoMgr.addCommandToHistory(new MockCommand('First'));
  undoMgr.addCommandToHistory(new MockCommand('Second'));
  undoMgr.addCommandToHistory(new MockCommand('Third'));

  assert.equal(undoMgr.getNextUndoCommandText(), 'Third');

  undoMgr.undo();
  assert.equal(undoMgr.getNextUndoCommandText(), 'Second');

  undoMgr.undo();
  assert.equal(undoMgr.getNextUndoCommandText(), 'First');

  undoMgr.undo();
  assert.equal(undoMgr.getNextUndoCommandText(), '');

  undoMgr.redo();
  assert.equal(undoMgr.getNextUndoCommandText(), 'First');

  undoMgr.redo();
  assert.equal(undoMgr.getNextUndoCommandText(), 'Second');

  undoMgr.redo();
  assert.equal(undoMgr.getNextUndoCommandText(), 'Third');

  undoMgr.redo();
  assert.equal(undoMgr.getNextUndoCommandText(), 'Third');

  tearDown();
});

QUnit.test('Test UndoManager.getNextRedoCommandText() function', function (assert) {
  assert.expect(8);

  setUp();

  assert.equal(undoMgr.getNextRedoCommandText(), '');

  undoMgr.addCommandToHistory(new MockCommand('First'));
  undoMgr.addCommandToHistory(new MockCommand('Second'));
  undoMgr.addCommandToHistory(new MockCommand('Third'));

  assert.equal(undoMgr.getNextRedoCommandText(), '');

  undoMgr.undo();
  assert.equal(undoMgr.getNextRedoCommandText(), 'Third');

  undoMgr.undo();
  assert.equal(undoMgr.getNextRedoCommandText(), 'Second');

  undoMgr.undo();
  assert.equal(undoMgr.getNextRedoCommandText(), 'First');

  undoMgr.redo();
  assert.equal(undoMgr.getNextRedoCommandText(), 'Second');

  undoMgr.redo();
  assert.equal(undoMgr.getNextRedoCommandText(), 'Third');

  undoMgr.redo();
  assert.equal(undoMgr.getNextRedoCommandText(), '');

  tearDown();
});

QUnit.test('Test UndoManager.undo() and redo() functions', function (assert) {
  assert.expect(10);

  setUp();

  let lastCalled = null;
  const cmd1 = new MockCommand();
  const cmd2 = new MockCommand();
  const cmd3 = new MockCommand();
  cmd1.apply = function () { lastCalled = 'cmd1.apply'; };
  cmd2.apply = function () { lastCalled = 'cmd2.apply'; };
  cmd3.apply = function () { lastCalled = 'cmd3.apply'; };
  cmd1.unapply = function () { lastCalled = 'cmd1.unapply'; };
  cmd2.unapply = function () { lastCalled = 'cmd2.unapply'; };
  cmd3.unapply = function () { lastCalled = 'cmd3.unapply'; };

  undoMgr.addCommandToHistory(cmd1);
  undoMgr.addCommandToHistory(cmd2);
  undoMgr.addCommandToHistory(cmd3);

  assert.ok(!lastCalled);

  undoMgr.undo();
  assert.equal(lastCalled, 'cmd3.unapply');

  undoMgr.redo();
  assert.equal(lastCalled, 'cmd3.apply');

  undoMgr.undo();
  undoMgr.undo();
  assert.equal(lastCalled, 'cmd2.unapply');

  undoMgr.undo();
  assert.equal(lastCalled, 'cmd1.unapply');
  lastCalled = null;

  undoMgr.undo();
  assert.ok(!lastCalled);

  undoMgr.redo();
  assert.equal(lastCalled, 'cmd1.apply');

  undoMgr.redo();
  assert.equal(lastCalled, 'cmd2.apply');

  undoMgr.redo();
  assert.equal(lastCalled, 'cmd3.apply');
  lastCalled = null;

  undoMgr.redo();
  assert.ok(!lastCalled);

  tearDown();
});

QUnit.test('Test MoveElementCommand', function (assert) {
  assert.expect(26);

  setUp();

  let move = new hstory.MoveElementCommand(div3, div1, divparent);
  assert.ok(move.unapply);
  assert.ok(move.apply);
  assert.equal(typeof move.unapply, typeof function () { /* */ });
  assert.equal(typeof move.apply, typeof function () { /* */ });

  move.unapply();
  assert.equal(divparent.firstElementChild, div3);
  assert.equal(divparent.firstElementChild.nextElementSibling, div1);
  assert.equal(divparent.lastElementChild, div2);

  move.apply();
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(divparent.firstElementChild.nextElementSibling, div2);
  assert.equal(divparent.lastElementChild, div3);

  move = new hstory.MoveElementCommand(div1, null, divparent);

  move.unapply();
  assert.equal(divparent.firstElementChild, div2);
  assert.equal(divparent.firstElementChild.nextElementSibling, div3);
  assert.equal(divparent.lastElementChild, div1);

  move.apply();
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(divparent.firstElementChild.nextElementSibling, div2);
  assert.equal(divparent.lastElementChild, div3);

  move = new hstory.MoveElementCommand(div2, div5, div4);

  move.unapply();
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(divparent.firstElementChild.nextElementSibling, div3);
  assert.equal(divparent.lastElementChild, div3);
  assert.equal(div4.firstElementChild, div2);
  assert.equal(div4.firstElementChild.nextElementSibling, div5);

  move.apply();
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(divparent.firstElementChild.nextElementSibling, div2);
  assert.equal(divparent.lastElementChild, div3);
  assert.equal(div4.firstElementChild, div5);
  assert.equal(div4.lastElementChild, div5);

  tearDown();
});

QUnit.test('Test InsertElementCommand', function (assert) {
  assert.expect(20);

  setUp();

  let insert = new hstory.InsertElementCommand(div3);
  assert.ok(insert.unapply);
  assert.ok(insert.apply);
  assert.equal(typeof insert.unapply, typeof function () { /* */ });
  assert.equal(typeof insert.apply, typeof function () { /* */ });

  insert.unapply();
  assert.equal(divparent.childElementCount, 2);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div2);
  assert.equal(divparent.lastElementChild, div2);

  insert.apply();
  assert.equal(divparent.childElementCount, 3);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div2);
  assert.equal(div2.nextElementSibling, div3);

  insert = new hstory.InsertElementCommand(div2);

  insert.unapply();
  assert.equal(divparent.childElementCount, 2);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div3);
  assert.equal(divparent.lastElementChild, div3);

  insert.apply();
  assert.equal(divparent.childElementCount, 3);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div2);
  assert.equal(div2.nextElementSibling, div3);

  tearDown();
});

QUnit.test('Test RemoveElementCommand', function (assert) {
  assert.expect(22);

  setUp();

  const div6 = document.createElement('div');
  div6.id = 'div6';

  let remove = new hstory.RemoveElementCommand(div6, null, divparent);
  assert.ok(remove.unapply);
  assert.ok(remove.apply);
  assert.equal(typeof remove.unapply, typeof function () { /* */ });
  assert.equal(typeof remove.apply, typeof function () { /* */ });

  remove.unapply();
  assert.equal(divparent.childElementCount, 4);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div2);
  assert.equal(div2.nextElementSibling, div3);
  assert.equal(div3.nextElementSibling, div6);

  remove.apply();
  assert.equal(divparent.childElementCount, 3);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div2);
  assert.equal(div2.nextElementSibling, div3);

  remove = new hstory.RemoveElementCommand(div6, div2, divparent);

  remove.unapply();
  assert.equal(divparent.childElementCount, 4);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div6);
  assert.equal(div6.nextElementSibling, div2);
  assert.equal(div2.nextElementSibling, div3);

  remove.apply();
  assert.equal(divparent.childElementCount, 3);
  assert.equal(divparent.firstElementChild, div1);
  assert.equal(div1.nextElementSibling, div2);
  assert.equal(div2.nextElementSibling, div3);

  tearDown();
});

QUnit.test('Test ChangeElementCommand', function (assert) {
  assert.expect(26);

  setUp();

  div1.setAttribute('title', 'new title');
  let change = new hstory.ChangeElementCommand(div1,
    {title: 'old title', class: 'foo'});
  assert.ok(change.unapply);
  assert.ok(change.apply);
  assert.equal(typeof change.unapply, typeof function () { /* */ });
  assert.equal(typeof change.apply, typeof function () { /* */ });

  change.unapply();
  assert.equal(div1.getAttribute('title'), 'old title');
  assert.equal(div1.getAttribute('class'), 'foo');

  change.apply();
  assert.equal(div1.getAttribute('title'), 'new title');
  assert.ok(!div1.getAttribute('class'));

  div1.textContent = 'inner text';
  change = new hstory.ChangeElementCommand(div1,
    {'#text': null});

  change.unapply();
  assert.ok(!div1.textContent);

  change.apply();
  assert.equal(div1.textContent, 'inner text');

  div1.textContent = '';
  change = new hstory.ChangeElementCommand(div1,
    {'#text': 'old text'});

  change.unapply();
  assert.equal(div1.textContent, 'old text');

  change.apply();
  assert.ok(!div1.textContent);

  // TODO(codedread): Refactor this #href stuff in history.js and svgcanvas.js
  const rect = document.createElementNS(NS.SVG, 'rect');
  let justCalled = null;
  let gethrefvalue = null;
  let sethrefvalue = null;
  utilities.mock({
    getHref (elem) {
      assert.equal(elem, rect);
      justCalled = 'getHref';
      return gethrefvalue;
    },
    setHref (elem, val) {
      assert.equal(elem, rect);
      assert.equal(val, sethrefvalue);
      justCalled = 'setHref';
    },
    getRotationAngle (elem) { return 0; }
  });

  gethrefvalue = '#newhref';
  change = new hstory.ChangeElementCommand(rect,
    {'#href': '#oldhref'});
  assert.equal(justCalled, 'getHref');

  justCalled = null;
  sethrefvalue = '#oldhref';
  change.unapply();
  assert.equal(justCalled, 'setHref');

  justCalled = null;
  sethrefvalue = '#newhref';
  change.apply();
  assert.equal(justCalled, 'setHref');

  const line = document.createElementNS(NS.SVG, 'line');
  line.setAttribute('class', 'newClass');
  change = new hstory.ChangeElementCommand(line, {class: 'oldClass'});

  assert.ok(change.unapply);
  assert.ok(change.apply);
  assert.equal(typeof change.unapply, typeof function () { /* */ });
  assert.equal(typeof change.apply, typeof function () { /* */ });

  change.unapply();
  assert.equal(line.getAttribute('class'), 'oldClass');

  change.apply();
  assert.equal(line.getAttribute('class'), 'newClass');

  tearDown();
});

QUnit.test('Test BatchCommand', function (assert) {
  assert.expect(13);

  setUp();

  let concatResult = '';
  MockCommand.prototype.apply = function () { concatResult += this.text_; };

  const batch = new hstory.BatchCommand();
  assert.ok(batch.unapply);
  assert.ok(batch.apply);
  assert.ok(batch.addSubCommand);
  assert.ok(batch.isEmpty);
  assert.equal(typeof batch.unapply, typeof function () { /* */ });
  assert.equal(typeof batch.apply, typeof function () { /* */ });
  assert.equal(typeof batch.addSubCommand, typeof function () { /* */ });
  assert.equal(typeof batch.isEmpty, typeof function () { /* */ });

  assert.ok(batch.isEmpty());

  batch.addSubCommand(new MockCommand('a'));
  assert.ok(!batch.isEmpty());
  batch.addSubCommand(new MockCommand('b'));
  batch.addSubCommand(new MockCommand('c'));

  assert.ok(!concatResult);
  batch.apply();
  assert.equal(concatResult, 'abc');

  MockCommand.prototype.apply = function () { /* */ };
  MockCommand.prototype.unapply = function () { concatResult += this.text_; };
  concatResult = '';
  batch.unapply();
  assert.equal(concatResult, 'cba');

  MockCommand.prototype.unapply = function () { /* */ };

  tearDown();
});
