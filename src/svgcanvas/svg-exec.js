/**
 * Tools for svg.
 * @module svg
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import jQueryPluginSVG from '../common/jQuery.attr.js';
import * as hstry from './history.js';
import {
  text2xml, cleanupElement, findDefs, getHref, preventClickDefault,
  toXml, getStrokedBBoxDefaultVisible, encode64
} from '../common/utilities.js';
import {resetListMap} from '../common/svgtransformlist.js';
import {
  convertUnit, shortFloat, convertToNum
} from '../common/units.js';
import {isGecko} from '../common/browser.js';
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

let $ = jQueryPluginSVG(jQuery);

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
      const val = getHref(this);
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
      let svg;
      // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
      if (svgContext_.getDOMDocument().adoptNode) {
        svg = svgContext_.getDOMDocument().adoptNode(newDoc.documentElement);
      } else {
        svg = svgContext_.getDOMDocument().importNode(newDoc.documentElement, true);
      }

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

      if (innerh > innerw) {
        ts = 'scale(' + (canvash / 3) / vb[3] + ')';
      } else {
        ts = 'scale(' + (canvash / 3) / vb[2] + ')';
      }

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
