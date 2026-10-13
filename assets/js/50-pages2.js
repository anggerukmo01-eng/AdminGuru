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
    const tahun = Number(String(db.sekolah.tahunAjaran).match(/\d{4}/)?.[0] || new Date().getFullYear()) + (Number(bln)<7?1:0);
    const monthKey=tahun+"-"+bln;
    const masuk = db.mutasi.filter(m=>m.jenis==="Masuk" && (m.tanggal||"").slice(0,7)===monthKey).length;
    const keluar = db.mutasi.filter(m=>(m.jenis==="Pindah Keluar"||m.jenis==="Keluar/Putus Sekolah") && (m.tanggal||"").slice(0,7)===monthKey).length;
    let s=0,iz=0,a=0;
    Object.keys(db.kehadiran).forEach(tgl=>{
      if(tgl.slice(0,7)===monthKey) Object.values(db.kehadiran[tgl]).forEach(st=>{ if(st==="S")s++; else if(st==="I")iz++; else if(st==="A")a++; });
    });
    return `<tr><td>${nm}</td><td>${totalL}</td><td>${totalP}</td><td>${totalL+totalP}</td><td>${masuk}</td><td>${keluar}</td><td>${s}</td><td>${iz}</td><td>${a}</td></tr>`;
  }).join("");
  return `
  <div class="section-head"><div><h1>Rekap Jumlah Siswa Bulanan</h1><div class="desc">Jumlah L/P menunjukkan data siswa aktif saat ini; mutasi dan S/I/A dibatasi pada tahun pelajaran aktif. Rekonstruksi jumlah siswa historis per bulan memerlukan data riwayat lengkap.</div></div>
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
  setTimeout(()=>{
    if(typeof cloudUser!=="undefined" && cloudUser && typeof cloudRefreshList==="function") cloudRefreshList();
    if(typeof dbxIsConnected==="function" && dbxIsConnected()){ dbxRefreshList(); dbxRefreshAccount(); }
  }, 30);
  const sizeKb = Math.round((JSON.stringify(collectFullBackupPayload()).length)/1024);
  const c = settings.cloud;
  const cloudUser_ = (typeof cloudUser!=="undefined") ? cloudUser : null;
  const notConfigured = (typeof cloudConfigured==="function") ? !cloudConfigured() : true;
  const logRows = (c.log||[]).slice().reverse().map(l=>`<tr><td>${fmtDate(l.waktu.slice(0,10))} ${l.waktu.slice(11,16)}</td><td>${escapeHtml(l.aktivitas||"")}</td>`
    + `<td><span class="badge ${l.status==="Berhasil"?"badge-green":"badge-red"}">${escapeHtml(l.status||"")}</span></td><td>${escapeHtml(l.keterangan||"")}</td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Backup &amp; Sinkron Data</h1><div class="desc">Pusat pencadangan: file lokal, Cloud Storage (Supabase &amp; Dropbox), dan riwayat aktivitas — mencakup Kelas 1 s.d. Kelas 6.</div></div>
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
        : `<button class="btn btn-primary" onclick="cloudOpenAuthModal()">${ic("lock",15)} Login Cloud</button>`}
    </div>
    <div id="cloudListHolder" style="margin-top:12px;">${cloudUser_?`<p class="muted">Memuat daftar backup...</p>`:`<p class="muted">Masuk (login) terlebih dahulu untuk melihat daftar backup cloud.</p>`}</div>
  </div>

  <div class="card" style="margin-bottom:16px;">
    <h3>${ic("backup",16)} Dropbox</h3>
    <div class="grid grid-3" style="margin-bottom:10px;">
      <div><div class="muted" style="font-size:11.5px;">Status</div><strong id="dbxStatusText">${(typeof dbxIsConnected==="function"&&dbxIsConnected())?"Terhubung":"Belum terhubung"}</strong></div>
      <div><div class="muted" style="font-size:11.5px;">Akun</div><strong id="dbxAccountText">-</strong></div>
      <div><div class="muted" style="font-size:11.5px;">Folder</div><strong>/backup &amp; /dokumen</strong></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      ${(typeof dbxIsConnected==="function"&&dbxIsConnected())
        ? `<button class="btn btn-primary" onclick="dbxBackupNow()">${ic("download",15)} Backup ke Dropbox</button>
           <button class="btn" onclick="dbxRefreshList()">${ic("search",15)} Segarkan</button>
           <button class="btn btn-danger" onclick="dbxLogout()">Putuskan</button>`
        : `<button class="btn btn-primary" onclick="dbxLogin()">${ic("lock",15)} Hubungkan Dropbox</button>
           <span class="muted">Login sekali via popup resmi Dropbox — token tersimpan di perangkat ini.</span>`}
    </div>
    <div id="dbxListHolder" style="margin-top:12px;"><p class="muted">Hubungkan Dropbox untuk melihat daftar backup.</p></div>
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

/* ============================================================
   SINKRON DAPODIK — Web Service Dapodik (seperti e-Rapor)
   Pengaturan: Dapodik > Pengaturan > Web Service > Tambah > salin token.
   CATATAN: hanya berfungsi bila AdminGuru dibuka LOKAL (satu jaringan
   dengan server Dapodik). Dari situs publik, browser memblokir akses
   ke jaringan lokal (mixed content / PNA / CORS).
   ============================================================ */
const DAPO_CFG_KEY = "tpsd2026_dapodik_cfg";
function dapoCfgGet(){
  let cfg = {};
  try{ cfg = JSON.parse(localStorage.getItem(DAPO_CFG_KEY)||"{}"); }catch(e){}
  return { host: cfg.host||"localhost", port: cfg.port||5774,
           npsn: cfg.npsn||"", token: cfg.token||"", semester: cfg.semester||dapoSemesterNow() };
}
function dapoSemesterNow(){
  const d = new Date(), y = d.getFullYear(), m = d.getMonth()+1;
  // TP mulai Juli: Jul-Des = ganjil (tahun sama), Jan-Jun = genap (TP tahun sebelumnya)
  if(m>=7) return String(y)+"1";
  return String(y-1)+"2";
}
function dapoSaveCfg(){
  const cfg = { host: document.getElementById("dapoHost").value.trim()||"localhost",
    port: parseInt(document.getElementById("dapoPort").value||"5774",10)||5774,
    npsn: document.getElementById("dapoNpsn").value.trim(),
    token: document.getElementById("dapoToken").value.trim(),
    semester: document.getElementById("dapoSemester").value.trim() };
  localStorage.setItem(DAPO_CFG_KEY, JSON.stringify(cfg));
  toast("Pengaturan Dapodik tersimpan (hanya di perangkat ini).");
  return cfg;
}
function dapoPick(o, names){
  for(const n of names){ const v = o && o[n]; if(v!==undefined && v!==null && String(v).trim()!=="") return String(v).trim(); }
  return "";
}
async function dapoFetch(cfg, endpoint, extra){
  const params = Object.assign({npsn: cfg.npsn}, extra||{});
  const url = "http://" + cfg.host + ":" + cfg.port + "/WebService/" + endpoint + "?" + new URLSearchParams(params).toString();
  let res;
  try{ res = await fetch(url, { headers: { "Authorization": "Bearer " + cfg.token } }); }
  catch(e){ throw new Error("network"); }
  if(res.status===401 || res.status===403) throw new Error("auth");
  if(!res.ok) throw new Error("http"+res.status);
  const data = await res.json();
  if(Array.isArray(data)) return data;
  return data.rows || data.data || [];
}
function dapoErrMsg(e, cfg){
  if(e.message==="network"){
    return "Tidak bisa menjangkau Dapodik di http://" + cfg.host + ":" + cfg.port + ". " +
      "Kemungkinan penyebab: (1) AdminGuru dibuka dari situs publik sehingga browser memblokir akses jaringan lokal — " +
      "gunakan salinan LOKAL AdminGuru; (2) Dapodik belum berjalan / alamat IP salah; (3) token Web Service belum dibuat di Dapodik " +
      "(Pengaturan > Web Service > Tambah).";
  }
  if(e.message==="auth") return "Token ditolak Dapodik (401/403). Periksa token Web Service di Dapodik > Pengaturan > Web Service.";
  return "Gagal: " + e.message;
}
PAGES.dapodik = function(){
  const cfg = dapoCfgGet();
  const isPublic = location.protocol==="https:" && !/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
  return `
  <div class="section-head"><div><h1>Sinkron Dapodik</h1>
    <div class="desc">Tarik data langsung dari Dapodik sekolah lewat Web Service — seperti e-Rapor.</div></div></div>
  ${isPublic ? `<div class="alert alert-warning">Anda membuka AdminGuru dari <strong>situs publik</strong>. Browser modern memblokir situs publik mengakses jaringan lokal, jadi tarik data kemungkinan <strong>gagal dari sini</strong>. Gunakan <strong>salinan lokal</strong> AdminGuru di komputer sekolah (satu jaringan dengan Dapodik).</div>` : ""}
  <div class="card">
    <h3 style="margin-top:0;">1. Pengaturan Koneksi</h3>
    <p class="muted" style="margin-top:0;">Di aplikasi Dapodik: <strong>Pengaturan &gt; Web Service &gt; Tambah</strong>, beri nama "AdminGuru", lalu salin tokennya ke sini.</p>
    <div class="form-grid">
      <div class="field"><label>Alamat Server Dapodik (IP/host)</label>
        <input id="dapoHost" value="${escapeHtml(cfg.host)}" placeholder="localhost atau 192.168.1.x"></div>
      <div class="field"><label>Port</label><input id="dapoPort" type="number" value="${cfg.port}"></div>
      <div class="field"><label>NPSN Sekolah</label><input id="dapoNpsn" value="${escapeHtml(cfg.npsn)}" placeholder="cth. 20304050"></div>
      <div class="field"><label>Semester ID</label><input id="dapoSemester" value="${escapeHtml(cfg.semester)}" placeholder="cth. 20261"></div>
      <div class="field" style="grid-column:1/-1;"><label>Token Web Service</label>
        <input id="dapoToken" type="password" value="${escapeHtml(cfg.token)}" placeholder="Tempel token dari Dapodik" autocomplete="off"></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
      <button class="btn" onclick="dapoSaveCfg()">${ic("check",15)} Simpan Pengaturan</button>
      <button class="btn btn-primary" onclick="dapoTest()">${ic("refresh",15)} Tes Koneksi</button>
    </div>
    <div id="dapoStatus" style="margin-top:12px;"></div>
  </div>
  <div class="card">
    <h3 style="margin-top:0;">2. Tarik Data</h3>
    <p class="muted" style="margin-top:0;">Data ditarik lalu ditampilkan sebagai <strong>pratinjau</strong> dulu. Yang diterapkan: siswa dicocokkan via NISN (yang baru ditambahkan, yang cocok diperbarui — kolom kosong tidak menimpa), PTK menggantikan daftar guru/tendik, profil sekolah diperbarui.</p>
    <label style="display:flex;gap:8px;align-items:center;margin:6px 0;"><input type="checkbox" id="dapoIncSekolah" checked> Profil Sekolah</label>
    <label style="display:flex;gap:8px;align-items:center;margin:6px 0;"><input type="checkbox" id="dapoIncPtk" checked> Guru &amp; Tendik (PTK)</label>
    <label style="display:flex;gap:8px;align-items:center;margin:6px 0;"><input type="checkbox" id="dapoIncSiswa" checked> Peserta Didik (semua rombel)</label>
    <button class="btn btn-primary" style="margin-top:10px;" onclick="dapoPull()">${ic("download",15)} Tarik &amp; Pratinjau</button>
    <div id="dapoPullStatus" style="margin-top:12px;"></div>
  </div>
  <div class="alert">Data hasil tarikan (termasuk NIK asli) hanya tersimpan di <strong>perangkat ini</strong> (localStorage browser) dan tidak dikirim ke mana pun. Samaran hanya berlaku untuk data bawaan di situs publik.</div>`;
};
async function dapoTest(){
  const cfg = dapoSaveCfg();
  const st = document.getElementById("dapoStatus");
  st.innerHTML = `<span class="muted">Menghubungi Dapodik...</span>`;
  try{
    const rows = await dapoFetch(cfg, "getSekolah");
    const sk = rows[0]||{};
    st.innerHTML = `<div class="alert alert-success">Koneksi BERHASIL. Sekolah: <strong>${escapeHtml(dapoPick(sk,["nama","nama_sekolah"])||"-")}</strong> (NPSN ${escapeHtml(dapoPick(sk,["npsn"])||cfg.npsn)})</div>`;
  }catch(e){ st.innerHTML = `<div class="alert alert-danger">${escapeHtml(dapoErrMsg(e, cfg))}</div>`; }
}
/* ---------- Mapping Dapodik -> AdminGuru ---------- */
function dapoTitleCase(s){ return String(s||"").toLowerCase().replace(/(^|[\s.\-'])\S/g, c=>c.toUpperCase()); }
function dapoTtl(pd){
  const t = dapoPick(pd,["tempat_lahir"]), tg = dapoPick(pd,["tanggal_lahir"]);
  if(!t && !tg) return "";
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  let tgl = tg;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(tg);
  if(m) tgl = parseInt(m[3],10) + " " + bulan[parseInt(m[2],10)-1] + " " + m[1];
  return (dapoTitleCase(t) + (tgl ? ", " + tgl : "")).trim();
}
function dapoMapPd(pd, classId){
  const ayahNama = dapoPick(pd,["nama_ayah"]), ibuNama = dapoPick(pd,["nama_ibu_kandung","nama_ibu"]);
  const pekAyah = dapoPick(pd,["pekerjaan_ayah_id_str","pekerjaan_ayah"]);
  const pekIbu = dapoPick(pd,["pekerjaan_ibu_id_str","pekerjaan_ibu"]);
  const mkOrtu = (pre)=>({ nama: dapoTitleCase(dapoPick(pd,["nama_"+pre])),
    tahunLahir: dapoPick(pd,["tahun_lahir_"+pre]),
    pendidikan: dapoPick(pd,["jenjang_pendidikan_"+pre+"_id_str","pendidikan_"+pre]),
    pekerjaan: dapoPick(pd,["pekerjaan_"+pre+"_id_str","pekerjaan_"+pre]),
    penghasilan: dapoPick(pd,["penghasilan_orang_tua_wali_id_str","penghasilan_"+pre]),
    nik: dapoPick(pd,["nik_"+pre]), agama:"Islam", wn:"Indonesia", alamat:"", hp:"" });
  const alamat = [dapoPick(pd,["alamat_jalan"]), dapoPick(pd,["nama_dusun"]),
    dapoPick(pd,["desa_kelurahan"]), dapoPick(pd,["kecamatan"])].filter(Boolean).join(", ");
  return {
    id: "dp" + String(pd.peserta_didik_id||pd.nisn||Math.random()).replace(/[^a-zA-Z0-9]/g,"").slice(0,20),
    nama: dapoTitleCase(dapoPick(pd,["nama"])),
    jk: dapoPick(pd,["jenis_kelamin"]).startsWith("P") ? "P" : "L",
    nis: dapoPick(pd,["nipd"]), nisn: dapoPick(pd,["nisn"]),
    ttl: dapoTtl(pd),
    agama: dapoPick(pd,["agama_id_str","nama_agama"])||"Islam",
    alamat: alamat,
    ayah: dapoTitleCase(ayahNama), ibu: dapoTitleCase(ibuNama), pekerjaanOrtu: pekAyah,
    bi: { nik: dapoPick(pd,["nik"]), noKK: dapoPick(pd,["no_kk","nomor_kk"]),
      tempatLahir: dapoTitleCase(dapoPick(pd,["tempat_lahir"])), tanggalLahir: dapoPick(pd,["tanggal_lahir"]),
      rt: dapoPick(pd,["rt"]), rw: dapoPick(pd,["rw"]), dusun: dapoPick(pd,["nama_dusun"]),
      kelurahan: dapoPick(pd,["desa_kelurahan"]), kecamatan: dapoPick(pd,["kecamatan"]),
      kodePos: dapoPick(pd,["kode_pos"]), jenisTinggal: dapoPick(pd,["jenis_tinggal_id_str","jenis_tinggal"]),
      transportasi: dapoPick(pd,["alat_transportasi_id_str","alat_transportasi"]),
      telepon: dapoPick(pd,["nomor_telepon_rumah"]), hp: dapoPick(pd,["nomor_telepon_seluler","no_hp"]),
      anakKe: dapoPick(pd,["anak_keberapa"]), jmlSaudara: dapoPick(pd,["jumlah_saudara_kandung"]),
      beratBadan: dapoPick(pd,["berat_badan"]), tinggiBadan: dapoPick(pd,["tinggi_badan"]),
      lingkarKepala: dapoPick(pd,["lingkar_kepala"]), jarakSekolah: dapoPick(pd,["jarak_rumah_ke_sekolah"]),
      kebutuhanKhusus: dapoPick(pd,["kebutuhan_khusus_id_str","kebutuhan_khusus"]),
      sekolahAsal: dapoPick(pd,["sekolah_asal"]),
      ayah: mkOrtu("ayah"), ibu: (function(){ const o = mkOrtu("ibu"); if(!o.nama) o.nama = dapoTitleCase(ibuNama); return o; })(),
      wali: mkOrtu("wali"),
      penerimaKIP: dapoPick(pd,["penerima_kip"]), nomorKIP: dapoPick(pd,["nomor_kip"]),
      nomorKKS: dapoPick(pd,["nomor_kks","no_kks"]), layakPIP: dapoPick(pd,["layak_pip"]),
      alasanPIP: dapoPick(pd,["alasan_layak_pip","alasan_pip"]),
      wn: "Indonesia", tinggalBersama: "Orang Tua" },
    _classId: classId
  };
}
function dapoMapPtk(p){
  return { id: "dp" + String(p.ptk_id||p.nip||Math.random()).replace(/[^a-zA-Z0-9]/g,"").slice(0,20),
    nama: dapoTitleCase(dapoPick(p,["nama"])), nip: dapoPick(p,["nip"]), nuptk: dapoPick(p,["nuptk"]),
    jk: dapoPick(p,["jenis_kelamin"]).startsWith("P") ? "P" : "L",
    tempatLahir: dapoTitleCase(dapoPick(p,["tempat_lahir"])), tglLahir: dapoPick(p,["tanggal_lahir"]),
    status: dapoPick(p,["status_kepegawaian_id_str","status_kepegawaian"]),
    jenisPTK: dapoPick(p,["jenis_ptk_id_str","jenis_ptk"]), jabatan: dapoPick(p,["tugas_tambahan_id_str","tugas_tambahan"]),
    agama: dapoPick(p,["agama_id_str","nama_agama"])||"Islam",
    alamat: dapoPick(p,["alamat_jalan"]), hp: dapoPick(p,["no_hp","nomor_telepon_seluler"]),
    email: dapoPick(p,["email"]), pangkat: dapoPick(p,["pangkat_golongan_id_str","pangkat_golongan"]) };
}
async function dapoPull(){
  const cfg = dapoSaveCfg();
  const st = document.getElementById("dapoPullStatus");
  const inc = { sekolah: document.getElementById("dapoIncSekolah").checked,
                ptk: document.getElementById("dapoIncPtk").checked,
                siswa: document.getElementById("dapoIncSiswa").checked };
  st.innerHTML = `<span class="muted">Menarik data dari Dapodik...</span>`;
  try{
    const out = { sekolah:null, guru:[], tendik:[], perKelas:{}, totalSiswa:0 };
    if(inc.sekolah){
      const rows = await dapoFetch(cfg, "getSekolah");
      if(rows[0]) out.sekolah = rows[0];
    }
    if(inc.ptk){
      const rows = await dapoFetch(cfg, "getGuru");
      rows.forEach(p=>{
        const jenis = dapoPick(p,["jenis_ptk_id_str","jenis_ptk"]).toLowerCase();
        const mapped = dapoMapPtk(p);
        if(/tendik|tenaga|administrasi|perpustakaan|laboran|penjaga/.test(jenis) && !/guru|kepala/.test(jenis)) out.tendik.push(mapped);
        else out.guru.push(mapped);
      });
    }
    if(inc.siswa){
      const rombelRows = await dapoFetch(cfg, "getRombel", { semester_id: cfg.semester });
      const rombelMap = {};
      rombelRows.forEach(r=>{
        const tingkat = parseInt(dapoPick(r,["tingkat_pendidikan_id","tingkat_pendidikan"]),10);
        if(tingkat>=1 && tingkat<=6) rombelMap[dapoPick(r,["rombongan_belajar_id"])] = "kelas-" + tingkat;
      });
      const pdRows = await dapoFetch(cfg, "getPesertaDidik");
      pdRows.forEach(pd=>{
        const cid = rombelMap[dapoPick(pd,["rombongan_belajar_id"])] || "";
        const stu = dapoMapPd(pd, cid);
        if(!cid) return; // lewati yang tidak terpetakan ke kelas 1-6
        (out.perKelas[cid] = out.perKelas[cid] || []).push(stu);
        out.totalSiswa++;
      });
    }
    window._dapoPull = { out, inc };
    const perKelasTxt = Object.keys(out.perKelas).sort().map(k=> k.replace("kelas-","Kelas ") + ": " + out.perKelas[k].length).join(" &middot; ");
    openModal({ title:"Pratinjau Tarik Data Dapodik", bodyHtml:`
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
        <div class="stat-card"><div class="stat-num">${out.totalSiswa}</div><div class="stat-label">Peserta Didik</div></div>
        <div class="stat-card"><div class="stat-num">${out.guru.length}</div><div class="stat-label">Guru</div></div>
        <div class="stat-card"><div class="stat-num">${out.tendik.length}</div><div class="stat-label">Tendik</div></div>
      </div>
      ${out.sekolah?`<p>Sekolah: <strong>${escapeHtml(dapoPick(out.sekolah,["nama","nama_sekolah"]))}</strong></p>`:""}
      ${perKelasTxt?`<p class="muted">${perKelasTxt}</p>`:""}
      <p class="muted" style="font-size:12px;">Siswa diterapkan dengan pencocokan NISN per kelas (baru ditambah, cocok diperbarui, tidak ada yang dihapus). PTK &amp; profil sekolah diperbarui menyeluruh dari Dapodik.</p>`,
      footHtml:`<button class="btn" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="dapoApply()">${ic("check",15)} Terapkan Data</button>` });
    st.innerHTML = "";
  }catch(e){ st.innerHTML = `<div class="alert alert-danger">${escapeHtml(dapoErrMsg(e, cfg))}</div>`; }
}
function dapoApply(){
  const pull = window._dapoPull;
  if(!pull) return;
  const { out, inc } = pull;
  if(inc.sekolah && out.sekolah){
    const sk = out.sekolah;
    const setIf = (key, val)=>{ if(val) db.sekolah[key] = val; };
    setIf("namaSekolah", dapoPick(sk,["nama","nama_sekolah"]));
    setIf("npsn", dapoPick(sk,["npsn"]));
    setIf("alamat", dapoPick(sk,["alamat_jalan"]));
    setIf("desa", dapoPick(sk,["desa_kelurahan"]));
    setIf("kecamatan", dapoPick(sk,["kecamatan"]));
    setIf("kabupaten", dapoPick(sk,["kabupaten_kota","kabupaten"]));
    setIf("provinsi", dapoPick(sk,["propinsi","provinsi"]));
    setIf("kodePos", dapoPick(sk,["kode_pos"]));
    setIf("email", dapoPick(sk,["email"]));
  }
  if(inc.ptk){ if(out.guru.length) db.guru = out.guru; if(out.tendik.length) db.tendik = out.tendik; }
  if(inc.siswa){
    Object.keys(out.perKelas).forEach(cid=>{
      const cls = loadClassDB(cid);
      cls.siswa = cls.siswa || [];
      const byNisn = {};
      cls.siswa.forEach(s=>{ if(s.nisn) byNisn[String(s.nisn).trim()] = s; });
      out.perKelas[cid].forEach(nu=>{
        const old = nu.nisn && byNisn[String(nu.nisn).trim()];
        if(old){
          const keepId = old.id;
          Object.keys(nu).forEach(k=>{ if(k==="_classId") return;
            const v = nu[k];
            if(v && typeof v==="object"){ old[k] = old[k]||{}; Object.keys(v).forEach(k2=>{ const vv = v[k2];
              if(vv && typeof vv==="object"){ old[k][k2] = old[k][k2]||{}; Object.keys(vv).forEach(k3=>{ if(String(vv[k3]).trim()!=="") old[k][k2][k3]=vv[k3]; }); }
              else if(String(vv).trim()!=="") old[k][k2]=vv; }); }
            else if(String(v).trim()!=="") old[k]=v; });
          old.id = keepId;
        }else{
          nu.no = cls.siswa.length + 1;
          delete nu._classId;
          cls.siswa.push(nu);
        }
      });
      cls.siswa.forEach((s,i)=>{ s.no = i+1; });
      saveClassDB(cid, cls);
    });
    db.siswa = loadClassDB(activeClassId).siswa || [];
  }
  saveDB();
  window._dapoPull = null;
  closeModal();
  toast("Data Dapodik diterapkan.");
  renderPage("dapodik");
}
