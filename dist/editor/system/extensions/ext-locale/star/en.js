System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var en = exports('default', {
        name: 'star',
        buttons: [
          {
            title: 'Star Tool'
          }
        ],
        contextTools: [
          {
            title: 'Number of Sides',
            label: 'points'
          },
          {
            title: 'Pointiness',
            label: 'Pointiness'
          },
          {
            title: 'Twists the star',
            label: 'Radial Shift'
          }
        ]
      });

    }
  };
});
