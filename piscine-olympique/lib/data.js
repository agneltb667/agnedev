// Maquette de présentation : bandeau « proposition de site », réservations non transmises,
// site non référencé par Google. Passer à false une fois le site validé par la piscine
// et un vrai système de réservation branché.
export const DEMO = true

// Concept de portfolio : le vrai numéro du complexe n'est pas affiché
export const PHONE = { display: 'Non affiché (concept)', href: '#' }
export const PLUS_CODE = 'MGWQ+97'
export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Piscine+Olympique+Nationale+de+Dakar'

// Activités réservables (l'aire de jeux est en accès libre)
export const BOOKABLE = [
  { id: 'baignade', title: 'Baignade libre' },
  { id: 'cours', title: 'Cours de natation' },
  { id: 'entrainement', title: 'Entraînement club' },
  { id: 'fitness', title: 'Salle de fitness' },
  { id: 'musculation', title: 'Musculation' },
  { id: 'football', title: 'Terrain de football' },
  { id: 'basket', title: 'Terrain de basket' },
]

// Accès public aux bassins : mardi → dimanche, 9h–13h et 15h–18h ; fermé le lundi (entretien)
export const HOURS = {
  public: 'Mar – dim · 9h–13h / 15h–18h',
  closed: 'Lundi (entretien des eaux et des filtres)',
  clubs: 'Clubs : 7h–9h et 18h–20h',
}
export const SLOTS = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00']
// Salle de musculation & fitness : mardi → dimanche, 8h–21h
export const GYM_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '19:00', '20:00']
export const slotsFor = (activity) => (activity === 'musculation' || activity === 'fitness' ? GYM_SLOTS : SLOTS)
export const CLOSED_DAY = 1 // lundi (Date.getDay)

export const PRICES = [
  ['Entrée piscine · mardi → vendredi', '1 000 F CFA'],
  ['Entrée piscine · week-end & jours fériés', '2 000 F CFA'],
  ['Carnet 10 cours · élèves & étudiants', '15 000 F CFA'],
  ['Carnet 10 cours · adultes', '20 000 F CFA'],
]

export const CARDS = [
  {
    n: '01',
    tag: 'Natation',
    glyph: 'pool',
    book: 'baignade',
    title: 'Bassin olympique',
    text: 'Baignade libre, entraînement des clubs et compétitions nationales et internationales.',
    specs: [['Longueur', '50 m'], ['Tribunes', 'Oui'], ['Accès PMR', 'Oui']],
  },
  {
    n: '02',
    tag: 'École',
    glyph: 'swim',
    href: '/cours',
    title: 'Cours de natation',
    text: 'Apprentissage et perfectionnement, pour les enfants comme pour les adultes.',
    specs: [['Public', 'Enfants · Adultes'], ['Réservation', 'En ligne']],
  },
  {
    n: '03',
    tag: 'Forme',
    glyph: 'gym',
    href: '/terrains#musculation',
    title: 'Fitness & musculation',
    text: 'Une salle de fitness et une salle de musculation, en complément du bassin.',
    specs: [['Cardio', 'Fitness'], ['Force', 'Musculation']],
  },
  {
    n: '04',
    tag: 'Plein air',
    glyph: 'field',
    href: '/terrains',
    title: 'Terrains & loisirs',
    text: 'Football, basket 3x3, skatepark et aire de jeux pour les enfants.',
    specs: [['Ballon', 'Foot · Basket'], ['Loisirs', 'Jeux · Skatepark']],
  },
]
