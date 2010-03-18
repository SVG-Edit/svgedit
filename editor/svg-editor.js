/*
 * svg-editor.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Narendra Sisodya
 *
 */

(function() { 
	
	if(!window.svgEditor) window.svgEditor = function($) {
		var svgCanvas;
		var Editor = {};
		var is_ready = false;
		
		var defaultPrefs = {
			lang:'en',
			iconsize:'m',
			bkgd_color:'#FFF',
			bkgd_url:'',
			img_save:'embed'
			},
			curPrefs = {},
			
			// Note: Difference between Prefs and Config is that Prefs can be
			// changed in the UI and are stored in the browser, config can not
			
			curConfig = {
				canvas_expansion: 3,
				dimensions: [640,480],
				initFill: {
					color: 'FF0000',  // solid red
					opacity: 1
				},
				initStroke: {
					width: 5,
					color: '000000',  // solid black
					opacity: 1
				},
				initOpacity: 1,
				imgPath: 'images/',
				langPath: 'locale/',
				initTool: 'select',
				wireframe: false
			},
			uiStrings = {
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
		
		var curPrefs = {}; //$.extend({}, defaultPrefs);
		
		Editor.curConfig = curConfig;
		
		// Store and retrieve preferences
		$.pref = function(key, val) {
			if(val) curPrefs[key] = val;
			key = 'svg-edit-'+key;
			var host = location.hostname,
				onweb = host && host.indexOf('.') != -1,
				store = (val != undefined),
				storage = false;
			// Some FF versions throw security errors here
			try { 
				if(window.localStorage) { // && onweb removed so Webkit works locally
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
					else if (storage.getItem(key)) return storage.getItem(key) + ''; // Convert to string for FF (.value fails in Webkit)
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
		
		Editor.setConfig = function(opts) {
			$.each(opts, function(key, val) {
				// Only allow prefs defined in defaultPrefs
				if(key in defaultPrefs) {
					$.pref(key, val);
				}
			});
			$.extend(true, curConfig, opts);
		}
		
		// Extension mechanisms must call setCustomHandlers with two functions: opts.open and opts.save
		// opts.open's responsibilities are:
		// 	- invoke a file chooser dialog in 'open' mode
		//	- let user pick a SVG file
		//	- calls setCanvas.setSvgString() with the string contents of that file
		// opts.save's responsibilities are:
		//	- accept the string contents of the current document 
		//	- invoke a file chooser dialog in 'save' mode
		// 	- save the file to location chosen by the user
		Editor.setCustomHandlers = function(opts) {
			if(opts.open) {
				$('#tool_open').show();
				svgCanvas.open = opts.open;
			}
			if(opts.save) {
				svgCanvas.bind("saved", opts.save);
			}
		}
		
		Editor.randomizeIds = function() {
			svgCanvas.randomizeIds(arguments)
		}

		Editor.init = function() {
			(function() {
				// Load config/data from URL if given
				var urldata = $.deparam.querystring(true);
				if(!$.isEmptyObject(urldata)) {
					if(urldata.dimensions) {
						urldata.dimensions = urldata.dimensions.split(',');
					}
					
					if(urldata.bkgd_color) {
						urldata.bkgd_color = '#' + urldata.bkgd_color;
					}
					
					if(urldata.bkgd_color) {
						urldata.bkgd_color = '#' + urldata.bkgd_color;
					}

					svgEditor.setConfig(urldata);
					
					var src = urldata.source;

					if(src) {
						if(src.indexOf("data:") === 0) {
							// plusses get replaced by spaces, so re-insert
							src = src.replace(/ /g, "+");
							Editor.loadFromDataURI(src);
						} else {
							Editor.loadFromString(src);
						}
					} else if(urldata.url) {
						svgEditor.loadFromURL(urldata.url);
					}
				}
			})();
			
			$.svgIcons(curConfig.imgPath + 'svg_edit_icons.svg', {
				w:24, h:24,
				id_match: false,
				no_img: true,
				fallback_path: curConfig.imgPath,
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
					'select_node':'select_node.png',
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
					'to_path':'to_path.png',
					'link_controls':'link_controls.png',
					'reorient':'reorient.png',
					
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
					'#logo':'logo',
				
					'#tool_clear div,#layer_new':'new_image',
					'#tool_save div':'save',
					'#tool_open div div':'open',
					'#tool_import div div':'import',
					'#tool_source':'source',
					'#tool_docprops > div':'docprops',
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
					'#tool_add_subpath':'add_subpath',
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
					'.dropdown button, #main_button .dropdown':'arrow_down',
					'#palette .palette_item:first, #fill_bg, #stroke_bg':'no_color'
				},
				resize: {
					'#logo .svg_icon': 32,
					'.flyout_arrow_horiz .svg_icon': 5,
					'.layer_button .svg_icon, #layerlist td.layervis .svg_icon': 14,
					'.dropdown button .svg_icon': 7,
					'#main_button .dropdown .svg_icon': 9,
					'.palette_item:first .svg_icon, #fill_bg .svg_icon, #stroke_bg .svg_icon': 16,
					'.toolbar_button button .svg_icon':16
				},
				callback: function(icons) {
					$('.toolbar_button button > svg, .toolbar_button button > img').each(function() {
						$(this).parent().prepend(this);
					});
					
					// Use small icons by default if not all left tools are visible
					var tleft = $('#tools_left');
					var min_height = tleft.offset().top + tleft.outerHeight();
					var size = $.pref('iconsize');
					if(size && size != 'm') {
						svgEditor.setIconSize(size);				
					} else if($(window).height() < min_height) {
						// Make smaller
						svgEditor.setIconSize('s');
					}
					
					// Look for any missing flyout icons from plugins
					$('.tools_flyout').each(function() {
						var shower = $('#' + this.id + '_show');
						var sel = shower.attr('data-curopt');
						// Check if there's an icon here
						if(!shower.children('svg, img').length) {
							var clone = $(sel).children().clone();
							clone[0].removeAttribute('style'); //Needed for Opera
							shower.append(clone);
						}
					});
					
					svgEditor.runCallbacks();
				}
			});

			Editor.canvas = svgCanvas = new $.SvgCanvas(document.getElementById("svgcanvas"), curConfig);
			
			var palette = ["#000000","#202020","#404040","#606060","#808080","#a0a0a0","#c0c0c0","#e0e0e0","#ffffff","#800000","#ff0000","#808000","#ffff00","#008000","#00ff00","#008080","#00ffff","#000080","#0000ff","#800080","#ff00ff","#2b0000","#550000","#800000","#aa0000","#d40000","#ff0000","#ff2a2a","#ff5555","#ff8080","#ffaaaa","#ffd5d5","#280b0b","#501616","#782121","#a02c2c","#c83737","#d35f5f","#de8787","#e9afaf","#f4d7d7","#241c1c","#483737","#6c5353","#916f6f","#ac9393","#c8b7b7","#e3dbdb","#2b1100","#552200","#803300","#aa4400","#d45500","#ff6600","#ff7f2a","#ff9955","#ffb380","#ffccaa","#ffe6d5","#28170b","#502d16","#784421","#a05a2c","#c87137","#d38d5f","#deaa87","#e9c6af","#f4e3d7","#241f1c","#483e37","#6c5d53","#917c6f","#ac9d93","#c8beb7","#e3dedb","#2b2200","#554400","#806600","#aa8800","#d4aa00","#ffcc00","#ffd42a","#ffdd55","#ffe680","#ffeeaa","#fff6d5","#28220b","#504416","#786721","#a0892c","#c8ab37","#d3bc5f","#decd87","#e9ddaf","#f4eed7","#24221c","#484537","#6c6753","#918a6f","#aca793","#c8c4b7","#e3e2db","#222b00","#445500","#668000","#88aa00","#aad400","#ccff00","#d4ff2a","#ddff55","#e5ff80","#eeffaa","#f6ffd5","#22280b","#445016","#677821","#89a02c","#abc837","#bcd35f","#cdde87","#dde9af","#eef4d7","#22241c","#454837","#676c53","#8a916f","#a7ac93","#c4c8b7","#e2e3db","#112b00","#225500","#338000","#44aa00","#55d400","#66ff00","#7fff2a","#99ff55","#b3ff80","#ccffaa","#e5ffd5","#17280b","#2d5016","#447821","#5aa02c","#71c837","#8dd35f","#aade87","#c6e9af","#e3f4d7","#1f241c","#3e4837","#5d6c53","#7c916f","#9dac93","#bec8b7","#dee3db","#002b00","#005500","#008000","#00aa00","#00d400","#00ff00","#2aff2a","#55ff55","#80ff80","#aaffaa","#d5ffd5","#0b280b","#165016","#217821","#2ca02c","#37c837","#5fd35f","#87de87","#afe9af","#d7f4d7","#1c241c","#374837","#536c53","#6f916f","#93ac93","#b7c8b7","#dbe3db","#002b11","#005522","#008033","#00aa44","#00d455","#00ff66","#2aff80","#55ff99","#80ffb3","#aaffcc","#d5ffe6","#0b2817","#16502d","#217844","#2ca05a","#37c871","#5fd38d","#87deaa","#afe9c6","#d7f4e3","#1c241f","#37483e","#536c5d","#6f917c","#93ac9d","#b7c8be","#dbe3de","#002b22","#005544","#008066","#00aa88","#00d4aa","#00ffcc","#2affd5","#55ffdd","#80ffe6","#aaffee","#d5fff6","#0b2822","#165044","#217867","#2ca089","#37c8ab","#5fd3bc","#87decd","#afe9dd","#d7f4ee","#1c2422","#374845","#536c67","#6f918a","#93aca7","#b7c8c4","#dbe3e2","#00222b","#004455","#006680","#0088aa","#00aad4","#00ccff","#2ad4ff","#55ddff","#80e5ff","#aaeeff","#d5f6ff","#0b2228","#164450","#216778","#2c89a0","#37abc8","#5fbcd3","#87cdde","#afdde9","#d7eef4","#1c2224","#374548","#53676c","#6f8a91","#93a7ac","#b7c4c8","#dbe2e3","#00112b","#002255","#003380","#0044aa","#0055d4","#0066ff","#2a7fff","#5599ff","#80b3ff","#aaccff","#d5e5ff","#0b1728","#162d50","#214478","#2c5aa0","#3771c8","#5f8dd3","#87aade","#afc6e9","#d7e3f4","#1c1f24","#373e48","#535d6c","#6f7c91","#939dac","#b7bec8","#dbdee3","#00002b","#000055","#000080","#0000aa","#0000d4","#0000ff","#2a2aff","#5555ff","#8080ff","#aaaaff","#d5d5ff","#0b0b28","#161650","#212178","#2c2ca0","#3737c8","#5f5fd3","#8787de","#afafe9","#d7d7f4","#1c1c24","#373748","#53536c","#6f6f91","#9393ac","#b7b7c8","#dbdbe3","#11002b","#220055","#330080","#4400aa","#5500d4","#6600ff","#7f2aff","#9955ff","#b380ff","#ccaaff","#e5d5ff","#170b28","#2d1650","#442178","#5a2ca0","#7137c8","#8d5fd3","#aa87de","#c6afe9","#e3d7f4","#1f1c24","#3e3748","#5d536c","#7c6f91","#9d93ac","#beb7c8","#dedbe3","#22002b","#440055","#660080","#8800aa","#aa00d4","#cc00ff","#d42aff","#dd55ff","#e580ff","#eeaaff","#f6d5ff","#220b28","#441650","#672178","#892ca0","#ab37c8","#bc5fd3","#cd87de","#ddafe9","#eed7f4","#221c24","#453748","#67536c","#8a6f91","#a793ac","#c4b7c8","#e2dbe3","#2b0022","#550044","#800066","#aa0088","#d400aa","#ff00cc","#ff2ad4","#ff55dd","#ff80e5","#ffaaee","#ffd5f6","#280b22","#501644","#782167","#a02c89","#c837ab","#d35fbc","#de87cd","#e9afdd","#f4d7ee","#241c22","#483745","#6c5367","#916f8a","#ac93a7","#c8b7c4","#e3dbe2","#2b0011","#550022","#800033","#aa0044","#d40055","#ff0066","#ff2a7f","#ff5599","#ff80b2","#ffaacc","#ffd5e5","#280b17","#50162d","#782144","#a02c5a","#c83771","#d35f8d","#de87aa","#e9afc6","#f4d7e3","#241c1f","#48373e","#6c535d","#916f7c","#ac939d","#c8b7be","#e3dbde"],
		
				isMac = false, //(navigator.platform.indexOf("Mac") != -1);
				modKey = "", //(isMac ? "meta+" : "ctrl+");
				path = svgCanvas.pathActions,
				default_img_url = curConfig.imgPath + "logo.png",
				workarea = $("#workarea");

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
				$('#tool_select').addClass('tool_button_current').removeClass('tool_button');
				$('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all} #svgcanvas svg{cursor:default}');
				svgCanvas.setMode('select');
			};
			
			var togglePathEditMode = function(editmode, elems) {
				$('#path_node_panel').toggle(editmode);
				$('#tools_bottom_2,#tools_bottom_3').toggle(!editmode);
				var size = $('#tool_select > svg, #tool_select > img')[0].getAttribute('width');
				if(editmode) {
					// Change select icon
					$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
					$('#tool_select').addClass('tool_button_current').removeClass('tool_button')
						.empty().append($.getSvgIcon('select_node'));
					multiselected = false;
					if(elems.length) {
						selectedElement = elems[0];
					}
				} else {
					$('#tool_select').empty().append($.getSvgIcon('select'));
				}
				$.resizeSvgIcons({'#tool_select .svg_icon':size});
			}
		
			// used to make the flyouts stay on the screen longer the very first time
			var flyoutspeed = 1250;
			var textBeingEntered = false;
			var selectedElement = null;
			var multiselected = false;
			var editingsource = false;
			var docprops = false;
			
			var fillPaint = new $.jGraduate.Paint({solidColor: curConfig.initFill.color});
			var strokePaint = new $.jGraduate.Paint({solidColor: curConfig.initStroke.color});
		
			var saveHandler = function(window,svg) {
				// by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs) 
				// can just provide their own custom save handler and might not want the XML prolog
				svg = "<?xml version='1.0'?>\n" + svg;
				
				// Creates and opens an HTML page that provides a link to the SVG, a preview, and the markup. 
				// Also includes warning about Mozilla bug #308590 when applicable
				
				var win = window.open("data:image/svg+xml;base64," + Utils.encode64(svg));
				
				// Alert will only appear the first time saved OR the first time the bug is encountered
				var done = $.pref('save_notice_done');
				if(done !== "all") {
		
					var note = 'Select "Save As..." in your browser to save this image as an SVG file.';
					
					// Check if FF and has <defs/>
					if(navigator.userAgent.indexOf('Gecko/') !== -1) {
						if(svg.indexOf('<defs') !== -1) {
							note += "\n\nNOTE: Due to a bug in your browser, this image may appear wrong (missing gradients or elements). It will however appear correct once actually saved.";
							$.pref('save_notice_done', 'all');
							done = "all";
						} else {
							$.pref('save_notice_done', 'part');
						}
					} else {
						$.pref('save_notice_done', 'all'); 
					}
					
					if(done !== 'part') {
						win.alert(note);
					}
				}
			};
			
			// called when we've selected a different element
			var selectedChanged = function(window,elems) {
				var mode = svgCanvas.getMode();
				var is_node = (mode == "pathedit");
				// if elems[1] is present, then we have more than one element
				selectedElement = (elems.length == 1 || elems[1] == null ? elems[0] : null);
				multiselected = (elems.length >= 2 && elems[1] != null);
				if (selectedElement != null) {
					// unless we're already in always set the mode of the editor to select because
					// upon creation of a text element the editor is switched into
					// select mode and this event fires - we need our UI to be in sync
					
					if (mode != "multiselect" && !is_node) {
						setSelectMode();
						updateToolbar();
					} 
					
				} // if (elem != null)
		
				// Deal with pathedit mode
				togglePathEditMode(is_node, elems);
				updateContextPanel();
				svgCanvas.runExtensions("selectedChanged", {
					elems: elems,
					selectedElement: selectedElement,
					multiselected: multiselected
				});
			};
		
			// called when any element has changed
			var elementChanged = function(window,elems) {
				for (var i = 0; i < elems.length; ++i) {
					var elem = elems[i];
					
					// if the element changed was the svg, then it could be a resolution change
					if (elem && elem.tagName == "svg") {
						populateLayers();
						updateCanvas();
					} 
					// Update selectedElement if element is no longer part of the image.
					// This occurs for the text elements in Firefox
					else if(elem && selectedElement && selectedElement.parentNode == null
						|| elem && elem.tagName == "path") {
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
				
				svgCanvas.runExtensions("elementChanged", {
					elems: elems
				});
			};
			
			var zoomChanged = function(window, bbox, autoCenter) {
				var scrbar = 15,
					res = svgCanvas.getResolution(),
					w_area = workarea,
					canvas_pos = $('#svgcanvas').position();
				w_area.css('cursor','auto');
				var z_info = svgCanvas.setBBoxZoom(bbox, w_area.width()-scrbar, w_area.height()-scrbar);
				if(!z_info) return;
				var zoomlevel = z_info.zoom,
					bb = z_info.bbox;
				$('#zoom').val(Math.round(zoomlevel*100));
				
				if(autoCenter) {
					updateCanvas();
				} else {
					updateCanvas(false, {x: bb.x * zoomlevel + (bb.width * zoomlevel)/2, y: bb.y * zoomlevel + (bb.height * zoomlevel)/2});
				}
		
				if(svgCanvas.getMode() == 'zoom' && bb.width) {
					// Go to select if a zoom box was drawn
					setSelectMode();
				}
				zoomDone();
			}
			
			var flyout_funcs = {};
			
			var setupFlyouts = function(holders) {
				$.each(holders, function(hold_sel, btn_opts) {
					var buttons = $(hold_sel).children();
					var show_sel = hold_sel + '_show';
					var def = false;
					buttons.addClass('tool_button')
						.unbind('click mousedown mouseup') // may not be necessary
						.each(function(i) {
							// Get this buttons options
							var opts = btn_opts[i];
							
							// Remember the function that goes with this ID
							flyout_funcs[opts.sel] = opts.fn;
		
							if(opts.isDefault) def = i;
							
							// Clicking the icon in flyout should set this set's icon
							
							var func = function() {
								if($(this).hasClass('disabled')) return false;
								if (toolButtonClick(show_sel)) {
									opts.fn();
								}
								if(opts.icon) {
									var icon = $.getSvgIcon(opts.icon).clone();
								} else {
									// 
									var icon = $(opts.sel).children().eq(0).clone();
								}
								
								var shower = $(show_sel);
								icon[0].setAttribute('width',shower.width());
								icon[0].setAttribute('height',shower.height());
								shower.children(':not(.flyout_arrow_horiz)').remove();
								shower.append(icon).attr('data-curopt', opts.sel); // This sets the current mode
							}
							
							$(this).mouseup(func);
							
							if(opts.key) {
								$(document).bind('keydown', {combi: opts.key+'', disableInInput:true}, func);
							}
						});
					
					if(def) {
						$(show_sel).attr('data-curopt', btn_opts[def].sel);
					} else if(!$(show_sel).attr('data-curopt')) {
						// Set first as default
						$(show_sel).attr('data-curopt', btn_opts[0].sel);
					}
					
					var timer;
					
					// Clicking the "show" icon should set the current mode
					$(show_sel).mousedown(function(evt) {
						if($(show_sel).hasClass('disabled')) return false;
						var holder = $(show_sel.replace('_show',''));
						var l = holder.css('left');
						var w = holder.width()*-1;
						var time = holder.data('shown_popop')?200:0;
						timer = setTimeout(function() {
							// Show corresponding menu
							holder.css('left', w).show().animate({
								left: l
							},150);
							holder.data('shown_popop',true);
						},time);
						evt.preventDefault();
					}).mouseup(function() {
						clearTimeout(timer);
						var opt = $(this).attr('data-curopt');
						if (toolButtonClick(show_sel)) {
							flyout_funcs[opt]();
						}
					});
					
					// 	$('#tools_rect').mouseleave(function(){$('#tools_rect').fadeOut();});
					
					var pos = $(show_sel).position();
					$(hold_sel).css({'left': pos.left+34, 'top': pos.top+77});
				});
				
				setFlyoutTitles();
			}
			
			var makeFlyoutHolder = function(id, child) {
				var div = $('<div>',{
					'class': 'tools_flyout',
					id: id
				}).appendTo('#svg_editor').append(child);
				
				return div;
			}
			
			var setFlyoutPositions = function() {
				$('.tools_flyout').each(function() {
					var shower = $('#' + this.id + '_show');
					var pos = shower.offset();
					var w = shower.outerWidth();
					$(this).css({left: pos.left + w, top: pos.top});
				});
			}
			
			var setFlyoutTitles = function() {
				$('.tools_flyout').each(function() {
					var shower = $('#' + this.id + '_show');
					var tooltips = [];
					$(this).children().each(function() {
						tooltips.push(this.title);
					});
					shower[0].title = tooltips.join(' / ');
				});
			}
			
			var extAdded = function(window, ext) {
		
				var cb_called = false;
				
				var runCallback = function() {
					if(ext.callback && !cb_called) {
						cb_called = true;
						ext.callback();
					}
				}
		
				if(ext.context_tools) {
					$.each(ext.context_tools, function(i, tool) {
						// Add select tool
						var cont_id = tool.container_id?(' id="' + tool.container_id + '"'):"";
						
						var panel = $('#' + tool.panel);
						
						// create the panel if it doesn't exist
						if(!panel.length)
							panel = $('<div>', {id: tool.panel}).appendTo("#tools_top");
						
						// TODO: Allow support for other types, or adding to existing tool
						switch (tool.type) {
						case 'tool_button':
							var html = '<div class="tool_button">' + tool.id + '</div>';
							var div = $(html).appendTo(panel);
							if (tool.events) {
								$.each(tool.events, function(evt, func) {
									$(div).bind(evt, func);
								});
							}
							break;
						case 'select':
							var html = '<label' + cont_id + '>'
								+ '<select id="' + tool.id + '">';
							$.each(tool.options, function(val, text) {
								var sel = (val == tool.defval) ? " selected":"";
								html += '<option value="'+val+'"' + sel + '>' + text + '</option>';
							});
							html += "</select></label>";
							// Creates the tool, hides & adds it, returns the select element
							var sel = $(html).appendTo(panel).find('select');
							
							$.each(tool.events, function(evt, func) {
								$(sel).bind(evt, func);
							});
							break;
						
						case 'input':
							var html = '<label' + cont_id + '>'
								+ '<span id="' + tool.id + '_label">' 
								+ tool.label + ':</span>'
								+ '<input id="' + tool.id + '" title="' + tool.title
								+ '" size="' + (tool.size || "4") + '" value="' + (tool.defval || "") + '" type="text"/></label>'
								
							// Creates the tool, hides & adds it, returns the select element
							
							// Add to given tool.panel
							var inp = $(html).appendTo(panel).find('input');
							
							if(tool.spindata) {
								inp.SpinButton(tool.spindata);
							}
							
							if(tool.events) {
								$.each(tool.events, function(evt, func) {
									inp.bind(evt, func);
								});
							}
							break;
							
						default:
							break;
						}
					});
				}
				
				if(ext.buttons) {
					var fallback_obj = {},
						placement_obj = {},
						svgicons = ext.svgicons;
					var holders = {};
					
				
					// Add buttons given by extension
					$.each(ext.buttons, function(i, btn) {
						var icon;
						var id = btn.id;
						var num = i;
						
						// Give button a unique ID
						while($('#'+id).length) {
							id = btn.id + '_' + (++num);
						}
		
						if(!svgicons) {
							icon = $('<img src="' + btn.icon + '">');
						} else {
							fallback_obj[id] = btn.icon;
							placement_obj['#' + id] = btn.id;
						}
						
						var cls, parent;
						
						// Set button up according to its type
						switch ( btn.type ) {
						case 'mode':
							cls = 'tool_button';
							parent = "#tools_left";
							break;
						case 'context':
							cls = 'tool_button';
							parent = "#" + btn.panel;
							// create the panel if it doesn't exist
							if(!$(parent).length)
								$('<div>', {id: btn.panel}).appendTo("#tools_top");
							break;
						}
						
						var button = $('<div/>')
							.attr("id", id)
							.attr("title", btn.title)
							.addClass(cls);
						if(!btn.includeWith) {
							button.appendTo(parent);
						} else {
							// Add to flyout menu / make flyout menu
							var opts = btn.includeWith;
							// opts.button, default, position
							var ref_btn = $(opts.button);
							
							var flyout_holder = ref_btn.parent();
							// Create a flyout menu if there isn't one already
							if(!ref_btn.parent().hasClass('tools_flyout')) {
								// Create flyout placeholder
								var arr_div = $('<div>',{id:'flyout_arrow_horiz'})
								
								var tls_id = ref_btn[0].id.replace('tool_','tools_')
								var show_btn = ref_btn.clone()
									.attr('id',tls_id + '_show')
									.append($('<div>',{'class':'flyout_arrow_horiz'}));
									
								ref_btn.before(show_btn);
							
								// Create a flyout div
								flyout_holder = makeFlyoutHolder(tls_id, ref_btn);
							} 
							
							var ref_data = Actions.getButtonData(opts.button);
							
							if(opts.isDefault) {
								placement_obj['#' + tls_id + '_show'] = btn.id;
							} 
							// TODO: Find way to set the current icon using the iconloader if this is not default
							
							// Include data for extension button as well as ref button
							var cur_h = holders['#'+flyout_holder[0].id] = [{
								sel: '#'+id,
								fn: btn.events.click,
								icon: btn.id,
								key: btn.key,
								isDefault: btn.includeWith?btn.includeWith.isDefault:0
							}, ref_data];
							
							// {sel:'#tool_rect', fn: clickRect, evt: 'mouseup', key: 4, parent: '#tools_rect', icon: 'rect'}
								
							var pos  = ("position" in opts)?opts.position:'last';
							var len = flyout_holder.children().length;
							
							// Add at given position or end
							if(!isNaN(pos) && pos >= 0 && pos < len) {
								flyout_holder.children().eq(pos).before(button);
							} else {
								flyout_holder.append(button);
								cur_h.reverse();
							}
						}
						
						if(!svgicons) {
							button.append(icon);
						}
		
						// Add given events to button
						$.each(btn.events, function(name, func) {
							if(name == "click") {
								if(btn.type == 'mode') {
									if(btn.includeWith) {
										button.bind(name, func);
									} else {
										button.bind(name, function() {
											if(toolButtonClick(button)) {
												func();
											}
										});
									}
									if(btn.key) {
										$(document).bind('keydown', {combi: btn.key, disableInInput: true}, func);
										if(btn.title) button.attr("title", btn.title + ' ['+btn.key+']');
									}
								} else {
									button.bind(name, func);
								}
							} else {
								button.bind(name, func);
							}
						});
						
						setupFlyouts(holders);
					});
					
					$.svgIcons(svgicons, {
						w:24, h:24,
						id_match: false,
						no_img: true,
						fallback: fallback_obj,
						placement: placement_obj,
						callback: function(icons) {
							// Bad hack to make the icon match the current size
							// TODO: Write better hack!
							var old = curPrefs.iconsize;
							if(curPrefs.iconsize != 'm') {
								setIconSize('m');
								setIconSize(old);
							}
							runCallback();
						}
				
					});
				}
				
				runCallback();
			};
			
			var getPaint = function(color, opac) {
				// update the editor's fill paint
				var opts = null;
				if (color.substr(0,5) == "url(#") {
					var grad = document.getElementById(color.substr(5,color.length-6));
					opts = { alpha: opac };
					opts[grad.tagName] = grad;
				} 
				else if (color.substr(0,1) == "#") {
					opts = {
						alpha: opac,
						solidColor: color.substr(1)
					};
				}
				else {
					opts = {
						alpha: opac,
						solidColor: 'none'
					};
				}
				return new $.jGraduate.Paint(opts);
			};	
		
			// updates the toolbar (colors, opacity, etc) based on the selected element
			// This function also updates the opacity and id elements that are in the context panel
			var updateToolbar = function() {
				if (selectedElement != null && 
					selectedElement.tagName != "image" &&
					selectedElement.tagName != "text" &&
					selectedElement.tagName != "foreignObject" &&
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
					var fillColor = selectedElement.getAttribute("fill")||"black";
					// prevent undo on these canvas changes
					svgCanvas.setFillColor(fillColor, true);
					svgCanvas.setFillOpacity(fillOpacity, true);
		
					// update stroke color and opacity
					var strokeColor = selectedElement.getAttribute("stroke")||"none";
					// prevent undo on these canvas changes
					svgCanvas.setStrokeColor(strokeColor, true);
					svgCanvas.setStrokeOpacity(strokeOpacity, true);
		
					// update the rect inside #fill_color
					$("#stroke_color rect").attr({
						fill: strokeColor,
						opacity: strokeOpacity
					});

					// update the rect inside #fill_color
					$("#fill_color rect").attr({
						fill: fillColor,
						opacity: fillOpacity
					});
		
					fillOpacity *= 100;
					strokeOpacity *= 100;
					
					fillPaint = getPaint(fillColor, fillOpacity);
					strokePaint = getPaint(strokeColor, strokeOpacity);
					
					fillOpacity = fillOpacity + " %";
					strokeOpacity = strokeOpacity + " %";
		
					// update fill color
					if (fillColor == "none") {
						fillOpacity = "N/A";
					}
					if (strokeColor == null || strokeColor == "" || strokeColor == "none") {
						strokeColor = "none";
						strokeOpacity = "N/A";
					}
					
					$('#stroke_width').val(selectedElement.getAttribute("stroke-width")||1);
					$('#stroke_style').val(selectedElement.getAttribute("stroke-dasharray")||"none");
				}
				
				// All elements including image and group have opacity
				if(selectedElement != null) {
					var opac_perc = ((selectedElement.getAttribute("opacity")||1.0)*100);
					$('#group_opacity').val(opac_perc);
					$('#opac_slider').slider('option', 'value', opac_perc);
					$('#elem_id').val(selectedElement.id);
				}
				
				updateToolButtonState();
			};
		
			// updates the context panel tools based on the selected element
			var updateContextPanel = function() {
				var elem = selectedElement;
				// If element has just been deleted, consider it null
				if(elem != null && !elem.parentNode) elem = null;
				var currentLayer = svgCanvas.getCurrentLayer();
				var currentMode = svgCanvas.getMode();
				// No need to update anything else in rotate mode
				if (currentMode == 'rotate' && elem != null) {
					var ang = svgCanvas.getRotationAngle(elem);
					$('#angle').val(ang);
					$('#tool_reorient').toggleClass('disabled', ang == 0);
					return;
				}
				var is_node = currentMode == 'pathedit'; //elem ? (elem.id && elem.id.indexOf('pathpointgrip') == 0) : false;
				$('#selected_panel, #multiselected_panel, #g_panel, #rect_panel, #circle_panel,\
					#ellipse_panel, #line_panel, #text_panel, #image_panel').hide();
				if (elem != null) {
					var elname = elem.nodeName;
					var angle = svgCanvas.getRotationAngle(elem);
					$('#angle').val(angle);
					
					if(svgCanvas.addedNew) {
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
						var no_path = $.inArray(elname, ['image', 'text', 'path', 'g', 'use']) == -1;
						$('#tool_topath').toggle(no_path);
						$('#tool_reorient').toggle(elname == 'path');
						$('#tool_reorient').toggleClass('disabled', angle == 0);
					} else {
						var point = path.getNodePoint();
						$('#tool_add_subpath').removeClass('push_button_pressed').addClass('tool_button');
						$('#tool_node_delete').toggleClass('disabled', !path.canDeleteNodes);
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
								$('#tool_italic').addClass('push_button_pressed').removeClass('tool_button');
							}
							else {
								$('#tool_italic').removeClass('push_button_pressed').addClass('tool_button');
							}
							if (svgCanvas.getBold()) {
								$('#tool_bold').addClass('push_button_pressed').removeClass('tool_button');
							}
							else {
								$('#tool_bold').removeClass('push_button_pressed').addClass('tool_button');
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
					$('#tool_undo').removeClass( 'disabled');
				}
				else {
					$('#tool_undo').addClass( 'disabled');
				}
				if (svgCanvas.getRedoStackSize() > 0) {
					$('#tool_redo').removeClass( 'disabled');
				}
				else {
					$('#tool_redo').addClass( 'disabled');
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
			svgCanvas.bind("extension_added", extAdded);
		
			var str = '<div class="palette_item" data-rgb="none"></div>'
			$.each(palette, function(i,item){
				str += '<div class="palette_item" style="background-color: ' + item + ';" data-rgb="' + item + '"></div>';
			});
			$('#palette').append(str);
			
			// Set up editor background functionality
			// TODO add checkerboard as "pattern"
			var color_blocks = ['#FFF','#888','#000']; // ,'url(data:image/gif;base64,R0lGODlhEAAQAIAAAP%2F%2F%2F9bW1iH5BAAAAAAALAAAAAAQABAAAAIfjG%2Bgq4jM3IFLJgpswNly%2FXkcBpIiVaInlLJr9FZWAQA7)'];
			var str = '';
			$.each(color_blocks, function() {
				str += '<div class="color_block" style="background-color:' + this + ';"></div>';
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
		
			if($.pref('bkgd_color')) {
				setBackground($.pref('bkgd_color'), $.pref('bkgd_url'));
			} else if($.pref('bkgd_url')) {
				// No color set, only URL
				setBackground(defaultPrefs.bkgd_color, $.pref('bkgd_url'));
			}
			
			if($.pref('img_save')) {
				curPrefs.img_save = $.pref('img_save');
				$('#image_save_opts input').val([curPrefs.img_save]);
			}
		
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
				$('#tool_reorient').toggleClass('disabled', ctl.value == 0);
			}
			var changeZoom = function(ctl) {
				var zoomlevel = ctl.value / 100;
				var zoom = svgCanvas.getZoom();
				var w_area = workarea;
				
				zoomChanged(window, {
					width: 0,
					height: 0,
					// center pt of scroll position
					x: (w_area[0].scrollLeft + w_area.width()/2)/zoom, 
					y: (w_area[0].scrollTop + w_area.height()/2)/zoom,
					zoom: zoomlevel
				}, true);
			}
			
			var changeOpacity = function(ctl, val) {
				if(val == null) val = ctl.value;
				$('#group_opacity').val(val);
				if(!ctl || !ctl.handle) {
					$('#opac_slider').slider('option', 'value', val);
				}
				svgCanvas.setOpacity(val/100);
			}
		
			var operaRepaint = function() {
				// Repaints canvas in Opera. Needed for stroke-dasharray change as well as fill change
				if(!window.opera) return;
				$('<p/>').hide().appendTo('body').remove();
			}
		
			$('#stroke_style').change(function(){
				svgCanvas.setStrokeStyle(this.options[this.selectedIndex].value);
				operaRepaint();
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
				var valid = svgCanvas.isValidUnit(attr, val);
				
				if(!valid) {
					$.alert(uiStrings.invalidAttrValGiven);
					this.value = selectedElement.getAttribute(attr);
					return false;
				}
				// if the user is changing the id, then de-select the element first
				// change the ID, then re-select it with the new ID
				if (attr == "id") {
					var elem = selectedElement;
					svgCanvas.clearSelection();
					elem.id = val;
					svgCanvas.addToSelection([elem],true);
				}
				else {
					svgCanvas.changeSelectedAttribute(attr, val);
				}
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
				rectbox.setAttribute("opacity", 1);
				
				if (evt.shiftKey) {
					strokePaint = paint;
					if (svgCanvas.getStrokeColor() != color) {
						svgCanvas.setStrokeColor(color);
					}
					if (color != 'none' && svgCanvas.getStrokeOpacity() != 1) {
						svgCanvas.setStrokeOpacity(1.0);
					}
				} else {
					fillPaint = paint;
					if (svgCanvas.getFillColor() != color) {
						svgCanvas.setFillColor(color);
					}
					if (color != 'none' && svgCanvas.getFillOpacity() != 1) {
						svgCanvas.setFillOpacity(1.0);
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
				if ($(button).hasClass('disabled')) return false;
				if($(button).parent().hasClass('tools_flyout')) return true;
				var fadeFlyouts = fadeFlyouts || 'normal';
				$('.tools_flyout').fadeOut(fadeFlyouts);
				$('#styleoverrides').text('');
				$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
				$(button).addClass('tool_button_current').removeClass('tool_button');
				// when a tool is selected, we should deselect any currently selected elements
				svgCanvas.clearSelection();
				return true;
			};
			
			(function() {
				var button = $('#main_icon');
				var overlay = $('#main_icon span');
				var list = $('#main_menu');
				var on_button = false;
				var height = 0;
				var js_hover = true;
				var set_click = false;
				
				var hideMenu = function() {
					list.fadeOut(200);
				};
				
				$(window).mouseup(function(evt) {
					if(!on_button) {
						button.removeClass('buttondown');
						// do not hide if it was the file input as that input needs to be visible 
						// for its change event to fire
						if (evt.target.localName != "input") {
							list.fadeOut(200);
						} else if(!set_click) {
							set_click = true;
							$(evt.target).click(function() {
								list.css('margin-left','-9999px').show();
							});
						}
					}
					on_button = false;
				}).mousedown(function() {
					$('.tools_flyout:visible').fadeOut();
				});
				
				overlay.bind('mousedown',function() {
					if (!button.hasClass('buttondown')) {
						button.addClass('buttondown').removeClass('buttonup')
						// Margin must be reset in case it was changed before;
						list.css('margin-left',0).show();
						if(!height) {
							height = list.height();
						}
						// Using custom animation as slideDown has annoying "bounce effect"
						list.css('height',0).animate({
							'height': height
						},200);
						on_button = true;
						return false;
					} else {
						button.removeClass('buttondown').addClass('buttonup');
						list.fadeOut(200);
					}
				}).hover(function() {
					on_button = true;
				}).mouseout(function() {
					on_button = false;
				});
				
				var list_items = $('#main_menu li');
				
				// Check if JS method of hovering needs to be used (Webkit bug)
				list_items.mouseover(function() {
					js_hover = ($(this).css('background-color') == 'rgba(0, 0, 0, 0)');
					
					list_items.unbind('mouseover');
					if(js_hover) {
						list_items.mouseover(function() {
							this.style.backgroundColor = '#FFC';
						}).mouseout(function() {
							this.style.backgroundColor = 'transparent';
							return true;
						});
					}
				});
			}());
			
			var addDropDown = function(elem, callback, dropUp) {
				var button = $(elem).find('button');
				var list = $(elem).find('ul');
				var on_button = false;
				if(dropUp) {
					$(elem).addClass('dropup');
				}
			
				$(elem).find('li').bind('mouseup', callback);
				
				$(window).mouseup(function(evt) {
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
			}, true);
			
			// For slider usage, see: http://jqueryui.com/demos/slider/ 
			$("#opac_slider").slider({
				start: function() {
					$('#opacity_dropdown li:not(.special)').hide();
				},
				stop: function() {
					$('#opacity_dropdown li').show();
					$(window).mouseup();
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
			
			/*
			
			When a flyout icon is selected
				(if flyout) {
				- Change the icon
				- Make pressing the button run its stuff
				}
				- Run its stuff
			
			When its shortcut key is pressed
				- If not current in list, do as above
				, else:
				- Just run its stuff
			
			*/
			
		// 	var setIcon = function(holder_sel, id) {
		// 		var icon = $.getSvgIcon(id).clone();
		// 		var holder = $(holder_sel);
		// 		icon[0].setAttribute('width',holder.width());
		// 		icon[0].setAttribute('height',holder.height());
		// 		holder.empty().append(icon)
		// 			.attr('data-curopt', holder_sel.replace('_show','')); // This sets the current mode
		// 	}
			
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
				svgCanvas.setMode('square');
			};
			
			var clickRect = function(){
				svgCanvas.setMode('rect');
			};
			
			var clickFHRect = function(){
				svgCanvas.setMode('fhrect');
			};
			
			var clickCircle = function(){
				svgCanvas.setMode('circle');
			};
		
			var clickEllipse = function(){
				svgCanvas.setMode('ellipse');
			};
		
			var clickFHEllipse = function(){
				svgCanvas.setMode('fhellipse');
			};
			
			var clickImage = function(){
				if (toolButtonClick('#tool_image')) {
					svgCanvas.setMode('image');
				}
			};
		
			var clickZoom = function(){
				if (toolButtonClick('#tool_zoom')) {
					workarea.css('cursor','crosshair');
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
					path.reorient();
				}
			}
		
			var moveSelected = function(dx,dy) {
				if (selectedElement != null || multiselected) {
					svgCanvas.moveSelectedElements(dx,dy);
				}
			};
		
			var linkControlPoints = function() {
				var linked = !$('#tool_node_link').hasClass('push_button_pressed');
				if (linked)
					$('#tool_node_link').addClass('push_button_pressed').removeClass('tool_button');
				else
					$('#tool_node_link').removeClass('push_button_pressed').addClass('tool_button');
					
				path.linkControlPoints(linked);
			}
		
			var clonePathNode = function() {
				if (path.getNodePoint()) {
					path.clonePathNode();
				}
			};
			
			var deletePathNode = function() {
				if (path.getNodePoint()) {
					path.deletePathNode();
				}
			};
		
			var addSubPath = function() {
				var button = $('#tool_add_subpath');
				var sp = !button.hasClass('push_button_pressed');
				if (sp) {
					button.addClass('push_button_pressed').removeClass('tool_button');
				} else {
					button.removeClass('push_button_pressed').addClass('tool_button');
				}
				
				path.addSubPath(sp);
				
			};
		
			
			var selectNext = function() {
				svgCanvas.cycleElement(1);
			};
			
			var selectPrev = function() {
				svgCanvas.cycleElement(0);
			};
			
			var rotateSelected = function(cw) {
				if (selectedElement == null || multiselected) return;
				var step = 5;
				if(!cw) step *= -1;
				var new_angle = $('#angle').val()*1 + step;
				svgCanvas.setRotationAngle(new_angle);
				updateContextPanel();
			};
			
			var clickClear = function(){
				var dims = curConfig.dimensions;
				$.confirm(uiStrings.QwantToClear, function(ok) {
					if(!ok) return;
					setSelectMode();
					svgCanvas.clear();
					svgCanvas.setResolution(dims[0], dims[1]);
					updateCanvas(true);
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
			
			// by default, svgCanvas.open() is a no-op.
			// it is up to an extension mechanism (opera widget, etc) 
			// to call setCustomHandlers() which will make it do something
			var clickOpen = function(){
				svgCanvas.open();
			};
			var clickImport = function(){
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
		// 		setResolution(res.w * multiplier, res.h * multiplier, true);
				$('#zoom').val(multiplier * 100);
				svgCanvas.setZoom(multiplier);
				zoomDone();
				updateCanvas(true);
			};
			
			var zoomDone = function() {
		// 		updateBgImage();
				updateWireFrame();
				//updateCanvas(); // necessary?
			}
		
			var clickWireframe = function() {
				var wf = !$('#tool_wireframe').hasClass('push_button_pressed');
				if (wf) 
					$('#tool_wireframe').addClass('push_button_pressed').removeClass('tool_button');
				else
					$('#tool_wireframe').removeClass('push_button_pressed').addClass('tool_button');
				workarea.toggleClass('wireframe');
				
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
				$('#wireframe_rules').text(workarea.hasClass('wireframe') ? rule : "");
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
				var res = svgCanvas.getResolution();
				$('#canvas_width').val(res.w);
				$('#canvas_height').val(res.h);
				$('#canvas_title').val(svgCanvas.getImageTitle());
				
				// Update background color with current one
				var blocks = $('#bg_blocks div');
				var cur_bg = 'cur_background';
				var canvas_bg = $.pref('bkgd_color');
				var url = $.pref('bkgd_url');
		// 		if(url) url = url[1];
				blocks.each(function() {
					var blk = $(this);
					var is_bg = blk.css('background-color') == canvas_bg;
					blk.toggleClass(cur_bg, is_bg);
					if(is_bg) $('#canvas_bg_url').removeClass(cur_bg);
				});
				if(!canvas_bg) blocks.eq(0).addClass(cur_bg);
				if(url) {
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
				setSelectMode();		
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
				var width = $('#canvas_width'), w = width.val();
				var height = $('#canvas_height'), h = height.val();
		
				if(w != "fit" && !svgCanvas.isValidUnit('width', w)) {
					$.alert(uiStrings.invalidAttrValGiven);
					width.parent().addClass('error');
					return false;
				}
				
				width.parent().removeClass('error');
				
				if(h != "fit" && !svgCanvas.isValidUnit('height', h)) {
					$.alert(uiStrings.invalidAttrValGiven);
					height.parent().addClass('error');
					return false;
				} 
				
				height.parent().removeClass('error');
				
				if(!svgCanvas.setResolution(w, h)) {
					$.alert(uiStrings.noContentToFitTo);
					return false;
				}
				
				// set image save option
				curPrefs.img_save = $('#image_save_opts :checked').val();
				$.pref('img_save',curPrefs.img_save);
				
				// set background
				var color = $('#bg_blocks div.cur_background').css('background-color') || '#FFF';
				setBackground(color, $('#canvas_bg_url').val());
				
				// set language
				var lang = $('#lang_select').val();
				if(lang != curPrefs.lang) {
					Editor.putLocale(lang);
				}
				
				// set icon size
				setIconSize($('#iconsize').val());
				
				updateCanvas();
				hideDocProperties();
			};
			
			function setBackground(color, url) {
				if(color == curPrefs.bkgd_color && url == curPrefs.bkgd_url) return;
				$.pref('bkgd_color', color);
				$.pref('bkgd_url', url);
				
				// This should be done in svgcanvas.js for the borderRect fill
				svgCanvas.setBackground(color, url);
			}
		
			var setIconSize = Editor.setIconSize = function(size) {
				if(size == curPrefs.size) return;
				$.pref('iconsize', size);
				$('#iconsize').val(size);
				var icon_sizes = { s:16, m:24, l:32, xl:48 };
				var size_num = icon_sizes[size];
				
				// Change icon size
				$('.tool_button, .push_button, .tool_button_current, .disabled, #url_notice, #tool_open')
				.find('> svg, > img').each(function() {
					this.setAttribute('width',size_num);
					this.setAttribute('height',size_num);
				});
				
				$.resizeSvgIcons({
					'.flyout_arrow_horiz svg, .flyout_arrow_horiz img': size_num / 5,
					'#logo > svg, #logo > img': size_num * 1.3
				});
				if(size != 's') {
					$.resizeSvgIcons({'#layerbuttons svg, #layerbuttons img': size_num * .6});
				}
				
				// Note that all rules will be prefixed with '#svg_editor' when parsed
				var cssResizeRules = {
					".tool_button,\
					.push_button,\
					.tool_button_current,\
					.disabled,\
					.tools_flyout .tool_button": {
						'width': {s: '16px', l: '32px', xl: '48px'},
						'height': {s: '16px', l: '32px', xl: '48px'},
						'padding': {s: '1px', l: '2px', xl: '3px'}
					},
					".tool_sep": {
						'height': {s: '16px', l: '32px', xl: '48px'},
						'margin': {s: '2px 2px', l: '2px 5px', xl: '2px 8px'}
					},
					"#main_icon": {
						'width': {s: '31px', l: '53px', xl: '75px'},
						'height': {s: '22px', l: '42px', xl: '64px'}
					},
					"#tools_top": {
						'left': {s: '36px', l: '60px', xl: '80px'},
						'height': {s: '50px', l: '88px', xl: '125px'}
					},
					"#tools_left": {
						'width': {s: '22px', l: '30px', xl: '38px'},
						'top': {s: '50px', l: '87px', xl: '125px'}
					},
					"div#workarea": {
						'left': {s: '27px', l: '46px', xl: '65px'},
						'top': {s: '50px', l: '88px', xl: '125px'},
						'bottom': {s: '55px', l: '70px', xl: '77px'}
					},
					"#tools_bottom": {
						'left': {s: '27px', l: '46px', xl: '65px'},
						'height': {s: '58px', l: '70px', xl: '77px'}
					},
					"#color_tools": {
						'border-spacing': {s: '0 1px'}
					},
					".color_tool": {
						'height': {s: '20px'}
					},
					"#tool_opacity": {
						'top': {s: '1px'}
					},
					"#tools_top input, #tools_bottom input": {
						'margin-top': {s: '2px', l: '4px', xl: '5px'},
						'height': {s: 'auto', l: 'auto', xl: 'auto'},
						'border': {s: '1px solid #555', l: 'auto', xl: 'auto'},
						'font-size': {s: '.9em', l: '1.2em', xl: '1.4em'}
					},
					"#zoom_panel": {
						'margin-top': {s: '3px', l: '4px', xl: '5px'}
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
					".dropdown button": {
						'height': {s: '18px', l: '34px', xl: '40px'},
						'line-height': {s: '18px', l: '34px', xl: '40px'},
						'margin-top': {s: '3px'}
					},
					"#tools_top label, #tools_bottom label": {
						'font-size': {s: '1em', l: '1.5em', xl: '2em'},
						'height': {s: '25px', l: '42px', xl: '64px'}
					}, 
					"div.toolset": {
						'height': {s: '25px', l: '42px', xl: '64px'}
					},
					"#tool_bold, #tool_italic": {
						'font-size': {s: '1.5em', l: '3em', xl: '4.5em'}
					},
					"#sidepanels": {
						'top': {s: '50px', l: '88px', xl: '125px'},
						'bottom': {s: '51px', l: '68px', xl: '65px'}
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
				
				setFlyoutPositions();
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
					if (!$(this).hasClass('disabled')) $(this).addClass(cur_class);
				}).bind('mousedown mouseout',function(){
					$(this).removeClass(cur_class);}
				);
			}());
		
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
// 				var opacity = (picker == 'stroke' ? $('#stroke_opacity') : $('#fill_opacity'));
				var paint = (picker == 'stroke' ? strokePaint : fillPaint);
				var title = (picker == 'stroke' ? 'Pick a Stroke Paint and Opacity' : 'Pick a Fill Paint and Opacity');
				var was_none = false;
				var pos = elem.position();
				$("#color_picker")
					.draggable({cancel:'.jPicker_table,.jGraduate_lgPick,.jGraduate_rgPick'})
					.css({'left': pos.left, 'bottom': 50 - pos.top})
					.jGraduate(
					{ 
						paint: paint,
						window: { pickerTitle: title },
						images: { clientPath: "jgraduate/images/" }
					},
					function(p) {
						paint = new $.jGraduate.Paint(p);
						
						var oldgrad = document.getElementById("gradbox_"+picker);
						var svgbox = oldgrad.parentNode;
						var rectbox = svgbox.firstChild;
						if (paint.type == "linearGradient" || paint.type == "radialGradient") {
							svgbox.removeChild(oldgrad);
							var newgrad = svgbox.appendChild(document.importNode(paint[paint.type], true));
							svgCanvas.fixOperaXML(newgrad, paint[paint.type])
							newgrad.id = "gradbox_"+picker;
							rectbox.setAttribute("fill", "url(#gradbox_" + picker + ")");
							rectbox.setAttribute("opacity", paint.alpha/100);
						}
						else {
							rectbox.setAttribute("fill", paint.solidColor != "none" ? "#" + paint.solidColor : "none");
							rectbox.setAttribute("opacity", paint.alpha/100);
						}
		
						if (picker == 'stroke') {
							svgCanvas.setStrokePaint(paint, true);
							strokePaint = paint;
						}
						else {
							svgCanvas.setFillPaint(paint, true);
							fillPaint = paint;
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
				var buttonsNeedingStroke = [ '#tool_fhpath', '#tool_line' ];
				var buttonsNeedingFillAndStroke = [ '#tools_rect .tool_button', '#tools_ellipse .tool_button', '#tool_text', '#tool_path'];
				if (bNoStroke) {
					for (index in buttonsNeedingStroke) {
						var button = buttonsNeedingStroke[index];
						if ($(button).hasClass('tool_button_current')) {
							clickSelect();
						}
						$(button).addClass('disabled');
					}
				}
				else {
					for (index in buttonsNeedingStroke) {
						var button = buttonsNeedingStroke[index];
						$(button).removeClass('disabled');
					}
				}
		
				if (bNoStroke && bNoFill) {
					for (index in buttonsNeedingFillAndStroke) {
						var button = buttonsNeedingFillAndStroke[index];
						if ($(button).hasClass('tool_button_current')) {
							clickSelect();
						}
						$(button).addClass('disabled');
					}
				}
				else {
					for (index in buttonsNeedingFillAndStroke) {
						var button = buttonsNeedingFillAndStroke[index];
						$(button).removeClass('disabled');
					}
				}
				
				svgCanvas.runExtensions("toolButtonStateUpdate", {
					nofill: bNoFill,
					nostroke: bNoStroke
				});
				
				// Disable flyouts if all inside are disabled
				$('.tools_flyout').each(function() {
					var shower = $('#' + this.id + '_show');
					var has_enabled = false;
					$(this).children().each(function() {
						if(!$(this).hasClass('disabled')) {
							has_enabled = true;
						}
					});
					shower.toggleClass('disabled', !has_enabled);
				});
		
				
				operaRepaint();
			};
		
			// set up gradients to be used for the buttons
			var svgdocbox = new DOMParser().parseFromString(
				'<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%"\
				fill="#' + curConfig.initFill.color + '" opacity="' + curConfig.initFill.opacity + '"/>\
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
			$('#stroke_color').append( document.importNode(svgdocbox.documentElement,true) );
			$('#stroke_color rect').attr({
				'fill': '#' + curConfig.initStroke.color,
				'opacity': curConfig.initStroke.opacity
			});
			
			$('#stroke_width').val(curConfig.initStroke.width);
			$('#group_opacity').val(curConfig.initOpacity * 100);
			
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
		
			$('#tool_move_top').mousedown(function(evt){
				$('#tools_stacking').show();
				evt.preventDefault();
			});
			
			$('.layer_button').mousedown(function() { 
				$(this).addClass('layer_buttonpressed');
			}).mouseout(function() {
				$(this).removeClass('layer_buttonpressed');
			}).mouseup(function() {
				$(this).removeClass('layer_buttonpressed');
			});
		
			$('.push_button').mousedown(function() { 
				if (!$(this).hasClass('disabled')) {
					$(this).addClass('push_button_pressed').removeClass('push_button');
				}
			}).mouseout(function() {
				$(this).removeClass('push_button_pressed').addClass('push_button');
			}).mouseup(function() {
				$(this).removeClass('push_button_pressed').addClass('push_button');
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
		
					var layerpanel = $('#layerpanel');
					workarea.css('right', parseInt(workarea.css('right'))+deltax);
					sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
					layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
			});
			
			// if width is non-zero, then fully close it, otherwise fully open it
			// the optional close argument forces the side panel closed
			var toggleSidePanel = function(close){
				var w = parseInt($('#sidepanels').css('width'));
				var deltax = (w > 2 || close ? 2 : SIDEPANEL_OPENWIDTH) - w;
				var sidepanels = $('#sidepanels');
				var layerpanel = $('#layerpanel');
				workarea.css('right', parseInt(workarea.css('right'))+deltax);
				sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
				layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
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
		
		// 	function changeResolution(x,y) {
		// 		var zoom = svgCanvas.getResolution().zoom;
		// 		setResolution(x * zoom, y * zoom);
		// 	}
			
			var centerCanvas = function() {
				// this centers the canvas vertically in the workarea (horizontal handled in CSS)
				workarea.css('line-height', workarea.height() + 'px');
			};
			
			$(window).bind('load resize', centerCanvas);
		
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
			
		// 	function setResolution(w, h, center) {
		// 		updateCanvas();
		// // 		w-=0; h-=0;
		// // 		$('#svgcanvas').css( { 'width': w, 'height': h } );
		// // 		$('#canvas_width').val(w);
		// // 		$('#canvas_height').val(h);
		// // 
		// // 		if(center) {
		// // 			var w_area = workarea;
		// // 			var scroll_y = h/2 - w_area.height()/2;
		// // 			var scroll_x = w/2 - w_area.width()/2;
		// // 			w_area[0].scrollTop = scroll_y;
		// // 			w_area[0].scrollLeft = scroll_x;
		// // 		}
		// 	}
		
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
					{sel:'#tool_rect', fn: clickRect, evt: 'mouseup', key: 4, parent: '#tools_rect', icon: 'rect'},
					{sel:'#tool_square', fn: clickSquare, evt: 'mouseup', key: 'Shift+4', parent: '#tools_rect', icon: 'square'},
					{sel:'#tool_fhrect', fn: clickFHRect, evt: 'mouseup', parent: '#tools_rect', icon: 'fh_rect'},
					{sel:'#tool_ellipse', fn: clickEllipse, evt: 'mouseup', key: 5, parent: '#tools_ellipse', icon: 'ellipse'},
					{sel:'#tool_circle', fn: clickCircle, evt: 'mouseup', key: 'Shift+5', parent: '#tools_ellipse', icon: 'circle'},
					{sel:'#tool_fhellipse', fn: clickFHEllipse, evt: 'mouseup', parent: '#tools_ellipse', icon: 'fh_ellipse'},
					{sel:'#tool_path', fn: clickPath, evt: 'click', key: 6},
					{sel:'#tool_text', fn: clickText, evt: 'click', key: 7},
					{sel:'#tool_image', fn: clickImage, evt: 'mouseup', key: 8},
					{sel:'#tool_zoom', fn: clickZoom, evt: 'mouseup', key: 9},
					{sel:'#tool_clear', fn: clickClear, evt: 'mouseup', key: [modKey+'N', true]},
					{sel:'#tool_save', fn: function() { editingsource?saveSourceEditor():clickSave()}, evt: 'mouseup', key: [modKey+'S', true]},
					{sel:'#tool_open', fn: clickOpen, evt: 'mouseup', key: [modKey+'O', true]},
					{sel:'#tool_import', fn: clickImport, evt: 'mouseup'},
					{sel:'#tool_source', fn: showSourceEditor, evt: 'click', key: ['U', true]},
					{sel:'#tool_wireframe', fn: clickWireframe, evt: 'click', key: ['F', true]},
					{sel:'#tool_source_cancel,#svg_source_overlay,#tool_docprops_cancel', fn: cancelOverlays, evt: 'click', key: ['esc', false, false], hidekey: true},
					{sel:'#tool_source_save', fn: saveSourceEditor, evt: 'click'},
					{sel:'#tool_docprops_save', fn: saveDocProperties, evt: 'click'},
					{sel:'#tool_docprops', fn: showDocProperties, evt: 'mouseup', key: [modKey+'P', true]},
					{sel:'#tool_delete,#tool_delete_multi', fn: deleteSelected, evt: 'click', key: ['del/backspace', true]},
					{sel:'#tool_reorient', fn: reorientPath, evt: 'click'},
					{sel:'#tool_node_link', fn: linkControlPoints, evt: 'click'},
					{sel:'#tool_node_clone', fn: clonePathNode, evt: 'click'},
					{sel:'#tool_node_delete', fn: deletePathNode, evt: 'click'},
					{sel:'#tool_add_subpath', fn: addSubPath, evt: 'click'},
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
		// 			{sel:'#tools_rect_show', fn: clickRect, evt: 'click'},
		// 			{sel:'#tools_ellipse_show', fn: clickEllipse, evt: 'click'},
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
					{key: ['right', true], fn: function(){moveSelected(1,0);}},
					{key: 'A', fn: function(){svgCanvas.selectAllInCurrentLayer();}}
				];
				
				// Tooltips not directly associated with a single function
				var key_assocs = {
					'4/Shift+4': '#tools_rect_show',
					'5/Shift+5': '#tools_ellipse_show'
				};
			
				return {
					setAll: function() {
						var flyouts = {};
						
						$.each(tool_buttons, function(i, opts)  {
							// Bind function to button
							if(opts.sel) {
								var btn = $(opts.sel);
								if(opts.evt) {
									btn[opts.evt](opts.fn);
								}
		
								// Add to parent flyout menu
								if(opts.parent) {
									var f_h = $(opts.parent);
									if(!f_h.length) {
										f_h = makeFlyoutHolder(opts.parent.substr(1));
									}
									
									f_h.append(btn);
									
									if(!$.isArray(flyouts[opts.parent])) {
										flyouts[opts.parent] = [];
									}
									flyouts[opts.parent].push(opts);
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
										if(pd) {
											e.preventDefault();
										}
										// Prevent default on ALL keys?
										return false;
									});
								});
								
								// Put shortcut in title
								if(opts.sel && !opts.hidekey) {
									var new_title = btn.attr('title').split('[')[0] + '[' + keyval + ']';
									key_assocs[keyval] = opts.sel;
									// Disregard for menu items
									if(!btn.parents('#main_menu').length) {
										btn.attr('title', new_title);
									}
								}
							}
						});
						
						// Setup flyouts
						setupFlyouts(flyouts);
						
						
						// Misc additional actions
						
						// Make "return" keypress trigger the change event
						$('.attr_changer, #image_url').bind('keydown', {combi:'return'}, 
							function(evt) {$(this).change();evt.preventDefault();}
						);
						
						$('#tool_zoom').dblclick(dblclickZoom);
					},
					setTitles: function() {
						$.each(key_assocs, function(keyval, sel)  {
							var menu = ($(sel).parents('#main_menu').length);
						
							$(sel).each(function() {
								if(menu) {
									var t = $(this).text().split(' [')[0];
								} else {
									var t = this.title.split(' [')[0];							
								}
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
								if(menu) {
									this.lastChild.textContent = t +' ['+key_str+']';
								} else {
									this.title = t +' ['+key_str+']';
								}
							});
						});
					},
					getButtonData: function(sel) {
						var b;
						$.each(tool_buttons, function(i, btn) {
							if(btn.sel === sel) b = btn;
						});
						return b;
					}
				};
			}();
			
			Actions.setAll();
			
			// Select given tool
			Editor.ready(function() {
				var itool = curConfig.initTool,
					container = $("#tools_left, #svg_editor .tools_flyout"),
					pre_tool = container.find("#tool_" + itool),
					reg_tool = container.find("#" + itool);
				if(pre_tool.length) {
					tool = pre_tool;
				} else if(reg_tool.length){
					tool = reg_tool;
				} else {
					tool = $("#tool_select");
				}
				tool.click().mouseup();
				
				if(curConfig.wireframe) {
					$('#tool_wireframe').click();
				}
				
				if(curConfig.showlayers) {
					toggleSidePanel();
				}
			});
			
			$('#rect_rx').SpinButton({ min: 0, max: 1000, step: 1, callback: changeRectRadius });
			$('#stroke_width').SpinButton({ min: 0, max: 99, step: 1, smallStep: 0.1, callback: changeStrokeWidth });
			$('#angle').SpinButton({ min: -180, max: 180, step: 5, callback: changeRotationAngle });
			$('#font_size').SpinButton({ step: 1, min: 0.001, stepfunc: stepFontSize, callback: changeFontSize });
			$('#group_opacity').SpinButton({ step: 5, min: 0, max: 100, callback: changeOpacity });
			$('#zoom').SpinButton({ min: 0.001, max: 10000, step: 50, stepfunc: stepZoom, callback: changeZoom });
			
			// use HTML5 File API: http://www.w3.org/TR/FileAPI/
			// if browser has HTML5 File API support, then we will show the open menu item
			// and provide a file input to click.  When that change event fires, it will
			// get the text contents of the file and send it to the canvas
			if (window.FileReader) {
				var inp = $('<input type="file">').change(function() {
					$('#main_menu').hide();
					if(this.files.length==1) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							svgCanvas.setSvgString(e.target.result);
							updateCanvas();
						};
						reader.readAsText(this.files[0]);
					}
				});
				$("#tool_open").show().prepend(inp);
				var inp2 = $('<input type="file">').change(function() {
					$('#main_menu').hide();
					if(this.files.length==1) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							svgCanvas.importSvgString(e.target.result);
							updateCanvas();
						};
						reader.readAsText(this.files[0]);
					}
				});
				$("#tool_import").show().prepend(inp2);
			}
			
			
			var updateCanvas = function(center, new_ctr) {
				var w = workarea.width(), h = workarea.height();
				var w_orig = w, h_orig = h;
				var zoom = svgCanvas.getZoom();
				var res = svgCanvas.getResolution();
				var w_area = workarea;
				var cnvs = $("#svgcanvas");
				
				var old_ctr = {
					x: w_area[0].scrollLeft + w_orig/2,
					y: w_area[0].scrollTop + h_orig/2
				};
				
				var multi = curConfig.canvas_expansion;
				w = Math.max(w_orig, res.w * multi * zoom);
				h = Math.max(h_orig, res.h * multi * zoom);
				
				if(w == w_orig && h == h_orig) {
					workarea.css('overflow','hidden');
				} else {
					workarea.css('overflow','scroll');
				}
				
				var old_can_y = cnvs.height()/2;
				var old_can_x = cnvs.width()/2;
				cnvs.width(w).height(h);
				var new_can_y = h/2;
				var new_can_x = w/2;
				var offset = svgCanvas.updateCanvas(w, h);
				
				var ratio = new_can_x / old_can_x;
		
				var scroll_x = w/2 - w_orig/2;
				var scroll_y = h/2 - h_orig/2;
				
				if(!new_ctr) {
		
					var old_dist_x = old_ctr.x - old_can_x;
					var new_x = new_can_x + old_dist_x * ratio;
		
					var old_dist_y = old_ctr.y - old_can_y;
					var new_y = new_can_y + old_dist_y * ratio;
		
					new_ctr = {
						x: new_x, // + res.w/2,
						y: new_y //+ res.h/2,
					};
					
				} else {
					new_ctr.x += offset.x,
					new_ctr.y += offset.y;
				}
				
				if(center) {
					w_area[0].scrollLeft = scroll_x;
					w_area[0].scrollTop = scroll_y;
				} else {
					w_area[0].scrollLeft = new_ctr.x - w_orig/2;
					w_area[0].scrollTop = new_ctr.y - h_orig/2;
				}
			}
		
// 			$(function() {
				updateCanvas(true);
// 			});
			
		//	var revnums = "svg-editor.js ($Rev$) ";
		//	revnums += svgCanvas.getVersion();
		//	$('#copyright')[0].setAttribute("title", revnums);
		
			var good_langs = [];

			$('#lang_select option').each(function() {
				good_langs.push(this.value);
			});
			
// 			var lang = ('lang' in curPrefs) ? curPrefs.lang : null;
			Editor.putLocale(null, good_langs);
			
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
			
		
		
			// For Compatibility with older extensions
			$(function() {
				window.svgCanvas = svgCanvas;
				svgCanvas.ready = svgEditor.ready;
			});
		
		
			Editor.setLang = function(lang, strings) {
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
					
					svgCanvas.runExtensions("langChanged", lang);
					
					// Update flyout tooltips
					setFlyoutTitles();
				}
			};
		};
		
		var callbacks = [];
		
		Editor.ready = function(cb) {
			if(!is_ready) {
				callbacks.push(cb);
			} else {
				cb();
			}
		};

		Editor.runCallbacks = function() {
			$.each(callbacks, function() {
				this();
			});
			is_ready = true;
		};
		
		Editor.loadFromString = function(str) {
			Editor.ready(function() {
				svgCanvas.setSvgString(str);
			});
		};
		
		Editor.loadFromURL = function(url) {
			Editor.ready(function() {
				$.ajax({
					'url': url,
					'dataType': 'text',
					success: svgCanvas.setSvgString,
					error: function(xhr) {
						if(xhr.responseText) {
							svgCanvas.setSvgString(xhr.responseText);
						}
					}
				});
			});
		};
		
		Editor.loadFromDataURI = function(str) {
			Editor.ready(function() {
				svgCanvas.setSvgString(str);
				var pre = 'data:image/svg+xml;base64,';
				var src = str.substring(pre.length);
				svgCanvas.setSvgString(Utils.decode64(src));
			});
		};
		
		Editor.addExtension = function() {
			var args = arguments;
			$(function() {
				svgCanvas.addExtension.apply(this, args);
			});
		};

		
		
		

		return Editor;
	}(jQuery);
	
	// Run init once DOM is loaded
	$(svgEditor.init);
	
})();

// ?iconsize=s&bkgd_color=555

// svgEditor.setConfig({
// // 	imgPath: 'foo',
// 	dimensions: [800, 600],
// 	canvas_expansion: 5,
// 	initStroke: {
// 		color: '0000FF',
// 		width: 3.5,
// 		opacity: .5
// 	},
// 	initFill: {
// 		color: '550000',
// 		opacity: .75
// 	}
// })
