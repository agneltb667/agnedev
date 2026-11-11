import { DEMO } from '@/lib/data'

// Bandeau visible sur toutes les pages : ce site est un concept de portfolio, pas le site officiel
export default function DemoBanner() {
  if (!DEMO) return null
  return (
    <div role="note" className="fixed inset-x-0 top-0 z-[60] border-b border-coral/40 bg-abyss/90 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-foam/85 backdrop-blur md:text-[11px]">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-coral align-middle" aria-hidden="true" />
      Concept réalisé par{' '}
      <a href="https://agnedev.com" target="_blank" rel="noopener" className="text-tide underline underline-offset-2">AgneDev</a>
      {' '}· site non officiel · horaires, tarifs et réservations fictifs
    </div>
  )
}
