/* globals $ */
import SvgCanvas from "../../svgcanvas/svgcanvas.js";
import { isValidUnit, getTypeMap, convertUnit } from "../../common/units.js";

const { $id, isNullish } = SvgCanvas;

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
    this.uiStrings = editor.uiStrings;
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
    const [pre, val] = bits;

    if (changeElem) {
      this.svgCanvas.setStrokeAttr('stroke-' + pre, val);
    }
    $(opt).addClass('current').siblings().removeClass('current');
  }

  /**
   * Updates the toolbar (colors, opacity, etc) based on the selected element.
   * This function also updates the opacity and id elements that are in the
   * context panel.
   * @returns {void}
   */
  update() {
    let i, len;
    if (!isNullish(this.selectedElement)) {
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

          let attr =
            this.selectedElement.getAttribute("stroke-linejoin") || "miter";

          if ($id("linejoin_" + attr).length) {
            this.setStrokeOpt($id("linejoin_" + attr));
          }

          attr = this.selectedElement.getAttribute("stroke-linecap") || "butt";

          if ($id("linecap_" + attr).length) {
            this.setStrokeOpt($id("linecap_" + attr));
          }
        }
      }
    }

    // All elements including image and group have opacity
    if (!isNullish(this.selectedElement)) {
      const opacPerc =
        (this.selectedElement.getAttribute("opacity") || 1.0) * 100;
      $id("opacity").value = opacPerc;
      $id("elem_id").value = this.selectedElement.id;
      $id("elem_class").value =
        this.selectedElement.getAttribute("class") !== null
          ? this.selectedElement.getAttribute("class")
          : "";
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
      this.editor.uiStrings.notification.enterNewImgURL,
      curhref
    );
    if (url) {
      this.editor.setImageURL(url);
    } else if (cancelDeletes) {
      this.editor.svgCanvas.deleteSelectedElements();
    }
  }
  /**
   * Updates the context panel tools based on the selected element.
   * @returns {void}
   */
  updateContextPanel() {
    const setInputWidth = elem => {
      const w = Math.min(Math.max(12 + elem.value.length * 6, 50), 300);
      $(elem).width(w);
    };

    let elem = this.editor.selectedElement;
    // If element has just been deleted, consider it null
    if (!isNullish(elem) && !elem.parentNode) {
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
    $id("selected_panel").style.display = 'none';
    $id("multiselected_panel").style.display = 'none';
    $id("g_panel").style.display = 'none';
    $id("rect_panel").style.display = 'none';
    $id("circle_panel").style.display = 'none';
    $id("ellipse_panel").style.display = 'none';
    $id("line_panel").style.display = 'none';
    $id("text_panel").style.display = 'none';
    $id("image_panel").style.display = 'none';
    $id("container_panel").style.display = 'none';
    $id("use_panel").style.display = 'none';
    $id("a_panel").style.display = 'none';
    if (!isNullish(elem)) {
      const elname = elem.nodeName;
      // If this is a link with no transform and one child, pretend
      // its child is selected
      // if (elname === 'a') { // && !$(elem).attr('transform')) {
      //   elem = elem.firstChild;
      // }

      const angle = this.editor.svgCanvas.getRotationAngle(elem);
      $("#angle").val(angle);

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
        $id("selected_panel").style.display = 'block';
        // Elements in this array already have coord fields
        if (["line", "circle", "ellipse"].includes(elname)) {
          $id("xy_panel").style.display = 'none';
        } else {
          let x, y;

          // Get BBox vals for g, polyline and path
          if (["g", "polyline", "path"].includes(elname)) {
            const bb = this.editor.svgCanvas.getStrokedBBox([elem]);
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

          $("#selected_x").val(x || 0);
          $("#selected_y").val(y || 0);
          $id("xy_panel").style.display = 'block';
        }

        // Elements in this array cannot be converted to a path
        $id("tool_topath").style.display = [
          "image",
          "text",
          "path",
          "g",
          "use"
        ].includes(elname)
          ? "none"
          : "block";
        $id("tool_reorient").style.display =
          elname === "path" ? "block" : "none";
        $id("tool_reorient").disabled = angle === 0;
      } else {
        const point = this.path.getNodePoint();
        $("#tool_add_subpath").pressed = false;
        $("#tool_node_delete").toggleClass(
          "disabled",
          !this.path.canDeleteNodes
        );

        // Show open/close button based on selected point
        // setIcon('#tool_openclose_path', path.closed_subpath ? 'open_path' : 'close_path');

        if (point) {
          const segType = $("#seg_type");
          if (unit) {
            point.x = convertUnit(point.x);
            point.y = convertUnit(point.y);
          }
          $("#path_node_x").val(point.x);
          $("#path_node_y").val(point.y);
          if (point.type) {
            segType.val(point.type).removeAttr("disabled");
          } else {
            segType.val(4).attr("disabled", "disabled");
          }
        }
        return;
      }

      // update contextual tools here
      const panels = {
        g: [],
        a: [],
        rect: ["rx", "width", "height"],
        image: ["width", "height"],
        circle: ["cx", "cy", "r"],
        ellipse: ["cx", "cy", "rx", "ry"],
        line: ["x1", "y1", "x2", "y2"],
        text: [],
        use: []
      };

      const { tagName } = elem;

      // if ($(elem).data('gsvg')) {
      //   $('#g_panel').show();
      // }

      let linkHref = null;
      if (tagName === "a") {
        linkHref = this.editor.svgCanvas.getHref(elem);
        $id("g_panel").style.display = 'block';
      }

      if (elem.parentNode.tagName === "a" && !$(elem).siblings().length) {
        $id("a_panel").style.display = 'block';
        linkHref = this.editor.svgCanvas.getHref(elem.parentNode);
      }

      // Hide/show the make_link buttons
      $("#tool_make_link, #tool_make_link_multi").toggle(!linkHref);

      if (linkHref) {
        $id("link_url").value = linkHref;
      }

      if (panels[tagName]) {
        const curPanel = panels[tagName];
        $id(tagName + "_panel").style.display = 'block';

        curPanel.forEach(item => {
          let attrVal = elem.getAttribute(item);
          if (this.editor.configObj.curConfig.baseUnit !== "px" && elem[item]) {
            const bv = elem[item].baseVal.value;
            attrVal = convertUnit(bv);
          }
          $id(`${tagName}_${item}`).value = attrVal || 0;
        });

        if (tagName === "text") {
          $id("text_panel").style.display = "inline-block";
          $id("tool_italic").pressed = this.editor.svgCanvas.getItalic();
          $id("tool_bold").pressed = this.editor.svgCanvas.getBold();
          $id("tool_font_family").value = elem.getAttribute("font-family");
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
              $("#text")
                .focus()
                .select();
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
          $id("container_panel").style.display = 'block';
          const title = this.editor.svgCanvas.getTitle();
          const label = $("#g_title")[0];
          label.value = title;
          setInputWidth(label);
          $("#g_title").prop("disabled", tagName === "use");
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
      $id("multiselected_panel").style.display = 'block';
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
      $("#selLayerNames")
        .removeAttr("disabled")
        .val(currentLayerName);

      // Enable regular menu options
      const canCMenu = document.getElementById("se-cmenu_canvas");
      canCMenu.setAttribute(
        "enablemenuitems",
        "#delete,#cut,#copy,#move_front,#move_up,#move_down,#move_back"
      );
    } else {
      $("#selLayerNames").attr("disabled", "disabled");
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

    const wfRules = $("#wireframe_rules");
    if (!wfRules.length) {
      /* wfRules = */ $('<style id="wireframe_rules"></style>').appendTo(
      "head"
    );
    } else {
      wfRules.empty();
    }
    this.editor.updateWireFrame();
  }
  /**
   *
   * @returns {void}
   */
  clickUndo() {
    const { undoMgr } = this.editor.svgCanvas;
    if (undoMgr.getUndoStackSize() > 0) {
      undoMgr.undo();
      this.editor.layersPanel.populateLayers();
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
    $("#tool_reorient").toggleClass(
      "disabled",
      Number.parseInt(e.target.value) === 0
    );
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
    let value = $("#tool_align_relative").val();
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
    const valid = isValidUnit(attr, val, this.editor.selectedElement);

    if (!valid) {
      e.target.value = this.editor.selectedElement().getAttribute(attr);
      // eslint-disable-next-line no-alert
      alert(this.uiStrings.notification.invalidAttrValGiven);
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
      this.editor.svgCanvas.addToSelection([elem], true);
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
    if (!isNullish(this.editor.selectedElement)) {
      this.editor.svgCanvas.convertToPath();
    }
  }
  /**
   *
   * @returns {void}
   */
  reorientPath() {
    if (!isNullish(this.editor.selectedElement)) {
      this.path.reorient();
    }
  }
  /**
   *
   * @returns {void} Resolves to `undefined`
   */
  makeHyperlink() {
    if (!isNullish(this.editor.selectedElement) || this.multiselected) {
      // eslint-disable-next-line no-alert
      const url = prompt(
        this.uiStrings.notification.enterNewLinkURL,
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
    const linked = $id("tool_node_link").pressed;
    $id("tool_node_link").pressed = !linked;
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
    const button = $("#tool_add_subpath");
    const sp = !button.hasClass("pressed");
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
    if (!isNullish(this.editor.selectedElement) || this.multiselected) {
      this.editor.svgCanvas.deleteSelectedElements();
    }
  }
  /**
   *
   * @returns {void}
   */
  moveToTopSelected() {
    if (!isNullish(this.editor.selectedElement)) {
      this.editor.svgCanvas.moveToTopSelectedElement();
    }
  }

  /**
   *
   * @returns {void}
   */
  moveToBottomSelected() {
    if (!isNullish(this.editor.selectedElement)) {
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
   * @type {module}
   */
  init() {
    // add Top panel
    const template = document.createElement("template");
    template.innerHTML = `
       <div id="tools_top">
       <div id="editor_panel">
         <div class="tool_sep"></div>
         <se-button id="tool_source" title="Edit Source" shortcut="U" src="./images/source.svg"></se-button>
         <se-button id="tool_wireframe" title="Wireframe Mode" shortcut="F" src="./images/wireframe.svg"></se-button>
         <se-button id="view_grid" title="Show grid" src="./images/grid.svg"></se-button>
       </div> <!-- editor_panel -->
       <div id="history_panel">
         <div class="tool_sep"></div>
         <se-button id="tool_undo" title="Undo" shortcut="Z" src="./images/undo.svg" disabled></se-button>
         <se-button id="tool_redo" title="Redo" shortcut="Y" src="./images/redo.svg" disabled></se-button>
       </div> <!-- history_panel -->
       <!-- Buttons when a single element is selected -->
       <div id="selected_panel">
         <div class="toolset">
           <div class="tool_sep"></div>
           <se-button id="tool_clone" title="Duplicate Element" shortcut="D" src="./images/clone.svg"></se-button>
           <se-button id="tool_delete" title="Delete Element" shortcut="Backspace" src="./images/delete.svg">
           </se-button>
         </div>
         <div class="toolset">
           <div class="tool_sep"></div>
           <se-button id="tool_move_top" title="Bring to Front" shortcut="Ctrl+Shift+]" src="./images/move_top.svg">
           </se-button>
           <se-button id="tool_move_bottom" title="Send to Back" shortcut="Ctrl+Shift+[" src="./images/move_bottom.svg">
           </se-button>
         </div>
         <div class="toolset">
           <se-button id="tool_topath" title="Convert to Path" src="./images/to_path.svg"></se-button>
           <se-button id="tool_reorient" title="Reorient path" src="./images/reorient.svg"></se-button>
           <se-button id="tool_make_link" title="Make (hyper)link" src="./images/globe_link.svg"></se-button>
         </div>
         <div class="toolset">
           <div class="tool_sep"></div>
           <se-input id="elem_id" data-attr="id" size="10" label="id" title="Identify the element"></se-input>
         </div>
         <div class="toolset">
           <se-input id="elem_class" data-attr="class" size="10" label="class" title="Element class"></se-input>
         </div>
         <se-spin-input size="3" id="angle" min=-180 max=180 step=5 src="./images/angle.svg"
           title="Change rotation angle"></se-spin-input>
         <se-spin-input size="2" id="blur" min=0 max=100 step=5 src="./images/blur.svg"
           title="Change gaussian blur value"></se-spin-input>
         <se-list id="tool_position" title="Align Element to Page" label="" width="22px" height="24px">
           <se-list-item id="tool_posleft" value="l">
             <img title="align left" src="./images/align_left.svg" height="22px">
           </se-list-item>
           <se-list-item id="tool_poscenter" value="c">
             <img title="align center" src="./images/align_center.svg" height="22px">
           </se-list-item>
           <se-list-item id="tool_posright" value="r">
             <img title="align right" src="./images/align_right.svg" height="22px">
           </se-list-item>
           <se-list-item id="tool_postop" value="t">
             <img title="align top" src="./images/align_top.svg" height="22px">
           </se-list-item>
           <se-list-item id="tool_posmiddle" value="m">
             <img title="align middle" src="./images/align_middle.svg" height="22px">
           </se-list-item>
           <se-list-item id="tool_posbottom" value="b">
             <img title="align bottom" src="./images/align_bottom.svg" height="22px">
           </se-list-item>
         </se-list>
         <div id="xy_panel" class="toolset">
           <se-spin-input id="selected_x" data-attr="x" size="4" type="text" label="x" title="Change X coordinate">
           </se-spin-input>
           <se-spin-input id="selected_y" data-attr="y" size="4" type="text" label="y" title="Change Y coordinate">
           </se-spin-input>
         </div>
       </div> <!-- selected_panel -->
       <!-- Buttons when multiple elements are selected -->
       <div id="multiselected_panel">
         <div class="tool_sep"></div>
         <se-button id="tool_clone_multi" title="Clone Elements" shortcut="C" src="./images/clone.svg"></se-button>
         <se-button id="tool_delete_multi" title="Delete Selected Elements" shortcut="Delete/Backspace"
           src="./images/delete.svg"></se-button>
         <div class="tool_sep"></div>
         <se-button id="tool_group_elements" title="Group Elements" shortcut="G" src="./images/group_elements.svg">
         </se-button>
         <se-button id="tool_make_link_multi" title="Make (hyper)link" src="./images/globe_link.svg"></se-button>
         <se-button id="tool_align_left" title="Align Left" src="./images/align_left.svg"></se-button>
         <se-button id="tool_align_center" title="Align Center" src="./images/align_center.svg"></se-button>
         <se-button id="tool_align_right" title="Align Right" src="./images/align_right.svg"></se-button>
         <se-button id="tool_align_top" title="Align Top" src="./images/align_top.svg"></se-button>
         <se-button id="tool_align_middle" title="Align Middle" src="./images/align_middle.svg"></se-button>
         <se-button id="tool_align_bottom" title="Align Bottom" src="./images/align_bottom.svg"></se-button>
         <se-list id="tool_align_relative" label="relative to:">
           <se-list-item id="selected_objects" value="selected">selected objects</se-list-item>
           <se-list-item id="largest_object" value="largest">largest object</se-list-item>
           <se-list-item id="smallest_object" value="smallest">smallest object</se-list-item>
           <se-list-item id="page" value="page">page</se-list-item>
         </se-list>
         <div class="tool_sep"></div>
       </div> <!-- multiselected_panel -->
       <div id="rect_panel">
         <div class="toolset">
           <se-spin-input id="rect_width" data-attr="width" size="4" label="w" title="Change rectangle width">
           </se-spin-input>
           <se-spin-input id="rect_height" data-attr="height" size="4" label="h" title="Change rectangle height">
           </se-spin-input>
         </div>
         <se-spin-input id="rect_rx" min=0 max=1000 step=1 size="3" title="Change Rectangle Corner Radius"
           data-attr="Corner Radius" src="./images/c_radius.svg"></se-spin-input>
       </div> <!-- rect_panel -->
       <div id="image_panel">
         <div class="toolset">
           <se-spin-input id="image_width" data-attr="width" size="4" type="text" label="w" title="Change image width">
           </se-spin-input>
           <se-spin-input id="image_height" data-attr="height" size="4" type="text" label="h"
             title="Change image height"></se-spin-input>
         </div>
         <div class="toolset">
           <label id="tool_image_url">url:
             <input id="image_url" type="text" title="Change URL" size="35" />
           </label>
           <label id="tool_change_image">
             <button id="change_image_url" style="display: none;">Change Image</button>
             <span id="url_notice"
               title="NOTE: This image cannot be embedded. It will depend on this path to be displayed"></span>
           </label>
         </div>
       </div> <!-- image_panel -->
       <div id="circle_panel">
         <div class="toolset">
           <se-spin-input id="circle_cx" data-attr="cx" size="4" label="cx"></se-spin-input>
           <se-spin-input id="circle_cy" data-attr="cy" size="4" label="cy"></se-spin-input>
         </div>
         <div class="toolset">
           <se-spin-input id="circle_r" data-attr="r" size="4" label="r"></se-spin-input>
         </div>
       </div> <!-- circle_panel -->
       <div id="ellipse_panel">
         <div class="toolset">
           <se-spin-input id="ellipse_cx" data-attr="cx" size="4" title="Change ellipse's cx coordinate" label="cx">
           </se-spin-input>
           <se-spin-input id="ellipse_cy" data-attr="cy" size="4" title="Change ellipse's cy coordinate" label="cy">
           </se-spin-input>
         </div>
         <div class="toolset">
           <se-spin-input id="ellipse_rx" data-attr="rx" size="4" title="Change ellipse's x radius" label="rx">
           </se-spin-input>
           <se-spin-input id="ellipse_ry" data-attr="ry" size="4" title="Change ellipse's y radius" label="ry">
           </se-spin-input>
         </div>
       </div> <!-- ellipse_panel -->
       <div id="line_panel">
         <div class="toolset">
           <se-spin-input id="line_x1" data-attr="x1" size="4" title="Change line's starting x coordinate" label="x1">
           </se-spin-input>
           <se-spin-input id="line_y1" data-attr="y1" size="4" title="Change line's starting y coordinate" label="y1">
           </se-spin-input>
           <se-spin-input id="line_x2" data-attr="x2" size="4" title="Change line's ending x coordinate" label="x2">
           </se-spin-input>
           <se-spin-input id="line_y2" data-attr="y2" size="4" title="Change line's ending y coordinate" label="y2">
           </se-spin-input>
         </div>
       </div> <!-- line_panel -->
       <div id="text_panel">
         <div class="toolset">
           <se-button id="tool_bold" title="Bold Text [B]" src="./images/bold.svg" shortcut="B"></se-button>
           <se-button id="tool_italic" title="Italic Text [I]" src="./images/italic.svg" shortcut="I"></se-button>
           <se-button id="tool_text_anchor_start" title="Align the text from start" src="./images/anchor_start.svg">
           </se-button>
           <se-button id="tool_text_anchor_middle" title="Align the text from middle" src="./images/anchor_middle.svg">
           </se-button>
           <se-button id="tool_text_anchor_end" title="Align the text from end" src="./images/anchor_end.svg">
           </se-button>
         </div>
         <se-list id="tool_font_family" label="Font:">
           <se-list-item value="Serif" style="font-family:serif;"> Serif</se-list-item>
           <se-list-item value="Sans-serif" style="font-family:sans-serif;"> Sans-serif</se-list-item>
           <se-list-item value="Cursive" style="font-family:cursive;"> Cursive</se-list-item>
           <se-list-item value="Fantasy" style="font-family:fantasy;"> Fantasy</se-list-item>
           <se-list-item value="Monospace" style="font-family:monospace;"> Monospace</se-list-item>
           <se-list-item value="Courier" style="font-family:courier;"> Courier</se-list-item>
           <se-list-item value="Helvetica" style="font-family:helvetica;">Helvetica</se-list-item>
           <se-list-item value="Times" style="font-family:times;">Times</se-list-item>
         </se-list>
         <se-spin-input size="2" id="font_size" min=1 max=1000 step=1 title="Change Font Size"
           src="./images/fontsize.svg"></se-spin-input>
         <!-- Not visible, but still used -->
         <input id="text" type="text" size="35" />
       </div> <!-- text_panel -->
       <!-- formerly gsvg_panel -->
       <div id="container_panel">
         <div class="tool_sep"></div>
         <!-- Add viewBox field here? -->
         <label id="group_title" title="Group identification label">
           <span>label</span>
           <input id="g_title" data-attr="title" size="10" type="text" />
         </label>
       </div> <!-- container_panel -->
       <div id="use_panel">
         <se-button id="tool_unlink_use" title="Break link to reference element (make unique)"
           src="./images/unlink_use.svg">
         </se-button>
       </div> <!-- use_panel -->
       <div id="g_panel">
         <se-button id="tool_ungroup" title="Ungroup Elements [G]" src="./images/ungroup.svg">
         </se-button>
       </div> <!-- g_panel -->
       <!-- For anchor elements -->
       <div id="a_panel">
         <label id="tool_link_url" title="Set link URL (leave empty to remove)">
           <span id="linkLabel" class="icon_label"></span>
           <input id="link_url" type="text" size="35" />
         </label>
       </div> <!-- a_panel -->
       <div id="path_node_panel">
         <div class="tool_sep"></div>
         <se-button id="tool_node_link" title="Link Control Points" src="./images/tool_node_link.svg" pressed>
         </se-button>
         <div class="tool_sep"></div>
         <se-spin-input id="path_node_x" data-attr="x" size="4" title="Change node's x coordinate" label="x:">
         </se-spin-input>
         <se-spin-input id="path_node_y" data-attr="y" size="4" title="Change node's y coordinate" label="y:">
         </se-spin-input>
         <select id="seg_type" title="Change Segment type">
           <option id="straight_segments" selected="selected" value="4">Straight</option>
           <option id="curve_segments" value="6">Curve</option>
         </select>
         <se-button id="tool_node_clone" title="Clone Node" src="./images/tool_node_clone.svg"></se-button>
         <se-button id="tool_node_delete" title="Delete Node" src="./images/tool_node_delete.svg"></se-button>
         <se-button id="tool_openclose_path" title="Open/close sub-path" src="./images/tool_openclose_path.svg">
         </se-button>
         <se-button id="tool_add_subpath" title="Add sub-path" src="./images/tool_add_subpath.svg"></se-button>
       </div> <!-- path_node_panel -->
       <div id="cur_context_panel"></div>
     </div> <!-- tools_top -->
       `;
    this.editor.$svgEditor.append(template.content.cloneNode(true));
    // svg editor source dialoag added to DOM
    const newSeEditorDialog = document.createElement(
      "se-svg-source-editor-dialog"
    );
    newSeEditorDialog.setAttribute("id", "se-svg-editor-dialog");
    document.body.append(newSeEditorDialog);
    // register action to top panel buttons
    $id("tool_source").addEventListener(
      "click",
      this.showSourceEditor.bind(this)
    );
    $id("tool_wireframe").addEventListener(
      "click",
      this.clickWireframe.bind(this)
    );
    $id("tool_undo").addEventListener("click", this.clickUndo.bind(this));
    $id("tool_redo").addEventListener("click", this.clickRedo.bind(this));
    $id("tool_clone").addEventListener("click", this.clickClone.bind(this));
    $id("tool_clone_multi").addEventListener(
      "click",
      this.clickClone.bind(this)
    );
    $id("tool_delete").addEventListener(
      "click",
      this.deleteSelected.bind(this)
    );
    $id("tool_delete_multi").addEventListener(
      "click",
      this.deleteSelected.bind(this)
    );
    $id("tool_move_top").addEventListener(
      "click",
      this.moveToTopSelected.bind(this)
    );
    $id("tool_move_bottom").addEventListener(
      "click",
      this.moveToBottomSelected.bind(this)
    );
    $id("tool_topath").addEventListener("click", this.convertToPath.bind(this));
    $id("tool_make_link").addEventListener(
      "click",
      this.makeHyperlink.bind(this)
    );
    $id("tool_make_link_multi").addEventListener(
      "click",
      this.makeHyperlink.bind(this)
    );
    $id("tool_reorient").addEventListener(
      "click",
      this.reorientPath.bind(this)
    );
    $id("tool_group_elements").addEventListener(
      "click",
      this.clickGroup.bind(this)
    );
    $id("tool_position").addEventListener("change", evt =>
      this.clickAlignEle.bind(this)(evt)
    );
    $id("tool_align_left").addEventListener("click", () =>
      this.clickAlign.bind(this)("left")
    );
    $id("tool_align_right").addEventListener("click", () =>
      this.clickAlign.bind(this)("right")
    );
    $id("tool_align_center").addEventListener("click", () =>
      this.clickAlign.bind(this)("center")
    );
    $id("tool_align_top").addEventListener("click", () =>
      this.clickAlign.bind(this)("top")
    );
    $id("tool_align_bottom").addEventListener("click", () =>
      this.clickAlign.bind(this)("bottom")
    );
    $id("tool_align_middle").addEventListener("click", () =>
      this.clickAlign.bind(this)("middle")
    );
    $id("tool_node_clone").addEventListener(
      "click",
      this.clonePathNode.bind(this)
    );
    $id("tool_node_delete").addEventListener(
      "click",
      this.deletePathNode.bind(this)
    );
    $id("tool_openclose_path").addEventListener(
      "click",
      this.opencloseSubPath.bind(this)
    );
    $id("tool_add_subpath").addEventListener(
      "click",
      this.addSubPath.bind(this)
    );
    $id("tool_node_link").addEventListener(
      "click",
      this.linkControlPoints.bind(this)
    );
    $id("angle").addEventListener(
      "change",
      this.changeRotationAngle.bind(this)
    );
    $id("blur").addEventListener("change", this.changeBlur.bind(this));
    $id("rect_rx").addEventListener("change", this.changeRectRadius.bind(this));
    $id("font_size").addEventListener("change", this.changeFontSize.bind(this));
    $id("tool_ungroup").addEventListener("click", this.clickGroup.bind(this));
    $id("tool_bold").addEventListener("click", this.clickBold.bind(this));
    $id("tool_italic").addEventListener("click", this.clickItalic.bind(this));
    $id("tool_text_anchor_start").addEventListener("click", () =>
      this.clickTextAnchor.bind(this)("start")
    );
    $id("tool_text_anchor_middle").addEventListener("click", () =>
      this.clickTextAnchor.bind(this)("middle")
    );
    $id("tool_text_anchor_end").addEventListener("click", () =>
      this.clickTextAnchor.bind(this)("end")
    );
    $id("tool_unlink_use").addEventListener(
      "click",
      this.clickGroup.bind(this)
    );
    $id("change_image_url").addEventListener(
      "click",
      this.promptImgURL.bind(this)
    );
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
    ].forEach(attrId =>
      $id(attrId).addEventListener("change", this.attrChanger.bind(this))
    );
  }
}

export default TopPanel;
