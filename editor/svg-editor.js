/*
 * svg-editor.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2009 Alexis Deveria
 * Copyright(c) 2009 Pavol Rusnak
 * Copyright(c) 2009 Jeff Schiller
 * Copyright(c) 2009 Narendra Sisodya
 *
 */

function svg_edit_setup() {
	var uiStrings = {
		'invalidAttrValGiven':'Invalid value given',
		'noContentToFitTo':'No content to fit to',
		'layer':"Layer",
		'dupeLayerName':"There is already a layer named that!",
		'enterUniqueLayerName':"Please enter a unique layer name",
		'enterNewLayerName':"Please enter the new layer name",
		'layerHasThatName':"Layer already has that name",
		'QmoveElemsToLayer':"Move selected elements to layer '%s'?",
		'QwantToClear':'Do you want to clear the drawing?\nThis will also erase your undo history!',
		'QerrorsRevertToSource':'There were parsing errors in your SVG source.\nRevert back to original SVG source?',
		'QignoreSourceChanges':'Ignore changes made to SVG source?',
		'featNotSupported':'Feature not supported',
		'enterNewImgURL':'Enter the new image URL',
		'ok':'OK',
		'cancel':'Cancel',
		'key_up':'Up',
		'key_down':'Down',
		'key_backspace':'Backspace',
		'key_del':'Del'
	};
	
	var palette = ["#000000","#202020","#404040","#606060","#808080","#a0a0a0","#c0c0c0","#e0e0e0","#ffffff","#800000","#ff0000","#808000","#ffff00","#008000","#00ff00","#008080","#00ffff","#000080","#0000ff","#800080","#ff00ff","#2b0000","#550000","#800000","#aa0000","#d40000","#ff0000","#ff2a2a","#ff5555","#ff8080","#ffaaaa","#ffd5d5","#280b0b","#501616","#782121","#a02c2c","#c83737","#d35f5f","#de8787","#e9afaf","#f4d7d7","#241c1c","#483737","#6c5353","#916f6f","#ac9393","#c8b7b7","#e3dbdb","#2b1100","#552200","#803300","#aa4400","#d45500","#ff6600","#ff7f2a","#ff9955","#ffb380","#ffccaa","#ffe6d5","#28170b","#502d16","#784421","#a05a2c","#c87137","#d38d5f","#deaa87","#e9c6af","#f4e3d7","#241f1c","#483e37","#6c5d53","#917c6f","#ac9d93","#c8beb7","#e3dedb","#2b2200","#554400","#806600","#aa8800","#d4aa00","#ffcc00","#ffd42a","#ffdd55","#ffe680","#ffeeaa","#fff6d5","#28220b","#504416","#786721","#a0892c","#c8ab37","#d3bc5f","#decd87","#e9ddaf","#f4eed7","#24221c","#484537","#6c6753","#918a6f","#aca793","#c8c4b7","#e3e2db","#222b00","#445500","#668000","#88aa00","#aad400","#ccff00","#d4ff2a","#ddff55","#e5ff80","#eeffaa","#f6ffd5","#22280b","#445016","#677821","#89a02c","#abc837","#bcd35f","#cdde87","#dde9af","#eef4d7","#22241c","#454837","#676c53","#8a916f","#a7ac93","#c4c8b7","#e2e3db","#112b00","#225500","#338000","#44aa00","#55d400","#66ff00","#7fff2a","#99ff55","#b3ff80","#ccffaa","#e5ffd5","#17280b","#2d5016","#447821","#5aa02c","#71c837","#8dd35f","#aade87","#c6e9af","#e3f4d7","#1f241c","#3e4837","#5d6c53","#7c916f","#9dac93","#bec8b7","#dee3db","#002b00","#005500","#008000","#00aa00","#00d400","#00ff00","#2aff2a","#55ff55","#80ff80","#aaffaa","#d5ffd5","#0b280b","#165016","#217821","#2ca02c","#37c837","#5fd35f","#87de87","#afe9af","#d7f4d7","#1c241c","#374837","#536c53","#6f916f","#93ac93","#b7c8b7","#dbe3db","#002b11","#005522","#008033","#00aa44","#00d455","#00ff66","#2aff80","#55ff99","#80ffb3","#aaffcc","#d5ffe6","#0b2817","#16502d","#217844","#2ca05a","#37c871","#5fd38d","#87deaa","#afe9c6","#d7f4e3","#1c241f","#37483e","#536c5d","#6f917c","#93ac9d","#b7c8be","#dbe3de","#002b22","#005544","#008066","#00aa88","#00d4aa","#00ffcc","#2affd5","#55ffdd","#80ffe6","#aaffee","#d5fff6","#0b2822","#165044","#217867","#2ca089","#37c8ab","#5fd3bc","#87decd","#afe9dd","#d7f4ee","#1c2422","#374845","#536c67","#6f918a","#93aca7","#b7c8c4","#dbe3e2","#00222b","#004455","#006680","#0088aa","#00aad4","#00ccff","#2ad4ff","#55ddff","#80e5ff","#aaeeff","#d5f6ff","#0b2228","#164450","#216778","#2c89a0","#37abc8","#5fbcd3","#87cdde","#afdde9","#d7eef4","#1c2224","#374548","#53676c","#6f8a91","#93a7ac","#b7c4c8","#dbe2e3","#00112b","#002255","#003380","#0044aa","#0055d4","#0066ff","#2a7fff","#5599ff","#80b3ff","#aaccff","#d5e5ff","#0b1728","#162d50","#214478","#2c5aa0","#3771c8","#5f8dd3","#87aade","#afc6e9","#d7e3f4","#1c1f24","#373e48","#535d6c","#6f7c91","#939dac","#b7bec8","#dbdee3","#00002b","#000055","#000080","#0000aa","#0000d4","#0000ff","#2a2aff","#5555ff","#8080ff","#aaaaff","#d5d5ff","#0b0b28","#161650","#212178","#2c2ca0","#3737c8","#5f5fd3","#8787de","#afafe9","#d7d7f4","#1c1c24","#373748","#53536c","#6f6f91","#9393ac","#b7b7c8","#dbdbe3","#11002b","#220055","#330080","#4400aa","#5500d4","#6600ff","#7f2aff","#9955ff","#b380ff","#ccaaff","#e5d5ff","#170b28","#2d1650","#442178","#5a2ca0","#7137c8","#8d5fd3","#aa87de","#c6afe9","#e3d7f4","#1f1c24","#3e3748","#5d536c","#7c6f91","#9d93ac","#beb7c8","#dedbe3","#22002b","#440055","#660080","#8800aa","#aa00d4","#cc00ff","#d42aff","#dd55ff","#e580ff","#eeaaff","#f6d5ff","#220b28","#441650","#672178","#892ca0","#ab37c8","#bc5fd3","#cd87de","#ddafe9","#eed7f4","#221c24","#453748","#67536c","#8a6f91","#a793ac","#c4b7c8","#e2dbe3","#2b0022","#550044","#800066","#aa0088","#d400aa","#ff00cc","#ff2ad4","#ff55dd","#ff80e5","#ffaaee","#ffd5f6","#280b22","#501644","#782167","#a02c89","#c837ab","#d35fbc","#de87cd","#e9afdd","#f4d7ee","#241c22","#483745","#6c5367","#916f8a","#ac93a7","#c8b7c4","#e3dbe2","#2b0011","#550022","#800033","#aa0044","#d40055","#ff0066","#ff2a7f","#ff5599","#ff80b2","#ffaacc","#ffd5e5","#280b17","#50162d","#782144","#a02c5a","#c83771","#d35f8d","#de87aa","#e9afc6","#f4d7e3","#241c1f","#48373e","#6c535d","#916f7c","#ac939d","#c8b7be","#e3dbde"]

	var isMac = false; //(navigator.platform.indexOf("Mac") != -1);
	var modKey = ""; //(isMac ? "meta+" : "ctrl+");
	var svgCanvas = new SvgCanvas(document.getElementById("svgcanvas"));
	var default_img_url = "images/logo.png";

	// Store and retrieve preferences
	$.pref = function(key, val) {
		if(val) curPrefs[key] = val;
		key = 'svg-edit-'+key;
		var host = location.hostname;
		var onweb = host && host.indexOf('.') != -1;
		var store = (val != undefined);
		var storage = false;
		// Some FF versions throw security errors here
		try { 
			if(window.localStorage && onweb) {
				storage = localStorage;
			}
		} catch(e) {}
		try { 
			if(window.globalStorage && onweb) {
				storage = globalStorage[host];
			}
		} catch(e) {}
		
		if(storage) {
			if(store) storage.setItem(key, val);
				else return storage.getItem(key);
		} else if(window.widget) {
			if(store) widget.setPreferenceForKey(val, key);
				else return widget.preferenceForKey(key);
		} else {
			if(store) {
				var d = new Date();
				d.setTime(d.getTime() + 31536000000);
				val = encodeURIComponent(val);
				document.cookie = key+'='+val+'; expires='+d.toUTCString();
			} else {
				var result = document.cookie.match(new RegExp(key + "=([^;]+)"));
				return result?decodeURIComponent(result[1]):'';
			}
		}
	}

	var curPrefs = {
		lang:'en',
		iconsize:'m',
		bg_color:'#FFF',
		bg_url:'',
		img_save:'embed'
	};
	
	// This sets up alternative dialog boxes. They mostly work the same way as
	// their UI counterparts, expect instead of returning the result, a callback
	// needs to be included that returns the result as its first parameter.
	// In the future we may want to add additional types of dialog boxes, since 
	// they should be easy to handle this way.
	(function() {
		$('#dialog_container').draggable({cancel:'#dialog_content, #dialog_buttons *'});
		var box = $('#dialog_box'), btn_holder = $('#dialog_buttons');
		
		var dbox = function(type, msg, callback, defText) {
			$('#dialog_content').html('<p>'+msg.replace(/\n/g,'</p><p>')+'</p>')
				.toggleClass('prompt',(type=='prompt'));
			btn_holder.empty();
			
			var ok = $('<input type="button" value="' + uiStrings.ok + '">').appendTo(btn_holder);
		
			if(type != 'alert') {
				$('<input type="button" value="' + uiStrings.cancel + '">')
					.appendTo(btn_holder)
					.click(function() { box.hide();callback(false)});
			}
			
			if(type == 'prompt') {
				var input = $('<input type="text">').prependTo(btn_holder);
				input.val(defText || '');
				input.bind('keydown', {combi:'return'}, function() {ok.click();});
			}

			box.show();
			
			ok.click(function() { 
				box.hide();
				var resp = (type == 'prompt')?input.val():true;
				if(callback) callback(resp);
			}).focus();
			
			if(type == 'prompt') input.focus();
		}
		
		$.alert = function(msg, cb) { dbox('alert', msg, cb);};
		$.confirm = function(msg, cb) {	dbox('confirm', msg, cb);};
		$.prompt = function(msg, txt, cb) { dbox('prompt', msg, cb, txt);};
	}());
	
	var setSelectMode = function() {
		$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
		$('#tool_select').addClass('tool_button_current');
		$('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all} #svgcanvas svg{cursor:default}');
		svgCanvas.setMode('select');
	};

	// used to make the flyouts stay on the screen longer the very first time
	var flyoutspeed = 1250;
	var textBeingEntered = false;
	var selectedElement = null;
	var multiselected = false;
	var editingsource = false;
	var docprops = false;
	var length_attrs = ['x','y','x1','x2','y1','y2','cx','cy','width','height','r','rx','ry','width','height','radius'];
	var length_types = ['em','ex','px','cm','mm','in','pt','pc','%'];
	
	var fillPaint = new $.jGraduate.Paint({solidColor: "FF0000"}); // solid red
	var strokePaint = new $.jGraduate.Paint({solidColor: "000000"}); // solid black

	// TODO: Unfortunately Mozilla does not handle internal references to gradients
	// inside a data: URL document.  This means that any elements filled/stroked 
	// with a gradient will appear black in Firefox, etc.  See bug 308590
	// https://bugzilla.mozilla.org/show_bug.cgi?id=308590
	var saveHandler = function(window,svg) {
		window.open("data:image/svg+xml;base64," + Utils.encode64(svg));
	};
	
	// called when we've selected a different element
	var selectedChanged = function(window,elems) {
		// if elems[1] is present, then we have more than one element
		selectedElement = (elems.length == 1 || elems[1] == null ? elems[0] : null);
		multiselected = (elems.length >= 2 && elems[1] != null);
		var is_node = false;
		if (selectedElement != null) {
			// unless we're already in always set the mode of the editor to select because
			// upon creation of a text element the editor is switched into
			// select mode and this event fires - we need our UI to be in sync
			
			is_node = !!(selectedElement.id && selectedElement.id.indexOf('pathpointgrip') == 0);
			
			if (svgCanvas.getMode() != "multiselect" && !is_node) {
				setSelectMode();
				updateToolbar();
			} 
			
		} // if (elem != null)


		// Deal with pathedit mode
		$('#path_node_panel').toggle(is_node);
		$('#tools_bottom_2,#tools_bottom_3').toggle(!is_node);
		var size = $('#tool_select > svg')[0].getAttribute('width');
		if(is_node) {
			// Change select icon
			$('.tool_button').removeClass('tool_button_current');
			$('#tool_select').addClass('tool_button_current')
				.empty().append($.getSvgIcon('select_node'));
		} else {
			$('#tool_select').empty().append($.getSvgIcon('select'));
		}
		$.resizeSvgIcons({'#tool_select .svg_icon':size});

		updateContextPanel(); 
	};

	// called when any element has changed
	var elementChanged = function(window,elems) {
		
		for (var i = 0; i < elems.length; ++i) {
			var elem = elems[i];
			
			// if the element changed was the svg, then it could be a resolution change
			if (elem && elem.tagName == "svg" && elem.getAttribute("viewBox")) {
				var vb = elem.getAttribute("viewBox").split(' ');
				changeResolution(parseInt(vb[2]),
								 parseInt(vb[3]));
			} 
			// Update selectedElement if element is no longer part of the image.
			// This occurs for the text elements in Firefox
			else if(elem && selectedElement && selectedElement.parentNode == null) {
				selectedElement = elem;
			}
		}
		
		// we update the contextual panel with potentially new
		// positional/sizing information (we DON'T want to update the
		// toolbar here as that creates an infinite loop)
		// also this updates the history buttons

		// we tell it to skip focusing the text control if the
		// text element was previously in focus
		updateContextPanel();
	};
	
	var updateBgImage = function() {
		var bg_img = $('#background_img');
		if(!bg_img.length) return;
		var img = bg_img.find('img');
		var zoomlevel = svgCanvas.getZoom();
		img.width(zoomlevel*100 + '%');
	}
	
	var zoomChanged = function(window, bbox) {
		var scrbar = 15;
		var res = svgCanvas.getResolution();
		var w_area = $('#workarea');
		var canvas_pos = $('#svgcanvas').position();
		w_area.css('cursor','auto');
		var z_info = svgCanvas.setBBoxZoom(bbox, w_area.width()-scrbar, w_area.height()-scrbar);
		if(!z_info) return;
		var zoomlevel = z_info.zoom;
		var bb = z_info.bbox;
		$('#zoom').val(Math.round(zoomlevel*100));
		setResolution(res.w * zoomlevel, res.h * zoomlevel);
		var scrLeft = bb.x * zoomlevel;
		var scrOffX = w_area.width()/2 - (bb.width * zoomlevel)/2;
		w_area[0].scrollLeft = Math.max(0,scrLeft - scrOffX) + Math.max(0,canvas_pos.left);
		var scrTop = bb.y * zoomlevel;
		var scrOffY = w_area.height()/2 - (bb.height * zoomlevel)/2;
		w_area[0].scrollTop = Math.max(0,scrTop - scrOffY) + Math.max(0,canvas_pos.top);
		if(svgCanvas.getMode() == 'zoom' && bb.width) {
			// Go to select if a zoom box was drawn
			setSelectMode();
		}
		zoomDone();
	}

	// updates the toolbar (colors, opacity, etc) based on the selected element
	var updateToolbar = function() {
		if (selectedElement != null && 
			selectedElement.tagName != "image" &&
			selectedElement.tagName != "g")
		{
			// get opacity values
			var fillOpacity = parseFloat(selectedElement.getAttribute("fill-opacity"));
			if (isNaN(fillOpacity)) {
				fillOpacity = 1.0;
			}
			
			var strokeOpacity = parseFloat(selectedElement.getAttribute("stroke-opacity"));
			if (isNaN(strokeOpacity)) {
				strokeOpacity = 1.0;
			}

			// update fill color and opacity
			var fillColor = selectedElement.getAttribute("fill")||"none";
			// prevent undo on these canvas changes
			svgCanvas.setFillColor(fillColor, true);
			svgCanvas.setFillOpacity(fillOpacity, true);

			// update stroke color and opacity
			var strokeColor = selectedElement.getAttribute("stroke")||"none";
			// prevent undo on these canvas changes
			svgCanvas.setStrokeColor(strokeColor, true);
			svgCanvas.setStrokeOpacity(strokeOpacity, true);

			fillOpacity *= 100;
			strokeOpacity *= 100;
			
			var getPaint = function(color, opac) {
				// update the editor's fill paint
				var opts = null;
				if (color.substr(0,5) == "url(#") {
					opts = {
						alpha: opac,
						linearGradient: document.getElementById(color.substr(5,color.length-6))
					};
				} 
				else if (color.substr(0,1) == "#") {
					opts = {
						alpha: opac,
						solidColor: color.substr(1)
					};
				}
				return new $.jGraduate.Paint(opts);
			}
			
			fillPaint = getPaint(fillColor, fillOpacity);
			strokePaint = getPaint(strokeColor, strokeOpacity);
			
			fillOpacity = fillOpacity + " %";
			strokeOpacity = strokeOpacity + " %";

			// update fill color
			if (fillColor == "none") {
				fillOpacity = "N/A";
			}
			document.getElementById("gradbox_fill").parentNode.firstChild.setAttribute("fill", fillColor);
			if (strokeColor == null || strokeColor == "" || strokeColor == "none") {
				strokeColor = "none";
				strokeOpacity = "N/A";
			}
			
			// update the rect inside #fill_color
			document.getElementById("gradbox_stroke").parentNode.firstChild.setAttribute("fill", strokeColor);
			$('#fill_opacity').html(fillOpacity);
			$('#stroke_opacity').html(strokeOpacity);
			$('#stroke_width').val(selectedElement.getAttribute("stroke-width")||1);
			$('#stroke_style').val(selectedElement.getAttribute("stroke-dasharray")||"none");
		}
		
		// All elements including image and group have opacity
		if(selectedElement != null) {
			var opac_perc = ((selectedElement.getAttribute("opacity")||1.0)*100);
			$('#group_opacity').val(opac_perc);
			$('#opac_slider').slider('option', 'value', opac_perc);
		}
		
		updateToolButtonState();
	};

	// updates the context panel tools based on the selected element
	var updateContextPanel = function() {
		var elem = selectedElement;
		var currentLayer = svgCanvas.getCurrentLayer();
		var currentMode = svgCanvas.getMode();
		// No need to update anything else in rotate mode
		if (currentMode == 'rotate' && elem != null) {
			var ang = svgCanvas.getRotationAngle(elem);
			$('#angle').val(ang);
			$('#tool_reorient').toggleClass('tool_button_disabled', ang == 0);
			return;
		}
		var is_node = elem ? (elem.id && elem.id.indexOf('pathpointgrip') == 0) : false;
		
		$('#selected_panel, #multiselected_panel, #g_panel, #rect_panel, #circle_panel,\
			#ellipse_panel, #line_panel, #text_panel, #image_panel').hide();
		if (elem != null) {
			var elname = elem.nodeName;
			var angle = svgCanvas.getRotationAngle(elem);
			$('#angle').val(angle);
			
			if(svgCanvas.addedNew) {
				console.log(elname)
				if(elname == 'image') {
					promptImgURL();
				} else if(elname == 'text') {
					// TODO: Do something here for new text
				}
			}
			
			if(!is_node && currentMode != 'pathedit') {
				$('#selected_panel').show();
				// Elements in this array already have coord fields
				if($.inArray(elname, ['line', 'circle', 'ellipse']) != -1) {
					$('#xy_panel').hide();
				} else {
					var x,y;
					// Get BBox vals for g, polyline and path
					if($.inArray(elname, ['g', 'polyline', 'path']) != -1) {
						var bb = svgCanvas.getStrokedBBox([elem]);
						if(bb) {
							x = bb.x;
							y = bb.y;
						}
					} else {
						x = elem.getAttribute('x');
						y = elem.getAttribute('y');
					}
					$('#selected_x').val(x || 0);
					$('#selected_y').val(y || 0);
					$('#xy_panel').show();
				}
				
				// Elements in this array cannot be converted to a path
				var no_path = $.inArray(elname, ['image', 'text', 'path', 'g']) == -1;
				$('#tool_topath').toggle(no_path);
				$('#tool_reorient').toggle(elname == 'path');
				$('#tool_reorient').toggleClass('tool_button_disabled', angle == 0);
			} else {
				var point = svgCanvas.getNodePoint();
				if(point) {
					var seg_type = $('#seg_type');
					$('#path_node_x').val(point.x);
					$('#path_node_y').val(point.y);
					if(point.type) {
						seg_type.val(point.type).removeAttr('disabled');
					} else {
						seg_type.val(4).attr('disabled','disabled');
					}
				}
				return;
			}
			
			// update contextual tools here
			var panels = {
				g: [],
				rect: ['rx','width','height'],
				image: ['width','height'],
				circle: ['cx','cy','r'],
				ellipse: ['cx','cy','rx','ry'],
				line: ['x1','y1','x2','y2'], 
				text: []
			};
			
			var el_name = elem.tagName;
			
			if(panels[el_name]) {
				var cur_panel = panels[el_name];
				
				
				$('#' + el_name + '_panel').show();
	
				$.each(cur_panel, function(i, item) {
					$('#' + el_name + '_' + item).val(elem.getAttribute(item) || 0);
				});
				
				if(el_name == 'text') {
					$('#text_panel').css("display", "inline");	
					if (svgCanvas.getItalic()) {
						$('#tool_italic').addClass('tool_button_current');
					}
					else {
						$('#tool_italic').removeClass('tool_button_current');
					}
					if (svgCanvas.getBold()) {
						$('#tool_bold').addClass('tool_button_current');
					}
					else {
						$('#tool_bold').removeClass('tool_button_current');
					}
					$('#font_family').val(elem.getAttribute("font-family"));
					$('#font_size').val(elem.getAttribute("font-size"));
					$('#text').val(elem.textContent);
					if (svgCanvas.addedNew) {
						$('#text').focus().select();
					}
				} // text
				else if(el_name == 'image') {
					var xlinkNS="http://www.w3.org/1999/xlink";
					var href = elem.getAttributeNS(xlinkNS, "href");
          			setImageURL(href);
        		} // image
			}
		} // if (elem != null)
		else if (multiselected) {
			$('#multiselected_panel').show();
		}
		
		// update history buttons
		if (svgCanvas.getUndoStackSize() > 0) {
			$('#tool_undo').removeClass( 'tool_button_disabled');
		}
		else {
			$('#tool_undo').addClass( 'tool_button_disabled');
		}
		if (svgCanvas.getRedoStackSize() > 0) {
			$('#tool_redo').removeClass( 'tool_button_disabled');
		}
		else {
			$('#tool_redo').addClass( 'tool_button_disabled');
		}
		
		svgCanvas.addedNew = false;

		if ( (elem && !is_node)	|| multiselected) {
			// update the selected elements' layer
			$('#selLayerNames').removeAttr('disabled').val(currentLayer);
		}
		else {
			$('#selLayerNames').attr('disabled', 'disabled');
		}
		
	};

	$('#text').focus( function(){ textBeingEntered = true; } );
	$('#text').blur( function(){ textBeingEntered = false; } );
  
	// bind the selected event to our function that handles updates to the UI
	svgCanvas.bind("selected", selectedChanged);
	svgCanvas.bind("changed", elementChanged);
	svgCanvas.bind("saved", saveHandler);
	svgCanvas.bind("zoomed", zoomChanged);

	var str = '<div class="palette_item" data-rgb="none"></div>'
	$.each(palette, function(i,item){
		str += '<div class="palette_item" style="background-color: ' + item + ';" data-rgb="' + item + '"></div>';
	});
	$('#palette').append(str);
	
	// Set up editor background functionality
	var color_blocks = ['#FFF','#888','#000','url(data:image/gif;base64,R0lGODlhEAAQAIAAAP%2F%2F%2F9bW1iH5BAAAAAAALAAAAAAQABAAAAIfjG%2Bgq4jM3IFLJgpswNly%2FXkcBpIiVaInlLJr9FZWAQA7)'];
	var str = '';
	$.each(color_blocks, function() {
		str += '<div class="color_block" style="background:' + this + ';"></div>';
	});
	$('#bg_blocks').append(str);
	var blocks = $('#bg_blocks div');
	var cur_bg = 'cur_background';
	blocks.each(function() {
		var blk = $(this);
		blk.click(function() {
			blocks.removeClass(cur_bg);
			$(this).addClass(cur_bg);
		});
	});

	if($.pref('bg_color')) {
		setBackground($.pref('bg_color'), $.pref('bg_url'));
	}
	
	if($.pref('img_save')) {
		curPrefs.img_save = $.pref('img_save');
		$('#image_save_opts input').val([curPrefs.img_save]);
	}

	var pos = $('#tools_rect_show').position();
	$('#tools_rect').css({'left': pos.left+4, 'top': pos.top+77});
	pos = $('#tools_ellipse_show').position();
	$('#tools_ellipse').css({'left': pos.left+4, 'top': pos.top+77});

	var changeRectRadius = function(ctl) {
		svgCanvas.setRectRadius(ctl.value);
	}
	
	var changeFontSize = function(ctl) {
		svgCanvas.setFontSize(ctl.value);
	}
	
	var changeStrokeWidth = function(ctl) {
		var val = ctl.value;
		if(val == 0 && selectedElement && $.inArray(selectedElement.nodeName, ['line', 'polyline']) != -1) {
			val = ctl.value = 1;
		}
		svgCanvas.setStrokeWidth(val);
	}
	
	var changeRotationAngle = function(ctl) {
		svgCanvas.setRotationAngle(ctl.value);
		$('#tool_reorient').toggleClass('tool_button_disabled', ctl.value == 0);
	}
	var changeZoom = function(ctl) {
		var zoomlevel = ctl.value / 100;
		var zoom = svgCanvas.getZoom();
		var w_area = $('#workarea');
		
		zoomChanged(window, {
			width: 0,
			height: 0,
			x: (w_area[0].scrollLeft + w_area.width()/2)/zoom,
			y: (w_area[0].scrollTop + w_area.height()/2)/zoom,
			zoom: zoomlevel
		});
	}
	
	var changeOpacity = function(ctl, val) {
		if(val == null) val = ctl.value;
		$('#group_opacity').val(val);
		if(!ctl || !ctl.handle) {
			$('#opac_slider').slider('option', 'value', val);
		}
		svgCanvas.setOpacity(val/100);
	}

	$('#stroke_style').change(function(){
		svgCanvas.setStrokeStyle(this.options[this.selectedIndex].value);
	});

	// Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
	$('select').change(function(){$(this).blur();});

	// fired when user wants to move elements to another layer
	var promptMoveLayerOnce = false;
	$('#selLayerNames').change(function(){
		var destLayer = this.options[this.selectedIndex].value;
		var confirm_str = uiStrings.QmoveElemsToLayer.replace('%s',destLayer);
		var moveToLayer = function(ok) {
			if(!ok) return;
			promptMoveLayerOnce = true;
			svgCanvas.moveSelectedToLayer(destLayer);
			svgCanvas.clearSelection();
			populateLayers();
		}
		if (destLayer) {
			if(promptMoveLayerOnce) {
				moveToLayer(true);
			} else {
				$.confirm(confirm_str, moveToLayer);
			}
		}
	});

	$('#font_family').change(function() {
		svgCanvas.setFontFamily(this.value);
	});

	$('#seg_type').change(function() {
		svgCanvas.setSegType($(this).val());
	});

	$('#text').keyup(function(){
		svgCanvas.setTextContent(this.value);
	});
  
	$('#image_url').change(function(){
		setImageURL(this.value); 
	});

	$('.attr_changer').change(function() {
		var attr = this.getAttribute("data-attr");
		var val = this.value;
		var valid = false;
		if($.inArray(attr, length_attrs) != -1) {
			if(!isNaN(val)) {
				valid = true;
			} else {
				//TODO: Allow the values in length_types, then uncomment this:  
// 				val = val.toLowerCase();
// 				$.each(length_types, function(i, unit) {
// 					if(valid) return;
// 					var re = new RegExp('^-?[\\d\\.]+' + unit + '$');
// 					if(re.test(val)) valid = true;
// 				});
			}
		} else valid = true;
		
		if(!valid) {
			$.alert(uiStrings.invalidAttrValGiven);
			this.value = selectedElement.getAttribute(attr);
			return false;
		} 
		svgCanvas.changeSelectedAttribute(attr, val);
	});
	
	// Prevent selection of elements when shift-clicking
	$('#palette').mouseover(function() {
		var inp = $('<input type="hidden">');
		$(this).append(inp);
		inp.focus().remove();
	});

	$('.palette_item').click(function(evt){
		var picker = (evt.shiftKey ? "stroke" : "fill");
		var id = (evt.shiftKey ? '#stroke_' : '#fill_');
		var color = $(this).attr('data-rgb');
		var rectbox = document.getElementById("gradbox_"+picker).parentNode.firstChild;
		var paint = null;

		// Webkit-based browsers returned 'initial' here for no stroke
		if (color == 'transparent' || color == 'initial') {
			color = 'none';
			$(id + "opacity").html("N/A");
			paint = new $.jGraduate.Paint();
		}
		else {
			paint = new $.jGraduate.Paint({alpha: 100, solidColor: color.substr(1)});
		}
		rectbox.setAttribute("fill", color);
		
		if (evt.shiftKey) {
			strokePaint = paint;
			if (svgCanvas.getStrokeColor() != color) {
				svgCanvas.setStrokeColor(color);
			}
			if (color != 'none' && svgCanvas.getStrokeOpacity() != 1) {
				svgCanvas.setStrokeOpacity(1.0);
				$("#stroke_opacity").html("100 %");
			}
		} else {
			fillPaint = paint;
			if (svgCanvas.getFillColor() != color) {
				svgCanvas.setFillColor(color);
			}
			if (color != 'none' && svgCanvas.getFillOpacity() != 1) {
				svgCanvas.setFillOpacity(1.0);
				$("#fill_opacity").html("100 %");
			}
		}
		updateToolButtonState();
	});

	// This is a common function used when a tool has been clicked (chosen)
	// It does several common things:
	// - removes the tool_button_current class from whatever tool currently has it
	// - hides any flyouts
	// - adds the tool_button_current class to the button passed in
	var toolButtonClick = function(button, fadeFlyouts) {
		if ($(button).hasClass('tool_button_disabled')) return false;
		var fadeFlyouts = fadeFlyouts || 'normal';
		$('.tools_flyout').fadeOut(fadeFlyouts);
		$('#styleoverrides').text('');
		$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
		$(button).addClass('tool_button_current');
		// when a tool is selected, we should deselect any currently selected elements
		svgCanvas.clearSelection();
		return true;
	};
	
	var addDropDown = function(elem, callback, dropUp) {
		var button = $(elem).find('button');
		var list = $(elem).find('ul');
		var on_button = false;
		if(dropUp) {
			$(elem).addClass('dropup');
		}
	
		$(elem).find('li').bind('mouseup', callback);
		
		$().mouseup(function(evt) {
			if(!on_button) {
				button.removeClass('down');
				list.hide();
			}
			on_button = false;
		});
		
		button.bind('mousedown',function() {
			if (!button.hasClass('down')) {
				button.addClass('down');
				list.show();
				on_button = true;
			} else {
				button.removeClass('down');
				list.hide();
			}
		}).hover(function() {
			on_button = true;
		}).mouseout(function() {
			on_button = false;
		});
	}
	
	addDropDown('#font_family_dropdown', function() {
		var fam = $(this).text();
		$('#font_family').val($(this).text()).change();
	});
	
	addDropDown('#opacity_dropdown', function() {
		if($(this).find('div').length) return;
		var perc = parseInt($(this).text().split('%')[0]);
		changeOpacity(false, perc);
	});
	
	// For slider usage, see: http://jqueryui.com/demos/slider/ 
	$("#opac_slider").slider({
		start: function() {
			$('#opacity_dropdown li:not(.special)').hide();
		},
		stop: function() {
			$('#opacity_dropdown li').show();
		},
		slide: function(evt, ui){
			changeOpacity(ui);
		}
	});

	addDropDown('#zoom_dropdown', function() {
		var item = $(this);
		var val = item.attr('data-val');
		if(val) {
			zoomChanged(window, val);
		} else {
			changeZoom({value:parseInt(item.text())});
		}
	}, true);
	
	var setIcon = function(holder_sel, id) {
		var icon = $.getSvgIcon(id).clone();
		var holder = $(holder_sel);
		icon[0].setAttribute('width',holder.width());
		icon[0].setAttribute('height',holder.height());
		holder.empty().append(icon);
	}
	
	var clickSelect = function() {
		if (toolButtonClick('#tool_select')) {
			svgCanvas.setMode('select');
			$('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all}, #svgcanvas svg{cursor:default}');
		}
	};

	var clickFHPath = function() {
		if (toolButtonClick('#tool_fhpath')) {
			svgCanvas.setMode('fhpath');
		}
	};

	var clickLine = function() {
		if (toolButtonClick('#tool_line')) {
			svgCanvas.setMode('line');
		}
	};

	var clickSquare = function(){
		if (toolButtonClick('#tools_rect_show', flyoutspeed)) {
			flyoutspeed = 'normal';
			svgCanvas.setMode('square');
		}
		setIcon('#tools_rect_show','square');
	};
	
	var clickRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('rect');
		}
		setIcon('#tools_rect_show','rect');
	};
	
	var clickFHRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('fhrect');
		}
		setIcon('#tools_rect_show','fh_rect');
	};
	
	var clickCircle = function(){
		if (toolButtonClick('#tools_ellipse_show', flyoutspeed)) {
			flyoutspeed = 'normal';
			svgCanvas.setMode('circle');
		}
		setIcon('#tools_ellipse_show','circle');
	};

	var clickEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('ellipse');
		}
		setIcon('#tools_ellipse_show','ellipse');
	};

	var clickFHEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('fhellipse');
		}
		setIcon('#tools_ellipse_show','fh_ellipse');
	};
	
	var clickImage = function(){
		if (toolButtonClick('#tool_image')) {
			svgCanvas.setMode('image');
		}
	};

	var clickZoom = function(){
		if (toolButtonClick('#tool_zoom')) {
			$('#workarea').css('cursor','crosshair');
			svgCanvas.setMode('zoom');
		}
	};

	var dblclickZoom = function(){
		if (toolButtonClick('#tool_zoom')) {
			zoomImage();
			setSelectMode();
		}
	};

	var clickText = function(){
		toolButtonClick('#tool_text');
		svgCanvas.setMode('text');
	};
	
	var clickPath = function(){
		toolButtonClick('#tool_path');
		svgCanvas.setMode('path');
	};
	
	// Delete is a contextual tool that only appears in the ribbon if
	// an element has been selected
	var deleteSelected = function() {
		if (selectedElement != null || multiselected) {
			svgCanvas.deleteSelectedElements();
		}
	};

	var moveToTopSelected = function() {
		if (selectedElement != null) {
			svgCanvas.moveToTopSelectedElement();
		}
	};

	var moveToBottomSelected = function() {
		if (selectedElement != null) {
			svgCanvas.moveToBottomSelectedElement();
		}
	};
	
	var convertToPath = function() {
		if (selectedElement != null) {
			svgCanvas.convertToPath();
		}
	}
	
	var reorientPath = function() {
		if (selectedElement != null) {
			svgCanvas.reorientPath();
		}
	}

	var moveSelected = function(dx,dy) {
		if (selectedElement != null || multiselected) {
			svgCanvas.moveSelectedElements(dx,dy);
		}
	};

	var linkControlPoints = function() {
		$('#tool_node_link').toggleClass('push_button_pressed');
		var linked = $('#tool_node_link').hasClass('push_button_pressed');
		svgCanvas.linkControlPoints(linked);
	}

	var clonePathNode = function() {
		if (svgCanvas.getNodePoint()) {
			svgCanvas.clonePathNode();
		}
	};
	
	var deletePathNode = function() {
		if (svgCanvas.getNodePoint()) {
			svgCanvas.deletePathNode();
		}
	};
	
	var selectNext = function() {
		svgCanvas.cycleElement(1);
	}
	
	var selectPrev = function() {
		svgCanvas.cycleElement(0);
	}

	var rotateSelected = function(cw) {
		if (selectedElement == null || multiselected) return;
		var step = 5;
		if(!cw) step *= -1;
		var new_angle = $('#angle').val()*1 + step;
		svgCanvas.setRotationAngle(new_angle);
		updateContextPanel();
	}
	
	var clickClear = function(){
		$.confirm(uiStrings.QwantToClear, function(ok) {
			if(!ok) return;
			svgCanvas.clear();
			svgCanvas.setResolution(640, 480);
			zoomImage();
			populateLayers();
			updateContextPanel();
		});
	};
	
	var clickBold = function(){
		svgCanvas.setBold( !svgCanvas.getBold() );
		updateContextPanel();
	};
	
	var clickItalic = function(){
		svgCanvas.setItalic( !svgCanvas.getItalic() );
		updateContextPanel();
	};

	var clickSave = function(){
		// In the future, more options can be provided here
		var saveOpts = {
			'images': curPrefs.img_save,
			'round_digits': 6
		}
		svgCanvas.save(saveOpts);
	};
	
	var clickOpen = function(){
		svgCanvas.open();
	};

	var clickUndo = function(){
		if (svgCanvas.getUndoStackSize() > 0) {
			svgCanvas.undo();
			populateLayers();
		}
	};

	var clickRedo = function(){
		if (svgCanvas.getRedoStackSize() > 0) {
			svgCanvas.redo();
			populateLayers();
		}
	};
	
	var clickGroup = function(){
		// group
		if (multiselected) {
			svgCanvas.groupSelectedElements();
		}
		// ungroup
		else if(selectedElement && selectedElement.tagName == 'g'){
			svgCanvas.ungroupSelectedElement();
		}
	};
	
	var clickClone = function(){
		svgCanvas.cloneSelectedElements();
	};
	
	var clickAlign = function() {
		var letter = this.id.replace('tool_align','').charAt(0);
		svgCanvas.alignSelectedElements(letter, $('#align_relative_to').val());
	};
	
	var zoomImage = function(multiplier) {
		var res = svgCanvas.getResolution();
		multiplier = multiplier?res.zoom * multiplier:1;
		setResolution(res.w * multiplier, res.h * multiplier, true);
		$('#zoom').val(multiplier * 100);
		svgCanvas.setZoom(multiplier);
		zoomDone();
	};
	
	var zoomDone = function() {
		updateBgImage();
		updateWireFrame();
	}

	var clickWireframe = function() {
		$('#tool_wireframe').toggleClass('push_button_pressed');
		$('#workarea').toggleClass('wireframe');
		
		if(supportsNonSS) return;
		var wf_rules = $('#wireframe_rules');
		if(!wf_rules.length) {
			wf_rules = $('<style id="wireframe_rules"><\/style>').appendTo('head');
		} else {
			wf_rules.empty();
		}
		
		updateWireFrame();
	}
	
	var updateWireFrame = function() {
		// Test support
		if(supportsNonSS) return;

		var rule = "#workarea.wireframe #svgcontent * { stroke-width: " + 1/svgCanvas.getZoom() + "px; }";
		$('#wireframe_rules').text($('#workarea').hasClass('wireframe') ? rule : "");
	}

	var showSourceEditor = function(){
		if (editingsource) return;
		editingsource = true;
		var str = svgCanvas.getSvgString();
		$('#svg_source_textarea').val(str);
		$('#svg_source_editor').fadeIn();
		properlySourceSizeTextArea();
		$('#svg_source_textarea').focus();
	};
	
	$('#svg_docprops_container').draggable({cancel:'button,fieldset'});
	
	
	var showDocProperties = function(){
		if (docprops) return;
		docprops = true;
		
		// This selects the correct radio button by using the array notation
		$('#image_save_opts input').val([curPrefs.img_save]);
		
		// update resolution option with actual resolution
		// TODO: what if SVG source is changed?
		var res = svgCanvas.getResolution();
		$('#canvas_width').val(res.w);
		$('#canvas_height').val(res.h);
		$('#canvas_title').val(svgCanvas.getImageTitle());
		
		// Update background color with current one
		var blocks = $('#bg_blocks div');
		var cur_bg = 'cur_background';
		var canvas_bg = $('#svgcanvas').css('background');
		var url = canvas_bg.match(/url\("?(.*?)"?\)/);
		if(url) url = url[1];
		blocks.each(function() {
			var blk = $(this);
			var is_bg = blk.css('background') == canvas_bg;
			blk.toggleClass(cur_bg, is_bg);
			if(is_bg) $('#canvas_bg_url').removeClass(cur_bg);
		});
		if(!canvas_bg) blocks.eq(0).addClass(cur_bg);
		if(!$('#bg_blocks .' + cur_bg).length && url) {
			$('#canvas_bg_url').val(url);
		}
		
		$('#svg_docprops').fadeIn();
	};
	
	var properlySourceSizeTextArea = function(){
		// TODO: remove magic numbers here and get values from CSS
		var height = $('#svg_source_container').height() - 80;
		$('#svg_source_textarea').css('height', height);
	};
	
	var saveSourceEditor = function(){
		if (!editingsource) return;

		var saveChanges = function() {
			svgCanvas.clearSelection();
			hideSourceEditor();
			zoomImage();
			populateLayers();
			setTitle(svgCanvas.getImageTitle());
		}

		if (!svgCanvas.setSvgString($('#svg_source_textarea').val())) {
			$.confirm(uiStrings.QerrorsRevertToSource, function(ok) {
				if(!ok) return false;
				saveChanges();
			});
		} else {
			saveChanges();
		}
		
	};
	
	var setTitle = function(title) {
		var editor_title = $('title:first').text().split(':')[0];
		var new_title = editor_title + (title?': ' + title:'');
		$('title:first').text(new_title);
	}
	
	var saveDocProperties = function(){
		// set title
		var new_title = $('#canvas_title').val();
		setTitle(new_title);
		svgCanvas.setImageTitle(new_title);
	
		// update resolution
		var x = parseInt($('#canvas_width').val());
		var y = parseInt($('#canvas_height').val());
		if(isNaN(x) || isNaN(y)) {
			x ='fit';
		}
		if(!svgCanvas.setResolution(x,y)) {
			$.alert(uiStrings.noContentToFitTo);
			return false;
		}
		
		// set image save option
		curPrefs.img_save = $('#image_save_opts :checked').val();
		$.pref('img_save',curPrefs.img_save);
		
		// set background
		var color = $('#bg_blocks div.cur_background').css('background') || '#FFF';
		setBackground(color, $('#canvas_bg_url').val());
		
		// set language
		var lang = $('#lang_select').val();
		if(lang != curPrefs.lang) {
			put_locale(svgCanvas, lang);
		}
		
		// set icon size
		setIconSize($('#iconsize').val());
		
		hideDocProperties();
	};
	
	function setBackground(color, url) {
		if(color == curPrefs.bg_color && url == curPrefs.bg_url) return;
		$.pref('bg_color', color);
		$.pref('bg_url', url);
		$('#svgcanvas').css('background',color);
		if(url) {
			if(!$('#background_img').length) {
				$('<div id="background_img"><img src="'+url+'" style="width:100%"></div>')
					.prependTo('#svgcanvas');
			} else {
				$('#background_img img').attr('src',url);
			}
		} else {
			$('#background_img').remove();
		}
	}

	var setIconSize = function(size) {
		if(size == curPrefs.size) return;
		$.pref('iconsize', size);
		$('#iconsize').val(size);
		var icon_sizes = { s:16, m:24, l:32, xl:48 };
		var size_num = icon_sizes[size];
		
		// Change icon size
		$('.tool_button, .push_button, .tool_button_current, .tool_button_disabled, .tool_flyout_button, #url_notice')
		.find('> svg').each(function() {
			this.setAttribute('width',size_num);
			this.setAttribute('height',size_num);
		});
		
		$.resizeSvgIcons({
			'.flyout_arrow_horiz svg': size_num / 3,
			'#logo a > svg': size_num * 1.3
		});
		if(size != 's') {
			$.resizeSvgIcons({'#layerbuttons svg': size_num * .6});
		}
		
		// Note that all rules will be prefixed with '#svg_editor' when parsed
		var cssResizeRules = {
			".tool_button,\
			.push_button,\
			.tool_button_current,\
			.tool_button_disabled,\
			#tools_rect .tool_flyout_button,\
			#tools_ellipse .tool_flyout_button": {
				'width': {s: '16px', l: '32px', xl: '48px'},
				'height': {s: '16px', l: '32px', xl: '48px'},
				'padding': {s: '1px', l: '2px', xl: '3px'}
			},
			".tool_sep": {
				'height': {s: '16px', l: '32px', xl: '48px'},
				'margin': {s: '2px 2px', l: '2px 5px', xl: '2px 8px'}
			},
			"#tools_top": {
				'left': {s: '27px', l: '50px', xl: '70px'},
				'height': {s: '50px', l: '88px', xl: '125px'}
			},
			"#tools_left": {
				'width': {s: '26px', l: '34px', xl: '42px'},
				'top': {s: '50px', l: '87px', xl: '125px'}
			},
			"div#workarea": {
				'left': {s: '27px', l: '46px', xl: '65px'},
				'top': {s: '50px', l: '88px', xl: '125px'},
				'bottom': {s: '51px', l: '68px', xl: '75px'}
			},
			"#tools_bottom": {
				'left': {s: '27px', l: '46px', xl: '65px'},
				'height': {s: '52px', l: '68px', xl: '75px'}
			},
			"#tools_top input, #tools_bottom input": {
				'margin-top': {s: '2px', l: '4px', xl: '5px'},
				'height': {s: 'auto', l: 'auto', xl: 'auto'},
				'border': {s: '1px solid #555', l: 'auto', xl: 'auto'},
				'font-size': {s: '.9em', l: '2em', xl: '2.5em'}
			},
			"#zoom_panel": {
				'margin-top': {s: '3px', l: '4px', xl: '5px'},
			},
			"#copyright, #tools_bottom .label": {
				'font-size': {l: '1.5em', xl: '2em'},
				'line-height': {s: '15px'}
			},
			"#tools_bottom_2": {
				'width': {l: '295px', xl: '355px'}
			},
			"#tools_top > div, #tools_top": {
				'line-height': {s: '17px', l: '34px', xl: '50px'}
			}, 
			"div.toolset": {
				'height': {s: '25px', l: '43px', xl: '64px'}
			}, 
			".dropdown button": {
				'height': {s: '18px', l: '34px', xl: '40px'},
				'margin-top': {s: '3px'}
			},
			"#tools_top label, #tools_bottom label": {
				'font-size': {s: '1em', l: '1.5em', xl: '2em'},
				'margin-top': {s: '1px', l: '3px', xl: '5px'}
			}, 
			"#tool_bold, #tool_italic": {
				'font-size': {s: '1.5em', l: '3em', xl: '4.5em'}
			},
			"#sidepanels": {
				'top': {s: '50px', l: '88px', xl: '125px'},
				'bottom': {s: '51px', l: '68px', xl: '65px'},
			},
			'#layerbuttons': {
				'width': {l: '130px', xl: '175px'},
				'height': {l: '24px', xl: '30px'}
			},
			'#layerlist': {
				'width': {l: '128px', xl: '150px'}
			},			
			'.layer_button': {
				'width': {l: '19px', xl: '28px'},
				'height': {l: '19px', xl: '28px'}
			},
			".flyout_arrow_horiz": {
				'left': {s: '-5px', l: '5px', xl: '14px'},
				'top': {s: '-13px', l: '-13px', xl: '-20px'}
			},
			"input.spin-button": {
				'background-image': {l: "url('images/spinbtn_updn_big.png')", xl: "url('images/spinbtn_updn_big.png')"},
				'background-position': {l: '100% -5px', xl: '100% -2px'},
				'padding-right': {l: '24px', xl: '24px' }
			},
			"input.spin-button.up": {
				'background-position': {l: '100% -45px', xl: '100% -42px'}
			},
			"input.spin-button.down": {
				'background-position': {l: '100% -85px', xl: '100% -82px'}
			}
		};
		
		var rule_elem = $('#tool_size_rules');
		if(!rule_elem.length) {
			rule_elem = $('<style id="tool_size_rules"><\/style>').appendTo('head');
		} else {
			rule_elem.empty();
		}
		
		if(size != 'm') {
			var style_str = '';
			$.each(cssResizeRules, function(selector, rules) {
				selector = '#svg_editor ' + selector.replace(/,/g,', #svg_editor');
				style_str += selector + '{';
				$.each(rules, function(prop, values) {
					if(values[size]) {
						style_str += (prop + ':' + values[size] + ';');
					}
				});
				style_str += '}';
			});
			rule_elem.text(style_str);
		}
		
		var pos = $('#tools_rect_show').offset();
		$('#tools_rect').css({'left': pos.left, 'top': pos.top});
		pos = $('#tools_ellipse_show').offset();
		$('#tools_ellipse').css({'left': pos.left, 'top': pos.top});
	}

	var cancelOverlays = function() {
		$('#dialog_box').hide();
		if (!editingsource && !docprops) return;

		if (editingsource) {
			var oldString = svgCanvas.getSvgString();
			if (oldString != $('#svg_source_textarea').val()) {
				$.confirm(uiStrings.QignoreSourceChanges, function(ok) {
					if(ok) hideSourceEditor();
				});
			} else {
				hideSourceEditor();
			}
		}
		else if (docprops) {
			hideDocProperties();
		}

	};

	var hideSourceEditor = function(){
		$('#svg_source_editor').hide();
		editingsource = false;
		$('#svg_source_textarea').blur();
	};
	
	var hideDocProperties = function(){
		$('#svg_docprops').hide();
		$('#canvas_width,#canvas_height').removeAttr('disabled');
		$('#resolution')[0].selectedIndex = 0;
		$('#image_save_opts input').val([curPrefs.img_save]);
		docprops = false;
	};
	
	// TODO: add canvas-centering code in here
	$(window).resize(function(evt) {
		if (!editingsource) return;
		properlySourceSizeTextArea();
	});
	
	$('#url_notice').click(function() {
		$.alert(this.title);
	});
	
	$('#change_image_url').click(promptImgURL);
	
	function promptImgURL() {
		$.prompt(uiStrings.enterNewImgURL, default_img_url, function(url) {
			if(url) setImageURL(url);
		});
	}

	function setImageURL(url) {
		if(!url) url = default_img_url;
		svgCanvas.setImageURL(url);
		$('#image_url').val(url);
		
		if(url.indexOf('data:') === 0) {
			// data URI found
			$('#image_url').hide();
			$('#change_image_url').show();
		} else {
			// regular URL
			
			svgCanvas.embedImage(url, function(datauri) {
				if(!datauri) {
					// Couldn't embed, so show warning
					$('#url_notice').show();
				} else {
					$('#url_notice').hide();
				}
				default_img_url = url;
			});
			$('#image_url').show();
			$('#change_image_url').hide();
		}
	}

	// added these event handlers for all the push buttons so they
	// behave more like buttons being pressed-in and not images
	(function() {
		var toolnames = ['clear','open','save','source','delete','delete_multi','paste','clone','clone_multi','move_top','move_bottom'];
		var all_tools = '';
		var cur_class = 'tool_button_current';
		
		$.each(toolnames, function(i,item) {
			all_tools += '#tool_' + item + (i==toolnames.length-1?',':'');
		});
		
		$(all_tools).mousedown(function() {
			$(this).addClass(cur_class);
		}).bind('mousedown mouseout', function() {
			$(this).removeClass(cur_class);
		});
		
		$('#tool_undo, #tool_redo').mousedown(function(){ 
			if (!$(this).hasClass('tool_button_disabled')) $(this).addClass(cur_class);
		}).bind('mousedown mouseout',function(){
			$(this).removeClass(cur_class);}
		);
	}());

	$('#workarea').bind("mousewheel DOMMouseScroll", function(e){
		if(!e.shiftKey) return;
		e.preventDefault();
		var off = $('#svgcanvas').offset();
		var zoom = svgCanvas.getZoom();
		var bbox = {
			'x': (e.pageX - off.left)/zoom,
			'y': (e.pageY - off.top)/zoom,
			'width': 0,
			'height': 0
		};
		
		// Respond to mouse wheel in IE/Webkit/Opera.
		// (It returns up/dn motion in multiples of 120)
		if(e.wheelDelta) {
			if (e.wheelDelta >= 120) {
				bbox.factor = 2;
			} else if (e.wheelDelta <= -120) {
				bbox.factor = .5;
			}
		} else if(e.detail) {
			if (e.detail > 0) {
				bbox.factor = .5;
			} else if (e.detail < 0) {
				bbox.factor = 2;			
			}				
		}
		
		if(!bbox.factor) return;
		zoomChanged(window, bbox);
	});

	// switch modifier key in tooltips if mac
	// NOTE: This code is not used yet until I can figure out how to successfully bind ctrl/meta
	// in Opera and Chrome
	if (isMac) {
		var shortcutButtons = ["tool_clear", "tool_save", "tool_source", "tool_undo", "tool_redo", "tool_clone"];
		var i = shortcutButtons.length;
		while (i--) {
			var button = document.getElementById(shortcutButtons[i]);
			var title = button.title;
			var index = title.indexOf("Ctrl+");
			button.title = [title.substr(0,index), "Cmd+", title.substr(index+5)].join('');
		}
	}
	
	// TODO: go back to the color boxes having white background-color and then setting
	//       background-image to none.png (otherwise partially transparent gradients look weird)	
	var colorPicker = function(elem) {
		var picker = elem.attr('id') == 'stroke_color' ? 'stroke' : 'fill';
		var opacity = (picker == 'stroke' ? $('#stroke_opacity') : $('#fill_opacity'));
		var paint = (picker == 'stroke' ? strokePaint : fillPaint);
		var title = (picker == 'stroke' ? 'Pick a Stroke Paint and Opacity' : 'Pick a Fill Paint and Opacity');
		var was_none = false;
		if (paint.type == "none") {
			// if it was none, then set to solid white
			paint = new $.jGraduate.Paint({solidColor: 'ffffff'});
			was_none = true;
		}
		var pos = elem.position();
		$("#color_picker")
			.draggable({cancel:'.jPicker_table,.jGraduate_lgPick'})
			.css({'left': pos.left, 'bottom': 50 - pos.top})
			.jGraduate(
			{ 
				paint: paint,
				window: { pickerTitle: title },
				images: { clientPath: "jgraduate/images/" },
			},
			function(p) {
				paint = new $.jGraduate.Paint(p);
				
				var oldgrad = document.getElementById("gradbox_"+picker);
				var svgbox = oldgrad.parentNode;
				var rectbox = svgbox.firstChild;
				
				if (paint.type == "linearGradient") {
					svgbox.removeChild(oldgrad);
					var newgrad = svgbox.appendChild(document.importNode(paint.linearGradient, true));
					svgCanvas.fixOperaXML(newgrad, paint.linearGradient)
					newgrad.id = "gradbox_"+picker;
					rectbox.setAttribute("fill", "url(#gradbox_" + picker + ")");
				}
				else {
					rectbox.setAttribute("fill", "#" + paint.solidColor);
				}
				opacity.html(paint.alpha + " %");

				if (picker == 'stroke') {
					svgCanvas.setStrokePaint(paint, true);
				}
				else {
					svgCanvas.setFillPaint(paint, true);
				}
				updateToolbar();
				$('#color_picker').hide();
			},
			function(p) {
				$('#color_picker').hide();
			});
	};

	var updateToolButtonState = function() {
		var bNoFill = (svgCanvas.getFillColor() == 'none');
		var bNoStroke = (svgCanvas.getStrokeColor() == 'none');
		var buttonsNeedingStroke = [ '#tool_path', '#tool_line' ];
		var buttonsNeedingFillAndStroke = [ '#tools_rect_show', '#tools_ellipse_show', '#tool_text' ];
		if (bNoStroke) {
			for (index in buttonsNeedingStroke) {
				var button = buttonsNeedingStroke[index];
				if ($(button).hasClass('tool_button_current')) {
					clickSelect();
				}
				$(button).removeClass('tool_button').addClass('tool_button_disabled');
			}
		}
		else {
			for (index in buttonsNeedingStroke) {
				var button = buttonsNeedingStroke[index];
				$(button).removeClass('tool_button_disabled').addClass('tool_button');
			}
		}

		if (bNoStroke && bNoFill) {
			for (index in buttonsNeedingFillAndStroke) {
				var button = buttonsNeedingFillAndStroke[index];
				if ($(button).hasClass('tool_button_current')) {
					clickSelect();
				}
				$(button).removeClass('tool_button').addClass('tool_button_disabled');
			}
		}
		else {
			for (index in buttonsNeedingFillAndStroke) {
				var button = buttonsNeedingFillAndStroke[index];
				$(button).removeClass('tool_button_disabled').addClass('tool_button');
			}
		}
	};

	// set up gradients to be used for the buttons
	var svgdocbox = new DOMParser().parseFromString(
		'<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#FF0000"/>\
		<linearGradient id="gradbox_">\
				<stop stop-color="#000" offset="0.0"/>\
				<stop stop-color="#FF0000" offset="1.0"/>\
		</linearGradient></svg>', 'text/xml');

	var boxgrad = svgdocbox.getElementById('gradbox_');
	boxgrad.id = 'gradbox_fill';
	svgdocbox.documentElement.setAttribute('width',16.5);
	$('#fill_color').append( document.importNode(svgdocbox.documentElement,true) );
	
	boxgrad.id = 'gradbox_stroke';	
	svgdocbox.documentElement.setAttribute('width',16.5);
	$(svgdocbox.documentElement.firstChild).attr('fill', '#000000');
	$('#stroke_color').append( document.importNode(svgdocbox.documentElement,true) );
	
	// Use this SVG elem to test vectorEffect support
	var test_el = svgdocbox.documentElement.firstChild;
	test_el.setAttribute('style','vector-effect:non-scaling-stroke');
	var supportsNonSS = (test_el.style.vectorEffect == 'non-scaling-stroke');
	test_el.removeAttribute('style');
	
	// Test for embedImage support (use timeout to not interfere with page load)
	setTimeout(function() {
		svgCanvas.embedImage('images/logo.png', function(datauri) {
			if(!datauri) {
				// Disable option
				$('#image_save_opts [value=embed]').attr('disabled','disabled');
				$('#image_save_opts input').val(['ref']);
				curPrefs.img_save = 'ref';
				$('#image_opt_embed').css('color','#666').attr('title',uiStrings.featNotSupported);
			}
		});
	},1000);
		
	$('#fill_color').click(function(){
		colorPicker($(this));
		updateToolButtonState();
	});

	$('#stroke_color').click(function(){
		colorPicker($(this));
		updateToolButtonState();
	});

	$('#tools_rect_show').mousedown(function(evt){
		$('#tools_rect').show();
		// this prevents the 'image drag' behavior in Firefox
		evt.preventDefault();
	});
	$('#tools_rect').mouseleave(function(){$('#tools_rect').fadeOut();});

	$('#tool_move_top').mousedown(function(evt){
		$('#tools_stacking').show();
		evt.preventDefault();
	});

	$('#tools_ellipse_show').mousedown(function(evt){
		$('#tools_ellipse').show();
		// this prevents the 'image drag' behavior in Firefox
		evt.preventDefault();
	});
	$('#tools_ellipse').mouseleave(function() {$('#tools_ellipse').fadeOut();});

	$('.tool_flyout_button').mouseover(function() {
		$(this).addClass('tool_flyout_button_current');
	}).mouseout(function() {
		$(this).removeClass('tool_flyout_button_current');
	});
	
	$('.layer_button').mousedown(function() { 
		$(this).addClass('layer_buttonpressed');
	}).mouseout(function() {
		$(this).removeClass('layer_buttonpressed');
	}).mouseup(function() {
		$(this).removeClass('layer_buttonpressed');
	});

	$('.push_button').mousedown(function() { 
		if (!$(this).hasClass('tool_button_disabled')) {
			$(this).addClass('push_button_pressed');
		}
	}).mouseout(function() {
		$(this).removeClass('push_button_pressed');
	}).mouseup(function() {
		$(this).removeClass('push_button_pressed');
	});
	
	$('#layer_new').click(function() {
		var curNames = new Array(svgCanvas.getNumLayers());
		for (var i = 0; i < curNames.length; ++i) { curNames[i] = svgCanvas.getLayer(i); }
		
		var j = (curNames.length+1);
		var uniqName = uiStrings.layer + " " + j;
		while ($.inArray(uniqName, curNames) != -1) {
			j++;
			uniqName = uiStrings.layer + " " + j;
		}
		$.prompt(uiStrings.enterUniqueLayerName,uniqName, function(newName) {
			if (!newName) return;
			if ($.inArray(newName, curNames) != -1) {
				$.alert(uiStrings.dupeLayerName);
				return;
			}
			svgCanvas.createLayer(newName);
			updateContextPanel();
			populateLayers();
			$('#layerlist tr.layer').removeClass("layersel");
			$('#layerlist tr.layer:first').addClass("layersel");
		});
	});
	
	$('#layer_delete').click(function() {
		if (svgCanvas.deleteCurrentLayer()) {
			updateContextPanel();
			populateLayers();
			// This matches what SvgCanvas does
			// TODO: make this behavior less brittle (svg-editor should get which
			// layer is selected from the canvas and then select that one in the UI)
			$('#layerlist tr.layer').removeClass("layersel");
			$('#layerlist tr.layer:first').addClass("layersel");
		}
	});
	
	$('#layer_up').click(function() {
		// find index position of selected option
		var curIndex = $('#layerlist tr.layersel').prevAll().length;
		if (curIndex > 0) {
			var total = $('#layerlist tr.layer').length;
			curIndex--;
			svgCanvas.setCurrentLayerPosition(total-curIndex-1);
			populateLayers();
			$('#layerlist tr.layer').removeClass("layersel");
			$('#layerlist tr.layer:eq('+curIndex+')').addClass("layersel");
		}
	});

	$('#layer_down').click(function() {
		// find index position of selected option
		var curIndex = $('#layerlist tr.layersel').prevAll().length;
		var total = $('#layerlist tr.layer').length;
		if (curIndex < total-1) {
			curIndex++;
			svgCanvas.setCurrentLayerPosition(total-curIndex-1);
			populateLayers();
			$('#layerlist tr.layer').removeClass("layersel");
			$('#layerlist tr.layer:eq('+curIndex+')').addClass("layersel");
		}
	});

	$('#layer_rename').click(function() {
		var curIndex = $('#layerlist tr.layersel').prevAll().length;
		var oldName = $('#layerlist tr.layersel td.layername').text();
		$.prompt(uiStrings.enterNewLayerName,"", function(newName) {
			if (!newName) return;
			if (oldName == newName) {
				$.alert(uiStrings.layerHasThatName);
				return;
			}
	
			var curNames = new Array(svgCanvas.getNumLayers());
			for (var i = 0; i < curNames.length; ++i) { curNames[i] = svgCanvas.getLayer(i); }
			if ($.inArray(newName, curNames) != -1) {
				$.alert(uiStrings.layerHasThatName);
				return;
			}
			
			svgCanvas.renameCurrentLayer(newName);
			populateLayers();
			$('#layerlist tr.layer').removeClass("layersel");
			$('#layerlist tr.layer:eq('+curIndex+')').addClass("layersel");
		});
	});
	
	var SIDEPANEL_MAXWIDTH = 300;
	var SIDEPANEL_OPENWIDTH = 150;
	var sidedrag = -1, sidedragging = false;
	$('#sidepanel_handle')
		.mousedown(function(evt) {sidedrag = evt.pageX;})
		.mouseup(function(evt) {
			if (!sidedragging) toggleSidePanel();
			sidedrag = -1;
			sidedragging = false;
		});
	$('#svg_editor')
		.mouseup(function(){sidedrag=-1;})
		.mouseout(function(evt){
			if (sidedrag == -1) return;
			// if we've moused out of the browser window, then we can stop dragging 
			// and close the drawer
			if (evt.pageX > this.clientWidth) {
				sidedrag = -1;
				toggleSidePanel(true);
			}
		})
		.mousemove(function(evt) {
			if (sidedrag == -1) return;
			sidedragging = true;
			var deltax = sidedrag - evt.pageX;

			var sidepanels = $('#sidepanels');
			var sidewidth = parseInt(sidepanels.css('width'));
			if (sidewidth+deltax > SIDEPANEL_MAXWIDTH) {
				deltax = SIDEPANEL_MAXWIDTH - sidewidth;
				sidewidth = SIDEPANEL_MAXWIDTH;
			}
			else if (sidewidth+deltax < 2) {
				deltax = 2 - sidewidth;
				sidewidth = 2;
			}

			if (deltax == 0) return;
			sidedrag -= deltax;

			var workarea = $('#workarea');
			var layerpanel = $('#layerpanel');
			workarea.css('right', parseInt(workarea.css('right'))+deltax);
			sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
			layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
			centerCanvasIfNeeded();
	});
	
	// if width is non-zero, then fully close it, otherwise fully open it
	// the optional close argument forces the side panel closed
	var toggleSidePanel = function(close){
		var w = parseInt($('#sidepanels').css('width'));
		var deltax = (w > 2 || close ? 2 : SIDEPANEL_OPENWIDTH) - w;
		var workarea = $('#workarea');
		var sidepanels = $('#sidepanels');
		var layerpanel = $('#layerpanel');
		workarea.css('right', parseInt(workarea.css('right'))+deltax);
		sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
		layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
		centerCanvasIfNeeded();
	};
	
	// this function highlights the layer passed in (by fading out the other layers)
	// if no layer is passed in, this function restores the other layers
	var toggleHighlightLayer = function(layerNameToHighlight) {
		var curNames = new Array(svgCanvas.getNumLayers());
		for (var i = 0; i < curNames.length; ++i) { curNames[i] = svgCanvas.getLayer(i); }
	
		if (layerNameToHighlight) {
			for (var i = 0; i < curNames.length; ++i) {
				if (curNames[i] != layerNameToHighlight) {
					svgCanvas.setLayerOpacity(curNames[i], 0.5);
				}
			}
		}
		else {
			for (var i = 0; i < curNames.length; ++i) {
				svgCanvas.setLayerOpacity(curNames[i], 1.0);
			}
		}
	};

	var populateLayers = function(){
		var layerlist = $('#layerlist tbody');
		var selLayerNames = $('#selLayerNames');
		layerlist.empty();
		selLayerNames.empty();
		var currentlayer = svgCanvas.getCurrentLayer();
		var layer = svgCanvas.getNumLayers();
		var icon = $.getSvgIcon('eye');
		// we get the layers in the reverse z-order (the layer rendered on top is listed first)
		while (layer--) {
			var name = svgCanvas.getLayer(layer);
			// contenteditable=\"true\"
			var appendstr = "<tr class=\"layer";
			if (name == currentlayer) {
				appendstr += " layersel"
			}
			appendstr += "\">";
			
			if (svgCanvas.getLayerVisibility(name)) {
				appendstr += "<td class=\"layervis\"/><td class=\"layername\" >" + name + "</td></tr>";
			}
			else {
				appendstr += "<td class=\"layervis layerinvis\"/><td class=\"layername\" >" + name + "</td></tr>";
			}
			layerlist.append(appendstr);
			selLayerNames.append("<option value=\"" + name + "\">" + name + "</option>");
		}
		if(icon !== undefined) {
			var copy = icon.clone();
			$('td.layervis',layerlist).append(icon.clone());
			$.resizeSvgIcons({'td.layervis .svg_icon':14});
		}
		// handle selection of layer
		$('#layerlist td.layername')
			.click(function(evt){
				$('#layerlist tr.layer').removeClass("layersel");
				var row = $(this.parentNode);
				row.addClass("layersel");
				svgCanvas.setCurrentLayer(this.textContent);
				evt.preventDefault();
			})
			.mouseover(function(evt){
				$(this).css({"font-style": "italic", "color":"blue"});
				toggleHighlightLayer(this.textContent);
			})
			.mouseout(function(evt){
				$(this).css({"font-style": "normal", "color":"black"});
				toggleHighlightLayer();
			});
		$('#layerlist td.layervis').click(function(evt){
			var row = $(this.parentNode).prevAll().length;
			var name = $('#layerlist tr.layer:eq(' + row + ') td.layername').text();
			var vis = $(this).hasClass('layerinvis');
			svgCanvas.setLayerVisibility(name, vis);
			if (vis) {
				$(this).removeClass('layerinvis');
			}
			else {
				$(this).addClass('layerinvis');
			}
		});
		
		// if there were too few rows, let's add a few to make it not so lonely
		var num = 5 - $('#layerlist tr.layer').size();
		while (num-- > 0) {
			// FIXME: there must a better way to do this
			layerlist.append("<tr><td style=\"color:white\">_</td><td/></tr>");
		}
	};
	populateLayers();

	function changeResolution(x,y) {
		var zoom = svgCanvas.getResolution().zoom;
		setResolution(x * zoom, y * zoom);
	}
	
	var centerCanvasIfNeeded = function() {
		// this centers the canvas in the workarea if it's small enough
		var wa = {w: parseInt($('#workarea').css('width')), 
				  h: parseInt($('#workarea').css('height'))};
		var ca = {w: parseInt($('#svgcanvas').css('width')), 
				  h: parseInt($('#svgcanvas').css('height'))};
		if (wa.w > ca.w) {
			$('#svgcanvas').css({'left': (wa.w-ca.w)/2});
		}
		if (wa.h > ca.h) {
			$('#svgcanvas').css({'top': (wa.h-ca.h)/2});
		}
	};
	
	$(window).resize( centerCanvasIfNeeded );

	function stepFontSize(elem, step) {
		var orig_val = elem.value-0;
		var sug_val = orig_val + step;
		var increasing = sug_val >= orig_val;
		if(step === 0) return orig_val;
		
		if(orig_val >= 24) {
			if(increasing) {
				return Math.round(orig_val * 1.1);
			} else {
				return Math.round(orig_val / 1.1);
			}
		} else if(orig_val <= 1) {
			if(increasing) {
				return orig_val * 2;			
			} else {
				return orig_val / 2;
			}
		} else {
			return sug_val;
		}
	}
	
	function stepZoom(elem, step) {
		var orig_val = elem.value-0;
		if(orig_val === 0) return 100;
		var sug_val = orig_val + step;
		if(step === 0) return orig_val;
		
		if(orig_val >= 100) {
			return sug_val;
		} else {
			if(sug_val >= orig_val) {
				return orig_val * 2;
			} else {
				return orig_val / 2;
			}
		}
	}
	
	function setResolution(w, h, center) {
		w-=0; h-=0;
		$('#svgcanvas').css( { 'width': w, 'height': h } );
		$('#canvas_width').val(w);
		$('#canvas_height').val(h);

		centerCanvasIfNeeded();
		
		if(center) {
			var w_area = $('#workarea');
			var scroll_y = h/2 - w_area.height()/2;
			var scroll_x = w/2 - w_area.width()/2;
			w_area[0].scrollTop = scroll_y;
			w_area[0].scrollLeft = scroll_x;
		}
	}
	

	$('#resolution').change(function(){
		var wh = $('#canvas_width,#canvas_height');
		if(!this.selectedIndex) {
			if($('#canvas_width').val() == 'fit') {
				wh.removeAttr("disabled").val(100);
			}
		} else if(this.value == 'content') {
			wh.val('fit').attr("disabled","disabled");
		} else {
			var dims = this.value.split('x');
			$('#canvas_width').val(dims[0]);
			$('#canvas_height').val(dims[1]);
			wh.removeAttr("disabled");
		}
	});

	//Prevent browser from erroneously repopulating fields
	$('input,select').attr("autocomplete","off");
	
	// Associate all button actions as well as non-button keyboard shortcuts
	var Actions = function() {
		// sel:'selector', fn:function, evt:'event', key:[key, preventDefault, NoDisableInInput]
		var tool_buttons = [
			{sel:'#tool_select', fn: clickSelect, evt: 'click', key: 1},
			{sel:'#tool_fhpath', fn: clickFHPath, evt: 'click', key: 2},
			{sel:'#tool_line', fn: clickLine, evt: 'click', key: 3},
			{sel:'#tool_square', fn: clickSquare, evt: 'mouseup', key: 'Shift+4'},
			{sel:'#tool_rect', fn: clickRect, evt: 'mouseup', key: 4},
			{sel:'#tool_fhrect', fn: clickFHRect, evt: 'mouseup'},
			{sel:'#tool_circle', fn: clickCircle, evt: 'mouseup', key: 'Shift+5'},
			{sel:'#tool_ellipse', fn: clickEllipse, evt: 'mouseup', key: 5},
			{sel:'#tool_fhellipse', fn: clickFHEllipse, evt: 'mouseup'},
			{sel:'#tool_path', fn: clickPath, evt: 'click', key: 6},
			{sel:'#tool_text', fn: clickText, evt: 'click', key: 7},
			{sel:'#tool_image', fn: clickImage, evt: 'mouseup', key: 8},
			{sel:'#tool_zoom', fn: clickZoom, evt: 'mouseup', key: 9},
			{sel:'#tool_clear', fn: clickClear, evt: 'click', key: [modKey+'N', true]},
			{sel:'#tool_save', fn: function() { editingsource?saveSourceEditor():clickSave()}, evt: 'click', key: [modKey+'S', true]},
			{sel:'#tool_open', fn: clickOpen, evt: 'click', key: [modKey+'O', true]},
			{sel:'#tool_source', fn: showSourceEditor, evt: 'click', key: ['U', true]},
			{sel:'#tool_wireframe', fn: clickWireframe, evt: 'click', key: ['F', true]},
			{sel:'#tool_source_cancel,#svg_source_overlay,#tool_docprops_cancel', fn: cancelOverlays, evt: 'click', key: ['esc', false, false], hidekey: true},
			{sel:'#tool_source_save', fn: saveSourceEditor, evt: 'click'},
			{sel:'#tool_docprops_save', fn: saveDocProperties, evt: 'click'},
			{sel:'#tool_docprops', fn: showDocProperties, evt: 'click', key: [modKey+'I', true]},
			{sel:'#tool_delete,#tool_delete_multi', fn: deleteSelected, evt: 'click', key: ['del/backspace', true]},
			{sel:'#tool_reorient', fn: reorientPath, evt: 'click'},
			{sel:'#tool_node_link', fn: linkControlPoints, evt: 'click'},
			{sel:'#tool_node_clone', fn: clonePathNode, evt: 'click'},
			{sel:'#tool_node_delete', fn: deletePathNode, evt: 'click'},
			{sel:'#tool_move_top', fn: moveToTopSelected, evt: 'click', key: 'shift+up'},
			{sel:'#tool_move_bottom', fn: moveToBottomSelected, evt: 'click', key: 'shift+down'},
			{sel:'#tool_topath', fn: convertToPath, evt: 'click'},
			{sel:'#tool_undo', fn: clickUndo, evt: 'click', key: [modKey+'Z', true]},
			{sel:'#tool_redo', fn: clickRedo, evt: 'click', key: [modKey+'Y', true]},
			{sel:'#tool_clone,#tool_clone_multi', fn: clickClone, evt: 'click', key: [modKey+'C', true]},
			{sel:'#tool_group', fn: clickGroup, evt: 'click', key: [modKey+'G', true]},
			{sel:'#tool_ungroup', fn: clickGroup, evt: 'click'},
			{sel:'[id^=tool_align]', fn: clickAlign, evt: 'click'},
			// these two lines are required to make Opera work properly with the flyout mechanism
			{sel:'#tools_rect_show', fn: clickRect, evt: 'click'},
			{sel:'#tools_ellipse_show', fn: clickEllipse, evt: 'click'},
			{sel:'#tool_bold', fn: clickBold, evt: 'mousedown'},
			{sel:'#tool_italic', fn: clickItalic, evt: 'mousedown'},
			{sel:'#sidepanel_handle', fn: toggleSidePanel, key: [modKey+'X']},
			
			// Shortcuts not associated with buttons
			{key: 'shift+left', fn: function(){rotateSelected(0)}},
			{key: 'shift+right', fn: function(){rotateSelected(1)}},
			{key: 'shift+O', fn: selectPrev},
			{key: 'shift+P', fn: selectNext},
			{key: ['ctrl+up', true], fn: function(){zoomImage(2);}},
			{key: ['ctrl+down', true], fn: function(){zoomImage(.5);}},
			{key: ['up', true], fn: function(){moveSelected(0,-1);}},
			{key: ['down', true], fn: function(){moveSelected(0,1);}},
			{key: ['left', true], fn: function(){moveSelected(-1,0);}},
			{key: ['right', true], fn: function(){moveSelected(1,0);}}
		];
		
		// Tooltips not directly associated with a single function
		var key_assocs = {
			'4/Shift+4': '#tools_rect_show',
			'5/Shift+5': '#tools_ellipse_show'
		};
	
		return {
			setAll: function() {
				$.each(tool_buttons, function(i, opts)  {
					// Bind function to button
					if(opts.sel) {
						var btn = $(opts.sel);
						if(opts.evt) {
							btn[opts.evt](opts.fn);
						}
					}
					// Bind function to shortcut key
					if(opts.key) {
						// Set shortcut based on options
						var keyval, shortcut = '', disInInp = true, fn = opts.fn, pd = false;
						if($.isArray(opts.key)) {
							keyval = opts.key[0];
							if(opts.key.length > 1) pd = opts.key[1];
							if(opts.key.length > 2) disInInp = opts.key[2];
						} else {
							keyval = opts.key;
						}
						keyval += '';
						
						$.each(keyval.split('/'), function(i, key) {
							$(document).bind('keydown', {combi: key, disableInInput: disInInp}, function(e) {
								fn();
								if(pd) e.preventDefault();
							});
						});
						
						// Put shortcut in title
						if(opts.sel && !opts.hidekey) {
							var new_title = btn.attr('title').split('[')[0] + '[' + keyval + ']';
							key_assocs[keyval] = opts.sel;
							btn.attr('title', new_title);
						}
					}
				});
			
				// Misc additional actions
				
				// Make "return" keypress trigger the change event
				$('.attr_changer, #image_url').bind('keydown', {combi:'return'}, 
					function(evt) {$(this).change();evt.preventDefault();}
				);
				
				$('#tool_zoom').dblclick(dblclickZoom);
			},
			setTitles: function() {
				$.each(key_assocs, function(keyval, sel)  {
					$(sel).each(function() {
						var t = this.title.split(' [')[0];
						var key_str = '';
						// Shift+Up
						$.each(keyval.split('/'), function(i, key) {
							var mod_bits = key.split('+'), mod = '';
							if(mod_bits.length > 1) {
								mod = mod_bits[0] + '+';
								key = mod_bits[1];
							}
							key_str += (i?'/':'') + mod + (uiStrings['key_'+key] || key);
						});
						this.title = t +' ['+key_str+']';
					});
				});
			}
		};
	}();
	
	Actions.setAll();

	$('#rect_rx').SpinButton({ min: 0, max: 1000, step: 1, callback: changeRectRadius });
	$('#stroke_width').SpinButton({ min: 0, max: 99, step: 1, callback: changeStrokeWidth });
	$('#angle').SpinButton({ min: -180, max: 180, step: 5, callback: changeRotationAngle });
	$('#font_size').SpinButton({ step: 1, min: 0.001, stepfunc: stepFontSize, callback: changeFontSize });
	$('#group_opacity').SpinButton({ step: 5, min: 0, max: 100, callback: changeOpacity });
	$('#zoom').SpinButton({ min: 0.001, max: 10000, step: 50, stepfunc: stepZoom, callback: changeZoom });
	
	svgCanvas.setIconSize = setIconSize;
	
	svgCanvas.setLang = function(lang, strings) {
		curPrefs.lang = lang;
		$.pref('lang', lang);
		$('#lang_select').val(lang);
		if(strings) {
			// $.extend will only replace the given strings
			var oldLayerName = $('#layerlist tr.layersel td.layername').text();
			var rename_layer = (oldLayerName == uiStrings.layer + ' 1');
			
			$.extend(uiStrings,strings);
			svgCanvas.setUiStrings(strings);
			Actions.setTitles();
			
			if(rename_layer) {
				svgCanvas.renameCurrentLayer(uiStrings.layer + ' 1');
				populateLayers();				
			}

		}
	};
	
	svgCanvas.setCustomHandlers = function(opts) {
		if(opts.open) {
			$('#tool_open').show();
			svgCanvas.bind("opened", opts.open);
		}
		if(opts.save) {
			svgCanvas.bind("saved", opts.save);
		}
	}
	
	// set starting resolution (centers canvas)
	setResolution(640,480);
	
//	var revnums = "svg-editor.js ($Rev$) ";
//	revnums += svgCanvas.getVersion();
//	$('#copyright')[0].setAttribute("title", revnums);
	return svgCanvas;
};

// This process starts before document.ready so the icons appear ASAP
(function() {
	$.svgIcons('images/svg_edit_icons.svg', {
		w:24, h:24,
		id_match: false,
		no_img: true,
		fallback_path:'images/',
		fallback:{
			'new_image':'clear.png',
			'save':'save.png',
			'open':'open.png',
			'source':'source.png',
			'docprops':'document-properties.png',
			'wireframe':'wireframe.png',
			
			'undo':'undo.png',
			'redo':'redo.png',
			
			'select':'select.png',
			'pencil':'fhpath.png',
			'pen':'line.png',
			'square':'square.png',
			'rect':'rect.png',
			'fh_rect':'freehand-square.png',
			'circle':'circle.png',
			'ellipse':'ellipse.png',
			'fh_ellipse':'freehand-circle.png',
			'path':'path.png',
			'text':'text.png',
			'image':'image.png',
			'zoom':'zoom.png',
			
			'clone':'clone.png',
			'delete':'delete.png',
			'group':'shape_group.png',
			'ungroup':'shape_ungroup.png',
			'move_top':'move_top.png',
			'move_bottom':'move_bottom.png',
			
			'align_left':'align-left.png',
			'align_center':'align-center',
			'align_right':'align-right',
			'align_top':'align-top',
			'align_middle':'align-middle',
			'align_bottom':'align-bottom',

			'go_up':'go-up.png',
			'go_down':'go-down.png',

			'ok':'save.png',
			'cancel':'cancel.png',
			
			'arrow_right':'flyouth.png',
			'arrow_down':'dropdown.gif'
		},
		placement: {
			'#logo a':'logo',
		
			'#tool_clear,#layer_new':'new_image',
			'#tool_save':'save',
			'#tool_open':'open',
			'#tool_source':'source',
			'#tool_docprops':'docprops',
			'#tool_wireframe':'wireframe',
			
			'#tool_undo':'undo',
			'#tool_redo':'redo',
			
			'#tool_select':'select',
			'#tool_fhpath':'pencil',
			'#tool_line':'pen',
			'#tool_rect,#tools_rect_show':'rect',
			'#tool_square':'square',
			'#tool_fhrect':'fh_rect',
			'#tool_ellipse,#tools_ellipse_show':'ellipse',
			'#tool_circle':'circle',
			'#tool_fhellipse':'fh_ellipse',
			'#tool_path':'path',
			'#tool_text,#layer_rename':'text',
			'#tool_image':'image',
			'#tool_zoom':'zoom',
			
			'#tool_clone,#tool_clone_multi,#tool_node_clone':'clone',
			'#layer_delete,#tool_delete,#tool_delete_multi,#tool_node_delete':'delete',
			'#tool_move_top':'move_top',
			'#tool_move_bottom':'move_bottom',
			'#tool_topath':'to_path',
			'#tool_node_link':'link_controls',
			'#tool_reorient':'reorient',
			'#tool_group':'group',
			'#tool_ungroup':'ungroup',
			
			'#tool_alignleft':'align_left',
			'#tool_aligncenter':'align_center',
			'#tool_alignright':'align_right',
			'#tool_aligntop':'align_top',
			'#tool_alignmiddle':'align_middle',
			'#tool_alignbottom':'align_bottom',
			
			'#url_notice':'warning',
			
			'#layer_up':'go_up',
			'#layer_down':'go_down',
			'#layerlist td.layervis':'eye',
			
			'#tool_source_save,#tool_docprops_save':'ok',
			'#tool_source_cancel,#tool_docprops_cancel':'cancel',
			
			'.flyout_arrow_horiz':'arrow_right',
			'.dropdown button':'arrow_down',
			'#palette .palette_item:first, #fill_bg, #stroke_bg':'no_color'
		},
		resize: {
			'#logo a .svg_icon': 32,
			'.flyout_arrow_horiz .svg_icon': 5,
			'.layer_button .svg_icon, #layerlist td.layervis .svg_icon': 14,
			'.dropdown button .svg_icon': 7,
			'.palette_item:first .svg_icon, #fill_bg .svg_icon, #stroke_bg .svg_icon': 16,
			'.toolbar_button button .svg_icon':16
		},
		callback: function(icons) {
			$('.toolbar_button button > svg').each(function() {
				$(this).parent().prepend(this);
			});
			
			// Use small icons by default if not all left tools are visible
			var tleft = $('#tools_left');
			var min_height = tleft.offset().top + tleft.outerHeight();
			var size = $.pref('iconsize');
			if(size && size != 'm') {
				svgCanvas.setIconSize(size);				
			} else if($(window).height() < min_height) {
				// Make smaller
				svgCanvas.setIconSize('s');
			}
			
			// Load source if given
			var loc = document.location.href;
			if(loc.indexOf('?source=') != -1) {
				var pre = '?source=data:image/svg+xml;base64,';
				var src = loc.substring(loc.indexOf(pre) + pre.length);
				svgCanvas.setSvgString(Utils.decode64(src));				
			}
		}
	});
}());

// This happens when the page is loaded
$(function() {
	svgCanvas = svg_edit_setup();
	put_locale(svgCanvas);
	
	try{
	    json_encode = function(obj){
      //simple partial JSON encoder implementation
      if(window.JSON && JSON.stringify) return JSON.stringify(obj);
      var enc = arguments.callee; //for purposes of recursion
      if(typeof obj == "boolean" || typeof obj == "number"){
          return obj+'' //should work...
      }else if(typeof obj == "string"){
        //a large portion of this is stolen from Douglas Crockford's json2.js
        return '"'+
              obj.replace(
                /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
              , function (a) {
                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
              })
              +'"'; //note that this isn't quite as purtyful as the usualness
      }else if(obj.length){ //simple hackish test for arrayish-ness
        for(var i = 0; i < obj.length; i++){
          obj[i] = enc(obj[i]); //encode every sub-thingy on top
        }
        return "["+obj.join(",")+"]";
      }else{
        var pairs = []; //pairs will be stored here
        for(var k in obj){ //loop through thingys
          pairs.push(enc(k)+":"+enc(obj[k])); //key: value
        }
        return "{"+pairs.join(",")+"}" //wrap in the braces
      }
    }
	  window.addEventListener("message", function(e){
	    var cbid = parseInt(e.data.substr(0, e.data.indexOf(";")));
	    try{
        e.source.postMessage("SVGe"+cbid+";"+json_encode(eval(e.data)), e.origin);
      }catch(err){
        e.source.postMessage("SVGe"+cbid+";error:"+err.message, e.origin);
      }
    }, false)
	}catch(err){
	  window.embed_error = err;
	}
	
});
