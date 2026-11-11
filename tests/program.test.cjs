const {test}=require('node:test');
const assert=require('node:assert/strict');
const fixture=require('./program-fixture.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));

test('Prota has exact six-column rows, full TP, semester totals and separate subject budgets',()=>{
  const {program}=fixture();program.page('annual');const html=program.html();
  assert.match(html,/<th>No\.<\/th><th>Semester<\/th><th>Elemen \/ Lingkup Materi<\/th><th>Tujuan Pembelajaran<\/th><th>JP<\/th><th>Keterangan<\/th>/);
  assert.match(html,/<td>1<\/td><td>1<\/td><td>Bilangan<\/td><td>TP A &lt;utuh&gt; &amp; lengkap<\/td><td>12<\/td><td>Catatan A<\/td>/);
  assert.match(html,/<td>1<\/td><td>12<\/td><td>12<\/td><td>12<\/td><td>0<\/td>/);
  assert.match(html,/<td>2<\/td><td>7<\/td><td>7<\/td><td>7<\/td><td>0<\/td>/);
  assert.deepEqual(plain(program.issues(program.rows())),[]);
});

test('Promes has nine columns, correct academic-year rollover, filtering and all monthly JP',()=>{
  const {program,run}=fixture();program.page('semester');program.filter('Matematika');
  let html=program.html();assert.match(html,/<th>Jul 2027<\/th><th>Agu 2027<\/th><th>Sep 2027<\/th><th>Okt 2027<\/th><th>Nov 2027<\/th><th>Des 2027<\/th>/);
  assert.match(html,/<td>12<\/td><td>8<\/td><td>4<\/td><td>—<\/td><td>—<\/td><td>—<\/td><td>—<\/td>/);assert.doesNotMatch(html,/TP B|TP C/);
  program.setSemester('2');program.page('semester');html=program.html();
  assert.match(html,/Semester: 2 \(Genap\)/);assert.match(html,/<th>Jan 2028<\/th>.*<th>Jun 2028<\/th>/);
  assert.match(html,/<td>TP B<\/td><td>7<\/td><td>—<\/td><td>—<\/td><td>—<\/td><td>—<\/td><td>—<\/td><td>7<\/td>/);assert.doesNotMatch(html,/TP A|TP C/);
  run(`db.kalender=[{tanggal:'2028-01-05',judul:'Agenda genap',jenis:'Sekolah'},{tanggal:'2027-07-05',judul:'Agenda ganjil',jenis:'Sekolah'},{tanggal:'2029-01-05',judul:'Tahun lain',jenis:'Sekolah'}]`);
  html=program.html();assert.match(html,/Agenda genap/);assert.doesNotMatch(html,/Agenda ganjil|Tahun lain/);
});

test('Unknown, zero, mismatch and unconfirmed JP remain distinct draft states',()=>{
  const {program,run}=fixture();
  run(`db.atp[0].alokasiWaktu='2 x 35 menit';delete db.programDocumentsV1['2027/2028'].rows.a`);
  assert.equal(program.rows()[0].jp,null);assert.equal(program.rows()[2].jp,0);
  assert.match(program.issues(program.rows()).join('\n'),/konfirmasi total JP/);
  run(`db.programDocumentsV1['2027/2028'].rows.a={jp:12,months:[8,0,0,0,0,0],semester:'1',confirmed:true};db.programDocumentsV1['2027/2028'].budgets['["Matematika","1"]']=13`);
  assert.match(program.issues(program.rows()).join('\n'),/selisih antara total JP dan sebaran bulan/);
  assert.match(program.issues(program.rows()).join('\n'),/rencana 12 JP, target 13 JP/);
  run(`db.atp[1].semester='';delete db.programDocumentsV1['2027/2028'].rows.b`);assert.match(program.issues(program.rows()).join('\n'),/semester 1\/2/);
});

test('Academic year and class stores isolate overrides and restore the original allocation',()=>{
  const {program,run}=fixture();
  run(`db.sekolah.tahunAjaran='2028/2029'`);assert.equal(program.rows()[0].confirmed,false);assert.deepEqual(plain(program.rows()[0].months),[0,0,0,0,0,0]);
  run(`db.sekolah.tahunAjaran='2027/2028'`);assert.equal(program.rows()[0].months[0],8);
  run(`globalThis.savedDB=db;db={...db,sekolah:{...db.sekolah,kelas:'4 (Empat)'},programDocumentsV1:{}};activeClassId='kelas-4'`);
  assert.equal(program.rows()[0].confirmed,false);assert.match(program.html(),/Kelas \/ Fase: 4 \(Empat\) \/ B/);
  run(`db=savedDB;activeClassId='kelas-1'`);assert.equal(program.rows()[0].months[0],8);
});

test('Invalid academic years never silently produce a dated month matrix',()=>{
  const {program,run}=fixture();
  for(const year of ['2027/2027','2027/2029','2027','']){
    run(`db.sekolah.tahunAjaran=${JSON.stringify(year)}`);
    assert.match(program.issues(program.rows()).join('\n'),/Tahun ajaran belum valid/);
    assert(program.months('1').every(m=>m.year==='—'&&m.iso===''));
  }
});

test('Allocation editor rejects negative, decimal, empty and excessive distributions without saving',()=>{
  const {program,controls}=fixture();
  function inputs(jp,months){controls.pdJP={value:jp};months.forEach((v,i)=>controls['pdM'+i]={value:v});controls.pdSemester={value:'2'};controls.pdNote={value:'Catatan revisi'};controls.pdError={textContent:''};}
  for(const [jp,months] of [['-1',['0','0','0','0','0','0']],['1.5',['0','0','0','0','0','0']],['',['0','0','0','0','0','0']],['12',['13','0','0','0','0','0']],['12',['','0','0','0','0','0']]]){
    inputs(jp,months);program.saveRow('a');assert.match(controls.pdError.textContent,/bilangan bulat/);assert.equal(program.rows()[0].jp,12);assert.equal(program.rows()[0].semester,'1');
  }
  inputs('0',['0','0','0','0','0','0']);program.saveRow('a');assert.equal(program.rows()[0].jp,0);assert.equal(program.rows()[0].semester,'2');assert.equal(program.rows()[0].confirmed,true);
});
