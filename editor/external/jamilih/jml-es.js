function _typeof(obj) {
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

function _classCallCheck(instance, Constructor) {
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
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
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

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
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
var win = typeof window !== 'undefined' && window;
var doc = typeof document !== 'undefined' && document;
var XmlSerializer = typeof XMLSerializer !== 'undefined' && XMLSerializer; // STATIC PROPERTIES

var possibleOptions = ['$plugins', // '$mode', // Todo (SVG/XML)
// 'state', // Used internally
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

var NULLABLES = ['dir', // HTMLElement
'lang', // HTMLElement
'max', 'min', 'title' // HTMLElement
];

var $ = function $(sel) {
  return doc.querySelector(sel);
};

var $$ = function $$(sel) {
  return _toConsumableArray(doc.querySelectorAll(sel));
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
  if (!doc.createStyleSheet) {
    return;
  }

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
  var parentName = _getHTMLNodeName(parent);

  var childName = _getHTMLNodeName(child);

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
    if (parentName === 'select' && childName === 'option') {
      try {
        // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
        parent.add(child);
      } catch (err) {
        // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
        parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
      }

      return;
    }

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
  // For security reasons related to innerHTML, we ensure this string only contains potential entity characters
  if (!arg.match(/^[0-9A-Z_a-z]+$/)) {
    throw new TypeError('Bad ' + type);
  }

  var elContainer = doc.createElement('div'); // Todo: No workaround for XML?

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
* @returns {"string"|"null"|"array"|"element"|"fragment"|"object"}
*/


function _getType(item) {
  if (typeof item === 'string') {
    return 'string';
  }

  if (_typeof(item) === 'object') {
    if (item === null) {
      return 'null';
    }

    if (Array.isArray(item)) {
      return 'array';
    }

    if ('nodeType' in item) {
      if (item.nodeType === 1) {
        return 'element';
      }

      if (item.nodeType === 11) {
        return 'fragment';
      }
    }

    return 'object';
  }

  return undefined;
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
    var retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0 || ''; // Preserve XHTML

    for (var ns in xmlnsObj) {
      if ({}.hasOwnProperty.call(xmlnsObj, ns)) {
        if (ns !== '') {
          retStr += ' xmlns:' + ns + '="' + xmlnsObj[ns] + '"';
        }
      }
    }

    return retStr;
  };
}
/**
 *
 * @param {JamilihArray} args
 * @returns {Element}
 */


function _optsOrUndefinedJML() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return jml.apply(void 0, _toConsumableArray(args[0] === undefined ? args.slice(1) : args));
}
/**
* @private
* @static
* @param {string} arg
* @returns {Element}
*/


function _jmlSingleArg(arg) {
  return jml(arg);
}
/**
* @typedef {JamilihAttributes} AttributeArray
* @property {string} 0 The key
* @property {string} 1 The value
*/

/**
* @private
* @static
* @todo Deprecate as now there is predictable iteration order?
* @param {AttributeArray} attArr
* @returns {PlainObject}
*/


function _copyOrderedAtts(attArr) {
  var obj = {}; // Todo: Fix if allow prefixed attributes

  obj[attArr[0]] = attArr[1]; // array of ordered attribute-value arrays

  return obj;
}
/**
* @callback ChildrenToJMLCallback
* @param {JamilihArray|Jamilih} childNodeJML
* @param {Integer} i
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
    var j = Array.isArray(childNodeJML) ? jml.apply(void 0, _toConsumableArray(childNodeJML)) : jml(childNodeJML);
    cn.parentNode.replaceChild(j, cn);
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
    node.append(jml.apply(void 0, _toConsumableArray(childJML)));
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
    } else {
      node.append(jml.apply(void 0, _toConsumableArray(childJML)));
    }
  };
}
/**
* @private
* @static
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
* @typedef {PlainObject} JamilihAttributes
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
 * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers
 * that support); any element after element can be omitted, and any subsequent
 * type or types added afterwards.
 * @param {JamilihArray} args
 * @returns {JamilihReturn} The newly created (and possibly already appended)
 *   element or array of elements
 */


var jml = function jml() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var elem = doc.createDocumentFragment();
  /**
   *
   * @param {Object<{string: string}>} atts
   * @returns {void}
   */

  function _checkAtts(atts) {
    var att;

    for (att in atts) {
      if (!{}.hasOwnProperty.call(atts, att)) {
        continue;
      }

      var attVal = atts[att];
      att = att in ATTR_MAP ? ATTR_MAP[att] : att;

      if (NULLABLES.includes(att)) {
        if (!_isNullish(attVal)) {
          elem[att] = attVal;
        }

        continue;
      } else if (ATTR_DOM.includes(att)) {
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
            nodes[nodes.length] = _optsOrUndefinedJML(opts, attVal);
            break;
          }

        case '$shadow':
          {
            var open = attVal.open,
                closed = attVal.closed;
            var content = attVal.content,
                template = attVal.template;
            var shadowRoot = elem.attachShadow({
              mode: closed || open === false ? 'closed' : 'open'
            });

            if (template) {
              if (Array.isArray(template)) {
                if (_getType(template[0]) === 'object') {
                  // Has attributes
                  template = jml.apply(void 0, ['template'].concat(_toConsumableArray(template), [doc.body]));
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

        case 'is':
          {
            // Not yet supported in browsers
            // Handled during element creation
            break;
          }

        case '$custom':
          {
            Object.assign(elem, attVal);
            break;
          }

        case '$define':
          {
            var _ret = function () {
              var localName = elem.localName.toLowerCase(); // Note: customized built-ins sadly not working yet

              var customizedBuiltIn = !localName.includes('-');
              var def = customizedBuiltIn ? elem.getAttribute('is') : localName;

              if (customElements.get(def)) {
                return "break";
              }

              var getConstructor = function getConstructor(cnstrct) {
                var baseClass = options && options["extends"] ? doc.createElement(options["extends"]).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : HTMLElement;
                return cnstrct ?
                /*#__PURE__*/
                function (_baseClass) {
                  _inherits(_class, _baseClass);

                  function _class() {
                    var _this;

                    _classCallCheck(this, _class);

                    _this = _possibleConstructorReturn(this, _getPrototypeOf(_class).call(this));
                    cnstrct.call(_assertThisInitialized(_this));
                    return _this;
                  }

                  return _class;
                }(baseClass) :
                /*#__PURE__*/
                function (_baseClass2) {
                  _inherits(_class2, _baseClass2);

                  function _class2() {
                    _classCallCheck(this, _class2);

                    return _possibleConstructorReturn(this, _getPrototypeOf(_class2).apply(this, arguments));
                  }

                  return _class2;
                }(baseClass);
              };

              var cnstrctr = void 0,
                  options = void 0,
                  prototype = void 0;

              if (Array.isArray(attVal)) {
                if (attVal.length <= 2) {
                  var _attVal = _slicedToArray(attVal, 2);

                  cnstrctr = _attVal[0];
                  options = _attVal[1];

                  if (typeof options === 'string') {
                    options = {
                      "extends": options
                    };
                  } else if (!{}.hasOwnProperty.call(options, 'extends')) {
                    prototype = options;
                  }

                  if (_typeof(cnstrctr) === 'object') {
                    prototype = cnstrctr;
                    cnstrctr = getConstructor();
                  }
                } else {
                  var _attVal2 = _slicedToArray(attVal, 3);

                  cnstrctr = _attVal2[0];
                  prototype = _attVal2[1];
                  options = _attVal2[2];

                  if (typeof options === 'string') {
                    options = {
                      "extends": options
                    };
                  }
                }
              } else if (typeof attVal === 'function') {
                cnstrctr = attVal;
              } else {
                prototype = attVal;
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

              if (prototype) {
                Object.assign(cnstrctr.prototype, prototype);
              }

              customElements.define(def, cnstrctr, customizedBuiltIn ? options : undefined);
              return "break";
            }();

            if (_ret === "break") break;
          }

        case '$symbol':
          {
            var _attVal3 = _slicedToArray(attVal, 2),
                symbol = _attVal3[0],
                func = _attVal3[1];

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
              // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
              attVal.childNodes.forEach(_childrenToJML(_node2)); // Remove any extra nodes created by createHTMLDocument().

              var j = attVal.childNodes.length;

              while (_node2.childNodes[j]) {
                var cn = _node2.childNodes[j];
                cn.remove();
                j++;
              }
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
              }

              if (attVal.title) {
                _node2.title = attVal.title; // Appends after meta
              }

              if (attVal.head) {
                // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                attVal.head.forEach(_appendJML(head));
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
            /*
            // Todo:
            if (attVal.internalSubset) {
              node = {};
            }
            else
            */
            var _node3 = void 0;

            if (attVal.entities || attVal.notations) {
              _node3 = {
                name: attVal.name,
                nodeName: attVal.name,
                nodeValue: null,
                nodeType: 10,
                // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                entities: attVal.entities.map(_jmlSingleArg),
                // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                notations: attVal.notations.map(_jmlSingleArg),
                publicId: attVal.publicId,
                systemId: attVal.systemId // internalSubset: // Todo

              };
            } else {
              _node3 = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');
            }

            nodes[nodes.length] = _node3;
            break;
          }

        case '$ENTITY':
          {
            /*
            // Todo: Should we auto-copy another node's properties/methods (like DocumentType) excluding or changing its non-entity node values?
            const node = {
              nodeName: attVal.name,
              nodeValue: null,
              publicId: attVal.publicId,
              systemId: attVal.systemId,
              notationName: attVal.notationName,
              nodeType: 6,
              childNodes: attVal.childNodes.map(_DOMfromJMLOrString)
            };
            */
            break;
          }

        case '$NOTATION':
          {
            // Todo: We could add further properties/methods, but unlikely to be used as is.
            var _node4 = {
              nodeName: attVal[0],
              publicID: attVal[1],
              systemID: attVal[2],
              nodeValue: null,
              nodeType: 12
            };
            nodes[nodes.length] = _node4;
            break;
          }

        case '$on':
          {
            // Events
            for (var p2 in attVal) {
              if ({}.hasOwnProperty.call(attVal, p2)) {
                var val = attVal[p2];

                if (typeof val === 'function') {
                  val = [val, false];
                }

                if (typeof val[0] === 'function') {
                  _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing

                }
              }
            }

            break;
          }

        case 'className':
        case 'class':
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

                  if (value === null || _typeof(value) !== 'object') {
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
            elem.innerHTML = attVal;
          }

          break;
        // #endif

        case 'htmlFor':
        case 'for':
          if (elStr === 'label') {
            if (!_isNullish(attVal)) {
              elem.htmlFor = attVal;
            }

            break;
          }

          elem.setAttribute(att, attVal);
          break;

        case 'xmlns':
          // Already handled
          break;

        default:
          {
            if (att.startsWith('on')) {
              elem[att] = attVal; // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event

              break;
            }

            if (att === 'style') {
              if (_isNullish(attVal)) {
                break;
              }

              if (_typeof(attVal) === 'object') {
                for (var _p in attVal) {
                  if ({}.hasOwnProperty.call(attVal, _p) && !_isNullish(attVal[_p])) {
                    // Todo: Handle aggregate properties like "border"
                    if (_p === 'float') {
                      elem.style.cssFloat = attVal[_p];
                      elem.style.styleFloat = attVal[_p]; // Harmless though we could make conditional on older IE instead
                    } else {
                      elem.style[_p.replace(hyphenForCamelCase, _upperCase)] = attVal[_p];
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

            var matchingPlugin = opts && opts.$plugins && opts.$plugins.find(function (p) {
              return p.name === att;
            });

            if (matchingPlugin) {
              matchingPlugin.set({
                element: elem,
                attribute: {
                  name: att,
                  value: attVal
                }
              });
              break;
            }

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

    if (opts.state !== 'child') {
      isRoot = true;
      opts.state = 'child';
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
        if (!pluginObj) {
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
  }

  var argc = args.length;
  var defaultMap = opts && opts.$map && opts.$map.root;

  var setMap = function setMap(dataVal) {
    var map, obj; // Boolean indicating use of default map and object

    if (dataVal === true) {
      var _defaultMap = _slicedToArray(defaultMap, 2);

      map = _defaultMap[0];
      obj = _defaultMap[1];
    } else if (Array.isArray(dataVal)) {
      // Array of strings mapping to default
      if (typeof dataVal[0] === 'string') {
        dataVal.forEach(function (dVal) {
          setMap(opts.$map[dVal]);
        }); // Array of Map and non-map data object
      } else {
        map = dataVal[0] || defaultMap[0];
        obj = dataVal[1] || defaultMap[1];
      } // Map

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

    switch (_getType(arg)) {
      default:
        // Todo: Throw here instead?
        break;

      case 'null':
        // null always indicates a place-holder (only needed for last argument if want array returned)
        if (i === argc - 1) {
          _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
          // Todo: Fix to allow application of stylesheets of style tags within fragments?


          return nodes.length <= 1 ? nodes[0] // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
          : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
        }

        break;

      case 'string':
        // Strings indicate elements
        switch (arg) {
          case '!':
            nodes[nodes.length] = doc.createComment(args[++i]);
            break;

          case '?':
            {
              arg = args[++i];
              var procValue = args[++i];
              var val = procValue;

              if (_typeof(val) === 'object') {
                procValue = [];

                for (var p in val) {
                  if ({}.hasOwnProperty.call(val, p)) {
                    procValue.push(p + '=' + '"' + // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                    val[p].replace(/"/g, '&quot;') + '"');
                  }
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
            nodes[nodes.length] = doc.createDocumentFragment();
            break;

          default:
            {
              // An element
              elStr = arg;
              var atts = args[i + 1]; // Todo: Fix this to depend on XML/config, not availability of methods

              if (_getType(atts) === 'object' && atts.is) {
                var is = atts.is;

                if (doc.createElementNS) {
                  elem = doc.createElementNS(NS_HTML, elStr, {
                    is: is
                  });
                } else {
                  elem = doc.createElement(elStr, {
                    is: is
                  });
                }
              } else if (doc.createElementNS) {
                elem = doc.createElementNS(NS_HTML, elStr);
              } else {
                elem = doc.createElement(elStr);
              }

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

            if (_typeof(_atts.xmlns) === 'object') {
              replacer = _replaceDefiner(_atts.xmlns);
            } else {
              replacer = ' xmlns="' + _atts.xmlns + '"';
            } // try {
            // Also fix DOMParser to work with text/html


            elem = nodes[nodes.length - 1] = new DOMParser().parseFromString(new XmlSerializer().serializeToString(elem) // Mozilla adds XHTML namespace
            .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement; // }catch(e) {alert(elem.outerHTML);throw e;}
          } // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


          var orderedArr = _atts.$a ? _atts.$a.map(_copyOrderedAtts) : [_atts]; // eslint-disable-next-line unicorn/no-fn-reference-in-iterator

          orderedArr.forEach(_checkAtts);
          break;
        }

      case 'fragment':
      case 'element':
        /*
        1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
        2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
        */
        if (i === 0) {
          // Allow wrapping of element
          elem = arg;
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

            var childContentType = _typeof(childContent);

            if (childContent === undefined) {
              throw String('Parent array:' + JSON.stringify(args) + '; child: ' + child + '; index:' + j);
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
                  _appendNode(elem, _optsOrUndefinedJML.apply(void 0, [opts].concat(_toConsumableArray(childContent))));
                } else if (childContent['#']) {
                  // Fragment
                  _appendNode(elem, _optsOrUndefinedJML(opts, childContent['#']));
                } else {
                  // Single DOM element children
                  _appendNode(elem, childContent);
                }

                break;
            }
          }

          break;
        }
    }
  }

  var ret = nodes[0] || elem;

  if (opts && isRoot && opts.$map && opts.$map.root) {
    setMap(true);
  }

  return ret;
};
/**
* Converts a DOM object or a string of HTML into a Jamilih object (or string).
* @param {string|HTMLElement} [dom=document.documentElement] Defaults to converting the current document.
* @param {PlainObject} [config] Configuration object
* @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
* @returns {JamilihArray|string} Array containing the elements which represent
* a Jamilih object, or, if `stringOutput` is true, it will be the stringified
* version of such an object
*/


jml.toJML = function (dom, config) {
  config = config || {
    stringOutput: false
  };

  if (typeof dom === 'string') {
    dom = new DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
  }
  var ret = [];
  var parent = ret;
  var parentIdx = 0;
  /**
   *
   * @throws {DOMException}
   * @returns {void}
   */

  function invalidStateError() {
    // These are probably only necessary if working with text/html
    // eslint-disable-next-line no-shadow
    var DOMException = function DOMException() {
      _classCallCheck(this, DOMException);
    };

    {
      // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
      // Since we can't instantiate without this (at least in Mozilla), this mimicks at least (good idea?)
      var e = new DOMException();
      e.code = 11;
      throw e;
    }
  }
  /**
   *
   * @param {DocumentType|Entity|Notation} obj
   * @param {Node} node
   * @returns {void}
   */


  function addExternalID(obj, node) {
    if (node.systemId.includes('"') && node.systemId.includes("'")) {
      invalidStateError();
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
      invalidStateError();
    }
    */
    var type = 'nodeType' in node ? node.nodeType : null;
    namespaces = _objectSpread2({}, namespaces);
    var xmlChars = /([\t\n\r -\uD7FF\uE000-\uFFFD]|(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF]))(?:(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))*$/; // eslint-disable-line no-control-regex

    if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
      invalidStateError();
    }

    var children, start, tmpParent, tmpParentIdx;
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
          start = {};
          var hasNamespaceDeclaration = false;

          if (namespaces[node.prefix || ''] !== node.namespaceURI) {
            namespaces[node.prefix || ''] = node.namespaceURI;

            if (node.prefix) {
              start['xmlns:' + node.prefix] = node.namespaceURI;
            } else if (node.namespaceURI) {
              start.xmlns = node.namespaceURI;
            }

            hasNamespaceDeclaration = true;
          }

          if (node.attributes.length) {
            set(_toConsumableArray(node.attributes).reduce(function (obj, att) {
              obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value

              return obj;
            }, start));
          } else if (hasNamespaceDeclaration) {
            set(start);
          }

          children = node.childNodes;

          if (children.length) {
            setChildren(); // Element children array container

            _toConsumableArray(children).forEach(function (childNode) {
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
        if (config.stripWhitespace && /^[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$/.test(node.nodeValue)) {
          return;
        }

        set(node.nodeValue);
        break;

      case 4:
        // CDATA
        if (node.nodeValue.includes(']]' + '>')) {
          invalidStateError();
        }

        set(['![', node.nodeValue]);
        break;

      case 5:
        // ENTITY REFERENCE (probably not used in browsers since already resolved)
        set(['&', node.nodeName]);
        break;

      case 6:
        // ENTITY (would need to pass in directly)
        setTemp();
        start = {};

        if (node.xmlEncoding || node.xmlVersion) {
          // an external entity file?
          start.$ENTITY = {
            name: node.nodeName,
            version: node.xmlVersion,
            encoding: node.xmlEncoding
          };
        } else {
          start.$ENTITY = {
            name: node.nodeName
          };

          if (node.publicId || node.systemId) {
            // External Entity?
            addExternalID(start.$ENTITY, node);

            if (node.notationName) {
              start.$ENTITY.NDATA = node.notationName;
            }
          }
        }

        set(start);
        children = node.childNodes;

        if (children.length) {
          start.$ENTITY.childNodes = []; // Set position to $ENTITY's childNodes array children

          setObj('$ENTITY', 'childNodes');

          _toConsumableArray(children).forEach(function (childNode) {
            parseDOM(childNode, namespaces);
          });
        }

        resetTemp();
        break;

      case 7:
        // PROCESSING INSTRUCTION
        if (/^xml$/i.test(node.target)) {
          invalidStateError();
        }

        if (node.target.includes('?>')) {
          invalidStateError();
        }

        if (node.target.includes(':')) {
          invalidStateError();
        }

        if (node.data.includes('?>')) {
          invalidStateError();
        }

        set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes

        break;

      case 8:
        // COMMENT
        if (node.nodeValue.includes('--') || node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1) {
          invalidStateError();
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

          if (config.xmlDeclaration) {
            docObj.$document.xmlDeclaration = {
              version: doc.xmlVersion,
              encoding: doc.xmlEncoding,
              standAlone: doc.xmlStandalone
            };
          }

          set(docObj); // doc.implementation.createHTMLDocument
          // Set position to fragment's array children

          setObj('$document', 'childNodes');
          children = node.childNodes;

          if (!children.length) {
            invalidStateError();
          } // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally


          _toConsumableArray(children).forEach(function (childNode) {
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

          start = {
            $DOCTYPE: {
              name: node.name
            }
          };

          if (node.internalSubset) {
            start.internalSubset = node.internalSubset;
          }

          var pubIdChar = /^( |\r|\n|[0-9A-Za-z]|[!#-%'-\/:;=\?@_])*$/; // eslint-disable-line no-control-regex

          if (!pubIdChar.test(node.publicId)) {
            invalidStateError();
          }

          addExternalID(start.$DOCTYPE, node); // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD

          set(start); // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?

          var entities = node.entities; // Currently deprecated

          if (entities && entities.length) {
            start.$DOCTYPE.entities = [];
            setObj('$DOCTYPE', 'entities');

            _toConsumableArray(entities).forEach(function (entity) {
              parseDOM(entity, namespaces);
            }); // Reset for notations


            parent = tmpParent;
            parentIdx = tmpParentIdx + 1;
          }

          var notations = node.notations; // Currently deprecated

          if (notations && notations.length) {
            start.$DOCTYPE.notations = [];
            setObj('$DOCTYPE', 'notations');

            _toConsumableArray(notations).forEach(function (notation) {
              parseDOM(notation, namespaces);
            });
          }

          resetTemp();
          break;
        }

      case 11:
        // DOCUMENT FRAGMENT
        setTemp();
        set({
          '#': []
        }); // Set position to fragment's array children

        setObj('#');
        children = node.childNodes;

        _toConsumableArray(children).forEach(function (childNode) {
          // No need for setChildren, as we have already built the container array
          parseDOM(childNode, namespaces);
        });

        resetTemp();
        break;

      case 12:
        // NOTATION
        start = {
          $NOTATION: {
            name: node.nodeName
          }
        };
        addExternalID(start.$NOTATION, node);
        set(start);
        break;

      default:
        throw new TypeError('Not an XML type');
    }
  }

  parseDOM(dom, {});

  if (config.stringOutput) {
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
 * @param {JamilihArray} args
 * @returns {JamilihReturn}
 */


jml.toDOM = function () {
  // Alias for jml()
  return jml.apply(void 0, arguments);
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toHTML = function () {
  // Todo: Replace this with version of jml() that directly builds a string
  var ret = jml.apply(void 0, arguments); // Todo: deal with serialization of properties like 'selected', 'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*', 'style'! (i.e., need to build a string ourselves)

  return ret.outerHTML;
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toDOMString = function () {
  // Alias for jml.toHTML for parity with jml.toJMLString
  return jml.toHTML.apply(jml, arguments);
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toXML = function () {
  var ret = jml.apply(void 0, arguments);
  return new XmlSerializer().serializeToString(ret);
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toXMLDOMString = function () {
  // Alias for jml.toXML for parity with jml.toJMLString
  return jml.toXML.apply(jml, arguments);
};

var JamilihMap =
/*#__PURE__*/
function (_Map) {
  _inherits(JamilihMap, _Map);

  function JamilihMap() {
    _classCallCheck(this, JamilihMap);

    return _possibleConstructorReturn(this, _getPrototypeOf(JamilihMap).apply(this, arguments));
  }

  _createClass(JamilihMap, [{
    key: "get",
    value: function get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihMap.prototype), "get", this).call(this, elem);
    }
  }, {
    key: "set",
    value: function set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihMap.prototype), "set", this).call(this, elem, value);
    }
  }, {
    key: "invoke",
    value: function invoke(elem, methodName) {
      var _this$get;

      elem = typeof elem === 'string' ? $(elem) : elem;

      for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return (_this$get = this.get(elem))[methodName].apply(_this$get, [elem].concat(args));
    }
  }]);

  return JamilihMap;
}(_wrapNativeSuper(Map));

var JamilihWeakMap =
/*#__PURE__*/
function (_WeakMap) {
  _inherits(JamilihWeakMap, _WeakMap);

  function JamilihWeakMap() {
    _classCallCheck(this, JamilihWeakMap);

    return _possibleConstructorReturn(this, _getPrototypeOf(JamilihWeakMap).apply(this, arguments));
  }

  _createClass(JamilihWeakMap, [{
    key: "get",
    value: function get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihWeakMap.prototype), "get", this).call(this, elem);
    }
  }, {
    key: "set",
    value: function set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihWeakMap.prototype), "set", this).call(this, elem, value);
    }
  }, {
    key: "invoke",
    value: function invoke(elem, methodName) {
      var _this$get2;

      elem = typeof elem === 'string' ? $(elem) : elem;

      for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      return (_this$get2 = this.get(elem))[methodName].apply(_this$get2, [elem].concat(args));
    }
  }]);

  return JamilihWeakMap;
}(_wrapNativeSuper(WeakMap));

jml.Map = JamilihMap;
jml.WeakMap = JamilihWeakMap;

jml.weak = function (obj) {
  var map = new JamilihWeakMap();

  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  var elem = jml.apply(void 0, [{
    $map: [map, obj]
  }].concat(args));
  return [map, elem];
};

jml.strong = function (obj) {
  var map = new JamilihMap();

  for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    args[_key6 - 1] = arguments[_key6];
  }

  var elem = jml.apply(void 0, [{
    $map: [map, obj]
  }].concat(args));
  return [map, elem];
};

jml.symbol = jml.sym = jml["for"] = function (elem, sym) {
  elem = typeof elem === 'string' ? $(elem) : elem;
  return elem[_typeof(sym) === 'symbol' ? sym : Symbol["for"](sym)];
};

jml.command = function (elem, symOrMap, methodName) {
  var _func3;

  elem = typeof elem === 'string' ? $(elem) : elem;
  var func;

  for (var _len7 = arguments.length, args = new Array(_len7 > 3 ? _len7 - 3 : 0), _key7 = 3; _key7 < _len7; _key7++) {
    args[_key7 - 3] = arguments[_key7];
  }

  if (['symbol', 'string'].includes(_typeof(symOrMap))) {
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

jml.setWindow = function (wind) {
  win = wind;
};

jml.setDocument = function (docum) {
  doc = docum;

  if (docum && docum.body) {
    body = docum.body;
  }
};

jml.setXMLSerializer = function (xmls) {
  XmlSerializer = xmls;
};

jml.getWindow = function () {
  return win;
};

jml.getDocument = function () {
  return doc;
};

jml.getXMLSerializer = function () {
  return XmlSerializer;
};
/**
 * Does not run Jamilih so can be further processed.
 * @param {JamilihArray} jmlArray
 * @param {string|JamilihArray|Element} glu
 * @returns {Element}
 */


function glue(jmlArray, glu) {
  return _toConsumableArray(jmlArray).reduce(function (arr, item) {
    arr.push(item, glu);
    return arr;
  }, []).slice(0, -1);
}

var body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

var nbsp = "\xA0"; // Very commonly needed in templates

export default jml;
export { $, $$, body, glue, jml, nbsp };
