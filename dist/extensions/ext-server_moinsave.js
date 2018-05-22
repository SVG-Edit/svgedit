(function () {
  'use strict';

  /* globals jQuery */
  /*
   * ext-server_moinsave.js
   *
   * Licensed under the MIT License
   *
   * Copyright(c) 2010 Alexis Deveria
   *              2011 MoinMoin:ReimarBauer
   *                   adopted for moinmoins item storage. it sends in one post png and svg data
   *                   (I agree to dual license my work to additional GPLv2 or later)
   *
   */

  svgEditor.addExtension('server_opensave', {
    callback: function callback(_ref) {
      var canvg = _ref.canvg,
          encode64 = _ref.encode64,
          buildCanvgCallback = _ref.buildCanvgCallback;

      var $ = jQuery;
      var svgCanvas = svgEditor.canvas;
      var saveSvgAction = '/+modify';

      // Create upload target (hidden iframe)
      /* const target = */$('<iframe name="output_frame" src="#"/>').hide().appendTo('body');

      svgEditor.setCustomHandlers({
        save: function save(win, data) {
          var svg = '<?xml version="1.0"?>\n' + data;
          var qstr = $.param.querystring();
          var name = qstr.substr(9).split('/+get/')[1];
          var svgData = encode64(svg);
          if (!$('#export_canvas').length) {
            $('<canvas>', { id: 'export_canvas' }).hide().appendTo('body');
          }
          var c = $('#export_canvas')[0];
          c.width = svgCanvas.contentW;
          c.height = svgCanvas.contentH;
          buildCanvgCallback(function () {
            canvg(c, svg, {
              renderCallback: function renderCallback() {
                var datauri = c.toDataURL('image/png');
                // const {uiStrings} = svgEditor;
                var pngData = encode64(datauri); // Brett: This encoding seems unnecessary
                /* const form = */$('<form>').attr({
                  method: 'post',
                  action: saveSvgAction + '/' + name,
                  target: 'output_frame'
                }).append('<input type="hidden" name="png_data" value="' + pngData + '">').append('<input type="hidden" name="filepath" value="' + svgData + '">').append('<input type="hidden" name="filename" value="' + 'drawing.svg">').append('<input type="hidden" name="contenttype" value="application/x-svgdraw">').appendTo('body').submit().remove();
              }
            });
          })();
          alert('Saved! Return to Item View!');
          top.window.location = '/' + name;
        }
      });
    }
  });

}());
