var svgEditorExtension_xdomain_messaging = (function () {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /**
  * Should not be needed for same domain control (just call via child frame),
  *  but an API common for cross-domain and same domain use can be found
  *  in embedapi.js with a demo at embedapi.html.
  */
  var extXdomainMessaging = {
    name: 'xdomain-messaging',
    init: function init() {
      var svgEditor = this;
      var svgCanvas = svgEditor.canvas;

      try {
        window.addEventListener('message', function (e) {
          // We accept and post strings for the sake of IE9 support
          if (!e.data || !['string', 'object'].includes(_typeof(e.data)) || e.data.charAt() === '|') {
            return;
          }

          var data = _typeof(e.data) === 'object' ? e.data : JSON.parse(e.data);

          if (!data || _typeof(data) !== 'object' || data.namespace !== 'svgCanvas') {
            return;
          } // The default is not to allow any origins, including even the same domain or
          //  if run on a `file:///` URL. See `svgedit-config-es.js` for an example of how
          //  to configure


          var allowedOrigins = svgEditor.curConfig.allowedOrigins;

          if (!allowedOrigins.includes('*') && !allowedOrigins.includes(e.origin)) {
            console.log("Origin ".concat(e.origin, " not whitelisted for posting to ").concat(window.origin)); // eslint-disable-line no-console

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
            // Now that we know the origin is trusted, we perform otherwise
            //   unsafe arbitrary canvas method execution
            message.result = svgCanvas[name].apply(svgCanvas, _toConsumableArray(args)); // lgtm [js/remote-property-injection]
          } catch (err) {
            message.error = err.message;
          }

          e.source.postMessage(JSON.stringify(message), '*');
        });
      } catch (err) {
        console.log('Error with xdomain message listener: ' + err); // eslint-disable-line no-console
      }
    }
  };

  return extXdomainMessaging;

}());
