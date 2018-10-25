/* globals jQuery */
/**
 * ext-server_moinsave.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2011 MoinMoin:ReimarBauer
 *  adopted for moinmoins item storage. It sends in one post png and svg data
 *  (I agree to dual license my work to additional GPLv2 or later)
 */
import {canvg} from '../canvg/canvg.js';

export default {
  name: 'server_moinsave',
  async init ({encode64, importLocale}) {
    const strings = await importLocale();
    const svgEditor = this;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    const saveSvgAction = '/+modify';

    // Create upload target (hidden iframe)
    /* const target = */ $('<iframe name="output_frame" src="#"/>').hide().appendTo('body');

    svgEditor.setCustomHandlers({
      async save (win, data) {
        const svg = '<?xml version="1.0"?>\n' + data;
        const qstr = $.param.querystring();
        const name = qstr.substr(9).split('/+get/')[1];
        const svgData = encode64(svg);
        if (!$('#export_canvas').length) {
          $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
        }
        const c = $('#export_canvas')[0];
        c.width = svgCanvas.contentW;
        c.height = svgCanvas.contentH;
        await canvg(c, svg);
        const datauri = c.toDataURL('image/png');
        // const {uiStrings} = svgEditor;
        const pngData = encode64(datauri); // Brett: This encoding seems unnecessary
        /* const form = */ $('<form>').attr({
          method: 'post',
          action: saveSvgAction + '/' + name,
          target: 'output_frame'
        }).append('<input type="hidden" name="png_data" value="' + pngData + '">')
          .append('<input type="hidden" name="filepath" value="' + svgData + '">')
          .append('<input type="hidden" name="filename" value="' + 'drawing.svg">')
          .append('<input type="hidden" name="contenttype" value="application/x-svgdraw">')
          .appendTo('body')
          .submit().remove();
        alert(strings.saved);
        top.window.location = '/' + name;
      }
    });
  }
};
