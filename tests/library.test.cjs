const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const library=require('../assets/js/86-library.js'),reader=require('../assets/js/87-book-reader.js');
const dataDir=path.join(__dirname,'../assets/data/library');
const manifest=JSON.parse(fs.readFileSync(path.join(dataDir,'manifest.json')));
const rows=manifest.parts.flatMap(file=>JSON.parse(fs.readFileSync(path.join(dataDir,file))));
const record=()=>({bookId:'3257',fingerprint:'a1b2c3',lastPage:2,totalPages:4,pages:{1:{bookmark:true,annotations:[{id:'note-1',kind:'note',color:'#3158c9',position:[.3,.5],text:'Catatan murid'},{id:'ink-1',kind:'pen',color:'#07856e',width:.004,points:[[.2,.4],[.5,.4]]}]}}});
test('Snapshot has 642 unique PDF books, official links and normalized SD levels',()=>{
  const books=library.normalizedList(rows);assert.equal(books.length,manifest.count);assert.equal(books.length,642);
  assert.equal(new Set(books.map(b=>b.id)).size,642);assert(books.every(b=>b.pdf.startsWith('https://')));
  assert.equal(books.filter(b=>b.level==='SD/MI').length,174);
  const book=books.find(b=>b.id==='3257');assert.equal(book.grade,'1');assert.equal(book.kind,'siswa');assert.match(book.detail,/bahasa-indonesia-aku-bisa/);
  assert(library.match(book,{q:'Sofie',level:'SD/MI',grade:'1',kind:'siswa'}));assert(!library.match(book,{grade:'2'}));
  assert(library.match(book,{q:'978-623-118-362-0'}));
});
test('Catalogue rejects untrusted URLs, executable protocols and non-PDF items',()=>{
  for(const url of ['javascript:alert(1)','https://evil.invalid/a.pdf','http://static-sc.cloudapp.web.id/a.pdf','https://user:pw@static-sc.cloudapp.web.id/a.pdf'])assert.equal(library.safeUrl(url),'');
  assert.equal(library.normalize({id:1,title:'Audio',type:'audio'}),null);
  assert.equal(library.normalize({id:'<img>',title:'Bad'}),null);
  assert.throws(()=>library.normalizedList([]),/kosong/);
  assert.equal(library.normalizedList([rows[0],rows[0]]).length,1);
});
test('Backup validation preserves normalized coordinates and separates PDF versions',()=>{
  const clean=library.validateRecord(record());assert.equal(clean.id,'3257@a1b2c3');assert.deepEqual(clean.pages['1'].annotations[1].points,[[.2,.4],[.5,.4]]);
  assert.notEqual(clean.id,library.editionKey('3257','newVersion'));
  assert.equal(library.validateRecord({...record(),bookId:'local-'+('a'.repeat(24))}).bookId,'local-'+('a'.repeat(24)));
});
test('Malformed backups fail before import: IDs, colors, coordinates, page keys and size',()=>{
  for(const bookId of ['3257<script>','xlocal-aaaa','local-abc','1@bad'])assert.throws(()=>library.validateRecord({...record(),bookId}));
  for(const bad of [r=>r.pages[1].annotations[0].color='red;position:fixed',r=>r.pages[1].annotations[0].position=[1.01,.5],r=>r.pages[1].annotations[1].points=[[NaN,0]],r=>r.pages[1].annotations[0].text='a'.repeat(2001),r=>r.pages['0']=r.pages[1],r=>r.pages[1].annotations={}]){const r=record();bad(r);assert.throws(()=>library.validateRecord(r));}
});
test('Pointer positions stay proportional and eraser finds segments between points',()=>{
  assert.deepEqual(reader.point({clientX:160,clientY:250},{left:10,top:50,width:300,height:400}),[.5,.5]);
  assert.deepEqual(reader.point({clientX:310,clientY:450},{left:10,top:50,width:600,height:800}),[.5,.5]);
  assert.deepEqual(reader.point({clientX:-10,clientY:1000},{left:0,top:0,width:100,height:100}),[0,1]);
  assert(reader.strokeDistance([.5,.51],[[.1,.5],[.9,.5]])<.011);
  assert(reader.strokeDistance([.5,.1],[[.1,.5],[.9,.5]])>.39);
});
