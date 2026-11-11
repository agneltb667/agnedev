'use client'

import { useEffect, useState } from 'react'

// Les deux formules du devis, montrables sur la même maquette :
//   ?formule=vitrine  → pas de réservation en ligne, une demande par le formulaire de contact
//   ?formule=complet  → formule complète, avec réservation en ligne (par défaut)
// Le choix est gardé pendant la visite (sessionStorage) pour passer d'une page à l'autre.
// Lu après le premier rendu pour que le HTML du serveur et celui du navigateur concordent.
const KEY = 'pod-formule'

export function useFormule() {
  const [formule, setFormule] = useState('complet')
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('formule')
    let value = param
    try {
      if (param === 'vitrine' || param === 'complet') sessionStorage.setItem(KEY, param)
      else value = sessionStorage.getItem(KEY)
    } catch {}
    if (value === 'vitrine') setFormule('vitrine')
  }, [])
  return formule
}
