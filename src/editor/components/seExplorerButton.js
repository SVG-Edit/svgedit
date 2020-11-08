const template = document.createElement('template');
template.innerHTML = `
  <style>
  :host {
    position:relative;
  }
  .menu-button:hover, se-button:hover, .menu-item:hover 
  {
    background-color: #ffc;
  }
  img {
    border: none;
    width: 24px;
    height: 24px;
  }
  .overall.pressed .button-icon,
  .overall.pressed .handle,
  .menu-item.pressed {
    background-color: #F4E284 !important;
  }
  .overall.pressed .menu-button {
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.4), 1px 1px  0 white  !important;
    background-color: #F4E284 !important;
  }
  .disabled {
    opacity: 0.3;
    cursor: default;
  }
  .menu-button {
    height: 24px;
    width: 24px;
    margin: 2px 2px 4px;
    padding: 3px;
    box-shadow: inset 1px 1px 2px white, 1px 1px 1px rgba(0,0,0,0.3);
    background-color: #E8E8E8;
    cursor: pointer;
    position: relative;
    border-radius: 3px;
    overflow: hidden;
  }
  .handle {
    height: 8px;
    width: 8px;
    background-image: url(./images/handle.svg);
    position:absolute;
    bottom: 0px;
    right: 0px;
  }
  .button-icon {
  }
  .menu {
    position: absolute;
    top:2px;
    left:171px;
    background: none !important;
    display:none;
  }
  .image-lib {
    position: absolute;
    top: 0px;
    left:34px;
    background: #E8E8E8;
    display: none;
    flex-wrap: wrap;
    flex-direction: row;
    width: 136px;
  }
  .menu-item {
    line-height: 1em;
    padding: 0.5em;
    border: 1px solid #B0B0B0;
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
      <img class="button-icon" src="./images/logo.svg" alt="icon">
      <div class="handle"></div>
    </div>
    <div class="image-lib"">
      <se-button></se-button>
   </div>
    <div class="menu">
      <div class="menu-item">menu</div>
   </div>
  </div>
  
`;
/**
 * @class ExplorerButton
 */
export class ExplorerButton extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    // locate the component
    this.$button = this._shadowRoot.querySelector('.menu-button');
    this.$overall = this._shadowRoot.querySelector('.overall');
    this.$img = this._shadowRoot.querySelector('.menu-button img');
    this.$menu = this._shadowRoot.querySelector('.menu');
    this.$lib = this._shadowRoot.querySelector('.image-lib');
    this.files = [];
    this.request = new XMLHttpRequest();
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled', 'lib'];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  async attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
    case 'title':
      {
        const shortcut = this.getAttribute('shortcut');
        this.$button.setAttribute('title', `${newValue} [${shortcut}]`);
      }
      break;
    case 'pressed':
      if (newValue) {
        this.$overall.classList.add('pressed');
      } else {
        this.$overall.classList.remove('pressed');
      }
      break;
    case 'disabled':
      if (newValue) {
        this.$div.classList.add('disabled');
      } else {
        this.$div.classList.remove('disabled');
      }
      break;
    case 'lib':
      try {
        const response = await fetch(`${newValue}index.json`);
        const json = await response.json();
        const {lib} = json;
        // eslint-disable-next-line no-unsanitized/property
        this.$menu.innerHTML = lib.map((menu, i) => (
          `<div data-menu="${menu}" class="menu-item ${(i === 0) ? 'pressed' : ''} ">${menu}</div>`
        )).join('');
        await this.updateLib(lib[0]);
      } catch (error) {
        console.error(error);
      }
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`unknown attribute: ${name}`);
      break;
    }
  }
  /**
   * @function get
   * @returns {any}
   */
  get title () {
    return this.getAttribute('title');
  }

  /**
   * @function set
   * @returns {void}
   */
  set title (value) {
    this.setAttribute('title', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get pressed () {
    return this.hasAttribute('pressed');
  }

  /**
   * @function set
   * @returns {void}
   */
  set pressed (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('pressed', 'true');
    } else {
      this.removeAttribute('pressed', '');
    }
  }
  /**
   * @function get
   * @returns {any}
   */
  get disabled () {
    return this.hasAttribute('disabled');
  }

  /**
   * @function set
   * @returns {void}
   */
  set disabled (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('disabled', 'true');
    } else {
      this.removeAttribute('disabled', '');
    }
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    // capture click event on the button to manage the logic
    const onClickHandler = (ev) => {
      switch (ev.target.nodeName) {
      case 'SE-EXPLORERBUTTON':
        this.$menu.classList.add('open');
        this.$lib.classList.add('open-lib');
        break;
      case 'SE-BUTTON':
        // change to the current action
        this.$img.setAttribute('src', ev.target.getAttribute('src'));
        this.currentAction = ev.target;
        this.setAttribute('pressed', 'pressed');
        // and close the menu
        this.$menu.classList.remove('open');
        break;
      case 'DIV':
        this._shadowRoot.querySelectorAll('.menu > .pressed').forEach((b) => { b.classList.remove('pressed'); });
        ev.target.classList.add('pressed');
        this.updateLib(ev.target.dataset.menu);
        break;
      default:
        // eslint-disable-next-line no-console
        console.error('unkonw nodeName for:', ev.target, ev.target.className);
      }
    };
    // capture event from slots
    this.addEventListener('click', onClickHandler);
    this.$menu.addEventListener('click', onClickHandler);
  }
  /**
   * @function updateLib
   * @param {string} lib
   * @returns {void}
   */
  async updateLib (lib) {
    const libDir = this.getAttribute('lib');
    try {
      // initialize buttons for all shapes defined for this library
      const response = await fetch(`${libDir}${lib}.json`);
      const json = await response.json();
      const {data} = json;
      // eslint-disable-next-line no-unsanitized/property
      this.$lib.innerHTML = Object.entries(data).map(([key, path]) => {
        const encoded = btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <svg viewBox="-15 -15 330 330"><path fill="none" stroke="#000" stroke-width="10" d="${path}"></path></svg>
        </svg>`);
        return `<se-button data-shape="${key}"src="data:image/svg+xml;base64,${encoded}"></se-button>`;
      }).join('');
    } catch (error) {
      console.error(`could not read file:${libDir}${lib}.json`, error);
    }
  }
}

// Register
customElements.define('se-explorerbutton', ExplorerButton);
