const callbacks = new Set<() => void>()

onNuxtReady(() => {
  setInterval(() => {
    callbacks.forEach(fn => fn())
  }, 1500)
})


export const timerEmitter = (cb: () => void) => {
  callbacks.add(cb)
  return () => {
    callbacks.delete(cb)
  }
}
