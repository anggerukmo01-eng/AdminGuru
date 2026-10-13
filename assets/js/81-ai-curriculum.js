/* CP reference and two handoff workflows, using the existing AI settings/history. */
const CP_RELIGION_IDS = new Set(["pai","kristen","katolik","hindu","buddha","khonghucu"]);
const CP_UPDATE_SOURCE = "https://www.kemendikdasmen.go.id/siaran-pers/15636-capaian-pembelajaran-baru-telah-terbit-yang-berubah-hanya-mata-pelajaran-agama-dan-budi-pekerti";
function curriculumMapelOptions(){return CP_DATA.mapel.map(m=>`<option value="${m.id}" ${m.id==="matematika"?"selected":""}>${escapeHtml(m.nama)}</option>`).join("");}
function curriculumCp(mapelId,fase){const m=CP_DATA.mapel.find(x=>x.id===mapelId);return m&&m.fases[fase]||"";}
function curriculumPhaseNote(mapelId,fase){
  if(CP_RELIGION_IDS.has(mapelId)) return "Lampiran ini berisi CP Agama versi 2025. Untuk perangkat ajar terbaru, tempel CP dari Keputusan Kepala BKPDM No. 020 Tahun 2026 dan periksa sumbernya.";
  if(!curriculumCp(mapelId,fase)) return "CP "+fase+" tidak tersedia untuk mapel ini dalam lampiran 046/H/KR/2025. Pilih fase yang tersedia atau tempel acuan sekolah yang telah diverifikasi.";
  return "Teks dari lampiran 046/H/KR/2025. Pilih kelas untuk memastikan fase; telaah sumber sebelum dipakai.";
}
function curriculumControls(prefix){
  const fase=faseForClassId(activeClassId);
  const classSelect=aiKelasSelect(prefix+'_kelas').replace('<select ',`<select onchange="refreshCurriculumCp('${prefix}')" `);
  return `<div class="form-grid"><div class="field"><label for="${prefix}_mapel">Mata Pelajaran</label><select id="${prefix}_mapel" onchange="refreshCurriculumCp('${prefix}')">${curriculumMapelOptions()}</select></div><div class="field"><label for="${prefix}_kelas">Kelas · Fase otomatis</label>${classSelect}</div></div>
    <div class="field"><label for="${prefix}_cp">Capaian Pembelajaran · dapat diisi manual</label><textarea rows="9" id="${prefix}_cp">${escapeHtml(curriculumCp('matematika',fase))}</textarea><p class="hint" id="${prefix}_note">${escapeHtml(curriculumPhaseNote('matematika',fase))}</p><button class="btn btn-sm" onclick="refreshCurriculumCp('${prefix}')">${ic('refresh',15)} Muat ulang CP lampiran</button></div>`;
}
function refreshCurriculumCp(prefix){
  const mapel=document.getElementById(prefix+'_mapel').value;
  const phase=faseForClassId(document.getElementById(prefix+'_kelas').value);
  const field=document.getElementById(prefix+'_cp');
  field.value=CP_RELIGION_IDS.has(mapel)?'':curriculumCp(mapel,phase);
  document.getElementById(prefix+'_note').textContent=curriculumPhaseNote(mapel,phase);
  field.dataset.fase=phase;
}
function bindCurriculumControls(prefix){ /* Class onchange is bound in the markup before the first interaction. */ }

PAGES.cpReferensi=function(){
  const phase=faseForClassId(activeClassId);
  setTimeout(()=>renderCpReference(),0);
  return `<div class="section-head"><div><h1>Referensi CP</h1><div class="desc">Baca teks acuan sesuai mapel dan fase sebelum menyusun perangkat pembelajaran.</div></div></div><div class="card"><div class="form-grid"><div class="field"><label for="ref_mapel">Mata Pelajaran</label><select id="ref_mapel" onchange="renderCpReference()">${curriculumMapelOptions()}</select></div><div class="field"><label for="ref_fase">Fase</label><select id="ref_fase" onchange="renderCpReference()">${['A','B','C'].map((f,i)=>`<option ${f===phase?'selected':''} value="${f}">Fase ${f} · Kelas ${i*2+1}–${i*2+2}</option>`).join('')}</select></div></div><div id="cpReferenceBody"></div><p class="hint">Sumber data: lampiran cp-data.js dari handoff. Batas akhir IPAS Fase C telah dibersihkan dari bab IPA berikutnya. Pembandingan penuh kata demi kata dengan PDF primer masih perlu verifikasi.</p><a class="btn" href="${CP_UPDATE_SOURCE}" target="_blank" rel="noopener noreferrer">Informasi pembaruan CP Agama 2026 ↗</a></div>`;
};
function renderCpReference(){
  if(!document.getElementById('ref_mapel')||!document.getElementById('ref_fase')||!document.getElementById('cpReferenceBody')) return;
  const mapel=document.getElementById('ref_mapel').value,phase=document.getElementById('ref_fase').value;
  const text=curriculumCp(mapel,phase);
  document.getElementById('cpReferenceBody').innerHTML=`<p class="hint">${escapeHtml(curriculumPhaseNote(mapel,phase))}</p>${text?`<div class="cp-reference-text">${escapeHtml(text)}</div>`:`<div class="empty-state"><p>Tidak ada teks CP pada kombinasi mapel dan fase ini.</p></div>`}`;
}

PAGES.aiAnalisisCP=function(){bindCurriculumControls('acp');return `<div class="section-head"><div><h1>Analisis CP → TP</h1><div class="desc">Turunkan TP format ABCD, KKTP, dan asesmen dari CP. Alokasi JP mengikuti input guru.</div></div></div><div class="ai-layout"><div class="card">${curriculumControls('acp')}<div class="form-grid"><div class="field"><label for="acp_jumlah">Jumlah TP</label><input id="acp_jumlah" type="number" min="1" max="40" value="16"></div><div class="field"><label for="acp_total">Total JP per Tahun</label><input id="acp_total" type="number" min="1" max="2000" placeholder="Isi sesuai alokasi sekolah"></div><div class="field"><label for="acp_minggu">JP per Minggu</label><input id="acp_minggu" type="number" min="1" max="40" placeholder="Contoh: 6"></div><div class="field"><label for="acp_pertemuan">JP per Pertemuan</label><input id="acp_pertemuan" type="number" min="1" max="12" placeholder="Contoh: 3"></div></div><p class="hint">Pemetaan untuk satu tahun (2 semester). Rumus: total JP ÷ JP per pertemuan. Sisa JP harus dijelaskan jika pembagian tidak bulat.</p><button class="btn btn-primary" onclick="generateCurriculumAnalysis()">${ic('star',17)} Buat draf analisis</button></div><div id="acp_result" aria-live="polite">${curriculumDraftNote()}</div></div>`;};
PAGES.aiTelaahCP=function(){bindCurriculumControls('tcp');return `<div class="section-head"><div><h1>Telaah CP–ATP</h1><div class="desc">Periksa keterlacakan, cakupan kompetensi, dan urutan tujuan pembelajaran.</div></div></div><div class="ai-layout"><div class="card">${curriculumControls('tcp')}<div class="field"><label for="tcp_tp">Daftar TP/ATP yang Ditelaah</label><textarea id="tcp_tp" rows="8" placeholder="Satu TP per baris, boleh diawali nomor."></textarea></div><div class="field"><label for="tcp_materi">Lingkup Materi</label><input id="tcp_materi" placeholder="Contoh: bilangan cacah sampai 100"></div><div class="field"><label for="tcp_semester">Semester</label>${aiSemesterSelect('tcp_semester')}</div><button class="btn btn-primary" onclick="generateCurriculumReview()">${ic('star',17)} Telaah draf ATP</button></div><div id="tcp_result" aria-live="polite">${curriculumDraftNote()}</div></div>`;};
function curriculumDraftNote(){return `<div class="card empty-state">${illus('dokumen',120)}<p>Hasil akan tampil di sini.<br>CP → TP → ATP → materi → pembelajaran → asesmen.<br>Guru wajib menelaah setiap hasil AI.</p></div>`;}
function curriculumValues(prefix){
  const kelasId=document.getElementById(prefix+'_kelas').value;
  const mapelId=document.getElementById(prefix+'_mapel').value;
  const cp=document.getElementById(prefix+'_cp').value.trim();
  if(!cp){toast('Isi CP yang sesuai fase dan sumbernya terlebih dahulu.');return null;}
  return {kelas:classInfo(kelasId).label,fase:faseForClassId(kelasId),mapel:CP_DATA.mapel.find(m=>m.id===mapelId).nama,cp};
}
function buildCurriculumPrompt(kind,v){
  const context=`Mapel: ${v.mapel}; ${v.kelas}; Fase ${v.fase}.\nCP acuan (salin apa adanya, jangan mengubah makna):\n${v.cp}\n`;
  const rules='Ikuti CP → TP → ATP → materi → pembelajaran → asesmen. Jangan mengarang regulasi, data, atau CP. Tandai [perlu verifikasi] bila bukti tidak tersedia. CP non-Agama mengacu 046/H/KR/2025; CP Agama mengacu BKPDM 020/2026. Hasil adalah draf yang ditelaah guru. Gunakan istilah Murid.\n';
  if(kind==='analysis')return rules+context+`Susun ${v.jumlah} TP untuk satu tahun (semester 1 dan 2) dalam kelas ini. Bedah KKO dan konten CP; susun berjenjang tanpa menambah tuntutan di luar fase. ABCD mencakup Audience (Murid), Behavior (KKO + konten), Condition (kondisi pelaksanaan), Degree (kualitas di akhir kalimat). Jangan menyamakan condition dengan konten.\nAlokasi yang diberikan guru: ${v.total} JP/tahun, ${v.minggu} JP/minggu, ${v.pertemuan} JP/pertemuan. Hitungan: ${v.total/v.minggu} pekan alokasi; ${Math.floor(v.total/v.pertemuan)} pertemuan penuh + ${v.total%v.pertemuan} JP sisa. Jumlah JP semua TP harus tepat ${v.total}; jelaskan sisa dan uji realistisnya.\nTabel HTML: Kode TP | Kelas | Semester | Unit/Topik | Konsep Integrasi | Rumusan TP (ABCD) | Asesmen Formatif | Asesmen Sumatif | KKTP | Alokasi JP & Pertemuan | Validasi Kelayakan. KKTP deskriptif sebagai usulan sekolah; formatif untuk umpan balik, sumatif untuk nilai rapor. Akhiri dengan audit keterlacakan dan jumlah JP.`;
  return rules+context+`Semester: ${v.semester}. Lingkup materi: ${v.materi||'[perlu verifikasi]'}.\nDaftar TP/ATP:\n${v.tp}\nTabel telaah HTML satu baris per TP: No | Elemen | No CP | CP | Lingkup Materi | No ATP | TP | Smt | Alur. Status Alur: Tertelusur / Perlu Revisi / Tidak Tertelusur. Sebutkan nomor TP yang tidak tertelusur, duplikatif, urutan prasyarat yang janggal, tuntutan di luar CP, dan kompetensi CP yang terlewat. Beri rumusan TP pengganti ABCD lengkap (kondisi dan kualitas di akhir). Kesimpulan: layak pakai / layak dengan revisi / perlu susun ulang dengan alasan spesifik. Nomor CP yang tidak ada dalam sumber ditandai [perlu verifikasi].`;
}
function generateCurriculumAnalysis(){
  const v=curriculumValues('acp');if(!v)return;
  for(const [key,id] of [['jumlah','acp_jumlah'],['total','acp_total'],['minggu','acp_minggu'],['pertemuan','acp_pertemuan']]){
    const el=document.getElementById(id);v[key]=Number(el.value);
    if(!el.value||!Number.isInteger(v[key])||!el.checkValidity()){toast('Isi '+el.labels[0].textContent+' dengan angka yang valid.');el.focus();return;}
  }
  if(v.total/v.minggu>53||v.pertemuan>v.total){toast('Alokasi JP tidak realistis. Periksa total JP, JP/minggu, dan JP/pertemuan.');return;}
  aiRunGenerate('acp_result',{type:'Analisis CP → TP',title:'Analisis CP–TP · '+v.mapel+' · '+v.kelas,userPrompt:buildCurriculumPrompt('analysis',v)});
}
function generateCurriculumReview(){
  const v=curriculumValues('tcp');if(!v)return;v.tp=document.getElementById('tcp_tp').value.trim();
  if(!v.tp){toast('Isi daftar TP/ATP yang akan ditelaah.');return;}
  v.materi=document.getElementById('tcp_materi').value.trim();v.semester=document.getElementById('tcp_semester').value;
  aiRunGenerate('tcp_result',{type:'Telaah CP–ATP',title:'Telaah CP–ATP · '+v.mapel+' · '+v.kelas,userPrompt:buildCurriculumPrompt('review',v)});
}

NAV.find(g=>g.group==='Kurikulum').items.push({id:'cpReferensi',label:'Referensi CP per Fase',icon:'book'});
NAV.find(g=>g.group==='AI Teacher Suite Pro').items.push({id:'aiAnalisisCP',label:'AI: Analisis CP → TP',icon:'target'},{id:'aiTelaahCP',label:'AI: Telaah CP–ATP',icon:'check2'});
AI_WORKFLOWS[0].items.push({id:'aiAnalisisCP',label:'Analisis CP → TP',desc:'ABCD, KKTP, asesmen & alokasi JP',icon:'target'},{id:'aiTelaahCP',label:'Telaah CP–ATP',desc:'Periksa keterlacakan & mutu ATP',icon:'check2'});
/* Existing hub-only generators also need correct page titles and search entries. */
AI_WORKFLOWS.flatMap(w=>w.items).forEach(item=>{const group=NAV.find(g=>g.group==='AI Teacher Suite Pro');if(!group.items.some(it=>it.id===item.id))group.items.push({id:item.id,label:'AI: '+item.label,icon:item.icon});});
