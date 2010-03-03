/*
 * jGraduate 0.3.x
 *
 * jQuery Plugin for a gradient picker
 *
 * Copyright (c) 2009 Jeff Schiller
 * http://blog.codedread.com/
 *
 * Apache 2 License

jGraduate( options, okCallback, cancelCallback )

where options is an object literal:
	{
		window: { title: "Pick the start color and opacity for the gradient" },
		images: { clientPath: "images/" },
		paint: a Paint object
	}
 
- the Paint object is:
	Paint {
		type: String, // one of "none", "solidColor", "linearGradient", "radialGradient"
		alpha: Number representing opacity (0-100),
		solidColor: String representing #RRGGBB hex of color,
		linearGradient: object of interface SVGLinearGradientElement,
	}

$.jGraduate.Paint() -> constructs a 'none' color
$.jGraduate.Paint({copy: o}) -> creates a copy of the paint o
$.jGraduate.Paint({hex: "#rrggbb"}) -> creates a solid color paint with hex = "#rrggbb"
$.jGraduate.Paint({linearGradient: o, a: 50}) -> creates a linear gradient paint with opacity=0.5
$.jGraduate.Paint({hex: "#rrggbb", linearGradient: o}) -> throws an exception?

- picker accepts the following object as input:
	{
		okCallback: function to call when Ok is pressed
		cancelCallback: function to call when Cancel is pressed
		paint: object describing the paint to display initially, if not set, then default to opaque white
	}

- okCallback receives a Paint object

 *
 */
var ns = { svg: 'http://www.w3.org/2000/svg', xlink: 'http://www.w3.org/1999/xlink' };
if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}
$.cloneNode = function(el) {
	if(!window.opera) return el.cloneNode(true);
	// manually create a copy of the element
	opera.postError(ns.svg, el.nodeName);
	var new_el = document.createElementNS(ns.svg, el.nodeName);
	$.each(el.attributes, function(i, attr) {
		new_el.setAttributeNS(ns.svg, attr.nodeName, attr.nodeValue);
	});
	$.each(el.childNodes, function(i, child) {
		if(child.nodeType == 1) {
			new_el.appendChild($.cloneNode(child));
		}
	});
	return new_el;
}

$.jGraduate = { 
	Paint:
		function(opt) {
			var options = opt || {};
			this.alpha = options.alpha || 100;
			// copy paint object
    		if (options.copy) {
    			this.type = options.copy.type;
    			this.alpha = options.copy.alpha;
    			switch(this.type) {
    				case "none":
    					this.solidColor = null;
    					this.linearGradient = null;
    					break;
    				case "solidColor":
    					this.solidColor = options.copy.solidColor;
    					this.linearGradient = null;
    					break;
    				case "linearGradient":
    					this.solidColor = null;
    					this.linearGradient = $.cloneNode(options.copy.linearGradient);
    					break;
    			}
    		}
    		// create linear gradient paint
    		else if (options.linearGradient) {
    			this.type = "linearGradient";
    			this.solidColor = null;
    			this.linearGradient = $.cloneNode(options.linearGradient);
    		}
    		// create solid color paint
    		else if (options.solidColor) {
    			this.type = "solidColor";
    			this.solidColor = options.solidColor;
    		}
    		// create empty paint
	    	else {
	    		this.type = "none";
    			this.solidColor = null;
    			this.linearGradient = null;
	    	}
		}
};

jQuery.fn.jGraduateDefaults = {
	paint: new $.jGraduate.Paint(),
	window: {
		pickerTitle: "Drag markers to pick a paint",
	},
	images: {
		clientPath: "images/",
	},
};

jQuery.fn.jGraduate =
	function(options) {
	 	var $arguments = arguments;
		return this.each( function() {
			var $this = $(this), $settings = $.extend(true, {}, jQuery.fn.jGraduateDefaults, options),
				id = $this.attr('id'),
				idref = '#'+$this.attr('id')+' ';
			
            if (!idref)
            {
              alert('Container element must have an id attribute to maintain unique id strings for sub-elements.');
              return;
            }
            
            var okClicked = function() {
            	$.isFunction($this.okCallback) && $this.okCallback($this.paint);
            	$this.hide();
            },
            cancelClicked = function() {
            	$.isFunction($this.cancelCallback) && $this.cancelCallback();
            	$this.hide();
            };

            $.extend(true, $this, // public properties, methods, and callbacks
              {
              	// make a copy of the incoming paint
                paint: new $.jGraduate.Paint({copy: $settings.paint}),
                okCallback: $.isFunction($arguments[1]) && $arguments[1] || null,
                cancelCallback: $.isFunction($arguments[2]) && $arguments[2] || null,
              });

			var pos = $this.position(),
				color = null;

			if ($this.paint.type == "none") {
				$this.paint = $.jGraduate.Paint({solidColor: 'ffffff'});
			}

            $this.addClass('jGraduate_Picker');
            $this.html('<ul class="jGraduate_tabs">' +
            				'<li class="jGraduate_tab_color jGraduate_tab_current">Solid Color</li>' +
            				'<li class="jGraduate_tab_lingrad">Linear Gradient</li>' +
            			'</ul>' +
            			'<div class="jGraduate_colPick"></div>' +
            			'<div class="jGraduate_lgPick"></div>');
			var colPicker = $(idref + '> .jGraduate_colPick');
			var lgPicker = $(idref + '> .jGraduate_lgPick');
			
            lgPicker.html(
            	'<div id="' + id + '_jGraduate_Swatch" class="jGraduate_Swatch">' +
            		'<h2 class="jGraduate_Title">' + $settings.window.pickerTitle + '</h2>' +
            		'<div id="' + id + '_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>' +
            		'<div id="' + id + '_jGraduate_Opacity" class="jGraduate_Opacity" title="Click to set overall opacity of the gradient paint">' +
            			'<img id="' + id + '_jGraduate_AlphaArrows" class="jGraduate_AlphaArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif"></img>' +
            		'</div>' +
            	'</div>' + 
            	'<div class="jGraduate_Form">' +
            		'<div class="jGraduate_StopSection">' +
	            		'<label class="jGraduate_Form_Heading">Begin Stop</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
        	    			'<label>x:</label>' +
            				'<input type="text" id="' + id + '_jGraduate_x1" size="3" title="Enter starting x value between 0.0 and 1.0"/>' +
            				'<label> y:</label>' +
            				'<input type="text" id="' + id + '_jGraduate_y1" size="3" title="Enter starting y value between 0.0 and 1.0"/>' +
	        	    		'<div id="' + id + '_jGraduate_colorBoxBegin" class="colorBox"></div>' +
		            		'<label id="' + id + '_jGraduate_beginOpacity"> 100%</label>' +
        	   			'</div>' +
        	   		'</div>' +
        	   		'<div class="jGraduate_StopSection">' +
	            		'<label class="jGraduate_Form_Heading">End Stop</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
	    	        		'<label>x:</label>' +
		    	        	'<input type="text" id="' + id + '_jGraduate_x2" size="3" title="Enter ending x value between 0.0 and 1.0"/>' +
    		    	    	'<label> y:</label>' +
        		    		'<input type="text" id="' + id + '_jGraduate_y2" size="3" title="Enter ending y value between 0.0 and 1.0"/>' +
        	    			'<div id="' + id + '_jGraduate_colorBoxEnd" class="colorBox"></div>' +
			            	'<label id="' + id + '_jGraduate_endOpacity">100%</label>' +
    	    	    	'</div>' +
    	    	    '</div>' +
    	    	    '<div class="jGraduate_OpacityField">' +
    	    	    	'<label class="jGraduate_OpacityLabel">A: </label>' +
    	    	    	'<input type="text" id="' + id + '_jGraduate_OpacityInput" class="jGraduate_OpacityInput" size="3" value="100"/>%' +
    	    	    '</div>' +
    	       	'</div>' +
        	    '<div class="jGraduate_OkCancel">' +
            		'<input type="button" id="' + id + '_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>' +
            		'<input type="button" id="' + id + '_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>' +
            	'</div>' +
            	'<div class="jGraduate_LightBox"></div>' +
            	'<div id="' + id + '_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>');
			
			// --------------
            // Set up all the SVG elements (the gradient, stops and rectangle)
            var MAX = 256, MARGINX = 0, MARGINY = 0, STOP_RADIUS = 15/2,
            	SIZEX = MAX - 2*MARGINX, SIZEY = MAX - 2*MARGINY;
            var container = document.getElementById(id+'_jGraduate_GradContainer');
            var svg = container.appendChild(document.createElementNS(ns.svg, 'svg'));
            svg.id = id+'_jgraduate_svg';            
            svg.setAttribute('width', MAX);
            svg.setAttribute('height', MAX);
			svg.setAttribute("xmlns", ns.svg);
			
			// if we are sent a gradient, import it 
			if ($this.paint.type == "linearGradient") {
				$this.paint.linearGradient.id = id+'_jgraduate_grad';
				$this.paint.linearGradient = svg.appendChild($.cloneNode($this.paint.linearGradient));
			}
			else { // we create a gradient
				var grad = svg.appendChild(document.createElementNS(ns.svg, 'linearGradient'));
				grad.id = id+'_jgraduate_grad';
				grad.setAttribute('x1','0.0');
				grad.setAttribute('y1','0.0');
				grad.setAttribute('x2','1.0');
				grad.setAttribute('y2','1.0');
				
				var begin = grad.appendChild(document.createElementNS(ns.svg, 'stop'));
				begin.setAttribute('offset', '0.0');
				begin.setAttribute('stop-color', '#ff0000');

				var end = grad.appendChild(document.createElementNS(ns.svg, 'stop'));
				end.setAttribute('offset', '1.0');
				end.setAttribute('stop-color', '#ffff00');
			
				$this.paint.linearGradient = grad;
			}

			var gradalpha = $this.paint.alpha;
            $('#' + id + '_jGraduate_OpacityInput').val(gradalpha);
			var posx = parseInt(255*(gradalpha/100)) - 4.5;
            $('#' + id + '_jGraduate_AlphaArrows').css({'margin-left':posx});
            $('#' + id + '_jgraduate_rect').attr('fill-opacity', gradalpha/100);
			
			var x1 = parseFloat($this.paint.linearGradient.getAttribute('x1')||0.0),
				y1 = parseFloat($this.paint.linearGradient.getAttribute('y1')||0.0),
				x2 = parseFloat($this.paint.linearGradient.getAttribute('x2')||1.0),
				y2 = parseFloat($this.paint.linearGradient.getAttribute('y2')||0.0);
			
            var rect = document.createElementNS(ns.svg, 'rect');
            rect.id = id + '_jgraduate_rect';
            rect.setAttribute('x', MARGINX);
            rect.setAttribute('y', MARGINY);
            rect.setAttribute('width', SIZEY);
            rect.setAttribute('height', SIZEY);
            rect.setAttribute('fill', 'url(#'+id+'_jgraduate_grad)');
            rect.setAttribute('fill-opacity', '1.0');
            rect = svg.appendChild(rect);
            
            // stop visuals created here
            var beginStop = document.createElementNS(ns.svg, 'image');
            beginStop.id = id + "_stop1";
            beginStop.setAttribute('class', 'stop');
            beginStop.setAttributeNS(ns.xlink, 'href', $settings.images.clientPath + 'mappoint.gif');
            beginStop.setAttributeNS(ns.xlink, "title", "Begin Stop");
            beginStop.appendChild(document.createElementNS(ns.svg, 'title')).appendChild(
            	document.createTextNode("Begin Stop"));
            beginStop.setAttribute('width', 18);
            beginStop.setAttribute('height', 18);
            beginStop.setAttribute('x', MARGINX + SIZEX*x1 - STOP_RADIUS);
            beginStop.setAttribute('y', MARGINY + SIZEY*y1 - STOP_RADIUS);
            beginStop.setAttribute('cursor', 'move');
            // must append only after setting all attributes due to Webkit Bug 27952
            // https://bugs.webkit.org/show_bug.cgi?id=27592
            beginStop = svg.appendChild(beginStop);
            
            var endStop = document.createElementNS(ns.svg, 'image');
            endStop.id = id + "_stop2";
            endStop.setAttribute('class', 'stop');
            endStop.setAttributeNS(ns.xlink, 'href', $settings.images.clientPath + 'mappoint.gif');
            endStop.setAttributeNS(ns.xlink, "title", "End Stop");
            endStop.appendChild(document.createElementNS(ns.svg, 'title')).appendChild(
            	document.createTextNode("End Stop"));
            endStop.setAttribute('width', 18);
            endStop.setAttribute('height', 18);
            endStop.setAttribute('x', MARGINX + SIZEX*x2 - STOP_RADIUS);
            endStop.setAttribute('y', MARGINY + SIZEY*y2 - STOP_RADIUS);
            endStop.setAttribute('cursor', 'move');
            endStop = svg.appendChild(endStop);
            
            // bind GUI elements
            $('#'+id+'_jGraduate_Ok').bind('click', function() {
            	$this.paint.type = "linearGradient";
				$this.paint.solidColor = null;
            	okClicked();
            });
            $('#'+id+'_jGraduate_Cancel').bind('click', function(paint) {
            	cancelClicked();
            });
            
            var x1 = $this.paint.linearGradient.getAttribute('x1');
            if(!x1) x1 = "0.0";
            x1Input = $('#'+id+'_jGraduate_x1');
            x1Input.val(x1);
            x1Input.change( function() {
            	if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
            		this.value = 0.0; 
            	}
            	$this.paint.linearGradient.setAttribute('x1', this.value);
            	beginStop.setAttribute('x', MARGINX + SIZEX*this.value - STOP_RADIUS);
            });

            var y1 = $this.paint.linearGradient.getAttribute('y1');
            if(!y1) y1 = "0.0";
            y1Input = $('#'+id+'_jGraduate_y1');
            y1Input.val(y1);
            y1Input.change( function() {
            	if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
            		this.value = 0.0; 
            	}
            	$this.paint.linearGradient.setAttribute('y1', this.value);
            	beginStop.setAttribute('y', MARGINY + SIZEY*this.value - STOP_RADIUS);
            });
            
            var x2 = $this.paint.linearGradient.getAttribute('x2');
            if(!x2) x2 = "1.0";
            x2Input = $('#'+id+'_jGraduate_x2');
            x2Input.val(x2);
            x2Input.change( function() {
            	if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
            		this.value = 1.0;
            	}
            	$this.paint.linearGradient.setAttribute('x2', this.value);
            	endStop.setAttribute('x', MARGINX + SIZEX*this.value - STOP_RADIUS);
            });
            
            var y2 = $this.paint.linearGradient.getAttribute('y2');
            if(!y2) y2 = "0.0";
            y2Input = $('#'+id+'_jGraduate_y2');
            y2Input.val(y2);
            y2Input.change( function() {
            	if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
            		this.value = 0.0;
            	}
            	$this.paint.linearGradient.setAttribute('y2', this.value);
            	endStop.setAttribute('y', MARGINY + SIZEY*this.value - STOP_RADIUS);
            });            
            
            var stops = $this.paint.linearGradient.getElementsByTagNameNS(ns.svg, 'stop');
            var numstops = stops.length;
            // if there are not at least two stops, then 
            if (numstops < 2) {
	            while (numstops < 2) {
    	        	$this.paint.linearGradient.appendChild( document.createElementNS(ns.svg, 'stop') );
        	    	++numstops;
            	}
            	stops = $this.paint.linearGradient.getElementsByTagNameNS(ns.svg, 'stop');
            }
            
            var setOpacitySlider = function(e, div) {
            	var offset = div.offset();
            	var x = (e.pageX - offset.left - parseInt(div.css('border-left-width')));
            	if (x > 255) x = 255;
            	if (x < 0) x = 0;
            	var posx = x - 4.5;
            	x /= 255;
            	$('#' + id + '_jGraduate_AlphaArrows').css({'margin-left':posx});
            	$('#' + id + '_jgraduate_rect').attr('fill-opacity', x);
            	x = parseInt(x*100);
            	$('#' + id + '_jGraduate_OpacityInput').val(x);
            	$this.paint.alpha = x;
            };
            
            // handle dragging on the opacity slider
            var bSlidingOpacity = false;
            $('.jGraduate_Opacity').mousedown(function(evt) {
            	setOpacitySlider(evt, $(this));
            	bSlidingOpacity = true;
            	evt.preventDefault();
            });
            $('.jGraduate_Opacity').mousemove(function(evt) {
            	if (bSlidingOpacity) {
            		setOpacitySlider(evt, $(this));
            		evt.preventDefault();
            	}
            });
            $('.jGraduate_Opacity').mouseup(function(evt) {
            	setOpacitySlider(evt, $(this));
            	bSlidingOpacity = false;
            	evt.preventDefault();
            });
            
			// handle dragging the stop around the swatch
            var draggingStop = null;
            var startx = -1, starty = -1;
            // for whatever reason, Opera does not allow $('image.stop') here,
            // and Firefox 1.5 does not allow $('.stop')
            $('.stop, #color_picker_jGraduate_GradContainer image').mousedown(function(evt) {
            	draggingStop = this;
            	startx = evt.clientX;
            	starty = evt.clientY;
            	evt.preventDefault();
            });
            $('#'+id+'_jgraduate_svg').mousemove(function(evt) {
            	if (null != draggingStop) {
            		var dx = evt.clientX - startx;
            		var dy = evt.clientY - starty;
            		startx += dx;
            		starty += dy;
            		var x = parseFloat(draggingStop.getAttribute('x')) + dx;
            		var y = parseFloat(draggingStop.getAttribute('y')) + dy;

					// clamp stop to the swatch
            		if (x < MARGINX - STOP_RADIUS) x = MARGINX - STOP_RADIUS;
            		if (y < MARGINY - STOP_RADIUS) y = MARGINY - STOP_RADIUS;
            		if (x > MARGINX + SIZEX - STOP_RADIUS) x = MARGINX + SIZEX - STOP_RADIUS;
            		if (y > MARGINY + SIZEY - STOP_RADIUS) y = MARGINY + SIZEY - STOP_RADIUS;
            		            		
            		draggingStop.setAttribute('x', x);
            		draggingStop.setAttribute('y', y);

					// calculate stop offset            		
            		var fracx = (x - MARGINX + STOP_RADIUS)/SIZEX;
            		var fracy = (y - MARGINY + STOP_RADIUS)/SIZEY;
            		
            		if (draggingStop.id == (id+'_stop1')) {
            			x1Input.val(fracx);
            			y1Input.val(fracy);
            			$this.paint.linearGradient.setAttribute('x1', fracx);
            			$this.paint.linearGradient.setAttribute('y1', fracy);
            		}
            		else {
            			x2Input.val(fracx);
            			y2Input.val(fracy);
            			$this.paint.linearGradient.setAttribute('x2', fracx);
            			$this.paint.linearGradient.setAttribute('y2', fracy);
            		}
            		
            		evt.preventDefault();
            	}
            });
            $('#'+id+'_jgraduate_svg').mouseup(function(evt) {
            	draggingStop = null;
            });
            
            var beginColor = stops[0].getAttribute('stop-color');
            if(!beginColor) beginColor = '#000';
            beginColorBox = $('#'+id+'_jGraduate_colorBoxBegin');
            beginColorBox.css({'background-color':beginColor});

            var beginOpacity = stops[0].getAttribute('stop-opacity');
            if(!beginOpacity) beginOpacity = '1.0';
            $('#'+id+'jGraduate_beginOpacity').html( (beginOpacity*100)+'%' );

            var endColor = stops[stops.length-1].getAttribute('stop-color');
            if(!endColor) endColor = '#000';
            endColorBox = $('#'+id+'_jGraduate_colorBoxEnd');
            endColorBox.css({'background-color':endColor});

            var endOpacity = stops[stops.length-1].getAttribute('stop-opacity');
            if(!endOpacity) endOpacity = '1.0';
            $('#'+id+'jGraduate_endOpacity').html( (endOpacity*100)+'%' );
            
			$('#'+id+'_jGraduate_colorBoxBegin').click(function() {
				$('div.jGraduate_LightBox').show();			
				var colorbox = $(this);
				var thisAlpha = (parseFloat(beginOpacity)*255).toString(16);
				while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
				color = beginColor.substr(1) + thisAlpha;
				$('#'+id+'_jGraduate_stopPicker').css({'left': 100, 'bottom': 15}).jPicker({
						window: { title: "Pick the start color and opacity for the gradient" },
						images: { clientPath: $settings.images.clientPath },
						color: { active: color, alphaSupport: true }
					}, function(color){
						beginColor = color.get_Hex() ? ('#'+color.get_Hex()) : "none";
						beginOpacity = color.get_A() ? color.get_A()/100 : 1;
						colorbox.css('background', beginColor);
						$('#'+id+'_jGraduate_beginOpacity').html(parseInt(beginOpacity*100)+'%');
            			stops[0].setAttribute('stop-color', beginColor);
						stops[0].setAttribute('stop-opacity', beginOpacity);
						$('div.jGraduate_LightBox').hide();
						$('#'+id+'_jGraduate_stopPicker').hide();
					}, null, function() {
						$('div.jGraduate_LightBox').hide();
						$('#'+id+'_jGraduate_stopPicker').hide();
					});
			});
			$('#'+id+'_jGraduate_colorBoxEnd').click(function() {
				$('div.jGraduate_LightBox').show();
				var colorbox = $(this);
				var thisAlpha = (parseFloat(endOpacity)*255).toString(16);
				while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
				color = endColor.substr(1) + thisAlpha;
				$('#'+id+'_jGraduate_stopPicker').css({'left': 100, 'top': 15}).jPicker({
						window: { title: "Pick the end color and opacity for the gradient" },
						images: { clientPath: $settings.images.clientPath },
						color: { active: color, alphaSupport: true }
					}, function(color){
						endColor = color.get_Hex() ? ('#'+color.get_Hex()) : "none";
						endOpacity = color.get_A() ? color.get_A()/100 : 1;
						colorbox.css('background', endColor);
						$('#'+id+'_jGraduate_endOpacity').html(parseInt(endOpacity*100)+'%');
            			stops[1].setAttribute('stop-color', endColor);
						stops[1].setAttribute('stop-opacity', endOpacity);
						$('div.jGraduate_LightBox').hide();
						$('#'+id+'_jGraduate_stopPicker').hide();
					}, null, function() {
						$('div.jGraduate_LightBox').hide();
						$('#'+id+'_jGraduate_stopPicker').hide();
					});
			});            
            
			// --------------
			var thisAlpha = ($this.paint.alpha*255/100).toString(16);
			while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
			color = $this.paint.solidColor == "none" ? "" : $this.paint.solidColor + thisAlpha;
			colPicker.jPicker(
				{
					window: { title: $settings.window.pickerTitle },
					images: { clientPath: $settings.images.clientPath },
					color: { active: color, alphaSupport: true }
				},
				function(color) {
					$this.paint.type = "solidColor";
					$this.paint.alpha = color.get_A() ? color.get_A() : 100;
					$this.paint.solidColor = color.get_Hex() ? color.get_Hex() : "none";
					$this.paint.linearGradient = null;
					okClicked(); 
				},
				null,
				function(){ cancelClicked(); }
				);
				
			$(idref + ' .jGraduate_tab_color').click( function(){
				$(idref + ' .jGraduate_tab_lingrad').removeClass('jGraduate_tab_current');
				$(idref + ' .jGraduate_tab_color').addClass('jGraduate_tab_current');
				lgPicker.hide();
				colPicker.show();
			});
			$(idref + ' .jGraduate_tab_lingrad').click( function(){
				$(idref + ' .jGraduate_tab_color').removeClass('jGraduate_tab_current');
				$(idref + ' .jGraduate_tab_lingrad').addClass('jGraduate_tab_current');
				colPicker.hide();
				lgPicker.show();
			});
			
			if ($this.paint.type == "linearGradient") {
				lgPicker.show();
				colPicker.hide();
				$(idref + ' .jGraduate_tab_color').removeClass('jGraduate_tab_current');
				$(idref + ' .jGraduate_tab_lingrad').addClass('jGraduate_tab_current');				
			}
			else {
				colPicker.show();
				lgPicker.hide();
				$(idref + ' .jGraduate_tab_color').addClass('jGraduate_tab_current');
				$(idref + ' .jGraduate_tab_lingrad').removeClass('jGraduate_tab_current');				
			}

			$this.show();
		});
	};
