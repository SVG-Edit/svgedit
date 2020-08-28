System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var en = exports('default', {
        name: 'polygon',
        buttons: [
          {
            title: 'Polygon Tool'
          }
        ],
        contextTools: [
          {
            title: 'Number of Sides',
            label: 'sides'
          }
        ]
      });

    }
  };
});
