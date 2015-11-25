// http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/
function touchHandler(event) {'use strict';

	var simulatedEvent,
		touches = event.changedTouches,
		first = touches[0],
		type = "";
	switch (event.type) {
		case "touchstart": type = "mousedown"; break;
		case "touchmove":  type = "mousemove"; break;
		case "touchend":   type = "mouseup"; break;
		default: return;
	}

	// initMouseEvent(type, canBubble, cancelable, view, clickCount, 
	//	screenX, screenY, clientX, clientY, ctrlKey, 
	//	altKey, shiftKey, metaKey, button, relatedTarget);

	simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1,
								first.screenX, first.screenY,
								first.clientX, first.clientY, false,
								false, false, false, 0/*left*/, null);
	if (touches.length < 2) {
		first.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	}
}

document.addEventListener('touchstart', touchHandler, true);
document.addEventListener('touchmove', touchHandler, true);
document.addEventListener('touchend', touchHandler, true);
document.addEventListener('touchcancel', touchHandler, true);