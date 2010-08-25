/*
 * SVG Icon Loader 2.0
 *
 * jQuery Plugin for loading SVG icons from a single file
 *
 * Copyright (c) 2009 Alexis Deveria
 * http://a.deveria.com
 *
 * Apache 2 License

How to use:

1. Create the SVG master file that includes all icons:

The master SVG icon-containing file is an SVG file that contains 
<g> elements. Each <g> element should contain the markup of an SVG
icon. The <g> element has an ID that should 
correspond with the ID of the HTML element used on the page that should contain 
or optionally be replaced by the icon. Additionally, one empty element should be
added at the end with id "svg_eof".

2. Optionally create fallback raster images for each SVG icon.

3. Include the jQuery and the SVG Icon Loader scripts on your page.

4. Run $.svgIcons() when the document is ready:

$.svgIcons( file [string], options [object literal]);

File is the location of a local SVG or SVGz file.

All options are optional and can include:

- 'w (number)': The icon widths

- 'h (number)': The icon heights

- 'fallback (object literal)': List of raster images with each
	key being the SVG icon ID to replace, and the value the image file name.
	
- 'fallback_path (string)': The path to use for all images
	listed under "fallback"
	
- 'replace (boolean)': If set to true, HTML elements will be replaced by,
	rather than include the SVG icon.

- 'placement (object literal)': List with selectors for keys and SVG icon ids
	as values. This provides a custom method of adding icons.

- 'resize (object literal)': List with selectors for keys and numbers
	as values. This allows an easy way to resize specific icons.
	
- 'callback (function)': A function to call when all icons have been loaded. 
	Includes an object literal as its argument with as keys all icon IDs and the 
	icon as a jQuery object as its value.

- 'id_match (boolean)': Automatically attempt to match SVG icon ids with
	corresponding HTML id (default: true)
	
- 'no_img (boolean)': Prevent attempting to convert the icon into an <img>
	element (may be faster, help for browser consistency)

- 'svgz (boolean)': Indicate that the file is an SVGZ file, and thus not to
	parse as XML. SVGZ files add compression benefits, but getting data from
	them fails in Firefox 2 and older.

5. To access an icon at a later point without using the callback, use this:
	$.getSvgIcon(id (string));

This will return the icon (as jQuery object) with a given ID.
	
6. To resize icons at a later point without using the callback, use this:
	$.resizeSvgIcons(resizeOptions) (use the same way as the "resize" parameter)


Example usage #1:

$(function() {
	$.svgIcons('my_icon_set.svg'); // The SVG file that contains all icons
	// No options have been set, so all icons will automatically be inserted 
	// into HTML elements that match the same IDs. 
});

Example usage #2:

$(function() {
	$.svgIcons('my_icon_set.svg', { // The SVG file that contains all icons
		callback: function(icons) { // Custom callback function that sets click
									// events for each icon
			$.each(icons, function(id, icon) {
				icon.click(function() {
					alert('You clicked on the icon with id ' + id);
				});
			});
		}
	}); //The SVG file that contains all icons
});

Example usage #3:

$(function() {
	$.svgIcons('my_icon_set.svgz', { // The SVGZ file that contains all icons
		w: 32,	// All icons will be 32px wide
		h: 32,  // All icons will be 32px high
		fallback_path: 'icons/',  // All fallback files can be found here
		fallback: {
			'#open_icon': 'open.png',  // The "open.png" will be appended to the
									   // HTML element with ID "open_icon"
			'#close_icon': 'close.png',
			'#save_icon': 'save.png'
		},
		placement: {'.open_icon','open'}, // The "open" icon will be added
										  // to all elements with class "open_icon"
		resize: function() {
			'#save_icon .svg_icon': 64  // The "save" icon will be resized to 64 x 64px
		},
		
		callback: function(icons) { // Sets background color for "close" icon 
			icons['close'].css('background','red');
		},
		
		svgz: true // Indicates that an SVGZ file is being used
		
	})
});

*/


(function($) {
	function makeSVG(el) {
		// manually create a copy of the element
		var new_el = document.createElementNS(el.namespaceURI, el.nodeName);
		$.each(el.attributes, function(i, attr) {
			var ns = attr.namespaceURI;
			if(ns) {
				new_el.setAttributeNS(ns, attr.nodeName, attr.nodeValue);
			} else {
				new_el.setAttribute(attr.nodeName, attr.nodeValue);
			}
			if(attr.nodeName == 'transform') {
				console.log('val1:', attr.nodeValue);
				console.log('val2:', new_el.getAttribute('transform'));
			}
		});
	
		// now create copies of all children
		$.each(el.childNodes, function(i, child) {
			switch(child.nodeType) {
				case 1: // element node
					new_el.appendChild(makeSVG(child));
					break;
				case 3: // text node
					new_el.textContent = child.nodeValue;
					break;
				default:
					break;
			}
		});
		return new_el;
	}

	var svg_icons = {};

	$.svgIcons = function(file, opts) {
		var svgns = "http://www.w3.org/2000/svg",
			xlinkns = "http://www.w3.org/1999/xlink",
			icon_w = opts.w?opts.w : 24,
			icon_h = opts.h?opts.h : 24,
			elems, svgdoc, testImg,
			icons_made = false, data_loaded = false, load_attempts = 0,
			ua = navigator.userAgent, isOpera = !!window.opera, isSafari = (ua.indexOf('Safari/') > -1 && ua.indexOf('Chrome/')==-1),
			data_pre = 'data:image/svg+xml;charset=utf-8;base64,';
			
			if(opts.svgz) {
				var data_el = $('<object data="' + file + '" type=image/svg+xml>').appendTo('body').hide();
				try {
					svgdoc = data_el[0].contentDocument;
					// TODO: IE still loads this, shouldn't even bother.
					data_el.load(getIcons);
					getIcons(0, true); // Opera will not run "load" event if file is already cached
				} catch(err1) {
					useFallback();
				}
			} else {
				$.ajax({
					url: file,
					dataType: 'xml',
					success: function(data) {
						svgdoc = data;
						$(function() {
							getIcons('ajax');
						});
					},
					error: function(err) {
						// TODO: Fix Opera widget icon bug
						if(window.opera) {
							$(function() {
								useFallback();
							});
						} else {
							if(err.responseXML) {
								// Is there a non-ActiveX solution in IE9?
								svgdoc = err.responseXML;

								if(!svgdoc.childNodes.length) {
									if(window.ActiveXObject) { 
										svgdoc = new ActiveXObject("Microsoft.XMLDOM");
										svgdoc.loadXML(err.responseText);
									} else {
										$(useFallback);
									}
								} else {
									$(useFallback);									
								}
								$(function() {
									getIcons('ajax');
								});							
							} else {
								$(useFallback);
							}
						}
					}
				});
			}
			
		function getIcons(evt, no_wait) {
			if(evt !== 'ajax') {
				if(data_loaded) return;
				// Webkit sometimes says svgdoc is undefined, other times
				// it fails to load all nodes. Thus we must make sure the "eof" 
				// element is loaded.
				svgdoc = data_el[0].contentDocument; // Needed again for Webkit
				var isReady = (svgdoc && svgdoc.getElementById('svg_eof'));
				if(!isReady && !(no_wait && isReady)) {
					load_attempts++;
					if(load_attempts < 50) {
						setTimeout(getIcons, 20);
					} else {
						useFallback();
						data_loaded = true;
					}
					return;
				}
				data_loaded = true;
			}
			// Clean source SVGs (mostly for Inkscape files)
			// TODO: Find a way to do this without crashing Safari (when converting to IMG)
			$(svgdoc).find('metadata').remove().end()
				.find('*').each(function(i, el) {
				if(el.nodeName.indexOf(':') != -1) {
					$(el).remove();
				}
				var attrs = $.extend(false, el.attributes, {});
				for(i in attrs) {
					var attr = attrs[i];
					var fullattr = attr.prefix?attr.prefix + ':' + attr.localName:'';
					if(attr.prefix) {
						el.removeAttribute(attr.localName); // for Opera
						el.removeAttribute(fullattr); // for Webkit
					} 
					if(fullattr == 'xlink:href') {
						el.setAttribute('xlink:href', attr.nodeValue);
					}
				}
			});
			
			elems = $(svgdoc.firstChild).children(); //.getElementsByTagName('foreignContent');
			
			if(!opts.no_img) {
			
				var testSrc = data_pre + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D';
				
				testImg = $(new Image()).attr({
					src: testSrc,
					width: 0,
					height: 0
				}).appendTo('body')
				.load(function () {
					// Safari 4 crashes, Opera and Chrome don't
					makeIcons(!isSafari);
				}).error(function () {
					makeIcons();
				});
			} else {
				setTimeout(function() {
					if(!icons_made) makeIcons();
				},500);
			}
		}
		
		function makeIcons(toImage, fallback) {
			if(icons_made) return;
			if(opts.no_img) toImage = false;
			var holder;
			
			var setIcon = function(target, icon, id, setID) {
				if(isOpera) icon.css('visibility','hidden');
				if(opts.replace) {
					if(setID) icon.attr('id',id);
					var cl = target.attr('class');
					if(cl) icon.attr('class','svg_icon '+cl);
					target.replaceWith(icon);
				} else {
					
					target.append(icon);
				}
				if(isOpera) {
					setTimeout(function() {
						icon.removeAttr('style');
					},1);
				}
			}
			
			var addIcon = function(icon, id) {
				if(opts.id_match === undefined || opts.id_match !== false) {
					setIcon(holder, icon, id, true);
				}
				svg_icons[id] = icon;
			}
			
			if(toImage) {
				var temp_holder = $(document.createElement('div'));
				temp_holder.hide().appendTo('body');
			} 
			if(fallback) {
				var path = opts.fallback_path?opts.fallback_path:'';
				$.each(fallback, function(id, imgsrc) {
					holder = $('#' + id);
					var icon = $(new Image())
						.attr({
							'class':'svg_icon',
							src: path + imgsrc,
							'width': icon_w,
							'height': icon_h,
							'alt': 'icon'
						});
					
					addIcon(icon, id);
				});
			} else {
				$.each(elems, function(i, elem) {
					var id = elem.getAttribute('id');
					if(id == 'svg_eof') return;
					holder = $('#' + id);
					if(elem.getElementsByTagNameNS) {
						var svg = elem.getElementsByTagNameNS(svgns, 'svg')[0];
					} else {
						var svg = elem.getElementsByTagName('svg')[0];
					}
					var svgroot = document.createElementNS(svgns, "svg");
					svgroot.setAttributeNS(svgns, 'viewBox', [0,0,icon_w,icon_h].join(' '));
					
					// Make flexible by converting width/height to viewBox
					var w = svg.getAttribute('width');
					var h = svg.getAttribute('height');
					svg.removeAttribute('width');
					svg.removeAttribute('height');
					
					var vb = svg.getAttribute('viewBox');
					if(!vb) {
						svg.setAttribute('viewBox', [0,0,w,h].join(' '));
					}
					
					$(svgroot).attr({
						"xmlns": svgns,
						"width": icon_w,
						"height": icon_h,
						"xmlns:xlink": xlinkns,
						"class": 'svg_icon'
					});

					// Without cloning, Firefox will make another GET request.
					// With cloning, causes issue in Opera/Win/Non-EN
					if(!isOpera) svg = svg.cloneNode(true);
					
					// TODO: Figure out why makeSVG is necessary for IE9
					try {
						svgroot.appendChild(svg);
					} catch(e) {
						// For IE9
						svgroot.appendChild(makeSVG(svg));
					}
			
					if(toImage) {
						// Without cloning, Safari will crash
						// With cloning, causes issue in Opera/Win/Non-EN
						var svgcontent = isOpera?svgroot:svgroot.cloneNode(true);
						temp_holder.empty().append(svgroot);
						var str = data_pre + encode64(temp_holder.html());
						var icon = $(new Image())
							.attr({'class':'svg_icon', src:str});
					} else {
						var icon = fixIDs($(svgroot), i);
					}
					addIcon(icon, id);
				});
			}
			
			if(opts.placement) {
				$.each(opts.placement, function(sel, id) {
					if(!svg_icons[id]) return;
					$(sel).each(function(i) {
						// TODO: Figure out why makeSVG is necessary for IE9
						try {
							var copy = svg_icons[id].clone();
						} catch(e) {
							var copy = makeSVG(svg_icons[id][0]);
						}
						setIcon($(this), copy, id);
					})
				});
			}
			if(!fallback) {
				if(toImage) temp_holder.remove();
				if(data_el) data_el.remove();
				if(testImg) testImg.remove();
			}
			if(opts.resize) $.resizeSvgIcons(opts.resize);
			icons_made = true;
			
			if(opts.callback) opts.callback(svg_icons);
			
		}
		
		function fixIDs(svg_el, svg_num, force) {
			var defs = svg_el.find('defs');
			if(!defs.length) return svg_el;
			
			defs.find('[id]').each(function(i) {
				var id = this.id;
				var no_dupes = ($(svgdoc).find('#' + id).length <= 1);
				if(isOpera) no_dupes = false; // Opera didn't clone svg_el, so not reliable
				// if(!force && no_dupes) return;
				var new_id = 'x' + id + svg_num + i;
				$(this).attr('id', new_id);			
	
				svg_el.find('[fill="url(#' + id + ')"]').each(function() {
					$(this).attr('fill', 'url(#' + new_id + ')');
				}).end().find('[stroke="url(#' + id + ')"]').each(function() {
					$(this).attr('stroke', 'url(#' + new_id + ')');
				}).end().find('use').each(function() {
					if(this.getAttribute('xlink:href') == '#' + id) {
						this.setAttributeNS(xlinkns,'href','#' + new_id);
					}
				}).end().find('[filter="url(#' + id + ')"]').each(function() {
					$(this).attr('filter', 'url(#' + new_id + ')');
				});
			});
			return svg_el;
		}
		
		function useFallback() {
			if(file.indexOf('.svgz') != -1) {
				var reg_file = file.replace('.svgz','.svg');
				if(window.console) {
					console.log('.svgz failed, trying with .svg');
				}
				$.svgIcons(reg_file, opts);
			} else if(opts.fallback) {
				makeIcons(false, opts.fallback);
			}
		}
				
		function encode64(input) {
			// base64 strings are 4/3 larger than the original string
			if(window.btoa) return window.btoa(input);
			var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = new Array( Math.floor( (input.length + 2) / 3 ) * 4 );
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0, p = 0;
		
			do {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
		
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
		
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
		
				output[p++] = _keyStr.charAt(enc1);
				output[p++] = _keyStr.charAt(enc2);
				output[p++] = _keyStr.charAt(enc3);
				output[p++] = _keyStr.charAt(enc4);
			} while (i < input.length);
		
			return output.join('');
		}
	}
	
	$.getSvgIcon = function(id) { return svg_icons[id]; }
	
	$.resizeSvgIcons = function(obj) {
		// FF2 and older don't detect .svg_icon, so we change it detect svg elems instead
		var change_sel = !$('.svg_icon:first').length;
		$.each(obj, function(sel, size) {
			var arr = $.isArray(size);
			var w = arr?size[0]:size,
				h = arr?size[1]:size;
			if(change_sel) {
				sel = sel.replace(/\.svg_icon/g,'svg');
			}
			$(sel).each(function() {
				this.setAttribute('width', w);
				this.setAttribute('height', h);
				if(window.opera && window.widget) {
					this.parentNode.style.width = w + 'px';
					this.parentNode.style.height = h + 'px';
				}
			});
		});
	}
	
})(jQuery);
