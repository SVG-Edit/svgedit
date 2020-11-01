/* eslint-disable max-len */
const template = document.createElement('template');
template.innerHTML = `
  <style>
  :host {
    position:relative;
  }
  :host(:hover) :not(.disabled)
  {
    background-color: #ffc;
  }
  img {
    border: none;
    width: 24px;
    height: 24px;
  }
  .pressed {
    background-color: #F4E284 !important;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.4), 1px 1px  0 white  !important;
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
    height: 4px;
    width: 4px;
    background: no-repeat url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjQiIHZpZXdCb3g9IjAgMCAzIDQiIHdpZHRoPSIzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwb2x5Z29uIGZpbGw9IiM4MDg2OEIiIHBvaW50cz0iNDg4LjI1IDY1Mi43NSA0ODYuMjUgNjU1LjI1IDQ4NC4yNSA2NTIuNzUiIHRyYW5zZm9ybT0icm90YXRlKC05MCAtODIuMjUgNTcwLjUpIi8+PC9zdmc+);
    transform: scale(2);
    position:absolute;
    bottom: 2px;
    right: 1px;
  }
  .button-icon {
  }
  .menu {
    position: absolute;
    display: flex;
    top:-2px;
    left:32px;
    background: none !important;
  }
  .menu-item {
    align-content: flex-start;
    height: 24px;
    width: 24px;
    top:0px;
    left:0px;
  }
  </style>
  
  <div ">
    <div class="menu-button">
      <img class="button-icon" src="./images/logo.svg" alt="icon">
      <div class="handle"></div>
    </div>
    <div class="menu">
      <slot></slot>
    </div>
  </div>
  
`;
/**
 * @class FlyingButton
 */
export class FlyingButton extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    // locate the component
    this.$open = this._shadowRoot.querySelector('.menu-button');
    this.$img = this._shadowRoot.querySelector('img');
    this.$menu = this._shadowRoot.querySelector('.menu');
    // the last element of the div is the slot
    // we retrieve all elements added in the slot (i.e. se-buttons)
    this.$elements = this.$menu.lastElementChild.assignedElements();
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'src', 'pressed', 'disabled'];
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
        this.$open.setAttribute('title', `${newValue} [${shortcut}]`);
      }
      break;
    case 'src':
      this.$img.setAttribute('src', newValue);
      break;
    case 'pressed':
      if (newValue) {
        this.$div.classList.add('pressed');
      } else {
        this.$div.classList.remove('pressed');
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
   * @function get
   * @returns {any}
   */
  get src () {
    return this.getAttribute('src');
  }

  /**
   * @function set
   * @returns {void}
   */
  set src (value) {
    this.setAttribute('src', value);
  }
}

// Register
customElements.define('se-flyingbutton', FlyingButton);
/*
 <div class="menu-item item1" title="title">
      <img class="svg_icon" src="./images/logo.svg" alt="icon">
    </div>
    <div class="menu-item item2" title="title">
      <img class="svg_icon" src="./images/logo.svg" alt="icon">
    </div>
    <div class="menu-item item3" title="title">
      <img class="svg_icon" src="./images/logo.svg" alt="icon">
    </div>
    <div class="menu-item item4" title="title">
       <img class="svg_icon" src="./images/logo.svg" alt="icon">
    </div>
    */
