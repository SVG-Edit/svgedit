BACKGROUND
CS uses an external package SVGEdit as the base for the drill editor functionality. The drill editor extends SVGEditor by
using natively supported "tool" extensions to provide the addition of sport specific graphics (like a soccer net or a soccer ball).
Some extensions store data in the SVG files which creates some issues (see below). The drill editor UI is also customized through
CSS and by overlaying CS images for the native tools (like undo, align, select, etc).


USE/IMPLEMENTATION
The CS app currently loads the Drill Editor in an iframe, passing the sport and the drill/template SVG file as parameters.
The Drill Editor can be run from its own project for development/testing purposes. See BUILD process below.


STRUCTURE
Unfortunately, the drill editor tool extensions have to reside within the SVGEdit directory structure in order to function.
Drill editor files have been consolidated (for the most part) in a cs-drill-editor directory, /cs-drill-editor.
/cs-drill-editor/templates - sport specific SVG "backgrounds" used as a starting point for new drills
/cs-drill-editor/tool-extensions - common and sport specific "tools" used to add custom shapes (like a soccer ball or cone) in the drill
/cs-drill-editor/tool-icons - a master list of all drill editor specific images (both for the tool extension buttons and
    overlays of SVGEdit default tool buttons). SVGEdit cannot load the images from this directory...they must be served from the
    images directory. The build process copies drill editor images into the SVGEdit images directory
    (which then get uploaded to GIT so copying no longer necessary???)


REPO/BUILD
The base SVGEdit has been forked to the https://github.com/eminorinc/svgedit-update repo. In addition to the base SVGEdit files, the drill
editor files are stored here since they need to be co-located within SVGEdit directory structure in order to work. The forked repo is
currently public but should be made private is possible (ongoing effort)

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


SVGEDIT CUSTOMIZATIONS
There are a few files that CS Drill Editor overrides...

1) a core SVGCanvas file (Sanitize.js) that specifies a whitelist of valid SVG attributes. Drill Editor stores some data in the SVG using
custom non-standard attributes (shape, position)...those attributes need to be added to the whitelist in order for the drill
editor to work correctly

2) UI images - the drill editor replaces the native SVGEdit tool icons with its own. A master list of those icons, and the icons used by the drill editor extensions
 reside in the tool-icons...but are served from the /images directory

3) Additional styling is achieved through the DrillEditor.css (there are native SVGEdit capabilities to programatically load CSS but those don't seem to work)

