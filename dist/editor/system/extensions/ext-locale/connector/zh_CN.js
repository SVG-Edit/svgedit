System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var zhCN = exports('default', {
        name: '连接器',
        langList: [
          {id: 'mode_connect', title: '连接两个对象'}
        ],
        buttons: [
          {
            title: '连接两个对象'
          }
        ]
      });

    }
  };
});
