/* ============================================================
   45. ANALISIS NILAI
   Analisis ketuntasan & tindak lanjut per mapel/semester sesuai
   Panduan Pembelajaran dan Asesmen Kurikulum Merdeka:
   - ketuntasan per siswa vs ambang KKTP (dapat diubah)
   - ketuntasan klasikal, rata-rata, nilai tertinggi/terendah
   - daftar remedial & pengayaan
   - lingkup materi yang perlu penguatan
   Sumber data: db.asesmenSumatif (sama dengan Daftar Nilai).
   ============================================================ */
function analisisAmbang(){
  const a = parseFloat(window._anAmbang);
  return isNaN(a) ? 70 : Math.min(100, Math.max(0, a));
}
function analisisCompute(mapelSel, semSel){
  const dn = daftarNilaiRows(mapelSel, semSel);
  const ambang = analisisAmbang();
  const rows = dn.table.map(r=>{
    const na = r.nilaiAkhir;
    const tuntas = na!=null && na>=ambang;
    let iMin=-1, iMax=-1;
    r.lmVals.forEach((v,i)=>{ if(v==null) return;
      if(iMin<0 || v<r.lmVals[iMin]) iMin=i;
      if(iMax<0 || v>r.lmVals[iMax]) iMax=i; });
    return {s:r.s, lmSet:r.lmSet, lmVals:r.lmVals, sas:r.sas, naSumatif:r.naSumatif,
      nilaiAkhir:na, tuntas:tuntas, predikat:predikatNilai(na),
      lmTerlemah: iMin>=0 ? r.lmSet[iMin] : "-",
      lmTerkuat:  iMax>=0 ? r.lmSet[iMax] : "-"};
  });
  const validNA = rows.map(x=>x.nilaiAkhir).filter(v=>v!=null);
  const avg = validNA.length ? validNA.reduce((a,b)=>a+b,0)/validNA.length : null;
  const max = validNA.length ? Math.max.apply(null,validNA) : null;
  const min = validNA.length ? Math.min.apply(null,validNA) : null;
  const tuntasCount = rows.filter(x=>x.tuntas).length;
  const klasikal = rows.length ? (tuntasCount/rows.length*100) : null;
  const lmAvg = dn.lmSet.map((lm,i)=>{
    const v = rows.map(x=>x.lmVals[i]).filter(v=>v!=null);
    return {lm:lm, avg: v.length ? v.reduce((a,b)=>a+b,0)/v.length : null};
  });
  let lmLemah = null;
  lmAvg.forEach(o=>{ if(o.avg!=null && (!lmLemah || o.avg<lmLemah.avg)) lmLemah=o; });
  const remedial  = rows.filter(x=>!x.tuntas && x.nilaiAkhir!=null);
  const pengayaan = rows.filter(x=>x.nilaiAkhir!=null && x.nilaiAkhir>=85);
  return {dn:dn, rows:rows, avg:avg, max:max, min:min, tuntasCount:tuntasCount,
    klasikal:klasikal, lmAvg:lmAvg, lmLemah:lmLemah, remedial:remedial,
    pengayaan:pengayaan, ambang:ambang};
}
function analisisTableHtml(comp){
  const fmt1 = v=> v==null? "-": String(Math.round(v*10)/10);
  const head = `<tr><th>No</th><th>Nama Peserta Didik</th>`
    + (comp.dn.lmSet.length? comp.dn.lmSet.map(l=>`<th>${escapeHtml(l)}</th>`).join("") : "")
    + `<th>SAS</th><th>NA Sumatif</th><th>Nilai Akhir</th><th>Ketuntasan</th><th>Predikat</th></tr>`;
  const body = comp.rows.map((x,i)=>{
    const badge = x.nilaiAkhir==null
      ? `<span class="badge">-</span>`
      : x.tuntas ? `<span class="badge badge-green">Tuntas</span>` : `<span class="badge badge-orange">Belum</span>`;
    return `<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(x.s.nama)}</strong></td>`
      + x.lmVals.map(v=>`<td>${fmt1(v)}</td>`).join("")
      + `<td>${fmt1(x.sas)}</td><td>${fmt1(x.naSumatif)}</td>`
      + `<td style="background:var(--primary-ghost);"><strong>${fmt1(x.nilaiAkhir)}</strong></td>`
      + `<td>${badge}</td><td style="font-size:12px;">${escapeHtml(x.predikat)}</td></tr>`;
  }).join("");
  return `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}
PAGES.analisisnilai = function(){
  const mapelSel = window._anMapel || MAPEL_LIST[0];
  const semSel = window._anSemester || "1";
  const comp = analisisCompute(mapelSel, semSel);
  const fmt1 = v=> v==null? "-": String(Math.round(v*10)/10);
  const statCards = `
    <div class="stat-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:16px;">
      <div class="stat-card"><div class="stat-num">${fmt1(comp.avg)}</div><div class="stat-label">Rata-rata Kelas</div></div>
      <div class="stat-card"><div class="stat-num">${fmt1(comp.max)}</div><div class="stat-label">Nilai Tertinggi</div></div>
      <div class="stat-card"><div class="stat-num">${fmt1(comp.min)}</div><div class="stat-label">Nilai Terendah</div></div>
      <div class="stat-card"><div class="stat-num">${comp.klasikal==null?"-":Math.round(comp.klasikal*10)/10+"%"}</div><div class="stat-label">Ketuntasan Klasikal</div></div>
      <div class="stat-card"><div class="stat-num">${comp.tuntasCount}/${comp.rows.length}</div><div class="stat-label">Tuntas / Siswa</div></div>
    </div>`;
  const remedialHtml = comp.remedial.length
    ? `<table><thead><tr><th>No</th><th>Nama</th><th>Nilai Akhir</th><th>Materi Terlemah</th></tr></thead><tbody>`
      + comp.remedial.map((x,i)=>`<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(x.s.nama)}</strong></td><td>${fmt1(x.nilaiAkhir)}</td><td style="text-align:left;">${escapeHtml(x.lmTerlemah)}</td></tr>`).join("")
      + `</tbody></table>`
    : `<p class="muted">Semua siswa tuntas. Tidak ada yang perlu remedial. 🎉</p>`;
  const pengayaanHtml = comp.pengayaan.length
    ? `<table><thead><tr><th>No</th><th>Nama</th><th>Nilai Akhir</th><th>Materi Terkuat</th></tr></thead><tbody>`
      + comp.pengayaan.map((x,i)=>`<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(x.s.nama)}</strong></td><td>${fmt1(x.nilaiAkhir)}</td><td style="text-align:left;">${escapeHtml(x.lmTerkuat)}</td></tr>`).join("")
      + `</tbody></table>`
    : `<p class="muted">Belum ada siswa dengan nilai ≥ 85.</p>`;
  const lmAvgHtml = comp.lmAvg.length
    ? `<table><thead><tr><th>Lingkup Materi</th><th>Rata-rata Kelas</th></tr></thead><tbody>`
      + comp.lmAvg.map(o=>`<tr><td style="text-align:left;">${escapeHtml(o.lm)}</td><td><strong>${fmt1(o.avg)}</strong></td></tr>`).join("")
      + `</tbody></table>
      <p class="muted" style="margin-top:8px;">${comp.lmLemah?`Perlu penguatan: <strong>${escapeHtml(comp.lmLemah.lm)}</strong> (rata-rata ${fmt1(comp.lmLemah.avg)}).`:""}</p>`
    : `<p class="muted">Belum ada data lingkup materi.</p>`;
  return `
  <div class="section-head"><div><h1>Analisis Nilai</h1><div class="desc">Ketuntasan per siswa, ketuntasan klasikal, daftar remedial &amp; pengayaan, serta lingkup materi yang perlu penguatan — dihitung otomatis dari data Asesmen Sumatif.</div></div>
    <div class="grow"></div>
    <button class="btn" onclick="exportAnalisisExcel()">${ic("download",15)} Excel</button>
    <button class="btn btn-primary" onclick="printAnalisis()">${ic("print",15)} Cetak</button></div>
  <div class="toolbar">
    <div class="field" style="min-width:200px;margin-bottom:0;"><label>Mata Pelajaran</label><select onchange="window._anMapel=this.value; renderPage('analisisnilai');">
      ${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${m===mapelSel?"selected":""}>${escapeHtml(m)}</option>`).join("")}
    </select></div>
    <div class="field" style="min-width:130px;margin-bottom:0;"><label>Semester</label><select onchange="window._anSemester=this.value; renderPage('analisisnilai');">
      <option value="1" ${semSel==="1"?"selected":""}>Semester 1</option>
      <option value="2" ${semSel==="2"?"selected":""}>Semester 2</option>
    </select></div>
    <div class="field" style="min-width:170px;margin-bottom:0;"><label>Ambang Ketuntasan (KKTP)</label><input type="number" min="0" max="100" step="1" value="${comp.ambang}" onchange="window._anAmbang=this.value; renderPage('analisisnilai');"></div>
    <div class="grow"></div>
    <span class="hint">Ambang mengacu pada KKTP (menu KKTP). Predikat: ≥85 Sangat Berkembang · 70–84 Berkembang Sesuai Harapan · 60–69 Mulai Berkembang · &lt;60 Belum Berkembang.</span>
  </div>
  ${comp.rows.length ? `
  ${statCards}
  <div class="card" style="margin-bottom:16px;"><h3 style="font-size:14px;margin-bottom:10px;">${ic("bar",16)} Tabel Analisis Ketuntasan</h3>
    ${analisisTableHtml(comp)}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
    <div class="card"><h3 style="font-size:14px;margin-bottom:10px;">${ic("heart",16)} Perlu Remedial (${comp.remedial.length})</h3>${remedialHtml}</div>
    <div class="card"><h3 style="font-size:14px;margin-bottom:10px;">${ic("star",16)} Pengayaan (${comp.pengayaan.length})</h3>${pengayaanHtml}</div>
  </div>
  <div class="card" style="margin-bottom:16px;"><h3 style="font-size:14px;margin-bottom:10px;">${ic("target",16)} Rata-rata Kelas per Lingkup Materi</h3>${lmAvgHtml}</div>`
  : `<div class="empty-state">${ic("bar",40)}<p>Belum ada nilai sumatif untuk mapel &amp; semester ini.<br>Isi dulu melalui menu <strong>Input Nilai Massal</strong>.</p></div>`}`;
};
function analisisPrintBody(){
  const mapelSel = window._anMapel || MAPEL_LIST[0];
  const semSel = window._anSemester || "1";
  const comp = analisisCompute(mapelSel, semSel);
  const fmt1 = v=> v==null? "-": String(Math.round(v*10)/10);
  return `<table style="margin-bottom:10px;"><tbody>
    <tr><td style="width:180px;"><strong>Satuan Pendidikan</strong></td><td>: ${escapeHtml(db.sekolah.namaSekolah||"")}</td></tr>
    <tr><td><strong>Kelas / Semester</strong></td><td>: ${escapeHtml(classInfo(activeClassId).label)} / ${semSel==="1"?"1 (Ganjil)":"2 (Genap)"}</td></tr>
    <tr><td><strong>Mata Pelajaran</strong></td><td>: ${escapeHtml(mapelSel)}</td></tr>
    <tr><td><strong>Ambang Ketuntasan</strong></td><td>: ${comp.ambang}</td></tr>
  </tbody></table>`
  + `<p><strong>Rata-rata kelas:</strong> ${fmt1(comp.avg)} &nbsp;|&nbsp; <strong>Tertinggi:</strong> ${fmt1(comp.max)} &nbsp;|&nbsp; <strong>Terendah:</strong> ${fmt1(comp.min)} &nbsp;|&nbsp; <strong>Ketuntasan klasikal:</strong> ${comp.klasikal==null?"-":Math.round(comp.klasikal*10)/10+"%"} (${comp.tuntasCount}/${comp.rows.length} tuntas)</p>`
  + analisisTableHtml(comp)
  + `<p style="margin-top:10px;"><strong>Perlu remedial (${comp.remedial.length}):</strong> ${comp.remedial.map(x=>escapeHtml(x.s.nama)).join(", ")||"-"}</p>`
  + `<p><strong>Pengayaan (${comp.pengayaan.length}):</strong> ${comp.pengayaan.map(x=>escapeHtml(x.s.nama)).join(", ")||"-"}</p>`
  + (comp.lmLemah?`<p><strong>Materi perlu penguatan:</strong> ${escapeHtml(comp.lmLemah.lm)} (rata-rata ${fmt1(comp.lmLemah.avg)})</p>`:"")
  + daftarNilaiPengesahan();
}
function printAnalisis(){
  const mapelSel = window._anMapel || MAPEL_LIST[0];
  printDocument("ANALISIS NILAI - "+mapelSel.toUpperCase(), analisisPrintBody());
}
function exportAnalisisExcel(){
  const mapelSel = window._anMapel || MAPEL_LIST[0];
  htmlToExcelXls(analisisPrintBody(), "Analisis_Nilai_"+mapelSel.replace(/\s+/g,"_"), "Analisis Nilai");
}
