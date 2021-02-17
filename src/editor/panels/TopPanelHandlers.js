/* globals $ */
import SvgCanvas from '../../svgcanvas/svgcanvas.js';
import {isValidUnit, getTypeMap, convertUnit} from '../../common/units.js';

const {$id, isNullish} = SvgCanvas;

/*
 * register actions for left panel
 */
/**
 *
 */
class TopPanelHandlers {
  /**
   * @param {PlainObject} editor svgedit handler
  */
  constructor (editor) {
    this.editor = editor;
    this.svgCanvas = editor.svgCanvas;
    this.uiStrings = editor.uiStrings;
  }
  /**
   * @type {module}
   */
  get selectedElement () {
    return this.editor.selectedElement;
  }
  /**
   * @type {module}
   */
  get multiselected () {
    return this.editor.multiselected;
  }
  /**
   * @type {module}
   */
  get path () {
    return this.svgCanvas.pathActions;
  }
  /**
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.cancelDeletes=false]
   * @returns {void} Resolves to `undefined`
   */
  promptImgURL ({cancelDeletes = false} = {}) {
    let curhref = this.svgCanvas.getHref(this.selectedElement);
    curhref = curhref.startsWith('data:') ? '' : curhref;
    // eslint-disable-next-line no-alert
    const url = prompt(this.editor.uiStrings.notification.enterNewImgURL, curhref);
    if (url) {
      this.editor.setImageURL(url);
    } else if (cancelDeletes) {
      this.svgCanvas.deleteSelectedElements();
    }
  }
  /**
  * Updates the context panel tools based on the selected element.
  * @returns {void}
  */
  updateContextPanel () {
    const setInputWidth = (elem) => {
      const w = Math.min(Math.max(12 + elem.value.length * 6, 50), 300);
      $(elem).width(w);
    };

    let elem = this.selectedElement;
    // If element has just been deleted, consider it null
    if (!isNullish(elem) && !elem.parentNode) { elem = null; }
    const currentLayerName = this.svgCanvas.getCurrentDrawing().getCurrentLayerName();
    const currentMode = this.svgCanvas.getMode();
    const unit = this.editor.configObj.curConfig.baseUnit !== 'px' ? this.editor.configObj.curConfig.baseUnit : null;

    const isNode = currentMode === 'pathedit'; // elem ? (elem.id && elem.id.startsWith('pathpointgrip')) : false;
    const menuItems = document.getElementById('se-cmenu_canvas');
    $('#selected_panel, #multiselected_panel, #g_panel, #rect_panel, #circle_panel,' +
  '#ellipse_panel, #line_panel, #text_panel, #image_panel, #container_panel,' +
  ' #use_panel, #a_panel').hide();
    if (!isNullish(elem)) {
      const elname = elem.nodeName;
      // If this is a link with no transform and one child, pretend
      // its child is selected
      // if (elname === 'a') { // && !$(elem).attr('transform')) {
      //   elem = elem.firstChild;
      // }

      const angle = this.svgCanvas.getRotationAngle(elem);
      $('#angle').val(angle);

      const blurval = this.svgCanvas.getBlur(elem) * 10;
      $id('blur').value = blurval;

      if (this.svgCanvas.addedNew &&
      elname === 'image' &&
      this.svgCanvas.getMode() === 'image' &&
      !this.svgCanvas.getHref(elem).startsWith('data:')) {
      /* await */ this.promptImgURL({cancelDeletes: true});
      }

      if (!isNode && currentMode !== 'pathedit') {
        $('#selected_panel').show();
        // Elements in this array already have coord fields
        if (['line', 'circle', 'ellipse'].includes(elname)) {
          $('#xy_panel').hide();
        } else {
          let x, y;

          // Get BBox vals for g, polyline and path
          if (['g', 'polyline', 'path'].includes(elname)) {
            const bb = this.svgCanvas.getStrokedBBox([elem]);
            if (bb) {
              ({x, y} = bb);
            }
          } else {
            x = elem.getAttribute('x');
            y = elem.getAttribute('y');
          }

          if (unit) {
            x = convertUnit(x);
            y = convertUnit(y);
          }

          $('#selected_x').val(x || 0);
          $('#selected_y').val(y || 0);
          $('#xy_panel').show();
        }

        // Elements in this array cannot be converted to a path
        $id('tool_topath').style.display = ['image', 'text', 'path', 'g', 'use'].includes(elname) ? 'none' : 'block';
        $id('tool_reorient').style.display = (elname === 'path') ? 'block' : 'none';
        $id('tool_reorient').disabled = (angle === 0);
      } else {
        const point = this.path.getNodePoint();
        $('#tool_add_subpath').pressed = false;
        $('#tool_node_delete').toggleClass('disabled', !this.path.canDeleteNodes);

        // Show open/close button based on selected point
        // setIcon('#tool_openclose_path', path.closed_subpath ? 'open_path' : 'close_path');

        if (point) {
          const segType = $('#seg_type');
          if (unit) {
            point.x = convertUnit(point.x);
            point.y = convertUnit(point.y);
          }
          $('#path_node_x').val(point.x);
          $('#path_node_y').val(point.y);
          if (point.type) {
            segType.val(point.type).removeAttr('disabled');
          } else {
            segType.val(4).attr('disabled', 'disabled');
          }
        }
        return;
      }

      // update contextual tools here
      const panels = {
        g: [],
        a: [],
        rect: ['rx', 'width', 'height'],
        image: ['width', 'height'],
        circle: ['cx', 'cy', 'r'],
        ellipse: ['cx', 'cy', 'rx', 'ry'],
        line: ['x1', 'y1', 'x2', 'y2'],
        text: [],
        use: []
      };

      const {tagName} = elem;

      // if ($(elem).data('gsvg')) {
      //   $('#g_panel').show();
      // }

      let linkHref = null;
      if (tagName === 'a') {
        linkHref = this.svgCanvas.getHref(elem);
        $('#g_panel').show();
      }

      if (elem.parentNode.tagName === 'a' && !$(elem).siblings().length) {
        $('#a_panel').show();
        linkHref = this.svgCanvas.getHref(elem.parentNode);
      }

      // Hide/show the make_link buttons
      $('#tool_make_link, #tool_make_link_multi').toggle(!linkHref);

      if (linkHref) {
        $('#link_url').val(linkHref);
      }

      if (panels[tagName]) {
        const curPanel = panels[tagName];

        $('#' + tagName + '_panel').show();

        curPanel.forEach((item) => {
          let attrVal = elem.getAttribute(item);
          if (this.editor.configObj.curConfig.baseUnit !== 'px' && elem[item]) {
            const bv = elem[item].baseVal.value;
            attrVal = convertUnit(bv);
          }
          $id(`${tagName}_${item}`).value = attrVal || 0;
        });

        if (tagName === 'text') {
          $('#text_panel').css('display', 'inline');
          $('#tool_font_size').css('display', 'inline');
          $id('tool_italic').pressed = this.svgCanvas.getItalic();
          $id('tool_bold').pressed = this.svgCanvas.getBold();
          $('#tool_font_family').val(elem.getAttribute('font-family'));
          $('#font_size').val(elem.getAttribute('font-size'));
          $('#text').val(elem.textContent);
          const textAnchorStart = $id('tool_text_anchor_start');
          const textAnchorMiddle = $id('tool_text_anchor_middle');
          const textAnchorEnd = $id('tool_text_anchor_end');
          switch (elem.getAttribute('text-anchor')) {
          case 'start':
            textAnchorStart.pressed = true;
            textAnchorMiddle.pressed = false;
            textAnchorEnd.pressed = false;
            break;
          case 'middle':
            textAnchorStart.pressed = false;
            textAnchorMiddle.pressed = true;
            textAnchorEnd.pressed = false;
            break;
          case 'end':
            textAnchorStart.pressed = false;
            textAnchorMiddle.pressed = false;
            textAnchorEnd.pressed = true;
            break;
          }
          if (this.svgCanvas.addedNew) {
            // Timeout needed for IE9
            setTimeout(() => {
              $('#text').focus().select();
            }, 100);
          }
        // text
        } else if (tagName === 'image' && this.svgCanvas.getMode() === 'image') {
          this.svgCanvas.setImageURL(this.svgCanvas.getHref(elem));
        // image
        } else if (tagName === 'g' || tagName === 'use') {
          $('#container_panel').show();
          const title = this.svgCanvas.getTitle();
          const label = $('#g_title')[0];
          label.value = title;
          setInputWidth(label);
          $('#g_title').prop('disabled', tagName === 'use');
        }
      }
      menuItems.setAttribute((tagName === 'g' ? 'en' : 'dis') + 'ablemenuitems', '#ungroup');
      menuItems.setAttribute(((tagName === 'g' || !this.multiselected) ? 'dis' : 'en') + 'ablemenuitems', '#group');

    // if (!isNullish(elem))
    } else if (this.multiselected) {
      $('#multiselected_panel').show();
      menuItems.setAttribute('enablemenuitems', '#group');
      menuItems.setAttribute('disablemenuitems', '#ungroup');
    } else {
      menuItems.setAttribute('disablemenuitems', '#delete,#cut,#copy,#group,#ungroup,#move_front,#move_up,#move_down,#move_back');
    }

    // update history buttons
    $id('tool_undo').disabled = (this.svgCanvas.undoMgr.getUndoStackSize() === 0);
    $id('tool_redo').disabled = (this.svgCanvas.undoMgr.getRedoStackSize() === 0);

    this.svgCanvas.addedNew = false;

    if ((elem && !isNode) || this.multiselected) {
      // update the selected elements' layer
      $('#selLayerNames').removeAttr('disabled').val(currentLayerName);

      // Enable regular menu options
      const canCMenu = document.getElementById('se-cmenu_canvas');
      canCMenu.setAttribute('enablemenuitems', '#delete,#cut,#copy,#move_front,#move_up,#move_down,#move_back');
    } else {
      $('#selLayerNames').attr('disabled', 'disabled');
    }
  }
  /**
  * @param {Event} [e] Not used.
  * @param {boolean} forSaving
  * @returns {void}
  */
  showSourceEditor (e, forSaving) {
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    if ($editorDialog.getAttribute('dialog') === 'open') return;
    const origSource = this.svgCanvas.getSvgString();
    $editorDialog.setAttribute('dialog', 'open');
    $editorDialog.setAttribute('value', origSource);
    $editorDialog.setAttribute('copysec', Boolean(forSaving));
    $editorDialog.setAttribute('applysec', !forSaving);
  }
  /**
  *
  * @returns {void}
  */
  clickWireframe () {
    $id('tool_wireframe').pressed = !$id('tool_wireframe').pressed;
    this.editor.workarea.toggleClass('wireframe');

    const wfRules = $('#wireframe_rules');
    if (!wfRules.length) {
    /* wfRules = */ $('<style id="wireframe_rules"></style>').appendTo('head');
    } else {
      wfRules.empty();
    }
    this.editor.updateWireFrame();
  }
  /**
  *
  * @returns {void}
  */
  clickUndo () {
    const {undoMgr} = this.editor.svgCanvas;
    if (undoMgr.getUndoStackSize() > 0) {
      undoMgr.undo();
      this.editor.layersPanel.populateLayers();
    }
  }

  /**
  *
  * @returns {void}
  */
  clickRedo () {
    const {undoMgr} = this.editor.svgCanvas;
    if (undoMgr.getRedoStackSize() > 0) {
      undoMgr.redo();
      this.editor.layersPanel.populateLayers();
    }
  }
  /**
  * @type {module}
  */
  changeRectRadius (e) {
    this.svgCanvas.setRectRadius(e.target.value);
  }

  /**
* @type {module}
*/
  changeFontSize (e) {
    this.svgCanvas.setFontSize(e.target.value);
  }

  /**
* @type {module}
*/
  changeRotationAngle (e) {
    this.svgCanvas.setRotationAngle(e.target.value);
    $('#tool_reorient').toggleClass('disabled', Number.parseInt(e.target.value) === 0);
  }

  /**
* @param {PlainObject} e
* @returns {void}
*/
  changeBlur (e) {
    this.svgCanvas.setBlur(e.target.value / 10, true);
  }
  /**
  *
  * @returns {void}
  */
  clickGroup () {
  // group
    if (this.editor.multiselected) {
      this.svgCanvas.groupSelectedElements();
      // ungroup
    } else if (this.editor.selectedElement) {
      this.svgCanvas.ungroupSelectedElement();
    }
  }

  /**
*
* @returns {void}
*/
  clickClone () {
    this.svgCanvas.cloneSelectedElements(20, 20);
  }

  /**
* @param {PlainObject} evt
* @returns {void}
*/
  clickAlignEle (evt) {
    this.svgCanvas.alignSelectedElements(evt.detail.value, 'page');
  }

  /**
* @param {string} pos indicate the alignment relative to top, bottom, middle etc..
* @returns {void}
*/
  clickAlign (pos) {
    let value = $('#tool_align_relative').val();
    if(value === ''){
      value = 'selected';
    }
    this.svgCanvas.alignSelectedElements(pos, value);
  }
  /**
*
* @type {module}
*/
  attrChanger (e) {
    const attr = e.target.getAttribute('data-attr');
    let val = e.target.value;
    const valid = isValidUnit(attr, val, this.selectedElement);

    if (!valid) {
      e.target.value = this.selectedElement().getAttribute(attr);
      // eslint-disable-next-line no-alert
      alert(this.uiStrings.notification.invalidAttrValGiven);
      return false;
    }

    if (attr !== 'id' && attr !== 'class') {
      if (isNaN(val)) {
        val = this.svgCanvas.convertToNum(attr, val);
      } else if (this.editor.configObj.curConfig.baseUnit !== 'px') {
        // Convert unitless value to one with given unit

        const unitData = getTypeMap();

        if (this.selectedElement[attr] || this.svgCanvas.getMode() === 'pathedit' || attr === 'x' || attr === 'y') {
          val *= unitData[this.editor.configObj.curConfig.baseUnit];
        }
      }
    }

    // if the user is changing the id, then de-select the element first
    // change the ID, then re-select it with the new ID
    if (attr === 'id') {
      const elem = this.selectedElement;
      this.svgCanvas.clearSelection();
      elem.id = val;
      this.svgCanvas.addToSelection([elem], true);
    } else {
      this.svgCanvas.changeSelectedAttribute(attr, val);
    }
    return true;
  }
  /**
  *
  * @returns {void}
  */
  convertToPath () {
    if (!isNullish(this.selectedElement)) {
      this.svgCanvas.convertToPath();
    }
  }
  /**
  *
  * @returns {void}
  */
  reorientPath () {
    if (!isNullish(this.selectedElement)) {
      this.path.reorient();
    }
  }
  /**
  *
  * @returns {void} Resolves to `undefined`
  */
  makeHyperlink () {
    if (!isNullish(this.selectedElement) || this.multiselected) {
      // eslint-disable-next-line no-alert
      const url = prompt(this.uiStrings.notification.enterNewLinkURL, 'http://');
      if (url) {
        this.svgCanvas.makeHyperlink(url);
      }
    }
  }
  /**
  *
  * @returns {void}
  */
  linkControlPoints () {
    const linked = $id('tool_node_link').pressed;
    $id('tool_node_link').pressed = !linked;
    this.path.linkControlPoints(linked);
  }

  /**
*
* @returns {void}
*/
  clonePathNode () {
    if (this.path.getNodePoint()) {
      this.path.clonePathNode();
    }
  }

  /**
*
* @returns {void}
*/
  deletePathNode () {
    if (this.path.getNodePoint()) {
      this.path.deletePathNode();
    }
  }

  /**
*
* @returns {void}
*/
  addSubPath () {
    const button = $('#tool_add_subpath');
    const sp = !button.hasClass('pressed');
    button.pressed = sp;
    // button.toggleClass('push_button_pressed tool_button');
    this.path.addSubPath(sp);
  }

  /**
*
* @returns {void}
*/
  opencloseSubPath () {
    this.path.opencloseSubPath();
  }
  /**
  * Delete is a contextual tool that only appears in the ribbon if
  * an element has been selected.
  * @returns {void}
  */
  deleteSelected () {
    if (!isNullish(this.selectedElement) || this.multiselected) {
      this.svgCanvas.deleteSelectedElements();
    }
  }
  /**
  *
  * @returns {void}
  */
  moveToTopSelected () {
    if (!isNullish(this.selectedElement)) {
      this.svgCanvas.moveToTopSelectedElement();
    }
  }

  /**
*
* @returns {void}
*/
  moveToBottomSelected () {
    if (!isNullish(this.selectedElement)) {
      this.svgCanvas.moveToBottomSelectedElement();
    }
  }
  /**
  *
  * @returns {false}
  */
  clickBold () {
    this.svgCanvas.setBold(!this.svgCanvas.getBold());
    this.updateContextPanel();
    return false;
  }

  /**
*
* @returns {false}
*/
  clickItalic () {
    this.svgCanvas.setItalic(!this.svgCanvas.getItalic());
    this.updateContextPanel();
    return false;
  }

  /**
 *
 * @param {string} value "start","end" or "middle"
 * @returns {false}
 */
  clickTextAnchor (value) {
    this.svgCanvas.setTextAnchor(value);
    this.updateContextPanel();
    return false;
  }

  /**
   * @type {module}
   */
  init () {
    // svg editor source dialoag added to DOM
    const newSeEditorDialog = document.createElement('se-svg-source-editor-dialog');
    newSeEditorDialog.setAttribute('id', 'se-svg-editor-dialog');
    document.body.append(newSeEditorDialog);
    // register action to top panel buttons
    $id('tool_source').addEventListener('click', this.showSourceEditor.bind(this));
    $id('tool_wireframe').addEventListener('click', this.clickWireframe.bind(this));
    $id('tool_undo').addEventListener('click', this.clickUndo.bind(this));
    $id('tool_redo').addEventListener('click', this.clickRedo.bind(this));
    $id('tool_clone').addEventListener('click', this.clickClone.bind(this));
    $id('tool_clone_multi').addEventListener('click', this.clickClone.bind(this));
    $id('tool_delete').addEventListener('click', this.deleteSelected.bind(this));
    $id('tool_delete_multi').addEventListener('click', this.deleteSelected.bind(this));
    $id('tool_move_top').addEventListener('click', this.moveToTopSelected.bind(this));
    $id('tool_move_bottom').addEventListener('click', this.moveToBottomSelected.bind(this));
    $id('tool_topath').addEventListener('click', this.convertToPath.bind(this));
    $id('tool_make_link').addEventListener('click', this.makeHyperlink.bind(this));
    $id('tool_make_link_multi').addEventListener('click', this.makeHyperlink.bind(this));
    $id('tool_reorient').addEventListener('click', this.reorientPath.bind(this));
    $id('tool_group_elements').addEventListener('click', this.clickGroup.bind(this));
    $id('tool_position').addEventListener('change', (evt) => this.clickAlignEle.bind(this)(evt));
    $id('tool_align_left').addEventListener('click', () => this.clickAlign.bind(this)('left'));
    $id('tool_align_right').addEventListener('click', () => this.clickAlign.bind(this)('right'));
    $id('tool_align_center').addEventListener('click', () => this.clickAlign.bind(this)('center'));
    $id('tool_align_top').addEventListener('click', () => this.clickAlign.bind(this)('top'));
    $id('tool_align_bottom').addEventListener('click', () => this.clickAlign.bind(this)('bottom'));
    $id('tool_align_middle').addEventListener('click', () => this.clickAlign.bind(this)('middle'));
    $id('tool_node_clone').addEventListener('click', this.clonePathNode.bind(this));
    $id('tool_node_delete').addEventListener('click', this.deletePathNode.bind(this));
    $id('tool_openclose_path').addEventListener('click', this.opencloseSubPath.bind(this));
    $id('tool_add_subpath').addEventListener('click', this.addSubPath.bind(this));
    $id('tool_node_link').addEventListener('click', this.linkControlPoints.bind(this));
    $id('angle').addEventListener('change', this.changeRotationAngle.bind(this));
    $id('blur').addEventListener('change', this.changeBlur.bind(this));
    $id('rect_rx').addEventListener('change', this.changeRectRadius.bind(this));
    $id('font_size').addEventListener('change', this.changeFontSize.bind(this));
    $id('tool_ungroup').addEventListener('click', this.clickGroup.bind(this));
    $id('tool_bold').addEventListener('click', this.clickBold.bind(this));
    $id('tool_italic').addEventListener('click', this.clickItalic.bind(this));
    $id('tool_text_anchor_start').addEventListener('click', () => this.clickTextAnchor.bind(this)('start'));
    $id('tool_text_anchor_middle').addEventListener('click', () => this.clickTextAnchor.bind(this)('middle'));
    $id('tool_text_anchor_end').addEventListener('click', () => this.clickTextAnchor.bind(this)('end'));
    $id('tool_unlink_use').addEventListener('click', this.clickGroup.bind(this));
    $id('change_image_url').addEventListener('click', this.promptImgURL.bind(this));
    // all top panel attributes
    ['elem_id', 'elem_class', 'circle_cx', 'circle_cy', 'circle_r', 'ellipse_cx',
      'ellipse_cy', 'ellipse_rx', 'ellipse_ry', 'selected_x', 'selected_y', 'rect_width',
      'rect_height', 'line_x1', 'line_x2', 'line_y2', 'image_width', 'image_height', 'path_node_x',
      'path_node_y'].forEach((attrId) => $id(attrId).addEventListener('change', this.attrChanger.bind(this)));
  }
}

export default TopPanelHandlers;
