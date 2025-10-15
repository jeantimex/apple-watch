const MAX_HEX_LAYER = 5

const cache = []

const generateCoordinates = (layers) => {
  for (let radius = 0; radius < layers; radius += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      for (let y = -radius; y <= radius; y += 1) {
        for (let z = -radius; z <= radius; z += 1) {
          if (Math.abs(x) + Math.abs(y) + Math.abs(z) === radius * 2 && x + y + z === 0) {
            cache.push({ x, y, z })
          }
        }
      }
    }
  }
}

export const getHexCoordinates = () => {
  if (cache.length === 0) {
    generateCoordinates(MAX_HEX_LAYER)
  }

  return cache
}
