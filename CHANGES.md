# 2.8.1 (Ellipse) - December 2nd, 2015

For a complete list of changes run:

```console
git log 81afaa9..5986f1e
```

* Enhancement: Use `getIntersectionList` when available (<https://github.com/SVG-Edit/svgedit/issues/36>)
* Enhancement: Switched to https for all URLs (<https://github.com/SVG-Edit/svgedit/issues/31>)
* Enhancement: Minor administrative updates (docs/, README.md, author emails)
* Fix: Bug where all icons were broken in Safari (<https://github.com/SVG-Edit/svgedit/issues/29>)
* Fix: Updated translations for "page" and "delete" in 57 locales.

# 2.8 (Ellipse) - November 24th, 2015

For a complete list of changes run:

```console
git log 4bb15e0..253b4bf
```

* Enhancement (Experimental): Client-side PDF export (issue [#1156](https://code.google.com/p/svg-edit/issues/detail?id=1156)) (to data: URI) and server-side PDF export (where not supported in browser and using ext-server_opensave.js); uses [jsPDF](https://github.com/MrRio/jsPDF) library
* Enhancement: For image exports, provided "datauri" property to "exported" event.
* Enhancement: Allow config "exportWindowType" of value "new" or "same" to indicate whether to reuse the same export window upon subsequent exports
* Enhancement: Added openclipart support to imagelib extension
* Enhancement: allow showGrid to be set before load
* Enhancement: Support loading of (properly URL encoded) non-base64 "data:image/svg+xml;utf8,"-style data URIs
* Enhancement: More clear naming of labels: "Open Image"->"Open SVG" and "Import SVG"->"Import Image" ( issue [#1206](https://code.google.com/p/svg-edit/issues/detail?id=1206))
* Enhancement: Included reference to (repository-ignored) custom.css file which once created by the user, as with config.js, allows customization without modifying the repo (its main editor file)
* Enhancement: Updated Slovenian locale.
* Demo enhancement: Support and demonstrate export in embedded editor
* Upgrade: canvg version
* Upgrade: Added PathSeg polyfill to workaround pathseg removal in browsers.
* Fix: pathtool bug where paths were erroneously deleted.
* Fix: Context menu did not work for groups.
* Fix: Avoid error in ungrouping function when no elements selected (was impacting MathJax "Ok" button).
* Fix: issue [#1205](https://code.google.com/p/svg-edit/issues/detail?id=1205) with Snap to Grid preventing editing
* Fix: bug in exportImage if svgEditor.setCustomHandlers calls made
* Fix: Ensure "loading..." message closes upon completion or error
* Fix: Ensure all dependencies are first available before canvg (and jsPDF) usage
* Fix: Allow for empty images
* Fix: Minor improvement in display when icon size is set to small
* Fix: Based64-encoding issues with Unicode text (e.g., in data URIs or icons)
* Fix: 2.7 regression in filesave.php for SVG saving (used by ext-server_opensave.js when client doesn't support the download attribute)
* Potentially breaking API changes (subject to further alteration before release):
    * Remove 2.7-deprecated "pngsave" (in favor of "exportImage")
    * Data URIs must be properly URL encoded (use encodeURIComponent() on the "data:..." prefix and double encodeURIComponent() the remaining content)
    * Remove "paramurl" parameter (use "url" or "source" with a data: URI instead)
    * svgCanvas.rasterExport now takes an optional window name as the third argument, with the supplied name also being provided as a "exportWindowName" property on the object passed to the [exportImage](https://code.google.com/p/svg-edit/wiki/ExtensionDocs#svgEditor_public_methods) method optionally supplied to svgEditor.setCustomHandlers.
    * Change 2.7 allowance of "PDF" as a type in the canvas "rasterExport" method and the "exported" event to instead be moved to the canvas "exportPDF" method and "exportedPDF" event respectively.


# 2.7.1 (applied to 2.7 branch) - April 17, 2014

* Fix important ID situation with embedded API
* Update functions available to embedded editor

# 2.7 (Deltoid curve) - April 7th, 2014

* Export to PNG, JPEG, BMP, WEBP (including quality control for JPEG/WEBP) for default editor and for the server_opensave extension
* Added Star, Polygon, and Panning Extensions r2318 r2319 r2333
* Added non-default extension, ext-xdomain-messaging.js, moving cross-domain messaging code (as used by the embedded editor) out of core and requiring, when the extension IS included, that configuration (an array "allowedOrigins") be set in order to allow access by any domain (even same domain).
* Cause embedded editor to pass on URL arguments to the child editor (child iframe)
* Added default extension, ext-storage.js moving storage setting code into this (optional) extension; contains dialog to ask user whether they wish to utilize local storage for prefs and/or content; provides configuration options to tweak behaviors.
* Allow for a new file config.js within the editor folder (but not committed to SVN and ignored) which is always loaded and can be used for supplying configuration which happens early enough to affect URL or user storage configuration, in addition to extension behavior configuration. Provided config-sample.js to indicate types of configuration one could use (see also defaultPrefs, defaultExtensions, and defaultConfig within svg-editor.js )
* Added configuration "preventAllURLConfig", "lockExtensions", and/or "preventURLContentLoading" for greater control of what can be configured via URL.
* Allow second argument object to setConfig containing "allowInitialUserOverride" booleans to allow for preference config in config.js to be overridden by URL or preferences in user storage; also can supply "overwrite" boolean in 2nd argument object if set to false to prevent overwriting of any prior-set configuration (URL config/pref setting occurs in this manner automatically for security reasons).
* Allow server_opensave extension to work wholly client-side (if browser supports the download attribute)
* Added WebAppFind extension
* Added new php_savefile extension to replace outdated, non-functioning server-save code; requires user to create "savefile_config.php" file and do any validation there (for their own security)
* Use addEventListener for 'beforeunload' event so user can add their own if desired
* Changed locale behavior to always load from locale file, including English. Allow extensions to add new "langReady" callback which is passed an object with "lang" and "uiStrings" properties whenever the locale data is first made available or changed by the user (this callback will not be invoked until the locale data is available). Extensions can add strings to all locales and utilize this mechanism.
* Made fixes impacting path issues and also ext-connector.js
* Fixed a bug where the position number supplied on an extension object was too high (e.g., if too few other extensions were included, the extension might not show up because its position was set too high).
* Added Polish locale
* Zoom features
* Make extension paths relative within extensions (issue 1184)
* Security improvements and other fixes
* Embedded editor can now work same domain without JSON parsing and the consequent potential loss of arguments or return values.
* Potentially breaking API changes:
** Disallowed "extPath", "imgPath", "langPath", and "jGraduatePath" setting via URL and prevent cross-domain/cross-folder extensions being set by URL (security enhancement)
** Deprecated "pngsave" option called by setCustomHandlers() in favor of "exportImage" (to accommodate export of other image types). Second argument will now supply, in addition to "issues" and "svg", the properties "type" (currently 'PNG', 'JPEG', 'BMP', 'WEBP'), "mimeType", and "quality" (for 'JPEG' and 'WEBP' types).
** Default extensions will now always load (along with those supplied in the URL unless the latter is prohibited by configuration), so if you do not wish your old code to load all of the default extensions, you will need to add &noDefaultExtensions=true to the URL (or add equivalent configuration in config.js). ext-overview_window.js can now be excluded though it is still a default.
** Preferences and configuration options must be within the list supplied within svg-editor.js (should include those of all documented extensions).
** Embedded messaging will no longer work by default for privacy/data integrity reasons. One must include the "ext-xdomain-messaging.js" extension and supply an array configuration item, "allowedOrigins" with potential values including: "\*" (to allow all domains--strongly discouraged!), "null" as a string to allow file:// access, window.location.origin (to allow same domain access), or specific trusted origins. The embedded editor works without the extension if the main editor is on the same domain, but if cross-domain control is needed, the "allowedOrigins" array must be supplied by a call to svgEditor.setConfig({allowedOrigins: [origin1, origin2, etc.]}) in the new config.js file.

# 2.6 (Cycloid) - January 15th, 2013

* Support for Internet Explorer 9
* Context menu
* Cut/Copy/Paste/Paste in Place options
* Gridlines, snap to grid
* Merge layers
* Duplicate layer
* Image library
* Shape library
* Basic Server-based tools for file opening/saving
* In-group editing
* Cut/Copy/Paste
* full list: http://code.google.com/p/svg-edit/issues/list?can=1&q=label%3ANeededFor-2.6

# 2.5 - June 15, 2010

* Open Local Files (Firefox 3.6+ only)
* Import SVG into Drawing (Firefox 3.6+ only)
* Ability to create extensions/plugins
* Main menu and overal interface improvements
* Create and select elements outside the canvas
* Base support for the svg:use element
* Add/Edit Sub-paths
* Multiple path segment selection
* Radial Gradient support
* Connector lines
* Arrows & Markers
* Smoother freehand paths
* Foreign markup support (ForeignObject?/MathML)
* Configurable options
* File-loading options
* Eye-dropper tool (copy element style)
* Stroke linejoin and linecap options
* Export to PNG
* Blur tool
* Page-align single elements
* Inline text editing
* Line draw snapping with Shift key

# 2.4 - January 11, 2010

* Zoom
* Layers
* UI Localization
* Wireframe Mode
* Resizable UI (SVG icons)
* Set background color and/or image (for tracing)
* Convert Shapes to Paths
* X, Y coordinates for all elements
* Draggable Dialog boxes
* Select Non-Adjacent Elements
* Fixed-ratio resize
* Automatic Tool Switching
* Raster Images
* Group elements
* Add/Remove path nodes
* Curved Paths
* Floating point values for all attributes
* Text fields for all attributes
* Title element

# 2.3 - September 08, 2009

* Align Objects
* Rotate Objects
* Clone Objects
* Select Next/Prev Object
* Edit SVG Source
* Gradient picking
* Polygon Mode (Path Editing, Phase 1)

# 2.2 - July 08, 2009

* Multiselect Mode
* Undo/Redo Actions
* Resize Elements
* Contextual tools for rect, circle, ellipse, line, text elements
* Some updated button images
* Stretched the UI to fit the browser window
* Resizing of the SVG canvas
* Upgraded to jPicker 1.0.8

# 2.1 - June 17, 2009

* tooltips added to all UI elements
* fix flyout menus
* ask before clearing the drawing (suggested by martin.vidner)
* control group, fill and stroke opacity
* fix flyouts when using color picker
* change license from GPLv2 to Apache License v2.0
* replaced Farbtastic with jPicker, because of the license issues
* removed dependency on svgcanvas.svg, now created in JavaScript
* added Select tool
* using jQuery hosted by Google instead of local version
* allow dragging of elements
* save SVG file to separate tab
* create and edit text elements
* context panel tools
* change rect radius, font-family, font-size
* added keystroke shortcuts for all tools
* move to top/bottom

# 2.0 - June 03, 2009

* rewritten SVG-edit, so now it uses OOP
* draw ellipse, square
* created HTML interface similar to Inkscape

# 1.0 - February 06, 2009

* SVG-Edit released
