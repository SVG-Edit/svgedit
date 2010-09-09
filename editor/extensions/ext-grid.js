/*
 * ext-grid.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Redou Mine
 *
 */

svgEditor.addExtension("view_grid", function(s) {
    /* 
    * Config for grid-lines
    */
    var gridConfig = {
        '1x1': { height: 1, width: 1, color: '#CCC', strokeWidth: 0.05, opacity: 1 },
        '5x5': { height: 5, width: 5, color: '#BBB', strokeWidth: 0.2, opacity: 1 },
        '10x10': { height: 10, width: 10, color: '#AAA', strokeWidth: 0.2, opacity: 1 },
        '100x100': { height: 100, width: 100, color: '#888', strokeWidth: 0.2, opacity: 1 }
    };

    var svgdoc = document.getElementById("svgcanvas").ownerDocument,
			svgns = "http://www.w3.org/2000/svg",
			dims = svgEditor.curConfig.dimensions,
			svgroot = s.svgroot;

    /*
    * copied from svgcanvas.js line 1138-1157 (version: 2.5 rc1)
    */
    var assignAttributes = function(node, attrs, suspendLength, unitCheck) {
        if (!suspendLength) suspendLength = 0;
        // Opera has a problem with suspendRedraw() apparently
        var handle = null;
        if (!window.opera) svgroot.suspendRedraw(suspendLength);

        for (var i in attrs) {
            var ns = (i.substr(0, 4) == "xml:" ? xmlns :
							i.substr(0, 6) == "xlink:" ? xlinkns : null);

            if (ns || !unitCheck) {
                node.setAttributeNS(ns, i, attrs[i]);
            } else {
                setUnitAttr(node, i, attrs[i]);
            }

        }

        if (!window.opera) svgroot.unsuspendRedraw(handle);
    };


    // create svg for grid
    var canvasgrid = svgdoc.createElementNS(svgns, "svg");
    assignAttributes(canvasgrid, {
        'id': 'canvasGrid',
        'width': '100%',
        'height': '100%',
        'x': 0,
        'y': 0,
        'overflow': 'visible',
        'viewBox': '0 0 ' + dims[0] + ' ' + dims[1],
        'display': 'none'
    });
    $('#canvasBackground').append(canvasgrid);

    // create each grid
    $.each(gridConfig, function(key, value) {
        // grid-pattern
        var gridPattern = svgdoc.createElementNS(svgns, "pattern");
        assignAttributes(gridPattern, {
            'id': 'gridpattern' + key,
            'patternUnits': 'userSpaceOnUse',
            'x': -(value.strokeWidth / 2), // position for strokewidth
            'y': -(value.strokeWidth / 2), // position for strokewidth
            'width': value.width,
            'height': value.height
        });
        var gridPattern_hoLine = svgdoc.createElementNS(svgns, "line");
        assignAttributes(gridPattern_hoLine, {
            'fill': 'none',
            'stroke-width': value.strokeWidth,
            'x1': 0,
            'y1': 0,
            'x2': value.width,
            'y2': 0,
            'stroke': value.color
        });
        var gridPattern_veLine = svgdoc.createElementNS(svgns, "line");
        assignAttributes(gridPattern_veLine, {
            'fill': 'none',
            'stroke-width': value.strokeWidth,
            'x1': 0,
            'y1': 0,
            'x2': 0,
            'y2': value.height,
            'stroke': value.color
        });

        gridPattern.appendChild(gridPattern_hoLine);
        gridPattern.appendChild(gridPattern_veLine);
        $('#svgroot defs').append(gridPattern);

        // grid-box
        var gridBox = svgdoc.createElementNS(svgns, "rect");
        assignAttributes(gridBox, {
            'width': '100%',
            'height': '100%',
            'x': 0,
            'y': 0,
            'stroke-width': 0,
            'stroke': 'none',
            'fill': 'url(#gridpattern' + key + ')',
            'opacity': value.opacity,
            'style': 'pointer-events: none; display:visible;'
        });
        $('#canvasGrid').append(gridBox);
    });

    return {
        name: "view_grid",
        svgicons: "extensions/grid-icon.xml",

        zoomChanged: function(zoomlevel) {
            // update size
            var viewBox = "0 0 " + svgCanvas.contentW + " " + svgCanvas.contentH;
            $('#canvasGrid').attr("viewBox", viewBox);
        },

        buttons: [{
            id: "view_grid",
            type: "context",
            panel: "editor_panel",
            title: "Show/Hide Grid [G]",
            events: {
                'click': function() {
                    var gr = !$('#view_grid').hasClass('push_button_pressed');
                    if (gr) {
                        svgEditor.curConfig.gridSnapping = true;
                        $('#view_grid').addClass('push_button_pressed').removeClass('tool_button');
                        $('#canvasGrid').attr('display', 'normal');
                    }
                    else {
                        svgEditor.curConfig.gridSnapping = false;
                        $('#view_grid').removeClass('push_button_pressed').addClass('tool_button');
                        $('#canvasGrid').attr('display', 'none');
                    }
                }
            }
}]
        };
    });
