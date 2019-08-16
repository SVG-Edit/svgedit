/**
 * @module jQueryPluginDBox
 */
/**
* @param {external:jQuery} $
* @param {PlainObject} [strings]
* @param {PlainObject} [strings.ok]
* @param {PlainObject} [strings.cancel]
* @returns {external:jQuery}
*/
export default function jQueryPluginDBox ($, strings = {ok: 'Ok', cancel: 'Cancel'}) {
  // This sets up alternative dialog boxes. They mostly work the same way as
  // their UI counterparts, expect instead of returning the result, a callback
  // needs to be included that returns the result as its first parameter.
  // In the future we may want to add additional types of dialog boxes, since
  // they should be easy to handle this way.
  $('#dialog_container').draggable({
    cancel: '#dialog_content, #dialog_buttons *',
    containment: 'window'
  }).css('position', 'absolute');

  const box = $('#dialog_box'),
    btnHolder = $('#dialog_buttons'),
    dialogContent = $('#dialog_content');

  /**
  * @typedef {PlainObject} module:jQueryPluginDBox.PromiseResultObject
  * @property {string|true} response
  * @property {boolean} checked
  */

  /**
  * Resolves to `false` (if cancelled), for prompts and selects
  * without checkboxes, it resolves to the value of the form control. For other
  * types without checkboxes, it resolves to `true`. For checkboxes, it resolves
  * to an object with the `response` key containing the same value as the previous
  * mentioned (string or `true`) and a `checked` (boolean) property.
  * @typedef {Promise<boolean|string|module:jQueryPluginDBox.PromiseResultObject>} module:jQueryPluginDBox.ResultPromise
  */
  /**
  * @typedef {PlainObject} module:jQueryPluginDBox.SelectOption
  * @property {string} text
  * @property {string} value
  */
  /**
  * @typedef {PlainObject} module:jQueryPluginDBox.CheckboxInfo
  * @property {string} label Label for the checkbox
  * @property {string} value Value of the checkbox
  * @property {string} tooltip Tooltip on the checkbox label
  * @property {boolean} checked Whether the checkbox is checked by default
  */
  /**
   * Triggered upon a change of value for the select pull-down.
   * @callback module:jQueryPluginDBox.SelectChangeListener
   * @returns {void}
   */
  /**
   * Creates a dialog of the specified type with a given message
   *  and any defaults and type-specific metadata. Returns a `Promise`
   *  which resolves differently depending on whether the dialog
   *  was cancelled or okayed (with the response and any checked state).
   * @param {"alert"|"prompt"|"select"|"process"} type
   * @param {string} msg
   * @param {string} [defaultVal]
   * @param {module:jQueryPluginDBox.SelectOption[]} [opts]
   * @param {module:jQueryPluginDBox.SelectChangeListener} [changeListener]
   * @param {module:jQueryPluginDBox.CheckboxInfo} [checkbox]
   * @returns {jQueryPluginDBox.ResultPromise}
  */
  function dbox (type, msg, defaultVal, opts, changeListener, checkbox) {
    dialogContent.html('<p>' + msg.replace(/\n/g, '</p><p>') + '</p>')
      .toggleClass('prompt', (type === 'prompt'));
    btnHolder.empty();

    const ok = $('<input type="button" data-ok="" value="' + strings.ok + '">').appendTo(btnHolder);

    return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
      if (type !== 'alert') {
        $('<input type="button" value="' + strings.cancel + '">')
          .appendTo(btnHolder)
          .click(function () {
            box.hide();
            resolve(false);
          });
      }

      let ctrl, chkbx;
      if (type === 'prompt') {
        ctrl = $('<input type="text">').prependTo(btnHolder);
        ctrl.val(defaultVal || '');
        ctrl.bind('keydown', 'return', function () { ok.click(); });
      } else if (type === 'select') {
        const div = $('<div style="text-align:center;">');
        ctrl = $(`<select aria-label="${msg}">`).appendTo(div);
        if (checkbox) {
          const label = $('<label>').text(checkbox.label);
          chkbx = $('<input type="checkbox">').appendTo(label);
          chkbx.val(checkbox.value);
          if (checkbox.tooltip) {
            label.attr('title', checkbox.tooltip);
          }
          chkbx.prop('checked', Boolean(checkbox.checked));
          div.append($('<div>').append(label));
        }
        $.each(opts || [], function (opt, val) {
          if (typeof val === 'object') {
            ctrl.append($('<option>').val(val.value).html(val.text));
          } else {
            ctrl.append($('<option>').html(val));
          }
        });
        dialogContent.append(div);
        if (defaultVal) {
          ctrl.val(defaultVal);
        }
        if (changeListener) {
          ctrl.bind('change', 'return', changeListener);
        }
        ctrl.bind('keydown', 'return', function () { ok.click(); });
      } else if (type === 'process') {
        ok.hide();
      }

      box.show();

      ok.click(function () {
        box.hide();
        const response = (type === 'prompt' || type === 'select') ? ctrl.val() : true;
        if (chkbx) {
          resolve({response, checked: chkbx.prop('checked')});
          return;
        }
        resolve(response);
      }).focus();

      if (type === 'prompt' || type === 'select') {
        ctrl.focus();
      }
    });
  }

  /**
  * @param {string} msg Message to alert
  * @returns {jQueryPluginDBox.ResultPromise}
  */
  $.alert = function (msg) {
    return dbox('alert', msg);
  };
  /**
  * @param {string} msg Message for which to ask confirmation
  * @returns {jQueryPluginDBox.ResultPromise}
  */
  $.confirm = function (msg) {
    return dbox('confirm', msg);
  };
  /**
  * @param {string} msg Message to indicate upon cancelable indicator
  * @returns {jQueryPluginDBox.ResultPromise}
  */
  $.process_cancel = function (msg) {
    return dbox('process', msg);
  };
  /**
  * @param {string} msg Message to accompany the prompt
  * @param {string} [defaultText=''] The default text to show for the prompt
  * @returns {jQueryPluginDBox.ResultPromise}
  */
  $.prompt = function (msg, defaultText = '') {
    return dbox('prompt', msg, defaultText);
  };
  $.select = function (msg, opts, changeListener, txt, checkbox) {
    return dbox('select', msg, txt, opts, changeListener, checkbox);
  };
  return $;
}
