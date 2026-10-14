const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const format=require('../assets/js/76-document-format.js'),word=require('../assets/js/77-word-docx.js');
test('DOCX filename, formatting controls and examination page profiles preserve intent',()=>{
  assert.equal(format.fileName('Modul: Matematika / Kelas 1.doc'),'Modul Matematika Kelas 1.docx');assert.equal(format.fileName('Bilangan × 3'),'Bilangan × 3.docx');
  assert.equal(format.isExam('Bank Soal'),true);assert.equal(format.isExam('Modul Ajar'),false);
  assert.deepEqual(word.cleanSettings({font:'evil',size:1,line:999,paper:'bad'}),word.DEFAULT);
  assert.equal(word.cleanSettings({font:'Arial',size:'13',line:'1.15',paper:'F4',orientation:'landscape'}).size,13);
});
test('Question sections and list labels use semantic numbering without duplicate prefixes',()=>{
  assert.equal(format.headingKind('1. KISI-KISI'),'blueprint');assert.equal(format.headingKind('B. KUNCI JAWABAN'),'answers');assert.equal(format.headingKind('C Pilihan Ganda'),'');
  assert.equal(word.formatLabel(27,'a'),'aa');assert.equal(word.formatLabel(9,'I'),'IX');
  assert.deepEqual(word.stripListLabel([{text:'1. '},{text:'Murid',bold:true}],'1'),[{text:''},{text:'Murid',bold:true}]);
  assert.deepEqual(word.stripListLabel([{text:'1.5 liter'}],'1'),[{text:'1.5 liter'}]);
});
test('Wide table widths fit the page and reserve space for longer learning goals',()=>{
  const table={columns:4,rows:[{header:true,cells:[{span:1,start:0,text:'No'},{span:1,start:1,text:'Rumusan TP'},{span:1,start:2,text:'Asesmen'},{span:1,start:3,text:'JP'}]}]};
  const widths=word.widths(table,14000);assert.equal(widths.reduce((a,b)=>a+b),14000);assert(widths[1]>widths[0]*3);assert(widths.every(n=>n>0));
});
test('Primary-school fractions and powers become editable Word math, with explicit errors for unsupported syntax',()=>{
  const tree=word.mathAst('\\frac{3}{4} + x^{2}');assert.equal(tree[0].kind,'fraction');assert.equal(tree.at(-1).kind,'power');
  assert.throws(()=>word.mathAst('\\begin{matrix}'),/belum didukung/);assert.throws(()=>word.mathAst('\\frac{1}'),/belum lengkap/);
});
test('Local Word and Markdown engines are pinned with licenses; no HTML masquerading as DOCX',()=>{
  for(const file of ['assets/vendor/docx/LICENSE.txt','assets/vendor/marked/LICENSE.md'])assert(fs.readFileSync(path.join(__dirname,'..',file),'utf8').includes('MIT'));
  const ai=fs.readFileSync(path.join(__dirname,'../assets/js/80-ai.js'),'utf8');assert.doesNotMatch(ai,/a\.download.*\+"\.doc"/);assert.match(ai,/autoWord&&!truncated/);assert.match(ai,/AIDocumentFormat.FORMAT_RULES/);
  const cloud=fs.readFileSync(path.join(__dirname,'../assets/js/62-dropbox.js'),'utf8');assert.match(cloud,/contentStr instanceof Blob\?contentStr/);assert.match(cloud,/AIDocumentFormat.fileName/);
});
