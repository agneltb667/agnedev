'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SubPage, { mono } from '../SubPage'
import { SplitChars, SplitWords } from '../Split'
import { scroll, bookActivity } from '@/lib/store'
import { PHONE, HOURS, PRICES } from '@/lib/data'

const Scene = dynamic(() => import('../three/Scene'), { ssr: false })

const PUBLICS = [
  {
    n: '01',
    title: 'Enfants',
    text: 'Découvrir l’eau en confiance : flotter, s’immerger, puis nager ses premières longueurs.',
    items: ['Aisance aquatique', 'Premières nages', 'Sécurité dans l’eau'],
  },
  {
    n: '02',
    title: 'Adultes',
    text: 'Il n’est jamais trop tard : apprendre à nager ou reprendre après des années, à votre rythme.',
    items: ['Grands débutants', 'Reprise', 'À votre rythme'],
  },
  {
    n: '03',
    title: 'Perfectionnement',
    text: 'Affiner sa technique, son souffle et son endurance dans un bassin de 50 mètres.',
    items: ['Crawl · dos · brasse', 'Endurance', 'Préparation aux compétitions'],
  },
]

const STEPS = [
  ['01', 'Réservez', 'Choisissez un créneau en ligne, ou appelez l’accueil.'],
  ['02', 'Arrivez en avance', 'Présentez votre numéro de réservation à l’accueil et passez aux vestiaires.'],
  ['03', 'À l’eau', 'Le cours se déroule dans le bassin olympique.'],
  ['04', 'Progressez', 'Revenez régulièrement : c’est la régularité qui fait les progrès.'],
]

export default function CoursPage() {
  // Caméra sous la surface ; elle descend doucement à mesure qu'on lit la page
  useEffect(() => {
    scroll.progress = 0.4
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        scroll.progress = 0.4 + s.progress * 0.07
      },
    })
    return () => {
      st.kill()
      scroll.progress = 0
    }
  }, [])

  return (
    <>
      <div className="animate-[fadein_1.6s_ease-out_both]">
        <Scene />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-abyss/45" />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(3,16,26,.7)_100%)]" />

      <SubPage
        label="École de natation"
        current="cours"
        booking={{
          title: (
            <>
              Votre premier <em className="text-tide">cours</em>.
            </>
          ),
          text: 'L’activité « Cours de natation » est déjà sélectionnée : choisissez une date et un créneau.',
          activity: 'cours',
        }}
      >
        {/* Ouverture */}
        <section data-hero className="flex min-h-screen flex-col justify-end px-6 pb-20 pt-32 md:px-14 md:pb-24">
          <p data-hero-fade className={`${mono} mb-6`}>
            École de natation — Piscine Olympique de Dakar
          </p>
          <h1 className="font-serif text-[15vw] font-light leading-[0.86] tracking-[-0.02em] md:text-[8.5vw]">
            <SplitChars text="Apprendre" />
            <br />
            <SplitChars text="à nager" className="italic text-tide" />
            <br />
            <SplitChars text="à Dakar." />
          </h1>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p data-hero-fade className="max-w-lg text-lg font-light text-foam/85">
              Des cours pour les enfants, les adultes et les nageurs qui veulent progresser, dans le bassin olympique de 50 mètres.
            </p>
            <div data-hero-fade className="flex flex-wrap gap-3">
              <button
                onClick={() => bookActivity('cours')}
                className="rounded-full bg-tide px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-abyss transition-transform hover:-translate-y-0.5"
              >
                Réserver un cours
              </button>
              <a
                href={PHONE.href}
                className="rounded-full border border-foam/30 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-tide hover:text-tide"
              >
                Appeler l’accueil
              </a>
            </div>
          </div>
        </section>

        {/* Pour qui */}
        <section className="px-6 py-24 md:px-14 md:py-32">
          <div className="mb-14 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <p data-reveal className={`${mono} mb-5`}>
                Pour qui ?
              </p>
              <h2 data-reveal-chars className="font-serif text-5xl font-light leading-[0.95] md:text-7xl">
                <SplitChars text="Tous les" /> <SplitChars text="niveaux." className="italic text-tide" />
              </h2>
            </div>
            <SplitWords
              data-reveal-words
              text="Que vous mettiez la tête sous l’eau pour la première fois ou que vous prépariez une compétition, il y a une place pour vous dans le bassin."
              className="self-end text-xl font-light leading-relaxed text-foam/85 md:col-span-6 md:col-start-7"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {PUBLICS.map((p) => (
              <article key={p.n} data-reveal className="relative border border-tide/25 bg-deep/60 p-7 backdrop-blur-sm md:p-9">
                <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-tide" />
                <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-tide" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-tide">{p.n} /</p>
                <h3 className="mt-8 font-serif text-3xl font-light lg:text-4xl">{p.title}</h3>
                <p className="mt-4 leading-relaxed text-foam/75">{p.text}</p>
                <ul className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em]">
                  {p.items.map((it) => (
                    <li key={it} className="border-t border-tide/15 py-2.5 text-foam/80">
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Déroulement */}
        <section className="px-6 py-24 md:px-14 md:py-32">
          <p data-reveal className={`${mono} mb-5`}>
            Comment ça se passe
          </p>
          <h2 data-reveal-chars className="mb-16 font-serif text-5xl font-light leading-[0.95] md:text-7xl">
            <SplitChars text="De la réservation" /> <br className="hidden md:block" />
            <SplitChars text="au bassin." className="italic text-tide" />
          </h2>
          <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
            {STEPS.map(([n, title, text]) => (
              <li key={n} data-reveal className="border-t border-foam/20 pt-6">
                <span className="font-serif text-6xl font-light text-tide/90">{n}</span>
                <h3 className="mt-4 font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-foam/70">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Tarifs */}
        <section className="px-6 py-24 md:px-14 md:py-32">
          <p data-reveal className={`${mono} mb-5`}>
            Tarifs
          </p>
          <h2 data-reveal-chars className="mb-14 font-serif text-5xl font-light leading-[0.95] md:text-7xl">
            <SplitChars text="Le carnet" /> <SplitChars text="de 10 cours." className="italic text-tide" />
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['Élèves & étudiants', '15 000', 'Carnet d’apprentissage · 10 séances'],
              ['Adultes', '20 000', 'Carnet d’apprentissage · 10 séances'],
            ].map(([who, price, what]) => (
              <article key={who} data-reveal className="relative border border-tide/25 bg-deep/60 p-8 backdrop-blur-sm md:p-10">
                <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-tide" />
                <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-tide" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-tide">{who}</p>
                <p className="mt-6 font-serif text-6xl font-light md:text-7xl">
                  {price}
                  <span className="ml-3 font-mono text-sm tracking-[0.2em] text-foam/60">F CFA</span>
                </p>
                <p className="mt-4 text-foam/70">{what}</p>
              </article>
            ))}
          </div>
          <dl data-reveal className="mt-10 max-w-2xl font-mono text-[11px] uppercase tracking-[0.2em]">
            {PRICES.slice(0, 2).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-4">
                <dt className="text-foam/45">{k}</dt>
                <dd className="text-right normal-case tracking-wider text-foam/90">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Bon à savoir */}
        <section className="px-6 py-24 md:px-14 md:py-32">
          <div className="grid gap-14 md:grid-cols-12">
            <blockquote data-reveal className="font-serif text-4xl font-light italic leading-tight text-foam/95 md:col-span-6 md:text-6xl">
              « Un bassin aux normes olympiques, ouvert à tous les niveaux. »
            </blockquote>
            <div className="md:col-span-5 md:col-start-8">
              <p data-reveal className={`${mono} mb-5`}>
                Bon à savoir
              </p>
              <dl data-reveal className="font-mono text-[11px] uppercase tracking-[0.2em]">
                {[
                  ['Bassins (public)', HOURS.public],
                  ['Fermeture', 'Le lundi (entretien)'],
                  ['Clubs', '7h–9h et 18h–20h'],
                  ['Vestiaires', 'Sur place'],
                  ['Accessibilité', 'Accès PMR'],
                  ['Secrétariat', PHONE.display],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-4">
                    <dt className="text-foam/45">{k}</dt>
                    <dd className="text-right normal-case tracking-wider text-foam/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </SubPage>
    </>
  )
}
