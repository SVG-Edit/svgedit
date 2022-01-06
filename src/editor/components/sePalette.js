/* globals svgEditor */
/* eslint-disable max-len */
const palette = [
  // Todo: Make into configuration item?
  'none', '#000000', '#3f3f3f', '#7f7f7f', '#bfbfbf', '#ffffff',
  '#ff0000', '#ff7f00', '#ffff00', '#7fff00',
  '#00ff00', '#00ff7f', '#00ffff', '#007fff',
  '#0000ff', '#7f00ff', '#ff00ff', '#ff007f',
  '#7f0000', '#7f3f00', '#7f7f00', '#3f7f00',
  '#007f00', '#007f3f', '#007f7f', '#003f7f',
  '#00007f', '#3f007f', '#7f007f', '#7f003f',
  '#ffaaaa', '#ffd4aa', '#ffffaa', '#d4ffaa',
  '#aaffaa', '#aaffd4', '#aaffff', '#aad4ff',
  '#aaaaff', '#d4aaff', '#ffaaff', '#ffaad4'
]

const template = document.createElement('template')
template.innerHTML = `
  <style>
  .square {
    height: 15px;
    width: 15px;
    float: left;
  }
  #palette_holder {
    overflow: hidden;
    padding: 4px;
    background: #f0f0f0;
    border-radius: 3px;
    z-index: 2;
  }
  
  #js-se-palette {
    float: left;
    width: 632px;
    height: 16px;
  }
  
  div.palette_item {
    height: 15px;
    width: 15px;
    float: left;
  }
  
  div.palette_item:first-child {
    background: white;
  }
  
  </style>
  <div id="palette_holder" title="">
    <div id="js-se-palette">
    </div>
  </div>
`

/**
 * @class SEPalette
 */
export class SEPalette extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$strip = this._shadowRoot.querySelector('#js-se-palette')
    palette.forEach((rgb) => {
      const newDiv = document.createElement('div')
      newDiv.classList.add('square')
      if (rgb === 'none') {
        const img = document.createElement('img')
        img.src = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgY2xhc3M9InN2Z19pY29uIj48c3ZnIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiNkNDAwMDAiIGlkPSJzdmdfOTAiIHkyPSIyNCIgeDI9IjI0IiB5MT0iMCIgeDE9IjAiLz4KICAgIDxsaW5lIGlkPSJzdmdfOTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0MDAwMCIgeTI9IjI0IiB4Mj0iMCIgeTE9IjAiIHgxPSIyNCIvPgogIDwvc3ZnPjwvc3ZnPg=='
        img.style.width = '15px'
        img.style.height = '15px'
        newDiv.append(img)
      } else {
        newDiv.style.backgroundColor = rgb
      }
      newDiv.dataset.rgb = rgb
      svgEditor.$click(newDiv, (evt) => {
        evt.preventDefault()
        // shift key or right click for stroke
        const picker = evt.shiftKey || evt.button === 2 ? 'stroke' : 'fill'
        let color = newDiv.dataset.rgb
        // Webkit-based browsers returned 'initial' here for no stroke
        if (color === 'none' || color === 'transparent' || color === 'initial') {
          color = 'none'
        }
        const paletteEvent = new CustomEvent('change', { detail: { picker, color }, bubbles: false })
        this.dispatchEvent(paletteEvent)
      })
      this.$strip.append(newDiv)
    })
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('ui-palette_info', i18next.t('ui.palette_info'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['ui-palette_info']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let node
    if (name === 'ui-palette_info') {
      node = this._shadowRoot.querySelector('#palette_holder')
      node.setAttribute('title', newValue)
    }
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
  }
}

// Register
customElements.define('se-palette', SEPalette)
