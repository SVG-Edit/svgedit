/* globals jQuery */
import jQueryPluginJGraduate from '../jgraduate/jQuery.jGraduate.js';
import jQueryPluginJPicker from '../jgraduate/jQuery.jPicker.js';
import PaintBox from './PaintBox.js';

const $ = [
  jQueryPluginJGraduate,
  jQueryPluginJPicker
].reduce((jq, func) => func(jq), jQuery);

const template = document.createElement('template');
template.innerHTML = `
  <style>
  </style>
  <div id="picker">
      <img src="./images/logo.svg" alt="icon">
      <label for="color" title="Change xxx color"></label>
      <div class="block">
          <div id="bg"></div>
          <div id="color" class="block"></div>
      </div>
  </div>
  <!-- hidden div -->
  <div id="color_picker"></div>
`;
/**
 * @class SeMenuItem
 */
export class SeColorPicker extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$img = this._shadowRoot.querySelector('img');
    this.$label = this._shadowRoot.querySelector('label');
    this.$picker = this._shadowRoot.getElementById('picker');
    this.paintBox = null;
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'src', 'value', 'picker'];
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
    case 'src':
      this.$img.setAttribute('src', newValue);
      break;
    case 'label':
      this.$label.setAttribute('title', newValue);
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
  get src () {
    return this.getAttribute('src');
  }

  /**
   * @function set
   * @returns {void}
   */
  set src (value) {
    this.setAttribute('src', value);
  }

  /**
   * @param {PlainObject} selectedElement
   * @param {bool} apply
   * @returns {void}
   */
  update (selectedElement, apply) {
    this.paintBox.update(selectedElement, apply);
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.paintBox = new PaintBox(this, this.type);
    let {paint} = this.paintBox;
    $('#color_picker')
      .draggable({
        cancel: '.jGraduate_tabs, .jGraduate_colPick, .jGraduate_gradPick, .jPicker',
        containment: 'window'
      })
      .jGraduate(
        {
          images: {clientPath: './jgraduate/images/'},
          paint,
          window: {pickerTitle: this.label},
          // images: {clientPath: configObj.curConfig.imgPath},
          newstop: 'inverse'
        },
        function (p) {
          paint = new $.jGraduate.Paint(p);
          this.paintBox.setPaint(paint);
          this.svgCanvas.setPaint(this.picker, paint);
          $('#color_picker').hide();
        },
        () => {
          $('#color_picker').hide();
        }
      );
  }
}

// Register
customElements.define('se-colorpicker', SeColorPicker);
