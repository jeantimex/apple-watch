const DEFAULT_CONFIG = {
  inertiaSteps: 30,
  inertiaInterval: 15,
}

export const setupViewportInteractions = (
  element,
  { onStart, onMove, onEnd },
  config = DEFAULT_CONFIG,
) => {
  const settings = { ...DEFAULT_CONFIG, ...config }
  let lastX = 0
  let lastY = 0
  let moveX = 0
  let moveY = 0

  const activePointers = new Set()

  const handleMove = (clientX, clientY) => {
    moveX = clientX - lastX
    moveY = clientY - lastY
    lastX = clientX
    lastY = clientY
    onMove(moveX, moveY)
  }

  const clearState = () => {
    activePointers.clear()
    moveX = 0
    moveY = 0
  }

  const pointerDown = (event) => {
    event.preventDefault()
    if (typeof onStart === 'function') {
      onStart()
    }
    element.classList.add('is-dragging')
    element.setPointerCapture(event.pointerId)
    activePointers.add(event.pointerId)
    lastX = event.clientX
    lastY = event.clientY
    moveX = 0
    moveY = 0
  }

  const pointerMove = (event) => {
    if (!activePointers.has(event.pointerId)) {
      return
    }
    event.preventDefault()
    handleMove(event.clientX, event.clientY)
  }

  const pointerUp = (event) => {
    if (!activePointers.has(event.pointerId)) {
      return
    }

    element.releasePointerCapture(event.pointerId)
    activePointers.delete(event.pointerId)

    if (activePointers.size === 0) {
      element.classList.remove('is-dragging')
      onEnd(moveX, moveY, settings)
      clearState()
    }
  }

  element.addEventListener('pointerdown', pointerDown)
  element.addEventListener('pointermove', pointerMove)
  element.addEventListener('pointerup', pointerUp)
  element.addEventListener('pointercancel', pointerUp)
}
