/* eslint-disable max-len */
/* eslint-disable no-alert */
/* globals $ */
import SvgCanvas from "../../svgcanvas/svgcanvas.js";

const SIDEPANEL_MAXWIDTH = 300;
const SIDEPANEL_OPENWIDTH = 150;
const { $id } = SvgCanvas;

/**
 *
 */
class LayersPanel {
  /**
   * @param {PlainObject} editor
   */
  constructor(editor) {
    this.uiStrings = editor.uiStrings;
    this.updateContextPanel = editor.topPanel.updateContextPanel;
    this.sidedrag = -1;
    this.sidedragging = false;
    this.allowmove = false;
    this.editor = editor;
  }

  /**
   * @param {Float} delta
   * @fires module:svgcanvas.SvgCanvas#event:ext_workareaResized
   * @returns {void}
   */
  changeSidePanelWidth(delta) {
    const rulerX = document.querySelector("#ruler_x");
    $("#sidepanels").width("+=" + delta);
    $("#layerpanel").width("+=" + delta);
    rulerX.style.right =
      parseFloat(getComputedStyle(rulerX, null).right.replace("px", "")) +
      delta +
      "px";
    this.editor.workarea.style.right =
      parseFloat(
        getComputedStyle(this.editor.workarea, null).right.replace("px", "")
      ) +
      delta +
      "px";
    this.editor.svgCanvas.runExtensions("workareaResized");
  }

  /**
   * @param {Event} evt
   * @returns {void}
   */
  resizeSidePanel(evt) {
    if (!this.allowmove) {
      return;
    }
    if (this.sidedrag === -1) {
      return;
    }
    this.sidedragging = true;
    let deltaX = this.sidedrag - evt.pageX;
    const sideWidth = parseFloat(getComputedStyle($id("sidepanels"), null).width.replace("px", ""));
    if (sideWidth + deltaX > SIDEPANEL_MAXWIDTH) {
      deltaX = SIDEPANEL_MAXWIDTH - sideWidth;
      // sideWidth = SIDEPANEL_MAXWIDTH;
    } else if (sideWidth + deltaX < 2) {
      deltaX = 2 - sideWidth;
      // sideWidth = 2;
    }
    if (deltaX === 0) {
      return;
    }
    this.sidedrag -= deltaX;
    this.changeSidePanelWidth(deltaX);
  }

  /**
   * If width is non-zero, then fully close it; otherwise fully open it.
   * @param {boolean} close Forces the side panel closed
   * @returns {void}
   */
  toggleSidePanel(close) {
    const dpr = window.devicePixelRatio || 1;
    const w = parseFloat(getComputedStyle($id("sidepanels"), null).width.replace("px", ""))
    const isOpened = (dpr < 1 ? w : w / dpr) > 2;
    const zoomAdjustedSidepanelWidth =
      (dpr < 1 ? 1 : dpr) * SIDEPANEL_OPENWIDTH;
    const deltaX = (isOpened || close ? 0 : zoomAdjustedSidepanelWidth) - w;
    this.changeSidePanelWidth(deltaX);
  }
  /**
   * @param {PlainObject} e event
   * @returns {void}
   */
  lmenuFunc(e) {
    const action = e?.detail?.trigger;
    switch (action) {
      case "dupe":
        this.cloneLayer();
        break;
      case "delete":
        this.deleteLayer();
        break;
      case "merge_down":
        this.mergeLayer();
        break;
      case "merge_all":
        this.editor.svgCanvas.mergeAllLayers();
        this.updateContextPanel();
        this.populateLayers();
        break;
    }
  }
  /**
   * @returns {void}
   */
  init() {
    const template = document.createElement("template");
    template.innerHTML = `
    <div id="sidepanels">
    <div id="layerpanel">
      <h3 id="layersLabel">Layers</h3>
      <fieldset id="layerbuttons">
        <se-button id="layer_new" title="New Layer" size="small" src="./images/new.svg"></se-button>
        <se-button id="layer_delete" title="Delete Layer" size="small" src="./images/delete.svg"></se-button>
        <se-button id="layer_rename" title="Rename Layer" size="small" src="./images/text.svg"></se-button>
        <se-button id="layer_up" title="Move Layer Up" size="small" src="./images/go_up.svg"></se-button>
        <se-button id="layer_down" title="Move Layer Down" size="small" src="./images/go_down.svg"></se-button>
        <se-button id="layer_moreopts" title="More Options" size="small" src="./images/context_menu.svg">
        </se-button>
      </fieldset>
      <table id="layerlist">
        <tr class="layer">
          <td class="layervis"></td>
          <td class="layername">Layer 1</td>
        </tr>
      </table>
      <span id="selLayerLabel">Move elements to:</span>
      <select id="selLayerNames" title="Move selected elements to a different layer" disabled="disabled">
        <option selected="selected" value="layer1">Layer 1</option>
      </select>
    </div>
    <div id="sidepanel_handle" title="Drag left/right to resize side panel [X]">L a y e r s
    </div>
  </div>
    `;
    this.editor.$svgEditor.append(template.content.cloneNode(true));
    this.editor.svgCanvas = this.editor.svgCanvas;
    // layer menu added to DOM
    const menuMore = document.createElement("se-cmenu-layers");
    menuMore.setAttribute("id", "se-cmenu-layers-more");
    menuMore.value = "layer_moreopts";
    menuMore.setAttribute("leftclick", true);
    document.body.append(menuMore);
    const menuLayerBox = document.createElement("se-cmenu-layers");
    menuLayerBox.setAttribute("id", "se-cmenu-layers-list");
    menuLayerBox.value = "layerlist";
    menuLayerBox.setAttribute("leftclick", false);
    document.body.append(menuLayerBox);
    document
      .getElementById("layer_new")
      .addEventListener("click", this.newLayer.bind(this));
    document
      .getElementById("layer_delete")
      .addEventListener("click", this.deleteLayer.bind(this));
    document
      .getElementById("layer_up")
      .addEventListener("click", () => this.moveLayer.bind(this)(-1));
    document
      .getElementById("layer_down")
      .addEventListener("click", () => this.moveLayer.bind(this)(1));
    document
      .getElementById("layer_rename")
      .addEventListener("click", this.layerRename.bind(this));
    $id("se-cmenu-layers-more").addEventListener(
      "change",
      this.lmenuFunc.bind(this)
    );
    $id("se-cmenu-layers-list").addEventListener("change", e => {
      this.lmenuFunc(e);
    });
    $id("sidepanel_handle").addEventListener(
      "click",
      this.toggleSidePanel.bind(this)
    );
    if (this.editor.configObj.curConfig.showlayers) {
      this.toggleSidePanel();
    }
    $id("sidepanel_handle").addEventListener("mousedown", evt => {
      this.sidedrag = evt.pageX;
      window.addEventListener("mousemove", this.resizeSidePanel.bind(this));
      this.allowmove = false;
      // Silly hack for Chrome, which always runs mousemove right after mousedown
      setTimeout(() => {
        this.allowmove = true;
      }, 20);
    });
    $id("sidepanel_handle").addEventListener("mouseup", evt => {
      if (!this.sidedragging) {
        this.toggleSidePanel();
      }
      this.sidedrag = -1;
      this.sidedragging = false;
    });
    window.addEventListener("mouseup", evt => {
      this.sidedrag = -1;
      this.sidedragging = false;
      $id("svg_editor").removeEventListener(
        "mousemove",
        this.resizeSidePanel.bind(this)
      );
    });
  }
  /**
   * @returns {void}
   */
  newLayer() {
    let uniqName;
    let i = this.editor.svgCanvas.getCurrentDrawing().getNumLayers();
    do {
      uniqName = this.uiStrings.layers.layer + " " + ++i;
    } while (this.editor.svgCanvas.getCurrentDrawing().hasLayer(uniqName));

    const newName = prompt(
      this.uiStrings.notification.enterUniqueLayerName,
      uniqName
    );
    if (!newName) {
      return;
    }
    if (this.editor.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.uiStrings.notification.dupeLayerName);
      return;
    }
    this.editor.svgCanvas.createLayer(newName);
    this.updateContextPanel();
    this.populateLayers();
  }

  /**
   *
   * @returns {void}
   */
  deleteLayer() {
    if (this.editor.svgCanvas.deleteCurrentLayer()) {
      this.updateContextPanel();
      this.populateLayers();
      // This matches what this.editor.svgCanvas does
      // TODO: make this behavior less brittle (svg-editor should get which
      // layer is selected from the canvas and then select that one in the UI)
      $("#layerlist tr.layer").removeClass("layersel");
      $("#layerlist tr.layer:first").addClass("layersel");
    }
  }

  /**
   *
   * @returns {void}
   */
  cloneLayer() {
    const name =
      this.editor.svgCanvas.getCurrentDrawing().getCurrentLayerName() + " copy";

    const newName = prompt(
      this.uiStrings.notification.enterUniqueLayerName,
      name
    );
    if (!newName) {
      return;
    }
    if (this.editor.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.uiStrings.notification.dupeLayerName);
      return;
    }
    this.editor.svgCanvas.cloneLayer(newName);
    this.updateContextPanel();
    this.populateLayers();
  }

  /**
   *
   * @returns {void}
   */
  mergeLayer() {
    if (
      $("#layerlist tr.layersel").index() ===
      this.editor.svgCanvas.getCurrentDrawing().getNumLayers() - 1
    ) {
      return;
    }
    this.editor.svgCanvas.mergeLayer();
    this.updateContextPanel();
    this.populateLayers();
  }

  /**
   * @param {Integer} pos
   * @returns {void}
   */
  moveLayer(pos) {
    const total = this.editor.svgCanvas.getCurrentDrawing().getNumLayers();

    let curIndex = $("#layerlist tr.layersel").index();
    if (curIndex > 0 || curIndex < total - 1) {
      curIndex += pos;
      this.editor.svgCanvas.setCurrentLayerPosition(total - curIndex - 1);
      this.populateLayers();
    }
  }

  /**
   * @returns {void}
   */
  layerRename() {
    // const curIndex = $('#layerlist tr.layersel').prevAll().length; // Currently unused
    const oldName = $("#layerlist tr.layersel td.layername").text();
    const newName = prompt(this.uiStrings.notification.enterNewLayerName, "");
    if (!newName) {
      return;
    }
    if (
      oldName === newName ||
      this.editor.svgCanvas.getCurrentDrawing().hasLayer(newName)
    ) {
      alert(this.uiStrings.notification.layerHasThatName);
      return;
    }
    this.editor.svgCanvas.renameCurrentLayer(newName);
    this.populateLayers();
  }

  /**
   * This function highlights the layer passed in (by fading out the other layers).
   * If no layer is passed in, this function restores the other layers.
   * @param {string} [layerNameToHighlight]
   * @returns {void}
   */
  toggleHighlightLayer(layerNameToHighlight) {
    let i;
    const curNames = [],
      numLayers = this.editor.svgCanvas.getCurrentDrawing().getNumLayers();
    for (i = 0; i < numLayers; i++) {
      curNames[i] = this.editor.svgCanvas.getCurrentDrawing().getLayerName(i);
    }

    if (layerNameToHighlight) {
      curNames.forEach(curName => {
        if (curName !== layerNameToHighlight) {
          this.editor.svgCanvas
            .getCurrentDrawing()
            .setLayerOpacity(curName, 0.5);
        }
      });
    } else {
      curNames.forEach(curName => {
        this.editor.svgCanvas.getCurrentDrawing().setLayerOpacity(curName, 1.0);
      });
    }
  }

  /**
   * @returns {void}
   */
  populateLayers() {
    this.editor.svgCanvas.clearSelection();
    const layerlist = $("#layerlist tbody").empty();
    const selLayerNames = $("#selLayerNames").empty();
    const drawing = this.editor.svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    let layer = this.editor.svgCanvas.getCurrentDrawing().getNumLayers();
    // we get the layers in the reverse z-order (the layer rendered on top is listed first)
    while (layer--) {
      const name = drawing.getLayerName(layer);
      const layerTr = $('<tr class="layer">').toggleClass(
        "layersel",
        name === currentLayerName
      );
      const layerVis = $('<td class="layervis">').toggleClass(
        "layerinvis",
        !drawing.getLayerVisibility(name)
      );
      const layerName = $('<td class="layername">' + name + "</td>");
      layerlist.append(layerTr.append(layerVis, layerName));
      selLayerNames.append(
        '<option value="' + name + '">' + name + "</option>"
      );
    }
    // handle selection of layer
    $("#layerlist td.layername")
      .mouseup(evt => {
        $("#layerlist tr.layer").removeClass("layersel");
        $(evt.currentTarget.parentNode).addClass("layersel");
        this.editor.svgCanvas.setCurrentLayer(evt.currentTarget.textContent);
        evt.preventDefault();
      })
      .mouseover(evt => {
        this.toggleHighlightLayer(
          this.editor.svgCanvas,
          evt.currentTarget.textContent
        );
      })
      .mouseout(() => {
        this.toggleHighlightLayer(this.editor.svgCanvas);
      });
    $("#layerlist td.layervis").click(evt => {
      const row = $(evt.currentTarget.parentNode).prevAll().length;
      const name = $("#layerlist tr.layer:eq(" + row + ") td.layername").text();
      const vis = $(evt.currentTarget).hasClass("layerinvis");
      this.editor.svgCanvas.setLayerVisibility(name, vis);
      $(evt.currentTarget).toggleClass("layerinvis");
    });

    // if there were too few rows, let's add a few to make it not so lonely
    let num = 5 - $("#layerlist tr.layer").size();
    while (num-- > 0) {
      // TODO: there must a better way to do this
      layerlist.append('<tr><td style="color:white">_</td><td/></tr>');
    }
  }
}

export default LayersPanel;
