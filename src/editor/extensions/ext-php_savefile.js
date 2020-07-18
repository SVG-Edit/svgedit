// TODO: Might add support for "exportImage" custom
//   handler as in "ext-server_opensave.js" (and in savefile.php)

export default {
  name: 'php_savefile',
  init ({$}) {
    const svgEditor = this;
    const {
      curConfig: {extPath},
      canvas: svgCanvas
    } = svgEditor;
    /**
     * Get file name out of SVGEdit document title.
     * @returns {string}
     */
    function getFileNameFromTitle () {
      const title = svgCanvas.getDocumentTitle();
      return title.trim();
    }
    const saveSvgAction = extPath + 'savefile.php';
    svgEditor.setCustomHandlers({
      save (win, data) {
        const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data,
          filename = getFileNameFromTitle();

        $.post(saveSvgAction, {output_svg: svg, filename});
      }
    });
  }
};
