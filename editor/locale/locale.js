/* globals jQuery */
/**
 * Localizing script for SVG-edit UI
 * @module locale
 * @license MIT
 *
 * @copyright 2010 Narendra Sisodya
 * @copyright 2010 Alexis Deveria
 *
 */

/**
 * Used, for example, in the ImageLibs extension, to present libraries (with name/URL/description) in order
 * @typedef {GenericArray.<module:locale.LocaleStrings>} module:locale.LocaleArray
*/
/**
 * The string keys of the object are two-letter language codes
 * @tutorial LocaleDocs
 * @typedef {PlainObject.<string, string|module:locale.LocaleStrings|module:locale.LocaleArray>} module:locale.LocaleStrings
 */
// keyed to an array of objects with "id" and "title" or "textContent" properties
/**
 * @typedef {PlainObject.<string, string>} module:locale.LocaleSelectorValue
 */

import {importSetGlobalDefault} from '../external/dynamic-import-polyfill/importModule.js';

const $ = jQuery;

let langParam;

/**
* @param {"content"|"title"} type
* @param {module:locale.LocaleSelectorValue} obj
* @param {boolean} ids
* @returns {undefined}
*/
export const setStrings = function (type, obj, ids) {
  // Root element to look for element from
  const parent = $('#svg_editor').parent();
  Object.entries(obj).forEach(([sel, val]) => {
    if (!val) { console.log(sel); }

    if (ids) { sel = '#' + sel; }
    const $elem = parent.find(sel);
    if ($elem.length) {
      const elem = parent.find(sel)[0];

      switch (type) {
      case 'content':
        for (let i = 0, node; (node = elem.childNodes[i]); i++) {
          if (node.nodeType === 3 && node.textContent.trim()) {
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
  });
};

/**
* The "data" property is generally set to an an array of objects with
* "id" and "title" or "textContent" properties
* @typedef {PlainObject} module:locale.AddLangExtensionLocaleData
* @property {module:locale.LocaleStrings[]} data See {@tutorial LocaleDocs}
*/

/**
* @interface module:locale.LocaleEditorInit
*/
/**
 * @function module:locale.LocaleEditorInit#addLangData
 * @param {string} langParam
 * @returns {module:locale.AddLangExtensionLocaleData}
*/

let editor_;
/**
* @function init
* @memberof module:locale
* @param {module:locale.LocaleEditorInit} editor
* @returns {undefined}
*/
export const init = (editor) => {
  editor_ = editor;
};

/**
* @typedef {PlainObject} module:locale.LangAndData
* @property {string} langParam
* @property {module:locale.LocaleStrings} langData
*/

/**
* @function module:locale.readLang
* @param {module:locale.LocaleStrings} langData See {@tutorial LocaleDocs}
* @fires module:svgcanvas.SvgCanvas#event:ext-addLangData
* @returns {Promise} Resolves to [`LangAndData`]{@link module:locale.LangAndData}
*/
export const readLang = async function (langData) {
  const more = await editor_.addLangData(langParam);
  $.each(more, function (i, m) {
    if (m.data) {
      langData = $.merge(langData, m.data);
    }
  });

  // Old locale file, do nothing for now.
  if (!langData.tools) { return; }

  const {
    tools,
    // misc,
    properties, config, layers, common, ui
  } = langData;

  setStrings('content', {
    // copyrightLabel: misc.powered_by, // Currently commented out in svg-editor.html
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
    includedImages: config.included_images,

    largest_object: tools.largest_object,

    layersLabel: layers.layers,
    page: tools.page,
    relativeToLabel: tools.relativeTo,
    selLayerLabel: layers.move_elems_to,
    selectedPredefined: config.select_predefined,

    selected_objects: tools.selected_objects,
    smallest_object: tools.smallest_object,
    straight_segments: properties.straight_segments,

    svginfo_bg_url: config.editor_img_url + ':',
    svginfo_bg_note: config.editor_bg_note,
    svginfo_change_background: config.background,
    svginfo_dim: config.doc_dims,
    svginfo_editor_prefs: config.editor_prefs,
    svginfo_height: common.height,
    svginfo_icons: config.icon_size,
    svginfo_image_props: config.image_props,
    svginfo_lang: config.language,
    svginfo_title: config.doc_title,
    svginfo_width: common.width,

    tool_docprops_cancel: common.cancel,
    tool_docprops_save: common.ok,

    tool_source_cancel: common.cancel,
    tool_source_save: common.ok,

    tool_prefs_cancel: common.cancel,
    tool_prefs_save: common.ok,

    sidepanel_handle: layers.layers.split('').join(' '),

    tool_clear: tools.new_doc,
    tool_docprops: tools.docprops,
    tool_export: tools.export_img,
    tool_import: tools.import_doc,
    tool_open: tools.open_doc,
    tool_save: tools.save_doc,

    svginfo_units_rulers: config.units_and_rulers,
    svginfo_rulers_onoff: config.show_rulers,
    svginfo_unit: config.base_unit,

    svginfo_grid_settings: config.grid,
    svginfo_snap_onoff: config.snapping_onoff,
    svginfo_snap_step: config.snapping_stepsize,
    svginfo_grid_color: config.grid_color
  }, true);

  // Context menus
  const opts = {};
  $.each(['cut', 'copy', 'paste', 'paste_in_place', 'delete', 'group', 'ungroup', 'move_front', 'move_up', 'move_down', 'move_back'], function () {
    opts['#cmenu_canvas a[href="#' + this + '"]'] = tools[this];
  });

  $.each(['dupe', 'merge_down', 'merge_all'], function () {
    opts['#cmenu_layers a[href="#' + this + '"]'] = layers[this];
  });

  opts['#cmenu_layers a[href="#delete"]'] = layers.del;

  setStrings('content', opts);

  setStrings('title', {
    align_relative_to: tools.align_relative_to,
    circle_cx: properties.circle_cx,
    circle_cy: properties.circle_cy,
    circle_r: properties.circle_r,
    cornerRadiusLabel: properties.corner_radius,
    ellipse_cx: properties.ellipse_cx,
    ellipse_cy: properties.ellipse_cy,
    ellipse_rx: properties.ellipse_rx,
    ellipse_ry: properties.ellipse_ry,
    fill_color: properties.fill_color,
    font_family: properties.font_family,
    idLabel: properties.id,
    image_height: properties.image_height,
    image_url: properties.image_url,
    image_width: properties.image_width,
    layer_delete: layers.del,
    layer_down: layers.move_down,
    layer_new: layers['new'],
    layer_rename: layers.rename,
    layer_moreopts: common.more_opts,
    layer_up: layers.move_up,
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
    main_icon: tools.main_menu,
    palette: ui.palette_info,
    zoom_panel: ui.zoom_level,
    path_node_x: properties.node_x,
    path_node_y: properties.node_y,
    rect_height_tool: properties.rect_height,
    rect_width_tool: properties.rect_width,
    seg_type: properties.seg_type,
    selLayerNames: layers.move_selected,
    selected_x: properties.pos_x,
    selected_y: properties.pos_y,
    stroke_color: properties.stroke_color,
    stroke_style: properties.stroke_style,
    stroke_width: properties.stroke_width,
    svginfo_title: config.doc_title,
    text: properties.text_contents,
    toggle_stroke_tools: ui.toggle_stroke_tools,
    tool_add_subpath: tools.add_subpath,
    tool_alignbottom: tools.align_bottom,
    tool_aligncenter: tools.align_center,
    tool_alignleft: tools.align_left,
    tool_alignmiddle: tools.align_middle,
    tool_alignright: tools.align_right,
    tool_aligntop: tools.align_top,
    tool_angle: properties.angle,
    tool_blur: properties.blur,
    tool_bold: properties.bold,
    tool_circle: tools.mode_circle,
    tool_clone: tools.clone,
    tool_clone_multi: tools.clone,
    tool_delete: tools.del,
    tool_delete_multi: tools.del,
    tool_ellipse: tools.mode_ellipse,
    tool_fhellipse: tools.mode_fhellipse,
    tool_fhpath: tools.mode_fhpath,
    tool_fhrect: tools.mode_fhrect,
    tool_font_size: properties.font_size,
    tool_group_elements: tools.group_elements,
    tool_make_link: tools.make_link,
    tool_link_url: tools.set_link_url,
    tool_image: tools.mode_image,
    tool_italic: properties.italic,
    tool_line: tools.mode_line,
    tool_move_bottom: tools.move_bottom,
    tool_move_top: tools.move_top,
    tool_node_clone: tools.node_clone,
    tool_node_delete: tools.node_delete,
    tool_node_link: tools.node_link,
    tool_opacity: properties.opacity,
    tool_openclose_path: tools.openclose_path,
    tool_path: tools.mode_path,
    tool_position: tools.align_to_page,
    tool_rect: tools.mode_rect,
    tool_redo: tools.redo,
    tool_reorient: tools.reorient_path,
    tool_select: tools.mode_select,
    tool_source: tools.source_save,
    tool_square: tools.mode_square,
    tool_text: tools.mode_text,
    tool_topath: tools.to_path,
    tool_undo: tools.undo,
    tool_ungroup: tools.ungroup,
    tool_wireframe: tools.wireframe_mode,
    tool_zoom: tools.mode_zoom,
    url_notice: tools.no_embed

  }, true);

  return {langParam, langData};
};

/**
* @function module:locale.putLocale
* @param {string} givenParam
* @param {string[]} goodLangs
* @param {{langPath: string}} conf
* @fires module:svgcanvas.SvgCanvas#event:ext-addLangData
* @fires module:svgcanvas.SvgCanvas#event:ext-langReady
* @fires module:svgcanvas.SvgCanvas#event:ext-langChanged
* @returns {Promise} Resolves to result of {@link module:locale.readLang}
*/
export const putLocale = async function (givenParam, goodLangs, conf) {
  if (givenParam) {
    langParam = givenParam;
  } else {
    langParam = $.pref('lang');
    if (!langParam) {
      if (navigator.userLanguage) { // Explorer
        langParam = navigator.userLanguage;
      } else if (navigator.language) { // FF, Opera, ...
        langParam = navigator.language;
      }
    }

    console.log('Lang: ' + langParam);

    // Set to English if language is not in list of good langs
    if (!goodLangs.includes(langParam) && langParam !== 'test') {
      langParam = 'en';
    }

    // don't bother on first run if language is English
    // The following line prevents setLang from running
    //    extensions which depend on updated uiStrings,
    //    so commenting it out.
    // if (langParam.startsWith('en')) {return;}
  }

  const url = conf.langPath + 'lang.' + langParam + '.js';
  return readLang(
    // Todo: Replace this with `return import(url);` when
    //   `import()` widely supported
    await importSetGlobalDefault(url, {
      global: 'svgEditorLang_' + langParam.replace(/-/g, '_')
    })
  );
};
