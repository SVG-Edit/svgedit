var svgEditorExtension_xdomain_messaging = (function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /**
  * Should not be needed for same domain control (just call via child frame),
  *  but an API common for cross-domain and same domain use can be found
  *  in embedapi.js with a demo at embedapi.html
  */
  var extXdomainMessaging = {
    name: 'xdomain-messaging',
    init: function init() {
      var svgEditor = this;
      var svgCanvas = svgEditor.canvas;
      try {
        window.addEventListener('message', function (e) {
          // We accept and post strings for the sake of IE9 support
          if (typeof e.data !== 'string' || e.data.charAt() === '|') {
            return;
          }
          var data = JSON.parse(e.data);
          if (!data || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || data.namespace !== 'svgCanvas') {
            return;
          }
          // The default is not to allow any origins, including even the same domain or if run on a file:// URL
          //  See config-sample.js for an example of how to configure
          var allowedOrigins = svgEditor.curConfig.allowedOrigins;

          if (!allowedOrigins.includes('*') && !allowedOrigins.includes(e.origin)) {
            return;
          }
          var cbid = data.id;
          var name = data.name,
              args = data.args;

          var message = {
            namespace: 'svg-edit',
            id: cbid
          };
          try {
            message.result = svgCanvas[name].apply(svgCanvas, args);
          } catch (err) {
            message.error = err.message;
          }
          e.source.postMessage(JSON.stringify(message), '*');
        }, false);
      } catch (err) {
        console.log('Error with xdomain message listener: ' + err);
      }
    }
  };

  return extXdomainMessaging;

}());
