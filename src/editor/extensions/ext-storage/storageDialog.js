/* eslint-disable max-len */
/* globals svgEditor */
import 'elix/define/Dialog.js';
const template = document.createElement('template');
const notification = svgEditor.i18next.t('notification.editorPreferencesMsg');
const prefs_and_content = svgEditor.i18next.t('properties.prefs_and_content');
const prefs_only = svgEditor.i18next.t('properties.prefs_only');
const no_prefs_or_content = svgEditor.i18next.t('properties.no_prefs_or_content');
const remember_this_choice = svgEditor.i18next.t('tools.remember_this_choice');
const remember_this_choice_title = svgEditor.i18next.t('tools.remember_this_choice_title');
const ok = svgEditor.i18next.t('common.ok');
const cancel = svgEditor.i18next.t('common.cancel');
// eslint-disable-next-line no-unsanitized/property
template.innerHTML = `
  <style>
 
  #dialog_content {
    margin: 10px 10px 5px 10px;
    background: #DDD;
    overflow: auto;
    text-align: left;
    border: 1px solid #5a6162;
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
    background: #5a6162;
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
          ${notification} 
        </p>
        <select id="se-storage-pref">
          <option value="prefsAndContent">${prefs_and_content}</option>
          <option value="prefsOnly">${prefs_only}</option>
          <option value="noPrefsOrContent">${no_prefs_or_content}</option>
        </select> 
        <label title="${remember_this_choice_title}">
        ${remember_this_choice}<input type="checkbox" id="se-remember" value="" checked>
        </label>     
      </div>
      <div id="dialog_buttons">
        <button id="storage_ok">
          <img class="svg_icon" src="./images/ok.svg" alt="icon" width="16" height="16" />
          ${ok}
        </button>
        <button id="storage_cancel">
          <img class="svg_icon" src="./images/cancel.svg" alt="icon" width="16" height="16" />
          ${cancel}
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
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
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
    return [ 'dialog', 'storage' ];
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
      const triggerEvent = new CustomEvent('change', { detail: {
        trigger: action,
        select: this.$storageInput.value,
        checkbox: this.$rememberInput.checked
      } });
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
