# 3.0.0-alpha.4

- Docs: Convert more docs to JSDoc and add JSDoc script (thanks, tetedacier!)
- Fix `main` on `package.json` to reference UMD distribution and `module`
  to point to ES6 Module dist
- Fix (regression): Bad name on function passed to `path.js`
- Fix (regression): Star tool (radialshift)
- Fix (regression): Favicon setting

# 3.0.0-alpha.3

- Change: Default to stylesheet above `editor` directory
- Docs: Installation steps
- Fix regression (Connector extension): Get config object when available
- Fix regression (Extensions): Use `extIconsPath` for now given
  that `extPath` will not work relative to `dist`
- Fix regression: Enforce stylesheet ordering sequence
- Fix regression: Ensure SVG-edit hidden until stylesheets loaded
- Fix regression: Avoid abandoning stylesheet loading if one load fails
- Fix (ext-connector): Handle case of 2 connecting elements with
  same y-coordinate (fixes #210 ; thanks, @iuyiuy!)
- Enhancement: Delete the imge upon cancel if it is a new image (fixes #177)
- Enhancement: Allow `addSvgElementFromJson` to accept non-SVG namespaces
  with explicit `namespace` property as well as the default SVG namespace
  (fixes #155); document
- Optimization: For `setSvgString`, if element content is not SVG,
  return `false` earlier (Fixes #152); thanks iuyiuy!
- Demos: Add svgcanvas demo (Neil Fraser)
- npm: Update devDeps

# 3.0.0-alpha.2

- Licensing: Indicate MIT is license type of rgbcolor and rename
  file to reflect it; rename/add license file name for jgraduate
  and screencast to reflect type (Apache 2.0)
contains license information (of type MIT) for Raphael icons
- Breaking change: Rename config file to `svgedit-config-iife.js` (or
    for the module version, `svgedit-config-es.js`); also expect
    one directory higher; incorporates #207 (@iuyiuy)
- Breaking change: Separate `extIconsPath` from `extPath` (not copying over icons)
- Breaking change: Don't reference `custom.css` in HTML; can instead
  be referenced in JavaScript through the config file (provided in `svgedit-config-sample-iife.js`/`svgedit-config-sample-es.js` as
  `svgedit-custom.css` for better namespacing); incorporates #207 (@iuyiuy)
- Breaking change: Remove minified jgraduate/spinbtn files (minified within Rollup routine)
- Breaking change: Require `new` with `EmbeddedSVGEdit` (allows us to use `class` internally)
- Breaking change: `svgcanvas.setUiStrings` must now be called if not using
  editor in order to get strings (for sake of i18n) (and if using path.js
  alone, must also have its `setUiStrings` called)
- Breaking change (ext-overview-window): Avoid global `overviewWindowGlobals`
- Breaking change (ext-imagelib): Change to object-based encoding for namespacing of
messages (though keep stringifying/parsing ourselves until we remove IE9 support)
- Breaking change: Rename `jquery.js` to `jquery.min.js`
- Breaking change: Remove `scoped` attribute from `style`; it is now deprecated and
obsolete; also move to head (after other stylesheets)
- Fix: i18nize path.js strings and canvas notifications
- Fix: Attempt i18n for ext-markers
- Fix: Zoom when scrolled; incorporates #169 (@AndrolGenhald), adapting for conventions; also allow avoidance when shift key pressed
- Fix: Update Atom feed reference in HTML
- Fix: Broken "lv" locale (and inconsistent tabs/spaces pt-PR)
- Fix: Inadvertent global assignments (uncovered by ESLint):
    * `addBezierCurve` in `canvg.js` had undeclared `i`
    * Fix: Undeclared variable in opera widget
    * jgraduate->jpicker: Fix missing `var` for some `i` loops
    * Fix: Globals (`x`, `y`) in `mouseMove`
    * Fix: Global (`element`, `d_attr` (now renamed to `dAttr`)) in `mouseDown`
    * Testing (math_test): Fix undeclared variables
    * Screencast `showNotes`
- Fix: Bad scope closure references
    * An apparent bug in `jquery.svgicons.js` whereby a variable
        `holder` was declared in too nested of a scope
    * Fix: Avoid `drawnPath` not defined error (currently adds as a global, but
        should be switching to modules anyways)
- Fix (jgraduate->jpicker): Fix Color val check when `name.length` is empty
    (equal to "all")
- Fix (jquery.jgraduate.js): Ensure `numstops` is present before check
- Fix (history.js) Relocation of rotational transform had undeclared variable (`elem`)
- Fix (Editor): Restore save alert
- Fix (Firefox svgutils.js): tspan (and textPath apparently) have no `getBBox`
    in Firefox, so recover (fixes FF issue with recalculate test 3:
    "recalculateDimensions() on text w/tspan with simple translate")
- Fix (Chrome recalculate.js): Chrome has a
    [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=843901)
    in not performing `removeAttribute` after `removeItem`; deal with it
    (though only if there is a single identity matrix) (fixes Chrome issue
    with recalculate test 1:
    "recalculateDimensions() on rect with identity matrix")
- Fix (HTML): Update assorted links, including using `https://`
- Enhancement: ES6 modules (including jQuery plugins, extensions, locales,
  tests), along with Babel; make Node build routine for converting modular
  source to non-modular
- Enhancement: use `loadStylesheets` for modular stylesheet defining
  (but parallel loading)
- Enhancement: Add `stylesheets` config for modular but parallel
  stylesheet loading with `@default` option for simple
  inclusion/exclusion of defaults (if not going with default).
- Enhancement: Further JSDoc (incomplete)
- Enhancement (Project size): Remove now unused Python l10n scripts (#238)
- Enhancement (Optimization): Compress images using imageoptim (and add
npm script) (per #215)
- Enhancement (Editor): Use `https` (instead of `http`) for link default
- Enhancement: Throw Error objects instead of strings (including in jgraduate->jpicker)
- Enhancement: Make SpinButton plugin independent of SVGEdit via
  generic state object for `tool_scale`
- Enhancement: Move `config-sample.js` out of `editor` directory
- Enhancement: For `callback`-style extensions, also provide config
  object; add following to that object: `buildCanvgCallback`, `canvg`,
  `decode64`, `encode64`, `executeAfterLoads`, `getTypeMap`, `isChrome`,
  `ieIE`, `NS`, `text2xml`
- npm: Add ESLint, uglify, start scripts
- npm: Update devDeps
- npm: Add html modules and config build to test script
- Docs: Remove "dependencies" comments in code except where summarizing
  role of jQuery or a non-obvious dependency
- Linting: 2 spaces, remove BOM, remove carriage returns, bad characters
  in Persian locale file
- Linting (ESLint): Numerous changes
- Refactoring: Switch to ESLint in source
- Refactoring: Move scripts to own files
- Refactoring: Clean up `svg-editor.html`: consistent indents; avoid extra lbs, avoid long lines
- Refactoring: Avoid embedded API adding inline JavaScript listener
- Refactoring: Move layers and context code to `draw.js`
- Refactoring: Move `pathActions` from `svgcanvas.js` (though preserve aliases to these methods on `canvas`) and `convertPath` from `svgutils.js` to `path.js`
- Refactoring: Move `getStrokedBBox` from `svgcanvas.js` (while keeping an alias) to `svgutils.js` (as `getStrokedBBoxDefaultVisible` to avoid conflict with existing)
- Refactoring/Linting: Enfore `no-extra-semi` and `quote-props` rules
- Refactoring: Further avoidance of quotes on properties (as possible)
- Refactoring: Use `class` in place of functions where intended as classes
- Refactoring: Consistency and granularity in extensions imports
- Refactoring (ext-storage): Move locale info to own file imported by the extension (toward modularity; still should be split into separate files by language and *dynamically* imported, but we'll wait for better `import` support to refactor this)
- Refactoring: For imagelib, add local jQuery copy (using old 1.4.4 as had
been using from server)
- Refactoring: For MathJax, add local copy (using old 2.3 as had been using from
server); server had not been working
- Refactoring: Remove `use strict` (implicit in modules)
- Refactoring: Remove trailing whitespace, fix some code within comments
- Refactoring: Expect `jQuery` global rather than `$` for better modularity
(also to adapt line later once available via `import`)
- Refactoring: Prefer `const` (and then `let`)
- Refactoring: Add block scope keywords closer to first block in which they appear
- Refactoring: Use ES6 `class`
- Refactoring `$.isArray` -> `Array.isArray` and avoid some other jQuery core methods
with simple VanillaJS replacements
- Refactoring: Use abbreviated object property syntax
- Refactoring: Object destructuring
- Refactoring: Remove `uiStrings` contents in svg-editor.js (obtains from locale)
- Refactoring: Add favicon to embedded API file
- Refactoring: Use arrow functions for brief functions (incomplete)
- Refactoring: Use `Array.prototype.includes`/`String.prototype.includes`;
`String.prototype.startsWith`, `String.prototype.trim`
- Refactoring: Remove now unnecessary svgutils do/while resetting of variables
- Refactoring: Use shorthand methods for object literals (avoid ": function")
- Refactoring: Avoid quoting object property keys where unnecessary
- Refactoring: Just do truthy/falsey check for lengths in place of comparison to 0
- Refactoring (Testing): Avoid jQuery usage within most test files (defer script,
also in preparation for future switch to ES6 modules for tests)
- Refactoring: Make jpicker variable declaration indent bearable
- Refactoring (Linting): Finish svgcanvas.js
- Docs: Mention in comment no longer an entry file as before
- Docs: Migrate old config, extensions, and FAQ docs
- Build: Update minified version of spinbtn/jgraduate/jpicker per linted/improved files
- Testing: Move JavaScript out of HTML to own files
- Testing: Add `node-static` to get tests working
- Testing: Fix timing of `all_tests.html` for ensuring expanding iframe size to fit content
- Testing: Add favicon to test files (also may avoid extra log in console)
- Testing: Update QUnit to 2.6.1 (node_modules) and Sinon to 5.0.8 (and add sinon-test at 2.1.3) and enforce eslint-plugin-qunit linting rules; update custom extensions
- Testing: Add node-static for automating (and accessing out-of-directory contents)
- Testing: Avoid HTML attributes for styling
- Testing: Add npm `test` script
- Testing: Comment out unused jQuery SVG test
- Testing: Add test1 and svgutils_performance_test to all tests page
- Testing: Due apparently to Path having not been a formal class, the test was calling it without `new`; refactored now with sufficient mock data to take into account it is a class

# 3.0.0-alpha.1

(Only released on npm)

- Provide `package.json` for npm to reserve name (reflecting current state of `master`)

# 2.8.1 (Ellipse) - December 2nd, 2015

For a complete list of changes run:

```console
git log 81afaa9..5986f1e
```

- Enhancement: Use `getIntersectionList` when available (<https://github.com/SVG-Edit/svgedit/issues/36>)
- Enhancement: Switched to https for all URLs (<https://github.com/SVG-Edit/svgedit/issues/31>)
- Enhancement: Minor administrative updates (docs/, README.md, author emails)
- Fix: Bug where all icons were broken in Safari (<https://github.com/SVG-Edit/svgedit/issues/29>)
- Fix: Updated translations for "page" and "delete" in 57 locales.

# 2.8 (Ellipse) - November 24th, 2015

For a complete list of changes run:

```console
git log 4bb15e0..253b4bf
```

- Enhancement (Experimental): Client-side PDF export (issue [#1156](https://code.google.com/p/svg-edit/issues/detail?id=1156)) (to data: URI) and server-side PDF export (where not supported in browser and using ext-server_opensave.js); uses [jsPDF](https://github.com/MrRio/jsPDF) library
- Enhancement: For image exports, provided "datauri" property to "exported" event.
- Enhancement: Allow config "exportWindowType" of value "new" or "same" to indicate whether to reuse the same export window upon subsequent exports
- Enhancement: Added openclipart support to imagelib extension
- Enhancement: allow showGrid to be set before load
- Enhancement: Support loading of (properly URL encoded) non-base64 "data:image/svg+xml;utf8,"-style data URIs
- Enhancement: More clear naming of labels: "Open Image"->"Open SVG" and "Import SVG"->"Import Image" ( issue [#1206](https://code.google.com/p/svg-edit/issues/detail?id=1206))
- Enhancement: Included reference to (repository-ignored) custom.css file which once created by the user, as with config.js, allows customization without modifying the repo (its main editor file)
- Enhancement: Updated Slovenian locale.
- Demo enhancement: Support and demonstrate export in embedded editor
- Upgrade: canvg version
- Upgrade: Added PathSeg polyfill to workaround pathseg removal in browsers.
- Fix: pathtool bug where paths were erroneously deleted.
- Fix: Context menu did not work for groups.
- Fix: Avoid error in ungrouping function when no elements selected (was impacting MathJax "Ok" button).
- Fix: issue [#1205](https://code.google.com/p/svg-edit/issues/detail?id=1205) with Snap to Grid preventing editing
- Fix: bug in exportImage if svgEditor.setCustomHandlers calls made
- Fix: Ensure "loading..." message closes upon completion or error
- Fix: Ensure all dependencies are first available before canvg (and jsPDF) usage
- Fix: Allow for empty images
- Fix: Minor improvement in display when icon size is set to small
- Fix: Based64-encoding issues with Unicode text (e.g., in data URIs or icons)
- Fix: 2.7 regression in filesave.php for SVG saving (used by ext-server_opensave.js when client doesn't support the download attribute)
- Potentially breaking API changes (subject to further alteration before release):
    * Remove 2.7-deprecated "pngsave" (in favor of "exportImage")
    * Data URIs must be properly URL encoded (use encodeURIComponent() on the "data:..." prefix and double encodeURIComponent() the remaining content)
    * Remove "paramurl" parameter (use "url" or "source" with a data: URI instead)
    * svgCanvas.rasterExport now takes an optional window name as the third argument, with the supplied name also being provided as a "exportWindowName" property on the object passed to the [exportImage](https://code.google.com/p/svg-edit/wiki/ExtensionDocs#svgEditor_public_methods) method optionally supplied to svgEditor.setCustomHandlers.
    * Change 2.7 allowance of "PDF" as a type in the canvas "rasterExport" method and the "exported" event to instead be moved to the canvas "exportPDF" method and "exportedPDF" event respectively.


# 2.7.1 (applied to 2.7 branch) - April 17, 2014

- Fix important ID situation with embedded API
- Update functions available to embedded editor

# 2.7 (Deltoid curve) - April 7th, 2014

- Export to PNG, JPEG, BMP, WEBP (including quality control for JPEG/WEBP) for default editor and for the server_opensave extension
- Added Star, Polygon, and Panning Extensions r2318 r2319 r2333
- Added non-default extension, ext-xdomain-messaging.js, moving cross-domain messaging code (as used by the embedded editor) out of core and requiring, when the extension IS included, that configuration (an array "allowedOrigins") be set in order to allow access by any domain (even same domain).
- Cause embedded editor to pass on URL arguments to the child editor (child iframe)
- Added default extension, ext-storage.js moving storage setting code into this (optional) extension; contains dialog to ask user whether they wish to utilize local storage for prefs and/or content; provides configuration options to tweak behaviors.
- Allow for a new file config.js within the editor folder (but not committed to SVN and ignored) which is always loaded and can be used for supplying configuration which happens early enough to affect URL or user storage configuration, in addition to extension behavior configuration. Provided config-sample.js to indicate types of configuration one could use (see also defaultPrefs, defaultExtensions, and defaultConfig within svg-editor.js )
- Added configuration "preventAllURLConfig", "lockExtensions", and/or "preventURLContentLoading" for greater control of what can be configured via URL.
- Allow second argument object to setConfig containing "allowInitialUserOverride" booleans to allow for preference config in config.js to be overridden by URL or preferences in user storage; also can supply "overwrite" boolean in 2nd argument object if set to false to prevent overwriting of any prior-set configuration (URL config/pref setting occurs in this manner automatically for security reasons).
- Allow server_opensave extension to work wholly client-side (if browser supports the download attribute)
- Added WebAppFind extension
- Added new php_savefile extension to replace outdated, non-functioning server-save code; requires user to create "savefile_config.php" file and do any validation there (for their own security)
- Use addEventListener for 'beforeunload' event so user can add their own if desired
- Changed locale behavior to always load from locale file, including English. Allow extensions to add new "langReady" callback which is passed an object with "lang" and "uiStrings" properties whenever the locale data is first made available or changed by the user (this callback will not be invoked until the locale data is available). Extensions can add strings to all locales and utilize this mechanism.
- Made fixes impacting path issues and also ext-connector.js
- Fixed a bug where the position number supplied on an extension object was too high (e.g., if too few other extensions were included, the extension might not show up because its position was set too high).
- Added Polish locale
- Zoom features
- Make extension paths relative within extensions (issue 1184)
- Security improvements and other fixes
- Embedded editor can now work same domain without JSON parsing and the consequent potential loss of arguments or return values.
- Potentially breaking API changes:
    * Disallowed "extPath", "imgPath", "langPath", and "jGraduatePath" setting via URL and prevent cross-domain/cross-folder extensions being set by URL (security enhancement)
    * Deprecated "pngsave" option called by setCustomHandlers() in favor of "exportImage" (to accommodate export of other image types). Second argument will now supply, in addition to "issues" and "svg", the properties "type" (currently 'PNG', 'JPEG', 'BMP', 'WEBP'), "mimeType", and "quality" (for 'JPEG' and 'WEBP' types).
    * Default extensions will now always load (along with those supplied in the URL unless the latter is prohibited by configuration), so if you do not wish your old code to load all of the default extensions, you will need to add &noDefaultExtensions=true to the URL (or add equivalent configuration in config.js). ext-overview_window.js can now be excluded though it is still a default.
    * Preferences and configuration options must be within the list supplied within svg-editor.js (should include those of all documented extensions).
    * Embedded messaging will no longer work by default for privacy/data integrity reasons. One must include the "ext-xdomain-messaging.js" extension and supply an array configuration item, "allowedOrigins" with potential values including: "\*" (to allow all domains--strongly discouraged!), "null" as a string to allow file:// access, window.location.origin (to allow same domain access), or specific trusted origins. The embedded editor works without the extension if the main editor is on the same domain, but if cross-domain control is needed, the "allowedOrigins" array must be supplied by a call to svgEditor.setConfig({allowedOrigins: [origin1, origin2, etc.]}) in the new config.js file.

# 2.6 (Cycloid) - January 15th, 2013

- Support for Internet Explorer 9
- Context menu
- Cut/Copy/Paste/Paste in Place options
- Gridlines, snap to grid
- Merge layers
- Duplicate layer
- Image library
- Shape library
- Basic Server-based tools for file opening/saving
- In-group editing
- Cut/Copy/Paste
- full list: http://code.google.com/p/svg-edit/issues/list?can=1&q=label%3ANeededFor-2.6

# 2.5 - June 15, 2010

- Open Local Files (Firefox 3.6+ only)
- Import SVG into Drawing (Firefox 3.6+ only)
- Ability to create extensions/plugins
- Main menu and overal interface improvements
- Create and select elements outside the canvas
- Base support for the svg:use element
- Add/Edit Sub-paths
- Multiple path segment selection
- Radial Gradient support
- Connector lines
- Arrows & Markers
- Smoother freehand paths
- Foreign markup support (ForeignObject?/MathML)
- Configurable options
- File-loading options
- Eye-dropper tool (copy element style)
- Stroke linejoin and linecap options
- Export to PNG
- Blur tool
- Page-align single elements
- Inline text editing
- Line draw snapping with Shift key

# 2.4 - January 11, 2010

- Zoom
- Layers
- UI Localization
- Wireframe Mode
- Resizable UI (SVG icons)
- Set background color and/or image (for tracing)
- Convert Shapes to Paths
- X, Y coordinates for all elements
- Draggable Dialog boxes
- Select Non-Adjacent Elements
- Fixed-ratio resize
- Automatic Tool Switching
- Raster Images
- Group elements
- Add/Remove path nodes
- Curved Paths
- Floating point values for all attributes
- Text fields for all attributes
- Title element

# 2.3 - September 08, 2009

- Align Objects
- Rotate Objects
- Clone Objects
- Select Next/Prev Object
- Edit SVG Source
- Gradient picking
- Polygon Mode (Path Editing, Phase 1)

# 2.2 - July 08, 2009

- Multiselect Mode
- Undo/Redo Actions
- Resize Elements
- Contextual tools for rect, circle, ellipse, line, text elements
- Some updated button images
- Stretched the UI to fit the browser window
- Resizing of the SVG canvas
- Upgraded to jPicker 1.0.8

# 2.1 - June 17, 2009

- tooltips added to all UI elements
- fix flyout menus
- ask before clearing the drawing (suggested by martin.vidner)
- control group, fill and stroke opacity
- fix flyouts when using color picker
- change license from GPLv2 to Apache License v2.0
- replaced Farbtastic with jPicker, because of the license issues
- removed dependency on svgcanvas.svg, now created in JavaScript
- added Select tool
- using jQuery hosted by Google instead of local version
- allow dragging of elements
- save SVG file to separate tab
- create and edit text elements
- context panel tools
- change rect radius, font-family, font-size
- added keystroke shortcuts for all tools
- move to top/bottom

# 2.0 - June 03, 2009

- rewritten SVG-edit, so now it uses OOP
- draw ellipse, square
- created HTML interface similar to Inkscape

# 1.0 - February 06, 2009

- SVG-Edit released
