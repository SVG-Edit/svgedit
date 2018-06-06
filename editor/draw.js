/* globals jQuery */
/**
 * Tools for drawing
 * @module draw
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import Layer from './layer.js';
import HistoryRecordingService from './historyrecording.js';

import {NS} from './namespaces.js';
import {isOpera} from './browser.js';
import {
  toXml, getElem,
  copyElem as utilCopyElem
} from './utilities.js';
import {
  BatchCommand, RemoveElementCommand, MoveElementCommand, ChangeElementCommand
} from './history.js';

const $ = jQuery;

const visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use'.split(',');

const RandomizeModes = {
  LET_DOCUMENT_DECIDE: 0,
  ALWAYS_RANDOMIZE: 1,
  NEVER_RANDOMIZE: 2
};
let randIds = RandomizeModes.LET_DOCUMENT_DECIDE;
// Array with current disabled elements (for in-group editing)
let disabledElems = [];

/**
 * Get a HistoryRecordingService.
 * @param {module:history.HistoryRecordingService} [hrService] - if exists, return it instead of creating a new service.
 * @returns {module:history.HistoryRecordingService}
 */
function historyRecordingService (hrService) {
  return hrService || new HistoryRecordingService(canvas_.undoMgr);
}

/**
 * Find the layer name in a group element.
 * @param {Element} group The group element to search in.
 * @returns {string} The layer name or empty string.
 */
function findLayerNameInGroup (group) {
  return $('title', group).text() ||
    (isOpera() && group.querySelectorAll
      // Hack for Opera 10.60
      ? $(group.querySelectorAll('title')).text()
      : '');
}

/**
 * Given a set of names, return a new unique name.
 * @param {string[]} existingLayerNames - Existing layer names.
 * @returns {string} - The new name.
 */
function getNewLayerName (existingLayerNames) {
  let i = 1;
  // TODO(codedread): What about internationalization of "Layer"?
  while (existingLayerNames.includes(('Layer ' + i))) { i++; }
  return 'Layer ' + i;
}

/**
 * This class encapsulates the concept of a SVG-edit drawing
 */
export class Drawing {
  /**
  * @param {SVGSVGElement} svgElem - The SVG DOM Element that this JS object
  *     encapsulates.  If the svgElem has a se:nonce attribute on it, then
  *     IDs will use the nonce as they are generated.
  * @param {string} [optIdPrefix=svg_] - The ID prefix to use.
  * @throws {Error} If not initialized with an SVG element
  */
  constructor (svgElem, optIdPrefix) {
    if (!svgElem || !svgElem.tagName || !svgElem.namespaceURI ||
      svgElem.tagName !== 'svg' || svgElem.namespaceURI !== NS.SVG) {
      throw new Error('Error: svgedit.draw.Drawing instance initialized without a <svg> element');
    }

    /**
    * The SVG DOM Element that represents this drawing.
    * @type {SVGSVGElement}
    */
    this.svgElem_ = svgElem;

    /**
    * The latest object number used in this drawing.
    * @type {Integer}
    */
    this.obj_num = 0;

    /**
    * The prefix to prepend to each element id in the drawing.
    * @type {string}
    */
    this.idPrefix = optIdPrefix || 'svg_';

    /**
    * An array of released element ids to immediately reuse.
    * @type {Integer[]}
    */
    this.releasedNums = [];

    /**
    * The z-ordered array of Layer objects. Each layer has a name
    * and group element.
    * The first layer is the one at the bottom of the rendering.
    * @type {Layer[]}
    */
    this.all_layers = [];

    /**
    * Map of all_layers by name.
    *
    * Note: Layers are ordered, but referenced externally by name; so, we need both container
    * types depending on which function is called (i.e. all_layers and layer_map).
    *
    * @type {PlainObject.<string, Layer>}
    */
    this.layer_map = {};

    /**
    * The current layer being used.
    * @type {Layer}
    */
    this.current_layer = null;

    /**
    * The nonce to use to uniquely identify elements across drawings.
    * @type {!String}
    */
    this.nonce_ = '';
    const n = this.svgElem_.getAttributeNS(NS.SE, 'nonce');
    // If already set in the DOM, use the nonce throughout the document
    // else, if randomizeIds(true) has been called, create and set the nonce.
    if (!!n && randIds !== RandomizeModes.NEVER_RANDOMIZE) {
      this.nonce_ = n;
    } else if (randIds === RandomizeModes.ALWAYS_RANDOMIZE) {
      this.setNonce(Math.floor(Math.random() * 100001));
    }
  }

  /**
   * @param {string} id Element ID to retrieve
   * @returns {Element} SVG element within the root SVGSVGElement
  */
  getElem_ (id) {
    if (this.svgElem_.querySelector) {
      // querySelector lookup
      return this.svgElem_.querySelector('#' + id);
    }
    // jQuery lookup: twice as slow as xpath in FF
    return $(this.svgElem_).find('[id=' + id + ']')[0];
  }

  /**
   * @returns {SVGSVGElement}
   */
  getSvgElem () {
    return this.svgElem_;
  }

  /**
   * @returns {!(string|Integer)} The previously set nonce
   */
  getNonce () {
    return this.nonce_;
  }

  /**
   * @param {!(string|Integer)} n The nonce to set
   * @returns {undefined}
   */
  setNonce (n) {
    this.svgElem_.setAttributeNS(NS.XMLNS, 'xmlns:se', NS.SE);
    this.svgElem_.setAttributeNS(NS.SE, 'se:nonce', n);
    this.nonce_ = n;
  }

  /**
   * Clears any previously set nonce
   * @returns {undefined}
   */
  clearNonce () {
    // We deliberately leave any se:nonce attributes alone,
    // we just don't use it to randomize ids.
    this.nonce_ = '';
  }

  /**
   * Returns the latest object id as a string.
   * @returns {string} The latest object Id.
   */
  getId () {
    return this.nonce_
      ? this.idPrefix + this.nonce_ + '_' + this.obj_num
      : this.idPrefix + this.obj_num;
  }

  /**
   * Returns the next object Id as a string.
   * @returns {string} The next object Id to use.
   */
  getNextId () {
    const oldObjNum = this.obj_num;
    let restoreOldObjNum = false;

    // If there are any released numbers in the release stack,
    // use the last one instead of the next obj_num.
    // We need to temporarily use obj_num as that is what getId() depends on.
    if (this.releasedNums.length > 0) {
      this.obj_num = this.releasedNums.pop();
      restoreOldObjNum = true;
    } else {
      // If we are not using a released id, then increment the obj_num.
      this.obj_num++;
    }

    // Ensure the ID does not exist.
    let id = this.getId();
    while (this.getElem_(id)) {
      if (restoreOldObjNum) {
        this.obj_num = oldObjNum;
        restoreOldObjNum = false;
      }
      this.obj_num++;
      id = this.getId();
    }
    // Restore the old object number if required.
    if (restoreOldObjNum) {
      this.obj_num = oldObjNum;
    }
    return id;
  }

  /**
   * Releases the object Id, letting it be used as the next id in getNextId().
   * This method DOES NOT remove any elements from the DOM, it is expected
   * that client code will do this.
   * @param {string} id - The id to release.
   * @returns {boolean} True if the id was valid to be released, false otherwise.
  */
  releaseId (id) {
    // confirm if this is a valid id for this Document, else return false
    const front = this.idPrefix + (this.nonce_ ? this.nonce_ + '_' : '');
    if (typeof id !== 'string' || !id.startsWith(front)) {
      return false;
    }
    // extract the obj_num of this id
    const num = parseInt(id.substr(front.length), 10);

    // if we didn't get a positive number or we already released this number
    // then return false.
    if (typeof num !== 'number' || num <= 0 || this.releasedNums.includes(num)) {
      return false;
    }

    // push the released number into the released queue
    this.releasedNums.push(num);

    return true;
  }

  /**
   * Returns the number of layers in the current drawing.
   * @returns {Integer} The number of layers in the current drawing.
  */
  getNumLayers () {
    return this.all_layers.length;
  }

  /**
   * Check if layer with given name already exists
   * @param {string} name - The layer name to check
   * @returns {boolean}
  */
  hasLayer (name) {
    return this.layer_map[name] !== undefined;
  }

  /**
   * Returns the name of the ith layer. If the index is out of range, an empty string is returned.
   * @param {Integer} i - The zero-based index of the layer you are querying.
   * @returns {string} The name of the ith layer (or the empty string if none found)
  */
  getLayerName (i) {
    return i >= 0 && i < this.getNumLayers() ? this.all_layers[i].getName() : '';
  }

  /**
   * @returns {SVGGElement|null} The SVGGElement representing the current layer.
   */
  getCurrentLayer () {
    return this.current_layer ? this.current_layer.getGroup() : null;
  }

  /**
   * Get a layer by name.
   * @returns {SVGGElement} The SVGGElement representing the named layer or null.
   */
  getLayerByName (name) {
    const layer = this.layer_map[name];
    return layer ? layer.getGroup() : null;
  }

  /**
   * Returns the name of the currently selected layer. If an error occurs, an empty string
   * is returned.
   * @returns {string} The name of the currently active layer (or the empty string if none found).
  */
  getCurrentLayerName () {
    return this.current_layer ? this.current_layer.getName() : '';
  }

  /**
   * Set the current layer's name.
   * @param {string} name - The new name.
   * @param {module:history.HistoryRecordingService} hrService - History recording service
   * @returns {string|null} The new name if changed; otherwise, null.
   */
  setCurrentLayerName (name, hrService) {
    let finalName = null;
    if (this.current_layer) {
      const oldName = this.current_layer.getName();
      finalName = this.current_layer.setName(name, hrService);
      if (finalName) {
        delete this.layer_map[oldName];
        this.layer_map[finalName] = this.current_layer;
      }
    }
    return finalName;
  }

  /**
   * Set the current layer's position.
   * @param {Integer} newpos - The zero-based index of the new position of the layer. Range should be 0 to layers-1
   * @returns {{title: SVGGElement, previousName: string}|null} If the name was changed, returns {title:SVGGElement, previousName:string}; otherwise null.
   */
  setCurrentLayerPosition (newpos) {
    const layerCount = this.getNumLayers();
    if (!this.current_layer || newpos < 0 || newpos >= layerCount) {
      return null;
    }

    let oldpos;
    for (oldpos = 0; oldpos < layerCount; ++oldpos) {
      if (this.all_layers[oldpos] === this.current_layer) { break; }
    }
    // some unknown error condition (current_layer not in all_layers)
    if (oldpos === layerCount) { return null; }

    if (oldpos !== newpos) {
      // if our new position is below us, we need to insert before the node after newpos
      const currentGroup = this.current_layer.getGroup();
      const oldNextSibling = currentGroup.nextSibling;

      let refGroup = null;
      if (newpos > oldpos) {
        if (newpos < layerCount - 1) {
          refGroup = this.all_layers[newpos + 1].getGroup();
        }
      // if our new position is above us, we need to insert before the node at newpos
      } else {
        refGroup = this.all_layers[newpos].getGroup();
      }
      this.svgElem_.insertBefore(currentGroup, refGroup); // Ok to replace with `refGroup.before(currentGroup);`?

      this.identifyLayers();
      this.setCurrentLayer(this.getLayerName(newpos));

      return {
        currentGroup,
        oldNextSibling
      };
    }
    return null;
  }

  /**
  * @param {module:history.HistoryRecordingService} hrService
  * @returns {undefined}
  */
  mergeLayer (hrService) {
    const currentGroup = this.current_layer.getGroup();
    const prevGroup = $(currentGroup).prev()[0];
    if (!prevGroup) { return; }

    hrService.startBatchCommand('Merge Layer');

    const layerNextSibling = currentGroup.nextSibling;
    hrService.removeElement(currentGroup, layerNextSibling, this.svgElem_);

    while (currentGroup.firstChild) {
      const child = currentGroup.firstChild;
      if (child.localName === 'title') {
        hrService.removeElement(child, child.nextSibling, currentGroup);
        child.remove();
        continue;
      }
      const oldNextSibling = child.nextSibling;
      prevGroup.append(child);
      hrService.moveElement(child, oldNextSibling, currentGroup);
    }

    // Remove current layer's group
    this.current_layer.removeGroup();
    // Remove the current layer and set the previous layer as the new current layer
    const index = this.all_layers.indexOf(this.current_layer);
    if (index > 0) {
      const name = this.current_layer.getName();
      this.current_layer = this.all_layers[index - 1];
      this.all_layers.splice(index, 1);
      delete this.layer_map[name];
    }

    hrService.endBatchCommand();
  }

  /**
  * @param {module:history.HistoryRecordingService} hrService
  * @returns {undefined}
  */
  mergeAllLayers (hrService) {
    // Set the current layer to the last layer.
    this.current_layer = this.all_layers[this.all_layers.length - 1];

    hrService.startBatchCommand('Merge all Layers');
    while (this.all_layers.length > 1) {
      this.mergeLayer(hrService);
    }
    hrService.endBatchCommand();
  }

  /**
   * Sets the current layer. If the name is not a valid layer name, then this
   * function returns `false`. Otherwise it returns `true`. This is not an
   * undo-able action.
   * @param {string} name - The name of the layer you want to switch to.
   * @returns {boolean} `true` if the current layer was switched, otherwise `false`
   */
  setCurrentLayer (name) {
    const layer = this.layer_map[name];
    if (layer) {
      if (this.current_layer) {
        this.current_layer.deactivate();
      }
      this.current_layer = layer;
      this.current_layer.activate();
      return true;
    }
    return false;
  }

  /**
   * Deletes the current layer from the drawing and then clears the selection.
   * This function then calls the 'changed' handler.  This is an undoable action.
   * @todo Does this actually call the 'changed' handler?
   * @returns {SVGGElement} The SVGGElement of the layer removed or null.
   */
  deleteCurrentLayer () {
    if (this.current_layer && this.getNumLayers() > 1) {
      const oldLayerGroup = this.current_layer.removeGroup();
      this.identifyLayers();
      return oldLayerGroup;
    }
    return null;
  }

  /**
   * Updates layer system and sets the current layer to the
   * top-most layer (last `<g>` child of this drawing).
   * @returns {undefined}
  */
  identifyLayers () {
    this.all_layers = [];
    this.layer_map = {};
    const numchildren = this.svgElem_.childNodes.length;
    // loop through all children of SVG element
    const orphans = [], layernames = [];
    let layer = null;
    let childgroups = false;
    for (let i = 0; i < numchildren; ++i) {
      const child = this.svgElem_.childNodes.item(i);
      // for each g, find its layer name
      if (child && child.nodeType === 1) {
        if (child.tagName === 'g') {
          childgroups = true;
          const name = findLayerNameInGroup(child);
          if (name) {
            layernames.push(name);
            layer = new Layer(name, child);
            this.all_layers.push(layer);
            this.layer_map[name] = layer;
          } else {
            // if group did not have a name, it is an orphan
            orphans.push(child);
          }
        } else if (visElems.includes(child.nodeName)) {
          // Child is "visible" (i.e. not a <title> or <defs> element), so it is an orphan
          orphans.push(child);
        }
      }
    }

    // If orphans or no layers found, create a new layer and add all the orphans to it
    if (orphans.length > 0 || !childgroups) {
      layer = new Layer(getNewLayerName(layernames), null, this.svgElem_);
      layer.appendChildren(orphans);
      this.all_layers.push(layer);
      this.layer_map[name] = layer;
    } else {
      layer.activate();
    }
    this.current_layer = layer;
  }

  /**
   * Creates a new top-level layer in the drawing with the given name and
   * makes it the current layer.
   * @param {string} name - The given name. If the layer name exists, a new name will be generated.
   * @param {module:history.HistoryRecordingService} hrService - History recording service
   * @returns {SVGGElement} The SVGGElement of the new layer, which is
   *     also the current layer of this drawing.
  */
  createLayer (name, hrService) {
    if (this.current_layer) {
      this.current_layer.deactivate();
    }
    // Check for duplicate name.
    if (name === undefined || name === null || name === '' || this.layer_map[name]) {
      name = getNewLayerName(Object.keys(this.layer_map));
    }

    // Crate new layer and add to DOM as last layer
    const layer = new Layer(name, null, this.svgElem_);
    // Like to assume hrService exists, but this is backwards compatible with old version of createLayer.
    if (hrService) {
      hrService.startBatchCommand('Create Layer');
      hrService.insertElement(layer.getGroup());
      hrService.endBatchCommand();
    }

    this.all_layers.push(layer);
    this.layer_map[name] = layer;
    this.current_layer = layer;
    return layer.getGroup();
  }

  /**
   * Creates a copy of the current layer with the given name and makes it the current layer.
   * @param {string} name - The given name. If the layer name exists, a new name will be generated.
   * @param {module:history.HistoryRecordingService} hrService - History recording service
   * @returns {SVGGElement} The SVGGElement of the new layer, which is
   *     also the current layer of this drawing.
  */
  cloneLayer (name, hrService) {
    if (!this.current_layer) { return null; }
    this.current_layer.deactivate();
    // Check for duplicate name.
    if (name === undefined || name === null || name === '' || this.layer_map[name]) {
      name = getNewLayerName(Object.keys(this.layer_map));
    }

    // Create new group and add to DOM just after current_layer
    const currentGroup = this.current_layer.getGroup();
    const layer = new Layer(name, currentGroup, this.svgElem_);
    const group = layer.getGroup();

    // Clone children
    const children = currentGroup.childNodes;
    for (let index = 0; index < children.length; index++) {
      const ch = children[index];
      if (ch.localName === 'title') { continue; }
      group.append(this.copyElem(ch));
    }

    if (hrService) {
      hrService.startBatchCommand('Duplicate Layer');
      hrService.insertElement(group);
      hrService.endBatchCommand();
    }

    // Update layer containers and current_layer.
    const index = this.all_layers.indexOf(this.current_layer);
    if (index >= 0) {
      this.all_layers.splice(index + 1, 0, layer);
    } else {
      this.all_layers.push(layer);
    }
    this.layer_map[name] = layer;
    this.current_layer = layer;
    return group;
  }

  /**
   * Returns whether the layer is visible.  If the layer name is not valid,
   * then this function returns `false`.
   * @param {string} layerName - The name of the layer which you want to query.
   * @returns {boolean} The visibility state of the layer, or `false` if the layer name was invalid.
  */
  getLayerVisibility (layerName) {
    const layer = this.layer_map[layerName];
    return layer ? layer.isVisible() : false;
  }

  /**
   * Sets the visibility of the layer. If the layer name is not valid, this
   * function returns `null`, otherwise it returns the `SVGElement` representing
   * the layer. This is an undo-able action.
   * @param {string} layerName - The name of the layer to change the visibility
   * @param {boolean} bVisible - Whether the layer should be visible
   * @returns {?SVGGElement} The SVGGElement representing the layer if the
   *   `layerName` was valid, otherwise `null`.
  */
  setLayerVisibility (layerName, bVisible) {
    if (typeof bVisible !== 'boolean') {
      return null;
    }
    const layer = this.layer_map[layerName];
    if (!layer) { return null; }
    layer.setVisible(bVisible);
    return layer.getGroup();
  }

  /**
   * Returns the opacity of the given layer.  If the input name is not a layer, `null` is returned.
   * @param {string} layerName - name of the layer on which to get the opacity
   * @returns {?Float} The opacity value of the given layer.  This will be a value between 0.0 and 1.0, or `null`
   * if `layerName` is not a valid layer
  */
  getLayerOpacity (layerName) {
    const layer = this.layer_map[layerName];
    if (!layer) { return null; }
    return layer.getOpacity();
  }

  /**
   * Sets the opacity of the given layer.  If the input name is not a layer,
   * nothing happens. If opacity is not a value between 0.0 and 1.0, then
   * nothing happens.
   * NOTE: this function exists solely to apply a highlighting/de-emphasis
   * effect to a layer. When it is possible for a user to affect the opacity
   * of a layer, we will need to allow this function to produce an undo-able
   * action.
   * @param {string} layerName - Name of the layer on which to set the opacity
   * @param {Float} opacity - A float value in the range 0.0-1.0
   * @returns {undefined}
  */
  setLayerOpacity (layerName, opacity) {
    if (typeof opacity !== 'number' || opacity < 0.0 || opacity > 1.0) {
      return;
    }
    const layer = this.layer_map[layerName];
    if (layer) {
      layer.setOpacity(opacity);
    }
  }

  /**
   * Create a clone of an element, updating its ID and its children's IDs when needed
   * @param {Element} el - DOM element to clone
   * @returns {Element}
   */
  copyElem (el) {
    const self = this;
    const getNextIdClosure = function () { return self.getNextId(); };
    return utilCopyElem(el, getNextIdClosure);
  }
}

/**
 * Called to ensure that drawings will or will not have randomized ids.
 * The currentDrawing will have its nonce set if it doesn't already.
 * @function module:draw.randomizeIds
 * @param {boolean} enableRandomization - flag indicating if documents should have randomized ids
 * @param {draw.Drawing} currentDrawing
 * @returns {undefined}
 */
export const randomizeIds = function (enableRandomization, currentDrawing) {
  randIds = enableRandomization === false
    ? RandomizeModes.NEVER_RANDOMIZE
    : RandomizeModes.ALWAYS_RANDOMIZE;

  if (randIds === RandomizeModes.ALWAYS_RANDOMIZE && !currentDrawing.getNonce()) {
    currentDrawing.setNonce(Math.floor(Math.random() * 100001));
  } else if (randIds === RandomizeModes.NEVER_RANDOMIZE && currentDrawing.getNonce()) {
    currentDrawing.clearNonce();
  }
};

// Layer API Functions

/**
* Group: Layers
*/

/**
 * @see {@link https://api.jquery.com/jQuery.data/}
 * @name external:jQuery.data
 */

/**
 * @interface module:draw.DrawCanvasInit
 * @property {module:path.pathActions} pathActions
 * @property {external:jQuery.data} elData
 * @property {module:history.UndoManager} undoMgr
 */
/**
 * @function module:draw.DrawCanvasInit#getCurrentGroup
 * @returns {Element}
 */
/**
 * @function module:draw.DrawCanvasInit#setCurrentGroup
 * @param {Element} cg
 * @returns {undefined}
*/
/**
 * @function module:draw.DrawCanvasInit#getSelectedElements
 * @returns {Element[]} the array with selected DOM elements
*/
/**
 * @function module:draw.DrawCanvasInit#getSVGContent
 * @returns {SVGSVGElement}
 */
/**
 * @function module:draw.DrawCanvasInit#getCurrentDrawing
 * @returns {module:draw.Drawing}
 */
/**
 * @function module:draw.DrawCanvasInit#clearSelection
 * @param {boolean} [noCall] - When `true`, does not call the "selected" handler
 * @returns {undefined}
*/
/**
 * Run the callback function associated with the given event
 * @function module:draw.DrawCanvasInit#call
 * @param {"changed"|"contextset"} ev - String with the event name
 * @param {module:svgcanvas.SvgCanvas#event:changed|module:svgcanvas.SvgCanvas#event:contextset} arg - Argument to pass through to the callback
 * function. If the event is "changed", a (single-item) array of `Element`s is
 * passed. If the event is "contextset", the arg is `null` or `Element`.
 * @returns {undefined}
 */
/**
 * @function module:draw.DrawCanvasInit#addCommandToHistory
 * @param {Command} cmd
 * @returns {undefined}
*/
/**
 * @function module:draw.DrawCanvasInit#changeSVGContent
 * @returns {undefined}
 */

let canvas_;
/**
* @function module:draw.init
* @param {module:draw.DrawCanvasInit} canvas
* @returns {undefined}
*/
export const init = function (canvas) {
  canvas_ = canvas;
};

/**
* Updates layer system
* @function module:draw.identifyLayers
* @returns {undefined}
*/
export const identifyLayers = function () {
  leaveContext();
  canvas_.getCurrentDrawing().identifyLayers();
};

/**
* Creates a new top-level layer in the drawing with the given name, sets the current layer
* to it, and then clears the selection. This function then calls the 'changed' handler.
* This is an undoable action.
* @function module:draw.createLayer
* @param {string} name - The given name
* @param {module:history.HistoryRecordingService} hrService
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
export const createLayer = function (name, hrService) {
  const newLayer = canvas_.getCurrentDrawing().createLayer(
    name,
    historyRecordingService(hrService)
  );
  canvas_.clearSelection();
  canvas_.call('changed', [newLayer]);
};

/**
 * Creates a new top-level layer in the drawing with the given name, copies all the current layer's contents
 * to it, and then clears the selection. This function then calls the 'changed' handler.
 * This is an undoable action.
 * @function module:draw.cloneLayer
 * @param {string} name - The given name. If the layer name exists, a new name will be generated.
 * @param {module:history.HistoryRecordingService} hrService - History recording service
 * @fires module:svgcanvas.SvgCanvas#event:changed
 * @returns {undefined}
 */
export const cloneLayer = function (name, hrService) {
  // Clone the current layer and make the cloned layer the new current layer
  const newLayer = canvas_.getCurrentDrawing().cloneLayer(name, historyRecordingService(hrService));

  canvas_.clearSelection();
  leaveContext();
  canvas_.call('changed', [newLayer]);
};

/**
* Deletes the current layer from the drawing and then clears the selection. This function
* then calls the 'changed' handler. This is an undoable action.
* @function module:draw.deleteCurrentLayer
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {boolean} `true` if an old layer group was found to delete
*/
export const deleteCurrentLayer = function () {
  let currentLayer = canvas_.getCurrentDrawing().getCurrentLayer();
  const {nextSibling} = currentLayer;
  const parent = currentLayer.parentNode;
  currentLayer = canvas_.getCurrentDrawing().deleteCurrentLayer();
  if (currentLayer) {
    const batchCmd = new BatchCommand('Delete Layer');
    // store in our Undo History
    batchCmd.addSubCommand(new RemoveElementCommand(currentLayer, nextSibling, parent));
    canvas_.addCommandToHistory(batchCmd);
    canvas_.clearSelection();
    canvas_.call('changed', [parent]);
    return true;
  }
  return false;
};

/**
* Sets the current layer. If the name is not a valid layer name, then this function returns
* false. Otherwise it returns true. This is not an undo-able action.
* @function module:draw.setCurrentLayer
* @param {string} name - The name of the layer you want to switch to.
* @returns {boolean} true if the current layer was switched, otherwise false
*/
export const setCurrentLayer = function (name) {
  const result = canvas_.getCurrentDrawing().setCurrentLayer(toXml(name));
  if (result) {
    canvas_.clearSelection();
  }
  return result;
};

/**
* Renames the current layer. If the layer name is not valid (i.e. unique), then this function
* does nothing and returns `false`, otherwise it returns `true`. This is an undo-able action.
* @function module:draw.renameCurrentLayer
* @param {string} newName - the new name you want to give the current layer. This name must
* be unique among all layer names.
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {boolean} Whether the rename succeeded
*/
export const renameCurrentLayer = function (newName) {
  const drawing = canvas_.getCurrentDrawing();
  const layer = drawing.getCurrentLayer();
  if (layer) {
    const result = drawing.setCurrentLayerName(newName, historyRecordingService());
    if (result) {
      canvas_.call('changed', [layer]);
      return true;
    }
  }
  return false;
};

/**
* Changes the position of the current layer to the new value. If the new index is not valid,
* this function does nothing and returns false, otherwise it returns true. This is an
* undo-able action.
* @function module:draw.setCurrentLayerPosition
* @param {Integer} newPos - The zero-based index of the new position of the layer. This should be between
* 0 and (number of layers - 1)
* @returns {boolean} `true` if the current layer position was changed, `false` otherwise.
*/
export const setCurrentLayerPosition = function (newPos) {
  const drawing = canvas_.getCurrentDrawing();
  const result = drawing.setCurrentLayerPosition(newPos);
  if (result) {
    canvas_.addCommandToHistory(new MoveElementCommand(result.currentGroup, result.oldNextSibling, canvas_.getSVGContent()));
    return true;
  }
  return false;
};

/**
* Sets the visibility of the layer. If the layer name is not valid, this function return
* `false`, otherwise it returns `true`. This is an undo-able action.
* @function module:draw.setLayerVisibility
* @param {string} layerName - The name of the layer to change the visibility
* @param {boolean} bVisible - Whether the layer should be visible
* @returns {boolean} true if the layer's visibility was set, false otherwise
*/
export const setLayerVisibility = function (layerName, bVisible) {
  const drawing = canvas_.getCurrentDrawing();
  const prevVisibility = drawing.getLayerVisibility(layerName);
  const layer = drawing.setLayerVisibility(layerName, bVisible);
  if (layer) {
    const oldDisplay = prevVisibility ? 'inline' : 'none';
    canvas_.addCommandToHistory(new ChangeElementCommand(layer, {display: oldDisplay}, 'Layer Visibility'));
  } else {
    return false;
  }

  if (layer === drawing.getCurrentLayer()) {
    canvas_.clearSelection();
    canvas_.pathActions.clear();
  }
  // call('changed', [selected]);
  return true;
};

/**
* Moves the selected elements to layerName. If the name is not a valid layer name, then `false`
* is returned. Otherwise it returns `true`. This is an undo-able action.
* @function module:draw.moveSelectedToLayer
* @param {string} layerName - The name of the layer you want to which you want to move the selected elements
* @returns {boolean} Whether the selected elements were moved to the layer.
*/
export const moveSelectedToLayer = function (layerName) {
  // find the layer
  const drawing = canvas_.getCurrentDrawing();
  const layer = drawing.getLayerByName(layerName);
  if (!layer) { return false; }

  const batchCmd = new BatchCommand('Move Elements to Layer');

  // loop for each selected element and move it
  const selElems = canvas_.getSelectedElements();
  let i = selElems.length;
  while (i--) {
    const elem = selElems[i];
    if (!elem) { continue; }
    const oldNextSibling = elem.nextSibling;
    // TODO: this is pretty brittle!
    const oldLayer = elem.parentNode;
    layer.append(elem);
    batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldLayer));
  }

  canvas_.addCommandToHistory(batchCmd);

  return true;
};

/**
* @function module:draw.mergeLayer
* @param {module:history.HistoryRecordingService} hrService
* @returns {undefined}
*/
export const mergeLayer = function (hrService) {
  canvas_.getCurrentDrawing().mergeLayer(historyRecordingService(hrService));
  canvas_.clearSelection();
  leaveContext();
  canvas_.changeSVGContent();
};

/**
* @function module:draw.mergeAllLayers
* @param {module:history.HistoryRecordingService} hrService
* @returns {undefined}
*/
export const mergeAllLayers = function (hrService) {
  canvas_.getCurrentDrawing().mergeAllLayers(historyRecordingService(hrService));
  canvas_.clearSelection();
  leaveContext();
  canvas_.changeSVGContent();
};

/**
* Return from a group context to the regular kind, make any previously
* disabled elements enabled again
* @function module:draw.leaveContext
* @fires module:svgcanvas.SvgCanvas#event:contextset
* @returns {undefined}
*/
export const leaveContext = function () {
  const len = disabledElems.length;
  if (len) {
    for (let i = 0; i < len; i++) {
      const elem = disabledElems[i];
      const orig = canvas_.elData(elem, 'orig_opac');
      if (orig !== 1) {
        elem.setAttribute('opacity', orig);
      } else {
        elem.removeAttribute('opacity');
      }
      elem.setAttribute('style', 'pointer-events: inherit');
    }
    disabledElems = [];
    canvas_.clearSelection(true);
    canvas_.call('contextset', null);
  }
  canvas_.setCurrentGroup(null);
};

/**
* Set the current context (for in-group editing)
* @function module:draw.setContext
* @param {Element} elem
* @fires module:svgcanvas.SvgCanvas#event:contextset
* @returns {undefined}
*/
export const setContext = function (elem) {
  leaveContext();
  if (typeof elem === 'string') {
    elem = getElem(elem);
  }

  // Edit inside this group
  canvas_.setCurrentGroup(elem);

  // Disable other elements
  $(elem).parentsUntil('#svgcontent').andSelf().siblings().each(function () {
    const opac = this.getAttribute('opacity') || 1;
    // Store the original's opacity
    canvas_.elData(this, 'orig_opac', opac);
    this.setAttribute('opacity', opac * 0.33);
    this.setAttribute('style', 'pointer-events: none');
    disabledElems.push(this);
  });

  canvas_.clearSelection();
  canvas_.call('contextset', canvas_.getCurrentGroup());
};

/**
* @memberof module:draw
* @class Layer
* @see {@link module:layer.Layer}
*/
export {Layer};
