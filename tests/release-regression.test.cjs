const {test}=require('node:test');
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/js/40-pages-b.js'),'utf8');
function ledger(){
  const values=new Map(),inputs=[];
  const ctx=vm.createContext({
    PAGES:{},window:{},MAPEL_LIST:['Matematika'],activeClassId:'kelas-1',
    db:{asesmenFormatif:[],asesmenSumatif:[]},
    localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},
    document:{querySelectorAll:()=>inputs},Number,String,JSON,Object,
    todayISO:()=> '2026-10-29',uid:(()=>{let n=0;return ()=>String(++n);})(),
    jenisSumatifOf:r=>r.jenisSumatif||'LM',saveDB:()=>{},toast:()=>{},playSuccessSoundIfEnabled:()=>{}
  });
  vm.runInContext(source.slice(source.indexOf('const DN_LM ='),source.indexOf('function dnKop()')),ctx);
  vm.runInContext('dnRenderTable=()=>{};dnHitungBaris=()=>{};',ctx);
  const input=(col,value,siswaid='student-1')=>{const el={dataset:{col,siswaid},value:String(value),style:{}};inputs.push(el);return el;};
  return {ctx,values,inputs,input};
}
test('Bulk drafts recover all Formatif and LM columns, including old keys and zero',()=>{
  const {ctx,values,input}=ledger(),context=ctx.dnCtx();
  for(let lm=0;lm<4;lm++){
    for(let tp=0;tp<4;tp++)ctx.dnOnInput(input('F'+lm+'-'+tp,70+lm+tp));
    ctx.dnOnInput(input('S'+lm,lm===0?0:80));
  }
  let draft=ctx.dnLoadDraft(context);
  assert.equal(Object.keys(draft).length,20);
  assert.equal(draft['F|3|3|student-1'],76);assert.equal(draft['S|0|student-1'],0);
  values.set(ctx.dnDraftKey(context),JSON.stringify({'F0-0|student-1':72,'S0|student-1':0}));
  draft=ctx.dnLoadDraft(context);assert.equal(draft['F|0|0|student-1'],72);assert.equal(draft['S|0|student-1'],0);
});
test('Save is idempotent; explicit blank deletes the matching record but leaves other scopes intact',()=>{
  const {ctx,input}=ledger();
  const f=input('F0-0',75),s=input('S0',0),sts=input('STS',70),sas=input('SAS',90);
  [f,s,sts,sas].forEach(el=>ctx.dnOnInput(el));
  ctx.dnSimpanSemua();ctx.dnSimpanSemua();
  assert.equal(ctx.db.asesmenFormatif.length,1);assert.equal(ctx.db.asesmenSumatif.length,3);
  ctx.db.asesmenSumatif.push({...ctx.db.asesmenSumatif[0],id:'semester-2',semester:'2'});
  ctx.db.asesmenFormatif[0].tp=''; // Legacy TP1 records remain editable/deletable.
  f.value='';s.value='';ctx.dnOnInput(f);ctx.dnOnInput(s);
  assert.equal(ctx.dnLoadDraft(ctx.dnCtx())['S|0|student-1'],'');
  ctx.dnSimpanSemua();
  assert.equal(ctx.db.asesmenFormatif.length,0);
  assert.equal(ctx.db.asesmenSumatif.length,3);
  assert(ctx.db.asesmenSumatif.some(r=>r.id==='semester-2'));
  assert(!ctx.db.asesmenSumatif.some(r=>r.jenisSumatif==='LM'&&r.semester==='1'));
  assert.equal(ctx.dnLoadDraft(ctx.dnCtx())['S|0|student-1'],undefined);
});
test('Drafts remain isolated between subjects, semesters and classes',()=>{
  const {ctx,input}=ledger(),context=ctx.dnCtx();
  ctx.dnOnInput(input('S0',88));
  for(const field of ['mapel','semester']){
    const original=context[field];context[field]=field==='mapel'?'Bahasa Indonesia':'2';
    assert.equal(Object.keys(ctx.dnLoadDraft(context)).length,0);context[field]=original;
  }
  ctx.activeClassId='kelas-2';assert.equal(Object.keys(ctx.dnLoadDraft(context)).length,0);
  ctx.activeClassId='kelas-1';assert.equal(ctx.dnLoadDraft(context)['S|0|student-1'],88);
});
test('Blank bulk-fill does not silently write zero',()=>{
  const {ctx,input}=ledger(),el=input('S0','');ctx.prompt=()=> '   ';
  ctx.dnIsiKolom('S0','LM1');assert.equal(el.value,'');
});
