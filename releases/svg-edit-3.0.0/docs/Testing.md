# Testing

1. Ensure tests are passing via `npm test`. This will lint and build
files and run `/test/all_tests.html`.

1. Spot check extensions (until we have tests). The following URL includes all:

http://localhost:8000/editor/svg-editor-es.html?extensions=ext-arrows.js,ext-closepath.js,ext-connector.js,ext-eyedropper.js,ext-foreignobject.js,ext-grid.js,ext-helloworld.js,ext-imagelib.js,ext-markers.js,ext-mathjax.js,ext-overview_window.js,ext-panning.js,ext-php_savefile.js,ext-polygon.js,ext-server_moinsave.js,ext-server_opensave.js,ext-shapes.js,ext-star.js,ext-storage.js,ext-webappfind.js,ext-xdomain-messaging.js

1. Ensure both the ES6 Modules HTML file (`svg-editor-es.html`) and
  regular file (`svg-editor.html`) are working.
