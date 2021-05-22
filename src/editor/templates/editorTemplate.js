const editorTemplate = document.createElement('template');

editorTemplate.innerHTML = `
  <style>
  #svgroot {
    -moz-user-select: none;
    -webkit-user-select: none;
    position: absolute;
    top: 0;
    left: 0;
  }
  #workarea {
    display: inline-table-cell;
    position:absolute;
    top: 40px;
    left: 40px;
    bottom: 40px;
    right: 14px;
    background-color: #A0A0A0;
    border: 1px solid var(--border-color);
    overflow: auto;
    text-align: center;
  }
  
  #svgcanvas {
    line-height: normal;
    display: inline-block;
    background: var(--canvas-bg-color);
    text-align: center;
    vertical-align: middle;
    width: 640px;
    height: 480px;
    /* for widget regions that shouldn't react to dragging */
    -apple-dashboard-region:dashboard-region(control rectangle 0px 0px 0px 0px);
    position: relative;
  }
  
  </style>
</div>
<div id="workarea">
 <div id="svgcanvas" style="position: relative;">
 </div>
</div>
`;

export default editorTemplate;
