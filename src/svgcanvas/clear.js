/* globals jQuery */
/**
 * Tools for clear.
 * @module clear
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import jQueryPluginSVG from '../common/jQuery.attr.js';
import {NS} from '../common/namespaces.js';

const $ = jQueryPluginSVG(jQuery);

let clearContext_ = null;

/**
* @function module:clear.init
* @param {module:clear.SvgCanvas#init} clearContext
* @returns {void}
*/
export const init = function (clearContext) {
  clearContext_ = clearContext;
};

export const clearSvgContentElementInit = function () {
  const curConfig = clearContext_.getCurConfig();
  const {dimensions} = curConfig;
  $(clearContext_.getSVGContent()).empty();

  // TODO: Clear out all other attributes first?
  $(clearContext_.getSVGContent()).attr({
    id: 'svgcontent',
    width: dimensions[0],
    height: dimensions[1],
    x: dimensions[0],
    y: dimensions[1],
    overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden',
    xmlns: NS.SVG,
    'xmlns:se': NS.SE,
    'xmlns:xlink': NS.XLINK
  }).appendTo(clearContext_.getSVGRoot());

  // TODO: make this string optional and set by the client
  const comment = clearContext_.getDOMDocument().createComment(' Created with SVG-edit - https://github.com/SVG-Edit/svgedit');
  clearContext_.getSVGContent().append(comment);
};
