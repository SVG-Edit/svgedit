ZIP = zip
PACKAGE = svgedit-2.3
FILEMASK = \*.html \*.css \*.js \*.txt \*.png \*.jpg \*.gif \*.svg \*.xml

clean:
	rm -f *.*~
	rm -rf ./editor/

all: clean
	rm -f $(PACKAGE).wgt
	cp -r ../editor .
	$(ZIP) $(PACKAGE).wgt -r . -i $(FILEMASK)
