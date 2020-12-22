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
      <a href="#cut">
        Cut<span class="shortcut">META+X</span>
      </a>
    </li>
    <li>
      <a href="#copy" id="se-copy">
        Copy<span class="shortcut">META+C</span>
      </a>
    </li>
    <li>
      <a href="#paste">Paste</a>
    </li>
    <li>
      <a href="#paste_in_place">Paste in Place</a>
    </li>
    <li class="separator">
      <a href="#delete">
        Delete<span class="shortcut">BACKSPACE</span>
      </a>
    </li>
    <li class="separator">
      <a href="#group">
        Group<span class="shortcut">G</span>
      </a>
    </li>
    <li>
      <a href="#ungroup">
        Ungroup<span class="shortcut">G</span>
      </a>
    </li>
    <li class="separator">
      <a href="#move_front">
        Bring to Front<span class="shortcut">CTRL+SHFT+]</span>
      </a>
    </li>
    <li>
      <a href="#move_up">
        Bring Forward<span class="shortcut">CTRL+]</span>
      </a>
    </li>
    <li>
      <a href="#move_down">
        Send Backward<span class="shortcut">CTRL+[</span>
      </a>
    </li>
    <li>
      <a href="#move_back">
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
    this._svgEditor = document.getElementById('svg_editor');
    this.$dialog = this._shadowRoot.querySelector('#cmenu_canvas');
    this.$copyLink = this._shadowRoot.querySelector('#se-copy');
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
    if (oldValue === newValue) return;
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
      super.attributeChangedCallback(name, oldValue, newValue);
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
      current.$dialog.style.top = e.pageY + 'px';
      current.$dialog.style.left = e.pageX + 'px';
      current.$dialog.style.display = 'block';
      e.preventDefault();
    };
    const onCopyClickHandler = (e) => {
      console.log('came');
    };
    this._workarea.addEventListener('contextmenu', onMenuOpenHandler, false);
    this.$copyLink.addEventListener('click', onCopyClickHandler);
  }
}

// Register
customElements.define('se-cmenu_canvas-dialog', SeCMenuDialog);
