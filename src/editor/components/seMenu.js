/* eslint-disable node/no-unpublished-import */
import 'elix/define/MenuButton.js';
import 'elix/define/MenuItem.js';


const template = document.createElement('template');
template.innerHTML = `
  <style>
  :host {
    padding: 0px;
  }
  </style>
  
  <elix-menu-button id="sampleMenuButton" aria-label="Sample Menu">
    welcome
    <slot></slot>
  </elix-menu-button>
  
`;
/**
 * @class SeMenu
 */
export class SeMenu extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$menu = this._shadowRoot.querySelector('elix-menu-button');
    console.log(this.$menu);
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    console.log("connectedCallback");
    this.$menu.addEventListener('openedchange', (e) => {
      e.preventDefault();
      console.log("came");
    });
    //this.dispatchEvent(this.$event);
  }
}

// Register
customElements.define('se-menu', SeMenu);
