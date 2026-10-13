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
  const today=todayISO(), cls=classInfo(activeClassId), total=db.siswa.length;
  const summary=attendanceSummary(db.siswa,db.kehadiran[today]);
  const marked=total-summary.unmarked, pct=total ? Math.round(marked/total*100) : 0;
  const upcoming=db.kalender.filter(e=>e.tanggal>=today).sort((a,b)=>a.tanggal.localeCompare(b.tanggal)).slice(0,5);
  const todayEvents=db.kalender.filter(e=>e.tanggal===today);
  const journals=db.agenda.filter(e=>e.tanggal && e.tanggal<=today).sort((a,b)=>b.tanggal.localeCompare(a.tanggal)).slice(0,3);
  const day=new Date().toLocaleDateString('id-ID',{weekday:'long'});
  const schedule=(db.jadwal[day]||[]).slice().sort((a,b)=>String(a.jam||'').localeCompare(String(b.jam||''),undefined,{numeric:true}));
  const dateLabel=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const teacher=db.guru.find(g=>g.id===db.sekolah.waliKelasId);
  const pip=rekapPIP();
  const tools=[
    {id:'siswa',icon:'student',title:'Data siswa',desc:'Identitas & buku induk',tone:'indigo'},
    {id:'kehadiran',icon:'attendance',title:'Kehadiran',desc:'Catat hadir hari ini',tone:'teal'},
    {id:'inputnilai',icon:'bar',title:'Input nilai',desc:'Asesmen & rekap nilai',tone:'coral'},
    {id:'agenda',icon:'book',title:'Jurnal mengajar',desc:'Catat kegiatan harian',tone:'amber'},
    {id:'modulajar',icon:'clipboard',title:'Perangkat ajar',desc:'Rencana pembelajaran',tone:'blue'},
    {id:'aiDashboard',icon:'star',title:'Pusat AI Guru',desc:'Susun draf lebih cepat',tone:'violet'}
  ];
  window.dashRefresh=()=>{ if(currentPage==='dashboard') renderPage('dashboard'); };
  return `<section class="dashboard-hero">
    <div class="hero-copy"><span class="hero-eyebrow">RUANG KERJA ANDA <span class="hero-dot"></span> ${escapeHtml(cls.label)} · Fase ${faseForClassId(activeClassId)}</span>
      <h1>Selamat datang${teacher?', '+escapeHtml(teacher.nama.split(',')[0]):''}!<br><span>Siap menginspirasi hari ini?</span></h1>
      <p>Administrasi tertata, lebih banyak waktu untuk murid.</p>
      <div class="hero-actions"><button class="btn hero-btn" onclick="navigate('kehadiran')">${ic('attendance',18)} Isi kehadiran</button><button class="btn hero-btn-secondary" onclick="navigate('aiModul')">${ic('star',18)} Buat modul AI</button></div>
    </div>${workspaceHeroArt()}
    <div class="hero-date">${ic('calendar',15)} ${escapeHtml(dateLabel)}</div>
  </section>
  <div class="dashboard-context"><span>${ic('school',16)} ${escapeHtml(db.sekolah.namaSekolah)}</span><span>T.A. ${escapeHtml(db.sekolah.tahunAjaran)} · Semester ${escapeHtml(db.sekolah.semester)}</span></div>
  <div class="workspace-metrics">
    <article class="metric-card tone-indigo"><span class="metric-icon">${ic('student',22)}</span><div><span class="metric-label">Siswa aktif</span><strong>${total}</strong><small>${db.siswa.filter(s=>s.jk==='L').length} laki-laki · ${db.siswa.filter(s=>s.jk==='P').length} perempuan</small></div></article>
    <article class="metric-card tone-teal"><span class="metric-icon">${ic('attendance',22)}</span><div><span class="metric-label">Hadir hari ini</span><strong>${summary.H}<span> / ${total}</span></strong><small>${summary.unmarked ? summary.unmarked+' belum diisi' : (total?'Semua status tercatat':'Belum ada siswa')}</small></div></article>
    <article class="metric-card tone-amber"><span class="metric-icon">${ic('calendar',22)}</span><div><span class="metric-label">Agenda hari ini</span><strong>${todayEvents.length}</strong><small>${todayEvents.length?'Ada kegiatan terjadwal':'Belum ada kegiatan'}</small></div></article>
    <article class="metric-card tone-coral"><span class="metric-icon">${ic('clipboard',22)}</span><div><span class="metric-label">Modul ajar</span><strong>${db.modulAjar.length}</strong><small>Perangkat tersimpan</small></div></article>
  </div>
  <div class="dashboard-heading"><div><h2>Akses cepat</h2><p>Mulai dari pekerjaan yang paling sering Anda lakukan.</p></div><button class="text-btn" onclick="openMenuSearch()">Semua fitur ${ic('chevronRight',16)}</button></div>
  <div class="workspace-tools">${tools.map(t=>`<button class="workspace-tool tone-${t.tone}" onclick="navigate('${t.id}')"><span class="tool-icon">${ic(t.icon,23)}</span><strong>${t.title}</strong><small>${t.desc}</small><span class="tool-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
  <div class="dashboard-columns">
    <section class="card today-card"><div class="dashboard-card-head"><div><span class="card-eyebrow">KEGIATAN BELAJAR</span><h2>Jadwal ${escapeHtml(day)}</h2></div><button class="text-btn" onclick="navigate('jadwal')">Lihat jadwal ${ic('chevronRight',16)}</button></div>
      ${schedule.length?`<div class="schedule-list">${schedule.map((j,i)=>`<div class="schedule-row"><span class="schedule-dot tone-${['indigo','teal','amber','coral'][i%4]}"></span><div><strong>${escapeHtml(j.mapel||'-')}</strong><span>${escapeHtml(String(j.jam||'-'))}</span></div><span class="schedule-number">${String(i+1).padStart(2,'0')}</span></div>`).join('')}</div>`:`<div class="workspace-empty">${illus('dokumen',90)}<strong>Belum ada jadwal hari ini</strong><span>Atur jadwal agar kegiatan belajar lebih tertata.</span><button class="btn" onclick="navigate('jadwal')">Atur jadwal</button></div>`}
    </section>
    <div class="dashboard-side">
      <section class="card attendance-card"><div class="dashboard-card-head"><div><span class="card-eyebrow">KEHADIRAN HARI INI</span><h2>${total?marked+' dari '+total+' tercatat':'Belum ada siswa'}</h2></div><span class="attendance-percent">${pct}%</span></div>
        <div class="attendance-progress" role="progressbar" aria-label="Status kehadiran tercatat" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
        <div class="attendance-legend"><span><i class="legend-h"></i>Hadir <strong>${summary.H}</strong></span><span><i class="legend-s"></i>Sakit <strong>${summary.S}</strong></span><span><i class="legend-i"></i>Izin <strong>${summary.I}</strong></span><span><i class="legend-a"></i>Alfa <strong>${summary.A}</strong></span></div>
        <p class="hint">${summary.unmarked?summary.unmarked+' siswa belum memiliki status kehadiran.':'Status kehadiran sesuai pencatatan guru.'}</p><button class="btn attendance-action" onclick="navigate('kehadiran')">${ic('edit',17)} Kelola kehadiran ${ic('chevronRight',17)}</button>
      </section>
      <section class="ai-banner"><span class="ai-banner-icon">${ic('star',25)}</span><span class="card-eyebrow">ASISTEN PEMBELAJARAN</span><h2>Ide Anda, dibantu AI.</h2><p>Dari CP ke TP, modul ajar, hingga asesmen. Guru tetap menelaah setiap draf.</p><button class="btn" onclick="navigate('aiDashboard')">Jelajahi Pusat AI ${ic('chevronRight',17)}</button></section>
    </div>
  </div>
  <div class="dashboard-columns dashboard-secondary">
    <section class="card"><div class="dashboard-card-head"><div><span class="card-eyebrow">KALENDER PENDIDIKAN</span><h2>Agenda mendatang</h2></div><button class="text-btn" onclick="navigate('kalender')">Kalender ${ic('chevronRight',16)}</button></div>
      ${upcoming.length?upcoming.map(e=>`<div class="agenda-row"><span class="agenda-date"><strong>${escapeHtml(String(Number(e.tanggal.slice(8,10))))}</strong><small>${escapeHtml(new Date(e.tanggal+'T00:00:00').toLocaleDateString('id-ID',{month:'short'}))}</small></span><div><strong>${escapeHtml(e.judul)}</strong><small>${escapeHtml(e.jenis||'Agenda')} · ${fmtDate(e.tanggal)}</small></div></div>`).join(''):`<p class="muted">Belum ada agenda. Tambahkan kegiatan di kalender pendidikan.</p>`}
    </section>
    <section class="card"><div class="dashboard-card-head"><div><span class="card-eyebrow">CATATAN MENGAJAR</span><h2>Jurnal terbaru</h2></div><button class="text-btn" onclick="navigate('agenda')">Jurnal ${ic('chevronRight',16)}</button></div>
      ${journals.length?journals.map(j=>`<div class="journal-row"><span class="journal-icon">${ic('book',18)}</span><div><strong>${fmtDate(j.tanggal)}</strong><small>${escapeHtml((j.kegiatan||j.materi||j.mapel||'Catatan pembelajaran').slice(0,100))}</small></div></div>`).join(''):`<div class="workspace-empty compact">${ic('book',30)}<strong>Belum ada jurnal kegiatan</strong><span>Catat pembelajaran hari ini untuk bahan refleksi.</span><button class="btn" onclick="navigate('agenda')">Tulis jurnal</button></div>`}
    </section>
  </div>
  <details class="card academic-settings"><summary>${ic('calendar',18)} Tahun pelajaran & semester <span>${escapeHtml(db.sekolah.tahunAjaran)}</span></summary><div class="form-grid">
    <div class="field"><label for="berandaTahunAjaran">Tahun Pelajaran Aktif</label><select id="berandaTahunAjaran" onchange="updateTahunSemesterBeranda()">${taGenerateOptions().map(t=>`<option ${t===db.sekolah.tahunAjaran?'selected':''}>${escapeHtml(t)}</option>`).join('')}</select></div>
    <div class="field"><label for="berandaSemester">Semester Aktif</label><select id="berandaSemester" onchange="updateTahunSemesterBeranda()">${taSemesterOptions().map(s=>`<option value="${escapeHtml(s)}" ${s===db.sekolah.semester?'selected':''}>Semester ${escapeHtml(s)}</option>`).join('')}</select></div>
    </div><p class="hint">Dipakai bersama pada profil sekolah, kop surat, program pembelajaran, dan rapor.</p></details>
  <details class="card school-summary"><summary>${ic('bar',18)} Ringkasan sekolah & pembinaan</summary><div class="school-summary-grid">${CLASS_LIST.map(c=>{const n=(c.id===activeClassId?db:loadClassDB(c.id)).siswa.length;return `<button class="class-summary ${c.id===activeClassId?'active':''}" onclick="switchActiveClass('${c.id}')"><small>${c.id===activeClassId?'Kelas aktif':'Pindah kelas'}</small><strong>${c.label}</strong><span>${n} siswa</span></button>`;}).join('')}</div><div class="school-links">${[{id:'perkembangan',label:'Catatan perkembangan',icon:'heart'},{id:'analisisnilai',label:'Analisis nilai',icon:'target'},{id:'pekerjaanOrtu',label:'Pekerjaan orang tua',icon:'users'},{id:'backup',label:'Backup & sinkronisasi',icon:'backup'},{id:'guru',label:(db.guru.length+db.tendik.length)+' guru & tendik',icon:'school'}].map(item=>`<button class="btn" onclick="navigate('${item.id}')">${ic(item.icon,16)} ${item.label}</button>`).join('')}</div><p class="hint">Dimensi Profil Lulusan: ${DIMENSI_PROFIL.map(d=>escapeHtml(d.nama)).join(' · ')}.</p></details>
  <details class="card school-summary"><summary>${ic('star',18)} Rekap Program Indonesia Pintar</summary><div class="pip-summary"><div><span>Penerima (KIP)</span><strong>${pip.penerima}</strong></div><div><span>Usulan sekolah</span><strong>${pip.usulan}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Kategori usulan</th><th>Jumlah</th></tr></thead><tbody>${Object.entries(pip.byKategori).map(([label,n])=>`<tr><td>${escapeHtml(label)}</td><td>${n}</td></tr>`).join('')||'<tr><td colspan="2">Belum ada usulan tercatat.</td></tr>'}</tbody></table></div><p class="hint">Rekap seluruh kelas berdasarkan Buku Induk; satu usulan dapat memiliki beberapa kategori.</p></details>
  <footer class="workspace-footer"><span>AdminGuru <strong>· Edukreativa By Anggi</strong></span><span>Data administrasi tersimpan di perangkat ini.</span></footer>`;
};

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
      <button class="btn btn-sm btn-icon" title="Buku Induk Siswa" onclick="bukuIndukDetail('${s.id}')">${ic("book",15)}</button>
      <button class="btn btn-sm btn-icon" title="Pindah Kelas" onclick="pindahSiswaKelas('${s.id}')">${ic("users",15)}</button>
      <button class="btn btn-sm btn-icon" title="Siswa Keluar / Mutasi Keluar" style="color:var(--danger);" onclick="prosesSiswaKeluar('${s.id}')">${ic("guest",15)}</button>
      <button class="btn btn-sm btn-icon btn-danger" title="Hapus" onclick="deleteSiswa('${s.id}')">${ic("trash",15)}</button>
    </div></td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Data Siswa</h1><div class="desc">${escapeHtml(classInfo(activeClassId).label)} &middot; ${db.siswa.length} siswa terdaftar.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportSiswaCSV()">${ic("download",15)} CSV</button>
    <button class="btn" style="border-color:var(--primary);color:var(--primary);" onclick="downloadSiswaTemplateCSV()">${ic("doc",15)} Unduh Template CSV</button>
    <button class="btn" style="border-color:#2E75B6;color:#2E75B6;" onclick="downloadBITemplate()">${ic("book",15)} Template Buku Induk</button>
    <button class="btn" style="border-color:var(--accent);color:var(--accent);" onclick="openBIUpload()">${ic("upload",15)} Unggah Pembaruan</button>
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

/* ============================================================
   BUKU INDUK — terintegrasi dalam Data Siswa (bukan berkas/halaman terpisah).
   Dibuka sebagai modal dari halaman Data Siswa.
   ============================================================
/* ============================================================
   BUKU INDUK SISWA 2026 (v2.5)
   - Struktur mengikuti format Buku Induk resmi: A. Pribadi,
     B. Tempat Tinggal, C. Kesehatan, D. Pendidikan,
     E. Ayah, F. Ibu, G. Wali, H. PIP/KIP.
   - Data awal dari Dapodik 7 Sep 2026 (SEED_BI per kelas).
   - Migrasi SEKALI JALAN: cocokkan berdasar nama (normalisasi),
     pertahankan ID lama agar data absensi & nilai tidak putus.
   ============================================================ */

/* Migrasi SEKALI JALAN: data Dapodik 2026 (SEED_BI) adalah sumber utama.
   Cocokkan berdasar nama ternormalisasi untuk mempertahankan ID lama
   (agar data absensi & nilai tidak putus). Siswa lama yang tidak cocok
   dengan Dapodik dianggap data usang dan diganti. */
/* Ekspansi SEED_BI_TXT (string delimited "|") -> objek siswa lengkap.
   Urutan field: nama|jk|nis|nisn|ttl|agama|alamat|ayahNama|ibuNama|pekAyah|
   nik|noKK|tempatLahir|tglLahir|rt|rw|dusun|kel|kec|kodePos|jenisTinggal|transportasi|
   telp|hp|anakKe|jmlSdr|bb|tb|lk|jarak|khusus|sekolahAsal|
   aNama|aThn|aPend|aPek|aHasil|aNik| iNama|iThn|iPend|iPek|iHasil|iNik|
   wNama|wThn|wPend|wPek|wHasil|wNik| kip|noKIP|noKKS|layakPIP|alasanPIP */
function biExpandOrtu(f, o){
  return {nama:f[o]||"", tahunLahir:f[o+1]||"", pendidikan:f[o+2]||"", pekerjaan:f[o+3]||"",
          penghasilan:f[o+4]||"", nik:f[o+5]||"", agama:"Islam", wn:"Indonesia", alamat:"", hp:""};
}
function biExpandSeed(){
  const out = {};
  if(typeof SEED_BI_TXT === "undefined") return out;
  Object.keys(SEED_BI_TXT).forEach(kelas=>{
    out[kelas] = SEED_BI_TXT[kelas].map((line, i)=>{
      const f = line.split("|");
      while(f.length < 55) f.push("");
      const ayah = biExpandOrtu(f, 32), ibu = biExpandOrtu(f, 38);
      return {
        id: "bi" + kelas.replace("kelas-","") + "_" + i,
        no: i+1, nama: f[0], jk: f[1], nis: f[2], nisn: f[3],
        ttl: f[4], agama: f[5]||"Islam", alamat: f[6],
        ayah: f[7]||ayah.nama, ibu: f[8]||ibu.nama, pekerjaanOrtu: f[9]||ayah.pekerjaan,
        bi: {nik:f[10], noKK:f[11], tempatLahir:f[12], tanggalLahir:f[13],
             rt:f[14], rw:f[15], dusun:f[16], kelurahan:f[17],
             kecamatan:f[18], kodePos:f[19], jenisTinggal:f[20],
             transportasi:f[21], telepon:f[22], hp:f[23],
             anakKe:f[24], jmlSaudara:f[25], beratBadan:f[26],
             tinggiBadan:f[27], lingkarKepala:f[28], jarakSekolah:f[29],
             kebutuhanKhusus:f[30], sekolahAsal:f[31],
             ayah:ayah, ibu:ibu, wali:biExpandOrtu(f, 44),
             penerimaKIP:f[50], nomorKIP:f[51], nomorKKS:f[52],
             layakPIP:f[53], alasanPIP:f[54],
             wn:"Indonesia", tinggalBersama:"Orang Tua"}
      };
    });
  });
  return out;
}
const BI_SEED_FLAG = "tpsd2026_bukuinduk_seed_v3";

function biNormNama(n){
  return String(n||"").toLowerCase().replace(/[^a-z\s]/g,"").replace(/\s+/g," ").trim();
}

function runBukuIndukSeedIfNeeded(){
  if(typeof SEED_BI_TXT === "undefined") return;
  if(localStorage.getItem(BI_SEED_FLAG)) return;
  try{
    const SEED_BI = biExpandSeed();
    Object.keys(SEED_BI).forEach(classId=>{
      const cls = loadClassDB(classId);
      cls.siswa = cls.siswa || [];
      // index siswa lama berdasar nama ternormalisasi
      const lamaByNama = {};
      cls.siswa.forEach(s=>{ lamaByNama[biNormNama(s.nama)] = s; });
      const dipakai = new Set();
      const hasil = [];
      SEED_BI[classId].forEach((baru, i)=>{
        const key = biNormNama(baru.nama);
        const lama = lamaByNama[key];
        if(lama && !dipakai.has(lama.id)){
          // update di tempat: pertahankan id & no absen lama bila ada
          dipakai.add(lama.id);
          const noLama = lama.no;
          Object.assign(lama, baru, {id: lama.id});
          if(noLama) lama.no = noLama; else lama.no = i+1;
          hasil.push(lama);
        } else {
          baru.id = uid("s");
          baru.no = i+1;
          hasil.push(baru);
        }
      });
      // Siswa lama yang tidak cocok dengan Dapodik dianggap data usang
      // dan TIDAK dibawa (Dapodik adalah sumber utama). ID lama
      // dipertahankan hanya bila nama cocok, agar absensi & nilai tidak putus.
      // nomor urut ulang berdasar abjad
      hasil.sort((a,b)=>(a.nama||"").localeCompare(b.nama||""));
      hasil.forEach((s,i)=>{ s.no = i+1; });
      cls.siswa = hasil;
      saveClassDB(classId, cls);
    });
    // sinkronkan kelas aktif ke memori
    db = loadClassDB(activeClassId);
  }catch(e){ console.warn("Gagal migrasi Buku Induk.", e); }
  localStorage.setItem(BI_SEED_FLAG, "1");
}

/* ---------- Kategori PIP (Permendikdasmen No. 11/2026) ---------- */
function pipKategoriSiswa(s){
  const bi = s.bi || {};
  const cats = [];
  if(String(bi.penerimaKIP||"").toLowerCase()==="ya" || bi.nomorKIP) cats.push("Pemegang KIP");
  if(bi.nomorKKS) cats.push("Pemegang KKS");
  const alasan = String(bi.alasanPIP||"");
  if(/miskin/i.test(alasan)) cats.push("Keluarga Miskin/Rentan Miskin");
  if(/PKH|KPS|KKS/i.test(alasan)) cats.push("PKH/KPS/KKS");
  const ayahWafat = /meninggal/i.test(String(bi.ayah&&bi.ayah.pekerjaan||"")) || !((bi.ayah&&bi.ayah.nama)||"").trim();
  const ibuWafat = /meninggal/i.test(String(bi.ibu&&bi.ibu.pekerjaan||"")) || !((bi.ibu&&bi.ibu.nama)||"").trim();
  if(ayahWafat && ibuWafat) cats.push("Yatim Piatu");
  else if(ayahWafat) cats.push("Yatim");
  else if(ibuWafat) cats.push("Piatu");
  if(bi.kebutuhanKhusus && !/^(tidak ada|tidak|-)$/i.test(String(bi.kebutuhanKhusus).trim())) cats.push("Kebutuhan Khusus");
  const jmlSdr = parseInt(bi.jmlSaudara||"0",10);
  if(jmlSdr > 3) cats.push("Saudara > 3 orang");
  return cats;
}
function pipStatusSiswa(s){
  const bi = s.bi || {};
  const penerima = String(bi.penerimaKIP||"").toLowerCase()==="ya" || !!bi.nomorKIP;
  const usulan = String(bi.layakPIP||"").toLowerCase()==="ya";
  if(penerima) return {label:"Penerima", cls:"badge-green"};
  if(usulan) return {label:"Usulan", cls:"badge-orange"};
  return {label:"-", cls:"badge-gray"};
}

/* ---------- Rekap untuk Dashboard ---------- */
function rekapPekerjaanOrtu(){
  const all = [];
  CLASS_LIST.forEach(c=>{
    const cls = loadClassDB(c.id);
    (cls.siswa||[]).forEach(s=>{
      const bi = s.bi || {};
      if(bi.ayah && bi.ayah.pekerjaan) all.push({ortu:"Ayah", pekerjaan:bi.ayah.pekerjaan});
      if(bi.ibu && bi.ibu.pekerjaan) all.push({ortu:"Ibu", pekerjaan:bi.ibu.pekerjaan});
    });
  });
  const map = {};
  all.forEach(e=>{
    const k = e.pekerjaan;
    map[k] = map[k] || {pekerjaan:k, ayah:0, ibu:0, total:0};
    map[k][e.ortu==="Ayah"?"ayah":"ibu"]++;
    map[k].total++;
  });
  return Object.values(map).sort((a,b)=>b.total-a.total);
}
function rekapPIP(){
  let penerima = 0, usulan = 0;
  const byKategori = {};
  const daftarUsulan = [];
  CLASS_LIST.forEach(c=>{
    const cls = loadClassDB(c.id);
    (cls.siswa||[]).forEach(s=>{
      const bi = s.bi || {};
      const isPenerima = String(bi.penerimaKIP||"").toLowerCase()==="ya" || !!bi.nomorKIP;
      const isUsulan = String(bi.layakPIP||"").toLowerCase()==="ya";
      if(isPenerima) penerima++;
      if(isUsulan){
        usulan++;
        const cats = pipKategoriSiswa(s);
        cats.forEach(k=>{ byKategori[k] = (byKategori[k]||0)+1; });
        daftarUsulan.push({nama:s.nama, kelas:c.label, kategori:cats.join(", ")||"-", alasan:bi.alasanPIP||"-"});
      }
    });
  });
  return {penerima, usulan, byKategori, daftarUsulan};
}

/* ---------- FORM BUKU INDUK ---------- */
function biField(label, id, val, type){
  type = type || "text";
  return `<div class="field"><label>${label}</label><input type="${type}" id="${id}" value="${escapeHtml(val||"")}"></div>`;
}
function biSelect(label, id, val, opts){
  return `<div class="field"><label>${label}</label><select id="${id}">`
    + opts.map(o=>`<option value="${escapeHtml(o)}" ${String(val||"")===o?"selected":""}>${escapeHtml(o)}</option>`).join("")
    + `</select></div>`;
}
function biOrtuSection(prefix, title, d){
  d = d || {};
  return `<div class="card" style="margin-bottom:14px;"><h3 style="font-size:14px;margin-bottom:10px;">${title}</h3>
  <div class="grid grid-2">
    ${biField("Nama Lengkap", "bi_"+prefix+"_nama", d.nama)}
    ${biField("Tahun Lahir", "bi_"+prefix+"_tahun", d.tahunLahir, "number")}
    ${biSelect("Agama", "bi_"+prefix+"_agama", d.agama||"Islam", ["Islam","Kristen","Katolik","Hindu","Buddha","Konghucu"])}
    ${biField("Kewarganegaraan", "bi_"+prefix+"_wn", d.wn||"Indonesia")}
    ${biSelect("Pendidikan", "bi_"+prefix+"_pendidikan", d.pendidikan, ["","Tidak Sekolah","SD","SMP","SMA/SMK","D1","D2","D3","S1","S2","S3"])}
    ${biSelect("Pekerjaan", "bi_"+prefix+"_pekerjaan", d.pekerjaan, ["","Tidak bekerja","Mengurus Rumah Tangga","Petani","Buruh","Karyawan Swasta","Wiraswasta","Pedagang Kecil","PNS/TNI/Polri","Pensiunan","Lainnya","Sudah Meninggal"])}
    ${biField("Penghasilan / Bulan", "bi_"+prefix+"_penghasilan", d.penghasilan)}
    ${biField("NIK", "bi_"+prefix+"_nik", d.nik)}
  </div>
  ${biField("Alamat", "bi_"+prefix+"_alamat", d.alamat)}
  ${biField("No. Telepon/HP", "bi_"+prefix+"_hp", d.hp)}
  </div>`;
}

function bukuIndukFormHtml(siswaId){
  const s = (db.siswa||[]).find(x=>x.id===siswaId);
  if(!s) return `<div class="empty-state">Siswa tidak ditemukan.</div>`;
  const bi = s.bi || {};
  const ayah = bi.ayah||{}, ibu = bi.ibu||{}, wali = bi.wali||{};
  return `

  <div class="card" style="margin-bottom:14px;"><h3 style="font-size:14px;margin-bottom:10px;">A. Keterangan Pribadi</h3>
    <div class="grid grid-2">
      ${biField("Nama Lengkap (sesuai akta)", "bi_nama", s.nama)}
      ${biField("Nama Panggilan", "bi_panggilan", bi.panggilan)}
      ${biSelect("Jenis Kelamin", "bi_jk", s.jk, ["L","P"])}
      ${biField("NIS / NIPD", "bi_nis", s.nis)}
      ${biField("NISN", "bi_nisn", s.nisn)}
      ${biField("NIK Siswa", "bi_nik", bi.nik)}
      ${biField("No. KK", "bi_nokk", bi.noKK)}
      ${biField("Tempat Lahir", "bi_tempat", bi.tempatLahir)}
      ${biField("Tanggal Lahir", "bi_tgllahir", bi.tanggalLahir, "date")}
      ${biSelect("Agama", "bi_agama", s.agama||"Islam", ["Islam","Kristen","Katolik","Hindu","Buddha","Konghucu"])}
      ${biField("Kewarganegaraan", "bi_wn", bi.wn||"Indonesia")}
      ${biField("Anak Ke-", "bi_anakke", bi.anakKe, "number")}
      ${biField("Jumlah Saudara Kandung", "bi_jmlsdr", bi.jmlSaudara, "number")}
      ${biSelect("Status", "bi_statusyatim", bi.statusYatim||"-", ["-","Yatim","Piatu","Yatim Piatu"])}
      ${biField("Bahasa Sehari-hari", "bi_bahasa", bi.bahasa||"Indonesia")}
      ${biField("Kebutuhan Khusus", "bi_khusus", bi.kebutuhanKhusus)}
    </div>
  </div>

  <div class="card" style="margin-bottom:14px;"><h3 style="font-size:14px;margin-bottom:10px;">B. Keterangan Tempat Tinggal</h3>
    <div class="grid grid-2">
      ${biField("Alamat", "bi_alamat", s.alamat)}
      ${biField("RT", "bi_rt", bi.rt)} ${biField("RW", "bi_rw", bi.rw)}
      ${biField("Dusun", "bi_dusun", bi.dusun)}
      ${biField("Kelurahan/Desa", "bi_kel", bi.kelurahan)}
      ${biField("Kecamatan", "bi_kec", bi.kecamatan)}
      ${biField("Kode Pos", "bi_kodepos", bi.kodePos)}
      ${biField("No. Telepon", "bi_telp", bi.telepon)}
      ${biField("No. HP", "bi_hp", bi.hp)}
      ${biSelect("Tinggal Bersama", "bi_tinggal", bi.tinggalBersama||"Orang Tua", ["Orang Tua","Saudara","Wali","Asrama","Kost","Lainnya"])}
      ${biField("Jarak ke Sekolah (km)", "bi_jarak", bi.jarakSekolah)}
      ${biSelect("Transportasi", "bi_transport", bi.transportasi, ["","Jalan Kaki","Sepeda","Sepeda Motor","Mobil Pribadi","Antar Jemput","Angkutan Umum","Lainnya"])}
    </div>
  </div>

  <div class="card" style="margin-bottom:14px;"><h3 style="font-size:14px;margin-bottom:10px;">C. Keterangan Kesehatan</h3>
    <div class="grid grid-2">
      ${biField("Berat Badan (kg)", "bi_bb", bi.beratBadan)}
      ${biField("Tinggi Badan (cm)", "bi_tb", bi.tinggiBadan)}
      ${biField("Lingkar Kepala (cm)", "bi_lk", bi.lingkarKepala)}
      ${biSelect("Golongan Darah", "bi_goldar", bi.golDarah||"-", ["-","A","B","AB","O"])}
      ${biField("Penyakit yang Pernah Diderita", "bi_penyakit", bi.penyakit)}
      ${biField("Kelainan Jasmani", "bi_kelainan", bi.kelainan)}
    </div>
  </div>

  <div class="card" style="margin-bottom:14px;"><h3 style="font-size:14px;margin-bottom:10px;">D. Keterangan Pendidikan</h3>
    <div class="grid grid-2">
      ${biField("Sekolah Asal", "bi_sekolahasal", bi.sekolahAsal)}
      ${biField("Diterima di Kelas", "bi_diterimakelas", bi.diterimaKelas||classInfo(activeClassId).label)}
      ${biField("Tanggal Diterima", "bi_diterimatgl", bi.diterimaTanggal, "date")}
    </div>
  </div>

  ${biOrtuSection("ayah", "E. Keterangan Ayah Kandung", ayah)}
  ${biOrtuSection("ibu", "F. Keterangan Ibu Kandung", ibu)}
  ${biOrtuSection("wali", "G. Keterangan Wali", wali)}

  <div class="card" style="margin-bottom:14px;"><h3 style="font-size:14px;margin-bottom:10px;">H. Keterangan PIP / KIP</h3>
    <div class="grid grid-2">
      ${biSelect("Penerima KIP", "bi_kip", bi.penerimaKIP||"Tidak", ["Tidak","Ya"])}
      ${biField("Nomor KIP", "bi_nokip", bi.nomorKIP)}
      ${biField("Nomor KKS", "bi_nokks", bi.nomorKKS)}
      ${biSelect("Layak PIP (usulan sekolah)", "bi_layakpip", bi.layakPIP||"Tidak", ["Tidak","Ya"])}
      ${biSelect("Alasan Layak PIP", "bi_alasanpip", bi.alasanPIP, ["","Siswa Miskin/Rentan Miskin","Pemegang PKH/KPS/KKS","Yatim/Piatu/Yatim Piatu","Korban Bencana","Putus Sekolah Lanjut Kembali","Kebutuhan Khusus/Disabilitas","Keluarga PHK","Daerah Konflik","Saudara Kandung > 3"])}
    </div>
  </div>

`;
}

function biVal(id){ const el = document.getElementById(id); return el ? el.value.trim() : ""; }

function saveBukuInduk(siswaId){
  const cls = loadClassDB(activeClassId);
  const s = (cls.siswa||[]).find(x=>x.id===siswaId);
  if(!s){ toast("Siswa tidak ditemukan."); return; }
  const g = p => ({
    nama: biVal("bi_"+p+"_nama"), tahunLahir: biVal("bi_"+p+"_tahun"),
    agama: biVal("bi_"+p+"_agama"), wn: biVal("bi_"+p+"_wn"),
    pendidikan: biVal("bi_"+p+"_pendidikan"), pekerjaan: biVal("bi_"+p+"_pekerjaan"),
    penghasilan: biVal("bi_"+p+"_penghasilan"), nik: biVal("bi_"+p+"_nik"),
    alamat: biVal("bi_"+p+"_alamat"), hp: biVal("bi_"+p+"_hp")
  });
  // update field utama
  s.nama = biVal("bi_nama") || s.nama;
  s.jk = biVal("bi_jk") || s.jk;
  s.nis = biVal("bi_nis");
  s.nisn = biVal("bi_nisn");
  s.agama = biVal("bi_agama");
  s.alamat = biVal("bi_alamat");
  const tempat = biVal("bi_tempat"), tgl = biVal("bi_tgllahir");
  if(tempat || tgl) s.ttl = (tempat||"") + (tempat&&tgl?", ":"") + (tgl?fmtDate(tgl):"");
  const ayah = g("ayah"), ibu = g("ibu");
  s.ayah = ayah.nama || s.ayah;
  s.ibu = ibu.nama || s.ibu;
  s.pekerjaanOrtu = ayah.pekerjaan || s.pekerjaanOrtu;
  // update buku induk
  s.bi = Object.assign(s.bi||{}, {
    panggilan: biVal("bi_panggilan"),
    nik: biVal("bi_nik"), noKK: biVal("bi_nokk"),
    tempatLahir: tempat, tanggalLahir: tgl,
    wn: biVal("bi_wn"), anakKe: biVal("bi_anakke"),
    jmlSaudara: biVal("bi_jmlsdr"), statusYatim: biVal("bi_statusyatim"),
    bahasa: biVal("bi_bahasa"), kebutuhanKhusus: biVal("bi_khusus"),
    rt: biVal("bi_rt"), rw: biVal("bi_rw"), dusun: biVal("bi_dusun"),
    kelurahan: biVal("bi_kel"), kecamatan: biVal("bi_kec"), kodePos: biVal("bi_kodepos"),
    telepon: biVal("bi_telp"), hp: biVal("bi_hp"),
    tinggalBersama: biVal("bi_tinggal"), jarakSekolah: biVal("bi_jarak"),
    transportasi: biVal("bi_transport"),
    beratBadan: biVal("bi_bb"), tinggiBadan: biVal("bi_tb"),
    lingkarKepala: biVal("bi_lk"), golDarah: biVal("bi_goldar"),
    penyakit: biVal("bi_penyakit"), kelainan: biVal("bi_kelainan"),
    sekolahAsal: biVal("bi_sekolahasal"),
    diterimaKelas: biVal("bi_diterimakelas"), diterimaTanggal: biVal("bi_diterimatgl"),
    ayah: ayah, ibu: ibu, wali: g("wali"),
    penerimaKIP: biVal("bi_kip"), nomorKIP: biVal("bi_nokip"),
    nomorKKS: biVal("bi_nokks"),
    layakPIP: biVal("bi_layakpip"), alasanPIP: biVal("bi_alasanpip")
  });
  saveClassDB(activeClassId, cls);
  db = cls;
  toast("Buku Induk tersimpan.");
  closeModal();
  renderPage("siswa");
}
function openBukuInduk(siswaId){
  const html = bukuIndukFormHtml(siswaId);
  openModal({title:"Buku Induk Siswa", bodyHtml:html,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveBukuInduk('${siswaId}')">${ic("check",15)} Simpan</button>`});
}

/* ---------- CETAK / LIHAT BUKU INDUK ---------- */
function bukuIndukDetail(siswaId){
  const s0 = (db.siswa||[]).find(x=>x.id===siswaId);
  const html = bukuIndukLihatHtml(siswaId);
  openModal({title:"Buku Induk — " + ((s0&&s0.nama)||""),
    bodyHtml:`<div style="max-height:70vh;overflow:auto;">${html}</div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Tutup</button>
      <button class="btn" onclick="closeModal();openBukuInduk('${siswaId}')">${ic("edit",15)} Ubah</button>
      <button class="btn btn-primary" onclick="printBukuInduk('${siswaId}')">${ic("print",15)} Cetak</button>`});
}
function biRow(no, label, val){
  return `<tr><td style="width:36px;">${no}</td><td style="width:38%;">${label}</td><td>${escapeHtml(val||"-")}</td></tr>`;
}
function bukuIndukLihatHtml(siswaId){
  const s = (db.siswa||[]).find(x=>x.id===siswaId);
  if(!s) return `<div class="empty-state">Siswa tidak ditemukan.</div>`;
  const bi = s.bi||{}, ayah = bi.ayah||{}, ibu = bi.ibu||{}, wali = bi.wali||{};
  const pip = pipStatusSiswa(s);
  const cats = pipKategoriSiswa(s);
  const ortuRows = (t, d) => `
    <tr><td colspan="3" style="background:var(--primary-ghost);font-weight:800;">${t}</td></tr>
    ${biRow("", "Nama", d.nama)}${biRow("", "Tahun Lahir", d.tahunLahir)}
    ${biRow("", "Agama", d.agama)}${biRow("", "Kewarganegaraan", d.wn)}
    ${biRow("", "Pendidikan", d.pendidikan)}${biRow("", "Pekerjaan", d.pekerjaan)}
    ${biRow("", "Penghasilan/Bulan", d.penghasilan)}${biRow("", "NIK", d.nik)}`;
  return `
  <div class="card" style="margin:0;"><div class="table-wrap"><table>
    <tr><td colspan="3" style="background:var(--primary-ghost);font-weight:800;">A. KETERANGAN PRIBADI</td></tr>
    ${biRow(1,"Nama Lengkap",s.nama)}${biRow(2,"Nama Panggilan",bi.panggilan)}
    ${biRow(3,"Jenis Kelamin",s.jk==="L"?"Laki-laki":"Perempuan")}
    ${biRow(4,"NIS / NIPD",s.nis)}${biRow(5,"NISN",s.nisn)}
    ${biRow(6,"NIK",bi.nik)}${biRow(7,"No. KK",bi.noKK)}
    ${biRow(8,"Tempat, Tanggal Lahir",s.ttl)}
    ${biRow(9,"Agama",s.agama)}${biRow(10,"Kewarganegaraan",bi.wn)}
    ${biRow(11,"Anak Ke-",bi.anakKe)}${biRow(12,"Jumlah Saudara Kandung",bi.jmlSaudara)}
    ${biRow(13,"Status Yatim/Piatu",bi.statusYatim)}
    ${biRow(14,"Bahasa Sehari-hari",bi.bahasa)}${biRow(15,"Kebutuhan Khusus",bi.kebutuhanKhusus)}
    <tr><td colspan="3" style="background:var(--primary-ghost);font-weight:800;">B. TEMPAT TINGGAL</td></tr>
    ${biRow(16,"Alamat",s.alamat)}${biRow(17,"RT/RW",(bi.rt||"-")+"/"+(bi.rw||"-"))}
    ${biRow(18,"Dusun",bi.dusun)}${biRow(19,"Kelurahan/Desa",bi.kelurahan)}
    ${biRow(20,"Kecamatan",bi.kecamatan)}${biRow(21,"Kode Pos",bi.kodePos)}
    ${biRow(22,"Telepon / HP",(bi.telepon||"")+(bi.telepon&&bi.hp?" / ":"")+(bi.hp||""))}
    ${biRow(23,"Tinggal Bersama",bi.tinggalBersama)}${biRow(24,"Jarak ke Sekolah",bi.jarakSekolah?bi.jarakSekolah+" km":"")}
    ${biRow(25,"Transportasi",bi.transportasi)}
    <tr><td colspan="3" style="background:var(--primary-ghost);font-weight:800;">C. KESEHATAN</td></tr>
    ${biRow(26,"Berat/Tinggi Badan",(bi.beratBadan||"-")+" kg / "+(bi.tinggiBadan||"-")+" cm")}
    ${biRow(27,"Golongan Darah",bi.golDarah)}${biRow(28,"Penyakit Pernah Diderita",bi.penyakit)}
    ${biRow(29,"Kelainan Jasmani",bi.kelainan)}
    <tr><td colspan="3" style="background:var(--primary-ghost);font-weight:800;">D. PENDIDIKAN</td></tr>
    ${biRow(30,"Sekolah Asal",bi.sekolahAsal)}
    ${biRow(31,"Diterima di Kelas/Tanggal",(bi.diterimaKelas||"")+(bi.diterimaTanggal?" / "+fmtDate(bi.diterimaTanggal):""))}
    ${ortuRows("E. KETERANGAN AYAH", ayah)}
    ${ortuRows("F. KETERANGAN IBU", ibu)}
    ${ortuRows("G. KETERANGAN WALI", wali)}
    <tr><td colspan="3" style="background:var(--primary-ghost);font-weight:800;">H. PIP / KIP</td></tr>
    ${biRow(32,"Status PIP",pip.label)}${biRow(33,"Kategori",cats.join("; ")||"-")}
    ${biRow(34,"Nomor KIP",bi.nomorKIP)}${biRow(35,"Nomor KKS",bi.nomorKKS)}
    ${biRow(36,"Alasan Usulan",bi.alasanPIP)}
  </table></div></div>`;
}

function printBukuInduk(siswaId){
  const s0 = (db.siswa||[]).find(x=>x.id===siswaId);
  const html = letterheadHtml()
    + `<div class="doc-title">BUKU INDUK SISWA</div>
       <p style="text-align:center;margin-top:-8px;">${escapeHtml((s0&&s0.nama)||"")} &middot; ${escapeHtml(classInfo(activeClassId).label)}</p>`
    + bukuIndukLihatHtml(siswaId);
  printDocument("Buku Induk - "+((s0&&s0.nama)||siswaId), html);
}

/* ============================================================
   UNGGAH PEMBARUAN BUKU INDUK (via Template Excel/CSV)
   ============================================================ */
const BI_TEMPLATE_HEADERS = ["NISN","Nama Lengkap","Kelas","Nama Panggilan","Jenis Kelamin (L/P)","NIS/NIPD",
  "NIK","No. KK","Tempat Lahir","Tanggal Lahir (TTTT-BB-HH)","Agama","Kewarganegaraan","Anak Ke-","Jumlah Saudara Kandung",
  "Status Yatim/Piatu","RT","RW","Dusun","Kelurahan/Desa","Kecamatan","Kode Pos","Jenis Tinggal","Transportasi",
  "Telepon","HP","Berat Badan (kg)","Tinggi Badan (cm)","Lingkar Kepala (cm)","Jarak ke Sekolah","Kebutuhan Khusus",
  "Sekolah Asal","Nama Ayah","Tahun Lahir Ayah","Pendidikan Ayah","Pekerjaan Ayah","Penghasilan Ayah","NIK Ayah",
  "Nama Ibu","Tahun Lahir Ibu","Pendidikan Ibu","Pekerjaan Ibu","Penghasilan Ibu","NIK Ibu",
  "Nama Wali","Tahun Lahir Wali","Pendidikan Wali","Pekerjaan Wali","Penghasilan Wali","NIK Wali",
  "Penerima KIP (Ya/Tidak)","Nomor KIP","Nomor KKS","Layak PIP (Ya/Tidak)","Alasan PIP"];
function biStudentToRow(stu, kelasLabel){
  const b = stu.bi || {};
  const o = d => [ (d&&d.nama)||"", (d&&d.tahunLahir)||"", (d&&d.pendidikan)||"", (d&&d.pekerjaan)||"", (d&&d.penghasilan)||"", (d&&d.nik)||"" ];
  return [stu.nisn||"", stu.nama||"", kelasLabel, "", stu.jk||"", stu.nis||"",
    b.nik||"", b.noKK||"", b.tempatLahir||"", b.tanggalLahir||"", stu.agama||"", b.wn||"", b.anakKe||"", b.jmlSaudara||"",
    b.statusYatim||"", b.rt||"", b.rw||"", b.dusun||"", b.kelurahan||"", b.kecamatan||"", b.kodePos||"",
    b.jenisTinggal||"", b.transportasi||"", b.telepon||"", b.hp||"",
    b.beratBadan||"", b.tinggiBadan||"", b.lingkarKepala||"", b.jarakSekolah||"", b.kebutuhanKhusus||"",
    b.sekolahAsal||"", ...o(b.ayah), ...o(b.ibu), ...o(b.wali),
    b.penerimaKIP||"", b.nomorKIP||"", b.nomorKKS||"", b.layakPIP||"", b.alasanPIP||""];
}
async function downloadBITemplate(){
  try{
    await loadXlsxLib();
    const rows = [BI_TEMPLATE_HEADERS.slice()];
    ["kelas-1","kelas-2","kelas-3","kelas-4","kelas-5","kelas-6"].forEach(cid=>{
      const label = cid.replace("kelas-","");
      (loadClassDB(cid).siswa||[]).forEach(stu=> rows.push(biStudentToRow(stu, label)));
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = BI_TEMPLATE_HEADERS.map(()=>({wch:16}));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DATA");
    const pet = XLSX.utils.aoa_to_sheet([
      ["PETUNJUK PENGISIAN TEMPLATE BUKU INDUK SISWA"],
      [""],
      ["1. Kolom A-C (NISN, Nama Lengkap, Kelas) adalah IDENTITAS - JANGAN diubah/dihapus."],
      ["   Siswa baru boleh ditambahkan di baris bawah dengan mengisi NISN, Nama, dan Kelas."],
      ["2. Isi/lengkapi kolom D dst. sesuai data sebenarnya (Buku Induk / KK / akta)."],
      ["3. Format Tanggal Lahir: TTTT-BB-HH, contoh 2019-06-27."],
      ["4. NIK & No. KK: 16 digit angka. Data hanya tersimpan di perangkat Bapak."],
      ["5. Setelah selesai simpan file, di AdminGuru: Data Siswa > Unggah Pembaruan > pilih file > Periksa > Terapkan."],
      ["6. Pencocokan berdasarkan NISN. Baris tanpa NISN cocok akan dilaporkan dan dilewati."],
    ]);
    XLSX.utils.book_append_sheet(wb, pet, "PETUNJUK");
    XLSX.writeFile(wb, "Template_Buku_Induk_2026.xlsx");
    toast("Template Buku Induk diunduh. Isi lalu unggah kembali via 'Unggah Pembaruan'.");
  }catch(e){
    toast("Gagal membuat template (butuh internet untuk pustaka Excel). Coba lagi saat online.");
  }
}
function openBIUpload(){
  openModal({title:"Unggah Pembaruan Buku Induk", bodyHtml:`
    <p class="muted" style="margin-top:0;">Unggah file <strong>Template Buku Induk</strong> (.xlsx) yang sudah diisi,
    atau file .csv dengan kolom yang sama. Sistem mencocokkan berdasarkan <strong>NISN</strong>.</p>
    <div style="border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;">
      <input type="file" id="biFileInput" accept=".xlsx,.xls,.csv" style="display:none;"
        onchange="handleBIFile(this)">
      <button class="btn btn-primary" onclick="document.getElementById('biFileInput').click()">${ic("upload",15)} Pilih File</button>
      <div class="muted" style="margin-top:8px;font-size:12px;">Belum punya template? <a href="#" onclick="downloadBITemplate();return false;" style="color:var(--primary);">Unduh Template Buku Induk</a></div>
    </div>
    <div id="biUploadStatus" style="margin-top:12px;"></div>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button>`});
}
function loadXlsxLib(){
  return new Promise((res, rej)=>{
    if(window.XLSX) return res();
    const sc = document.createElement("script");
    sc.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    sc.onload = ()=>res(); sc.onerror = ()=>rej(new Error("cdn"));
    document.head.appendChild(sc);
  });
}
// Kolom template (0-based): 0 NISN,1 Nama,2 Kelas,3 Panggilan,4 JK,5 NIS,6 NIK,7 NoKK,
// 8 TempatLahir,9 TglLahir,10 Agama,11 WN,12 AnakKe,13 JmlSdr,14 StatusYatim,
// 15 RT,16 RW,17 Dusun,18 Kel,19 Kec,20 KodePos,21 JenisTinggal,22 Transportasi,23 Telp,24 HP,
// 25 BB,26 TB,27 LK,28 Jarak,29 Khusus,30 SekolahAsal,
// 31-36 Ayah(nama,thn,pend,pek,hasil,nik), 37-42 Ibu, 43-48 Wali,
// 49 KIP,50 NoKIP,51 NoKKS,52 LayakPIP,53 AlasanPIP
function biRowToUpdate(r){
  const g = i => String(r[i]!==undefined&&r[i]!==null ? r[i] : "").trim();
  const mkOrtu = o => ({nama:g(o), tahunLahir:g(o+1), pendidikan:g(o+2), pekerjaan:g(o+3),
    penghasilan:g(o+4), nik:g(o+5), agama:"Islam", wn:"Indonesia", alamat:"", hp:""});
  return {
    nisn: g(0), nama: g(1), kelas: g(2),
    bi: {nik:g(6), noKK:g(7), tempatLahir:g(8), tanggalLahir:g(9),
      rt:g(15), rw:g(16), dusun:g(17), kelurahan:g(18), kecamatan:g(19), kodePos:g(20),
      jenisTinggal:g(21), transportasi:g(22), telepon:g(23), hp:g(24),
      anakKe:g(12), jmlSaudara:g(13),
      beratBadan:g(25), tinggiBadan:g(26), lingkarKepala:g(27), jarakSekolah:g(28),
      kebutuhanKhusus:g(29), sekolahAsal:g(30),
      ayah:mkOrtu(31), ibu:mkOrtu(37), wali:mkOrtu(43),
      penerimaKIP:g(49), nomorKIP:g(50), nomorKKS:g(51), layakPIP:g(52), alasanPIP:g(53)},
    flat: {jk:g(4), nis:g(5), agama:g(10), alamat:""}
  };
}
async function handleBIFile(input){
  const file = input.files[0];
  if(!file) return;
  const st = document.getElementById("biUploadStatus");
  st.innerHTML = `<span class="muted">Membaca file...</span>`;
  try{
    let rows = [];
    if(/\.csv$/i.test(file.name)){
      const text = await file.text();
      rows = parseCSV(text);
    }else{
      await loadXlsxLib();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {type:"array"});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:""});
    }
    // buang baris header & baris kosong
    rows = rows.filter((r,i)=> i>0 && r.some(v=>String(v).trim()!==""));
    if(!rows.length) throw new Error("empty");
    previewBIImport(rows);
  }catch(e){
    st.innerHTML = `<div class="alert alert-danger">Gagal membaca file. Pastikan format .xlsx/.csv dari template resmi.${e.message==="cdn"?" (Butuh internet sekali untuk memuat pustaka Excel.)":""}</div>`;
  }
  input.value = "";
}
function parseCSV(text){
  const rows = []; let row = [], cur = "", inQ = false;
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    if(inQ){ if(ch==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else inQ=false; } else cur+=ch; }
    else if(ch==='"') inQ=true;
    else if(ch===','){ row.push(cur); cur=""; }
    else if(ch==="\n"||ch==="\r"){ if(ch==="\n"||text[i+1]!=="\n"){ row.push(cur); rows.push(row); row=[]; cur=""; } }
    else cur+=ch;
  }
  if(cur!==""||row.length){ row.push(cur); rows.push(row); }
  return rows.filter(r=>r.length>1||String(r[0]).trim()!=="");
}
function previewBIImport(rows){
  const updates = [];
  const notFound = [];
  const allSiswa = [];
  ["kelas-1","kelas-2","kelas-3","kelas-4","kelas-5","kelas-6"].forEach(cid=>{
    (loadClassDB(cid).siswa||[]).forEach(s=>allSiswa.push({cid, s}));
  });
  const byNisn = {};
  allSiswa.forEach(x=>{ if(x.s.nisn) byNisn[String(x.s.nisn).trim()] = x; });
  rows.forEach((r, i)=>{
    const u = biRowToUpdate(r);
    if(!u.nisn && !u.nama){ return; }
    const match = u.nisn && byNisn[u.nisn];
    if(match){ updates.push({row:i+2, match, u}); }
    else{
      // coba cocok nama + kelas
      const nm = u.nama.toLowerCase();
      const found = allSiswa.find(x=> (x.s.nama||"").toLowerCase()===nm );
      if(found) updates.push({row:i+2, match:found, u, byName:true});
      else notFound.push({row:i+2, nisn:u.nisn, nama:u.nama});
    }
  });
  window._biImport = {updates, notFound};
  const prevRows = updates.slice(0,8).map(x=>`<tr><td>${x.row}</td><td>${escapeHtml(x.match.s.nama)}</td>
    <td>${escapeHtml(x.u.nisn||"-")}</td><td><span class="badge badge-green">Cocok${x.byName?" (nama)":""}</span></td></tr>`).join("");
  openModal({title:"Pratinjau Unggahan Buku Induk", bodyHtml:`
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px;">
      <div class="stat-card"><div class="stat-num">${rows.length}</div><div class="stat-label">Baris dibaca</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--success);">${updates.length}</div><div class="stat-label">Cocok & siap diperbarui</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--danger);">${notFound.length}</div><div class="stat-label">Tidak cocok</div></div>
    </div>
    ${updates.length?`<div class="table-wrap" style="max-height:220px;overflow:auto;"><table>
      <thead><tr><th>Baris</th><th>Nama Siswa</th><th>NISN</th><th>Status</th></tr></thead><tbody>${prevRows}</tbody></table></div>
      ${updates.length>8?`<div class="muted" style="font-size:12px;">...dan ${updates.length-8} lainnya.</div>`:""}`:""}
    ${notFound.length?`<div class="alert alert-warning" style="margin-top:10px;">${notFound.length} baris tidak cocok (NISN tidak ditemukan): baris ${notFound.slice(0,10).map(x=>x.row).join(", ")}${notFound.length>10?"...":""}. Baris ini akan dilewati.</div>`:""}
    <p class="muted" style="font-size:12px;margin-top:10px;">Hanya kolom yang terisi yang diperbarui; kolom kosong tidak menimpa data lama.</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" ${updates.length?"":"disabled"} onclick="applyBIImport()">${ic("check",15)} Terapkan ${updates.length} Pembaruan</button>`});
}
function applyBIImport(){
  const imp = window._biImport;
  if(!imp) return;
  let n = 0;
  const touched = {};
  imp.updates.forEach(({match, u})=>{
    const cls = loadClassDB(match.cid);
    const s = (cls.siswa||[]).find(x=>x.id===match.s.id);
    if(!s) return;
    s.bi = s.bi || {};
    // hanya timpa field yang terisi
    Object.keys(u.bi).forEach(k=>{
      const v = u.bi[k];
      if(v && typeof v === "object"){
        s.bi[k] = s.bi[k] || {};
        Object.keys(v).forEach(k2=>{ if(String(v[k2]).trim()!=="") s.bi[k][k2] = v[k2]; });
      }else if(String(v).trim()!==""){ s.bi[k] = v; }
    });
    if(u.flat.jk) s.jk = u.flat.jk;
    if(u.flat.nis) s.nis = u.flat.nis;
    if(u.flat.agama) s.agama = u.flat.agama;
    saveClassDB(match.cid, cls);
    touched[match.cid] = true;
    n++;
  });
  // sinkronkan db.siswa kelas aktif bila tersentuh
  if(touched[activeClassId]) db.siswa = loadClassDB(activeClassId).siswa || [];
  saveDB();
  window._biImport = null;
  closeModal();
  toast(n + " data Buku Induk diperbarui.");
  renderPage("siswa");
}
