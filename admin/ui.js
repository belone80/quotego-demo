(function(){
const QG = window.QG = window.QG || {};

function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g,m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function money(n,currency){
  const cur = currency || (QG.data ? QG.data.business().currency : "EUR") || "EUR";
  const locale = (QG.data ? QG.data.business().locale : "fr-BE") || "fr-BE";
  try{
    return new Intl.NumberFormat(locale,{style:"currency",currency:cur,maximumFractionDigits:0}).format(Number(n)||0);
  }catch(e){ return (Number(n)||0) + " €"; }
}

function shortDate(value){
  if(!value) return "—";
  const d = new Date(value.length === 10 ? value + "T12:00:00" : value);
  if(Number.isNaN(d.getTime())) return esc(value);
  return new Intl.DateTimeFormat("fr-BE",{day:"2-digit",month:"short",year:"numeric"}).format(d);
}

function dateTime(value){
  if(!value) return "—";
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-BE",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(d);
}

function timeLabel(value){
  if(!value) return null;
  return String(value);
}

function relTime(value){
  if(!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  if(Number.isNaN(diff)) return "—";
  const min = Math.round(diff/60000);
  if(min < 1) return "à l'instant";
  if(min < 60) return "il y a " + min + " min";
  const h = Math.round(min/60);
  if(h < 24) return "il y a " + h + " h";
  const d = Math.round(h/24);
  if(d < 30) return "il y a " + d + " j";
  return shortDate(value);
}

const ICONS = {
  grid:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  sparkles:"M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM5 14l.7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7z",
  inbox:"M4 13h4l2 3h4l2-3h4M4 13l2-8h12l2 8v6H4z",
  calendar:"M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  users:"M8 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 5.5a3 3 0 010 6M17 15c2.4.4 4 2.3 4 5",
  layers:"M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  chart:"M4 20V9M10 20V4M16 20v-7M22 20H2",
  plug:"M9 3v6M15 3v6M6 9h12v3a6 6 0 01-12 0zM12 18v3",
  shield:"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1v.3a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 15a2 2 0 010-4h.1A1.6 1.6 0 005.9 8.3l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0011.4 4.5V4a2 2 0 114 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 001.1 2.7H21a2 2 0 010 4h-.1a1.6 1.6 0 00-1.5 1z",
  search:"M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  bell:"M18 9a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7M10.5 20a2 2 0 003 0",
  plus:"M12 5v14M5 12h14",
  arrow:"M5 12h14M13 6l6 6-6 6",
  back:"M19 12H5M11 18l-6-6 6-6",
  clock:"M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  check:"M4 12.5l5 5L20 6.5",
  bolt:"M13 2L4 14h6l-1 8 9-12h-6z",
  chat:"M21 12a8 8 0 01-8 8H7l-4 3 1-5.5A8 8 0 1121 12z",
  form:"M5 3h14v18H5zM8 8h8M8 12h8M8 16h5",
  flow:"M6 4h5v5H6zM13 15h5v5h-5zM8.5 9v4a2 2 0 002 2H13",
  star:"M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z",
  briefcase:"M3 8h18v12H3zM8 8V5h8v3M3 13h18",
  lock:"M6 11h12v9H6zM9 11V7a3 3 0 016 0v4",
  list:"M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  send:"M21 3L3 10.5l7 3 3 7z",
  x:"M6 6l12 12M18 6L6 18",
  chevron:"M9 6l6 6-6 6",
  building:"M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01",
  activity:"M3 12h4l3 8 4-16 3 8h4",
  mail:"M3 6h18v12H3zM3 7l9 6 9-6",
  globe:"M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18",
  instagram:"M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16a4 4 0 100-8 4 4 0 000 8zM17.5 6.5h.01",
  phone:"M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  tag:"M3 12l9-9h8v8l-9 9zM16 8h.01",
  edit:"M4 20h4l10-10-4-4L4 16zM14 6l4 4",
  trash:"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  eye:"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z",
  book:"M4 4h7a3 3 0 013 3v13a3 3 0 00-3-3H4zM20 4h-6a3 3 0 00-3 3v13a3 3 0 013-3h6z"
};

function icon(name,size){
  const d = ICONS[name] || ICONS.grid;
  const s = size || 18;
  return '<svg class="ico" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
}

let toastTimer;
function toast(msg,kind){
  let el = document.getElementById("qg-toast");
  if(!el){
    el = document.createElement("div");
    el.id = "qg-toast";
    el.className = "qg-toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "qg-toast show" + (kind ? " " + kind : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function reduced(){
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function countUp(el,target,opts){
  const o = opts || {};
  const value = Number(target)||0;
  if(reduced() || value === 0){ el.textContent = o.format ? o.format(value) : String(value); return; }
  const dur = o.duration || 850;
  const start = performance.now();
  const from = 0;
  function frame(now){
    const p = Math.min(1,(now-start)/dur);
    const eased = 1 - Math.pow(1-p,3);
    const current = Math.round(from + (value-from)*eased);
    el.textContent = o.format ? o.format(current) : String(current);
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function statusBadge(status){
  const meta = QG.data.STATUS_META[status] || {label:status,class:"status-new"};
  return '<span class="badge '+meta.class+'">'+esc(meta.label)+'</span>';
}

function pill(text,tone){
  return '<span class="pill '+(tone||"")+'">'+esc(text)+'</span>';
}

function emptyState(title,copy,actionHtml){
  return '<div class="empty-state"><div class="empty-icon">'+icon("sparkles",22)+'</div>'+
    '<h3>'+esc(title)+'</h3><p>'+esc(copy)+'</p>'+(actionHtml||"")+'</div>';
}

function skeleton(rows){
  const n = rows || 4;
  let out = '<div class="skeleton-wrap">';
  for(let i=0;i<n;i++) out += '<div class="skeleton-line" style="width:'+(70+((i*13)%28))+'%"></div>';
  return out + '</div>';
}

function bindGlow(scope){
  if(reduced()) return;
  const root = scope || document;
  root.querySelectorAll(".glow-card").forEach(card => {
    if(card.dataset.glowBound) return;
    card.dataset.glowBound = "1";
    card.addEventListener("pointermove",e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
      card.style.setProperty("--my",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
    });
  });
}

function stagger(scope){
  if(reduced()) return;
  const root = scope || document;
  root.querySelectorAll("[data-stagger]").forEach((el,i) => {
    el.style.animationDelay = Math.min(i*45,360) + "ms";
    el.classList.add("enter");
  });
}

function modal(opts){
  const wrap = document.createElement("div");
  wrap.className = "modal-wrap show";
  wrap.innerHTML = '<div class="modal-backdrop"></div><div class="modal '+(opts.wide?"wide":"")+'">'+
    '<div class="modal-head"><div><span class="eyebrow">'+esc(opts.eyebrow||"ACTION")+'</span><h3>'+esc(opts.title||"")+'</h3></div>'+
    '<button class="icon-btn" data-close>'+icon("x",16)+'</button></div>'+
    '<div class="modal-body">'+(opts.body||"")+'</div>'+
    (opts.footer ? '<div class="modal-foot">'+opts.footer+'</div>' : '')+
    '</div>';
  document.body.appendChild(wrap);
  const close = () => { wrap.classList.remove("show"); setTimeout(() => wrap.remove(),180); };
  wrap.querySelector("[data-close]").addEventListener("click",close);
  wrap.querySelector(".modal-backdrop").addEventListener("click",close);
  const escHandler = e => { if(e.key === "Escape"){ close(); document.removeEventListener("keydown",escHandler); } };
  document.addEventListener("keydown",escHandler);
  if(opts.onMount) opts.onMount(wrap,close);
  return {el:wrap,close:close};
}

function field(label,inner,hint){
  return '<label class="field"><span>'+esc(label)+'</span>'+inner+(hint?'<small>'+esc(hint)+'</small>':'')+'</label>';
}

function input(name,value,attrs){
  return '<input class="input" name="'+esc(name)+'" value="'+esc(value==null?"":value)+'" '+(attrs||"")+'>';
}

function select(name,options,value){
  return '<select class="input" name="'+esc(name)+'">'+options.map(o =>
    '<option value="'+esc(o.value)+'"'+(String(o.value)===String(value)?" selected":"")+'>'+esc(o.label)+'</option>'
  ).join("")+'</select>';
}

function initials(name){
  return String(name||"?").trim().split(/\s+/).slice(0,2).map(w => w.charAt(0).toUpperCase()).join("") || "?";
}

function bar(pct,tone){
  return '<div class="bar"><span style="width:'+Math.max(0,Math.min(100,pct))+'%;background:'+(tone||"var(--accent)")+'"></span></div>';
}

QG.ui = {
  esc:esc, money:money, shortDate:shortDate, dateTime:dateTime, relTime:relTime, timeLabel:timeLabel,
  icon:icon, toast:toast, reduced:reduced, countUp:countUp, statusBadge:statusBadge, pill:pill,
  emptyState:emptyState, skeleton:skeleton, bindGlow:bindGlow, stagger:stagger, modal:modal,
  field:field, input:input, select:select, initials:initials, bar:bar
};
})();
