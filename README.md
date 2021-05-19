<img src="https://svg-edit.github.io/svgedit/src/editor/images/logo.svg" width="50" height="50" />

# SVG-Edit

[![npm](https://img.shields.io/npm/v/svgedit.svg)](https://www.npmjs.com/package/svgedit)
[![Dependencies](https://img.shields.io/david/SVG-Edit/svgedit.svg)](https://david-dm.org/SVG-Edit/svgedit)
[![devDependencies](https://img.shields.io/david/dev/SVG-Edit/svgedit.svg)](https://david-dm.org/SVG-Edit/svgedit?type=dev)

<!-- [![Actions Status](https://github.com/SVG-Edit/svgedit/workflows/Node%20CI/badge.svg)](https://github.com/SVG-Edit/svgedit/actions)
[![Actions Status](https://github.com/SVG-Edit/svgedit/workflows/Coverage/badge.svg)](https://github.com/SVG-Edit/svgedit/actions)
-->
[![Tests badge](https://raw.githubusercontent.com/SVG-Edit/svgedit/master/badges/tests-badge.svg?sanitize=true)](badges/tests-badge.svg)
[![Coverage badge](https://raw.githubusercontent.com/SVG-Edit/svgedit/master/badges/coverage-badge.svg?sanitize=true)](badges/coverage-badge.svg)

[![Known Vulnerabilities](https://snyk.io/test/github/SVG-Edit/svgedit/badge.svg)](https://snyk.io/test/github/SVG-Edit/svgedit)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/SVG-Edit/svgedit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SVG-Edit/svgedit/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/SVG-Edit/svgedit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SVG-Edit/svgedit/context:javascript)

[![issuehunt-to-marktext](https://issuehunt.io/static/embed/issuehunt-button-v1.svg)](https://issuehunt.io/r/SVG-Edit/svgedit)

SVG-edit is a fast, web-based, JavaScript-driven SVG drawing editor that
works in any modern browser.

![screenshot](docs/screenshot.png)
[](https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg)

## Help wanted

SVG-Edit is the most popular open source SVG editor. It was started more than 10 years ago by a fantastic team of developers. Unfortunately, the product was not maintained for a quite long period. We decided to give this tool a new life by refreshing many aspects.
If you can help us to maintain SVG-Edit, you are more than welcome!
## Demo

Thanks to Netlify, you can test the following builds: 

### [Try SVG-edit V7-preview here](https://svgedit.netlify.app/editor/index.html)

[Try SVG-edit 5.1.0 here](https://6098683962bf91702907ee33--svgedit.netlify.app/editor/svg-editor.html)

[Try SVG-edit 6.1.0 here](https://60a0000fc9900b0008fd268d--svgedit.netlify.app/editor/index.html)

## Installation

### Quick install

1. Clone or copy the repository contents
1. run `npm i` to install dependencies
1. run `npm run start` to start a local server
1. Use your browser to access `http://localhost:8000/src/editor/index.html`

### Integrating SVG-edit into your own application

V7 is changing significantly the way to integrate and customize SVG-Edit. The documentation will be detailed here.

SVG-Edit is made of two major components:
1. The "svgcanvas" that takes care of the underlying svg edition. It can be used to build your own editor. See example in the demos folder or the svg-edit-react repository.
1. The "editor" that takes care of the editor UI (menus, buttons, etc.)

For earlier versions of SVG-Edit, please look in their respective branches.
## Supported browsers

    - Opera 59+,
    - Chrome 75+,
    - FireFox 68+,
    - Safari 11+
    - Edge 18+

    Support for old browsers may require to use an older version of the package. However,
    please open an issue if you need support for a specific version of your browser so
    the project team can decide if we should support with the latest version.

## Further reading and more information
 * Participate in [discussions](https://github.com/SVG-Edit/svgedit/discussions) 
 * See [docs](docs/) for more documentation. See the
    [JSDocs for our latest release](https://svg-edit.github.io/svgedit/releases/latest/docs/jsdoc/index.html).
 * [Acknowledgements](docs/Acknowledgements.md) lists open source projects
    used in svg-edit.
 * See [AUTHORS](AUTHORS) file for authors.
 * [StackOverflow](https://stackoverflow.com/tags/svg-edit) group.
 
# Hosting
SVGedit versions are deployed to:
[![Deploys by Netlify](https://www.netlify.com/img/global/badges/netlify-color-accent.svg)](https://www.netlify.com)
