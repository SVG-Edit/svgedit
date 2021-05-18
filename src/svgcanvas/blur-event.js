/**
 * Tools for blur event.
 * @module blur
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import * as hstry from './history.js';

const {
  InsertElementCommand, ChangeElementCommand, BatchCommand
} = hstry;

let blurContext_ = null;

/**
* @function module:blur.init
* @param {module:blur.blurContext} blurContext
* @returns {void}
*/
export const init = function (blurContext) {
  blurContext_ = blurContext;
};

/**
* Sets the `stdDeviation` blur value on the selected element without being undoable.
* @function module:svgcanvas.SvgCanvas#setBlurNoUndo
* @param {Float} val - The new `stdDeviation` value
* @returns {void}
*/
export const setBlurNoUndo = function (val) {
  const selectedElements = blurContext_.getSelectedElements();
  if (!blurContext_.getFilter()) {
    blurContext_.getCanvas().setBlur(val);
    return;
  }
  if (val === 0) {
    // Don't change the StdDev, as that will hide the element.
    // Instead, just remove the value for "filter"
    blurContext_.changeSelectedAttributeNoUndoMethod('filter', '');
    blurContext_.setFilterHidden(true);
  } else {
    const elem = selectedElements[0];
    if (blurContext_.getFilterHidden()) {
      blurContext_.changeSelectedAttributeNoUndoMethod('filter', 'url(#' + elem.id + '_blur)');
    }
    if (blurContext_.isWebkit()) {
      // console.log('e', elem);
      elem.removeAttribute('filter');
      elem.setAttribute('filter', 'url(#' + elem.id + '_blur)');
    }
    const filter = blurContext_.getFilter();
    blurContext_.changeSelectedAttributeNoUndoMethod('stdDeviation', val, [ filter.firstChild ]);
    blurContext_.getCanvas().setBlurOffsets(filter, val);
  }
};

/**
*
* @returns {void}
*/
function finishChange () {
  const bCmd = blurContext_.getCanvas().undoMgr.finishUndoableChange();
  blurContext_.getCurCommand().addSubCommand(bCmd);
  blurContext_.addCommandToHistory(blurContext_.getCurCommand());
  blurContext_.setCurCommand(null);
  blurContext_.setFilter(null);
}

/**
* Sets the `x`, `y`, `width`, `height` values of the filter element in order to
* make the blur not be clipped. Removes them if not neeeded.
* @function module:svgcanvas.SvgCanvas#setBlurOffsets
* @param {Element} filterElem - The filter DOM element to update
* @param {Float} stdDev - The standard deviation value on which to base the offset size
* @returns {void}
*/
export const setBlurOffsets = function (filterElem, stdDev) {
  if (stdDev > 3) {
    // TODO: Create algorithm here where size is based on expected blur
    blurContext_.getCanvas().assignAttributes(filterElem, {
      x: '-50%',
      y: '-50%',
      width: '200%',
      height: '200%'
    }, 100);
    // Removing these attributes hides text in Chrome (see Issue 579)
  } else if (!blurContext_.isWebkit()) {
    filterElem.removeAttribute('x');
    filterElem.removeAttribute('y');
    filterElem.removeAttribute('width');
    filterElem.removeAttribute('height');
  }
};

/**
* Adds/updates the blur filter to the selected element.
* @function module:svgcanvas.SvgCanvas#setBlur
* @param {Float} val - Float with the new `stdDeviation` blur value
* @param {boolean} complete - Whether or not the action should be completed (to add to the undo manager)
* @returns {void}
*/
export const setBlur = function (val, complete) {
  const selectedElements = blurContext_.getSelectedElements();
  if (blurContext_.getCurCommand()) {
    finishChange();
    return;
  }

  // Looks for associated blur, creates one if not found
  const elem = selectedElements[0];
  const elemId = elem.id;
  blurContext_.setFilter(blurContext_.getCanvas().getElem(elemId + '_blur'));

  val -= 0;

  const batchCmd = new BatchCommand();

  // Blur found!
  if (blurContext_.getFilter()) {
    if (val === 0) {
      blurContext_.setFilter(null);
    }
  } else {
    // Not found, so create
    const newblur = blurContext_.getCanvas().addSVGElementFromJson({ element: 'feGaussianBlur',
      attr: {
        in: 'SourceGraphic',
        stdDeviation: val
      }
    });

    blurContext_.setFilter(blurContext_.getCanvas().addSVGElementFromJson({ element: 'filter',
      attr: {
        id: elemId + '_blur'
      }
    }));
    blurContext_.getFilter().append(newblur);
    blurContext_.getCanvas().findDefs().append(blurContext_.getFilter());

    batchCmd.addSubCommand(new InsertElementCommand(blurContext_.getFilter()));
  }

  const changes = { filter: elem.getAttribute('filter') };

  if (val === 0) {
    elem.removeAttribute('filter');
    batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
    return;
  }

  blurContext_.changeSelectedAttributeMethod('filter', 'url(#' + elemId + '_blur)');
  batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
  blurContext_.getCanvas().setBlurOffsets(blurContext_.getFilter(), val);
  const filter = blurContext_.getFilter();
  blurContext_.setCurCommand(batchCmd);
  blurContext_.getCanvas().undoMgr.beginUndoableChange('stdDeviation', [ filter ? filter.firstChild : null ]);
  if (complete) {
    blurContext_.getCanvas().setBlurNoUndo(val);
    finishChange();
  }
};
