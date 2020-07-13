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

const $$ = sel => [...doc.querySelectorAll(sel)];
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
    namespaces = { ...namespaces
    };
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
/**
 * Does not run Jamilih so can be further processed.
 * @param {JamilihArray} jmlArray
 * @param {string|JamilihArray|Element} glu
 * @returns {Element}
 */


function glue(jmlArray, glu) {
  return [...jmlArray].reduce((arr, item) => {
    arr.push(item, glu);
    return arr;
  }, []).slice(0, -1);
} // istanbul ignore next


let body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

const nbsp = '\u00A0'; // Very commonly needed in templates

export default jml;
export { $, $$, body, glue, jml, nbsp };
