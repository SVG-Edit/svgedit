/**
 * @module text-actions Tools for Text edit functions
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */


import { NS } from '../common/namespaces.js';
import {
  transformPoint, getMatrix
} from './math.js';
import {
  assignAttributes, getElem, getBBox as utilsGetBBox
} from './utilities.js';
import {
  supportsGoodTextCharPos
} from '../common/browser.js';

let textActionsContext_ = null;

/**
* @function module:text-actions.init
* @param {module:text-actions.textActionsContext_} textActionsContext
* @returns {void}
*/
export const init = function (textActionsContext) {
  textActionsContext_ = textActionsContext;
};

/**
* Group: Text edit functions
* Functions relating to editing text elements.
* @namespace {PlainObject} textActions
* @memberof module:svgcanvas.SvgCanvas#
*/
export const textActionsMethod = (function () {
  let curtext;
  let textinput;
  let cursor;
  let selblock;
  let blinker;
  let chardata = [];
  let textbb; // , transbb;
  let matrix;
  let lastX; let lastY;
  let allowDbl;

  /**
*
* @param {Integer} index
* @returns {void}
*/
  function setCursor (index) {
    const empty = (textinput.value === '');
    textinput.focus();

    if (!arguments.length) {
      if (empty) {
        index = 0;
      } else {
        if (textinput.selectionEnd !== textinput.selectionStart) { return; }
        index = textinput.selectionEnd;
      }
    }

    const charbb = chardata[index];
    if (!empty) {
      textinput.setSelectionRange(index, index);
    }
    cursor = getElem('text_cursor');
    if (!cursor) {
      cursor = document.createElementNS(NS.SVG, 'line');
      assignAttributes(cursor, {
        id: 'text_cursor',
        stroke: '#333',
        'stroke-width': 1
      });
      getElem('selectorParentGroup').append(cursor);
    }

    if (!blinker) {
      blinker = setInterval(function () {
        const show = (cursor.getAttribute('display') === 'none');
        cursor.setAttribute('display', show ? 'inline' : 'none');
      }, 600);
    }

    const startPt = ptToScreen(charbb.x, textbb.y);
    const endPt = ptToScreen(charbb.x, (textbb.y + textbb.height));

    assignAttributes(cursor, {
      x1: startPt.x,
      y1: startPt.y,
      x2: endPt.x,
      y2: endPt.y,
      visibility: 'visible',
      display: 'inline'
    });

    if (selblock) { selblock.setAttribute('d', ''); }
  }

  /**
*
* @param {Integer} start
* @param {Integer} end
* @param {boolean} skipInput
* @returns {void}
*/
  function setSelection (start, end, skipInput) {
    if (start === end) {
      setCursor(end);
      return;
    }

    if (!skipInput) {
      textinput.setSelectionRange(start, end);
    }

    selblock = getElem('text_selectblock');
    if (!selblock) {
      selblock = document.createElementNS(NS.SVG, 'path');
      assignAttributes(selblock, {
        id: 'text_selectblock',
        fill: 'green',
        opacity: 0.5,
        style: 'pointer-events:none'
      });
      getElem('selectorParentGroup').append(selblock);
    }

    const startbb = chardata[start];
    const endbb = chardata[end];

    cursor.setAttribute('visibility', 'hidden');

    const tl = ptToScreen(startbb.x, textbb.y);
    const tr = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y);
    const bl = ptToScreen(startbb.x, textbb.y + textbb.height);
    const br = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y + textbb.height);

    const dstr = 'M' + tl.x + ',' + tl.y +
' L' + tr.x + ',' + tr.y +
' ' + br.x + ',' + br.y +
' ' + bl.x + ',' + bl.y + 'z';

    assignAttributes(selblock, {
      d: dstr,
      display: 'inline'
    });
  }

  /**
*
* @param {Float} mouseX
* @param {Float} mouseY
* @returns {Integer}
*/
  function getIndexFromPoint (mouseX, mouseY) {
    // Position cursor here
    const pt = textActionsContext_.getSVGRoot().createSVGPoint();
    pt.x = mouseX;
    pt.y = mouseY;

    // No content, so return 0
    if (chardata.length === 1) { return 0; }
    // Determine if cursor should be on left or right of character
    let charpos = curtext.getCharNumAtPosition(pt);
    if (charpos < 0) {
      // Out of text range, look at mouse coords
      charpos = chardata.length - 2;
      if (mouseX <= chardata[0].x) {
        charpos = 0;
      }
    } else if (charpos >= chardata.length - 2) {
      charpos = chardata.length - 2;
    }
    const charbb = chardata[charpos];
    const mid = charbb.x + (charbb.width / 2);
    if (mouseX > mid) {
      charpos++;
    }
    return charpos;
  }

  /**
*
* @param {Float} mouseX
* @param {Float} mouseY
* @returns {void}
*/
  function setCursorFromPoint (mouseX, mouseY) {
    setCursor(getIndexFromPoint(mouseX, mouseY));
  }

  /**
*
* @param {Float} x
* @param {Float} y
* @param {boolean} apply
* @returns {void}
*/
  function setEndSelectionFromPoint (x, y, apply) {
    const i1 = textinput.selectionStart;
    const i2 = getIndexFromPoint(x, y);

    const start = Math.min(i1, i2);
    const end = Math.max(i1, i2);
    setSelection(start, end, !apply);
  }

  /**
*
* @param {Float} xIn
* @param {Float} yIn
* @returns {module:math.XYObject}
*/
  function screenToPt (xIn, yIn) {
    const out = {
      x: xIn,
      y: yIn
    };
    const currentZoom = textActionsContext_.getCurrentZoom();
    out.x /= currentZoom;
    out.y /= currentZoom;

    if (matrix) {
      const pt = transformPoint(out.x, out.y, matrix.inverse());
      out.x = pt.x;
      out.y = pt.y;
    }

    return out;
  }

  /**
*
* @param {Float} xIn
* @param {Float} yIn
* @returns {module:math.XYObject}
*/
  function ptToScreen (xIn, yIn) {
    const out = {
      x: xIn,
      y: yIn
    };

    if (matrix) {
      const pt = transformPoint(out.x, out.y, matrix);
      out.x = pt.x;
      out.y = pt.y;
    }
    const currentZoom = textActionsContext_.getCurrentZoom();
    out.x *= currentZoom;
    out.y *= currentZoom;

    return out;
  }

  /**
*
* @param {Event} evt
* @returns {void}
*/
  function selectAll (evt) {
    setSelection(0, curtext.textContent.length);
    evt.target.removeEventListener('click', selectAll);
  }

  /**
*
* @param {Event} evt
* @returns {void}
*/
  function selectWord (evt) {
    if (!allowDbl || !curtext) { return; }
    const currentZoom = textActionsContext_.getCurrentZoom();
    const ept = transformPoint(evt.pageX, evt.pageY, textActionsContext_.getrootSctm());
    const mouseX = ept.x * currentZoom;
    const mouseY = ept.y * currentZoom;
    const pt = screenToPt(mouseX, mouseY);

    const index = getIndexFromPoint(pt.x, pt.y);
    const str = curtext.textContent;
    const first = str.substr(0, index).replace(/[a-z\d]+$/i, '').length;
    const m = str.substr(index).match(/^[a-z\d]+/i);
    const last = (m ? m[0].length : 0) + index;
    setSelection(first, last);

    // Set tripleclick
    evt.target.addEventListener('click', selectAll);

    setTimeout(function () {
      evt.target.removeEventListener('click', selectAll);
    }, 300);
  }

  return /** @lends module:svgcanvas.SvgCanvas#textActions */ {
    /**
* @param {Element} target
* @param {Float} x
* @param {Float} y
* @returns {void}
*/
    select (target, x, y) {
      curtext = target;
      textActionsContext_.getCanvas().textActions.toEditMode(x, y);
    },
    /**
* @param {Element} elem
* @returns {void}
*/
    start (elem) {
      curtext = elem;
      textActionsContext_.getCanvas().textActions.toEditMode();
    },
    /**
* @param {external:MouseEvent} evt
* @param {Element} mouseTarget
* @param {Float} startX
* @param {Float} startY
* @returns {void}
*/
    mouseDown (evt, mouseTarget, startX, startY) {
      const pt = screenToPt(startX, startY);

      textinput.focus();
      setCursorFromPoint(pt.x, pt.y);
      lastX = startX;
      lastY = startY;

      // TODO: Find way to block native selection
    },
    /**
* @param {Float} mouseX
* @param {Float} mouseY
* @returns {void}
*/
    mouseMove (mouseX, mouseY) {
      const pt = screenToPt(mouseX, mouseY);
      setEndSelectionFromPoint(pt.x, pt.y);
    },
    /**
* @param {external:MouseEvent} evt
* @param {Float} mouseX
* @param {Float} mouseY
* @returns {void}
*/
    mouseUp (evt, mouseX, mouseY) {
      const pt = screenToPt(mouseX, mouseY);

      setEndSelectionFromPoint(pt.x, pt.y, true);

      // TODO: Find a way to make this work: Use transformed BBox instead of evt.target
      // if (lastX === mouseX && lastY === mouseY
      //   && !rectsIntersect(transbb, {x: pt.x, y: pt.y, width: 0, height: 0})) {
      //   textActionsContext_.getCanvas().textActions.toSelectMode(true);
      // }

      if (
        evt.target !== curtext &&
  mouseX < lastX + 2 &&
  mouseX > lastX - 2 &&
  mouseY < lastY + 2 &&
  mouseY > lastY - 2
      ) {
        textActionsContext_.getCanvas().textActions.toSelectMode(true);
      }
    },
    /**
* @function
* @param {Integer} index
* @returns {void}
*/
    setCursor,
    /**
* @param {Float} x
* @param {Float} y
* @returns {void}
*/
    toEditMode (x, y) {
      allowDbl = false;
      textActionsContext_.setCurrentMode('textedit');
      textActionsContext_.getCanvas().selectorManager.requestSelector(curtext).showGrips(false);
      // Make selector group accept clicks
      /* const selector = */ textActionsContext_.getCanvas().selectorManager.requestSelector(curtext); // Do we need this? Has side effect of setting lock, so keeping for now, but next line wasn't being used
      // const sel = selector.selectorRect;

      textActionsContext_.getCanvas().textActions.init();

      curtext.style.cursor = 'text';

      // if (supportsEditableText()) {
      //   curtext.setAttribute('editable', 'simple');
      //   return;
      // }

      if (!arguments.length) {
        setCursor();
      } else {
        const pt = screenToPt(x, y);
        setCursorFromPoint(pt.x, pt.y);
      }

      setTimeout(function () {
        allowDbl = true;
      }, 300);
    },
    /**
* @param {boolean|Element} selectElem
* @fires module:svgcanvas.SvgCanvas#event:selected
* @returns {void}
*/
    toSelectMode (selectElem) {
      textActionsContext_.setCurrentMode('select');
      clearInterval(blinker);
      blinker = null;
      if (selblock) { selblock.setAttribute('display', 'none'); }
      if (cursor) { cursor.setAttribute('visibility', 'hidden'); }
      curtext.style.cursor = 'move';

      if (selectElem) {
        textActionsContext_.getCanvas().clearSelection();
        curtext.style.cursor = 'move';

        textActionsContext_.call('selected', [ curtext ]);
        textActionsContext_.getCanvas().addToSelection([ curtext ], true);
      }
      if (curtext && !curtext.textContent.length) {
        // No content, so delete
        textActionsContext_.getCanvas().deleteSelectedElements();
      }

      textinput.blur();

      curtext = false;

      // if (supportsEditableText()) {
      //   curtext.removeAttribute('editable');
      // }
    },
    /**
* @param {Element} elem
* @returns {void}
*/
    setInputElem (elem) {
      textinput = elem;
    },
    /**
* @returns {void}
*/
    clear () {
      if (textActionsContext_.getCurrentMode() === 'textedit') {
        textActionsContext_.getCanvas().textActions.toSelectMode();
      }
    },
    /**
* @param {Element} _inputElem Not in use
* @returns {void}
*/
    init (_inputElem) {
      if (!curtext) { return; }
      let i; let end;
      // if (supportsEditableText()) {
      //   curtext.select();
      //   return;
      // }

      if (!curtext.parentNode) {
        // Result of the ffClone, need to get correct element
        const selectedElements = textActionsContext_.getSelectedElements();
        curtext = selectedElements[0];
        textActionsContext_.getCanvas().selectorManager.requestSelector(curtext).showGrips(false);
      }

      const str = curtext.textContent;
      const len = str.length;

      const xform = curtext.getAttribute('transform');

      textbb = utilsGetBBox(curtext);

      matrix = xform ? getMatrix(curtext) : null;

      chardata = [];
      chardata.length = len;
      textinput.focus();

      curtext.removeEventListener("dblclick", selectWord);
      curtext.addEventListener("dblclick", selectWord);

      if (!len) {
        end = { x: textbb.x + (textbb.width / 2), width: 0 };
      }

      for (i = 0; i < len; i++) {
        const start = curtext.getStartPositionOfChar(i);
        end = curtext.getEndPositionOfChar(i);

        if (!supportsGoodTextCharPos()) {
          const currentZoom = textActionsContext_.getCurrentZoom();
          const offset = textActionsContext_.getCanvas().contentW * currentZoom;
          start.x -= offset;
          end.x -= offset;

          start.x /= currentZoom;
          end.x /= currentZoom;
        }

        // Get a "bbox" equivalent for each character. Uses the
        // bbox data of the actual text for y, height purposes

        // TODO: Decide if y, width and height are actually necessary
        chardata[i] = {
          x: start.x,
          y: textbb.y, // start.y?
          width: end.x - start.x,
          height: textbb.height
        };
      }

      // Add a last bbox for cursor at end of text
      chardata.push({
        x: end.x,
        width: 0
      });
      setSelection(textinput.selectionStart, textinput.selectionEnd, true);
    }
  };
}());
