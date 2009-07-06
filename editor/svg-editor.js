if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}
var palette = ["#000000","#202020","#404040","#606060","#808080","#a0a0a0","#c0c0c0","#e0e0e0","#ffffff","#800000","#ff0000","#808000","#ffff00","#008000","#00ff00","#008080","#00ffff","#000080","#0000ff","#800080","#ff00ff","#2b0000","#550000","#800000","#aa0000","#d40000","#ff0000","#ff2a2a","#ff5555","#ff8080","#ffaaaa","#ffd5d5","#280b0b","#501616","#782121","#a02c2c","#c83737","#d35f5f","#de8787","#e9afaf","#f4d7d7","#241c1c","#483737","#6c5353","#916f6f","#ac9393","#c8b7b7","#e3dbdb","#2b1100","#552200","#803300","#aa4400","#d45500","#ff6600","#ff7f2a","#ff9955","#ffb380","#ffccaa","#ffe6d5","#28170b","#502d16","#784421","#a05a2c","#c87137","#d38d5f","#deaa87","#e9c6af","#f4e3d7","#241f1c","#483e37","#6c5d53","#917c6f","#ac9d93","#c8beb7","#e3dedb","#2b2200","#554400","#806600","#aa8800","#d4aa00","#ffcc00","#ffd42a","#ffdd55","#ffe680","#ffeeaa","#fff6d5","#28220b","#504416","#786721","#a0892c","#c8ab37","#d3bc5f","#decd87","#e9ddaf","#f4eed7","#24221c","#484537","#6c6753","#918a6f","#aca793","#c8c4b7","#e3e2db","#222b00","#445500","#668000","#88aa00","#aad400","#ccff00","#d4ff2a","#ddff55","#e5ff80","#eeffaa","#f6ffd5","#22280b","#445016","#677821","#89a02c","#abc837","#bcd35f","#cdde87","#dde9af","#eef4d7","#22241c","#454837","#676c53","#8a916f","#a7ac93","#c4c8b7","#e2e3db","#112b00","#225500","#338000","#44aa00","#55d400","#66ff00","#7fff2a","#99ff55","#b3ff80","#ccffaa","#e5ffd5","#17280b","#2d5016","#447821","#5aa02c","#71c837","#8dd35f","#aade87","#c6e9af","#e3f4d7","#1f241c","#3e4837","#5d6c53","#7c916f","#9dac93","#bec8b7","#dee3db","#002b00","#005500","#008000","#00aa00","#00d400","#00ff00","#2aff2a","#55ff55","#80ff80","#aaffaa","#d5ffd5","#0b280b","#165016","#217821","#2ca02c","#37c837","#5fd35f","#87de87","#afe9af","#d7f4d7","#1c241c","#374837","#536c53","#6f916f","#93ac93","#b7c8b7","#dbe3db","#002b11","#005522","#008033","#00aa44","#00d455","#00ff66","#2aff80","#55ff99","#80ffb3","#aaffcc","#d5ffe6","#0b2817","#16502d","#217844","#2ca05a","#37c871","#5fd38d","#87deaa","#afe9c6","#d7f4e3","#1c241f","#37483e","#536c5d","#6f917c","#93ac9d","#b7c8be","#dbe3de","#002b22","#005544","#008066","#00aa88","#00d4aa","#00ffcc","#2affd5","#55ffdd","#80ffe6","#aaffee","#d5fff6","#0b2822","#165044","#217867","#2ca089","#37c8ab","#5fd3bc","#87decd","#afe9dd","#d7f4ee","#1c2422","#374845","#536c67","#6f918a","#93aca7","#b7c8c4","#dbe3e2","#00222b","#004455","#006680","#0088aa","#00aad4","#00ccff","#2ad4ff","#55ddff","#80e5ff","#aaeeff","#d5f6ff","#0b2228","#164450","#216778","#2c89a0","#37abc8","#5fbcd3","#87cdde","#afdde9","#d7eef4","#1c2224","#374548","#53676c","#6f8a91","#93a7ac","#b7c4c8","#dbe2e3","#00112b","#002255","#003380","#0044aa","#0055d4","#0066ff","#2a7fff","#5599ff","#80b3ff","#aaccff","#d5e5ff","#0b1728","#162d50","#214478","#2c5aa0","#3771c8","#5f8dd3","#87aade","#afc6e9","#d7e3f4","#1c1f24","#373e48","#535d6c","#6f7c91","#939dac","#b7bec8","#dbdee3","#00002b","#000055","#000080","#0000aa","#0000d4","#0000ff","#2a2aff","#5555ff","#8080ff","#aaaaff","#d5d5ff","#0b0b28","#161650","#212178","#2c2ca0","#3737c8","#5f5fd3","#8787de","#afafe9","#d7d7f4","#1c1c24","#373748","#53536c","#6f6f91","#9393ac","#b7b7c8","#dbdbe3","#11002b","#220055","#330080","#4400aa","#5500d4","#6600ff","#7f2aff","#9955ff","#b380ff","#ccaaff","#e5d5ff","#170b28","#2d1650","#442178","#5a2ca0","#7137c8","#8d5fd3","#aa87de","#c6afe9","#e3d7f4","#1f1c24","#3e3748","#5d536c","#7c6f91","#9d93ac","#beb7c8","#dedbe3","#22002b","#440055","#660080","#8800aa","#aa00d4","#cc00ff","#d42aff","#dd55ff","#e580ff","#eeaaff","#f6d5ff","#220b28","#441650","#672178","#892ca0","#ab37c8","#bc5fd3","#cd87de","#ddafe9","#eed7f4","#221c24","#453748","#67536c","#8a6f91","#a793ac","#c4b7c8","#e2dbe3","#2b0022","#550044","#800066","#aa0088","#d400aa","#ff00cc","#ff2ad4","#ff55dd","#ff80e5","#ffaaee","#ffd5f6","#280b22","#501644","#782167","#a02c89","#c837ab","#d35fbc","#de87cd","#e9afdd","#f4d7ee","#241c22","#483745","#6c5367","#916f8a","#ac93a7","#c8b7c4","#e3dbe2","#2b0011","#550022","#800033","#aa0044","#d40055","#ff0066","#ff2a7f","#ff5599","#ff80b2","#ffaacc","#ffd5e5","#280b17","#50162d","#782144","#a02c5a","#c83771","#d35f8d","#de87aa","#e9afc6","#f4d7e3","#241c1f","#48373e","#6c535d","#916f7c","#ac939d","#c8b7be","#e3dbde"]

function svg_edit_setup() {
	var svgCanvas = new SvgCanvas(document.getElementById("svgcanvas"));

	var setSelectMode = function() {
		$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
		$('#tool_select').addClass('tool_button_current');
		$('#styleoverrides').text('*{cursor:move;pointer-events:all} svg{cursor:default}');
		svgCanvas.setMode('select');
	}

	var textBeingEntered = false;
	var selectedElement = null;
	var multiselected = false;

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

		updateContextPanel(true);
	}

	// called when any element has changed
	var elementChanged = function(window,elems) {
		for (var i = 0; i < elems.length; ++i) {
			var elem = elems[i];
			// if the element changed was the svg, then it must be a resolution change
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
		updateContextPanel(false);
	}

	// updates the toolbar (colors, opacity, etc) based on the selected element
	function updateToolbar() {
		if (selectedElement != null) {
			// update fill color
			var fillColor = selectedElement.getAttribute("fill");
			svgCanvas.setFillColor(fillColor);
			if (fillColor == "none") {
				fillColor = 'url(\'images/none.png\')';
			}
			$('#fill_color').css('background', fillColor);

			// update stroke color
			var strokeColor = selectedElement.getAttribute("stroke");
			svgCanvas.setStrokeColor(strokeColor);
			if (strokeColor == null || strokeColor == "" || strokeColor == "none") {
				strokeColor = 'url(\'images/none.png\')';
			}
			$('#stroke_color').css('background', strokeColor);

			$('#fill_opacity').html(((selectedElement.getAttribute("fill-opacity")||1.0)*100)+" %");
			$('#stroke_opacity').html(((selectedElement.getAttribute("stroke-opacity")||1.0)*100)+" %");
			$('#group_opacity').val(((selectedElement.getAttribute("opacity")||1.0)*100)+" %");
			$('#stroke_width').val(selectedElement.getAttribute("stroke-width")||1);
			$('#stroke_style').val(selectedElement.getAttribute("stroke-dasharray")||"none");
		}

		updateToolButtonState();
	}

	// updates the context panel tools based on the selected element
	function updateContextPanel(shouldHighlightText) {
		var elem = selectedElement;
		$('#selected_panel').hide();
		$('#multiselected_panel').hide();
		$('#rect_panel').hide();
		$('#circle_panel').hide();
		$('#ellipse_panel').hide();
		$('#line_panel').hide();
		$('#text_panel').hide();
		if (elem != null) {
			$('#selected_panel').show();
			// update contextual tools here
			switch(elem.tagName) {
				case "rect":
					$('#rect_panel').show();
					$('#rect_radius').val(elem.getAttribute("rx")||0);
					$('#rect_x').val(elem.getAttribute("x")||0);
					$('#rect_y').val(elem.getAttribute("y")||0);
					$('#rect_w').val(elem.getAttribute("width")||0);
					$('#rect_h').val(elem.getAttribute("height")||0);
					break;
				case "circle":
					$('#circle_panel').show();
					$('#circle_cx').val(elem.getAttribute("cx")||0);
					$('#circle_cy').val(elem.getAttribute("cy")||0);
					$('#circle_r').val(elem.getAttribute("r")||0);
					break;
				case "ellipse":
					$('#ellipse_panel').show();
					$('#ellipse_cx').val(elem.getAttribute("cx")||0);
					$('#ellipse_cy').val(elem.getAttribute("cy")||0);
					$('#ellipse_rx').val(elem.getAttribute("rx")||0);
					$('#ellipse_ry').val(elem.getAttribute("ry")||0);
					break;
				case "line":
					$('#line_panel').show();
					$('#line_x1').val(elem.getAttribute("x1")||0);
					$('#line_y1').val(elem.getAttribute("y1")||0);
					$('#line_x2').val(elem.getAttribute("x2")||0);
					$('#line_y2').val(elem.getAttribute("y2")||0);
					break;
				case "text":
					// jquery's show() always sets display to block
					$('#text_panel').show().css("display", "inline");
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
					$('#text').focus();
					if (shouldHighlightText) {
						$('#text').select();
					}
					break;
			} // switch
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
	}

	$('#text').focus( function(){ textBeingEntered = true; } );
	$('#text').blur( function(){ textBeingEntered = false; } );

	// bind the selected event to our function that handles updates to the UI
	svgCanvas.bind("selected", selectedChanged);
	svgCanvas.bind("changed", elementChanged);

	var str = '<div class="palette_item" style="background: url(\'images/none.png\');"></div>'
	$.each(palette, function(i,item){
		str += '<div class="palette_item" style="background: ' + item + ';"></div>';
	});
	$('#palette').append(str);

	var pos = $('#tools_rect_show').position();
	$('#tools_rect').css({'left': pos.left+4, 'top': pos.top+70});
	pos = $('#tools_ellipse_show').position();
	$('#tools_ellipse').css({'left': pos.left+4, 'top': pos.top+70});

	$('#stroke_width').change(function(){
		svgCanvas.setStrokeWidth(this.options[this.selectedIndex].value);
	});

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

	$('#rect_radius').change(function(){
		svgCanvas.setRectRadius(this.options[this.selectedIndex].value);
	});

	$('.attr_changer').change(function() {
		svgCanvas.changeSelectedAttribute(this.getAttribute("alt"), this.value);
	});

	$('.palette_item').click(function(evt){
		var id = (evt.shiftKey ? '#stroke_' : '#fill_');
		color = $(this).css('background-color');
		// Webkit-based browsers returned 'initial' here for no stroke
		if (color == 'transparent' || color == 'initial') {
			color = 'none';
			$(id + "color").css('background', 'url(\'images/none.png\')');
			$(id + "opacity").html("N/A");
		} else {
			$(id + "color").css('background', color);
		}
		if (evt.shiftKey) {
			svgCanvas.setStrokeColor(color);
			if (color != 'none' && $("#stroke_opacity").html() == 'N/A') {
				svgCanvas.setStrokeOpacity(100);
				$("#stroke_opacity").html("100 %");
			}
		} else {
			svgCanvas.setFillColor(color);
			if (color != 'none' && $("#fill_opacity").html() == 'N/A') {
				svgCanvas.setFillOpacity(100);
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
	var toolButtonClick = function(button) {
		if ($(button).hasClass('tool_button_disabled')) return false;
		$('.tools_flyout').fadeOut();
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
	}

	var clickPath = function() {
		if (toolButtonClick('#tool_path')) {
			svgCanvas.setMode('path');
		}
	}

	var clickLine = function() {
		if (toolButtonClick('#tool_line')) {
			svgCanvas.setMode('line');
		}
	}

	var clickSquare = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('square');
		}
		$('#tools_rect_show').attr('src', 'images/square.png');
	}

	var clickRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('rect');
		}
		$('#tools_rect_show').attr('src', 'images/rect.png');
	}

	var clickFHRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('fhrect');
		}
		$('#tools_rect_show').attr('src', 'images/freehand-square.png');
	}

	var clickCircle = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('circle');
		}
		$('#tools_ellipse_show').attr('src', 'images/circle.png');
	}

	var clickEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('ellipse');
		}
		$('#tools_ellipse_show').attr('src', 'images/ellipse.png');
	}

	var clickFHEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('fhellipse');
		}
		$('#tools_ellipse_show').attr('src', 'images/freehand-circle.png');
	}

	// Delete is a contextual tool that only appears in the ribbon if
	// an element has been selected
	var deleteSelected = function() {
		if (selectedElement != null || multiselected) {
			svgCanvas.deleteSelectedElements();
		}
	}

	var moveToTopSelected = function() {
		if (selectedElement != null) {
			svgCanvas.moveToTopSelectedElement();
		}
	}

	var moveToBottomSelected = function() {
		if (selectedElement != null) {
			svgCanvas.moveToBottomSelectedElement();
		}
	}

	var moveSelected = function(dx,dy) {
		if (selectedElement != null) {
			svgCanvas.moveSelectedElement(dx,dy);
		}
	}

	var clickText = function(){
		toolButtonClick('#tool_text');
		svgCanvas.setMode('text');
	}

	var clickClear = function(){
		if( confirm('Do you want to clear the drawing?\nThis will also erase your undo history!') ) {
			svgCanvas.clear();
			updateContextPanel();
		}
	}
	
	var clickBold = function(){
	alert('wah?')
		svgCanvas.setBold( !svgCanvas.getBold() );
		updateContextPanel();
	};
	
	var clickItalic = function(){
		svgCanvas.setItalic( !svgCanvas.getItalic() );
		updateContextPanel();
	};

	var clickSave = function(){
		svgCanvas.save();
	}

	var clickUndo = function(){
		if (svgCanvas.getUndoStackSize() > 0)
			svgCanvas.undo();
	}

	var clickRedo = function(){
		if (svgCanvas.getRedoStackSize() > 0)
			svgCanvas.redo();
	}

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
	$('#tool_clear').click(clickClear);
	$('#tool_save').click(clickSave);
	$('#tool_delete').click(deleteSelected);
	$('#tool_delete_multi').click(deleteSelected);
	$('#tool_move_top').click(moveToTopSelected);
	$('#tool_move_bottom').click(moveToBottomSelected);
	$('#tool_undo').click(clickUndo);
	$('#tool_redo').click(clickRedo);
	// these two lines are required to make Opera work properly with the new flyout mechanism
	$('#tools_rect_show').click(clickSquare);
	$('#tools_ellipse_show').click(clickCircle);
	$('#tool_bold').mousedown(clickBold);
	$('#tool_italic').mousedown(clickItalic);

	// added these event handlers for all the push buttons so they
	// behave more like buttons being pressed-in and not images
	$('#tool_clear').mousedown(function(){$('#tool_clear').addClass('tool_button_current');});
	$('#tool_clear').mouseup(function(){$('#tool_clear').removeClass('tool_button_current');});
	$('#tool_clear').mouseout(function(){$('#tool_clear').removeClass('tool_button_current');});
	$('#tool_save').mousedown(function(){$('#tool_save').addClass('tool_button_current');});
	$('#tool_save').mouseup(function(){$('#tool_save').removeClass('tool_button_current');});
	$('#tool_save').mouseout(function(){$('#tool_save').removeClass('tool_button_current');});
	$('#tool_delete').mousedown(function(){$('#tool_delete').addClass('tool_button_current');});
	$('#tool_delete').mouseup(function(){$('#tool_delete').removeClass('tool_button_current');});
	$('#tool_delete').mouseout(function(){$('#tool_delete').removeClass('tool_button_current');});
	$('#tool_delete_multi').mousedown(function(){$('#tool_delete_multi').addClass('tool_button_current');});
	$('#tool_delete_multi').mouseup(function(){$('#tool_delete_multi').removeClass('tool_button_current');});
	$('#tool_delete_multi').mouseout(function(){$('#tool_delete_multi').removeClass('tool_button_current');});
	$('#tool_undo').mousedown(function(){ if (!$('#tool_undo').hasClass('tool_button_disabled')) $('#tool_undo').addClass('tool_button_current');});
	$('#tool_undo').mouseup(function(){$('#tool_undo').removeClass('tool_button_current');});
	$('#tool_undo').mouseout(function(){$('#tool_undo').removeClass('tool_button_current');});
	$('#tool_redo').mousedown(function(){ if (!$('#tool_redo').hasClass('tool_button_disabled')) $('#tool_redo').addClass('tool_button_current');});
	$('#tool_redo').mouseup(function(){$('#tool_redo').removeClass('tool_button_current');});
	$('#tool_redo').mouseout(function(){$('#tool_redo').removeClass('tool_button_current');});
	$('#tool_move_top').mousedown(function(){$('#tool_move_top').addClass('tool_button_current');});
	$('#tool_move_top').mouseup(function(){$('#tool_move_top').removeClass('tool_button_current');});
	$('#tool_move_top').mouseout(function(){$('#tool_move_top').removeClass('tool_button_current');});
	$('#tool_move_bottom').mousedown(function(){$('#tool_move_bottom').addClass('tool_button_current');});
	$('#tool_move_bottom').mouseup(function(){$('#tool_move_bottom').removeClass('tool_button_current');});
	$('#tool_move_bottom').mouseout(function(){$('#tool_move_bottom').removeClass('tool_button_current');});

	// do keybindings using jquery-hotkeys plugin
	$(document).bind('keydown', {combi:'1', disableInInput: true}, clickSelect);
	$(document).bind('keydown', {combi:'2', disableInInput: true}, clickPath);
	$(document).bind('keydown', {combi:'3', disableInInput: true}, clickLine);
	$(document).bind('keydown', {combi:'Shift+4', disableInInput: true}, clickSquare);
	$(document).bind('keydown', {combi:'4', disableInInput: true}, clickRect);
	$(document).bind('keydown', {combi:'Shift+5', disableInInput: true}, clickCircle);
	$(document).bind('keydown', {combi:'5', disableInInput: true}, clickEllipse);
	$(document).bind('keydown', {combi:'6', disableInInput: true}, clickText);
	$(document).bind('keydown', {combi:'N', disableInInput: true}, clickClear);
	$(document).bind('keydown', {combi:'S', disableInInput: true}, clickSave);
	$(document).bind('keydown', {combi:'del', disableInInput: true}, function(evt){deleteSelected();evt.preventDefault();});
	$(document).bind('keydown', {combi:'backspace', disableInInput: true}, function(evt){deleteSelected();evt.preventDefault();});
	$(document).bind('keydown', {combi:'shift+up', disableInInput: true}, moveToTopSelected);
	$(document).bind('keydown', {combi:'shift+down', disableInInput: true}, moveToBottomSelected);
	$(document).bind('keydown', {combi:'up', disableInInput: true}, function(evt){moveSelected(0,-1);evt.preventDefault();});
	$(document).bind('keydown', {combi:'down', disableInInput: true}, function(evt){moveSelected(0,1);evt.preventDefault();});
	$(document).bind('keydown', {combi:'left', disableInInput: true}, function(evt){moveSelected(-1,0);evt.preventDefault();});
	$(document).bind('keydown', {combi:'right', disableInInput: true}, function(evt){moveSelected(1,0);evt.preventDefault();});
	$(document).bind('keydown', {combi:'z', disableInInput: true}, clickUndo);
	$(document).bind('keydown', {combi:'shift+z', disableInInput: true}, clickRedo);
	$(document).bind('keydown', {combi:'y', disableInInput: true}, clickRedo);

	var colorPicker = function(elem) {
		var oldbg = elem.css('background');
		var color = elem.css('background-color');
		var oldopacity = "100 %";
		if (elem.attr('id') == 'stroke_color') {
			oldopacity = $('#stroke_opacity').html();
		}
		if (elem.attr('id') == 'fill_color') {
			oldopacity = $('#fill_opacity').html();
		}
		var was_none = false;
		if (color == 'transparent' || color == 'initial') {
			color = new $.jPicker.Color({ hex: 'ffffff', a: 100 });
			was_none = true;
		} else {
			var alpha;
			if (oldopacity == 'N/A') {
				alpha = 100;
			} else {
				alpha = oldopacity.split(' ')[0];
			}
			if (color.length == 7 && color[0] == '#') { // #hheexx notation
				color = new $.jPicker.Color( { hex: color.substring(1,7) , a: alpha } );
			} else if (color.substring(0,4) == 'rgb(' && color[color.length-1] == ')') { // rgb(r,g,b) notation
				var rgb = color.substring(4,color.length-1).split(',');
				color = new $.jPicker.Color({ r: rgb[0], g: rgb[1], b: rgb[2], a: alpha });
			} else {
				color = new $.jPicker.Color({ hex: 'ffffff', a: alpha });
			}
		}
		var pos = elem.position();
		picker = 'stroke';
		$('#color_picker').css({'left': pos.left - 140, 'bottom': 104 - pos.top}).jPicker({
			images: { clientPath: "jpicker/images/" },
			color: { active: color, alphaSupport: true }
		}, function(color){
			elem.css('background', '#' + this.settings.color.active.hex);
			if (elem.attr('id') == 'stroke_color') {
				svgCanvas.setStrokeColor('#' + this.settings.color.active.hex);
				svgCanvas.setStrokeOpacity(this.settings.color.active.a/100);
				$('#stroke_opacity').html(this.settings.color.active.a+" %");
			} else if (elem.attr('id') == 'fill_color') {
				svgCanvas.setFillColor('#' + this.settings.color.active.hex);
				svgCanvas.setFillOpacity(this.settings.color.active.a/100);
				$('#fill_opacity').html(this.settings.color.active.a+" %");
			}
			$('#color_picker').hide();
		}
		, null
		, function(){
			elem.css('background', oldbg);
			if (elem.attr('id') == 'stroke_color') {
				$('#stroke_opacity').html(oldopacity);
			} else if (elem.attr('id') == 'fill_color') {
				$('#fill_opacity').html(oldopacity);
			}
			if (was_none) {
				if (elem.attr('id') == 'stroke_color') {
					svgCanvas.setStrokeColor('none');
					$('#stroke_opacity').html('N/A');
				} else if (elem.attr('id') == 'fill_color') {
					svgCanvas.setFillColor('none');
					$('#fill_opacity').html('N/A');
				}
			}
			$('#color_picker').hide();
		});
	}

	function updateToolButtonState() {
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
	}

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
	$('#tools_rect').mouseleave(function() {
		$('#tools_rect').fadeOut();
	});

	$('#tools_ellipse_show').mousedown(function(evt){
		$('#tools_ellipse').show();
		// this prevents the 'image drag' behavior in Firefox
		evt.preventDefault();
	});
	$('#tools_ellipse').mouseleave(function() {
		$('#tools_ellipse').fadeOut();
	});

	$('.tool_flyout_button').mouseover(function() {
		$(this).addClass('tool_flyout_button_current');
	}).mouseout(function() {
		$(this).removeClass('tool_flyout_button_current');
	});

	function changeResolution(x,y) {
		$('#resolution').val(x+'x'+y);
		$('#svgroot').css( { 'width': x, 'height': y } );
		$('#svgcanvas').css( { 'width': x, 'height': y } );
	}

	$('#resolution').change(function(){
		var res = this.value.split('x');
		var x = parseInt(res[0]), y = parseInt(res[1]);
		svgCanvas.setResolution(x,y);
	});

	return svgCanvas;
};
