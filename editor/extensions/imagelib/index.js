/* globals jQuery */
const $ = jQuery;
$('a').click(function () {
  const {href} = this;
  const target = window.parent;
  const post = (message) => {
    // Todo: Make origin customizable as set by opening window
    // Todo: If dropping IE9, avoid stringifying
    target.postMessage(JSON.stringify({
      namespace: 'imagelib',
      ...message
    }), '*');
  };
  // Convert Non-SVG images to data URL first
  // (this could also have been done server-side by the library)
  // Send metadata (also indicates file is about to be sent)
  post({
    name: $(this).text(),
    id: href
  });
  if (!href.includes('.svg')) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      // load the raster image into the canvas
      canvas.getContext('2d').drawImage(this, 0, 0);
      // retrieve the data: URL
      let data;
      try {
        data = canvas.toDataURL();
      } catch (err) {
        // This fails in Firefox with `file:///` URLs :(
        alert('Data URL conversion failed: ' + err);
        data = '';
      }
      post({href, data});
    };
    img.src = href;
  } else {
    // Do ajax request for image's href value
    $.get(href, function (data) {
      post({href, data});
    }, 'html'); // 'html' is necessary to keep returned data as a string
  }
  return false;
});
