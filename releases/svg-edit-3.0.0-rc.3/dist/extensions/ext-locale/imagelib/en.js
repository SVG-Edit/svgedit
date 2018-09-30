var svgEditorExtensionLocale_imagelib_en = (function () {
  'use strict';

  var en = {
    select_lib: 'Select an image library',
    show_list: 'Show library list',
    import_single: 'Import single',
    import_multi: 'Import multiple',
    open: 'Open as new document',
    buttons: [{
      title: 'Image library'
    }],
    imgLibs: [{
      name: 'Demo library (local)',
      url: '{path}imagelib/index{modularVersion}.html',
      description: 'Demonstration library for SVG-edit on this server'
    }, {
      name: 'IAN Symbol Libraries',
      url: 'https://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php?svgedit=3',
      description: 'Free library of illustrations' // The site is no longer using our API, and they have added an
      //   `X-Frame-Options` header which prevents our usage cross-origin:
      // Getting messages like this in console:
      //   Refused to display 'https://openclipart.org/detail/307176/sign-bike' in a frame
      //   because it set 'X-Frame-Options' to 'sameorigin'.
      // url: 'https://openclipart.org/svgedit',
      // However, they do have a custom API which we are using here:

      /*
      {
        name: 'Openclipart',
        url: '{path}imagelib/openclipart{modularVersion}.html',
        description: 'Share and Use Images. Over 100,000 Public Domain SVG Images and Growing.'
      }
      */

    }]
  };

  return en;

}());
