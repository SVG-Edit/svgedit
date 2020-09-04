export default{name:"php_savefile",init:function init(e){var t=e.$,n=this,i=n.curConfig.extPath,a=n.canvas;var o=i+"savefile.php";n.setCustomHandlers({save:function save(e,n){var i='<?xml version="1.0" encoding="UTF-8"?>\n'+n,s=function getFileNameFromTitle(){return a.getDocumentTitle().trim()}();t.post(o,{output_svg:i,filename:s})}})}};
//# sourceMappingURL=ext-php_savefile.js.map
