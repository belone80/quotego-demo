
const C = window.QUOTEGO_CONFIG;
let lang = localStorage.getItem("quotego_lang") || "fr";
let step = 1;

const state = {
  vehicle: C.vehicles[0].id,
  package: C.packages.find(x=>x.featured)?.id || C.packages[0].id,
  condition: C.conditions[0].id,
  extras: [],
  customer: { name:"", car:"", date:"", note:"" }
};

const T = {
  fr:{heroEyebrow:"DEVIS EN 30 SECONDES",heroCopy:"Configure ton nettoyage, découvre ton estimation et envoie ta demande directement sur WhatsApp.",chipPrice:"Prix instantané",estimate:"Estimation",continue:"Continuer",noAccount:"Aucun compte requis",noAccountSub:"Le client remplit simplement sa demande.",direct:"Direct WhatsApp",directSub:"Le professionnel reçoit une demande structurée.",fast:"Rapide à configurer",fastSub:"Tarifs, services, logo et numéro sont modifiables.",s1:"Quel véhicule ?",s1p:"Le gabarit influence le temps de travail.",s2:"Choisis la formule",s2p:"Sélectionne le service principal.",s3:"État & options",s3p:"Ajoute uniquement ce dont tu as besoin.",s4:"Ta demande",s4p:"Ces infos seront ajoutées au message WhatsApp.",condition:"État général",name:"Prénom",car:"Marque & modèle",date:"Jour souhaité",note:"Remarque",send:"Envoyer sur WhatsApp",popular:"POPULAIRE",summary:"Résumé",indicative:"Estimation indicative. Le professionnel confirme toujours le prix final.",step:"Étape",of:"sur",none:"Aucune option",restart:"Recommencer"},
  nl:{heroEyebrow:"PRIJS IN 30 SECONDEN",heroCopy:"Stel je reiniging samen, bekijk meteen je prijsindicatie en stuur je aanvraag rechtstreeks via WhatsApp.",chipPrice:"Directe prijs",estimate:"Schatting",continue:"Verder",noAccount:"Geen account nodig",noAccountSub:"De klant vult gewoon de aanvraag in.",direct:"Direct WhatsApp",directSub:"De professional ontvangt een gestructureerde aanvraag.",fast:"Snel ingesteld",fastSub:"Prijzen, diensten, logo en nummer zijn aanpasbaar.",s1:"Welk voertuig?",s1p:"Het formaat beïnvloedt de werktijd.",s2:"Kies je pakket",s2p:"Selecteer de hoofdservice.",s3:"Staat & opties",s3p:"Voeg enkel toe wat je nodig hebt.",s4:"Jouw aanvraag",s4p:"Deze info wordt toegevoegd aan WhatsApp.",condition:"Algemene staat",name:"Voornaam",car:"Merk & model",date:"Gewenste dag",note:"Opmerking",send:"Versturen via WhatsApp",popular:"POPULAIR",summary:"Overzicht",indicative:"Indicatieve schatting. De professional bevestigt altijd de definitieve prijs.",step:"Stap",of:"van",none:"Geen opties",restart:"Opnieuw"},
  en:{heroEyebrow:"QUOTE IN 30 SECONDS",heroCopy:"Build your detailing service, see your estimate instantly and send your request straight to WhatsApp.",chipPrice:"Instant pricing",estimate:"Estimate",continue:"Continue",noAccount:"No account required",noAccountSub:"The customer simply fills in the request.",direct:"Direct WhatsApp",directSub:"The business receives a structured request.",fast:"Quick to configure",fastSub:"Pricing, services, logo and number are editable.",s1:"What vehicle?",s1p:"Vehicle size affects work time.",s2:"Choose your package",s2p:"Select the main service.",s3:"Condition & extras",s3p:"Add only what you need.",s4:"Your request",s4p:"These details will be added to WhatsApp.",condition:"Overall condition",name:"First name",car:"Make & model",date:"Preferred day",note:"Note",send:"Send on WhatsApp",popular:"POPULAR",summary:"Summary",indicative:"Indicative estimate. The business always confirms the final price.",step:"Step",of:"of",none:"No extras",restart:"Restart"},
  ar:{heroEyebrow:"عرض سعر خلال 30 ثانية",heroCopy:"اختر خدمة التنظيف، شاهد السعر التقديري فوراً وأرسل طلبك مباشرة عبر واتساب.",chipPrice:"سعر فوري",estimate:"السعر التقديري",continue:"متابعة",noAccount:"لا حاجة لحساب",noAccountSub:"العميل يملأ الطلب فقط.",direct:"واتساب مباشر",directSub:"المحترف يتلقى طلباً منظماً.",fast:"إعداد سريع",fastSub:"يمكن تعديل الأسعار والخدمات والشعار والرقم.",s1:"ما نوع السيارة؟",s1p:"حجم السيارة يؤثر على مدة العمل.",s2:"اختر الباقة",s2p:"اختر الخدمة الرئيسية.",s3:"الحالة والإضافات",s3p:"أضف فقط ما تحتاجه.",s4:"طلبك",s4p:"ستضاف هذه المعلومات إلى رسالة واتساب.",condition:"الحالة العامة",name:"الاسم",car:"الماركة والموديل",date:"اليوم المطلوب",note:"ملاحظة",send:"إرسال عبر واتساب",popular:"الأكثر طلباً",summary:"الملخص",indicative:"السعر تقديري. المحترف يؤكد السعر النهائي دائماً.",step:"الخطوة",of:"من",none:"لا إضافات",restart:"ابدأ من جديد"}
};

const $ = q => document.querySelector(q);
const host = $("#stepHost");
const currency = new Intl.NumberFormat(C.business.locale,{style:"currency",currency:C.business.currency,maximumFractionDigits:0});

function tr(key){ return T[lang][key] || T.fr[key] || key; }
function label(obj){ return obj.label?.[lang] || obj.label?.fr || ""; }
function desc(obj){ return obj.description?.[lang] || obj.description?.fr || obj.subtitle?.[lang] || obj.subtitle?.fr || ""; }
function money(n){ return currency.format(n); }
function selected(list,id){ return list.find(x=>x.id===id); }
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
  document.title=C.business.shortName||C.business.name;
  $("#heroTitle").innerHTML = lang==="fr" ? `${C.business.tagline.split(". ")[0]}.<br><span>${C.business.tagline.split(". ").slice(1).join(". ")||"Ton prix. Maintenant."}</span>` :
    lang==="nl" ? `Jouw voertuig.<br><span>Jouw prijs. Meteen.</span>` :
    lang==="ar" ? `سيارتك.<br><span>سعرك. الآن.</span>` :
    `Your vehicle.<br><span>Your price. Now.</span>`;
}
function applyTranslations(){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
  $("#langSelect").value=lang;
  setTheme();
}
function head(i,title,p){
 return `<div class="step-head"><div class="step-index">0${i}</div><div><h2>${title}</h2><p>${p}</p></div></div>`;
}
function render1(){
 host.innerHTML=`<section class="step">${head(1,tr("s1"),tr("s1p"))}<div class="grid">${C.vehicles.map(v=>`
 <label class="choice ${state.vehicle===v.id?"active":""}">
 <input type="radio" name="vehicle" value="${v.id}" ${state.vehicle===v.id?"checked":""}>
 <div class="emoji">${v.emoji}</div><strong>${label(v)}</strong><small>${v.subtitle?.[lang]||v.subtitle?.fr||""}</small>
 <span class="price-tag">${v.price?`+${money(v.price)}`:`+${money(0)}`}</span></label>`).join("")}</div></section>`;
}
function render2(){
 host.innerHTML=`<section class="step">${head(2,tr("s2"),tr("s2p"))}<div class="stack">${C.packages.map(p=>`
 <label class="package ${state.package===p.id?"active":""}">
 ${p.featured?`<span class="badge">${tr("popular")}</span>`:""}
 <input type="radio" name="package" value="${p.id}" ${state.package===p.id?"checked":""}>
 <div class="package-row"><div><strong>${label(p)}</strong><small>${desc(p)}</small></div><b>${money(p.price)}</b></div></label>`).join("")}</div></section>`;
}
function render3(){
 host.innerHTML=`<section class="step">${head(3,tr("s3"),tr("s3p"))}
 <p style="font-size:9px;font-weight:900;color:#cbdad4;margin:0 0 8px">${tr("condition")}</p>
 <div class="segment">${C.conditions.map(c=>`<label class="${state.condition===c.id?"active":""}">
 <input type="radio" name="condition" value="${c.id}" ${state.condition===c.id?"checked":""}><span>${label(c)}${c.price?` +${money(c.price)}`:""}</span></label>`).join("")}</div>
 <div class="extras">${C.extras.map(e=>`<label class="extra"><div><strong>${label(e)}</strong><small>${desc(e)}</small></div>
 <div class="toggle ${state.extras.includes(e.id)?"active":""}"><em>+${money(e.price)}</em><input type="checkbox" name="extra" value="${e.id}" ${state.extras.includes(e.id)?"checked":""}><span class="switch"></span></div></label>`).join("")}</div>
 </section>`;
}
function render4(){
 const v=selected(C.vehicles,state.vehicle),p=selected(C.packages,state.package),c=selected(C.conditions,state.condition);
 const ex=state.extras.map(id=>selected(C.extras,id));
 host.innerHTML=`<section class="step">${head(4,tr("s4"),tr("s4p"))}
 <div class="fields">
 <label class="field"><span>${tr("name")}</span><input id="fName" value="${escapeHtml(state.customer.name)}" placeholder="Imran"></label>
 <label class="field"><span>${tr("car")}</span><input id="fCar" value="${escapeHtml(state.customer.car)}" placeholder="BMW Série 3"></label>
 <label class="field"><span>${tr("date")}</span><input id="fDate" type="date" value="${state.customer.date}"></label>
 <label class="field"><span>${tr("note")}</span><textarea id="fNote" rows="3" placeholder="...">${escapeHtml(state.customer.note)}</textarea></label>
 </div>
 <div class="summary">
 <div class="summary-price"><div><small>${tr("summary")}</small><strong>${money(total())}</strong></div><span>⚡</span></div>
 <div class="summary-lines">
 <div class="summary-line"><span>${label(v)}</span><b>${v.price?`+${money(v.price)}`:money(0)}</b></div>
 <div class="summary-line"><span>${label(p)}</span><b>${money(p.price)}</b></div>
 <div class="summary-line"><span>${label(c)}</span><b>${c.price?`+${money(c.price)}`:money(0)}</b></div>
 ${ex.length?ex.map(x=>`<div class="summary-line"><span>${label(x)}</span><b>+${money(x.price)}</b></div>`).join(""):`<div class="summary-line"><span>${tr("none")}</span><b>—</b></div>`}
 </div><p class="note">${tr("indicative")}</p></div></section>`;
}
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function render(){
 applyTranslations();
 [render1,render2,render3,render4][step-1]();
 const pct=step/4*100; $("#progressBar").style.width=`${pct}%`; $("#progressPct").textContent=`${pct}%`;
 $("#progressLabel").textContent=`${tr("step")} ${step} ${tr("of")} 4`; $("#liveTotal").textContent=money(total());
 $("#mainBtn").innerHTML=step===4?`<span>${tr("send")}</span><b>↗</b>`:`<span>${tr("continue")}</span><b>→</b>`;
 bind();
}
function bind(){
 host.querySelectorAll('input[name="vehicle"]').forEach(x=>x.addEventListener("change",e=>{state.vehicle=e.target.value;render()}));
 host.querySelectorAll('input[name="package"]').forEach(x=>x.addEventListener("change",e=>{state.package=e.target.value;render()}));
 host.querySelectorAll('input[name="condition"]').forEach(x=>x.addEventListener("change",e=>{state.condition=e.target.value;render()}));
 host.querySelectorAll('input[name="extra"]').forEach(x=>x.addEventListener("change",e=>{state.extras=e.target.checked?[...state.extras,e.target.value]:state.extras.filter(id=>id!==e.target.value);render()}));
 ["fName","fCar","fDate","fNote"].forEach(id=>{const el=$("#"+id);if(el)el.addEventListener("input",()=>{state.customer.name=$("#fName")?.value||state.customer.name;state.customer.car=$("#fCar")?.value||state.customer.car;state.customer.date=$("#fDate")?.value||state.customer.date;state.customer.note=$("#fNote")?.value||state.customer.note})});
 const d=$("#fDate"); if(d){const now=new Date(); d.min=now.toISOString().split("T")[0];}
}
function whatsapp(){
 const v=selected(C.vehicles,state.vehicle),p=selected(C.packages,state.package),c=selected(C.conditions,state.condition),ex=state.extras.map(id=>selected(C.extras,id));
 const x=state.customer;
 const msg = lang==="nl" ? `Hallo 👋\n\nIk wil graag een detailing-afspraak aanvragen.\n\n👤 Naam: ${x.name||"-"}\n🚘 Voertuig: ${x.car||"-"}\n📦 Pakket: ${label(p)}\n🚗 Categorie: ${label(v)}\n🧼 Staat: ${label(c)}\n✨ Opties: ${ex.length?ex.map(label).join(", "):tr("none")}\n📅 Gewenste dag: ${x.date||"-"}\n📝 Opmerking: ${x.note||"-"}\n\n💰 QuoteGo schatting: ${money(total())}\n\nKunnen jullie de definitieve prijs en beschikbaarheid bevestigen?`
 : lang==="en" ? `Hello 👋\n\nI'd like to request a detailing appointment.\n\n👤 Name: ${x.name||"-"}\n🚘 Vehicle: ${x.car||"-"}\n📦 Package: ${label(p)}\n🚗 Category: ${label(v)}\n🧼 Condition: ${label(c)}\n✨ Extras: ${ex.length?ex.map(label).join(", "):tr("none")}\n📅 Preferred day: ${x.date||"-"}\n📝 Note: ${x.note||"-"}\n\n💰 QuoteGo estimate: ${money(total())}\n\nCan you confirm the final price and availability?`
 : lang==="ar" ? `مرحباً 👋\n\nأرغب في حجز خدمة تنظيف وتفصيل للسيارة.\n\n👤 الاسم: ${x.name||"-"}\n🚘 السيارة: ${x.car||"-"}\n📦 الباقة: ${label(p)}\n🚗 الفئة: ${label(v)}\n🧼 الحالة: ${label(c)}\n✨ الإضافات: ${ex.length?ex.map(label).join("، "):tr("none")}\n📅 اليوم المطلوب: ${x.date||"-"}\n📝 ملاحظة: ${x.note||"-"}\n\n💰 تقدير QuoteGo: ${money(total())}\n\nهل يمكن تأكيد السعر النهائي والتوفر؟`
 : `Bonjour 👋\n\nJe souhaite demander un rendez-vous detailing.\n\n👤 Prénom : ${x.name||"-"}\n🚘 Véhicule : ${x.car||"-"}\n📦 Formule : ${label(p)}\n🚗 Catégorie : ${label(v)}\n🧼 État : ${label(c)}\n✨ Options : ${ex.length?ex.map(label).join(", "):tr("none")}\n📅 Jour souhaité : ${x.date||"-"}\n📝 Remarque : ${x.note||"-"}\n\n💰 Estimation QuoteGo : ${money(total())}\n\nPouvez-vous me confirmer le tarif final et la disponibilité ?`;
 if(C.business.demoMode || !/^\d{8,15}$/.test(C.business.whatsapp)){
   showDemoMessage(msg);
   return;
 }
 window.open(`https://wa.me/${C.business.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");
}

function showDemoMessage(msg){
  let modal = document.getElementById("demoModal");
  if(!modal){
    modal = document.createElement("div");
    modal.id = "demoModal";
    modal.innerHTML = `
      <div class="demo-backdrop"></div>
      <div class="demo-modal">
        <div class="demo-modal-head">
          <div>
            <small>MODE DÉMO</small>
            <h3>Message WhatsApp généré</h3>
          </div>
          <button id="demoClose" aria-label="Fermer">×</button>
        </div>
        <p class="demo-explain">Voici exactement le message que le professionnel recevrait. Aucun numéro personnel n’est utilisé dans cette démo.</p>
        <pre id="demoMessage"></pre>
        <button id="demoCopy" class="main-btn" type="button">Copier le message</button>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById("demoClose").onclick = ()=> modal.classList.remove("show");
    modal.querySelector(".demo-backdrop").onclick = ()=> modal.classList.remove("show");
    document.getElementById("demoCopy").onclick = async ()=>{
      const text = document.getElementById("demoMessage").textContent;
      try{
        await navigator.clipboard.writeText(text);
        document.getElementById("demoCopy").textContent = "Copié ✓";
        setTimeout(()=>document.getElementById("demoCopy").textContent="Copier le message",1200);
      }catch(e){}
    };
  }
  document.getElementById("demoMessage").textContent = msg;
  modal.classList.add("show");
}
$("#mainBtn").addEventListener("click",()=>{if(step<4){step++;render();$(".app-card").scrollIntoView({behavior:"smooth",block:"start"})}else whatsapp()});
$("#restartBtn").addEventListener("click",()=>{step=1;state.vehicle=C.vehicles[0].id;state.package=C.packages.find(x=>x.featured)?.id||C.packages[0].id;state.condition=C.conditions[0].id;state.extras=[];state.customer={name:"",car:"",date:"",note:""};render()});
$("#langSelect").addEventListener("change",e=>{lang=e.target.value;localStorage.setItem("quotego_lang",lang);render()});
render();

function openSalesModal(){document.getElementById("salesModal")?.classList.add("show")}
function closeSalesModal(){document.getElementById("salesModal")?.classList.remove("show")}
document.getElementById("salesCta")?.addEventListener("click",openSalesModal);
document.getElementById("salesClose")?.addEventListener("click",closeSalesModal);
document.querySelector(".sales-backdrop")?.addEventListener("click",closeSalesModal);
document.getElementById("copyInterest")?.addEventListener("click",async()=>{
 const msg="Bonjour, je viens de tester QuoteGo et je voudrais une version adaptée à mon entreprise. Je souhaite en savoir plus sur la personnalisation des prestations, tarifs, langues et WhatsApp.";
 try{await navigator.clipboard.writeText(msg);document.getElementById("copyStatus").textContent="Message copié ✓"}catch(e){document.getElementById("copyStatus").textContent="Copie impossible sur ce navigateur."}
});
