/* ================================================================
   FILE: assets/js/50-pages2.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   6B. MODUL TAMBAHAN — diselaraskan dari struktur "Aplikasi
   Administrasi Kelas 1" (xlsm). Semua modul di bawah memakai
   roster db.siswa milik tahun ajaran berjalan (BUKAN roster lama
   dari file xlsm sumber, karena xlsm tsb berasal dari kohort
   T.A. 2025/2026 yang berbeda dengan siswa saat ini). Modul yang
   sifatnya rekapitulasi/hitungan dihitung otomatis dari data yang
   sudah ada (Data Siswa, Kehadiran, Mutasi, Asesmen Sumatif) agar
   tidak terjadi entri data ganda.
   ============================================================ */
/* Urutan default seluruh daftar siswa di aplikasi (Kehadiran, Rekap Nilai,
   Input Nilai Massal, dropdown pilih siswa, dsb.) adalah ABJAD (A-Z) memakai
   nama depan siswa, bukan No. Absen. Halaman Data Siswa tetap punya kontrol
   "Urutkan" sendiri (default juga Abjad) sehingga guru masih bisa beralih ke
   urutan No. Absen kapan pun diperlukan. */
function siswaSortedAlpha(){ return db.siswa.slice().sort((a,b)=>(a.nama||"").localeCompare(b.nama||"","id",{sensitivity:"base"})); }
function siswaOpts(){ return siswaSortedAlpha().map(s=>({value:s.id,label:s.nama})); }
function siswaName(id){ return (db.siswa.find(s=>s.id===id)||{}).nama || "?"; }

/* ---------- RIWAYAT KESEHATAN ---------- */
PAGES.riwayatKesehatan = function(){
  return crudSection({
    store:"riwayatKesehatan", title:"Riwayat Kesehatan Siswa",
    desc:"Daftar riwayat kesehatan / penyakit yang pernah diderita peserta didik.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"jenisPenyakit",label:"Jenis Penyakit",required:true},
      {key:"tanggal",label:"Tanggal Diriwayatkan",type:"date"},
      {key:"lamanya",label:"Lamanya"},
      {key:"cacat",label:"Cacat/Kondisi Khusus",type:"select",options:["Tidak Ada","Ada"]},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"jenisPenyakit",label:"Jenis Penyakit"},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"cacat",label:"Cacat/Kondisi",render:v=>v==="Ada"?`<span class="badge badge-orange">Ada</span>`:`<span class="badge badge-green">Tidak Ada</span>`},
    ],
    searchKeys:["jenisPenyakit","keterangan"]
  });
};

/* ---------- RIWAYAT KELAKUAN ---------- */
PAGES.riwayatKelakuan = function(){
  return crudSection({
    store:"riwayatKelakuan", title:"Riwayat Kelakuan",
    desc:"Catatan peristiwa terkait sikap/kelakuan peserta didik di sekolah.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tanggal",label:"Tanggal",type:"date",required:true},
      {key:"jam",label:"Jam"},
      {key:"peristiwa",label:"Peristiwa",type:"textarea",required:true},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"peristiwa",label:"Peristiwa",render:v=>escapeHtml((v||"").slice(0,60))+((v||"").length>60?"...":"")},
    ],
    searchKeys:["peristiwa","keterangan"]
  });
};

/* ---------- BAKAT & MINAT ---------- */
PAGES.bakatMinat = function(){
  const inner = crudSection({
    store:"bakatMinat", title:"Data Bakat dan Minat Siswa",
    desc:"Catatan bidang bakat/minat tiap peserta didik.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"bidang",label:"Bidang",type:"select",options:["Ilmu Pengetahuan","Olahraga","Seni","Keagamaan","Kepemimpinan","Lainnya"],required:true},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"bidang",label:"Bidang",render:v=>`<span class="badge badge-blue">${escapeHtml(v)}</span>`},
      {key:"keterangan",label:"Keterangan"},
    ],
  });
  const bidangList = ["Ilmu Pengetahuan","Olahraga","Seni","Keagamaan","Kepemimpinan","Lainnya"];
  const jkMap = Object.fromEntries(db.siswa.map(s=>[s.id,s.jk]));
  const rekapRows = bidangList.map(b=>{
    const rows = db.bakatMinat.filter(r=>r.bidang===b);
    const l = rows.filter(r=>jkMap[r.siswaId]==="L").length;
    const p = rows.filter(r=>jkMap[r.siswaId]==="P").length;
    return `<tr><td>${escapeHtml(b)}</td><td>${l}</td><td>${p}</td><td>${l+p}</td></tr>`;
  }).join("");
  return inner + `<div class="card" style="margin-top:16px;"><h3>Rekap Bakat/Minat per Bidang</h3>
    <div class="table-wrap"><table><thead><tr><th>Bidang</th><th>L</th><th>P</th><th>Jumlah</th></tr></thead>
    <tbody>${rekapRows}</tbody></table></div></div>`;
};

/* ---------- JUMLAH SISWA MENURUT TAHUN LAHIR (dihitung otomatis dari TTL) ---------- */
function parseTahunLahir(ttl){
  if(!ttl) return null;
  const m = String(ttl).match(/(\d{4})/g);
  return m ? parseInt(m[m.length-1],10) : null;
}
PAGES.dfjl = function(){
  const byYear = {};
  db.siswa.forEach(s=>{
    const y = parseTahunLahir(s.ttl);
    const key = y || "Tidak diketahui";
    byYear[key] = byYear[key] || {l:0,p:0};
    if(s.jk==="L") byYear[key].l++; else if(s.jk==="P") byYear[key].p++;
  });
  const years = Object.keys(byYear).sort();
  const rows = years.map(y=>{
    const d = byYear[y]; const jml = d.l+d.p;
    const umur = (y!=="Tidak diketahui") ? (new Date().getFullYear()-parseInt(y,10))+" th" : "-";
    return `<tr><td>${escapeHtml(String(y))}</td><td>${umur}</td><td>${d.l}</td><td>${d.p}</td><td><strong>${jml}</strong></td></tr>`;
  }).join("");
  const totL = db.siswa.filter(s=>s.jk==="L").length, totP = db.siswa.filter(s=>s.jk==="P").length;
  return `
  <div class="section-head"><div><h1>Daftar Jumlah Siswa Menurut Tahun Lahir</h1><div class="desc">Dihitung otomatis dari tanggal lahir pada Data Siswa — tidak perlu diisi ulang manual.</div></div>
    <div class="grow"></div><button class="btn" onclick="printDFJL()">${ic("print",15)} Cetak</button></div>
  <div class="card" style="margin-bottom:14px;">Total: <strong>${totL}</strong> Laki-laki, <strong>${totP}</strong> Perempuan, <strong>${totL+totP}</strong> siswa.</div>
  <div id="dfjlHolder" class="table-wrap"><table><thead><tr><th>Tahun Kelahiran</th><th>Umur (approx.)</th><th>L</th><th>P</th><th>Jumlah</th></tr></thead>
  <tbody>${rows || `<tr><td colspan="5" class="empty-state">Belum ada data siswa.</td></tr>`}</tbody></table></div>`;
};
function printDFJL(){ printDocument("DAFTAR JUMLAH SISWA MENURUT TAHUN LAHIR", document.getElementById("dfjlHolder").innerHTML); }

/* ---------- REKAP JUMLAH SISWA BULANAN (dihitung dari siswa+mutasi+kehadiran) ---------- */
const BULAN_TA = ["Juli","Agustus","September","Oktober","November","Desember","Januari","Februari","Maret","April","Mei","Juni"];
function bulanTaToMonthNum(i){ return [7,8,9,10,11,12,1,2,3,4,5,6][i]; }
PAGES.rekapJumlahSiswa = function(){
  const totalL = db.siswa.filter(s=>s.jk==="L").length, totalP = db.siswa.filter(s=>s.jk==="P").length;
  const rows = BULAN_TA.map((nm,i)=>{
    const bln = String(bulanTaToMonthNum(i)).padStart(2,"0");
    const masuk = db.mutasi.filter(m=>m.jenis==="Masuk" && (m.tanggal||"").slice(5,7)===bln).length;
    const keluar = db.mutasi.filter(m=>(m.jenis==="Pindah Keluar"||m.jenis==="Keluar/Putus Sekolah") && (m.tanggal||"").slice(5,7)===bln).length;
    let s=0,iz=0,a=0;
    Object.keys(db.kehadiran).forEach(tgl=>{
      if(tgl.slice(5,7)===bln) Object.values(db.kehadiran[tgl]).forEach(st=>{ if(st==="S")s++; else if(st==="I")iz++; else if(st==="A")a++; });
    });
    return `<tr><td>${nm}</td><td>${totalL}</td><td>${totalP}</td><td>${totalL+totalP}</td><td>${masuk}</td><td>${keluar}</td><td>${s}</td><td>${iz}</td><td>${a}</td></tr>`;
  }).join("");
  return `
  <div class="section-head"><div><h1>Rekap Jumlah Siswa Bulanan</h1><div class="desc">Dihitung otomatis dari Data Siswa (L/P), Buku Mutasi Siswa (masuk/keluar), dan Kehadiran (S/I/A).</div></div>
    <div class="grow"></div><button class="btn" onclick="printRekapJlhSiswa()">${ic("print",15)} Cetak</button></div>
  <div id="rekapJlhHolder" class="table-wrap"><table><thead><tr><th>Bulan</th><th>L</th><th>P</th><th>Jumlah</th><th>Masuk</th><th>Keluar</th><th>S</th><th>I</th><th>A</th></tr></thead>
  <tbody>${rows}</tbody></table></div>`;
};
function printRekapJlhSiswa(){ printDocument("REKAP JUMLAH SISWA T.A. "+db.sekolah.tahunAjaran, document.getElementById("rekapJlhHolder").innerHTML); }

/* ---------- REKAP PEKERJAAN ORANG TUA (dihitung dari Data Siswa) ---------- */
PAGES.pekerjaanOrtu = function(){
  const counts = {};
  db.siswa.forEach(s=>{ const p=(s.pekerjaanOrtu||"Tidak diketahui").trim()||"Tidak diketahui"; counts[p]=(counts[p]||0)+1; });
  const total = db.siswa.length;
  const rows = Object.keys(counts).sort((a,b)=>counts[b]-counts[a]).map((k,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(k)}</td><td>${counts[k]}</td><td>${total?(counts[k]/total*100).toFixed(1):0}%</td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Rekap Pekerjaan Orang Tua</h1><div class="desc">Dihitung otomatis dari field Pekerjaan Orang Tua pada Data Siswa.</div></div>
    <div class="grow"></div><button class="btn" onclick="printPekerjaanOrtu()">${ic("print",15)} Cetak</button></div>
  <div id="pekerjaanOrtuHolder" class="table-wrap"><table><thead><tr><th>No</th><th>Jenis Pekerjaan</th><th>Jumlah</th><th>Persentase</th></tr></thead>
  <tbody>${rows || `<tr><td colspan="4" class="empty-state">Belum ada data.</td></tr>`}</tbody></table></div>`;
};
function printPekerjaanOrtu(){ printDocument("DATA PEKERJAAN ORANG TUA", document.getElementById("pekerjaanOrtuHolder").innerHTML); }

/* ---------- REKAP SELURUH KELAS (ringkasan jumlah siswa Kelas 1-6, klik utk pindah kelas) ---------- */
PAGES.rekapSeluruhKelas = function(){
  const rows = CLASS_LIST.map(c=>{
    const data = (c.id===activeClassId) ? db : loadClassDB(c.id);
    const siswaArr = data.siswa || [];
    const l = siswaArr.filter(s=>s.jk==="L").length, p = siswaArr.filter(s=>s.jk==="P").length;
    return {c, jumlah:siswaArr.length, l, p};
  });
  const cards = rows.map(r=>`
    <div class="card" style="cursor:pointer;border-color:${r.c.id===activeClassId?'var(--primary)':'var(--border)'};" onclick="switchActiveClass('${r.c.id}')">
      <div class="muted" style="font-size:11.5px;">${r.c.id===activeClassId?'<strong>KELAS AKTIF</strong>':'Klik untuk pindah'}</div>
      <h3 style="margin:4px 0;">${r.c.label}</h3>
      <div style="font-size:26px;font-weight:800;">${r.jumlah}</div>
      <div class="muted" style="font-size:12px;">${r.l} L &middot; ${r.p} P</div>
    </div>`).join("");
  const totalSiswa = rows.reduce((a,r)=>a+r.jumlah,0);
  return `
  <div class="section-head"><div><h1>Rekap Seluruh Kelas</h1><div class="desc">Ringkasan jumlah siswa Kelas 1 s.d. Kelas 6. Klik kartu kelas untuk langsung menjadikannya kelas aktif.</div></div>
    <div class="grow"></div><span class="badge badge-blue">Total ${totalSiswa} siswa</span></div>
  <div class="grid grid-3">${cards}</div>`;
};

/* ---------- ARSIP ALUMNI (LULUSAN KELAS 6) ---------- */
PAGES.alumni = function(){
  const q = (window._alumniQ||"").toLowerCase();
  let data = loadAlumni().slice().reverse();
  if(q) data = data.filter(s=>[s.nama,s.tahunLulus].some(v=>String(v||"").toLowerCase().includes(q)));
  const body = data.map((s,i)=>`<tr><td>${i+1}</td><td><strong>${escapeHtml(s.nama)}</strong></td>
    <td>${escapeHtml(s.jk||'-')}</td><td>${escapeHtml(s.nis||'-')}</td><td>${escapeHtml(s.nisn||'-')}</td>
    <td>${escapeHtml(s.kelasTerakhir||'-')}</td><td>${escapeHtml(s.tahunLulus||'-')}</td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Arsip Alumni (Lulusan)</h1><div class="desc">Siswa yang telah diluluskan dari Kelas 6 lewat menu "Lulus / Arsip Alumni" pada Data Siswa. Data akademik terakhir mereka tetap tersimpan utuh di data Kelas 6 tahun kelulusannya.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportAlumniCSV()">${ic("download",15)} CSV</button>
  </div>
  <div class="toolbar"><div class="search-box">${ic("search",16)}<input placeholder="Cari nama / tahun lulus..." oninput="window._alumniQ=this.value; renderPage('alumni');"></div></div>
  <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>JK</th><th>NIS</th><th>NISN</th><th>Kelas Terakhir</th><th>Tahun Lulus</th></tr></thead>
  <tbody>${body || `<tr><td colspan="7" class="empty-state">Belum ada alumni yang diarsipkan.</td></tr>`}</tbody></table></div>`;
};
function exportAlumniCSV(){
  const cols = [{key:"nama",label:"Nama"},{key:"jk",label:"JK"},{key:"nis",label:"NIS"},{key:"nisn",label:"NISN"},{key:"kelasTerakhir",label:"Kelas Terakhir"},{key:"tahunLulus",label:"Tahun Lulus"}];
  exportCSV("__alumni__", loadAlumni(), cols, "arsip_alumni");
}

/* ---------- REKAP ABSEN BULANAN (12 BULAN, dihitung dari Kehadiran) ---------- */
PAGES.rekapAbsenTahunan = function(){
  const months = BULAN_TA.map((nm,i)=>({nm, bln:String(bulanTaToMonthNum(i)).padStart(2,"0")}));
  const head = months.map(m=>`<th colspan="3">${m.nm}</th>`).join("");
  const subhead = months.map(()=>`<th>S</th><th>I</th><th>A</th>`).join("");
  const body = siswaSortedAlpha().map((s,idx)=>{
    let totS=0,totI=0,totA=0;
    const cells = months.map(m=>{
      let s1=0,i1=0,a1=0;
      Object.keys(db.kehadiran).forEach(tgl=>{
        if(tgl.slice(5,7)===m.bln){
          const st = db.kehadiran[tgl][s.id];
          if(st==="S")s1++; else if(st==="I")i1++; else if(st==="A")a1++;
        }
      });
      totS+=s1; totI+=i1; totA+=a1;
      return `<td>${s1||""}</td><td>${i1||""}</td><td>${a1||""}</td>`;
    }).join("");
    return `<tr><td>${idx+1}</td><td style="text-align:left;"><strong>${escapeHtml(s.nama)}</strong></td>${cells}<td>${totS}</td><td>${totI}</td><td>${totA}</td></tr>`;
  }).join("");
  return `
  <div class="section-head"><div><h1>Rekap Absen Bulanan (12 Bulan)</h1><div class="desc">Dihitung otomatis dari data harian pada menu Kehadiran — Juli s.d. Juni tahun ajaran berjalan.</div></div>
    <div class="grow"></div><button class="btn" onclick="printRekapAbsenTahunan()">${ic("print",15)} Cetak</button></div>
  <div id="rekapAbsenTahunanHolder" class="table-wrap"><table><thead><tr><th rowspan="2">No</th><th rowspan="2" style="text-align:left;">Nama Siswa</th>${head}<th colspan="3">Jumlah</th></tr><tr>${subhead}<th>S</th><th>I</th><th>A</th></tr></thead>
  <tbody>${body}</tbody></table></div>`;
};
function printRekapAbsenTahunan(){ printDocument("REKAP ABSEN T.A. "+db.sekolah.tahunAjaran, document.getElementById("rekapAbsenTahunanHolder").innerHTML); }

/* ---------- BUKU PRESTASI SISWA (dihitung dari rata-rata Asesmen Sumatif per mapel) ---------- */
PAGES.prestasiSiswa = function(){
  function avgFor(siswaId, mapel){
    const rows = db.asesmenSumatif.filter(r=>r.siswaId===siswaId && r.mapel===mapel);
    if(!rows.length) return null;
    const arr = rows.map(r=>Number(r.nilai)||0);
    return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1);
  }
  const head = MAPEL_LIST.map(m=>`<th>${escapeHtml(m)}</th>`).join("");
  const body = siswaSortedAlpha().map((s,idx)=>{
    const cells = MAPEL_LIST.map(m=>{ const v = avgFor(s.id,m); return `<td>${v==null?"-":v}</td>`; }).join("");
    return `<tr><td>${idx+1}</td><td style="text-align:left;"><strong>${escapeHtml(s.nama)}</strong></td>${cells}</tr>`;
  }).join("");
  return `
  <div class="section-head"><div><h1>Buku Prestasi Siswa</h1><div class="desc">Nilai akhir per mata pelajaran, dihitung otomatis dari rata-rata Asesmen Sumatif yang sudah tercatat.</div></div>
    <div class="grow"></div><button class="btn" onclick="printPrestasiSiswa()">${ic("print",15)} Cetak</button></div>
  <div id="prestasiHolder" class="table-wrap"><table><thead><tr><th>No</th><th style="text-align:left;">Nama Siswa</th>${head}</tr></thead>
  <tbody>${body}</tbody></table></div>`;
};
function printPrestasiSiswa(){ printDocument("BUKU PRESTASI SISWA", document.getElementById("prestasiHolder").innerHTML); }

/* ---------- KEGIATAN EKSTRAKURIKULER ---------- */
PAGES.ekstrakurikuler = function(){
  return crudSection({
    store:"ekstrakurikuler", title:"Data Kegiatan Ekstrakurikuler",
    desc:"Catatan kegiatan ekstrakurikuler yang diikuti siswa kelas.",
    fields:[
      {key:"jenisKegiatan",label:"Jenis Kegiatan",required:true},
      {key:"tanggal",label:"Hari/Tanggal Pelaksanaan",type:"date"},
      {key:"jumlahPeserta",label:"Jumlah Peserta",type:"number"},
      {key:"dalamRangka",label:"Dalam Rangka"},
      {key:"tingkat",label:"Tingkat",type:"select",options:["Sekolah","Kecamatan","Kabupaten","Provinsi","Nasional"]},
      {key:"tempat",label:"Tempat Pelaksanaan"},
      {key:"penyelenggara",label:"Penyelenggara"},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[
      {key:"jenisKegiatan",label:"Jenis Kegiatan"},{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"jumlahPeserta",label:"Peserta"},{key:"tingkat",label:"Tingkat"},
    ],
  });
};

/* ---------- STUDY TOUR ---------- */
PAGES.studyTour = function(){
  return crudSection({
    store:"studyTour", title:"Daftar Kegiatan Study Tour",
    desc:"Catatan kegiatan kunjungan/study tour kelas.",
    fields:[
      {key:"tanggal",label:"Hari/Tanggal",type:"date",required:true},
      {key:"objekWisata",label:"Objek Wisata yang Dikunjungi",required:true},
      {key:"jumlahSiswa",label:"Jumlah Siswa yang Ikut Serta",type:"number"},
      {key:"tujuan",label:"Tujuan/Maksud Kunjungan",type:"textarea"},
    ],
    columns:[{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"objekWisata",label:"Objek Wisata"},{key:"jumlahSiswa",label:"Jml Siswa"},{key:"tujuan",label:"Tujuan"}],
  });
};

/* ---------- BUKU PEGANGAN GURU ---------- */
PAGES.bukuPeganganGuru = function(){
  return crudSection({
    store:"bukuPeganganGuru", title:"Data Buku Pegangan Guru",
    desc:"Daftar buku pegangan/referensi yang digunakan guru untuk mengajar.",
    fields:[
      {key:"jenisBuku",label:"Jenis Buku",required:true},
      {key:"kelasJilid",label:"Kelas/Jilid"},
      {key:"pengarang",label:"Pengarang"},
    ],
    columns:[{key:"jenisBuku",label:"Jenis Buku"},{key:"kelasJilid",label:"Kelas/Jilid"},{key:"pengarang",label:"Pengarang"}],
  });
};

/* ---------- BUKU PEGANGAN SISWA ---------- */
PAGES.bukuPeganganSiswa = function(){
  return crudSection({
    store:"bukuPeganganSiswa", title:"Daftar Buku Pegangan Siswa",
    desc:"Daftar buku pegangan siswa beserta jumlah dan status peminjaman.",
    fields:[
      {key:"judulBuku",label:"Judul Buku",required:true}, {key:"pengarang",label:"Pengarang"},
      {key:"jumlahAwal",label:"Jumlah Awal",type:"number"}, {key:"dipinjam",label:"Dipinjam Murid",type:"number"},
      {key:"jumlahAkhir",label:"Jumlah Akhir",type:"number"},
    ],
    columns:[
      {key:"judulBuku",label:"Judul Buku"},{key:"pengarang",label:"Pengarang"},
      {key:"jumlahAwal",label:"Jml Awal"},{key:"dipinjam",label:"Dipinjam"},
      {key:"sisa",label:"Sisa",render:(v,r)=>((Number(r.jumlahAwal)||0)-(Number(r.dipinjam)||0))},
      {key:"jumlahAkhir",label:"Jml Akhir"},
    ],
  });
};

/* ---------- DENAH TEMPAT DUDUK ---------- */
PAGES.denahTD = function(){
  return crudSection({
    store:"denahTD", title:"Denah Tempat Duduk",
    desc:"Penempatan posisi duduk siswa di kelas (baris & kolom meja).",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"baris",label:"Baris",type:"number",required:true},
      {key:"kolom",label:"Kolom",type:"number",required:true},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"baris",label:"Baris"},{key:"kolom",label:"Kolom"},{key:"keterangan",label:"Keterangan"},
    ],
  });
};

/* ---------- JADWAL PIKET KEBERSIHAN ---------- */
PAGES.jadwalPiket = function(){
  return crudSection({
    store:"jadwalPiket", title:"Jadwal Piket Kebersihan",
    desc:"Pembagian jadwal piket kebersihan kelas per hari.",
    fields:[
      {key:"hari",label:"Hari",type:"select",options:HARI,required:true},
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[
      {key:"hari",label:"Hari",render:v=>`<span class="badge badge-blue">${escapeHtml(v)}</span>`},
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"keterangan",label:"Keterangan"},
    ],
  });
};

/* ---------- KELOMPOK BELAJAR ---------- */
PAGES.kelompokBelajar = function(){
  return crudSection({
    store:"kelompokBelajar", title:"Pembagian Kelompok Belajar",
    desc:"Pembagian siswa ke dalam kelompok belajar A, B, C, D.",
    fields:[
      {key:"kelompok",label:"Kelompok",type:"select",options:["A","B","C","D"],required:true},
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[
      {key:"kelompok",label:"Kelompok",render:v=>`<span class="badge badge-green">Kelompok ${escapeHtml(v)}</span>`},
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"keterangan",label:"Keterangan"},
    ],
  });
};

/* ---------- ALOKASI WAKTU MAPEL ---------- */
PAGES.alokasiWaktu = function(){
  return crudSection({
    store:"alokasiWaktu", title:"Alokasi Waktu Mata Pelajaran",
    desc:"Alokasi jam pelajaran per mata pelajaran sesuai struktur kurikulum kelas 1.",
    fields:[
      {key:"mapel",label:"Mata Pelajaran",type:"select",options:MAPEL_LIST,required:true},
      {key:"jamPelajaran",label:"Alokasi Waktu (Jam Pelajaran)",type:"number",required:true},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[{key:"mapel",label:"Mata Pelajaran"},{key:"jamPelajaran",label:"Jam Pelajaran/Minggu"},{key:"keterangan",label:"Keterangan"}],
  });
};

/* ---------- DAFTAR BIMBINGAN ---------- */
PAGES.bimbingan = function(){
  return crudSection({
    store:"bimbingan", title:"Daftar Bimbingan",
    desc:"Catatan bimbingan individu, kelompok, atau sosial terhadap peserta didik.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tanggal",label:"Hari/Tanggal",type:"date",required:true},
      {key:"jenis",label:"Jenis Bimbingan",type:"select",options:["Individu","Kelompok","Sosial"],required:true},
      {key:"tindakLanjut",label:"Tindak Lanjut",type:"textarea"},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"jenis",label:"Jenis",render:v=>`<span class="badge badge-blue">${escapeHtml(v)}</span>`},
      {key:"tindakLanjut",label:"Tindak Lanjut"},
    ],
  });
};

/* ---------- KONSULTASI GURU KE ORANG TUA ---------- */
PAGES.konsultasiOrtu = function(){
  return crudSection({
    store:"konsultasiOrtu", title:"Konsultasi Guru dengan Orang Tua",
    desc:"Catatan konsultasi antara guru dan orang tua/wali murid.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tanggal",label:"Hari/Tanggal",type:"date",required:true},
      {key:"uraian",label:"Uraian Konsultasi",type:"textarea",required:true},
      {key:"tanggapan",label:"Tanggapan",type:"textarea"},
      {key:"tindakLanjut",label:"Tindak Lanjut",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"uraian",label:"Uraian",render:v=>escapeHtml((v||"").slice(0,50))+((v||"").length>50?"...":"")},
    ],
  });
};

/* ---------- TABUNGAN SISWA ---------- */
PAGES.tabunganSiswa = function(){
  return crudSection({
    store:"tabunganSiswa", title:"Tabungan Siswa",
    desc:"Catatan setoran/pembagian tabungan siswa kelas.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tanggal",label:"Hari/Tanggal",type:"date",required:true},
      {key:"jumlah",label:"Jumlah (Rp)",type:"number",required:true},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"jumlah",label:"Jumlah",render:v=>"Rp "+Number(v||0).toLocaleString("id-ID")},
      {key:"keterangan",label:"Keterangan"},
    ],
  });
};

/* ---------- BUKU PENGAMBILAN RAPOR ---------- */
PAGES.pengambilanRapot = function(){
  return crudSection({
    store:"pengambilanRapot", title:"Buku Pengambilan Rapor",
    desc:"Catatan pengambilan rapor oleh orang tua/wali per semester.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"semester",label:"Semester",type:"select",options:["Semester 1","Semester 2"],required:true},
      {key:"tanggal",label:"Tanggal Pengambilan",type:"date"},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"semester",label:"Semester"},{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"keterangan",label:"Keterangan"},
    ],
  });
};

/* ---------- DAFTAR KENAIKAN KELAS ---------- */
PAGES.kenaikanKelas = function(){
  return crudSection({
    store:"kenaikanKelas", title:"Daftar Kenaikan Kelas",
    desc:"Rekap keputusan kenaikan kelas peserta didik pada akhir tahun ajaran.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tahunAjaran",label:"Tahun Ajaran"},
      {key:"keputusan",label:"Keputusan",type:"select",options:["Naik Kelas","Tidak Naik Kelas"],required:true},
      {key:"keterangan",label:"Keterangan"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml(siswaName(v))},
      {key:"tahunAjaran",label:"Tahun Ajaran"},
      {key:"keputusan",label:"Keputusan",render:v=>`<span class="badge ${v==='Naik Kelas'?'badge-green':'badge-red'}">${escapeHtml(v)}</span>`},
      {key:"keterangan",label:"Keterangan"},
    ],
  });
};

/* DIHAPUS (v2.2): Halaman Digital Pen dihapus dari navigasi —
   fitur OCR tidak berfungsi offline & nilai administratif rendah.
   Data lama di db.tulisan tetap tersimpan (tidak dihapus). */
/* ---------- BACKUP & RESTORE (mencakup seluruh kelas) ---------- */
function collectFullBackupPayload(){
  saveDB(); // pastikan kelas aktif tersimpan dulu sebelum dikumpulkan
  const classes = {};
  CLASS_LIST.forEach(c=>{ classes[c.id] = loadClassDB(c.id); });
  return {
    shared: loadSharedDB(),
    classes,
    alumni: loadAlumni(),
    activeClassId,
    settings,
    exportedAt: new Date().toISOString(),
    appVersion: "2026.2-multikelas",
  };
}
function applyFullBackupPayload(payload){
  if(payload.classes){
    if(payload.shared) saveSharedDB(Object.assign(defaultSharedDB(), payload.shared));
    CLASS_LIST.forEach(c=>{ if(payload.classes[c.id]) saveClassDB(c.id, Object.assign(defaultClassDB(c.id), payload.classes[c.id])); });
  } else if(payload.db){
    // Kompatibilitas mundur: backup versi LAMA (satu kelas) dianggap milik Kelas 1
    const merged = Object.assign(defaultDB(), payload.db);
    const shared = {}; SHARED_FIELDS.forEach(k=> shared[k]=merged[k]);
    saveSharedDB(Object.assign(defaultSharedDB(), shared));
    const cls = {}; Object.keys(merged).forEach(k=>{ if(!SHARED_FIELDS.includes(k)) cls[k]=merged[k]; });
    cls.waliKelasId = merged.sekolah.waliKelasId||"";
    saveClassDB("kelas-1", cls);
  }
  if(payload.alumni) saveAlumni(payload.alumni);
  if(payload.settings){ settings = Object.assign(defaultSettings(), payload.settings); saveSettings(); applyTheme(); }
  activeClassId = (payload.activeClassId && CLASS_LIST.some(c=>c.id===payload.activeClassId)) ? payload.activeClassId : "kelas-1";
  localStorage.setItem(ACTIVE_CLASS_KEY, activeClassId);
  db = loadDB();
}
/* ============================================================
   BACKUP & SINKRON DATA (gabungan v2.2)
   Menggabungkan 3 halaman: Backup Lokal + Cloud Storage +
   Riwayat Backup Cloud — agar administrasi backup terpusat.
   ============================================================ */
PAGES.backup = function(){
  setTimeout(()=>{ if(typeof cloudUser!=="undefined" && cloudUser && typeof cloudRefreshList==="function") cloudRefreshList(); }, 30);
  const sizeKb = Math.round((JSON.stringify(collectFullBackupPayload()).length)/1024);
  const c = settings.cloud;
  const cloudUser_ = (typeof cloudUser!=="undefined") ? cloudUser : null;
  const notConfigured = (typeof cloudConfigured==="function") ? !cloudConfigured() : true;
  const logRows = (c.log||[]).slice().reverse().map(l=>`<tr><td>${fmtDate(l.waktu.slice(0,10))} ${l.waktu.slice(11,16)}</td><td>${escapeHtml(l.aktivitas||"")}</td>`
    + `<td><span class="badge ${l.status==="Berhasil"?"badge-green":"badge-red"}">${escapeHtml(l.status||"")}</span></td><td>${escapeHtml(l.keterangan||"")}</td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Backup &amp; Sinkron Data</h1><div class="desc">Pusat pencadangan: file lokal, Cloud Storage (Supabase), dan riwayat aktivitas — mencakup Kelas 1 s.d. Kelas 6.</div></div>
    <div class="grow"></div>${(typeof cloudStatusBadge==="function")?cloudStatusBadge():""}</div>

  ${notConfigured ? `<div class="card" style="background:var(--warn-soft);border-color:var(--warn);margin-bottom:16px;">
    <div style="display:flex;gap:10px;align-items:flex-start;">${ic("info",20)}
    <p style="margin:0;font-size:12.5px;">Konfigurasi Supabase belum diisi — backup cloud belum aktif. Buka file <code>supabase.js</code> di folder aplikasi untuk mengisi URL &amp; API key, atau cukup gunakan Backup Lokal di bawah.</p>
    </div></div>` : ``}

  <div class="grid grid-2" style="margin-bottom:16px;">
    <div class="card">
      <h3>${ic("download",16)} Backup Lokal (.json)</h3>
      <p class="muted">Ukuran data seluruh kelas saat ini: &plusmn; ${sizeKb} KB.</p>
      <button class="btn btn-primary" onclick="backupData()">${ic("download",15)} Unduh Backup</button>
    </div>
    <div class="card">
      <h3>${ic("upload",16)} Restore Lokal</h3>
      <p class="muted">Pilih file backup .json untuk memulihkan data.</p>
      <input type="file" id="restoreFile" accept=".json" style="margin-bottom:10px;">
      <button class="btn btn-primary" onclick="restoreData()">${ic("check",15)} Pulihkan Data</button>
    </div>
  </div>

  <div class="card" style="margin-bottom:16px;">
    <h3>${ic("backup",16)} Cloud Storage (Supabase)</h3>
    <div class="grid grid-3" style="margin-bottom:10px;">
      <div><div class="muted" style="font-size:11.5px;">Status Login</div><strong>${cloudUser_?escapeHtml(cloudUser_.email):"Belum login"}</strong></div>
      <div><div class="muted" style="font-size:11.5px;">Backup Terakhir</div><strong>${c.lastBackupAt?fmtDate(c.lastBackupAt.slice(0,10)):"-"}</strong></div>
      <div><div class="muted" style="font-size:11.5px;">Total Backup</div><strong>${c.totalBackup||0}</strong></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${cloudUser_
        ? `<button class="btn btn-primary" onclick="cloudBackupNow(false)">${ic("download",15)} Backup Cloud</button>
           <button class="btn" onclick="cloudBackupNow(true)">${ic("backup",15)} Sinkronkan Sekarang</button>
           <button class="btn" onclick="cloudRefreshList()">${ic("search",15)} Segarkan</button>
           <button class="btn btn-danger" onclick="cloudLogout()">Logout</button>`
        : `<button class="btn btn-primary" onclick="cloudLogin()">${ic("lock",15)} Login Cloud</button>`}
    </div>
    <div id="cloudListHolder" style="margin-top:12px;">${cloudUser_?`<p class="muted">Memuat daftar backup...</p>`:`<p class="muted">Masuk (login) terlebih dahulu untuk melihat daftar backup cloud.</p>`}</div>
  </div>

  <div class="card" style="margin-bottom:16px;">
    <h3>${ic("archive",16)} Riwayat Aktivitas Backup</h3>
    <div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Aktivitas</th><th>Status</th><th>Keterangan</th></tr></thead>
    <tbody>${logRows || `<tr><td colspan="4" class="empty-state">Belum ada aktivitas backup.</td></tr>`}</tbody></table></div>
  </div>

  <div class="card" style="border-color:var(--danger);">
    <h3 style="color:var(--danger);">${ic("trash",16)} Zona Berbahaya — Reset Aplikasi</h3>
    <p class="muted">Menghapus SELURUH data (semua kelas, sekolah, alumni) dan mengembalikan ke data awal.</p>
    <button class="btn btn-danger" onclick="resetApp()">Reset Seluruh Data</button>
  </div>`;
};
function backupData(){
  downloadBlob(JSON.stringify(collectFullBackupPayload(),null,2), "backup_teacher_planner_semua_kelas_"+todayISO()+".json", "application/json");
  toast("Backup seluruh kelas berhasil diunduh.");
}
function restoreData(){
  const inp = document.getElementById("restoreFile");
  if(!inp.files.length){ toast("Pilih file backup terlebih dahulu."); return; }
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const parsed = JSON.parse(e.target.result);
      applyFullBackupPayload(parsed);
      toast("Data berhasil dipulihkan."); buildSidebar(); renderPage("dashboard"); navigate("dashboard");
    }catch(err){ toast("File backup tidak valid."); }
  };
  reader.readAsText(inp.files[0]);
}
function resetApp(){
  confirmDialog("Yakin ingin mereset SELURUH data aplikasi (semua kelas) ke kondisi awal?", ()=>{
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SHARED_KEY);
    localStorage.removeItem(ALUMNI_KEY);
    CLASS_LIST.forEach(c=> localStorage.removeItem(classKey(c.id)));
    localStorage.removeItem(MIGRATION_FLAG_KEY);
    localStorage.setItem(ACTIVE_CLASS_KEY, "kelas-1");
    activeClassId = "kelas-1";
    db = loadDB(); saveDB();
    toast("Aplikasi telah direset."); buildSidebar(); renderPage("dashboard"); navigate("dashboard");
  });
}

