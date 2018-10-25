/* globals jQuery */
/**
 * ext-grid.js
 *
 * @license Apache-2.0
 *
 * @copyright 2010 Redou Mine, 2010 Alexis Deveria
 *
 */

export default {
  name: 'grid',
  async init ({NS, getTypeMap, importLocale}) {
    const strings = await importLocale();
    const svgEditor = this;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    const svgdoc = document.getElementById('svgcanvas').ownerDocument,
      {assignAttributes} = svgCanvas,
      hcanvas = document.createElement('canvas'),
      canvBG = $('#canvasBackground'),
      units = getTypeMap(), // Assumes prior `init()` call on `units.js` module
      intervals = [0.01, 0.1, 1, 10, 100, 1000];
    let showGrid = svgEditor.curConfig.showGrid || false;

    $(hcanvas).hide().appendTo('body');

    const canvasGrid = svgdoc.createElementNS(NS.SVG, 'svg');
    assignAttributes(canvasGrid, {
      id: 'canvasGrid',
      width: '100%',
      height: '100%',
      x: 0,
      y: 0,
      overflow: 'visible',
      display: 'none'
    });
    canvBG.append(canvasGrid);

    // grid-pattern
    const gridPattern = svgdoc.createElementNS(NS.SVG, 'pattern');
    assignAttributes(gridPattern, {
      id: 'gridpattern',
      patternUnits: 'userSpaceOnUse',
      x: 0, // -(value.strokeWidth / 2), // position for strokewidth
      y: 0, // -(value.strokeWidth / 2), // position for strokewidth
      width: 100,
      height: 100
    });

    const gridimg = svgdoc.createElementNS(NS.SVG, 'image');
    assignAttributes(gridimg, {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
    gridPattern.append(gridimg);
    $('#svgroot defs').append(gridPattern);

    // grid-box
    const gridBox = svgdoc.createElementNS(NS.SVG, 'rect');
    assignAttributes(gridBox, {
      width: '100%',
      height: '100%',
      x: 0,
      y: 0,
      'stroke-width': 0,
      stroke: 'none',
      fill: 'url(#gridpattern)',
      style: 'pointer-events: none; display:visible;'
    });
    $('#canvasGrid').append(gridBox);

    function updateGrid (zoom) {
      // TODO: Try this with <line> elements, then compare performance difference
      const unit = units[svgEditor.curConfig.baseUnit]; // 1 = 1px
      const uMulti = unit * zoom;
      // Calculate the main number interval
      const rawM = 100 / uMulti;
      let multi = 1;
      for (let i = 0; i < intervals.length; i++) {
        const num = intervals[i];
        multi = num;
        if (rawM <= num) {
          break;
        }
      }
      const bigInt = multi * uMulti;

      // Set the canvas size to the width of the container
      hcanvas.width = bigInt;
      hcanvas.height = bigInt;
      const ctx = hcanvas.getContext('2d');
      const curD = 0.5;
      const part = bigInt / 10;

      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = svgEditor.curConfig.gridColor;
      for (let i = 1; i < 10; i++) {
        const subD = Math.round(part * i) + 0.5;
        // const lineNum = (i % 2)?12:10;
        const lineNum = 0;
        ctx.moveTo(subD, bigInt);
        ctx.lineTo(subD, lineNum);
        ctx.moveTo(bigInt, subD);
        ctx.lineTo(lineNum, subD);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.globalAlpha = 0.5;
      ctx.moveTo(curD, bigInt);
      ctx.lineTo(curD, 0);

      ctx.moveTo(bigInt, curD);
      ctx.lineTo(0, curD);
      ctx.stroke();

      const datauri = hcanvas.toDataURL('image/png');
      gridimg.setAttribute('width', bigInt);
      gridimg.setAttribute('height', bigInt);
      gridimg.parentNode.setAttribute('width', bigInt);
      gridimg.parentNode.setAttribute('height', bigInt);
      svgCanvas.setHref(gridimg, datauri);
    }

    function gridUpdate () {
      if (showGrid) {
        updateGrid(svgCanvas.getZoom());
      }
      $('#canvasGrid').toggle(showGrid);
      $('#view_grid').toggleClass('push_button_pressed tool_button');
    }
    const buttons = [{
      id: 'view_grid',
      icon: svgEditor.curConfig.extIconsPath + 'grid.png',
      type: 'context',
      panel: 'editor_panel',
      events: {
        click () {
          svgEditor.curConfig.showGrid = showGrid = !showGrid;
          gridUpdate();
        }
      }
    }];
    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.extIconsPath + 'grid-icon.xml',

      zoomChanged (zoom) {
        if (showGrid) { updateGrid(zoom); }
      },
      callback () {
        if (showGrid) {
          gridUpdate();
        }
      },
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      })
    };
  }
};
