/*
 * ext-grid.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Redou Mine
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension("view_grid", function(s) {

    var svgdoc = document.getElementById("svgcanvas").ownerDocument,
			svgns = "http://www.w3.org/2000/svg",
			dims = svgEditor.curConfig.dimensions,
			svgroot = s.svgroot;

	var showGrid = false;
    var assignAttributes = svgCanvas.assignAttributes;
    
    var hcanvas = document.createElement('canvas');
    $(hcanvas).hide().appendTo('body');

    var canvasgrid = svgdoc.createElementNS(svgns, "svg");
    assignAttributes(canvasgrid, {
        'id': 'canvasGrid',
        'width': '100%',
        'height': '100%',
        'x': 0,
        'y': 0,
        'overflow': 'visible',
        'display': 'none'
    });
    
    var canvBG = $('#canvasBackground');
    canvBG.append(canvasgrid);

        // grid-pattern
        var gridPattern = svgdoc.createElementNS(svgns, "pattern");
        assignAttributes(gridPattern, {
            'id': 'gridpattern',
            'patternUnits': 'userSpaceOnUse',
            'x': 0, //-(value.strokeWidth / 2), // position for strokewidth
            'y': 0, //-(value.strokeWidth / 2), // position for strokewidth
            'width': 100,
            'height': 100
        });
        
        var gridimg = svgdoc.createElementNS(svgns, "image");
        assignAttributes(gridimg, {
            'x': 0,
            'y': 0,
            'width': 100,
            'height': 100
        });
        
        gridPattern.appendChild(gridimg);
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
            'fill': 'url(#gridpattern)',
            'style': 'pointer-events: none; display:visible;'
        });
        $('#canvasGrid').append(gridBox);
//     });

	function updateGrid(zoom) {
		// TODO: Try this with <line> elements, then compare performance difference
	
		var bgwidth = +canvBG.attr('width');
		var bgheight = +canvBG.attr('height');
		
		var units = svgCanvas.getUnits();
		var unit = units[svgEditor.curConfig.baseUnit]; // 1 = 1px
		var r_intervals = [.01, .1, 1, 10, 100, 1000];
	
		var d = 0;
		var is_x = (d === 0);
		var dim = is_x ? 'x' : 'y';
		var lentype = is_x?'width':'height';
		var c_elem = svgCanvas.getContentElem();
		var content_d = c_elem.getAttribute(dim)-0;
		
		var hcanv = hcanvas;
		
		var u_multi = unit * zoom;
		
		// Calculate the main number interval
		var raw_m = 100 / u_multi;
		var multi = 1;
		for(var i = 0; i < r_intervals.length; i++) {
			var num = r_intervals[i];
			multi = num;
			if(raw_m <= num) {
				break;
			}
		}
		
		var big_int = multi * u_multi;

		// Set the canvas size to the width of the container
		hcanv.width = big_int;
		hcanv.height = big_int;
		var ctx = hcanv.getContext("2d");

		var ruler_d = 0; 
		var cur_d = .5;
		
		var part = big_int / 10;

		ctx.globalAlpha = 0.2;
		ctx.strokeStyle = "#000";
		for(var i = 1; i < 10; i++) {
			var sub_d = Math.round(part * i) + .5;
// 					var line_num = (i % 2)?12:10;
			var line_num = 0;
			ctx.moveTo(sub_d, big_int);
			ctx.lineTo(sub_d, line_num);
			ctx.moveTo(big_int, sub_d);
			ctx.lineTo(line_num ,sub_d);
		}
		ctx.stroke();
		ctx.beginPath();  
		ctx.globalAlpha = 0.5;
		ctx.moveTo(cur_d, big_int);
		ctx.lineTo(cur_d, 0);

		ctx.moveTo(big_int, cur_d);
		ctx.lineTo(0, cur_d);
		ctx.stroke();

		var datauri = hcanv.toDataURL('image/png');
		gridimg.setAttribute('width', big_int);
		gridimg.setAttribute('height', big_int);
		gridimg.parentNode.setAttribute('width', big_int);
		gridimg.parentNode.setAttribute('height', big_int);
		svgCanvas.setHref(gridimg, datauri);
	}

    return {
        name: "view_grid",
        svgicons: "extensions/grid-icon.xml",

        zoomChanged: function(zoom) {
            // update size
            if(showGrid) updateGrid(zoom);
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
                        svgEditor.curConfig.showGrid = showGrid = true;
                        $('#view_grid').addClass('push_button_pressed').removeClass('tool_button');
                        $('#canvasGrid').attr('display', 'normal');
                        updateGrid(svgCanvas.getZoom());
                    }
                    else {
                        svgEditor.curConfig.showGrid = showGrid = false;
                        $('#view_grid').removeClass('push_button_pressed').addClass('tool_button');
                        $('#canvasGrid').attr('display', 'none');
                    }
                }
            }
}]
        };
    });
