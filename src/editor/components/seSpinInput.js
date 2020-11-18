/* eslint-disable node/no-unpublished-import */
import NumberSpinBox from 'elix/define/NumberSpinBox.js';
import {defaultState} from 'elix/src/base/internal.js';
import {templateFrom, fragmentFrom} from 'elix/src/core/htmlLiterals.js';
import {internal} from 'elix';

/**
 * @class SeSpinInput
 */
class SeSpinInput extends NumberSpinBox {
  /**
    * @function get
    * @returns {PlainObject}
  */
  get [defaultState] () {
    return Object.assign(super[defaultState], {
      label: '',
      src: '',
      inputsize: '100%',
      value: '',
      min: 1,
      step: 1
    });
  }

  /**
    * @function get
    * @returns {PlainObject}
  */
  get [internal.template] () {
    const result = super[internal.template];
    result.content.prepend(fragmentFrom.html`
      <label>
        <span class="icon_label">
          <img src="./images/logo.svg" alt="icon" width="18" height="18" />
        </span>
      </label>`.cloneNode(true));
    // change the style so it fits in our toolbar
    result.content.append(
      templateFrom.html`
        <style>
        :host {
          float:left;
          line-height: normal;
          margin-top: 5px;
          height: 23px;
        }
        #stroke_width {
          margin-top: 0px;
        }
        [part~="source"] {
          grid-template-columns: 20px 1fr auto;
          margin-top: 4px;
        }
        ::slotted(*) {
          padding: 4px;
          background: #E8E8E8;
          border: 1px solid #B0B0B0;
          margin: 0 0 -1px 0;
          line-height: 16px;
        }
        .icon_label {
          float: left;
          padding-top: 3px;
          padding-right: 3px;
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
          height: 0;
        }
        </style>
      `.content
    );
    return result;
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['value', 'class', 'inputsize', 'label', 'src', 'min', 'max', 'step'];
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
    console.log({this: this, name, oldValue, newValue});
    switch (name) {
    case 'label':
      this.label = newValue;
      break;
    case 'src':
      this.src = newValue;
      break;
    case 'inputsize':
      this.inputsize = newValue;
      break;
    default:
      super.attributeChangedCallback(name, oldValue, newValue);
      break;
    }
  }
  /**
    * @function [internal.render]
    * @param {PlainObject} changed
    * @returns {void}
    */
  [internal.render] (changed) {
    super[internal.render](changed);
    if (this[internal.firstRender]) {
      this.$input = this.shadowRoot.getElementById('input');
      this.$label = this.shadowRoot.querySelector('label');
      this.$img = this.shadowRoot.querySelector('img');
      this.$span = this.shadowRoot.querySelector('span');
      this.$event = new CustomEvent('change');
      this.addEventListener('change', (e) => {
        e.preventDefault();
        this.value = e.target.value;
      });
    }
    if (changed.inputsize) {
      this.$input.shadowRoot.querySelector('[part~="input"]').style.width = this[internal.state].inputsize;
    }
    // TODO: label alignment issue problem. now hide label
    this.$label.style.display = 'none';
    if (changed.src) {
      if (this[internal.state].src !== '') {
        this.$img.src = this[internal.state].src;
        this.$img.style.display = 'block';
      }
    }
    if (changed.label) {
      if (this[internal.state].label !== '') {
        this.$span.prepend(this[internal.state].label);
        this.$img.style.display = 'none';
      }
    }
    if (changed.value) {
      this.dispatchEvent(this.$event);
    }
  }
  /**
   * @function inputsize
   * @returns {string} inputsize
   */
  get inputsize () {
    return this[internal.state].inputsize;
  }
  /**
   * @function inputsize
   * @returns {void}
   */
  set inputsize (inputsize) {
    this[internal.setState]({inputsize});
  }
  /**
   * @function src
   * @returns {string} src
   */
  get src () {
    return this[internal.state].src;
  }
  /**
   * @function src
   * @returns {void}
   */
  set src (src) {
    this[internal.setState]({src});
  }
  /**
   * @function label
   * @returns {string} label
   */
  get label () {
    return this[internal.state].label;
  }
  /**
   * @function label
   * @returns {void}
   */
  set label (label) {
    this[internal.setState]({label});
  }
}

// Register
customElements.define('se-spin-input', SeSpinInput);
