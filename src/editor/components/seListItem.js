/* eslint-disable node/no-unpublished-import */
import 'elix/define/Option.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  </style>  
  <elix-option aria-label="option">
    <slot></slot>
  </elix-option>  
`;
/**
 * @class SeMenu
 */
export class SeListItem extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$menuitem = this._shadowRoot.querySelector('elix-menu-item');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['option'];
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
    case 'option':
      this.$menuitem.setAttribute('option', newValue);
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
  get option () {
    return this.getAttribute('option');
  }

  /**
   * @function set
   * @returns {void}
   */
  set option (value) {
    this.setAttribute('option', value);
  }
}

// Register
customElements.define('se-list-item', SeListItem);
