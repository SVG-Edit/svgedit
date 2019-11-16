/* globals jQuery */
/**
* Attaches items to DOM for Embedded SVG support.
* @module EmbeddedSVGEditDOM
*/
import EmbeddedSVGEdit from './embedapi.js';
import {isChrome} from './browser.js';

const $ = jQuery;

let svgCanvas = null;

/**
* @param {string} data
* @param {string} error
* @returns {void}
*/
function handleSvgData (data, error) {
  if (error) {
    // Todo: This should be replaced with a general purpose dialog alert library call
    alert('error ' + error); // eslint-disable-line no-alert
  } else {
    // Todo: This should be replaced with a general purpose dialog alert library call
    alert('Congratulations. Your SVG string is back in the host page, do with it what you will\n\n' + data); // eslint-disable-line no-alert
  }
}

/**
* Set the canvas with an example SVG string.
* @returns {void}
*/
function loadSvg () {
  const svgexample = '<svg width="640" height="480" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1</title><rect stroke-width="5" stroke="#000000" fill="#FF0000" id="svg_1" height="35" width="51" y="35" x="32"/><ellipse ry="15" rx="24" stroke-width="5" stroke="#000000" fill="#0000ff" id="svg_2" cy="60" cx="66"/></g></svg>';
  svgCanvas.setSvgString(svgexample);
}

/**
*
* @returns {void}
*/
function saveSvg () {
  svgCanvas.getSvgString()(handleSvgData);
}

/**
* Perform a PNG export.
* @returns {void}
*/
function exportPNG () {
  svgCanvas.getUIStrings()(function (uiStrings) {
    const str = uiStrings.notification.loadingImage;
    let exportWindow;
    if (!isChrome()) {
      exportWindow = window.open(
        'data:text/html;charset=utf-8,' + encodeURIComponent('<title>' + str + '</title><h1>' + str + '</h1>'),
        'svg-edit-exportWindow'
      );
    }
    svgCanvas.rasterExport('PNG', null, exportWindow && exportWindow.name)();
  });
}

/**
* Perform a PDF export.
* @returns {void}
*/
function exportPDF () {
  svgCanvas.getUIStrings()(function (uiStrings) {
    const str = uiStrings.notification.loadingImage;

    /**
    // If you want to handle the PDF blob yourself, do as follows
    svgCanvas.bind('exportedPDF', function (win, data) {
      alert(data.output);
    });
    svgCanvas.exportPDF(); // Accepts two args: optionalWindowName supplied back to bound exportPDF handler and optional outputType (defaults to dataurlstring)
    return;
    */

    if (isChrome()) {
      // Chrome will open an extra window if we follow the approach below
      svgCanvas.exportPDF();
    } else {
      const exportWindow = window.open(
        'data:text/html;charset=utf-8,' + encodeURIComponent('<title>' + str + '</title><h1>' + str + '</h1>'),
        'svg-edit-exportWindow'
      );
      svgCanvas.exportPDF(exportWindow && exportWindow.name);
    }
  });
}

const frameBase = 'https://raw.githack.com/SVG-Edit/svgedit/master';
// const frameBase = 'http://localhost:8001';
const framePath = '/editor/xdomain-svg-editor-es.html?extensions=ext-xdomain-messaging.js';
const iframe = $('<iframe width="900px" height="600px" id="svgedit"></iframe>');
iframe[0].src = frameBase + framePath +
  (location.href.includes('?')
    // ? location.href.replace(/\?(?<search>.*)$/, '&$<search>')
    ? location.href.replace(/\?(.*)$/, '&$1')
    : ''); // Append arguments to this file onto the iframe

iframe[0].addEventListener('load', function () {
  svgCanvas = new EmbeddedSVGEdit(frame, [new URL(frameBase).origin]);
  // Hide main button, as we will be controlling new, load, save, etc. from the host document
  let doc;
  try {
    doc = frame.contentDocument || frame.contentWindow.document;
  } catch (err) {
    console.log('Blocked from accessing document', err); // eslint-disable-line no-console
  }
  if (doc) {
    // Todo: Provide a way to get this to occur by `postMessage`
    const mainButton = doc.getElementById('main_button');
    mainButton.style.display = 'none';
  }

  // Add event handlers now that `svgCanvas` is ready
  $('#load').click(loadSvg);
  $('#save').click(saveSvg);
  $('#exportPNG').click(exportPNG);
  $('#exportPDF').click(exportPDF);
});
$('body').append(iframe);
const frame = document.getElementById('svgedit');
