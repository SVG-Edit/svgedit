System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

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

      var REACT_ELEMENT_TYPE;

      function _jsx(type, props, key, children) {
        if (!REACT_ELEMENT_TYPE) {
          REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol["for"] && Symbol["for"]("react.element") || 0xeac7;
        }

        var defaultProps = type && type.defaultProps;
        var childrenLength = arguments.length - 3;

        if (!props && childrenLength !== 0) {
          props = {
            children: void 0
          };
        }

        if (childrenLength === 1) {
          props.children = children;
        } else if (childrenLength > 1) {
          var childArray = new Array(childrenLength);

          for (var i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 3];
          }

          props.children = childArray;
        }

        if (props && defaultProps) {
          for (var propName in defaultProps) {
            if (props[propName] === void 0) {
              props[propName] = defaultProps[propName];
            }
          }
        } else if (!props) {
          props = defaultProps || {};
        }

        return {
          $$typeof: REACT_ELEMENT_TYPE,
          type: type,
          key: key === undefined ? null : '' + key,
          ref: null,
          props: props,
          _owner: null
        };
      }

      function _asyncIterator(iterable) {
        var method;

        if (typeof Symbol !== "undefined") {
          if (Symbol.asyncIterator) {
            method = iterable[Symbol.asyncIterator];
            if (method != null) return method.call(iterable);
          }

          if (Symbol.iterator) {
            method = iterable[Symbol.iterator];
            if (method != null) return method.call(iterable);
          }
        }

        throw new TypeError("Object is not async iterable");
      }

      function _AwaitValue(value) {
        this.wrapped = value;
      }

      function _AsyncGenerator(gen) {
        var front, back;

        function send(key, arg) {
          return new Promise(function (resolve, reject) {
            var request = {
              key: key,
              arg: arg,
              resolve: resolve,
              reject: reject,
              next: null
            };

            if (back) {
              back = back.next = request;
            } else {
              front = back = request;
              resume(key, arg);
            }
          });
        }

        function resume(key, arg) {
          try {
            var result = gen[key](arg);
            var value = result.value;
            var wrappedAwait = value instanceof _AwaitValue;
            Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
              if (wrappedAwait) {
                resume(key === "return" ? "return" : "next", arg);
                return;
              }

              settle(result.done ? "return" : "normal", arg);
            }, function (err) {
              resume("throw", err);
            });
          } catch (err) {
            settle("throw", err);
          }
        }

        function settle(type, value) {
          switch (type) {
            case "return":
              front.resolve({
                value: value,
                done: true
              });
              break;

            case "throw":
              front.reject(value);
              break;

            default:
              front.resolve({
                value: value,
                done: false
              });
              break;
          }

          front = front.next;

          if (front) {
            resume(front.key, front.arg);
          } else {
            back = null;
          }
        }

        this._invoke = send;

        if (typeof gen.return !== "function") {
          this.return = undefined;
        }
      }

      if (typeof Symbol === "function" && Symbol.asyncIterator) {
        _AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
          return this;
        };
      }

      _AsyncGenerator.prototype.next = function (arg) {
        return this._invoke("next", arg);
      };

      _AsyncGenerator.prototype.throw = function (arg) {
        return this._invoke("throw", arg);
      };

      _AsyncGenerator.prototype.return = function (arg) {
        return this._invoke("return", arg);
      };

      function _wrapAsyncGenerator(fn) {
        return function () {
          return new _AsyncGenerator(fn.apply(this, arguments));
        };
      }

      function _awaitAsyncGenerator(value) {
        return new _AwaitValue(value);
      }

      function _asyncGeneratorDelegate(inner, awaitWrap) {
        var iter = {},
            waiting = false;

        function pump(key, value) {
          waiting = true;
          value = new Promise(function (resolve) {
            resolve(inner[key](value));
          });
          return {
            done: false,
            value: awaitWrap(value)
          };
        }

        ;

        if (typeof Symbol === "function" && Symbol.iterator) {
          iter[Symbol.iterator] = function () {
            return this;
          };
        }

        iter.next = function (value) {
          if (waiting) {
            waiting = false;
            return value;
          }

          return pump("next", value);
        };

        if (typeof inner.throw === "function") {
          iter.throw = function (value) {
            if (waiting) {
              waiting = false;
              throw value;
            }

            return pump("throw", value);
          };
        }

        if (typeof inner.return === "function") {
          iter.return = function (value) {
            if (waiting) {
              waiting = false;
              return value;
            }

            return pump("return", value);
          };
        }

        return iter;
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

      function _defineEnumerableProperties(obj, descs) {
        for (var key in descs) {
          var desc = descs[key];
          desc.configurable = desc.enumerable = true;
          if ("value" in desc) desc.writable = true;
          Object.defineProperty(obj, key, desc);
        }

        if (Object.getOwnPropertySymbols) {
          var objectSymbols = Object.getOwnPropertySymbols(descs);

          for (var i = 0; i < objectSymbols.length; i++) {
            var sym = objectSymbols[i];
            var desc = descs[sym];
            desc.configurable = desc.enumerable = true;
            if ("value" in desc) desc.writable = true;
            Object.defineProperty(obj, sym, desc);
          }
        }

        return obj;
      }

      function _defaults(obj, defaults) {
        var keys = Object.getOwnPropertyNames(defaults);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = Object.getOwnPropertyDescriptor(defaults, key);

          if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
          }
        }

        return obj;
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

      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i] != null ? Object(arguments[i]) : {};
          var ownKeys = Object.keys(source);

          if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
              return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
          }

          ownKeys.forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        }

        return target;
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

      function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
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

      function _isNativeReflectConstruct() {
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
        if (_isNativeReflectConstruct()) {
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

      function _instanceof(left, right) {
        if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
          return !!right[Symbol.hasInstance](left);
        } else {
          return left instanceof right;
        }
      }

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      function _getRequireWildcardCache() {
        if (typeof WeakMap !== "function") return null;
        var cache = new WeakMap();

        _getRequireWildcardCache = function () {
          return cache;
        };

        return cache;
      }

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        }

        if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
          return {
            default: obj
          };
        }

        var cache = _getRequireWildcardCache();

        if (cache && cache.has(obj)) {
          return cache.get(obj);
        }

        var newObj = {};
        var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

            if (desc && (desc.get || desc.set)) {
              Object.defineProperty(newObj, key, desc);
            } else {
              newObj[key] = obj[key];
            }
          }
        }

        newObj.default = obj;

        if (cache) {
          cache.set(obj, newObj);
        }

        return newObj;
      }

      function _newArrowCheck(innerThis, boundThis) {
        if (innerThis !== boundThis) {
          throw new TypeError("Cannot instantiate an arrow function");
        }
      }

      function _objectDestructuringEmpty(obj) {
        if (obj == null) throw new TypeError("Cannot destructure undefined");
      }

      function _objectWithoutPropertiesLoose(source, excluded) {
        if (source == null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;

        for (i = 0; i < sourceKeys.length; i++) {
          key = sourceKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          target[key] = source[key];
        }

        return target;
      }

      function _objectWithoutProperties(source, excluded) {
        if (source == null) return {};

        var target = _objectWithoutPropertiesLoose(source, excluded);

        var key, i;

        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

          for (i = 0; i < sourceSymbolKeys.length; i++) {
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
          }
        }

        return target;
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

      function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();

        return function _createSuperInternal() {
          var Super = _getPrototypeOf(Derived),
              result;

          if (hasNativeReflectConstruct) {
            var NewTarget = _getPrototypeOf(this).constructor;

            result = Reflect.construct(Super, arguments, NewTarget);
          } else {
            result = Super.apply(this, arguments);
          }

          return _possibleConstructorReturn(this, result);
        };
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

      function set(target, property, value, receiver) {
        if (typeof Reflect !== "undefined" && Reflect.set) {
          set = Reflect.set;
        } else {
          set = function set(target, property, value, receiver) {
            var base = _superPropBase(target, property);

            var desc;

            if (base) {
              desc = Object.getOwnPropertyDescriptor(base, property);

              if (desc.set) {
                desc.set.call(receiver, value);
                return true;
              } else if (!desc.writable) {
                return false;
              }
            }

            desc = Object.getOwnPropertyDescriptor(receiver, property);

            if (desc) {
              if (!desc.writable) {
                return false;
              }

              desc.value = value;
              Object.defineProperty(receiver, property, desc);
            } else {
              _defineProperty(receiver, property, value);
            }

            return true;
          };
        }

        return set(target, property, value, receiver);
      }

      function _set(target, property, value, receiver, isStrict) {
        var s = set(target, property, value, receiver || target);

        if (!s && isStrict) {
          throw new Error('failed to set property');
        }

        return value;
      }

      function _taggedTemplateLiteral(strings, raw) {
        if (!raw) {
          raw = strings.slice(0);
        }

        return Object.freeze(Object.defineProperties(strings, {
          raw: {
            value: Object.freeze(raw)
          }
        }));
      }

      function _taggedTemplateLiteralLoose(strings, raw) {
        if (!raw) {
          raw = strings.slice(0);
        }

        strings.raw = raw;
        return strings;
      }

      function _readOnlyError(name) {
        throw new Error("\"" + name + "\" is read-only");
      }

      function _classNameTDZError(name) {
        throw new Error("Class \"" + name + "\" cannot be referenced in computed property keys.");
      }

      function _temporalUndefined() {}

      function _tdz(name) {
        throw new ReferenceError(name + " is not defined - temporal dead zone");
      }

      function _temporalRef(val, name) {
        return val === _temporalUndefined ? _tdz(name) : val;
      }

      function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
      }

      function _slicedToArrayLoose(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimitLoose(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
      }

      function _toArray(arr) {
        return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
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

      function _maybeArrayLike(next, arr, i) {
        if (arr && !Array.isArray(arr) && typeof arr.length === "number") {
          var len = arr.length;
          return _arrayLikeToArray(arr, i !== void 0 && i < len ? i : len);
        }

        return next(arr, i);
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

      function _iterableToArrayLimitLoose(arr, i) {
        if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
        var _arr = [];

        for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
          _arr.push(_step.value);

          if (i && _arr.length === i) break;
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

      function _createForOfIteratorHelper(o, allowArrayLike) {
        var it;

        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;

            var F = function () {};

            return {
              s: F,
              n: function () {
                if (i >= o.length) return {
                  done: true
                };
                return {
                  done: false,
                  value: o[i++]
                };
              },
              e: function (e) {
                throw e;
              },
              f: F
            };
          }

          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }

        var normalCompletion = true,
            didErr = false,
            err;
        return {
          s: function () {
            it = o[Symbol.iterator]();
          },
          n: function () {
            var step = it.next();
            normalCompletion = step.done;
            return step;
          },
          e: function (e) {
            didErr = true;
            err = e;
          },
          f: function () {
            try {
              if (!normalCompletion && it.return != null) it.return();
            } finally {
              if (didErr) throw err;
            }
          }
        };
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it;

        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            return function () {
              if (i >= o.length) return {
                done: true
              };
              return {
                done: false,
                value: o[i++]
              };
            };
          }

          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }

        it = o[Symbol.iterator]();
        return it.next.bind(it);
      }

      function _skipFirstGeneratorNext(fn) {
        return function () {
          var it = fn.apply(this, arguments);
          it.next();
          return it;
        };
      }

      function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];

        if (prim !== undefined) {
          var res = prim.call(input, hint || "default");
          if (typeof res !== "object") return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }

        return (hint === "string" ? String : Number)(input);
      }

      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");

        return typeof key === "symbol" ? key : String(key);
      }

      function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.');
      }

      function _initializerDefineProperty(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable,
          writable: descriptor.writable,
          value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
      }

      function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object.keys(descriptor).forEach(function (key) {
          desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
          desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
          return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
          desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
          desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
          Object.defineProperty(target, property, desc);
          desc = null;
        }

        return desc;
      }

      var id = 0;

      function _classPrivateFieldLooseKey(name) {
        return "__private_" + id++ + "_" + name;
      }

      function _classPrivateFieldLooseBase(receiver, privateKey) {
        if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
          throw new TypeError("attempted to use private field on non-instance");
        }

        return receiver;
      }

      function _classPrivateFieldGet(receiver, privateMap) {
        var descriptor = privateMap.get(receiver);

        if (!descriptor) {
          throw new TypeError("attempted to get private field on non-instance");
        }

        if (descriptor.get) {
          return descriptor.get.call(receiver);
        }

        return descriptor.value;
      }

      function _classPrivateFieldSet(receiver, privateMap, value) {
        var descriptor = privateMap.get(receiver);

        if (!descriptor) {
          throw new TypeError("attempted to set private field on non-instance");
        }

        if (descriptor.set) {
          descriptor.set.call(receiver, value);
        } else {
          if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
          }

          descriptor.value = value;
        }

        return value;
      }

      function _classPrivateFieldDestructureSet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
          throw new TypeError("attempted to set private field on non-instance");
        }

        var descriptor = privateMap.get(receiver);

        if (descriptor.set) {
          if (!("__destrObj" in descriptor)) {
            descriptor.__destrObj = {
              set value(v) {
                descriptor.set.call(receiver, v);
              }

            };
          }

          return descriptor.__destrObj;
        } else {
          if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
          }

          return descriptor;
        }
      }

      function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
        if (receiver !== classConstructor) {
          throw new TypeError("Private static access of wrong provenance");
        }

        if (descriptor.get) {
          return descriptor.get.call(receiver);
        }

        return descriptor.value;
      }

      function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
        if (receiver !== classConstructor) {
          throw new TypeError("Private static access of wrong provenance");
        }

        if (descriptor.set) {
          descriptor.set.call(receiver, value);
        } else {
          if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
          }

          descriptor.value = value;
        }

        return value;
      }

      function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
        if (receiver !== classConstructor) {
          throw new TypeError("Private static access of wrong provenance");
        }

        return method;
      }

      function _classStaticPrivateMethodSet() {
        throw new TypeError("attempted to set read only static private field");
      }

      function _decorate(decorators, factory, superClass, mixins) {
        var api = _getDecoratorsApi();

        if (mixins) {
          for (var i = 0; i < mixins.length; i++) {
            api = mixins[i](api);
          }
        }

        var r = factory(function initialize(O) {
          api.initializeInstanceElements(O, decorated.elements);
        }, superClass);
        var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
        api.initializeClassElements(r.F, decorated.elements);
        return api.runClassFinishers(r.F, decorated.finishers);
      }

      function _getDecoratorsApi() {
        _getDecoratorsApi = function () {
          return api;
        };

        var api = {
          elementsDefinitionOrder: [["method"], ["field"]],
          initializeInstanceElements: function (O, elements) {
            ["method", "field"].forEach(function (kind) {
              elements.forEach(function (element) {
                if (element.kind === kind && element.placement === "own") {
                  this.defineClassElement(O, element);
                }
              }, this);
            }, this);
          },
          initializeClassElements: function (F, elements) {
            var proto = F.prototype;
            ["method", "field"].forEach(function (kind) {
              elements.forEach(function (element) {
                var placement = element.placement;

                if (element.kind === kind && (placement === "static" || placement === "prototype")) {
                  var receiver = placement === "static" ? F : proto;
                  this.defineClassElement(receiver, element);
                }
              }, this);
            }, this);
          },
          defineClassElement: function (receiver, element) {
            var descriptor = element.descriptor;

            if (element.kind === "field") {
              var initializer = element.initializer;
              descriptor = {
                enumerable: descriptor.enumerable,
                writable: descriptor.writable,
                configurable: descriptor.configurable,
                value: initializer === void 0 ? void 0 : initializer.call(receiver)
              };
            }

            Object.defineProperty(receiver, element.key, descriptor);
          },
          decorateClass: function (elements, decorators) {
            var newElements = [];
            var finishers = [];
            var placements = {
              static: [],
              prototype: [],
              own: []
            };
            elements.forEach(function (element) {
              this.addElementPlacement(element, placements);
            }, this);
            elements.forEach(function (element) {
              if (!_hasDecorators(element)) return newElements.push(element);
              var elementFinishersExtras = this.decorateElement(element, placements);
              newElements.push(elementFinishersExtras.element);
              newElements.push.apply(newElements, elementFinishersExtras.extras);
              finishers.push.apply(finishers, elementFinishersExtras.finishers);
            }, this);

            if (!decorators) {
              return {
                elements: newElements,
                finishers: finishers
              };
            }

            var result = this.decorateConstructor(newElements, decorators);
            finishers.push.apply(finishers, result.finishers);
            result.finishers = finishers;
            return result;
          },
          addElementPlacement: function (element, placements, silent) {
            var keys = placements[element.placement];

            if (!silent && keys.indexOf(element.key) !== -1) {
              throw new TypeError("Duplicated element (" + element.key + ")");
            }

            keys.push(element.key);
          },
          decorateElement: function (element, placements) {
            var extras = [];
            var finishers = [];

            for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
              var keys = placements[element.placement];
              keys.splice(keys.indexOf(element.key), 1);
              var elementObject = this.fromElementDescriptor(element);
              var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
              element = elementFinisherExtras.element;
              this.addElementPlacement(element, placements);

              if (elementFinisherExtras.finisher) {
                finishers.push(elementFinisherExtras.finisher);
              }

              var newExtras = elementFinisherExtras.extras;

              if (newExtras) {
                for (var j = 0; j < newExtras.length; j++) {
                  this.addElementPlacement(newExtras[j], placements);
                }

                extras.push.apply(extras, newExtras);
              }
            }

            return {
              element: element,
              finishers: finishers,
              extras: extras
            };
          },
          decorateConstructor: function (elements, decorators) {
            var finishers = [];

            for (var i = decorators.length - 1; i >= 0; i--) {
              var obj = this.fromClassDescriptor(elements);
              var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);

              if (elementsAndFinisher.finisher !== undefined) {
                finishers.push(elementsAndFinisher.finisher);
              }

              if (elementsAndFinisher.elements !== undefined) {
                elements = elementsAndFinisher.elements;

                for (var j = 0; j < elements.length - 1; j++) {
                  for (var k = j + 1; k < elements.length; k++) {
                    if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                      throw new TypeError("Duplicated element (" + elements[j].key + ")");
                    }
                  }
                }
              }
            }

            return {
              elements: elements,
              finishers: finishers
            };
          },
          fromElementDescriptor: function (element) {
            var obj = {
              kind: element.kind,
              key: element.key,
              placement: element.placement,
              descriptor: element.descriptor
            };
            var desc = {
              value: "Descriptor",
              configurable: true
            };
            Object.defineProperty(obj, Symbol.toStringTag, desc);
            if (element.kind === "field") obj.initializer = element.initializer;
            return obj;
          },
          toElementDescriptors: function (elementObjects) {
            if (elementObjects === undefined) return;
            return _toArray(elementObjects).map(function (elementObject) {
              var element = this.toElementDescriptor(elementObject);
              this.disallowProperty(elementObject, "finisher", "An element descriptor");
              this.disallowProperty(elementObject, "extras", "An element descriptor");
              return element;
            }, this);
          },
          toElementDescriptor: function (elementObject) {
            var kind = String(elementObject.kind);

            if (kind !== "method" && kind !== "field") {
              throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
            }

            var key = _toPropertyKey(elementObject.key);

            var placement = String(elementObject.placement);

            if (placement !== "static" && placement !== "prototype" && placement !== "own") {
              throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
            }

            var descriptor = elementObject.descriptor;
            this.disallowProperty(elementObject, "elements", "An element descriptor");
            var element = {
              kind: kind,
              key: key,
              placement: placement,
              descriptor: Object.assign({}, descriptor)
            };

            if (kind !== "field") {
              this.disallowProperty(elementObject, "initializer", "A method descriptor");
            } else {
              this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
              this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
              this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
              element.initializer = elementObject.initializer;
            }

            return element;
          },
          toElementFinisherExtras: function (elementObject) {
            var element = this.toElementDescriptor(elementObject);

            var finisher = _optionalCallableProperty(elementObject, "finisher");

            var extras = this.toElementDescriptors(elementObject.extras);
            return {
              element: element,
              finisher: finisher,
              extras: extras
            };
          },
          fromClassDescriptor: function (elements) {
            var obj = {
              kind: "class",
              elements: elements.map(this.fromElementDescriptor, this)
            };
            var desc = {
              value: "Descriptor",
              configurable: true
            };
            Object.defineProperty(obj, Symbol.toStringTag, desc);
            return obj;
          },
          toClassDescriptor: function (obj) {
            var kind = String(obj.kind);

            if (kind !== "class") {
              throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
            }

            this.disallowProperty(obj, "key", "A class descriptor");
            this.disallowProperty(obj, "placement", "A class descriptor");
            this.disallowProperty(obj, "descriptor", "A class descriptor");
            this.disallowProperty(obj, "initializer", "A class descriptor");
            this.disallowProperty(obj, "extras", "A class descriptor");

            var finisher = _optionalCallableProperty(obj, "finisher");

            var elements = this.toElementDescriptors(obj.elements);
            return {
              elements: elements,
              finisher: finisher
            };
          },
          runClassFinishers: function (constructor, finishers) {
            for (var i = 0; i < finishers.length; i++) {
              var newConstructor = (0, finishers[i])(constructor);

              if (newConstructor !== undefined) {
                if (typeof newConstructor !== "function") {
                  throw new TypeError("Finishers must return a constructor.");
                }

                constructor = newConstructor;
              }
            }

            return constructor;
          },
          disallowProperty: function (obj, name, objectType) {
            if (obj[name] !== undefined) {
              throw new TypeError(objectType + " can't have a ." + name + " property.");
            }
          }
        };
        return api;
      }

      function _createElementDescriptor(def) {
        var key = _toPropertyKey(def.key);

        var descriptor;

        if (def.kind === "method") {
          descriptor = {
            value: def.value,
            writable: true,
            configurable: true,
            enumerable: false
          };
        } else if (def.kind === "get") {
          descriptor = {
            get: def.value,
            configurable: true,
            enumerable: false
          };
        } else if (def.kind === "set") {
          descriptor = {
            set: def.value,
            configurable: true,
            enumerable: false
          };
        } else if (def.kind === "field") {
          descriptor = {
            configurable: true,
            writable: true,
            enumerable: true
          };
        }

        var element = {
          kind: def.kind === "field" ? "field" : "method",
          key: key,
          placement: def.static ? "static" : def.kind === "field" ? "own" : "prototype",
          descriptor: descriptor
        };
        if (def.decorators) element.decorators = def.decorators;
        if (def.kind === "field") element.initializer = def.value;
        return element;
      }

      function _coalesceGetterSetter(element, other) {
        if (element.descriptor.get !== undefined) {
          other.descriptor.get = element.descriptor.get;
        } else {
          other.descriptor.set = element.descriptor.set;
        }
      }

      function _coalesceClassElements(elements) {
        var newElements = [];

        var isSameElement = function (other) {
          return other.kind === "method" && other.key === element.key && other.placement === element.placement;
        };

        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];
          var other;

          if (element.kind === "method" && (other = newElements.find(isSameElement))) {
            if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
              if (_hasDecorators(element) || _hasDecorators(other)) {
                throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
              }

              other.descriptor = element.descriptor;
            } else {
              if (_hasDecorators(element)) {
                if (_hasDecorators(other)) {
                  throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
                }

                other.decorators = element.decorators;
              }

              _coalesceGetterSetter(element, other);
            }
          } else {
            newElements.push(element);
          }
        }

        return newElements;
      }

      function _hasDecorators(element) {
        return element.decorators && element.decorators.length;
      }

      function _isDataDescriptor(desc) {
        return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
      }

      function _optionalCallableProperty(obj, name) {
        var value = obj[name];

        if (value !== undefined && typeof value !== "function") {
          throw new TypeError("Expected '" + name + "' to be a function");
        }

        return value;
      }

      function _classPrivateMethodGet(receiver, privateSet, fn) {
        if (!privateSet.has(receiver)) {
          throw new TypeError("attempted to get private field on non-instance");
        }

        return fn;
      }

      function _classPrivateMethodSet() {
        throw new TypeError("attempted to reassign private method");
      }

      function _wrapRegExp(re, groups) {
        _wrapRegExp = function (re, groups) {
          return new BabelRegExp(re, undefined, groups);
        };

        var _RegExp = _wrapNativeSuper(RegExp);

        var _super = RegExp.prototype;

        var _groups = new WeakMap();

        function BabelRegExp(re, flags, groups) {
          var _this = _RegExp.call(this, re, flags);

          _groups.set(_this, groups || _groups.get(re));

          return _this;
        }

        _inherits(BabelRegExp, _RegExp);

        BabelRegExp.prototype.exec = function (str) {
          var result = _super.exec.call(this, str);

          if (result) result.groups = buildGroups(result, this);
          return result;
        };

        BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
          if (typeof substitution === "string") {
            var groups = _groups.get(this);

            return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
              return "$" + groups[name];
            }));
          } else if (typeof substitution === "function") {
            var _this = this;

            return _super[Symbol.replace].call(this, str, function () {
              var args = [];
              args.push.apply(args, arguments);

              if (typeof args[args.length - 1] !== "object") {
                args.push(buildGroups(args, _this));
              }

              return substitution.apply(this, args);
            });
          } else {
            return _super[Symbol.replace].call(this, str, substitution);
          }
        };

        function buildGroups(result, re) {
          var g = _groups.get(re);

          return Object.keys(g).reduce(function (groups, name) {
            groups[name] = result[g[name]];
            return groups;
          }, Object.create(null));
        }

        return _wrapRegExp.apply(this, arguments);
      }

      /* eslint-disable import/unambiguous, max-len */

      /* globals SVGPathSeg, SVGPathSegMovetoRel, SVGPathSegMovetoAbs,
          SVGPathSegMovetoRel, SVGPathSegLinetoRel, SVGPathSegLinetoAbs,
          SVGPathSegLinetoHorizontalRel, SVGPathSegLinetoHorizontalAbs,
          SVGPathSegLinetoVerticalRel, SVGPathSegLinetoVerticalAbs,
          SVGPathSegClosePath, SVGPathSegCurvetoCubicRel,
          SVGPathSegCurvetoCubicAbs, SVGPathSegCurvetoCubicSmoothRel,
          SVGPathSegCurvetoCubicSmoothAbs, SVGPathSegCurvetoQuadraticRel,
          SVGPathSegCurvetoQuadraticAbs, SVGPathSegCurvetoQuadraticSmoothRel,
          SVGPathSegCurvetoQuadraticSmoothAbs, SVGPathSegArcRel, SVGPathSegArcAbs */

      /**
      * SVGPathSeg API polyfill
      * https://github.com/progers/pathseg
      *
      * This is a drop-in replacement for the `SVGPathSeg` and `SVGPathSegList` APIs
      * that were removed from SVG2 ({@link https://lists.w3.org/Archives/Public/www-svg/2015Jun/0044.html}),
      * including the latest spec changes which were implemented in Firefox 43 and
      * Chrome 46.
      */

      /* eslint-disable no-shadow, class-methods-use-this, jsdoc/require-jsdoc */
      // Linting: We avoid `no-shadow` as ESLint thinks these are still available globals
      // Linting: We avoid `class-methods-use-this` as this is a polyfill that must
      //   follow the conventions
      (function () {
        if (!('SVGPathSeg' in window)) {
          // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathSeg
          var _SVGPathSeg = /*#__PURE__*/function () {
            function _SVGPathSeg(type, typeAsLetter, owningPathSegList) {
              _classCallCheck(this, _SVGPathSeg);

              this.pathSegType = type;
              this.pathSegTypeAsLetter = typeAsLetter;
              this._owningPathSegList = owningPathSegList;
            } // Notify owning PathSegList on any changes so they can be synchronized back to the path element.


            _createClass(_SVGPathSeg, [{
              key: "_segmentChanged",
              value: function _segmentChanged() {
                if (this._owningPathSegList) {
                  this._owningPathSegList.segmentChanged(this);
                }
              }
            }]);

            return _SVGPathSeg;
          }();

          _SVGPathSeg.prototype.classname = 'SVGPathSeg';
          _SVGPathSeg.PATHSEG_UNKNOWN = 0;
          _SVGPathSeg.PATHSEG_CLOSEPATH = 1;
          _SVGPathSeg.PATHSEG_MOVETO_ABS = 2;
          _SVGPathSeg.PATHSEG_MOVETO_REL = 3;
          _SVGPathSeg.PATHSEG_LINETO_ABS = 4;
          _SVGPathSeg.PATHSEG_LINETO_REL = 5;
          _SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS = 6;
          _SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL = 7;
          _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS = 8;
          _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL = 9;
          _SVGPathSeg.PATHSEG_ARC_ABS = 10;
          _SVGPathSeg.PATHSEG_ARC_REL = 11;
          _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS = 12;
          _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL = 13;
          _SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS = 14;
          _SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL = 15;
          _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS = 16;
          _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL = 17;
          _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS = 18;
          _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL = 19;

          var _SVGPathSegClosePath = /*#__PURE__*/function (_SVGPathSeg2) {
            _inherits(_SVGPathSegClosePath, _SVGPathSeg2);

            var _super = _createSuper(_SVGPathSegClosePath);

            function _SVGPathSegClosePath(owningPathSegList) {
              _classCallCheck(this, _SVGPathSegClosePath);

              return _super.call(this, _SVGPathSeg.PATHSEG_CLOSEPATH, 'z', owningPathSegList);
            }

            _createClass(_SVGPathSegClosePath, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegClosePath]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegClosePath(undefined);
              }
            }]);

            return _SVGPathSegClosePath;
          }(_SVGPathSeg);

          var _SVGPathSegMovetoAbs = /*#__PURE__*/function (_SVGPathSeg3) {
            _inherits(_SVGPathSegMovetoAbs, _SVGPathSeg3);

            var _super2 = _createSuper(_SVGPathSegMovetoAbs);

            function _SVGPathSegMovetoAbs(owningPathSegList, x, y) {
              var _this;

              _classCallCheck(this, _SVGPathSegMovetoAbs);

              _this = _super2.call(this, _SVGPathSeg.PATHSEG_MOVETO_ABS, 'M', owningPathSegList);
              _this._x = x;
              _this._y = y;
              return _this;
            }

            _createClass(_SVGPathSegMovetoAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegMovetoAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegMovetoAbs(undefined, this._x, this._y);
              }
            }]);

            return _SVGPathSegMovetoAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegMovetoAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegMovetoRel = /*#__PURE__*/function (_SVGPathSeg4) {
            _inherits(_SVGPathSegMovetoRel, _SVGPathSeg4);

            var _super3 = _createSuper(_SVGPathSegMovetoRel);

            function _SVGPathSegMovetoRel(owningPathSegList, x, y) {
              var _this2;

              _classCallCheck(this, _SVGPathSegMovetoRel);

              _this2 = _super3.call(this, _SVGPathSeg.PATHSEG_MOVETO_REL, 'm', owningPathSegList);
              _this2._x = x;
              _this2._y = y;
              return _this2;
            }

            _createClass(_SVGPathSegMovetoRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegMovetoRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegMovetoRel(undefined, this._x, this._y);
              }
            }]);

            return _SVGPathSegMovetoRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegMovetoRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegLinetoAbs = /*#__PURE__*/function (_SVGPathSeg5) {
            _inherits(_SVGPathSegLinetoAbs, _SVGPathSeg5);

            var _super4 = _createSuper(_SVGPathSegLinetoAbs);

            function _SVGPathSegLinetoAbs(owningPathSegList, x, y) {
              var _this3;

              _classCallCheck(this, _SVGPathSegLinetoAbs);

              _this3 = _super4.call(this, _SVGPathSeg.PATHSEG_LINETO_ABS, 'L', owningPathSegList);
              _this3._x = x;
              _this3._y = y;
              return _this3;
            }

            _createClass(_SVGPathSegLinetoAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegLinetoAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegLinetoAbs(undefined, this._x, this._y);
              }
            }]);

            return _SVGPathSegLinetoAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegLinetoAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegLinetoRel = /*#__PURE__*/function (_SVGPathSeg6) {
            _inherits(_SVGPathSegLinetoRel, _SVGPathSeg6);

            var _super5 = _createSuper(_SVGPathSegLinetoRel);

            function _SVGPathSegLinetoRel(owningPathSegList, x, y) {
              var _this4;

              _classCallCheck(this, _SVGPathSegLinetoRel);

              _this4 = _super5.call(this, _SVGPathSeg.PATHSEG_LINETO_REL, 'l', owningPathSegList);
              _this4._x = x;
              _this4._y = y;
              return _this4;
            }

            _createClass(_SVGPathSegLinetoRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegLinetoRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegLinetoRel(undefined, this._x, this._y);
              }
            }]);

            return _SVGPathSegLinetoRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegLinetoRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoCubicAbs = /*#__PURE__*/function (_SVGPathSeg7) {
            _inherits(_SVGPathSegCurvetoCubicAbs, _SVGPathSeg7);

            var _super6 = _createSuper(_SVGPathSegCurvetoCubicAbs);

            function _SVGPathSegCurvetoCubicAbs(owningPathSegList, x, y, x1, y1, x2, y2) {
              var _this5;

              _classCallCheck(this, _SVGPathSegCurvetoCubicAbs);

              _this5 = _super6.call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS, 'C', owningPathSegList);
              _this5._x = x;
              _this5._y = y;
              _this5._x1 = x1;
              _this5._y1 = y1;
              _this5._x2 = x2;
              _this5._y2 = y2;
              return _this5;
            }

            _createClass(_SVGPathSegCurvetoCubicAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoCubicAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoCubicAbs(undefined, this._x, this._y, this._x1, this._y1, this._x2, this._y2);
              }
            }]);

            return _SVGPathSegCurvetoCubicAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoCubicAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            x1: {
              get: function get() {
                return this._x1;
              },
              set: function set(x1) {
                this._x1 = x1;

                this._segmentChanged();
              },
              enumerable: true
            },
            y1: {
              get: function get() {
                return this._y1;
              },
              set: function set(y1) {
                this._y1 = y1;

                this._segmentChanged();
              },
              enumerable: true
            },
            x2: {
              get: function get() {
                return this._x2;
              },
              set: function set(x2) {
                this._x2 = x2;

                this._segmentChanged();
              },
              enumerable: true
            },
            y2: {
              get: function get() {
                return this._y2;
              },
              set: function set(y2) {
                this._y2 = y2;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoCubicRel = /*#__PURE__*/function (_SVGPathSeg8) {
            _inherits(_SVGPathSegCurvetoCubicRel, _SVGPathSeg8);

            var _super7 = _createSuper(_SVGPathSegCurvetoCubicRel);

            function _SVGPathSegCurvetoCubicRel(owningPathSegList, x, y, x1, y1, x2, y2) {
              var _this6;

              _classCallCheck(this, _SVGPathSegCurvetoCubicRel);

              _this6 = _super7.call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL, 'c', owningPathSegList);
              _this6._x = x;
              _this6._y = y;
              _this6._x1 = x1;
              _this6._y1 = y1;
              _this6._x2 = x2;
              _this6._y2 = y2;
              return _this6;
            }

            _createClass(_SVGPathSegCurvetoCubicRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoCubicRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoCubicRel(undefined, this._x, this._y, this._x1, this._y1, this._x2, this._y2);
              }
            }]);

            return _SVGPathSegCurvetoCubicRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoCubicRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            x1: {
              get: function get() {
                return this._x1;
              },
              set: function set(x1) {
                this._x1 = x1;

                this._segmentChanged();
              },
              enumerable: true
            },
            y1: {
              get: function get() {
                return this._y1;
              },
              set: function set(y1) {
                this._y1 = y1;

                this._segmentChanged();
              },
              enumerable: true
            },
            x2: {
              get: function get() {
                return this._x2;
              },
              set: function set(x2) {
                this._x2 = x2;

                this._segmentChanged();
              },
              enumerable: true
            },
            y2: {
              get: function get() {
                return this._y2;
              },
              set: function set(y2) {
                this._y2 = y2;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoQuadraticAbs = /*#__PURE__*/function (_SVGPathSeg9) {
            _inherits(_SVGPathSegCurvetoQuadraticAbs, _SVGPathSeg9);

            var _super8 = _createSuper(_SVGPathSegCurvetoQuadraticAbs);

            function _SVGPathSegCurvetoQuadraticAbs(owningPathSegList, x, y, x1, y1) {
              var _this7;

              _classCallCheck(this, _SVGPathSegCurvetoQuadraticAbs);

              _this7 = _super8.call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS, 'Q', owningPathSegList);
              _this7._x = x;
              _this7._y = y;
              _this7._x1 = x1;
              _this7._y1 = y1;
              return _this7;
            }

            _createClass(_SVGPathSegCurvetoQuadraticAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoQuadraticAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoQuadraticAbs(undefined, this._x, this._y, this._x1, this._y1);
              }
            }]);

            return _SVGPathSegCurvetoQuadraticAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoQuadraticAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            x1: {
              get: function get() {
                return this._x1;
              },
              set: function set(x1) {
                this._x1 = x1;

                this._segmentChanged();
              },
              enumerable: true
            },
            y1: {
              get: function get() {
                return this._y1;
              },
              set: function set(y1) {
                this._y1 = y1;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoQuadraticRel = /*#__PURE__*/function (_SVGPathSeg10) {
            _inherits(_SVGPathSegCurvetoQuadraticRel, _SVGPathSeg10);

            var _super9 = _createSuper(_SVGPathSegCurvetoQuadraticRel);

            function _SVGPathSegCurvetoQuadraticRel(owningPathSegList, x, y, x1, y1) {
              var _this8;

              _classCallCheck(this, _SVGPathSegCurvetoQuadraticRel);

              _this8 = _super9.call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL, 'q', owningPathSegList);
              _this8._x = x;
              _this8._y = y;
              _this8._x1 = x1;
              _this8._y1 = y1;
              return _this8;
            }

            _createClass(_SVGPathSegCurvetoQuadraticRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoQuadraticRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoQuadraticRel(undefined, this._x, this._y, this._x1, this._y1);
              }
            }]);

            return _SVGPathSegCurvetoQuadraticRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoQuadraticRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            x1: {
              get: function get() {
                return this._x1;
              },
              set: function set(x1) {
                this._x1 = x1;

                this._segmentChanged();
              },
              enumerable: true
            },
            y1: {
              get: function get() {
                return this._y1;
              },
              set: function set(y1) {
                this._y1 = y1;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegArcAbs = /*#__PURE__*/function (_SVGPathSeg11) {
            _inherits(_SVGPathSegArcAbs, _SVGPathSeg11);

            var _super10 = _createSuper(_SVGPathSegArcAbs);

            function _SVGPathSegArcAbs(owningPathSegList, x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
              var _this9;

              _classCallCheck(this, _SVGPathSegArcAbs);

              _this9 = _super10.call(this, _SVGPathSeg.PATHSEG_ARC_ABS, 'A', owningPathSegList);
              _this9._x = x;
              _this9._y = y;
              _this9._r1 = r1;
              _this9._r2 = r2;
              _this9._angle = angle;
              _this9._largeArcFlag = largeArcFlag;
              _this9._sweepFlag = sweepFlag;
              return _this9;
            }

            _createClass(_SVGPathSegArcAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegArcAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._r1 + ' ' + this._r2 + ' ' + this._angle + ' ' + (this._largeArcFlag ? '1' : '0') + ' ' + (this._sweepFlag ? '1' : '0') + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegArcAbs(undefined, this._x, this._y, this._r1, this._r2, this._angle, this._largeArcFlag, this._sweepFlag);
              }
            }]);

            return _SVGPathSegArcAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegArcAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            r1: {
              get: function get() {
                return this._r1;
              },
              set: function set(r1) {
                this._r1 = r1;

                this._segmentChanged();
              },
              enumerable: true
            },
            r2: {
              get: function get() {
                return this._r2;
              },
              set: function set(r2) {
                this._r2 = r2;

                this._segmentChanged();
              },
              enumerable: true
            },
            angle: {
              get: function get() {
                return this._angle;
              },
              set: function set(angle) {
                this._angle = angle;

                this._segmentChanged();
              },
              enumerable: true
            },
            largeArcFlag: {
              get: function get() {
                return this._largeArcFlag;
              },
              set: function set(largeArcFlag) {
                this._largeArcFlag = largeArcFlag;

                this._segmentChanged();
              },
              enumerable: true
            },
            sweepFlag: {
              get: function get() {
                return this._sweepFlag;
              },
              set: function set(sweepFlag) {
                this._sweepFlag = sweepFlag;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegArcRel = /*#__PURE__*/function (_SVGPathSeg12) {
            _inherits(_SVGPathSegArcRel, _SVGPathSeg12);

            var _super11 = _createSuper(_SVGPathSegArcRel);

            function _SVGPathSegArcRel(owningPathSegList, x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
              var _this10;

              _classCallCheck(this, _SVGPathSegArcRel);

              _this10 = _super11.call(this, _SVGPathSeg.PATHSEG_ARC_REL, 'a', owningPathSegList);
              _this10._x = x;
              _this10._y = y;
              _this10._r1 = r1;
              _this10._r2 = r2;
              _this10._angle = angle;
              _this10._largeArcFlag = largeArcFlag;
              _this10._sweepFlag = sweepFlag;
              return _this10;
            }

            _createClass(_SVGPathSegArcRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegArcRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._r1 + ' ' + this._r2 + ' ' + this._angle + ' ' + (this._largeArcFlag ? '1' : '0') + ' ' + (this._sweepFlag ? '1' : '0') + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegArcRel(undefined, this._x, this._y, this._r1, this._r2, this._angle, this._largeArcFlag, this._sweepFlag);
              }
            }]);

            return _SVGPathSegArcRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegArcRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            r1: {
              get: function get() {
                return this._r1;
              },
              set: function set(r1) {
                this._r1 = r1;

                this._segmentChanged();
              },
              enumerable: true
            },
            r2: {
              get: function get() {
                return this._r2;
              },
              set: function set(r2) {
                this._r2 = r2;

                this._segmentChanged();
              },
              enumerable: true
            },
            angle: {
              get: function get() {
                return this._angle;
              },
              set: function set(angle) {
                this._angle = angle;

                this._segmentChanged();
              },
              enumerable: true
            },
            largeArcFlag: {
              get: function get() {
                return this._largeArcFlag;
              },
              set: function set(largeArcFlag) {
                this._largeArcFlag = largeArcFlag;

                this._segmentChanged();
              },
              enumerable: true
            },
            sweepFlag: {
              get: function get() {
                return this._sweepFlag;
              },
              set: function set(sweepFlag) {
                this._sweepFlag = sweepFlag;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegLinetoHorizontalAbs = /*#__PURE__*/function (_SVGPathSeg13) {
            _inherits(_SVGPathSegLinetoHorizontalAbs, _SVGPathSeg13);

            var _super12 = _createSuper(_SVGPathSegLinetoHorizontalAbs);

            function _SVGPathSegLinetoHorizontalAbs(owningPathSegList, x) {
              var _this11;

              _classCallCheck(this, _SVGPathSegLinetoHorizontalAbs);

              _this11 = _super12.call(this, _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS, 'H', owningPathSegList);
              _this11._x = x;
              return _this11;
            }

            _createClass(_SVGPathSegLinetoHorizontalAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegLinetoHorizontalAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegLinetoHorizontalAbs(undefined, this._x);
              }
            }]);

            return _SVGPathSegLinetoHorizontalAbs;
          }(_SVGPathSeg);

          Object.defineProperty(_SVGPathSegLinetoHorizontalAbs.prototype, 'x', {
            get: function get() {
              return this._x;
            },
            set: function set(x) {
              this._x = x;

              this._segmentChanged();
            },
            enumerable: true
          });

          var _SVGPathSegLinetoHorizontalRel = /*#__PURE__*/function (_SVGPathSeg14) {
            _inherits(_SVGPathSegLinetoHorizontalRel, _SVGPathSeg14);

            var _super13 = _createSuper(_SVGPathSegLinetoHorizontalRel);

            function _SVGPathSegLinetoHorizontalRel(owningPathSegList, x) {
              var _this12;

              _classCallCheck(this, _SVGPathSegLinetoHorizontalRel);

              _this12 = _super13.call(this, _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL, 'h', owningPathSegList);
              _this12._x = x;
              return _this12;
            }

            _createClass(_SVGPathSegLinetoHorizontalRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegLinetoHorizontalRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegLinetoHorizontalRel(undefined, this._x);
              }
            }]);

            return _SVGPathSegLinetoHorizontalRel;
          }(_SVGPathSeg);

          Object.defineProperty(_SVGPathSegLinetoHorizontalRel.prototype, 'x', {
            get: function get() {
              return this._x;
            },
            set: function set(x) {
              this._x = x;

              this._segmentChanged();
            },
            enumerable: true
          });

          var _SVGPathSegLinetoVerticalAbs = /*#__PURE__*/function (_SVGPathSeg15) {
            _inherits(_SVGPathSegLinetoVerticalAbs, _SVGPathSeg15);

            var _super14 = _createSuper(_SVGPathSegLinetoVerticalAbs);

            function _SVGPathSegLinetoVerticalAbs(owningPathSegList, y) {
              var _this13;

              _classCallCheck(this, _SVGPathSegLinetoVerticalAbs);

              _this13 = _super14.call(this, _SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS, 'V', owningPathSegList);
              _this13._y = y;
              return _this13;
            }

            _createClass(_SVGPathSegLinetoVerticalAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegLinetoVerticalAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegLinetoVerticalAbs(undefined, this._y);
              }
            }]);

            return _SVGPathSegLinetoVerticalAbs;
          }(_SVGPathSeg);

          Object.defineProperty(_SVGPathSegLinetoVerticalAbs.prototype, 'y', {
            get: function get() {
              return this._y;
            },
            set: function set(y) {
              this._y = y;

              this._segmentChanged();
            },
            enumerable: true
          });

          var _SVGPathSegLinetoVerticalRel = /*#__PURE__*/function (_SVGPathSeg16) {
            _inherits(_SVGPathSegLinetoVerticalRel, _SVGPathSeg16);

            var _super15 = _createSuper(_SVGPathSegLinetoVerticalRel);

            function _SVGPathSegLinetoVerticalRel(owningPathSegList, y) {
              var _this14;

              _classCallCheck(this, _SVGPathSegLinetoVerticalRel);

              _this14 = _super15.call(this, _SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL, 'v', owningPathSegList);
              _this14._y = y;
              return _this14;
            }

            _createClass(_SVGPathSegLinetoVerticalRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegLinetoVerticalRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegLinetoVerticalRel(undefined, this._y);
              }
            }]);

            return _SVGPathSegLinetoVerticalRel;
          }(_SVGPathSeg);

          Object.defineProperty(_SVGPathSegLinetoVerticalRel.prototype, 'y', {
            get: function get() {
              return this._y;
            },
            set: function set(y) {
              this._y = y;

              this._segmentChanged();
            },
            enumerable: true
          });

          var _SVGPathSegCurvetoCubicSmoothAbs = /*#__PURE__*/function (_SVGPathSeg17) {
            _inherits(_SVGPathSegCurvetoCubicSmoothAbs, _SVGPathSeg17);

            var _super16 = _createSuper(_SVGPathSegCurvetoCubicSmoothAbs);

            function _SVGPathSegCurvetoCubicSmoothAbs(owningPathSegList, x, y, x2, y2) {
              var _this15;

              _classCallCheck(this, _SVGPathSegCurvetoCubicSmoothAbs);

              _this15 = _super16.call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS, 'S', owningPathSegList);
              _this15._x = x;
              _this15._y = y;
              _this15._x2 = x2;
              _this15._y2 = y2;
              return _this15;
            }

            _createClass(_SVGPathSegCurvetoCubicSmoothAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoCubicSmoothAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoCubicSmoothAbs(undefined, this._x, this._y, this._x2, this._y2);
              }
            }]);

            return _SVGPathSegCurvetoCubicSmoothAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoCubicSmoothAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            x2: {
              get: function get() {
                return this._x2;
              },
              set: function set(x2) {
                this._x2 = x2;

                this._segmentChanged();
              },
              enumerable: true
            },
            y2: {
              get: function get() {
                return this._y2;
              },
              set: function set(y2) {
                this._y2 = y2;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoCubicSmoothRel = /*#__PURE__*/function (_SVGPathSeg18) {
            _inherits(_SVGPathSegCurvetoCubicSmoothRel, _SVGPathSeg18);

            var _super17 = _createSuper(_SVGPathSegCurvetoCubicSmoothRel);

            function _SVGPathSegCurvetoCubicSmoothRel(owningPathSegList, x, y, x2, y2) {
              var _this16;

              _classCallCheck(this, _SVGPathSegCurvetoCubicSmoothRel);

              _this16 = _super17.call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL, 's', owningPathSegList);
              _this16._x = x;
              _this16._y = y;
              _this16._x2 = x2;
              _this16._y2 = y2;
              return _this16;
            }

            _createClass(_SVGPathSegCurvetoCubicSmoothRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoCubicSmoothRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoCubicSmoothRel(undefined, this._x, this._y, this._x2, this._y2);
              }
            }]);

            return _SVGPathSegCurvetoCubicSmoothRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoCubicSmoothRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            },
            x2: {
              get: function get() {
                return this._x2;
              },
              set: function set(x2) {
                this._x2 = x2;

                this._segmentChanged();
              },
              enumerable: true
            },
            y2: {
              get: function get() {
                return this._y2;
              },
              set: function set(y2) {
                this._y2 = y2;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoQuadraticSmoothAbs = /*#__PURE__*/function (_SVGPathSeg19) {
            _inherits(_SVGPathSegCurvetoQuadraticSmoothAbs, _SVGPathSeg19);

            var _super18 = _createSuper(_SVGPathSegCurvetoQuadraticSmoothAbs);

            function _SVGPathSegCurvetoQuadraticSmoothAbs(owningPathSegList, x, y) {
              var _this17;

              _classCallCheck(this, _SVGPathSegCurvetoQuadraticSmoothAbs);

              _this17 = _super18.call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS, 'T', owningPathSegList);
              _this17._x = x;
              _this17._y = y;
              return _this17;
            }

            _createClass(_SVGPathSegCurvetoQuadraticSmoothAbs, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoQuadraticSmoothAbs]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoQuadraticSmoothAbs(undefined, this._x, this._y);
              }
            }]);

            return _SVGPathSegCurvetoQuadraticSmoothAbs;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoQuadraticSmoothAbs.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            }
          });

          var _SVGPathSegCurvetoQuadraticSmoothRel = /*#__PURE__*/function (_SVGPathSeg20) {
            _inherits(_SVGPathSegCurvetoQuadraticSmoothRel, _SVGPathSeg20);

            var _super19 = _createSuper(_SVGPathSegCurvetoQuadraticSmoothRel);

            function _SVGPathSegCurvetoQuadraticSmoothRel(owningPathSegList, x, y) {
              var _this18;

              _classCallCheck(this, _SVGPathSegCurvetoQuadraticSmoothRel);

              _this18 = _super19.call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL, 't', owningPathSegList);
              _this18._x = x;
              _this18._y = y;
              return _this18;
            }

            _createClass(_SVGPathSegCurvetoQuadraticSmoothRel, [{
              key: "toString",
              value: function toString() {
                return '[object SVGPathSegCurvetoQuadraticSmoothRel]';
              }
            }, {
              key: "_asPathString",
              value: function _asPathString() {
                return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
              }
            }, {
              key: "clone",
              value: function clone() {
                return new _SVGPathSegCurvetoQuadraticSmoothRel(undefined, this._x, this._y);
              }
            }]);

            return _SVGPathSegCurvetoQuadraticSmoothRel;
          }(_SVGPathSeg);

          Object.defineProperties(_SVGPathSegCurvetoQuadraticSmoothRel.prototype, {
            x: {
              get: function get() {
                return this._x;
              },
              set: function set(x) {
                this._x = x;

                this._segmentChanged();
              },
              enumerable: true
            },
            y: {
              get: function get() {
                return this._y;
              },
              set: function set(y) {
                this._y = y;

                this._segmentChanged();
              },
              enumerable: true
            }
          }); // Add createSVGPathSeg* functions to SVGPathElement.
          // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathElement.

          SVGPathElement.prototype.createSVGPathSegClosePath = function () {
            return new _SVGPathSegClosePath(undefined);
          };

          SVGPathElement.prototype.createSVGPathSegMovetoAbs = function (x, y) {
            return new _SVGPathSegMovetoAbs(undefined, x, y);
          };

          SVGPathElement.prototype.createSVGPathSegMovetoRel = function (x, y) {
            return new _SVGPathSegMovetoRel(undefined, x, y);
          };

          SVGPathElement.prototype.createSVGPathSegLinetoAbs = function (x, y) {
            return new _SVGPathSegLinetoAbs(undefined, x, y);
          };

          SVGPathElement.prototype.createSVGPathSegLinetoRel = function (x, y) {
            return new _SVGPathSegLinetoRel(undefined, x, y);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoCubicAbs = function (x, y, x1, y1, x2, y2) {
            return new _SVGPathSegCurvetoCubicAbs(undefined, x, y, x1, y1, x2, y2);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoCubicRel = function (x, y, x1, y1, x2, y2) {
            return new _SVGPathSegCurvetoCubicRel(undefined, x, y, x1, y1, x2, y2);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticAbs = function (x, y, x1, y1) {
            return new _SVGPathSegCurvetoQuadraticAbs(undefined, x, y, x1, y1);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticRel = function (x, y, x1, y1) {
            return new _SVGPathSegCurvetoQuadraticRel(undefined, x, y, x1, y1);
          };

          SVGPathElement.prototype.createSVGPathSegArcAbs = function (x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
            return new _SVGPathSegArcAbs(undefined, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
          };

          SVGPathElement.prototype.createSVGPathSegArcRel = function (x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
            return new _SVGPathSegArcRel(undefined, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
          };

          SVGPathElement.prototype.createSVGPathSegLinetoHorizontalAbs = function (x) {
            return new _SVGPathSegLinetoHorizontalAbs(undefined, x);
          };

          SVGPathElement.prototype.createSVGPathSegLinetoHorizontalRel = function (x) {
            return new _SVGPathSegLinetoHorizontalRel(undefined, x);
          };

          SVGPathElement.prototype.createSVGPathSegLinetoVerticalAbs = function (y) {
            return new _SVGPathSegLinetoVerticalAbs(undefined, y);
          };

          SVGPathElement.prototype.createSVGPathSegLinetoVerticalRel = function (y) {
            return new _SVGPathSegLinetoVerticalRel(undefined, y);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothAbs = function (x, y, x2, y2) {
            return new _SVGPathSegCurvetoCubicSmoothAbs(undefined, x, y, x2, y2);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothRel = function (x, y, x2, y2) {
            return new _SVGPathSegCurvetoCubicSmoothRel(undefined, x, y, x2, y2);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothAbs = function (x, y) {
            return new _SVGPathSegCurvetoQuadraticSmoothAbs(undefined, x, y);
          };

          SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothRel = function (x, y) {
            return new _SVGPathSegCurvetoQuadraticSmoothRel(undefined, x, y);
          };

          if (!('getPathSegAtLength' in SVGPathElement.prototype)) {
            // Add getPathSegAtLength to SVGPathElement.
            // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-__svg__SVGPathElement__getPathSegAtLength
            // This polyfill requires SVGPathElement.getTotalLength to implement the distance-along-a-path algorithm.
            SVGPathElement.prototype.getPathSegAtLength = function (distance) {
              if (distance === undefined || !isFinite(distance)) {
                throw new Error('Invalid arguments.');
              }

              var measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              measurementElement.setAttribute('d', this.getAttribute('d'));
              var lastPathSegment = measurementElement.pathSegList.numberOfItems - 1; // If the path is empty, return 0.

              if (lastPathSegment <= 0) {
                return 0;
              }

              do {
                measurementElement.pathSegList.removeItem(lastPathSegment);

                if (distance > measurementElement.getTotalLength()) {
                  break;
                }

                lastPathSegment--;
              } while (lastPathSegment > 0);

              return lastPathSegment;
            };
          }

          window.SVGPathSeg = _SVGPathSeg;
          window.SVGPathSegClosePath = _SVGPathSegClosePath;
          window.SVGPathSegMovetoAbs = _SVGPathSegMovetoAbs;
          window.SVGPathSegMovetoRel = _SVGPathSegMovetoRel;
          window.SVGPathSegLinetoAbs = _SVGPathSegLinetoAbs;
          window.SVGPathSegLinetoRel = _SVGPathSegLinetoRel;
          window.SVGPathSegCurvetoCubicAbs = _SVGPathSegCurvetoCubicAbs;
          window.SVGPathSegCurvetoCubicRel = _SVGPathSegCurvetoCubicRel;
          window.SVGPathSegCurvetoQuadraticAbs = _SVGPathSegCurvetoQuadraticAbs;
          window.SVGPathSegCurvetoQuadraticRel = _SVGPathSegCurvetoQuadraticRel;
          window.SVGPathSegArcAbs = _SVGPathSegArcAbs;
          window.SVGPathSegArcRel = _SVGPathSegArcRel;
          window.SVGPathSegLinetoHorizontalAbs = _SVGPathSegLinetoHorizontalAbs;
          window.SVGPathSegLinetoHorizontalRel = _SVGPathSegLinetoHorizontalRel;
          window.SVGPathSegLinetoVerticalAbs = _SVGPathSegLinetoVerticalAbs;
          window.SVGPathSegLinetoVerticalRel = _SVGPathSegLinetoVerticalRel;
          window.SVGPathSegCurvetoCubicSmoothAbs = _SVGPathSegCurvetoCubicSmoothAbs;
          window.SVGPathSegCurvetoCubicSmoothRel = _SVGPathSegCurvetoCubicSmoothRel;
          window.SVGPathSegCurvetoQuadraticSmoothAbs = _SVGPathSegCurvetoQuadraticSmoothAbs;
          window.SVGPathSegCurvetoQuadraticSmoothRel = _SVGPathSegCurvetoQuadraticSmoothRel;
        } // Checking for SVGPathSegList in window checks for the case of an implementation without the
        // SVGPathSegList API.
        // The second check for appendItem is specific to Firefox 59+ which removed only parts of the
        // SVGPathSegList API (e.g., appendItem). In this case we need to re-implement the entire API
        // so the polyfill data (i.e., _list) is used throughout.


        if (!('SVGPathSegList' in window) || !('appendItem' in window.SVGPathSegList.prototype)) {
          // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathSegList
          var SVGPathSegList = /*#__PURE__*/function () {
            function SVGPathSegList(pathElement) {
              _classCallCheck(this, SVGPathSegList);

              this._pathElement = pathElement;
              this._list = this._parsePath(this._pathElement.getAttribute('d')); // Use a MutationObserver to catch changes to the path's "d" attribute.

              this._mutationObserverConfig = {
                attributes: true,
                attributeFilter: ['d']
              };
              this._pathElementMutationObserver = new MutationObserver(this._updateListFromPathMutations.bind(this));

              this._pathElementMutationObserver.observe(this._pathElement, this._mutationObserverConfig);
            } // Process any pending mutations to the path element and update the list as needed.
            // This should be the first call of all public functions and is needed because
            // MutationObservers are not synchronous so we can have pending asynchronous mutations.


            _createClass(SVGPathSegList, [{
              key: "_checkPathSynchronizedToList",
              value: function _checkPathSynchronizedToList() {
                this._updateListFromPathMutations(this._pathElementMutationObserver.takeRecords());
              }
            }, {
              key: "_updateListFromPathMutations",
              value: function _updateListFromPathMutations(mutationRecords) {
                if (!this._pathElement) {
                  return;
                }

                var hasPathMutations = false;
                mutationRecords.forEach(function (record) {
                  if (record.attributeName === 'd') {
                    hasPathMutations = true;
                  }
                });

                if (hasPathMutations) {
                  this._list = this._parsePath(this._pathElement.getAttribute('d'));
                }
              } // Serialize the list and update the path's 'd' attribute.

            }, {
              key: "_writeListToPath",
              value: function _writeListToPath() {
                this._pathElementMutationObserver.disconnect();

                this._pathElement.setAttribute('d', SVGPathSegList._pathSegArrayAsString(this._list));

                this._pathElementMutationObserver.observe(this._pathElement, this._mutationObserverConfig);
              } // When a path segment changes the list needs to be synchronized back to the path element.

            }, {
              key: "segmentChanged",
              value: function segmentChanged(pathSeg) {
                this._writeListToPath();
              }
            }, {
              key: "clear",
              value: function clear() {
                this._checkPathSynchronizedToList();

                this._list.forEach(function (pathSeg) {
                  pathSeg._owningPathSegList = null;
                });

                this._list = [];

                this._writeListToPath();
              }
            }, {
              key: "initialize",
              value: function initialize(newItem) {
                this._checkPathSynchronizedToList();

                this._list = [newItem];
                newItem._owningPathSegList = this;

                this._writeListToPath();

                return newItem;
              }
            }, {
              key: "_checkValidIndex",
              value: function _checkValidIndex(index) {
                if (isNaN(index) || index < 0 || index >= this.numberOfItems) {
                  throw new Error('INDEX_SIZE_ERR');
                }
              }
            }, {
              key: "getItem",
              value: function getItem(index) {
                this._checkPathSynchronizedToList();

                this._checkValidIndex(index);

                return this._list[index];
              }
            }, {
              key: "insertItemBefore",
              value: function insertItemBefore(newItem, index) {
                this._checkPathSynchronizedToList(); // Spec: If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.


                if (index > this.numberOfItems) {
                  index = this.numberOfItems;
                }

                if (newItem._owningPathSegList) {
                  // SVG2 spec says to make a copy.
                  newItem = newItem.clone();
                }

                this._list.splice(index, 0, newItem);

                newItem._owningPathSegList = this;

                this._writeListToPath();

                return newItem;
              }
            }, {
              key: "replaceItem",
              value: function replaceItem(newItem, index) {
                this._checkPathSynchronizedToList();

                if (newItem._owningPathSegList) {
                  // SVG2 spec says to make a copy.
                  newItem = newItem.clone();
                }

                this._checkValidIndex(index);

                this._list[index] = newItem;
                newItem._owningPathSegList = this;

                this._writeListToPath();

                return newItem;
              }
            }, {
              key: "removeItem",
              value: function removeItem(index) {
                this._checkPathSynchronizedToList();

                this._checkValidIndex(index);

                var item = this._list[index];

                this._list.splice(index, 1);

                this._writeListToPath();

                return item;
              }
            }, {
              key: "appendItem",
              value: function appendItem(newItem) {
                this._checkPathSynchronizedToList();

                if (newItem._owningPathSegList) {
                  // SVG2 spec says to make a copy.
                  newItem = newItem.clone();
                }

                this._list.push(newItem);

                newItem._owningPathSegList = this; // TODO: Optimize this to just append to the existing attribute.

                this._writeListToPath();

                return newItem;
              } // This closely follows SVGPathParser::parsePath from Source/core/svg/SVGPathParser.cpp.

            }, {
              key: "_parsePath",
              value: function _parsePath(string) {
                if (!string || !string.length) {
                  return [];
                }

                var owningPathSegList = this;

                var Builder = /*#__PURE__*/function () {
                  function Builder() {
                    _classCallCheck(this, Builder);

                    this.pathSegList = [];
                  }

                  _createClass(Builder, [{
                    key: "appendSegment",
                    value: function appendSegment(pathSeg) {
                      this.pathSegList.push(pathSeg);
                    }
                  }]);

                  return Builder;
                }();

                var Source = /*#__PURE__*/function () {
                  function Source(string) {
                    _classCallCheck(this, Source);

                    this._string = string;
                    this._currentIndex = 0;
                    this._endIndex = this._string.length;
                    this._previousCommand = SVGPathSeg.PATHSEG_UNKNOWN;

                    this._skipOptionalSpaces();
                  }

                  _createClass(Source, [{
                    key: "_isCurrentSpace",
                    value: function _isCurrentSpace() {
                      var character = this._string[this._currentIndex];
                      return character <= ' ' && (character === ' ' || character === '\n' || character === '\t' || character === '\r' || character === '\f');
                    }
                  }, {
                    key: "_skipOptionalSpaces",
                    value: function _skipOptionalSpaces() {
                      while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
                        this._currentIndex++;
                      }

                      return this._currentIndex < this._endIndex;
                    }
                  }, {
                    key: "_skipOptionalSpacesOrDelimiter",
                    value: function _skipOptionalSpacesOrDelimiter() {
                      if (this._currentIndex < this._endIndex && !this._isCurrentSpace() && this._string.charAt(this._currentIndex) !== ',') {
                        return false;
                      }

                      if (this._skipOptionalSpaces()) {
                        if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === ',') {
                          this._currentIndex++;

                          this._skipOptionalSpaces();
                        }
                      }

                      return this._currentIndex < this._endIndex;
                    }
                  }, {
                    key: "hasMoreData",
                    value: function hasMoreData() {
                      return this._currentIndex < this._endIndex;
                    }
                  }, {
                    key: "peekSegmentType",
                    value: function peekSegmentType() {
                      var lookahead = this._string[this._currentIndex];
                      return this._pathSegTypeFromChar(lookahead);
                    }
                  }, {
                    key: "_pathSegTypeFromChar",
                    value: function _pathSegTypeFromChar(lookahead) {
                      switch (lookahead) {
                        case 'Z':
                        case 'z':
                          return SVGPathSeg.PATHSEG_CLOSEPATH;

                        case 'M':
                          return SVGPathSeg.PATHSEG_MOVETO_ABS;

                        case 'm':
                          return SVGPathSeg.PATHSEG_MOVETO_REL;

                        case 'L':
                          return SVGPathSeg.PATHSEG_LINETO_ABS;

                        case 'l':
                          return SVGPathSeg.PATHSEG_LINETO_REL;

                        case 'C':
                          return SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS;

                        case 'c':
                          return SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL;

                        case 'Q':
                          return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS;

                        case 'q':
                          return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL;

                        case 'A':
                          return SVGPathSeg.PATHSEG_ARC_ABS;

                        case 'a':
                          return SVGPathSeg.PATHSEG_ARC_REL;

                        case 'H':
                          return SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS;

                        case 'h':
                          return SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL;

                        case 'V':
                          return SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS;

                        case 'v':
                          return SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL;

                        case 'S':
                          return SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS;

                        case 's':
                          return SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL;

                        case 'T':
                          return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS;

                        case 't':
                          return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL;

                        default:
                          return SVGPathSeg.PATHSEG_UNKNOWN;
                      }
                    }
                  }, {
                    key: "_nextCommandHelper",
                    value: function _nextCommandHelper(lookahead, previousCommand) {
                      // Check for remaining coordinates in the current command.
                      if ((lookahead === '+' || lookahead === '-' || lookahead === '.' || lookahead >= '0' && lookahead <= '9') && previousCommand !== SVGPathSeg.PATHSEG_CLOSEPATH) {
                        if (previousCommand === SVGPathSeg.PATHSEG_MOVETO_ABS) {
                          return SVGPathSeg.PATHSEG_LINETO_ABS;
                        }

                        if (previousCommand === SVGPathSeg.PATHSEG_MOVETO_REL) {
                          return SVGPathSeg.PATHSEG_LINETO_REL;
                        }

                        return previousCommand;
                      }

                      return SVGPathSeg.PATHSEG_UNKNOWN;
                    }
                  }, {
                    key: "initialCommandIsMoveTo",
                    value: function initialCommandIsMoveTo() {
                      // If the path is empty it is still valid, so return true.
                      if (!this.hasMoreData()) {
                        return true;
                      }

                      var command = this.peekSegmentType(); // Path must start with moveTo.

                      return command === SVGPathSeg.PATHSEG_MOVETO_ABS || command === SVGPathSeg.PATHSEG_MOVETO_REL;
                    } // Parse a number from an SVG path. This very closely follows genericParseNumber(...) from Source/core/svg/SVGParserUtilities.cpp.
                    // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF

                  }, {
                    key: "_parseNumber",
                    value: function _parseNumber() {
                      var exponent = 0;
                      var integer = 0;
                      var frac = 1;
                      var decimal = 0;
                      var sign = 1;
                      var expsign = 1;
                      var startIndex = this._currentIndex;

                      this._skipOptionalSpaces(); // Read the sign.


                      if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '+') {
                        this._currentIndex++;
                      } else if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '-') {
                        this._currentIndex++;
                        sign = -1;
                      }

                      if (this._currentIndex === this._endIndex || (this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') && this._string.charAt(this._currentIndex) !== '.') {
                        // The first character of a number must be one of [0-9+-.].
                        return undefined;
                      } // Read the integer part, build right-to-left.


                      var startIntPartIndex = this._currentIndex;

                      while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
                        this._currentIndex++; // Advance to first non-digit.
                      }

                      if (this._currentIndex !== startIntPartIndex) {
                        var scanIntPartIndex = this._currentIndex - 1;
                        var multiplier = 1;

                        while (scanIntPartIndex >= startIntPartIndex) {
                          integer += multiplier * (this._string.charAt(scanIntPartIndex--) - '0');
                          multiplier *= 10;
                        }
                      } // Read the decimals.


                      if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '.') {
                        this._currentIndex++; // There must be a least one digit following the .

                        if (this._currentIndex >= this._endIndex || this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') {
                          return undefined;
                        }

                        while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
                          frac *= 10;
                          decimal += (this._string.charAt(this._currentIndex) - '0') / frac;
                          this._currentIndex += 1;
                        }
                      } // Read the exponent part.


                      if (this._currentIndex !== startIndex && this._currentIndex + 1 < this._endIndex && (this._string.charAt(this._currentIndex) === 'e' || this._string.charAt(this._currentIndex) === 'E') && this._string.charAt(this._currentIndex + 1) !== 'x' && this._string.charAt(this._currentIndex + 1) !== 'm') {
                        this._currentIndex++; // Read the sign of the exponent.

                        if (this._string.charAt(this._currentIndex) === '+') {
                          this._currentIndex++;
                        } else if (this._string.charAt(this._currentIndex) === '-') {
                          this._currentIndex++;
                          expsign = -1;
                        } // There must be an exponent.


                        if (this._currentIndex >= this._endIndex || this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') {
                          return undefined;
                        }

                        while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
                          exponent *= 10;
                          exponent += this._string.charAt(this._currentIndex) - '0';
                          this._currentIndex++;
                        }
                      }

                      var number = integer + decimal;
                      number *= sign;

                      if (exponent) {
                        number *= Math.pow(10, expsign * exponent);
                      }

                      if (startIndex === this._currentIndex) {
                        return undefined;
                      }

                      this._skipOptionalSpacesOrDelimiter();

                      return number;
                    }
                  }, {
                    key: "_parseArcFlag",
                    value: function _parseArcFlag() {
                      if (this._currentIndex >= this._endIndex) {
                        return undefined;
                      }

                      var flag = false;

                      var flagChar = this._string.charAt(this._currentIndex++);

                      if (flagChar === '0') {
                        flag = false;
                      } else if (flagChar === '1') {
                        flag = true;
                      } else {
                        return undefined;
                      }

                      this._skipOptionalSpacesOrDelimiter();

                      return flag;
                    }
                  }, {
                    key: "parseSegment",
                    value: function parseSegment() {
                      var lookahead = this._string[this._currentIndex];

                      var command = this._pathSegTypeFromChar(lookahead);

                      if (command === SVGPathSeg.PATHSEG_UNKNOWN) {
                        // Possibly an implicit command. Not allowed if this is the first command.
                        if (this._previousCommand === SVGPathSeg.PATHSEG_UNKNOWN) {
                          return null;
                        }

                        command = this._nextCommandHelper(lookahead, this._previousCommand);

                        if (command === SVGPathSeg.PATHSEG_UNKNOWN) {
                          return null;
                        }
                      } else {
                        this._currentIndex++;
                      }

                      this._previousCommand = command;

                      switch (command) {
                        case SVGPathSeg.PATHSEG_MOVETO_REL:
                          return new SVGPathSegMovetoRel(owningPathSegList, this._parseNumber(), this._parseNumber());

                        case SVGPathSeg.PATHSEG_MOVETO_ABS:
                          return new SVGPathSegMovetoAbs(owningPathSegList, this._parseNumber(), this._parseNumber());

                        case SVGPathSeg.PATHSEG_LINETO_REL:
                          return new SVGPathSegLinetoRel(owningPathSegList, this._parseNumber(), this._parseNumber());

                        case SVGPathSeg.PATHSEG_LINETO_ABS:
                          return new SVGPathSegLinetoAbs(owningPathSegList, this._parseNumber(), this._parseNumber());

                        case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
                          return new SVGPathSegLinetoHorizontalRel(owningPathSegList, this._parseNumber());

                        case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
                          return new SVGPathSegLinetoHorizontalAbs(owningPathSegList, this._parseNumber());

                        case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
                          return new SVGPathSegLinetoVerticalRel(owningPathSegList, this._parseNumber());

                        case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
                          return new SVGPathSegLinetoVerticalAbs(owningPathSegList, this._parseNumber());

                        case SVGPathSeg.PATHSEG_CLOSEPATH:
                          this._skipOptionalSpaces();

                          return new SVGPathSegClosePath(owningPathSegList);

                        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
                          {
                            var points = {
                              x1: this._parseNumber(),
                              y1: this._parseNumber(),
                              x2: this._parseNumber(),
                              y2: this._parseNumber(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegCurvetoCubicRel(owningPathSegList, points.x, points.y, points.x1, points.y1, points.x2, points.y2);
                          }

                        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
                          {
                            var _points = {
                              x1: this._parseNumber(),
                              y1: this._parseNumber(),
                              x2: this._parseNumber(),
                              y2: this._parseNumber(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegCurvetoCubicAbs(owningPathSegList, _points.x, _points.y, _points.x1, _points.y1, _points.x2, _points.y2);
                          }

                        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
                          {
                            var _points2 = {
                              x2: this._parseNumber(),
                              y2: this._parseNumber(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegCurvetoCubicSmoothRel(owningPathSegList, _points2.x, _points2.y, _points2.x2, _points2.y2);
                          }

                        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
                          {
                            var _points3 = {
                              x2: this._parseNumber(),
                              y2: this._parseNumber(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegCurvetoCubicSmoothAbs(owningPathSegList, _points3.x, _points3.y, _points3.x2, _points3.y2);
                          }

                        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
                          {
                            var _points4 = {
                              x1: this._parseNumber(),
                              y1: this._parseNumber(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegCurvetoQuadraticRel(owningPathSegList, _points4.x, _points4.y, _points4.x1, _points4.y1);
                          }

                        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
                          {
                            var _points5 = {
                              x1: this._parseNumber(),
                              y1: this._parseNumber(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegCurvetoQuadraticAbs(owningPathSegList, _points5.x, _points5.y, _points5.x1, _points5.y1);
                          }

                        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
                          return new SVGPathSegCurvetoQuadraticSmoothRel(owningPathSegList, this._parseNumber(), this._parseNumber());

                        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
                          return new SVGPathSegCurvetoQuadraticSmoothAbs(owningPathSegList, this._parseNumber(), this._parseNumber());

                        case SVGPathSeg.PATHSEG_ARC_REL:
                          {
                            var _points6 = {
                              x1: this._parseNumber(),
                              y1: this._parseNumber(),
                              arcAngle: this._parseNumber(),
                              arcLarge: this._parseArcFlag(),
                              arcSweep: this._parseArcFlag(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegArcRel(owningPathSegList, _points6.x, _points6.y, _points6.x1, _points6.y1, _points6.arcAngle, _points6.arcLarge, _points6.arcSweep);
                          }

                        case SVGPathSeg.PATHSEG_ARC_ABS:
                          {
                            var _points7 = {
                              x1: this._parseNumber(),
                              y1: this._parseNumber(),
                              arcAngle: this._parseNumber(),
                              arcLarge: this._parseArcFlag(),
                              arcSweep: this._parseArcFlag(),
                              x: this._parseNumber(),
                              y: this._parseNumber()
                            };
                            return new SVGPathSegArcAbs(owningPathSegList, _points7.x, _points7.y, _points7.x1, _points7.y1, _points7.arcAngle, _points7.arcLarge, _points7.arcSweep);
                          }

                        default:
                          throw new Error('Unknown path seg type.');
                      }
                    }
                  }]);

                  return Source;
                }();

                var builder = new Builder();
                var source = new Source(string);

                if (!source.initialCommandIsMoveTo()) {
                  return [];
                }

                while (source.hasMoreData()) {
                  var pathSeg = source.parseSegment();

                  if (!pathSeg) {
                    return [];
                  }

                  builder.appendSegment(pathSeg);
                }

                return builder.pathSegList;
              } // STATIC

            }], [{
              key: "_pathSegArrayAsString",
              value: function _pathSegArrayAsString(pathSegArray) {
                var string = '';
                var first = true;
                pathSegArray.forEach(function (pathSeg) {
                  if (first) {
                    first = false;
                    string += pathSeg._asPathString();
                  } else {
                    string += ' ' + pathSeg._asPathString();
                  }
                });
                return string;
              }
            }]);

            return SVGPathSegList;
          }();

          SVGPathSegList.prototype.classname = 'SVGPathSegList';
          Object.defineProperty(SVGPathSegList.prototype, 'numberOfItems', {
            get: function get() {
              this._checkPathSynchronizedToList();

              return this._list.length;
            },
            enumerable: true
          }); // Add the pathSegList accessors to SVGPathElement.
          // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGAnimatedPathData

          Object.defineProperties(SVGPathElement.prototype, {
            pathSegList: {
              get: function get() {
                if (!this._pathSegList) {
                  this._pathSegList = new SVGPathSegList(this);
                }

                return this._pathSegList;
              },
              enumerable: true
            },
            // TODO: The following are not implemented and simply return SVGPathElement.pathSegList.
            normalizedPathSegList: {
              get: function get() {
                return this.pathSegList;
              },
              enumerable: true
            },
            animatedPathSegList: {
              get: function get() {
                return this.pathSegList;
              },
              enumerable: true
            },
            animatedNormalizedPathSegList: {
              get: function get() {
                return this.pathSegList;
              },
              enumerable: true
            }
          });
          window.SVGPathSegList = SVGPathSegList;
        }
      })();

      // The button toggles whether the path is open or closed

      var extClosepath = exports('default', {
        name: 'closepath',
        init: function init(_ref) {
          var _this = this;

          return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var importLocale, $, strings, svgEditor, selElems, updateButton, showPanel, toggleClosed, buttons;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    importLocale = _ref.importLocale, $ = _ref.$;
                    _context.next = 3;
                    return importLocale();

                  case 3:
                    strings = _context.sent;
                    svgEditor = _this;

                    updateButton = function updateButton(path) {
                      var seglist = path.pathSegList,
                          closed = seglist.getItem(seglist.numberOfItems - 1).pathSegType === 1,
                          showbutton = closed ? '#tool_openpath' : '#tool_closepath',
                          hidebutton = closed ? '#tool_closepath' : '#tool_openpath';
                      $(hidebutton).hide();
                      $(showbutton).show();
                    };

                    showPanel = function showPanel(on) {
                      $('#closepath_panel').toggle(on);

                      if (on) {
                        var path = selElems[0];

                        if (path) {
                          updateButton(path);
                        }
                      }
                    };

                    toggleClosed = function toggleClosed() {
                      var path = selElems[0];

                      if (path) {
                        var seglist = path.pathSegList,
                            last = seglist.numberOfItems - 1; // is closed

                        if (seglist.getItem(last).pathSegType === 1) {
                          seglist.removeItem(last);
                        } else {
                          seglist.appendItem(path.createSVGPathSegClosePath());
                        }

                        updateButton(path);
                      }
                    };

                    buttons = [{
                      id: 'tool_openpath',
                      icon: svgEditor.curConfig.extIconsPath + 'openpath.png',
                      type: 'context',
                      panel: 'closepath_panel',
                      events: {
                        click: function click() {
                          toggleClosed();
                        }
                      }
                    }, {
                      id: 'tool_closepath',
                      icon: svgEditor.curConfig.extIconsPath + 'closepath.png',
                      type: 'context',
                      panel: 'closepath_panel',
                      events: {
                        click: function click() {
                          toggleClosed();
                        }
                      }
                    }];
                    return _context.abrupt("return", {
                      name: strings.name,
                      svgicons: svgEditor.curConfig.extIconsPath + 'closepath_icons.svg',
                      buttons: strings.buttons.map(function (button, i) {
                        return Object.assign(buttons[i], button);
                      }),
                      callback: function callback() {
                        $('#closepath_panel').hide();
                      },
                      selectedChanged: function selectedChanged(opts) {
                        selElems = opts.elems;
                        var i = selElems.length;

                        while (i--) {
                          var elem = selElems[i];

                          if (elem && elem.tagName === 'path') {
                            if (opts.selectedElement && !opts.multiselected) {
                              showPanel(true);
                            } else {
                              showPanel(false);
                            }
                          } else {
                            showPanel(false);
                          }
                        }
                      }
                    });

                  case 10:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }))();
        }
      });

    }
  };
});
