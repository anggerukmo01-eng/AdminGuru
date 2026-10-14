/* ================================================================
   FILE: assets/js/80-ai.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   AI TEACHER SUITE PRO INDONESIA
   AI Service + AI Settings + AI Generators (Modul Ajar, ATP, LKPD)
   + AI Dashboard + AI History
   Tidak mengubah/menghapus fitur lama. localStorage aman (key baru).
   ============================================================ */

/* ---------- 1. STORAGE: AI SETTINGS & HISTORY ---------- */
const AI_SET_KEY = "tpsd2026_ai_settings_v1";
const AI_HIST_KEY = "tpsd2026_ai_history_v1";

function defaultAiSettings(){
  return {
    apiKey:"",
    baseUrl:"https://openrouter.ai/api/v1/chat/completions",
    model:"openai/gpt-5",
    temperature:0.7,
    topP:1,
    maxTokens:8000,
    presencePenalty:0,
    frequencyPenalty:0,
    streaming:true,
    autoWord:true,
    timeoutSec:120,
    retry:2,
    systemPrompt:"Anda adalah asisten AI ahli Kurikulum Merdeka dan Pembelajaran Mendalam untuk guru Sekolah Dasar di Indonesia. Tugas Anda: menyusun dokumen administrasi pembelajaran yang formal, akurat, terstruktur, dan siap pakai.\n\nSTANDAR WAJIB:\n1. Regulasi acuan (jangan mengarang nomor/isi regulasi): Permendikbudristek No. 21/2022 (Standar Penilaian), Panduan Pembelajaran dan Asesmen Edisi Revisi 2025, Kep. Kepala BSKAP No. 046/H/KR/2025 (Capaian Pembelajaran; khusus PAI & Budi Pekerti: Kep. Kepala BKPDM No. 020/2026), Permendikbudristek No. 12/2024 jo. Permendikdasmen No. 13/2025 (kurikulum). Gunakan CP/TP yang diberikan guru; jangan mengubah maknanya, hanya rapikan bahasanya.\n2. Prinsip asesmen: asesmen formatif untuk umpan balik dan bahan deskripsi capaian (tidak menentukan nilai rapor); nilai rapor hanya diolah dari asesmen sumatif; KKTP sebagai acuan ketercapaian tiap TP.\n3. Kaidah penulisan soal: sesuai indikator/TP; tepat satu kunci jawaban; pengecoh homogen, logis, dan berfungsi; pokok soal jelas dan tegas; tidak memberi petunjuk ke jawaban benar; hindari pernyataan negatif ganda; panjang opsi relatif sama; tanpa opsi 'semua benar/salah'; opsi angka diurutkan kecil ke besar; soal tidak bergantung pada jawaban soal lain; bahasa Indonesia komunikatif sesuai jenjang; tanpa bahasa daerah/tabu; jumlah opsi pilihan ganda: kelas 1 = 3 opsi (a, b, c), kelas 2 ke atas = 4 opsi (a, b, c, d).\n4. Fase A (kelas 1-2): bahasa sederhana dan konkret, kontekstual dengan dunia anak, sertakan deskripsi ilustrasi [Ilustrasi: ...] pada soal yang terbantu gambar, sebaran level kognitif dominan C1-C3 dengan HOTS (C4-C6) proporsional.\n5. Pembelajaran Mendalam: kegiatan menerapkan prinsip berkesadaran (mindful), bermakna (meaningful), dan menggembirakan (joyful); kembangkan 8 dimensi Profil Lulusan (keimanan dan ketakwaan, kewargaan, penalaran kritis, kreativitas, kolaborasi, kemandirian, kesehatan, komunikasi).\n\nKELENGKAPAN HASIL (WAJIB):\n6. Selesaikan SEMUA bagian yang diminta dalam satu respons — jangan memotong, jangan menulis 'bersambung', '[dilanjutkan]', atau 'dst.'.\n7. Dahulukan kelengkapan struktur: bila perlu, ringkas kalimat yang bertele-tele tetapi pertahankan semua bagian, tabel, dan butir yang diminta.\n8. Untuk naskah soal/asesmen: JANGAN membuat kop (kop ditambahkan otomatis oleh sistem); mulai dari blok identitas naskah sesuai instruksi.\n\nFORMAT OUTPUT: SELALU Bahasa Indonesia formal. HANYA HTML valid (tag h2,h3,h4,p,ul,ol,li,table,thead,tbody,tr,td,th,strong,em). JANGAN gunakan markdown (**, #, |). JANGAN sertakan tag html/head/body — cukup potongan HTML dokumen. Jangan menambahkan kalimat pembuka/penutup atau komentar di luar isi dokumen.\n\n[SP-V3]"
  };
}
function loadAiSettings(){
  let s = null;
  try{ const raw = localStorage.getItem(AI_SET_KEY); if(raw) s = Object.assign(defaultAiSettings(), JSON.parse(raw)); }catch(e){}
  if(!s) s = defaultAiSettings();
  // Migrasi system prompt -> V3 (BKPDM 020/2026 + opsi PG kelas 1 = a-c):
  // HANYA prompt bawaan (berpenanda [SP-V2] atau kalimat khas default lama)
  // yang belum berpenanda [SP-V3] yang dimutakhirkan. Prompt kustom pengguna
  // (tanpa penanda bawaan) tidak diubah.
  // Catatan: migrasi lama yang menghapus prompt ber-"020/2026" DIHAPUS —
  // Kep. Kepala BKPDM 020/2026 sudah TERVERIFIKASI ada (13 Okt 2026).
  let needSave = false;
  if(s.systemPrompt && s.systemPrompt.indexOf("[SP-V3]")<0
    && (s.systemPrompt.indexOf("[SP-V2]")>=0
        || s.systemPrompt.indexOf("JANGAN menambahkan kalimat pembuka/penutup")>=0)){
    s.systemPrompt = defaultAiSettings().systemPrompt;
    needSave = true;
  }
  // Migrasi Okt 2026: naikkan batas default lama agar dokumen panjang (bank soal,
  // modul ajar) tidak terpotong. Hanya yang masih bernilai default lama.
  if(s.maxTokens===4000){ s.maxTokens = 8000; needSave = true; }
  if(s.timeoutSec===60){ s.timeoutSec = 120; needSave = true; }
  // (Migrasi V1 -> V2 lama sudah digantikan migrasi -> V3 di atas.)
  if(needSave){ try{ localStorage.setItem(AI_SET_KEY, JSON.stringify(s)); }catch(e){} }
  return s;
}
function saveAiSettings(){ localStorage.setItem(AI_SET_KEY, JSON.stringify(aiSettings)); }
let aiSettings = loadAiSettings();

function loadAiHistory(){
  try{ const raw = localStorage.getItem(AI_HIST_KEY); if(raw) return JSON.parse(raw); }catch(e){}
  return [];
}
function saveAiHistory(list){ localStorage.setItem(AI_HIST_KEY, JSON.stringify(list)); }
function addAiHistory(item){
  const list = loadAiHistory();
  list.unshift(item);
  saveAiHistory(list);
}

const AI_MODELS = [
  {group:"Anthropic (Claude)", opts:["anthropic/claude-sonnet-4.5","anthropic/claude-opus-4.1","anthropic/claude-3.5-haiku"]},
  {group:"OpenAI (GPT)", opts:["openai/gpt-5","openai/gpt-5-mini","openai/gpt-4o","openai/gpt-4o-mini"]},
  {group:"Google (Gemini)", opts:["google/gemini-2.5-pro","google/gemini-2.5-flash"]},
  {group:"DeepSeek", opts:["deepseek/deepseek-chat","deepseek/deepseek-r1"]},
  {group:"Qwen", opts:["qwen/qwen-2.5-72b-instruct","qwen/qwen-max"]},
  {group:"Mistral", opts:["mistralai/mistral-large","mistralai/mistral-small"]},
  {group:"Meta (Llama)", opts:["meta-llama/llama-3.3-70b-instruct"]},
];

function aiEstimateTokens(text){ return Math.max(1, Math.ceil((text||"").length/4)); }
function aiEstimateCost(promptTok, completionTok){
  // estimasi kasar generik (USD per 1K token) - hanya perkiraan, bukan tagihan resmi OpenRouter
  const rate = 0.005;
  return ((promptTok+completionTok)/1000*rate);
}

/* ---------- 2. AI SERVICE (OpenRouter) ---------- */
async function openRouterChat(messages, opts){
  opts=opts||{};
  if(!aiSettings.apiKey) throw new Error('API Key belum diisi. Buka menu AI Settings terlebih dahulu.');
  let endpoint;
  try{ endpoint=new URL(aiSettings.baseUrl); }catch(e){ throw new Error('Alamat layanan AI tidak valid.'); }
  if(endpoint.protocol!=='https:') throw new Error('Layanan AI harus memakai HTTPS untuk melindungi API Key.');
  const body={model:aiSettings.model,messages,temperature:Number(aiSettings.temperature),top_p:Number(aiSettings.topP),max_tokens:Number(aiSettings.maxTokens),presence_penalty:Number(aiSettings.presencePenalty),frequency_penalty:Number(aiSettings.frequencyPenalty),stream:!!aiSettings.streaming};
  let lastError;
  const maxAttempt=Math.max(1,Math.min(3,Number(aiSettings.retry)||1));
  for(let attempt=1;attempt<=maxAttempt;attempt++){
    const controller=new AbortController();
    const abort=()=>controller.abort();
    if(opts.signal){ if(opts.signal.aborted) throw new DOMException('Dibatalkan','AbortError'); opts.signal.addEventListener('abort',abort,{once:true}); }
    let timedOut=false, received=false, retryable=true;
    const timer=setTimeout(()=>{timedOut=true; controller.abort();},(Number(aiSettings.timeoutSec)||120)*1000);
    try{
      const res=await fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+aiSettings.apiKey,'HTTP-Referer':location.origin,'X-Title':'AdminGuru'},body:JSON.stringify(body),signal:controller.signal});
      if(!res.ok){
        retryable=res.status===429||res.status>=500;
        let detail=''; try{const json=await res.json();detail=json.error&&json.error.message||'';}catch(e){}
        if(res.status===401||res.status===403) throw new Error('API Key tidak valid atau tidak memiliki akses. ('+res.status+')');
        if(res.status===402) throw new Error('Kuota/saldo layanan AI habis.');
        if(res.status===429) throw new Error('Batas penggunaan tercapai. Coba lagi beberapa saat lagi.');
        throw new Error('Permintaan AI gagal ('+res.status+'): '+detail);
      }
      let full='', finishReason=null, usage=null;
      if(aiSettings.streaming && res.body && /text\/event-stream/i.test(res.headers.get('content-type')||'')){
        const reader=res.body.getReader(), decoder=new TextDecoder(); let buffer='', ended=false;
        function parseLine(line){
          const value=line.trim(); if(!value.startsWith('data:')) return;
          const payload=value.slice(5).trim(); if(payload==='[DONE]'){ended=true;return;}
          let json; try{json=JSON.parse(payload);}catch(e){return;}
          if(json.error){retryable=false;throw new Error(json.error.message||'Layanan AI mengembalikan kesalahan saat streaming.');}
          if(json.usage) usage=json.usage;
          const choice=json.choices&&json.choices[0]; if(!choice) return;
          if(choice.finish_reason) finishReason=choice.finish_reason;
          const delta=choice.delta&&choice.delta.content;
          if(delta){received=true;full+=delta;if(opts.onDelta) opts.onDelta(full,delta);}
        }
        try{
          while(!ended){
            const chunk=await reader.read();
            buffer+=chunk.done?decoder.decode():decoder.decode(chunk.value,{stream:true});
            const lines=buffer.split('\n'); buffer=lines.pop();
            for(const line of lines){parseLine(line);if(ended)break;}
            if(chunk.done){if(buffer.trim())parseLine(buffer);break;}
          }
        }finally{try{await reader.cancel();}catch(e){} reader.releaseLock();}
      }else{
        const json=await res.json();
        if(json.error){retryable=false;throw new Error(json.error.message||'Layanan AI gagal.');}
        const choice=json.choices&&json.choices[0]; full=choice&&choice.message&&choice.message.content||'';
        finishReason=choice&&choice.finish_reason; usage=json.usage;
        received=!!full; if(opts.onDelta&&full) opts.onDelta(full,full);
      }
      if(!full.trim()){retryable=false;throw new Error('AI tidak mengembalikan isi dokumen. Coba prompt atau model lain.');}
      return {text:full,finishReason,usage:usage||{prompt_tokens:aiEstimateTokens(JSON.stringify(messages)),completion_tokens:aiEstimateTokens(full)}};
    }catch(error){
      if(opts.signal&&opts.signal.aborted) throw new DOMException('Dibatalkan','AbortError');
      lastError=timedOut?new Error('Waktu tunggu habis setelah '+aiSettings.timeoutSec+' detik.'):error;
      if(!retryable||received||timedOut||attempt===maxAttempt) throw lastError;
    }finally{
      clearTimeout(timer); if(opts.signal) opts.signal.removeEventListener('abort',abort);
    }
    await new Promise(resolve=>setTimeout(resolve,900*attempt));
  }
  throw lastError;
}

async function aiTestConnection(){
  if(aiSaveSettingsFromForm()===false) return;
  const btn = document.getElementById("aiTestBtn");
  const out = document.getElementById("aiTestResult");
  if(btn){ btn.disabled = true; btn.innerHTML = '<span class="ai-spin"></span>Menguji...'; }
  if(out) out.innerHTML = "";
  try{
    const r = await openRouterChat([
      {role:"system", content:"Balas HANYA dengan kata: OK"},
      {role:"user", content:"Tes koneksi"}
    ], {});
    if(out) out.innerHTML = '<span class="badge badge-green">Berhasil terhubung</span> <span class="hint">Model aktif: '+escapeHtml(aiSettings.model)+' &middot; Respons: '+escapeHtml((r.text||"").slice(0,60))+'</span>';
    toast("Koneksi AI berhasil!");
  }catch(e){
    if(out) out.innerHTML = '<span class="badge badge-red">Gagal</span> <span class="hint">'+escapeHtml(e.message)+'</span>';
    toast("Koneksi AI gagal: "+e.message);
  }finally{
    if(btn){ btn.disabled = false; btn.innerHTML = ic("check",15)+" Test Connection"; }
  }
}

/* ---------- 3. PAGE: AI SETTINGS ---------- */
PAGES.aiSettings = function(){
  const s = aiSettings;
  const modelOptionsHtml = AI_MODELS.map(g=>
    `<optgroup label="${escapeHtml(g.group)}">${g.opts.map(o=>`<option value="${o}" ${o===s.model?"selected":""}>${o}</option>`).join("")}</optgroup>`
  ).join("");
  return `
  <div class="card" style="max-width:820px;">
    <h3>${ic("settings",18)} Pengaturan AI (OpenRouter)</h3>
    <p class="hint" style="margin-bottom:16px;">API Key disimpan di perangkat ini. Saat generator dipakai, prompt dan API Key dikirim ke endpoint AI yang Anda pilih. Jangan sertakan identitas pribadi murid yang tidak diperlukan.</p>

    <div class="field"><label>API Key OpenRouter</label>
      <input type="password" id="ai_apiKey" value="${escapeHtml(s.apiKey)}" placeholder="sk-or-v1-..."></div>

    <div class="field"><label>Base URL Endpoint</label>
      <input type="text" id="ai_baseUrl" value="${escapeHtml(s.baseUrl)}"></div>

    <div class="field"><label>Model</label>
      <select id="ai_model">${modelOptionsHtml}</select>
      <div class="hint">Bisa juga isi manual nama model OpenRouter lain di bawah ini:</div>
      <input type="text" id="ai_modelCustom" value="${AI_MODELS.some(g=>g.opts.includes(s.model))?'':escapeHtml(s.model)}" placeholder="mis. mistralai/mistral-large" style="margin-top:6px;"></div>

    <div class="grid grid-2">
      <div class="field"><label>Temperature (${s.temperature})</label>
        <div class="ai-range-row"><input type="range" id="ai_temperature" min="0" max="2" step="0.1" value="${s.temperature}" oninput="document.getElementById('ai_temperature_val').textContent=this.value"><span class="val" id="ai_temperature_val">${s.temperature}</span></div></div>
      <div class="field"><label>Top P (${s.topP})</label>
        <div class="ai-range-row"><input type="range" id="ai_topP" min="0" max="1" step="0.05" value="${s.topP}" oninput="document.getElementById('ai_topP_val').textContent=this.value"><span class="val" id="ai_topP_val">${s.topP}</span></div></div>
      <div class="field"><label>Max Tokens</label><input type="number" id="ai_maxTokens" value="${s.maxTokens}" min="256" max="32000">
        <div class="hint">Disarankan 8000 agar dokumen panjang (bank soal, modul ajar) tidak terpotong.</div></div>
      <div class="field"><label>Presence Penalty</label><input type="number" step="0.1" id="ai_presencePenalty" value="${s.presencePenalty}" min="-2" max="2"></div>
      <div class="field"><label>Frequency Penalty</label><input type="number" step="0.1" id="ai_frequencyPenalty" value="${s.frequencyPenalty}" min="-2" max="2"></div>
      <div class="field"><label>Timeout (detik)</label><input type="number" id="ai_timeoutSec" value="${s.timeoutSec}" min="10" max="300">
        <div class="hint">Disarankan 120 detik untuk dokumen panjang.</div></div>
      <div class="field"><label>Maksimum Percobaan</label><input type="number" id="ai_retry" value="${s.retry}" min="1" max="3"></div>
      <div class="field"><label>Streaming</label>
        <select id="ai_streaming"><option value="1" ${s.streaming?"selected":""}>Aktif (ON)</option><option value="0" ${!s.streaming?"selected":""}>Nonaktif (OFF)</option></select></div>
      <div class="field"><label>Word otomatis</label>
        <select id="ai_autoWord"><option value="1" ${s.autoWord?"selected":""}>Aktif — unduh Word otomatis setelah generate</option><option value="0" ${!s.autoWord?"selected":""}>Nonaktif</option></select></div>
    </div>

    <div class="field"><label>System Prompt (Peran AI)</label>
      <textarea id="ai_systemPrompt" style="min-height:140px;">${escapeHtml(s.systemPrompt)}</textarea></div>

    <div class="ai-toolbar">
      <button class="btn btn-primary" onclick="aiSaveSettingsFromForm()">${ic("check",15)} Simpan Pengaturan</button>
      <button class="btn" id="aiTestBtn" onclick="aiTestConnection()">${ic("check",15)} Test Connection</button>
    </div>
    <div id="aiTestResult" style="margin-top:10px;"></div>
  </div>`;
};
function aiSaveSettingsFromForm(){
  for(const id of ['ai_maxTokens','ai_timeoutSec','ai_retry','ai_presencePenalty','ai_frequencyPenalty']){const el=document.getElementById(id);if(!el.value || !el.checkValidity()){toast('Periksa nilai pengaturan AI.');el.focus();return false;}}
  try{if(new URL(document.getElementById('ai_baseUrl').value.trim()||defaultAiSettings().baseUrl).protocol!=='https:') throw new Error();}catch(e){toast('Endpoint AI harus berupa alamat HTTPS yang valid.');return false;}
  const custom = document.getElementById("ai_modelCustom").value.trim();
  aiSettings = {
    apiKey: document.getElementById("ai_apiKey").value.trim(),
    baseUrl: document.getElementById("ai_baseUrl").value.trim() || defaultAiSettings().baseUrl,
    model: custom || document.getElementById("ai_model").value,
    temperature: parseFloat(document.getElementById("ai_temperature").value),
    topP: parseFloat(document.getElementById("ai_topP").value),
    maxTokens: parseInt(document.getElementById("ai_maxTokens").value,10),
    presencePenalty: parseFloat(document.getElementById("ai_presencePenalty").value),
    frequencyPenalty: parseFloat(document.getElementById("ai_frequencyPenalty").value),
    streaming: document.getElementById("ai_streaming").value==="1",
    autoWord: document.getElementById("ai_autoWord").value==="1",
    timeoutSec: parseInt(document.getElementById("ai_timeoutSec").value,10),
    retry: parseInt(document.getElementById("ai_retry").value,10),
    systemPrompt: document.getElementById("ai_systemPrompt").value
  };
  saveAiSettings();
  toast("Pengaturan AI tersimpan.");
  return true;
}

/* ---------- 4. PAGE: PUSAT AI GURU (hub alur kerja) ---------- */
const AI_WORKFLOWS = [
  {judul:"Perencanaan Pembelajaran", icon:"clipboard", grad:["#3e63f2","#7048e8"], desc:"Siapkan perangkat sebelum mengajar — terhubung dengan data CP/TP aplikasi.", items:[
    {id:"aiModul", label:"Modul Ajar", desc:"Modul Ajar lengkap siap pakai", icon:"clipboard"},
    {id:"aiTP", label:"TP", desc:"Tujuan Pembelajaran dari CP", icon:"target"},
    {id:"aiATP", label:"ATP", desc:"Alur TP per semester", icon:"layers"},
    {id:"aiProta", label:"Prota", desc:"Program Tahunan — kalender otomatis", icon:"calendar"},
    {id:"aiPromes", label:"Promes", desc:"Program Semester — kalender otomatis", icon:"calendar"},
    {id:"aiAlokasi", label:"Alokasi Waktu", desc:"Bagi JP per bab — total harus pas", icon:"clock"},
    {id:"aiLKPD", label:"LKPD", desc:"Lembar kerja peserta didik", icon:"edit"},
    {id:"aiBahanAjar", label:"Bahan Ajar", desc:"Ringkasan, cerita, pengayaan", icon:"book"},
  ]},
  {judul:"Penilaian & Tindak Lanjut", icon:"target", grad:["#0ca678","#1098ad"], desc:"Soal, rubrik, dan tindak lanjut hasil belajar.", items:[
    {id:"aiBankSoal", label:"Bank Soal", desc:"UH / STS / SAS + kisi, kunci, skor", icon:"doc"},
    {id:"aiAsesForm", label:"Asesmen Formatif", desc:"Kuis & instrumen umpan balik", icon:"check2"},
    {id:"aiRubrik", label:"Rubrik Penilaian", desc:"Rubrik sikap, unjuk kerja, produk", icon:"star"},
    {id:"aiKktp", label:"KKTP", desc:"Usulan kriteria ketuntasan TP", icon:"target"},
    {id:"aiPengRem", label:"Pengayaan & Remedial", desc:"RTL dari hasil Analisis Nilai", icon:"heart"},
  ]},
  {judul:"Administrasi Harian & Wali Kelas", icon:"clock", grad:["#e8890c","#e64980"], desc:"Jurnal mengajar dan surat menyurat.", items:[
    {id:"aiJurnal", label:"Jurnal Mengajar", desc:"Jurnal harian dari rencana minggu ini", icon:"book"},
    {id:"aiRefleksi", label:"Refleksi Pembelajaran", desc:"Refleksi format standar", icon:"pen"},
    {id:"aiSuratOrtu", label:"Surat Orang Tua", desc:"Undangan, pemberitahuan, pemanggilan", icon:"pen"},
  ]},
];
PAGES.aiDashboard = function(){
  const hist = loadAiHistory();
  const totalDoc = (db.aiDocs||[]).length;
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const genMonth = hist.filter(h=>{ try{ return new Date(h.createdAt)>=monthStart; }catch(e){ return false; } }).length;
  const last = hist[0];
  const apiOk = !!(aiSettings.apiKey && String(aiSettings.apiKey).trim());
  const wfHtml = AI_WORKFLOWS.map(w=>`
    <div class="card" style="margin-bottom:16px;">
      <h3 style="font-size:14px;margin-bottom:4px;display:flex;align-items:center;gap:8px;"><span class="ai-chip" style="background:linear-gradient(135deg,${w.grad[0]},${w.grad[1]});">${ic(w.icon,15)}</span> ${w.judul}</h3>
      <p class="hint" style="margin:0 0 10px;">${w.desc}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;">
        ${w.items.map(it=>`
          <button class="btn ai-tool-btn" style="justify-content:flex-start;height:auto;padding:12px 14px;text-align:left;" onclick="navigate('${it.id}')">
            <span class="ai-chip" style="background:linear-gradient(135deg,${w.grad[0]},${w.grad[1]});">${ic(it.icon||"star",16)}</span>
            <span><strong>${it.label}</strong><br><span class="hint" style="font-weight:400;">${it.desc}</span></span>
          </button>`).join("")}
      </div>
    </div>`).join("");
  return `
  <div class="section-head"><div><h1>Pusat AI Guru</h1><div class="desc">Asisten AI untuk mempercepat administrasi guru kelas. Hasil generate selalu wajib ditinjau guru sebelum dipakai.</div></div></div>
  ${apiOk?"":`<div class="card" style="margin-bottom:16px;border-left:4px solid var(--warn);"><strong>API Key belum diisi.</strong> <span class="hint">Generator membutuhkan API Key OpenRouter agar bisa berjalan.</span> <button class="btn btn-sm btn-primary" onclick="navigate('aiSettings')">Buka AI Settings</button></div>`}
  <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px;">
    <div class="stat-card"><div class="stat-num">${totalDoc}</div><div class="stat-label">Dokumen Tersimpan</div></div>
    <div class="stat-card"><div class="stat-num">${genMonth}</div><div class="stat-label">Generate Bulan Ini</div></div>
    <div class="stat-card"><div class="stat-num" style="font-size:15px;line-height:1.5;">${escapeHtml(String(aiSettings.model||"-").split("/").pop())}</div><div class="stat-label">Model Aktif</div></div>
  </div>
  ${wfHtml}
  <div class="card">
    <h3 style="font-size:14px;margin-bottom:10px;">${ic("archive",16)} Generate Terakhir</h3>
    ${last ? `<div class="ai-hist-item"><div><strong>${escapeHtml(last.title)}</strong><div class="meta">${escapeHtml(last.type)} &middot; ${new Date(last.createdAt).toLocaleString("id-ID")}</div></div>
      <button class="btn btn-sm" onclick="aiViewHistory('${last.id}')">${ic("book",14)} Lihat</button></div>
      <div style="margin-top:8px;"><button class="btn btn-sm" onclick="navigate('aiHistory')">Lihat Semua Riwayat</button></div>`
      : `<p class="hint">Belum ada riwayat generate. Mulai dari salah satu generator di atas.</p>`}
  </div>`;
};

/* ---------- 5. PAGE: AI HISTORY ---------- */
PAGES.aiHistory = function(){
  const hist = loadAiHistory();
  if(!hist.length) return `<div class="card"><div class="empty-state">${illus("dokumen",130)}<p>Belum ada dokumen AI yang dihasilkan.<br>Gunakan salah satu generator di <strong>Pusat AI Guru</strong>.</p></div></div>`;
  return `<div class="card">
    <h3>Riwayat Dokumen AI (${hist.length})</h3>
    <div id="aiHistList">${hist.map(h=>aiHistItemHtml(h)).join("")}</div>
  </div>`;
};
function aiHistItemHtml(h){
  return `<div class="ai-hist-item">
    <div><strong>${escapeHtml(h.title)}</strong><div class="meta">${escapeHtml(h.type)} &middot; ${escapeHtml(h.model||"")} &middot; ${new Date(h.createdAt).toLocaleString("id-ID")}</div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="btn btn-sm" onclick="aiViewHistory(${htmlJsArg(h.id)})">${ic("book",14)} Lihat</button>
      <button class="btn btn-sm" onclick="aiDuplicateAsNewDoc(${htmlJsArg(h.id)})">${ic("doc",14)} Duplikat</button>
      <button class="btn btn-sm btn-danger" onclick="aiDeleteHistory(${htmlJsArg(h.id)})">${ic("trash",14)} Hapus</button>
    </div></div>`;
}
function aiDeleteHistory(id){
  confirmDialog("Hapus dokumen AI ini dari riwayat?", ()=>{
    saveAiHistory(loadAiHistory().filter(h=>h.id!==id));
    toast("Dihapus."); renderPage(currentPage);
  });
}
function aiViewHistory(id){
  const h = loadAiHistory().find(x=>x.id===id);
  if(!h) return;
  openModal({
    title: h.title,
    bodyHtml: `<div class="ai-result-content" id="aiViewContent" data-finish-reason="${escapeHtml(h.finishReason||'')}" data-doc-type="${escapeHtml(h.type||'')}">${AIDocumentFormat.normalize(h.content)}</div>
      <div class="ai-toolbar" style="margin-top:14px;">
        <button class="btn" onclick="aiExportWordAuto(${htmlJsArg(h.type)},'aiViewContent',${htmlJsArg(h.title)})">${ic("download",15)} Word DOCX</button>
        <button class="btn" onclick="aiExportExcel(document.getElementById('aiViewContent').innerHTML,${htmlJsArg(h.title)})">${ic("download",15)} Export Excel</button>
        <button class="btn" onclick="aiExportPDF(document.getElementById('aiViewContent').innerHTML,${htmlJsArg(h.title)},${htmlJsArg(h.type)})">${ic("download",15)} Export PDF</button>
        <button class="btn" onclick="aiExportMarkdown(document.getElementById('aiViewContent'),${htmlJsArg(h.title)})">${ic("download",15)} Export Markdown</button>
        <button class="btn" onclick="aiCopyElement('aiViewContent')">${ic("doc",15)} Salin</button>
      </div>${AIGuruWord.settingsHtml('aiViewContent')}`,onMount:()=>AIGuruWord.applyPreview('aiViewContent')
  });
}
function aiDuplicateAsNewDoc(id){
  const h = loadAiHistory().find(x=>x.id===id);
  if(!h) return;
  db.aiDocs = db.aiDocs||[];
  db.aiDocs.unshift({id:uid("aidoc"), type:h.type, title:h.title+" (Duplikat)", content:AIDocumentFormat.normalize(h.content), finishReason:h.finishReason, createdAt:new Date().toISOString()});
  saveDB();
  toast("Disalin ke Dokumen Tersimpan.");
}

/* ---------- 6. HELPER: FORM ELEMENTS UNTUK GENERATOR ---------- */
function aiSemDefault(){ return String(db.sekolah.semester||"1").trim().charAt(0)==="2" ? "2" : "1"; }
function aiSemesterSelect(id){
  const d = aiSemDefault();
  return `<select id="${id}"><option value="1" ${d==="1"?"selected":""}>Semester 1 (Ganjil)</option><option value="2" ${d==="2"?"selected":""}>Semester 2 (Genap)</option></select>`;
}
function aiKelasSelect(id, selected){
  selected = selected || activeClassId;
  return `<select id="${id}">${CLASS_LIST.map(c=>`<option value="${c.id}" ${c.id===selected?"selected":""}>${c.label} (Fase ${faseForClassId(c.id)})</option>`).join("")}</select>`;
}
function aiMapelSelect(id, selected){
  return `<select id="${id}">${MAPEL_LIST.map(m=>`<option value="${escapeHtml(m)}" ${m===selected?"selected":""}>${escapeHtml(m)}</option>`).join("")}</select>`;
}
function aiCpListForKelasMapel(kelasId, mapel){
  const fase = faseForClassId(kelasId);
  const clsData = (kelasId===activeClassId) ? db : loadClassDB(kelasId);
  const list = (clsData.cp||cpSeedForFase(fase)).filter(c=>c.mapel===mapel);
  return list;
}
function aiElemenSelect(id, kelasId, mapel){
  const list = aiCpListForKelasMapel(kelasId, mapel);
  if(!list.length) return `<select id="${id}"><option value="">- Tidak ada data CP -</option></select>`;
  return `<select id="${id}">${list.map((c,i)=>`<option value="${i}">${escapeHtml(c.elemen)}</option>`).join("")}</select>`;
}
function aiRefreshElemen(kelasSelId, mapelSelId, elemenHolderId){
  const kelasId = document.getElementById(kelasSelId).value;
  const mapel = document.getElementById(mapelSelId).value;
  document.getElementById(elemenHolderId).innerHTML = aiElemenSelect(elemenHolderId+"_sel", kelasId, mapel);
}
/* Varian checkbox untuk memilih beberapa elemen CP sekaligus (dipakai ATP). */
function aiElemenCheckHtml(name, kelasId, mapel){
  const list = aiCpListForKelasMapel(kelasId, mapel);
  if(!list.length) return `<span class="hint">Tidak ada data CP untuk mapel ini — AI akan memakai CP standar fase.</span>`;
  return aiCheckGrid(name, list.map(c=>c.elemen), true);
}
function aiRefreshElemenCheck(kelasSelId, mapelSelId, holderId, name){
  const kelasId = document.getElementById(kelasSelId).value;
  const mapel = document.getElementById(mapelSelId).value;
  document.getElementById(holderId).innerHTML = aiElemenCheckHtml(name, kelasId, mapel);
}
/* Varian checkbox untuk memilih beberapa TP sekaligus (dipakai KKTP). */
function aiTpCheckHtml(name, kelasId, mapel){
  const list = aiAtpListForKelasMapel(kelasId, mapel);
  if(!list.length) return `<span class="hint">Belum ada TP dari ATP — tulis manual di bawah.</span>`;
  return `<div class="ai-checkgrid">${list.map((a,i)=>`<label><input type="checkbox" name="${name}" value="${i}" checked>${escapeHtml(a.tp.slice(0,80))}${a.tp.length>80?"...":""}</label>`).join("")}</div>`;
}
function aiRefreshTpCheck(kelasSelId, mapelSelId, holderId, name){
  const kelasId = document.getElementById(kelasSelId).value;
  const mapel = document.getElementById(mapelSelId).value;
  document.getElementById(holderId).innerHTML = aiTpCheckHtml(name, kelasId, mapel);
}
/* ---------- KALENDER: minggu efektif otomatis (Fase 2: Prota/Promes) ----------
   Aturan: pekan Senin–Jumat dihitung efektif bila memiliki >=3 hari efektif
   (hari Senin–Jumat dikurangi Libur Nasional dari db.kalender/SEED_KALENDER). */
function aiKalenderList(){
  if(db.kalender && db.kalender.length) return db.kalender;
  if(typeof SEED_KALENDER!=="undefined") return SEED_KALENDER;
  return [];
}
function aiKalenderCari(){
  const kata = Array.from(arguments).map(x=>String(x).toLowerCase());
  return aiKalenderList().find(e=>e.judul && kata.every(k=>e.judul.toLowerCase().indexOf(k)>=0));
}
function aiKalenderMingguEfektif(semester){
  const sem = String(semester);
  const mulaiE = sem==="2" ? aiKalenderCari("hari pertama masuk","semester 2") : aiKalenderCari("hari pertama masuk","t.a.");
  const selesaiE = aiKalenderCari("penyerahan rapor","semester "+sem);
  const mulai = mulaiE ? mulaiE.tanggal : (sem==="2"?"2027-01-04":"2026-07-13");
  const selesai = selesaiE ? selesaiE.tanggal : (sem==="2"?"2027-06-18":"2026-12-18");
  const libur = {};
  aiKalenderList().forEach(e=>{ if(e.jenis==="Libur Nasional" && e.tanggal) libur[e.tanggal]=1; });
  const d0 = new Date(mulai+"T00:00:00"), d1 = new Date(selesai+"T00:00:00");
  if(isNaN(d0)||isNaN(d1)||d1<d0) return {mulai, selesai, pekan:0, efektif:0, khusus:[]};
  const d = new Date(d0);
  while(d.getDay()!==1) d.setDate(d.getDate()-1); // mundur ke Senin
  let pekan=0, efektif=0;
  const iso = x=>x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");
  while(d<=d1){
    pekan++;
    let hariEf=0;
    for(let i=0;i<5;i++){
      const x=new Date(d); x.setDate(d.getDate()+i);
      if(x<d0||x>d1) continue;
      if(!libur[iso(x)]) hariEf++;
    }
    if(hariEf>=3) efektif++;
    d.setDate(d.getDate()+7);
  }
  const khusus = aiKalenderList().filter(e=>e.jenis==="Ujian/Asesmen").map(e=>({tanggal:e.tanggal, judul:e.judul}));
  return {mulai, selesai, pekan, efektif, khusus};
}
function aiKalenderInfoHtml(semester){
  const k = aiKalenderMingguEfektif(semester);
  if(!k.efektif) return `<span class="hint">Kalender kosong — isi manual.</span>`;
  const kh = k.khusus.length ? `<br>Minggu khusus terdeteksi: ${k.khusus.map(x=>escapeHtml(x.judul)+" ("+x.tanggal+")").join("; ")}` : "";
  return `<span class="hint">Otomatis dari kalender: ${fmtDate(k.mulai)} s.d. ${fmtDate(k.selesai)} → <strong>${k.efektif} pekan efektif</strong> (dari ${k.pekan} pekan kalender).${kh}</span>`;
}
const AI_DIMENSI = ["Keimanan dan Ketakwaan terhadap Tuhan YME","Kewargaan","Penalaran Kritis","Kreativitas","Kolaborasi","Kemandirian","Kesehatan","Komunikasi"];
const AI_MODEL_PEMBELAJARAN = ["Problem Based Learning (PBL)","Project Based Learning (PjBL)","Discovery Learning","Inquiry Learning","Cooperative Learning","Contextual Teaching and Learning"];
const AI_METODE = ["Ceramah","Diskusi","Tanya Jawab","Demonstrasi","Praktik/Eksperimen","Permainan Edukatif","Bermain Peran","Presentasi"];

function aiCheckGrid(name, options, checkedDefault){
  return `<div class="ai-checkgrid">${options.map(o=>`<label><input type="checkbox" name="${name}" value="${escapeHtml(o)}" ${checkedDefault?"checked":""}>${escapeHtml(o)}</label>`).join("")}</div>`;
}
function aiGetChecked(name){
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el=>el.value);
}
function aiSetChecked(name, values){
  document.querySelectorAll(`input[name="${name}"]`).forEach(el=>{ el.checked = values.includes(el.value); });
}
/* Preset cepat: dropdown yang mengisi seluruh form generator dalam 1 klik. */
function aiPresetSelectHtml(id, label, options, onChangeFn){
  return `<div class="field"><label>${label}</label><select id="${id}" onchange="${onChangeFn}(this.value)">
    <option value="">— Pilih preset (opsional, isian manual tetap bisa) —</option>
    ${options.map(o=>`<option value="${o.value}">${o.label}</option>`).join("")}</select></div>`;
}

/* ---------- 7. LOADING / RESULT PANEL ---------- */
function aiLoadingHtml(msg){
  return `<div class="card ai-result-box"><div class="ai-loading-panel"><span class="dot"></span><span class="dot"></span><span class="dot"></span>&nbsp;${escapeHtml(msg||"AI sedang menyusun dokumen...")}</div></div>`;
}
function aiResultHtml(title, contentHtml, docType, saveId){
  const titleArg=htmlJsArg(title), typeArg=htmlJsArg(docType);
  return `<div class="card ai-result-box">
    <div class="ai-toolbar">
      <button class="btn btn-primary" onclick="aiSaveDoc(${typeArg},'${saveId}')">${ic("check",15)} Simpan Dokumen</button>
      <button class="btn" onclick="aiExportWordAuto(${typeArg},'${saveId}',${titleArg})">${ic("download",15)} Word DOCX</button>
      <button class="btn" onclick="dbxSaveAiDoc(${typeArg},'${saveId}',${titleArg})">${ic("upload",15)} Simpan ke Dropbox</button>
      <button class="btn" onclick="aiExportExcel(document.getElementById('${saveId}').innerHTML,${titleArg})">${ic("download",15)} Export Excel</button>
      <button class="btn" onclick="aiExportPDF(document.getElementById('${saveId}').innerHTML,${titleArg},${typeArg})">${ic("download",15)} Export PDF</button>
      <button class="btn" onclick="aiExportMarkdown(document.getElementById('${saveId}'),${titleArg})">${ic("download",15)} Export Markdown</button>
      <button class="btn" onclick="aiCopyElement('${saveId}')">${ic("doc",15)} Salin</button>
      <button class="btn" onclick="document.getElementById('${saveId}').contentEditable=true;document.getElementById('${saveId}').focus();toast('Mode edit aktif - klik di dalam teks untuk mengubah.')">${ic("pen",15)} Edit</button>
    </div>
    ${AIGuruWord.settingsHtml(saveId)}
    <div class="ai-result-content" id="${saveId}">${AIDocumentFormat.normalize(contentHtml)}</div>
  </div>`;
}
let _aiLastDoc = {};
function aiSaveDoc(type, saveId){
  const el = document.getElementById(saveId);
  const content = el ? AIDocumentFormat.normalize(el.innerHTML) : "";
  const title = el && el.dataset.title || _aiLastDoc.title || (type+" - "+new Date().toLocaleDateString("id-ID"));
  db.aiDocs = db.aiDocs||[];
  db.aiDocs.unshift({id:uid("aidoc"), type, title, content, finishReason:el?.dataset.finishReason, createdAt:new Date().toISOString()});
  saveDB();
  toast("Dokumen tersimpan ke Riwayat & Dokumen Tersimpan.");
}

/* Fungsi generik pemanggil AI: membangun prompt, menampilkan loading,
   memanggil openRouterChat, lalu menampilkan hasil + menyimpan ke history. */
const aiRequests=new Map();
function aiCancelGenerate(id){const request=aiRequests.get(id);if(request) request.controller.abort();}
function cancelAiRequests(){aiRequests.forEach(request=>request.controller.abort());}
async function aiRunGenerate(resultElId, {type, title, systemPrompt, userPrompt}){
  const holder=document.getElementById(resultElId); if(!holder) return;
  aiCancelGenerate(resultElId);
  const request={controller:new AbortController(),classId:activeClassId};
  aiRequests.set(resultElId,request);
  const saveId='aiOut_'+uid('x');
  const active=()=>aiRequests.get(resultElId)===request && holder.isConnected && activeClassId===request.classId;
  holder.innerHTML=aiLoadingHtml('AI sedang menyusun '+type+'...')+`<button class="btn btn-sm" onclick="aiCancelGenerate('${resultElId}')">Batal</button>`;
  try{
    const messages=[{role:'system',content:systemPrompt||aiSettings.systemPrompt},{role:'user',content:userPrompt+'\n\n'+AIDocumentFormat.FORMAT_RULES}];
    let lastPaint=0;
    const res=await openRouterChat(messages,{signal:request.controller.signal,onDelta:full=>{
      if(!active()||Date.now()-lastPaint<180)return; lastPaint=Date.now();
      holder.innerHTML=`<div class="card"><div class="ai-loading-panel" role="status">Menyusun draf… <button class="btn btn-sm" onclick="aiCancelGenerate('${resultElId}')">Batal</button></div><div class="ai-result-content">${AIDocumentFormat.normalize(full,{streaming:true})}</div></div>`;
    }});
    if(!active() || request.controller.signal.aborted) return;
    const content=AIDocumentFormat.normalize(res.text);
    if(!content)throw new Error('AI belum menghasilkan isi dokumen yang dapat digunakan. Coba buat ulang.');
    const truncated=res.finishReason==='length';
    const warning=truncated?`<div class="card" role="status"><span class="badge badge-red">Terpotong</span><p class="hint">Batas token tercapai. Naikkan Max Tokens di AI Settings lalu buat ulang. Word otomatis ditunda; ekspor manual tersedia sebagai draf dengan peringatan.</p></div>`:'';
    holder.innerHTML=warning+aiResultHtml(title,content,type,saveId);
    document.getElementById(saveId).dataset.title=title;
    document.getElementById(saveId).dataset.finishReason=res.finishReason||'';
    document.getElementById(saveId).dataset.docType=type;AIGuruWord.applyPreview(saveId);
    _aiLastDoc={title};
    addAiHistory({id:uid('aihist'),type,title,content,model:aiSettings.model,usage:res.usage,createdAt:new Date().toISOString(),classId:request.classId,finishReason:res.finishReason});
    toast(truncated?'Hasil terpotong — naikkan batas token.':'Draf selesai. Tinjau sebelum digunakan.');
    if(aiSettings.autoWord&&!truncated){
      await aiExportWordAuto(type,saveId,title);
    }
  }catch(error){
    if(!active())return;
    const message=error.name==='AbortError'?'Pembuatan dokumen dibatalkan.':error.message;
    holder.innerHTML=`<div class="card" role="status"><p>${escapeHtml(message)}</p></div>`; toast(message);
  }finally{if(aiRequests.get(resultElId)===request)aiRequests.delete(resultElId);}
}

/* ---------- 8. EXPORT SERVICE ---------- */
function aiBuildWordDoc(html,title){return AIGuruWord.buildBlob(html,title,'Dokumen AI');}
async function aiExportWord(html,title){try{await AIGuruWord.download(html,title,'Dokumen AI');toast('Dokumen Word DOCX diunduh.');return true;}catch(error){toast('Ekspor DOCX gagal: '+error.message);return false;}}
/* Export Excel: HTML berisi tabel dibuka langsung oleh MS Excel / LibreOffice
   sebagai spreadsheet (.xls). Tanpa library tambahan, offline-friendly. */
function aiExportExcel(html, title){
  html=AIDocumentFormat.normalize(html);
  const doc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>table{border-collapse:collapse;} td,th{border:1px solid #333;padding:5px;vertical-align:top;} body{font-family:Calibri,Arial,sans-serif;}</style>
  </head><body><h1>${escapeHtml(title)}</h1>${html}</body></html>`;
  const blob = new Blob(['\ufeff', doc], {type:"application/vnd.ms-excel"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (title||"dokumen").replace(/[^\w\-]+/g,"_")+".xls";
  document.body.appendChild(a); a.click(); a.remove();
  toast("File Excel (.xls) diunduh.");
}
/* Kop NASKAH SOAL persis format cetak sekolah (contoh: naskah STS SDN 1 Gerduren):
   baris "Nama : ...." kanan atas, logo + 4 baris kop di tengah, garis tebal.
   Nama sekolah dikosongkan menjadi "...." agar naskah bisa dipakai umum/template. */
function kopSoalHtml(){
  const s = (typeof db!=="undefined" && db.sekolah) ? db.sekolah : {};
  const logoSrc = s.logoDataUrl || (typeof LOGO_SEKOLAH!=="undefined" ? LOGO_SEKOLAH : "assets/img/logo-sekolah.png");
  const kab = (s.kabupaten||"Banyumas").toUpperCase();
  const korwil = "KORWILCAM DINDIK "+(s.kecamatan||"Purwojati").toUpperCase();
  return `<div style="margin-bottom:10px;">`
    + `<div style="text-align:right;font-weight:bold;font-size:12pt;margin-bottom:4px;">Nama : ........................................................</div>`
    + `<table style="width:100%;border-collapse:collapse;"><tr>`
    + `<td style="width:100px;border:none;vertical-align:middle;text-align:center;"><img src="${logoSrc}" alt="Logo" style="width:82px;height:82px;object-fit:contain;"></td>`
    + `<td style="border:none;vertical-align:middle;text-align:center;"><div style="font-weight:bold;font-size:14pt;line-height:1.45;">PEMERINTAH KABUPATEN ${escapeHtml(kab)}<br>DINAS PENDIDIKAN<br>${escapeHtml(korwil)}<br>....</div></td>`
    + `</tr></table>`
    + `<div style="border-top:3px solid #000;margin-top:6px;"></div></div>`;
}
/* Native DOCX keeps F4 for examinations and separates the school header from AI content. */
function aiBuildWordSoalDoc(html,title){return AIGuruWord.buildBlob(html,title,'Bank Soal');}
async function aiExportWordSoal(html,title){try{await AIGuruWord.download(html,title,'Bank Soal');toast('Naskah soal DOCX diunduh.');return true;}catch(error){toast('Ekspor DOCX gagal: '+error.message);return false;}}
const aiWordExports=new Set();
async function aiExportWordAuto(docType,elId,title,prefixHtml){
  const el=document.getElementById(elId);if(!el){toast('Dokumen belum tersedia untuk diekspor.');return false;}if(aiWordExports.has(elId))return false;
  const truncated=el.dataset.finishReason==='length',prefix=prefixHtml||(truncated?'<p><strong>PERINGATAN DRAF TERPOTONG</strong> Dokumen ini belum lengkap karena batas token. Lengkapi sebelum digunakan.</p>':'');
  const html=prefix+el.innerHTML,format=AIGuruWord.readSettings(elId),school=structuredClone(db.sekolah||{}),status=document.getElementById('word_status_'+elId);
  aiWordExports.add(elId);if(status)status.textContent='Menyiapkan dokumen Word DOCX…';
  try{await AIGuruWord.download(html,title,docType,{format,school});if(status)status.textContent='DOCX selesai: paragraf, daftar, tabel, dan ukuran halaman sudah ditetapkan.';toast('Word DOCX diunduh.');return true;}
  catch(error){if(status)status.textContent='Ekspor gagal: '+error.message;toast('Ekspor DOCX gagal: '+error.message);return false;}
  finally{aiWordExports.delete(elId);}
}
function aiExportPDF(html, title, docType){
  html=AIDocumentFormat.normalize(html);
  const isSoal = (docType==="Bank Soal" || docType==="Asesmen Formatif");
  const kop = isSoal ? kopSoalHtml() : letterheadHtml();
  const judul = isSoal ? "" : `<div class="doc-title">${escapeHtml(title)}</div>`;
  document.getElementById("printArea").innerHTML = `${kop}${judul}${html}`;
  window.print();
}
function aiHtmlToMarkdown(node){
  let out = "";
  node.childNodes.forEach(n=>{
    if(n.nodeType===3){ out += n.textContent; return; }
    const tag = n.tagName ? n.tagName.toLowerCase() : "";
    if(tag==="h2") out += "\n\n## "+n.textContent.trim()+"\n";
    else if(tag==="h3") out += "\n\n### "+n.textContent.trim()+"\n";
    else if(tag==="h4") out += "\n\n#### "+n.textContent.trim()+"\n";
    else if(tag==="p") out += "\n"+aiHtmlToMarkdown(n)+"\n";
    else if(tag==="strong"||tag==="b") out += "**"+n.textContent.trim()+"**";
    else if(tag==="em"||tag==="i") out += "*"+n.textContent.trim()+"*";
    else if(tag==="li") out += "\n- "+n.textContent.trim();
    else if(tag==="tr") out += "\n| "+Array.from(n.children).map(td=>td.textContent.trim()).join(" | ")+" |";
    else if(tag==="table") out += "\n"+aiHtmlToMarkdown(n)+"\n";
    else out += aiHtmlToMarkdown(n);
  });
  return out;
}
function aiExportMarkdown(el, title){
  const md = "# "+title+"\n"+aiHtmlToMarkdown(el);
  const blob = new Blob([md], {type:"text/markdown;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (title||"dokumen").replace(/[^\w\-]+/g,"_")+".md";
  document.body.appendChild(a); a.click(); a.remove();
  toast("File Markdown diunduh.");
}
function aiCopyElement(id){
  const el = document.getElementById(id);
  if(!el) return;
  const range = document.createRange(); range.selectNode(el);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  try{ document.execCommand("copy"); toast("Disalin ke clipboard."); }
  catch(e){ toast("Gagal menyalin."); }
  sel.removeAllRanges();
}

/* ---------- 9. GENERATOR: MODUL AJAR ---------- */
PAGES.aiModul = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout">
    <div class="card">
      <h3>${ic("clipboard",18)} AI Generator: Modul Ajar</h3>
      <details style="margin-bottom:12px;background:var(--primary-ghost);border:1px solid var(--primary);border-radius:12px;padding:10px 14px;">
        <summary style="cursor:pointer;font-weight:800;font-size:13px;">📖 Panduan Pengisian (klik untuk buka)</summary>
        <ol class="hint" style="font-size:12.5px;line-height:1.9;padding-left:18px;margin:8px 0 0;">
          <li><strong>Kelas &amp; Semester</strong> — pilih sesuai jadwal mengajar.</li>
          <li><strong>Mata Pelajaran</strong> — daftar CP/TP otomatis menyesuaikan.</li>
          <li><strong>Elemen / CP</strong> — capaian pembelajaran acuan (dari data CP aplikasi).</li>
          <li><strong>Tujuan Pembelajaran (TP)</strong> — pilih dari ATP, atau tulis manual bila belum ada.</li>
          <li><strong>Lingkup Materi</strong> — bab/subbab spesifik, mis. "Bab 2: Penjumlahan".</li>
          <li><strong>Model, Metode, Asesmen</strong> — sesuaikan dengan karakteristik kelas.</li>
          <li>Klik <strong>Generate</strong> — hasil mengikuti struktur baku A/B/C dan bisa disimpan sebagai dokumen.</li>
        </ol>
      </details>
      <div class="grid grid-2">
        <div class="field"><label>Kelas</label>${aiKelasSelect("am_kelas", kelasId)}</div>
        <div class="field"><label>Semester</label>${aiSemesterSelect("am_semester")}</div>
      </div>
      ${aiPresetSelectHtml("am_preset","⚡ Preset Cepat",[
        {value:"faseA",label:"Fase A Reguler — Discovery Learning + permainan edukatif"},
        {value:"diferensiasi",label:"Berdiferensiasi Penuh — PjBL + konten/proses/produk"},
        {value:"ringkas",label:"Ringkas & Fokus — CTL + ceramah, tanya jawab, praktik"}
      ],"aiApplyPresetModul")}
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("am_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshElemen('am_kelas','am_mapel','am_elemenHolder');aiRefreshTp('am_kelas','am_mapel','am_tpHolder')">${ic("check",13)} Muat Elemen/CP</button></div></div>
      <div class="field"><label>Elemen / Capaian Pembelajaran</label><div id="am_elemenHolder">${aiElemenSelect("am_elemenHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
      <div class="field"><label>Tujuan Pembelajaran (TP)</label><div id="am_tpHolder">${aiTpSelect("am_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div>
        <input type="text" id="am_tpManual" placeholder="atau tulis TP manual di sini..." style="margin-top:6px;"></div>
      <div class="field"><label>Lingkup Materi / Bab</label><input type="text" id="am_materi" placeholder="mis. Bab 2: Penjumlahan Bilangan 1-20"></div>
      <div class="field"><label>Konteks Lokal (opsional)</label><input type="text" id="am_konteks" placeholder="mis. Desa pertanian dekat sawah; siswa akrab dengan pasar Gerduren"></div>
      <div class="field"><label>Alokasi Waktu</label><input type="text" id="am_alokasi" placeholder="mis. 2 x 35 menit (1 pertemuan)"></div>
      <div class="field"><label>Model Pembelajaran</label><select id="am_model">${AI_MODEL_PEMBELAJARAN.map(m=>`<option>${m}</option>`).join("")}</select></div>
      <div class="field"><label>Metode</label>${aiCheckGrid("am_metode", AI_METODE, false)}</div>
      <div class="field"><label>Media Pembelajaran</label><input type="text" id="am_media" placeholder="mis. Kartu angka, Proyektor, Video pembelajaran"></div>
      <div class="field"><label>Sarana & Prasarana</label><input type="text" id="am_sarana" placeholder="mis. Ruang kelas, papan tulis, alat peraga"></div>
      <div class="field"><label>Dimensi Profil Lulusan yang Dituju</label>${aiCheckGrid("am_dimensi", AI_DIMENSI, true)}</div>
      <div class="field"><label>Pembelajaran Berdiferensiasi</label>
        <select id="am_diferensiasi"><option>Diferensiasi Konten</option><option>Diferensiasi Proses</option><option>Diferensiasi Produk</option><option>Konten, Proses, dan Produk</option><option>Tidak ada diferensiasi khusus</option></select></div>
      <div class="field"><label>Jenis Asesmen</label>${aiCheckGrid("am_asesmen", ["Diagnostik","Formatif","Sumatif"], true)}</div>
      <div class="grid grid-2">
        <div class="field"><label>Format Rumusan TP</label><select id="am_formatTp"><option value="standar">Standar — terukur</option><option value="abcd">ABCD</option></select></div>
        <div class="field"><label>Jumlah Pertanyaan Pemantik</label><input type="number" id="am_jmlPemantik" value="3" min="2" max="5"></div>
      </div>
      <div class="field">
        <label><input type="checkbox" id="am_pemahaman" checked style="width:auto;margin-right:6px;">Sertakan bagian Pemahaman Bermakna</label>
        <label style="margin-top:6px;"><input type="checkbox" id="am_lampiran" checked style="width:auto;margin-right:6px;">Sertakan Lampiran ringkasan materi ajar</label>
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="generateAiModul()">${ic("star",16)} Generate Modul Ajar</button>
    </div>
    <div id="am_result"></div>
  </div>`;
};
function generateAiModul(){
  const kelasId = document.getElementById("am_kelas").value;
  const mapel = document.getElementById("am_mapel").value;
  const cList = aiCpListForKelasMapel(kelasId, mapel);
  const elIdx = document.getElementById("am_elemenHolder_sel") ? document.getElementById("am_elemenHolder_sel").value : "0";
  const cpEntry = cList[elIdx] || cList[0] || {elemen:"-", cp:"-"};
  const semester = document.getElementById("am_semester").value;
  const tpManual = document.getElementById("am_tpManual").value.trim();
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("am_tpHolder_sel") ? document.getElementById("am_tpHolder_sel").value : "";
  const tpPilih = (tpIdx!=="" && atpList[tpIdx]) ? atpList[tpIdx].tp : "";
  const tpFinal = tpManual || tpPilih || "(turunkan dari CP)";
  const materi = document.getElementById("am_materi").value.trim() || "(sesuai elemen CP terpilih)";
  const alokasi = document.getElementById("am_alokasi").value.trim() || "2 x 35 menit";
  const model = document.getElementById("am_model").value;
  const metode = aiGetChecked("am_metode");
  const media = document.getElementById("am_media").value.trim();
  const sarana = document.getElementById("am_sarana").value.trim();
  const dimensi = aiGetChecked("am_dimensi");
  const diferensiasi = document.getElementById("am_diferensiasi").value;
  const asesmen = aiGetChecked("am_asesmen");
  const konteks = document.getElementById("am_konteks").value.trim();
  const formatTp = document.getElementById("am_formatTp").value;
  const jmlPemantik = Math.max(2, Math.min(5, parseInt(document.getElementById("am_jmlPemantik").value||"3",10)));
  const pakaiPemahaman = document.getElementById("am_pemahaman").checked;
  const pakaiLampiran = document.getElementById("am_lampiran").checked;
  if(!materi || materi==="(sesuai elemen CP terpilih)" || materi.length<3){ toast("Isi dulu: Lingkup Materi / Bab."); document.getElementById("am_materi").focus(); return; }
  if(!tpManual && !tpPilih){ toast("Isi dulu: Tujuan Pembelajaran (pilih dari ATP atau tulis manual)."); const tm=document.getElementById("am_tpManual"); if(tm) tm.focus(); return; }
  const cls = classInfo(kelasId);
  const s = db.sekolah;
  const guru = (db.guru||[]).find(g=>g.id===s.waliKelasId) || (db.guru||[])[0] || {nama:"-", nip:"-"};

  const prompt = `Susun sebuah MODUL AJAR lengkap sesuai format terbaru Kemendikdasmen (Kurikulum Merdeka, pendekatan Pembelajaran Mendalam) dengan data berikut:

IDENTITAS
- Nama Sekolah: ${s.namaSekolah}
- Nama Guru: ${guru.nama}
- NIP: ${guru.nip||"-"}
- Kelas/Fase: ${cls.label} / Fase ${faseForClassId(kelasId)}
- Semester: ${semester} (${semester==="1"?"Ganjil":"Genap"})
- Mata Pelajaran: ${mapel}
- Tahun Pelajaran: ${s.tahunAjaran}
- Elemen: ${cpEntry.elemen}
- Capaian Pembelajaran (CP): ${cpEntry.cp}
- Tujuan Pembelajaran (TP): ${tpFinal}
- Lingkup Materi: ${materi}
- Konteks lokal: ${konteks||"-"}
- Alokasi Waktu: ${alokasi}
- Model Pembelajaran: ${model}
- Metode: ${metode.join(", ")||"disesuaikan dengan model pembelajaran"}
- Media: ${media||"disesuaikan dengan materi"}
- Sarana/Prasarana: ${sarana||"ruang kelas standar"}
- Dimensi Profil Lulusan yang dituju: ${dimensi.join(", ")}
- Pembelajaran Berdiferensiasi: ${diferensiasi}
- Jenis Asesmen: ${asesmen.join(", ")}

ACUAN STANDAR WAJIB:
1. Isi: CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025 — jangan mengubah makna CP; TP harus tertelusur dari CP.
2. Proses: Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025); kurikulum sesuai Permendikbudristek No. 12/2024 jo. Permendikdasmen No. 13/2025.
3. Peran pendidik: Permendikdasmen No. 23/2026 tentang Standar Tenaga Kependidikan — guru sebagai perancang pembelajaran profesional.
4. Bagian asesmen: Permendikbudristek No. 21/2022 tentang Standar Penilaian (formatif untuk umpan balik; nilai rapor hanya dari sumatif).
5. Jangan mengarang nomor/isi regulasi. Hal yang belum pasti tandai [perlu verifikasi].

STRUKTUR OUTPUT WAJIB (gunakan heading h2/h3, tabel bila perlu):
1. Identitas Modul Ajar (tabel)
2. Tujuan Pembelajaran (turunkan dari CP di atas, rumuskan 2-4 Tujuan Pembelajaran yang terukur${formatTp==="abcd"?", format ABCD (identifikasi Audience, Behavior, Condition, Degree)":""})
${pakaiPemahaman?"3. Pemahaman Bermakna\n":""}${pakaiPemahaman?"4":"3"}. Pertanyaan Pemantik (${jmlPemantik} pertanyaan kontekstual dari pengalaman sehari-hari siswa${konteks?`, kaitkan dengan konteks lokal: ${konteks}`:""}; tiap pertanyaan disertai "Catatan guru: tujuan pertanyaan ini adalah …")
${pakaiPemahaman?"5":"4"}. Profil Pelajar/Dimensi Profil Lulusan yang dikembangkan beserta penjelasan penerapannya
${pakaiPemahaman?"6":"5"}. Sarana, Prasarana, dan Media
${pakaiPemahaman?"7":"6"}. Kegiatan Pembelajaran (Pendahuluan, Inti [menerapkan prinsip berkesadaran/mindful, bermakna/meaningful, menggembirakan/joyful], Penutup) - rinci per langkah dengan estimasi waktu${model.indexOf("PjBL")>=0||model.indexOf("Project Based")>=0?" — sertakan driving question dan deskripsi produk akhir proyek":""}
${pakaiPemahaman?"8":"7"}. Strategi Diferensiasi Pembelajaran sesuai pilihan di atas (tanpa pelabelan negatif antarkelompok siswa)
${pakaiPemahaman?"9":"8"}. Asesmen (instrumen ringkas untuk setiap jenis asesmen yang dipilih)
${pakaiPemahaman?"10":"9"}. Refleksi Guru dan Refleksi Peserta Didik
${pakaiPemahaman?"11":"10"}. Remedial dan Pengayaan
${pakaiLampiran?`${pakaiPemahaman?"12":"11"}. Lampiran (ringkasan materi ajar singkat)`:""}

Tulis dengan bahasa formal, kontekstual untuk siswa SD Indonesia${konteks?`, selaraskan contoh dan analogi dengan konteks lokal tanpa mengubah akurasi konten`:""}.

CATATAN: Hasil ini draf awal — guru wajib meninjau, memverifikasi akurasi konten, dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;

  const title = "Modul Ajar - "+mapel+" - "+cls.label+" - "+materi;
  _aiLastDoc = {title};
  aiRunGenerate("am_result", {type:"Modul Ajar", title, userPrompt: prompt});
}
/* Preset cepat Modul Ajar: mengisi model, metode, diferensiasi, dan jenis asesmen. */
function aiApplyPresetModul(key){
  if(!key) return;
  const P = {
    faseA:        {model:"Discovery Learning", metode:["Permainan Edukatif","Demonstrasi","Tanya Jawab"], diferensiasi:"Diferensiasi Proses", asesmen:["Formatif","Sumatif"]},
    diferensiasi: {model:"Project Based Learning (PjBL)", metode:["Diskusi","Praktik/Eksperimen","Presentasi","Permainan Edukatif"], diferensiasi:"Konten, Proses, dan Produk", asesmen:["Diagnostik","Formatif","Sumatif"]},
    ringkas:      {model:"Contextual Teaching and Learning", metode:["Ceramah","Tanya Jawab","Praktik/Eksperimen"], diferensiasi:"Tidak ada diferensiasi khusus", asesmen:["Formatif"]},
  }[key];
  if(!P) return;
  document.getElementById("am_model").value = P.model;
  aiSetChecked("am_metode", P.metode);
  document.getElementById("am_diferensiasi").value = P.diferensiasi;
  aiSetChecked("am_asesmen", P.asesmen);
  toast("Preset diterapkan — tinggal isi Materi & TP, lalu Generate.");
}

/* ---------- 10. GENERATOR: ATP ---------- */
PAGES.aiATP = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout">
    <div class="card">
      <h3>${ic("book",18)} AI Generator: Alur Tujuan Pembelajaran (ATP)</h3>
      <div class="field"><label>Kelas</label>${aiKelasSelect("aa_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("aa_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshElemenCheck('aa_kelas','aa_mapel','aa_elemenHolder','aa_elemen')">${ic("check",13)} Muat Elemen/CP</button></div></div>
      <div class="field"><label>Semester</label>${aiSemesterSelect("aa_semester")}</div>
      <div class="field"><label>Elemen CP yang Dicakup</label><div id="aa_elemenHolder">${aiElemenCheckHtml("aa_elemen", kelasId, MAPEL_LIST[0])}</div></div>
      <div class="grid grid-2">
        <div class="field"><label>Jumlah JP Tersedia (Semester)</label><input type="number" id="aa_jp" value="24" min="4" max="120"><div class="hint">Dari Promes/Alokasi Waktu.</div></div>
        <div class="field"><label>Pendekatan Urutan</label><select id="aa_pendekatan">
          <option>Prasyarat → kompleks (disarankan)</option>
          <option>Tematik/integratif</option>
          <option>Mengikuti urutan buku teks</option>
        </select></div>
      </div>
      <div class="field"><label>Acuan TP (opsional — bila TP sudah disusun)</label><textarea id="aa_tpAcuan" placeholder="Tempel daftar TP yang sudah ada, atau kosongkan agar AI menurunkannya dari CP"></textarea></div>
      <button class="btn btn-primary" style="width:100%;" onclick="generateAiATP()">${ic("star",16)} Generate ATP</button>
    </div>
    <div id="aa_result"></div>
  </div>`;
};
function generateAiATP(){
  const kelasId = document.getElementById("aa_kelas").value;
  const mapel = document.getElementById("aa_mapel").value;
  const semester = document.getElementById("aa_semester").value;
  const cList = aiCpListForKelasMapel(kelasId, mapel);
  const cls = classInfo(kelasId);
  const elemenDipilih = aiGetChecked("aa_elemen");
  if(cList.length && !elemenDipilih.length){ toast("Pilih minimal 1 elemen CP yang dicakup."); document.getElementById("aa_elemenHolder").scrollIntoView({behavior:"smooth",block:"center"}); return; }
  const cpPakai = cList.length ? cList.filter(c=>elemenDipilih.includes(c.elemen)) : [];
  const jp = Math.max(4, Math.min(120, parseInt(document.getElementById("aa_jp").value||"24",10)));
  const pendekatan = document.getElementById("aa_pendekatan").value;
  const tpAcuan = document.getElementById("aa_tpAcuan").value.trim();
  const cpText = cpPakai.length
    ? cpPakai.map(c=>"- "+c.elemen+": "+c.cp).join("\n")
    : "(gunakan CP standar Fase "+faseForClassId(kelasId)+" untuk mapel ini sesuai Kep. Kepala BSKAP No. 046/H/KR/2025)";
  const prompt = `Susun ALUR TUJUAN PEMBELAJARAN (ATP) untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester}, berdasarkan Capaian Pembelajaran berikut:
${cpText}
${tpAcuan?`\nAcuan TP yang sudah disusun (WAJIB dipakai, jangan membuat TP baru yang bertentangan):\n${tpAcuan}\n`:""}
Ketentuan:
- Jumlah pertemuan tersedia: ${jp} JP — alokasikan waktu secara realistis per TP.
- Pendekatan urutan: ${pendekatan}.
- Susun tujuan pembelajaran secara berurutan dan logis: kemampuan prasyarat menuju kemampuan kompleks, konkret menuju abstrak; cakup seluruh elemen CP di atas tanpa pengulangan tanpa alasan.
- ATP adalah alur yang disusun dari CP dan konteks — bukan satu-satunya urutan resmi.

ACUAN STANDAR: CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025; proses sesuai Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Jangan mengarang regulasi.

Keluarkan HASIL dalam bentuk TABEL HTML dengan kolom: No | Elemen | Tujuan Pembelajaran (ATP) | Topik/Materi | Alokasi Waktu (JP) | Kata Kunci/Konten Utama | Model/Metode yang Disarankan.
Tambahkan judul dokumen di atas tabel. Di bawah tabel tampilkan total JP terpakai (harus ≤ ${jp} JP).

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;
  const title = "ATP - "+mapel+" - "+cls.label+" - Semester "+semester;
  aiRunGenerate("aa_result", {type:"ATP", title, userPrompt: prompt});
}

/* ---------- 11. GENERATOR: LKPD (9 komponen rumus) ---------- */
const AI_LKPD_STRUKTUR = ["Identitas","Tujuan","Petunjuk Penggunaan","Alat dan Bahan","Kegiatan Pembelajaran","Langkah Kerja","Tabel Pengamatan/Hasil","Pertanyaan Pemandu","Diskusi Kelompok","Refleksi","Kesimpulan","Rubrik Penilaian","Penilaian","Pengayaan","Remedial"];
const AI_LKPD_KUALITAS = ["Literasi","Numerasi","Profil Pelajar Pancasila/Profil Lulusan","HOTS (Higher Order Thinking Skills)","Kontekstual","Bermakna"];
PAGES.aiLKPD = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout">
    <div class="card">
            <h3>${ic("layers",18)} AI Generator: LKPD</h3>
      <details style="margin-bottom:12px;background:var(--primary-ghost);border:1px solid var(--primary);border-radius:12px;padding:10px 14px;">
        <summary style="cursor:pointer;font-weight:800;font-size:13px;">📖 Panduan Pengisian (klik untuk buka)</summary>
        <ol class="hint" style="font-size:12.5px;line-height:1.9;padding-left:18px;margin:8px 0 0;">
          <li><strong>Kelas &amp; Semester</strong> — pilih sesuai jadwal mengajar.</li>
          <li><strong>Elemen / CP &amp; TP</strong> — acuan kompetensi; TP bisa dipilih dari ATP atau ditulis manual.</li>
          <li><strong>Materi / Topik</strong> — fokus aktivitas LKPD, mis. "Mengukur Panjang Benda".</li>
          <li><strong>Model Aktivitas &amp; Pendekatan</strong> — mis. kelompok kecil + saintifik.</li>
          <li><strong>Gaya Bahasa</strong> — otomatis disarankan sesuai fase kelas.</li>
          <li>Klik <strong>Generate</strong> — hasil mencakup identitas, tujuan, langkah kerja, dan tabel pengamatan.</li>
        </ol>
      </details>
      <div class="grid grid-2">
        <div class="field"><label>Kelas</label>${aiKelasSelect("al_kelas", kelasId)}</div>
        <div class="field"><label>Semester</label>${aiSemesterSelect("al_semester")}</div>
      </div>
      ${aiPresetSelectHtml("al_preset","⚡ Preset Cepat",[
        {value:"eksperimen",label:"Praktik/Eksperimen Kelompok — saintifik, kelompok kecil"},
        {value:"mandiri",label:"Latihan Mandiri — kontekstual, individu"},
        {value:"proyek",label:"Proyek Kelompok — berbasis proyek, kelompok kecil"}
      ],"aiApplyPresetLKPD")}
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("al_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshElemen('al_kelas','al_mapel','al_elemenHolder');aiRefreshTp('al_kelas','al_mapel','al_tpHolder')">${ic("check",13)} Muat Elemen/CP</button></div></div>
      <div class="field"><label>Elemen / CP acuan</label><div id="al_elemenHolder">${aiElemenSelect("al_elemenHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
      <div class="field"><label>Materi / Topik LKPD</label><input type="text" id="al_materi" placeholder="mis. Mengukur Panjang Benda dengan Satuan Tidak Baku"></div>
      <div class="field"><label>Tujuan Pembelajaran (TP)</label><div id="al_tpHolder">${aiTpSelect("al_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div>
        <textarea id="al_tujuan" placeholder="atau tulis TP manual di sini (kosongkan untuk diturunkan dari CP)"></textarea></div>
      <div class="field"><label>Model Aktivitas</label><select id="al_aktivitas"><option>Individu</option><option>Berpasangan</option><option>Kelompok Kecil (3-4 siswa)</option><option>Klasikal</option></select></div>
      <div class="field"><label>Pendekatan</label><select id="al_pendekatan"><option>Kontekstual</option><option>Saintifik</option><option>STEAM</option><option>Berbasis Proyek</option><option>Berbasis Masalah</option></select></div>
      <div class="field"><label>Gaya Bahasa</label><select id="al_gaya"><option>Sederhana untuk siswa kelas rendah (1-3)</option><option>Standar untuk siswa kelas tinggi (4-6)</option><option>Naratif dan ceria dengan ilustrasi cerita</option></select></div>
      <div class="field"><label>Struktur LKPD yang disertakan</label>${aiCheckGrid("al_struktur", AI_LKPD_STRUKTUR, true)}</div>
      <div class="field"><label>Kriteria Kualitas</label>${aiCheckGrid("al_kualitas", AI_LKPD_KUALITAS, true)}</div>
      <div class="grid grid-2">
        <div class="field"><label>Jumlah Pertanyaan/Tugas</label><input type="number" id="al_jmlSoal" value="5" min="3" max="10"></div>
        <div class="field"><label>Tingkat Kesulitan</label><select id="al_sulit"><option>Berjenjang mudah → HOTS (disarankan)</option><option>Seragam sesuai TP</option></select></div>
      </div>
      <div class="field"><label><input type="checkbox" id="al_tabel" checked style="width:auto;margin-right:6px;">Sertakan Tabel Pengamatan/Hasil</label></div>
      <button class="btn btn-primary" style="width:100%;" onclick="generateAiLKPD()">${ic("star",16)} Generate LKPD</button>
    </div>
    <div id="al_result"></div>
  </div>`;
};
function generateAiLKPD(){
  const kelasId = document.getElementById("al_kelas").value;
  const mapel = document.getElementById("al_mapel").value;
  const cList = aiCpListForKelasMapel(kelasId, mapel);
  const elIdx = document.getElementById("al_elemenHolder_sel") ? document.getElementById("al_elemenHolder_sel").value : "0";
  const cpEntry = cList[elIdx] || cList[0] || {elemen:"-", cp:"-"};
  const materi = document.getElementById("al_materi").value.trim();
  const semester = document.getElementById("al_semester").value;
  const tujuanManual = document.getElementById("al_tujuan").value.trim();
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("al_tpHolder_sel") ? document.getElementById("al_tpHolder_sel").value : "";
  const tpPilih = (tpIdx!=="" && atpList[tpIdx]) ? atpList[tpIdx].tp : "";
  const tpFinal = tujuanManual || tpPilih || "(diturunkan dari CP)";
  const aktivitas = document.getElementById("al_aktivitas").value;
  const pendekatan = document.getElementById("al_pendekatan").value;
  const gaya = document.getElementById("al_gaya").value;
  const struktur = aiGetChecked("al_struktur");
  const kualitas = aiGetChecked("al_kualitas");
  const jmlSoal = Math.max(3, Math.min(10, parseInt(document.getElementById("al_jmlSoal").value||"5",10)));
  const sulit = document.getElementById("al_sulit").value;
  const pakaiTabel = document.getElementById("al_tabel").checked;
  if(materi.length<3){ toast("Isi dulu: Materi / Topik LKPD."); document.getElementById("al_materi").focus(); return; }
  const cls = classInfo(kelasId);
  const s = db.sekolah;

  // ---- 9 KOMPONEN RUMUS PROMPT LKPD ----
  const prompt = `[1. PERAN AI]
Anda adalah pengembang bahan ajar profesional yang ahli menyusun Lembar Kerja Peserta Didik (LKPD) untuk jenjang Sekolah Dasar sesuai Kurikulum Merdeka dan prinsip Pembelajaran Mendalam (berkesadaran, bermakna, menggembirakan).

[2. IDENTITAS PEMBELAJARAN]
- Sekolah: ${s.namaSekolah}
- Kelas/Fase: ${cls.label} / Fase ${faseForClassId(kelasId)}
- Mata Pelajaran: ${mapel}
- Elemen/CP acuan: ${cpEntry.elemen} - ${cpEntry.cp}
- Semester: ${semester} (${semester==="1"?"Ganjil":"Genap"})
- Tujuan Pembelajaran (TP): ${tpFinal}
- Tahun Pelajaran: ${s.tahunAjaran}

[3. TUJUAN]
${tujuanManual || "Turunkan 1-2 Tujuan Pembelajaran yang terukur dan operasional dari Capaian Pembelajaran di atas, relevan dengan materi \""+materi+"\"."}

[4. MATERI]
Topik/materi LKPD: ${materi}

[5. MODEL AKTIVITAS]
- Bentuk pengerjaan: ${aktivitas}
- Pendekatan pembelajaran: ${pendekatan}

[6. STRUKTUR LKPD]
Susun LKPD dengan bagian-bagian berikut (gunakan heading h2/h3 sesuai urutan, sertakan HANYA bagian yang dipilih): ${struktur.join(", ")}.

[7. GAYA BAHASA]
${gaya}. Gunakan kalimat instruksi yang jelas, positif, dan mudah diikuti langsung oleh peserta didik SD.

[8. FORMAT OUTPUT]
HTML terstruktur (h2/h3/p/ol/ul/table), siap cetak, tanpa markdown, tanpa komentar tambahan di luar isi LKPD.

[9. KRITERIA KUALITAS & JUMLAH]
Pastikan LKPD memenuhi seluruh kriteria berikut secara eksplisit di dalam kontennya: ${kualitas.join(", ")}.
- Jumlah pertanyaan/tugas analisis: ${jmlSoal} butir; tingkat kesulitan: ${sulit}.
${pakaiTabel?"- Sertakan Tabel Pengamatan/Hasil yang relevan dengan materi.":"- Tabel Pengamatan/Hasil tidak diperlukan untuk LKPD ini."}
- Sertakan Rubrik Penilaian sederhana (skala 1-4 dengan deskriptor konkret yang dapat diamati), serta bagian Pengayaan dan Remedial yang konkret dan dapat langsung digunakan guru.

[10. ACUAN STANDAR]
CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025 (jangan mengubah maknanya); proses sesuai Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Jangan mengarang regulasi.

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.

Susun LKPD lengkap sekarang berdasarkan seluruh komponen di atas.`;

  const title = "LKPD - "+mapel+" - "+cls.label+" - "+materi;
  aiRunGenerate("al_result", {type:"LKPD", title, userPrompt: prompt});
}
/* Preset cepat LKPD: mengisi model aktivitas & pendekatan. */
function aiApplyPresetLKPD(key){
  if(!key) return;
  const P = {
    eksperimen: {aktivitas:"Kelompok Kecil (3-4 siswa)", pendekatan:"Saintifik"},
    mandiri:    {aktivitas:"Individu", pendekatan:"Kontekstual"},
    proyek:     {aktivitas:"Kelompok Kecil (3-4 siswa)", pendekatan:"Berbasis Proyek"},
  }[key];
  if(!P) return;
  document.getElementById("al_aktivitas").value = P.aktivitas;
  document.getElementById("al_pendekatan").value = P.pendekatan;
  toast("Preset diterapkan — tinggal isi Materi & TP, lalu Generate.");
}
