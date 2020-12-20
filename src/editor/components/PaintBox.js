/* globals $ */
/**
 *
 */
class PaintBox {
  /**
     * @param {string|Element|external:jQuery} container
     * @param {PlainObject} svgcanvas
     * @param {"fill"} type
     * @param {string} color
     * @param {number} opacity
     */
  constructor (container, svgcanvas, type, color, opacity) {
    // set up gradients to be used for the buttons
    const svgdocbox = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="16.5" height="16.5">
          <rect
            fill="#${color}" opacity="${opacity}"/>
          <defs><linearGradient id="gradbox_${PaintBox.ctr++}"/></defs>
        </svg>`,
      'text/xml'
    );

    let docElem = svgdocbox.documentElement;
    docElem = $(container)[0].appendChild(document.importNode(docElem, true));
    docElem.setAttribute('width', 16.5);

    this.rect = docElem.firstElementChild;
    this.defs = docElem.getElementsByTagName('defs')[0];
    this.grad = this.defs.firstElementChild;
    this.paint = new $.jGraduate.Paint({solidColor: color});
    this.type = type;
    this.svgcanvas = svgcanvas;
  }

  /**
     * @param {module:jGraduate~Paint} paint
     * @param {boolean} apply
     * @returns {void}
     */
  setPaint (paint, apply) {
    this.paint = paint;

    const ptype = paint.type;
    const opac = paint.alpha / 100;

    let fillAttr = 'none';
    switch (ptype) {
    case 'solidColor':
      fillAttr = (paint[ptype] !== 'none') ? '#' + paint[ptype] : paint[ptype];
      break;
    case 'linearGradient':
    case 'radialGradient': {
      this.grad.remove();
      this.grad = this.defs.appendChild(paint[ptype]);
      const id = this.grad.id = 'gradbox_' + this.type;
      fillAttr = 'url(#' + id + ')';
      break;
    }
    }

    this.rect.setAttribute('fill', fillAttr);
    this.rect.setAttribute('opacity', opac);

    if (apply) {
      this.svgCanvas.setColor(this.type, this._paintColor, true);
      this.svgCanvas.setPaintOpacity(this.type, this._paintOpacity, true);
    }
  }
  /**
  * @param {string} color
  * @param {Float} opac
  * @param {string} type
  * @returns {module:jGraduate~Paint}
  */
  getPaint (color, opac, type) {
    // update the editor's fill paint
    const opts = {alpha: opac};
    if (color.startsWith('url(#')) {
      let refElem = this.svgCanvas.getRefElem(color);
      refElem = (refElem) ? refElem.cloneNode(true) : $('#' + type + '_color defs *')[0];
      opts[refElem.tagName] = refElem;
    } else if (color.startsWith('#')) {
      opts.solidColor = color.substr(1);
    } else {
      opts.solidColor = 'none';
    }
    return new $.jGraduate.Paint(opts);
  }

  /**
     * @param {PlainObject} selectedElement
     * @param {boolean} apply
     * @returns {void}
     */
  update (selectedElement, apply) {
    if (!selectedElement) { return; }

    const {type} = this;
    switch (selectedElement.tagName) {
    case 'use':
    case 'image':
    case 'foreignObject':
      // These elements don't have fill or stroke, so don't change
      // the current value
      return;
    case 'g':
    case 'a': {
      const childs = selectedElement.getElementsByTagName('*');

      let gPaint = null;
      for (let i = 0, len = childs.length; i < len; i++) {
        const elem = childs[i];
        const p = elem.getAttribute(type);
        if (i === 0) {
          gPaint = p;
        } else if (gPaint !== p) {
          gPaint = null;
          break;
        }
      }

      if (gPaint === null) {
        // No common color, don't update anything
        this._paintColor = null;
        return;
      }
      this._paintColor = gPaint;
      this._paintOpacity = 1;
      break;
    } default: {
      this._paintOpacity = Number.parseFloat(selectedElement.getAttribute(type + '-opacity'));
      if (Number.isNaN(this._paintOpacity)) {
        this._paintOpacity = 1.0;
      }

      const defColor = type === 'fill' ? 'black' : 'none';
      this._paintColor = selectedElement.getAttribute(type) || defColor;
    }
    }

    if (apply) {
      this.svgCanvas.setColor(type, this._paintColor, true);
      this.svgCanvas.setPaintOpacity(type, this._paintOpacity, true);
    }

    this._paintOpacity *= 100;

    const paint = this.getPaint(this._paintColor, this._paintOpacity, type);
    // update the rect inside #fill_color/#stroke_color
    this.setPaint(paint);
  }

  /**
     * @returns {void}
     */
  prep () {
    const ptype = this.paint.type;

    switch (ptype) {
    case 'linearGradient':
    case 'radialGradient': {
      const paint = new $.jGraduate.Paint({copy: this.paint});
      this.svgCanvas.setPaint(this.type, paint);
      break;
    }
    }
  }
}
PaintBox.ctr = 0;

export default PaintBox;
