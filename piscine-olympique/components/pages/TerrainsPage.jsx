'use client'

import { useCallback, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import SubPage, { mono } from '../SubPage'
import { SplitChars, SplitWords } from '../Split'
import ActivityDrawer from '../ActivityDrawer'
import { bookActivity, refs } from '@/lib/store'
import { ACTIVITY_DETAILS } from '@/lib/activities'

// Tracés « plan d'architecte » : chaque forme a pathLength=1 pour être dessinée au scroll
const P = { pathLength: 1, className: 'draw' }

const drawings = {
  court: (
    <svg viewBox="0 0 400 220" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="10" y="10" width="380" height="200" {...P} />
      <line x1="200" y1="10" x2="200" y2="210" {...P} />
      <circle cx="200" cy="110" r="30" {...P} />
      <rect x="10" y="70" width="70" height="80" {...P} />
      <rect x="320" y="70" width="70" height="80" {...P} />
      <path d="M10 30 A 120 120 0 0 1 10 190" {...P} />
      <path d="M390 30 A 120 120 0 0 0 390 190" {...P} />
      <circle cx="80" cy="110" r="22" {...P} />
      <circle cx="320" cy="110" r="22" {...P} />
    </svg>
  ),
  football: (
    <svg viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="10" y="10" width="380" height="240" {...P} />
      <line x1="200" y1="10" x2="200" y2="250" {...P} />
      <circle cx="200" cy="130" r="36" {...P} />
      <rect x="10" y="70" width="60" height="120" {...P} />
      <rect x="330" y="70" width="60" height="120" {...P} />
      <rect x="10" y="100" width="22" height="60" {...P} />
      <rect x="368" y="100" width="22" height="60" {...P} />
      <path d="M70 105 A 30 30 0 0 1 70 155" {...P} />
      <path d="M330 105 A 30 30 0 0 0 330 155" {...P} />
    </svg>
  ),
  basket: (
    <svg viewBox="0 0 400 240" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="10" y="10" width="380" height="220" {...P} />
      <line x1="200" y1="10" x2="200" y2="230" {...P} />
      <circle cx="200" cy="120" r="28" {...P} />
      <rect x="10" y="85" width="80" height="70" {...P} />
      <rect x="310" y="85" width="80" height="70" {...P} />
      <circle cx="90" cy="120" r="22" {...P} />
      <circle cx="310" cy="120" r="22" {...P} />
      <path d="M10 30 L40 30 A 95 95 0 0 1 40 210 L10 210" {...P} />
      <path d="M390 30 L360 30 A 95 95 0 0 0 360 210 L390 210" {...P} />
      <line x1="26" y1="105" x2="26" y2="135" {...P} />
      <line x1="374" y1="105" x2="374" y2="135" {...P} />
      <circle cx="34" cy="120" r="6" {...P} />
      <circle cx="366" cy="120" r="6" {...P} />
    </svg>
  ),
  gym: (
    <svg viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth="1">
      <line x1="40" y1="200" x2="360" y2="200" {...P} />
      <rect x="120" y="150" width="160" height="16" {...P} />
      <line x1="140" y1="166" x2="140" y2="200" {...P} />
      <line x1="260" y1="166" x2="260" y2="200" {...P} />
      <line x1="90" y1="90" x2="310" y2="90" {...P} />
      <rect x="70" y="60" width="16" height="60" {...P} />
      <rect x="52" y="70" width="16" height="40" {...P} />
      <rect x="314" y="60" width="16" height="60" {...P} />
      <rect x="332" y="70" width="16" height="40" {...P} />
      <line x1="150" y1="90" x2="150" y2="150" {...P} />
      <line x1="250" y1="90" x2="250" y2="150" {...P} />
    </svg>
  ),
  // plan vu de dessus, d'après le plan Dakar 2026 : banks et transitions au fond,
  // ledge, escalier à rampes et rail au centre
  skate: (
    <svg viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M10 250 L10 40 L60 10 L390 10 L390 250 Z" {...P} />
      <path d="M60 10 L60 40 L390 40" {...P} />
      <path d="M10 40 L60 40" {...P} />
      <line x1="140" y1="10" x2="140" y2="40" {...P} />
      <line x1="230" y1="10" x2="230" y2="40" {...P} />
      <line x1="310" y1="10" x2="310" y2="40" {...P} />
      <path d="M30 70 L90 70 L90 90 L30 90" {...P} />
      <rect x="130" y="95" width="90" height="16" {...P} />
      <rect x="250" y="140" width="70" height="60" {...P} />
      <line x1="250" y1="155" x2="320" y2="155" {...P} />
      <line x1="250" y1="170" x2="320" y2="170" {...P} />
      <line x1="250" y1="185" x2="320" y2="185" {...P} />
      <line x1="244" y1="140" x2="244" y2="200" {...P} />
      <line x1="326" y1="140" x2="326" y2="200" {...P} />
      <path d="M60 200 L130 170 L130 230 Z" {...P} />
      <line x1="150" y1="200" x2="215" y2="200" {...P} />
      <path d="M345 80 A 30 30 0 0 1 375 110 L375 130 L345 130 Z" {...P} />
    </svg>
  ),
  jeux: (
    <svg viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth="1">
      <line x1="20" y1="230" x2="380" y2="230" {...P} />
      <path d="M60 230 L60 90 L130 90 L130 230" {...P} />
      <path d="M60 90 L95 50 L130 90" {...P} />
      <path d="M130 120 C 190 130, 200 200, 250 228" {...P} />
      <path d="M270 230 L300 60 L330 230" {...P} />
      <line x1="300" y1="60" x2="380" y2="60" {...P} />
      <path d="M380 60 L360 230" {...P} />
      <line x1="320" y1="60" x2="320" y2="170" {...P} />
      <line x1="350" y1="60" x2="350" y2="170" {...P} />
      <line x1="314" y1="170" x2="356" y2="170" {...P} />
    </svg>
  ),
}

const SPACES = [
  {
    id: 'football',
    n: '01',
    tag: 'Football',
    title: 'Terrain de football',
    text: 'Un terrain à dimension réduite, de type multisports, pour les entraînements et les animations locales. Juste à côté : le Stade Iba Mar Diop, rénové pour les JOJ.',
    specs: [['Format', 'Dimension réduite · multisports'], ['Accès', 'En journée, selon planning']],
    drawing: 'football',
    cta: 'Réserver un terrain',
  },
  {
    id: 'basket',
    n: '02',
    tag: 'Basket',
    title: 'Terrains de basket',
    text: 'Des terrains extérieurs entièrement refaits, choisis pour accueillir le basketball 3x3 des Jeux Olympiques de la Jeunesse Dakar 2026.',
    specs: [['Format phare', 'Basketball 3x3 · JOJ 2026'], ['Accès', 'Sur réservation · clubs']],
    drawing: 'basket',
    cta: 'Réserver le terrain',
  },
  {
    id: 'musculation',
    n: '03',
    tag: 'Musculation & fitness',
    title: 'Salle de musculation',
    text: 'Renforcement musculaire et cardio : le complément idéal de la natation, pour les sportifs confirmés comme pour les débutants.',
    specs: [['Horaires', 'Mar – dim · 8h–21h'], ['À la séance', '1 500 F CFA']],
    drawing: 'gym',
    cta: 'Réserver une séance',
  },
  {
    id: 'jeux',
    n: '04',
    tag: 'Loisirs',
    title: 'Aire de jeux',
    text: 'Structures gonflables, trampoline, balançoires et tourniquet à l’ombre des arbres, pendant que les grands nagent ou s’entraînent.',
    specs: [['Âge conseillé', '3 à 10 ans'], ['Accès libre', 'Mar – dim · 9h–19h']],
    drawing: 'jeux',
  },
  {
    id: 'skate',
    n: '05',
    tag: 'Glisse',
    title: 'Skatepark',
    text: 'Béton lisse, banks, transitions, ledges, rails et escalier : un park Dakar 2026 pour le skate, le roller et la trottinette, juste à côté de l’aire de jeux.',
    specs: [['Public', 'Ados · jeunes adultes'], ['Accès libre', 'Mar – dim · 9h–19h']],
    drawing: 'skate',
  },
]

export default function TerrainsPage() {
  const root = useRef(null)

  useGSAP(
    () => {
      // tracés dessinés au fil du scroll
      gsap.utils.toArray('[data-drawing]').forEach((svg) => {
        gsap.fromTo(
          svg.querySelectorAll('.draw'),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: svg, start: 'top 85%', end: 'center 45%', scrub: 0.8 },
          }
        )
      })
      // le plan du terrain de l'ouverture se dessine au chargement
      gsap.fromTo('[data-hero-drawing] .draw', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, stagger: 0.12, ease: 'power2.inOut', delay: 0.4 })
    },
    { scope: root }
  )

  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])
  const openSpace = SPACES.find((s) => s.id === openId)

  const goTo = (id) => refs.lenis?.scrollTo(`#${id}`, { duration: 1.8, offset: -80 })

  return (
    <div ref={root}>
      {/* fond plan d'architecte */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#7fd6e8 1px, transparent 1px), linear-gradient(90deg, #7fd6e8 1px, transparent 1px), linear-gradient(rgba(127,214,232,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(127,214,232,.5) 1px, transparent 1px)',
          backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(6,35,56,.9),transparent_70%)]" />

      <SubPage
        label="Terrains · Loisirs · Musculation"
        current="terrains"
        booking={{
          title: (
            <>
              Réservez votre <em className="text-tide">terrain</em>.
            </>
          ),
          text: 'Football, basket ou séance de musculation : choisissez l’activité, la date et le créneau.',
          activity: '',
        }}
      >
        {/* Ouverture */}
        <section data-hero className="relative flex min-h-screen flex-col justify-end px-6 pb-20 pt-32 md:px-14 md:pb-24">
          <div data-hero-drawing className="pointer-events-none absolute right-6 top-28 w-[70vw] max-w-[620px] text-tide/50 md:right-14 md:top-32 md:w-[48vw]">
            {drawings.court}
          </div>
          <p data-hero-fade className={`${mono} mb-6`}>
            Terrains · Loisirs · Musculation
          </p>
          <h1 className="relative font-serif text-[15vw] font-light leading-[0.86] tracking-[-0.02em] md:text-[8.5vw]">
            <SplitChars text="Le sport," />
            <br />
            <SplitChars text="au-delà" className="italic text-tide" />
            <br />
            <SplitChars text="du bassin." />
          </h1>
          <div className="relative mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p data-hero-fade className="max-w-lg text-lg font-light text-foam/85">
              Autour de la piscine olympique : un terrain de football, des terrains de basket, une salle de musculation, une aire de jeux pour les enfants et un skatepark.
            </p>
            <nav data-hero-fade className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/60">
              {SPACES.map((s) => (
                <button key={s.id} onClick={() => goTo(s.id)} className="transition-colors hover:text-tide">
                  <span className="text-tide">{s.n}</span> {s.tag}
                </button>
              ))}
            </nav>
          </div>
        </section>

        {/* Espaces */}
        {SPACES.map((s, i) => (
          <section key={s.id} id={s.id} className="px-6 py-20 md:px-14 md:py-32">
            <div className="grid items-center gap-12 md:grid-cols-12">
              <div className={`md:col-span-6 ${i % 2 ? 'md:col-start-7 md:row-start-1' : ''}`}>
                <button
                  data-drawing
                  onClick={() => setOpenId(s.id)}
                  aria-label={`${s.title} — voir les caractéristiques`}
                  className="mx-auto block w-full max-w-[520px] text-tide/80 transition-colors hover:text-tide"
                >
                  {drawings[s.drawing]}
                </button>
              </div>
              <div className={`md:col-span-5 ${i % 2 ? 'md:col-start-1 md:row-start-1' : 'md:col-start-8'}`}>
                <p data-reveal className={`${mono} mb-5`}>
                  {s.n} — {s.tag}
                </p>
                <h2 data-reveal-chars className="font-serif text-5xl font-light leading-[0.95] md:text-6xl lg:text-7xl">
                  <SplitChars text={s.title} />
                </h2>
                <SplitWords data-reveal-words text={s.text} className="mt-6 text-lg font-light leading-relaxed text-foam/80" />
                <dl data-reveal className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em]">
                  {s.specs.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-3">
                      <dt className="text-foam/45">{k}</dt>
                      <dd className="text-right normal-case tracking-wider text-foam/90">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setOpenId(s.id)}
                    className="group inline-flex items-center gap-3 bg-tide px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-abyss transition-transform hover:-translate-y-0.5"
                  >
                    Voir les caractéristiques <span className="transition-transform group-hover:translate-x-1">+</span>
                  </button>
                  {s.cta ? (
                    <button
                      onClick={() => bookActivity(s.id)}
                      className="group inline-flex items-center gap-3 border border-tide/50 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:bg-tide hover:text-abyss"
                    >
                      {s.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  ) : (
                    <span className="px-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/50">Accès libre · sans réservation</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </SubPage>

      <ActivityDrawer
        id={openId}
        detail={openId ? ACTIVITY_DETAILS[openId] : null}
        drawing={openSpace ? drawings[openSpace.drawing] : null}
        bookable={Boolean(openSpace?.cta)}
        onClose={close}
      />
    </div>
  )
}
