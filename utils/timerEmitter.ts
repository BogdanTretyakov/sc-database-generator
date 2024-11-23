const callbacks = Array<() => void>()

onNuxtReady(() => {
  setInterval(() => {
    callbacks.forEach(fn => fn())
  }, 1500)
})


export const timerEmitter = (cb: () => void) => {
  callbacks.push(cb)
  return () => {
    const idx = callbacks.indexOf(cb)
    if (idx >= 0) {
      callbacks.splice(idx, 0)
    }
  }
}
