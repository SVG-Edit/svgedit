/**
 * @file ext-server_moinsave.js
 *
 * @license (MIT OR GPL-2.0-or-later)
 *
 * @copyright 2010 Alexis Deveria, 2011 MoinMoin:ReimarBauer
 *  adopted for moinmoins item storage. It sends in one post png and svg data
 *  (I agree to dual license my work to additional GPLv2 or later)
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
  name: 'server_moinsave',
  async init ({ encode64 }) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
    const saveSvgAction = '/+modify';

    // Create upload target (hidden iframe)
    //  Hiding by size instead of display to avoid FF console errors
    //    with `getBBox` in browser.js `supportsPathBBox_`)
    const iframe = document.createElement('IFRAME');
    iframe.src="data:text/html;base64,PGh0bWw+PC9odG1sPg==";
    document.body.append(iframe);
    iframe.name = "output_frame";
    iframe.contentWindow.document.title = strings.hiddenframe;
    iframe.style.cssText = "width:0;height:0;";

    svgEditor.setCustomHandlers({
      async save (win, data) {
        const svg = '<?xml version="1.0"?>\n' + data;
        const { pathname } = new URL(location);
        const name = pathname.replace(/\/+get\//, '');
        const svgData = encode64(svg);
        if (!$id('export_canvas')) {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('id', 'export_canvas');
          canvas.style.display = 'none';
          document.body.appendChild(canvas);
        }
        const c = $id('export_canvas');
        c.style.width = svgCanvas.contentW;
        c.style.height = svgCanvas.contentH;
        await canvg(c, svg);
        const datauri = c.toDataURL('image/png');
        // const {uiStrings} = svgEditor;
        const pngData = encode64(datauri); // Brett: This encoding seems unnecessary

        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', saveSvgAction + '/' + name);
        form.setAttribute('target', 'output_frame');
        // eslint-disable-next-line no-unsanitized/property
        form.innerHTML = `<input type="hidden" name="png_data" value="${pngData}">
        <input type="hidden" name="filepath" value="${svgData}">
        <input type="hidden" name="filename" value="drawing.svg">
        <input type="hidden" name="contenttype" value="application/x-svgdraw">`;
        document.body.append(form);
        form.submit();
        form.remove();

        // eslint-disable-next-line no-alert
        alert(strings.saved);
        top.window.location = '/' + name;
      }
    });
  }
};
