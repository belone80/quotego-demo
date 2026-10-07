(function(){
const QG = window.QG = window.QG || {};

const TEMPLATES = {
  barber:{
    id:"barber", label:"Barber", emoji:"✂️", title:"Salon de coiffure / barbier",
    keywords:["coiffeur","coiffure","barbier","barber","cheveux","coupe","salon","hairdresser","kapper"],
    services:[
      {name:"Coupe",price:25,duration:30},
      {name:"Barbe",price:15,duration:15},
      {name:"Coupe + Barbe",price:35,duration:45}
    ],
    fields:["Prénom","Téléphone","Service","Date","Heure","Notes"],
    schedule:{days:["Lun","Mar","Mer","Jeu","Ven","Sam"],open:"09:00",close:"18:00",pause:"12:30-13:30",buffer:10,employees:1,mode:"auto"},
    bookingLabel:"réservation selon vos disponibilités",
    preview:[
      {type:"trigger",label:"Nouvelle demande de réservation"},
      {type:"condition",label:"Vérifier la disponibilité du créneau"},
      {type:"action",label:"Créer la réservation"},
      {type:"action",label:"Envoyer la confirmation"}
    ]
  },
  restaurant:{
    id:"restaurant", label:"Restaurant", emoji:"🍽️", title:"Restaurant / bar",
    keywords:["restaurant","restaurateur","resto","table","restaurant","brasserie","café","bar","serveur","salle"],
    services:[
      {name:"Réservation de table",price:0,duration:90},
      {name:"Table terrasse",price:0,duration:90},
      {name:"Groupe (8+)",price:0,duration:120}
    ],
    fields:["Nom","Téléphone","Nombre de personnes","Date","Heure","Demande spéciale"],
    schedule:{days:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],open:"11:30",close:"22:30",pause:"15:00-18:00",buffer:15,employees:1,mode:"auto"},
    bookingLabel:"réservation de table",
    preview:[
      {type:"trigger",label:"Nouvelle réservation de table"},
      {type:"condition",label:"Vérifier la disponibilité des tables"},
      {type:"action",label:"Enregistrer la réservation"},
      {type:"action",label:"Confirmer au client"}
    ]
  },
  detailing:{
    id:"detailing", label:"Detailing", emoji:"🚗", title:"Detailing automobile / lavage",
    keywords:["detailing","detail","lavage","voiture","auto","carwash","véhicule","polish","cire","nettoyage auto"],
    services:[
      {name:"Extérieur",price:35,duration:30},
      {name:"Complet",price:85,duration:75},
      {name:"Intérieur",price:55,duration:45},
      {name:"Premium",price:125,duration:120}
    ],
    fields:["Prénom","Téléphone","Véhicule","Service","Date","Remarque"],
    schedule:{days:["Mar","Mer","Jeu","Ven","Sam"],open:"08:30",close:"17:30",pause:"12:00-13:00",buffer:15,employees:1,mode:"manual"},
    bookingLabel:"demande de rendez-vous",
    preview:[
      {type:"trigger",label:"Nouvelle demande de devis"},
      {type:"condition",label:"Vérifier le catalogue et les options"},
      {type:"action",label:"Calculer l'estimation"},
      {type:"action",label:"Proposer un rendez-vous"}
    ]
  },
  garden:{
    id:"garden", label:"Jardinier", emoji:"🌿", title:"Jardinage / entretien extérieur",
    keywords:["jardin","jardinier","jardinage","gazon","tonte","paysage","garden","arbuste","hedge","terrasse"],
    services:[
      {name:"Tonte de pelouse",price:45,duration:60},
      {name:"Taille de haies",price:90,duration:120},
      {name:"Entretien complet",price:150,duration:180}
    ],
    fields:["Nom","Téléphone","Type de travail","Surface (m²)","Description","Photos","Créneau souhaité"],
    schedule:{days:["Lun","Mar","Mer","Jeu","Ven"],open:"08:00",close:"17:00",pause:"12:00-13:00",buffer:30,employees:2,mode:"manual"},
    bookingLabel:"demande d'estimation",
    preview:[
      {type:"trigger",label:"Nouvelle demande d'estimation"},
      {type:"condition",label:"Vérifier la surface et les photos"},
      {type:"action",label:"Préparer le devis"},
      {type:"action",label:"Proposer une disponibilité"}
    ]
  },
  beauty:{
    id:"beauty", label:"Beauté", emoji:"💅", title:"Beauté / bien-être",
    keywords:["beauté","beaute","esthéticienne","ongles","manucure","soin","massage","spa","beauty","coiffeur femme","cils","sourcils"],
    services:[
      {name:"Soin du visage",price:60,duration:60},
      {name:"Manucure",price:35,duration:45},
      {name:"Épilation",price:45,duration:30}
    ],
    fields:["Prénom","Téléphone","Prestation","Employé","Date","Heure"],
    schedule:{days:["Mar","Mer","Jeu","Ven","Sam"],open:"09:30",close:"18:30",pause:"13:00-14:00",buffer:15,employees:2,mode:"auto"},
    bookingLabel:"prise de rendez-vous",
    preview:[
      {type:"trigger",label:"Nouvelle demande de rendez-vous"},
      {type:"condition",label:"Vérifier employé et durée"},
      {type:"action",label:"Créer le rendez-vous"},
      {type:"action",label:"Confirmer au client"}
    ]
  },
  custom:{
    id:"custom", label:"Custom", emoji:"✦", title:"Autre métier",
    keywords:[],
    services:[],
    fields:["Nom","Téléphone","Besoin","Date","Notes"],
    schedule:{days:["Lun","Mar","Mer","Jeu","Ven"],open:"09:00",close:"18:00",pause:"12:00-13:00",buffer:15,employees:1,mode:"auto"},
    bookingLabel:"demande",
    preview:[
      {type:"trigger",label:"Nouvelle demande"},
      {type:"condition",label:"Vérifier les informations"},
      {type:"action",label:"Créer l'enregistrement"},
      {type:"action",label:"Préparer la réponse"}
    ]
  }
};

const ORDER = ["barber","restaurant","detailing","garden","beauty","custom"];

function normalize(s){
  return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function detect(text){
  const t = normalize(text);
  if(!t) return null;
  let best = null, bestScore = 0;
  ORDER.forEach(key => {
    const tpl = TEMPLATES[key];
    if(key === "custom") return;
    let score = 0;
    tpl.keywords.forEach(k => { if(t.includes(normalize(k))) score += normalize(k).length; });
    if(t.includes("je suis " + normalize(tpl.label)) || t.includes("je suis " + key)) score += 12;
    if(score > bestScore){ bestScore = score; best = key; }
  });
  if(best) return best;
  if(/\bje\s+suis\b|\bmon\s+activit[eé]\b|\bmon\s+mtier\b|\bje\s+fais\b|\bje\s+g[eè]re\b/.test(t)) return "custom";
  return null;
}

function get(key){ return TEMPLATES[key] || TEMPLATES.custom; }
function list(){ return ORDER.map(k => TEMPLATES[k]); }

function defaultConfig(key){
  const t = get(key);
  return {
    industry:key,
    industryLabel:t.label,
    services:t.services.map(s => ({name:s.name,price:s.price,duration:s.duration,selected:true})),
    days:t.schedule.days.slice(),
    open:t.schedule.open,
    close:t.schedule.close,
    pause:t.schedule.pause,
    buffer:t.schedule.buffer,
    employees:t.schedule.employees,
    mode:t.schedule.mode,
    fields:t.fields.slice(),
    configuredAt:new Date().toISOString()
  };
}

QG.templates = {TEMPLATES:TEMPLATES, ORDER:ORDER, detect:detect, get:get, list:list, defaultConfig:defaultConfig};
})();
