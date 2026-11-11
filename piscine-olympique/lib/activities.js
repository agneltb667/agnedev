// Fiches détaillées des espaces (page Terrains & loisirs).
//
// Pour compléter :
// - photos : ajoutez des fichiers dans /public/activites/ puis leur chemin ici,
//   ex. { src: '/activites/foot-1.jpg', alt: 'Le terrain de football' }
// - remplacez les valeurs « À confirmer » dès que l'information est connue.

const TBC = 'À confirmer'

export const ACTIVITY_DETAILS = {
  football: {
    title: 'Terrain de football',
    tag: 'Football',
    intro:
      'Un terrain de football à dimension réduite, de type multisports / urbain, intégré au complexe pour les entraînements et les animations locales.',
    description: [
      'Dans le cadre de la modernisation pour Dakar 2026, les espaces de sports collectifs du complexe ont été restructurés aux normes internationales.',
      'Le complexe est directement relié au pôle sportif du Stade Iba Mar Diop voisin, lui aussi entièrement rénové pour les Jeux Olympiques de la Jeunesse.',
      'La pelouse synthétique de 60 mm, posée sur une couche drainante, résiste à un usage intensif sous le climat dakarois et amortit bien les chocs.',
      'Le terrain est accessible en journée, selon le planning d’occupation du complexe : entraînements, écoles de sport et animations.',
    ],
    specs: [
      ['Format', 'Dimension réduite · multisports'],
      ['Usage', 'Entraînements · écoles de sport · animations'],
      ['À proximité', 'Stade Iba Mar Diop'],
      ['Revêtement', 'Gazon synthétique 60 mm'],
      ['Sous-couche', 'Drainante, en gravier'],
      ['Remplissage', 'Sable et granulats SBR'],
    ],
    equipment: ['Buts', 'Lignes de jeu tracées', 'Pelouse synthétique dernière génération'],
    photos: [],
    hours: [
      ['Jours', 'Selon le planning du complexe'],
      ['Horaires', 'En journée'],
      ['Lundi', 'Complexe fermé au public'],
    ],
    prices: [['Accès', 'Entraînements · écoles de sport']],
  },
  basket: {
    title: 'Terrains de basket',
    tag: 'Basket',
    intro:
      'Des terrains extérieurs entièrement refaits, officiellement désignés pour accueillir les épreuves de basketball 3x3 des Jeux Olympiques de la Jeunesse Dakar 2026.',
    description: [
      'Revêtement coloré et éclairage par projecteurs : les plateaux ont été remis aux normes internationales dans le cadre de la modernisation pour Dakar 2026.',
      'En dehors des tournois et des séances de l’ASC Ville de Dakar, les terrains sont accessibles selon le planning d’occupation du complexe.',
    ],
    specs: [
      ['Type', 'Plein air'],
      ['Format phare', 'Basketball 3x3'],
      ['Événement', 'JOJ Dakar 2026'],
      ['Revêtement', 'Synthétique coloré'],
      ['Éclairage', 'Projecteurs'],
    ],
    equipment: ['Paniers de basket', 'Lignes de jeu tracées', 'Éclairage', 'Clôture grillagée'],
    photos: [],
    hours: [
      ['Jours', 'Selon le planning du complexe'],
      ['Horaires', 'En journée · événements'],
      ['Lundi', 'Complexe fermé au public'],
    ],
    prices: [['Accès', 'Sur réservation · accès club']],
  },
  musculation: {
    title: 'Salle de musculation & fitness',
    tag: 'Musculation & fitness',
    intro:
      'Renforcement musculaire et cardio dans des salles dédiées : le complément idéal de la natation, pour les sportifs confirmés comme pour les débutants.',
    description: [
      'La salle a été entièrement rééquipée lors de la modernisation du complexe : plateaux de machines pour la musculation, et cours collectifs de fitness, step et cardio.',
      'L’accès est flexible, sans engagement de longue durée : venez à la séance, ou prenez un abonnement au mois.',
    ],
    specs: [
      ['Salles', 'Musculation · fitness'],
      ['Cours collectifs', 'Fitness · step · cardio'],
      ['Public', 'Débutants et confirmés'],
      ['Engagement', 'Aucun engagement long'],
    ],
    equipment: ['Plateaux de machines', 'Espace musculation', 'Salle de cours collectifs'],
    photos: [],
    hours: [
      ['Mardi – dimanche', '8h00 – 21h00'],
      ['Lundi', 'Fermeture technique'],
    ],
    pricesTitle: 'Horaires & tarifs',
    prices: [
      ['À la séance', '1 500 F CFA'],
      ['Musculation · mois', '20 000 F CFA'],
      ['Cours collectifs · mois', '25 000 F CFA'],
      ['10 cours collectifs · étudiants', '15 000 F CFA'],
      ['10 cours collectifs · adultes', '20 000 F CFA'],
    ],
  },
  jeux: {
    title: 'Aire de jeux',
    tag: 'Loisirs',
    intro:
      'À l’ombre de grands arbres : structures gonflables, trampoline, balançoires, tourniquet et jeux à bascule pour les plus petits.',
    description: [
      'Un espace coloré et clos par un mur peint, où les enfants jouent pendant que les grands nagent ou s’entraînent.',
      'Pensée pour les enfants de 3 à 10 ans, elle prolonge le skatepark et la zone de promenade du complexe : les plus grands passent au skatepark voisin.',
      'L’aire de jeux est en accès libre, sans réservation. Les enfants jouent sous la surveillance de leurs parents.',
    ],
    specs: [
      ['Âge conseillé', '3 à 10 ans'],
      ['Ombrage', 'Grands arbres'],
      ['Accès', 'Libre, sans réservation'],
      ['À côté', 'Skatepark · promenade'],
    ],
    equipment: ['Structures gonflables', 'Trampoline', 'Balançoires', 'Tourniquet', 'Jeux à bascule'],
    photos: [],
    hours: [
      ['Mardi – dimanche', '9h00 – 19h00'],
      ['Lundi', 'Complexe fermé au public'],
    ],
  },
  skate: {
    title: 'Skatepark',
    tag: 'Glisse',
    intro:
      'Un skatepark en béton lisse, pensé pour Dakar 2026 : banks, transitions, ledges, rails et escalier, pour le skate, le roller et la trottinette.',
    description: [
      'Les modules conviennent aux débutants comme aux riders plus expérimentés : banks et transitions pour prendre de la vitesse, ledges et curbs pour les slides, rails et escalier pour les figures.',
      'Destiné aux adolescents et jeunes adultes, il prend le relais de l’aire de jeux des 3–10 ans, juste à côté.',
    ],
    specs: [
      ['Revêtement', 'Béton lisse'],
      ['Pratiques', 'Skate · roller · trottinette'],
      ['Public', 'Adolescents · jeunes adultes'],
      ['Niveau', 'Débutants à confirmés'],
      ['Accès', 'Libre, sans réservation'],
    ],
    equipment: ['Banks', 'Transitions', 'Layback wall', 'Ledges & curbs', 'Rails', 'Escalier avec rampes', 'Euro gap'],
    photos: [],
    hours: [
      ['Mardi – dimanche', '9h00 – 19h00'],
      ['Lundi', 'Fermé (entretien du complexe)'],
    ],
  },
}
