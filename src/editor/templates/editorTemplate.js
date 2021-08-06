const editorTemplate = document.createElement('template');

editorTemplate.innerHTML = `
  <div class="svg_editor">
    <div id="workarea">
      <div id="svgcanvas"></div>
    </div>
  </div>
`;

export default editorTemplate;
