const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('../assets/js/cp-data.js');
const root=path.resolve(__dirname,'..');
function source(file){return fs.readFileSync(path.join(root,'assets/js',file),'utf8');}
function aiContext(stored={}){
  const data=new Map(Object.entries(stored));
  const ctx=vm.createContext({PAGES:{},localStorage:{getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)},console,URL,AbortController,DOMException,Response,ReadableStream,TextDecoder,setTimeout,clearTimeout,location:{origin:'https://test.invalid'},Map});
  vm.runInContext(source('80-ai.js'),ctx);
  vm.runInContext('aiSettings={...defaultAiSettings(),apiKey:"test-only",retry:2,timeoutSec:1}',ctx);
  return ctx;
}
test('All application scripts parse, and script paths exist in load order',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*?)?src="(assets\/js\/[^\"]+)"/g)].map(m=>m[1].split('?')[0]);
  assert(scripts.length>=18);
  const versions=[...html.matchAll(/(?:src|href)="assets\/[^"]+\?v=([^"]+)"/g)].map(m=>m[1]);
  assert(versions.length>=scripts.length);assert.equal(new Set(versions).size,1);
  scripts.forEach(file=>new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}));
  new vm.Script(scripts.map(file=>fs.readFileSync(path.join(root,file),'utf8')).join("\n"),{filename:"application-load-order.js"});
  assert(scripts.indexOf('assets/js/25-safety.js')<scripts.indexOf('assets/js/80-ai.js'));
  assert(scripts.indexOf('assets/js/cp-data.js')<scripts.indexOf('assets/js/81-ai-curriculum.js'));
  assert.equal(scripts.at(-1),'assets/js/90-boot.js');
});
test('CP boundaries and phase regression: math A=100, B=10,000; no invented phases',()=>{
  assert.equal(cp.mapel.length,17);
  const math=cp.mapel.find(m=>m.id==='matematika');
  assert.match(math.fases.A,/bilangan cacah sampai 100/);
  assert.doesNotMatch(math.fases.A,/10\.000/);
  assert.match(math.fases.B,/bilangan cacah sampai 10\.000/);
  for(const id of ['binggris','ipas'])assert.equal(cp.mapel.find(m=>m.id===id).fases.A,undefined);
  const coding=cp.mapel.find(m=>m.id==='koding');assert.deepEqual(Object.keys(coding.fases),['C']);
  for(const m of cp.mapel)for(const text of Object.values(m.fases))assert.doesNotMatch(text,/VII\. CAPAIAN PEMBELAJARAN ILMU PENGETAHUAN ALAM/);
});
test('Recorded attendance distinguishes blank, present, sick, permitted and absent',()=>{
  const ctx=vm.createContext({});vm.runInContext(source('25-safety.js'),ctx);
  const value=ctx.attendanceSummary([{id:'1'},{id:'2'},{id:'3'},{id:'4'},{id:'5'},{id:'6'}],{'1':'H','2':'S','3':'I','4':'A','5':'unexpected','old':'H'});
  assert.deepEqual(JSON.parse(JSON.stringify(value)),{H:1,S:1,I:1,A:1,unmarked:2});
});
test('Local date remains correct after midnight in Asia/Jakarta',()=>{
  const original=process.env.TZ;process.env.TZ='Asia/Jakarta';
  try{
    class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-10-13T17:30:00Z']));}}
    const ctx=vm.createContext({Date:FixedDate});
    vm.runInContext(source('20-storage.js').match(/function todayISO\(\)\{[^\n]+/)[0],ctx);
    assert.equal(ctx.todayISO(),'2026-10-14');
  }finally{if(original===undefined)delete process.env.TZ;else process.env.TZ=original;}
});
test('V3/BKPDM and option counts remain present; custom system prompts survive migration',()=>{
  const custom='Prompt pribadi 020/2026, jangan diganti.';
  const ctx=aiContext({tpsd2026_ai_settings_v1:JSON.stringify({systemPrompt:custom,maxTokens:9000})});
  assert.equal(vm.runInContext('loadAiSettings().systemPrompt',ctx),custom);
  assert.equal(vm.runInContext('loadAiSettings().maxTokens',ctx),9000);
  const defaults=vm.runInContext('defaultAiSettings()',ctx);
  assert.match(defaults.systemPrompt,/\[SP-V3\]/);assert.match(defaults.systemPrompt,/020\/2026/);
  assert.match(defaults.systemPrompt,/kelas 1 = 3 opsi/);assert.match(defaults.systemPrompt,/kelas 2 ke atas = 4 opsi/);
  const old=aiContext({tpsd2026_ai_settings_v1:JSON.stringify({systemPrompt:'[SP-V2]',maxTokens:4000,timeoutSec:60})});
  assert.match(vm.runInContext('loadAiSettings().systemPrompt',old),/\[SP-V3\]/);
});
test('Streaming parses split UTF-8, residual last line, finish reason, and provider usage',async()=>{
  const ctx=aiContext();
  const bytes=new TextEncoder().encode('data: {"choices":[{"delta":{"content":"<p>Murid — belajar</p>"}}]}\n\ndata: {"choices":[{"delta":{},"finish_reason":"length"}],"usage":{"prompt_tokens":10,"completion_tokens":6}}\n\ndata: [DONE]');
  ctx.fetch=async()=>new Response(new ReadableStream({start(controller){for(let i=0;i<bytes.length;i+=7)controller.enqueue(bytes.slice(i,i+7));controller.close();}}),{headers:{'content-type':'text/event-stream'}});
  const result=await ctx.openRouterChat([{role:'user',content:'test'}]);
  assert.equal(result.text,'<p>Murid — belajar</p>');assert.equal(result.finishReason,'length');assert.equal(result.usage.completion_tokens,6);
});
test('Authorization failures do not retry or incur repeated requests',async()=>{
  const ctx=aiContext();let count=0;
  ctx.fetch=async()=>{count++;return new Response('{"error":{"message":"denied"}}',{status:401,headers:{'content-type':'application/json'}});};
  await assert.rejects(ctx.openRouterChat([]),/API Key tidak valid/);assert.equal(count,1);
});
test('Timeout stays active while a response body is stalled',async()=>{
  const ctx=aiContext();vm.runInContext('aiSettings.timeoutSec=.03',ctx);let count=0;
  ctx.fetch=async(_url,options)=>{count++;return new Response(new ReadableStream({start(controller){options.signal.addEventListener('abort',()=>controller.error(new DOMException('aborted','AbortError')));}}),{headers:{'content-type':'text/event-stream'}});};
  await assert.rejects(ctx.openRouterChat([]),/Waktu tunggu habis/);assert.equal(count,1);
});
test('Stream errors and empty replies are explicit failures',async()=>{
  const ctx=aiContext();ctx.fetch=async()=>new Response('data: {"error":{"message":"provider failed"}}\n\n',{headers:{'content-type':'text/event-stream'}});
  await assert.rejects(ctx.openRouterChat([]),/provider failed/);
  ctx.fetch=async()=>new Response('{"choices":[{"message":{"content":""}}]}',{headers:{'content-type':'application/json'}});
  await assert.rejects(ctx.openRouterChat([]),/tidak mengembalikan isi/);
});
