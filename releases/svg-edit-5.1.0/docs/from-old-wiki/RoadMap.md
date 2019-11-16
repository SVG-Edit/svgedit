Introduction

This document covers future versions of SVG-edit. For the current release and previous versions, see the VersionHistory.

Although there is no set date to do so, one important project is to get SVG-edit used on Wikipedia.

Starting with 2.4, development versions of SVG-edit are given an alphabetic codename that corresponds to the name of a shape. See potential lists here: * http://en.wikipedia.org/wiki/List_of_curves * http://en.wikipedia.org/wiki/List_of_regular_polytopes

You can follow all [code commits here](https://code.google.com/p/svg-edit/source/list) to see any features that have been developed since the latest stable release.
Version 2.8 (Devil's curve in trunk; not yet released)
Proposed Features

    [next version](http://code.google.com/p/svg-edit/issues/list?can=2&q=label%3ANeededFor-nextversion) ([Bugs only](https://code.google.com/p/svg-edit/issues/list?can=2&q=label:NeededFor-nextversion%20type=Defect&colspec=ID%20Type%20Status%20Priority%20NeededFor%20Browser%20Owner%20Summary))
    [future version](https://code.google.com/p/svg-edit/issues/list?can=2&q=NeededFor%3AFuture&colspec=ID+Type+Status+Priority+NeededFor+Browser+Owner+Summary&cells=tiles)

Implemented Features (subject to further alteration before release)

    [already fixed/implemented](https://code.google.com/p/svg-edit/issues/list?can=1&q=NeededFor%3Dnextversion+status%3AFixed%2CDone&colspec=ID+Type+Status+Priority+NeededFor+Browser+Owner+Summary&cells=tiles)
    Enhancement (Experimental): Client-side PDF export ([issue #1156](https://code.google.com/p/svg-edit/issues/detail?id=#1156)) (to data: URI) and server-side PDF export (where not supported in browser and using ext-server_opensave.js); uses jsPDF library
    Enhancement: For image exports, provided "datauri" property to "exported" event.
    Enhancement: Allow config "exportWindowType" of value "new" or "same" to indicate whether to reuse the same export window upon subsequent exports
    Enhancement: Added openclipart support to imagelib extension
    Enhancement: allow showGrid to be set before load
    Enhancement: Support loading of (properly URL encoded) non-base64 "data:image/svg+xml;utf8,"-style data URIs
    Enhancement: More clear naming of labels: "Open Image"->"Open SVG" and "Import SVG"->"Import Image" ([issue #1206](https://code.google.com/p/svg-edit/issues/detail?id=#1206))
    Enhancement: Included reference to (repository-ignored) custom.css file which once created by the user, as with config.js, allows customization without modifying the repo
    Demo enhancement: Support and demonstrate export in embedded editor
    Upgrade: canvg version
    Fix: Avoid error in ungrouping function when no elements selected (was impacting MathJax "Ok" button).
    Fix: [issue #1205](https://code.google.com/p/svg-edit/issues/detail?id=1205) with Snap to Grid preventing editing
    Fix: bug in exportImage if svgEditor.setCustomHandlers calls made
    Fix: Ensure "loading..." message closes upon completion or error
    Fix: Ensure all dependencies are first available before canvg (and jsPDF) usage
    Fix: Allow for empty images
    Fix: Minor improvement in display when icon size is set to small
    Fix: Based64-encoding issues with Unicode text (e.g., in data URIs or icons)
    Fix: 2.7 regression in filesave.php for SVG saving (used by ext-server_opensave.js when client doesn't support the download attribute)
    Potentially breaking API changes (subject to further alteration before release):
        Remove 2.7-deprecated "pngsave" (in favor of "exportImage")
        Data URIs must be properly URL encoded (use encodeURIComponent() on the "data:..." prefix and double encodeURIComponent() the remaining content)
        Remove "paramurl" parameter (use "url" or "source" with a data: URI instead)
        svgCanvas.rasterExport now takes an optional window name as the third argument, with the supplied name also being provided as a "exportWindowName" property on the object passed to the exportImage method optionally supplied to svgEditor.setCustomHandlers.
        Change 2.7 allowance of "PDF" as a type in the canvas "rasterExport" method and the "exported" event to instead be moved to the canvas "exportPDF" method and "exportedPDF" event respectively.

Release Date

    TBD

Future
Proposed Features
Animation

SVG-edit should provide a means of animating SVG content using SMIL so that it can be played back in any browser. This becomes increasingly important as more browsers come online with SMIL functionality (Webkit and soon Mozilla).

The Inkscape folks have thoughts here: http://wiki.inkscape.org/wiki/index.php/Animation-%28Timeline%29
