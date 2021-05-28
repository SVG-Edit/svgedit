const template = document.createElement('template');
// eslint-disable-next-line no-unsanitized/property
template.innerHTML = `
  <style>
  .contextMenu {
    position: absolute;
    z-index: 99999;
    border: solid 1px rgba(0,0,0,.33);
    background: rgba(255,255,255,.95);
    padding: 5px 0;
    margin: 0px;
    display: none;
    font: 12px/15px Lucida Sans, Helvetica, Verdana, sans-serif;
    border-radius: 5px;
    -moz-border-radius: 5px;
    -moz-box-shadow: 2px 5px 10px rgba(0,0,0,.3);
    -webkit-box-shadow: 2px 5px 10px rgba(0,0,0,.3);
    box-shadow: 2px 5px 10px rgba(0,0,0,.3);
  }
  
  .contextMenu li {
    list-style: none;
    padding: 0px;
    margin: 0px;
  }
  
  .contextMenu .shortcut {
    width: 115px;
    text-align:right;
    float:right;
  }
  
  .contextMenu a {
    -moz-user-select: none;
    -webkit-user-select: none;
    color: #222;
    text-decoration: none;
    display: block;
    line-height: 20px;
    height: 20px;
    background-position: 6px center;
    background-repeat: no-repeat;
    outline: none;
    padding: 0px 15px 1px 20px;
  }
  
  .contextMenu li.hover a {
    background-color: #2e5dea;
    color: white;
    cursor: default;
  }
  
  .contextMenu li.disabled a {
    color: #999;
  }
  
  .contextMenu li.hover.disabled a {
    background-color: transparent;
  }
  
  .contextMenu li.separator {
    border-top: solid 1px #E3E3E3;
    padding-top: 5px;
    margin-top: 5px;
  }  
  </style>
  <ul id="cmenu_layers" class="contextMenu">
    <li><a href="#dupe" id="se-dupe">#{svgEditor.i18next.t('layers.dupe')}</a></li>
    <li><a href="#delete" id="se-layer-delete">#{svgEditor.i18next.t('layers.del')}</a></li>
    <li><a href="#merge_down" id="se-merge-down">#{svgEditor.i18next.t('layers.merge_down')}</a></li>
    <li><a href="#merge_all" id="se-merge-all">#{svgEditor.i18next.t('layers.merge_all')}</a></li>
  </ul>
`;
/**
 * @class SeCMenuLayerDialog
 */
export class SeCMenuLayerDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    this.source = '';
    this._workarea = undefined;
    this.$sidePanels = document.getElementById('sidepanels');
    this.$dialog = this._shadowRoot.querySelector('#cmenu_layers');
    this.$duplicateLink = this._shadowRoot.querySelector('#se-dupe');
    this.$deleteLink = this._shadowRoot.querySelector('#se-layer-delete');
    this.$mergeDownLink = this._shadowRoot.querySelector('#se-merge-down');
    this.$mergeAllLink = this._shadowRoot.querySelector('#se-merge-all');
  }
  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('layers-dupe', i18next.t('layers.dupe'));
    this.setAttribute('layers-del', i18next.t('layers.del'));
    this.setAttribute('layers-merge_down', i18next.t('layers.merge_down'));
    this.setAttribute('layers-merge_all', i18next.t('layers.merge_all'));
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'value', 'leftclick', 'layers-dupe', 'layers-del', 'layers-merge_down', 'layers-merge_all' ];
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
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (name) {
    case 'value':
      this.source = newValue;
      if (newValue !== '' && newValue !== undefined) {
        this._workarea = document.getElementById(this.source);
      }
      break;
    case 'layers-dupe':
      this.$duplicateLink.textContent = newValue;
      break;
    case 'layers-del':
      this.$deleteLink.textContent = newValue;
      break;
    case 'layers-merge_down':
      this.$mergeDownLink.textContent = newValue;
      break;
    case 'layers-merge_all':
      this.$mergeAllLink.textContent = newValue;
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
  get value () {
    return this.getAttribute('value');
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.setAttribute('value', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get leftclick () {
    return this.getAttribute('leftclick');
  }

  /**
   * @function set
   * @returns {void}
   */
  set leftclick (value) {
    this.setAttribute('leftclick', value);
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const current = this;
    const onMenuOpenHandler = (e) => {
      e.preventDefault();
      current.$dialog.style.top = e.pageY + 'px';
      current.$dialog.style.left = e.pageX + 'px';
      current.$dialog.style.display = 'block';
    };
    const onMenuCloseHandler = (e) => {
      if (e.button !== 2) {
        current.$dialog.style.display = 'none';
      }
    };
    const onMenuClickHandler = (e, action, id) => {
      const triggerEvent = new CustomEvent('change', { detail: {
        trigger: action,
        source: id
      } });
      this.dispatchEvent(triggerEvent);
      current.$dialog.style.display = 'none';
    };
    if (this._workarea !== undefined) {
      this._workarea.addEventListener('contextmenu', onMenuOpenHandler);
      if (this.getAttribute('leftclick') === 'true') {
        this._workarea.addEventListener('click', onMenuOpenHandler);
      }
      this._workarea.addEventListener('mousedown', onMenuCloseHandler);
      this.$sidePanels.addEventListener('mousedown', onMenuCloseHandler);
    }
    this.$duplicateLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'dupe', this.source));
    this.$deleteLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'delete', this.source));
    this.$mergeDownLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'merge_down', this.source));
    this.$mergeAllLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'merge_all', this.source));
  }
}

// Register
customElements.define('se-cmenu-layers', SeCMenuLayerDialog);
