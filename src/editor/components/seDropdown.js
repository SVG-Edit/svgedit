/* eslint-disable node/no-unpublished-import */
import ListComboBox from 'elix/define/ListComboBox.js';
import NumberSpinBox from 'elix/define/NumberSpinBox.js';
import {defaultState, template} from 'elix/src/base/internal.js';
import {templateFrom} from 'elix/src/core/htmlLiterals.js';

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
      inputPartType: NumberSpinBox
    });
  }
  /**
    * @function get
    * @returns {PlainObject}
  */
  get [template] () {
    const result = super[template];
    result.content.append(
      templateFrom.html`
        <style>
        ::part(input) {
          width: 30px;
        }
        </style>
      `.content
    );
    return result;
  }
}

customElements.define('custom-combo', CustomCombo);

const mytemplate = document.createElement('template');
mytemplate.innerHTML = `
  <style>
  .toolset {
    float: left;
    margin-top: 4px;
  }
  .icon {
    top: 4px;
    position: relative;
    }
  ::slotted(*) {
    padding: 4px;
    background: #E8E8E8;
    border: 1px solid #B0B0B0;
    margin: 0 0 -1px 0;
    line-height: 16px;
  }
  custom-combo::part(popup) {
    width: 180px;
  }
  </style>
  <span class="toolset" title="title">
    <img  class="icon" src="./images/logo.svg" alt="icon" width="18" height="18">
    <custom-combo>
      <slot></slot>
    </custom-combo>
  </span>
`;
/**
 * @class Dropdown
 */
export class Dropdown extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(mytemplate.content.cloneNode(true));
    this.$dropdown = this._shadowRoot.querySelector('custom-combo');
    this.$img = this._shadowRoot.querySelector('img');
    this.$span = this._shadowRoot.querySelector('span');
    // we retrieve all elements added in the slot (i.e. se-buttons)
    // this.$elements = this.$menu.lastElementChild.assignedElements();
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
      {
        const shortcut = this.getAttribute('shortcut');
        this.$span.setAttribute('title', `${newValue} ${shortcut ? `[${shortcut}]` : ''}`);
      }
      break;
    case 'src':
      this.$img.setAttribute('src', newValue);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`unknown attribute: ${name}`);
      break;
    }
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.$dropdown.addEventListener('selectedindexchange', (e) => {
      console.log(e.detail);
      console.log(this.children[e.detail.selectedIndex].getAttribute('value'));
      console.log(this);
    });
    this.$dropdown.addEventListener('input', (e) => {
      console.log(e.detail);
      console.log(this.children[e.detail.selectedIndex].getAttribute('value'));
      console.log(this);
    });
  }
}

// Register
customElements.define('se-dropdown', Dropdown);
