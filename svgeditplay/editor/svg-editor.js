function svg_edit_setup(container_id) {
	var svgCanvas = new SvgCanvas(document.getElementById(container_id));

	var setSelectMode = function() {
		$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
		$('#tool_select').addClass('tool_button_current');
		$('#styleoverrides').text('*{cursor:move;pointer-events:all} svg{cursor:default}');
		svgCanvas.setMode('select');
	}

	var textBeingEntered = false;
		
	$('#text').focus( function(){ textBeingEntered = true; } );
	$('#text').blur( function(){ textBeingEntered = false; } );

	
	
	

	var pos = $('#tools_rect_show').position();
	$('#tools_rect').css({'left': pos.left+2, 'top': pos.top+2});
	pos = $('#tools_ellipse_show').position();
	$('#tools_ellipse').css({'left': pos.left+2, 'top': pos.top+2});

	$('#stroke_width').change(function(){
		svgCanvas.setStrokeWidth(this.options[this.selectedIndex].value);
	});

	$('#stroke_style').change(function(){
		svgCanvas.setStrokeStyle(this.options[this.selectedIndex].value);
	});

	$('#stroke_opacity').change(function(){
		svgCanvas.setStrokeOpacity(this.options[this.selectedIndex].value);
	});

	$('#fill_opacity').change(function(){
		svgCanvas.setFillOpacity(this.options[this.selectedIndex].value);
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

	// This is a common function used when a tool has been clicked (chosen)
	// It does several common things:
	// - hides any flyout menus
	// - removes the tool_button_current class from whatever tool currently has it
	// - adds the tool_button_current class to the button passed in
	var toolButtonClick = function(button) {
		if ($(button).hasClass('tool_button_disabled')) return false;
		
		$('#styleoverrides').text('');
		$('.tools_flyout').hide();
		$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
		$(button).addClass('tool_button_current');
		// when a tool is selected, we should deselect the currently selected element
		svgCanvas.selectNone();
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
	}

	var clickRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('rect');
		}
	}

	var clickFHRect = function(){
		if (toolButtonClick('#tools_rect_show')) {
			svgCanvas.setMode('fhrect');
		}
	}

	var clickCircle = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('circle');
		}
	}

	var clickEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('ellipse');
		}
	}

	var clickFHEllipse = function(){
		if (toolButtonClick('#tools_ellipse_show')) {
			svgCanvas.setMode('fhellipse');
		}
	}

	// Delete is a contextual tool that only appears in the ribbon if
	// an element has been selected
	var deleteSelected = function() {
		if (selectedElement != null) {
			svgCanvas.deleteSelectedElement();
		}
	}

	var clickText = function(){
		toolButtonClick('#tool_text');
		svgCanvas.setMode('text');
	}

	var clickClear = function(){
		//if( confirm('Do you want to clear the this page?') ) {
			svgCanvas.rubberClear();
		//}
	}

	var clickSave = function(){
		svgCanvas.save();
	}
	
	var clickMediaStart = function(){
	
		$('#media_start').hide();
		$('#media_resume').hide();
		$('#media_pause').show();
		svgCanvas.startTimer();
	}
	
	var clickMediaPause = function(){
		$('#media_start').hide();
		$('#media_resume').show();
		$('#media_pause').hide();
		svgCanvas.pauseTimer();
	}
	
	var clickMediaResume = function(){
		$('#media_start').hide();
		$('#media_resume').hide();
		$('#media_pause').show();
		svgCanvas.resumeTimer();
	}
	
	var clickMediaStop = function(){
		$('#media_start').show();
		$('#media_resume').hide();
		$('#media_pause').hide();
		svgCanvas.stopTimer();
	}
	
	var clickRubber = function(){
		if (toolButtonClick('#tool_rubber')) {
			svgCanvas.setMode('rubber');
		}
	
	}

	 
	$('#tool_path').click(clickPath);
	$('#tool_line').click(clickLine);
	$('#tool_square').click(clickSquare);
	$('#tool_rect').click(clickRect);
	$('#tool_fhrect').click(clickFHRect);
	$('#tool_circle').click(clickCircle);
	$('#tool_ellipse').click(clickEllipse);
	$('#tool_fhellipse').click(clickFHEllipse);
	$('#tool_text').click(clickText);
	$('#tool_clear').click(clickClear);
	$('#tool_save').click(clickSave);
	$('#tool_rubber').click(clickRubber);
	$('#tool_delete').click(deleteSelected);
	$('#media_start').click(clickMediaStart);
	$('#media_pause').click(clickMediaPause);
	$('#media_pause').hide();
	$('#media_resume').hide();
	$('#media_stop').click(clickMediaStop);
	$('#media_resume').click(clickMediaResume);
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
	$(document).bind('keydown', {combi:'X', disableInInput: true}, deleteSelected);
	
	var colorPicker = function(elem) {
		$('.tools_flyout').hide();
		var oldbg = elem.css('background');
		var color = elem.css('background-color');
		var was_none = false;
		if (color == 'transparent') {
			color = new $.jPicker.Color({ hex: 'ffffff' });
			was_none = true;
		} else {
			if (color.length == 7 && color[0] == '#') { // #hheexx notation
				color = new $.jPicker.Color( { hex: color.substring(1,7) } );
			} else if (color.substring(0,4) == 'rgb(' && color[color.length-1] == ')') { // rgb(r,g,b) notation
				var rgb = color.substring(4,color.length-1).split(',');
				color = new $.jPicker.Color({ r: rgb[0], g: rgb[1], b: rgb[2] });
			} else {
				color = new $.jPicker.Color({ hex: 'ffffff' });
			}
		}
		var pos = elem.position();
		picker = 'stroke';
		$('#color_picker').css({'left': pos.left, 'top': pos.top}).jPicker({
			images: { clientPath: "jpicker/images/" },
			color: { active: color }
		}, function(color){
			elem.css('background', '#' + this.settings.color.active.hex);
			if (elem.attr('id') == 'stroke_color') {
				svgCanvas.setStrokeColor('#' + this.settings.color.active.hex);
			} else if (elem.attr('id') == 'fill_color') {
				svgCanvas.setFillColor('#' + this.settings.color.active.hex);
			}
			$('#color_picker').hide();
		}
		, null, function(){
			elem.css('background', oldbg);
			if (was_none) {
				if (elem.attr('id') == 'stroke_color') {
					svgCanvas.setStrokeColor('none');
				} else if (elem.attr('id') == 'fill_color') {
					svgCanvas.setFillColor('none');
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

	// this hides any flyouts and then shows the rect flyout
	$('#tools_rect_show').click(function(){
		$('.tools_flyout').hide();
		$('#tools_rect').show();
	});

	// this hides any flyouts and then shows the circle flyout
	$('#tools_ellipse_show').click(function(){
		$('.tools_flyout').hide();
		$('#tools_ellipse').show();
	});

	return svgCanvas;
};
