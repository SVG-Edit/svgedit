/**
 * Package: svgedit.path
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2011 Alexis Deveria
 * Copyright(c) 2011 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) math.js
// 4) svgutils.js

var svgedit = svgedit || {};

(function() {

if (!svgedit.path) {
	svgedit.path = {};
}

var svgns = "http://www.w3.org/2000/svg";

var uiStrings = {
	"pathNodeTooltip": "Drag node to move it. Double-click node to change segment type",
	"pathCtrlPtTooltip": "Drag control point to adjust curve properties"
};

var segData = {
	2: ['x','y'],
	4: ['x','y'],
	6: ['x','y','x1','y1','x2','y2'],
	8: ['x','y','x1','y1'],
	10: ['x','y','r1','r2','angle','largeArcFlag','sweepFlag'],
	12: ['x'],
	14: ['y'],
	16: ['x','y','x2','y2'],
	18: ['x','y']
};

var pathFuncs = [];

svgedit.path.path = null;

var editorContext_ = null;

svgedit.path.init = function(editorContext) {
	editorContext_ = editorContext;
	
	pathFuncs = [0,'ClosePath'];
	var pathFuncsStrs = ['Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc',
		'LinetoHorizontal', 'LinetoVertical','CurvetoCubicSmooth','CurvetoQuadraticSmooth'];
	$.each(pathFuncsStrs, function(i,s) {
		pathFuncs.push(s+'Abs');
		pathFuncs.push(s+'Rel');
	});
};

svgedit.path.insertItemBefore = function(elem, newseg, index) {
	// Support insertItemBefore on paths for FF2
	var list = elem.pathSegList;

	if(svgedit.browser.supportsPathInsertItemBefore()) {
		list.insertItemBefore(newseg, index);
		return;
	}
	var len = list.numberOfItems;
	var arr = [];
	for(var i=0; i<len; i++) {
		var cur_seg = list.getItem(i);
		arr.push(cur_seg)				
	}
	list.clear();
	for(var i=0; i<len; i++) {
		if(i == index) { //index+1
			list.appendItem(newseg);
		}
		list.appendItem(arr[i]);
	}
};

// TODO: See if this should just live in replacePathSeg
svgedit.path.ptObjToArr = function(type, seg_item) {
	var arr = segData[type], len = arr.length;
	var out = Array(len);
	for(var i=0; i<len; i++) {
		out[i] = seg_item[arr[i]];
	}
	return out;
};

svgedit.path.getGripPt = function(seg, alt_pt) {
	var out = {
		x: alt_pt? alt_pt.x : seg.item.x,
		y: alt_pt? alt_pt.y : seg.item.y
	}, path = seg.path;

	if(path.matrix) {
		var pt = svgedit.math.transformPoint(out.x, out.y, path.matrix);
		out = pt;
	}

	out.x *= editorContext_.currentZoom();
	out.y *= editorContext_.currentZoom();

	return out;
};

svgedit.path.getPointFromGrip = function(pt, path) {
	var out = {
		x: pt.x,
		y: pt.y
	}

	if(path.matrix) {
		var pt = svgedit.math.transformPoint(out.x, out.y, path.imatrix);
		out.x = pt.x;
		out.y = pt.y;
	}

	out.x /= editorContext_.currentZoom();
	out.y /= editorContext_.currentZoom();

	return out;
};

svgedit.path.addPointGrip = function(index, x, y) {
	// create the container of all the point grips
	var pointGripContainer = svgedit.path.getGripContainer();

	var pointGrip = svgedit.utilities.getElem("pathpointgrip_"+index);
	// create it
	if (!pointGrip) {
		pointGrip = document.createElementNS(svgns, "circle");
		svgedit.utilities.assignAttributes(pointGrip, {
			'id': "pathpointgrip_" + index,
			'display': "none",
			'r': 4,
			'fill': "#0FF",
			'stroke': "#00F",
			'stroke-width': 2,
			'cursor': 'move',
			'style': 'pointer-events:all',
			'xlink:title': uiStrings.pathNodeTooltip
		});
		pointGrip = pointGripContainer.appendChild(pointGrip);

		var grip = $('#pathpointgrip_'+index);
		grip.dblclick(function() {
			if(svgedit.path.path) svgedit.path.path.setSegType();
		});
	}
	if(x && y) {
		// set up the point grip element and display it
		svgedit.utilities.assignAttributes(pointGrip, {
			'cx': x,
			'cy': y,
			'display': "inline"
		});
	}
	return pointGrip;
};

svgedit.path.getGripContainer = function() {
	var c = svgedit.utilities.getElem("pathpointgrip_container");
	if (!c) {
		var parent = svgedit.utilities.getElem("selectorParentGroup");
		c = parent.appendChild(document.createElementNS(svgns, "g"));
		c.id = "pathpointgrip_container";
	}
	return c;
};

svgedit.path.addCtrlGrip = function(id) {
	var pointGrip = svgedit.utilities.getElem("ctrlpointgrip_"+id);
	if(pointGrip) return pointGrip;
		
	pointGrip = document.createElementNS(svgns, "circle");
	svgedit.utilities.assignAttributes(pointGrip, {
		'id': "ctrlpointgrip_" + id,
		'display': "none",
		'r': 4,
		'fill': "#0FF",
		'stroke': "#55F",
		'stroke-width': 1,
		'cursor': 'move',
		'style': 'pointer-events:all',
		'xlink:title': uiStrings.pathCtrlPtTooltip
	});
	svgedit.path.getGripContainer().appendChild(pointGrip);
	return pointGrip;
};

svgedit.path.getCtrlLine = function(id) {
	var ctrlLine = svgedit.utilities.getElem("ctrlLine_"+id);
	if(ctrlLine) return ctrlLine;

	ctrlLine = document.createElementNS(svgns, "line");
	svgedit.utilities.assignAttributes(ctrlLine, {
		'id': "ctrlLine_"+id,
		'stroke': "#555",
		'stroke-width': 1,
		"style": "pointer-events:none"
	});
	svgedit.path.getGripContainer().appendChild(ctrlLine);
	return ctrlLine;
};

svgedit.path.getPointGrip = function(seg, update) {
	var index = seg.index;
	var pointGrip = svgedit.path.addPointGrip(index);

	if(update) {
		var pt = svgedit.path.getGripPt(seg);
		svgedit.utilities.assignAttributes(pointGrip, {
			'cx': pt.x,
			'cy': pt.y,
			'display': "inline"
		});
	}

	return pointGrip;
};

svgedit.path.getControlPoints = function(seg) {
	var item = seg.item;
	var index = seg.index;
	if(!("x1" in item) || !("x2" in item)) return null;
	var cpt = {};			
	var pointGripContainer = svgedit.path.getGripContainer();

	// Note that this is intentionally not seg.prev.item
	var prev = svgedit.path.path.segs[index-1].item;

	var seg_items = [prev, item];

	for(var i=1; i<3; i++) {
		var id = index + 'c' + i;

		var ctrlLine = cpt['c' + i + '_line'] = svgedit.path.getCtrlLine(id);

		var pt = svgedit.path.getGripPt(seg, {x:item['x' + i], y:item['y' + i]});
		var gpt = svgedit.path.getGripPt(seg, {x:seg_items[i-1].x, y:seg_items[i-1].y});

		svgedit.utilities.assignAttributes(ctrlLine, {
			'x1': pt.x,
			'y1': pt.y,
			'x2': gpt.x,
			'y2': gpt.y,
			'display': "inline"
		});

		cpt['c' + i + '_line'] = ctrlLine;

		// create it
		pointGrip = cpt['c' + i] = svgedit.path.addCtrlGrip(id);

		svgedit.utilities.assignAttributes(pointGrip, {
			'cx': pt.x,
			'cy': pt.y,
			'display': "inline"
		});
		cpt['c' + i] = pointGrip;
	}
	return cpt;
};

// This replaces the segment at the given index. Type is given as number.
svgedit.path.replacePathSeg = function(type, index, pts, elem) {
	var path = elem || svgedit.path.path.elem;
	var func = 'createSVGPathSeg' + pathFuncs[type];
	var seg = path[func].apply(path, pts);

	if(svgedit.browser.supportsPathReplaceItem()) {
		path.pathSegList.replaceItem(seg, index);
	} else {
		var segList = path.pathSegList;
		var len = segList.numberOfItems;
		var arr = [];
		for(var i=0; i<len; i++) {
			var cur_seg = segList.getItem(i);
			arr.push(cur_seg)				
		}
		segList.clear();
		for(var i=0; i<len; i++) {
			if(i == index) {
				segList.appendItem(seg);
			} else {
				segList.appendItem(arr[i]);
			}
		}
	}
};

svgedit.path.getSegSelector = function(seg, update) {
	var index = seg.index;
	var segLine = svgedit.utilities.getElem("segline_" + index);
	if(!segLine) {
		var pointGripContainer = svgedit.path.getGripContainer();
		// create segline
		segLine = document.createElementNS(svgns, "path");
		svgedit.utilities.assignAttributes(segLine, {
			'id': "segline_" + index,
			'display': 'none',
			'fill': "none",
			'stroke': "#0FF",
			'stroke-width': 2,
			'style':'pointer-events:none',
			'd': 'M0,0 0,0'
		});
		pointGripContainer.appendChild(segLine);
	} 

	if(update) {
		var prev = seg.prev;
		if(!prev) {
			segLine.setAttribute("display", "none");
			return segLine;
		}

		var pt = svgedit.path.getGripPt(prev);
		// Set start point
		svgedit.path.replacePathSeg(2, 0, [pt.x, pt.y], segLine);

		var pts = svgedit.path.ptObjToArr(seg.type, seg.item, true);
		for(var i=0; i < pts.length; i+=2) {
			var pt = svgedit.path.getGripPt(seg, {x:pts[i], y:pts[i+1]});
			pts[i] = pt.x;
			pts[i+1] = pt.y;
		}

		svgedit.path.replacePathSeg(seg.type, 1, pts, segLine);
	}
	return segLine;
};

svgedit.path.Segment = function(index, item) {
	this.selected = false;
	this.index = index;
	this.item = item;
	this.type = item.pathSegType;
	
	this.ctrlpts = [];
	this.ptgrip = null;
	this.segsel = null;
};

svgedit.path.Segment.prototype.showCtrlPts = function(y) {
	for (var i in this.ctrlpts) {
		this.ctrlpts[i].setAttribute("display", y ? "inline" : "none");
	}
};

svgedit.path.Segment.prototype.selectCtrls = function(y) {
	$('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2').
		attr('fill', y ? '#0FF' : '#EEE');
};

svgedit.path.Segment.prototype.show = function(y) {
	if(this.ptgrip) {
		this.ptgrip.setAttribute("display", y ? "inline" : "none");
		this.segsel.setAttribute("display", y ? "inline" : "none");
		// Show/hide all control points if available
		this.showCtrlPts(y);
	}
};

svgedit.path.Segment.prototype.select = function(y) {
	if(this.ptgrip) {
		this.ptgrip.setAttribute("stroke", y ? "#0FF" : "#00F");
		this.segsel.setAttribute("display", y ? "inline" : "none");
		if(this.ctrlpts) {
			this.selectCtrls(y);
		}
		this.selected = y;
	}
};

svgedit.path.Segment.prototype.addGrip = function() {
	this.ptgrip = svgedit.path.getPointGrip(this, true);
	this.ctrlpts = svgedit.path.getControlPoints(this, true);
	this.segsel = svgedit.path.getSegSelector(this, true);
};

svgedit.path.Segment.prototype.update = function(full) {
	if(this.ptgrip) {
		var pt = svgedit.path.getGripPt(this);
		svgedit.utilities.assignAttributes(this.ptgrip, {
			'cx': pt.x,
			'cy': pt.y
		});

		svgedit.path.getSegSelector(this, true);

		if(this.ctrlpts) {
			if(full) {
				this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
				this.type = this.item.pathSegType;
			}
			svgedit.path.getControlPoints(this);
		} 
		// this.segsel.setAttribute("display", y?"inline":"none");
	}
};

svgedit.path.Segment.prototype.move = function(dx, dy) {
	var item = this.item;

	if(this.ctrlpts) {
		var cur_pts = [item.x += dx, item.y += dy, 
			item.x1, item.y1, item.x2 += dx, item.y2 += dy];
	} else {
		var cur_pts = [item.x += dx, item.y += dy];
	}
	svgedit.path.replacePathSeg(this.type, this.index, cur_pts);

	if(this.next && this.next.ctrlpts) {
		var next = this.next.item;
		var next_pts = [next.x, next.y, 
			next.x1 += dx, next.y1 += dy, next.x2, next.y2];
		svgedit.path.replacePathSeg(this.next.type, this.next.index, next_pts);
	}

	if(this.mate) {
		// The last point of a closed subpath has a "mate",
		// which is the "M" segment of the subpath
		var item = this.mate.item;
		var pts = [item.x += dx, item.y += dy];
		svgedit.path.replacePathSeg(this.mate.type, this.mate.index, pts);
		// Has no grip, so does not need "updating"?
	}

	this.update(true);
	if(this.next) this.next.update(true);
};

svgedit.path.Segment.prototype.setLinked = function(num) {
	var seg, anum, pt;
	if (num == 2) {
		anum = 1;
		seg = this.next;
		if(!seg) return;
		pt = this.item;
	} else {
		anum = 2;
		seg = this.prev;
		if(!seg) return;
		pt = seg.item;
	}

	var item = seg.item;

	item['x' + anum] = pt.x + (pt.x - this.item['x' + num]);
	item['y' + anum] = pt.y + (pt.y - this.item['y' + num]);

	var pts = [item.x, item.y,
		item.x1, item.y1,
		item.x2, item.y2];

	svgedit.path.replacePathSeg(seg.type, seg.index, pts);
	seg.update(true);
};

svgedit.path.Segment.prototype.moveCtrl = function(num, dx, dy) {
	var item = this.item;

	item['x' + num] += dx;
	item['y' + num] += dy;

	var pts = [item.x,item.y,
		item.x1,item.y1, item.x2,item.y2];

	svgedit.path.replacePathSeg(this.type, this.index, pts);
	this.update(true);
};

svgedit.path.Segment.prototype.setType = function(new_type, pts) {
	svgedit.path.replacePathSeg(new_type, this.index, pts);
	this.type = new_type;
	this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
	this.showCtrlPts(new_type === 6);
	this.ctrlpts = svgedit.path.getControlPoints(this);
	this.update(true);
};

})();
