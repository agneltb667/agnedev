'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { refs, onIntro } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger)

// Lenis pilote le scroll, GSAP en est l'horloge : une seule boucle d'animation.
export default function SmoothScroll({ children, lockUntilIntro = true }) {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.3,
    })
    refs.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Accueil : bloqué pendant le chargement, puis la barre de défilement
    // réapparaît et on recalcule les dimensions des pins
    let off = () => {}
    let toHash
    if (!lockUntilIntro && window.location.hash) {
      // lien du type /terrains#musculation : on descend à la section une fois la page posée
      const hash = window.location.hash
      toHash = setTimeout(() => lenis.scrollTo(hash, { offset: -80, duration: 1.6 }), 500)
    }
    if (lockUntilIntro) {
      lenis.stop()
      off = onIntro(() => {
        lenis.start()
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    }

    return () => {
      off()
      clearTimeout(toHash)
      gsap.ticker.remove(tick)
      lenis.destroy()
      refs.lenis = null
    }
  }, [lockUntilIntro])

  return children
}
