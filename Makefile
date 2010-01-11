NAME=svg-edit
VERSION=2.4
MAKEDOCS=naturaldocs/NaturalDocs
PACKAGE=$(NAME)-$(VERSION)
YUI=build/yuicompressor.jar
ZIP=zip

all: release firefox opera

minify:
	java -jar $(YUI) editor/spinbtn/JQuerySpinBtn.js > editor/spinbtn/JQuerySpinBtn.min.js
	java -jar $(YUI) editor/svgicons/jquery.svgicons.js > editor/svgicons/jquery.svgicons.min.js
	java -jar $(YUI) editor/svg-editor.js > editor/svg-editor.min.js
	java -jar $(YUI) editor/svgcanvas.js > editor/svgcanvas.min.js
#	java -jar $(YUI) editor/locale/locale.js > editor/locale/locale.js

build/$(PACKAGE): minify
	rm -rf config
	mkdir config
	$(MAKEDOCS) -i editor/ -o html docs/ -p config/ -oft -r
	mkdir -p build/$(PACKAGE)
	cp -r editor/* build/$(PACKAGE)
	-find build/$(PACKAGE) -name .svn -type d -exec rm -rf {} \;
	
release: build/$(PACKAGE)
	cd build ; $(ZIP) $(PACKAGE).zip -r $(PACKAGE) ; cd ..

firefox: build/$(PACKAGE)
	mkdir -p build/firefox/content/editor
	cp -r firefox-extension/* build/firefox
	rm -rf build/firefox/content/.svn
	rm -rf build/firefox/skin/.svn
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
