/*globals svgEditor, svgCanvas, svgedit, $*/
/*jslint vars: true, eqeq: true, todo: true */
/*
 * ext-polygon.js
 *
 *
 * Copyright(c) 2010 CloudCanvas, Inc.
 * All rights reserved
 *
 */
svgEditor.addExtension("polygon", function(S) {'use strict';

    var // NS = svgedit.NS,
		// svgcontent = S.svgcontent,
		// addElem = S.addSvgElementFromJson,
		selElems,
		editingitex = false,
		// svgdoc = S.svgroot.parentNode.ownerDocument,
		// newFOG, newFOGParent, newDef, newImageName, newMaskID, modeChangeG,
		// edg = 0,
		// undoCommand = "Not image";
		started, newFO;
    
    // var ccZoom;
    // var wEl, hEl;
    // var wOffset, hOffset;
    // var ccRBG;
	var ccRgbEl;
    // var ccOpacity;
    // var brushW, brushH;
	var shape;
    
    // var ccDebug = document.getElementById('debugpanel');
    
    /* var properlySourceSizeTextArea = function(){
     // TODO: remove magic numbers here and get values from CSS
     var height = $('#svg_source_container').height() - 80;
     $('#svg_source_textarea').css('height', height);
     }; */
    function showPanel(on){
        var fc_rules = $('#fc_rules');
        if (!fc_rules.length) {
            fc_rules = $('<style id="fc_rules"><\/style>').appendTo('head');
        }
        fc_rules.text(!on ? "" : " #tool_topath { display: none !important; }");
        $('#polygon_panel').toggle(on);
    }
    
	/*
    function toggleSourceButtons(on){
        $('#tool_source_save, #tool_source_cancel').toggle(!on);
        $('#polygon_save, #polygon_cancel').toggle(on);
    }
	*/
    
    function setAttr(attr, val){
        svgCanvas.changeSelectedAttribute(attr, val);
        S.call("changed", selElems);
    }
    
    function cot(n){
        return 1 / Math.tan(n);
    }
    
    function sec(n){
        return 1 / Math.cos(n);
    }

	/**
	* Obtained from http://code.google.com/p/passenger-top/source/browse/instiki/public/svg-edit/editor/extensions/ext-itex.js?r=3
	* This function sets the content of of the currently-selected foreignObject element,
	*   based on the itex contained in string.
	* @param {string} tex The itex text.
	* @returns This function returns false if the set was unsuccessful, true otherwise.
	*/
	/*
	function setItexString(tex) {
		var mathns = 'http://www.w3.org/1998/Math/MathML',
			xmlnsns = 'http://www.w3.org/2000/xmlns/',
			ajaxEndpoint = '../../itex';
		var elt = selElems[0];
		try {
			var math = svgdoc.createElementNS(mathns, 'math');
			math.setAttributeNS(xmlnsns, 'xmlns', mathns);
			math.setAttribute('display', 'inline');
			var semantics = document.createElementNS(mathns, 'semantics');
			var annotation = document.createElementNS(mathns, 'annotation');
			annotation.setAttribute('encoding', 'application/x-tex');
			annotation.textContent = tex;
			var mrow = document.createElementNS(mathns, 'mrow');
			semantics.appendChild(mrow);
			semantics.appendChild(annotation);
			math.appendChild(semantics);
			// make an AJAX request to the server, to get the MathML
			$.post(ajaxEndpoint, {'tex': tex, 'display': 'inline'}, function(data){
				var children = data.documentElement.childNodes;
				while (children.length > 0) {
				     mrow.appendChild(svgdoc.adoptNode(children[0], true));
				}
				S.sanitizeSvg(math);
				S.call("changed", [elt]);
			});
			elt.replaceChild(math, elt.firstChild);
			S.call("changed", [elt]);
			svgCanvas.clearSelection();
		} catch(e) {
			console.log(e);
			return false;
		}

		return true;
	}
	*/
    return {
        name: "polygon",
        svgicons: svgEditor.curConfig.extPath + "polygon-icons.svg",
        buttons: [{
            id: "tool_polygon",
            type: "mode",
            title: "Polygon Tool",
            position: 11,
            events: {
                'click': function(){
                    svgCanvas.setMode('polygon');
					showPanel(true);
                }
            }
        }],
        
        context_tools: [{
            type: "input",
            panel: "polygon_panel",
            title: "Number of Sides",
            id: "polySides",
            label: "sides",
            size: 3,
            defval: 5,
            events: {
                change: function(){
                    setAttr('sides', this.value);
					
                }
            }
        }],
        
        callback: function(){
        
            $('#polygon_panel').hide();
            
            var endChanges = function(){
            };
            
            // TODO: Needs to be done after orig icon loads
            setTimeout(function(){
                // Create source save/cancel buttons
                var save = $('#tool_source_save').clone().hide().attr('id', 'polygon_save').unbind().appendTo("#tool_source_back").click(function(){
                
                    if (!editingitex) {
						return;
					}
					// Todo: Uncomment the setItexString() function above and handle ajaxEndpoint?
                    if (!setItexString($('#svg_source_textarea').val())) {
                        $.confirm("Errors found. Revert to original?", function(ok){
                            if (!ok) {
								return false;
							}
                            endChanges();
                        });
                    }
                    else {
                        endChanges();
                    }
                    // setSelectMode();	
                });
                
                var cancel = $('#tool_source_cancel').clone().hide().attr('id', 'polygon_cancel').unbind().appendTo("#tool_source_back").click(function(){
                    endChanges();
                });
                
            }, 3000);
        },
        mouseDown: function(opts){
            // var e = opts.event;
            var rgb = svgCanvas.getColor("fill");
            ccRgbEl = rgb.substring(1, rgb.length);
            var sRgb = svgCanvas.getColor("stroke");
            // ccSRgbEl = sRgb.substring(1, rgb.length);
            var sWidth = svgCanvas.getStrokeWidth();
            
            if (svgCanvas.getMode() == "polygon") {
                started = true;
                
                newFO = S.addSvgElementFromJson({
                    "element": "polygon",
                    "attr": {
                        "cx": opts.start_x,
                        "cy": opts.start_y,
                        "id": S.getNextId(),
                        "shape": "regularPoly",
                        "sides": document.getElementById("polySides").value,
                        "orient": "x",
                        "edge": 0,
                        "fill": rgb,
                        "strokecolor": sRgb,
                        "strokeWidth": sWidth
                    }
                });
                
                return {
                    started: true
                };
            }
        },
        mouseMove: function(opts){
            if (!started) {
                return;
			}
            if (svgCanvas.getMode() == "polygon") {
                // var e = opts.event;
                var x = opts.mouse_x;
                var y = opts.mouse_y;
                var c = $(newFO).attr(["cx", "cy", "sides", "orient", "fill", "strokecolor", "strokeWidth"]);
                var cx = c.cx, cy = c.cy, fill = c.fill, strokecolor = c.strokecolor, strokewidth = c.strokeWidth, sides = c.sides,
					// orient = c.orient,
					edg = (Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))) / 1.5;
                newFO.setAttributeNS(null, "edge", edg);
                
                var inradius = (edg / 2) * cot(Math.PI / sides);
                var circumradius = inradius * sec(Math.PI / sides);
                var points = '';
				var s;
                for (s = 0; sides >= s; s++) {
                    var angle = 2.0 * Math.PI * s / sides;
                    x = (circumradius * Math.cos(angle)) + cx;
                    y = (circumradius * Math.sin(angle)) + cy;
                    
                    points += x + ',' + y + ' ';
                }
                
                //var poly = newFO.createElementNS(NS.SVG, 'polygon');
                newFO.setAttributeNS(null, 'points', points);
                newFO.setAttributeNS(null, 'fill', fill);
                newFO.setAttributeNS(null, 'stroke', strokecolor);
                newFO.setAttributeNS(null, 'stroke-width', strokewidth);
				// newFO.setAttributeNS(null, 'transform', "rotate(-90)");
                shape = newFO.getAttributeNS(null, 'shape');
                //newFO.appendChild(poly);
                //DrawPoly(cx, cy, sides, edg, orient);
                return {
                    started: true
                };
            }
            
        },
        
        mouseUp: function(opts){
            if (svgCanvas.getMode() == "polygon") {
                var attrs = $(newFO).attr("edge");
                var keep = (attrs.edge != 0);
               // svgCanvas.addToSelection([newFO], true);
                return {
                    keep: keep,
                    element: newFO
                };
            }
            
        },
        selectedChanged: function(opts){
            // Use this to update the current selected elements
            selElems = opts.elems;
            
            var i = selElems.length;
            
            while (i--) {
                var elem = selElems[i];
                if (elem && elem.getAttributeNS(null, 'shape') === 'regularPoly') {
                    if (opts.selectedElement && !opts.multiselected) {
                        $('#polySides').val(elem.getAttribute("sides"));
                        
                        showPanel(true);
                    }
                    else {
                        showPanel(false);
                    }
                }
                else {
                    showPanel(false);
                }
            }
        },
        elementChanged: function(opts){
            // var elem = opts.elems[0];
        }
    };
});
