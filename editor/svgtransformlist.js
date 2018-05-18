/**
 * SVGTransformList
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

import {NS} from './svgedit.js';
import {supportsNativeTransformLists} from './browser.js';

const svgroot = document.createElementNS(NS.SVG, 'svg');

// Helper function.
function transformToString (xform) {
  const m = xform.matrix;
  let text = '';
  switch (xform.type) {
  case 1: // MATRIX
    text = 'matrix(' + [m.a, m.b, m.c, m.d, m.e, m.f].join(',') + ')';
    break;
  case 2: // TRANSLATE
    text = 'translate(' + m.e + ',' + m.f + ')';
    break;
  case 3: // SCALE
    if (m.a === m.d) {
      text = 'scale(' + m.a + ')';
    } else {
      text = 'scale(' + m.a + ',' + m.d + ')';
    }
    break;
  case 4: { // ROTATE
    let cx = 0;
    let cy = 0;
    // this prevents divide by zero
    if (xform.angle !== 0) {
      const K = 1 - m.a;
      cy = (K * m.f + m.b * m.e) / (K * K + m.b * m.b);
      cx = (m.e - m.b * cy) / K;
    }
    text = 'rotate(' + xform.angle + ' ' + cx + ',' + cy + ')';
    break;
  }
  }
  return text;
}

/**
 * Map of SVGTransformList objects.
 */
let listMap_ = {};

// **************************************************************************************
// SVGTransformList implementation for Webkit
// These methods do not currently raise any exceptions.
// These methods also do not check that transforms are being inserted.  This is basically
// implementing as much of SVGTransformList that we need to get the job done.
//
//  interface SVGEditTransformList {
//    attribute unsigned long numberOfItems;
//    void   clear (  )
//    SVGTransform initialize ( in SVGTransform newItem )
//    SVGTransform getItem ( in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//    SVGTransform insertItemBefore ( in SVGTransform newItem, in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//    SVGTransform replaceItem ( in SVGTransform newItem, in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//    SVGTransform removeItem ( in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//    SVGTransform appendItem ( in SVGTransform newItem )
//    NOT IMPLEMENTED: SVGTransform createSVGTransformFromMatrix ( in SVGMatrix matrix );
//    NOT IMPLEMENTED: SVGTransform consolidate (  );
//  }
// **************************************************************************************
export const SVGTransformList = function (elem) {
  this._elem = elem || null;
  this._xforms = [];
  // TODO: how do we capture the undo-ability in the changed transform list?
  this._update = function () {
    let tstr = '';
    /* const concatMatrix = */ svgroot.createSVGMatrix();
    for (let i = 0; i < this.numberOfItems; ++i) {
      const xform = this._list.getItem(i);
      tstr += transformToString(xform) + ' ';
    }
    this._elem.setAttribute('transform', tstr);
  };
  this._list = this;
  this._init = function () {
    // Transform attribute parser
    let str = this._elem.getAttribute('transform');
    if (!str) { return; }

    // TODO: Add skew support in future
    const re = /\s*((scale|matrix|rotate|translate)\s*\(.*?\))\s*,?\s*/;
    let m = true;
    while (m) {
      m = str.match(re);
      str = str.replace(re, '');
      if (m && m[1]) {
        const x = m[1];
        const bits = x.split(/\s*\(/);
        const name = bits[0];
        const valBits = bits[1].match(/\s*(.*?)\s*\)/);
        valBits[1] = valBits[1].replace(/(\d)-/g, '$1 -');
        const valArr = valBits[1].split(/[, ]+/);
        const letters = 'abcdef'.split('');
        const mtx = svgroot.createSVGMatrix();
        Object.values(valArr).forEach(function (item, i) {
          valArr[i] = parseFloat(item);
          if (name === 'matrix') {
            mtx[letters[i]] = valArr[i];
          }
        });
        const xform = svgroot.createSVGTransform();
        const fname = 'set' + name.charAt(0).toUpperCase() + name.slice(1);
        const values = name === 'matrix' ? [mtx] : valArr;

        if (name === 'scale' && values.length === 1) {
          values.push(values[0]);
        } else if (name === 'translate' && values.length === 1) {
          values.push(0);
        } else if (name === 'rotate' && values.length === 1) {
          values.push(0, 0);
        }
        xform[fname].apply(xform, values);
        this._list.appendItem(xform);
      }
    }
  };
  this._removeFromOtherLists = function (item) {
    if (item) {
      // Check if this transform is already in a transformlist, and
      // remove it if so.
      let found = false;
      for (const id in listMap_) {
        const tl = listMap_[id];
        for (let i = 0, len = tl._xforms.length; i < len; ++i) {
          if (tl._xforms[i] === item) {
            found = true;
            tl.removeItem(i);
            break;
          }
        }
        if (found) {
          break;
        }
      }
    }
  };

  this.numberOfItems = 0;
  this.clear = function () {
    this.numberOfItems = 0;
    this._xforms = [];
  };

  this.initialize = function (newItem) {
    this.numberOfItems = 1;
    this._removeFromOtherLists(newItem);
    this._xforms = [newItem];
  };

  this.getItem = function (index) {
    if (index < this.numberOfItems && index >= 0) {
      return this._xforms[index];
    }
    const err = new Error('DOMException with code=INDEX_SIZE_ERR');
    err.code = 1;
    throw err;
  };

  this.insertItemBefore = function (newItem, index) {
    let retValue = null;
    if (index >= 0) {
      if (index < this.numberOfItems) {
        this._removeFromOtherLists(newItem);
        const newxforms = new Array(this.numberOfItems + 1);
        // TODO: use array copying and slicing
        let i;
        for (i = 0; i < index; ++i) {
          newxforms[i] = this._xforms[i];
        }
        newxforms[i] = newItem;
        for (let j = i + 1; i < this.numberOfItems; ++j, ++i) {
          newxforms[j] = this._xforms[i];
        }
        this.numberOfItems++;
        this._xforms = newxforms;
        retValue = newItem;
        this._list._update();
      } else {
        retValue = this._list.appendItem(newItem);
      }
    }
    return retValue;
  };

  this.replaceItem = function (newItem, index) {
    let retValue = null;
    if (index < this.numberOfItems && index >= 0) {
      this._removeFromOtherLists(newItem);
      this._xforms[index] = newItem;
      retValue = newItem;
      this._list._update();
    }
    return retValue;
  };

  this.removeItem = function (index) {
    if (index < this.numberOfItems && index >= 0) {
      const retValue = this._xforms[index];
      const newxforms = new Array(this.numberOfItems - 1);
      let i;
      for (i = 0; i < index; ++i) {
        newxforms[i] = this._xforms[i];
      }
      for (let j = i; j < this.numberOfItems - 1; ++j, ++i) {
        newxforms[j] = this._xforms[i + 1];
      }
      this.numberOfItems--;
      this._xforms = newxforms;
      this._list._update();
      return retValue;
    }
    const err = new Error('DOMException with code=INDEX_SIZE_ERR');
    err.code = 1;
    throw err;
  };

  this.appendItem = function (newItem) {
    this._removeFromOtherLists(newItem);
    this._xforms.push(newItem);
    this.numberOfItems++;
    this._list._update();
    return newItem;
  };
};

export const resetListMap = function () {
  listMap_ = {};
};

/**
 * Removes transforms of the given element from the map.
 * Parameters:
 * elem - a DOM Element
 */
export const removeElementFromListMap = function (elem) {
  if (elem.id && listMap_[elem.id]) {
    delete listMap_[elem.id];
  }
};

// Function: getTransformList
// Returns an object that behaves like a SVGTransformList for the given DOM element
//
// Parameters:
// elem - DOM element to get a transformlist from
export const getTransformList = function (elem) {
  if (!supportsNativeTransformLists()) {
    const id = elem.id || 'temp';
    let t = listMap_[id];
    if (!t || id === 'temp') {
      listMap_[id] = new SVGTransformList(elem);
      listMap_[id]._init();
      t = listMap_[id];
    }
    return t;
  }
  if (elem.transform) {
    return elem.transform.baseVal;
  }
  if (elem.gradientTransform) {
    return elem.gradientTransform.baseVal;
  }
  if (elem.patternTransform) {
    return elem.patternTransform.baseVal;
  }

  return null;
};
