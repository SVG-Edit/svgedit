import SvgCanvas from '../../svgcanvas/svgcanvas.js';
import { jGraduate } from '../components/jgraduate/jQuery.jGraduate.js';

const { $id } = SvgCanvas;

/*
 * register actions for left panel
 */
/**
  * @type {module}
*/
class BottomPanel {
  /**
   * @param {PlainObject} editor svgedit handler
  */
  constructor (editor) {
    this.editor = editor;
  }
  /**
   * @type {module}
   */
  get selectedElement () {
    return this.editor.selectedElement;
  }
  /**
     * @type {module}
     */
  get multiselected () {
    return this.editor.multiselected;
  }
  /**
    * @type {module}
    */
  changeStrokeWidth (e) {
    let val = e.target.value;
    if (val === 0 && this.editor.selectedElement && [ 'line', 'polyline' ].includes(this.editor.selectedElement.nodeName)) {
      val = 1;
    }
    this.editor.svgCanvas.setStrokeWidth(val);
  }
  /**
    * @type {module}
    */
  changeZoom (value) {
    switch (value) {
    case 'canvas':
    case 'selection':
    case 'layer':
    case 'content':
      this.editor.zoomChanged(window, value);
      break;
    default:
    {
      const zoomlevel = Number(value) / 100;
      if (zoomlevel < 0.001) {
        value = 0.1;
        return;
      }
      const zoom = this.editor.svgCanvas.getZoom();
      const { workarea } = this.editor;
      this.editor.zoomChanged(window, {
        width: 0,
        height: 0,
        // center pt of scroll position
        x: (workarea.scrollLeft + parseFloat(getComputedStyle(workarea, null).width.replace("px", "")) / 2) / zoom,
        y: (workarea.scrollTop + parseFloat(getComputedStyle(workarea, null).height.replace("px", "")) / 2) / zoom,
        zoom: zoomlevel
      }, true);
    }
    }
  }
  /**
     * @fires module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate
     * @returns {void}
     */
  updateToolButtonState () {
    const bNoFill = (this.editor.svgCanvas.getColor('fill') === 'none');
    const bNoStroke = (this.editor.svgCanvas.getColor('stroke') === 'none');
    const buttonsNeedingStroke = [ 'tool_fhpath', 'tool_line' ];
    const buttonsNeedingFillAndStroke = [
      'tools_rect', 'tools_ellipse',
      'tool_text', 'tool_path'
    ];

    if (bNoStroke) {
      buttonsNeedingStroke.forEach((btn) => {
        // if btn is pressed, change to select button
        if ($id(btn).pressed) {
          this.editor.leftPanel.clickSelect();
        }
        $id(btn).disabled = true;
      });
    } else {
      buttonsNeedingStroke.forEach((btn) => {
        $id(btn).disabled = false;
      });
    }
    if (bNoStroke && bNoFill) {
      buttonsNeedingFillAndStroke.forEach((btn) => {
        // if btn is pressed, change to select button
        if ($id(btn).pressed) {
          this.editor.leftPanel.clickSelect();
        }
        $id(btn).disabled = true;
      });
    } else {
      buttonsNeedingFillAndStroke.forEach((btn) => {
        $id(btn).disabled = false;
      });
    }
    this.editor.svgCanvas.runExtensions(
      'toolButtonStateUpdate',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate} */ {
        nofill: bNoFill,
        nostroke: bNoStroke
      }
    );
  }
  /**
    * @type {module}
    */
  handleColorPicker (type, evt) {
    const { paint } = evt.detail;
    this.editor.svgCanvas.setPaint(type, paint);
    this.updateToolButtonState();
  }
  /**
    * @type {module}
    */
  handleStrokeAttr (type, evt) {
    this.editor.svgCanvas.setStrokeAttr(type, evt.detail.value);
  }
  /**
    * @type {module}
    */
  handleOpacity (evt) {
    const val = Number.parseInt(evt.currentTarget.value.split('%')[0]);
    this.editor.svgCanvas.setOpacity(val / 100);
  }
  /**
  * @type {module}
  */
  handlePalette (e) {
    e.preventDefault();
    // shift key or right click for stroke
    const { picker, color } = e.detail;
    // Webkit-based browsers returned 'initial' here for no stroke
    const paint = color === 'none' ? new jGraduate.Paint() : new jGraduate.Paint({ alpha: 100, solidColor: color.substr(1) });
    if (picker === 'fill') {
      $id('fill_color').setPaint(paint);
    } else {
      $id('stroke_color').setPaint(paint);
    }
    this.editor.svgCanvas.setColor(picker, color);
    if (color !== 'none' && this.editor.svgCanvas.getPaintOpacity(picker) !== 1) {
      this.editor.svgCanvas.setPaintOpacity(picker, 1.0);
    }
    this.updateToolButtonState();
  }
  /**
  * @type {module}
  */
  init () {
    // register actions for Bottom panel
    const template = document.createElement('template');
    const { i18next } = this.editor;

    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = `
      <div id="tools_bottom">
        <!-- Zoom buttons -->
        <se-zoom id="zoom" src="zoom.svg" title="Change zoom level" inputsize="40px">
          <se-text value="1000" text="1000"></se-text>
          <se-text value="400" text="400"></se-text>
          <se-text value="200" text="200"></se-text>
          <se-text value="100" text="100"></se-text>
          <se-text value="50" text="50"></se-text>
          <se-text value="25" text="25"></se-text>
          <se-text value="canvas" text="tools.fit_to_canvas"></se-text>
          <se-text value="selection" text="tools.fit_to_sel"></se-text>
          <se-text value="layer" text="tools.fit_to_layer_content"></se-text>"
          <se-text value="content" text="tools.fit_to_all"></se-text>
        </se-zoom>
        <se-colorpicker id="fill_color" src="fill.svg" label="properties.fill_color" type="fill"></se-colorpicker>
        <se-colorpicker id="stroke_color" src="stroke.svg" label="properties.stroke_color" type="stroke"></se-colorpicker>
        <se-spin-input id="stroke_width" min=0 max=99 step=1 title="properties.stroke_width" label=""></se-spin-input>
        <se-select id="stroke_style" title="properties.stroke_style" label="" width="22px" height="22px"
          options="&#8212;,...,- -,- .,- .."
          values="none::2,2::5,5::5,2,2,2::5,2,2,2,2,2">     
        </se-select>
        <se-list id="stroke_linejoin" title="properties.linejoin_miter" label="" width="22px" height="22px">
          <se-list-item id="linejoin_miter" value="miter" src="linejoin_miter.svg" title="properties.linejoin_miter" img-height="22px"></se-list-item>
          <se-list-item id="linejoin_round" value="round" src="linejoin_round.svg" title="properties.linejoin_round" img-height="22px"></se-list-item>
          <se-list-item id="linejoin_bevel" value="bevel" src="linejoin_bevel.svg" title="properties.linejoin_bevel" img-height="22px"></se-list-item>
        </se-list>
        <se-list id="stroke_linecap" title="properties.linecap_butt" label="" width="22px" height="22px">
          <se-list-item id="linecap_butt" value="butt" src="linecap_butt.svg" title="properties.linecap_butt" img-height="22px"></se-list-item>
          <se-list-item id="linecap_square" value="square" src="linecap_square.svg" title="properties.linecap_square" img-height="22px"></se-list-item>
          <se-list-item id="linecap_round" value="round" src="linecap_round.svg" title="properties.linecap_round" img-height="22px"></se-list-item>
        </se-list>
        <se-spin-input size="3" id="opacity" min=0 max=100 step=5 title="properties.opacity" src="opacity.svg"></se-spin-input>
        <se-palette id="palette"></se-palette>
      </div>
    `;
    this.editor.$svgEditor.append(template.content.cloneNode(true));
    $id('palette').addEventListener('change', this.handlePalette.bind(this));
    $id('palette').init(i18next);
    const { curConfig } = this.editor.configObj;
    $id('fill_color').setPaint(new jGraduate.Paint({ alpha: 100, solidColor: curConfig.initFill.color }));
    $id('stroke_color').setPaint(new jGraduate.Paint({ alpha: 100, solidColor: curConfig.initStroke.color }));
    $id('zoom').addEventListener('change', (e) => this.changeZoom.bind(this)(e.detail.value));
    $id('stroke_color').addEventListener('change', (evt) => this.handleColorPicker.bind(this)('stroke', evt));
    $id('fill_color').addEventListener('change', (evt) => this.handleColorPicker.bind(this)('fill', evt));
    $id('stroke_width').addEventListener('change', this.changeStrokeWidth.bind(this));
    $id('stroke_style').addEventListener('change', (evt) => this.handleStrokeAttr.bind(this)('stroke-dasharray', evt));
    $id('stroke_linejoin').addEventListener('change', (evt) => this.handleStrokeAttr.bind(this)('stroke-linejoin', evt));
    $id('stroke_linecap').addEventListener('change', (evt) => this.handleStrokeAttr.bind(this)('stroke-linecap', evt));
    $id('opacity').addEventListener('change', this.handleOpacity.bind(this));
    $id('fill_color').init(i18next);
    $id('stroke_color').init(i18next);
  }
  /**
  * @type {module}
  */
  updateColorpickers (apply) {
    $id('fill_color').update(this.editor.svgCanvas, this.editor.selectedElement, apply);
    $id('stroke_color').update(this.editor.svgCanvas, this.editor.selectedElement, apply);
  }
}

export default BottomPanel;
