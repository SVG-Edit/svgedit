System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var en = exports('default', {
        name: 'Hello World',
        text: 'Hello World!\n\nYou clicked here: {x}, {y}',
        buttons: [
          {
            title: "Say 'Hello World'"
          }
        ]
      });

    }
  };
});
