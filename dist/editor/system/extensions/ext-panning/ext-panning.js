System.register([],(function(n,e){"use strict";return{execute:function(){function asyncGeneratorStep(n,e,t,r,o,a,i){try{var c=n[a](i),u=c.value}catch(n){return void t(n)}c.done?e(u):Promise.resolve(u).then(r,o)}
/**
       * @file ext-panning.js
       *
       * @license MIT
       *
       * @copyright 2013 Luis Aguirre
       *
       */
n("default",{name:"panning",init:function init(n){var t=this;return function _asyncToGenerator(n){return function(){var e=this,t=arguments;return new Promise((function(r,o){var a=n.apply(e,t);function _next(n){asyncGeneratorStep(a,r,o,_next,_throw,"next",n)}function _throw(n){asyncGeneratorStep(a,r,o,_next,_throw,"throw",n)}_next(void 0)}))}}(regeneratorRuntime.mark((function _callee(){var r,o,a,i,c;return regeneratorRuntime.wrap((function _callee$(u){for(;;)switch(u.prev=u.next){case 0:return n.importLocale,r=t,u.next=4,e.import("./locale/".concat(r.curPrefs.lang,".js"));case 4:return o=u.sent,a=o.default,i=r.canvas,c=[{id:"ext-panning",icon:"panning.png",type:"mode",events:{click:function click(){i.setMode("ext-panning")}}}],u.abrupt("return",{name:a.name,svgicons:"ext-panning.xml",buttons:a.buttons.map((function(n,e){return Object.assign(c[e],n)})),mouseDown:function mouseDown(){if("ext-panning"===i.getMode())return r.setPanning(!0),{started:!0}},mouseUp:function mouseUp(){if("ext-panning"===i.getMode())return r.setPanning(!1),{keep:!1,element:null}}});case 9:case"end":return u.stop()}}),_callee)})))()}})}}}));
