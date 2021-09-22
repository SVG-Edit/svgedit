import { t } from '../locale.js';
const template = document.createElement('template');
// eslint-disable-next-line no-unsanitized/property
template.innerHTML = `
  <style>
  </style>
  <div></div>
`;
/**
 * @class SeText
 */
export class SeText extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    // locate the component
    this.$div = this._shadowRoot.querySelector('div');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'text', 'value', 'style' ];
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
    case 'text':
      this.$div.setAttribute('title', t(newValue));
      break;
    case 'style':
      this.$div.style = newValue;
      break;
    case 'value':
      this.$div.value = newValue;
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
  get text () {
    return this.getAttribute('text');
  }

  /**
   * @function set
   * @returns {void}
   */
  set text (value) {
    this.setAttribute('text', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get value () {
    return this.value;
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.value = value;
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
customElements.define('se-text', SeText);
