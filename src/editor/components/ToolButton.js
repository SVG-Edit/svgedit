const template = document.createElement('template');
template.innerHTML = `
  <style>
  :host :hover
  {
    background-color: #ffc;
  }
  :host
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
  .svg_icon {
    border: none;
    width: 24px;
    height: 24px;
    overflow: none;
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
    this._shadowRoot = this.attachShadow({mode: 'closed'});
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
    return ['title', 'src'];
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
      this.$div.setAttribute('title', newValue);
      break;
    case 'src':
      this.$img.setAttribute('src', newValue);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`unknown attribute: ${name}`);
      break;
    }
    console.log(name, oldValue, newValue);
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
customElements.define('tool-button', ToolButton);
