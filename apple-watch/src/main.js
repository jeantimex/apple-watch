import './style.css'
import GUI from 'lil-gui'
import { apps } from './data/apps.js'
import { getTransform } from './utils/transform.js'
import { setupViewportInteractions } from './utils/interactions.js'
import { easeOutCubic } from './utils/easing.js'

const BASE_DIMENSIONS = {
  watchW: 200,
  watchH: 372,
  screenW: 135,
  screenH: 170,
  screenX: 32,
  screenY: 102,
  appSize: 37,
  sphereR: 100,
  hexR: 32,
}
const SCALE = 1

const settings = {
  scale: SCALE,
}

const state = {
  scrollX: 0,
  scrollY: 0,
  moveX: 0,
  moveY: 0,
  maxIndex: null,
  maxScale: 0,
  inertiaHandle: null,
  scale: settings.scale,
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

  return { containerEl: container, viewportEl, homeEl }
}

const scaleValue = (value, scale) => value * scale

const getConfig = () => {
  const scale = settings.scale

  return {
    scale,
    watchW: scaleValue(BASE_DIMENSIONS.watchW, scale),
    watchH: scaleValue(BASE_DIMENSIONS.watchH, scale),
    screenW: scaleValue(BASE_DIMENSIONS.screenW, scale),
    screenH: scaleValue(BASE_DIMENSIONS.screenH, scale),
    screenX: scaleValue(BASE_DIMENSIONS.screenX, scale),
    screenY: scaleValue(BASE_DIMENSIONS.screenY, scale),
    appSize: scaleValue(BASE_DIMENSIONS.appSize, scale),
    sphereR: scaleValue(BASE_DIMENSIONS.sphereR, scale),
    hexR: scaleValue(BASE_DIMENSIONS.hexR, scale),
    edge: scaleValue(BASE_DIMENSIONS.appSize / 2, scale),
  }
}

const applyLayout = ({ containerEl, viewportEl, homeEl }, config) => {
  containerEl.style.setProperty(
    '--watch-image',
    `url("${import.meta.env.BASE_URL}assets/apple-watch-white.png")`,
  )
  containerEl.style.setProperty('--watch-width', `${config.watchW}px`)
  containerEl.style.setProperty('--watch-height', `${config.watchH}px`)
  containerEl.style.setProperty('--screen-width', `${config.screenW}px`)
  containerEl.style.setProperty('--screen-height', `${config.screenH}px`)
  containerEl.style.setProperty('--screen-left', `${config.screenX}px`)
  containerEl.style.setProperty('--screen-top', `${config.screenY}px`)
  containerEl.style.setProperty('--app-size', `${config.appSize}px`)

  viewportEl.style.width = `${config.screenW}px`
  viewportEl.style.height = `${config.screenH}px`
  homeEl.style.width = `${config.screenW}px`
  homeEl.style.height = `${config.screenH}px`
}

const createIcons = (homeEl) =>
  apps.map((app) => {
    const icon = document.createElement('div')
    icon.className = 'app-icon'
    icon.style.backgroundImage = `url(${import.meta.env.BASE_URL}assets/apps/${app}.svg)`
    icon.dataset.name = app
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
  const config = getConfig()
  let maxScale = 0
  let maxIndex = null

  apps.forEach((_, index) => {
    const transform = getTransform(index, {
      ...config,
      scrollX: state.scrollX,
      scrollY: state.scrollY,
    })

    if (!transform) {
      return
    }

    const x = transform.x + config.screenW / 2 - config.appSize / 2
    const y = transform.y + config.screenH / 2 - config.appSize / 2
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
  const config = getConfig()
  const maxIndex = state.maxIndex
  const maxTransform = maxIndex !== null ? appTransforms[maxIndex] : null

  let distX = 0
  let distY = 0

  if (maxTransform && maxTransform.scale < 0.6) {
    distX = config.screenW / 2 - config.appSize / 2 - maxTransform.x
    distY = config.screenH / 2 - config.appSize / 2 - maxTransform.y
    state.maxIndex = null
  } else if (Math.abs(state.moveX) > 1 || Math.abs(state.moveY) > 1) {
    distX = state.moveX * 3
    distY = state.moveY * 3
  }

  state.moveX = 0
  state.moveY = 0

  runInertia(distX, distY, icons, settings)
}

const setupGui = ({ layout, icons }) => {
  const gui = new GUI({ title: 'Apple Watch' })

  gui
    .add(settings, 'scale', 0.5, 2, 0.01)
    .name('Scale')
    .onChange((scale) => {
      stopInertia()

      const ratio = scale / state.scale
      state.scrollX *= ratio
      state.scrollY *= ratio
      state.scale = scale

      applyLayout(layout, getConfig())
      updateTransforms(icons)
    })
}

const init = () => {
  const { containerEl, viewportEl, homeEl } = renderRoot()
  const layout = { containerEl, viewportEl, homeEl }
  const icons = createIcons(homeEl)

  applyLayout(layout, getConfig())
  updateTransforms(icons)
  setupGui({ layout, icons })

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
