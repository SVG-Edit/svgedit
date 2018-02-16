/*
 * jGraduate 0.4
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
		paint: a Paint object,
		newstop: String of value "same", "inverse", "black" or "white" 
				 OR object with one or both values {color: #Hex color, opac: number 0-1}
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

$.jGraduate = { 
	Paint:
		function(opt) {
			var options = opt || {};
			this.alpha = isNaN(options.alpha) ? 100 : options.alpha;
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
    					this.linearGradient = options.copy.linearGradient.cloneNode(true);
    					break;
    				case "radialGradient":
    					this.radialGradient = options.copy.radialGradient.cloneNode(true);
    					break;
    			}
    		}
    		// create linear gradient paint
    		else if (options.linearGradient) {
    			this.type = "linearGradient";
    			this.solidColor = null;
    			this.radialGradient = null;
    			this.linearGradient = options.linearGradient.cloneNode(true);
    		}
    		// create linear gradient paint
    		else if (options.radialGradient) {
    			this.type = "radialGradient";
    			this.solidColor = null;
    			this.linearGradient = null;
    			this.radialGradient = options.radialGradient.cloneNode(true);
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
		pickerTitle: "Drag markers to pick a paint"
	},
	images: {
		clientPath: "images/"
	},
	newstop: 'inverse' // same, inverse, black, white
};

var isGecko = navigator.userAgent.indexOf('Gecko/') >= 0;

function setAttrs(elem, attrs) {
	if(isGecko) {
		for (var aname in attrs) elem.setAttribute(aname, attrs[aname]);
	} else {
		for (var aname in attrs) {
			var val = attrs[aname], prop = elem[aname];
			if(prop && prop.constructor === 'SVGLength') {
				prop.baseVal.value = val;
			} else {
				elem.setAttribute(aname, val);
			}
		}
	}
}

function mkElem(name, attrs, newparent) {
	var elem = document.createElementNS(ns.svg, name);
	setAttrs(elem, attrs);
	if(newparent) newparent.appendChild(elem);
	return elem;
}

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
	            switch ( $this.paint.type ) {
	            	case "radialGradient":
	            		$this.paint.linearGradient = null;
	            		break;
	            	case "linearGradient":
	            		$this.paint.radialGradient = null;
	            		break;
	            	case "solidColor":
	            		$this.paint.radialGradient = $this.paint.linearGradient = null;
	            		break;
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
                cancelCallback: $.isFunction($arguments[2]) && $arguments[2] || null
              });

			var pos = $this.position(),
				color = null;
			var $win = $(window);

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
            			'<div class="jGraduate_gradPick"></div>' +
						'<div class="jGraduate_LightBox"></div>' +
						'<div id="' + id + '_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>'
            			
            			
            			);
			var colPicker = $(idref + '> .jGraduate_colPick');
			var gradPicker = $(idref + '> .jGraduate_gradPick');
			
            gradPicker.html(
            	'<div id="' + id + '_jGraduate_Swatch" class="jGraduate_Swatch">' +
            		'<h2 class="jGraduate_Title">' + $settings.window.pickerTitle + '</h2>' +
            		'<div id="' + id + '_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>' +
            		'<div id="' + id + '_jGraduate_StopSlider" class="jGraduate_StopSlider"></div>' +
            	'</div>' + 
            	'<div class="jGraduate_Form jGraduate_Points jGraduate_lg_field">' +
            		'<div class="jGraduate_StopSection">' +
	            		'<label class="jGraduate_Form_Heading">Begin Point</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
        	    			'<label>x:</label>' +
            				'<input type="text" id="' + id + '_jGraduate_x1" size="3" title="Enter starting x value between 0.0 and 1.0"/>' +
            				'<label>y:</label>' +
            				'<input type="text" id="' + id + '_jGraduate_y1" size="3" title="Enter starting y value between 0.0 and 1.0"/>' +
        	   			'</div>' +
        	   		'</div>' +
        	   		'<div class="jGraduate_StopSection">' +
	            		'<label class="jGraduate_Form_Heading">End Point</label>' +
    	        		'<div class="jGraduate_Form_Section">' +
	    	        		'<label>x:</label>' +
		    	        	'<input type="text" id="' + id + '_jGraduate_x2" size="3" title="Enter ending x value between 0.0 and 1.0"/>' +
    		    	    	'<label>y:</label>' +
        		    		'<input type="text" id="' + id + '_jGraduate_y2" size="3" title="Enter ending y value between 0.0 and 1.0"/>' +
    	    	    	'</div>' +
    	    	    '</div>' +
    	       	'</div>' +
            	'<div class="jGraduate_Form jGraduate_Points jGraduate_rg_field">' +
					'<div class="jGraduate_StopSection">' +
						'<label class="jGraduate_Form_Heading">Center Point</label>' +
						'<div class="jGraduate_Form_Section">' +
							'<label>x:</label>' +
							'<input type="text" id="' + id + '_jGraduate_cx" size="3" title="Enter x value between 0.0 and 1.0"/>' +
							'<label>y:</label>' +
							'<input type="text" id="' + id + '_jGraduate_cy" size="3" title="Enter y value between 0.0 and 1.0"/>' +
						'</div>' +
					'</div>' +
					'<div class="jGraduate_StopSection">' +
						'<label class="jGraduate_Form_Heading">Focal Point</label>' +
						'<div class="jGraduate_Form_Section">' +
							'<label>Match center: <input type="checkbox" checked="checked" id="' + id + '_jGraduate_match_ctr"/></label><br/>' +
							'<label>x:</label>' +
							'<input type="text" id="' + id + '_jGraduate_fx" size="3" title="Enter x value between 0.0 and 1.0"/>' +
							'<label>y:</label>' +
							'<input type="text" id="' + id + '_jGraduate_fy" size="3" title="Enter y value between 0.0 and 1.0"/>' +
						'</div>' +
					'</div>' +
    	       	'</div>' +
				'<div class="jGraduate_StopSection jGraduate_SpreadMethod">' +
					'<label class="jGraduate_Form_Heading">Spread method</label>' +
					'<div class="jGraduate_Form_Section">' +
						'<select class="jGraduate_spreadMethod">' +
							'<option value=pad selected>Pad</option>' +
							'<option value=reflect>Reflect</option>' +
							'<option value=repeat>Repeat</option>' +
						'</select>' + 
					'</div>' +
				'</div>' +
            	'<div class="jGraduate_Form">' +
        	   		'<div class="jGraduate_Slider jGraduate_RadiusField jGraduate_rg_field">' +
						'<label class="prelabel">Radius:</label>' +
						'<div id="' + id + '_jGraduate_Radius" class="jGraduate_SliderBar jGraduate_Radius" title="Click to set radius">' +
							'<img id="' + id + '_jGraduate_RadiusArrows" class="jGraduate_RadiusArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
						'</div>' +
						'<label><input type="text" id="' + id + '_jGraduate_RadiusInput" size="3" value="100"/>%</label>' + 
    	    	    '</div>' +
        	   		'<div class="jGraduate_Slider jGraduate_EllipField jGraduate_rg_field">' +
						'<label class="prelabel">Ellip:</label>' +
						'<div id="' + id + '_jGraduate_Ellip" class="jGraduate_SliderBar jGraduate_Ellip" title="Click to set Ellip">' +
							'<img id="' + id + '_jGraduate_EllipArrows" class="jGraduate_EllipArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
						'</div>' +
						'<label><input type="text" id="' + id + '_jGraduate_EllipInput" size="3" value="0"/>%</label>' + 
    	    	    '</div>' +
        	   		'<div class="jGraduate_Slider jGraduate_AngleField jGraduate_rg_field">' +
						'<label class="prelabel">Angle:</label>' +
						'<div id="' + id + '_jGraduate_Angle" class="jGraduate_SliderBar jGraduate_Angle" title="Click to set Angle">' +
							'<img id="' + id + '_jGraduate_AngleArrows" class="jGraduate_AngleArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
						'</div>' +
						'<label><input type="text" id="' + id + '_jGraduate_AngleInput" size="3" value="0"/>deg</label>' + 
    	    	    '</div>' +
        	   		'<div class="jGraduate_Slider jGraduate_OpacField">' +
						'<label class="prelabel">Opac:</label>' +
						'<div id="' + id + '_jGraduate_Opac" class="jGraduate_SliderBar jGraduate_Opac" title="Click to set Opac">' +
							'<img id="' + id + '_jGraduate_OpacArrows" class="jGraduate_OpacArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
						'</div>' +
						'<label><input type="text" id="' + id + '_jGraduate_OpacInput" size="3" value="100"/>%</label>' + 
    	    	    '</div>' +
    	       	'</div>' +
        	    '<div class="jGraduate_OkCancel">' +
            		'<input type="button" id="' + id + '_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>' +
            		'<input type="button" id="' + id + '_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>' +
            	'</div>');
            	
			// --------------
            // Set up all the SVG elements (the gradient, stops and rectangle)
            var MAX = 256, MARGINX = 0, MARGINY = 0, STOP_RADIUS = 15/2,
            	SIZEX = MAX - 2*MARGINX, SIZEY = MAX - 2*MARGINY;
            	
            var curType, curGradient, previewRect;	
            
			var attr_input = {};
            
            var SLIDERW = 145;
            $('.jGraduate_SliderBar').width(SLIDERW);
			
			var container = $('#' + id+'_jGraduate_GradContainer')[0];
			
			var svg = mkElem('svg', {
				id: id + '_jgraduate_svg',
				width: MAX,
				height: MAX,
				xmlns: ns.svg
			}, container);
			
			// if we are sent a gradient, import it 
			
			curType = curType || $this.paint.type;
			
			var grad = curGradient = $this.paint[curType];
			
			var gradalpha = $this.paint.alpha;
			
			var isSolid = curType === 'solidColor';
			
			// Make any missing gradients
			switch ( curType ) {
				case "solidColor":
					// fall through
				case "linearGradient":
					if(!isSolid) {
						curGradient.id = id+'_lg_jgraduate_grad';
						grad = curGradient = svg.appendChild(curGradient);//.cloneNode(true));
					}
					mkElem('radialGradient', {
						id: id + '_rg_jgraduate_grad'
					}, svg);
					if(curType === "linearGradient") break;
				case "radialGradient":
					if(!isSolid) {
						curGradient.id = id+'_rg_jgraduate_grad';
						grad = curGradient = svg.appendChild(curGradient);//.cloneNode(true));
					}
					mkElem('linearGradient', {
						id: id + '_lg_jgraduate_grad'
					}, svg);
			}
			
			if(isSolid) {
				grad = curGradient = $('#' + id + '_lg_jgraduate_grad')[0];
				var color = $this.paint[curType];
				mkStop(0, '#' + color, 1);
				
				var type = typeof $settings.newstop;
				
				if(type === 'string') {
					switch ( $settings.newstop ) {
						case 'same':
							mkStop(1, '#' + color, 1);				
							break;

						case 'inverse':
							// Invert current color for second stop
							var inverted = '';
							
							for(var i = 0; i < 6; i += 2) {
								var ch = color.substr(i, 2);
								var inv = (255 - parseInt(color.substr(i, 2), 16)).toString(16);
								if(inv.length < 2) inv = 0 + inv;
								inverted += inv;
							}
							mkStop(1, '#' + inverted, 1);
							break;
						
						case 'white':
							mkStop(1, '#ffffff', 1);
							break;
	
						case 'black':
							mkStop(1, '#000000', 1);
							break;
					}
				} else if(type === 'object'){
					var opac = ('opac' in $settings.newstop) ? $settings.newstop.opac : 1;
					mkStop(1, ($settings.newstop.color || '#' + color), opac);
				}
			}

			
			var x1 = parseFloat(grad.getAttribute('x1')||0.0),
				y1 = parseFloat(grad.getAttribute('y1')||0.0),
				x2 = parseFloat(grad.getAttribute('x2')||1.0),
				y2 = parseFloat(grad.getAttribute('y2')||0.0);
				
			var cx = parseFloat(grad.getAttribute('cx')||0.5),
				cy = parseFloat(grad.getAttribute('cy')||0.5),
				fx = parseFloat(grad.getAttribute('fx')|| cx),
				fy = parseFloat(grad.getAttribute('fy')|| cy);

			
			var previewRect = mkElem('rect', {
				id: id + '_jgraduate_rect',
				x: MARGINX,
				y: MARGINY,
				width: SIZEX,
				height: SIZEY,
				fill: 'url(#'+id+'_jgraduate_grad)',
				'fill-opacity': gradalpha/100
			}, svg);
			
			// stop visuals created here
			var beginCoord = $('<div/>').attr({
				'class': 'grad_coord jGraduate_lg_field',
				title: 'Begin Stop'
			}).text(1).css({
				top: y1 * MAX,
				left: x1 * MAX
			}).data('coord', 'start').appendTo(container);
			
			var endCoord = beginCoord.clone().text(2).css({
				top: y2 * MAX,
				left: x2 * MAX
			}).attr('title', 'End stop').data('coord', 'end').appendTo(container);
		
			var centerCoord = $('<div/>').attr({
				'class': 'grad_coord jGraduate_rg_field',
				title: 'Center stop'
			}).text('C').css({
				top: cy * MAX,
				left: cx * MAX
			}).data('coord', 'center').appendTo(container);
			
			var focusCoord = centerCoord.clone().text('F').css({
				top: fy * MAX,
				left: fx * MAX,
				display: 'none'
			}).attr('title', 'Focus point').data('coord', 'focus').appendTo(container);
			
			focusCoord[0].id = id + '_jGraduate_focusCoord';
			
			var coords = $(idref + ' .grad_coord');
			
// 			$(container).hover(function() {
// 				coords.animate({
// 					opacity: 1
// 				}, 500);
// 			}, function() {
// 				coords.animate({
// 					opacity: .2
// 				}, 500);				
// 			});
			
			$.each(['x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'fx', 'fy'], function(i, attr) {
				var attrval = curGradient.getAttribute(attr);
				
				var isRadial = isNaN(attr[1]);
				
				if(!attrval) {
					// Set defaults
					if(isRadial) {
						// For radial points
						attrval = "0.5";
					} else {
						// Only x2 is 1
						attrval = attr === 'x2' ? "1.0" : "0.0";
					}
				}

				attr_input[attr] = $('#'+id+'_jGraduate_' + attr)
					.val(attrval)
					.change(function() {
						// TODO: Support values < 0 and > 1 (zoomable preview?)
						if (isNaN(parseFloat(this.value)) || this.value < 0) {
							this.value = 0.0; 
						} else if(this.value > 1) {
							this.value = 1.0;
						}
						
						if(!(attr[0] === 'f' && !showFocus)) {
							if(isRadial && curType === 'radialGradient' || !isRadial && curType === 'linearGradient') {
								curGradient.setAttribute(attr, this.value);
							}
						}
						
						if(isRadial) {
							var $elem = attr[0] === "c" ? centerCoord : focusCoord;
						} else {
							var $elem = attr[1] === "1" ? beginCoord : endCoord;						
						}
						
						var cssName = attr.indexOf('x') >= 0 ? 'left' : 'top';
						
						$elem.css(cssName, this.value * MAX);
				}).change();
			});


			
			function mkStop(n, color, opac, sel, stop_elem) {
				var stop = stop_elem || mkElem('stop',{'stop-color':color,'stop-opacity':opac,offset:n}, curGradient);
				if(stop_elem) {
					color = stop_elem.getAttribute('stop-color');
					opac = stop_elem.getAttribute('stop-opacity');
					n = stop_elem.getAttribute('offset');
				} else {
					curGradient.appendChild(stop);
				}
				if(opac === null) opac = 1;
				
				var picker_d = 'M-6.2,0.9c3.6-4,6.7-4.3,6.7-12.4c-0.2,7.9,3.1,8.8,6.5,12.4c3.5,3.8,2.9,9.6,0,12.3c-3.1,2.8-10.4,2.7-13.2,0C-9.6,9.9-9.4,4.4-6.2,0.9z';
				
				var pathbg = mkElem('path',{
					d: picker_d,
					fill: 'url(#jGraduate_trans)',
					transform: 'translate(' + (10 + n * MAX) + ', 26)'
				}, stopGroup);
				
				var path = mkElem('path',{
					d: picker_d,
					fill: color,
					'fill-opacity': opac,
					transform: 'translate(' + (10 + n * MAX) + ', 26)',
					stroke: '#000',
					'stroke-width': 1.5
				}, stopGroup);

				$(path).mousedown(function(e) {
					selectStop(this);
					drag = cur_stop;
					$win.mousemove(dragColor).mouseup(remDrags);
					stop_offset = stopMakerDiv.offset();
					e.preventDefault();
					return false;
				}).data('stop', stop).data('bg', pathbg).dblclick(function() {
					$('div.jGraduate_LightBox').show();			
					var colorhandle = this;
					var stopOpacity = +stop.getAttribute('stop-opacity') || 1;
					var stopColor = stop.getAttribute('stop-color') || 1;
					var thisAlpha = (parseFloat(stopOpacity)*255).toString(16);
					while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
					color = stopColor.substr(1) + thisAlpha;
					$('#'+id+'_jGraduate_stopPicker').css({'left': 100, 'bottom': 15}).jPicker({
							window: { title: "Pick the start color and opacity for the gradient" },
							images: { clientPath: $settings.images.clientPath },
							color: { active: color, alphaSupport: true }
						}, function(color, arg2){
							stopColor = color.val('hex') ? ('#'+color.val('hex')) : "none";
							stopOpacity = color.val('a') !== null ? color.val('a')/256 : 1;
							colorhandle.setAttribute('fill', stopColor);
							colorhandle.setAttribute('fill-opacity', stopOpacity);
							stop.setAttribute('stop-color', stopColor);
							stop.setAttribute('stop-opacity', stopOpacity);
							$('div.jGraduate_LightBox').hide();
							$('#'+id+'_jGraduate_stopPicker').hide();
						}, null, function() {
							$('div.jGraduate_LightBox').hide();
							$('#'+id+'_jGraduate_stopPicker').hide();
						});
				});
				
				$(curGradient).find('stop').each(function() {
					var cur_s = $(this);
					if(+this.getAttribute('offset') > n) {
						if(!color) {
							var newcolor = this.getAttribute('stop-color');
							var newopac = this.getAttribute('stop-opacity');
							stop.setAttribute('stop-color', newcolor);
							path.setAttribute('fill', newcolor);
							stop.setAttribute('stop-opacity', newopac === null ? 1 : newopac);
							path.setAttribute('fill-opacity', newopac === null ? 1 : newopac);
						}
						cur_s.before(stop);
						return false;
					}
				});
				if(sel) selectStop(path);
				return stop;
			}
			
			function remStop() {
				delStop.setAttribute('display', 'none');
				var path = $(cur_stop);
				var stop = path.data('stop');
				var bg = path.data('bg');
				$([cur_stop, stop, bg]).remove();
			}
			
				
			var stops, stopGroup;
			
			var stopMakerDiv = $('#' + id + '_jGraduate_StopSlider');

			var cur_stop, stopGroup, stopMakerSVG, drag;
			
			var delStop = mkElem('path',{
				d:'m9.75,-6l-19.5,19.5m0,-19.5l19.5,19.5',
				fill:'none',
				stroke:'#D00',
				'stroke-width':5,
				display:'none'
			}, stopMakerSVG);

			
			function selectStop(item) {
				if(cur_stop) cur_stop.setAttribute('stroke', '#000');
				item.setAttribute('stroke', 'blue');
				cur_stop = item;
				cur_stop.parentNode.appendChild(cur_stop);
			// 	stops = $('stop');
			// 	opac_select.val(cur_stop.attr('fill-opacity') || 1);
			// 	root.append(delStop);
			}
			
			var stop_offset;
			
			function remDrags() {
				$win.unbind('mousemove', dragColor);
				if(delStop.getAttribute('display') !== 'none') {
					remStop();
				}
				drag = null;
			}
			
			var scale_x = 1, scale_y = 1, angle = 0;
			var c_x = cx;
			var c_y = cy;
			
			function xform() {
				var rot = angle?'rotate(' + angle + ',' + c_x + ',' + c_y + ') ':'';
				if(scale_x === 1 && scale_y === 1) {
					curGradient.removeAttribute('gradientTransform');
// 					$('#ang').addClass('dis');
				} else {
					var x = -c_x * (scale_x-1);
					var y = -c_y * (scale_y-1);
					curGradient.setAttribute('gradientTransform', rot + 'translate(' + x + ',' + y + ') scale(' + scale_x + ',' + scale_y + ')');
// 					$('#ang').removeClass('dis');
				}
			}
			
			function dragColor(evt) {

				var x = evt.pageX - stop_offset.left;
				var y = evt.pageY - stop_offset.top;
				x = x < 10 ? 10 : x > MAX + 10 ? MAX + 10: x;

				var xf_str = 'translate(' + x + ', 26)';
					if(y < -60 || y > 130) {
						delStop.setAttribute('display', 'block');
						delStop.setAttribute('transform', xf_str);
					} else {
						delStop.setAttribute('display', 'none');
					}
				
				drag.setAttribute('transform', xf_str);
				$.data(drag, 'bg').setAttribute('transform', xf_str);
				var stop = $.data(drag, 'stop');
				var s_x = (x - 10) / MAX;
				
				stop.setAttribute('offset', s_x);
				var last = 0;
				
				$(curGradient).find('stop').each(function(i) {
					var cur = this.getAttribute('offset');
					var t = $(this);
					if(cur < last) {
						t.prev().before(t);
						stops = $(curGradient).find('stop');
					}
					last = cur;
				});
				
			}
			
			stopMakerSVG = mkElem('svg', {
				width: '100%',
				height: 45
			}, stopMakerDiv[0]);
			
			var trans_pattern = mkElem('pattern', {
				width: 16,
				height: 16,
				patternUnits: 'userSpaceOnUse',
				id: 'jGraduate_trans'
			}, stopMakerSVG);
			
			var trans_img = mkElem('image', {
				width: 16,
				height: 16
			}, trans_pattern);
			
			var bg_image = $settings.images.clientPath + 'map-opacity.png';

			trans_img.setAttributeNS(ns.xlink, 'xlink:href', bg_image);
			
			$(stopMakerSVG).click(function(evt) {
				stop_offset = stopMakerDiv.offset();
				var target = evt.target;
				if(target.tagName === 'path') return;
				var x = evt.pageX - stop_offset.left - 8;
				x = x < 10 ? 10 : x > MAX + 10 ? MAX + 10: x;
				mkStop(x / MAX, 0, 0, true);
				evt.stopPropagation();
			});
			
			$(stopMakerSVG).mouseover(function() {
				stopMakerSVG.appendChild(delStop);
			});
			
			stopGroup = mkElem('g', {}, stopMakerSVG);
			
			mkElem('line', {
				x1: 10,
				y1: 15,
				x2: MAX + 10,
				y2: 15,
				'stroke-width': 2,
				stroke: '#000'
			}, stopMakerSVG);
			
			
			var spreadMethodOpt = gradPicker.find('.jGraduate_spreadMethod').change(function() {
				curGradient.setAttribute('spreadMethod', $(this).val());
			});
			
		
			// handle dragging the stop around the swatch
			var draggingCoord = null;
			
			var onCoordDrag = function(evt) {
				var x = evt.pageX - offset.left;
				var y = evt.pageY - offset.top;

				// clamp stop to the swatch
				x = x < 0 ? 0 : x > MAX ? MAX : x;
				y = y < 0 ? 0 : y > MAX ? MAX : y;
				
				draggingCoord.css('left', x).css('top', y);

				// calculate stop offset            		
				var fracx = x / SIZEX;
				var fracy = y / SIZEY;
				
				var type = draggingCoord.data('coord');
				var grad = curGradient;
				
				switch ( type ) {
					case 'start':
						attr_input.x1.val(fracx);
						attr_input.y1.val(fracy);
						grad.setAttribute('x1', fracx);
						grad.setAttribute('y1', fracy);
						break;
					case 'end':
						attr_input.x2.val(fracx);
						attr_input.y2.val(fracy);
						grad.setAttribute('x2', fracx);
						grad.setAttribute('y2', fracy);
						break;
					case 'center':
						attr_input.cx.val(fracx);
						attr_input.cy.val(fracy);
						grad.setAttribute('cx', fracx);
						grad.setAttribute('cy', fracy);
						c_x = fracx;
						c_y = fracy;
						xform();
						break;
					case 'focus':
						attr_input.fx.val(fracx);
						attr_input.fy.val(fracy);
						grad.setAttribute('fx', fracx);
						grad.setAttribute('fy', fracy);
						xform();
				}
				
				evt.preventDefault();
			}
			
			var onCoordUp = function() {
				draggingCoord = null;
				$win.unbind('mousemove', onCoordDrag).unbind('mouseup', onCoordUp);
			}
			
			// Linear gradient
// 			(function() {

			
			stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');

			// if there are not at least two stops, then 
			if (numstops < 2) {
				while (numstops < 2) {
					curGradient.appendChild( document.createElementNS(ns.svg, 'stop') );
					++numstops;
				}
				stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');
			}
			
			var numstops = stops.length;				
			for(var i = 0; i < numstops; i++) {
				mkStop(0, 0, 0, 0, stops[i]);
			}
			
			spreadMethodOpt.val(curGradient.getAttribute('spreadMethod') || 'pad');

			var offset;
			
			// No match, so show focus point
			var showFocus = false; 
			
			previewRect.setAttribute('fill-opacity', gradalpha/100);

			
			$('#' + id + ' div.grad_coord').mousedown(function(evt) {
				evt.preventDefault();
				draggingCoord = $(this);
				var s_pos = draggingCoord.offset();
				offset = draggingCoord.parent().offset();
				$win.mousemove(onCoordDrag).mouseup(onCoordUp);
			});
			
			// bind GUI elements
			$('#'+id+'_jGraduate_Ok').bind('click', function() {
				$this.paint.type = curType;
				$this.paint[curType] = curGradient.cloneNode(true);;
				$this.paint.solidColor = null;
				okClicked();
			});
			$('#'+id+'_jGraduate_Cancel').bind('click', function(paint) {
				cancelClicked();
			});

			if(curType === 'radialGradient') {
				if(showFocus) {
					focusCoord.show();				
				} else {
					focusCoord.hide();
					attr_input.fx.val("");
					attr_input.fy.val("");
				}
			}

			$("#" + id + "_jGraduate_match_ctr")[0].checked = !showFocus;
			
			var lastfx, lastfy;
			
			$("#" + id + "_jGraduate_match_ctr").change(function() {
				showFocus = !this.checked;
				focusCoord.toggle(showFocus);
				attr_input.fx.val('');
				attr_input.fy.val('');
				var grad = curGradient;
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
					attr_input.fx.val(fx);
					attr_input.fy.val(fy);
				}
			});
			
			var stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');
			var numstops = stops.length;
			// if there are not at least two stops, then 
			if (numstops < 2) {
				while (numstops < 2) {
					curGradient.appendChild( document.createElementNS(ns.svg, 'stop') );
					++numstops;
				}
				stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');
			}
			
			var slider;
			
			var setSlider = function(e) {
				var offset = slider.offset;
				var div = slider.parent;
				var x = (e.pageX - offset.left - parseInt(div.css('border-left-width')));
				if (x > SLIDERW) x = SLIDERW;
				if (x <= 0) x = 0;
				var posx = x - 5;
				x /= SLIDERW;
				
				switch ( slider.type ) {
					case 'radius':
						x = Math.pow(x * 2, 2.5);
						if(x > .98 && x < 1.02) x = 1;
						if (x <= .01) x = .01;
						curGradient.setAttribute('r', x);
						break;
					case 'opacity':
						$this.paint.alpha = parseInt(x*100);
						previewRect.setAttribute('fill-opacity', x);
						break;
					case 'ellip':
						scale_x = 1, scale_y = 1;
						if(x < .5) {
							x /= .5; // 0.001
							scale_x = x <= 0 ? .01 : x;
						} else if(x > .5) {
							x /= .5; // 2
							x = 2 - x;
							scale_y = x <= 0 ? .01 : x;
						} 
						xform();
						x -= 1;
						if(scale_y === x + 1) {
							x = Math.abs(x);
						}
						break;
					case 'angle':
						x = x - .5;
						angle = x *= 180;
						xform();
						x /= 100;
						break;
				}
				slider.elem.css({'margin-left':posx});
				x = Math.round(x*100);
				slider.input.val(x);
			};
			
			var ellip_val = 0, angle_val = 0;
			
			if(curType === 'radialGradient') {
				var tlist = curGradient.gradientTransform.baseVal;
				if(tlist.numberOfItems === 2) {
					var t = tlist.getItem(0);
					var s = tlist.getItem(1);
					if(t.type === 2 && s.type === 3) {
						var m = s.matrix;
						if(m.a !== 1) {
							ellip_val = Math.round(-(1 - m.a) * 100);	
						} else if(m.d !== 1) {
							ellip_val = Math.round((1 - m.d) * 100);
						} 
					}
				} else if(tlist.numberOfItems === 3) {
					// Assume [R][T][S]
					var r = tlist.getItem(0);
					var t = tlist.getItem(1);
					var s = tlist.getItem(2);
					
					if(r.type === 4 
						&& t.type === 2 
						&& s.type === 3) {

						angle_val = Math.round(r.angle);
						var m = s.matrix;
						if(m.a !== 1) {
							ellip_val = Math.round(-(1 - m.a) * 100);	
						} else if(m.d !== 1) {
							ellip_val = Math.round((1 - m.d) * 100);
						} 
						
					}
				}
			}
			
			var sliders = {
				radius: {
					handle: '#' + id + '_jGraduate_RadiusArrows',
					input: '#' + id + '_jGraduate_RadiusInput',
					val: (curGradient.getAttribute('r') || .5) * 100
				},
				opacity: {
					handle: '#' + id + '_jGraduate_OpacArrows',
					input: '#' + id + '_jGraduate_OpacInput',
					val: $this.paint.alpha || 100
				},
				ellip: {
					handle: '#' + id + '_jGraduate_EllipArrows',
					input: '#' + id + '_jGraduate_EllipInput',
					val: ellip_val
				},
				angle: {
					handle: '#' + id + '_jGraduate_AngleArrows',
					input: '#' + id + '_jGraduate_AngleInput',
					val: angle_val
				}
			}
			
			$.each(sliders, function(type, data) {
				var handle = $(data.handle);
				handle.mousedown(function(evt) {
					var parent = handle.parent();
					slider = {
						type: type,
						elem: handle,
						input: $(data.input),
						parent: parent,
						offset: parent.offset()
					};
					$win.mousemove(dragSlider).mouseup(stopSlider);
					evt.preventDefault();
				});
				
				$(data.input).val(data.val).change(function() {
					var val = +this.value;
					var xpos = 0;
					var isRad = curType === 'radialGradient';
					switch ( type ) {
						case 'radius':
							if(isRad) curGradient.setAttribute('r', val / 100);
							xpos = (Math.pow(val / 100, 1 / 2.5) / 2) * SLIDERW;
							break;
						
						case 'opacity':
							$this.paint.alpha = val;
							previewRect.setAttribute('fill-opacity', val / 100);
							xpos = val * (SLIDERW / 100);
							break;
							
						case 'ellip':
							scale_x = scale_y = 1;
							if(val === 0) {
								xpos = SLIDERW * .5;
								break;
							}
							if(val > 99.5) val = 99.5;
							if(val > 0) {
								scale_y = 1 - (val / 100);
							} else {
								scale_x = - (val / 100) - 1;
							}

							xpos = SLIDERW * ((val + 100) / 2) / 100;
							if(isRad) xform();
							break;
						
						case 'angle':
							angle = val;
							xpos = angle / 180;
							xpos += .5;
							xpos *= SLIDERW;
							if(isRad) xform();
					}
					if(xpos > SLIDERW) {
						xpos = SLIDERW;
					} else if(xpos < 0) {
						xpos = 0;
					}
					handle.css({'margin-left': xpos - 5});
				}).change();
			});
			
			var dragSlider = function(evt) {
				setSlider(evt);
				evt.preventDefault();
			};
			
			var stopSlider = function(evt) {
				$win.unbind('mousemove', dragSlider).unbind('mouseup', stopSlider);
				slider = null;
			};
			
			
			// --------------
			var thisAlpha = ($this.paint.alpha*255/100).toString(16);
			while (thisAlpha.length < 2) { thisAlpha = "0" + thisAlpha; }
			thisAlpha = thisAlpha.split(".")[0];
			color = $this.paint.solidColor == "none" ? "" : $this.paint.solidColor + thisAlpha;
			
			if(!isSolid) {
				color = stops[0].getAttribute('stop-color');
			}
			
			// This should be done somewhere else, probably
			$.extend($.fn.jPicker.defaults.window, {
				alphaSupport: true, effects: {type: 'show',speed: 0}
			});
			
			colPicker.jPicker(
				{
					window: { title: $settings.window.pickerTitle },
					images: { clientPath: $settings.images.clientPath },
					color: { active: color, alphaSupport: true }
				},
				function(color) {
					$this.paint.type = "solidColor";
					$this.paint.alpha = color.val('ahex') ? Math.round((color.val('a') / 255) * 100) : 100;
					$this.paint.solidColor = color.val('hex') ? color.val('hex') : "none";
					$this.paint.radialGradient = null;
					okClicked(); 
				},
				null,
				function(){ cancelClicked(); }
				);

			
			var tabs = $(idref + ' .jGraduate_tabs li');
			tabs.click(function() {
				tabs.removeClass('jGraduate_tab_current');
				$(this).addClass('jGraduate_tab_current');
				$(idref + " > div").hide();
				var type = $(this).attr('data-type');
				var container = $(idref + ' .jGraduate_gradPick').show();
				if(type === 'rg' || type === 'lg') {
					// Show/hide appropriate fields
					$('.jGraduate_' + type + '_field').show();
					$('.jGraduate_' + (type === 'lg' ? 'rg' : 'lg') + '_field').hide();
					
					$('#' + id + '_jgraduate_rect')[0].setAttribute('fill', 'url(#' + id + '_' + type + '_jgraduate_grad)');
					
					// Copy stops
					
					curType = type === 'lg' ? 'linearGradient' : 'radialGradient';
					
					$('#' + id + '_jGraduate_OpacInput').val($this.paint.alpha).change();
					
					var newGrad = $('#' + id + '_' + type + '_jgraduate_grad')[0];
					
					if(curGradient !== newGrad) {
						var cur_stops = $(curGradient).find('stop');	
						$(newGrad).empty().append(cur_stops);
						curGradient = newGrad;
						var sm = spreadMethodOpt.val();
						curGradient.setAttribute('spreadMethod', sm);
					}
					showFocus = type === 'rg' && curGradient.getAttribute('fx') != null && !(cx == fx && cy == fy);
					$('#' + id + '_jGraduate_focusCoord').toggle(showFocus);
					if(showFocus) {
						$('#' + id + '_jGraduate_match_ctr')[0].checked = false;
					}
				} else {
					$(idref + ' .jGraduate_gradPick').hide();
					$(idref + ' .jGraduate_colPick').show();
				}
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
			$this.show();
			
			// jPicker will try to show after a 0ms timeout, so need to fire this after that
			setTimeout(function() {
				tab.addClass('jGraduate_tab_current').click();	
			}, 10);
		});
	};
})();