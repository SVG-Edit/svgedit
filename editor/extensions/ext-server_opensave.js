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
  async init ({$, decode64, encode64, importLocale}) {
    const strings = await importLocale();
    const svgEditor = this;
    const {
      curConfig: {
        extPath,
        avoidClientSide, // Deprecated
        avoidClientSideDownload, avoidClientSideOpen
      },
      canvas: svgCanvas
    } = svgEditor;

    /**
     *
     * @returns {string}
     */
    function getFileNameFromTitle () {
      const title = svgCanvas.getDocumentTitle();
      // We convert (to underscore) only those disallowed Win7 file name characters
      return title.trim().replace(/[/\\:*?"<>|]/g, '_');
    }
    /**
     * Escapes XML predefined entities for quoted attributes.
     * @param {string} str
     * @returns {string}
     */
    function xhtmlEscape (str) {
      return str.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); // < is actually disallowed above anyways
    }

    /**
     *
     * @param {string} [filename='image']
     * @param {string} suffix To add to file name
     * @param {string} uri
     * @returns {boolean}
     */
    function clientDownloadSupport (filename, suffix, uri) {
      if (avoidClientSide || avoidClientSideDownload) {
        return false;
      }
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
      return false;
    }
    const
      saveSvgAction = extPath + 'filesave.php',
      saveImgAction = extPath + 'filesave.php';
      // Create upload target (hidden iframe)

    let cancelled = false;

    //  Hiding by size instead of display to avoid FF console errors
    //    with `getBBox` in browser.js `supportsPathBBox_`)
    $(
      `<iframe name="output_frame" title="${strings.hiddenframe}"
          style="width: 0; height: 0;" src="#"/>`
    ).appendTo('body');
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
        }).append(`
          <input type="hidden" name="output_svg" value="${xhtmlEscape(svg)}">
          <input type="hidden" name="filename" value="${xhtmlEscape(filename)}">
        `).appendTo('body')
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
        }).append(`
          <input type="hidden" name="output_img" value="${datauri}">
          <input type="hidden" name="mime" value="application/pdf">
          <input type="hidden" name="filename" value="${xhtmlEscape(filename)}">
        `).appendTo('body')
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
          pre = '\n \u2022 '; // Bullet
          note += ('\n\n' + pre + issues.join(pre));
        }

        if (note.length) {
          await $.alert(note);
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
        }).append(`
          <input type="hidden" name="output_img" value="${datauri}">
          <input type="hidden" name="mime" value="${mimeType}">
          <input type="hidden" name="filename" value="${xhtmlEscape(filename)}">
        `).appendTo('body')
          .submit().remove();
      }
    });

    // Do nothing if client support is found
    if (window.FileReader && !avoidClientSideOpen) { return; }

    // Change these to appropriate script file
    const openSvgAction = extPath + 'fileopen.php?type=load_svg';
    const importSvgAction = extPath + 'fileopen.php?type=import_svg';
    const importImgAction = extPath + 'fileopen.php?type=import_img';

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

    /**
     *
     * @param {external:jQuery} form
     * @returns {void}
     */
    function rebuildInput (form) {
      form.empty();
      const inp = $('<input type="file" name="svg_file">').appendTo(form);

      /**
       * Submit the form, empty its contents for reuse and show
       *   uploading message.
       * @returns {Promise<void>}
       */
      async function submit () {
        // This submits the form, which returns the file data using `svgEditor.processFile()`
        form.submit();

        rebuildInput(form);
        await $.process_cancel(strings.uploading);
        cancelled = true;
        $('#dialog_box').hide();
      }

      if (form[0] === openSvgForm[0]) {
        inp.change(async function () {
          // This takes care of the "are you sure" dialog box
          const ok = await svgEditor.openPrep();
          if (!ok) {
            rebuildInput(form);
            return;
          }
          await submit();
        });
      } else {
        inp.change(async function () {
          // This submits the form, which returns the file data using svgEditor.processFile()
          await submit();
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
