
window.QUOTEGO_CONFIG = {
  business: {
    name: "QuoteGo Auto Demo",
    shortName: "QuoteGo Auto",
    tagline: "Ton véhicule. Ton prix. Maintenant.",
    whatsapp: "",
    locale: "fr-BE",
    currency: "EUR",
    accent: "#7CF7C7",
    accent2: "#77D7FF",
    city: "Bruxelles",
    instagram: "",
    mapsUrl: "",
    logoText: "Q",
    demoMode: true
  },

  vehicles: [
    { id: "city", label: {fr:"Citadine", nl:"Stadswagen", en:"City car", ar:"سيارة صغيرة"}, subtitle: {fr:"Clio, Polo, 208…", nl:"Clio, Polo, 208…", en:"Clio, Polo, 208…", ar:"Clio, Polo, 208…"}, emoji:"🚗", price:0 },
    { id: "sedan", label: {fr:"Berline", nl:"Sedan", en:"Sedan", ar:"سيدان"}, subtitle: {fr:"Série 3, Classe C…", nl:"3 Reeks, C-Klasse…", en:"3 Series, C-Class…", ar:"BMW 3، C-Class…"}, emoji:"🚘", price:10 },
    { id: "suv", label: {fr:"SUV / 4x4", nl:"SUV / 4x4", en:"SUV / 4x4", ar:"دفع رباعي"}, subtitle: {fr:"X5, Q7, Tiguan…", nl:"X5, Q7, Tiguan…", en:"X5, Q7, Tiguan…", ar:"X5, Q7, Tiguan…"}, emoji:"🚙", price:20 },
    { id: "van", label: {fr:"Utilitaire", nl:"Bestelwagen", en:"Van", ar:"فان"}, subtitle: {fr:"Transporter, Vito…", nl:"Transporter, Vito…", en:"Transporter, Vito…", ar:"Transporter, Vito…"}, emoji:"🚐", price:35 }
  ],

  packages: [
    { id:"outside", label:{fr:"Extérieur", nl:"Buitenkant", en:"Exterior", ar:"خارجي"}, description:{fr:"Prélavage, jantes, lavage, séchage", nl:"Voorwas, velgen, wassen, drogen", en:"Pre-wash, wheels, wash, dry", ar:"غسيل مبدئي، جنوط، غسيل وتجفيف"}, price:35 },
    { id:"full", label:{fr:"Complet", nl:"Volledig", en:"Complete", ar:"كامل"}, description:{fr:"Intérieur + extérieur en profondeur", nl:"Binnen + buiten grondig", en:"Deep interior + exterior", ar:"تنظيف داخلي وخارجي عميق"}, price:85, featured:true },
    { id:"inside", label:{fr:"Intérieur", nl:"Binnenkant", en:"Interior", ar:"داخلي"}, description:{fr:"Aspirateur, plastiques, vitres, finition", nl:"Stofzuigen, kunststoffen, ramen, afwerking", en:"Vacuum, plastics, glass, finishing", ar:"شفط، بلاستيك، زجاج وتشطيب"}, price:55 },
    { id:"premium", label:{fr:"Premium", nl:"Premium", en:"Premium", ar:"بريميوم"}, description:{fr:"Complet + finition premium + protection", nl:"Volledig + premium afwerking + bescherming", en:"Complete + premium finish + protection", ar:"كامل + تشطيب وحماية بريميوم"}, price:125 }
  ],

  conditions: [
    { id:"normal", label:{fr:"Normal", nl:"Normaal", en:"Normal", ar:"عادي"}, price:0 },
    { id:"dirty", label:{fr:"Sale", nl:"Vuil", en:"Dirty", ar:"متسخ"}, price:15 },
    { id:"very-dirty", label:{fr:"Très sale", nl:"Zeer vuil", en:"Very dirty", ar:"متسخ جداً"}, price:35 }
  ],

  extras: [
    { id:"pet-hair", label:{fr:"Poils d’animaux", nl:"Dierenharen", en:"Pet hair", ar:"شعر الحيوانات"}, description:{fr:"Aspiration approfondie", nl:"Diep stofzuigen", en:"Deep vacuuming", ar:"شفط عميق"}, price:20 },
    { id:"seat-shampoo", label:{fr:"Shampoing sièges", nl:"Stoelshampoo", en:"Seat shampoo", ar:"غسيل المقاعد"}, description:{fr:"Nettoyage textile en profondeur", nl:"Diepe textielreiniging", en:"Deep fabric cleaning", ar:"تنظيف عميق للأقمشة"}, price:25 },
    { id:"wheel-decon", label:{fr:"Décontamination jantes", nl:"Velgenreiniging", en:"Wheel decontamination", ar:"تنظيف عميق للجنوط"}, description:{fr:"Nettoyage ferreux renforcé", nl:"Intensieve ijzerreiniging", en:"Intensive iron removal", ar:"إزالة آثار الحديد"}, price:15 },
    { id:"hydro", label:{fr:"Protection hydrophobe", nl:"Hydrofobe bescherming", en:"Hydrophobic protection", ar:"حماية طاردة للماء"}, description:{fr:"Finition déperlante", nl:"Waterafstotende afwerking", en:"Water-repellent finish", ar:"تشطيب طارد للماء"}, price:30 }
  ]
};
