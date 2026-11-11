'use client'

import { useEffect, useState } from 'react'
import { loading, setReady, startIntro } from '@/lib/store'

// Overlay de chargement : le pourcentage avance avec le temps, plafonne à 88 %
// tant que la scène 3D n'a pas rendu ses premières images, puis termine à 100 %.
export default function Loader() {
  const [pct, setPct] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let raf
    let v = 0
    const start = performance.now()
    // filet de sécurité si WebGL est indisponible
    const fallback = setTimeout(setReady, 9000)

    const step = () => {
      const target = loading.ready ? 100 : Math.min(88, (performance.now() - start) / 16)
      v += (target - v) * (loading.ready ? 0.12 : 0.06)
      if (loading.ready && v > 99.4) v = 100
      setPct(v)
      if (v < 100) {
        raf = requestAnimationFrame(step)
      } else {
        setHidden(true)
        startIntro()
        setTimeout(() => setGone(true), 1200)
      }
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fallback)
    }
  }, [])

  if (gone) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-abyss px-6 py-8 transition-[opacity,clip-path] duration-[1100ms] ease-[cubic-bezier(.7,0,.2,1)] md:px-14 md:py-10 ${
        hidden ? 'pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]' : 'opacity-100 [clip-path:inset(0_0_0_0)]'
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-foam/50">
        <span>Piscine Olympique Nationale</span>
        <span>Dakar — Sénégal</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <div className="font-serif text-[28vw] font-light leading-[0.8] tracking-tight text-foam md:text-[16vw]">
          {String(Math.floor(pct)).padStart(3, '0')}
          <span className="ml-2 align-top font-mono text-[3vw] text-tide md:text-[1.4vw]">%</span>
        </div>
        <p className="mb-4 hidden max-w-[16rem] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-foam/40 md:block">
          Mise en eau du bassin
          <br />
          Rendu de la scène 3D
        </p>
      </div>

      <div className="relative h-px w-full bg-foam/10">
        <div className="absolute inset-y-0 left-0 bg-tide shadow-[0_0_14px_#7fd6e8]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
