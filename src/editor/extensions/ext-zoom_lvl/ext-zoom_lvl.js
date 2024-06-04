/**
 * @file ext-label.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'zoom_lvl'
import labelDialogHTML from './zoomLvlDialog.html'

const template = document.createElement('template')
template.innerHTML = labelDialogHTML

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('../ext-zoom_lvl/locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

/**
 * @class SeLabelDialog
 */
export class SeZoomLvlDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#zoom_lvl_box')
    this.$okBtn = this._shadowRoot.querySelector('#ok')
    this.$cancelBtn = this._shadowRoot.querySelector('#cancel')
    this.$zoomVal = this._shadowRoot.querySelector('#zoom_value')

  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('label-ok', i18next.t(`common.ok`))
    this.setAttribute('label-cancel', i18next.t(`common.cancel`))
    this.setAttribute('label-zoom_val', i18next.t(`${name}:zoom_lvl.zoom_level`))
    //this.setAttribute('label-long_description', i18next.t(`${name}:zoom_lvl.long_description`))
    
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'label-ok', 'label-cancel', 'label-zoom_val', 'zoom_val']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let node
    switch (name) {
      case 'dialog':
        if (newValue === 'open') {
          this.$dialog.open()
        } else {
          this.$dialog.close()
        }

        if (document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).hasAttribute('data-image-zoom'))
            this.$zoomVal.value= document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).getAttribute('data-image-zoom')
        else
            this.$zoomVal.value = ''
        break
      case 'label-ok':
        this.$okBtn.textContent = newValue
        break
      case 'label-cancel':
        this.$cancelBtn.textContent = newValue
        break
      case 'label-zoom_val':
        node = this._shadowRoot.querySelector('#zoom_value_prompt')
        node.textContent = newValue
        break
      case 'zoom_val':
        node = this._shadowRoot.querySelector('#zoom_value')
        node.textContent = newValue
        break 
      default:
      // super.attributeChangedCallback(name, oldValue, newValue);
        break
    }
  }
/**
   * @function connectedCallback
   * @returns {void}
   */
connectedCallback () {
  const onSaveHandler = () => {
      document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).setAttribute('data-image-zoom', this.$zoomVal.value)
      document.getElementById('se-zoom-lvl-dialog').setAttribute('dialog', 'close')
      svgEditor.svgCanvas.clearSelection()
    }

    const onCancelHandler = () => {
      document.getElementById('se-zoom-lvl-dialog').setAttribute('dialog', 'close')
      svgEditor.svgCanvas.clearSelection() 
    }
  svgEditor.$click(this.$okBtn, onSaveHandler)
  svgEditor.$click(this.$cancelBtn, onCancelHandler)
}
}

// Register
customElements.define('se-zoom-lvl-dialog', SeZoomLvlDialog)  

export default {
  name,
  async init () {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const svgroot = svgCanvas.getSvgRoot()
    await loadExtensionTranslation(svgEditor)
    const { ChangeElementCommand } = svgCanvas.history
    // svgdoc = S.svgroot.parentNode.ownerDocument,
    const addToHistory = (cmd) => { svgCanvas.undoMgr.addCommandToHistory(cmd) }
    const { $id, $click } = svgCanvas

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback () {
        const zoomLvlDialog = document.createElement('se-zoom-lvl-dialog')
        zoomLvlDialog.setAttribute('id', 'se-zoom-lvl-dialog')
        document.getElementById('container').append(zoomLvlDialog)
        zoomLvlDialog.init(svgEditor.i18next)
      },
      mouseDown(opts){
        const mode = svgCanvas.getMode()
        if (mode === "zoomLvl") {
          svgCanvas.clearSelection()
          const e = opts.event
          const { target } = e
          if (!['svg', 'use'].includes(target.nodeName)){
            svgCanvas.addToSelection([target])
            document.getElementById('se-zoom-lvl-dialog').setAttribute('dialog', 'open')
          }
        }
      }
  }
}
}

