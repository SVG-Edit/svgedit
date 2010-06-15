/*
 * ext-markers.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Will Schleter 
 *   based on ext-arrows.js by Copyright(c) 2010 Alexis Deveria
 *
 * This extension provides for the addition of markers to the either end
 * or the middle of a line, polyline, path, polygon. 
 * 
 * Markers may be either a graphic or arbitary text
 * 
 * to simplify the coding and make the implementation as robust as possible,
 * markers are not shared - every object has its own set of markers.
 * this relationship is maintained by a naming convention between the
 * ids of the markers and the ids of the object
 * 
 * The following restrictions exist for simplicty of use and programming
 *    objects and their markers to have the same color
 *    marker size is fixed
 *    text marker font, size, and attributes are fixed
 *    an application specific attribute - se_type - is added to each marker element
 *        to store the type of marker
 *        
 * TODO:
 *    remove some of the restrictions above
 *    add option for keeping text aligned to horizontal
 *    add support for dimension extension lines
 *
 */

svgEditor.addExtension("Markers", function(S) {
	var svgcontent = S.svgcontent,
	addElem = S.addSvgElementFromJson,
	selElems;

	var mtypes = ['start','mid','end'];

	var marker_prefix = 'se_marker_';
	var id_prefix = 'mkr_';
		
	// note - to add additional marker types add them below with a unique id
	// and add the associated icon(s) to marker-icons.svg
	// the geometry is normallized to a 100x100 box with the origin at lower left
	// Safari did not like negative values for low left of viewBox
	// remember that the coordinate system has +y downward
	var marker_types = {
		nomarker: {},  
		leftarrow:  
			{element:'path', attr:{d:'M0,50 L100,90 L70,50 L100,10 Z'}},
		rightarrow:
			{element:'path', attr:{d:'M100,50 L0,90 L30,50 L0,10 Z'}},
		textmarker:
			{element:'text', attr: {x:0, y:0,'stroke-width':0,'stroke':'none','font-size':75,'font-family':'serif','text-anchor':'left',
				'xml:space': 'preserve'}},
		forwardslash:
			{element:'path', attr:{d:'M30,100 L70,0'}},
		reverseslash:
			{element:'path', attr:{d:'M30,0 L70,100'}},
		verticalslash:
			{element:'path', attr:{d:'M50,0 L50,100'}},
		box:
			{element:'path', attr:{d:'M20,20 L20,80 L80,80 L80,20 Z'}},
		star:
			{element:'path', attr:{d:'M10,30 L90,30 L20,90 L50,10 L80,90 Z'}},
		xmark:
			{element:'path', attr:{d:'M20,80 L80,20 M80,80 L20,20'}},
		triangle:
			{element:'path', attr:{d:'M10,80 L50,20 L80,80 Z'}},
		mcircle:
			{element:'circle', attr:{r:30, cx:50, cy:50}},			
	}
	
	
	var lang_list = {
		"en":[
			{id: "start_marker_list", title: "Select start marker type" },
			{id: "mid_marker_list", title: "Select mid marker type" },
			{id: "end_marker_list", title: "Select end marker type" },
			{id: "nomarker", title: "No Marker" },
			{id: "leftarrow", title: "Left Arrow" },
			{id: "rightarrow", title: "Right Arrow" },
			{id: "textmarker", title: "Text Marker" },
			{id: "forwardslash", title: "Forward Slash" },
			{id: "reverseslash", title: "Reverse Slash" },
			{id: "verticalslash", title: "Vertical Slash" },
			{id: "box", title: "Box" },
			{id: "star", title: "Star" },
			{id: "xmark", title: "X" },
			{id: "triangle", title: "Triangle" },
			{id: "mcircle", title: "Circle" },
			{id: "leftarrow_o", title: "Open Left Arrow" },
			{id: "rightarrow_o", title: "Open Right Arrow" },
			{id: "box_o", title: "Open Box" },
			{id: "star_o", title: "Open Star" },
			{id: "triangle_o", title: "Open Triangle" },
			{id: "mcircle_o", title: "Open Circle" },
		]
	};


	// duplicate shapes to support unfilled (open) marker types with an _o suffix
	$.each(['leftarrow','rightarrow','box','star','mcircle','triangle'],function(i,v) {
		marker_types[v+'_o'] = marker_types[v];
	});
	
	// elem = a graphic element will have an attribute like marker-start
	// attr - marker-start, marker-mid, or marker-end
	// returns the marker element that is linked to the graphic element
	function getLinked(elem, attr) {
		var str = elem.getAttribute(attr);
		if(!str) return null;
		var m = str.match(/\(\#(.*)\)/);
		if(!m || m.length !== 2) {
			return null;
		}
		return S.getElem(m[1]);
	}

	//toggles context tool panel off/on
	//sets the controls with the selected element's settings
	function showPanel(on) {
		$('#marker_panel').toggle(on);

		if(on) {
			var el = selElems[0];
			var val;
			var ci;

			$.each(mtypes, function(i, pos) {
				var m=getLinked(el,"marker-"+pos);
				var txtbox = $('#'+pos+'_marker');
				if (!m) {
					val='\\nomarker';
					ci=val;
					txtbox.hide() // hide text box
				} else {
					if (!m.attributes.se_type) return; // not created by this extension
					val='\\'+m.attributes.se_type.textContent;
					ci=val;
					if (val=='\\textmarker') {
						val=m.lastChild.textContent;
						//txtbox.show(); // show text box
					} else {
						txtbox.hide() // hide text box
					}
				}
				txtbox.val(val);				
				setIcon(pos,ci);
			})
		}
	}	

	function addMarker(id, val) {
		var txt_box_bg = '#ffffff';
		var txt_box_border = 'none';
		var txt_box_stroke_width = 0;
		
		var marker = S.getElem(id);

		if (marker) return;

		if (val=='' || val=='\\nomarker') return;

		var el = selElems[0];		 
		var color = el.getAttribute('stroke');
		//NOTE: Safari didn't like a negative value in viewBox
		//so we use a standardized 0 0 100 100
		//with 50 50 being mapped to the marker position
		var refX = 50;
		var refY = 50;
		var viewBox = "0 0 100 100";
		var markerWidth = 5;
		var markerHeight = 5;
		var strokeWidth = 10;
		if (val.substr(0,1)=='\\') se_type=val.substr(1);
		else se_type='textmarker';

		if (!marker_types[se_type]) return; // an unknown type!
		
 		// create a generic marker
		marker = addElem({
			"element": "marker",
			"attr": {
			"id": id,
			"markerUnits": "strokeWidth",
			"orient": "auto",
			"style": "pointer-events:none",
			"se_type": se_type
		}
		});

		if (se_type!='textmarker') {
			var mel = addElem(marker_types[se_type]);
			var fillcolor = color;
			if (se_type.substr(-2)=='_o') fillcolor='none';
			mel.setAttribute('fill',fillcolor);
			mel.setAttribute('stroke',color);
			mel.setAttribute('stroke-width',strokeWidth);
			marker.appendChild(mel);
		} else {
			var text = addElem(marker_types[se_type]);
			// have to add text to get bounding box
			text.textContent = val;
			var tb=text.getBBox();
			//alert( tb.x + " " + tb.y + " " + tb.width + " " + tb.height);
			var pad=1;
			var bb = tb;
			bb.x = 0;
			bb.y = 0;
			bb.width += pad*2;
			bb.height += pad*2;
			// shift text according to its size
			text.setAttribute('x', pad);
			text.setAttribute('y', bb.height - pad - tb.height/4); // kludge?
			text.setAttribute('fill',color);
			refX = bb.width/2+pad;
			refY = bb.height/2+pad;
			viewBox = bb.x + " " + bb.y + " " + bb.width + " " + bb.height;
			markerWidth =bb.width/10;
			markerHeight = bb.height/10;

			var box = addElem({
				"element": "rect",
				"attr": {
				"x": bb.x,
				"y": bb.y,
				"width": bb.width,
				"height": bb.height,
				"fill": txt_box_bg,
				"stroke": txt_box_border,
				"stroke-width": txt_box_stroke_width
			}
			});
			marker.setAttribute("orient",0);
			marker.appendChild(box);
			marker.appendChild(text);
		} 

		marker.setAttribute("viewBox",viewBox);
		marker.setAttribute("markerWidth", markerWidth);
		marker.setAttribute("markerHeight", markerHeight);
		marker.setAttribute("refX", refX);
		marker.setAttribute("refY", refY);
		S.findDefs().appendChild(marker);

		return marker;
	}


	function setMarker() {
		var poslist={'start_marker':'start','mid_marker':'mid','end_marker':'end'};
		var pos = poslist[this.id];
		var marker_name = 'marker-'+pos;
		var val = this.value;
		var el = selElems[0];
		var marker = getLinked(el, marker_name);
		if (marker) $(marker).remove();
		el.removeAttribute(marker_name);
		if (val=='') val='\\nomarker';
		if (val=='\\nomarker') {
			setIcon(pos,val);
			return;
		}
		// Set marker on element
		var id = marker_prefix + pos + '_' + el.id;
		addMarker(id, val);
		svgCanvas.changeSelectedAttribute(marker_name, "url(#" + id + ")");
		if (el.tagName == "line" && pos=='mid') el=convertline(el);
		S.call("changed", selElems);
		setIcon(pos,val);
	}

	function convertline(elem) {
		// this routine came from the connectors extension
		// it is needed because midpoint markers don't work with line elements
		if (!(elem.tagName == "line")) return elem;

		// Convert to polyline to accept mid-arrow

		var x1 = elem.getAttribute('x1')-0;
		var x2 = elem.getAttribute('x2')-0;
		var y1 = elem.getAttribute('y1')-0;
		var y2 = elem.getAttribute('y2')-0;
		var id = elem.id;

		var mid_pt = (' '+((x1+x2)/2)+','+((y1+y2)/2) + ' ');
		var pline = addElem({
			"element": "polyline",
			"attr": {
			"points": (x1+','+y1+ mid_pt +x2+','+y2),
			"stroke": elem.getAttribute('stroke'),
			"stroke-width": elem.getAttribute('stroke-width'),
			"fill": "none",
			"opacity": elem.getAttribute('opacity') || 1
		}
		});
		$.each(mtypes, function(i, pos) { // get any existing marker definitions
			var nam = 'marker-'+pos;
			var m = elem.getAttribute(nam);
			if (m) pline.setAttribute(nam,elem.getAttribute(nam));
		});
		
		var batchCmd = new S.BatchCommand();
		batchCmd.addSubCommand(new S.RemoveElementCommand(elem, elem.parentNode));
		batchCmd.addSubCommand(new S.InsertElementCommand(pline));
		
		$(elem).after(pline).remove();
		svgCanvas.clearSelection();
		pline.id = id;
		svgCanvas.addToSelection([pline]);
		S.addCommandToHistory(batchCmd);
		return pline;
	}

	// called when the main system modifies an object
	// this routine changes the associated markers to be the same color
	function colorChanged(elem) {
		var color = elem.getAttribute('stroke');

		$.each(mtypes, function(i, pos) {
			var marker = getLinked(elem, 'marker-'+pos);
			if (!marker) return;
			if (!marker.attributes.se_type) return; //not created by this extension
			var ch = marker.lastElementChild;
			if (!ch) return;
			var curfill = ch.getAttribute("fill");
			var curstroke = ch.getAttribute("stroke")
			if (curfill && curfill!='none') ch.setAttribute("fill",color);
			if (curstroke && curstroke!='none') ch.setAttribute("stroke",color);
		});
	}

	// called when the main system creates or modifies an object
	// primary purpose is create new markers for cloned objects
	function updateReferences(el) {
		$.each(mtypes, function (i,pos) {
			var id = marker_prefix + pos + '_' + el.id;
			var marker_name = 'marker-'+pos;
			var marker = getLinked(el, marker_name);
			if (!marker || !marker.attributes.se_type) return; //not created by this extension
			var url = el.getAttribute(marker_name);
			if (url) {
				var len = el.id.length;
				var linkid = url.substr(-len-1,len);
				if (el.id != linkid) {
					var val = $('#'+pos+'_marker').attr('value');
					addMarker(id, val);
					svgCanvas.changeSelectedAttribute(marker_name, "url(#" + id + ")");
					if (el.tagName == "line" && pos=='mid') el=convertline(el);
					S.call("changed", selElems);
				}
			}
		});
	}

	// simulate a change event a text box that stores the current element's marker type
	function triggerTextEntry(pos,val) {
		$('#'+pos+'_marker').val(val);
		$('#'+pos+'_marker').change();
		var txtbox = $('#'+pos+'_marker');
		//if (val.substr(0,1)=='\\') txtbox.hide();
		//else txtbox.show();
	}
	
	function setIcon(pos,id) {
		if (id.substr(0,1)!='\\') id='\\textmarker'
		var ci = '#'+id_prefix+pos+'_'+id.substr(1);
		svgEditor.setIcon('#cur_' + pos +'_marker_list', $(ci).children());
		$(ci).addClass('current').siblings().removeClass('current');
	}
		
	function setMarkerSet(obj) {
		var parts = this.id.split('_');
		var set = parts[2];
		switch (set) {
		case 'off':
			triggerTextEntry('start','\\nomarker');
			triggerTextEntry('mid','\\nomarker');
			triggerTextEntry('end','\\nomarker');
			break;
		case 'dimension':
			triggerTextEntry('start','\\leftarrow');
			triggerTextEntry('end','\\rightarrow');
			showTextPrompt('mid');
			break;
		case 'label':
			triggerTextEntry('mid','\\nomarker');
			triggerTextEntry('end','\\rightarrow');
			showTextPrompt('start');
			break;
		}
	}
		
	function showTextPrompt(pos) {
		var def = $('#'+pos+'_marker').val();
		if (def.substr(0,1)=='\\') def='';
		$.prompt('Enter text for ' + pos + ' marker', def , function(txt) { if (txt) triggerTextEntry(pos,txt); });
	}
	
	// callback function for a toolbar button click
	function setArrowFromButton(obj) {
		
		var parts = this.id.split('_');
		var pos = parts[1];
		var val = parts[2];
		if (parts[3]) val+='_'+parts[3];
		
		if (val!='textmarker') {
			triggerTextEntry(pos,'\\'+val);
		} else {
			showTextPrompt(pos);
		}
	}
	
	function getTitle(lang,id) {
		var list = lang_list[lang];
		for (var i in list) {
			if (list[i].id==id) return list[i].title;
		}
		return id;
	}
	
	
	// build the toolbar button array from the marker definitions
	// TODO: need to incorporate language specific titles
	function buildButtonList() {
		var buttons=[];
		var i=0;
/*
		buttons.push({
			id:id_prefix + 'markers_off',
			title:'Turn off all markers',
			type:'context',
			events: { 'click': setMarkerSet },
			panel: 'marker_panel'
		});
		buttons.push({
			id:id_prefix + 'markers_dimension',
			title:'Dimension',
			type:'context',
			events: { 'click': setMarkerSet },
			panel: 'marker_panel'
		});
		buttons.push({
			id:id_prefix + 'markers_label',
			title:'Label',
			type:'context',
			events: { 'click': setMarkerSet },
			panel: 'marker_panel'
		});
*/
		$.each(mtypes,function(k,pos) {
			var listname = pos + "_marker_list";
			var def = true;
		$.each(marker_types,function(id,v) {
			var title = getTitle('en',id);
			buttons.push({
					id:id_prefix + pos + "_" + id,
					svgicon:id,
					title:title,
					type:'context',
					events: { 'click': setArrowFromButton },
					panel:'marker_panel',
					list: listname,
					isDefault: def
			});
			def = false;
		});
		});
		return buttons;
	}

	return {
		name: "Markers",
		svgicons: "extensions/markers-icons.xml",
		buttons: buildButtonList(),
		context_tools: [
		   {
			type: "input",
			panel: "marker_panel",
			title: "Start marker",
			id: "start_marker",
			label: "s",
			size: 3,
			events: { change: setMarker }
		},{
			type: "button-select",
			panel: "marker_panel",
			title: getTitle('en','start_marker_list'),
			id: "start_marker_list",
			colnum: 3,
			events: { change: setArrowFromButton }
		},{
			type: "input",
			panel: "marker_panel",
			title: "Middle marker",
			id: "mid_marker",
			label: "m",
			defval: "",
			size: 3,
			events: { change: setMarker }
		},{
			type: "button-select",
			panel: "marker_panel",
			title: getTitle('en','mid_marker_list'),
			id: "mid_marker_list",
			colnum: 3,
			events: { change: setArrowFromButton }
		},{
			type: "input",
			panel: "marker_panel",
			title: "End marker",
			id: "end_marker",
			label: "e",
			size: 3,
			events: { change: setMarker }
		},{
			type: "button-select",
			panel: "marker_panel",
			title: getTitle('en','end_marker_list'),
			id: "end_marker_list",
			colnum: 3,
			events: { change: setArrowFromButton }
		} ],
		callback: function() {
			$('#marker_panel').addClass('toolset').hide();
			
		},
		addLangData: function(lang) {
			return { data: lang_list[lang] };
		},

	selectedChanged: function(opts) {
		// Use this to update the current selected elements
		//console.log('selectChanged',opts);
		selElems = opts.elems;

		var i = selElems.length;
		var marker_elems = ['line','path','polyline','polygon'];

		while(i--) {
			var elem = selElems[i];
			if(elem && $.inArray(elem.tagName, marker_elems) != -1) {
				if(opts.selectedElement && !opts.multiselected) {
					showPanel(true);
				} else {
					showPanel(false);
				}
			} else {
				showPanel(false);
			}
		}
	},

	elementChanged: function(opts) {		
		//console.log('elementChanged',opts);
		var elem = opts.elems[0];
		if(elem && (
				elem.getAttribute("marker-start") ||
				elem.getAttribute("marker-mid") ||
				elem.getAttribute("marker-end")
		)) {
			colorChanged(elem);
			updateReferences(elem);
		}
		changing_flag = false;
	}
	};
});
