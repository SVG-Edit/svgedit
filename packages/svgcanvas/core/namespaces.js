/**
 * Namespaces or tools therefor.
 * @module namespaces
 * @license MIT
*/

/**
* Common namespaces constants in alpha order.
* @enum {string}
* @type {PlainObject}
* @memberof module:namespaces
*/
export const NS = {
  HTML: 'http://www.w3.org/1999/xhtml',
  MATH: 'http://www.w3.org/1998/Math/MathML',
  SE: 'http://svg-edit.googlecode.com',
  SVG: 'http://www.w3.org/2000/svg',
  XLINK: 'http://www.w3.org/1999/xlink',
  OI: 'http://www.optimistik.fr/namespace/svg/OIdata',
  XML: 'http://www.w3.org/XML/1998/namespace',
  XMLNS: 'http://www.w3.org/2000/xmlns/' // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
  // SODIPODI: 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
  // INKSCAPE: 'http://www.inkscape.org/namespaces/inkscape',
  // RDF: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  // OSB: 'http://www.openswatchbook.org/uri/2009/osb',
  // CC: 'http://creativecommons.org/ns#',
  // DC: 'http://purl.org/dc/elements/1.1/'
}

/**
* @function module:namespaces.getReverseNS
* @returns {PlainObject<string, string>} The namespace URI map with values swapped to their lowercase keys
*/
export const getReverseNS = () => {
  const reverseNS = {}
  for (const [name, URI] of Object.entries(NS)) {
    reverseNS[URI] = name.toLowerCase()
  }
  return reverseNS
}
