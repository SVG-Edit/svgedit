NAME=svg-edit
VERSION=2.6
PACKAGE=$(NAME)-$(VERSION)
MAKEDOCS=naturaldocs/NaturalDocs
CLOSURE=build/tools/closure-compiler.jar
ZIP=zip

# All files that will be compiled by the Closure compiler.

JS_FILES=\
	contextmenu/jquery.contextmenu.js \
	browser.js \
	svgtransformlist.js \
	math.js \
	units.js \
	svgutils.js \
	sanitize.js \
	history.js \
	select.js \
	draw.js \
	path.js \
	svgcanvas.js \
	svg-editor.js \
	contextmenu.js \
	locale/locale.js

JS_INPUT_FILES=$(addprefix editor/, $(JS_FILES))
JS_BUILD_FILES=$(addprefix build/$(PACKAGE)/, $(JS_FILES))
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_INPUT_FILES))
COMPILED_JS=editor/svgedit.compiled.js

all: release firefox opera

# The build directory relies on the JS being compiled.
build/$(PACKAGE): $(COMPILED_JS)
	rm -rf config
	mkdir config
	if [ -x $(MAKEDOCS) ] ; then $(MAKEDOCS) -i editor/ -o html docs/ -p config/ -oft -r ; fi

	# Make build directory and copy all editor contents into it
	mkdir -p build/$(PACKAGE)
	cp -r editor/* build/$(PACKAGE)

	# Remove all hidden .svn directories
	-find build/$(PACKAGE) -name .svn -type d | xargs rm -rf {} \;

	# Create the release version of the main HTML file.
	build/tools/ship.py --i=editor/svg-editor.html --on=svg_edit_release > build/$(PACKAGE)/svg-editor.html

# NOTE: Some files are not ready for the Closure compiler: (jquery)
# NOTE: Our code safely compiles under SIMPLE_OPTIMIZATIONS
# NOTE: Our code is *not* ready for ADVANCED_OPTIMIZATIONS
# NOTE: WHITESPACE_ONLY and --formatting PRETTY_PRINT is helpful for debugging.
$(COMPILED_JS):
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)

compile: $(COMPILED_JS)

release: build/$(PACKAGE)
	cd build ; $(ZIP) $(PACKAGE).zip -r $(PACKAGE) ; cd ..
	tar -z -c -f build/$(PACKAGE)-src.tar.gz \
	    --exclude='\.svn' \
	    --exclude='build/*' \
	    .

firefox: build/$(PACKAGE)
	mkdir -p build/firefox/content/editor
	cp -r firefox-extension/* build/firefox
	rm -rf build/firefox/content/.svn
	cp -r build/$(PACKAGE)/* build/firefox/content/editor
	rm -f build/firefox/content/editor/embedapi.js
	cd build/firefox ; $(ZIP) ../$(PACKAGE).xpi -r * ; cd ../..

opera: build/$(PACKAGE)
	mkdir -p build/opera/editor
	cp opera-widget/* build/opera
	cp -r build/$(PACKAGE)/* build/opera/editor
	cd build/opera ; $(ZIP) ../$(PACKAGE).wgt -r * ; cd ../..

chrome:
	mkdir -p build/svgedit_app
	cp -a chrome-app/* build/svgedit_app
	cd build ; $(ZIP) -r $(PACKAGE)-crx.zip svgedit_app ; rm -rf svgedit_app; cd ..

clean:
	rm -rf config
	rm -rf build/$(PACKAGE)
	rm -rf build/firefox
	rm -rf build/opera
	rm -rf build/$(PACKAGE).zip
	rm -rf build/$(PACKAGE)-src.tar.gz
	rm -rf build/$(PACKAGE).xpi
	rm -rf build/$(PACKAGE).wgt
	rm -rf $(COMPILED_JS)
