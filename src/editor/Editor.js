/* globals seConfirm seAlert */
/**
 * The main module for the visual SVG this.
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 * 2010 Pavol Rusnak
 * 2010 Jeff Schiller
 * 2010 Narendra Sisodiya
 * 2014 Brett Zamir
 * 2020 OptimistikSAS
 * @module SVGEditor
 */

import './components/index.js'
import './dialogs/index.js'

import { isMac } from '../common/browser.js'

import SvgCanvas from '@svgedit/svgcanvas'
import ConfigObj from './ConfigObj.js'
import EditorStartup from './EditorStartup.js'
import LeftPanel from './panels/LeftPanel.js'
import TopPanel from './panels/TopPanel.js'
import BottomPanel from './panels/BottomPanel.js'
import LayersPanel from './panels/LayersPanel.js'
import MainMenu from './MainMenu.js'
import { getParentsUntil } from '../common/util.js'

const { $id, $click, decode64, blankPageObjectURL } = SvgCanvas

/**
 *
 */
class Editor extends EditorStartup {
  /**
   *
   */
  constructor (div = null) {
    super(div)
    /**
     * @type {boolean}
     */
    this.langChanged = false
    /**
     * @type {boolean}
     */
    this.showSaveWarning = false
    /**
     * Will be set to a boolean by `ext-storage.js`
     * @type {"ignore"|"waiting"|"closed"}
     */
    this.storagePromptState = 'ignore'
    /**
     * document title
     */
    this.title = 'untitled.svg'

    this.svgCanvas = null
    this.$click = $click
    this.isReady = false
    this.customExportImage = false
    this.customExportPDF = false
    this.configObj = new ConfigObj(this)
    this.configObj.pref = this.configObj.pref.bind(this.configObj)
    this.setConfig = this.configObj.setConfig.bind(this.configObj)
    this.callbacks = []
    this.curContext = null
    this.exportWindowName = null
    this.docprops = false
    this.configObj.preferences = false
    this.canvMenu = null
    this.goodLangs = ['ar', 'cs', 'de', 'en', 'es', 'fa', 'fr', 'fy', 'hi', 'it', 'ja', 'nl', 'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sl', 'tr', 'zh-CN', 'zh-TW']
    const modKey = (isMac() ? 'meta+' : 'ctrl+')
    this.shortcuts = [
      // Shortcuts not associated with buttons
      { key: 'ctrl+arrowleft', fn: () => { this.rotateSelected(0, 1) } },
      { key: 'ctrl+arrowright', fn: () => { this.rotateSelected(1, 1) } },
      { key: 'ctrl+shift+arrowleft', fn: () => { this.rotateSelected(0, 5) } },
      { key: 'ctrl+shift+arrowright', fn: () => { this.rotateSelected(1, 5) } },
      { key: 'shift+o', fn: () => { this.svgCanvas.cycleElement(0) } },
      { key: 'shift+p', fn: () => { this.svgCanvas.cycleElement(1) } },
      { key: 'tab', fn: () => { this.svgCanvas.cycleElement(0) } },
      { key: 'shift+tab', fn: () => { this.svgCanvas.cycleElement(1) } },
      { key: [modKey + 'arrowup', true], fn: () => { this.zoomImage(2) } },
      { key: [modKey + 'arrowdown', true], fn: () => { this.zoomImage(0.5) } },
      { key: [modKey + ']', true], fn: () => { this.moveUpDownSelected('Up') } },
      { key: [modKey + '[', true], fn: () => { this.moveUpDownSelected('Down') } },
      { key: ['arrowup', true], fn: () => { this.moveSelected(0, -1) } },
      { key: ['arrowdown', true], fn: () => { this.moveSelected(0, 1) } },
      { key: ['arrowleft', true], fn: () => { this.moveSelected(-1, 0) } },
      { key: ['arrowright', true], fn: () => { this.moveSelected(1, 0) } },
      { key: 'shift+arrowup', fn: () => { this.moveSelected(0, -10) } },
      { key: 'shift+arrowdown', fn: () => { this.moveSelected(0, 10) } },
      { key: 'shift+arrowleft', fn: () => { this.moveSelected(-10, 0) } },
      { key: 'shift+arrowright', fn: () => { this.moveSelected(10, 0) } },
      { key: ['alt+arrowup', true], fn: () => { this.svgCanvas.cloneSelectedElements(0, -1) } },
      { key: ['alt+arrowdown', true], fn: () => { this.svgCanvas.cloneSelectedElements(0, 1) } },
      { key: ['alt+arrowleft', true], fn: () => { this.svgCanvas.cloneSelectedElements(-1, 0) } },
      { key: ['alt+arrowright', true], fn: () => { this.svgCanvas.cloneSelectedElements(1, 0) } },
      { key: ['alt+shift+arrowup', true], fn: () => { this.svgCanvas.cloneSelectedElements(0, -10) } },
      { key: ['alt+shift+arrowdown', true], fn: () => { this.svgCanvas.cloneSelectedElements(0, 10) } },
      { key: ['alt+shift+arrowleft', true], fn: () => { this.svgCanvas.cloneSelectedElements(-10, 0) } },
      { key: ['alt+shift+arrowright', true], fn: () => { this.svgCanvas.cloneSelectedElements(10, 0) } },
      {
        key: ['delete/backspace', true],
        fn: () => {
          if (this.selectedElement || this.multiselected) { this.svgCanvas.deleteSelectedElements() }
        }
      },
      { key: 'a', fn: () => { this.svgCanvas.selectAllInCurrentLayer() } },
      { key: modKey + 'a', fn: () => { this.svgCanvas.selectAllInCurrentLayer() } },
      { key: modKey + 'x', fn: () => { this.cutSelected() } },
      { key: modKey + 'c', fn: () => { this.copySelected() } },
      { key: modKey + 'v', fn: () => { this.pasteInCenter() } }
    ]
    this.leftPanel = new LeftPanel(this)
    this.bottomPanel = new BottomPanel(this)
    this.topPanel = new TopPanel(this)
    this.layersPanel = new LayersPanel(this)
    this.mainMenu = new MainMenu(this)
    // makes svgEditor accessible as a global variable
    window.svgEditor = this
  } // end Constructor

  /**
   *
   * @param {string} str SVG string
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.noAlert]
   * @throws {Error} Upon failure to load SVG
   * @returns {void}
   */
  loadSvgString (str, { noAlert } = {}) {
    const success = this.svgCanvas.setSvgString(str) !== false
    if (success) {
      this.updateCanvas()
      return
    }
    if (!noAlert) seAlert(this.i18next.t('notification.errorLoadingSVG'))
    throw new Error('Error loading SVG')
  }

  /**
   * All methods are optional.
   * @interface module:SVGthis.CustomHandler
   * @type {PlainObject}
   */
  /**
   * Its responsibilities are:
   *  - invoke a file chooser dialog in 'open' mode
   *  - let user pick a SVG file
   *  - calls [svgCanvas.setSvgString()]{@link module:svgcanvas.SvgCanvas#setSvgString} with the string contents of that file.
   * Not passed any parameters.
   * @function module:SVGthis.CustomHandler#open
   * @returns {void}
   */
  /**
   * Its responsibilities are:
   *  - accept the string contents of the current document
   *  - invoke a file chooser dialog in 'save' mode
   *  - save the file to location chosen by the user.
   * @function module:SVGthis.CustomHandler#save
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:saved} svgStr A string of the SVG
   * @listens module:svgcanvas.SvgCanvas#event:saved
   * @returns {void}
   */
  /**
   * Its responsibilities (with regard to the object it is supplied in its 2nd argument) are:
   *  - inform user of any issues supplied via the "issues" property
   *  - convert the "svg" property SVG string into an image for export;
   *    utilize the properties "type" (currently 'PNG', 'JPEG', 'BMP',
   *    'WEBP', 'PDF'), "mimeType", and "quality" (for 'JPEG' and 'WEBP'
   *    types) to determine the proper output.
   * @function module:SVGthis.CustomHandler#exportImage
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:exported} data
   * @listens module:svgcanvas.SvgCanvas#event:exported
   * @returns {void}
   */
  /**
   * @function module:SVGthis.CustomHandler#exportPDF
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:exportedPDF} data
   * @listens module:svgcanvas.SvgCanvas#event:exportedPDF
   * @returns {void}
   */

  /**
   * @function module:SVGthis.randomizeIds
   * @param {boolean} arg
   * @returns {void}
   */
  randomizeIds (arg) {
    this.svgCanvas.randomizeIds(arg)
  }

  /** @lends module:SVGEditor~Actions */
  /**
   * @returns {void}
   */
  setAll () {
    const keyHandler = {} // will contain the action for each pressed key

    this.shortcuts.forEach(shortcut => {
      // Bind function to shortcut key
      if (shortcut.key) {
        // Set shortcut based on options
        let keyval = shortcut.key
        let pd = false
        if (Array.isArray(shortcut.key)) {
          keyval = shortcut.key[0]
          if (shortcut.key.length > 1) {
            pd = shortcut.key[1]
          }
        }
        keyval = String(keyval)
        const { fn } = shortcut
        keyval.split('/').forEach(key => {
          keyHandler[key] = { fn, pd }
        })
      }
      return true
    })
    // register the keydown event
    document.addEventListener('keydown', e => {
      // only track keyboard shortcuts for the body containing the SVG-Editor
      if (e.target.nodeName !== 'BODY') return
      // normalize key
      const key = `${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${
        e.metaKey ? 'meta+' : ''
      }${e.ctrlKey ? 'ctrl+' : ''}${e.key.toLowerCase()}`
      // return if no shortcut defined for this key
      if (!keyHandler[key]) return
      // launch associated handler and preventDefault if necessary
      keyHandler[key].fn()
      if (keyHandler[key].pd) {
        e.preventDefault()
      }
    })

    // Misc additional actions

    // Make 'return' keypress trigger the change event
    const elements = document.getElementsByClassName('attr_changer')
    Array.from(elements).forEach(function (element) {
      element.addEventListener('keydown', function (evt) {
        evt.currentTarget.dispatchEvent(new Event('change'))
        evt.preventDefault()
      })
    })
    $id('image_url').addEventListener('keydown', function (evt) {
      evt.currentTarget.dispatchEvent(new Event('change'))
      evt.preventDefault()
    })
  }

  // parents() https://stackoverflow.com/a/12981248
  getParents (el, parentSelector /* optional */) {
    // If no parentSelector defined will bubble up all the way to *document*
    if (parentSelector === undefined) {
      parentSelector = document
    }

    const parents = []
    let p = el.parentNode

    while (p !== parentSelector) {
      const o = p
      parents.push(o)
      p = o.parentNode
    }
    parents.push(parentSelector) // Push that parentSelector you wanted to stop at

    return parents
  }

  /**
   * @param {string} sel Selector to match
   * @returns {module:SVGthis.ToolButton}
   */
  getButtonData (sel) {
    return Object.values(this.shortcuts).find(btn => {
      return btn.sel === sel
    })
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:exported} data
   * @listens module:svgcanvas.SvgCanvas#event:exported
   * @returns {void}
   */
  exportHandler (win, data) {
    const { issues, exportWindowName } = data

    this.exportWindow = window.open(blankPageObjectURL || '', exportWindowName) // A hack to get the window via JSON-able name without opening a new one

    if (!this.exportWindow || this.exportWindow.closed) {
      seAlert(this.i18next.t('notification.popupWindowBlocked'))
      return
    }

    this.exportWindow.location.href = data.bloburl || data.datauri
    const done = this.configObj.pref('export_notice_done')
    if (done !== 'all') {
      let note = this.i18next.t('notification.saveFromBrowser', {
        type: data.type
      })

      // Check if there are issues
      if (issues.length) {
        const pre = '\n \u2022 '
        note +=
          '\n\n' +
          this.i18next.t('notification..noteTheseIssues') +
          pre +
          issues.join(pre)
      }

      // Note that this will also prevent the notice even though new issues may appear later.
      // May want to find a way to deal with that without annoying the user
      this.configObj.pref('export_notice_done', 'all')
      seAlert(note)
    }
  }

  /**
   *
   * @param {string} color
   * @param {string} url
   * @returns {void}
   */
  setBackground (color, url) {
    // if (color == this.configObj.pref('bkgd_color') && url == this.configObj.pref('bkgd_url')) { return; }
    this.configObj.pref('bkgd_color', color)
    this.configObj.pref('bkgd_url', url, true)

    // This should be done in  this.svgCanvas.js for the borderRect fill
    this.svgCanvas.setBackground(color, url)
  }

  /**
   * @function module:SVGthis.updateCanvas
   * @param {boolean} center
   * @param {module:math.XYObject} newCtr
   * @returns {void}
   */
  updateCanvas (center, newCtr) {
    const zoom = this.svgCanvas.getZoom()
    const { workarea } = this
    const cnvs = $id('svgcanvas')

    let w = parseFloat(getComputedStyle(workarea, null).width.replace('px', ''))
    let h = parseFloat(
      getComputedStyle(workarea, null).height.replace('px', '')
    )
    const wOrig = w
    const hOrig = h
    const oldCtr = {
      x: workarea.scrollLeft + wOrig / 2,
      y: workarea.scrollTop + hOrig / 2
    }
    const multi = this.configObj.curConfig.canvas_expansion
    w = Math.max(wOrig, this.svgCanvas.contentW * zoom * multi)
    h = Math.max(hOrig, this.svgCanvas.contentH * zoom * multi)

    if (w === wOrig && h === hOrig) {
      workarea.style.overflow = 'hidden'
    } else {
      workarea.style.overflow = 'scroll'
    }

    const oldCanY =
      parseFloat(getComputedStyle(cnvs, null).height.replace('px', '')) / 2
    const oldCanX =
      parseFloat(getComputedStyle(cnvs, null).width.replace('px', '')) / 2

    cnvs.style.width = w + 'px'
    cnvs.style.height = h + 'px'
    const newCanY = h / 2
    const newCanX = w / 2
    const offset = this.svgCanvas.updateCanvas(w, h)

    const ratio = newCanX / oldCanX

    const scrollX = w / 2 - wOrig / 2
    const scrollY = h / 2 - hOrig / 2

    if (!newCtr) {
      const oldDistX = oldCtr.x - oldCanX
      const newX = newCanX + oldDistX * ratio

      const oldDistY = oldCtr.y - oldCanY
      const newY = newCanY + oldDistY * ratio

      newCtr = {
        x: newX,
        y: newY
      }
    } else {
      newCtr.x += offset.x
      newCtr.y += offset.y
    }

    if (center) {
      // Go to top-left for larger documents
      if (
        this.svgCanvas.contentW >
        parseFloat(getComputedStyle(workarea, null).width.replace('px', ''))
      ) {
        // Top-left
        workarea.scrollLeft = offset.x - 10
        workarea.scrollTop = offset.y - 10
      } else {
        // Center
        workarea.scrollLeft = scrollX
        workarea.scrollTop = scrollY
      }
    } else {
      workarea.scrollLeft = newCtr.x - wOrig / 2
      workarea.scrollTop = newCtr.y - hOrig / 2
    }
    if (this.configObj.curConfig.showRulers) {
      this.rulers.updateRulers(cnvs, zoom)
      workarea.scroll()
    }

    if (
      this.configObj.urldata.storagePrompt !== true &&
      this.storagePromptState === 'ignore'
    ) {
      if ($id('dialog_box') != null) $id('dialog_box').style.display = 'none'
    }
  }

  /**
   *
   * @returns {void}
   */
  updateWireFrame () {
    const rule = `
      #workarea.wireframe #svgcontent * {
        stroke-width: ${1 / this.svgCanvas.getZoom()}px;
      }
    `
    if (document.querySelectorAll('#wireframe_rules').length > 0) {
      document.querySelector(
        '#wireframe_rules'
      ).textContent = this.workarea.classList.contains('wireframe') ? rule : ''
    }
  }

  // called when we've selected a different element
  /**
   *
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:selected} elems Array of elements that were selected
   * @listens module:svgcanvas.SvgCanvas#event:selected
   * @fires module:svgcanvas.SvgCanvas#event:ext_selectedChanged
   * @returns {void}
   */
  selectedChanged (win, elems) {
    const mode = this.svgCanvas.getMode()
    if (mode === 'select') {
      this.leftPanel.clickSelect()
    }
    const isNode = mode === 'pathedit'
    // if this.elems[1] is present, then we have more than one element
    this.selectedElement = elems.length === 1 || !elems[1] ? elems[0] : null
    this.multiselected = elems.length >= 2 && elems[1]
    if (this.selectedElement && !isNode) {
      this.topPanel.update()
    } // if (elem)

    // Deal with pathedit mode
    this.topPanel.togglePathEditMode(isNode, elems)
    this.topPanel.updateContextPanel()
    this.svgCanvas.runExtensions(
      'selectedChanged',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_selectedChanged} */ {
        elems,
        selectedElement: this.selectedElement,
        multiselected: this.multiselected
      }
    )
  }

  // Call when part of element is in process of changing, generally
  // on mousemove actions like rotate, move, etc.
  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:transition} elems
   * @listens module:svgcanvas.SvgCanvas#event:transition
   * @fires module:svgcanvas.SvgCanvas#event:ext_elementTransition
   * @returns {void}
   */
  elementTransition (win, elems) {
    const mode = this.svgCanvas.getMode()
    const elem = elems[0]

    if (!elem) {
      return
    }

    this.multiselected = elems.length >= 2 && elems[1]
    // Only updating fields for single elements for now
    if (!this.multiselected) {
      switch (mode) {
        case 'rotate': {
          const ang = this.svgCanvas.getRotationAngle(elem)
          $id('angle').value = ang
          ang === 0
            ? $id('tool_reorient').classList.add('disabled')
            : $id('tool_reorient').classList.remove('disabled')
          break
        }
      }
    }
    this.svgCanvas.runExtensions(
      'elementTransition',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_elementTransition} */ {
        elems
      }
    )
  }

  // called when any element has changed
  /**
   * @param {external:Window} win
   * @param {Array<PlainObject>} elems
   * @listens module:svgcanvas.SvgCanvas#event:changed
   * @fires module:svgcanvas.SvgCanvas#event:ext_elementChanged
   * @returns {void}
   */
  elementChanged (win, elems) {
    const mode = this.svgCanvas.getMode()
    if (mode === 'select') {
      this.leftPanel.clickSelect()
    }

    elems.forEach(elem => {
      const isSvgElem = elem?.tagName === 'svg'
      if (isSvgElem || this.svgCanvas.isLayer(elem)) {
        this.layersPanel.populateLayers()
        // if the element changed was the svg, then it could be a resolution change
        if (isSvgElem) {
          this.updateCanvas()
        }
        // Update selectedElement if element is no longer part of the image.
        // This occurs for the text elements in Firefox
      } else if (elem && !this.selectedElement?.parentNode) {
        this.selectedElement = elem
      }
    })

    this.showSaveWarning = true

    // we update the contextual panel with potentially new
    // positional/sizing information (we DON'T want to update the
    // toolbar here as that creates an infinite loop)
    // also this updates the history buttons

    // we tell it to skip focusing the text control if the
    // text element was previously in focus
    this.topPanel.updateContextPanel()

    // In the event a gradient was flipped:
    if (this.selectedElement && mode === 'select') {
      this.bottomPanel.updateColorpickers()
    }

    this.svgCanvas.runExtensions(
      'elementChanged',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_elementChanged} */ {
        elems
      }
    )
  }

  /**
   * @returns {void}
   */
  elementRenamed (win, renameObj) {
    this.svgCanvas.runExtensions(
      'elementRenamed',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_elementRenamed} */ {
        renameObj
      }
    )
  }

  /**
   * @returns {void}
   */
  afterClear (win) {
    this.svgCanvas.runExtensions(
      'afterClear'
    )
  }

  /**
   * @returns {void}
   */
  beforeClear (win) {
    this.svgCanvas.runExtensions(
      'beforeClear'
    )
  }

  /**
   * @returns {void}
   */
  zoomDone () {
    for (const el of this.svgCanvas.selectedElements) {
      this.svgCanvas.selectorManager.requestSelector(el).resize()
    }
    this.updateWireFrame()
  }

  /**
   * @typedef {PlainObject} module:SVGthis.BBoxObjectWithFactor (like `DOMRect`)
   * @property {Float} x
   * @property {Float} y
   * @property {Float} width
   * @property {Float} height
   * @property {Float} [factor] Needed if width or height are 0
   * @property {Float} [zoom]
   * @see module:svgcanvas.SvgCanvas#event:zoomed
   */

  /**
   * @function module:svgcanvas.SvgCanvas#zoomChanged
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:zoomed} bbox
   * @param {boolean} autoCenter
   * @listens module:svgcanvas.SvgCanvas#event:zoomed
   * @returns {void}
   */
  zoomChanged (win, bbox, autoCenter) {
    const scrbar = 15
    const zInfo = this.svgCanvas.setBBoxZoom(
      bbox,
      parseFloat(
        getComputedStyle(this.workarea, null).width.replace('px', '')
      ) - scrbar,
      parseFloat(
        getComputedStyle(this.workarea, null).height.replace('px', '')
      ) - scrbar
    )
    if (!zInfo) {
      return
    }
    const zoomlevel = zInfo.zoom
    const bb = zInfo.bbox

    if (zoomlevel < 0.001) {
      this.changeZoom(0.1)
      return
    }

    $id('zoom').value = (this.svgCanvas.getZoom() * 100).toFixed(1)

    if (autoCenter) {
      this.updateCanvas()
    } else {
      this.updateCanvas(false, {
        x: bb.x * zoomlevel + (bb.width * zoomlevel) / 2,
        y: bb.y * zoomlevel + (bb.height * zoomlevel) / 2
      })
    }

    if (this.svgCanvas.getMode() === 'zoom' && bb.width) {
      // Go to select if a zoom box was drawn
      this.leftPanel.clickSelect()
    }

    this.zoomDone()
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:contextset} context
   * @listens module:svgcanvas.SvgCanvas#event:contextset
   * @returns {void}
   */
  contextChanged (win, context) {
    let linkStr = ''
    if (context) {
      let str = ''
      linkStr =
        '<a href="#" data-root="y">' +
        this.svgCanvas.getCurrentDrawing().getCurrentLayerName() +
        '</a>'
      const parentsUntil = getParentsUntil(context, '#svgcontent')
      parentsUntil.forEach(function (parent) {
        if (parent.id) {
          str += ' > ' + parent.id
          linkStr +=
            parent !== context
              ? ` > <a href="#">${parent.id}</a>`
              : ` > ${parent.id}`
        }
      })

      this.curContext = str
    } else {
      this.curContext = null
    }
    $id('cur_context_panel').style.display = context ? 'block' : 'none'
    $id('cur_context_panel').innerHTML = linkStr
  }

  /**
   * @function module:SVGEditor.setIcon
   * @param {string|Element|external:jQuery} elem
   * @param {string|external:jQuery} iconId
   * @returns {void}
   */
  setIcon (elem, iconId) {
    const img = document.createElement('img')
    img.src = this.configObj.curConfig.imgPath + iconId
    const icon = typeof iconId === 'string' ? img : iconId.cloneNode(true)
    if (!icon) {
      // Todo: Investigate why this still occurs in some cases
      console.warn('NOTE: Icon image missing: ' + iconId)
      return
    }
    // empty()
    while ($id(elem).firstChild) {
      $id(elem).removeChild($id(elem).firstChild)
    }
    $id(elem).appendChild(icon)
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:extension_added} ext
   * @listens module:svgcanvas.SvgCanvas#event:extension_added
   * @returns {Promise<void>|void} Resolves to `undefined`
   */
  async extAdded (win, ext) {
    if (!ext) {
      return undefined
    }
    let cbCalled = false

    /**
     *
     * @returns {void}
     */
    const runCallback = () => {
      if (ext.callback && !cbCalled) {
        cbCalled = true
        ext.callback.call(this)
      }
    }

    if (ext.events) {
      this.leftPanel.add(ext.events.id, ext.events.click)
    }
    return runCallback()
  }

  /**
   * @param {Float} multiplier
   * @returns {void}
   */
  zoomImage (multiplier) {
    const resolution = this.svgCanvas.getResolution()
    multiplier = multiplier ? resolution.zoom * multiplier : 1
    // setResolution(res.w * multiplier, res.h * multiplier, true);
    $id('zoom').value = (multiplier * 100).toFixed(1)
    this.svgCanvas.setCurrentZoom(multiplier)
    this.zoomDone()
    this.updateCanvas(true)
  }

  /**
   *
   * @returns {void}
   */
  cutSelected () {
    if (this.selectedElement || this.multiselected) {
      this.svgCanvas.cutSelectedElements()
    }
  }

  /**
   * @function copySelected
   * @returns {void}
   */
  copySelected () {
    if (this.selectedElement || this.multiselected) {
      this.svgCanvas.copySelectedElements()
    }
  }

  /**
   *
   * @returns {void}
   */
  pasteInCenter () {
    const { workarea } = this
    const zoom = this.svgCanvas.getZoom()
    const x =
      (workarea.scrollLeft +
        parseFloat(getComputedStyle(workarea, null).width.replace('px', '')) /
          2) /
        zoom -
      this.svgCanvas.contentW
    const y =
      (workarea.scrollTop +
        parseFloat(getComputedStyle(workarea, null).height.replace('px', '')) /
          2) /
        zoom -
      this.svgCanvas.contentH
    this.svgCanvas.pasteElements('point', x, y)
  }

  /**
   * @param {"Up"|"Down"} dir
   * @returns {void}
   */
  moveUpDownSelected (dir) {
    if (this.selectedElement) {
      this.svgCanvas.moveUpDownSelected(dir)
    }
  }

  /**
   * @param {Float} dx
   * @param {Float} dy
   * @returns {void}
   */
  moveSelected (dx, dy) {
    if (this.selectedElement || this.multiselected) {
      if (this.configObj.curConfig.gridSnapping) {
        // Use grid snap value regardless of zoom level
        const multi =
          this.svgCanvas.getZoom() * this.configObj.curConfig.snappingStep
        dx *= multi
        dy *= multi
      }
      this.svgCanvas.moveSelectedElements(dx, dy)
    }
  }

  /**
   *
   * @returns {void}
   */
  selectNext () {
    this.svgCanvas.cycleElement(1)
  }

  /**
   *
   * @returns {void}
   */
  selectPrev () {
    this.svgCanvas.cycleElement(0)
  }

  /**
   * @param {0|1} cw
   * @param {Integer} step
   * @returns {void}
   */
  rotateSelected (cw, step) {
    if (!this.selectedElement || this.multiselected) {
      return
    }
    if (!cw) {
      step *= -1
    }
    const angle = Number.parseFloat($id('angle').value) + step
    this.svgCanvas.setRotationAngle(angle)
    this.topPanel.updateContextPanel()
  }

  /**
   *
   * @returns {void}
   */
  hideSourceEditor () {
    const $editorDialog = $id('se-svg-editor-dialog')
    $editorDialog.setAttribute('dialog', 'closed')
  }

  /**
   * @param {Event} e
   * @returns {void} Resolves to `undefined`
   */
  async saveSourceEditor (e) {
    const $editorDialog = $id('se-svg-editor-dialog')
    if ($editorDialog.getAttribute('dialog') !== 'open') return
    const saveChanges = () => {
      this.svgCanvas.clearSelection()
      this.hideSourceEditor()
      this.zoomImage()
      this.layersPanel.populateLayers()
    }

    if (!this.svgCanvas.setSvgString(e.detail.value)) {
      const ok = await seConfirm(
        this.i18next.t('notification.QerrorsRevertToSource')
      )
      if (ok === false || ok === 'Cancel') {
        return
      }
      saveChanges()
      return
    }
    saveChanges()
    this.leftPanel.clickSelect()
  }

  /**
   * @param {Event} e
   * @returns {void} Resolves to `undefined`
   */
  cancelOverlays (e) {
    if ($id('dialog_box') != null) $id('dialog_box').style.display = 'none'
    const $editorDialog = $id('se-svg-editor-dialog')
    const editingsource = $editorDialog.getAttribute('dialog') === 'open'
    if (!editingsource && !this.docprops && !this.configObj.preferences) {
      if (this.curContext) {
        this.svgCanvas.leaveContext()
      }
      return
    }

    if (editingsource) {
      const origSource = this.svgCanvas.getSvgString()
      if (origSource !== e.detail.value) {
        const ok = seConfirm(
          this.i18next.t('notification.QignoreSourceChanges')
        )
        if (ok) {
          this.hideSourceEditor()
        }
      } else {
        this.hideSourceEditor()
      }
    }
  }

  /**
   * @returns {void}
   */
  toggleDynamicOutput (e) {
    this.configObj.curConfig.dynamicOutput = e.detail.dynamic
    this.svgCanvas.setConfig(this.configObj.curConfig)
    const $editorDialog = document.getElementById('se-svg-editor-dialog')
    const origSource = this.svgCanvas.getSvgString()
    $editorDialog.setAttribute('dialog', 'open')
    $editorDialog.setAttribute('value', origSource)
  }

  /**
   * @returns {void}
   */
  enableOrDisableClipboard () {
    let svgeditClipboard
    try {
      svgeditClipboard = this.localStorage.getItem('svgedit_clipboard')
    } catch (err) {
      /* empty fn */
    }
    this.canvMenu.setAttribute(
      (svgeditClipboard ? 'en' : 'dis') + 'ablemenuitems',
      '#paste,#paste_in_place'
    )
  }

  /**
   * @function module:SVGthis.openPrep
   * @returns {boolean|Promise<boolean>} Resolves to boolean indicating `true` if there were no changes
   *  and `false` after the user confirms.
   */
  async openPrep () {
    if (this.svgCanvas.undoMgr.getUndoStackSize() === 0) {
      return true
    }
    return await seConfirm(this.i18next.t('notification.QwantToOpen'))
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  onDragEnter (e) {
    e.stopPropagation()
    e.preventDefault()
    // and indicator should be displayed here, such as "drop files here"
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  onDragOver (e) {
    e.stopPropagation()
    e.preventDefault()
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  onDragLeave (e) {
    e.stopPropagation()
    e.preventDefault()
    // hypothetical indicator should be removed here
  }

  /**
   * @function module:SVGthis.setLang
   * @param {string} lang The language code
   * @param {module:locale.LocaleStrings} allStrings See {@tutorial LocaleDocs}
   * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
   * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
   * @returns {void} A Promise which resolves to `undefined`
   */
  setLang (lang) {
    this.langChanged = true
    this.configObj.pref('lang', lang)
    const $editDialog = $id('se-edit-prefs')
    $editDialog.setAttribute('lang', lang)
    const oldLayerName = $id('#layerlist')
      ? $id('#layerlist').querySelector('tr.layersel td.layername').textContent
      : ''
    const renameLayer =
      oldLayerName === this.i18next.t('notification.common.layer') + ' 1'

    this.setTitles()

    if (renameLayer) {
      this.svgCanvas.renameCurrentLayer(
        this.i18next.t('notification.common.layer') + ' 1'
      )
      this.layersPanel.populateLayers()
    }

    this.svgCanvas.runExtensions(
      'langChanged',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_langChanged} */ lang
    )
  }

  /**
   * @callback module:SVGthis.ReadyCallback
   * @returns {Promise<void>|void}
   */
  /**
   * Queues a callback to be invoked when the editor is ready (or
   *   to be invoked immediately if it is already ready--i.e.,
   *   if `runCallbacks` has been run).
   * @function module:SVGthis.ready
   * @param {module:SVGthis.ReadyCallback} cb Callback to be queued to invoke
   * @returns {Promise<ArbitraryCallbackResult>} Resolves when all callbacks, including the supplied have resolved
   */
  ready (cb) {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        resolve(cb())
        return
      }
      this.callbacks.push([cb, resolve, reject])
    })
  }

  /**
   * Invokes the callbacks previous set by `svgthis.ready`
   * @function module:SVGthis.runCallbacks
   * @returns {Promise<void>} Resolves to `undefined` if all callbacks succeeded and rejects otherwise
   */
  async runCallbacks () {
    try {
      await Promise.all(
        this.callbacks.map(([cb]) => {
          return cb()
        })
      )
    } catch (err) {
      this.callbacks.forEach(([, , reject]) => {
        reject()
      })
      throw err
    }
    this.callbacks.forEach(([, resolve]) => {
      resolve()
    })
    this.isReady = true
  }

  /**
   * @function module:SVGthis.loadFromString
   * @param {string} str The SVG string to load
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.noAlert=false] Option to avoid alert to user and instead get rejected promise
   * @returns {Promise<void>}
   */
  loadFromString (str, { noAlert } = {}) {
    return this.ready(async () => {
      try {
        await this.loadSvgString(str, { noAlert })
      } catch (err) {
        if (noAlert) {
          throw err
        }
      }
    })
  }

  /**
   * @callback module:SVGthis.URLLoadCallback
   * @param {boolean} success
   * @returns {void}
   */
  /**
   * @function module:SVGthis.loadFromURL
   * @param {string} url URL from which to load an SVG string via Ajax
   * @param {PlainObject} [opts={}] May contain properties: `cache`, `callback`
   * @param {boolean} [opts.cache]
   * @param {boolean} [opts.noAlert]
   * @returns {Promise<void>} Resolves to `undefined` or rejects upon bad loading of
   *   the SVG (or upon failure to parse the loaded string) when `noAlert` is
   *   enabled
   */
  loadFromURL (url, { cache, noAlert } = {}) {
    return this.ready(() => {
      return new Promise((resolve, reject) => {
        fetch(url, { cache: cache ? 'force-cache' : 'no-cache' })
          .then(response => {
            if (!response.ok) {
              if (noAlert) {
                reject(new Error('URLLoadFail'))
                return
              }
              seAlert(this.i18next.t('notification.URLLoadFail'))
              resolve()
            }
            return response.text()
          })
          .then(str => {
            this.loadSvgString(str, { noAlert })
            return str
          })
          .catch(error => {
            if (noAlert) {
              reject(new Error('URLLoadFail'))
              return
            }
            seAlert(this.i18next.t('notification.URLLoadFail') + ': \n' + error)
            resolve()
          })
      })
    })
  }

  /**
   * @function module:SVGthis.loadFromDataURI
   * @param {string} str The Data URI to base64-decode (if relevant) and load
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.noAlert]
   * @returns {Promise<void>} Resolves to `undefined` and rejects if loading SVG string fails and `noAlert` is enabled
   */
  loadFromDataURI (str, { noAlert } = {}) {
    return this.ready(() => {
      let base64 = false
      let pre = str.match(/^data:image\/svg\+xml;base64,/)
      if (pre) {
        base64 = true
      } else {
        pre = str.match(/^data:image\/svg\+xml(?:;|;utf8)?,/)
      }
      if (pre) {
        pre = pre[0]
      }
      const src = str.slice(pre.length)
      return this.loadSvgString(
        base64 ? decode64(src) : decodeURIComponent(src),
        { noAlert }
      )
    })
  }

  /**
   * @function module:SVGthis.addExtension
   * @param {string} name Used internally; no need for i18n.
   * @param {module:svgcanvas.ExtensionInitCallback} initfn Config to be invoked on this module
   * @param {module:svgcanvas.ExtensionInitArgs} initArgs
   * @throws {Error} If called too early
   * @returns {Promise<void>} Resolves to `undefined`
   */
  addExtension (name, initfn, initArgs) {
    // Note that we don't want this on this.ready since some extensions
    // may want to run before then (like server_opensave).
    if (!this.svgCanvas) {
      throw new Error('Extension added too early')
    }
    return this.svgCanvas.addExtension(name, initfn, initArgs)
  }
}

export default Editor
