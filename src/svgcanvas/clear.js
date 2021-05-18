/**
 * Tools for clear.
 * @module clear
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import { NS } from '../common/namespaces.js';

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
  const { dimensions } = curConfig;
  const el = clearContext_.getSVGContent();
  // empty()
  while(el.firstChild)
    el.removeChild(el.firstChild);

  // TODO: Clear out all other attributes first?
  const pel = clearContext_.getSVGRoot();
  el.setAttribute('id', 'svgcontent');
  el.setAttribute('width', dimensions[0]);
  el.setAttribute('height', dimensions[1]);
  el.setAttribute('x', dimensions[0]);
  el.setAttribute('y', dimensions[1]);
  el.setAttribute('overflow', curConfig.show_outside_canvas ? 'visible' : 'hidden');
  el.setAttribute('xmlns', NS.SVG);
  el.setAttribute('xmlns:se', NS.SE);
  el.setAttribute('xmlns:xlink', NS.XLINK);
  pel.appendChild(el);

  // TODO: make this string optional and set by the client
  const comment = clearContext_.getDOMDocument().createComment(' Created with SVG-edit - https://github.com/SVG-Edit/svgedit');
  clearContext_.getSVGContent().append(comment);
};
