/* globals svgEditor */
import editorPreferencesDialog from './editorPreferencesDialog.html'
const template = document.createElement('template')
template.innerHTML = editorPreferencesDialog
/**
 * @class SeEditPrefsDialog
 */
export class SeEditPrefsDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this.colorBlocks = ['#FFF', '#888', '#000', 'chessboard']
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#svg_prefs')
    this.$saveBtn = this._shadowRoot.querySelector('#tool_prefs_save')
    this.$cancelBtn = this._shadowRoot.querySelector('#tool_prefs_cancel')
    this.$langSelect = this._shadowRoot.querySelector('#lang_select')
    this.$bgBlocks = this._shadowRoot.querySelector('#bg_blocks')
    this.$bgURL = this._shadowRoot.querySelector('#canvas_bg_url')
    this.$gridSnappingOn = this._shadowRoot.querySelector('#grid_snapping_on')
    this.$gridSnappingStep = this._shadowRoot.querySelector('#grid_snapping_step')
    this.$gridColor = this._shadowRoot.querySelector('#grid_color')
    this.$showRulers = this._shadowRoot.querySelector('#show_rulers')
    this.$baseUnit = this._shadowRoot.querySelector('#base_unit')
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('common-ok', i18next.t('common.ok'))
    this.setAttribute('common-cancel', i18next.t('common.cancel'))
    this.setAttribute('config-editor_prefs', i18next.t('config.editor_prefs'))
    this.setAttribute('config-language', i18next.t('config.language'))
    this.setAttribute('config-background', i18next.t('config.background'))
    this.setAttribute('common-url', i18next.t('common.url'))
    this.setAttribute('config-editor_bg_note', i18next.t('config.editor_bg_note'))
    this.setAttribute('config-grid', i18next.t('config.grid'))
    this.setAttribute('config-snapping_onoff', i18next.t('config.snapping_onoff'))
    this.setAttribute('config-snapping_stepsize', i18next.t('config.snapping_stepsize'))
    this.setAttribute('config-grid_color', i18next.t('config.grid_color'))
    this.setAttribute('config-units_and_rulers', i18next.t('config.units_and_rulers'))
    this.setAttribute('config-show_rulers', i18next.t('config.show_rulers'))
    this.setAttribute('config-base_unit', i18next.t('config.base_unit'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    // eslint-disable-next-line max-len
    return ['dialog', 'lang', 'canvasbg', 'bgurl', 'gridsnappingon', 'gridsnappingstep', 'gridcolor', 'showrulers', 'baseunit', 'common-ok', 'common-cancel', 'config-editor_prefs', 'config-language', 'config-background', 'common-url', 'config-editor_bg_note', 'config-grid', 'config-snapping_onoff', 'config-snapping_stepsize', 'config-grid_color', 'config-units_and_rulers', 'config-show_rulers', 'config-base_unit']
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
    const blocks = this.$bgBlocks.querySelectorAll('div')
    const curBg = 'cur_background'
    let node
    switch (name) {
      case 'dialog':
        if (newValue === 'open') {
          this.$dialog.open()
        } else {
          this.$dialog.close()
        }
        break
      case 'lang':
        this.$langSelect.value = newValue
        break
      case 'canvasbg':
        if (!newValue) {
          if (blocks.length > 0) {
            blocks[0].classList.add(curBg)
          }
        } else {
          blocks.forEach(function (blk) {
            const isBg = blk.dataset.bgColor === newValue
            if (isBg) {
              blk.classList.add(curBg)
            } else {
              blk.classList.remove(curBg)
            }
          })
        }
        break
      case 'bgurl':
        this.$bgURL.value = newValue
        break
      case 'gridsnappingon':
        if (newValue === 'true') {
          this.$gridSnappingOn.checked = true
        } else if (newValue === 'false') {
          this.$gridSnappingOn.checked = false
        }
        break
      case 'gridsnappingstep':
        this.$gridSnappingStep.value = newValue
        break
      case 'gridcolor':
        this.$gridColor.value = newValue
        break
      case 'showrulers':
        if (newValue === 'true') {
          this.$showRulers.checked = true
        } else if (newValue === 'false') {
          this.$showRulers.checked = false
        }
        break
      case 'baseunit':
        this.$baseUnit.value = newValue
        break
      case 'common-ok':
        this.$saveBtn.textContent = newValue
        break
      case 'common-cancel':
        this.$cancelBtn.textContent = newValue
        break
      case 'config-editor_prefs':
        node = this._shadowRoot.querySelector('#svginfo_editor_prefs')
        node.textContent = newValue
        break
      case 'config-language':
        node = this._shadowRoot.querySelector('#svginfo_lang')
        node.textContent = newValue
        break
      case 'config-background':
        node = this._shadowRoot.querySelector('#svginfo_change_background')
        node.textContent = newValue
        break
      case 'common-url':
        node = this._shadowRoot.querySelector('#svginfo_bg_url')
        node.textContent = newValue
        break
      case 'config-editor_bg_note':
        node = this._shadowRoot.querySelector('#svginfo_bg_note')
        node.textContent = newValue
        break
      case 'config-grid':
        node = this._shadowRoot.querySelector('#svginfo_grid_settings')
        node.textContent = newValue
        break
      case 'config-snapping_onoff':
        node = this._shadowRoot.querySelector('#svginfo_snap_onoff')
        node.textContent = newValue
        break
      case 'config-snapping_stepsize':
        node = this._shadowRoot.querySelector('#svginfo_snap_step')
        node.textContent = newValue
        break
      case 'config-grid_color':
        node = this._shadowRoot.querySelector('#svginfo_grid_color')
        node.textContent = newValue
        break
      case 'config-units_and_rulers':
        node = this._shadowRoot.querySelector('#svginfo_units_rulers')
        node.textContent = newValue
        break
      case 'config-show_rulers':
        node = this._shadowRoot.querySelector('#svginfo_rulers_onoff')
        node.textContent = newValue
        break
      case 'config-base_unit':
        node = this._shadowRoot.querySelector('#svginfo_unit')
        node.textContent = newValue
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
  get lang () {
    return this.getAttribute('lang')
  }

  /**
   * @function set
   * @returns {void}
   */
  set lang (value) {
    this.setAttribute('lang', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get canvasbg () {
    return this.getAttribute('canvasbg')
  }

  /**
   * @function set
   * @returns {void}
   */
  set canvasbg (value) {
    this.setAttribute('canvasbg', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get bgurl () {
    return this.getAttribute('bgurl')
  }

  /**
   * @function set
   * @returns {void}
   */
  set bgurl (value) {
    this.setAttribute('bgurl', value)
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
  get gridsnappingon () {
    return this.getAttribute('gridsnappingon')
  }

  /**
   * @function set
   * @returns {void}
   */
  set gridsnappingon (value) {
    this.setAttribute('gridsnappingon', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get gridsnappingstep () {
    return this.getAttribute('gridsnappingstep')
  }

  /**
   * @function set
   * @returns {void}
   */
  set gridsnappingstep (value) {
    this.setAttribute('gridsnappingstep', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get gridcolor () {
    return this.getAttribute('gridcolor')
  }

  /**
   * @function set
   * @returns {void}
   */
  set gridcolor (value) {
    this.setAttribute('gridcolor', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get showrulers () {
    return this.getAttribute('showrulers')
  }

  /**
   * @function set
   * @returns {void}
   */
  set showrulers (value) {
    this.setAttribute('showrulers', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get baseunit () {
    return this.getAttribute('baseunit')
  }

  /**
   * @function set
   * @returns {void}
   */
  set baseunit (value) {
    this.setAttribute('baseunit', value)
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
    const onSaveHandler = () => {
      const color = this.$bgBlocks.querySelector('.cur_background').dataset.bgColor || '#FFF'
      const closeEvent = new CustomEvent('change', {
        detail: {
          lang: this.$langSelect.value,
          dialog: 'close',
          bgcolor: color,
          bgurl: this.$bgURL.value,
          gridsnappingon: this.$gridSnappingOn.checked,
          gridsnappingstep: this.$gridSnappingStep.value,
          showrulers: this.$showRulers.checked,
          baseunit: this.$baseUnit.value
        }
      })
      this.dispatchEvent(closeEvent)
    }
    // Set up editor background functionality
    const currentObj = this
    this.colorBlocks.forEach(function (e) {
      const newdiv = document.createElement('div')
      if (e === 'chessboard') {
        newdiv.dataset.bgColor = e
        newdiv.style.backgroundImage = 'url(data:image/gif;base64,R0lGODlhEAAQAIAAAP///9bW1iH5BAAAAAAALAAAAAAQABAAAAIfjG+gq4jM3IFLJgpswNly/XkcBpIiVaInlLJr9FZWAQA7)'
        newdiv.classList.add('color_block')
      } else {
        newdiv.dataset.bgColor = e // setAttribute('data-bgcolor', e);
        newdiv.style.backgroundColor = e
        newdiv.classList.add('color_block')
      }
      currentObj.$bgBlocks.append(newdiv)
    })
    const blocks = this.$bgBlocks.querySelectorAll('div')
    const curBg = 'cur_background'
    blocks.forEach(function (blk) {
      svgEditor.$click(blk, function () {
        blocks.forEach((el) => el.classList.remove(curBg))
        blk.classList.add(curBg)
      })
    })
    svgEditor.$click(this.$saveBtn, onSaveHandler)
    svgEditor.$click(this.$cancelBtn, onCancelHandler)
    this.$dialog.addEventListener('close', onCancelHandler)
  }
}

// Register
customElements.define('se-edit-prefs-dialog', SeEditPrefsDialog)
