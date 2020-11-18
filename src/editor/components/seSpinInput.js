/* eslint-disable node/no-unpublished-import */
import NumberSpinBox from 'elix/define/NumberSpinBox.js';
import {defaultState} from 'elix/src/base/internal.js';
import {templateFrom} from 'elix/src/core/htmlLiterals.js';
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
    return ['value', 'min', 'max', 'step'];
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
      this.$event = new CustomEvent('change');
      this.addEventListener('change', (e) => {
        e.preventDefault();
        this.value = e.target.value;
      });
    }
    if (changed.value) {
      this.dispatchEvent(this.$event);
    }
  }
}

// Register
customElements.define('se-spin-input', SeSpinInput);
