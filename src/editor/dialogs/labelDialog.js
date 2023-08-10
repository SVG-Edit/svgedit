import labelDialogHTML from './labelDialog.html'
import './se-elix/define/NumberSpinBox.js'

const template = document.createElement('template')
template.innerHTML = labelDialogHTML

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
    
    this.setAttribute('label-ok', i18next.t('label.ok'))
    this.setAttribute('label-cancel', i18next.t('label.cancel'))
    this.setAttribute('label-short_label', i18next.t('label.short_label'))
    this.setAttribute('label-long_description', i18next.t('label.long_description'))
    
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

        if (document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).hasAttribute('data-image-label'))
            this.$shortLabel.value= document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).getAttribute('data-image-label')
        else
            this.$shortLabel.value = ''

        if (document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).hasAttribute('data-image-description'))
            this.$longDesc.value= document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).getAttribute('data-image-description')
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
        document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).setAttribute('data-image-label', this.$shortLabel.value)
        document.getElementById(svgEditor.svgCanvas.getSelectedElements()[0].id).setAttribute('data-image-description', this.$longDesc.value)
        svgEditor.svgCanvas.clearSelection()
        document.getElementById('se-label-dialog').setAttribute('dialog', 'close')
      }

      const onCancelHandler = () => {
        svgEditor.svgCanvas.clearSelection() 
        document.getElementById('se-label-dialog').setAttribute('dialog', 'close')
      }
    svgEditor.$click(this.$okBtn, onSaveHandler)
    svgEditor.$click(this.$cancelBtn, onCancelHandler)
  }
}

// Register
customElements.define('se-label-dialog', SeLabelDialog)
  