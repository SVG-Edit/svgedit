# ![alt text](https://svg-edit.github.io/svgedit/images/logo48x48.svg "svg-edit logo of a pencil") SVG-edit

SVG-edit is a fast, web-based, javascript-driven SVG drawing editor that works in any modern browser.

## Demo

### [Try SVG-edit here](https://svg-edit.github.io/svgedit/releases/svg-edit-2.8.1/svg-editor.html)

(Also available as a [download](https://github.com/SVG-Edit/svgedit/releases/download/svg-edit-2.8.1/svg-edit-2.8.1.zip) in [releases](https://github.com/SVG-Edit/svgedit/releases)).

## Installation

1. `npm i svgeditor`
1. Copy `svgedit-config-sample-es.js` (in project root) to `svgedit-config-es.js`.
  1. This will enable `svg-editor-es.html` to work, an HTML file directly
    using ES6 modules. Note that this file only works on modern browsers.
    The config file now imports the SVG edit code, minimizing the scripts
    that need to be referenced in the HTML file.
1. Run `npm run build-config` to also build a rolled-up, Babelified,
  non-ES Modules (IIFE) JavaScript file which will allow `svg-editor.html`
  to work, a file which does not rely on ES6 Modules support.
1. If you wish to make changes to the HTML, modify `svg-editor-es.html` and
  then run `npm run build-html` to have the changes properly copied to
  `svg-editor.html`.

## Recent news
  * 2018-05-26 Published 3.0.0-alpha.2 with ES6 Modules support
  * 2017-07 Added to Packagist: https://packagist.org/packages/svg-edit/svgedit
  * 2015-12-02 SVG-edit 2.8.1 was released.
  * 2015-11-24 SVG-edit 2.8 was released.
  * 2015-11-24 Code, issue tracking, and docs are being moved to github (previously [code.google.com](https://code.google.com/p/svg-edit)).
  * 2014-04-17 2.7 and stable branches updated to reflect 2.7.1 important bug fixes for the embedded editor.
  * 2014-04-07 SVG-edit 2.7 was released.
  * 2013-01-15 SVG-edit 2.6 was released.

## Videos

  * [SVG-edit 2.4 Part 1](https://www.youtube.com/watch?v=zpC7b1ZJvvM)
  * [SVG-edit 2.4 Part 2](https://www.youtube.com/watch?v=mDzZEoGUDe8)
  * [SVG-edit 2.3 Features](https://www.youtube.com/watch?v=RVIcIy5fXOc)
  * [Introduction to SVG-edit](https://www.youtube.com/watch?v=ZJKmEI06YiY) (Version 2.2)

## Supported browsers

The following browsers had been tested for 2.6 or earlier and will probably continue to work with 2.8.
  * Firefox 1.5+
  * Opera 9.50+
  * Safari 4+
  * Chrome 1+
  * IE 9+ and Edge

## Further reading and more information

 * See [docs](docs/) for more documentation.
 * [Acknowledgements](docs/Acknowledgements.md) lists open source projects used in svg-edit.
 * See [AUTHORS](AUTHORS) file for authors.
 * [Stackoverflow](https://stackoverflow.com/tags/svg-edit) group.
 * Join the [svg-edit mailing list](https://groups.google.com/forum/#!forum/svg-edit).
 * Join us on `#svg-edit` on `freenode.net` (or use the [web client](https://webchat.freenode.net/?channels=svg-edit)).
