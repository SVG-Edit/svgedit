System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var en = exports('default', {
        name: 'ClosePath',
        buttons: [
          {
            title: 'Open path'
          },
          {
            title: 'Close path'
          }
        ]
      });

    }
  };
});
