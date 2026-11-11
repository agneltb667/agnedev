'use client'

import { useEffect, useRef, useState } from 'react'
import { refs } from '@/lib/store'
import { PHONE, PLUS_CODE } from '@/lib/data'

// Sur l'accueil, « Accueil » et « Réserver » font défiler la page (onNav) ;
// ailleurs ce sont des liens classiques, « Réserver » descend au formulaire de la page.
const LINKS = [
  { n: '01', label: 'Accueil', href: '/', page: 'home', section: 'surface' },
  { n: '02', label: 'Cours de natation', href: '/cours', page: 'cours' },
  { n: '03', label: 'Terrains & loisirs', href: '/terrains', page: 'terrains' },
  { n: '04', label: 'Réserver', section: 'contact' },
]

export default function Header({ onNav, label = '01 — Surface', current = 'home' }) {
  const [open, setOpen] = useState(false)
  const stopped = useRef(false)

  useEffect(() => {
    if (open) {
      refs.lenis?.stop()
      stopped.current = true
    } else if (stopped.current) {
      refs.lenis?.start()
      stopped.current = false
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const go = (link) => {
    setOpen(false)
    if (link.section && onNav) {
      // laisse Lenis redémarrer avant de lancer le défilement
      requestAnimationFrame(() => onNav(link.section))
    } else if (link.section === 'contact') {
      requestAnimationFrame(() => refs.lenis?.scrollTo('#reserver', { duration: 2 }))
    } else if (link.page !== current) {
      window.location.href = link.href
    } else {
      requestAnimationFrame(() => refs.lenis?.scrollTo(0, { duration: 1.6 }))
    }
  }

  return (
    <>
      <header
        data-header
        className="fixed inset-x-0 top-10 z-40 flex items-center justify-between bg-gradient-to-b from-abyss/85 via-abyss/40 to-transparent px-6 py-5 md:px-14 md:py-7"
      >
        <button onClick={() => go(LINKS[0])} className="flex items-baseline gap-3 text-left" aria-label="Accueil">
          <span className="font-serif text-xl font-medium uppercase tracking-[0.22em] md:text-2xl">Olympique</span>
          <span className="font-mono text-[10px] tracking-[0.35em] text-tide">DKR</span>
        </button>

        <span id="section-label" className="hidden font-mono text-[10px] uppercase tracking-[0.35em] text-foam/60 md:block">
          {label}
        </span>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => go(LINKS[3])}
            className="hidden rounded-full border border-foam/30 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-tide hover:bg-tide hover:text-abyss sm:block"
          >
            Réserver
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <span className={`absolute h-px w-6 bg-foam transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
            <span className={`absolute h-px w-6 bg-foam transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
          </button>
        </div>
      </header>

      <nav
        id="menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-30 flex flex-col justify-between bg-abyss/95 px-6 pb-10 pt-28 backdrop-blur-xl transition-[opacity,visibility] duration-500 md:px-14 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <ul className="space-y-2 md:space-y-4">
          {LINKS.map((link, i) => (
            <li
              key={link.n}
              className={`transition-[transform,opacity] duration-700 ease-out ${open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : '0ms' }}
            >
              <button
                onClick={() => go(link)}
                aria-current={link.page === current ? 'page' : undefined}
                className="group flex items-baseline gap-5 text-left"
              >
                <span className="font-mono text-xs tracking-[0.3em] text-tide">{link.n}</span>
                <span
                  className={`font-serif text-5xl font-light transition-[font-style,color] group-hover:italic group-hover:text-tide md:text-8xl ${
                    link.page === current ? 'italic text-tide' : ''
                  }`}
                >
                  {link.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/50">
          <a href={PHONE.href} className="hover:text-tide">
            Tél. {PHONE.display}
          </a>
          <span>Piscine Olympique Nationale · {PLUS_CODE} · Dakar</span>
        </div>
      </nav>
    </>
  )
}
