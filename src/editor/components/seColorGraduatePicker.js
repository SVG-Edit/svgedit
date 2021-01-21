/* eslint-disable node/no-unpublished-import */
import 'elix/define/PopupButton.js';
import PaintBox from './PaintBox.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  @import "./components/jgraduate/css/jGraduate.css";
  @import "./components/jgraduate/css/jPicker.css";
  #logo {
    height: 18px;
    width: 18px;
  }
  #block {
    height: 13px;
    width: 14px;
    float: right;
    background-color: darkgrey;
  }
  #picker {
    background: var(--input-color);
    height: 19px;
    line-height: 19px;
    border-radius: 3px;
    width: 52px;
    display: flex;
    align-items: center;
    margin-right: 4px;
    margin-top: 1px;
    justify-content: space-evenly;
  }
  #color_picker {
    z-index: 1000;
    top: -350px;
  }
  .popup {
    height: 420px;
    max-height: 100%;
    max-width: 100%;
    width: 645px;
  }
  </style>
  <elix-popup-button popup-position="above">
    <div id="picker" slot="source">
        <img src="./images/logo.svg" alt="icon" id="logo">
        <label for="color" title="Change xxx color" id="label"></label>
        <div id="block">
        </div>
    </div>
    <!-- hidden div -->
    <div id="color_picker" class="popup"> 
      <ul class="jGraduate_tabs">
        <li class="jGraduate_tab_color se-tabs jGraduate_tab_current" data-section="se-color-pick" data-type="col">
          Solid Color
        </li>
        <li class="jGraduate_tab_lingrad se-tabs" data-section="se-lingrad-pick" data-type="lg">
          Linear Gradient
        </li>
        <li class="jGraduate_tab_radgrad se-tabs" data-section="se-radgrad-pick" data-type="rg">
          Radial Gradient
        </li>
      </ul>
      <div class="jGraduate_colPick" id="se-color-pick">Solid Color sction </div>
      <div class="jGraduate_gradPick" id="se-lingrad-pick">
        <!-- jGraduate_gradPick starrt -->
        <div id="color_picker_jGraduate_Swatch" class="jGraduate_Swatch">
          <h2 class="jGraduate_Title"> $settings.window.pickerTitle + </h2>
          <div id="color_picker_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>
          <div id="color_picker_jGraduate_StopSlider" class="jGraduate_StopSlider"></div>
        </div>
        <div class="jGraduate_Form jGraduate_Points jGraduate_lg_field">
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">Begin Point</label>
            <div class="jGraduate_Form_Section">
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_x1" size="3" title="Enter starting x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_y1" size="3" title="Enter starting y value between 0.0 and 1.0"/>
            </div>
          </div>
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">End Point</label>
            <div class="jGraduate_Form_Section">
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_x2" size="3" title="Enter ending x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_y2" size="3" title="Enter ending y value between 0.0 and 1.0"/>
            </div>
          </div>
        </div>
        <div class="jGraduate_Form jGraduate_Points jGraduate_rg_field">
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">Center Point</label>
            <div class="jGraduate_Form_Section">
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_cx" size="3" title="Enter x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_cy" size="3" title="Enter y value between 0.0 and 1.0"/>
            </div>
          </div>
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">Focal Point</label>
            <div class="jGraduate_Form_Section">
              <label>Match center: <input type="checkbox" checked="checked" id="color_picker_jGraduate_match_ctr"/></label><br/>
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_fx" size="3" title="Enter x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_fy" size="3" title="Enter y value between 0.0 and 1.0"/>
            </div>
          </div>
        </div>
        <div class="jGraduate_StopSection jGraduate_SpreadMethod">
          <label class="jGraduate_Form_Heading">Spread method</label>
          <div class="jGraduate_Form_Section">
            <select class="jGraduate_spreadMethod">
              <option value=pad selected>Pad</option>
              <option value=reflect>Reflect</option>
              <option value=repeat>Repeat</option>
            </select>
          </div>
        </div>
        <div class="jGraduate_Form">
          <div class="jGraduate_Slider jGraduate_RadiusField jGraduate_rg_field">
            <label class="prelabel">Radius:</label>
            <div id="color_picker_jGraduate_Radius" class="jGraduate_SliderBar jGraduate_Radius" title="Click to set radius">
              <img id="color_picker_jGraduate_RadiusArrows" class="jGraduate_RadiusArrows" src="images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_RadiusInput" size="3" value="100"/>%</label>
          </div>
          <div class="jGraduate_Slider jGraduate_EllipField jGraduate_rg_field">
            <label class="prelabel">Ellip:</label>
            <div id="color_picker_jGraduate_Ellip" class="jGraduate_SliderBar jGraduate_Ellip" title="Click to set Ellip">
              <img id="color_picker_jGraduate_EllipArrows" class="jGraduate_EllipArrows" src="images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_EllipInput" size="3" value="0"/>%</label>
          </div>
          <div class="jGraduate_Slider jGraduate_AngleField jGraduate_rg_field">
            <label class="prelabel">Angle:</label>
            <div id="color_picker_jGraduate_Angle" class="jGraduate_SliderBar jGraduate_Angle" title="Click to set Angle">
              <img id="color_picker_jGraduate_AngleArrows" class="jGraduate_AngleArrows" src="images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_AngleInput" size="3" value="0"/>deg</label>
          </div>
          <div class="jGraduate_Slider jGraduate_OpacField">
            <label class="prelabel">Opac:</label>
            <div id="color_picker_jGraduate_Opac" class="jGraduate_SliderBar jGraduate_Opac" title="Click to set Opac">
              <img id="color_picker_jGraduate_OpacArrows" class="jGraduate_OpacArrows" src="images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_OpacInput" size="3" value="100"/>%</label>
          </div>
        </div>
        <div class="jGraduate_OkCancel">
          <input type="button" id="color_picker_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>
          <input type="button" id="color_picker_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>
        </div>
        <!-- jGraduate_gradPick end -->      
      </div>
      <div class="jGraduate_LightBox" id="se-radgrad-pick">LightBox sction</div>
      <div id="color_picker_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>
    </div>
  </elix-popup-button>
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
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$logo = this._shadowRoot.getElementById('logo');
    this.$label = this._shadowRoot.getElementById('label');
    this.$block = this._shadowRoot.getElementById('block');
    this.paintBox = null;
    this.$picker = this._shadowRoot.getElementById('picker');
    this.$color_picker = this._shadowRoot.getElementById('color_picker');
    this.$tabs = this._shadowRoot.querySelectorAll('.se-tabs');
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
    const self = this._shadowRoot;
    const onTabsClickHandler = (e) => {
      e.target.parentElement.querySelectorAll('.se-tabs').forEach((ev) => {
        ev.classList.remove('jGraduate_tab_current');
        self.getElementById(ev.dataset.section).style.display = 'none';
      });
      e.target.classList.add('jGraduate_tab_current');
      self.getElementById(e.target.dataset.section).style.display = 'block';
    };
    for (let i = 0; i < this.$tabs.length; i++) {
      this.$tabs[i].addEventListener('click', onTabsClickHandler, false);
    }
  }
}

// Register
customElements.define('se-color-graduate-picker', SeColorPicker);
