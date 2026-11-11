'use client'

import { Suspense, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SmoothScroll from './SmoothScroll'
import Loader from './Loader'
import Header from './Header'
import BlueprintCard from './BlueprintCard'
import ContactPanel from './ContactPanel'
import { SplitChars, SplitWords } from './Split'
import { scroll, pointer, refs, onIntro } from '@/lib/store'
import { CARDS, PHONE, PLUS_CODE, MAPS_URL, HOURS } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// La scène WebGL est chargée côté client uniquement, dans son propre bundle
const Scene = dynamic(() => import('./three/Scene'), { ssr: false })

const SECTIONS = [
  [0.16, '01 — Surface'],
  [0.47, '02 — Sous la surface'],
  [0.8, '03 — Le complexe'],
  [1.01, '04 — Réserver & contact'],
]

// Progression globale : 80 % pour la scène épinglée, 20 % pour l'arrivée du contact
function syncProgress() {
  const p = 0.8 * scroll.pin + 0.2 * scroll.contact
  scroll.progress = p
  const label = SECTIONS.find(([max]) => p < max)[1]
  const el = document.getElementById('section-label')
  if (el && el.textContent !== label) el.textContent = label
  const bar = document.getElementById('hud-progress')
  if (bar) bar.style.transform = `scaleY(${p})`
  const hud = document.getElementById('hud')
  if (hud) hud.style.opacity = p > 0.9 ? '0' : '1'
}

const mono = 'font-mono text-[10px] uppercase tracking-[0.35em] text-tide md:text-xs'
const legible = '[text-shadow:0_2px_30px_rgba(2,14,22,.55)]'

export default function Experience() {
  const root = useRef(null)

  useEffect(() => {
    const move = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      pointer.moved = true
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // Révélation du titre à la fin du chargement
  useGSAP(
    () => {
      gsap.set('[data-header], [data-hero-fade]', { opacity: 0 })
      return onIntro(() => {
        gsap.from('[data-layer=hero] [data-char]', { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.035, delay: 0.25 })
        gsap.to('[data-hero-fade]', { opacity: 1, duration: 1.2, stagger: 0.12, delay: 0.9 })
        gsap.to('[data-header]', { opacity: 1, duration: 1.2, delay: 1.1 })
      })
    },
    { scope: root }
  )

  // Chronologie maîtresse liée au scroll
  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#stage',
          start: 'top top',
          end: '+=420%',
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            scroll.pin = s.progress
            syncProgress()
          },
        },
      })
      refs.master = tl.scrollTrigger

      // 1 → 2 : le titre s'efface vers le haut avec un flou de mouvement
      tl.to('[data-hero-inner]', { yPercent: -30, opacity: 0, filter: 'blur(16px)', duration: 1, ease: 'power2.in' }, 1.8)

      // 2 : la descente sous l'eau
      tl.set('[data-layer=descent]', { autoAlpha: 1 }, 2.9)
      tl.from('[data-layer=descent] [data-char]', { yPercent: 115, duration: 0.6, stagger: { amount: 0.7 }, ease: 'power3.out' }, 3)
      tl.from('[data-layer=descent] [data-word]', { yPercent: 110, opacity: 0, duration: 0.5, stagger: { amount: 1.4 }, ease: 'power3.out' }, 3.3)
      tl.from('[data-stat]', { opacity: 0, y: 30, stagger: 0.15, duration: 0.4 }, 4.7)
      tl.to('[data-descent-inner]', { yPercent: -18, filter: 'blur(14px)', duration: 0.8, ease: 'power2.in' }, 6)
      tl.to('[data-layer=descent]', { autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, 6)

      // 3 : le plan du complexe, cartes en parallaxe
      tl.set('[data-layer=blueprint]', { autoAlpha: 1 }, 6.6)
      tl.from('[data-layer=blueprint] [data-char]', { yPercent: 115, duration: 0.5, stagger: { amount: 0.5 }, ease: 'power3.out' }, 6.7)
      tl.from('[data-bp-meta]', { opacity: 0, duration: 0.5 }, 6.9)
      const cards = gsap.utils.toArray('[data-card]')
      cards.forEach((card, i) => {
        tl.from(
          card,
          {
            y: () => window.innerHeight * (0.8 + (i % 2) * 0.35),
            rotateX: 38,
            rotateY: i % 2 ? -14 : 14,
            opacity: 0,
            duration: 1.1 + i * 0.22,
            ease: 'power3.out',
          },
          6.9 + i * 0.18
        )
      })
      cards.forEach((card, i) => {
        tl.to(card, { y: () => -window.innerHeight * (0.45 + i * 0.12), opacity: 0, duration: 0.8, ease: 'power2.in' }, 9.3 + i * 0.07)
      })
      tl.to('[data-bp-head]', { y: -60, opacity: 0, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, 9.3)
      tl.to({}, { duration: 0.4 }, 10.2)

      // 4 : remontée vers le coucher de soleil et apparition du formulaire
      ScrollTrigger.create({
        trigger: '#contact',
        start: 'top bottom',
        end: 'top top',
        onUpdate: (s) => {
          scroll.contact = s.progress
          syncProgress()
        },
      })
      gsap.from('[data-contact-reveal]', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#contact', start: 'top 55%' },
      })
    },
    { scope: root }
  )

  const nav = (id) => {
    const lenis = refs.lenis
    if (!lenis) return
    if (id === 'contact') return lenis.scrollTo('#contact', { duration: 2.6 })
    const st = refs.master
    const frac = { surface: 0, descent: 0.44, complexe: 0.82 }[id] ?? 0
    lenis.scrollTo(st ? st.start + (st.end - st.start) * frac : 0, { duration: 2.6 })
  }

  return (
    <SmoothScroll>
      <Loader />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>

      {/* vignettage pour la lisibilité du texte sur la 3D */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,16,26,.6)_100%)]" />

      <div ref={root} className="relative z-10">
        <Header onNav={nav} />

        <div id="hud" className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-700">
          <span id="hud-alt" className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/60 md:bottom-8 md:left-14">
            Alt +55.0 m
          </span>
          <span className="absolute bottom-6 right-6 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-foam/40 md:bottom-8 md:right-14 md:block">
            {PLUS_CODE} · Dakar
          </span>
          <span className="absolute right-6 top-1/2 h-36 w-px -translate-y-1/2 bg-foam/15 md:right-14">
            <span id="hud-progress" className="block h-full w-full origin-top scale-y-0 bg-tide" />
          </span>
        </div>

        <main>
          <section id="stage" className="relative h-screen overflow-hidden">
            {/* 01 — HERO */}
            <div data-layer="hero" className="pointer-events-none absolute inset-0">
              <div
                data-hero-inner
                className={`flex h-full flex-col justify-end bg-gradient-to-t from-abyss/80 via-abyss/10 to-transparent px-6 pb-20 md:px-14 md:pb-24 ${legible}`}
              >
                <p data-hero-fade className={`${mono} mb-6`}>
                  Piscine Olympique Nationale — Dakar, Sénégal
                </p>
                <h1 className="font-serif text-[16vw] font-light leading-[0.86] tracking-[-0.02em] md:text-[9.2vw]">
                  <SplitChars text="Le bassin" />
                  <br />
                  <SplitChars text="olympique" className="italic text-tide" />
                  <br />
                  <SplitChars text="de Dakar." />
                </h1>
                <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <p data-hero-fade className="max-w-md text-base font-light text-foam/80 md:text-lg">
                    Un bassin de 50 mètres, des cours de natation, une salle de fitness et des terrains de sport, au cœur de Dakar.
                  </p>
                  <div data-hero-fade className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/60 md:mr-10">
                    <span className="relative h-10 w-px overflow-hidden bg-foam/20">
                      <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-tide" />
                    </span>
                    Défiler pour plonger
                  </div>
                </div>
              </div>
            </div>

            {/* 02 — SOUS LA SURFACE */}
            <div
              data-layer="descent"
              className="pointer-events-none invisible absolute inset-0 flex items-center bg-gradient-to-r from-abyss/55 via-abyss/15 to-abyss/65"
            >
              <div data-descent-inner className={`grid w-full gap-10 px-6 md:grid-cols-12 md:px-14 ${legible}`}>
                <div className="md:col-span-5">
                  <p className={`${mono} mb-6`}>02 — Sous la surface</p>
                  <h2 className="font-serif text-5xl font-light leading-[0.95] md:text-7xl lg:text-8xl">
                    <SplitChars text="Nager," />
                    <br />
                    <SplitChars text="apprendre," className="italic text-tide" />
                    <br />
                    <SplitChars text="se dépasser." />
                  </h2>
                </div>
                <div className="space-y-6 text-lg font-light leading-relaxed text-foam/90 md:col-span-5 md:col-start-8 md:text-xl">
                  <SplitWords text="Un bassin de 50 mètres aux normes olympiques, ouvert à la baignade libre comme à l’entraînement des clubs et des athlètes." />
                  <SplitWords text="Des cours pour enfants et adultes, des tribunes pour les compétitions nationales et internationales, et un accès pensé pour les personnes à mobilité réduite." />
                  <dl className="grid grid-cols-3 gap-4 border-t border-foam/20 pt-6">
                    {[
                      ['50 m', 'Bassin'],
                      ['8', 'Activités'],
                      ['PMR', 'Accessible'],
                    ].map(([v, k]) => (
                      <div key={k} data-stat>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-foam/55">{k}</dt>
                        <dd className="font-serif text-3xl md:text-4xl">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            {/* 03 — LE COMPLEXE (plan) */}
            <div data-layer="blueprint" className="pointer-events-none invisible absolute inset-0 flex flex-col justify-end px-6 pb-16 pt-24 md:px-14 md:pb-20">
              <div data-bp-head className="mb-6 flex items-end justify-between gap-6 md:mb-10">
                <div>
                  <p className={`${mono} mb-4`}>03 — Le complexe</p>
                  <h2 className="font-serif text-4xl font-light leading-none md:text-5xl xl:text-7xl">
                    <SplitChars text="Bien plus" /> <SplitChars text="qu’une piscine." className="italic text-tide" />
                  </h2>
                </div>
                <p data-bp-meta className="hidden text-right font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-foam/50 md:block">
                  Plan d’ensemble
                  <br />
                  Piscine Olympique Nationale · {PLUS_CODE}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
                {CARDS.map((c) => (
                  <BlueprintCard
                    key={c.n}
                    card={c}
                    onBook={(id) => {
                      window.dispatchEvent(new CustomEvent('pod:book', { detail: id }))
                      nav('contact')
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 04 — CONTACT & RÉSERVATION */}
          <section id="contact" className="relative min-h-screen bg-gradient-to-r from-abyss/85 via-abyss/45 to-abyss/10 px-6 pb-10 pt-28 md:px-14 md:pt-36">
            <div className="grid gap-14 lg:grid-cols-12">
              <div className={`lg:col-span-5 ${legible}`}>
                <p data-contact-reveal className={`${mono} mb-6`}>
                  04 — Réserver & contact
                </p>
                <h2 data-contact-reveal className="font-serif text-5xl font-light leading-[0.95] md:text-7xl">
                  Réservez votre <em className="text-tide">prochaine</em> longueur.
                </h2>
                <p data-contact-reveal className="mt-6 max-w-md text-lg font-light text-foam/80">
                  Choisissez une activité et un créneau, ou écrivez-nous. L’accueil répond aussi par téléphone.
                </p>
                <dl data-contact-reveal className="mt-10 max-w-md font-mono text-[11px] uppercase tracking-[0.2em]">
                  {[
                    ['Téléphone', <a key="t" href={PHONE.href} className="text-foam hover:text-tide">{PHONE.display}</a>],
                    ['Adresse', 'Piscine Olympique Nationale, Dakar'],
                    ['Plus code', PLUS_CODE],
                    ['Bassins', HOURS.public],
                    ['Fermeture', 'Lundi'],
                    ['Entrée', '1 000 F CFA (2 000 le week-end)'],
                    ['Affluence', 'Pic entre 12 h et 18 h'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-3">
                      <dt className="text-foam/45">{k}</dt>
                      <dd className="text-right normal-case tracking-wider text-foam/90">{v}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  data-contact-reveal
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-tide hover:underline"
                >
                  Itinéraire Google Maps ↗
                </a>
              </div>
              <div data-contact-reveal className="lg:col-span-6 lg:col-start-7">
                <ContactPanel />
              </div>
            </div>

            <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-foam/10 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/45">
              <span>© {new Date().getFullYear()} Piscine Olympique Nationale de Dakar</span>
              <span>Bassins : {HOURS.public} · fermé le lundi</span>
            </footer>
          </section>
        </main>
      </div>
    </SmoothScroll>
  )
}
