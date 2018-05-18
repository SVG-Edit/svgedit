/* eslint-disable no-var */
/* global $, Components, svgCanvas, netscape */
// Note: This JavaScript file must be included as the last script on the main HTML editor page to override the open/save handlers
$(function () {
  if (!window.Components) return;

  function mozFilePicker (readflag) {
    var fp = window.Components.classes['@mozilla.org/filepicker;1']
      .createInstance(Components.interfaces.nsIFilePicker);
    if (readflag) fp.init(window, 'Pick a SVG file', fp.modeOpen);
    else fp.init(window, 'Pick a SVG file', fp.modeSave);
    fp.defaultExtension = '*.svg';
    fp.show();
    return fp.file;
  }

  svgCanvas.setCustomHandlers({
    open: function () {
      try {
        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
        var file = mozFilePicker(true);
        if (!file) {
          return null;
        }

        var inputStream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
        inputStream.init(file, 0x01, parseInt('00004', 8), null);
        var sInputStream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
        sInputStream.init(inputStream);
        svgCanvas.setSvgString(sInputStream.read(sInputStream.available()));
      } catch (e) {
        console.log('Exception while attempting to load' + e);
      }
    },
    save: function (svg, str) {
      try {
        var file = mozFilePicker(false);
        if (!file) {
          return;
        }

        if (!file.exists()) {
          file.create(0, parseInt('0664', 8));
        }

        var out = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
        out.init(file, 0x20 | 0x02, parseInt('00004', 8), null);
        out.write(str, str.length);
        out.flush();
        out.close();
      } catch (e) {
        alert(e);
      }
    }
  });
});
