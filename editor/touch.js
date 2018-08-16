// http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/
function touchHandler (ev) {
  const {changedTouches} = ev,
    first = changedTouches[0];

  let type = '';
  switch (ev.type) {
  case 'touchstart': type = 'mousedown'; break;
  case 'touchmove': type = 'mousemove'; break;
  case 'touchend': type = 'mouseup'; break;
  default: return;
  }

  const {screenX, screenY, clientX, clientY} = first;
  const simulatedEvent = new MouseEvent(type, {
    // Event interface
    bubbles: true,
    cancelable: true,
    // UIEvent interface
    view: window,
    detail: 1, // click count
    // MouseEvent interface (customized)
    screenX, screenY, clientX, clientY,
    // MouseEvent interface (defaults) - these could be removed
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0, // main button (usually left)
    relatedTarget: null
  });
  if (changedTouches.length < 2) {
    first.target.dispatchEvent(simulatedEvent);
    ev.preventDefault();
  }
}

document.addEventListener('touchstart', touchHandler, true);
document.addEventListener('touchmove', touchHandler, true);
document.addEventListener('touchend', touchHandler, true);
document.addEventListener('touchcancel', touchHandler, true);
