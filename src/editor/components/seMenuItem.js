/* eslint-disable node/no-unpublished-import */
import 'elix/define/Menu.js';
import 'elix/define/MenuItem.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  </style>
  
  <elix-menu-item>New</elix-menu-item>
  
`;
/**
 * @class SeMenuItem
 */
export class SeMenuItem extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    // this.$menu = this._shadowRoot.querySelector('elix-menu');
  }
}

// Register
customElements.define('se-menu-item', SeMenuItem);
