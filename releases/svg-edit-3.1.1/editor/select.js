/* globals jQuery */
/**
 * DOM element selection box tools
 * @module select
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import {isTouch, isWebkit} from './browser.js'; // , isOpera
import {getRotationAngle, getBBox, getStrokedBBox} from './utilities.js';
import {transformListToTransform, transformBox, transformPoint} from './math.js';
import {getTransformList} from './svgtransformlist.js';

const $ = jQuery;

let svgFactory_;
let config_;
let selectorManager_; // A Singleton
const gripRadius = isTouch() ? 10 : 4;

/**
* Private class for DOM element selection boxes
*/
export class Selector {
  /**
  * @param {Integer} id - Internally identify the selector
  * @param {Element} elem - DOM element associated with this selector
  * @param {module:utilities.BBoxObject} [bbox] - Optional bbox to use for initialization (prevents duplicate `getBBox` call).
  */
  constructor (id, elem, bbox) {
    // this is the selector's unique number
    this.id = id;

    // this holds a reference to the element for which this selector is being used
    this.selectedElement = elem;

    // this is a flag used internally to track whether the selector is being used or not
    this.locked = true;

    // this holds a reference to the <g> element that holds all visual elements of the selector
    this.selectorGroup = svgFactory_.createSVGElement({
      element: 'g',
      attr: {id: ('selectorGroup' + this.id)}
    });

    // this holds a reference to the path rect
    this.selectorRect = this.selectorGroup.appendChild(
      svgFactory_.createSVGElement({
        element: 'path',
        attr: {
          id: ('selectedBox' + this.id),
          fill: 'none',
          stroke: '#22C',
          'stroke-width': '1',
          'stroke-dasharray': '5,5',
          // need to specify this so that the rect is not selectable
          style: 'pointer-events:none'
        }
      })
    );

    // this holds a reference to the grip coordinates for this selector
    this.gripCoords = {
      nw: null,
      n: null,
      ne: null,
      e: null,
      se: null,
      s: null,
      sw: null,
      w: null
    };

    this.reset(this.selectedElement, bbox);
  }

  /**
  * Used to reset the id and element that the selector is attached to
  * @param {Element} e - DOM element associated with this selector
  * @param {module:utilities.BBoxObject} bbox - Optional bbox to use for reset (prevents duplicate getBBox call).
  */
  reset (e, bbox) {
    this.locked = true;
    this.selectedElement = e;
    this.resize(bbox);
    this.selectorGroup.setAttribute('display', 'inline');
  }

  /**
  * Updates cursors for corner grips on rotation so arrows point the right way
  * @param {Float} angle - Current rotation angle in degrees
  */
  updateGripCursors (angle) {
    let dir;
    const dirArr = [];
    let steps = Math.round(angle / 45);
    if (steps < 0) { steps += 8; }
    for (dir in selectorManager_.selectorGrips) {
      dirArr.push(dir);
    }
    while (steps > 0) {
      dirArr.push(dirArr.shift());
      steps--;
    }
    let i = 0;
    for (dir in selectorManager_.selectorGrips) {
      selectorManager_.selectorGrips[dir].setAttribute('style', ('cursor:' + dirArr[i] + '-resize'));
      i++;
    }
  }

  /**
  * Show the resize grips of this selector
  *
  * @param {boolean} show - Indicates whether grips should be shown or not
  */
  showGrips (show) {
    const bShow = show ? 'inline' : 'none';
    selectorManager_.selectorGripsGroup.setAttribute('display', bShow);
    const elem = this.selectedElement;
    this.hasGrips = show;
    if (elem && show) {
      this.selectorGroup.append(selectorManager_.selectorGripsGroup);
      this.updateGripCursors(getRotationAngle(elem));
    }
  }

  /**
  * Updates the selector to match the element's size
  * @param {module:utilities.BBoxObject} [bbox] - BBox to use for resize (prevents duplicate getBBox call).
  */
  resize (bbox) {
    const selectedBox = this.selectorRect,
      mgr = selectorManager_,
      selectedGrips = mgr.selectorGrips,
      selected = this.selectedElement,
      sw = selected.getAttribute('stroke-width'),
      currentZoom = svgFactory_.getCurrentZoom();
    let offset = 1 / currentZoom;
    if (selected.getAttribute('stroke') !== 'none' && !isNaN(sw)) {
      offset += (sw / 2);
    }

    const {tagName} = selected;
    if (tagName === 'text') {
      offset += 2 / currentZoom;
    }

    // loop and transform our bounding box until we reach our first rotation
    const tlist = getTransformList(selected);
    const m = transformListToTransform(tlist).matrix;

    // This should probably be handled somewhere else, but for now
    // it keeps the selection box correctly positioned when zoomed
    m.e *= currentZoom;
    m.f *= currentZoom;

    if (!bbox) {
      bbox = getBBox(selected);
    }
    // TODO: getBBox (previous line) already knows to call getStrokedBBox when tagName === 'g'. Remove this?
    // TODO: getBBox doesn't exclude 'gsvg' and calls getStrokedBBox for any 'g'. Should getBBox be updated?
    if (tagName === 'g' && !$.data(selected, 'gsvg')) {
      // The bbox for a group does not include stroke vals, so we
      // get the bbox based on its children.
      const strokedBbox = getStrokedBBox([selected.childNodes]);
      if (strokedBbox) {
        bbox = strokedBbox;
      }
    }

    // apply the transforms
    const l = bbox.x, t = bbox.y, w = bbox.width, h = bbox.height;
    // bbox = {x: l, y: t, width: w, height: h}; // Not in use

    // we need to handle temporary transforms too
    // if skewed, get its transformed box, then find its axis-aligned bbox

    // *
    offset *= currentZoom;

    const nbox = transformBox(l * currentZoom, t * currentZoom, w * currentZoom, h * currentZoom, m),
      {aabox} = nbox;
    let nbax = aabox.x - offset,
      nbay = aabox.y - offset,
      nbaw = aabox.width + (offset * 2),
      nbah = aabox.height + (offset * 2);

    // now if the shape is rotated, un-rotate it
    const cx = nbax + nbaw / 2,
      cy = nbay + nbah / 2;

    const angle = getRotationAngle(selected);
    if (angle) {
      const rot = svgFactory_.svgRoot().createSVGTransform();
      rot.setRotate(-angle, cx, cy);
      const rotm = rot.matrix;
      nbox.tl = transformPoint(nbox.tl.x, nbox.tl.y, rotm);
      nbox.tr = transformPoint(nbox.tr.x, nbox.tr.y, rotm);
      nbox.bl = transformPoint(nbox.bl.x, nbox.bl.y, rotm);
      nbox.br = transformPoint(nbox.br.x, nbox.br.y, rotm);

      // calculate the axis-aligned bbox
      const {tl} = nbox;
      let minx = tl.x,
        miny = tl.y,
        maxx = tl.x,
        maxy = tl.y;

      const {min, max} = Math;

      minx = min(minx, min(nbox.tr.x, min(nbox.bl.x, nbox.br.x))) - offset;
      miny = min(miny, min(nbox.tr.y, min(nbox.bl.y, nbox.br.y))) - offset;
      maxx = max(maxx, max(nbox.tr.x, max(nbox.bl.x, nbox.br.x))) + offset;
      maxy = max(maxy, max(nbox.tr.y, max(nbox.bl.y, nbox.br.y))) + offset;

      nbax = minx;
      nbay = miny;
      nbaw = (maxx - minx);
      nbah = (maxy - miny);
    }

    const dstr = 'M' + nbax + ',' + nbay +
      ' L' + (nbax + nbaw) + ',' + nbay +
      ' ' + (nbax + nbaw) + ',' + (nbay + nbah) +
      ' ' + nbax + ',' + (nbay + nbah) + 'z';
    selectedBox.setAttribute('d', dstr);

    const xform = angle ? 'rotate(' + [angle, cx, cy].join(',') + ')' : '';
    this.selectorGroup.setAttribute('transform', xform);

    // TODO(codedread): Is this needed?
    //  if (selected === selectedElements[0]) {
    this.gripCoords = {
      nw: [nbax, nbay],
      ne: [nbax + nbaw, nbay],
      sw: [nbax, nbay + nbah],
      se: [nbax + nbaw, nbay + nbah],
      n: [nbax + (nbaw) / 2, nbay],
      w: [nbax, nbay + (nbah) / 2],
      e: [nbax + nbaw, nbay + (nbah) / 2],
      s: [nbax + (nbaw) / 2, nbay + nbah]
    };
    for (const dir in this.gripCoords) {
      const coords = this.gripCoords[dir];
      selectedGrips[dir].setAttribute('cx', coords[0]);
      selectedGrips[dir].setAttribute('cy', coords[1]);
    }

    // we want to go 20 pixels in the negative transformed y direction, ignoring scale
    mgr.rotateGripConnector.setAttribute('x1', nbax + (nbaw) / 2);
    mgr.rotateGripConnector.setAttribute('y1', nbay);
    mgr.rotateGripConnector.setAttribute('x2', nbax + (nbaw) / 2);
    mgr.rotateGripConnector.setAttribute('y2', nbay - (gripRadius * 5));

    mgr.rotateGrip.setAttribute('cx', nbax + (nbaw) / 2);
    mgr.rotateGrip.setAttribute('cy', nbay - (gripRadius * 5));
    // }
  }
}

/**
* Manage all selector objects (selection boxes)
*/
export class SelectorManager {
  constructor () {
    // this will hold the <g> element that contains all selector rects/grips
    this.selectorParentGroup = null;

    // this is a special rect that is used for multi-select
    this.rubberBandBox = null;

    // this will hold objects of type Selector (see above)
    this.selectors = [];

    // this holds a map of SVG elements to their Selector object
    this.selectorMap = {};

    // this holds a reference to the grip elements
    this.selectorGrips = {
      nw: null,
      n: null,
      ne: null,
      e: null,
      se: null,
      s: null,
      sw: null,
      w: null
    };

    this.selectorGripsGroup = null;
    this.rotateGripConnector = null;
    this.rotateGrip = null;

    this.initGroup();
  }

  /**
  * Resets the parent selector group element
  */
  initGroup () {
    // remove old selector parent group if it existed
    if (this.selectorParentGroup && this.selectorParentGroup.parentNode) {
      this.selectorParentGroup.remove();
    }

    // create parent selector group and add it to svgroot
    this.selectorParentGroup = svgFactory_.createSVGElement({
      element: 'g',
      attr: {id: 'selectorParentGroup'}
    });
    this.selectorGripsGroup = svgFactory_.createSVGElement({
      element: 'g',
      attr: {display: 'none'}
    });
    this.selectorParentGroup.append(this.selectorGripsGroup);
    svgFactory_.svgRoot().append(this.selectorParentGroup);

    this.selectorMap = {};
    this.selectors = [];
    this.rubberBandBox = null;

    // add the corner grips
    for (const dir in this.selectorGrips) {
      const grip = svgFactory_.createSVGElement({
        element: 'circle',
        attr: {
          id: ('selectorGrip_resize_' + dir),
          fill: '#22C',
          r: gripRadius,
          style: ('cursor:' + dir + '-resize'),
          // This expands the mouse-able area of the grips making them
          // easier to grab with the mouse.
          // This works in Opera and WebKit, but does not work in Firefox
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=500174
          'stroke-width': 2,
          'pointer-events': 'all'
        }
      });

      $.data(grip, 'dir', dir);
      $.data(grip, 'type', 'resize');
      this.selectorGrips[dir] = this.selectorGripsGroup.appendChild(grip);
    }

    // add rotator elems
    this.rotateGripConnector = this.selectorGripsGroup.appendChild(
      svgFactory_.createSVGElement({
        element: 'line',
        attr: {
          id: ('selectorGrip_rotateconnector'),
          stroke: '#22C',
          'stroke-width': '1'
        }
      })
    );

    this.rotateGrip = this.selectorGripsGroup.appendChild(
      svgFactory_.createSVGElement({
        element: 'circle',
        attr: {
          id: 'selectorGrip_rotate',
          fill: 'lime',
          r: gripRadius,
          stroke: '#22C',
          'stroke-width': 2,
          style: 'cursor:url(' + config_.imgPath + 'rotate.png) 12 12, auto;'
        }
      })
    );
    $.data(this.rotateGrip, 'type', 'rotate');

    if ($('#canvasBackground').length) { return; }

    const [width, height] = config_.dimensions;
    const canvasbg = svgFactory_.createSVGElement({
      element: 'svg',
      attr: {
        id: 'canvasBackground',
        width,
        height,
        x: 0,
        y: 0,
        overflow: (isWebkit() ? 'none' : 'visible'), // Chrome 7 has a problem with this when zooming out
        style: 'pointer-events:none'
      }
    });

    const rect = svgFactory_.createSVGElement({
      element: 'rect',
      attr: {
        width: '100%',
        height: '100%',
        x: 0,
        y: 0,
        'stroke-width': 1,
        stroke: '#000',
        fill: '#FFF',
        style: 'pointer-events:none'
      }
    });

    // Both Firefox and WebKit are too slow with this filter region (especially at higher
    // zoom levels) and Opera has at least one bug
    // if (!isOpera()) rect.setAttribute('filter', 'url(#canvashadow)');
    canvasbg.append(rect);
    svgFactory_.svgRoot().insertBefore(canvasbg, svgFactory_.svgContent());
    // Ok to replace above with `svgFactory_.svgContent().before(canvasbg);`?
  }

  /**
  *
  * @param {Element} elem - DOM element to get the selector for
  * @param {module:utilities.BBoxObject} [bbox] - Optional bbox to use for reset (prevents duplicate getBBox call).
  * @returns {Selector} The selector based on the given element
  */
  requestSelector (elem, bbox) {
    if (elem == null) { return null; }

    const N = this.selectors.length;
    // If we've already acquired one for this element, return it.
    if (typeof this.selectorMap[elem.id] === 'object') {
      this.selectorMap[elem.id].locked = true;
      return this.selectorMap[elem.id];
    }
    for (let i = 0; i < N; ++i) {
      if (this.selectors[i] && !this.selectors[i].locked) {
        this.selectors[i].locked = true;
        this.selectors[i].reset(elem, bbox);
        this.selectorMap[elem.id] = this.selectors[i];
        return this.selectors[i];
      }
    }
    // if we reached here, no available selectors were found, we create one
    this.selectors[N] = new Selector(N, elem, bbox);
    this.selectorParentGroup.append(this.selectors[N].selectorGroup);
    this.selectorMap[elem.id] = this.selectors[N];
    return this.selectors[N];
  }

  /**
  * Removes the selector of the given element (hides selection box)
  *
  * @param {Element} elem - DOM element to remove the selector for
  */
  releaseSelector (elem) {
    if (elem == null) { return; }
    const N = this.selectors.length,
      sel = this.selectorMap[elem.id];
    if (!sel.locked) {
      // TODO(codedread): Ensure this exists in this module.
      console.log('WARNING! selector was released but was already unlocked');
    }
    for (let i = 0; i < N; ++i) {
      if (this.selectors[i] && this.selectors[i] === sel) {
        delete this.selectorMap[elem.id];
        sel.locked = false;
        sel.selectedElement = null;
        sel.showGrips(false);

        // remove from DOM and store reference in JS but only if it exists in the DOM
        try {
          sel.selectorGroup.setAttribute('display', 'none');
        } catch (e) {}

        break;
      }
    }
  }

  /**
  * @returns {SVGRectElement} The rubberBandBox DOM element. This is the rectangle drawn by
  * the user for selecting/zooming
  */
  getRubberBandBox () {
    if (!this.rubberBandBox) {
      this.rubberBandBox = this.selectorParentGroup.appendChild(
        svgFactory_.createSVGElement({
          element: 'rect',
          attr: {
            id: 'selectorRubberBand',
            fill: '#22C',
            'fill-opacity': 0.15,
            stroke: '#22C',
            'stroke-width': 0.5,
            display: 'none',
            style: 'pointer-events:none'
          }
        })
      );
    }
    return this.rubberBandBox;
  }
}

/**
 * An object that creates SVG elements for the canvas.
 *
 * @interface module:select.SVGFactory
 */
/**
 * @function module:select.SVGFactory#createSVGElement
 * @param {module:utilities.EditorContext#addSVGElementFromJson} jsonMap
 * @returns {SVGElement}
 */
/**
 * @function module:select.SVGFactory#svgRoot
 * @returns {SVGSVGElement}
 */
/**
 * @function module:select.SVGFactory#svgContent
 * @returns {SVGSVGElement}
 */
/**
 * @function module:select.SVGFactory#getCurrentZoom
 * @returns {Float}
 */

/**
 * @typedef {GenericArray} module:select.Dimensions
 * @property {Integer} length 2
 * @property {Float} 0 Width
 * @property {Float} 1 Height
 */
/**
 * @typedef {PlainObject} module:select.Config
 * @property {string} imgPath
 * @property {module:select.Dimensions} dimensions
 */

/**
 * Initializes this module.
 * @function module:select.init
 * @param {module:select.Config} config - An object containing configurable parameters (imgPath)
 * @param {module:select.SVGFactory} svgFactory - An object implementing the SVGFactory interface.
 * @returns {undefined}
 */
export const init = function (config, svgFactory) {
  config_ = config;
  svgFactory_ = svgFactory;
  selectorManager_ = new SelectorManager();
};

/**
 * @function module:select.getSelectorManager
 * @returns {module:select.SelectorManager} The SelectorManager instance.
 */
export const getSelectorManager = () => selectorManager_;
