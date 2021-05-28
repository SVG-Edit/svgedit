# Introduction

SVG-Edit has support for extensions. This is a guide for creating
SVG-Edit extensions.

## Means to have extensions loaded

SVG-Edit extensions are standalone JavaScript files that can be either
included in the HTML file, loaded using `setConfig`, or indicated through
the URL (see [ConfigOptions]{@tutorial ConfigOptions} for usage).

`svgedit-config-iife.js` in the `src` directory (if
through Git clone, by running `npm run build-by-config`) is the file used
by `svg-editor.html` to execute commands before extensions are loaded,
e.g., if you wish to make configuration changes which affect extension
loading behavior.

Normally, however, it should be preferable for modularity
to use the extension mechanism, as this can allow you or users to customize
which extensions are loaded (whereas `svgedit-config-iife.js` will always
run if present).

## Basic format

This is the general format for an extension:

```js
export default {
  name: 'extensionname',
  init (_methods) {
    return extensionData;
  }
};
```

Extensions must export an object. (For the API docs of this object, see
[ExtensionObject]{@link module:SVGEditor.ExtensionObject}.)

The first property on the object exported above, `name`, is the unique
ID for this extension. It can actually be omitted, in which case the
ID (not shown visually) will instead be determined from the file name
(omitting the initial "ext-" and ending ".js"). These are not displayed
visually, so the only purpose is to avoid name conflicts with other
extensions.

The other property above (`init`) is a function (see
[`ExtensionInitCallback`]{@link module:svgcanvas.ExtensionInitCallback}
for its API) that is supplied methods and variables from svgCanvas (see
[`ExtensionArgumentObject`]{@link module:svgcanvas.ExtensionArgumentObject})
and can return an object that includes properties and functions that may
be required for further processing by
the extension, depending on the type of methods desired by the extension
being added. See [`ExtensionInitResponse`]{@link module:svgcanvas.ExtensionInitResponse}
for API documentation on the response type(s) available for `init`.

Its `this` value is bound to the editor, so
[those methods]{@link module:SVGEditor} are also available.

In order to await execution of set-up such as calls to `langReady` and
`svgIcons`, the callback `callback` can be added to the object returned with
the call to `init`. The callback is invoked upon addition of the extension,
or, if svgicons are set, then after the icons are ready. See
[`ExtensionInitResponse#callback`]{@link module:svgcanvas.ExtensionInitResponse#callback}
in the API for more on this.

## Example

The basic Hello world extension (in `/editor/extensions/ext-helloworld.js`)
can be seen as an example on how to create a basic extension. This extension
adds a "mode" button to the bottom of the left panel that changes the mode,
then shows a "Hello world" message whenever the canvas is clicked on. See
[extension in action](https://svg-edit.github.io/svgedit/releases/latest/editor/svg-editor.html?extensions=ext-helloworld.js).

The basic structure of this extension looks like this:

```js
export default {
  name: 'helloworld',
  init () {
    return {
      svgicons: 'extensions/helloworld-icon.xml',
      buttons: [ { /* ... */ } ],
      mouseDown () {
        // ...
      },
      mouseUp (_opts) {
        // ...
      }
    };
  }
};
```

Note how the returned properties may include information on the buttons,
as well as the functions that should be run when certain events take place.

The "Hello World" extension also demonstrates internationalization (see
the next section).

## Internationalization of extensions

The locale files for extensions (which need translation as with the main
locales) are hosted in `editor/extensions/ext-locale/<ext name>/`.

Both `addLangData`
([JSDocs]{@link module:svgcanvas.ExtensionInitResponse#addLangData})
(invoked early)
and `langReady`
([JSDocs]{@link module:svgcanvas.ExtensionInitResponse#langReady})
are passed objects with an `importLocale` function
([JSDocs]{@link module:SVGEditor~ImportLocale}) (as well as
`init`--see the Basic Format section) that you can use to
import your own extension locales hosted in the above-mentioned directory.

The `importLocale` function will use the detected locale and detected
extension name by default (no need for arguments), and returns a
`Promise` that will resolve to the locale strings found within a
file you place at:

`${svgEditor.curConfig.extPath}ext-locale/<extNameWithoutExtPrefix>/<lang>.js`
(`<lang>` is the detected `lang` returned on
[`langReady`]{@link module:SVGEditor.ExtensionVars_langReady} and
`<extNameWithoutExtPrefix>` is your extension name without the initial
required "ext-" prefix and without the trailing ".js").

The resolved `Promise` value is expected to adhere to
[`LocaleStrings`]{@link module:locale.LocaleStrings} (as with SVGEdit's
global locale files).

One may return a Promise (including by `async`/`await`) waiting for
`importLocale` to resolve so as to delay further processing until complete.

You could also use your own means to store and retrieve locale data for
your extension (and
[`importSetGlobalDefault`]{@link module:importModule.importSetGlobalDefault}
is available should this be of assistance) in which case the `global`
property should follow the format
`svgEditorExtensionLocale_<extNameWithoutExtPrefix>_<lang>` to avoid global
naming conflicts in the non-modular version of SVGEdit.

```js
import { importSetGlobalDefault } from '../external/dynamic-import-polyfill/importModule.js';

// ...

(async () => {

  const url = `${svgEditor.curConfig.extPath}ext-locale/<extNameWithoutExtPrefix>/<lang>.js`;
  const localeStrings = await importSetGlobalDefault(url, {
    global: 'svgEditorExtensionLocale_imagelib_' + lang
  });

  // Use `localeStrings`
  console.info(localeStrings);

})();
```

In addition to your own extension's locale strings,
[`langReady`]{@link module:svgcanvas.ExtensionInitResponse#langReady}
also has access to the global internationalization strings through the
`uiStrings` property on the object passed to it (see
[event:ext_langReady]{@link module:svgcanvas.SvgCanvas#event:ext_langReady}).

See also [LocaleDocs]{@tutorial LocaleDocs}, including for information on
formatting of locale strings (the current lack of any standard beyond a
convention of using brackets for variables).

## Creating buttons

Buttons can appear either in the "mode" panel (left panel) or the "context"
panel (top panel, changes depending on selection). Their icons can
either consist of SVG icons (recommended) or just raster images.

Each button is an object (added to the
array "buttons" on the object returned by the extension's `init` method).
Its properties are outlined at
[`SVGEditor.Button`]{@link module:SVGEditor.Button}.

## Creating SVG icons

The SVG-Edit project uses icons created using basic SVG (generally
using SVG-Edit as design tool), and extensions are encouraged to do so
too. This allows the interface toolbars to be resized and icons to be
reused at various sizes. If your extension uses multiple icons, they can
all be stored in the same file. To specify icon file used, set the path
under the extension's returned `svgicons` property.

An SVG icon file is an XML document that consists of a root SVG element
with child group elements (`<g></g>`). Each of these has an ID that
should match the ID specified in the associated button object.
Its content should be the SVG source of the icon. See the "Hello World"
icon as an example.

For further information, see the SVG Icon Loader project.

## Creating context tools

Context tools appear in the top toolbar whenever a certain type of
element is selected.

These are added by the extension returning an object with the
property "context_tools". See [this object's API]{@link module:SVGEditor.ContextTool}
for details.

## SVG-Edit extension events

See [Events]{@tutorial Events} for the events that lead to the triggering
of extension callbacks. (Mostly of relevance for developers of SVGEdit itself.)

## Helpers

A variety of properties and methods can be accessed within extensions.

### `svgCanvas` properties and methods

These are supplied in an object through the first parameter of the
extension function (see "methods" variable in above example).

See
[`ExtensionArgumentObject`]{@link module:svgcanvas.ExtensionArgumentObject}.
Note that this object also has these
[surfaced private methods and properties from Canvas]{@link module:svgcanvas.PrivateMethods}.

### `svgEditor` public properties and methods

The `this` value of the `init`
([JSDocs]{@link module:svgcanvas.ExtensionInitCallback}) method
is the [Editor object]{@link module:SVGEditor}. Its methods may be invoked
from on `this` within that method.
