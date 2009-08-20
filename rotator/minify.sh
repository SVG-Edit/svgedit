#!/bin/sh
YUI=yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar

# minify spin button
java -jar $YUI editor/spinbtn/JQuerySpinBtn.js > editor/spinbtn/JQuerySpinBtn.min.js

# minify SVG-edit files
java -jar $YUI editor/svg-editor.js > editor/svg-editor.min.js
java -jar $YUI editor/svgcanvas.js > editor/svgcanvas.min.js


# CSS files do not work remotely
# java -jar $YUI editor/spinbtn/JQuerySpinBtn.css > editor/spinbtn/JQuerySpinBtn.min.css
# java -jar $YUI editor/svg-editor.css > editor/svg-editor.min.css
