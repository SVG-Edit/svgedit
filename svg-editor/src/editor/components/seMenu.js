/* globals svgEditor */
import 'elix/define/MenuItem.js'
import './sePlainMenuButton.js'

const template = document.createElement('template')
template.innerHTML = `
  <style>
  :host {
    padding: 0px;
  }
  elix-menu-button::part(menu) {
    background-color: var(--icon-bg-color) !important;
    color: #fff;
  }
  elix-menu-button::part(popup-toggle) {
    padding: 0.25em 0.30em !important
  }
  :host ::slotted([current]){
    background-color: var(--icon-bg-color-hover) !important;
    color: #fff;
  }
  :host ::slotted(*){
    padding: 0.25em 1.25em 0.25em 0.25em !important;
    margin: 2px;
  }
  </style>

  <elix-menu-button id="MenuButton" aria-label="Main Menu">
    <slot></slot>
  </elix-menu-button>

`
/**
 * @class SeMenu
 */
export class SeMenu extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$menu = this._shadowRoot.querySelector('elix-menu-button')
    this.$label = this.$menu.shadowRoot.querySelector('#popupToggle').shadowRoot
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
    const image = new Image()
    if (oldValue === newValue) return
    switch (name) {
      case 'src':
        image.src = this.imgPath + '/' + newValue
        image.width = 24
        image.height = 24
        this.$label.prepend(image)
        break
      case 'label':
        this.$label.prepend(newValue)
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
}

// Register
customElements.define('se-menu', SeMenu)
