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
  opts = opts||{};
  if(!aiSettings.apiKey){ throw new Error("API Key belum diisi. Buka menu AI Settings terlebih dahulu."); }
  const body = {
    model: aiSettings.model,
    messages: messages,
    temperature: Number(aiSettings.temperature),
    top_p: Number(aiSettings.topP),
    max_tokens: Number(aiSettings.maxTokens),
    presence_penalty: Number(aiSettings.presencePenalty),
    frequency_penalty: Number(aiSettings.frequencyPenalty),
    stream: !!aiSettings.streaming
  };
  let attempt = 0;
  const maxAttempt = Math.max(1, Number(aiSettings.retry)||1);
  let lastErr = null;
  while(attempt < maxAttempt){
    attempt++;
    const controller = new AbortController();
    const timeoutMs = (Number(aiSettings.timeoutSec)||60)*1000;
    const timer = setTimeout(()=>controller.abort(), timeoutMs);
    try{
      const res = await fetch(aiSettings.baseUrl, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer "+aiSettings.apiKey,
          "HTTP-Referer": (typeof location!=="undefined"?location.href:"https://teacherplanner.local"),
          "X-Title":"AI Teacher Suite Pro Indonesia"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);
      if(!res.ok){
        let errText = "";
        try{ const j = await res.json(); errText = (j.error&&j.error.message) || JSON.stringify(j); }catch(e){ errText = res.statusText; }
        if(res.status===401 || res.status===403) throw new Error("API Key tidak valid atau tidak memiliki akses. ("+res.status+")");
        if(res.status===429) throw new Error("Batas penggunaan (rate limit) tercapai. Coba lagi beberapa saat lagi.");
        if(res.status===402) throw new Error("Kuota/saldo OpenRouter habis. Silakan isi ulang kredit.");
        throw new Error("Permintaan AI gagal ("+res.status+"): "+errText);
      }
      if(aiSettings.streaming && res.body && res.body.getReader){
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let full = "";
        let buf = "";
        let finishReason = null;
        while(true){
          const {done, value} = await reader.read();
          if(done) break;
          buf += decoder.decode(value, {stream:true});
          const lines = buf.split("\n");
          buf = lines.pop();
          for(const line of lines){
            const trimmed = line.trim();
            if(!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if(payload==="[DONE]") continue;
            try{
              const json = JSON.parse(payload);
              const ch0 = json.choices && json.choices[0];
              if(ch0 && ch0.finish_reason) finishReason = ch0.finish_reason;
              const delta = ch0 && ch0.delta ? ch0.delta.content : "";
              if(delta){ full += delta; if(opts.onDelta) opts.onDelta(full, delta); }
            }catch(e){ /* abaikan baris parsial */ }
          }
        }
        return { text: full, finishReason, usage:{prompt_tokens:aiEstimateTokens(JSON.stringify(messages)), completion_tokens:aiEstimateTokens(full)} };
      } else {
        const json = await res.json();
        const text = json.choices && json.choices[0] && json.choices[0].message ? json.choices[0].message.content : "";
        const finishReason = json.choices && json.choices[0] ? json.choices[0].finish_reason : null;
        const usage = json.usage || {prompt_tokens:aiEstimateTokens(JSON.stringify(messages)), completion_tokens:aiEstimateTokens(text)};
        if(opts.onDelta) opts.onDelta(text, text);
        return { text, finishReason, usage };
      }
    }catch(err){
      clearTimeout(timer);
      lastErr = err;
      if(err.name==="AbortError"){ lastErr = new Error("Waktu tunggu (timeout) habis setelah "+aiSettings.timeoutSec+" detik."); }
      if(attempt < maxAttempt){ await new Promise(r=>setTimeout(r, 900*attempt)); continue; }
    }
  }
  throw lastErr || new Error("Gagal menghubungi AI setelah beberapa percobaan.");
}

async function aiTestConnection(){
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
    <p class="hint" style="margin-bottom:16px;">API Key hanya disimpan di perangkat Anda (localStorage), tidak dikirim ke server lain selain OpenRouter.</p>

    <div class="field"><label>API Key OpenRouter</label>
      <input type="password" id="ai_apiKey" value="${escapeHtml(s.apiKey)}" placeholder="sk-or-v1-..."></div>

    <div class="field"><label>Base URL Endpoint</label>
      <input type="text" id="ai_baseUrl" value="${escapeHtml(s.baseUrl)}"></div>

    <div class="field"><label>Model</label>
      <select id="ai_model">${modelOptionsHtml}</select>
      <div class="hint">Bisa juga isi manual nama model OpenRouter lain di bawah ini:</div>
      <input type="text" id="ai_modelCustom" placeholder="mis. mistralai/mistral-large" style="margin-top:6px;"></div>

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
      <div class="field"><label>Retry (percobaan ulang)</label><input type="number" id="ai_retry" value="${s.retry}" min="1" max="5"></div>
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
      <button class="btn btn-sm" onclick="aiViewHistory('${h.id}')">${ic("book",14)} Lihat</button>
      <button class="btn btn-sm" onclick="aiDuplicateAsNewDoc('${h.id}')">${ic("doc",14)} Duplikat</button>
      <button class="btn btn-sm btn-danger" onclick="aiDeleteHistory('${h.id}')">${ic("trash",14)} Hapus</button>
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
    bodyHtml: `<div class="ai-result-content" id="aiViewContent">${h.content}</div>
      <div class="ai-toolbar" style="margin-top:14px;">
        <button class="btn" onclick="aiExportWordAuto('${h.type}','aiViewContent','${escapeHtml(h.title).replace(/'/g,"")}')">${ic("download",15)} Export Word</button>
        <button class="btn" onclick="aiExportExcel(document.getElementById('aiViewContent').innerHTML,'${escapeHtml(h.title).replace(/'/g,"")}')">${ic("download",15)} Export Excel</button>
        <button class="btn" onclick="aiExportPDF(document.getElementById('aiViewContent').innerHTML,'${escapeHtml(h.title).replace(/'/g,"")}','${h.type}')">${ic("download",15)} Export PDF</button>
        <button class="btn" onclick="aiExportMarkdown(document.getElementById('aiViewContent'),'${escapeHtml(h.title).replace(/'/g,"")}')">${ic("download",15)} Export Markdown</button>
        <button class="btn" onclick="aiCopyElement('aiViewContent')">${ic("doc",15)} Salin</button>
      </div>`
  });
}
function aiDuplicateAsNewDoc(id){
  const h = loadAiHistory().find(x=>x.id===id);
  if(!h) return;
  db.aiDocs = db.aiDocs||[];
  db.aiDocs.unshift({id:uid("aidoc"), type:h.type, title:h.title+" (Duplikat)", content:h.content, createdAt:new Date().toISOString()});
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
  return `<div class="card ai-result-box">
    <div class="ai-toolbar">
      <button class="btn btn-primary" onclick="aiSaveDoc('${docType}','${saveId}')">${ic("check",15)} Simpan Dokumen</button>
      <button class="btn" onclick="aiExportWordAuto('${docType}','${saveId}','${escapeHtml(title).replace(/'/g,"")}')">${ic("download",15)} Export Word</button>
      <button class="btn" onclick="dbxSaveAiDoc('${docType}','${saveId}','${escapeHtml(title).replace(/'/g,"")}')">${ic("upload",15)} Simpan ke Dropbox</button>
      <button class="btn" onclick="aiExportExcel(document.getElementById('${saveId}').innerHTML,'${escapeHtml(title).replace(/'/g,"")}')">${ic("download",15)} Export Excel</button>
      <button class="btn" onclick="aiExportPDF(document.getElementById('${saveId}').innerHTML,'${escapeHtml(title).replace(/'/g,"")}','${docType}')">${ic("download",15)} Export PDF</button>
      <button class="btn" onclick="aiExportMarkdown(document.getElementById('${saveId}'),'${escapeHtml(title).replace(/'/g,"")}')">${ic("download",15)} Export Markdown</button>
      <button class="btn" onclick="aiCopyElement('${saveId}')">${ic("doc",15)} Salin</button>
      <button class="btn" onclick="document.getElementById('${saveId}').contentEditable=true;document.getElementById('${saveId}').focus();toast('Mode edit aktif - klik di dalam teks untuk mengubah.')">${ic("pen",15)} Edit</button>
    </div>
    <div class="ai-result-content" id="${saveId}">${contentHtml}</div>
  </div>`;
}
let _aiLastDoc = {};
function aiSaveDoc(type, saveId){
  const el = document.getElementById(saveId);
  const content = el ? el.innerHTML : "";
  const title = _aiLastDoc.title || (type+" - "+new Date().toLocaleDateString("id-ID"));
  db.aiDocs = db.aiDocs||[];
  db.aiDocs.unshift({id:uid("aidoc"), type, title, content, createdAt:new Date().toISOString()});
  saveDB();
  toast("Dokumen tersimpan ke Riwayat & Dokumen Tersimpan.");
}

/* Fungsi generik pemanggil AI: membangun prompt, menampilkan loading,
   memanggil openRouterChat, lalu menampilkan hasil + menyimpan ke history. */
async function aiRunGenerate(resultElId, {type, title, systemPrompt, userPrompt}){
  const holder = document.getElementById(resultElId);
  if(!holder) return;
  holder.innerHTML = aiLoadingHtml("AI sedang menyusun "+type+"...");
  const saveId = "aiOut_"+uid("x");
  try{
    const messages = [
      {role:"system", content: systemPrompt || aiSettings.systemPrompt},
      {role:"user", content: userPrompt}
    ];
    const res = await openRouterChat(messages, {
      onDelta: (full)=>{ holder.innerHTML = aiResultHtml(title, full, type, saveId); }
    });
    let truncWarn = "";
    if(res.finishReason==="length"){
      truncWarn = `<div class="card" style="border-left:4px solid #e8590c;margin-bottom:10px;"><span class="badge badge-red">Terpotong</span> <span class="hint">Hasil AI terpotong karena mencapai batas Max Tokens. Naikkan <strong>Max Tokens</strong> di AI Settings (disarankan 8000), lalu generate ulang.</span></div>`;
      toast("Hasil terpotong (batas token) — naikkan Max Tokens di AI Settings.");
    }
    holder.innerHTML = truncWarn + aiResultHtml(title, res.text, type, saveId);
    _aiLastDoc = {title};
    addAiHistory({id:uid("aihist"), type, title, content:res.text, model:aiSettings.model, usage:res.usage, createdAt:new Date().toISOString()});
    /* Unduh Word otomatis setelah generate (bisa dimatikan di AI Settings). */
    if(aiSettings.autoWord){
      const wordNote = res.finishReason==="length"
        ? `<p style="color:#c92a2a;font-weight:bold;">PERINGATAN: naskah ini terpotong karena mencapai batas Max Tokens. Naikkan Max Tokens di AI Settings lalu generate ulang.</p>` : "";
      try{ aiExportWordAuto(type, saveId, title, wordNote); }
      catch(e){ console.warn("Auto Word gagal:", e); }
    }
  }catch(e){
    holder.innerHTML = `<div class="card"><p class="badge badge-red">Gagal</p><p class="hint" style="margin-top:8px;">${escapeHtml(e.message)}</p></div>`;
    toast("Gagal generate: "+e.message);
  }
}

/* ---------- 8. EXPORT SERVICE ---------- */
function aiBuildWordDoc(html, title){
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>body{font-family:Calibri,Arial,sans-serif;font-size:12pt;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #333;padding:5px;}</style>
  </head><body>${letterheadHtml()}<h1 style="font-size:15pt;">${escapeHtml(title)}</h1>${html}</body></html>`;
}
function aiExportWord(html, title){
  const doc = aiBuildWordDoc(html, title);
  const blob = new Blob(['\ufeff', doc], {type:"application/msword"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (title||"dokumen").replace(/[^\w\-]+/g,"_")+".doc";
  document.body.appendChild(a); a.click(); a.remove();
  toast("File Word (.doc) diunduh.");
}
/* Export Excel: HTML berisi tabel dibuka langsung oleh MS Excel / LibreOffice
   sebagai spreadsheet (.xls). Tanpa library tambahan, offline-friendly. */
function aiExportExcel(html, title){
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
/* Export Word KHUSUS naskah soal/asesmen: kop soal persis format cetak sekolah,
   kertas F4, margin 2,5 cm, Times New Roman 12, spasi 1,5.
   Blok identitas naskah dibuat oleh AI di dalam konten (bukan di sini). */
function aiBuildWordSoalDoc(html, title){
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>
    @page{size:21cm 33cm;margin:2.5cm;}
    body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5;}
    h1{font-size:14pt;text-align:center;} h2{font-size:13pt;} h3{font-size:12pt;}
    table{border-collapse:collapse;width:100%;font-size:11pt;}
    td,th{border:1px solid #333;padding:5px;vertical-align:top;}
    p,li{line-height:1.5;}
    .soal-ident{text-align:center;}
    .soal-sep{text-align:center;letter-spacing:3px;margin:8px 0;}
  </style>
  </head><body>${kopSoalHtml()}${html}</body></html>`;
}
function aiExportWordSoal(html, title){
  const doc = aiBuildWordSoalDoc(html, title);
  const blob = new Blob(['\ufeff', doc], {type:"application/msword"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (title||"naskah-soal").replace(/[^\w\-]+/g,"_")+".doc";
  document.body.appendChild(a); a.click(); a.remove();
  toast("Naskah soal (.doc, format F4) diunduh.");
}
/* Dispatcher: naskah soal/asesmen memakai format khusus F4; lainnya format standar.
   prefixHtml opsional: disisipkan sebelum konten (mis. peringatan terpotong). */
function aiExportWordAuto(docType, elId, title, prefixHtml){
  const el = document.getElementById(elId);
  const html = (prefixHtml||"") + (el ? el.innerHTML : "");
  if(docType==="Bank Soal" || docType==="Asesmen Formatif") aiExportWordSoal(html, title);
  else aiExportWord(html, title);
}
function aiExportPDF(html, title, docType){
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


/* ============================================================
   BATCH 2 — PERBAIKAN CETAK, ABSENSI BULANAN, DAFTAR NILAI EXCEL,
   + 5 GENERATOR AI TAMBAHAN (TP, Jurnal Mengajar, Asesmen Diagnostik/
   Formatif/Sumatif)
   ============================================================ */

/* ---------- A. CETAK LANDSCAPE (untuk tabel lebar seperti absensi bulanan) ---------- */
function printDocumentLandscape(title, bodyHtml){
  const styleTag = document.createElement("style");
  styleTag.id = "_landscapePrintStyle";
  styleTag.textContent = "@page{size:landscape;margin:10mm;} #printArea table{font-size:9.5px;} #printArea td,#printArea th{padding:3px 4px;}";
  document.head.appendChild(styleTag);
  printDocument(title, bodyHtml);
  setTimeout(()=>{ const t=document.getElementById("_landscapePrintStyle"); if(t) t.remove(); }, 800);
}

/* ---------- B. ABSENSI / KEHADIRAN BULANAN (grid, pilihan bulan, Word & Excel resmi) ---------- */
function bulanIndoLabel(yyyyMM){
  const [y,m] = yyyyMM.split("-");
  const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  return names[parseInt(m,10)-1]+" "+y;
}
function daysInMonthOf(yyyyMM){
  const [y,m] = yyyyMM.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function absensiAvailableMonths(){
  const set = new Set(Object.keys(db.kehadiran||{}).map(d=>d.slice(0,7)));
  set.add(todayISO().slice(0,7));
  return Array.from(set).sort();
}
function attendanceGridData(bulan){
  const nDays = daysInMonthOf(bulan);
  const dayNums = Array.from({length:nDays}, (_,i)=>i+1);
  const perHari = dayNums.map(()=>0);
  const rows = siswaSortedAlpha().map(s=>{
    let h=0, sk=0, iz=0, al=0;
    const cells = dayNums.map(d=>{
      const iso = bulan+"-"+String(d).padStart(2,"0");
      const st = (db.kehadiran[iso]||{})[s.id] || "";
      if(st==="H"){ h++; perHari[d-1]++; } else if(st==="S") sk++; else if(st==="I") iz++; else if(st==="A") al++;
      return st;
    });
    return {nama:s.nama, nis:s.nis||"", cells, h, sk, iz, al};
  });
  return {dayNums, rows, perHari};
}
function attendanceGridHtml(bulan){
  const {dayNums, rows, perHari} = attendanceGridData(bulan);
  const liburDay = {};
  dayNums.forEach(d=>{
    const iso = bulan+"-"+String(d).padStart(2,"0");
    if(tanggalLiburInfo(iso).libur) liburDay[d] = true;
  });
  const thDay = d=>`<th${liburDay[d]?' style="background:var(--danger-soft);color:var(--danger);" title="Hari libur"':''}>${d}</th>`;
  const tdDay = (d,c)=>`<td${liburDay[d]?' style="background:var(--danger-soft);opacity:.55;"':''}>${c||""}</td>`;
  const head = `<tr><th rowspan="2">No</th><th rowspan="2">Nama Siswa</th><th colspan="${dayNums.length}">Tanggal</th><th colspan="4">Rekap</th></tr>
    <tr>${dayNums.map(thDay).join("")}<th>H</th><th>S</th><th>I</th><th>A</th></tr>`;
  const body = rows.map((r,i)=>`<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(r.nama)}</strong></td>
    ${r.cells.map((c,di)=>tdDay(dayNums[di],c)).join("")}
    <td>${r.h}</td><td>${r.sk}</td><td>${r.iz}</td><td>${r.al}</td></tr>`).join("");
  const footer = `<tr><td colspan="2" style="text-align:right;"><strong>Jumlah Hadir</strong></td>${perHari.map((n,di)=>tdDay(dayNums[di],n||"")).join("")}<td colspan="4"></td></tr>`;
  return `<table><thead>${head}</thead><tbody>${body}${footer}</tbody></table>
  <p class="hint" style="margin-top:8px;">Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa/Tanpa Keterangan. Kolom berwarna merah muda = hari libur (Sabtu/Minggu/libur nasional).</p>`;
}
/* ============================================================
   HARI LIBUR & KUNCI ABSENSI (v2.4)
   - LIBUR_NASIONAL: SKB 3 Menteri 2026 (17 libur + 8 cuti bersama).
     Untuk 2027 baru tanggal tetap; dilengkapi saat SKB 2027 terbit.
   - Sabtu & Minggu selalu dianggap libur.
   - Kunci bisa dibuka per-tanggal via tombol (tersimpan di db).
   ============================================================ */
const LIBUR_NASIONAL = {
  "2026-01-01":"Tahun Baru 2026 Masehi",
  "2026-01-16":"Isra Mikraj Nabi Muhammad SAW",
  "2026-02-16":"Cuti Bersama Tahun Baru Imlek",
  "2026-02-17":"Tahun Baru Imlek 2577 Kongzili",
  "2026-03-18":"Cuti Bersama Hari Suci Nyepi",
  "2026-03-19":"Hari Suci Nyepi (Tahun Baru Saka 1948)",
  "2026-03-20":"Cuti Bersama Idul Fitri",
  "2026-03-21":"Idul Fitri 1447 Hijriah",
  "2026-03-22":"Idul Fitri 1447 Hijriah",
  "2026-03-23":"Cuti Bersama Idul Fitri",
  "2026-03-24":"Cuti Bersama Idul Fitri",
  "2026-04-03":"Wafat Yesus Kristus",
  "2026-04-05":"Kebangkitan Yesus Kristus (Paskah)",
  "2026-05-01":"Hari Buruh Internasional",
  "2026-05-14":"Kenaikan Yesus Kristus",
  "2026-05-15":"Cuti Bersama Kenaikan Yesus Kristus",
  "2026-05-27":"Idul Adha 1447 Hijriah",
  "2026-05-28":"Cuti Bersama Idul Adha",
  "2026-05-31":"Hari Raya Waisak 2570 BE",
  "2026-06-01":"Hari Lahir Pancasila",
  "2026-06-16":"1 Muharam Tahun Baru Islam 1448 Hijriah",
  "2026-08-17":"Proklamasi Kemerdekaan RI",
  "2026-08-25":"Maulid Nabi Muhammad SAW",
  "2026-12-24":"Cuti Bersama Natal",
  "2026-12-25":"Hari Raya Natal",
  "2027-01-01":"Tahun Baru 2027 Masehi",
  "2027-05-01":"Hari Buruh Internasional",
  "2027-06-01":"Hari Lahir Pancasila",
  "2027-08-17":"Proklamasi Kemerdekaan RI",
  "2027-12-25":"Hari Raya Natal"
};
function tanggalLiburInfo(iso){
  if(LIBUR_NASIONAL[iso]) return {libur:true, ket:LIBUR_NASIONAL[iso]};
  const d = new Date(iso+"T00:00:00");
  const day = d.getDay();
  if(day===0) return {libur:true, ket:"Hari Minggu"};
  if(day===6) return {libur:true, ket:"Hari Sabtu"};
  return {libur:false, ket:""};
}
function isTanggalDikunci(iso){
  const info = tanggalLiburInfo(iso);
  if(!info.libur) return null;
  const unlocked = ((db.absenBukaKunci||{})[iso]) ? true : false;
  return unlocked ? null : info;
}
function absenBukaKunci(iso){
  db.absenBukaKunci = db.absenBukaKunci || {};
  db.absenBukaKunci[iso] = true;
  saveDB(); renderPage("kehadiran");
  toast("Kunci dibuka untuk "+fmtDate(iso)+" — silakan isi absensi");
}
function absenKunciLagi(iso){
  db.absenBukaKunci = db.absenBukaKunci || {};
  delete db.absenBukaKunci[iso];
  saveDB(); renderPage("kehadiran");
  toast("Tanggal "+fmtDate(iso)+" dikunci kembali");
}
function hariEfektifBulan(yyyyMM){
  const n = daysInMonthOf(yyyyMM);
  let c = 0;
  for(let d=1; d<=n; d++){
    const iso = yyyyMM+"-"+String(d).padStart(2,"0");
    if(!tanggalLiburInfo(iso).libur) c++;
  }
  return c;
}
/* Daftar bulan sejak awal tahun pelajaran (Juli) s.d. bulan berjalan */
function absensiBulanList(){
  const ta = String(db.sekolah.tahunAjaran||"");
  const m0 = ta.match(/(\d{4})\s*\/\s*\d{4}/);
  const startYear = m0 ? parseInt(m0[1],10) : (new Date().getFullYear());
  const now = todayISO().slice(0,7);
  const list = [];
  let y = startYear, m = 7, guard = 0;
  while(guard++ < 30){
    const ym = y+"-"+String(m).padStart(2,"0");
    list.push(ym);
    if(ym >= now) break;
    m++; if(m>12){ m=1; y++; }
  }
  Object.keys(db.kehadiran||{}).forEach(d=>{
    const ym = d.slice(0,7);
    if(list.indexOf(ym)<0) list.push(ym);
  });
  return list.sort();
}
/* Ringkasan persentase kehadiran bulanan */
function absensiRingkasanHtml(bulan){
  const data = attendanceGridData(bulan);
  const rows = data.rows;
  const nSiswa = rows.length;
  const hariEfektif = hariEfektifBulan(bulan);
  let tH=0, tS=0, tI=0, tA=0;
  rows.forEach(r=>{ tH+=r.h; tS+=r.sk; tI+=r.iz; tA+=r.al; });
  const penyebut = hariEfektif * nSiswa;
  const pct = v => penyebut>0 ? (v*100/penyebut) : 0;
  const f1 = v => (Math.round(v*10)/10).toString().replace(".", ",")+"%";
  const bar = (p, color) => `<div style="height:8px;border-radius:99px;background:var(--border);overflow:hidden;margin-top:6px;"><div style="height:100%;width:${Math.min(100,p)}%;background:${color};border-radius:99px;"></div></div>`;
  const card = (label, total, p, color) => `
    <div class="card" style="margin:0;padding:14px 16px;">
      <div class="muted" style="font-size:11.5px;font-weight:700;">${label}</div>
      <div style="font-size:22px;font-weight:800;margin-top:2px;">${f1(p)}</div>
      <div class="muted" style="font-size:11.5px;">${total} dari ${penyebut} siswa-hari</div>
      ${bar(p, color)}
    </div>`;
  return `
  <div class="card" style="margin-bottom:16px;">
    <div class="section-head" style="margin-bottom:12px;"><div>
      <h3 style="margin:0;">Ringkasan Kehadiran — ${bulanIndoLabel(bulan)}</h3>
      <div class="desc">Hari efektif: <strong>${hariEfektif} hari</strong> (di luar Sabtu/Minggu &amp; libur nasional) &middot; Siswa: <strong>${nSiswa}</strong> &middot; Rumus: jumlah &times; 100 &divide; (hari efektif &times; jumlah siswa)</div>
    </div></div>
    <div class="grid grid-2" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
      ${card("Kehadiran", tH, pct(tH), "var(--accent)")}
      ${card("Sakit", tS, pct(tS), "var(--warn)")}
      ${card("Izin", tI, pct(tI), "var(--primary)")}
      ${card("Alfa", tA, pct(tA), "var(--danger)")}
    </div>
  </div>`;
}
function attendanceTtdBlockHtml(){
  const s = db.sekolah;
  const wali = (db.guru||[]).find(g=>g.id===s.waliKelasId) || {};
  return `<br><table style="border:none;width:100%;"><tr style="border:none;">
    <td style="border:none;width:50%;text-align:center;">Mengetahui,<br>Kepala Sekolah,<br><br><br><br><strong>${escapeHtml(s.kepalaSekolah||"-")}</strong><br>NIP. ${escapeHtml(s.nipKepsek||"-")}</td>
    <td style="border:none;width:50%;text-align:center;">${escapeHtml(s.desa||"-")}, ${fmtDate(todayISO())}<br>Guru Kelas ${escapeHtml(s.kelas||"")},<br><br><br><br><strong>${escapeHtml(wali.nama||"-")}</strong><br>NIP. ${escapeHtml(wali.nip||"-")}</td>
  </tr></table>`;
}
function printAbsensiBulanan(){
  const bulan = window._kehadiranBulan || todayISO().slice(0,7);
  printDocumentLandscape("DAFTAR HADIR SISWA BULAN "+bulanIndoLabel(bulan).toUpperCase(), attendanceGridHtml(bulan)+attendanceTtdBlockHtml());
}
function exportAbsensiWord(){
  const bulan = window._kehadiranBulan || todayISO().slice(0,7);
  const html = `${letterheadHtml()}<div class="doc-title">DAFTAR HADIR SISWA<br>BULAN ${bulanIndoLabel(bulan).toUpperCase()}</div>
    <p style="text-align:center;font-size:11pt;margin-top:-8px;">${escapeHtml(classInfo(activeClassId).label)} &middot; T.A. ${escapeHtml(db.sekolah.tahunAjaran)} &middot; Semester ${escapeHtml(db.sekolah.semester)}</p>
    ${attendanceGridHtml(bulan)}${attendanceTtdBlockHtml()}`;
  htmlToWordDoc(html, "Daftar_Hadir_"+bulanIndoLabel(bulan).replace(/\s+/g,"_"), "Daftar Hadir "+bulanIndoLabel(bulan));
}
function exportAbsensiExcel(){
  const bulan = window._kehadiranBulan || todayISO().slice(0,7);
  const html = `<p><strong>${escapeHtml(db.sekolah.namaSekolah)}</strong></p>
    <p>Daftar Hadir Siswa - ${escapeHtml(classInfo(activeClassId).label)} - Bulan ${bulanIndoLabel(bulan)} - T.A. ${escapeHtml(db.sekolah.tahunAjaran)} - Semester ${escapeHtml(db.sekolah.semester)}</p>
    ${attendanceGridHtml(bulan)}`;
  htmlToExcelXls(html, "Daftar_Hadir_"+bulanIndoLabel(bulan).replace(/\s+/g,"_"), "Absensi "+bulanIndoLabel(bulan));
}

/* ---------- Render ulang PAGES.kehadiran dengan pemilih bulan + grid absensi bulanan ---------- */
PAGES.kehadiran = function(){
  const tgl = window._kehadiranTgl || todayISO();
  db.kehadiran[tgl] = db.kehadiran[tgl] || {};
  const kunciInfo = isTanggalDikunci(tgl);
  const terkunci = !!kunciInfo;
  const disAttr = terkunci ? "disabled" : "";
  const siswaList = siswaSortedAlpha();
  const rows = siswaList.map((s,i)=>{
    const st = db.kehadiran[tgl][s.id] || "H";
    const opts = [["H","Hadir","badge-green"],["S","Sakit","badge-orange"],["I","Izin","badge-blue"],["A","Alpa","badge-red"]];
    return `<tr><td style="width:44px;"><span class="badge badge-blue">${i+1}</span></td><td><strong>${escapeHtml(s.nama)}</strong></td><td>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
      ${opts.map(o=>`<button class="btn btn-sm ${st===o[0]?'btn-primary':''}" ${disAttr} onclick="setKehadiran('${tgl}','${s.id}','${o[0]}')">${o[1]}</button>`).join("")}
      </div></td></tr>`;
  }).join("");
  const bulanAktif = window._kehadiranBulan || tgl.slice(0,7);
  const months = absensiBulanList();
  if(!months.includes(bulanAktif)) months.push(bulanAktif);
  months.sort();
  return `
  <div class="section-head"><div><h1>Kehadiran Siswa</h1><div class="desc">Tandai kehadiran harian, lalu cetak/unduh rekap bulanan di bawah.</div></div>
    <div class="grow"></div></div>
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
      <div class="field" style="max-width:200px;margin-bottom:0;"><label>Tanggal</label><input type="date" value="${tgl}" onchange="window._kehadiranTgl=this.value; renderPage('kehadiran');"></div>
      <button class="btn btn-accent" ${disAttr} onclick="kehadiranHadirSemua()">${ic("check",15)} Hadir Semua (1 Klik)</button>
      <button class="btn" ${disAttr} onclick="kehadiranResetHarian()">${ic("x",15)} Reset</button>
    </div>
    ${terkunci ? `
    <div class="card" style="background:var(--warn-soft);border:1.5px solid var(--warn);margin-bottom:14px;">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        ${ic("lock",22)}
        <div style="flex:1;min-width:200px;"><strong>🔒 Terkunci:</strong> ${fmtDate(tgl)} adalah <strong>${kunciInfo.ket}</strong>. Pengisian absensi dikunci agar tidak terisi saat libur.</div>
        <button class="btn btn-primary btn-sm" onclick="absenBukaKunci('${tgl}')">Buka Kunci</button>
      </div>
    </div>` : ((db.absenBukaKunci||{})[tgl] ? `
    <div class="hint" style="margin-bottom:12px;">🔓 Kunci dibuka manual untuk tanggal ini. <button class="btn btn-sm" onclick="absenKunciLagi('${tgl}')">Kunci lagi</button></div>` : ``)}
    <div style="background:var(--primary-ghost);border:1.5px dashed var(--primary);border-radius:14px;padding:14px 16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:13px;margin-bottom:8px;">⚡ Absen Cepat <span class="muted" style="font-weight:600;">— ketik nomor/nama yang TIDAK hadir, otomatis tertandai</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
        <div class="field" style="flex:1;min-width:220px;margin-bottom:0;"><label>Nomor / nama siswa (pisahkan koma)</label><input id="absenCepatInput" placeholder="cth: 3, 7, 12  atau: Aji, Eza"></div>
        <div class="field" style="margin-bottom:0;"><label>Keterangan</label><select id="absenCepatKet"><option value="S">Sakit</option><option value="I">Izin</option><option value="A">Alpa</option></select></div>
        <button class="btn btn-primary" ${disAttr} onclick="kehadiranAbsenCepat()">${ic("check",15)} Tandai</button>
      </div>
      <div class="hint">Nomor = nomor urut pada tabel di bawah. Nama boleh sebagian (cth: "Aji"), asal hanya cocok dengan 1 siswa.</div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama Siswa</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>
  ${absensiRingkasanHtml(bulanAktif)}
  <div class="card">
    <div class="section-head" style="margin-bottom:14px;"><div><h3 style="margin:0;">Rekap Absensi Bulanan</h3></div><div class="grow"></div>
      <select style="padding:8px 10px;border-radius:10px;border:1px solid var(--border);margin-right:8px;" onchange="window._kehadiranBulan=this.value; renderPage('kehadiran');">
        ${months.map(m=>`<option value="${m}" ${m===bulanAktif?"selected":""}>${bulanIndoLabel(m)}</option>`).join("")}
      </select>
      <button class="btn" onclick="printAbsensiBulanan()">${ic("print",15)} Cetak</button>
      <button class="btn" onclick="exportAbsensiWord()">${ic("download",15)} Word</button>
      <button class="btn" onclick="exportAbsensiExcel()">${ic("download",15)} Excel</button>
    </div>
    <div id="rekapAbsenHolder" class="table-wrap">${attendanceGridHtml(bulanAktif)}</div>
  </div>`;
};
function setKehadiran(tgl,siswaId,status){ db.kehadiran[tgl]=db.kehadiran[tgl]||{}; db.kehadiran[tgl][siswaId]=status; saveDB(); renderPage("kehadiran"); }

/* ---------- ABSENSI CEPAT: 1 klik hadir semua + tandai absen via ketikan ---------- */
function kehadiranHadirSemua(){
  const tgl = window._kehadiranTgl || todayISO();
  db.kehadiran[tgl] = db.kehadiran[tgl] || {};
  siswaSortedAlpha().forEach(s=>{ db.kehadiran[tgl][s.id] = "H"; });
  saveDB(); renderPage("kehadiran");
  toast("Semua siswa ditandai Hadir — "+fmtDate(tgl));
}
function kehadiranResetHarian(){
  const tgl = window._kehadiranTgl || todayISO();
  confirmDialog("Hapus semua tanda kehadiran tanggal "+fmtDate(tgl)+"?", ()=>{
    delete db.kehadiran[tgl]; saveDB(); renderPage("kehadiran");
    toast("Kehadiran tanggal "+fmtDate(tgl)+" direset");
  });
}
function kehadiranAbsenCepat(){
  const tgl = window._kehadiranTgl || todayISO();
  const raw = (document.getElementById("absenCepatInput").value||"").trim();
  const ket = document.getElementById("absenCepatKet").value || "S";
  if(!raw){ toast("Ketik dulu nomor / nama siswa yang tidak hadir"); return; }
  const list = siswaSortedAlpha();
  const tokens = raw.split(/[,;\n]+/).map(t=>t.trim()).filter(Boolean);
  const kena = [], takKetemu = [];
  tokens.forEach(tok=>{
    let s = null;
    if(/^\d+$/.test(tok)){
      const no = parseInt(tok,10);
      s = list[no-1] || list.find(x=>String(x.no)===tok) || null;
    } else {
      const tl = tok.toLowerCase();
      const hits = list.filter(x=>(x.nama||"").toLowerCase().includes(tl));
      if(hits.length===1) s = hits[0];
      else if(hits.length>1) takKetemu.push(tok+" (cocok "+hits.length+" nama)");
    }
    if(s) kena.push(s); else if(takKetemu.indexOf(tok)<0) takKetemu.push(tok);
  });
  db.kehadiran[tgl] = db.kehadiran[tgl] || {};
  kena.forEach(s=>{ db.kehadiran[tgl][s.id] = ket; });
  saveDB(); renderPage("kehadiran");
  const lbl = {S:"Sakit",I:"Izin",A:"Alpa"}[ket]||ket;
  toast(kena.length+" siswa ditandai "+lbl+(takKetemu.length?". Tak ketemu: "+takKetemu.join(", "):""));
}
function printKehadiran(){ printAbsensiBulanan(); } // alias lama, dipertahankan agar tombol/pemanggil lama tidak rusak

/* ---------- C. DAFTAR NILAI - EXPORT EXCEL LENGKAP (semua mapel, format ledger resmi) ---------- */
function daftarNilaiLengkapData(jenisStore){
  const store = jenisStore || "asesmenSumatif";
  const bySiswaMapel = {};
  (db[store]||[]).forEach(r=>{
    bySiswaMapel[r.siswaId] = bySiswaMapel[r.siswaId] || {};
    (bySiswaMapel[r.siswaId][r.mapel] = bySiswaMapel[r.siswaId][r.mapel] || []).push(Number(r.nilai)||0);
  });
  return siswaSortedAlpha().map(s=>{
    const perMapel = MAPEL_LIST.map(m=>{
      const arr = (bySiswaMapel[s.id]||{})[m] || [];
      return arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : null;
    });
    const valid = perMapel.filter(v=>v!=null);
    const overall = valid.length ? (valid.reduce((a,b)=>a+b,0)/valid.length) : null;
    let predikat = "-";
    if(overall!=null){ predikat = overall>=85?"A (Sangat Baik)":overall>=70?"B (Baik)":overall>=60?"C (Cukup)":"D (Perlu Bimbingan)"; }
    return {nama:s.nama, nis:s.nis||"-", perMapel, overall, predikat};
  });
}
function exportDaftarNilaiLengkapExcel(){
  const jenisSel = window._rekapJenis || "asesmenSumatif";
  const data = daftarNilaiLengkapData(jenisSel);
  const s = db.sekolah;
  const head = `<tr><th rowspan="2">No</th><th rowspan="2">Nama Siswa</th><th rowspan="2">NISN</th><th colspan="${MAPEL_LIST.length}">Nilai Rata-rata per Mata Pelajaran</th><th rowspan="2">Rata-rata Keseluruhan</th><th rowspan="2">Predikat</th></tr>
    <tr>${MAPEL_LIST.map(m=>`<th>${escapeHtml(m)}</th>`).join("")}</tr>`;
  const body = data.map((r,i)=>`<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(r.nama)}</strong></td><td>${escapeHtml(r.nis)}</td>
    ${r.perMapel.map(v=>`<td>${v==null?"-":v.toFixed(1)}</td>`).join("")}
    <td>${r.overall==null?"-":r.overall.toFixed(1)}</td><td>${r.predikat}</td></tr>`).join("");
  const html = `<p><strong>${escapeHtml(s.namaSekolah)}</strong></p>
    <p>DAFTAR NILAI ${jenisSel==="asesmenSumatif"?"SUMATIF":"FORMATIF"} &middot; ${escapeHtml(classInfo(activeClassId).label)} &middot; Semester ${escapeHtml(s.semester)} &middot; T.A. ${escapeHtml(s.tahunAjaran)}</p>
    <table><thead>${head}</thead><tbody>${body}</tbody></table>`;
  htmlToExcelXls(html, "Daftar_Nilai_Lengkap_"+(jenisSel==="asesmenSumatif"?"Sumatif":"Formatif"), "Daftar Nilai");
}
/* Halaman Daftar Nilai kini memakai format ledger formal (40-pages-b.js)
   dengan tombol Cetak & Excel sendiri; wrapper tombol lama dihapus agar
   tidak ganda. exportDaftarNilaiLengkapExcel dipertahankan sbg utilitas. */

/* ============================================================
   D. AI GENERATOR BATCH 2: TP, JURNAL MENGAJAR,
      ASESMEN DIAGNOSTIK / FORMATIF / SUMATIF
   ============================================================ */
function aiAtpListForKelasMapel(kelasId, mapel){
  const clsData = (kelasId===activeClassId) ? db : loadClassDB(kelasId);
  return (clsData.atp||[]).filter(a=>a.mapel===mapel);
}
function aiTpSelect(id, kelasId, mapel){
  const list = aiAtpListForKelasMapel(kelasId, mapel);
  if(!list.length) return `<select id="${id}"><option value="">- Tulis manual di bawah -</option></select>`;
  return `<select id="${id}"><option value="">- Tulis manual di bawah -</option>${list.map((a,i)=>`<option value="${i}">${escapeHtml(a.tp.slice(0,90))}${a.tp.length>90?"...":""}</option>`).join("")}</select>`;
}
function aiRefreshTp(kelasSelId, mapelSelId, tpHolderId){
  const kelasId = document.getElementById(kelasSelId).value;
  const mapel = document.getElementById(mapelSelId).value;
  document.getElementById(tpHolderId).innerHTML = aiTpSelect(tpHolderId+"_sel", kelasId, mapel);
}

/* ---- D1. GENERATOR: TP (Tujuan Pembelajaran) ---- */
PAGES.aiTP = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout">
    <div class="card">
      <h3>${ic("book",18)} AI Generator: Tujuan Pembelajaran (TP)</h3>
      <div class="field"><label>Kelas</label>${aiKelasSelect("at_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("at_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshElemen('at_kelas','at_mapel','at_elemenHolder')">${ic("check",13)} Muat Elemen/CP</button></div></div>
      <div class="field"><label>Elemen / CP acuan</label><div id="at_elemenHolder">${aiElemenSelect("at_elemenHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
      <div class="field"><label>Jumlah TP yang diinginkan</label><input type="number" id="at_jumlah" value="4" min="2" max="10"></div>
      <div class="field"><label>Semester</label>${aiSemesterSelect("at_semester")}</div>
      <div class="field"><label>Format Rumusan TP</label><select id="at_format">
        <option value="standar">Standar — kompetensi + lingkup materi, terukur (disarankan)</option>
        <option value="abcd">ABCD (Audience-Behavior-Condition-Degree)</option>
      </select></div>
      <div class="field"><label>Sebaran Level Kognitif</label><select id="at_level">
        <option value="berjenjang">Berjenjang C1 → C6 (disarankan)</option>
        <option value="c1c3">Fokus C1–C3 (untuk Fase A)</option>
        <option value="hots">Minimal 2 TP HOTS (C4–C6)</option>
      </select></div>
      <div class="field"><label>Catatan Konteks Kelas (opsional)</label><textarea id="at_konteks" placeholder="mis. Banyak siswa belum lancar membaca; utamakan respons lisan & benda konkret"></textarea></div>
      <button class="btn btn-primary" style="width:100%;" onclick="generateAiTP()">${ic("star",16)} Generate TP</button>
    </div>
    <div id="at_result"></div>
  </div>`;
};
function generateAiTP(){
  const kelasId = document.getElementById("at_kelas").value;
  const mapel = document.getElementById("at_mapel").value;
  const cList = aiCpListForKelasMapel(kelasId, mapel);
  const elIdx = document.getElementById("at_elemenHolder_sel") ? document.getElementById("at_elemenHolder_sel").value : "0";
  const cpEntry = cList[elIdx] || cList[0] || {elemen:"-", cp:"-"};
  const jumlah = document.getElementById("at_jumlah").value || 4;
  const semester = document.getElementById("at_semester").value;
  const formatTp = document.getElementById("at_format").value;
  const levelOpt = document.getElementById("at_level").value;
  const konteks = document.getElementById("at_konteks").value.trim();
  const cls = classInfo(kelasId);
  const formatTxt = formatTp==="abcd"
    ? "format ABCD — identifikasi eksplisit Audience, Behavior, Condition, dan Degree pada tiap TP"
    : "format standar — kompetensi + lingkup materi yang jelas dan terukur";
  const levelTxt = levelOpt==="c1c3"
    ? "fokus level C1–C3 (mengingat, memahami, mengaplikasikan)"
    : levelOpt==="hots"
    ? "berjenjang dengan minimal 2 TP pada level HOTS (C4–C6)"
    : "berjenjang dari C1 hingga C6 (sederhana ke kompleks)";
  const prompt = `Susun DAFTAR TUJUAN PEMBELAJARAN (TP) untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester}, elemen "${cpEntry.elemen}", berdasarkan Capaian Pembelajaran (CP) berikut:
"${cpEntry.cp}"
${konteks?`\nKonteks kelas: ${konteks}\n`:""}
Buat sebanyak ${jumlah} Tujuan Pembelajaran yang: diturunkan langsung dan konsisten dari CP di atas (jangan mengubah maknanya); dirumuskan dengan ${formatTxt}; disusun berjenjang dengan sebaran level kognitif ${levelTxt}; menggunakan kata kerja operasional (KKO) yang tepat.
Untuk Fase A (kelas 1-2): prioritaskan kompetensi sesuai perkembangan dengan ruang untuk respons lisan, praktik, gambar, gerak, atau benda konkret.

ACUAN STANDAR: CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025; proses sesuai Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Jangan mengarang regulasi.

Keluarkan hasil sebagai TABEL HTML dengan kolom: No | Rumusan Tujuan Pembelajaran | Lingkup Materi | Kata Kerja Operasional | Estimasi Alokasi (JP). Beri judul dokumen di atas tabel yang mencantumkan mapel, kelas, elemen, dan semester.

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;
  const title = "TP - "+mapel+" - "+cls.label+" - "+cpEntry.elemen;
  aiRunGenerate("at_result", {type:"TP", title, userPrompt: prompt});
}

/* ---- D2. GENERATOR: JURNAL MENGAJAR ---- */
PAGES.aiJurnal = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout">
    <div class="card">
      <h3>${ic("clock",18)} AI Generator: Jurnal Mengajar Harian</h3>
      <div class="field"><label>Kelas</label>${aiKelasSelect("aj_kelas", kelasId)}</div>
      <div class="field"><label>Tanggal</label><input type="date" id="aj_tanggal" value="${todayISO()}"></div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("aj_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('aj_kelas','aj_mapel','aj_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
      <div class="field"><label>Tujuan Pembelajaran (TP)</label><div id="aj_tpHolder">${aiTpSelect("aj_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div>
        <textarea id="aj_tpManual" placeholder="Atau tulis TP manual di sini (opsional, akan dipakai bila dipilih '- Tulis manual -')" style="margin-top:6px;"></textarea></div>
      <div class="field"><label>Materi</label><input type="text" id="aj_materi" placeholder="mis. Penjumlahan sampai 20"></div>
      <div class="field"><label>Jam Pelajaran</label><input type="text" id="aj_jam" placeholder="mis. 07.30 - 08.40"></div>
      <div class="field"><label>Catatan Pelaksanaan (opsional)</label><textarea id="aj_catatan" placeholder="mis. kendala, siswa tidak hadir, penyesuaian kegiatan, dsb."></textarea></div>
      <div class="grid grid-2">
        <div class="field"><label>Kesesuaian vs Rencana</label><select id="aj_sesuai">
          <option>Sesuai rencana</option>
          <option>Sebagian disesuaikan</option>
          <option>Banyak penyesuaian</option>
        </select></div>
        <div class="field"><label>Tindak Lanjut (opsional)</label><input type="text" id="aj_tindaklanjut" placeholder="mis. Besok diulang dgn alat peraga; 3 siswa remedial"></div>
      </div>
      <button class="btn" style="width:100%;margin-bottom:8px;" onclick="aiJurnalAmbilRencana()">${ic("calendar",15)} Ambil Materi & TP dari Rencana Minggu Ini</button>
      <button class="btn btn-primary" style="width:100%;" onclick="generateAiJurnal()">${ic("star",16)} Generate Jurnal Mengajar</button>
    </div>
    <div id="aj_result"></div>
  </div>`;
};
function generateAiJurnal(){
  const kelasId = document.getElementById("aj_kelas").value;
  const tanggal = document.getElementById("aj_tanggal").value;
  const mapel = document.getElementById("aj_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("aj_tpHolder_sel") ? document.getElementById("aj_tpHolder_sel").value : "";
  const tpManual = document.getElementById("aj_tpManual").value.trim();
  const tp = tpManual || (atpList[tpIdx] ? atpList[tpIdx].tp : "(sesuaikan dengan materi)");
  const materi = document.getElementById("aj_materi").value.trim() || "-";
  const jam = document.getElementById("aj_jam").value.trim() || "-";
  const catatan = document.getElementById("aj_catatan").value.trim();
  const sesuai = document.getElementById("aj_sesuai").value;
  const tindaklanjut = document.getElementById("aj_tindaklanjut").value.trim();
  if(!tanggal){ toast("Isi dulu: Tanggal."); document.getElementById("aj_tanggal").focus(); return; }
  if(materi==="-"||materi.length<3){ toast("Isi dulu: Materi."); document.getElementById("aj_materi").focus(); return; }
  const cls = classInfo(kelasId);
  const kehadiranHari = db.kehadiran[tanggal] || {};
  const totalSiswa = db.siswa.length;
  const hadir = Object.values(kehadiranHari).filter(v=>v==="H").length || totalSiswa;
  const tidakHadir = totalSiswa - hadir;
  const prompt = `Susun satu entri JURNAL MENGAJAR HARIAN resmi (jurnal kelas/agenda guru) dengan data berikut:
- Hari/Tanggal: ${fmtDate(tanggal)}
- Kelas: ${cls.label}
- Mata Pelajaran: ${mapel}
- Jam Pelajaran: ${jam}
- Tujuan Pembelajaran: ${tp}
- Materi: ${materi}
- Jumlah Siswa: ${totalSiswa} (Hadir: ${hadir}, Tidak Hadir: ${tidakHadir})
- Catatan pelaksanaan dari guru (jika ada): ${catatan || "tidak ada catatan khusus"}
- Kesesuaian dengan rencana: ${sesuai}
${tindaklanjut?"- Tindak lanjut yang direncanakan guru: "+tindaklanjut+"\n":""}
Susun dengan format HTML terstruktur berisi: (1) Tabel identitas jurnal, (2) Kegiatan Pendahuluan, (3) Kegiatan Inti (uraikan tahap Memahami - Mengaplikasi - Merefleksi sesuai prinsip Pembelajaran Mendalam yang berkesadaran, bermakna, dan menggembirakan, relevan dengan materi di atas), (4) Kegiatan Penutup, (5) Refleksi Guru (evaluasi singkat ketercapaian TP; bila pelaksanaan tidak sesuai rencana, jelaskan penyesuaiannya secara faktual), (6) Tindak Lanjut (rencana perbaikan/pengayaan/remedial yang konkret${tindaklanjut?"; kembangkan dari rencana guru di atas":""}). Tulis dengan bahasa formal namun natural seperti catatan guru profesional, bukan template kosong. Bedakan fakta pelaksanaan, interpretasi, dan rencana.`;
  const title = "Jurnal Mengajar - "+mapel+" - "+fmtDate(tanggal);
  aiRunGenerate("aj_result", {type:"Jurnal Mengajar", title, userPrompt: prompt});
}
/* Ambil Materi & TP otomatis dari Rencana Pembelajaran Kelas 1 (44-rencana.js),
   berdasarkan mapel + tanggal yang dipilih (v3: entri bertanggal aktual). */
function aiJurnalAmbilRencana(){
  const mapel = document.getElementById("aj_mapel").value;
  const tgl = document.getElementById("aj_tanggal").value || todayISO();
  const list = (typeof RENCANA_PBL!=="undefined") ? RENCANA_PBL : [];
  let it = list.find(r=>r.m===mapel && r.t===tgl);
  let label = fmtDate(tgl), note = "";
  if(!it){
    // fallback: entri mapel tsb. pada minggu yang sama
    const d = new Date(tgl+"T00:00:00");
    if(isNaN(d.getTime())){ toast("Tanggal tidak valid."); return; }
    const monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay()+6)%7));
    const p2 = n=>String(n).padStart(2,"0");
    const iso = monday.getFullYear()+"-"+p2(monday.getMonth()+1)+"-"+p2(monday.getDate());
    const sun = new Date(monday); sun.setDate(monday.getDate()+7);
    const isoSun = sun.getFullYear()+"-"+p2(sun.getMonth()+1)+"-"+p2(sun.getDate());
    it = list.find(r=>r.m===mapel && r.t>=iso && r.t<isoSun);
    if(it){ label = "minggu "+fmtDate(iso); note = " — tanggal persis tidak ada, diambil yang terdekat minggu itu."; }
  }
  if(!it){ toast("Tidak ada Rencana Pembelajaran untuk mapel ini pada "+label+"."); return; }
  document.getElementById("aj_materi").value = it.mat;
  document.getElementById("aj_tpManual").value = it.tp;
  toast("Materi & TP diambil dari Rencana "+label+" ("+(it.per||"")+")"+note);
}

/* ---- D3. GENERATOR ASESMEN FORMATIF ---- */
const AI_BENTUK_SOAL = ["Pilihan Ganda","Pilihan Ganda Kompleks","Isian Singkat","Uraian/Esai","Menjodohkan","Unjuk Kerja/Praktik","Observasi/Ceklis"];
const AI_LEVEL_KOGNITIF = ["C1 - Mengingat","C2 - Memahami","C3 - Mengaplikasikan","C4 - Menganalisis","C5 - Mengevaluasi","C6 - Mencipta (HOTS)"];

function aiAsesmenFormBlock(prefix, kelasId, jenisLabel){
  return `<div class="field"><label>Kelas</label>${aiKelasSelect(prefix+"_kelas", kelasId)}</div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect(prefix+"_mapel", MAPEL_LIST[0])}
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('${prefix}_kelas','${prefix}_mapel','${prefix}_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    <div class="field"><label>Tujuan Pembelajaran (TP) acuan</label><div id="${prefix}_tpHolder">${aiTpSelect(prefix+"_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
    <div class="field"><label>Materi</label><input type="text" id="${prefix}_materi" placeholder="mis. Bangun Datar Sederhana"></div>
    <div class="field"><label>Jumlah Soal/Item</label><input type="number" id="${prefix}_jumlah" value="5" min="1" max="20"></div>
    <div class="field"><label>Bentuk Soal/Instrumen</label>${aiCheckGrid(prefix+"_bentuk", AI_BENTUK_SOAL, false)}</div>
    <div class="field"><label>Level Kognitif</label>${aiCheckGrid(prefix+"_level", AI_LEVEL_KOGNITIF, false)}</div>`;
}
function aiAsesmenPromptCommon(prefix, jenis){
  const kelasId = document.getElementById(prefix+"_kelas").value;
  const mapel = document.getElementById(prefix+"_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById(prefix+"_tpHolder_sel") ? document.getElementById(prefix+"_tpHolder_sel").value : "";
  const tp = atpList[tpIdx] ? atpList[tpIdx].tp : "(disesuaikan dengan materi)";
  const materi = document.getElementById(prefix+"_materi").value.trim() || "-";
  const jumlah = document.getElementById(prefix+"_jumlah").value || 5;
  const bentuk = aiGetChecked(prefix+"_bentuk");
  const level = aiGetChecked(prefix+"_level");
  const cls = classInfo(kelasId);
  return {kelasId, mapel, tp, materi, jumlah, bentuk, level, cls};
}

PAGES.aiAsesForm = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Asesmen Formatif</h3>
    <p class="hint" style="margin-bottom:10px;">Instrumen umpan balik selama proses pembelajaran berlangsung.</p>
    ${aiAsesmenFormBlock("af", kelasId)}
    <div class="grid grid-2">
      <div class="field"><label>Jenis Asesmen</label><select id="af_jenis">
        <option value="formatif">Formatif — umpan balik proses (disarankan)</option>
        <option value="diagnostik">Diagnostik awal — pengetahuan prasyarat &amp; miskonsepsi</option>
      </select></div>
      <div class="field"><label>Durasi Pengerjaan</label><select id="af_durasi">
        <option>≤5 menit (exit ticket)</option>
        <option>10–15 menit</option>
        <option>1 JP</option>
      </select></div>
    </div>
    <div class="field"><label><input type="checkbox" id="af_tindaklanjut" checked style="width:auto;margin-right:6px;">Sertakan rencana tindak lanjut (umpan balik)</label></div>
    ${aiPresetSelectHtml("af_preset","⚡ Preset Cepat",[
      {value:"kuis",label:"Kuis Kilat — 3 soal pilihan ganda (C1–C2)"},
      {value:"latihan",label:"Latihan Pemahaman — 5 soal PG + isian (C2–C3)"},
      {value:"unjukkerja",label:"Unjuk Kerja/Praktik — 2 item observasi"}
    ],"aiApplyPresetAsesForm")}
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiAsesForm()">${ic("star",16)} Generate Asesmen Formatif</button>
  </div><div id="af_result"></div></div>`;
};
function generateAiAsesForm(){
  const c = aiAsesmenPromptCommon("af","formatif");
  const jenis = document.getElementById("af_jenis").value;
  const durasi = document.getElementById("af_durasi").value;
  const pakaiTL = document.getElementById("af_tindaklanjut").checked;
  if(!c.materi || c.materi==="-" || c.materi.trim().length<3){ toast("Isi dulu: Materi."); document.getElementById("af_materi").focus(); return; }
  const isDiag = jenis==="diagnostik";
  const jenisTxt = isDiag ? "ASESMEN DIAGNOSTIK AWAL" : "INSTRUMEN ASESMEN FORMATIF";
  let n = 1;
  const sec = [];
  // Aturan opsi PG (keputusan guru): kelas 1 = 3 opsi (a, b, c); kelas 2+ = 4 opsi.
  const pgOpsiAf = c.cls.angka===1 ? {labelTitik:"a., b., c."} : {labelTitik:"a., b., c., d."};
  sec.push((n++)+". BLOK IDENTITAS ringkas (tengah, tebal): judul \""+jenisTxt+"\", lalu baris Mapel: "+c.mapel+" | Kelas: "+c.cls.label+" | Hari/tanggal: ............");
  sec.push((n++)+". Kisi-kisi singkat (tabel HTML: No | Indikator Soal | Bentuk | Level Kognitif).");
  sec.push((n++)+". Soal/item bernomor + kunci jawaban / kriteria jawaban benar.");
  if(isDiag) sec.push((n++)+". Panduan interpretasi hasil untuk guru (memetakan: pengetahuan prasyarat, miskonsepsi umum, siswa yang sudah siap).");
  sec.push((n++)+". Rubrik penilaian sederhana skala 1-4 dengan deskriptor konkret tiap level.");
  if(pakaiTL) sec.push((n++)+". Rencana tindak lanjut: umpan balik untuk siswa yang belum mencapai TP.");
  const prompt = `Susun ${jenisTxt} untuk mata pelajaran ${c.mapel}, kelas ${c.cls.label} (Fase ${faseForClassId(c.kelasId)}), materi "${c.materi}", TP acuan: "${c.tp}".
Buat ${c.jumlah} soal/item${c.bentuk.length?" dalam bentuk: "+c.bentuk.join(", "):" dalam bentuk campuran yang sesuai"}${c.level.length?", pada level kognitif: "+c.level.join(", "):""}.
Durasi pengerjaan: ${durasi}.

ACUAN STANDAR: Permendikbudristek No. 21/2022 tentang Standar Penilaian; Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Instrumen ini untuk UMPAN BALIK, bukan penentu nilai rapor.
${AI_PANDUAN_2019_KAIDAH}
FORMAT PENGETIKAN (siap cetak Word): akhiri soal isian dengan " …."; simbol matematika berspasi (3 x 4 = 12); opsi PG tiap baris dengan label huruf kecil (${pgOpsiAf.labelTitik}).
KOP (baris Nama, logo, identitas sekolah, garis tebal) SUDAH ditambahkan otomatis oleh sistem — JANGAN membuat kop.

STRUKTUR OUTPUT WAJIB (HTML):
${sec.join("\n")}

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;
  const title = (isDiag?"Asesmen Diagnostik":"Asesmen Formatif")+" - "+c.mapel+" - "+c.cls.label+" - "+c.materi;
  aiRunGenerate("af_result", {type: isDiag?"Asesmen Formatif":"Asesmen Formatif", title, userPrompt: prompt});
}
/* Preset cepat Asesmen Formatif: mengisi jumlah, bentuk, dan level kognitif. */
function aiApplyPresetAsesForm(key){
  if(!key) return;
  const P = {
    kuis:       {jumlah:3, bentuk:["Pilihan Ganda"], level:["C1 - Mengingat","C2 - Memahami"]},
    latihan:    {jumlah:5, bentuk:["Pilihan Ganda","Isian Singkat"], level:["C2 - Memahami","C3 - Mengaplikasikan"]},
    unjukkerja: {jumlah:2, bentuk:["Unjuk Kerja/Praktik"], level:[]},
  }[key];
  if(!P) return;
  document.getElementById("af_jumlah").value = P.jumlah;
  aiSetChecked("af_bentuk", P.bentuk);
  aiSetChecked("af_level", P.level);
  toast("Preset diterapkan — tinggal isi Materi & TP, lalu Generate.");
}

/* ---------- E1. AI: RUBRIK PENILAIAN ---------- */
const AI_JENIS_RUBRIK = ["Sikap (Profil Lulusan)","Pengetahuan (Tes Tertulis)","Keterampilan (Unjuk Kerja/Praktik)","Produk/Karya","Proyek","Presentasi"];
PAGES.aiRubrik = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Rubrik Penilaian</h3>
    <div class="field"><label>Kelas</label>${aiKelasSelect("ar_kelas", kelasId)}</div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("ar_mapel", MAPEL_LIST[0])}
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('ar_kelas','ar_mapel','ar_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    <div class="field"><label>Tujuan Pembelajaran / Aktivitas yang dinilai</label><div id="ar_tpHolder">${aiTpSelect("ar_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
    <div class="field"><label>Nama Tugas/Aktivitas (opsional)</label><input type="text" id="ar_tugas" placeholder="mis. Presentasi hasil pengamatan tumbuhan"></div>
    <div class="field"><label>Jenis Rubrik</label><select id="ar_jenis">${AI_JENIS_RUBRIK.map(j=>`<option>${j}</option>`).join("")}</select></div>
    <div class="field"><label>Kriteria yang dinilai (checklist, tambahkan sesuai kebutuhan di hasil AI)</label>${aiCheckGrid("ar_kriteria", ["Ketepatan konsep/isi","Kejelasan penyampaian","Kreativitas","Kerja sama","Kemandirian","Ketepatan waktu","Kerapian hasil kerja"], false)}</div>
    <div class="grid grid-2">
      <div class="field"><label>Jumlah Kriteria</label><input type="number" id="ar_jmlKriteria" value="4" min="3" max="6"></div>
      <div class="field"><label>Skala Penilaian</label><select id="ar_skala"><option>1-4 (Belum Berkembang / Mulai Berkembang / Berkembang Sesuai Harapan / Sangat Berkembang)</option><option>1-4 (Angka sederhana)</option><option>0-100</option></select></div>
    </div>
    ${aiPresetSelectHtml("ar_preset","⚡ Preset Cepat",[
      {value:"unjukkerja",label:"Rubrik Unjuk Kerja/Praktik"},
      {value:"sikap",label:"Rubrik Sikap / Profil Lulusan"},
      {value:"produk",label:"Rubrik Produk/Karya"}
    ],"aiApplyPresetRubrik")}
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiRubrik()">${ic("star",16)} Generate Rubrik</button>
  </div><div id="ar_result"></div></div>`;
};
function generateAiRubrik(){
  const kelasId = document.getElementById("ar_kelas").value;
  const mapel = document.getElementById("ar_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("ar_tpHolder_sel") ? document.getElementById("ar_tpHolder_sel").value : "";
  const tp = atpList[tpIdx] ? atpList[tpIdx].tp : "(sesuai aktivitas/tugas yang dinilai)";
  const tugas = document.getElementById("ar_tugas").value.trim() || "(sesuai TP terkait)";
  const jenis = document.getElementById("ar_jenis").value;
  const kriteria = aiGetChecked("ar_kriteria");
  const skala = document.getElementById("ar_skala").value;
  const jmlKriteria = Math.max(3, Math.min(6, parseInt(document.getElementById("ar_jmlKriteria").value||"4",10)));
  const cls = classInfo(kelasId);
  const prompt = `Susun RUBRIK PENILAIAN ${jenis.toUpperCase()} untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Tujuan Pembelajaran: "${tp}", tugas/aktivitas: "${tugas}".
Kriteria yang wajib dinilai (${jmlKriteria} kriteria): ${kriteria.length?kriteria.slice(0,jmlKriteria).join(", "):"tentukan sendiri "+jmlKriteria+" kriteria yang paling relevan dengan tugas di atas"}.
Skala penilaian: ${skala}.

PEDOMAN PENSKORAN (Panduan Penilaian Tertulis 2019): tetapkan rentang skor per kriteria; tiap level dirinci kualitasnya secara konkret dan dapat diamati guru (observable), bukan kalimat umum — contoh pola: level terendah = tidak sesuai kriteria; berikutnya = sebagian kecil sesuai; berikutnya = sebagian besar sesuai; tertinggi = hampir seluruhnya/seluruhnya sesuai kriteria.

Keluarkan sebagai TABEL HTML dengan kolom: Kriteria | Deskriptor Level Tertinggi | Deskriptor Level Menengah-Atas | Deskriptor Level Menengah-Bawah | Deskriptor Level Terendah. Tambahkan di bawah tabel: cara menghitung nilai akhir dari rubrik ini.

ACUAN STANDAR: Permendikbudristek No. 21/2022 tentang Standar Penilaian; Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025).

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;
  const title = "Rubrik Penilaian - "+jenis+" - "+mapel+" - "+cls.label;
  aiRunGenerate("ar_result", {type:"Rubrik Penilaian", title, userPrompt: prompt});
}
/* Preset cepat Rubrik: mengisi jenis rubrik, kriteria, dan skala sekaligus. */
function aiApplyPresetRubrik(key){
  if(!key) return;
  const SKALA4 = "1-4 (Belum Berkembang / Mulai Berkembang / Berkembang Sesuai Harapan / Sangat Berkembang)";
  const P = {
    unjukkerja: {jenis:"Keterampilan (Unjuk Kerja/Praktik)", kriteria:["Ketepatan konsep/isi","Kemandirian","Ketepatan waktu"], skala:SKALA4},
    sikap:      {jenis:"Sikap (Profil Lulusan)", kriteria:["Kerja sama","Kemandirian","Ketepatan waktu"], skala:SKALA4},
    produk:     {jenis:"Produk/Karya", kriteria:["Kreativitas","Kerapian hasil kerja","Ketepatan konsep/isi"], skala:SKALA4},
  }[key];
  if(!P) return;
  document.getElementById("ar_jenis").value = P.jenis;
  aiSetChecked("ar_kriteria", P.kriteria);
  document.getElementById("ar_skala").value = P.skala;
  toast("Preset diterapkan — tinggal isi TP/tugas, lalu Generate.");
}

/* Kaidah tambahan dari Panduan Penilaian Tertulis 2019 (Pusat Penilaian Pendidikan,
   Kemendikdasmen; repositori.kemendikdasmen.go.id/18344) — melengkapi kaidah di
   systemPrompt. Catatan adaptasi: panduan ini memakai istilah KD (era K13);
   untuk Kurikulum Merdeka dipetakan ke TP. */
const AI_PANDUAN_2019_KAIDAH = `
KAIDAH TAMBAHAN (Panduan Penilaian Tertulis 2019, Pusat Penilaian Pendidikan):
A. KISI-KISI — format matriks: IDENTITAS (jenjang SD, mata pelajaran, kurikulum, jumlah soal) + MATRIKS (TP, materi, indikator soal, level kognitif C1–C6, nomor soal, bentuk soal). Syarat kisi-kisi baik: mewakili isi kurikulum; komponen rinci & jelas; setiap indikator dapat dibuat soalnya.
B. PILIHAN GANDA — (1) Satu butir memakai SATU kata kerja operasional. (2) Pokok soal + opsi hanya memuat pernyataan yang diperlukan (tidak bertele-tele). (3) Kata/frasa yang berulang di semua opsi dipindah ke pokok soal. (4) Stimulus (gambar/tabel/grafik/diagram) harus jelas, berfungsi, dan kontekstual; satu stimulus boleh dipakai untuk beberapa butir soal. (5) Bahasa baku sesuai kaidah Bahasa Indonesia.
C. ISIAN/JAWABAN SINGKAT — (1) Isian memakai kalimat pernyataan; jawaban singkat memakai kalimat tanya. (2) Jawaban yang dituntut singkat & pasti (kata, frasa, angka, simbol). (3) Tepat satu kunci jawaban. (4) Satu butir tidak boleh memuat informasi yang membantu menjawab butir lain.
D. URAIAN — (1) Batasan pertanyaan dan jawaban yang diharapkan harus JELAS. (2) Gunakan kata tanya/perintah yang menuntut jawaban terurai. (3) Pokok soal logis dari segi materi.
E. PEDOMAN PENSKORAN URAIAN — (1) Uraian objektif: tulis semua kata kunci jawaban; tiap kata kunci skor 1; sub-pertanyaan dirinci per kata kunci; jumlahkan = skor maksimum. (2) Uraian nonobjektif: tetapkan kriteria + rentang skor (0 s.d. maks sesuai kompleksitas); tiap rentang dirinci kualitasnya (0=tidak sesuai kriteria, 1=sebagian kecil sesuai, 2=sebagian besar sesuai, 3=hampir seluruhnya sesuai). (3) Bobot tiap soal mempertimbangkan: kedalaman/keluasan materi, kerumitan jawaban, level kognitif. (4) Nilai tiap soal = (skor perolehan / skor maksimum) × bobot; jumlahkan menjadi nilai akhir.
F. TELAAH MANDIRI — setelah menyusun, telaah tiap butir terhadap kaidah di atas; klasifikasikan: DITERIMA (sesuai kaidah), DIREVISI (sebagian kaidah — sebutkan yang diperbaiki), DITOLAK (tidak sesuai indikator — ganti butir baru).
`;

/* ---------- E2. AI: BANK SOAL (PG + Isian + Uraian + HOTS, satu generator fleksibel) ---------- */
PAGES.aiBankSoal = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Bank Soal</h3>
    <details style="margin-bottom:12px;background:var(--primary-ghost);border:1px solid var(--primary);border-radius:12px;padding:10px 14px;">
      <summary style="cursor:pointer;font-weight:800;font-size:13px;">📖 Panduan &amp; Kaidah Penyusunan (klik untuk buka)</summary>
      <div class="hint" style="font-size:12.5px;line-height:1.8;margin-top:8px;">
        <strong>Langkah:</strong> pilih <em>jenis penilaian</em> → isi materi &amp; TP → atur jumlah tiap bentuk soal → Generate. AI otomatis menyusun <strong>kisi-kisi</strong>, <strong>soal</strong>, dan <strong>kunci jawaban + pedoman penskoran</strong>.<br><br>
        <strong>Kaidah yang diterapkan AI</strong> (sesuai pedoman penulisan soal):
        <ol style="padding-left:18px;margin:6px 0;">
          <li><strong>Materi:</strong> soal sesuai indikator/TP; pilihan jawaban homogen &amp; logis; tepat satu kunci jawaban.</li>
          <li><strong>Konstruksi:</strong> pokok soal jelas &amp; tegas; tidak memberi petunjuk jawaban; hindari negatif ganda; panjang opsi relatif sama; tanpa opsi "semua benar/salah"; angka diurutkan; gambar/tabel jelas &amp; berfungsi; soal tidak bergantung pada soal lain.</li>
          <li><strong>Bahasa:</strong> kaidah Bahasa Indonesia yang baik, komunikatif, tidak memakai bahasa daerah/tabu.</li>
        </ol>
        <strong>Sumber kaidah:</strong> <em>Panduan Penilaian Tertulis 2019</em> (Pusat Penilaian Pendidikan, Kemendikdasmen) — kisi-kisi, kaidah PG/isian/uraian, pedoman penskoran, dan telaah butir soal; istilah KD pada panduan dipetakan ke TP (Kurikulum Merdeka).<br>
        <strong>Format cetak Word:</strong> kertas F4, margin 2,5 cm, Times New Roman 12, spasi 1,5; akhir soal isian " …." (spasi + 4 titik); simbol matematika berspasi (3 x 4 = 12).
        <br><span class="muted">Selalu tinjau ulang hasil generate sebelum digunakan — guru penanggung jawab akhir kualitas soal.</span>
      </div>
    </details>
    <div class="grid grid-3">
      <div class="field"><label>Kelas</label>${aiKelasSelect("ab_kelas", kelasId)}</div>
      <div class="field"><label>Semester</label>${aiSemesterSelect("ab_semester")}</div>
      <div class="field"><label>Waktu (menit)</label><input type="number" id="ab_waktu" value="60" min="15" max="180"><div class="hint">Untuk blok identitas naskah.</div></div>
    </div>
    ${aiPresetSelectHtml("ab_preset","⚡ Preset Cepat",[
      {value:"uh",label:"Ulangan Harian Lingkup Materi (PG 10 · Isian 5 · Uraian 2)"},
      {value:"sts",label:"Sumatif Tengah Semester / STS (PG 15 · Isian 5 · Uraian 3)"},
      {value:"sas",label:"Sumatif Akhir Semester / SAS (PG 20 · Isian 5 · Uraian 5)"},
      {value:"pr",label:"Latihan / PR Harian (PG 5 · Isian 3 · Uraian 2)"}
    ],"aiApplyPresetBankSoal")}
    <div class="field"><label>Jenis Penilaian</label><select id="ab_jenis">
      <option value="Ulangan Harian">Ulangan Harian (akhir bab/lingkup materi)</option>
      <option value="PR">PR / Tugas Rumah</option>
      <option value="STS 1">Sumatif Tengah Semester (STS) — Semester 1</option>
      <option value="STS 2">Sumatif Tengah Semester (STS) — Semester 2</option>
      <option value="SAS 1">Sumatif Akhir Semester (SAS) — Semester 1</option>
      <option value="SAS 2">Sumatif Akhir Semester (SAS) — Semester 2</option>
    </select></div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("ab_mapel", MAPEL_LIST[0])}
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('ab_kelas','ab_mapel','ab_tpHolder')">Muat Ulang TP</button></div></div>
    <div class="field"><label>Tujuan Pembelajaran acuan</label><div id="ab_tpHolder">${aiTpSelect("ab_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div>
      <input type="text" id="ab_tpManual" placeholder="atau tulis TP/indikator manual..." style="margin-top:6px;"></div>
    <div class="field"><label>Lingkup Materi / Bab</label><input type="text" id="ab_materi" placeholder="mis. Bab 3: Pengurangan (untuk UH) / Semua materi semester (untuk STS/SAS)"></div>
    <div class="field"><label>Komposisi Soal</label>
      <div class="grid grid-3">
        <div class="field" style="margin-bottom:0;"><label style="font-size:11.5px;">Pilihan Ganda</label><input type="number" id="ab_jmlPG" value="10" min="0" max="40"></div>
        <div class="field" style="margin-bottom:0;"><label style="font-size:11.5px;">Isian Singkat</label><input type="number" id="ab_jmlIsian" value="5" min="0" max="30"></div>
        <div class="field" style="margin-bottom:0;"><label style="font-size:11.5px;">Uraian</label><input type="number" id="ab_jmlUraian" value="3" min="0" max="20"></div>
      </div>
      <div class="hint" style="margin-top:4px;">Contoh: PG 15, Isian 3, Uraian 2 — kosongkan (0) bila tidak dipakai.</div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>Sebaran Level Kognitif</label><select id="ab_hots">
        <option value="campuran">Campuran + min. 30% HOTS C4–C6 (disarankan)</option>
        <option value="l1">Fokus C1–C3 (pengetahuan &amp; pemahaman)</option>
        <option value="hots">Fokus HOTS C4–C6 (analisis–kreasi)</option>
      </select></div>
      <div class="field"><label>Cakupan TP</label><select id="ab_cakupan">
        <option value="terpilih">TP terpilih di atas</option>
        <option value="semester">Seluruh TP semester ini</option>
      </select><div class="hint" style="margin-top:4px;">Pilih "Seluruh TP" untuk STS/SAS multi-bab.</div></div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>Konteks Soal</label><select id="ab_konteks">
        <option>Kehidupan sehari-hari siswa Indonesia (disarankan)</option>
        <option>Netral</option>
      </select></div>
      <div class="field"><label>Ilustrasi Gambar</label><select id="ab_ilustrasi">
        <option value="otomatis">Otomatis (disarankan utk Fase A)</option>
        <option value="ya">Ya, sertakan deskripsi ilustrasi</option>
        <option value="tidak">Tidak perlu</option>
      </select>
      <div class="hint" style="margin-top:4px;">AI menyisipkan <em>deskripsi ilustrasi</em> (mis. "[Ilustrasi: gambar 5 apel...]") agar guru mudah menggambar/menempelkan gambar.</div></div>
    </div>
    <div class="field"><label><input type="checkbox" id="ab_kisi" checked style="width:auto;margin-right:6px;">Sertakan KISI-KISI (tabel: No | Materi | Indikator/TP | Bentuk Soal | No. Soal)</label></div>
    <div class="field"><label><input type="checkbox" id="ab_kunci" checked style="width:auto;margin-right:6px;">Sertakan KUNCI JAWABAN + pedoman penskoran</label></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiBankSoal()">${ic("star",16)} Generate Bank Soal</button>
  </div><div id="ab_result"></div></div>`;
};
function generateAiBankSoal(){
  const kelasId = document.getElementById("ab_kelas").value;
  const semester = document.getElementById("ab_semester").value;
  const jenis = document.getElementById("ab_jenis").value;
  const mapel = document.getElementById("ab_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("ab_tpHolder_sel") ? document.getElementById("ab_tpHolder_sel").value : "";
  const tpPilih = (tpIdx!=="" && atpList[tpIdx]) ? atpList[tpIdx].tp : "";
  const tpManual = document.getElementById("ab_tpManual").value.trim();
  const tp = tpManual || tpPilih || "(sesuai materi)";
  const materi = document.getElementById("ab_materi").value.trim() || "-";
  const jmlPG = parseInt(document.getElementById("ab_jmlPG").value||0,10);
  const jmlIsian = parseInt(document.getElementById("ab_jmlIsian").value||0,10);
  const jmlUraian = parseInt(document.getElementById("ab_jmlUraian").value||0,10);
  const hots = document.getElementById("ab_hots").value;
  const ilustrasi = document.getElementById("ab_ilustrasi").value;
  const cakupan = document.getElementById("ab_cakupan").value;
  const konteks = document.getElementById("ab_konteks").value;
  const pakaiKisi = document.getElementById("ab_kisi").checked;
  const pakaiKunci = document.getElementById("ab_kunci").checked;
  const cls = classInfo(kelasId);
  const fase = faseForClassId(kelasId);
  const s = db.sekolah;
  // Aturan opsi PG (keputusan guru): kelas 1 = 3 opsi (a, b, c); kelas 2+ = 4 opsi.
  const pgOpsi = cls.angka===1 ? {n:3, label:"a, b, c", labelTitik:"a., b., c.", instr:"a, b, ATAU c"} : {n:4, label:"a, b, c, d", labelTitik:"a., b., c., d.", instr:"a, b, c, ATAU d"};
  const waktu = Math.max(15, Math.min(180, parseInt(document.getElementById("ab_waktu").value||"60",10)));
  const ta = ((db.sekolah&&db.sekolah.tahunAjaran)||"2026/2027").replace("/"," / ");
  const JUDUL_UJIAN = {"Ulangan Harian":"ULANGAN HARIAN","PR":"PEKERJAAN RUMAH","STS 1":"SUMATIF TENGAH SEMESTER I","STS 2":"SUMATIF TENGAH SEMESTER II","SAS 1":"SUMATIF AKHIR SEMESTER I","SAS 2":"SUMATIF AKHIR SEMESTER II"}[jenis]||jenis.toUpperCase();
  const judulNaskah = JUDUL_UJIAN+" SEKOLAH DASAR";
  if(jmlPG+jmlIsian+jmlUraian===0){ toast("Isi minimal 1 soal (PG/Isian/Uraian)."); return; }
  const bagian = [];
  if(jmlPG>0) bagian.push(jmlPG+" soal Pilihan Ganda ("+pgOpsi.n+" opsi "+pgOpsi.label+")");
  if(jmlIsian>0) bagian.push(jmlIsian+" soal Isian Singkat");
  if(jmlUraian>0) bagian.push(jmlUraian+" soal Uraian");
  const levelTxt = hots==="campuran" ? "Gunakan sebaran level kognitif C1-C6 yang proporsional untuk jenjang SD (dominan C1-C3) dengan MINIMAL 30% soal pada level HOTS C4-C6 yang kontekstual."
    : hots==="hots" ? "Fokus pada soal HOTS level C4 (menganalisis), C5 (mengevaluasi), C6 (mencipta) yang kontekstual untuk siswa SD."
    : "Fokus pada level C1 (mengingat), C2 (memahami), C3 (mengaplikasikan).";
  const cakupanTxt = cakupan==="semester"
    ? "Cakupan: SELURUH TP semester ini — kisi-kisi wajib mencakup tiap bab/unit yang telah dipelajari semester ini; bila lingkup materi di atas tidak mencukupi, TOLAK dengan pesan jelas dan minta guru mempersempit cakupan."
    : "Cakupan: TP terpilih di atas.";
  const konteksTxt = konteks.indexOf("Indonesia")>=0
    ? "Gunakan skenario/fenomena nyata dari kehidupan sehari-hari siswa Indonesia sebagai konteks soal."
    : "Konteks soal netral.";
  const ilusTxt = ilustrasi==="tidak" ? ""
    : ilustrasi==="ya" ? "Sertakan DESKRIPSI ILUSTRASI pada soal-soal yang terbantu gambar, dengan format [Ilustrasi: deskripsi rinci gambar]."
    : (fase==="A" ? "Karena ini Fase A (kelas 1-2), SERTAKAN deskripsi ilustrasi sederhana pada soal-soal yang terbantu gambar, format [Ilustrasi: deskripsi rinci]." : "Sertakan deskripsi ilustrasi [Ilustrasi: ...] hanya bila benar-benar membantu pemahaman soal.");
  const prompt = `Susun ${jenis.toUpperCase()} untuk SD sesuai Kurikulum Merdeka (pembelajaran mendalam).

IDENTITAS
- Satuan Pendidikan: ${s.namaSekolah}
- Kelas/Semester: ${cls.label} / Semester ${semester} (${semester==="1"?"Ganjil":"Genap"}) — Fase ${fase}
- Mata Pelajaran: ${mapel}
- Lingkup Materi: ${materi}
- Acuan TP/Indikator: ${tp}
- Judul Naskah: ${judulNaskah} — TAHUN PELAJARAN ${ta} — Waktu: ${waktu} menit
- ${cakupanTxt}
- ${konteksTxt}

KOMPOSISI SOAL — buat tepat: ${bagian.join("; ")}.
${levelTxt}
${ilusTxt}

KAIDAH PENULISAN SOAL (WAJIB dipatuhi):
[Materi] (1) Soal harus sesuai indikator/TP. (2) Pilihan jawaban homogen & logis, pengecoh berfungsi. (3) Tepat satu jawaban benar.
[Konstruksi] (4) Pokok soal jelas & tegas. (5) Hanya memuat pernyataan yang diperlukan. (6) Tidak memberi petunjuk ke jawaban benar. (7) Hindari pernyataan negatif ganda. (8) Panjang opsi relatif sama. (9) Tanpa opsi "semua jawaban benar/salah". (10) Opsi angka diurutkan kecil→besar. (11) Soal tidak bergantung pada jawaban soal lain.
[Bahasa] (12) Bahasa Indonesia yang baik & komunikatif, sesuai jenjang SD. (13) Tanpa bahasa daerah/tabu. (14) Jumlah opsi pilihan ganda: kelas 1 = 3 opsi (a, b, c); kelas 2 ke atas = 4 opsi (a, b, c, d).
${AI_PANDUAN_2019_KAIDAH}
FORMAT PENGETIKAN NASKAH (siap cetak Word, kertas F4):
- Akhiri pokok soal isian dengan " …." (spasi + empat titik); blank di tengah kalimat ditulis " … " (spasi + tiga titik + spasi).
- Simbol matematika: beri spasi sebelum & sesudah operator (contoh: 3 x 4 = 12); gunakan × untuk perkalian, bukan huruf X.
- Opsi PG: tiap opsi pada baris tersendiri dengan label huruf kecil (${pgOpsi.labelTitik}); nomor soal "1.", "2.", dst.

ACUAN STANDAR: Permendikbudristek No. 21/2022 tentang Standar Penilaian; Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025); kaidah Panduan Penilaian Tertulis 2019 (Pusat Penilaian Pendidikan). Jangan mengarang regulasi.

STRUKTUR OUTPUT (HTML, gunakan heading h2/h3):
${pakaiKisi ? "1. KISI-KISI — TABEL HTML. Identitas: jenjang SD, mata pelajaran, kurikulum, jumlah soal. Matriks: No | TP | Materi | Indikator Soal | Level Kognitif (C1–C6) | Bentuk Soal | Nomor Soal. Syarat: mewakili isi kurikulum; tampilkan rekap distribusi level kognitif di bawah tabel.\n" : ""}2. NASKAH SOAL — format naskah ujian siap cetak. KOP (baris Nama, logo, identitas sekolah, garis tebal) SUDAH ditambahkan otomatis oleh sistem — JANGAN membuat kop. Susun persis struktur berikut:
   a. BLOK IDENTITAS (tengah, tebal): judul "${judulNaskah}", baris "TAHUN PELAJARAN ${ta}", lalu "Mapel : ${mapel}", "Kelas : ${cls.label}", "Waktu : ${waktu} menit", "Hari / tanggal : ............". Akhiri dengan paragraf pemisah <p class="soal-sep">------------------------------------------------------------</p>.
   b. "PETUNJUK UMUM :" (tebal) + daftar bernomor: (1) Tulislah namamu di sudut kanan atas! (2) Bacalah setiap soal dengan teliti! (3) Kerjakan lebih dulu soal yang kamu anggap paling mudah! (4) Periksa kembali pekerjaanmu sebelum kamu serahkan kepada Bapak atau Ibu Guru! Akhiri dengan paragraf pemisah yang sama.
   c. Bagian per bentuk soal (hanya yang jumlahnya >0; penomoran bagian I, II, III), masing-masing diawali instruksi bagian (tebal). Contoh untuk Pilihan Ganda: "I. BERILAH TANDA SILANG (X) PADA HURUF ${pgOpsi.instr} DI DEPAN JAWABAN YANG PALING TEPAT!" — sesuaikan huruf/jumlah opsi dengan komposisi.
   d. Butir soal: PG ditulis "1. pokok soal …." dengan opsi tiap baris ("a. ..."); Isian berupa kalimat pernyataan dengan blank; Uraian dengan perintah dan batasan jawaban yang jelas. Nomor soal berurutan 1 s.d. total.
${pakaiKunci ? "3. KUNCI JAWABAN — daftar per nomor soal.\n4. PEDOMAN PENSKORAN — PG: skor 1 per butir benar; Isian: skor 1 per kunci tepat; Uraian: ikuti kaidah E di atas (kata kunci/rentang skor + bobot + rumus Nilai = (skor perolehan / skor maksimum) × bobot). Tampilkan cara hitung nilai akhir.\n5. TELAAH MANDIRI — tabel singkat: No. Soal | Status (Diterima/Direvisi/Ditolak) | Catatan; atau pernyataan seluruh butir memenuhi kaidah." : ""}
Tulis siap cetak. Bahasa formal namun ramah anak SD Indonesia.

CATATAN: Hasil ini draf awal — guru wajib menelaah tiap butir soal dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;
  const title = jenis+" - "+mapel+" - "+cls.label+" - Smt "+semester+" - "+materi;
  aiRunGenerate("ab_result", {type:"Bank Soal", title, userPrompt: prompt});
}
/* Preset cepat Bank Soal: mengisi jenis, komposisi, level, ilustrasi, kisi & kunci. */
function aiApplyPresetBankSoal(key){
  if(!key) return;
  const sem = document.getElementById("ab_semester").value;
  const P = {
    uh:  {jenis:"Ulangan Harian", pg:10, isian:5, uraian:2, hots:"campuran", ilus:"otomatis", kisi:true,  kunci:true},
    sts: {jenis: sem==="2"?"STS 2":"STS 1", pg:15, isian:5, uraian:3, hots:"campuran", ilus:"otomatis", kisi:true, kunci:true},
    sas: {jenis: sem==="2"?"SAS 2":"SAS 1", pg:20, isian:5, uraian:5, hots:"campuran", ilus:"otomatis", kisi:true, kunci:true},
    pr:  {jenis:"PR", pg:5, isian:3, uraian:2, hots:"l1", ilus:"otomatis", kisi:false, kunci:true},
  }[key];
  if(!P) return;
  document.getElementById("ab_jenis").value = P.jenis;
  document.getElementById("ab_jmlPG").value = P.pg;
  document.getElementById("ab_jmlIsian").value = P.isian;
  document.getElementById("ab_jmlUraian").value = P.uraian;
  document.getElementById("ab_hots").value = P.hots;
  document.getElementById("ab_ilustrasi").value = P.ilus;
  document.getElementById("ab_kisi").checked = P.kisi;
  document.getElementById("ab_kunci").checked = P.kunci;
  toast("Preset diterapkan — tinggal isi Materi & TP, lalu Generate.");
}

/* ---------- E3. AI: PENGAYAAN & REMEDIAL ---------- */
PAGES.aiPengRem = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("star",18)} AI Generator: Pengayaan & Remedial</h3>
    <div class="field"><label>Kelas</label>${aiKelasSelect("ap_kelas", kelasId)}</div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("ap_mapel", MAPEL_LIST[0])}
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('ap_kelas','ap_mapel','ap_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    <div class="field"><label>Tujuan Pembelajaran acuan</label><div id="ap_tpHolder">${aiTpSelect("ap_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
    <div class="field"><label>Materi</label><input type="text" id="ap_materi" placeholder="mis. Pecahan Sederhana"></div>
    <div class="field"><label>Jenis Kegiatan</label><select id="ap_jenis"><option value="keduanya">Pengayaan dan Remedial (keduanya)</option><option value="pengayaan">Pengayaan saja (siswa sudah tuntas)</option><option value="remedial">Remedial saja (siswa belum tuntas)</option></select></div>
    <div class="field"><label>Kesulitan yang dialami siswa (untuk Remedial, opsional)</label><textarea id="ap_kesulitan" placeholder="mis. masih keliru membandingkan pecahan berpenyebut beda"></textarea></div>
    <button class="btn" style="width:100%;margin-bottom:8px;" onclick="aiPengRemAmbilAnalisis()">${ic("bar",15)} Ambil dari Analisis Nilai</button>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiPengRem()">${ic("star",16)} Generate Pengayaan & Remedial</button>
  </div><div id="ap_result"></div></div>`;
};
function generateAiPengRem(){
  const kelasId = document.getElementById("ap_kelas").value;
  const mapel = document.getElementById("ap_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("ap_tpHolder_sel") ? document.getElementById("ap_tpHolder_sel").value : "";
  const tp = atpList[tpIdx] ? atpList[tpIdx].tp : "(sesuai materi)";
  const materi = document.getElementById("ap_materi").value.trim() || "-";
  const jenis = document.getElementById("ap_jenis").value;
  const kesulitan = document.getElementById("ap_kesulitan").value.trim();
  const cls = classInfo(kelasId);
  let bagian = "";
  if(jenis!=="remedial") bagian += `\nBagian PENGAYAAN: untuk peserta didik yang sudah mencapai/melampaui TP, susun kegiatan pengayaan yang menantang, kontekstual, dan tetap menyenangkan (proyek mini/eksplorasi lanjutan), lengkap dengan instruksi kegiatan dan lembar kerja singkat.`;
  if(jenis!=="pengayaan") bagian += `\nBagian REMEDIAL: untuk peserta didik yang belum mencapai TP${kesulitan?" (kesulitan yang teramati: "+kesulitan+")":""}, susun kegiatan remedial dengan pendekatan berbeda dari pembelajaran awal, disertai latihan terbimbing bertahap dan instrumen cek pemahaman ulang.`;
  const prompt = `Susun rencana KEGIATAN PENGAYAAN DAN REMEDIAL untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), materi "${materi}", Tujuan Pembelajaran: "${tp}".${bagian}
Tulis dalam format HTML terstruktur, siap digunakan langsung oleh guru tanpa revisi lebih lanjut.`;
  const title = "Pengayaan & Remedial - "+mapel+" - "+cls.label+" - "+materi;
  aiRunGenerate("ap_result", {type:"Pengayaan & Remedial", title, userPrompt: prompt});
}
/* Ambil materi terlemah + konteks kesulitan otomatis dari menu Analisis Nilai
   (45-analisis.js), berdasarkan mapel terpilih & semester aktif. */
function aiPengRemAmbilAnalisis(){
  const mapel = document.getElementById("ap_mapel").value;
  const semSel = aiSemDefault();
  if(typeof analisisCompute!=="function"){ toast("Modul Analisis Nilai belum tersedia."); return; }
  const comp = analisisCompute(mapel, semSel);
  if(!comp.rows.length){ toast("Belum ada nilai sumatif untuk "+mapel+" semester "+semSel+". Isi dulu via Input Nilai Massal."); return; }
  if(!comp.lmLemah){ toast("Belum ada data lingkup materi yang bisa dianalisis."); return; }
  document.getElementById("ap_materi").value = comp.lmLemah.lm;
  document.getElementById("ap_kesulitan").value =
    "Rata-rata kelas pada materi \""+comp.lmLemah.lm+"\" = "+(Math.round(comp.lmLemah.avg*10)/10)+
    " (terendah). "+comp.remedial.length+" siswa belum tuntas (ambang "+comp.ambang+"): "+
    (comp.remedial.map(x=>x.s.nama).join(", ")||"-")+".";
  document.getElementById("ap_jenis").value = "keduanya";
  toast("Diambil dari Analisis Nilai: "+mapel+" (semester "+semSel+").");
}

/* ---------- E4. AI: SURAT UNTUK ORANG TUA ---------- */
const AI_JENIS_SURAT_ORTU = ["Undangan Pertemuan Orang Tua","Pemberitahuan Kegiatan Sekolah","Pemanggilan Orang Tua (Konsultasi)","Apresiasi Perkembangan Anak","Peringatan Ketidakhadiran/Kedisiplinan","Izin Kegiatan di Luar Sekolah (Study Tour dsb.)"];
PAGES.aiSuratOrtu = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("parent",18)} AI Generator: Surat untuk Orang Tua</h3>
    <div class="field"><label>Kelas</label>${aiKelasSelect("aso_kelas", kelasId)}</div>
    <div class="field"><label>Jenis Surat</label><select id="aso_jenis">${AI_JENIS_SURAT_ORTU.map(j=>`<option>${j}</option>`).join("")}</select></div>
    <div class="field"><label>Ditujukan Kepada</label><select id="aso_target"><option value="">Seluruh Orang Tua/Wali Kelas</option>${siswaOpts().map(o=>`<option value="${o.value}">Orang Tua/Wali dari ${escapeHtml(o.label)}</option>`).join("")}</select></div>
    <div class="field"><label>Tanggal Surat</label><input type="date" id="aso_tanggal" value="${todayISO()}"></div>
    <div class="field"><label>Tanggal/Waktu Kegiatan (jika relevan)</label><input type="text" id="aso_waktuKegiatan" placeholder="mis. Sabtu, 20 September 2026 pukul 08.00 WIB"></div>
    <div class="field"><label>Detail Tambahan (opsional)</label><textarea id="aso_detail" placeholder="mis. tempat kegiatan, hal yang perlu dibawa, atau alasan spesifik pemanggilan"></textarea></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiSuratOrtu()">${ic("star",16)} Generate Surat</button>
  </div><div id="aso_result"></div></div>`;
};
function generateAiSuratOrtu(){
  const kelasId = document.getElementById("aso_kelas").value;
  const jenis = document.getElementById("aso_jenis").value;
  const targetId = document.getElementById("aso_target").value;
  const tanggal = document.getElementById("aso_tanggal").value;
  const waktuKegiatan = document.getElementById("aso_waktuKegiatan").value.trim();
  const detail = document.getElementById("aso_detail").value.trim();
  const cls = classInfo(kelasId);
  const s = db.sekolah;
  const wali = (db.guru||[]).find(g=>g.id===s.waliKelasId) || {};
  const namaSiswa = targetId ? (db.siswa.find(x=>x.id===targetId)||{}).nama : "";
  const prompt = `Susun SURAT RESMI SEKOLAH untuk orang tua/wali peserta didik dengan ketentuan:
- Jenis surat: ${jenis}
- Sekolah: ${s.namaSekolah}, alamat: ${s.alamat}, ${s.desa}, Kec. ${s.kecamatan}, Kab. ${s.kabupaten}
- Kelas: ${cls.label}
- Ditujukan kepada: ${namaSiswa ? "Orang Tua/Wali dari ananda "+namaSiswa : "Orang Tua/Wali Peserta Didik "+cls.label}
- Tanggal surat: ${fmtDate(tanggal)}
- Waktu/tanggal kegiatan terkait (jika ada): ${waktuKegiatan||"-"}
- Detail tambahan: ${detail||"-"}
- Ditandatangani oleh Guru Kelas: ${wali.nama||"-"} (NIP ${wali.nip||"-"}), mengetahui Kepala Sekolah: ${s.kepalaSekolah||"-"} (NIP ${s.nipKepsek||"-"})

Format surat resmi sekolah lengkap: nomor surat (boleh placeholder ".../..../${new Date(tanggal).getFullYear()}"), perihal, tanggal, salam pembuka, isi surat yang jelas dan sopan sesuai jenis surat di atas, salam penutup, dan blok tanda tangan Guru Kelas (kiri/kanan sesuai konvensi surat dinas Indonesia). JANGAN sertakan kop surat/kepala surat (sudah disediakan terpisah oleh sistem).`;
  const title = "Surat "+jenis+(namaSiswa?" - "+namaSiswa:" - "+cls.label);
  aiRunGenerate("aso_result", {type:"Surat Orang Tua", title, userPrompt: prompt});
}

/* ================= FASE 2 (13 Okt 2026): Prota, Promes, Alokasi Waktu,
   Bahan Ajar, KKTP, Refleksi ================= */

/* ---------- F2. GENERATOR: PROTA ---------- */
function aiProtaHitungKalender(){
  const k1 = aiKalenderMingguEfektif("1"), k2 = aiKalenderMingguEfektif("2");
  if(k1.efektif) document.getElementById("apr_mef1").value = k1.efektif;
  if(k2.efektif) document.getElementById("apr_mef2").value = k2.efektif;
  document.getElementById("apr_kalInfo").innerHTML = aiKalenderInfoHtml("1")+"<br>"+aiKalenderInfoHtml("2");
  toast("Minggu efektif dihitung ulang dari kalender.");
}
PAGES.aiProta = function(){
  const kelasId = activeClassId;
  const ta = (db.sekolah&&db.sekolah.tahunAjaran)||"2026/2027";
  const k1 = aiKalenderMingguEfektif("1"), k2 = aiKalenderMingguEfektif("2");
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("calendar",18)} AI Generator: Program Tahunan (Prota)</h3>
    <details style="margin-bottom:12px;background:var(--primary-ghost);border:1px solid var(--primary);border-radius:12px;padding:10px 14px;">
      <summary style="cursor:pointer;font-weight:800;font-size:13px;">📖 Panduan Pengisian (klik untuk buka)</summary>
      <ol class="hint" style="font-size:12.5px;line-height:1.9;padding-left:18px;margin:8px 0 0;">
        <li><strong>Minggu efektif</strong> terisi otomatis dari kalender pendidikan — klik <em>Hitung Ulang</em> bila kalender diperbarui. Bisa diubah manual.</li>
        <li><strong>JP/minggu</strong> — alokasi jam pelajaran mapel ini per minggu.</li>
        <li><strong>Pekan asesmen/cadangan</strong> — pekan untuk STS/SAS & cadangan per semester.</li>
        <li><strong>Kerangka bab/unit</strong> — opsional; kosongkan agar AI memetakan dari CP.</li>
      </ol>
    </details>
    <div class="grid grid-2">
      <div class="field"><label>Kelas</label>${aiKelasSelect("apr_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("apr_mapel", MAPEL_LIST[0])}</div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>Tahun Ajaran</label><input type="text" id="apr_ta" value="${escapeHtml(ta)}"></div>
      <div class="field"><label>JP per Minggu</label><input type="number" id="apr_jp" value="4" min="1" max="12"></div>
    </div>
    <div class="field"><label>Kalender Pendidikan</label><div id="apr_kalInfo">${aiKalenderInfoHtml("1")}<br>${aiKalenderInfoHtml("2")}</div>
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiProtaHitungKalender()">${ic("check",13)} Hitung Ulang dari Kalender</button></div></div>
    <div class="grid grid-3">
      <div class="field"><label>Minggu Efektif Smt 1</label><input type="number" id="apr_mef1" value="${k1.efektif||16}" min="10" max="26"></div>
      <div class="field"><label>Minggu Efektif Smt 2</label><input type="number" id="apr_mef2" value="${k2.efektif||16}" min="10" max="26"></div>
      <div class="field"><label>Pekan Asesmen/Cadangan per Semester</label><input type="number" id="apr_cad" value="3" min="0" max="8"><div class="hint">STS/SAS + cadangan.</div></div>
    </div>
    <div class="field"><label>Kerangka Bab/Unit (opsional)</label><textarea id="apr_bab" placeholder="mis. Bab 1: Bilangan Cacah; Bab 2: Penjumlahan; … (kosongkan — AI susun dari CP)"></textarea></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiProta()">${ic("star",16)} Generate Prota</button>
  </div><div id="apr_result"></div></div>`;
};
function generateAiProta(){
  const kelasId = document.getElementById("apr_kelas").value;
  const mapel = document.getElementById("apr_mapel").value;
  const ta = document.getElementById("apr_ta").value.trim()||"2026/2027";
  const jp = Math.max(1, Math.min(12, parseInt(document.getElementById("apr_jp").value||"4",10)));
  const mef1 = Math.max(10, Math.min(26, parseInt(document.getElementById("apr_mef1").value||"16",10)));
  const mef2 = Math.max(10, Math.min(26, parseInt(document.getElementById("apr_mef2").value||"16",10)));
  const cad = Math.max(0, Math.min(8, parseInt(document.getElementById("apr_cad").value||"3",10)));
  const bab = document.getElementById("apr_bab").value.trim();
  const cList = aiCpListForKelasMapel(kelasId, mapel);
  const cls = classInfo(kelasId);
  const jp1 = (mef1-cad)*jp, jp2 = (mef2-cad)*jp;
  const cpText = cList.length ? cList.map(c=>"- "+c.elemen+": "+c.cp).join("\n") : "(gunakan CP standar Fase "+faseForClassId(kelasId)+" untuk mapel ini sesuai Kep. Kepala BSKAP No. 046/H/KR/2025)";
  const prompt = `Susun PROGRAM TAHUNAN (Prota) mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Tahun Ajaran ${ta}.

DATA WAKTU (dari kalender pendidikan):
- Semester 1: ${mef1} pekan efektif; Semester 2: ${mef2} pekan efektif.
- Alokasi: ${jp} JP/minggu. Pekan asesmen (STS/SAS) & cadangan per semester: ${cad} pekan.
- JP KBM Semester 1 = (${mef1}-${cad}) × ${jp} = ${jp1} JP; Semester 2 = (${mef2}-${cad}) × ${jp} = ${jp2} JP.
- Total JP KBM setahun = ${jp1+jp2} JP. Tampilkan perhitungan ini di dokumen.

Capaian Pembelajaran acuan:
${cpText}
${bab?"\nKerangka bab/unit dari guru:\n"+bab+"\n":""}
Ketentuan:
- Petakan seluruh elemen CP ke bab/unit selama 2 semester, proporsional terhadap keluasan materi dan total JP KBM.
- Alokasikan pekan asesmen & cadangan secara eksplisit (tandai di kolom Keterangan).
- Jangan mengarang minggu efektif — gunakan angka di atas; bila ragu tandai [perlu verifikasi].

ACUAN STANDAR: CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025 (jangan mengubah maknanya); proses sesuai Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025); kurikulum sesuai Permendikbudristek No. 12/2024 jo. Permendikdasmen No. 13/2025. Jangan mengarang regulasi.

STRUKTUR OUTPUT WAJIB (HTML):
1. Identitas (tabel kecil). 2. Rekapitulasi perhitungan JP (tampilkan hitungan di atas). 3. Tabel per semester: No | Bab/Unit | TP Pokok | Alokasi (JP & pekan) | Semester | Keterangan.

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata sekolah sebelum digunakan.`;
  const title = "Prota - "+mapel+" - "+cls.label+" - "+ta;
  aiRunGenerate("apr_result", {type:"Prota", title, userPrompt: prompt});
}

/* ---------- F2. GENERATOR: PROMES ---------- */
function aiPromesHitungKalender(){
  const sem = document.getElementById("apm_semester").value;
  const k = aiKalenderMingguEfektif(sem);
  if(k.efektif) document.getElementById("apm_mef").value = k.efektif;
  document.getElementById("apm_kalInfo").innerHTML = aiKalenderInfoHtml(sem);
  if(k.khusus.length) document.getElementById("apm_khusus").value = k.khusus.map(x=>x.tanggal+": "+x.judul).join("\n");
  toast("Dihitung ulang dari kalender (Semester "+sem+").");
}
PAGES.aiPromes = function(){
  const kelasId = activeClassId;
  const ta = (db.sekolah&&db.sekolah.tahunAjaran)||"2026/2027";
  const k = aiKalenderMingguEfektif("1");
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("calendar",18)} AI Generator: Program Semester (Promes)</h3>
    <div class="grid grid-2">
      <div class="field"><label>Kelas</label>${aiKelasSelect("apm_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("apm_mapel", MAPEL_LIST[0])}</div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>Semester</label><select id="apm_semester" onchange="aiPromesHitungKalender()"><option value="1">Semester 1 (Ganjil)</option><option value="2">Semester 2 (Genap)</option></select></div>
      <div class="field"><label>Tahun Ajaran</label><input type="text" id="apm_ta" value="${escapeHtml(ta)}"></div>
    </div>
    <div class="field"><label>Acuan Prota (opsional)</label><textarea id="apm_prota" placeholder="Tempel ringkasan Prota semester ini (atau dari Riwayat hasil Prota). Kosongkan — AI susun dari CP."></textarea></div>
    <div class="field"><label>Kalender Pendidikan</label><div id="apm_kalInfo">${aiKalenderInfoHtml("1")}</div>
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiPromesHitungKalender()">${ic("check",13)} Hitung Ulang dari Kalender</button></div></div>
    <div class="grid grid-2">
      <div class="field"><label>Minggu Efektif</label><input type="number" id="apm_mef" value="${k.efektif||16}" min="10" max="26"></div>
      <div class="field"><label>JP per Minggu</label><input type="number" id="apm_jp" value="4" min="1" max="12"></div>
    </div>
    <div class="field"><label>Minggu Khusus (asesmen/libur — bisa diubah)</label><textarea id="apm_khusus" placeholder="mis. 2026-12-01: SAS; …">${k.khusus.map(x=>escapeHtml(x.tanggal+": "+x.judul)).join("\n")}</textarea></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiPromes()">${ic("star",16)} Generate Promes</button>
  </div><div id="apm_result"></div></div>`;
};
function generateAiPromes(){
  const kelasId = document.getElementById("apm_kelas").value;
  const mapel = document.getElementById("apm_mapel").value;
  const semester = document.getElementById("apm_semester").value;
  const ta = document.getElementById("apm_ta").value.trim()||"2026/2027";
  const prota = document.getElementById("apm_prota").value.trim();
  const mef = Math.max(10, Math.min(26, parseInt(document.getElementById("apm_mef").value||"16",10)));
  const jp = Math.max(1, Math.min(12, parseInt(document.getElementById("apm_jp").value||"4",10)));
  const khusus = document.getElementById("apm_khusus").value.trim();
  const cls = classInfo(kelasId);
  const total = mef*jp;
  const prompt = `Susun PROGRAM SEMESTER (Promes) mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester} (${semester==="1"?"Ganjil":"Genap"}), Tahun Ajaran ${ta}.
${prota?"\nAcuan Prota semester ini (WAJIB dijadikan dasar; bila distribusi menyimpang, tandai penyimpangannya + alasan):\n"+prota+"\n":"\nAcuan: susun dari Capaian Pembelajaran (Kep. Kepala BSKAP No. 046/H/KR/2025) untuk mapel ini.\n"}
ALOKASI (dari kalender pendidikan): ${mef} pekan efektif × ${jp} JP/minggu = ${total} JP.
Minggu khusus: ${khusus||"-"}

Ketentuan:
- Distribusikan bab/unit ke tiap pekan secara berurutan dan logis (prasyarat → kompleks).
- Sisakan pekan untuk STS/SAS, remedial/pengayaan, dan cadangan; tandai di kolom Keterangan.
- Estimasi rentang tanggal boleh dicantumkan dengan tanda [estimasi — sesuaikan kalender resmi].
- Jangan mengarang minggu efektif — gunakan angka di atas; bila ragu tandai [perlu verifikasi].

ACUAN STANDAR: CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025; proses sesuai Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Jangan mengarang regulasi.

STRUKTUR OUTPUT WAJIB (HTML):
Tabel: Pekan Ke | Perkiraan Tanggal [estimasi] | Bab/Unit | TP | JP | Keterangan (asesmen/libur/cadangan). Di bawah tabel: total JP & cek konsistensi (harus = ${total} JP).

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya dengan kondisi nyata sekolah sebelum digunakan.`;
  const title = "Promes - "+mapel+" - "+cls.label+" - Smt "+semester+" - "+ta;
  aiRunGenerate("apm_result", {type:"Promes", title, userPrompt: prompt});
}

/* ---------- F2. GENERATOR: ALOKASI WAKTU ---------- */
PAGES.aiAlokasi = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("clock",18)} AI Generator: Alokasi Waktu</h3>
    <p class="hint" style="margin-bottom:10px;">Membagi total JP semester ke tiap bab/unit secara proporsional. AI menampilkan penjumlahan pemeriksa — total harus pas.</p>
    <div class="grid grid-3">
      <div class="field"><label>Kelas</label>${aiKelasSelect("aaw_kelas", kelasId)}</div>
      <div class="field"><label>Semester</label>${aiSemesterSelect("aaw_semester")}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("aaw_mapel", MAPEL_LIST[0])}</div>
    </div>
    <div class="grid grid-3">
      <div class="field"><label>Total JP Semester</label><input type="number" id="aaw_total" value="64" min="10" max="200"><div class="hint">Dari Promes.</div></div>
      <div class="field"><label>Jumlah Bab/Unit</label><input type="number" id="aaw_nbab" value="6" min="2" max="15"></div>
      <div class="field"><label>JP Cadangan</label><input type="number" id="aaw_cad" value="4" min="0" max="40"><div class="hint">Remedial/pengayaan.</div></div>
    </div>
    <div class="field"><label>Daftar Bab/Unit</label><textarea id="aaw_bab" placeholder="mis. Bab 1: Bilangan Cacah&#10;Bab 2: Penjumlahan&#10;… (satu baris per bab)"></textarea></div>
    <div class="field"><label>Cara Pembobotan</label><select id="aaw_cara" onchange="document.getElementById('aaw_manualWrap').style.display=this.value==='manual'?'':'none'">
      <option value="otomatis">Otomatis proporsional (disarankan)</option>
      <option value="manual">Manual per bab</option>
    </select></div>
    <div class="field" id="aaw_manualWrap" style="display:none;"><label>Bobot Manual (JP per bab, urut sesuai daftar)</label><textarea id="aaw_manual" placeholder="mis. Bab 1: 12 JP&#10;Bab 2: 8 JP&#10;…"></textarea>
      <div class="hint">Jumlah bobot harus = Total JP − Cadangan.</div></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiAlokasi()">${ic("star",16)} Generate Alokasi Waktu</button>
  </div><div id="aaw_result"></div></div>`;
};
function generateAiAlokasi(){
  const kelasId = document.getElementById("aaw_kelas").value;
  const semester = document.getElementById("aaw_semester").value;
  const mapel = document.getElementById("aaw_mapel").value;
  const total = Math.max(10, Math.min(200, parseInt(document.getElementById("aaw_total").value||"64",10)));
  const nbab = Math.max(2, Math.min(15, parseInt(document.getElementById("aaw_nbab").value||"6",10)));
  const cad = Math.max(0, Math.min(40, parseInt(document.getElementById("aaw_cad").value||"4",10)));
  const bab = document.getElementById("aaw_bab").value.trim();
  const cara = document.getElementById("aaw_cara").value;
  const manual = document.getElementById("aaw_manual").value.trim();
  const cls = classInfo(kelasId);
  if(cara==="manual" && !manual){ toast("Isi dulu: Bobot Manual per bab."); document.getElementById("aaw_manual").focus(); return; }
  const efektif = total - cad;
  if(efektif<=0){ toast("JP Cadangan tidak boleh >= Total JP."); return; }
  const prompt = `Hitung ALOKASI WAKTU mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester}.

DATA:
- Total JP semester: ${total} JP; JP cadangan: ${cad} JP; JP efektif: ${efektif} JP; jumlah bab/unit: ${nbab}.
- Cara pembobotan: ${cara==="manual"?"MANUAL per bab (data guru di bawah)":"OTOMATIS proporsional (pertimbangkan keluasan CP per bab — Kep. Kepala BSKAP No. 046/H/KR/2025)"}.
${bab?"Daftar bab/unit:\n"+bab+"\n":""}${cara==="manual"?"Bobot manual dari guru:\n"+manual+"\n":""}
ATURAN KERAS: jumlah alokasi per bab + cadangan HARUS = ${total} JP tepat. Tampilkan PENJUMLAHAN PEMERIKSA di bawah tabel; bila tidak pas, perbaiki sebelum menyajikan.

Keluarkan TABEL HTML: No | Bab/Unit | Bobot/Proporsi | Alokasi (JP) | Keterangan.
Di bawah tabel: penjumlahan pemeriksa + 1 kalimat penjelasan dasar pembobotan.

CATATAN: Hasil ini draf awal — guru wajib meninjau dan menyesuaikannya sebelum digunakan.`;
  const title = "Alokasi Waktu - "+mapel+" - "+cls.label+" - Smt "+semester;
  aiRunGenerate("aaw_result", {type:"Alokasi Waktu", title, userPrompt: prompt});
}

/* ---------- F2. GENERATOR: BAHAN AJAR ---------- */
const AI_JENIS_BAHAN = [
  "Ringkasan materi 1 halaman",
  "Penjelasan konsep + analogi lokal",
  "Cerita edukatif",
  "Materi pengayaan",
  "Modifikasi konteks lokal"
];
function aiBahanJenisOnChange(){
  const j = document.getElementById("abh_jenis").value;
  document.getElementById("abh_materiAsliWrap").style.display = j==="Modifikasi konteks lokal" ? "" : "none";
  document.getElementById("abh_settingWrap").style.display = j==="Cerita edukatif" ? "" : "none";
}
PAGES.aiBahanAjar = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("book",18)} AI Generator: Bahan Ajar</h3>
    <div class="grid grid-3">
      <div class="field"><label>Kelas</label>${aiKelasSelect("abh_kelas", kelasId)}</div>
      <div class="field"><label>Semester</label>${aiSemesterSelect("abh_semester")}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("abh_mapel", MAPEL_LIST[0])}</div>
    </div>
    <div class="field"><label>Materi / Topik</label><input type="text" id="abh_materi" placeholder="mis. Penjumlahan bilangan 1–20"></div>
    <div class="field"><label>Jenis Bahan Ajar</label><select id="abh_jenis" onchange="aiBahanJenisOnChange()">${AI_JENIS_BAHAN.map(j=>`<option>${j}</option>`).join("")}</select></div>
    <div class="field"><label>TP Acuan (opsional)</label><div id="abh_tpHolder">${aiTpSelect("abh_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div>
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('abh_kelas','abh_mapel','abh_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div>
      <input type="text" id="abh_tpManual" placeholder="atau tulis TP manual…" style="margin-top:6px;"></div>
    <div class="field"><label>Konteks Lokal (opsional)</label><input type="text" id="abh_konteks" placeholder="mis. Pasar Gerduren, sawah, angkot jurusan Purwokerto"></div>
    <div class="field" id="abh_materiAsliWrap" style="display:none;"><label>Tempel Materi Asli (wajib untuk jenis ini)</label><textarea id="abh_materiAsli" rows="5" placeholder="Tempel teks/poin materi standar yang akan dimodifikasi konteksnya…"></textarea></div>
    <div class="grid grid-2">
      <div class="field"><label>Target Panjang</label><select id="abh_panjang"><option>1 halaman A4 (disarankan)</option><option>2 halaman</option><option>Bebas</option></select></div>
      <div class="field" id="abh_settingWrap" style="display:none;"><label>Setting Cerita</label><select id="abh_setting"><option>Desa</option><option>Kota</option><option>Pesisir</option><option>Pegunungan</option></select></div>
    </div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiBahanAjar()">${ic("star",16)} Generate Bahan Ajar</button>
  </div><div id="abh_result"></div></div>`;
};
function generateAiBahanAjar(){
  const kelasId = document.getElementById("abh_kelas").value;
  const semester = document.getElementById("abh_semester").value;
  const mapel = document.getElementById("abh_mapel").value;
  const materi = document.getElementById("abh_materi").value.trim();
  const jenis = document.getElementById("abh_jenis").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("abh_tpHolder_sel") ? document.getElementById("abh_tpHolder_sel").value : "";
  const tp = document.getElementById("abh_tpManual").value.trim() || (tpIdx!==""&&atpList[tpIdx]?atpList[tpIdx].tp:"(diturunkan dari CP)");
  const konteks = document.getElementById("abh_konteks").value.trim();
  const materiAsli = document.getElementById("abh_materiAsli").value.trim();
  const panjang = document.getElementById("abh_panjang").value;
  const setting = document.getElementById("abh_setting").value;
  const cls = classInfo(kelasId);
  const fase = faseForClassId(kelasId);
  if(materi.length<3){ toast("Isi dulu: Materi / Topik."); document.getElementById("abh_materi").focus(); return; }
  if(jenis==="Modifikasi konteks lokal" && materiAsli.length<100){ toast("Tempel dulu materi asli (±100 karakter) untuk dimodifikasi."); document.getElementById("abh_materiAsli").focus(); return; }
  const usiaTokoh = fase==="A" ? "6–8" : fase==="B" ? "9–10" : "11–12";
  const CABANG = {
    "Ringkasan materi 1 halaman": `Judul besar → maksimal 7 poin utama (tiap poin 1–2 kalimat) → kotak "Istilah Penting" (5–8 kata kunci + definisi singkat) → kotak "Jangan Tertukar" (2–3 miskonsepsi umum + klarifikasinya) → kotak "Contoh Cepat" (2 aplikasi nyata) → 3 pertanyaan latihan mandiri.`,
    "Penjelasan konsep + analogi lokal": `1 analogi dari kehidupan sehari-hari siswa Indonesia (manfaatkan konteks lokal: ${konteks||"lingkungan sekitar siswa"}) → 1 contoh nyata yang bisa dilihat/dirasakan di lingkungan sekolah → ilustrasi langkah demi langkah yang bisa digambar di papan tulis → 1 kalimat inti/mnemonic yang mudah diingat → 3 pertanyaan guided discovery yang membimbing siswa menemukan sendiri konsepnya.`,
    "Cerita edukatif": `Cerita pendek 300–400 kata: tokoh anak usia ${usiaTokoh} tahun di Indonesia, setting ${setting}, gaya ringan dengan konflik kecil yang diselesaikan lewat penerapan konsep (konsep muncul alami dalam alur, bukan ceramah). Di akhir: 3 pertanyaan diskusi. Sisipkan 1 nilai Profil Pelajar Pancasila/Profil Lulusan secara alami lewat perilaku tokoh.`,
    "Materi pengayaan": `Aktivitas mandiri 1–2 pertemuan untuk siswa yang sudah menguasai materi: menantang tanpa terasa seperti hukuman; pendalaman konsep atau koneksi antar mapel; bisa dikerjakan mandiri tanpa banyak arahan guru; menghasilkan produk yang bisa dipresentasikan/dipajang.`,
    "Modifikasi konteks lokal": `Modifikasi materi di bawah agar relevan dengan konteks lokal (${konteks||"daerah siswa"}): ganti contoh umum dengan contoh lokal yang familier; tambahkan koneksi kearifan lokal/tradisi yang relevan; sesuaikan nama tokoh & skenario ke konteks Indonesia/daerah. PERTAHANKAN akurasi konten — hanya konteks & contoh yang diubah, bukan substansinya.\n\nMATERI ASLI:\n${materiAsli}`
  }[jenis];
  const gayaFase = fase==="A" ? "bahasa sederhana dan konkret sesuai dunia anak (kalimat pendek)" : "bahasa yang jelas dan mudah dipahami siswa";
  const prompt = `Susun BAHAN AJAR jenis "${jenis}" untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${fase}), Semester ${semester}, materi "${materi}". TP acuan: "${tp}".
Konteks lokal: ${konteks||"-"}. Target panjang: ${panjang}.

ACUAN STANDAR: CP sesuai Kep. Kepala BSKAP No. 046/H/KR/2025 (jangan mengubah makna CP); proses sesuai Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Jangan mengarang regulasi.
Aturan: gunakan ${gayaFase}; akurasi konten tidak boleh diubah — hanya konteks, contoh, dan kemasan yang disesuaikan.

STRUKTUR OUTPUT WAJIB (HTML) — ikuti persis:
${CABANG}

CATATAN: Hasil ini draf awal — guru wajib meninjau akurasi konten dan menyesuaikannya dengan kondisi nyata kelas sebelum digunakan.`;
  const title = "Bahan Ajar ("+jenis+") - "+mapel+" - "+cls.label+" - "+materi;
  aiRunGenerate("abh_result", {type:"Bahan Ajar", title, userPrompt: prompt});
}

/* ---------- F2. GENERATOR: KKTP ---------- */
const AI_TEKNIK_KKTP = ["Tes tertulis","Unjuk kerja/praktik","Observasi","Produk/karya","Portofolio"];
PAGES.aiKktp = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: KKTP</h3>
    <div class="card" style="margin-bottom:12px;border-left:4px solid var(--warn);background:var(--warn-ghost,transparent);">
      <span class="hint"><strong>Penting:</strong> KKTP ditetapkan oleh <strong>satuan pendidikan</strong> (mis. rapat dewan guru) — AI menyusun <strong>USULAN</strong> yang wajib ditetapkan/disesuaikan sekolah. Bukan ketentuan nasional.</span>
    </div>
    <div class="grid grid-3">
      <div class="field"><label>Kelas</label>${aiKelasSelect("akp_kelas", kelasId)}</div>
      <div class="field"><label>Semester</label>${aiSemesterSelect("akp_semester")}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("akp_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTpCheck('akp_kelas','akp_mapel','akp_tpHolder','akp_tp')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    </div>
    <div class="field"><label>TP yang Ditetapkan KKTP-nya</label><div id="akp_tpHolder">${aiTpCheckHtml("akp_tp", kelasId, MAPEL_LIST[0])}</div>
      <textarea id="akp_tpManual" placeholder="atau tambah TP manual (satu baris per TP)…" style="margin-top:6px;"></textarea></div>
    <div class="grid grid-2">
      <div class="field"><label>Skala Penilaian</label><select id="akp_skala">
        <option>1–4 (BB/MB/BSH/SB) (disarankan)</option>
        <option>0–100</option>
      </select></div>
      <div class="field"><label>Ambang Ketuntasan Awal (usulan)</label><input type="number" id="akp_ambang" value="75" min="0" max="100"><div class="hint">Untuk skala 0–100; sekolah menetapkan final.</div></div>
    </div>
    <div class="field"><label>Teknik/Bukti Ketercapaian</label>${aiCheckGrid("akp_teknik", AI_TEKNIK_KKTP, true)}</div>
    <div class="field"><label>Catatan Satuan Pendidikan (opsional)</label><textarea id="akp_catatan" placeholder="mis. KKTP ditetapkan dalam rapat dewan guru tanggal …"></textarea></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiKktp()">${ic("star",16)} Generate Usulan KKTP</button>
  </div><div id="akp_result"></div></div>`;
};
function generateAiKktp(){
  const kelasId = document.getElementById("akp_kelas").value;
  const semester = document.getElementById("akp_semester").value;
  const mapel = document.getElementById("akp_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpDipilih = aiGetChecked("akp_tp").map(i=>atpList[parseInt(i,10)]).filter(Boolean).map(a=>a.tp);
  const tpManual = document.getElementById("akp_tpManual").value.trim().split("\n").map(s=>s.trim()).filter(Boolean);
  const tpList = tpDipilih.concat(tpManual);
  const skala = document.getElementById("akp_skala").value;
  const ambang = document.getElementById("akp_ambang").value;
  const teknik = aiGetChecked("akp_teknik");
  const catatan = document.getElementById("akp_catatan").value.trim();
  const cls = classInfo(kelasId);
  if(!tpList.length){ toast("Pilih minimal 1 TP (atau tulis manual)."); return; }
  const prompt = `Susun USULAN KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester}.

TP yang ditetapkan KKTP-nya:
${tpList.map((t,i)=>(i+1)+". "+t).join("\n")}

Skala: ${skala}. ${skala.indexOf("0–100")>=0?"Usulan ambang ketuntasan awal: "+ambang+".":""}
Teknik/bukti ketercapaian: ${teknik.join(", ")||"disesuaikan per TP"}.
${catatan?"Catatan satuan pendidikan: "+catatan+"\n":""}
ACUAN STANDAR: Permendikbudristek No. 21/2022 tentang Standar Penilaian; Panduan Pembelajaran dan Asesmen (Edisi Revisi 2025). Jangan mengarang regulasi.

PENTING — tegaskan di dokumen: ini USULAN. KKTP resmi ditetapkan oleh satuan pendidikan (mis. melalui rapat dewan guru) dan dapat disesuaikan; bukan ketentuan nasional.

STRUKTUR OUTPUT WAJIB (HTML):
1. Identitas + pernyataan status usulan (tegas di bagian atas).
2. Tabel: No | Tujuan Pembelajaran | Indikator Ketercapaian | Kriteria per Level Skala (deskriptor konkret & observable per level) | Teknik/Bukti Penilaian.
3. Panduan penggunaan: cara membaca ketercapaian per TP; kapan siswa dinyatakan tuntas per TP; tindak lanjut (remedial/pengayaan).

CATATAN: Hasil ini draf awal — wajib ditetapkan/disesuaikan oleh satuan pendidikan sebelum digunakan.`;
  const title = "Usulan KKTP - "+mapel+" - "+cls.label+" - Smt "+semester;
  aiRunGenerate("akp_result", {type:"KKTP", title, userPrompt: prompt});
}

/* ---------- F2. GENERATOR: REFLEKSI PEMBELAJARAN (format standar) ---------- */
PAGES.aiRefleksi = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("book",18)} AI Generator: Refleksi Pembelajaran</h3>
    <p class="hint" style="margin-bottom:10px;">Refleksi format standar: hal yang berjalan baik → kendala → rencana tindak lanjut. Ceritakan pelaksanaan apa adanya — AI tidak mengarang kejadian.</p>
    <div class="grid grid-2">
      <div class="field"><label>Kelas</label>${aiKelasSelect("are_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("are_mapel", MAPEL_LIST[0])}</div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>Tanggal Pembelajaran</label><input type="date" id="are_tanggal" value="${todayISO()}"></div>
      <div class="field"><label>Topik / Materi</label><input type="text" id="are_topik" placeholder="mis. Penjumlahan sampai 20"></div>
    </div>
    <div class="field"><label>Cerita Pelaksanaan (wajib)</label><textarea id="are_cerita" rows="4" placeholder="Ceritakan apa adanya: apa yang berjalan baik, apa yang tidak, kejadian penting di kelas…"></textarea>
      <div class="hint">Minimal 50 karakter — tanpa bahan cerita, refleksi tidak bermakna.</div></div>
    <div class="grid grid-2">
      <div class="field"><label>Fokus Refleksi</label><select id="are_fokus">
        <option>Ketercapaian TP</option>
        <option>Keterlibatan siswa</option>
        <option>Pengelolaan kelas</option>
        <option>Penggunaan media/metode</option>
        <option>Bebas</option>
      </select></div>
      <div class="field"><label>TP Acuan (opsional)</label><div id="are_tpHolder">${aiTpSelect("are_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div>
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('are_kelas','are_mapel','are_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    </div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiRefleksi()">${ic("star",16)} Generate Refleksi</button>
  </div><div id="are_result"></div></div>`;
};
function generateAiRefleksi(){
  const kelasId = document.getElementById("are_kelas").value;
  const mapel = document.getElementById("are_mapel").value;
  const tanggal = document.getElementById("are_tanggal").value;
  const topik = document.getElementById("are_topik").value.trim();
  const cerita = document.getElementById("are_cerita").value.trim();
  const fokus = document.getElementById("are_fokus").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("are_tpHolder_sel") ? document.getElementById("are_tpHolder_sel").value : "";
  const tp = (tpIdx!==""&&atpList[tpIdx]) ? atpList[tpIdx].tp : "(sesuai topik)";
  const cls = classInfo(kelasId);
  if(!tanggal){ toast("Isi dulu: Tanggal Pembelajaran."); return; }
  if(topik.length<3){ toast("Isi dulu: Topik / Materi."); document.getElementById("are_topik").focus(); return; }
  if(cerita.length<50){ toast("Cerita pelaksanaan minimal 50 karakter — ceritakan apa adanya."); document.getElementById("are_cerita").focus(); return; }
  const prompt = `Susun REFLEKSI PEMBELAJARAN format standar untuk guru SD.

Konteks: Kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), ${mapel}, tanggal ${fmtDate(tanggal)}, topik "${topik}". TP acuan: "${tp}". Fokus: ${fokus}.

Cerita pelaksanaan dari guru (FAKTA — jangan menambah kejadian yang tidak diceritakan):
"${cerita}"

ACUAN: Permendikdasmen No. 23/2026 tentang Standar Tenaga Kependidikan (pengembangan kompetensi pedagogik & profesional guru). Bedakan fakta pelaksanaan, interpretasi, dan rencana tindak lanjut. Jangan mengarang regulasi.

STRUKTUR OUTPUT WAJIB (HTML) — format standar:
1. Identitas (tabel kecil: kelas, mapel, tanggal, topik, TP).
2. Hal yang Berjalan Baik — 2–4 poin, merujuk konkret pada cerita guru.
3. Kendala / Hal yang Perlu Diperbaiki — 2–4 poin, faktual dari cerita (jangan mengada-ada).
4. Rencana Tindak Lanjut — maksimal 5 butir AKSI KONKRET untuk pertemuan berikutnya (apa, untuk siapa/kapan), fokus: ${fokus}.
5. Satu kalimat penutup yang menguatkan.

CATATAN: Hasil ini draf awal — guru wajib menyesuaikannya dengan kondisi nyata sebelum disimpan sebagai dokumen refleksi.`;
  const title = "Refleksi Pembelajaran - "+mapel+" - "+fmtDate(tanggal);
  aiRunGenerate("are_result", {type:"Refleksi", title, userPrompt: prompt});
}
