(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const INTEGRATIONS = [
  {key:"whatsapp",name:"WhatsApp",icon:"phone",desc:"Envoyer confirmations et relances via WhatsApp."},
  {key:"gcal",name:"Google Calendar",icon:"calendar",desc:"Synchroniser les disponibilités et les rendez-vous."},
  {key:"email",name:"Email",icon:"mail",desc:"Notifications et confirmations par e-mail."},
  {key:"reviews",name:"Google Reviews",icon:"star",desc:"Demander automatiquement des avis après prestation."},
  {key:"website",name:"Website",icon:"globe",desc:"Publier votre formulaire de réservation sur votre site."},
  {key:"instagram",name:"Instagram",icon:"instagram",desc:"Centraliser les messages Instagram en demandes."}
];

function settings(){ return QG.data.settings(); }

function renderIntegrations(host){
  const s = settings();
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">06 — CONNECT</span><h1>Intégrations</h1>'+
      '<p>Connectez QuoteGo AI Studio à vos outils. Chaque statut est affiché honnêtement.</p></div>'+
    '</div>'+
    '<div class="int-grid">'+INTEGRATIONS.map(it => {
      const conf = s.integrations[it.key] || {};
      const connected = !!conf.connected;
      return '<article class="int-card glow-card'+(connected?" on":"")+'" data-stagger>'+
        '<div class="int-top"><span class="int-icon">'+ui().icon(it.icon,18)+'</span>'+
        '<span class="status-pill '+(connected?"ok":"muted")+'"><i></i>'+(connected?"Connected":"Not connected")+'</span></div>'+
        '<h3>'+ui().esc(it.name)+'</h3><p>'+ui().esc(it.desc)+'</p>'+
        (conf.note ? '<small class="int-note">'+ui().esc(conf.note)+'</small>' : '')+
        '<div class="int-actions"><button class="btn btn-ghost btn-sm" data-action="int-open" data-id="'+it.key+'">'+
        ui().icon("settings",14)+' Configure</button>'+
        (connected ? '<button class="btn btn-ghost btn-sm danger" data-action="int-off" data-id="'+it.key+'">Déconnecter</button>' : '')+
        '</div></article>';
    }).join("")+'</div>'+
    '<p class="honest-note" data-stagger>Aucun connecteur n\'est actif en production : QuoteGo est une démo statique sans backend. "Connected" ne sera affiché que si un connecteur réel est branché.</p>';
}

function integrationDetail(host,key){
  const it = INTEGRATIONS.find(x => x.key === key);
  if(!it){ QG.go("integrations"); return; }
  const s = settings();
  const conf = s.integrations[key] || {};
  const fields = {
    whatsapp:ui().field("Numéro WhatsApp",'<input class="input" name="value" value="'+ui().esc(conf.number||"")+'" placeholder="+32…">'),
    gcal:ui().field("Nom du calendrier",'<input class="input" name="value" value="'+ui().esc(conf.calendar||"")+'" placeholder="Principal">'),
    email:ui().field("Adresse d\'envoi",'<input class="input" name="value" value="'+ui().esc(conf.address||"")+'" placeholder="contact@…">'),
    reviews:ui().field("Lien d\'avis",'<input class="input" name="value" value="'+ui().esc(conf.link||"")+'" placeholder="https://g.page/…">'),
    website:ui().field("URL du site",'<input class="input" name="value" value="'+ui().esc(conf.url||"")+'" placeholder="https://…">'),
    instagram:ui().field("Compte Instagram",'<input class="input" name="value" value="'+ui().esc(conf.handle||"")+'" placeholder="@…">')
  };
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><button class="crumb" data-go="integrations">'+ui().icon("back",14)+' Intégrations</button>'+
      '<h1>'+ui().esc(it.name)+'</h1><p>'+ui().esc(it.desc)+'</p></div>'+
      '<div class="head-actions"><span class="status-pill '+(conf.connected?"ok":"muted")+'"><i></i>'+
      (conf.connected?"Connected":"Not connected")+'</span></div>'+
    '</div>'+
    '<div class="panel narrow" data-stagger>'+
      '<div class="panel-head"><div><h2>Configuration locale</h2><p>Enregistrée dans ce navigateur uniquement</p></div></div>'+
      '<div class="panel-body">'+(fields[key]||"")+
      '<div class="switch-row"><input type="checkbox" id="int-enabled" '+(conf.configured?"checked":"")+'><label for="int-enabled">Marquer comme configuré</label></div>'+
      '<div class="head-actions"><button class="btn btn-primary" data-action="int-save" data-id="'+key+'">Enregistrer</button></div>'+
      '<p class="honest-note">Requires backend : la connexion réelle à '+ui().esc(it.name)+' nécessite un service serveur et des identifiants. Aucun secret n\'est stocké ici.</p>'+
      '</div>'+
    '</div>';
}

function renderTeam(host){
  const rows = [
    ["Owner","Tous accès","non connecté"],
    ["Admin","Presque tous les accès","non connecté"],
    ["Staff","Réservations, clients, catalogue","non connecté"]
  ];
  const perms = ["Dashboard","Bookings","Clients","Catalog","Settings"];
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">07 — ORGANISATION</span><h1>Équipe & accès</h1>'+
      '<p>Structure des rôles et des permissions de votre entreprise.</p></div>'+
      '<div class="head-actions"><span class="chip-mini alt">Prototype</span></div>'+
    '</div>'+
    '<div class="banner" data-stagger>'+ui().icon("lock",16)+
      '<div><strong>Secure multi-user access requires backend authentication.</strong>'+
      '<p>Cette page est une interface prototype : aucun système d\'authentification ni de comptes n\'est actif aujourd\'hui.</p></div></div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Rôles</h2><p>3 niveaux prévus</p></div></div>'+
      '<div class="table-wrap"><table class="table"><thead><tr><th>Rôle</th><th>Accès</th><th>État</th></tr></thead><tbody>'+
      rows.map(r => '<tr><td><strong>'+ui().esc(r[0])+'</strong></td><td>'+ui().esc(r[1])+'</td>'+
        '<td><span class="chip-mini alt">'+ui().esc(r[2])+'</span></td></tr>').join("")+
      '</tbody></table></div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Permissions</h2><p>Matrice prévue par rôle</p></div></div>'+
      '<div class="perm-grid"><div class="perm-head"></div>'+perms.map(p => '<div class="perm-head">'+ui().esc(p)+'</div>').join("")+
      rows.map(r => '<div class="perm-role">'+ui().esc(r[0])+'</div>'+
        perms.map((p,i) => '<div class="perm-cell">'+(r[0] === "Owner" || (r[0] === "Admin" && i < 4) || (r[0] === "Staff" && i > 0 && i < 4) ?
          '<span class="on">'+ui().icon("check",14)+'</span>' : '<span class="off">—</span>')+'</div>').join("")).join("")+
      '</div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Membres</h2><p>0 membre connecté</p></div>'+
      '<button class="btn btn-ghost btn-sm" data-action="soon">Inviter</button></div>'+
      ui().emptyState("Aucun membre","L'ajout d'équipe sera disponible avec l'authentification backend.","")+
    '</div>';
}

function renderSettings(host){
  const b = QG.data.business();
  const s = settings();
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">08 — SYSTEM</span><h1>Paramètres</h1>'+
      '<p>Identité de l\'entreprise active dans QuoteGo AI Studio.</p></div>'+
    '</div>'+
    '<div class="panel narrow" data-stagger>'+
      '<div class="panel-head"><div><h2>Entreprise</h2><p>Stockage local du studio</p></div></div>'+
      '<div class="panel-body">'+
        ui().field("Nom de l\'entreprise",'<input class="input" name="bname" value="'+ui().esc(b.name)+'">')+
        '<div class="grid2">'+
          ui().field("Devise",ui().select("currency",[{value:"EUR",label:"EUR (€)"},{value:"USD",label:"USD ($)"},{value:"GBP",label:"GBP (£)"}],b.currency))+
          ui().field("Plan",ui().select("plan",[{value:"PRO",label:"PRO"},{value:"FREE",label:"FREE"},{value:"ENTERPRISE",label:"ENTERPRISE"}],b.plan))+
        '</div>'+
        ui().field("Sous-titre",'<input class="input" name="tagline" value="'+ui().esc(b.tagline||"Business Automation OS")+'">')+
        '<div class="switch-row"><input type="checkbox" id="notif-req" '+(s.notifications.newRequests?"checked":"")+'><label for="notif-req">Notifications nouvelles demandes</label></div>'+
        '<div class="switch-row"><input type="checkbox" id="notif-book" '+(s.notifications.bookingPending?"checked":"")+'><label for="notif-book">Notifications réservations en attente</label></div>'+
        '<div class="head-actions"><button class="btn btn-primary" data-action="settings-save">Enregistrer</button></div>'+
        '<p class="honest-note">Ces réglages n\'affectent que l\'interface studio. Le site client reste piloté par config.js.</p>'+
      '</div>'+
    '</div>'+
    '<div class="panel narrow" data-stagger>'+
      '<div class="panel-head"><div><h2>Données locales</h2><p>localStorage du navigateur</p></div></div>'+
      '<div class="panel-body"><div class="head-actions">'+
        '<button class="btn btn-ghost" data-action="data-export">Exporter les données studio</button>'+
        '<button class="btn btn-ghost danger" data-action="data-reset">Réinitialiser le studio</button>'+
      '</div><p class="honest-note">Les demandes V4 (quotego_requests_v1) ne sont jamais supprimées par la réinitialisation du studio.</p></div>'+
    '</div>';
}

function renderSecurity(host){
  const items = [
    ["Authentification multi-utilisateur","Requires backend","Système de comptes et sessions non implémenté."],
    ["Chiffrement des données","Local storage","Les données restent non chiffrées dans le navigateur."],
    ["Permissions par rôle","Prototype","Voir Équipe & accès."],
    ["Journal d\'activité","Actif local","Historique des actions du studio."],
    ["Sauvegarde cloud","Requires backend","Export manuel disponible dans Paramètres."]
  ];
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">08 — SYSTEM</span><h1>Sécurité</h1>'+
      '<p>État réel de la sécurité de cette version.</p></div>'+
    '</div>'+
    '<div class="banner warn" data-stagger>'+ui().icon("shield",16)+
      '<div><strong>Démo statique sans backend.</strong><p>Aucune donnée n\'est chiffrée ni synchronisée. Ne stockez aucune information sensible.</p></div></div>'+
    '<div class="sec-grid">'+items.map(it =>
      '<article class="sec-card glow-card" data-stagger><span>'+ui().esc(it[1])+'</span>'+
      '<h3>'+ui().esc(it[0])+'</h3><p>'+ui().esc(it[2])+'</p></article>').join("")+'</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Contrôles disponibles</h2><p>Actions locales</p></div></div>'+
      '<div class="panel-body"><div class="head-actions">'+
      '<button class="btn btn-ghost" data-action="data-export">Exporter les données</button>'+
      '<button class="btn btn-ghost" data-go="journal">'+ui().icon("list",14)+' Voir le journal</button></div></div>'+
    '</div>';
}

function renderJournal(host){
  const logs = QG.data.journalList();
  const tone = {request:"cyan",booking:"mint",automation:"violet",service:"",client:"",system:"muted"};
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">08 — SYSTEM</span><h1>Journal</h1>'+
      '<p>Historique des actions réalisées dans le studio.</p></div>'+
      '<div class="head-actions"><span class="chip-mini">'+logs.length+' entrées</span></div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      (logs.length ? '<div class="log-list">'+logs.map(l =>
        '<div class="log-item"><span class="log-dot '+(tone[l.type]||"")+'"></span>'+
        '<div><strong>'+ui().esc(l.text)+'</strong><small>'+ui().dateTime(l.ts)+'</small></div></div>').join("")+'</div>'
        : ui().emptyState("Journal vide","Les actions du studio s\'enregistreront ici.",""))+
    '</div>';
}

function exportStudio(){
  const payload = {
    exportedAt:new Date().toISOString(),
    business:QG.data.business(),
    services:QG.data.services(),
    automations:QG.data.automations(),
    bookings:QG.data.bookings(),
    clients:QG.data.clients(),
    forms:QG.data.forms(),
    workflows:QG.data.workflowList(),
    settings:QG.data.settings(),
    aiConfiguration:QG.data.aiConfig(),
    requests:QG.data.requests()
  };
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotego-studio-" + new Date().toISOString().slice(0,10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  ui().toast("Données exportées");
}

function resetStudio(){
  if(!confirm("Réinitialiser QuoteGo AI Studio ? Les demandes V4 sont conservées.")) return;
  ["business","services","automations","bookings","clients","forms","workflows","settings","ai","journal","onboarded"]
    .forEach(k => { try{ localStorage.removeItem(QG.data.KEY[k]); }catch(e){} });
  ui().toast("Studio réinitialisé");
  QG.data.seedIfNeeded();
  QG.go("dashboard");
}

function handle(host,action,target){
  const s = settings();
  const key = target && target.dataset.id;
  if(action === "int-open"){ QG.go("integration/" + key); return; }
  if(action === "int-off"){
    s.integrations[key].connected = false;
    QG.data.setSettings(s);
    ui().toast("Connecteur déconnecté");
    QG.refresh(); return;
  }
  if(action === "int-save"){
    const conf = s.integrations[key] || (s.integrations[key] = {});
    const val = host.querySelector('[name="value"]');
    const enabled = host.querySelector("#int-enabled");
    const map = {whatsapp:"number",gcal:"calendar",email:"address",reviews:"link",website:"url",instagram:"handle"};
    if(val) conf[map[key]] = val.value.trim();
    conf.configured = !!(enabled && enabled.checked);
    conf.connected = false;
    conf.note = conf.configured ? "Configuré localement · Requires backend" : "Non connecté";
    QG.data.setSettings(s);
    QG.data.journal("system","Intégration configurée · " + key);
    ui().toast("Configuration enregistrée (locale)");
    QG.refresh(); return;
  }
  if(action === "settings-save"){
    const b = QG.data.business();
    b.name = host.querySelector('[name="bname"]').value.trim() || b.name;
    b.tagline = host.querySelector('[name="tagline"]').value.trim() || b.tagline;
    b.currency = host.querySelector('[name="currency"]').value;
    b.plan = host.querySelector('[name="plan"]').value;
    QG.data.setBusiness(b);
    s.notifications.newRequests = host.querySelector("#notif-req").checked;
    s.notifications.bookingPending = host.querySelector("#notif-book").checked;
    QG.data.setSettings(s);
    QG.data.journal("system","Paramètres mis à jour");
    ui().toast("Paramètres enregistrés");
    QG.refresh(); return;
  }
  if(action === "data-export"){ exportStudio(); return; }
  if(action === "data-reset"){ resetStudio(); return; }
  if(action === "soon"){ ui().toast("Requires backend authentication"); return; }
}

QG.views = QG.views || {};
QG.views.integrations = {title:"Intégrations",subtitle:"Connect",render:renderIntegrations,handle:handle};
QG.views.integration = {title:"Intégration",subtitle:"Configuration",render:integrationDetail,handle:handle};
QG.views.team = {title:"Équipe & accès",subtitle:"Organisation",render:renderTeam,handle:handle};
QG.views.settings = {title:"Paramètres",subtitle:"System",render:renderSettings,handle:handle};
QG.views.security = {title:"Sécurité",subtitle:"System",render:renderSecurity,handle:handle};
QG.views.journal = {title:"Journal",subtitle:"System",render:renderJournal,handle:handle};
})();
