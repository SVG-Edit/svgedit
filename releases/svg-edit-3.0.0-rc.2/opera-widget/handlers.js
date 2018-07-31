/* globals jQuery, svgCanvas */
// Note: This JavaScript file must be included as the last script on the main HTML editor page to override the open/save handlers
jQuery(function () {
  if (window.opera && window.opera.io && window.opera.io.filesystem) {
    svgCanvas.setCustomHandlers({
      open () {
        try {
          window.opera.io.filesystem.browseForFile(
            new Date().getTime(), /* mountpoint name */
            '', /* default location */
            function (file) {
              try {
                if (file) {
                  const fstream = file.open(file, 'r');
                  let output = '';
                  while (!fstream.eof) {
                    output += fstream.readLine();
                  }

                  svgCanvas.setSvgString(output); /* 'this' is bound to the filestream object here */
                }
              } catch (e) {
                console.log('Reading file failed.');
              }
            },
            false, /* not persistent */
            false, /* no multiple selections */
            '*.svg' /* file extension filter */
          );
        } catch (e) {
          console.log('Open file failed.');
        }
      },
      save (window, svg) {
        try {
          window.opera.io.filesystem.browseForSave(
            new Date().getTime(), /* mountpoint name */
            '', /* default location */
            function (file) {
              try {
                if (file) {
                  const fstream = file.open(file, 'w');
                  fstream.write(svg, 'UTF-8');
                  fstream.close();
                }
              } catch (e) {
                console.log('Write to file failed.');
              }
            },
            false /* not persistent */
          );
        } catch (e) {
          console.log('Save file failed.');
        }
      }
    });
  }
});
