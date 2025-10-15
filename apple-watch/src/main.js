import './style.css'
import { apps } from './data/apps.js'
import { getHexCoordinates } from './utils/hex.js'

const screenWidth = 135
const screenHeight = 170
const appSize = 37
const hexRadius = 32

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

const home = container.querySelector('#home-screen')
const coordinates = getHexCoordinates()

apps.forEach((appData, index) => {
  const coord = coordinates[index]
  if (!coord) {
    return
  }

  const x = (coord.x / 2 + coord.y) * hexRadius + screenWidth / 2 - appSize / 2
  const y = (Math.sqrt(3) / 2) * coord.x * hexRadius + screenHeight / 2 - appSize / 2

  const icon = document.createElement('div')
  icon.className = 'app-icon'
  icon.style.backgroundImage = `url(/assets/apps/${appData.id}.png)`
  icon.style.transform = `translate(${x}px, ${y}px)`
  icon.dataset.name = appData.name
  home.appendChild(icon)
})
