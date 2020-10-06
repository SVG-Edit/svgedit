Introduction

While working on SVG-edit, a number of SVG-related browser bugs were encountered. This page serves to highlight these bugs so they can hopefully be fixed in future versions by the browser makers.
Bugs
Firefox
SVG Files in data: cannot reference elements internally

If you click 'Save' in the browser-based editor, Firefox will show all gradients as black and all markers will be invisible. This is because Firefox doesn't support fragment URIs within a data: URI.

Version(s): 4.0-

Bug Report: https://bugzilla.mozilla.org/show_bug.cgi?id=308590

Workaround in SVG-edit: None. This is now only a problem for obsolete versions of Firefox.
Symbol elements cannot reference elements internally

Importing an image with a symbol element that includes gradients results in all the gradient-filled elements being black.

Version(s): 4.0-

Bug Report: https://bugzilla.mozilla.org/show_bug.cgi?id=353575

Workaround in SVG-edit: None yet
Group Opacity has terrible performance

Problem: When an image has many elements with the opacity attribute set to values less than 1.0, the image (and the editor) cause Firefox to become very slow.

Version(s): 3.5-

Bug Report: https://bugzilla.mozilla.org/show_bug.cgi?id=309782

Other bugs related to Bug 309782: * https://bugzilla.mozilla.org/show_bug.cgi?id=523481 * https://bugzilla.mozilla.org/show_bug.cgi?id=524089

Workaround in SVG-edit: Not really. One option is to avoid using the group_opacity control and change the stroke-opacity and fill-opacity instead.
Rotating text element with gradient

Problem: When a text element has a gradient set and is rotated, the individual glyphs are incorrectly repositioned.

Version(s): All, but only on Mac OSX 10.5 (10.6 is fine)

Bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=519472

Workaround in SVG-edit: No, does not appear possible.
BBoxes for groups and symbols ignore horizontal/vertical lines

Problem: When a group or symbol element contains a horizontal or vertical line, getBBox() ignores the line and thus provides an incorrect rectangle.

Version(s): All

Bug report: None yet

Workaround in SVG-edit: Resource-heavy workaround script (for 2.6)
Opera
Does not support the W3C File API

Problem: Cannot open local files in the browser version of SVG-edit in Opera.

Workaround: Use the widget version.
Webkit
Path Segments and Points Normalized

Problem: Webkit internally normalizes path segments and point lists and does not provide the original string.

Version(s): All, Safari & Chrome

Bug reports: * https://bugs.webkit.org/show_bug.cgi?id=26487 * https://bugs.webkit.org/show_bug.cgi?id=29870

Workaround in SVG-edit: Handle all path segment types and check if commas are present in the point list.
Relative Path Segments Cannot be Added/Removed

Problem: Manipulating segments using insertItemBefore, removeItem, etc fail to actually affect path elements made of relative segments.

Version(s): All, Safari & Chrome

Bug reports: * https://bugs.webkit.org/show_bug.cgi?id=30219

Workaround in SVG-edit: Convert all paths to use absolute segments.
@transform value is unreliable (Safari only)

Problem: WebKit fails to update the value of the @transform attribute after changes are made to its transformlist.

Version(s): Safari (should be fixed in next version after 5)

Bug reports: * None yet, related bug here: https://bugs.webkit.org/show_bug.cgi?id=31119

Workaround in SVG-edit: Implement our own "shim" version of SVGTransformList
getBBox on paths with curves includes control points

Problem: Calling getBBox() on a path with curves returns a box that is too big, as the control points are incorrectly included in the size.

Version(s): All, Safari & Chrome

Bug reports: * https://bugs.webkit.org/show_bug.cgi?id=53512

Workaround in SVG-edit: Implement our own "shim" version of getBBox for paths.
USE element is not repositioned when moved to x=0 y=0 through script

Problem: Attempting to set any USE element (like when importing SVGs) to position 0,0 has no visible effect. This may occur by doing undo after moving it or by setting the values as attributes.

Version(s): All, Safari & Chrome

Bug reports: * https://bugs.webkit.org/show_bug.cgi?id=53767

Workaround in SVG-edit: Removing then re-adding the element seems to take care of this.
Failure to detect camelCase elements

Problem: WebKit is unable to detect elements like linearGradient using querySelectorAll or getElementsByTagName.

Bug reports: * https://bugs.webkit.org/show_bug.cgi?id=46800

Workaround in SVG-edit: Search through all elements, then check their tagName value
Data URL page cannot be saved (Chrome only)

Problem: When using the default save handler, the SVG image is opened in a new tab, but there is no method to save the file.

Version(s): Chrome 5+

Bug reports: * http://code.google.com/p/chromium/issues/detail?id=46735

Workaround in SVG-edit: Open the source editor instead, advising user to copy & paste from there
Does not support the W3C File API (Safari only)

Problem: Cannot open local files in browser-based version of SVG-edit

Bug Reports: * https://bugs.webkit.org/show_bug.cgi?id=32624

Workaround: Copy contents of file and paste in via SVG-edit source editor
BBoxes for groups and symbols ignore horizontal/vertical lines

Problem: When a group or symbol element contains a horizontal or vertical line, getBBox() ignores the line and thus provides an incorrect rectangle.

Version(s): All

Bug report: None yet

Workaround in SVG-edit: Resource-heavy workaround script (for 2.6)
Missing SVG support desired in SVG-edit
Internet Explorer

    Feature: Native support of SVG, Version(s): IE8-, Workaround: For all versions prior to IE9, use the Google Chrome Frame plugin. IE9 supported in SVG-edit 2.6

Firefox

    Feature: SMIL (animation), Version(s): All, Workaround: None
    Feature: SVG Text Selection, Version(s): All, Workaround: None

Webkit

    Feature: SVG Filters, Version(s): Safari 5-, Chrome 4-, Workaround: Wait, SVG Filters are now implemented in the WebKit trunk
    Feature: Save as SVG in Safari, Version: Windows, Workaround: None, https://bugs.webkit.org/show_bug.cgi?id=25265
    Feature: Non-Scaling-Stroke, Version(s): Safari 5- Workaround: Re-calculate stroke manually, wait until Safari is updated (fixed in WebKit trunk)
