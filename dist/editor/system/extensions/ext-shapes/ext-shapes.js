System.register([],(function(e){"use strict";return{execute:function(){
/**
       * @file ext-shapes.js
       *
       * @license MIT
       *
       * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
       *
       */
e("default",{name:"shapes",init:function init(e){e.$;var t,a,n,s=this.canvas,o=s.getRootElem(),i={},r="shapelib",c={};return{events:{id:"tool_shapelib",click:function click(){s.setMode(r)}},callback:function callback(){},mouseDown:function mouseDown(e){if(s.getMode()===r){var o=document.getElementById("tool_shapelib").dataset.draw,l=a=e.start_x,m=n=e.start_y,u=s.getStyle();return c.x=e.event.clientX,c.y=e.event.clientY,(t=s.addSVGElementFromJson({element:"path",curStyles:!0,attr:{d:o,id:s.getNextId(),opacity:u.opacity/2,style:"pointer-events:none"}})).setAttribute("transform","translate("+l+","+m+") scale(0.005) translate("+-l+","+-m+")"),s.recalculateDimensions(t),s.getTransformList(t),i=t.getBBox(),{started:!0}}},mouseMove:function mouseMove(e){if(s.getMode()===r){var c=s.getZoom(),l=e.event,m=e.mouse_x/c,u=e.mouse_y/c,d=s.getTransformList(t),f=t.getBBox(),h=f.x,p=f.y,g=(Math.min(a,m),Math.min(n,u),Math.abs(m-a)),v=Math.abs(u-n),y=g/i.width||1,M=v/i.height||1,b=0;m<a&&(b=i.width);var x=0;u<n&&(x=i.height);var S=o.createSVGTransform(),B=o.createSVGTransform(),T=o.createSVGTransform();if(S.setTranslate(-(h+b),-(p+x)),!l.shiftKey){var _=Math.min(Math.abs(y),Math.abs(M));y=_*(y<0?-1:1),M=_*(M<0?-1:1)}B.setScale(y,M),T.setTranslate(h+b,p+x),d.appendItem(T),d.appendItem(B),d.appendItem(S),s.recalculateDimensions(t),i=t.getBBox()}},mouseUp:function mouseUp(e){if(s.getMode()===r)return{keep:e.event.clientX!==c.x&&e.event.clientY!==c.y,element:t,started:!1}}}}})}}}));
