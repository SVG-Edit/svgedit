import SvgCanvas from "../../svgcanvas/svgcanvas.js";

const { $id, $qa } = SvgCanvas;

/*
 * register actions for left panel
 */
/**
 * @type {module}
 */
class LeftPanel {
  /**
   * @param {PlainObject} editor svgedit handler
   */
  constructor(editor) {
    this.editor = editor;
  }
  /**
   * This is a common function used when a tool has been clicked (chosen).
   * It does several common things:
   * - Removes the pressed button from whatever tool currently has it.
   * - Adds the the pressed button  to the button passed in.
   * @function this.updateLeftPanel
   * @param {string|Element} button The DOM element or string selector representing the toolbar button
   * @returns {boolean} Whether the button was disabled or not
   */
  // eslint-disable-next-line class-methods-use-this
  updateLeftPanel(button) {
    if (button.disabled) return false;
    // remove the pressed state on other(s) button(s)
    $qa("#tools_left *[pressed]").forEach((b) => {
      b.pressed = false;
    });
    // pressed state for the clicked button
    $id(button).pressed = true;
    return true;
  }

  /**
   * Unless the select toolbar button is disabled, sets the button
   * and sets the select mode and cursor styles.
   * @function module:SVGEditor.clickSelect
   * @returns {void}
   */
  clickSelect() {
    if (this.updateLeftPanel("tool_select")) {
      this.editor.workarea.style.cursor = "auto";
      this.editor.svgCanvas.setMode("select");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickFHPath() {
    if (this.updateLeftPanel("tool_fhpath")) {
      this.editor.svgCanvas.setMode("fhpath");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickLine() {
    if (this.updateLeftPanel("tool_line")) {
      this.editor.svgCanvas.setMode("line");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickSquare() {
    if (this.updateLeftPanel("tool_square")) {
      this.editor.svgCanvas.setMode("square");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickRect() {
    if (this.updateLeftPanel("tool_rect")) {
      this.editor.svgCanvas.setMode("rect");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickFHRect() {
    if (this.updateLeftPanel("tool_fhrect")) {
      this.editor.svgCanvas.setMode("fhrect");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickCircle() {
    if (this.updateLeftPanel("tool_circle")) {
      this.editor.svgCanvas.setMode("circle");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickEllipse() {
    if (this.updateLeftPanel("tool_ellipse")) {
      this.editor.svgCanvas.setMode("ellipse");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickFHEllipse() {
    if (this.updateLeftPanel("tool_fhellipse")) {
      this.editor.svgCanvas.setMode("fhellipse");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickImage() {
    if (this.updateLeftPanel("tool_image")) {
      this.editor.svgCanvas.setMode("image");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickZoom() {
    if (this.updateLeftPanel("tool_zoom")) {
      this.editor.svgCanvas.setMode("zoom");
      this.editor.workarea.style.cursor = this.editor.zoomInIcon;
    }
  }

  /**
   *
   * @returns {void}
   */
  dblclickZoom() {
    if (this.updateLeftPanel("tool_zoom")) {
      this.editor.zoomImage();
      this.clickSelect();
    }
  }

  /**
   *
   * @returns {void}
   */
  clickText() {
    if (this.updateLeftPanel("tool_text")) {
      this.editor.svgCanvas.setMode("text");
    }
  }

  /**
   *
   * @returns {void}
   */
  clickPath() {
    if (this.updateLeftPanel("tool_path")) {
      this.editor.svgCanvas.setMode("path");
    }
  }
  /**
   * @type {module}
   */
  add(id, handler) {
    $id(id).addEventListener("click", () => {
      if (this.updateLeftPanel(id)) {
        handler();
      }
    });
  }
  /**
   * @type {module}
   */
  init() {
    const { i18next } = this.editor;
    // add Left panel
    const template = document.createElement("template");
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = `
    <div id="tools_left">
     <se-button id="tool_select" title="${i18next.t('tools.mode_select')}" src="./images/select.svg"></se-button>
     <se-button id="tool_zoom" title="${i18next.t('tools.mode_zoom')}" src="./images/zoom.svg" shortcut="Z"></se-button>
     <se-button id="tool_fhpath" title="${i18next.t('tools.mode_fhpath')}" src="./images/pencil.svg" shortcut="Q"></se-button>
     <se-button id="tool_line" title="${i18next.t('tools.mode_line')}" src="./images/pen.svg" shortcut="L"></se-button>
     <se-button id="tool_path" title="${i18next.t('tools.mode_path')}" src="./images/path.svg" shortcut="P"></se-button>
     <se-flyingbutton id="tools_rect" title="${i18next.t('tools.square_rect_tool')}">
       <se-button id="tool_rect" title="${i18next.t('tools.mode_rect')}" src="./images/rect.svg" shortcut="R"></se-button>
       <se-button id="tool_square" title="${i18next.t('tools.mode_square')}" src="./images/square.svg"></se-button>
       <se-button id="tool_fhrect" title="${i18next.t('tools.mode_fhrect')}" src="./images/fh_rect.svg"></se-button>
     </se-flyingbutton>
     <se-flyingbutton id="tools_ellipse" title="${i18next.t('tools.ellipse_circle_tool')}">
       <se-button id="tool_ellipse" title="${i18next.t('tools.mode_ellipse')}" src="./images/ellipse.svg" shortcut="E"></se-button>
       <se-button id="tool_circle" title="${i18next.t('tools.mode_circle')}" src="./images/circle.svg"></se-button>
       <se-button id="tool_fhellipse" title="${i18next.t('tools.mode_fhellipse')}" src="./images/fh_ellipse.svg"></se-button>
     </se-flyingbutton>
     <se-button id="tool_text" title="${i18next.t('tools.mode_text')}" src="./images/text.svg" shortcut="T"></se-button>
     <se-button id="tool_image" title="${i18next.t('tools.mode_image')}" src="./images/image.svg"></se-button>
    </div> <!-- tools_left -->
     `;
    this.editor.$svgEditor.append(template.content.cloneNode(true));
    // register actions for left panel
    $id("tool_select").addEventListener("click", this.clickSelect.bind(this));
    $id("tool_fhpath").addEventListener("click", this.clickFHPath.bind(this));
    $id("tool_text").addEventListener("click", this.clickText.bind(this));
    $id("tool_image").addEventListener("click", this.clickImage.bind(this));
    $id("tool_zoom").addEventListener("click", this.clickZoom.bind(this));
    $id("tool_zoom").addEventListener("dblclick", this.dblclickZoom.bind(this));
    $id("tool_path").addEventListener("click", this.clickPath.bind(this));
    $id("tool_line").addEventListener("click", this.clickLine.bind(this));

    // flyout
    $id("tool_rect").addEventListener("click", this.clickRect.bind(this));
    $id("tool_square").addEventListener("click", this.clickSquare.bind(this));
    $id("tool_fhrect").addEventListener("click", this.clickFHRect.bind(this));
    $id("tool_ellipse").addEventListener("click", this.clickEllipse.bind(this));
    $id("tool_circle").addEventListener("click", this.clickCircle.bind(this));
    $id("tool_fhellipse").addEventListener(
      "click",
      this.clickFHEllipse.bind(this)
    );
  }
}

export default LeftPanel;
