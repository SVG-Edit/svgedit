/**
 * Opens the dialog with the SVG Editor.
 * @returns {void}
 */
function startSvgEdit () { // eslint-disable-line no-unused-vars
  const url = 'chrome://svg-edit/content/editor/svg-editor.html';
  window.openDialog(url, 'SVG Editor', 'width=1024,height=700,menubar=no,toolbar=no');
}
