/* globals svgEditor */
import ListComboBox from 'elix/define/ListComboBox.js'
import * as internal from 'elix/src/base/internal.js'
import { templateFrom, fragmentFrom } from 'elix/src/core/htmlLiterals.js'
import NumberSpinBox from '../dialogs/se-elix/define/NumberSpinBox.js'

/**
 * @class Dropdown
 */
class Zoom extends ListComboBox {
  /**
    * @function get
    * @returns {PlainObject}
    */
  get [internal.defaultState] () {
    return Object.assign(super[internal.defaultState], {
      inputPartType: NumberSpinBox,
      src: 'logo.svg',
      inputsize: '100%'
    })
  }

  /**
    * @function get
    * @returns {PlainObject}
  */
  get [internal.template] () {
    const result = super[internal.template]
    const source = result.content.getElementById('source')
    // add a icon before our dropdown
    source.prepend(fragmentFrom.html`
      <img src="zoom" alt="icon" width="18" height="18">
      </img>
      `.cloneNode(true))
    // change the style so it fits in our toolbar
    result.content.append(
      templateFrom.html`
        <style>
        [part~="source"] {
          grid-template-columns: 20px 1fr auto;
        }
        ::slotted(*) {
          padding: 4px;
          width: 100%;
        }
        [part~="popup"] {
          width: 150%;
        }
        elix-number-spin-box {
          background-color: var(--input-color);
          border-radius: 3px;
          height: 20px !important;
          margin-top: 1px;
        }
        elix-number-spin-box::part(spin-button) {
            padding: 0px;
        }

        </style>
      `.content
    )
    return result
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'src', 'inputsize', 'value']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue && name !== 'src') return
    switch (name) {
      case 'title':
      // this.$span.setAttribute('title', `${newValue} ${shortcut ? `[${shortcut}]` : ''}`);
        break
      case 'src':
        {
          const { imgPath } = svgEditor.configObj.curConfig
          this.src = imgPath + '/' + newValue
        }
        break
      case 'inputsize':
        this.inputsize = newValue
        break
      default:
        super.attributeChangedCallback(name, oldValue, newValue)
        break
    }
  }

  /**
    * @function [internal.render]
    * @param {PlainObject} changed
    * @returns {void}
    */
  [internal.render] (changed) {
    super[internal.render](changed)
    if (this[internal.firstRender]) {
      this.$img = this.shadowRoot.querySelector('img')
      this.$input = this.shadowRoot.getElementById('input')
    }
    if (changed.src) {
      this.$img.setAttribute('src', this[internal.state].src)
    }
    if (changed.inputsize) {
      this.$input.shadowRoot.querySelector('[part~="input"]').style.width = this[internal.state].inputsize
    }
    if (changed.inputPartType) {
      const self = this
      this.$input.setAttribute('step', '10')
      this.$input.setAttribute('min', '0')
      // Handle NumberSpinBox input.
      this.$input.addEventListener('change', function (e) {
        e.preventDefault()
        const value = e.detail?.value
        if (value) {
          const changeEvent = new CustomEvent('change', { detail: { value } })
          self.dispatchEvent(changeEvent)
        }
      })
      // Wire up handler on new input.
      this.addEventListener('close', (e) => {
        e.preventDefault()
        const value = e.detail?.closeResult?.getAttribute('value')
        if (value) {
          const closeEvent = new CustomEvent('change', { detail: { value } })
          this.dispatchEvent(closeEvent)
        }
      })
    }
  }

  /**
   * @function src
   * @returns {string} src
   */
  get src () {
    return this[internal.state].src
  }

  /**
   * @function src
   * @returns {void}
   */
  set src (src) {
    this[internal.setState]({ src })
  }

  /**
   * @function inputsize
   * @returns {string} src
   */
  get inputsize () {
    return this[internal.state].inputsize
  }

  /**
   * @function src
   * @returns {void}
   */
  set inputsize (inputsize) {
    this[internal.setState]({ inputsize })
  }

  /**
   * @function value
   * @returns {string} src
   */
  get value () {
    return this[internal.state].value
  }

  /**
   * @function value
   * @returns {void}
   */
  set value (value) {
    this[internal.setState]({ value })
  }
}

// Register
customElements.define('se-zoom', Zoom)
