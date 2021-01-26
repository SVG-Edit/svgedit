const template = document.createElement('template');
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

  .contextMenu li:hover a {
    background-color: #2e5dea;
    color: white;
    cursor: default;
  }

  .contextMenu li.disabled a {
    color: #999;
  }

  .contextMenu li:hover.disabled a {
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
        Cut<span class="shortcut">META+X</span>
      </a>
    </li>
    <li>
      <a href="#copy" id="se-copy">
        Copy<span class="shortcut">META+C</span>
      </a>
    </li>
    <li>
      <a href="#paste" id="se-paste">Paste</a>
    </li>
    <li>
      <a href="#paste_in_place" id="se-paste-in-place">Paste in Place</a>
    </li>
    <li class="separator">
      <a href="#delete" id="se-delete">
        Delete<span class="shortcut">BACKSPACE</span>
      </a>
    </li>
    <li class="separator">
      <a href="#group" id="se-group">
        Group<span class="shortcut">G</span>
      </a>
    </li>
    <li>
      <a href="#ungroup" id="se-ungroup">
        Ungroup<span class="shortcut">G</span>
      </a>
    </li>
    <li class="separator">
      <a href="#move_front" id="se-move-front">
        Bring to Front<span class="shortcut">CTRL+SHFT+]</span>
      </a>
    </li>
    <li>
      <a href="#move_up" id="se-move-up">
        Bring Forward<span class="shortcut">CTRL+]</span>
      </a>
    </li>
    <li>
      <a href="#move_down" id="se-move-down">
        Send Backward<span class="shortcut">CTRL+[</span>
      </a>
    </li>
    <li>
      <a href="#move_back" id="se-move-back">
        Send to Back<span class="shortcut">CTRL+SHFT+[</span>
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
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
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
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['disableallmenu', 'enablemenuitems', 'disablemenuitems'];
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
      current.$dialog.style.top = e.pageY + 'px';
      current.$dialog.style.left = e.pageX + 'px';
      current.$dialog.style.display = 'block';
    };

    const onMenuCloseHandler = (e) => {
      if (e.button !== 2) {
        current.$dialog.style.display = 'none';
      }
    };

    const onMenuClickHandler = (e, action) => {
      let listItem = e.target;
      if (listItem.tagName !== 'LI') listItem = listItem.parentNode;
      if (listItem.tagName !== 'LI') listItem = listItem.parentNode;

      if (!listItem.classList.contains('disabled')) {
        const triggerEvent = new CustomEvent('change', {detail: {
          trigger: action
        }});
        onMenuCloseHandler(e);
        this.dispatchEvent(triggerEvent);
      }
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
