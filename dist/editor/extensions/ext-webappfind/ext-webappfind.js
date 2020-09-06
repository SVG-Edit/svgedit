function asyncGeneratorStep(e,n,t,r,a,o,i){try{var c=e[o](i),s=c.value}catch(e){return void t(e)}c.done?n(s):Promise.resolve(s).then(r,a)}
/**
* Depends on Firefox add-on and executables from
* {@link https://github.com/brettz9/webappfind}.
* @author Brett Zamir
* @license MIT
* @todo See WebAppFind Readme for SVG-related todos
*/
var e={name:"webappfind",init:function init(e){var n=this;return function _asyncToGenerator(e){return function(){var n=this,t=arguments;return new Promise((function(r,a){var o=e.apply(n,t);function _next(e){asyncGeneratorStep(o,r,a,_next,_throw,"next",e)}function _throw(e){asyncGeneratorStep(o,r,a,_next,_throw,"throw",e)}_next(void 0)}))}}(regeneratorRuntime.mark((function _callee(){var t,r,a,o,i,c,s,p;return regeneratorRuntime.wrap((function _callee$(u){for(;;)switch(u.prev=u.next){case 0:return t=e.$,r=n,u.next=4,import("./locale/".concat(r.curPrefs.lang,".js"));case 4:return a=u.sent,o=a.default,"read",c=["read",i="save"],n.canvas.bind("message",(function(e,n){var a,o,i=n.data,p=n.origin;try{var u=i.webappfind;if(a=u.type,s=u.pathID,o=u.content,p!==location.origin||c.includes(a))return}catch(e){return}switch(a){case"view":r.loadFromString(o);break;case"save-end":t.alert("save complete for pathID ".concat(s,"!"));break;default:throw new Error("Unexpected WebAppFind event type")}})),p=[{id:"webappfind_save",icon:"webappfind.png",type:"app_menu",position:4,events:{click:function click(){s&&window.postMessage({webappfind:{type:i,pathID:s,content:r.canvas.getSvgString()}},"null"===window.location.origin?"*":window.location.origin)}}}],u.abrupt("return",{name:o.name,svgicons:"webappfind-icon.svg",buttons:o.buttons.map((function(e,n){return Object.assign(p[n],e)}))});case 10:case"end":return u.stop()}}),_callee)})))()}};export default e;
//# sourceMappingURL=ext-webappfind.js.map
