/**
 * Tools for undo.
 * @module undo
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import * as draw from './draw.js';
import * as hstry from './history.js';

const {
  UndoManager, HistoryEventTypes
} = hstry;

let undoContext_ = null;

/**
* @function module:undo.init
* @param {module:undo.undoContext} undoContext_
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
