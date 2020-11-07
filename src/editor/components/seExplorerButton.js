const template = document.createElement('template');
template.innerHTML = `
  <style>
  :host {
    position:relative;
  }
  .overall:hover *
  {
    background-color: #ffc;
  }
  img {
    border: none;
    width: 24px;
    height: 24px;
  }
  .overall.pressed .button-icon,
  .overall.pressed .handle {
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
    top:-2px;
    left:32px;
    background: none !important;
    display:none;
  }
  .image-lib {
    position: absolute;
    top: 2px;
    left:35px;
    background: none !important;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    width: 150px;
  }
  .menu-item {
    width: 50px;
    height: 20px;
    background: #E8E8E8;
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
    <div class="menu">
      <div class="menu-item">menu 1</div>
      <div class="image-lib"">
        <se-button src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23A0041E' d='M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z'/%3E%3Cpath fill='%23FFAC33' d='M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z'/%3E%3Ccircle fill='%23FFCC4D' cx='8.999' cy='27' r='4'/%3E%3Cpath fill='%2355ACEE' d='M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z'/%3E%3Cpath d='M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z'/%3E%3Cpath fill='%23A0041E' d='M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z'/%3E%3C/svg%3E"></se-button>
        <se-button src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23A0041E' d='M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z'/%3E%3Cpath fill='%23FFAC33' d='M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z'/%3E%3Ccircle fill='%23FFCC4D' cx='8.999' cy='27' r='4'/%3E%3Cpath fill='%2355ACEE' d='M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z'/%3E%3Cpath d='M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z'/%3E%3Cpath fill='%23A0041E' d='M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z'/%3E%3C/svg%3E"></se-button>
        <se-button src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23A0041E' d='M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z'/%3E%3Cpath fill='%23FFAC33' d='M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z'/%3E%3Ccircle fill='%23FFCC4D' cx='8.999' cy='27' r='4'/%3E%3Cpath fill='%2355ACEE' d='M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z'/%3E%3Cpath d='M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z'/%3E%3Cpath fill='%23A0041E' d='M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z'/%3E%3C/svg%3E"></se-button>
        <se-button src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23A0041E' d='M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z'/%3E%3Cpath fill='%23FFAC33' d='M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z'/%3E%3Ccircle fill='%23FFCC4D' cx='8.999' cy='27' r='4'/%3E%3Cpath fill='%2355ACEE' d='M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z'/%3E%3Cpath d='M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z'/%3E%3Cpath fill='%23A0041E' d='M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z'/%3E%3C/svg%3E"></se-button>
        <se-button src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23A0041E' d='M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z'/%3E%3Cpath fill='%23FFAC33' d='M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z'/%3E%3Ccircle fill='%23FFCC4D' cx='8.999' cy='27' r='4'/%3E%3Cpath fill='%2355ACEE' d='M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z'/%3E%3Cpath d='M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z'/%3E%3Cpath fill='%23A0041E' d='M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z'/%3E%3C/svg%3E"></se-button>
        <se-button src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23A0041E' d='M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z'/%3E%3Cpath fill='%23FFAC33' d='M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z'/%3E%3Ccircle fill='%23FFCC4D' cx='8.999' cy='27' r='4'/%3E%3Cpath fill='%2355ACEE' d='M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z'/%3E%3Cpath d='M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z'/%3E%3Cpath fill='%23A0041E' d='M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z'/%3E%3C/svg%3E"></se-button>
      </div>
      <div class="menu-item">menu 2</div>
      <div class="menu-item">menu 3</div>
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
    this.$img = this._shadowRoot.querySelector('img');
    this.$menu = this._shadowRoot.querySelector('.menu');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled'];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
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
      console.log(ev);
      switch (ev.target.nodeName) {
      case 'SE-EXPLORERBUTTON':
        this.$menu.classList.add('open');
        break;
      case 'SE-BUTTON':
        // change to the current action
        this.$img.setAttribute('src', ev.target.getAttribute('src'));
        this.currentAction = ev.target;
        this.setAttribute('pressed', 'pressed');
        // and close the menu
        this.$menu.classList.remove('open');
        break;
      default:
        // eslint-disable-next-line no-console
        console.error('unkonw nodeName for:', ev.target, ev.target.className);
      }
    };
    // capture event from slots
    this.addEventListener('click', onClickHandler);
  }
}

// Register
customElements.define('se-explorerbutton', ExplorerButton);
