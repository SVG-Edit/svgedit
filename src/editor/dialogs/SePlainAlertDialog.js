import PlainAlertDialog from 'elix/src/plain/PlainAlertDialog.js'
import { template } from 'elix/src/base/internal.js'
import { fragmentFrom } from 'elix/src/core/htmlLiterals.js'

/**
 * @class SePlainAlertDialog
 */
export default class SePlainAlertDialog extends PlainAlertDialog {
  /**
    * @function get
    * @returns {PlainObject}
  */
  get [template] () {
    const result = super[template]
    // Replace the default slot with a new default slot and a button container.
    const defaultSlot = result.content.querySelector('#frameContent')
    if (defaultSlot) {
      defaultSlot.replaceWith(fragmentFrom.html`
        <div id="alertDialogContent">
          <div id="se-content-alert">
            <slot></slot>
          </div>
          <div id="choiceButtonContainer" part="choice-button-container"></div>
        </div>
      `)
    }
    result.content.append(
      fragmentFrom.html`
        <style>
          [part~="frame"] {
            padding: 1em;
            background: #CCC;
            width: 300px;
            border: 1px outset #777;
            font-size: 0.8em;
            font-family: Verdana,Helvetica,sans-serif;
            border-radius: 5px;
            -moz-border-radius: 5px;
            -webkit-border-radius: 5px;
          }

          [part~="choice-button-container"] {
            margin-top: 1em;
            text-align: center;
          }

          [part~="choice-button"]:not(:first-child) {
            margin-left: 0.5em;
          }
          #se-content-alert{
            height: 95px;
            background: #DDD;
            overflow: auto;
            text-align: left;
            border: 1px solid #5a6162;
            padding: 1em;
            border-radius: 5px;
            -moz-border-radius: 5px;
            -webkit-border-radius: 5px;
          }
        </style>
      `
    )
    return result
  }
}

customElements.define('se-elix-alert-dialog', SePlainAlertDialog)
