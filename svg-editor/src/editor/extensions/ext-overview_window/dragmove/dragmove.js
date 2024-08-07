// https://github.com/knadh/dragmove.js
// Kailash Nadh (c) 2020.
// MIT License.
// can't use npm version as the dragmove is different.

let _loaded = false
const _callbacks = []
const _isTouch = window.ontouchstart !== undefined

export const dragmove = function (target, handler, parent, onStart, onEnd, onDrag) {
  // Register a global event to capture mouse moves (once).
  if (!_loaded) {
    document.addEventListener(_isTouch ? 'touchmove' : 'mousemove', function (e) {
      let c = e
      if (e.touches) {
        c = e.touches[0]
      }

      // On mouse move, dispatch the coords to all registered callbacks.
      for (let i = 0; i < _callbacks.length; i++) {
        _callbacks[i](c.clientX, c.clientY)
      }
    })
  }

  _loaded = true
  let isMoving = false; let hasStarted = false
  let startX = 0; let startY = 0; let lastX = 0; let lastY = 0

  // On the first click and hold, record the offset of the pointer in relation
  // to the point of click inside the element.
  handler.addEventListener(_isTouch ? 'touchstart' : 'mousedown', function (e) {
    e.stopPropagation()
    e.preventDefault()
    if (target.dataset.dragEnabled === 'false') {
      return
    }

    let c = e
    if (e.touches) {
      c = e.touches[0]
    }

    isMoving = true
    startX = target.offsetLeft - c.clientX
    startY = target.offsetTop - c.clientY
  })

  // On leaving click, stop moving.
  document.addEventListener(_isTouch ? 'touchend' : 'mouseup', function () {
    if (onEnd && hasStarted) {
      onEnd(target, parent, parseInt(target.style.left), parseInt(target.style.top))
    }

    isMoving = false
    hasStarted = false
  })

  // On leaving click, stop moving.
  document.addEventListener(_isTouch ? 'touchmove' : 'mousemove', function () {
    if (onDrag && hasStarted) {
      onDrag(target, parseInt(target.style.left), parseInt(target.style.top))
    }
  })

  // Register mouse-move callback to move the element.
  _callbacks.push(function move (x, y) {
    if (!isMoving) {
      return
    }

    if (!hasStarted) {
      hasStarted = true
      if (onStart) {
        onStart(target, lastX, lastY)
      }
    }

    lastX = x + startX
    lastY = y + startY

    // If boundary checking is on, don't let the element cross the viewport.
    if (target.dataset.dragBoundary === 'true') {
      if (lastX < 1 || lastX >= window.innerWidth - target.offsetWidth) {
        return
      }
      if (lastY < 1 || lastY >= window.innerHeight - target.offsetHeight) {
        return
      }
    }

    target.style.left = lastX + 'px'
    target.style.top = lastY + 'px'
  })
}

export { dragmove as default }
