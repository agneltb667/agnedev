import { DEMO } from '@/lib/data'

// Maquette : on demande aux robots de ne rien indexer
export default function robots() {
  return DEMO ? { rules: { userAgent: '*', disallow: '/' } } : { rules: { userAgent: '*', allow: '/' } }
}
