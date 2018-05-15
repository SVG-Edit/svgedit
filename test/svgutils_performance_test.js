/* eslint-env qunit */
/* globals $, svgedit */
/* eslint-disable no-var */
$(function () {
	// log function
	QUnit.log = function (details) {
		if (window.console && window.console.log) {
			window.console.log(details.result + ' :: ' + details.message);
		}
	};

	var currentLayer = document.getElementById('layer1');

	function mockCreateSVGElement (jsonMap) {
		var elem = document.createElementNS(svgedit.NS.SVG, jsonMap['element']);
		for (var attr in jsonMap['attr']) {
			elem.setAttribute(attr, jsonMap['attr'][attr]);
		}
		return elem;
	}
	function mockAddSvgElementFromJson (json) {
		var elem = mockCreateSVGElement(json);
		currentLayer.appendChild(elem);
		return elem;
	}

	// var svg = document.createElementNS(svgedit.NS.SVG, 'svg');
	var groupWithMatrixTransform = document.getElementById('svg_group_with_matrix_transform');
	var textWithMatrixTransform = document.getElementById('svg_text_with_matrix_transform');

	function fillDocumentByCloningElement (elem, count) {
		var elemId = elem.getAttribute('id') + '-';
		for (var index = 0; index < count; index++) {
			var clone = elem.cloneNode(true); // t: deep clone
			// Make sure you set a unique ID like a real document.
			clone.setAttribute('id', elemId + index);
			var parent = elem.parentNode;
			parent.appendChild(clone);
		}
	}

	module('svgedit.utilities_performance', {
		setup: function () {
		},
		teardown: function () {
		}
	});

	var mockPathActions = {
		resetOrientation: function (path) {
			if (path == null || path.nodeName !== 'path') { return false; }
			var tlist = svgedit.transformlist.getTransformList(path);
			var m = svgedit.math.transformListToTransform(tlist).matrix;
			tlist.clear();
			path.removeAttribute('transform');
			var segList = path.pathSegList;

			var len = segList.numberOfItems;
			var i; // , lastX, lastY;

			for (i = 0; i < len; ++i) {
				var seg = segList.getItem(i);
				var type = seg.pathSegType;
				if (type === 1) { continue; }
				var pts = [];
				$.each(['', 1, 2], function (j, n) {
					var x = seg['x' + n], y = seg['y' + n];
					if (x !== undefined && y !== undefined) {
						var pt = svgedit.math.transformPoint(x, y, m);
						pts.splice(pts.length, 0, pt.x, pt.y);
					}
				});
				// svgedit.path.replacePathSeg(type, i, pts, path);
			}

			// svgedit.utilities.reorientGrads(path, m);
		}
	};

	// //////////////////////////////////////////////////////////
	// Performance times with various browsers on Macbook 2011 8MB RAM OS X El Capitan 10.11.4
	//
	// To see 'Before Optimization' performance, making the following two edits.
	// 1. svgedit.utilities.getStrokedBBox - change if( elems.length === 1) to if( false && elems.length === 1)
	// 2. svgedit.utilities.getBBoxWithTransform - uncomment 'Old technique that was very slow'

	// Chrome
	// Before Optimization
	//	 Pass1 svgCanvas.getStrokedBBox total ms 4,218, ave ms 41.0,	 min/max 37 51
	//	 Pass2 svgCanvas.getStrokedBBox total ms 4,458, ave ms 43.3,	 min/max 32 63
	// Optimized Code
	//	 Pass1 svgCanvas.getStrokedBBox total ms 1,112, ave ms 10.8,	 min/max 9 20
	//	 Pass2 svgCanvas.getStrokedBBox total ms		34, ave ms	0.3,	 min/max 0 20

	// Firefox
	// Before Optimization
	//	 Pass1 svgCanvas.getStrokedBBox total ms 3,794, ave ms 36.8,	 min/max 33 48
	//	 Pass2 svgCanvas.getStrokedBBox total ms 4,049, ave ms 39.3,	 min/max 28 53
	// Optimized Code
	//	 Pass1 svgCanvas.getStrokedBBox total ms	 104, ave ms 1.0,	 min/max 0 23
	//	 Pass2 svgCanvas.getStrokedBBox total ms		71, ave ms 0.7,	 min/max 0 23

	// Safari
	// Before Optimization
	//	 Pass1 svgCanvas.getStrokedBBox total ms 4,840, ave ms 47.0,	 min/max 45 62
	//	 Pass2 svgCanvas.getStrokedBBox total ms 4,849, ave ms 47.1,	 min/max 34 62
	// Optimized Code
	//	 Pass1 svgCanvas.getStrokedBBox total ms		42, ave ms 0.4,	 min/max 0 23
	//	 Pass2 svgCanvas.getStrokedBBox total ms		17, ave ms 0.2,	 min/max 0 23

	asyncTest('Test svgCanvas.getStrokedBBox() performance with matrix transforms', function () {
		expect(2);
		var getStrokedBBox = svgedit.utilities.getStrokedBBox;
		var children = currentLayer.children;

		var index, count, child, start, delta, lastTime, now, ave,
			min = Number.MAX_VALUE,
			max = 0,
			total = 0;

		fillDocumentByCloningElement(groupWithMatrixTransform, 50);
		fillDocumentByCloningElement(textWithMatrixTransform, 50);

		// The first pass through all elements is slower.
		count = children.length;
		start = lastTime = now = Date.now();
		// Skip the first child which is the title.
		for (index = 1; index < count; index++) {
			child = children[index];
			/* var obj = */ getStrokedBBox([child], mockAddSvgElementFromJson, mockPathActions);
			now = Date.now(); delta = now - lastTime; lastTime = now;
			total += delta;
			min = Math.min(min, delta);
			max = Math.max(max, delta);
		}
		total = lastTime - start;
		ave = total / count;
		ok(ave < 20, 'svgedit.utilities.getStrokedBBox average execution time is less than 20 ms');
		console.log('Pass1 svgCanvas.getStrokedBBox total ms ' + total + ', ave ms ' + ave.toFixed(1) + ',	 min/max ' + min + ' ' + max);

		// The second pass is two to ten times faster.
		setTimeout(function () {
			count = children.length;

			start = lastTime = now = Date.now();
			// Skip the first child which is the title.
			for (index = 1; index < count; index++) {
				child = children[index];
				/* var obj = */ getStrokedBBox([child], mockAddSvgElementFromJson, mockPathActions);
				now = Date.now(); delta = now - lastTime; lastTime = now;
				total += delta;
				min = Math.min(min, delta);
				max = Math.max(max, delta);
			}

			total = lastTime - start;
			ave = total / count;
			ok(ave < 2, 'svgedit.utilities.getStrokedBBox average execution time is less than 1 ms');
			console.log('Pass2 svgCanvas.getStrokedBBox total ms ' + total + ', ave ms ' + ave.toFixed(1) + ',	 min/max ' + min + ' ' + max);

			QUnit.start();
		});
	});
});
