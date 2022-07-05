/* globals svgEditor */

/**
 * @class ExplorerButton
 */
export class ExplorerButton extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    // create the shadowDom and insert the template
    this.imgPath = svgEditor.configObj.curConfig.imgPath
    this.template = this.createTemplate(this.imgPath)
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(this.template.content.cloneNode(true))
    // locate the component
    this.$button = this._shadowRoot.querySelector('.menu-button')
    this.$overall = this._shadowRoot.querySelector('.overall')
    this.$img = this._shadowRoot.querySelector('.menu-button img')
    this.$menu = this._shadowRoot.querySelector('.menu')
    this.$handle = this._shadowRoot.querySelector('.handle')
    this.$lib = this._shadowRoot.querySelector('.image-lib')
    this.files = []
    this.request = new XMLHttpRequest()
    this.imgPath = svgEditor.configObj.curConfig.imgPath
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
    .menu-button:hover, se-button:hover, .menu-item:hover
    {
      background-color: var(--icon-bg-color-hover);
    }
    img {
      border: none;
      width: 24px;
      height: 24px;
    }
    .overall.pressed .button-icon,
    .overall.pressed,
    .menu-item.pressed {
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
      margin-left: 34px;
      background: none !important;
      display:none;
      top: 30%;
      left: 171px;
    }
    .image-lib {
      position: fixed;
      left: 34px;
      top: 30%;
      background: #E8E8E8;
      display: none;
      flex-wrap: wrap;
      flex-direction: row;
      width: 170px;
    }
    .menu-item {
      line-height: 1em;
      padding: 0.5em;
      border: 1px solid #5a6162;
      background: #E8E8E8;
      margin-bottom: -1px;
      white-space: nowrap;
    }
    .open-lib {
      display: inline-flex;
    }
    .open {
      display: block;
    }
    .overall {
      background: none !important;
    }
    </style>
  
    <div class="overall">
      <div class="menu-button">
        <img class="button-icon" src="explorer.svg" alt="icon">
        <div class="handle"></div>
      </div>
      <div class="image-lib"">
        <se-button></se-button>
     </div>
      <div class="menu">
        <div class="menu-item">menu</div>
     </div>
    </div>`
    return template
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled', 'lib', 'src']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  async attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return
    switch (name) {
      case 'title':
        {
          const shortcut = this.getAttribute('shortcut')
          this.$button.setAttribute('title', `${newValue} [${shortcut}]`)
        }
        break
      case 'pressed':
        if (newValue) {
          this.$overall.classList.add('pressed')
        } else {
          this.$overall.classList.remove('pressed')
        }
        break
      case 'disabled':
        if (newValue) {
          this.$overall.classList.add('disabled')
        } else {
          this.$overall.classList.remove('disabled')
        }
        break
      case 'lib':
        try {
          const response = await fetch(`${newValue}index.json`)
          const json = await response.json()
          const { lib } = json
          this.$menu.innerHTML = lib.map((menu, i) => (
          `<div data-menu="${menu}" class="menu-item ${(i === 0) ? 'pressed' : ''} ">${menu}</div>`
          )).join('')
          await this.updateLib(lib[0])
        } catch (error) {
          console.error(error)
        }
        break
      case 'src':
        this.$img.setAttribute('src', this.imgPath + '/' + newValue)
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
    // capture click event on the button to manage the logic
    const onClickHandler = (ev) => {
      ev.stopPropagation()
      switch (ev.target.nodeName) {
        case 'SE-EXPLORERBUTTON':
          this.$menu.classList.add('open')
          this.$lib.classList.add('open-lib')
          break
        case 'SE-BUTTON':
        // change to the current action
          this.currentAction = ev.target
          this.$img.setAttribute('src', this.currentAction.getAttribute('src'))
          this.dataset.draw = this.data[this.currentAction.dataset.shape]
          this._shadowRoot.querySelectorAll('.image-lib [pressed]').forEach((b) => { b.pressed = false })
          this.currentAction.setAttribute('pressed', 'pressed')
          // and close the menu
          this.$menu.classList.remove('open')
          this.$lib.classList.remove('open-lib')
          break
        case 'DIV':
          if (ev.target.classList[0] === 'handle') {
          // this is a click on the handle so let's open/close the menu.
            this.$menu.classList.toggle('open')
            this.$lib.classList.toggle('open-lib')
          } else {
            this._shadowRoot.querySelectorAll('.menu > .pressed').forEach((b) => { b.classList.remove('pressed') })
            ev.target.classList.add('pressed')
            this.updateLib(ev.target.dataset.menu)
          }
          break
        default:
          console.error('unknown nodeName for:', ev.target, ev.target.className)
      }
    }
    // capture event from slots
    svgEditor.$click(this, onClickHandler)
    svgEditor.$click(this.$menu, onClickHandler)
    svgEditor.$click(this.$lib, onClickHandler)
    svgEditor.$click(this.$handle, onClickHandler)
  }

  /**
   * @function updateLib
   * @param {string} lib
   * @returns {void}
   */
  async updateLib (lib) {
    const libDir = this.getAttribute('lib')
    try {
      // initialize buttons for all shapes defined for this library
      const response = await fetch(`${libDir}${lib}.json`)
      const json = await response.json()
      this.data = json.data
      const size = json.size ?? 300
      const fill = json.fill ? '#333' : 'none'
      const off = size * 0.05
      const vb = [-off, -off, size + off * 2, size + off * 2].join(' ')
      const stroke = json.fill ? 0 : (size / 30)
      this.$lib.innerHTML = Object.entries(this.data).map(([key, path]) => {
        const encoded = btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <svg viewBox="${vb}"><path fill="${fill}" stroke="#f8bb00" stroke-width="${stroke}" d="${path}"></path></svg>
        </svg>`)
        return `<se-button data-shape="${key}"src="data:image/svg+xml;base64,${encoded}"></se-button>`
      }).join('')
    } catch (error) {
      console.error(`could not read file:${libDir}${lib}.json`, error)
    }
  }
}

// Register
customElements.define('se-explorerbutton', ExplorerButton)
