(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

let query = "";
let openId = null;

function thisMonth(){
  const now = new Date();
  return d => {
    if(!d) return false;
    const x = new Date(d);
    return x.getMonth() === now.getMonth() && x.getFullYear() === now.getFullYear();
  };
}

function historyFor(name){
  const key = String(name||"").toLowerCase();
  const reqs = QG.data.requests().filter(r => ((r.customer||{}).name||"").toLowerCase() === key);
  const books = QG.data.allBookings().filter(b => (b.client||"").toLowerCase() === key);
  return {requests:reqs,bookings:books};
}

function render(host){
  const clients = QG.data.derivedClients();
  const m = thisMonth();
  const total = clients.length;
  const fresh = clients.filter(c => m(c.createdAt)).length;
  const recurring = clients.filter(c => c.requests + c.bookings > 1).length;
  const q = query.trim().toLowerCase();
  const data = q ? clients.filter(c => (c.name+" "+c.company).toLowerCase().includes(q)) : clients;

  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">03 — BUSINESS</span><h1>Clients</h1>'+
      '<p>Regroupement automatique des demandes et réservations par personne.</p></div>'+
      '<div class="head-actions"><button class="btn btn-primary" data-action="new-client">'+ui().icon("plus",15)+' Ajouter un client</button></div>'+
    '</div>'+
    '<div class="stat-grid" data-stagger>'+
      stat("Total clients",total,"Toutes sources")+
      stat("Nouveaux ce mois",fresh,"Créations récentes")+
      stat("Clients récurrents",recurring,"Plus d'une interaction")+
      stat("Valeur cumulée",ui().money(clients.reduce((s,c)=>s+(c.value||0),0)),"Hors annulés")+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Répertoire</h2><p>'+data.length+' client'+(data.length>1?"s":"")+'</p></div>'+
      '<div class="search-box">'+ui().icon("search",15)+'<input placeholder="Rechercher un client" data-action="search" value="'+ui().esc(query)+'"></div></div>'+
      (data.length ?
        '<div class="table-wrap"><table class="table"><thead><tr><th>Client</th><th>Entreprise</th><th>Dernière activité</th>'+
        '<th>Demandes</th><th>Réservations</th><th>Valeur</th><th></th></tr></thead><tbody>'+
        data.map(c =>
          '<tr class="row-link" data-action="open-client" data-id="'+ui().esc(c.id)+'">'+
            '<td><div class="cell-client"><span class="avatar">'+ui().initials(c.name)+'</span><div><strong>'+ui().esc(c.name)+'</strong>'+
            '<small>'+(c.manual?"Ajouté manuellement":"Source : demandes/réservations")+'</small></div></div></td>'+
            '<td>'+(c.company?ui().esc(c.company):'<span class="muted">—</span>')+'</td>'+
            '<td class="date-muted">'+ui().relTime(c.lastActivity)+'</td>'+
            '<td>'+c.requests+'</td><td>'+c.bookings+'</td>'+
            '<td class="money">'+ui().money(c.value)+'</td>'+
            '<td>'+ui().icon("chevron",14)+'</td>'+
          '</tr>').join("")+
        '</tbody></table></div>'+
        '<div class="mobile-list">'+data.map(c =>
          '<article class="list-card row-link" data-action="open-client" data-id="'+ui().esc(c.id)+'">'+
          '<div class="list-card-top"><strong>'+ui().esc(c.name)+'</strong><b>'+ui().money(c.value)+'</b></div>'+
          '<p>'+c.requests+' demande'+(c.requests>1?"s":"")+' · '+c.bookings+' réservation'+(c.bookings>1?"s":"")+'</p></article>').join("")+'</div>'
        : ui().emptyState("Aucun client","Les clients apparaissent automatiquement quand une demande ou une réservation est créée.",
          '<button class="btn btn-primary" data-action="new-client">+ Ajouter un client</button>'))+
    '</div>';

  if(openId){
    const c = clients.find(x => x.id === openId);
    if(c) openClient(c);
  }
}

function stat(label,value,sub){
  return '<div class="stat-card glow-card" data-stagger><span>'+ui().esc(label)+'</span><strong>'+ui().esc(String(value))+'</strong><small>'+ui().esc(sub)+'</small></div>';
}

function openClient(c){
  const h = historyFor(c.name);
  const body =
    '<div class="client-head"><span class="avatar big">'+ui().initials(c.name)+'</span>'+
      '<div><h4>'+ui().esc(c.name)+'</h4><p>'+(c.company?ui().esc(c.company)+" · ":"")+'Dernière activité : '+ui().relTime(c.lastActivity)+'</p></div></div>'+
    '<div class="kpi-row">'+
      '<div class="kpi"><span>Demandes</span><strong>'+h.requests.length+'</strong></div>'+
      '<div class="kpi"><span>Réservations</span><strong>'+h.bookings.length+'</strong></div>'+
      '<div class="kpi"><span>Valeur</span><strong>'+ui().money(c.value)+'</strong></div>'+
    '</div>'+
    '<div class="sub-block"><span class="eyebrow">HISTORIQUE</span>'+
      (h.requests.length || h.bookings.length ?
        '<div class="timeline">'+h.requests.map(r =>
          '<div class="tl-item"><span class="tl-dot request"></span><div><strong>Demande '+ui().esc(r.ref)+'</strong>'+
          '<small>'+ui().esc((r.package||{}).label||"—")+' · '+ui().money(r.estimate)+' · '+ui().shortDate((r.customer||{}).date)+'</small></div>'+
          ui().statusBadge(r.status)+'</div>').join("")+
        h.bookings.map(b =>
          '<div class="tl-item"><span class="tl-dot booking"></span><div><strong>'+ui().esc(b.service)+'</strong>'+
          '<small>'+ui().shortDate(b.date)+(b.time?" · "+ui().esc(b.time):" · heure non définie")+'</small></div>'+
          '<span class="badge '+(B_CLASS[b.status]||"status-pending")+'">'+(B_LABEL[b.status]||b.status)+'</span></div>').join("")+
        '</div>'
        : '<p class="muted">Aucune interaction enregistrée.</p>')+
    '</div>'+
    '<div class="sub-block"><span class="eyebrow">CONTACT</span>'+
      '<div class="grid2">'+
      ui().field("Téléphone",'<input class="input" data-cfield="phone" value="'+ui().esc(c.phone)+'" placeholder="—">')+
      ui().field("Email",'<input class="input" data-cfield="email" value="'+ui().esc(c.email)+'" placeholder="—">')+
      '</div>'+
      ui().field("Notes",'<textarea class="input" rows="3" data-cfield="notes" placeholder="Notes internes">'+ui().esc(c.notes)+'</textarea>')+
    '</div>';
  ui().modal({
    eyebrow:"CRM", title:"Profil client", wide:true, body:body,
    footer:'<button class="btn btn-ghost" data-cancel>Fermer</button><button class="btn btn-primary" data-save>Enregistrer</button>',
    onMount:(wrap,close) => {
      wrap.querySelector("[data-cancel]").addEventListener("click",close);
      wrap.querySelector("[data-save]").addEventListener("click",() => {
        const list = QG.data.clients();
        const i = list.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase());
        const record = {
          id:QG.data.uid("cli"), name:c.name, company:c.company,
          phone:wrap.querySelector('[data-cfield="phone"]').value.trim(),
          email:wrap.querySelector('[data-cfield="email"]').value.trim(),
          notes:wrap.querySelector('[data-cfield="notes"]').value.trim(),
          status:"active", createdAt:new Date().toISOString()
        };
        if(i >= 0){ record.id = list[i].id; record.createdAt = list[i].createdAt; list[i] = record; }
        else list.push(record);
        QG.data.setClients(list);
        QG.data.journal("client","Fiche client mise à jour · " + c.name);
        close();
        ui().toast("Client enregistré");
        QG.refresh();
      });
    }
  });
}

const B_CLASS = {pending:"status-pending",confirmed:"status-confirmed",done:"status-done",cancelled:"status-cancelled"};
const B_LABEL = {pending:"À confirmer",confirmed:"Confirmé",done:"Terminé",cancelled:"Annulé"};

function newClient(){
  const body = ui().field("Nom",'<input class="input" name="name" placeholder="Nom du client">')+
    '<div class="grid2">'+
    ui().field("Entreprise",'<input class="input" name="company" placeholder="Facultatif">')+
    ui().field("Téléphone",'<input class="input" name="phone" placeholder="Facultatif">')+
    '</div>'+
    ui().field("Notes",'<textarea class="input" name="notes" rows="3" placeholder="Facultatif"></textarea>');
  ui().modal({
    eyebrow:"CRM", title:"Ajouter un client", body:body,
    footer:'<button class="btn btn-ghost" data-cancel>Annuler</button><button class="btn btn-primary" data-save>Ajouter</button>',
    onMount:(wrap,close) => {
      wrap.querySelector("[data-cancel]").addEventListener("click",close);
      wrap.querySelector("[data-save]").addEventListener("click",() => {
        const name = wrap.querySelector('[name="name"]').value.trim();
        if(!name){ ui().toast("Nom requis"); return; }
        const list = QG.data.clients();
        list.push({
          id:QG.data.uid("cli"), name:name,
          company:wrap.querySelector('[name="company"]').value.trim(),
          phone:wrap.querySelector('[name="phone"]').value.trim(),
          email:"", notes:wrap.querySelector('[name="notes"]').value.trim(),
          status:"active", createdAt:new Date().toISOString()
        });
        QG.data.setClients(list);
        QG.data.journal("client","Client ajouté · " + name);
        close();
        ui().toast("Client ajouté");
        QG.refresh();
      });
    }
  });
}

function handle(host,action,target){
  if(action === "search"){
    query = target.value;
    const pos = target.selectionStart;
    QG.refresh();
    const next = host.querySelector('[data-action="search"]');
    if(next){ next.focus(); try{ next.setSelectionRange(pos,pos); }catch(e){} }
    return;
  }
  if(action === "open-client"){
    const c = QG.data.derivedClients().find(x => x.id === target.dataset.id);
    if(c) openClient(c);
    return;
  }
  if(action === "new-client"){ newClient(); return; }
}

QG.views = QG.views || {};
QG.views.clients = {title:"Clients",subtitle:"CRM unifié",render:render,handle:handle};
})();
