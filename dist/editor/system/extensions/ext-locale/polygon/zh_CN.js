System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var zhCN = exports('default', {
        name: '多边形',
        buttons: [
          {
            title: '多边形工具'
          }
        ],
        contextTools: [
          {
            title: '边数',
            label: '边数'
          }
        ]
      });

    }
  };
});
