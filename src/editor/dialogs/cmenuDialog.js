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
  <ul id="cmenu_canvas" class="contextMenu">
    <li>
      <a href="#cut" id="se-cut">
        <span class="shortcut">META+X</span>
      </a>
    </li>
    <li>
      <a href="#copy" id="se-copy">
        <span class="shortcut">META+C</span>
      </a>
    </li>
    <li>
      <a href="#paste" id="se-paste"></a>
    </li>
    <li>
      <a href="#paste_in_place" id="se-paste-in-place"></a>
    </li>
    <li class="separator">
      <a href="#delete" id="se-delete">
        <span class="shortcut">BACKSPACE</span>
      </a>
    </li>
    <li class="separator">
      <a href="#group" id="se-group">
        <span class="shortcut">G</span>
      </a>
    </li>
    <li>
      <a href="#ungroup" id="se-ungroup">
        <span class="shortcut">G</span>
      </a>
    </li>
    <li class="separator">
      <a href="#move_front" id="se-move-front">
        <span class="shortcut">CTRL+SHFT+]</span>
      </a>
    </li>
    <li>
      <a href="#move_up" id="se-move-up">
        <span class="shortcut">CTRL+]</span>
      </a>
    </li>
    <li>
      <a href="#move_down" id="se-move-down">
        <span class="shortcut">CTRL+[</span>
      </a>
    </li>
    <li>
      <a href="#move_back" id="se-move-back">
        <span class="shortcut">CTRL+SHFT+[</span>
      </a>
    </li> 
  </ul>
`;
/**
 * @class SeCMenuDialog
 */
export class SeCMenuDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    this._workarea = document.getElementById('workarea');
    this.$dialog = this._shadowRoot.querySelector('#cmenu_canvas');
    this.$copyLink = this._shadowRoot.querySelector('#se-copy');
    this.$cutLink = this._shadowRoot.querySelector('#se-cut');
    this.$pasteLink = this._shadowRoot.querySelector('#se-paste');
    this.$pasteInPlaceLink = this._shadowRoot.querySelector('#se-paste-in-place');
    this.$deleteLink = this._shadowRoot.querySelector('#se-delete');
    this.$groupLink = this._shadowRoot.querySelector('#se-group');
    this.$ungroupLink = this._shadowRoot.querySelector('#se-ungroup');
    this.$moveFrontLink = this._shadowRoot.querySelector('#se-move-front');
    this.$moveUpLink = this._shadowRoot.querySelector('#se-move-up');
    this.$moveDownLink = this._shadowRoot.querySelector('#se-move-down');
    this.$moveBackLink = this._shadowRoot.querySelector('#se-move-back');
  }
  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('tools-cut', i18next.t('tools.cut'));
    this.setAttribute('tools-copy', i18next.t('tools.copy'));
    this.setAttribute('tools-paste', i18next.t('tools.paste'));
    this.setAttribute('tools-paste_in_place', i18next.t('tools.paste_in_place'));
    this.setAttribute('tools-delete', i18next.t('tools.delete'));
    this.setAttribute('tools-group', i18next.t('tools.group'));
    this.setAttribute('tools-ungroup', i18next.t('tools.ungroup'));
    this.setAttribute('tools-move_front', i18next.t('tools.move_front'));
    this.setAttribute('tools-move_up', i18next.t('tools.move_up'));
    this.setAttribute('tools-move_down', i18next.t('tools.move_down'));
    this.setAttribute('tools-move_back', i18next.t('tools.move_back'));
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'disableallmenu', 'enablemenuitems', 'disablemenuitems', 'tools-cut',
      'tools-copy', 'tools-paste', 'tools-paste_in_place', 'tools-delete', 'tools-group',
      'tools-ungroup', 'tools-move_front', 'tools-move_up', 'tools-move_down',
      'tools-move_back' ];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let eles = [];
    let textnode;
    const sdowRoot = this._shadowRoot;
    switch (name) {
    case 'disableallmenu':
      if (newValue === 'true') {
        const elesli = sdowRoot.querySelectorAll('li');
        elesli.forEach(function (eleli) {
          eleli.classList.add('disabled');
        });
      }
      break;
    case 'enablemenuitems':
      eles = newValue.split(',');
      eles.forEach(function (ele) {
        const selEle = sdowRoot.querySelector('a[href*="' + ele + '"]');
        selEle.parentElement.classList.remove('disabled');
      });
      break;
    case 'disablemenuitems':
      eles = newValue.split(',');
      eles.forEach(function (ele) {
        const selEle = sdowRoot.querySelector('a[href*="' + ele + '"]');
        selEle.parentElement.classList.add('disabled');
      });
      break;
    case 'tools-cut':
      textnode = document.createTextNode(newValue);
      this.$cutLink.prepend(textnode);
      break;
    case 'tools-copy':
      textnode = document.createTextNode(newValue);
      this.$copyLink.prepend(textnode);
      break;
    case 'tools-paste':
      this.$pasteLink.textContent = newValue;
      break;
    case 'tools-paste_in_place':
      this.$pasteInPlaceLink.textContent = newValue;
      break;
    case 'tools-delete':
      textnode = document.createTextNode(newValue);
      this.$deleteLink.prepend(textnode);
      break;
    case 'tools-group':
      textnode = document.createTextNode(newValue);
      this.$groupLink.prepend(textnode);
      break;
    case 'tools-ungroup':
      textnode = document.createTextNode(newValue);
      this.$ungroupLink.prepend(textnode);
      break;
    case 'tools-move_front':
      textnode = document.createTextNode(newValue);
      this.$moveFrontLink.prepend(textnode);
      break;
    case 'tools-move_up':
      textnode = document.createTextNode(newValue);
      this.$moveUpLink.prepend(textnode);
      break;
    case 'tools-move_down':
      textnode = document.createTextNode(newValue);
      this.$moveDownLink.prepend(textnode);
      break;
    case 'tools-move_back':
      textnode = document.createTextNode(newValue);
      this.$moveBackLink.prepend(textnode);
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
  get disableallmenu () {
    return this.getAttribute('disableallmenu');
  }

  /**
   * @function set
   * @returns {void}
   */
  set disableallmenu (value) {
    this.setAttribute('disableallmenu', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get enablemenuitems () {
    return this.getAttribute('enablemenuitems');
  }

  /**
   * @function set
   * @returns {void}
   */
  set enablemenuitems (value) {
    this.setAttribute('enablemenuitems', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get disablemenuitems () {
    return this.getAttribute('disablemenuitems');
  }

  /**
   * @function set
   * @returns {void}
   */
  set disablemenuitems (value) {
    this.setAttribute('disablemenuitems', value);
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const current = this;
    const onMenuOpenHandler = (e) => {
      e.preventDefault();
      // Detect mouse position
      let x = e.pageX;
      let y = e.pageY;

      const xOff = screen.width - 250; // menu width
      const yOff = screen.height - (276 + 150); // menu height + bottom panel height and scroll bar

      if (x > xOff) {
        x = xOff;
      }
      if (y > yOff) {
        y = yOff;
      }
      current.$dialog.style.top = y + 'px';
      current.$dialog.style.left = x + 'px';
      current.$dialog.style.display = 'block';
    };
    const onMenuCloseHandler = (e) => {
      if (e.button !== 2) {
        current.$dialog.style.display = 'none';
      }
    };
    const onMenuClickHandler = (e, action) => {
      const triggerEvent = new CustomEvent('change', { detail: {
        trigger: action
      } });
      this.dispatchEvent(triggerEvent);
    };
    this._workarea.addEventListener('contextmenu', onMenuOpenHandler);
    this._workarea.addEventListener('mousedown', onMenuCloseHandler);
    this.$cutLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'cut'));
    this.$copyLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'copy'));
    this.$pasteLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'paste'));
    this.$pasteInPlaceLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'paste_in_place'));
    this.$deleteLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'delete'));
    this.$groupLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'group'));
    this.$ungroupLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'ungroup'));
    this.$moveFrontLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'move_front'));
    this.$moveUpLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'move_up'));
    this.$moveDownLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'move_down'));
    this.$moveBackLink.addEventListener('click', (evt) => onMenuClickHandler(evt, 'move_back'));
  }
}

// Register
customElements.define('se-cmenu_canvas-dialog', SeCMenuDialog);
