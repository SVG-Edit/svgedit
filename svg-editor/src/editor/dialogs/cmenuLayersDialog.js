/* globals svgEditor */
import cMenuLayersDialog from './cmenuLayersDialog.html'

const template = document.createElement('template')
template.innerHTML = cMenuLayersDialog
/**
 * @class SeCMenuLayerDialog
 */
export class SeCMenuLayerDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.source = ''
    this._workarea = undefined
    this.$sidePanels = document.getElementById('sidepanels')
    this.$dialog = this._shadowRoot.querySelector('#cmenu_layers')
    this.$duplicateLink = this._shadowRoot.querySelector('#se-dupe')
    this.$deleteLink = this._shadowRoot.querySelector('#se-layer-delete')
    this.$mergeDownLink = this._shadowRoot.querySelector('#se-merge-down')
    this.$mergeAllLink = this._shadowRoot.querySelector('#se-merge-all')
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('layers-dupe', i18next.t('layers.dupe'))
    this.setAttribute('layers-del', i18next.t('layers.del'))
    this.setAttribute('layers-merge_down', i18next.t('layers.merge_down'))
    this.setAttribute('layers-merge_all', i18next.t('layers.merge_all'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['value', 'leftclick', 'layers-dupe', 'layers-del', 'layers-merge_down', 'layers-merge_all']
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
    switch (name) {
      case 'value':
        this.source = newValue
        if (newValue !== '' && newValue !== undefined) {
          this._workarea = document.getElementById(this.source)
        }
        break
      case 'layers-dupe':
        this.$duplicateLink.textContent = newValue
        break
      case 'layers-del':
        this.$deleteLink.textContent = newValue
        break
      case 'layers-merge_down':
        this.$mergeDownLink.textContent = newValue
        break
      case 'layers-merge_all':
        this.$mergeAllLink.textContent = newValue
        break
      default:
      // super.attributeChangedCallback(name, oldValue, newValue);
        break
    }
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
  get leftclick () {
    return this.getAttribute('leftclick')
  }

  /**
   * @function set
   * @returns {void}
   */
  set leftclick (value) {
    this.setAttribute('leftclick', value)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const current = this
    const onMenuOpenHandler = (e) => {
      e.preventDefault()
      current.$dialog.style.top = e.pageY + 'px'
      current.$dialog.style.left = e.pageX - 126 + 'px'
      current.$dialog.style.display = 'block'
    }
    const onMenuCloseHandler = (e) => {
      if (e.button !== 2) {
        current.$dialog.style.display = 'none'
      }
    }
    const onMenuClickHandler = (e, action, id) => {
      const triggerEvent = new CustomEvent('change', {
        detail: {
          trigger: action,
          source: id
        }
      })
      this.dispatchEvent(triggerEvent)
      current.$dialog.style.display = 'none'
    }
    if (this._workarea !== undefined) {
      this._workarea.addEventListener('contextmenu', onMenuOpenHandler)
      if (this.getAttribute('leftclick') === 'true') {
        svgEditor.$click(this._workarea, onMenuOpenHandler)
      }
      this._workarea.addEventListener('mousedown', onMenuCloseHandler)
      this.$sidePanels.addEventListener('mousedown', onMenuCloseHandler)
    }
    svgEditor.$click(this.$duplicateLink, (evt) => onMenuClickHandler(evt, 'dupe', this.source))
    svgEditor.$click(this.$deleteLink, (evt) => onMenuClickHandler(evt, 'delete', this.source))
    svgEditor.$click(this.$mergeDownLink, (evt) => onMenuClickHandler(evt, 'merge_down', this.source))
    svgEditor.$click(this.$mergeAllLink, (evt) => onMenuClickHandler(evt, 'merge_all', this.source))
  }
}

// Register
customElements.define('se-cmenu-layers', SeCMenuLayerDialog)
