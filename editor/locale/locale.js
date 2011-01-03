/*
 * Localizing script for SVG-edit UI
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Narendra Sisodya
 * Copyright(c) 2010 Alexis Deveria
 *
 */

var svgEditor = (function($, Editor) {
	
	function setStrings(type, obj, ids) {
		// Root element to look for element from
		var parent = $('#svg_editor').parent();
		for(var sel in obj) {
			var val = obj[sel];
			if(!val) console.log(sel);
			
			if(ids) sel = '#' + sel;
			var $elem = parent.find(sel);
			if($elem.length) {
				var elem = parent.find(sel)[0];
				
				switch ( type ) {
					case 'content':
						for(var i = 0; i < elem.childNodes.length; i++) {
							var node = elem.childNodes[i];
							if(node.nodeType === 3 && node.textContent.replace(/\s/g,'')) {
								node.textContent = val;
								break;
							}
						}
						break;
					
					case 'title':
						elem.title = val;
						break;
				}
				
				
			} else {
				console.log('Missing: ' + sel);
			}
		}
	}

	Editor.putLocale = function(given_param, good_langs){
		var lang_param;
	
		if(given_param) {
			lang_param = given_param;
		} else {
			lang_param = $.pref('lang');
			if(!lang_param) {
				if (navigator.userLanguage) // Explorer
					lang_param = navigator.userLanguage;
				else if (navigator.language) // FF, Opera, ...
					lang_param = navigator.language;
				if (lang_param == "")
					return;
			}
			
			console.log(lang_param)
			
			// Set to English if language is not in list of good langs
			if($.inArray(lang_param, good_langs) == -1 && lang_param !== 'test') {
				lang_param = "en";
			}
	
			// don't bother on first run if language is English		
			if(lang_param.indexOf("en") == 0) return;

		}
		
		var conf = Editor.curConfig;
		
		var url = conf.langPath + "lang." + lang_param + ".js";
		
		var processFile = function(data){
			if(!data) return;
			var langData = eval(data);

			var more = Editor.canvas.runExtensions("addlangData", lang_param, true);
			$.each(more, function(i, m) {
				if(m.data) {
					langData = $.merge(langData, m.data);
				}
			});
			
			// Old locale file, do nothing for now.
			if(!langData.tools) return;
			
			var tools = langData.tools,
				misc = langData.misc,
				properties = langData.properties,
				config = langData.config,
				layers = langData.layers,
				common = langData.common,
				ui = langData.ui;
			
			setStrings('content', {
				connector_no_arrow: tools.connector_no_arrow,
				copyrightLabel: misc.copyrightLabel,
				curve_segments: properties.curve_segments,
				fitToContent: tools.fitToContent,
				fit_to_all: tools.fit_to_all,
				fit_to_canvas: tools.fit_to_canvas,
				fit_to_layer_content: tools.fit_to_layer_content,
				fit_to_sel: tools.fit_to_sel,
				
				icon_large: config.icon_large,
				icon_medium: config.icon_medium,
				icon_small: config.icon_small,
				icon_xlarge: config.icon_xlarge,
				image_opt_embed: config.image_opt_embed,
				image_opt_ref: config.image_opt_ref,
				includedImages: config.includedImages,
				
				largest_object: tools.largest_object,
				
				layersLabel: layers.layersLabel,
				page: tools.page,
				relativeToLabel: tools.relativeToLabel,
				selLayerLabel: layers.selLayerLabel,
				selectedPredefined: config.selectedPredefined,
				
				selected_objects: tools.selected_objects,
				smallest_object: tools.smallest_object,
				straight_segments: properties.straight_segments,
				
				svginfo_bg_url: config.image_url + ":",
				svginfo_bg_note: config.svginfo_bg_note,
				svginfo_change_background: config.svginfo_change_background,
				svginfo_dim: config.svginfo_dim,
				svginfo_editor_prefs: config.svginfo_editor_prefs,
				svginfo_height: config.svginfo_height,
				svginfo_icons: config.svginfo_icons,
				svginfo_image_props: config.svginfo_image_props,
				svginfo_lang: config.svginfo_lang,
				svginfo_title: config.svginfo_title,
				svginfo_width: config.svginfo_width,
				
				tool_docprops_cancel: common.cancel,
				tool_docprops_save: common.ok,

				tool_source_cancel: common.cancel,
				tool_source_save: common.ok,
				
				tool_prefs_cancel: common.cancel,
				tool_prefs_save: common.ok,

				sidepanel_handle: layers.sidepanel_handle,

				tool_clear: tools.tool_clear,
				tool_docprops: tools.tool_docprops,
				tool_export: tools.tool_export,
				tool_import: tools.tool_import,
				tool_imagelib: tools.tool_imagelib,
				tool_open: tools.tool_open,
				tool_save: tools.tool_save,
				
				svginfo_units_rulers: config.units_and_rulers,
				svginfo_rulers_onoff: config.show_rulers,
				svginfo_unit: config.base_unit,
				
				svginfo_grid_settings: config.grid,
				svginfo_snap_onoff: config.snapping_onoff,
				svginfo_snap_step: config.snapping_stepsize,


			}, true);
			
			// Shape categories
			var cats = {};
			for (var o in langData.shape_cats) {
				cats['#shape_cats [data-cat="' + o + '"]'] = langData.shape_cats[o];
			}
			
			// TODO: Find way to make this run after shapelib ext has loaded
			setTimeout(function() {
				setStrings('content', cats);
			}, 2000);
			
			// Context menus
			var opts = {};
			$.each(['cut','copy','paste', 'paste_in_place', 'delete', 'group', 'ungroup', 'move_front', 'move_up', 'move_down', 'move_back'], function() {
				opts['#cmenu_canvas a[href="#' + this + '"]'] = tools[this];
			});

			$.each(['dupe','delete','merge_down', 'merge_all'], function() {
				opts['#cmenu_layers a[href="#' + this + '"]'] = layers[this];
			});

			opts['#cmenu_layers a[href="#delete"]'] = layers.layer_delete;
			
			setStrings('content', opts);
			
			setStrings('title', {
 				align_relative_to: tools.align_relative_to,
				bkgnd_color: tools.bkgnd_color,
				circle_cx: properties.circle_cx,
				circle_cy: properties.circle_cy,
				circle_r: properties.circle_r,
				cornerRadiusLabel: properties.cornerRadiusLabel,
				ellipse_cx: properties.ellipse_cx,
				ellipse_cy: properties.ellipse_cy,
				ellipse_rx: properties.ellipse_rx,
				ellipse_ry: properties.ellipse_ry,
				fill_color: properties.fill_color,
				font_family: properties.font_family,
				idLabel: properties.idLabel,
				image_height: properties.image_height,
				image_url: properties.image_url,
				image_width: properties.image_width,
				layer_delete: layers.layer_delete,
				layer_down: layers.layer_down,
				layer_new: layers.layer_new,
				layer_rename: layers.layer_rename,
				layer_moreopts: common.more_opts,
				layer_up: layers.layer_up,
				line_x1: properties.line_x1,
				line_x2: properties.line_x2,
				line_y1: properties.line_y1,
				line_y2: properties.line_y2,
				linecap_butt: properties.linecap_butt,
				linecap_round: properties.linecap_round,
				linecap_square: properties.linecap_square,
				linejoin_bevel: properties.linejoin_bevel,
				linejoin_miter: properties.linejoin_miter,
				linejoin_round: properties.linejoin_round,
				main_icon: tools.main_icon,
				mode_connect: tools.mode_connect,
				tools_shapelib_show: tools.tools_shapelib_show,
				palette: ui.palette,
				zoom_panel: ui.zoom_panel,
				path_node_x: properties.path_node_x,
				path_node_y: properties.path_node_y,
				rect_height_tool: properties.rect_height_tool,
				rect_width_tool: properties.rect_width_tool,
				seg_type: properties.seg_type,
				selLayerNames: layers.selLayerNames,
				selected_x: properties.selected_x,
				selected_y: properties.selected_y,
				stroke_color: properties.stroke_color,
				stroke_style: properties.stroke_style,
				stroke_width: properties.stroke_width,
				svginfo_title: config.svginfo_title,
				text: properties.text,
				toggle_stroke_tools: ui.toggle_stroke_tools,
				tool_add_subpath: tools.tool_add_subpath,
				tool_alignbottom: tools.tool_alignbottom,
				tool_aligncenter: tools.tool_aligncenter,
				tool_alignleft: tools.tool_alignleft,
				tool_alignmiddle: tools.tool_alignmiddle,
				tool_alignright: tools.tool_alignright,
				tool_aligntop: tools.tool_aligntop,
				tool_angle: properties.tool_angle,
				tool_blur: properties.tool_blur,
				tool_bold: properties.tool_bold,
				tool_circle: tools.tool_circle,
				tool_clone: tools.tool_clone,
				tool_clone_multi: tools.tool_clone_multi,
				tool_delete: tools.tool_delete,
				tool_delete_multi: tools.tool_delete_multi,
				tool_ellipse: tools.tool_ellipse,
				tool_eyedropper: tools.tool_eyedropper,
				tool_fhellipse: tools.tool_fhellipse,
				tool_fhpath: tools.tool_fhpath,
				tool_fhrect: tools.tool_fhrect,
				tool_font_size: properties.tool_font_size,
				tool_group: tools.tool_group,
				tool_make_link: tools.tool_make_link,
				tool_link_url: tools.tool_link_url,
				tool_image: tools.tool_image,
				tool_italic: properties.tool_italic,
				tool_line: tools.tool_line,
				tool_move_bottom: tools.tool_move_bottom,
				tool_move_top: tools.tool_move_top,
				tool_node_clone: tools.tool_node_clone,
				tool_node_delete: tools.tool_node_delete,
				tool_node_link: tools.tool_node_link,
				tool_opacity: properties.tool_opacity,
				tool_openclose_path: tools.tool_openclose_path,
				tool_path: tools.tool_path,
				tool_position: tools.tool_position,
				tool_rect: tools.tool_rect,
				tool_redo: tools.tool_redo,
				tool_reorient: tools.tool_reorient,
				tool_select: tools.tool_select,
				tool_source: tools.tool_source,
				tool_square: tools.tool_square,
				tool_text: tools.tool_text,
				tool_topath: tools.tool_topath,
				tool_undo: tools.tool_undo,
				tool_ungroup: tools.tool_ungroup,
				tool_wireframe: tools.tool_wireframe,
				view_grid: tools.view_grid,
				tool_zoom: tools.tool_zoom,
				url_notice: tools.url_notice

				}
			, true);
			
			Editor.setLang(lang_param, langData);
			
			
			
// 			$.each(langData, function(i, data) {
// 				if(data.id) {
// 					var elem = $('#svg_editor').parent().find('#'+data.id)[0];
// 					if(elem) {
// 						if(data.title)
// 							elem.title = data.title;
// 						if(data.textContent) {
// 							// Only replace non-empty text nodes, not elements
// 							$.each(elem.childNodes, function(j, node) {
// 								if(node.nodeType == 3 && $.trim(node.textContent)) {
// 									node.textContent = data.textContent;
// 								}
// 							});
// 						}
// 					}
// 				} else if(data.js_strings) {
// 					js_strings = data.js_strings;
// 				}
// 			});
		}
		
		$.ajax({
			'url': url,
			'dataType': "text",
			success: processFile,
			error: function(xhr) {
				if(xhr.responseText) {
					processFile(xhr.responseText);
				}
			}
		});
	};
	
	return Editor;
}(jQuery, svgEditor));

