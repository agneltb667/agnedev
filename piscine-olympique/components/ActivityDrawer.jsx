'use client'

import { useEffect, useRef, useState } from 'react'
import { refs, bookActivity } from '@/lib/store'
import { PHONE } from '@/lib/data'

const label = 'font-mono text-[10px] uppercase tracking-[0.3em] text-tide'

// Panneau latéral : photos, description, caractéristiques et horaires d'un espace
export default function ActivityDrawer({ id, detail, drawing, bookable, onClose }) {
  const open = Boolean(detail)
  const [shown, setShown] = useState(null)
  const [photo, setPhoto] = useState(0)
  const panel = useRef(null)
  const lastFocus = useRef(null)

  // garde le contenu pendant l'animation de fermeture
  useEffect(() => {
    if (detail) {
      setShown({ id, detail, drawing, bookable })
      setPhoto(0)
    }
  }, [id, detail, drawing, bookable])

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement
    refs.lenis?.stop()
    panel.current?.focus()
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      refs.lenis?.start()
      lastFocus.current?.focus?.()
    }
  }, [open, onClose])

  const d = shown?.detail
  const photos = d?.photos ?? []

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
      <button
        aria-label="Fermer"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-abyss/70 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={d?.title}
        tabIndex={-1}
        data-lenis-prevent
        className={`absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto overscroll-contain border-l border-tide/20 bg-abyss outline-none transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {d && (
          <div className="px-6 pb-16 pt-6 md:px-12">
            <div className="sticky top-0 z-10 -mx-6 mb-8 flex items-center justify-between bg-abyss/90 px-6 py-4 backdrop-blur md:-mx-12 md:px-12">
              <span className={label}>{d.tag} — fiche</span>
              <button onClick={onClose} className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/70 hover:text-tide">
                Fermer
                <span className="relative h-5 w-5">
                  <span className="absolute left-0 top-1/2 h-px w-5 rotate-45 bg-current" />
                  <span className="absolute left-0 top-1/2 h-px w-5 -rotate-45 bg-current" />
                </span>
              </button>
            </div>

            <h2 className="font-serif text-5xl font-light leading-[0.95] md:text-6xl">{d.title}</h2>
            <p className="mt-5 text-lg font-light leading-relaxed text-foam/85">{d.intro}</p>

            {/* Photos */}
            <section className="mt-10">
              <h3 className={`${label} mb-4`}>Photos</h3>
              {photos.length > 0 ? (
                <>
                  <figure className="relative aspect-[4/3] overflow-hidden border border-tide/20 bg-deep/60">
                    {/* contain : les photos en portrait (ou les plans) ne sont pas recadrées */}
                    <img src={photos[photo].src} alt={photos[photo].alt} className="h-full w-full object-contain" />
                  </figure>
                  {photos.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {photos.map((p, i) => (
                        <button
                          key={p.src}
                          onClick={() => setPhoto(i)}
                          aria-label={`Photo ${i + 1}`}
                          className={`h-16 w-20 flex-none overflow-hidden border ${i === photo ? 'border-tide' : 'border-foam/15 opacity-60 hover:opacity-100'}`}
                        >
                          <img src={p.src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-6 border border-dashed border-tide/30 bg-deep/40 p-8 text-center">
                  <div className="w-3/4 max-w-sm text-tide/60 [&_.draw]:[stroke-dashoffset:0]">{shown.drawing}</div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foam/50">Photos à venir</p>
                </div>
              )}
            </section>

            {/* Description */}
            <section className="mt-12">
              <h3 className={`${label} mb-4`}>Description</h3>
              <div className="space-y-4 leading-relaxed text-foam/80">
                {d.description.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {d.equipment.map((e) => (
                  <li key={e} className="border border-foam/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foam/75">
                    {e}
                  </li>
                ))}
              </ul>
            </section>

            {/* Caractéristiques */}
            <section className="mt-12">
              <h3 className={`${label} mb-4`}>Caractéristiques</h3>
              <dl className="font-mono text-[11px] uppercase tracking-[0.2em]">
                {d.specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-3">
                    <dt className="text-foam/45">{k}</dt>
                    <dd className={`text-right normal-case tracking-wider ${v === 'À confirmer' ? 'text-foam/40 italic' : 'text-foam/90'}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Horaires */}
            <section className="mt-12">
              <h3 className={`${label} mb-4`}>{d.pricesTitle ?? (d.prices ? 'Horaires & accès' : 'Horaires')}</h3>
              <dl className="font-mono text-[11px] uppercase tracking-[0.2em]">
                {d.hours.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-3">
                    <dt className="text-foam/45">{k}</dt>
                    <dd className={`text-right normal-case tracking-wider ${v === 'À confirmer' ? 'text-foam/40 italic' : 'text-foam/90'}`}>{v}</dd>
                  </div>
                ))}
              </dl>
              {d.prices && (
                <dl className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em]">
                  {d.prices.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-t border-foam/15 py-3">
                      <dt className="text-foam/45">{k}</dt>
                      <dd className="text-right normal-case tracking-wider text-foam/90">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="mt-4 text-sm text-foam/55">
                Pour toute question sur les horaires : <a href={PHONE.href} className="text-tide hover:underline">{PHONE.display}</a>
              </p>
            </section>

            {shown.bookable ? (
              <button
                onClick={() => {
                  onClose()
                  setTimeout(() => bookActivity(shown.id), 450)
                }}
                className="group mt-12 flex w-full items-center justify-between bg-tide px-6 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-abyss"
              >
                Réserver un créneau <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            ) : (
              <p className="mt-12 border border-foam/15 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foam/60">
                Accès libre · sans réservation
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
