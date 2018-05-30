/* globals jQuery */
/*
 * ext-imagelib.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */
import svgEditor from '../svg-editor.js';

svgEditor.addExtension('imagelib', function ({decode64}) {
  const $ = jQuery;
  const {uiStrings, canvas: svgCanvas} = svgEditor;

  $.extend(uiStrings, {
    imagelib: {
      select_lib: 'Select an image library',
      show_list: 'Show library list',
      import_single: 'Import single',
      import_multi: 'Import multiple',
      open: 'Open as new document'
    }
  });

  const modularVersion = !('svgEditor' in window) ||
    !window.svgEditor ||
    window.svgEditor.modules !== false;

  const imgLibs = [
    {
      name: 'Demo library (local)',
      url: svgEditor.curConfig.extIconsPath +
        'imagelib/index' + (modularVersion ? '-es' : '') + '.html',
      description: 'Demonstration library for SVG-edit on this server'
    },
    {
      name: 'IAN Symbol Libraries',
      url: 'https://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php',
      description: 'Free library of illustrations'
    },
    {
      name: 'Openclipart',
      url: 'https://openclipart.org/svgedit',
      description: 'Share and Use Images. Over 50,000 Public Domain SVG Images and Growing.'
    }
  ];

  function closeBrowser () {
    $('#imgbrowse_holder').hide();
  }

  function importImage (url) {
    const newImage = svgCanvas.addSvgElementFromJson({
      element: 'image',
      attr: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        id: svgCanvas.getNextId(),
        style: 'pointer-events:inherit'
      }
    });
    svgCanvas.clearSelection();
    svgCanvas.addToSelection([newImage]);
    svgCanvas.setImageURL(url);
  }

  const pending = {};

  let mode = 's';
  let multiArr = [];
  let transferStopped = false;
  let preview, submit;

  window.addEventListener('message', function (evt) {
    // Receive `postMessage` data
    let response = evt.data;

    if (!response || typeof response !== 'string') {
      // Do nothing
      return;
    }
    try {
      // Todo: This block can be removed (and the above check changed to
      //   insist on an object) if embedAPI moves away from a string to
      //   an object (if IE9 support not needed)
      response = JSON.parse(response);
      if (response.namespace !== 'imagelib') {
        return;
      }
    } catch (e) {
      return;
    }

    const hasName = 'name' in response;
    const hasHref = 'href' in response;

    if (!hasName && transferStopped) {
      transferStopped = false;
      return;
    }

    let id;
    if (hasHref) {
      id = response.href;
      response = response.data;
    }

    // Hide possible transfer dialog box
    $('#dialog_box').hide();
    let entry, curMeta, svgStr, imgStr;
    const type = hasName
      ? 'meta'
      : response.charAt(0);
    switch (type) {
    case 'meta': {
      // Metadata
      transferStopped = false;
      curMeta = response;

      pending[curMeta.id] = curMeta;

      const name = (curMeta.name || 'file');

      const message = uiStrings.notification.retrieving.replace('%s', name);

      if (mode !== 'm') {
        $.process_cancel(message, function () {
          transferStopped = true;
          // Should a message be sent back to the frame?

          $('#dialog_box').hide();
        });
      } else {
        entry = $('<div>' + message + '</div>').data('id', curMeta.id);
        preview.append(entry);
        curMeta.entry = entry;
      }

      return;
    }
    case '<':
      svgStr = true;
      break;
    case 'd': {
      if (response.startsWith('data:image/svg+xml')) {
        const pre = 'data:image/svg+xml;base64,';
        const src = response.substring(pre.length);
        response = decode64(src);
        svgStr = true;
        break;
      } else if (response.startsWith('data:image/')) {
        imgStr = true;
        break;
      }
    }
    // Else fall through
    default:
      // TODO: See if there's a way to base64 encode the binary data stream
      // const str = 'data:;base64,' + svgedit.utilities.encode64(response, true);

      // Assume it's raw image data
      // importImage(str);

      // Don't give warning as postMessage may have been used by something else
      if (mode !== 'm') {
        closeBrowser();
      } else {
        pending[id].entry.remove();
      }
      // $.alert('Unexpected data was returned: ' + response, function() {
      //   if (mode !== 'm') {
      //     closeBrowser();
      //   } else {
      //     pending[id].entry.remove();
      //   }
      // });
      return;
    }

    switch (mode) {
    case 's':
      // Import one
      if (svgStr) {
        svgCanvas.importSvgString(response);
      } else if (imgStr) {
        importImage(response);
      }
      closeBrowser();
      break;
    case 'm':
      // Import multiple
      multiArr.push([(svgStr ? 'svg' : 'img'), response]);
      curMeta = pending[id];
      let title;
      if (svgStr) {
        if (curMeta && curMeta.name) {
          title = curMeta.name;
        } else {
          // Try to find a title
          const xml = new DOMParser().parseFromString(response, 'text/xml').documentElement;
          title = $(xml).children('title').first().text() || '(SVG #' + response.length + ')';
        }
        if (curMeta) {
          preview.children().each(function () {
            if ($(this).data('id') === id) {
              if (curMeta.preview_url) {
                $(this).html('<img src="' + curMeta.preview_url + '">' + title);
              } else {
                $(this).text(title);
              }
              submit.removeAttr('disabled');
            }
          });
        } else {
          preview.append('<div>' + title + '</div>');
          submit.removeAttr('disabled');
        }
      } else {
        if (curMeta && curMeta.preview_url) {
          title = curMeta.name || '';
        }
        if (curMeta && curMeta.preview_url) {
          entry = '<img src="' + curMeta.preview_url + '">' + title;
        } else {
          entry = '<img src="' + response + '">';
        }

        if (curMeta) {
          preview.children().each(function () {
            if ($(this).data('id') === id) {
              $(this).html(entry);
              submit.removeAttr('disabled');
            }
          });
        } else {
          preview.append($('<div>').append(entry));
          submit.removeAttr('disabled');
        }
      }
      break;
    case 'o':
      // Open
      if (!svgStr) { break; }
      svgEditor.openPrep(function (ok) {
        if (!ok) { return; }
        svgCanvas.clear();
        svgCanvas.setSvgString(response);
        // updateCanvas();
      });
      closeBrowser();
      break;
    }
  }, true);

  function toggleMulti (show) {
    $('#lib_framewrap, #imglib_opts').css({right: (show ? 200 : 10)});
    if (!preview) {
      preview = $('<div id=imglib_preview>').css({
        position: 'absolute',
        top: 45,
        right: 10,
        width: 180,
        bottom: 45,
        background: '#fff',
        overflow: 'auto'
      }).insertAfter('#lib_framewrap');

      submit = $('<button disabled>Import selected</button>')
        .appendTo('#imgbrowse')
        .on('click touchend', function () {
          $.each(multiArr, function (i) {
            const type = this[0];
            const data = this[1];
            if (type === 'svg') {
              svgCanvas.importSvgString(data);
            } else {
              importImage(data);
            }
            svgCanvas.moveSelectedElements(i * 20, i * 20, false);
          });
          preview.empty();
          multiArr = [];
          $('#imgbrowse_holder').hide();
        }).css({
          position: 'absolute',
          bottom: 10,
          right: -10
        });
    }

    preview.toggle(show);
    submit.toggle(show);
  }

  function showBrowser () {
    let browser = $('#imgbrowse');
    if (!browser.length) {
      $('<div id=imgbrowse_holder><div id=imgbrowse class=toolbar_button>' +
      '</div></div>').insertAfter('#svg_docprops');
      browser = $('#imgbrowse');

      const allLibs = uiStrings.imagelib.select_lib;

      const libOpts = $('<ul id=imglib_opts>').appendTo(browser);
      const frame = $('<iframe/>').prependTo(browser).hide().wrap('<div id=lib_framewrap>');

      const header = $('<h1>').prependTo(browser).text(allLibs).css({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      });

      const cancel = $('<button>' + uiStrings.common.cancel + '</button>')
        .appendTo(browser)
        .on('click touchend', function () {
          $('#imgbrowse_holder').hide();
        }).css({
          position: 'absolute',
          top: 5,
          right: -10
        });

      const leftBlock = $('<span>').css({position: 'absolute', top: 5, left: 10}).appendTo(browser);

      const back = $('<button hidden>' + uiStrings.imagelib.show_list + '</button>')
        .appendTo(leftBlock)
        .on('click touchend', function () {
          frame.attr('src', 'about:blank').hide();
          libOpts.show();
          header.text(allLibs);
          back.hide();
        }).css({
          'margin-right': 5
        }).hide();

      /* const type = */ $('<select><option value=s>' +
        uiStrings.imagelib.import_single + '</option><option value=m>' +
        uiStrings.imagelib.import_multi + '</option><option value=o>' +
        uiStrings.imagelib.open + '</option></select>').appendTo(leftBlock).change(function () {
        mode = $(this).val();
        switch (mode) {
        case 's':
        case 'o':
          toggleMulti(false);
          break;

        case 'm':
          // Import multiple
          toggleMulti(true);
          break;
        }
      }).css({
        'margin-top': 10
      });

      cancel.prepend($.getSvgIcon('cancel', true));
      back.prepend($.getSvgIcon('tool_imagelib', true));

      $.each(imgLibs, function (i, {name, url, description}) {
        $('<li>')
          .appendTo(libOpts)
          .text(name)
          .on('click touchend', function () {
            frame.attr('src', url).show();
            header.text(name);
            libOpts.hide();
            back.show();
          }).append(`<span>${description}</span>`);
      });
    } else {
      $('#imgbrowse_holder').show();
    }
  }

  return {
    svgicons: svgEditor.curConfig.extIconsPath + 'ext-imagelib.xml',
    buttons: [{
      id: 'tool_imagelib',
      type: 'app_menu', // _flyout
      position: 4,
      title: 'Image library',
      events: {
        mouseup: showBrowser
      }
    }],
    callback () {
      $('<style>').text(
        '#imgbrowse_holder {' +
          'position: absolute;' +
          'top: 0;' +
          'left: 0;' +
          'width: 100%;' +
          'height: 100%;' +
          'background-color: rgba(0, 0, 0, .5);' +
          'z-index: 5;' +
        '}' +
        '#imgbrowse {' +
          'position: absolute;' +
          'top: 25px;' +
          'left: 25px;' +
          'right: 25px;' +
          'bottom: 25px;' +
          'min-width: 300px;' +
          'min-height: 200px;' +
          'background: #B0B0B0;' +
          'border: 1px outset #777;' +
        '}' +
        '#imgbrowse h1 {' +
          'font-size: 20px;' +
          'margin: .4em;' +
          'text-align: center;' +
        '}' +
        '#lib_framewrap,' +
        '#imgbrowse > ul {' +
          'position: absolute;' +
          'top: 45px;' +
          'left: 10px;' +
          'right: 10px;' +
          'bottom: 10px;' +
          'background: white;' +
          'margin: 0;' +
          'padding: 0;' +
        '}' +
        '#imgbrowse > ul {' +
          'overflow: auto;' +
        '}' +
        '#imgbrowse > div {' +
          'border: 1px solid #666;' +
        '}' +
        '#imglib_preview > div {' +
          'padding: 5px;' +
          'font-size: 12px;' +
        '}' +
        '#imglib_preview img {' +
          'display: block;' +
          'margin: 0 auto;' +
          'max-height: 100px;' +
        '}' +
        '#imgbrowse li {' +
          'list-style: none;' +
          'padding: .5em;' +
          'background: #E8E8E8;' +
          'border-bottom: 1px solid #B0B0B0;' +
          'line-height: 1.2em;' +
          'font-style: sans-serif;' +
          '}' +
        '#imgbrowse li > span {' +
          'color: #666;' +
          'font-size: 15px;' +
          'display: block;' +
          '}' +
        '#imgbrowse li:hover {' +
          'background: #FFC;' +
          'cursor: pointer;' +
          '}' +
        '#imgbrowse iframe {' +
          'width: 100%;' +
          'height: 100%;' +
          'border: 0;' +
        '}'
      ).appendTo('head');
    }
  };
});
