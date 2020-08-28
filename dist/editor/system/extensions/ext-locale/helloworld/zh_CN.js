System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var zhCN = exports('default', {
        name: 'Hello World',
        text: 'Hello World!\n\n 请点击: {x}, {y}',
        buttons: [
          {
            title: "输出 'Hello World'"
          }
        ]
      });

    }
  };
});
