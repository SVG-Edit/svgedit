NAME=svg-edit
VERSION=2.5
MAKEDOCS=naturaldocs/NaturalDocs
PACKAGE=$(NAME)-$(VERSION)
YUI=build/yuicompressor.jar
ZIP=zip

all: release firefox opera

build/$(PACKAGE):
	rm -rf config
	mkdir config
	$(MAKEDOCS) -i editor/ -o html docs/ -p config/ -oft -r
	mkdir -p build/$(PACKAGE)
	cp -r editor/* build/$(PACKAGE)
	-find build/$(PACKAGE) -name .svn -type d -exec rm -rf {} \;
# minify spin button
	java -jar $(YUI) build/$(PACKAGE)/spinbtn/JQuerySpinBtn.js > build/$(PACKAGE)/spinbtn/JQuerySpinBtn.min.js
# minify SVG-edit files
	java -jar $(YUI) build/$(PACKAGE)/svg-editor.js > build/$(PACKAGE)/svg-editor.min.js
	java -jar $(YUI) build/$(PACKAGE)/svgcanvas.js > build/$(PACKAGE)/svgcanvas.min.js
# CSS files do not work remotely
# java -jar $(YUI) build/$(PACKAGE)/spinbtn/JQuerySpinBtn.css > build/$(PACKAGE)/spinbtn/JQuerySpinBtn.min.css
# java -jar $(YUI) build/$(PACKAGE)/svg-editor.css > build/$(PACKAGE)/svg-editor.min.css

release: build/$(PACKAGE)
	cd build ; $(ZIP) $(PACKAGE).zip -r $(PACKAGE) ; cd ..

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
