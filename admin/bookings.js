(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const B_STATUS = {
  pending:{label:"À confirmer",class:"status-pending"},
  confirmed:{label:"Confirmé",class:"status-confirmed"},
  done:{label:"Terminé",class:"status-done"},
  cancelled:{label:"Annulé",class:"status-cancelled"}
};

let filter = "today";
let calCursor = null;
let calSelected = null;

function today(){ return new Date().toISOString().slice(0,10); }

function inRange(date,mode){
  if(!date) return false;
  const d = new Date(date + "T12:00:00");
  const now = new Date();
  const t = new Date(now.toISOString().slice(0,10) + "T12:00:00");
  if(mode === "today") return date === today();
  if(mode === "week"){
    const diff = (d - t)/86400000;
    return diff >= 0 && diff < 7;
  }
  if(mode === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  return true;
}

function sorted(list){
  return list.slice().sort((a,b) => (a.date+" "+(a.time||"")) < (b.date+" "+(b.time||"")) ? -1 : 1);
}

function renderBookings(host){
  const all = sorted(QG.data.allBookings());
  const data = all.filter(b => inRange(b.date,filter));
  const m = QG.data.metrics();
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">03 — BUSINESS</span><h1>Réservations</h1>'+
      '<p>Rendez-vous créés ici et demandes confirmées issues du tunnel client.</p></div>'+
      '<div class="head-actions">'+
        '<button class="btn btn-ghost" data-go="calendar">'+ui().icon("calendar",15)+' Calendrier</button>'+
        '<button class="btn btn-primary" data-action="new-booking">'+ui().icon("plus",15)+' Nouvelle réservation</button>'+
      '</div>'+
    '</div>'+
    '<div class="tab-bar" data-stagger>'+
      [["today","Aujourd'hui"],["week","Semaine"],["month","Mois"],["all","Toutes"]].map(t =>
        '<button class="tab'+(filter===t[0]?" on":"")+'" data-action="filter" data-value="'+t[0]+'">'+t[1]+'</button>').join("")+
      '<span class="tab-note">'+data.length+' réservation'+(data.length>1?"s":"")+'</span>'+
    '</div>'+
    '<div class="panel" data-stagger>'+
      (data.length ?
        '<div class="table-wrap"><table class="table">'+
        '<thead><tr><th>Heure</th><th>Client</th><th>Service</th><th>Date</th><th>Durée</th><th>Source</th><th>Statut</th></tr></thead>'+
        '<tbody>'+data.map(b => {
          const st = B_STATUS[b.status] || B_STATUS.pending;
          return '<tr>'+
            '<td class="time-cell">'+(b.time ? ui().esc(b.time) : '<span class="no-time">—</span>')+'</td>'+
            '<td><strong>'+ui().esc(b.client)+'</strong></td>'+
            '<td>'+ui().esc(b.service)+'</td>'+
            '<td class="date-muted">'+ui().shortDate(b.date)+'</td>'+
            '<td>'+(b.duration ? ui().esc(b.duration+" min") : "—")+'</td>'+
            '<td>'+(b.source==="request" ? '<span class="chip-mini">Demande</span>' : '<span class="chip-mini alt">Studio</span>')+'</td>'+
            '<td><select class="status-select '+st.class+'" data-action="bstatus" data-id="'+ui().esc(b.id)+'">'+
              Object.keys(B_STATUS).map(k => '<option value="'+k+'"'+(k===b.status?" selected":"")+'>'+B_STATUS[k].label+'</option>').join("")+
            '</select></td>'+
          '</tr>';
        }).join("")+'</tbody></table></div>'+
        '<div class="mobile-list">'+data.map(b => {
          const st = B_STATUS[b.status] || B_STATUS.pending;
          return '<article class="list-card"><div class="list-card-top"><strong>'+ui().esc(b.client)+'</strong>'+
            '<span class="badge '+st.class+'">'+st.label+'</span></div>'+
            '<p>'+ui().esc(b.service)+' · '+ui().shortDate(b.date)+' · '+(b.time?ui().esc(b.time):"heure non définie")+'</p></article>';
        }).join("")+'</div>'
        : ui().emptyState("Aucune réservation sur cette période",
            "Créez une réservation ou confirmez une demande pour la voir apparaître ici.",
            '<button class="btn btn-primary" data-action="new-booking">+ Nouvelle réservation</button>'))+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Synthèse</h2><p>Toutes périodes</p></div></div>'+
      '<div class="kpi-row">'+
        '<div class="kpi"><span>Total</span><strong>'+m.bookingsTotal+'</strong></div>'+
        '<div class="kpi"><span>À confirmer</span><strong>'+all.filter(b=>b.status==="pending").length+'</strong></div>'+
        '<div class="kpi"><span>Confirmées</span><strong>'+all.filter(b=>b.status==="confirmed").length+'</strong></div>'+
        '<div class="kpi"><span>Terminées</span><strong>'+all.filter(b=>b.status==="done").length+'</strong></div>'+
      '</div>'+
    '</div>';
}

function newBookingModal(){
  const services = QG.data.services().filter(s => s.active);
  const clients = QG.data.derivedClients();
  const body =
    ui().field("Client",'<input class="input" name="client" placeholder="Nom du client" list="client-list">'+
      '<datalist id="client-list">'+clients.map(c => '<option value="'+ui().esc(c.name)+'">').join("")+'</datalist>')+
    '<div class="grid2">'+
      ui().field("Service",ui().select("service",services.map(s => ({value:s.id,label:s.name+" · "+ui().money(s.price)})),services[0] && services[0].id))+
      ui().field("Date",'<input class="input" type="date" name="date" value="'+today()+'">')+
      ui().field("Heure (optionnel)",'<input class="input" type="time" name="time">')+
      ui().field("Durée (min)",'<input class="input" type="number" name="duration" value="'+(services[0]&&services[0].duration||30)+'" min="5">')+
    '</div>'+
    ui().field("Statut",ui().select("status",[
      {value:"pending",label:"À confirmer"},{value:"confirmed",label:"Confirmé"},{value:"done",label:"Terminé"}
    ],"confirmed"))+
    ui().field("Notes",'<textarea class="input" name="notes" rows="2" placeholder="Facultatif"></textarea>');
  ui().modal({
    eyebrow:"RÉSERVATION", title:"Nouvelle réservation", body:body,
    footer:'<button class="btn btn-ghost" data-cancel>Annuler</button><button class="btn btn-primary" data-save>Créer la réservation</button>',
    onMount:(wrap,close) => {
      wrap.querySelector("[data-cancel]").addEventListener("click",close);
      wrap.querySelector("[data-save]").addEventListener("click",() => {
        const get = n => wrap.querySelector('[name="'+n+'"]');
        const client = get("client").value.trim();
        if(!client){ ui().toast("Indiquez un client"); return; }
        const svc = services.find(s => s.id === get("service").value);
        const booking = {
          id:QG.data.uid("bk"), source:"manual", client:client,
          service:svc ? svc.name : "—", serviceId:svc ? svc.id : null,
          date:get("date").value || today(), time:get("time").value || null,
          duration:Number(get("duration").value)||null, status:get("status").value,
          notes:get("notes").value.trim(), estimate:svc?svc.price:0,
          createdAt:new Date().toISOString()
        };
        const list = QG.data.bookings();
        list.push(booking);
        QG.data.setBookings(list);
        QG.data.journal("booking","Réservation créée · " + client);
        close();
        ui().toast("Réservation créée");
        QG.refresh();
      });
    }
  });
}

function updateBookingStatus(id,status){
  const list = QG.data.bookings();
  const i = list.findIndex(b => b.id === id);
  if(i < 0){
    if(String(id).startsWith("req-")){
      const ref = String(id).slice(4);
      QG.data.updateRequestStatus(ref,status === "pending" ? "pending" : status);
      ui().toast("Statut mis à jour");
      QG.refresh();
    }
    return;
  }
  list[i].status = status;
  QG.data.setBookings(list);
  QG.data.journal("booking","Statut réservation → " + (B_STATUS[status]?B_STATUS[status].label:status));
  ui().toast("Statut mis à jour");
  QG.refresh();
}

function monthLabel(d){
  return new Intl.DateTimeFormat("fr-BE",{month:"long",year:"numeric"}).format(d);
}

function renderCalendar(host){
  const base = calCursor ? new Date(calCursor) : new Date();
  const year = base.getFullYear(), month = base.getMonth();
  const first = new Date(year,month,1);
  const startOffset = (first.getDay()+6)%7;
  const daysInMonth = new Date(year,month+1,0).getDate();
  const bookings = QG.data.allBookings();
  const cells = [];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length % 7) cells.push(null);

  const iso = m => String(m+1).padStart(2,"0");
  const dayBookings = date => bookings.filter(b => b.date === date);

  const selectedDate = calSelected || today();
  const dayList = dayBookings(selectedDate);

  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">03 — BUSINESS</span><h1>Calendrier</h1>'+
      '<p>Disponibilités, réservations et charge de la semaine.</p></div>'+
      '<div class="head-actions">'+
        '<button class="btn btn-ghost" data-action="cal-prev">‹</button>'+
        '<span class="cal-title">'+ui().esc(monthLabel(first))+'</span>'+
        '<button class="btn btn-ghost" data-action="cal-next">›</button>'+
        '<button class="btn btn-primary" data-action="new-booking">'+ui().icon("plus",15)+' Nouvelle réservation</button>'+
      '</div>'+
    '</div>'+
    '<div class="cal-layout" data-stagger>'+
      '<div class="panel cal-panel">'+
        '<div class="cal-weekdays">'+["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d => '<span>'+d+'</span>').join("")+'</div>'+
        '<div class="cal-grid">'+cells.map(d => {
          if(d === null) return '<div class="cal-cell empty"></div>';
          const date = year + "-" + iso(month) + "-" + String(d).padStart(2,"0");
          const list = dayBookings(date);
          const isToday = date === today();
          const sel = date === selectedDate;
          return '<button class="cal-cell'+(sel?" selected":"")+(isToday?" today":"")+(list.length?" has":"")+'" data-action="cal-day" data-value="'+date+'">'+
            '<span class="cal-day">'+d+'</span>'+
            (list.length ? '<span class="cal-dots">'+list.slice(0,3).map(() => '<i></i>').join("")+'</span><span class="cal-count">'+list.length+'</span>' : '')+
          '</button>';
        }).join("")+'</div>'+
        '<div class="cal-legend"><span><i class="dot mint"></i> Réservation</span><span><i class="dot cyan"></i> Aujourd\'hui</span></div>'+
      '</div>'+
      '<div class="panel day-panel">'+
        '<div class="panel-head"><div><h2>'+ui().shortDate(selectedDate)+'</h2><p>'+dayList.length+' réservation'+(dayList.length>1?"s":"")+'</p></div>'+
        '<button class="btn btn-ghost btn-sm" data-action="cal-today">Aujourd\'hui</button></div>'+
        (dayList.length ? '<div class="day-list">'+dayList.map(b => {
          const st = B_STATUS[b.status] || B_STATUS.pending;
          return '<div class="day-item"><div class="day-time">'+(b.time?ui().esc(b.time):"—")+'</div>'+
            '<div class="day-info"><strong>'+ui().esc(b.client)+'</strong><small>'+ui().esc(b.service)+' · '+(b.duration?b.duration+" min":"durée libre")+'</small></div>'+
            '<span class="badge '+st.class+'">'+st.label+'</span></div>';
        }).join("")+'</div>'
        : ui().emptyState("Journée libre","Aucune réservation ce jour. Idéal pour les créneaux disponibles.",""))+
      '</div>'+
    '</div>';
}

function handle(host,action,target){
  if(action === "filter"){ filter = target.dataset.value; QG.refresh(); return; }
  if(action === "new-booking"){ newBookingModal(); return; }
  if(action === "bstatus"){ updateBookingStatus(target.dataset.id,target.value); return; }
  if(action === "cal-prev"){
    const d = calCursor ? new Date(calCursor) : new Date();
    d.setMonth(d.getMonth()-1);
    calCursor = d.toISOString().slice(0,10);
    QG.refresh(); return;
  }
  if(action === "cal-next"){
    const d = calCursor ? new Date(calCursor) : new Date();
    d.setMonth(d.getMonth()+1);
    calCursor = d.toISOString().slice(0,10);
    QG.refresh(); return;
  }
  if(action === "cal-day"){ calSelected = target.dataset.value; QG.refresh(); return; }
  if(action === "cal-today"){ calSelected = today(); calCursor = null; QG.refresh(); return; }
}

QG.views = QG.views || {};
QG.views.bookings = {title:"Réservations",subtitle:"Planning et rendez-vous",render:renderBookings,handle:handle};
QG.views.calendar = {title:"Calendrier",subtitle:"Vue mensuelle",render:renderCalendar,handle:handle};
})();
