if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}

function svg_edit_setup() {
	var palette = ["#000000","#202020","#404040","#606060","#808080","#a0a0a0","#c0c0c0","#e0e0e0","#ffffff","#800000","#ff0000","#808000","#ffff00","#008000","#00ff00","#008080","#00ffff","#000080","#0000ff","#800080","#ff00ff","#2b0000","#550000","#800000","#aa0000","#d40000","#ff0000","#ff2a2a","#ff5555","#ff8080","#ffaaaa","#ffd5d5","#280b0b","#501616","#782121","#a02c2c","#c83737","#d35f5f","#de8787","#e9afaf","#f4d7d7","#241c1c","#483737","#6c5353","#916f6f","#ac9393","#c8b7b7","#e3dbdb","#2b1100","#552200","#803300","#aa4400","#d45500","#ff6600","#ff7f2a","#ff9955","#ffb380","#ffccaa","#ffe6d5","#28170b","#502d16","#784421","#a05a2c","#c87137","#d38d5f","#deaa87","#e9c6af","#f4e3d7","#241f1c","#483e37","#6c5d53","#917c6f","#ac9d93","#c8beb7","#e3dedb","#2b2200","#554400","#806600","#aa8800","#d4aa00","#ffcc00","#ffd42a","#ffdd55","#ffe680","#ffeeaa","#fff6d5","#28220b","#504416","#786721","#a0892c","#c8ab37","#d3bc5f","#decd87","#e9ddaf","#f4eed7","#24221c","#484537","#6c6753","#918a6f","#aca793","#c8c4b7","#e3e2db","#222b00","#445500","#668000","#88aa00","#aad400","#ccff00","#d4ff2a","#ddff55","#e5ff80","#eeffaa","#f6ffd5","#22280b","#445016","#677821","#89a02c","#abc837","#bcd35f","#cdde87","#dde9af","#eef4d7","#22241c","#454837","#676c53","#8a916f","#a7ac93","#c4c8b7","#e2e3db","#112b00","#225500","#338000","#44aa00","#55d400","#66ff00","#7fff2a","#99ff55","#b3ff80","#ccffaa","#e5ffd5","#17280b","#2d5016","#447821","#5aa02c","#71c837","#8dd35f","#aade87","#c6e9af","#e3f4d7","#1f241c","#3e4837","#5d6c53","#7c916f","#9dac93","#bec8b7","#dee3db","#002b00","#005500","#008000","#00aa00","#00d400","#00ff00","#2aff2a","#55ff55","#80ff80","#aaffaa","#d5ffd5","#0b280b","#165016","#217821","#2ca02c","#37c837","#5fd35f","#87de87","#afe9af","#d7f4d7","#1c241c","#374837","#536c53","#6f916f","#93ac93","#b7c8b7","#dbe3db","#002b11","#005522","#008033","#00aa44","#00d455","#00ff66","#2aff80","#55ff99","#80ffb3","#aaffcc","#d5ffe6","#0b2817","#16502d","#217844","#2ca05a","#37c871","#5fd38d","#87deaa","#afe9c6","#d7f4e3","#1c241f","#37483e","#536c5d","#6f917c","#93ac9d","#b7c8be","#dbe3de","#002b22","#005544","#008066","#00aa88","#00d4aa","#00ffcc","#2affd5","#55ffdd","#80ffe6","#aaffee","#d5fff6","#0b2822","#165044","#217867","#2ca089","#37c8ab","#5fd3bc","#87decd","#afe9dd","#d7f4ee","#1c2422","#374845","#536c67","#6f918a","#93aca7","#b7c8c4","#dbe3e2","#00222b","#004455","#006680","#0088aa","#00aad4","#00ccff","#2ad4ff","#55ddff","#80e5ff","#aaeeff","#d5f6ff","#0b2228","#164450","#216778","#2c89a0","#37abc8","#5fbcd3","#87cdde","#afdde9","#d7eef4","#1c2224","#374548","#53676c","#6f8a91","#93a7ac","#b7c4c8","#dbe2e3","#00112b","#002255","#003380","#0044aa","#0055d4","#0066ff","#2a7fff","#5599ff","#80b3ff","#aaccff","#d5e5ff","#0b1728","#162d50","#214478","#2c5aa0","#3771c8","#5f8dd3","#87aade","#afc6e9","#d7e3f4","#1c1f24","#373e48","#535d6c","#6f7c91","#939dac","#b7bec8","#dbdee3","#00002b","#000055","#000080","#0000aa","#0000d4","#0000ff","#2a2aff","#5555ff","#8080ff","#aaaaff","#d5d5ff","#0b0b28","#161650","#212178","#2c2ca0","#3737c8","#5f5fd3","#8787de","#afafe9","#d7d7f4","#1c1c24","#373748","#53536c","#6f6f91","#9393ac","#b7b7c8","#dbdbe3","#11002b","#220055","#330080","#4400aa","#5500d4","#6600ff","#7f2aff","#9955ff","#b380ff","#ccaaff","#e5d5ff","#170b28","#2d1650","#442178","#5a2ca0","#7137c8","#8d5fd3","#aa87de","#c6afe9","#e3d7f4","#1f1c24","#3e3748","#5d536c","#7c6f91","#9d93ac","#beb7c8","#dedbe3","#22002b","#440055","#660080","#8800aa","#aa00d4","#cc00ff","#d42aff","#dd55ff","#e580ff","#eeaaff","#f6d5ff","#220b28","#441650","#672178","#892ca0","#ab37c8","#bc5fd3","#cd87de","#ddafe9","#eed7f4","#221c24","#453748","#67536c","#8a6f91","#a793ac","#c4b7c8","#e2dbe3","#2b0022","#550044","#800066","#aa0088","#d400aa","#ff00cc","#ff2ad4","#ff55dd","#ff80e5","#ffaaee","#ffd5f6","#280b22","#501644","#782167","#a02c89","#c837ab","#d35fbc","#de87cd","#e9afdd","#f4d7ee","#241c22","#483745","#6c5367","#916f8a","#ac93a7","#c8b7c4","#e3dbe2","#2b0011","#550022","#800033","#aa0044","#d40055","#ff0066","#ff2a7f","#ff5599","#ff80b2","#ffaacc","#ffd5e5","#280b17","#50162d","#782144","#a02c5a","#c83771","#d35f8d","#de87aa","#e9afc6","#f4d7e3","#241c1f","#48373e","#6c535d","#916f7c","#ac939d","#c8b7be","#e3dbde"]

	var isMac = false; //(navigator.platform.indexOf("Mac") != -1);
	var modKey = ""; //(isMac ? "meta+" : "ctrl+");
	var svgCanvas = new SvgCanvas(document.getElementById("svgcanvas"));

	var setSelectMode = function() {
		$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
		$('#tool_select').addClass('tool_button_current');
		$('#styleoverrides').text('*{cursor:move;pointer-events:all} svg{cursor:default}');
		svgCanvas.setMode('select');
	};

	// used to make the flyouts stay on the screen longer the very first time
	var flyoutspeed = 1250;
	var textBeingEntered = false;
	var selectedElement = null;
	var multiselected = false;
	var editingsource = false;
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
			if (svgCanvas.getMode() != "multiselect") {
				setSelectMode();
			}

			updateToolbar();
		} // if (elem != null)

		updateContextPanel(); 
	};

	// called when any element has changed
	var elementChanged = function(window,elems) {
		for (var i = 0; i < elems.length; ++i) {
			var elem = elems[i];
			// if the element changed was the svg, then it could be a resolution change
			if (elem && elem.tagName == "svg") {
				changeResolution(parseInt(elem.getAttribute("width")),
								 parseInt(elem.getAttribute("height")));
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

	// updates the toolbar (colors, opacity, etc) based on the selected element
	var updateToolbar = function() {
		if (selectedElement != null) {
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
			svgCanvas.setFillColor(fillColor);
			svgCanvas.setFillOpacity(fillOpacity);

			// update stroke color and opacity
			var strokeColor = selectedElement.getAttribute("stroke")||"none";
			svgCanvas.setStrokeColor(strokeColor);
			svgCanvas.setStrokeOpacity(strokeOpacity);

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
		$('#selected_panel, #multiselected_panel, #rect_panel, #circle_panel,\
			#ellipse_panel, #line_panel, #text_panel').hide();
		if (elem != null) {
			$('#angle').val(svgCanvas.getRotationAngle(elem));
			$('#selected_panel').show();
			
			// update contextual tools here
			var panels = {
				rect: ['radius','x','y','width','height'],
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
				}
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
	};

	$('#text').focus( function(){ textBeingEntered = true; } );
	$('#text').blur( function(){ textBeingEntered = false; } );

	// bind the selected event to our function that handles updates to the UI
	svgCanvas.bind("selected", selectedChanged);
	svgCanvas.bind("changed", elementChanged);
	svgCanvas.bind("saved", saveHandler);

	var str = '<div class="palette_item" style="background-image: url(\'images/none.png\');" data-rgb="none"></div>'
	$.each(palette, function(i,item){
		str += '<div class="palette_item" style="background-color: ' + item + ';" data-rgb="' + item + '"></div>';
	});
	$('#palette').append(str);

	var pos = $('#tools_rect_show').position();
	$('#tools_rect').css({'left': pos.left+4, 'top': pos.top+70});
	pos = $('#tools_ellipse_show').position();
	$('#tools_ellipse').css({'left': pos.left+4, 'top': pos.top+70});

	var changeRectRadius = function(ctl) {
		svgCanvas.setRectRadius(ctl.value);
	}
	
	var changeStrokeWidth = function(ctl) {
		svgCanvas.setStrokeWidth(ctl.value);
	}
	
	var changeRotationAngle = function(ctl) {
		svgCanvas.setRotationAngle(ctl.value);
	}

	$('#stroke_style').change(function(){
		svgCanvas.setStrokeStyle(this.options[this.selectedIndex].value);
	});

	$('#group_opacity').change(function(){
		svgCanvas.setOpacity(this.options[this.selectedIndex].value);
	});

	$('#font_size').change(function(){
		svgCanvas.setFontSize(this.options[this.selectedIndex].value);
	});

	$('#font_family').change(function(){
		svgCanvas.setFontFamily(this.options[this.selectedIndex].value);
	});

	$('#text').keyup(function(){
		svgCanvas.setTextContent(this.value);
	});

	$('.attr_changer').change(function() {
		var attr = this.getAttribute("alt");
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
			alert('Invalid value given for' + $(this).attr('title').replace('Change','')
				+ '.');
			this.value = selectedElement.getAttribute(attr);
			return false;
		} 
		
		svgCanvas.changeSelectedAttribute(attr, val);
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
			svgCanvas.setStrokeColor(color);
			if (color != 'none') {
				svgCanvas.setStrokeOpacity(1.0);
				$("#stroke_opacity").html("100 %");
			}
		} else {
			fillPaint = paint;
			svgCanvas.setFillColor(color);
			if (color != 'none') {
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

	var clickSelect = function() {
		if (toolButtonClick('#tool_select')) {
			svgCanvas.setMode('select');
			$('#styleoverrides').text('*{cursor:move;pointer-events:all} svg{cursor:default}');
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
		if (svgCanvas.getUndoStackSize() > 0)
			svgCanvas.undo();
	};

	var clickRedo = function(){
		if (svgCanvas.getRedoStackSize() > 0)
			svgCanvas.redo();
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

	var showSourceEditor = function(){
		if (editingsource) return;
		editingsource = true;
		var str = svgCanvas.getSvgString();
		$('#svg_source_textarea').val(str);
		$('#svg_source_editor').fadeIn();
		properlySourceSizeTextArea();
		$('#svg_source_textarea').focus();
	};
	
	var properlySourceSizeTextArea = function(){
		// TODO: remove magic numbers here and get values from CSS
		var height = $('#svg_source_container').height() - 80;
		$('#svg_source_textarea').css('height', height);
	};
	
	var saveSourceEditor = function(){
		if (!editingsource) return;

		if (!svgCanvas.setSvgString($('#svg_source_textarea').val())) {
			if( !confirm('There were parsing errors in your SVG source.\nRevert back to original SVG source?') ) {
				return false;
			}
		}
		svgCanvas.clearSelection();
		hideSourceEditor();
	};

	var cancelSourceEditor = function() {
		if (!editingsource) return;

		var oldString = svgCanvas.getSvgString();
		if (oldString != $('#svg_source_textarea').val()) {
			if( !confirm('Ignore changes made to SVG source?') ) {
				return false;
			}
		}
		hideSourceEditor();
	};

	var hideSourceEditor = function(){
		$('#svg_source_editor').hide();
		editingsource = false;
		$('#svg_source_textarea').blur();
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
	$('#tool_text').click(clickText);
	$('#tool_poly').click(clickPoly);
	$('#tool_clear').click(clickClear);
	$('#tool_save').click(clickSave);
	$('#tool_open').click(clickOpen);
	$('#tool_source').click(showSourceEditor);
	$('#tool_source_cancel,#svg_source_overlay').click(cancelSourceEditor);
	$('#tool_source_save').click(saveSourceEditor);
	$('#tool_delete').click(deleteSelected);
	$('#tool_delete_multi').click(deleteSelected);
	$('#tool_move_top').click(moveToTopSelected);
	$('#tool_move_bottom').click(moveToBottomSelected);
	$('#tool_undo').click(clickUndo);
	$('#tool_redo').click(clickRedo);
	$('#tool_clone').click(clickClone);
	$('#tool_clone_multi').click(clickClone);
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
			console.log(index);
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
			[modKey+'N', function(evt){clickClear();evt.preventDefault();}],
			[modKey+'S', function(evt){editingsource?saveSourceEditor():clickSave();evt.preventDefault();}],
			[modKey+'O', function(evt){clickOpen();evt.preventDefault();}],
			['del', function(evt){deleteSelected();evt.preventDefault();}],
			['backspace', function(evt){deleteSelected();evt.preventDefault();}],
			['shift+up', moveToTopSelected],
			['shift+down', moveToBottomSelected],
			['shift+left', function(){rotateSelected(0)}],
			['shift+right', function(){rotateSelected(1)}],
			['shift+9', selectPrev],
			['shift+0', selectNext],
			['up', function(evt){moveSelected(0,-1);evt.preventDefault();}],
			['down', function(evt){moveSelected(0,1);evt.preventDefault();}],
			['left', function(evt){moveSelected(-1,0);evt.preventDefault();}],
			['right', function(evt){moveSelected(1,0);evt.preventDefault();}],
			[modKey+'z', function(evt){clickUndo();evt.preventDefault();}],
			[modKey+'y', function(evt){clickRedo();evt.preventDefault();}],
			[modKey+'u', function(evt){showSourceEditor();evt.preventDefault();}],
			[modKey+'c', function(evt){clickClone();evt.preventDefault();}],
			['esc', cancelSourceEditor, false],
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

	// TODO: fix opacity being updated
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
		$('#color_picker').css({'left': pos.left - 140, 'bottom': 124 - pos.top}).jGraduate(
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

	function changeResolution(x,y) {
		var new_res = x+'x'+y;
		var found = false;
		$('#resolution option').each(function() {
			if($(this).text() == new_res) {
				$('#resolution').val(x+'x'+y);
				found = true;
			}
		});
		if(!found) $('#resolution').val('Custom');
		
		$('#svgcanvas').css( { 'width': x, 'height': y } );
	}

	$('#resolution').change(function(){
		if(this.value == 'Custom') {
			var cust_val = prompt("Please enter custom size (i.e. 400x300)","");
			var res_vals = cust_val.match(/(\d+)[x \/,](\d+)/);
			if(!res_vals) {
				alert('Invalid size. Please format it as WIDTHxHEIGHT (like 400x300)');
				return false;
			} else {
				var x = res_vals[1], y = res_vals[2];
				if(x == '0' || y == '0') {
					alert('Invalid size. Width or height may not be 0.');
					return false;
				}
			}
		} else if(this.value == 'Fit to content'){
			var x = '', y = '';
		} else {
			var res = this.value.split('x');
			var x = parseInt(res[0]), y = parseInt(res[1]);
		}
		svgCanvas.setResolution(x,y);
	});

	$('#rect_rx').SpinButton({ min: 0, max: 1000, step: 1, callback: changeRectRadius });
	$('#stroke_width').SpinButton({ min: 1, max: 99, step: 1, callback: changeStrokeWidth });
	$('#angle').SpinButton({ min: -180, max: 180, step: 5, callback: changeRotationAngle });

	svgCanvas.setCustomHandlers = function(opts) {
		if(opts.open) {
			$('#tool_open').show();
			svgCanvas.bind("opened", opts.open);
		}
		if(opts.save) {
			svgCanvas.bind("saved", opts.save);
		}
	}

	return svgCanvas;
};

// This happens when the page is loaded
$(function() {
	svgCanvas = svg_edit_setup();
});
