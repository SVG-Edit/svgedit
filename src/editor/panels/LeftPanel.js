import SvgCanvas from '@svgedit/svgcanvas'
import leftPanelHTML from './LeftPanel.html'

const { $id, $qa, $click } = SvgCanvas

class LeftPanel {
  constructor (editor) {
    this.editor = editor
  }

  updateLeftPanel (mode) {
    const button = $id('tool_' + mode)
    if (button.disabled) return false
    $qa('#tools_left *[pressed]').forEach(b => {
      b.pressed = false
    })
    button.pressed = true
    return true
  }

  // Generic handler for most tools
  clickTool (mode) {
    if (this.updateLeftPanel(mode)) {
      this.editor.svgCanvas.setMode(mode)
    }
  }

  // Special handler for dblclickZoom
  dblclickZoom () {
    if (this.updateLeftPanel('zoom')) {
      this.editor.zoomImage()
      // After zoom, switch back to select tool
      this.clickTool('select')
    }
  }

  init () {
    // Add left panel HTML content to the editor
    const template = document.createElement('template')
    template.innerHTML = leftPanelHTML
    this.editor.$svgEditor.append(template.content.cloneNode(true))

    // List of modes for tools (id = "tool_" + mode)
    const modes = [
      'select',
      'fhpath',
      'text',
      'image',
      'path',
      'line',
      'rect',
      'square',
      'fhrect',
      'ellipse',
      'circle',
      'fhellipse'
    ]

    modes.forEach(mode => {
      $click($id('tool_' + mode), this.clickTool.bind(this, mode))
    })

    // Special handling for zoom: click sets cursor; dblclick performs zoom action
    $click($id('tool_zoom'), () => {
      this.clickTool('zoom')
      this.editor.workarea.style.cursor = this.editor.zoomInIcon
    })

    $id('tool_zoom').addEventListener('dblclick', this.dblclickZoom.bind(this))
  }
}

export default LeftPanel
