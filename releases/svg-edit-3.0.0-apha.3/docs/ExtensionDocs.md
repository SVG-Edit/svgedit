# Introduction

As of version 2.5, SVG-Edit has support for extensions. This an (in-progress) guide for creating SVG-Edit plugins.

## Basic format

SVG-Edit plugins are standalone JavaScript files that can be either included in the HTML file or loaded using setConfig or through the URL (see ConfigOptions for usage).

Note that if you create a `svgedit-config-iife.js` file in the project root directory, this will be used to execute commands before extensions are loaded, e.g., if you wish to make configuration changes which affect extension loading behavior. Normally, however, it should be preferable for modularity to use the extension mechanism, as this can allow you or users to customize which extensions are loaded (whereas `svgedit-config-iife.js` will always run if present).

This is the general format for an extension:

```js
svgEditor.addExtension('extensionName', function (methods) {
  return extensionData;
});
```

The first parameter (`extensionName`) is the unique name for this extension.

The second parameter is a function that supplies methods and variables from svgCanvas and can return an object that includes properties and functions related to the extension.

The basic Hello world extension can be used as an example on how to create a basic extension. This extension adds a "mode" button to the bottom of the left panel that changes the mode, then shows a "Hello world" message whenever the canvas is clicked on. See [extension in action](https://svg-edit.github.io/svgedit/releases/svg-edit-2.8.1/svg-editor.html?extensions=ext-helloworld.js).

The basic structure of this plugin looks like this:

```js
svgEditor.addExtension('Hello World', function () {

  // Returning an object is optional as of v2.7+
  return {
      // name: '', // A name has traditionally been added but apparently not needed?
      svgicons: 'extensions/helloworld-icon.xml',
      buttons: [{...}],
      mouseDown() {
          ...
      },
      mouseUp(opts) {
          ...
      }
  };
});
```

Note how the returned properties include information on the buttons, as well as the functions that should be run when certain events take place.

## Creating buttons

Buttons can appear either in the mode panel (left panel) or the context panel (top panel, changes depending on selection). Their icons can either consist of SVG icons (recommended) or just raster images.

Each button is an object with the following properties (added to the array "buttons" on the object provided by the extension):

| Property | Description | Required? |
|:---------|:------------|:----------|
| `id` (string) | A unique identifier for this button. If SVG icons are used, this must match the ID used in the icon file. | Yes |
| `type` (string) | Type of button. Must be either 'mode' or 'context' | Yes |
| `title` (string) | The tooltip text that will appear when the user hovers over the icon | Yes |
| `icon` (string) | The file path to the raster version of the icon. | Only if no svgicons is supplied |
| `svgicon` (string) | If absent, will utilize the button "id"; used to set "placement" on the svgIcons call | No |
| `list` (string) | Points to the "id" of a context_tools item of type "button-select" into which the button will be added as a panel list item | No |
| `position` (integer) | The numeric index for placement; defaults to last position (as of the time of extension addition) if not present | No |
| `panel` (string) | The ID of the context panel to be included, if type is "context". | Only if type is "context" |
| `events` (object) | DOM event names with associated functions. Example: {click: function() { alert('Button was clicked') } } | Yes |
| `includeWith` (object) | Object with flyout menu data (see following properties) | No |
| `includeWith[button]` (string) | jQuery selector of the existing button to be joined. Example: '#tool_line' | Yes (if includeWith is used) |
| `includeWith[isDefault]` (boolean) | Option indicating whether button is default in flyout list or not | No |
| `isDefault` (boolean) | Whether or not the default is the default | No |
| `includeWith[position]` (integer) | Position of icon in flyout list, will be added to end if not indicated | No |
| `key` (string) | The key to bind to the button | No |

## Creating SVG icons

The SVG-Edit project uses icons created using basic SVG (generally using SVG-Edit as design tool), and extensions are encouraged to do so too. This allows the interface toolbars to be resized and icons to be reused at various sizes. If your extension uses multiple icons, they can all be stored in the same file. To specify icon file used, set the path under the extension's returned svgicons property.

An SVG icon file is an XML document that consists of a root SVG element with child group elements (`<g></g>`). Each of these has an ID that should match the ID specified in the associated button object. Its content should be the SVG source of the icon. See the Hello World icon as an example.

For further information, see the SVG Icon Loader project.

## Creating context tools

Context tools appear in the top toolbar whenever a certain type of element is selected.

These are added by the extension returning an object with the property "context_tools".

| Property | Description | Required? |
|:---------|:------------|:----------|
| `panel` (string) | The ID of the existing panel for the tool to be added to | Yes |
| `container_id` (string) | The ID to be given to the tool's container element | No |
| `type` (string) | The type of tool being added. Must be one of the following: 'tool_button', 'select', 'input' | Yes |
| `id` (string) | The ID of the actual tool element | Yes |
| `events` (object) | DOM event names with associated functions. Example: {change: function() { alert('Option was changed') } } | Yes |
| `options` (object) | List of options and their labels for select tools. Example: `{1: 'One', 2: 'Two', all: 'All' } | Only for "select" tools |
| `defval` (string) | Default value | No |
| `label` (string) | Label associated with the tool, visible in the UI | No |
| `title` (string) | The tooltip text that will appear when the user hovers over the tool | Yes |
| `size` (integer) | Value of the "size" attribute of the tool input | No |
| `spindata` (object) | When added to a tool of type "input", this tool becomes a "spinner" which allows the number to be in/decreased. For data required see The SpinButton script | No |
| `colnum` (integer) | Added as part of the option list class. | No |

## SVG-Edit events

Most plugins will want to run functions when certain events are triggered. This is a list of the current events that can be hooked onto. All events are optional.

| Event | Description | Parameters | Return value expected | |:------|:------------|:-----------|:----------------------|
| `mouseDown` | The main (left) mouse button is held down on the canvas area | Supplies an object with these properties: `evt` (the event object), `start_x` (x coordinate on canvas), `start_y` (y coordinate on canvas), `selectedElements` (an array of the selected Elements) | An optional object with started: true to indicate that creating/editing has started |
| `mouseMove` | The mouse is moved on the canvas area | Same as for `mouseDown`, but with a selected property that refers to the first selected element | None |
| `mouseUp` | The main (left) mouse button is released (anywhere) | Same as for `mouseDown` | An optional object with these properties: `element` (the element being affected), `keep` (boolean that indicates if the current element should be kept) `started` (boolean that indicates if editing should still be considered as "started") |
| `zoomChanged` | The zoom level is changed | Supplies the new zoom level as a number (not percentage) | None |
| `selectedChanged` | The element selection has changed (elements were added/removed from selection | Supplies an object with these properties: `elems` (array of the newly selected elements), `selectedElement` (the single selected element), `multiselected` (a boolean that indicates whether one or more elements was selected) | None |
| `elementChanged` | One or more elements were changed | Object with properties: `elems` (array of the affected elements) | None |
| `elementTransition` | Called when part of element is in process of changing, generally on mousemove actions like rotate, move, etc. | Object with properties: `elems` (array of transitioning elements) | None |
| `toolButtonStateUpdate` | The bottom panel was updated | Object with these properties: `nofill` (boolean that indicates fill is disabled), `nostroke` (boolean that indicates stroke is disabled) | None |
| `langChanged` | The language was changed | Two-letter code of the new language | None |
| `langReady` | Invoked as soon as the locale is ready | An object with properties "lang" containing the two-letter language code and "uiStrings" as an alias for svgEditor.uiStrings | None |
| `addlangData` | Means for an extension to add locale data | The two-letter language code | Object with "data" property set to an object containing two-letter language codes keyed to an array of objects with "id" and "title" or "textContent" properties |
| `callback` | Invoked upon addition of the extension, or, if svgicons are set, then after the icons are ready | None | None |
| `canvasUpdated` | Invoked upon updates to the canvas | Object with properties: new_x, new_y, old_x, old_y, d_x, d_y | None |
| `onNewDocument` | Called when new image is created | None | None |
| `workareaResized` | Called when sidepanel is resized or toggled | None | None |

## Helper functions

A variety of methods can be accessed within plugins. In the future, we hope to have them all properly documented, for now here is the current list of function/variable names.

## `svgCanvas` variables

These are supplied in an object through the first parameter of the extension function (see "methods" variable in above example).

| Name | Description |
|:-----|:------------|
| `svgroot` (element) | The workarea's root SVG element. NOT the root SVG element of the image being edited |
| `svgcontent` (element) | The root SVG element of the image being edited |
| `nonce` (number) | The unique identifier given to this image |
| `selectorManager` (object) | The object that manages selection information |

## `svgEditor` public methods

| Name | Description | Params | Return value |
|:-----|:------------|:-------|:-------------|
| `setCustomHandlers()` | Override default SVG open, save, and export behaviors | Accepts object with all optional properties, `open`, `save`, and `exportImage`; `open` is not passed any parameters; `saved` is passed a string containing the SVG; `exportImage` is passed an object containing the properties: `svg` with the SVG contents as a string, `datauri` with the contents as a data URI, `issues` with an array of UI strings pertaining to relevant known CanVG issues, `type` indicating the chosen image type ("PNG", "JPEG", "BMP", "WEBP") (or, as planned for 3.0.0, "PDF" type), `mimeType` for the MIME type, `exportWindowName` as a convenience for passing along a window.name to target a window on which the export could be added, and `quality` as a decimal between 0 and 1 (for use with JPEG or WEBP) | (None) | | ... | ... | ... | ... |

## `svgCanvas` private methods

These are supplied in an object through the first parameter of the extension function (see `methods` variable in above example).

| Name | Description |
|:-----|:------------|
| `addCommandToHistory()` | |
| `addGradient()` | |
| `addSvgElementFromJson()` | |
| `assignAttributes()` | |
| `BatchCommand()` | |
| `call()` | |
| `ChangeElementCommand()` | |
| `cleanupElement()` | |
| `copyElem()` | |
| `ffClone()` | |
| `findDefs()` | |
| `findDuplicateGradient()` | |
| `fromXml()` | |
| `getElem()` | |
| `getId()` | |
| `getIntersectionList()` | |
| `getNextId()` | |
| `getPathBBox()` | |
| `getUrlFromAttr()` | |
| `hasMatrixTransform()` | |
| `identifyLayers()` | |
| `InsertElementCommand()` | |
| `isIdentity()` | |
| `logMatrix()` | |
| `matrixMultiply()` | |
| `MoveElementCommand()` | |
| `preventClickDefault()` | |
| `recalculateAllSelectedDimensions()` | |
| `recalculateDimensions()` | |
| `remapElement()` | |
| `RemoveElementCommand()` | |
| `removeUnusedGrads()` | |
| `resetUndoStack()` | |
| `round()` | |
| `runExtensions()` | |
| `sanitizeSvg()` | |
| `Selector()` | |
| `SelectorManager()` | |
| `shortFloat()` | |
| `svgCanvasToString()` | |
| `SVGEditTransformList()` | |
| `svgToString()` | |
| `toString()` | |
| `toXml()` | |
| `transformBox()` | |
| `transformListToTransform()` | |
| `transformPoint()` | |
| `transformToObj()` | |
| `walkTree()` | |

## `svgCanvas` public methods

| Name | Description |
|:-----|:------------|
| `addToSelection()` | |
| `alignSelectedElements()` | |
| `beginUndoableChange()` | |
| `bind()` | |
| `changeSelectedAttribute()` | |
| `changeSelectedAttributeNoUndo()` | |
| `clear()` | |
| `clearSelection()` | |
| `cloneSelectedElements()` | |
| `convertToPath()` | |
| `createLayer()` | |
| `cycleElement()` | |
| `deleteCurrentLayer()` | |
| `deleteSelectedElements()` | |
| `each()` | |
| `embedImage()` | |
| `finishUndoableChange()` | |
| `fixOperaXML()` | |
| `getBBox()` | |
| `getBold()` | |
| `getContentElem()` | |
| `getCurrentLayer()` | |
| `getEditorNS()` | |
| `getFillColor()` | |
| `getFillOpacity()` | |
| `getFontFamily()` | |
| `getFontSize()` | |
| `getHistoryPosition()` | |
| `getImageTitle()` | |
| `getItalic()` | |
| `getLayer()` | |
| `getLayerOpacity()` | |
| `getLayerVisibility()` | |
| `getMode()` | |
| `getNextRedoCommandText()` | |
| `getNextUndoCommandText()` | |
| `getNumLayers()` | |
| `getOffset()` | |
| `getOpacity()` | |
| `getPrivateMethods()` | |
| `getRedoStackSize()` | |
| `getResolution()` | |
| `getRootElem()` | |
| `getRotationAngle()` | |
| `getSelectedElems()` | |
| `getStrokeColor()` | |
| `getStrokeOpacity()` | |
| `getStrokeStyle()` | |
| `getStrokeWidth()` | |
| `getStrokedBBox()` | |
| `getSvgString()` | |
| `getText()` | |
| `getTransformList()` | |
| `getUndoStackSize()` | |
| `getUrlFromAttr()` | |
| `getVersion()` | |
| `getVisibleElements()` | |
| `getZoom()` | |
| `groupSelectedElements()` | |
| `importSvgString()` | |
| `isValidUnit()` | |
| `linkControlPoints()` | |
| `matrixMultiply()` | |
| `moveSelectedElements()` | |
| `moveSelectedToLayer()` | |
| `moveToBottomSelectedElement()` | |
| `moveToTopSelectedElement()` | |
| `open()` | |
| `randomizeIds()` | |
| `ready()` | |
| `redo()` | |
| `removeFromSelection()` | |
| `renameCurrentLayer()` | |
| `runExtensions()` | |
| `save()` | |
| `selectAllInCurrentLayer()` | |
| `setBBoxZoom()` | |
| `setBackground()` | |
| `setBold()` | |
| `setConfig()` | |
| `setCurrentLayer()` | |
| `setCurrentLayerPosition()` | |
| `setFillColor()` | |
| `setFillOpacity()` | |
| `setFillPaint()` | |
| `setFontFamily()` | |
| `setFontSize()` | |
| `setIdPrefix()` | |
| `setImageTitle()` | |
| `setImageURL()` | |
| `setItalic()` | |
| `setLayerOpacity()` | |
| `setLayerVisibility()` | |
| `setMode()` | |
| `setOpacity()` | |
| `setRectRadius()` | |
| `setResolution()` | |
| `setRotationAngle()` | |
| `setSegType()` | |
| `setStrokeColor()` | |
| `setStrokeOpacity()` | |
| `setStrokePaint()` | |
| `setStrokeStyle()` | |
| `setStrokeWidth()` | |
| `setSvgString()` | |
| `setTextContent()` | |
| `setUiStrings()` | |
| `setZoom()` | |
| `smoothControlPoints()` | |
| `undo()` | |
| `ungroupSelectedElement()` | |
| `updateCanvas()` | |
| `updateElementFromJson()` | |
