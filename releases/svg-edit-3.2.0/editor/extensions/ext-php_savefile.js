/* globals jQuery */
// TODO: Might add support for "exportImage" custom
//   handler as in "ext-server_opensave.js" (and in savefile.php)

export default {
  name: 'php_savefile',
  init () {
    const svgEditor = this;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    function getFileNameFromTitle () {
      const title = svgCanvas.getDocumentTitle();
      return title.trim();
    }
    const saveSvgAction = svgEditor.curConfig.extPath + 'savefile.php';
    svgEditor.setCustomHandlers({
      save (win, data) {
        const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data,
          filename = getFileNameFromTitle();

        $.post(saveSvgAction, {output_svg: svg, filename});
      }
    });
  }
};
