import SvgCanvas from '../../svgcanvas/svgcanvas.js';

const {$id, $qa} = SvgCanvas;

/*
 * register actions for left panel
 */
/**
  * @type {module}
*/
class LeftPanelHandlers {
  /**
   * @param {PlainObject} editor svgedit handler
  */
  constructor (editor) {
    this.editor = editor;
    this.svgCanvas = editor.svgCanvas;
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
  updateLeftPanel (button) {
    if (button.disabled) return false;
    // remove the pressed state on other(s) button(s)
    $qa('#tools_left *[pressed]').forEach((b) => { b.pressed = false; });
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
  clickSelect () {
    if (this.updateLeftPanel('tool_select')) {
      this.editor.workarea.style.cursor = "auto";
      this.svgCanvas.setMode('select');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickFHPath () {
    if (this.updateLeftPanel('tool_fhpath')) {
      this.svgCanvas.setMode('fhpath');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickLine () {
    if (this.updateLeftPanel('tool_line')) {
      this.svgCanvas.setMode('line');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickSquare () {
    if (this.updateLeftPanel('tool_square')) {
      this.svgCanvas.setMode('square');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickRect () {
    if (this.updateLeftPanel('tool_rect')) {
      this.svgCanvas.setMode('rect');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickFHRect () {
    if (this.updateLeftPanel('tool_fhrect')) {
      this.svgCanvas.setMode('fhrect');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickCircle () {
    if (this.updateLeftPanel('tool_circle')) {
      this.svgCanvas.setMode('circle');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickEllipse () {
    if (this.updateLeftPanel('tool_ellipse')) {
      this.svgCanvas.setMode('ellipse');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickFHEllipse () {
    if (this.updateLeftPanel('tool_fhellipse')) {
      this.svgCanvas.setMode('fhellipse');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickImage () {
    if (this.updateLeftPanel('tool_image')) {
      this.svgCanvas.setMode('image');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickZoom () {
    if (this.updateLeftPanel('tool_zoom')) {
      this.svgCanvas.setMode('zoom');
      this.editor.workarea.css('cursor', this.editor.zoomInIcon);
    }
  }

  /**
  *
  * @returns {void}
  */
  dblclickZoom () {
    if (this.updateLeftPanel('tool_zoom')) {
      this.editor.zoomImage();
      this.clickSelect();
    }
  }

  /**
  *
  * @returns {void}
  */
  clickText () {
    if (this.updateLeftPanel('tool_text')) {
      this.svgCanvas.setMode('text');
    }
  }

  /**
  *
  * @returns {void}
  */
  clickPath () {
    if (this.updateLeftPanel('tool_path')) {
      this.svgCanvas.setMode('path');
    }
  }
  /**
  * @type {module}
  */
  add (id, handler) {
    $id(id).addEventListener('click', () => {
      if (this.updateLeftPanel(id)) {
        handler();
      }
    });
  }
  /**
  * @type {module}
  */
  init () {
    // register actions for left panel
    $id('tool_select').addEventListener('click', this.clickSelect.bind(this));
    $id('tool_fhpath').addEventListener('click', this.clickFHPath.bind(this));
    $id('tool_text').addEventListener('click', this.clickText.bind(this));
    $id('tool_image').addEventListener('click', this.clickImage.bind(this));
    $id('tool_zoom').addEventListener('click', this.clickZoom.bind(this));
    $id('tool_zoom').addEventListener('dblclick', this.dblclickZoom.bind(this));
    $id('tool_path').addEventListener('click', this.clickPath.bind(this));
    $id('tool_line').addEventListener('click', this.clickLine.bind(this));

    // flyout
    $id('tool_rect').addEventListener('click', this.clickRect.bind(this));
    $id('tool_square').addEventListener('click', this.clickSquare.bind(this));
    $id('tool_fhrect').addEventListener('click', this.clickFHRect.bind(this));
    $id('tool_ellipse').addEventListener('click', this.clickEllipse.bind(this));
    $id('tool_circle').addEventListener('click', this.clickCircle.bind(this));
    $id('tool_fhellipse').addEventListener('click', this.clickFHEllipse.bind(this));
  }
}

export default LeftPanelHandlers;
