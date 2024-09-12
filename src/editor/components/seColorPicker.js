/* globals svgEditor */
import { jGraduate, jGraduateMethod } from './jgraduate/jQuery.jGraduate.js'
import PaintBox from './PaintBox.js'
import { t } from '../locale.js'

const template = document.createElement('template')
template.innerHTML = `
  <style>
  .jPicker .Icon {
    display: inline-block;
    height: 24px;
    position: relative;
    text-align: left;
    width: 25px
}

.jPicker .Icon span.Color, .jPicker .Icon span.Alpha {
    background-position: 2px 2px;
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%
}

.jPicker .Icon span.Image {
    background-repeat: no-repeat;
    cursor: pointer;
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%
}

.jPicker.Container {
    z-index: 10
}

table.jPicker {
    background-color: #efefef;
    border: 1px outset #666;
    font-family: Arial, Helvetica, Sans-Serif;
    font-size: 12px!important;
    margin: 0;
    padding: 5px;
    width: 545px;
    z-index: 20
}

.jPicker .Move {
    background-color: #ddd;
    border-color: #fff #666 #666 #fff;
    border-style: solid;
    border-width: 1px;
    cursor: move;
    height: 12px;
    padding: 0
}

.jPicker .Title {
    font-size: 11px!important;
    font-weight: bold;
    margin: -2px 0 0 0;
    padding: 0;
    text-align: center;
    width: 100%
}

.jPicker div.Map {
    border-bottom: 2px solid #fff;
    border-left: 2px solid #9a9a9a;
    border-right: 2px solid #fff;
    border-top: 2px solid #9a9a9a;
    cursor: crosshair;
    height: 260px;
    margin: 0 5px 0 5px;
    overflow: hidden;
    padding: 0;
    position: relative;
    width: 260px
}

.jPicker div[class="Map"] {
    height: 256px;
    width: 256px
}

.jPicker div.Bar {
    border-bottom: 2px solid #fff;
    border-left: 2px solid #9a9a9a;
    border-right: 2px solid #fff;
    border-top: 2px solid #9a9a9a;
    cursor: n-resize;
    height: 260px;
    margin: 12px 10px 0 5px;
    overflow: hidden;
    padding: 0;
    position: relative;
    width: 24px
}

.jPicker div[class="Bar"] {
    height: 256px;
    width: 20px
}

.jPicker .Map .Map1, .jPicker .Map .Map2, .jPicker .Map .Map3, .jPicker .Bar .Map1, .jPicker .Bar .Map2, .jPicker .Bar .Map3, .jPicker .Bar .Map4, .jPicker .Bar .Map5, .jPicker .Bar .Map6 {
    background-color: transparent;
    background-image: none;
    display: block;
    left: 0;
    position: absolute;
    top: 0
}

.jPicker .Map .Map1, .jPicker .Map .Map2, .jPicker .Map .Map3 {
    height: 2596px;
    width: 256px
}

.jPicker .Bar .Map1, .jPicker .Bar .Map2, .jPicker .Bar .Map3, .jPicker .Bar .Map4 {
    height: 3896px;
    width: 20px
}

.jPicker .Bar .Map5, .jPicker .Bar .Map6 {
    height: 256px;
    width: 20px
}

.jPicker .Map .Map1, .jPicker .Map .Map2, .jPicker .Bar .Map6 {
    background-repeat: no-repeat
}

.jPicker .Map .Map3, .jPicker .Bar .Map5 {
    background-repeat: repeat
}

.jPicker .Bar .Map1, .jPicker .Bar .Map2, .jPicker .Bar .Map3, .jPicker .Bar .Map4 {
    background-repeat: repeat-x
}

.jPicker .Map .Arrow {
    display: block;
    position: absolute
}

.jPicker .Bar .Arrow {
    display: block;
    left: 0;
    position: absolute
}

.jPicker .Preview {
    font-size: 9px;
    text-align: center
}

.jPicker .Preview div {
    border: 2px inset #eee;
    height: 62px;
    margin: 0 auto;
    padding: 0;
    width: 62px
}

.jPicker .Preview div span {
    border: 1px solid #000;
    display: block;
    height: 30px;
    margin: 0 auto;
    padding: 0;
    width: 60px
}

.jPicker .Preview .Active {
    border-bottom-width: 0
}

.jPicker .Preview .Current {
    border-top-width: 0;
    cursor: pointer
}

.jPicker .Button {
    text-align: center;
    width: 115px
}

.jPicker .Button input {
    width: 100px
}

.jPicker .Button .Ok {
    margin: 12px 0 5px 0
}

.jPicker td.Radio {
    margin: 0;
    padding: 0;
    width: 31px
}

.jPicker td.Radio input {
    margin: 0 5px 0 0;
    padding: 0
}

.jPicker td.Text {
    font-size: 12px!important;
    height: 22px;
    margin: 0;
    padding: 0;
    text-align: left;
    width: 70px
}

.jPicker tr.Hex td.Text {
    width: 100px
}

.jPicker td.Text input {
    background-color: #fff;
    border: 1px inset #aaa;
    height: 19px;
    margin: 0 0 0 5px;
    text-align: left;
    width: 30px
}

.jPicker td[class="Text"] input {
    height: 15px
}

.jPicker tr.Hex td.Text input.Hex {
    width: 50px
}

.jPicker tr.Hex td.Text input.AHex {
    width: 20px
}

.jPicker .Grid {
    text-align: center;
    width: 114px
}

.jPicker .Grid span.QuickColor {
    border: 1px inset #aaa;
    cursor: pointer;
    display: inline-block;
    height: 15px;
    line-height: 15px;
    margin: 0;
    padding: 0;
    width: 19px
}

.jPicker .Grid span[class="QuickColor"] {
    width: 17px
}
  /*
 * jGraduate Default CSS
 *
 * Copyright (c) 2010 Jeff Schiller
 * http://blog.codedread.com/
 *
 * Copyright (c) 2010 Alexis Deveria
 * http://a.deveria.com/
 *
 * Licensed under the MIT License
 */

h2.jGraduate_Title {
  font-family: Arial, Helvetica, Sans-Serif;
  font-size: 11px !important;
  font-weight: bold;
  margin: -13px 0px 0px 0px;
  padding: 0px;
  text-align: center;
}

.jGraduate_Picker {
  font-family: Arial, Helvetica, Sans-Serif;
  font-size: 12px;
  border-style: solid;
  border-color: lightgrey black black lightgrey;
  border-width: 1px;
  background-color: #EFEFEF;
  position: absolute;
  padding: 10px;
}

.jGraduate_tabs li {
  background-color: #ccc;
  display: inline;
  border: solid 1px grey;
  padding: 3px;
  margin: 2px;
  cursor: pointer;
}

li.jGraduate_tab_current {
  background-color: #EFEFEF;
  display: inline;
  padding: 3px;
  margin: 2px;
  border: solid 1px black;
  cursor: pointer;
}

.jGraduate_colPick {
  display: none;
}

.jGraduate_gradPick {
  display: none;
  border: outset 1px #666;
  padding: 10px 7px 5px 5px;
  overflow: auto;
}

.jGraduate_gradPick {
  display: none;
  border: outset 1px #666;
  padding: 10px 7px 5px 5px;
  overflow: auto;
/*  position: relative;*/
}

.jGraduate_tabs {
  position: relative;
  background-color: #EFEFEF;
  padding: 0px;
  margin: 0px;
  margin-bottom: 5px;
}

div.jGraduate_Swatch {
  float: left;
  margin: 8px;
}
div.jGraduate_GradContainer {
  border: 2px inset #EEE;
  background-image: url(./components/jgraduate/images/map-opacity.png);
  background-position: 0px 0px;
  height: 256px;
  width: 256px;
  position: relative;
}

div.jGraduate_GradContainer div.grad_coord {
  background: #000;
  border: 1px solid #fff;
  border-radius: 5px;
  -moz-border-radius: 5px;
  width: 10px;
  height: 10px;
  position: absolute;
  margin: -5px -5px;
  top: 0;
  left: 0;
  text-align: center;
  font-size: xx-small;
  line-height: 10px;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  -moz-user-select: none;
  -webkit-user-select: none;
}

.jGraduate_AlphaArrows {
  position: absolute;
  margin-top: -10px;
  margin-left: 250.5px;
}

div.jGraduate_Opacity {
  border: 2px inset #eee;
  margin-top: 14px;
  background-color: black;
  background-image: url(../images/Maps.png);
  background-position: 0px -2816px;
  height: 20px;
  cursor: ew-resize;
}

div.jGraduate_StopSlider {
/*  border: 2px inset #eee;*/
  margin: 0 0 0 -10px;
  width: 276px;
  overflow: visible;
  background: #efefef;
  height: 45px;
  cursor: pointer;
}

div.jGraduate_StopSection {
  width: 120px;
  text-align: center;
}

input.jGraduate_Ok, input.jGraduate_Cancel {
  display: block;
  width: 100px;
  margin-left: -4px;
  margin-right: -4px;
}
input.jGraduate_Ok {
  margin: 9px -4px 5px -4px;
}

.colorBox {
  float: left;
  height: 16px;
  width: 16px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  margin: 4px 4px 4px 30px;
}

.colorBox + label {
  float: left;
  margin-top: 7px;
}

label.jGraduate_Form_Heading {
  position: relative;
  top: 10px;
  background-color: #EFEFEF;
  padding: 2px;
  font-weight: bold;
  font-size: 13px;
}

div.jGraduate_Form_Section {
  border-style: solid;
  border-width: 1px;
  border-color: grey;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  padding: 15px 5px 5px 5px;
  margin: 5px 2px;
  width: 110px;
  text-align: center;
  overflow: auto;
}

div.jGraduate_Form_Section label {
  padding: 0 2px;
}

div.jGraduate_StopSection input[type=text],
div.jGraduate_Slider input[type=text] {
  width: 33px;
}

div.jGraduate_LightBox {
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: #000;
  opacity: 0.5;
  display: none;
}

div.jGraduate_stopPicker {
  position: absolute;
  display: none;
  background: #E8E8E8;
}


.jGraduate_gradPick {
  width: 535px;
}

.jGraduate_gradPick div.jGraduate_OpacField {

  position: absolute;
  left: 0;
  bottom: 5px;
/*
  width: 270px;

  left: 284px;
  width: 266px;
  height: 200px;
  top: 167px;
  margin: -3px 3px 0px 4px;
*/
}

.jGraduate_gradPick .jGraduate_Form {
  float: left;
  width: 270px;
  position: absolute;
  left: 284px;
  width: 266px;
  height: 200px;
  top: 167px;
  margin: -3px 3px 0px 10px;
}

.jGraduate_gradPick .jGraduate_Points {
  position: static;
  width: 150px;
  margin-left: 0;
}

.jGraduate_SpreadMethod {
  position: absolute;
  right: 8px;
  top: 100px;
}

.jGraduate_Colorblocks {
  display: table;
  border-spacing: 0 5px;
}

.jGraduate_colorblock {
  display: table-row;
}

.jGraduate_Colorblocks .jGraduate_colorblock > * {
  display: table-cell;
  vertical-align: middle;
  margin: 0;
  float: none;
}

.jGraduate_gradPick div.jGraduate_StopSection {
  float: left;
  width: 133px;
  margin-top: -8px;
}


.jGraduate_gradPick .jGraduate_Form_Section {
  padding-top: 9px;
}


.jGraduate_Slider {
  text-align: center;
  float: left;
  width: 100%;
}

.jGraduate_Slider .jGraduate_Form_Section {
  border: none;
  width: 250px;
  padding: 0 2px;
  overflow: visible;
}

.jGraduate_Slider label {
  display: inline-block;
  float: left;
  line-height: 50px;
  padding: 0;
}

.jGraduate_Slider label.prelabel {
  width: 40px;
  text-align: left;
}

.jGraduate_SliderBar {
  width: 140px;
  float: left;
  margin-right: 5px;
  border:1px solid #BBB;
  height:20px;
  margin-top:14px;
  margin-left:5px;
  position: relative;
}

div.jGraduate_Slider input {
  margin-top: 5px;
}

div.jGraduate_Slider img {
  top: 0;
  left: 0;
  position: absolute;
  margin-top: -10px;
  cursor:ew-resize;
}


.jGraduate_gradPick .jGraduate_OkCancel {
  position: absolute;
  top: 39px;
  right: 10px;
  width: 113px;

}

.jGraduate_OpacField {
  position: absolute;
  right: -10px;
  bottom: 0;
}
  #logo {
    height: 18px;
    width: 18px;
  }
  #block {
    height: 17px;
    width: 14px;
    float: right;
    background-color: darkgrey;
  }
  #picker {
    background: var(--input-color);
    height: 23px;
    line-height: 23px;
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
    bottom: 0;
  }
  </style>
  <div id="picker">
      <img src="logo.svg" alt="icon" id="logo">
      <label for="color" title="" id="label"></label>
      <div id="block">
      </div>
  </div>
  <!-- hidden div -->
  <div id="color_picker"></div>
`
/**
 * @class SeColorPicker
 */
export class SeColorPicker extends HTMLElement {
  /**
   * @function constructor
   */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$logo = this._shadowRoot.getElementById('logo')
    this.$label = this._shadowRoot.getElementById('label')
    this.$block = this._shadowRoot.getElementById('block')
    this.paintBox = null
    this.i18next = null
    this.$picker = this._shadowRoot.getElementById('picker')
    this.$color_picker = this._shadowRoot.getElementById('color_picker')
    this.imgPath = svgEditor.configObj.curConfig.imgPath
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.i18next = i18next
    this.setAttribute('config-change_xxx_color', t('config.change_xxx_color'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'src', 'type', 'config-change_xxx_color']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return
    switch (name) {
      case 'src':
        this.$logo.setAttribute('src', this.imgPath + '/' + newValue)
        break
      case 'label':
        this.setAttribute('title', t(newValue))
        break
      case 'type':
        this.$label.setAttribute('title', 'config.pick_paint_opavity')
        break
      case 'config-change_xxx_color':
        this.$label.setAttribute('title', newValue)
        break
      default:
        console.error(`unknown attribute: ${name}`)
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get label () {
    return this.$label.getAttribute('title')
  }

  /**
   * @function set
   * @returns {void}
   */
  set label (value) {
    this.setAttribute('label', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get type () {
    return this.getAttribute('type')
  }

  /**
   * @function set
   * @returns {void}
   */
  set type (value) {
    this.setAttribute('type', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get src () {
    return this.getAttribute('src')
  }

  /**
   * @function set
   * @returns {void}
   */
  set src (value) {
    this.setAttribute('src', value)
  }

  /**
   * @param {PlainObject} svgCanvas
   * @param {PlainObject} selectedElement
   * @param {bool} apply
   * @returns {void}
   */
  update (svgCanvas, selectedElement, apply) {
    const paint = this.paintBox.update(svgCanvas, selectedElement)
    if (paint && apply) {
      const changeEvent = new CustomEvent('change', {
        detail: {
          paint
        }
      })
      this.dispatchEvent(changeEvent)
    }
  }

  /**
   * @param {PlainObject} paint
   * @returns {void}
   */
  setPaint (paint) {
    this.paintBox.setPaint(paint)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.paintBox = new PaintBox(this.$block, this.type)
    svgEditor.$click(this.$picker, () => {
      let { paint } = this.paintBox
      jGraduateMethod(
        this.$color_picker,
        {
          images: { clientPath: './components/jgraduate/images/' },
          paint,
          window: { pickerTitle: this.label },
          newstop: 'inverse'
        },
        (p) => {
          paint = new jGraduate.Paint(p)
          this.setPaint(paint)
          const changeEvent = new CustomEvent('change', {
            detail: {
              paint
            }
          })
          this.dispatchEvent(changeEvent)
          this.$color_picker.style.display = 'none'
        },
        () => {
          this.$color_picker.style.display = 'none'
        },
        this.i18next
      )
    })
  }
}

// Register
customElements.define('se-colorpicker', SeColorPicker)
