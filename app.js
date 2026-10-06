
const C = window.QUOTEGO_CONFIG;
const $ = q => document.querySelector(q);
const host = $("#stepHost");
const STORAGE_KEY = "quotego_demo_v3";

let lang = localStorage.getItem("quotego_lang") || "fr";
let step = 1;

const initialState = () => ({
  vehicle: C.vehicles[0].id,
  package: C.packages.find(x => x.featured)?.id || C.packages[0].id,
  condition: C.conditions[0].id,
  extras: [],
  customer: { name:"", car:"", date:"", note:"" },
  ref: createQuoteRef()
});

let state = loadDraft() || initialState();

const T = {
  fr:{
    heroEyebrow:"DEVIS EN 30 SECONDES",heroCopy:"Configure ton nettoyage, découvre ton estimation et envoie ta demande directement sur WhatsApp.",
    chipPrice:"Prix instantané",estimate:"Estimation",continue:"Continuer",back:"Retour",
    noAccount:"Aucun compte requis",noAccountSub:"Le client remplit simplement sa demande.",
    direct:"Direct WhatsApp",directSub:"Le professionnel reçoit une demande structurée.",
    fast:"Rapide à configurer",fastSub:"Tarifs, services, logo et numéro sont modifiables.",
    s1:"Quel véhicule ?",s1p:"Le gabarit influence le temps de travail.",
    s2:"Choisis la formule",s2p:"Sélectionne le service principal.",
    s3:"État & options",s3p:"Ajoute uniquement ce dont tu as besoin.",
    s4:"Ta demande",s4p:"Complète les informations pour préparer la demande.",
    condition:"État général",name:"Prénom",car:"Marque & modèle",date:"Jour souhaité",note:"Remarque",
    send:"Préparer WhatsApp",popular:"POPULAIRE",summary:"Résumé",indicative:"Estimation indicative. Le professionnel confirme toujours le prix final.",
    step:"Étape",of:"sur",none:"Aucune option",restart:"Recommencer",required:"Champ requis",
    formError:"Complète le prénom, le véhicule et la date pour préparer la demande.",
    draftSaved:"Brouillon sauvegardé",quoteRef:"Référence",vehicleStep:"Véhicule",packageStep:"Formule",optionsStep:"Options",detailsStep:"Coordonnées"
  },
  nl:{
    heroEyebrow:"PRIJS IN 30 SECONDEN",heroCopy:"Stel je reiniging samen, bekijk meteen je prijsindicatie en stuur je aanvraag rechtstreeks via WhatsApp.",
    chipPrice:"Directe prijs",estimate:"Schatting",continue:"Verder",back:"Terug",
    noAccount:"Geen account nodig",noAccountSub:"De klant vult gewoon de aanvraag in.",
    direct:"Direct WhatsApp",directSub:"De professional ontvangt een gestructureerde aanvraag.",
    fast:"Snel ingesteld",fastSub:"Prijzen, diensten, logo en nummer zijn aanpasbaar.",
    s1:"Welk voertuig?",s1p:"Het formaat beïnvloedt de werktijd.",
    s2:"Kies je pakket",s2p:"Selecteer de hoofdservice.",
    s3:"Staat & opties",s3p:"Voeg enkel toe wat je nodig hebt.",
    s4:"Jouw aanvraag",s4p:"Vul de gegevens in om de aanvraag klaar te maken.",
    condition:"Algemene staat",name:"Voornaam",car:"Merk & model",date:"Gewenste dag",note:"Opmerking",
    send:"WhatsApp voorbereiden",popular:"POPULAIR",summary:"Overzicht",indicative:"Indicatieve schatting. De professional bevestigt altijd de definitieve prijs.",
    step:"Stap",of:"van",none:"Geen opties",restart:"Opnieuw",required:"Verplicht",
    formError:"Vul je naam, voertuig en datum in om verder te gaan.",
    draftSaved:"Concept opgeslagen",quoteRef:"Referentie",vehicleStep:"Voertuig",packageStep:"Pakket",optionsStep:"Opties",detailsStep:"Gegevens"
  },
  en:{
    heroEyebrow:"QUOTE IN 30 SECONDS",heroCopy:"Build your detailing service, see your estimate instantly and send your request straight to WhatsApp.",
    chipPrice:"Instant pricing",estimate:"Estimate",continue:"Continue",back:"Back",
    noAccount:"No account required",noAccountSub:"The customer simply fills in the request.",
    direct:"Direct WhatsApp",directSub:"The business receives a structured request.",
    fast:"Quick to configure",fastSub:"Pricing, services, logo and number are editable.",
    s1:"What vehicle?",s1p:"Vehicle size affects work time.",
    s2:"Choose your package",s2p:"Select the main service.",
    s3:"Condition & extras",s3p:"Add only what you need.",
    s4:"Your request",s4p:"Complete the details to prepare your request.",
    condition:"Overall condition",name:"First name",car:"Make & model",date:"Preferred day",note:"Note",
    send:"Prepare WhatsApp",popular:"POPULAR",summary:"Summary",indicative:"Indicative estimate. The business always confirms the final price.",
    step:"Step",of:"of",none:"No extras",restart:"Restart",required:"Required",
    formError:"Add your name, vehicle and preferred date to continue.",
    draftSaved:"Draft saved",quoteRef:"Reference",vehicleStep:"Vehicle",packageStep:"Package",optionsStep:"Extras",detailsStep:"Details"
  },
  ar:{
    heroEyebrow:"عرض سعر خلال 30 ثانية",heroCopy:"اختر خدمة التنظيف، شاهد السعر التقديري فوراً وأرسل طلبك مباشرة عبر واتساب.",
    chipPrice:"سعر فوري",estimate:"السعر التقديري",continue:"متابعة",back:"رجوع",
    noAccount:"لا حاجة لحساب",noAccountSub:"العميل يملأ الطلب فقط.",
    direct:"واتساب مباشر",directSub:"المحترف يتلقى طلباً منظماً.",
    fast:"إعداد سريع",fastSub:"يمكن تعديل الأسعار والخدمات والشعار والرقم.",
    s1:"ما نوع السيارة؟",s1p:"حجم السيارة يؤثر على مدة العمل.",
    s2:"اختر الباقة",s2p:"اختر الخدمة الرئيسية.",
    s3:"الحالة والإضافات",s3p:"أضف فقط ما تحتاجه.",
    s4:"طلبك",s4p:"أكمل المعلومات لتحضير الطلب.",
    condition:"الحالة العامة",name:"الاسم",car:"الماركة والموديل",date:"اليوم المطلوب",note:"ملاحظة",
    send:"تحضير واتساب",popular:"الأكثر طلباً",summary:"الملخص",indicative:"السعر تقديري. المحترف يؤكد السعر النهائي دائماً.",
    step:"الخطوة",of:"من",none:"لا إضافات",restart:"ابدأ من جديد",required:"مطلوب",
    formError:"أدخل الاسم والسيارة والتاريخ للمتابعة.",
    draftSaved:"تم حفظ المسودة",quoteRef:"المرجع",vehicleStep:"السيارة",packageStep:"الباقة",optionsStep:"الإضافات",detailsStep:"البيانات"
  }
};

const currency = new Intl.NumberFormat(C.business.locale, {
  style:"currency", currency:C.business.currency, maximumFractionDigits:0
});

function tr(key){ return T[lang]?.[key] || T.fr[key] || key; }
function label(obj){ return obj?.label?.[lang] || obj?.label?.fr || ""; }
function desc(obj){ return obj?.description?.[lang] || obj?.description?.fr || obj?.subtitle?.[lang] || obj?.subtitle?.fr || ""; }
function money(n){ return currency.format(n); }
function selected(list,id){ return list.find(x => x.id === id); }
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }

function createQuoteRef(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "QG-";
  for(let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

function loadDraft(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!parsed || typeof parsed !== "object") return null;
    return {
      ...initialStateSafe(),
      ...parsed,
      customer:{...initialStateSafe().customer,...(parsed.customer||{})},
      ref: parsed.ref || createQuoteRef()
    };
  }catch(e){ return null; }
}

function initialStateSafe(){
  return {
    vehicle:C.vehicles[0].id,
    package:C.packages.find(x=>x.featured)?.id || C.packages[0].id,
    condition:C.conditions[0].id,
    extras:[],
    customer:{name:"",car:"",date:"",note:""},
    ref:createQuoteRef()
  };
}

function saveDraft(show=true){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if(show){
      const el = $("#draftStatus");
      if(el){
        el.textContent = tr("draftSaved");
        el.classList.add("flash");
        setTimeout(()=>el.classList.remove("flash"),650);
      }
    }
  }catch(e){}
}

function total(){
  const v=selected(C.vehicles,state.vehicle), p=selected(C.packages,state.package), c=selected(C.conditions,state.condition);
  return (v?.price||0)+(p?.price||0)+(c?.price||0)+state.extras.reduce((s,id)=>s+(selected(C.extras,id)?.price||0),0);
}

function setTheme(){
  document.documentElement.style.setProperty("--accent",C.business.accent);
  document.documentElement.style.setProperty("--accent2",C.business.accent2);
  $("#brandMark").textContent=C.business.logoText||"Q";
  $("#brandName").textContent=C.business.shortName||C.business.name;
  $("#brandLocation").textContent=C.business.city||"";
  document.title=(C.business.shortName||C.business.name)+" — QuoteGo";
  $("#heroTitle").innerHTML =
    lang==="fr" ? `${C.business.tagline.split(". ")[0]}.<br><span>${C.business.tagline.split(". ").slice(1).join(". ")||"Ton prix. Maintenant."}</span>` :
    lang==="nl" ? `Jouw voertuig.<br><span>Jouw prijs. Meteen.</span>` :
    lang==="ar" ? `سيارتك.<br><span>سعرك. الآن.</span>` :
    `Your vehicle.<br><span>Your price. Now.</span>`;
}

function applyTranslations(){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
  $("#langSelect").value=lang;
  $("#backBtn span").textContent=tr("back");
  $("#draftStatus").textContent=tr("draftSaved");
  setTheme();
}

function head(i,title,p){
  return `<div class="step-head">
    <div class="step-index">0${i}</div>
    <div><h2>${title}</h2><p>${p}</p></div>
  </div>`;
}

function renderJourney(){
  const names=[tr("vehicleStep"),tr("packageStep"),tr("optionsStep"),tr("detailsStep")];
  $("#journeySteps").innerHTML=names.map((name,i)=>{
    const n=i+1;
    const cls=n===step?"active":n<step?"done":"";
    return `<button class="journey-step ${cls}" data-step="${n}" ${n>step?"disabled":""}>
      <span>${n<step?"✓":n}</span><b>${name}</b>
    </button>`;
  }).join("");
  document.querySelectorAll(".journey-step:not([disabled])").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const target=Number(btn.dataset.step);
      if(target<step){ syncCustomer(); step=target; render(); scrollToApp(); }
    });
  });
}

function render1(){
  host.innerHTML=`<section class="step">${head(1,tr("s1"),tr("s1p"))}
  <div class="grid">${C.vehicles.map(v=>`
    <label class="choice ${state.vehicle===v.id?"active":""}">
      <input type="radio" name="vehicle" value="${v.id}" ${state.vehicle===v.id?"checked":""}>
      <div class="choice-check">✓</div>
      <div class="emoji">${v.emoji}</div>
      <strong>${label(v)}</strong><small>${v.subtitle?.[lang]||v.subtitle?.fr||""}</small>
      <span class="price-tag">${v.price?`+${money(v.price)}`:money(0)}</span>
    </label>`).join("")}</div></section>`;
}

function render2(){
  host.innerHTML=`<section class="step">${head(2,tr("s2"),tr("s2p"))}
  <div class="stack">${C.packages.map(p=>`
    <label class="package ${state.package===p.id?"active":""}">
      ${p.featured?`<span class="badge">${tr("popular")}</span>`:""}
      <input type="radio" name="package" value="${p.id}" ${state.package===p.id?"checked":""}>
      <div class="package-row">
        <div><strong>${label(p)}</strong><small>${desc(p)}</small></div>
        <b>${money(p.price)}</b>
      </div>
    </label>`).join("")}</div></section>`;
}

function render3(){
  host.innerHTML=`<section class="step">${head(3,tr("s3"),tr("s3p"))}
    <p class="mini-title">${tr("condition")}</p>
    <div class="segment">${C.conditions.map(c=>`
      <label class="${state.condition===c.id?"active":""}">
        <input type="radio" name="condition" value="${c.id}" ${state.condition===c.id?"checked":""}>
        <span>${label(c)}${c.price?` +${money(c.price)}`:""}</span>
      </label>`).join("")}</div>
    <div class="extras">${C.extras.map(e=>`
      <label class="extra">
        <div><strong>${label(e)}</strong><small>${desc(e)}</small></div>
        <div class="toggle ${state.extras.includes(e.id)?"active":""}">
          <em>+${money(e.price)}</em>
          <input type="checkbox" name="extra" value="${e.id}" ${state.extras.includes(e.id)?"checked":""}>
          <span class="switch"></span>
        </div>
      </label>`).join("")}</div>
  </section>`;
}

function render4(){
  const v=selected(C.vehicles,state.vehicle), p=selected(C.packages,state.package), c=selected(C.conditions,state.condition);
  const ex=state.extras.map(id=>selected(C.extras,id)).filter(Boolean);

  host.innerHTML=`<section class="step">${head(4,tr("s4"),tr("s4p"))}
    <div id="formAlert" class="form-alert" role="alert"></div>

    <div class="fields">
      <label class="field" data-field="name">
        <span>${tr("name")} <i>*</i></span>
        <input id="fName" autocomplete="given-name" value="${escapeHtml(state.customer.name)}" placeholder="Imran">
        <small class="field-error">${tr("required")}</small>
      </label>
      <label class="field" data-field="car">
        <span>${tr("car")} <i>*</i></span>
        <input id="fCar" autocomplete="off" value="${escapeHtml(state.customer.car)}" placeholder="BMW Série 3">
        <small class="field-error">${tr("required")}</small>
      </label>
      <label class="field" data-field="date">
        <span>${tr("date")} <i>*</i></span>
        <input id="fDate" type="date" value="${state.customer.date}">
        <small class="field-error">${tr("required")}</small>
      </label>
      <label class="field">
        <span>${tr("note")}</span>
        <textarea id="fNote" rows="3" placeholder="...">${escapeHtml(state.customer.note)}</textarea>
      </label>
    </div>

    <div class="summary">
      <div class="summary-top">
        <div class="summary-price"><div><small>${tr("summary")}</small><strong>${money(total())}</strong></div><span>⚡</span></div>
        <div class="quote-ref"><span>${tr("quoteRef")}</span><b>${state.ref}</b></div>
      </div>
      <div class="summary-lines">
        <div class="summary-line"><span>${label(v)}</span><b>${v.price?`+${money(v.price)}`:money(0)}</b></div>
        <div class="summary-line"><span>${label(p)}</span><b>${money(p.price)}</b></div>
        <div class="summary-line"><span>${label(c)}</span><b>${c.price?`+${money(c.price)}`:money(0)}</b></div>
        ${ex.length?ex.map(x=>`<div class="summary-line"><span>${label(x)}</span><b>+${money(x.price)}</b></div>`).join(""):`<div class="summary-line"><span>${tr("none")}</span><b>—</b></div>`}
      </div>
      <p class="note">${tr("indicative")}</p>
    </div>
  </section>`;
}

function render(){
  applyTranslations();
  [render1,render2,render3,render4][step-1]();

  const pct=step/4*100;
  $("#progressBar").style.width=`${pct}%`;
  $("#progressPct").textContent=`${pct}%`;
  $("#progressLabel").textContent=`${tr("step")} ${step} ${tr("of")} 4`;
  $("#liveTotal").textContent=money(total());
  $("#backBtn").classList.toggle("hidden",step===1);
  $("#mainBtn").innerHTML=step===4
    ? `<span>${tr("send")}</span><b>↗</b>`
    : `<span>${tr("continue")}</span><b>→</b>`;

  renderJourney();
  bind();
}

function bind(){
  host.querySelectorAll('input[name="vehicle"]').forEach(x=>x.addEventListener("change",e=>{
    state.vehicle=e.target.value; saveDraft(); render();
  }));

  host.querySelectorAll('input[name="package"]').forEach(x=>x.addEventListener("change",e=>{
    state.package=e.target.value; saveDraft(); render();
  }));

  host.querySelectorAll('input[name="condition"]').forEach(x=>x.addEventListener("change",e=>{
    state.condition=e.target.value; saveDraft(); render();
  }));

  host.querySelectorAll('input[name="extra"]').forEach(x=>x.addEventListener("change",e=>{
    state.extras=e.target.checked
      ? [...new Set([...state.extras,e.target.value])]
      : state.extras.filter(id=>id!==e.target.value);
    saveDraft(); render();
  }));

  ["fName","fCar","fDate","fNote"].forEach(id=>{
    const el=$("#"+id);
    if(el) el.addEventListener("input",()=>{
      syncCustomer();
      clearFieldError(id);
      saveDraft();
    });
  });

  const d=$("#fDate");
  if(d){
    const now=new Date();
    d.min=now.toISOString().split("T")[0];
  }
}

function syncCustomer(){
  if($("#fName")) state.customer.name=$("#fName").value.trim();
  if($("#fCar")) state.customer.car=$("#fCar").value.trim();
  if($("#fDate")) state.customer.date=$("#fDate").value;
  if($("#fNote")) state.customer.note=$("#fNote").value.trim();
}

function clearFieldError(id){
  const map={fName:"name",fCar:"car",fDate:"date"};
  const key=map[id];
  if(!key) return;
  const field=document.querySelector(`[data-field="${key}"]`);
  if(field) field.classList.remove("invalid");
  const alert=$("#formAlert");
  if(alert) alert.classList.remove("show");
}

function validateFinal(){
  syncCustomer();
  const missing=[];
  if(!state.customer.name) missing.push("name");
  if(!state.customer.car) missing.push("car");
  if(!state.customer.date) missing.push("date");

  document.querySelectorAll(".field.invalid").forEach(x=>x.classList.remove("invalid"));
  missing.forEach(key=>document.querySelector(`[data-field="${key}"]`)?.classList.add("invalid"));

  const alert=$("#formAlert");
  if(missing.length){
    alert.textContent=tr("formError");
    alert.classList.add("show");
    document.querySelector(".field.invalid input")?.focus();
    return false;
  }
  alert.classList.remove("show");
  saveDraft(false);
  return true;
}

function scrollToApp(){
  $(".app-card").scrollIntoView({behavior:"smooth",block:"start"});
}

function buildMessage(){
  const v=selected(C.vehicles,state.vehicle),p=selected(C.packages,state.package),c=selected(C.conditions,state.condition);
  const ex=state.extras.map(id=>selected(C.extras,id)).filter(Boolean);
  const x=state.customer;

  if(lang==="nl") return `Hallo 👋

Ik wil graag een detailing-afspraak aanvragen.

🔖 Referentie: ${state.ref}
👤 Naam: ${x.name}
🚘 Voertuig: ${x.car}
📦 Pakket: ${label(p)}
🚗 Categorie: ${label(v)}
🧼 Staat: ${label(c)}
✨ Opties: ${ex.length?ex.map(label).join(", "):tr("none")}
📅 Gewenste dag: ${x.date}
📝 Opmerking: ${x.note||"-"}

💰 QuoteGo schatting: ${money(total())}

Kunnen jullie de definitieve prijs en beschikbaarheid bevestigen?`;

  if(lang==="en") return `Hello 👋

I'd like to request a detailing appointment.

🔖 Reference: ${state.ref}
👤 Name: ${x.name}
🚘 Vehicle: ${x.car}
📦 Package: ${label(p)}
🚗 Category: ${label(v)}
🧼 Condition: ${label(c)}
✨ Extras: ${ex.length?ex.map(label).join(", "):tr("none")}
📅 Preferred day: ${x.date}
📝 Note: ${x.note||"-"}

💰 QuoteGo estimate: ${money(total())}

Can you confirm the final price and availability?`;

  if(lang==="ar") return `مرحباً 👋

أرغب في حجز خدمة تنظيف وتفصيل للسيارة.

🔖 المرجع: ${state.ref}
👤 الاسم: ${x.name}
🚘 السيارة: ${x.car}
📦 الباقة: ${label(p)}
🚗 الفئة: ${label(v)}
🧼 الحالة: ${label(c)}
✨ الإضافات: ${ex.length?ex.map(label).join("، "):tr("none")}
📅 اليوم المطلوب: ${x.date}
📝 ملاحظة: ${x.note||"-"}

💰 تقدير QuoteGo: ${money(total())}

هل يمكن تأكيد السعر النهائي والتوفر؟`;

  return `Bonjour 👋

Je souhaite demander un rendez-vous detailing.

🔖 Référence : ${state.ref}
👤 Prénom : ${x.name}
🚘 Véhicule : ${x.car}
📦 Formule : ${label(p)}
🚗 Catégorie : ${label(v)}
🧼 État : ${label(c)}
✨ Options : ${ex.length?ex.map(label).join(", "):tr("none")}
📅 Jour souhaité : ${x.date}
📝 Remarque : ${x.note||"-"}

💰 Estimation QuoteGo : ${money(total())}

Pouvez-vous me confirmer le tarif final et la disponibilité ?`;
}


const REQUESTS_KEY = "quotego_requests_v1";

function getRequests(){
  try{
    const data = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

function saveRequest(){
  const v=selected(C.vehicles,state.vehicle);
  const p=selected(C.packages,state.package);
  const c=selected(C.conditions,state.condition);
  const ex=state.extras.map(id=>selected(C.extras,id)).filter(Boolean);

  const request = {
    ref: state.ref,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: {
      name: state.customer.name,
      car: state.customer.car,
      date: state.customer.date,
      note: state.customer.note
    },
    vehicle: { id:v?.id || "", label:label(v) },
    package: { id:p?.id || "", label:label(p) },
    condition: { id:c?.id || "", label:label(c) },
    extras: ex.map(x=>({id:x.id,label:label(x),price:x.price||0})),
    estimate: total(),
    currency: C.business.currency,
    language: lang,
    status: "new"
  };

  const requests = getRequests();
  const i = requests.findIndex(x=>x.ref===request.ref);

  if(i>=0){
    request.status = requests[i].status || "new";
    request.createdAt = requests[i].createdAt || request.createdAt;
    requests[i] = request;
  }else{
    requests.unshift(request);
  }

  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

  try{
    const channel = new BroadcastChannel("quotego_admin");
    channel.postMessage({type:"request-updated", ref:request.ref});
    channel.close();
  }catch(e){}

  return request;
}

function whatsapp(){
  const msg=buildMessage();
  saveRequest();
  if(C.business.demoMode || !/^\d{8,15}$/.test(C.business.whatsapp)){
    showDemoMessage(msg);
    return;
  }
  window.open(`https://wa.me/${C.business.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");
}

function showDemoMessage(msg){
  let modal=document.getElementById("demoModal");
  if(!modal){
    modal=document.createElement("div");
    modal.id="demoModal";
    modal.innerHTML=`
      <div class="demo-backdrop"></div>
      <div class="demo-modal">
        <div class="demo-modal-head">
          <div><small>MODE DÉMO</small><h3>Message WhatsApp généré</h3></div>
          <button id="demoClose" aria-label="Fermer">×</button>
        </div>
        <p class="demo-explain">Voici exactement le message que le professionnel recevrait. Aucun numéro personnel n’est utilisé dans cette démo.</p>
        <pre id="demoMessage"></pre>
        <div class="modal-actions">
          <button id="demoCopy" class="main-btn" type="button">Copier le message</button>
          <button id="demoEdit" class="modal-secondary" type="button">Modifier la demande</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    $("#demoClose").onclick=()=>modal.classList.remove("show");
    modal.querySelector(".demo-backdrop").onclick=()=>modal.classList.remove("show");
    $("#demoEdit").onclick=()=>modal.classList.remove("show");
    $("#demoCopy").onclick=async()=>{
      const text=$("#demoMessage").textContent;
      try{
        await navigator.clipboard.writeText(text);
        $("#demoCopy").textContent="Copié ✓";
        setTimeout(()=>$("#demoCopy").textContent="Copier le message",1200);
      }catch(e){}
    };
  }
  $("#demoMessage").textContent=msg;
  modal.classList.add("show");
}

$("#mainBtn").addEventListener("click",()=>{
  if(step<4){
    syncCustomer();
    step++;
    saveDraft(false);
    render();
    scrollToApp();
  }else if(validateFinal()){
    whatsapp();
  }
});

$("#backBtn").addEventListener("click",()=>{
  if(step>1){
    syncCustomer();
    step--;
    saveDraft(false);
    render();
    scrollToApp();
  }
});

$("#restartBtn").addEventListener("click",()=>{
  localStorage.removeItem(STORAGE_KEY);
  step=1;
  state=initialState();
  render();
  scrollToApp();
});

$("#langSelect").addEventListener("change",e=>{
  lang=e.target.value;
  localStorage.setItem("quotego_lang",lang);
  render();
});

render();

// Commercial CTA
function openSalesModal(){document.getElementById("salesModal")?.classList.add("show")}
function closeSalesModal(){document.getElementById("salesModal")?.classList.remove("show")}
document.getElementById("salesCta")?.addEventListener("click",openSalesModal);
document.getElementById("salesClose")?.addEventListener("click",closeSalesModal);
document.querySelector(".sales-backdrop")?.addEventListener("click",closeSalesModal);

document.getElementById("copyInterest")?.addEventListener("click",async()=>{
  const msg="Bonjour, je viens de tester QuoteGo et je voudrais une version adaptée à mon entreprise. Je souhaite en savoir plus sur la personnalisation des prestations, tarifs, langues et WhatsApp.";
  try{
    await navigator.clipboard.writeText(msg);
    document.getElementById("copyStatus").textContent="Message copié ✓";
  }catch(e){
    document.getElementById("copyStatus").textContent="Copie impossible sur ce navigateur.";
  }
});
