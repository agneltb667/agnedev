'use client'

import { useRef } from 'react'

const glyphs = {
  pool: (
    <>
      <rect x="2" y="4" width="116" height="52" />
      {[14, 24, 34, 44].map((y) => (
        <line key={y} x1="12" x2="108" y1={y + 1} y2={y + 1} strokeDasharray="3 3" />
      ))}
      <line x1="12" x2="12" y1="8" y2="52" />
      <line x1="108" x2="108" y1="8" y2="52" />
    </>
  ),
  swim: (
    <>
      <path d="M2 44c10 0 10-6 20-6s10 6 20 6 10-6 20-6 10 6 20 6 10-6 20-6 10 6 16 6" />
      <path d="M2 54c10 0 10-6 20-6s10 6 20 6 10-6 20-6 10 6 20 6 10-6 20-6 10 6 16 6" opacity=".5" />
      <circle cx="78" cy="16" r="6" />
      <path d="M30 34l22-16 14 10 18-8" />
    </>
  ),
  gym: (
    <>
      <line x1="26" x2="94" y1="30" y2="30" />
      <rect x="14" y="16" width="10" height="28" />
      <rect x="96" y="16" width="10" height="28" />
      <rect x="6" y="22" width="8" height="16" />
      <rect x="106" y="22" width="8" height="16" />
    </>
  ),
  field: (
    <>
      <rect x="2" y="4" width="116" height="52" />
      <line x1="60" x2="60" y1="4" y2="56" />
      <circle cx="60" cy="30" r="10" />
      <rect x="2" y="18" width="14" height="24" />
      <rect x="104" y="18" width="14" height="24" />
    </>
  ),
}

// Carte 2.5D : l'élément extérieur est animé par GSAP au scroll,
// l'intérieur s'incline en 3D en suivant le pointeur.
export default function BlueprintCard({ card, onBook }) {
  const inner = useRef(null)

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    const s = inner.current.style
    s.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
    s.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
    s.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
    s.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  const leave = () => {
    const s = inner.current.style
    s.setProperty('--rx', '0deg')
    s.setProperty('--ry', '0deg')
  }

  // Toute la carte est cliquable : lien vers la page dédiée, ou réservation directe
  // (un <button> ne peut pas contenir de titres : la carte de réservation est un div role="button")
  const Tag = card.href ? 'a' : 'div'
  const book = () => onBook?.(card.book)
  const linkProps = card.href
    ? { href: card.href, 'aria-label': `${card.title} — découvrir` }
    : {
        role: 'button',
        tabIndex: 0,
        onClick: book,
        onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), book()),
        'aria-label': `${card.title} — réserver`,
      }

  return (
    <article data-card className="group pointer-events-auto [perspective:900px]" onPointerMove={move} onPointerLeave={leave}>
      <Tag
        ref={inner}
        {...linkProps}
        className="relative block h-full w-full cursor-pointer border border-tide/25 bg-deep/70 p-4 text-left transition-[transform,border-color] duration-300 ease-out [transform-style:preserve-3d] hover:border-tide/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-tide md:p-6"
        style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(127,214,232,.18), transparent 60%)' }}
        />
        {/* repères d'angle façon plan d'architecte */}
        <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-tide" />
        <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-tide" />
        <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-tide" />
        <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-tide" />

        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-tide md:text-[10px]" style={{ transform: 'translateZ(30px)' }}>
          <span>{card.n} /</span>
          <span className="hidden sm:inline">{card.tag}</span>
        </div>

        <svg
          viewBox="0 0 120 60"
          className="my-4 h-9 w-auto text-tide/80 md:my-6 md:h-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          style={{ transform: 'translateZ(50px)' }}
          aria-hidden="true"
        >
          {glyphs[card.glyph]}
        </svg>

        <h3 className="font-serif text-xl font-light leading-tight md:text-3xl" style={{ transform: 'translateZ(36px)' }}>
          {card.title}
        </h3>
        <p className="mt-2 hidden text-sm leading-relaxed text-foam/70 lg:block" style={{ transform: 'translateZ(20px)' }}>
          {card.text}
        </p>
        <dl className="mt-5 hidden font-mono text-[10px] uppercase tracking-[0.15em] xl:block [@media(max-height:760px)]:hidden">
          {card.specs.map(([k, v]) => (
            <div key={k} className="flex justify-between border-t border-tide/15 py-2">
              <dt className="text-foam/45">{k}</dt>
              <dd className="text-foam/85">{v}</dd>
            </div>
          ))}
        </dl>
        <span
          className="relative mt-4 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-tide group-hover:underline md:mt-5 md:text-[10px]"
          style={{ transform: 'translateZ(30px)' }}
        >
          {card.href ? 'Découvrir' : 'Réserver'} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </Tag>
    </article>
  )
}
