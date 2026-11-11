/* Export contract tests. Word pagination is a separate manual acceptance step. */
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const unzip=require('./word-zip.cjs');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'test-results/program-consistency');
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://local').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
  fs.createReadStream(file).on('error',()=>res.writeHead(404).end()).pipe(res);
});
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
    const page=await browser.newPage({viewport:{width:1440,height:1100}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',r=>r.abort());
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.getByRole('button',{name:'Buka Aplikasi'}).click();
    // Capture the actual blob handed to the local renderer, then compare with the download.
    await page.evaluate(()=>{
      const build=AIGuruWord.buildBlob;
      AIGuruWord.buildBlob=async(...args)=>{
        const blob=await build(...args);window.lastProgramBytes=Array.from(new Uint8Array(await blob.arrayBuffer()));return blob;
      };
      Object.assign(db.sekolah,{namaSekolah:'SD KONSISTENSI',tahunAjaran:'2027/2028',kepalaSekolah:'Kepala Uji',nipKepsek:'0012345'});
      db.atp=[{id:'a',mapel:'Matematika',elemen:'Bilangan',tp:'TP-A: Menghitung benda <utuh> & lengkap.',semester:'1',alokasiWaktu:'12'},
        {id:'b',mapel:'Matematika',elemen:'Geometri',tp:'TP-B: Mengenali bentuk.',semester:'2',alokasiWaktu:'7'}];
      db.programDocumentsV1={'2027/2028':{rows:{
        a:{jp:12,months:[8,4,0,0,0,0],semester:'1',note:'CATATAN-A',confirmed:true},
        b:{jp:7,months:[0,0,0,0,0,7],semester:'2',note:'CATATAN-B',confirmed:true}
      },budgets:{'["Matematika","1"]':12,'["Matematika","2"]':7}}};saveDB();navigate('progtahunan');
    });
    async function ready(){
      await page.waitForFunction(()=>document.getElementById('programStatus')?.textContent.startsWith('Pratinjau dari'),{},{timeout:30000});
    }
    async function exported(name){
      await ready();const pending=page.waitForEvent('download');await page.locator('#programDownload').click();
      const download=await pending;await download.saveAs(path.join(out,name+'.docx'));
      const bytes=fs.readFileSync(path.join(out,name+'.docx'));
      assert.deepEqual(bytes,Buffer.from(await page.evaluate(()=>window.lastProgramBytes)),'Preview and download must use identical bytes');
      const entries=unzip(bytes);assert(entries['[Content_Types].xml']);
      const xml=entries['word/document.xml'].toString();
      const model=await page.evaluate(xml=>{
        const doc=new DOMParser().parseFromString(xml,'application/xml');
        if(doc.querySelector('parsererror'))throw Error('Invalid OOXML');
        const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
        const nodes=(el,tag)=>Array.from(el.getElementsByTagNameNS(W,tag));
        const attr=(el,name)=>el.getAttributeNS(W,name);
        return {text:nodes(doc,'t').map(n=>n.textContent).join(''),sections:nodes(doc,'sectPr').map(s=>{
          const size=nodes(s,'pgSz')[0],margin=nodes(s,'pgMar')[0];
          return {width:+attr(size,'w'),height:+attr(size,'h'),orientation:attr(size,'orient'),left:+attr(margin,'left'),right:+attr(margin,'right')};
        }),tables:nodes(doc,'tbl').map(t=>({
          width:+attr(nodes(t,'tblW')[0],'w'),layout:attr(nodes(t,'tblLayout')[0]||doc.createElement('none'),'type'),
          grid:nodes(t,'gridCol').map(c=>+attr(c,'w')),
          rows:nodes(t,'tr').map(r=>({header:nodes(r,'tblHeader').length>0,cantSplit:nodes(r,'cantSplit').length>0,cells:nodes(r,'tc').map(c=>nodes(c,'t').map(n=>n.textContent).join(''))}))
        }))};
      },xml);
      assert(model.sections.length>0);
      for(const s of model.sections){assert.equal(s.orientation,'landscape');assert.equal(s.width,16838);assert.equal(s.height,11906);assert.equal(s.left,1417);assert.equal(s.right,1417);}
      for(const t of model.tables.filter(t=>t.rows[0].header)){
        assert(t.rows[0].cantSplit,'Header must not split');assert.equal(t.layout,'fixed');
        assert.equal(t.grid.reduce((a,b)=>a+b,0),t.width);assert(t.grid.every(w=>w>0));
        assert(t.width<=model.sections[0].width-2834,'Table must fit printable width');
        for(const row of t.rows)assert.equal(row.cells.length,t.grid.length,'Rectangular table');
      }
      assert.match(model.text,/SD KONSISTENSI/);assert.match(model.text,/2027\/2028/);assert.match(model.text,/Kelas \/ Fase: 1 \(Satu\) \/ A/);
      assert.doesNotMatch(model.text,/PERLU PENINJAUAN/);
      assert(Object.keys(entries).some(n=>n.startsWith('word/footer')),'Footer with page number');
      return model;
    }
    let model=await exported('prota');
    let table=model.tables.find(t=>t.rows[0].cells[1]==='Semester'&&t.grid.length===6);
    assert.deepEqual(table.rows[0].cells,['No.','Semester','Elemen / Lingkup Materi','Tujuan Pembelajaran','JP','Keterangan']);
    assert.deepEqual(table.rows[1].cells,['1','1','Bilangan','TP-A: Menghitung benda <utuh> & lengkap.','12','CATATAN-A']);
    assert.deepEqual(table.rows[2].cells,['2','2','Geometri','TP-B: Mengenali bentuk.','7','CATATAN-B']);
    assert.deepEqual(model.tables.find(t=>t.rows[0].cells[1]==='Rencana JP').rows.slice(1).map(r=>r.cells),[['1','12','12','12','0'],['2','7','7','7','0']]);
    await page.evaluate(()=>navigate('progsemester'));model=await exported('promes-ganjil');
    table=model.tables.find(t=>t.grid.length===9);
    assert.deepEqual(table.rows[0].cells,['No.','Tujuan Pembelajaran','JP','Jul 2027','Agu 2027','Sep 2027','Okt 2027','Nov 2027','Des 2027']);
    assert.deepEqual(table.rows[1].cells,['1','TP-A: Menghitung benda <utuh> & lengkap.','12','8','4','—','—','—','—']);
    assert.doesNotMatch(model.text,/TP-B/);assert(table.grid[1]>table.grid[3]*4,'TP column reserves space');
    await page.evaluate(()=>ProgramDocs.setSemester('2'));model=await exported('promes-genap');
    table=model.tables.find(t=>t.grid.length===9);
    assert.deepEqual(table.rows[0].cells.slice(3),['Jan 2028','Feb 2028','Mar 2028','Apr 2028','Mei 2028','Jun 2028']);
    assert.deepEqual(table.rows[1].cells,['1','TP-B: Mengenali bentuk.','7','—','—','—','—','—','7']);assert.doesNotMatch(model.text,/TP-A/);
    await page.evaluate(()=>{
      db.atp=Array.from({length:72},(_,i)=>({id:'long-'+i,mapel:'Matematika',elemen:'Bilangan',semester:'1',alokasiWaktu:'6',tp:`BARIS-${String(i).padStart(3,'0')}: Murid menjelaskan strategi penjumlahan dan pengurangan dengan benda konkret, membandingkan hasil, serta menyampaikan alasan secara lisan dan tertulis.`}));
      const store=db.programDocumentsV1['2027/2028'];store.rows={};store.budgets={'["Matematika","1"]':432};
      db.atp.forEach(a=>store.rows[a.id]={jp:6,months:[1,1,1,1,1,1],semester:'1',confirmed:true});
      ProgramDocs.setSemester('1');
    });
    model=await exported('promes-panjang');
    table=model.tables.find(t=>t.grid.length===9);assert.equal(table.rows.length,73);
    const pagination=await page.evaluate(()=>{
      const pages=[...document.querySelectorAll('#programPreview section.program-word')];
      const text=document.getElementById('programPreview').textContent;
      return {browserPages:pages.length,markers:Array.from({length:72},(_,i)=>{const marker=`BARIS-${String(i).padStart(3,'0')}:`;return {marker,count:text.split(marker).length-1};}),
        overflowingPages:pages.filter(p=>p.scrollHeight>p.clientHeight+2).length};
    });
    assert(pagination.browserPages>0);assert(pagination.markers.every(r=>r.count===1),'No missing or duplicated TP in preview');
    await page.screenshot({path:path.join(out,'long-preview.png')});
    fs.writeFileSync(path.join(out,'pagination.json'),JSON.stringify({fixture:'72 TP, 432 JP, A4 landscape, TNR 11',...pagination,wordPages:null,note:'Word layout not measured; page-count equality is not an acceptance criterion.'},null,2));
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS OOXML column/cell contracts, headers, A4 landscape, margins, widths, identity, JP, months, identical preview/download bytes; 72-row preview preserves all TP.');
    console.log(JSON.stringify({browserPages:pagination.browserPages,overflowingPages:pagination.overflowingPages,wordPages:'not measured'}));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
