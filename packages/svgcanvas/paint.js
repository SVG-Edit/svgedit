/**
 *
 */
export default class Paint {
  /**
   * @param {module:jGraduate.jGraduatePaintOptions} [opt]
  */
  constructor (opt) {
    const options = opt || {}
    this.alpha = isNaN(options.alpha) ? 100 : options.alpha
    // copy paint object
    if (options.copy) {
      /**
       * @name module:jGraduate~Paint#type
       * @type {"none"|"solidColor"|"linearGradient"|"radialGradient"}
       */
      this.type = options.copy.type
      /**
       * Represents opacity (0-100).
       * @name module:jGraduate~Paint#alpha
       * @type {Float}
       */
      this.alpha = options.copy.alpha
      /**
       * Represents #RRGGBB hex of color.
       * @name module:jGraduate~Paint#solidColor
       * @type {string}
       */
      this.solidColor = null
      /**
       * @name module:jGraduate~Paint#linearGradient
       * @type {SVGLinearGradientElement}
       */
      this.linearGradient = null
      /**
       * @name module:jGraduate~Paint#radialGradient
       * @type {SVGRadialGradientElement}
       */
      this.radialGradient = null

      switch (this.type) {
        case 'none':
          break
        case 'solidColor':
          this.solidColor = options.copy.solidColor
          break
        case 'linearGradient':
          this.linearGradient = options.copy.linearGradient.cloneNode(true)
          break
        case 'radialGradient':
          this.radialGradient = options.copy.radialGradient.cloneNode(true)
          break
      }
    // create linear gradient paint
    } else if (options.linearGradient) {
      this.type = 'linearGradient'
      this.solidColor = null
      this.radialGradient = null
      if (options.linearGradient.hasAttribute('xlink:href')) {
        const xhref = document.getElementById(options.linearGradient.getAttribute('xlink:href').substr(1))
        this.linearGradient = xhref.cloneNode(true)
      } else {
        this.linearGradient = options.linearGradient.cloneNode(true)
      }
    // create linear gradient paint
    } else if (options.radialGradient) {
      this.type = 'radialGradient'
      this.solidColor = null
      this.linearGradient = null
      if (options.radialGradient.hasAttribute('xlink:href')) {
        const xhref = document.getElementById(options.radialGradient.getAttribute('xlink:href').substr(1))
        this.radialGradient = xhref.cloneNode(true)
      } else {
        this.radialGradient = options.radialGradient.cloneNode(true)
      }
    // create solid color paint
    } else if (options.solidColor) {
      this.type = 'solidColor'
      this.solidColor = options.solidColor
    // create empty paint
    } else {
      this.type = 'none'
      this.solidColor = null
      this.linearGradient = null
      this.radialGradient = null
    }
  }
}
