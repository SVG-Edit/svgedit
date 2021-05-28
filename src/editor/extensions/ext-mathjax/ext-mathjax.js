/* globals MathJax */
/**
 * @file ext-mathjax.js
 *
 * @license MIT
 *
 * @copyright 2013 Jo Segaert
 *
 */

const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'mathjax',
  async init ({ $ }) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;

    // Configuration of the MathJax extention.

    // This will be added to the head tag before MathJax is loaded.
    const /* mathjaxConfiguration = `<script type="text/x-mathjax-config">
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
      { uiStrings } = svgEditor;
    let
      math;
    let locationX;
    let locationY;
    let mathjaxLoaded = false;

    // TODO: Implement language support. Move these uiStrings to the locale files and
    //   the code to the langReady callback. Also i18nize alert and HTML below
    $.extend(uiStrings, {
      mathjax: {
        embed_svg: 'Save as mathematics',
        embed_mathml: 'Save as figure',
        svg_save_warning: 'The math will be transformed into a figure is ' +
          'manipulatable like everything else. You will not be able to ' +
          'manipulate the TeX-code anymore.',
        mathml_save_warning: 'Advised. The math will be saved as a figure.',
        title: 'Mathematics code editor'
      }
    });

    /**
     *
     * @returns {void}
     */
    function saveMath () {
      const code = $id('mathjax_code_textarea').value;
      // displaystyle to force MathJax NOT to use the inline style. Because it is
      // less fancy!
      MathJax.Hub.queue.Push([ 'Text', math, '\\displaystyle{' + code + '}' ]);

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
      MathJax.Hub.queue.Push(
        function () {
          const mathjaxMath = $('.MathJax_SVG');
          const svg = $(mathjaxMath.html());
          svg.find('use').each(function () {
            // TODO: find a less pragmatic and more elegant solution to this.
            const id = $(this).attr('href')
              ? $(this).attr('href').slice(1) // Works in Chrome.
              : $(this).attr('xlink:href').slice(1); // Works in Firefox.
            const glymph = $('#' + id).clone().removeAttr('id');
            const x = $(this).attr('x');
            const y = $(this).attr('y');
            const transform = $(this).attr('transform');
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
        }
      );
    }

    const buttons = [ {
      id: 'tool_mathjax',
      type: 'mode',
      icon: 'mathjax.png',
      events: {
        async click () {
          // Set the mode.
          svgCanvas.setMode('mathjax');

          // Only load Mathjax when needed, we don't want to strain Svg-Edit any more.
          // From this point on it is very probable that it will be needed, so load it.
          if (mathjaxLoaded === false) {
            const div = document.createElement('div');
            div.id = 'mathjax';
            div.innerHTML = '<!-- Here is where MathJax creates the math -->' +
            '<div id="mathjax_creator" class="tex2jax_process" style="display:none">' +
              '$${}$$' +
            '</div>' +
            '<div id="mathjax_overlay"></div>' +
            '<div id="mathjax_container">' +
              '<div id="tool_mathjax_back" class="toolbar_button">' +
                '<button id="tool_mathjax_save">OK</button>' +
                '<button id="tool_mathjax_cancel">Cancel</button>' +
              '</div>' +
              '<fieldset>' +
                '<legend id="mathjax_legend">Mathematics Editor</legend>' +
                '<label>' +
                  '<span id="mathjax_explication">Please type your mathematics in ' +
                  '<a href="https://en.wikipedia.org/wiki/Help:' +
                    'Displaying_a_formula" target="_blank">TeX</a> code.' +
                    '</span></label>' +
                '<textarea id="mathjax_code_textarea" spellcheck="false"></textarea>' +
              '</fieldset>' +
            '</div>';
            $id('svg_prefs').parentNode.insertBefore(div, $id('svg_prefs').nextSibling);
            div.style.display = 'none';
            // Add functionality and picture to cancel button.
            $('#tool_mathjax_cancel').prepend($.getSvgIcon('cancel', true))
              .on('click touched', function () {
                $id("mathjax").style.display = 'none';
              });

            // Add functionality and picture to the save button.
            $('#tool_mathjax_save').prepend($.getSvgIcon('ok', true))
              .on('click touched', function () {
                saveMath();
                $id("mathjax").style.display = 'none';
              });

            // MathJax preprocessing has to ignore most of the page.
            document.body.classList.add("tex2jax_ignore");

            try {
              await import('./mathjax/MathJax.min.js'); // ?config=TeX-AMS-MML_SVG.js');
              // When MathJax is loaded get the div where the math will be rendered.
              MathJax.Hub.queue.Push(function () {
                math = MathJax.Hub.getAllJax('#mathjax_creator')[0];
                mathjaxLoaded = true;
                console.info('MathJax Loaded');
              });
            } catch (e) {
              console.warn('Failed loading MathJax.');
              // eslint-disable-next-line no-alert
              alert('Failed loading MathJax. You will not be able to change the mathematics.');
            }
          }
        }
      }
    } ];

    return {
      name: strings.name,
      svgicons: 'mathjax-icons.xml',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),

      mouseDown () {
        if (svgCanvas.getMode() === 'mathjax') {
          return { started: true };
        }
        return undefined;
      },
      mouseUp (opts) {
        if (svgCanvas.getMode() === 'mathjax') {
          // Get the coordinates from your mouse.
          const zoom = svgCanvas.getZoom();
          // Get the actual coordinate by dividing by the zoom value
          locationX = opts.mouse_x / zoom;
          locationY = opts.mouse_y / zoom;

          $id("mathjax").style.display = 'block';
          return { started: false }; // Otherwise the last selected object dissapears.
        }
        return undefined;
      },
      callback () {
        const head = document.head || document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.textContent = '#mathjax fieldset{' +
          'padding: 5px;' +
          'margin: 5px;' +
          'border: 1px solid #DDD;' +
        '}' +
        '#mathjax label{' +
          'display: block;' +
          'margin: .5em;' +
        '}' +
        '#mathjax legend {' +
          'max-width:195px;' +
        '}' +
        '#mathjax_overlay {' +
          'position: absolute;' +
          'top: 0;' +
          'left: 0;' +
          'right: 0;' +
          'bottom: 0;' +
          'background-color: black;' +
          'opacity: 0.6;' +
          'z-index: 20000;' +
        '}' +
        '#mathjax_container {' +
          'position: absolute;' +
          'top: 50px;' +
          'padding: 10px;' +
          'background-color: #5a6162;' +
          'border: 1px outset #777;' +
          'opacity: 1.0;' +
          'font-family: Verdana, Helvetica, sans-serif;' +
          'font-size: .8em;' +
          'z-index: 20001;' +
        '}' +
        '#tool_mathjax_back {' +
          'margin-left: 1em;' +
          'overflow: auto;' +
        '}' +
        '#mathjax_legend{' +
          'font-weight: bold;' +
          'font-size:1.1em;' +
        '}' +
        '#mathjax_code_textarea {\\n' +
          'margin: 5px .7em;' +
          'overflow: hidden;' +
          'width: 416px;' +
          'display: block;' +
          'height: 100px;' +
        '}';
        head.appendChild(style);
      }
    };
  }
};
