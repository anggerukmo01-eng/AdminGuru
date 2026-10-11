/* ================================================================
   FILE: assets/js/40-pages-a.js (bagian 1 dari 2)
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   ================================================================ */
/* ================================================================
   FILE: assets/js/40-pages.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   6. PAGES
   ============================================================ */
const PAGES = {};

/* ---------- DASHBOARD ---------- */
/* ---------- PILIHAN TAHUN PELAJARAN & SEMESTER (BERANDA) ----------
   Widget cepat di Beranda untuk memilih Tahun Pelajaran & Semester aktif.
   Nilai yang dipilih langsung disimpan ke db.sekolah.tahunAjaran /
   db.sekolah.semester -- field yang SAMA dipakai oleh menu Profil Sekolah
   dan seluruh dokumen (Program Tahunan, Program Semester, Kop Surat,
   Rapor, dsb.), sehingga keduanya selalu tersinkron otomatis. */
function taGenerateOptions(){
  const now = new Date();
  // Tahun ajaran di Indonesia umumnya dimulai bulan Juli.
  const startYear = now.getMonth()>=6 ? now.getFullYear() : now.getFullYear()-1;
  const years = [];
  for(let offset=-3; offset<=3; offset++){
    const y = startYear+offset;
    years.push(y+"/"+(y+1));
  }
  if(db.sekolah.tahunAjaran && !years.includes(db.sekolah.tahunAjaran)) years.unshift(db.sekolah.tahunAjaran);
  return years;
}
function taSemesterOptions(){
  const opts = ["1 (Ganjil)","2 (Genap)"];
  if(db.sekolah.semester && !opts.includes(db.sekolah.semester)) opts.unshift(db.sekolah.semester);
  return opts;
}
function updateTahunSemesterBeranda(){
  const taEl = document.getElementById("berandaTahunAjaran");
  const semEl = document.getElementById("berandaSemester");
  if(!taEl || !semEl) return;
  db.sekolah.tahunAjaran = taEl.value;
  db.sekolah.semester = semEl.value;
  saveDB();
  toast("Tahun Pelajaran & Semester aktif: "+taEl.value+" - Semester "+semEl.value);
  renderPage("dashboard");
}

PAGES.dashboard = function(){
  const totalSiswa = db.siswa.length;
  const L = db.siswa.filter(s=>s.jk==="L").length;
  const P = db.siswa.filter(s=>s.jk==="P").length;
  const totalGuru = db.guru.length + db.tendik.length;
  const todayEvents = db.kalender.filter(k=>k.tanggal===todayISO());
  const upcoming = db.kalender.filter(k=>k.tanggal>=todayISO()).sort((a,b)=>a.tanggal.localeCompare(b.tanggal)).slice(0,5);
  const agendaRecent = db.agenda.slice().sort((a,b)=>(b.tanggal||"").localeCompare(a.tanggal||"")).slice(0,5);
  const wali = db.guru.find(g=>g.id===db.sekolah.waliKelasId);

  // Kehadiran hari ini
  const kehadiranHariIni = db.kehadiran[todayISO()] || {};
  let hadirCount=0, sakitCount=0, izinCount=0, alfaCount=0;
  db.siswa.forEach(s=>{
    const st = kehadiranHariIni[s.id] || "H";
    if(st==="S") sakitCount++; else if(st==="I") izinCount++; else if(st==="A") alfaCount++; else hadirCount++;
  });

  // Jadwal hari ini
  const hariIniNama = new Date().toLocaleDateString("id-ID",{weekday:"long"});
  const jadwalHariIni = (db.jadwal[hariIniNama]||[]).slice().sort((a,b)=>Number(a.jam||0)-Number(b.jam||0));

  // Catatan siswa terbaru (Catatan Perkembangan)
  const catatanTerbaru = db.perkembangan.slice().sort((a,b)=>(b.tanggal||"").localeCompare(a.tanggal||"")).slice(0,4);

  // Penilaian terbaru (gabungan formatif & sumatif)
  const penilaianTerbaru = db.asesmenFormatif.concat(db.asesmenSumatif)
    .slice().sort((a,b)=>(b.tanggal||"").localeCompare(a.tanggal||"")).slice(0,4);

  // Rekap seluruh kelas (ringkas, untuk widget dashboard)
  const rekapKelasRingkas = CLASS_LIST.map(c=>{
    const data = (c.id===activeClassId) ? db : loadClassDB(c.id);
    return {c, jumlah:(data.siswa||[]).length};
  });

  setTimeout(()=>{ window.dashRefresh = ()=>renderPage("dashboard"); },0);

  return `
  <div class="section-head">
    <div><h1>Selamat Datang${wali?", "+escapeHtml(wali.nama):""} 👋</h1>
      <div class="desc">${escapeHtml(db.sekolah.namaSekolah)} &middot; ${escapeHtml(classInfo(activeClassId).label)} &middot; T.A. ${escapeHtml(db.sekolah.tahunAjaran)} &middot; Semester ${escapeHtml(db.sekolah.semester)}</div>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;">
      <div style="flex:1;min-width:170px;">
        <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-soft);margin-bottom:5px;">${ic("calendar",14)} Tahun Pelajaran Aktif</label>
        <select id="berandaTahunAjaran" onchange="updateTahunSemesterBeranda()" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--surface-solid);color:var(--text);font-size:13.5px;">
          ${taGenerateOptions().map(t=>`<option value="${escapeHtml(t)}" ${t===db.sekolah.tahunAjaran?"selected":""}>${escapeHtml(t)}</option>`).join("")}
        </select>
      </div>
      <div style="flex:1;min-width:170px;">
        <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-soft);margin-bottom:5px;">${ic("clock",14)} Semester Aktif</label>
        <select id="berandaSemester" onchange="updateTahunSemesterBeranda()" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--surface-solid);color:var(--text);font-size:13.5px;">
          ${taSemesterOptions().map(s=>`<option value="${escapeHtml(s)}" ${s===db.sekolah.semester?"selected":""}>Semester ${escapeHtml(s)}</option>`).join("")}
        </select>
      </div>
    </div>
    <p class="hint" style="margin-top:8px;">Perubahan di sini otomatis tersinkron dengan field Tahun Ajaran &amp; Semester pada menu Profil Sekolah, dan langsung dipakai pada seluruh dokumen (Program Tahunan, Program Semester, Kop Surat, Rapor, dsb).</p>
  </div>
  <div class="quicknav-wrap">
    <div class="quicknav-title">${ic("chevronRight",13)} Geser untuk menu utama</div>
    <div class="quicknav-scroll">
      <div class="quicknav-card" style="--qc:var(--primary);" onclick="navigate('kehadiran')">
        <div class="qn-icon" style="background:var(--primary-soft);color:var(--primary);">${ic("attendance",20)}</div>
        <div><div class="qn-label">Kehadiran</div><div class="qn-desc">Tandai &amp; rekap hadir siswa</div></div>
      </div>
      <div class="quicknav-card" style="--qc:var(--accent);" onclick="navigate('rekapnilai')">
        <div class="qn-icon" style="background:var(--accent-soft);color:var(--accent);">${ic("bar",20)}</div>
        <div><div class="qn-label">Daftar Nilai</div><div class="qn-desc">Rekap nilai per siswa</div></div>
      </div>
      <div class="quicknav-card" style="--qc:var(--warn);" onclick="navigate('agenda')">
        <div class="qn-icon" style="background:var(--warn-soft);color:var(--warn);">${ic("book",20)}</div>
        <div><div class="qn-label">Jurnal Guru</div><div class="qn-desc">Jurnal mengajar harian</div></div>
      </div>
      <div class="quicknav-card" style="--qc:var(--danger);" onclick="navigate('modulajar')">
        <div class="qn-icon" style="background:var(--danger-soft);color:var(--danger);">${ic("clipboard",20)}</div>
        <div><div class="qn-label">Modul Ajar</div><div class="qn-desc">Susun &amp; unggah modul</div></div>
      </div>
    </div>
  </div>
  <div class="grid grid-4" style="margin-bottom:14px;">
    <div class="card stat-card" style="--sc:var(--primary);"><div class="icon" style="background:var(--primary-soft);color:var(--primary);">${ic("student",20)}</div><div class="num">${totalSiswa}</div><div class="lbl">Total Siswa (L:${L} / P:${P})</div></div>
    <div class="card stat-card" style="--sc:var(--accent);"><div class="icon" style="background:var(--accent-soft);color:var(--accent);">${ic("users",20)}</div><div class="num">${totalGuru}</div><div class="lbl">Guru & Tenaga Kependidikan</div></div>
    <div class="card stat-card" style="--sc:var(--warn);"><div class="icon" style="background:var(--warn-soft);color:var(--warn);">${ic("calendar",20)}</div><div class="num">${todayEvents.length}</div><div class="lbl">Agenda Hari Ini</div></div>
    <div class="card stat-card" style="--sc:var(--danger);"><div class="icon" style="background:var(--danger-soft);color:var(--danger);">${ic("clipboard",20)}</div><div class="num">${db.modulAjar.length}</div><div class="lbl">Modul Ajar Tersimpan</div></div>
  </div>
  <div class="grid grid-4" style="margin-bottom:18px;">
    <div class="card stat-card" style="--sc:var(--primary);"><div class="icon" style="background:var(--primary-soft);color:var(--primary);">${ic("attendance",20)}</div><div class="num">${hadirCount}</div><div class="lbl">Hadir Hari Ini</div></div>
    <div class="card stat-card" style="--sc:var(--warn);"><div class="icon" style="background:var(--warn-soft);color:var(--warn);">${ic("heart",20)}</div><div class="num">${sakitCount}</div><div class="lbl">Sakit</div></div>
    <div class="card stat-card" style="--sc:var(--accent);"><div class="icon" style="background:var(--accent-soft);color:var(--accent);">${ic("parent",20)}</div><div class="num">${izinCount}</div><div class="lbl">Izin</div></div>
    <div class="card stat-card" style="--sc:var(--danger);"><div class="icon" style="background:var(--danger-soft);color:var(--danger);">${ic("close",20)}</div><div class="num">${alfaCount}</div><div class="lbl">Alfa</div></div>
  </div>
  <div class="grid grid-2">
    <div class="card">
      <h3>${ic("calendar",16)} Agenda Mendatang</h3>
      ${upcoming.length? upcoming.map(e=>`<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);">
        <div><strong style="font-size:13px;">${escapeHtml(e.judul)}</strong><div class="muted" style="font-size:11.5px;">${escapeHtml(e.jenis||"")}</div></div>
        <div class="badge badge-blue">${fmtDate(e.tanggal)}</div></div>`).join("") : `<p class="muted">Belum ada agenda. Tambahkan di menu Kalender Pendidikan.</p>`}
    </div>
    <div class="card">
      <h3>${ic("book",16)} Jurnal Harian Terbaru</h3>
      ${agendaRecent.length? agendaRecent.map(e=>`<div style="padding:9px 0;border-bottom:1px solid var(--border);">
        <strong style="font-size:13px;">${fmtDate(e.tanggal)}</strong>
        <div class="muted" style="font-size:12.5px;">${escapeHtml((e.kegiatan||"").slice(0,90))}${(e.kegiatan||"").length>90?"...":""}</div></div>`).join("") : `<p class="muted">Belum ada jurnal harian. Tambahkan di menu Agenda / Jurnal Harian.</p>`}
    </div>
  </div>
  <div class="grid grid-2" style="margin-top:16px;">
    <div class="card">
      <h3>${ic("clock",16)} Jadwal Hari Ini (${escapeHtml(hariIniNama)})</h3>
      ${jadwalHariIni.length? jadwalHariIni.map(j=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
        <span style="font-size:13px;">${escapeHtml(j.mapel||"-")}</span><span class="badge badge-blue">Jam ke-${escapeHtml(String(j.jam||"-"))}</span></div>`).join("") : `<p class="muted">Tidak ada jadwal untuk hari ini, atau hari libur.</p>`}
    </div>
    <div class="card">
      <h3>${ic("heart",16)} Catatan Siswa Terbaru</h3>
      ${catatanTerbaru.length? catatanTerbaru.map(c=>`<div style="padding:8px 0;border-bottom:1px solid var(--border);">
        <strong style="font-size:12.5px;">${escapeHtml((db.siswa.find(s=>s.id===c.siswaId)||{}).nama||"?")}</strong> &middot; <span class="muted" style="font-size:11.5px;">${fmtDate(c.tanggal)}</span>
        <div class="muted" style="font-size:12px;">${escapeHtml((c.catatan||"").slice(0,70))}${(c.catatan||"").length>70?"...":""}</div></div>`).join("") : `<p class="muted">Belum ada catatan perkembangan siswa.</p>`}
    </div>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("bar",16)} Penilaian Terbaru</h3>
    ${penilaianTerbaru.length? `<div class="table-wrap"><table><thead><tr><th>Siswa</th><th>Mapel</th><th>Tanggal</th><th>Nilai/Catatan</th></tr></thead><tbody>
      ${penilaianTerbaru.map(p=>`<tr><td>${escapeHtml((db.siswa.find(s=>s.id===p.siswaId)||{}).nama||"?")}</td><td>${escapeHtml(p.mapel||"-")}</td><td>${fmtDate(p.tanggal)}</td><td>${p.nilai!=null?p.nilai:escapeHtml((p.catatan||"").slice(0,40))}</td></tr>`).join("")}
      </tbody></table></div>` : `<p class="muted">Belum ada asesmen tercatat.</p>`}
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("bar",16)} Rekap Seluruh Kelas</h3>
    <div class="grid grid-3">
      ${rekapKelasRingkas.map(r=>`<div style="cursor:pointer;padding:10px;border:1.5px solid ${r.c.id===activeClassId?'var(--primary)':'var(--border)'};border-radius:10px;" onclick="switchActiveClass('${r.c.id}')">
        <div class="muted" style="font-size:11px;">${r.c.id===activeClassId?"Aktif":"Klik utk pindah"}</div>
        <strong>${r.c.label}</strong><div style="font-size:20px;font-weight:800;">${r.jumlah} siswa</div>
      </div>`).join("")}
    </div>
    <button class="btn" style="margin-top:10px;" onclick="navigate('rekapSeluruhKelas')">${ic("bar",15)} Lihat Detail Rekap</button>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("backup",16)} Status Cloud Storage</h3>
    <div class="grid grid-3">
      <div><div class="muted" style="font-size:11.5px;">Status</div><strong>${cloudUser?'<span class="badge badge-green">Terhubung</span>':'<span class="badge badge-red">Belum Login</span>'}</strong></div>
      <div><div class="muted" style="font-size:11.5px;">Backup Terakhir</div><strong>${settings.cloud.lastBackupAt?fmtDate(settings.cloud.lastBackupAt.slice(0,10)):"Belum pernah"}</strong></div>
      <div><div class="muted" style="font-size:11.5px;">Sinkronisasi</div><strong>${escapeHtml(settings.cloud.lastSyncStatus)}</strong></div>
    </div>
    <button class="btn" style="margin-top:10px;" onclick="navigate('cloudStorage')">${ic("backup",15)} Buka Menu Cloud Storage</button>
  </div>
  <div class="card" style="margin-top:16px;">
    <h3>${ic("target",16)} Dimensi Profil Lulusan (Permendikdasmen No. 10/2025)</h3>
    <div style="display:flex;flex-wrap:wrap;">
      ${DIMENSI_PROFIL.map(d=>`<span class="chip">${d.nama}</span>`).join("")}
    </div>
    <p class="hint" style="margin-top:10px;">Delapan dimensi ini menjadi acuan penyusunan Modul Ajar & Deskripsi Rapor pada aplikasi ini, selaras dengan pendekatan Pembelajaran Mendalam.</p>
  </div>`;
};

/* ---------- PROFIL SEKOLAH ---------- */
PAGES.sekolah = function(){
  const s = db.sekolah;
  const guruOpts = db.guru.map(g=>({value:g.id,label:g.nama}));
  return `
  <div class="section-head"><div><h1>Profil Sekolah</h1><div class="desc">Data identitas sekolah &amp; kop surat resmi (dari dokumen terlampir).</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="printSekolah()">${ic("print",15)} Cetak Kop Surat</button>
  </div>
  <div class="card" style="margin-bottom:16px;">${letterheadHtmlPreview()}</div>
  <div class="card">
    <h3>Ubah Data Sekolah</h3>
    <div class="form-grid" id="sekolahForm">
      ${fieldHtml({key:"namaSekolah",label:"Nama Sekolah"}, s.namaSekolah)}
      ${fieldHtml({key:"npsn",label:"NPSN"}, s.npsn)}
      ${fieldHtml({key:"alamat",label:"Alamat"}, s.alamat)}
      ${fieldHtml({key:"desa",label:"Desa/Kelurahan"}, s.desa)}
      ${fieldHtml({key:"kecamatan",label:"Kecamatan"}, s.kecamatan)}
      ${fieldHtml({key:"kabupaten",label:"Kabupaten/Kota"}, s.kabupaten)}
      ${fieldHtml({key:"provinsi",label:"Provinsi"}, s.provinsi)}
      ${fieldHtml({key:"kodePos",label:"Kode Pos"}, s.kodePos)}
      ${fieldHtml({key:"telp",label:"Telepon"}, s.telp)}
      ${fieldHtml({key:"email",label:"Email"}, s.email)}
      ${fieldHtml({key:"website",label:"Website"}, s.website)}
      ${fieldHtml({key:"akreditasi",label:"Akreditasi"}, s.akreditasi)}
      ${fieldHtml({key:"kepalaSekolah",label:"Nama Kepala Sekolah"}, s.kepalaSekolah)}
      ${fieldHtml({key:"nipKepsek",label:"NIP Kepala Sekolah"}, s.nipKepsek)}
      ${fieldHtml({key:"tahunAjaran",label:"Tahun Ajaran"}, s.tahunAjaran)}
      ${fieldHtml({key:"semester",label:"Semester"}, s.semester)}
      ${fieldHtml({key:"waliKelasId",label:"Wali "+classInfo(activeClassId).label+" (pilih dari Data Guru)",type:"select",options:guruOpts}, s.waliKelasId)}
    </div>
    <p class="hint" style="margin-top:10px;">Kelas yang sedang diampu ditentukan oleh pemilih <strong>"Pilih Kelas Aktif"</strong> di bagian atas aplikasi (saat ini: <strong>${classInfo(activeClassId).label}</strong>), bukan lagi field terpisah di sini.</p>
    <button class="btn btn-primary" onclick="saveSekolah()">${ic("check",15)} Simpan Perubahan</button>
  </div>`;
};
function letterheadHtmlPreview(){ return letterheadHtml(); }
function saveSekolah(){
  const fields = ["namaSekolah","npsn","alamat","desa","kecamatan","kabupaten","provinsi","kodePos","telp","email","website","akreditasi","kepalaSekolah","nipKepsek","tahunAjaran","semester","waliKelasId"];
  fields.forEach(k=>{ const el = document.getElementById("f_"+k); if(el) db.sekolah[k] = el.value; });
  saveDB(); toast("Profil sekolah tersimpan."); renderPage("sekolah");
}
function printSekolah(){
  printDocument("PROFIL SEKOLAH", `<table><tbody>
    <tr><td style="width:220px;"><strong>Nama Sekolah</strong></td><td>: ${escapeHtml(db.sekolah.namaSekolah)}</td></tr>
    <tr><td><strong>NPSN</strong></td><td>: ${escapeHtml(db.sekolah.npsn)}</td></tr>
    <tr><td><strong>Alamat</strong></td><td>: ${escapeHtml(db.sekolah.alamat)}, ${escapeHtml(db.sekolah.desa)}, ${escapeHtml(db.sekolah.kecamatan)}</td></tr>
    <tr><td><strong>Kabupaten/Provinsi</strong></td><td>: ${escapeHtml(db.sekolah.kabupaten)}, ${escapeHtml(db.sekolah.provinsi)}</td></tr>
    <tr><td><strong>Kepala Sekolah</strong></td><td>: ${escapeHtml(db.sekolah.kepalaSekolah)} (NIP ${escapeHtml(db.sekolah.nipKepsek)})</td></tr>
    <tr><td><strong>Kelas</strong></td><td>: ${escapeHtml(classInfo(activeClassId).label)}</td></tr>
    <tr><td><strong>Tahun Ajaran</strong></td><td>: ${escapeHtml(db.sekolah.tahunAjaran)} - Semester ${escapeHtml(db.sekolah.semester)}</td></tr>
    </tbody></table>`);
}

/* ---------- GURU & TENDIK ---------- */
PAGES.guru = function(){
  const tabState = window._guruTab || "guru";
  window._guruTab = tabState;
  const rows = tabState==="guru" ? db.guru : db.tendik;
  const body = rows.map((r,i)=>`<tr>
    <td>${i+1}</td><td><strong>${escapeHtml(r.nama)}</strong>${r.id===db.sekolah.waliKelasId?' <span class="badge badge-green">Wali '+escapeHtml(classInfo(activeClassId).label)+'</span>':''}</td>
    <td>${escapeHtml(r.jk)}</td><td>${escapeHtml(r.nip||'-')}</td><td>${escapeHtml(r.status)}</td>
    <td>${escapeHtml(r.jabatan||'-')}</td><td>${escapeHtml(r.hp||'-')}</td>
    <td><div class="row-actions">
      <button class="btn btn-sm btn-icon" onclick="editStaff('${tabState}','${r.id}')">${ic("edit",15)}</button>
      <button class="btn btn-sm btn-icon btn-danger" onclick="deleteStaff('${tabState}','${r.id}')">${ic("trash",15)}</button>
    </div></td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Guru & Tenaga Kependidikan</h1><div class="desc">Data resmi dari Dapodik sekolah. Data pribadi sensitif (NIK/NPWP/rekening) sengaja tidak ditampilkan.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportCSV(window._guruTab==='guru'?'guru':'tendik', ${'null'}, [{key:'nama',label:'Nama'},{key:'nip',label:'NIP'},{key:'jk',label:'JK'},{key:'status',label:'Status'},{key:'jabatan',label:'Tugas Tambahan'},{key:'hp',label:'HP'},{key:'email',label:'Email'}], 'daftar_'+window._guruTab)">${ic("download",15)} CSV</button>
    <button class="btn btn-primary" onclick="addStaff()">${ic("plus",15)} Tambah</button>
  </div>
  <div class="pill-toggle" style="max-width:280px;margin-bottom:14px;">
    <button class="${tabState==='guru'?'active':''}" onclick="window._guruTab='guru';renderPage('guru');">Guru (${db.guru.length})</button>
    <button class="${tabState==='tendik'?'active':''}" onclick="window._guruTab='tendik';renderPage('guru');">Tendik (${db.tendik.length})</button>
  </div>
  <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>JK</th><th>NIP</th><th>Status</th><th>Tugas Tambahan</th><th>HP</th><th style="text-align:right">Aksi</th></tr></thead>
  <tbody>${body || `<tr><td colspan="8" class="empty-state">Belum ada data.</td></tr>`}</tbody></table></div>`;
};
function staffFields(){
  return [
    {key:"nama",label:"Nama Lengkap",required:true},
    {key:"jk",label:"Jenis Kelamin",type:"select",options:["L","P"]},
    {key:"nip",label:"NIP"}, {key:"nuptk",label:"NUPTK"},
    {key:"tempatLahir",label:"Tempat Lahir"}, {key:"tglLahir",label:"Tanggal Lahir",type:"date"},
    {key:"status",label:"Status Kepegawaian"}, {key:"jabatan",label:"Tugas Tambahan / Jabatan"},
    {key:"agama",label:"Agama"}, {key:"alamat",label:"Alamat"},
    {key:"hp",label:"No. HP"}, {key:"email",label:"Email"}, {key:"pangkat",label:"Pangkat/Golongan"},
  ];
}
function addStaff(){
  const tab = window._guruTab||"guru";
  openModal({title:"Tambah "+(tab==="guru"?"Guru":"Tenaga Kependidikan"),
    bodyHtml: staffFields().map(f=>fieldHtml(f,"")).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveStaffBtn">${ic("check",15)} Simpan</button>`});
  document.getElementById("saveStaffBtn").onclick = ()=>{
    const data = readForm(staffFields());
    if(!data.nama){ toast("Nama wajib diisi."); return; }
    data.id = uid(tab);
    db[tab].push(data); saveDB(); closeModal(); toast("Data tersimpan."); renderPage("guru");
  };
}
function editStaff(tab,id){
  const row = db[tab].find(r=>r.id===id); if(!row) return;
  openModal({title:"Ubah Data",
    bodyHtml: staffFields().map(f=>fieldHtml(f,row[f.key])).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveStaffBtn">${ic("check",15)} Simpan</button>`});
  document.getElementById("saveStaffBtn").onclick = ()=>{
    Object.assign(row, readForm(staffFields())); saveDB(); closeModal(); toast("Perubahan disimpan."); renderPage("guru");
  };
}
function deleteStaff(tab,id){
  confirmDialog("Hapus data ini?", ()=>{ db[tab]=db[tab].filter(r=>r.id!==id); saveDB(); toast("Dihapus."); renderPage("guru"); });
}

/* ---------- DATA SISWA ---------- */
function siswaFields(){
  return [
    {key:"no",label:"No. Absen",type:"number"},
    {key:"nama",label:"Nama Lengkap",required:true}, {key:"jk",label:"Jenis Kelamin",type:"select",options:["L","P"]},
    {key:"nis",label:"NIS"}, {key:"nisn",label:"NISN"},
    {key:"ttl",label:"Tempat, Tanggal Lahir"}, {key:"anakKe",label:"Anak Ke-"}, {key:"jmlSdr",label:"Jumlah Saudara"},
    {key:"bb",label:"Berat Badan (kg)"}, {key:"tb",label:"Tinggi Badan (cm)"}, {key:"agama",label:"Agama"},
    {key:"ayah",label:"Nama Ayah"}, {key:"ibu",label:"Nama Ibu"},
    {key:"pendidikanOrtu",label:"Pendidikan Orang Tua"}, {key:"pekerjaanOrtu",label:"Pekerjaan Orang Tua"},
    {key:"alamat",label:"Alamat"}, {key:"ket",label:"Keterangan"},
  ];
}
// Alias header CSV (huruf kecil) -> field key, agar impor tetap berhasil walau
// judul kolom pada file CSV sedikit berbeda dari label baku (mis. "Nama" saja,
// "No Absen" tanpa titik, "L/P", dsb.). Dipakai bersama label resmi siswaFields().
const SISWA_CSV_HEADER_ALIAS = {
  "no":"no", "no.":"no", "no absen":"no", "no. absen":"no", "nomor absen":"no", "absen":"no",
  "nama":"nama", "nama siswa":"nama", "nama lengkap siswa":"nama",
  "jk":"jk", "jenis kelamin":"jk", "l/p":"jk", "gender":"jk",
  "nis":"nis", "nisn":"nisn",
  "ttl":"ttl", "tempat tanggal lahir":"ttl", "tempat, tanggal lahir":"ttl", "tempat/tanggal lahir":"ttl",
  "anak ke":"anakKe", "anak ke-":"anakKe",
  "jumlah saudara":"jmlSdr", "jml saudara":"jmlSdr",
  "berat badan":"bb", "berat badan (kg)":"bb", "bb":"bb",
  "tinggi badan":"tb", "tinggi badan (cm)":"tb", "tb":"tb",
  "agama":"agama",
  "ayah":"ayah", "nama ayah":"ayah",
  "ibu":"ibu", "nama ibu":"ibu",
  "pendidikan orang tua":"pendidikanOrtu", "pendidikan ortu":"pendidikanOrtu",
  "pekerjaan orang tua":"pekerjaanOrtu", "pekerjaan ortu":"pekerjaanOrtu",
  "alamat":"alamat", "alamat rumah":"alamat",
  "keterangan":"ket", "ket":"ket",
};
function exportSiswaCSV(){
  exportCSV("siswa", null, siswaFields().map(f=>({key:f.key, label:f.label})));
}
function downloadSiswaTemplateCSV(){
  const cols = siswaFields().map(f=>({key:f.key, label:f.label}));
  const contoh = [
    {no:"1", nama:"Contoh Nama Siswa", jk:"L", nis:"", nisn:"", ttl:"Banyumas, 1 Januari 2019", anakKe:"1", jmlSdr:"-", bb:"", tb:"", agama:"Islam", ayah:"Nama Ayah", ibu:"Nama Ibu", pendidikanOrtu:"", pekerjaanOrtu:"", alamat:"", ket:""},
  ];
  exportCSV("siswa", contoh, cols, "template_data_siswa");
  toast("Template CSV diunduh. Isi data mengikuti baris contoh, lalu unggah kembali lewat \"Impor Data Siswa\".");
}
/* Menyusun ulang No. Absen agar selalu berurutan 1..N tanpa celah/duplikat,
   sesuai urutan No. Absen yang berlaku saat ini (mengikuti perubahan manual
   guru lewat field "No. Absen" pada form Tambah/Ubah). Dipanggil setelah
   setiap tambah/ubah/hapus/impor/pindah/naik kelas. */
function renumberSiswaArray(arr){
  arr.sort((a,b)=>{
    const na = Number(a.no); const nb = Number(b.no);
    const va = isNaN(na) ? 999999 : na, vb = isNaN(nb) ? 999999 : nb;
    return va - vb;
  });
  arr.forEach((s,i)=>{ s.no = i+1; });
  return arr;
}
// Ubah nomor absen langsung dari tabel (tanpa perlu buka form Ubah). Nomor
// baru akan menempatkan siswa pada urutan tersebut; siswa lain otomatis
// bergeser dan seluruh nomor dirapikan ulang 1..N lewat renumberSiswaArray.
function updateNoAbsenInline(id, inputEl){
  const raw = inputEl.value;
  const val = Number(raw);
  const s = db.siswa.find(x=>x.id===id);
  if(!s){ return; }
  s.no = (raw==="" || isNaN(val)) ? raw : val;
  saveDB();
  toast("Nomor absen "+s.nama+" diperbarui.");
  renderPage("siswa");
}
// Tukar nomor absen dengan siswa pada baris tepat di atas/bawahnya (hanya
// tersedia saat tabel diurutkan berdasarkan No. Absen).
function swapNoAbsen(id, direction){
  const sorted = db.siswa.slice().sort((a,b)=>(Number(a.no)||0)-(Number(b.no)||0));
  const idx = sorted.findIndex(x=>x.id===id);
  if(idx<0) return;
  const swapIdx = idx+direction;
  if(swapIdx<0 || swapIdx>=sorted.length) return;
  const a = sorted[idx], b = sorted[swapIdx];
  const tmp = a.no; a.no = b.no; b.no = tmp;
  renumberSiswaArray(db.siswa);
  saveDB();
  renderPage("siswa");
}
PAGES.siswa = function(){
  const q = (window._siswaQ||"").toLowerCase();
  const sortMode = window._siswaSort || "nama";
  const jkFilter = window._siswaFilterJK || "";
  let data = db.siswa.slice();
  if(jkFilter) data = data.filter(s=>s.jk===jkFilter);
  if(q) data = data.filter(s=>[s.nama,s.nis,s.nisn,s.alamat].some(v=>String(v||"").toLowerCase().includes(q)));
  data = sortMode==="nama" ? data.sort((a,b)=>(a.nama||"").localeCompare(b.nama||"")) : data.sort((a,b)=>(a.no||0)-(b.no||0));
  const isKelas6 = activeClassId==="kelas-6";
  const body = data.map((s,i)=>`<tr>
    <td>
      <div style="display:flex;align-items:center;gap:3px;">
        ${sortMode==="no" ? `<button class="btn btn-sm btn-icon" title="Tukar ke atas" style="width:20px;height:20px;padding:0;font-size:10px;line-height:1;" onclick="swapNoAbsen('${s.id}',-1)" ${i===0?"disabled":""}>▲</button>` : ""}
        <input type="number" class="no-absen-input" title="Ubah nomor absen" value="${s.no||(i+1)}" style="width:48px;padding:5px 4px;text-align:center;border-radius:8px;border:1px solid var(--border);background:var(--surface-solid);color:var(--text);"
          onchange="updateNoAbsenInline('${s.id}', this)" onkeydown="if(event.key==='Enter') this.blur();">
        ${sortMode==="no" ? `<button class="btn btn-sm btn-icon" title="Tukar ke bawah" style="width:20px;height:20px;padding:0;font-size:10px;line-height:1;" onclick="swapNoAbsen('${s.id}',1)" ${i===data.length-1?"disabled":""}>▼</button>` : ""}
      </div>
    </td>
    <td><strong>${escapeHtml(s.nama)}</strong><div class="muted" style="font-size:11px;">${escapeHtml(s.ttl||"")}</div></td>
    <td><span class="badge ${s.jk==='L'?'badge-blue':'badge-orange'}">${escapeHtml(s.jk)}</span></td>
    <td>${escapeHtml(s.nis||'[Diisi Guru]')}</td><td>${escapeHtml(s.nisn||'[Diisi Guru]')}</td>
    <td>${escapeHtml(s.ayah||'-')}</td><td>${escapeHtml(s.ibu||'-')}</td>
    <td>${escapeHtml(s.alamat||'-')}</td>
    <td><div class="row-actions">
      <button class="btn btn-sm btn-icon" title="Ubah" onclick="editSiswa('${s.id}')">${ic("edit",15)}</button>
      <button class="btn btn-sm btn-icon" title="Pindah Kelas" onclick="pindahSiswaKelas('${s.id}')">${ic("users",15)}</button>
      <button class="btn btn-sm btn-icon" title="Siswa Keluar / Mutasi Keluar" style="color:var(--danger);" onclick="prosesSiswaKeluar('${s.id}')">${ic("guest",15)}</button>
      <button class="btn btn-sm btn-icon btn-danger" title="Hapus" onclick="deleteSiswa('${s.id}')">${ic("trash",15)}</button>
    </div></td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Data Siswa</h1><div class="desc">${escapeHtml(classInfo(activeClassId).label)} &middot; ${db.siswa.length} siswa terdaftar.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportSiswaCSV()">${ic("download",15)} CSV</button>
    <button class="btn" style="border-color:var(--primary);color:var(--primary);" onclick="downloadSiswaTemplateCSV()">${ic("doc",15)} Unduh Template CSV</button>
    <button class="btn" onclick="exportSiswaWord()">${ic("doc",15)} Word</button>
    <button class="btn" onclick="exportSiswaExcel()">${ic("bar",15)} Excel</button>
    <button class="btn" onclick="printSiswa()">${ic("print",15)} Cetak</button>
    <button class="btn" style="border-color:var(--accent);color:var(--accent);" onclick="bukaSiswaMasuk()">${ic("plus",15)} Siswa Masuk (Baru/Pindahan)</button>
    <button class="btn btn-primary" onclick="addSiswa()">${ic("plus",15)} Tambah</button>
    <button class="btn" style="border-color:var(--warn);color:var(--warn);" onclick="${isKelas6?'kelas6LulusDialog()':'naikKelasBulk()'}">${ic("check2",15)} ${isKelas6?"Lulus / Arsip Alumni":"Naik Kelas"}</button>
  </div>
  <div class="card" style="margin-bottom:14px;background:var(--primary-soft);border-color:var(--primary);">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      ${ic("info",18)}
      <p style="margin:0;font-size:12px;flex:1;min-width:200px;">Gunakan <strong>"Siswa Masuk (Baru/Pindahan)"</strong> untuk menambah siswa di tengah tahun ajaran (mutasi masuk), dan ikon ${ic("guest",13)} pada baris siswa untuk memproses <strong>siswa keluar/mutasi keluar</strong> (dengan alasan &amp; tanggal). Seluruh riwayatnya tercatat otomatis di menu Buku Mutasi Siswa.</p>
      <button class="btn btn-sm" onclick="navigate('mutasi')">${ic("archive",14)} Lihat Riwayat Mutasi</button>
    </div>
  </div>
  <div class="card" style="margin-bottom:14px;">
    <h3 style="font-size:13px;">${ic("download",15)} Import Data Siswa (.csv)</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input type="file" id="importSiswaFile" accept=".csv" style="flex:1;min-width:200px;">
      <button class="btn" onclick="importSiswaCSV()">${ic("download",15)} Impor</button>
    </div>
    <p class="hint" style="font-size:11px;margin-top:6px;">Klik "Unduh Template CSV" di atas untuk contoh format kolom yang benar, isi data mengikuti baris contoh, lalu unggah file tersebut di sini. Header kolom yang sedikit berbeda (mis. "Nama" atau "No Absen") tetap dapat dikenali otomatis.</p>
  </div>
  <div class="toolbar" style="flex-wrap:wrap;gap:10px;">
    <div class="search-box">${ic("search",16)}<input placeholder="Cari nama / NIS / NISN / alamat..." oninput="window._siswaQ=this.value; renderPage('siswa');"></div>
    <select onchange="window._siswaSort=this.value; renderPage('siswa');" style="max-width:180px;">
      <option value="no" ${sortMode==="no"?"selected":""}>Urutkan: No. Absen</option>
      <option value="nama" ${sortMode==="nama"?"selected":""}>Urutkan: Alfabetis</option>
    </select>
    <select onchange="window._siswaFilterJK=this.value; renderPage('siswa');" style="max-width:160px;">
      <option value="" ${jkFilter===""?"selected":""}>Semua Jenis Kelamin</option>
      <option value="L" ${jkFilter==="L"?"selected":""}>Laki-laki</option>
      <option value="P" ${jkFilter==="P"?"selected":""}>Perempuan</option>
    </select>
  </div>
  <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama Siswa</th><th>JK</th><th>NIS</th><th>NISN</th><th>Ayah</th><th>Ibu</th><th>Alamat</th><th style="text-align:right">Aksi</th></tr></thead>
  <tbody>${body || `<tr><td colspan="9" class="empty-state">Tidak ada data ditemukan.</td></tr>`}</tbody></table></div>`;
};
function addSiswa(){
  openModal({title:"Tambah Siswa", bodyHtml:`<div class="form-grid">${siswaFields().map(f=>fieldHtml(f, f.key==="no" ? (db.siswa.length+1) : "")).join("")}</div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSiswaBtn">${ic("check",15)} Simpan</button>`});
  document.getElementById("saveSiswaBtn").onclick = ()=>{
    const data = readForm(siswaFields());
    if(!data.nama){ toast("Nama wajib diisi."); return; }
    data.id = uid("s");
    if(!data.no || isNaN(Number(data.no))) data.no = db.siswa.length+1;
    db.siswa.push(data);
    renumberSiswaArray(db.siswa);
    saveDB(); closeModal(); toast("Siswa ditambahkan."); renderPage("siswa");
  };
}
function editSiswa(id){
  const row = db.siswa.find(s=>s.id===id); if(!row) return;
  openModal({title:"Ubah Data Siswa", bodyHtml:`<div class="form-grid">${siswaFields().map(f=>fieldHtml(f,row[f.key])).join("")}</div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSiswaBtn">${ic("check",15)} Simpan</button>`});
  document.getElementById("saveSiswaBtn").onclick = ()=>{
    Object.assign(row, readForm(siswaFields()));
    if(!row.no || isNaN(Number(row.no))) row.no = db.siswa.length;
    renumberSiswaArray(db.siswa);
    saveDB(); closeModal(); toast("Perubahan disimpan."); renderPage("siswa");
  };
}
function deleteSiswa(id){
  confirmDialog("Hapus data siswa ini? No. Absen siswa lain akan otomatis dirapikan ulang.", ()=>{
    db.siswa = db.siswa.filter(s=>s.id!==id);
    renumberSiswaArray(db.siswa);
    saveDB(); toast("Dihapus. No. Absen dirapikan ulang."); renderPage("siswa");
  });
}

/* ---------- SISWA MASUK (Peserta Didik Baru / Mutasi Masuk) ---------- */
function bukaSiswaMasuk(){
  const masukFields = [
    {key:"jenisMasuk",label:"Jenis Penerimaan",type:"select",options:["Peserta Didik Baru","Pindahan / Mutasi Masuk"],required:true},
    {key:"tanggalMasuk",label:"Tanggal Masuk",type:"date",required:true},
    {key:"sekolahAsal",label:"Sekolah Asal (khusus Pindahan/Mutasi Masuk)"},
    {key:"keteranganMasuk",label:"Keterangan Tambahan",type:"textarea"},
  ];
  const allFields = masukFields.concat(siswaFields());
  openModal({
    title:"Siswa Masuk (Baru / Pindahan)",
    bodyHtml:`<p class="hint" style="margin-bottom:10px;">Lengkapi keterangan penerimaan di bagian atas, lalu data siswa di bawahnya. Data ini akan otomatis tercatat di Buku Mutasi Siswa sebagai riwayat "Masuk".</p>
      <div class="form-grid">${allFields.map(f=>fieldHtml(f, f.key==="tanggalMasuk"?todayISO():(f.key==="no"?(db.siswa.length+1):""))).join("")}</div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSiswaMasukBtn">${ic("check",15)} Simpan</button>`
  });
  document.getElementById("saveSiswaMasukBtn").onclick = ()=>{
    const data = readForm(allFields);
    if(!data.nama){ toast("Nama siswa wajib diisi."); return; }
    if(!data.jenisMasuk){ toast("Pilih jenis penerimaan terlebih dahulu."); return; }
    if(!data.tanggalMasuk){ toast("Tanggal masuk wajib diisi."); return; }
    const { jenisMasuk, tanggalMasuk, sekolahAsal, keteranganMasuk, ...siswaData } = data;
    siswaData.id = uid("s");
    if(!siswaData.no || isNaN(Number(siswaData.no))) siswaData.no = db.siswa.length+1;
    db.siswa.push(siswaData);
    renumberSiswaArray(db.siswa);
    db.mutasi = db.mutasi || [];
    db.mutasi.push({
      id: uid("mut"),
      tanggal: tanggalMasuk,
      namaSiswa: siswaData.nama,
      jenis: "Masuk - " + jenisMasuk,
      asalTujuan: sekolahAsal || "",
      alasanKeluar: "",
      keterangan: keteranganMasuk || "",
      siswaId: siswaData.id,
    });
    saveDB(); closeModal();
    toast("Siswa baru tercatat sebagai \"Masuk\" dan ditambahkan ke roster kelas.");
    renderPage("siswa");
  };
}

/* ---------- SISWA KELUAR (Mutasi Keluar / Putus Sekolah / dll.) ---------- */
function prosesSiswaKeluar(id){
  const s = db.siswa.find(x=>x.id===id); if(!s) return;
  const keluarFields = [
    {key:"tanggalKeluar",label:"Tanggal Keluar",type:"date",required:true},
    {key:"alasanKeluar",label:"Alasan Keluar",type:"select",options:["Pindah Sekolah (Mutasi Keluar)","Putus Sekolah","Meninggal Dunia","Lainnya"],required:true},
    {key:"sekolahTujuan",label:"Sekolah Tujuan (khusus Pindah Sekolah)"},
    {key:"keteranganKeluar",label:"Keterangan Tambahan",type:"textarea"},
  ];
  openModal({
    title:"Proses Siswa Keluar: "+s.nama,
    bodyHtml:`<p class="hint" style="margin-bottom:10px;">Siswa akan dikeluarkan dari roster aktif ${escapeHtml(classInfo(activeClassId).label)} dan riwayatnya tercatat otomatis di Buku Mutasi Siswa. Tindakan ini tidak dapat dibatalkan secara otomatis -- data siswa dapat ditambahkan kembali secara manual bila diperlukan.</p>
      <div class="form-grid">${keluarFields.map(f=>fieldHtml(f, f.key==="tanggalKeluar"?todayISO():"")).join("")}</div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-danger" id="saveSiswaKeluarBtn">${ic("check",15)} Proses Keluar</button>`
  });
  document.getElementById("saveSiswaKeluarBtn").onclick = ()=>{
    const data = readForm(keluarFields);
    if(!data.tanggalKeluar){ toast("Tanggal keluar wajib diisi."); return; }
    if(!data.alasanKeluar){ toast("Pilih alasan keluar terlebih dahulu."); return; }
    confirmDialog(`Yakin ${s.nama} akan dikeluarkan dari roster aktif?`, ()=>{
      db.mutasi = db.mutasi || [];
      db.mutasi.push({
        id: uid("mut"),
        tanggal: data.tanggalKeluar,
        namaSiswa: s.nama,
        jenis: "Keluar - " + data.alasanKeluar,
        asalTujuan: data.sekolahTujuan || "",
        alasanKeluar: data.alasanKeluar,
        keterangan: data.keteranganKeluar || "",
        siswaId: s.id,
      });
      db.siswa = db.siswa.filter(x=>x.id!==id);
      renumberSiswaArray(db.siswa);
      saveDB(); closeModal();
      toast("Siswa dikeluarkan dari roster & tercatat di Buku Mutasi Siswa.");
      renderPage("siswa");
    });
  };
}
function exportSiswaWord(){
  const cols = [{key:"nama",label:"Nama"},{key:"jk",label:"JK"},{key:"nis",label:"NIS"},{key:"nisn",label:"NISN"},{key:"ttl",label:"TTL"},{key:"ayah",label:"Ayah"},{key:"ibu",label:"Ibu"},{key:"alamat",label:"Alamat"}];
  const body = `${letterheadHtml()}<div class="doc-title">DAFTAR SISWA KELAS ${escapeHtml(db.sekolah.kelas).toUpperCase()} T.A. ${escapeHtml(db.sekolah.tahunAjaran)}</div>${tableHtmlFromRows(cols, db.siswa)}`;
  htmlToWordDoc(body, "Daftar_Siswa", "Daftar Siswa");
}
function exportSiswaExcel(){
  const cols = [{key:"nama",label:"Nama"},{key:"jk",label:"JK"},{key:"nis",label:"NIS"},{key:"nisn",label:"NISN"},{key:"ttl",label:"TTL"},{key:"ayah",label:"Ayah"},{key:"ibu",label:"Ibu"},{key:"pekerjaanOrtu",label:"Pekerjaan Ortu"},{key:"alamat",label:"Alamat"}];
  htmlToExcelXls(tableHtmlFromRows(cols, db.siswa), "Data_Siswa", "Data Siswa");
}
function printSiswa(){
  const cols = [{key:"nama",label:"Nama"},{key:"jk",label:"JK"},{key:"nis",label:"NIS"},{key:"nisn",label:"NISN"},{key:"ttl",label:"TTL"},{key:"alamat",label:"Alamat"}];
  printDocument("DAFTAR SISWA KELAS "+db.sekolah.kelas.toUpperCase(), tableHtmlFromRows(cols, db.siswa));
}
/* ---- Naik Kelas / Pindah Kelas / Lulus & Arsip Alumni ---- */
function naikKelasBulk(){
  const next = nextClassId(activeClassId);
  if(!next){ kelas6LulusDialog(); return; }
  if(!db.siswa.length){ toast("Tidak ada siswa untuk dinaikkan."); return; }
  const nextLabel = classInfo(next).label, curLabel = classInfo(activeClassId).label;
  confirmDialog(`Naikkan SELURUH ${db.siswa.length} siswa dari ${curLabel} ke ${nextLabel}? Data akademik (nilai, kehadiran, jurnal, dst.) ${curLabel} tetap tersimpan sebagai arsip dan TIDAK terhapus. Setiap siswa akan memulai catatan baru yang kosong di ${nextLabel}.`, ()=>{
    const targetCls = loadClassDB(next);
    const startNo = targetCls.siswa.length;
    db.siswa.forEach((s,i)=>{ targetCls.siswa.push(Object.assign({}, s, {no: startNo+i+1})); });
    renumberSiswaArray(targetCls.siswa);
    saveClassDB(next, targetCls);
    const kkLog = db.kenaikanKelas.slice();
    db.siswa.forEach(s=> kkLog.push({id:uid("kk"), siswaId:s.id, tahunAjaran:db.sekolah.tahunAjaran, keputusan:"Naik Kelas", keterangan:"Naik massal dari "+curLabel+" ke "+nextLabel}));
    db.kenaikanKelas = kkLog;
    db.siswa = [];
    saveDB();
    toast(`Berhasil menaikkan siswa dari ${curLabel} ke ${nextLabel}.`);
    renderPage("siswa");
  });
}
function kelas6LulusDialog(){
  if(!db.siswa.length){ toast("Tidak ada siswa untuk diluluskan."); return; }
  openModal({title:"Kelulusan "+classInfo(activeClassId).label, bodyHtml:`
    <p style="font-size:13px;">${classInfo(activeClassId).label} adalah jenjang akhir SD. ${db.siswa.length} siswa akan dipindahkan ke Arsip Alumni.</p>
    <div class="field"><label>Tahun Lulus</label><input id="tahunLulusInput" value="${new Date().getFullYear()}"></div>
    <p class="hint">Data akademik ${classInfo(activeClassId).label} (nilai, kehadiran, jurnal, dst.) tetap tersimpan sebagai arsip dan TIDAK terhapus.</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="lulusBtn">${ic("check2",15)} Luluskan &amp; Arsipkan</button>`});
  document.getElementById("lulusBtn").onclick = ()=>{
    const tahun = (document.getElementById("tahunLulusInput").value||"").trim() || String(new Date().getFullYear());
    const alumni = loadAlumni();
    db.siswa.forEach(s=> alumni.push(Object.assign({}, s, {tahunLulus:tahun, kelasTerakhir:classInfo(activeClassId).label})));
    saveAlumni(alumni);
    const kkLog = db.kenaikanKelas.slice();
    db.siswa.forEach(s=> kkLog.push({id:uid("kk"), siswaId:s.id, tahunAjaran:db.sekolah.tahunAjaran, keputusan:"Naik Kelas", keterangan:"Lulus / Arsip Alumni tahun "+tahun}));
    db.kenaikanKelas = kkLog;
    db.siswa = [];
    saveDB(); closeModal();
    toast(alumni.length+" siswa diarsipkan sebagai alumni.");
    renderPage("siswa");
  };
}
function pindahSiswaKelas(id){
  const s = db.siswa.find(x=>x.id===id); if(!s) return;
  const opts = CLASS_LIST.filter(c=>c.id!==activeClassId).map(c=>`<option value="${c.id}">${c.label}</option>`).join("");
  openModal({title:"Pindahkan Siswa ke Kelas Lain", bodyHtml:`
    <p style="font-size:13px;">Pindahkan <strong>${escapeHtml(s.nama)}</strong> dari ${classInfo(activeClassId).label} ke:</p>
    <div class="field"><select id="targetKelasSel">${opts}</select></div>
    <p class="hint">Data akademik siswa di ${classInfo(activeClassId).label} tetap tersimpan sebagai arsip.</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="pindahBtn">${ic("check",15)} Pindahkan</button>`});
  document.getElementById("pindahBtn").onclick = ()=>{
    const target = document.getElementById("targetKelasSel").value;
    const targetCls = loadClassDB(target);
    targetCls.siswa.push(Object.assign({}, s, {no: targetCls.siswa.length+1}));
    renumberSiswaArray(targetCls.siswa);
    saveClassDB(target, targetCls);
    db.siswa = db.siswa.filter(x=>x.id!==id);
    renumberSiswaArray(db.siswa);
    saveDB(); closeModal();
    toast(escapeHtml(s.nama)+" dipindahkan ke "+classInfo(target).label+".");
    renderPage("siswa");
  };
}
/* ---- Import CSV sederhana (tanpa pustaka eksternal) ---- */
function parseCsvLine(line){
  const out=[]; let cur=""; let inQ=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(inQ){
      if(ch==='"' && line[i+1]==='"'){ cur+='"'; i++; }
      else if(ch==='"'){ inQ=false; }
      else cur+=ch;
    } else {
      if(ch==='"') inQ=true;
      else if(ch===','){ out.push(cur); cur=""; }
      else cur+=ch;
    }
  }
  out.push(cur);
  return out;
}
function importSiswaCSV(){
  const inp = document.getElementById("importSiswaFile");
  if(!inp || !inp.files.length){ toast("Pilih file CSV terlebih dahulu."); return; }
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const text = String(e.target.result).replace(/^\ufeff/,"");
      const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
      if(lines.length<2){ toast("File CSV kosong atau tidak berisi baris data. Pastikan file memiliki baris header + minimal 1 baris data."); return; }
      const rawHeaders = parseCsvLine(lines[0]).map(h=>h.trim());
      const keyMap = {}; siswaFields().forEach(f=>{ keyMap[f.label.toLowerCase()] = f.key; });
      const headers = rawHeaders.map(h=>{
        const norm = h.toLowerCase().replace(/\s+/g," ").trim();
        return keyMap[norm] || SISWA_CSV_HEADER_ALIAS[norm] || null;
      });
      const matchedCount = headers.filter(Boolean).length;
      if(matchedCount===0){
        toast("Header kolom CSV tidak dikenali. Gunakan tombol \"Unduh Template CSV\" untuk mendapatkan format yang benar, lalu isi data pada baris di bawah header.");
        return;
      }
      let added = 0, skipped = 0;
      for(let i=1;i<lines.length;i++){
        const cells = parseCsvLine(lines[i]);
        if(!cells.length) continue;
        const rec = {};
        headers.forEach((key,idx)=>{ if(key) rec[key] = (cells[idx]||"").trim(); });
        if(!rec.nama){ skipped++; continue; }
        if(rec.jk) rec.jk = rec.jk.toUpperCase().startsWith("P") ? "P" : (rec.jk.toUpperCase().startsWith("L") ? "L" : rec.jk);
        rec.id = uid("s");
        if(!rec.no || isNaN(Number(rec.no))) rec.no = db.siswa.length+1;
        db.siswa.push(rec); added++;
      }
      renumberSiswaArray(db.siswa);
      saveDB();
      if(added>0){
        toast(added+" siswa berhasil diimpor"+(skipped?(", "+skipped+" baris dilewati karena kolom Nama kosong"):"")+". No. Absen otomatis dirapikan.");
        inp.value = "";
      } else {
        toast("Tidak ada siswa yang berhasil diimpor -- pastikan kolom \"Nama Lengkap\" terisi pada setiap baris data.");
      }
      renderPage("siswa");
    }catch(err){ toast("Gagal membaca file CSV: "+err.message); }
  };
  reader.readAsText(inp.files[0]);
}

/* ---------- DATA ORANG TUA ---------- */
PAGES.ortu = function(){
  const q = (window._ortuQ||"").toLowerCase();
  let data = siswaSortedAlpha();
  if(q) data = data.filter(s=>[s.nama,s.ayah,s.ibu].some(v=>String(v||"").toLowerCase().includes(q)));
  const body = data.map((s,i)=>`<tr><td>${i+1}</td>
    <td><strong>${escapeHtml(s.nama)}</strong></td>
    <td>${escapeHtml(s.ayah||'-')}</td><td>${escapeHtml(s.ibu||'-')}</td>
    <td>${escapeHtml(s.pendidikanOrtu||'-')}</td><td>${escapeHtml(s.pekerjaanOrtu||'-')}</td>
    <td>${escapeHtml(s.alamat||'-')}</td>
    <td><button class="btn btn-sm" onclick="editSiswa('${s.id}')">${ic("edit",14)} Ubah</button></td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Data Orang Tua / Wali</h1><div class="desc">Data ini bersumber dari data induk siswa. Untuk mengubah, edit lewat tombol "Ubah".</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportCSV('siswa', db.siswa, [{key:'nama',label:'Nama Siswa'},{key:'ayah',label:'Ayah'},{key:'ibu',label:'Ibu'},{key:'pendidikanOrtu',label:'Pendidikan Ortu'},{key:'pekerjaanOrtu',label:'Pekerjaan Ortu'},{key:'alamat',label:'Alamat'}], 'data_orangtua')">${ic("download",15)} CSV</button>
  </div>
  <div class="toolbar"><div class="search-box">${ic("search",16)}<input placeholder="Cari nama siswa / ayah / ibu..." oninput="window._ortuQ=this.value; renderPage('ortu');"></div></div>
  <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama Siswa</th><th>Nama Ayah</th><th>Nama Ibu</th><th>Pendidikan Ortu</th><th>Pekerjaan Ortu</th><th>Alamat</th><th>Aksi</th></tr></thead>
  <tbody>${body || `<tr><td colspan="8" class="empty-state">Tidak ada data.</td></tr>`}</tbody></table></div>`;
};

/* ---------- KALENDER PENDIDIKAN ---------- */
function kalFields(){
  return [
    {key:"tanggal",label:"Tanggal",type:"date",required:true},
    {key:"judul",label:"Judul Kegiatan",required:true},
    {key:"jenis",label:"Jenis",type:"select",options:["Hari Efektif","Libur Semester","Libur Nasional","Ujian/Asesmen","Kegiatan Sekolah","Rapat","Agenda Guru","Lainnya"]},
    {key:"keterangan",label:"Keterangan",type:"textarea"},
    {key:"pengingatAktif",label:"Aktifkan Pengingat/Alarm?",type:"select",options:["Tidak","Ya"]},
    {key:"pengingatJam",label:"Jam Pengingat (jika aktif)",type:"time",placeholder:"07.00"},
    {key:"pengingatMenit",label:"Ingatkan Berapa Menit Sebelumnya",type:"select",options:[
      {value:"0",label:"Tepat pada jam tersebut"},
      {value:"15",label:"15 menit sebelumnya"},
      {value:"30",label:"30 menit sebelumnya"},
      {value:"60",label:"1 jam sebelumnya"},
      {value:"1440",label:"1 hari sebelumnya"},
    ]},
  ];
}
const KAL_JENIS_WARNA = {
  "Hari Efektif":"var(--primary)",
  "Libur Semester":"var(--warn)",
  "Libur Nasional":"var(--danger)",
  "Ujian/Asesmen":"#8b5cf6",
  "Kegiatan Sekolah":"var(--accent)",
  "Rapat":"#06b6d4",
  "Agenda Guru":"#ec4899",
  "Lainnya":"var(--text-soft)",
};
function kalJenisWarna(jenis){ return KAL_JENIS_WARNA[jenis] || "var(--text-soft)"; }
const KAL_BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const KAL_HARI_SINGKAT = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
function isoOfYMD(y,m,d){ return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0"); }
function kalGetYearMonth(){
  if(window._kalYear==null || window._kalMonth==null){
    const now = new Date();
    window._kalYear = now.getFullYear();
    window._kalMonth = now.getMonth();
  }
  return {year:window._kalYear, month:window._kalMonth};
}
function kalChangeMonth(delta){
  const {year,month} = kalGetYearMonth();
  let m = month+delta, y = year;
  if(m<0){ m=11; y--; }
  if(m>11){ m=0; y++; }
  window._kalYear=y; window._kalMonth=m;
  renderPage("kalender");
}
function kalGotoToday(){
  const now = new Date();
  window._kalYear = now.getFullYear(); window._kalMonth = now.getMonth();
  renderPage("kalender");
}
function kalEventsOnDate(iso){
  return db.kalender.filter(k=>k.tanggal===iso).sort((a,b)=>String(a.pengingatJam||"").localeCompare(String(b.pengingatJam||"")));
}
function kalMenitLabel(menit){
  const map = {"0":"tepat pada jam tsb.","15":"15 menit sebelumnya","30":"30 menit sebelumnya","60":"1 jam sebelumnya","1440":"1 hari sebelumnya"};
  return map[String(menit)] || "tepat pada jam tsb.";
}
function buildKalenderGrid(year,month){
  const startOffset = new Date(year,month,1).getDay(); // 0=Minggu
  const daysInMonth = new Date(year,month+1,0).getDate();
  const todayStr = todayISO();
  let cells = "";
  for(let i=0;i<startOffset;i++) cells += `<div class="kal-cell kal-empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const iso = isoOfYMD(year,month,d);
    const dow = new Date(year,month,d).getDay();
    const events = kalEventsOnDate(iso);
    const isToday = iso===todayStr;
    const isWeekend = dow===0 || dow===6;
    const hasReminder = events.some(e=>e.pengingatAktif==="Ya");
    const dots = events.slice(0,4).map(e=>`<span class="dot" style="background:${kalJenisWarna(e.jenis)}" title="${escapeHtml(e.judul)}"></span>`).join("");
    cells += `<div class="kal-cell ${isToday?'kal-today':''} ${isWeekend?'kal-weekend':''}" onclick="openKalHari('${iso}')" title="${events.length} agenda">
      <div class="kal-daynum">${d}</div>
      <div class="kal-dots">${dots}</div>
      ${events.length>4?`<div class="kal-badgecount">+${events.length-4}</div>`:""}
      ${hasReminder?`<div class="kal-bell">${ic("bell",12)}</div>`:""}
    </div>`;
  }
  const trailing = (7 - ((startOffset+daysInMonth) % 7)) % 7;
  for(let i=0;i<trailing;i++) cells += `<div class="kal-cell kal-empty"></div>`;
  return `<div class="kal-grid">${KAL_HARI_SINGKAT.map(h=>`<div class="kal-weekday">${h}</div>`).join("")}${cells}</div>`;
}
function openKalHari(iso){
  const events = kalEventsOnDate(iso);
  const list = events.map(e=>`<div class="card" style="margin-bottom:8px;padding:12px;">
     <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
       <div>
         <span class="badge" style="background:${kalJenisWarna(e.jenis)}22;color:${kalJenisWarna(e.jenis)};">${escapeHtml(e.jenis||'-')}</span>
         <strong style="display:block;margin-top:4px;">${escapeHtml(e.judul)}</strong>
         ${e.keterangan?`<div class="muted" style="font-size:12px;">${escapeHtml(e.keterangan)}</div>`:""}
         ${e.pengingatAktif==="Ya"?`<div style="font-size:11.5px;color:var(--warn);margin-top:4px;">${ic("bell",12)} Pengingat jam ${escapeHtml(e.pengingatJam||'-')} (${kalMenitLabel(e.pengingatMenit)})</div>`:""}
       </div>
       <div class="row-actions">
         <button class="btn btn-sm btn-icon" onclick="closeModal(); crudEdit('kalender','${e.id}')">${ic("edit",14)}</button>
         <button class="btn btn-sm btn-icon btn-danger" onclick="crudDelete('kalender','${e.id}'); closeModal(); openKalHari('${iso}')">${ic("trash",14)}</button>
       </div>
     </div>
  </div>`).join("");
  openModal({
    title: "Agenda "+fmtDate(iso),
    bodyHtml: list || `<p class="muted">Belum ada agenda pada tanggal ini.</p>`,
    footHtml: `<button class="btn" onclick="closeModal()">Tutup</button><button class="btn btn-primary" onclick="closeModal(); tambahAgendaTanggal('${iso}')">${ic("plus",14)} Tambah Agenda di Tanggal Ini</button>`
  });
}
function tambahAgendaTanggal(iso){
  const cfg = CRUD_CONFIG.kalender;
  openModal({
    title:"Tambah "+cfg.title,
    bodyHtml: cfg.fields.map(f=>fieldHtml(f, f.key==="tanggal"?iso:(f.key==="pengingatAktif"?"Tidak":""))).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="crudSaveBtn">${ic("check",15)} Simpan</button>`
  });
  document.getElementById("crudSaveBtn").onclick = ()=>{
    const data = readForm(cfg.fields);
    const missing = cfg.fields.find(f=>f.required && !data[f.key]);
    if(missing){ toast("Mohon isi: "+missing.label); return; }
    data.id = uid("kalender");
    db.kalender.push(data);
    saveDB(); closeModal(); toast("Agenda tersimpan.");
    renderPage("kalender");
  };
}
PAGES.kalender = function(){
  CRUD_CONFIG.kalender = {store:"kalender", title:"Kalender Pendidikan", fields:kalFields(), columns:[{key:"tanggal",label:"Tanggal"},{key:"judul",label:"Judul"}]};
  const view = window._kalView || "grid";
  const {year,month} = kalGetYearMonth();
  const notifStatus = (typeof Notification!=="undefined") ? Notification.permission : "unsupported";

  let mainContent;
  if(view==="grid"){
    mainContent = `
    <div class="kal-toolbar">
      <div class="kal-nav">
        <button class="iconbtn" onclick="kalChangeMonth(-1)">${ic("chevronLeft",16)}</button>
        <div class="label">${KAL_BULAN[month]} ${year}</div>
        <button class="iconbtn" onclick="kalChangeMonth(1)">${ic("chevronRight",16)}</button>
      </div>
      <button class="btn btn-sm" onclick="kalGotoToday()">Hari Ini</button>
      <div class="grow"></div>
    </div>
    <div class="kal-legend">
      ${Object.keys(KAL_JENIS_WARNA).map(j=>`<span><span class="dot" style="background:${KAL_JENIS_WARNA[j]}"></span>${escapeHtml(j)}</span>`).join("")}
      <span>${ic("bell",12)} = ada pengingat/alarm aktif</span>
    </div>
    <div class="card">${buildKalenderGrid(year,month)}</div>`;
  } else {
    const rows = db.kalender.slice().sort((a,b)=>a.tanggal.localeCompare(b.tanggal));
    const body = rows.map(r=>`<tr><td>${fmtDate(r.tanggal)}</td><td><strong>${escapeHtml(r.judul)}</strong></td>
      <td><span class="badge" style="background:${kalJenisWarna(r.jenis)}22;color:${kalJenisWarna(r.jenis)};">${escapeHtml(r.jenis||'-')}</span></td>
      <td>${r.pengingatAktif==="Ya"?ic("bell",14)+" "+escapeHtml(r.pengingatJam||''):'-'}</td>
      <td>${escapeHtml(r.keterangan||'-')}</td>
      <td><div class="row-actions"><button class="btn btn-sm btn-icon" onclick="crudEdit('kalender','${r.id}')">${ic("edit",15)}</button>
      <button class="btn btn-sm btn-icon btn-danger" onclick="crudDelete('kalender','${r.id}')">${ic("trash",15)}</button></div></td></tr>`).join("");
    mainContent = `<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Judul</th><th>Jenis</th><th>Pengingat</th><th>Keterangan</th><th style="text-align:right">Aksi</th></tr></thead>
    <tbody>${body || `<tr><td colspan="6" class="empty-state">Belum ada agenda kalender.</td></tr>`}</tbody></table></div>`;
  }

  const remindersToday = db.kalender.filter(k=>k.tanggal===todayISO() && k.pengingatAktif==="Ya");

  return `
  <div class="section-head"><div><h1>Kalender Pendidikan &amp; Akademik</h1><div class="desc">Seluruh tanggal ditampilkan penuh (bukan hanya hari libur) -- klik tanggal mana pun untuk melihat/menambah agenda. Tandai hari libur, tanggal khusus, atau agenda guru dengan pengingat/alarm otomatis.</div></div>
    <div class="grow"></div>
    <div class="pill-toggle" style="max-width:220px;">
      <button class="${view==='grid'?'active':''}" onclick="window._kalView='grid'; renderPage('kalender');">Kalender</button>
      <button class="${view==='list'?'active':''}" onclick="window._kalView='list'; renderPage('kalender');">Daftar</button>
    </div>
    <button class="btn" onclick="printKalender()">${ic("print",15)} Cetak</button>
    <button class="btn btn-primary" onclick="crudAdd('kalender')">${ic("plus",15)} Tambah Agenda</button></div>
  ${notifStatus!=="granted" ? `<div class="card" style="background:var(--warn-soft);border-color:var(--warn);margin-bottom:14px;">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      ${ic("bell",18)}
      <p style="margin:0;font-size:12.5px;flex:1;min-width:200px;">Aktifkan notifikasi peramban agar pengingat/alarm agenda kaldik tetap muncul walau aplikasi ini sedang di tab lain (selama tab masih terbuka).</p>
      <button class="btn btn-sm btn-primary" onclick="requestNotifPermission()">${ic("bell",14)} Aktifkan Notifikasi</button>
    </div>
  </div>` : ""}
  ${remindersToday.length ? `<div class="card" style="background:var(--accent-soft);border-color:var(--accent);margin-bottom:14px;">
    <h3 style="font-size:13px;">${ic("bell",16)} Pengingat Aktif Hari Ini (${fmtDate(todayISO())})</h3>
    ${remindersToday.map(r=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12.5px;">
      <span><strong>${escapeHtml(r.judul)}</strong> <span class="muted">(${kalMenitLabel(r.pengingatMenit)})</span></span>
      <span class="badge badge-blue">${escapeHtml(r.pengingatJam||'-')}</span></div>`).join("")}
  </div>` : ""}
  ${mainContent}`;
};
function printKalender(){
  const cols=[{key:"tanggal",label:"Tanggal"},{key:"judul",label:"Judul"},{key:"jenis",label:"Jenis"},{key:"keterangan",label:"Keterangan"}];
  const rows = db.kalender.slice().sort((a,b)=>a.tanggal.localeCompare(b.tanggal)).map(r=>({...r,tanggal:fmtDate(r.tanggal)}));
  printDocument("KALENDER PENDIDIKAN T.A. "+db.sekolah.tahunAjaran, tableHtmlFromRows(cols, rows));
}

/* ---------- ALARM / PENGINGAT AGENDA KALDIK ---------- */
function requestNotifPermission(){
  if(typeof Notification==="undefined"){ toast("Peramban ini tidak mendukung notifikasi."); return; }
  Notification.requestPermission().then(perm=>{
    if(perm==="granted") toast("Notifikasi pengingat diaktifkan.");
    else toast("Izin notifikasi tidak diberikan. Pengingat tetap tampil sebagai info dalam aplikasi.");
    renderPage("kalender");
  });
}
function kalPlayBeep(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type="sine"; osc.frequency.value=880;
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime+0.35);
    setTimeout(()=>{ try{ ctx.close(); }catch(e){} }, 500);
  }catch(e){ /* abaikan jika Web Audio tidak tersedia */ }
}
function kalNotifiedKey(entryId){ return entryId+"_"+todayISO(); }
function kalGetNotifiedSet(){
  try{ return new Set(JSON.parse(localStorage.getItem("tpsd2026_kal_notified")||"[]")); }
  catch(e){ return new Set(); }
}
function kalSaveNotifiedSet(set){
  localStorage.setItem("tpsd2026_kal_notified", JSON.stringify([...set]));
}
function kalTriggerReminder(entry){
  toast(`Pengingat: ${entry.judul} (${entry.pengingatJam||''})`);
  kalPlayBeep();
  try{ if(navigator.vibrate) navigator.vibrate([200,100,200]); }catch(e){}
  if(typeof Notification!=="undefined" && Notification.permission==="granted"){
    try{
      new Notification("Pengingat Kaldik: "+entry.judul, {
        body: (entry.keterangan||"Saatnya untuk agenda ini.") + " ("+fmtDate(entry.tanggal)+" "+ (entry.pengingatJam||"") +")",
        tag: "kal_"+entry.id,
      });
    }catch(e){}
  }
}
function checkKalenderReminders(){
  try{
    if(!db || !Array.isArray(db.kalender)) return;
    const now = new Date();
    const notified = kalGetNotifiedSet();
    let changed = false;
    db.kalender.forEach(entry=>{
      if(entry.pengingatAktif!=="Ya" || !entry.pengingatJam) return;
      const key = kalNotifiedKey(entry.id);
      if(notified.has(key)) return;
      const [hh,mm] = String(entry.pengingatJam).split(":").map(n=>parseInt(n,10)||0);
      const target = new Date(entry.tanggal+"T00:00:00");
      target.setHours(hh, mm, 0, 0);
      target.setMinutes(target.getMinutes() - (parseInt(entry.pengingatMenit,10)||0));
      const diffMs = now - target;
      // Jendela toleransi 3 menit sejak waktu target agar tidak terlewat walau interval cek 60 detik.
      if(diffMs >= 0 && diffMs <= 3*60*1000){
        kalTriggerReminder(entry);
        notified.add(key); changed = true;
      }
    });
    if(changed) kalSaveNotifiedSet(notified);
  }catch(e){ console.warn("Gagal memeriksa pengingat kaldik.", e); }
}

