const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/js/43-program-documents.js'),'utf8');

function fixture(){
  const controls={};
  const ctx=vm.createContext({
    db:{sekolah:{namaSekolah:'SD Uji',kelas:'1 (Satu)',tahunAjaran:'2027/2028'},guru:[],kalender:[],atp:[
      {id:'a',mapel:'Matematika',elemen:'Bilangan',tp:'TP A <utuh> & lengkap',semester:'1',alokasiWaktu:'12'},
      {id:'b',mapel:'Matematika',elemen:'Geometri',tp:'TP B',semester:'2',alokasiWaktu:'7'},
      {id:'c',mapel:'Bahasa Indonesia',elemen:'Membaca',tp:'TP C',semester:'1',alokasiWaktu:'0'}]},
    activeClassId:'kelas-1',window:{},PAGES:{},
    escapeHtml:v=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    faseForClassId:id=>id==='kelas-1'?'A':'B',classInfo:()=>({label:'Kelas Uji'}),
    fmtDate:v=>v,todayISO:()=>'2026-10-29',htmlJsArg:JSON.stringify,
    setTimeout:()=>{},renderPage:()=>{},saveDB:()=>{},closeModal:()=>{},
    document:{getElementById:id=>controls[id]},
  });
  vm.runInContext(source+'\nglobalThis.program=ProgramDocs;',ctx);
  const run=code=>vm.runInContext(code,ctx);
  run(`db.programDocumentsV1={'2027/2028':{rows:{
    a:{jp:12,months:[8,4,0,0,0,0],semester:'1',note:'Catatan A',confirmed:true},
    b:{jp:7,months:[0,0,0,0,0,7],semester:'2',confirmed:true},
    c:{jp:0,months:[0,0,0,0,0,0],semester:'1',confirmed:true}
  },budgets:{'["Matematika","1"]':12,'["Matematika","2"]':7,'["Bahasa Indonesia","1"]':0}}}`);
  return {ctx,run,controls,program:ctx.program};
}
module.exports=fixture;
