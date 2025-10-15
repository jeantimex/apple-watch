const swing = (t, b, c, d) => easeOutQuad(t, b, c, d)

function easeOutQuad(t, b, c, d) {
  const progress = t / d
  return -c * progress * (progress - 2) + b
}

function easeInOutCubic(t, b, c, d) {
  let progress = t / (d / 2)
  if (progress < 1) {
    return (c / 2) * progress * progress * progress + b
  }
  progress -= 2
  return (c / 2) * (progress * progress * progress + 2) + b
}

function easeInOutSine(t, b, c, d) {
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b
}

function easeOutSine(t, b, c, d) {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b
}

function easeInSine(t, b, c, d) {
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b
}

export const easing = {
  swing,
  easeInOutCubic,
  easeInOutSine,
  easeOutSine,
  easeInSine,
}

