/* ================================================================
   FILE: assets/js/62-dropbox.js
   INTEGRASI DROPBOX — Backup database & simpan dokumen (OAuth2 PKCE)
   ---------------------------------------------------------------
   - Berjalan murni dari browser (tanpa server), cocok untuk GitHub Pages.
   - App Key bersifat publik menurut desain OAuth PKCE; token akses hanya
     tersimpan di localStorage perangkat pengguna (tidak dikirim ke mana pun
     selain api.dropboxapi.com).
   - Redirect URI HARUS sama persis dengan yang didaftarkan di Dropbox App
     Console: https://anggerukmo01-eng.github.io/AdminGuru/
   - Alur: Hubungkan Dropbox -> (popup login Dropbox) -> kembali ke aplikasi
     -> Backup / Restore / Simpan dokumen.
   ================================================================ */
const DBX_APP_KEY = "7ejz2arqbenwarq";
const DBX_REDIRECT_URI = "https://anggerukmo01-eng.github.io/AdminGuru/";
const DBX_TOKEN_KEY = "tpsd2026_dbx_token_v1";
const DBX_VERIFIER_SS = "tpsd2026_dbx_verifier";
const DBX_BACKUP_DIR = "/backup";
const DBX_DOC_DIR = "/dokumen";

/* ---------- Token ---------- */
function dbxGetToken(){ try{ const r=localStorage.getItem(DBX_TOKEN_KEY); return r?JSON.parse(r):null; }catch(e){ return null; } }
function dbxSetToken(t){ try{ localStorage.setItem(DBX_TOKEN_KEY, JSON.stringify(t)); }catch(e){} }
function dbxClearToken(){ try{ localStorage.removeItem(DBX_TOKEN_KEY); }catch(e){} }
function dbxIsConnected(){ const t=dbxGetToken(); return !!(t && t.access_token); }

/* ---------- OAuth2 PKCE ---------- */
function dbxRandStr(n){
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  return Array.from(a, x=>("0"+x.toString(16)).slice(-2)).join("").slice(0,n);
}
async function dbxChallenge(verifier){
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const b = btoa(String.fromCharCode.apply(null, new Uint8Array(d)));
  return b.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function dbxLogin(){
  try{
    const verifier = dbxRandStr(64);
    const challenge = await dbxChallenge(verifier);
    sessionStorage.setItem(DBX_VERIFIER_SS, verifier);
    const u = new URL("https://www.dropbox.com/oauth2/authorize");
    u.searchParams.set("client_id", DBX_APP_KEY);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("code_challenge", challenge);
    u.searchParams.set("code_challenge_method", "S256");
    u.searchParams.set("token_access_type", "offline");
    u.searchParams.set("redirect_uri", DBX_REDIRECT_URI);
    location.href = u.toString();
  }catch(e){ toast("Gagal memulai login Dropbox: "+e.message); }
}
/* Dipanggil saat aplikasi dimuat — menukar ?code= menjadi token. */
async function dbxHandleRedirect(){
  let code = null;
  try{ code = new URL(location.href).searchParams.get("code"); }catch(e){}
  if(!code) return;
  const verifier = sessionStorage.getItem(DBX_VERIFIER_SS) || "";
  try{
    const body = new URLSearchParams({grant_type:"authorization_code", code:code, code_verifier:verifier, client_id:DBX_APP_KEY, redirect_uri:DBX_REDIRECT_URI});
    const res = await fetch("https://api.dropboxapi.com/oauth2/token", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:body.toString()});
    const j = await res.json().catch(()=>({}));
    if(!res.ok || !j.access_token) throw new Error(j.error_description || j.error || ("HTTP "+res.status));
    dbxSetToken({access_token:j.access_token, refresh_token:j.refresh_token||"", expires_at:Date.now()+(Number(j.expires_in)||14400)*1000});
    toast("Dropbox terhubung. Selamat!");
    if(typeof navigate==="function") navigate("backup");
  }catch(e){ toast("Gagal menghubungkan Dropbox: "+e.message); }
  finally{
    try{ sessionStorage.removeItem(DBX_VERIFIER_SS); }catch(e){}
    try{ history.replaceState(null, "", location.pathname+location.hash); }catch(e){}
  }
}
async function dbxRefreshToken(){
  const t = dbxGetToken();
  if(!t || !t.refresh_token) return null;
  try{
    const body = new URLSearchParams({grant_type:"refresh_token", refresh_token:t.refresh_token, client_id:DBX_APP_KEY});
    const res = await fetch("https://api.dropboxapi.com/oauth2/token", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:body.toString()});
    const j = await res.json().catch(()=>({}));
    if(!res.ok || !j.access_token) return null;
    const nt = {access_token:j.access_token, refresh_token:j.refresh_token||t.refresh_token, expires_at:Date.now()+(Number(j.expires_in)||14400)*1000};
    dbxSetToken(nt);
    return nt.access_token;
  }catch(e){ return null; }
}
async function dbxAccessToken(){
  const t = dbxGetToken();
  if(!t || !t.access_token) return null;
  if(t.expires_at && Date.now() > t.expires_at - 60000){
    return await dbxRefreshToken();
  }
  return t.access_token;
}

/* ---------- Pembungkus API Dropbox ---------- */
async function dbxApi(path, argObj, opts){
  opts = opts||{};
  const token = await dbxAccessToken();
  if(!token) throw new Error("Dropbox belum terhubung. Buka menu Backup & Sinkron Data untuk menghubungkan.");
  const headers = {"Authorization":"Bearer "+token};
  let url, body;
  if(opts.content){
    url = "https://content.dropboxapi.com/2/"+path;
    headers["Dropbox-API-Arg"] = JSON.stringify(argObj||{});
    headers["Content-Type"] = "application/octet-stream";
    body = opts.octet;
  }else{
    url = "https://api.dropboxapi.com/2/"+path;
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(argObj||{});
  }
  const res = await fetch(url, {method:"POST", headers:headers, body:body});
  if(res.status===401){ dbxClearToken(); throw new Error("Sesi Dropbox berakhir. Silakan hubungkan ulang."); }
  if(opts.download){
    if(!res.ok){ const j=await res.json().catch(()=>null); throw new Error((j&&j.error_summary)||("Dropbox error "+res.status)); }
    return await res.text();
  }
  const j = await res.json().catch(()=>null);
  if(!res.ok) throw new Error((j&&j.error_summary)||("Dropbox error "+res.status));
  return j;
}
async function dbxUpload(path, blob){
  const buf = await blob.arrayBuffer();
  return await dbxApi("files/upload", {path:path, mode:"add", autorename:true, mute:false}, {content:true, octet:buf});
}
async function dbxListFolder(path){
  try{
    const j = await dbxApi("files/list_folder", {path:path, recursive:false, limit:200});
    return (j.entries||[]).filter(e=>e[".tag"]==="file");
  }catch(e){
    if(String(e.message).indexOf("not_found")>=0) return [];
    throw e;
  }
}

/* ---------- Backup ---------- */
function dbxTimestampName(){
  const d=new Date(), p=n=>String(n).padStart(2,"0");
  return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"-"+p(d.getHours())+p(d.getMinutes());
}
function dbxBuildMeta(){
  let namaSekolah="", namaGuru="", kelasAktif="";
  try{
    namaSekolah = (db.sekolah&&db.sekolah.namaSekolah)||"";
    namaGuru = (db.sekolah&&db.sekolah.namaGuru)||"";
    kelasAktif = (typeof classInfo==="function" && typeof activeClassId!=="undefined" ? (classInfo(activeClassId)||{}).label : "")||"";
  }catch(e){}
  return {waktuBackup:new Date().toISOString(), versiAplikasi:"2026.2-multikelas", namaSekolah:namaSekolah, namaGuru:namaGuru, kelasAktif:kelasAktif, device:navigator.userAgent||""};
}
async function dbxBackupNow(){
  if(!dbxIsConnected()){ toast("Hubungkan Dropbox terlebih dahulu."); return; }
  toast("Mengunggah backup ke Dropbox...");
  try{
    const payload = collectFullBackupPayload();
    payload._dbxMeta = dbxBuildMeta();
    const name = "adminguru-"+dbxTimestampName()+".json";
    const r = await dbxUpload(DBX_BACKUP_DIR+"/"+name, new Blob([JSON.stringify(payload)], {type:"application/json"}));
    toast("Backup ke Dropbox berhasil: "+(r.name||name));
    dbxRefreshList();
  }catch(e){ toast("Backup Dropbox gagal: "+e.message); }
}
async function dbxRefreshList(){
  const holder = document.getElementById("dbxListHolder");
  if(!holder) return;
  if(!dbxIsConnected()){ holder.innerHTML = `<p class="muted">Hubungkan Dropbox untuk melihat daftar backup.</p>`; return; }
  holder.innerHTML = `<p class="muted">Memuat daftar backup...</p>`;
  try{
    const files = await dbxListFolder(DBX_BACKUP_DIR);
    files.sort((a,b)=>String(b.client_modified||"").localeCompare(String(a.client_modified||"")));
    if(!files.length){ holder.innerHTML = `<p class="muted">Belum ada backup di Dropbox.</p>`; return; }
    holder.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Nama File</th><th>Waktu</th><th>Ukuran</th><th></th></tr></thead><tbody>`
      + files.map(f=>{
          const pl = (f.path_lower||"").replace(/'/g,"");
          const nm = (f.name||"").replace(/'/g,"");
          return `<tr><td>${escapeHtml(f.name)}</td><td>${escapeHtml(String(f.client_modified||"").slice(0,16).replace("T"," "))}</td><td>${formatUkuranFile(f.size)}</td>`
          + `<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="dbxPreviewMeta('${pl}','${escapeHtml(nm)}')">${ic("search",13)} Pratinjau</button> `
          + `<button class="btn btn-sm btn-primary" onclick="dbxRestore('${pl}','${escapeHtml(nm)}')">${ic("check",13)} Restore</button></td></tr>`;
        }).join("")
      + `</tbody></table></div>`;
  }catch(e){ holder.innerHTML = `<p class="muted">Gagal memuat daftar: ${escapeHtml(e.message)}</p>`; }
}
function dbxPreviewMeta(pathLower, filename){
  openModal({title:"Pratinjau Backup: "+filename, bodyHtml:`<p class="muted">Memuat...</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Tutup</button><button class="btn btn-primary" onclick="closeModal();dbxRestore('${pathLower}','${filename}')">${ic("check",15)} Restore Berkas Ini</button>`});
  dbxApi("files/download", {path:pathLower}, {content:true, download:true}).then(text=>{
    let meta={}; try{ meta=JSON.parse(text)._dbxMeta||{}; }catch(e){}
    document.getElementById("modalBody").innerHTML = `<table><tbody>
      <tr><td style="width:150px;"><strong>Waktu Backup</strong></td><td>: ${meta.waktuBackup?fmtDate(meta.waktuBackup.slice(0,10))+" "+meta.waktuBackup.slice(11,16):"-"}</td></tr>
      <tr><td><strong>Versi Aplikasi</strong></td><td>: ${escapeHtml(meta.versiAplikasi||"-")}</td></tr>
      <tr><td><strong>Nama Sekolah</strong></td><td>: ${escapeHtml(meta.namaSekolah||"-")}</td></tr>
      <tr><td><strong>Nama Guru</strong></td><td>: ${escapeHtml(meta.namaGuru||"-")}</td></tr>
      <tr><td><strong>Kelas Aktif</strong></td><td>: ${escapeHtml(meta.kelasAktif||"-")}</td></tr>
      </tbody></table>`;
  }).catch(e=>{ document.getElementById("modalBody").innerHTML = `<p><span class="badge badge-red">Gagal</span></p><p class="hint">${escapeHtml(e.message)}</p>`; });
}
function dbxRestore(pathLower, filename){
  confirmDialog(`Pulihkan data dari "${filename}" di Dropbox? Data saat ini akan DITIMPA (cadangan lokal otomatis diunduh dulu), lalu aplikasi dimuat ulang.`, async ()=>{
    try{
      backupData();
      const text = await dbxApi("files/download", {path:pathLower}, {content:true, download:true});
      const parsed = JSON.parse(text);
      if(!(parsed && (parsed.classes||parsed.db))) throw new Error("Struktur berkas backup tidak valid.");
      applyFullBackupPayload(parsed);
      toast("Restore dari Dropbox berhasil. Memuat ulang...");
      setTimeout(()=>location.reload(), 800);
    }catch(e){ toast("Restore gagal: "+e.message); }
  });
}
async function dbxLogout(){
  const t = dbxGetToken();
  try{
    if(t && t.access_token){
      await fetch("https://api.dropboxapi.com/oauth2/token/revoke", {method:"POST", headers:{"Authorization":"Bearer "+t.access_token}});
    }
  }catch(e){}
  dbxClearToken();
  toast("Dropbox diputus.");
  if(typeof renderPage==="function") renderPage("backup"); else location.reload();
}
async function dbxRefreshAccount(){
  const el = document.getElementById("dbxAccountText");
  if(!el) return;
  if(!dbxIsConnected()){ el.textContent = "-"; return; }
  try{
    const j = await dbxApi("users/get_current_account", {});
    el.textContent = j.email || ((j.name&&j.name.display_name)||"-");
  }catch(e){ el.textContent = "-"; }
}

/* ---------- Simpan dokumen hasil AI ke Dropbox ---------- */
async function dbxSaveDoc(filename, contentStr, mimeType){
  if(!dbxIsConnected()){ toast("Hubungkan Dropbox dulu di menu Backup & Sinkron Data."); return; }
  try{
    const r = await dbxUpload(DBX_DOC_DIR+"/"+filename, new Blob(["\ufeff", contentStr], {type:mimeType||"application/msword"}));
    toast("Tersimpan di Dropbox: "+(r.name||filename));
  }catch(e){ toast("Gagal menyimpan ke Dropbox: "+e.message); }
}
function dbxSaveAiDoc(docType, saveId, title){
  const el = document.getElementById(saveId);
  const html = el ? el.innerHTML : "";
  const safe = (title||"dokumen").replace(/[^\w\-]+/g,"_")+".doc";
  const doc = (docType==="Bank Soal"||docType==="Asesmen Formatif") ? aiBuildWordSoalDoc(html, title) : aiBuildWordDoc(html, title);
  dbxSaveDoc(safe, doc, "application/msword");
}

/* Tangani kembalian OAuth saat aplikasi dimuat. */
dbxHandleRedirect();
