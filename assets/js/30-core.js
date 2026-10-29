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
   ILUSTRASI EMPTY-STATE — gaya flat modern, palet formal
   (biru #3e63f2, violet #7048e8, hijau #0ca678, kuning #e8890c)
   ============================================================ */
function illus(kind, size){
  size = size || 120;
  const bg = `<circle cx="60" cy="60" r="56" fill="#e9edff"/><circle cx="60" cy="60" r="56" fill="url(#ilgrad)" fill-opacity=".25"/>`;
  const defs = `<defs><linearGradient id="ilgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3e63f2"/><stop offset="1" stop-color="#7048e8"/></linearGradient></defs>`;
  let inner = "";
  if(kind==="nilai"){
    inner = bg
      + `<rect x="30" y="58" width="14" height="34" rx="4" fill="#3e63f2"/>`
      + `<rect x="50" y="44" width="14" height="48" rx="4" fill="#7048e8"/>`
      + `<rect x="70" y="66" width="14" height="26" rx="4" fill="#0ca678"/>`
      + `<path d="M32 52 L57 38 L76 48 L92 30" stroke="#e8890c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
      + `<circle cx="92" cy="30" r="5" fill="#e8890c"/>`
      + `<rect x="26" y="96" width="68" height="5" rx="2.5" fill="#c9d3e6"/>`;
  } else if(kind==="siswa"){
    inner = bg
      + `<circle cx="46" cy="48" r="13" fill="#3e63f2"/><path d="M24 92c0-13 10-21 22-21s22 8 22 21v4H24v-4z" fill="#3e63f2" opacity=".85"/>`
      + `<circle cx="78" cy="44" r="10" fill="#7048e8"/><path d="M62 92c0-10 7-16 16-16s16 6 16 16v4H62v-4z" fill="#7048e8" opacity=".85"/>`
      + `<circle cx="88" cy="78" r="11" fill="#0ca678"/><path d="M84 76l3 3 6-7" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else { /* dokumen */
    inner = bg
      + `<path d="M38 26h28l14 14v44a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6z" fill="#fff" stroke="#3e63f2" stroke-width="3"/>`
      + `<path d="M66 26v14h14" fill="none" stroke="#3e63f2" stroke-width="3" stroke-linejoin="round"/>`
      + `<rect x="40" y="52" width="28" height="5" rx="2.5" fill="#c9d3e6"/><rect x="40" y="62" width="40" height="5" rx="2.5" fill="#c9d3e6"/><rect x="40" y="72" width="32" height="5" rx="2.5" fill="#c9d3e6"/>`
      + `<circle cx="82" cy="82" r="13" fill="#0ca678"/><path d="M76 82l4 4 8-9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${defs}${inner}</svg>`;
}

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
   {id:"agenda", label:"Jurnal Mengajar", icon:"book"},
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
   {id:"rekapnilai", label:"Daftar Nilai", icon:"bar"},
   {id:"analisisnilai", label:"Analisis Nilai", icon:"target"},
   {id:"rapor", label:"Rapor Semester", icon:"reportcard"},
   {id:"prestasiSiswa", label:"Buku Prestasi Siswa", icon:"star"},
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
   {id:"aiDashboard", label:"Pusat AI Guru", icon:"star"},
   {id:"aiModul", label:"AI: Modul Ajar", icon:"clipboard"},
   {id:"aiTP", label:"AI: TP", icon:"target"},
   {id:"aiATP", label:"AI: ATP", icon:"book"},
   {id:"aiLKPD", label:"AI: LKPD", icon:"layers"},
   {id:"aiJurnal", label:"AI: Jurnal Mengajar", icon:"clock"},
   {id:"aiBankSoal", label:"AI: Bank Soal", icon:"book"},
   {id:"aiAsesForm", label:"AI: Asesmen Formatif", icon:"target"},
   {id:"aiRubrik", label:"AI: Rubrik Penilaian", icon:"target"},
   {id:"aiPengRem", label:"AI: Pengayaan & Remedial", icon:"star"},
   {id:"aiSuratOrtu", label:"AI: Surat Orang Tua", icon:"parent"},
   {id:"aiHistory", label:"Riwayat Dokumen AI", icon:"archive"},
   {id:"aiSettings", label:"AI Settings", icon:"settings"},
 ]},
 {group:"Sistem", items:[
   {id:"backup", label:"Backup & Sinkron Data", icon:"backup"},
   {id:"dapodik", label:"Sinkron Dapodik", icon:"refresh"},
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
    <div class="logo logo-img"><img src="${LOGO_SEKOLAH}" alt="Logo SD Negeri 1 Gerduren"></div>
    <div class="txt"><strong>Administrasi Guru</strong><span>SD Negeri 1 Gerduren</span></div>
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
  c.dataset.page = page;
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
  mask._returnFocus = document.activeElement;
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
function closeModal(){ const m = document.getElementById("activeModal"); if(m){ const target=m._returnFocus; m.remove(); if(target && target.isConnected) target.focus(); } }

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
  if(f.type==="heading"){
    return `<div style="grid-column:1/-1;margin:14px 0 2px;padding:9px 14px;background:var(--primary-ghost);border-left:4px solid var(--primary);border-radius:0 10px 10px 0;font-weight:800;font-size:13px;letter-spacing:.4px;color:var(--primary);">${escapeHtml(f.label)}</div>`;
  }
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
  fields.forEach(f=>{ if(f.type==="heading") return; const el = document.getElementById("f_"+f.key); out[f.key] = el ? el.value : ""; });
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
    data.createdAt = new Date().toISOString();
    db[store].push(data);
    saveDB(); closeModal(); toast("Data tersimpan.");
    if(store==="agenda") playSuccessSoundIfEnabled();
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
    if(store==="agenda") playSuccessSoundIfEnabled();
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
/* ============================================================
   5F. EXPORT .docx ASLI (OOXML) — tanpa pustaka eksternal
   ------------------------------------------------------------
   Word modern memberi peringatan untuk .doc berisi HTML. Blok ini
   membangun berkas .docx asli: arsip ZIP (entri STORED, tanpa kompresi,
   jadi tidak butuh pustaka ZIP) berisi XML WordprocessingML.
   Konverter menangani: p, h2/h3/h4, ul/ol/li, table, strong/em/b/i/u,
   br, hr, div/span. Tag lain dibuka bungkusnya. Gambar (mis. logo kop)
   tidak ikut — kop ditulis sebagai baris teks.
   ============================================================ */
/* --- BEGIN DOCX ENGINE (diuji otomatis; jangan ubah penanda ini) --- */
function docxXmlEsc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function docxCrc32(bytes){
  let table = docxCrc32._t;
  if(!table){
    table = docxCrc32._t = [];
    for(let n=0;n<256;n++){
      let c = n;
      for(let k=0;k<8;k++) c = (c&1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1);
      table[n] = c>>>0;
    }
  }
  let crc = 0xFFFFFFFF;
  for(let i=0;i<bytes.length;i++) crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc>>>8);
  return (crc ^ 0xFFFFFFFF)>>>0;
}
function docxZipStored(files){
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours()&31)<<11) | ((now.getMinutes()&63)<<5) | ((now.getSeconds()>>1)&31);
  const dosDate = (((now.getFullYear()-1980)&127)<<9) | (((now.getMonth()+1)&15)<<5) | (now.getDate()&31);
  const push = (arr)=>{ chunks.push(arr); offset += arr.length; };
  for(const f of files){
    const nameBytes = enc.encode(f.name);
    const dataBytes = enc.encode(f.data);
    const crc = docxCrc32(dataBytes);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, dataBytes.length, true);
    local.setUint32(22, dataBytes.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);
    const localOff = offset;
    push(new Uint8Array(local.buffer)); push(nameBytes); push(dataBytes);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true);
    cen.setUint16(12, dosTime, true);
    cen.setUint16(14, dosDate, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, dataBytes.length, true);
    cen.setUint32(24, dataBytes.length, true);
    cen.setUint16(28, nameBytes.length, true);
    cen.setUint16(30, 0, true);
    cen.setUint16(32, 0, true);
    cen.setUint16(34, 0, true);
    cen.setUint16(36, 0, true);
    cen.setUint32(38, 0, true);
    cen.setUint32(42, localOff, true);
    central.push(new Uint8Array(cen.buffer), nameBytes);
  }
  const cenOff = offset;
  let cenSize = 0;
  for(const c of central){ chunks.push(c); cenSize += c.length; }
  offset += cenSize;
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, cenSize, true);
  eocd.setUint32(16, cenOff, true);
  eocd.setUint16(20, 0, true);
  chunks.push(new Uint8Array(eocd.buffer));
  const out = new Uint8Array(offset + 22);
  let p = 0;
  for(const c of chunks){ out.set(c, p); p += c.length; }
  return out;
}
function docxRun(text, fmt){
  if(!text) return "";
  fmt = fmt||{};
  const props = [];
  if(fmt.b) props.push("<w:b/>");
  if(fmt.i) props.push("<w:i/>");
  if(fmt.u) props.push("<w:u w:val=\"single\"/>");
  if(fmt.size) props.push("<w:sz w:val=\""+fmt.size+"\"/><w:szCs w:val=\""+fmt.size+"\"/>");
  const rPr = props.length ? "<w:rPr>"+props.join("")+"</w:rPr>" : "";
  return "<w:r>"+rPr+"<w:t xml:space=\"preserve\">"+docxXmlEsc(text)+"</w:t></w:r>";
}
function docxPara(inner, opts){
  opts = opts||{};
  const parts = [];
  if(opts.center) parts.push("<w:jc w:val=\"center\"/>");
  if(opts.indent!=null) parts.push("<w:ind w:left=\""+opts.indent+"\"/>");
  if(opts.spaceBefore!=null || opts.spaceAfter!=null) parts.push("<w:spacing"+(opts.spaceBefore!=null?" w:before=\""+opts.spaceBefore+"\"":"")+(opts.spaceAfter!=null?" w:after=\""+opts.spaceAfter+"\"":"")+"/>");
  if(opts.bdrBottom) parts.push("<w:pBdr><w:bottom w:val=\"single\" w:sz=\"6\" w:space=\"1\" w:color=\"auto\"/></w:pBdr>");
  const pPr = parts.length ? "<w:pPr>"+parts.join("")+"</w:pPr>" : "";
  return "<w:p>"+pPr+inner+"</w:p>";
}
function docxCellParas(cellEl, bold){
  const paras = [];
  let cur = [];
  const pushPara = ()=>{ if(cur.length) paras.push(docxPara(cur.join(""), {})); cur = []; };
  const walkInline = (node, fmt)=>{
    for(const ch of Array.from(node.childNodes)){
      if(ch.nodeType===3){ if(ch.textContent) cur.push(docxRun(ch.textContent, fmt)); }
      else if(ch.nodeType===1){
        const tag = ch.tagName;
        if(tag==="SCRIPT"||tag==="STYLE"||tag==="IFRAME"||tag==="OBJECT") continue;
        if(tag==="BR") cur.push("<w:r><w:br/></w:r>");
        else if(tag==="STRONG"||tag==="B") walkInline(ch, Object.assign({}, fmt, {b:1}));
        else if(tag==="EM"||tag==="I") walkInline(ch, Object.assign({}, fmt, {i:1}));
        else if(tag==="P"){ pushPara(); walkInline(ch, fmt); pushPara(); }
        else walkInline(ch, fmt);
      }
    }
  };
  walkInline(cellEl, bold?{b:1}:{});
  pushPara();
  return paras.length ? paras.join("") : docxPara("", {});
}
function docxTable(tableEl){
  const rows = [];
  const collect = (el, header)=>{
    for(const ch of Array.from(el.children)){
      if(ch.tagName==="TR") rows.push({el:ch, header:header});
      else if(ch.tagName==="THEAD"||ch.tagName==="TBODY") collect(ch, el.tagName==="THEAD");
    }
  };
  collect(tableEl, false);
  if(!rows.length) return "";
  let cols = 0;
  rows.forEach(r=>{
    const n = Array.from(r.el.children).filter(c=>c.tagName==="TD"||c.tagName==="TH").length;
    if(n>cols) cols = n;
  });
  if(!cols) return "";
  const cellBdr = "<w:top w:val=\"single\" w:sz=\"4\" w:color=\"auto\"/><w:left w:val=\"single\" w:sz=\"4\" w:color=\"auto\"/><w:bottom w:val=\"single\" w:sz=\"4\" w:color=\"auto\"/><w:right w:val=\"single\" w:sz=\"4\" w:color=\"auto\"/>";
  let grid = "<w:tblGrid>";
  for(let i=0;i<cols;i++) grid += "<w:gridCol w:w=\""+Math.floor(9360/cols)+"\"/>";
  grid += "</w:tblGrid>";
  let trs = "";
  rows.forEach(r=>{
    const cells = Array.from(r.el.children).filter(c=>c.tagName==="TD"||c.tagName==="TH");
    let tcs = "";
    for(const c of cells){
      tcs += "<w:tc><w:tcPr><w:tcBorders>"+cellBdr+"</w:tcBorders></w:tcPr>"+docxCellParas(c, c.tagName==="TH"||r.header)+"</w:tc>";
    }
    trs += "<w:tr>"+tcs+"</w:tr>";
  });
  return "<w:tbl><w:tblPr><w:tblW w:w=\"0\" w:type=\"auto\"/><w:tblBorders>"+cellBdr+"<w:insideH w:val=\"single\" w:sz=\"4\" w:color=\"auto\"/><w:insideV w:val=\"single\" w:sz=\"4\" w:color=\"auto\"/></w:tblBorders></w:tblPr>"+grid+trs+"</w:tbl>";
}
function htmlToDocxWml(html){
  const doc = new DOMParser().parseFromString("<div>"+(html||"")+"</div>", "text/html");
  const root = doc.body.firstChild;
  const paras = [];
  let cur = null;
  const flush = ()=>{ if(cur && cur.runs.length) paras.push(docxPara(cur.runs.join(""), cur.opts)); cur = null; };
  const inline = (node, fmt)=>{
    if(node.nodeType===1 && (node.tagName==="SCRIPT"||node.tagName==="STYLE"||node.tagName==="IFRAME"||node.tagName==="OBJECT")) return;
    for(const ch of Array.from(node.childNodes)){
      if(ch.nodeType===3){
        if(ch.textContent){ if(!cur) cur = {runs:[], opts:{}}; cur.runs.push(docxRun(ch.textContent, fmt)); }
      } else if(ch.nodeType===1){
        const tag = ch.tagName;
        if(tag==="SCRIPT"||tag==="STYLE"||tag==="IFRAME"||tag==="OBJECT") continue;
        if(tag==="BR"){ if(!cur) cur = {runs:[], opts:{}}; cur.runs.push("<w:r><w:br/></w:r>"); }
        else if(tag==="STRONG"||tag==="B") inline(ch, Object.assign({}, fmt, {b:1}));
        else if(tag==="EM"||tag==="I") inline(ch, Object.assign({}, fmt, {i:1}));
        else if(tag==="U") inline(ch, Object.assign({}, fmt, {u:1}));
        else if(tag==="IMG"){ /* gambar dilewati */ }
        else inline(ch, fmt);
      }
    }
  };
  const blocks = (node)=>{
    for(const ch of Array.from(node.childNodes)){
      if(ch.nodeType===3){
        const t = ch.textContent;
        if(t && t.trim()){ if(!cur) cur = {runs:[], opts:{}}; cur.runs.push(docxRun(t, {})); }
        continue;
      }
      if(ch.nodeType!==1) continue;
      const tag = ch.tagName;
      if(tag==="P"){ flush(); cur = {runs:[], opts:{}}; inline(ch, {}); flush(); }
      else if(tag==="H2"||tag==="H3"||tag==="H4"){
        flush();
        const size = tag==="H2"?28:(tag==="H3"?26:24);
        cur = {runs:[], opts:{spaceBefore:240, spaceAfter:120}};
        inline(ch, {b:1, size:size});
        flush();
      }
      else if(tag==="UL"||tag==="OL"){
        flush();
        let n = 0;
        for(const li of Array.from(ch.children)){
          if(li.tagName!=="LI") continue;
          n++;
          cur = {runs:[], opts:{indent:360}};
          cur.runs.push(docxRun(tag==="UL" ? "•  " : (n+".  "), {}));
          inline(li, {});
          flush();
        }
      }
      else if(tag==="TABLE"){ flush(); paras.push(docxTable(ch)); }
      else if(tag==="HR"){ flush(); cur = {runs:[], opts:{bdrBottom:1}}; flush(); }
      else if(tag==="SCRIPT"||tag==="STYLE"||tag==="IFRAME"||tag==="OBJECT"){ /* dilewati total */ }
      else if(tag==="DIV"||tag==="SECTION"||tag==="ARTICLE"){ blocks(ch); }
      else if(tag==="BR"){ if(!cur) cur = {runs:[], opts:{}}; cur.runs.push("<w:r><w:br/></w:r>"); }
      else inline(ch, {});
    }
  };
  if(root) blocks(root);
  flush();
  return paras.join("");
}
function docxBuildPackage(bodyWml){
  const contentTypes = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/><Override PartName=\"/word/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\"/></Types>";
  const rels = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>";
  const styles = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<w:styles xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\" w:cs=\"Calibri\"/><w:sz w:val=\"24\"/><w:szCs w:val=\"24\"/><w:lang w:val=\"id-ID\"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type=\"paragraph\" w:default=\"1\" w:styleId=\"Normal\"><w:name w:val=\"Normal\"/><w:qFormat/></w:style></w:styles>";
  const document = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>"+bodyWml+"<w:sectPr><w:pgSz w:w=\"11906\" w:h=\"16838\"/><w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1701\" w:header=\"720\" w:footer=\"720\" w:gutter=\"0\"/></w:sectPr></w:body></w:document>";
  const docRels = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"></Relationships>";
  return docxZipStored([
    {name:"[Content_Types].xml", data:contentTypes},
    {name:"_rels/.rels", data:rels},
    {name:"word/document.xml", data:document},
    {name:"word/styles.xml", data:styles},
    {name:"word/_rels/document.xml.rels", data:docRels},
  ]);
}
function htmlToDocx(innerHtml, filename, title){
  const s = (typeof db!=="undefined" && db.sekolah) ? db.sekolah : {};
  let kop = "";
  if(s.namaSekolah) kop += docxPara(docxRun("PEMERINTAH KABUPATEN "+String(s.kabupaten||"").toUpperCase(), {b:1}), {center:1});
  kop += docxPara(docxRun("DINAS PENDIDIKAN", {b:1}), {center:1});
  if(s.namaSekolah) kop += docxPara(docxRun(String(s.namaSekolah).toUpperCase(), {b:1, size:28}), {center:1});
  const alamat = [s.alamat, s.desa, s.kecamatan, s.kabupaten, s.provinsi].filter(Boolean).join(", ");
  if(alamat) kop += docxPara(docxRun(alamat, {}), {center:1});
  if(kop) kop += docxPara("", {bdrBottom:1, spaceAfter:240});
  let judul = "";
  if(title) judul = docxPara(docxRun(title, {b:1, size:28}), {center:1, spaceAfter:240});
  const body = kop + judul + htmlToDocxWml(innerHtml);
  const bytes = docxBuildPackage(body);
  const fn = withClassTag(filename);
  downloadBlob(bytes, fn.endsWith(".docx")?fn:fn+".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  toast("File Word (.docx) diunduh.");
}
/* --- END DOCX ENGINE --- */
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
/* ============================================================
   5G. MELODI SUKSES (port dari Jurnal Harian GAS)
   ------------------------------------------------------------
   Nada C5-E5-G5-C6 via Web Audio API, tanpa file suara.
   Default NONAKTIF; diaktifkan lewat Pengaturan > Suara.
   Dipanggil hanya pada aksi Simpan eksplisit (jurnal & nilai),
   BUKAN pada setiap saveDB (yang berjalan otomatis di latar).
   ============================================================ */
function playSuccessSound(){
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    const ctx = new AC();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, index)=>{
      const t = ctx.currentTime + index * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.4);
    });
  }catch(e){ /* abaikan bila audio tidak tersedia */ }
}
function playSuccessSoundIfEnabled(){
  try{ if(typeof settings!=="undefined" && settings.bunyiSukses) playSuccessSound(); }catch(e){}
}
function tableHtmlFromRows(cols, rows){
  let h = "<table><thead><tr><th>No</th>"+cols.map(c=>`<th>${c.label}</th>`).join("")+"</tr></thead><tbody>";
  rows.forEach((r,i)=>{ h += `<tr><td>${i+1}</td>`+cols.map(c=>`<td>${escapeHtml(r[c.key])}</td>`).join("")+"</tr>"; });
  h += "</tbody></table>";
  return h;
}
function letterheadHtml(){
  const s = db.sekolah;
  const logoSrc = s.logoDataUrl || (typeof LOGO_SEKOLAH!=="undefined" ? LOGO_SEKOLAH : "assets/img/logo-sekolah.png");
  return `<div class="letterhead">
    <div class="lh-logo"><img src="${logoSrc}" alt="Logo Sekolah" style="width:66px;height:66px;object-fit:contain;"></div>
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

