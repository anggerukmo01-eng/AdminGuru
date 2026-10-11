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
    maxTokens:4000,
    presencePenalty:0,
    frequencyPenalty:0,
    streaming:true,
    timeoutSec:60,
    retry:2,
    systemPrompt:"Anda adalah asisten AI ahli Kurikulum Merdeka dan Pembelajaran Mendalam (Deep Learning) untuk guru Sekolah Dasar di Indonesia. Anda menyusun dokumen administrasi pembelajaran yang formal, akurat, terstruktur, sesuai regulasi Kemendikdasmen terbaru (Permendikbudristek No. 12/2024 jo. Permendikdasmen No. 13/2025, Permendikdasmen No. 10/2025 tentang SKL, Kepbadan BSKAP No. 046/H/KR/2025 jo. Kepka BKPDM No. 020/2026 tentang Capaian Pembelajaran), serta menerapkan prinsip Pembelajaran Mendalam: berkesadaran (mindful), bermakna (meaningful), dan menggembirakan (joyful). SELALU tulis jawaban HANYA dalam Bahasa Indonesia formal dan HANYA dalam format HTML valid (gunakan tag h2,h3,h4,p,ul,ol,li,table,thead,tbody,tr,td,th,strong,em). JANGAN gunakan markdown (**, #, |). JANGAN menyertakan tag html/head/body, cukup potongan HTML dokumen. JANGAN menambahkan komentar, catatan, atau kalimat pembuka/penutup di luar isi dokumen."
  };
}
function loadAiSettings(){
  try{ const raw = localStorage.getItem(AI_SET_KEY); if(raw) return Object.assign(defaultAiSettings(), JSON.parse(raw)); }catch(e){}
  return defaultAiSettings();
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
              const delta = json.choices && json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : "";
              if(delta){ full += delta; if(opts.onDelta) opts.onDelta(full, delta); }
            }catch(e){ /* abaikan baris parsial */ }
          }
        }
        return { text: full, usage:{prompt_tokens:aiEstimateTokens(JSON.stringify(messages)), completion_tokens:aiEstimateTokens(full)} };
      } else {
        const json = await res.json();
        const text = json.choices && json.choices[0] && json.choices[0].message ? json.choices[0].message.content : "";
        const usage = json.usage || {prompt_tokens:aiEstimateTokens(JSON.stringify(messages)), completion_tokens:aiEstimateTokens(text)};
        if(opts.onDelta) opts.onDelta(text, text);
        return { text, usage };
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
      <div class="field"><label>Max Tokens</label><input type="number" id="ai_maxTokens" value="${s.maxTokens}" min="256" max="32000"></div>
      <div class="field"><label>Presence Penalty</label><input type="number" step="0.1" id="ai_presencePenalty" value="${s.presencePenalty}" min="-2" max="2"></div>
      <div class="field"><label>Frequency Penalty</label><input type="number" step="0.1" id="ai_frequencyPenalty" value="${s.frequencyPenalty}" min="-2" max="2"></div>
      <div class="field"><label>Timeout (detik)</label><input type="number" id="ai_timeoutSec" value="${s.timeoutSec}" min="10" max="300"></div>
      <div class="field"><label>Retry (percobaan ulang)</label><input type="number" id="ai_retry" value="${s.retry}" min="1" max="5"></div>
      <div class="field"><label>Streaming</label>
        <select id="ai_streaming"><option value="1" ${s.streaming?"selected":""}>Aktif (ON)</option><option value="0" ${!s.streaming?"selected":""}>Nonaktif (OFF)</option></select></div>
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
    timeoutSec: parseInt(document.getElementById("ai_timeoutSec").value,10),
    retry: parseInt(document.getElementById("ai_retry").value,10),
    systemPrompt: document.getElementById("ai_systemPrompt").value
  };
  saveAiSettings();
  toast("Pengaturan AI tersimpan.");
}

/* ---------- 4. PAGE: AI DASHBOARD ---------- */
PAGES.aiDashboard = function(){
  const hist = loadAiHistory();
  const totalGen = hist.length;
  const totalDoc = (db.aiDocs||[]).length;
  const totalPromptTok = hist.reduce((a,h)=>a+(h.usage&&h.usage.prompt_tokens||0),0);
  const totalCompTok = hist.reduce((a,h)=>a+(h.usage&&h.usage.completion_tokens||0),0);
  const estCost = aiEstimateCost(totalPromptTok, totalCompTok);
  const last = hist[0];
  return `
  <div class="ai-stat-row">
    <div class="card stat-card"><div class="icon" style="background:var(--primary-soft);color:var(--primary);">${ic("star",20)}</div><div class="num">${totalGen}</div><div class="lbl">Jumlah Generate</div></div>
    <div class="card stat-card"><div class="icon" style="background:var(--accent-soft);color:var(--accent);">${ic("clipboard",20)}</div><div class="num">${totalDoc}</div><div class="lbl">Dokumen Tersimpan</div></div>
    <div class="card stat-card"><div class="icon" style="background:var(--warn-soft);color:var(--warn);">${ic("layers",20)}</div><div class="num">${(totalPromptTok+totalCompTok).toLocaleString("id-ID")}</div><div class="lbl">Estimasi Token</div></div>
    <div class="card stat-card"><div class="icon" style="background:var(--danger-soft);color:var(--danger);">${ic("box",20)}</div><div class="num">$${estCost.toFixed(3)}</div><div class="lbl">Estimasi Biaya (kasar)</div></div>
  </div>
  <div class="card" style="margin-bottom:16px;">
    <h3>Model AI Aktif</h3>
    <p><span class="badge badge-blue">${escapeHtml(aiSettings.model)}</span> &nbsp; <span class="hint">Ubah di menu AI Settings.</span></p>
  </div>
  <div class="card">
    <h3>Generate Terakhir</h3>
    ${last ? `<div class="ai-hist-item"><div><strong>${escapeHtml(last.title)}</strong><div class="meta">${escapeHtml(last.type)} &middot; ${new Date(last.createdAt).toLocaleString("id-ID")}</div></div>
      <button class="btn btn-sm" onclick="aiViewHistory('${last.id}')">${ic("book",14)} Lihat</button></div>`
      : `<p class="hint">Belum ada riwayat generate. Buka salah satu menu AI: Modul Ajar / ATP / LKPD untuk mulai.</p>`}
  </div>`;
};

/* ---------- 5. PAGE: AI HISTORY ---------- */
PAGES.aiHistory = function(){
  const hist = loadAiHistory();
  if(!hist.length) return `<div class="card"><p class="hint">Belum ada dokumen AI yang dihasilkan.</p></div>`;
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
        <button class="btn" onclick="aiExportWord(document.getElementById('aiViewContent').innerHTML,'${escapeHtml(h.title).replace(/'/g,"")}')">${ic("download",15)} Export Word</button>
        <button class="btn" onclick="aiExportPDF(document.getElementById('aiViewContent').innerHTML,'${escapeHtml(h.title).replace(/'/g,"")}')">${ic("download",15)} Export PDF</button>
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
const AI_DIMENSI = ["Keimanan dan Ketakwaan terhadap Tuhan YME","Kewargaan","Penalaran Kritis","Kreativitas","Kolaborasi","Kemandirian","Kesehatan","Komunikasi"];
const AI_MODEL_PEMBELAJARAN = ["Problem Based Learning (PBL)","Project Based Learning (PjBL)","Discovery Learning","Inquiry Learning","Cooperative Learning","Contextual Teaching and Learning"];
const AI_METODE = ["Ceramah","Diskusi","Tanya Jawab","Demonstrasi","Praktik/Eksperimen","Permainan Edukatif","Bermain Peran","Presentasi"];

function aiCheckGrid(name, options, checkedDefault){
  return `<div class="ai-checkgrid">${options.map(o=>`<label><input type="checkbox" name="${name}" value="${escapeHtml(o)}" ${checkedDefault?"checked":""}>${escapeHtml(o)}</label>`).join("")}</div>`;
}
function aiGetChecked(name){
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el=>el.value);
}

/* ---------- 7. LOADING / RESULT PANEL ---------- */
function aiLoadingHtml(msg){
  return `<div class="card ai-result-box"><div class="ai-loading-panel"><span class="dot"></span><span class="dot"></span><span class="dot"></span>&nbsp;${escapeHtml(msg||"AI sedang menyusun dokumen...")}</div></div>`;
}
function aiResultHtml(title, contentHtml, docType, saveId){
  return `<div class="card ai-result-box">
    <div class="ai-toolbar">
      <button class="btn btn-primary" onclick="aiSaveDoc('${docType}','${saveId}')">${ic("check",15)} Simpan Dokumen</button>
      <button class="btn" onclick="aiExportWord(document.getElementById('${saveId}').innerHTML,'${escapeHtml(title).replace(/'/g,"")}')">${ic("download",15)} Export Word</button>
      <button class="btn" onclick="aiExportPDF(document.getElementById('${saveId}').innerHTML,'${escapeHtml(title).replace(/'/g,"")}')">${ic("download",15)} Export PDF</button>
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
    holder.innerHTML = aiResultHtml(title, res.text, type, saveId);
    _aiLastDoc = {title};
    addAiHistory({id:uid("aihist"), type, title, content:res.text, model:aiSettings.model, usage:res.usage, createdAt:new Date().toISOString()});
  }catch(e){
    holder.innerHTML = `<div class="card"><p class="badge badge-red">Gagal</p><p class="hint" style="margin-top:8px;">${escapeHtml(e.message)}</p></div>`;
    toast("Gagal generate: "+e.message);
  }
}

/* ---------- 8. EXPORT SERVICE ---------- */
function aiExportWord(html, title){
  const doc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>body{font-family:Calibri,Arial,sans-serif;font-size:12pt;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #333;padding:5px;}</style>
  </head><body>${letterheadHtml()}<h1 style="font-size:15pt;">${escapeHtml(title)}</h1>${html}</body></html>`;
  const blob = new Blob(['\ufeff', doc], {type:"application/msword"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (title||"dokumen").replace(/[^\w\-]+/g,"_")+".doc";
  document.body.appendChild(a); a.click(); a.remove();
  toast("File Word (.doc) diunduh.");
}
function aiExportPDF(html, title){
  document.getElementById("printArea").innerHTML = `${letterheadHtml()}<div class="doc-title">${escapeHtml(title)}</div>${html}`;
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
      <p class="hint" style="margin-bottom:10px;">Isi form berikut. Data sekolah, guru, dan CP diambil otomatis dari data yang sudah tersimpan.</p>
      <div class="field"><label>Kelas</label>${aiKelasSelect("am_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("am_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshElemen('am_kelas','am_mapel','am_elemenHolder')">${ic("check",13)} Muat Elemen/CP</button></div></div>
      <div class="field"><label>Elemen / Capaian Pembelajaran</label><div id="am_elemenHolder">${aiElemenSelect("am_elemenHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
      <div class="field"><label>Materi Pembelajaran</label><input type="text" id="am_materi" placeholder="mis. Mengenal Bilangan 1-20"></div>
      <div class="field"><label>Alokasi Waktu</label><input type="text" id="am_alokasi" placeholder="mis. 2 x 35 menit (1 pertemuan)"></div>
      <div class="field"><label>Model Pembelajaran</label><select id="am_model">${AI_MODEL_PEMBELAJARAN.map(m=>`<option>${m}</option>`).join("")}</select></div>
      <div class="field"><label>Metode</label>${aiCheckGrid("am_metode", AI_METODE, false)}</div>
      <div class="field"><label>Media Pembelajaran</label><input type="text" id="am_media" placeholder="mis. Kartu angka, Proyektor, Video pembelajaran"></div>
      <div class="field"><label>Sarana & Prasarana</label><input type="text" id="am_sarana" placeholder="mis. Ruang kelas, papan tulis, alat peraga"></div>
      <div class="field"><label>Dimensi Profil Lulusan yang Dituju</label>${aiCheckGrid("am_dimensi", AI_DIMENSI, true)}</div>
      <div class="field"><label>Pembelajaran Berdiferensiasi</label>
        <select id="am_diferensiasi"><option>Diferensiasi Konten</option><option>Diferensiasi Proses</option><option>Diferensiasi Produk</option><option>Konten, Proses, dan Produk</option><option>Tidak ada diferensiasi khusus</option></select></div>
      <div class="field"><label>Jenis Asesmen</label>${aiCheckGrid("am_asesmen", ["Diagnostik","Formatif","Sumatif"], true)}</div>
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
  const materi = document.getElementById("am_materi").value.trim() || "(sesuai elemen CP terpilih)";
  const alokasi = document.getElementById("am_alokasi").value.trim() || "2 x 35 menit";
  const model = document.getElementById("am_model").value;
  const metode = aiGetChecked("am_metode");
  const media = document.getElementById("am_media").value.trim();
  const sarana = document.getElementById("am_sarana").value.trim();
  const dimensi = aiGetChecked("am_dimensi");
  const diferensiasi = document.getElementById("am_diferensiasi").value;
  const asesmen = aiGetChecked("am_asesmen");
  const cls = classInfo(kelasId);
  const s = db.sekolah;
  const guru = (db.guru||[]).find(g=>g.id===s.waliKelasId) || (db.guru||[])[0] || {nama:"-", nip:"-"};

  const prompt = `Susun sebuah MODUL AJAR lengkap sesuai format terbaru Kemendikdasmen (Kurikulum Merdeka, pendekatan Pembelajaran Mendalam) dengan data berikut:

IDENTITAS
- Nama Sekolah: ${s.namaSekolah}
- Nama Guru: ${guru.nama}
- NIP: ${guru.nip||"-"}
- Kelas/Fase: ${cls.label} / Fase ${faseForClassId(kelasId)}
- Semester: ${s.semester}
- Mata Pelajaran: ${mapel}
- Tahun Pelajaran: ${s.tahunAjaran}
- Elemen: ${cpEntry.elemen}
- Capaian Pembelajaran (CP): ${cpEntry.cp}
- Materi: ${materi}
- Alokasi Waktu: ${alokasi}
- Model Pembelajaran: ${model}
- Metode: ${metode.join(", ")||"disesuaikan dengan model pembelajaran"}
- Media: ${media||"disesuaikan dengan materi"}
- Sarana/Prasarana: ${sarana||"ruang kelas standar"}
- Dimensi Profil Lulusan yang dituju: ${dimensi.join(", ")}
- Pembelajaran Berdiferensiasi: ${diferensiasi}
- Jenis Asesmen: ${asesmen.join(", ")}

STRUKTUR OUTPUT WAJIB (gunakan heading h2/h3, tabel bila perlu):
1. Identitas Modul Ajar (tabel)
2. Tujuan Pembelajaran (turunkan dari CP di atas, rumuskan 2-4 Tujuan Pembelajaran yang terukur)
3. Pemahaman Bermakna
4. Pertanyaan Pemantik
5. Profil Pelajar/Dimensi Profil Lulusan yang dikembangkan beserta penjelasan penerapannya
6. Sarana, Prasarana, dan Media
7. Kegiatan Pembelajaran (Pendahuluan, Inti [menerapkan prinsip berkesadaran/mindful, bermakna/meaningful, menggembirakan/joyful], Penutup) - rinci per langkah dengan estimasi waktu
8. Strategi Diferensiasi Pembelajaran sesuai pilihan di atas
9. Asesmen (instrumen ringkas untuk setiap jenis asesmen yang dipilih)
10. Refleksi Guru dan Refleksi Peserta Didik
11. Remedial dan Pengayaan
12. Lampiran (ringkasan materi ajar singkat)

Tulis dengan bahasa formal, kontekstual untuk siswa SD Indonesia, dan siap pakai tanpa perlu revisi guru.`;

  const title = "Modul Ajar - "+mapel+" - "+cls.label+" - "+materi;
  _aiLastDoc = {title};
  aiRunGenerate("am_result", {type:"Modul Ajar", title, userPrompt: prompt});
}

/* ---------- 10. GENERATOR: ATP ---------- */
PAGES.aiATP = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout">
    <div class="card">
      <h3>${ic("book",18)} AI Generator: Alur Tujuan Pembelajaran (ATP)</h3>
      <div class="field"><label>Kelas</label>${aiKelasSelect("aa_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("aa_mapel", MAPEL_LIST[0])}</div>
      <div class="field"><label>Semester</label><select id="aa_semester"><option>1 (Ganjil)</option><option>2 (Genap)</option></select></div>
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
  const cpText = cList.map(c=>"- "+c.elemen+": "+c.cp).join("\n");
  const prompt = `Susun ALUR TUJUAN PEMBELAJARAN (ATP) resmi untuk mata pelajaran ${mapel} kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester}, berdasarkan Capaian Pembelajaran berikut:
${cpText || "(gunakan CP standar Fase "+faseForClassId(kelasId)+" untuk mapel ini sesuai Kepbadan BSKAP No. 046/H/KR/2025)"}

Keluarkan HASIL dalam bentuk TABEL HTML dengan kolom: No | Elemen | Tujuan Pembelajaran (ATP) | Alokasi Waktu (JP) | Kata Kunci/Konten Utama.
Susun tujuan pembelajaran secara berurutan, logis, dari kemampuan prasyarat menuju kemampuan kompleks, mencakup seluruh elemen CP di atas. Tambahkan judul dokumen di atas tabel.`;
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
      <p class="hint" style="margin-bottom:10px;">Form ini menyusun prompt otomatis berdasarkan 9 komponen rumus LKPD (Peran AI, Identitas, Tujuan, Materi, Model Aktivitas, Struktur, Gaya Bahasa, Format Output, Kriteria Kualitas).</p>
      <div class="field"><label>Kelas</label>${aiKelasSelect("al_kelas", kelasId)}</div>
      <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("al_mapel", MAPEL_LIST[0])}
        <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshElemen('al_kelas','al_mapel','al_elemenHolder')">${ic("check",13)} Muat Elemen/CP</button></div></div>
      <div class="field"><label>Elemen / CP acuan</label><div id="al_elemenHolder">${aiElemenSelect("al_elemenHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
      <div class="field"><label>Materi / Topik LKPD</label><input type="text" id="al_materi" placeholder="mis. Mengukur Panjang Benda dengan Satuan Tidak Baku"></div>
      <div class="field"><label>Tujuan Pembelajaran (boleh diketik manual)</label><textarea id="al_tujuan" placeholder="Kosongkan untuk diturunkan otomatis dari CP di atas"></textarea></div>
      <div class="field"><label>Model Aktivitas</label><select id="al_aktivitas"><option>Individu</option><option>Berpasangan</option><option>Kelompok Kecil (3-4 siswa)</option><option>Klasikal</option></select></div>
      <div class="field"><label>Pendekatan</label><select id="al_pendekatan"><option>Kontekstual</option><option>Saintifik</option><option>STEAM</option><option>Berbasis Proyek</option><option>Berbasis Masalah</option></select></div>
      <div class="field"><label>Gaya Bahasa</label><select id="al_gaya"><option>Sederhana untuk siswa kelas rendah (1-3)</option><option>Standar untuk siswa kelas tinggi (4-6)</option><option>Naratif dan ceria dengan ilustrasi cerita</option></select></div>
      <div class="field"><label>Struktur LKPD yang disertakan</label>${aiCheckGrid("al_struktur", AI_LKPD_STRUKTUR, true)}</div>
      <div class="field"><label>Kriteria Kualitas</label>${aiCheckGrid("al_kualitas", AI_LKPD_KUALITAS, true)}</div>
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
  const materi = document.getElementById("al_materi").value.trim() || "(sesuai elemen CP terpilih)";
  const tujuanManual = document.getElementById("al_tujuan").value.trim();
  const aktivitas = document.getElementById("al_aktivitas").value;
  const pendekatan = document.getElementById("al_pendekatan").value;
  const gaya = document.getElementById("al_gaya").value;
  const struktur = aiGetChecked("al_struktur");
  const kualitas = aiGetChecked("al_kualitas");
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
- Semester: ${s.semester}
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

[9. KRITERIA KUALITAS]
Pastikan LKPD memenuhi seluruh kriteria berikut secara eksplisit di dalam kontennya: ${kualitas.join(", ")}. Sertakan Tabel Pengamatan/Hasil yang relevan dengan materi, Pertanyaan Pemandu berjenjang (mudah->HOTS), Rubrik Penilaian sederhana (skala 1-4 dengan deskriptor), serta bagian Pengayaan dan Remedial yang konkret dan dapat langsung digunakan guru.

Susun LKPD lengkap sekarang berdasarkan seluruh komponen di atas.`;

  const title = "LKPD - "+mapel+" - "+cls.label+" - "+materi;
  aiRunGenerate("al_result", {type:"LKPD", title, userPrompt: prompt});
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
  const head = `<tr><th rowspan="2">No</th><th rowspan="2">Nama Siswa</th><th colspan="${dayNums.length}">Tanggal</th><th colspan="4">Rekap</th></tr>
    <tr>${dayNums.map(d=>`<th>${d}</th>`).join("")}<th>H</th><th>S</th><th>I</th><th>A</th></tr>`;
  const body = rows.map((r,i)=>`<tr><td>${i+1}</td><td style="text-align:left;"><strong>${escapeHtml(r.nama)}</strong></td>
    ${r.cells.map(c=>`<td>${c||""}</td>`).join("")}
    <td>${r.h}</td><td>${r.sk}</td><td>${r.iz}</td><td>${r.al}</td></tr>`).join("");
  const footer = `<tr><td colspan="2" style="text-align:right;"><strong>Jumlah Hadir</strong></td>${perHari.map(n=>`<td>${n||""}</td>`).join("")}<td colspan="4"></td></tr>`;
  return `<table><thead>${head}</thead><tbody>${body}${footer}</tbody></table>
  <p class="hint" style="margin-top:8px;">Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa/Tanpa Keterangan.</p>`;
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
  const siswaList = siswaSortedAlpha();
  const rows = siswaList.map((s,i)=>{
    const st = db.kehadiran[tgl][s.id] || "H";
    const opts = [["H","Hadir","badge-green"],["S","Sakit","badge-orange"],["I","Izin","badge-blue"],["A","Alpa","badge-red"]];
    return `<tr><td style="width:44px;"><span class="badge badge-blue">${i+1}</span></td><td><strong>${escapeHtml(s.nama)}</strong></td><td>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
      ${opts.map(o=>`<button class="btn btn-sm ${st===o[0]?'btn-primary':''}" onclick="setKehadiran('${tgl}','${s.id}','${o[0]}')">${o[1]}</button>`).join("")}
      </div></td></tr>`;
  }).join("");
  const bulanAktif = window._kehadiranBulan || tgl.slice(0,7);
  const months = absensiAvailableMonths();
  if(!months.includes(bulanAktif)) months.push(bulanAktif);
  months.sort();
  return `
  <div class="section-head"><div><h1>Kehadiran Siswa</h1><div class="desc">Tandai kehadiran harian, lalu cetak/unduh rekap bulanan di bawah.</div></div>
    <div class="grow"></div></div>
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
      <div class="field" style="max-width:200px;margin-bottom:0;"><label>Tanggal</label><input type="date" value="${tgl}" onchange="window._kehadiranTgl=this.value; renderPage('kehadiran');"></div>
      <button class="btn btn-accent" onclick="kehadiranHadirSemua()">${ic("check",15)} Hadir Semua (1 Klik)</button>
      <button class="btn" onclick="kehadiranResetHarian()">${ic("x",15)} Reset</button>
    </div>
    <div style="background:var(--primary-ghost);border:1.5px dashed var(--primary);border-radius:14px;padding:14px 16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:13px;margin-bottom:8px;">⚡ Absen Cepat <span class="muted" style="font-weight:600;">— ketik nomor/nama yang TIDAK hadir, otomatis tertandai</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
        <div class="field" style="flex:1;min-width:220px;margin-bottom:0;"><label>Nomor / nama siswa (pisahkan koma)</label><input id="absenCepatInput" placeholder="cth: 3, 7, 12  atau: Aji, Eza"></div>
        <div class="field" style="margin-bottom:0;"><label>Keterangan</label><select id="absenCepatKet"><option value="S">Sakit</option><option value="I">Izin</option><option value="A">Alpa</option></select></div>
        <button class="btn btn-primary" onclick="kehadiranAbsenCepat()">${ic("check",15)} Tandai</button>
      </div>
      <div class="hint">Nomor = nomor urut pada tabel di bawah. Nama boleh sebagian (cth: "Aji"), asal hanya cocok dengan 1 siswa.</div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama Siswa</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>
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
      <div class="field"><label>Semester</label><select id="at_semester"><option value="1">1 (Ganjil)</option><option value="2">2 (Genap)</option></select></div>
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
  const cls = classInfo(kelasId);
  const prompt = `Susun DAFTAR TUJUAN PEMBELAJARAN (TP) resmi untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Semester ${semester}, elemen "${cpEntry.elemen}", berdasarkan Capaian Pembelajaran (CP) berikut:
"${cpEntry.cp}"

Buat sebanyak ${jumlah} Tujuan Pembelajaran yang: diturunkan langsung dan konsisten dari CP di atas; dirumuskan dengan kompetensi + lingkup materi yang jelas dan terukur; disusun berjenjang dari kemampuan sederhana ke kompleks; menggunakan kata kerja operasional (KKO) yang sesuai taksonomi (Memahami-Mengaplikasi-Merefleksi, prinsip Pembelajaran Mendalam).

Keluarkan hasil sebagai TABEL HTML dengan kolom: No | Rumusan Tujuan Pembelajaran | Lingkup Materi | Alokasi Waktu (JP, estimasi wajar). Beri judul dokumen di atas tabel yang mencantumkan mapel, kelas, elemen, dan semester.`;
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

Susun dengan format HTML terstruktur berisi: (1) Tabel identitas jurnal, (2) Kegiatan Pendahuluan, (3) Kegiatan Inti (uraikan tahap Memahami - Mengaplikasi - Merefleksi sesuai prinsip Pembelajaran Mendalam yang berkesadaran, bermakna, dan menggembirakan, relevan dengan materi di atas), (4) Kegiatan Penutup, (5) Refleksi Guru (evaluasi singkat ketercapaian TP), (6) Tindak Lanjut (rencana perbaikan/pengayaan/remedial bila perlu). Tulis dengan bahasa formal namun natural seperti catatan guru profesional, bukan template kosong.`;
  const title = "Jurnal Mengajar - "+mapel+" - "+fmtDate(tanggal);
  aiRunGenerate("aj_result", {type:"Jurnal Mengajar", title, userPrompt: prompt});
}

/* ---- D3-D5. GENERATOR ASESMEN (Diagnostik / Formatif / Sumatif) ---- */
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

PAGES.aiAsesDiag = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Asesmen Diagnostik</h3>
    <p class="hint" style="margin-bottom:10px;">Untuk memetakan kesiapan/gaya belajar/kondisi awal siswa sebelum pembelajaran.</p>
    ${aiAsesmenFormBlock("ad", kelasId)}
    <div class="field"><label>Jenis Diagnostik</label><select id="ad_jenis"><option>Kognitif (kemampuan awal materi)</option><option>Non-Kognitif (kondisi psikososial/minat/gaya belajar)</option><option>Gabungan Kognitif dan Non-Kognitif</option></select></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiAsesDiag()">${ic("star",16)} Generate Asesmen Diagnostik</button>
  </div><div id="ad_result"></div></div>`;
};
function generateAiAsesDiag(){
  const c = aiAsesmenPromptCommon("ad","diagnostik");
  const jenisDiag = document.getElementById("ad_jenis").value;
  const prompt = `Susun INSTRUMEN ASESMEN DIAGNOSTIK ${jenisDiag.toUpperCase()} untuk mata pelajaran ${c.mapel}, kelas ${c.cls.label} (Fase ${faseForClassId(c.kelasId)}), materi "${c.materi}", TP acuan: "${c.tp}".
Buat ${c.jumlah} pertanyaan/pernyataan asesmen diagnostik${c.bentuk.length?" dalam bentuk: "+c.bentuk.join(", "):""}, sesuai untuk anak usia SD, bahasa sederhana dan komunikatif.
Sertakan: (1) Tujuan asesmen diagnostik ini, (2) Daftar pertanyaan/instrumen (tabel: No | Pertanyaan/Pernyataan | Aspek yang diukur), (3) Pedoman interpretasi hasil (kategori: Siap/Perlu Pendampingan/Belum Siap, atau kategori non-kognitif yang relevan) beserta tindak lanjut pembelajaran untuk masing-masing kategori.`;
  const title = "Asesmen Diagnostik - "+c.mapel+" - "+c.cls.label+" - "+c.materi;
  aiRunGenerate("ad_result", {type:"Asesmen Diagnostik", title, userPrompt: prompt});
}

PAGES.aiAsesForm = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Asesmen Formatif</h3>
    <p class="hint" style="margin-bottom:10px;">Instrumen umpan balik selama proses pembelajaran berlangsung.</p>
    ${aiAsesmenFormBlock("af", kelasId)}
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiAsesForm()">${ic("star",16)} Generate Asesmen Formatif</button>
  </div><div id="af_result"></div></div>`;
};
function generateAiAsesForm(){
  const c = aiAsesmenPromptCommon("af","formatif");
  const prompt = `Susun INSTRUMEN ASESMEN FORMATIF untuk mata pelajaran ${c.mapel}, kelas ${c.cls.label} (Fase ${faseForClassId(c.kelasId)}), materi "${c.materi}", TP acuan: "${c.tp}".
Buat ${c.jumlah} soal/item${c.bentuk.length?" dalam bentuk: "+c.bentuk.join(", "):" dalam bentuk campuran yang sesuai"}${c.level.length?", pada level kognitif: "+c.level.join(", "):""}.
Sertakan: (1) Kisi-kisi singkat (tabel: No | Indikator Soal | Bentuk | Level), (2) Soal lengkap bernomor beserta kunci jawaban/kriteria jawaban benar, (3) Rubrik penilaian sederhana skala 1-4 dengan deskriptor tiap level, (4) Rencana umpan balik untuk siswa yang belum mencapai TP (tindak lanjut formatif).`;
  const title = "Asesmen Formatif - "+c.mapel+" - "+c.cls.label+" - "+c.materi;
  aiRunGenerate("af_result", {type:"Asesmen Formatif", title, userPrompt: prompt});
}

PAGES.aiAsesSum = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Asesmen Sumatif</h3>
    <p class="hint" style="margin-bottom:10px;">Instrumen penilaian akhir lingkup materi/semester (ulangan harian, PTS, PAS, dsb).</p>
    ${aiAsesmenFormBlock("as", kelasId)}
    <div class="field"><label>Cakupan</label><select id="as_cakupan"><option>Ulangan Harian (1 materi)</option><option>Penilaian Tengah Semester (PTS)</option><option>Penilaian Akhir Semester (PAS)</option></select></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiAsesSum()">${ic("star",16)} Generate Asesmen Sumatif</button>
  </div><div id="as_result"></div></div>`;
};
function generateAiAsesSum(){
  const c = aiAsesmenPromptCommon("as","sumatif");
  const cakupan = document.getElementById("as_cakupan").value;
  const prompt = `Susun NASKAH SOAL ASESMEN SUMATIF (${cakupan}) untuk mata pelajaran ${c.mapel}, kelas ${c.cls.label} (Fase ${faseForClassId(c.kelasId)}), materi "${c.materi}", TP acuan: "${c.tp}".
Buat ${c.jumlah} soal${c.bentuk.length?" dalam bentuk: "+c.bentuk.join(", "):" dalam bentuk campuran yang sesuai jenjang SD"}${c.level.length?", pada level kognitif: "+c.level.join(", "):""}.
Sertakan secara lengkap: (1) Kisi-kisi soal (tabel: No | Indikator Soal | Bentuk Soal | Level Kognitif | Nomor Soal), (2) Naskah soal lengkap bernomor rapi siap cetak, (3) Kunci jawaban lengkap, (4) Pedoman penskoran/rubrik penilaian per nomor beserta bobot skor menuju nilai 0-100.`;
  const title = "Asesmen Sumatif - "+c.mapel+" - "+c.cls.label+" - "+c.materi;
  aiRunGenerate("as_result", {type:"Asesmen Sumatif", title, userPrompt: prompt});
}

/* ============================================================
   BATCH 3 — AI GENERATOR TAMBAHAN:
   Kisi-kisi, Rubrik Penilaian, Bank Soal, Lembar Observasi,
   Pengayaan & Remedial, Refleksi (Guru & Peserta Didik),
   Surat untuk Orang Tua, Catatan Wali Kelas
   ============================================================ */

/* ---------- E1. AI: KISI-KISI SOAL ---------- */
PAGES.aiKisi = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Kisi-kisi Soal</h3>
    <div class="field"><label>Kelas</label>${aiKelasSelect("ak_kelas", kelasId)}</div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("ak_mapel", MAPEL_LIST[0])}
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('ak_kelas','ak_mapel','ak_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    <div class="field"><label>Tujuan Pembelajaran (TP) yang diujikan</label><div id="ak_tpHolder">${aiTpSelect("ak_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
    <div class="field"><label>Cakupan</label><select id="ak_cakupan"><option>Ulangan Harian</option><option>Penilaian Tengah Semester (PTS)</option><option>Penilaian Akhir Semester (PAS)</option></select></div>
    <div class="field"><label>Jumlah Soal</label><input type="number" id="ak_jumlah" value="10" min="5" max="50"></div>
    <div class="field"><label>Bentuk Soal</label>${aiCheckGrid("ak_bentuk", AI_BENTUK_SOAL, false)}</div>
    <div class="field"><label>Level Kognitif</label>${aiCheckGrid("ak_level", AI_LEVEL_KOGNITIF, false)}</div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiKisi()">${ic("star",16)} Generate Kisi-kisi</button>
  </div><div id="ak_result"></div></div>`;
};
function generateAiKisi(){
  const kelasId = document.getElementById("ak_kelas").value;
  const mapel = document.getElementById("ak_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("ak_tpHolder_sel") ? document.getElementById("ak_tpHolder_sel").value : "";
  const tp = atpList[tpIdx] ? atpList[tpIdx].tp : "(seluruh TP semester berjalan pada mapel ini)";
  const cakupan = document.getElementById("ak_cakupan").value;
  const jumlah = document.getElementById("ak_jumlah").value || 10;
  const bentuk = aiGetChecked("ak_bentuk");
  const level = aiGetChecked("ak_level");
  const cls = classInfo(kelasId);
  const prompt = `Susun KISI-KISI SOAL resmi untuk ${cakupan}, mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), berdasarkan Tujuan Pembelajaran: "${tp}".
Buat ${jumlah} baris kisi-kisi${bentuk.length?" dengan bentuk soal: "+bentuk.join(", "):""}${level.length?", tersebar pada level kognitif: "+level.join(", "):", tersebar proporsional dari level mudah hingga HOTS"}.
Keluarkan sebagai TABEL HTML dengan kolom: No | Tujuan Pembelajaran/Indikator Soal | Materi | Bentuk Soal | Level Kognitif | Nomor Soal. Sertakan judul dokumen resmi (nama satuan pendidikan, mapel, kelas, cakupan, tahun pelajaran) sebelum tabel.`;
  const title = "Kisi-kisi Soal - "+mapel+" - "+cls.label+" - "+cakupan;
  aiRunGenerate("ak_result", {type:"Kisi-kisi", title, userPrompt: prompt});
}

/* ---------- E2. AI: RUBRIK PENILAIAN ---------- */
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
    <div class="field"><label>Skala Penilaian</label><select id="ar_skala"><option>1-4 (Belum Berkembang / Mulai Berkembang / Berkembang Sesuai Harapan / Sangat Berkembang)</option><option>1-4 (Angka sederhana)</option><option>0-100</option></select></div>
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
  const cls = classInfo(kelasId);
  const prompt = `Susun RUBRIK PENILAIAN ${jenis.toUpperCase()} untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), Tujuan Pembelajaran: "${tp}", tugas/aktivitas: "${tugas}".
Kriteria yang wajib dinilai: ${kriteria.length?kriteria.join(", "):"tentukan sendiri kriteria yang paling relevan dengan tugas di atas (3-5 kriteria)"}.
Skala penilaian: ${skala}.
Keluarkan sebagai TABEL HTML dengan kolom: Kriteria | Deskriptor Level Tertinggi | Deskriptor Level Menengah-Atas | Deskriptor Level Menengah-Bawah | Deskriptor Level Terendah, setiap deskriptor ditulis konkret dan dapat diamati guru (observable), bukan kalimat umum. Tambahkan di bawah tabel: cara menghitung nilai akhir dari rubrik ini.`;
  const title = "Rubrik Penilaian - "+jenis+" - "+mapel+" - "+cls.label;
  aiRunGenerate("ar_result", {type:"Rubrik Penilaian", title, userPrompt: prompt});
}

/* ---------- E3. AI: BANK SOAL (PG + Isian + Uraian + HOTS, satu generator fleksibel) ---------- */
PAGES.aiBankSoal = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("target",18)} AI Generator: Bank Soal</h3>
    <p class="hint" style="margin-bottom:10px;">Mencakup Soal Pilihan Ganda, Isian, Uraian, dan HOTS sekaligus - pilih kombinasi sesuai kebutuhan.</p>
    <div class="field"><label>Kelas</label>${aiKelasSelect("ab_kelas", kelasId)}</div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("ab_mapel", MAPEL_LIST[0])}
      <div class="hint" style="margin-top:4px;"><button class="btn btn-sm" type="button" onclick="aiRefreshTp('ab_kelas','ab_mapel','ab_tpHolder')">${ic("check",13)} Muat TP dari ATP</button></div></div>
    <div class="field"><label>Tujuan Pembelajaran acuan</label><div id="ab_tpHolder">${aiTpSelect("ab_tpHolder_sel", kelasId, MAPEL_LIST[0])}</div></div>
    <div class="field"><label>Materi</label><input type="text" id="ab_materi" placeholder="mis. Ekosistem dan Rantai Makanan"></div>
    <div class="grid grid-3">
      <div class="field"><label>Jumlah Soal PG</label><input type="number" id="ab_jmlPG" value="5" min="0" max="30"></div>
      <div class="field"><label>Jumlah Soal Isian</label><input type="number" id="ab_jmlIsian" value="3" min="0" max="30"></div>
      <div class="field"><label>Jumlah Soal Uraian</label><input type="number" id="ab_jmlUraian" value="2" min="0" max="30"></div>
    </div>
    <div class="field"><label>Sertakan Soal HOTS</label><select id="ab_hots"><option value="ya">Ya, sisipkan proporsi soal HOTS (C4-C6)</option><option value="tidak">Tidak, level standar saja (C1-C3)</option></select></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiBankSoal()">${ic("star",16)} Generate Bank Soal</button>
  </div><div id="ab_result"></div></div>`;
};
function generateAiBankSoal(){
  const kelasId = document.getElementById("ab_kelas").value;
  const mapel = document.getElementById("ab_mapel").value;
  const atpList = aiAtpListForKelasMapel(kelasId, mapel);
  const tpIdx = document.getElementById("ab_tpHolder_sel") ? document.getElementById("ab_tpHolder_sel").value : "";
  const tp = atpList[tpIdx] ? atpList[tpIdx].tp : "(sesuai materi)";
  const materi = document.getElementById("ab_materi").value.trim() || "-";
  const jmlPG = parseInt(document.getElementById("ab_jmlPG").value||0,10);
  const jmlIsian = parseInt(document.getElementById("ab_jmlIsian").value||0,10);
  const jmlUraian = parseInt(document.getElementById("ab_jmlUraian").value||0,10);
  const hots = document.getElementById("ab_hots").value==="ya";
  const cls = classInfo(kelasId);
  const bagian = [];
  if(jmlPG>0) bagian.push(jmlPG+" soal Pilihan Ganda (4 opsi jawaban A-D)");
  if(jmlIsian>0) bagian.push(jmlIsian+" soal Isian Singkat");
  if(jmlUraian>0) bagian.push(jmlUraian+" soal Uraian/Esai");
  const prompt = `Susun BANK SOAL untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), materi "${materi}", TP acuan: "${tp}".
Buat: ${bagian.join("; ")||"soal sesuai kebutuhan"}. ${hots?"Sisipkan proporsi wajar soal berpikir tingkat tinggi (HOTS, level C4-C6) terutama pada bagian Uraian/Isian.":"Gunakan level kognitif standar (C1-C3) saja."}
Susun per bagian (Bagian A: Pilihan Ganda, Bagian B: Isian Singkat, Bagian C: Uraian - tampilkan hanya bagian yang jumlahnya lebih dari 0), setiap soal diberi nomor urut lanjut, dan sertakan KUNCI JAWABAN LENGKAP di bagian akhir dokumen (terpisah dari naskah soal, berjudul "KUNCI JAWABAN"). Format naskah soal harus rapi dan siap cetak.`;
  const title = "Bank Soal - "+mapel+" - "+cls.label+" - "+materi;
  aiRunGenerate("ab_result", {type:"Bank Soal", title, userPrompt: prompt});
}

/* ---------- E4. AI: LEMBAR OBSERVASI ---------- */
PAGES.aiObservasi = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("eye",18)} AI Generator: Lembar Observasi</h3>
    <div class="field"><label>Kelas</label>${aiKelasSelect("ao_kelas", kelasId)}</div>
    <div class="field"><label>Objek Observasi</label><select id="ao_objek"><option>Sikap/Dimensi Profil Lulusan</option><option>Keterampilan Praktik/Unjuk Kerja</option><option>Partisipasi & Keaktifan dalam Pembelajaran</option><option>Kondisi Kesiapan Belajar (Awal Pembelajaran)</option></select></div>
    <div class="field"><label>Mata Pelajaran/Konteks</label>${aiMapelSelect("ao_mapel", MAPEL_LIST[0])}</div>
    <div class="field"><label>Kegiatan/Materi</label><input type="text" id="ao_materi" placeholder="mis. Diskusi kelompok tentang gotong royong"></div>
    <div class="field"><label>Dimensi/Aspek yang diamati</label>${aiCheckGrid("ao_dimensi", AI_DIMENSI, false)}</div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiObservasi()">${ic("star",16)} Generate Lembar Observasi</button>
  </div><div id="ao_result"></div></div>`;
};
function generateAiObservasi(){
  const kelasId = document.getElementById("ao_kelas").value;
  const objek = document.getElementById("ao_objek").value;
  const mapel = document.getElementById("ao_mapel").value;
  const materi = document.getElementById("ao_materi").value.trim() || "-";
  const dimensi = aiGetChecked("ao_dimensi");
  const cls = classInfo(kelasId);
  const daftarSiswa = siswaSortedAlpha().map(s=>s.nama);
  const prompt = `Susun LEMBAR OBSERVASI untuk mengamati "${objek}" pada mata pelajaran/konteks ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), kegiatan/materi: "${materi}".
Aspek yang diamati: ${dimensi.length?dimensi.join(", "):"tentukan 3-4 aspek observasi yang paling relevan dengan konteks di atas"}.
Keluarkan sebagai: (1) Petunjuk pengisian singkat untuk guru, (2) TABEL observasi dengan baris nama siswa berikut ini: ${daftarSiswa.join(", ")}; kolom-kolom berupa setiap aspek yang diamati dengan skala centang (1=Belum Terlihat, 2=Mulai Terlihat, 3=Berkembang, 4=Membudaya) dan satu kolom Catatan, (3) Pedoman singkat interpretasi skor rata-rata kelas.`;
  const title = "Lembar Observasi - "+objek+" - "+cls.label;
  aiRunGenerate("ao_result", {type:"Lembar Observasi", title, userPrompt: prompt});
}

/* ---------- E5. AI: PENGAYAAN & REMEDIAL ---------- */
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

/* ---------- E6. AI: REFLEKSI (GURU & PESERTA DIDIK) ---------- */
PAGES.aiRefleksi = function(){
  const kelasId = activeClassId;
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("star",18)} AI Generator: Refleksi Pembelajaran</h3>
    <div class="field"><label>Kelas</label>${aiKelasSelect("are_kelas", kelasId)}</div>
    <div class="field"><label>Mata Pelajaran</label>${aiMapelSelect("are_mapel", MAPEL_LIST[0])}</div>
    <div class="field"><label>Materi/Kegiatan yang direfleksikan</label><input type="text" id="are_materi" placeholder="mis. Percobaan sederhana tentang perubahan wujud benda"></div>
    <div class="field"><label>Untuk Siapa</label><select id="are_untuk"><option value="keduanya">Refleksi Guru dan Peserta Didik (keduanya)</option><option value="guru">Refleksi Guru saja</option><option value="siswa">Refleksi Peserta Didik saja</option></select></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiRefleksi()">${ic("star",16)} Generate Refleksi</button>
  </div><div id="are_result"></div></div>`;
};
function generateAiRefleksi(){
  const kelasId = document.getElementById("are_kelas").value;
  const mapel = document.getElementById("are_mapel").value;
  const materi = document.getElementById("are_materi").value.trim() || "-";
  const untuk = document.getElementById("are_untuk").value;
  const cls = classInfo(kelasId);
  let bagian = "";
  if(untuk!=="siswa") bagian += `\nBagian REFLEKSI GURU: susun daftar pertanyaan reflektif untuk guru (ketercapaian TP, efektivitas metode/media, kendala, rencana perbaikan pertemuan berikutnya) beserta ruang isian singkat.`;
  if(untuk!=="guru") bagian += `\nBagian REFLEKSI PESERTA DIDIK: susun lembar refleksi sederhana dan menyenangkan untuk peserta didik SD (bahasa sesuai usia, boleh berbentuk emoji/skala bintang/pertanyaan pendek), menanyakan pemahaman, perasaan selama belajar, dan bagian yang masih sulit.`;
  const prompt = `Susun LEMBAR REFLEKSI PEMBELAJARAN untuk mata pelajaran ${mapel}, kelas ${cls.label} (Fase ${faseForClassId(kelasId)}), materi/kegiatan: "${materi}", sesuai prinsip Pembelajaran Mendalam (tahap Merefleksi).${bagian}
Format HTML rapi, siap cetak/dibagikan.`;
  const title = "Refleksi Pembelajaran - "+mapel+" - "+cls.label+" - "+materi;
  aiRunGenerate("are_result", {type:"Refleksi", title, userPrompt: prompt});
}

/* ---------- E7. AI: SURAT UNTUK ORANG TUA ---------- */
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

/* ---------- E8. AI: CATATAN WALI KELAS ---------- */
const AI_KATEGORI_CATATAN = ["Akademik","Sikap/Perilaku","Kehadiran","Kesehatan","Sosial/Pertemanan","Bakat & Minat"];
PAGES.aiCatatanWali = function(){
  return `<div class="ai-layout"><div class="card">
    <h3>${ic("edit",18)} AI Generator: Catatan Wali Kelas</h3>
    <div class="field"><label>Nama Siswa</label><select id="acw_siswa">${siswaOpts().map(o=>`<option value="${o.value}">${escapeHtml(o.label)}</option>`).join("")}</select></div>
    <div class="field"><label>Tanggal</label><input type="date" id="acw_tanggal" value="${todayISO()}"></div>
    <div class="field"><label>Kategori</label><select id="acw_kategori">${AI_KATEGORI_CATATAN.map(k=>`<option>${k}</option>`).join("")}</select></div>
    <div class="field"><label>Kejadian/Hal yang diamati</label><textarea id="acw_kejadian" placeholder="mis. tiga hari terakhir sering terlambat masuk kelas" required></textarea></div>
    <div class="field"><label>Tindak Lanjut yang sudah/akan dilakukan (opsional)</label><textarea id="acw_tindakLanjut" placeholder="mis. sudah dikomunikasikan dengan orang tua via telepon"></textarea></div>
    <button class="btn btn-primary" style="width:100%;" onclick="generateAiCatatanWali()">${ic("star",16)} Generate Catatan</button>
  </div><div id="acw_result"></div></div>`;
};
function generateAiCatatanWali(){
  const siswaId = document.getElementById("acw_siswa").value;
  const nama = siswaName(siswaId);
  const tanggal = document.getElementById("acw_tanggal").value;
  const kategori = document.getElementById("acw_kategori").value;
  const kejadian = document.getElementById("acw_kejadian").value.trim();
  const tindakLanjut = document.getElementById("acw_tindakLanjut").value.trim();
  if(!kejadian){ toast("Mohon isi kejadian/hal yang diamati terlebih dahulu."); return; }
  const prompt = `Susun satu entri CATATAN WALI KELAS resmi (buku catatan perkembangan siswa) dengan data:
- Nama Siswa: ${nama}
- Tanggal: ${fmtDate(tanggal)}
- Kategori: ${kategori}
- Kejadian/hal yang diamati (catatan asli guru, JANGAN diubah maknanya, hanya dirapikan bahasanya): "${kejadian}"
- Tindak lanjut yang sudah/akan dilakukan: ${tindakLanjut || "belum ada, mohon sarankan tindak lanjut yang tepat"}

Tulis sebagai catatan formal namun manusiawi (bukan kaku seperti laporan), berisi: (1) uraian singkat kejadian/observasi, (2) analisis singkat dari sudut pandang wali kelas, (3) rekomendasi tindak lanjut konkret (melibatkan siswa/orang tua/guru mapel bila relevan). Panjang cukup 1 paragraf padat, format HTML sederhana (p saja, tanpa heading berlebihan).`;
  const title = "Catatan Wali Kelas - "+nama+" - "+fmtDate(tanggal);
  aiRunGenerate("acw_result", {type:"Catatan Wali Kelas", title, userPrompt: prompt});
}

