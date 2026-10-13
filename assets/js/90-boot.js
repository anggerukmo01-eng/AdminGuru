/* ================================================================
   FILE: assets/js/90-boot.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   9. BOOT
   ============================================================ */
function boot(){
  db = loadDB(); saveDB();
  settings = loadSettings();
  applyTheme();
  buildSidebar();
  showLockScreen();
  const requested=new URLSearchParams(location.search).get('page');
  navigate(NAV.some(g=>g.items.some(i=>i.id===requested))?requested:'dashboard');
  if(cloudConfigured()){ cloudCheckSession().then(()=>{ if(cloudUser && currentPage==="dashboard") renderPage("dashboard"); }); }
  if(typeof cloudHandleRecoveryLink==="function") cloudHandleRecoveryLink();
  window.addEventListener("resize", ()=>{ if(window.innerWidth>960) toggleSidebar(false); });
  checkKalenderReminders();
  setInterval(checkKalenderReminders, 60*1000);
}
document.addEventListener("DOMContentLoaded", boot);
