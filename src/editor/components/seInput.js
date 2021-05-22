import 'elix/define/Input.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  img {
    top: 2px;
    left: 4px;
    position: relative;
  }
  span {
    bottom: 1px;
    right: -4px;
    position: relative;
    margin-right: 4px;
    color: #fff;
  }
  elix-input {
    background-color: var(--input-color);
    border-radius: 3px;
  }
  </style>
  <img src="./images/logo.svg" alt="icon" width="12" height="12" />
  <span id="label">label</span>
  <elix-input></elix-input>
`;

/**
 * @class SEInput
 */
export class SEInput extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    // locate the component
    this.$img = this._shadowRoot.querySelector('img');
    this.$label = this.shadowRoot.getElementById('label');
    this.$event = new CustomEvent('change');
    this.$input = this._shadowRoot.querySelector('elix-input');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'value', 'label', 'src', 'size' ];
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
    case 'src':
      this.$img.setAttribute('src', newValue);
      this.$label.remove();
      break;
    case 'size':
      this.$input.setAttribute('size', newValue);
      break;
    case 'label':
      this.$label.textContent = newValue;
      this.$img.remove();
      break;
    case 'value':
      this.$input.value = newValue;
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
  get value () {
    return this.$input.value;
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.$input.value = value;
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
   * @function get
   * @returns {any}
   */
  get size () {
    return this.getAttribute('size');
  }

  /**
   * @function set
   * @returns {void}
   */
  set size (value) {
    this.setAttribute('size', value);
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.addEventListener('change', (e) => {
      e.preventDefault();
      this.value = e.target.value;
    });
    this.dispatchEvent(this.$event);
  }
}
// Register
customElements.define('se-input', SEInput);
