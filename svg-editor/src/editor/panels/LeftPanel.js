import SvgCanvas from '@svgedit/svgcanvas'
import leftPanelHTML from './LeftPanel.html'

const { $id, $qa, $click } = SvgCanvas

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
  constructor (editor) {
    this.editor = editor
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
  updateLeftPanel (button) {
    if (button.disabled) return false
    // remove the pressed state on other(s) button(s)
    $qa('#tools_left *[pressed]').forEach((b) => {
      b.pressed = false
    })
    // pressed state for the clicked button
    $id(button).pressed = true
    return true
  }

  /**
   * Unless the select toolbar button is disabled, sets the button
   * and sets the select mode and cursor styles.
   * @function module:SVGEditor.clickSelect
   * @returns {void}
   */
  clickSelect () {
    if (this.updateLeftPanel('tool_select')) {
      // this.editor.workarea.style.cursor = 'auto'
      this.editor.svgCanvas.setMode('select')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickFHPath () {
    if (this.updateLeftPanel('tool_fhpath')) {
      this.editor.svgCanvas.setMode('fhpath')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickLine () {
    if (this.updateLeftPanel('tool_line')) {
      this.editor.svgCanvas.setMode('line')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickSquare () {
    if (this.updateLeftPanel('tool_square')) {
      this.editor.svgCanvas.setMode('square')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickRect () {
    if (this.updateLeftPanel('tool_rect')) {
      this.editor.svgCanvas.setMode('rect')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickFHRect () {
    if (this.updateLeftPanel('tool_fhrect')) {
      this.editor.svgCanvas.setMode('fhrect')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickCircle () {
    if (this.updateLeftPanel('tool_circle')) {
      this.editor.svgCanvas.setMode('circle')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickEllipse () {
    if (this.updateLeftPanel('tool_ellipse')) {
      this.editor.svgCanvas.setMode('ellipse')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickFHEllipse () {
    if (this.updateLeftPanel('tool_fhellipse')) {
      this.editor.svgCanvas.setMode('fhellipse')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickImage () {
    if (this.updateLeftPanel('tool_image')) {
      this.editor.svgCanvas.setMode('image')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickZoom () {
    if (this.updateLeftPanel('tool_zoom')) {
      this.editor.svgCanvas.setMode('zoom')
      this.editor.workarea.style.cursor = this.editor.zoomInIcon
    }
  }

  /**
   *
   * @returns {void}
   */
  dblclickZoom () {
    if (this.updateLeftPanel('tool_zoom')) {
      this.editor.zoomImage()
      this.clickSelect()
    }
  }

  /**
   *
   * @returns {void}
   */
  clickText () {
    if (this.updateLeftPanel('tool_text')) {
      this.editor.svgCanvas.setMode('text')
    }
  }

  /**
   *
   * @returns {void}
   */
  clickPath () {
    if (this.updateLeftPanel('tool_path')) {
      this.editor.svgCanvas.setMode('path')
    }
  }

  /**
   * @type {module}
   */
  add (id, handler) {
    $click($id(id), () => {
      if (this.updateLeftPanel(id)) {
        handler()
      }
    })
  }

  /**
   * @type {module}
   */
  init () {
    // add Left panel
    const template = document.createElement('template')
    template.innerHTML = leftPanelHTML
    this.editor.$svgEditor.append(template.content.cloneNode(true))
    // register actions for left panel
    $click($id('tool_select'), this.clickSelect.bind(this))
    $click($id('tool_fhpath'), this.clickFHPath.bind(this))
    $click($id('tool_text'), this.clickText.bind(this))
    $click($id('tool_image'), this.clickImage.bind(this))
    $click($id('tool_zoom'), this.clickZoom.bind(this))
    $id('tool_zoom').addEventListener('dblclick', this.dblclickZoom.bind(this))
    $click($id('tool_path'), this.clickPath.bind(this))
    $click($id('tool_line'), this.clickLine.bind(this))

    // flyout
    $click($id('tool_rect'), this.clickRect.bind(this))
    $click($id('tool_square'), this.clickSquare.bind(this))
    $click($id('tool_fhrect'), this.clickFHRect.bind(this))
    $click($id('tool_ellipse'), this.clickEllipse.bind(this))
    $click($id('tool_circle'), this.clickCircle.bind(this))
    $click($id('tool_fhellipse'), this.clickFHEllipse.bind(this))
  }
}

export default LeftPanel
