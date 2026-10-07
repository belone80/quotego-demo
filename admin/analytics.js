(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const STATUS_ORDER = ["new","pending","confirmed","done","cancelled"];
const STATUS_COLOR = {
  new:"var(--cyan)",pending:"var(--warn)",confirmed:"var(--accent)",done:"var(--violet)",cancelled:"var(--danger)"
};
const DAY_KEYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function render(host){
  const m = QG.data.metrics();
  const reqs = QG.data.requests();
  const books = QG.data.allBookings();
  const clients = QG.data.derivedClients();
  const conversion = reqs.length ? Math.round((m.requestsConfirmed + m.requestsDone) / reqs.length * 100) : 0;

  const byStatus = STATUS_ORDER.map(s => ({key:s,label:QG.data.STATUS_META[s].label,count:reqs.filter(r => r.status === s).length}));
  const maxStatus = Math.max(1,...byStatus.map(x => x.count));

  const byDay = DAY_KEYS.map((d,i) => {
    const count = books.filter(b => {
      if(!b.date) return false;
      const dd = new Date(b.date + "T12:00:00").getDay();
      return ((dd + 6) % 7) === i;
    }).length;
    return {label:d,count:count};
  });
  const maxDay = Math.max(1,...byDay.map(x => x.count));

  const serviceCount = {};
  reqs.forEach(r => { const k = (r.package||{}).label; if(k) serviceCount[k] = (serviceCount[k]||0)+1; });
  books.forEach(b => { if(b.service) serviceCount[b.service] = (serviceCount[b.service]||0)+1; });
  const top = Object.keys(serviceCount).map(k => ({name:k,count:serviceCount[k]})).sort((a,b) => b.count - a.count).slice(0,6);
  const maxTop = Math.max(1,...top.map(t => t.count));

  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">05 — GROW</span><h1>Statistiques</h1>'+
      '<p>Chiffres calculés uniquement à partir de vos données locales.</p></div>'+
      '<div class="head-actions"><button class="btn btn-ghost" data-action="export">'+ui().icon("send",15)+' Exporter CSV</button></div>'+
    '</div>'+
    '<div class="kpi-grid" data-stagger>'+
      kpi("Demandes",m.requestsTotal,"Toutes périodes",m.requestsTotal)+
      kpi("Réservations",m.bookingsTotal,"Manuelles + confirmées",m.bookingsTotal)+
      kpi("Valeur estimée",ui().money(m.estimatedValue),"Hors annulés",m.estimatedValue)+
      kpi("Clients",clients.length,"Uniques",clients.length)+
      kpi("Conversion",conversion+"%","Confirmées / demandes",conversion)+
    '</div>'+
    '<div class="analytics-grid">'+
      '<div class="panel glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Statuts des demandes</h2><p>Répartition</p></div></div>'+
        (reqs.length ? '<div class="hbars">'+byStatus.map(x =>
          '<div class="hbar-row"><span>'+ui().esc(x.label)+'</span>'+
          '<div class="hbar-track"><i style="width:'+(x.count/maxStatus*100)+'%;background:'+STATUS_COLOR[x.key]+'"></i></div>'+
          '<b>'+x.count+'</b></div>').join("")+'</div>'
          : ui().emptyState("Aucune demande","Le graphique apparaîtra avec vos premières demandes.",""))+
      '</div>'+
      '<div class="panel glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Activité réservations</h2><p>Par jour de la semaine</p></div></div>'+
        (books.length ? '<div class="vchart">'+byDay.map(x =>
          '<div class="vcol"><span class="vval">'+x.count+'</span><i style="height:'+Math.max(4,x.count/maxDay*100)+'%"></i><small>'+x.label+'</small></div>').join("")+'</div>'
          : ui().emptyState("Aucune réservation","Aucune activité de réservation sur cette période.",""))+
      '</div>'+
      '<div class="panel glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Top services</h2><p>Demandes + réservations</p></div></div>'+
        (top.length ? '<div class="hbars">'+top.map(t =>
          '<div class="hbar-row"><span>'+ui().esc(t.name)+'</span>'+
          '<div class="hbar-track"><i style="width:'+(t.count/maxTop*100)+'%"></i></div><b>'+t.count+'</b></div>').join("")+'</div>'
          : ui().emptyState("Pas encore de données","Vos services les plus demandés apparaîtront ici.",""))+
      '</div>'+
      '<div class="panel glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Performance automatisations</h2><p>État actuel</p></div></div>'+
        '<div class="hbars">'+QG.data.automations().map(a => {
          const pct = a.status === "active" ? 100 : a.status === "ready" ? 55 : 15;
          return '<div class="hbar-row"><span>'+ui().esc(a.name)+'</span>'+
            '<div class="hbar-track"><i style="width:'+pct+'%"></i></div>'+
            '<b>'+ui().esc(a.status === "active" ? "ON" : a.status === "ready" ? "READY" : "PAUSED")+'</b></div>';
        }).join("")+'</div>'+
      '</div>'+
    '</div>'+
    '<p class="honest-note" data-stagger>Aucune donnée synthétique : tout provient de localStorage (demandes V4 + QuoteGo AI Studio).</p>';
}

function kpi(label,value,sub,animate){
  return '<div class="kpi-card glow-card" data-stagger><span>'+ui().esc(label)+'</span>'+
    '<strong data-count="'+(Number(animate)||0)+'">'+ui().esc(String(value))+'</strong>'+
    '<small>'+ui().esc(sub)+'</small></div>';
}

function renderLeads(host){
  const leads = QG.data.requests().filter(r => r.status === "new" || r.status === "pending")
    .sort((a,b) => (b.createdAt||"").localeCompare(a.createdAt||""));
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">05 — GROW</span><h1>Leads</h1>'+
      '<p>Prospects issus du formulaire client, en attente de qualification.</p></div>'+
      '<div class="head-actions"><button class="btn btn-ghost" data-go="requests">'+ui().icon("inbox",15)+' Toutes les demandes</button></div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>En attente</h2><p>'+leads.length+' lead'+(leads.length>1?"s":"")+'</p></div>'+
      '<span class="chip-mini alt">Lead Capture · Requires backend</span></div>'+
      (leads.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Référence</th><th>Client</th><th>Service</th>'+
        '<th>Date</th><th>Valeur</th><th>Statut</th></tr></thead><tbody>'+
        leads.map(r => '<tr class="row-link" data-action="open-request" data-id="'+ui().esc(r.ref)+'">'+
          '<td class="ref-cell">'+ui().esc(r.ref)+'</td>'+
          '<td><strong>'+ui().esc((r.customer||{}).name||"—")+'</strong></td>'+
          '<td>'+ui().esc((r.package||{}).label||"—")+'</td>'+
          '<td class="date-muted">'+ui().shortDate((r.customer||{}).date)+'</td>'+
          '<td class="money">'+ui().money(r.estimate)+'</td>'+
          '<td>'+ui().statusBadge(r.status)+'</td></tr>').join("")+
        '</tbody></table></div>'
        : ui().emptyState("Aucun lead en attente","Toutes les demandes ont été traitées.",""))+
    '</div>'+
    '<p class="honest-note" data-stagger>Lead Capture est en mode prototype : la centralisation automatique multi-sources nécessite un backend.</p>';
}

function renderReviews(host){
  const done = QG.data.requests().filter(r => r.status === "done");
  const booster = QG.data.automations().find(a => a.key === "review");
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">05 — GROW</span><h1>Avis clients</h1>'+
      '<p>Sollicitez les avis après chaque prestation terminée.</p></div>'+
      '<div class="head-actions"><span class="chip-mini alt">Google Reviews · Not connected</span></div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Review Booster</h2><p>'+(booster?ui().esc(booster.description):"")+'</p></div>'+
      '<span class="status-pill '+(booster && booster.status === "active" ? "ok" : "warn")+'"><i></i>'+
      (booster ? (booster.status === "active" ? "Active" : "Ready to configure") : "—")+'</span></div>'+
      '<div class="kpi-row"><div class="kpi"><span>Prestations terminées</span><strong>'+done.length+'</strong></div>'+
      '<div class="kpi"><span>Avis envoyés</span><strong>0</strong></div>'+
      '<div class="kpi"><span>Connecteur</span><strong>Non connecté</strong></div></div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>À solliciter</h2><p>Prestations marquées terminées</p></div></div>'+
      (done.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Valeur</th><th></th></tr></thead><tbody>'+
        done.map(r => '<tr><td><strong>'+ui().esc((r.customer||{}).name||"—")+'</strong></td>'+
        '<td>'+ui().esc((r.package||{}).label||"—")+'</td>'+
        '<td class="date-muted">'+ui().shortDate((r.customer||{}).date)+'</td>'+
        '<td class="money">'+ui().money(r.estimate)+'</td>'+
        '<td><button class="btn btn-ghost btn-sm" data-action="review-ask">Demander un avis</button></td></tr>').join("")+
        '</tbody></table></div>'
        : ui().emptyState("Aucune prestation terminée","Marquez une demande comme terminée pour la retrouver ici.",""))+
    '</div>';
}

function exportCSV(){
  const reqs = QG.data.requests();
  if(!reqs.length){ ui().toast("Aucune donnée à exporter"); return; }
  const rows = [["Ref","Date","Client","Service","Estimation","Statut"]].concat(
    reqs.map(r => [r.ref,r.createdAt,(r.customer||{}).name,(r.package||{}).label,r.estimate,(QG.data.STATUS_META[r.status]||{}).label]));
  const csv = "\uFEFF" + rows.map(row => row.map(v => '"' + String(v == null ? "" : v).replace(/"/g,'""') + '"').join(";")).join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotego-analytics-" + new Date().toISOString().slice(0,10) + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  ui().toast("CSV exporté");
}

function handle(host,action,target){
  if(action === "export"){ exportCSV(); return; }
  if(action === "open-request"){
    if(QG.openRequest) QG.openRequest(target.dataset.id);
    else QG.go("requests");
    return;
  }
  if(action === "review-ask"){ ui().toast("Not connected · envoi d'avis nécessite un backend"); return; }
}

QG.views = QG.views || {};
QG.views.analytics = {title:"Statistiques",subtitle:"Analytics",render:render,handle:handle};
QG.views.leads = {title:"Leads",subtitle:"Prospects en attente",render:renderLeads,handle:handle};
QG.views.reviews = {title:"Avis clients",subtitle:"Review Booster",render:renderReviews,handle:handle};
})();
