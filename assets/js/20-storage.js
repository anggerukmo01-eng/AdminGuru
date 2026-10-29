/* ================================================================
   FILE: assets/js/20-storage.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   2. STORAGE ENGINE (MULTI-KELAS)
   ------------------------------------------------------------
   Arsitektur: sebagian data bersifat "sekolah" (dipakai bersama
   semua kelas: profil sekolah, daftar guru/tendik, kalender
   pendidikan), sebagian bersifat "per-kelas" (siswa, kehadiran,
   nilai, jurnal, jadwal, dsb -- TIDAK PERNAH tercampur antar
   kelas karena disimpan di kunci localStorage terpisah per kelas).
   Variabel `db` tetap berbentuk gabungan seperti sebelumnya agar
   seluruh kode PAGES.* yang sudah ada TIDAK PERLU diubah satu per
   satu -- loadDB()/saveDB() yang mengurus pemisahannya.
   ============================================================ */
const CLASS_LIST = [
  {id:"kelas-1", angka:1, romawi:"I",   label:"Kelas 1", kelasText:"1 (Satu)"},
  {id:"kelas-2", angka:2, romawi:"II",  label:"Kelas 2", kelasText:"2 (Dua)"},
  {id:"kelas-3", angka:3, romawi:"III", label:"Kelas 3", kelasText:"3 (Tiga)"},
  {id:"kelas-4", angka:4, romawi:"IV",  label:"Kelas 4", kelasText:"4 (Empat)"},
  {id:"kelas-5", angka:5, romawi:"V",   label:"Kelas 5", kelasText:"5 (Lima)"},
  {id:"kelas-6", angka:6, romawi:"VI",  label:"Kelas 6", kelasText:"6 (Enam)"},
];
function classInfo(id){ return CLASS_LIST.find(c=>c.id===id) || CLASS_LIST[0]; }
function nextClassId(id){ const i=CLASS_LIST.findIndex(c=>c.id===id); return (i>=0 && i<CLASS_LIST.length-1) ? CLASS_LIST[i+1].id : null; }
function classFileTag(id){ return "Kelas-"+classInfo(id).angka; }

const DB_KEY = "tpsd2026_db_v1";                  // kunci LAMA (versi satu-kelas) -- dibaca sekali utk migrasi, tidak dihapus
const SET_KEY = "tpsd2026_settings_v1";
const SHARED_KEY = "tpsd2026_shared_v1";
const ACTIVE_CLASS_KEY = "tpsd2026_activeclass_v1";
const MIGRATION_FLAG_KEY = "tpsd2026_migrated_multikelas_v1";
const ALUMNI_KEY = "tpsd2026_alumni_v1";
function classKey(id){ return "tpsd2026_class_"+id+"_v1"; }

const SHARED_FIELDS = ["sekolah","guru","tendik","kalender"];

function defaultDB(){
  return {
    sekolah: SEED_SEKOLAH,
    guru: SEED_STAFF.guru,
    tendik: SEED_STAFF.tendik,
    siswa: [], // diisi runBukuIndukSeedIfNeeded dari SEED_BI_COMPACT
    jadwal: SEED_JADWAL_KELAS1, // { "Senin":[{jam,mapel}], ... } - default Kelas 1, kelas lain dikosongkan otomatis
    kalender: SEED_KALENDER.map(e=>({...e})),
    agenda: [],
    programTahunan: {isi:""},
    programSemester: {isi:""},
    cp: SEED_CP,
    atp: generateSeedATP(),
    kktp: generateSeedKKTP(),
    modulAjar: [],
    asesmenDiagnostik: [],
    asesmenFormatif: [],
    asesmenSumatif: [],
    raporDeskripsi: {}, // siswaId -> text
    kehadiran: {}, // tanggal -> {siswaId: status}
    perkembangan: [],
    homevisit: [],
    inventaris: [],
    bukutamu: [],
    supervisi: [],
    refleksi: [],
    tulisan: [],
    mutasi: [],
    arsip: [],
    // ==== Modul tambahan dari Aplikasi Administrasi Kelas 1 (xlsm) ====
    riwayatKesehatan: [],
    riwayatKelakuan: [],
    bakatMinat: [],
    ekstrakurikuler: [],
    studyTour: [],
    bukuPeganganGuru: [],
    bukuPeganganSiswa: [],
    denahTD: [],
    jadwalPiket: [],
    kelompokBelajar: [],
    alokasiWaktu: [],
    bimbingan: [],
    konsultasiOrtu: [],
    tabunganSiswa: [],
    pengambilanRapot: [],
    kenaikanKelas: [],
    aiDocs: [], // AI Teacher Suite Pro - dokumen hasil generate AI (per kelas)
  };
}
/* Mengosongkan struktur data (array->[], object bertingkat->key tetap
   ada tapi string dikosongkan) supaya kelas 2-6 dimulai KOSONG tanpa
   data karangan, namun bentuk field tetap konsisten dgn kelas 1. */
function emptyLike(val){
  if(Array.isArray(val)) return [];
  if(val && typeof val==="object"){
    const out={}; Object.keys(val).forEach(k=>{ out[k] = (typeof val[k]==="string") ? "" : emptyLike(val[k]); }); return out;
  }
  return val;
}
function defaultSharedDB(){
  const full = defaultDB();
  const shared = {}; SHARED_FIELDS.forEach(k=> shared[k]=full[k]);
  return shared;
}
function defaultClassDB(classId){
  const full = defaultDB();
  const out = {};
  Object.keys(full).forEach(k=>{
    if(SHARED_FIELDS.includes(k)) return;
    if(k==="cp" || k==="atp" || k==="kktp") return; // diisi khusus di bawah, fase-aware untuk SEMUA kelas
    out[k] = (classId==="kelas-1") ? full[k] : emptyLike(full[k]);
  });
  // CP/ATP/KKTP diisi otomatis sesuai fase kelas (A=Kelas1-2, B=Kelas3-4, C=Kelas5-6)
  // untuk SETIAP kelas (bukan hanya Kelas 1), mengikuti Kepka BSKAP No. 046/H/KR/2025
  // jo. Kepka BKPDM No. 020 Tahun 2026 (revisi khusus CP Pendidikan Agama & Budi Pekerti).
  const fase = faseForClassId(classId);
  const cpFase = cpSeedForFase(fase).map(e=>({...e}));
  out.cp = cpFase;
  out.atp = generateSeedATP(cpFase);
  out.kktp = generateSeedKKTP(cpFase);
  out.waliKelasId = (classId==="kelas-1") ? (full.sekolah.waliKelasId||"") : "";
  return out;
}

let db = null;
let activeClassId = "kelas-1";

/* Migrasi satu-kali dari versi lama (satu kelas) ke struktur multi-kelas.
   Data lama otomatis menjadi milik "kelas-1". Data ASLI di DB_KEY tetap
   dibiarkan utuh di localStorage (tidak dihapus) sebagai arsip cadangan. */
function runMultiClassMigrationIfNeeded(){
  if(localStorage.getItem(MIGRATION_FLAG_KEY)) return;
  try{
    const rawOld = localStorage.getItem(DB_KEY);
    if(rawOld){
      const old = JSON.parse(rawOld);
      const merged = Object.assign(defaultDB(), old);
      const shared = {}; SHARED_FIELDS.forEach(k=> shared[k]=merged[k]);
      const cls = {}; Object.keys(merged).forEach(k=>{ if(!SHARED_FIELDS.includes(k)) cls[k]=merged[k]; });
      cls.waliKelasId = merged.sekolah.waliKelasId || "";
      if(!localStorage.getItem(SHARED_KEY)) localStorage.setItem(SHARED_KEY, JSON.stringify(shared));
      if(!localStorage.getItem(classKey("kelas-1"))) localStorage.setItem(classKey("kelas-1"), JSON.stringify(cls));
    }
  }catch(e){ console.warn("Migrasi multi-kelas gagal, memakai data default.", e); }
  localStorage.setItem(MIGRATION_FLAG_KEY, "1");
}
function loadSharedDB(){
  try{ const raw = localStorage.getItem(SHARED_KEY); if(raw) return Object.assign(defaultSharedDB(), JSON.parse(raw)); }catch(e){}
  return defaultSharedDB();
}
function saveSharedDB(shared){ localStorage.setItem(SHARED_KEY, JSON.stringify(shared)); }
function loadClassDB(classId){
  try{ const raw = localStorage.getItem(classKey(classId)); if(raw) return Object.assign(defaultClassDB(classId), JSON.parse(raw)); }catch(e){}
  return defaultClassDB(classId);
}
function saveClassDB(classId, clsData){ localStorage.setItem(classKey(classId), JSON.stringify(clsData)); }
function loadActiveClassId(){
  const v = localStorage.getItem(ACTIVE_CLASS_KEY);
  return CLASS_LIST.some(c=>c.id===v) ? v : "kelas-1";
}
function loadAlumni(){ try{ const raw=localStorage.getItem(ALUMNI_KEY); if(raw) return JSON.parse(raw); }catch(e){} return []; }
function saveAlumni(list){ localStorage.setItem(ALUMNI_KEY, JSON.stringify(list)); }

/* Mengisi data siswa Kelas 2-6 dari DATA_SISWA_KELAS_2-6_SDN1_GERDUREN.xlsx
   (sheet dipetakan sesuai label kelasnya). Berjalan SATU KALI, dan HANYA
   mengisi kelas yang rosternya masih kosong -- tidak pernah menimpa data
   yang sudah diisi/diubah sendiri oleh guru. */
// Migrasi CP revisi 2026: sebelumnya hanya Kelas 1 (Fase A) memiliki data
// CP/ATP/KKTP bawaan, Kelas 2-6 kosong. Sekali jalan, isi CP/ATP/KKTP setiap
// kelas yang MASIH KOSONG dengan CP resmi sesuai fasenya (A/B/C), mengikuti
// Kepka BSKAP No. 046/H/KR/2025 jo. Kepka BKPDM No. 020 Tahun 2026. Kelas yang
// CP-nya sudah pernah disunting guru TIDAK akan ditimpa.
const CP_REVISI_2026_FLAG = "tpsd2026_cp_revisi2026_v1";
function runCpRevisi2026SeedIfNeeded(){
  if(localStorage.getItem(CP_REVISI_2026_FLAG)) return;
  try{
    CLASS_LIST.forEach(c=>{
      const cls = loadClassDB(c.id);
      if(!cls.cp || cls.cp.length===0){
        const fase = faseForClassId(c.id);
        const cpFase = cpSeedForFase(fase).map(e=>({...e}));
        cls.cp = cpFase;
        if(!cls.atp || cls.atp.length===0) cls.atp = generateSeedATP(cpFase);
        if(!cls.kktp || cls.kktp.length===0) cls.kktp = generateSeedKKTP(cpFase);
        saveClassDB(c.id, cls);
      }
    });
  }catch(e){ console.warn("Gagal menjalankan migrasi CP revisi 2026.", e); }
  localStorage.setItem(CP_REVISI_2026_FLAG, "1");
}
// Migrasi jadwal Kelas 1: mengisikan Jadwal Pelajaran Kelas I resmi (dokumen
// 13 Juli 2026) untuk instalasi yang sudah ada namun jadwalnya masih kosong.
// Jadwal yang sudah pernah diisi/disunting guru TIDAK akan ditimpa.
const JADWAL_KELAS1_SEED_FLAG = "tpsd2026_jadwalkelas1_seed_v1";
function runJadwalKelas1SeedIfNeeded(){
  if(!localStorage.getItem(JADWAL_KELAS1_SEED_FLAG)){
    try{
      const cls = loadClassDB("kelas-1");
      const jadwalKosong = !cls.jadwal || Object.keys(cls.jadwal).length===0 ||
        HARI.every(h => !cls.jadwal[h] || cls.jadwal[h].length===0);
      if(jadwalKosong){
        cls.jadwal = JSON.parse(JSON.stringify(SEED_JADWAL_KELAS1));
        saveClassDB("kelas-1", cls);
      }
    }catch(e){ console.warn("Gagal menjalankan migrasi jadwal Kelas 1.", e); }
    localStorage.setItem(JADWAL_KELAS1_SEED_FLAG, "1");
  }
  // Normalisasi nama mapel singkatan lama -> baku (idempoten, untuk data yang sudah ada)
  try{
    if(typeof normalisasiMapelJadwal==="function"){
      const cls = loadClassDB("kelas-1");
      let changed = false;
      Object.keys(cls.jadwal||{}).forEach(h=>{
        (cls.jadwal[h]||[]).forEach(s=>{
          const n = normalisasiMapelJadwal(s.mapel);
          if(n!==s.mapel){ s.mapel = n; changed = true; }
        });
      });
      if(changed) saveClassDB("kelas-1", cls);
    }
  }catch(e){ console.warn("Gagal normalisasi nama mapel jadwal.", e); }
}

function loadDB(){
  runMultiClassMigrationIfNeeded();
  runBukuIndukSeedIfNeeded();
  runCpRevisi2026SeedIfNeeded();
  if(typeof runRencanaPblSeedIfNeeded==="function") runRencanaPblSeedIfNeeded();
  runJadwalKelas1SeedIfNeeded();
  activeClassId = loadActiveClassId();
  const shared = loadSharedDB();
  const cls = loadClassDB(activeClassId);
  const merged = Object.assign({}, shared, cls);
  merged.sekolah = Object.assign({}, shared.sekolah, {waliKelasId: cls.waliKelasId||"", kelas: classInfo(activeClassId).kelasText});
  return merged;
}
function saveDB(){
  const shared = Object.assign({}, db.sekolah);
  delete shared.waliKelasId; delete shared.kelas; // milik data per-kelas, tidak disimpan di profil bersama
  saveSharedDB({sekolah:shared, guru:db.guru, tendik:db.tendik, kalender:db.kalender});
  const cls = {}; Object.keys(db).forEach(k=>{ if(!SHARED_FIELDS.includes(k)) cls[k]=db[k]; });
  cls.waliKelasId = db.sekolah.waliKelasId||"";
  saveClassDB(activeClassId, cls);
}
/* Ganti kelas aktif global -- memuat ulang seluruh data ke variabel db
   dari kunci localStorage milik kelas tsb, lalu me-render ulang halaman. */
function switchActiveClass(newClassId){
  if(!CLASS_LIST.some(c=>c.id===newClassId) || newClassId===activeClassId){ return; }
  activeClassId = newClassId;
  localStorage.setItem(ACTIVE_CLASS_KEY, newClassId);
  db = loadDB();
  buildSidebar();
  navigate(currentPage);
  toast("Kelas aktif: "+classInfo(newClassId).label);
}


function loadSettings(){
  try{
    const raw = localStorage.getItem(SET_KEY);
    if(raw) return Object.assign(defaultSettings(), JSON.parse(raw));
  }catch(e){}
  return defaultSettings();
}
function defaultSettings(){
  return {
    pin:"", theme:"dark", autoLockMin:10, bunyiSukses:false,
    cloud:{
      email:"",
      totalBackup:0,
      ukuranCloud:0,
      lastBackupAt:"",
      lastSyncAt:"",
      lastSyncStatus:"Belum Sinkron",
      log:[],                 // riwayat aktivitas: {waktu,aksi,status,pesan}
    },
  };
}
function saveSettings(){ localStorage.setItem(SET_KEY, JSON.stringify(settings)); }
let settings = loadSettings();

function uid(prefix){ return prefix+"_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function fmtDate(iso){ if(!iso) return "-"; const d=new Date(iso+"T00:00:00"); if(isNaN(d)) return iso; const bln=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]; return d.getDate()+" "+bln[d.getMonth()]+" "+d.getFullYear(); }
function todayISO(){ const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); }
function escapeHtml(s){ return (s==null?"":String(s)).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* ============================================================
   2B. ARSIP DIGITAL - PENYIMPANAN FILE VIA INDEXEDDB
   ------------------------------------------------------------
   Modul terpisah dari sistem localStorage (SEDIA/db) yang sudah ada.
   Dipakai untuk menyimpan file guru berukuran besar (PDF/JPG/PNG/DOCX)
   secara 100% offline: Modul Ajar (upload file), Jurnal Mengajar
   (scan/OCR), dan Arsip Dokumen umum (ATP/CP/RPP/Administrasi/Lainnya).
   Tidak mengubah struktur data localStorage (db) yang sudah berjalan.
   ============================================================ */
const IDB_NAME = "tpsd2026_arsip_db";
const IDB_VERSION = 1;
const IDB_STORE = "files";
let _idbInstance = null;
function idbSupported(){ return typeof indexedDB !== "undefined"; }
function idbOpen(){
  return new Promise((resolve,reject)=>{
    if(_idbInstance){ resolve(_idbInstance); return; }
    if(!idbSupported()){ reject(new Error("IndexedDB tidak didukung oleh peramban ini.")); return; }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e)=>{
      const dbx = e.target.result;
      if(!dbx.objectStoreNames.contains(IDB_STORE)){
        const store = dbx.createObjectStore(IDB_STORE, {keyPath:"id"});
        store.createIndex("kategori","kategori",{unique:false});
        store.createIndex("kelasId","kelasId",{unique:false});
        store.createIndex("mapel","mapel",{unique:false});
        store.createIndex("semester","semester",{unique:false});
        store.createIndex("tanggalUpload","tanggalUpload",{unique:false});
      }
    };
    req.onsuccess = (e)=>{ _idbInstance = e.target.result; resolve(_idbInstance); };
    req.onerror = (e)=>{ reject(e.target.error||new Error("Gagal membuka IndexedDB.")); };
  });
}
function idbPut(record){
  return idbOpen().then(dbx=>new Promise((resolve,reject)=>{
    const tx = dbx.transaction(IDB_STORE,"readwrite");
    tx.objectStore(IDB_STORE).put(record);
    tx.oncomplete = ()=>resolve(record);
    tx.onerror = (e)=>reject(e.target.error);
  }));
}
function idbGetAll(){
  return idbOpen().then(dbx=>new Promise((resolve,reject)=>{
    const tx = dbx.transaction(IDB_STORE,"readonly");
    const req = tx.objectStore(IDB_STORE).getAll();
    req.onsuccess = ()=>resolve(req.result||[]);
    req.onerror = (e)=>reject(e.target.error);
  }));
}
function idbGet(id){
  return idbOpen().then(dbx=>new Promise((resolve,reject)=>{
    const tx = dbx.transaction(IDB_STORE,"readonly");
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = ()=>resolve(req.result||null);
    req.onerror = (e)=>reject(e.target.error);
  }));
}
function idbDelete(id){
  return idbOpen().then(dbx=>new Promise((resolve,reject)=>{
    const tx = dbx.transaction(IDB_STORE,"readwrite");
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = ()=>resolve();
    tx.onerror = (e)=>reject(e.target.error);
  }));
}
function formatUkuranFile(bytes){
  if(bytes==null) return "-";
  if(bytes < 1024) return bytes+" B";
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1)+" KB";
  return (bytes/(1024*1024)).toFixed(2)+" MB";
}
function fileIconFor(namaFile){
  const ext = (namaFile||"").split(".").pop().toLowerCase();
  if(["jpg","jpeg","png","gif","webp"].includes(ext)) return "image";
  if(ext==="pdf") return "doc";
  if(["doc","docx"].includes(ext)) return "doc";
  return "archive";
}
const ARSIP_KATEGORI = ["Modul Ajar","Jurnal Mengajar","ATP","CP","RPP","Administrasi Guru","Dokumen Lain"];
// Cache in-memory ringan agar render list tidak selalu menunggu Promise IndexedDB berulang kali dalam satu halaman.
let _arsipCache = null;
async function arsipRefreshCache(){ _arsipCache = await idbGetAll(); return _arsipCache; }
function arsipCacheOrEmpty(){ return _arsipCache || []; }

function arsipFilterMatches(r, filters){
  filters = filters || {};
  if(filters.kategori && r.kategori!==filters.kategori) return false;
  if(filters.kelasId && r.kelasId!==filters.kelasId && r.kelasId!=="all") return false;
  if(filters.mapel && r.mapel!==filters.mapel) return false;
  if(filters.semester && r.semester!==filters.semester) return false;
  if(filters.q){
    const q = filters.q.toLowerCase();
    const hay = [r.namaFile,r.mapel,r.bab,r.keterangan,r.ocrText].filter(Boolean).join(" ").toLowerCase();
    if(!hay.includes(q)) return false;
  }
  return true;
}
function arsipCardHtml(r){
  const kelasLabel = (!r.kelasId || r.kelasId==="all") ? "Semua Kelas" : (classInfo(r.kelasId).label || r.kelasId);
  return `<div class="card" style="margin-bottom:10px;">
    <div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="width:40px;height:40px;border-radius:10px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ic(fileIconFor(r.namaFile),20)}</div>
      <div style="flex:1;min-width:0;">
        <strong style="word-break:break-word;font-size:13px;">${escapeHtml(r.namaFile)}</strong>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin:5px 0;">
          <span class="badge badge-blue">${escapeHtml(r.kategori||'-')}</span>
          ${r.mapel?`<span class="badge badge-green">${escapeHtml(r.mapel)}</span>`:""}
          <span class="badge">${escapeHtml(kelasLabel)}</span>
          ${r.semester?`<span class="badge">Smt ${escapeHtml(r.semester)}</span>`:""}
          ${r.bab?`<span class="badge badge-orange">${escapeHtml(r.bab)}</span>`:""}
        </div>
        <div class="muted" style="font-size:11.5px;">${fmtDate(r.tanggalUpload)} &middot; ${formatUkuranFile(r.ukuran)}${r.tanggalMengajar?(" &middot; Tgl Mengajar: "+fmtDate(r.tanggalMengajar)):""}</div>
        ${r.keterangan?`<div class="muted" style="font-size:11.5px;margin-top:2px;">${escapeHtml(r.keterangan)}</div>`:""}
        ${r.ocrText?`<details style="margin-top:6px;"><summary style="cursor:pointer;font-size:11.5px;color:var(--primary);">${ic("search",11)} Lihat hasil OCR (dapat dicari)</summary><p style="font-size:11.5px;white-space:pre-wrap;margin-top:4px;max-height:160px;overflow-y:auto;">${escapeHtml(r.ocrText.slice(0,2000))}${r.ocrText.length>2000?"...":""}</p></details>`:""}
      </div>
      <div class="row-actions" style="flex-shrink:0;flex-wrap:wrap;">
        <button class="btn btn-sm btn-icon" title="Lihat" onclick="viewArsipFile('${r.id}')">${ic("eye",14)}</button>
        <button class="btn btn-sm btn-icon" title="Unduh" onclick="downloadArsipFile('${r.id}')">${ic("download",14)}</button>
        <button class="btn btn-sm btn-icon" title="Ganti File" onclick="replaceArsipFile('${r.id}')">${ic("upload",14)}</button>
        <button class="btn btn-sm btn-icon btn-danger" title="Hapus" onclick="deleteArsipFile('${r.id}')">${ic("trash",14)}</button>
      </div>
    </div>
  </div>`;
}
async function renderArsipListInto(holderId, filters, sortDesc){
  const holder = document.getElementById(holderId);
  if(!holder) return;
  holder.innerHTML = `<p class="muted">Memuat arsip...</p>`;
  try{
    if(!idbSupported()){ holder.innerHTML = `<div class="empty-state">Peramban ini tidak mendukung IndexedDB -- penyimpanan file tidak tersedia. Data lain pada aplikasi tetap berjalan normal.</div>`; return; }
    const all = await arsipRefreshCache();
    let rows = all.filter(r=>arsipFilterMatches(r, filters));
    rows.sort((a,b)=> String(b.tanggalUpload||"").localeCompare(String(a.tanggalUpload||"")));
    holder.innerHTML = rows.length ? rows.map(arsipCardHtml).join("") : `<div class="empty-state">Belum ada file pada kategori/filter ini. Klik "Unggah Dokumen" untuk menambahkan.</div>`;
  }catch(e){ holder.innerHTML = `<div class="empty-state">Gagal memuat arsip: ${escapeHtml(e.message)}</div>`; }
}
function uploadArsipFile(opts){
  opts = opts || {};
  const kelasOpts = [{value:"all",label:"Semua Kelas"}].concat(CLASS_LIST.map(c=>({value:c.id,label:c.label})));
  const semesterOpts = [{value:"1",label:"Semester 1"},{value:"2",label:"Semester 2"}];
  const fieldsHtml = `
    <div class="field"><label>Pilih File (PDF/JPG/PNG/DOCX)</label><input type="file" id="arsipFileInput" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"></div>
    <div class="form-grid">
      ${fieldHtml({key:"kategori",label:"Kategori",type:"select",options:ARSIP_KATEGORI}, opts.kategori||"Dokumen Lain")}
      ${fieldHtml({key:"kelasId",label:"Kelas",type:"select",options:kelasOpts}, opts.kelasId||activeClassId)}
      ${fieldHtml({key:"mapel",label:"Mata Pelajaran (opsional)",type:"select",options:MAPEL_LIST}, opts.mapel||"")}
      ${fieldHtml({key:"semester",label:"Semester (opsional)",type:"select",options:semesterOpts}, opts.semester||"")}
      ${fieldHtml({key:"bab",label:"Bab / Lingkup Materi (opsional)"}, opts.bab||"")}
      ${opts.showTanggalMengajar ? fieldHtml({key:"tanggalMengajar",label:"Tanggal Mengajar"+(opts.kategori==="Jurnal Mengajar"?" *":""),type:"date"}, todayISO()) : ""}
      ${fieldHtml({key:"keterangan",label:"Keterangan",type:"textarea"}, "")}
    </div>
    ${opts.enableOcr ? `<label style="display:flex;gap:8px;align-items:center;font-size:12.5px;margin-top:6px;"><input type="checkbox" id="arsipOcrCheck" checked> Baca isi dokumen dengan OCR agar teksnya dapat dicari (memerlukan koneksi internet saat pertama kali memuat mesin OCR; jika gagal/offline, file tetap tersimpan)</label>` : ""}
  `;
  openModal({
    title: opts.title || "Unggah Dokumen",
    bodyHtml: fieldsHtml,
    footHtml: `<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="arsipUploadBtn">${ic("upload",15)} Unggah</button>`
  });
  document.getElementById("arsipUploadBtn").onclick = ()=>{
    const fileInput = document.getElementById("arsipFileInput");
    if(!fileInput.files.length){ toast("Pilih file terlebih dahulu."); return; }
    const file = fileInput.files[0];
    const btn = document.getElementById("arsipUploadBtn");
    btn.disabled = true; btn.textContent = "Mengunggah...";
    const record = {
      id: uid("arsip"),
      namaFile: file.name,
      tipeMime: file.type,
      ukuran: file.size,
      blob: file,
      tanggalUpload: todayISO(),
      kategori: (document.getElementById("f_kategori")||{}).value || "Dokumen Lain",
      kelasId: (document.getElementById("f_kelasId")||{}).value || "all",
      mapel: (document.getElementById("f_mapel")||{}).value || "",
      semester: (document.getElementById("f_semester")||{}).value || "",
      bab: (document.getElementById("f_bab")||{}).value || "",
      tanggalMengajar: opts.showTanggalMengajar ? ((document.getElementById("f_tanggalMengajar")||{}).value||"") : "",
      keterangan: (document.getElementById("f_keterangan")||{}).value || "",
      ocrText: "",
    };
    idbPut(record).then(()=>{
      toast("File berhasil diunggah & tersimpan offline.");
      closeModal();
      const wantOcr = opts.enableOcr && document.getElementById("arsipOcrCheck") && document.getElementById("arsipOcrCheck").checked;
      if(wantOcr) runOcrOnRecord(record.id, file);
      if(opts.onDone) opts.onDone();
    }).catch(e=>{
      toast("Gagal menyimpan file: "+e.message);
      btn.disabled=false; btn.textContent="Unggah";
    });
  };
}
let _tesseractLoadPromise = null;
function loadTesseractIfNeeded(){
  if(window.Tesseract) return Promise.resolve();
  if(_tesseractLoadPromise) return _tesseractLoadPromise;
  _tesseractLoadPromise = new Promise((resolve,reject)=>{
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js";
    s.onload = ()=>resolve();
    s.onerror = ()=>{ _tesseractLoadPromise=null; reject(new Error("Gagal memuat mesin OCR (perlu koneksi internet).")); };
    document.head.appendChild(s);
  });
  return _tesseractLoadPromise;
}
function runOcrOnRecord(recordId, file){
  toast("Memproses OCR di latar belakang...");
  loadTesseractIfNeeded()
    .then(()=> window.Tesseract.recognize(file, "ind+eng"))
    .then(({data})=> idbGet(recordId).then(rec=>{
      if(rec){ rec.ocrText = (data.text||"").trim(); return idbPut(rec); }
    }))
    .then(()=>{
      toast("OCR selesai, teks jurnal dapat dicari.");
      if(window._arsipOnRefresh) window._arsipOnRefresh();
    })
    .catch(()=>{ toast("OCR gagal/tidak tersedia (offline?). File asli tetap tersimpan."); });
}
function viewArsipFile(id){
  idbGet(id).then(rec=>{
    if(!rec){ toast("File tidak ditemukan."); return; }
    const url = URL.createObjectURL(rec.blob);
    const ext = (rec.namaFile||"").split(".").pop().toLowerCase();
    if(["jpg","jpeg","png","gif","webp"].includes(ext)){
      openModal({title:rec.namaFile, bodyHtml:`<img src="${url}" style="width:100%;border-radius:10px;">`, footHtml:`<button class="btn" onclick="closeModal()">Tutup</button><button class="btn btn-primary" onclick="downloadArsipFile('${id}')">${ic("download",14)} Unduh</button>`});
    } else {
      window.open(url, "_blank");
    }
    setTimeout(()=>URL.revokeObjectURL(url), 60000);
  }).catch(e=>toast("Gagal membuka file: "+e.message));
}
function downloadArsipFile(id){
  idbGet(id).then(rec=>{
    if(!rec){ toast("File tidak ditemukan."); return; }
    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement("a"); a.href=url; a.download=rec.namaFile; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
  }).catch(e=>toast("Gagal mengunduh: "+e.message));
}
function replaceArsipFile(id){
  openModal({
    title:"Ganti File",
    bodyHtml:`<div class="field"><label>Pilih File Pengganti</label><input type="file" id="arsipReplaceInput"></div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="arsipReplaceBtn">${ic("check",15)} Ganti</button>`
  });
  document.getElementById("arsipReplaceBtn").onclick = ()=>{
    const inp = document.getElementById("arsipReplaceInput");
    if(!inp.files.length){ toast("Pilih file terlebih dahulu."); return; }
    const file = inp.files[0];
    idbGet(id).then(rec=>{
      if(!rec){ toast("File lama tidak ditemukan."); return; }
      rec.namaFile = file.name; rec.tipeMime = file.type; rec.ukuran = file.size; rec.blob = file; rec.tanggalUpload = todayISO();
      return idbPut(rec);
    }).then(()=>{
      toast("File berhasil diganti."); closeModal();
      if(window._arsipOnRefresh) window._arsipOnRefresh();
    }).catch(e=>toast("Gagal mengganti file: "+e.message));
  };
}
function deleteArsipFile(id){
  confirmDialog("Hapus file ini dari arsip? Tindakan tidak dapat dibatalkan.", ()=>{
    idbDelete(id).then(()=>{
      toast("File dihapus.");
      if(window._arsipOnRefresh) window._arsipOnRefresh();
    }).catch(e=>toast("Gagal menghapus: "+e.message));
  });
}

