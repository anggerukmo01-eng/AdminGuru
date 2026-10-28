/* Workspace affordances; no data migrations or external dependencies. */
function enhanceFormLabels(root){
  root.querySelectorAll(".field, .form-field").forEach((field,i)=>{
    const label = field.querySelector("label");
    const control = field.querySelector('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
    if(!label || !control || label.contains(control)) return;
    if(!control.id) control.id = "field_"+uid(String(i));
    label.htmlFor = control.id;
  });
}

function buildMobileNav(){
  const items = [{id:"dashboard",label:"Beranda",icon:"dashboard"},{id:"siswa",label:"Siswa",icon:"student"},{id:"kehadiran",label:"Kehadiran",icon:"attendance"},{id:"aiDashboard",label:"Pusat AI",icon:"star"}];
  document.getElementById("mobileNav").innerHTML = items.map(item=>`<button data-page="${item.id}" onclick="navigate('${item.id}')">${ic(item.icon,20)}<span>${item.label}</span></button>`).join("") + `<button onclick="toggleSidebar()" aria-label="Semua menu">${ic("layers",20)}<span>Menu</span></button>`;
  markActiveNav(currentPage);
}

function syncWorkspaceUi(){
  document.title = "AdminGuru · "+document.getElementById("pageTitle").textContent;
  document.getElementById("mobileNav").classList.toggle("ready", document.getElementById("app").classList.contains("ready"));
  document.getElementById("lockSubtitle").textContent = classInfo(activeClassId).label+" · "+db.sekolah.namaSekolah;
}

function openMenuSearch(){
  if(document.getElementById('bookReader')) return;
  if(!document.getElementById("app").classList.contains("ready")) return;
  openModal({title:"Temukan fitur",bodyHtml:`<div class="command-search">${ic("search",22)}<input type="search" id="commandQuery" aria-label="Cari fitur AdminGuru" placeholder="Contoh: nilai, rapor, CP, jurnal..." autocomplete="off" oninput="renderMenuResults(this.value)"></div><div id="commandResults" class="command-results"></div><p class="hint command-help">↑ ↓ Pilih &nbsp; Enter Buka &nbsp; Esc Tutup</p>`,onMount:()=>{
    renderMenuResults("");
    document.getElementById("commandQuery").focus();
    document.getElementById("commandQuery").addEventListener("keydown", e=>{
      const buttons=Array.from(document.querySelectorAll(".command-result"));
      if(!buttons.length) return;
      if(e.key==="ArrowDown" || e.key==="ArrowUp"){
        e.preventDefault();
        const current=buttons.findIndex(b=>b.classList.contains("selected"));
        const next=(current+(e.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length;
        buttons.forEach((b,i)=>b.classList.toggle("selected",i===next));
        buttons[next].scrollIntoView({block:"nearest"});
      }else if(e.key==="Enter"){
        e.preventDefault(); (buttons.find(b=>b.classList.contains("selected"))||buttons[0]).click();
      }
    });
  }});
}

function renderMenuResults(query){
  const q=String(query||"").toLocaleLowerCase("id").trim();
  const items=NAV.flatMap(group=>group.items.map(item=>({...item,group:group.group}))).filter(item=>PAGES[item.id]);
  const matches=items.filter(item=>(item.label+" "+item.group).toLocaleLowerCase("id").includes(q));
  const visible=q ? matches : ["dashboard","siswa","kehadiran","inputnilai","agenda","aiDashboard","perpustakaan","cpReferensi","backup"].map(id=>items.find(item=>item.id===id)).filter(Boolean);
  document.getElementById("commandResults").innerHTML=visible.length ? visible.map((item,i)=>`<button class="command-result${i===0?" selected":""}" onclick="closeModal();navigate('${item.id}')"><span class="command-icon">${ic(item.icon,19)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.group)}</small></span><span class="command-arrow" aria-hidden="true">↗</span></button>`).join("") : `<div class="empty-state"><p>Tidak ada fitur yang cocok. Coba kata lain.</p></div>`;
}

function workspaceHeroArt(){
  return `<svg class="hero-art" viewBox="0 0 280 200" aria-hidden="true" fill="none"><circle cx="164" cy="97" r="77" fill="white" opacity=".07"/><circle cx="230" cy="44" r="9" fill="#ffd975"/><path d="m37 71 6-12 6 12-6 12z" fill="#84e7cd"/><rect x="70" y="58" width="145" height="98" rx="14" fill="#e1deff" transform="rotate(-9 70 58)"/><rect x="89" y="46" width="137" height="103" rx="13" fill="white" transform="rotate(8 89 46)"/><path d="m112 83 82 12M109 100l55 8M106 116l70 10" stroke="#b9b3ee" stroke-width="7" stroke-linecap="round"/><rect x="155" y="121" width="79" height="57" rx="13" fill="#65dfc4"/><path d="m175 147 11 11 24-25" stroke="#18574c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="m60 130 14-46 10 3-14 46-9 9z" fill="#ffd975"/><circle cx="115" cy="24" r="4" fill="white" opacity=".6"/><path d="m244 105 8 8m0-8-8 8" stroke="white" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>`;
}

document.addEventListener("keydown", event=>{
  if((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==="k"){
    event.preventDefault(); openMenuSearch();
  }
  if(event.key==="Escape" && document.getElementById("commandQuery")){
    event.preventDefault(); closeModal(); return;
  }
  if(event.key==="Escape" && document.getElementById("sidebar").classList.contains("open")){
    toggleSidebar(false); document.getElementById("menuToggle").focus();
  }
});
window.addEventListener("resize",()=>{ toggleSidebar(window.innerWidth<=960 && document.getElementById("sidebar").classList.contains("open")); });
