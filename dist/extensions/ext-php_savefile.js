var svgEditorExtension_php_savefile = (function () {
  'use strict';

  /* globals jQuery */
  // TODO: Might add support for "exportImage" custom
  //   handler as in "ext-server_opensave.js" (and in savefile.php)
  var extPhp_savefile = {
    name: 'php_savefile',
    init: function init() {
      var svgEditor = this;
      var $ = jQuery;
      var svgCanvas = svgEditor.canvas;

      function getFileNameFromTitle() {
        var title = svgCanvas.getDocumentTitle();
        return title.trim();
      }

      var saveSvgAction = svgEditor.curConfig.extPath + 'savefile.php';
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
