import '../../instrumented/jquery.min.js';

import * as browser from '../../instrumented/browser.js';
import * as utilities from '../../instrumented/utilities.js';
import {NS} from '../../instrumented/namespaces.js';

describe('utilities', function () {
  /**
   * Create an element for test.
   * @param {module:utilities.SVGElementJSON} jsonMap
   * @returns {SVGElement}
   */
  function mockCreateSVGElement (jsonMap) {
    const elem = document.createElementNS(NS.SVG, jsonMap.element);
    Object.entries(jsonMap.attr).forEach(([attr, value]) => {
      elem.setAttribute(attr, value);
    });
    return elem;
  }
  /**
   * Adds SVG Element per parameters and appends to root.
   * @param {module:utilities.SVGElementJSON} json
   * @returns {SVGElement}
   */
  function mockaddSVGElementFromJson (json) {
    const elem = mockCreateSVGElement(json);
    svgroot.append(elem);
    return elem;
  }
  const mockPathActions = {resetOrientation () { /* */ }};
  let mockHistorySubCommands = [];
  const mockHistory = {
    BatchCommand: class {
      // eslint-disable-next-line class-methods-use-this
      addSubCommand (cmd) {
        mockHistorySubCommands.push(cmd);
      }
    },
    RemoveElementCommand: class {
      // Longhand needed since used as a constructor
      constructor (elem, nextSibling, parent) {
        this.elem = elem;
        this.nextSibling = nextSibling;
        this.parent = parent;
      }
    },
    InsertElementCommand: class {
      constructor (path) { // Longhand needed since used as a constructor
        this.path = path;
      }
    }
  };
  const mockCount = {
    clearSelection: 0,
    addToSelection: 0,
    addCommandToHistory: 0
  };

  /**
   * Increments clear seleciton count for mock test.
   * @returns {void}
   */
  function mockClearSelection () {
    mockCount.clearSelection++;
  }
  /**
  * Increments add selection count for mock test.
   * @returns {void}
   */
  function mockAddToSelection () {
    mockCount.addToSelection++;
  }
  /**
  * Increments add command to history count for mock test.
   * @returns {void}
   */
  function mockAddCommandToHistory () {
    mockCount.addCommandToHistory++;
  }

  let svg, svgroot;
  beforeEach(() => {
    document.body.textContent = '';

    mockHistorySubCommands = [];
    mockCount.clearSelection = 0;
    mockCount.addToSelection = 0;
    mockCount.addCommandToHistory = 0;

    const sandbox = document.createElement('div');
    svg = document.createElementNS(NS.SVG, 'svg');
    svgroot = mockCreateSVGElement({
      element: 'svg',
      attr: {id: 'svgroot'}
    });
    sandbox.append(svgroot);
    document.body.append(sandbox);
  });

  it('Test svgedit.utilities package', function () {
    assert.ok(utilities);
    assert.ok(utilities.toXml);
    assert.equal(typeof utilities.toXml, typeof function () { /* */ });
  });

  it('Test svgedit.utilities.toXml() function', function () {
    const {toXml} = utilities;

    assert.equal(toXml('a'), 'a');
    assert.equal(toXml('ABC_'), 'ABC_');
    assert.equal(toXml('PB&J'), 'PB&amp;J');
    assert.equal(toXml('2 < 5'), '2 &lt; 5');
    assert.equal(toXml('5 > 2'), '5 &gt; 2');
    assert.equal(toXml('\'<&>"'), '&#x27;&lt;&amp;&gt;&quot;');
  });

  it('Test svgedit.utilities.fromXml() function', function () {
    const {fromXml} = utilities;

    assert.equal(fromXml('a'), 'a');
    assert.equal(fromXml('ABC_'), 'ABC_');
    assert.equal(fromXml('PB&amp;J'), 'PB&J');
    assert.equal(fromXml('2 &lt; 5'), '2 < 5');
    assert.equal(fromXml('5 &gt; 2'), '5 > 2');
    assert.equal(fromXml('&lt;&amp;&gt;'), '<&>');
  });

  it('Test svgedit.utilities.encode64() function', function () {
    const {encode64} = utilities;

    assert.equal(encode64('abcdef'), 'YWJjZGVm');
    assert.equal(encode64('12345'), 'MTIzNDU=');
    assert.equal(encode64(' '), 'IA==');
    assert.equal(encode64('`~!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?'), 'YH4hQCMkJV4mKigpLV89K1t7XX1cfDs6JyIsPC4+Lz8=');
  });

  it('Test svgedit.utilities.decode64() function', function () {
    const {decode64} = utilities;

    assert.equal(decode64('YWJjZGVm'), 'abcdef');
    assert.equal(decode64('MTIzNDU='), '12345');
    assert.equal(decode64('IA=='), ' ');
    assert.equal(decode64('YH4hQCMkJV4mKigpLV89K1t7XX1cfDs6JyIsPC4+Lz8='), '`~!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?');
  });

  it('Test svgedit.utilities.convertToXMLReferences() function', function () {
    const convert = utilities.convertToXMLReferences;
    assert.equal(convert('ABC'), 'ABC');
    // assert.equal(convert('�BC'), '&#192;BC');
  });

  it('Test svgedit.utilities.bboxToObj() function', function () {
    const {bboxToObj} = utilities;

    const rect = svg.createSVGRect();
    rect.x = 1;
    rect.y = 2;
    rect.width = 3;
    rect.height = 4;

    const obj = bboxToObj(rect);
    assert.equal(typeof obj, typeof {});
    assert.equal(obj.x, 1);
    assert.equal(obj.y, 2);
    assert.equal(obj.width, 3);
    assert.equal(obj.height, 4);
  });

  it('Test getUrlFromAttr', function () {
    assert.equal(utilities.getUrlFromAttr('url(#foo)'), '#foo');
    assert.equal(utilities.getUrlFromAttr('url(somefile.svg#foo)'), 'somefile.svg#foo');
    assert.equal(utilities.getUrlFromAttr('url("#foo")'), '#foo');
    assert.equal(utilities.getUrlFromAttr('url("#foo")'), '#foo');
  });

  it('Test getPathBBox', function () {
    if (browser.supportsPathBBox()) {
      return;
    }
    const doc = utilities.text2xml('<svg></svg>');
    const path = doc.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'm0,0l5,0l0,5l-5,0l0,-5z');
    const bb = utilities.getPathBBox(path);
    assert.equal(typeof bb, 'object', 'BBox returned object');
    assert.ok(bb.x && !isNaN(bb.x));
    assert.ok(bb.y && !isNaN(bb.y));
  });

  it('Test getPathDFromSegments', function () {
    const {getPathDFromSegments} = utilities;

    const doc = utilities.text2xml('<svg></svg>');
    const path = doc.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'm0,0l5,0l0,5l-5,0l0,-5z');
    let d = getPathDFromSegments([
      ['M', [1, 2]],
      ['Z', []]
    ]);
    assert.equal(d, 'M1,2 Z');

    d = getPathDFromSegments([
      ['M', [1, 2]],
      ['M', [3, 4]],
      ['Z', []]
    ]);
    assert.equal(d, 'M1,2 M3,4 Z');

    d = getPathDFromSegments([
      ['M', [1, 2]],
      ['C', [3, 4, 5, 6]],
      ['Z', []]
    ]);
    assert.equal(d, 'M1,2 C3,4 5,6 Z');
  });

  it('Test getPathDFromElement', function () {
    const {getPathDFromElement} = utilities;

    let elem = mockCreateSVGElement({
      element: 'path',
      attr: {id: 'path', d: 'M0,1 Z'}
    });
    svgroot.append(elem);
    assert.equal(getPathDFromElement(elem), 'M0,1 Z');
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'rect',
      attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
    });
    svgroot.append(elem);
    assert.equal(getPathDFromElement(elem), 'M0,1 L5,1 L5,11 L0,11 L0,1 Z');
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'rect',
      attr: {id: 'roundrect', x: '0', y: '1', rx: '2', ry: '3', width: '10', height: '11'}
    });
    svgroot.append(elem);
    const closeEnough = /M0,4 C0,2.3\d* 0.9\d*,1 2,1 L8,1 C9.0\d*,1 10,2.3\d* 10,4 L10,9 C10,10.6\d* 9.08675799086758,12 8,12 L2,12 C0.9\d*,12 0,10.6\d* 0,9 L0,4 Z/;
    assert.equal(closeEnough.test(getPathDFromElement(elem)), true);
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'line',
      attr: {id: 'line', x1: '0', y1: '1', x2: '5', y2: '6'}
    });
    svgroot.append(elem);
    assert.equal(getPathDFromElement(elem), 'M0,1L5,6');
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'circle',
      attr: {id: 'circle', cx: '10', cy: '11', rx: '5', ry: '10'}
    });
    svgroot.append(elem);
    assert.equal(getPathDFromElement(elem), 'M10,11 C10,11 10,11 10,11 C10,11 10,11 10,11 C10,11 10,11 10,11 C10,11 10,11 10,11 Z');
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'polyline',
      attr: {id: 'polyline', points: '0,1 5,1 5,11 0,11'}
    });
    svgroot.append(elem);
    assert.equal(getPathDFromElement(elem), 'M0,1 5,1 5,11 0,11');
    elem.remove();

    assert.equal(getPathDFromElement({tagName: 'something unknown'}), undefined);
  });

  it('Test getBBoxOfElementAsPath', function () {
    /**
     * Wrap `utilities.getBBoxOfElementAsPath` to convert bbox to object for testing.
     * @type {module:utilities.getBBoxOfElementAsPath}
     */
    function getBBoxOfElementAsPath (elem, addSVGElementFromJson, pathActions) {
      const bbox = utilities.getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions);
      return utilities.bboxToObj(bbox); // need this for assert.equal() to work.
    }

    let elem = mockCreateSVGElement({
      element: 'path',
      attr: {id: 'path', d: 'M0,1 Z'}
    });
    svgroot.append(elem);
    let bbox = getBBoxOfElementAsPath(elem, mockaddSVGElementFromJson, mockPathActions);
    assert.deepEqual(bbox, {x: 0, y: 1, width: 0, height: 0});
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'rect',
      attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
    });
    svgroot.append(elem);
    bbox = getBBoxOfElementAsPath(elem, mockaddSVGElementFromJson, mockPathActions);
    assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
    elem.remove();

    elem = mockCreateSVGElement({
      element: 'line',
      attr: {id: 'line', x1: '0', y1: '1', x2: '5', y2: '6'}
    });
    svgroot.append(elem);
    bbox = getBBoxOfElementAsPath(elem, mockaddSVGElementFromJson, mockPathActions);
    assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 5});
    elem.remove();

    // TODO: test element with transform. Need resetOrientation above to be working or mock it.
  });

  it('Test convertToPath rect', function () {
    const {convertToPath} = utilities;
    const attrs = {
      fill: 'red',
      stroke: 'white',
      'stroke-width': '1',
      visibility: 'hidden'
    };

    const elem = mockCreateSVGElement({
      element: 'rect',
      attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
    });
    svgroot.append(elem);
    const path = convertToPath(elem, attrs, mockaddSVGElementFromJson, mockPathActions, mockClearSelection, mockAddToSelection, mockHistory, mockAddCommandToHistory);
    assert.equal(path.getAttribute('d'), 'M0,1 L5,1 L5,11 L0,11 L0,1 Z');
    assert.equal(path.getAttribute('visibilituy'), null);
    assert.equal(path.id, 'rect');
    assert.equal(path.parentNode, svgroot);
    assert.equal(elem.parentNode, null);
    assert.equal(mockHistorySubCommands.length, 2);
    assert.equal(mockCount.clearSelection, 1);
    assert.equal(mockCount.addToSelection, 1);
    assert.equal(mockCount.addCommandToHistory, 1);
    path.remove();
  });

  it('Test convertToPath unknown element', function () {
    const {convertToPath} = utilities;
    const attrs = {
      fill: 'red',
      stroke: 'white',
      'stroke-width': '1',
      visibility: 'hidden'
    };

    const elem = {
      tagName: 'something unknown',
      id: 'something-unknown',
      getAttribute (attr) { return ''; },
      parentNode: svgroot
    };
    const path = convertToPath(elem, attrs, mockaddSVGElementFromJson, mockPathActions, mockClearSelection, mockAddToSelection, mockHistory, mockAddCommandToHistory);
    assert.equal(path, null);
    assert.equal(elem.parentNode, svgroot);
    assert.equal(mockHistorySubCommands.length, 0);
    assert.equal(mockCount.clearSelection, 0);
    assert.equal(mockCount.addToSelection, 0);
    assert.equal(mockCount.addCommandToHistory, 0);
  });
});
