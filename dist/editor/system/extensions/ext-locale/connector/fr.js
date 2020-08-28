System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var fr = exports('default', {
        name: 'Connector',
        langList: [
          {id: 'mode_connect', title: 'Connecter deux objets'}
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
