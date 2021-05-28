import { isValidUnit } from '../../common/units.js';

const template = document.createElement('template');
// eslint-disable-next-line no-unsanitized/property
template.innerHTML = `
  <style>
  :not(:defined) {
    display: none;
  }

  /* Force the scroll bar to appear so we see it hide when overlay opens. */
  body::-webkit-scrollbar {
    background: lightgray;
  }
  body::-webkit-scrollbar-thumb {
    background: darkgray;
  }
  #svg_docprops #svg_docprops_container {
    padding: 10px;
    background-color: #5a6162;
    color: #c5c5c5;
    border: 1px outset #777;
    opacity: 1.0;
    font-family: Verdana, Helvetica, sans-serif;
    font-size: .8em;
    z-index: 20001;
  }
  
  #svg_docprops .error {
    border: 1px solid red;
    padding: 3px;
  }
  
  #svg_docprops #resolution {
    max-width: 14em;
  }
  
  #tool_docprops_back {
    margin-left: 1em;
    overflow: auto;
  }
  
  #svg_docprops_container #svg_docprops_docprops {
    float: left;
    width: 221px;
    margin: 5px .7em;
    overflow: hidden;
  }
  
  #svg_docprops legend {
    max-width: 195px;
  }
  
  #svg_docprops_docprops > legend {
    font-weight: bold;
    font-size: 1.1em;
  }
  
  #svg_docprops_container fieldset {
    padding: 5px;
    margin: 5px;
    border: 1px solid #DDD;
  }
  
  #svg_docprops_container label {
    display: block;
    margin: .5em;
  }
  </style>
  <elix-dialog id="svg_docprops" aria-label="Sample dialog" closed>
    <div id="svg_docprops_container">
      <div id="tool_docprops_back" class="toolbar_button">
        <button id="tool_docprops_save"></button>
        <button id="tool_docprops_cancel"></button>
      </div>
      <fieldset id="svg_docprops_docprops">
        <legend id="svginfo_image_props"></legend>
        <label>
          <span id="svginfo_title"></span>
          <input type="text" id="canvas_title" />
        </label>
        <fieldset id="change_resolution">
          <legend id="svginfo_dim"></legend>
          <label>
            <span id="svginfo_width"></span>
            <input type="text" id="canvas_width" size="6" />
          </label>
          <label>
            <span id="svginfo_height"></span>
            <input type="text" id="canvas_height" size="6" />
          </label>
          <label>
            <select id="resolution">
              <option id="selectedPredefined" selected="selected"></option>
              <option>640x480</option>
              <option>800x600</option>
              <option>1024x768</option>
              <option>1280x960</option>
              <option>1600x1200</option>
              <option id="fitToContent" value="content"></option>
            </select>
          </label>
        </fieldset>
        <fieldset id="image_save_opts">
          <legend id="includedImages"></legend>
          <label>
            <input type="radio" id="image_embed" name="image_opt" value="embed" checked="checked" />
            <span id="image_opt_embed"></span>
          </label>
          <label>
            <input type="radio" id="image_ref" name="image_opt" value="ref" />
            <span id="image_opt_ref"></span>
          </label>
        </fieldset>
      </fieldset>
    </div>
  </elix-dialog>
  
`;
/**
 * @class SeImgPropDialog
 */
export class SeImgPropDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this.eventlisten = false;
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$saveBtn = this._shadowRoot.querySelector('#tool_docprops_save');
    this.$cancelBtn = this._shadowRoot.querySelector('#tool_docprops_cancel');
    this.$resolution = this._shadowRoot.querySelector('#resolution');
    this.$canvasTitle = this._shadowRoot.querySelector('#canvas_title');
    this.$canvasWidth = this._shadowRoot.querySelector('#canvas_width');
    this.$canvasHeight = this._shadowRoot.querySelector('#canvas_height');
    this.$imageOptEmbed = this._shadowRoot.querySelector('#image_embed');
    this.$imageOptRef = this._shadowRoot.querySelector('#image_ref');
    this.$dialog = this._shadowRoot.querySelector('#svg_docprops');
  }
  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('common-ok', i18next.t('common.ok'));
    this.setAttribute('common-cancel', i18next.t('common.cancel'));
    this.setAttribute('config-image_props', i18next.t('config.image_props'));
    this.setAttribute('config-doc_title', i18next.t('config.doc_title'));
    this.setAttribute('config-doc_dims', i18next.t('config.doc_dims'));
    this.setAttribute('common-width', i18next.t('common.width'));
    this.setAttribute('common-height', i18next.t('common.height'));
    this.setAttribute('config-select_predefined', i18next.t('config.select_predefined'));
    this.setAttribute('tools-fit-to-content', i18next.t('tools.fitToContent'));
    this.setAttribute('config-included_images', i18next.t('config.included_images'));
    this.setAttribute('config-image_opt_embed', i18next.t('config.image_opt_embed'));
    this.setAttribute('config-image_opt_ref', i18next.t('config.image_opt_ref'));
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'title', 'width', 'height', 'save', 'dialog', 'embed', 'common-ok',
      'common-cancel', 'config-image_props', 'config-doc_title', 'config-doc_dims',
      'common-width', 'common-height', 'config-select_predefined',
      'tools-fit-to-content', 'config-included_images', 'config-image_opt_embed',
      'config-image_opt_ref' ];
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
    let node ;
    switch (name) {
    case 'title':
      this.$canvasTitle.value = newValue;
      break;
    case 'width':
      if (newValue === 'fit') {
        this.$canvasWidth.removeAttribute('disabled');
        this.$canvasWidth.value = 100;
        this.$canvasHeight.removeAttribute('disabled');
        this.$canvasHeight.value = 100;
      } else {
        this.$canvasWidth.value = newValue;
      }
      break;
    case 'height':
      if (newValue === 'fit') {
        this.$canvasWidth.removeAttribute('disabled');
        this.$canvasWidth.value = 100;
        this.$canvasHeight.removeAttribute('disabled');
        this.$canvasHeight.value = 100;
      } else {
        this.$canvasHeight.value = newValue;
      }
      break;
    case 'dialog':
      if (this.eventlisten) {
        if (newValue === 'open') {
          this.$dialog.open();
        } else {
          this.$dialog.close();
        }
      }
      break;
    case 'save':
      if (newValue === 'ref') {
        this.$imageOptEmbed.setAttribute('checked', false);
        this.$imageOptRef.setAttribute('checked', true);
      } else {
        this.$imageOptEmbed.setAttribute('checked', true);
        this.$imageOptRef.setAttribute('checked', false);
      }
      break;
    case 'embed':
      if (newValue.includes('one')) {
        const data = newValue.split('|');
        if (data.length > 1) {
          this._shadowRoot.querySelector('#image_opt_embed').setAttribute('title', data[1]);
          this._shadowRoot.querySelector('#image_opt_embed').setAttribute('disabled', 'disabled');
          this._shadowRoot.querySelector('#image_opt_embed').style.color = '#666';
        }
      }
      break;
    case 'common-ok':
      this.$saveBtn.textContent = newValue;
      break;
    case 'common-cancel':
      this.$cancelBtn.textContent = newValue;
      break;
    case 'config-image_props':
      node = this._shadowRoot.querySelector('#svginfo_image_props');
      node.textContent = newValue;
      break;
    case 'config-doc_title':
      node = this._shadowRoot.querySelector('#svginfo_title');
      node.textContent = newValue;
      break;
    case 'config-doc_dims':
      node = this._shadowRoot.querySelector('#svginfo_dim');
      node.textContent = newValue;
      break;
    case 'common-width':
      node = this._shadowRoot.querySelector('#svginfo_width');
      node.textContent = newValue;
      break;
    case 'common-height':
      node = this._shadowRoot.querySelector('#svginfo_height');
      node.textContent = newValue;
      break;
    case 'config-select_predefined':
      node = this._shadowRoot.querySelector('#selectedPredefined');
      node.textContent = newValue;
      break;
    case 'tools-fit-to-content':
      node = this._shadowRoot.querySelector('#fitToContent');
      node.textContent = newValue;
      break;
    case 'config-included_images':
      node = this._shadowRoot.querySelector('#includedImages');
      node.textContent = newValue;
      break;
    case 'config-image_opt_embed':
      node = this._shadowRoot.querySelector('#image_opt_embed');
      node.textContent = newValue;
      break;
    case 'config-image_opt_ref':
      node = this._shadowRoot.querySelector('#image_opt_ref');
      node.textContent = newValue;
      break;
    default:
      super.attributeChangedCallback(name, oldValue, newValue);
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
  get save () {
    return this.getAttribute('save');
  }
  /**
   * @function set
   * @returns {void}
   */
  set save (value) {
    this.setAttribute('save', value);
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
   * @function get
   * @returns {any}
   */
  get embed () {
    return this.getAttribute('embed');
  }
  /**
   * @function set
   * @returns {void}
   */
  set embed (value) {
    this.setAttribute('embed', value);
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const onChangeHandler = (ev) => {
      if (!ev.target.selectedIndex) {
        if (this.$canvasWidth.getAttribute('value') === 'fit') {
          this.$canvasWidth.removeAttribute('disabled');
          this.$canvasWidth.value = 100;
          this.$canvasHeight.removeAttribute('disabled');
          this.$canvasHeight.value = 100;
        }
      } else if (ev.target.value === 'content') {
        this.$canvasWidth.setAttribute('disabled', 'disabled');
        this.$canvasWidth.value = 'fit';
        this.$canvasHeight.setAttribute('disabled', 'disabled');
        this.$canvasHeight.value = 'fit';
      } else {
        const dims = ev.target.value.split('x');
        this.$canvasWidth.value = dims[0];
        this.$canvasWidth.removeAttribute('disabled');
        this.$canvasHeight.value = dims[1];
        this.$canvasHeight.removeAttribute('disabled');
      }
    };
    const onSaveHandler = () => {
      let saveOpt = '';
      const w = this.$canvasWidth.value;
      const h = this.$canvasHeight.value;
      if (w !== 'fit' && !isValidUnit('width', w)) {
        this.$canvasWidth.parentElement.classList.add('error');
      } else {
        this.$canvasWidth.parentElement.classList.remove('error');
      }
      if (h !== 'fit' && !isValidUnit('height', w)) {
        this.$canvasHeight.parentElement.classList.add('error');
      } else {
        this.$canvasHeight.parentElement.classList.remove('error');
      }
      if (this.$imageOptEmbed.getAttribute('checked') === 'true') {
        saveOpt = 'embed';
      }
      if (this.$imageOptRef.getAttribute('checked') === 'true') {
        saveOpt = 'ref';
      }
      const closeEvent = new CustomEvent('change', { detail: {
        title: this.$canvasTitle.value,
        w: this.$canvasWidth.value,
        h: this.$canvasHeight.value,
        save: saveOpt,
        dialog: 'close'
      } });
      this.$canvasWidth.removeAttribute('disabled');
      this.$canvasHeight.removeAttribute('disabled');
      this.$resolution.selectedIndex = 0;
      this.dispatchEvent(closeEvent);
    };
    const onCancelHandler = () => {
      const closeEvent = new CustomEvent('change', { detail: {
        dialog: 'closed'
      } });
      this.$canvasWidth.removeAttribute('disabled');
      this.$canvasHeight.removeAttribute('disabled');
      this.$resolution.selectedIndex = 0;
      this.dispatchEvent(closeEvent);
    };
    this.$resolution.addEventListener('change', onChangeHandler);
    this.$saveBtn.addEventListener('click', onSaveHandler);
    this.$cancelBtn.addEventListener('click', onCancelHandler);
    this.$dialog.addEventListener('close', onCancelHandler);
    this.eventlisten = true;
  }
}

// Register
customElements.define('se-img-prop-dialog', SeImgPropDialog);
