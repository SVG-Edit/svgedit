Introduction

This page describes the current release and previous versions of SVG-edit. For planned future versions (or current trunk-only features), see the Roadmap.

You can see the changes of the upcoming version here: http://code.google.com/p/svg-edit/source/list

As of 2011-09-29 (and for 2.6+ versions), the license was changed from Apache License v2.0 to MIT.
Current release: 2.7.1 (applied to 2.7 branch)

    Fix important ID situation with embedded API
    Update functions available to embedded editor

Version 2.7 ([Deltoid curve](https://en.wikipedia.org/wiki/Deltoid_curve))
New Features

    Export to PNG, JPEG, BMP, WEBP (including quality control for JPEG/WEBP) for default editor and for the server_opensave extension
    Added Star, Polygon, and Panning Extensions [r2318](https://code.google.com/p/svg-edit/source/detail?r=2318) [r2319](https://code.google.com/p/svg-edit/source/detail?r=2319) [r2333](https://code.google.com/p/svg-edit/source/detail?r=2333)
    Added non-default extension, ext-xdomain-messaging.js, moving cross-domain messaging code (as used by the embedded editor) out of core and requiring, when the extension IS included, that configuration (an array "allowedOrigins") be set in order to allow access by any domain (even same domain).
    Cause embedded editor to pass on URL arguments to the child editor (child iframe)
    Added default extension, ext-storage.js moving storage setting code into this (optional) extension; contains dialog to ask user whether they wish to utilize local storage for prefs and/or content; provides configuration options to tweak behaviors.
    Allow for a new file config.js within the editor folder (but not committed to SVN and ignored) which is always loaded and can be used for supplying configuration which happens early enough to affect URL or user storage configuration, in addition to extension behavior configuration. Provided config-sample.js to indicate types of configuration one could use (see also defaultPrefs, defaultExtensions, and defaultConfig within svg-editor.js )
    Added configuration "preventAllURLConfig", "lockExtensions", and/or "preventURLContentLoading" for greater control of what can be configured via URL.
    Allow second argument object to setConfig containing "allowInitialUserOverride" booleans to allow for preference config in config.js to be overridden by URL or preferences in user storage; also can supply "overwrite" boolean in 2nd argument object if set to false to prevent overwriting of any prior-set configuration (URL config/pref setting occurs in this manner automatically for security reasons).
    Allow server_opensave extension to work wholly client-side (if browser [supports](http://caniuse.com/#feat=download) the download attribute)
    Added [WebAppFind](https://github.com/brettz9/webappfind) extension
    Added new php_savefile extension to replace outdated, non-functioning server-save code; requires user to create "savefile_config.php" file and do any validation there (for their own security)
    Use addEventListener for 'beforeunload' event so user can add their own if desired
    Changed locale behavior to always load from locale file, including English. Allow extensions to add new "langReady" callback which is passed an object with "lang" and "uiStrings" properties whenever the locale data is first made available or changed by the user (this callback will not be invoked until the locale data is available). Extensions can add strings to all locales and utilize this mechanism.
    Made fixes impacting path issues and also ext-connector.js
    Fixed a bug where the position number supplied on an extension object was too high (e.g., if too few other extensions were included, the extension might not show up because its position was set too high).
    Added Polish locale
    Zoom features
    Make extension paths relative within extensions (issue [1184](https://code.google.com/p/svg-edit/issues/detail?id=1184&can=1&sort=-id&colspec=ID%20Type%20Status%20Priority%20NeededFor%20Browser%20Owner%20Summary))
    Security improvements and other fixes
    Embedded editor can now work same domain without JSON parsing and the consequent potential loss of arguments or return values.
    Potentially breaking API changes:
        Disallowed "extPath", "imgPath", "langPath", and "jGraduatePath" setting via URL and prevent cross-domain/cross-folder extensions being set by URL (security enhancement)
        Deprecated "pngsave" option called by setCustomHandlers() in favor of "exportImage" (to accommodate export of other image types). Second argument will now supply, in addition to "issues" and "svg", the properties "type" (currently 'PNG', 'JPEG', 'BMP', 'WEBP'), "mimeType", and "quality" (for 'JPEG' and 'WEBP' types).
        Default extensions will now always load (along with those supplied in the URL unless the latter is prohibited by configuration), so if you do not wish your old code to load all of the default extensions, you will need to add &noDefaultExtensions=true to the URL (or add equivalent configuration in config.js). ext-overview_window.js can now be excluded though it is still a default.
        Preferences and configuration options must be within the list supplied within svg-editor.js (should include those of all documented extensions).
        Embedded messaging will no longer work by default for privacy/data integrity reasons. One must include the "ext-xdomain-messaging.js" extension and supply an array configuration item, "allowedOrigins" with potential values including: "*" (to allow all domains--strongly discouraged!), "null" as a string to allow file:// access, window.location.origin (to allow same domain access), or specific trusted origins. The embedded editor works without the extension if the main editor is on the same domain, but if cross-domain control is needed, the "allowedOrigins" array must be supplied by a call to svgEditor.setConfig({allowedOrigins: [origin1, origin2, etc.]}) in the new config.js file.
        [http://code.google.com/p/svg-edit/issues/list?can=1&q=NeededFor%3D2.6&colspec=ID+Type+Status+Priority+NeededFor+Browser+Owner+Summary&cells=tiles many more] '>

Release date

    April 7th, 2014

Demo

    http://svg-edit.googlecode.com/svn/branches/2.7/editor/svg-editor.html

Version 2.6 ([Cycloid](http://en.wikipedia.org/wiki/Cycloid))
New Features

    [Support for Internet Explorer 9](http://code.google.com/p/svg-edit/issues/detail?id=120)
    Context menu
    [Cut/Copy/Paste/Paste in Place options](http://code.google.com/p/svg-edit/issues/detail?id=612)
    [Gridlines, snap to grid](http://code.google.com/p/svg-edit/issues/detail?id=131)
    Merge layers
    Duplicate layer
    [Image library](http://code.google.com/p/svg-edit/issues/detail?id=71)
    [Shape library](http://code.google.com/p/svg-edit/issues/detail?id=541)
    [Basic Server-based tools for file opening/saving](http://code.google.com/p/svg-edit/issues/detail?id=582)
    In-group editing
    Cut/Copy/Paste
    [full list](http://code.google.com/p/svg-edit/issues/list?can=1&q=label%3ANeededFor-2.6)

Release Date

    [January 15th, 2013](http://code.google.com/p/svg-edit/source/detail?r=2281)

Demo

    http://svg-edit.googlecode.com/svn/branches/2.6/editor/svg-editor.html

Version 2.5 ([Bicorn](http://en.wikipedia.org/wiki/Bicorn))
New Features

    [Open Local Files](http://code.google.com/p/svg-edit/issues/detail?id=392) (Firefox 3.6+ only)
    [Import SVG into Drawing](http://code.google.com/p/svg-edit/issues/detail?id=72) (Firefox 3.6+ only)
    [Ability to create extensions/plugins](http://code.google.com/p/svg-edit/issues/detail?id=310)
    [Main menu and overal interface improvements](http://code.google.com/p/svg-edit/issues/detail?id=313)
    [Create and select elements outside the canvas](http://code.google.com/p/svg-edit/issues/detail?id=185)
    [Base support for the svg:use element](http://code.google.com/p/svg-edit/issues/detail?id=424)
    [Add/Edit Sub-paths](http://code.google.com/p/svg-edit/issues/detail?id=443)
    [Multiple path segment selection](http://code.google.com/p/svg-edit/issues/detail?id=277)
    [Radial Gradient support](http://code.google.com/p/svg-edit/issues/detail?id=298)
    [Connector lines](http://code.google.com/p/svg-edit/issues/detail?id=200)
    [Arrows & Markers](http://code.google.com/p/svg-edit/issues/detail?id=308)
    [Smoother freehand paths](http://code.google.com/p/svg-edit/issues/detail?id=341)
    Foreign markup support (ForeignObject/MathML)
    [Configurable options](http://code.google.com/p/svg-edit/issues/detail?id=427)
    [File-loading options](http://code.google.com/p/svg-edit/issues/detail?id=65)
    [Eye-dropper tool (copy element style)](http://code.google.com/p/svg-edit/issues/detail?id=115)
    [Stroke linejoin and linecap options](http://code.google.com/p/svg-edit/issues/detail?id=440)
    [Export to PNG](http://code.google.com/p/svg-edit/issues/detail?id=70)
    [Blur tool](http://code.google.com/p/svg-edit/issues/detail?id=75)
    [Page-align single elements](http://code.google.com/p/svg-edit/issues/detail?id=135)
    [Inline text editing](http://code.google.com/p/svg-edit/issues/detail?id=364)
    [Line draw snapping with Shift key](http://code.google.com/p/svg-edit/issues/detail?id=520)

Release Date

    June 15th, 2010

Demo

    http://svg-edit.googlecode.com/svn/branches/2.5/editor/svg-editor.html

Version 2.4 ([Arbelos](http://en.wikipedia.org/wiki/Arbelos))
New Features

    [Raster Images](http://code.google.com/p/svg-edit/issues/detail?id=57)
    [Select Non-Adjacent Elements](http://code.google.com/p/svg-edit/issues/detail?id=119)
    [Group/Ungroup](http://code.google.com/p/svg-edit/issues/detail?id=40)
    [Zoom](http://code.google.com/p/svg-edit/issues/detail?id=38)
    [Layers](http://code.google.com/p/svg-edit/issues/detail?id=73)
    [Curve Segments in Paths](http://code.google.com/p/svg-edit/issues/detail?id=118)
    [UI Localization](http://code.google.com/p/svg-edit/issues/detail?id=64)
    [Wireframe Mode](http://code.google.com/p/svg-edit/issues/detail?id=106)
    [Change Background](http://code.google.com/p/svg-edit/issues/detail?id=39)
    [Convert Shapes to Path](http://code.google.com/p/svg-edit/issues/detail?id=68)

Release Date

    January 11th, 2010

Demo

    http://svg-edit.googlecode.com/svn/branches/2.4/editor/svg-editor.html

Full Release Notes
New SVG support

    Raster Images
        Raster images (PNGs, JPEGs, etc) can now be added and where possible can be entirely embedded in the SVG file.
    Group elements
        Elements can be added into a group, and each group can be transformed like any other element. Any groups can also be ungrouped.
    Add/Remove path nodes
        After a path has been created, nodes can now be added or removed.
    Curved Paths
        After a path has been created, the straight segments (lines between nodes) can be turned into curved segments. Curves can be finely tuned by adjusting their control points.
    Floating point values for all attributes
        Attribute values are no longer restricted to integers.
    Text fields for all attributes
        Attributes values are no longer limited to those given in dropdown lists, any (valid) value can now be entered.
    Title element
        Images and layer groups can now be given a title.

New Interface features

    Zoom
        The canvas can now be zoomed in or out using a variety of methods:
        Using the up/down buttons on the zoom spinner tool in the bottom-left corner
        Using the dropdown button next to the zoom spinner tool (includes several "Fit to..." options)
        Clicking on the magnifier icon to draw a zoom box, or just click/shift-click on an area to zoom in/out
        Double-click tho magnifier icon to return to 100% zoom
        Hold the shift key and use the scroll wheel on your mouse to zoom in/out on the area the cursor is on
    Layers
        Using the panel on the right (click or drag the "Layers" handle), additional layers can be created. Layers can be shown/hidden by clicking on the eye icon, and re-arranged by using the up and down buttons. To move one or more elements to another layer: select the elements, then choose the destination layer from the dropdown list under the layer list.
    UI Localization
        In addition to English, there are now several language options available for the SVG-Edit interface. When loaded for the first time, SVG-Edit will automatically switch to the language the browser has been set to. Else it will use the language specified in the Document Properties interface. Current supported languages are:
        Czech
        Dutch
        Farsi
        French
        German
        Romanian
        Slovak
        Spanish
    Wireframe Mode
        Clicking on the wireframe button (the outlined square and circle icon on the top panel) makes all shapes appear only as outlines, allowing shapes to be seen regardless of their position or opacity level.
    Resizable UI (SVG icons)
        A dropdown list for the "Icon size" has been added in the Document Properties. This allows toolbars to be set at a smaller or larger size than the default. By using SVG, the icons will appear as intended at any size.
    Set background color and/or image (for tracing)
        The default white background of the canvas can now be changed to a different color in the Document Properties. Additionally, a URL to an image can be given that can be used to trace over.
    Convert Shapes to Paths
        All shapes (except text and raster images) can now be converted to path elements by clicking on the "Convert to Path" icon in the context menu. This then allows the shapes to be modified by editing their nodes and segments.
    X, Y coordinates for all elements
        Elements that do not actually have base x and y values can now be positioned using them anyway, based on the top-left coordinates of their bounding box.
    Draggable Dialog boxes
        The color/gradient picker and other dialog boxes can now be dragged around.
    Select Non-Adjacent Elements
        Previously selecting multiple elements was only possible by dragging, you can now select/deselect elements by shift-clicking them while in "select" mode.
    Fixed-ratio resize
        While resizing elements, you can now hold the shift key to keep the width/height ratio the same.
    Automatic Tool Switching
        After drawing an element, you will remain in the same mode you were in. However, if you simply click on another element, you will automatically go into "Select" mode.

Version 2.3
New Features

    [Align Objects](http://code.google.com/p/svg-edit/issues/detail?id=52)
    [Rotate Objects](http://code.google.com/p/svg-edit/issues/detail?id=42)
    [Clone Objects](http://code.google.com/p/svg-edit/issues/detail?id=51)
    [Select Next/Prev Object](http://code.google.com/p/svg-edit/issues/detail?id=102)
    [Edit SVG Source](http://code.google.com/p/svg-edit/issues/detail?id=59)
    [Gradient picking](http://code.google.com/p/svg-edit/issues/detail?id=33)
    [Polygon Mode](http://code.google.com/p/svg-edit/issues/detail?id=34) (Path Editing, Phase 1)
    [(full list)](http://code.google.com/p/svg-edit/issues/list?can=1&q=label%3ANeededFor-2.3)

Release Date

    September 8th, 2009

Demo

    http://svg-edit.googlecode.com/svn/branches/2.3/editor/svg-editor.html

Version 2.2
New Features

    [Multiselect Mode](http://code.google.com/p/svg-edit/issues/detail?id=31)
    [Undo/Redo Actions](http://code.google.com/p/svg-edit/issues/detail?id=19)
    [Resize Elements](http://code.google.com/p/svg-edit/issues/detail?id=27)
    Contextual tools for rect, circle, ellipse, line, text elements
    Some updated button images
    Stretched the UI to fit the browser window
    Resizing of the SVG canvas
    Upgraded to jPicker 1.0.8
    [(full list)](http://code.google.com/p/svg-edit/issues/list?can=1&q=label%3ANeededFor-2.2)

Release Date

    July 8th, 2009

Demo

    http://svg-edit.googlecode.com/svn/branches/2.2/editor/svg-editor.html

Version 2.1
New Features

    tooltips added to all UI elements
    edit of fill opacity, stroke opacity, group opacity
    selection of elements
    move/drag of elements
    save SVG file to separate tab
    create and edit text elements
    contextual panel of tools
    change rect radius, font-family, font-size
    keystroke handling
    [(full list)](http://code.google.com/p/svg-edit/issues/list?can=1&q=label%3ANeededFor-2.1)

Release Date

    June 17th, 2009

Demo

    http://svg-edit.googlecode.com/svn/branches/2.1/editor/svg-editor.html

Version 2.0
New Features

    draw ellipse, square
    change stroke-dasharray (line style)
    rearranged whole code to OOP
    GUI enhancement

Release Date

    [June 3rd, 2009](http://code.google.com/p/svg-edit/source/detail?r=24)

Demo

    http://svg-edit.googlecode.com/svn/branches/2.0/svg-editor.html

Version 1.0
New Features

    draw path, line, freehand-circle, rect
    clear drawn image
    delete element
    save image

[Release Date](http://code.google.com/p/svg-edit/source/detail?r=9)

    Feb 13, 2009

Demo

    http://svg-edit.googlecode.com/svn/branches/1.0/svg-editor.html
