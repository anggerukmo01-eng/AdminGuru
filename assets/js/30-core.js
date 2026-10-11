/* ================================================================
   FILE: assets/js/30-core.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   3. ICON SET (inline SVG, tanpa dependency eksternal)
   ============================================================ */
const ICONS = {
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  school:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17.5" cy="8.5" r="2.6"/><path d="M15.8 14.3c2.7.4 4.7 2.4 4.7 5.7"/></svg>',
  student:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 9 12 4 2 9l10 5 10-5Z"/><path d="M6 11v5c0 1.6 2.7 3 6 3s6-1.4 6-3v-5"/></svg>',
  parent:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="3.5"/><path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 8v5M21 8v5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  clipboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6"/></svg>',
  check2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m8 15 2 2 4-4"/></svg>',
  bar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>',
  reportcard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M9 13h6M9 17h6M9 9h2"/></svg>',
  attendance:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><circle cx="8" cy="15" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1.4" fill="currentColor" stroke="none"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C.7 8 2 4.5 5.5 3.6 8 3 10.4 4.3 12 6.5 13.6 4.3 16 3 18.5 3.6 22 4.5 23.3 8 21.5 12c-2.5 4.5-9.5 9-9.5 9Z"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></svg>',
  guest:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 11 2 2 4-4"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.8 2.8 0 0 1 4 4L7 21l-5 1 1-5Z"/></svg>',
  archive:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 13h4"/></svg>',
  backup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v5h5"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><rect x="4" y="9" width="16" height="8" rx="1"/><path d="M6 14h12v8H6z"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 3.1 6.6 7.2.9-5.3 5 1.5 7.2L12 18l-6.5 3.7L7 14.5l-5.3-5 7.2-.9L12 2Z"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 1 1 12 0c0 3.5 1.2 5 2 6H4c.8-1 2-2.5 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  chevronLeft:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>',
  chevronRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
  image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9m0 0 4 4m-4-4-4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
};
function ic(name,size=18){ return (ICONS[name]||"").replace("<svg ", `<svg width="${size}" height="${size}" `); }

/* ============================================================
   4. NAVIGATION / ROUTER
   ============================================================ */
const NAV = [
 {group:"Utama", items:[
   {id:"dashboard", label:"Dashboard", icon:"dashboard"},
 ]},
 {group:"Identitas", items:[
   {id:"sekolah", label:"Profil Sekolah", icon:"school"},
   {id:"guru", label:"Guru & Tendik", icon:"users"},
   {id:"siswa", label:"Data Siswa", icon:"student"},
   {id:"ortu", label:"Data Orang Tua", icon:"parent"},
   {id:"pekerjaanOrtu", label:"Rekap Pekerjaan Orang Tua", icon:"bar"},
   {id:"rekapSeluruhKelas", label:"Rekap Seluruh Kelas", icon:"bar"},
   {id:"alumni", label:"Arsip Alumni (Lulusan)", icon:"archive"},
 ]},
 {group:"Statistik & Riwayat Siswa", items:[
   {id:"dfjl", label:"Jumlah Siswa per Tahun Lahir", icon:"bar"},
   {id:"rekapJumlahSiswa", label:"Rekap Jumlah Siswa Bulanan", icon:"bar"},
   {id:"riwayatKesehatan", label:"Riwayat Kesehatan", icon:"heart"},
   {id:"riwayatKelakuan", label:"Riwayat Kelakuan", icon:"clipboard"},
   {id:"bakatMinat", label:"Bakat & Minat", icon:"star"},
 ]},
 {group:"Perencanaan", items:[
   {id:"kalender", label:"Kalender Pendidikan", icon:"calendar"},
   {id:"jadwal", label:"Jadwal Pelajaran", icon:"clock"},
   {id:"agenda", label:"Agenda / Jurnal Harian", icon:"book"},
   {id:"progtahunan", label:"Program Tahunan", icon:"doc"},
   {id:"progsemester", label:"Program Semester", icon:"doc"},
 ]},
 {group:"Kurikulum", items:[
   {id:"cp", label:"Capaian Pembelajaran (CP)", icon:"target"},
   {id:"atp", label:"Alur Tujuan Pembelajaran (ATP)", icon:"layers"},
   {id:"kktp", label:"KKTP", icon:"check2"},
   {id:"modulajar", label:"Modul Ajar", icon:"clipboard"},
 ]},
 {group:"Penilaian", items:[
   {id:"inputnilai", label:"Input Nilai Massal", icon:"bar"},
   {id:"asesdiag", label:"Asesmen Diagnostik", icon:"eye"},
   {id:"asesform", label:"Asesmen Formatif", icon:"edit"},
   {id:"asessum", label:"Asesmen Sumatif", icon:"check2"},
   {id:"rekapnilai", label:"Rekap Nilai", icon:"bar"},
   {id:"prestasiSiswa", label:"Buku Prestasi Siswa", icon:"star"},
   {id:"rapor", label:"Deskripsi Rapor", icon:"reportcard"},
   {id:"kehadiran", label:"Kehadiran", icon:"attendance"},
   {id:"rekapAbsenTahunan", label:"Rekap Absen Bulanan (12 Bulan)", icon:"attendance"},
 ]},
 {group:"Pembinaan", items:[
   {id:"perkembangan", label:"Catatan Perkembangan", icon:"heart"},
   {id:"homevisit", label:"Home Visit", icon:"home"},
   {id:"bimbingan", label:"Daftar Bimbingan", icon:"heart"},
   {id:"konsultasiOrtu", label:"Konsultasi dengan Orang Tua", icon:"parent"},
   {id:"supervisi", label:"Supervisi & Refleksi", icon:"star"},
 ]},
 {group:"Administrasi Kelas", items:[
   {id:"inventaris", label:"Inventaris Kelas", icon:"box"},
   {id:"bukutamu", label:"Buku Tamu", icon:"guest"},
   {id:"mutasi", label:"Buku Mutasi Siswa", icon:"student"},
   {id:"kenaikanKelas", label:"Daftar Kenaikan Kelas", icon:"check2"},
   {id:"pengambilanRapot", label:"Buku Pengambilan Rapor", icon:"reportcard"},
   {id:"tabunganSiswa", label:"Tabungan Siswa", icon:"box"},
   {id:"arsip", label:"Arsip Dokumen", icon:"archive"},
   {id:"pen", label:"Tulisan Tangan (Digital Pen)", icon:"pen"},
 ]},
 {group:"Kegiatan & Sarana Kelas", items:[
   {id:"ekstrakurikuler", label:"Kegiatan Ekstrakurikuler", icon:"star"},
   {id:"studyTour", label:"Kegiatan Study Tour", icon:"calendar"},
   {id:"bukuPeganganGuru", label:"Buku Pegangan Guru", icon:"book"},
   {id:"bukuPeganganSiswa", label:"Buku Pegangan Siswa", icon:"book"},
   {id:"denahTD", label:"Denah Tempat Duduk", icon:"layers"},
   {id:"jadwalPiket", label:"Jadwal Piket Kebersihan", icon:"clock"},
   {id:"kelompokBelajar", label:"Kelompok Belajar", icon:"users"},
   {id:"alokasiWaktu", label:"Alokasi Waktu Mapel", icon:"clock"},
 ]},
 {group:"AI Teacher Suite Pro", items:[
   {id:"aiDashboard", label:"Dashboard AI", icon:"star"},
   {id:"aiModul", label:"AI: Modul Ajar", icon:"clipboard"},
   {id:"aiATP", label:"AI: ATP", icon:"book"},
   {id:"aiTP", label:"AI: TP", icon:"target"},
   {id:"aiJurnal", label:"AI: Jurnal Mengajar", icon:"clock"},
   {id:"aiLKPD", label:"AI: LKPD", icon:"layers"},
   {id:"aiAsesDiag", label:"AI: Asesmen Diagnostik", icon:"target"},
   {id:"aiAsesForm", label:"AI: Asesmen Formatif", icon:"target"},
   {id:"aiAsesSum", label:"AI: Asesmen Sumatif", icon:"target"},
   {id:"aiKisi", label:"AI: Kisi-kisi Soal", icon:"target"},
   {id:"aiRubrik", label:"AI: Rubrik Penilaian", icon:"target"},
   {id:"aiBankSoal", label:"AI: Bank Soal", icon:"book"},
   {id:"aiObservasi", label:"AI: Lembar Observasi", icon:"eye"},
   {id:"aiPengRem", label:"AI: Pengayaan & Remedial", icon:"star"},
   {id:"aiRefleksi", label:"AI: Refleksi Pembelajaran", icon:"star"},
   {id:"aiSuratOrtu", label:"AI: Surat Orang Tua", icon:"parent"},
   {id:"aiCatatanWali", label:"AI: Catatan Wali Kelas", icon:"edit"},
   {id:"aiHistory", label:"Riwayat Dokumen AI", icon:"archive"},
   {id:"aiSettings", label:"AI Settings", icon:"settings"},
 ]},
 {group:"Sistem", items:[
   {id:"backup", label:"Backup & Restore (Lokal)", icon:"backup"},
   {id:"cloudStorage", label:"Cloud Storage (Backup & Restore)", icon:"backup"},
   {id:"riwayatBackup", label:"Riwayat Backup Cloud", icon:"archive"},
   {id:"pengaturan", label:"Pengaturan", icon:"settings"},
 ]},
];
let currentPage = "dashboard";

/* ---------- NAV: grup lipat + pencarian (disimpan di localStorage) ---------- */
function navCollapsedGet(){
  try{ return JSON.parse(localStorage.getItem("tp_nav_collapsed")||"null"); }catch(e){ return null; }
}
function navCollapsedSet(arr){
  try{ localStorage.setItem("tp_nav_collapsed", JSON.stringify(arr)); }catch(e){}
}
function buildSidebar(){
  const el = document.getElementById("sidebar");
  let collapsed = navCollapsedGet();
  if(!Array.isArray(collapsed)){
    // default: semua grup dilipat kecuali "Utama"
    collapsed = NAV.filter(g=>g.group!=="Utama").map(g=>g.group);
    navCollapsedSet(collapsed);
  }
  let h = `<div class="brand">
    <div class="logo">${ic("school",22)}</div>
    <div class="txt"><strong>Teacher Planner</strong><span>SD 2026 &middot; ${classInfo(activeClassId).label}</span></div>
  </div>
  <div class="navsearch">${ic("search",16)}<input id="navSearch" type="search" placeholder="Cari menu..." autocomplete="off" oninput="filterNav(this.value)"></div>
  <div class="nav-empty" id="navEmpty">Tidak ada menu yang cocok.</div>`;
  NAV.forEach(g=>{
    const isCol = collapsed.includes(g.group);
    const items = g.items.map(it=>
      `<div class="navitem" data-page="${it.id}" data-label="${it.label.toLowerCase()}" onclick="navigate('${it.id}')">${ic(it.icon,18)}<span>${it.label}</span></div>`
    ).join("");
    const chev = ic("chevronRight",14).replace("<svg ", '<svg class="chev" ');
    h += `<div class="navgroup${isCol?" collapsed":""}" data-group="${g.group}">
      <button class="navgroup-head" onclick="toggleNavGroup('${g.group}')" title="Buka/tutup grup">
        <span>${g.group}</span><span class="g-count">${g.items.length}</span>${chev}
      </button>
      <div class="navgroup-items"><div>${items}</div></div>
    </div>`;
  });
  el.innerHTML = h;
  buildClassSwitcher();
  markActiveNav(currentPage);
}
function toggleNavGroup(group){
  const g = document.querySelector('.navgroup[data-group="'+group+'"]');
  if(!g) return;
  g.classList.toggle("collapsed");
  let c = navCollapsedGet()||[];
  c = c.filter(x=>x!==group);
  if(g.classList.contains("collapsed")) c.push(group);
  navCollapsedSet(c);
}
function filterNav(q){
  q = (q||"").toLowerCase().trim();
  let visible = 0;
  document.querySelectorAll(".navgroup").forEach(g=>{
    let gv = 0;
    g.querySelectorAll(".navitem").forEach(n=>{
      const hit = !q || (n.dataset.label||"").includes(q);
      n.classList.toggle("hidden-by-search", !hit);
      if(hit){ gv++; visible++; }
    });
    g.style.display = gv ? "" : "none";
    if(q) g.classList.remove("collapsed"); // saat mencari, buka semua grup
  });
  const em = document.getElementById("navEmpty");
  if(em) em.classList.toggle("show", visible===0);
}
function markActiveNav(page){
  document.querySelectorAll(".navitem").forEach(n=>n.classList.toggle("active", n.dataset.page===page));
  // pastikan grup induk halaman aktif terbuka
  const grp = NAV.find(g=>g.items.some(i=>i.id===page));
  if(grp){
    const el = document.querySelector('.navgroup[data-group="'+grp.group+'"]');
    if(el && el.classList.contains("collapsed")){
      el.classList.remove("collapsed");
      navCollapsedSet((navCollapsedGet()||[]).filter(x=>x!==grp.group));
    }
  }
  const crumb = document.getElementById("crumb");
  if(crumb) crumb.textContent = grp ? grp.group : "Utama";
}
function buildClassSwitcher(){
  const sel = document.getElementById("classSwitcher");
  if(!sel) return;
  sel.innerHTML = CLASS_LIST.map(c=>`<option value="${c.id}" ${c.id===activeClassId?"selected":""}>${c.label}</option>`).join("");
}
function toggleSidebar(force){
  const sb = document.getElementById("sidebar");
  const mask = document.getElementById("sidebarMask");
  const open = force!==undefined ? force : !sb.classList.contains("open");
  sb.classList.toggle("open", open);
  mask.classList.toggle("show", open);
}
function navigate(page){
  currentPage = page;
  markActiveNav(page);
  const navItem = NAV.flatMap(g=>g.items).find(i=>i.id===page);
  document.getElementById("pageTitle").textContent = navItem ? navItem.label : "Dashboard";
  renderPage(page);
  toggleSidebar(false);
  window.scrollTo(0,0);
}
function renderPage(page){
  const c = document.getElementById("pageContent");
  const renderer = PAGES[page];
  c.innerHTML = renderer ? renderer() : "<p>Halaman tidak ditemukan.</p>";
}

/* ============================================================
   5A. TOAST
   ============================================================ */
function toast(msg){
  const host = document.getElementById("toastHost");
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  host.appendChild(t);
  setTimeout(()=>t.remove(), 2400);
}

/* ============================================================
   5B. MODAL ENGINE
   ============================================================ */
function openModal({title, bodyHtml, onMount, footHtml}){
  closeModal();
  const mask = document.createElement("div");
  mask.className = "modal-mask show"; mask.id = "activeModal";
  mask.innerHTML = `<div class="modal">
      <div class="modal-head"><h3>${escapeHtml(title)}</h3>
        <button class="iconbtn" onclick="closeModal()">${ic("x",18)}</button></div>
      <div class="modal-body" id="modalBody">${bodyHtml}</div>
      ${footHtml? `<div class="modal-foot">${footHtml}</div>` : ""}
    </div>`;
  mask.addEventListener("click", e=>{ if(e.target===mask) closeModal(); });
  document.body.appendChild(mask);
  if(onMount) onMount();
}
function closeModal(){ const m = document.getElementById("activeModal"); if(m) m.remove(); }

function confirmDialog(msg, onYes){
  openModal({
    title:"Konfirmasi",
    bodyHtml:`<p>${escapeHtml(msg)}</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button>
      <button class="btn btn-danger" id="confirmYesBtn">Ya, Lanjutkan</button>`
  });
  document.getElementById("confirmYesBtn").onclick = ()=>{ closeModal(); onYes(); };
}

/* ============================================================
   5C. FIELD RENDER HELPER (dipakai form generik & custom)
   ============================================================ */
function fieldHtml(f, val){
  const v = val===undefined || val===null ? "" : val;
  const req = f.required ? "required" : "";
  if(f.type==="select"){
    const opts = (f.options||[]).map(o=>{
      const ov = typeof o==="object" ? o.value : o;
      const ol = typeof o==="object" ? o.label : o;
      return `<option value="${escapeHtml(ov)}" ${String(ov)===String(v)?"selected":""}>${escapeHtml(ol)}</option>`;
    }).join("");
    return `<div class="field"><label>${f.label}</label><select id="f_${f.key}" ${req}><option value="">- pilih -</option>${opts}</select></div>`;
  }
  if(f.type==="textarea"){
    return `<div class="field"><label>${f.label}</label><textarea id="f_${f.key}" ${req} placeholder="${f.placeholder||''}">${escapeHtml(v)}</textarea></div>`;
  }
  return `<div class="field"><label>${f.label}</label><input type="${f.type||'text'}" id="f_${f.key}" value="${escapeHtml(v)}" ${req} placeholder="${f.placeholder||''}"></div>`;
}
function readForm(fields){
  const out = {};
  fields.forEach(f=>{ const el = document.getElementById("f_"+f.key); out[f.key] = el ? el.value : ""; });
  return out;
}

/* ============================================================
   5D. GENERIC CRUD SECTION FACTORY
   Dipakai untuk banyak modul (siswa, kalender, agenda, ATP, KKTP,
   asesmen, kehadiran-catatan, perkembangan, home visit, inventaris,
   buku tamu, mutasi, arsip, supervisi, refleksi, modul ajar list).
   ============================================================ */
function crudSection(cfg){
  // cfg: {store, title, desc, fields[], columns[], searchKeys[], onRowExtra, sortDefault}
  const rows = db[cfg.store];
  const stateKey = "crud_"+cfg.store+"_q";
  window[stateKey] = window[stateKey] || "";

  function list(){
    const q = (window[stateKey]||"").toLowerCase();
    let data = db[cfg.store].slice();
    if(q){
      data = data.filter(r => (cfg.searchKeys||cfg.columns.map(c=>c.key)).some(k => String(r[k]||"").toLowerCase().includes(q)));
    }
    return data;
  }

  const tableId = "tbl_"+cfg.store;

  function renderTable(){
    const data = list();
    if(data.length===0){
      return `<div class="empty-state">${ic("search",40)}<p>Belum ada data. Klik "Tambah" untuk mengisi.</p></div>`;
    }
    const head = cfg.columns.map(c=>`<th>${c.label}</th>`).join("")+"<th style='text-align:right'>Aksi</th>";
    const body = data.map(r=>{
      const tds = cfg.columns.map(c=>{
        let val = r[c.key];
        if(c.render) val = c.render(val, r);
        return `<td>${val==null?'':val}</td>`;
      }).join("");
      return `<tr><td>${data.indexOf(r)+1}</td>${tds}
        <td><div class="row-actions">
          <button class="btn btn-sm btn-icon" onclick="crudEdit('${cfg.store}','${r.id}')">${ic("edit",15)}</button>
          <button class="btn btn-sm btn-icon btn-danger" onclick="crudDelete('${cfg.store}','${r.id}')">${ic("trash",15)}</button>
        </div></td></tr>`;
    }).join("");
    return `<div class="table-wrap"><table><thead><tr><th>No</th>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  window["crudRefresh_"+cfg.store] = function(){
    document.getElementById(tableId).innerHTML = renderTable();
  };

  const html = `
    <div class="section-head">
      <div><h1>${cfg.title}</h1><div class="desc">${cfg.desc||""}</div></div>
      <div class="grow"></div>
      ${cfg.exportable!==false ? `<button class="btn" onclick="exportCSV('${cfg.store}')">${ic("download",15)} CSV</button>` : ""}
      <button class="btn btn-primary" onclick="crudAdd('${cfg.store}')">${ic("plus",15)} Tambah</button>
    </div>
    <div class="toolbar">
      <div class="search-box">${ic("search",16)}<input placeholder="Cari ${cfg.title.toLowerCase()}..." oninput="window['${stateKey}']=this.value; window['crudRefresh_${cfg.store}']();"></div>
    </div>
    <div id="${tableId}">${renderTable()}</div>
  `;
  CRUD_CONFIG[cfg.store] = cfg;
  return html;
}
const CRUD_CONFIG = {};

function crudAdd(store){
  const cfg = CRUD_CONFIG[store];
  openModal({
    title:"Tambah "+cfg.title,
    bodyHtml: cfg.fields.map(f=>fieldHtml(f,"")).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="crudSaveBtn">${ic("check",15)} Simpan</button>`
  });
  document.getElementById("crudSaveBtn").onclick = ()=>{
    const data = readForm(cfg.fields);
    const missing = cfg.fields.find(f=>f.required && !data[f.key]);
    if(missing){ toast("Mohon isi: "+missing.label); return; }
    data.id = uid(store);
    db[store].push(data);
    saveDB(); closeModal(); toast("Data tersimpan.");
    if(window["crudRefresh_"+store]) window["crudRefresh_"+store]();
    if(window["dashRefresh"]) window.dashRefresh();
  };
}
function crudEdit(store, id){
  const cfg = CRUD_CONFIG[store];
  const row = db[store].find(r=>r.id===id);
  if(!row) return;
  openModal({
    title:"Ubah "+cfg.title,
    bodyHtml: cfg.fields.map(f=>fieldHtml(f,row[f.key])).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="crudSaveBtn">${ic("check",15)} Simpan</button>`
  });
  document.getElementById("crudSaveBtn").onclick = ()=>{
    const data = readForm(cfg.fields);
    Object.assign(row, data);
    saveDB(); closeModal(); toast("Perubahan disimpan.");
    if(window["crudRefresh_"+store]) window["crudRefresh_"+store]();
  };
}
function crudDelete(store, id){
  confirmDialog("Hapus data ini? Tindakan tidak dapat dibatalkan.", ()=>{
    db[store] = db[store].filter(r=>r.id!==id);
    saveDB(); toast("Data dihapus.");
    if(window["crudRefresh_"+store]) window["crudRefresh_"+store]();
    if(window["dashRefresh"]) window.dashRefresh();
  });
}

/* ============================================================
   5E. EXPORT: CSV / "Word" (.doc) / "Excel" (.xls) / Print
   Teknik tanpa pustaka eksternal, tetap 100% offline:
   - CSV murni teks.
   - .doc  -> Blob HTML bertipe application/msword (dibuka native oleh MS Word).
   - .xls  -> Blob tabel HTML bertipe application/vnd.ms-excel (dibuka native oleh MS Excel).
   - PDF   -> memakai dialog cetak bawaan browser (Simpan sebagai PDF).
   ============================================================ */
function downloadBlob(content, filename, mime){
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}
function withClassTag(filename){
  const tag = "_"+classFileTag(activeClassId);
  return filename.includes(tag) ? filename : filename+tag;
}
function exportCSV(store, customRows, customCols, filename){
  const cfg = CRUD_CONFIG[store];
  const cols = customCols || (cfg ? cfg.columns.map(c=>({key:c.key,label:c.label})) : []);
  const rows = customRows || db[store];
  let csv = cols.map(c=>'"'+c.label.replace(/"/g,'""')+'"').join(",")+"\r\n";
  rows.forEach(r=>{
    csv += cols.map(c=>{
      let v = r[c.key]; if(v==null) v="";
      return '"'+String(v).replace(/"/g,'""')+'"';
    }).join(",")+"\r\n";
  });
  downloadBlob("\ufeff"+csv, withClassTag(filename||store)+".csv", "text/csv;charset=utf-8;");
  toast("File CSV diunduh.");
}
function htmlToWordDoc(innerHtml, filename, title){
  const doc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${escapeHtml(title||filename)}</title>
  <style>body{font-family:Calibri,Arial,sans-serif;font-size:12pt;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #333;padding:5px;font-size:10.5pt;}</style>
  </head><body>${innerHtml}</body></html>`;
  const fn = withClassTag(filename);
  downloadBlob(doc, fn.endsWith(".doc")?fn:fn+".doc", "application/msword");
  toast("File Word (.doc) diunduh.");
}
function htmlToExcelXls(tableHtml, filename, title){
  const doc = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8">
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
  <x:Name>${escapeHtml(title||"Data")}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
  </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  <style>td,th{border:1px solid #999;padding:4px;font-size:10.5pt;font-family:Calibri,Arial,sans-serif;} th{background:#dbe4ff;}</style>
  </head><body>${tableHtml}</body></html>`;
  const fn = withClassTag(filename);
  downloadBlob(doc, fn.endsWith(".xls")?fn:fn+".xls", "application/vnd.ms-excel");
  toast("File Excel (.xls) diunduh.");
}
function tableHtmlFromRows(cols, rows){
  let h = "<table><thead><tr><th>No</th>"+cols.map(c=>`<th>${c.label}</th>`).join("")+"</tr></thead><tbody>";
  rows.forEach((r,i)=>{ h += `<tr><td>${i+1}</td>`+cols.map(c=>`<td>${escapeHtml(r[c.key])}</td>`).join("")+"</tr>"; });
  h += "</tbody></table>";
  return h;
}
function letterheadHtml(){
  const s = db.sekolah;
  return `<div class="letterhead">
    <div class="lh-logo">${ic("school",34)}</div>
    <div class="lh-text">
      <h4>PEMERINTAH KABUPATEN ${escapeHtml(s.kabupaten).toUpperCase()}</h4>
      <h4>DINAS PENDIDIKAN</h4>
      <h4 style="font-size:17px;">${escapeHtml(s.namaSekolah)}</h4>
      <p>${escapeHtml(s.alamat)}, Desa ${escapeHtml(s.desa)}, Kec. ${escapeHtml(s.kecamatan)}, Kab. ${escapeHtml(s.kabupaten)}, ${escapeHtml(s.provinsi)} ${escapeHtml(s.kodePos)}</p>
    </div>
  </div>`;
}
function printDocument(title, bodyHtml){
  document.getElementById("printArea").innerHTML = `${letterheadHtml()}<div class="doc-title">${escapeHtml(title)}</div><div style="text-align:center;font-size:12.5px;margin:-12px 0 14px;">${escapeHtml(classInfo(activeClassId).label)} &middot; T.A. ${escapeHtml(db.sekolah.tahunAjaran)} &middot; Semester ${escapeHtml(db.sekolah.semester)}</div>${bodyHtml}`;
  window.print();
}

