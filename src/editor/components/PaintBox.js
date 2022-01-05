import { jGraduate } from './jgraduate/jQuery.jGraduate.js'
/**
 *
 */
class PaintBox {
  /**
     * @param {string|Element|external:jQuery} container
     * @param {"fill"} type
     */
  constructor (container, type) {
    // set up gradients to be used for the buttons
    const svgdocbox = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
          <rect
            fill="#000000" opacity="1" width="14" height="14"/>
          <defs><linearGradient id="gradbox_${PaintBox.ctr++}"/></defs>
        </svg>`,
      'text/xml'
    )

    let docElem = svgdocbox.documentElement
    docElem = document.importNode(docElem, true)
    container.appendChild(docElem)

    this.rect = docElem.firstElementChild
    this.defs = docElem.getElementsByTagName('defs')[0]
    this.grad = this.defs.firstElementChild
    // this.paint = new $.jGraduate.Paint({solidColor: color});
    this.type = type
  }

  /**
     * @param {module:jGraduate~Paint} paint
     * @returns {void}
     */
  setPaint (paint) {
    this.paint = paint

    const ptype = paint.type
    const opac = paint.alpha / 100

    let fillAttr = 'none'
    switch (ptype) {
      case 'solidColor':
        fillAttr = (paint[ptype] !== 'none') ? '#' + paint[ptype] : paint[ptype]
        break
      case 'linearGradient':
      case 'radialGradient': {
        this.grad.remove()
        this.grad = paint[ptype]
        this.defs.appendChild(this.grad)
        const id = this.grad.id = 'gradbox_' + this.type
        fillAttr = 'url(#' + id + ')'
        break
      }
    }

    this.rect.setAttribute('fill', fillAttr)
    this.rect.setAttribute('opacity', opac)
  }

  /**
   * @param {PlainObject} svgCanvas
  * @param {string} color
  * @param {Float} opac
  * @param {string} type
  * @returns {module:jGraduate~Paint}
  */
  static getPaint (svgCanvas, color, opac, type) {
    // update the editor's fill paint
    const opts = { alpha: opac }
    if (color.startsWith('url(#')) {
      let refElem = svgCanvas.getRefElem(color)
      refElem = (refElem) ? refElem.cloneNode(true) : document.querySelectorAll('#' + type + '_color defs *')[0]
      if (!refElem) {
        console.error(`the color ${color} is referenced by an url that can't be identified - using 'none'`)
        opts.solidColor = 'none'
      } else {
        opts[refElem.tagName] = refElem
      }
    } else if (color.startsWith('#')) {
      opts.solidColor = color.substr(1)
    }
    return new jGraduate.Paint(opts)
  }

  /**
     * @param {PlainObject} svgcanvas
     * @param {PlainObject} selectedElement
     * @returns {any}
     */
  update (svgcanvas, selectedElement) {
    if (!selectedElement) { return null }

    const { type } = this
    switch (selectedElement.tagName) {
      case 'use':
      case 'image':
      case 'foreignObject':
      // These elements don't have fill or stroke, so don't change
      // the current value
        return null
      case 'g':
      case 'a': {
        const childs = selectedElement.getElementsByTagName('*')

        let gPaint = null
        for (let i = 0, len = childs.length; i < len; i++) {
          const elem = childs[i]
          const p = elem.getAttribute(type)
          if (i === 0) {
            gPaint = p
          } else if (gPaint !== p) {
            gPaint = null
            break
          }
        }

        if (gPaint === null) {
        // No common color, don't update anything
          this._paintColor = null
          return null
        }
        this._paintColor = gPaint
        this._paintOpacity = 1
        break
      } default: {
        this._paintOpacity = Number.parseFloat(selectedElement.getAttribute(type + '-opacity'))
        if (Number.isNaN(this._paintOpacity)) {
          this._paintOpacity = 1.0
        }

        const defColor = type === 'fill' ? 'black' : 'none'
        this._paintColor = selectedElement.getAttribute(type) || defColor
      }
    }

    this._paintOpacity *= 100

    const paint = PaintBox.getPaint(svgcanvas, this._paintColor, this._paintOpacity, type)
    // update the rect inside #fill_color/#stroke_color
    this.setPaint(paint)
    return (paint)
  }
}
PaintBox.ctr = 0

export default PaintBox
