// eslint-disable-next-line node/no-unpublished-import
import AlertDialog from 'elix/define/AlertDialog.js';
/**
 * @class SeAlertDialog
 */
export class SeAlertDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this.dialog = new AlertDialog();
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'type', 'close'];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
    case 'title':
      if (this.dialog.opened) {
        this.dialog.close();
      }
      this.dialog.textContent = newValue;
      this.dialog.open();
      break;
    case 'type':
      if (newValue === 'prompt_cancel') {
        this.dialog.choices = ['Cancel'];
      } else {
        this.dialog.choices = ['Ok'];
      }
      break;
    case 'close':
      if (this.dialog.opened) {
        this.dialog.close();
      }
      break;
    default:
      console.error('unkonw attr for:', name, 'newValue =', newValue);
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
  get type () {
    return this.getAttribute('type');
  }

  /**
   * @function set
   * @returns {void}
   */
  set type (value) {
    this.setAttribute('type', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get close () {
    return this.getAttribute('close');
  }

  /**
   * @function set
   * @returns {void}
   */
  set close (value) {
    this.setAttribute('close', value);
  }
}

// Register
customElements.define('se-alert-dialog', SeAlertDialog);
