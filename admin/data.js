(function(){
const QG = window.QG = window.QG || {};

const KEY = {
  requests:"quotego_requests_v1",
  business:"quotego_studio_business_v1",
  services:"quotego_studio_services_v1",
  automations:"quotego_studio_automations_v1",
  bookings:"quotego_studio_bookings_v1",
  clients:"quotego_studio_clients_v1",
  forms:"quotego_studio_forms_v1",
  workflows:"quotego_studio_workflows_v1",
  settings:"quotego_studio_settings_v1",
  ai:"quotego_studio_ai_configuration_v1",
  journal:"quotego_studio_journal_v1",
  onboarded:"quotego_studio_onboarded_v1"
};

function read(key,fallback){
  try{
    const raw = localStorage.getItem(key);
    if(raw == null) return fallback;
    const val = JSON.parse(raw);
    return val == null ? fallback : val;
  }catch(e){ return fallback; }
}

function write(key,value){
  try{ localStorage.setItem(key,JSON.stringify(value)); }catch(e){}
}

function uid(prefix){
  return (prefix||"id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function journal(type,text){
  const list = read(KEY.journal,[]);
  list.unshift({ id:uid("log"), ts:new Date().toISOString(), type:type, text:text });
  write(KEY.journal, list.slice(0,120));
}

function requests(){
  const data = read(KEY.requests,[]);
  return Array.isArray(data) ? data : [];
}

function saveRequests(list){
  write(KEY.requests, list);
}

function updateRequestStatus(ref,status){
  const list = requests();
  const i = list.findIndex(r => r.ref === ref);
  if(i < 0) return null;
  list[i].status = status;
  list[i].updatedAt = new Date().toISOString();
  saveRequests(list);
  const labelMap = {new:"Nouveau",pending:"À confirmer",confirmed:"Confirmé",done:"Terminé",cancelled:"Annulé"};
  journal("request", "Statut modifié · " + ref + " → " + (labelMap[status]||status));
  notifyChange();
  return list[i];
}

function deleteRequest(ref){
  const list = requests().filter(r => r.ref !== ref);
  saveRequests(list);
  journal("request","Demande supprimée · " + ref);
  notifyChange();
}

function notifyChange(){
  try{
    const channel = new BroadcastChannel("quotego_admin");
    channel.postMessage({type:"studio-refresh"});
    channel.close();
  }catch(e){}
}

const STATUS_META = {
  new:{label:"Nouveau",class:"status-new"},
  pending:{label:"À confirmer",class:"status-pending"},
  confirmed:{label:"Confirmé",class:"status-confirmed"},
  done:{label:"Terminé",class:"status-done"},
  cancelled:{label:"Annulé",class:"status-cancelled"}
};

function seedServices(){
  const existing = read(KEY.services,null);
  if(Array.isArray(existing)) return existing;
  const cfg = window.QUOTEGO_CONFIG;
  const durations = {outside:30,full:75,inside:45,premium:120};
  const services = (cfg && cfg.packages ? cfg.packages : []).map(p => ({
    id:"svc-" + p.id,
    name:(p.label && (p.label.fr || p.label.en)) || p.id,
    description:(p.description && (p.description.fr || p.description.en)) || "",
    price:Number(p.price)||0,
    duration:durations[p.id]||45,
    category:"Detailing",
    active:true,
    createdAt:new Date().toISOString()
  }));
  write(KEY.services, services);
  return services;
}

function seedAutomations(){
  const existing = read(KEY.automations,null);
  if(Array.isArray(existing)) return existing;
  const now = new Date().toISOString();
  const list = [
    { id:"auto-booking", key:"booking", name:"Booking Assistant", status:"active",
      description:"Gère les demandes de rendez-vous et prépare les confirmations.",
      stats:{bookings:0,conversion:0}, createdAt:now,
      steps:[
        {type:"trigger",label:"Nouvelle demande de réservation"},
        {type:"condition",label:"Vérifier la disponibilité"},
        {type:"action",label:"Créer la réservation"},
        {type:"action",label:"Préparer le message de confirmation"}
      ]},
    { id:"auto-quote", key:"quote", name:"Quote Builder", status:"active",
      description:"Crée les estimations automatiquement à partir du catalogue.",
      stats:{quotes:0,conversion:0}, createdAt:now,
      steps:[
        {type:"trigger",label:"Nouvelle demande de devis"},
        {type:"condition",label:"Vérifier services et options"},
        {type:"action",label:"Calculer l'estimation"},
        {type:"action",label:"Envoyer la proposition"}
      ]},
    { id:"auto-followup", key:"followup", name:"Lead Follow-up", status:"ready",
      description:"Prépare les relances clients après une demande sans réponse.",
      stats:{sent:0,conversion:0}, createdAt:now,
      steps:[
        {type:"trigger",label:"Demande sans réponse depuis 24 h"},
        {type:"action",label:"Préparer le message de relance"}
      ]},
    { id:"auto-review", key:"review", name:"Review Booster", status:"ready",
      description:"Prépare les demandes d'avis après une prestation terminée.",
      stats:{sent:0,conversion:0}, createdAt:now,
      steps:[
        {type:"trigger",label:"Prestation marquée terminée"},
        {type:"action",label:"Préparer la demande d'avis"}
      ]},
    { id:"auto-lead", key:"lead", name:"Lead Capture", status:"paused",
      description:"Centralise les nouveaux prospects en un seul endroit.",
      stats:{leads:0,conversion:0}, createdAt:now,
      steps:[
        {type:"trigger",label:"Nouveau prospect"},
        {type:"action",label:"Créer la fiche client"}
      ]}
  ];
  write(KEY.automations, list);
  return list;
}

function seedForms(){
  const existing = read(KEY.forms,null);
  if(Array.isArray(existing)) return existing;
  const list = [{
    id:"form-booking",
    name:"Client booking form",
    status:"published",
    fields:[
      {id:"f-name",type:"text",label:"Nom",required:true,active:true},
      {id:"f-phone",type:"text",label:"Téléphone",required:true,active:true},
      {id:"f-service",type:"select",label:"Service",required:true,active:true},
      {id:"f-date",type:"date",label:"Date",required:true,active:true},
      {id:"f-time",type:"time",label:"Heure",required:false,active:true},
      {id:"f-notes",type:"textarea",label:"Notes",required:false,active:true}
    ]
  }];
  write(KEY.forms, list);
  return list;
}

function seedWorkflows(){
  const existing = read(KEY.workflows,null);
  if(Array.isArray(existing)) return existing;
  const list = [
    {id:"wf-booking",name:"New Booking Workflow",trigger:"Nouvelle réservation",status:"active",lastRun:null,
      steps:["Vérifier disponibilité","Créer réservation","Préparer confirmation","Notifier l'équipe"]},
    {id:"wf-quote",name:"Quote Workflow",trigger:"Nouvelle demande de devis",status:"active",lastRun:null,
      steps:["Lire le catalogue","Calculer l'estimation","Préparer la proposition"]},
    {id:"wf-followup",name:"Follow-up Workflow",trigger:"Sans réponse depuis 24 h",status:"draft",lastRun:null,
      steps:["Détecter les demandes en attente","Préparer la relance"]},
    {id:"wf-review",name:"Review Workflow",trigger:"Prestation terminée",status:"draft",lastRun:null,
      steps:["Détecter les prestations terminées","Préparer la demande d'avis"]}
  ];
  write(KEY.workflows, list);
  return list;
}

function seedSettings(){
  const existing = read(KEY.settings,null);
  if(existing && typeof existing === "object") return existing;
  const cfg = window.QUOTEGO_CONFIG;
  const demo = !!(cfg && cfg.business && cfg.business.demoMode);
  const settings = {
    integrations:{
      whatsapp:{connected:false,configured:false,number:(cfg && cfg.business && cfg.business.whatsapp)||"",note:demo?"Mode démo activé dans config.js":"Non connecté"},
      gcal:{connected:false,configured:false,calendar:"",note:"Non connecté"},
      email:{connected:false,configured:false,address:"",note:"Non connecté"},
      reviews:{connected:false,configured:false,link:"",note:"Non connecté"},
      website:{connected:false,configured:false,url:"",note:"Non connecté"},
      instagram:{connected:false,configured:false,handle:(cfg && cfg.business && cfg.business.instagram)||"",note:"Non connecté"}
    },
    notifications:{newRequests:true,bookingPending:true,automationAlerts:true}
  };
  write(KEY.settings, settings);
  return settings;
}

function seedBusiness(){
  const existing = read(KEY.business,null);
  if(existing && typeof existing === "object") return existing;
  const cfg = window.QUOTEGO_CONFIG;
  const business = {
    name:(cfg && cfg.business && cfg.business.name) || "QuoteGo Demo Company",
    shortName:(cfg && cfg.business && cfg.business.shortName) || "QuoteGo Demo",
    tagline:(cfg && cfg.business && cfg.business.tagline) || "Business Automation OS",
    currency:(cfg && cfg.business && cfg.business.currency) || "EUR",
    locale:(cfg && cfg.business && cfg.business.locale) || "fr-BE",
    plan:"PRO",
    industry:null,
    createdAt:new Date().toISOString()
  };
  write(KEY.business, business);
  return business;
}

function seedIfNeeded(){
  seedServices();
  seedAutomations();
  seedForms();
  seedWorkflows();
  seedSettings();
  seedBusiness();
  if(!read(KEY.journal,null)){
    journal("system","QuoteGo AI Studio initialisé");
  }
}

function serviceList(){ return seedServices(); }
function setServices(list){ write(KEY.services,list); }
function automationList(){ return seedAutomations(); }
function setAutomations(list){ write(KEY.automations,list); }
function bookingList(){ return read(KEY.bookings,[]); }
function setBookings(list){ write(KEY.bookings,list); }
function clientList(){ return read(KEY.clients,[]); }
function setClients(list){ write(KEY.clients,list); }
function formList(){ return seedForms(); }
function setForms(list){ write(KEY.forms,list); }
function workflowList(){ return seedWorkflows(); }
function setWorkflows(list){ write(KEY.workflows,list); }
function settings(){ return seedSettings(); }
function setSettings(v){ write(KEY.settings,v); }
function business(){ return seedBusiness(); }
function setBusiness(v){ write(KEY.business,v); }
function aiConfig(){ return read(KEY.ai,null); }
function setAiConfig(v){ write(KEY.ai,v); }
function journalList(){ return read(KEY.journal,[]); }
function onboarded(){ return !!read(KEY.onboarded,false); }
function setOnboarded(){ write(KEY.onboarded,true); }

function requestBookings(){
  return requests()
    .filter(r => ["pending","confirmed","done"].includes(r.status) && r.customer && r.customer.date)
    .map(r => ({
      id:"req-" + r.ref,
      source:"request",
      ref:r.ref,
      client:r.customer.name || "—",
      service:(r.package && r.package.label) || "—",
      date:r.customer.date,
      time:null,
      duration:null,
      status:r.status,
      createdAt:r.createdAt,
      estimate:Number(r.estimate)||0
    }));
}

function allBookings(){
  return bookingList().map(b => Object.assign({source:"manual"},b)).concat(requestBookings());
}

function derivedClients(){
  const map = new Map();
  clientList().forEach(c => {
    map.set((c.name||"").trim().toLowerCase(), {
      id:c.id, name:c.name, company:c.company||"", phone:c.phone||"", email:c.email||"",
      notes:c.notes||"", status:c.status||"active", manual:true,
      createdAt:c.createdAt, lastActivity:c.createdAt, requests:0, bookings:0, value:0
    });
  });
  requests().forEach(r => {
    const name = (r.customer && r.customer.name || "").trim();
    if(!name) return;
    const k = name.toLowerCase();
    const entry = map.get(k) || {
      id:"cli-" + k.replace(/\s+/g,"-"), name:name, company:"", phone:"", email:"", notes:"",
      status:"active", manual:false, createdAt:r.createdAt, lastActivity:r.createdAt,
      requests:0, bookings:0, value:0
    };
    entry.requests += 1;
    if(r.status !== "cancelled") entry.value += Number(r.estimate)||0;
    if(r.createdAt > entry.lastActivity) entry.lastActivity = r.createdAt;
    map.set(k, entry);
  });
  allBookings().forEach(b => {
    const k = (b.client||"").trim().toLowerCase();
    if(!k || k === "—") return;
    const entry = map.get(k) || {
      id:"cli-" + k.replace(/\s+/g,"-"), name:b.client, company:"", phone:"", email:"", notes:"",
      status:"active", manual:false, createdAt:b.createdAt||new Date().toISOString(),
      lastActivity:b.createdAt||new Date().toISOString(), requests:0, bookings:0, value:0
    };
    entry.bookings += 1;
    entry.value += Number(b.estimate)||0;
    if(entry.lastActivity < (b.createdAt||"")) entry.lastActivity = b.createdAt;
    map.set(k, entry);
  });
  return Array.from(map.values()).sort((a,b) => (b.lastActivity||"").localeCompare(a.lastActivity||""));
}

function metrics(){
  const reqs = requests();
  const books = allBookings();
  const today = new Date().toISOString().slice(0,10);
  return {
    requestsTotal:reqs.length,
    requestsToday:reqs.filter(r => (r.createdAt||"").slice(0,10) === today).length,
    requestsNew:reqs.filter(r => r.status === "new").length,
    requestsPending:reqs.filter(r => r.status === "pending").length,
    requestsConfirmed:reqs.filter(r => r.status === "confirmed").length,
    requestsDone:reqs.filter(r => r.status === "done").length,
    requestsCancelled:reqs.filter(r => r.status === "cancelled").length,
    estimatedValue:reqs.filter(r => r.status !== "cancelled").reduce((s,r) => s + (Number(r.estimate)||0),0),
    bookingsTotal:books.length,
    bookingsToday:books.filter(b => b.date === today).length,
    bookingsPending:books.filter(b => b.status === "pending").length,
    bookingsConfirmed:books.filter(b => b.status === "confirmed").length,
    bookingsDone:books.filter(b => b.status === "done").length,
    clients:derivedClients().length,
    automations:automationList(),
    automationsActive:automationList().filter(a => a.status === "active").length,
    automationsReady:automationList().filter(a => a.status === "ready").length,
    automationsPaused:automationList().filter(a => a.status === "paused").length
  };
}

QG.data = {
  KEY:KEY, STATUS_META:STATUS_META,
  read:read, write:write, uid:uid, journal:journal,
  requests:requests, saveRequests:saveRequests, updateRequestStatus:updateRequestStatus,
  deleteRequest:deleteRequest, notifyChange:notifyChange,
  services:serviceList, setServices:setServices,
  automations:automationList, setAutomations:setAutomations,
  bookings:bookingList, setBookings:setBookings, allBookings:allBookings,
  clients:clientList, setClients:setClients, derivedClients:derivedClients,
  forms:formList, setForms:setForms,
  workflows:workflowList, workflowList:workflowList, setWorkflows:setWorkflows,
  settings:settings, setSettings:setSettings,
  business:business, setBusiness:setBusiness,
  aiConfig:aiConfig, setAiConfig:setAiConfig,
  journalList:journalList, onboarded:onboarded, setOnboarded:setOnboarded,
  metrics:metrics, seedIfNeeded:seedIfNeeded
};
})();
