/*globals $, svgEditor*/
/*jslint vars: true, eqeq: true*/
/* SpinButton control
 *
 * Adds bells and whistles to any ordinary textbox to
 * make it look and feel like a SpinButton Control.
 *
 * Originally written by George Adamson, Software Unity (george.jquery@softwareunity.com) August 2006.
 * - Added min/max options
 * - Added step size option
 * - Added bigStep (page up/down) option
 *
 * Modifications made by Mark Gibson, (mgibson@designlinks.net) September 2006:
 * - Converted to jQuery plugin
 * - Allow limited or unlimited min/max values
 * - Allow custom class names, and add class to input element
 * - Removed global vars
 * - Reset (to original or through config) when invalid value entered
 * - Repeat whilst holding mouse button down (with initial pause, like keyboard repeat)
 * - Support mouse wheel in Firefox
 * - Fix double click in IE
 * - Refactored some code and renamed some vars
 *
 * Modifications by Jeff Schiller, June 2009:
 * - provide callback function for when the value changes based on the following
 *   http://www.mail-archive.com/jquery-en@googlegroups.com/msg36070.html
 * Modifications by Jeff Schiller, July 2009:
 * - improve styling for widget in Opera
 * - consistent key-repeat handling cross-browser
 * Modifications by Alexis Deveria, October 2009:
 * - provide "stepfunc" callback option to allow custom function to run when changing a value
 * - Made adjustValue(0) only run on certain keyup events, not all.
 *
 * Tested in IE6, Opera9, Firefox 1.5
 * v1.0  11 Aug 2006 - George Adamson	- First release
 * v1.1     Aug 2006 - George Adamson	- Minor enhancements
 * v1.2  27 Sep 2006 - Mark Gibson		- Major enhancements
 * v1.3a 28 Sep 2006 - George Adamson	- Minor enhancements
 * v1.4  18 Jun 2009 - Jeff Schiller    - Added callback function
 * v1.5  06 Jul 2009 - Jeff Schiller    - Fixes for Opera.  
 * v1.6  13 Oct 2009 - Alexis Deveria   - Added stepfunc function  
 * v1.7  21 Oct 2009 - Alexis Deveria   - Minor fixes
 *                                        Fast-repeat for keys and live updating as you type.
 * v1.8  12 Jan 2010 - Benjamin Thomas  - Fixes for mouseout behavior.
 *                                        Added smallStep
 
 Sample usage:
 
	// Create group of settings to initialise spinbutton(s). (Optional)
	var myOptions = {
					min: 0,						// Set lower limit.
					max: 100,					// Set upper limit.
					step: 1,					// Set increment size.
					smallStep: 0.5,				// Set shift-click increment size.
					spinClass: mySpinBtnClass,	// CSS class to style the spinbutton. (Class also specifies url of the up/down button image.)
					upClass: mySpinUpClass,		// CSS class for style when mouse over up button.
					downClass: mySpinDnClass	// CSS class for style when mouse over down button.
					}
 
	$(document).ready(function(){

		// Initialise INPUT element(s) as SpinButtons: (passing options if desired)
		$("#myInputElement").SpinButton(myOptions);

	});
 
 */
$.fn.SpinButton = function(cfg) { 'use strict';
	function coord(el,prop) {
		var c = el[prop], b = document.body;
		
		while ((el = el.offsetParent) && (el != b)) {
			if (!$.browser.msie || (el.currentStyle.position !== 'relative')) {
				c += el[prop];
			}
		}
		
		return c;
	}

	return this.each(function(){

		this.repeating = false;
		
		// Apply specified options or defaults:
		// (Ought to refactor this some day to use $.extend() instead)
		this.spinCfg = {
			//min: cfg && cfg.min ? Number(cfg.min) : null,
			//max: cfg && cfg.max ? Number(cfg.max) : null,
			min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,	// Fixes bug with min:0
			max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
			step: cfg && cfg.step ? Number(cfg.step) : 1,
			stepfunc: cfg && cfg.stepfunc ? cfg.stepfunc : false,
			page: cfg && cfg.page ? Number(cfg.page) : 10,
			upClass: cfg && cfg.upClass ? cfg.upClass : 'up',
			downClass: cfg && cfg.downClass ? cfg.downClass : 'down',
			reset: cfg && cfg.reset ? cfg.reset : this.value,
			delay: cfg && cfg.delay ? Number(cfg.delay) : 500,
			interval: cfg && cfg.interval ? Number(cfg.interval) : 100,
			_btn_width: 20,
			_direction: null,
			_delay: null,
			_repeat: null,
			callback: cfg && cfg.callback ? cfg.callback : null
		};

		// if a smallStep isn't supplied, use half the regular step
		this.spinCfg.smallStep = cfg && cfg.smallStep ? cfg.smallStep : this.spinCfg.step/2;
		
		this.adjustValue = function(i){
			var v;
			if(isNaN(this.value)) {
				v = this.spinCfg.reset;
			} else if($.isFunction(this.spinCfg.stepfunc)) {
				v = this.spinCfg.stepfunc(this, i);
			} else {
				// weirdest javascript bug ever: 5.1 + 0.1 = 5.199999999
				v = Number((Number(this.value) + Number(i)).toFixed(5));
			}
			if (this.spinCfg.min !== null) {v = Math.max(v, this.spinCfg.min);}
			if (this.spinCfg.max !== null) {v = Math.min(v, this.spinCfg.max);}
			this.value = v;
			if ($.isFunction(this.spinCfg.callback)) {this.spinCfg.callback(this);}
		};
		
		$(this)
		.addClass(cfg && cfg.spinClass ? cfg.spinClass : 'spin-button')
		
		.mousemove(function(e){
			// Determine which button mouse is over, or not (spin direction):
			var x = e.pageX || e.x;
			var y = e.pageY || e.y;
			var el = e.target || e.srcElement;
			var scale = svgEditor.tool_scale || 1;
			var height = $(el).height()/2;
			
			var direction = 
				(x > coord(el,'offsetLeft') + el.offsetWidth*scale - this.spinCfg._btn_width)
				? ((y < coord(el,'offsetTop') + height*scale) ? 1 : -1) : 0;
			
			if (direction !== this.spinCfg._direction) {
				// Style up/down buttons:
				switch(direction){
					case 1: // Up arrow:
						$(this).removeClass(this.spinCfg.downClass).addClass(this.spinCfg.upClass);
						break;
					case -1: // Down arrow:
						$(this).removeClass(this.spinCfg.upClass).addClass(this.spinCfg.downClass);
						break;
					default: // Mouse is elsewhere in the textbox
						$(this).removeClass(this.spinCfg.upClass).removeClass(this.spinCfg.downClass);
				}
				
				// Set spin direction:
				this.spinCfg._direction = direction;
			}
		})
		
		.mouseout(function(){
			// Reset up/down buttons to their normal appearance when mouse moves away:
			$(this).removeClass(this.spinCfg.upClass).removeClass(this.spinCfg.downClass);
			this.spinCfg._direction = null;
			window.clearInterval(this.spinCfg._repeat);
			window.clearTimeout(this.spinCfg._delay);
		})
		
		.mousedown(function(e){
			if (e.button === 0 && this.spinCfg._direction != 0) {
				// Respond to click on one of the buttons:
				var self = this;
				var stepSize = e.shiftKey ? self.spinCfg.smallStep : self.spinCfg.step;

				var adjust = function() {
					self.adjustValue(self.spinCfg._direction * stepSize);
				};
			
				adjust();
				
				// Initial delay before repeating adjustment
				self.spinCfg._delay = window.setTimeout(function() {
					adjust();
					// Repeat adjust at regular intervals
					self.spinCfg._repeat = window.setInterval(adjust, self.spinCfg.interval);
				}, self.spinCfg.delay);
			}
		})
		
		.mouseup(function(e){
			// Cancel repeating adjustment
			window.clearInterval(this.spinCfg._repeat);
			window.clearTimeout(this.spinCfg._delay);
		})
		
		.dblclick(function(e) {
			if ($.browser.msie) {
				this.adjustValue(this.spinCfg._direction * this.spinCfg.step);
			}
		})
		
		.keydown(function(e){
			// Respond to up/down arrow keys.
			switch(e.keyCode){
				case 38: this.adjustValue(this.spinCfg.step);  break; // Up
				case 40: this.adjustValue(-this.spinCfg.step); break; // Down
				case 33: this.adjustValue(this.spinCfg.page);  break; // PageUp
				case 34: this.adjustValue(-this.spinCfg.page); break; // PageDown
			}
		})
		
		/*
		http://unixpapa.com/js/key.html describes the current state-of-affairs for
		key repeat events:
		- Safari 3.1 changed their model so that keydown is reliably repeated going forward
		- Firefox and Opera still only repeat the keypress event, not the keydown
		*/
		.keypress(function(e){
			if (this.repeating) {
				// Respond to up/down arrow keys.
				switch(e.keyCode){
					case 38: this.adjustValue(this.spinCfg.step);  break; // Up
					case 40: this.adjustValue(-this.spinCfg.step); break; // Down
					case 33: this.adjustValue(this.spinCfg.page);  break; // PageUp
					case 34: this.adjustValue(-this.spinCfg.page); break; // PageDown
				}
			} 
			// we always ignore the first keypress event (use the keydown instead)
			else {
				this.repeating = true;
			}
		})
		
		// clear the 'repeating' flag
		.keyup(function(e) {
			this.repeating = false;
			switch(e.keyCode){
				case 38: // Up
				case 40: // Down
				case 33: // PageUp
				case 34: // PageDown
				case 13: this.adjustValue(0); break; // Enter/Return
			}
		})
		
		.bind("mousewheel", function(e){
			// Respond to mouse wheel in IE. (It returns up/dn motion in multiples of 120)
			if (e.wheelDelta >= 120) {
				this.adjustValue(this.spinCfg.step);
			}
			else if (e.wheelDelta <= -120) {
				this.adjustValue(-this.spinCfg.step);
			}
			
			e.preventDefault();
		})
		
		.change(function(e){
			this.adjustValue(0);
		});
		
		if (this.addEventListener) {
			// Respond to mouse wheel in Firefox
			this.addEventListener('DOMMouseScroll', function(e) {
				if (e.detail > 0) {
					this.adjustValue(-this.spinCfg.step);
				}
				else if (e.detail < 0) {
					this.adjustValue(this.spinCfg.step);
				}
				
				e.preventDefault();
			}, false);
		}
	});
};
