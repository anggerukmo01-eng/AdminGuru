/* ============================================================
   FILE: assets/js/46-catatan-guru.js
   Buku Catatan Guru (6 Nov 2026, perintah Anggi)
   Catatan khusus guru: rapat, refleksi, ide, tugas — dengan
   kanvas tulisan tangan untuk stylus (Mi Pad 7 Pro) dan
   pengenalan tulisan tangan bila perangkat menyediakannya.
   - Penyimpanan: localStorage sendiri (tpsd2026_catatan_guru_v1),
     IKUT dalam backup penuh (collect/applyFullBackupPayload).
   - Kanvas: Pointer Events, stylus (pen) + pressure, palm
     rejection (sentuhan diabaikan saat stylus aktif), mode
     "hanya stylus", penghapus per coretan, urungkan, latar
     polos/bergaris/kotak. Coretan tersimpan sebagai vektor.
   - Pengenalan tulisan: Handwriting Recognition API
     (navigator.createHandwritingRecognizer, bahasa id+en) —
     progressive enhancement: bila API tidak tersedia di WebView
     perangkat, tombol memberi tahu dan tinta tetap tersimpan
     sebagai coretan (tetap bisa dibaca/dicetak). Bidang teks
     juga menerima keyboard tulisan tangan sistem (Gboard).
   ============================================================ */
const CG_KEY = "tpsd2026_catatan_guru_v1";
const CG_KATEGORI = ["Rapat", "Refleksi", "Ide", "Tugas", "Lainnya"];
const CG_WARNA = ["#111827", "#1d4ed8", "#b91c1c", "#15803d"];
const CG_WARNA_NAMA = ["Hitam", "Biru", "Merah", "Hijau"];
const CG_LEBAR = [2, 4, 7];
const CG_LEBAR_NAMA = ["Tipis", "Sedang", "Tebal"];
const CG_KANVAS_W = 1000, CG_KANVAS_H = 620;

/* ---------- Penyimpanan ---------- */
function loadCatatanGuru(){
  try{ const a = JSON.parse(localStorage.getItem(CG_KEY) || "[]"); return Array.isArray(a) ? a : []; }
  catch(e){ return []; }
}
function saveCatatanGuru(arr){
  try{ localStorage.setItem(CG_KEY, JSON.stringify(arr || [])); }
  catch(e){ toast("Catatan gagal disimpan (penyimpanan penuh?)."); }
}
function cgCatatanBaru(){
  return { id: uid("cg"), judul: "", kategori: "Rapat", tanggal: todayISO(),
    isi: "", tinta: [], latar: "garis", pinned: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
/* Sisipkan/perbarui satu catatan (murni, dapat diuji). */
function cgUpsertCatatan(arr, note){
  const out = (arr || []).slice();
  const simpan = Object.assign({}, note, { updatedAt: new Date().toISOString() });
  const i = out.findIndex(x => x.id === note.id);
  if(i >= 0) out[i] = simpan; else out.push(simpan);
  return out;
}
/* Saring daftar (murni, dapat diuji). */
function cgCariCatatan(arr, q, kat){
  const s = String(q || "").trim().toLowerCase();
  return (arr || []).filter(n => {
    if(kat && n.kategori !== kat) return false;
    if(!s) return true;
    return String(n.judul || "").toLowerCase().includes(s) ||
      String(n.isi || "").toLowerCase().includes(s);
  });
}
/* Urutan: disematkan dulu, lalu terbaru (murni, dapat diuji). */
function cgUrutCatatan(arr){
  return (arr || []).slice().sort((a, b) => {
    const pa = a.pinned ? 1 : 0, pb = b.pinned ? 1 : 0;
    if(pb !== pa) return pb - pa;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}
function cgTemplateRapat(tanggal){
  const tgl = tanggal || todayISO();
  return "RAPAT — " + tgl + "\nTempat: \nPeserta: \nAgenda: \n\nPembahasan:\n- \n\nKeputusan:\n- \n\nTindak lanjut:\n- ";
}

/* ---------- Pengenalan tulisan tangan ---------- */
function cgDukunganTulisan(){
  try{
    if(typeof navigator !== "undefined" && typeof navigator.createHandwritingRecognizer === "function")
      return { tersedia: true, alasan: "" };
  }catch(e){}
  return { tersedia: false, alasan: "Perangkat ini belum menyediakan pengenalan tulisan tangan di WebView." };
}
/* Kelompokkan coretan per baris (tengah vertikal) supaya pengenalan
   dilakukan per baris dan hasilnya berbaris rapi (murni, dapat diuji). */
function cgKelompokBaris(tinta){
  const garis = [];
  (tinta || []).forEach(st => {
    if(!st.p || !st.p.length) return;
    const ys = st.p.map(q => q[1]);
    const tengah = ys.reduce((a, b) => a + b, 0) / ys.length;
    let g = garis.find(x => Math.abs(x.tengah - tengah) < 34);
    if(!g){ g = { tengah: tengah, coretan: [] }; garis.push(g); }
    g.coretan.push(st);
    g.tengah = (g.tengah * (g.coretan.length - 1) + tengah) / g.coretan.length;
  });
  return garis.sort((a, b) => a.tengah - b.tengah).map(g => g.coretan);
}
function cgCoretanKeGambar(coretan){
  return { strokes: coretan.map(st => ({ points: st.p.map(q => ({ x: q[0], y: q[1] })) })) };
}
async function cgKenaliTulisan(tinta){
  const duk = cgDukunganTulisan();
  if(!duk.tersedia) throw new Error(duk.alasan);
  const baris = cgKelompokBaris(tinta);
  if(!baris.length) throw new Error("Belum ada coretan di kanvas.");
  const rec = await navigator.createHandwritingRecognizer({ languages: ["id", "en"] });
  const kenali = rec.startRecognition ? rec.startRecognition.bind(rec)
    : (rec.recognize ? rec.recognize.bind(rec) : null);
  if(!kenali) throw new Error("API pengenalan di perangkat ini tidak dikenali.");
  const hasil = [];
  try{
    for(const b of baris){
      const batas = new Promise((_, tolak) => setTimeout(() => tolak(new Error("Pengenalan terlalu lama.")), 20000));
      const r = await Promise.race([kenali(cgCoretanKeGambar(b)), batas]);
      const pred = Array.isArray(r) ? r[0] : r;
      const teks = pred && (pred.text || (pred.alternatives && pred.alternatives[0] && pred.alternatives[0].text) || "");
      if(teks) hasil.push(String(teks).trim());
    }
  }finally{
    try{ if(rec.finishSession) rec.finishSession(); }catch(e){}
  }
  if(!hasil.length) throw new Error("Tulisan tidak dikenali — coba tulis lebih jelas.");
  return hasil.join("\n");
}

/* ---------- Halaman: daftar ---------- */
PAGES.catatanGuru = function(){
  const id = window._cgEditorId || null;
  if(id) return cgEditorHtml(id);
  return cgDaftarHtml();
};
function cgDaftarHtml(){
  const q = window._cgQ || "", kat = window._cgKat || "";
  const opts = ["", ...CG_KATEGORI].map(k =>
    `<option value="${escapeHtml(k)}" ${k === kat ? "selected" : ""}>${k ? escapeHtml(k) : "Semua kategori"}</option>`).join("");
  return `<div class="section-head"><div><h1>Buku Catatan Guru</h1><div class="desc">Catatan khusus guru: rapat, refleksi, ide, dan tugas. Tersimpan di perangkat ini dan ikut dalam backup penuh.</div></div>
    <div class="grow"></div><button class="btn btn-primary" onclick="cgBukaBaru()">${ic("edit",15)} Catatan baru</button></div>
  <div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap;">
    <input id="cgQ" placeholder="Cari judul / isi..." value="${escapeHtml(q)}" oninput="window._cgQ=this.value; cgRefreshList();" style="flex:1;min-width:180px;">
    <select id="cgKat" onchange="window._cgKat=this.value; cgRefreshList();">${opts}</select>
  </div><div id="cgListHolder" style="margin-top:12px;">${cgListInner()}</div></div>`;
}
function cgListInner(){
  const semua = cgUrutCatatan(loadCatatanGuru());
  const tampil = cgCariCatatan(semua, window._cgQ || "", window._cgKat || "");
  if(!tampil.length)
    return `<p class="muted">Belum ada catatan${(window._cgQ || window._cgKat) ? " yang cocok" : ""}. Klik "Catatan baru" untuk mulai menulis.</p>`;
  return tampil.map(n => {
    const cuplikan = (n.isi || "").trim().slice(0, 120) ||
      ((n.tinta && n.tinta.length) ? "✍️ Hanya tulisan tangan" : "—");
    return `<div class="card" style="margin-bottom:10px;">
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <button class="iconbtn" title="${n.pinned ? "Lepas pin" : "Sematkan"}" onclick="cgTogglePin('${n.id}')">${n.pinned ? "📌" : "📍"}</button>
        <div style="flex:1;min-width:0;">
          <strong>${escapeHtml(n.judul || "(Tanpa judul)")}</strong>
          <span class="badge">${escapeHtml(n.kategori || "Lainnya")}</span>
          <span class="muted" style="font-size:12px;">${escapeHtml(n.tanggal || "")}${(n.tinta && n.tinta.length) ? " · ✍️ " + n.tinta.length + " coretan" : ""}</span>
          <div class="muted" style="font-size:12.5px;margin-top:4px;">${escapeHtml(cuplikan)}</div>
        </div>
        <button class="btn btn-sm" onclick="cgBuka('${n.id}')">Buka</button>
        <button class="btn btn-sm btn-danger" onclick="cgHapus('${n.id}')">Hapus</button>
      </div></div>`;
  }).join("");
}
function cgRefreshList(){
  const h = document.getElementById("cgListHolder");
  if(h) h.innerHTML = cgListInner();
}

/* ---------- Halaman: editor ---------- */
function cgEditorHtml(id){
  const d = window._cgDraft;
  if(!d || d.id !== id) return "<p>Halaman tidak ditemukan.</p>";
  const katOpts = CG_KATEGORI.map(k =>
    `<option value="${escapeHtml(k)}" ${k === d.kategori ? "selected" : ""}>${escapeHtml(k)}</option>`).join("");
  const latarOpts = [["polos", "Polos"], ["garis", "Bergaris"], ["kotak", "Kotak"]].map(x =>
    `<option value="${x[0]}" ${x[0] === d.latar ? "selected" : ""}>${x[1]}</option>`).join("");
  const warnaBtn = CG_WARNA.map((w, i) =>
    `<button class="btn btn-sm" id="cgWarna${i}" style="background:${w};color:#fff;" onclick="cgAturWarna('${w}')">${CG_WARNA_NAMA[i]}</button>`).join("");
  const lebarBtn = CG_LEBAR.map((w, i) =>
    `<button class="btn btn-sm" id="cgLebar${i}" onclick="cgAturLebar(${w})">${CG_LEBAR_NAMA[i]}</button>`).join("");
  setTimeout(cgPasangKanvas, 0);
  return `<div class="section-head"><div><h1>${window._cgBaru ? "Catatan baru" : "Ubah catatan"}</h1>
    <div class="desc">Tulis dengan ketikan atau langsung dengan stylus di kanvas. Simpan dulu sebelum pindah menu.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="cgKembali()">← Daftar</button>
    <button class="btn btn-primary" onclick="cgSimpan()">${ic("check",15)} Simpan</button></div>
  <div class="card">
    <div class="field"><label>Judul</label><input id="cgJudul" value="${escapeHtml(d.judul || "")}" placeholder="mis. Rapat KKG 6 November 2026"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <div class="field" style="flex:1;min-width:140px;"><label>Kategori</label><select id="cgKat">${katOpts}</select></div>
      <div class="field" style="flex:1;min-width:140px;"><label>Tanggal</label><input id="cgTanggal" type="date" value="${escapeHtml(d.tanggal || "")}"></div>
    </div>
    <div class="field"><label>Isi catatan (ketik)</label>
      <textarea id="cgIsi" rows="6" placeholder="Ketik di sini — atau tulis tangan di kanvas lalu tekan 'Ubah jadi teks'. Keyboard tulisan tangan sistem (mis. Gboard) juga bisa dipakai di kolom ini.">${escapeHtml(d.isi || "")}</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
      <button class="btn btn-sm" onclick="cgTemplate()">Template rapat</button>
      <button class="btn btn-sm" onclick="cgSisipWaktu()">＋ Waktu sekarang</button>
      <button class="btn btn-sm" id="cgBtnKenali" onclick="cgUbahJadiTeks()">✍️ Ubah jadi teks</button>
      <button class="btn btn-sm" onclick="cgCetak()">Cetak</button>
    </div>
    <p class="muted" id="cgStatusTulisan" style="font-size:12px;">Memeriksa dukungan pengenalan tulisan tangan...</p>
    <div class="field"><label>Tulisan tangan (stylus / jari)</label>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
        ${warnaBtn}${lebarBtn}
        <button class="btn btn-sm" id="cgAlatPena" onclick="cgAturAlat('pena')">Pena</button>
        <button class="btn btn-sm" id="cgAlatHapus" onclick="cgAturAlat('hapus')">Penghapus</button>
        <button class="btn btn-sm" onclick="cgUrungkan()">Urungkan</button>
        <button class="btn btn-sm" onclick="cgBersihkanKanvas()">Hapus semua</button>
        <select id="cgLatar" onchange="cgAturLatar(this.value)" title="Latar kanvas">${latarOpts}</select>
        <label style="font-size:12px;display:flex;gap:4px;align-items:center;"><input type="checkbox" id="cgHanyaStylus" onchange="window._cgHanyaStylus=this.checked;"> Hanya stylus (tolak telapak tangan)</label>
      </div>
      <canvas id="cgCanvas" style="width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:#fff;touch-action:none;display:block;"></canvas>
      <p class="muted" style="font-size:12px;margin-top:6px;">Tips: saat stylus menyentuh kanvas, sentuhan telapak tangan otomatis diabaikan. Coretan tersimpan bersama catatan dan ikut tercetak.</p>
    </div>
  </div>`;
}

/* ---------- Kanvas ---------- */
function cgPasangKanvas(){
  const cv = document.getElementById("cgCanvas");
  if(!cv) return;
  const d = window._cgDraft; if(!d) return;
  cv.width = CG_KANVAS_W; cv.height = CG_KANVAS_H;
  window._cgCv = cv; window._cgCtx = cv.getContext("2d");
  window._cgAlat = window._cgAlat || "pena";
  window._cgWarna = window._cgWarna || CG_WARNA[0];
  window._cgLebar = window._cgLebar || CG_LEBAR[1];
  window._cgHanyaStylus = !!window._cgHanyaStylus;
  window._cgMenggambar = false; window._cgStylusAktif = false; window._cgCoretan = null;
  const cb = document.getElementById("cgHanyaStylus");
  if(cb) cb.checked = window._cgHanyaStylus;
  cgGambarUlang(); cgTandaiAlat();
  const st = document.getElementById("cgStatusTulisan");
  if(st){
    const duk = cgDukunganTulisan();
    st.textContent = duk.tersedia
      ? "Pengenalan tulisan tangan: tersedia di perangkat ini."
      : "Pengenalan tulisan tangan: " + duk.alasan + " Tulisan tangan tetap tersimpan sebagai coretan dan bisa dibaca/dicetak.";
  }
  cv.style.touchAction = "none";
  cv.addEventListener("pointerdown", cgPointerDown);
  cv.addEventListener("pointermove", cgPointerMove);
  cv.addEventListener("pointerup", cgPointerUp);
  cv.addEventListener("pointercancel", cgPointerUp);
  cv.addEventListener("pointerleave", cgPointerUp);
}
function cgPosKanvas(e){
  const cv = window._cgCv, r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) * (CG_KANVAS_W / r.width),
    (e.clientY - r.top) * (CG_KANVAS_H / r.height),
    (e.pressure && e.pressure > 0) ? e.pressure : 0.5];
}
function cgPointerDown(e){
  if(window._cgHanyaStylus && e.pointerType !== "pen") return;
  if(e.pointerType === "touch" && window._cgStylusAktif) return;
  if(e.pointerType === "pen") window._cgStylusAktif = true;
  e.preventDefault();
  const d = window._cgDraft; if(!d) return;
  const pos = cgPosKanvas(e);
  window._cgMenggambar = true;
  if(window._cgAlat === "hapus"){ cgHapusCoretanDekat(pos[0], pos[1]); return; }
  window._cgCoretan = { c: window._cgWarna, w: window._cgLebar, p: [pos] };
  try{ window._cgCv.setPointerCapture(e.pointerId); }catch(err){}
}
function cgPointerMove(e){
  if(!window._cgMenggambar) return;
  if(e.pointerType === "touch" && window._cgStylusAktif) return;
  e.preventDefault();
  const pos = cgPosKanvas(e);
  if(window._cgAlat === "hapus"){ cgHapusCoretanDekat(pos[0], pos[1]); return; }
  if(window._cgCoretan){ window._cgCoretan.p.push(pos); cgGambarUlang(); }
}
function cgPointerUp(e){
  if(e.pointerType === "pen") window._cgStylusAktif = false;
  if(!window._cgMenggambar) return;
  window._cgMenggambar = false;
  const d = window._cgDraft;
  if(d && window._cgCoretan && window._cgCoretan.p.length >= 1) d.tinta.push(window._cgCoretan);
  window._cgCoretan = null;
  cgGambarUlang();
}
function cgGambarUlang(){
  const cv = window._cgCv, ctx = window._cgCtx, d = window._cgDraft;
  if(!cv || !ctx || !d) return;
  ctx.clearRect(0, 0, CG_KANVAS_W, CG_KANVAS_H);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, CG_KANVAS_W, CG_KANVAS_H);
  if(d.latar === "garis"){
    ctx.strokeStyle = "#dbeafe"; ctx.lineWidth = 1;
    for(let y = 40; y < CG_KANVAS_H; y += 40){ ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CG_KANVAS_W, y); ctx.stroke(); }
  }else if(d.latar === "kotak"){
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
    for(let x = 0; x < CG_KANVAS_W; x += 40){ ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CG_KANVAS_H); ctx.stroke(); }
    for(let y = 0; y < CG_KANVAS_H; y += 40){ ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CG_KANVAS_W, y); ctx.stroke(); }
  }
  (d.tinta || []).forEach(st => cgGambarCoretan(ctx, st));
  if(window._cgCoretan) cgGambarCoretan(ctx, window._cgCoretan);
}
function cgGambarCoretan(ctx, st){
  if(!st.p || !st.p.length) return;
  ctx.strokeStyle = st.c; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if(st.p.length === 1){
    ctx.fillStyle = st.c;
    ctx.beginPath(); ctx.arc(st.p[0][0], st.p[0][1], Math.max(1, st.w / 2), 0, Math.PI * 2); ctx.fill();
    return;
  }
  for(let i = 1; i < st.p.length; i++){
    const a = st.p[i - 1], b = st.p[i];
    ctx.lineWidth = Math.max(1, st.w * (0.4 + (b[2] || 0.5)));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
}
function cgHapusCoretanDekat(x, y){
  const d = window._cgDraft; if(!d) return;
  const sebelum = d.tinta.length;
  d.tinta = d.tinta.filter(st => !st.p.some(q => Math.hypot(q[0] - x, q[1] - y) < 14));
  if(d.tinta.length !== sebelum) cgGambarUlang();
}
function cgTandaiAlat(){
  const set = (id, on) => { const el = document.getElementById(id); if(el) el.classList.toggle("btn-primary", !!on); };
  CG_WARNA.forEach((w, i) => set("cgWarna" + i, window._cgAlat === "pena" && window._cgWarna === w));
  CG_LEBAR.forEach((w, i) => set("cgLebar" + i, window._cgAlat === "pena" && window._cgLebar === w));
  set("cgAlatPena", window._cgAlat === "pena");
  set("cgAlatHapus", window._cgAlat === "hapus");
}
function cgAturWarna(w){ window._cgWarna = w; window._cgAlat = "pena"; cgTandaiAlat(); }
function cgAturLebar(w){ window._cgLebar = w; window._cgAlat = "pena"; cgTandaiAlat(); }
function cgAturAlat(a){ window._cgAlat = a; cgTandaiAlat(); }
function cgAturLatar(v){ const d = window._cgDraft; if(!d) return; d.latar = v; cgGambarUlang(); }
function cgUrungkan(){ const d = window._cgDraft; if(d && d.tinta.length){ d.tinta.pop(); cgGambarUlang(); } }
function cgBersihkanKanvas(){
  const d = window._cgDraft; if(!d || !d.tinta.length) return;
  confirmDialog("Hapus semua coretan di kanvas ini?", () => { d.tinta = []; cgGambarUlang(); });
}

/* ---------- Aksi ---------- */
function cgBukaBaru(){
  window._cgDraft = cgCatatanBaru();
  window._cgEditorId = window._cgDraft.id;
  window._cgBaru = true;
  navigate("catatanGuru");
}
function cgBuka(id){
  const n = loadCatatanGuru().find(x => x.id === id);
  if(!n){ toast("Catatan tidak ditemukan."); return; }
  window._cgDraft = JSON.parse(JSON.stringify(n));
  window._cgEditorId = id;
  window._cgBaru = false;
  navigate("catatanGuru");
}
function cgKembali(){ window._cgEditorId = null; window._cgDraft = null; window._cgBaru = false; navigate("catatanGuru"); }
function cgSimpan(){
  const d = window._cgDraft; if(!d) return;
  const ambil = id => { const el = document.getElementById(id); return el ? el.value : ""; };
  d.judul = ambil("cgJudul").trim();
  d.kategori = ambil("cgKat") || "Lainnya";
  d.tanggal = ambil("cgTanggal") || d.tanggal;
  d.isi = ambil("cgIsi");
  saveCatatanGuru(cgUpsertCatatan(loadCatatanGuru(), d));
  window._cgEditorId = null; window._cgDraft = null; window._cgBaru = false;
  toast("Catatan tersimpan.");
  navigate("catatanGuru");
}
function cgHapus(id){
  const n = loadCatatanGuru().find(x => x.id === id);
  confirmDialog("Hapus catatan \"" + (n ? (n.judul || "(Tanpa judul)") : "") + "\"?", () => {
    saveCatatanGuru(loadCatatanGuru().filter(x => x.id !== id));
    toast("Catatan dihapus.");
    cgRefreshList();
  });
}
function cgTogglePin(id){
  const arr = loadCatatanGuru();
  const n = arr.find(x => x.id === id); if(!n) return;
  n.pinned = !n.pinned; n.updatedAt = new Date().toISOString();
  saveCatatanGuru(arr); cgRefreshList();
}
function cgTemplate(){
  const ta = document.getElementById("cgIsi"); if(!ta) return;
  const d = window._cgDraft;
  const tanggal = (document.getElementById("cgTanggal") || {}).value || (d && d.tanggal);
  const tpl = cgTemplateRapat(tanggal);
  if(!ta.value.trim()){ ta.value = tpl; return; }
  confirmDialog("Tambahkan template rapat di akhir isi catatan?", () => {
    ta.value = ta.value.replace(/\s+$/, "") + "\n\n" + tpl;
  });
}
function cgSisipWaktu(){
  const ta = document.getElementById("cgIsi"); if(!ta) return;
  const jam = new Date().toTimeString().slice(0, 5);
  const teks = "[" + jam + "] ";
  const awal = (typeof ta.selectionStart === "number") ? ta.selectionStart : ta.value.length;
  ta.value = ta.value.slice(0, awal) + teks + ta.value.slice(ta.selectionEnd || awal);
  ta.focus();
  try{ ta.setSelectionRange(awal + teks.length, awal + teks.length); }catch(e){}
}
async function cgUbahJadiTeks(){
  const d = window._cgDraft; if(!d) return;
  const btn = document.getElementById("cgBtnKenali");
  if(btn) btn.disabled = true;
  try{
    const teks = await cgKenaliTulisan(d.tinta);
    const ta = document.getElementById("cgIsi");
    if(ta) ta.value = ta.value ? ta.value.replace(/\s+$/, "") + "\n" + teks : teks;
    toast("Tulisan dikenali dan ditambahkan ke isi.");
  }catch(e){
    toast("Pengenalan gagal: " + (e && e.message ? e.message : "tidak diketahui"));
  }finally{ if(btn) btn.disabled = false; }
}
function cgCetak(){
  const d = window._cgDraft; if(!d) return;
  const judul = ((document.getElementById("cgJudul") || {}).value || d.judul || "(Tanpa judul)");
  const isi = ((document.getElementById("cgIsi") || {}).value || "");
  const cv = window._cgCv;
  const img = (cv && d.tinta && d.tinta.length)
    ? `<img src="${cv.toDataURL("image/png")}" style="max-width:100%;border:1px solid #e5e7eb;border-radius:8px;">` : "";
  printDocument("CATATAN GURU - " + String(judul).toUpperCase(),
    `<p><strong>${escapeHtml(d.kategori || "")}</strong> &nbsp; ${escapeHtml(d.tanggal || "")}</p>
     <div class="divider"></div>
     <p style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(isi)}</p>
     ${img ? `<div class="divider"></div><p><strong>Tulisan tangan:</strong></p>` + img : ""}`);
}

/* ---------- Menu ---------- */
(function(){
  try{
    if(typeof NAV === "undefined") return;
    if(NAV.some(g => g.group === "Catatan Guru")) return;
    const grup = { group: "Catatan Guru", items: [{ id: "catatanGuru", label: "Buku Catatan Guru", icon: "edit" }] };
    const i = NAV.findIndex(g => g.group === "Pembinaan");
    if(i >= 0) NAV.splice(i + 1, 0, grup); else NAV.push(grup);
  }catch(e){}
})();
