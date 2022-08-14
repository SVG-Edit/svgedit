/* globals seConfirm seAlert */
import {
  putLocale
} from './locale.js'
import {
  hasCustomHandler, getCustomHandler, injectExtendedContextMenuItemsIntoDom
} from './contextmenu.js'
import editorTemplate from './templates/editorTemplate.html'
import SvgCanvas from '@svgedit/svgcanvas'
import Rulers from './Rulers.js'

/**
   * @fires module:svgcanvas.SvgCanvas#event:svgEditorReady
   * @returns {void}
   */
const readySignal = () => {
  // let the opener know SVG Edit is ready (now that config is set up)
  const w = window.opener || window.parent
  if (w) {
    try {
      /**
         * Triggered on a containing `document` (of `window.opener`
         * or `window.parent`) when the editor is loaded.
         * @event module:SVGEditor#event:svgEditorReadyEvent
         * @type {Event}
         * @property {true} bubbles
         * @property {true} cancelable
         */
      /**
         * @name module:SVGthis.svgEditorReadyEvent
         * @type {module:SVGEditor#event:svgEditorReadyEvent}
         */
      const svgEditorReadyEvent = new w.CustomEvent('svgEditorReady', {
        bubbles: true,
        cancelable: true
      })
      w.document.documentElement.dispatchEvent(svgEditorReadyEvent)
    } catch (e) { /* empty fn */ }
  }
}

const { $id, $qq, $click, convertUnit } = SvgCanvas

/**
 *
 */
class EditorStartup {
  /**
   *
   */
  constructor (div) {
    this.extensionsAdded = false
    this.messageQueue = []
    this.$container = div ?? $id('svg_editor')
  }

  /**
  * Auto-run after a Promise microtask.
  * @function module:SVGthis.init
  * @returns {void}
  */
  async init () {
    if ('localStorage' in window) {
      this.storage = window.localStorage
    }
    this.configObj.load()
    const { i18next } = await putLocale(this.configObj.pref('lang'), this.goodLangs)
    this.i18next = i18next
    await import('./components/index.js')
    await import('./dialogs/index.js')
    try {
      // add editor components to the DOM
      const template = document.createElement('template')
      template.innerHTML = editorTemplate
      this.$container.append(template.content.cloneNode(true))
      this.$svgEditor = $qq('.svg_editor')
      // allow to prepare the dom without display
      this.$svgEditor.style.visibility = 'hidden'
      this.workarea = $id('workarea')
      // Image props dialog added to DOM
      const newSeImgPropDialog = document.createElement('se-img-prop-dialog')
      newSeImgPropDialog.setAttribute('id', 'se-img-prop')
      this.$container.append(newSeImgPropDialog)
      newSeImgPropDialog.init(this.i18next)
      // editor prefences dialoag added to DOM
      const newSeEditPrefsDialog = document.createElement('se-edit-prefs-dialog')
      newSeEditPrefsDialog.setAttribute('id', 'se-edit-prefs')
      this.$container.append(newSeEditPrefsDialog)
      newSeEditPrefsDialog.init(this.i18next)
      // canvas menu added to DOM
      const dialogBox = document.createElement('se-cmenu_canvas-dialog')
      dialogBox.setAttribute('id', 'se-cmenu_canvas')
      this.$container.append(dialogBox)
      dialogBox.init(this.i18next)
      // alertDialog added to DOM
      const alertBox = document.createElement('se-alert-dialog')
      alertBox.setAttribute('id', 'se-alert-dialog')
      this.$container.append(alertBox)
      // promptDialog added to DOM
      const promptBox = document.createElement('se-prompt-dialog')
      promptBox.setAttribute('id', 'se-prompt-dialog')
      this.$container.append(promptBox)
      // Export dialog added to DOM
      const exportDialog = document.createElement('se-export-dialog')
      exportDialog.setAttribute('id', 'se-export-dialog')
      this.$container.append(exportDialog)
      exportDialog.init(this.i18next)
    } catch (err) {
      console.error(err)
    }

    /**
    * @name module:SVGthis.canvas
    * @type {module:svgcanvas.SvgCanvas}
    */
    this.svgCanvas = new SvgCanvas(
      $id('svgcanvas'),
      this.configObj.curConfig
    )

    this.leftPanel.init()
    this.bottomPanel.init()
    this.topPanel.init()
    this.layersPanel.init()
    this.mainMenu.init()

    const { undoMgr } = this.svgCanvas
    this.canvMenu = $id('se-cmenu_canvas')
    this.exportWindow = null
    this.defaultImageURL = `${this.configObj.curConfig.imgPath}/logo.svg`
    const zoomInIcon = 'crosshair'
    const zoomOutIcon = 'crosshair'
    this.uiContext = 'toolbars'

    // For external openers
    readySignal()

    this.rulers = new Rulers(this)

    this.layersPanel.populateLayers()
    this.selectedElement = null
    this.multiselected = false

    const aLink = $id('cur_context_panel')

    $click(aLink, (evt) => {
      const link = evt.target
      if (link.hasAttribute('data-root')) {
        this.svgCanvas.leaveContext()
      } else {
        this.svgCanvas.setContext(link.textContent)
      }
      this.svgCanvas.clearSelection()
      return false
    })

    // bind the selected event to our function that handles updates to the UI
    this.svgCanvas.bind('selected', this.selectedChanged.bind(this))
    this.svgCanvas.bind('transition', this.elementTransition.bind(this))
    this.svgCanvas.bind('changed', this.elementChanged.bind(this))
    this.svgCanvas.bind('exported', this.exportHandler.bind(this))
    this.svgCanvas.bind('exportedPDF', function (win, data) {
      if (!data.output) { // Ignore Chrome
        return
      }
      const { exportWindowName } = data
      if (exportWindowName) {
        this.exportWindow = window.open('', this.exportWindowName) // A hack to get the window via JSON-able name without opening a new one
      }
      if (!this.exportWindow || this.exportWindow.closed) {
        seAlert(this.i18next.t('notification.popupWindowBlocked'))
        return
      }
      this.exportWindow.location.href = data.output
    }.bind(this))
    this.svgCanvas.bind('zoomed', this.zoomChanged.bind(this))
    this.svgCanvas.bind('zoomDone', this.zoomDone.bind(this))
    this.svgCanvas.bind(
      'updateCanvas',
      /**
     * @param {external:Window} win
     * @param {PlainObject} centerInfo
     * @param {false} centerInfo.center
     * @param {module:math.XYObject} centerInfo.newCtr
     * @listens module:svgcanvas.SvgCanvas#event:updateCanvas
     * @returns {void}
     */
      function (win, { center, newCtr }) {
        this.updateCanvas(center, newCtr)
      }.bind(this)
    )
    this.svgCanvas.bind('contextset', this.contextChanged.bind(this))
    this.svgCanvas.bind('extension_added', this.extAdded.bind(this))
    this.svgCanvas.bind('elementRenamed', this.elementRenamed.bind(this))

    this.svgCanvas.bind('beforeClear', this.beforeClear.bind(this))
    this.svgCanvas.bind('afterClear', this.afterClear.bind(this))

    this.svgCanvas.textActions.setInputElem($id('text'))

    this.setBackground(this.configObj.pref('bkgd_color'), this.configObj.pref('bkgd_url'))

    // update resolution option with actual resolution
    const res = this.svgCanvas.getResolution()
    if (this.configObj.curConfig.baseUnit !== 'px') {
      res.w = convertUnit(res.w) + this.configObj.curConfig.baseUnit
      res.h = convertUnit(res.h) + this.configObj.curConfig.baseUnit
    }
    $id('se-img-prop').setAttribute('dialog', 'close')
    $id('se-img-prop').setAttribute('title', this.svgCanvas.getDocumentTitle())
    $id('se-img-prop').setAttribute('width', res.w)
    $id('se-img-prop').setAttribute('height', res.h)
    $id('se-img-prop').setAttribute('save', this.configObj.pref('img_save'))

    // Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
    const selElements = document.querySelectorAll('select')
    Array.from(selElements).forEach(function (element) {
      element.addEventListener('change', function (evt) {
        evt.currentTarget.blur()
      })
    })

    // fired when user wants to move elements to another layer
    let promptMoveLayerOnce = false
    $id('selLayerNames').addEventListener('change', (evt) => {
      const destLayer = evt.detail.value
      const confirmStr = this.i18next.t('notification.QmoveElemsToLayer').replace('%s', destLayer)
      /**
    * @param {boolean} ok
    * @returns {void}
    */
      const moveToLayer = (ok) => {
        if (!ok) { return }
        promptMoveLayerOnce = true
        this.svgCanvas.moveSelectedToLayer(destLayer)
        this.svgCanvas.clearSelection()
        this.layersPanel.populateLayers()
      }
      if (destLayer) {
        if (promptMoveLayerOnce) {
          moveToLayer(true)
        } else {
          const ok = seConfirm(confirmStr)
          if (!ok) {
            return
          }
          moveToLayer(true)
        }
      }
    })
    $id('tool_font_family').addEventListener('change', (evt) => {
      this.svgCanvas.setFontFamily(evt.detail.value)
    })

    $id('seg_type').addEventListener('change', (evt) => {
      this.svgCanvas.setSegType(evt.detail.value)
    })

    const addListenerMulti = (element, eventNames, listener) => {
      eventNames.split(' ').forEach((eventName) => element.addEventListener(eventName, listener, false))
    }

    addListenerMulti($id('text'), 'keyup input', (evt) => {
      this.svgCanvas.setTextContent(evt.currentTarget.value)
    })

    $id('link_url').addEventListener('change', (evt) => {
      if (evt.currentTarget.value.length) {
        this.svgCanvas.setLinkURL(evt.currentTarget.value)
      } else {
        this.svgCanvas.removeHyperlink()
      }
    })

    $id('g_title').addEventListener('change', (evt) => {
      this.svgCanvas.setGroupTitle(evt.currentTarget.value)
    })

    let lastX = null; let lastY = null
    let panning = false; let keypan = false

    $id('svgcanvas').addEventListener('mouseup', (evt) => {
      if (panning === false) { return true }

      this.workarea.scrollLeft -= (evt.clientX - lastX)
      this.workarea.scrollTop -= (evt.clientY - lastY)

      lastX = evt.clientX
      lastY = evt.clientY

      if (evt.type === 'mouseup') { panning = false }
      return false
    })
    $id('svgcanvas').addEventListener('mousemove', (evt) => {
      if (panning === false) { return true }

      this.workarea.scrollLeft -= (evt.clientX - lastX)
      this.workarea.scrollTop -= (evt.clientY - lastY)

      lastX = evt.clientX
      lastY = evt.clientY

      if (evt.type === 'mouseup') { panning = false }
      return false
    })
    $id('svgcanvas').addEventListener('mousedown', (evt) => {
      if (evt.button === 1 || keypan === true) {
        panning = true
        lastX = evt.clientX
        lastY = evt.clientY
        return false
      }
      return true
    })

    window.addEventListener('mouseup', () => {
      panning = false
    })

    document.addEventListener('keydown', (e) => {
      if (e.target.nodeName !== 'BODY') return
      if (e.code.toLowerCase() === 'space') {
        this.svgCanvas.spaceKey = keypan = true
        e.preventDefault()
      } else if ((e.key.toLowerCase() === 'shift') && (this.svgCanvas.getMode() === 'zoom')) {
        this.workarea.style.cursor = zoomOutIcon
        e.preventDefault()
      }
    })

    document.addEventListener('keyup', (e) => {
      if (e.target.nodeName !== 'BODY') return
      if (e.code.toLowerCase() === 'space') {
        this.svgCanvas.spaceKey = keypan = false
        e.preventDefault()
      } else if ((e.key.toLowerCase() === 'shift') && (this.svgCanvas.getMode() === 'zoom')) {
        this.workarea.style.cursor = zoomInIcon
        e.preventDefault()
      }
    })

    /**
     * @function module:SVGthis.setPanning
     * @param {boolean} active
     * @returns {void}
     */
    this.setPanning = (active) => {
      this.svgCanvas.spaceKey = keypan = active
    }
    let inp
    /**
      *
      * @returns {void}
      */
    const unfocus = () => {
      inp.blur()
    }

    const liElems = this.$svgEditor.querySelectorAll('button, select, input:not(#text)')
    const self = this
    Array.prototype.forEach.call(liElems, function (el) {
      el.addEventListener('focus', (e) => {
        inp = e.currentTarget
        self.uiContext = 'toolbars'
        self.workarea.addEventListener('mousedown', unfocus)
      })
      el.addEventListener('blur', () => {
        self.uiContext = 'canvas'
        self.workarea.removeEventListener('mousedown', unfocus)
        // Go back to selecting text if in textedit mode
        if (self.svgCanvas.getMode() === 'textedit') {
          $id('text').focus()
        }
      })
    })
    // ref: https://stackoverflow.com/a/1038781
    function getWidth () {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      )
    }

    function getHeight () {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      )
    }
    const winWh = {
      width: getWidth(),
      height: getHeight()
    }

    window.addEventListener('resize', () => {
      Object.entries(winWh).forEach(([type, val]) => {
        const curval = (type === 'width') ? window.innerWidth - 15 : window.innerHeight
        this.workarea['scroll' + (type === 'width' ? 'Left' : 'Top')] -= (curval - val) / 2
        winWh[type] = curval
      })
    })

    this.workarea.addEventListener('scroll', () => {
      this.rulers.manageScroll()
    })

    $id('stroke_width').value = this.configObj.curConfig.initStroke.width
    $id('opacity').value = this.configObj.curConfig.initOpacity * 100
    const elements = document.getElementsByClassName('push_button')
    Array.from(elements).forEach(function (element) {
      element.addEventListener('mousedown', function (event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          event.currentTarget.classList.add('push_button_pressed')
          event.currentTarget.classList.remove('push_button')
        }
      })
      element.addEventListener('mouseout', function (event) {
        event.currentTarget.classList.add('push_button')
        event.currentTarget.classList.remove('push_button_pressed')
      })
      element.addEventListener('mouseup', function (event) {
        event.currentTarget.classList.add('push_button')
        event.currentTarget.classList.remove('push_button_pressed')
      })
    })

    this.layersPanel.populateLayers()

    const centerCanvas = () => {
      // this centers the canvas vertically in the this.workarea (horizontal handled in CSS)
      this.workarea.style.lineHeight = this.workarea.style.height
    }

    addListenerMulti(window, 'load resize', centerCanvas)

    // Prevent browser from erroneously repopulating fields
    const inputEles = document.querySelectorAll('input')
    Array.from(inputEles).forEach(function (inputEle) {
      inputEle.setAttribute('autocomplete', 'off')
    })
    const selectEles = document.querySelectorAll('select')
    Array.from(selectEles).forEach(function (inputEle) {
      inputEle.setAttribute('autocomplete', 'off')
    })

    $id('se-svg-editor-dialog').addEventListener('change', function (e) {
      if (e?.detail?.copy === 'click') {
        this.cancelOverlays(e)
      } else if (e?.detail?.dialog === 'dynamic') {
        this.toggleDynamicOutput(e)
      } else if (e?.detail?.dialog === 'closed') {
        this.hideSourceEditor()
      } else {
        this.saveSourceEditor(e)
      }
    }.bind(this))
    $id('se-cmenu_canvas').addEventListener('change', function (e) {
      const action = e?.detail?.trigger
      switch (action) {
        case 'delete':
          this.svgCanvas.deleteSelectedElements()
          break
        case 'cut':
          this.cutSelected()
          break
        case 'copy':
          this.copySelected()
          break
        case 'paste':
          this.svgCanvas.pasteElements()
          break
        case 'paste_in_place':
          this.svgCanvas.pasteElements('in_place')
          break
        case 'group':
        case 'group_elements':
          this.svgCanvas.groupSelectedElements()
          break
        case 'ungroup':
          this.svgCanvas.ungroupSelectedElement()
          break
        case 'move_front':
          this.svgCanvas.moveToTopSelectedElement()
          break
        case 'move_up':
          this.moveUpDownSelected('Up')
          break
        case 'move_down':
          this.moveUpDownSelected('Down')
          break
        case 'move_back':
          this.svgCanvas.moveToBottomSelectedElement()
          break
        default:
          if (hasCustomHandler(action)) {
            getCustomHandler(action).call()
          }
          break
      }
    }.bind(this))

    // Select given tool
    this.ready(function () {
      const preTool = $id(`tool_${this.configObj.curConfig.initTool}`)
      const regTool = $id(this.configObj.curConfig.initTool)
      const selectTool = $id('tool_select')
      const $editDialog = $id('se-edit-prefs')

      if (preTool) {
        preTool.click()
      } else if (regTool) {
        regTool.click()
      } else {
        selectTool.click()
      }

      if (this.configObj.curConfig.wireframe) {
        $id('tool_wireframe').click()
      }

      if (this.configObj.curConfig.showRulers) {
        this.rulers.display(true)
      } else {
        this.rulers.display(false)
      }

      if (this.configObj.curConfig.showRulers) {
        $editDialog.setAttribute('showrulers', true)
      }

      if (this.configObj.curConfig.baseUnit) {
        $editDialog.setAttribute('baseunit', this.configObj.curConfig.baseUnit)
      }

      if (this.configObj.curConfig.gridSnapping) {
        $editDialog.setAttribute('gridsnappingon', true)
      }

      if (this.configObj.curConfig.snappingStep) {
        $editDialog.setAttribute('gridsnappingstep', this.configObj.curConfig.snappingStep)
      }

      if (this.configObj.curConfig.gridColor) {
        $editDialog.setAttribute('gridcolor', this.configObj.curConfig.gridColor)
      }

      if (this.configObj.curConfig.dynamicOutput) {
        $editDialog.setAttribute('dynamicoutput', true)
      }
    }.bind(this))

    // zoom
    $id('zoom').value = (this.svgCanvas.getZoom() * 100).toFixed(1)
    this.canvMenu.setAttribute('disableallmenu', true)
    this.canvMenu.setAttribute('enablemenuitems', '#delete,#cut,#copy')

    this.enableOrDisableClipboard()

    window.addEventListener('storage', function (e) {
      if (e.key !== 'svgedit_clipboard') { return }

      this.enableOrDisableClipboard()
    }.bind(this))

    window.addEventListener('beforeunload', function (e) {
    // Suppress warning if page is empty
      if (undoMgr.getUndoStackSize() === 0) {
        this.showSaveWarning = false
      }

      // showSaveWarning is set to 'false' when the page is saved.
      if (!this.configObj.curConfig.no_save_warning && this.showSaveWarning) {
      // Browser already asks question about closing the page
        e.returnValue = this.i18next.t('notification.unsavedChanges') // Firefox needs this when beforeunload set by addEventListener (even though message is not used)
        return this.i18next.t('notification.unsavedChanges')
      }
      return true
    }.bind(this))

    // Use HTML5 File API: http://www.w3.org/TR/FileAPI/
    // if browser has HTML5 File API support, then we will show the open menu item
    // and provide a file input to click. When that change event fires, it will
    // get the text contents of the file and send it to the canvas

    this.workarea.addEventListener('dragenter', this.onDragEnter)
    this.workarea.addEventListener('dragover', this.onDragOver)
    this.workarea.addEventListener('dragleave', this.onDragLeave)

    this.updateCanvas(true)
    // Load extensions
    this.extAndLocaleFunc()
    // Defer injection to wait out initial menu processing. This probably goes
    //    away once all context menu behavior is brought to context menu.
    this.ready(() => {
      injectExtendedContextMenuItemsIntoDom()
    })
    // run callbacks stored by this.ready
    await this.runCallbacks()
  }

  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_addLangData
   * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
   * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
   * @fires module:svgcanvas.SvgCanvas#event:extensions_added
   * @returns {Promise<module:locale.LangAndData>} Resolves to result of {@link module:locale.readLang}
   */
  async extAndLocaleFunc () {
    this.$svgEditor.style.visibility = 'visible'
    try {
      // load standard extensions
      await Promise.all(
        this.configObj.curConfig.extensions.map(async (extname) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGthis.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGthis.ExtensionObject}
             */
            const extPath = this.configObj.curConfig.extPath
            const imported = await import(`${extPath}/${encodeURIComponent(extname)}/${encodeURIComponent(extname)}.js`)
            const { name = extname, init: initfn } = imported.default
            return this.addExtension(name, (initfn && initfn.bind(this)), { langParam: 'en' }) /** @todo  change to current lng */
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extname + '; ', err)
            return undefined
          }
        })
      )
      // load user extensions (given as pathNames)
      await Promise.all(
        this.configObj.curConfig.userExtensions.map(async ({ pathName, config }) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGthis.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGthis.ExtensionObject}
             */
            const imported = await import(encodeURI(pathName))
            const { name, init: initfn } = imported.default
            return this.addExtension(name, (initfn && initfn.bind(this, config)), {})
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + pathName + '; ', err)
            return undefined
          }
        })
      )
      this.svgCanvas.bind(
        'extensions_added',
        /**
        * @param {external:Window} _win
        * @param {module:svgcanvas.SvgCanvas#event:extensions_added} _data
        * @listens module:SvgCanvas#event:extensions_added
        * @returns {void}
        */
        (_win, _data) => {
          this.extensionsAdded = true
          this.setAll()

          if (this.storagePromptState === 'ignore') {
            this.updateCanvas(true)
          }

          this.messageQueue.forEach(
            /**
             * @param {module:svgcanvas.SvgCanvas#event:message} messageObj
             * @fires module:svgcanvas.SvgCanvas#event:message
             * @returns {void}
             */
            (messageObj) => {
              this.svgCanvas.call('message', messageObj)
            }
          )
        }
      )
      this.svgCanvas.call('extensions_added')
    } catch (err) {
      // Todo: Report errors through the UI
      console.error(err)
    }
  }
}

export default EditorStartup
