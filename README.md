# ![alt text](https://svg-edit.github.io/svgedit/images/logo48x48.svg "svg-edit logo of a pencil") SVG-edit

[![npm](https://img.shields.io/npm/v/svgedit.svg)](https://www.npmjs.com/package/svgedit)
[![Dependencies](https://img.shields.io/david/SVG-Edit/svgedit.svg)](https://david-dm.org/SVG-Edit/svgedit)
[![devDependencies](https://img.shields.io/david/dev/SVG-Edit/svgedit.svg)](https://david-dm.org/SVG-Edit/svgedit?type=dev)

<!-- [![Actions Status](https://github.com/SVG-Edit/svgedit/workflows/Node%20CI/badge.svg)](https://github.com/SVG-Edit/svgedit/actions)
[![Actions Status](https://github.com/SVG-Edit/svgedit/workflows/Coverage/badge.svg)](https://github.com/SVG-Edit/svgedit/actions)
-->
[![coverage badge](coverage-badge.png)](coverage-badge.png)

[![Known Vulnerabilities](https://snyk.io/test/github/SVG-Edit/svgedit/badge.svg)](https://snyk.io/test/github/SVG-Edit/svgedit)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/SVG-Edit/svgedit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SVG-Edit/svgedit/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/SVG-Edit/svgedit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SVG-Edit/svgedit/context:javascript)

[![License](https://img.shields.io/npm/l/svgedit.svg)](LICENSE-MIT)

[![issuehunt-to-marktext](https://issuehunt.io/static/embed/issuehunt-button-v1.svg)](https://issuehunt.io/r/SVG-Edit/svgedit)

SVG-edit is a fast, web-based, JavaScript-driven SVG drawing editor that
works in any modern browser.

## Help wanted

While we have made some recent releases to SVG-edit for bug fixes,
refactoring and documentation to make the codebase more maintainable, the
core developers responsible for the bulk of the drawing features are no
longer active with the project, so we would love others familiar with SVG
to join the project.

## Demo

### [Try SVG-edit here](https://svg-edit.github.io/svgedit/releases/latest/editor/svg-editor.html)

See the [latest release](https://svg-edit.github.io/svgedit/releases/latest/editor/svg-editor.html)
(or its [ES6-Module](https://svg-edit.github.io/svgedit/releases/latest/editor/svg-editor-es.html)
version, which requires a modern browser).

You may also try it at <https://unpkg.com/svgedit/editor/svg-editor.html>
(which redirects to a versioned URL).

You may also obtain URLs for specific [releases](https://github.com/SVG-Edit/svgedit/releases).

For testing the latest version in `master`, you may use
<https://raw.githack.com/SVG-Edit/svgedit/master/editor/svg-editor.html>.

## Installation

### Quick install

1. Clone or copy the repository contents (at least the `editor` directory).
1. If you need programmatic customization, see its section below.
1. Otherwise, just add an iframe to your site, adding any extensions or
  configuration (see `docs/tutorials/ConfigOptions.md`
  ([ConfigOptions]{@tutorial ConfigOptions})) within the URL:
```html
<iframe src="svgedit/editor/svg-editor.html?extensions="
    width="100%" height="100%"></iframe>
```

Note that if you want support for the following browsers, you will at least
need some polyfills.

For Android Browser 4.4.3-4.4.4, you will need at least `fetch`.

For the following, you will need at least `URL`, `Promise`, and `fetch`:

- IE <= 11
- IE Mobile
- Opera Mini
- Blackberry Browser <= 10

And for still older browsers (e.g., IE 8), you will at minimum need a
`querySelector` polyfill.

### Integrating SVG-edit into your own npm package

These steps are only needed if you wish to set up your own npm package
incorporating SVGEdit. You will need to have Node.js/npm installed.

1. Create and enter an empty folder somewhere on your desktop.
1. Create your npm package: `npm init` (complete the fields).
1. Install SVG-edit into your package:
  `npm i --save svgedit`.
1. Look within `node_modules/svgedit/`, e.g., `node_modules/svgedit/editor/svg-editor.html`
  for the files your package needs and use accordingly (from outside of
  `node_modules`).
1. If you want to publish your own work, you can use `npm publish`.

## Programmatic customization

1. If you are not concerned about supporting ES6 Modules (see the
  "ES6 Modules file" section), you can add your config directly to
  `svgedit-config-iife.js` within the SVG-Edit project root.
  1. Note: Do not remove the `import svgEditor...` code which is responsible
  for importing the SVG edit code. Versions prior to 3.0 did not require
  this, but the advantage is that your HTML does not need to be polluted
  with extra script references.
1. Modify or utilize any options. See `docs/tutorials/ConfigOptions.md`
  ([ConfigOptions]{@tutorial ConfigOptions}).

## ES6 Modules file

1. `svg-editor-es.html` is an HTML file directly using ES6 modules.
  It is only supported in the latest browsers. It is probably mostly
  useful for debugging, as it requires more network requests.
  If you would like to work with this file, you should make configuration
  changes in `svgedit-config-es.js` (in the SVG-Edit project root).
1. If you are working with the ES6 Modules config but also wish to work with
  the normal `svg-editor.html` version (so your code can work in older
  browsers or get the presumable performance benefits of this file which
  references JavaScript rolled up into a single file), you can follow these
  steps after any config changes you make, so that your changes can also be
  automatically made available to both versions.
    1. JavaScript:
        1. Run `npm install` within the svgedit directory
          (`node_modules/svgedit` if you installed via npm) and the root
          repository directory if you cloned the Git repository instead.
          This will install the build tools for SVG-edit.
        1. Run `npm run build-by-config` within the svgedit directory mentioned
          in the step above.
            1. This will rebuild `svgedit-config-iife.js` (applying Babel to
              allow it to work on older browsers and applying Rollup to build
              all JavaScript into one file). The file will then contain
              non-ES6 module JavaScript that can work in older browsers.
              Note that it bundles all of SVGEdit, so it is to be expected
              that this file will be much larger in size than the original
              ES6 config file.
    1. HTML:
        1. If you wish to make changes to both HTML files, it is recommended that
            you work and test on `svg-editor-es.html` and then run
            `npm run build-html` to have the changes properly copied to
            `svg-editor.html`.

## Recent news

- 2019-11-16 Published 5.1.0 Misc. fixes and refactoring
- 2019-05-07 Published 5.0.0 Change from `@babel/polyfill`
- 2019-04-03 Published 4.3.0 Fix for double click on gradient
    picker droplets affecting some browsers and dragging control
    point of arc. Other misc. fixes. Some accessibility and i18n.
- 2018-12-13 Published 4.2.0 (Chinese (simplified) and Russian locale
    updates; retaining lines with grid mode)
- 2018-11-29 Published 4.1.0 (Fix for hyphenated locales, svgcanvas
    distributions)
- 2018-11-16 Published 4.0.0/4.0.1 (Move to Promise-based APIs)
- 2018-11-01 Published 3.2.0 (Update qunit to resolve security vulnerability
    of a dependency)
- 2018-10-25 Published 3.1.1 (Fix for saving SVG on Firefox)
- 2018-10-24 Published 3.1.0 (Redirect on modular page for non-module-support;
  versions document (for migrating))
- 2018-10-22 Published 3.0.1 (Revert fix affecting polygon selection)
- 2018-10-21 Published 3.0.0 (misc. improvements including centering canvas and
  key locale fixes since last RC)
- 2018-09-30 Published 3.0.0-rc.3 with security and other fixes
- 2018-07-31 Published 3.0.0-rc.2 with misc. fixes
- 2018-07-19 Published 3.0.0-rc.1 allowing for extensions and locales to be
  expressed as modules
- 2018-05-26 Published 3.0.0-alpha.2 with ES6 Modules support
- 2017-07 Added to Packagist: https://packagist.org/packages/svg-edit/svgedit
- 2015-12-02 SVG-edit 2.8.1 was released.
- 2015-11-24 SVG-edit 2.8 was released.
- 2015-11-24 Code, issue tracking, and docs are being moved to github
    (previously [code.google.com](https://code.google.com/p/svg-edit)).
- 2014-04-17 2.7 and stable branches updated to reflect 2.7.1 important bug
    fixes for the embedded editor.
- 2014-04-07 SVG-edit 2.7 was released.
- 2013-01-15 SVG-edit 2.6 was released.

## Videos

  * [SVG-edit 2.4 Part 1](https://www.youtube.com/watch?v=zpC7b1ZJvvM)
  * [SVG-edit 2.4 Part 2](https://www.youtube.com/watch?v=mDzZEoGUDe8)
  * [SVG-edit 2.3 Features](https://www.youtube.com/watch?v=RVIcIy5fXOc)
  * [Introduction to SVG-edit](https://www.youtube.com/watch?v=ZJKmEI06YiY) (Version 2.2)

## Supported browsers

The following browsers had been tested for 2.6 or earlier and will
probably continue to work with 3.0.

- Firefox 1.5+
- Opera 9.50+
- Safari 4+
- Chrome 1+
- IE 9+ and Edge

## Further reading and more information

 * See [docs](docs/) for more documentation. See the
    [JSDocs for our latest release](https://svg-edit.github.io/svgedit/releases/latest/docs/jsdoc/index.html).
 * [Acknowledgements](docs/Acknowledgements.md) lists open source projects
    used in svg-edit.
 * See [AUTHORS](AUTHORS) file for authors.
 * [StackOverflow](https://stackoverflow.com/tags/svg-edit) group.
 * Join the [svg-edit mailing list](https://groups.google.com/forum/#!forum/svg-edit).
 * Join us on `#svg-edit` on `freenode.net` (or use the
    [web client](https://webchat.freenode.net/?channels=svg-edit)).
