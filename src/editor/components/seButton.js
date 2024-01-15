/* globals svgEditor */
import { t } from '../locale.js'
const template = document.createElement('template')
template.innerHTML = `
  <style>
  @keyframes btnHover {
    from {
      background-color: var(--main-bg-color);
    }

    to {
      background-color: var(--icon-bg-color-hover);
    }
  }
  :host(:hover) :not(.disabled)
  {
    animation: btnHover 0.2s forwards;
  }
  div
  {
    height: 24px;
    width: 24px;
    margin: 4px 1px 4px;
    padding: 3px;
    background-color: var(--icon-bg-color);
    cursor: pointer;
    border-radius: 3px;
  }
  .small {
    width: 14px;
    height: 14px;
    padding: 1px;
    border-radius: 1px;
  }
  img {
    border: none;
    width: 100%;
    height: 100%;
  }
  .pressed {
    background-color: var(--icon-bg-color-hover);
  }
  .disabled {
    opacity: 0.3;
    cursor: default;
  }
  </style>
  <div title="title">
    <img alt="icon">
  </div>
`
/**
 * @class ToolButton
 */
export class ToolButton extends HTMLElement {
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
    this.$img = this._shadowRoot.querySelector('img')
    this.imgPath = svgEditor.configObj.curConfig.imgPath
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'src', 'pressed', 'disabled', 'size', 'style']
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
      case 'title':
        {
          const shortcut = this.getAttribute('shortcut')
          this.$div.setAttribute('title', `${t(newValue)} ${shortcut ? `[${t(shortcut)}]` : ''}`)
        }
        break
      case 'style':
        this.$div.style = newValue
        break
      case 'src':
        if (newValue.indexOf('data:') !== -1) {
          this.$img.setAttribute('src', newValue)
        } else {
          this.$img.setAttribute('src', this.imgPath + '/' + newValue)
        }
        break
      case 'pressed':
        if (newValue === null) {
          this.$div.classList.remove('pressed')
        } else {
          this.$div.classList.add('pressed')
        }
        break
      case 'size':
        if (newValue === 'small') {
          this.$div.classList.add('small')
        } else {
          this.$div.classList.remove('small')
        }
        break
      case 'disabled':
        if (newValue) {
          this.$div.classList.add('disabled')
        } else {
          this.$div.classList.remove('disabled')
        }
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
   * @function get
   * @returns {any}
   */
  get pressed () {
    return this.hasAttribute('pressed')
  }

  /**
   * @function set
   * @returns {void}
   */
  set pressed (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('pressed', 'true')
    } else {
      this.removeAttribute('pressed')
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get disabled () {
    return this.hasAttribute('disabled')
  }

  /**
   * @function set
   * @returns {void}
   */
  set disabled (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('disabled', 'true')
    } else {
      this.removeAttribute('disabled')
    }
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
   * @function get
   * @returns {any}
   */
  get size () {
    return this.getAttribute('size')
  }

  /**
   * @function set
   * @returns {void}
   */
  set size (value) {
    this.setAttribute('size', value)
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
        const key = `${(e.metaKey) ? 'meta+' : ''}${(e.ctrlKey) ? 'ctrl+' : ''}${e.key.toUpperCase()}`
        if (shortcut !== key) return
        // launch the click event
        this.click()
        e.preventDefault()
      })
    }
  }
}

// Register
customElements.define('se-button', ToolButton)
