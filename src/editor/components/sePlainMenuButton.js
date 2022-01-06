import PlainMenuButton from 'elix/src/plain/PlainMenuButton.js'
import { defaultState } from 'elix/src/base/internal.js'
import sePlainBorderButton from './sePlainBorderButton.js'

/**
 * @class ElixMenuButton
 */
export default class ElixMenuButton extends PlainMenuButton {
  /**
    * @function get
    * @returns {PlainObject}
  */
  get [defaultState] () {
    return Object.assign(super[defaultState], {
      sourcePartType: sePlainBorderButton
    })
  }
}

customElements.define('elix-menu-button', ElixMenuButton)
