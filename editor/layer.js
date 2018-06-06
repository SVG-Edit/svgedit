/* globals jQuery */
/**
 * Provides tools for the layer concept
 * @module layer
 * @license MIT
 *
 * @copyright 2011 Jeff Schiller, 2016 Flint O'Brien
 */

import {NS} from './namespaces.js';
import {toXml, walkTree} from './utilities.js';

const $ = jQuery;

/**
 * This class encapsulates the concept of a layer in the drawing. It can be constructed with
 * an existing group element or, with three parameters, will create a new layer group element.
 *
 * @example
 * new Layer('name', group);          // Use the existing group for this layer.
 * new Layer('name', group, svgElem); // Create a new group and add it to the DOM after group.
 * new Layer('name', null, svgElem);  // Create a new group and add it to the DOM as the last layer.
 * @memberof module:layer
 */
class Layer {
  /**
  * @param {string} name - Layer name
  * @param {SVGGElement|null} group - An existing SVG group element or null.
  *     If group and no svgElem, use group for this layer.
  *     If group and svgElem, create a new group element and insert it in the DOM after group.
  *     If no group and svgElem, create a new group element and insert it in the DOM as the last layer.
  * @param {SVGGElement=} svgElem - The SVG DOM element. If defined, use this to add
  *     a new layer to the document.
  */
  constructor (name, group, svgElem) {
    this.name_ = name;
    this.group_ = svgElem ? null : group;

    if (svgElem) {
      // Create a group element with title and add it to the DOM.
      const svgdoc = svgElem.ownerDocument;
      this.group_ = svgdoc.createElementNS(NS.SVG, 'g');
      const layerTitle = svgdoc.createElementNS(NS.SVG, 'title');
      layerTitle.textContent = name;
      this.group_.append(layerTitle);
      if (group) {
        $(group).after(this.group_);
      } else {
        svgElem.append(this.group_);
      }
    }

    addLayerClass(this.group_);
    walkTree(this.group_, function (e) {
      e.setAttribute('style', 'pointer-events:inherit');
    });

    this.group_.setAttribute('style', svgElem ? 'pointer-events:all' : 'pointer-events:none');
  }

  /**
   * Get the layer's name.
   * @returns {string} The layer name
   */
  getName () {
    return this.name_;
  }

  /**
   * Get the group element for this layer.
   * @returns {SVGGElement} The layer SVG group
   */
  getGroup () {
    return this.group_;
  }

  /**
   * Active this layer so it takes pointer events.
   * @returns {undefined}
   */
  activate () {
    this.group_.setAttribute('style', 'pointer-events:all');
  }

  /**
   * Deactive this layer so it does NOT take pointer events.
   * @returns {undefined}
   */
  deactivate () {
    this.group_.setAttribute('style', 'pointer-events:none');
  }

  /**
   * Set this layer visible or hidden based on 'visible' parameter.
   * @param {boolean} visible - If true, make visible; otherwise, hide it.
   * @returns {undefined}
   */
  setVisible (visible) {
    const expected = visible === undefined || visible ? 'inline' : 'none';
    const oldDisplay = this.group_.getAttribute('display');
    if (oldDisplay !== expected) {
      this.group_.setAttribute('display', expected);
    }
  }

  /**
   * Is this layer visible?
   * @returns {boolean} True if visible.
   */
  isVisible () {
    return this.group_.getAttribute('display') !== 'none';
  }

  /**
   * Get layer opacity.
   * @returns {Float} Opacity value.
   */
  getOpacity () {
    const opacity = this.group_.getAttribute('opacity');
    if (opacity === null || opacity === undefined) {
      return 1;
    }
    return parseFloat(opacity);
  }

  /**
   * Sets the opacity of this layer. If opacity is not a value between 0.0 and 1.0,
   * nothing happens.
   * @param {Float} opacity - A float value in the range 0.0-1.0
   * @returns {undefined}
   */
  setOpacity (opacity) {
    if (typeof opacity === 'number' && opacity >= 0.0 && opacity <= 1.0) {
      this.group_.setAttribute('opacity', opacity);
    }
  }

  /**
   * Append children to this layer.
   * @param {SVGGElement} children - The children to append to this layer.
   * @returns {undefined}
   */
  appendChildren (children) {
    for (let i = 0; i < children.length; ++i) {
      this.group_.append(children[i]);
    }
  }

  /**
  * @returns {SVGTitleElement|null}
  */
  getTitleElement () {
    const len = this.group_.childNodes.length;
    for (let i = 0; i < len; ++i) {
      const child = this.group_.childNodes.item(i);
      if (child && child.tagName === 'title') {
        return child;
      }
    }
    return null;
  }

  /**
   * Set the name of this layer.
   * @param {string} name - The new name.
   * @param {module:history.HistoryRecordingService} hrService - History recording service
   * @returns {string|null} The new name if changed; otherwise, null.
   */
  setName (name, hrService) {
    const previousName = this.name_;
    name = toXml(name);
    // now change the underlying title element contents
    const title = this.getTitleElement();
    if (title) {
      $(title).empty();
      title.textContent = name;
      this.name_ = name;
      if (hrService) {
        hrService.changeElement(title, {'#text': previousName});
      }
      return this.name_;
    }
    return null;
  }

  /**
   * Remove this layer's group from the DOM. No more functions on group can be called after this.
   * @param {SVGGElement} children - The children to append to this layer.
   * @returns {SVGGElement} The layer SVG group that was just removed.
   */
  removeGroup () {
    const parent = this.group_.parentNode;
    const group = parent.removeChild(this.group_);
    this.group_ = undefined;
    return group;
  }
}
/**
 * @property {string} CLASS_NAME - class attribute assigned to all layer groups.
 */
Layer.CLASS_NAME = 'layer';

/**
 * @property {RegExp} CLASS_REGEX - Used to test presence of class Layer.CLASS_NAME
 */
Layer.CLASS_REGEX = new RegExp('(\\s|^)' + Layer.CLASS_NAME + '(\\s|$)');

/**
 * Add class `Layer.CLASS_NAME` to the element (usually `class='layer'`).
 *
 * @param {SVGGElement} elem - The SVG element to update
 * @returns {undefined}
 */
function addLayerClass (elem) {
  const classes = elem.getAttribute('class');
  if (classes === null || classes === undefined || !classes.length) {
    elem.setAttribute('class', Layer.CLASS_NAME);
  } else if (!Layer.CLASS_REGEX.test(classes)) {
    elem.setAttribute('class', classes + ' ' + Layer.CLASS_NAME);
  }
}

export default Layer;
