/**
 * Tools for clear.
 * @module clear
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

export const clearSvgContentElementInit = function () {
    $(svgcontent).empty();

    // TODO: Clear out all other attributes first?
    $(svgcontent).attr({
      id: 'svgcontent',
      width: dimensions[0],
      height: dimensions[1],
      x: dimensions[0],
      y: dimensions[1],
      overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden',
      xmlns: NS.SVG,
      'xmlns:se': NS.SE,
      'xmlns:xlink': NS.XLINK
    }).appendTo(svgroot);

    // TODO: make this string optional and set by the client
    const comment = svgdoc.createComment(' Created with SVG-edit - https://github.com/SVG-Edit/svgedit');
    svgcontent.append(comment);
};
