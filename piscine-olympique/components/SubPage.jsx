'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SmoothScroll from './SmoothScroll'
import Header from './Header'
import ContactPanel from './ContactPanel'
import { PHONE, PLUS_CODE, MAPS_URL } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const mono = 'font-mono text-[10px] uppercase tracking-[0.35em] text-tide md:text-xs'

// Cadre commun des pages secondaires : en-tête, révélations au scroll,
// bloc de réservation et pied de page.
export default function SubPage({ label, current, booking, children }) {
  const root = useRef(null)

  useGSAP(
    () => {
      gsap.from('[data-hero] [data-char]', { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.03, delay: 0.15 })
      gsap.from('[data-hero-fade]', { opacity: 0, y: 24, duration: 1.1, stagger: 0.12, delay: 0.6 })
      gsap.utils.toArray('[data-reveal]').forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
      )
      gsap.utils.toArray('[data-reveal-words]').forEach((el) =>
        gsap.from(el.querySelectorAll('[data-word]'), {
          yPercent: 110,
          opacity: 0,
          duration: 0.8,
          stagger: 0.025,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      )
      gsap.utils.toArray('[data-reveal-chars]').forEach((el) =>
        gsap.from(el.querySelectorAll('[data-char]'), {
          yPercent: 115,
          duration: 1,
          stagger: 0.02,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      )
    },
    { scope: root }
  )

  return (
    <SmoothScroll lockUntilIntro={false}>
      <div ref={root} className="relative z-10">
        <Header label={label} current={current} />
        <main>{children}</main>

        <section id="reserver" className="relative px-6 pb-10 pt-28 md:px-14 md:pt-36">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p data-reveal className={`${mono} mb-6`}>
                Réserver
              </p>
              <h2 data-reveal className="font-serif text-5xl font-light leading-[0.95] md:text-7xl">
                {booking.title}
              </h2>
              <p data-reveal className="mt-6 max-w-md text-lg font-light text-foam/80">
                {booking.text}
              </p>
              <dl data-reveal className="mt-10 max-w-md font-mono text-[11px] uppercase tracking-[0.2em]">
                {[
                  ['Téléphone', <a key="t" href={PHONE.href} className="text-foam hover:text-tide">{PHONE.display}</a>],
                  ['Adresse', 'Piscine Olympique Nationale, Dakar'],
                  ['Plus code', PLUS_CODE],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-3">
                    <dt className="text-foam/45">{k}</dt>
                    <dd className="text-right normal-case tracking-wider text-foam/90">{v}</dd>
                  </div>
                ))}
              </dl>
              <a
                data-reveal
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-tide hover:underline"
              >
                Itinéraire Google Maps ↗
              </a>
            </div>
            <div data-reveal className="lg:col-span-6 lg:col-start-7">
              <ContactPanel initialActivity={booking.activity} />
            </div>
          </div>

          <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-foam/10 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/45">
            <span>© {new Date().getFullYear()} Piscine Olympique Nationale de Dakar</span>
            <nav className="flex gap-6">
              <a href="/" className="hover:text-tide">Accueil</a>
              <a href="/cours" className="hover:text-tide">Cours</a>
              <a href="/terrains" className="hover:text-tide">Terrains & loisirs</a>
            </nav>
          </footer>
        </section>
      </div>
    </SmoothScroll>
  )
}
