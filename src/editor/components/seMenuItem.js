/* eslint-disable node/no-unpublished-import */
import 'elix/define/Menu.js';
import 'elix/define/MenuItem.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    elix-menu-item {
      display: flex;
      align-items: center;
    }

    .menu_item_text {
      padding-left: 10px;
    }
  </style>
  <elix-menu-item>
      <img src="./images/logo.svg" alt="icon" />
      <span class="menu_item_text"></span>
  </elix-menu-item>
`;
/**
 * @class SeMenuItem
 */
export class SeMenuItem extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$img = this._shadowRoot.querySelector('img');
    this.$label = this._shadowRoot.querySelector('span');
    this.$menuitem = this._shadowRoot.querySelector('elix-menu-item');
    this.$svg = this.$menuitem.shadowRoot.querySelector('#checkmark');
    this.$svg.setAttribute('style', 'display: none;');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'src'];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let shortcut = '';
    if (oldValue === newValue) return;
    switch (name) {
    case 'src':
      this.$img.setAttribute('src', newValue);
      this.$img.style.display = 'inline-block';
      break;
    case 'label':
      shortcut = this.getAttribute('shortcut');
      this.$label.textContent = `${newValue} ${shortcut ? `(${shortcut})` : ''}`;
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
  get label () {
    return this.getAttribute('label');
  }

  /**
   * @function set
   * @returns {void}
   */
  set label (value) {
    this.setAttribute('label', value);
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
        if (this.id) {
          document.getElementById(this.id).click();
        }
        e.preventDefault();
      });
    }
  }
}

// Register
customElements.define('se-menu-item', SeMenuItem);
