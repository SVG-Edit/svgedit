/*
if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}
*/

function svg_edit_setup() {
	var palette = ["#000000","#202020","#404040","#606060","#808080","#a0a0a0","#c0c0c0","#e0e0e0","#ffffff","#800000","#ff0000","#808000","#ffff00","#008000","#00ff00","#008080","#00ffff","#000080","#0000ff","#800080","#ff00ff","#2b0000","#550000","#800000","#aa0000","#d40000","#ff0000","#ff2a2a","#ff5555","#ff8080","#ffaaaa","#ffd5d5","#280b0b","#501616","#782121","#a02c2c","#c83737","#d35f5f","#de8787","#e9afaf","#f4d7d7","#241c1c","#483737","#6c5353","#916f6f","#ac9393","#c8b7b7","#e3dbdb","#2b1100","#552200","#803300","#aa4400","#d45500","#ff6600","#ff7f2a","#ff9955","#ffb380","#ffccaa","#ffe6d5","#28170b","#502d16","#784421","#a05a2c","#c87137","#d38d5f","#deaa87","#e9c6af","#f4e3d7","#241f1c","#483e37","#6c5d53","#917c6f","#ac9d93","#c8beb7","#e3dedb","#2b2200","#554400","#806600","#aa8800","#d4aa00","#ffcc00","#ffd42a","#ffdd55","#ffe680","#ffeeaa","#fff6d5","#28220b","#504416","#786721","#a0892c","#c8ab37","#d3bc5f","#decd87","#e9ddaf","#f4eed7","#24221c","#484537","#6c6753","#918a6f","#aca793","#c8c4b7","#e3e2db","#222b00","#445500","#668000","#88aa00","#aad400","#ccff00","#d4ff2a","#ddff55","#e5ff80","#eeffaa","#f6ffd5","#22280b","#445016","#677821","#89a02c","#abc837","#bcd35f","#cdde87","#dde9af","#eef4d7","#22241c","#454837","#676c53","#8a916f","#a7ac93","#c4c8b7","#e2e3db","#112b00","#225500","#338000","#44aa00","#55d400","#66ff00","#7fff2a","#99ff55","#b3ff80","#ccffaa","#e5ffd5","#17280b","#2d5016","#447821","#5aa02c","#71c837","#8dd35f","#aade87","#c6e9af","#e3f4d7","#1f241c","#3e4837","#5d6c53","#7c916f","#9dac93","#bec8b7","#dee3db","#002b00","#005500","#008000","#00aa00","#00d400","#00ff00","#2aff2a","#55ff55","#80ff80","#aaffaa","#d5ffd5","#0b280b","#165016","#217821","#2ca02c","#37c837","#5fd35f","#87de87","#afe9af","#d7f4d7","#1c241c","#374837","#536c53","#6f916f","#93ac93","#b7c8b7","#dbe3db","#002b11","#005522","#008033","#00aa44","#00d455","#00ff66","#2aff80","#55ff99","#80ffb3","#aaffcc","#d5ffe6","#0b2817","#16502d","#217844","#2ca05a","#37c871","#5fd38d","#87deaa","#afe9c6","#d7f4e3","#1c241f","#37483e","#536c5d","#6f917c","#93ac9d","#b7c8be","#dbe3de","#002b22","#005544","#008066","#00aa88","#00d4aa","#00ffcc","#2affd5","#55ffdd","#80ffe6","#aaffee","#d5fff6","#0b2822","#165044","#217867","#2ca089","#37c8ab","#5fd3bc","#87decd","#afe9dd","#d7f4ee","#1c2422","#374845","#536c67","#6f918a","#93aca7","#b7c8c4","#dbe3e2","#00222b","#004455","#006680","#0088aa","#00aad4","#00ccff","#2ad4ff","#55ddff","#80e5ff","#aaeeff","#d5f6ff","#0b2228","#164450","#216778","#2c89a0","#37abc8","#5fbcd3","#87cdde","#afdde9","#d7eef4","#1c2224","#374548","#53676c","#6f8a91","#93a7ac","#b7c4c8","#dbe2e3","#00112b","#002255","#003380","#0044aa","#0055d4","#0066ff","#2a7fff","#5599ff","#80b3ff","#aaccff","#d5e5ff","#0b1728","#162d50","#214478","#2c5aa0","#3771c8","#5f8dd3","#87aade","#afc6e9","#d7e3f4","#1c1f24","#373e48","#535d6c","#6f7c91","#939dac","#b7bec8","#dbdee3","#00002b","#000055","#000080","#0000aa","#0000d4","#0000ff","#2a2aff","#5555ff","#8080ff","#aaaaff","#d5d5ff","#0b0b28","#161650","#212178","#2c2ca0","#3737c8","#5f5fd3","#8787de","#afafe9","#d7d7f4","#1c1c24","#373748","#53536c","#6f6f91","#9393ac","#b7b7c8","#dbdbe3","#11002b","#220055","#330080","#4400aa","#5500d4","#6600ff","#7f2aff","#9955ff","#b380ff","#ccaaff","#e5d5ff","#170b28","#2d1650","#442178","#5a2ca0","#7137c8","#8d5fd3","#aa87de","#c6afe9","#e3d7f4","#1f1c24","#3e3748","#5d536c","#7c6f91","#9d93ac","#beb7c8","#dedbe3","#22002b","#440055","#660080","#8800aa","#aa00d4","#cc00ff","#d42aff","#dd55ff","#e580ff","#eeaaff","#f6d5ff","#220b28","#441650","#672178","#892ca0","#ab37c8","#bc5fd3","#cd87de","#ddafe9","#eed7f4","#221c24","#453748","#67536c","#8a6f91","#a793ac","#c4b7c8","#e2dbe3","#2b0022","#550044","#800066","#aa0088","#d400aa","#ff00cc","#ff2ad4","#ff55dd","#ff80e5","#ffaaee","#ffd5f6","#280b22","#501644","#782167","#a02c89","#c837ab","#d35fbc","#de87cd","#e9afdd","#f4d7ee","#241c22","#483745","#6c5367","#916f8a","#ac93a7","#c8b7c4","#e3dbe2","#2b0011","#550022","#800033","#aa0044","#d40055","#ff0066","#ff2a7f","#ff5599","#ff80b2","#ffaacc","#ffd5e5","#280b17","#50162d","#782144","#a02c5a","#c83771","#d35f8d","#de87aa","#e9afc6","#f4d7e3","#241c1f","#48373e","#6c535d","#916f7c","#ac939d","#c8b7be","#e3dbde"]

	var isMac = false; //(navigator.platform.indexOf("Mac") != -1);
	var modKey = ""; //(isMac ? "meta+" : "ctrl+");
	var svgCanvas = new SvgCanvas(document.getElementById("svgcanvas"));

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
		if (selectedElement != null) {
			// unless we're already in always set the mode of the editor to select because
			// upon creation of a text element the editor is switched into
			// select mode and this event fires - we need our UI to be in sync
			
			var is_node = selectedElement.id && selectedElement.id.indexOf('polypointgrip') == 0;
			
			if (svgCanvas.getMode() != "multiselect" && !is_node) {
				setSelectMode();
				updateToolbar();
			}
		} // if (elem != null)

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
		}

		// we update the contextual panel with potentially new
		// positional/sizing information (we DON'T want to update the
		// toolbar here as that creates an infinite loop)
		// also this updates the history buttons

		// we tell it to skip focusing the text control if the
		// text element was previously in focus
		updateContextPanel();
	};
	
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
		clickSelect();
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
			$('#group_opacity').val(((selectedElement.getAttribute("opacity")||1.0)*100)+" %");
			$('#stroke_width').val(selectedElement.getAttribute("stroke-width")||1);
			$('#stroke_style').val(selectedElement.getAttribute("stroke-dasharray")||"none");
		}

		updateToolButtonState();
	};

	// updates the context panel tools based on the selected element
	var updateContextPanel = function() {
		var elem = selectedElement;
		var currentLayer = svgCanvas.getCurrentLayer();
		
		// No need to update anything else in rotate mode
		if (svgCanvas.getMode() == 'rotate' && elem != null) {
			$('#angle').val(svgCanvas.getRotationAngle(elem));
			return;
		}

		var is_node = elem ? (elem.id && elem.id.indexOf('polypointgrip') == 0) : false;
		
		$('#selected_panel, #multiselected_panel, #g_panel, #rect_panel, #circle_panel,\
			#ellipse_panel, #line_panel, #text_panel, #image_panel, #poly_node_panel').hide();
		if (elem != null) {
			$('#angle').val(svgCanvas.getRotationAngle(elem));

			if(!is_node) {
				$('#selected_panel').show();
			} else {
				$('#poly_node_panel').show();
				var point = svgCanvas.getNodePoint();
				if(point) {
					var seg_type = $('#seg_type');
					$('#poly_node_x').val(point.x);
					$('#poly_node_y').val(point.y);
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
				rect: ['radius','x','y','width','height'],
				image: ['x','y','width','height'],
				circle: ['cx','cy','r'],
				ellipse: ['cx','cy','rx','ry'],
				line: ['x1','y1','x2','y2'], 
				text: ['x','y']
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
          			$('#image_url').val(elem.getAttributeNS(xlinkNS, "href"));
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
			$('#selLayerNames')[0].removeAttribute('disabled');
			var opts = $('#selLayerNames option');
			for (var i = 0; i < opts.length; ++i) {
				var opt = opts[i];
				if (currentLayer == opt.textContent) {
					opt.setAttribute('selected', 'selected');
				}
				else {
					opt.removeAttribute('selected');
				}
			}
		}
		else {
			$('#selLayerNames')[0].setAttribute('disabled', 'disabled');
		}
		
	};

	$('#text').focus( function(){ textBeingEntered = true; } );
	$('#text').blur( function(){ textBeingEntered = false; } );

  
  
	// bind the selected event to our function that handles updates to the UI
	svgCanvas.bind("selected", selectedChanged);
	svgCanvas.bind("changed", elementChanged);
	svgCanvas.bind("saved", saveHandler);
	svgCanvas.bind("zoomed", zoomChanged);

	var str = '<div class="palette_item" style="background-image: url(\'images/none.png\');" data-rgb="none"></div>'
	$.each(palette, function(i,item){
		str += '<div class="palette_item" style="background-color: ' + item + ';" data-rgb="' + item + '"></div>';
	});
	$('#palette').append(str);

	var pos = $('#tools_rect_show').position();
	$('#tools_rect').css({'left': pos.left+4, 'top': pos.top+77});
	pos = $('#tools_ellipse_show').position();
	$('#tools_ellipse').css({'left': pos.left+4, 'top': pos.top+77});

	var changeRectRadius = function(ctl) {
		svgCanvas.setRectRadius(ctl.value);
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
	}
	var changeZoom = function(ctl) {
		var zoomlevel = ctl.value / 100;
		var res = svgCanvas.getResolution();
		// Hack to increase properly from 10%
		if(res.zoom < zoomlevel && res.zoom == .1) $('#zoom').val(50);
		setResolution(res.w * zoomlevel, res.h * zoomlevel, true);
		svgCanvas.setZoom(zoomlevel);
	}

	$('#stroke_style').change(function(){
		svgCanvas.setStrokeStyle(this.options[this.selectedIndex].value);
	});

	// Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
	$('select').change(function(){$(this).blur();});

	$('#group_opacity').change(function(){
		svgCanvas.setOpacity(this.options[this.selectedIndex].value);
	});

	// fired when user wants to move elements to another layer
	$('#selLayerNames').change(function(){
		var destLayer = this.options[this.selectedIndex].value;
		// TODO: localize this prompt
		if (destLayer && confirm('Move selected elements to layer \'' + destLayer + '\'?')) {
			svgCanvas.moveSelectedToLayer(destLayer);
			svgCanvas.clearSelection();
		}
	});

	$('#font_size').change(function(){
		svgCanvas.setFontSize(this.options[this.selectedIndex].value);
	});

	$('#font_family').change(function(){
		svgCanvas.setFontFamily(this.options[this.selectedIndex].value);
	});

	$('#seg_type').change(function() {
		svgCanvas.setSegType($(this).val());
	});

	$('#text').keyup(function(){
		svgCanvas.setTextContent(this.value);
	});
  
  $('#image_url').keyup(function(){
    svgCanvas.setImageURL(this.value); 
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
			// TODO: localize this
			alert('Invalid value given for' + $(this).attr('title').replace('Change','')
				+ '.');
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
	
	var setZoomOpts = function() {
		var button = $('#zoom_dropdown button');
		var list = $('#zoom_dropdown ul');
		var on_button = false;

		$('#zoom_dropdown li').bind('mouseup',function() {
			var item = $(this);
			var val = item.attr('data-val');
			var res = svgCanvas.getResolution();
			var scrbar = 15;
			if(val) {
				var w_area = $('#workarea');
				var z_info = svgCanvas.setBBoxZoom(val, w_area.width()-scrbar, w_area.height()-scrbar);
				if(!z_info) return;
				var zoomlevel = z_info.zoom;
				var bb = z_info.bbox;
				$('#zoom').val(zoomlevel*100);
				setResolution(res.w * zoomlevel, res.h * zoomlevel);
				var scrLeft = bb.x * zoomlevel;
				var scrOffX = w_area.width()/2 - (bb.width * zoomlevel)/2;
				w_area[0].scrollLeft = Math.max(0,scrLeft - scrOffX);
				var scrTop = bb.y * zoomlevel;
				var scrOffY = w_area.height()/2 - (bb.height * zoomlevel)/2;
				w_area[0].scrollTop = Math.max(0,scrTop - scrOffY);
			} else {
				var percent = parseInt(item.text());
				$('#zoom').val(percent);
				var zoomlevel = percent/100;
				setResolution(res.w * zoomlevel, res.h * zoomlevel, true);
				svgCanvas.setZoom(zoomlevel);
			}
		});
		
		$().mouseup(function() {
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
	};
	
	setZoomOpts();

	var clickSelect = function() {
		if (toolButtonClick('#tool_select')) {
			svgCanvas.setMode('select');
			$('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all}, #svgcanvas svg{cursor:default}');
		}
	};

	var clickPath = function() {
		if (toolButtonClick('#tool_path')) {
			svgCanvas.setMode('path');
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
		$('#tools_rect_show').attr('src', 'images/square.png');
	};

	var clickRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('rect');
		}
		$('#tools_rect_show').attr('src', 'images/rect.png');
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
			var res = svgCanvas.getResolution();
			setResolution(res.w, res.h);
			$('#zoom').val(100);
			svgCanvas.setZoom(1);
			setSelectMode();
		}
	};

	var clickFHRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('fhrect');
		}
		$('#tools_rect_show').attr('src', 'images/freehand-square.png');
	};

	var clickCircle = function(){
		if (toolButtonClick('#tools_ellipse_show', flyoutspeed)) {
			flyoutspeed = 'normal';
			svgCanvas.setMode('circle');
		}
		$('#tools_ellipse_show').attr('src', 'images/circle.png');
	};

	var clickEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('ellipse');
		}
		$('#tools_ellipse_show').attr('src', 'images/ellipse.png');
	};

	var clickFHEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('fhellipse');
		}
		$('#tools_ellipse_show').attr('src', 'images/freehand-circle.png');
	};

	var clickText = function(){
		toolButtonClick('#tool_text');
		svgCanvas.setMode('text');
	};
	
	var clickPoly = function(){
		toolButtonClick('#tool_poly');
		svgCanvas.setMode('poly');
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

	var moveSelected = function(dx,dy) {
		if (selectedElement != null || multiselected) {
			svgCanvas.moveSelectedElements(dx,dy);
		}
	};

	var clonePolyNode = function() {
		if (svgCanvas.getNodePoint()) {
			svgCanvas.clonePolyNode();
		}
	};
	
	var deletePolyNode = function() {
		if (svgCanvas.getNodePoint()) {
			svgCanvas.deletePolyNode();
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
	}
	
	var clickClear = function(){
		// TODO: localize this prompt
		if( confirm('Do you want to clear the drawing?\nThis will also erase your undo history!') ) {
			svgCanvas.clear();
			updateContextPanel();
		}
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
		svgCanvas.save();
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
		else {
			svgCanvas.ungroupSelectedElement();
		}
	};
	
	var clickClone = function(){
		svgCanvas.cloneSelectedElements();
	};

	var clickAlignLeft = function(){
		svgCanvas.alignSelectedElements('l', $('#align_relative_to option:selected').val() );
	};
	var clickAlignCenter = function(){
		svgCanvas.alignSelectedElements('c', $('#align_relative_to option:selected').val() );
	};
	var clickAlignRight = function(){
		svgCanvas.alignSelectedElements('r', $('#align_relative_to option:selected').val() );
	};
	var clickAlignTop = function(){
		svgCanvas.alignSelectedElements('t', $('#align_relative_to option:selected').val() );
	};
	var clickAlignMiddle = function(){
		svgCanvas.alignSelectedElements('m', $('#align_relative_to option:selected').val() );
	};
	var clickAlignBottom = function(){
		svgCanvas.alignSelectedElements('b', $('#align_relative_to option:selected').val() );
	};

	var zoomImage = function(zoomIn) {
		var res = svgCanvas.getResolution();
		var multiplier = zoomIn? res.zoom * 2 : res.zoom * 0.5;
		setResolution(res.w * multiplier, res.h * multiplier, true);
		$('#zoom').val(multiplier * 100);
		svgCanvas.setZoom(multiplier);
	};

	var showSourceEditor = function(){
		if (editingsource) return;
		editingsource = true;
		var str = svgCanvas.getSvgString();
		$('#svg_source_textarea').val(str);
		$('#svg_source_editor').fadeIn();
		properlySourceSizeTextArea();
		$('#svg_source_textarea').focus();
	};
	
	var showDocProperties = function(){
		if (docprops) return;
		docprops = true;
		
		// update resolution option with actual resolution
		// TODO: what if SVG source is changed?
		var res = svgCanvas.getResolution();
		$('#canvas_width').val(res.w);
		$('#canvas_height').val(res.h);
	
		$('#svg_docprops').fadeIn();
	};
	
	var properlySourceSizeTextArea = function(){
		// TODO: remove magic numbers here and get values from CSS
		var height = $('#svg_source_container').height() - 80;
		$('#svg_source_textarea').css('height', height);
	};
	
	var saveSourceEditor = function(){
		if (!editingsource) return;

		if (!svgCanvas.setSvgString($('#svg_source_textarea').val())) {
			// TODO: localize this prompt
			if( !confirm('There were parsing errors in your SVG source.\nRevert back to original SVG source?') ) {
				return false;
			}
		}
		svgCanvas.clearSelection();
		hideSourceEditor();
		populateLayers();		
	};
	
	var saveDocProperties = function(){
		// update resolution
		var x = parseInt($('#canvas_width').val());
		var y = parseInt($('#canvas_height').val());
		if(isNaN(x) || isNaN(y)) {
			x ='fit';
		}
		if(!svgCanvas.setResolution(x,y)) {
			alert('No content to fit to');
			return false;
		}
		hideDocProperties();
	};

	var cancelOverlays = function() {
		if (!editingsource && !docprops) return;

		if (editingsource) {
			var oldString = svgCanvas.getSvgString();
			if (oldString != $('#svg_source_textarea').val()) {
				// TODO: localize this prompt
				if( !confirm('Ignore changes made to SVG source?') ) {
					return false;
				}
			}
			hideSourceEditor();
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
		docprops = false;
	};
	
	// TODO: add canvas-centering code in here
	$(window).resize(function(evt) {
		if (!editingsource) return;
		properlySourceSizeTextArea();
	});

	$('#tool_select').click(clickSelect);
	$('#tool_path').click(clickPath);
	$('#tool_line').click(clickLine);
	$('#tool_square').mouseup(clickSquare);
	$('#tool_rect').mouseup(clickRect);
	$('#tool_fhrect').mouseup(clickFHRect);
	$('#tool_circle').mouseup(clickCircle);
	$('#tool_ellipse').mouseup(clickEllipse);
	$('#tool_fhellipse').mouseup(clickFHEllipse);
	$('#tool_image').mouseup(clickImage);
	$('#tool_zoom').mouseup(clickZoom);
	$('#tool_zoom').dblclick(dblclickZoom);
	$('#tool_text').click(clickText);
	$('#tool_poly').click(clickPoly);
	$('#tool_clear').click(clickClear);
	$('#tool_save').click(clickSave);
	$('#tool_open').click(clickOpen);
	$('#tool_source').click(showSourceEditor);
	$('#tool_source_cancel,#svg_source_overlay,#tool_docprops_cancel').click(cancelOverlays);
	$('#tool_source_save').click(saveSourceEditor);
	$('#tool_docprops_save').click(saveDocProperties);
	$('#tool_docprops').click(showDocProperties);
	$('#tool_delete').click(deleteSelected);
	$('#tool_delete_multi').click(deleteSelected);
	$('#tool_node_clone').click(clonePolyNode);
	$('#tool_node_delete').click(deletePolyNode);
	$('#tool_move_top').click(moveToTopSelected);
	$('#tool_move_bottom').click(moveToBottomSelected);
	$('#tool_undo').click(clickUndo);
	$('#tool_redo').click(clickRedo);
	$('#tool_clone').click(clickClone);
	$('#tool_clone_multi').click(clickClone);
	$('#tool_group').click(clickGroup);
	$('#tool_ungroup').click(clickGroup);
	$('#tool_alignleft').click(clickAlignLeft);
	$('#tool_aligncenter').click(clickAlignCenter);
	$('#tool_alignright').click(clickAlignRight);
	$('#tool_aligntop').click(clickAlignTop);
	$('#tool_alignmiddle').click(clickAlignMiddle);
	$('#tool_alignbottom').click(clickAlignBottom);
	// these two lines are required to make Opera work properly with the flyout mechanism
	$('#tools_rect_show').click(clickSquare);
	$('#tools_ellipse_show').click(clickCircle);
	$('#tool_bold').mousedown(clickBold);
	$('#tool_italic').mousedown(clickItalic);

	// added these event handlers for all the push buttons so they
	// behave more like buttons being pressed-in and not images
	function setPushButtons() {
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
	}
	
	setPushButtons();

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
	
	// do keybindings using jquery-hotkeys plugin
	function setKeyBindings() {
		var keys = [
			['1', clickSelect],
			['2', clickPath],
			['3', clickLine],
			['Shift+4', clickSquare],
			['4', clickRect],
			['Shift+5', clickCircle],
			['5', clickEllipse],
			['6', clickText],
			['7', clickPoly],
			['8', clickImage],
			[modKey+'N', function(evt){clickClear();evt.preventDefault();}],
			[modKey+'S', function(evt){editingsource?saveSourceEditor():clickSave();evt.preventDefault();}],
			[modKey+'O', function(evt){clickOpen();evt.preventDefault();}],
			['del', function(evt){deleteSelected();evt.preventDefault();}],
			['backspace', function(evt){deleteSelected();evt.preventDefault();}],
			['shift+up', moveToTopSelected],
			['shift+down', moveToBottomSelected],
			['shift+left', function(){rotateSelected(0)}],
			['shift+right', function(){rotateSelected(1)}],
			['shift+O', selectPrev],
			['shift+P', selectNext],
			['ctrl+up', function(evt){zoomImage(true);evt.preventDefault();}],
			['ctrl+down', function(evt){zoomImage();evt.preventDefault();}],
			['up', function(evt){moveSelected(0,-1);evt.preventDefault();}],
			['down', function(evt){moveSelected(0,1);evt.preventDefault();}],
			['left', function(evt){moveSelected(-1,0);evt.preventDefault();}],
			['right', function(evt){moveSelected(1,0);evt.preventDefault();}],
			[modKey+'z', function(evt){clickUndo();evt.preventDefault();}],
			[modKey+'y', function(evt){clickRedo();evt.preventDefault();}],
			[modKey+'u', function(evt){showSourceEditor();evt.preventDefault();}],
			[modKey+'i', function(evt){showDocProperties();evt.preventDefault();}],
			[modKey+'c', function(evt){clickClone();evt.preventDefault();}],
			[modKey+'g', function(evt){clickGroup();evt.preventDefault();}],
			['esc', cancelOverlays, false],
		];
		
		$.each(keys,function(i,item) {
			var disable = !(item.length > 2 && !item[2]);
			$(document).bind('keydown', {combi:item[0], disableInInput: disable}, item[1]);
		});
		
		$('.attr_changer').bind('keydown', {combi:'return', disableInInput: false}, 
			function(evt) {$(this).change();evt.preventDefault();}
		);
	}
	
	setKeyBindings();

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
	$('#fill_color').append( document.importNode(svgdocbox.documentElement,true) );
	
	boxgrad.id = 'gradbox_stroke';	
	$(svgdocbox.documentElement.firstChild).attr('fill', '#000000');
	$('#stroke_color').append( document.importNode(svgdocbox.documentElement,true) );
		
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
	
	$('#layer_new').click(function() {
		var curNames = new Array(svgCanvas.getNumLayers());
		for (var i = 0; i < curNames.length; ++i) { curNames[i] = svgCanvas.getLayer(i); }
		
		var j = (curNames.length+1);
		var uniqName = "Layer " + j;
		while (jQuery.inArray(uniqName, curNames) != -1) {
			j++;
			uniqName = "Layer " + j;
		}
		// TODO: localize this
		var newName = prompt("Please enter a unique layer name",uniqName);
		if (!newName) return;
		if (jQuery.inArray(newName, curNames) != -1) {
			alert("There is already a layer named that!");
			return;
		}
		svgCanvas.createLayer(newName);
		updateContextPanel();
		populateLayers();
		$('#layerlist tr.layer').removeClass("layersel");
		$('#layerlist tr.layer:first').addClass("layersel");
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
		// TODO: localize this
		var newName = prompt("Please enter the new layer name","");
		if (!newName) return;
		if (oldName == newName) {
			alert("Layer already has that name");
			return;
		}

		var curNames = new Array(svgCanvas.getNumLayers());
		for (var i = 0; i < curNames.length; ++i) { curNames[i] = svgCanvas.getLayer(i); }
		if (jQuery.inArray(newName, curNames) != -1) {
			alert("There is already a layer named that!");
			return;
		}
		
		svgCanvas.renameCurrentLayer(newName);
		populateLayers();
		$('#layerlist tr.layer').removeClass("layersel");
		$('#layerlist tr.layer:eq('+curIndex+')').addClass("layersel");
	});
	
	var sidedrag = -1;
	$('#sidepanel_handle')
		.mousedown(function(evt) {sidedrag = evt.pageX;})
		.mouseup(function(evt) {sidedrag = -1;});
	// TODO: is there a better way to do this splitter without attaching mouse handlers here?
	$('#svg_editor')
		.mouseup(function(){sidedrag=-1;})
		.mousemove(function(evt) {
			if (sidedrag == -1) return;
			var deltax = sidedrag - evt.pageX;
			if (deltax == 0) return;
			sidedrag = evt.pageX;
			var sidewidth = parseInt($('#sidepanels').css('width'))+deltax;
			if (sidewidth <= 156 && sidewidth >= 10) {
				var workarea = $('#workarea');
				var sidepanels = $('#sidepanels');
				var layerpanel = $('#layerpanel');
				workarea.css('right', parseInt(workarea.css('right'))+deltax);
				sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
				layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
			}
	});

	var populateLayers = function(){
		var layerlist = $('#layerlist tbody');
		var selLayerNames = $('#selLayerNames');
		layerlist.empty();
		selLayerNames.empty();
		var layer = svgCanvas.getNumLayers();
		// we get the layers in the reverse z-order (the layer rendered on top is listed first)
		while (layer--) {
			var name = svgCanvas.getLayer(layer);
			// contenteditable=\"true\"
			if (svgCanvas.getLayerVisibility(name)) {
				layerlist.append("<tr class=\"layer\"><td class=\"layervis\"/><td class=\"layername\" >" + name + "</td></tr>");
			}
			else {
				layerlist.append("<tr class=\"layer\"><td class=\"layervis layerinvis\"/><td class=\"layername\" >" + name + "</td></tr>");
			}
			selLayerNames.append("<option values=\"" + name + "\">" + name + "</option>");
		}
		// if we only have one layer, then always make sure that layer is selected
		// (This is really only required upon first initialization)
		if (layerlist.size() == 1) {
			$('#layerlist tr:first').addClass("layersel");
		}
		// handle selection of layer
		$('#layerlist td.layername').click(function(evt){
			$('#layerlist tr.layer').removeClass("layersel");
			var row = $(this.parentNode);
			row.addClass("layersel");
			svgCanvas.setCurrentLayer(this.textContent);
			evt.preventDefault();
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
	
	function stepZoom(elem, step) {
		var orig_val = elem.value-0;
		var sug_val = orig_val + step;
		
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
		
		var res = svgCanvas.getResolution();
		
		if(center) {
			var w_area = $('#workarea');
// 			console.log(w_area[0].scrollLeft); //  1677
// 			console.log('w',w_area.width()); // 875 // zoom: 4.67
			// Want: 1942 (+265)
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

	$('#rect_rx').SpinButton({ min: 0, max: 1000, step: 1, callback: changeRectRadius });
	$('#stroke_width').SpinButton({ min: 0, max: 99, step: 1, callback: changeStrokeWidth });
	$('#angle').SpinButton({ min: -180, max: 180, step: 5, callback: changeRotationAngle });
	$('#zoom').SpinButton({ min: 0.1, max: 10000, step: 50, stepfunc: stepZoom, callback: changeZoom });
	
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
	
	return svgCanvas;
};

// This happens when the page is loaded
$(function() {
	put_locale();
	svgCanvas = svg_edit_setup();
	
	try{
	  window.addEventListener("message", function(e){
	    try{
        e.source.postMessage(eval(e.data), e.origin);
      }catch(err){
        e.source.postMessage("error:"+err.message, e.origin);
      }
    }, false)
	}catch(err){}
	
});
