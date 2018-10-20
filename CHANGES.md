# 3.0.0

- See pre-release version notes for other changes that occurred with 3.0.0
- Breaking change: For checkbox for persisting choice of initial use storage
  approval in storage extension dialog, turn on by default for convenience of
  most users (must still hit "ok" and users can still turn off the checkbox)
- Fix: Map extension click events to "mousedown" so they can be received
    on touch devices (since `touch.js` changes `touchstart` to
    `mousedown`) (@ClemArt); closes #168
- Fix: Ensure extension `mouseup` events run on "zoom" and "select"
  modes (@iuyiuy); closes #159
- Fix: Allow language to be properly set back to a different locale and
  retaining preference (and ensure language changes are available before
  dialog closed)
- Fix (regression): Extension locale loading for non-English locales
- Enhancement: Allow "Escape" to work with hotkeys within text boxes;
  allows escaping out of source textarea (part of #291)
- Enhancement: Allow 'a' also with meta key (command in Mac, ctrl otherwise)
  to select all (part of #291)
- Enhancement: Add a global escape key listener to clear the selection
- Refactoring: Change 'a' to lower case in key command to avoid impression
  that shift is needed
- Refactoring: array extra/spread operator
- npm: Update devDeps

# 3.0.0-rc.3

- Security fix/Breaking change (Imagelib): Only allow origins within
  `imgLibs` to be accepted for `message` listener
- Security fix/Breaking change (xdomain): Namespace xdomain file to avoid
  it being used to modify non-xdomain storage
- Security fix (Imagelib): Avoid XSS
- Security fix (Imagelib): Expose `dropXMLInternalSubset` to extensions
  for preventing billion laughs attack (and use in Imagelib)
- Security fix (minor): For embedded API, avoid chance for arbitrary
  property setting (though this was only for trusted origins anyways)
- Security fix (minor): For embedded API example, copy params to iframe
  source without XSS risk (though params should already be XML-safe
  given `encodeURIComponent` and lack of a single quote attribute
  context)
- Known regression: Remove Openclipart as its site's now setting of
  `X-Frame-Options` to `"sameorigin"` makes it unusable on our end
  for our cross-origin uses
- Breaking change (minor): Change export to check `exportWindowName`
  for filename and change default from `download` to `svg.pdf` to
  distinguish from other downloads
- Fix: Given lack of support now for dataURI export in Chrome, provide
  PDF as export (#273 @cuixiping); fixes #124 and #254
- Fix: Polygon/polyline in PDF export (#287 @cuixiping); fixes #280
- Fix: Ensure all apostrophes are escaped for `toXml` utility
- Fix: Avoid error if `URL` is not defined (export)
- Fix: Ensure repeated selection of same file overwrites with that
  file's contents (fix #289)
- Fix: Avoid errors occurring in Chrome now for `supportsGoodTextCharPos`
- Fix (jPicker): Avoid setting `Math.precision` pseudo-global
- Fix (jPicker): Precision argument had not been passed in previously
- Fix (image import): Put src after onload to avoid missing event;
  check other width/height properties in case offset is 0; fixes #278
- Fix (image export): Export in Chrome; fixes #282
- Fix (Context menus): Avoid showing double shortcuts (#285); add some
  missing ones
- Fix (Star extension): Minor: Avoid erring if `inradius` is `NaN`
- Forward compatibility enhancement: Once IE9 support may be dropped,
  we may post messages as objects, so don't break if objects received
  (embedded API, xdomain, Imagelib)
- Forward compatibility enhancement: For IAN image library, add
  `svgedit=3` param to URL so that it can keep using old API for
  SVG-Edit versions before 3, while conditionally using new object-based
  API now (and if we switch exclusively to the object-based API in the
  future, this site will continue to work)
- Imagelib backward compatibility enhancement: Allow string based API
  again so as not to break old SVG-Edit which fail at *presence* of
  `namespace` (fixes #274)
- Refactoring: Avoid passing unused arguments, setting unused variables,
  and making unnecessary checks; avoid useless call to `createSVGMatrix`
- Refactoring: Avoid useless assignment (courtesty lgtm)
- Refactoring: Destructuring, ellipsis
- Refactoring (jPicker): Use ES6 templates; avoid unnecessary check
- Linting (LGTM): Add `lgtm.yml` file (still some remaining items flagged
  but hoping for in-code flagging)
- Linting (LGTM): Flag origin-checked item as safe
- Linting (ESLint): Consistent spacing; new "standard"
- Testing: Add testcafe (ESLint plugin/rules, accessibility test
  (failing), ui test beginnings (passing))
- Docs: Contributing file
- Docs (JSDoc): Missing return value
- Update (Imagelib): Remove extra (and more outdated) jQuery copy
- Build: Switch to `terser` plugin with `uglify` plugin not
  supporting ES6+-capable minifier
- npm: Update devDeps
- npm: Point to official sinon-test package now that ES6 Modules
    support landed

# 3.0.0-rc.2

- Fix: Avoid extension `includeWith` button conflicts/redundancies;
  Incorporates #147
- Fix: Ensure shift-key cycling through flyouts works with extension-added
  `includeWith` as well as toolbarbuttons
- Fix: Apply flyout arrows after extensions callback
- Fix: Ensure SVG icon of flyout right-arrow is cloned to can be applied to
  more than one extension
- Fix: Ensure line tool shows as selected when "L" key command is used
- Fix: Add images (and references) for fallback (#135)
- Fix (svgIcons plugin): Race condition
- Fix (canvg): Regression for `text` and `tspan` elements as far as
  `captureTextNodes` with canvg (inheriting class had set
  `captureTextNodes` too late)
- Fix (canvg): Regression on blur
- Fix (canvg): Avoid errors for `tspan` passed to `getGradient`
- i18n: picking stroke/fill paint and opacity
- i18n: Remove eyedropper and imagelib references from main locale (in
  extension locale now)
- i18n: Add placeholders for `pick_stroke_paint_opacity`,
  `pick_fill_paint_opacity`, `popupWindowBlocked`
- i18n: Update `saveFromBrowser`
- i18n: Reapply locale strings
- Enhancement: Create xdomain file build which works without ES6 Modules
- Enhancement: Build xdomain files dynamically
- Optimize: Further image optimizing
- Optimize: Avoid rewriting `points` attribute for free-hand path;
  incorporates #176 (fixes #175)
- Refactoring: Avoid passing on `undefined` var. (#147)
- Refactoring: lbs; avoid indent in connector, destructuring, use map
  over push
- Docs: Clarify nature of fixes
- Docs: JSDoc for `setupFlyouts`, `Actions`, `toggleSidePanel`; missing for
  ToolbarButton

# 3.0.0-rc.1

- Security fix: 'extPath', 'imgPath', 'extIconsPath', 'canvgPath',
  'langPath', 'jGraduatePath', and 'jspdfPath' were not being prevented
- Breaking change: Rename "svgutils.js" to "utilities.js" (make in
  conformity with JSDoc module naming convention)
- Breaking change: Rename "svgedit.js" to "namespaces.js" (to make clear
  purpose and avoid confusing with editor)
- Breaking change: Rename "jquery-svg.js" to "jQuery.attr.js"
- Breaking change: Rename "jquery.contextMenu.js" to "jQuery.contextMenu.js"
- Breaking change: Rename "jquery.jpicker.js" to "jQuery.jPicker.js"
- Breaking change: Rename "JQuerySpinBtn.css" to "jQuery.SpinButton.css"
- Breaking change: Rename "JQuerySpinBtn.js" to "jQuery.SpinButton.js" (to
  have file name more closely reflect name)
- Breaking change: Rename "jquery.svgicons.js" to "jQuery.svgIcons.js"
- Breaking change: Rename "jquery.jgraduate.js" to "jQuery.jGraduate.js"
- Breaking change: Rename "pathseg.js" to "svgpathseg.js" (as it is a
  poyfill of SVGPathSeg)
- Breaking change: Rename `addSvgElementFromJson()` to `addSVGElementFromJson`
  for consistency
- Breaking change: Rename `changeSvgContent()` to `changeSVGContent()` for
  consistency
- Breaking change: Have `exportPDF` resolve with `output` and `outputType`
  rather than `dataurlstring` (as type may vary)
- Breaking change: Rename `extensions/mathjax/MathJax.js` to
  `extensions/mathjax/MathJax.min.js`
- Breaking change: Avoid recent change to have editor ready callbacks
  return Promises (we're not using and advantageous to keep sequential)
- Breaking change: Avoid recent addition of locale-side function in
  ext-imagelib for l10n
- Breaking change: Change name of `ext-arrows.js` from `Arrows` to `arrows`
  for sake of file path (not localized anyways).
- Breaking change: Change `addlangData` extension event to `addLangData`
  for consistency with method name
- Breaking change: In interests of modularity/removing globals,
  remove `window.svgCanvas` and `svgCanvas.ready` as used by older
  extensions; use `svgEditor.canvas` and `svgEditor.ready` instead
- Breaking change: Extension now formatted as export (and `this`
  is set to editor, including for `callback`)
- Breaking change: Locale now formatted as export
- Breaking change: Moved out remaining modular i18n (imagelib) to own folder
- Breaking change: Drop `executeAfterLoads` (and getJSPDF/getCanvg)
- Breaking change: `RGBColor` must accept `new`
- Breaking change: canvg - `stackBlurCanvasRGBA` must be set now by function
  (`setStackBlurCanvasRGBA`) rather than global; `canvg` now a named export
- Breaking change: Avoid passing `canvg`/`buildCanvgCallback` to extensions
  (have them import)
- Breaking change: Have `readLang`  return lang and data but do not call
  `setLang`
- Breaking change: Avoid adding `assignAttributes`, `addSVGElementFromJson`,
  `call`, `copyElem`, `findDefs`, `getElem`, `getId`, `getIntersectionList`,
  `getMouseTarget`, `getNextId`, `getUrlFromAttr`, `hasMatrixTransform`,
  `matrixMultiply`, `recalculateAllSelectedDimensions`,
  `recalculateDimensions`, `remapElement`, `removeUnusedDefElems`, `round`,
  `runExtensions`, `sanitizeSvg`, `setGradient` `transformListToTransform`
  (and mistaken `toString` export) to `getPrivateMethods` (passed to
  extensions) as available as public ones
- npm: Add `prepublishOnly` script to ensure building/testing before publish
- npm: Update devDeps including Rollup, Sinon
- Fix: Remove redundant (and incorrect) length set. (#256 ; fixes #255)
- Fix: Detection of whether to keep ellipse (rx and ry when just created
  are now returning 0 instead of null); also with rectangle/square;
  fixes #262
- Fix: Avoid erring during resize on encountering MathML (which have no
  `style`)
- Fix: Have general locales load first so extensions may use
- Fix: Provide `importLocale` to extensions `init` so it may delay
  adding of the extension until locale data loaded
- Fix: i18nize imaglib more deeply
- Fix: Positioning of Document Properties dialog (Fixes #246)
- Fix (regression): PDF Export (Fixes #249)
- Fix (regression): Add polyfill for `ChildNode`/`ParentNode` (and use further)
- Fix (regression): Apply Babel universally to dependencies
- Fix (regression): Ordering of `uaPrefix` function in `svgEditor.js`
- Fix (regression): Embedded API
- Fix (embedded editor): Fix backspace key in Firefox so it doesn't navigate
  out of frame
- Fix: Alert if no `exportWindow` for PDF (e.g., if blocked)
- Fix: Ensure call to `rasterExport` without `imgType` properly sets MIME
  type to PNG
- Fix (extension): Wrong name for moinsave
- Fix (extension): ForeignObject editor
- Fix (Embedded API): Cross-domain may fail to even access `origin` or
  `contentDocument`
- Fix (Embedded API): Avoid adding URL to iframe src if there are no arguments
- Fix (Embedded API): Handle origin issues (fixes #173)
- Fix (Cross-domain usage): Recover from exceptions with `localStorage`
- Fix regression (Imagelib): Fix path for non-module version
- Update: Update WebAppFind per new API changes
- Enhancement: Link to rawgit/raw.githack for live master demos (fixes #43)
- Enhancement: Make `setStrings` public on editor for late setting (used
  by `ext-shapes.js`)
- Enhancement: Add `extensions_added` event
- Enhancement: Add `message` event (Relay messages including those which
  have been been received prior to extension load)
- Enhancement: Sort SVG attributes alphabetically (#252 @Neil Fraser)
- Enhancement: Allow callback argument and return promise
  for canvas methods: `rasterExport` and `exportPDF`
- Enhancement: Add `pointsAdded` canvas event (Fixes #141)
- Enhancement: Allow SVGEdit to work out of the box--avoid need for copying
  sample config file. Should also help with Github-based file servers
- Enhancement: Allow avoiding "name" in extension export (just extract out
  of file name)
- Enhancement: Add stack blur to canvg by default (and refactoring it)
- Enhancement: Return `Promise` for `embedImage` (as with some other loading
  methods)
- Enhancement: Supply `importLocale` to `langReady` to facilitate extension
  locale loading
- Enhancement: Recover if an extension fails to load (just log and otherwise
  ignore)
- Enhancement: More i18n of extensions
- Enhancement: Allowing importing of locales within `addLangData`
- i18n: Clarify locale messages (where still available as English) to reflect
  fact that Chrome only has "Save as" via context menu/right-click, not via
  file menu (toward #192)
- Refactoring: Sort Embedded functions alphabetically and add lbs for better
  visibility in code
- Refactoring: Simplify `isValidUnit`
- Refactoring( RGBColor) `RGBColor` as class, without rebuilding
  constants, optimize string replacement, move methods to prototype,
  use templates and object literals, use `Object.keys`
- Refactoring (canvg) Use classes more internally, use shorthand objects;
  array extras, return to lazy-loading
- Refactoring: Use Promises in place of `$.getScript`; always return
  Promises in case deciding to await resolving
- Refactoring: Avoid importing `RGBColor` into `svgutils.js` (jsPDF imports
  it itself)
- Refactoring: Arrow functions, destructuring, shorter property references
- Refactoring: Fix `lang` and `dir` for locales (though not in use
  currently anyways)
- Refactoring: Provide path config for canvg, jspdf
- Refactoring: Drop code for extension as function (already requiring export
  to be an object)
- Refactoring: Object destructuring, `Object.entries`, Object shorthand,
  array extras, more camelCase variable names
- Refactoring: Add a `Command` base class
- Refactoring: Simplify svgicons `callback` ready detection
- Refactoring: Put `let` or `const` closer to scope
- Refactoring: Remove unneeded `delimiter` from regex escaping utility
- Refactoring: Clearer variable names
- Refactoring: Use (non-deprecated) Event constructors
- Refactoring (minor): variadic args through ellipsis
- Refactoring (minor): `getIssues` to return codes and strings, lbs
- Refactoring (minor): Use single quotes in PHP
- Docs (Code comments): Coding standards within
- Docs: Transfer some changes from ExtensionDocs on wiki (need to fully
  reconcile)
- Docs: Reference JSDocs in README
- Docs (ReleaseInstructions): Update
- Docs: Migrate copies of all old wiki pages to docs/from-old-wiki
  folder; intended for a possible move to Markdown, so raw HTML
  (with formatting) was not preserved, though named links were carried over
  with absolute URLs
- Docs: Begin deleting `SvgCanvas.md` as ensuring jsdoc has replacements
- Docs: Add Edtior doc file for help to general users
- Docs: Clarify/simplify install instructions
- Docs: Generally update/improve docs (fixes #92)
- Docs: Update links to `latest` path (Avoid needing to update such
  references upon each release)
- Docs: 80 chars max
- npm/Docs (JSDoc): Add script to check for overly generic types
- Docs (JSDoc): Move jsdoc output to public directory so may be visible
  on releases (while still having in a `.gitignore`)
- Docs (JSDoc): Exclusions
- Docs (JSDoc): Add items; fix table layout
- Docs (JSDoc): For config/prefs and extension creating, link to tutorials
  (moved tutorials to own directory to avoid recursion problems by jsdoc)
- Docs (JSDoc): Add modules (upper case for usual main entrance files or
  regular names)
- Docs (JSDoc): Fill out missing areas; indicate return of `undefined`;
  consistency with `@returns`
- Docs (JSDoc): Use Markdown plugin over HTML
- Docs (JSDoc): Add our own layout template to support overflow
- Docs (JSDoc): Use cleverLinks and disallow unknown tags
- Docs (JSDoc): Insist on "pedantic" flag; put output directory in config
- Docs (JSDoc): Use more precise Integer/Float over number, the specific type
  of array/function/object
- Docs (JSDoc): Use `@throws`, `@enum`, `@event`/`@fires`/`@listens`
- Linting (ESLint): Avoid linting jsdoc folder
- Testing: Use new Sinon

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
    * Default extensions will now always load (along with those supplied in the URL unless the latter is prohibited by configuration), so if you do not wish your old code to load all of the default extensions, you will need to add `&noDefaultExtensions=true` to the URL (or add equivalent configuration in config.js). ext-overview_window.js can now be excluded though it is still a default.
    * Preferences and configuration options must be within the list supplied within svg-editor.js (should include those of all documented extensions).
    * Embedded messaging will no longer work by default for privacy/data integrity reasons. One must include the "ext-xdomain-messaging.js" extension and supply an array configuration item, "allowedOrigins" with potential values including: "\*" (to allow all domains--strongly discouraged!), "null" as a string to allow `file:///` access, window.location.origin (to allow same domain access), or specific trusted origins. The embedded editor works without the extension if the main editor is on the same domain, but if cross-domain control is needed, the "allowedOrigins" array must be supplied by a call to svgEditor.setConfig({allowedOrigins: [origin1, origin2, etc.]}) in the new config.js file.

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
- Main menu and overall interface improvements
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
