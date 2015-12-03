/*globals $, svgedit*/
/*jslint vars: true, eqeq: true, forin: true*/
/**
 * Package: svedit.select
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) pathseg.js
// 3) browser.js
// 4) math.js
// 5) svgutils.js

(function() {'use strict';

if (!svgedit.select) {
	svgedit.select = {};
}

var svgFactory_;
var config_;
var selectorManager_; // A Singleton
var gripRadius = svgedit.browser.isTouch() ? 10 : 4;

// Class: svgedit.select.Selector
// Private class for DOM element selection boxes
//
// Parameters:
// id - integer to internally indentify the selector
// elem - DOM element associated with this selector
svgedit.select.Selector = function(id, elem) {
	// this is the selector's unique number
	this.id = id;

	// this holds a reference to the element for which this selector is being used
	this.selectedElement = elem;

	// this is a flag used internally to track whether the selector is being used or not
	this.locked = true;

	// this holds a reference to the <g> element that holds all visual elements of the selector
	this.selectorGroup = svgFactory_.createSVGElement({
		'element': 'g',
		'attr': {'id': ('selectorGroup' + this.id)}
	});

	// this holds a reference to the path rect
	this.selectorRect = this.selectorGroup.appendChild(
		svgFactory_.createSVGElement({
			'element': 'path',
			'attr': {
				'id': ('selectedBox' + this.id),
				'fill': 'none',
				'stroke': '#22C',
				'stroke-width': '1',
				'stroke-dasharray': '5,5',
				// need to specify this so that the rect is not selectable
				'style': 'pointer-events:none'
			}
		})
	);

	// this holds a reference to the grip coordinates for this selector
	this.gripCoords = {
		'nw': null,
		'n' : null,
		'ne': null,
		'e' : null,
		'se': null,
		's' : null,
		'sw': null,
		'w' : null
	};

	this.reset(this.selectedElement);
};


// Function: svgedit.select.Selector.reset
// Used to reset the id and element that the selector is attached to
//
// Parameters:
// e - DOM element associated with this selector
svgedit.select.Selector.prototype.reset = function(e) {
	this.locked = true;
	this.selectedElement = e;
	this.resize();
	this.selectorGroup.setAttribute('display', 'inline');
};


// Function: svgedit.select.Selector.updateGripCursors
// Updates cursors for corner grips on rotation so arrows point the right way
//
// Parameters:
// angle - Float indicating current rotation angle in degrees
svgedit.select.Selector.prototype.updateGripCursors = function(angle) {
	var dir,
		dir_arr = [],
		steps = Math.round(angle / 45);
	if (steps < 0) {steps += 8;}
	for (dir in selectorManager_.selectorGrips) {
		dir_arr.push(dir);
	}
	while (steps > 0) {
		dir_arr.push(dir_arr.shift());
		steps--;
	}
	var i = 0;
	for (dir in selectorManager_.selectorGrips) {
		selectorManager_.selectorGrips[dir].setAttribute('style', ('cursor:' + dir_arr[i] + '-resize'));
		i++;
	}
};

// Function: svgedit.select.Selector.showGrips
// Show the resize grips of this selector
//
// Parameters:
// show - boolean indicating whether grips should be shown or not
svgedit.select.Selector.prototype.showGrips = function(show) {
	var bShow = show ? 'inline' : 'none';
	selectorManager_.selectorGripsGroup.setAttribute('display', bShow);
	var elem = this.selectedElement;
	this.hasGrips = show;
	if (elem && show) {
		this.selectorGroup.appendChild(selectorManager_.selectorGripsGroup);
		this.updateGripCursors(svgedit.utilities.getRotationAngle(elem));
	}
};

// Function: svgedit.select.Selector.resize
// Updates the selector to match the element's size
svgedit.select.Selector.prototype.resize = function() {
	var selectedBox = this.selectorRect,
		mgr = selectorManager_,
		selectedGrips = mgr.selectorGrips,
		selected = this.selectedElement,
		sw = selected.getAttribute('stroke-width'),
		current_zoom = svgFactory_.currentZoom();
	var offset = 1/current_zoom;
	if (selected.getAttribute('stroke') !== 'none' && !isNaN(sw)) {
		offset += (sw/2);
	}

	var tagName = selected.tagName;
	if (tagName === 'text') {
		offset += 2/current_zoom;
	}

	// loop and transform our bounding box until we reach our first rotation
	var tlist = svgedit.transformlist.getTransformList(selected);
	var m = svgedit.math.transformListToTransform(tlist).matrix;

	// This should probably be handled somewhere else, but for now
	// it keeps the selection box correctly positioned when zoomed
	m.e *= current_zoom;
	m.f *= current_zoom;

	var bbox = svgedit.utilities.getBBox(selected);
	if (tagName === 'g' && !$.data(selected, 'gsvg')) {
		// The bbox for a group does not include stroke vals, so we
		// get the bbox based on its children.
		var stroked_bbox = svgFactory_.getStrokedBBox(selected.childNodes);
		if (stroked_bbox) {
			bbox = stroked_bbox;
		}
	}

	// apply the transforms
	var l = bbox.x, t = bbox.y, w = bbox.width, h = bbox.height;
	bbox = {x:l, y:t, width:w, height:h};

	// we need to handle temporary transforms too
	// if skewed, get its transformed box, then find its axis-aligned bbox

	//*
	offset *= current_zoom;

	var nbox = svgedit.math.transformBox(l*current_zoom, t*current_zoom, w*current_zoom, h*current_zoom, m),
		aabox = nbox.aabox,
		nbax = aabox.x - offset,
		nbay = aabox.y - offset,
		nbaw = aabox.width + (offset * 2),
		nbah = aabox.height + (offset * 2);

	// now if the shape is rotated, un-rotate it
	var cx = nbax + nbaw/2,
		cy = nbay + nbah/2;

	var angle = svgedit.utilities.getRotationAngle(selected);
	if (angle) {
		var rot = svgFactory_.svgRoot().createSVGTransform();
		rot.setRotate(-angle, cx, cy);
		var rotm = rot.matrix;
		nbox.tl = svgedit.math.transformPoint(nbox.tl.x, nbox.tl.y, rotm);
		nbox.tr = svgedit.math.transformPoint(nbox.tr.x, nbox.tr.y, rotm);
		nbox.bl = svgedit.math.transformPoint(nbox.bl.x, nbox.bl.y, rotm);
		nbox.br = svgedit.math.transformPoint(nbox.br.x, nbox.br.y, rotm);

		// calculate the axis-aligned bbox
		var tl = nbox.tl;
		var minx = tl.x,
			miny = tl.y,
			maxx = tl.x,
			maxy = tl.y;

		var min = Math.min, max = Math.max;

		minx = min(minx, min(nbox.tr.x, min(nbox.bl.x, nbox.br.x) ) ) - offset;
		miny = min(miny, min(nbox.tr.y, min(nbox.bl.y, nbox.br.y) ) ) - offset;
		maxx = max(maxx, max(nbox.tr.x, max(nbox.bl.x, nbox.br.x) ) ) + offset;
		maxy = max(maxy, max(nbox.tr.y, max(nbox.bl.y, nbox.br.y) ) ) + offset;

		nbax = minx;
		nbay = miny;
		nbaw = (maxx-minx);
		nbah = (maxy-miny);
	}

	var dstr = 'M' + nbax + ',' + nbay
				+ ' L' + (nbax+nbaw) + ',' + nbay
				+ ' ' + (nbax+nbaw) + ',' + (nbay+nbah)
				+ ' ' + nbax + ',' + (nbay+nbah) + 'z';
	selectedBox.setAttribute('d', dstr);

	var xform = angle ? 'rotate(' + [angle, cx, cy].join(',') + ')' : '';
	this.selectorGroup.setAttribute('transform', xform);

	// TODO(codedread): Is this if needed?
//	if (selected === selectedElements[0]) {
		this.gripCoords = {
			'nw': [nbax, nbay],
			'ne': [nbax+nbaw, nbay],
			'sw': [nbax, nbay+nbah],
			'se': [nbax+nbaw, nbay+nbah],
			'n':  [nbax + (nbaw)/2, nbay],
			'w':	[nbax, nbay + (nbah)/2],
			'e':	[nbax + nbaw, nbay + (nbah)/2],
			's':	[nbax + (nbaw)/2, nbay + nbah]
		};
		var dir;
		for (dir in this.gripCoords) {
			var coords = this.gripCoords[dir];
			selectedGrips[dir].setAttribute('cx', coords[0]);
			selectedGrips[dir].setAttribute('cy', coords[1]);
		}

		// we want to go 20 pixels in the negative transformed y direction, ignoring scale
		mgr.rotateGripConnector.setAttribute('x1', nbax + (nbaw)/2);
		mgr.rotateGripConnector.setAttribute('y1', nbay);
		mgr.rotateGripConnector.setAttribute('x2', nbax + (nbaw)/2);
		mgr.rotateGripConnector.setAttribute('y2', nbay - (gripRadius*5));

		mgr.rotateGrip.setAttribute('cx', nbax + (nbaw)/2);
		mgr.rotateGrip.setAttribute('cy', nbay - (gripRadius*5));
//	}
};


// Class: svgedit.select.SelectorManager
svgedit.select.SelectorManager = function() {
	// this will hold the <g> element that contains all selector rects/grips
	this.selectorParentGroup = null;

	// this is a special rect that is used for multi-select
	this.rubberBandBox = null;

	// this will hold objects of type svgedit.select.Selector (see above)
	this.selectors = [];

	// this holds a map of SVG elements to their Selector object
	this.selectorMap = {};

	// this holds a reference to the grip elements
	this.selectorGrips = {
		'nw': null,
		'n' :  null,
		'ne': null,
		'e' :  null,
		'se': null,
		's' :  null,
		'sw': null,
		'w' :  null
	};

	this.selectorGripsGroup = null;
	this.rotateGripConnector = null;
	this.rotateGrip = null;

	this.initGroup();
};

// Function: svgedit.select.SelectorManager.initGroup
// Resets the parent selector group element
svgedit.select.SelectorManager.prototype.initGroup = function() {
	// remove old selector parent group if it existed
	if (this.selectorParentGroup && this.selectorParentGroup.parentNode) {
		this.selectorParentGroup.parentNode.removeChild(this.selectorParentGroup);
	}

	// create parent selector group and add it to svgroot
	this.selectorParentGroup = svgFactory_.createSVGElement({
		'element': 'g',
		'attr': {'id': 'selectorParentGroup'}
	});
	this.selectorGripsGroup = svgFactory_.createSVGElement({
		'element': 'g',
		'attr': {'display': 'none'}
	});
	this.selectorParentGroup.appendChild(this.selectorGripsGroup);
	svgFactory_.svgRoot().appendChild(this.selectorParentGroup);

	this.selectorMap = {};
	this.selectors = [];
	this.rubberBandBox = null;

	// add the corner grips
	var dir;
	for (dir in this.selectorGrips) {
		var grip = svgFactory_.createSVGElement({
			'element': 'circle',
			'attr': {
				'id': ('selectorGrip_resize_' + dir),
				'fill': '#22C',
				'r': gripRadius,
				'style': ('cursor:' + dir + '-resize'),
				// This expands the mouse-able area of the grips making them
				// easier to grab with the mouse.
				// This works in Opera and WebKit, but does not work in Firefox
				// see https://bugzilla.mozilla.org/show_bug.cgi?id=500174
				'stroke-width': 2,
				'pointer-events': 'all'
			}
		});

		$.data(grip, 'dir', dir);
		$.data(grip, 'type', 'resize');
		this.selectorGrips[dir] = this.selectorGripsGroup.appendChild(grip);
	}

	// add rotator elems
	this.rotateGripConnector = this.selectorGripsGroup.appendChild(
		svgFactory_.createSVGElement({
			'element': 'line',
			'attr': {
				'id': ('selectorGrip_rotateconnector'),
				'stroke': '#22C',
				'stroke-width': '1'
			}
		})
	);

	this.rotateGrip = this.selectorGripsGroup.appendChild(
		svgFactory_.createSVGElement({
			'element': 'circle',
			'attr': {
				'id': 'selectorGrip_rotate',
				'fill': 'lime',
				'r': gripRadius,
				'stroke': '#22C',
				'stroke-width': 2,
				'style': 'cursor:url(' + config_.imgPath + 'rotate.png) 12 12, auto;'
			}
		})
	);
	$.data(this.rotateGrip, 'type', 'rotate');

	if ($('#canvasBackground').length) {return;}

	var dims = config_.dimensions;
	var canvasbg = svgFactory_.createSVGElement({
		'element': 'svg',
		'attr': {
			'id': 'canvasBackground',
			'width': dims[0],
			'height': dims[1],
			'x': 0,
			'y': 0,
			'overflow': (svgedit.browser.isWebkit() ? 'none' : 'visible'), // Chrome 7 has a problem with this when zooming out
			'style': 'pointer-events:none'
		}
	});

	var rect = svgFactory_.createSVGElement({
		'element': 'rect',
		'attr': {
			'width': '100%',
			'height': '100%',
			'x': 0,
			'y': 0,
			'stroke-width': 1,
			'stroke': '#000',
			'fill': '#FFF',
			'style': 'pointer-events:none'
		}
	});

	// Both Firefox and WebKit are too slow with this filter region (especially at higher
	// zoom levels) and Opera has at least one bug
//	if (!svgedit.browser.isOpera()) rect.setAttribute('filter', 'url(#canvashadow)');
	canvasbg.appendChild(rect);
	svgFactory_.svgRoot().insertBefore(canvasbg, svgFactory_.svgContent());
};

// Function: svgedit.select.SelectorManager.requestSelector
// Returns the selector based on the given element
//
// Parameters:
// elem - DOM element to get the selector for
svgedit.select.SelectorManager.prototype.requestSelector = function(elem) {
	if (elem == null) {return null;}
	var i,
		N = this.selectors.length;
	// If we've already acquired one for this element, return it.
	if (typeof(this.selectorMap[elem.id]) == 'object') {
		this.selectorMap[elem.id].locked = true;
		return this.selectorMap[elem.id];
	}
	for (i = 0; i < N; ++i) {
		if (this.selectors[i] && !this.selectors[i].locked) {
			this.selectors[i].locked = true;
			this.selectors[i].reset(elem);
			this.selectorMap[elem.id] = this.selectors[i];
			return this.selectors[i];
		}
	}
	// if we reached here, no available selectors were found, we create one
	this.selectors[N] = new svgedit.select.Selector(N, elem);
	this.selectorParentGroup.appendChild(this.selectors[N].selectorGroup);
	this.selectorMap[elem.id] = this.selectors[N];
	return this.selectors[N];
};

// Function: svgedit.select.SelectorManager.releaseSelector
// Removes the selector of the given element (hides selection box)
//
// Parameters:
// elem - DOM element to remove the selector for
svgedit.select.SelectorManager.prototype.releaseSelector = function(elem) {
	if (elem == null) {return;}
	var i,
		N = this.selectors.length,
		sel = this.selectorMap[elem.id];
	if (!sel.locked) {
		// TODO(codedread): Ensure this exists in this module.
		console.log('WARNING! selector was released but was already unlocked');
	}
	for (i = 0; i < N; ++i) {
		if (this.selectors[i] && this.selectors[i] == sel) {
			delete this.selectorMap[elem.id];
			sel.locked = false;
			sel.selectedElement = null;
			sel.showGrips(false);

			// remove from DOM and store reference in JS but only if it exists in the DOM
			try {
				sel.selectorGroup.setAttribute('display', 'none');
			} catch(e) { }

			break;
		}
	}
};

// Function: svgedit.select.SelectorManager.getRubberBandBox
// Returns the rubberBandBox DOM element. This is the rectangle drawn by the user for selecting/zooming
svgedit.select.SelectorManager.prototype.getRubberBandBox = function() {
	if (!this.rubberBandBox) {
		this.rubberBandBox = this.selectorParentGroup.appendChild(
			svgFactory_.createSVGElement({
				'element': 'rect',
				'attr': {
					'id': 'selectorRubberBand',
					'fill': '#22C',
					'fill-opacity': 0.15,
					'stroke': '#22C',
					'stroke-width': 0.5,
					'display': 'none',
					'style': 'pointer-events:none'
				}
			})
		);
	}
	return this.rubberBandBox;
};


/**
 * Interface: svgedit.select.SVGFactory
 * An object that creates SVG elements for the canvas.
 *
 * interface svgedit.select.SVGFactory {
 *   SVGElement createSVGElement(jsonMap);
 *   SVGSVGElement svgRoot();
 *   SVGSVGElement svgContent();
 *
 *   Number currentZoom();
 *   Object getStrokedBBox(Element[]); // TODO(codedread): Remove when getStrokedBBox() has been put into svgutils.js
 * }
 */

/**
 * Function: svgedit.select.init()
 * Initializes this module.
 *
 * Parameters:
 * config - an object containing configurable parameters (imgPath)
 * svgFactory - an object implementing the SVGFactory interface (see above).
 */
svgedit.select.init = function(config, svgFactory) {
	config_ = config;
	svgFactory_ = svgFactory;
	selectorManager_ = new svgedit.select.SelectorManager();
};

/**
 * Function: svgedit.select.getSelectorManager
 *
 * Returns:
 * The SelectorManager instance.
 */
svgedit.select.getSelectorManager = function() {
	return selectorManager_;
};

}());