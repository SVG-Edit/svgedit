/**
 * SVG Icon Loader 2.0
 *
 * jQuery Plugin for loading SVG icons from a single file
 *
 * Adds {@link external:jQuery.svgIcons}, {@link external:jQuery.getSvgIcon}, {@link external:jQuery.resizeSvgIcons}
 *
 * How to use:

1. Create the SVG master file that includes all icons:

The master SVG icon-containing file is an SVG file that contains
`<g>` elements. Each `<g>` element should contain the markup of an SVG
icon. The `<g>` element has an ID that should
correspond with the ID of the HTML element used on the page that should contain
or optionally be replaced by the icon. Additionally, one empty element should be
added at the end with id "svg_eof".

2. Optionally create fallback raster images for each SVG icon.

3. Include the jQuery and the SVG Icon Loader scripts on your page.

4. Run `$.svgIcons()` when the document is ready. See its signature

5. To access an icon at a later point without using the callback, use this:
  `$.getSvgIcon(id (string), uniqueClone (boolean))`;

This will return the icon (as jQuery object) with a given ID.

6. To resize icons at a later point without using the callback, use this:
  `$.resizeSvgIcons(resizeOptions)` (use the same way as the "resize" parameter)
 *
 * @module jQuerySVGIcons
 * @license MIT
 * @copyright (c) 2009 Alexis Deveria
 * {@link http://a.deveria.com}
 * @example usage #1:

$(function() {
  $.svgIcons('my_icon_set.svg'); // The SVG file that contains all icons
  // No options have been set, so all icons will automatically be inserted
  // into HTML elements that match the same IDs.
});

* @example usage #2:

$(function() {
  $.svgIcons('my_icon_set.svg', { // The SVG file that contains all icons
    callback (icons) { // Custom callback function that sets click
                  // events for each icon
      $.each(icons, function(id, icon) {
        icon.click(function() {
          alert('You clicked on the icon with id ' + id);
        });
      });
    }
  }); //The SVG file that contains all icons
});

* @example usage #3:

$(function() {
  $.svgIcons('my_icon_set.svgz', { // The SVGZ file that contains all icons
    w: 32,  // All icons will be 32px wide
    h: 32,  // All icons will be 32px high
    fallback_path: 'icons/',  // All fallback files can be found here
    fallback: {
      '#open_icon': 'open.png',  // The "open.png" will be appended to the
                    // HTML element with ID "open_icon"
      '#close_icon': 'close.png',
      '#save_icon': 'save.png'
    },
    placement: {'.open_icon','open'}, // The "open" icon will be added
                    // to all elements with class "open_icon"
    resize () {
      '#save_icon .svg_icon': 64  // The "save" icon will be resized to 64 x 64px
    },

    callback (icons) { // Sets background color for "close" icon
      icons['close'].css('background','red');
    },

    svgz: true // Indicates that an SVGZ file is being used

  })
});
*/

/**
* @callback module:jQuerySVGIcons.SVGIconsLoadedCallback
* @param {PlainObject.<string, external:jQuery>} svgIcons IDs keyed to jQuery objects of images
*/

/**
 * @function module:jQuerySVGIcons.jQuerySVGIcons
 * @param {external:jQuery} $ Its keys include all icon IDs and the values, the icon as a jQuery object
*/
export default function ($) {
  const svgIcons = {};

  let fixIDs;
  /**
  * @function external:jQuery.svgIcons
  * @param {string} file The location of a local SVG or SVGz file
  * @param {PlainObject} [options]
  * @param {Float} [options.w] The icon widths
  * @param {Float} [options.h] The icon heights
  * @param {PlainObject.<string, string>} [options.fallback] List of raster images with each
    key being the SVG icon ID to replace, and the value the image file name
  * @param {string} [options.fallback_path] The path to use for all images
    listed under "fallback"
  * @param {boolean} [options.replace] If set to `true`, HTML elements will be replaced by,
    rather than include the SVG icon.
  * @param {PlainObject.<string, string>} [options.placement] List with selectors for keys and SVG icon ids
    as values. This provides a custom method of adding icons.
  * @param {PlainObject.<string, module:jQuerySVGIcons.Size>} [options.resize] List with selectors for keys and numbers
    as values. This allows an easy way to resize specific icons.
  * @param {module:jQuerySVGIcons.SVGIconsLoadedCallback} [options.callback] A function to call when all icons have been loaded.
  * @param {boolean} [options.id_match=true] Automatically attempt to match SVG icon ids with
    corresponding HTML id
  * @param {boolean} [options.no_img] Prevent attempting to convert the icon into an `<img>`
    element (may be faster, help for browser consistency)
  * @param {boolean} [options.svgz] Indicate that the file is an SVGZ file, and thus not to
    parse as XML. SVGZ files add compression benefits, but getting data from
    them fails in Firefox 2 and older.
  */
  $.svgIcons = function (file, opts = {}) {
    const svgns = 'http://www.w3.org/2000/svg',
      xlinkns = 'http://www.w3.org/1999/xlink',
      iconW = opts.w || 24,
      iconH = opts.h || 24;
    let elems, svgdoc, testImg,
      iconsMade = false, dataLoaded = false, loadAttempts = 0;
    const isOpera = !!window.opera,
      // ua = navigator.userAgent,
      // isSafari = (ua.includes('Safari/') && !ua.includes('Chrome/')),
      dataPre = 'data:image/svg+xml;charset=utf-8;base64,';

    let dataEl;
    if (opts.svgz) {
      dataEl = $('<object data="' + file + '" type=image/svg+xml>').appendTo('body').hide();
      try {
        svgdoc = dataEl[0].contentDocument;
        dataEl.load(getIcons);
        getIcons(0, true); // Opera will not run "load" event if file is already cached
      } catch (err1) {
        useFallback();
      }
    } else {
      const parser = new DOMParser();
      $.ajax({
        url: file,
        dataType: 'string',
        success (data) {
          if (!data) {
            $(useFallback);
            return;
          }
          svgdoc = parser.parseFromString(data, 'text/xml');
          $(function () {
            getIcons('ajax');
          });
        },
        error (err) {
          // TODO: Fix Opera widget icon bug
          if (window.opera) {
            $(function () {
              useFallback();
            });
          } else {
            if (err.responseText) {
              svgdoc = parser.parseFromString(err.responseText, 'text/xml');

              if (!svgdoc.childNodes.length) {
                $(useFallback);
              }
              $(function () {
                getIcons('ajax');
              });
            } else {
              $(useFallback);
            }
          }
        }
      });
    }

    function getIcons (evt, noWait) {
      if (evt !== 'ajax') {
        if (dataLoaded) return;
        // Webkit sometimes says svgdoc is undefined, other times
        // it fails to load all nodes. Thus we must make sure the "eof"
        // element is loaded.
        svgdoc = dataEl[0].contentDocument; // Needed again for Webkit
        const isReady = (svgdoc && svgdoc.getElementById('svg_eof'));
        if (!isReady && !(noWait && isReady)) {
          loadAttempts++;
          if (loadAttempts < 50) {
            setTimeout(getIcons, 20);
          } else {
            useFallback();
            dataLoaded = true;
          }
          return;
        }
        dataLoaded = true;
      }

      elems = $(svgdoc.firstChild).children(); // .getElementsByTagName('foreignContent');

      if (!opts.no_img) {
        const testSrc = dataPre + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D';

        testImg = $(new Image()).attr({
          src: testSrc,
          width: 0,
          height: 0
        }).appendTo('body')
          .load(function () {
            // Safari 4 crashes, Opera and Chrome don't
            makeIcons(true);
          }).error(function () {
            makeIcons();
          });
      } else {
        setTimeout(function () {
          if (!iconsMade) makeIcons();
        }, 500);
      }
    }

    function setIcon (target, icon, id, setID) {
      if (isOpera) icon.css('visibility', 'hidden');
      if (opts.replace) {
        if (setID) icon.attr('id', id);
        const cl = target.attr('class');
        if (cl) icon.attr('class', 'svg_icon ' + cl);
        target.replaceWith(icon);
      } else {
        target.append(icon);
      }
      if (isOpera) {
        setTimeout(function () {
          icon.removeAttr('style');
        }, 1);
      }
    }

    let holder;
    function addIcon (icon, id) {
      if (opts.id_match === undefined || opts.id_match !== false) {
        setIcon(holder, icon, id, true);
      }
      svgIcons[id] = icon;
    }

    function makeIcons (toImage, fallback) {
      if (iconsMade) return;
      if (opts.no_img) toImage = false;

      let tempHolder;
      if (toImage) {
        tempHolder = $(document.createElement('div'));
        tempHolder.hide().appendTo('body');
      }
      if (fallback) {
        const path = opts.fallback_path || '';
        $.each(fallback, function (id, imgsrc) {
          holder = $('#' + id);
          const icon = $(new Image())
            .attr({
              class: 'svg_icon',
              src: path + imgsrc,
              width: iconW,
              height: iconH,
              alt: 'icon'
            });

          addIcon(icon, id);
        });
      } else {
        const len = elems.length;
        for (let i = 0; i < len; i++) {
          const elem = elems[i];
          const {id} = elem;
          if (id === 'svg_eof') break;
          holder = $('#' + id);
          const svgroot = document.createElementNS(svgns, 'svg');
          // Per https://www.w3.org/TR/xml-names11/#defaulting, the namespace for
          // attributes should have no value.
          svgroot.setAttributeNS(null, 'viewBox', [0, 0, iconW, iconH].join(' '));

          let svg = elem.getElementsByTagNameNS(svgns, 'svg')[0];

          // Make flexible by converting width/height to viewBox
          const w = svg.getAttribute('width');
          const h = svg.getAttribute('height');
          svg.removeAttribute('width');
          svg.removeAttribute('height');

          const vb = svg.getAttribute('viewBox');
          if (!vb) {
            svg.setAttribute('viewBox', [0, 0, w, h].join(' '));
          }

          // Not using jQuery to be a bit faster
          svgroot.setAttribute('xmlns', svgns);
          svgroot.setAttribute('width', iconW);
          svgroot.setAttribute('height', iconH);
          svgroot.setAttribute('xmlns:xlink', xlinkns);
          svgroot.setAttribute('class', 'svg_icon');

          // Without cloning, Firefox will make another GET request.
          // With cloning, causes issue in Opera/Win/Non-EN
          if (!isOpera) svg = svg.cloneNode(true);

          svgroot.append(svg);

          let icon;
          if (toImage) {
            tempHolder.empty().append(svgroot);
            const str = dataPre + encode64(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svgroot))));
            icon = $(new Image())
              .attr({class: 'svg_icon', src: str});
          } else {
            icon = fixIDs($(svgroot), i);
          }
          addIcon(icon, id);
        }
      }

      if (opts.placement) {
        $.each(opts.placement, function (sel, id) {
          if (!svgIcons[id]) return;
          $(sel).each(function (i) {
            let copy = svgIcons[id].clone();
            if (i > 0 && !toImage) copy = fixIDs(copy, i, true);
            setIcon($(this), copy, id);
          });
        });
      }
      if (!fallback) {
        if (toImage) tempHolder.remove();
        if (dataEl) dataEl.remove();
        if (testImg) testImg.remove();
      }
      if (opts.resize) $.resizeSvgIcons(opts.resize);
      iconsMade = true;

      if (opts.callback) opts.callback(svgIcons);
    }

    fixIDs = function (svgEl, svgNum, force) {
      const defs = svgEl.find('defs');
      if (!defs.length) return svgEl;

      let idElems;
      if (isOpera) {
        idElems = defs.find('*').filter(function () {
          return !!this.id;
        });
      } else {
        idElems = defs.find('[id]');
      }

      const allElems = svgEl[0].getElementsByTagName('*'), len = allElems.length;

      idElems.each(function (i) {
        const {id} = this;
        /*
        const noDupes = ($(svgdoc).find('#' + id).length <= 1);
        if (isOpera) noDupes = false; // Opera didn't clone svgEl, so not reliable
        if(!force && noDupes) return;
        */
        const newId = 'x' + id + svgNum + i;
        this.id = newId;

        const oldVal = 'url(#' + id + ')';
        const newVal = 'url(#' + newId + ')';

        // Selector method, possibly faster but fails in Opera / jQuery 1.4.3
        //  svgEl.find('[fill="url(#' + id + ')"]').each(function() {
        //    this.setAttribute('fill', 'url(#' + newId + ')');
        //  }).end().find('[stroke="url(#' + id + ')"]').each(function() {
        //    this.setAttribute('stroke', 'url(#' + newId + ')');
        //  }).end().find('use').each(function() {
        //    if(this.getAttribute('xlink:href') == '#' + id) {
        //      this.setAttributeNS(xlinkns,'href','#' + newId);
        //    }
        //  }).end().find('[filter="url(#' + id + ')"]').each(function() {
        //    this.setAttribute('filter', 'url(#' + newId + ')');
        //  });

        for (i = 0; i < len; i++) {
          const elem = allElems[i];
          if (elem.getAttribute('fill') === oldVal) {
            elem.setAttribute('fill', newVal);
          }
          if (elem.getAttribute('stroke') === oldVal) {
            elem.setAttribute('stroke', newVal);
          }
          if (elem.getAttribute('filter') === oldVal) {
            elem.setAttribute('filter', newVal);
          }
        }
      });
      return svgEl;
    };

    function useFallback () {
      if (file.includes('.svgz')) {
        const regFile = file.replace('.svgz', '.svg');
        if (window.console) {
          console.log('.svgz failed, trying with .svg');
        }
        $.svgIcons(regFile, opts);
      } else if (opts.fallback) {
        makeIcons(false, opts.fallback);
      }
    }

    function encode64 (input) {
      // base64 strings are 4/3 larger than the original string
      if (window.btoa) return window.btoa(input);
      const _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      const output = new Array(Math.floor((input.length + 2) / 3) * 4);

      let i = 0, p = 0;
      do {
        const chr1 = input.charCodeAt(i++);
        const chr2 = input.charCodeAt(i++);
        const chr3 = input.charCodeAt(i++);

        const enc1 = chr1 >> 2;
        const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);

        let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        let enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output[p++] = _keyStr.charAt(enc1);
        output[p++] = _keyStr.charAt(enc2);
        output[p++] = _keyStr.charAt(enc3);
        output[p++] = _keyStr.charAt(enc4);
      } while (i < input.length);

      return output.join('');
    }
  };

  /**
  * @function external:jQuery.getSvgIcon
  * @param {string} id
  * @param {boolean} uniqueClone Whether to clone
  * @returns {external:jQuery} The icon (optionally cloned)
  */
  $.getSvgIcon = function (id, uniqueClone) {
    let icon = svgIcons[id];
    if (uniqueClone && icon) {
      icon = fixIDs(icon, 0, true).clone(true);
    }
    return icon;
  };

  /**
  * @typedef {GenericArray} module:jQuerySVGIcons.Dimensions
  * @property {Integer} length 2
  * @property {Float} 0 Width
  * @property {Float} 1 Height
  */

  /**
  * If a Float is used, it will represent width and height. Arrays contain the width and height.
  * @typedef {module:jQuerySVGIcons.Dimensions|Float} module:jQuerySVGIcons.Size
  */

  /**
  * @function external:jQuery.resizeSvgIcons
  * @param {PlainObject.<string, module:jQuerySVGIcons.Size>} obj Object with selectors as keys. The values are sizes.
  * @returns {undefined}
  */
  $.resizeSvgIcons = function (obj) {
    // FF2 and older don't detect .svg_icon, so we change it detect svg elems instead
    const changeSel = !$('.svg_icon:first').length;
    $.each(obj, function (sel, size) {
      const arr = Array.isArray(size);
      const w = arr ? size[0] : size,
        h = arr ? size[1] : size;
      if (changeSel) {
        sel = sel.replace(/\.svg_icon/g, 'svg');
      }
      $(sel).each(function () {
        this.setAttribute('width', w);
        this.setAttribute('height', h);
        if (window.opera && window.widget) {
          this.parentNode.style.width = w + 'px';
          this.parentNode.style.height = h + 'px';
        }
      });
    });
  };
  return $;
}
