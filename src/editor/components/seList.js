/* eslint-disable node/no-unpublished-import */
import 'elix/define/DropdownList.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  </style>
  <label>Label</label>
  <elix-dropdown-list>
    <slot></slot>
  </elix-dropdown-list>
  
`;
/**
 * @class SeList
 */
export class SeList extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$dropdown = this._shadowRoot.querySelector('elix-dropdown-list');
    this.$label = this._shadowRoot.querySelector('label');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label'];
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
    case 'label':
      this.$label.textContent = newValue;
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
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.$dropdown.addEventListener('change', (e) => {
      e.preventDefault();
      const selectedItem = e?.detail?.closeResult;
      if (selectedItem !== undefined && selectedItem?.id !== undefined) {
        document.getElementById(selectedItem.id).click();
      }
    });
  }
}

// Register
customElements.define('se-list', SeList);
