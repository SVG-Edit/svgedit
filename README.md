<img src="https://svg-edit.github.io/svgedit/src/editor/images/logo.svg" width="50" height="50" />

# SVGEdit

[![npm](https://img.shields.io/npm/v/svgedit.svg)](https://www.npmjs.com/package/svgedit)
[![Actions Status](https://github.com/SVG-Edit/svgedit/workflows/Node%20CI/badge.svg)](https://github.com/SVG-Edit/svgedit/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/SVG-Edit/svgedit/badge.svg)](https://snyk.io/test/github/SVG-Edit/svgedit)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/SVG-Edit/svgedit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SVG-Edit/svgedit/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/SVG-Edit/svgedit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SVG-Edit/svgedit/context:javascript)

SVG-edit is a fast, web-based, JavaScript-driven SVG drawing editor that
works in any modern browser.

![screenshot](docs/screenshot.png)
[](https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg)

## Contributions

SVGEdit is the most popular open source SVG editor. It was started more than 10 years ago by a fantastic team of developers. Unfortunately, the product was not maintained for a quite long period. We decided to give this tool a new life by refreshing many aspects.
Please let us know with an issue or a discussions if you wish to contribute.
## Demo

Thanks to **Netlify**, you can test the following builds: 

### [Try SVGEdit V7 (latest build)](https://svgedit.netlify.app/editor/index.html)

[Try SVGEdit V7 (latest published version)](https://unpkg.com/svgedit@latest/dist/editor/index.html)

## Prior V7:

[Try SVGEdit 6.1.0 here](https://60a0000fc9900b0008fd268d--svgedit.netlify.app/editor/index.html)

[Try SVGEdit 5.1.0 here](https://unpkg.com/svgedit@5.1.0/editor/svg-editor.html)

Additional tip: you may try a version released on NPM using unpkg for example with version 3.2.0:
[https://unpkg.com/svgedit@3.2.0/editor/svg-editor.html](https://unpkg.com/svgedit@3.2.0/editor/svg-editor.html)

## Installation

### Quick install

1. Clone or copy the repository contents
1. run `npm i` to install dependencies
1. run `npm run start` to start a local server
1. Use your browser to access `http://localhost:8000/src/editor/index.html`

### Integrating SVGEdit into your own application

V7 is changing significantly the way to integrate and customize SVG-Edit. You can have a look to index.html to see how you can insert a div element into your HTML code and inject the editor into the div.

SVG-Edit is made of two major components:
1. The "svgcanvas" that takes care of the underlying svg edition. It can be used to build your own editor. See example in the demos folder or the svg-edit-react repository.
1. The "editor" that takes care of the editor UI (menus, buttons, etc.)

For earlier versions of SVGEdit, please look in their respective branches.
## Supported browsers
    Developments and Continuous Integration are done with a **Chrome** environment. Chrome, FireFox and Safari recent versions are supported (in the meaning that we will try to fix bugs for these browsers).
    Support for old browsers may require to use an older version of the package. However, please open an issue if you need support for a specific version of your browser so the project team can decide if we should support with the latest version.

## Sample extension based on React
A sample React component was used to build a svgedit extension. 
To activate:
- "npm run build" from the extension folder "src/editor/react-extensions/react-test" in order to create the bundle for the extension. 
- modify "index.html" to activate the extension as a userExtensions
```
svgEditor.setConfig({
          allowInitialUserOverride: true,
          extensions: [],
          noDefaultExtensions: false,
          userExtensions: ['./react-extensions/react-test/dist/react-test.js']
        })
```
## Further reading and more information
 * Participate in [discussions](https://github.com/SVG-Edit/svgedit/discussions) 
 * See [AUTHORS](AUTHORS) file for authors.
 * [StackOverflow](https://stackoverflow.com/tags/svg-edit) group.
 
# Hosting
SVGedit versions are deployed to:
[![Deploys by Netlify](https://www.netlify.com/img/global/badges/netlify-color-accent.svg)](https://www.netlify.com)
