/**
 * jQuery module to work with SVG.
 *
 * Licensed under the MIT License
 *
 */

// This fixes $(...).attr() to work as expected with SVG elements.
// Does not currently use *AttributeNS() since we rarely need that.

// See https://api.jquery.com/attr/ for basic documentation of .attr()

// Additional functionality:
// - When getting attributes, a string that's a number is returned as type number.
// - If an array is supplied as the first parameter, multiple values are returned
//    as an object with values for each given attribute

export default function ($) {
  const proxied = $.fn.attr,
    svgns = 'http://www.w3.org/2000/svg';
  $.fn.attr = function (key, value) {
    const len = this.length;
    if (!len) { return proxied.apply(this, arguments); }
    for (let i = 0; i < len; ++i) {
      const elem = this[i];
      // set/get SVG attribute
      if (elem.namespaceURI === svgns) {
        // Setting attribute
        if (value !== undefined) {
          elem.setAttribute(key, value);
        } else if (Array.isArray(key)) {
          // Getting attributes from array
          const obj = {};
          let j = key.length;

          while (j--) {
            const aname = key[j];
            let attr = elem.getAttribute(aname);
            // This returns a number when appropriate
            if (attr || attr === '0') {
              attr = isNaN(attr) ? attr : (attr - 0);
            }
            obj[aname] = attr;
          }
          return obj;
        }
        if (typeof key === 'object') {
          // Setting attributes from object
          for (const v in key) {
            elem.setAttribute(v, key[v]);
          }
        // Getting attribute
        } else {
          let attr = elem.getAttribute(key);
          if (attr || attr === '0') {
            attr = isNaN(attr) ? attr : (attr - 0);
          }
          return attr;
        }
      } else {
        return proxied.apply(this, arguments);
      }
    }
    return this;
  };
  return $;
}
