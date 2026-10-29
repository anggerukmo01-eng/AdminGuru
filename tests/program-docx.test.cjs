const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const fixture=require('./program-fixture.cjs');
const unzip=require('./word-zip.cjs');
const root=path.resolve(__dirname,'..');
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
async function exported(kind,semester){
  const {ctx,program}=fixture();const dom=new JSDOM('');
  Object.assign(ctx,{document:dom.window.document,NodeFilter:dom.window.NodeFilter,Blob,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,Buffer,setImmediate,clearTimeout,setTimeout,structuredClone,atob,btoa});
  for(const file of ['assets/js/25-safety.js','assets/js/76-document-format.js','assets/vendor/docx/docx-9.6.1.min.js','assets/js/77-word-docx.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
  vm.runInContext('window.docx=docx',ctx);
  program.setSemester(semester);program.page(kind);
  const blob=await vm.runInContext(`AIGuruWord.buildBlob(ProgramDocs.html(),'Verifikasi','${kind==='annual'?'Prota':'Promes'}',{format:{font:'Times New Roman',size:11,line:1,paper:'A4',orientation:'landscape'}})`,ctx);
  const bytes=Buffer.from(await blob.arrayBuffer());const entries=unzip(bytes);
  const xml=new dom.window.DOMParser().parseFromString(entries['word/document.xml'].toString(),'application/xml');
  assert.equal(xml.querySelector('parsererror'),null);
  const nodes=(el,tag)=>Array.from(el.getElementsByTagNameNS(W,tag)),attr=(el,name)=>el.getAttributeNS(W,name);
  const tables=nodes(xml,'tbl').map(t=>({width:+attr(nodes(t,'tblW')[0],'w'),grid:nodes(t,'gridCol').map(c=>+attr(c,'w')),fixed:attr(nodes(t,'tblLayout')[0]||xml.createElement('none'),'type')==='fixed',rows:nodes(t,'tr').map(r=>({header:nodes(r,'tblHeader').length>0,cantSplit:nodes(r,'cantSplit').length>0,cells:nodes(r,'tc').map(c=>nodes(c,'t').map(n=>n.textContent).join(''))}))}));
  for(const section of nodes(xml,'sectPr')){const size=nodes(section,'pgSz')[0],margin=nodes(section,'pgMar')[0];assert.equal(attr(size,'orient'),'landscape');assert.equal(+attr(size,'w'),16838);assert.equal(+attr(size,'h'),11906);assert.equal(+attr(margin,'left'),1417);assert.equal(+attr(margin,'right'),1417);}
  for(const t of tables.filter(t=>t.rows[0].header)){assert(t.fixed);assert(t.rows[0].cantSplit);assert(t.width<=14004);assert.equal(t.grid.reduce((a,b)=>a+b,0),t.width);assert(t.grid.every(n=>n>0));assert(t.rows.every(r=>r.cells.length===t.grid.length));}
  const text=nodes(xml,'t').map(n=>n.textContent).join('');assert.match(text,/Kelas \/ Fase: 1 \(Satu\) \/ A/);assert.match(text,/2027\/2028/);assert.doesNotMatch(text,/PERLU PENINJAUAN/);
  assert(Object.keys(entries).some(n=>n.startsWith('word/footer')&&entries[n].toString().includes('PAGE')));
  assert.match(entries['word/styles.xml'].toString(),/Times New Roman/);
  return {tables,text};
}
test('Real Prota DOCX preserves exact headers, TP text, semester, JP and recap in A4 landscape',async()=>{
  const {tables}=await exported('annual','1');const t=tables.find(t=>t.grid.length===6);
  assert.deepEqual(t.rows[0].cells,['No.','Semester','Elemen / Lingkup Materi','Tujuan Pembelajaran','JP','Keterangan']);
  assert.deepEqual(t.rows[1].cells,['1','1','Bilangan','TP A <utuh> & lengkap','12','Catatan A']);
  assert.equal(t.rows[2].cells[1],'2');assert.equal(t.rows[2].cells[4],'7');
  assert.deepEqual(tables.find(t=>t.rows[0].cells[1]==='Rencana JP').rows.slice(1).map(r=>r.cells),[['1','12','12','12','0'],['2','7','7','7','0']]);
});
test('Real Promes DOCX preserves six dated months and JP values for both semesters',async()=>{
  for(const [semester,months,jp] of [['1',['Jul 2027','Agu 2027','Sep 2027','Okt 2027','Nov 2027','Des 2027'],['12','8','4','—','—','—','—']],['2',['Jan 2028','Feb 2028','Mar 2028','Apr 2028','Mei 2028','Jun 2028'],['7','—','—','—','—','—','7']]]){
    const {tables,text}=await exported('semester',semester);const t=tables.find(t=>t.grid.length===9);
    assert.deepEqual(t.rows[0].cells,['No.','Tujuan Pembelajaran','JP',...months]);assert.deepEqual(t.rows[1].cells.slice(2),jp);assert(t.grid[1]>4*t.grid[3]);
    assert.doesNotMatch(text,semester==='1'?/TP B/:/TP A/);
  }
});
