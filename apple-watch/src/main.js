import './style.css'
import { apps } from './data/apps.js'
import { getTransform } from './utils/transform.js'
import { setupViewportInteractions } from './utils/interactions.js'
import { easeOutCubic } from './utils/easing.js'

const SCREEN_WIDTH = 135
const SCREEN_HEIGHT = 170
const APP_SIZE = 37

const BASE_CONFIG = {
  screenW: SCREEN_WIDTH,
  screenH: SCREEN_HEIGHT,
  sphereR: 100,
  hexR: 32,
}

const state = {
  scrollX: 0,
  scrollY: 0,
  moveX: 0,
  moveY: 0,
  maxIndex: null,
  maxScale: 0,
  inertiaHandle: null,
}

const appTransforms = apps.map(() => ({
  x: 0,
  y: 0,
  scale: 1,
}))

const renderRoot = () => {
  const root = document.querySelector('#app')
  const container = document.createElement('div')
  container.className = 'watch-container'
  container.innerHTML = `
    <div class="watch">
      <div class="viewport">
        <div class="home" id="home-screen"></div>
      </div>
    </div>
  `

  root.innerHTML = ''
  root.appendChild(container)

  const viewportEl = container.querySelector('.viewport')
  const homeEl = container.querySelector('#home-screen')

  return { viewportEl, homeEl }
}

const createIcons = (homeEl) =>
  apps.map((app) => {
    const icon = document.createElement('div')
    icon.className = 'app-icon'
    icon.style.backgroundImage = `url(/assets/apps/${app.id}.png)`
    icon.dataset.name = app.name
    homeEl.appendChild(icon)
    return icon
  })

const stopInertia = () => {
  if (state.inertiaHandle) {
    window.clearTimeout(state.inertiaHandle)
    state.inertiaHandle = null
  }
}

const updateTransforms = (icons) => {
  let maxScale = 0
  let maxIndex = null

  apps.forEach((_, index) => {
    const transform = getTransform(index, {
      ...BASE_CONFIG,
      scrollX: state.scrollX,
      scrollY: state.scrollY,
    })

    if (!transform) {
      return
    }

    const x = transform.x + SCREEN_WIDTH / 2 - APP_SIZE / 2
    const y = transform.y + SCREEN_HEIGHT / 2 - APP_SIZE / 2
    const scale = transform.scale

    const icon = icons[index]
    icon.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`

    appTransforms[index].x = x
    appTransforms[index].y = y
    appTransforms[index].scale = scale

    if (scale > maxScale) {
      maxScale = scale
      maxIndex = index
    }
  })

  state.maxIndex = maxIndex
  state.maxScale = maxScale
}

const applyMove = (dx, dy, icons) => {
  const velocity = state.maxIndex !== null ? appTransforms[state.maxIndex].scale : 1
  state.moveX = dx
  state.moveY = dy

  state.scrollX += dx * velocity
  state.scrollY += dy * velocity

  updateTransforms(icons)
}

const runInertia = (distX, distY, icons, settings) => {
  stopInertia()

  if (!distX && !distY) {
    return
  }

  let step = 1
  const { inertiaSteps, inertiaInterval } = settings

  const tick = () => {
    if (step > inertiaSteps) {
      stopInertia()
      return
    }

    const nextX = easeOutCubic(step, 0, distX, inertiaSteps)
    const prevX = easeOutCubic(step - 1, 0, distX, inertiaSteps)
    const nextY = easeOutCubic(step, 0, distY, inertiaSteps)
    const prevY = easeOutCubic(step - 1, 0, distY, inertiaSteps)

    state.scrollX += nextX - prevX
    state.scrollY += nextY - prevY

    updateTransforms(icons)
    step += 1

    state.inertiaHandle = window.setTimeout(tick, inertiaInterval)
  }

  tick()
}

const handleEnd = (icons, settings) => {
  const maxIndex = state.maxIndex
  const maxTransform = maxIndex !== null ? appTransforms[maxIndex] : null

  let distX = 0
  let distY = 0

  if (maxTransform && maxTransform.scale < 0.6) {
    distX = SCREEN_WIDTH / 2 - APP_SIZE / 2 - maxTransform.x
    distY = SCREEN_HEIGHT / 2 - APP_SIZE / 2 - maxTransform.y
    state.maxIndex = null
  } else if (Math.abs(state.moveX) > 1 || Math.abs(state.moveY) > 1) {
    distX = state.moveX * 3
    distY = state.moveY * 3
  }

  state.moveX = 0
  state.moveY = 0

  runInertia(distX, distY, icons, settings)
}

const init = () => {
  const { viewportEl, homeEl } = renderRoot()
  const icons = createIcons(homeEl)

  updateTransforms(icons)

  setupViewportInteractions(
    viewportEl,
    {
      onStart: stopInertia,
      onMove: (dx, dy) => {
        applyMove(dx, dy, icons)
      },
      onEnd: (_dx, _dy, settings) => {
        handleEnd(icons, settings)
      },
    },
    {
      inertiaSteps: 30,
      inertiaInterval: 15,
    },
  )
}

init()

