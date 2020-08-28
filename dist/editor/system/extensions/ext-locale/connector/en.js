System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var en = exports('default', {
        name: 'Connector',
        langList: [
          {id: 'mode_connect', title: 'Connect two objects'}
        ],
        buttons: [
          {
            title: 'Connect two objects'
          }
        ]
      });

    }
  };
});
