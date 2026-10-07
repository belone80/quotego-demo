(function(){
const QG = window.QG = window.QG || {};
const ui = () => QG.ui;

let editing = null;

function render(host){
  const services = QG.data.services();
  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
  const activeCount = services.filter(s => s.active).length;

  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">04 — BUILD</span><h1>Service Library</h1>'+
      '<p>Vos prestations, prix et durées — la source de vérité des devis et réservations.</p></div>'+
      '<div class="head-actions"><button class="btn btn-primary" data-action="new-service">'+ui().icon("plus",15)+' Nouveau service</button></div>'+
    '</div>'+
    '<div class="stat-grid" data-stagger>'+
      '<div class="stat-card glow-card"><span>Services</span><strong>'+services.length+'</strong><small>'+activeCount+' actifs</small></div>'+
      '<div class="stat-card glow-card"><span>Catégories</span><strong>'+categories.length+'</strong><small>'+ui().esc(categories.join(", ")||"—")+'</small></div>'+
      '<div class="stat-card glow-card"><span>Prix moyen</span><strong>'+ui().money(services.length?services.reduce((s,x)=>s+(Number(x.price)||0),0)/services.length:0)+'</strong><small>Sur tous les services</small></div>'+
      '<div class="stat-card glow-card"><span>Durée moyenne</span><strong>'+(services.length?Math.round(services.reduce((s,x)=>s+(Number(x.duration)||0),0)/services.length):0)+' min</strong><small>Prise de rendez-vous</small></div>'+
    '</div>'+
    (services.length ?
      categories.map(cat =>
        '<div class="section-block" data-stagger><div class="section-head"><h2>'+ui().esc(cat||"Sans catégorie")+'</h2>'+
        '<span>'+services.filter(s => s.category === cat).length+' services</span></div>'+
        '<div class="svc-grid">'+services.filter(s => s.category === cat).map(s => svcCard(s)).join("")+'</div></div>').join("")
      : ui().emptyState("Aucun service","Ajoutez votre première prestation pour lancer devis et réservations.",
        '<button class="btn btn-primary" data-action="new-service">+ Nouveau service</button>'));
}

function svcCard(s){
  return '<article class="svc-card glow-card'+(s.active?"":" off")+'" data-stagger>'+
    '<div class="svc-card-top"><span class="svc-cat">'+ui().esc(s.category||"Service")+'</span>'+
    '<span class="svc-state">'+(s.active?"Actif":"Inactif")+'</span></div>'+
    '<h3>'+ui().esc(s.name)+'</h3>'+
    '<p>'+ui().esc(s.description||"Aucune description")+'</p>'+
    '<div class="svc-meta"><strong>'+ui().money(s.price)+'</strong><span>'+ui().esc(String(s.duration))+' min</span></div>'+
    '<div class="svc-actions">'+
      '<button class="btn btn-ghost btn-sm" data-action="edit-service" data-id="'+ui().esc(s.id)+'">'+ui().icon("edit",14)+' Éditer</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="toggle-service" data-id="'+ui().esc(s.id)+'">'+(s.active?"Désactiver":"Activer")+'</button>'+
      '<button class="btn btn-ghost btn-sm danger" data-action="delete-service" data-id="'+ui().esc(s.id)+'">'+ui().icon("trash",14)+'</button>'+
    '</div>'+
  '</article>';
}

function editor(service){
  editing = service || null;
  const s = service || {name:"",price:0,duration:30,description:"",category:"General",active:true};
  const categories = Array.from(new Set(QG.data.services().map(x => x.category).filter(Boolean).concat(["General"])));
  const body =
    ui().field("Nom",'<input class="input" name="name" value="'+ui().esc(s.name)+'" placeholder="Ex : Coupe">')+
    '<div class="grid2">'+
      ui().field("Prix (€)",'<input class="input" type="number" min="0" name="price" value="'+ui().esc(s.price)+'">')+
      ui().field("Durée (min)",'<input class="input" type="number" min="5" name="duration" value="'+ui().esc(s.duration)+'">')+
    '</div>'+
    ui().field("Catégorie",ui().select("category",categories.map(c => ({value:c,label:c})),s.category))+
    ui().field("Description",'<textarea class="input" name="description" rows="3" placeholder="Ce que comprend la prestation">'+ui().esc(s.description)+'</textarea>')+
    '<label class="switch-row"><input type="checkbox" name="active" '+(s.active?"checked":"")+'><span>Service actif</span></label>';
  ui().modal({
    eyebrow:"SERVICE", title:service?"Modifier le service":"Nouveau service", body:body,
    footer:'<button class="btn btn-ghost" data-cancel>Annuler</button><button class="btn btn-primary" data-save>Enregistrer</button>',
    onMount:(wrap,close) => {
      wrap.querySelector("[data-cancel]").addEventListener("click",close);
      wrap.querySelector("[data-save]").addEventListener("click",() => {
        const get = n => wrap.querySelector('[name="'+n+'"]');
        const name = get("name").value.trim();
        if(!name){ ui().toast("Nom requis"); return; }
        const list = QG.data.services();
        const record = {
          id:service ? service.id : QG.data.uid("svc"),
          name:name,
          price:Math.max(0,Number(get("price").value)||0),
          duration:Math.max(5,Number(get("duration").value)||15),
          category:get("category").value || "General",
          description:get("description").value.trim(),
          active:get("active").checked,
          createdAt:service ? service.createdAt : new Date().toISOString()
        };
        const i = list.findIndex(x => x.id === record.id);
        if(i >= 0) list[i] = record; else list.push(record);
        QG.data.setServices(list);
        QG.data.journal("service",(service?"Service modifié · ":"Service créé · ") + name);
        close();
        ui().toast(service ? "Service modifié" : "Service créé");
        QG.refresh();
      });
    }
  });
}

function handle(host,action,target){
  const services = QG.data.services();
  const id = target && target.dataset.id;
  if(action === "new-service"){ editor(null); return; }
  if(action === "edit-service"){ editor(services.find(s => s.id === id)); return; }
  if(action === "toggle-service"){
    QG.data.setServices(services.map(s => s.id === id ? Object.assign({},s,{active:!s.active}) : s));
    ui().toast("Service mis à jour");
    QG.refresh(); return;
  }
  if(action === "delete-service"){
    const s = services.find(x => x.id === id);
    if(!s) return;
    if(!confirm("Supprimer le service " + s.name + " ?")) return;
    QG.data.setServices(services.filter(x => x.id !== id));
    QG.data.journal("service","Service supprimé · " + s.name);
    ui().toast("Service supprimé");
    QG.refresh(); return;
  }
}

function renderCatalogue(host){
  const services = QG.data.services();
  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
  host.innerHTML =
    '<div class="page-head" data-stagger>'+
      '<div><span class="eyebrow">04 — BUILD</span><h1>Catalogue</h1>'+
      '<p>Votre offre regroupée par catégorie, utilisée par le formulaire public et le Quote Builder.</p></div>'+
      '<div class="head-actions"><button class="btn btn-ghost" data-go="services">'+ui().icon("layers",15)+' Service Library</button>'+
      '<button class="btn btn-primary" data-action="new-service">'+ui().icon("plus",15)+' Nouveau service</button></div>'+
    '</div>'+
    (services.length ? categories.map(cat => {
      const list = services.filter(s => s.category === cat);
      const total = list.reduce((s,x)=>s+(Number(x.price)||0),0);
      return '<div class="section-block" data-stagger><div class="section-head"><h2>'+ui().esc(cat)+'</h2>'+
        '<span>'+list.length+' · '+ui().money(total)+'</span></div>'+
        '<div class="cat-list">'+list.map(s =>
          '<div class="cat-row'+(s.active?"":" off")+'"><div><strong>'+ui().esc(s.name)+'</strong>'+
          '<small>'+ui().esc(s.description||"")+'</small></div>'+
          '<div class="cat-right"><b>'+ui().money(s.price)+'</b><span>'+s.duration+' min</span>'+
          '<span class="chip-mini'+(s.active?"":" alt")+'">'+(s.active?"Actif":"Inactif")+'</span></div></div>').join("")+
        '</div></div>';
    }).join("") : ui().emptyState("Catalogue vide","Ajoutez des services pour construire votre catalogue.",""))+
    '<p class="honest-note" data-stagger>Le catalogue alimente les estimations et le formulaire public côté client (config.js).</p>';
}

QG.views = QG.views || {};
QG.views.services = {title:"Services",subtitle:"Service Library",render:render,handle:handle};
QG.views.catalogue = {title:"Catalogue",subtitle:"Offre par catégorie",render:renderCatalogue,handle:handle};
})();
