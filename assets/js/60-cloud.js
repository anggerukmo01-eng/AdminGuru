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
      <p class="hint" id="cloudAuthHint">Masuk memakai akun Supabase (Email &amp; Password) yang sudah didaftarkan. Akun baru wajib diklik tautan verifikasi di email sebelum bisa masuk.</p>
      <div id="cloudAuthError" style="display:none;" class="alert alert-danger"></div>
      <div style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap;">
        <button class="btn btn-sm" onclick="cloudResendVerification()">Kirim ulang email verifikasi</button>
        <button class="btn btn-sm" onclick="cloudForgotPassword()">Lupa password?</button>
      </div>
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
function cloudAuthErrMsg(e){
  const m = String((e && e.message) || e || "");
  if(/invalid login credentials/i.test(m)) return "Email atau password salah. Periksa kembali, atau bila belum punya akun klik tab \"Daftar Baru\".";
  if(/email not confirmed/i.test(m)) return "Email belum diverifikasi. Cek kotak masuk / folder spam pada email Anda, klik tautan verifikasi dari Supabase, lalu masuk lagi di sini.";
  if(/user already registered/i.test(m)) return "Email ini sudah terdaftar. Silakan masuk lewat tab \"Masuk\".";
  if(/password should be at least/i.test(m)) return "Password terlalu pendek (minimal 6 karakter).";
  if(/failed to fetch|network/i.test(m)) return "Tidak dapat menjangkau server Supabase. Periksa koneksi internet Anda.";
  if(/invalid email/i.test(m)) return "Format email tidak valid.";
  return m;
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
    const errEl = document.getElementById("cloudAuthError");
    if(errEl){ errEl.style.display = "block"; errEl.textContent = cloudAuthErrMsg(e); }
    toast("Gagal: "+cloudAuthErrMsg(e));
  }finally{ btn.disabled = false; }
}
async function cloudResendVerification(){
  const client = cloudClient(); if(!client) return;
  const email = (document.getElementById("cloudAuthEmail").value||"").trim();
  if(!email){ toast("Isi email terlebih dahulu pada kolom di atas."); return; }
  try{
    const {error} = await client.auth.resend({type:"signup", email});
    if(error) throw error;
    cloudLog("Verifikasi Email","Berhasil",email);
    toast("Email verifikasi dikirim ulang. Cek kotak masuk / folder spam, lalu klik tautannya.");
  }catch(e){
    cloudLog("Verifikasi Email","Gagal",e.message);
    toast("Gagal: "+cloudAuthErrMsg(e));
  }
}
async function cloudForgotPassword(){
  const client = cloudClient(); if(!client) return;
  const email = (document.getElementById("cloudAuthEmail").value||"").trim();
  if(!email){ toast("Isi email terlebih dahulu pada kolom di atas."); return; }
  try{
    const {error} = await client.auth.resetPasswordForEmail(email);
    if(error) throw error;
    cloudLog("Lupa Password","Berhasil",email);
    toast("Tautan atur ulang password dikirim ke email. Buka dari perangkat ini, lalu ikuti langkahnya.");
  }catch(e){
    cloudLog("Lupa Password","Gagal",e.message);
    toast("Gagal: "+cloudAuthErrMsg(e));
  }
}
/* Menangani tautan pemulihan dari email (…#type=recovery…): tampilkan form password baru.
   Dipanggil saat boot; hanya aktif bila URL mengandung type=recovery. */
function cloudHandleRecoveryLink(){
  const client = cloudClient(); if(!client) return;
  if((window.location.hash||"").indexOf("type=recovery")===-1) return;
  let tries = 0;
  const iv = setInterval(async ()=>{
    tries++;
    let sess = null;
    try{ const r = await client.auth.getSession(); sess = r.data && r.data.session; }catch(e){}
    const btn = document.getElementById("cloudRecSubmit");
    if(sess){
      clearInterval(iv);
      // Tautan recovery = bukti kepemilikan email; tampilkan di atas lock screen.
      const lock = document.getElementById("lockScreen"); if(lock) lock.classList.add("hidden");
      const app = document.getElementById("app"); if(app) app.classList.add("ready");
      openModal({
        title:"Buat Password Baru",
        bodyHtml:`
          <p class="hint">Tautan pemulihan valid untuk <strong>${escapeHtml(sess.user.email||"")}</strong>. Silakan buat password baru.</p>
          <div class="field"><label>Password Baru (min. 6 karakter)</label><input type="password" id="cloudNewPass1" autocomplete="new-password"></div>
          <div class="field"><label>Ulangi Password Baru</label><input type="password" id="cloudNewPass2" autocomplete="new-password"></div>
          <div id="cloudRecError" style="display:none;" class="alert alert-danger"></div>`,
        footHtml:`<button class="btn btn-primary" id="cloudRecSubmit">${ic("check",15)} Simpan Password Baru</button>`
      });
      document.getElementById("cloudRecSubmit").onclick = async ()=>{
        const p1 = document.getElementById("cloudNewPass1").value||"";
        const p2 = document.getElementById("cloudNewPass2").value||"";
        const errEl = document.getElementById("cloudRecError");
        const showErr = m=>{ errEl.style.display="block"; errEl.textContent=m; };
        if(p1.length<6){ showErr("Password minimal 6 karakter."); return; }
        if(p1!==p2){ showErr("Konfirmasi password tidak sama."); return; }
        try{
          const {error} = await client.auth.updateUser({password:p1});
          if(error) throw error;
          closeModal();
          try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){}
          cloudLog("Atur Ulang Password","Berhasil",sess.user.email||"");
          toast("Password baru tersimpan. Silakan masuk dengan password baru.");
          cloudUser = {id:sess.user.id, email:sess.user.email};
          settings.cloud.email = cloudUser.email; saveSettings();
          renderPage(currentPage);
        }catch(e){ showErr(cloudAuthErrMsg(e)); }
      };
    } else if(tries>=25){
      clearInterval(iv);
      toast("Tautan pemulihan tidak valid atau kedaluwarsa. Minta tautan baru lewat 'Lupa password?'.");
      try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){}
    }
  }, 200);
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
      <div class="field" style="margin-top:14px;"><label>Mode Tampilan Layar</label>
        <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;cursor:pointer;"><input type="radio" name="displayMode" value="auto" style="width:auto;margin-top:2px;" ${(settings.displayMode||"auto")==="auto"?"checked":""} onchange="setDisplayMode('auto')"> <span><strong>Otomatis</strong> — layar kecil tampil ringkas, tablet tampil penuh (disarankan).</span></label>
        <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;cursor:pointer;margin-top:6px;"><input type="radio" name="displayMode" value="tablet" style="width:auto;margin-top:2px;" ${settings.displayMode==="tablet"?"checked":""} onchange="setDisplayMode('tablet')"> <span><strong>Tablet</strong> — selalu tampilan penuh seperti sekarang.</span></label>
        <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;cursor:pointer;margin-top:6px;"><input type="radio" name="displayMode" value="kecil" style="width:auto;margin-top:2px;" ${settings.displayMode==="kecil"?"checked":""} onchange="setDisplayMode('kecil')"> <span><strong>Layar Kecil</strong> — selalu tampilan ringkas (navigasi bawah, satu kolom).</span></label>
      </div>
    </div>
    <div class="card">
      <h3>${ic("student",16)} Kelas Bawaan</h3>
      <div class="field"><label>Kelas bawaan saat masuk</label>
        <select id="defaultClassId" onchange="saveDefaultClass(this.value)">
          <option value="" ${!settings.defaultClassId?"selected":""}>Ikuti kelas terakhir dipakai</option>
          ${CLASS_LIST.map(c=>`<option value="${c.id}" ${settings.defaultClassId===c.id?"selected":""}>${c.label}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="card">
      <h3>${ic("check",16)} Suara</h3>
      <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;cursor:pointer;"><input type="checkbox" id="bunyiSukses" style="width:auto;margin-top:2px;" ${settings.bunyiSukses?"checked":""}> Mainkan melodi sukses (C5-E5-G5-C6) saat menyimpan jurnal &amp; nilai massal.</label>
      <div style="margin-top:10px;"><button class="btn btn-primary" onclick="saveSuara()">${ic("check",15)} Simpan Pengaturan Suara</button></div>
    </div>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("backup",16)} Cloud Storage</h3>
    <p class="muted">Status: ${cloudStatusBadge()} &nbsp; ${cloudUser?("&middot; "+escapeHtml(cloudUser.email)):""}</p>
    <button class="btn btn-primary" onclick="navigate('backup')">${ic("backup",15)} Buka Backup &amp; Sinkron Data</button>
  </div>
  <p class="muted" style="text-align:center;margin:20px 0 4px;font-size:11.5px;">AdminGuru v${APP_VERSION}</p>`;
};
function saveSuara(){
  settings.bunyiSukses = !!document.getElementById("bunyiSukses").checked;
  saveSettings(); toast(settings.bunyiSukses ? "Melodi sukses diaktifkan." : "Melodi sukses dinonaktifkan."); renderPage("pengaturan");
}
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
function saveDefaultClass(value){
  settings.defaultClassId = CLASS_LIST.some(c=>c.id===value) ? value : "";
  saveSettings();
  toast("Kelas bawaan disimpan: "+(settings.defaultClassId ? classInfo(settings.defaultClassId).label : "Ikuti kelas terakhir"));
}

