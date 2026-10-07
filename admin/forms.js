(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

const FIELD_TYPES = [
  {value:"text",label:"Text"},
  {value:"number",label:"Number"},
  {value:"date",label:"Date"},
  {value:"time",label:"Time"},
  {value:"select",label:"Select"},
  {value:"checkbox",label:"Checkbox"},
  {value:"textarea",label:"Textarea"}
];

function renderForms(host){
  const forms = QG.data.forms();
  const form = forms[0];
  if(!form){
    host.innerHTML = ui().emptyState("Aucun formulaire","Créez un formulaire de réservation public.","");
    return;
  }
  const activeFields = form.fields.filter(f => f.active);
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">04 — BUILD</span><h1>Form Builder</h1>'+
      '<p>Le formulaire que vos clients remplissent pour réserver ou demander un devis.</p></div>'+
      '<div class="head-actions"><button class="btn btn-ghost" data-action="form-preview">'+ui().icon("eye",15)+' Voir l\'aperçu</button>'+
      '<button class="btn btn-primary" data-action="field-add">'+ui().icon("plus",15)+' Ajouter champ</button></div>'+
    '</div>'+
    '<div class="form-layout" data-stagger>'+
      '<div class="panel">'+
        '<div class="panel-head"><div><h2>'+ui().esc(form.name)+'</h2><p>'+activeFields.length+' champs actifs sur '+form.fields.length+'</p></div>'+
        '<span class="chip-mini">'+(form.status==="published"?"Publié":"Brouillon")+'</span></div>'+
        '<div class="field-list">'+form.fields.map((f,i) =>
          '<div class="field-row'+(f.active?"":" off")+'" data-stagger>'+
            '<div class="field-handle">'+ui().icon("list",14)+'</div>'+
            '<div class="field-main"><strong>'+ui().esc(f.label)+'</strong>'+
            '<small>'+ui().esc((FIELD_TYPES.find(t => t.value === f.type)||{label:f.type}).label)+(f.required?" · requis":"")+'</small></div>'+
            '<div class="field-tools">'+
              '<button class="icon-btn" data-action="field-up" data-id="'+ui().esc(f.id)+'" '+(i===0?"disabled":"")+'>↑</button>'+
              '<button class="icon-btn" data-action="field-down" data-id="'+ui().esc(f.id)+'" '+(i===form.fields.length-1?"disabled":"")+'>↓</button>'+
              '<button class="icon-btn" data-action="field-toggle" data-id="'+ui().esc(f.id)+'">'+(f.active?"●":"○")+'</button>'+
              '<button class="icon-btn danger" data-action="field-del" data-id="'+ui().esc(f.id)+'">×</button>'+
            '</div>'+
          '</div>').join("")+'</div>'+
      '</div>'+
      '<div class="panel preview-panel">'+
        '<div class="panel-head"><div><h2>Aperçu public</h2><p>Vue client</p></div></div>'+
        '<div class="public-form">'+
          '<div class="public-form-head"><span class="eyebrow">QUOTE GO</span><h4>Réservez en 30 secondes</h4></div>'+
          activeFields.map(f => {
            if(f.type === "textarea") return ui().field(f.label,'<textarea class="input" rows="3" placeholder="'+ui().esc(f.label)+'"></textarea>');
            if(f.type === "checkbox") return '<label class="check-row"><input type="checkbox"> <span>'+ui().esc(f.label)+'</span></label>';
            const type = ["date","time","number"].includes(f.type) ? f.type : "text";
            return ui().field(f.label,'<input class="input" type="'+type+'" placeholder="'+ui().esc(f.label)+'">');
          }).join("")+
          '<button class="btn btn-primary btn-block" type="button">Envoyer la demande</button>'+
          '<p class="honest-note">Aperçu local. L\'envoi réel nécessite un backend.</p>'+
        '</div>'+
      '</div>'+
    '</div>';
}

function moveField(id,dir){
  const forms = QG.data.forms();
  const fields = forms[0].fields;
  const i = fields.findIndex(f => f.id === id);
  const j = i + dir;
  if(i < 0 || j < 0 || j >= fields.length) return;
  const tmp = fields[i]; fields[i] = fields[j]; fields[j] = tmp;
  QG.data.setForms(forms);
  QG.refresh();
}

function handleForms(host,action,target){
  const forms = QG.data.forms();
  const id = target && target.dataset.id;
  if(action === "field-up"){ moveField(id,-1); return; }
  if(action === "field-down"){ moveField(id,1); return; }
  if(action === "field-toggle"){
    forms[0].fields = forms[0].fields.map(f => f.id === id ? Object.assign({},f,{active:!f.active}) : f);
    QG.data.setForms(forms); QG.refresh(); return;
  }
  if(action === "field-del"){
    forms[0].fields = forms[0].fields.filter(f => f.id !== id);
    QG.data.setForms(forms);
    ui().toast("Champ supprimé");
    QG.refresh(); return;
  }
  if(action === "field-add"){
    const body =
      ui().field("Libellé",'<input class="input" name="label" placeholder="Ex : Ville">')+
      ui().field("Type",ui().select("type",FIELD_TYPES,"text"))+
      '<label class="switch-row"><input type="checkbox" name="required"><span>Champ requis</span></label>';
    ui().modal({
      eyebrow:"FORM", title:"Ajouter un champ", body:body,
      footer:'<button class="btn btn-ghost" data-cancel>Annuler</button><button class="btn btn-primary" data-save>Ajouter</button>',
      onMount:(wrap,close) => {
        wrap.querySelector("[data-cancel]").addEventListener("click",close);
        wrap.querySelector("[data-save]").addEventListener("click",() => {
          const label = wrap.querySelector('[name="label"]').value.trim();
          if(!label){ ui().toast("Libellé requis"); return; }
          forms[0].fields.push({
            id:QG.data.uid("f"), label:label,
            type:wrap.querySelector('[name="type"]').value,
            required:wrap.querySelector('[name="required"]').checked,
            active:true
          });
          QG.data.setForms(forms);
          close(); ui().toast("Champ ajouté"); QG.refresh();
        });
      }
    });
    return;
  }
  if(action === "form-preview"){
    const f = forms[0];
    const body = '<div class="public-form">'+f.fields.filter(x => x.active).map(x =>
      ui().field(x.label,'<input class="input" type="text" placeholder="'+ui().esc(x.label)+'">')).join("")+
      '<button class="btn btn-primary btn-block">Envoyer la demande</button></div>';
    ui().modal({eyebrow:"APERÇU",title:f.name,body:body});
    return;
  }
}

const WF_STATUS = {active:{label:"Active",tone:"ok"},draft:{label:"Draft",tone:"warn"},paused:{label:"Paused",tone:"muted"}};

function renderWorkflows(host){
  const wfs = QG.data.workflowList();
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">04 — BUILD</span><h1>Workflows</h1>'+
      '<p>Déclencheur, étapes, statut et dernier exécution de chaque chaîne.</p></div>'+
      '<div class="head-actions"><button class="btn btn-ghost" data-go="automations">'+ui().icon("flow",15)+' Automatisations</button></div>'+
    '</div>'+
    '<div class="wf-grid">'+wfs.map(w => {
      const st = WF_STATUS[w.status] || WF_STATUS.draft;
      return '<article class="wf-card glow-card" data-stagger>'+
        '<div class="wf-top"><strong>'+ui().esc(w.name)+'</strong><span class="status-pill '+st.tone+'"><i></i>'+st.label+'</span></div>'+
        '<div class="wf-trigger"><span>TRIGGER</span>'+ui().esc(w.trigger)+'</div>'+
        '<ol class="wf-steps">'+w.steps.map(s => '<li>'+ui().esc(s)+'</li>').join("")+'</ol>'+
        '<div class="wf-foot"><span>Dernier run</span><b>'+(w.lastRun?ui().dateTime(w.lastRun):"Jamais")+'</b></div>'+
      '</article>';
    }).join("")+'</div>'+
    '<p class="honest-note" data-stagger>Prototype : l\'exécution automatique nécessite un backend et des connecteurs.</p>';
}

QG.views = QG.views || {};
QG.views.forms = {title:"Formulaires",subtitle:"Form Builder",render:renderForms,handle:handleForms};
QG.views.workflows = {title:"Workflows",subtitle:"Chaînes opérationnelles",render:renderWorkflows,handle:() => {}};
})();
