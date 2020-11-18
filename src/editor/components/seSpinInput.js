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
      <label style="display:none;">
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
    return ['value', 'class', 'label', 'src', 'min', 'max', 'step'];
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
    if (changed.src) {
      if (this[internal.state].src !== '') {
        this.$img.src = this[internal.state].src;
        this.$img.style.display = 'block';
        this.$label.style.display = 'block';
      }
    }
    if (changed.label) {
      if (this[internal.state].label !== '') {
        this.$span.prepend(this[internal.state].label);
        this.$img.style.display = 'none';
        this.$label.style.display = 'block';
      }
    }
    if (changed.value) {
      this.dispatchEvent(this.$event);
    }
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
