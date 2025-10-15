import './style.css'
import { apps } from './data/apps.js'
import { getTransform } from './utils/transform.js'

const SCREEN_WIDTH = 135
const SCREEN_HEIGHT = 170
const APP_SIZE = 37

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
  return container.querySelector('#home-screen')
}

const renderApps = (homeEl, config) => {
  apps.forEach((appData, index) => {
    const transform = getTransform(index, config)
    if (!transform) {
      return
    }

    const x = transform.x + SCREEN_WIDTH / 2 - APP_SIZE / 2
    const y = transform.y + SCREEN_HEIGHT / 2 - APP_SIZE / 2
    const scale = transform.scale

    const icon = document.createElement('div')
    icon.className = 'app-icon'
    icon.style.backgroundImage = `url(/assets/apps/${appData.id}.png)`
    icon.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    icon.dataset.name = appData.name
    homeEl.appendChild(icon)
  })
}

const init = () => {
  const homeEl = renderRoot()
  const config = {
    screenW: SCREEN_WIDTH,
    screenH: SCREEN_HEIGHT,
    sphereR: 100,
    hexR: 32,
    scrollX: 0,
    scrollY: 0,
  }

  renderApps(homeEl, config)
}

init()

