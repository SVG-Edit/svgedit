NAME=svg-edit
VERSION=2.6
PACKAGE=$(NAME)-$(VERSION)
MAKEDOCS=naturaldocs/NaturalDocs
CLOSURE=build/tools/closure-compiler.jar
YUICOMPRESS=build/tools/yuicompressor.jar
ZIP=zip

all: release firefox opera

build/$(PACKAGE):
	rm -rf config
	mkdir config
	if [ -x $(MAKEDOCS) ] ; then $(MAKEDOCS) -i editor/ -o html docs/ -p config/ -oft -r ; fi
	mkdir -p build/$(PACKAGE)
	cp -r editor/* build/$(PACKAGE)
	-find build/$(PACKAGE) -name .svn -type d -exec rm -rf {} \;
# minify spin button
	java -jar $(YUICOMPRESS)  build/$(PACKAGE)/spinbtn/JQuerySpinBtn.js                > build/$(PACKAGE)/spinbtn/JQuerySpinBtn.min.js
# minify SVG-edit files
	java -jar $(YUICOMPRESS)  build/$(PACKAGE)/svg-editor.js                > build/$(PACKAGE)/svg-editor.min.js
	java -jar $(YUICOMPRESS)  build/$(PACKAGE)/svgcanvas.js                 > build/$(PACKAGE)/svgcanvas.min.js

# codedread: NOTE: Some files are not ready for the Closure compiler: (jquery)
	java -jar $(CLOSURE) \
	   --js browsersupport.js \
	   --js svgtransformlist.js \
	   --js math.js \
	   --js units.js \
	   --js svgutils.js \
	   --js svgcanvas.js \
	   --js svg-editor.js \
	   --js locale/locale.js \
	   --js_output_file svgedit.compiled.js

# CSS files do not work remotely
# java -jar $(YUICOMPRESS) build/$(PACKAGE)/spinbtn/JQuerySpinBtn.css > build/$(PACKAGE)/spinbtn/JQuerySpinBtn.min.css
# java -jar $(YUICOMPRESS) build/$(PACKAGE)/svg-editor.css > build/$(PACKAGE)/svg-editor.min.css

release: build/$(PACKAGE)
	cd build ; $(ZIP) $(PACKAGE).zip -r $(PACKAGE) ; cd ..
	tar -z -c -f build/$(PACKAGE)-src.tar.gz \
	    --exclude-vcs \
	    --exclude='build/*' \
	    .

firefox: build/$(PACKAGE)
	mkdir -p build/firefox/content/editor
	cp -r firefox-extension/* build/firefox
	rm -rf build/firefox/content/.svn
	cp -r build/$(PACKAGE)/* build/firefox/content/editor
	cd build/firefox ; $(ZIP) ../$(PACKAGE).xpi -r * ; cd ../..

opera: build/$(PACKAGE)
	mkdir -p build/opera/editor
	cp opera-widget/* build/opera
	cp -r build/$(PACKAGE)/* build/opera/editor
	cd build/opera ; $(ZIP) ../$(PACKAGE).wgt -r * ; cd ../..

clean:
	rm -rf config
	rm -rf build/$(PACKAGE)
	rm -rf build/firefox
	rm -rf build/opera
