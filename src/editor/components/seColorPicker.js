/* globals jQuery */
import jQueryPluginJGraduate from './jgraduate/jQuery.jGraduate.js';
import jQueryPluginJPicker from './jgraduate/jQuery.jPicker.js';
import PaintBox from './PaintBox.js';

const $ = [
  jQueryPluginJGraduate,
  jQueryPluginJPicker
].reduce((jq, func) => func(jq), jQuery);

const template = document.createElement('template');
template.innerHTML = `
  <style>
  @import "./components/jgraduate/css/jGraduate.css";
  @import "./components/jgraduate/css/jPicker.css";
  #logo {
    height: 22px;
    width: 22px;
  }
  #block {
    height: 22px;
    width: 22px;
    float: right;
    background-color: darkgrey;
  }
  #picker {
    background: #f0f0f0;
    height: 26px;
    line-height: 26px;
    border-radius: 3px;
    width: 52px;
    display: flex;
    align-items: center;
    margin-right: 4px;
    justify-content: space-evenly;
  }
  #color_picker {
    position: absolute;
    bottom: 40px;
  }
  </style>
  <div id="picker">
      <img src="./images/logo.svg" alt="icon" id="logo">
      <label for="color" title="Change xxx color" id="label"></label>
      <div id="block">
      </div>
  </div>
  <!-- hidden div -->
  <div id="color_picker"></div>
`;
/**
 * @class SeColorPicker
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
    this.$logo = this._shadowRoot.getElementById('logo');
    this.$label = this._shadowRoot.getElementById('label');
    this.$block = this._shadowRoot.getElementById('block');
    this.paintBox = null;
    this.$picker = this._shadowRoot.getElementById('picker');
    this.$color_picker = this._shadowRoot.getElementById('color_picker');
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'src', 'type'];
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
      this.$logo.setAttribute('src', newValue);
      break;
    case 'label':
      this.setAttribute('title', newValue);
      break;
    case 'type':
      this.$label.setAttribute('title', `Pick a ${newValue} Paint and Opacity`);
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
    return this.$label.getAttribute('title');
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
  get type () {
    return this.getAttribute('type');
  }

  /**
   * @function set
   * @returns {void}
   */
  set type (value) {
    this.setAttribute('type', value);
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
   * @param {PlainObject} svgCanvas
   * @param {PlainObject} selectedElement
   * @param {bool} apply
   * @returns {void}
   */
  update (svgCanvas, selectedElement, apply) {
    const paint = this.paintBox.update(svgCanvas, selectedElement);
    if (paint && apply) {
      const changeEvent = new CustomEvent('change', {detail: {
        paint
      }});
      this.dispatchEvent(changeEvent);
    }
  }
  /**
   * @param {PlainObject} paint
   * @returns {void}
   */
  setPaint (paint) {
    this.paintBox.setPaint(paint);
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.paintBox = new PaintBox(this.$block, this.type);
    let {paint} = this.paintBox;
    $(this.$picker).click(() => {
      $(this.$color_picker)
        .draggable({
          cancel: '.jGraduate_tabs, .jGraduate_colPick, .jGraduate_gradPick, .jPicker',
          containment: 'window'
        })
        .jGraduate(
          {
            images: {clientPath: './components/jgraduate/images/'},
            paint,
            window: {pickerTitle: this.label},
            newstop: 'inverse'
          },
          (p) => {
            paint = new $.jGraduate.Paint(p);
            this.setPaint(paint);
            const changeEvent = new CustomEvent('change', {detail: {
              paint
            }});
            this.dispatchEvent(changeEvent);
            $('#color_picker').hide();
          },
          () => {
            $('#color_picker').hide();
          }
        );
    });
  }
}

// Register
customElements.define('se-colorpicker', SeColorPicker);
