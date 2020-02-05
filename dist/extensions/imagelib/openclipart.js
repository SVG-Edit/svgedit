(function () {
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

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits$1(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf$1(subClass, superClass);
  }

  function _getPrototypeOf$1(o) {
    _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf$1(o);
  }

  function _setPrototypeOf$1(o, p) {
    _setPrototypeOf$1 = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf$1(o, p);
  }

  function isNativeReflectConstruct$1() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct$1(Parent, args, Class) {
    if (isNativeReflectConstruct$1()) {
      _construct$1 = Reflect.construct;
    } else {
      _construct$1 = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf$1(instance, Class.prototype);
        return instance;
      };
    }

    return _construct$1.apply(null, arguments);
  }

  function _isNativeFunction$1(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper$1(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper$1 = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction$1(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct$1(Class, arguments, _getPrototypeOf$1(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf$1(Wrapper, Class);
    };

    return _wrapNativeSuper$1(Class);
  }

  function _assertThisInitialized$1(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn$1(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized$1(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf$1(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _nonIterableRest$1();
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit$1(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
  /*
  Possible todos:
  0. Add XSLT to JML-string stylesheet (or even vice versa)
  0. IE problem: Add JsonML code to handle name attribute (during element creation)
  0. Element-specific: IE object-param handling

  Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js

  0. duplicate attributes?
  0. expand ATTR_MAP
  0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
  0. More validation?
  0. JsonML DOM Level 0 listener
  0. Whitespace trimming?

  JsonML element-specific:
  0. table appending
  0. canHaveChildren necessary? (attempts to append to script and img)

  Other Todos:
  0. Note to self: Integrate research from other jml notes
  0. Allow Jamilih to be seeded with an existing element, so as to be able to add/modify attributes and children
  0. Allow array as single first argument
  0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
  0. Allow building of generic XML (pass configuration object)
  0. Allow building content internally as a string (though allowing DOM methods, etc.?)
  0. Support JsonML empty string element name to represent fragments?
  0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
  */
  // istanbul ignore next


  var win = typeof window !== 'undefined' && window; // istanbul ignore next

  var doc = typeof document !== 'undefined' && document || win && win.document; // STATIC PROPERTIES

  var possibleOptions = ['$plugins', // '$mode', // Todo (SVG/XML)
  // '$state', // Used internally
  '$map' // Add any other options here
  ];
  var NS_HTML = 'http://www.w3.org/1999/xhtml',
      hyphenForCamelCase = /\x2D([a-z])/g;
  var ATTR_MAP = {
    readonly: 'readOnly'
  }; // We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
  // We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
  //   (e.g., from an empty variable) on templates to have no effect

  var BOOL_ATTS = ['checked', 'defaultChecked', 'defaultSelected', 'disabled', 'indeterminate', 'open', // Dialog elements
  'readOnly', 'selected']; // From JsonML

  var ATTR_DOM = BOOL_ATTS.concat(['accessKey', // HTMLElement
  'async', 'autocapitalize', // HTMLElement
  'autofocus', 'contentEditable', // HTMLElement through ElementContentEditable
  'defaultValue', 'defer', 'draggable', // HTMLElement
  'formnovalidate', 'hidden', // HTMLElement
  'innerText', // HTMLElement
  'inputMode', // HTMLElement through ElementContentEditable
  'ismap', 'multiple', 'novalidate', 'pattern', 'required', 'spellcheck', // HTMLElement
  'translate', // HTMLElement
  'value', 'willvalidate']); // Todo: Add more to this as useful for templating
  //   to avoid setting through nullish value

  var NULLABLES = ['autocomplete', 'dir', // HTMLElement
  'integrity', // script, link
  'lang', // HTMLElement
  'max', 'min', 'title' // HTMLElement
  ];

  var $ = function $(sel) {
    return doc.querySelector(sel);
  };
  /**
  * Retrieve the (lower-cased) HTML name of a node.
  * @static
  * @param {Node} node The HTML node
  * @returns {string} The lower-cased node name
  */


  function _getHTMLNodeName(node) {
    return node.nodeName && node.nodeName.toLowerCase();
  }
  /**
  * Apply styles if this is a style tag.
  * @static
  * @param {Node} node The element to check whether it is a style tag
  * @returns {void}
  */


  function _applyAnyStylesheet(node) {
    // Only used in IE
    // istanbul ignore else
    if (!doc.createStyleSheet) {
      return;
    } // istanbul ignore next


    if (_getHTMLNodeName(node) === 'style') {
      // IE
      var ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful

      ss.cssText = node.cssText; // We continue to add the style tag, however
    }
  }
  /**
   * Need this function for IE since options weren't otherwise getting added.
   * @private
   * @static
   * @param {Element} parent The parent to which to append the element
   * @param {Node} child The element or other node to append to the parent
   * @returns {void}
   */


  function _appendNode(parent, child) {
    var parentName = _getHTMLNodeName(parent); // IE only
    // istanbul ignore if


    if (doc.createStyleSheet) {
      if (parentName === 'script') {
        parent.text = child.nodeValue;
        return;
      }

      if (parentName === 'style') {
        parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents

        return;
      }
    }

    if (parentName === 'template') {
      parent.content.append(child);
      return;
    }

    try {
      parent.append(child); // IE9 is now ok with this
    } catch (e) {
      // istanbul ignore next
      var childName = _getHTMLNodeName(child); // istanbul ignore next


      if (parentName === 'select' && childName === 'option') {
        try {
          // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
          parent.add(child);
        } catch (err) {
          // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
          parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
        }

        return;
      } // istanbul ignore next


      throw e;
    }
  }
  /**
   * Attach event in a cross-browser fashion.
   * @static
   * @param {Element} el DOM element to which to attach the event
   * @param {string} type The DOM event (without 'on') to attach to the element
   * @param {EventListener} handler The event handler to attach to the element
   * @param {boolean} [capturing] Whether or not the event should be
   *   capturing (W3C-browsers only); default is false; NOT IN USE
   * @returns {void}
   */


  function _addEvent(el, type, handler, capturing) {
    el.addEventListener(type, handler, Boolean(capturing));
  }
  /**
  * Creates a text node of the result of resolving an entity or character reference.
  * @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
  * @param {string} prefix Text to prefix immediately after the "&"
  * @param {string} arg The body of the reference
  * @returns {Text} The text node of the resolved reference
  */


  function _createSafeReference(type, prefix, arg) {
    // For security reasons related to innerHTML, we ensure this string only
    //  contains potential entity characters
    if (!arg.match(/^[0-9A-Z_a-z]+$/)) {
      throw new TypeError('Bad ' + type);
    }

    var elContainer = doc.createElement('div'); // Todo: No workaround for XML?
    // eslint-disable-next-line no-unsanitized/property

    elContainer.innerHTML = '&' + prefix + arg + ';';
    return doc.createTextNode(elContainer.innerHTML);
  }
  /**
  * @param {string} n0 Whole expression match (including "-")
  * @param {string} n1 Lower-case letter match
  * @returns {string} Uppercased letter
  */


  function _upperCase(n0, n1) {
    return n1.toUpperCase();
  } // Todo: Make as public utility

  /**
   * @param {any} o
   * @returns {boolean}
   */


  function _isNullish(o) {
    return o === null || o === undefined;
  } // Todo: Make as public utility, but also return types for undefined, boolean, number, document, etc.

  /**
  * @private
  * @static
  * @param {string|JamilihAttributes|JamilihArray|Element|DocumentFragment} item
  * @returns {"string"|"null"|"array"|"element"|"fragment"|"object"|"symbol"|"function"|"number"|"boolean"}
  */


  function _getType(item) {
    var type = _typeof$1(item);

    switch (type) {
      case 'object':
        if (item === null) {
          return 'null';
        }

        if (Array.isArray(item)) {
          return 'array';
        }

        if ('nodeType' in item) {
          switch (item.nodeType) {
            case 1:
              return 'element';

            case 9:
              return 'document';

            case 11:
              return 'fragment';

            default:
              return 'non-container node';
          }
        }

      // Fallthrough

      default:
        return type;
    }
  }
  /**
  * @private
  * @static
  * @param {DocumentFragment} frag
  * @param {Node} node
  * @returns {DocumentFragment}
  */


  function _fragReducer(frag, node) {
    frag.append(node);
    return frag;
  }
  /**
  * @private
  * @static
  * @param {Object<{string:string}>} xmlnsObj
  * @returns {string}
  */


  function _replaceDefiner(xmlnsObj) {
    return function (n0) {
      var retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0; // Preserve XHTML

      for (var _i = 0, _Object$entries = Object.entries(xmlnsObj); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray$1(_Object$entries[_i], 2),
            ns = _Object$entries$_i[0],
            xmlnsVal = _Object$entries$_i[1];

        if (ns !== '') {
          retStr += ' xmlns:' + ns + '="' + xmlnsVal + '"';
        }
      }

      return retStr;
    };
  }
  /**
  * @typedef {JamilihAttributes} AttributeArray
  * @property {string} 0 The key
  * @property {string} 1 The value
  */

  /**
  * @callback ChildrenToJMLCallback
  * @param {JamilihArray|Jamilih} childNodeJML
  * @param {Integer} i
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {ChildrenToJMLCallback}
  */


  function _childrenToJML(node) {
    return function (childNodeJML, i) {
      var cn = node.childNodes[i];
      var j = Array.isArray(childNodeJML) ? jml.apply(void 0, _toConsumableArray$1(childNodeJML)) : jml(childNodeJML);
      cn.replaceWith(j);
    };
  }
  /**
  * @callback JamilihAppender
  * @param {JamilihArray} childJML
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {JamilihAppender}
  */


  function _appendJML(node) {
    return function (childJML) {
      if (Array.isArray(childJML)) {
        node.append(jml.apply(void 0, _toConsumableArray$1(childJML)));
      } else {
        node.append(jml(childJML));
      }
    };
  }
  /**
  * @callback appender
  * @param {string|JamilihArray} childJML
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {appender}
  */


  function _appendJMLOrText(node) {
    return function (childJML) {
      if (typeof childJML === 'string') {
        node.append(childJML);
      } else if (Array.isArray(childJML)) {
        node.append(jml.apply(void 0, _toConsumableArray$1(childJML)));
      } else {
        node.append(jml(childJML));
      }
    };
  }
  /**
  * @private
  * @static
  */

  /*
  function _DOMfromJMLOrString (childNodeJML) {
    if (typeof childNodeJML === 'string') {
      return doc.createTextNode(childNodeJML);
    }
    return jml(...childNodeJML);
  }
  */

  /**
  * @typedef {Element|DocumentFragment} JamilihReturn
  */

  /**
  * @typedef {PlainObject<string, string>} JamilihAttributes
  */

  /**
  * @typedef {GenericArray} JamilihArray
  * @property {string} 0 The element to create (by lower-case name)
  * @property {JamilihAttributes} [1] Attributes to add with the key as the
  *   attribute name and value as the attribute value; important for IE where
  *   the input element's type cannot be added later after already added to the page
  * @param {Element[]} [children] The optional children of this element
  *   (but raw DOM elements required to be specified within arrays since
  *   could not otherwise be distinguished from siblings being added)
  * @param {Element} [parent] The optional parent to which to attach the element
  *   (always the last unless followed by null, in which case it is the
  *   second-to-last)
  * @param {null} [returning] Can use null to indicate an array of elements
  *   should be returned
  */

  /**
  * @typedef {PlainObject} JamilihOptions
  * @property {"root"|"attributeValue"|"fragment"|"children"|"fragmentChildren"} $state
  */

  /**
   * @param {Element} elem
   * @param {string} att
   * @param {string} attVal
   * @param {JamilihOptions} opts
   * @returns {void}
   */


  function checkPluginValue(elem, att, attVal, opts) {
    opts.$state = 'attributeValue';

    if (attVal && _typeof$1(attVal) === 'object') {
      var matchingPlugin = getMatchingPlugin(opts, Object.keys(attVal)[0]);

      if (matchingPlugin) {
        return matchingPlugin.set({
          opts: opts,
          element: elem,
          attribute: {
            name: att,
            value: attVal
          }
        });
      }
    }

    return attVal;
  }
  /**
   * @param {JamilihOptions} opts
   * @param {string} item
   * @returns {JamilihPlugin}
   */


  function getMatchingPlugin(opts, item) {
    return opts.$plugins && opts.$plugins.find(function (p) {
      return p.name === item;
    });
  }
  /**
   * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers
   * that support); any element after element can be omitted, and any subsequent
   * type or types added afterwards.
   * @param {...JamilihArray} args
   * @returns {JamilihReturn} The newly created (and possibly already appended)
   *   element or array of elements
   */


  var jml = function jml() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var elem = doc.createDocumentFragment();
    /**
     *
     * @param {Object<{string: string}>} atts
     * @returns {void}
     */

    function _checkAtts(atts) {
      for (var _i2 = 0, _Object$entries2 = Object.entries(atts); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray$1(_Object$entries2[_i2], 2),
            att = _Object$entries2$_i[0],
            attVal = _Object$entries2$_i[1];

        att = att in ATTR_MAP ? ATTR_MAP[att] : att;

        if (NULLABLES.includes(att)) {
          attVal = checkPluginValue(elem, att, attVal, opts);

          if (!_isNullish(attVal)) {
            elem[att] = attVal;
          }

          continue;
        } else if (ATTR_DOM.includes(att)) {
          attVal = checkPluginValue(elem, att, attVal, opts);
          elem[att] = attVal;
          continue;
        }

        switch (att) {
          /*
          Todos:
          0. JSON mode to prevent event addition
           0. {$xmlDocument: []} // doc.implementation.createDocument
           0. Accept array for any attribute with first item as prefix and second as value?
          0. {$: ['xhtml', 'div']} for prefixed elements
            case '$': // Element with prefix?
              nodes[nodes.length] = elem = doc.createElementNS(attVal[0], attVal[1]);
              break;
          */
          case '#':
            {
              // Document fragment
              opts.$state = 'fragmentChilden';
              nodes[nodes.length] = jml(opts, attVal);
              break;
            }

          case '$shadow':
            {
              var _attVal = attVal,
                  open = _attVal.open,
                  closed = _attVal.closed;
              var _attVal2 = attVal,
                  content = _attVal2.content,
                  template = _attVal2.template;
              var shadowRoot = elem.attachShadow({
                mode: closed || open === false ? 'closed' : 'open'
              });

              if (template) {
                if (Array.isArray(template)) {
                  if (_getType(template[0]) === 'object') {
                    // Has attributes
                    template = jml.apply(void 0, ['template'].concat(_toConsumableArray$1(template), [doc.body]));
                  } else {
                    // Array is for the children
                    template = jml('template', template, doc.body);
                  }
                } else if (typeof template === 'string') {
                  template = $(template);
                }

                jml(template.content.cloneNode(true), shadowRoot);
              } else {
                if (!content) {
                  content = open || closed;
                }

                if (content && typeof content !== 'boolean') {
                  if (Array.isArray(content)) {
                    jml({
                      '#': content
                    }, shadowRoot);
                  } else {
                    jml(content, shadowRoot);
                  }
                }
              }

              break;
            }

          case '$state':
            {
              // Handled internally
              break;
            }

          case 'is':
            {
              // Currently only in Chrome
              // Handled during element creation
              break;
            }

          case '$custom':
            {
              Object.assign(elem, attVal);
              break;
            }

          /* istanbul ignore next */

          case '$define':
            {
              var _ret = function () {
                var localName = elem.localName.toLowerCase(); // Note: customized built-ins sadly not working yet

                var customizedBuiltIn = !localName.includes('-'); // We check attribute in case this is a preexisting DOM element
                // const {is} = atts;

                var is = void 0;

                if (customizedBuiltIn) {
                  is = elem.getAttribute('is');

                  if (!is) {
                    if (!{}.hasOwnProperty.call(atts, 'is')) {
                      throw new TypeError('Expected `is` with `$define` on built-in');
                    }

                    atts.is = checkPluginValue(elem, 'is', atts.is, opts);
                    elem.setAttribute('is', atts.is);
                    is = atts.is;
                  }
                }

                var def = customizedBuiltIn ? is : localName;

                if (customElements.get(def)) {
                  return "break";
                }

                var getConstructor = function getConstructor(cnstrct) {
                  var baseClass = options && options["extends"] ? doc.createElement(options["extends"]).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : HTMLElement;
                  /**
                   * Class wrapping base class.
                   */

                  return cnstrct ?
                  /*#__PURE__*/
                  function (_baseClass) {
                    _inherits$1(_class, _baseClass);
                    /**
                     * Calls user constructor.
                     */


                    function _class() {
                      var _this;

                      _classCallCheck$1(this, _class);

                      _this = _possibleConstructorReturn$1(this, _getPrototypeOf$1(_class).call(this));
                      cnstrct.call(_assertThisInitialized$1(_this));
                      return _this;
                    }

                    return _class;
                  }(baseClass) :
                  /*#__PURE__*/
                  function (_baseClass2) {
                    _inherits$1(_class2, _baseClass2);

                    function _class2() {
                      _classCallCheck$1(this, _class2);

                      return _possibleConstructorReturn$1(this, _getPrototypeOf$1(_class2).apply(this, arguments));
                    }

                    return _class2;
                  }(baseClass);
                };

                var cnstrctr = void 0,
                    options = void 0,
                    mixin = void 0;

                if (Array.isArray(attVal)) {
                  if (attVal.length <= 2) {
                    var _attVal3 = attVal;

                    var _attVal4 = _slicedToArray$1(_attVal3, 2);

                    cnstrctr = _attVal4[0];
                    options = _attVal4[1];

                    if (typeof options === 'string') {
                      // Todo: Allow creating a definition without using it;
                      //  that may be the only reason to have a string here which
                      //  differs from the `localName` anyways
                      options = {
                        "extends": options
                      };
                    } else if (options && !{}.hasOwnProperty.call(options, 'extends')) {
                      mixin = options;
                    }

                    if (_typeof$1(cnstrctr) === 'object') {
                      mixin = cnstrctr;
                      cnstrctr = getConstructor();
                    }
                  } else {
                    var _attVal5 = attVal;

                    var _attVal6 = _slicedToArray$1(_attVal5, 3);

                    cnstrctr = _attVal6[0];
                    mixin = _attVal6[1];
                    options = _attVal6[2];

                    if (typeof options === 'string') {
                      options = {
                        "extends": options
                      };
                    }
                  }
                } else if (typeof attVal === 'function') {
                  cnstrctr = attVal;
                } else {
                  mixin = attVal;
                  cnstrctr = getConstructor();
                }

                if (!cnstrctr.toString().startsWith('class')) {
                  cnstrctr = getConstructor(cnstrctr);
                }

                if (!options && customizedBuiltIn) {
                  options = {
                    "extends": localName
                  };
                }

                if (mixin) {
                  Object.entries(mixin).forEach(function (_ref) {
                    var _ref2 = _slicedToArray$1(_ref, 2),
                        methodName = _ref2[0],
                        method = _ref2[1];

                    cnstrctr.prototype[methodName] = method;
                  });
                } // console.log('def', def, '::', typeof options === 'object' ? options : undefined);


                customElements.define(def, cnstrctr, _typeof$1(options) === 'object' ? options : undefined);
                return "break";
              }();

              if (_ret === "break") break;
            }

          case '$symbol':
            {
              var _attVal7 = attVal,
                  _attVal8 = _slicedToArray$1(_attVal7, 2),
                  symbol = _attVal8[0],
                  func = _attVal8[1];

              if (typeof func === 'function') {
                var funcBound = func.bind(elem);

                if (typeof symbol === 'string') {
                  elem[Symbol["for"](symbol)] = funcBound;
                } else {
                  elem[symbol] = funcBound;
                }
              } else {
                var obj = func;
                obj.elem = elem;

                if (typeof symbol === 'string') {
                  elem[Symbol["for"](symbol)] = obj;
                } else {
                  elem[symbol] = obj;
                }
              }

              break;
            }

          case '$data':
            {
              setMap(attVal);
              break;
            }

          case '$attribute':
            {
              // Attribute node
              var node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
              node.value = attVal[attVal.length - 1];
              nodes[nodes.length] = node;
              break;
            }

          case '$text':
            {
              // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
              var _node = doc.createTextNode(attVal);

              nodes[nodes.length] = _node;
              break;
            }

          case '$document':
            {
              // Todo: Conditionally create XML document
              var _node2 = doc.implementation.createHTMLDocument();

              if (attVal.childNodes) {
                // Remove any extra nodes created by createHTMLDocument().
                var j = attVal.childNodes.length;

                while (_node2.childNodes[j]) {
                  var cn = _node2.childNodes[j];
                  cn.remove(); // `j` should stay the same as removing will cause node to be present
                } // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


                attVal.childNodes.forEach(_childrenToJML(_node2));
              } else {
                if (attVal.$DOCTYPE) {
                  var dt = {
                    $DOCTYPE: attVal.$DOCTYPE
                  };
                  var doctype = jml(dt);

                  _node2.firstChild.replaceWith(doctype);
                }

                var html = _node2.childNodes[1];
                var head = html.childNodes[0];
                var _body = html.childNodes[1];

                if (attVal.title || attVal.head) {
                  var meta = doc.createElement('meta');
                  meta.setAttribute('charset', 'utf-8');
                  head.append(meta);

                  if (attVal.title) {
                    _node2.title = attVal.title; // Appends after meta
                  }

                  if (attVal.head) {
                    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                    attVal.head.forEach(_appendJML(head));
                  }
                }

                if (attVal.body) {
                  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                  attVal.body.forEach(_appendJMLOrText(_body));
                }
              }

              nodes[nodes.length] = _node2;
              break;
            }

          case '$DOCTYPE':
            {
              var _node3 = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');

              nodes[nodes.length] = _node3;
              break;
            }

          case '$on':
            {
              // Events
              for (var _i3 = 0, _Object$entries3 = Object.entries(attVal); _i3 < _Object$entries3.length; _i3++) {
                var _Object$entries3$_i = _slicedToArray$1(_Object$entries3[_i3], 2),
                    p2 = _Object$entries3$_i[0],
                    val = _Object$entries3$_i[1];

                if (typeof val === 'function') {
                  val = [val, false];
                }

                if (typeof val[0] !== 'function') {
                  throw new TypeError('Expect a function for `$on`');
                }

                _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing

              }

              break;
            }

          case 'className':
          case 'class':
            attVal = checkPluginValue(elem, att, attVal, opts);

            if (!_isNullish(attVal)) {
              elem.className = attVal;
            }

            break;

          case 'dataset':
            {
              var _ret2 = function () {
                // Map can be keyed with hyphenated or camel-cased properties
                var recurse = function recurse(atVal, startProp) {
                  var prop = '';
                  var pastInitialProp = startProp !== '';
                  Object.keys(atVal).forEach(function (key) {
                    var value = atVal[key];

                    if (pastInitialProp) {
                      prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/, _upperCase);
                    } else {
                      prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                    }

                    if (value === null || _typeof$1(value) !== 'object') {
                      if (!_isNullish(value)) {
                        elem.dataset[prop] = value;
                      }

                      prop = startProp;
                      return;
                    }

                    recurse(value, prop);
                  });
                };

                recurse(attVal, '');
                return "break"; // Todo: Disable this by default unless configuration explicitly allows (for security)
              }();

              if (_ret2 === "break") break;
            }
          // #if IS_REMOVE
          // Don't remove this `if` block (for sake of no-innerHTML build)

          case 'innerHTML':
            if (!_isNullish(attVal)) {
              // eslint-disable-next-line no-unsanitized/property
              elem.innerHTML = attVal;
            }

            break;
          // #endif

          case 'htmlFor':
          case 'for':
            if (elStr === 'label') {
              attVal = checkPluginValue(elem, att, attVal, opts);

              if (!_isNullish(attVal)) {
                elem.htmlFor = attVal;
              }

              break;
            }

            attVal = checkPluginValue(elem, att, attVal, opts);
            elem.setAttribute(att, attVal);
            break;

          case 'xmlns':
            // Already handled
            break;

          default:
            {
              if (att.startsWith('on')) {
                attVal = checkPluginValue(elem, att, attVal, opts);
                elem[att] = attVal; // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event

                break;
              }

              if (att === 'style') {
                attVal = checkPluginValue(elem, att, attVal, opts);

                if (_isNullish(attVal)) {
                  break;
                }

                if (_typeof$1(attVal) === 'object') {
                  for (var _i4 = 0, _Object$entries4 = Object.entries(attVal); _i4 < _Object$entries4.length; _i4++) {
                    var _Object$entries4$_i = _slicedToArray$1(_Object$entries4[_i4], 2),
                        _p = _Object$entries4$_i[0],
                        styleVal = _Object$entries4$_i[1];

                    if (!_isNullish(styleVal)) {
                      // Todo: Handle aggregate properties like "border"
                      if (_p === 'float') {
                        elem.style.cssFloat = styleVal;
                        elem.style.styleFloat = styleVal; // Harmless though we could make conditional on older IE instead
                      } else {
                        elem.style[_p.replace(hyphenForCamelCase, _upperCase)] = styleVal;
                      }
                    }
                  }

                  break;
                } // setAttribute unfortunately erases any existing styles


                elem.setAttribute(att, attVal);
                /*
                // The following reorders which is troublesome for serialization, e.g., as used in our testing
                if (elem.style.cssText !== undefined) {
                  elem.style.cssText += attVal;
                } else { // Opera
                  elem.style += attVal;
                }
                */

                break;
              }

              var matchingPlugin = getMatchingPlugin(opts, att);

              if (matchingPlugin) {
                matchingPlugin.set({
                  opts: opts,
                  element: elem,
                  attribute: {
                    name: att,
                    value: attVal
                  }
                });
                break;
              }

              attVal = checkPluginValue(elem, att, attVal, opts);
              elem.setAttribute(att, attVal);
              break;
            }
        }
      }
    }

    var nodes = [];
    var elStr;
    var opts;
    var isRoot = false;

    if (_getType(args[0]) === 'object' && Object.keys(args[0]).some(function (key) {
      return possibleOptions.includes(key);
    })) {
      opts = args[0];

      if (opts.$state === undefined) {
        isRoot = true;
        opts.$state = 'root';
      }

      if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
        opts.$map = {
          root: opts.$map
        };
      }

      if ('$plugins' in opts) {
        if (!Array.isArray(opts.$plugins)) {
          throw new TypeError('$plugins must be an array');
        }

        opts.$plugins.forEach(function (pluginObj) {
          if (!pluginObj || _typeof$1(pluginObj) !== 'object') {
            throw new TypeError('Plugin must be an object');
          }

          if (!pluginObj.name || !pluginObj.name.startsWith('$_')) {
            throw new TypeError('Plugin object name must be present and begin with `$_`');
          }

          if (typeof pluginObj.set !== 'function') {
            throw new TypeError('Plugin object must have a `set` method');
          }
        });
      }

      args = args.slice(1);
    } else {
      opts = {
        $state: undefined
      };
    }

    var argc = args.length;
    var defaultMap = opts.$map && opts.$map.root;

    var setMap = function setMap(dataVal) {
      var map, obj; // Boolean indicating use of default map and object

      if (dataVal === true) {
        var _defaultMap = _slicedToArray$1(defaultMap, 2);

        map = _defaultMap[0];
        obj = _defaultMap[1];
      } else if (Array.isArray(dataVal)) {
        // Array of strings mapping to default
        if (typeof dataVal[0] === 'string') {
          dataVal.forEach(function (dVal) {
            setMap(opts.$map[dVal]);
          });
          return; // Array of Map and non-map data object
        }

        map = dataVal[0] || defaultMap[0];
        obj = dataVal[1] || defaultMap[1]; // Map
      } else if (/^\[object (?:Weak)?Map\]$/.test([].toString.call(dataVal))) {
        map = dataVal;
        obj = defaultMap[1]; // Non-map data object
      } else {
        map = defaultMap[0];
        obj = dataVal;
      }

      map.set(elem, obj);
    };

    for (var i = 0; i < argc; i++) {
      var arg = args[i];

      var type = _getType(arg);

      switch (type) {
        default:
          throw new TypeError('Unexpected type: ' + type);

        case 'null':
          // null always indicates a place-holder (only needed for last argument if want array returned)
          if (i === argc - 1) {
            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
            // Todo: Fix to allow application of stylesheets of style tags within fragments?


            return nodes.length <= 1 ? nodes[0] // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
            : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
          }

          throw new TypeError('`null` values not allowed except as final Jamilih argument');

        case 'string':
          // Strings normally indicate elements
          switch (arg) {
            case '!':
              nodes[nodes.length] = doc.createComment(args[++i]);
              break;

            case '?':
              {
                arg = args[++i];
                var procValue = args[++i];
                var val = procValue;

                if (val && _typeof$1(val) === 'object') {
                  procValue = [];

                  for (var _i5 = 0, _Object$entries5 = Object.entries(val); _i5 < _Object$entries5.length; _i5++) {
                    var _Object$entries5$_i = _slicedToArray$1(_Object$entries5[_i5], 2),
                        p = _Object$entries5$_i[0],
                        procInstVal = _Object$entries5$_i[1];

                    procValue.push(p + '=' + '"' + // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                    procInstVal.replace(/"/g, '&quot;') + '"');
                  }

                  procValue = procValue.join(' ');
                } // Firefox allows instructions with ">" in this method, but not if placed directly!


                try {
                  nodes[nodes.length] = doc.createProcessingInstruction(arg, procValue);
                } catch (e) {
                  // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                  // innerHTML didn't work
                  // var elContainer = doc.createElement('div');
                  // elContainer.innerHTML = '<?' + doc.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                  // nodes[nodes.length] = elContainer.innerHTML;
                  // Todo: any other way to resolve? Just use XML?
                  nodes[nodes.length] = doc.createComment('?' + arg + ' ' + procValue + '?');
                }

                break; // Browsers don't support doc.createEntityReference, so we just use this as a convenience
              }

            case '&':
              nodes[nodes.length] = _createSafeReference('entity', '', args[++i]);
              break;

            case '#':
              // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
              nodes[nodes.length] = _createSafeReference('decimal', arg, String(args[++i]));
              break;

            case '#x':
              // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
              nodes[nodes.length] = _createSafeReference('hexadecimal', arg, args[++i]);
              break;

            case '![':
              // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
              // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
              // Todo: config (or detection via some kind of doc.documentType property?) of whether in XML
              try {
                nodes[nodes.length] = doc.createCDATASection(args[++i]);
              } catch (e2) {
                nodes[nodes.length] = doc.createTextNode(args[i]); // i already incremented
              }

              break;

            case '':
              nodes[nodes.length] = elem = doc.createDocumentFragment(); // Todo: Report to plugins

              opts.$state = 'fragment';
              break;

            default:
              {
                // An element
                elStr = arg;
                var atts = args[i + 1];

                if (_getType(atts) === 'object' && atts.is) {
                  var is = atts.is; // istanbul ignore else

                  if (doc.createElementNS) {
                    elem = doc.createElementNS(NS_HTML, elStr, {
                      is: is
                    });
                  } else {
                    elem = doc.createElement(elStr, {
                      is: is
                    });
                  }
                } else
                  /* istanbul ignore else */
                  if (doc.createElementNS) {
                    elem = doc.createElementNS(NS_HTML, elStr);
                  } else {
                    elem = doc.createElement(elStr);
                  } // Todo: Report to plugins


                opts.$state = 'element';
                nodes[nodes.length] = elem; // Add to parent

                break;
              }
          }

          break;

        case 'object':
          {
            // Non-DOM-element objects indicate attribute-value pairs
            var _atts = arg;

            if (_atts.xmlns !== undefined) {
              // We handle this here, as otherwise may lose events, etc.
              // As namespace of element already set as XHTML, we need to change the namespace
              // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
              // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
              var replacer = void 0;

              if (_typeof$1(_atts.xmlns) === 'object') {
                replacer = _replaceDefiner(_atts.xmlns);
              } else {
                replacer = ' xmlns="' + _atts.xmlns + '"';
              } // try {
              // Also fix DOMParser to work with text/html


              elem = nodes[nodes.length - 1] = new win.DOMParser().parseFromString(new win.XMLSerializer().serializeToString(elem) // Mozilla adds XHTML namespace
              .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement; // Todo: Report to plugins

              opts.$state = 'element'; // }catch(e) {alert(elem.outerHTML);throw e;}
            }

            _checkAtts(_atts);

            break;
          }

        case 'document':
        case 'fragment':
        case 'element':
          /*
          1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
          2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
          */
          if (i === 0) {
            // Allow wrapping of element, fragment, or document
            elem = arg; // Todo: Report to plugins

            opts.$state = 'element';
          }

          if (i === argc - 1 || i === argc - 2 && args[i + 1] === null) {
            // parent
            var elsl = nodes.length;

            for (var k = 0; k < elsl; k++) {
              _appendNode(arg, nodes[k]);
            } // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?


            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them

          } else {
            nodes[nodes.length] = arg;
          }

          break;

        case 'array':
          {
            // Arrays or arrays of arrays indicate child nodes
            var child = arg;
            var cl = child.length;

            for (var j = 0; j < cl; j++) {
              // Go through children array container to handle elements
              var childContent = child[j];

              var childContentType = _typeof$1(childContent);

              if (_isNullish(childContent)) {
                throw new TypeError('Bad children (parent array: ' + JSON.stringify(args) + '; child: ' + child + '; index:' + j + ')');
              }

              switch (childContentType) {
                // Todo: determine whether null or function should have special handling or be converted to text
                case 'string':
                case 'number':
                case 'boolean':
                  _appendNode(elem, doc.createTextNode(childContent));

                  break;

                default:
                  if (Array.isArray(childContent)) {
                    // Arrays representing child elements
                    opts.$state = 'children';

                    _appendNode(elem, jml.apply(void 0, [opts].concat(_toConsumableArray$1(childContent))));
                  } else if (childContent['#']) {
                    // Fragment
                    opts.$state = 'fragmentChildren';

                    _appendNode(elem, jml(opts, childContent['#']));
                  } else {
                    // Single DOM element children
                    var newChildContent = checkPluginValue(elem, null, childContent, opts);

                    _appendNode(elem, newChildContent);
                  }

                  break;
              }
            }

            break;
          }
      }
    }

    var ret = nodes[0] || elem;

    if (isRoot && opts.$map && opts.$map.root) {
      setMap(true);
    }

    return ret;
  };
  /**
  * Converts a DOM object or a string of HTML into a Jamilih object (or string).
  * @param {string|HTMLElement} dom If a string, will parse as document
  * @param {PlainObject} [config] Configuration object
  * @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
  * @param {boolean} [config.reportInvalidState=true] If true (the default), will report invalid state errors
  * @param {boolean} [config.stripWhitespace=false] Strip whitespace for text nodes
  * @returns {JamilihArray|string} Array containing the elements which represent
  * a Jamilih object, or, if `stringOutput` is true, it will be the stringified
  * version of such an object
  */


  jml.toJML = function (dom) {
    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref3$stringOutput = _ref3.stringOutput,
        stringOutput = _ref3$stringOutput === void 0 ? false : _ref3$stringOutput,
        _ref3$reportInvalidSt = _ref3.reportInvalidState,
        reportInvalidState = _ref3$reportInvalidSt === void 0 ? true : _ref3$reportInvalidSt,
        _ref3$stripWhitespace = _ref3.stripWhitespace,
        stripWhitespace = _ref3$stripWhitespace === void 0 ? false : _ref3$stripWhitespace;

    if (typeof dom === 'string') {
      dom = new win.DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    var ret = [];
    var parent = ret;
    var parentIdx = 0;
    /**
     * @param {string} msg
     * @throws {DOMException}
     * @returns {void}
     */

    function invalidStateError(msg) {
      // These are probably only necessary if working with text/html

      /* eslint-disable no-shadow, unicorn/custom-error-definition */

      /**
       * Polyfill for `DOMException`.
       */
      var DOMException =
      /*#__PURE__*/
      function (_Error) {
        _inherits$1(DOMException, _Error);
        /* eslint-enable no-shadow, unicorn/custom-error-definition */

        /**
         * @param {string} message
         * @param {string} name
         */


        function DOMException(message, name) {
          var _this2;

          _classCallCheck$1(this, DOMException);

          _this2 = _possibleConstructorReturn$1(this, _getPrototypeOf$1(DOMException).call(this, message)); // eslint-disable-next-line unicorn/custom-error-definition

          _this2.name = name;
          return _this2;
        }

        return DOMException;
      }(_wrapNativeSuper$1(Error));

      if (reportInvalidState) {
        // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
        var e = new DOMException(msg, 'INVALID_STATE_ERR');
        e.code = 11;
        throw e;
      }
    }
    /**
     *
     * @param {DocumentType|Entity} obj
     * @param {Node} node
     * @returns {void}
     */


    function addExternalID(obj, node) {
      if (node.systemId.includes('"') && node.systemId.includes("'")) {
        invalidStateError('systemId cannot have both single and double quotes.');
      }

      var publicId = node.publicId,
          systemId = node.systemId;

      if (systemId) {
        obj.systemId = systemId;
      }

      if (publicId) {
        obj.publicId = publicId;
      }
    }
    /**
     *
     * @param {any} val
     * @returns {void}
     */


    function set(val) {
      parent[parentIdx] = val;
      parentIdx++;
    }
    /**
     * @returns {void}
     */


    function setChildren() {
      set([]);
      parent = parent[parentIdx - 1];
      parentIdx = 0;
    }
    /**
     *
     * @param {string} prop1
     * @param {string} prop2
     * @returns {void}
     */


    function setObj(prop1, prop2) {
      parent = parent[parentIdx - 1][prop1];
      parentIdx = 0;

      if (prop2) {
        parent = parent[prop2];
      }
    }
    /**
     *
     * @param {Node} node
     * @param {object<{string: string}>} namespaces
     * @returns {void}
     */


    function parseDOM(node, namespaces) {
      // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

      /*
      if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
        invalidStateError('Prefix cannot have a colon');
      }
      */
      var type = 'nodeType' in node ? node.nodeType : null;
      namespaces = _objectSpread2({}, namespaces);
      var xmlChars = /^([\t\n\r -\uD7FF\uE000-\uFFFD]|(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF]))(?:(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))*$/; // eslint-disable-line no-control-regex

      if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
        invalidStateError('Node has bad XML character value');
      }

      var tmpParent, tmpParentIdx;
      /**
       * @returns {void}
       */

      function setTemp() {
        tmpParent = parent;
        tmpParentIdx = parentIdx;
      }
      /**
       * @returns {void}
       */


      function resetTemp() {
        parent = tmpParent;
        parentIdx = tmpParentIdx;
        parentIdx++; // Increment index in parent container of this element
      }

      switch (type) {
        case 1:
          {
            // ELEMENT
            setTemp();
            var nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

            setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays

            set(nodeName);
            var start = {};
            var hasNamespaceDeclaration = false;

            if (namespaces[node.prefix || ''] !== node.namespaceURI) {
              namespaces[node.prefix || ''] = node.namespaceURI;

              if (node.prefix) {
                start['xmlns:' + node.prefix] = node.namespaceURI;
              } else if (node.namespaceURI) {
                start.xmlns = node.namespaceURI;
              } else {
                start.xmlns = null;
              }

              hasNamespaceDeclaration = true;
            }

            if (node.attributes.length) {
              set(_toConsumableArray$1(node.attributes).reduce(function (obj, att) {
                obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value

                return obj;
              }, start));
            } else if (hasNamespaceDeclaration) {
              set(start);
            }

            var childNodes = node.childNodes;

            if (childNodes.length) {
              setChildren(); // Element children array container

              _toConsumableArray$1(childNodes).forEach(function (childNode) {
                parseDOM(childNode, namespaces);
              });
            }

            resetTemp();
            break;
          }

        case undefined: // Treat as attribute node until this is fixed: https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822

        case 2:
          // ATTRIBUTE (should only get here if passing in an attribute node)
          set({
            $attribute: [node.namespaceURI, node.name, node.value]
          });
          break;

        case 3:
          // TEXT
          if (stripWhitespace && /^[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$/.test(node.nodeValue)) {
            set('');
            return;
          }

          set(node.nodeValue);
          break;

        case 4:
          // CDATA
          if (node.nodeValue.includes(']]' + '>')) {
            invalidStateError('CDATA cannot end with closing ]]>');
          }

          set(['![', node.nodeValue]);
          break;

        case 5:
          // ENTITY REFERENCE (though not in browsers (was already resolved
          //  anyways), ok to keep for parity with our "entity" shorthand)
          set(['&', node.nodeName]);
          break;

        case 7:
          // PROCESSING INSTRUCTION
          if (/^xml$/i.test(node.target)) {
            invalidStateError('Processing instructions cannot be "xml".');
          }

          if (node.target.includes('?>')) {
            invalidStateError('Processing instruction targets cannot include ?>');
          }

          if (node.target.includes(':')) {
            invalidStateError('The processing instruction target cannot include ":"');
          }

          if (node.data.includes('?>')) {
            invalidStateError('Processing instruction data cannot include ?>');
          }

          set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes

          break;

        case 8:
          // COMMENT
          if (node.nodeValue.includes('--') || node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1) {
            invalidStateError('Comments cannot include --');
          }

          set(['!', node.nodeValue]);
          break;

        case 9:
          {
            // DOCUMENT
            setTemp();
            var docObj = {
              $document: {
                childNodes: []
              }
            };
            set(docObj); // doc.implementation.createHTMLDocument
            // Set position to fragment's array children

            setObj('$document', 'childNodes');
            var _childNodes = node.childNodes;

            if (!_childNodes.length) {
              invalidStateError('Documents must have a child node');
            } // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally


            _toConsumableArray$1(_childNodes).forEach(function (childNode) {
              // Can't just do documentElement as there may be doctype, comments, etc.
              // No need for setChildren, as we have already built the container array
              parseDOM(childNode, namespaces);
            });

            resetTemp();
            break;
          }

        case 10:
          {
            // DOCUMENT TYPE
            setTemp(); // Can create directly by doc.implementation.createDocumentType

            var _start = {
              $DOCTYPE: {
                name: node.name
              }
            };
            var pubIdChar = /^( |\r|\n|[0-9A-Za-z]|[!#-%'-\/:;=\?@_])*$/; // eslint-disable-line no-control-regex

            if (!pubIdChar.test(node.publicId)) {
              invalidStateError('A publicId must have valid characters.');
            }

            addExternalID(_start.$DOCTYPE, node); // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD

            set(_start); // Auto-generate the internalSubset instead?

            resetTemp();
            break;
          }

        case 11:
          {
            // DOCUMENT FRAGMENT
            setTemp();
            set({
              '#': []
            }); // Set position to fragment's array children

            setObj('#');
            var _childNodes2 = node.childNodes;

            _toConsumableArray$1(_childNodes2).forEach(function (childNode) {
              // No need for setChildren, as we have already built the container array
              parseDOM(childNode, namespaces);
            });

            resetTemp();
            break;
          }

        default:
          throw new TypeError('Not an XML type');
      }
    }

    parseDOM(dom, {});

    if (stringOutput) {
      return JSON.stringify(ret[0]);
    }

    return ret[0];
  };

  jml.toJMLString = function (dom, config) {
    return jml.toJML(dom, Object.assign(config || {}, {
      stringOutput: true
    }));
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {JamilihReturn}
   */


  jml.toDOM = function () {
    // Alias for jml()
    return jml.apply(void 0, arguments);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toHTML = function () {
    // Todo: Replace this with version of jml() that directly builds a string
    var ret = jml.apply(void 0, arguments); // Todo: deal with serialization of properties like 'selected',
    //  'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*',
    //  'style'! (i.e., need to build a string ourselves)

    return ret.outerHTML;
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toDOMString = function () {
    // Alias for jml.toHTML for parity with jml.toJMLString
    return jml.toHTML.apply(jml, arguments);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXML = function () {
    var ret = jml.apply(void 0, arguments);
    return new win.XMLSerializer().serializeToString(ret);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXMLDOMString = function () {
    // Alias for jml.toXML for parity with jml.toJMLString
    return jml.toXML.apply(jml, arguments);
  };
  /**
   * Element-aware wrapper for `Map`.
   */


  var JamilihMap =
  /*#__PURE__*/
  function (_Map) {
    _inherits$1(JamilihMap, _Map);

    function JamilihMap() {
      _classCallCheck$1(this, JamilihMap);

      return _possibleConstructorReturn$1(this, _getPrototypeOf$1(JamilihMap).apply(this, arguments));
    }

    _createClass(JamilihMap, [{
      key: "get",

      /**
       * @param {string|Element} elem
       * @returns {any}
       */
      value: function get(elem) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return _get(_getPrototypeOf$1(JamilihMap.prototype), "get", this).call(this, elem);
      }
      /**
       * @param {string|Element} elem
       * @param {any} value
       * @returns {any}
       */

    }, {
      key: "set",
      value: function set(elem, value) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return _get(_getPrototypeOf$1(JamilihMap.prototype), "set", this).call(this, elem, value);
      }
      /**
       * @param {string|Element} elem
       * @param {string} methodName
       * @param {...any} args
       * @returns {any}
       */

    }, {
      key: "invoke",
      value: function invoke(elem, methodName) {
        var _this$get;

        elem = typeof elem === 'string' ? $(elem) : elem;

        for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        return (_this$get = this.get(elem))[methodName].apply(_this$get, [elem].concat(args));
      }
    }]);

    return JamilihMap;
  }(_wrapNativeSuper$1(Map));
  /**
   * Element-aware wrapper for `WeakMap`.
   */


  var JamilihWeakMap =
  /*#__PURE__*/
  function (_WeakMap) {
    _inherits$1(JamilihWeakMap, _WeakMap);

    function JamilihWeakMap() {
      _classCallCheck$1(this, JamilihWeakMap);

      return _possibleConstructorReturn$1(this, _getPrototypeOf$1(JamilihWeakMap).apply(this, arguments));
    }

    _createClass(JamilihWeakMap, [{
      key: "get",

      /**
       * @param {string|Element} elem
       * @returns {any}
       */
      value: function get(elem) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return _get(_getPrototypeOf$1(JamilihWeakMap.prototype), "get", this).call(this, elem);
      }
      /**
       * @param {string|Element} elem
       * @param {any} value
       * @returns {any}
       */

    }, {
      key: "set",
      value: function set(elem, value) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return _get(_getPrototypeOf$1(JamilihWeakMap.prototype), "set", this).call(this, elem, value);
      }
      /**
       * @param {string|Element} elem
       * @param {string} methodName
       * @param {...any} args
       * @returns {any}
       */

    }, {
      key: "invoke",
      value: function invoke(elem, methodName) {
        var _this$get2;

        elem = typeof elem === 'string' ? $(elem) : elem;

        for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          args[_key3 - 2] = arguments[_key3];
        }

        return (_this$get2 = this.get(elem))[methodName].apply(_this$get2, [elem].concat(args));
      }
    }]);

    return JamilihWeakMap;
  }(_wrapNativeSuper$1(WeakMap));

  jml.Map = JamilihMap;
  jml.WeakMap = JamilihWeakMap;
  /**
  * @typedef {GenericArray} MapAndElementArray
  * @property {JamilihWeakMap|JamilihMap} 0
  * @property {Element} 1
  */

  /**
   * @param {GenericObject} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */

  jml.weak = function (obj) {
    var map = new JamilihWeakMap();

    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    var elem = jml.apply(void 0, [{
      $map: [map, obj]
    }].concat(args));
    return [map, elem];
  };
  /**
   * @param {any} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */


  jml.strong = function (obj) {
    var map = new JamilihMap();

    for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      args[_key5 - 1] = arguments[_key5];
    }

    var elem = jml.apply(void 0, [{
      $map: [map, obj]
    }].concat(args));
    return [map, elem];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string} sym If a string, will be used with `Symbol.for`
   * @returns {any} The value associated with the symbol
   */


  jml.symbol = jml.sym = jml["for"] = function (elem, sym) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    return elem[_typeof$1(sym) === 'symbol' ? sym : Symbol["for"](sym)];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string|Map|WeakMap} symOrMap If a string, will be used with `Symbol.for`
   * @param {string|any} methodName Can be `any` if the symbol or map directly
   *   points to a function (it is then used as the first argument).
   * @param {any[]} args
   * @returns {any}
   */


  jml.command = function (elem, symOrMap, methodName) {
    var _func3;

    elem = typeof elem === 'string' ? $(elem) : elem;
    var func;

    for (var _len6 = arguments.length, args = new Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) {
      args[_key6 - 3] = arguments[_key6];
    }

    if (['symbol', 'string'].includes(_typeof$1(symOrMap))) {
      var _func;

      func = jml.sym(elem, symOrMap);

      if (typeof func === 'function') {
        return func.apply(void 0, [methodName].concat(args)); // Already has `this` bound to `elem`
      }

      return (_func = func)[methodName].apply(_func, args);
    }

    func = symOrMap.get(elem);

    if (typeof func === 'function') {
      var _func2;

      return (_func2 = func).call.apply(_func2, [elem, methodName].concat(args));
    }

    return (_func3 = func)[methodName].apply(_func3, [elem].concat(args)); // return func[methodName].call(elem, ...args);
  };
  /**
   * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
   * Also updates `body` with `document.body`.
   * @param {Window} wind
   * @returns {void}
   */


  jml.setWindow = function (wind) {
    win = wind;
    doc = win.document;

    if (doc && doc.body) {
      var _doc = doc;
      body = _doc.body;
    }
  };
  /**
   * @returns {Window}
   */


  jml.getWindow = function () {
    return win;
  };


  var body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

  var nbsp = "\xA0"; // Very commonly needed in templates

  /**
   * ISC License
   *
   * Copyright (c) 2018, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */
  var QueryResult =
  /*#__PURE__*/
  function (_Array) {
    _inherits(QueryResult, _Array);

    function QueryResult() {
      _classCallCheck(this, QueryResult);

      return _possibleConstructorReturn(this, _getPrototypeOf(QueryResult).apply(this, arguments));
    }

    return QueryResult;
  }(_wrapNativeSuper(Array));

  var create = Object.create,
      defineProperty = Object.defineProperty;
  var AP = Array.prototype;
  var DOM_CONTENT_LOADED = 'DOMContentLoaded';
  var LOAD = 'load';
  var NO_TRANSPILER_ISSUES = new QueryResult() instanceof QueryResult;
  var QRP = QueryResult.prototype; // fixes methods returning non QueryResult

  /* istanbul ignore if */

  if (!NO_TRANSPILER_ISSUES) Object.getOwnPropertyNames(AP).forEach(function (name) {
    var desc = Object.getOwnPropertyDescriptor(AP, name);

    if (typeof desc.value === 'function') {
      var fn = desc.value;

      desc.value = function () {
        var result = fn.apply(this, arguments);
        return result instanceof Array ? patch(result) : result;
      };
    }

    defineProperty(QRP, name, desc);
  }); // fixes badly transpiled classes

  var patch = NO_TRANSPILER_ISSUES ? function (qr) {
    return qr;
  } :
  /* istanbul ignore next */
  function (qr) {
    var nqr = create(QRP);
    push.apply(nqr, slice(qr));
    return nqr;
  };
  var push = AP.push;

  var search = function search(list, el) {
    var nodes = [];
    var length = list.length;

    for (var i = 0; i < length; i++) {
      var css = list[i].trim();

      if (css.slice(-6) === ':first') {
        var node = el.querySelector(css.slice(0, -6));
        if (node) push.call(nodes, node);
      } else push.apply(nodes, slice(el.querySelectorAll(css)));
    }

    return _construct(QueryResult, nodes);
  };

  var slice = NO_TRANSPILER_ISSUES ? patch :
  /* istanbul ignore next */
  function (all) {
    // do not use slice.call(...) due old IE gotcha
    var nodes = [];
    var length = all.length;

    for (var i = 0; i < length; i++) {
      nodes[i] = all[i];
    }

    return nodes;
  }; // use function to avoid usage of Symbol.hasInstance
  // (broken in older browsers anyway)

  var $$1 = function $(CSS) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    switch (_typeof(CSS)) {
      case 'string':
        return patch(search(CSS.split(','), parent));

      case 'object':
        // needed to avoid iterator dance (breaks in older IEs)
        var nodes = [];
        var all = 'nodeType' in CSS || 'postMessage' in CSS ? [CSS] : CSS;
        push.apply(nodes, slice(all));
        return patch(_construct(QueryResult, nodes));

      case 'function':
        var $parent = $(parent);
        var $window = $(parent.defaultView);
        var handler = {
          handleEvent: function handleEvent(event) {
            $parent.off(DOM_CONTENT_LOADED, handler);
            $window.off(LOAD, handler);
            CSS(event);
          }
        };
        $parent.on(DOM_CONTENT_LOADED, handler);
        $window.on(LOAD, handler);
        var rs = parent.readyState;
        if (rs == 'complete' || rs != 'loading' && !parent.documentElement.doScroll) setTimeout(function () {
          return $parent.dispatch(DOM_CONTENT_LOADED);
        });
        return $;
    }
  };

  $$1.prototype = QRP;

  $$1.extend = function (key, value) {
    return defineProperty(QRP, key, {
      configurable: true,
      value: value
    }), $$1;
  }; // dropped usage of for-of to avoid broken iteration dance in older IEs


  $$1.extend('dispatch', function dispatch(type) {
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var event = new CustomEvent(type, init);
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i].dispatchEvent(event);
    }

    return this;
  }).extend('off', function off(type, handler) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i].removeEventListener(type, handler, options);
    }

    return this;
  }).extend('on', function on(type, handler) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i].addEventListener(type, handler, options);
    }

    return this;
  });

  function _typeof$2(obj) {
    if (typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol") {
      _typeof$2 = function _typeof$1(obj) {
        return _typeof(obj);
      };
    } else {
      _typeof$2 = function _typeof$1(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof(obj);
      };
    }

    return _typeof$2(obj);
  }

  function _slicedToArray$2(arr, i) {
    return _arrayWithHoles$2(arr) || _iterableToArrayLimit$2(arr, i) || _nonIterableRest$2();
  }

  function _toConsumableArray$2(arr) {
    return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _nonIterableSpread$2();
  }

  function _arrayWithoutHoles$2(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _arrayWithHoles$2(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$2(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit$2(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread$2() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest$2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function convertToString(content, type) {
    switch (_typeof$2(content)) {
      case 'object':
        {
          if (!content) {
            throw new TypeError('Cannot supply `null`');
          }

          switch (content.nodeType) {
            case 1:
              {
                // ELEMENT
                return content.outerHTML;
              }

            case 3:
              {
                // TEXT
                return content.nodeValue;
              }

            case 11:
              {
                // DOCUMENT_FRAGMENT_NODE
                return _toConsumableArray$2(content.childNodes).reduce(function (s, node) {
                  return s + convertToString(node, type);
                }, '');
              }

            case undefined:
              // Array of nodes, QueryResult objects
              // if (Array.isArray(content)) {
              if (typeof content.reduce === 'function') {
                return content.reduce(function (s, node) {
                  return s + convertToString(node, type);
                }, '');
              }

              break;
          }

          return undefined;
        }

      case 'string':
        {
          return content;
        }

      default:
        throw new TypeError('Bad content for ' + type + '; type: ' + _typeof$2(content));
    }
  }

  function convertToDOM(content, type, avoidClone) {
    switch (_typeof$2(content)) {
      case 'object':
        {
          if (!content) {
            throw new TypeError('Cannot supply `null`');
          }

          if ([1, // ELEMENT
          3, // TEXT
          11 // Document fragment
          ].includes(content.nodeType)) {
            return avoidClone ? content : content.cloneNode(true);
          }

          if (typeof content.reduce !== 'function') {
            throw new TypeError('Unrecognized type of object for conversion to DOM');
          } // Array of nodes, QueryResult objects


          return avoidClone ? content : content.map(function (node) {
            if (!node || !node.cloneNode) {
              // Allows for arrays of HTML strings
              return convertToDOM(node, type, false);
            }

            return node.cloneNode(true);
          });
        }

      case 'string':
        {
          var div = document.createElement('div');
          div.innerHTML = content;
          return div.firstElementChild || div.firstChild;
        }

      default:
        throw new TypeError('Bad content for ' + type + '; type: ' + _typeof$2(content));
    }
  }

  function insert(type) {
    return function () {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var cbOrContent = args[0];

      switch (_typeof$2(cbOrContent)) {
        case 'function':
          {
            this.forEach(function (node, i) {
              var ret = cbOrContent.call(_this, i, node.textContent);
              node[type](ret);
            });
            break;
          }

        default:
          {
            this.forEach(function (node, i, arr) {
              node[type].apply(node, _toConsumableArray$2(args.flatMap(function (content) {
                return convertToDOM(content, type, i === arr.length - 1);
              })));
            });
            break;
          }
      }

      return this;
    };
  }

  function insertText(type) {
    return function (cbOrContent) {
      var _this2 = this;

      switch (_typeof$2(cbOrContent)) {
        case 'function':
          {
            this.forEach(function (node, i) {
              var ret = cbOrContent.call(_this2, i, node[type]);
              node[type] = convertToString(ret, type);
            });
            break;
          }

        default:
          {
            this.forEach(function (node) {
              node[type] = convertToString(cbOrContent, type);
            });
            break;
          }
      }

      return this;
    };
  }

  var after = insert('after');
  var before = insert('before');
  var append = insert('append');
  var prepend = insert('prepend');
  var html = insertText('innerHTML');
  var text = insertText('textContent');
  /*
  // Todo:
  export const val = function (valueOrFunc) {

  };
  */
  // Given that these types require a selector engine and
  // in order to avoid the absence of optimization of `document.querySelectorAll`
  // for `:first-child` and different behavior in different contexts,
  // and to avoid making a mutual dependency with query-result,
  // exports of this type accept a QueryResult instance;
  // if selected without a second argument, we do default to
  //  `document.querySelectorAll`, however.

  var insertTo = function insertTo(method) {
    var $ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (sel) {
      return _toConsumableArray$2(document.querySelectorAll(sel));
    };
    var type = {
      appendTo: 'append',
      prependTo: 'prepend',
      insertAfter: 'after',
      insertBefore: 'before'
    }[method] || 'append';
    return function (target) {
      var toType = type + 'To';
      this.forEach(function (node, i, arr) {
        if (typeof target === 'string' && target.charAt(0) !== '<') {
          target = $(target);
        }

        target = Array.isArray(target) ? target : [target];
        node[type].apply(node, _toConsumableArray$2(target.flatMap(function (content) {
          return convertToDOM(content, toType, i === arr.length - 1);
        })));
      });
      return this;
    };
  }; // Todo: optional `withDataAndEvents` and `deepWithDataAndEvents` arguments?


  var clone = function clone() {
    return this.map(function (node) {
      // Still a QueryResult with such a map
      return node.cloneNode(true);
    });
  };

  var empty = function empty() {
    this.forEach(function (node) {
      node.textContent = '';
    });
  };

  var remove = function remove(selector) {
    if (selector) {
      this.forEach(function (node) {
        if (node.matches(selector)) {
          // Todo: Use query-result instead?
          node.remove();
        }
      });
    } else {
      this.forEach(function (node) {
        node.remove();
      });
    }

    return this;
  };
  /*
  // Todo:
  export const detach = function (selector) {
    // Should preserve attached data
    return remove(selector);
  };
  */


  var attr = function attr(attributeNameOrAtts, valueOrCb) {
    var _this3 = this;

    if (valueOrCb === undefined) {
      switch (_typeof$2(attributeNameOrAtts)) {
        case 'string':
          {
            return this[0].hasAttribute(attributeNameOrAtts) ? this[0].getAttribute(attributeNameOrAtts) : undefined;
          }

        case 'object':
          {
            if (attributeNameOrAtts) {
              this.forEach(function (node, i) {
                Object.entries(attributeNameOrAtts).forEach(function (_ref) {
                  var _ref2 = _slicedToArray$2(_ref, 2),
                      att = _ref2[0],
                      val = _ref2[1];

                  node.setAttribute(att, val);
                });
              });
              return this;
            }
          }
        // Fallthrough

        default:
          {
            throw new TypeError('Unexpected type for attribute name: ' + _typeof$2(attributeNameOrAtts));
          }
      }
    }

    switch (_typeof$2(valueOrCb)) {
      case 'function':
        {
          this.forEach(function (node, i) {
            var ret = valueOrCb.call(_this3, i, node.getAttribute(valueOrCb));

            if (ret === null) {
              node.removeAttribute(attributeNameOrAtts);
            } else {
              node.setAttribute(attributeNameOrAtts, ret);
            }
          });
          break;
        }

      case 'string':
        {
          this.forEach(function (node, i) {
            node.setAttribute(attributeNameOrAtts, valueOrCb);
          });
          break;
        }

      case 'object':
        {
          if (!valueOrCb) {
            // `null`
            return removeAttr.call(this, attributeNameOrAtts);
          }
        }
      // Fallthrough

      default:
        {
          throw new TypeError('Unexpected type for attribute name: ' + _typeof$2(attributeNameOrAtts));
        }
    }

    return this;
  };

  var removeAttr = function removeAttr(attributeName) {
    if (typeof attributeName !== 'string') {
      throw new TypeError('Unexpected type for attribute name: ' + _typeof$2(attributeName));
    }

    this.forEach(function (node) {
      node.removeAttribute(attributeName);
    });
  };

  function classAttManipulation(type) {
    return function (cbOrContent) {
      var _this4 = this;

      switch (_typeof$2(cbOrContent)) {
        case 'function':
          {
            this.forEach(function (node, i) {
              var _node$classList;

              var ret = cbOrContent.call(_this4, i, node.className);

              (_node$classList = node.classList)[type].apply(_node$classList, _toConsumableArray$2(ret.split(' ')));
            });
            break;
          }

        default:
          {
            if (type === 'remove' && !cbOrContent) {
              this.forEach(function (node) {
                node.className = '';
              });
              break;
            }

            this.forEach(function (node) {
              var _node$classList2;

              (_node$classList2 = node.classList)[type].apply(_node$classList2, _toConsumableArray$2(cbOrContent.split(' ')));
            });
            break;
          }
      }

      return this;
    };
  }

  var addClass = classAttManipulation('add');
  var removeClass = classAttManipulation('remove');

  var hasClass = function hasClass(className) {
    return this.some(function (node) {
      return node.classList.contains(className);
    });
  };

  var toggleClass = function toggleClass(classNameOrCb, state) {
    var _this5 = this;

    switch (typeof cbOrContent === "undefined" ? "undefined" : _typeof$2(cbOrContent)) {
      case 'function':
        {
          if (typeof state === 'boolean') {
            this.forEach(function (node, i) {
              var _node$classList3;

              var ret = classNameOrCb.call(_this5, i, node.className, state);

              (_node$classList3 = node.classList).toggle.apply(_node$classList3, _toConsumableArray$2(ret.split(' ')).concat([state]));
            });
          } else {
            this.forEach(function (node, i) {
              var _node$classList4;

              var ret = classNameOrCb.call(_this5, i, node.className, state);

              (_node$classList4 = node.classList).toggle.apply(_node$classList4, _toConsumableArray$2(ret.split(' ')));
            });
          }

          break;
        }

      case 'string':
        {
          if (typeof state === 'boolean') {
            this.forEach(function (node) {
              var _node$classList5;

              (_node$classList5 = node.classList).toggle.apply(_node$classList5, _toConsumableArray$2(classNameOrCb.split(' ')).concat([state]));
            });
          } else {
            this.forEach(function (node) {
              var _node$classList6;

              (_node$classList6 = node.classList).toggle.apply(_node$classList6, _toConsumableArray$2(classNameOrCb.split(' ')));
            });
          }

          break;
        }
    }
  };

  var methods = {
    after: after,
    before: before,
    append: append,
    prepend: prepend,
    html: html,
    text: text,
    clone: clone,
    empty: empty,
    remove: remove,
    // detach
    attr: attr,
    removeAttr: removeAttr,
    addClass: addClass,
    hasClass: hasClass,
    removeClass: removeClass,
    toggleClass: toggleClass
  };

  var manipulation = function manipulation($, jml) {
    ['after', 'before', 'append', 'prepend', 'html', 'text', 'clone', 'empty', 'remove', // 'detach'
    'attr', 'removeAttr', 'addClass', 'hasClass', 'removeClass', 'toggleClass'].forEach(function (method) {
      $.extend(method, methods[method]);
    });
    ['appendTo', 'prependTo', 'insertAfter', 'insertBefore'].forEach(function (method) {
      $.extend(method, insertTo(method, $));
    });

    if (jml) {
      $.extend('jml', function () {
        var _this6 = this;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        this.forEach(function (node) {
          while (node.hasChildNodes()) {
            node.firstChild.remove();
          }

          var n = jml.apply(void 0, args);
          return append.call(_this6, n);
        });
      });
    }

    return $;
  };

  manipulation($$1, jml);
  var baseAPIURL = 'https://openclipart.org/search/json/';
  var jsVoid = 'javascript: void(0);'; // eslint-disable-line no-script-url

  /**
   * Shows results after query submission.
   * @param {string} url
   * @returns {Promise<void>}
   */

  function processResults(_x) {
    return _processResults.apply(this, arguments);
  }

  function _processResults() {
    _processResults = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(url) {
      var queryLink, r, json, payload, _json$info, numResults, pages, currentPage, semiColonSep;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              queryLink = function _ref4(query) {
                return ['a', {
                  href: jsVoid,
                  dataset: {
                    value: query
                  },
                  $on: {
                    click: function click(e) {
                      e.preventDefault();
                      var value = this.dataset.value;
                      $$1('#query')[0].$set(value);
                      $$1('#openclipart')[0].$submit();
                    }
                  }
                }, [query]];
              };

              _context3.next = 3;
              return fetch(url);

            case 3:
              r = _context3.sent;
              _context3.next = 6;
              return r.json();

            case 6:
              json = _context3.sent;

              if (!(!json || json.msg !== 'success')) {
                _context3.next = 10;
                break;
              }

              // Todo: This could use a generic alert library instead
              alert('There was a problem downloading the results'); // eslint-disable-line no-alert

              return _context3.abrupt("return");

            case 10:
              payload = json.payload, _json$info = json.info, numResults = _json$info.results, pages = _json$info.pages, currentPage = _json$info.current_page; // $('#page')[0].value = currentPage;
              // $('#page')[0].max = pages;
              // Unused properties:
              // - `svg_filesize` always 0?
              // - `dimensions: {
              //      png_thumb: {width, height},
              //      png_full_lossy: {width, height}
              //    }` object of relevance?
              // - No need for `tags` with `tags_array`
              // - `svg`'s: `png_thumb`, `png_full_lossy`, `png_2400px`

              semiColonSep = '; ' + nbsp;
              $$1('#results').jml('div', [['span', ['Number of results: ', numResults]], semiColonSep, ['span', ['page ', currentPage, ' out of ', pages]]].concat(_toConsumableArray(payload.map(function (_ref3) {
                var title = _ref3.title,
                    description = _ref3.description,
                    id = _ref3.id,
                    uploader = _ref3.uploader,
                    created = _ref3.created,
                    svgURL = _ref3.svg.url,
                    detailLink = _ref3.detail_link,
                    tagsArray = _ref3.tags_array,
                    downloadedBy = _ref3.downloaded_by,
                    totalFavorites = _ref3.total_favorites;
                var imgHW = '100px';
                var colonSep = ': ' + nbsp;
                return ['div', [['button', {
                  style: 'margin-right: 8px; border: 2px solid black;',
                  dataset: {
                    id: id,
                    value: svgURL
                  },
                  $on: {
                    click: function click(e) {
                      var _this = this;

                      return _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee2() {
                        var svgurl, post, result, svg;
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                e.preventDefault();
                                svgurl = _this.dataset.value; // console.log('this', id, svgurl);

                                post = function post(message) {
                                  // Todo: Make origin customizable as set by opening window
                                  // Todo: If dropping IE9, avoid stringifying
                                  window.parent.postMessage(JSON.stringify(_extends({
                                    namespace: 'imagelib'
                                  }, message)), '*');
                                }; // Send metadata (also indicates file is about to be sent)


                                post({
                                  name: title,
                                  id: svgurl
                                });
                                _context2.next = 6;
                                return fetch(svgurl);

                              case 6:
                                result = _context2.sent;
                                _context2.next = 9;
                                return result.text();

                              case 9:
                                svg = _context2.sent;
                                // console.log('url and svg', svgurl, svg);
                                post({
                                  href: svgurl,
                                  data: svg
                                });

                              case 11:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2);
                      }))();
                    }
                  }
                }, [// If we wanted interactive versions despite security risk:
                // ['object', {data: svgURL, type: 'image/svg+xml'}]
                ['img', {
                  src: svgURL,
                  style: "width: ".concat(imgHW, "; height: ").concat(imgHW, ";")
                }]]], ['b', [title]], ' ', ['i', [description]], ' ', ['span', ['(ID: ', ['a', {
                  href: jsVoid,
                  dataset: {
                    value: id
                  },
                  $on: {
                    click: function click(e) {
                      e.preventDefault();
                      var value = this.dataset.value;
                      $$1('#byids')[0].$set(value);
                      $$1('#openclipart')[0].$submit();
                    }
                  }
                }, [id]], ')']], ' ', ['i', [['a', {
                  href: detailLink,
                  target: '_blank'
                }, ['Details']]]], ['br'], ['span', [['u', ['Uploaded by']], colonSep, queryLink(uploader), semiColonSep]], ['span', [['u', ['Download count']], colonSep, downloadedBy, semiColonSep]], ['span', [['u', ['Times used as favorite']], colonSep, totalFavorites, semiColonSep]], ['span', [['u', ['Created date']], colonSep, created]], ['br'], ['u', ['Tags']], colonSep].concat(_toConsumableArray(tagsArray.map(function (tag) {
                  return ['span', [' ', queryLink(tag)]];
                })))];
              })), [['br'], ['br'], currentPage === 1 || pages <= 2 ? '' : ['span', [['a', {
                href: jsVoid,
                $on: {
                  click: function click(e) {
                    e.preventDefault();
                    $$1('#page')[0].value = 1;
                    $$1('#openclipart')[0].$submit();
                  }
                }
              }, ['First']], ' ']], currentPage === 1 ? '' : ['span', [['a', {
                href: jsVoid,
                $on: {
                  click: function click(e) {
                    e.preventDefault();
                    $$1('#page')[0].value = currentPage - 1;
                    $$1('#openclipart')[0].$submit();
                  }
                }
              }, ['Prev']], ' ']], currentPage === pages ? '' : ['span', [['a', {
                href: jsVoid,
                $on: {
                  click: function click(e) {
                    e.preventDefault();
                    $$1('#page')[0].value = currentPage + 1;
                    $$1('#openclipart')[0].$submit();
                  }
                }
              }, ['Next']], ' ']], currentPage === pages || pages <= 2 ? '' : ['span', [['a', {
                href: jsVoid,
                $on: {
                  click: function click(e) {
                    e.preventDefault();
                    $$1('#page')[0].value = pages;
                    $$1('#openclipart')[0].$submit();
                  }
                }
              }, ['Last']], ' ']]]));

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _processResults.apply(this, arguments);
  }

  jml('div', [['style', [".control {\n      padding-top: 10px;\n    }"]], ['form', {
    id: 'openclipart',
    $custom: {
      $submit: function $submit() {
        return _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          var url;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  url = new URL(baseAPIURL);
                  ['query', 'sort', 'amount', 'page', 'byids'].forEach(function (prop) {
                    var value = $$1('#' + prop)[0].value;

                    if (value) {
                      url.searchParams.set(prop, value);
                    }
                  });
                  _context.next = 4;
                  return processResults(url);

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }))();
      }
    },
    $on: {
      submit: function submit(e) {
        e.preventDefault();
        this.$submit();
      }
    }
  }, [// Todo: i18nize
  ['fieldset', [['legend', ['Search terms']], ['div', {
    "class": 'control'
  }, [['label', ['Query (Title, description, uploader, or tag): ', ['input', {
    id: 'query',
    name: 'query',
    placeholder: 'cat',
    $custom: {
      $set: function $set(value) {
        $$1('#byids')[0].value = '';
        this.value = value;
      }
    },
    $on: {
      change: function change() {
        $$1('#byids')[0].value = '';
      }
    }
  }]]]]], ['br'], ' OR ', ['br'], ['div', {
    "class": 'control'
  }, [['label', ['IDs (single or comma-separated): ', ['input', {
    id: 'byids',
    name: 'ids',
    placeholder: '271380, 265741',
    $custom: {
      $set: function $set(value) {
        $$1('#query')[0].value = '';
        this.value = value;
      }
    },
    $on: {
      change: function change() {
        $$1('#query')[0].value = '';
      }
    }
  }]]]]]]], ['fieldset', [['legend', ['Configuring results']], ['div', {
    "class": 'control'
  }, [['label', ['Sort by: ', ['select', {
    id: 'sort'
  }, [// Todo: i18nize first values
  ['Date', 'date'], ['Downloads', 'downloads'], ['Favorited', 'favorites']].map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        text = _ref2[0],
        _ref2$ = _ref2[1],
        value = _ref2$ === void 0 ? text : _ref2$;

    return ['option', {
      value: value
    }, [text]];
  })]]]]], ['div', {
    "class": 'control'
  }, [['label', ['Results per page: ', ['input', {
    id: 'amount',
    name: 'amount',
    value: 10,
    type: 'number',
    min: 1,
    max: 200,
    step: 1,
    pattern: '\\d+'
  }]]]]], ['div', {
    "class": 'control'
  }, [['label', ['Page number: ', ['input', {
    // max: 1, // We'll change this based on available results
    id: 'page',
    name: 'page',
    value: 1,
    style: 'width: 40px;',
    type: 'number',
    min: 1,
    step: 1,
    pattern: '\\d+'
  }]]]]]]], ['div', {
    "class": 'control'
  }, [['input', {
    type: 'submit'
  }]]]]], ['div', {
    id: 'results'
  }]], body);

}());
