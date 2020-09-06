function asyncGeneratorStep(n,e,t,r,a,o,i){try{var c=n[o](i),u=c.value}catch(n){return void t(n)}c.done?e(u):Promise.resolve(u).then(r,a)}
/**
 * @file ext-panning.js
 *
 * @license MIT
 *
 * @copyright 2013 Luis Aguirre
 *
 */
var n={name:"panning",init:function init(n){var e=this;return function _asyncToGenerator(n){return function(){var e=this,t=arguments;return new Promise((function(r,a){var o=n.apply(e,t);function _next(n){asyncGeneratorStep(o,r,a,_next,_throw,"next",n)}function _throw(n){asyncGeneratorStep(o,r,a,_next,_throw,"throw",n)}_next(void 0)}))}}(regeneratorRuntime.mark((function _callee(){var t,r,a,o,i;return regeneratorRuntime.wrap((function _callee$(c){for(;;)switch(c.prev=c.next){case 0:return n.importLocale,t=e,c.next=4,import("./locale/".concat(t.curPrefs.lang,".js"));case 4:return r=c.sent,a=r.default,o=t.canvas,i=[{id:"ext-panning",icon:"panning.png",type:"mode",events:{click:function click(){o.setMode("ext-panning")}}}],c.abrupt("return",{name:a.name,svgicons:"ext-panning.xml",buttons:a.buttons.map((function(n,e){return Object.assign(i[e],n)})),mouseDown:function mouseDown(){if("ext-panning"===o.getMode())return t.setPanning(!0),{started:!0}},mouseUp:function mouseUp(){if("ext-panning"===o.getMode())return t.setPanning(!1),{keep:!1,element:null}}});case 9:case"end":return c.stop()}}),_callee)})))()}};export default n;
//# sourceMappingURL=ext-panning.js.map
