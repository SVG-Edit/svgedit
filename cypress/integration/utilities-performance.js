import '../../instrumented/jquery.min.js';

import '../../instrumented/svgpathseg.js';
import {NS} from '../../instrumented/namespaces.js';
import * as utilities from '../../instrumented/utilities.js';
import * as transformlist from '../../instrumented/svgtransformlist.js';
import * as math from '../../instrumented/math.js';

describe('utilities performance', function () {
  let currentLayer, groupWithMatrixTransform, textWithMatrixTransform;
  beforeEach(() => {
    document.body.textContent = '';
    const style = document.createElement('style');
    style.id = 'styleoverrides';
    style.media = 'screen';
    style.textContent = `
    #svgcanvas svg * {
      cursor: move;
      pointer-events: all
    }
    #svgcanvas svg {
      cursor: default
    }`;

    document.head.append(style);

    const editor = new DOMParser().parseFromString(`<div id="svg_editor">
      <div id="workarea" style="cursor: auto; overflow: scroll; line-height: 12px; right: 100px;">

        <!-- Must include this thumbnail view to see some of the performance issues -->
        <svg id="overviewMiniView" width="150" height="112.5" x="0" y="0" viewBox="100 100 1000 1000" style="float: right;"
             xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <use x="0" y="0" xlink:href="#svgroot"></use>
        </svg>


        <div id="svgcanvas" style="position: relative; width: 1000px; height: 1000px;">
          <svg id="svgroot" xmlns="http://www.w3.org/2000/svg" xlinkns="http://www.w3.org/1999/xlink" width="1000" height="1000" x="640" y="480" overflow="visible">
            <defs><filter id="canvashadow" filterUnits="objectBoundingBox"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"></feGaussianBlur><feOffset in="blur" dx="5" dy="5" result="offsetBlur"></feOffset><feMerge><feMergeNode in="offsetBlur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><pattern id="gridpattern" patternUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><image x="0" y="0" width="100" height="100"></image></pattern></defs>
            <svg id="canvasBackground" width="1000" height="200" x="10" y="10" overflow="none" style="pointer-events:none"><rect width="100%" height="100%" x="0" y="0" stroke="#000" fill="#000" style="pointer-events:none"></rect><svg id="canvasGrid" width="100%" height="100%" x="0" y="0" overflow="visible" display="none" style="display: inline;"><rect width="100%" height="100%" x="0" y="0" stroke-width="0" stroke="none" fill="url(#gridpattern)" style="pointer-events: none; display:visible;"></rect></svg></svg>
            <animate attributeName="opacity" begin="indefinite" dur="1" fill="freeze"></animate>

            <svg id="svgcontent" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 480" overflow="visible" width="1000" height="200" x="100" y="20">

              <g id="layer1">
                <title>Layer 1</title>

                <g id="svg_group_with_matrix_transform" transform="matrix(0.5, 0, 0, 0.5, 10, 10)">
                  <svg id="svg_2" x="100" y="0" class="symbol" preserveAspectRatio="xMaxYMax">
                    <g id="svg_3">
                      <rect id="svg_4" x="0" y="0" width="20" height="20" fill="#00FF00"></rect>
                    </g>
                    <g id="svg_5" display="none">
                      <rect id="svg_6" x="0" y="0" width="20" height="20" fill="#A40000"></rect>
                    </g>
                  </svg>
                </g>
                <text id="svg_text_with_matrix_transform" transform="matrix(0.433735, 0, 0, 0.433735, 2, 4)" xml:space="preserve" text-anchor="middle" font-family="serif" font-size="24" y="0" x="61" stroke="#999999" fill="#999999">Some text</text>

              </g>
              <g>
                <title>Layer 2</title>
              </g>

            </svg>
          </svg>
        </div>
      </div></div>`, 'application/xml');
    const newNode = document.body.ownerDocument.importNode(editor.documentElement, true);
    document.body.append(newNode);

    currentLayer = document.getElementById('layer1');
    groupWithMatrixTransform = document.getElementById('svg_group_with_matrix_transform');
    textWithMatrixTransform = document.getElementById('svg_text_with_matrix_transform');
  });

  /**
   * Create an SVG element for a mock.
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
   * Mock of {@link module:utilities.EditorContext#addSVGElementFromJson}.
   * @param {module:utilities.SVGElementJSON} json
   * @returns {SVGElement}
   */
  function mockaddSVGElementFromJson (json) {
    const elem = mockCreateSVGElement(json);
    currentLayer.append(elem);
    return elem;
  }

  /**
   * Toward performance testing, fill document with clones of element.
   * @param {SVGElement} elem
   * @param {Integer} count
   * @returns {void}
   */
  function fillDocumentByCloningElement (elem, count) {
    const elemId = elem.getAttribute('id') + '-';
    for (let index = 0; index < count; index++) {
      const clone = elem.cloneNode(true); // t: deep clone
      // Make sure you set a unique ID like a real document.
      clone.setAttribute('id', elemId + index);
      const {parentNode} = elem;
      parentNode.append(clone);
    }
  }

  const mockPathActions = {
    resetOrientation (path) {
      if (utilities.isNullish(path) || path.nodeName !== 'path') { return false; }
      const tlist = transformlist.getTransformList(path);
      const m = math.transformListToTransform(tlist).matrix;
      tlist.clear();
      path.removeAttribute('transform');
      const segList = path.pathSegList;

      const len = segList.numberOfItems;
      // let lastX, lastY;

      for (let i = 0; i < len; ++i) {
        const seg = segList.getItem(i);
        const type = seg.pathSegType;
        if (type === 1) {
          continue;
        }
        const pts = [];
        ['', 1, 2].forEach(function (n, j) {
          const x = seg['x' + n],
            y = seg['y' + n];
          if (x !== undefined && y !== undefined) {
            const pt = math.transformPoint(x, y, m);
            pts.splice(pts.length, 0, pt.x, pt.y);
          }
        });
        // path.replacePathSeg(type, i, pts, path);
      }

      // utilities.reorientGrads(path, m);
      return undefined;
    }
  };

  // //////////////////////////////////////////////////////////
  // Performance times with various browsers on Macbook 2011 8MB RAM OS X El Capitan 10.11.4
  //
  // To see 'Before Optimization' performance, making the following two edits.
  // 1. utilities.getStrokedBBox - change if( elems.length === 1) to if( false && elems.length === 1)
  // 2. utilities.getBBoxWithTransform - uncomment 'Old technique that was very slow'

  // Chrome
  // Before Optimization
  //   Pass1 svgCanvas.getStrokedBBox total ms 4,218, ave ms 41.0,   min/max 37 51
  //   Pass2 svgCanvas.getStrokedBBox total ms 4,458, ave ms 43.3,   min/max 32 63
  // Optimized Code
  //   Pass1 svgCanvas.getStrokedBBox total ms 1,112, ave ms 10.8,   min/max 9 20
  //   Pass2 svgCanvas.getStrokedBBox total ms    34, ave ms  0.3,   min/max 0 20

  // Firefox
  // Before Optimization
  //   Pass1 svgCanvas.getStrokedBBox total ms 3,794, ave ms 36.8,   min/max 33 48
  //   Pass2 svgCanvas.getStrokedBBox total ms 4,049, ave ms 39.3,   min/max 28 53
  // Optimized Code
  //   Pass1 svgCanvas.getStrokedBBox total ms   104, ave ms 1.0,   min/max 0 23
  //   Pass2 svgCanvas.getStrokedBBox total ms    71, ave ms 0.7,   min/max 0 23

  // Safari
  // Before Optimization
  //   Pass1 svgCanvas.getStrokedBBox total ms 4,840, ave ms 47.0,   min/max 45 62
  //   Pass2 svgCanvas.getStrokedBBox total ms 4,849, ave ms 47.1,   min/max 34 62
  // Optimized Code
  //   Pass1 svgCanvas.getStrokedBBox total ms    42, ave ms 0.4,   min/max 0 23
  //   Pass2 svgCanvas.getStrokedBBox total ms    17, ave ms 0.2,   min/max 0 23

  it('Test svgCanvas.getStrokedBBox() performance with matrix transforms', function () {
    const {getStrokedBBox} = utilities;
    const {children} = currentLayer;

    let lastTime, now,
      min = Number.MAX_VALUE,
      max = 0,
      total = 0;

    fillDocumentByCloningElement(groupWithMatrixTransform, 50);
    fillDocumentByCloningElement(textWithMatrixTransform, 50);

    // The first pass through all elements is slower.
    const count = children.length;
    const start = lastTime = now = Date.now();
    // Skip the first child which is the title.
    for (let index = 1; index < count; index++) {
      const child = children[index];
      /* const obj = */ getStrokedBBox([child], mockaddSVGElementFromJson, mockPathActions);
      now = Date.now(); const delta = now - lastTime; lastTime = now;
      total += delta;
      min = Math.min(min, delta);
      max = Math.max(max, delta);
    }
    total = lastTime - start;
    const ave = total / count;
    assert.ok(ave < 20, 'svgedit.utilities.getStrokedBBox average execution time is less than 20 ms');
    console.log('Pass1 svgCanvas.getStrokedBBox total ms ' + total + ', ave ms ' + ave.toFixed(1) + ',\t min/max ' + min + ' ' + max);

    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve) => {
      // The second pass is two to ten times faster.
      setTimeout(function () {
        const ct = children.length;

        const strt = lastTime = now = Date.now();
        // Skip the first child which is the title.
        for (let index = 1; index < ct; index++) {
          const child = children[index];
          /* const obj = */ getStrokedBBox([child], mockaddSVGElementFromJson, mockPathActions);
          now = Date.now(); const delta = now - lastTime; lastTime = now;
          total += delta;
          min = Math.min(min, delta);
          max = Math.max(max, delta);
        }

        total = lastTime - strt;
        const avg = total / ct;
        assert.ok(avg < 2, 'svgedit.utilities.getStrokedBBox average execution time is less than 1 ms');
        console.log('Pass2 svgCanvas.getStrokedBBox total ms ' + total + ', ave ms ' + avg.toFixed(1) + ',\t min/max ' + min + ' ' + max);

        resolve();
      });
    });
  });
});
