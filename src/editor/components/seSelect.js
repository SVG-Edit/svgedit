const template = document.createElement('template');
template.innerHTML = `
<style>
select {
  margin-top: 8px;
  background-color: var(--input-color);
  appearance: none;
  outline: none;
  padding: 3px;
}
label {
  margin-left: 2px;
}
::slotted(*) {
  padding:0;
  width:100%;
}
</style>
  <label>Label</label>
  <select>
  </select>

`;
/**
 * @class SeList
 */
export class SeSelect extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$select = this._shadowRoot.querySelector('select');
    this.$label = this._shadowRoot.querySelector('label');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'label', 'width', 'height', 'options', 'values' ];
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let options;
    if (oldValue === newValue) return;
    switch (name) {
    case 'label':
      this.$label.textContent = newValue;
      break;
    case 'height':
      this.$select.style.height = newValue;
      break;
    case 'width':
      this.$select.style.width = newValue;
      break;
    case 'options':
      options = newValue.split(',');
      options.forEach((option) => {
        const optionNode = document.createElement("OPTION");
        const text = document.createTextNode(option);
        optionNode.appendChild(text);
        this.$select.appendChild(optionNode);
      });
      break;
    case 'values':
      options = newValue.split(' ');
      options.forEach((option, index) => {
        this.$select.children[index].setAttribute('value', option);
      });
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
  get width () {
    return this.getAttribute('width');
  }

  /**
   * @function set
   * @returns {void}
   */
  set width (value) {
    this.setAttribute('width', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get height () {
    return this.getAttribute('height');
  }

  /**
   * @function set
   * @returns {void}
   */
  set height (value) {
    this.setAttribute('height', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get value () {
    return this.$select.value;
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.$select.value = value;
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const currentObj = this;
    this.$select.addEventListener('change', () => {
      const value = this.$select.value;
      const closeEvent = new CustomEvent('change', { detail: { value } });
      currentObj.dispatchEvent(closeEvent);
      currentObj.value = value;
    });
  }
}

// Register
customElements.define('se-select', SeSelect);
