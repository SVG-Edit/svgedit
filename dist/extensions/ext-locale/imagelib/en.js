var svgEditorExtensionLocale_imagelib_en = (function () {
  'use strict';

  var en = {
    select_lib: 'Select an image library',
    show_list: 'Show library list',
    import_single: 'Import single',
    import_multi: 'Import multiple',
    open: 'Open as new document',
    imgLibs: [{
      name: 'Demo library (local)',
      url: function url(_ref) {
        var path = _ref.path,
            modularVersion = _ref.modularVersion;

        return path + 'imagelib/index' + (modularVersion ? '-es' : '') + '.html';
      },

      description: 'Demonstration library for SVG-edit on this server'
    }, {
      name: 'IAN Symbol Libraries',
      url: 'https://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php',
      description: 'Free library of illustrations'
    }, {
      name: 'Openclipart',
      url: 'https://openclipart.org/svgedit',
      description: 'Share and Use Images. Over 50,000 Public Domain SVG Images and Growing.'
    }]
  };

  return en;

}());
