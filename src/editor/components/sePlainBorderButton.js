import { template } from 'elix/src/base/internal.js';
import { fragmentFrom } from 'elix/src/core/htmlLiterals.js';
import PlainButton from 'elix/src/plain/PlainButton.js';

/**
 * @class SePlainBorderButton
 * Button with a border in the Plain reference design system
 *
 * @inherits PlainButton
 */
class SePlainBorderButton extends PlainButton {
  /**
    * @function get
    * @returns {PlainObject}
  */
  get [template] () {
    const result = super[template];
    result.content.append(
      fragmentFrom.html`
        <style>
          [part~="button"] {
            background: #72797A;
            border: 1px solid #ccc;
          }
        </style>
      `
    );
    return result;
  }
}

export default SePlainBorderButton;
