SVG Element and Attribute Whitelist

I apologize up-front for the poor format of this table, I blame the wiki markup allowed in Google Code.

Anything not listed here is not supported by SVG-edit and will be stripped out upon import. SVG-edit supports the following elements and attributes:

| Element | Attributes | |:------------|:---------------| | All Elements | class, filter, id, requiredFeatures, style, systemLanguage | | All Shapes | clip-path, fill, fill-opacity, fill-rule, marker-end, marker-mid, marker-start, pattern, stroke, stroke-dasharray, stroke-dashoffset, stroke-linecap, stroke-linejoin, stroke-miterlimit, stroke-opacity, stroke-width, transform | | a | xlink:href | | circle | cx, cy, r | | clipPath | clipPathUnits | | defs | | | desc | | | ellipse | cx, cy, rx, ry | | feGaussianBlur | stdDeviation | | filter | filterRes, filterUnits, height, primitiveUnits, width, x, xlink:href, y | | g | | | image | xlink:href, xlink:title | | line | x1, x2, y1, y2 | | linearGradient | gradientTransform, gradientUnits, spreadMethod, x1, x2, y1, y2 | | marker | markerHeight, markerUnits, markerWidth, orient, refX, refY | | path | d | | pattern | height, patternContentUnits, patternTransform, patternUnits, width, x, xlink:href, y | | polygon | points | | polyline | points | | radialGradient | cx, cy, fx, fy, gradientTransform, gradientUnits, r, spreadMethod | | stop | offset, stop-color, stop-opacity | | symbol | preserveAspectRatio, viewBox | | svg | height, preserveAspectRatio, viewBox, width, xmlns, xmlns:xlink | | switch | | | rect | height, rx, ry, width, x, y | | text | font-size, font-family, font-style, font-weight, text-anchor, x, xml:space, y | | textPath | method, spacing, startOffset, xlink:href | | tspan | dx, dy, rotate, textLength, x, y | | title | | | use | height, width, x, xlink:href, y |
Non-Editable Items

At this time, the following attributes cannot be edited in the user interface of SVG-edit (but they can be tweaked using the SVG source editor within SVG-edit):

    fill-rule
    stroke-dashoffset
    stroke-miterlimit
    xlink:href on a use element

In addition, there is no way within jGraduate (the color picker used in SVG-edit) to:

    create a radial gradient
    add stops to any gradient (limited to two stops only)
