// Découpe le texte en mots masqués (et en lettres) pour les révélations GSAP.
// Le texte complet reste lisible par les lecteurs d'écran via aria-label.

const mask = 'inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-top'

export function SplitChars({ text, className = '' }) {
  const words = text.split(' ')
  return (
    <span aria-label={text} className={className}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className={`${mask} whitespace-nowrap`}>
          {[...w].map((c, j) => (
            <span key={j} data-char className="inline-block will-change-transform">
              {c}
            </span>
          ))}
          {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}

export function SplitWords({ text, as: Tag = 'p', className = '', ...rest }) {
  const words = text.split(' ')
  return (
    <Tag aria-label={text} className={className} {...rest}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className={mask}>
          <span data-word className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 && ' '}
          </span>
        </span>
      ))}
    </Tag>
  )
}
