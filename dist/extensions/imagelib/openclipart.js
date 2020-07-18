(function () {
  'use strict';

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
  let win = typeof window !== 'undefined' && window; // istanbul ignore next

  let doc = typeof document !== 'undefined' && document || win && win.document; // STATIC PROPERTIES

  const possibleOptions = ['$plugins', // '$mode', // Todo (SVG/XML)
  // '$state', // Used internally
  '$map' // Add any other options here
  ];
  const NS_HTML = 'http://www.w3.org/1999/xhtml',
        hyphenForCamelCase = /-([a-z])/gu;
  const ATTR_MAP = {
    maxlength: 'maxLength',
    minlength: 'minLength',
    readonly: 'readOnly'
  }; // We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
  // We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
  //   (e.g., from an empty variable) on templates to have no effect

  const BOOL_ATTS = ['checked', 'defaultChecked', 'defaultSelected', 'disabled', 'indeterminate', 'open', // Dialog elements
  'readOnly', 'selected']; // From JsonML

  const ATTR_DOM = BOOL_ATTS.concat(['accessKey', // HTMLElement
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

  const NULLABLES = ['autocomplete', 'dir', // HTMLElement
  'integrity', // script, link
  'lang', // HTMLElement
  'max', 'min', 'minLength', 'maxLength', 'title' // HTMLElement
  ];

  const $ = sel => doc.querySelector(sel);
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
      const ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful

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
    const parentName = _getHTMLNodeName(parent); // IE only
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
      const childName = _getHTMLNodeName(child); // istanbul ignore next


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
    if (!arg.match(/^\w+$/u)) {
      throw new TypeError(`Bad ${type} reference; with prefix "${prefix}" and arg "${arg}"`);
    }

    const elContainer = doc.createElement('div'); // Todo: No workaround for XML?
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
    const type = typeof item;

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
      let retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0; // Preserve XHTML

      for (const [ns, xmlnsVal] of Object.entries(xmlnsObj)) {
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
      const cn = node.childNodes[i];
      const j = Array.isArray(childNodeJML) ? jml(...childNodeJML) : jml(childNodeJML);
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
        node.append(jml(...childJML));
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
        node.append(jml(...childJML));
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

    if (attVal && typeof attVal === 'object') {
      const matchingPlugin = getMatchingPlugin(opts, Object.keys(attVal)[0]);

      if (matchingPlugin) {
        return matchingPlugin.set({
          opts,
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
    return opts.$plugins && opts.$plugins.find(p => {
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


  const jml = function jml(...args) {
    let elem = doc.createDocumentFragment();
    /**
     *
     * @param {Object<{string: string}>} atts
     * @returns {void}
     */

    function _checkAtts(atts) {
      for (let [att, attVal] of Object.entries(atts)) {
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
              const {
                open,
                closed
              } = attVal;
              let {
                content,
                template
              } = attVal;
              const shadowRoot = elem.attachShadow({
                mode: closed || open === false ? 'closed' : 'open'
              });

              if (template) {
                if (Array.isArray(template)) {
                  if (_getType(template[0]) === 'object') {
                    // Has attributes
                    template = jml('template', ...template, doc.body);
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
              const localName = elem.localName.toLowerCase(); // Note: customized built-ins sadly not working yet

              const customizedBuiltIn = !localName.includes('-'); // We check attribute in case this is a preexisting DOM element
              // const {is} = atts;

              let is;

              if (customizedBuiltIn) {
                is = elem.getAttribute('is');

                if (!is) {
                  if (!{}.hasOwnProperty.call(atts, 'is')) {
                    throw new TypeError(`Expected \`is\` with \`$define\` on built-in; args: ${JSON.stringify(args)}`);
                  }

                  atts.is = checkPluginValue(elem, 'is', atts.is, opts);
                  elem.setAttribute('is', atts.is);
                  ({
                    is
                  } = atts);
                }
              }

              const def = customizedBuiltIn ? is : localName;

              if (window.customElements.get(def)) {
                break;
              }

              const getConstructor = cnstrct => {
                const baseClass = options && options.extends ? doc.createElement(options.extends).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : window.HTMLElement;
                /**
                 * Class wrapping base class.
                 */

                return cnstrct ? class extends baseClass {
                  /**
                   * Calls user constructor.
                   */
                  constructor() {
                    super();
                    cnstrct.call(this);
                  }

                } : class extends baseClass {};
              };

              let cnstrctr, options, mixin;

              if (Array.isArray(attVal)) {
                if (attVal.length <= 2) {
                  [cnstrctr, options] = attVal;

                  if (typeof options === 'string') {
                    // Todo: Allow creating a definition without using it;
                    //  that may be the only reason to have a string here which
                    //  differs from the `localName` anyways
                    options = {
                      extends: options
                    };
                  } else if (options && !{}.hasOwnProperty.call(options, 'extends')) {
                    mixin = options;
                  }

                  if (typeof cnstrctr === 'object') {
                    mixin = cnstrctr;
                    cnstrctr = getConstructor();
                  }
                } else {
                  [cnstrctr, mixin, options] = attVal;

                  if (typeof options === 'string') {
                    options = {
                      extends: options
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
                  extends: localName
                };
              }

              if (mixin) {
                Object.entries(mixin).forEach(([methodName, method]) => {
                  cnstrctr.prototype[methodName] = method;
                });
              } // console.log('def', def, '::', typeof options === 'object' ? options : undefined);


              window.customElements.define(def, cnstrctr, typeof options === 'object' ? options : undefined);
              break;
            }

          case '$symbol':
            {
              const [symbol, func] = attVal;

              if (typeof func === 'function') {
                const funcBound = func.bind(elem);

                if (typeof symbol === 'string') {
                  elem[Symbol.for(symbol)] = funcBound;
                } else {
                  elem[symbol] = funcBound;
                }
              } else {
                const obj = func;
                obj.elem = elem;

                if (typeof symbol === 'string') {
                  elem[Symbol.for(symbol)] = obj;
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
              const node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
              node.value = attVal[attVal.length - 1];
              nodes[nodes.length] = node;
              break;
            }

          case '$text':
            {
              // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
              const node = doc.createTextNode(attVal);
              nodes[nodes.length] = node;
              break;
            }

          case '$document':
            {
              // Todo: Conditionally create XML document
              const node = doc.implementation.createHTMLDocument();

              if (attVal.childNodes) {
                // Remove any extra nodes created by createHTMLDocument().
                const j = attVal.childNodes.length;

                while (node.childNodes[j]) {
                  const cn = node.childNodes[j];
                  cn.remove(); // `j` should stay the same as removing will cause node to be present
                } // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


                attVal.childNodes.forEach(_childrenToJML(node));
              } else {
                if (attVal.$DOCTYPE) {
                  const dt = {
                    $DOCTYPE: attVal.$DOCTYPE
                  };
                  const doctype = jml(dt);
                  node.firstChild.replaceWith(doctype);
                }

                const html = node.childNodes[1];
                const head = html.childNodes[0];
                const body = html.childNodes[1];

                if (attVal.title || attVal.head) {
                  const meta = doc.createElement('meta');
                  meta.setAttribute('charset', 'utf-8');
                  head.append(meta);

                  if (attVal.title) {
                    node.title = attVal.title; // Appends after meta
                  }

                  if (attVal.head) {
                    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                    attVal.head.forEach(_appendJML(head));
                  }
                }

                if (attVal.body) {
                  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                  attVal.body.forEach(_appendJMLOrText(body));
                }
              }

              nodes[nodes.length] = node;
              break;
            }

          case '$DOCTYPE':
            {
              const node = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');
              nodes[nodes.length] = node;
              break;
            }

          case '$on':
            {
              // Events
              // Allow for no-op by defaulting to `{}`
              for (let [p2, val] of Object.entries(attVal || {})) {
                if (typeof val === 'function') {
                  val = [val, false];
                }

                if (typeof val[0] !== 'function') {
                  throw new TypeError(`Expect a function for \`$on\`; args: ${JSON.stringify(args)}`);
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
              // Map can be keyed with hyphenated or camel-cased properties
              const recurse = (atVal, startProp) => {
                let prop = '';
                const pastInitialProp = startProp !== '';
                Object.keys(atVal).forEach(key => {
                  const value = atVal[key];

                  if (pastInitialProp) {
                    prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/u, _upperCase);
                  } else {
                    prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                  }

                  if (value === null || typeof value !== 'object') {
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
              break; // Todo: Disable this by default unless configuration explicitly allows (for security)
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

                if (typeof attVal === 'object') {
                  for (const [p2, styleVal] of Object.entries(attVal)) {
                    if (!_isNullish(styleVal)) {
                      // Todo: Handle aggregate properties like "border"
                      if (p2 === 'float') {
                        elem.style.cssFloat = styleVal;
                        elem.style.styleFloat = styleVal; // Harmless though we could make conditional on older IE instead
                      } else {
                        elem.style[p2.replace(hyphenForCamelCase, _upperCase)] = styleVal;
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

              const matchingPlugin = getMatchingPlugin(opts, att);

              if (matchingPlugin) {
                matchingPlugin.set({
                  opts,
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

    const nodes = [];
    let elStr;
    let opts;
    let isRoot = false;

    if (_getType(args[0]) === 'object' && Object.keys(args[0]).some(key => possibleOptions.includes(key))) {
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
          throw new TypeError(`\`$plugins\` must be an array; args: ${JSON.stringify(args)}`);
        }

        opts.$plugins.forEach(pluginObj => {
          if (!pluginObj || typeof pluginObj !== 'object') {
            throw new TypeError(`Plugin must be an object; args: ${JSON.stringify(args)}`);
          }

          if (!pluginObj.name || !pluginObj.name.startsWith('$_')) {
            throw new TypeError(`Plugin object name must be present and begin with \`$_\`; args: ${JSON.stringify(args)}`);
          }

          if (typeof pluginObj.set !== 'function') {
            throw new TypeError(`Plugin object must have a \`set\` method; args: ${JSON.stringify(args)}`);
          }
        });
      }

      args = args.slice(1);
    } else {
      opts = {
        $state: undefined
      };
    }

    const argc = args.length;
    const defaultMap = opts.$map && opts.$map.root;

    const setMap = dataVal => {
      let map, obj; // Boolean indicating use of default map and object

      if (dataVal === true) {
        [map, obj] = defaultMap;
      } else if (Array.isArray(dataVal)) {
        // Array of strings mapping to default
        if (typeof dataVal[0] === 'string') {
          dataVal.forEach(dVal => {
            setMap(opts.$map[dVal]);
          });
          return; // Array of Map and non-map data object
        }

        map = dataVal[0] || defaultMap[0];
        obj = dataVal[1] || defaultMap[1]; // Map
      } else if (/^\[object (?:Weak)?Map\]$/u.test([].toString.call(dataVal))) {
        map = dataVal;
        obj = defaultMap[1]; // Non-map data object
      } else {
        map = defaultMap[0];
        obj = dataVal;
      }

      map.set(elem, obj);
    };

    for (let i = 0; i < argc; i++) {
      let arg = args[i];

      const type = _getType(arg);

      switch (type) {
        default:
          throw new TypeError(`Unexpected type: ${type}; arg: ${arg}; index ${i} on args: ${JSON.stringify(args)}`);

        case 'null':
          // null always indicates a place-holder (only needed for last argument if want array returned)
          if (i === argc - 1) {
            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
            // Todo: Fix to allow application of stylesheets of style tags within fragments?


            return nodes.length <= 1 ? nodes[0] // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
            : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
          }

          throw new TypeError(`\`null\` values not allowed except as final Jamilih argument; index ${i} on args: ${JSON.stringify(args)}`);

        case 'string':
          // Strings normally indicate elements
          switch (arg) {
            case '!':
              nodes[nodes.length] = doc.createComment(args[++i]);
              break;

            case '?':
              {
                arg = args[++i];
                let procValue = args[++i];
                const val = procValue;

                if (val && typeof val === 'object') {
                  procValue = [];

                  for (const [p, procInstVal] of Object.entries(val)) {
                    procValue.push(p + '=' + '"' + // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                    procInstVal.replace(/"/gu, '&quot;') + '"');
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
                const atts = args[i + 1];

                if (_getType(atts) === 'object' && atts.is) {
                  const {
                    is
                  } = atts; // istanbul ignore else

                  if (doc.createElementNS) {
                    elem = doc.createElementNS(NS_HTML, elStr, {
                      is
                    });
                  } else {
                    elem = doc.createElement(elStr, {
                      is
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
            const atts = arg;

            if (atts.xmlns !== undefined) {
              // We handle this here, as otherwise may lose events, etc.
              // As namespace of element already set as XHTML, we need to change the namespace
              // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
              // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
              let replacer;

              if (typeof atts.xmlns === 'object') {
                replacer = _replaceDefiner(atts.xmlns);
              } else {
                replacer = ' xmlns="' + atts.xmlns + '"';
              } // try {
              // Also fix DOMParser to work with text/html


              elem = nodes[nodes.length - 1] = new win.DOMParser().parseFromString(new win.XMLSerializer().serializeToString(elem) // Mozilla adds XHTML namespace
              .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement; // Todo: Report to plugins

              opts.$state = 'element'; // }catch(e) {alert(elem.outerHTML);throw e;}
            }

            _checkAtts(atts);

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
            const elsl = nodes.length;

            for (let k = 0; k < elsl; k++) {
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
            const child = arg;
            const cl = child.length;

            for (let j = 0; j < cl; j++) {
              // Go through children array container to handle elements
              const childContent = child[j];
              const childContentType = typeof childContent;

              if (_isNullish(childContent)) {
                throw new TypeError(`Bad children (parent array: ${JSON.stringify(args)}; index ${j} of child: ${JSON.stringify(child)})`);
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

                    _appendNode(elem, jml(opts, ...childContent));
                  } else if (childContent['#']) {
                    // Fragment
                    opts.$state = 'fragmentChildren';

                    _appendNode(elem, jml(opts, childContent['#']));
                  } else {
                    // Single DOM element children
                    const newChildContent = checkPluginValue(elem, null, childContent, opts);

                    _appendNode(elem, newChildContent);
                  }

                  break;
              }
            }

            break;
          }
      }
    }

    const ret = nodes[0] || elem;

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


  jml.toJML = function (dom, {
    stringOutput = false,
    reportInvalidState = true,
    stripWhitespace = false
  } = {}) {
    if (typeof dom === 'string') {
      dom = new win.DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    const ret = [];
    let parent = ret;
    let parentIdx = 0;
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
      class DOMException extends Error {
        /* eslint-enable no-shadow, unicorn/custom-error-definition */

        /**
         * @param {string} message
         * @param {string} name
         */
        constructor(message, name) {
          super(message); // eslint-disable-next-line unicorn/custom-error-definition

          this.name = name;
        }

      }

      if (reportInvalidState) {
        // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
        const e = new DOMException(msg, 'INVALID_STATE_ERR');
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

      const {
        publicId,
        systemId
      } = node;

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
      const type = 'nodeType' in node ? node.nodeType : null;
      namespaces = _extends({}, namespaces);
      const xmlChars = /^([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/u; // eslint-disable-line no-control-regex

      if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
        invalidStateError('Node has bad XML character value');
      }

      let tmpParent, tmpParentIdx;
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
            const nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

            setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays

            set(nodeName);
            const start = {};
            let hasNamespaceDeclaration = false;

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
              set([...node.attributes].reduce(function (obj, att) {
                obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value

                return obj;
              }, start));
            } else if (hasNamespaceDeclaration) {
              set(start);
            }

            const {
              childNodes
            } = node;

            if (childNodes.length) {
              setChildren(); // Element children array container

              [...childNodes].forEach(function (childNode) {
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
          if (stripWhitespace && /^\s+$/u.test(node.nodeValue)) {
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
          if (/^xml$/iu.test(node.target)) {
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
            const docObj = {
              $document: {
                childNodes: []
              }
            };
            set(docObj); // doc.implementation.createHTMLDocument
            // Set position to fragment's array children

            setObj('$document', 'childNodes');
            const {
              childNodes
            } = node;

            if (!childNodes.length) {
              invalidStateError('Documents must have a child node');
            } // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally


            [...childNodes].forEach(function (childNode) {
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

            const start = {
              $DOCTYPE: {
                name: node.name
              }
            };
            const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/u; // eslint-disable-line no-control-regex

            if (!pubIdChar.test(node.publicId)) {
              invalidStateError('A publicId must have valid characters.');
            }

            addExternalID(start.$DOCTYPE, node); // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD

            set(start); // Auto-generate the internalSubset instead?

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
            const {
              childNodes
            } = node;
            [...childNodes].forEach(function (childNode) {
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


  jml.toDOM = function (...args) {
    // Alias for jml()
    return jml(...args);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toHTML = function (...args) {
    // Todo: Replace this with version of jml() that directly builds a string
    const ret = jml(...args); // Todo: deal with serialization of properties like 'selected',
    //  'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*',
    //  'style'! (i.e., need to build a string ourselves)

    return ret.outerHTML;
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toDOMString = function (...args) {
    // Alias for jml.toHTML for parity with jml.toJMLString
    return jml.toHTML(...args);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXML = function (...args) {
    const ret = jml(...args);
    return new win.XMLSerializer().serializeToString(ret);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXMLDOMString = function (...args) {
    // Alias for jml.toXML for parity with jml.toJMLString
    return jml.toXML(...args);
  };
  /**
   * Element-aware wrapper for `Map`.
   */


  class JamilihMap extends Map {
    /**
     * @param {string|Element} elem
     * @returns {any}
     */
    get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.get.call(this, elem);
    }
    /**
     * @param {string|Element} elem
     * @param {any} value
     * @returns {any}
     */


    set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.set.call(this, elem, value);
    }
    /**
     * @param {string|Element} elem
     * @param {string} methodName
     * @param {...any} args
     * @returns {any}
     */


    invoke(elem, methodName, ...args) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return this.get(elem)[methodName](elem, ...args);
    }

  }
  /**
   * Element-aware wrapper for `WeakMap`.
   */


  class JamilihWeakMap extends WeakMap {
    /**
     * @param {string|Element} elem
     * @returns {any}
     */
    get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.get.call(this, elem);
    }
    /**
     * @param {string|Element} elem
     * @param {any} value
     * @returns {any}
     */


    set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.set.call(this, elem, value);
    }
    /**
     * @param {string|Element} elem
     * @param {string} methodName
     * @param {...any} args
     * @returns {any}
     */


    invoke(elem, methodName, ...args) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return this.get(elem)[methodName](elem, ...args);
    }

  }

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

  jml.weak = function (obj, ...args) {
    const map = new JamilihWeakMap();
    const elem = jml({
      $map: [map, obj]
    }, ...args);
    return [map, elem];
  };
  /**
   * @param {any} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */


  jml.strong = function (obj, ...args) {
    const map = new JamilihMap();
    const elem = jml({
      $map: [map, obj]
    }, ...args);
    return [map, elem];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string} sym If a string, will be used with `Symbol.for`
   * @returns {any} The value associated with the symbol
   */


  jml.symbol = jml.sym = jml.for = function (elem, sym) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    return elem[typeof sym === 'symbol' ? sym : Symbol.for(sym)];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string|Map|WeakMap} symOrMap If a string, will be used with `Symbol.for`
   * @param {string|any} methodName Can be `any` if the symbol or map directly
   *   points to a function (it is then used as the first argument).
   * @param {any[]} args
   * @returns {any}
   */


  jml.command = function (elem, symOrMap, methodName, ...args) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    let func;

    if (['symbol', 'string'].includes(typeof symOrMap)) {
      func = jml.sym(elem, symOrMap);

      if (typeof func === 'function') {
        return func(methodName, ...args); // Already has `this` bound to `elem`
      }

      return func[methodName](...args);
    }

    func = symOrMap.get(elem);

    if (typeof func === 'function') {
      return func.call(elem, methodName, ...args);
    }

    return func[methodName](elem, ...args); // return func[methodName].call(elem, ...args);
  };
  /**
   * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
   * Also updates `body` with `document.body`.
   * @param {Window} wind
   * @returns {void}
   */


  jml.setWindow = wind => {
    win = wind;
    doc = win.document;

    if (doc && doc.body) {
      ({
        body
      } = doc);
    }
  };
  /**
   * @returns {Window}
   */


  jml.getWindow = () => {
    return win;
  };


  let body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

  const nbsp = '\u00A0'; // Very commonly needed in templates

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
  class QueryResult extends Array {}

  const {
    create,
    defineProperty
  } = Object;
  const AP = Array.prototype;
  const DOM_CONTENT_LOADED = 'DOMContentLoaded';
  const LOAD = 'load';
  const NO_TRANSPILER_ISSUES = new QueryResult() instanceof QueryResult;
  const QRP = QueryResult.prototype; // fixes methods returning non QueryResult

  /* istanbul ignore if */

  if (!NO_TRANSPILER_ISSUES) Object.getOwnPropertyNames(AP).forEach(name => {
    const desc = Object.getOwnPropertyDescriptor(AP, name);

    if (typeof desc.value === 'function') {
      const fn = desc.value;

      desc.value = function () {
        const result = fn.apply(this, arguments);
        return result instanceof Array ? patch(result) : result;
      };
    }

    defineProperty(QRP, name, desc);
  }); // fixes badly transpiled classes

  const patch = NO_TRANSPILER_ISSUES ? qr => qr :
  /* istanbul ignore next */
  qr => {
    const nqr = create(QRP);
    push.apply(nqr, slice(qr));
    return nqr;
  };
  const push = AP.push;

  const search = (list, el) => {
    const nodes = [];
    const length = list.length;

    for (let i = 0; i < length; i++) {
      const css = list[i].trim();

      if (css.slice(-6) === ':first') {
        const node = el.querySelector(css.slice(0, -6));
        if (node) push.call(nodes, node);
      } else push.apply(nodes, slice(el.querySelectorAll(css)));
    }

    return new QueryResult(...nodes);
  };

  const slice = NO_TRANSPILER_ISSUES ? patch :
  /* istanbul ignore next */
  all => {
    // do not use slice.call(...) due old IE gotcha
    const nodes = [];
    const length = all.length;

    for (let i = 0; i < length; i++) nodes[i] = all[i];

    return nodes;
  }; // use function to avoid usage of Symbol.hasInstance
  // (broken in older browsers anyway)

  const $$1 = function $(CSS, parent = document) {
    switch (typeof CSS) {
      case 'string':
        return patch(search(CSS.split(','), parent));

      case 'object':
        // needed to avoid iterator dance (breaks in older IEs)
        const nodes = [];
        const all = 'nodeType' in CSS || 'postMessage' in CSS ? [CSS] : CSS;
        push.apply(nodes, slice(all));
        return patch(new QueryResult(...nodes));

      case 'function':
        const $parent = $(parent);
        const $window = $(parent.defaultView);
        const handler = {
          handleEvent(event) {
            $parent.off(DOM_CONTENT_LOADED, handler);
            $window.off(LOAD, handler);
            CSS(event);
          }

        };
        $parent.on(DOM_CONTENT_LOADED, handler);
        $window.on(LOAD, handler);
        const rs = parent.readyState;
        if (rs == 'complete' || rs != 'loading' && !parent.documentElement.doScroll) setTimeout(() => $parent.dispatch(DOM_CONTENT_LOADED));
        return $;
    }
  };

  $$1.prototype = QRP;

  $$1.extend = (key, value) => (defineProperty(QRP, key, {
    configurable: true,
    value
  }), $$1); // dropped usage of for-of to avoid broken iteration dance in older IEs


  $$1.extend('dispatch', function dispatch(type, init = {}) {
    const event = new CustomEvent(type, init);
    const length = this.length;

    for (let i = 0; i < length; i++) this[i].dispatchEvent(event);

    return this;
  }).extend('off', function off(type, handler, options = false) {
    const length = this.length;

    for (let i = 0; i < length; i++) this[i].removeEventListener(type, handler, options);

    return this;
  }).extend('on', function on(type, handler, options = false) {
    const length = this.length;

    for (let i = 0; i < length; i++) this[i].addEventListener(type, handler, options);

    return this;
  });

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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
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

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function convertToString(content, type) {
    switch (_typeof(content)) {
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
                return _toConsumableArray(content.childNodes).reduce(function (s, node) {
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
        throw new TypeError('Bad content for ' + type + '; type: ' + _typeof(content));
    }
  }

  function convertToDOM(content, type, avoidClone) {
    switch (_typeof(content)) {
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
          var div = document.createElement('div'); // eslint-disable-next-line no-unsanitized/property

          div.innerHTML = content;
          return div.firstElementChild || div.firstChild;
        }

      default:
        throw new TypeError('Bad content for ' + type + '; type: ' + _typeof(content));
    }
  }

  function insert(type) {
    return function () {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var cbOrContent = args[0];

      switch (_typeof(cbOrContent)) {
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
              node[type].apply(node, _toConsumableArray(args.flatMap(function (content) {
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

      switch (_typeof(cbOrContent)) {
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
      return _toConsumableArray(document.querySelectorAll(sel));
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
        node[type].apply(node, _toConsumableArray(target.flatMap(function (content) {
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
      switch (_typeof(attributeNameOrAtts)) {
        case 'string':
          {
            return this[0].hasAttribute(attributeNameOrAtts) ? this[0].getAttribute(attributeNameOrAtts) : undefined;
          }

        case 'object':
          {
            if (attributeNameOrAtts) {
              this.forEach(function (node, i) {
                Object.entries(attributeNameOrAtts).forEach(function (_ref) {
                  var _ref2 = _slicedToArray(_ref, 2),
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
            throw new TypeError('Unexpected type for attribute name: ' + _typeof(attributeNameOrAtts));
          }
      }
    }

    switch (_typeof(valueOrCb)) {
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
          throw new TypeError('Unexpected type for attribute name: ' + _typeof(attributeNameOrAtts));
        }
    }

    return this;
  };

  var removeAttr = function removeAttr(attributeName) {
    if (typeof attributeName !== 'string') {
      throw new TypeError('Unexpected type for attribute name: ' + _typeof(attributeName));
    }

    this.forEach(function (node) {
      node.removeAttribute(attributeName);
    });
  };

  function classAttManipulation(type) {
    return function (cbOrContent) {
      var _this4 = this;

      switch (_typeof(cbOrContent)) {
        case 'function':
          {
            this.forEach(function (node, i) {
              var _node$classList;

              var ret = cbOrContent.call(_this4, i, node.className);

              (_node$classList = node.classList)[type].apply(_node$classList, _toConsumableArray(ret.split(' ')));
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

              (_node$classList2 = node.classList)[type].apply(_node$classList2, _toConsumableArray(cbOrContent.split(' ')));
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

    switch (typeof cbOrContent === "undefined" ? "undefined" : _typeof(cbOrContent)) {
      case 'function':
        {
          if (typeof state === 'boolean') {
            this.forEach(function (node, i) {
              var _node$classList3;

              var ret = classNameOrCb.call(_this5, i, node.className, state);

              (_node$classList3 = node.classList).toggle.apply(_node$classList3, _toConsumableArray(ret.split(' ')).concat([state]));
            });
          } else {
            this.forEach(function (node, i) {
              var _node$classList4;

              var ret = classNameOrCb.call(_this5, i, node.className, state);

              (_node$classList4 = node.classList).toggle.apply(_node$classList4, _toConsumableArray(ret.split(' ')));
            });
          }

          break;
        }

      case 'string':
        {
          if (typeof state === 'boolean') {
            this.forEach(function (node) {
              var _node$classList5;

              (_node$classList5 = node.classList).toggle.apply(_node$classList5, _toConsumableArray(classNameOrCb.split(' ')).concat([state]));
            });
          } else {
            this.forEach(function (node) {
              var _node$classList6;

              (_node$classList6 = node.classList).toggle.apply(_node$classList6, _toConsumableArray(classNameOrCb.split(' ')));
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
  const baseAPIURL = 'https://openclipart.org/search/json/';
  const jsVoid = 'javascript: void(0);'; // eslint-disable-line no-script-url

  /**
   * Shows results after query submission.
   * @param {string} url
   * @returns {Promise<void>}
   */

  async function processResults(url) {
    /**
     * @param {string} query
     * @returns {external:JamilihArray}
     */
    function queryLink(query) {
      return ['a', {
        href: jsVoid,
        dataset: {
          value: query
        },
        $on: {
          click(e) {
            e.preventDefault();
            const {
              value
            } = this.dataset;
            $$1('#query')[0].$set(value);
            $$1('#openclipart')[0].$submit();
          }

        }
      }, [query]];
    }

    const r = await fetch(url);
    const json = await r.json(); // console.log('json', json);

    if (!json || json.msg !== 'success') {
      // Todo: This could use a generic alert library instead
      alert('There was a problem downloading the results'); // eslint-disable-line no-alert

      return;
    }

    const {
      payload,
      info: {
        results: numResults,
        pages,
        current_page: currentPage
      }
    } = json; // $('#page')[0].value = currentPage;
    // $('#page')[0].max = pages;
    // Unused properties:
    // - `svg_filesize` always 0?
    // - `dimensions: {
    //      png_thumb: {width, height},
    //      png_full_lossy: {width, height}
    //    }` object of relevance?
    // - No need for `tags` with `tags_array`
    // - `svg`'s: `png_thumb`, `png_full_lossy`, `png_2400px`

    const semiColonSep = '; ' + nbsp;
    $$1('#results').jml('div', [['span', ['Number of results: ', numResults]], semiColonSep, ['span', ['page ', currentPage, ' out of ', pages]], ...payload.map(({
      title,
      description,
      id,
      uploader,
      created,
      svg: {
        url: svgURL
      },
      detail_link: detailLink,
      tags_array: tagsArray,
      downloaded_by: downloadedBy,
      total_favorites: totalFavorites
    }) => {
      const imgHW = '100px';
      const colonSep = ': ' + nbsp;
      return ['div', [['button', {
        style: 'margin-right: 8px; border: 2px solid black;',
        dataset: {
          id,
          value: svgURL
        },
        $on: {
          async click(e) {
            e.preventDefault();
            const {
              value: svgurl
            } = this.dataset; // console.log('this', id, svgurl);

            const post = message => {
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
            const result = await fetch(svgurl);
            const svg = await result.text(); // console.log('url and svg', svgurl, svg);

            post({
              href: svgurl,
              data: svg
            });
          }

        }
      }, [// If we wanted interactive versions despite security risk:
      // ['object', {data: svgURL, type: 'image/svg+xml'}]
      ['img', {
        src: svgURL,
        style: `width: ${imgHW}; height: ${imgHW};`
      }]]], ['b', [title]], ' ', ['i', [description]], ' ', ['span', ['(ID: ', ['a', {
        href: jsVoid,
        dataset: {
          value: id
        },
        $on: {
          click(e) {
            e.preventDefault();
            const {
              value
            } = this.dataset;
            $$1('#byids')[0].$set(value);
            $$1('#openclipart')[0].$submit();
          }

        }
      }, [id]], ')']], ' ', ['i', [['a', {
        href: detailLink,
        target: '_blank'
      }, ['Details']]]], ['br'], ['span', [['u', ['Uploaded by']], colonSep, queryLink(uploader), semiColonSep]], ['span', [['u', ['Download count']], colonSep, downloadedBy, semiColonSep]], ['span', [['u', ['Times used as favorite']], colonSep, totalFavorites, semiColonSep]], ['span', [['u', ['Created date']], colonSep, created]], ['br'], ['u', ['Tags']], colonSep, ...tagsArray.map(tag => {
        return ['span', [' ', queryLink(tag)]];
      })]];
    }), ['br'], ['br'], currentPage === 1 || pages <= 2 ? '' : ['span', [['a', {
      href: jsVoid,
      $on: {
        click(e) {
          e.preventDefault();
          $$1('#page')[0].value = 1;
          $$1('#openclipart')[0].$submit();
        }

      }
    }, ['First']], ' ']], currentPage === 1 ? '' : ['span', [['a', {
      href: jsVoid,
      $on: {
        click(e) {
          e.preventDefault();
          $$1('#page')[0].value = currentPage - 1;
          $$1('#openclipart')[0].$submit();
        }

      }
    }, ['Prev']], ' ']], currentPage === pages ? '' : ['span', [['a', {
      href: jsVoid,
      $on: {
        click(e) {
          e.preventDefault();
          $$1('#page')[0].value = currentPage + 1;
          $$1('#openclipart')[0].$submit();
        }

      }
    }, ['Next']], ' ']], currentPage === pages || pages <= 2 ? '' : ['span', [['a', {
      href: jsVoid,
      $on: {
        click(e) {
          e.preventDefault();
          $$1('#page')[0].value = pages;
          $$1('#openclipart')[0].$submit();
        }

      }
    }, ['Last']], ' ']]]);
  }

  jml('div', [['style', [`.control {
      padding-top: 10px;
    }`]], ['form', {
    id: 'openclipart',
    $custom: {
      async $submit() {
        const url = new URL(baseAPIURL);
        ['query', 'sort', 'amount', 'page', 'byids'].forEach(prop => {
          const {
            value
          } = $$1('#' + prop)[0];

          if (value) {
            url.searchParams.set(prop, value);
          }
        });
        await processResults(url);
      }

    },
    $on: {
      submit(e) {
        e.preventDefault();
        this.$submit();
      }

    }
  }, [// Todo: i18nize
  ['fieldset', [['legend', ['Search terms']], ['div', {
    class: 'control'
  }, [['label', ['Query (Title, description, uploader, or tag): ', ['input', {
    id: 'query',
    name: 'query',
    placeholder: 'cat',
    $custom: {
      $set(value) {
        $$1('#byids')[0].value = '';
        this.value = value;
      }

    },
    $on: {
      change() {
        $$1('#byids')[0].value = '';
      }

    }
  }]]]]], ['br'], ' OR ', ['br'], ['div', {
    class: 'control'
  }, [['label', ['IDs (single or comma-separated): ', ['input', {
    id: 'byids',
    name: 'ids',
    placeholder: '271380, 265741',
    $custom: {
      $set(value) {
        $$1('#query')[0].value = '';
        this.value = value;
      }

    },
    $on: {
      change() {
        $$1('#query')[0].value = '';
      }

    }
  }]]]]]]], ['fieldset', [['legend', ['Configuring results']], ['div', {
    class: 'control'
  }, [['label', ['Sort by: ', ['select', {
    id: 'sort'
  }, [// Todo: i18nize first values
  ['Date', 'date'], ['Downloads', 'downloads'], ['Favorited', 'favorites']].map(([text, value = text]) => {
    return ['option', {
      value
    }, [text]];
  })]]]]], ['div', {
    class: 'control'
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
    class: 'control'
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
    class: 'control'
  }, [['input', {
    type: 'submit'
  }]]]]], ['div', {
    id: 'results'
  }]], body);

}());
