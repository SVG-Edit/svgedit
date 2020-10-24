// import {isMac} from '../../common/browser.js';
// if (isMac() && !window.opera) 'Ctrl+' 'Cmd+'

const template = document.createElement('template');
template.innerHTML = `
  <style>
  :host :hover :not(.disabled)
  {
    background-color: #ffc;
  }
  div
  {
    height: 24px;
    width: 24px;
    margin: 2px 2px 4px;
    padding: 3px;
    box-shadow: inset 1px 1px 2px white, 1px 1px 1px rgba(0,0,0,0.3);
    background-color: #E8E8E8;
    cursor: pointer;
    border-radius: 3px;
  }
  img {
    border: none;
    width: 24px;
    height: 24px;
    overflow: none;
  }
  .pressed {
    background-color: #F4E284 !important;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.4), 1px 1px  0 white  !important;
  }
  .disabled {
    opacity: 0.3;
    cursor: default;
  }
  </style>
  <div title="title">
    <img class="svg_icon" src="./images/logo.svg" alt="icon">
  </div>
`;
/**
 * @class ToolButton
 */
export class ToolButton extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    // locate the component
    this.$div = this._shadowRoot.querySelector('div');
    this.$img = this._shadowRoot.querySelector('img');
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
        this.$div.setAttribute('title', `${newValue} [${shortcut}]`);
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

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    // capture shortcuts
    const shortcut = this.getAttribute('shortcut');
    if (shortcut) {
      // register the keydown event
      document.addEventListener('keydown', (e) => {
        // only track keyboard shortcuts for the body containing the SVG-Editor
        if (e.target.nodeName !== 'BODY') return;
        // normalize key
        const key = `${(e.metaKey) ? 'meta+' : ''}${(e.ctrlKey) ? 'ctrl+' : ''}${e.key.toUpperCase()}`;
        if (shortcut !== key) return;
        // launch the click event
        this.click();
        e.preventDefault();
      });
    }
  }
}

// Register
customElements.define('se-button', ToolButton);
