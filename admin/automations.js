(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const STATUS = {
  active:{label:"Active",tone:"ok"},
  paused:{label:"Paused",tone:"muted"},
  ready:{label:"Ready to configure",tone:"warn"}
};

function statsFor(a){
  const m = QG.data.metrics();
  if(a.key === "booking") return [["Bookings",m.bookingsTotal],["Conversion",m.requestsTotal ? Math.round(m.requestsConfirmed/m.requestsTotal*100)+"%" : "—"]];
  if(a.key === "quote") return [["Demandes",m.requestsTotal],["Estimation",ui().money(m.estimatedValue)]];
  if(a.key === "lead") return [["Leads",m.requestsNew + m.requestsPending],["Conversion","—"]];
  if(a.key === "review") return [["Terminées",m.requestsDone],["Envoi","Non connecté"]];
  return [["Relances","—"],["Conversion","—"]];
}

function renderList(host){
  const autos = QG.data.automations();
  const m = QG.data.metrics();
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">02 — AI STUDIO</span><h1>Mes automatisations</h1>'+
      '<p>Chaque automatisation est une chaîne déclenchée → condition → action.</p></div>'+
      '<div class="head-actions">'+
        '<button class="btn btn-ghost" data-go="ai-studio">'+ui().icon("sparkles",15)+' Ouvrir AI Studio</button>'+
        '<button class="btn btn-primary" data-action="create">'+ui().icon("plus",15)+' Create Automation</button>'+
      '</div>'+
    '</div>'+
    '<div class="auto-summary" data-stagger>'+
      summaryCard("Actives",m.automationsActive,"ok")+
      summaryCard("Ready to configure",m.automationsReady,"warn")+
      summaryCard("Paused",m.automationsPaused,"muted")+
      summaryCard("Réservations liées",m.bookingsTotal,"")+
    '</div>'+
    '<div class="auto-grid">'+
      autos.map((a,i) => {
        const st = STATUS[a.status] || STATUS.ready;
        const stats = statsFor(a);
        return '<article class="auto-card glow-card" data-stagger data-id="'+ui().esc(a.id)+'">'+
          '<div class="auto-card-top">'+
            '<div class="auto-icon">'+ui().icon(a.key==="booking"?"calendar":a.key==="quote"?"tag":a.key==="followup"?"send":a.key==="review"?"star":"inbox",18)+'</div>'+
            '<span class="status-pill '+st.tone+'"><i></i>'+st.label+'</span>'+
          '</div>'+
          '<h3>'+ui().esc(a.name)+'</h3>'+
          '<p>'+ui().esc(a.description)+'</p>'+
          '<div class="auto-stats">'+stats.map(s =>
            '<div><small>'+ui().esc(s[0])+'</small><strong>'+ui().esc(String(s[1]))+'</strong></div>').join("")+'</div>'+
          '<div class="auto-actions">'+
            '<button class="btn btn-ghost btn-sm" data-action="open" data-id="'+ui().esc(a.id)+'">'+ui().icon("flow",14)+' Configurer</button>'+
            '<button class="btn btn-ghost btn-sm" data-action="toggle" data-id="'+ui().esc(a.id)+'">'+(a.status==="active"?"Pause":"Activer")+'</button>'+
          '</div>'+
        '</article>';
      }).join("")+
      '<button class="auto-create glow-card" data-action="create" data-stagger>'+
        '<span>'+ui().icon("plus",20)+'</span><strong>+ Create Automation</strong>'+
        '<small>Décrivez votre besoin à QuoteGo AI</small>'+
      '</button>'+
    '</div>';
}

function summaryCard(label,value,tone){
  return '<div class="sum-card '+tone+'" data-stagger><span>'+ui().esc(label)+'</span><strong>'+ui().esc(String(value))+'</strong></div>';
}

function renderBuilder(host,id){
  const a = QG.data.automations().find(x => x.id === id);
  if(!a){
    host.innerHTML = ui().emptyState("Automatisation introuvable","Cette automatisation n'existe plus.",
      '<button class="btn btn-primary" data-go="automations">Retour</button>');
    return;
  }
  const st = STATUS[a.status] || STATUS.ready;
  const stats = statsFor(a);
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><button class="crumb" data-go="automations">'+ui().icon("back",14)+' Mes automatisations</button>'+
      '<h1>'+ui().esc(a.name)+'</h1><p>'+ui().esc(a.description)+'</p></div>'+
      '<div class="head-actions">'+
        '<span class="status-pill '+st.tone+'"><i></i>'+st.label+'</span>'+
        '<button class="btn btn-ghost" data-action="toggle" data-id="'+ui().esc(a.id)+'">'+(a.status==="active"?"Pause":"Activer")+'</button>'+
      '</div>'+
    '</div>'+
    '<div class="builder" data-stagger>'+
      a.steps.map((s,i) => {
        const tone = s.type === "trigger" ? "trigger" : s.type === "condition" ? "condition" : "action";
        const label = s.type === "trigger" ? "WHEN" : s.type === "condition" ? "CHECK" : "THEN";
        return '<div class="builder-block '+tone+'">'+
            '<div class="builder-kind">'+label+'</div>'+
            '<div class="builder-body"><strong>'+ui().esc(s.label)+'</strong><small>'+
            (tone==="trigger"?"Démarre la chaîne":tone==="condition"?"Contrôle avant action":"Exécute l'étape")+'</small></div>'+
            '<div class="builder-index">'+(i+1)+'</div>'+
          '</div>'+
          (i < a.steps.length-1 ? '<div class="builder-link"><span></span></div>' : '');
      }).join("")+
    '</div>'+
    '<div class="panel" data-stagger>'+
      '<div class="panel-head"><div><h2>Performance</h2><p>Calculé sur vos données locales</p></div></div>'+
      '<div class="kpi-row">'+stats.map(s => '<div class="kpi"><span>'+ui().esc(s[0])+'</span><strong>'+ui().esc(String(s[1]))+'</strong></div>').join("")+
      '<div class="kpi"><span>Dernier run</span><strong>'+(a.lastRun?ui().dateTime(a.lastRun):"Jamais")+'</strong></div></div>'+
      '<p class="honest-note">Prototype local : l\'exécution réelle nécessite un backend et des connecteurs externes.</p>'+
    '</div>';
}

function handle(host,action,target){
  const autos = QG.data.automations();
  const id = target && target.dataset.id;
  if(action === "toggle"){
    const list = autos.map(a => a.id === id ? Object.assign({},a,{status:a.status==="active"?"paused":"active"}) : a);
    QG.data.setAutomations(list);
    const item = list.find(a => a.id === id);
    QG.data.journal("automation",item.name + " → " + (item.status==="active"?"active":"paused"));
    ui().toast(item.name + " · " + (item.status==="active"?"active":"paused"));
    QG.refresh();
    return;
  }
  if(action === "open"){ QG.go("automation/"+id); return; }
  if(action === "create"){ QG.go("ai-studio"); if(QG.openPanel) QG.openPanel(); return; }
}

QG.views = QG.views || {};
QG.views.automations = {title:"Automatisations",subtitle:"Chaînes déclenchées → condition → action",render:renderList,handle:handle};
QG.views.automation = {title:"Builder",subtitle:"Éditeur d'automatisation",render:renderBuilder,handle:handle};
QG.views["create-automation"] = {title:"Create Automation",subtitle:"Assistant QuoteGo AI",render:(host) => { QG.go("ai-studio"); }};
})();
