(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const state = {
  messages:[],
  step:"idle",
  draft:null,
  typing:false,
  mounts:[],
  started:false
};

let mid = 0;
function push(role,kind,html,meta){
  state.messages.push(Object.assign({id:"m"+(++mid),role:role,kind:kind,html:html},meta||{}));
}

function greeting(){
  push("ai","text",
    '<strong>Bonjour 👋</strong><br>Expliquez-moi simplement votre activité. Je vais vous aider à construire votre automatisation.');
  push("ai","suggest","",{
    suggestions:["Je suis coiffeur","Je gère un restaurant","Je fais du detailing","Je suis jardinier"]
  });
  state.step = "idle";
}

function suggestionsHtml(list){
  return '<div class="ai-suggestions">'+list.map(s =>
    '<button class="ai-chip" data-ai-action="suggest" data-value="'+ui().esc(s)+'">'+ui().esc(s)+'</button>'
  ).join("")+'</div>';
}

function textMsg(html,suggestions){
  push("ai",suggestions?"suggest":"text",html,suggestions?{suggestions:suggestions}:null);
}

function servicesMsg(){
  const d = state.draft;
  push("ai","services","",{services:d.services.map(s => s.name)});
}

function detailsMsg(){
  push("ai","details","");
}

function scheduleMsg(){
  push("ai","schedule","");
}
function teamMsg(){
  push("ai","team","");
}
function readyMsg(){
  push("ai","ready","");
}

function busy(ms){
  state.typing = true;
  render();
  return new Promise(res => setTimeout(() => { state.typing = false; res(); }, ui().reduced() ? 80 : (ms||520)));
}

async function send(text){
  const value = String(text||"").trim();
  if(!value || state.typing) return;
  push("user","text",ui().esc(value));
  render();
  await busy(480);
  await respond(value);
  render();
}

async function respond(value){
  if(state.step === "idle"){
    const key = ui() && QG.templates.detect(value);
    if(key){
      state.draft = QG.templates.defaultConfig(key);
      const tpl = QG.templates.get(key);
      textMsg("Parfait. Construisons votre système de " + ui().esc(tpl.bookingLabel) + ".<br><span class=\"ai-dim\">Template détecté · " + ui().esc(tpl.title) + "</span>");
      servicesMsg();
      state.step = "services";
      return;
    }
    if(/\?|comment|combien|prix|tarif|aide|help|fonction/.test(value.toLowerCase())){
      textMsg("Je suis l'assistant QuoteGo AI. Je construis des automatisations métier : réservations, devis, relances et avis.<br>Décrivez votre activité en une phrase, par exemple « Je suis coiffeur ».",["Je suis coiffeur","Je gère un restaurant","Je fais du detailing"]);
      return;
    }
    textMsg("Je n'ai pas reconnu votre métier. Reformulez avec vos mots, ou choisissez un exemple :",["Je suis coiffeur","Je gère un restaurant","Je fais du detailing","Je suis jardinier"]);
    return;
  }
  if(state.step === "services"){
    const parts = value.split(/[,;+]| et /).map(s => s.trim()).filter(Boolean);
    parts.forEach(name => {
      if(!state.draft.services.find(s => s.name.toLowerCase() === name.toLowerCase()))
        state.draft.services.push({name:name,price:0,duration:30,selected:true});
    });
    state.step = "details";
    textMsg("Noté. Vérifions les prix et les durées.");
    detailsMsg();
    return;
  }
  textMsg("Utilisez les boutons ci-dessus pour continuer la configuration.");
}

function toggleService(index){
  const s = state.draft && state.draft.services[index];
  if(!s) return;
  s.selected = !s.selected;
  render();
}

function addService(name){
  const n = String(name||"").trim();
  if(!n || !state.draft) return;
  state.draft.services.push({name:n,price:0,duration:30,selected:true});
  render();
}

function confirmDetails(container){
  const inputs = container.querySelectorAll("[data-svc]");
  inputs.forEach(row => {
    const i = Number(row.dataset.svc);
    const svc = state.draft.services[i];
    if(!svc) return;
    const price = row.querySelector('[data-field="price"]');
    const dur = row.querySelector('[data-field="duration"]');
    const chk = row.querySelector('[data-field="selected"]');
    if(price) svc.price = Math.max(0,Number(price.value)||0);
    if(dur) svc.duration = Math.max(5,Number(dur.value)||15);
    if(chk) svc.selected = chk.checked;
  });
  state.step = "schedule";
  push("ai","text","Excellent. Passons à vos disponibilités.");
  scheduleMsg();
  render();
}

const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function confirmSchedule(container){
  const d = state.draft;
  const days = Array.from(container.querySelectorAll('[data-day].on')).map(el => el.dataset.day);
  if(days.length) d.days = days;
  const open = container.querySelector('[data-field="open"]');
  const close = container.querySelector('[data-field="close"]');
  const pStart = container.querySelector('[data-field="pauseStart"]');
  const pEnd = container.querySelector('[data-field="pauseEnd"]');
  const buffer = container.querySelector('[data-field="buffer"]');
  if(open) d.open = open.value || d.open;
  if(close) d.close = close.value || d.close;
  if(pStart && pEnd) d.pause = (pStart.value && pEnd.value) ? (pStart.value + "-" + pEnd.value) : "";
  if(buffer) d.buffer = Math.max(0,Number(buffer.value)||0);
  state.step = "team";
  push("ai","text","Dernière étape : l'équipe et le mode de validation.");
  teamMsg();
  render();
}

function confirmTeam(container){
  const d = state.draft;
  const emp = container.querySelector('[data-emp].on');
  const mode = container.querySelector('[data-mode].on');
  if(emp) d.employees = Number(emp.dataset.emp);
  if(mode) d.mode = mode.dataset.mode;
  generate();
}

function generate(){
  const d = state.draft;
  d.services = d.services.filter(s => s.selected);
  state.step = "ready";
  push("ai","text","Configuration générée. Voici votre automatisation.");
  readyMsg();
  render();
}

function summaryRows(){
  const d = state.draft;
  const rows = [
    ["Business type", (QG.templates.get(d.industry).label) || d.industry],
    ["Services", String(d.services.length)],
    ["Booking", d.mode === "auto" ? "Enabled" : "Enabled · validation manuelle"],
    ["Schedule", d.days.length + " jours · " + d.open + "–" + d.close],
    ["Notifications", "Ready"]
  ];
  return rows.map(r => '<div class="ready-row"><span>'+ui().esc(r[0])+'</span><strong>'+ui().esc(r[1])+'</strong></div>').join("");
}

function previewModal(){
  const d = state.draft;
  const body = '<div class="preview-shell"><div class="preview-head"><span class="eyebrow">APERÇU PUBLIC</span>'+
    '<h4>'+ui().esc(QG.templates.get(d.industry).title)+'</h4><p>Formulaire de '+ui().esc(QG.templates.get(d.industry).bookingLabel)+'</p></div>'+
    '<div class="preview-fields">'+
    d.fields.map((f,i) => '<label class="field"><span>'+ui().esc(f)+'</span><input class="input" '+(i===0?'value="Jean Dupont"':'placeholder="'+ui().esc(f)+'"')+'></label>').join("")+
    '</div>'+
    '<div class="preview-services"><span class="eyebrow">SERVICES</span>'+
    d.services.map(s => '<div class="preview-svc"><span>'+ui().esc(s.name)+'</span><b>'+ui().money(s.price)+' · '+s.duration+' min</b></div>').join("")+
    '</div>'+
    '<p class="honest-note">Aperçu local. L\'envoi réel nécessite un backend.</p></div>';
  ui().modal({eyebrow:"AUTOMATION",title:"Preview Automation",body:body});
}

function activate(){
  const d = state.draft;
  if(!d) return;
  d.activatedAt = new Date().toISOString();
  d.active = true;
  QG.data.setAiConfig(d);

  const services = QG.data.services();
  d.services.forEach(s => {
    if(!services.find(x => x.name.toLowerCase() === String(s.name).toLowerCase())){
      services.push({
        id:QG.data.uid("svc"), name:s.name, description:"Créé par QuoteGo AI",
        price:Number(s.price)||0, duration:Number(s.duration)||30,
        category:QG.templates.get(d.industry).label, active:true,
        createdAt:new Date().toISOString()
      });
    }
  });
  QG.data.setServices(services);

  const autos = QG.data.automations();
  QG.data.setAutomations(autos.map(a => {
    if(a.key === "booking") return Object.assign({},a,{status:"active",stats:{bookings:QG.data.metrics().bookingsTotal,conversion:0}});
    return a;
  }));

  const business = QG.data.business();
  business.industry = d.industry;
  business.industryLabel = QG.templates.get(d.industry).label;
  QG.data.setBusiness(business);

  QG.data.journal("automation","Automatisation activée · " + (QG.templates.get(d.industry).label));
  ui().toast("Automatisation activée");

  push("ai","text",
    '<span class="ai-ok">✓ AUTOMATION READY</span><br>Votre système de ' + ui().esc(QG.templates.get(d.industry).bookingLabel) +
    ' est configuré localement. Il apparaît dans Mes automatisations.',
    ["Ouvrir le calendrier","Voir mes automatisations"]);
}

function reset(){
  state.messages = [];
  state.draft = null;
  greeting();
  render();
}

function handleMessageAction(action,value,container){
  switch(action){
    case "suggest": send(value); break;
    case "toggle-service": toggleService(Number(value)); break;
    case "add-service": {
      const wrap = container.querySelector("[data-add-slot]");
      if(!wrap) return;
      wrap.innerHTML = '<input class="input ai-inline-input" placeholder="Nom du service" data-new-service>'+
        '<button class="btn btn-primary btn-sm" data-ai-action="add-service-confirm">Ajouter</button>';
      const inp = wrap.querySelector("[data-new-service]");
      inp.focus();
      break;
    }
    case "add-service-confirm": {
      const inp = container.querySelector("[data-new-service]");
      addService(inp ? inp.value : "");
      break;
    }
    case "services-next": {
      const selected = state.draft.services.filter(s => s.selected);
      if(!selected.length){ ui().toast("Sélectionnez au moins un service"); return; }      state.step = "details";
      push("ai","text","Parfait. Fixons les prix et les durées.");
      detailsMsg();
      render();
      break;
    }
    case "details-confirm": confirmDetails(container); break;
    case "schedule-confirm": confirmSchedule(container); break;
    case "team-confirm": confirmTeam(container); break;
    case "preview": previewModal(); break;
    case "activate": activate(); render(); break;
    case "reset": reset(); break;
    case "go": if(QG.go) QG.go(value); break;
  }
}

function messageHtml(m){
  if(m.role === "user"){
    return '<div class="ai-msg user" id="'+m.id+'"><div class="ai-bubble">'+m.html+'</div></div>';
  }
  if(m.kind === "suggest"){
    return '<div class="ai-msg" id="'+m.id+'"><div class="ai-avatar">✦</div><div class="ai-bubble">'+m.html+suggestionsHtml(m.suggestions||[])+'</div></div>';
  }
  let body = "";
  if(m.kind === "text") body = '<div class="ai-bubble">'+m.html+'</div>';
  else if(m.kind === "services") body = '<div class="ai-bubble"><div class="ai-card">'+
      '<div class="ai-card-title">Quels services proposez-vous ?</div>'+
      '<div class="chips">'+ (state.draft ? state.draft.services.map((s,i) =>
        '<button class="ai-chip'+(s.selected?" on":"")+'" data-ai-action="toggle-service" data-value="'+i+'">'+ui().esc(s.name)+
        (s.price ? ' <b>'+ui().money(s.price)+'</b>' : '')+'</button>').join("") : '')+
      '<button class="ai-chip add" data-ai-action="add-service">+ Ajouter un service</button>'+
      '<span data-add-slot class="add-slot"></span></div>'+
      '<div class="ai-card-foot"><button class="btn btn-primary btn-sm" data-ai-action="services-next">Continuer '+ui().icon("arrow",14)+'</button></div>'+
      '</div></div>';
  else if(m.kind === "details") body = '<div class="ai-bubble"><div class="ai-card">'+
      '<div class="ai-card-title">Prix et durée</div>'+
      '<div class="svc-rows">'+(state.draft ? state.draft.services.map((s,i) =>
        '<div class="svc-row" data-svc="'+i+'">'+
        '<label class="svc-check"><input type="checkbox" data-field="selected" '+(s.selected?"checked":"")+'><span>'+ui().esc(s.name)+'</span></label>'+
        '<label class="svc-num"><input class="input" data-field="price" type="number" min="0" value="'+(s.price||0)+'"><em>€</em></label>'+
        '<label class="svc-num"><input class="input" data-field="duration" type="number" min="5" value="'+(s.duration||30)+'"><em>min</em></label>'+
        '</div>').join("") : '')+'</div>'+
      '<div class="ai-card-foot"><button class="btn btn-primary btn-sm" data-ai-action="details-confirm">Valider '+ui().icon("arrow",14)+'</button></div>'+
      '</div></div>';
  else if(m.kind === "schedule"){
    const d = state.draft || {};
    const hours = [];
    for(let h=6;h<=23;h++){ hours.push(String(h).padStart(2,"0")+":00"); hours.push(String(h).padStart(2,"0")+":30"); }
    const pause = String(d.pause||"").split("-");
    body = '<div class="ai-bubble"><div class="ai-card">'+
      '<div class="ai-card-title">Disponibilités</div>'+
      '<div class="chips">'+DAYS.map(day =>
        '<button class="ai-chip'+((d.days||[]).includes(day)?" on":"")+'" data-day="'+day+'">'+day+'</button>').join("")+'</div>'+
      '<div class="grid2">'+
      ui().field("Ouverture",'<select class="input" data-field="open">'+hours.map(h => '<option '+(h===d.open?"selected":"")+'>'+h+'</option>').join("")+'</select>')+
      ui().field("Fermeture",'<select class="input" data-field="close">'+hours.map(h => '<option '+(h===d.close?"selected":"")+'>'+h+'</option>').join("")+'</select>')+
      ui().field("Pause début",'<input class="input" type="time" data-field="pauseStart" value="'+ui().esc(pause[0]||"")+'">')+
      ui().field("Pause fin",'<input class="input" type="time" data-field="pauseEnd" value="'+ui().esc(pause[1]||"")+'">')+
      ui().field("Temps entre RDV (min)",'<input class="input" type="number" min="0" data-field="buffer" value="'+ui().esc(d.buffer==null?10:d.buffer)+'">')+
      '</div>'+
      '<div class="ai-card-foot"><button class="btn btn-primary btn-sm" data-ai-action="schedule-confirm">Continuer '+ui().icon("arrow",14)+'</button></div>'+
      '</div></div>';
  }
  else if(m.kind === "team"){
    const d = state.draft || {};
    body = '<div class="ai-bubble"><div class="ai-card">'+
      '<div class="ai-card-title">Équipe et validation</div>'+
      '<div class="chips">'+[1,2,3,4,6].map(n =>
        '<button class="ai-chip'+(Number(d.employees)===n?" on":"")+'" data-emp="'+n+'">'+n+' employé'+(n>1?"s":"")+'</button>').join("")+'</div>'+
      '<div class="chips">'+
      '<button class="ai-chip'+(d.mode==="auto"?" on":"")+'" data-mode="auto">Réservation automatique</button>'+
      '<button class="ai-chip'+(d.mode==="manual"?" on":"")+'" data-mode="manual">Validation manuelle</button></div>'+
      '<div class="ai-card-foot"><button class="btn btn-primary btn-sm" data-ai-action="team-confirm">Générer l\'automatisation</button></div>'+
      '</div></div>';
  }
  else if(m.kind === "ready"){
    body = '<div class="ai-bubble"><div class="ready-card">'+
      '<div class="ready-head"><span class="ready-dot"></span><strong>AUTOMATION READY</strong></div>'+
      summaryRows()+
      '<div class="ready-actions">'+
      '<button class="btn btn-ghost btn-sm" data-ai-action="preview">'+ui().icon("eye",14)+' Preview Automation</button>'+
      '<button class="btn btn-primary btn-sm" data-ai-action="activate">'+ui().icon("bolt",14)+' Activate</button>'+
      '</div></div></div>';
  }
  const typing = state.typing && m === state.messages[state.messages.length-1];
  return '<div class="ai-msg" id="'+m.id+'"><div class="ai-avatar">✦</div>'+body+'</div>';
}

function composerHtml(){
  return '<div class="ai-composer">'+
    '<input class="ai-input" placeholder="Décrivez votre entreprise..." data-ai-input>'+
    '<button class="ai-send" data-ai-send aria-label="Envoyer">'+ui().icon("send",16)+'</button>'+
    '</div>';
}

function renderInto(container){
  const body = container.querySelector(".ai-msgs");
  const composer = container.querySelector(".ai-composer-slot");
  if(!body) return;
  body.innerHTML = state.messages.map(messageHtml).join("") +
    (state.typing ? '<div class="ai-msg"><div class="ai-avatar">✦</div><div class="ai-bubble typing"><span></span><span></span><span></span></div></div>' : '');
  if(composer && !composer.dataset.built){
    composer.dataset.built = "1";
    composer.innerHTML = composerHtml();
    const input = composer.querySelector("[data-ai-input]");
    const sendBtn = composer.querySelector("[data-ai-send]");
    const doSend = () => { const v = input.value; input.value = ""; send(v); };
    sendBtn.addEventListener("click",doSend);
    input.addEventListener("keydown",e => { if(e.key === "Enter") doSend(); });
  }
  body.scrollTop = body.scrollHeight;
}

function render(){
  state.mounts = state.mounts.filter(c => document.body.contains(c));
  state.mounts.forEach(renderInto);
}

function bindActions(container){
  if(container.dataset.aiBound) return;
  container.dataset.aiBound = "1";
  container.addEventListener("click",e => {
    const dayBtn = e.target.closest("[data-day]");
    if(dayBtn){ dayBtn.classList.toggle("on"); return; }
    const empBtn = e.target.closest("[data-emp]");
    if(empBtn){
      container.querySelectorAll("[data-emp]").forEach(b => b.classList.remove("on"));
      empBtn.classList.add("on"); return;
    }
    const modeBtn = e.target.closest("[data-mode]");
    if(modeBtn){
      container.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("on"));
      modeBtn.classList.add("on"); return;
    }
    const btn = e.target.closest("[data-ai-action]");
    if(btn && container.contains(btn)){
      handleMessageAction(btn.dataset.aiAction,btn.dataset.value,container);
    }
  });
}

function mount(container){
  if(!container) return;
  container.classList.add("ai-chat");
  if(!container.querySelector(".ai-msgs")){
    container.innerHTML = '<div class="ai-msgs"></div><div class="ai-composer-slot"></div>';
  }
  bindActions(container);
  if(!state.started){ greeting(); state.started = true; }
  if(!state.mounts.includes(container)) state.mounts.push(container);
  renderInto(container);
}

function isConfigured(){
  return !!QG.data.aiConfig();
}

function renderStudio(host){
  const cfg = QG.data.aiConfig();
  const business = QG.data.business();
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">02 — AI STUDIO</span><h1>QuoteGo AI</h1>'+
      '<p>Automation Architect · décrivez votre activité, je construis votre système.</p></div>'+
      '<div class="head-actions">'+
        '<span class="status-pill ok"><i></i>Online</span>'+
        (cfg ? '<button class="btn btn-ghost" data-action="ai-reset">Nouvelle conversation</button>' : '')+
      '</div>'+
    '</div>'+
    '<div class="studio-layout" data-stagger>'+
      '<aside class="studio-side">'+
        '<div class="studio-card">'+
          '<div class="studio-ai">'+ui().icon("sparkles",20)+'<div><strong>QuoteGo AI</strong><span>Automation Architect</span></div></div>'+
          '<div class="studio-status"><span class="pulse-dot"></span> Online · assistant local</div>'+
          '<p class="studio-copy">Aucune API externe n\'est utilisée : l\'assistant fonctionne avec des règles métier locales et vos templates.</p>'+
        '</div>'+
        (cfg ? '<div class="studio-card">'+
          '<span class="eyebrow">CONFIGURATION ACTIVE</span>'+
          '<div class="ready-rows">'+
            readyRow("Business",QG.templates.get(cfg.industry).label)+
            readyRow("Services",String((cfg.services||[]).length))+
            readyRow("Booking",cfg.active ? "Enabled" : "Brouillon")+
            readyRow("Schedule",(cfg.days||[]).length + " jours · " + cfg.open + "–" + cfg.close)+
          '</div>'+
          '<div class="studio-links">'+
            '<button class="btn btn-ghost btn-sm" data-go="automations">'+ui().icon("flow",14)+' Mes automatisations</button>'+
            '<button class="btn btn-ghost btn-sm" data-go="calendar">'+ui().icon("calendar",14)+' Calendrier</button>'+
            '<button class="btn btn-ghost btn-sm" data-go="services">'+ui().icon("layers",14)+' Services</button>'+
          '</div>'+
        '</div>' : '<div class="studio-card">'+
          '<span class="eyebrow">DÉMARRAGE</span>'+
          '<ol class="mini-steps">'+
            ["Business","Services","Availability","Automation","Launch"].map((s,i) =>
              '<li><span>0'+(i+1)+'</span>'+s+'</li>').join("")+
          '</ol>'+
          '<button class="btn btn-primary btn-sm btn-block" data-action="onboarding">'+ui().icon("bolt",14)+' Welcome to QuoteGo AI Studio</button>'+
        '</div>')+
      '</aside>'+
      '<section class="studio-chat-panel" id="studioChat"></section>'+
    '</div>';
  const chat = host.querySelector("#studioChat");
  if(chat) mount(chat);
  ui().bindGlow(host);
}

function readyRow(k,v){
  return '<div class="ready-row"><span>'+ui().esc(k)+'</span><strong>'+ui().esc(v)+'</strong></div>';
}

function handleStudio(host,action){
  if(action === "ai-reset"){ reset(); ui().toast("Conversation réinitialisée"); return; }
  if(action === "onboarding" && QG.onboarding) QG.onboarding.start();
}

QG.views = QG.views || {};
QG.views["ai-studio"] = {title:"QuoteGo AI",subtitle:"Assistant & Automation Architect",render:renderStudio,handle:handleStudio};
QG.views.builder = {title:"AI Business Builder",subtitle:"Construction guidée",render:renderStudio,handle:handleStudio};

QG.ai = {
  state:state, mount:mount, render:render, send:send, reset:reset,
  isConfigured:isConfigured, activate:activate, handleMessageAction:handleMessageAction
};
})();
