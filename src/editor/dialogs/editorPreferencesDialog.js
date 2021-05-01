import 'elix/define/Dialog.js';

const template = document.createElement('template');
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
  .toolbar_button button {
    border:1px solid #dedede;
    line-height:130%;
    float: left;
    background: #E8E8E8 none;
    padding:5px 10px 5px 7px; /* Firefox */
    line-height:17px; /* Safari */
    margin: 5px 20px 0 0;
    border: 1px #808080 solid;
    border-top-color: #FFF;
    border-left-color: #FFF;
    border-radius: 5px;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    cursor: pointer;
  }
  
  .toolbar_button button:hover {
    border: 1px #e0a874 solid;
    border-top-color: #fcd9ba;
    border-left-color: #fcd9ba;
    background-color: #FFC;
  }
  .toolbar_button button:active {
    background-color: #F4E284;
    border-left: 1px solid #663300;
    border-top: 1px solid #663300;
  }
  
  .toolbar_button button .svg_icon {
    margin: 0 3px -3px 0 !important;
    padding: 0;
    border: none;
    width: 16px;
    height: 16px;
  }
  .color_block {
    top: 0;
    left: 0;
  }  
  .color_block svg {
    display: block;
  }
  #bg_blocks {
    overflow: auto;
    margin-left: 30px;
  }  
  #bg_blocks .color_block {
    position: static;
  }
  #svginfo_bg_note {
    font-size: .9em;
    font-style: italic;
    color: #444;
  }
  #svg_prefs #svg_prefs_container {
    padding: 10px;
    background-color: #B0B0B0;
    border: 1px outset #777;
    opacity: 1.0;
    font-family: Verdana, Helvetica, sans-serif;
    font-size: .8em;
    z-index: 20001;
  }
  
  #tool_prefs_back {
    margin-left: 1em;
    overflow: auto;
  }
  
  #svg_prefs #svg_docprops_prefs {
    float: left;
    width: 221px;
    margin: 5px .7em;
    overflow: hidden;
  }
  
  #svg_prefs_container fieldset + fieldset {
    float: right;
  }
  
  #svg_prefs legend {
    max-width: 195px;
  }
  
  #svg_prefs_container > fieldset > legend {
    font-weight: bold;
    font-size: 1.1em;
  }
  
  #svg_prefs fieldset {
    padding: 5px;
    margin: 5px;
    border: 1px solid #DDD;
  }
  
  #svg_prefs_container label {
    display: block;
    margin: .5em;
  }
  #svg_prefs_container div.color_block {
    float: left;
    margin: 2px;
    padding: 20px;
    border: 1px solid #6f6f6f;
  }
  
  #change_background div.cur_background {
    border: 2px solid blue;
    padding: 19px;
  }
  #canvas_bg_url {
    display: block;
    width: 96%;
  }
  #svg_prefs button {
    margin-top: 0;
    margin-bottom: 5px;
  }
  </style>
  <elix-dialog id="svg_prefs" aria-label="Editor Preferences" closed>
    <div id="svg_prefs_container">
      <div id="tool_prefs_back" class="toolbar_button">
        <button id="tool_prefs_save">
          <img class="svg_icon" src="./images/ok.svg" alt="icon" width="16" height="16" />
          OK
        </button>
        <button id="tool_prefs_cancel">
          <img class="svg_icon" src="./images/cancel.svg" alt="icon" width="16" height="16" />
          Cancel
        </button>
      </div>
      <fieldset>
        <legend id="svginfo_editor_prefs">Editor Preferences</legend>
        <label>
          <span id="svginfo_lang">Language:</span>
          <!-- Source: https://en.wikipedia.org/wiki/Language_names -->
          <select id="lang_select">
            <option id="lang_ar" value="ar">العربية</option>
            <option id="lang_cs" value="cs">Čeština</option>
            <option id="lang_de" value="de">Deutsch</option>
            <option id="lang_en" value="en" selected="selected">English</option>
            <option id="lang_es" value="es">Español</option>
            <option id="lang_fa" value="fa">فارسی</option>
            <option id="lang_fr" value="fr">Français</option>
            <option id="lang_fy" value="fy">Frysk</option>
            <option id="lang_hi" value="hi">हिन्दी, हिंदी</option>
            <option id="lang_it" value="it">Italiano</option>
            <option id="lang_ja" value="ja">日本語</option>
            <option id="lang_nl" value="nl">Nederlands</option>
            <option id="lang_pl" value="pl">Polski</option>
            <option id="lang_pt-BR" value="pt-BR">Português (BR)</option>
            <option id="lang_ro" value="ro">Română</option>
            <option id="lang_ru" value="ru">Русский</option>
            <option id="lang_sk" value="sk">Slovenčina</option>
            <option id="lang_sl" value="sl">Slovenščina</option>
            <option id="lang_zh-CN" value="zh-CN">简体中文</option>
            <option id="lang_zh-TW" value="zh-TW">繁體中文</option>
          </select>
        </label>
        <label>
          <span id="svginfo_icons">Icon size:</span>
          <select id="iconsize">
            <option id="icon_small" value="s">Small</option>
            <option id="icon_medium" value="m" selected="selected">Medium</option>
            <option id="icon_large" value="l">Large</option>
            <option id="icon_xlarge" value="xl">Extra Large</option>
          </select>
        </label>
        <fieldset id="change_background">
          <legend id="svginfo_change_background">Editor Background</legend>
          <div id="bg_blocks"></div>
          <label>
            <span id="svginfo_bg_url">URL:</span>
            <input type="text" id="canvas_bg_url" />
          </label>
          <p id="svginfo_bg_note">Note: Background will not be saved with image.</p>
        </fieldset>
        <fieldset id="change_grid">
          <legend id="svginfo_grid_settings">Grid</legend>
          <label for="svginfo_snap_onoff">
            <span id="svginfo_snap_onoff">Snapping on/off</span>
            <input type="checkbox" value="snapping_on" id="grid_snapping_on" />
          </label>
          <label for="grid_snapping_step">
            <span id="svginfo_snap_step">Snapping Step-Size:</span>
            <input type="text" id="grid_snapping_step" size="3" value="10" />
          </label>
          <label>
            <span id="svginfo_grid_color">Grid color:</span>
            <input type="text" id="grid_color" size="3" value="#000" />
          </label>
        </fieldset>
        <fieldset id="units_rulers">
          <legend id="svginfo_units_rulers">Units &amp; Rulers</legend>
          <label>
            <span id="svginfo_rulers_onoff">Show rulers</span>
            <input id="show_rulers" type="checkbox" value="show_rulers" checked="checked" />
          </label>
          <label>
            <span id="svginfo_unit">Base Unit:</span>
            <select id="base_unit">
              <option value="px">Pixels</option>
              <option value="cm">Centimeters</option>
              <option value="mm">Millimeters</option>
              <option value="in">Inches</option>
              <option value="pt">Points</option>
              <option value="pc">Picas</option>
              <option value="em">Ems</option>
              <option value="ex">Exs</option>
            </select>
          </label>
        </fieldset>
      </fieldset>
    </div>
  </elix-dialog>  
`;
/**
 * @class SeEditPrefsDialog
 */
export class SeEditPrefsDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this.colorBlocks = ['#FFF', '#888', '#000', 'chessboard'];
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$dialog = this._shadowRoot.querySelector('#svg_prefs');
    this.$saveBtn = this._shadowRoot.querySelector('#tool_prefs_save');
    this.$cancelBtn = this._shadowRoot.querySelector('#tool_prefs_cancel');
    this.$langSelect = this._shadowRoot.querySelector('#lang_select');
    this.$iconSize = this._shadowRoot.querySelector('#iconsize');
    this.$bgBlocks = this._shadowRoot.querySelector('#bg_blocks');
    this.$bgURL = this._shadowRoot.querySelector('#canvas_bg_url');
    this.$gridSnappingOn = this._shadowRoot.querySelector('#grid_snapping_on');
    this.$gridSnappingStep = this._shadowRoot.querySelector('#grid_snapping_step');
    this.$gridColor = this._shadowRoot.querySelector('#grid_color');
    this.$showRulers = this._shadowRoot.querySelector('#show_rulers');
    this.$baseUnit = this._shadowRoot.querySelector('#base_unit');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    // eslint-disable-next-line max-len
    return ['dialog', 'lang', 'iconsize', 'canvasbg', 'bgurl', 'gridsnappingon', 'gridsnappingstep', 'gridcolor', 'showrulers', 'baseunit'];
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
    const blocks = this.$bgBlocks.querySelectorAll('div');
    const curBg = 'cur_background';
    switch (name) {
    case 'dialog':
      if (newValue === 'open') {
        this.$dialog.open();
      } else {
        this.$dialog.close();
      }
      break;
    case 'lang':
      this.$langSelect.value = newValue;
      break;
    case 'iconsize':
      this.$iconSize.value = newValue;
      break;
    case 'canvasbg':
      if (!newValue) {
        if (blocks.length > 0) {
          blocks[0].classList.add(curBg);
        }
      } else {
        blocks.forEach(function (blk) {
          const isBg = blk.dataset.bgColor === newValue;
          if (isBg) {
            blk.classList.add(curBg);
          } else {
            blk.classList.remove(curBg);
          }
        });
      }
      break;
    case 'bgurl':
      this.$bgURL.value = newValue;
      break;
    case 'gridsnappingon':
      if (newValue === 'true') {
        this.$gridSnappingOn.checked = true;
      } else if (newValue === 'false') {
        this.$gridSnappingOn.checked = false;
      }
      break;
    case 'gridsnappingstep':
      this.$gridSnappingStep.value = newValue;
      break;
    case 'gridcolor':
      this.$gridColor.value = newValue;
      break;
    case 'showrulers':
      if (newValue === 'true') {
        this.$showRulers.checked = true;
      } else if (newValue === 'false') {
        this.$showRulers.checked = false;
      }
      break;
    case 'baseunit':
      this.$baseUnit.value = newValue;
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
  get lang () {
    return this.getAttribute('lang');
  }

  /**
   * @function set
   * @returns {void}
   */
  set lang (value) {
    this.setAttribute('lang', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get iconsize () {
    return this.getAttribute('iconsize');
  }
  /**
   * @function set
   * @returns {void}
   */
  set iconsize (value) {
    this.setAttribute('iconsize', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get canvasbg () {
    return this.getAttribute('canvasbg');
  }
  /**
   * @function set
   * @returns {void}
   */
  set canvasbg (value) {
    this.setAttribute('canvasbg', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get bgurl () {
    return this.getAttribute('bgurl');
  }
  /**
   * @function set
   * @returns {void}
   */
  set bgurl (value) {
    this.setAttribute('bgurl', value);
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
  get gridsnappingon () {
    return this.getAttribute('gridsnappingon');
  }
  /**
   * @function set
   * @returns {void}
   */
  set gridsnappingon (value) {
    this.setAttribute('gridsnappingon', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get gridsnappingstep () {
    return this.getAttribute('gridsnappingstep');
  }
  /**
   * @function set
   * @returns {void}
   */
  set gridsnappingstep (value) {
    this.setAttribute('gridsnappingstep', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get gridcolor () {
    return this.getAttribute('gridcolor');
  }
  /**
   * @function set
   * @returns {void}
   */
  set gridcolor (value) {
    this.setAttribute('gridcolor', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get showrulers () {
    return this.getAttribute('showrulers');
  }
  /**
   * @function set
   * @returns {void}
   */
  set showrulers (value) {
    this.setAttribute('showrulers', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get baseunit () {
    return this.getAttribute('baseunit');
  }
  /**
   * @function set
   * @returns {void}
   */
  set baseunit (value) {
    this.setAttribute('baseunit', value);
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const onCancelHandler = () => {
      const closeEvent = new CustomEvent('change', {detail: {
        dialog: 'closed'
      }});
      this.dispatchEvent(closeEvent);
    };
    const onSaveHandler = () => {
      const color = this.$bgBlocks.querySelector('.cur_background').dataset.bgColor || '#FFF';
      const closeEvent = new CustomEvent('change', {detail: {
        lang: this.$langSelect.value,
        dialog: 'close',
        iconsize: this.$iconSize.value,
        bgcolor: color,
        bgurl: this.$bgURL.value,
        gridsnappingon: this.$gridSnappingOn.checked,
        gridsnappingstep: this.$gridSnappingStep.value,
        showrulers: this.$showRulers.checked,
        baseunit: this.$baseUnit.value
      }});
      this.dispatchEvent(closeEvent);
    };
    // Set up editor background functionality
    const currentObj = this;
    this.colorBlocks.forEach(function (e) {
      const newdiv = document.createElement('div');
      if (e === 'chessboard') {
        newdiv.dataset.bgColor = e;
        // eslint-disable-next-line max-len
        newdiv.style.backgroundImage = 'url(data:image/gif;base64,R0lGODlhEAAQAIAAAP///9bW1iH5BAAAAAAALAAAAAAQABAAAAIfjG+gq4jM3IFLJgpswNly/XkcBpIiVaInlLJr9FZWAQA7)';
        newdiv.classList.add('color_block');
      } else {
        newdiv.dataset.bgColor = e; // setAttribute('data-bgcolor', e);
        newdiv.style.backgroundColor = e;
        newdiv.classList.add('color_block');
      }
      currentObj.$bgBlocks.append(newdiv);
    });
    const blocks = this.$bgBlocks.querySelectorAll('div');
    const curBg = 'cur_background';
    blocks.forEach(function (blk) {
      blk.addEventListener('click', function () {
        blocks.forEach((el) => el.classList.remove(curBg));
        blk.classList.add(curBg);
      });
    });
    this.$saveBtn.addEventListener('click', onSaveHandler);
    this.$cancelBtn.addEventListener('click', onCancelHandler);
    this.$dialog.addEventListener('close', onCancelHandler);
  }
}

// Register
customElements.define('se-edit-prefs-dialog', SeEditPrefsDialog);
