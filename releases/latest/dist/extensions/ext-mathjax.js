var svgEditorExtension_mathjax = (function () {
  'use strict';

  var asyncToGenerator = function (fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
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
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  };

  var _extends = Object.assign || function (target) {
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

  // MIT License
  // From: https://github.com/uupaa/dynamic-import-polyfill/blob/master/importModule.js

  /**
   * @module importModule
   */

  function toAbsoluteURL(url) {
    var a = document.createElement('a');
    a.setAttribute('href', url); // <a href="hoge.html">
    return a.cloneNode(false).href; // -> "http://example.com/hoge.html"
  }

  function addScriptAtts(script, atts) {
    ['id', 'class', 'type'].forEach(function (prop) {
      if (prop in atts) {
        script[prop] = atts[prop];
      }
    });
  }

  // Additions by Brett
  /**
  * @typedef {PlainObject} module:importModule.ImportConfig
  * @property {string} global The variable name to set on `window` (when not using the modular version)
  * @property {boolean} [returnDefault=false]
  */
  /**
  * @function module:importModule.importSetGlobalDefault
  * @param {string} url
  * @param {module:importModule.ImportConfig} config
  * @returns {*} The return depends on the export of the targeted module.
  */
  var importSetGlobalDefault = function () {
    var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, config) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', importSetGlobal(url, _extends({}, config, { returnDefault: true })));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function importSetGlobalDefault(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  /**
  * @function module:importModule.importSetGlobal
  * @param {string} url
  * @param {module:importModule.ImportConfig} config
  * @returns {ArbitraryModule|*} The return depends on the export of the targeted module.
  */
  var importSetGlobal = function () {
    var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, _ref2) {
      var global = _ref2.global,
          returnDefault = _ref2.returnDefault;
      var modularVersion;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Todo: Replace calls to this function with `import()` when supported
              modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false;

              if (!modularVersion) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt('return', importModule(url, undefined, { returnDefault: returnDefault }));

            case 3:
              _context2.next = 5;
              return importScript(url);

            case 5:
              return _context2.abrupt('return', window[global]);

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function importSetGlobal(_x3, _x4) {
      return _ref3.apply(this, arguments);
    };
  }();
  // Addition by Brett
  function importScript(url) {
    var atts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Array.isArray(url)) {
      return Promise.all(url.map(function (u) {
        return importScript(u, atts);
      }));
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      var destructor = function destructor() {
        script.onerror = null;
        script.onload = null;
        script.remove();
        script.src = '';
      };
      script.defer = 'defer';
      addScriptAtts(script, atts);
      script.onerror = function () {
        reject(new Error('Failed to import: ' + url));
        destructor();
      };
      script.onload = function () {
        resolve();
        destructor();
      };
      script.src = url;

      document.head.append(script);
    });
  }

  function importModule(url) {
    var atts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref4$returnDefault = _ref4.returnDefault,
        returnDefault = _ref4$returnDefault === undefined ? false : _ref4$returnDefault;

    if (Array.isArray(url)) {
      return Promise.all(url.map(function (u) {
        return importModule(u, atts);
      }));
    }
    return new Promise(function (resolve, reject) {
      var vector = '$importModule$' + Math.random().toString(32).slice(2);
      var script = document.createElement('script');
      var destructor = function destructor() {
        delete window[vector];
        script.onerror = null;
        script.onload = null;
        script.remove();
        URL.revokeObjectURL(script.src);
        script.src = '';
      };
      addScriptAtts(script, atts);
      script.defer = 'defer';
      script.type = 'module';
      script.onerror = function () {
        reject(new Error('Failed to import: ' + url));
        destructor();
      };
      script.onload = function () {
        resolve(window[vector]);
        destructor();
      };
      var absURL = toAbsoluteURL(url);
      var loader = 'import * as m from \'' + absURL.replace(/'/g, "\\'") + '\'; window.' + vector + ' = ' + (returnDefault ? 'm.default || ' : '') + 'm;'; // export Module
      var blob = new Blob([loader], { type: 'text/javascript' });
      script.src = URL.createObjectURL(blob);

      document.head.append(script);
    });
  }

  /* globals jQuery, MathJax */

  var extMathjax = {
    name: 'mathjax',
    init: function () {
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale = _ref.importLocale;
        var strings, svgEditor, $, svgCanvas, mathjaxSrcSecure, uiStrings, math, locationX, locationY, mathjaxLoaded, saveMath, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                saveMath = function saveMath() {
                  var code = $('#mathjax_code_textarea').val();
                  // displaystyle to force MathJax NOT to use the inline style. Because it is
                  // less fancy!
                  MathJax.Hub.queue.Push(['Text', math, '\\displaystyle{' + code + '}']);

                  /*
                   * The MathJax library doesn't want to bloat your webpage so it creates
                   * every symbol (glymph) you need only once. These are saved in a `<svg>` on
                   * the top of your html document, just under the body tag. Each glymph has
                   * its unique id and is saved as a `<path>` in the `<defs>` tag of the `<svg>`
                   *
                   * Then when the symbols are needed in the rest of your html document they
                   * are refferd to by a `<use>` tag.
                   * Because of bug 1076 we can't just grab the defs tag on the top and add it
                   * to your formula's `<svg>` and copy the lot. So we have to replace each
                   * `<use>` tag by its `<path>`.
                   */
                  MathJax.Hub.queue.Push(function () {
                    var mathjaxMath = $('.MathJax_SVG');
                    var svg = $(mathjaxMath.html());
                    svg.find('use').each(function () {
                      // TODO: find a less pragmatic and more elegant solution to this.
                      var id = $(this).attr('href') ? $(this).attr('href').slice(1) // Works in Chrome.
                      : $(this).attr('xlink:href').slice(1); // Works in Firefox.
                      var glymph = $('#' + id).clone().removeAttr('id');
                      var x = $(this).attr('x');
                      var y = $(this).attr('y');
                      var transform = $(this).attr('transform');
                      if (transform && (x || y)) {
                        glymph.attr('transform', transform + ' translate(' + x + ',' + y + ')');
                      } else if (transform) {
                        glymph.attr('transform', transform);
                      } else if (x || y) {
                        glymph.attr('transform', 'translate(' + x + ',' + y + ')');
                      }
                      $(this).replaceWith(glymph);
                    });
                    // Remove the style tag because it interferes with SVG-Edit.
                    svg.removeAttr('style');
                    svg.attr('xmlns', 'http://www.w3.org/2000/svg');
                    svgCanvas.importSvgString($('<div>').append(svg.clone()).html(), true);
                    svgCanvas.ungroupSelectedElement();
                    // TODO: To undo the adding of the Formula you now have to undo twice.
                    // This should only be once!
                    svgCanvas.moveSelectedElements(locationX, locationY, true);
                  });
                };

                _context.next = 3;
                return importLocale();

              case 3:
                strings = _context.sent;
                svgEditor = this;
                $ = jQuery;
                svgCanvas = svgEditor.canvas;

                // Configuration of the MathJax extention.

                // This will be added to the head tag before MathJax is loaded.

                /* mathjaxConfiguration = `<script type="text/x-mathjax-config">
                MathJax.Hub.Config({
                extensions: ['tex2jax.js'],
                jax: ['input/TeX', 'output/SVG'],
                showProcessingMessages: true,
                showMathMenu: false,
                showMathMenuMSIE: false,
                errorSettings: {
                  message: ['[Math Processing Error]'],
                  style: {color: '#CC0000', 'font-style': 'italic'}
                },
                elements: [],
                  tex2jax: {
                  ignoreClass: 'tex2jax_ignore2', processClass: 'tex2jax_process2',
                },
                TeX: {
                  extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
                },
                SVG: {
                }
                });
                </script>`, */
                // mathjaxSrc = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js',
                // Had been on https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG.js
                // Obtained Text-AMS-MML_SVG.js from https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.3/config/TeX-AMS-MML_SVG.js
                mathjaxSrcSecure = 'mathjax/MathJax.min.js?config=TeX-AMS-MML_SVG.js', uiStrings = svgEditor.uiStrings;
                math = void 0, locationX = void 0, locationY = void 0, mathjaxLoaded = false;

                // TODO: Implement language support. Move these uiStrings to the locale files and the code to the langReady callback.

                $.extend(uiStrings, {
                  mathjax: {
                    embed_svg: 'Save as mathematics',
                    embed_mathml: 'Save as figure',
                    svg_save_warning: 'The math will be transformed into a figure is manipulatable like everything else. You will not be able to manipulate the TeX-code anymore. ',
                    mathml_save_warning: 'Advised. The math will be saved as a figure.',
                    title: 'Mathematics code editor'
                  }
                });

                buttons = [{
                  id: 'tool_mathjax',
                  type: 'mode',
                  events: {
                    click: function click() {
                      // Only load Mathjax when needed, we don't want to strain Svg-Edit any more.
                      // From this point on it is very probable that it will be needed, so load it.
                      if (mathjaxLoaded === false) {
                        $('<div id="mathjax">' + '<!-- Here is where MathJax creates the math -->' + '<div id="mathjax_creator" class="tex2jax_process" style="display:none">' + '$${}$$' + '</div>' + '<div id="mathjax_overlay"></div>' + '<div id="mathjax_container">' + '<div id="tool_mathjax_back" class="toolbar_button">' + '<button id="tool_mathjax_save">OK</button>' + '<button id="tool_mathjax_cancel">Cancel</button>' + '</div>' + '<fieldset>' + '<legend id="mathjax_legend">Mathematics Editor</legend>' + '<label>' + '<span id="mathjax_explication">Please type your mathematics in ' + '<a href="https://en.wikipedia.org/wiki/Help:Displaying_a_formula" target="_blank">TeX</a> code.</span></label>' + '<textarea id="mathjax_code_textarea" spellcheck="false"></textarea>' + '</fieldset>' + '</div>' + '</div>').insertAfter('#svg_prefs').hide();

                        // Make the MathEditor draggable.
                        $('#mathjax_container').draggable({
                          cancel: 'button,fieldset',
                          containment: 'window'
                        });

                        // Add functionality and picture to cancel button.
                        $('#tool_mathjax_cancel').prepend($.getSvgIcon('cancel', true)).on('click touched', function () {
                          $('#mathjax').hide();
                        });

                        // Add functionality and picture to the save button.
                        $('#tool_mathjax_save').prepend($.getSvgIcon('ok', true)).on('click touched', function () {
                          saveMath();
                          $('#mathjax').hide();
                        });

                        // MathJax preprocessing has to ignore most of the page.
                        $('body').addClass('tex2jax_ignore');

                        // Now get (and run) the MathJax Library.
                        // Todo: insert script with modules once widely supported
                        //   and if MathJax (and its `TeX-AMS-MML_SVG.js` dependency) ends up
                        //   providing an ES6 module export: https://github.com/mathjax/MathJax/issues/1998
                        /*
                        const modularVersion = !('svgEditor' in window) ||
                          !window.svgEditor ||
                          window.svgEditor.modules !== false;
                        // Add as second argument to `importScript`
                        {
                          type: modularVersion
                            ? 'module' // Make this the default when widely supported
                            : 'text/javascript'
                        }
                        // If only using modules, just use this:
                        const {default: MathJax} = await importModule( // or `import()` when widely supported
                          svgEditor.curConfig.extIconsPath + mathjaxSrcSecure
                        );
                        */
                        importScript(svgEditor.curConfig.extIconsPath + mathjaxSrcSecure).then(function () {
                          // When MathJax is loaded get the div where the math will be rendered.
                          MathJax.Hub.queue.Push(function () {
                            math = MathJax.Hub.getAllJax('#mathjax_creator')[0];
                            console.log(math);
                            mathjaxLoaded = true;
                            console.log('MathJax Loaded');
                          });
                        }).catch(function () {
                          console.log('Failed loadeing MathJax.');
                          $.alert('Failed loading MathJax. You will not be able to change the mathematics.');
                        });
                      }
                      // Set the mode.
                      svgCanvas.setMode('mathjax');
                    }
                  }
                }];
                return _context.abrupt('return', {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'mathjax-icons.xml',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),

                  mouseDown: function mouseDown() {
                    if (svgCanvas.getMode() === 'mathjax') {
                      return { started: true };
                    }
                  },
                  mouseUp: function mouseUp(opts) {
                    if (svgCanvas.getMode() === 'mathjax') {
                      // Get the coordinates from your mouse.
                      var zoom = svgCanvas.getZoom();
                      // Get the actual coordinate by dividing by the zoom value
                      locationX = opts.mouse_x / zoom;
                      locationY = opts.mouse_y / zoom;

                      $('#mathjax').show();
                      return { started: false }; // Otherwise the last selected object dissapears.
                    }
                  },
                  callback: function callback() {
                    $('<style>').text('#mathjax fieldset{' + 'padding: 5px;' + 'margin: 5px;' + 'border: 1px solid #DDD;' + '}' + '#mathjax label{' + 'display: block;' + 'margin: .5em;' + '}' + '#mathjax legend {' + 'max-width:195px;' + '}' + '#mathjax_overlay {' + 'position: absolute;' + 'top: 0;' + 'left: 0;' + 'right: 0;' + 'bottom: 0;' + 'background-color: black;' + 'opacity: 0.6;' + 'z-index: 20000;' + '}' + '#mathjax_container {' + 'position: absolute;' + 'top: 50px;' + 'padding: 10px;' + 'background-color: #B0B0B0;' + 'border: 1px outset #777;' + 'opacity: 1.0;' + 'font-family: Verdana, Helvetica, sans-serif;' + 'font-size: .8em;' + 'z-index: 20001;' + '}' + '#tool_mathjax_back {' + 'margin-left: 1em;' + 'overflow: auto;' + '}' + '#mathjax_legend{' + 'font-weight: bold;' + 'font-size:1.1em;' + '}' + '#mathjax_code_textarea {\\n' + 'margin: 5px .7em;' + 'overflow: hidden;' + 'width: 416px;' + 'display: block;' + 'height: 100px;' + '}').appendTo('head');

                    // Add the MathJax configuration.
                    // $(mathjaxConfiguration).appendTo('head');
                  }
                });

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref2.apply(this, arguments);
      }

      return init;
    }()
  };

  return extMathjax;

}());
