import {
  defaultState,
  setState,
  state,
  stateEffects
} from 'elix/src/base/internal.js'
import {
  SpinBox
} from 'elix/src/base/SpinBox.js'

/**
 * @class NumberSpinBox
 */
class NumberSpinBox extends SpinBox {
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'max') {
      this.max = parseFloat(newValue)
    } else if (name === 'min') {
      this.min = parseFloat(newValue)
    } else if (name === 'step') {
      this.step = parseFloat(newValue)
    } else {
      super.attributeChangedCallback(name, oldValue, newValue)
    }
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  get [defaultState] () {
    return Object.assign(super[defaultState], {
      max: null,
      min: null,
      step: 1
    })
  }

  /**
   * @function formatValue
   * Format the numeric value as a string.
   *
   * This is used after incrementing/decrementing the value to reformat the
   * value as a string.
   *
   * @param {number} value
   * @param {number} precision
   * @returns {number}
   */
  formatValue (value, precision) {
    return Number(value).toFixed(precision)
  }

  /**
   * The maximum allowable value of the `value` property.
   *
   * @type {number|null}
   * @default 1
   */
  get max () {
    return this[state].max
  }

  /**
   * The maximum allowable value of the `value` property.
   *
   * @type {number|null}
   * @default 1
   */
  set max (max) {
    this[setState]({
      max
    })
  }

  /**
   * The minimum allowable value of the `value` property.
   *
   * @type {number|null}
   * @default 1
   */
  get min () {
    return this[state].min
  }

  /**
   * @function set
   * @returns {void}
   */
  set min (min) {
    this[setState]({
      min
    })
  }

  /**
   * @function parseValue
   * @param {number} value
   * @param {number} precision
   * @returns {int}
   */
  parseValue (value, precision) {
    const parsed = precision === 0 ? parseInt(value) : parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  /**
   * @function stateEffects
   * @param {any} state
   * @param {any} changed
   * @returns {any}
   */
  [stateEffects] (state, changed) {
    const effects = super[stateEffects]
    // If step changed, calculate its precision (number of digits after
    // the decimal).
    if (changed.step) {
      const {
        step
      } = state
      const decimalRegex = /\.(\d)+$/
      const match = decimalRegex.exec(String(step))
      const precision = match && match[1] ? match[1].length : 0
      Object.assign(effects, {
        precision
      })
    }

    if (changed.max || changed.min || changed.value) {
      // The value is valid if it falls between the min and max.
      // TODO: We need a way to let other classes/mixins on the prototype chain
      // contribute to validity -- if someone else thinks the value is invalid,
      // we should respect that, even if the value falls within the min/max
      // bounds.
      const {
        max,
        min,
        precision,
        value
      } = state
      const parsed = parseInt(value, precision)
      if (value !== '' && isNaN(parsed)) {
        Object.assign(effects, {
          valid: false,
          validationMessage: 'Value must be a number'
        })
      } else if (!(max === null || parsed <= max)) {
        Object.assign(effects, {
          valid: false,
          validationMessage: `Value must be less than or equal to ${max}.`
        })
      } else if (!(min === null || parsed >= min)) {
        Object.assign(effects, {
          valid: false,
          validationMessage: `Value must be greater than or equal to ${min}.`
        })
      } else {
        Object.assign(effects, {
          valid: true,
          validationMessage: ''
        })
      }
      // We can only go up if we're below max.
      Object.assign(effects, {
        canGoUp: isNaN(parsed) || state.max === null || parsed <= state.max
      })

      // We can only go down if we're above min.
      Object.assign(effects, {
        canGoDown: isNaN(parsed) || state.min === null || parsed >= state.min
      })
    }

    return effects
  }

  /**
   * @function get
   * @returns {any}
   */
  get step () {
    return this[state].step
  }

  /**
   * @function set
   * @returns {void}
   */
  set step (step) {
    if (!isNaN(step)) {
      this[setState]({
        step
      })
    }
  }

  /**
   * @function stepDown
   * @returns {void}
   */
  stepDown () {
    super.stepDown()
    const {
      max,
      precision,
      value
    } = this[state]
    let result = this.parseValue(value, precision) - this.step
    if (max !== null) {
      result = Math.min(result, max)
    }
    const {
      min
    } = this[state]
    if (min === null || result >= min) {
      this.value = this.formatValue(result, precision)
    }
  }

  /**
   * @function stepUp
   * @returns {void}
   */
  stepUp () {
    super.stepUp()
    const {
      min,
      precision,
      value
    } = this[state]
    let result = this.parseValue(value, precision) + this.step
    if (min !== null) {
      result = Math.max(result, min)
    }
    const {
      max
    } = this[state]
    if (max === null || result <= max) {
      this.value = this.formatValue(result, precision)
    }
  }
}

export default NumberSpinBox
