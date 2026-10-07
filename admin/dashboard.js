(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

function greetingWord(){
  const h = new Date().getHours();
  if(h < 18) return "Bonjour";
  return "Bonsoir";
}

function last7(keyFn,list){
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    days.push({iso:iso,count:list.filter(x => keyFn(x) === iso).length,
      label:new Intl.DateTimeFormat("fr-BE",{weekday:"short"}).format(d).slice(0,3)});
  }
  return days;
}

function spark(data){
  const max = Math.max(1,...data.map(d => d.count));
  return '<div class="spark">'+data.map(d =>
    '<i style="height:'+Math.max(8,d.count/max*100)+'%" title="'+d.label+' · '+d.count+'"></i>').join("")+'</div>';
}

function render(host){
  const m = QG.data.metrics();
  const business = QG.data.business();
  const reqs = QG.data.requests();
  const books = QG.data.allBookings();
  const autos = QG.data.automations();
  const req7 = last7(r => (r.createdAt||"").slice(0,10),reqs);
  const book7 = last7(b => b.date,books);
  const feed = buildFeed();

  host.innerHTML =
    '<div class="hero" data-stagger>'+
      '<div class="hero-left">'+
        '<span class="eyebrow">'+ui().esc(business.shortName||business.name)+' · COMMAND CENTER</span>'+
        '<h1>'+greetingWord()+' 👋</h1>'+
        '<p>Voici ce qui se passe dans votre entreprise.</p>'+
      '</div>'+
      '<div class="hero-right">'+
        '<button class="btn btn-ghost" data-action="q-ai">'+ui().icon("sparkles",15)+' Ouvrir AI Studio</button>'+
        '<button class="btn btn-primary" data-action="q-booking">'+ui().icon("plus",15)+' Nouvelle réservation</button>'+
      '</div>'+
    '</div>'+

    '<div class="hero-kpis">'+
      kpiCard("Demandes aujourd\'hui",m.requestsToday,m.requestsTotal+" au total","inbox","today")+
      kpiCard("Réservations",m.bookingsTotal,m.bookingsToday+" aujourd\'hui","calendar","bookings")+
      kpiCard("Automatisations actives",m.automationsActive,m.automationsReady+" à configurer","bolt","autos")+
      '<div class="hero-kpi glow-card accent" data-stagger><div class="hero-kpi-top">'+ui().icon("tag",16)+'<span>Valeur estimée</span></div>'+
        '<strong class="count" data-money="'+m.estimatedValue+'">'+ui().money(m.estimatedValue)+'</strong>'+
        '<small>Hors demandes annulées</small></div>'+
    '</div>'+

    '<div class="dash-grid">'+
      '<section class="panel span2 glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Business Pulse</h2><p>Activité réelle des 7 derniers jours</p></div>'+
        '<span class="chip-mini">Live local</span></div>'+
        '<div class="pulse-grid">'+
          pulseItem("Demandes",m.requestsTotal,req7,"var(--cyan)")+
          pulseItem("Réservations",m.bookingsTotal,book7,"var(--accent)")+
          pulseItem("Clients",m.clients,null,"var(--violet)")+
          pulseItem("Automatisations",m.automationsActive+" / "+autos.length,null,"var(--warn)")+
        '</div>'+
      '</section>'+

      '<section class="panel glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Automation Health</h2><p>État des chaînes</p></div>'+
        '<button class="btn btn-ghost btn-sm" data-go="automations">Tout voir</button></div>'+
        '<div class="health-list">'+
          autos.slice(0,4).map(a => {
            const st = a.status === "active" ? {label:"Active",tone:"ok"} :
              a.status === "paused" ? {label:"Paused",tone:"muted"} : {label:"Ready to configure",tone:"warn"};
            return '<button class="health-row" data-go="automation/'+ui().esc(a.id)+'">'+
              '<span class="health-dot '+st.tone+'"></span>'+
              '<div><strong>'+ui().esc(a.name)+'</strong><small>'+ui().esc(a.description)+'</small></div>'+
              '<span class="status-pill '+st.tone+'"><i></i>'+st.label+'</span></button>';
          }).join("")+
        '</div>'+
      '</section>'+

      '<section class="panel glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Activity Feed</h2><p>Derniers événements</p></div>'+
        '<button class="btn btn-ghost btn-sm" data-go="journal">Journal</button></div>'+
        '<div class="feed">'+(feed.length ? feed.slice(0,6).map(f =>
          '<div class="feed-item"><span class="feed-dot '+(f.tone||"")+'"></span>'+
          '<div><strong>'+ui().esc(f.text)+'</strong><small>'+ui().esc(f.when)+'</small></div></div>').join("")
          : '<p class="muted">Aucune activité pour le moment.</p>')+'</div>'+
      '</section>'+

      '<section class="panel span2 glow-card" data-stagger>'+
        '<div class="panel-head"><div><h2>Quick Actions</h2><p>Accès rapide</p></div></div>'+
        '<div class="quick-grid">'+
          quick("q-automation","sparkles","Créer automatisation")+
          quick("q-service","plus","Ajouter service")+
          quick("q-booking","calendar","Nouvelle réservation")+
          quick("q-client","users","Ajouter client")+
          quick("q-studio","bolt","Ouvrir AI Studio")+
        '</div>'+
      '</section>'+
    '</div>';
}

function kpiCard(label,value,sub,icn,action){
  return '<button class="hero-kpi glow-card" data-stagger data-action="'+action+'">'+
    '<div class="hero-kpi-top">'+ui().icon(icn,16)+'<span>'+ui().esc(label)+'</span></div>'+
    '<strong class="count" data-count="'+(Number(value)||0)+'">'+value+'</strong>'+
    '<small>'+ui().esc(sub)+'</small></button>';
}

function pulseItem(label,value,data,color){
  return '<div class="pulse-item"><div class="pulse-head"><span>'+ui().esc(label)+'</span><strong>'+
    ui().esc(String(value))+'</strong></div>'+
    (data ? spark(data) : '<div class="spark flat"><i style="height:40%"></i><i style="height:40%"></i><i style="height:40%"></i></div>')+
    '</div>';
}

function quick(action,icn,label){
  return '<button class="quick-btn" data-action="'+action+'">'+ui().icon(icn,16)+'<span>'+ui().esc(label)+'</span>'+ui().icon("arrow",14)+'</button>';
}

function buildFeed(){
  const logs = QG.data.journalList().map(l => ({text:l.text,when:ui().relTime(l.ts),
    tone:l.type === "booking" ? "mint" : l.type === "request" ? "cyan" : l.type === "automation" ? "violet" : "muted"}));
  if(logs.length) return logs;
  return QG.data.requests().slice(0,5).map(r => ({
    text:"Nouvelle demande · " + (r.customer||{}).name,
    when:ui().relTime(r.createdAt), tone:"cyan"
  }));
}

function handle(host,action){
  if(action === "q-ai" || action === "q-studio"){ QG.go("ai-studio"); return; }
  if(action === "q-booking"){ QG.go("bookings"); setTimeout(() => { const b = document.querySelector('[data-action="new-booking"]'); if(b) b.click(); },60); return; }
  if(action === "q-service"){ QG.go("services"); setTimeout(() => { const b = document.querySelector('[data-action="new-service"]'); if(b) b.click(); },60); return; }
  if(action === "q-client"){ QG.go("clients"); setTimeout(() => { const b = document.querySelector('[data-action="new-client"]'); if(b) b.click(); },60); return; }
  if(action === "q-automation"){ QG.go("ai-studio"); return; }
  if(action === "today"){ QG.go("requests"); return; }
  if(action === "bookings"){ QG.go("bookings"); return; }
  if(action === "autos"){ QG.go("automations"); return; }
}

QG.views = QG.views || {};
QG.views.dashboard = {title:"Vue d'ensemble",subtitle:"Command Center",render:render,handle:handle};
})();
