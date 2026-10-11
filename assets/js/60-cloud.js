/* ================================================================
   FILE: assets/js/60-cloud.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   6C. SUPABASE CLOUD BACKUP & RESTORE (MODUL OPSIONAL)
   ------------------------------------------------------------
   Menggantikan modul Google Drive dengan Supabase (Auth Email &
   Password + Storage privat + PostgreSQL di baliknya). Konfigurasi
   SUPABASE_URL & SUPABASE_ANON_KEY ada pada file terpisah
   "supabase.js" (lihat PANDUAN_SUPABASE.md yang disertakan).
   Catatan jujur:
   - Butuh internet & project Supabase milik sendiri (tidak disertakan).
   - Setiap pengguna hanya dapat melihat backup miliknya sendiri berkat
     Row Level Security (RLS) pada bucket Storage "backups" (lihat
     supabase_setup.sql).
   - Sesi login dikelola oleh pustaka Supabase JS sendiri (localStorage
     terpisah dari data aplikasi ini), sehingga bisa tetap tersambung
     setelah memuat ulang halaman selama token belum kedaluwarsa.
   ============================================================ */
const CLOUD_BUCKET = "backups";
let cloudUser = null;         // {id, email}
let cloudBackupsCache = [];   // hasil terakhir dari list() Supabase Storage

function cloudClient(){ return window.supabaseClient || null; }
function cloudConfigured(){ return !!cloudClient(); }
function cloudLog(aksi, status, pesan){
  settings.cloud.log.unshift({waktu:new Date().toISOString(), aksi, status, pesan:pesan||""});
  settings.cloud.log = settings.cloud.log.slice(0,200);
  saveSettings();
}
function cloudSetSyncStatus(s){
  settings.cloud.lastSyncStatus = s; saveSettings();
  const el = document.getElementById("cloudSyncStatusText"); if(el) el.textContent = s;
}
function cloudStatusBadge(){
  if(!cloudConfigured()) return `<span class="badge badge-orange">Belum Dikonfigurasi</span>`;
  if(cloudUser) return `<span class="badge badge-green">Terhubung</span>`;
  return `<span class="badge badge-red">Belum Login</span>`;
}

/* ---- Autentikasi (Email & Password via Supabase Auth) ---- */
async function cloudCheckSession(){
  const client = cloudClient(); if(!client) return;
  try{
    const {data} = await client.auth.getSession();
    if(data && data.session && data.session.user){
      cloudUser = {id:data.session.user.id, email:data.session.user.email};
      settings.cloud.email = cloudUser.email; saveSettings();
    }
  }catch(e){ /* sesi tidak ditemukan/berakhir; guru cukup login ulang */ }
}
function cloudOpenAuthModal(){
  if(!cloudConfigured()){ toast("Konfigurasi Supabase belum diisi. Lihat file supabase.js & PANDUAN_SUPABASE.md."); return; }
  window._cloudAuthMode = "login";
  openModal({
    title:"Masuk ke Cloud Storage",
    bodyHtml:`
      <div class="pill-toggle" style="max-width:260px;margin-bottom:14px;">
        <button id="cloudTabLogin" class="active" onclick="cloudSwitchAuthTab('login')">Masuk</button>
        <button id="cloudTabRegister" onclick="cloudSwitchAuthTab('register')">Daftar Baru</button>
      </div>
      <div class="field"><label>Email</label><input type="email" id="cloudAuthEmail" placeholder="guru@sekolah.sch.id"></div>
      <div class="field"><label>Password</label><input type="password" id="cloudAuthPassword" placeholder="Minimal 6 karakter"></div>
      <p class="hint" id="cloudAuthHint">Masuk memakai akun Supabase (Email &amp; Password) yang sudah didaftarkan.</p>
    `,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="cloudAuthSubmitBtn">${ic("check",15)} Masuk</button>`
  });
  document.getElementById("cloudAuthSubmitBtn").onclick = cloudSubmitAuth;
}
function cloudSwitchAuthTab(mode){
  window._cloudAuthMode = mode;
  document.getElementById("cloudTabLogin").classList.toggle("active", mode==="login");
  document.getElementById("cloudTabRegister").classList.toggle("active", mode==="register");
  document.getElementById("cloudAuthSubmitBtn").innerHTML = mode==="login" ? `${ic("check",15)} Masuk` : `${ic("check",15)} Daftar`;
  document.getElementById("cloudAuthHint").textContent = mode==="login"
    ? "Masuk memakai akun Supabase (Email & Password) yang sudah didaftarkan."
    : "Membuat akun baru. Tergantung pengaturan project Supabase, mungkin perlu verifikasi email terlebih dahulu sebelum bisa masuk.";
}
async function cloudSubmitAuth(){
  const client = cloudClient(); if(!client) return;
  const email = (document.getElementById("cloudAuthEmail").value||"").trim();
  const password = document.getElementById("cloudAuthPassword").value||"";
  if(!email || !password){ toast("Isi email dan password terlebih dahulu."); return; }
  const btn = document.getElementById("cloudAuthSubmitBtn"); btn.disabled = true;
  try{
    if(window._cloudAuthMode==="register"){
      const {data, error} = await client.auth.signUp({email, password});
      if(error) throw error;
      if(data.user && !data.session){
        cloudLog("Daftar Akun","Berhasil",email+" (menunggu verifikasi email)");
        toast("Pendaftaran berhasil. Silakan cek email untuk verifikasi, lalu masuk.");
        closeModal();
      } else if(data.session){
        cloudUser = {id:data.user.id, email:data.user.email};
        settings.cloud.email = cloudUser.email; saveSettings();
        cloudLog("Daftar Akun","Berhasil",email);
        toast("Pendaftaran & masuk berhasil.");
        closeModal(); renderPage(currentPage);
      }
    } else {
      const {data, error} = await client.auth.signInWithPassword({email, password});
      if(error) throw error;
      cloudUser = {id:data.user.id, email:data.user.email};
      settings.cloud.email = cloudUser.email; saveSettings();
      cloudLog("Login","Berhasil",email);
      toast("Berhasil masuk sebagai "+email+".");
      closeModal(); renderPage(currentPage);
    }
  }catch(e){
    cloudLog(window._cloudAuthMode==="register"?"Daftar Akun":"Login","Gagal",e.message);
    toast("Gagal: "+e.message);
  }finally{ btn.disabled = false; }
}
async function cloudLogout(){
  const client = cloudClient(); if(!client) return;
  try{ await client.auth.signOut(); }catch(e){}
  cloudUser = null; cloudBackupsCache = [];
  cloudLog("Logout","Berhasil","");
  toast("Berhasil keluar dari Cloud Storage.");
  renderPage(currentPage);
}

/* ---- Metadata Backup ---- */
function cloudBuildMetadata(){
  const wali = db.guru.find(g=>g.id===db.sekolah.waliKelasId);
  return {
    waktuBackup: new Date().toISOString(),
    versiAplikasi: "2026.2-multikelas",
    namaSekolah: db.sekolah.namaSekolah || "",
    namaGuru: wali ? wali.nama : "",
    kelasAktif: classInfo(activeClassId).label,
    device: navigator.userAgent || "",
  };
}
function cloudTimestampName(){
  const d = new Date();
  const pad = n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/* ---- Backup / Sinkronisasi: mengunggah salinan JSON baru ke Storage,
   TIDAK PERNAH menimpa/menghapus backup lama, sehingga riwayat tetap ada. ---- */
async function cloudBackupNow(isSync){
  const client = cloudClient();
  if(!client){ toast("Konfigurasi Supabase belum diisi."); return; }
  if(!cloudUser){ toast("Silakan masuk (login) terlebih dahulu."); return; }
  cloudSetSyncStatus("Sedang Sinkron");
  try{
    const fullPayload = collectFullBackupPayload();
    const metadata = cloudBuildMetadata();
    const payloadWithMeta = Object.assign({}, fullPayload, {_cloudMeta: metadata});
    const jsonText = JSON.stringify(payloadWithMeta);
    const path = `${cloudUser.id}/${cloudTimestampName()}-backup.json`;
    const blob = new Blob([jsonText], {type:"application/json"});
    const {error} = await client.storage.from(CLOUD_BUCKET).upload(path, blob, {
      contentType:"application/json", upsert:false,
    });
    if(error) throw error;
    settings.cloud.lastBackupAt = metadata.waktuBackup;
    settings.cloud.lastSyncAt = metadata.waktuBackup;
    saveSettings();
    cloudSetSyncStatus("Sinkron Berhasil");
    cloudLog(isSync?"Sinkronkan":"Backup","Berhasil",path);
    toast(isSync ? "Sinkronisasi ke Cloud berhasil." : "Backup berhasil.");
    await cloudRefreshStats();
    if(window.cloudRefreshList) window.cloudRefreshList();
  }catch(e){
    cloudSetSyncStatus("Belum Sinkron");
    cloudLog(isSync?"Sinkronkan":"Backup","Gagal",e.message);
    toast((isSync?"Sinkronisasi":"Backup")+" gagal: "+e.message);
  }
}

/* ---- Daftar & Statistik ---- */
async function cloudListBackups(){
  const client = cloudClient(); if(!client || !cloudUser) return [];
  const {data, error} = await client.storage.from(CLOUD_BUCKET).list(cloudUser.id, {
    sortBy:{column:"created_at", order:"desc"}, limit:200,
  });
  if(error) throw error;
  cloudBackupsCache = (data||[]).filter(f=>f.name && f.name.endsWith(".json"));
  return cloudBackupsCache;
}
async function cloudRefreshStats(){
  try{
    const files = await cloudListBackups();
    settings.cloud.totalBackup = files.length;
    settings.cloud.ukuranCloud = files.reduce((a,f)=>a+((f.metadata&&f.metadata.size)||0),0);
    if(files.length) settings.cloud.lastBackupAt = files[0].created_at || settings.cloud.lastBackupAt;
    saveSettings();
  }catch(e){ /* biarkan angka lama tampil bila gagal memuat statistik */ }
}

/* ---- Restore ---- */
function cloudValidateBackupStructure(parsed){
  return !!(parsed && (parsed.classes || parsed.db));
}
async function cloudDownloadBackupText(path){
  const client = cloudClient();
  const {data, error} = await client.storage.from(CLOUD_BUCKET).download(path);
  if(error) throw error;
  return await data.text();
}
function cloudRestore(path, filename){
  confirmDialog(`Pulihkan data dari "${filename}"? Data saat ini di perangkat ini akan DITIMPA (cadangan lokal otomatis akan diunduh lebih dulu), lalu aplikasi akan dimuat ulang.`, async ()=>{
    try{
      backupData(); // cadangan lokal otomatis (unduh .json ke perangkat) sebelum menimpa
      const text = await cloudDownloadBackupText(path);
      const parsed = JSON.parse(text);
      if(!cloudValidateBackupStructure(parsed)){ throw new Error("Struktur berkas backup tidak valid/tidak dikenali."); }
      const keepCloudSettings = settings.cloud;
      applyFullBackupPayload(parsed);
      settings.cloud = keepCloudSettings; saveSettings();
      cloudLog("Restore","Berhasil",filename);
      toast("Restore berhasil. Memuat ulang aplikasi...");
      setTimeout(()=>location.reload(), 800);
    }catch(e){
      cloudLog("Restore","Gagal",e.message);
      toast("Restore gagal: "+e.message);
    }
  });
}
function cloudPreviewMetadataByName(name){
  const f = cloudBackupsCache.find(x=>x.name===name);
  if(!f){ toast("Data berkas tidak ditemukan, segarkan daftar terlebih dahulu."); return; }
  const path = `${cloudUser.id}/${f.name}`;
  openModal({
    title:"Pratinjau Backup: "+f.name,
    bodyHtml:`<p class="muted">Memuat metadata...</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Tutup</button><button class="btn btn-primary" onclick="closeModal(); cloudRestore('${path}','${escapeHtml(f.name)}')">${ic("check",15)} Restore Berkas Ini</button>`
  });
  cloudDownloadBackupText(path).then(text=>{
    let meta = {};
    try{ meta = JSON.parse(text)._cloudMeta || {}; }catch(e){}
    document.getElementById("modalBody").innerHTML = `<table><tbody>
      <tr><td style="width:150px;"><strong>Waktu Backup</strong></td><td>: ${meta.waktuBackup?fmtDate(meta.waktuBackup.slice(0,10))+" "+meta.waktuBackup.slice(11,16):"-"}</td></tr>
      <tr><td><strong>Versi Aplikasi</strong></td><td>: ${escapeHtml(meta.versiAplikasi||"-")}</td></tr>
      <tr><td><strong>Nama Sekolah</strong></td><td>: ${escapeHtml(meta.namaSekolah||"-")}</td></tr>
      <tr><td><strong>Nama Guru</strong></td><td>: ${escapeHtml(meta.namaGuru||"-")}</td></tr>
      <tr><td><strong>Kelas Aktif</strong></td><td>: ${escapeHtml(meta.kelasAktif||"-")}</td></tr>
      <tr><td><strong>Perangkat</strong></td><td>: ${escapeHtml((meta.device||"-").slice(0,60))}</td></tr>
      <tr><td><strong>Ukuran</strong></td><td>: ${formatUkuranFile(f.metadata&&f.metadata.size)}</td></tr>
    </tbody></table>`;
  }).catch(e=>{
    const mb = document.getElementById("modalBody");
    if(mb) mb.innerHTML = `<p class="muted">Gagal memuat metadata: ${escapeHtml(e.message)}</p>`;
  });
}

/* ---- Render daftar backup ke dalam halaman ---- */
async function cloudRefreshList(){
  const holder = document.getElementById("cloudListHolder");
  if(!holder) return;
  if(!cloudUser){ holder.innerHTML = `<p class="muted">Masuk (login) terlebih dahulu untuk melihat daftar backup.</p>`; return; }
  holder.innerHTML = `<p class="muted">Memuat daftar backup...</p>`;
  try{
    const files = await cloudListBackups();
    if(!files.length){ holder.innerHTML = `<div class="empty-state">Belum ada backup di Cloud Storage.</div>`; return; }
    const rows = files.map(f=>{
      const path = `${cloudUser.id}/${f.name}`;
      const sizeTxt = f.metadata&&f.metadata.size ? formatUkuranFile(f.metadata.size) : "-";
      const created = f.created_at ? fmtDate(f.created_at.slice(0,10))+" "+f.created_at.slice(11,16) : "-";
      const fname = escapeHtml(f.name);
      return `<tr>
        <td>${fname}</td>
        <td>${created}</td>
        <td>${sizeTxt}</td>
        <td><div class="row-actions">
          <button class="btn btn-sm" onclick="cloudPreviewMetadataByName('${fname}')">Pratinjau</button>
          <button class="btn btn-sm btn-primary" onclick="cloudRestore('${path}','${fname}')">Restore</button>
        </div></td>
      </tr>`;
    }).join("");
    holder.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Nama File</th><th>Tanggal</th><th>Ukuran</th><th style="text-align:right">Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }catch(e){ holder.innerHTML = `<div class="empty-state">Gagal memuat daftar: ${escapeHtml(e.message)}</div>`; }
}
window.cloudRefreshList = cloudRefreshList;

/* ---------- HALAMAN: CLOUD STORAGE (BACKUP & RESTORE) ---------- */
/* DIHAPUS (v2.2): digabung ke halaman "Backup & Sinkron Data".
   Dipertahankan sebagai pengalihan agar tombol lama tidak rusak. */
PAGES.cloudStorage = function(){ setTimeout(()=>navigate("backup"), 30);
  return `<div class="empty-state">${ic("backup",40)}<p>Mengalihkan ke Backup &amp; Sinkron Data...</p></div>`;
};
/* ---------- HALAMAN: RIWAYAT BACKUP CLOUD (LOG AKTIVITAS) ---------- */
/* DIHAPUS (v2.2): riwayat kini menjadi bagian halaman "Backup & Sinkron Data". */
PAGES.riwayatBackup = function(){ setTimeout(()=>navigate("backup"), 30);
  return `<div class="empty-state">${ic("archive",40)}<p>Mengalihkan ke Backup &amp; Sinkron Data...</p></div>`;
};
/* ---------- PENGATURAN ---------- */
PAGES.pengaturan = function(){
  return `
  <div class="section-head"><div><h1>Pengaturan</h1><div class="desc">Keamanan aplikasi, tampilan, dan informasi aplikasi.</div></div></div>
  <div class="grid grid-2">
    <div class="card">
      <h3>${ic("lock",16)} Keamanan (PIN)</h3>
      <div class="field"><label>PIN Baru (4-6 digit)</label><input type="password" id="newPin" inputmode="numeric" maxlength="6" placeholder="${settings.pin? 'PIN aktif - isi untuk mengganti':'Belum ada PIN'}"></div>
      <div class="field"><label>Auto-Lock setelah tidak aktif (menit)</label>
        <select id="autoLockMin">
          ${[1,5,10,15,30,60].map(m=>`<option value="${m}" ${settings.autoLockMin===m?"selected":""}>${m} menit</option>`).join("")}
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="saveSecurity()">${ic("check",15)} Simpan PIN Baru</button>
        <button class="btn btn-danger" onclick="disablePin()">${ic("x",15)} Nonaktifkan PIN</button>
      </div>
    </div>
    <div class="card">
      <h3>${ic("settings",16)} Tampilan</h3>
      <p class="muted">Mode saat ini: <strong>${settings.theme==="dark"?"Gelap":"Terang"}</strong></p>
      <button class="btn" onclick="toggleTheme()">Ganti ke Mode ${settings.theme==="dark"?"Terang":"Gelap"}</button>
    </div>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("backup",16)} Cloud Storage</h3>
    <p class="muted">Status: ${cloudStatusBadge()} &nbsp; ${cloudUser?("&middot; "+escapeHtml(cloudUser.email)):""}</p>
    <button class="btn btn-primary" onclick="navigate('cloudStorage')">${ic("backup",15)} Buka Pengaturan Cloud Storage</button>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("info",16)} Panduan Menyiapkan Supabase Cloud Backup</h3>
    <ol class="hint" style="font-size:12.5px;line-height:1.9;padding-left:18px;">
      <li>Buat akun &amp; project baru di <strong>supabase.com</strong>, pilih region terdekat, tunggu inisialisasi selesai.</li>
      <li>Salin <strong>Project URL</strong> dan <strong>Anon Public Key</strong> dari menu "Project Settings &rarr; API".</li>
      <li>Buka file <code>supabase.js</code> pada folder aplikasi ini, isi <code>SUPABASE_URL</code> dan <code>SUPABASE_ANON_KEY</code> sesuai milik Bapak/Ibu Guru.</li>
      <li>Buat Storage Bucket bernama <code>backups</code> dengan opsi <strong>Private</strong> (bukan Public).</li>
      <li>Jalankan seluruh perintah pada file <code>supabase_setup.sql</code> lewat SQL Editor Supabase (membuat bucket bila belum ada &amp; mengaktifkan Row Level Security beserta policy-nya).</li>
      <li>Jalankan aplikasi ini lewat alamat http/https (GitHub Pages/Netlify/Vercel/server lokal), lalu buka menu Cloud Storage &rarr; "Login / Daftar" untuk membuat akun Email &amp; Password.</li>
      <li>Klik "Backup Cloud" untuk mencadangkan pertama kali, lalu pastikan berkasnya muncul di daftar backup dan pada bucket <code>backups</code> di dashboard Supabase.</li>
      <li>Lihat <code>PANDUAN_SUPABASE.md</code> yang disertakan untuk panduan lengkap langkah demi langkah.</li>
    </ol>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("info",16)} Tentang Aplikasi &amp; Batasan Jujur</h3>
    <p class="hint" style="font-size:12.5px;line-height:1.7;">
      Administrasi Guru berjalan 100% offline, tanpa server maupun instalasi. Beberapa catatan penting:<br><br>
      &bull; <strong>Multi-Kelas:</strong> pemilih "Kelas Aktif" di bagian atas aplikasi menentukan seluruh data yang ditampilkan (siswa, kehadiran, nilai, jurnal, jadwal, dsb). Data setiap kelas disimpan terpisah dan tidak pernah tercampur. Data guru/tendik, profil sekolah, dan kalender pendidikan bersifat sekolah (dipakai bersama semua kelas), sedangkan Wali Kelas diatur per kelas.<br>
      &bull; <strong>Kelas 2-6 dimulai kosong:</strong> hanya Kelas 1 yang memiliki data siswa/guru dari dokumen resmi yang diunggah. Kelas 2-6 sengaja tidak diisi data karangan -- silakan tambah/impor data siswa sendiri lewat menu Data Siswa pada tiap kelas.<br>
      &bull; <strong>Capaian Pembelajaran (CP/ATP/KKTP):</strong> versi bawaan aplikasi hanya berisi kutipan resmi Fase A khusus Kelas 1. Untuk Kelas 2-6, isi CP/ATP/KKTP perlu ditambahkan sendiri lewat menu masing-masing karena dokumen sumber Fase B/C/D/E/F belum tersedia di aplikasi ini.<br>
      &bull; <strong>Naik Kelas / Pindah Kelas:</strong> memindahkan data siswa ke kelas tujuan dan mengosongkan roster kelas asal untuk tahun ajaran berikutnya. Data akademik (nilai, kehadiran, jurnal, dst.) kelas asal TETAP tersimpan sebagai arsip, tidak terhapus.<br>
      &bull; <strong>Penyimpanan:</strong> menggunakan localStorage pada browser perangkat ini. Data tidak tersinkron otomatis ke perangkat lain -- gunakan menu Backup &amp; Restore (Lokal atau Cloud Storage) untuk memindahkan data; backup selalu mencakup Kelas 1-6 sekaligus.<br>
      &bull; <strong>Backup Cloud (Supabase):</strong> fitur opsional yang butuh internet, project Supabase milik sendiri, dan hosting non-file:// (lihat panduan di atas). Tanpa itu, aplikasi tetap 100% offline seperti biasa.<br>
      &bull; <strong>Ekspor Word (.doc) &amp; Excel (.xls):</strong> dibuat dengan format HTML yang dibaca native oleh Microsoft Word/Excel tanpa pustaka eksternal. Berkas akan terbuka dengan baik walau ikon file menunjukkan format lama (.doc/.xls, bukan .docx/.xlsx). Nama file otomatis menyertakan kelas aktif (mis. "..._Kelas-3").<br>
      &bull; <strong>Ekspor PDF:</strong> memakai dialog cetak bawaan browser (pilih "Simpan sebagai PDF").<br>
      &bull; <strong>Tulisan tangan ke teks (OCR):</strong> tidak tersedia offline murni HTML/JS; catatan tangan disimpan sebagai gambar.<br>
      &bull; <strong>Keamanan PIN:</strong> untuk mencegah akses tidak sengaja di perangkat bersama, bukan enkripsi tingkat industri.
    </p>
  </div>`;
};
function saveSecurity(){
  const pin = document.getElementById("newPin").value.trim();
  const autoLockMin = Number(document.getElementById("autoLockMin").value);
  if(!pin){ toast("Isi PIN baru terlebih dahulu, atau gunakan tombol Nonaktifkan PIN."); return; }
  if(pin.length<4 || pin.length>6 || !/^\d+$/.test(pin)){ toast("PIN harus 4-6 digit angka."); return; }
  settings.pin = pin;
  settings.autoLockMin = autoLockMin;
  saveSettings(); toast("PIN berhasil disimpan."); renderPage("pengaturan");
}
function disablePin(){
  settings.pin = ""; saveSettings(); toast("PIN dinonaktifkan."); renderPage("pengaturan");
}

