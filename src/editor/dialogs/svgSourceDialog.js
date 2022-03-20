/* globals svgEditor */
import svgSourceDialogHTML from './svgSourceDialog.html'

const template = document.createElement('template')
template.innerHTML = svgSourceDialogHTML
/**
 * @class SeSvgSourceEditorDialog
 */
export class SeSvgSourceEditorDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#svg_source_editor')
    this.$copyBtn = this._shadowRoot.querySelector('#copy_save_done')
    this.$saveBtn = this._shadowRoot.querySelector('#tool_source_save')
    this.$cancelBtn = this._shadowRoot.querySelector('#tool_source_cancel')
    this.$sourceTxt = this._shadowRoot.querySelector('#svg_source_textarea')
    this.$copySec = this._shadowRoot.querySelector('#save_output_btns')
    this.$applySec = this._shadowRoot.querySelector('#tool_source_back')
    this.$toggleDynamic = this._shadowRoot.querySelector('#tool_source_dynamic')
    this.$toggleDynamic.checked = svgEditor.configObj.curConfig.dynamicOutput
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('tools-source_save', i18next.t('tools.source_save'))
    this.setAttribute('common-cancel', i18next.t('common.cancel'))
    this.setAttribute('notification-source_dialog_note', i18next.t('notification.source_dialog_note'))
    this.setAttribute('config-done', i18next.t('config.done'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'value', 'applysec', 'copysec', 'tools-source_save', 'common-cancel', 'notification-source_dialog_note', 'config-done']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return
    let node
    switch (name) {
      case 'dialog':
        if (newValue === 'open') {
          this.$sourceTxt.focus()
          this.$dialog.open()
        } else {
          this.$dialog.close()
          this.$sourceTxt.blur()
        }
        break
      case 'applysec':
        if (newValue === 'false') {
          this.$applySec.style.display = 'none'
        } else {
          this.$applySec.style.display = 'block'
        }
        break
      case 'copysec':
        if (newValue === 'false') {
          this.$copySec.style.display = 'none'
        } else {
          this.$copySec.style.display = 'block'
        }
        break
      case 'value':
        this.$sourceTxt.value = newValue
        break
      case 'tools-source_save':
        this.$saveBtn.textContent = newValue
        break
      case 'common-cancel':
        this.$cancelBtn.textContent = newValue
        break
      case 'notification-source_dialog_note':
        node = this._shadowRoot.querySelector('#copy_save_note')
        node.textContent = newValue
        break
      case 'config-done':
        this.$copyBtn.textContent = newValue
        break
      default:
        super.attributeChangedCallback(name, oldValue, newValue)
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get dialog () {
    return this.getAttribute('dialog')
  }

  /**
   * @function set
   * @returns {void}
   */
  set dialog (value) {
    this.setAttribute('dialog', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get value () {
    return this.getAttribute('value')
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.setAttribute('value', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get applysec () {
    return this.getAttribute('applysec')
  }

  /**
   * @function set
   * @returns {void}
   */
  set applysec (value) {
    this.setAttribute('applysec', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get copysec () {
    return this.getAttribute('copysec')
  }

  /**
   * @function set
   * @returns {void}
   */
  set copysec (value) {
    this.setAttribute('copysec', value)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const onCancelHandler = () => {
      const closeEvent = new CustomEvent('change', {
        detail: {
          dialog: 'closed'
        }
      })
      this.dispatchEvent(closeEvent)
    }
    const onCopyHandler = () => {
      const closeEvent = new CustomEvent('change', {
        detail: {
          copy: 'click',
          value: this.$sourceTxt.value
        }
      })
      this.dispatchEvent(closeEvent)
    }
    const onSaveHandler = () => {
      const closeEvent = new CustomEvent('change', {
        detail: {
          value: this.$sourceTxt.value,
          dialog: 'close'
        }
      })
      this.dispatchEvent(closeEvent)
    }
    const onToggleDynamicHandler = () => {
      const closeEvent = new CustomEvent('change', {
        detail: {
          dynamic: this.$toggleDynamic.checked,
          dialog: 'dynamic'
        }
      })
      this.dispatchEvent(closeEvent)
    }
    svgEditor.$click(this.$copyBtn, onCopyHandler)
    svgEditor.$click(this.$saveBtn, onSaveHandler)
    svgEditor.$click(this.$cancelBtn, onCancelHandler)
    svgEditor.$click(this.$toggleDynamic, onToggleDynamicHandler)
    this.$dialog.addEventListener('close', onCancelHandler)
  }
}

// Register
customElements.define('se-svg-source-editor-dialog', SeSvgSourceEditorDialog)
