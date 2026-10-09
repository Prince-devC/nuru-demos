/* Les données du site. Tout ce qui vient du client est repris mot pour mot de ses
   annonces WhatsApp (tarifs, lieux). Ce qui est marqué EXEMPLE reste à confirmer avec lui. */

export const ENTREPRISE = {
  nom: "Thierry & Fils",
  slogan: "Vente et location · appartements, téléphones, véhicules",
  whatsapp: "2290197153813",
  telephone: "01 97 15 38 13",
  villes: "Cotonou · Abomey-Calavi",
};

const G = (n) => `assets/img/godomey-${n}.jpg`;
const B = (n) => `assets/img/bidossessi-${n}.jpg`;

export const LOGEMENTS = [
  {
    id: "godomey",
    nom: "Appartement meublé, Godomey Échangeur",
    court: "Godomey Échangeur",
    lieu: "Godomey Échangeur, Abomey-Calavi",
    accroche: "En première ligne sur la grande voie, à Godomey Échangeur. Salon lumineux, chambre double, cuisine équipée et salle de bain moderne.",
    description: "Un appartement entièrement meublé, pensé pour un séjour confortable : grand salon avec canapés et télévision, coin bureau, chambre avec lit double, cuisine équipée et salle de bain avec douche. L'électricité est incluse dans le tarif.",
    carte: "Godomey Échangeur, Abomey-Calavi, Bénin",
    photos: [G("salon"), G("chambre"), G("salle-de-bain"), G("cuisine"), G("salon2"), G("coin-bureau"), G("chambre2"), G("entree"), G("minibar"), G("refrigerateur"), G("rideaux")],
    video: "assets/video/godomey.mp4",
    affiche: "assets/video/godomey-poster.jpg",
    equipements: [["sofa", "Salon avec canapés"], ["tv", "Télévision écran plat"], ["air-vent", "Climatisation"], ["bed-double", "Chambre avec lit double"], ["cooking-pot", "Cuisine équipée"], ["refrigerator", "Réfrigérateur"], ["shower-head", "Salle de bain avec douche"], ["zap", "Électricité incluse"]],
    formules: [{ id: "nuitee", nom: "Nuitée", detail: "Électricité incluse", prix: 30000, plage: true }],
    statut: "Disponible immédiatement",
  },
  {
    id: "bidossessi",
    nom: "Chambre et salon meublés, Bidossèssi",
    court: "Bidossèssi",
    lieu: "Près de la pharmacie SOS Bidossèssi",
    accroche: "À proximité du pavé, dans une maison de seulement deux ménages : calme et discrétion. Salon, chambre double, à la journée, à la nuitée ou pour 24 heures.",
    description: "Une chambre et un salon meublés, près de la pharmacie SOS Bidossèssi et à proximité du pavé. La maison ne compte que deux ménages : l'endroit est calme et discret. Formule à la journée, à la nuitée ou pour 24 heures.",
    carte: "Pharmacie SOS Bidossèssi, Abomey-Calavi, Bénin",
    photos: [B("salon"), B("chambre"), B("tv"), B("sejour")],
    video: "assets/video/bidossessi.mp4",
    affiche: "assets/video/bidossessi-poster.jpg",
    equipements: [["sofa", "Salon avec canapés"], ["tv", "Télévision écran plat"], ["air-vent", "Climatisation"], ["bed-double", "Chambre avec lit double"], ["users", "Deux ménages seulement"], ["map-pin", "À proximité du pavé"]],
    formules: [
      { id: "journee", nom: "Journée", detail: "En journée", prix: 10000, plage: false },
      { id: "nuitee", nom: "Nuitée", detail: "Arrivée le soir, départ le matin", prix: 10000, plage: false },
      { id: "24h", nom: "24 heures", detail: "Par période de 24 h", prix: 15000, plage: true },
    ],
    statut: "Disponible immédiatement",
  },
];

/* Le catalogue de la boutique. Les modèles et les couleurs reprennent ceux du
   catalogue WhatsApp du client. Les PRIX SONT DES EXEMPLES, à remplacer par les siens. */
export const PRODUITS = [
  { id: "ip17pm", nom: "iPhone 17 Pro Max", type: "iphone", etat: "Neuf", pro: true,
    couleurs: [["Orange cosmique", "#d9733a"], ["Bleu intense", "#2e3d5c"], ["Argent", "#dcdde0"]],
    capacites: [["256 Go", 1150000], ["512 Go", 1320000], ["1 To", 1490000]] },
  { id: "ip17p", nom: "iPhone 17 Pro", type: "iphone", etat: "Neuf", pro: true,
    couleurs: [["Orange cosmique", "#d9733a"], ["Bleu intense", "#2e3d5c"], ["Argent", "#dcdde0"]],
    capacites: [["256 Go", 980000], ["512 Go", 1140000]] },
  { id: "ip16p", nom: "iPhone 16 Pro", type: "iphone", etat: "Neuf", pro: true,
    couleurs: [["Titane désert", "#bfa68a"], ["Titane naturel", "#b8b2a7"], ["Titane noir", "#3d3d3f"], ["Titane blanc", "#eeede9"]],
    capacites: [["128 Go", 720000], ["256 Go", 820000]] },
  { id: "ip16", nom: "iPhone 16", type: "iphone", etat: "Neuf", pro: false,
    couleurs: [["Outremer", "#5f7fcb"], ["Sarcelle", "#86b8b1"], ["Rose", "#f0b6c9"], ["Blanc", "#f1f1ee"], ["Noir", "#3a3b3d"]],
    capacites: [["128 Go", 560000], ["256 Go", 640000]] },
  { id: "ip15", nom: "iPhone 15", type: "iphone", etat: "Reconditionné", pro: false,
    couleurs: [["Bleu", "#cfdbe3"], ["Rose", "#f2d6d8"], ["Noir", "#3c3d3f"]],
    capacites: [["128 Go", 390000], ["256 Go", 450000]] },
  { id: "ip14p", nom: "iPhone 14 Pro", type: "iphone", etat: "Reconditionné", pro: true,
    couleurs: [["Violet intense", "#5b4e66"], ["Or", "#efe1c6"], ["Noir sidéral", "#3b3a3c"]],
    capacites: [["128 Go", 420000], ["256 Go", 480000]] },
  { id: "airpods", nom: "AirPods Pro", type: "accessoire", etat: "Neuf", forme: "ecouteurs",
    couleurs: [["Blanc", "#f4f4f2"]], capacites: [["Boîtier USB-C", 150000]] },
  { id: "magsafe", nom: "Chargeur MagSafe", type: "accessoire", etat: "Neuf", forme: "chargeur",
    couleurs: [["Blanc", "#f4f4f2"]], capacites: [["1 m", 28000], ["2 m", 34000]] },
  { id: "coque", nom: "Coque MagSafe transparente", type: "accessoire", etat: "Neuf", forme: "coque",
    couleurs: [["Transparente", "#e8eef4"], ["Orange", "#e9874a"], ["Bleu nuit", "#2e3d5c"]], capacites: [["iPhone 16 / 17", 15000]] },
];

export const LIVRAISON = { cotonou_calavi: 2000 }; // EXEMPLE, à confirmer avec le client

export const MODELES_TROC = ["iPhone 11", "iPhone 12", "iPhone 12 Pro", "iPhone 13", "iPhone 13 Pro", "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro", "iPhone 16", "iPhone 16 Pro", "Samsung Galaxy", "Autre"];
