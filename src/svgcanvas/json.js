/**
 * Tools for SVG Root Element.
 * @module svgcanvas
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

/**
* getJsonFromSvgElements: Iterate element and return json format
* @function module:svgcanvas.getJsonFromSvgElements
* @param {ArgumentsArray} data - element
* @returns {svgRootElement}
*/
export const getJsonFromSvgElements = function (data) {
  // Text node
  if (data.nodeType === 3) return data.nodeValue;

  const retval = {
    element: data.tagName,
    // namespace: nsMap[data.namespaceURI],
    attr: {},
    children: []
  };

  // Iterate attributes
  for (let i = 0, attr; (attr = data.attributes[i]); i++) {
    retval.attr[attr.name] = attr.value;
  }

  // Iterate children
  for (let i = 0, node; (node = data.childNodes[i]); i++) {
    retval.children[i] = getJsonFromSvgElements(node);
  }

  return retval;
};
