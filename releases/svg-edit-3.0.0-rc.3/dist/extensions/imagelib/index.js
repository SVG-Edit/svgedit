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

  /* globals jQuery */
  var $ = jQuery;
  $('a').click(function () {
    var href = this.href;
    var target = window.parent;

    var post = function post(message) {
      // Todo: Make origin customizable as set by opening window
      // Todo: If dropping IE9, avoid stringifying
      target.postMessage(JSON.stringify(_extends({
        namespace: 'imagelib'
      }, message)), '*');
    }; // Convert Non-SVG images to data URL first
    // (this could also have been done server-side by the library)
    // Send metadata (also indicates file is about to be sent)


    post({
      name: $(this).text(),
      id: href
    });

    if (!href.includes('.svg')) {
      var img = new Image();

      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height; // load the raster image into the canvas

        canvas.getContext('2d').drawImage(this, 0, 0); // retrieve the data: URL

        var data;

        try {
          data = canvas.toDataURL();
        } catch (err) {
          // This fails in Firefox with `file:///` URLs :(
          alert('Data URL conversion failed: ' + err);
          data = '';
        }

        post({
          href: href,
          data: data
        });
      };

      img.src = href;
    } else {
      // Do ajax request for image's href value
      $.get(href, function (data) {
        post({
          href: href,
          data: data
        });
      }, 'html'); // 'html' is necessary to keep returned data as a string
    }

    return false;
  });

}());
