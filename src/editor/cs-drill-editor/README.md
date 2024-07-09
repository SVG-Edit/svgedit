BACKGROUND
CS uses an external package SVGEdit as the base for the drill editor functionality. The drill editor extends SVGEditor by
using natively supported "tool" extensions to add sport specific graphics (like a soccer net or a soccer ball).
Some extensions store data in the SVG files which creates some issues (see below). The drill editor UI is also customized through
CSS and by overlaying custom images for the native tools (like undo, align, select, etc).

base SVGEdit functionality can be viewed at https://svgedit.netlify.app/editor/index.html#

USE/IMPLEMENTATION
The CS app currently loads the Drill Editor in an iframe, passing the sport and the drill/template SVG file as parameters.
(FUTURE - the Drill Editor should be able to be loaded into a DIV on the VUE component directly). The Drill Editor can be
run from its own project for development/testing purposes. See BUILD process below.

STRUCTURE
Unfortunately, the drill editor tool extensions have to reside within the SVGEdit directory structure in order to function.
Drill editor files have been consolidated (for the most part) in a cs-drill-editor directory, /cs-drill-editor.
/cs-drill-editor/templates - sport specific SVG "backgrounds" used as a starting point for new drills
/cs-drill-editor/tool-extensions - common and sport specific "tools" used to add custom shapes (like a soccer ball or cone) in the drill
/cs-drill-editor/tool-icons - a master list of all drill editor specific images (both for the tool extension buttons and
    overlays of SVGEdit default tool buttons). SVGEdit cannot load the images from this directory...they must be served from the
    images directory. The build process copies drill editor images into the SVGEdit images directory
    (which then get uploaded to GIT so copying no longer necessary???)

SHAPE/TOOL EXTENSIONS
All custom shapes/tools have been consolidated in three extensions...
    cs-actions - run, run with ball, pass - all represented by lines with arrows
    cs-players - shows shapes used to represent players on the field (previously just blue triangle,
        red circle). Supports generic and sport specific shapes (eg figures and positions).
    cs-shapes - used to show sport specific and common non-player related shapes. Examples of sport specific shapes include balls, nets.
        Examples of common shapes include cones, coach, etc.
All three extensions use json config files to specify which shapes/tools are shown. Common (non-sport specific) shapes/tools are loaded
from the extension directory...sport specific shapes/tools are loaded from the sport sub-directory.

There is also a non-visual extension, cs-push-message-save, that handles messages from the containing VUE component to save the drill
drawing.

REPO/BUILD
The base SVGEdit has been forked to the https://github.com/eminorinc/drill-editor repo. In addition to the base SVGEdit files, the drill
editor files are stored here since they need to be co-located within SVGEdit directory structure in order to work. The forked repo is
private...specific instructions follow on how to manage upstream changes.

git remote add upstream git@github.com:SVG-Edit/svgedit.git
git remote set-url --push upstream DISABLE

After initial download...
npm install (for dependencies)
npm run prebuild (for SVGCanvas)

To run standalone...
npm run start

sample URL to load soccer extensions and template
http://localhost:8000/src/editor/cs-drill-editor.html?sport=soccer&url=./cs-drill-editor/templates/soccer/field_full_w_players.svg


PACKAGING/DISTRIBUTION
To package for distribution...
npm run build

This creates a /dist directory containing a semi-optimized (I think) version of the SVGEdit code and all of the Drill Editor code (IN PROCESS).
Manually copy the /dist into the CS repo under SVGEdit-7.3.3 (LOCATION SUBJECT TO CHANGE). Due the nature of SVGEdit and expected infrequent updates,
it was determined that manually copying SVGEdit and Drill Editor is sufficient for now (i.e. automating build/package process not worth the effort)


SVGEDIT CUSTOMIZATION SUMMARY
There are a few files that CS Drill Editor overrides...

/packages/svgcanvas/core/sanitize.js
a core SVGCanvas file that specifies a whitelist of valid SVG attributes. Drill Editor stores some data in the SVG using
custom non-standard attributes (shape, position)...those attributes need to be added to the whitelist in order for the drill
editor to work correctly. (New version of Drill Editor uses dataset attributes (prefixed with "data-") to store custom data on DOM elements
and doesn't require additions to the sanitize whitelist. The customization is needed to maintain functionality for existing shapes)

/editor/cs-drill-editor/tool-icons
these images replace the native SVGEdit tool icons (custom images, and colors changed to black/gray/white (could not be styled via CSS)).
tool-icons directory is a master list of the images that were customized but are copied to and served from the /editor/images directory

/editor/components/seSvgExplorerButton.js, seSvgFlyingButton.js, index.js
These are two new tool buttons that allow SVG files to be loaded dynamically based on json files. seSVGFlyingButton provides
a single list of multiple SVG images...seSvgExplorerButton provides an organizational menu of multiple SVG images. Index.js simply adds
the new tool buttons to the drill editor. All our dynamic extensions use these two new tool buttons,

/panels/LeftPanel.html
While the tool extensions can be loaded dynamically, their position in the list of tools seems to be variable/uncertain. The
customizations to this file place the tool extensions manually in the correction positions in the list of tools.

Due to the way SVGEdit dynamically builds up the editor, other necessary styling could only be accomplished editing core javascript files.
The include but are not necessarily limited to...
seInput.js
seMenu.js
seZoom.js
MainMenu.js

Additional styling is achieved through the DrillEditor.css (there are native SVGEdit capabilities to programatically load CSS but those don't seem to work)

