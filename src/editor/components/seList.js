import 'elix/define/DropdownList.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
elix-dropdown-list {
  margin: 1px;
}

elix-dropdown-list:hover {
  background-color: var(--icon-bg-color-hover);
}

::part(popup-toggle) {
  display: none;
}
::slotted(*) {
  padding:0;
  width:100%;
}
</style>
  <label>Label</label>
  <elix-dropdown-list>
    <slot></slot>
  </elix-dropdown-list>

`;
/**
 * @class SeList
 */
export class SeList extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$dropdown = this._shadowRoot.querySelector('elix-dropdown-list');
    this.$label = this._shadowRoot.querySelector('label');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return [ 'label', 'width', 'height' ];
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
    case 'label':
      this.$label.textContent = newValue;
      break;
    case 'height':
      this.$dropdown.style.height = newValue;
      break;
    case 'width':
      this.$dropdown.style.width = newValue;
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`unknown attribute: ${name}`);
      break;
    }
  }
  /**
   * @function get
   * @returns {any}
   */
  get label () {
    return this.getAttribute('label');
  }

  /**
   * @function set
   * @returns {void}
   */
  set label (value) {
    this.setAttribute('label', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get width () {
    return this.getAttribute('width');
  }

  /**
   * @function set
   * @returns {void}
   */
  set width (value) {
    this.setAttribute('width', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get height () {
    return this.getAttribute('height');
  }

  /**
   * @function set
   * @returns {void}
   */
  set height (value) {
    this.setAttribute('height', value);
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const currentObj = this;
    this.$dropdown.addEventListener('selectedindexchange', (e) => {
      if (e?.detail?.selectedIndex !== undefined) {
        const value = this.$dropdown.selectedItem.getAttribute('value');
        const closeEvent = new CustomEvent('change', { detail: { value } });
        currentObj.dispatchEvent(closeEvent);
        currentObj.value = value;
      }
    });
    this.$dropdown.addEventListener('close', (_e) => {
      /** @todo: with Chrome, selectedindexchange does not fire consistently
      * unless you forec change in this close event
      */
      this.$dropdown.selectedIndex = this.$dropdown.currentIndex;
    });
  }
}

// Register
customElements.define('se-list', SeList);
