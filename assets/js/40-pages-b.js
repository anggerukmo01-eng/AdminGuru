/* ================================================================
   FILE: assets/js/40-pages-b.js (bagian 2 dari 2)
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   ================================================================ */
/* ---------- JADWAL PELAJARAN ---------- */
const HARI = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
/* Saran isian mapel: nama baku + kegiatan rutin (bebas diketik sendiri) */
const JADWAL_SARAN_MAPEL = ["Upacara","Literasi","Tadarus","Senam","Istirahat","Istirahat/Sholat Dhuha","Kokurikuler"];
function jadwalSaranMapel(){
  const s = new Set([...(typeof MAPEL_LIST!=="undefined"?MAPEL_LIST:[]), ...JADWAL_SARAN_MAPEL]);
  return [...s];
}
/* "07.00 - 07.35" / "07:00-07:35" -> ["07:00","07:35"] (untuk <input type="time">) */
function jadwalParseJam(jamStr){
  const m = String(jamStr||"").match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
  if(!m) return ["",""];
  const p = n=>String(n).padStart(2,"0");
  return [p(m[1])+":"+p(m[2]), p(m[3])+":"+p(m[4])];
}
function jadwalFmtJam(mulai, selesai){
  const f = t=>String(t||"").replace(":",".");
  return (mulai?f(mulai):"__.__")+" - "+(selesai?f(selesai):"__.__");
}
PAGES.jadwal = function(){
  db.jadwal = db.jadwal || {};
  HARI.forEach(h=>{ db.jadwal[h] = db.jadwal[h] || []; });
  const saran = jadwalSaranMapel().map(m=>`<option value="${escapeHtml(m)}">`).join("");
  let html = `<div class="section-head"><div><h1>Jadwal Pelajaran</h1><div class="desc">Kelas ${escapeHtml(db.sekolah.kelas)} &middot; Jam dan mata pelajaran tiap slot dapat diubah langsung. Perubahan struktur (tambah/hapus/salin hari) tersimpan otomatis; perubahan isian perlu menekan "Simpan Jadwal".</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="printJadwal()">${ic("print",15)} Cetak</button>
    <button class="btn btn-primary" onclick="saveJadwal()">${ic("check",15)} Simpan Jadwal</button></div>`;
  html += `<datalist id="datalistMapelJadwal">${saran}</datalist>`;
  html += `<div class="grid grid-3" id="jadwalGrid">`;
  HARI.forEach(h=>{
    html += `<div class="card"><h3 style="display:flex;align-items:center;justify-content:space-between;">${h}
      <select id="jd_copy_${h}" onchange="copyJadwalDari('${h}')" title="Salin seluruh slot dari hari lain ke ${h}" style="width:auto;padding:6px 8px;font-size:11.5px;font-weight:normal;">
        <option value="">Salin dari...</option>
        ${HARI.filter(x=>x!==h).map(x=>`<option value="${x}">${x}</option>`).join("")}
      </select></h3>`;
    if(!db.jadwal[h].length) html += `<p class="muted" style="font-size:12px;">Belum ada slot jam.</p>`;
    db.jadwal[h].forEach((slot,idx)=>{
      const [mulai, selesai] = jadwalParseJam(slot.jam);
      html += `<div class="field" style="border:1px solid var(--border);border-radius:10px;padding:8px;margin-bottom:8px;">
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
          <span class="muted" style="font-size:11px;white-space:nowrap;">Jam ke-${idx+1}</span>
          <input type="time" id="jd_mulai_${h}_${idx}" value="${mulai}" style="flex:1;min-width:0;padding:8px;" title="Jam mulai">
          <span class="muted">–</span>
          <input type="time" id="jd_selesai_${h}_${idx}" value="${selesai}" style="flex:1;min-width:0;padding:8px;" title="Jam selesai">
          <button class="btn btn-sm btn-icon btn-danger" onclick="removeSlot('${h}',${idx})" title="Hapus slot ini">${ic("trash",14)}</button>
        </div>
        <input id="jd_mapel_${h}_${idx}" list="datalistMapelJadwal" value="${escapeHtml(slot.mapel||"")}" placeholder="Mata pelajaran / kegiatan..." style="width:100%;" title="Ketik bebas atau pilih dari saran">
      </div>`;
    });
    html += `<button class="btn btn-sm" onclick="addSlot('${h}')">${ic("plus",14)} Tambah Jam</button></div>`;
  });
  html += `</div>`;
  return html;
};
function addSlot(h){
  db.jadwal[h] = db.jadwal[h] || [];
  const last = db.jadwal[h][db.jadwal[h].length-1];
  let mulai = "07:00";
  if(last){
    const s = jadwalParseJam(last.jam)[1];
    if(s) mulai = s;
  }
  const mnt = parseInt(mulai.slice(0,2),10)*60 + parseInt(mulai.slice(3),10) + 35;
  const selesai = String(Math.floor(mnt/60)).padStart(2,"0")+":"+String(mnt%60).padStart(2,"0");
  db.jadwal[h].push({jam: jadwalFmtJam(mulai, selesai), mapel:""});
  saveDB(); renderPage("jadwal");
  toast("Slot jam "+jadwalFmtJam(mulai, selesai)+" ditambahkan.");
}
function removeSlot(h,idx){ db.jadwal[h].splice(idx,1); saveDB(); renderPage("jadwal"); }
function copyJadwalDari(hTujuan){
  const el = document.getElementById("jd_copy_"+hTujuan);
  const hSumber = el ? el.value : "";
  if(!hSumber || hSumber===hTujuan) return;
  db.jadwal[hTujuan] = JSON.parse(JSON.stringify(db.jadwal[hSumber]||[]));
  saveDB(); renderPage("jadwal");
  toast("Jadwal hari "+hSumber+" disalin ke "+hTujuan+".");
}
function saveJadwal(){
  HARI.forEach(h=>{ (db.jadwal[h]||[]).forEach((slot,idx)=>{
    const e1 = document.getElementById(`jd_mulai_${h}_${idx}`);
    const e2 = document.getElementById(`jd_selesai_${h}_${idx}`);
    const e3 = document.getElementById(`jd_mapel_${h}_${idx}`);
    if(e1 && e2) slot.jam = jadwalFmtJam(e1.value, e2.value);
    if(e3) slot.mapel = e3.value.trim();
  }); });
  saveDB(); toast("Jadwal pelajaran tersimpan.");
}
function printJadwal(){
  let body = `<table><thead><tr>${HARI.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>`;
  const maxRows = Math.max(0, ...HARI.map(h=>(db.jadwal[h]||[]).length));
  for(let i=0;i<maxRows;i++){
    body += `<tr>`;
    HARI.forEach(h=>{
      const s = (db.jadwal[h]||[])[i];
      body += `<td>${s?`<span class="muted" style="font-size:11px;">${escapeHtml(s.jam||"")}</span><br><strong>${escapeHtml(s.mapel||"-")}</strong>`:""}</td>`;
    });
    body += `</tr>`;
  }
  body += `</tbody></table>`;
  printDocument("JADWAL PELAJARAN KELAS "+String(db.sekolah.kelas||"").toUpperCase(), body);
}

/* ---------- AGENDA / JURNAL HARIAN ---------- */
function agendaFields(){
  // Komponen jurnal mengajar lazim (Kurikulum Merdeka): tanggal, mapel,
  // materi/TP, kegiatan, penilaian, refleksi & tindak lanjut.
  return [
    {key:"tanggal",label:"Tanggal",type:"date",required:true},
    {key:"mapel",label:"Mata Pelajaran",type:"select",options:[...MAPEL_LIST,"Kokurikuler"]},
    {key:"materi",label:"Materi / Tujuan Pembelajaran"},
    {key:"kegiatan",label:"Kegiatan Pembelajaran (pembuka - inti - penutup)",type:"textarea",required:true},
    {key:"penilaian",label:"Penilaian / Asesmen yang Dilakukan",type:"textarea"},
    {key:"refleksi",label:"Refleksi & Tindak Lanjut",type:"textarea"},
    {key:"catatan",label:"Catatan / Kendala",type:"textarea"},
    {key:"pengingatAktif",label:"Aktifkan Pengingat?",type:"select",options:["Tidak","Ya"]},
    {key:"pengingatJam",label:"Jam Pengingat (jika aktif)",type:"time",placeholder:"19.00"},
    {key:"pengingatMenit",label:"Ingatkan Berapa Menit Sebelumnya",type:"select",options:[
      {value:"0",label:"Tepat pada jam tersebut"},
      {value:"15",label:"15 menit sebelumnya"},
      {value:"30",label:"30 menit sebelumnya"},
      {value:"60",label:"1 jam sebelumnya"},
      {value:"1440",label:"1 hari sebelumnya"},
    ]},
  ];
}
PAGES.agenda = function(){
  const crudHtml = crudSection({
    store:"agenda", title:"Agenda / Jurnal Harian Guru (Catatan Teks)",
    desc:"Catatan kegiatan mengajar harian sebagai bukti fisik jurnal mengajar.",
    fields: agendaFields(),
    columns:[{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"mapel",label:"Mapel"},{key:"materi",label:"Materi/TP"},{key:"kegiatan",label:"Kegiatan",render:v=>escapeHtml((v||"").slice(0,60))+((v||"").length>60?"...":"")}],
    searchKeys:["kegiatan","mapel","catatan"]
  });

  const filters = window._jurnalFileFilters || {kategori:"Jurnal Mengajar", kelasId:activeClassId, mapel:"", semester:"", q:""};
  filters.kategori = "Jurnal Mengajar";
  window._jurnalFileFilters = filters;
  window._arsipOnRefresh = ()=> renderArsipListInto("jurnalFileListHolder", window._jurnalFileFilters);
  setTimeout(window._arsipOnRefresh, 0);

  const remJurnalToday = (db.agenda||[]).filter(a=>a.tanggal===todayISO() && a.pengingatAktif==="Ya");
  const remJurnalCard = remJurnalToday.length ? `
  <div class="card" style="background:var(--accent-soft);border-color:var(--accent);margin-bottom:16px;">
    <h3 style="font-size:13px;">${ic("bell",16)} Pengingat Jurnal Hari Ini (${fmtDate(todayISO())})</h3>
    ${remJurnalToday.map(r=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12.5px;">
      <span><strong>${escapeHtml(r.mapel||"Jurnal")}</strong> <span class="muted">— ${escapeHtml((r.materi||"").split("\n")[0].slice(0,60))}</span></span>
      <span class="badge badge-blue">${escapeHtml(r.pengingatJam||'-')}</span></div>`).join("")}
  </div>` : "";

  return `
  <div class="section-head"><div><h1>Jurnal Mengajar</h1><div class="desc">Unggah scan/foto/PDF jurnal mengajar -- teks di dalamnya dapat dibaca otomatis dengan OCR agar mudah dicari, dan dokumen asli tetap tersimpan sebagai arsip.</div></div>
    <div class="grow"></div>
    <button class="btn btn-primary" onclick="uploadArsipFile({title:'Upload Scan Jurnal Mengajar', kategori:'Jurnal Mengajar', kelasId:activeClassId, showTanggalMengajar:true, enableOcr:true, onDone:window._arsipOnRefresh})">${ic("upload",15)} Upload Scan Jurnal</button>
  </div>
  ${remJurnalCard}

  <div class="card" style="margin-bottom:16px;">
    <h3 style="font-size:14px;margin-bottom:10px;">${ic("upload",16)} Scan / Foto / PDF Jurnal Terunggah</h3>
    <div class="toolbar">
      <div class="search-box">${ic("search",16)}<input placeholder="Cari nama file / mapel / isi hasil OCR..." value="${escapeHtml(filters.q)}" oninput="window._jurnalFileFilters.q=this.value; window._arsipOnRefresh();"></div>
      <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._jurnalFileFilters.kelasId=this.value; window._arsipOnRefresh();">
        <option value="">Semua Kelas</option>
        ${CLASS_LIST.map(c=>`<option value="${c.id}" ${filters.kelasId===c.id?"selected":""}>${escapeHtml(c.label)}</option>`).join("")}
      </select>
      <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._jurnalFileFilters.mapel=this.value; window._arsipOnRefresh();">
        <option value="">Semua Mapel</option>
        ${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${filters.mapel===m?"selected":""}>${escapeHtml(m)}</option>`).join("")}
      </select>
    </div>
    <div id="jurnalFileListHolder"><p class="muted">Memuat file...</p></div>
  </div>

  <div class="card"><h3 style="font-size:14px;margin-bottom:10px;">${ic("book",16)} Catatan Jurnal (Teks)</h3>${crudHtml}</div>`;
};

/* ---------- PROGRAM TAHUNAN & SEMESTER (dokumen naratif, auto-isi dari data kurikulum) ---------- */
function docEditorPage(store, title, desc, templateFn){
  db[store] = db[store] || {isi:""};
  if(!db[store].isi) db[store].isi = templateFn();
  return `
  <div class="section-head"><div><h1>${title}</h1><div class="desc">${desc}</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="regenerateDoc('${store}')">${ic("target",15)} Buat Ulang Otomatis</button>
    <button class="btn" onclick="printDocGeneric('${store}','${title}')">${ic("print",15)} Cetak</button>
    <button class="btn" onclick="exportDocWord('${store}','${title}')">${ic("doc",15)} Word</button>
  </div>
  <div class="card">
    <div class="field"><label>Isi Dokumen (dapat disunting bebas)</label><textarea id="docText_${store}" style="min-height:460px;font-family:'Consolas',monospace;font-size:12.5px;">${escapeHtml(db[store].isi)}</textarea></div>
    <button class="btn btn-primary" onclick="saveDocGeneric('${store}')">${ic("check",15)} Simpan</button>
  </div>`;
}
window._docTemplateFn = {};
function regenerateDoc(store){
  confirmDialog("Ini akan MENGGANTI isi dokumen saat ini dengan hasil susunan otomatis terbaru berdasarkan data Sekolah, ATP, dan Kalender Pendidikan. Perubahan manual sebelumnya akan tertimpa. Lanjutkan?", ()=>{
    db[store].isi = window._docTemplateFn[store]();
    saveDB(); toast("Dokumen disusun ulang."); renderPage(store==="programTahunan"?"progtahunan":"progsemester");
  });
}
function saveDocGeneric(store){
  db[store].isi = document.getElementById("docText_"+store).value;
  saveDB(); toast("Dokumen tersimpan.");
}
function printDocGeneric(store,title){
  const html = "<pre style='white-space:pre-wrap;font-family:inherit;font-size:11.5px;line-height:1.55;'>"+escapeHtml(db[store].isi)+"</pre>";
  printDocument(title.toUpperCase()+" - KELAS "+db.sekolah.kelas.toUpperCase()+" T.A. "+db.sekolah.tahunAjaran, html);
}
function exportDocWord(store,title){
  const html = "<pre style='white-space:pre-wrap;font-family:Consolas,monospace;font-size:10.5pt;'>"+escapeHtml(db[store].isi)+"</pre>";
  htmlToWordDoc(letterheadHtml()+`<div class="doc-title">${escapeHtml(title.toUpperCase())}</div>`+html, title.replace(/\s+/g,"_"), title);
}

// Hitung jumlah minggu efektif semester dari rentang tanggal Kalender
// Pendidikan (dibatasi oleh entri "Libur Semester").
function hitungMingguSemester(mulaiISO, akhirISO){
  const a = new Date(mulaiISO+"T00:00:00"), b = new Date(akhirISO+"T00:00:00");
  const hari = Math.round((b-a)/86400000);
  return Math.max(1, Math.round(hari/7));
}

function buildProgramTahunanText(){
  const s = db.sekolah;
  const mingguGasal = hitungMingguSemester("2026-07-13","2026-12-18"); // s.d. penyerahan rapor gasal
  const mingguGenap = hitungMingguSemester("2027-01-04","2027-06-18"); // s.d. penyerahan rapor genap
  let jpTable = "No | Mata Pelajaran                              | Intrakurikuler | Kokurikuler | Total JP/Tahun | JP/Minggu\n";
  jpTable += "---|-----------------------------------------------|----------------|-------------|-----------------|----------\n";
  JP_STRUKTUR_KELAS1.filter(r=>r.total>0).forEach((r,i)=>{
    jpTable += `${String(i+1).padEnd(2)} | ${r.mapel.padEnd(47)} | ${String(r.intra).padStart(6)} JP    | ${String(r.koku).padStart(5)} JP   | ${String(r.total).padStart(9)} JP   | ${String(r.jpMinggu).padStart(2)} JP\n`;
  });
  const atpBySem1 = db.atp.filter(a=>a.semester==="1");
  const atpBySem2 = db.atp.filter(a=>a.semester==="2");
  function ringkasTP(list){
    const byMapel = {};
    list.forEach(a=>{ (byMapel[a.mapel]=byMapel[a.mapel]||[]).push(a.tp); });
    return Object.keys(byMapel).map(m=>` - ${m} (${byMapel[m].length} TP):\n   ${byMapel[m].map((t,i)=>`${i+1}. ${t}`).join("\n   ")}`).join("\n");
  }
  return `PROGRAM TAHUNAN
================
Satuan Pendidikan : ${s.namaSekolah}
Kelas / Fase      : ${s.kelas} / Fase A
Tahun Ajaran      : ${s.tahunAjaran}
Wali Kelas        : ${(db.guru.find(g=>g.id===s.waliKelasId)||{}).nama || "[Diisi Guru]"}

DASAR HUKUM
1. Undang-Undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional.
2. Peraturan Pemerintah No. 57 Tahun 2021 jo. No. 4 Tahun 2022 tentang Standar Nasional Pendidikan.
3. Permendikbudristek No. 12 Tahun 2024 tentang Kurikulum pada PAUD, Dikdas, dan Dikmen, sebagaimana diubah dengan Permendikdasmen No. 13 Tahun 2025 (pendekatan Pembelajaran Mendalam, berlaku 15 Juli 2025).
4. Permendikdasmen No. 10 Tahun 2025 tentang Standar Kompetensi Lulusan (8 Dimensi Profil Lulusan).
5. Keputusan Kepala BSKAP Kemendikdasmen No. 046/H/KR/2025 tentang Capaian Pembelajaran pada PAUD, Dikdas, dan Dikmen.
6. Keputusan Kepala Dinas Pendidikan Provinsi Jawa Tengah No. 400.3/23862/2026 tentang Pedoman Penyusunan Kalender Pendidikan Tahun Ajaran 2026/2027.

I. MINGGU EFEKTIF (mengacu Kalender Pendidikan Prov. Jawa Tengah T.A. 2026/2027)
   Semester 1 (Ganjil) : 13 Juli 2026 s.d. 18 Desember 2026  (+/- ${mingguGasal} minggu, termasuk minggu penilaian & jeda)
   Semester 2 (Genap)  : 4 Januari 2027 s.d. 18 Juni 2027   (+/- ${mingguGenap} minggu, termasuk minggu penilaian & jeda)
   Catatan: rincian pekan efektif final agar dihitung ulang oleh satuan pendidikan menggunakan Kalender Pendidikan pada menu terkait (dikurangi hari libur, PTS/PAS/PAT, dan cadangan).

II. ALOKASI WAKTU MATA PELAJARAN KELAS 1 (Struktur Kurikulum Permendikbudristek No. 12/2024 jo. Permendikdasmen No. 13/2025; asumsi 36 minggu/tahun, 1 JP = 35 menit)
${jpTable}
Catatan: Kokurikuler dilaksanakan dalam bentuk pembelajaran kolaboratif lintas disiplin/Gerakan 7 Kebiasaan Anak Indonesia Hebat (Pasal 16-19 Permendikdasmen No. 13/2025), bukan lagi bernama "P5". Muatan Lokal & jenis Seni menyesuaikan kebijakan satuan pendidikan/daerah.

III. TUJUAN PEMBELAJARAN (TP) PER SEMESTER (diturunkan dari CP Fase A - lihat menu ATP untuk versi lengkap dan dapat disunting)

SEMESTER 1 (GANJIL)
${ringkasTP(atpBySem1) || " (Belum ada data ATP - buka menu ATP lalu klik 'Buat/Segarkan Ulang dari CP')"}

SEMESTER 2 (GENAP)
${ringkasTP(atpBySem2) || " (Belum ada data ATP - buka menu ATP lalu klik 'Buat/Segarkan Ulang dari CP')"}

IV. PRINSIP PELAKSANAAN
Pembelajaran dilaksanakan dengan pendekatan Pembelajaran Mendalam yang berkesadaran (mindful), bermakna (meaningful), dan menggembirakan (joyful), melalui pengalaman belajar Memahami - Mengaplikasi - Merefleksi, guna mewujudkan 8 Dimensi Profil Lulusan (Permendikdasmen No. 10/2025): keimanan & ketakwaan, kewargaan, penalaran kritis, kreativitas, kolaborasi, kemandirian, kesehatan, dan komunikasi.

Mengetahui,                                          ${db.sekolah.desa}, ${fmtDate(todayISO())}
Kepala Sekolah,                                       Guru Kelas ${s.kelas},


${s.kepalaSekolah}                                    ${(db.guru.find(g=>g.id===s.waliKelasId)||{}).nama || "___________________"}
NIP. ${s.nipKepsek}                                   NIP. ${(db.guru.find(g=>g.id===s.waliKelasId)||{}).nip || "___________________"}`;
}

function buildProgramSemesterText(){
  const s = db.sekolah;
  const isGanjil = (s.semester||"").includes("1");
  const bulanList = isGanjil
    ? [["Juli 2026","2026-07"],["Agustus 2026","2026-08"],["September 2026","2026-09"],["Oktober 2026","2026-10"],["November 2026","2026-11"],["Desember 2026","2026-12"]]
    : [["Januari 2027","2027-01"],["Februari 2027","2027-02"],["Maret 2027","2027-03"],["April 2027","2027-04"],["Mei 2027","2027-05"],["Juni 2027","2027-06"]];
  const semKey = isGanjil ? "1" : "2";
  const atpSem = db.atp.filter(a=>a.semester===semKey);
  const byMapel = {};
  atpSem.forEach(a=>{ (byMapel[a.mapel]=byMapel[a.mapel]||[]).push(a); });

  // Sebaran kegiatan penting bulan berjalan dari Kalender Pendidikan
  const kalenderBulanIni = m => db.kalender.filter(k=>k.tanggal.startsWith(m)).map(k=>`${fmtDate(k.tanggal)}: ${k.judul}`);

  let header = "No | Mata Pelajaran / TP".padEnd(58) + bulanList.map(b=>b[0].slice(0,3)).join(" | ") + "\n";
  header += "-".repeat(58+bulanList.length*6) + "\n";
  let body = "";
  let no = 1;
  Object.keys(byMapel).forEach(m=>{
    body += `${String(no++).padEnd(2)} | ${m}\n`;
    byMapel[m].forEach(tpRow=>{
      const label = "   - "+tpRow.tp.slice(0,70)+(tpRow.tp.length>70?"...":"");
      body += label.padEnd(58) + bulanList.map(()=>" .. ").join(" | ") + "\n";
    });
  });

  let kalenderInfo = "";
  bulanList.forEach(b=>{
    const items = kalenderBulanIni(b[1]);
    if(items.length) kalenderInfo += `\n${b[0]}:\n` + items.map(i=>"  - "+i).join("\n") + "\n";
  });

  return `PROGRAM SEMESTER
================
Satuan Pendidikan : ${s.namaSekolah}
Kelas / Fase      : ${s.kelas} / Fase A
Semester          : ${s.semester}
Tahun Ajaran      : ${s.tahunAjaran}

DASAR: Capaian Pembelajaran Fase A (Kepbadan BSKAP No. 046/H/KR/2025), Struktur Kurikulum (Permendikbudristek 12/2024 jo. Permendikdasmen 13/2025), dan Kalender Pendidikan Provinsi Jawa Tengah T.A. 2026/2027 (Kepdisdik Jateng No. 400.3/23862/2026).

I. DISTRIBUSI TUJUAN PEMBELAJARAN PER BULAN
(Tanda ".." pada kolom bulan agar diisi/disesuaikan guru sesuai kecepatan belajar rombel; gunakan menu ATP untuk detail lengkap tiap TP.)

${header}${body || " (Belum ada data ATP untuk semester ini - buka menu ATP lalu klik 'Buat/Segarkan Ulang dari CP', lalu buat ulang dokumen ini.)"}

II. AGENDA PENTING BULAN BERJALAN (dari menu Kalender Pendidikan)
${kalenderInfo || " (Belum ada agenda tersimpan pada rentang bulan semester ini.)"}

III. CATATAN
- Asesmen formatif dilaksanakan menyatu dengan proses pembelajaran sepanjang semester.
- Asesmen sumatif lingkup materi/tengah semester/akhir semester dijadwalkan menyesuaikan Kalender Pendidikan satuan pendidikan.
- Kokurikuler (pembelajaran kolaboratif lintas disiplin / 7 Kebiasaan Anak Indonesia Hebat) dijadwalkan tersendiri di luar tabel intrakurikuler di atas.

Mengetahui,                                          ${db.sekolah.desa}, ${fmtDate(todayISO())}
Kepala Sekolah,                                       Guru Kelas ${s.kelas},


${s.kepalaSekolah}                                    ${(db.guru.find(g=>g.id===s.waliKelasId)||{}).nama || "___________________"}
NIP. ${s.nipKepsek}                                   NIP. ${(db.guru.find(g=>g.id===s.waliKelasId)||{}).nip || "___________________"}`;
}

PAGES.progtahunan = function(){
  window._docTemplateFn.programTahunan = buildProgramTahunanText;
  return docEditorPage("programTahunan","Program Tahunan","Disusun otomatis dari CP resmi, Struktur Kurikulum, ATP, dan Kalender Pendidikan Jateng 2026/2027. Klik \"Buat Ulang Otomatis\" kapan saja setelah data ATP/Kalender diperbarui.", buildProgramTahunanText);
};
PAGES.progsemester = function(){
  window._docTemplateFn.programSemester = buildProgramSemesterText;
  return docEditorPage("programSemester","Program Semester","Distribusi TP per bulan untuk semester berjalan (mengikuti field Semester pada Profil Sekolah), disusun otomatis dari ATP & Kalender Pendidikan.", buildProgramSemesterText);
};

/* ---------- CAPAIAN PEMBELAJARAN (CP) - referensi, hanya bisa difilter ---------- */
PAGES.cp = function(){
  const mapelFilter = window._cpMapel || "";
  const currentFase = faseForClassId(activeClassId);
  let rows = db.cp.slice();
  if(mapelFilter) rows = rows.filter(r=>r.mapel===mapelFilter);
  const mapels = [...new Set(db.cp.map(r=>r.mapel))];
  const body = rows.map(r=>`<tr><td><strong>${escapeHtml(r.mapel)}</strong>${r.revisi2026?' <span class="badge badge-orange" title="Direvisi melalui Kepka BKPDM No. 020 Tahun 2026">Revisi 2026</span>':''}</td><td>${escapeHtml(r.elemen)}</td><td>${escapeHtml(r.cp)}</td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Capaian Pembelajaran (CP) - ${escapeHtml(faseLabel(currentFase))}</h1><div class="desc">${escapeHtml(classInfo(activeClassId).label)} otomatis menampilkan CP ${escapeHtml(faseLabel(currentFase))}. Ganti "Pilih Kelas Aktif" di bagian atas untuk melihat CP fase lain.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="regenerateCP()">${ic("target",15)} Segarkan Ulang dari CP Resmi</button>
    <button class="btn" onclick="printDocument('CAPAIAN PEMBELAJARAN ${escapeHtml(faseLabel(currentFase)).replace(/'/g,"\\'").toUpperCase()}', document.getElementById(\'cpTableHolder\').innerHTML)">${ic("print",15)} Cetak</button>
  </div>
  <div class="card" style="background:var(--warn-soft);border-color:var(--warn);margin-bottom:14px;">
    <div style="display:flex;gap:10px;align-items:flex-start;">
      ${ic("info",20)}
      <p style="margin:0;font-size:12.5px;color:var(--text);">${escapeHtml(CP_LEGAL_NOTE)}</p>
    </div>
  </div>
  <div class="toolbar">
    <select style="max-width:280px;padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._cpMapel=this.value; renderPage('cp');">
      <option value="">Semua Mata Pelajaran</option>
      ${mapels.map(m=>`<option value="${escapeHtml(m)}" ${m===mapelFilter?"selected":""}>${escapeHtml(m)}</option>`).join("")}
    </select>
  </div>
  <div id="cpTableHolder" class="table-wrap"><table><thead><tr><th style="width:180px;">Mata Pelajaran</th><th style="width:160px;">Elemen</th><th>Capaian Pembelajaran</th></tr></thead>
  <tbody>${body || `<tr><td colspan="3" class="empty-state">Tidak ada data. Klik "Segarkan Ulang dari CP Resmi" untuk mengisi otomatis.</td></tr>`}</tbody></table></div>`;
};
function regenerateCP(){
  const fase = faseForClassId(activeClassId);
  confirmDialog("Ini akan MENGGANTI seluruh daftar CP "+faseLabel(fase)+" pada "+classInfo(activeClassId).label+" dengan versi resmi terbaru (Kepka BSKAP No. 046/H/KR/2025 jo. Kepka BKPDM No. 020 Tahun 2026). Lanjutkan?", ()=>{
    const cpFase = cpSeedForFase(fase).map(e=>({...e}));
    db.cp = cpFase;
    saveDB(); toast("CP "+faseLabel(fase)+" disegarkan ulang."); renderPage("cp");
  });
}

/* ---------- ATP ---------- */
function atpFields(){
  return [
    {key:"mapel",label:"Mata Pelajaran",type:"select",options:MAPEL_LIST,required:true},
    {key:"elemen",label:"Elemen/Domain"},
    {key:"tp",label:"Tujuan Pembelajaran (TP)",type:"textarea",required:true},
    {key:"alokasiWaktu",label:"Alokasi Waktu (JP)"},
    {key:"semester",label:"Semester",type:"select",options:["1","2"]},
  ];
}
PAGES.atp = function(){
  const html = crudSection({
    store:"atp", title:"Alur Tujuan Pembelajaran (ATP)",
    desc:"TP diturunkan langsung dari CP Fase A resmi (Kepbadan BSKAP No. 046/H/KR/2025) dan JP mengikuti Struktur Kurikulum Kelas 1 (Permendikbudristek 12/2024 jo. Permendikdasmen 13/2025). Silakan sunting kalimat TP sesuai konteks kelas Bapak/Ibu.",
    fields: atpFields(),
    columns:[{key:"mapel",label:"Mapel"},{key:"elemen",label:"Elemen"},{key:"tp",label:"Tujuan Pembelajaran",render:v=>escapeHtml((v||"").slice(0,70))+((v||"").length>70?"...":"")},{key:"alokasiWaktu",label:"JP/mgg"},{key:"semester",label:"Smt"}],
  });
  return html.replace('<button class="btn btn-primary" onclick="crudAdd(\'atp\')">',
    `<button class="btn" onclick="regenerateATP()">${ic("target",15)} Buat/Segarkan Ulang dari CP</button><button class="btn btn-primary" onclick="crudAdd('atp')">`);
};
function regenerateATP(){
  confirmDialog("Ini akan MENGGANTI seluruh daftar ATP dengan hasil turunan terbaru dari CP resmi. TP yang sudah Bapak/Ibu sunting manual akan tertimpa. Lanjutkan?", ()=>{
    db.atp = generateSeedATP(db.cp); saveDB(); toast("ATP diperbarui dari CP terbaru ("+faseLabel(faseForClassId(activeClassId))+")."); renderPage("atp");
  });
}

/* ---------- KKTP ---------- */
function kktpFields(){
  return [
    {key:"mapel",label:"Mata Pelajaran",type:"select",options:MAPEL_LIST,required:true},
    {key:"tp",label:"Tujuan Pembelajaran Terkait",type:"textarea",required:true},
    {key:"kriteria",label:"Kriteria Ketercapaian",type:"textarea",required:true},
    {key:"interval",label:"Interval Nilai",type:"select",options:["Belum Berkembang (0-59)","Mulai Berkembang (60-69)","Berkembang Sesuai Harapan (70-84)","Sangat Berkembang (85-100)"]},
  ];
}
PAGES.kktp = function(){
  const html = crudSection({
    store:"kktp", title:"Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)",
    desc:"Acuan penentuan ketercapaian TP sebagai dasar asesmen formatif & sumatif. Interval predikat mengikuti konvensi umum rapor Kurikulum Merdeka/Pembelajaran Mendalam; sesuaikan dengan kebijakan satuan pendidikan.",
    fields: kktpFields(),
    columns:[{key:"mapel",label:"Mapel"},{key:"kriteria",label:"Kriteria",render:v=>escapeHtml((v||"").slice(0,60))+((v||"").length>60?"...":"")},{key:"interval",label:"Interval"}],
  });
  return html.replace('<button class="btn btn-primary" onclick="crudAdd(\'kktp\')">',
    `<button class="btn" onclick="regenerateKKTP()">${ic("target",15)} Buat/Segarkan Ulang dari CP</button><button class="btn btn-primary" onclick="crudAdd('kktp')">`);
};
function regenerateKKTP(){
  confirmDialog("Ini akan MENGGANTI seluruh daftar KKTP dengan hasil turunan terbaru per mata pelajaran. Lanjutkan?", ()=>{
    db.kktp = generateSeedKKTP(db.cp); saveDB(); toast("KKTP diperbarui ("+faseLabel(faseForClassId(activeClassId))+")."); renderPage("kktp");
  });
}

/* ---------- MODUL AJAR ---------- */
function modulAjarFields(){
  // Struktur baku Modul Ajar (Panduan Pembelajaran & Asesmen BSKAP, revisi 2025):
  // A. Informasi Umum | B. Komponen Inti | C. Lampiran
  const DIMENSI = ["Keimanan & ketakwaan kepada Tuhan YME","Kewargaan","Penalaran kritis","Kreativitas","Kolaborasi","Kemandirian","Kesehatan","Komunikasi"];
  return [
    {key:"_h1",label:"A. INFORMASI UMUM",type:"heading"},
    {key:"judul",label:"Judul / Topik Modul Ajar",required:true},
    {key:"mapel",label:"Mata Pelajaran",type:"select",options:MAPEL_LIST,required:true},
    {key:"materiPokok",label:"Materi Pokok / Bab"},
    {key:"kelasFase",label:"Kelas / Fase",placeholder:"cth: Kelas 1 / Fase A"},
    {key:"tanggal",label:"Tanggal Pelaksanaan",type:"date"},
    {key:"alokasiWaktu",label:"Alokasi Waktu",placeholder:"cth: 2 x 35 menit"},
    {key:"penyusun",label:"Penyusun"},
    {key:"kompetensiAwal",label:"Kompetensi Awal",type:"textarea",placeholder:"Pengetahuan/keterampilan prasyarat yang harus dimiliki peserta didik"},
    {key:"profilLulusan",label:"Dimensi Profil Lulusan yang Dituju",placeholder:"cth: Penalaran Kritis, Kolaborasi, Kemandirian"},
    {key:"saranaPrasarana",label:"Sarana & Prasarana",type:"textarea",placeholder:"cth: LCD proyektor, LKPD, alat peraga balok"},
    {key:"targetPesertaDidik",label:"Target Peserta Didik",placeholder:"cth: Peserta didik reguler"},
    {key:"modelPembelajaran",label:"Model / Metode Pembelajaran",placeholder:"cth: Pembelajaran Berbasis Proyek (PjBL)"},
    {key:"_h2",label:"B. KOMPONEN INTI",type:"heading"},
    {key:"tp",label:"Tujuan Pembelajaran",type:"textarea",required:true},
    {key:"pemahamanBermakna",label:"Pemahaman Bermakna",type:"textarea"},
    {key:"pertanyaanPemantik",label:"Pertanyaan Pemantik",type:"textarea"},
    {key:"kegiatanAwal",label:"Kegiatan Pendahuluan",type:"textarea"},
    {key:"kegiatanMemahami",label:"Kegiatan Inti — MEMAHAMI",type:"textarea",placeholder:"Membangun pemahaman awal peserta didik terhadap konsep"},
    {key:"kegiatanMengaplikasi",label:"Kegiatan Inti — MENGAPLIKASI",type:"textarea",placeholder:"Peserta didik menerapkan pengetahuan pada konteks nyata"},
    {key:"kegiatanMerefleksi",label:"Kegiatan Inti — MEREFLEKSI",type:"textarea",placeholder:"Peserta didik merefleksikan proses & hasil belajar"},
    {key:"kegiatanPenutup",label:"Kegiatan Penutup",type:"textarea"},
    {key:"asesmen",label:"Asesmen (formatif, sumatif & rubrik)",type:"textarea"},
    {key:"pengayaanRemedial",label:"Pengayaan & Remedial",type:"textarea"},
    {key:"refleksi",label:"Refleksi Peserta Didik & Guru",type:"textarea"},
    {key:"_h3",label:"C. LAMPIRAN",type:"heading"},
    {key:"materi",label:"Materi / Bahan Ajar",type:"textarea"},
    {key:"lampiran",label:"Lampiran (LKPD, instrumen asesmen, media)",type:"textarea"},
    {key:"sumberBelajar",label:"Sumber & Media Belajar",type:"textarea"},
  ];
}PAGES.modulajar = function(){
  const rows = db.modulAjar.slice();
  const body = rows.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${escapeHtml(r.judul)}</strong></td><td>${escapeHtml(r.mapel)}</td><td>${fmtDate(r.tanggal)}</td>
    <td><div class="row-actions">
      <button class="btn btn-sm" onclick="viewModulAjar('${r.id}')">${ic("eye",14)} Lihat</button>
      <button class="btn btn-sm btn-icon" onclick="crudEdit('modulAjar','${r.id}')">${ic("edit",15)}</button>
      <button class="btn btn-sm btn-icon btn-danger" onclick="crudDelete('modulAjar','${r.id}')">${ic("trash",15)}</button>
    </div></td></tr>`).join("");
  CRUD_CONFIG.modulAjar = {store:"modulAjar", title:"Modul Ajar", fields:modulAjarFields(), columns:[]};

  const filters = window._modulFileFilters || {kategori:"Modul Ajar", kelasId:activeClassId, mapel:"", semester:"", q:""};
  filters.kategori = "Modul Ajar"; // panel ini khusus kategori Modul Ajar
  window._modulFileFilters = filters;
  window._arsipOnRefresh = ()=> renderArsipListInto("modulFileListHolder", window._modulFileFilters);
  setTimeout(window._arsipOnRefresh, 0);

  return `
  <div class="section-head"><div><h1>Modul Ajar</h1><div class="desc">Disusun berbasis pendekatan Pembelajaran Mendalam: Memahami &rarr; Mengaplikasi &rarr; Merefleksi, selaras 8 Dimensi Profil Lulusan.</div></div>
    <div class="grow"></div>
    <button class="btn" style="border-color:var(--accent);color:var(--accent);" onclick="uploadArsipFile({title:'Unggah File Modul Ajar', kategori:'Modul Ajar', kelasId:activeClassId, onDone:window._arsipOnRefresh})">${ic("upload",15)} Upload Modul Ajar</button>
    <button class="btn btn-primary" onclick="crudAdd('modulAjar')">${ic("plus",15)} Susun Modul Ajar (Teks)</button></div>

  <div class="card" style="margin-bottom:16px;">
    <h3 style="font-size:14px;margin-bottom:10px;">${ic("upload",16)} File Modul Ajar Terunggah (PDF/JPG/PNG/DOCX)</h3>
    <div class="toolbar">
      <div class="search-box">${ic("search",16)}<input placeholder="Cari nama file / mapel / bab..." value="${escapeHtml(filters.q)}" oninput="window._modulFileFilters.q=this.value; window._arsipOnRefresh();"></div>
      <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._modulFileFilters.kelasId=this.value; window._arsipOnRefresh();">
        <option value="">Semua Kelas</option>
        ${CLASS_LIST.map(c=>`<option value="${c.id}" ${filters.kelasId===c.id?"selected":""}>${escapeHtml(c.label)}</option>`).join("")}
      </select>
      <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._modulFileFilters.mapel=this.value; window._arsipOnRefresh();">
        <option value="">Semua Mapel</option>
        ${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${filters.mapel===m?"selected":""}>${escapeHtml(m)}</option>`).join("")}
      </select>
    </div>
    <div id="modulFileListHolder"><p class="muted">Memuat file...</p></div>
  </div>

  <div class="card">
    <h3 style="font-size:14px;margin-bottom:10px;">${ic("doc",16)} Modul Ajar Tersusun (Teks Terstruktur)</h3>
    <div class="table-wrap"><table><thead><tr><th>No</th><th>Judul</th><th>Mapel</th><th>Tanggal</th><th style="text-align:right">Aksi</th></tr></thead>
    <tbody>${body || `<tr><td colspan="5" class="empty-state">Belum ada modul ajar tersimpan.</td></tr>`}</tbody></table></div>
  </div>`;
};
function viewModulAjar(id){
  const m = db.modulAjar.find(x=>x.id===id); if(!m) return;
  const bodyHtml = modulAjarStrukturHtml(m);
  openModal({title:m.judul, bodyHtml,
    footHtml:`<button class="btn" onclick="closeModal()">Tutup</button>
      <button class="btn" onclick="exportModulWord('${m.id}')">${ic("doc",15)} Word</button>
      <button class="btn btn-primary" onclick="printModulAjar('${m.id}')">${ic("print",15)} Cetak</button>`});
}
function modulAjarStrukturHtml(m){
  const s_ = db.sekolah;
  const baris = (lbl,val)=>`<tr><td style="width:200px;"><strong>${lbl}</strong></td><td>: ${escapeHtml(val||"")||"-"}</td></tr>`;
  return `
  <h4 style="margin:0 0 8px;">A. INFORMASI UMUM</h4>
  <table><tbody>
    ${baris("Satuan Pendidikan", s_.namaSekolah)}
    ${baris("Kelas / Fase", m.kelasFase || s_.kelas)}
    ${baris("Mata Pelajaran", m.mapel)}
    ${baris("Materi Pokok", m.materiPokok || m.judul)}
    ${baris("Alokasi Waktu", m.alokasiWaktu)}
    ${baris("Tanggal Pelaksanaan", m.tanggal?fmtDate(m.tanggal):"")}
    ${baris("Tahun Pelajaran", s_.tahunAjaran)}
    ${baris("Penyusun", m.penyusun)}
    ${baris("Kompetensi Awal", m.kompetensiAwal)}
    ${baris("Dimensi Profil Lulusan", m.profilLulusan)}
    ${baris("Sarana & Prasarana", m.saranaPrasarana)}
    ${baris("Target Peserta Didik", m.targetPesertaDidik)}
    ${baris("Model Pembelajaran", m.modelPembelajaran)}
  </tbody></table>
  <div class="divider"></div>
  <h4 style="margin:0 0 8px;">B. KOMPONEN INTI</h4>
  <p><strong>1. Tujuan Pembelajaran:</strong><br>${escapeHtml(m.tp)||"-"}</p>
  <p><strong>2. Pemahaman Bermakna:</strong><br>${escapeHtml(m.pemahamanBermakna)||"-"}</p>
  <p><strong>3. Pertanyaan Pemantik:</strong><br>${escapeHtml(m.pertanyaanPemantik)||"-"}</p>
  <p><strong>4. Kegiatan Pembelajaran:</strong></p>
  <p style="padding-left:14px;"><strong>a. Pendahuluan:</strong><br>${escapeHtml(m.kegiatanAwal)||"-"}</p>
  <p style="padding-left:14px;"><strong>b. Inti — Memahami:</strong><br>${escapeHtml(m.kegiatanMemahami)||"-"}</p>
  <p style="padding-left:14px;"><strong>c. Inti — Mengaplikasi:</strong><br>${escapeHtml(m.kegiatanMengaplikasi)||"-"}</p>
  <p style="padding-left:14px;"><strong>d. Inti — Merefleksi:</strong><br>${escapeHtml(m.kegiatanMerefleksi)||"-"}</p>
  <p style="padding-left:14px;"><strong>e. Penutup:</strong><br>${escapeHtml(m.kegiatanPenutup)||"-"}</p>
  <p><strong>5. Asesmen:</strong><br>${escapeHtml(m.asesmen)||"-"}</p>
  <p><strong>6. Pengayaan & Remedial:</strong><br>${escapeHtml(m.pengayaanRemedial)||"-"}</p>
  <p><strong>7. Refleksi Peserta Didik & Guru:</strong><br>${escapeHtml(m.refleksi)||"-"}</p>
  <div class="divider"></div>
  <h4 style="margin:0 0 8px;">C. LAMPIRAN</h4>
  <p><strong>Materi / Bahan Ajar:</strong><br>${escapeHtml(m.materi)||"-"}</p>
  <p><strong>Lampiran (LKPD, instrumen asesmen, media):</strong><br>${escapeHtml(m.lampiran)||"-"}</p>
  <p><strong>Sumber & Media Belajar:</strong><br>${escapeHtml(m.sumberBelajar)||"-"}</p>`;
}
function modulAjarDocHtml(m){
  return modulAjarStrukturHtml(m);
}function printModulAjar(id){ const m=db.modulAjar.find(x=>x.id===id); printDocument("MODUL AJAR: "+m.judul.toUpperCase(), modulAjarDocHtml(m)); }
function exportModulWord(id){ const m=db.modulAjar.find(x=>x.id===id); htmlToWordDoc(letterheadHtml()+`<div class="doc-title">MODUL AJAR: ${escapeHtml(m.judul.toUpperCase())}</div>`+modulAjarDocHtml(m), "Modul_Ajar_"+m.judul.replace(/\s+/g,"_"), m.judul); }

/* ---------- ASESMEN (Diagnostik / Formatif / Sumatif) ---------- */
/* ============================================================
   JENIS & BENTUK PENILAIAN — Kurikulum Merdeka
   (Panduan Pembelajaran dan Asesmen, Edisi Revisi 2025)
   - Sumatif Lingkup Materi: akhir 1 lingkup materi (1 TP atau lebih)
   - STS / SAS: Sumatif Tengah/Akhir Semester — bersifat pilihan
   - Sumatif Akhir Fase: akhir fase/jenjang (dasar kelulusan)
   - Asesmen Formatif: umpan balik proses, TIDAK masuk nilai rapor
   ============================================================ */
const JENIS_SUMATIF_OPTS = [
  {value:"LM", label:"Sumatif Lingkup Materi"},
  {value:"STS", label:"Sumatif Tengah Semester (STS)"},
  {value:"SAS", label:"Sumatif Akhir Semester (SAS)"},
  {value:"FASE", label:"Sumatif Akhir Fase"},
];
const JENIS_SUMATIF_LABEL = {LM:"Sumatif Lingkup Materi", STS:"STS", SAS:"SAS", FASE:"Sumatif Akhir Fase", Formatif:"Asesmen Formatif"};
const BENTUK_PENILAIAN = ["Tes Tulis","Observasi","Unjuk Kerja/Praktik","Produk","Portofolio","Projek"];
function jenisSumatifOf(r){
  if(r.jenisSumatif) return r.jenisSumatif;
  const lm = String(r.lingkupMateri||"").trim();
  if(/^SAS\b/i.test(lm)) return "SAS";
  if(/^STS\b/i.test(lm)) return "STS";
  return "LM";
}
function asesmenFields(jenis){
  const base = [
    {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
    {key:"mapel",label:"Mata Pelajaran",type:"select",options:MAPEL_LIST,required:true},
    {key:"tanggal",label:"Tanggal",type:"date",required:true},
  ];
  if(jenis==="diag"){
    return base.concat([{key:"catatan",label:"Hasil Asesmen Diagnostik (kondisi awal, gaya belajar, dsb.)",type:"textarea",required:true}]);
  }
  if(jenis==="sum"){
    return base.concat([
      {key:"jenisSumatif",label:"Jenis Penilaian",type:"select",options:JENIS_SUMATIF_OPTS,required:true},
      {key:"bentuk",label:"Bentuk / Teknik Penilaian",type:"select",options:BENTUK_PENILAIAN},
      {key:"nilai",label:"Nilai (0-100)",type:"number",required:true},
      {key:"lingkupMateri",label:"Lingkup Materi / Bab"},
      {key:"semester",label:"Semester",type:"select",options:[{value:"1",label:"Semester 1"},{value:"2",label:"Semester 2"}]},
      {key:"catatan",label:"Catatan/Umpan Balik",type:"textarea"},
    ]);
  }
  return base.concat([
    {key:"nilai",label:"Nilai (0-100)",type:"number",required:true},
    {key:"lingkupMateri",label:"Topik / Materi (opsional)"},
    {key:"semester",label:"Semester (opsional)",type:"select",options:[{value:"1",label:"Semester 1"},{value:"2",label:"Semester 2"}]},
    {key:"catatan",label:"Catatan/Umpan Balik",type:"textarea"},
  ]);
}
function asesmenPage(store, title, desc, jenis){
  const rows = db[store].slice();
  const siswaMap = Object.fromEntries(db.siswa.map(s=>[s.id,s.nama]));
  const q = (window["_q_"+store]||"").toLowerCase();
  const data = q ? rows.filter(r=>(siswaMap[r.siswaId]||"").toLowerCase().includes(q) || (r.mapel||"").toLowerCase().includes(q)) : rows;
  const isSum = jenis==="sum";
  const body = data.map((r,i)=>{
    const nilaiBadge = `<span class="badge ${r.nilai>=70?'badge-green':'badge-orange'}">${escapeHtml(r.nilai)}</span>`;
    const jenisCell = isSum ? `<td><span class="badge badge-blue">${escapeHtml(JENIS_SUMATIF_LABEL[jenisSumatifOf(r)]||"-")}</span></td><td>${escapeHtml(r.bentuk||"-")}</td>` : ``;
    return `<tr><td>${i+1}</td><td><strong>${escapeHtml(siswaMap[r.siswaId]||"?")}</strong></td><td>${escapeHtml(r.mapel)}</td><td>${fmtDate(r.tanggal)}</td>
    ${jenisCell}
    <td>${jenis==="diag"? escapeHtml((r.catatan||"").slice(0,50))+((r.catatan||"").length>50?"...":"") : nilaiBadge}</td>
    <td><div class="row-actions">
      <button class="btn btn-sm btn-icon" onclick="editAsesmen('${store}','${r.id}','${jenis}')">${ic("edit",15)}</button>
      <button class="btn btn-sm btn-icon btn-danger" onclick="crudDelete('${store}','${r.id}')">${ic("trash",15)}</button>
    </div></td></tr>`;
  }).join("");
  CRUD_CONFIG[store] = {store, title, fields:asesmenFields(jenis), columns:[]};
  const colspan = isSum ? 8 : 6;
  const sumCols = isSum ? `<th>Jenis Penilaian</th><th>Bentuk</th>` : ``;
  return `
  <div class="section-head"><div><h1>${title}</h1><div class="desc">${desc}</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportCSV('${store}', ${store}RowsForExport(), [{key:'nama',label:'Nama'},{key:'mapel',label:'Mapel'},{key:'tanggal',label:'Tanggal'},${isSum?`{key:'jenisSumatif',label:'Jenis'},{key:'bentuk',label:'Bentuk'},`:``}{key:'${jenis==='diag'?'catatan':'nilai'}',label:'${jenis==='diag'?'Catatan':'Nilai'}'}], '${store}')">${ic("download",15)} CSV</button>
    <button class="btn btn-primary" onclick="addAsesmen('${store}','${jenis}')">${ic("plus",15)} Tambah</button></div>
  <div class="toolbar"><div class="search-box">${ic("search",16)}<input placeholder="Cari nama siswa / mapel..." oninput="window['_q_${store}']=this.value; renderPage('${store==="asesmenDiagnostik"?"asesdiag":store==="asesmenFormatif"?"asesform":"asessum"}');"></div></div>
  <div class="table-wrap"><table><thead><tr><th>No</th><th>Siswa</th><th>Mapel</th><th>Tanggal</th>${sumCols}<th>${jenis==="diag"?"Catatan":"Nilai"}</th><th style="text-align:right">Aksi</th></tr></thead>
  <tbody>${body || `<tr><td colspan="${colspan}" class="empty-state">${illus("dokumen",120)}<div>Belum ada data.</div></td></tr>`}</tbody></table></div>`;
}
function asesmenDiagnostikRowsForExport(){ return exportRowsWithName("asesmenDiagnostik"); }
function asesmenFormatifRowsForExport(){ return exportRowsWithName("asesmenFormatif"); }
function asesmenSumatifRowsForExport(){ return exportRowsWithName("asesmenSumatif"); }
function exportRowsWithName(store){
  const siswaMap = Object.fromEntries(db.siswa.map(s=>[s.id,s.nama]));
  return db[store].map(r=>({...r, nama:siswaMap[r.siswaId]||"?"}));
}
function addAsesmen(store,jenis){
  openModal({title:"Tambah Data", bodyHtml: asesmenFields(jenis).map(f=>fieldHtml(f,"")).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveAsesBtn">${ic("check",15)} Simpan</button>`});
  document.getElementById("saveAsesBtn").onclick=()=>{
    const data = readForm(asesmenFields(jenis));
    if(!data.siswaId||!data.mapel){ toast("Lengkapi data terlebih dahulu."); return; }
    data.id = uid(store); db[store].push(data); saveDB(); closeModal(); toast("Tersimpan.");
    renderPage(store==="asesmenDiagnostik"?"asesdiag":store==="asesmenFormatif"?"asesform":"asessum");
  };
}
function editAsesmen(store,id,jenis){
  const row = db[store].find(r=>r.id===id); if(!row) return;
  openModal({title:"Ubah Data", bodyHtml: asesmenFields(jenis).map(f=>fieldHtml(f,row[f.key])).join(""),
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveAsesBtn">${ic("check",15)} Simpan</button>`});
  document.getElementById("saveAsesBtn").onclick=()=>{
    Object.assign(row, readForm(asesmenFields(jenis))); saveDB(); closeModal(); toast("Perubahan disimpan.");
    renderPage(store==="asesmenDiagnostik"?"asesdiag":store==="asesmenFormatif"?"asesform":"asessum");
  };
}
/* ============================================================
   INPUT NILAI MASSAL (BULK) -- menulis ke store data yang SAMA
   dengan Asesmen Formatif/Sumatif (db.asesmenFormatif / db.asesmenSumatif)
   sehingga seluruh data tetap konsisten dan bisa dibuka/diedit satu-
   per-satu lewat menu Asesmen Formatif/Sumatif seperti biasa.
   ============================================================ */
function inputNilaiJenisStore(jenis){ return jenis==="Formatif" ? "asesmenFormatif" : "asesmenSumatif"; }
const NI_JENIS_OPTS = [
  {value:"LM", label:"Sumatif Lingkup Materi"},
  {value:"STS", label:"Sumatif Tengah Semester (STS)"},
  {value:"SAS", label:"Sumatif Akhir Semester (SAS)"},
  {value:"FASE", label:"Sumatif Akhir Fase"},
  {value:"Formatif", label:"Asesmen Formatif"},
];
const NI_JENIS_DEFAULT_BAB = {STS:"STS", SAS:"SAS", FASE:"Sumatif Akhir Fase"};
function inputNilaiJenisLabel(jenis){ const o = NI_JENIS_OPTS.find(x=>x.value===jenis); return o?o.label:jenis; }
function inputNilaiDraftKey(ctx){
  return "tpsd2026_draftnilai_"+[activeClassId, ctx.mapel, ctx.jenis, ctx.bab, ctx.semester].map(s=>String(s||"").replace(/[^a-zA-Z0-9]/g,"_")).join("__");
}
function inputNilaiGetCtx(){
  const ctx = window._inputNilaiCtx || {mapel:MAPEL_LIST[0], jenis:"LM", bentuk:BENTUK_PENILAIAN[0], bab:"", semester:"1"};
  // Migrasi ctx lama ("Sumatif" generik -> LM)
  if(ctx.jenis==="Sumatif") ctx.jenis = "LM";
  if(!ctx.bentuk) ctx.bentuk = BENTUK_PENILAIAN[0];
  window._inputNilaiCtx = ctx;
  return ctx;
}
function inputNilaiExistingMap(ctx){
  const store = inputNilaiJenisStore(ctx.jenis);
  const map = {};
  (db[store]||[]).forEach(r=>{
    if(r.mapel!==ctx.mapel) return;
    if(String(r.lingkupMateri||"")!==String(ctx.bab||"")) return;
    if(String(r.semester||"")!==String(ctx.semester||"")) return;
    if(store==="asesmenSumatif"){
      const rj = r.jenisSumatif || jenisSumatifOf(r);
      if(rj!==ctx.jenis && !( !r.jenisSumatif && ctx.jenis==="LM" )) return;
    }
    map[r.siswaId] = r;
  });
  return map;
}
function inputNilaiLoadDraft(ctx){
  try{ return JSON.parse(localStorage.getItem(inputNilaiDraftKey(ctx))||"{}"); }catch(e){ return {}; }
}
function inputNilaiSaveDraft(ctx, draftObj){
  try{ localStorage.setItem(inputNilaiDraftKey(ctx), JSON.stringify(draftObj)); }catch(e){}
}
function inputNilaiClearDraft(ctx){
  try{ localStorage.removeItem(inputNilaiDraftKey(ctx)); }catch(e){}
}
PAGES.inputnilai = function(){
  const ctx = inputNilaiGetCtx();
  setTimeout(()=>inputNilaiRenderTable(), 0);
  return `
  <div class="section-head"><div><h1>Input Nilai Massal</h1><div class="desc">${escapeHtml(classInfo(activeClassId).label)} &middot; Pilih Mapel, Jenis Penilaian, Lingkup Materi/Bab, dan Semester, lalu isi nilai seluruh siswa langsung dari daftar di bawah. Data tersimpan ke tempat yang sama dengan menu Asesmen Formatif/Sumatif.</div></div></div>
  <div class="card" style="margin-bottom:16px;">
    <div class="form-grid">
      <div class="field"><label>Mata Pelajaran</label><select id="niMapel" onchange="inputNilaiUpdateCtxAndRender()">
        ${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${m===ctx.mapel?"selected":""}>${escapeHtml(m)}</option>`).join("")}
      </select></div>
      <div class="field"><label>Jenis Penilaian</label><select id="niJenis" onchange="inputNilaiUpdateCtxAndRender()">
        ${NI_JENIS_OPTS.map(o=>`<option value="${o.value}" ${o.value===ctx.jenis?"selected":""}>${o.label}</option>`).join("")}
      </select></div>
      <div class="field" id="niBentukWrap" style="display:${ctx.jenis==="Formatif"?"none":""};"><label>Bentuk / Teknik Penilaian</label><select id="niBentuk" onchange="inputNilaiUpdateCtxAndRender()">
        ${BENTUK_PENILAIAN.map(b=>`<option value="${escapeHtml(b)}" ${b===ctx.bentuk?"selected":""}>${escapeHtml(b)}</option>`).join("")}
      </select></div>
      <div class="field"><label>Lingkup Materi / Bab</label><input type="text" id="niBab" value="${escapeHtml(ctx.bab)}" placeholder="cth: Bab 3 - Pecahan" onchange="inputNilaiUpdateCtxAndRender()"></div>
      <div class="field"><label>Semester</label><select id="niSemester" onchange="inputNilaiUpdateCtxAndRender()">
        <option value="1" ${ctx.semester==="1"?"selected":""}>Semester 1</option>
        <option value="2" ${ctx.semester==="2"?"selected":""}>Semester 2</option>
      </select></div>
    </div>
  </div>
  <div id="niStatsHolder"></div>
  <div class="card" style="margin-bottom:16px;">
    <div class="toolbar" style="margin-bottom:0;">
      <button class="btn btn-primary" onclick="inputNilaiSimpanSemua()">${ic("check",15)} Simpan Semua</button>
      <button class="btn" onclick="inputNilaiIsiSemua()">${ic("edit",15)} Isi Semua</button>
      <button class="btn" onclick="inputNilaiCopyPrevious()">${ic("layers",15)} Copy Nilai dari Penilaian Sebelumnya</button>
      <div class="grow"></div>
      <span class="hint" id="niAutosaveLabel">Draf tersimpan otomatis di perangkat ini.</span>
    </div>
    <div class="hint" id="niFormatifHint" style="display:${ctx.jenis==="Formatif"?"":"none"};margin-top:10px;">ℹ️ Asesmen formatif bersifat kualitatif untuk umpan balik &amp; bahan deskripsi rapor — <strong>tidak masuk hitungan nilai rapor</strong> (Panduan Pembelajaran dan Asesmen).</div>
  </div>
  <div id="niTableHolder"><p class="muted">Memuat daftar siswa...</p></div>`;
};
function inputNilaiUpdateCtxAndRender(){
  const ctx = inputNilaiGetCtx();
  ctx.mapel = document.getElementById("niMapel").value;
  ctx.jenis = document.getElementById("niJenis").value;
  const bentukEl = document.getElementById("niBentuk");
  if(bentukEl) ctx.bentuk = bentukEl.value;
  const autoBab = NI_JENIS_DEFAULT_BAB[ctx.jenis];
  const babEl = document.getElementById("niBab");
  let babVal = babEl ? babEl.value.trim() : "";
  const autoVals = Object.values(NI_JENIS_DEFAULT_BAB);
  if(autoBab && (babVal==="" || autoVals.indexOf(babVal)>=0)){
    babVal = autoBab;
    if(babEl) babEl.value = autoBab;
  }
  ctx.bab = babVal || "Umum";
  ctx.semester = document.getElementById("niSemester").value;
  const hint = document.getElementById("niFormatifHint");
  if(hint) hint.style.display = ctx.jenis==="Formatif" ? "" : "none";
  const bentukWrap = document.getElementById("niBentukWrap");
  if(bentukWrap) bentukWrap.style.display = ctx.jenis==="Formatif" ? "none" : "";
  inputNilaiRenderTable();
}
function inputNilaiComputeRowValue(ctx, siswaId, existingMap, draft){
  if(Object.prototype.hasOwnProperty.call(draft, siswaId)) return draft[siswaId];
  if(existingMap[siswaId]) return existingMap[siswaId].nilai;
  return "";
}
function inputNilaiRenderTable(){
  const ctx = inputNilaiGetCtx();
  const holder = document.getElementById("niTableHolder");
  if(!holder) return;
  const existingMap = inputNilaiExistingMap(ctx);
  const draft = inputNilaiLoadDraft(ctx);
  const siswaList = siswaSortedAlpha();
  const rows = siswaList.map((s,i)=>{
    const val = inputNilaiComputeRowValue(ctx, s.id, existingMap, draft);
    const filled = val!=="" && val!=null;
    return `<tr id="niRow_${s.id}" class="${filled?'ni-row-filled':''}">
      <td>${i+1}</td>
      <td><strong>${escapeHtml(s.nama)}</strong></td>
      <td><input type="number" min="0" max="100" step="1" class="ni-input" id="niInput_${s.id}" data-siswaid="${s.id}" data-index="${i}"
        value="${escapeHtml(val)}" placeholder="0-100"
        oninput="inputNilaiOnInput('${s.id}', this)"
        onkeydown="inputNilaiHandleKeydown(event, ${i})"></td>
    </tr>`;
  }).join("");
  holder.innerHTML = `<div class="table-wrap"><table><thead><tr><th style="width:50px;">No</th><th>Nama Siswa</th><th style="width:140px;">Nilai (0-100)</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="3" class="empty-state">Belum ada data siswa.</td></tr>`}</tbody></table></div>`;
  inputNilaiRenderStats();
}
function inputNilaiOnInput(siswaId, inputEl){
  const ctx = inputNilaiGetCtx();
  let val = inputEl.value;
  if(val!==""){
    let num = Number(val);
    if(isNaN(num)) num = 0;
    if(num<0) num = 0;
    if(num>100) num = 100;
    if(String(num)!==val) inputEl.value = num;
    val = num;
  }
  const draft = inputNilaiLoadDraft(ctx);
  if(val==="") delete draft[siswaId]; else draft[siswaId] = val;
  inputNilaiSaveDraft(ctx, draft);
  const row = document.getElementById("niRow_"+siswaId);
  if(row) row.classList.toggle("ni-row-filled", val!=="" && val!=null);
  inputNilaiRenderStats();
}
function inputNilaiHandleKeydown(e, index){
  if(e.key==="Enter"){
    e.preventDefault();
    const next = document.querySelector(`.ni-input[data-index="${index+1}"]`);
    if(next) next.focus();
  }
}
function inputNilaiRenderStats(){
  const ctx = inputNilaiGetCtx();
  const statsHolder = document.getElementById("niStatsHolder");
  if(!statsHolder) return;
  const inputs = document.querySelectorAll(".ni-input");
  const values = [];
  inputs.forEach(inp=>{ if(inp.value!=="") values.push(Number(inp.value)); });
  const total = inputs.length;
  const terisi = values.length;
  const belum = total - terisi;
  const tertinggi = values.length ? Math.max(...values) : 0;
  const terendah = values.length ? Math.min(...values) : 0;
  const rata = values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1) : "0.0";
  statsHolder.innerHTML = `<div class="grid grid-4" style="margin-bottom:16px;">
    <div class="card stat-card"><div class="num">${total}</div><div class="lbl">Jumlah Siswa</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--accent);">${terisi}</div><div class="lbl">Sudah Diisi</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--warn);">${belum}</div><div class="lbl">Belum Diisi</div></div>
    <div class="card stat-card"><div class="num">${rata}</div><div class="lbl">Rata-rata (Tertinggi ${tertinggi} / Terendah ${terendah})</div></div>
  </div>`;
}
function inputNilaiIsiSemua(){
  const val = prompt("Isi nilai untuk SELURUH siswa pada daftar ini (0-100):", "80");
  if(val===null) return;
  let num = Number(val);
  if(isNaN(num) || num<0 || num>100){ toast("Nilai harus berupa angka 0-100."); return; }
  document.querySelectorAll(".ni-input").forEach(inp=>{
    inp.value = num;
    inputNilaiOnInput(inp.dataset.siswaid, inp);
  });
  toast("Seluruh nilai diisi "+num+". Jangan lupa klik \"Simpan Semua\".");
}
function inputNilaiCopyPrevious(){
  const ctx = inputNilaiGetCtx();
  const store = inputNilaiJenisStore(ctx.jenis);
  const candidates = (db[store]||[]).filter(r=>r.mapel===ctx.mapel && !(String(r.lingkupMateri||"")===String(ctx.bab||"") && String(r.semester||"")===String(ctx.semester||"")));
  if(!candidates.length){ toast("Belum ada data penilaian sebelumnya untuk mapel ini."); return; }
  const combos = {};
  candidates.forEach(r=>{
    const key = (r.lingkupMateri||"Umum")+"__"+(r.semester||"-");
    if(!combos[key]) combos[key] = {label:(r.lingkupMateri||"Umum")+" (Semester "+(r.semester||"-")+")", tanggal:r.tanggal, entries:[]};
    combos[key].entries.push(r);
    if(r.tanggal > combos[key].tanggal) combos[key].tanggal = r.tanggal;
  });
  const comboList = Object.values(combos).sort((a,b)=>String(b.tanggal).localeCompare(String(a.tanggal)));
  const optionsHtml = comboList.map((c,i)=>`<option value="${i}">${escapeHtml(c.label)} - terakhir ${fmtDate(c.tanggal)}</option>`).join("");
  openModal({
    title:"Copy Nilai dari Penilaian Sebelumnya",
    bodyHtml:`<div class="field"><label>Pilih penilaian sumber</label><select id="niCopySrc">${optionsHtml}</select></div>
      <p class="hint">Nilai akan disalin ke kolom yang MASIH KOSONG saja. Nilai yang sudah diisi tidak akan tertimpa.</p>`,
    footHtml:`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="niCopyBtn">${ic("check",15)} Salin</button>`
  });
  document.getElementById("niCopyBtn").onclick = ()=>{
    const idx = Number(document.getElementById("niCopySrc").value);
    const chosen = comboList[idx];
    let count = 0;
    chosen.entries.forEach(r=>{
      const inp = document.getElementById("niInput_"+r.siswaId);
      if(inp && inp.value===""){ inp.value = r.nilai; inputNilaiOnInput(r.siswaId, inp); count++; }
    });
    closeModal();
    toast(count+" nilai disalin ke kolom yang masih kosong. Jangan lupa klik \"Simpan Semua\".");
  };
}
function inputNilaiSimpanSemua(){
  const ctx = inputNilaiGetCtx();
  const store = inputNilaiJenisStore(ctx.jenis);
  const existingMap = inputNilaiExistingMap(ctx);
  const inputs = document.querySelectorAll(".ni-input");
  let tersimpan = 0;
  inputs.forEach(inp=>{
    const siswaId = inp.dataset.siswaid;
    if(inp.value===""){
      // Jika sebelumnya ada data namun sekarang dikosongkan, biarkan data lama (tidak menghapus otomatis demi keamanan data).
      return;
    }
    let nilai = Number(inp.value);
    if(isNaN(nilai)) return;
    if(nilai<0) nilai=0; if(nilai>100) nilai=100;
    if(existingMap[siswaId]){
      existingMap[siswaId].nilai = nilai;
      existingMap[siswaId].tanggal = existingMap[siswaId].tanggal || todayISO();
      if(store==="asesmenSumatif"){
        existingMap[siswaId].jenisSumatif = ctx.jenis;
        existingMap[siswaId].bentuk = ctx.bentuk;
      }
    } else {
      db[store].push(Object.assign({
        id: uid(store), siswaId, mapel: ctx.mapel, tanggal: todayISO(),
        nilai, lingkupMateri: ctx.bab, semester: ctx.semester, catatan: "",
      }, store==="asesmenSumatif" ? {jenisSumatif: ctx.jenis, bentuk: ctx.bentuk} : {jenisSumatif: "Formatif"}));
    }
    tersimpan++;
  });
  saveDB();
  inputNilaiClearDraft(ctx);
  toast(tersimpan+" nilai berhasil disimpan ke "+(ctx.jenis==="Formatif"?"Asesmen Formatif":"Asesmen Sumatif ("+inputNilaiJenisLabel(ctx.jenis)+")")+".");
  inputNilaiRenderTable();
}

PAGES.asesdiag = ()=>asesmenPage("asesmenDiagnostik","Asesmen Diagnostik","Pemetaan kondisi awal, kesiapan, dan gaya belajar peserta didik sebelum pembelajaran.", "diag");
PAGES.asesform = ()=>asesmenPage("asesmenFormatif","Asesmen Formatif","Penilaian proses untuk memberi umpan balik selama pembelajaran berlangsung. Tidak diperhitungkan dalam nilai rapor.", "form");
PAGES.asessum  = ()=>asesmenPage("asesmenSumatif","Asesmen Sumatif","Penilaian akhir lingkup materi/semester/fase sebagai dasar nilai rapor Kurikulum Merdeka.", "sum");

/* ---------- REKAP NILAI ---------- */
/* ============================================================
   DAFTAR NILAI — format ledger formal Kurikulum Merdeka
   ------------------------------------------------------------
   Alur resmi (Panduan Pembelajaran & Asesmen BSKAP, revisi 2025):
   - Asesmen FORMATIF = kualitatif, bahan perbaikan & deskripsi.
     TIDAK diperhitungkan dalam nilai rapor.
   - Asesmen SUMATIF per Lingkup Materi = kuantitatif, satu-satunya
     dasar nilai rapor. SAS tidak wajib (kewenangan sekolah).
   - Jenis penilaian SUMATIF (komponen sumber nilai rapor):
       1) Sumatif Lingkup Materi (akhir 1 lingkup materi/TP)
       2) STS - Sumatif Tengah Semester (pilihan sekolah)
       3) SAS - Sumatif Akhir Semester (pilihan sekolah)
       4) Sumatif Akhir Fase (dasar kelulusan, di luar rapor semester)
   - STS dihitung sebagai salah satu nilai sumatif dalam NA Sumatif.
   - NA Sumatif  = rata-rata sumatif lingkup materi (termasuk STS).
   - Nilai Akhir = rata-rata NA Sumatif dan SAS (jika SAS tersedia).
     Sumatif Akhir Fase ditampilkan sebagai kolom tersendiri dan
     TIDAK masuk Nilai Akhir semester.
   - Panduan memberi 3 opsi pengolahan: rata-rata (dipakai aplikasi),
     pembobotan, atau persentase ketercapaian - sesuaikan dengan
     kebijakan satuan pendidikan.
   - Kompatibilitas mundur: data lama tanpa field jenisSumatif dikenali
     dari awalan teks lingkup materi (STS.../SAS...), selebihnya
     dianggap Sumatif Lingkup Materi.
   ============================================================ */
function daftarNilaiRows(mapelSel, semSel){
  // Alur Kurikulum Merdeka (Panduan Pembelajaran dan Asesmen):
  // NA Sumatif = rata-rata nilai sumatif per lingkup materi (TERMASUK STS);
  // NA SAS = rata-rata nilai Sumatif Akhir Semester;
  // Nilai Akhir (Rapor) = rata-rata NA Sumatif dan NA SAS (jika SAS ada).
  // Nilai formatif TIDAK masuk hitungan (kualitatif, bahan deskripsi).
  const rows = (db.asesmenSumatif||[]).filter(r=>r.mapel===mapelSel && String(r.semester||"")===""+semSel);
  const lmSet = [];
  rows.forEach(r=>{
    const j = jenisSumatifOf(r);
    if(j!=="LM" && j!=="STS") return; // SAS & Sumatif Akhir Fase punya kolom tersendiri
    const lm = String(r.lingkupMateri||"Umum").trim()||"Umum";
    if(lmSet.indexOf(lm)<0) lmSet.push(lm);
  });
  const bySiswa = {};
  rows.forEach(r=>{ (bySiswa[r.siswaId]=bySiswa[r.siswaId]||[]).push(r); });
  const table = siswaSortedAlpha().map(s=>{
    const arr = bySiswa[s.id]||[];
    const lmVals = lmSet.map(lm=>{
      const v = arr.filter(r=>{ const j=jenisSumatifOf(r); return (j==="LM"||j==="STS") && String(r.lingkupMateri||"Umum").trim()===lm; }).map(r=>Number(r.nilai)||0);
      return v.length? v.reduce((a,b)=>a+b,0)/v.length : null;
    });
    const sasVals = arr.filter(r=>jenisSumatifOf(r)==="SAS").map(r=>Number(r.nilai)||0);
    const sas = sasVals.length? sasVals.reduce((a,b)=>a+b,0)/sasVals.length : null;
    const faseVals = arr.filter(r=>jenisSumatifOf(r)==="FASE").map(r=>Number(r.nilai)||0);
    const fase = faseVals.length? faseVals.reduce((a,b)=>a+b,0)/faseVals.length : null;
    const valid = lmVals.filter(v=>v!=null);
    const naSumatif = valid.length? valid.reduce((a,b)=>a+b,0)/valid.length : null;
    const nilaiAkhir = naSumatif==null? null : (sas==null? naSumatif : (naSumatif+sas)/2);
    let deskripsi = "-";
    if(valid.length){
      let iMax=0, iMin=0, pertama=true;
      lmVals.forEach((v,i)=>{ if(v==null) return;
        if(pertama){ iMax=iMin=i; pertama=false; return; }
        if(v>lmVals[iMax]) iMax=i; if(v<lmVals[iMin]) iMin=i; });
      deskripsi = (lmVals[iMax]===lmVals[iMin])
        ? "Menunjukkan penguasaan yang baik dalam "+lmSet[iMax]+"."
        : "Menunjukkan penguasaan dalam "+lmSet[iMax]+". Perlu bimbingan dalam "+lmSet[iMin]+".";
    }
    return {s:s, lmSet:lmSet, lmVals:lmVals, sas:sas, fase:fase, naSumatif:naSumatif, nilaiAkhir:nilaiAkhir, deskripsi:deskripsi};
  });
  return {lmSet:lmSet, table:table};
}
PAGES.rekapnilai = function(){
  const mapelSel = window._rekapMapel || MAPEL_LIST[0];
  const semSel = window._rekapSemester || "1";
  const dn = daftarNilaiRows(mapelSel, semSel);
  const lmSet = dn.lmSet, table = dn.table;
  const fmt = v=> v==null? "-": String(Math.round(v*10)/10);
  const head = `<tr><th rowspan="2">No</th><th rowspan="2">NIS</th><th rowspan="2">Nama Peserta Didik</th><th rowspan="2">L/P</th>`
    + (lmSet.length? `<th colspan="${lmSet.length}">Nilai Sumatif per Lingkup Materi (termasuk STS)</th>` : "")
    + `<th rowspan="2">SAS</th><th rowspan="2">Sumatif Akhir Fase</th><th rowspan="2">NA Sumatif</th><th rowspan="2">Nilai Akhir (Rapor)</th><th rowspan="2">Deskripsi Capaian</th></tr>`
    + (lmSet.length? `<tr>${lmSet.map(l=>`<th>${escapeHtml(l)}</th>`).join("")}</tr>` : "");
  const body = table.map((r,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(r.s.nis||"-")}</td>`
    + `<td style="text-align:left;"><strong>${escapeHtml(r.s.nama)}</strong></td><td>${escapeHtml(r.s.jk||"-")}</td>`
    + r.lmVals.map(v=>`<td>${fmt(v)}</td>`).join("")
    + `<td><strong>${fmt(r.sas)}</strong></td>`
    + `<td>${fmt(r.fase)}</td>`
    + `<td><strong>${fmt(r.naSumatif)}</strong></td>`
    + `<td style="background:var(--primary-ghost);"><strong>${fmt(r.nilaiAkhir)}</strong></td>`
    + `<td style="text-align:left;min-width:230px;font-size:12px;">${escapeHtml(r.deskripsi)}</td></tr>`).join("");
  return `
  <div class="section-head"><div><h1>Daftar Nilai</h1><div class="desc">Ledger formal per mata pelajaran &amp; semester — alur Kurikulum Merdeka: sumatif per lingkup materi (termasuk STS) &rarr; NA Sumatif &rarr; Nilai Akhir (rata-rata NA Sumatif &amp; SAS). Nilai formatif bersifat kualitatif (arsip) dan tidak masuk hitungan rapor.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportDaftarNilaiExcel()">${ic("download",15)} Excel</button>
    <button class="btn btn-primary" onclick="printDaftarNilai()">${ic("print",15)} Cetak</button></div>
  <div class="toolbar">
    <div class="field" style="min-width:200px;margin-bottom:0;"><label>Mata Pelajaran</label><select onchange="window._rekapMapel=this.value; renderPage('rekapnilai');">
      ${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${m===mapelSel?"selected":""}>${escapeHtml(m)}</option>`).join("")}
    </select></div>
    <div class="field" style="min-width:150px;margin-bottom:0;"><label>Semester</label><select onchange="window._rekapSemester=this.value; renderPage('rekapnilai');">
      <option value="1" ${semSel==="1"?"selected":""}>Semester 1</option>
      <option value="2" ${semSel==="2"?"selected":""}>Semester 2</option>
    </select></div>
    <div class="grow"></div>
    <span class="hint">Jenis penilaian kini dipilih eksplisit: <strong>Sumatif Lingkup Materi</strong>, <strong>STS</strong>, <strong>SAS</strong>, atau <strong>Sumatif Akhir Fase</strong> (di luar Nilai Akhir semester).</span>
  </div>
  ${table.length
    ? `<div id="daftarNilaiHolder" class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`
    : `<div class="empty-state">${illus("nilai",130)}<p>Belum ada nilai sumatif untuk mapel &amp; semester ini.<br>Isi dulu melalui menu <strong>Input Nilai Massal</strong>.</p></div>`}`;
};
function daftarNilaiKop(){
  const s = db.sekolah, mapelSel = window._rekapMapel || MAPEL_LIST[0], semSel = window._rekapSemester || "1";
  return `<table style="margin-bottom:10px;"><tbody>
    <tr><td style="width:180px;"><strong>Satuan Pendidikan</strong></td><td>: ${escapeHtml(s.namaSekolah||"")}</td></tr>
    <tr><td><strong>Kelas / Semester</strong></td><td>: ${escapeHtml(classInfo(activeClassId).label)} / ${semSel==="1"?"1 (Ganjil)":"2 (Genap)"}</td></tr>
    <tr><td><strong>Mata Pelajaran</strong></td><td>: ${escapeHtml(mapelSel)}</td></tr>
    <tr><td><strong>Tahun Pelajaran</strong></td><td>: ${escapeHtml(s.tahunAjaran||"")}</td></tr>
  </tbody></table>`;
}
function daftarNilaiPengesahan(){
  const s = db.sekolah;
  const wali = (db.guru||[]).find(g=>g.id===s.waliKelasId);
  return `<br><table style="width:100%;"><tbody><tr>
    <td style="width:50%;text-align:center;">Mengetahui,<br>Kepala Sekolah<br><br><br><br><br><strong><u>${escapeHtml(s.kepalaSekolah||"")}</u></strong><br>NIP. ${escapeHtml(s.nipKepsek||"")}</td>
    <td style="width:50%;text-align:center;">${escapeHtml(s.desa||"")}, ${fmtDate(todayISO())}<br>Wali Kelas<br><br><br><br><br><strong><u>${escapeHtml(wali?wali.nama:"")}</u></strong><br>NIP. ${escapeHtml(wali?(wali.nip||""):"")}</td>
  </tr></tbody></table>
  <p style="font-size:10pt;margin-top:10px;"><strong>Keterangan:</strong> Komponen sumatif: Sumatif Lingkup Materi, STS, SAS (STS &amp; SAS bersifat pilihan), dan Sumatif Akhir Fase. NA Sumatif = rata-rata nilai sumatif per lingkup materi (termasuk STS). Nilai Akhir (Rapor) = rata-rata NA Sumatif dan SAS (apabila SAS dilaksanakan). Sumatif Akhir Fase ditampilkan tersendiri dan tidak masuk Nilai Akhir semester. Nilai formatif bersifat kualitatif sebagai bahan deskripsi dan <strong>tidak</strong> diperhitungkan dalam nilai rapor. Acuan: Permendikbudristek No. 21/2022 tentang Standar Penilaian &amp; Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Catatan: panduan memberi 3 opsi pengolahan nilai akhir (rata-rata / pembobotan / persentase ketercapaian) — tabel ini memakai opsi rata-rata; sesuaikan dengan kebijakan satuan pendidikan.</p>`;
}
function exportDaftarNilaiExcel(){
  const holder = document.getElementById("daftarNilaiHolder");
  if(!holder){ toast("Tidak ada data untuk diekspor"); return; }
  htmlToExcelXls(daftarNilaiKop()+holder.innerHTML+daftarNilaiPengesahan(),
    "Daftar_Nilai_"+(window._rekapMapel||"").replace(/\s+/g,"_"), "Daftar Nilai");
}
function printDaftarNilai(){
  const holder = document.getElementById("daftarNilaiHolder");
  if(!holder){ toast("Tidak ada data untuk dicetak"); return; }
  printDocument("DAFTAR NILAI - "+(window._rekapMapel||"").toUpperCase(),
    daftarNilaiKop()+holder.innerHTML+daftarNilaiPengesahan());
}

/* ---------- DESKRIPSI RAPOR ---------- */
function generateRaporDraft(siswaId){
  const s = db.siswa.find(x=>x.id===siswaId);
  const rows = db.asesmenSumatif.filter(r=>r.siswaId===siswaId);
  const byMapel = {};
  rows.forEach(r=>{ if(!byMapel[r.mapel]) byMapel[r.mapel]=[]; byMapel[r.mapel].push(Number(r.nilai)||0); });
  let text = `${s.nama} `;
  const parts = Object.keys(byMapel).map(m=>{
    const arr = byMapel[m]; const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
    const level = avg>=85?"sangat baik":avg>=70?"baik dan sesuai harapan":avg>=60?"mulai berkembang":"masih perlu bimbingan lebih lanjut";
    return `menunjukkan capaian yang ${level} pada mata pelajaran ${m}`;
  });
  if(parts.length===0){
    text += "belum memiliki data asesmen sumatif yang cukup untuk disusun menjadi deskripsi rapor. Silakan lengkapi data pada menu Asesmen Sumatif terlebih dahulu.";
  } else {
    text += parts.join("; ") + ". Ananda menunjukkan perkembangan yang baik pada dimensi profil lulusan sesuai pengamatan guru selama proses pembelajaran mendalam (berkesadaran, bermakna, dan menggembirakan). Diharapkan Ananda terus semangat belajar dan berlatih di rumah bersama orang tua.";
  }
  return text;
}
/* ---------- REKAP NILAI RAPOR (konsolidasi nilai akhir per mapel) ---------- */
function predikatNilai(v){
  if(v==null) return "-";
  if(v>=85) return "Sangat Berkembang";
  if(v>=70) return "Berkembang Sesuai Harapan";
  if(v>=60) return "Mulai Berkembang";
  return "Belum Berkembang";
}
function raporKop(semSel){
  const s = db.sekolah;
  return `<table style="margin-bottom:10px;"><tbody>
    <tr><td style="width:180px;"><strong>Satuan Pendidikan</strong></td><td>: ${escapeHtml(s.namaSekolah||"")}</td></tr>
    <tr><td><strong>Kelas / Semester</strong></td><td>: ${escapeHtml(classInfo(activeClassId).label)} / ${semSel==="1"?"1 (Ganjil)":"2 (Genap)"}</td></tr>
    <tr><td><strong>Tahun Pelajaran</strong></td><td>: ${escapeHtml(s.tahunAjaran||"")}</td></tr>
  </tbody></table>`;
}
function raporNilaiTable(semSel){
  const siswa = siswaSortedAlpha();
  const perMapel = MAPEL_LIST.map(m=>{
    const dn = daftarNilaiRows(m, semSel);
    const map = {};
    dn.table.forEach(r=>{ map[r.s.id] = r.nilaiAkhir; });
    return {mapel:m, map:map};
  });
  const fmt1 = v=> v==null? "-": String(Math.round(v*10)/10);
  const head = `<tr><th>No</th><th>Nama Peserta Didik</th>${perMapel.map(p=>`<th>${escapeHtml(p.mapel)}</th>`).join("")}<th>Rata-rata</th></tr>`;
  const body = siswa.map((s,i)=>{
    const vals = perMapel.map(p=>p.map[s.id]);
    const valid = vals.filter(v=>v!=null);
    const avg = valid.length? valid.reduce((a,b)=>a+b,0)/valid.length : null;
    return `<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(s.nama)}</strong></td>`
      + vals.map(v=>`<td>${fmt1(v)}</td>`).join("")
      + `<td style="background:var(--primary-ghost);"><strong>${fmt1(avg)}</strong></td></tr>`;
  }).join("");
  return {head:head, body:body, count:siswa.length};
}
function printRekapRapor(){
  const semSel = window._raporSemester || String(db.sekolah.semester||"1");
  const nt = raporNilaiTable(semSel);
  if(!nt.count){ toast("Belum ada data siswa."); return; }
  printDocument("REKAP NILAI RAPOR SEMESTER "+semSel,
    raporKop(semSel)+`<div class="table-wrap"><table><thead>${nt.head}</thead><tbody>${nt.body}</tbody></table></div>`+daftarNilaiPengesahan());
}
function exportRekapRaporExcel(){
  const semSel = window._raporSemester || String(db.sekolah.semester||"1");
  const nt = raporNilaiTable(semSel);
  if(!nt.count){ toast("Belum ada data siswa."); return; }
  htmlToExcelXls(raporKop(semSel)+`<table><thead>${nt.head}</thead><tbody>${nt.body}</tbody></table>`+daftarNilaiPengesahan(),
    "Rekap_Nilai_Rapor_Semester_"+semSel, "Rekap Nilai Rapor");
}
PAGES.rapor = function(){
  const semSel = window._raporSemester || String(db.sekolah.semester||"1");
  const nt = raporNilaiTable(semSel);
  const rows = siswaSortedAlpha().map(s=>{
    const text = db.raporDeskripsi[s.id] || "";
    return `<div class="card" style="margin-bottom:14px;">
      <h3>${escapeHtml(s.nama)}</h3>
      <div class="field"><textarea id="rapor_${s.id}" placeholder="Klik 'Buat Draf Otomatis' atau tulis manual...">${escapeHtml(text)}</textarea></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-sm" onclick="draftRapor('${s.id}')">${ic("star",14)} Buat Draf Otomatis</button>
        <button class="btn btn-sm btn-primary" onclick="saveRapor('${s.id}')">${ic("check",14)} Simpan</button>
        <button class="btn btn-sm" onclick="printRaporSiswa('${s.id}')">${ic("print",14)} Cetak</button>
      </div></div>`;
  }).join("");
  return `<div class="section-head"><div><h1>Rapor Semester</h1><div class="desc">Rekap Nilai Akhir per mata pelajaran (otomatis dari Daftar Nilai) siap dipakai untuk pengisian rapor, dilanjutkan dengan deskripsi capaian per siswa.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportRekapRaporExcel()">${ic("download",15)} Excel</button>
    <button class="btn btn-primary" onclick="printRekapRapor()">${ic("print",15)} Cetak Rekap</button></div>
  <div class="toolbar">
    <div class="field" style="min-width:150px;margin-bottom:0;"><label>Semester</label><select onchange="window._raporSemester=this.value; renderPage('rapor');">
      <option value="1" ${semSel==="1"?"selected":""}>Semester 1</option>
      <option value="2" ${semSel==="2"?"selected":""}>Semester 2</option>
    </select></div>
    <div class="grow"></div>
    <span class="hint">Nilai Akhir = rata-rata NA Sumatif &amp; SAS per mapel (lihat Daftar Nilai).</span>
  </div>
  <div class="card" style="margin-bottom:16px;"><h3 style="font-size:14px;margin-bottom:10px;">${ic("bar",16)} Rekap Nilai Akhir per Mata Pelajaran</h3>
    <div class="table-wrap"><table><thead>${nt.head}</thead><tbody>${nt.body}</tbody></table></div></div>
  <h2 style="font-size:15px;margin:18px 0 10px;">${ic("reportcard",16)} Deskripsi Capaian per Siswa</h2>
  ${rows}`;
};
function draftRapor(id){ document.getElementById("rapor_"+id).value = generateRaporDraft(id); }
function saveRapor(id){ db.raporDeskripsi[id] = document.getElementById("rapor_"+id).value; saveDB(); toast("Deskripsi rapor tersimpan."); }
function printRaporSiswa(id){
  const s = db.siswa.find(x=>x.id===id);
  const text = db.raporDeskripsi[id] || generateRaporDraft(id);
  printDocument("DESKRIPSI RAPOR - "+s.nama.toUpperCase(), `<p><strong>Nama:</strong> ${escapeHtml(s.nama)} &nbsp; <strong>NIS:</strong> ${escapeHtml(s.nis||'-')} &nbsp; <strong>Kelas:</strong> ${escapeHtml(db.sekolah.kelas)}</p><div class="divider"></div><p style="line-height:1.8;">${escapeHtml(text)}</p>`);
}

/* ---------- KEHADIRAN ---------- */
/* DIHAPUS (redundan): versi lama PAGES.kehadiran dipindah/digabung ke
   80-ai.js yang aktif (dengan pemilih bulan + grid absensi bulanan).
   Dihapus agar tidak membingungkan saat edit manual. */

/* ---------- CATATAN PERKEMBANGAN ---------- */
PAGES.perkembangan = function(){
  return crudSection({
    store:"perkembangan", title:"Catatan Perkembangan / Buku Bimbingan",
    desc:"Catatan perkembangan sikap, sosial-emosional, dan akademik peserta didik dari waktu ke waktu.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tanggal",label:"Tanggal",type:"date",required:true},
      {key:"kategori",label:"Kategori",type:"select",options:["Akademik","Sosial-Emosional","Sikap/Perilaku","Kesehatan","Bakat/Minat"]},
      {key:"catatan",label:"Catatan Perkembangan",type:"textarea",required:true},
      {key:"tindakLanjut",label:"Tindak Lanjut",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml((db.siswa.find(s=>s.id===v)||{}).nama||"?")},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"kategori",label:"Kategori"},
      {key:"catatan",label:"Catatan",render:v=>escapeHtml((v||"").slice(0,50))+((v||"").length>50?"...":"")},
    ],
    searchKeys:["catatan","kategori"]
  });
};

/* ---------- HOME VISIT ---------- */
PAGES.homevisit = function(){
  return crudSection({
    store:"homevisit", title:"Home Visit (Kunjungan Rumah)",
    desc:"Dokumentasi kunjungan rumah untuk tindak lanjut pembinaan peserta didik.",
    fields:[
      {key:"siswaId",label:"Nama Siswa",type:"select",options:siswaOpts(),required:true},
      {key:"tanggal",label:"Tanggal Kunjungan",type:"date",required:true},
      {key:"tujuan",label:"Tujuan Kunjungan",type:"textarea",required:true},
      {key:"hasil",label:"Hasil Kunjungan",type:"textarea"},
      {key:"tindakLanjut",label:"Rencana Tindak Lanjut",type:"textarea"},
    ],
    columns:[
      {key:"siswaId",label:"Siswa",render:v=>escapeHtml((db.siswa.find(s=>s.id===v)||{}).nama||"?")},
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"tujuan",label:"Tujuan",render:v=>escapeHtml((v||"").slice(0,50))+((v||"").length>50?"...":"")},
    ],
    searchKeys:["tujuan","hasil"]
  });
};

/* ---------- SUPERVISI & REFLEKSI GURU ---------- */
PAGES.supervisi = function(){
  const tab = window._supTab || "supervisi";
  let inner;
  if(tab==="supervisi"){
    inner = crudSection({
      store:"supervisi", title:"Catatan Supervisi / Kepala Sekolah",
      desc:"Catatan hasil supervisi kelas dan pembinaan dari Kepala Sekolah / Pengawas.",
      fields:[
        {key:"tanggal",label:"Tanggal",type:"date",required:true},
        {key:"supervisor",label:"Nama Supervisor",required:true},
        {key:"catatan",label:"Catatan/Temuan",type:"textarea",required:true},
        {key:"tindakLanjut",label:"Rencana Tindak Lanjut",type:"textarea"},
      ],
      columns:[{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"supervisor",label:"Supervisor"},{key:"catatan",label:"Catatan",render:v=>escapeHtml((v||"").slice(0,50))+((v||"").length>50?"...":"")}],
    });
  } else {
    inner = crudSection({
      store:"refleksi", title:"Refleksi Guru",
      desc:"Refleksi mandiri guru atas praktik mengajar sebagai bagian pengembangan profesional berkelanjutan.",
      fields:[
        {key:"tanggal",label:"Tanggal",type:"date",required:true},
        {key:"catatan",label:"Refleksi (apa yang berhasil, kendala, rencana perbaikan)",type:"textarea",required:true},
      ],
      columns:[{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"catatan",label:"Refleksi",render:v=>escapeHtml((v||"").slice(0,80))+((v||"").length>80?"...":"")}],
    });
  }
  return `<div class="pill-toggle" style="max-width:320px;margin-bottom:14px;">
    <button class="${tab==='supervisi'?'active':''}" onclick="window._supTab='supervisi';renderPage('supervisi');">Supervisi</button>
    <button class="${tab==='refleksi'?'active':''}" onclick="window._supTab='refleksi';renderPage('supervisi');">Refleksi Guru</button>
  </div>${inner}`;
};

/* ---------- INVENTARIS KELAS ---------- */
PAGES.inventaris = function(){
  return crudSection({
    store:"inventaris", title:"Inventaris Kelas",
    desc:"Daftar sarana & prasarana yang tersedia di dalam kelas.",
    fields:[
      {key:"nama",label:"Nama Barang",required:true}, {key:"jumlah",label:"Jumlah",type:"number"},
      {key:"kondisi",label:"Kondisi",type:"select",options:["Baik","Rusak Ringan","Rusak Berat"]},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[{key:"nama",label:"Nama Barang"},{key:"jumlah",label:"Jumlah"},{key:"kondisi",label:"Kondisi",render:v=>`<span class="badge ${v==='Baik'?'badge-green':v==='Rusak Ringan'?'badge-orange':'badge-red'}">${escapeHtml(v)}</span>`},{key:"keterangan",label:"Keterangan"}],
  });
};

/* ---------- BUKU TAMU ---------- */
PAGES.bukutamu = function(){
  return crudSection({
    store:"bukutamu", title:"Buku Tamu Kelas",
    desc:"Catatan kunjungan tamu ke kelas/sekolah (mengikuti format Buku Tamu Kelas: hari/tanggal, nama, jabatan, maksud & tujuan, TTD).",
    fields:[
      {key:"tanggal",label:"Hari/Tanggal",type:"date",required:true}, {key:"nama",label:"Nama Tamu",required:true},
      {key:"jabatan",label:"Jabatan/Instansi"}, {key:"keperluan",label:"Maksud dan Tujuan",type:"textarea"},
      {key:"ttd",label:"Keterangan Tanda Tangan"},
    ],
    columns:[{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"nama",label:"Nama"},{key:"jabatan",label:"Jabatan/Instansi"},{key:"keperluan",label:"Maksud dan Tujuan"}],
  });
};

/* ---------- BUKU MUTASI SISWA ---------- */
PAGES.mutasi = function(){
  const html = crudSection({
    store:"mutasi", title:"Buku Mutasi Siswa",
    desc:"Riwayat siswa masuk (peserta didik baru/pindahan) dan keluar (mutasi keluar/putus sekolah/dll.) beserta alasan dan tanggalnya. Sebagian besar entri terisi otomatis dari menu Data Siswa (\"Siswa Masuk\" &amp; ikon Siswa Keluar), namun dapat juga ditambah/diubah manual di sini.",
    fields:[
      {key:"tanggal",label:"Tanggal",type:"date",required:true},
      {key:"namaSiswa",label:"Nama Siswa",required:true},
      {key:"jenis",label:"Jenis Mutasi",type:"select",options:["Masuk - Peserta Didik Baru","Masuk - Pindahan / Mutasi Masuk","Keluar - Pindah Sekolah (Mutasi Keluar)","Keluar - Putus Sekolah","Keluar - Meninggal Dunia","Keluar - Lainnya"]},
      {key:"alasanKeluar",label:"Alasan Keluar (khusus jenis Keluar)"},
      {key:"asalTujuan",label:"Sekolah Asal / Sekolah Tujuan"},
      {key:"keterangan",label:"Keterangan",type:"textarea"},
    ],
    columns:[
      {key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},
      {key:"namaSiswa",label:"Nama Siswa"},
      {key:"jenis",label:"Jenis",render:v=>`<span class="badge ${String(v||"").startsWith("Masuk")?"badge-green":"badge-red"}">${escapeHtml(v||"-")}</span>`},
      {key:"asalTujuan",label:"Sekolah Asal/Tujuan"},
      {key:"keterangan",label:"Keterangan",render:v=>escapeHtml((v||"").slice(0,40))+((v||"").length>40?"...":"")},
    ],
  });
  return `<div class="card" style="background:var(--primary-soft);border-color:var(--primary);margin-bottom:14px;">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      ${ic("info",18)}
      <p style="margin:0;font-size:12px;flex:1;min-width:200px;">Untuk memproses siswa baru/pindahan atau siswa keluar secara langsung dari roster kelas (otomatis tercatat di sini), gunakan menu <strong>Data Siswa</strong>.</p>
      <button class="btn btn-sm" onclick="navigate('siswa')">${ic("student",14)} Ke Data Siswa</button>
    </div>
  </div>${html}`;
};

/* ---------- ARSIP DOKUMEN ---------- */
PAGES.arsip = function(){
  const filters = window._arsipFilters || {kategori:"", kelasId:"", mapel:"", semester:"", q:""};
  window._arsipFilters = filters;
  window._arsipOnRefresh = ()=> renderArsipListInto("arsipListHolder", window._arsipFilters);
  setTimeout(window._arsipOnRefresh, 0);

  const legacyHtml = crudSection({
    store:"arsip", title:"Catatan Arsip Lama (Tanpa File)",
    desc:"Entri arsip berbasis catatan teks dari versi aplikasi sebelumnya (tanpa berkas asli). Tetap dipertahankan agar data lama tidak hilang -- gunakan panel \"Unggah Dokumen\" di atas untuk arsip baru yang menyertakan berkas aslinya.",
    fields:[
      {key:"tanggal",label:"Tanggal",type:"date"},
      {key:"judul",label:"Judul Dokumen",required:true},
      {key:"kategori",label:"Kategori",type:"select",options:["Administrasi","Dokumentasi Kegiatan","Surat Menyurat","Catatan Kepala Sekolah","Lainnya"]},
      {key:"lokasi",label:"Lokasi Berkas / Keterangan",type:"textarea"},
    ],
    columns:[{key:"tanggal",label:"Tanggal",render:v=>fmtDate(v)},{key:"judul",label:"Judul"},{key:"kategori",label:"Kategori"},{key:"lokasi",label:"Lokasi/Keterangan"}],
  });

  return `
  <div class="section-head"><div><h1>Arsip Dokumen</h1><div class="desc">Pusat penyimpanan file guru (Modul Ajar, Jurnal Mengajar, ATP, CP, RPP, Administrasi Guru, dan dokumen lain), tersimpan 100% offline di perangkat ini melalui IndexedDB.</div></div>
    <div class="grow"></div>
    <button class="btn btn-primary" onclick="uploadArsipFile({onDone:window._arsipOnRefresh})">${ic("upload",15)} Unggah Dokumen</button>
  </div>
  <div class="toolbar">
    <div class="search-box">${ic("search",16)}<input placeholder="Cari nama file / mapel / bab / isi OCR..." value="${escapeHtml(filters.q)}" oninput="window._arsipFilters.q=this.value; window._arsipOnRefresh();"></div>
    <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._arsipFilters.kategori=this.value; window._arsipOnRefresh();">
      <option value="">Semua Kategori</option>
      ${ARSIP_KATEGORI.map(k=>`<option value="${escapeHtml(k)}" ${filters.kategori===k?"selected":""}>${escapeHtml(k)}</option>`).join("")}
    </select>
    <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._arsipFilters.kelasId=this.value; window._arsipOnRefresh();">
      <option value="">Semua Kelas</option>
      ${CLASS_LIST.map(c=>`<option value="${c.id}" ${filters.kelasId===c.id?"selected":""}>${escapeHtml(c.label)}</option>`).join("")}
    </select>
    <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._arsipFilters.mapel=this.value; window._arsipOnRefresh();">
      <option value="">Semua Mapel</option>
      ${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${filters.mapel===m?"selected":""}>${escapeHtml(m)}</option>`).join("")}
    </select>
    <select style="padding:10px;border-radius:11px;border:1px solid var(--border);" onchange="window._arsipFilters.semester=this.value; window._arsipOnRefresh();">
      <option value="">Semua Semester</option>
      <option value="1" ${filters.semester==="1"?"selected":""}>Semester 1</option>
      <option value="2" ${filters.semester==="2"?"selected":""}>Semester 2</option>
    </select>
  </div>
  <div id="arsipListHolder"><p class="muted">Memuat arsip...</p></div>
  <div class="divider" style="margin:24px 0;"></div>
  ${legacyHtml}`;
};


