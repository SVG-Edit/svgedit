/* eslint-disable max-len */
/* eslint-disable node/no-unpublished-import */
import 'elix/define/Dialog.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
 
  #dialog_content {
    margin: 10px 10px 5px 10px;
    background: #DDD;
    overflow: auto;
    text-align: left;
    border: 1px solid #B0B0B0;
  }

  #dialog_content p, #dialog_content select, #dialog_content label {
    margin: 10px;
    line-height: 1.3em;
  }
  
  #dialog_container {
    font-family: Verdana;
    text-align: center;
    left: 50%;
    top: 50%;
    max-width: 400px;
    z-index: 50001;
    background: #CCC;
    border: 1px outset #777;
    font-family:Verdana,Helvetica,sans-serif;
    font-size:0.8em;
  }
  
  #dialog_container, #dialog_content {
    border-radius: 5px;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
  }
  
  #dialog_buttons input[type=text] {
    width: 90%;
    display: block;
    margin: 0 0 5px 11px;
  }
  
  #dialog_buttons input[type=button] {
    margin: 0 1em;
  }
  </style>
  <elix-dialog id="dialog_box" aria-label="SVG-Edit storage preferences" closed>
    <div class="overlay"></div>
    <div id="dialog_container">
      <div id="dialog_content">
        <p> 
          By default and where supported, SVG-Edit can store your editor preferences and SVG content locally on your machine so you do not need to add these back each time you load SVG-Edit. If, for privacy reasons, you do not wish to store this information on your machine, you can change away from the default option below.
        </p>
        <select id="se-storage-pref">
          <option value="prefsAndContent" id="js-storage" disabled>Store preferences and SVG content locally</option>
          <option value="prefsOnly">Only store preferences locally</option>
          <option value="noPrefsOrContent">Do not store my preferences or SVG content locally</option>
        </select> 
        <label title="If you choose to opt out of storage while remembering this choice, the URL will change so as to avoid asking again.">
          Remember this choice?<input type="checkbox" id="se-remember" value="" checked>
        </label>     
      </div>
      <div id="dialog_buttons">
        <button id="storage_ok">
          <img class="svg_icon" src="./images/ok.svg" alt="icon" width="16" height="16" />
          Ok
        </button>
        <button id="storage_cancel">
          <img class="svg_icon" src="./images/cancel.svg" alt="icon" width="16" height="16" />
          Cancel
        </button>
      </div>
    </div>
  </elix-dialog>
`;
/**
 * @class SeStorageDialog
 */
export class SeStorageDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$dialog = this._shadowRoot.querySelector('#dialog_box');
    this.$storage = this._shadowRoot.querySelector('#js-storage');
    this.$okBtn = this._shadowRoot.querySelector('#storage_ok');
    this.$cancelBtn = this._shadowRoot.querySelector('#storage_cancel');
    this.$storageInput = this._shadowRoot.querySelector('#se-storage-pref');
    this.$rememberInput = this._shadowRoot.querySelector('#se-remember');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'storage'];
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
    case 'dialog':
      if (newValue === 'open') {
        this.$dialog.open();
      } else {
        this.$dialog.close();
      }
      break;
    case 'storage':
      if (newValue === 'true') {
        this.$storageInput.options[0].disabled = false;
      } else {
        this.$storageInput.options[0].disabled = true;
      }
      break;
    default:
      // super.attributeChangedCallback(name, oldValue, newValue);
      break;
    }
  }
  /**
   * @function get
   * @returns {any}
   */
  get dialog () {
    return this.getAttribute('dialog');
  }
  /**
   * @function set
   * @returns {void}
   */
  set dialog (value) {
    this.setAttribute('dialog', value);
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const onSubmitHandler = (e, action) => {
      const triggerEvent = new CustomEvent('change', {detail: {
        trigger: action,
        select: this.$storageInput.value,
        checkbox: this.$rememberInput.checked
      }});
      this.dispatchEvent(triggerEvent);
    };
    this.$okBtn.addEventListener('click', (evt) => onSubmitHandler(evt, 'ok'));
    this.$cancelBtn.addEventListener('click', (evt) => onSubmitHandler(evt, 'cancel'));
  }
  /**
 * Sets SVG content as a string with "svgedit-" and the current
 *   canvas name as namespace.
 * @param {string} val
 * @returns {void}
 */
  setSVGContentStorage (val) {
    if (this.storage) {
      const name = 'svgedit-' + this.configObj.curConfig.canvasName;
      if (!val) {
        this.storage.removeItem(name);
      } else {
        this.storage.setItem(name, val);
      }
    }
  }
}

// Register
customElements.define('se-storage-dialog', SeStorageDialog);

/*
if ('localStorage' in window) { // && onWeb removed so Webkit works locally
       this.storage = this.localStorage;
      }
*/
