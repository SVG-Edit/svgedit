/* globals jQuery */
/**
 * Tools for svg.
 * @module svg
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import {jsPDF} from 'jspdf/dist/jspdf.es.min.js';
import 'svg2pdf.js/dist/svg2pdf.es.js';
import jQueryPluginSVG from '../common/jQuery.attr.js';
import * as hstry from './history.js';
import {
  text2xml, cleanupElement, findDefs, getHref, preventClickDefault,
  toXml, getStrokedBBoxDefaultVisible, encode64, createObjectURL,
  dataURLToObjectURL, walkTree, getBBox as utilsGetBBox
} from '../common/utilities.js';
import {
  transformPoint, transformListToTransform
} from '../common/math.js';
import {resetListMap} from '../common/svgtransformlist.js';
import {
  convertUnit, shortFloat, convertToNum
} from '../common/units.js';
import {isGecko, isChrome, isWebkit} from '../common/browser.js';
import * as pathModule from './path.js';
import {NS} from '../common/namespaces.js';
import * as draw from './draw.js';
import {
  recalculateDimensions
} from './recalculate.js';

const {
  InsertElementCommand, RemoveElementCommand,
  ChangeElementCommand, BatchCommand
} = hstry;

const $ = jQueryPluginSVG(jQuery);

let svgContext_ = null;

/**
* @function module:svg-exec.init
* @param {module:svg-exec.SvgCanvas#init} svgContext
* @returns {void}
*/
export const init = function (svgContext) {
  svgContext_ = svgContext;
};

/**
* Main function to set up the SVG content for output.
* @function module:svgcanvas.SvgCanvas#svgCanvasToString
* @returns {string} The SVG image for output
*/
export const svgCanvasToString = function () {
  // keep calling it until there are none to remove
  while (svgContext_.getCanvas().removeUnusedDefElems() > 0) {} // eslint-disable-line no-empty

  svgContext_.getCanvas().pathActions.clear(true);

  // Keep SVG-Edit comment on top
  $.each(svgContext_.getSVGContent().childNodes, function (i, node) {
    if (i && node.nodeType === 8 && node.data.includes('Created with')) {
      svgContext_.getSVGContent().firstChild.before(node);
    }
  });

  // Move out of in-group editing mode
  if (svgContext_.getCurrentGroup()) {
    draw.leaveContext();
    svgContext_.getCanvas().selectOnly([svgContext_.getCurrentGroup()]);
  }

  const nakedSvgs = [];

  // Unwrap gsvg if it has no special attributes (only id and style)
  $(svgContext_.getSVGContent()).find('g:data(gsvg)').each(function () {
    const attrs = this.attributes;
    let len = attrs.length;
    for (let i = 0; i < len; i++) {
      if (attrs[i].nodeName === 'id' || attrs[i].nodeName === 'style') {
        len--;
      }
    }
    // No significant attributes, so ungroup
    if (len <= 0) {
      const svg = this.firstChild;
      nakedSvgs.push(svg);
      $(this).replaceWith(svg);
    }
  });
  const output = this.svgToString(svgContext_.getSVGContent(), 0);

  // Rewrap gsvg
  if (nakedSvgs.length) {
    $(nakedSvgs).each(function () {
      svgContext_.getCanvas().groupSvgElem(this);
    });
  }

  return output;
};

/**
* Sub function ran on each SVG element to convert it to a string as desired.
* @function module:svgcanvas.SvgCanvas#svgToString
* @param {Element} elem - The SVG element to convert
* @param {Integer} indent - Number of spaces to indent this tag
* @returns {string} The given element as an SVG tag
*/
export const svgToString = function (elem, indent) {
  const curConfig = svgContext_.getCurConfig();
  const nsMap = svgContext_.getNsMap();
  const out = [];
  const unit = curConfig.baseUnit;
  const unitRe = new RegExp('^-?[\\d\\.]+' + unit + '$');

  if (elem) {
    cleanupElement(elem);
    const attrs = [...elem.attributes];
    const childs = elem.childNodes;
    attrs.sort((a, b) => {
      return a.name > b.name ? -1 : 1;
    });

    for (let i = 0; i < indent; i++) { out.push(' '); }
    out.push('<'); out.push(elem.nodeName);
    if (elem.id === 'svgcontent') {
      // Process root element separately
      const res = svgContext_.getCanvas().getResolution();

      const vb = '';
      // TODO: Allow this by dividing all values by current baseVal
      // Note that this also means we should properly deal with this on import
      // if (curConfig.baseUnit !== 'px') {
      //   const unit = curConfig.baseUnit;
      //   const unitM = getTypeMap()[unit];
      //   res.w = shortFloat(res.w / unitM);
      //   res.h = shortFloat(res.h / unitM);
      //   vb = ' viewBox="' + [0, 0, res.w, res.h].join(' ') + '"';
      //   res.w += unit;
      //   res.h += unit;
      // }

      if (unit !== 'px') {
        res.w = convertUnit(res.w, unit) + unit;
        res.h = convertUnit(res.h, unit) + unit;
      }

      out.push(' width="' + res.w + '" height="' + res.h + '"' + vb + ' xmlns="' + NS.SVG + '"');

      const nsuris = {};

      // Check elements for namespaces, add if found
      $(elem).find('*').andSelf().each(function () {
        // const el = this;
        // for some elements have no attribute
        const uri = this.namespaceURI;
        if (uri && !nsuris[uri] && nsMap[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
          nsuris[uri] = true;
          out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
        }

        $.each(this.attributes, function (i, attr) {
          const u = attr.namespaceURI;
          if (u && !nsuris[u] && nsMap[u] !== 'xmlns' && nsMap[u] !== 'xml') {
            nsuris[u] = true;
            out.push(' xmlns:' + nsMap[u] + '="' + u + '"');
          }
        });
      });

      let i = attrs.length;
      const attrNames = ['width', 'height', 'xmlns', 'x', 'y', 'viewBox', 'id', 'overflow'];
      while (i--) {
        const attr = attrs[i];
        const attrVal = toXml(attr.value);

        // Namespaces have already been dealt with, so skip
        if (attr.nodeName.startsWith('xmlns:')) { continue; }

        // only serialize attributes we don't use internally
        if (attrVal !== '' && !attrNames.includes(attr.localName)) {
          if (!attr.namespaceURI || nsMap[attr.namespaceURI]) {
            out.push(' ');
            out.push(attr.nodeName); out.push('="');
            out.push(attrVal); out.push('"');
          }
        }
      }
    } else {
      // Skip empty defs
      if (elem.nodeName === 'defs' && !elem.firstChild) { return ''; }

      const mozAttrs = ['-moz-math-font-style', '_moz-math-font-style'];
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        let attrVal = toXml(attr.value);
        // remove bogus attributes added by Gecko
        if (mozAttrs.includes(attr.localName)) { continue; }
        if (attrVal === 'null') {
          const styleName = attr.localName.replace(/-[a-z]/g, (s) => s[1].toUpperCase());
          if (Object.prototype.hasOwnProperty.call(elem.style, styleName)) { continue; }
        }
        if (attrVal !== '') {
          if (attrVal.startsWith('pointer-events')) { continue; }
          if (attr.localName === 'class' && attrVal.startsWith('se_')) { continue; }
          out.push(' ');
          if (attr.localName === 'd') { attrVal = svgContext_.getCanvas().pathActions.convertPath(elem, true); }
          if (!isNaN(attrVal)) {
            attrVal = shortFloat(attrVal);
          } else if (unitRe.test(attrVal)) {
            attrVal = shortFloat(attrVal) + unit;
          }

          // Embed images when saving
          if (svgContext_.getSvgOptionApply() &&
        elem.nodeName === 'image' &&
        attr.localName === 'href' &&
        svgContext_.getSvgOptionImages() &&
        svgContext_.getSvgOptionImages() === 'embed'
          ) {
            const img = svgContext_.getEncodableImages(attrVal);
            if (img) { attrVal = img; }
          }

          // map various namespaces to our fixed namespace prefixes
          // (the default xmlns attribute itself does not get a prefix)
          if (!attr.namespaceURI || attr.namespaceURI === NS.SVG || nsMap[attr.namespaceURI]) {
            out.push(attr.nodeName); out.push('="');
            out.push(attrVal); out.push('"');
          }
        }
      }
    }

    if (elem.hasChildNodes()) {
      out.push('>');
      indent++;
      let bOneLine = false;

      for (let i = 0; i < childs.length; i++) {
        const child = childs.item(i);
        switch (child.nodeType) {
        case 1: // element node
          out.push('\n');
          out.push(this.svgToString(child, indent));
          break;
        case 3: { // text node
          const str = child.nodeValue.replace(/^\s+|\s+$/g, '');
          if (str !== '') {
            bOneLine = true;
            out.push(String(toXml(str)));
          }
          break;
        } case 4: // cdata node
          out.push('\n');
          out.push(new Array(indent + 1).join(' '));
          out.push('<![CDATA[');
          out.push(child.nodeValue);
          out.push(']]>');
          break;
        case 8: // comment
          out.push('\n');
          out.push(new Array(indent + 1).join(' '));
          out.push('<!--');
          out.push(child.data);
          out.push('-->');
          break;
        } // switch on node type
      }
      indent--;
      if (!bOneLine) {
        out.push('\n');
        for (let i = 0; i < indent; i++) { out.push(' '); }
      }
      out.push('</'); out.push(elem.nodeName); out.push('>');
    } else {
      out.push('/>');
    }
  }
  return out.join('');
}; // end svgToString()

/**
* This function sets the current drawing as the input SVG XML.
* @function module:svgcanvas.SvgCanvas#setSvgString
* @param {string} xmlString - The SVG as XML text.
* @param {boolean} [preventUndo=false] - Indicates if we want to do the
* changes without adding them to the undo stack - e.g. for initializing a
* drawing on page load.
* @fires module:svgcanvas.SvgCanvas#event:setnonce
* @fires module:svgcanvas.SvgCanvas#event:unsetnonce
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {boolean} This function returns `false` if the set was
*     unsuccessful, `true` otherwise.
*/
export const setSvgString = function (xmlString, preventUndo) {
  const curConfig = svgContext_.getCurConfig();
  try {
    // convert string into XML document
    const newDoc = text2xml(xmlString);
    if (newDoc.firstElementChild &&
  newDoc.firstElementChild.namespaceURI !== NS.SVG) {
      return false;
    }

    this.prepareSvg(newDoc);

    const batchCmd = new BatchCommand('Change Source');

    // remove old svg document
    const {nextSibling} = svgContext_.getSVGContent();

    svgContext_.getSVGContent().remove();
    const oldzoom = svgContext_.getSVGContent();
    batchCmd.addSubCommand(new RemoveElementCommand(oldzoom, nextSibling, svgContext_.getSVGRoot()));

    // set new svg document
    // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
    if (svgContext_.getDOMDocument().adoptNode) {
      svgContext_.setSVGContent(svgContext_.getDOMDocument().adoptNode(newDoc.documentElement));
    } else {
      svgContext_.setSVGContent(svgContext_.getDOMDocument().importNode(newDoc.documentElement, true));
    }

    svgContext_.getSVGRoot().append(svgContext_.getSVGContent());
    const content = $(svgContext_.getSVGContent());

    svgContext_.getCanvas().current_drawing_ = new draw.Drawing(svgContext_.getSVGContent(), svgContext_.getIdPrefix());

    // retrieve or set the nonce
    const nonce = svgContext_.getCanvas().getCurrentDrawing().getNonce();
    if (nonce) {
      svgContext_.call('setnonce', nonce);
    } else {
      svgContext_.call('unsetnonce');
    }

    // change image href vals if possible
    content.find('image').each(function () {
      const image = this;
      preventClickDefault(image);
      const val = svgContext_.getCanvas().getHref(this);
      if (val) {
        if (val.startsWith('data:')) {
          // Check if an SVG-edit data URI
          const m = val.match(/svgedit_url=(.*?);/);
          // const m = val.match(/svgedit_url=(?<url>.*?);/);
          if (m) {
            const url = decodeURIComponent(m[1]);
            // const url = decodeURIComponent(m.groups.url);
            $(new Image()).load(function () {
              image.setAttributeNS(NS.XLINK, 'xlink:href', url);
            }).attr('src', url);
          }
        }
        // Add to encodableImages if it loads
        svgContext_.getCanvas().embedImage(val);
      }
    });

    // Wrap child SVGs in group elements
    content.find('svg').each(function () {
      // Skip if it's in a <defs>
      if ($(this).closest('defs').length) { return; }

      svgContext_.getCanvas().uniquifyElems(this);

      // Check if it already has a gsvg group
      const pa = this.parentNode;
      if (pa.childNodes.length === 1 && pa.nodeName === 'g') {
        $(pa).data('gsvg', this);
        pa.id = pa.id || svgContext_.getCanvas().getNextId();
      } else {
        svgContext_.getCanvas().groupSvgElem(this);
      }
    });

    // For Firefox: Put all paint elems in defs
    if (isGecko()) {
      content.find('linearGradient, radialGradient, pattern').appendTo(findDefs());
    }

    // Set ref element for <use> elements

    // TODO: This should also be done if the object is re-added through "redo"
    svgContext_.getCanvas().setUseData(content);

    svgContext_.getCanvas().convertGradients(content[0]);

    const attrs = {
      id: 'svgcontent',
      overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden'
    };

    let percs = false;

    // determine proper size
    if (content.attr('viewBox')) {
      const vb = content.attr('viewBox').split(' ');
      attrs.width = vb[2];
      attrs.height = vb[3];
      // handle content that doesn't have a viewBox
    } else {
      $.each(['width', 'height'], function (i, dim) {
        // Set to 100 if not given
        const val = content.attr(dim) || '100%';

        if (String(val).substr(-1) === '%') {
          // Use user units if percentage given
          percs = true;
        } else {
          attrs[dim] = convertToNum(dim, val);
        }
      });
    }

    // identify layers
    draw.identifyLayers();

    // Give ID for any visible layer children missing one
    content.children().find(svgContext_.getVisElems()).each(function () {
      if (!this.id) { this.id = svgContext_.getCanvas().getNextId(); }
    });

    // Percentage width/height, so let's base it on visible elements
    if (percs) {
      const bb = getStrokedBBoxDefaultVisible();
      attrs.width = bb.width + bb.x;
      attrs.height = bb.height + bb.y;
    }

    // Just in case negative numbers are given or
    // result from the percs calculation
    if (attrs.width <= 0) { attrs.width = 100; }
    if (attrs.height <= 0) { attrs.height = 100; }

    content.attr(attrs);
    this.contentW = attrs.width;
    this.contentH = attrs.height;

    batchCmd.addSubCommand(new InsertElementCommand(svgContext_.getSVGContent()));
    // update root to the correct size
    const changes = content.attr(['width', 'height']);
    batchCmd.addSubCommand(new ChangeElementCommand(svgContext_.getSVGRoot(), changes));

    // reset zoom
    svgContext_.setCurrentZoom(1);

    // reset transform lists
    resetListMap();
    svgContext_.getCanvas().clearSelection();
    pathModule.clearData();
    svgContext_.getSVGRoot().append(svgContext_.getCanvas().selectorManager.selectorParentGroup);

    if (!preventUndo) svgContext_.addCommandToHistory(batchCmd);
    svgContext_.call('changed', [svgContext_.getSVGContent()]);
  } catch (e) {
    console.log(e); // eslint-disable-line no-console
    return false;
  }

  return true;
};

/**
* This function imports the input SVG XML as a `<symbol>` in the `<defs>`, then adds a
* `<use>` to the current layer.
* @function module:svgcanvas.SvgCanvas#importSvgString
* @param {string} xmlString - The SVG as XML text.
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {null|Element} This function returns null if the import was unsuccessful, or the element otherwise.
* @todo
* - properly handle if namespace is introduced by imported content (must add to svgcontent
* and update all prefixes in the imported node)
* - properly handle recalculating dimensions, `recalculateDimensions()` doesn't handle
* arbitrary transform lists, but makes some assumptions about how the transform list
* was obtained
*/
export const importSvgString = function (xmlString) {
  let j, ts, useEl;
  try {
    // Get unique ID
    const uid = encode64(xmlString.length + xmlString).substr(0, 32);

    let useExisting = false;
    // Look for symbol and make sure symbol exists in image
    if (svgContext_.getImportIds(uid)) {
      if ($(svgContext_.getImportIds(uid).symbol).parents('#svgroot').length) {
        useExisting = true;
      }
    }

    const batchCmd = new BatchCommand('Import Image');
    let symbol;
    if (useExisting) {
      ({symbol} = svgContext_.getImportIds());
      ts = svgContext_.getImportIds(uid).xform;
    } else {
      // convert string into XML document
      const newDoc = text2xml(xmlString);

      this.prepareSvg(newDoc);

      // import new svg document into our document
      // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
      const svg = svgContext_.getDOMDocument().adoptNode
        ? svgContext_.getDOMDocument().adoptNode(newDoc.documentElement)
        : svgContext_.getDOMDocument().importNode(newDoc.documentElement, true);

      svgContext_.getCanvas().uniquifyElems(svg);

      const innerw = convertToNum('width', svg.getAttribute('width')),
        innerh = convertToNum('height', svg.getAttribute('height')),
        innervb = svg.getAttribute('viewBox'),
        // if no explicit viewbox, create one out of the width and height
        vb = innervb ? innervb.split(' ') : [0, 0, innerw, innerh];
      for (j = 0; j < 4; ++j) {
        vb[j] = Number(vb[j]);
      }

      // TODO: properly handle preserveAspectRatio
      const // canvasw = +svgcontent.getAttribute('width'),
        canvash = Number(svgContext_.getSVGContent().getAttribute('height'));
      // imported content should be 1/3 of the canvas on its largest dimension

      ts = innerh > innerw ? 'scale(' + (canvash / 3) / vb[3] + ')' : 'scale(' + (canvash / 3) / vb[2] + ')';

      // Hack to make recalculateDimensions understand how to scale
      ts = 'translate(0) ' + ts + ' translate(0)';

      symbol = svgContext_.getDOMDocument().createElementNS(NS.SVG, 'symbol');
      const defs = findDefs();

      if (isGecko()) {
        // Move all gradients into root for Firefox, workaround for this bug:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=353575
        // TODO: Make this properly undo-able.
        $(svg).find('linearGradient, radialGradient, pattern').appendTo(defs);
      }

      while (svg.firstChild) {
        const first = svg.firstChild;
        symbol.append(first);
      }
      const attrs = svg.attributes;
      for (const attr of attrs) { // Ok for `NamedNodeMap`
        symbol.setAttribute(attr.nodeName, attr.value);
      }
      symbol.id = svgContext_.getCanvas().getNextId();

      // Store data
      svgContext_.setImportIds(uid, {
        symbol,
        xform: ts
      });

      findDefs().append(symbol);
      batchCmd.addSubCommand(new InsertElementCommand(symbol));
    }

    useEl = svgContext_.getDOMDocument().createElementNS(NS.SVG, 'use');
    useEl.id = svgContext_.getCanvas().getNextId();
    svgContext_.getCanvas().setHref(useEl, '#' + symbol.id);

    (svgContext_.getCurrentGroup() || svgContext_.getCanvas().getCurrentDrawing().getCurrentLayer()).append(useEl);
    batchCmd.addSubCommand(new InsertElementCommand(useEl));
    svgContext_.getCanvas().clearSelection();

    useEl.setAttribute('transform', ts);
    recalculateDimensions(useEl);
    $(useEl).data('symbol', symbol).data('ref', symbol);
    svgContext_.getCanvas().addToSelection([useEl]);

    // TODO: Find way to add this in a recalculateDimensions-parsable way
    // if (vb[0] !== 0 || vb[1] !== 0) {
    //   ts = 'translate(' + (-vb[0]) + ',' + (-vb[1]) + ') ' + ts;
    // }
    svgContext_.addCommandToHistory(batchCmd);
    svgContext_.call('changed', [svgContext_.getSVGContent()]);
  } catch (e) {
    console.log(e); // eslint-disable-line no-console
    return null;
  }

  // we want to return the element so we can automatically select it
  return useEl;
};
/**
 * Function to run when image data is found.
 * @callback module:svgcanvas.ImageEmbeddedCallback
 * @param {string|false} result Data URL
 * @returns {void}
 */
/**
* Converts a given image file to a data URL when possible, then runs a given callback.
* @function module:svgcanvas.SvgCanvas#embedImage
* @param {string} src - The path/URL of the image
* @returns {Promise<string|false>} Resolves to a Data URL (string|false)
*/
export const embedImage = function (src) {
  // Todo: Remove this Promise in favor of making an async/await `Image.load` utility
  // eslint-disable-next-line promise/avoid-new
  return new Promise(function (resolve, reject) {
    // load in the image and once it's loaded, get the dimensions
    $(new Image()).load(function (response, status, xhr) {
      if (status === 'error') {
        reject(new Error('Error loading image: ' + xhr.status + ' ' + xhr.statusText));
        return;
      }
      // create a canvas the same size as the raster image
      const cvs = document.createElement('canvas');
      cvs.width = this.width;
      cvs.height = this.height;
      // load the raster image into the canvas
      cvs.getContext('2d').drawImage(this, 0, 0);
      // retrieve the data: URL
      try {
        let urldata = ';svgedit_url=' + encodeURIComponent(src);
        urldata = cvs.toDataURL().replace(';base64', urldata + ';base64');
        svgContext_.setEncodableImages(src, urldata);
      } catch (e) {
        svgContext_.setEncodableImages(src, false);
      }
      svgContext_.getCanvas().setGoodImage(src);
      resolve(svgContext_.getEncodableImages(src));
    }).attr('src', src);
  });
};

/**
* Serializes the current drawing into SVG XML text and passes it to the 'saved' handler.
* This function also includes the XML prolog. Clients of the `SvgCanvas` bind their save
* function to the 'saved' event.
* @function module:svgcanvas.SvgCanvas#save
* @param {module:svgcanvas.SaveOptions} opts
* @fires module:svgcanvas.SvgCanvas#event:saved
* @returns {void}
*/
export const save = function (opts) {
  // remove the selected outline before serializing
  svgContext_.getCanvas().clearSelection();
  // Update save options if provided
  if (opts) { $.extend(svgContext_.getSvgOption(), opts); }
  svgContext_.setSvgOption('apply', true);

  // no need for doctype, see https://jwatt.org/svg/authoring/#doctype-declaration
  const str = svgContext_.getCanvas().svgCanvasToString();
  svgContext_.call('saved', str);
};
/**
* @typedef {PlainObject} module:svgcanvas.IssuesAndCodes
* @property {string[]} issueCodes The locale-independent code names
* @property {string[]} issues The localized descriptions
*/

/**
* Codes only is useful for locale-independent detection.
* @returns {module:svgcanvas.IssuesAndCodes}
*/
function getIssues () {
  const uiStrings = svgContext_.getUIStrings();
  // remove the selected outline before serializing
  svgContext_.getCanvas().clearSelection();

  // Check for known CanVG issues
  const issues = [];
  const issueCodes = [];

  // Selector and notice
  const issueList = {
    feGaussianBlur: uiStrings.exportNoBlur,
    foreignObject: uiStrings.exportNoforeignObject,
    '[stroke-dasharray]': uiStrings.exportNoDashArray
  };
  const content = $(svgContext_.getSVGContent());

  // Add font/text check if Canvas Text API is not implemented
  if (!('font' in $('<canvas>')[0].getContext('2d'))) {
    issueList.text = uiStrings.exportNoText;
  }

  $.each(issueList, function (sel, descr) {
    if (content.find(sel).length) {
      issueCodes.push(sel);
      issues.push(descr);
    }
  });
  return {issues, issueCodes};
}
/**
* @typedef {PlainObject} module:svgcanvas.ImageExportedResults
* @property {string} datauri Contents as a Data URL
* @property {string} bloburl May be the empty string
* @property {string} svg The SVG contents as a string
* @property {string[]} issues The localization messages of `issueCodes`
* @property {module:svgcanvas.IssueCode[]} issueCodes CanVG issues found with the SVG
* @property {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} type The chosen image type
* @property {"image/png"|"image/jpeg"|"image/bmp"|"image/webp"} mimeType The image MIME type
* @property {Float} quality A decimal between 0 and 1 (for use with JPEG or WEBP)
* @property {string} exportWindowName A convenience for passing along a `window.name` to target a window on which the export could be added
*/

/**
* Generates a PNG (or JPG, BMP, WEBP) Data URL based on the current image,
* then calls "exported" with an object including the string, image
* information, and any issues found.
* @function module:svgcanvas.SvgCanvas#rasterExport
* @param {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} [imgType="PNG"]
* @param {Float} [quality] Between 0 and 1
* @param {string} [exportWindowName]
* @param {PlainObject} [opts]
* @param {boolean} [opts.avoidEvent]
* @fires module:svgcanvas.SvgCanvas#event:exported
* @todo Confirm/fix ICO type
* @returns {Promise<module:svgcanvas.ImageExportedResults>} Resolves to {@link module:svgcanvas.ImageExportedResults}
*/
export const rasterExport = async function (imgType, quality, exportWindowName, opts = {}) {
  const type = imgType === 'ICO' ? 'BMP' : (imgType || 'PNG');
  const mimeType = 'image/' + type.toLowerCase();
  const {issues, issueCodes} = getIssues();
  const svg = this.svgCanvasToString();

  if (!$('#export_canvas').length) {
    $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
  }
  const c = $('#export_canvas')[0];
  c.width = svgContext_.getCanvas().contentW;
  c.height = svgContext_.getCanvas().contentH;
  const canvg = svgContext_.getcanvg();
  await canvg(c, svg);
  // Todo: Make async/await utility in place of `toBlob`, so we can remove this constructor
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    const dataURLType = type.toLowerCase();
    const datauri = quality
      ? c.toDataURL('image/' + dataURLType, quality)
      : c.toDataURL('image/' + dataURLType);
    let bloburl;
    /**
 * Called when `bloburl` is available for export.
 * @returns {void}
 */
    function done () {
      const obj = {
        datauri, bloburl, svg, issues, issueCodes, type: imgType,
        mimeType, quality, exportWindowName
      };
      if (!opts.avoidEvent) {
        svgContext_.call('exported', obj);
      }
      resolve(obj);
    }
    if (c.toBlob) {
      c.toBlob((blob) => {
        bloburl = createObjectURL(blob);
        done();
      }, mimeType, quality);
      return;
    }
    bloburl = dataURLToObjectURL(datauri);
    done();
  });
};

/**
* @typedef {void|"save"|"arraybuffer"|"blob"|"datauristring"|"dataurlstring"|"dataurlnewwindow"|"datauri"|"dataurl"} external:jsPDF.OutputType
* @todo Newer version to add also allows these `outputType` values "bloburi"|"bloburl" which return strings, so document here and for `outputType` of `module:svgcanvas.PDFExportedResults` below if added
*/
/**
* @typedef {PlainObject} module:svgcanvas.PDFExportedResults
* @property {string} svg The SVG PDF output
* @property {string|ArrayBuffer|Blob|window} output The output based on the `outputType`;
* if `undefined`, "datauristring", "dataurlstring", "datauri",
* or "dataurl", will be a string (`undefined` gives a document, while the others
* build as Data URLs; "datauri" and "dataurl" change the location of the current page); if
* "arraybuffer", will return `ArrayBuffer`; if "blob", returns a `Blob`;
* if "dataurlnewwindow", will change the current page's location and return a string
* if in Safari and no window object is found; otherwise opens in, and returns, a new `window`
* object; if "save", will have the same return as "dataurlnewwindow" if
* `navigator.getUserMedia` support is found without `URL.createObjectURL` support; otherwise
* returns `undefined` but attempts to save
* @property {external:jsPDF.OutputType} outputType
* @property {string[]} issues The human-readable localization messages of corresponding `issueCodes`
* @property {module:svgcanvas.IssueCode[]} issueCodes
* @property {string} exportWindowName
*/

/**
* Generates a PDF based on the current image, then calls "exportedPDF" with
* an object including the string, the data URL, and any issues found.
* @function module:svgcanvas.SvgCanvas#exportPDF
* @param {string} [exportWindowName] Will also be used for the download file name here
* @param {external:jsPDF.OutputType} [outputType="dataurlstring"]
* @fires module:svgcanvas.SvgCanvas#event:exportedPDF
* @returns {Promise<module:svgcanvas.PDFExportedResults>} Resolves to {@link module:svgcanvas.PDFExportedResults}
*/
export const exportPDF = async (
  exportWindowName,
  outputType = isChrome() ? 'save' : undefined
) => {
  const res = svgContext_.getCanvas().getResolution();
  const orientation = res.w > res.h ? 'landscape' : 'portrait';
  const unit = 'pt'; // curConfig.baseUnit; // We could use baseUnit, but that is presumably not intended for export purposes

  // Todo: Give options to use predefined jsPDF formats like "a4", etc. from pull-down (with option to keep customizable)
  const doc = jsPDF({
    orientation,
    unit,
    format: [res.w, res.h]
    // , compressPdf: true
  });
  const docTitle = svgContext_.getCanvas().getDocumentTitle();
  doc.setProperties({
    title: docTitle /* ,
    subject: '',
    author: '',
    keywords: '',
    creator: '' */
  });
  const {issues, issueCodes} = getIssues();
  // const svg = this.svgCanvasToString();
  // await doc.addSvgAsImage(svg)
  await doc.svg(svgContext_.getSVGContent(), {x: 0, y: 0, width: res.w, height: res.h});

  // doc.output('save'); // Works to open in a new
  //  window; todo: configure this and other export
  //  options to optionally work in this manner as
  //  opposed to opening a new tab
  outputType = outputType || 'dataurlstring';
  const obj = {issues, issueCodes, exportWindowName, outputType};
  obj.output = doc.output(outputType, outputType === 'save' ? (exportWindowName || 'svg.pdf') : undefined);
  svgContext_.call('exportedPDF', obj);
  return obj;
};
/**
* Ensure each element has a unique ID.
* @function module:svgcanvas.SvgCanvas#uniquifyElems
* @param {Element} g - The parent element of the tree to give unique IDs
* @returns {void}
*/
export const uniquifyElemsMethod = function (g) {
  const ids = {};
  // TODO: Handle markers and connectors. These are not yet re-identified properly
  // as their referring elements do not get remapped.
  //
  // <marker id='se_marker_end_svg_7'/>
  // <polyline id='svg_7' se:connector='svg_1 svg_6' marker-end='url(#se_marker_end_svg_7)'/>
  //
  // Problem #1: if svg_1 gets renamed, we do not update the polyline's se:connector attribute
  // Problem #2: if the polyline svg_7 gets renamed, we do not update the marker id nor the polyline's marker-end attribute
  const refElems = ['filter', 'linearGradient', 'pattern', 'radialGradient', 'symbol', 'textPath', 'use'];

  walkTree(g, function (n) {
    // if it's an element node
    if (n.nodeType === 1) {
      // and the element has an ID
      if (n.id) {
        // and we haven't tracked this ID yet
        if (!(n.id in ids)) {
          // add this id to our map
          ids[n.id] = {elem: null, attrs: [], hrefs: []};
        }
        ids[n.id].elem = n;
      }

      // now search for all attributes on this element that might refer
      // to other elements
      $.each(svgContext_.getrefAttrs(), function (i, attr) {
        const attrnode = n.getAttributeNode(attr);
        if (attrnode) {
          // the incoming file has been sanitized, so we should be able to safely just strip off the leading #
          const url = svgContext_.getCanvas().getUrlFromAttr(attrnode.value),
            refid = url ? url.substr(1) : null;
          if (refid) {
            if (!(refid in ids)) {
              // add this id to our map
              ids[refid] = {elem: null, attrs: [], hrefs: []};
            }
            ids[refid].attrs.push(attrnode);
          }
        }
      });

      // check xlink:href now
      const href = svgContext_.getCanvas().getHref(n);
      // TODO: what if an <image> or <a> element refers to an element internally?
      if (href && refElems.includes(n.nodeName)) {
        const refid = href.substr(1);
        if (refid) {
          if (!(refid in ids)) {
            // add this id to our map
            ids[refid] = {elem: null, attrs: [], hrefs: []};
          }
          ids[refid].hrefs.push(n);
        }
      }
    }
  });

  // in ids, we now have a map of ids, elements and attributes, let's re-identify
  for (const oldid in ids) {
    if (!oldid) { continue; }
    const {elem} = ids[oldid];
    if (elem) {
      const newid = svgContext_.getCanvas().getNextId();

      // assign element its new id
      elem.id = newid;

      // remap all url() attributes
      const {attrs} = ids[oldid];
      let j = attrs.length;
      while (j--) {
        const attr = attrs[j];
        attr.ownerElement.setAttribute(attr.name, 'url(#' + newid + ')');
      }

      // remap all href attributes
      const hreffers = ids[oldid].hrefs;
      let k = hreffers.length;
      while (k--) {
        const hreffer = hreffers[k];
        svgContext_.getCanvas().setHref(hreffer, '#' + newid);
      }
    }
  }
};

/**
* Assigns reference data for each use element.
* @function module:svgcanvas.SvgCanvas#setUseData
* @param {Element} parent
* @returns {void}
*/
export const setUseDataMethod = function (parent) {
  let elems = $(parent);

  if (parent.tagName !== 'use') {
    elems = elems.find('use');
  }

  elems.each(function () {
    const id = svgContext_.getCanvas().getHref(this).substr(1);
    const refElem = svgContext_.getCanvas().getElem(id);
    if (!refElem) { return; }
    $(this).data('ref', refElem);
    if (refElem.tagName === 'symbol' || refElem.tagName === 'svg') {
      $(this).data('symbol', refElem).data('ref', refElem);
    }
  });
};

/**
* Looks at DOM elements inside the `<defs>` to see if they are referred to,
* removes them from the DOM if they are not.
* @function module:svgcanvas.SvgCanvas#removeUnusedDefElems
* @returns {Integer} The number of elements that were removed
*/
export const removeUnusedDefElemsMethod = function () {
  const defs = svgContext_.getSVGContent().getElementsByTagNameNS(NS.SVG, 'defs');
  if (!defs || !defs.length) { return 0; }

  // if (!defs.firstChild) { return; }

  const defelemUses = [];
  let numRemoved = 0;
  const attrs = ['fill', 'stroke', 'filter', 'marker-start', 'marker-mid', 'marker-end'];
  const alen = attrs.length;

  const allEls = svgContext_.getSVGContent().getElementsByTagNameNS(NS.SVG, '*');
  const allLen = allEls.length;

  let i, j;
  for (i = 0; i < allLen; i++) {
    const el = allEls[i];
    for (j = 0; j < alen; j++) {
      const ref = svgContext_.getCanvas().getUrlFromAttr(el.getAttribute(attrs[j]));
      if (ref) {
        defelemUses.push(ref.substr(1));
      }
    }

    // gradients can refer to other gradients
    const href = getHref(el);
    if (href && href.startsWith('#')) {
      defelemUses.push(href.substr(1));
    }
  }

  const defelems = $(defs).find('linearGradient, radialGradient, filter, marker, svg, symbol');
  i = defelems.length;
  while (i--) {
    const defelem = defelems[i];
    const {id} = defelem;
    if (!defelemUses.includes(id)) {
      // Not found, so remove (but remember)
      svgContext_.setRemovedElements(id, defelem);
      defelem.remove();
      numRemoved++;
    }
  }

  return numRemoved;
};
/**
* Converts gradients from userSpaceOnUse to objectBoundingBox.
* @function module:svgcanvas.SvgCanvas#convertGradients
* @param {Element} elem
* @returns {void}
*/
export const convertGradientsMethod = function (elem) {
  let elems = $(elem).find('linearGradient, radialGradient');
  if (!elems.length && isWebkit()) {
    // Bug in webkit prevents regular *Gradient selector search
    elems = $(elem).find('*').filter(function () {
      return (this.tagName.includes('Gradient'));
    });
  }

  elems.each(function () {
    const grad = this;
    if ($(grad).attr('gradientUnits') === 'userSpaceOnUse') {
      const svgcontent = svgContext_.getSVGContent();
      // TODO: Support more than one element with this ref by duplicating parent grad
      const fillStrokeElems = $(svgcontent).find('[fill="url(#' + grad.id + ')"],[stroke="url(#' + grad.id + ')"]');
      if (!fillStrokeElems.length) { return; }

      // get object's bounding box
      const bb = utilsGetBBox(fillStrokeElems[0]);

      // This will occur if the element is inside a <defs> or a <symbol>,
      // in which we shouldn't need to convert anyway.
      if (!bb) { return; }

      if (grad.tagName === 'linearGradient') {
        const gCoords = $(grad).attr(['x1', 'y1', 'x2', 'y2']);

        // If has transform, convert
        const tlist = grad.gradientTransform.baseVal;
        if (tlist && tlist.numberOfItems > 0) {
          const m = transformListToTransform(tlist).matrix;
          const pt1 = transformPoint(gCoords.x1, gCoords.y1, m);
          const pt2 = transformPoint(gCoords.x2, gCoords.y2, m);

          gCoords.x1 = pt1.x;
          gCoords.y1 = pt1.y;
          gCoords.x2 = pt2.x;
          gCoords.y2 = pt2.y;
          grad.removeAttribute('gradientTransform');
        }

        $(grad).attr({
          x1: (gCoords.x1 - bb.x) / bb.width,
          y1: (gCoords.y1 - bb.y) / bb.height,
          x2: (gCoords.x2 - bb.x) / bb.width,
          y2: (gCoords.y2 - bb.y) / bb.height
        });
        grad.removeAttribute('gradientUnits');
      }
      // else {
      //   Note: radialGradient elements cannot be easily converted
      //   because userSpaceOnUse will keep circular gradients, while
      //   objectBoundingBox will x/y scale the gradient according to
      //   its bbox.
      //
      //   For now we'll do nothing, though we should probably have
      //   the gradient be updated as the element is moved, as
      //   inkscape/illustrator do.
      //
      //   const gCoords = $(grad).attr(['cx', 'cy', 'r']);
      //
      //   $(grad).attr({
      //     cx: (gCoords.cx - bb.x) / bb.width,
      //     cy: (gCoords.cy - bb.y) / bb.height,
      //     r: gCoords.r
      //   });
      //
      //   grad.removeAttribute('gradientUnits');
      // }
    }
  });
};
