# Introduction

## `save`, `open`, `exportImage` (`setCustomHandlers`)

You can hook to the save event (e.g. in an extension), to handle saving
the SVG file differently:

### Example
```js
svgEditor.setCustomHandlers({
  save (_win, _data) {
    // Save svg
  }
})
```

Other methods corresponding to UI events that may be supplied are `open`
and `exportImage`.

See [`CustomHandler`]{@link module:SVGEditor.CustomHandler} for the required
format of the object to be passed to
[`setCustomHandlers`]{@link module:SVGEditor.setCustomHandlers}.

## Parent/Opening window events

### `svgEditorReady`

The `svgEditorReady` event is triggered on a containing `document` (of
`window.opener` or `window.parent`) when the editor is loaded.

See [svgEditorReadyEvent]{@link module:SVGEditor#event:svgEditorReadyEvent}
for the JSDocs.

### Example

```js
$(document).bind('svgEditorReady', function () {
  const svg = `
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
      "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
      <ellipse cx="50" cy="25" rx="50" ry="25" style="fill:blue;"/>
    </svg>`
  $('iframe.svgedit')[0].contentWindow.svgCanvas.setSvgString(svg)
})
```

If you are acting within the frame, you may use `svgEditor.ready`
(see "Editor (within-frame) events (`svgEditor`)" below).

## Editor (within-frame) events (`svgEditor`)

### `svgEditor.canvas`

- Canvas object. See "Canvas events".

### `svgEditor.canvas.bind(eventName, function () {})`

- Method for listening to canvas events. See "Canvas events".

### `svgEditor.ready(function () {})`

Method for listening to editor callbacks. Used internally as well.

No arguments passed to callback.

See [`SVGEditor.ready`]{@link module:SVGEditor.ready}.

## Extension events

Most extensions will want to run functions when certain events are
triggered. This is a list of the current events that can be hooked
onto. All events are optional.

See the `vars` param of
[`runExtensions`]{@link module:svgcanvas.SvgCanvas#runExtensions}
for some of the available extension events and their descriptions and types.

See [`ExtensionStatus`]{@link module:svgcanvas.ExtensionStatus} for the
values to be returned by the corresponding extension methods listening
for these extension event types.

## Canvas events

Canvas events are listened to with the bind method
([JSDocs API]{@link module:svgcanvas.SvgCanvas#bind}):

```js
canvas.bind(eventName, callback)
```

Canvas events are passed between the editor and canvas and should mostly
only of be of interest to those working with the [Canvas]{@tutorial CanvasAPI}
alone or those developing SVGEdit).

`callback` (see [`EventHandler`]{@link module:svgcanvas.EventHandler}) will be passed the
`window` object and a single argument specific to the event
(see [`GenericCanvasEvent`]{@link module:svgcanvas.SvgCanvas#event:GenericCanvasEvent}).

The `bind` method will return any previous callback attached to the given
event name.

The method used to trigger these bound events is `call()`
([JSDocs]{@link module:svgcanvas.SvgCanvas#call}).

All events below are currently called from within `svgcanvas.js` except where
noted. All events are also defined internally within `svg-editor.js` except
where noted.

|Event|Where bound/defined (besides editor)|Where called/triggered (besides canvas)|
|-----|------------------------------------|-----------------------------|
|`changed` | | (Also called from `draw.js`, `ext-arrows.js`, `ext-foreignObject.js`, `ext-markers.js`, `ext-polygon.js`, `ext-star.js`, and `path.js`) |
|`cleared` | Not bound/defined in SVGEdit. | |
|`contextset` | | Only called from `draw.js`|
|`exported` | | |
|`exportedPDF` | | |
|`extension_added` | | |
|`extensions_added` | | Only called from `svg-editor.js` |
|`message` | Only bound/defined in `ext-webappfind.js` | Only called from `svg-editor.js` |
|`pointsAdded` | Not bound/defined in SVGEdit. | |
|`saved` | | |
|`selected` | | Also called from `path.js` |
|`setnonce` | Only bound/defined in `ext-arrows.js` | |
|`transition` | | |
|`updateCanvas` | | |
|`unsetnonce` | Only bound/defined in `ext-arrows.js` | |
|`zoomed` | | |
|`zoomDone` | | |
