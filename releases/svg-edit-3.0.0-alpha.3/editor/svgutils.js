/* globals jQuery, ActiveXObject */
/**
 * Package: svgedit.utilities
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

import './pathseg.js';
import RGBColor from './canvg/rgbcolor.js';
import jqPluginSVG from './jquery-svg.js'; // Needed for SVG attribute setting and array form with `attr`
import {importScript, importModule} from './external/dynamic-import-polyfill/importModule.js';
import {NS} from './svgedit.js';
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

export const init = function (editorContext) {
  editorContext_ = editorContext;
  domdoc_ = editorContext.getDOMDocument();
  domcontainer_ = editorContext.getDOMContainer();
  svgroot_ = editorContext.getSVGRoot();
};

// Converts characters in a string to XML-friendly entities.
//
// Example: '&' becomes '&amp;'
//
// Parameters:
// str - The string to be converted
//
// Returns:
// The converted string
export const toXml = function (str) {
  // &apos; is ok in XML, but not HTML
  // &gt; does not normally need escaping, though it can if within a CDATA expression (and preceded by "]]")
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/, '&#x27;');
};

// Converts XML entities in a string to single characters.
// Example: '&amp;' becomes '&'
//
// Parameters:
// str - The string to be converted
//
// Returns:
// The converted string
export const fromXml = function (str) {
  return $('<p/>').html(str).text();
};

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//        also precalculate the size of the array needed.

// Converts a string to base64
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

// Converts a string from base64
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

export const decodeUTF8 = function (argString) {
  return decodeURIComponent(escape(argString));
};

// codedread:does not seem to work with webkit-based browsers on OSX // Brettz9: please test again as function upgraded
export const encodeUTF8 = function (argString) {
  return unescape(encodeURIComponent(argString));
};

/**
 * convert dataURL to object URL
 * @param {string} dataurl
 * @return {string} object URL or empty string
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
 * @param {Blob} blob A Blob object or File object
 * @return {string} object URL or empty string
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

// Converts a string to use XML references
export const convertToXMLReferences = function (input) {
  let n,
    output = '';
  for (n = 0; n < input.length; n++) {
    const c = input.charCodeAt(n);
    if (c < 128) {
      output += input[n];
    } else if (c > 127) {
      output += ('&#' + c + ';');
    }
  }
  return output;
};

// Cross-browser compatible method of converting a string to an XML tree
// found this function here: http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
export const text2xml = function (sXML) {
  if (sXML.includes('<svg:svg')) {
    sXML = sXML.replace(/<(\/?)svg:/g, '<$1').replace('xmlns:svg', 'xmlns');
  }

  let out, dXML;
  try {
    dXML = (window.DOMParser) ? new DOMParser() : new ActiveXObject('Microsoft.XMLDOM');
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

// Converts a SVGRect into an object.
//
// Parameters:
// bbox - a SVGRect
//
// Returns:
// An object with properties names x, y, width, height.
export const bboxToObj = function (bbox) {
  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height
  };
};

// Walks the tree and executes the callback on each element in a top-down fashion
//
// Parameters:
// elem - DOM element to traverse
// cbFn - Callback function to run on each element
export const walkTree = function (elem, cbFn) {
  if (elem && elem.nodeType === 1) {
    cbFn(elem);
    let i = elem.childNodes.length;
    while (i--) {
      walkTree(elem.childNodes.item(i), cbFn);
    }
  }
};

// Walks the tree and executes the callback on each element in a depth-first fashion
// TODO: FIXME: Shouldn't this be calling walkTreePost?
//
// Parameters:
// elem - DOM element to traverse
// cbFn - Callback function to run on each element
export const walkTreePost = function (elem, cbFn) {
  if (elem && elem.nodeType === 1) {
    let i = elem.childNodes.length;
    while (i--) {
      walkTree(elem.childNodes.item(i), cbFn);
    }
    cbFn(elem);
  }
};

// Extracts the URL from the url(...) syntax of some attributes.
// Three variants:
//  * <circle fill="url(someFile.svg#foo)" />
//  * <circle fill="url('someFile.svg#foo')" />
//  * <circle fill='url("someFile.svg#foo")' />
//
// Parameters:
// attrVal - The attribute value as a string
//
// Returns:
// String with just the URL, like someFile.svg#foo
export const getUrlFromAttr = function (attrVal) {
  if (attrVal) {
    // url("#somegrad")
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

// Returns the given element's xlink:href value
export let getHref = function (elem) {
  return elem.getAttributeNS(NS.XLINK, 'href');
};

// Sets the given element's xlink:href value
export let setHref = function (elem, val) {
  elem.setAttributeNS(NS.XLINK, 'xlink:href', val);
};

// Returns:
// The document's <defs> element, create it first if necessary
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
    } else {
      svgElement.appendChild(defs);
    }
  }
  return defs;
};

// TODO(codedread): Consider moving the next to functions to bbox.js

// Get correct BBox for a path in Webkit
// Converted from code found here:
// http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
//
// Parameters:
// path - The path DOM element to get the BBox for
//
// Returns:
// A BBox-like object
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

// Get the given/selected element's bounding box object, checking for
// horizontal/vertical lines (see issue 717)
// Note that performance is currently terrible, so some way to improve would
// be great.
//
// Parameters:
// selected - Container or <use> DOM element
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
      ret = getStrokedBBox(elems); // getStrokedBBox defined in svgcanvas
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

// Get the given/selected element's bounding box object, convert it to be more
// usable when necessary
//
// Parameters:
// elem - Optional DOM element to get the BBox for
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
      ret = groupBBFix(selected, true);
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

// Create a path 'd' attribute from path segments.
// Each segment is an array of the form: [singleChar, [x,y, x,y, ...]]
//
// Parameters:
// pathSegments - An array of path segments to be converted
//
// Returns:
// The converted path d attribute.
export const getPathDFromSegments = function (pathSegments) {
  let d = '';

  $.each(pathSegments, function (j, seg) {
    const pts = seg[1];
    d += seg[0];
    for (let i = 0; i < pts.length; i += 2) {
      d += (pts[i] + ',' + pts[i + 1]) + ' ';
    }
  });

  return d;
};

// Make a path 'd' attribute from a simple SVG element shape.
//
// Parameters:
// elem - The element to be converted
//
// Returns:
// The path d attribute or `undefined` if the element type is unknown.
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

// Get a set of attributes from an element that is useful for convertToPath.
//
// Parameters:
// elem - The element to be probed
//
// Returns:
// An object with attributes.
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

// Get the BBox of an element-as-path
//
// Parameters:
// elem - The DOM element to be probed
// addSvgElementFromJson - Function to add the path element to the current layer. See canvas.addSvgElementFromJson
// pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
//
// Returns:
// The resulting path's bounding box object.
export const getBBoxOfElementAsPath = function (elem, addSvgElementFromJson, pathActions) {
  const path = addSvgElementFromJson({
    element: 'path',
    attr: getExtraAttributesForConvertToPath(elem)
  });

  const eltrans = elem.getAttribute('transform');
  if (eltrans) {
    path.setAttribute('transform', eltrans);
  }

  const parent = elem.parentNode;
  if (elem.nextSibling) {
    parent.insertBefore(path, elem);
  } else {
    parent.appendChild(path);
  }

  const d = getPathDFromElement(elem);
  if (d) path.setAttribute('d', d);
  else path.parentNode.removeChild(path);

  // Get the correct BBox of the new path, then discard it
  pathActions.resetOrientation(path);
  let bb = false;
  try {
    bb = path.getBBox();
  } catch (e) {
    // Firefox fails
  }
  path.parentNode.removeChild(path);
  return bb;
};

// Convert selected element to a path.
//
// Parameters:
// elem - The DOM element to be converted
// attrs - Apply attributes to new path. see canvas.convertToPath
// addSvgElementFromJson - Function to add the path element to the current layer. See canvas.addSvgElementFromJson
// pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
// clearSelection - see canvas.clearSelection
// addToSelection - see canvas.addToSelection
// history - see svgedit.history
// addCommandToHistory - see canvas.addCommandToHistory
//
// Returns:
// The converted path element or null if the DOM element was not recognized.
export const convertToPath = function (elem, attrs, addSvgElementFromJson, pathActions, clearSelection, addToSelection, history, addCommandToHistory) {
  const batchCmd = new history.BatchCommand('Convert element to Path');

  // Any attribute on the element not covered by the passed-in attributes
  attrs = $.extend({}, attrs, getExtraAttributesForConvertToPath(elem));

  const path = addSvgElementFromJson({
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
    parent.insertBefore(path, elem);
  } else {
    parent.appendChild(path);
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
    elem.parentNode.removeChild(elem);
    path.setAttribute('id', id);
    path.removeAttribute('visibility');
    addToSelection([path], true);

    addCommandToHistory(batchCmd);

    return path;
  } else {
    // the elem.tagName was not recognized, so no "d" attribute. Remove it, so we've haven't changed anything.
    path.parentNode.removeChild(path);
    return null;
  }
};

// Can the bbox be optimized over the native getBBox? The optimized bbox is the same as the native getBBox when
// the rotation angle is a multiple of 90 degrees and there are no complex transforms.
// Getting an optimized bbox can be dramatically slower, so we want to make sure it's worth it.
//
// The best example for this is a circle rotate 45 degrees. The circle doesn't get wider or taller when rotated
// about it's center.
//
// The standard, unoptimized technique gets the native bbox of the circle, rotates the box 45 degrees, uses
// that width and height, and applies any transforms to get the final bbox. This means the calculated bbox
// is much wider than the original circle. If the angle had been 0, 90, 180, etc. both techniques render the
// same bbox.
//
// The optimization is not needed if the rotation is a multiple 90 degrees. The default technique is to call
// getBBox then apply the angle and any transforms.
//
// Parameters:
// angle - The rotation angle in degrees
// hasMatrixTransform - True if there is a matrix transform
//
// Returns:
// True if the bbox can be optimized.
function bBoxCanBeOptimizedOverNativeGetBBox (angle, hasMatrixTransform) {
  const angleModulo90 = angle % 90;
  const closeTo90 = angleModulo90 < -89.99 || angleModulo90 > 89.99;
  const closeTo0 = angleModulo90 > -0.001 && angleModulo90 < 0.001;
  return hasMatrixTransform || !(closeTo0 || closeTo90);
}

/**
* Get bounding box that includes any transforms.
* @param elem - The DOM element to be converted
* @param  addSvgElementFromJson - Function to add the path element to the current layer. See canvas.addSvgElementFromJson
* @param  pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
* @returns A single bounding box object
*/
export const getBBoxWithTransform = function (elem, addSvgElementFromJson, pathActions) {
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
        bb = goodBb = getBBoxOfElementAsPath(elem, addSvgElementFromJson, pathActions);
      } else if (elem.tagName === 'rect') {
        // Look for radius
        const rx = elem.getAttribute('rx');
        const ry = elem.getAttribute('ry');
        if (rx || ry) {
          bb = goodBb = getBBoxOfElementAsPath(elem, addSvgElementFromJson, pathActions);
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
      // parent.appendChild(g);
      // g.appendChild(clone);
      // const bb2 = bboxToObj(g.getBBox());
      // parent.removeChild(g);
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
* Get the bounding box for one or more stroked and/or transformed elements
* @param elems - Array with DOM elements to check
* @param addSvgElementFromJson - Function to add the path element to the current layer. See canvas.addSvgElementFromJson
* @param pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
* @returns A single bounding box object
*/
export const getStrokedBBox = function (elems, addSvgElementFromJson, pathActions) {
  if (!elems || !elems.length) { return false; }

  let fullBb;
  $.each(elems, function () {
    if (fullBb) { return; }
    if (!this.parentNode) { return; }
    fullBb = getBBoxWithTransform(this, addSvgElementFromJson, pathActions);
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
      const curBb = getBBoxWithTransform(elem, addSvgElementFromJson, pathActions);
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
* Get all elements that have a BBox (excludes <defs>, <title>, etc).
* Note that 0-opacity, off-screen etc elements are still considered "visible"
* for this function
* @param parent - The parent DOM element to search within
* @returns {Array} All "visible" elements.
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
* @param elems - Array with DOM elements to check
* @returns A single bounding box object
*/
export const getStrokedBBoxDefaultVisible = function (elems) {
  if (!elems) { elems = getVisibleElements(); }
  return getStrokedBBox(
    elems,
    editorContext_.addSvgElementFromJson,
    editorContext_.pathActions
  );
};

// Get the rotation angle of the given transform list.
//
// Parameters:
// tlist - List of transforms
// toRad - Boolean that when true returns the value in radians rather than degrees
//
// Returns:
// Float with the angle in degrees or radians
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

// Get the rotation angle of the given/selected DOM element
//
// Parameters:
// elem - Optional DOM element to get the angle for
// toRad - Boolean that when true returns the value in radians rather than degrees
//
// Returns:
// Float with the angle in degrees or radians
export let getRotationAngle = function (elem, toRad) {
  const selected = elem || editorContext_.getSelectedElements()[0];
  // find the rotation transform (if any) and set it
  const tlist = getTransformList(selected);
  return getRotationAngleFromTransformList(tlist, toRad);
};

// Function getRefElem
// Get the reference element associated with the given attribute value
//
// Parameters:
// attrVal - The attribute value as a string
export const getRefElem = function (attrVal) {
  return getElem(getUrlFromAttr(attrVal).substr(1));
};

// Get a DOM element by ID within the SVG root element.
//
// Parameters:
// id - String with the element's new ID
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

// Assigns multiple attributes to an element.
//
// Parameters:
// node - DOM element to apply new attribute values to
// attrs - Object with attribute keys/values
// suspendLength - Optional integer of milliseconds to suspend redraw
// unitCheck - Boolean to indicate the need to use svgedit.units.setUnitAttr
export const assignAttributes = function (node, attrs, suspendLength, unitCheck) {
  for (const i in attrs) {
    const ns = (i.substr(0, 4) === 'xml:'
      ? NS.XML
      : i.substr(0, 6) === 'xlink:' ? NS.XLINK : null);

    if (ns) {
      node.setAttributeNS(ns, i, attrs[i]);
    } else if (!unitCheck) {
      node.setAttribute(i, attrs[i]);
    } else {
      setUnitAttr(node, i, attrs[i]);
    }
  }
};

// Remove unneeded (default) attributes, makes resulting SVG smaller
//
// Parameters:
// element - DOM element to clean up
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
    // Ellipse elements requires rx and ry attributes
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

// round value to for snapping
export const snapToGrid = function (value) {
  const unit = editorContext_.getBaseUnit();
  let stepSize = editorContext_.getSnappingStep();
  if (unit !== 'px') {
    stepSize *= getTypeMap()[unit];
  }
  value = Math.round(value / stepSize) * stepSize;
  return value;
};

export const regexEscape = function (str, delimiter) {
  // From: http://phpjs.org/functions
  return String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
};

const loadedScripts = {};
/**
* @param {string} name A global which can be used to determine if the script is already loaded
* @param {array} scripts An array of scripts to preload (in order)
* @param {function} cb The callback to execute upon load.
* @param {object} options Object with `globals` boolean property (if it is not a module)
*/
export const executeAfterLoads = function (name, scripts, cb, options = {globals: false}) {
  return function () {
    const args = arguments;
    function endCallback () {
      cb.apply(null, args);
    }
    const modularVersion = !('svgEditor' in window) ||
      !window.svgEditor ||
      window.svgEditor.modules !== false;
    if (loadedScripts[name] === true) {
      endCallback();
    } else if (Array.isArray(loadedScripts[name])) { // Still loading
      loadedScripts[name].push(endCallback);
    } else {
      loadedScripts[name] = [];
      const importer = modularVersion && !options.globals
        ? importModule
        : importScript;
      scripts.reduce(function (oldProm, script) {
        // Todo: Once `import()` and modules widely supported, switch to it
        return oldProm.then(() => importer(script));
      }, Promise.resolve()).then(function () {
        endCallback();
        loadedScripts[name].forEach((cb) => {
          cb();
        });
        loadedScripts[name] = true;
      })();
    }
  };
};

export const buildCanvgCallback = function (callCanvg) {
  return executeAfterLoads('canvg', ['canvg/rgbcolor.js', 'canvg/canvg.js'], callCanvg);
};

export const buildJSPDFCallback = function (callJSPDF) {
  return executeAfterLoads('RGBColor', ['canvg/rgbcolor.js'], () => {
    const arr = [];
    if (!RGBColor || RGBColor.ok === undefined) { // It's not our RGBColor, so we'll need to load it
      arr.push('canvg/rgbcolor.js');
    }
    executeAfterLoads('jsPDF', [
      ...arr,
      'jspdf/underscore-min.js',
      'jspdf/jspdf.min.js',
      'jspdf/jspdf.plugin.svgToPdf.js'
    ], callJSPDF, {globals: true})();
  });
};

/**
 * Prevents default browser click behaviour on the given element
 * @param img - The DOM element to prevent the click on
 */
export const preventClickDefault = function (img) {
  $(img).click(function (e) { e.preventDefault(); });
};

/**
 * Create a clone of an element, updating its ID and its children's IDs when needed
 * @param {Element} el - DOM element to clone
 * @param {function()} getNextId - function the get the next unique ID.
 * @returns {Element}
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
      newEl.appendChild(copyElem(child, getNextId));
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

// Unit testing
export const mock = ({
  getHref: getHrefUser, setHref: setHrefUser, getRotationAngle: getRotationAngleUser
}) => {
  getHref = getHrefUser;
  setHref = setHrefUser;
  getRotationAngle = getRotationAngleUser;
};
