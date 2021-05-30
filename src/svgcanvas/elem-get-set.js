/**
 * @module elem-get-set get and set methods.
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import { jGraduate } from '../editor/components/jgraduate/jQuery.jGraduate.js';
import * as hstry from './history.js';
import { NS } from '../common/namespaces.js';
import {
  getVisibleElements, getStrokedBBoxDefaultVisible, findDefs,
  walkTree, isNullish, getHref, setHref, getElem
} from './utilities.js';
import {
  convertToNum
} from '../common/units.js';
import { getParents } from '../editor/components/jgraduate/Util.js';

const {
  InsertElementCommand, RemoveElementCommand,
  ChangeElementCommand, BatchCommand
} = hstry;

let elemContext_ = null;

/**
* @function module:elem-get-set.init
* @param {module:elem-get-set.elemContext} elemContext
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
  const dataStorage = elemContext_.getDataStorage();
  elem = elem || selectedElements[0];
  if (!elem) { return undefined; }
  if (dataStorage.has(elem, 'gsvg')) {
    elem = dataStorage.get(elem, 'gsvg');
  } else if (dataStorage.has(elem, 'symbol')) {
    elem = dataStorage.get(elem, 'symbol');
  }
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
  const dataStorage = elemContext_.getDataStorage();
  let elem = selectedElements[0];
  if (dataStorage.has(elem, 'gsvg')) {
    elem = dataStorage.get(elem, 'gsvg');
  }

  const ts = elem.querySelectorAll('title');

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
    batchCmd.addSubCommand(new ChangeElementCommand(title, { '#text': title.textContent }));
    title.textContent = val;
  } else {
    // Add title element
    title = elemContext_.getDOMDocument().createElementNS(NS.SVG, 'title');
    title.textContent = val;
    elem.insertBefore(title, elem.firstChild);
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
  let docTitle = false; let oldTitle = '';

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
  batchCmd.addSubCommand(new ChangeElementCommand(docTitle, { '#text': oldTitle }));
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
  const { w, h } = res;
  let batchCmd;

  if (x === 'fit') {
    // Get bounding box
    const bbox = getStrokedBBoxDefaultVisible();

    if (bbox) {
      batchCmd = new BatchCommand('Fit Canvas to Content');
      const visEls = getVisibleElements();
      elemContext_.getCanvas().addToSelection(visEls);
      const dx = []; const dy = [];
      visEls.forEach(function(_item, _i){
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
    batchCmd.addSubCommand(new ChangeElementCommand(elemContext_.getSVGContent(), { width: w, height: h }));

    elemContext_.getSVGContent().setAttribute('viewBox', [ 0, 0, x / currentZoom, y / currentZoom ].join(' '));
    batchCmd.addSubCommand(new ChangeElementCommand(elemContext_.getSVGContent(), { viewBox: [ '0 0', w, h ].join(' ') }));

    elemContext_.addCommandToHistory(batchCmd);
    elemContext_.call('changed', [ elemContext_.getSVGContent() ]);
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
  const calcZoom = function (bb) {
    if (!bb) { return false; }
    const wZoom = Math.round((editorW / bb.width) * 100 * spacer) / 100;
    const hZoom = Math.round((editorH / bb.height) * 100 * spacer) / 100;
    const zoom = Math.min(wZoom, hZoom);
    elemContext_.getCanvas().setZoom(zoom);
    return { zoom, bbox: bb };
  };

  if (typeof val === 'object') {
    bb = val;
    if (bb.width === 0 || bb.height === 0) {
      const newzoom = bb.zoom ? bb.zoom : currentZoom * bb.factor;
      elemContext_.getCanvas().setZoom(newzoom);
      return { zoom: currentZoom, bbox: bb };
    }
    return calcZoom(bb);
  }

  switch (val) {
  case 'selection': {
    if (!selectedElements[0]) { return undefined; }
    const selectedElems = selectedElements.map(function (n, _) {
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
    bb = { width: res.w, height: res.h, x: 0, y: 0 };
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
  selectedElements.forEach(function(elem){
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
  elemContext_.setCurProperties(type + '_paint', { type: 'solidColor' });
  const elems = [];
  /**
*
* @param {Element} e
* @returns {void}
*/
  function addNonG(e) {
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
  if (!elemContext_.getCurProperties(type + '_paint') ||
    elemContext_.getCurProperties(type + '_paint').type === 'solidColor') { return; }
  const canvas = elemContext_.getCanvas();
  let grad = canvas[type + 'Grad'];
  // find out if there is a duplicate gradient already in the defs
  const duplicateGrad = findDuplicateGradient(grad);
  const defs = findDefs();
  // no duplicate found, so import gradient into defs
  if (!duplicateGrad) {
    // const origGrad = grad;
    grad = elemContext_.getDOMDocument().importNode(grad, true);
    defs.append(grad);
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
  const existingGrads = defs.querySelectorAll('linearGradient, radialGradient');
  let i = existingGrads.length;
  const radAttrs = [ 'r', 'cx', 'cy', 'fx', 'fy' ];
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
      const gradAttrs = {
        r: grad.getAttribute('r'),
        cx: grad.getAttribute('cx'),
        cy: grad.getAttribute('cy'),
        fx: grad.getAttribute('fx'),
        fy: grad.getAttribute('fy')
      };
      const ogAttrs = {
        r: og.getAttribute('r'),
        cx: og.getAttribute('cx'),
        cy: og.getAttribute('cy'),
        fx: og.getAttribute('fx'),
        fy: og.getAttribute('fy')
      };

      let diff = false;
      radAttrs.forEach(function (attr) {
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
  const p = new jGraduate.Paint(paint);
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
  if (val === 0 && [ 'line', 'path' ].includes(elemContext_.getCanvas().getMode())) {
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
  // eslint-disable-next-line sonarjs/no-identical-functions
  function addNonG(e) {
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
/**
* Check whether selected element is bold or not.
* @function module:svgcanvas.SvgCanvas#getBold
* @returns {boolean} Indicates whether or not element is bold
*/
export const getBoldMethod = function () {
  const selectedElements = elemContext_.getSelectedElements();
  // should only have one element selected
  const selected = selectedElements[0];
  if (!isNullish(selected) && selected.tagName === 'text' &&
    isNullish(selectedElements[1])) {
    return (selected.getAttribute('font-weight') === 'bold');
  }
  return false;
};

/**
* Make the selected element bold or normal.
* @function module:svgcanvas.SvgCanvas#setBold
* @param {boolean} b - Indicates bold (`true`) or normal (`false`)
* @returns {void}
*/
export const setBoldMethod = function (b) {
  const selectedElements = elemContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!isNullish(selected) && selected.tagName === 'text' &&
    isNullish(selectedElements[1])) {
    elemContext_.getCanvas().changeSelectedAttribute('font-weight', b ? 'bold' : 'normal');
  }
  if (!selectedElements[0].textContent) {
    elemContext_.getCanvas().textActions.setCursor();
  }
};

/**
* Check whether selected element is in italics or not.
* @function module:svgcanvas.SvgCanvas#getItalic
* @returns {boolean} Indicates whether or not element is italic
*/
export const getItalicMethod = function () {
  const selectedElements = elemContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!isNullish(selected) && selected.tagName === 'text' &&
    isNullish(selectedElements[1])) {
    return (selected.getAttribute('font-style') === 'italic');
  }
  return false;
};

/**
* Make the selected element italic or normal.
* @function module:svgcanvas.SvgCanvas#setItalic
* @param {boolean} i - Indicates italic (`true`) or normal (`false`)
* @returns {void}
*/
export const setItalicMethod = function (i) {
  const selectedElements = elemContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!isNullish(selected) && selected.tagName === 'text' &&
    isNullish(selectedElements[1])) {
    elemContext_.getCanvas().changeSelectedAttribute('font-style', i ? 'italic' : 'normal');
  }
  if (!selectedElements[0].textContent) {
    elemContext_.getCanvas().textActions.setCursor();
  }
};

/**
 * @function module:svgcanvas.SvgCanvas#setTextAnchorMethod Set the new text anchor
 * @param {string} value - The text anchor value (start, middle or end)
 * @returns {void}
 */
export const setTextAnchorMethod = function (value) {
  const selectedElements = elemContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!isNullish(selected) && selected.tagName === 'text' &&
    isNullish(selectedElements[1])) {
    elemContext_.getCanvas().changeSelectedAttribute('text-anchor', value);
  }
  if (!selectedElements[0].textContent) {
    elemContext_.getCanvas().textActions.setCursor();
  }
};

/**
* @function module:svgcanvas.SvgCanvas#getFontFamily
* @returns {string} The current font family
*/
export const getFontFamilyMethod = function () {
  return elemContext_.getCurText('font_family');
};

/**
* Set the new font family.
* @function module:svgcanvas.SvgCanvas#setFontFamily
* @param {string} val - String with the new font family
* @returns {void}
*/
export const setFontFamilyMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  elemContext_.setCurText('font_family', val);
  elemContext_.getCanvas().changeSelectedAttribute('font-family', val);
  if (selectedElements[0] && !selectedElements[0].textContent) {
    elemContext_.getCanvas().textActions.setCursor();
  }
};

/**
* Set the new font color.
* @function module:svgcanvas.SvgCanvas#setFontColor
* @param {string} val - String with the new font color
* @returns {void}
*/
export const setFontColorMethod = function (val) {
  elemContext_.setCurText('fill', val);
  elemContext_.getCanvas().changeSelectedAttribute('fill', val);
};

/**
* @function module:svgcanvas.SvgCanvas#getFontColor
* @returns {string} The current font color
*/
export const getFontColorMethod = function () {
  return elemContext_.getCurText('fill');
};

/**
* @function module:svgcanvas.SvgCanvas#getFontSize
* @returns {Float} The current font size
*/
export const getFontSizeMethod = function () {
  return elemContext_.getCurText('font_size');
};

/**
* Applies the given font size to the selected element.
* @function module:svgcanvas.SvgCanvas#setFontSize
* @param {Float} val - Float with the new font size
* @returns {void}
*/
export const setFontSizeMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  elemContext_.setCurText('font_size', val);
  elemContext_.getCanvas().changeSelectedAttribute('font-size', val);
  if (!selectedElements[0].textContent) {
    elemContext_.getCanvas().textActions.setCursor();
  }
};

/**
* @function module:svgcanvas.SvgCanvas#getText
* @returns {string} The current text (`textContent`) of the selected element
*/
export const getTextMethod = function () {
  const selectedElements = elemContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (isNullish(selected)) { return ''; }
  return (selected) ? selected.textContent : '';
};

/**
* Updates the text element with the given string.
* @function module:svgcanvas.SvgCanvas#setTextContent
* @param {string} val - String with the new text
* @returns {void}
*/
export const setTextContentMethod = function (val) {
  elemContext_.getCanvas().changeSelectedAttribute('#text', val);
  elemContext_.getCanvas().textActions.init(val);
  elemContext_.getCanvas().textActions.setCursor();
};

/**
* Sets the new image URL for the selected image element. Updates its size if
* a new URL is given.
* @function module:svgcanvas.SvgCanvas#setImageURL
* @param {string} val - String with the image URL/path
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const setImageURLMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  const elem = selectedElements[0];
  if (!elem) { return; }

  const attrs = {
    width: elem.getAttribute('width'),
    height: elem.getAttribute('height')
  };
  const setsize = (!attrs.width || !attrs.height);

  const curHref = getHref(elem);

  // Do nothing if no URL change or size change
  if (curHref === val && !setsize) {
    return;
  }

  const batchCmd = new BatchCommand('Change Image URL');

  setHref(elem, val);
  batchCmd.addSubCommand(new ChangeElementCommand(elem, {
    '#href': curHref
  }));
  const img = new Image();
  img.onload = function () {
    const changes = {
      width: elem.getAttribute('width'),
      height: elem.getAttribute('height')
    };
    elem.setAttribute('width', this.width);
    elem.setAttribute('height', this.height);

    elemContext_.getCanvas().selectorManager.requestSelector(elem).resize();

    batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
    elemContext_.addCommandToHistory(batchCmd);
    elemContext_.call('changed', [ elem ]);
  };
  img.src = val;
};

/**
* Sets the new link URL for the selected anchor element.
* @function module:svgcanvas.SvgCanvas#setLinkURL
* @param {string} val - String with the link URL/path
* @returns {void}
*/
export const setLinkURLMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  let elem = selectedElements[0];
  if (!elem) { return; }
  if (elem.tagName !== 'a') {
    // See if parent is an anchor
    const parentsA = getParents(elem.parentNode, 'a');
    if (parentsA?.length) {
      elem = parentsA[0];
    } else {
      return;
    }
  }

  const curHref = getHref(elem);

  if (curHref === val) { return; }

  const batchCmd = new BatchCommand('Change Link URL');

  setHref(elem, val);
  batchCmd.addSubCommand(new ChangeElementCommand(elem, {
    '#href': curHref
  }));

  elemContext_.addCommandToHistory(batchCmd);
};

/**
* Sets the `rx` and `ry` values to the selected `rect` element
* to change its corner radius.
* @function module:svgcanvas.SvgCanvas#setRectRadius
* @param {string|Float} val - The new radius
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const setRectRadiusMethod = function (val) {
  const selectedElements = elemContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!isNullish(selected) && selected.tagName === 'rect') {
    const r = selected.getAttribute('rx');
    if (r !== String(val)) {
      selected.setAttribute('rx', val);
      selected.setAttribute('ry', val);
      elemContext_.addCommandToHistory(new ChangeElementCommand(selected, { rx: r, ry: r }, 'Radius'));
      elemContext_.call('changed', [ selected ]);
    }
  }
};

/**
* Wraps the selected element(s) in an anchor element or converts group to one.
* @function module:svgcanvas.SvgCanvas#makeHyperlink
* @param {string} url
* @returns {void}
*/
export const makeHyperlinkMethod = function (url) {
  elemContext_.getCanvas().groupSelectedElements('a', url);

  // TODO: If element is a single "g", convert to "a"
  //  if (selectedElements.length > 1 && selectedElements[1]) {
};

/**
* @function module:svgcanvas.SvgCanvas#removeHyperlink
* @returns {void}
*/
export const removeHyperlinkMethod = function () {
  elemContext_.getCanvas().ungroupSelectedElement();
};

/**
* Group: Element manipulation.
*/

/**
* Sets the new segment type to the selected segment(s).
* @function module:svgcanvas.SvgCanvas#setSegType
* @param {Integer} newType - New segment type. See {@link https://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg} for list
* @returns {void}
*/
export const setSegTypeMethod = function (newType) {
  elemContext_.getCanvas().pathActions.setSegType(newType);
};

/**
* Set the background of the editor (NOT the actual document).
* @function module:svgcanvas.SvgCanvas#setBackground
* @param {string} color - String with fill color to apply
* @param {string} url - URL or path to image to use
* @returns {void}
*/
export const setBackgroundMethod = function (color, url) {
  const bg = getElem('canvasBackground');
  const border = bg.querySelector('rect');
  let bgImg = getElem('background_image');
  let bgPattern = getElem('background_pattern');
  border.setAttribute('fill', color === 'chessboard' ? '#fff' : color);
  if (color === 'chessboard') {
    if (!bgPattern) {
      bgPattern = elemContext_.getDOMDocument().createElementNS(NS.SVG, 'foreignObject');
      elemContext_.getCanvas().assignAttributes(bgPattern, {
        id: 'background_pattern',
        width: '100%',
        height: '100%',
        preserveAspectRatio: 'xMinYMin',
        style: 'pointer-events:none'
      });
      const div = document.createElement('div');
      elemContext_.getCanvas().assignAttributes(div, {
        style: 'pointer-events:none;width:100%;height:100%;' +
          'background-image:url(data:image/gif;base64,' +
          'R0lGODlhEAAQAIAAAP///9bW1iH5BAAAAAAALAAAAAAQABAAAAIfjG+' +
          'gq4jM3IFLJgpswNly/XkcBpIiVaInlLJr9FZWAQA7);'
      });
      bgPattern.append(div);
      bg.append(bgPattern);
    }
  } else if (bgPattern) {
    bgPattern.remove();
  }
  if (url) {
    if (!bgImg) {
      bgImg = elemContext_.getDOMDocument().createElementNS(NS.SVG, 'image');
      elemContext_.getCanvas().assignAttributes(bgImg, {
        id: 'background_image',
        width: '100%',
        height: '100%',
        preserveAspectRatio: 'xMinYMin',
        style: 'pointer-events:none'
      });
    }
    setHref(bgImg, url);
    bg.append(bgImg);
  } else if (bgImg) {
    bgImg.remove();
  }
};
