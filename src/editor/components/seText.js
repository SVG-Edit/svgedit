import { t } from '../locale.js'
const template = document.createElement('template')
template.innerHTML = `
  <style>
  #layersLabel {
    font-size: 13px;
    line-height: normal;
    font-weight: 700;
  }
  </style>
  <div></div>
`
/**
 * @class SeText
 */
export class SeText extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    // locate the component
    this.$div = this._shadowRoot.querySelector('div')
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['text', 'value', 'style', 'title', 'id']
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
      case 'text':
        this.$div.textContent = t(newValue)
        break
      case 'title':
        this.$div.setAttribute('title', t(newValue))
        break
      case 'style':
        this.$div.style = newValue
        break
      case 'id':
        this.$div.id = newValue
        break
      case 'value':
        this.$div.value = newValue
        // this.$div.setAttribute("value", newValue);
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
  get text () {
    return this.$div.textContent
  }

  /**
   * @function set
   * @returns {void}
   */
  set text (value) {
    this.$div.setAttribute('title', t(value))
  }

  /**
   * @function get
   * @returns {any}
   */
  get value () {
    return this.value
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.value = value
  }

  /**
   * @function get
   * @returns {any}
   */
  get title () {
    return this.getAttribute('title')
  }

  /**
   * @function set
   * @returns {void}
   */
  set title (value) {
    this.setAttribute('title', value)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    // capture shortcuts
  }
}

// Register
customElements.define('se-text', SeText)
