/* globals jQuery */
/**
 * Miscellaneous utilities
 * @module utilities
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import './svgpathseg.js';
import jqPluginSVG from './jQuery.attr.js'; // Needed for SVG attribute setting and array form with `attr`
import {NS} from './namespaces.js';
import {getTransformList} from './svgtransformlist.js';
import {setUnitAttr, getTypeMap} from './units.js';
import {convertPath} from './path.js';
import {
  hasMatrixTransform, transformListToTransform, transformBox
} from './math.js';
import {
  isWebkit, supportsHVLineContainerBBox, supportsPathBBox, supportsXpath,
  supportsSelectors
} from './browser.js';

// Constants
const $ = jqPluginSVG(jQuery);

// String used to encode base64.
const KEYSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

// Much faster than running getBBox() every time
const visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
const visElemsArr = visElems.split(',');
// const hidElems = 'clipPath,defs,desc,feGaussianBlur,filter,linearGradient,marker,mask,metadata,pattern,radialGradient,stop,switch,symbol,title,textPath';

let editorContext_ = null;
let domdoc_ = null;
let domcontainer_ = null;
let svgroot_ = null;

/**
* Object with the following keys/values
* @typedef {PlainObject} module:utilities.SVGElementJSON
* @property {string} element - Tag name of the SVG element to create
* @property {PlainObject.<string, string>} attr - Has key-value attributes to assign to the new element
* @property {boolean} [curStyles=false] - Indicates whether current style attributes should be applied first
* @property {module:utilities.SVGElementJSON[]} [children] - Data objects to be added recursively as children
* @property {string} [namespace="http://www.w3.org/2000/svg"] - Indicate a (non-SVG) namespace
*/

/**
 * An object that creates SVG elements for the canvas.
 *
 * @interface module:utilities.EditorContext
 * @property {module:path.pathActions} pathActions
 */
/**
 * @function module:utilities.EditorContext#getSVGContent
 * @returns {SVGSVGElement}
 */
/**
 * Create a new SVG element based on the given object keys/values and add it
 * to the current layer.
 * The element will be run through `cleanupElement` before being returned
 * @function module:utilities.EditorContext#addSVGElementFromJson
 * @param {module:utilities.SVGElementJSON} data
 * @returns {Element} The new element
*/
/**
 * @function module:utilities.EditorContext#getSelectedElements
 * @returns {Element[]} the array with selected DOM elements
*/
/**
 * @function module:utilities.EditorContext#getDOMDocument
 * @returns {HTMLDocument}
*/
/**
 * @function module:utilities.EditorContext#getDOMContainer
 * @returns {HTMLElement}
*/
/**
 * @function module:utilities.EditorContext#getSVGRoot
 * @returns {SVGSVGElement}
*/
/**
 * @function module:utilities.EditorContext#getBaseUnit
 * @returns {string}
*/
/**
 * @function module:utilities.EditorContext#getSnappingStep
 * @returns {Float|string}
*/

/**
* @function module:utilities.init
* @param {module:utilities.EditorContext} editorContext
* @returns {undefined}
*/
export const init = function (editorContext) {
  editorContext_ = editorContext;
  domdoc_ = editorContext.getDOMDocument();
  domcontainer_ = editorContext.getDOMContainer();
  svgroot_ = editorContext.getSVGRoot();
};

/**
 * Used to prevent the [Billion laughs attack]{@link https://en.wikipedia.org/wiki/Billion_laughs_attack}
 * @function module:utilities.dropXMLInteralSubset
 * @param {string} str String to be processed
 * @returns {string} The string with entity declarations in the internal subset removed
 * @todo This might be needed in other places `parseFromString` is used even without LGTM flagging
 */
export const dropXMLInteralSubset = (str) => {
  return str.replace(/(<!DOCTYPE\s+\w*\s*\[).*(\?\]>)/, '$1$2');
};

/**
* Converts characters in a string to XML-friendly entities.
* @function module:utilities.toXml
* @example `&` becomes `&amp;`
* @param {string} str - The string to be converted
* @returns {string} The converted string
*/
export const toXml = function (str) {
  // &apos; is ok in XML, but not HTML
  // &gt; does not normally need escaping, though it can if within a CDATA expression (and preceded by "]]")
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;'); // Note: `&apos;` is XML only
};

/**
* Converts XML entities in a string to single characters.
* @function module:utilities.fromXml
* @example `&amp;` becomes `&`
* @param {string} str - The string to be converted
* @returns {string} The converted string
*/
export const fromXml = function (str) {
  return $('<p/>').html(str).text();
};

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//        also precalculate the size of the array needed.

/**
* Converts a string to base64
* @function module:utilities.encode64
* @param {string} input
* @returns {string} Base64 output
*/
export const encode64 = function (input) {
  // base64 strings are 4/3 larger than the original string
  input = encodeUTF8(input); // convert non-ASCII characters
  // input = convertToXMLReferences(input);
  if (window.btoa) {
    return window.btoa(input); // Use native if available
  }
  const output = [];
  output.length = Math.floor((input.length + 2) / 3) * 4;

  let i = 0, p = 0;
  do {
    const chr1 = input.charCodeAt(i++);
    const chr2 = input.charCodeAt(i++);
    const chr3 = input.charCodeAt(i++);

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);

    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output[p++] = KEYSTR.charAt(enc1);
    output[p++] = KEYSTR.charAt(enc2);
    output[p++] = KEYSTR.charAt(enc3);
    output[p++] = KEYSTR.charAt(enc4);
  } while (i < input.length);

  return output.join('');
};

/**
* Converts a string from base64
* @function module:utilities.decode64
* @param {string} input Base64-encoded input
* @returns {string} Decoded output
*/
export const decode64 = function (input) {
  if (window.atob) {
    return decodeUTF8(window.atob(input));
  }

  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9+/=]/g, '');

  let output = '';
  let i = 0;

  do {
    const enc1 = KEYSTR.indexOf(input.charAt(i++));
    const enc2 = KEYSTR.indexOf(input.charAt(i++));
    const enc3 = KEYSTR.indexOf(input.charAt(i++));
    const enc4 = KEYSTR.indexOf(input.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return decodeUTF8(output);
};

/**
* @function module:utilities.decodeUTF8
* @param {string} argString
* @returns {string}
*/
export const decodeUTF8 = function (argString) {
  return decodeURIComponent(escape(argString));
};

// codedread:does not seem to work with webkit-based browsers on OSX // Brettz9: please test again as function upgraded
/**
* @function module:utilities.encodeUTF8
* @param {string} argString
* @returns {string}
*/
export const encodeUTF8 = function (argString) {
  return unescape(encodeURIComponent(argString));
};

/**
 * convert dataURL to object URL
 * @function module:utilities.dataURLToObjectURL
 * @param {string} dataurl
 * @returns {string} object URL or empty string
 */
export const dataURLToObjectURL = function (dataurl) {
  if (typeof Uint8Array === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
    return '';
  }
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], {type: mime});
  return URL.createObjectURL(blob);
};

/**
 * get object URL for a blob object
 * @function module:utilities.createObjectURL
 * @param {Blob} blob A Blob object or File object
 * @returns {string} object URL or empty string
 */
export const createObjectURL = function (blob) {
  if (!blob || typeof URL === 'undefined' || !URL.createObjectURL) {
    return '';
  }
  return URL.createObjectURL(blob);
};

/**
 * @property {string} blankPageObjectURL
 */
export const blankPageObjectURL = (function () {
  if (typeof Blob === 'undefined') {
    return '';
  }
  const blob = new Blob(['<html><head><title>SVG-edit</title></head><body>&nbsp;</body></html>'], {type: 'text/html'});
  return createObjectURL(blob);
})();

/**
* Converts a string to use XML references (for non-ASCII)
* @function module:utilities.convertToXMLReferences
* @param {string} input
* @returns {string} Decimal numeric character references
*/
export const convertToXMLReferences = function (input) {
  let output = '';
  [...input].forEach((ch) => {
    const c = ch.charCodeAt();
    if (c <= 127) {
      output += ch;
    } else {
      output += `&#${c};`;
    }
  });
  return output;
};

/**
* Cross-browser compatible method of converting a string to an XML tree
* found this function [here]{@link http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f}
* @function module:utilities.text2xml
* @param {string} sXML
* @throws {Error}
* @returns {XMLDocument}
*/
export const text2xml = function (sXML) {
  if (sXML.includes('<svg:svg')) {
    sXML = sXML.replace(/<(\/?)svg:/g, '<$1').replace('xmlns:svg', 'xmlns');
  }

  let out, dXML;
  try {
    dXML = (window.DOMParser) ? new DOMParser() : new window.ActiveXObject('Microsoft.XMLDOM');
    dXML.async = false;
  } catch (e) {
    throw new Error('XML Parser could not be instantiated');
  }
  try {
    if (dXML.loadXML) {
      out = (dXML.loadXML(sXML)) ? dXML : false;
    } else {
      out = dXML.parseFromString(sXML, 'text/xml');
    }
  } catch (e2) { throw new Error('Error parsing XML string'); }
  return out;
};

/**
* @typedef {PlainObject} module:utilities.BBoxObject (like `DOMRect`)
* @property {Float} x
* @property {Float} y
* @property {Float} width
* @property {Float} height
*/

/**
* Converts a `SVGRect` into an object.
* @function module:utilities.bboxToObj
* @param {SVGRect} bbox - a SVGRect
* @returns {module:utilities.BBoxObject} An object with properties names x, y, width, height.
*/
export const bboxToObj = function ({x, y, width, height}) {
  return {x, y, width, height};
};

/**
* @callback module:utilities.TreeWalker
* @param {Element} elem - DOM element being traversed
* @returns {undefined}
*/

/**
* Walks the tree and executes the callback on each element in a top-down fashion
* @function module:utilities.walkTree
* @param {Element} elem - DOM element to traverse
* @param {module:utilities.TreeWalker} cbFn - Callback function to run on each element
* @returns {undefined}
*/
export const walkTree = function (elem, cbFn) {
  if (elem && elem.nodeType === 1) {
    cbFn(elem);
    let i = elem.childNodes.length;
    while (i--) {
      walkTree(elem.childNodes.item(i), cbFn);
    }
  }
};

/**
* Walks the tree and executes the callback on each element in a depth-first fashion
* @function module:utilities.walkTreePost
* @todo FIXME: Shouldn't this be calling walkTreePost?
* @param {Element} elem - DOM element to traverse
* @param {module:utilities.TreeWalker} cbFn - Callback function to run on each element
* @returns {undefined}
*/
export const walkTreePost = function (elem, cbFn) {
  if (elem && elem.nodeType === 1) {
    let i = elem.childNodes.length;
    while (i--) {
      walkTree(elem.childNodes.item(i), cbFn);
    }
    cbFn(elem);
  }
};

/**
* Extracts the URL from the `url(...)` syntax of some attributes.
* Three variants:
*  - `<circle fill="url(someFile.svg#foo)" />`
*  - `<circle fill="url('someFile.svg#foo')" />`
*  - `<circle fill='url("someFile.svg#foo")' />`
* @function module:utilities.getUrlFromAttr
* @param {string} attrVal The attribute value as a string
* @returns {string} String with just the URL, like "someFile.svg#foo"
*/
export const getUrlFromAttr = function (attrVal) {
  if (attrVal) {
    // url('#somegrad')
    if (attrVal.startsWith('url("')) {
      return attrVal.substring(5, attrVal.indexOf('"', 6));
    }
    // url('#somegrad')
    if (attrVal.startsWith("url('")) {
      return attrVal.substring(5, attrVal.indexOf("'", 6));
    }
    if (attrVal.startsWith('url(')) {
      return attrVal.substring(4, attrVal.indexOf(')'));
    }
  }
  return null;
};

/**
* @function module:utilities.getHref
* @param {Element} elem
* @returns {string} The given element's `xlink:href` value
*/
export let getHref = function (elem) {
  return elem.getAttributeNS(NS.XLINK, 'href');
};

/**
* Sets the given element's `xlink:href` value
* @function module:utilities.setHref
* @param {Element} elem
* @param {string} val
* @returns {undefined}
*/
export let setHref = function (elem, val) {
  elem.setAttributeNS(NS.XLINK, 'xlink:href', val);
};

/**
* @function module:utilities.findDefs
* @returns {SVGDefsElement} The document's `<defs>` element, creating it first if necessary
*/
export const findDefs = function () {
  const svgElement = editorContext_.getSVGContent();
  let defs = svgElement.getElementsByTagNameNS(NS.SVG, 'defs');
  if (defs.length > 0) {
    defs = defs[0];
  } else {
    defs = svgElement.ownerDocument.createElementNS(NS.SVG, 'defs');
    if (svgElement.firstChild) {
      // first child is a comment, so call nextSibling
      svgElement.insertBefore(defs, svgElement.firstChild.nextSibling);
      // svgElement.firstChild.nextSibling.before(defs); // Not safe
    } else {
      svgElement.append(defs);
    }
  }
  return defs;
};

// TODO(codedread): Consider moving the next to functions to bbox.js

/**
* Get correct BBox for a path in Webkit.
* Converted from code found [here]{@link http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html}
* @function module:utilities.getPathBBox
* @param {SVGPathElement} path - The path DOM element to get the BBox for
* @returns {module:utilities.BBoxObject} A BBox-like object
*/
export const getPathBBox = function (path) {
  const seglist = path.pathSegList;
  const tot = seglist.numberOfItems;

  const bounds = [[], []];
  const start = seglist.getItem(0);
  let P0 = [start.x, start.y];

  for (let i = 0; i < tot; i++) {
    const seg = seglist.getItem(i);

    if (seg.x === undefined) { continue; }

    // Add actual points to limits
    bounds[0].push(P0[0]);
    bounds[1].push(P0[1]);

    if (seg.x1) {
      const P1 = [seg.x1, seg.y1],
        P2 = [seg.x2, seg.y2],
        P3 = [seg.x, seg.y];

      for (let j = 0; j < 2; j++) {
        const calc = function (t) {
          return Math.pow(1 - t, 3) * P0[j] +
            3 * Math.pow(1 - t, 2) * t * P1[j] +
            3 * (1 - t) * Math.pow(t, 2) * P2[j] +
            Math.pow(t, 3) * P3[j];
        };

        const b = 6 * P0[j] - 12 * P1[j] + 6 * P2[j];
        const a = -3 * P0[j] + 9 * P1[j] - 9 * P2[j] + 3 * P3[j];
        const c = 3 * P1[j] - 3 * P0[j];

        if (a === 0) {
          if (b === 0) {
            continue;
          }
          const t = -c / b;
          if (t > 0 && t < 1) {
            bounds[j].push(calc(t));
          }
          continue;
        }
        const b2ac = Math.pow(b, 2) - 4 * c * a;
        if (b2ac < 0) { continue; }
        const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
        if (t1 > 0 && t1 < 1) { bounds[j].push(calc(t1)); }
        const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
        if (t2 > 0 && t2 < 1) { bounds[j].push(calc(t2)); }
      }
      P0 = P3;
    } else {
      bounds[0].push(seg.x);
      bounds[1].push(seg.y);
    }
  }

  const x = Math.min.apply(null, bounds[0]);
  const w = Math.max.apply(null, bounds[0]) - x;
  const y = Math.min.apply(null, bounds[1]);
  const h = Math.max.apply(null, bounds[1]) - y;
  return {
    x,
    y,
    width: w,
    height: h
  };
};

/**
* Get the given/selected element's bounding box object, checking for
* horizontal/vertical lines (see issue 717)
* Note that performance is currently terrible, so some way to improve would
* be great.
* @param {Element} selected - Container or `<use>` DOM element
* @returns {DOMRect} Bounding box object
*/
function groupBBFix (selected) {
  if (supportsHVLineContainerBBox()) {
    try { return selected.getBBox(); } catch (e) {}
  }
  const ref = $.data(selected, 'ref');
  let matched = null;
  let ret, copy;

  if (ref) {
    copy = $(ref).children().clone().attr('visibility', 'hidden');
    $(svgroot_).append(copy);
    matched = copy.filter('line, path');
  } else {
    matched = $(selected).find('line, path');
  }

  let issue = false;
  if (matched.length) {
    matched.each(function () {
      const bb = this.getBBox();
      if (!bb.width || !bb.height) {
        issue = true;
      }
    });
    if (issue) {
      const elems = ref ? copy : $(selected).children();
      ret = getStrokedBBox(elems);
    } else {
      ret = selected.getBBox();
    }
  } else {
    ret = selected.getBBox();
  }
  if (ref) {
    copy.remove();
  }
  return ret;
}

/**
* Get the given/selected element's bounding box object, convert it to be more
* usable when necessary
* @function module:utilities.getBBox
* @param {Element} elem - Optional DOM element to get the BBox for
* @returns {module:utilities.BBoxObject} Bounding box object
*/
export const getBBox = function (elem) {
  const selected = elem || editorContext_.geSelectedElements()[0];
  if (elem.nodeType !== 1) { return null; }
  const elname = selected.nodeName;

  let ret = null;
  switch (elname) {
  case 'text':
    if (selected.textContent === '') {
      selected.textContent = 'a'; // Some character needed for the selector to use.
      ret = selected.getBBox();
      selected.textContent = '';
    } else {
      if (selected.getBBox) { ret = selected.getBBox(); }
    }
    break;
  case 'path':
    if (!supportsPathBBox()) {
      ret = getPathBBox(selected);
    } else {
      if (selected.getBBox) { ret = selected.getBBox(); }
    }
    break;
  case 'g':
  case 'a':
    ret = groupBBFix(selected);
    break;
  default:

    if (elname === 'use') {
      ret = groupBBFix(selected); // , true);
    }
    if (elname === 'use' || (elname === 'foreignObject' && isWebkit())) {
      if (!ret) { ret = selected.getBBox(); }
      // This is resolved in later versions of webkit, perhaps we should
      // have a featured detection for correct 'use' behavior?
      // ——————————
      if (!isWebkit()) {
        const bb = {};
        bb.width = ret.width;
        bb.height = ret.height;
        bb.x = ret.x + parseFloat(selected.getAttribute('x') || 0);
        bb.y = ret.y + parseFloat(selected.getAttribute('y') || 0);
        ret = bb;
      }
    } else if (visElemsArr.includes(elname)) {
      if (selected) {
        try {
          ret = selected.getBBox();
        } catch (err) {
          // tspan (and textPath apparently) have no `getBBox` in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=937268
          // Re: Chrome returning bbox for containing text element, see: https://bugs.chromium.org/p/chromium/issues/detail?id=349835
          const extent = selected.getExtentOfChar(0); // pos+dimensions of the first glyph
          const width = selected.getComputedTextLength(); // width of the tspan
          ret = {
            x: extent.x,
            y: extent.y,
            width,
            height: extent.height
          };
        }
      } else {
        // Check if element is child of a foreignObject
        const fo = $(selected).closest('foreignObject');
        if (fo.length) {
          if (fo[0].getBBox) {
            ret = fo[0].getBBox();
          }
        }
      }
    }
  }
  if (ret) {
    ret = bboxToObj(ret);
  }

  // get the bounding box from the DOM (which is in that element's coordinate system)
  return ret;
};

/**
* @typedef {GenericArray} module:utilities.PathSegmentArray
* @property {Integer} length 2
* @property {"M"|"L"|"C"|"Z"} 0
* @property {Float[]} 1
*/

/**
* Create a path 'd' attribute from path segments.
* Each segment is an array of the form: `[singleChar, [x,y, x,y, ...]]`
* @function module:utilities.getPathDFromSegments
* @param {module:utilities.PathSegmentArray[]} pathSegments - An array of path segments to be converted
* @returns {string} The converted path d attribute.
*/
export const getPathDFromSegments = function (pathSegments) {
  let d = '';

  $.each(pathSegments, function (j, [singleChar, pts]) {
    d += singleChar;
    for (let i = 0; i < pts.length; i += 2) {
      d += (pts[i] + ',' + pts[i + 1]) + ' ';
    }
  });

  return d;
};

/**
* Make a path 'd' attribute from a simple SVG element shape.
* @function module:utilities.getPathDFromElement
* @param {Element} elem - The element to be converted
* @returns {string} The path d attribute or `undefined` if the element type is unknown.
*/
export const getPathDFromElement = function (elem) {
  // Possibly the cubed root of 6, but 1.81 works best
  let num = 1.81;
  let d, a, rx, ry;
  switch (elem.tagName) {
  case 'ellipse':
  case 'circle':
    a = $(elem).attr(['rx', 'ry', 'cx', 'cy']);
    const {cx, cy} = a;
    ({rx, ry} = a);
    if (elem.tagName === 'circle') {
      rx = ry = $(elem).attr('r');
    }

    d = getPathDFromSegments([
      ['M', [(cx - rx), (cy)]],
      ['C', [(cx - rx), (cy - ry / num), (cx - rx / num), (cy - ry), (cx), (cy - ry)]],
      ['C', [(cx + rx / num), (cy - ry), (cx + rx), (cy - ry / num), (cx + rx), (cy)]],
      ['C', [(cx + rx), (cy + ry / num), (cx + rx / num), (cy + ry), (cx), (cy + ry)]],
      ['C', [(cx - rx / num), (cy + ry), (cx - rx), (cy + ry / num), (cx - rx), (cy)]],
      ['Z', []]
    ]);
    break;
  case 'path':
    d = elem.getAttribute('d');
    break;
  case 'line':
    a = $(elem).attr(['x1', 'y1', 'x2', 'y2']);
    d = 'M' + a.x1 + ',' + a.y1 + 'L' + a.x2 + ',' + a.y2;
    break;
  case 'polyline':
    d = 'M' + elem.getAttribute('points');
    break;
  case 'polygon':
    d = 'M' + elem.getAttribute('points') + ' Z';
    break;
  case 'rect':
    const r = $(elem).attr(['rx', 'ry']);
    ({rx, ry} = r);
    const b = elem.getBBox();
    const {x, y} = b, w = b.width, h = b.height;
    num = 4 - num; // Why? Because!

    if (!rx && !ry) {
      // Regular rect
      d = getPathDFromSegments([
        ['M', [x, y]],
        ['L', [x + w, y]],
        ['L', [x + w, y + h]],
        ['L', [x, y + h]],
        ['L', [x, y]],
        ['Z', []]
      ]);
    } else {
      d = getPathDFromSegments([
        ['M', [x, y + ry]],
        ['C', [x, y + ry / num, x + rx / num, y, x + rx, y]],
        ['L', [x + w - rx, y]],
        ['C', [x + w - rx / num, y, x + w, y + ry / num, x + w, y + ry]],
        ['L', [x + w, y + h - ry]],
        ['C', [x + w, y + h - ry / num, x + w - rx / num, y + h, x + w - rx, y + h]],
        ['L', [x + rx, y + h]],
        ['C', [x + rx / num, y + h, x, y + h - ry / num, x, y + h - ry]],
        ['L', [x, y + ry]],
        ['Z', []]
      ]);
    }
    break;
  default:
    break;
  }

  return d;
};

/**
* Get a set of attributes from an element that is useful for convertToPath.
* @function module:utilities.getExtraAttributesForConvertToPath
* @param {Element} elem - The element to be probed
* @returns {PlainObject.<"marker-start"|"marker-end"|"marker-mid"|"filter"|"clip-path", string>} An object with attributes.
*/
export const getExtraAttributesForConvertToPath = function (elem) {
  const attrs = {};
  // TODO: make this list global so that we can properly maintain it
  // TODO: what about @transform, @clip-rule, @fill-rule, etc?
  $.each(['marker-start', 'marker-end', 'marker-mid', 'filter', 'clip-path'], function () {
    const a = elem.getAttribute(this);
    if (a) {
      attrs[this] = a;
    }
  });
  return attrs;
};

/**
* Get the BBox of an element-as-path
* @function module:utilities.getBBoxOfElementAsPath
* @param {Element} elem - The DOM element to be probed
* @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
* @param {module:path.pathActions} pathActions - If a transform exists, `pathActions.resetOrientation()` is used. See: canvas.pathActions.
* @returns {DOMRect|false} The resulting path's bounding box object.
*/
export const getBBoxOfElementAsPath = function (elem, addSVGElementFromJson, pathActions) {
  const path = addSVGElementFromJson({
    element: 'path',
    attr: getExtraAttributesForConvertToPath(elem)
  });

  const eltrans = elem.getAttribute('transform');
  if (eltrans) {
    path.setAttribute('transform', eltrans);
  }

  const parent = elem.parentNode;
  if (elem.nextSibling) {
    elem.before(path);
  } else {
    parent.append(path);
  }

  const d = getPathDFromElement(elem);
  if (d) {
    path.setAttribute('d', d);
  } else {
    path.remove();
  }

  // Get the correct BBox of the new path, then discard it
  pathActions.resetOrientation(path);
  let bb = false;
  try {
    bb = path.getBBox();
  } catch (e) {
    // Firefox fails
  }
  path.remove();
  return bb;
};

/**
* Convert selected element to a path.
* @function module:utilities.convertToPath
* @param {Element} elem - The DOM element to be converted
* @param {module:utilities.SVGElementJSON} attrs - Apply attributes to new path. see canvas.convertToPath
* @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
* @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
* @param {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection} clearSelection - see [canvas.clearSelection]{@link module:svgcanvas.SvgCanvas#clearSelection}
* @param {module:path.EditorContext#addToSelection} addToSelection - see [canvas.addToSelection]{@link module:svgcanvas.SvgCanvas#addToSelection}
* @param {module:history} history - see history module
* @param {module:path.EditorContext#addCommandToHistory|module:draw.DrawCanvasInit#addCommandToHistory} addCommandToHistory - see [canvas.addCommandToHistory]{@link module:svgcanvas~addCommandToHistory}
* @returns {SVGPathElement|null} The converted path element or null if the DOM element was not recognized.
*/
export const convertToPath = function (elem, attrs, addSVGElementFromJson, pathActions, clearSelection, addToSelection, history, addCommandToHistory) {
  const batchCmd = new history.BatchCommand('Convert element to Path');

  // Any attribute on the element not covered by the passed-in attributes
  attrs = $.extend({}, attrs, getExtraAttributesForConvertToPath(elem));

  const path = addSVGElementFromJson({
    element: 'path',
    attr: attrs
  });

  const eltrans = elem.getAttribute('transform');
  if (eltrans) {
    path.setAttribute('transform', eltrans);
  }

  const {id} = elem;
  const parent = elem.parentNode;
  if (elem.nextSibling) {
    elem.before(path);
  } else {
    parent.append(path);
  }

  const d = getPathDFromElement(elem);
  if (d) {
    path.setAttribute('d', d);

    // Replace the current element with the converted one

    // Reorient if it has a matrix
    if (eltrans) {
      const tlist = getTransformList(path);
      if (hasMatrixTransform(tlist)) {
        pathActions.resetOrientation(path);
      }
    }

    const {nextSibling} = elem;
    batchCmd.addSubCommand(new history.RemoveElementCommand(elem, nextSibling, parent));
    batchCmd.addSubCommand(new history.InsertElementCommand(path));

    clearSelection();
    elem.remove();
    path.setAttribute('id', id);
    path.removeAttribute('visibility');
    addToSelection([path], true);

    addCommandToHistory(batchCmd);

    return path;
  }
  // the elem.tagName was not recognized, so no "d" attribute. Remove it, so we've haven't changed anything.
  path.remove();
  return null;
};

/**
* Can the bbox be optimized over the native getBBox? The optimized bbox is the same as the native getBBox when
* the rotation angle is a multiple of 90 degrees and there are no complex transforms.
* Getting an optimized bbox can be dramatically slower, so we want to make sure it's worth it.
*
* The best example for this is a circle rotate 45 degrees. The circle doesn't get wider or taller when rotated
* about it's center.
*
* The standard, unoptimized technique gets the native bbox of the circle, rotates the box 45 degrees, uses
* that width and height, and applies any transforms to get the final bbox. This means the calculated bbox
* is much wider than the original circle. If the angle had been 0, 90, 180, etc. both techniques render the
* same bbox.
*
* The optimization is not needed if the rotation is a multiple 90 degrees. The default technique is to call
* getBBox then apply the angle and any transforms.
*
* @param {Float} angle - The rotation angle in degrees
* @param {boolean} hasMatrixTransform - True if there is a matrix transform
* @returns {boolean} True if the bbox can be optimized.
*/
function bBoxCanBeOptimizedOverNativeGetBBox (angle, hasMatrixTransform) {
  const angleModulo90 = angle % 90;
  const closeTo90 = angleModulo90 < -89.99 || angleModulo90 > 89.99;
  const closeTo0 = angleModulo90 > -0.001 && angleModulo90 < 0.001;
  return hasMatrixTransform || !(closeTo0 || closeTo90);
}

/**
* Get bounding box that includes any transforms.
* @function module:utilities.getBBoxWithTransform
* @param {Element} elem - The DOM element to be converted
* @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
* @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
* @returns {module:utilities.BBoxObject|module:math.TransformedBox|DOMRect} A single bounding box object
*/
export const getBBoxWithTransform = function (elem, addSVGElementFromJson, pathActions) {
  // TODO: Fix issue with rotated groups. Currently they work
  // fine in FF, but not in other browsers (same problem mentioned
  // in Issue 339 comment #2).

  let bb = getBBox(elem);

  if (!bb) {
    return null;
  }

  const tlist = getTransformList(elem);
  const angle = getRotationAngleFromTransformList(tlist);
  const hasMatrixXForm = hasMatrixTransform(tlist);

  if (angle || hasMatrixXForm) {
    let goodBb = false;
    if (bBoxCanBeOptimizedOverNativeGetBBox(angle, hasMatrixXForm)) {
      // Get the BBox from the raw path for these elements
      // TODO: why ellipse and not circle
      const elemNames = ['ellipse', 'path', 'line', 'polyline', 'polygon'];
      if (elemNames.includes(elem.tagName)) {
        bb = goodBb = getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions);
      } else if (elem.tagName === 'rect') {
        // Look for radius
        const rx = elem.getAttribute('rx');
        const ry = elem.getAttribute('ry');
        if (rx || ry) {
          bb = goodBb = getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions);
        }
      }
    }

    if (!goodBb) {
      const {matrix} = transformListToTransform(tlist);
      bb = transformBox(bb.x, bb.y, bb.width, bb.height, matrix).aabox;

      // Old technique that was exceedingly slow with large documents.
      //
      // Accurate way to get BBox of rotated element in Firefox:
      // Put element in group and get its BBox
      //
      // Must use clone else FF freaks out
      // const clone = elem.cloneNode(true);
      // const g = document.createElementNS(NS.SVG, 'g');
      // const parent = elem.parentNode;
      // parent.append(g);
      // g.append(clone);
      // const bb2 = bboxToObj(g.getBBox());
      // g.remove();
    }
  }
  return bb;
};

// TODO: This is problematic with large stroke-width and, for example, a single horizontal line. The calculated BBox extends way beyond left and right sides.
function getStrokeOffsetForBBox (elem) {
  const sw = elem.getAttribute('stroke-width');
  return (!isNaN(sw) && elem.getAttribute('stroke') !== 'none') ? sw / 2 : 0;
}

/**
 * @typedef {PlainObject} BBox
 * @property {Integer} x The x value
 * @property {Integer} y The y value
 * @property {Float} width
 * @property {Float} height
 */

/**
* Get the bounding box for one or more stroked and/or transformed elements
* @function module:utilities.getStrokedBBox
* @param {Element[]} elems - Array with DOM elements to check
* @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
* @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
* @returns {module:utilities.BBoxObject|module:math.TransformedBox|DOMRect} A single bounding box object
*/
export const getStrokedBBox = function (elems, addSVGElementFromJson, pathActions) {
  if (!elems || !elems.length) { return false; }

  let fullBb;
  $.each(elems, function () {
    if (fullBb) { return; }
    if (!this.parentNode) { return; }
    fullBb = getBBoxWithTransform(this, addSVGElementFromJson, pathActions);
  });

  // This shouldn't ever happen...
  if (fullBb === undefined) { return null; }

  // fullBb doesn't include the stoke, so this does no good!
  // if (elems.length == 1) return fullBb;

  let maxX = fullBb.x + fullBb.width;
  let maxY = fullBb.y + fullBb.height;
  let minX = fullBb.x;
  let minY = fullBb.y;

  // If only one elem, don't call the potentially slow getBBoxWithTransform method again.
  if (elems.length === 1) {
    const offset = getStrokeOffsetForBBox(elems[0]);
    minX -= offset;
    minY -= offset;
    maxX += offset;
    maxY += offset;
  } else {
    $.each(elems, function (i, elem) {
      const curBb = getBBoxWithTransform(elem, addSVGElementFromJson, pathActions);
      if (curBb) {
        const offset = getStrokeOffsetForBBox(elem);
        minX = Math.min(minX, curBb.x - offset);
        minY = Math.min(minY, curBb.y - offset);
        // TODO: The old code had this test for max, but not min. I suspect this test should be for both min and max
        if (elem.nodeType === 1) {
          maxX = Math.max(maxX, curBb.x + curBb.width + offset);
          maxY = Math.max(maxY, curBb.y + curBb.height + offset);
        }
      }
    });
  }

  fullBb.x = minX;
  fullBb.y = minY;
  fullBb.width = maxX - minX;
  fullBb.height = maxY - minY;
  return fullBb;
};

/**
* Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
* Note that 0-opacity, off-screen etc elements are still considered "visible"
* for this function
* @function module:utilities.getVisibleElements
* @param {Element} parent - The parent DOM element to search within
* @returns {Element[]} All "visible" elements.
*/
export const getVisibleElements = function (parent) {
  if (!parent) {
    parent = $(editorContext_.getSVGContent()).children(); // Prevent layers from being included
  }

  const contentElems = [];
  $(parent).children().each(function (i, elem) {
    if (elem.getBBox) {
      contentElems.push(elem);
    }
  });
  return contentElems.reverse();
};

/**
* Get the bounding box for one or more stroked and/or transformed elements
* @function module:utilities.getStrokedBBoxDefaultVisible
* @param {Element[]} elems - Array with DOM elements to check
* @returns {module:utilities.BBoxObject} A single bounding box object
*/
export const getStrokedBBoxDefaultVisible = function (elems) {
  if (!elems) { elems = getVisibleElements(); }
  return getStrokedBBox(
    elems,
    editorContext_.addSVGElementFromJson,
    editorContext_.pathActions
  );
};

/**
* Get the rotation angle of the given transform list.
* @function module:utilities.getRotationAngleFromTransformList
* @param {SVGTransformList} tlist - List of transforms
* @param {boolean} toRad - When true returns the value in radians rather than degrees
* @returns {Float} The angle in degrees or radians
*/
export const getRotationAngleFromTransformList = function (tlist, toRad) {
  if (!tlist) { return 0; } // <svg> elements have no tlist
  const N = tlist.numberOfItems;
  for (let i = 0; i < N; ++i) {
    const xform = tlist.getItem(i);
    if (xform.type === 4) {
      return toRad ? xform.angle * Math.PI / 180.0 : xform.angle;
    }
  }
  return 0.0;
};

/**
* Get the rotation angle of the given/selected DOM element
* @function module:utilities.getRotationAngle
* @param {Element} [elem] - DOM element to get the angle for. Default to first of selected elements.
* @param {boolean} [toRad=false] - When true returns the value in radians rather than degrees
* @returns {Float} The angle in degrees or radians
*/
export let getRotationAngle = function (elem, toRad) {
  const selected = elem || editorContext_.getSelectedElements()[0];
  // find the rotation transform (if any) and set it
  const tlist = getTransformList(selected);
  return getRotationAngleFromTransformList(tlist, toRad);
};

/**
* Get the reference element associated with the given attribute value
* @function module:utilities.getRefElem
* @param {string} attrVal - The attribute value as a string
* @returns {Element} Reference element
*/
export const getRefElem = function (attrVal) {
  return getElem(getUrlFromAttr(attrVal).substr(1));
};

/**
* Get a DOM element by ID within the SVG root element.
* @function module:utilities.getElem
* @param {string} id - String with the element's new ID
* @returns {Element}
*/
export const getElem = (supportsSelectors())
  ? function (id) {
    // querySelector lookup
    return svgroot_.querySelector('#' + id);
  } : supportsXpath()
    ? function (id) {
      // xpath lookup
      return domdoc_.evaluate(
        'svg:svg[@id="svgroot"]//svg:*[@id="' + id + '"]',
        domcontainer_,
        function () { return NS.SVG; },
        9,
        null).singleNodeValue;
    }
    : function (id) {
      // jQuery lookup: twice as slow as xpath in FF
      return $(svgroot_).find('[id=' + id + ']')[0];
    };

/**
* Assigns multiple attributes to an element.
* @function module:utilities.assignAttributes
* @param {Element} elem - DOM element to apply new attribute values to
* @param {PlainObject.<string, string>} attrs - Object with attribute keys/values
* @param {Integer} [suspendLength] - Milliseconds to suspend redraw
* @param {boolean} [unitCheck=false] - Boolean to indicate the need to use units.setUnitAttr
* @returns {undefined}
*/
export const assignAttributes = function (elem, attrs, suspendLength, unitCheck) {
  for (const [key, value] of Object.entries(attrs)) {
    const ns = (key.substr(0, 4) === 'xml:'
      ? NS.XML
      : key.substr(0, 6) === 'xlink:' ? NS.XLINK : null);

    if (ns) {
      elem.setAttributeNS(ns, key, value);
    } else if (!unitCheck) {
      elem.setAttribute(key, value);
    } else {
      setUnitAttr(elem, key, value);
    }
  }
};

/**
* Remove unneeded (default) attributes, makes resulting SVG smaller
* @function module:utilities.cleanupElement
* @param {Element} element - DOM element to clean up
* @returns {undefined}
*/
export const cleanupElement = function (element) {
  const defaults = {
    'fill-opacity': 1,
    'stop-opacity': 1,
    opacity: 1,
    stroke: 'none',
    'stroke-dasharray': 'none',
    'stroke-linejoin': 'miter',
    'stroke-linecap': 'butt',
    'stroke-opacity': 1,
    'stroke-width': 1,
    rx: 0,
    ry: 0
  };

  if (element.nodeName === 'ellipse') {
    // Ellipse elements require rx and ry attributes
    delete defaults.rx;
    delete defaults.ry;
  }

  for (const attr in defaults) {
    const val = defaults[attr];
    if (element.getAttribute(attr) === String(val)) {
      element.removeAttribute(attr);
    }
  }
};

/**
* Round value to for snapping
* @function module:utilities.snapToGrid
* @param {Float} value
* @returns {Integer}
*/
export const snapToGrid = function (value) {
  const unit = editorContext_.getBaseUnit();
  let stepSize = editorContext_.getSnappingStep();
  if (unit !== 'px') {
    stepSize *= getTypeMap()[unit];
  }
  value = Math.round(value / stepSize) * stepSize;
  return value;
};

/**
* Escapes special characters in a regular expression
* @function module:utilities.regexEscape
* @param {string} str
* @returns {string}
*/
export const regexEscape = function (str) {
  // From: http://phpjs.org/functions
  return String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
};

/**
 * Prevents default browser click behaviour on the given element
 * @function module:utilities.preventClickDefault
 * @param {Element} img - The DOM element to prevent the click on
 * @returns {undefined}
 */
export const preventClickDefault = function (img) {
  $(img).click(function (e) { e.preventDefault(); });
};

/**
 * @callback module:utilities.GetNextID
 * @returns {string} The ID
 */
/**
 * Create a clone of an element, updating its ID and its children's IDs when needed
 * @function module:utilities.copyElem
 * @param {Element} el - DOM element to clone
 * @param {module:utilities.GetNextID} getNextId - The getter of the next unique ID.
 * @returns {Element} The cloned element
 */
export const copyElem = function (el, getNextId) {
  // manually create a copy of the element
  const newEl = document.createElementNS(el.namespaceURI, el.nodeName);
  $.each(el.attributes, function (i, attr) {
    if (attr.localName !== '-moz-math-font-style') {
      newEl.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.value);
    }
  });
  // set the copied element's new id
  newEl.removeAttribute('id');
  newEl.id = getNextId();

  // Opera's "d" value needs to be reset for Opera/Win/non-EN
  // Also needed for webkit (else does not keep curved segments on clone)
  if (isWebkit() && el.nodeName === 'path') {
    const fixedD = convertPath(el);
    newEl.setAttribute('d', fixedD);
  }

  // now create copies of all children
  $.each(el.childNodes, function (i, child) {
    switch (child.nodeType) {
    case 1: // element node
      newEl.append(copyElem(child, getNextId));
      break;
    case 3: // text node
      newEl.textContent = child.nodeValue;
      break;
    default:
      break;
    }
  });

  if ($(el).data('gsvg')) {
    $(newEl).data('gsvg', newEl.firstChild);
  } else if ($(el).data('symbol')) {
    const ref = $(el).data('symbol');
    $(newEl).data('ref', ref).data('symbol', ref);
  } else if (newEl.tagName === 'image') {
    preventClickDefault(newEl);
  }

  return newEl;
};

/**
* Unit testing
* @function module:utilities.mock
* @returns {undefined}
*/
export const mock = ({
  getHref: getHrefUser, setHref: setHrefUser, getRotationAngle: getRotationAngleUser
}) => {
  getHref = getHrefUser;
  setHref = setHrefUser;
  getRotationAngle = getRotationAngleUser;
};
