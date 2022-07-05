/* globals svgEditor */
import { t } from '../locale.js'

/**
 * @class FlyingButton
 */
export class FlyingButton extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this.imgPath = svgEditor.configObj.curConfig.imgPath
    this.template = this.createTemplate(this.imgPath)
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(this.template.content.cloneNode(true))
    // locate the component
    this.$button = this._shadowRoot.querySelector('.menu-button')
    this.$handle = this._shadowRoot.querySelector('.handle')
    this.$overall = this._shadowRoot.querySelector('.overall')
    this.$img = this._shadowRoot.querySelector('img')
    this.$menu = this._shadowRoot.querySelector('.menu')
    // the last element of the div is the slot
    // we retrieve all elements added in the slot (i.e. se-buttons)
    this.$elements = this.$menu.lastElementChild.assignedElements()
  }

  /**
   * @function createTemplate
   * @param {string} imgPath
   * @returns {any} template
   */

  createTemplate (imgPath) {
    const template = document.createElement('template')
    template.innerHTML = `
      <style>
        :host {
          position:relative;
        }
        .overall:hover *
        {
          background-color: var(--icon-bg-color-hover);
        }
        img {
          border: none;
          width: 24px;
          height: 24px;
        }
        .overall.pressed .button-icon,
        .overall.pressed .handle {
          background-color: var(--icon-bg-color-hover) !important;
        }
        .overall.pressed .menu-button {
          background-color: var(--icon-bg-color-hover) !important;
        }
        .disabled {
          opacity: 0.3;
          cursor: default;
        }
        .menu-button {
          height: 24px;
          width: 24px;
          margin: 2px 1px 4px;
          padding: 3px;
          background-color: var(--icon-bg-color);
          cursor: pointer;
          position: relative;
          border-radius: 3px;
          overflow: hidden;
        }
        .handle {
          height: 8px;
          width: 8px;
          background-image: url(${imgPath}/handle.svg);
          position:absolute;
          bottom: 0px;
          right: 0px;
        }
        .button-icon {
        }
        .menu {
          position: fixed;
          background: none !important;
          display:none;
          margin-left: 34px;
        }
        .open {
          display: flex;
        }
        .menu-item {
          align-content: flex-start;
          height: 24px;
          width: 24px;
          top:0px;
          left:0px;
        }
        .overall {
          background: none !important;
        }
      </style>

      <div class="overall">
        <div class="menu">
          <slot></slot>
        </div>
        <div class="menu-button">
          <img class="button-icon" src="logo.svg" alt="icon">
          <div class="handle"></div>
        </div>
      </div>`
    return template
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled', 'opened']
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
          this.$button.setAttribute('title', `${t(newValue)} ${shortcut ? `[${t(shortcut)}]` : ''}`)
        }
        break
      case 'pressed':
        if (newValue) {
          this.$overall.classList.add('pressed')
        } else {
          this.$overall.classList.remove('pressed')
        }
        break
      case 'opened':
        if (newValue) {
          this.$menu.classList.add('open')
        } else {
          this.$menu.classList.remove('open')
        }
        break
      case 'disabled':
        if (newValue) {
          this.$overall.classList.add('disabled')
        } else {
          this.$overall.classList.remove('disabled')
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
      this.removeAttribute('pressed', '')
      // close also the menu if open
      this.removeAttribute('opened')
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get opened () {
    return this.hasAttribute('opened')
  }

  /**
   * @function set
   * @returns {void}
   */
  set opened (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('opened', 'opened')
    } else {
      this.removeAttribute('opened')
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
      this.removeAttribute('disabled', '')
    }
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.activeSlot = this.shadowRoot.querySelector('slot').assignedElements()[0]
    this.$img.setAttribute('src', this.imgPath + '/' + this.activeSlot.getAttribute('src'))
    // capture click event on the button to manage the logic
    const onClickHandler = (ev) => {
      ev.stopPropagation()
      switch (ev.target.nodeName) {
        case 'SE-FLYINGBUTTON':
          if (this.pressed) {
            this.setAttribute('opened', 'opened')
          } else {
          // launch current action
            this.activeSlot.click()
            this.setAttribute('pressed', 'pressed')
          }
          break
        case 'SE-BUTTON':
        // change to the current action
          this.$img.setAttribute('src', this.imgPath + '/' + ev.target.getAttribute('src'))
          this.activeSlot = ev.target
          this.setAttribute('pressed', 'pressed')
          // and close the menu
          this.$menu.classList.remove('open')
          break
        case 'DIV':
        // this is a click on the handle so let's open/close the menu.
          if (this.opened) {
            this.removeAttribute('opened')
          } else {
            this.setAttribute('opened', 'opened')
            // In case menu scroll on top or bottom position based popup position set
            const rect = this.getBoundingClientRect()
            this.$menu.style.top = rect.top + 'px'
          }
          break
        default:
          console.error('unkonw nodeName for:', ev.target, ev.target.className)
      }
    }
    // capture event from slots
    svgEditor.$click(this, onClickHandler)
    svgEditor.$click(this.$handle, onClickHandler)
  }
}

// Register
customElements.define('se-flyingbutton', FlyingButton)
