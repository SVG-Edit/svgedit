/*globals $, EmbeddedSVGEdit*/
/*jslint vars: true */
var initEmbed;

// Todo: Get rid of frame.contentWindow dependencies so can be more easily adjusted to work cross-domain

$(function () {'use strict';
    
    var svgCanvas = null;
    var frame;

    initEmbed = function () {
        var doc, mainButton;
        svgCanvas = new EmbeddedSVGEdit(frame);
        // Hide main button, as we will be controlling new, load, save, etc. from the host document
        doc = frame.contentDocument || frame.contentWindow.document;
        mainButton = doc.getElementById('main_button');
        mainButton.style.display = 'none';
    };

    function handleSvgData(data, error) {
        if (error) {
            alert('error ' + error);
        } else {
            alert('Congratulations. Your SVG string is back in the host page, do with it what you will\n\n' + data);
        }
    }

    function loadSvg() {
        var svgexample = '<svg width="640" height="480" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1</title><rect stroke-width="5" stroke="#000000" fill="#FF0000" id="svg_1" height="35" width="51" y="35" x="32"/><ellipse ry="15" rx="24" stroke-width="5" stroke="#000000" fill="#0000ff" id="svg_2" cy="60" cx="66"/></g></svg>';
        svgCanvas.setSvgString(svgexample);
    }

    function saveSvg() {
        svgCanvas.getSvgString()(handleSvgData);
    }
    
    function exportPNG() {
        var str = frame.contentWindow.svgEditor.uiStrings.notification.loadingImage;

        var exportWindow = window.open(
            'data:text/html;charset=utf-8,' + encodeURIComponent('<title>' + str + '</title><h1>' + str + '</h1>'),
            'svg-edit-exportWindow'
        );
        svgCanvas.rasterExport('PNG', null, exportWindow.name);
    }
    
    function exportPDF() {
        var str = frame.contentWindow.svgEditor.uiStrings.notification.loadingImage;
        
		/**
        // If you want to handle the PDF blob yourself, do as follows
		svgCanvas.bind('exportedPDF', function (win, data) {
			alert(data.dataurlstring);
		});
		svgCanvas.exportPDF(); // Accepts two args: optionalWindowName supplied back to bound exportPDF handler and optionalOutputType (defaults to dataurlstring)
        return;
        */
		
        var exportWindow = window.open(
            'data:text/html;charset=utf-8,' + encodeURIComponent('<title>' + str + '</title><h1>' + str + '</h1>'),
            'svg-edit-exportWindow'
        );
		svgCanvas.exportPDF(exportWindow.name);
    }
    
    // Add event handlers
    $('#load').click(loadSvg);
    $('#save').click(saveSvg);
    $('#exportPNG').click(exportPNG);
    $('#exportPDF').click(exportPDF);
    $('body').append(
        $('<iframe src="svg-editor.html?extensions=ext-xdomain-messaging.js' +
            window.location.href.replace(/\?(.*)$/, '&$1') + // Append arguments to this file onto the iframe
            '" width="900px" height="600px" id="svgedit" onload="initEmbed();"></iframe>'
        )
    );
    frame = document.getElementById('svgedit');
});
