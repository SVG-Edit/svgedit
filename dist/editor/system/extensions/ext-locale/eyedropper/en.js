System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var en = exports('default', {
        name: 'eyedropper',
        buttons: [
          {
            title: 'Eye Dropper Tool',
            key: 'I'
          }
        ]
      });

    }
  };
});
