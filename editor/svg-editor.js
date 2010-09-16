/*
 * svg-editor.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Narendra Sisodiya
 *
 */

(function() { 
	// TODO: Find out what causes bugs in jQuery animate for IE9
// 	if($.browser.msie) $.fx.off = true;
	
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
				extPath: 'extensions/',
				jGraduatePath: 'jgraduate/images/',
				extensions: ['ext-markers.js','ext-connector.js', 'ext-eyedropper.js', 'ext-shapes.js', 'ext-imagelib.js','ext-grid.js'],
				initTool: 'select',
				wireframe: false,
				colorPickerCSS: null,
				gridSnapping: false,
				snappingStep: 10
			},
			uiStrings = Editor.uiStrings = {
			"invalidAttrValGiven":"Invalid value given",
			"noContentToFitTo":"No content to fit to",
			"layer":"Layer",
			"dupeLayerName":"There is already a layer named that!",
			"enterUniqueLayerName":"Please enter a unique layer name",
			"enterNewLayerName":"Please enter the new layer name",
			"layerHasThatName":"Layer already has that name",
			"QmoveElemsToLayer":"Move selected elements to layer \"%s\"?",
			"QwantToClear":"Do you want to clear the drawing?\nThis will also erase your undo history!",
			"QwantToOpen":"Do you want to open a new file?\nThis will also erase your undo history!",
			"QerrorsRevertToSource":"There were parsing errors in your SVG source.\nRevert back to original SVG source?",
			"QignoreSourceChanges":"Ignore changes made to SVG source?",
			"featNotSupported":"Feature not supported",
			"enterNewImgURL":"Enter the new image URL",
			"defsFailOnSave": "NOTE: Due to a bug in your browser, this image may appear wrong (missing gradients or elements). It will however appear correct once actually saved.",
			"loadingImage":"Loading image, please wait...",
			"saveFromBrowser": "Select \"Save As...\" in your browser to save this image as a %s file.",
			"noteTheseIssues": "Also note the following issues: ",
			"ok":"OK",
			"cancel":"Cancel",
			"key_up":"Up",
			"key_down":"Down",
			"key_backspace":"Backspace",
			"key_del":"Del"
		};
		
		var curPrefs = {}; //$.extend({}, defaultPrefs);
		
		var customHandlers = {};
		
		Editor.curConfig = curConfig;
		
		Editor.tool_scale = 1;
		
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
			if(opts.extensions) {
				curConfig.extensions = opts.extensions;
			}

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
			Editor.ready(function() {
				if(opts.open) {
					$('#tool_open > input[type="file"]').remove();
					$('#tool_open').show();
					svgCanvas.open = opts.open;
				}
				if(opts.save) {
					show_save_warning = false;
					svgCanvas.bind("saved", opts.save);
				}
				if(opts.pngsave) {
					svgCanvas.bind("exported", opts.pngsave);
				}
				customHandlers = opts;
			});
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
					
					if(urldata.extensions) {
						urldata.extensions = urldata.extensions.split(',');
					}
					
					if(urldata.bkgd_color) {
						urldata.bkgd_color = '#' + urldata.bkgd_color;
					}

					svgEditor.setConfig(urldata);
					
					// FIXME: This is null if Data URL ends with '='. 
					var src = urldata.source;
					var qstr = $.param.querystring();

					if(src) {
						if(src.indexOf("data:") === 0) {
							// plusses get replaced by spaces, so re-insert
							src = src.replace(/ /g, "+");
							Editor.loadFromDataURI(src);
						} else {
							Editor.loadFromString(src);
						}
					} else if(qstr.indexOf('paramurl=') !== -1) {
						// Get paramater URL (use full length of remaining location.href)
						svgEditor.loadFromURL(qstr.substr(9));
					} else if(urldata.url) {
						svgEditor.loadFromURL(urldata.url);
					}
				}
			})();
			
			var extFunc = function() {
				$.each(curConfig.extensions, function() {
					var extname = this;
					$.getScript(curConfig.extPath + extname, function(d) {
						// Fails locally in Chrome 5
						if(!d) {
							var s = document.createElement('script');
							s.src = curConfig.extPath + extname;
							document.querySelector('head').appendChild(s);
						}
					});
				});
			}
			
			// Load extensions
			// Bit of a hack to run extensions in local Opera
			if(window.opera && document.location.protocol === 'file:') {
				setTimeout(extFunc, 1000);
			} else {
				extFunc();
			}
			
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
					'node_clone':'node_clone.png',
					'delete':'delete.png',
					'node_delete':'node_delete.png',
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
					'#tool_export div':'export',
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
					
					'#tool_clone,#tool_clone_multi':'clone',
					'#tool_node_clone':'node_clone',
					'#layer_delete,#tool_delete,#tool_delete_multi':'delete',
					'#tool_node_delete':'node_delete',
					'#tool_add_subpath':'add_subpath',
					'#tool_openclose_path':'open_path',
					'#tool_move_top':'move_top',
					'#tool_move_bottom':'move_bottom',
					'#tool_topath':'to_path',
					'#tool_node_link':'link_controls',
					'#tool_reorient':'reorient',
					'#tool_group':'group',
					'#tool_ungroup':'ungroup',
					'#tool_unlink_use':'unlink_use',
					
					'#tool_alignleft, #tool_posleft':'align_left',
					'#tool_aligncenter, #tool_poscenter':'align_center',
					'#tool_alignright, #tool_posright':'align_right',
					'#tool_aligntop, #tool_postop':'align_top',
					'#tool_alignmiddle, #tool_posmiddle':'align_middle',
					'#tool_alignbottom, #tool_posbottom':'align_bottom',
					'#cur_position':'align',
					
					'#linecap_butt,#cur_linecap':'linecap_butt',
					'#linecap_round':'linecap_round',
					'#linecap_square':'linecap_square',
					
					'#linejoin_miter,#cur_linejoin':'linejoin_miter',
					'#linejoin_round':'linejoin_round',
					'#linejoin_bevel':'linejoin_bevel',
					
					'#url_notice':'warning',
					
					'#layer_up':'go_up',
					'#layer_down':'go_down',
					'#layerlist td.layervis':'eye',
					
					'#tool_source_save,#tool_docprops_save':'ok',
					'#tool_source_cancel,#tool_docprops_cancel':'cancel',
					
					'#rwidthLabel, #iwidthLabel':'width',
					'#rheightLabel, #iheightLabel':'height',
					'#cornerRadiusLabel span':'c_radius',
					'#angleLabel':'angle',
					'#zoomLabel':'zoom',
					'#tool_fill label': 'fill',
					'#tool_stroke .icon_label': 'stroke',
					'#group_opacityLabel': 'opacity',
					'#blurLabel': 'blur',
					'#font_sizeLabel': 'fontsize',
					
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
					'.toolbar_button button .svg_icon':16,
					'.stroke_tool div div .svg_icon': 20,
					'#tools_bottom label .svg_icon': 18
				},
				callback: function(icons) {
					$('.toolbar_button button > svg, .toolbar_button button > img').each(function() {
						$(this).parent().prepend(this);
					});
					
					var tleft = $('#tools_left');
					if (tleft.length != 0) {
						var min_height = tleft.offset().top + tleft.outerHeight();
					}
// 					var size = $.pref('iconsize');
// 					if(size && size != 'm') {
// 						svgEditor.setIconSize(size);				
// 					} else if($(window).height() < min_height) {
// 						// Make smaller
// 						svgEditor.setIconSize('s');
// 					}
					
					// Look for any missing flyout icons from plugins
					$('.tools_flyout').each(function() {
						var shower = $('#' + this.id + '_show');
						var sel = shower.attr('data-curopt');
						// Check if there's an icon here
						if(!shower.children('svg, img').length) {
							var clone = $(sel).children().clone();
							if(clone.length) {
								clone[0].removeAttribute('style'); //Needed for Opera
								shower.append(clone);
							}
						}
					});
					
					svgEditor.runCallbacks();
				}
			});

			Editor.canvas = svgCanvas = new $.SvgCanvas(document.getElementById("svgcanvas"), curConfig);
			
			var palette = ["#000000", "#3f3f3f", "#7f7f7f", "#bfbfbf", "#ffffff",
			           "#ff0000", "#ff7f00", "#ffff00", "#7fff00",
			           "#00ff00", "#00ff7f", "#00ffff", "#007fff",
			           "#0000ff", "#7f00ff", "#ff00ff", "#ff007f",
			           "#7f0000", "#7f3f00", "#7f7f00", "#3f7f00",
			           "#007f00", "#007f3f", "#007f7f", "#003f7f",
			           "#00007f", "#3f007f", "#7f007f", "#7f003f",
			           "#ffaaaa", "#ffd4aa", "#ffffaa", "#d4ffaa",
			           "#aaffaa", "#aaffd4", "#aaffff", "#aad4ff",
			           "#aaaaff", "#d4aaff", "#ffaaff", "#ffaad4",
			           ];
	
				isMac = (navigator.platform.indexOf("Mac") != -1);
				modKey = (isMac ? "meta+" : "ctrl+"); // ⌘
				path = svgCanvas.pathActions,
				undoMgr = svgCanvas.undoMgr,
				Utils = svgCanvas.Utils,
				default_img_url = curConfig.imgPath + "logo.png",
				workarea = $("#workarea"),
				canv_menu = $("#cmenu_canvas"),
				show_save_warning = false, 
				exportWindow = null, 
				tool_scale = 1;

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
						input.bind('keydown', 'return', function() {ok.click();});
					}
					
					if(type == 'process') {
						ok.hide();
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
				$.process_cancel = function(msg, cb) {	dbox('process', msg, cb);};
				$.prompt = function(msg, txt, cb) { dbox('prompt', msg, cb, txt);};
			}());
			
			var setSelectMode = function() {
				var curr = $('.tool_button_current');
				if(curr[0].id !== 'tool_select') {
					curr.removeClass('tool_button_current').addClass('tool_button');
					$('#tool_select').addClass('tool_button_current').removeClass('tool_button');
					$('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all} #svgcanvas svg{cursor:default}');
				}
				svgCanvas.setMode('select');
			};
			
			var togglePathEditMode = function(editmode, elems) {
				$('#path_node_panel').toggle(editmode);
				$('#tools_bottom_2,#tools_bottom_3').toggle(!editmode);
				if(editmode) {
					// Change select icon
					$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
					$('#tool_select').addClass('tool_button_current').removeClass('tool_button');
					setIcon('#tool_select', 'select_node');
					multiselected = false;
					if(elems.length) {
						selectedElement = elems[0];
					}
				} else {
					setIcon('#tool_select', 'select');
				}
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
				show_save_warning = false;
			
				// by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs) 
				// can just provide their own custom save handler and might not want the XML prolog
				svg = '<?xml version="1.0"?>\n' + svg;
				
				// Opens the SVG in new window, with warning about Mozilla bug #308590 when applicable
				
				var ua = navigator.userAgent;

				// Chrome 5 (and 6?) don't allow saving, show source instead ( http://code.google.com/p/chromium/issues/detail?id=46735 )
				// IE9 doesn't allow standalone Data URLs ( https://connect.microsoft.com/IE/feedback/details/542600/data-uri-images-fail-when-loaded-by-themselves )
				if((~ua.indexOf('Chrome') && $.browser.version >= 533) || ~ua.indexOf('MSIE')) {
					showSourceEditor(0,true);
					return;	
				}
				
				var win = window.open("data:image/svg+xml;base64," + Utils.encode64(svg));
				
				// Alert will only appear the first time saved OR the first time the bug is encountered
				var done = $.pref('save_notice_done');
				if(done !== "all") {
		
					var note = uiStrings.saveFromBrowser.replace('%s', 'SVG');
					
					// Check if FF and has <defs/>
					if(ua.indexOf('Gecko/') !== -1) {
						if(svg.indexOf('<defs') !== -1) {
							note += "\n\n" + uiStrings.defsFailOnSave;
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
			
			var exportHandler = function(window, data) {
				var issues = data.issues;
				
				if(!$('#export_canvas').length) {
					$('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
				}
				var c = $('#export_canvas')[0];
				
				c.width = svgCanvas.contentW;
				c.height = svgCanvas.contentH;
				canvg(c, data.svg, {renderCallback: function() {
					var datauri = c.toDataURL('image/png');
					exportWindow.location.href = datauri;
					var done = $.pref('export_notice_done');
					if(done !== "all") {
						var note = uiStrings.saveFromBrowser.replace('%s', 'PNG');
						
						// Check if there's issues
						if(issues.length) {
							var pre = "\n \u2022 ";
							note += ("\n\n" + uiStrings.noteTheseIssues + pre + issues.join(pre));
						} 
						
						// Note that this will also prevent the notice even though new issues may appear later.
						// May want to find a way to deal with that without annoying the user
						$.pref('export_notice_done', 'all'); 
						exportWindow.alert(note);
					}
				}});
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
				if(svgCanvas.getMode() == "select") {
					setSelectMode();
				}
				
				for (var i = 0; i < elems.length; ++i) {
					var elem = elems[i];
					
					// if the element changed was the svg, then it could be a resolution change
					if (elem && elem.tagName == "svg") {
						populateLayers();
						updateCanvas();
					} 
					// Update selectedElement if element is no longer part of the image.
					// This occurs for the text elements in Firefox
					else if(elem && selectedElement && selectedElement.parentNode == null) {
// 						|| elem && elem.tagName == "path" && !multiselected) { // This was added in r1430, but not sure why
						selectedElement = elem;
					}
				}
				
				show_save_warning = true;
		
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
					var shower = $(show_sel);
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
									var icon = $.getSvgIcon(opts.icon, true);
								} else {
									// 
									var icon = $(opts.sel).children().eq(0).clone();
								}
								
								icon[0].setAttribute('width',shower.width());
								icon[0].setAttribute('height',shower.height());
								shower.children(':not(.flyout_arrow_horiz)').remove();
								shower.append(icon).attr('data-curopt', opts.sel); // This sets the current mode
							}
							
							$(this).mouseup(func);
							
							if(opts.key) {
								$(document).bind('keydown', opts.key+'', func);
							}
						});
					
					if(def) {
						shower.attr('data-curopt', btn_opts[def].sel);
					} else if(!shower.attr('data-curopt')) {
						// Set first as default
						shower.attr('data-curopt', btn_opts[0].sel);
					}
					
					var timer;
					
					// Clicking the "show" icon should set the current mode
					shower.mousedown(function(evt) {
						if(shower.hasClass('disabled')) return false;
						var holder = $(show_sel.replace('_show',''));
						var l = holder.css('left');
						var w = holder.width()*-1;
						var time = holder.data('shown_popop')?200:0;
						timer = setTimeout(function() {
							// Show corresponding menu
							if(!shower.data('isLibrary')) {
								holder.css('left', w).show().animate({
									left: l
								},150);
							} else {
								holder.css('left', l).show();
							}
							holder.data('shown_popop',true);
						},time);
						evt.preventDefault();
					}).mouseup(function(evt) {
						clearTimeout(timer);
						var opt = $(this).attr('data-curopt');
						// Is library and popped up, so do nothing
						if(shower.data('isLibrary') && $(show_sel.replace('_show','')).is(':visible')) {
							toolButtonClick(show_sel, true);
							return;
						}
						if (toolButtonClick(show_sel) && (opt in flyout_funcs)) {
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
					$(this).css({left: (pos.left + w)*tool_scale, top: pos.top});
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

			var resize_timer;			
			
			var extAdded = function(window, ext) {
		
				var cb_called = false;
				var resize_done = false;
				var cb_ready = true; // Set to false to delay callback (e.g. wait for $.svgIcons)
				
				function prepResize() {
					if(resize_timer) {
						clearTimeout(resize_timer);
						resize_timer = null;
					}
					if(!resize_done) {
						resize_timer = setTimeout(function() {
							resize_done = true;
							setIconSize(curPrefs.iconsize);
						}, 50);	
					}
				}

				
				var runCallback = function() {
					if(ext.callback && !cb_called && cb_ready) {
						cb_called = true;
						ext.callback();
					}
				}
		
				var btn_selects = [];
		
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
						case 'button-select': 
							var html = '<div id="' + tool.id + '" class="dropdown toolset" title="' + tool.title + '">'
								+ '<div id="cur_' + tool.id + '" class="icon_label"></div><button></button></div>';
							
							var list = $('<ul id="' + tool.id + '_opts"></ul>').appendTo('#option_lists');
							
							if(tool.colnum) {
								list.addClass('optcols' + tool.colnum);
							}
							
							// Creates the tool, hides & adds it, returns the select element
							var dropdown = $(html).appendTo(panel).children();
							
							btn_selects.push({
								elem: ('#' + tool.id),
								list: ('#' + tool.id + '_opts'),
								title: tool.title,
								callback: tool.events.change,
								cur: ('#cur_' + tool.id)
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
							var svgicon = btn.svgicon?btn.svgicon:btn.id;
							if(btn.type == 'app_menu') {
								placement_obj['#' + id + ' > div'] = svgicon;
							} else {
								placement_obj['#' + id] = svgicon;
							}
						}
						
						var cls, parent;
						
						// Set button up according to its type
						switch ( btn.type ) {
						case 'mode_flyout':
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
						case 'app_menu':
							cls = '';
							parent = '#main_menu ul';
							break;
						}
						
						var button = $((btn.list || btn.type == 'app_menu')?'<li/>':'<div/>')
							.attr("id", id)
							.attr("title", btn.title)
							.addClass(cls);
						if(!btn.includeWith && !btn.list) {
							if("position" in btn) {
								$(parent).children().eq(btn.position).before(button);
							} else {
								button.appendTo(parent);
							}

							if(btn.type =='mode_flyout') {
							// Add to flyout menu / make flyout menu
	// 							var opts = btn.includeWith;
	// 							// opts.button, default, position
								var ref_btn = $(button);
								
								var flyout_holder = ref_btn.parent();
								// Create a flyout menu if there isn't one already
								if(!ref_btn.parent().hasClass('tools_flyout')) {
									// Create flyout placeholder
									var tls_id = ref_btn[0].id.replace('tool_','tools_')
									var show_btn = ref_btn.clone()
										.attr('id',tls_id + '_show')
										.append($('<div>',{'class':'flyout_arrow_horiz'}));
										
									ref_btn.before(show_btn);
								
									// Create a flyout div
									flyout_holder = makeFlyoutHolder(tls_id, ref_btn);
									flyout_holder.data('isLibrary', true);
									show_btn.data('isLibrary', true);
								} 
								
								
								
	// 							var ref_data = Actions.getButtonData(opts.button);
								
								placement_obj['#' + tls_id + '_show'] = btn.id;
								// TODO: Find way to set the current icon using the iconloader if this is not default
								
								// Include data for extension button as well as ref button
								var cur_h = holders['#'+flyout_holder[0].id] = [{
									sel: '#'+id,
									fn: btn.events.click,
									icon: btn.id,
// 									key: btn.key,
									isDefault: true
								}, ref_data];
	// 							
	// 							// {sel:'#tool_rect', fn: clickRect, evt: 'mouseup', key: 4, parent: '#tools_rect', icon: 'rect'}
	// 								
	// 							var pos  = ("position" in opts)?opts.position:'last';
	// 							var len = flyout_holder.children().length;
	// 							
	// 							// Add at given position or end
	// 							if(!isNaN(pos) && pos >= 0 && pos < len) {
	// 								flyout_holder.children().eq(pos).before(button);
	// 							} else {
	// 								flyout_holder.append(button);
	// 								cur_h.reverse();
	// 							}
							} else if(btn.type == 'app_menu') {
								button.append('<div>').append(btn.title);
							}
							
						} else if(btn.list) {
							// Add button to list
							button.addClass('push_button');
							$('#' + btn.list + '_opts').append(button);
 							if(btn.isDefault) {
 								$('#cur_' + btn.list).append(button.children().clone());
 								var svgicon = btn.svgicon?btn.svgicon:btn.id;
	 							placement_obj['#cur_' + btn.list] = svgicon;
 							}
						} else if(btn.includeWith) {
							// Add to flyout menu / make flyout menu
							var opts = btn.includeWith;
							// opts.button, default, position
							var ref_btn = $(opts.button);
							
							var flyout_holder = ref_btn.parent();
							// Create a flyout menu if there isn't one already
							if(!ref_btn.parent().hasClass('tools_flyout')) {
								// Create flyout placeholder
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
						
						if(!btn.list) {
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
											$(document).bind('keydown', btn.key, func);
											if(btn.title) button.attr("title", btn.title + ' ['+btn.key+']');
										}
									} else {
										button.bind(name, func);
									}
								} else {
									button.bind(name, func);
								}
							});
						}
						
						setupFlyouts(holders);
					});
					
					$.each(btn_selects, function() {
						addAltDropDown(this.elem, this.list, this.callback, {seticon: true}); 
					});
					
					if (svgicons)
						cb_ready = false; // Delay callback

					$.svgIcons(svgicons, {
						w:24, h:24,
						id_match: false,
						no_img: true,
						fallback: fallback_obj,
						placement: placement_obj,
						callback: function(icons) {
							// Non-ideal hack to make the icon match the current size
							if(curPrefs.iconsize && curPrefs.iconsize != 'm') {
								prepResize();
							}
							cb_ready = true; // Ready for callback
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
				if (selectedElement != null && $.inArray(selectedElement.tagName, ['use', 'image', 'foreignObject', 'g', 'a']) === -1) {
				
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
					svgCanvas.setColor('fill', fillColor, true);
					svgCanvas.setPaintOpacity('fill', fillOpacity, true);
		
					// update stroke color and opacity
					var strokeColor = selectedElement.getAttribute("stroke")||"none";
					// prevent undo on these canvas changes
					svgCanvas.setColor('stroke', strokeColor, true);
					svgCanvas.setPaintOpacity('stroke', strokeOpacity, true);
		
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
					
					$('#stroke_width').val(selectedElement.getAttribute("stroke-width")||1).change();
					$('#stroke_style').val(selectedElement.getAttribute("stroke-dasharray")||"none").change();

					var attr = selectedElement.getAttribute("stroke-linejoin") || 'miter';
					
					if ($('#linejoin_' + attr).length != 0)
						setStrokeOpt($('#linejoin_' + attr)[0]);
					
					attr = selectedElement.getAttribute("stroke-linecap") || 'butt';
					
					if ($('#linecap_' + attr).length != 0)
						setStrokeOpt($('#linecap_' + attr)[0]);

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
		
			var setImageURL = Editor.setImageURL = function(url) {
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
		
			var setInputWidth = function(elem) {
				var w = Math.min(Math.max(12 + elem.value.length * 6, 50), 300);
				$(elem).width(w);
			}
		
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
					#ellipse_panel, #line_panel, #text_panel, #image_panel, #container_panel, #use_panel').hide();
				if (elem != null) {
					var elname = elem.nodeName;
					
					// If this is a link with no transform and one child, pretend
					// its child is selected
// 					console.log('go', elem)
// 					if(elname === 'a') { // && !$(elem).attr('transform')) {
// 						elem = elem.firstChild;
// 					}

					
					var angle = svgCanvas.getRotationAngle(elem);
					$('#angle').val(angle);
					
					var blurval = svgCanvas.getBlur(elem);
					$('#blur').val(blurval);
					$('#blur_slider').slider('option', 'value', blurval);
					
					if(svgCanvas.addedNew) {
						if(elname == 'image') {
							// Prompt for URL if not a data URL
							if(svgCanvas.getHref(elem).indexOf('data:') !== 0) {
								promptImgURL();
							}
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
						
						// Show open/close button based on selected point
						setIcon('#tool_openclose_path', path.closed_subpath ? 'open_path' : 'close_path');
						
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
						text: [],
						'use': []
					};
					
					var el_name = elem.tagName;
					
// 					if($(elem).data('gsvg')) {
// 						$('#g_panel').show();
// 					}
					
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
							setImageURL(svgCanvas.getHref(elem));
						} // image
						else if(el_name == 'g' || el_name == 'use') {
							$('#container_panel').show();
							var title = svgCanvas.getTitle();
							var label = $('#g_title')[0];
							label.value = title;
							setInputWidth(label);
							var d = 'disabled';
							if(el_name == 'use') {
								label.setAttribute(d, d);
							} else {
								label.removeAttribute(d);
							}
						}
					}
				} // if (elem != null)
				else if (multiselected) {
					$('#multiselected_panel').show();
				} else {
					$('#cmenu_canvas li').disableContextMenuItems('#delete,#cut,#copy,#move_up,#move_down');
				}
				
				// update history buttons
				if (undoMgr.getUndoStackSize() > 0) {
					$('#tool_undo').removeClass( 'disabled');
				}
				else {
					$('#tool_undo').addClass( 'disabled');
				}
				if (undoMgr.getRedoStackSize() > 0) {
					$('#tool_redo').removeClass( 'disabled');
				}
				else {
					$('#tool_redo').addClass( 'disabled');
				}
				
				svgCanvas.addedNew = false;
		
				if ( (elem && !is_node)	|| multiselected) {
					// update the selected elements' layer
					$('#selLayerNames').removeAttr('disabled').val(currentLayer);
					
					// Enable regular menu options
					canv_menu.enableContextMenuItems('#delete,#cut,#copy,#move_down,#move_up');
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
			svgCanvas.bind("exported", exportHandler);
			svgCanvas.bind("zoomed", zoomChanged);
			svgCanvas.bind("extension_added", extAdded);
			svgCanvas.textActions.setInputElem($("#text")[0]);
		
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
		
			var changeBlur = function(ctl, val, noUndo) {
				if(val == null) val = ctl.value;
				$('#blur').val(val);
				var complete = false;
				if(!ctl || !ctl.handle) {
					$('#blur_slider').slider('option', 'value', val);
					complete = true;
				}
				if(noUndo) {
					svgCanvas.setBlurNoUndo(val);	
				} else {
					svgCanvas.setBlur(val, complete);
				}
			}
		
			var operaRepaint = function() {
				// Repaints canvas in Opera. Needed for stroke-dasharray change as well as fill change
				if(!window.opera) return;
				$('<p/>').hide().appendTo('body').remove();
			}
		
			$('#stroke_style').change(function(){
				svgCanvas.setStrokeAttr('stroke-dasharray', $(this).val());
				operaRepaint();
			});

			$('#stroke_linejoin').change(function(){
				svgCanvas.setStrokeAttr('stroke-linejoin', $(this).val());
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
			
			$('#g_title').change(function() {
				svgCanvas.setGroupTitle(this.value);
				setInputWidth(this);

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
					if (svgCanvas.getColor('stroke') != color) {
						svgCanvas.setColor('stroke', color);
					}
					if (color != 'none' && svgCanvas.getStrokeOpacity() != 1) {
						svgCanvas.setPaintOpacity('stroke', 1.0);
					}
				} else {
					fillPaint = paint;
					if (svgCanvas.getColor('fill') != color) {
						svgCanvas.setColor('fill', color);
					}
					if (color != 'none' && svgCanvas.getFillOpacity('fill') != 1) {
						svgCanvas.setPaintOpacity('fill', 1.0);
					}
				}
				updateToolButtonState();
			});
		
			$("#toggle_stroke_tools").toggle(function() {
				$(".stroke_tool").css('display','table-cell');
				$(this).text('<<');
			}, function() {
				$(".stroke_tool").css('display','none');
				$(this).text('>>');
			});
		
			// This is a common function used when a tool has been clicked (chosen)
			// It does several common things:
			// - removes the tool_button_current class from whatever tool currently has it
			// - hides any flyouts
			// - adds the tool_button_current class to the button passed in
			var toolButtonClick = function(button, noHiding) {
				if ($(button).hasClass('disabled')) return false;
				if($(button).parent().hasClass('tools_flyout')) return true;
				var fadeFlyouts = fadeFlyouts || 'normal';
				if(!noHiding) {
					$('.tools_flyout').fadeOut(fadeFlyouts);
				}
				$('#styleoverrides').text('');
				$('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
				$(button).addClass('tool_button_current').removeClass('tool_button');
				// when a tool is selected, we should deselect any currently selected elements
				if(button !== '#tool_select') {
					svgCanvas.clearSelection();
				}
				return true;
			};
			
			(function() {
				var last_x = null, last_y = null, w_area = workarea[0], 
					panning = false, keypan = false;
				
				$('#svgcanvas').bind('mousemove mouseup', function(evt) {
					if(panning === false) return;

					w_area.scrollLeft -= (evt.clientX - last_x);
					w_area.scrollTop -= (evt.clientY - last_y);
					
					last_x = evt.clientX;
					last_y = evt.clientY;
					
					if(evt.type === 'mouseup') panning = false;
					return false;
				}).mousedown(function(evt) {
					if(evt.button === 1 || keypan === true) {
						panning = true;
						last_x = evt.clientX;
						last_y = evt.clientY;
						return false;
					}
				});
				
				$(window).mouseup(function() {
					panning = false;
				});
				
				$(document).bind('keydown', 'space', function(evt) {
					svgCanvas.spaceKey = keypan = true;
					evt.preventDefault();
				}).bind('keyup', 'space', function(evt) {
					evt.preventDefault();
					svgCanvas.spaceKey = keypan = false;
				});
			}());
			
			
			function setStrokeOpt(opt, changeElem) {
				var id = opt.id;
				var bits = id.split('_');
				var pre = bits[0];
				var val = bits[1];
			
				if(changeElem) {
					svgCanvas.setStrokeAttr('stroke-' + pre, val);
				}
				operaRepaint();
				setIcon('#cur_' + pre , id, 20);
				$(opt).addClass('current').siblings().removeClass('current');
			}
			
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
						if (evt.target.tagName != "INPUT") {
							list.fadeOut(200);
						} else if(!set_click) {
							set_click = true;
							$(evt.target).click(function() {
								list.css('margin-left','-9999px').show();
							});
						}
					}
					on_button = false;
				}).mousedown(function(evt) {
// 					$(".contextMenu").hide();
// 					console.log('cm', $(evt.target).closest('.contextMenu'));
				
					var islib = $(evt.target).closest('div.tools_flyout, .contextMenu').length;
					if(!islib) $('.tools_flyout:visible,.contextMenu').fadeOut(250);
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
			// Made public for UI customization.
			// TODO: Group UI functions into a public svgEditor.ui interface.
			Editor.addDropDown = function(elem, callback, dropUp) {
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
			
			// TODO: Combine this with addDropDown or find other way to optimize
			var addAltDropDown = function(elem, list, callback, opts) {
				var button = $(elem);
				var list = $(list);
				var on_button = false;
				var dropUp = opts.dropUp;
				if(dropUp) {
					$(elem).addClass('dropup');
				}
				list.find('li').bind('mouseup', function() {
					if(opts.seticon) {
						setIcon('#cur_' + button[0].id , $(this).children());
						$(this).addClass('current').siblings().removeClass('current');
					}
					callback.apply(this, arguments);

				});
				
				$(window).mouseup(function(evt) {
					if(!on_button) {
						button.removeClass('down');
						list.hide();
						list.css({top:0, left:0});
					}
					on_button = false;
				});
				
				var height = list.height();
				$(elem).bind('mousedown',function() {
					var off = $(elem).offset();
					if(dropUp) {
						off.top -= list.height();
						off.left += 8;
					} else {
						off.top += $(elem).height();
					}
					$(list).offset(off);
					
					if (!button.hasClass('down')) {
						button.addClass('down');
						list.show();
						on_button = true;
						return false;
					} else {
						button.removeClass('down');
						// CSS position must be reset for Webkit
						list.hide();
						list.css({top:0, left:0});
					}
				}).hover(function() {
					on_button = true;
				}).mouseout(function() {
					on_button = false;
				});
				
				if(opts.multiclick) {
					list.mousedown(function() {
						on_button = true;
					});
				}
			}
			
			Editor.addDropDown('#font_family_dropdown', function() {
				var fam = $(this).text();
				$('#font_family').val($(this).text()).change();
			});
			
			Editor.addDropDown('#opacity_dropdown', function() {
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
		
			Editor.addDropDown('#blur_dropdown', function() {
			});
			
			var slideStart = false;
			
			$("#blur_slider").slider({
				max: 10,
				step: .1,
				stop: function(evt, ui) {
					slideStart = false;
					changeBlur(ui);
					$('#blur_dropdown li').show();
					$(window).mouseup();
				},
				start: function() {
					slideStart = true;
				},
				slide: function(evt, ui){
					changeBlur(ui, null, slideStart);
				}
			});

		
			Editor.addDropDown('#zoom_dropdown', function() {
				var item = $(this);
				var val = item.attr('data-val');
				if(val) {
					zoomChanged(window, val);
				} else {
					changeZoom({value:parseInt(item.text())});
				}
			}, true);
			
			addAltDropDown('#stroke_linecap', '#linecap_opts', function() {
				setStrokeOpt(this, true);
			}, {dropUp: true});
			
			addAltDropDown('#stroke_linejoin', '#linejoin_opts', function() {
				setStrokeOpt(this, true);
			}, {dropUp: true});
			
			addAltDropDown('#tool_position', '#position_opts', function() {
				var letter = this.id.replace('tool_pos','').charAt(0);
				svgCanvas.alignSelectedElements(letter, 'page');
			}, {multiclick: true});
			
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
			
			// Unfocus text input when workarea is mousedowned.
			(function() {
				var inp;

				var unfocus = function() {
					$(inp).blur();
				}
				
				// Do not include the #text input, as it needs to remain focused 
				// when clicking on an SVG text element.
				$('#svg_editor input:text:not(#text)').focus(function() {
					inp = this;
					workarea.mousedown(unfocus);
				}).blur(function() {
					workarea.unbind('mousedown', unfocus);
					
					// Go back to selecting text if in textedit mode
					if(svgCanvas.getMode() == 'textedit') {
						$('#text').focus();
					}
				});
			}());

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
				if (toolButtonClick('#tool_square')) {
					svgCanvas.setMode('square');
				}
			};
			
			var clickRect = function(){
				if (toolButtonClick('#tool_rect')) {
					svgCanvas.setMode('rect');
				}
			};
			
			var clickFHRect = function(){
				if (toolButtonClick('#tool_fhrect')) {
					svgCanvas.setMode('fhrect');
				}
			};
			
			var clickCircle = function(){
				if (toolButtonClick('#tool_circle')) {
					svgCanvas.setMode('circle');
				}
			};
		
			var clickEllipse = function(){
				if (toolButtonClick('#tool_ellipse')) {
					svgCanvas.setMode('ellipse');
				}
			};
		
			var clickFHEllipse = function(){
				if (toolButtonClick('#tool_fhellipse')) {
					svgCanvas.setMode('fhellipse');
				}
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
		
			var cutSelected = function() {
				if (selectedElement != null || multiselected) {
					svgCanvas.cutSelectedElements();
				}
			};
			
			var copySelected = function() {
				if (selectedElement != null || multiselected) {
					svgCanvas.copySelectedElements();
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
			
			var moveUpDownSelected = function(dir) {
				if (selectedElement != null) {
					svgCanvas.moveUpDownSelected(dir);
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
		
			var opencloseSubPath = function() {
				path.opencloseSubPath();
			}	
			
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
				return false;
			};
			
			var clickItalic = function(){
				svgCanvas.setItalic( !svgCanvas.getItalic() );
				updateContextPanel();
				return false;
			};
		
			var clickSave = function(){
				// In the future, more options can be provided here
				var saveOpts = {
					'images': curPrefs.img_save,
					'round_digits': 6
				}
				svgCanvas.save(saveOpts);
			};
			
			var clickExport = function() {
				// Open placeholder window (prevents popup)
				if(!customHandlers.pngsave)  {
					var str = uiStrings.loadingImage;
					exportWindow = window.open("data:text/html;charset=utf-8,<title>" + str + "<\/title><h1>" + str + "<\/h1>");
				}

				if(window.canvg) {
					svgCanvas.rasterExport();
				} else {
					$.getScript('canvg/rgbcolor.js', function() {
						$.getScript('canvg/canvg.js', function() {
							svgCanvas.rasterExport();
						});
					});
				}
			}
			
			// by default, svgCanvas.open() is a no-op.
			// it is up to an extension mechanism (opera widget, etc) 
			// to call setCustomHandlers() which will make it do something
			var clickOpen = function(){
				svgCanvas.open();
			};
			var clickImport = function(){
			};
		
			var clickUndo = function(){
				if (undoMgr.getUndoStackSize() > 0) {
					undoMgr.undo();
					populateLayers();
				}
			};
		
			var clickRedo = function(){
				if (undoMgr.getRedoStackSize() > 0) {
					undoMgr.redo();
					populateLayers();
				}
			};
			
			var clickGroup = function(){
				// group
				if (multiselected) {
					svgCanvas.groupSelectedElements();
				}
				// ungroup
				else if(selectedElement){
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
		
			var showSourceEditor = function(e, forSaving){
				if (editingsource) return;
				editingsource = true;
				
				$('#save_output_btns').toggle(!!forSaving);
				$('#tool_source_back').toggle(!forSaving);
				
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
				$('#canvas_title').val(svgCanvas.getDocumentTitle());
				
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
				$('grid_snapping_step').attr('value', curConfig.snappingStep);
				if (curConfig.gridSnapping == true) {
				    $('#grid_snapping_on').attr('checked', 'checked');
				} else {
				    $('#grid_snapping_on').removeAttr('checked');
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
					setTitle(svgCanvas.getDocumentTitle());
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
				svgCanvas.setDocumentTitle(new_title);
			
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
				
				// set grid setting
				curConfig.gridSnapping = $('#grid_snapping_on')[0].checked;
				curConfig.snappingStep = $('#grid_snapping_step').val();

				updateCanvas();
				hideDocProperties();
			};
			
			function setBackground(color, url) {
// 				if(color == curPrefs.bkgd_color && url == curPrefs.bkgd_url) return;
				$.pref('bkgd_color', color);
				$.pref('bkgd_url', url);
				
				// This should be done in svgcanvas.js for the borderRect fill
				svgCanvas.setBackground(color, url);
			}
			
			var setIcon = Editor.setIcon = function(elem, icon_id, forcedSize) {
				var icon = (typeof icon_id == 'string') ? $.getSvgIcon(icon_id, true) : icon_id;
				if(!icon) {
					console.log('NOTE: Icon image missing: ' + icon_id);
					return;
				}
				try {
					icon = icon.clone();
					$(elem).empty().append(icon);
				} catch(e) {
// 					icon = svgCanvas.copyElem(icon[0]);
				}
				
			}
		
			var ua_prefix;
			(ua_prefix = function() {
				var regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
				var someScript = document.getElementsByTagName('script')[0];
				for(var prop in someScript.style) {
					if(regex.test(prop)) {
						// test is faster than match, so it's better to perform
						// that on the lot and match only when necessary
						return prop.match(regex)[0];
					}
				}
			
				// Nothing found so far?
				if('WebkitOpacity' in someScript.style) return 'Webkit';
				if('KhtmlOpacity' in someScript.style) return 'Khtml';
				
				return '';
			}());
			
			var scaleElements = function(elems, scale) {
				var prefix = '-' + ua_prefix.toLowerCase() + '-';
				
				var sides = ['top', 'left', 'bottom', 'right'];
			
				elems.each(function() {
// 					console.log('go', scale);

					// Handled in CSS
					// this.style[ua_prefix + 'Transform'] = 'scale(' + scale + ')';
				
					var el = $(this);
					
					var w = el.outerWidth() * (scale - 1);
					var h = el.outerHeight() * (scale - 1);
					var margins = {};
					
					for(var i = 0; i < 4; i++) {
						var s = sides[i];
						
						var cur = el.data('orig_margin-' + s);
						if(cur == null) {
							cur = parseInt(el.css('margin-' + s));
							// Cache the original margin
							el.data('orig_margin-' + s, cur);
						}
						var val = cur * scale;
						if(s === 'right') {
							val += w;
						} else if(s === 'bottom') {
							val += h;
						}
						
						el.css('margin-' + s, val);
// 						el.css('outline', '1px solid red');
					}
				});
			}
			
			var setIconSize = Editor.setIconSize = function(size, force) {
				if(size == curPrefs.size && !force) return;
// 				return;
// 				var elems = $('.tool_button, .push_button, .tool_button_current, .disabled, .icon_label, #url_notice, #tool_open');
				console.log('size', size);
				
				var sel_toscale = '#tools_top .toolset, #editor_panel > *, #history_panel > *,\
				#main_button, #tools_left > *, #path_node_panel > *, #multiselected_panel > *,\
				#g_panel > *, #tool_font_size > *, .tools_flyout';
				
				var elems = $(sel_toscale);
				
				var scale = 1;
				
				if(typeof size == 'number') {
					scale = size;
				} else {
					var icon_sizes = { s:.75, m:1, l:1.25, xl:1.5 };
					scale = icon_sizes[size];
				}
				
				Editor.tool_scale = tool_scale = scale;
				
				setFlyoutPositions();
				// $('.tools_flyout').each(function() {
// 					var pos = $(this).position();
// 					console.log($(this),  pos.left+(34 * scale));
// 					$(this).css({'left': pos.left+(34 * scale), 'top': pos.top+(77 * scale)});
// 					console.log('l', $(this).css('left'));
// 				});

// 				var scale = .75;//0.75;
				
				var hidden_ps = elems.parents(':hidden');
				hidden_ps.css('visibility', 'hidden').show();
				scaleElements(elems, scale);
				hidden_ps.css('visibility', 'visible').hide();
// 				console.timeEnd('elems');								
// 				return;
				
				$.pref('iconsize', size);
				$('#iconsize').val(size);
				
				
				// Change icon size
// 				$('.tool_button, .push_button, .tool_button_current, .disabled, .icon_label, #url_notice, #tool_open')
// 				.find('> svg, > img').each(function() {
// 					this.setAttribute('width',size_num);
// 					this.setAttribute('height',size_num);
// 				});
// 				
// 				$.resizeSvgIcons({
// 					'.flyout_arrow_horiz > svg, .flyout_arrow_horiz > img': size_num / 5,
// 					'#logo > svg, #logo > img': size_num * 1.3,
// 					'#tools_bottom .icon_label > *': (size_num === 16 ? 18 : size_num * .75)
// 				});
// 				if(size != 's') {
// 					$.resizeSvgIcons({'#layerbuttons svg, #layerbuttons img': size_num * .6});
// 				}
				
				// Note that all rules will be prefixed with '#svg_editor' when parsed
				var cssResizeRules = {
// 					".tool_button,\
// 					.push_button,\
// 					.tool_button_current,\
// 					.push_button_pressed,\
// 					.disabled,\
// 					.icon_label,\
// 					.tools_flyout .tool_button": {
// 						'width': {s: '16px', l: '32px', xl: '48px'},
// 						'height': {s: '16px', l: '32px', xl: '48px'},
// 						'padding': {s: '1px', l: '2px', xl: '3px'}
// 					},
// 					".tool_sep": {
// 						'height': {s: '16px', l: '32px', xl: '48px'},
// 						'margin': {s: '2px 2px', l: '2px 5px', xl: '2px 8px'}
// 					},
// 					"#main_icon": {
// 						'width': {s: '31px', l: '53px', xl: '75px'},
// 						'height': {s: '22px', l: '42px', xl: '64px'}
// 					},
					"#tools_top": {
						'left': 50,
						'height': 72
					},
					"#tools_left": {
						'width': 31,
						'top': 74
					},
					"div#workarea": {
						'left': 38,
						'top': 74
					},
// 					"#tools_bottom": {
// 						'left': {s: '27px', l: '46px', xl: '65px'},
// 						'height': {s: '58px', l: '98px', xl: '145px'}
// 					},
// 					"#color_tools": {
// 						'border-spacing': {s: '0 1px'},
// 						'margin-top': {s: '-1px'}
// 					},
// 					"#color_tools .icon_label": {
// 						'width': {l:'43px', xl: '60px'}
// 					},
// 					".color_tool": {
// 						'height': {s: '20px'}
// 					},
// 					"#tool_opacity": {
// 						'top': {s: '1px'},
// 						'height': {s: 'auto', l:'auto', xl:'auto'}
// 					},
// 					"#tools_top input, #tools_bottom input": {
// 						'margin-top': {s: '2px', l: '4px', xl: '5px'},
// 						'height': {s: 'auto', l: 'auto', xl: 'auto'},
// 						'border': {s: '1px solid #555', l: 'auto', xl: 'auto'},
// 						'font-size': {s: '.9em', l: '1.2em', xl: '1.4em'}
// 					},
// 					"#zoom_panel": {
// 						'margin-top': {s: '3px', l: '4px', xl: '5px'}
// 					},
// 					"#copyright, #tools_bottom .label": {
// 						'font-size': {l: '1.5em', xl: '2em'},
// 						'line-height': {s: '15px'}
// 					},
// 					"#tools_bottom_2": {
// 						'width': {l: '295px', xl: '355px'},
// 						'top': {s: '4px'}
// 					},
// 					"#tools_top > div, #tools_top": {
// 						'line-height': {s: '17px', l: '34px', xl: '50px'}
// 					}, 
// 					".dropdown button": {
// 						'height': {s: '18px', l: '34px', xl: '40px'},
// 						'line-height': {s: '18px', l: '34px', xl: '40px'},
// 						'margin-top': {s: '3px'}
// 					},
// 					"#tools_top label, #tools_bottom label": {
// 						'font-size': {s: '1em', l: '1.5em', xl: '2em'},
// 						'height': {s: '25px', l: '42px', xl: '64px'}
// 					}, 
// 					"div.toolset": {
// 						'height': {s: '25px', l: '42px', xl: '64px'}
// 					},
// 					"#tool_bold, #tool_italic": {
// 						'font-size': {s: '1.5em', l: '3em', xl: '4.5em'}
// 					},
// 					"#sidepanels": {
// 						'top': {s: '50px', l: '88px', xl: '125px'},
// 						'bottom': {s: '51px', l: '68px', xl: '65px'}
// 					},
// 					'#layerbuttons': {
// 						'width': {l: '130px', xl: '175px'},
// 						'height': {l: '24px', xl: '30px'}
// 					},
// 					'#layerlist': {
// 						'width': {l: '128px', xl: '150px'}
// 					},			
// 					'.layer_button': {
// 						'width': {l: '19px', xl: '28px'},
// 						'height': {l: '19px', xl: '28px'}
// 					},
// 					"input.spin-button": {
// 						'background-image': {l: "url('images/spinbtn_updn_big.png')", xl: "url('images/spinbtn_updn_big.png')"},
// 						'background-position': {l: '100% -5px', xl: '100% -2px'},
// 						'padding-right': {l: '24px', xl: '24px' }
// 					},
// 					"input.spin-button.up": {
// 						'background-position': {l: '100% -45px', xl: '100% -42px'}
// 					},
// 					"input.spin-button.down": {
// 						'background-position': {l: '100% -85px', xl: '100% -82px'}
// 					},
// 					"#position_opts": {
// 						'width': {all: (size_num*4) +'px'}
// 					}
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
							if(typeof values === 'number') {
								var val = (values * scale) + 'px';
							} else if(values[size] || values.all) {
								var val = (values[size] || values.all);
							}
							style_str += (prop + ':' + val + ';');
						});
						style_str += '}';
					});
					//this.style[ua_prefix + 'Transform'] = 'scale(' + scale + ')';
					var prefix = '-' + ua_prefix.toLowerCase() + '-';
					style_str += (sel_toscale + '{' + prefix + 'transform: scale(' + scale + ');}'
					+ ' #svg_editor div.toolset .toolset {' + prefix + 'transform: scale(1); margin: 1px !important;}' // Hack for markers
					+ ' #svg_editor .ui-slider {' + prefix + 'transform: scale(' + (1/scale) + ');}' // Hack for sliders
					);
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

			var win_wh = {width:$(window).width(), height:$(window).height()};
			
			$(window).resize(function(evt) {
				if (editingsource) {
					properlySourceSizeTextArea();
				}
				
				$.each(win_wh, function(type, val) {
					var curval = $(window)[type]();
					workarea[0]['scroll' + (type==='width'?'Left':'Top')] -= (curval - val)/2;
					win_wh[type] = curval;
				});
			});
			
			$('#url_notice').click(function() {
				$.alert(this.title);
			});
			
			$('#change_image_url').click(promptImgURL);
			
			function promptImgURL() {
				var curhref = svgCanvas.getHref(selectedElement);
				curhref = curhref.indexOf("data:") === 0?"":curhref;
				$.prompt(uiStrings.enterNewImgURL, curhref, function(url) {
					if(url) setImageURL(url);
				});
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
					if (button != null) {
						var title = button.title;
						var index = title.indexOf("Ctrl+");
						button.title = [title.substr(0, index), "Cmd+", title.substr(index + 5)].join('');
					}
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
					.css(curConfig.colorPickerCSS || {'left': pos.left, 'bottom': 50 - pos.top})
					.jGraduate(
					{ 
						paint: paint,
						window: { pickerTitle: title },
						images: { clientPath: curConfig.jGraduatePath }
					},
					function(p) {
						paint = new $.jGraduate.Paint(p);
						
						var oldgrad = document.getElementById("gradbox_"+picker);
						var svgbox = oldgrad.parentNode;
						var rectbox = svgbox.firstChild;
						if (paint.type == "linearGradient" || paint.type == "radialGradient") {
							svgbox.removeChild(oldgrad);
							var newgrad = svgbox.appendChild(document.importNode(paint[paint.type], true));
							newgrad.id = "gradbox_"+picker;
							rectbox.setAttribute("fill", "url(#gradbox_" + picker + ")");
							rectbox.setAttribute("opacity", paint.alpha/100);
						}
						else {
							rectbox.setAttribute("fill", paint.solidColor != "none" ? "#" + paint.solidColor : "none");
							rectbox.setAttribute("opacity", paint.alpha/100);
						}
		
						if (picker == 'stroke') {
							svgCanvas.setPaint('stroke', paint);
							strokePaint = paint;
						}
						else {
							svgCanvas.setPaint('fill', paint);
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
				var bNoFill = (svgCanvas.getColor('fill') == 'none');
				var bNoStroke = (svgCanvas.getColor('stroke') == 'none');
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
			var docElem = svgdocbox.documentElement;


			var boxgrad = svgdocbox.getElementById('gradbox_');
			boxgrad.id = 'gradbox_fill';
			docElem.setAttribute('width',16.5);
			$('#fill_color').append( document.importNode(docElem,true) );
			
			boxgrad.id = 'gradbox_stroke';	
			docElem.setAttribute('width',16.5);
			$('#stroke_color').append( document.importNode(docElem,true) );
			$('#stroke_color rect').attr({
				'fill': '#' + curConfig.initStroke.color,
				'opacity': curConfig.initStroke.opacity
			});
			
			$('#stroke_width').val(curConfig.initStroke.width);
			$('#group_opacity').val(curConfig.initOpacity * 100);
			
			// Use this SVG elem to test vectorEffect support
			var test_el = docElem.firstChild;
			test_el.setAttribute('style','vector-effect:non-scaling-stroke');
			var supportsNonSS = (test_el.style.vectorEffect == 'non-scaling-stroke');
			test_el.removeAttribute('style');
			
			// Use this to test support for blur element. Seems to work to test support in Webkit
			var blur_test = svgdocbox.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
			if(typeof blur_test.stdDeviationX === "undefined") {
				$('#tool_blur').hide();
			}
			$(blur_test).remove();
			
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
				
			$('#fill_color, #tool_fill .icon_label').click(function(){
				colorPicker($('#fill_color'));
				updateToolButtonState();
			});
		
			$('#stroke_color, #tool_stroke .icon_label').click(function(){
				colorPicker($('#stroke_color'));
				updateToolButtonState();
			});
			
			$('#group_opacityLabel').click(function() {
				$('#opacity_dropdown button').mousedown();
				$(window).mouseup();
			});
			
			$('#zoomLabel').click(function() {
				$('#zoom_dropdown button').mousedown();
				$(window).mouseup();
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
			var sidedrag = -1, sidedragging = false, allowmove = false;
				
			var resizePanel = function(evt) {
				if (!allowmove) return;
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
			}
			
			$('#sidepanel_handle')
				.mousedown(function(evt) {
					sidedrag = evt.pageX;
					$(window).mousemove(resizePanel);
					allowmove = false;
					// Silly hack for Chrome, which always runs mousemove right after mousedown
					setTimeout(function() {
						allowmove = true;
					}, 20);
				})
				.mouseup(function(evt) {
					if (!sidedragging) toggleSidePanel();
					sidedrag = -1;
					sidedragging = false;
				});

			$(window).mouseup(function() {
				sidedrag = -1;
				sidedragging = false;
				$('#svg_editor').unbind('mousemove', resizePanel);
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
					{sel:'#tool_clear', fn: clickClear, evt: 'mouseup', key: ['N', true]},
					{sel:'#tool_save', fn: function() { editingsource?saveSourceEditor():clickSave()}, evt: 'mouseup', key: ['S', true]},
					{sel:'#tool_export', fn: clickExport, evt: 'mouseup'},
					{sel:'#tool_open', fn: clickOpen, evt: 'mouseup', key: ['O', true]},
					{sel:'#tool_import', fn: clickImport, evt: 'mouseup'},
					{sel:'#tool_source', fn: showSourceEditor, evt: 'click', key: ['U', true]},
					{sel:'#tool_wireframe', fn: clickWireframe, evt: 'click', key: ['F', true]},
					{sel:'#tool_source_cancel,#svg_source_overlay,#tool_docprops_cancel', fn: cancelOverlays, evt: 'click', key: ['esc', false, false], hidekey: true},
					{sel:'#tool_source_save', fn: saveSourceEditor, evt: 'click'},
					{sel:'#tool_docprops_save', fn: saveDocProperties, evt: 'click'},
					{sel:'#tool_docprops', fn: showDocProperties, evt: 'mouseup', key: ['P', true]},
					{sel:'#tool_delete,#tool_delete_multi', fn: deleteSelected, evt: 'click', key: ['del/backspace', true]},
					{sel:'#tool_reorient', fn: reorientPath, evt: 'click'},
					{sel:'#tool_node_link', fn: linkControlPoints, evt: 'click'},
					{sel:'#tool_node_clone', fn: clonePathNode, evt: 'click'},
					{sel:'#tool_node_delete', fn: deletePathNode, evt: 'click'},
					{sel:'#tool_openclose_path', fn: opencloseSubPath, evt: 'click'},
					{sel:'#tool_add_subpath', fn: addSubPath, evt: 'click'},
					{sel:'#tool_move_top', fn: moveToTopSelected, evt: 'click', key: 'shift+up'},
					{sel:'#tool_move_bottom', fn: moveToBottomSelected, evt: 'click', key: 'shift+down'},
					{sel:'#tool_topath', fn: convertToPath, evt: 'click'},
					{sel:'#tool_undo', fn: clickUndo, evt: 'click', key: ['Z', true]},
					{sel:'#tool_redo', fn: clickRedo, evt: 'click', key: ['Y', true]},
					{sel:'#tool_clone,#tool_clone_multi', fn: clickClone, evt: 'click', key: ['C', true]},
					{sel:'#tool_group', fn: clickGroup, evt: 'click', key: ['G', true]},
					{sel:'#tool_ungroup', fn: clickGroup, evt: 'click'},
					{sel:'#tool_unlink_use', fn: clickGroup, evt: 'click'},
					{sel:'[id^=tool_align]', fn: clickAlign, evt: 'click'},
					// these two lines are required to make Opera work properly with the flyout mechanism
		// 			{sel:'#tools_rect_show', fn: clickRect, evt: 'click'},
		// 			{sel:'#tools_ellipse_show', fn: clickEllipse, evt: 'click'},
					{sel:'#tool_bold', fn: clickBold, evt: 'mousedown'},
					{sel:'#tool_italic', fn: clickItalic, evt: 'mousedown'},
					{sel:'#sidepanel_handle', fn: toggleSidePanel, key: ['X']},
					{sel:'#copy_save_done', fn: cancelOverlays, evt: 'click'},
					
					// Shortcuts not associated with buttons
					{key: 'shift+left', fn: function(){rotateSelected(0)}},
					{key: 'shift+right', fn: function(){rotateSelected(1)}},
					{key: 'shift+O', fn: selectPrev},
					{key: 'shift+P', fn: selectNext},
					{key: [modKey+'up', true], fn: function(){zoomImage(2);}},
					{key: [modKey+'down', true], fn: function(){zoomImage(.5);}},
					{key: [modKey+'[', true], fn: function(){moveUpDownSelected('Down');}},
					{key: [modKey+']', true], fn: function(){moveUpDownSelected('Up');}},
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
								if (btn.length == 0) return true; // Skip if markup does not exist
								if(opts.evt) {
									btn[opts.evt](opts.fn);
								}
		
								// Add to parent flyout menu, if able to be displayed
								if(opts.parent && $(opts.parent + '_show').length != 0) {
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
									$(document).bind('keydown', key, function(e) {
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
						$('.attr_changer, #image_url').bind('keydown', 'return', 
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
				
				if(curConfig.gridSnapping) {
					$('#grid_snapping_on')[0].checked = true;
				}
				
				if(curConfig.snappingStep) {
					$('#grid_snapping_step').val(curConfig.snappingStep);
				}
			});
			
			$('#rect_rx').SpinButton({ min: 0, max: 1000, step: 1, callback: changeRectRadius });
			$('#stroke_width').SpinButton({ min: 0, max: 99, step: 1, smallStep: 0.1, callback: changeStrokeWidth });
			$('#angle').SpinButton({ min: -180, max: 180, step: 5, callback: changeRotationAngle });
			$('#font_size').SpinButton({ step: 1, min: 0.001, stepfunc: stepFontSize, callback: changeFontSize });
			$('#group_opacity').SpinButton({ step: 5, min: 0, max: 100, callback: changeOpacity });
			$('#blur').SpinButton({ step: .1, min: 0, max: 10, callback: changeBlur });
			$('#zoom').SpinButton({ min: 0.001, max: 10000, step: 50, stepfunc: stepZoom, callback: changeZoom });
			
			$("#workarea").contextMenu({
					menu: 'cmenu_canvas',
					inSpeed: 0
				},
				function(action, el, pos) {
					switch ( action ) {
						case 'delete':
							deleteSelected();
							break;
						case 'cut':
							cutSelected();
							break;
						case 'copy':
							copySelected();
							break;
						case 'paste':
							svgCanvas.pasteElements();
							break;
						case 'paste_in_place':
							svgCanvas.pasteElements('in_place');
							break;
						case 'move_down':
							moveUpDownSelected('Down');
							break;
						case 'move_up':
							moveUpDownSelected('Up');
							break;

					}
					
					if(svgCanvas.clipBoard.length) {
						canv_menu.enableContextMenuItems('#paste,#paste_in_place');
					}
			});
			
			$('.contextMenu li').mousedown(function(ev) {
				ev.preventDefault();
			})
			
			$('#cmenu_canvas li').disableContextMenu();
			canv_menu.enableContextMenuItems('#delete,#cut,#copy');
			
			window.onbeforeunload = function() { 
				// Suppress warning if page is empty 
				if(undoMgr.getUndoStackSize() === 0) {
					show_save_warning = false;
				}

				// show_save_warning is set to "false" when the page is saved.
				if(!curConfig.no_save_warning && show_save_warning) {
					// Browser already asks question about closing the page
					return "There are unsaved changes."; 
				}
			};
			
			Editor.openPrep = function(func) {
				$('#main_menu').hide();
				if(undoMgr.getUndoStackSize() === 0) {
					func(true);
				} else {
					$.confirm(uiStrings.QwantToOpen, func);
				}
			}
			
			// use HTML5 File API: http://www.w3.org/TR/FileAPI/
			// if browser has HTML5 File API support, then we will show the open menu item
			// and provide a file input to click.  When that change event fires, it will
			// get the text contents of the file and send it to the canvas
			if (window.FileReader) {
				var inp = $('<input type="file">').change(function() {
					var f = this;
					Editor.openPrep(function(ok) {
						if(!ok) return;
						svgCanvas.clear();
						if(f.files.length==1) {
							var reader = new FileReader();
							reader.onloadend = function(e) {
								svgCanvas.setSvgString(e.target.result);
								updateCanvas();
							};
							reader.readAsText(f.files[0]);
						}
					});
				});
				$("#tool_open").show().prepend(inp);
				var inp2 = $('<input type="file">').change(function() {
					$('#main_menu').hide();
					if(this.files.length==1) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							svgCanvas.importSvgString(e.target.result, true);
							updateCanvas();
						};
						reader.readAsText(this.files[0]);
					}
				});
				$("#tool_import").show().prepend(inp2);
			}
			
			var updateCanvas = Editor.updateCanvas = function(center, new_ctr) {
				var w = workarea.width(), h = workarea.height();
				var w_orig = w, h_orig = h;
				var zoom = svgCanvas.getZoom();
				var w_area = workarea;
				var cnvs = $("#svgcanvas");
				
				var old_ctr = {
					x: w_area[0].scrollLeft + w_orig/2,
					y: w_area[0].scrollTop + h_orig/2
				};
				
				var multi = curConfig.canvas_expansion;
				w = Math.max(w_orig, svgCanvas.contentW * zoom * multi);
				h = Math.max(h_orig, svgCanvas.contentH * zoom * multi);
				
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
						x: new_x,
						y: new_y
					};
					
				} else {
					new_ctr.x += offset.x,
					new_ctr.y += offset.y;
				}
				
				if(center) {
					// Go to top-left for larger documents
					if(svgCanvas.contentW > w_area.width()) {
						// Top-left
						workarea[0].scrollLeft = offset.x - 10;
						workarea[0].scrollTop = offset.y - 10;
					} else {
						// Center
						w_area[0].scrollLeft = scroll_x;
						w_area[0].scrollTop = scroll_y;
					}
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
			
			// Not sure what this was being used for...commented out until known.
			// The "message" event listener was interfering with image lib responder
// 			try{
// 				json_encode = function(obj){
// 			  //simple partial JSON encoder implementation
// 			  if(window.JSON && JSON.stringify) return JSON.stringify(obj);
// 			  var enc = arguments.callee; //for purposes of recursion
// 			  if(typeof obj == "boolean" || typeof obj == "number"){
// 				  return obj+'' //should work...
// 			  }else if(typeof obj == "string"){
// 				//a large portion of this is stolen from Douglas Crockford's json2.js
// 				return '"'+
// 					  obj.replace(
// 						/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
// 					  , function (a) {
// 						return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
// 					  })
// 					  +'"'; //note that this isn't quite as purtyful as the usualness
// 			  }else if(obj.length){ //simple hackish test for arrayish-ness
// 				for(var i = 0; i < obj.length; i++){
// 				  obj[i] = enc(obj[i]); //encode every sub-thingy on top
// 				}
// 				return "["+obj.join(",")+"]";
// 			  }else{
// 				var pairs = []; //pairs will be stored here
// 				for(var k in obj){ //loop through thingys
// 				  pairs.push(enc(k)+":"+enc(obj[k])); //key: value
// 				}
// 				return "{"+pairs.join(",")+"}" //wrap in the braces
// 			  }
// 			}
// 			  window.addEventListener("message", function(e){
// 				var cbid = parseInt(e.data.substr(0, e.data.indexOf(";")));
// 				try{
// 				e.source.postMessage("SVGe"+cbid+";"+json_encode(eval(e.data)), e.origin);
// 			  }catch(err){
// 				e.source.postMessage("SVGe"+cbid+";error:"+err.message, e.origin);
// 			  }
// 			}, false)
// 			}catch(err){
// 			  window.embed_error = err;
// 			}
			
		
		
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
					
					// Copy title for certain tool elements
					var elems = {
						'#stroke_color': '#tool_stroke .icon_label, #tool_stroke .color_block',
						'#fill_color': '#tool_fill label, #tool_fill .color_block',
						'#linejoin_miter': '#cur_linejoin',
						'#linecap_butt': '#cur_linecap'
					}
					
					$.each(elems, function(source, dest) {
						$(dest).attr('title', $(source)[0].title);
					});
					
					// Copy alignment titles
					$('#multiselected_panel div[id^=tool_align]').each(function() {
						$('#tool_pos' + this.id.substr(10))[0].title = this.title;
					});
					
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
		
		Editor.loadFromURL = function(url, cache) {
			Editor.ready(function() {
				$.ajax({
					'url': url,
					'dataType': 'text',
					cache: !!cache,
					success: svgCanvas.setSvgString,
					error: function(xhr, stat, err) {
						if(xhr.responseText) {
							svgCanvas.setSvgString(xhr.responseText);
						} else {
							$.alert("Unable to load from URL. Error: \n"+err+'');
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
				if(svgCanvas) svgCanvas.addExtension.apply(this, args);
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
// 	},
// 	extensions: ['ext-helloworld.js']
// })
