/* globals seAlert */

import SvgCanvas from "../../svgcanvas/svgcanvas.js";
import { isValidUnit, getTypeMap, convertUnit } from "../../common/units.js";

const { $qa, $id } = SvgCanvas;

/*
 * register actions for left panel
 */
/**
 *
 */
class TopPanel {
  /**
   * @param {PlainObject} editor svgedit handler
   */
  constructor(editor) {
    this.editor = editor;
  }
  /**
   * @type {module}
   */
  displayTool(className) {
    // default display is 'none' so removing the property will make the panel visible
    $qa(`.${className}`).map( (el) => el.style.removeProperty('display'));
  }
  /**
   * @type {module}
   */
  hideTool(className) {
    $qa(`.${className}`).map( (el) => el.style.display = 'none');
  }
  /**
   * @type {module}
   */
  get selectedElement() {
    return this.editor.selectedElement;
  }
  /**
   * @type {module}
   */
  get multiselected() {
    return this.editor.multiselected;
  }
  /**
   * @type {module}
   */
  get path() {
    return this.editor.svgCanvas.pathActions;
  }

  /**
   *
   * @param {Element} opt
   * @param {boolean} changeElem
   * @returns {void}
   */
  setStrokeOpt(opt, changeElem) {
    const { id } = opt;
    const bits = id.split('_');
    const [ pre, val ] = bits;

    if (changeElem) {
      this.svgCanvas.setStrokeAttr('stroke-' + pre, val);
    }
    opt.classList.add('current');
    const elements = Array.prototype.filter.call(opt.parentNode.children, function (child) {
      return child !== opt;
    });
    Array.from(elements).forEach(function (element) {
      element.classList.remove('current');
    });
  }

  /**
   * Updates the toolbar (colors, opacity, etc) based on the selected element.
   * This function also updates the opacity and id elements that are in the
   * context panel.
   * @returns {void}
   */
  update() {
    let i; let len;
    if (this.selectedElement) {
      switch (this.selectedElement.tagName) {
      case "use":
      case "image":
      case "foreignObject":
        break;
      case "g":
      case "a": {
        // Look for common styles
        const childs = this.selectedElement.getElementsByTagName("*");
        let gWidth = null;
        for (i = 0, len = childs.length; i < len; i++) {
          const swidth = childs[i].getAttribute("stroke-width");

          if (i === 0) {
            gWidth = swidth;
          } else if (gWidth !== swidth) {
            gWidth = null;
          }
        }

        $id("stroke_width").value = (gWidth === null ? "" : gWidth);
        this.editor.bottomPanel.updateColorpickers(true);
        break;
      }
      default: {
        this.editor.bottomPanel.updateColorpickers(true);

        $id("stroke_width").value = this.selectedElement.getAttribute("stroke-width") || 1;
        $id("stroke_style").value = this.selectedElement.getAttribute("stroke-dasharray") || "none";
        $id("stroke_style").setAttribute("value", $id("stroke_style").value);

        let attr =
            this.selectedElement.getAttribute("stroke-linejoin") || "miter";

        if ($id("linejoin_" + attr)) {
          this.setStrokeOpt($id("linejoin_" + attr));
          $id("stroke_linejoin").setAttribute("value", attr);
        }

        attr = this.selectedElement.getAttribute("stroke-linecap") || "butt";
        if ($id("linecap_" + attr)) {
          this.setStrokeOpt($id("linecap_" + attr));
          $id("stroke_linecap").setAttribute("value", attr);
        }
      }
      }
    }

    // All elements including image and group have opacity
    if (this.selectedElement) {
      const opacPerc =
        (this.selectedElement.getAttribute("opacity") || 1.0) * 100;
      $id("opacity").value = opacPerc;
      $id("elem_id").value = this.selectedElement.id;
      $id("elem_class").value = this.selectedElement.getAttribute("class") ?? "";
    }

    this.editor.bottomPanel.updateToolButtonState();
  }
  /**
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.cancelDeletes=false]
   * @returns {void} Resolves to `undefined`
   */
  promptImgURL({ cancelDeletes = false } = {}) {
    let curhref = this.editor.svgCanvas.getHref(this.editor.selectedElement);
    curhref = curhref.startsWith("data:") ? "" : curhref;
    // eslint-disable-next-line no-alert
    const url = prompt(
      this.editor.i18next.t('notification.enterNewImgURL'),
      curhref
    );
    if (url) {
      this.setImageURL(url);
    } else if (cancelDeletes) {
      this.editor.svgCanvas.deleteSelectedElements();
    }
  }
  /**
   * Updates the context panel tools based on the selected element.
   * @returns {void}
   */
  updateContextPanel() {
    let elem = this.editor.selectedElement;
    // If element has just been deleted, consider it null
    if (!elem?.parentNode) {
      elem = null;
    }
    const currentLayerName = this.editor.svgCanvas
      .getCurrentDrawing()
      .getCurrentLayerName();
    const currentMode = this.editor.svgCanvas.getMode();
    const unit =
      this.editor.configObj.curConfig.baseUnit !== "px"
        ? this.editor.configObj.curConfig.baseUnit
        : null;

    const isNode = currentMode === "pathedit"; // elem ? (elem.id && elem.id.startsWith('pathpointgrip')) : false;
    const menuItems = document.getElementById("se-cmenu_canvas");
    this.hideTool("selected_panel");
    this.hideTool("multiselected_panel");
    this.hideTool("g_panel");
    this.hideTool("rect_panel");
    this.hideTool("circle_panel");
    this.hideTool("ellipse_panel");
    this.hideTool("line_panel");
    this.hideTool("text_panel");
    this.hideTool("image_panel");
    this.hideTool("container_panel");
    this.hideTool("use_panel");
    this.hideTool("a_panel");
    this.hideTool("xy_panel");
    if (elem) {
      const elname = elem.nodeName;

      const angle = this.editor.svgCanvas.getRotationAngle(elem);
      $id("angle").value = angle;

      const blurval = this.editor.svgCanvas.getBlur(elem) * 10;
      $id("blur").value = blurval;

      if (
        this.editor.svgCanvas.addedNew &&
        elname === "image" &&
        this.editor.svgCanvas.getMode() === "image" &&
        !this.editor.svgCanvas.getHref(elem).startsWith("data:")
      ) {
        /* await */ this.promptImgURL({ cancelDeletes: true });
      }

      if (!isNode && currentMode !== "pathedit") {
        this.displayTool("selected_panel");
        // Elements in this array already have coord fields
        if ([ "line", "circle", "ellipse" ].includes(elname)) {
          this.hideTool("xy_panel");
        } else {
          let x; let y;

          // Get BBox vals for g, polyline and path
          if ([ "g", "polyline", "path" ].includes(elname)) {
            const bb = this.editor.svgCanvas.getStrokedBBox([ elem ]);
            if (bb) {
              ({ x, y } = bb);
            }
          } else {
            x = elem.getAttribute("x");
            y = elem.getAttribute("y");
          }

          if (unit) {
            x = convertUnit(x);
            y = convertUnit(y);
          }

          $id("selected_x").value = (x || 0);
          $id("selected_y").value = (y || 0);
          this.displayTool("xy_panel");
        }

        // Elements in this array cannot be converted to a path
        if ([
          "image",
          "text",
          "path",
          "g",
          "use"
        ].includes(elname)) {
          this.hideTool("tool_topath");
        } else {
          this.displayTool("tool_topath");
        }
        if (elname === "path") {
          this.displayTool("tool_reorient");
        } else {
          this.hideTool("tool_reorient");
        }
        $id("tool_reorient").disabled = (angle === 0);
      } else {
        const point = this.path.getNodePoint();
        $id("tool_add_subpath").pressed = false;
        // eslint-disable-next-line max-len
        (!this.path.canDeleteNodes) ? $id("tool_node_delete").classList.add("disabled") : $id("tool_node_delete").classList.remove("disabled");

        // Show open/close button based on selected point
        // setIcon('#tool_openclose_path', path.closed_subpath ? 'open_path' : 'close_path');

        if (point) {
          const segType = $id("seg_type");
          if (unit) {
            point.x = convertUnit(point.x);
            point.y = convertUnit(point.y);
          }
          $id("path_node_x").value = (point.x);
          $id("path_node_y").value = (point.y);
          if (point.type) {
            segType.value = (point.type);
            segType.removeAttribute("disabled");
          } else {
            segType.value = 4;
            segType.setAttribute("disabled", "disabled");
          }
        }
        return;
      }

      // update contextual tools here
      const panels = {
        g: [],
        a: [],
        rect: [ "rx", "width", "height" ],
        image: [ "width", "height" ],
        circle: [ "cx", "cy", "r" ],
        ellipse: [ "cx", "cy", "rx", "ry" ],
        line: [ "x1", "y1", "x2", "y2" ],
        text: [],
        use: []
      };

      const { tagName } = elem;

      let linkHref = null;
      if (tagName === "a") {
        linkHref = this.editor.svgCanvas.getHref(elem);
        this.displayTool("g_panel");
      }
      // siblings
      if (elem.parentNode) {
        const selements = Array.prototype.filter.call(elem.parentNode.children, function (child) {
          return child !== elem;
        });
        if (elem.parentNode.tagName === "a" && !selements.length) {
          this.displayTool("a_panel");
          linkHref = this.editor.svgCanvas.getHref(elem.parentNode);
        }
      }

      // Hide/show the make_link buttons
      if (linkHref) {
        this.displayTool('tool_make_link');
        this.displayTool('tool_make_link_multi');
        $id("link_url").value = linkHref;
      } else {
        this.hideTool('tool_make_link');
        this.hideTool('tool_make_link_multi');
      }

      if (panels[tagName]) {
        const curPanel = panels[tagName];
        this.displayTool(tagName + "_panel");

        curPanel.forEach((item) => {
          let attrVal = elem.getAttribute(item);
          if (this.editor.configObj.curConfig.baseUnit !== "px" && elem[item]) {
            const bv = elem[item].baseVal.value;
            attrVal = convertUnit(bv);
          }
          $id(`${tagName}_${item}`).value = attrVal || 0;
        });

        if (tagName === "text") {
          this.displayTool("text_panel");
          $id("tool_italic").pressed = this.editor.svgCanvas.getItalic();
          $id("tool_bold").pressed = this.editor.svgCanvas.getBold();
          $id("tool_font_family").setAttribute("value", elem.getAttribute("font-family"));
          $id("font_size").value = elem.getAttribute("font-size");
          $id("text").value = elem.textContent;
          const textAnchorStart = $id("tool_text_anchor_start");
          const textAnchorMiddle = $id("tool_text_anchor_middle");
          const textAnchorEnd = $id("tool_text_anchor_end");
          switch (elem.getAttribute("text-anchor")) {
          case "start":
            textAnchorStart.pressed = true;
            textAnchorMiddle.pressed = false;
            textAnchorEnd.pressed = false;
            break;
          case "middle":
            textAnchorStart.pressed = false;
            textAnchorMiddle.pressed = true;
            textAnchorEnd.pressed = false;
            break;
          case "end":
            textAnchorStart.pressed = false;
            textAnchorMiddle.pressed = false;
            textAnchorEnd.pressed = true;
            break;
          }
          if (this.editor.svgCanvas.addedNew) {
            // Timeout needed for IE9
            setTimeout(() => {
              $id("text").focus();
              $id("text").select();
            }, 100);
          }
          // text
        } else if (
          tagName === "image" &&
          this.editor.svgCanvas.getMode() === "image"
        ) {
          this.editor.svgCanvas.setImageURL(
            this.editor.svgCanvas.getHref(elem)
          );
          // image
        } else if (tagName === "g" || tagName === "use") {
          this.displayTool("container_panel");
          const title = this.editor.svgCanvas.getTitle();
          const label = $id("g_title");
          label.value = title;
          $id("g_title").disabled = (tagName === "use");
        }
      }
      menuItems.setAttribute(
        (tagName === "g" ? "en" : "dis") + "ablemenuitems",
        "#ungroup"
      );
      menuItems.setAttribute(
        (tagName === "g" || !this.multiselected ? "dis" : "en") +
        "ablemenuitems",
        "#group"
      );

      // if (!isNullish(elem))
    } else if (this.multiselected) {
      this.displayTool("multiselected_panel");
      menuItems.setAttribute("enablemenuitems", "#group");
      menuItems.setAttribute("disablemenuitems", "#ungroup");
    } else {
      menuItems.setAttribute(
        "disablemenuitems",
        "#delete,#cut,#copy,#group,#ungroup,#move_front,#move_up,#move_down,#move_back"
      );
    }

    // update history buttons
    $id("tool_undo").disabled =
      this.editor.svgCanvas.undoMgr.getUndoStackSize() === 0;
    $id("tool_redo").disabled =
      this.editor.svgCanvas.undoMgr.getRedoStackSize() === 0;

    this.editor.svgCanvas.addedNew = false;

    if ((elem && !isNode) || this.multiselected) {
      // update the selected elements' layer
      $id("selLayerNames").removeAttribute("disabled");
      $id("selLayerNames").value = currentLayerName;

      // Enable regular menu options
      const canCMenu = document.getElementById("se-cmenu_canvas");
      canCMenu.setAttribute(
        "enablemenuitems",
        "#delete,#cut,#copy,#move_front,#move_up,#move_down,#move_back"
      );
    } else {
      $id("selLayerNames").disabled = "disabled";
    }
  }
  /**
   * @param {Event} [e] Not used.
   * @param {boolean} forSaving
   * @returns {void}
   */
  showSourceEditor(e, forSaving) {
    const $editorDialog = document.getElementById("se-svg-editor-dialog");
    if ($editorDialog.getAttribute("dialog") === "open") return;
    const origSource = this.editor.svgCanvas.getSvgString();
    $editorDialog.setAttribute("dialog", "open");
    $editorDialog.setAttribute("value", origSource);
    $editorDialog.setAttribute("copysec", Boolean(forSaving));
    $editorDialog.setAttribute("applysec", !forSaving);
  }
  /**
   *
   * @returns {void}
   */
  clickWireframe() {
    $id("tool_wireframe").pressed = !$id("tool_wireframe").pressed;
    this.editor.workarea.classList.toggle("wireframe");

    const wfRules = $id("wireframe_rules");
    if (!wfRules) {
      const fcRules = document.createElement('style');
      fcRules.setAttribute('id', 'wireframe_rules');
      document.getElementsByTagName("head")[0].appendChild(fcRules);
    } else {
      while (wfRules.firstChild)
        wfRules.removeChild(wfRules.firstChild);
    }
    this.editor.updateWireFrame();
  }
  /**
   *
   * @returns {void}
   */
  clickUndo() {
    const { undoMgr, textActions } = this.editor.svgCanvas;
    if (undoMgr.getUndoStackSize() > 0) {
      undoMgr.undo();
      this.editor.layersPanel.populateLayers();
      if (this.editor.svgCanvas.getMode() === 'textedit') {
        textActions.clear();
      }
    }
  }

  /**
   *
   * @returns {void}
   */
  clickRedo() {
    const { undoMgr } = this.editor.svgCanvas;
    if (undoMgr.getRedoStackSize() > 0) {
      undoMgr.redo();
      this.editor.layersPanel.populateLayers();
    }
  }
  /**
   * @type {module}
   */
  changeRectRadius(e) {
    this.editor.svgCanvas.setRectRadius(e.target.value);
  }

  /**
   * @type {module}
   */
  changeFontSize(e) {
    this.editor.svgCanvas.setFontSize(e.target.value);
  }

  /**
   * @type {module}
   */
  changeRotationAngle(e) {
    this.editor.svgCanvas.setRotationAngle(e.target.value);
    // eslint-disable-next-line max-len
    (Number.parseInt(e.target.value) === 0) ? $id("tool_reorient").classList.add("disabled") : $id("tool_reorient").classList.remove("disabled");
  }

  /**
   * @param {PlainObject} e
   * @returns {void}
   */
  changeBlur(e) {
    this.editor.svgCanvas.setBlur(e.target.value / 10, true);
  }
  /**
   *
   * @returns {void}
   */
  clickGroup() {
    // group
    if (this.editor.multiselected) {
      this.editor.svgCanvas.groupSelectedElements();
      // ungroup
    } else if (this.editor.selectedElement) {
      this.editor.svgCanvas.ungroupSelectedElement();
    }
  }

  /**
   *
   * @returns {void}
   */
  clickClone() {
    this.editor.svgCanvas.cloneSelectedElements(20, 20);
  }

  /**
   * @param {PlainObject} evt
   * @returns {void}
   */
  clickAlignEle(evt) {
    this.editor.svgCanvas.alignSelectedElements(evt.detail.value, "page");
  }

  /**
   * @param {string} pos indicate the alignment relative to top, bottom, middle etc..
   * @returns {void}
   */
  clickAlign(pos) {
    let value = $id("tool_align_relative").value;
    if (value === "") {
      value = "selected";
    }
    this.editor.svgCanvas.alignSelectedElements(pos, value);
  }
  /**
   *
   * @type {module}
   */
  attrChanger(e) {
    const attr = e.target.getAttribute("data-attr");
    let val = e.target.value;
    const valid = isValidUnit(attr, val, this.selectedElement);

    if (!valid) {
      e.target.value = this.selectedElement.getAttribute(attr);
      // eslint-disable-next-line no-alert
      alert(this.editor.i18next.t('notification.invalidAttrValGiven'));
      return false;
    }

    if (attr !== "id" && attr !== "class") {
      if (isNaN(val)) {
        val = this.editor.svgCanvas.convertToNum(attr, val);
      } else if (this.editor.configObj.curConfig.baseUnit !== "px") {
        // Convert unitless value to one with given unit

        const unitData = getTypeMap();

        if (
          this.editor.selectedElement[attr] ||
          this.editor.svgCanvas.getMode() === "pathedit" ||
          attr === "x" ||
          attr === "y"
        ) {
          val *= unitData[this.editor.configObj.curConfig.baseUnit];
        }
      }
    }

    // if the user is changing the id, then de-select the element first
    // change the ID, then re-select it with the new ID
    if (attr === "id") {
      const elem = this.editor.selectedElement;
      this.editor.svgCanvas.clearSelection();
      elem.id = val;
      this.editor.svgCanvas.addToSelection([ elem ], true);
    } else {
      this.editor.svgCanvas.changeSelectedAttribute(attr, val);
    }
    return true;
  }
  /**
   *
   * @returns {void}
   */
  convertToPath() {
    if (this.editor.selectedElement) {
      this.editor.svgCanvas.convertToPath();
    }
  }
  /**
   *
   * @returns {void}
   */
  reorientPath() {
    if (this.editor.selectedElement) {
      this.path.reorient();
    }
  }
  /**
   *
   * @returns {void} Resolves to `undefined`
   */
  makeHyperlink() {
    if (this.editor.selectedElement || this.multiselected) {
      // eslint-disable-next-line no-alert
      const url = prompt(
        this.editor.i18next.t('notification.enterNewLinkURL'),
        "http://"
      );
      if (url) {
        this.editor.svgCanvas.makeHyperlink(url);
      }
    }
  }
  /**
   *
   * @returns {void}
   */
  linkControlPoints() {
    $id("tool_node_link").pressed = ($id("tool_node_link").pressed) ? false : true;
    const linked = ($id("tool_node_link").pressed) ? true : false;
    this.path.linkControlPoints(linked);
  }

  /**
   *
   * @returns {void}
   */
  clonePathNode() {
    if (this.path.getNodePoint()) {
      this.path.clonePathNode();
    }
  }

  /**
   *
   * @returns {void}
   */
  deletePathNode() {
    if (this.path.getNodePoint()) {
      this.path.deletePathNode();
    }
  }

  /**
   *
   * @returns {void}
   */
  addSubPath() {
    const button = $id("tool_add_subpath");
    const sp = !button.classList.contains("pressed");
    button.pressed = sp;
    // button.toggleClass('push_button_pressed tool_button');
    this.path.addSubPath(sp);
  }

  /**
   *
   * @returns {void}
   */
  opencloseSubPath() {
    this.path.opencloseSubPath();
  }
  /**
   * Delete is a contextual tool that only appears in the ribbon if
   * an element has been selected.
   * @returns {void}
   */
  deleteSelected() {
    if (this.editor.selectedElement || this.editor.multiselected) {
      this.editor.svgCanvas.deleteSelectedElements();
    }
  }
  /**
   *
   * @returns {void}
   */
  moveToTopSelected() {
    if (this.editor.selectedElement) {
      this.editor.svgCanvas.moveToTopSelectedElement();
    }
  }

  /**
   *
   * @returns {void}
   */
  moveToBottomSelected() {
    if (this.editor.selectedElement) {
      this.editor.svgCanvas.moveToBottomSelectedElement();
    }
  }
  /**
   *
   * @returns {false}
   */
  clickBold() {
    this.editor.svgCanvas.setBold(!this.editor.svgCanvas.getBold());
    this.updateContextPanel();
    return false;
  }

  /**
   *
   * @returns {false}
   */
  clickItalic() {
    this.editor.svgCanvas.setItalic(!this.editor.svgCanvas.getItalic());
    this.updateContextPanel();
    return false;
  }

  /**
   *
   * @param {string} value "start","end" or "middle"
   * @returns {false}
   */
  clickTextAnchor(value) {
    this.editor.svgCanvas.setTextAnchor(value);
    this.updateContextPanel();
    return false;
  }
  /**
  * Set a selected image's URL.
  * @function module:SVGthis.setImageURL
  * @param {string} url
  * @returns {void}
  */
  setImageURL(url) {
    const { editor } = this;
    if (!url) {
      url = editor.defaultImageURL;
    }
    editor.svgCanvas.setImageURL(url);
    $id("image_url").value = url;

    if (url.startsWith('data:')) {
      // data URI found
      this.hideTool("image_url");
    } else {
      // regular URL
      const promised = editor.svgCanvas.embedImage(url);
      // eslint-disable-next-line promise/catch-or-return
      promised
        // eslint-disable-next-line promise/always-return
        .then(() => {
          // switch into "select" mode if we've clicked on an element
          editor.svgCanvas.setMode('select');
          editor.svgCanvas.selectOnly(editor.svgCanvas.getSelectedElems(), true);
        }, (error) => {
          console.error("error =", error);
          seAlert(editor.i18next.t('tools.no_embed'));
          editor.svgCanvas.deleteSelectedElements();
        });
      this.displayTool("image_url");
    }
  }
  /**
  * @param {boolean} editmode
  * @param {module:svgcanvas.SvgCanvas#event:selected} elems
  * @returns {void}
  */
  togglePathEditMode(editMode, elems) {
    if (editMode) {
      this.displayTool('path_node_panel');
    } else {
      this.hideTool('path_node_panel');
    }
    if (editMode) {
      // Change select icon
      $id('tool_path').pressed = false;
      $id('tool_select').pressed = true;
      $id('tool_select').setAttribute('src', `select_node.svg`);
      this.editor.multiselected = false;
      if (elems.length) {
        this.editor.selectedElement = elems[0];
      }
    } else {
      setTimeout(() => {
        $id('tool_select').setAttribute('src', `select.svg`);
      }, 1000);
    }
  }

  /**
   * @type {module}
   */
  init() {
    // add Top panel
    const template = document.createElement("template");
    const { i18next } = this.editor;
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = `
      <div id="tools_top">
        <div id="editor_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_source" title="tools.tool_source" shortcut="U" src="source.svg"></se-button>
          <se-button id="tool_wireframe" title="tools.wireframe_mode" shortcut="F" src="wireframe.svg"></se-button>
        </div> <!-- editor_panel -->
        <div id="history_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_undo" title="tools.undo" shortcut="Z" src="undo.svg" disabled></se-button>
          <se-button id="tool_redo" title="tools.redo" shortcut="Y" src="redo.svg" disabled></se-button>
        </div> <!-- history_panel -->
        <!-- Buttons when a single element is selected -->
        <div class="selected_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_clone" title="tools.clone" shortcut="D" src="clone.svg"></se-button>
          <se-button id="tool_delete" title="tools.del" shortcut="Delete/Backspace" src="delete.svg"></se-button>
        </div>
        <div class="selected_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_move_top" title="tools.move_top" shortcut="Ctrl+Shift+]" src="move_top.svg"></se-button>
          <se-button id="tool_move_bottom" title="tools.move_bottom" shortcut="Ctrl+Shift+[" src="move_bottom.svg"></se-button>
        </div>
        <div class="selected_panel">
          <se-button id="tool_topath" title="tools.to_path" src="to_path.svg"></se-button>
          <se-button id="tool_reorient" title="tools.reorient_path" src="reorient.svg"></se-button>
          <se-button id="tool_make_link" title="tools.make_link" src="globe_link.svg"></se-button>
        </div>
        <div class="selected_panel">
          <div class="tool_sep"></div>
          <se-input id="elem_id" data-attr="id" size="10" label="properties.id_label" title="properties.id"></se-input>
        </div>
        <div class="selected_panel">
          <se-input id="elem_class" data-attr="class" size="10" label="properties.class_label" title="properties.class"></se-input>
          <se-spin-input size="3" id="angle" min=-180 max=180 step=5 src="angle.svg" title="properties.angle"></se-spin-input>
          <se-spin-input size="2" id="blur" min=0 max=100 step=5 src="blur.svg" title="properties.blur"></se-spin-input>
          <se-list id="tool_position" title="tools.align_to_page" label="" width="22px" height="22px">
            <se-list-item id="tool_posleft" value="l" title="tools.align_left" src="align_left.svg" img-height="22px"></se-list-item>
            <se-list-item id="tool_poscenter" value="c" title="tools.align_center" src="align_center.svg" img-height="22px"></se-list-item>
            <se-list-item id="tool_posright" value="r" title="tools.align_right" src="align_right.svg" img-height="22px"></se-list-item>
            <se-list-item id="tool_postop" value="t" title="tools.align_top" src="align_top.svg" img-height="22px"></se-list-item>
            <se-list-item id="tool_posmiddle" value="m" title="tools.align_middle" src="align_middle.svg" img-height="22px"></se-list-item>
            <se-list-item id="tool_posbottom" value="b" src="align_bottom.svg" title="tools.align_bottom" img-height="22px"></se-list-item>
          </se-list>
        </div>
        <div class="xy_panel">
          <se-spin-input id="selected_x" data-attr="x" size="4" type="text" label="properties.x_label" title="properties.pos_x">
          </se-spin-input>
          <se-spin-input id="selected_y" data-attr="y" size="4" type="text" label="properties.y_label" title="properties.pos_y">
          </se-spin-input>
        </div>
        <!-- Buttons when multiple elements are selected -->
        <div class="multiselected_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_clone_multi" title="tools.clone" shortcut="C" src="clone.svg"></se-button>
          <se-button id="tool_delete_multi" title="tools.del" shortcut="Delete/Backspace" src="delete.svg"></se-button>
        </div>
        <div class="multiselected_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_group_elements" title="tools.group_elements" shortcut="G" src="group_elements.svg">
          </se-button>
          <se-button id="tool_make_link_multi" title="tools.make_link" src="globe_link.svg"></se-button>
          <se-button id="tool_align_left" title="tools.align_left" src="align_left.svg"></se-button>
          <se-button id="tool_align_center" title="tools.align_center" src="align_center.svg"></se-button>
          <se-button id="tool_align_right" title="tools.align_right" src="align_right.svg"></se-button>
          <se-button id="tool_align_top" title="tools.align_top" src="align_top.svg"></se-button>
          <se-button id="tool_align_middle" title="tools.align_middle" src="align_middle.svg"></se-button>
          <se-button id="tool_align_bottom" title="tools.align_bottom" src="align_bottom.svg"></se-button>
          <se-select id="tool_align_relative" label="relative to:" 
            options="${i18next.t('tools.selected_objects')},
                ${i18next.t('tools.largest_object')},
                ${i18next.t('tools.smallest_object')},
                ${i18next.t('tools.page')}"
            values="selected largest smallest page"></se-list-item>
          </se-select>
        </div> <!-- multiselected_panel -->
        <div class="rect_panel">
          <se-spin-input id="rect_width" data-attr="width" size="4" label="properties.w_label" title="properties.rect_width"></se-spin-input>
          <se-spin-input id="rect_height" data-attr="height" size="4" label="properties.h_label" title="properties.rect_height"></se-spin-input>
          <se-spin-input id="rect_rx" min=0 max=1000 step=1 size="3" title="properties.corner_radius" data-attr="Corner Radius" src="c_radius.svg"></se-spin-input>
        </div> <!-- rect_panel -->
        <div class="image_panel">
          <se-spin-input id="image_width" data-attr="width" size="4" type="text" label="properties.w_label" title="properties.image_width"></se-spin-input>
          <se-spin-input id="image_height" data-attr="height" size="4" type="text" label="properties.h_label" title="properties.image_height"></se-spin-input>
        </div>
        <div class="image_panel">
          <se-input id="image_url" data-attr="image_url" size="15" label="properties.image_url"></se-input> 
        </div>
        <div class="circle_panel">
          <se-spin-input id="circle_cx" data-attr="cx" size="4" label="properties.cx_label"></se-spin-input>
          <se-spin-input id="circle_cy" data-attr="cy" size="4" label="properties.cy_label"></se-spin-input>
        </div>
        <div class="circle_panel">
          <se-spin-input id="circle_r" data-attr="r" size="4" label="properties.r_label"></se-spin-input>
        </div>
        <div class="ellipse_panel">
          <se-spin-input id="ellipse_cx" data-attr="cx" size="4" title="properties.ellipse_cx" label="properties.cx_label"></se-spin-input>
          <se-spin-input id="ellipse_cy" data-attr="cy" size="4" title="properties.ellipse_cy" label="properties.cy_label"></se-spin-input>
        </div>
        <div class="ellipse_panel">
          <se-spin-input id="ellipse_rx" data-attr="rx" size="4" title="properties.ellipse_rx" label="properties.rx_label"></se-spin-input>
          <se-spin-input id="ellipse_ry" data-attr="ry" size="4" title="properties.ellipse_ry" label="properties.ry_label"></se-spin-input>
        </div>
        <div class="line_panel">
          <se-spin-input id="line_x1" data-attr="x1" size="4" title="properties.line_x1" label="properties.x1_label"></se-spin-input>
          <se-spin-input id="line_y1" data-attr="y1" size="4" title="properties.line_y1" label="properties.y1_label"></se-spin-input>
          <se-spin-input id="line_x2" data-attr="x2" size="4" title="properties.line_x2" label="properties.x2_label"></se-spin-input>
          <se-spin-input id="line_y2" data-attr="y2" size="4" title="properties.line_y2" label="properties.y2_label"></se-spin-input>
        </div>
        <div class="text_panel">
          <se-button id="tool_bold" title="properties.bold" src="bold.svg" shortcut="B"></se-button>
          <se-button id="tool_italic" title="properties.italic" src="italic.svg" shortcut="I"></se-button>
          <se-select id="tool_font_family" label="Font:"
            options="${i18next.t('properties.serif')},
                     ${i18next.t('properties.sans_serif')},
                     ${i18next.t('properties.cursive')},
                     ${i18next.t('properties.fantasy')},
                     ${i18next.t('properties.monospace')},
                     ${i18next.t('properties.courier')},
                     ${i18next.t('properties.helvetica')},
                     ${i18next.t('properties.times')}"
            values="Serif Sans-serif Cursive Fantasy Monospace Courier Helvetica Times"
          >
          </select>
          <se-spin-input size="2" id="font_size" min=1 max=1000 step=1 title="properties.font_size" src="fontsize.svg"></se-spin-input>
        </div>
        <div class="text_panel">
          <se-button id="tool_text_anchor_start" title="properties.text_anchor_start" src="anchor_start.svg"></se-button>
          <se-button id="tool_text_anchor_middle" title="properties.text_anchor_middle" src="anchor_middle.svg"></se-button>
          <se-button id="tool_text_anchor_end" title="properties.text_anchor_end" src="anchor_end.svg"></se-button>
        </div>
        <!-- Not visible, but still used -->
        <input id="text" type="text" size="35" />
        <div class="container_panel">
          <div class="tool_sep"></div>
          <se-input id="g_title" data-attr="title" size="8" label="properties.label"></se-input> 
        </div> <!-- container_panel -->
        <div class="use_panel">
          <se-button id="tool_unlink_use" title="tools.tool_unlink_use" src="unlink_use.svg"></se-button>
        </div> <!-- use_panel -->
        <div class="g_panel">
          <se-button id="tool_ungroup" title="tools.ungroup" src="ungroup.svg"></se-button>
        </div> <!-- g_panel -->
        <!-- For anchor elements -->
        <div class="a_panel">
          <label id="tool_link_url" title="${i18next.t('tools.set_link_url')}">
            <span id="linkLabel" class="icon_label"></span>
            <input id="link_url" type="text" size="35" />
          </label>
        </div> <!-- a_panel -->
        <div class="path_node_panel">
          <div class="tool_sep"></div>
          <se-button id="tool_node_link" title="tools.node_link" src="tool_node_link.svg" pressed></se-button>
          <div class="tool_sep"></div>
          <se-spin-input id="path_node_x" data-attr="x" size="4" title="properties.node_x" label="properties.x_label"></se-spin-input>
          <se-spin-input id="path_node_y" data-attr="y" size="4" title="properties.node_y" label="properties.y_label"></se-spin-input>
          <se-select id="seg_type" title="${i18next.t('tools.seg_type')}" label="" options="${i18next.t('properties.straight_segments')}, ${i18next.t('properties.curve_segments')}" values="4 6"></se-select>
          <se-button id="tool_node_clone" title="tools.node_clone" src="tool_node_clone.svg"></se-button>
          <se-button id="tool_node_delete" title="tools.node_delete" src="tool_node_delete.svg"></se-button>
          <se-button id="tool_openclose_path" title="tools.openclose_path" src="tool_openclose_path.svg"></se-button>
          <se-button id="tool_add_subpath" title="tools.add_subpath" src="tool_add_subpath.svg"></se-button>
        </div> <!-- path_node_panel -->
        <div id="cur_context_panel"></div>
     </div>
       `;
    this.editor.$svgEditor.append(template.content.cloneNode(true));
    // svg editor source dialoag added to DOM
    const newSeEditorDialog = document.createElement(
      "se-svg-source-editor-dialog"
    );
    newSeEditorDialog.setAttribute("id", "se-svg-editor-dialog");
    this.editor.$container.append(newSeEditorDialog);
    newSeEditorDialog.init(i18next);
    // register action to top panel buttons
    $id("tool_source").addEventListener("click", this.showSourceEditor.bind(this));
    $id("tool_wireframe").addEventListener("click", this.clickWireframe.bind(this));
    $id("tool_undo").addEventListener("click", this.clickUndo.bind(this));
    $id("tool_redo").addEventListener("click", this.clickRedo.bind(this));
    $id("tool_clone").addEventListener("click", this.clickClone.bind(this));
    $id("tool_clone_multi").addEventListener("click", this.clickClone.bind(this));
    $id("tool_delete").addEventListener("click", this.deleteSelected.bind(this));
    $id("tool_delete_multi").addEventListener("click", this.deleteSelected.bind(this));
    $id("tool_move_top").addEventListener("click", this.moveToTopSelected.bind(this));
    $id("tool_move_bottom").addEventListener("click", this.moveToBottomSelected.bind(this));
    $id("tool_topath").addEventListener("click", this.convertToPath.bind(this));
    $id("tool_make_link").addEventListener("click", this.makeHyperlink.bind(this));
    $id("tool_make_link_multi").addEventListener("click", this.makeHyperlink.bind(this));
    $id("tool_reorient").addEventListener("click", this.reorientPath.bind(this));
    $id("tool_group_elements").addEventListener("click", this.clickGroup.bind(this));
    $id("tool_position").addEventListener("change", (evt) => this.clickAlignEle.bind(this)(evt));
    $id("tool_align_left").addEventListener("click", () => this.clickAlign.bind(this)("left"));
    $id("tool_align_right").addEventListener("click", () => this.clickAlign.bind(this)("right"));
    $id("tool_align_center").addEventListener("click", () => this.clickAlign.bind(this)("center"));
    $id("tool_align_top").addEventListener("click", () => this.clickAlign.bind(this)("top"));
    $id("tool_align_bottom").addEventListener("click", () => this.clickAlign.bind(this)("bottom"));
    $id("tool_align_middle").addEventListener("click", () => this.clickAlign.bind(this)("middle"));
    $id("tool_node_clone").addEventListener("click", this.clonePathNode.bind(this));
    $id("tool_node_delete").addEventListener("click", this.deletePathNode.bind(this));
    $id("tool_openclose_path").addEventListener("click", this.opencloseSubPath.bind(this));
    $id("tool_add_subpath").addEventListener("click", this.addSubPath.bind(this));
    $id("tool_node_link").addEventListener("click", this.linkControlPoints.bind(this));
    $id("angle").addEventListener("change", this.changeRotationAngle.bind(this));
    $id("blur").addEventListener("change", this.changeBlur.bind(this));
    $id("rect_rx").addEventListener("change", this.changeRectRadius.bind(this));
    $id("font_size").addEventListener("change", this.changeFontSize.bind(this));
    $id("tool_ungroup").addEventListener("click", this.clickGroup.bind(this));
    $id("tool_bold").addEventListener("click", this.clickBold.bind(this));
    $id("tool_italic").addEventListener("click", this.clickItalic.bind(this));
    $id("tool_text_anchor_start").addEventListener("click", () => this.clickTextAnchor.bind(this)("start"));
    $id("tool_text_anchor_middle").addEventListener("click", () => this.clickTextAnchor.bind(this)("middle"));
    $id("tool_text_anchor_end").addEventListener("click", () => this.clickTextAnchor.bind(this)("end"));
    $id("tool_unlink_use").addEventListener("click", this.clickGroup.bind(this));
    $id('image_url').addEventListener('change', (evt) => { this.setImageURL(evt.currentTarget.value);});

    // all top panel attributes
    [
      "elem_id",
      "elem_class",
      "circle_cx",
      "circle_cy",
      "circle_r",
      "ellipse_cx",
      "ellipse_cy",
      "ellipse_rx",
      "ellipse_ry",
      "selected_x",
      "selected_y",
      "rect_width",
      "rect_height",
      "line_x1",
      "line_x2",
      "line_y2",
      "image_width",
      "image_height",
      "path_node_x",
      "path_node_y"
    ].forEach((attrId) =>
      $id(attrId).addEventListener("change", this.attrChanger.bind(this))
    );
  }
}

export default TopPanel;
