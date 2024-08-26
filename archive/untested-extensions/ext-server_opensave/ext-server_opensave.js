/**
 * @file ext-server_opensave.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */
import { Canvg as canvg } from 'canvg';

const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'server_opensave',
  async init ({ decode64, encode64 }) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    const {
      curConfig: {
        avoidClientSide, // Deprecated
        avoidClientSideDownload, avoidClientSideOpen
      },
      canvas: svgCanvas
    } = svgEditor;
    const { $id } = svgCanvas;

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
     * @param {string} [filename="image"]
     * @param {string} suffix To add to file name
     * @param {string} uri
     * @returns {boolean}
     */
    function clientDownloadSupport (filename, suffix, uri) {
      if (avoidClientSide || avoidClientSideDownload) {
        return false;
      }
      const support = document.querySelector('a').download === '';
      let a;
      if (support) {
        a = document.createElement("a");
        a.text = 'hidden';
        a.download = (filename || 'image') + suffix;
        a.href = uri;
        a.style.dispaly = 'none';
        document.body.appendChild(a);
        a.click();
        return true;
      }
      return false;
    }
    const
      saveSvgAction = './filesave.php';
    const saveImgAction = './filesave.php';
    // Create upload target (hidden iframe)

    let cancelled = false;

    //  Hiding by size instead of display to avoid FF console errors
    //    with `getBBox` in browser.js `supportsPathBBox_`)
    const iframe = document.createElement('IFRAME');
    iframe.src="data:text/html;base64,PGh0bWw+";
    document.body.append(iframe);
    iframe.name = "output_frame";
    iframe.contentWindow.document.title = strings.hiddenframe;
    iframe.style.cssText = "width:0;height:0;";

    svgEditor.setCustomHandlers({
      save (win, data) {
        // Firefox doesn't seem to know it is UTF-8 (no matter whether we use or skip the clientDownload code) despite the Content-Disposition header containing UTF-8, but adding the encoding works
        const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data;
        const filename = getFileNameFromTitle();

        if (clientDownloadSupport(filename, '.svg', 'data:image/svg+xml;charset=UTF-8;base64,' + encode64(svg))) {
          return;
        }

        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', saveSvgAction);
        form.setAttribute('target', 'output_frame');
        // eslint-disable-next-line no-unsanitized/property
        form.innerHTML = `<input type="hidden" name="output_svg" value="${xhtmlEscape(svg)}">
        <input type="hidden" name="filename" value="${xhtmlEscape(filename)}">`;
        document.body.append(form);
        form.submit();
        form.remove();
      },
      exportPDF (win, data) {
        const filename = getFileNameFromTitle();
        const datauri = data.output;
        if (clientDownloadSupport(filename, '.pdf', datauri)) {
          return;
        }
        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', saveImgAction);
        form.setAttribute('target', 'output_frame');
        // eslint-disable-next-line no-unsanitized/property
        form.innerHTML = `<input type="hidden" name="output_img" value="${datauri}">
        <input type="hidden" name="mime" value="application/pdf">
        <input type="hidden" name="filename" value="${xhtmlEscape(filename)}">`;
        document.body.append(form);
        form.submit();
        form.remove();
      },
      // Todo: Integrate this extension with a new built-in exportWindowType, "download"
      async exportImage (win, data) {
        const { issues, mimeType, quality } = data;

        if (!$id('export_canvas')) {
          const canvasx = document.createElement("CANVAS");
          canvasx.id = 'export_canvas';
          canvasx.style.display = 'none';
          document.body.appendChild(canvasx);
        }
        const c = $id('export_canvas');

        c.style.width = svgCanvas.contentW;
        c.style.height = svgCanvas.contentH;
        await canvg(c, data.svg);
        const datauri = quality ? c.toDataURL(mimeType, quality) : c.toDataURL(mimeType);

        // Check if there are issues
        let pre; let note = '';
        if (issues.length) {
          pre = '\n \u2022 '; // Bullet
          note += ('\n\n' + pre + issues.join(pre));
        }

        if (note.length) {
          // eslint-disable-next-line no-alert
          alert(note);
        }

        const filename = getFileNameFromTitle();
        const suffix = '.' + data.type.toLowerCase();

        if (clientDownloadSupport(filename, suffix, datauri)) {
          return;
        }

        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', saveImgAction);
        form.setAttribute('target', 'output_frame');
        // eslint-disable-next-line no-unsanitized/property
        form.innerHTML = `<input type="hidden" name="output_img" value="${datauri}">
        <input type="hidden" name="mime" value="${mimeType}">
        <input type="hidden" name="filename" value="${xhtmlEscape(filename)}">`;
        document.body.append(form);
        form.submit();
        form.remove();
      }
    });

    // Do nothing if client support is found
    if (window.FileReader && !avoidClientSideOpen) { return; }

    // Change these to appropriate script file
    const openSvgAction = './fileopen.php?type=load_svg';
    const importSvgAction = './fileopen.php?type=import_svg';
    const importImgAction = './fileopen.php?type=import_img';

    // Set up function for PHP uploader to use
    svgEditor.processFile = function (str64, type) {
      let xmlstr;
      if (cancelled) {
        cancelled = false;
        return;
      }
      if($id("dialog_box") != null) $id("dialog_box").style.display = 'none';

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

    const openSvgForm = document.createElement("FORM");
    openSvgForm.action = openSvgAction;
    openSvgForm.enctype = 'multipart/form-data';
    openSvgForm.method = 'post';
    openSvgForm.target = 'output_frame';


    // Create import form
    const importSvgForm = openSvgForm.cloneNode(true);
    importSvgForm.action =  importSvgAction;

    // Create image form
    const importImgForm = openSvgForm.cloneNode(true);
    importImgForm.action = importImgAction;

    // It appears necessary to rebuild this input every time a file is
    // selected so the same file can be picked and the change event can fire.

    /**
     *
     * @param {external:jQuery} form
     * @returns {void}
     */
    function rebuildInput (form) {
      form.empty();
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.name = 'svg_file';
      form.appendChild(inp);

      /**
       * Submit the form, empty its contents for reuse and show
       *   uploading message.
       * @returns {Promise<void>}
       */
      async function submit () {
        // This submits the form, which returns the file data using `svgEditor.processFile()`
        form.submit();

        rebuildInput(form);
        // await $.process_cancel(strings.uploading);
        cancelled = true;
        if($id("dialog_box") != null) $id("dialog_box").style.display = 'none';
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
    $id("tool_open").style.display = 'block';
    $id("tool_import").style.display = 'block';
    $id('tool_open').insertBefore(openSvgForm, $id('tool_open').firstChild);
    $id('tool_import').insertBefore(importSvgForm, $id('tool_import').firstChild);
    $id('tool_image').insertBefore(importImgForm, $id('tool_image').firstChild);
  }
};
