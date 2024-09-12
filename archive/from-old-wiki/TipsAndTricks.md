Unexpected svgEditor.ready doesn't exist when load svg-editor from parent using iframe

Situation: You have a web page where you use an iframe to load svg-edit. Since the jQuery ready function does not wait for all JavaScript to load, you may get some unexpected behavior, such as svgEditor.ready not existing. You may thus need to catch this exception and wait a little longer to try again:

svg_frame is the id for the svg-editor iframe

``` $('#svg_frame').ready(function() {

var ifrm = $('#svg_frame')[0];

// waiting for real load
(function(){
            try {
                ifrm.contentWindow.svgEditor.ready(function() { editor_ready();});
            }
            catch (Ex){
                setTimeout(arguments.callee, 1000);
            }
        })();

}) ```
