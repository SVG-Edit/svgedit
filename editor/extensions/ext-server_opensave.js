/* globals jQuery */
/**
 * ext-server_opensave.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */
import {canvg} from '../canvg/canvg.js';

export default {
  name: 'server_opensave',
  async init ({decode64, encode64, importLocale}) {
    const strings = await importLocale();
    const svgEditor = this;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    function getFileNameFromTitle () {
      const title = svgCanvas.getDocumentTitle();
      // We convert (to underscore) only those disallowed Win7 file name characters
      return title.trim().replace(/[/\\:*?"<>|]/g, '_');
    }
    function xhtmlEscape (str) {
      return str.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); // < is actually disallowed above anyways
    }
    function clientDownloadSupport (filename, suffix, uri) {
      const support = $('<a>')[0].download === '';
      let a;
      if (support) {
        a = $('<a>hidden</a>').attr({
          download: (filename || 'image') + suffix,
          href: uri
        }).css('display', 'none').appendTo('body');
        a[0].click();
        return true;
      }
    }
    const
      saveSvgAction = svgEditor.curConfig.extPath + 'filesave.php',
      saveImgAction = svgEditor.curConfig.extPath + 'filesave.php';
      // Create upload target (hidden iframe)

    let cancelled = false;

    $('<iframe name="output_frame" src="#"/>').hide().appendTo('body');
    svgEditor.setCustomHandlers({
      save (win, data) {
        const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data, // Firefox doesn't seem to know it is UTF-8 (no matter whether we use or skip the clientDownload code) despite the Content-Disposition header containing UTF-8, but adding the encoding works
          filename = getFileNameFromTitle();

        if (clientDownloadSupport(filename, '.svg', 'data:image/svg+xml;charset=UTF-8;base64,' + encode64(svg))) {
          return;
        }

        $('<form>').attr({
          method: 'post',
          action: saveSvgAction,
          target: 'output_frame'
        }).append('<input type="hidden" name="output_svg" value="' + xhtmlEscape(svg) + '">')
          .append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">')
          .appendTo('body')
          .submit().remove();
      },
      exportPDF (win, data) {
        const filename = getFileNameFromTitle(),
          datauri = data.output;
        if (clientDownloadSupport(filename, '.pdf', datauri)) {
          return;
        }
        $('<form>').attr({
          method: 'post',
          action: saveImgAction,
          target: 'output_frame'
        }).append('<input type="hidden" name="output_img" value="' + datauri + '">')
          .append('<input type="hidden" name="mime" value="application/pdf">')
          .append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">')
          .appendTo('body')
          .submit().remove();
      },
      // Todo: Integrate this extension with a new built-in exportWindowType, "download"
      async exportImage (win, data) {
        const {issues, mimeType, quality} = data;

        if (!$('#export_canvas').length) {
          $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
        }
        const c = $('#export_canvas')[0];

        c.width = svgCanvas.contentW;
        c.height = svgCanvas.contentH;
        await canvg(c, data.svg);
        const datauri = quality ? c.toDataURL(mimeType, quality) : c.toDataURL(mimeType);
        // {uiStrings} = svgEditor;

        // Check if there are issues
        let pre, note = '';
        if (issues.length) {
          pre = '\n \u2022 ';
          note += ('\n\n' + pre + issues.join(pre));
        }

        if (note.length) {
          alert(note);
        }

        const filename = getFileNameFromTitle();
        const suffix = '.' + data.type.toLowerCase();

        if (clientDownloadSupport(filename, suffix, datauri)) {
          return;
        }

        $('<form>').attr({
          method: 'post',
          action: saveImgAction,
          target: 'output_frame'
        }).append('<input type="hidden" name="output_img" value="' + datauri + '">')
          .append('<input type="hidden" name="mime" value="' + mimeType + '">')
          .append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">')
          .appendTo('body')
          .submit().remove();
      }
    });

    // Do nothing if client support is found
    if (window.FileReader) { return; }

    // Change these to appropriate script file
    const openSvgAction = svgEditor.curConfig.extPath + 'fileopen.php?type=load_svg';
    const importSvgAction = svgEditor.curConfig.extPath + 'fileopen.php?type=import_svg';
    const importImgAction = svgEditor.curConfig.extPath + 'fileopen.php?type=import_img';

    // Set up function for PHP uploader to use
    svgEditor.processFile = function (str64, type) {
      let xmlstr;
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
    const openSvgForm = $('<form>');
    openSvgForm.attr({
      enctype: 'multipart/form-data',
      method: 'post',
      action: openSvgAction,
      target: 'output_frame'
    });

    // Create import form
    const importSvgForm = openSvgForm.clone().attr('action', importSvgAction);

    // Create image form
    const importImgForm = openSvgForm.clone().attr('action', importImgAction);

    // It appears necessary to rebuild this input every time a file is
    // selected so the same file can be picked and the change event can fire.
    function rebuildInput (form) {
      form.empty();
      const inp = $('<input type="file" name="svg_file">').appendTo(form);

      function submit () {
        // This submits the form, which returns the file data using svgEditor.processFile()
        form.submit();

        rebuildInput(form);
        $.process_cancel(strings.uploading, function () {
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
};
