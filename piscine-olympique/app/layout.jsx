import './globals.css'
import DemoBanner from '@/components/DemoBanner'
import { DEMO } from '@/lib/data'

export const metadata = {
  title: 'Piscine Olympique de Dakar — concept de site (non officiel)',
  description:
    'Concept de site pour la Piscine Olympique Nationale de Dakar, réalisé par AgneDev : bassin 3D, cours de natation, fitness et terrains. Site non officiel.',
  // concept : ne pas apparaître dans les moteurs de recherche
  ...(DEMO && { robots: { index: false, follow: false } }),
}

export const viewport = {
  themeColor: '#03101a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <DemoBanner />
      </body>
    </html>
  )
}
