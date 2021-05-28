/**
 * Tools for undo.
 * @module undo
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import * as draw from './draw.js';
import * as hstry from './history.js';
import {
  getRotationAngle, getBBox as utilsGetBBox, isNullish, setHref, getStrokedBBoxDefaultVisible
} from './utilities.js';
import {
  isGecko
} from '../common/browser.js';
import {
  transformPoint, transformListToTransform
} from './math.js';
import {
  getTransformList
} from './svgtransformlist.js';

const {
  UndoManager, HistoryEventTypes
} = hstry;

let undoContext_ = null;

/**
* @function module:undo.init
* @param {module:undo.undoContext} undoContext
* @returns {void}
*/
export const init = function (undoContext) {
  undoContext_ = undoContext;
};

export const getUndoManager = function () {
  return new UndoManager({
    /**
     * @param {string} eventType One of the HistoryEvent types
     * @param {module:history.HistoryCommand} cmd Fulfills the HistoryCommand interface
     * @fires module:undo.SvgCanvas#event:changed
     * @returns {void}
     */
    handleHistoryEvent (eventType, cmd) {
      const EventTypes = HistoryEventTypes;
      // TODO: handle setBlurOffsets.
      if (eventType === EventTypes.BEFORE_UNAPPLY || eventType === EventTypes.BEFORE_APPLY) {
        undoContext_.getCanvas().clearSelection();
      } else if (eventType === EventTypes.AFTER_APPLY || eventType === EventTypes.AFTER_UNAPPLY) {
        const elems = cmd.elements();
        undoContext_.getCanvas().pathActions.clear();
        undoContext_.call('changed', elems);
        const cmdType = cmd.type();
        const isApply = (eventType === EventTypes.AFTER_APPLY);
        if (cmdType === 'MoveElementCommand') {
          const parent = isApply ? cmd.newParent : cmd.oldParent;
          if (parent === undoContext_.getSVGContent()) {
            draw.identifyLayers();
          }
        } else if (cmdType === 'InsertElementCommand' || cmdType === 'RemoveElementCommand') {
          if (cmd.parent === undoContext_.getSVGContent()) {
            draw.identifyLayers();
          }
          if (cmdType === 'InsertElementCommand') {
            if (isApply) {
              undoContext_.restoreRefElems(cmd.elem);
            }
          } else if (!isApply) {
            undoContext_.restoreRefElems(cmd.elem);
          }
          if (cmd.elem && cmd.elem.tagName === 'use') {
            undoContext_.getCanvas().setUseData(cmd.elem);
          }
        } else if (cmdType === 'ChangeElementCommand') {
          // if we are changing layer names, re-identify all layers
          if (cmd.elem.tagName === 'title' &&
            cmd.elem.parentNode.parentNode === undoContext_.getSVGContent()
          ) {
            draw.identifyLayers();
          }
          const values = isApply ? cmd.newValues : cmd.oldValues;
          // If stdDeviation was changed, update the blur.
          if (values.stdDeviation) {
            undoContext_.getCanvas().setBlurOffsets(cmd.elem.parentNode, values.stdDeviation);
          }
          // This is resolved in later versions of webkit, perhaps we should
          // have a featured detection for correct 'use' behavior?
          // ——————————
          // Remove & Re-add hack for Webkit (issue 775)
          // if (cmd.elem.tagName === 'use' && isWebkit()) {
          //  const {elem} = cmd;
          //  if (!elem.getAttribute('x') && !elem.getAttribute('y')) {
          //    const parent = elem.parentNode;
          //    const sib = elem.nextSibling;
          //    elem.remove();
          //    parent.insertBefore(elem, sib);
          //    // Ok to replace above with this? `sib.before(elem);`
          //  }
          // }
        }
      }
    }
  });
};

/**
* Hack for Firefox bugs where text element features aren't updated or get
* messed up. See issue 136 and issue 137.
* This function clones the element and re-selects it.
* @function module:svgcanvas~ffClone
* @todo Test for this bug on load and add it to "support" object instead of
* browser sniffing
* @param {Element} elem - The (text) DOM element to clone
* @returns {Element} Cloned element
*/
export const ffClone = function (elem) {
  if (!isGecko()) { return elem; }
  const clone = elem.cloneNode(true);
  elem.before(clone);
  elem.remove();
  undoContext_.getCanvas().selectorManager.releaseSelector(elem);
  undoContext_.getCanvas().setSelectedElements(0, clone);
  undoContext_.getCanvas().selectorManager.requestSelector(clone).showGrips(true);
  return clone;
};

/**
* This function makes the changes to the elements. It does not add the change
* to the history stack.
* @param {string} attr - Attribute name
* @param {string|Float} newValue - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {void}
*/
export const changeSelectedAttributeNoUndoMethod = function (attr, newValue, elems) {
  const selectedElements = undoContext_.getSelectedElements();
  const currentZoom = undoContext_.getCurrentZoom();
  if (undoContext_.getCurrentMode() === 'pathedit') {
    // Editing node
    undoContext_.getCanvas().pathActions.moveNode(attr, newValue);
  }
  elems = elems || selectedElements;
  let i = elems.length;
  const noXYElems = [ 'g', 'polyline', 'path' ];
  // const goodGAttrs = ['transform', 'opacity', 'filter'];

  while (i--) {
    let elem = elems[i];
    if (isNullish(elem)) { continue; }

    // Set x,y vals on elements that don't have them
    if ((attr === 'x' || attr === 'y') && noXYElems.includes(elem.tagName)) {
      const bbox = getStrokedBBoxDefaultVisible([ elem ]);
      const diffX = attr === 'x' ? newValue - bbox.x : 0;
      const diffY = attr === 'y' ? newValue - bbox.y : 0;
      undoContext_.getCanvas().moveSelectedElements(diffX * currentZoom, diffY * currentZoom, true);
      continue;
    }

    // only allow the transform/opacity/filter attribute to change on <g> elements, slightly hacky
    // TODO: Missing statement body
    // if (elem.tagName === 'g' && goodGAttrs.includes(attr)) {}
    let oldval = attr === '#text' ? elem.textContent : elem.getAttribute(attr);
    if (isNullish(oldval)) { oldval = ''; }
    if (oldval !== String(newValue)) {
      if (attr === '#text') {
        // const oldW = utilsGetBBox(elem).width;
        elem.textContent = newValue;

        // FF bug occurs on on rotated elements
        if ((/rotate/).test(elem.getAttribute('transform'))) {
          elem = ffClone(elem);
        }
        // Hoped to solve the issue of moving text with text-anchor="start",
        // but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
        // const box = getBBox(elem), left = box.x, top = box.y, {width, height} = box,
        //   dx = width - oldW, dy = 0;
        // const angle = getRotationAngle(elem, true);
        // if (angle) {
        //   const r = Math.sqrt(dx * dx + dy * dy);
        //   const theta = Math.atan2(dy, dx) - angle;
        //   dx = r * Math.cos(theta);
        //   dy = r * Math.sin(theta);
        //
        //   elem.setAttribute('x', elem.getAttribute('x') - dx);
        //   elem.setAttribute('y', elem.getAttribute('y') - dy);
        // }
      } else if (attr === '#href') {
        setHref(elem, newValue);
      } else if (newValue) {
        elem.setAttribute(attr, newValue);
      } else if (typeof newValue === 'number') {
        elem.setAttribute(attr, newValue);
      } else {
        elem.removeAttribute(attr);
      }

      // Go into "select" mode for text changes
      // NOTE: Important that this happens AFTER elem.setAttribute() or else attributes like
      // font-size can get reset to their old value, ultimately by svgEditor.updateContextPanel(),
      // after calling textActions.toSelectMode() below
      if (undoContext_.getCurrentMode() === 'textedit' && attr !== '#text' && elem.textContent.length) {
        undoContext_.getCanvas().textActions.toSelectMode(elem);
      }

      // if (i === 0) {
      //   selectedBBoxes[0] = utilsGetBBox(elem);
      // }

      // Use the Firefox ffClone hack for text elements with gradients or
      // where other text attributes are changed.
      if (isGecko() &&
        elem.nodeName === 'text' &&
        (/rotate/).test(elem.getAttribute('transform')) &&
        (String(newValue).startsWith('url') || ([ 'font-size', 'font-family', 'x', 'y' ].includes(attr) && elem.textContent))) {
        elem = ffClone(elem);
      }
      // Timeout needed for Opera & Firefox
      // codedread: it is now possible for this function to be called with elements
      // that are not in the selectedElements array, we need to only request a
      // selector if the element is in that array
      if (selectedElements.includes(elem)) {
        // eslint-disable-next-line no-loop-func
        setTimeout(function () {
          // Due to element replacement, this element may no longer
          // be part of the DOM
          if (!elem.parentNode) { return; }
          undoContext_.getCanvas().selectorManager.requestSelector(elem).resize();
        }, 0);
      }
      // if this element was rotated, and we changed the position of this element
      // we need to update the rotational transform attribute
      const angle = getRotationAngle(elem);
      if (angle !== 0 && attr !== 'transform') {
        const tlist = getTransformList(elem);
        let n = tlist.numberOfItems;
        while (n--) {
          const xform = tlist.getItem(n);
          if (xform.type === 4) {
            // remove old rotate
            tlist.removeItem(n);

            const box = utilsGetBBox(elem);
            const center = transformPoint(
              box.x + box.width / 2, box.y + box.height / 2, transformListToTransform(tlist).matrix
            );
            const cx = center.x;
            const cy = center.y;
            const newrot = undoContext_.getSVGRoot().createSVGTransform();
            newrot.setRotate(angle, cx, cy);
            tlist.insertItemBefore(newrot, n);
            break;
          }
        }
      }
    } // if oldValue != newValue
  } // for each elem
};

/**
* Change the given/selected element and add the original value to the history stack.
* If you want to change all `selectedElements`, ignore the `elems` argument.
* If you want to change only a subset of `selectedElements`, then send the
* subset to this function in the `elems` argument.
* @function module:svgcanvas.SvgCanvas#changeSelectedAttribute
* @param {string} attr - String with the attribute name
* @param {string|Float} val - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {void}
*/
export const changeSelectedAttributeMethod = function (attr, val, elems) {
  const selectedElements = undoContext_.getSelectedElements();
  elems = elems || selectedElements;
  undoContext_.getCanvas().undoMgr.beginUndoableChange(attr, elems);
  // const i = elems.length;

  changeSelectedAttributeNoUndoMethod(attr, val, elems);

  const batchCmd = undoContext_.getCanvas().undoMgr.finishUndoableChange();
  if (!batchCmd.isEmpty()) {
    // undoContext_.addCommandToHistory(batchCmd);
    undoContext_.getCanvas().undoMgr.addCommandToHistory(batchCmd);
  }
};
