(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;
const S = () => QG.data.STATUS_META;

let query = "";
let statusFilter = "all";
let activeRef = null;

function filtered(){
  const list = QG.data.requests();
  const q = query.trim().toLowerCase();
  return list.filter(r => {
    const hay = [r.ref,(r.customer||{}).name,(r.customer||{}).car,(r.vehicle||{}).label,(r.package||{}).label].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (statusFilter === "all" || r.status === statusFilter);
  });
}

function render(host){
  const all = QG.data.requests();
  const data = filtered();
  const fresh = all.filter(r => r.status === "new").length;
  const confirmed = all.filter(r => r.status === "confirmed").length;
  const value = all.filter(r => r.status !== "cancelled").reduce((s,r) => s + (Number(r.estimate)||0),0);

  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">03 — BUSINESS</span><h1>Demandes</h1>'+
      '<p>Toutes les estimations envoyées depuis le tunnel client V4.</p></div>'+
      '<div class="head-actions">'+
        '<button class="btn btn-ghost" data-action="export">'+ui().icon("send",14)+' Exporter CSV</button>'+
        '<a class="btn btn-primary" href="index.html#demo">'+ui().icon("plus",14)+' Nouvelle demande</a>'+
      '</div>'+
    '</div>'+
    '<div class="stat-grid" data-stagger>'+
      stat("Total demandes",all.length,all.length?all.length+" enregistrées":"Aucune demande")+
      stat("Nouvelles",fresh,"À traiter")+
      stat("Confirmées",confirmed,"Rendez-vous validés")+
      '<div class="stat-card glow-card accent"><span>Valeur estimée</span><strong>'+ui().money(value)+'</strong><small>Hors demandes annulées</small></div>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Toutes les demandes</h2><p>'+data.length+' demande'+(data.length>1?"s":"")+'</p></div>'+
      '<div class="filters">'+
        '<div class="search-box">'+ui().icon("search",15)+'<input placeholder="Référence, client, véhicule…" data-action="search" value="'+ui().esc(query)+'"></div>'+
        '<select class="input slim" data-action="status-filter">'+
          '<option value="all"'+(statusFilter==="all"?" selected":"")+'>Tous les statuts</option>'+
          Object.keys(S()).map(k => '<option value="'+k+'"'+(statusFilter===k?" selected":"")+'>'+S()[k].label+'</option>').join("")+
        '</select>'+
      '</div></div>'+
      (all.length === 0 ?
        ui().emptyState("Aucune demande pour le moment",
          "Fais un parcours dans la démo QuoteGo puis clique sur « Préparer WhatsApp ». La demande apparaîtra ici.",
          '<a class="btn btn-primary" href="index.html#demo">Créer une demande test</a>')
        : data.length === 0 ?
        ui().emptyState("Aucun résultat","Aucune demande ne correspond à votre recherche.","")
        :
        '<div class="table-wrap"><table class="table"><thead><tr><th>Référence</th><th>Client</th><th>Véhicule</th><th>Formule</th>'+
        '<th>Date souhaitée</th><th>Estimation</th><th>Statut</th><th></th></tr></thead><tbody>'+
        data.map(r =>
          '<tr class="row-link" data-action="open-request" data-id="'+ui().esc(r.ref)+'">'+
            '<td class="ref-cell">'+ui().esc(r.ref)+'</td>'+
            '<td><div class="cell-client"><span class="avatar">'+ui().initials((r.customer||{}).name)+'</span>'+
            '<div><strong>'+ui().esc((r.customer||{}).name||"—")+'</strong><small>'+ui().dateTime(r.createdAt)+'</small></div></div></td>'+
            '<td>'+ui().esc((r.customer||{}).car||(r.vehicle||{}).label||"—")+'</td>'+
            '<td>'+ui().esc((r.package||{}).label||"—")+'</td>'+
            '<td class="date-muted">'+ui().shortDate((r.customer||{}).date)+'</td>'+
            '<td class="money">'+ui().money(r.estimate,r.currency)+'</td>'+
            '<td><select class="status-select '+S()[r.status].class+'" data-action="status" data-id="'+ui().esc(r.ref)+'">'+
              Object.keys(S()).map(k => '<option value="'+k+'"'+(k===r.status?" selected":"")+'>'+S()[k].label+'</option>').join("")+
            '</select></td>'+
            '<td>'+ui().icon("chevron",14)+'</td>'+
          '</tr>').join("")+
        '</tbody></table></div>'+
        '<div class="mobile-list">'+data.map(r =>
          '<article class="list-card row-link" data-action="open-request" data-id="'+ui().esc(r.ref)+'">'+
          '<div class="list-card-top"><span class="ref-cell">'+ui().esc(r.ref)+'</span>'+ui().statusBadge(r.status)+'</div>'+
          '<h3>'+ui().esc((r.customer||{}).name||"—")+'</h3>'+
          '<p>'+ui().esc((r.customer||{}).car||"—")+' · '+ui().esc((r.package||{}).label||"—")+' · '+ui().shortDate((r.customer||{}).date)+'</p>'+
          '<div class="list-card-bottom"><strong>'+ui().money(r.estimate)+'</strong><span>'+ui().relTime(r.createdAt)+'</span></div>'+
          '</article>').join("")+'</div>')+
    '</div>';
}

function stat(label,value,sub){
  return '<div class="stat-card glow-card"><span>'+ui().esc(label)+'</span><strong>'+ui().esc(String(value))+'</strong><small>'+ui().esc(sub)+'</small></div>';
}

function openDetail(ref){
  const r = QG.data.requests().find(x => x.ref === ref);
  if(!r) return;
  activeRef = ref;
  let wrap = document.getElementById("req-detail");
  if(!wrap){
    wrap = document.createElement("div");
    wrap.id = "req-detail";
    wrap.className = "drawer-wrap";
    wrap.innerHTML = '<div class="drawer-backdrop" data-close></div><aside class="drawer"><div class="drawer-head">'+
      '<div><span class="eyebrow">DÉTAIL DE LA DEMANDE</span><h2 data-ref></h2></div>'+
      '<button class="icon-btn" data-close>'+ui().icon("x",16)+'</button></div><div class="drawer-body" data-body></div></aside>';
    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click",closeDetail));
  }
  wrap.querySelector("[data-ref]").textContent = r.ref;
  const extras = (r.extras||[]).map(x => x.label).join(", ") || "Aucune option";
  wrap.querySelector("[data-body]").innerHTML =
    '<section class="detail-section"><span>Client</span><div class="detail-grid">'+
      item("Prénom",(r.customer||{}).name)+item("Date souhaitée",ui().shortDate((r.customer||{}).date))+
      item("Véhicule",(r.customer||{}).car)+item("Créée le",ui().dateTime(r.createdAt))+
    '</div></section>'+
    '<section class="detail-section"><span>Configuration</span><div class="detail-grid">'+
      item("Catégorie",(r.vehicle||{}).label)+item("Formule",(r.package||{}).label)+
      item("État",(r.condition||{}).label)+item("Options",extras)+
    '</div>'+
    '<div class="detail-total"><span>Estimation QuoteGo</span><strong>'+ui().money(r.estimate,r.currency)+'</strong></div></section>'+
    '<section class="detail-section"><span>Remarque</span><div class="detail-note">'+ui().esc((r.customer||{}).note||"Aucune remarque")+'</div></section>'+
    '<section class="detail-section"><span>Suivi</span><div class="detail-actions">'+
      '<select class="input" data-detail-status>'+Object.keys(S()).map(k =>
        '<option value="'+k+'"'+(k===r.status?" selected":"")+'>'+S()[k].label+'</option>').join("")+'</select>'+
      '<button class="btn btn-ghost danger" data-delete>'+ui().icon("trash",14)+' Supprimer</button>'+
    '</div></section>';
  wrap.querySelector("[data-detail-status]").addEventListener("change",e => {
    QG.data.updateRequestStatus(ref,e.target.value);
    ui().toast("Statut " + S()[e.target.value].label);
    QG.refresh();
    openDetail(ref);
  });
  wrap.querySelector("[data-delete]").addEventListener("click",() => {
    if(!confirm("Supprimer définitivement la demande " + ref + " ?")) return;
    QG.data.deleteRequest(ref);
    closeDetail();
    ui().toast("Demande supprimée");
    QG.refresh();
  });
  requestAnimationFrame(() => wrap.classList.add("show"));
}

function item(label,value){
  return '<div class="detail-item"><small>'+ui().esc(label)+'</small><strong>'+ui().esc(value||"—")+'</strong></div>';
}

function closeDetail(){
  activeRef = null;
  const wrap = document.getElementById("req-detail");
  if(wrap) wrap.classList.remove("show");
}

function exportCSV(){
  const reqs = QG.data.requests();
  if(!reqs.length){ ui().toast("Aucune demande à exporter"); return; }
  const rows = [
    ["Référence","Créée le","Client","Véhicule","Catégorie","Formule","État","Options","Date souhaitée","Estimation","Statut","Remarque"],
    ...reqs.map(r => [r.ref,r.createdAt,(r.customer||{}).name,(r.customer||{}).car,(r.vehicle||{}).label,
      (r.package||{}).label,(r.condition||{}).label,(r.extras||[]).map(x => x.label).join(" | "),
      (r.customer||{}).date,r.estimate,(S()[r.status]||{}).label || r.status,(r.customer||{}).note])
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(v => '"' + String(v == null ? "" : v).replace(/"/g,'""') + '"').join(";")).join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotego-demandes-" + new Date().toISOString().slice(0,10) + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  ui().toast("CSV exporté");
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
  if(action === "status-filter"){ statusFilter = target.value; QG.refresh(); return; }
  if(action === "status"){
    QG.data.updateRequestStatus(target.dataset.id,target.value);
    ui().toast("Statut " + S()[target.value].label);
    QG.refresh(); return;
  }
  if(action === "open-request"){ openDetail(target.dataset.id); return; }
  if(action === "export"){ exportCSV(); return; }
}

QG.views = QG.views || {};
QG.views.requests = {title:"Demandes",subtitle:"Business",render:render,handle:handle};
QG.openRequest = openDetail;
QG.closeRequest = closeDetail;
})();
