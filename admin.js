(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const SECTIONS = [
  {label:"01 — COMMAND CENTER",items:[{route:"dashboard",label:"Vue d'ensemble",icon:"grid"}]},
  {label:"02 — AI STUDIO",items:[
    {route:"ai-studio",label:"Assistant IA",icon:"sparkles"},
    {route:"builder",label:"Créer une automatisation",icon:"bolt"},
    {route:"automations",label:"Mes automatisations",icon:"flow"}]},
  {label:"03 — BUSINESS",items:[
    {route:"requests",label:"Demandes",icon:"inbox"},
    {route:"bookings",label:"Réservations",icon:"calendar"},
    {route:"calendar",label:"Calendrier",icon:"clock"},
    {route:"clients",label:"Clients",icon:"users"}]},
  {label:"04 — BUILD",items:[
    {route:"services",label:"Services",icon:"layers"},
    {route:"catalogue",label:"Catalogue",icon:"briefcase"},
    {route:"forms",label:"Formulaires",icon:"form"},
    {route:"workflows",label:"Workflows",icon:"flow"}]},
  {label:"05 — GROW",items:[
    {route:"analytics",label:"Statistiques",icon:"chart"},
    {route:"leads",label:"Leads",icon:"send"},
    {route:"reviews",label:"Avis clients",icon:"star"}]},
  {label:"06 — CONNECT",items:[
    {route:"integrations",label:"Intégrations",icon:"plug"},
    {route:"integration/whatsapp",label:"WhatsApp",icon:"phone"},
    {route:"integration/gcal",label:"Google Calendar",icon:"calendar"},
    {route:"integration/email",label:"Email",icon:"mail"}]},
  {label:"07 — ORGANISATION",items:[{route:"team",label:"Équipe & accès",icon:"users"}]},
  {label:"08 — SYSTEM",items:[
    {route:"settings",label:"Paramètres",icon:"settings"},
    {route:"security",label:"Sécurité",icon:"lock"},
    {route:"journal",label:"Journal",icon:"list"}]}
];

const MOBILE_ITEMS = [
  {route:"dashboard",label:"Home",icon:"grid"},
  {route:"ai-studio",label:"AI",icon:"sparkles"},
  {route:"bookings",label:"Planning",icon:"calendar"},
  {route:"clients",label:"Clients",icon:"users"},
  {route:"settings",label:"Plus",icon:"settings"}
];

const COMMANDS = [
  {label:"Aller au Command Center",hint:"Dashboard",route:"dashboard",icon:"grid"},
  {label:"Ouvrir AI Studio",hint:"Assistant",route:"ai-studio",icon:"sparkles"},
  {label:"Créer une automatisation",hint:"Builder",route:"builder",icon:"bolt"},
  {label:"Voir mes automatisations",hint:"Automations",route:"automations",icon:"flow"},
  {label:"Nouvelle réservation",hint:"Action",action:"new-booking",route:"bookings",icon:"calendar"},
  {label:"Ouvrir les réservations",hint:"Business",route:"bookings",icon:"calendar"},
  {label:"Ouvrir le calendrier",hint:"Business",route:"calendar",icon:"clock"},
  {label:"Rechercher un client",hint:"CRM",route:"clients",icon:"users"},
  {label:"Ajouter un service",hint:"Catalogue",action:"new-service",route:"services",icon:"plus"},
  {label:"Voir les demandes",hint:"Business",route:"requests",icon:"inbox"},
  {label:"Ouvrir les statistiques",hint:"Growth",route:"analytics",icon:"chart"},
  {label:"Voir les leads",hint:"Growth",route:"leads",icon:"send"},
  {label:"Ouvrir les formulaires",hint:"Build",route:"forms",icon:"form"},
  {label:"Ouvrir les workflows",hint:"Build",route:"workflows",icon:"flow"},
  {label:"Ouvrir les intégrations",hint:"Connect",route:"integrations",icon:"plug"},
  {label:"Équipe & accès",hint:"Organisation",route:"team",icon:"users"},
  {label:"Ouvrir les paramètres",hint:"System",route:"settings",icon:"settings"},
  {label:"Voir le journal",hint:"System",route:"journal",icon:"list"},
  {label:"Retour au site client",hint:"Demo",href:"index.html",icon:"globe"}
];

let currentRoute = "dashboard";
let currentParam = "";

function parseHash(){
  const raw = (location.hash || "").replace(/^#\/?/,"");
  const parts = raw.split("/").filter(Boolean);
  return {route:parts[0] || "dashboard",param:parts.slice(1).join("/")};
}

function go(route){
  location.hash = "#/" + route;
}

function viewFor(route){
  return (QG.views && QG.views[route]) || QG.views.dashboard;
}

function buildSidebar(){
  const host = document.getElementById("sidebar");
  const business = QG.data.business();
  host.innerHTML =
    '<div class="brand">'+
      '<div class="brand-logo">Q</div>'+
      '<div class="brand-text"><strong>QuoteGo AI Studio</strong><span>Business Automation OS</span></div>'+
      '<button class="icon-btn brand-close" data-nav-close aria-label="Fermer">'+ui().icon("x",16)+'</button>'+
    '</div>'+
    '<nav class="nav">'+SECTIONS.map(sec =>
      '<div class="nav-section"><span class="nav-label">'+ui().esc(sec.label)+'</span>'+
      sec.items.map(it =>
        '<button class="nav-item" data-go="'+it.route+'" data-nav="'+it.route+'">'+
        ui().icon(it.icon,16)+'<span>'+ui().esc(it.label)+'</span></button>').join("")+
      '</div>').join("")+
    '</nav>'+
    '<div class="side-foot">'+
      '<button class="biz-card" data-action="biz-switch">'+
        '<span class="biz-avatar">'+ui().initials(business.name)+'</span>'+
        '<div class="biz-info"><strong>'+ui().esc(business.name)+'</strong>'+
        '<small>Plan : '+ui().esc(business.plan)+'</small></div>'+
        ui().icon("chevron",14)+
      '</button>'+
      '<div class="user-row">'+
        '<span class="user-avatar">'+ui().initials(business.name)+'</span>'+
        '<div><strong>Admin</strong><small>QuoteGo AI Studio · v1.0</small></div>'+
        '<button class="icon-btn" data-action="user-menu" aria-label="Menu">'+ui().icon("settings",15)+'</button>'+
      '</div>'+
    '</div>';
}

function buildMobileNav(){
  const host = document.getElementById("mobileNav");
  host.innerHTML = MOBILE_ITEMS.map(it =>
    '<button class="mob-item" data-go="'+it.route+'" data-nav="'+it.route+'">'+
    ui().icon(it.icon,18)+'<span>'+ui().esc(it.label)+'</span></button>').join("");
}

function markActive(){
  document.querySelectorAll("[data-nav]").forEach(el => {
    const r = el.dataset.nav;
    el.classList.toggle("active", r === currentRoute || (r === "integrations" && currentRoute === "integration"));
  });
}

function renderHeader(){
  const view = viewFor(currentRoute);
  const business = QG.data.business();
  const m = QG.data.metrics();
  const alerts = m.requestsNew + m.bookingsPending + m.automationsReady;
  document.getElementById("pageTitle").textContent = view.title;
  document.getElementById("pageSub").textContent = view.subtitle || "";
  const badge = document.getElementById("notifBadge");
  badge.textContent = alerts;
  badge.style.display = alerts ? "grid" : "none";
  document.getElementById("headBiz").textContent = business.shortName || business.name;
}

let lastPaintKey = null;
let paintToken = 0;

function paintView(host,view){
  try{
    view.render(host,currentParam);
  }catch(err){
    host.innerHTML = ui().emptyState("Erreur de rendu","Cette section n'a pas pu être affichée : " + err.message,"");
    console.error(err);
  }
  ui().bindGlow(host);
  ui().stagger(host);
  animateCounters(host);
}

function runProgress(){
  const bar = document.getElementById("routeProgress");
  if(!bar) return;
  bar.classList.remove("run");
  void bar.offsetWidth;
  bar.classList.add("run");
  setTimeout(() => bar.classList.remove("run"),700);
}

function renderView(){
  const view = viewFor(currentRoute);
  const host = document.getElementById("view");
  const key = currentRoute + "/" + currentParam;
  const changed = key !== lastPaintKey;
  lastPaintKey = key;
  const token = ++paintToken;
  const paint = () => { if(token === paintToken) paintView(host,view); };
  if(changed && !ui().reduced()){
    host.innerHTML = ui().skeleton(6);
    runProgress();
    requestAnimationFrame(paint);
    setTimeout(paint,170);
  }else{
    paint();
  }
}

function animateCounters(scope){
  scope.querySelectorAll("[data-count]").forEach(el => {
    const target = Number(el.dataset.count) || 0;
    ui().countUp(el,target);
  });
  scope.querySelectorAll("[data-money]").forEach(el => {
    const target = Number(el.dataset.money) || 0;
    ui().countUp(el,target,{format:v => ui().money(v)});
  });
}

function refresh(){
  renderHeader();
  renderView();
  markActive();
  renderNotifications();
}

function route(){
  const hash = parseHash();
  currentRoute = hash.route;
  currentParam = hash.param;
  if(!QG.views[currentRoute]) currentRoute = "dashboard";
  refresh();
  closeDrawer();
  window.scrollTo({top:0,behavior:ui().reduced() ? "auto" : "smooth"});
  if(currentRoute === "ai-studio" && !QG.data.onboarded() && !sessionShownOnboarding){
    sessionShownOnboarding = true;
    setTimeout(() => onboarding.start(),420);
  }
}

let sessionShownOnboarding = false;

function closeDrawer(){
  document.body.classList.remove("nav-open");
}

function renderNotifications(){
  const m = QG.data.metrics();
  const items = [];
  if(m.requestsNew) items.push({icon:"inbox",title:m.requestsNew + " nouvelle" + (m.requestsNew>1?"s":"") + " demande" + (m.requestsNew>1?"s":""),sub:"À qualifier",route:"requests",tone:"cyan"});
  if(m.bookingsPending) items.push({icon:"calendar",title:m.bookingsPending + " réservation" + (m.bookingsPending>1?"s":"") + " à confirmer",sub:"Planning",route:"bookings",tone:"mint"});
  if(m.automationsReady) items.push({icon:"bolt",title:m.automationsReady + " automatisation" + (m.automationsReady>1?"s":"") + " à configurer",sub:"AI Studio",route:"automations",tone:"violet"});
  const host = document.getElementById("notifList");
  host.innerHTML = items.length ? items.map(i =>
    '<button class="notif-item" data-go="'+i.route+'"><span class="notif-dot '+i.tone+'"></span>'+
    '<div><strong>'+ui().esc(i.title)+'</strong><small>'+ui().esc(i.sub)+'</small></div></button>').join("")
    : '<div class="notif-empty">Aucune alerte. Tout est à jour.</div>';
}

function toggleNotifications(){
  document.getElementById("notifMenu").classList.toggle("show");
  document.getElementById("bizMenu").classList.remove("show");
}

function toggleBizMenu(){
  document.getElementById("bizMenu").classList.toggle("show");
  document.getElementById("notifMenu").classList.remove("show");
}

function buildBizMenu(){
  const business = QG.data.business();
  document.getElementById("bizMenu").innerHTML =
    '<div class="menu-head"><span class="eyebrow">ENTREPRISE ACTIVE</span></div>'+
    '<button class="menu-item active"><span class="biz-avatar sm">'+ui().initials(business.name)+'</span>'+
    '<div><strong>'+ui().esc(business.name)+'</strong><small>Plan '+ui().esc(business.plan)+' · active</small></div>'+
    ui().icon("check",14)+'</button>'+
    '<div class="menu-sep"></div>'+
    '<button class="menu-item" data-action="add-biz"><span class="biz-avatar sm plus">+</span>'+
    '<div><strong>Add business</strong><small>Multi-entreprise · Requires backend</small></div></button>';
}

function togglePanel(force){
  const panel = document.getElementById("aiPanel");
  const open = force != null ? force : !panel.classList.contains("show");
  panel.classList.toggle("show",open);
  document.body.classList.toggle("ai-open",open);
  if(open){
    const chat = document.getElementById("panelChat");
    QG.ai.mount(chat);
    setTimeout(() => { const i = chat.querySelector("[data-ai-input]"); if(i) i.focus(); },220);
  }
}
QG.openPanel = () => togglePanel(true);
QG.closePanel = () => togglePanel(false);

function buildPalette(){
  const list = document.getElementById("paletteList");
  const renderList = q => {
    const value = (q||"").toLowerCase();
    const data = COMMANDS.filter(c => !value || (c.label + " " + c.hint).toLowerCase().includes(value));
    list.innerHTML = data.length ? data.map((c,i) =>
      '<button class="pal-item'+(i===0?" sel":"")+'" data-cmd="'+ui().esc(c.label)+'">'+
      '<span class="pal-icon">'+ui().icon(c.icon,15)+'</span>'+
      '<span class="pal-label">'+ui().esc(c.label)+'</span>'+
      '<small>'+ui().esc(c.hint)+'</small></button>').join("")
      : '<div class="pal-empty">Aucune commande</div>';
    if(!data.length) list.dataset.empty = "1"; else delete list.dataset.empty;
    list._data = data;
  };
  const input = document.getElementById("paletteInput");
  input.addEventListener("input",() => renderList(input.value));
  input.addEventListener("keydown",e => {
    const items = Array.from(list.querySelectorAll(".pal-item"));
    if(!items.length) return;
    let idx = items.findIndex(x => x.classList.contains("sel"));
    if(e.key === "ArrowDown"){ e.preventDefault(); idx = Math.min(items.length-1,idx+1); }
    else if(e.key === "ArrowUp"){ e.preventDefault(); idx = Math.max(0,idx-1); }
    else if(e.key === "Enter"){ e.preventDefault(); if(items[idx]) items[idx].click(); return; }
    else return;
    items.forEach(x => x.classList.remove("sel"));
    items[idx].classList.add("sel");
    items[idx].scrollIntoView({block:"nearest"});
  });
  list.addEventListener("click",e => {
    const item = e.target.closest("[data-cmd]");
    if(!item) return;
    const cmd = COMMANDS.find(c => c.label === item.dataset.cmd);
    closePalette();
    if(!cmd) return;
    if(cmd.href){ window.open(cmd.href,"_blank"); return; }
    go(cmd.route);
    if(cmd.action) setTimeout(() => {
      const el = document.querySelector('[data-action="'+cmd.action+'"]');
      if(el) el.click();
    },120);
  });
  renderList("");
}

function openPalette(){
  const pal = document.getElementById("palette");
  pal.classList.add("show");
  const input = document.getElementById("paletteInput");
  input.value = "";
  input.dispatchEvent(new Event("input"));
  setTimeout(() => input.focus(),60);
}
function closePalette(){ document.getElementById("palette").classList.remove("show"); }

const onboarding = {
  step:0,
  steps:[
    {n:"01",title:"Business",copy:"Votre activité, votre nom, votre secteur.",route:"settings"},
    {n:"02",title:"Services",copy:"Prestations, prix et durées de votre catalogue.",route:"services"},
    {n:"03",title:"Availability",copy:"Jours d'ouverture, horaires et temps entre rendez-vous.",route:"ai-studio"},
    {n:"04",title:"Automation",copy:"Réservation, devis, relance et avis automatiques.",route:"automations"},
    {n:"05",title:"Launch",copy:"Activez votre système et suivez tout depuis le Command Center.",route:"dashboard"}
  ],
  start(){
    this.step = 0;
    this.render();
    document.getElementById("onboarding").classList.add("show");
  },
  close(){
    document.getElementById("onboarding").classList.remove("show");
  },
  next(){
    if(this.step >= this.steps.length - 1){
      QG.data.setOnboarded();
      this.close();
      ui().toast("QuoteGo AI Studio est prêt ✦");
      go("ai-studio");
      return;
    }
    this.step++;
    this.render();
  },
  back(){
    if(this.step === 0){ this.close(); return; }
    this.step--;
    this.render();
  },
  render(){
    const step = this.steps[this.step];
    const pct = Math.round((this.step+1)/this.steps.length*100);
    document.getElementById("onboarding").innerHTML =
      '<div class="onb-card">'+
        '<div class="onb-top">'+
          '<div class="brand-logo lg">Q</div>'+
          '<div><span class="eyebrow">WELCOME TO QUOTEGO AI STUDIO</span>'+
          '<h2>Let\'s build your business automation.</h2></div>'+
        '</div>'+
        '<div class="onb-progress"><i style="width:'+pct+'%"></i></div>'+
        '<div class="onb-steps">'+this.steps.map((s,i) =>
          '<div class="onb-step'+(i===this.step?" on":"")+(i<this.step?" done":"")+'">'+
          '<span>'+s.n+'</span><strong>'+ui().esc(s.title)+'</strong></div>').join("")+'</div>'+
        '<div class="onb-body">'+
          '<span class="onb-num">'+step.n+'</span>'+
          '<h3>'+ui().esc(step.title)+'</h3>'+
          '<p>'+ui().esc(step.copy)+'</p>'+
        '</div>'+
        '<div class="onb-actions">'+
          '<button class="btn btn-ghost" data-onb="skip">Passer</button>'+
          '<div class="onb-nav">'+
            (this.step > 0 ? '<button class="btn btn-ghost" data-onb="back">Retour</button>' : '')+
            '<button class="btn btn-primary" data-onb="next">'+(this.step === this.steps.length-1 ? "Lancer le studio" : "Continuer")+ui().icon("arrow",14)+'</button>'+
          '</div>'+
        '</div>'+
      '</div>';
  }
};
QG.onboarding = onboarding;

function isField(el){
  return !!el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
}

function handleAction(action,target){
  const view = viewFor(currentRoute);
  if(view && view.handle){
    try{ view.handle(document.getElementById("view"),action,target); }catch(e){ console.error(e); }
  }
}

function bindGlobal(){
  document.addEventListener("click",e => {
    const goBtn = e.target.closest("[data-go]");
    if(goBtn){ go(goBtn.dataset.go); return; }

    const onb = e.target.closest("[data-onb]");
    if(onb){
      const k = onb.dataset.onb;
      if(k === "skip"){ QG.data.setOnboarded(); onboarding.close(); }
      else if(k === "next") onboarding.next();
      else if(k === "back") onboarding.back();
      return;
    }

    const act = e.target.closest("[data-action]");
    if(e.target.closest("#notifBtn")){ toggleNotifications(); return; }
    if(e.target.closest("[data-action='biz-switch']")){ toggleBizMenu(); return; }
    if(e.target.closest("[data-action='user-menu']")){ go("settings"); return; }
    if(e.target.closest("[data-action='add-biz']")){ ui().toast("Multi-entreprise · Requires backend"); return; }
    if(e.target.closest("#paletteBtn")){ openPalette(); return; }
    if(e.target.closest("#aiFab") || e.target.closest("#panelBtn")){ togglePanel(); return; }
    if(e.target.closest("#panelClose")){ togglePanel(false); return; }
    if(e.target.closest("#hamburger")){ document.body.classList.toggle("nav-open"); return; }
    if(e.target.closest("#palette .pal-backdrop")){ closePalette(); return; }
    if(e.target.closest("[data-nav-close]")){ closeDrawer(); return; }
    if(act && !act.closest("#view") && !isField(act)){ handleAction(act.dataset.action,act); }
    if(!e.target.closest("#notifMenu") && !e.target.closest("#notifBtn")) document.getElementById("notifMenu").classList.remove("show");
    if(!e.target.closest("#bizMenu") && !e.target.closest("[data-action='biz-switch']")) document.getElementById("bizMenu").classList.remove("show");
  });

  document.addEventListener("click",e => {
    const act = e.target.closest("#view [data-action]");
    if(act && !isField(act)) handleAction(act.dataset.action,act);
  });

  document.addEventListener("input",e => {
    const act = e.target.closest("#view [data-action]");
    if(act && isField(act)) handleAction(act.dataset.action,act);
  });

  document.addEventListener("change",e => {
    const act = e.target.closest("#view [data-action]");
    if(act && isField(act)) handleAction(act.dataset.action,act);
  });

  document.addEventListener("keydown",e => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
      e.preventDefault();
      document.getElementById("palette").classList.contains("show") ? closePalette() : openPalette();
    }
    if(e.key === "Escape"){
      closePalette();
      closeDrawer();
      togglePanel(false);
      document.getElementById("notifMenu").classList.remove("show");
      document.getElementById("bizMenu").classList.remove("show");
      if(QG.closeRequest) QG.closeRequest();
    }
  });

  window.addEventListener("hashchange",route);

  window.addEventListener("storage",e => {
    if(e.key && (e.key.startsWith("quotego_"))) refresh();
  });

  try{
    const channel = new BroadcastChannel("quotego_admin");
    channel.onmessage = () => refresh();
  }catch(e){}
}

function init(){
  QG.data.seedIfNeeded();
  buildSidebar();
  buildMobileNav();
  buildBizMenu();
  buildPalette();
  bindGlobal();
  QG.go = go;
  QG.refresh = refresh;
  route();
  const m = QG.data.metrics();
  if(m.requestsNew || m.bookingsPending){
    setTimeout(() => ui().toast("QuoteGo AI Studio · " + (m.requestsNew + m.bookingsPending) + " éléments à traiter"),700);
  }
}

document.addEventListener("DOMContentLoaded",init);
})();
