/* eslint-disable no-var */
/* globals svgEditor, svgedit, svgCanvas, $ */
/*
 * ext-grid.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Redou Mine
 * Copyright(c) 2010 Alexis Deveria
 *
 */

// Dependencies:
// 1) units.js
// 2) everything else

svgEditor.addExtension('view_grid', function () {
  'use strict';

  var NS = svgedit.NS,
    svgdoc = document.getElementById('svgcanvas').ownerDocument,
    showGrid = svgEditor.curConfig.showGrid || false,
    assignAttributes = svgCanvas.assignAttributes,
    hcanvas = document.createElement('canvas'),
    canvBG = $('#canvasBackground'),
    units = svgedit.units.getTypeMap(),
    intervals = [0.01, 0.1, 1, 10, 100, 1000];

  $(hcanvas).hide().appendTo('body');

  var canvasGrid = svgdoc.createElementNS(NS.SVG, 'svg');
  assignAttributes(canvasGrid, {
    'id': 'canvasGrid',
    'width': '100%',
    'height': '100%',
    'x': 0,
    'y': 0,
    'overflow': 'visible',
    'display': 'none'
  });
  canvBG.append(canvasGrid);

  // grid-pattern
  var gridPattern = svgdoc.createElementNS(NS.SVG, 'pattern');
  assignAttributes(gridPattern, {
    'id': 'gridpattern',
    'patternUnits': 'userSpaceOnUse',
    'x': 0, // -(value.strokeWidth / 2), // position for strokewidth
    'y': 0, // -(value.strokeWidth / 2), // position for strokewidth
    'width': 100,
    'height': 100
  });

  var gridimg = svgdoc.createElementNS(NS.SVG, 'image');
  assignAttributes(gridimg, {
    'x': 0,
    'y': 0,
    'width': 100,
    'height': 100
  });
  gridPattern.appendChild(gridimg);
  $('#svgroot defs').append(gridPattern);

  // grid-box
  var gridBox = svgdoc.createElementNS(NS.SVG, 'rect');
  assignAttributes(gridBox, {
    'width': '100%',
    'height': '100%',
    'x': 0,
    'y': 0,
    'stroke-width': 0,
    'stroke': 'none',
    'fill': 'url(#gridpattern)',
    'style': 'pointer-events: none; display:visible;'
  });
  $('#canvasGrid').append(gridBox);

  function updateGrid (zoom) {
    var i;
    // TODO: Try this with <line> elements, then compare performance difference
    var unit = units[svgEditor.curConfig.baseUnit]; // 1 = 1px
    var uMulti = unit * zoom;
    // Calculate the main number interval
    var rawM = 100 / uMulti;
    var multi = 1;
    for (i = 0; i < intervals.length; i++) {
      var num = intervals[i];
      multi = num;
      if (rawM <= num) {
        break;
      }
    }
    var bigInt = multi * uMulti;

    // Set the canvas size to the width of the container
    hcanvas.width = bigInt;
    hcanvas.height = bigInt;
    var ctx = hcanvas.getContext('2d');
    var curD = 0.5;
    var part = bigInt / 10;

    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = svgEditor.curConfig.gridColor;
    for (i = 1; i < 10; i++) {
      var subD = Math.round(part * i) + 0.5;
      // var lineNum = (i % 2)?12:10;
      var lineNum = 0;
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

    var datauri = hcanvas.toDataURL('image/png');
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
  return {
    name: 'view_grid',
    svgicons: svgEditor.curConfig.extPath + 'grid-icon.xml',

    zoomChanged: function (zoom) {
      if (showGrid) { updateGrid(zoom); }
    },
    callback: function () {
      if (showGrid) {
        gridUpdate();
      }
    },
    buttons: [{
      id: 'view_grid',
      type: 'context',
      panel: 'editor_panel',
      title: 'Show/Hide Grid',
      events: {
        click: function () {
          svgEditor.curConfig.showGrid = showGrid = !showGrid;
          gridUpdate();
        }
      }
    }]
  };
});
