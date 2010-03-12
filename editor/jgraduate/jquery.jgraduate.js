/*
 * jGraduate 0.3.x
 *
 * jQuery Plugin for a gradient picker
 *
 * Copyright (c) 2010 Jeff Schiller
 * http://blog.codedread.com/
 * Copyright (c) 2010 Alexis Deveria
 * http://a.deveria.com/
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
		radialGradient: object of interface SVGRadialGradientElement,
	}

$.jGraduate.Paint() -> constructs a 'none' color
$.jGraduate.Paint({copy: o}) -> creates a copy of the paint o
$.jGraduate.Paint({hex: "#rrggbb"}) -> creates a solid color paint with hex = "#rrggbb"
$.jGraduate.Paint({linearGradient: o, a: 50}) -> creates a linear gradient paint with opacity=0.5
$.jGraduate.Paint({radialGradient: o, a: 7}) -> creates a radial gradient paint with opacity=0.07
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
 
(function() {
 
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
				this.solidColor = null;
				this.linearGradient = null;
				this.radialGradient = null;

    			switch(this.type) {
    				case "none":
    					break;
    				case "solidColor":
    					this.solidColor = options.copy.solidColor;
    					break;
    				case "linearGradient":
    					this.linearGradient = $.cloneNode(options.copy.linearGradient);
    					break;
    				case "radialGradient":
    					this.radialGradient = $.cloneNode(options.copy.radialGradient);
    					break;
    			}
    		}
    		// create linear gradient paint
    		else if (options.linearGradient) {
    			this.type = "linearGradient";
    			this.solidColor = null;
    			this.radialGradient = null;
    			this.linearGradient = $.cloneNode(options.linearGradient);
    		}
    		// create linear gradient paint
    		else if (options.radialGradient) {
    			this.type = "radialGradient";
    			this.solidColor = null;
    			this.linearGradient = null;
    			this.radialGradient = $.cloneNode(options.radialGradient);
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
    			this.radialGradient = null;
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
	            // TODO: Fix this ugly hack
	            if($this.paint.type == "radialGradient") {
	            	$this.paint.linearGradient = null;
	            } else if($this.paint.type == "linearGradient") {
	            	$this.paint.radialGradient = null;	            
	            } else if($this.paint.type == "solidColor") {
	            	$this.paint.linearGradient = null;
	            	$this.paint.radialGradient = null;
	            }
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
            				'<li class="jGraduate_tab_color jGraduate_tab_current" data-type="col">Solid Color</li>' +
            				'<li class="jGraduate_tab_lingrad" data-type="lg">Linear Gradient</li>' +
            				'<li class="jGraduate_tab_radgrad" data-type="rg">Radial Gradient</li>' +
            			'</ul>' +
            			'<div class="jGraduate_colPick"></div>' +
            			'<div class="jGraduate_lgPick"></div>' +
            			'<div class="jGraduate_rgPick"></div>');
			var colPicker = $(idref + '> .jGraduate_colPick');
			var lgPicker = $(idref + '> .jGraduate_lgPick');
			var rgPicker = $(idref + '> .jGraduate_rgPick');
			
            lgPicker.html(
            	'<div id="' + id + '_jGraduate_Swatch" class="jGraduate_Swatch">' +
            		'<h2 class="jGraduate_Title">' + $settings.window.pickerTitle + '</h2>' +
            		'<div id="' + id + '_lg_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>' +
            		'<div id="' + id + '_lg_jGraduate_Opacity" class="jGraduate_Opacity" title="Click to set overall opacity of the gradient paint">' +
            			'<img id="' + id + '_lg_jGraduate_AlphaArrows" class="jGraduate_AlphaArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif"></img>' +
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
    	    	    '<div class="lg_jGraduate_OpacityField">' +
    	    	    	'<label class="lg_jGraduate_OpacityLabel">A: </label>' +
    	    	    	'<input type="text" id="' + id + '_lg_jGraduate_OpacityInput" class="jGraduate_OpacityInput" size="3" value="100"/>%' +
    	    	    '</div>' +
    	       	'</div>' +
        	    '<div class="jGraduate_OkCancel">' +
            		'<input type="button" id="' + id + '_lg_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>' +
            		'<input type="button" id="' + id + '_lg_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>' +
            	'</div>' +
            	'<div class="jGraduate_LightBox"></div>' +
            	'<div id="' + id + '_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>');
            	
            rgPicker.html(
            	'<div class="jGraduate_Swatch">' +
            		'<h2 class="jGraduate_Title">' + $settings.window.pickerTitle + '</h2>' +
            		'<div id="' + id + '_rg_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>' +
            		'<div id="' + id + '_rg_jGraduate_Opacity" class="jGraduate_Opacity" title="Click to set overall opacity of the gradient paint">' +
            			'<img id="' + id + '_rg_jGraduate_AlphaArrows" class="jGraduate_AlphaArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif"></img>' +
            		'</div>' +
            	'</div>' + 
				'<div id="jGraduate_radColors" class="jGraduate_StopSection">' +
					'<label class="jGraduate_Form_Heading">Colors</label>' +
					'<div class="jGraduate_Form_Section jGraduate_Colorblocks">' +
						'<div class="jGraduate_colorblock"><span>Center:</span>' +
						'<div id="' + id + '_jGraduate_colorBoxCenter" class="colorBox"></div>' +
						'<label id="' + id + '_rg_jGraduate_centerOpacity"> 100%</label></div>' +

						'<div class="jGraduate_colorblock"><span>Outer:</span>' +
							'<div id="' + id + '_jGraduate_colorBoxOuter" class="colorBox"></div>' +
							'<label id="' + id + '_jGraduate_outerOpacity"> 100%</label></div>' +
					'</div>' +
				'</div>' +
				'<div class="jGraduate_StopSection">' +
				'</div>' +
            	'<div class="jGraduate_Form">' +
        	   		'<div class="jGraduate_StopSection">' +
	            		'<label class="jGraduate_Form_Heading">Center Point</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
	    	        		'<label>x:</label>' +
		    	        	'<input type="text" id="' + id + '_jGraduate_cx" size="3" title="Enter x value between 0.0 and 1.0"/>' +
    		    	    	'<label> y:</label>' +
        		    		'<input type="text" id="' + id + '_jGraduate_cy" size="3" title="Enter y value between 0.0 and 1.0"/>' +
    	    	    	'</div>' +
    	    	    '</div>' +
        	   		'<div class="jGraduate_StopSection">' +
	            		'<label class="jGraduate_Form_Heading">Focal Point</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
	    	        		'<label>Match center: <input type="checkbox" checked="checked" id="' + id + '_jGraduate_match_ctr"/></label><br/>' +
	    	        		'<label>x:</label>' +
		    	        	'<input type="text" id="' + id + '_jGraduate_fx" size="3" title="Enter x value between 0.0 and 1.0"/>' +
    		    	    	'<label> y:</label>' +
        		    		'<input type="text" id="' + id + '_jGraduate_fy" size="3" title="Enter y value between 0.0 and 1.0"/>' +
    	    	    	'</div>' +
    	    	    '</div>' +
        	   		'<div class="jGraduate_RadiusField">' +
	            		'<label class="jGraduate_Form_Heading">Radius</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
							'<div id="' + id + '_jGraduate_RadiusContainer" class="jGraduate_RadiusContainer"></div>' +
							'<input type="text" id="' + id + '_jGraduate_RadiusInput" size="3" value="100"/>%' +
							'<div id="' + id + '_jGraduate_Radius" class="jGraduate_Radius" title="Click to set radius">' +
								'<img id="' + id + '_jGraduate_RadiusArrows" class="jGraduate_RadiusArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif"></img>' +
							'</div>' +
    	    	    	'</div>' +
    	    	    '</div>' +
    	       	'</div>' +
				'<div class="rg_jGraduate_OpacityField">' +
					'<label class="rg_jGraduate_OpacityLabel">A: </label>' +
					'<input type="text" id="' + id + '_rg_jGraduate_OpacityInput" class="jGraduate_OpacityInput" size="3" value="100"/>%' +
				'</div>' +
        	    '<div class="jGraduate_OkCancel">' +
            		'<input type="button" id="' + id + '_rg_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>' +
            		'<input type="button" id="' + id + '_rg_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>' +
            	'</div>' +
            	'<div class="jGraduate_LightBox"></div>' +
            	'<div id="' + id + '_rg_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>');
			
			// --------------
            // Set up all the SVG elements (the gradient, stops and rectangle)
            var MAX = 256, MARGINX = 0, MARGINY = 0, STOP_RADIUS = 15/2,
            	SIZEX = MAX - 2*MARGINX, SIZEY = MAX - 2*MARGINY;
            	
            $.each(['lg', 'rg'], function(i) {
            	var grad_id = id + '_' + this;
				var container = document.getElementById(grad_id+'_jGraduate_GradContainer');
				var svg = container.appendChild(document.createElementNS(ns.svg, 'svg'));
				svg.id = grad_id + '_jgraduate_svg';            
				svg.setAttribute('width', MAX);
				svg.setAttribute('height', MAX);
				svg.setAttribute("xmlns", ns.svg);
            });
			
			
			// Linear gradient
			(function() {
				var svg = document.getElementById(id + '_lg_jgraduate_svg');
				
				// if we are sent a gradient, import it 
				if ($this.paint.type == "linearGradient") {
					$this.paint.linearGradient.id = id+'_jgraduate_grad';
					$this.paint.linearGradient = svg.appendChild($.cloneNode($this.paint.linearGradient));
				} else { // we create a gradient
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
				$('#' + id + '_lg_jGraduate_OpacityInput').val(gradalpha);
				var posx = parseInt(255*(gradalpha/100)) - 4.5;
				$('#' + id + '_lg_jGraduate_AlphaArrows').css({'margin-left':posx});
				
				var x1 = parseFloat($this.paint.linearGradient.getAttribute('x1')||0.0),
					y1 = parseFloat($this.paint.linearGradient.getAttribute('y1')||0.0),
					x2 = parseFloat($this.paint.linearGradient.getAttribute('x2')||1.0),
					y2 = parseFloat($this.paint.linearGradient.getAttribute('y2')||0.0);
				
				var rect = document.createElementNS(ns.svg, 'rect');
				rect.id = id + '_lg_jgraduate_rect';
				rect.setAttribute('x', MARGINX);
				rect.setAttribute('y', MARGINY);
				rect.setAttribute('width', SIZEY);
				rect.setAttribute('height', SIZEY);
				rect.setAttribute('fill', 'url(#'+id+'_jgraduate_grad)');
				rect.setAttribute('fill-opacity', '1.0');
				rect = svg.appendChild(rect);
				$('#' + id + '_lg_jgraduate_rect').attr('fill-opacity', gradalpha/100);
				
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
				$('#'+id+'_lg_jGraduate_Ok').bind('click', function() {
					$this.paint.type = "linearGradient";
					$this.paint.solidColor = null;
					okClicked();
				});
				$('#'+id+'_lg_jGraduate_Ok').bind('click', function(paint) {
					cancelClicked();
				});
				
				var x1 = $this.paint.linearGradient.getAttribute('x1');
				if(!x1) x1 = "0.0";
				var x1Input = $('#'+id+'_jGraduate_x1');
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
				var y1Input = $('#'+id+'_jGraduate_y1');
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
				var x2Input = $('#'+id+'_jGraduate_x2');
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
				
				var setLgOpacitySlider = function(e, div) {
					var offset = div.offset();
					var x = (e.pageX - offset.left - parseInt(div.css('border-left-width')));
					if (x > 255) x = 255;
					if (x < 0) x = 0;
					var posx = x - 4.5;
					x /= 255;
					$('#' + id + '_lg_jGraduate_AlphaArrows').css({'margin-left':posx});
					$('#' + id + '_lg_jgraduate_rect').attr('fill-opacity', x);
					x = parseInt(x*100);
					$('#' + id + '_lg_jGraduate_OpacityInput').val(x);
					$this.paint.alpha = x;
				};
				
				// handle dragging on the opacity slider
				var bSlidingOpacity = false;
				$('#' + id + '_lg_jGraduate_Opacity').mousedown(function(evt) {
					setLgOpacitySlider(evt, $(this));
					bSlidingOpacity = true;
					evt.preventDefault();
				}).mousemove(function(evt) {
					if (bSlidingOpacity) {
						setLgOpacitySlider(evt, $(this));
						evt.preventDefault();
					}
				}).mouseup(function(evt) {
					setLgOpacitySlider(evt, $(this));
					bSlidingOpacity = false;
					evt.preventDefault();
				});
				
				// handle dragging the stop around the swatch
				var draggingStop = null;
				var startx = -1, starty = -1;
				// for whatever reason, Opera does not allow $('image.stop') here,
				// and Firefox 1.5 does not allow $('.stop')
				$('.stop, #color_picker_lg_jGraduate_GradContainer image').mousedown(function(evt) {
					draggingStop = this;
					startx = evt.clientX;
					starty = evt.clientY;
					evt.preventDefault();
				});
				$('#'+id+'_lg_jgraduate_svg').mousemove(function(evt) {
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
				$('#'+id+'_lg_jgraduate_svg').mouseup(function(evt) {
					draggingStop = null;
				});
				
				var beginColor = stops[0].getAttribute('stop-color');
				if(!beginColor) beginColor = '#000';
				beginColorBox = $('#'+id+'_jGraduate_colorBoxBegin');
				beginColorBox.css({'background-color':beginColor});
	
				var beginOpacity = stops[0].getAttribute('stop-opacity');
				if(!beginOpacity) beginOpacity = '1.0';
				$('#'+id+'lg_jGraduate_beginOpacity').html( (beginOpacity*100)+'%' );
	
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
			}());	
			
			
			// Radial gradient
			(function() {
				var svg = document.getElementById(id + '_rg_jgraduate_svg');
				
				// if we are sent a gradient, import it 
				if ($this.paint.type == "radialGradient") {
					$this.paint.radialGradient.id = id+'_rg_jgraduate_grad';
					$this.paint.radialGradient = svg.appendChild($.cloneNode($this.paint.radialGradient));
				} else { // we create a gradient
					var grad = svg.appendChild(document.createElementNS(ns.svg, 'radialGradient'));
					grad.id = id+'_rg_jgraduate_grad';
					grad.setAttribute('cx','0.5');
					grad.setAttribute('cy','0.5');
					grad.setAttribute('r','0.5');
					
					var begin = grad.appendChild(document.createElementNS(ns.svg, 'stop'));
					begin.setAttribute('offset', '0.0');
					begin.setAttribute('stop-color', '#ff0000');
	
					var end = grad.appendChild(document.createElementNS(ns.svg, 'stop'));
					end.setAttribute('offset', '1.0');
					end.setAttribute('stop-color', '#ffff00');
				
					$this.paint.radialGradient = grad;
				}
	
				var gradalpha = $this.paint.alpha;
				$('#' + id + '_rg_jGraduate_OpacityInput').val(gradalpha);
				var posx = parseInt(255*(gradalpha/100)) - 4.5;
				$('#' + id + '_rg_jGraduate_AlphaArrows').css({'margin-left':posx});
				
				var grad = $this.paint.radialGradient;
				
				var cx = parseFloat(grad.getAttribute('cx')||0.5),
					cy = parseFloat(grad.getAttribute('cy')||0.5),
					fx = parseFloat(grad.getAttribute('fx')||0.5),
					fy = parseFloat(grad.getAttribute('fy')||0.5);
				
				// No match, so show focus point
				var showFocus = grad.getAttribute('fx') != null && !(cx == fx && cy == fy);
				
				var rect = document.createElementNS(ns.svg, 'rect');
				rect.id = id + '_rg_jgraduate_rect';
				rect.setAttribute('x', MARGINX);
				rect.setAttribute('y', MARGINY);
				rect.setAttribute('width', SIZEY);
				rect.setAttribute('height', SIZEY);
				rect.setAttribute('fill', 'url(#'+id+'_rg_jgraduate_grad)');
				rect.setAttribute('fill-opacity', '1.0');

				rect = svg.appendChild(rect);
				
				$('#' + id + '_rg_jgraduate_rect').attr('fill-opacity', gradalpha/100);

				// stop visuals created here
				var centerPoint = document.createElementNS(ns.svg, 'image');
				centerPoint.id = id + "_center_pt";
				centerPoint.setAttribute('class', 'stop');
				centerPoint.setAttributeNS(ns.xlink, 'href', $settings.images.clientPath + 'mappoint_c.png');
				centerPoint.setAttributeNS(ns.xlink, "title", "Center Point");
				centerPoint.appendChild(document.createElementNS(ns.svg, 'title')).appendChild(
					document.createTextNode("Center Point"));
				centerPoint.setAttribute('width', 18);
				centerPoint.setAttribute('height', 18);
				centerPoint.setAttribute('x', MARGINX + SIZEX*cx - STOP_RADIUS);
				centerPoint.setAttribute('y', MARGINY + SIZEY*cy - STOP_RADIUS);
				centerPoint.setAttribute('cursor', 'move');

				
				var focusPoint = document.createElementNS(ns.svg, 'image');
				focusPoint.id = id + "_focus_pt";
				focusPoint.setAttribute('class', 'stop');
				focusPoint.setAttributeNS(ns.xlink, 'href', $settings.images.clientPath + 'mappoint_f.png');
				focusPoint.setAttributeNS(ns.xlink, "title", "Focus Point");
				focusPoint.appendChild(document.createElementNS(ns.svg, 'title')).appendChild(
					document.createTextNode("Focus Point"));
				focusPoint.setAttribute('width', 18);
				focusPoint.setAttribute('height', 18);
				focusPoint.setAttribute('x', MARGINX + SIZEX*fx - STOP_RADIUS);
				focusPoint.setAttribute('y', MARGINY + SIZEY*fy - STOP_RADIUS);
				focusPoint.setAttribute('cursor', 'move');
				
				// must append only after setting all attributes due to Webkit Bug 27952
				// https://bugs.webkit.org/show_bug.cgi?id=27592
				
				// centerPoint is added last so it is moved first
				focusPoint = svg.appendChild(focusPoint);
				centerPoint = svg.appendChild(centerPoint);
				
				// bind GUI elements
				$('#'+id+'_rg_jGraduate_Ok').bind('click', function() {
					$this.paint.type = "radialGradient";
					$this.paint.solidColor = null;
					okClicked();
				});
				$('#'+id+'_rg_jGraduate_Cancel').bind('click', function(paint) {
					cancelClicked();
				});
				
				var cx = $this.paint.radialGradient.getAttribute('cx');
				if(!cx) cx = "0.0";
				var cxInput = $('#'+id+'_jGraduate_cx');
				cxInput.val(cx);
				cxInput.change( function() {
					if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
						this.value = 0.0; 
					}
					$this.paint.radialGradient.setAttribute('cx', this.value);
					centerPoint.setAttribute('x', MARGINX + SIZEX*this.value - STOP_RADIUS);
				});
	
				var cy = $this.paint.radialGradient.getAttribute('cy');
				if(!cy) cy = "0.0";
				var cyInput = $('#'+id+'_jGraduate_cy');
				cyInput.val(cy);
				cyInput.change( function() {
					if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
						this.value = 0.0; 
					}
					$this.paint.radialGradient.setAttribute('cy', this.value);
					centerPoint.setAttribute('y', MARGINY + SIZEY*this.value - STOP_RADIUS);
				});
				
				var fx = $this.paint.radialGradient.getAttribute('fx');
				if(!fx) fx = "1.0";
				var fxInput = $('#'+id+'_jGraduate_fx');
				fxInput.val(fx);
				fxInput.change( function() {
					if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
						this.value = 1.0;
					}
					$this.paint.radialGradient.setAttribute('fx', this.value);
					focusPoint.setAttribute('x', MARGINX + SIZEX*this.value - STOP_RADIUS);
				});
				
				var fy = $this.paint.radialGradient.getAttribute('fy');
				if(!fy) fy = "0.0";
				var fyInput = $('#'+id+'_jGraduate_fy');
				fyInput.val(fy);
				fyInput.change( function() {
					if (isNaN(parseFloat(this.value)) || this.value < 0.0 || this.value > 1.0) { 
						this.value = 0.0;
					}
					$this.paint.radialGradient.setAttribute('fy', this.value);
					focusPoint.setAttribute('y', MARGINY + SIZEY*this.value - STOP_RADIUS);
				});      
				
				if(!showFocus) {
					focusPoint.setAttribute('display', 'none');	
					fxInput.val("");
					fyInput.val("");
				}

				$("#" + id + "_jGraduate_match_ctr")[0].checked = !showFocus;
				
				var lastfx, lastfy;
				
				$("#" + id + "_jGraduate_match_ctr").change(function() {
					showFocus = !this.checked;
					focusPoint.setAttribute('display', showFocus?'inline':'none');
					fxInput.val("");
					fyInput.val("");
					var grad = $this.paint.radialGradient;
					if(!showFocus) {
						lastfx = grad.getAttribute('fx');
						lastfy = grad.getAttribute('fy');
						grad.removeAttribute('fx');
						grad.removeAttribute('fy');
					} else {
						var fx = lastfx || .5;
						var fy = lastfy || .5;
						grad.setAttribute('fx', fx);
						grad.setAttribute('fy', fy);
						fxInput.val(fx);
						fyInput.val(fy);
					}
				});
				
				var stops = $this.paint.radialGradient.getElementsByTagNameNS(ns.svg, 'stop');
				var numstops = stops.length;
				// if there are not at least two stops, then 
				if (numstops < 2) {
					while (numstops < 2) {
						$this.paint.radialGradient.appendChild( document.createElementNS(ns.svg, 'stop') );
						++numstops;
					}
					stops = $this.paint.radialGradient.getElementsByTagNameNS(ns.svg, 'stop');
				}
				var radius = $this.paint.radialGradient.getAttribute('r')-0;
				var radiusx = parseInt((245/2)*(radius)) - 4.5;
				$('#' + id + '_jGraduate_RadiusArrows').css({'margin-left':radiusx});
				$('#' + id + '_jGraduate_RadiusInput').val(parseInt(radius*100)).change(function(e) {
					var x = this.value / 100;
					if(x < 0.01) {
						x = 0.01;
					}
					
					$this.paint.radialGradient.setAttribute('r', x);
					// Allow higher value, but pretend it's the max for the slider
					if(x > 2) x = 2;
					var posx = parseInt((245/2) * x) - 4.5;
					$('#' + id + '_jGraduate_RadiusArrows').css({'margin-left':posx});
					
				});
				
				var setRgOpacitySlider = function(e, div) {
					var offset = div.offset();
					var x = (e.pageX - offset.left - parseInt(div.css('border-left-width')));
					if (x > 255) x = 255;
					if (x < 0) x = 0;
					var posx = x - 4.5;
					x /= 255;
					$('#' + id + '_rg_jGraduate_AlphaArrows').css({'margin-left':posx});
					$('#' + id + '_rg_jgraduate_rect').attr('fill-opacity', x);
					x = parseInt(x*100);
					$('#' + id + '_rg_jGraduate_OpacityInput').val(x);
					$this.paint.alpha = x;
				};
				
				// handle dragging on the opacity slider
				var bSlidingOpacity = false;
				$('#' + id + '_rg_jGraduate_Opacity').mousedown(function(evt) {
					setRgOpacitySlider(evt, $(this));
					bSlidingOpacity = true;
					evt.preventDefault();
				}).mousemove(function(evt) {
					if (bSlidingOpacity) {
						setRgOpacitySlider(evt, $(this));
						evt.preventDefault();
					}
				}).mouseup(function(evt) {
					setRgOpacitySlider(evt, $(this));
					bSlidingOpacity = false;
					evt.preventDefault();
				});
				
				var setRadiusSlider = function(e, div) {
					var offset = div.offset();
					var x = (e.pageX - offset.left - parseInt(div.css('border-left-width')));
					if (x > 245) x = 245;
					if (x <= 1) x = 1;
					var posx = x - 5;
					x /= (245/2);
					$('#' + id + '_jGraduate_RadiusArrows').css({'margin-left':posx});
					$this.paint.radialGradient.setAttribute('r', x);
					x = parseInt(x*100);
					
					$('#' + id + '_jGraduate_RadiusInput').val(x);
				};
				
				// handle dragging on the radius slider
				var bSlidingRadius = false;
				$('#' + id + '_jGraduate_Radius').mousedown(function(evt) {
					setRadiusSlider(evt, $(this));
					bSlidingRadius = true;
					evt.preventDefault();
				}).mousemove(function(evt) {
					if (bSlidingRadius) {
						setRadiusSlider(evt, $(this));
						evt.preventDefault();
					}
				}).mouseup(function(evt) {
					setRadiusSlider(evt, $(this));
					bSlidingRadius = false;
					evt.preventDefault();
				});
				
				
				// handle dragging the stop around the swatch
				var draggingStop = null;
				var startx = -1, starty = -1;
				// for whatever reason, Opera does not allow $('image.stop') here,
				// and Firefox 1.5 does not allow $('.stop')
				$('.stop, #color_picker_rg_jGraduate_GradContainer image').mousedown(function(evt) {
					draggingStop = this;
					startx = evt.clientX;
					starty = evt.clientY;
					evt.preventDefault();
				});
				$('#'+id+'_rg_jgraduate_svg').mousemove(function(evt) {
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
						
						
						if (draggingStop.id == (id+'_center_pt')) {
							cxInput.val(fracx);
							cyInput.val(fracy);
							$this.paint.radialGradient.setAttribute('cx', fracx);
							$this.paint.radialGradient.setAttribute('cy', fracy);
							
							if(!showFocus) {
								$this.paint.radialGradient.setAttribute('fx', fracx);
								$this.paint.radialGradient.setAttribute('fy', fracy);
							}
						}
						else {
							fxInput.val(fracx);
							fyInput.val(fracy);
							$this.paint.radialGradient.setAttribute('fx', fracx);
							$this.paint.radialGradient.setAttribute('fy', fracy);
						}
						
						evt.preventDefault();
					}
				});
				$('#'+id+'_rg_jgraduate_svg').mouseup(function(evt) {
					draggingStop = null;
				});
				
				var centerColor = stops[0].getAttribute('stop-color');
				if(!centerColor) centerColor = '#000';
				centerColorBox = $('#'+id+'_jGraduate_colorBoxCenter');
				centerColorBox.css({'background-color':centerColor});
	
				var centerOpacity = stops[0].getAttribute('stop-opacity');
				if(!centerOpacity) centerOpacity = '1.0';
				$('#'+id+'jGraduate_centerOpacity').html( (centerOpacity*100)+'%' );
	
				var outerColor = stops[stops.length-1].getAttribute('stop-color');
				if(!outerColor) outerColor = '#000';
				outerColorBox = $('#'+id+'_jGraduate_colorBoxOuter');
				outerColorBox.css({'background-color':outerColor});
	
				var outerOpacity = stops[stops.length-1].getAttribute('stop-opacity');
				if(!outerOpacity) outerOpacity = '1.0';
				$('#'+id+'rg_jGraduate_outerOpacity').html( (outerOpacity*100)+'%' );
				
				$('#'+id+'_jGraduate_colorBoxCenter').click(function() {
					$('div.jGraduate_LightBox').show();			
					var colorbox = $(this);
					var thisAlpha = (parseFloat(centerOpacity)*255).toString(16);
					while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
					color = centerColor.substr(1) + thisAlpha;
					$('#'+id+'_rg_jGraduate_stopPicker').css({'left': 100, 'bottom': 15}).jPicker({
							window: { title: "Pick the center color and opacity for the gradient" },
							images: { clientPath: $settings.images.clientPath },
							color: { active: color, alphaSupport: true }
						}, function(color){
							centerColor = color.get_Hex() ? ('#'+color.get_Hex()) : "none";
							centerOpacity = color.get_A() ? color.get_A()/100 : 1;
							colorbox.css('background', centerColor);
							$('#'+id+'_rg_jGraduate_centerOpacity').html(parseInt(centerOpacity*100)+'%');
							stops[0].setAttribute('stop-color', centerColor);
							stops[0].setAttribute('stop-opacity', centerOpacity);
							$('div.jGraduate_LightBox').hide();
							$('#'+id+'_rg_jGraduate_stopPicker').hide();
						}, null, function() {
							$('div.jGraduate_LightBox').hide();
							$('#'+id+'_rg_jGraduate_stopPicker').hide();
						});
				});
				$('#'+id+'_jGraduate_colorBoxOuter').click(function() {
					$('div.jGraduate_LightBox').show();
					var colorbox = $(this);
					var thisAlpha = (parseFloat(outerOpacity)*255).toString(16);
					while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
					color = outerColor.substr(1) + thisAlpha;
					$('#'+id+'_rg_jGraduate_stopPicker').css({'left': 100, 'top': 15}).jPicker({
							window: { title: "Pick the outer color and opacity for the gradient" },
							images: { clientPath: $settings.images.clientPath },
							color: { active: color, alphaSupport: true }
						}, function(color){
							outerColor = color.get_Hex() ? ('#'+color.get_Hex()) : "none";
							outerOpacity = color.get_A() ? color.get_A()/100 : 1;
							colorbox.css('background', outerColor);
							$('#'+id+'_jGraduate_outerOpacity').html(parseInt(outerOpacity*100)+'%');
							stops[1].setAttribute('stop-color', outerColor);
							stops[1].setAttribute('stop-opacity', outerOpacity);
							$('div.jGraduate_LightBox').hide();
							$('#'+id+'_rg_jGraduate_stopPicker').hide();
						}, null, function() {
							$('div.jGraduate_LightBox').hide();
							$('#'+id+'_rg_jGraduate_stopPicker').hide();
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
						$this.paint.radialGradient = null;
						okClicked(); 
					},
					null,
					function(){ cancelClicked(); }
					);
			}());	
			
			var tabs = $(idref + ' .jGraduate_tabs li');
			tabs.click(function() {
				tabs.removeClass('jGraduate_tab_current');
				$(this).addClass('jGraduate_tab_current');
				$(idref + " > div").hide();
				$(idref + ' .jGraduate_' +  $(this).attr('data-type') + 'Pick').show();
			});
			
			$(idref + " > div").hide();
			tabs.removeClass('jGraduate_tab_current');
			var tab;
			switch ( $this.paint.type ) {
				case 'linearGradient':
					tab = $(idref + ' .jGraduate_tab_lingrad');
					break;
				case 'radialGradient':
					tab = $(idref + ' .jGraduate_tab_radgrad');
					break;
				default:
					tab = $(idref + ' .jGraduate_tab_color');
					break;
			}
			tab.addClass('jGraduate_tab_current').click();	

			$this.show();
		});
	};
})();