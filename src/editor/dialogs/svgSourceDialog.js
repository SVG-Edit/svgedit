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
 
  #svg_source_editor #svg_source_container {
    background-color: #B0B0B0;
    opacity: 1.0;
    text-align: center;
    border: 1px outset #777;
    z-index: 6;
  }
  
  #save_output_btns {
    display: none;
    text-align: left;
  }  
  #save_output_btns p {
    margin: .5em 1.5em;
    display: inline-block;
  }
  #svg_source_editor form {
    width: 100%;
  }  
  #svg_source_editor #svg_source_textarea {
    padding: 5px;
    font-size: 12px;
    min-height: 200px;
    width: 95%;
    height: 95%;
  }
  
  #svg_source_editor #tool_source_back {
    text-align: left;
    margin: 5px 10px;
  }  
  </style>
  <elix-dialog id="svg_source_editor" aria-label="SVG Source Editor" closed>
    <div id="svg_source_container">
      <div id="tool_source_back" class="toolbar_button">
        <button id="tool_source_save">
          <img class="svg_icon" src="./images/ok.svg" alt="icon" width="16" height="16" />
          Apply Changes
        </button>
        <button id="tool_source_cancel">
          <img class="svg_icon" src="./images/cancel.svg" alt="icon" width="16" height="16" />
          Cancel
        </button>
      </div>
      <div id="save_output_btns">
        <p id="copy_save_note">
          Copy the contents of this box into a text editor,
          then save the file with a .svg extension.</p>
        <button id="copy_save_done">Done</button>
      </div>
      <form>
        <textarea id="svg_source_textarea" spellcheck="false" rows="5" cols="80"></textarea>
      </form>
    </div>    
  </elix-dialog>  
`;
/**
 * @class SeSvgSourceEditorDialog
 */
export class SeSvgSourceEditorDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$dialog = this._shadowRoot.querySelector('#svg_source_editor');
    this.$copyBtn = this._shadowRoot.querySelector('#copy_save_done');
    this.$saveBtn = this._shadowRoot.querySelector('#tool_source_save');
    this.$cancelBtn = this._shadowRoot.querySelector('#tool_source_cancel');
    this.$sourceTxt = this._shadowRoot.querySelector('#svg_source_textarea');
    this.$copySec = this._shadowRoot.querySelector('#save_output_btns');
    this.$applySec = this._shadowRoot.querySelector('#tool_source_back');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'value', 'applysec', 'copysec'];
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
    switch (name) {
    case 'dialog':
      if (newValue === 'open') {
        this.$sourceTxt.focus();
        this.$dialog.open();
      } else {
        this.$dialog.close();
        this.$sourceTxt.blur();
      }
      break;
    case 'applysec':
      if (newValue === 'false') {
        this.$applySec.style.display = 'none';
      } else {
        this.$applySec.style.display = 'block';
      }
      break;
    case 'copysec':
      if (newValue === 'false') {
        this.$copySec.style.display = 'none';
      } else {
        this.$copySec.style.display = 'block';
      }
      break;
    case 'value':
      this.$sourceTxt.value = newValue;
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
  get applysec () {
    return this.getAttribute('applysec');
  }
  /**
   * @function set
   * @returns {void}
   */
  set applysec (value) {
    this.setAttribute('applysec', value);
  }

  /**
   * @function get
   * @returns {any}
   */
  get copysec () {
    return this.getAttribute('copysec');
  }
  /**
   * @function set
   * @returns {void}
   */
  set copysec (value) {
    this.setAttribute('copysec', value);
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
    const onCopyHandler = () => {
      const closeEvent = new CustomEvent('change', {
        detail: {
          copy: 'click',
          value: this.$sourceTxt.value
        }
      });
      this.dispatchEvent(closeEvent);
    };
    const onSaveHandler = () => {
      const closeEvent = new CustomEvent('change', {detail: {
        value: this.$sourceTxt.value,
        dialog: 'close'
      }});
      this.dispatchEvent(closeEvent);
    };
    this.$copyBtn.addEventListener('click', onCopyHandler);
    this.$saveBtn.addEventListener('click', onSaveHandler);
    this.$cancelBtn.addEventListener('click', onCancelHandler);
    this.$dialog.addEventListener('close', onCancelHandler);
  }
}

// Register
customElements.define('se-svg-source-editor-dialog', SeSvgSourceEditorDialog);
