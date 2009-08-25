ZIP = zip
PACKAGE = svgedit-2.3
FILEMASK = \*.html \*.css \*.js \*.txt \*.png \*.jpg \*.gif \*.svg \*.xml \*.manifest \*.rdf \*.xul

clean:
	rm -f *.*~
	rm -rf ./content/editor/

all: clean
	rm -f $(PACKAGE).xpi
	cp -r ../editor ./content/
	$(ZIP) $(PACKAGE).xpi -r . -i $(FILEMASK)
