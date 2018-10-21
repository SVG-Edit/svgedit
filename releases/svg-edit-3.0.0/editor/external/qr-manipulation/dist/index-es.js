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

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function convertToString(type, content) {
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
                return s + convertToString(type, node);
              }, '');
            }
        } // Todo: array of elements/text nodes (or Jamilih array?), QueryResult objects?


        return;
      }

    case 'string':
      {
        return content;
      }

    default:
      throw new TypeError('Bad content for ' + type + '; type: ' + _typeof(content));
  }
}

function convertToDOM(type, content, avoidClone) {
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
        } // Todo: array of elements/text nodes (or Jamilih array?), QueryResult objects?


        return;
      }

    case 'string':
      {
        var div = document.createElement('div');
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
          this.forEach(function (node) {
            node[type].apply(node, _toConsumableArray(args.map(function (content, i) {
              return convertToDOM(type, content, i === args.length - 1);
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
            node[type] = convertToString(type, ret);
          });
          break;
        }

      default:
        {
          this.forEach(function (node) {
            node[type] = convertToString(type, cbOrContent);
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

function classManipulation(type) {
  return function (cbOrContent) {
    var _this3 = this;

    switch (_typeof(cbOrContent)) {
      case 'function':
        {
          this.forEach(function (node, i) {
            var _node$classList;

            var ret = cbOrContent.call(_this3, i, node.className);

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

var addClass = classManipulation('add');
var removeClass = classManipulation('remove');
var hasClass = function hasClass(className) {
  return this.some(function (node) {
    return node.classList.contains(className);
  });
};
var toggleClass = function toggleClass(classNameOrCb, state) {
  var _this4 = this;

  switch (typeof cbOrContent === "undefined" ? "undefined" : _typeof(cbOrContent)) {
    case 'function':
      {
        if (typeof state === 'boolean') {
          this.forEach(function (node, i) {
            var _node$classList3;

            var ret = classNameOrCb.call(_this4, i, node.className, state);

            (_node$classList3 = node.classList).toggle.apply(_node$classList3, _toConsumableArray(ret.split(' ')).concat([state]));
          });
        } else {
          this.forEach(function (node, i) {
            var _node$classList4;

            var ret = classNameOrCb.call(_this4, i, node.className, state);

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
  text: text
};

var manipulation = function manipulation($, jml) {
  ['after', 'before', 'append', 'prepend', 'html', 'text'].forEach(function (method) {
    $.extend(method, methods[method]);
  });

  if (jml) {
    $.extend('jml', function () {
      var _this5 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      this.forEach(function (node) {
        while (node.hasChildNodes()) {
          node.firstChild.remove();
        }

        var n = jml.apply(void 0, args);
        return append.call(_this5, n);
      });
    });
  }

  return $;
};

export { after, before, append, prepend, html, text, addClass, removeClass, hasClass, toggleClass, manipulation };
