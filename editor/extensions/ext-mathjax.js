/*globals MathJax, svgEditor, svgCanvas, $*/
/*jslint es5: true, todo: true, vars: true*/
/*
 * ext-mathjax.js
 *
 * Licensed under the Apache License
 *
 * Copyright(c) 2013 Jo Segaert
 *
 */

svgEditor.addExtension("mathjax", function() {'use strict';
  // Configuration of the MathJax extention.

  // This will be added to the head tag before MathJax is loaded.
  var /*mathjaxConfiguration = '<script type="text/x-mathjax-config">\
        MathJax.Hub.Config({\
          extensions: ["tex2jax.js"],\
			    jax: ["input/TeX","output/SVG"],\
          showProcessingMessages: true,\
          showMathMenu: false,\
          showMathMenuMSIE: false,\
          errorSettings: {\
            message: ["[Math Processing Error]"],\
            style: {color: "#CC0000", "font-style":"italic"}\
          },\
          elements: [],\
            tex2jax: {\
            ignoreClass: "tex2jax_ignore2", processClass: "tex2jax_process2",\
          },\
          TeX: {\
            extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]\
          },\
          "SVG": {\
          }\
      });\
      </script>',*/
    // mathjaxSrc = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js',
    mathjaxSrcSecure = 'https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG.js',
    math,
    locationX,
    locationY,
    mathjaxLoaded = false,
    uiStrings = svgEditor.uiStrings;

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


  function saveMath() {
    var code = $('#mathjax_code_textarea').val();
    // displaystyle to force MathJax NOT to use the inline style. Because it is
    // less fancy!
    MathJax.Hub.queue.Push(['Text', math, '\\displaystyle{' + code + '}']);

    /*
     * The MathJax library doesn't want to bloat your webpage so it creates 
     * every symbol (glymph) you need only once. These are saved in a <svg> on  
     * the top of your html document, just under the body tag. Each glymph has
     * its unique id and is saved as a <path> in the <defs> tag of the <svg>
     * 
     * Then when the symbols are needed in the rest of your html document they
     * are refferd to by a <use> tag.
     * Because of bug 1076 we can't just grab the defs tag on the top and add it 
     * to your formula's <svg> and copy the lot. So we have to replace each 
     * <use> tag by it's <path>.
     */
    MathJax.Hub.queue.Push(
      function() {
        var mathjaxMath = $('.MathJax_SVG');
        var svg = $(mathjaxMath.html());
        svg.find('use').each(function() {
          var x, y, id, transform;

          // TODO: find a less pragmatic and more elegant solution to this.
          if ($(this).attr('href')) {
            id = $(this).attr('href').slice(1); // Works in Chrome.
          } else {
            id = $(this).attr('xlink:href').slice(1); // Works in Firefox.
          }

          var glymph = $('#' + id).clone().removeAttr('id');
          x = $(this).attr('x');
          y = $(this).attr('y');
          transform = $(this).attr('transform');
          if (transform && ( x || y )) {
            glymph.attr('transform', transform + ' translate(' + x + ',' + y + ')');
          }
          else if (transform) {
            glymph.attr('transform', transform);
          }
          else if (x || y) {
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

  return {
    name: "MatJax",
    svgicons: svgEditor.curConfig.extPath + "mathjax-icons.xml",
    buttons: [{
        id: "tool_mathjax",
        type: "mode",
        title: "Add Mathematics",
        events: {
          'click': function() {
            // Only load Mathjax when needed, we don't want to strain Svg-Edit any more. 
            // From this point on it is very probable that it will be needed, so load it.
            if (mathjaxLoaded === false) {

              $('<div id="mathjax">\
                <!-- Here is where MathJax creates the math -->\
                  <div id="mathjax_creator" class="tex2jax_process" style="display:none">\
                    $${}$$\
                  </div>\
                  <div id="mathjax_overlay"></div>\
                  <div id="mathjax_container">\
                    <div id="tool_mathjax_back" class="toolbar_button">\
                      <button id="tool_mathjax_save">OK</button>\
                      <button id="tool_mathjax_cancel">Cancel</button>\
                    </div>\
                    <fieldset>\
                      <legend id="mathjax_legend">Mathematics Editor</legend>\
                      <label>\
                        <span id="mathjax_explication">Please type your mathematics in \
                        <a href="http://en.wikipedia.org/wiki/Help:Displaying_a_formula" target="_blank">TeX</a> code.</span></label>\
                      <textarea id="mathjax_code_textarea" spellcheck="false"></textarea>\
                    </fieldset>\
                  </div>\
                </div>'
                ).insertAfter('#svg_prefs').hide();

              // Make the MathEditor draggable.
              $('#mathjax_container').draggable({cancel: 'button,fieldset', containment: 'window'});

              // Add functionality and picture to cancel button.
              $('#tool_mathjax_cancel').prepend($.getSvgIcon('cancel', true))
                .on("click touched", function() {
                $('#mathjax').hide();
              });

              // Add functionality and picture to the save button.
              $('#tool_mathjax_save').prepend($.getSvgIcon('ok', true))
                .on("click touched", function() {
                saveMath();
                $('#mathjax').hide();
              });

              // MathJax preprocessing has to ignore most of the page.
              $('body').addClass('tex2jax_ignore');

              // Now get (and run) the MathJax Library.
              $.getScript(mathjaxSrcSecure)
                .done(function(script, textStatus) {

                // When MathJax is loaded get the div where the math will be rendered.
                MathJax.Hub.queue.Push(function() {
                  math = MathJax.Hub.getAllJax('#mathjax_creator')[0];
                  console.log(math);
                  mathjaxLoaded = true;
                  console.log('MathJax Loaded');
                });

              })
                // If it fails.
                .fail(function() {
                console.log("Failed loadeing MathJax.");
                $.alert("Failed loading MathJax. You will not be able to change the mathematics.");
              });
            }
            // Set the mode.
            svgCanvas.setMode("mathjax");
          }
        }
      }],
    
    mouseDown: function() {
      if (svgCanvas.getMode() === "mathjax") {
        return {started: true};
      }
    },
    mouseUp: function(opts) {
      if (svgCanvas.getMode() === "mathjax") {
        // Get the coordinates from your mouse.
        var zoom = svgCanvas.getZoom();
        // Get the actual coordinate by dividing by the zoom value
        locationX = opts.mouse_x / zoom;
        locationY = opts.mouse_y / zoom;

        $('#mathjax').show();
        return {started: false}; // Otherwise the last selected object dissapears.
      }
    },
    callback: function() {
      $('<style>').text('\
				#mathjax fieldset{\
					padding: 5px;\
					margin: 5px;\
					border: 1px solid #DDD;\
				}\
				#mathjax label{\
					display: block;\
					margin: .5em;\
				}\
				#mathjax legend {\
					max-width:195px;\
				}\
				#mathjax_overlay {\
					position: absolute;\
					top: 0;\
					left: 0;\
					right: 0;\
					bottom: 0;\
					background-color: black;\
					opacity: 0.6;\
					z-index: 20000;\
				}\
				\
				#mathjax_container {\
					position: absolute;\
					top: 50px;\
					padding: 10px;\
					background-color: #B0B0B0;\
					border: 1px outset #777;\
					opacity: 1.0;\
					font-family: Verdana, Helvetica, sans-serif;\
					font-size: .8em;\
					z-index: 20001;\
				}\
				\
				#tool_mathjax_back {\
					margin-left: 1em;\
					overflow: auto;\
				}\
				\
				#mathjax_legend{\
					font-weight: bold;\
					font-size:1.1em;\
				}\
				\
				#mathjax_code_textarea {\\n\
          margin: 5px .7em;\
					overflow: hidden;\
          width: 416px;\
					display: block;\
					height: 100px;\
				}\
			').appendTo('head');

      // Add the MathJax configuration.
      //$(mathjaxConfiguration).appendTo('head');
    }
  };
});
