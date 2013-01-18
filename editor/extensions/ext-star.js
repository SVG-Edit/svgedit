/*
 * ext-star.js
 *
 *
 * Copyright(c) 2010 CloudCanvas, Inc.
 * All rights reserved
 *
 */

svgEditor.addExtension("star", function(S){

    var svgcontent = S.svgcontent, addElem = S.addSvgElementFromJson, selElems, svgns = "http://www.w3.org/2000/svg", xlinkns = "http://www.w3.org/1999/xlink", xmlns = "http://www.w3.org/XML/1998/namespace", xmlnsns = "http://www.w3.org/2000/xmlns/", se_ns = "http://svg-edit.googlecode.com", htmlns = "http://www.w3.org/1999/xhtml", editingitex = false, svgdoc = S.svgroot.parentNode.ownerDocument, started, newFO, edg = 0, newFOG, newFOGParent, newDef, newImageName, newMaskID, undoCommand = "Not image", modeChangeG;
    
    var ccZoom;
    var wEl, hEl;
    var wOffset, hOffset;
    var ccRBG, ccRgbEl;
    var ccOpacity;
    var brushW, brushH, shape;
    
    var ccDebug = document.getElementById('debugpanel');
    
    function showPanel(on){
        var fc_rules = $('#fc_rules');
        if (!fc_rules.length) {
            fc_rules = $('<style id="fc_rules"><\/style>').appendTo('head');
        }
        fc_rules.text(!on ? "" : " #tool_topath { display: none !important; }");
        $('#star_panel').toggle(on);
    }
    
    function toggleSourceButtons(on){
        $('#star_save, #star_cancel').toggle(on);
    }
    
    function setAttr(attr, val){
        svgCanvas.changeSelectedAttribute(attr, val);
        S.call("changed", selElems);
    }
    
    function cot(n){
        return 1 / Math.tan(n);
    };
    
    function sec(n){
        return 1 / Math.cos(n);
    };
    
    return {
        name: "star",
        svgicons: "extensions/star-icons.svg",
        buttons: [{
            id: "tool_star",
            type: "mode",
            title: "Star Tool",
            position: 12,
            events: {
                'click': function(){
					showPanel(true);
                    svgCanvas.setMode('star')
                }
            }
        }],
        
        context_tools: [{
            type: "input",
            panel: "star_panel",
            title: "Number of Sides",
            id: "starNumPoints",
            label: "points",
            size: 3,
            defval: 5,
            events: {
                change: function(){
                    setAttr('point', this.value);
                }
            }
        }, {
            type: "input",
            panel: "star_panel",
            title: "Pointiness",
            id: "starRadiusMulitplier",
            label: "Pointiness",
            size: 3,
            defval: 2.5
        }, {
            type: "input",
            panel: "star_panel",
            title: "Twists the star",
            id: "radialShift",
            label: "Radial Shift",
            size: 3,
            defval: 0,
            events: {
                change: function(){
                    setAttr('radialshift', this.value);
                }
            }
        }],
        
        callback: function(){
            $('#star_panel').hide();
            
            var endChanges = function(){
            }
            
            
        },
        mouseDown: function(opts){
            var e = opts.event;
            rgb = svgCanvas.getColor("fill");
            ccRgbEl = rgb.substring(1, rgb.length);
            sRgb = svgCanvas.getColor("stroke");
            ccSRgbEl = sRgb.substring(1, rgb.length);
            sRgb = svgCanvas.getColor("stroke");
            sWidth = svgCanvas.getStrokeWidth();
            
            if (svgCanvas.getMode() == "star") {
                started = true;
                
                newFO = S.addSvgElementFromJson({
                    "element": "polygon",
                    "attr": {
                        "cx": opts.start_x,
                        "cy": opts.start_y,
                        "id": S.getNextId(),
                        "shape": "star",
                        "point": document.getElementById('starNumPoints').value,
                        "r": 0,
                        "radialshift": document.getElementById('radialShift').value,
                        "r2": 0,
                        "orient": "point",
                        "fill": rgb,
                        "strokecolor": sRgb,
                        "strokeWidth": sWidth
                    }
                });
                
                return {
                    started: true
                }
            }
        },
        mouseMove: function(opts){
            if (!started) 
                return;
            if (svgCanvas.getMode() == "star") {
                var e = opts.event;
                var x = opts.mouse_x;
                var y = opts.mouse_y;
                var c = $(newFO).attr(["cx", "cy", "point", "orient", "fill", "strokecolor", "strokeWidth", "radialshift"]);
                
                var cx = c.cx, cy = c.cy, fill = c.fill, strokecolor = c.strokecolor, strokewidth = c.strokeWidth, radialShift = c.radialshift, point = c.point, orient = c.orient, circumradius = (Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))) / 1.5, inradius = circumradius / document.getElementById('starRadiusMulitplier').value;
                newFO.setAttributeNS(null, "r", circumradius);
                newFO.setAttributeNS(null, "r2", inradius);
                
                
                var polyPoints = '';
                for (var s = 0; point >= s; s++) {
                    var angle = 2.0 * Math.PI * (s / point);
                    if ('point' == orient) {
                        angle -= (Math.PI / 2);
                    }
                    else 
                        if ('edge' == orient) {
                            angle = (angle + (Math.PI / point)) - (Math.PI / 2);
                        }
                    
                    
                    var x = (circumradius * Math.cos(angle)) + cx;
                    var y = (circumradius * Math.sin(angle)) + cy;
                    
                    polyPoints += x + ',' + y + ' ';
                    
                    if (null != inradius) {
                        var angle = (2.0 * Math.PI * (s / point)) + (Math.PI / point);
                        if ('point' == orient) {
                            angle -= (Math.PI / 2);
                        }
                        else 
                            if ('edge' == orient) {
                                angle = (angle + (Math.PI / point)) - (Math.PI / 2);
                            }
                        angle += radialShift;
                        
                        var x = (inradius * Math.cos(angle)) + cx;
                        var y = (inradius * Math.sin(angle)) + cy;
                        
                        polyPoints += x + ',' + y + ' ';
                    }
                    
                }
                newFO.setAttributeNS(null, 'points', polyPoints);
                newFO.setAttributeNS(null, 'fill', fill);
                newFO.setAttributeNS(null, 'stroke', strokecolor);
                newFO.setAttributeNS(null, 'stroke-width', strokewidth);
                shape = newFO.getAttributeNS(null, 'shape');
                
                return {
                    started: true
                }
            }
            
        },
        
        mouseUp: function(opts){
            if (svgCanvas.getMode() == "star") {
            
                var attrs = $(newFO).attr(["r"]);
                keep = (attrs.r != 0);
               // svgCanvas.addToSelection([newFO], true);
                return {
                    keep: keep,
                    element: newFO
                }
            }
            
        },
        
        selectedChanged: function(opts){
            // Use this to update the current selected elements
            selElems = opts.elems;
            
            var i = selElems.length;
            
            while (i--) {
                var elem = selElems[i];
                if (elem && elem.getAttributeNS(null, 'shape') == "star") {
                    if (opts.selectedElement && !opts.multiselected) {
                        // $('#starRadiusMulitplier').val(elem.getAttribute("r2"));
                        $('#starNumPoints').val(elem.getAttribute("point"));
                        $('#radialShift').val(elem.getAttribute("radialshift"));
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
            var elem = opts.elems[0];
        }
    };
});
