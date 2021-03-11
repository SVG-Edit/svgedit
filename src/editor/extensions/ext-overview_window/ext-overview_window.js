/**
 * @file ext-overview_window.js
 *
 * @license MIT
 *
 * @copyright 2013 James Sacksteder
 *
 */
import { dragmove } from '@knadh/dragmove';
export default {
  name: 'overview_window',
  init ({$, isChrome}) {
    const overviewWindowGlobals = {};
    // Disabled in Chrome 48-, see https://github.com/SVG-Edit/svgedit/issues/26 and
    // https://code.google.com/p/chromium/issues/detail?id=565120.
    if (isChrome()) {
      const verIndex = navigator.userAgent.indexOf('Chrome/') + 7;
      const chromeVersion = Number.parseInt(navigator.userAgent.substring(verIndex));
      if (chromeVersion < 49) {
        return undefined;
      }
    }

    // Define and insert the base html element.
    const propsWindowHtml =
      '<div id="overview_window_content_pane" style="width:100%; ' +
        'word-wrap:break-word;  display:inline-block; margin-top:20px;">' +
        '<div id="overview_window_content" style="position:relative; ' +
          'left:12px; top:0px;">' +
          '<div style="background-color:#A0A0A0; display:inline-block; ' +
            'overflow:visible;">' +
            '<svg id="overviewMiniView" width="150" height="100" x="0" ' +
              'y="0" viewBox="0 0 4800 3600" ' +
                'xmlns="http://www.w3.org/2000/svg" ' +
                'xmlns:xlink="http://www.w3.org/1999/xlink">' +
              '<use x="0" y="0" xlink:href="#svgroot"> </use>' +
            '</svg>' +
            '<div id="overview_window_view_box" style="min-width:50px; ' +
              'min-height:50px; position:absolute; top:30px; left:30px; ' +
              'z-index:5; background-color:rgba(255,0,102,0.3);">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    $('#sidepanels').append(propsWindowHtml);

    // Define dynamic animation of the view box.
    const updateViewBox = function () {
      const portHeight = Number.parseFloat($('#workarea').css('height'));
      const portWidth = Number.parseFloat($('#workarea').css('width'));
      const portX = $('#workarea').scrollLeft();
      const portY = $('#workarea').scrollTop();
      const windowWidth = Number.parseFloat($('#svgcanvas').css('width'));
      const windowHeight = Number.parseFloat($('#svgcanvas').css('height'));
      const overviewWidth = $('#overviewMiniView').attr('width');
      const overviewHeight = $('#overviewMiniView').attr('height');

      const viewBoxX = portX / windowWidth * overviewWidth;
      const viewBoxY = portY / windowHeight * overviewHeight;
      const viewBoxWidth = portWidth / windowWidth * overviewWidth;
      const viewBoxHeight = portHeight / windowHeight * overviewHeight;

      $('#overview_window_view_box').css('min-width', viewBoxWidth + 'px');
      $('#overview_window_view_box').css('min-height', viewBoxHeight + 'px');
      $('#overview_window_view_box').css('top', viewBoxY + 'px');
      $('#overview_window_view_box').css('left', viewBoxX + 'px');
    };
    $('#workarea').scroll(function () {
      if (!(overviewWindowGlobals.viewBoxDragging)) {
        updateViewBox();
      }
    });
    $('#workarea').resize(updateViewBox);
    updateViewBox();

    // Compensate for changes in zoom and canvas size.
    const updateViewDimensions = function () {
      const viewWidth = $('#svgroot').attr('width');
      const viewHeight = $('#svgroot').attr('height');

      const viewX = 640;
      const viewY = 480;

      const svgWidthOld = $('#overviewMiniView').attr('width');
      const svgHeightNew = viewHeight / viewWidth * svgWidthOld;
      $('#overviewMiniView').attr('viewBox', viewX + ' ' + viewY + ' ' + viewWidth + ' ' + viewHeight);
      $('#overviewMiniView').attr('height', svgHeightNew);
      updateViewBox();
    };
    updateViewDimensions();

    // Set up the overview window as a controller for the view port.
    overviewWindowGlobals.viewBoxDragging = false;
    const updateViewPortFromViewBox = function () {
      const windowWidth = Number.parseFloat($('#svgcanvas').css('width'));
      const windowHeight = Number.parseFloat($('#svgcanvas').css('height'));
      const overviewWidth = $('#overviewMiniView').attr('width');
      const overviewHeight = $('#overviewMiniView').attr('height');
      const viewBoxX = Number.parseFloat($('#overview_window_view_box').css('left'));
      const viewBoxY = Number.parseFloat($('#overview_window_view_box').css('top'));

      const portX = viewBoxX / overviewWidth * windowWidth;
      const portY = viewBoxY / overviewHeight * windowHeight;

      $('#workarea').scrollLeft(portX);
      $('#workarea').scrollTop(portY);
    };
    const onStart = function () {
      overviewWindowGlobals.viewBoxDragging = true;
      updateViewPortFromViewBox();
    };
    const onEnd = function (el, parent, x, y) {
      if((el.offsetLeft + el.offsetWidth) > $(parent).attr('width')){
        el.style.left = ($(parent).attr('width') - el.offsetWidth) + 'px';
      } else if(el.offsetLeft  < 0){
        el.style.left = "0px"
      }
      if((el.offsetTop + el.offsetHeight) > $(parent).attr('height')){
        el.style.top = ($(parent).attr('height') - el.offsetHeight) + 'px';
      } else if(el.offsetTop  < 0){
        el.style.top = "0px"
      }
      overviewWindowGlobals.viewBoxDragging = false;
      updateViewPortFromViewBox();
    };
    const onDrag = function () {
      updateViewPortFromViewBox();
    };
    const dragElem = document.querySelector("#overview_window_view_box");
    const parentElem = document.querySelector("#overviewMiniView");
    dragmove(dragElem, dragElem, parentElem, onStart, onEnd, onDrag);

    $('#overviewMiniView').click(function (evt) {
      // Firefox doesn't support evt.offsetX and evt.offsetY.
      const mouseX = (evt.offsetX || evt.originalEvent.layerX);
      const mouseY = (evt.offsetY || evt.originalEvent.layerY);
      const overviewWidth = $('#overviewMiniView').attr('width');
      const overviewHeight = $('#overviewMiniView').attr('height');
      const viewBoxWidth = Number.parseFloat($('#overview_window_view_box').css('min-width'));
      const viewBoxHeight = Number.parseFloat($('#overview_window_view_box').css('min-height'));

      let viewBoxX = mouseX - 0.5 * viewBoxWidth;
      let viewBoxY = mouseY - 0.5 * viewBoxHeight;
      // deal with constraints
      if (viewBoxX < 0) {
        viewBoxX = 0;
      }
      if (viewBoxY < 0) {
        viewBoxY = 0;
      }
      if (viewBoxX + viewBoxWidth > overviewWidth) {
        viewBoxX = overviewWidth - viewBoxWidth;
      }
      if (viewBoxY + viewBoxHeight > overviewHeight) {
        viewBoxY = overviewHeight - viewBoxHeight;
      }

      $('#overview_window_view_box').css('top', viewBoxY + 'px');
      $('#overview_window_view_box').css('left', viewBoxX + 'px');
      updateViewPortFromViewBox();
    });

    return {
      name: 'overview window',
      canvasUpdated: updateViewDimensions,
      workareaResized: updateViewBox
    };
  }
};
