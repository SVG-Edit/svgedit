/**
 * @file ext-label.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'label'
import labelDialogHTML from './labelDialog.html'

const template = document.createElement('template')
template.innerHTML = labelDialogHTML

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('../ext-label/locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

/**
 * @class SeLabelDialog
 */
export class SeLabelDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#label_box')
    this.$okBtn = this._shadowRoot.querySelector('#label_ok')
    this.$cancelBtn = this._shadowRoot.querySelector('#label_cancel')
    this.$shortLabel = this._shadowRoot.querySelector('#short_label')
    this.$longDesc = this._shadowRoot.querySelector('#long_description')

  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('label-ok', i18next.t(`common.ok`))
    this.setAttribute('label-cancel', i18next.t(`common.cancel`))
    this.setAttribute('label-short_label', i18next.t(`${name}:label.short_label`))
    this.setAttribute('label-long_description', i18next.t(`${name}:label.long_description`))
    
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'label-ok', 'label-cancel', 'label-short_label', 'label-long_description', 'short_label', 'short_description']
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

        if (document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).hasAttribute('aria-label'))
            this.$shortLabel.value= document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).getAttribute('aria-label')
        else
            this.$shortLabel.value = ''

        if (document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).hasAttribute('aria-description'))
            this.$longDesc.value= document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).getAttribute('aria-description')
        else
            this.$longDesc.value = ''

        break
      case 'label-ok':
        this.$okBtn.textContent = newValue
        break
      case 'label-cancel':
        this.$cancelBtn.textContent = newValue
        break
      case 'label-short_label':
        node = this._shadowRoot.querySelector('#object_label')
        node.textContent = newValue
        break
      case 'label-long_description':
        node = this._shadowRoot.querySelector('#object_description')
        node.textContent = newValue
        break
      case 'short_label':
        break
      case 'long_description':
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
      document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).setAttribute('aria-label', this.$shortLabel.value)
      document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).setAttribute('aria-description', this.$longDesc.value)
      document.getElementById('se-label-dialog').setAttribute('dialog', 'close')
      svgEditor.svgCanvas.clearSelection()
    }

    const onCancelHandler = () => {
      document.getElementById('se-label-dialog').setAttribute('dialog', 'close')
      svgEditor.svgCanvas.clearSelection() 
    }
  svgEditor.$click(this.$okBtn, onSaveHandler)
  svgEditor.$click(this.$cancelBtn, onCancelHandler)
}
}

// Register
customElements.define('se-label-dialog', SeLabelDialog)  

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
        const labelDialog = document.createElement('se-label-dialog')
        labelDialog.setAttribute('id', 'se-label-dialog')
        document.getElementById('container').append(labelDialog)
        labelDialog.init(svgEditor.i18next)
      },
      mouseDown(opts){
        const mode = svgCanvas.getMode()
        if (mode === "label") {
          svgCanvas.clearSelection()
          const e = opts.event
          const { target } = e
          if (!['svg', 'use'].includes(target.nodeName)){
            svgCanvas.addToSelection([target])
            document.getElementById('se-label-dialog').setAttribute('dialog', 'open')
          }
        }
      }
  }
}
}

