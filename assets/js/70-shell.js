/* ================================================================
   FILE: assets/js/70-shell.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   7. LOCK SCREEN / PIN LOGIC
   ============================================================ */
let pinBuffer = "";
function buildPinPad(){
  const pad = document.getElementById("pinPad");
  const keys = ["1","2","3","4","5","6","7","8","9","","0","del"];
  pad.innerHTML = keys.map(k=>{
    if(k==="") return `<div></div>`;
    if(k==="del") return `<button onclick="pinDelete()">&#9003;</button>`;
    return `<button onclick="pinPress('${k}')">${k}</button>`;
  }).join("");
}
function renderPinDots(){
  const dots = document.getElementById("pinDots");
  const len = Math.max(settings.pin.length,4);
  dots.innerHTML = Array.from({length:len}).map((_,i)=>`<div class="pin-dot ${i<pinBuffer.length?'filled':''}"></div>`).join("");
}
function pinPress(d){
  if(pinBuffer.length>=6) return;
  pinBuffer += d;
  renderPinDots();
  document.getElementById("lockMsg").textContent = "Masukkan PIN untuk membuka aplikasi";
  if(pinBuffer.length===settings.pin.length){
    if(pinBuffer===settings.pin){ unlockApp(); }
    else{
      document.getElementById("lockMsg").textContent = "PIN salah, coba lagi.";
      setTimeout(()=>{ pinBuffer=""; renderPinDots(); },500);
    }
  }
}
function pinDelete(){ pinBuffer = pinBuffer.slice(0,-1); renderPinDots(); }

function showLockScreen(){
  if(typeof BookReader!=='undefined') BookReader.close();
  if(typeof cancelAiRequests==='function') cancelAiRequests();
  closeModal();
  document.getElementById("lockScreen").classList.remove("hidden");
  document.getElementById("app").classList.remove("ready");
  document.getElementById("app").inert = true;
  document.getElementById("mobileNav").inert = true;
  toggleSidebar(false);
  syncWorkspaceUi();
  if(settings.pin){
    document.getElementById("pinArea").style.display="block";
    document.getElementById("noPinArea").style.display="none";
    pinBuffer=""; buildPinPad(); renderPinDots();
  } else {
    document.getElementById("pinArea").style.display="none";
    document.getElementById("noPinArea").style.display="block";
  }
  const button=document.querySelector("#lockScreen button"); if(button) button.focus();
  /* Pemilih kelas di layar kunci (13 Nov 2026): isi opsi Kelas 1-6, pilih
     kelas bawaan (settings.defaultClassId) bila ada, kalau tidak kelas terakhir. */
  const lockSel=document.getElementById("lockClassSelect");
  if(lockSel){
    lockSel.innerHTML = CLASS_LIST.map(c=>`<option value="${c.id}">${c.label}</option>`).join("");
    lockSel.value = CLASS_LIST.some(c=>c.id===settings.defaultClassId) ? settings.defaultClassId : activeClassId;
    /* Sapaan ikut kelas yang dipilih (13 Nov 2026): perbarui saat pilihan berubah. */
    lockSel.onchange = updateLockGreeting;
    updateLockGreeting();
  }
}
function unlockApp(){
  /* Terapkan kelas yang dipilih di layar kunci: jadikan kelas bawaan dan
     pindah ke kelas itu bila berbeda, supaya beranda menampilkan datanya. */
  const lockSel=document.getElementById("lockClassSelect");
  const want = lockSel ? lockSel.value : "";
  const validWant = CLASS_LIST.some(c=>c.id===want) ? want : "";
  if(validWant && validWant!==settings.defaultClassId){ settings.defaultClassId = validWant; saveSettings(); }
  document.getElementById("lockScreen").classList.add("hidden");
  document.getElementById("app").classList.add("ready");
  document.getElementById("app").inert = false;
  document.getElementById("mobileNav").inert = false;
  syncWorkspaceUi();
  document.getElementById("pageContent").focus();
  resetAutoLockTimer();
  if(validWant && validWant!==activeClassId) switchActiveClass(validWant);
}
function lockNow(){ showLockScreen(); }

let autoLockTimer=null;
function resetAutoLockTimer(){
  if(autoLockTimer) clearTimeout(autoLockTimer);
  if(!settings.pin) return;
  autoLockTimer = setTimeout(()=>{ lockNow(); }, (settings.autoLockMin||10)*60*1000);
}
["click","keydown","touchstart","pointermove"].forEach(evt=>{
  document.addEventListener(evt, ()=>{ if(document.getElementById("app").classList.contains("ready")) resetAutoLockTimer(); }, {passive:true});
});

/* ============================================================
   8. THEME
   ============================================================ */
function applyTheme(){
  document.documentElement.setAttribute("data-theme", settings.theme==="dark"?"dark":"light");
  const icon = document.getElementById("themeIcon");
  if(icon){
    icon.innerHTML = settings.theme==="dark"
      ? '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>'
      : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  }
}
function toggleTheme(){
  settings.theme = settings.theme==="dark" ? "light" : "dark";
  saveSettings(); applyTheme();
  if(currentPage==="pengaturan") renderPage("pengaturan");
}

/* ============================================================
   8B. MODE TAMPILAN — Tablet / Kecil / Otomatis (13 Nov 2026)
   Mengikuti pola tema (8): pilihan tersimpan di settings.displayMode,
   diterapkan lewat atribut data-display-mode pada <html>.
   - "tablet": perilaku responsif seperti sekarang (aturan @media biasa).
   - "kecil": memaksa tampilan ringkas di lebar layar berapa pun.
   - "auto": <720px -> kecil, >=720px -> tablet; mengikuti resize/rotasi.
   ============================================================ */
function displayModeEffective(){
  const m = settings.displayMode || "auto";
  if(m === "kecil") return "kecil";
  if(m === "tablet") return "tablet";
  try{ return window.matchMedia("(max-width: 719px)").matches ? "kecil" : "tablet"; }catch(e){ return "tablet"; }
}
function applyDisplayMode(){
  document.documentElement.setAttribute("data-display-mode", displayModeEffective());
}
function setDisplayMode(mode){
  settings.displayMode = (mode==="kecil" || mode==="tablet") ? mode : "auto";
  saveSettings(); applyDisplayMode();
  if(currentPage==="pengaturan") renderPage("pengaturan");
}
try{
  const dmq = window.matchMedia("(max-width: 719px)");
  const onDmChange = ()=>{ if((settings.displayMode||"auto")==="auto") applyDisplayMode(); };
  if(dmq.addEventListener) dmq.addEventListener("change", onDmChange);
  else if(dmq.addListener) dmq.addListener(onDmChange);
}catch(e){}

