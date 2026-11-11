// État partagé entre le DOM (GSAP / Lenis) et la scène 3D.
// Objets mutables : lus à chaque frame, sans re-render React.

export const scroll = { progress: 0, pin: 0, contact: 0 }
export const pointer = { x: 0, y: 0, moved: false }
export const refs = { lenis: null, master: null }

export const loading = { ready: false, intro: false }
const readyListeners = new Set()

export function setReady() {
  if (loading.ready) return
  loading.ready = true
  readyListeners.forEach((fn) => fn())
  readyListeners.clear()
}

export function onReady(fn) {
  if (loading.ready) fn()
  else readyListeners.add(fn)
  return () => readyListeners.delete(fn)
}

// Présélectionne une activité dans le formulaire de la page et y descend
export function bookActivity(id) {
  window.dispatchEvent(new CustomEvent('pod:book', { detail: id }))
  refs.lenis?.scrollTo('#reserver', { duration: 2 })
}

export function startIntro() {
  if (loading.intro) return
  loading.intro = true
  window.dispatchEvent(new Event('pod:intro'))
}

export function onIntro(fn) {
  if (loading.intro) {
    fn()
    return () => {}
  }
  window.addEventListener('pod:intro', fn, { once: true })
  return () => window.removeEventListener('pod:intro', fn)
}
