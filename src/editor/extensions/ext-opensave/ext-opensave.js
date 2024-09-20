/* globals seConfirm */
/**
 * @file ext-opensave.js
 *
 * @license MIT
 *
 * @copyright 2020 OptimistikSAS
 *
 */

/**
   * @type {module:svgcanvas.EventHandler}
   * @param {external:Window} wind
   * @param {module:svgcanvas.SvgCanvas#event:saved} svg The SVG source
   * @listens module:svgcanvas.SvgCanvas#event:saved
   * @returns {void}
   */
import { fileOpen, fileSave } from 'browser-fs-access'

const name = 'opensave'
let handle = null

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('./locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, 'translation', translationModule.default, true, true)
}

export default {
  name,
  async init (_S) {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const { $id, $click } = svgCanvas
    await loadExtensionTranslation(svgEditor)
    /**
    * @param {Event} e
    * @returns {void}
    */
    const importImage = (e) => {
      $id('se-prompt-dialog').title = this.i18next.t('notification.loadingImage')
      $id('se-prompt-dialog').setAttribute('close', false)
      e.stopPropagation()
      e.preventDefault()
      const file = (e.type === 'drop') ? e.dataTransfer.files[0] : e.currentTarget.files[0]
      if (!file) {
        $id('se-prompt-dialog').setAttribute('close', true)
        return
      }

      if (!file.type.includes('image')) {
        return
      }
      // Detected an image
      // svg handling
      let reader
      if (file.type.includes('svg')) {
        reader = new FileReader()
        reader.onloadend = (ev) => {
          // imgImport.shiftKey (shift key pressed or not) will determine if import should preserve dimension)
          const newElement = this.svgCanvas.importSvgString(ev.target.result, imgImport.shiftKey)
          this.svgCanvas.alignSelectedElements('m', 'page')
          this.svgCanvas.alignSelectedElements('c', 'page')
          // highlight imported element, otherwise we get strange empty selectbox
          this.svgCanvas.selectOnly([newElement])
          $id('se-prompt-dialog').setAttribute('close', true)
        }
        reader.readAsText(file)
      } else {
        // bitmap handling
        reader = new FileReader()
        reader.onloadend = ({ target: { result } }) => {
          /**
              * Insert the new image until we know its dimensions.
              * @param {Float} imageWidth
              * @param {Float} imageHeight
              * @returns {void}
              */
          const insertNewImage = (imageWidth, imageHeight) => {
            const newImage = this.svgCanvas.addSVGElementsFromJson({
              element: 'image',
              attr: {
                x: 0,
                y: 0,
                width: imageWidth,
                height: imageHeight,
                id: this.svgCanvas.getNextId(),
                style: 'pointer-events:inherit'
              }
            })
            this.svgCanvas.setHref(newImage, result)
            this.svgCanvas.selectOnly([newImage])
            this.svgCanvas.alignSelectedElements('m', 'page')
            this.svgCanvas.alignSelectedElements('c', 'page')
            this.topPanel.updateContextPanel()
            $id('se-prompt-dialog').setAttribute('close', true)
          }
          // create dummy img so we know the default dimensions
          let imgWidth = 100
          let imgHeight = 100
          const img = new Image()
          img.style.opacity = 0
          img.addEventListener('load', () => {
            imgWidth = img.offsetWidth || img.naturalWidth || img.width
            imgHeight = img.offsetHeight || img.naturalHeight || img.height
            insertNewImage(imgWidth, imgHeight)
          })
          img.src = result
        }
        reader.readAsDataURL(file)
      }
    }
    // create an input with type file to open the filesystem dialog
    const imgImport = document.createElement('input')
    imgImport.type = 'file'
    imgImport.addEventListener('change', importImage)
    // dropping a svg file will import it in the svg as well
    this.workarea.addEventListener('drop', importImage)

    const clickClear = async function () {
      const [x, y] = svgEditor.configObj.curConfig.dimensions
      const ok = await seConfirm(svgEditor.i18next.t('notification.QwantToClear'))
      if (ok === 'Cancel') {
        return
      }
      svgEditor.leftPanel.clickSelect()
      svgEditor.svgCanvas.clear()
      svgEditor.svgCanvas.setResolution(x, y)
      svgEditor.updateCanvas(true)
      svgEditor.zoomImage()
      svgEditor.layersPanel.populateLayers()
      svgEditor.topPanel.updateContextPanel()
      svgEditor.topPanel.updateTitle('untitled.svg')
    }

    /**
     * By default,  this.editor.svgCanvas.open() is a no-op. It is up to an extension
     *  mechanism (opera widget, etc.) to call `setCustomHandlers()` which
     *  will make it do something.
     * @returns {void}
     */
    const clickOpen = async function () {
      // ask user before clearing an unsaved SVG
      const response = await svgEditor.openPrep()
      if (response === 'Cancel') { return }
      svgCanvas.clear()
      try {
        const blob = await fileOpen({
          mimeTypes: ['image/*']
        })
        const svgContent = await blob.text()
        await svgEditor.loadSvgString(svgContent)
        svgEditor.updateCanvas()
        handle = blob.handle
        svgEditor.topPanel.updateTitle(blob.name)
        svgEditor.svgCanvas.runExtensions('onOpenedDocument', {
          name: blob.name,
          lastModified: blob.lastModified,
          size: blob.size,
          type: blob.type
        })
        svgEditor.layersPanel.populateLayers()
      } catch (err) {
        if (err.name !== 'AbortError') {
          return console.error(err)
        }
      }
    }
    const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
      const byteCharacters = atob(b64Data)
      const byteArrays = []
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize)
        const byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }
      const blob = new Blob(byteArrays, { type: contentType })
      return blob
    }

    /**
     *
     * @returns {void}
     */
    const clickSave = async function (type) {
      const $editorDialog = $id('se-svg-editor-dialog')
      const editingsource = $editorDialog.getAttribute('dialog') === 'open'
      if (editingsource) {
        svgEditor.saveSourceEditor()
      } else {
        // In the future, more options can be provided here
        const saveOpts = {
          images: svgEditor.configObj.pref('img_save'),
          round_digits: 2
        }
        // remove the selected outline before serializing
        svgCanvas.clearSelection()
        // Update save options if provided
        if (saveOpts) {
          const saveOptions = svgCanvas.mergeDeep(svgCanvas.getSvgOption(), saveOpts)
          for (const [key, value] of Object.entries(saveOptions)) {
            svgCanvas.setSvgOption(key, value)
          }
        }
        svgCanvas.setSvgOption('apply', true)

        // no need for doctype, see https://jwatt.org/svg/authoring/#doctype-declaration
        const svg = '<?xml version="1.0"?>\n' + svgCanvas.svgCanvasToString()
        const b64Data = svgCanvas.encode64(svg)
        const blob = b64toBlob(b64Data, 'image/svg+xml')
        try {
          if (type === 'save' && handle !== null) {
            const throwIfExistingHandleNotGood = false
            handle = await fileSave(blob, {
              fileName: 'untitled.svg',
              extensions: ['.svg']
            }, handle, throwIfExistingHandleNotGood)
          } else {
            handle = await fileSave(blob, {
              fileName: svgEditor.title,
              extensions: ['.svg']
            })
          }
          svgEditor.topPanel.updateTitle(handle.name)
          svgCanvas.runExtensions('onSavedDocument', {
            name: handle.name,
            kind: handle.kind
          })
        } catch (err) {
          if (err.name !== 'AbortError') {
            return console.error(err)
          }
        }
      }
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback () {
        const buttonTemplate = `
        <se-menu-item id="tool_clear" label="opensave.new_doc" shortcut="N" src="new.svg"></se-menu-item>`
        svgCanvas.insertChildAtIndex($id('main_button'), buttonTemplate, 0)
        const openButtonTemplate = '<se-menu-item id="tool_open" label="opensave.open_image_doc" src="open.svg"></se-menu-item>'
        svgCanvas.insertChildAtIndex($id('main_button'), openButtonTemplate, 1)
        const saveButtonTemplate = '<se-menu-item id="tool_save" label="opensave.save_doc" shortcut="S" src="saveImg.svg"></se-menu-item>'
        svgCanvas.insertChildAtIndex($id('main_button'), saveButtonTemplate, 2)
        const saveAsButtonTemplate = '<se-menu-item id="tool_save_as" label="opensave.save_as_doc" src="saveImg.svg"></se-menu-item>'
        svgCanvas.insertChildAtIndex($id('main_button'), saveAsButtonTemplate, 3)
        const importButtonTemplate = '<se-menu-item id="tool_import" label="tools.import_doc" src="importImg.svg"></se-menu-item>'
        svgCanvas.insertChildAtIndex($id('main_button'), importButtonTemplate, 4)

        // handler
        $click($id('tool_clear'), clickClear.bind(this))
        $click($id('tool_open'), clickOpen.bind(this))
        $click($id('tool_save'), clickSave.bind(this, 'save'))
        $click($id('tool_save_as'), clickSave.bind(this, 'saveas'))
        // tool_import pressed with shiftKey will not scale the SVG
        $click($id('tool_import'), (ev) => { imgImport.shiftKey = ev.shiftKey; imgImport.click() })
      }
    }
  }
}
