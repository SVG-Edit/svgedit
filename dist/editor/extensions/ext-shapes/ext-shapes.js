/**
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
var e={name:"shapes",init:function init(e){e.$;var t,a,n,s=this.canvas,o=s.getRootElem(),r={},i="shapelib",l={};return{events:{id:"tool_shapelib",click:function click(){s.setMode(i)}},callback:function callback(){},mouseDown:function mouseDown(e){if(s.getMode()===i){var o=document.getElementById("tool_shapelib").dataset.draw,c=a=e.start_x,m=n=e.start_y,u=s.getStyle();return l.x=e.event.clientX,l.y=e.event.clientY,(t=s.addSVGElementFromJson({element:"path",curStyles:!0,attr:{d:o,id:s.getNextId(),opacity:u.opacity/2,style:"pointer-events:none"}})).setAttribute("transform","translate("+c+","+m+") scale(0.005) translate("+-c+","+-m+")"),s.recalculateDimensions(t),s.getTransformList(t),r=t.getBBox(),{started:!0}}},mouseMove:function mouseMove(e){if(s.getMode()===i){var l=s.getZoom(),c=e.event,m=e.mouse_x/l,u=e.mouse_y/l,d=s.getTransformList(t),h=t.getBBox(),f=h.x,p=h.y,v=(Math.min(a,m),Math.min(n,u),Math.abs(m-a)),g=Math.abs(u-n),M=v/r.width||1,y=g/r.height||1,b=0;m<a&&(b=r.width);var x=0;u<n&&(x=r.height);var B=o.createSVGTransform(),S=o.createSVGTransform(),T=o.createSVGTransform();if(B.setTranslate(-(f+b),-(p+x)),!c.shiftKey){var _=Math.min(Math.abs(M),Math.abs(y));M=_*(M<0?-1:1),y=_*(y<0?-1:1)}S.setScale(M,y),T.setTranslate(f+b,p+x),d.appendItem(T),d.appendItem(S),d.appendItem(B),s.recalculateDimensions(t),r=t.getBBox()}},mouseUp:function mouseUp(e){if(s.getMode()===i)return{keep:e.event.clientX!==l.x&&e.event.clientY!==l.y,element:t,started:!1}}}}};export default e;
//# sourceMappingURL=ext-shapes.js.map
