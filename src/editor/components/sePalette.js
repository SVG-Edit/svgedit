import 'elix/define/CenteredStrip.js';

const palette = [
  // Todo: Make into configuration item?
  '#000000', '#3f3f3f', '#7f7f7f', '#bfbfbf', '#ffffff',
  '#ff0000', '#ff7f00', '#ffff00', '#7fff00',
  '#00ff00', '#00ff7f', '#00ffff', '#007fff',
  '#0000ff', '#7f00ff', '#ff00ff', '#ff007f',
  '#7f0000', '#7f3f00', '#7f7f00', '#3f7f00',
  '#007f00', '#007f3f', '#007f7f', '#003f7f',
  '#00007f', '#3f007f', '#7f007f', '#7f003f',
  '#ffaaaa', '#ffd4aa', '#ffffaa', '#d4ffaa',
  '#aaffaa', '#aaffd4', '#aaffff', '#aad4ff',
  '#aaaaff', '#d4aaff', '#ffaaff', '#ffaad4'
];

const template = document.createElement('template');
template.innerHTML = `
  <style>
  .square {
    height: 15px;
    width: 15px;
  }
  </style>
  <div title="Click to change fill color, shift-click to change stroke color">
    <elix-centered-strip style="width:300px;padding:5px;background: #fff; border-radius: 5px;">
    </elix-centered-strip>
  </div>
`;

/**
 * @class SEPalette
 */
export class SEPalette extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$strip = this._shadowRoot.querySelector('elix-centered-strip');
    palette.forEach((rgb) => {
      const newDiv = document.createElement('div');
      newDiv.classList.add('square');
      newDiv.style.backgroundColor = rgb;
      newDiv.dataset.rgb = rgb;
      this.$strip.append(newDiv);
    });
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.$strip.addEventListener('click', (evt) => {
      evt.preventDefault();
      // shift key or right click for stroke
      const picker = evt.shiftKey || evt.button === 2 ? 'stroke' : 'fill';
      let color = this.$strip.currentItem.dataset.rgb;
      // Webkit-based browsers returned 'initial' here for no stroke
      if (color === 'none' || color === 'transparent' || color === 'initial') {
        color = 'none';
      }
      const paletteEvent = new CustomEvent('change', {detail: {picker, color}, bubbles: false});
      this.dispatchEvent(paletteEvent);
    });
  }
}

// Register
customElements.define('se-palette', SEPalette);

/* #palette_holder {
  overflow: hidden;
  margin-top: 5px;
  padding: 5px;
  position: absolute;
  right: 15px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 3px;
  z-index: 2;

  #palette {
  float: left;
  width: 632px;
  height: 16px;
}

  $('.palette_item').mousedown(function (evt) {
    // shift key or right click for stroke
    const picker = evt.shiftKey || evt.button === 2 ? 'stroke' : 'fill';
    let color = $(this).data('rgb');
    let paint;

    // Webkit-based browsers returned 'initial' here for no stroke
    if (color === 'none' || color === 'transparent' || color === 'initial') {
      color = 'none';
      paint = new $.jGraduate.Paint();
    } else {
      paint = new $.jGraduate.Paint({alpha: 100, solidColor: color.substr(1)});
    }

    paintBox[picker].setPaint(paint);
    svgCanvas.setColor(picker, color);

    if (color !== 'none' && svgCanvas.getPaintOpacity(picker) !== 1) {
      svgCanvas.setPaintOpacity(picker, 1.0);
    }
    updateToolButtonState();
  }).bind('contextmenu', function (e) { e.preventDefault(); });

*/
