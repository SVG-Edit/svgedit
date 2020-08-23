System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      var zhCN = exports('default', {
        name: '箭头',
        langList: [
          {id: 'arrow_none', textContent: '无箭头'}
        ],
        contextTools: [
          {
            title: '选择箭头类型',
            options: {
              none: '无箭头',
              end: '----&gt;',
              start: '&lt;----',
              both: '&lt;---&gt;',
              mid: '--&gt;--',
              mid_bk: '--&lt;--'
            }
          }
        ]
      });

    }
  };
});
