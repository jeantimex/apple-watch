import { getHexCoordinates } from './hex.js'
import { easing } from './easing.js'

const abs = Math.abs
const SQRT3_OVER_2 = Math.sqrt(3) / 2
const EDGE = 17

const coordinates = getHexCoordinates()

const polarFromCartesian = (x, y) => {
  const radius = Math.sqrt(x * x + y * y)
  const angle = Math.atan2(y, x)
  return { radius, angle }
}

const cartesianFromPolar = (radius, angle) => ({
  x: radius * Math.cos(angle),
  y: radius * Math.sin(angle),
})

const sphereProject = (radius, angle, sphereR) => {
  const theta = radius / sphereR
  let projectedRadius = radius
  let depth = easing.easeInOutCubic(1, 1, -0.5, 1)

  if (theta < Math.PI / 2) {
    const factor = theta / (Math.PI / 2)
    projectedRadius = radius * easing.swing(factor, 1.5, -0.5, 1)
    depth = easing.easeInOutCubic(factor, 1, -0.5, 1)
  }

  return { radius: projectedRadius, depth, angle }
}

const adjustPosition = (value, screenLimit) => {
  if (value < -screenLimit + 2 * EDGE) {
    return value + easing.easeInSine(screenLimit - abs(value) - 2 * EDGE, 0, 6, 2 * EDGE)
  }
  if (value > screenLimit - 2 * EDGE) {
    return value + easing.easeInSine(screenLimit - abs(value) - 2 * EDGE, 0, -6, 2 * EDGE)
  }
  return value
}

const calculateScale = (x, y, depth, screenW, screenH) => {
  if (abs(x) > screenW / 2 - EDGE || abs(y) > screenH / 2 - EDGE) {
    return depth * 0.4
  }

  if (abs(x) > screenW / 2 - 2 * EDGE && abs(y) > screenH / 2 - 2 * EDGE) {
    const scaleX = easing.easeInOutSine(screenW / 2 - abs(x) - EDGE, 0.4, 0.6, EDGE)
    const scaleY = easing.easeInOutSine(screenH / 2 - abs(y) - EDGE, 0.3, 0.7, EDGE)
    return depth * Math.min(scaleX, scaleY)
  }

  if (abs(x) > screenW / 2 - 2 * EDGE) {
    return depth * easing.easeOutSine(screenW / 2 - abs(x) - EDGE, 0.4, 0.6, EDGE)
  }

  if (abs(y) > screenH / 2 - 2 * EDGE) {
    return depth * easing.easeOutSine(screenH / 2 - abs(y) - EDGE, 0.4, 0.6, EDGE)
  }

  return depth
}

export const getTransform = (index, { screenW, screenH, sphereR, hexR, scrollX, scrollY }) => {
  const coord = coordinates[index]
  if (!coord) {
    return null
  }

  const hexCartesian = {
    x: (coord.x / 2 + coord.y) * hexR + scrollX,
    y: SQRT3_OVER_2 * coord.x * hexR + scrollY,
  }

  const polar = polarFromCartesian(hexCartesian.x, hexCartesian.y)
  const projected = sphereProject(polar.radius, polar.angle, sphereR)
  let { x, y } = cartesianFromPolar(projected.radius, projected.angle)

  x = Math.round(x * 10) / 10
  y = (Math.round(y * 10) / 10) * 1.14

  const depth = projected.depth
  const scale = calculateScale(x, y, depth, screenW, screenH)

  x = adjustPosition(x, screenW / 2)
  y = adjustPosition(y, screenH / 2)

  return { x, y, scale }
}
