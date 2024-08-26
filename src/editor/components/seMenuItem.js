/* globals svgEditor */
import 'elix/define/Menu.js'
import 'elix/define/MenuItem.js'
import { t } from '../locale.js'
const template = document.createElement('template')
template.innerHTML = `
  <style>
  </style>
  <elix-menu-item>
    <div style="display:flex; align-items: center;">
      <img src="logo.svg" alt="icon" style="display:none;" width="24"/>
      <span style="margin-left: 7px;"></span>
    </div>
  </elix-menu-item>
`
/**
 * @class SeMenuItem
 */
export class SeMenuItem extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$img = this._shadowRoot.querySelector('img')
    this.$label = this._shadowRoot.querySelector('span')
    this.$menuitem = this._shadowRoot.querySelector('elix-menu-item')
    this.$svg = this.$menuitem.shadowRoot.querySelector('#checkmark')
    this.$svg.setAttribute('style', 'display: none;')
    this.imgPath = svgEditor.configObj.curConfig.imgPath
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'src']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let shortcut = ''
    if (oldValue === newValue) return
    switch (name) {
      case 'src':
        this.$img.style.display = 'inline-block'
        this.$img.setAttribute('src', this.imgPath + '/' + newValue)
        break
      case 'label':
        shortcut = this.getAttribute('shortcut')
        this.$label.textContent = `${t(newValue)} ${shortcut ? `(${shortcut})` : ''}`
        break
      default:
        console.error(`unknown attribute: ${name}`)
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get label () {
    return this.getAttribute('label')
  }

  /**
   * @function set
   * @returns {void}
   */
  set label (value) {
    this.setAttribute('label', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get src () {
    return this.getAttribute('src')
  }

  /**
   * @function set
   * @returns {void}
   */
  set src (value) {
    this.setAttribute('src', value)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    // capture shortcuts
    const shortcut = this.getAttribute('shortcut')
    if (shortcut) {
      // register the keydown event
      document.addEventListener('keydown', (e) => {
        // only track keyboard shortcuts for the body containing the SVG-Editor
        if (e.target.nodeName !== 'BODY') return
        // normalize key
        const key = `${(e.metaKey) ? 'meta+' : ''}${(e.ctrlKey) ? 'ctrl+' : ''}${(e.shiftKey) ? 'shift+' : ''}${e.key.toUpperCase()}`
        if (shortcut !== key) return
        // launch the click event
        if (this.id) {
          document.getElementById(this.id).click()
        }
        e.preventDefault()
      })
    }
  }
}

// Register
customElements.define('se-menu-item', SeMenuItem)
