/* eslint-disable max-len */
const template = document.createElement('template');
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
    max-width: 440px;
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
        <p id="notificationNote"> </p>
        <select id="se-storage-pref">
          <option value="prefsAndContent" id="prefsAndContent"></option>
          <option value="prefsOnly" id="prefsOnly"></option>
          <option value="noPrefsOrContent" id="noPrefsOrContent"></option>
        </select> 
        <label title="" id="se-remember-title">
          <input type="checkbox" id="se-remember" value="" checked>
        </label>     
      </div>
      <div id="dialog_buttons">
        <button id="storage_ok"></button>
        <button id="storage_cancel"></button>
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
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('common-ok', i18next.t('common.ok'));
    this.setAttribute('common-cancel', i18next.t('common.cancel'));
    this.setAttribute('notify-editor_pref_msg', i18next.t('notification.editorPreferencesMsg'));
    this.setAttribute('properties-prefs_and_content', i18next.t('properties.prefs_and_content'));
    this.setAttribute('properties-prefs_only', i18next.t('properties.prefs_only'));
    this.setAttribute('properties-no_prefs_or_content', i18next.t('properties.no_prefs_or_content'));
    this.setAttribute('tools-remember_this_choice', i18next.t('tools.remember_this_choice'));
    this.setAttribute('tools-remember_this_choice_title', i18next.t('tools.remember_this_choice_title'));
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'dialog', 'storage', 'common-ok', 'common-cancel', 'notify-editor_pref_msg', 'properties-prefs_and_content', 'tools-remember_this_choice', 'tools-remember_this_choice_title', 'properties-prefs_only', 'properties-no_prefs_or_content' ];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let node;
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
    case 'common-ok':
      this.$okBtn.textContent = newValue;
      break;
    case 'common-cancel':
      this.$cancelBtn.textContent = newValue;
      break;
    case 'notify-editor_pref_msg':
      node = this._shadowRoot.querySelector('#notificationNote');
      node.textContent = newValue;
      break;
    case 'properties-prefs_and_content':
      node = this._shadowRoot.querySelector('#prefsAndContent');
      node.textContent = newValue;
      break;
    case 'properties-prefs_only':
      node = this._shadowRoot.querySelector('#prefsOnly');
      node.textContent = newValue;
      break;
    case 'properties-no_prefs_or_content':
      node = this._shadowRoot.querySelector('#noPrefsOrContent');
      node.textContent = newValue;
      break;
    case 'tools-remember_this_choice':
      node = this._shadowRoot.querySelector('#se-remember-title');
      node.prepend(newValue);
      break;
    case 'tools-remember_this_choice_title':
      node = this._shadowRoot.querySelector('#se-remember-title');
      node.setAttribute('title', newValue);
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
