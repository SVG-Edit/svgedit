/**
 * get and set methods.
 * @module elem-get-set
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import * as hstry from './history.js';
import jQueryPluginSVG from '../common/jQuery.attr.js';
import {NS} from '../common/namespaces.js';
import {
  getVisibleElements, getStrokedBBoxDefaultVisible, findDefs,
  walkTree
} from '../common/utilities.js';
import {
  convertToNum
} from '../common/units.js';

let $ = jQueryPluginSVG(jQuery);

const {
  InsertElementCommand, RemoveElementCommand,
  ChangeElementCommand, BatchCommand
} = hstry;

let elemContext_ = null;

/**
* @function module:elem-get-set.init
* @param {module:elem-get-set.elemContext} elemContext_
* @returns {void}
*/
export const init = function (elemContext) {
  elemContext_ = elemContext;
};

/**
* @function module:elem-get-set.SvgCanvas#getResolution
* @returns {DimensionsAndZoom} The current dimensions and zoom level in an object
*/
export const getResolutionMethod = function () {
  const currentZoom = elemContext_.getCurrentZoom();
  const w = elemContext_.getSVGContent().getAttribute('width') / currentZoom;
  const h = elemContext_.getSVGContent().getAttribute('height') / currentZoom;

  return {
    w,
    h,
    zoom: currentZoom
  };
};

/**
* @function module:elem-get-set.SvgCanvas#getTitle
* @param {Element} [elem]
* @returns {string|void} the current group/SVG's title contents or
* `undefined` if no element is passed nd there are no selected elements.
*/
export const getTitleMethod = function (elem) {
  const selectedElements = elemContext_.getSelectedElements();
  elem = elem || selectedElements[0];
  if (!elem) { return undefined; }
  elem = $(elem).data('gsvg') || $(elem).data('symbol') || elem;
  const childs = elem.childNodes;
  for (const child of childs) {
    if (child.nodeName === 'title') {
      return child.textContent;
    }
  }
  return '';
};

/**
* Sets the group/SVG's title content.
* @function module:elem-get-set.SvgCanvas#setGroupTitle
* @param {string} val
* @todo Combine this with `setDocumentTitle`
* @returns {void}
*/
export const setGroupTitleMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  let elem = selectedElements[0];
  elem = $(elem).data('gsvg') || elem;

  const ts = $(elem).children('title');

  const batchCmd = new BatchCommand('Set Label');

  let title;
  if (!val.length) {
    // Remove title element
    const tsNextSibling = ts.nextSibling;
    batchCmd.addSubCommand(new RemoveElementCommand(ts[0], tsNextSibling, elem));
    ts.remove();
  } else if (ts.length) {
    // Change title contents
    title = ts[0];
    batchCmd.addSubCommand(new ChangeElementCommand(title, {'#text': title.textContent}));
    title.textContent = val;
  } else {
    // Add title element
    title = elemContext_.getDOMDocument().createElementNS(NS.SVG, 'title');
    title.textContent = val;
    $(elem).prepend(title);
    batchCmd.addSubCommand(new InsertElementCommand(title));
  }

  elemContext_.addCommandToHistory(batchCmd);
};

/**
* Adds/updates a title element for the document with the given name.
* This is an undoable action.
* @function module:elem-get-set.SvgCanvas#setDocumentTitle
* @param {string} newTitle - String with the new title
* @returns {void}
*/
export const setDocumentTitleMethod = function (newTitle) {
  const childs = elemContext_.getSVGContent().childNodes;
  let docTitle = false, oldTitle = '';

  const batchCmd = new BatchCommand('Change Image Title');

  for (const child of childs) {
    if (child.nodeName === 'title') {
      docTitle = child;
      oldTitle = docTitle.textContent;
      break;
    }
  }
  if (!docTitle) {
    docTitle = elemContext_.getDOMDocument().createElementNS(NS.SVG, 'title');
    elemContext_.getSVGContent().insertBefore(docTitle, elemContext_.getSVGContent().firstChild);
    // svgcontent.firstChild.before(docTitle); // Ok to replace above with this?
  }

  if (newTitle.length) {
    docTitle.textContent = newTitle;
  } else {
    // No title given, so element is not necessary
    docTitle.remove();
  }
  batchCmd.addSubCommand(new ChangeElementCommand(docTitle, {'#text': oldTitle}));
  elemContext_.addCommandToHistory(batchCmd);
};

/**
* Changes the document's dimensions to the given size.
* @function module:elem-get-set.SvgCanvas#setResolution
* @param {Float|"fit"} x - Number with the width of the new dimensions in user units.
* Can also be the string "fit" to indicate "fit to content".
* @param {Float} y - Number with the height of the new dimensions in user units.
* @fires module:elem-get-set.SvgCanvas#event:changed
* @returns {boolean} Indicates if resolution change was successful.
* It will fail on "fit to content" option with no content to fit to.
*/
export const setResolutionMethod = function (x, y) {
  const currentZoom = elemContext_.getCurrentZoom();
  const res = elemContext_.getCanvas().getResolution();
  const {w, h} = res;
  let batchCmd;

  if (x === 'fit') {
    // Get bounding box
    const bbox = getStrokedBBoxDefaultVisible();

    if (bbox) {
      batchCmd = new BatchCommand('Fit Canvas to Content');
      const visEls = getVisibleElements();
      elemContext_.getCanvas().addToSelection(visEls);
      const dx = [], dy = [];
      $.each(visEls, function (i, item) {
        dx.push(bbox.x * -1);
        dy.push(bbox.y * -1);
      });

      const cmd = elemContext_.getCanvas().moveSelectedElements(dx, dy, true);
      batchCmd.addSubCommand(cmd);
      elemContext_.getCanvas().clearSelection();

      x = Math.round(bbox.width);
      y = Math.round(bbox.height);
    } else {
      return false;
    }
  }
  if (x !== w || y !== h) {
    if (!batchCmd) {
      batchCmd = new BatchCommand('Change Image Dimensions');
    }

    x = convertToNum('width', x);
    y = convertToNum('height', y);

    elemContext_.getSVGContent().setAttribute('width', x);
    elemContext_.getSVGContent().setAttribute('height', y);

    this.contentW = x;
    this.contentH = y;
    batchCmd.addSubCommand(new ChangeElementCommand(elemContext_.getSVGContent(), {width: w, height: h}));

    elemContext_.getSVGContent().setAttribute('viewBox', [0, 0, x / currentZoom, y / currentZoom].join(' '));
    batchCmd.addSubCommand(new ChangeElementCommand(elemContext_.getSVGContent(), {viewBox: ['0 0', w, h].join(' ')}));

    elemContext_.addCommandToHistory(batchCmd);
    elemContext_.call('changed', [elemContext_.getSVGContent()]);
  }
  return true;
};

/**
* Returns the editor's namespace URL, optionally adding it to the root element.
* @function module:elem-get-set.SvgCanvas#getEditorNS
* @param {boolean} [add] - Indicates whether or not to add the namespace value
* @returns {string} The editor's namespace URL
*/
export const getEditorNSMethod = function (add) {
  if (add) {
    elemContext_.getSVGContent().setAttribute('xmlns:se', NS.SE);
  }
  return NS.SE;
};

/**
 * @typedef {PlainObject} module:elem-get-set.ZoomAndBBox
 * @property {Float} zoom
 * @property {module:utilities.BBoxObject} bbox
 */
/**
* Sets the zoom level on the canvas-side based on the given value.
* @function module:elem-get-set.SvgCanvas#setBBoxZoom
* @param {"selection"|"canvas"|"content"|"layer"|module:SVGEditor.BBoxObjectWithFactor} val - Bounding box object to zoom to or string indicating zoom option. Note: the object value type is defined in `svg-editor.js`
* @param {Integer} editorW - The editor's workarea box's width
* @param {Integer} editorH - The editor's workarea box's height
* @returns {module:elem-get-set.ZoomAndBBox|void}
*/
export const setBBoxZoomMethod = function (val, editorW, editorH) {
  const currentZoom = elemContext_.getCurrentZoom();
  const selectedElements = elemContext_.getSelectedElements();
  let spacer = 0.85;
  let bb;
  const calcZoom = function (bb) { // eslint-disable-line no-shadow
    if (!bb) { return false; }
    const wZoom = Math.round((editorW / bb.width) * 100 * spacer) / 100;
    const hZoom = Math.round((editorH / bb.height) * 100 * spacer) / 100;
    const zoom = Math.min(wZoom, hZoom);
    elemContext_.getCanvas().setZoom(zoom);
    return {zoom, bbox: bb};
  };

  if (typeof val === 'object') {
    bb = val;
    if (bb.width === 0 || bb.height === 0) {
      const newzoom = bb.zoom ? bb.zoom : currentZoom * bb.factor;
      elemContext_.getCanvas().setZoom(newzoom);
      return {zoom: currentZoom, bbox: bb};
    }
    return calcZoom(bb);
  }

  switch (val) {
  case 'selection': {
    if (!selectedElements[0]) { return undefined; }
    const selectedElems = $.map(selectedElements, function (n) {
      if (n) {
        return n;
      }
      return undefined;
    });
    bb = getStrokedBBoxDefaultVisible(selectedElems);
    break;
  } case 'canvas': {
    const res = elemContext_.getCanvas().getResolution();
    spacer = 0.95;
    bb = {width: res.w, height: res.h, x: 0, y: 0};
    break;
  } case 'content':
    bb = getStrokedBBoxDefaultVisible();
    break;
  case 'layer':
    bb = getStrokedBBoxDefaultVisible(getVisibleElements(elemContext_.getCanvas().getCurrentDrawing().getCurrentLayer()));
    break;
  default:
    return undefined;
  }
  return calcZoom(bb);
};

/**
* Sets the zoom to the given level.
* @function module:elem-get-set.SvgCanvas#setZoom
* @param {Float} zoomLevel - Float indicating the zoom level to change to
* @fires module:elem-get-set.SvgCanvas#event:ext_zoomChanged
* @returns {void}
*/
export const setZoomMethod = function (zoomLevel) {
  const selectedElements = elemContext_.getSelectedElements();
  const res = elemContext_.getCanvas().getResolution();
  elemContext_.getSVGContent().setAttribute('viewBox', '0 0 ' + res.w / zoomLevel + ' ' + res.h / zoomLevel);
  elemContext_.setCurrentZoom(zoomLevel);
  $.each(selectedElements, function (i, elem) {
    if (!elem) { return; }
    elemContext_.getCanvas().selectorManager.requestSelector(elem).resize();
  });
  elemContext_.getCanvas().pathActions.zoomChange();
  elemContext_.getCanvas().runExtensions('zoomChanged', zoomLevel);
};

/**
* Change the current stroke/fill color/gradient value.
* @function module:elem-get-set.SvgCanvas#setColor
* @param {string} type - String indicating fill or stroke
* @param {string} val - The value to set the stroke attribute to
* @param {boolean} preventUndo - Boolean indicating whether or not this should be an undoable option
* @fires module:elem-get-set.SvgCanvas#event:changed
* @returns {void}
*/
export const setColorMethod = function (type, val, preventUndo) {
  const selectedElements = elemContext_.getSelectedElements();
  elemContext_.setCurShape(type, val);
  elemContext_.setCurProperties(type + '_paint', {type: 'solidColor'});
  const elems = [];
  /**
*
* @param {Element} e
* @returns {void}
*/
  function addNonG (e) {
    if (e.nodeName !== 'g') {
      elems.push(e);
    }
  }
  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    if (elem) {
      if (elem.tagName === 'g') {
        walkTree(elem, addNonG);
      } else if (type === 'fill') {
        if (elem.tagName !== 'polyline' && elem.tagName !== 'line') {
          elems.push(elem);
        }
      } else {
        elems.push(elem);
      }
    }
  }
  if (elems.length > 0) {
    if (!preventUndo) {
      elemContext_.getCanvas().changeSelectedAttribute(type, val, elems);
      elemContext_.call('changed', elems);
    } else {
      elemContext_.changeSelectedAttributeNoUndoMethod(type, val, elems);
    }
  }
};

/**
* Apply the current gradient to selected element's fill or stroke.
* @function module:elem-get-set.SvgCanvas#setGradient
* @param {"fill"|"stroke"} type - String indicating "fill" or "stroke" to apply to an element
* @returns {void}
*/
export const setGradientMethod = function (type) {
  if (!elemContext_.getCurProperties(type + '_paint') || elemContext_.getCurProperties(type + '_paint').type === 'solidColor') { return; }
  const canvas = elemContext_.getCanvas();
  let grad = canvas[type + 'Grad'];
  // find out if there is a duplicate gradient already in the defs
  const duplicateGrad = findDuplicateGradient(grad);
  const defs = findDefs();
  // no duplicate found, so import gradient into defs
  if (!duplicateGrad) {
    // const origGrad = grad;
    grad = defs.appendChild(elemContext_.getDOMDocument().importNode(grad, true));
    // get next id and set it on the grad
    grad.id = elemContext_.getCanvas().getNextId();
  } else { // use existing gradient
    grad = duplicateGrad;
  }
  elemContext_.getCanvas().setColor(type, 'url(#' + grad.id + ')');
};

/**
* Check if exact gradient already exists.
* @function module:svgcanvas~findDuplicateGradient
* @param {SVGGradientElement} grad - The gradient DOM element to compare to others
* @returns {SVGGradientElement} The existing gradient if found, `null` if not
*/
export const findDuplicateGradient = function (grad) {
  const defs = findDefs();
  const existingGrads = $(defs).find('linearGradient, radialGradient');
  let i = existingGrads.length;
  const radAttrs = ['r', 'cx', 'cy', 'fx', 'fy'];
  while (i--) {
    const og = existingGrads[i];
    if (grad.tagName === 'linearGradient') {
      if (grad.getAttribute('x1') !== og.getAttribute('x1') ||
    grad.getAttribute('y1') !== og.getAttribute('y1') ||
    grad.getAttribute('x2') !== og.getAttribute('x2') ||
    grad.getAttribute('y2') !== og.getAttribute('y2')
      ) {
        continue;
      }
    } else {
      const gradAttrs = $(grad).attr(radAttrs);
      const ogAttrs = $(og).attr(radAttrs);

      let diff = false;
      $.each(radAttrs, function (j, attr) {
        if (gradAttrs[attr] !== ogAttrs[attr]) { diff = true; }
      });

      if (diff) { continue; }
    }

    // else could be a duplicate, iterate through stops
    const stops = grad.getElementsByTagNameNS(NS.SVG, 'stop');
    const ostops = og.getElementsByTagNameNS(NS.SVG, 'stop');

    if (stops.length !== ostops.length) {
      continue;
    }

    let j = stops.length;
    while (j--) {
      const stop = stops[j];
      const ostop = ostops[j];

      if (stop.getAttribute('offset') !== ostop.getAttribute('offset') ||
    stop.getAttribute('stop-opacity') !== ostop.getAttribute('stop-opacity') ||
    stop.getAttribute('stop-color') !== ostop.getAttribute('stop-color')) {
        break;
      }
    }

    if (j === -1) {
      return og;
    }
  } // for each gradient in defs

  return null;
};

/**
* Set a color/gradient to a fill/stroke.
* @function module:elem-get-set.SvgCanvas#setPaint
* @param {"fill"|"stroke"} type - String with "fill" or "stroke"
* @param {module:jGraduate.jGraduatePaintOptions} paint - The jGraduate paint object to apply
* @returns {void}
*/
export const setPaintMethod = function (type, paint) {
  // make a copy
  const p = new $.jGraduate.Paint(paint);
  this.setPaintOpacity(type, p.alpha / 100, true);

  // now set the current paint object
  elemContext_.setCurProperties(type + '_paint', p);
  switch (p.type) {
  case 'solidColor':
    this.setColor(type, p.solidColor !== 'none' ? '#' + p.solidColor : 'none');
    break;
  case 'linearGradient':
  case 'radialGradient':
    elemContext_.setCanvas(type + 'Grad', p[p.type]);
    elemContext_.getCanvas().setGradient(type);
    break;
  }
};
/**
* Sets the stroke width for the current selected elements.
* When attempting to set a line's width to 0, this changes it to 1 instead.
* @function module:elem-get-set.SvgCanvas#setStrokeWidth
* @param {Float} val - A Float indicating the new stroke width value
* @fires module:elem-get-set.SvgCanvas#event:changed
* @returns {void}
*/
export const setStrokeWidthMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  if (val === 0 && ['line', 'path'].includes(elemContext_.getCanvas().getMode())) {
    elemContext_.getCanvas().setStrokeWidth(1);
    return;
  }
  elemContext_.setCurProperties('stroke_width', val);

  const elems = [];
  /**
*
* @param {Element} e
* @returns {void}
*/
  function addNonG (e) {
    if (e.nodeName !== 'g') {
      elems.push(e);
    }
  }
  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    if (elem) {
      if (elem.tagName === 'g') {
        walkTree(elem, addNonG);
      } else {
        elems.push(elem);
      }
    }
  }
  if (elems.length > 0) {
    elemContext_.getCanvas().changeSelectedAttribute('stroke-width', val, elems);
    elemContext_.call('changed', selectedElements);
  }
};

/**
* Set the given stroke-related attribute the given value for selected elements.
* @function module:elem-get-set.SvgCanvas#setStrokeAttr
* @param {string} attr - String with the attribute name
* @param {string|Float} val - String or number with the attribute value
* @fires module:elem-get-set.SvgCanvas#event:changed
* @returns {void}
*/
export const setStrokeAttrMethod = function (attr, val) {
  const selectedElements = elemContext_.getSelectedElements();
  elemContext_.setCurShape(attr.replace('-', '_'), val);
  const elems = [];

  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    if (elem) {
      if (elem.tagName === 'g') {
        walkTree(elem, function (e) { if (e.nodeName !== 'g') { elems.push(e); } });
      } else {
        elems.push(elem);
      }
    }
  }
  if (elems.length > 0) {
    elemContext_.getCanvas().changeSelectedAttribute(attr, val, elems);
    elemContext_.call('changed', selectedElements);
  }
};
