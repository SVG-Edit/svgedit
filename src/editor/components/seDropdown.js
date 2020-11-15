/* eslint-disable node/no-unpublished-import */
import ListComboBox from 'elix/define/ListComboBox.js';
import NumberSpinBox from 'elix/define/NumberSpinBox.js';
import {defaultState} from 'elix/src/base/internal.js';
import {templateFrom, fragmentFrom} from 'elix/src/core/htmlLiterals.js';
import {internal} from 'elix';

/**
 * @class CustomCombo
 */
class CustomCombo extends ListComboBox {
  /**
    * @function get
    * @returns {PlainObject}
    */
  get [defaultState] () {
    return Object.assign(super[defaultState], {
      inputPartType: NumberSpinBox,
      src: './imags.logo.svg'
    });
  }
  /**
    * @function get
    * @returns {PlainObject}
  */
  get [internal.template] () {
    const result = super[internal.template];
    const source = result.content.getElementById('source');
    source.prepend(fragmentFrom.html`
      <img src="./images/logo.svg" alt="icon" width="18" height="18">
      </img>
      `.cloneNode(true));
    result.content.append(
      templateFrom.html`
        <style>
        :host {
          float:left;
        }
        ::part(input) {
          width: 40px;
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
        [part~="popup"] {
          width: 180px;
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
    return ['title', 'src'];
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
    case 'title':
      console.log({this: this, name, oldValue, newValue});
      // this.$span.setAttribute('title', `${newValue} ${shortcut ? `[${shortcut}]` : ''}`);
      break;
    case 'src':
      console.log({name, oldValue, newValue});
      this.src = newValue;
      break;
    default:
      super.attributeChangedCallback(name, oldValue, newValue);
      break;
    }
  }
  /**
  * @function connectedCallback
  * @returns {void}
  */
  connectedCallback () {
    super.connectedCallback();
    this.addEventListener('selectedindexchange', (e) => {
      console.log(e.detail);
      console.log(this.children[e.detail.selectedIndex].getAttribute('value'));
      console.log(this);
    });
    this.addEventListener('input', (e) => {
      console.log(e.detail);
      console.log(this.children[e.detail.selectedIndex].getAttribute('value'));
      console.log(this);
    });
  }
  /**
    * @function [internal.render]
    * @param {PlainObject} changed
    * @returns {void}
    */
  [internal.render] (changed) {
    super[internal.render](changed);
    console.log(this, changed, this[internal.firstRender], changed.src);
    if (this[internal.firstRender]) {
      this.$img = this.shadowRoot.querySelector('img');
    }
    if (changed.src) {
      this.$img.setAttribute('src', this[internal.state].src);
    }
  }
  get src () {
    return this[internal.state].src;
  }
  set src (src) {
    this[internal.setState]({src});
  }
}

// Register
customElements.define('se-dropdown', CustomCombo);
