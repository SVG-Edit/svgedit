var svgEditorExtension_php_savefile = (function () {
  'use strict';

  // TODO: Might add support for "exportImage" custom
  //   handler as in "ext-server_opensave.js" (and in savefile.php)
  var extPhp_savefile = {
    name: 'php_savefile',
    init: function init(_ref) {
      var $ = _ref.$;
      var svgEditor = this;
      var extPath = svgEditor.curConfig.extPath,
          svgCanvas = svgEditor.canvas;
      /**
       * Get file name out of SVGEdit document title.
       * @returns {string}
       */

      function getFileNameFromTitle() {
        var title = svgCanvas.getDocumentTitle();
        return title.trim();
      }

      var saveSvgAction = extPath + 'savefile.php';
      svgEditor.setCustomHandlers({
        save: function save(win, data) {
          var svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data,
              filename = getFileNameFromTitle();
          $.post(saveSvgAction, {
            output_svg: svg,
            filename: filename
          });
        }
      });
    }
  };

  return extPhp_savefile;

}());
