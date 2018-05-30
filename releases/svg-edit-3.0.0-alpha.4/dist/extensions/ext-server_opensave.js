(function () {
  'use strict';

  /* globals jQuery */
  /*
   * ext-server_opensave.js
   *
   * Licensed under the MIT License
   *
   * Copyright(c) 2010 Alexis Deveria
   *
   */

  svgEditor.addExtension('server_opensave', {
    callback: function callback(_ref) {
      var canvg = _ref.canvg,
          decode64 = _ref.decode64,
          encode64 = _ref.encode64,
          buildCanvgCallback = _ref.buildCanvgCallback;

      var $ = jQuery;
      var svgCanvas = svgEditor.canvas;
      function getFileNameFromTitle() {
        var title = svgCanvas.getDocumentTitle();
        // We convert (to underscore) only those disallowed Win7 file name characters
        return title.trim().replace(/[/\\:*?"<>|]/g, '_');
      }
      function xhtmlEscape(str) {
        return str.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); // < is actually disallowed above anyways
      }
      function clientDownloadSupport(filename, suffix, uri) {
        var support = $('<a>')[0].download === '';
        var a = void 0;
        if (support) {
          a = $('<a>hidden</a>').attr({
            download: (filename || 'image') + suffix,
            href: uri
          }).css('display', 'none').appendTo('body');
          a[0].click();
          return true;
        }
      }
      var saveSvgAction = svgEditor.curConfig.extPath + 'filesave.php',
          saveImgAction = svgEditor.curConfig.extPath + 'filesave.php';
      // Create upload target (hidden iframe)

      var cancelled = false;

      $('<iframe name="output_frame" src="#"/>').hide().appendTo('body');
      svgEditor.setCustomHandlers({
        save: function save(win, data) {
          var svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data,
              // Firefox doesn't seem to know it is UTF-8 (no matter whether we use or skip the clientDownload code) despite the Content-Disposition header containing UTF-8, but adding the encoding works
          filename = getFileNameFromTitle();

          if (clientDownloadSupport(filename, '.svg', 'data:image/svg+xml;charset=UTF-8;base64,' + encode64(svg))) {
            return;
          }

          $('<form>').attr({
            method: 'post',
            action: saveSvgAction,
            target: 'output_frame'
          }).append('<input type="hidden" name="output_svg" value="' + xhtmlEscape(svg) + '">').append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">').appendTo('body').submit().remove();
        },
        exportPDF: function exportPDF(win, data) {
          var filename = getFileNameFromTitle(),
              datauri = data.dataurlstring;
          if (clientDownloadSupport(filename, '.pdf', datauri)) {
            return;
          }
          $('<form>').attr({
            method: 'post',
            action: saveImgAction,
            target: 'output_frame'
          }).append('<input type="hidden" name="output_img" value="' + datauri + '">').append('<input type="hidden" name="mime" value="application/pdf">').append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">').appendTo('body').submit().remove();
        },

        // Todo: Integrate this extension with a new built-in exportWindowType, "download"
        exportImage: function exportImage(win, data) {
          var issues = data.issues,
              mimeType = data.mimeType,
              quality = data.quality;


          if (!$('#export_canvas').length) {
            $('<canvas>', { id: 'export_canvas' }).hide().appendTo('body');
          }
          var c = $('#export_canvas')[0];

          c.width = svgCanvas.contentW;
          c.height = svgCanvas.contentH;
          buildCanvgCallback(function () {
            canvg(c, data.svg, {
              renderCallback: function renderCallback() {
                var datauri = quality ? c.toDataURL(mimeType, quality) : c.toDataURL(mimeType);
                // {uiStrings} = svgEditor;

                // Check if there are issues
                var pre = void 0,
                    note = '';
                if (issues.length) {
                  pre = '\n \u2022 ';
                  note += '\n\n' + pre + issues.join(pre);
                }

                if (note.length) {
                  alert(note);
                }

                var filename = getFileNameFromTitle();
                var suffix = '.' + data.type.toLowerCase();

                if (clientDownloadSupport(filename, suffix, datauri)) {
                  return;
                }

                $('<form>').attr({
                  method: 'post',
                  action: saveImgAction,
                  target: 'output_frame'
                }).append('<input type="hidden" name="output_img" value="' + datauri + '">').append('<input type="hidden" name="mime" value="' + mimeType + '">').append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">').appendTo('body').submit().remove();
              }
            });
          })();
        }
      });

      // Do nothing if client support is found
      if (window.FileReader) {
        return;
      }

      // Change these to appropriate script file
      var openSvgAction = svgEditor.curConfig.extPath + 'fileopen.php?type=load_svg';
      var importSvgAction = svgEditor.curConfig.extPath + 'fileopen.php?type=import_svg';
      var importImgAction = svgEditor.curConfig.extPath + 'fileopen.php?type=import_img';

      // Set up function for PHP uploader to use
      svgEditor.processFile = function (str64, type) {
        var xmlstr = void 0;
        if (cancelled) {
          cancelled = false;
          return;
        }

        $('#dialog_box').hide();

        if (type !== 'import_img') {
          xmlstr = decode64(str64);
        }

        switch (type) {
          case 'load_svg':
            svgCanvas.clear();
            svgCanvas.setSvgString(xmlstr);
            svgEditor.updateCanvas();
            break;
          case 'import_svg':
            svgCanvas.importSvgString(xmlstr);
            svgEditor.updateCanvas();
            break;
          case 'import_img':
            svgCanvas.setGoodImage(str64);
            break;
        }
      };

      // Create upload form
      var openSvgForm = $('<form>');
      openSvgForm.attr({
        enctype: 'multipart/form-data',
        method: 'post',
        action: openSvgAction,
        target: 'output_frame'
      });

      // Create import form
      var importSvgForm = openSvgForm.clone().attr('action', importSvgAction);

      // Create image form
      var importImgForm = openSvgForm.clone().attr('action', importImgAction);

      // It appears necessary to rebuild this input every time a file is
      // selected so the same file can be picked and the change event can fire.
      function rebuildInput(form) {
        form.empty();
        var inp = $('<input type="file" name="svg_file">').appendTo(form);

        function submit() {
          // This submits the form, which returns the file data using svgEditor.processFile()
          form.submit();

          rebuildInput(form);
          $.process_cancel('Uploading...', function () {
            cancelled = true;
            $('#dialog_box').hide();
          });
        }

        if (form[0] === openSvgForm[0]) {
          inp.change(function () {
            // This takes care of the "are you sure" dialog box
            svgEditor.openPrep(function (ok) {
              if (!ok) {
                rebuildInput(form);
                return;
              }
              submit();
            });
          });
        } else {
          inp.change(function () {
            // This submits the form, which returns the file data using svgEditor.processFile()
            submit();
          });
        }
      }

      // Create the input elements
      rebuildInput(openSvgForm);
      rebuildInput(importSvgForm);
      rebuildInput(importImgForm);

      // Add forms to buttons
      $('#tool_open').show().prepend(openSvgForm);
      $('#tool_import').show().prepend(importSvgForm);
      $('#tool_image').prepend(importImgForm);
    }
  });

}());
