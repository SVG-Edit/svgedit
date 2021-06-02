import './se-elix/define/NumberSpinBox.js';

const template = document.createElement('template');
// eslint-disable-next-line no-unsanitized/property
template.innerHTML = `
  <style>
 
  #dialog_content {
    margin: 10px 10px 5px 10px;
    background: #5a6162;
    overflow: auto;
    text-align: left;
    border: 1px solid #c8c8c8;
  }

  #dialog_content p, #dialog_content select, #dialog_content label {
    margin: 10px;
    line-height: 0.3em;
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
  .se-select{
    text-align: center;
  }
  elix-number-spin-box{
    margin-left: 15px;
  }
  </style>
  <elix-dialog id="export_box" aria-label="export svg" closed>
    <div class="overlay"></div>
    <div id="dialog_container">
      <div id="dialog_content">
        <p class="se-select" id="export_select"></p>
        <p class="se-select">
        <select id="se-storage-pref">
          <option value="PNG">PNG</option>
          <option value="JPEG">JPEG</option>
          <option value="BMP">BMP</option>
          <option value="WEBP">WEBP</option>
          <option value="PDF">PDF</option>
        </select> 
        </p>
        <p id="se-quality"><elix-number-spin-box min="-1" max="101" step="5" value="100"></elix-number-spin-box></p>
      </div>
      <div id="dialog_buttons">
        <button id="export_ok"></button>
        <button id="export_cancel"></button>
      </div>
    </div>
  </elix-dialog>
`;
/**
 * @class SeExportDialog
 */
export class SeExportDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$dialog = this._shadowRoot.querySelector('#export_box');
    this.$okBtn = this._shadowRoot.querySelector('#export_ok');
    this.$cancelBtn = this._shadowRoot.querySelector('#export_cancel');
    this.$exportOption = this._shadowRoot.querySelector('#se-storage-pref');
    this.$qualityCont = this._shadowRoot.querySelector('#se-quality');
    this.$input = this._shadowRoot.querySelector('elix-number-spin-box');
    this.value = 1;
  }
  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('common-ok', i18next.t('common.ok'));
    this.setAttribute('common-cancel', i18next.t('common.cancel'));
    this.setAttribute('ui-quality', i18next.t('ui.quality'));
    this.setAttribute('ui-export_type_label', i18next.t('ui.export_type_label'));
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'dialog', 'common-ok', 'common-cancel', 'ui-quality', 'ui-export_type_label' ];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    // eslint-disable-next-line sonarjs/no-small-switch
    let node;
    switch (name) {
    case 'dialog':
      if (newValue === 'open') {
        this.$dialog.open();
      } else {
        this.$dialog.close();
      }
      break;
    case 'common-ok':
      this.$okBtn.textContent = newValue;
      break;
    case 'common-cancel':
      this.$cancelBtn.textContent = newValue;
      break;
    case 'ui-quality':
      node = this._shadowRoot.querySelector('#se-quality');
      node.prepend(newValue);
      break;
    case 'ui-export_type_label':
      node = this._shadowRoot.querySelector('#export_select');
      node.textContent = newValue;
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
    this.$input.addEventListener('change', (e) => {
      e.preventDefault();
      this.value = e.target.value;
    });
    this.$input.addEventListener('click', (e) => {
      e.preventDefault();
      this.value = e.target.value;
    });
    const onSubmitHandler = (e, action) => {
      if (action === 'cancel') {
        document.getElementById('se-export-dialog').setAttribute('dialog', 'close');
      } else {
        const triggerEvent = new CustomEvent('change', { detail: {
          trigger: action,
          imgType: this.$exportOption.value,
          quality: this.value
        } });
        this.dispatchEvent(triggerEvent);
        document.getElementById('se-export-dialog').setAttribute('dialog', 'close');
      }
    };
    const onChangeHandler = (e) => {
      if (e.target.value === 'PDF') {
        this.$qualityCont.style.display = 'none';
      } else {
        this.$qualityCont.style.display = 'block';
      }
    };
    this.$okBtn.addEventListener('click', (evt) => onSubmitHandler(evt, 'ok'));
    this.$cancelBtn.addEventListener('click', (evt) => onSubmitHandler(evt, 'cancel'));
    this.$exportOption.addEventListener('change', (evt) => onChangeHandler(evt));
  }
}

// Register
customElements.define('se-export-dialog', SeExportDialog);
