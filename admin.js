
const REQUESTS_KEY = "quotego_requests_v1";
const $ = q => document.querySelector(q);

const statusMeta = {
  new:{label:"Nouveau",class:"status-new"},
  pending:{label:"À confirmer",class:"status-pending"},
  confirmed:{label:"Confirmé",class:"status-confirmed"},
  done:{label:"Terminé",class:"status-done"},
  cancelled:{label:"Annulé",class:"status-cancelled"}
};

let requests = loadRequests();
let activeRef = null;

function loadRequests(){
  try{
    const data=JSON.parse(localStorage.getItem(REQUESTS_KEY)||"[]");
    return Array.isArray(data)?data:[];
  }catch(e){return []}
}

function saveRequests(){
  localStorage.setItem(REQUESTS_KEY,JSON.stringify(requests));
}

function esc(s){
  return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function money(n,currency="EUR"){
  try{return new Intl.NumberFormat("fr-BE",{style:"currency",currency,maximumFractionDigits:0}).format(Number(n)||0)}
  catch(e){return `${Number(n)||0} €`}
}

function shortDate(value){
  if(!value)return "—";
  const d=new Date(value+"T12:00:00");
  if(Number.isNaN(d.getTime()))return esc(value);
  return new Intl.DateTimeFormat("fr-BE",{day:"2-digit",month:"short",year:"numeric"}).format(d);
}

function createdDate(value){
  if(!value)return "—";
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return "—";
  return new Intl.DateTimeFormat("fr-BE",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(d);
}

function statusSelect(r,compact=false){
  const current=statusMeta[r.status]||statusMeta.new;
  return `<select class="status-select ${current.class}" data-status-ref="${esc(r.ref)}" aria-label="Statut">
    ${Object.entries(statusMeta).map(([key,v])=>`<option value="${key}" ${key===r.status?"selected":""}>${v.label}</option>`).join("")}
  </select>`;
}

function filtered(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const status=$("#statusFilter").value;
  return requests.filter(r=>{
    const hay=[
      r.ref,r.customer?.name,r.customer?.car,r.vehicle?.label,r.package?.label
    ].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(status==="all"||r.status===status);
  });
}

function renderStats(){
  const total=requests.length;
  const fresh=requests.filter(r=>r.status==="new").length;
  const confirmed=requests.filter(r=>r.status==="confirmed").length;
  const value=requests.filter(r=>r.status!=="cancelled").reduce((s,r)=>s+(Number(r.estimate)||0),0);
  $("#statTotal").textContent=total;
  $("#statNew").textContent=fresh;
  $("#statConfirmed").textContent=confirmed;
  $("#statValue").textContent=money(value);
  $("#statTotalSub").textContent=total?`${total} demande${total>1?"s":""} enregistrée${total>1?"s":""}`:"Aucune demande";
}

function render(){
  requests=loadRequests();
  renderStats();

  const data=filtered();
  $("#resultCount").textContent=`${data.length} demande${data.length>1?"s":""}`;

  const empty=requests.length===0;
  $("#emptyState").classList.toggle("show",empty);
  $("#desktopTable").style.display=empty?"none":"";
  $("#mobileCards").style.display=empty?"none":"";

  $("#requestsBody").innerHTML=data.map(r=>`
    <tr>
      <td class="ref-cell">${esc(r.ref)}</td>
      <td class="client-cell"><strong>${esc(r.customer?.name||"—")}</strong><small>${createdDate(r.createdAt)}</small></td>
      <td>${esc(r.customer?.car||r.vehicle?.label||"—")}</td>
      <td>${esc(r.package?.label||"—")}</td>
      <td class="date-muted">${shortDate(r.customer?.date)}</td>
      <td class="money">${money(r.estimate,r.currency)}</td>
      <td>${statusSelect(r)}</td>
      <td><button class="open-btn" data-open-ref="${esc(r.ref)}">→</button></td>
    </tr>`).join("");

  $("#mobileCards").innerHTML=data.map(r=>`
    <article class="mobile-card">
      <div class="mobile-card-top"><span class="ref-cell">${esc(r.ref)}</span><span>${createdDate(r.createdAt)}</span></div>
      <h3>${esc(r.customer?.name||"—")}</h3>
      <p>${esc(r.customer?.car||r.vehicle?.label||"—")} · ${esc(r.package?.label||"—")} · ${shortDate(r.customer?.date)}</p>
      <div class="mobile-card-bottom"><strong>${money(r.estimate,r.currency)}</strong><div>${statusSelect(r,true)} <button class="open-btn" data-open-ref="${esc(r.ref)}">→</button></div></div>
    </article>`).join("");

  bindDynamic();
}

function bindDynamic(){
  document.querySelectorAll("[data-status-ref]").forEach(sel=>{
    sel.addEventListener("change",e=>{
      const ref=e.target.dataset.statusRef;
      updateStatus(ref,e.target.value);
    });
  });
  document.querySelectorAll("[data-open-ref]").forEach(btn=>{
    btn.addEventListener("click",()=>openDetail(btn.dataset.openRef));
  });
}

function updateStatus(ref,status){
  const i=requests.findIndex(r=>r.ref===ref);
  if(i<0)return;
  requests[i].status=status;
  requests[i].updatedAt=new Date().toISOString();
  saveRequests();
  toast(`Statut ${statusMeta[status]?.label||status}`);
  render();
  if(activeRef===ref)openDetail(ref);
}

function openDetail(ref){
  requests=loadRequests();
  const r=requests.find(x=>x.ref===ref);
  if(!r)return;
  activeRef=ref;
  $("#detailRef").textContent=r.ref;

  const extras=(r.extras||[]).map(x=>esc(x.label)).join(", ")||"Aucune option";
  $("#detailContent").innerHTML=`
    <section class="detail-section">
      <span>Client</span>
      <div class="detail-grid">
        <div class="detail-item"><small>Prénom</small><strong>${esc(r.customer?.name||"—")}</strong></div>
        <div class="detail-item"><small>Date souhaitée</small><strong>${shortDate(r.customer?.date)}</strong></div>
        <div class="detail-item"><small>Véhicule</small><strong>${esc(r.customer?.car||"—")}</strong></div>
        <div class="detail-item"><small>Créée le</small><strong>${createdDate(r.createdAt)}</strong></div>
      </div>
    </section>

    <section class="detail-section">
      <span>Configuration</span>
      <div class="detail-grid">
        <div class="detail-item"><small>Catégorie</small><strong>${esc(r.vehicle?.label||"—")}</strong></div>
        <div class="detail-item"><small>Formule</small><strong>${esc(r.package?.label||"—")}</strong></div>
        <div class="detail-item"><small>État</small><strong>${esc(r.condition?.label||"—")}</strong></div>
        <div class="detail-item"><small>Options</small><strong>${extras}</strong></div>
      </div>
      <div class="detail-total"><span>Estimation QuoteGo</span><strong>${money(r.estimate,r.currency)}</strong></div>
    </section>

    <section class="detail-section">
      <span>Remarque</span>
      <div class="detail-note">${esc(r.customer?.note||"Aucune remarque")}</div>
    </section>

    <section class="detail-section">
      <span>Suivi</span>
      <div class="detail-actions">
        <select id="detailStatus">
          ${Object.entries(statusMeta).map(([key,v])=>`<option value="${key}" ${key===r.status?"selected":""}>${v.label}</option>`).join("")}
        </select>
        <button class="danger-btn" id="deleteRequest">Supprimer</button>
      </div>
    </section>`;

  $("#detailStatus").addEventListener("change",e=>updateStatus(ref,e.target.value));
  $("#deleteRequest").addEventListener("click",()=>deleteRequest(ref));
  $("#detailWrap").classList.add("show");
}

function closeDetail(){
  activeRef=null;
  $("#detailWrap").classList.remove("show");
}

function deleteRequest(ref){
  if(!confirm(`Supprimer définitivement la demande ${ref} ?`))return;
  requests=requests.filter(r=>r.ref!==ref);
  saveRequests();
  closeDetail();
  toast("Demande supprimée");
  render();
}

function csvCell(v){
  return `"${String(v??"").replace(/"/g,'""')}"`;
}

function exportCSV(){
  if(!requests.length){toast("Aucune demande à exporter");return}
  const rows=[
    ["Référence","Créée le","Client","Véhicule","Catégorie","Formule","État","Options","Date souhaitée","Estimation","Statut","Remarque"],
    ...requests.map(r=>[
      r.ref,r.createdAt,r.customer?.name,r.customer?.car,r.vehicle?.label,r.package?.label,r.condition?.label,
      (r.extras||[]).map(x=>x.label).join(" | "),r.customer?.date,r.estimate,statusMeta[r.status]?.label||r.status,r.customer?.note
    ])
  ];
  const csv="\uFEFF"+rows.map(row=>row.map(csvCell).join(";")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`quotego-demandes-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast("CSV exporté");
}

let toastTimer;
function toast(msg){
  const el=$("#toast");
  el.textContent=msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove("show"),1500);
}

$("#searchInput").addEventListener("input",render);
$("#statusFilter").addEventListener("change",render);
$("#exportBtn").addEventListener("click",exportCSV);
$("#detailClose").addEventListener("click",closeDetail);
$("#detailBackdrop").addEventListener("click",closeDetail);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetail()});

window.addEventListener("storage",e=>{
  if(e.key===REQUESTS_KEY)render();
});

try{
  const channel=new BroadcastChannel("quotego_admin");
  channel.onmessage=()=>render();
}catch(e){}

render();
