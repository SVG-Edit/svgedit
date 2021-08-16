import PlainNumberSpinBox from '../src/plain/PlainNumberSpinBox.js';
import {
  stateEffects
} from 'elix/src/base/internal.js';
/**
 * @class ElixNumberSpinBox
 */
// export default class ElixNumberSpinBox extends PlainNumberSpinBox {}

export default class ElixNumberSpinBox extends PlainNumberSpinBox {
  [stateEffects](state, changed) {
    const effects = super[stateEffects];
    if(changed.value && state.value !== "" && this.value !== undefined) {
      const event = new CustomEvent('onchange', { detail: state.value });
      this.dispatchEvent(event);
    }
    return effects;
  }
}

customElements.define('elix-number-spin-box', ElixNumberSpinBox);
