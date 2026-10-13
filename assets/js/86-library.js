/* Perpustakaan AdminGuru: metadata only; books remain on the SIBI source servers. */
const BookLibrary=(function(){
  'use strict';
  const SOURCE='https://buku.kemendikdasmen.go.id/katalog/buku-kurikulum-merdeka';
  const API='https://api.buku.cloudapp.web.id/api/catalogue/getPenggerakTextBooks?limit=1000&type_pdf&order_by=updated_at';
  const HOSTS=new Set(['static.sc.cloudapp.web.id','static-sc.cloudapp.web.id','files.cloudapp.web.id','buku.kemendikdasmen.go.id','static.buku.kemendikdasmen.go.id','static.buku.kemdikbud.go.id','repositori.kemendikdasmen.go.id']);
  const SUBJECTS={bahasa_indonesia:'Bahasa Indonesia',bahasa_inggris:'Bahasa Inggris',matematika:'Matematika',ipas:'IPAS',pendidikan_pancasila:'Pendidikan Pancasila',pancasila:'Pendidikan Pancasila',ppkn:'Pendidikan Pancasila',pjok:'PJOK',seni_musik:'Seni Musik',seni_rupa:'Seni Rupa',seni_tari:'Seni Tari',seni_teater:'Seni Teater',agama_islam:'Agama Islam',agama_kristen:'Agama Kristen',agama_katolik:'Agama Katolik',agama_hindu:'Agama Hindu',agama_buddha:'Agama Buddha',agama_khonghucu:'Agama Khonghucu',koding:'Koding & KA'};
  let books=[],locals=[],records=[],loaded=false,loading=null,lastUpdated='2026-10-13',live=false;
  let filter={q:'',level:'SD/MI',grade:'',subject:'',kind:'',view:'all',sort:'latest',page:1};
  let favorites=[];try{const saved=JSON.parse(localStorage.getItem('adminguru_library_favorites_v1')||'[]');favorites=Array.isArray(saved)?saved.filter(x=>typeof x==='string').slice(0,2000):[];}catch(e){}
  let dbPromise;
  function safeUrl(value){try{const u=new URL(String(value||''));return u.protocol==='https:'&&!u.username&&!u.password&&HOSTS.has(u.hostname)?u.href:'';}catch(e){return '';}}
  function levelLabel(value){const l=String(value||'').trim().toUpperCase();if(/^SD(?:\/MI)?$/.test(l))return 'SD/MI';if(/^SMP/.test(l))return 'SMP/MTs';if(/^SMA/.test(l))return 'SMA/MA/SMK';if(/^SMK/.test(l))return 'SMK/MAK';if(l==='A'||l==='PAUD')return 'PAUD';if(/DIKSUS|KHUSUS/.test(l))return 'Pendidikan Khusus';return String(value||'Lainnya').trim();}
  function normalize(raw){
    if(!raw||typeof raw!=='object'||!/^\d+$/.test(String(raw.id||''))||!raw.title||(raw.type&&raw.type!=='pdf'))return null;
    return {id:String(raw.id),title:String(raw.title).trim().slice(0,500),slug:String(raw.slug||'').slice(0,500),image:safeUrl(raw.image),pdf:safeUrl(raw.attachment),grade:String(raw.class||'').trim(),level:levelLabel(raw.level),subject:String(raw.subject||'').trim().toLowerCase(),kind:raw.book_type==='buku_guru'?'guru':'siswa',writer:String(raw.writer||'').slice(0,1000),publisher:String(raw.publisher||'').slice(0,300),isbn:String(raw.isbn||'').slice(0,100),edition:String(raw.edition||'').slice(0,100),year:String(raw.published_year||'').slice(0,4),source:SOURCE,detail:SOURCE.replace('buku-kurikulum-merdeka',encodeURIComponent(String(raw.slug||'')))};
  }
  function normalizedList(rows){if(!Array.isArray(rows)||rows.length>5000)throw new Error('Format katalog tidak sesuai.');const map=new Map();rows.forEach(raw=>{const book=normalize(raw);if(book)map.set(book.id,book);});if(!map.size)throw new Error('Katalog kosong.');return Array.from(map.values());}
  function subjectLabel(subject){return SUBJECTS[subject]||String(subject||'Umum').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
  function match(book,f){
    const q=String(f.q||'').toLocaleLowerCase('id').trim();
    if(q&&!(book.title+' '+book.writer+' '+book.isbn+' '+subjectLabel(book.subject)).toLocaleLowerCase('id').includes(q))return false;
    if(f.level&&book.level!==f.level)return false;if(f.grade&&book.grade!==f.grade)return false;if(f.subject&&book.subject!==f.subject)return false;if(f.kind&&book.kind!==f.kind)return false;return true;
  }
  function editionKey(bookId,fingerprint){return String(bookId)+'@'+String(fingerprint);}
  function db(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(typeof indexedDB==='undefined'){reject(new Error('Penyimpanan catatan tidak didukung peramban ini.'));return;}
      const request=indexedDB.open('adminguru_library_v1',1);
      request.onupgradeneeded=()=>['records','catalog','files','localBooks'].forEach(name=>request.result.createObjectStore(name,{keyPath:'id'}));
      request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
      request.onerror=()=>{dbPromise=null;reject(request.error||new Error('Penyimpanan tidak dapat dibuka.'));};
    });return dbPromise;
  }
  async function transaction(name,mode,action){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction(name,mode),req=action(tx.objectStore(name));let value;req.onsuccess=()=>{value=req.result;};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error||new Error('Penyimpanan gagal.'));tx.onabort=()=>reject(tx.error||new Error('Penyimpanan penuh atau dibatalkan.'));});}
  const get=(store,id)=>transaction(store,'readonly',s=>s.get(id));
  const all=store=>transaction(store,'readonly',s=>s.getAll());
  const put=(store,value)=>transaction(store,'readwrite',s=>s.put(value));
  const remove=(store,id)=>transaction(store,'readwrite',s=>s.delete(id));
  async function refreshRecords(){try{records=await all('records');locals=await all('localBooks');}catch(error){records=[];locals=[];}return records;}
  function knownBooks(){return books.concat(locals);}
  function recordFor(id){return records.filter(r=>r.bookId===id).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0];}
  async function saveRecord(record){await put('records',record);const i=records.findIndex(r=>r.id===record.id);if(i>=0)records[i]=record;else records.push(record);if(typeof document!=='undefined'&&!document.getElementById('bookReader'))render();}
  async function load(){
    if(loaded)return books;if(loading)return loading;
    loading=(async()=>{
      await refreshRecords();
      try{const cached=await get('catalog','latest');if(cached&&Array.isArray(cached.books)&&cached.books.length){books=cached.books;lastUpdated=cached.updatedAt;}}
      catch(error){}
      if(!books.length){const manifest=await fetch('assets/data/library/manifest.json').then(r=>{if(!r.ok)throw new Error('Katalog cadangan tidak dapat dimuat.');return r.json();});
        const parts=await Promise.all(manifest.parts.map(name=>{if(!/^catalog-\d+\.json$/.test(name))throw new Error('Bagian katalog tidak valid.');return fetch('assets/data/library/'+name).then(r=>{if(!r.ok)throw new Error('Sebagian katalog belum termuat.');return r.json();});}));
        books=normalizedList(parts.flat());lastUpdated=manifest.updatedAt;
      }
      loaded=true;return books;
    })().finally(()=>{loading=null;});return loading;
  }
  async function refresh(){
    const button=document.getElementById('libraryRefresh');if(button)button.disabled=true;
    status('Mengambil katalog terbaru dari SIBI…');
    try{const response=await fetch(API,{credentials:'omit',signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('SIBI mengembalikan status '+response.status);const payload=await response.json();const next=normalizedList(payload.results);
      books=next;lastUpdated=todayISO();live=true;loaded=true;
      try{await put('catalog',{id:'latest',books,updatedAt:lastUpdated});}catch(error){toast('Katalog diperbarui; cache perangkat belum tersimpan.');}
      filter.page=1;await mount();status('Katalog diperbarui dari SIBI.');
    }catch(error){status('SIBI belum dapat dihubungi. Katalog tersimpan tetap dapat dicari.');toast('Pembaruan katalog gagal: '+error.message);}
    finally{if(button&&button.isConnected)button.disabled=false;}
  }
  function status(message){const el=document.getElementById('libraryStatus');if(el)el.textContent=message;}
  function selectedBooks(){
    let result=knownBooks().filter(book=>match(book,filter));
    if(filter.view==='favorites')result=result.filter(b=>favorites.includes(b.id));
    if(filter.view==='recent')result=result.filter(b=>!!recordFor(b.id));
    if(filter.view==='notes')result=result.filter(b=>records.some(r=>r.bookId===b.id&&Object.values(r.pages||{}).some(page=>page.annotations?.length||page.bookmark)));
    if(filter.sort==='title')result.sort((a,b)=>a.title.localeCompare(b.title,'id'));
    else if(filter.sort==='recent'||filter.view==='recent')result.sort((a,b)=>String(recordFor(b.id)?.updatedAt||'').localeCompare(String(recordFor(a.id)?.updatedAt||'')));
    else result.sort((a,b)=>String(b.year||'').localeCompare(String(a.year||''))||Number(b.id)-Number(a.id));
    return result;
  }
  function setFilter(name,value){if(!Object.keys(filter).includes(name))return;filter[name]=String(value);filter.page=1;render();}
  function setView(view){if(!['all','favorites','recent','notes'].includes(view))return;filter.view=view;filter.page=1;if(view!=='all'){filter={...filter,q:'',level:'',grade:'',subject:'',kind:''};syncControls();}render();}
  function clearFilters(){filter={...filter,q:'',level:'',grade:'',subject:'',kind:'',page:1};syncControls();render();}
  function syncControls(){for(const name of ['q','level','grade','subject','kind','sort']){const el=document.getElementById('library_'+name);if(el)el.value=filter[name];}}
  function page(direction){filter.page=Math.max(1,filter.page+direction);render();document.getElementById('libraryGrid')?.scrollIntoView({block:'start',behavior:'smooth'});}
  function toggleFavorite(id){const next=favorites.includes(id)?favorites.filter(x=>x!==id):favorites.concat(id);try{localStorage.setItem('adminguru_library_favorites_v1',JSON.stringify(next));favorites=next;render();}catch(error){toast('Favorit belum tersimpan. Periksa ruang penyimpanan.');}}
  function svgBook(){return '<svg viewBox="0 0 80 90" aria-hidden="true"><path d="M17 9h49v73H17a9 9 0 0 1-9-9V18a9 9 0 0 1 9-9Z" fill="currentColor" opacity=".15"/><path d="M20 9v65m0 0h46M32 29h23M32 40h18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';}
  function card(book,index){
    const rec=recordFor(book.id),fav=favorites.includes(book.id),marked=records.filter(r=>r.bookId===book.id).reduce((sum,r)=>sum+Object.values(r.pages||{}).reduce((n,page)=>n+(page.annotations?.length||0)+(page.bookmark?1:0),0),0);
    const color=['indigo','teal','amber','coral','blue','violet'][index%6];
    return `<article class="library-book tone-${color}"><div class="library-cover"><button class="library-cover-open" aria-label="Baca ${escapeHtml(book.title)}" onclick="BookLibrary.open(${htmlJsArg(book.id)})"><span class="cover-placeholder">${svgBook()}<span>${escapeHtml(subjectLabel(book.subject))}</span></span>${book.image?`<img loading="lazy" decoding="async" src="${escapeHtml(book.image)}" alt="Sampul ${escapeHtml(book.title)}" onload="this.classList.add('loaded')" onerror="this.remove()">`:''}</button><button class="library-favorite ${fav?'active':''}" aria-label="${fav?'Hapus dari':'Tambah ke'} favorit: ${escapeHtml(book.title)}" aria-pressed="${fav}" onclick="BookLibrary.toggleFavorite(${htmlJsArg(book.id)})">${ic('star',17)}</button><span class="library-kind">${book.kind==='guru'?'Panduan Guru':book.local?'PDF Lokal':'Buku Murid'}</span></div><div class="library-book-info"><div class="library-book-meta">${escapeHtml(book.level)}${book.grade?' · Kelas '+escapeHtml(book.grade):''}</div><h3>${escapeHtml(book.title)}</h3><div class="library-book-subject">${escapeHtml(subjectLabel(book.subject))}</div>${marked?`<span class="library-note-count">${ic('edit',12)} ${marked} catatan/penanda</span>`:''}<button class="btn library-read" onclick="BookLibrary.open(${htmlJsArg(book.id)})">${ic('book',15)} ${rec?'Lanjut halaman '+rec.lastPage:'Baca buku'} ${ic('chevronRight',15)}</button></div></article>`;
  }
  function render(){
    const root=document.getElementById('libraryGrid');if(!root)return;
    const result=selectedBooks(),size=20,pages=Math.max(1,Math.ceil(result.length/size));filter.page=Math.min(filter.page,pages);
    root.innerHTML=result.length?result.slice((filter.page-1)*size,filter.page*size).map(card).join(''):`<div class="library-empty">${svgBook()}<h2>Belum ada buku di rak ini</h2><p>${filter.view==='all'?'Coba kata kunci atau filter yang berbeda.':'Simpan favorit, baca buku, atau buat catatan untuk mengisi rak ini.'}</p><button class="btn" onclick="BookLibrary.clearFilters()">Tampilkan semua kelas & jenjang</button></div>`;
    document.getElementById('libraryCount').textContent=result.length+' buku'+(filter.grade?' · Kelas '+filter.grade:'');
    document.getElementById('librarySourceDate').textContent=(live?'Diperbarui dari SIBI':'Salinan katalog')+' · '+lastUpdated+' · '+books.length+' buku PDF';
    document.getElementById('libraryPager').innerHTML=`<button class="btn" ${filter.page<=1?'disabled':''} onclick="BookLibrary.page(-1)">← Sebelumnya</button><span>Halaman ${filter.page} / ${pages}</span><button class="btn" ${filter.page>=pages?'disabled':''} onclick="BookLibrary.page(1)">Berikutnya →</button>`;
    document.querySelectorAll('.library-tabs button').forEach(button=>{const active=button.dataset.view===filter.view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  }
  async function mount(){try{await load();if(document.getElementById('libraryGrid')){const subjects=[...new Set(knownBooks().map(b=>b.subject).filter(Boolean))].sort((a,b)=>subjectLabel(a).localeCompare(subjectLabel(b),'id'));document.getElementById('library_subject').innerHTML='<option value="">Semua mapel</option>'+subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(subjectLabel(s))}</option>`).join('');syncControls();render();}}catch(error){const el=document.getElementById('libraryGrid');if(el)el.innerHTML=`<div class="library-empty"><h2>Katalog belum termuat</h2><p>${escapeHtml(error.message)}</p><button class="btn" onclick="BookLibrary.mount()">Coba lagi</button><a class="btn" href="${SOURCE}" target="_blank" rel="noopener noreferrer">Buka SIBI</a></div>`;}}
  function view(initial){if(initial)filter.view=initial;if(initial&&initial!=='all')filter={...filter,q:'',level:'',grade:'',subject:'',kind:'',page:1};else if(!filter.grade&&!loaded)filter.grade=String(classInfo(activeClassId).angka);setTimeout(mount,0);
    return `<section class="library-hero"><div><span class="library-eyebrow">PERPUSTAKAAN DIGITAL · SUMBER SIBI</span><h1>Temukan buku.<br><span>Luaskan inspirasi.</span></h1><p>Buku murid dan panduan guru, tertata dalam satu ruang baca.</p><div class="library-hero-pills"><span>${ic('book',15)} Kurikulum Merdeka</span><span>${ic('edit',15)} Catatan pribadi per halaman</span></div></div><div class="library-hero-books" aria-hidden="true"><span>ILMU</span><span>IDE</span><span>CERITA</span></div></section><div class="library-toolbar"><div class="library-search">${ic('search',20)}<input id="library_q" type="search" aria-label="Cari buku" placeholder="Cari judul, penulis, ISBN, atau mata pelajaran…" oninput="BookLibrary.setFilter('q',this.value)"></div><button class="btn" id="libraryRefresh" onclick="BookLibrary.refresh()">${ic('refresh',16)} Perbarui katalog</button></div><details class="library-filter-panel"${window.innerWidth>700?' open':''}><summary>Filter buku & urutan</summary><div class="library-filters"><label>Jenjang<select id="library_level" onchange="BookLibrary.setFilter('level',this.value)"><option value="">Semua jenjang</option>${['PAUD','SD/MI','SMP/MTs','SMA/MA/SMK','SMK/MAK','Pendidikan Khusus'].map(l=>`<option>${l}</option>`).join('')}</select></label><label>Kelas<select id="library_grade" onchange="BookLibrary.setFilter('grade',this.value)"><option value="">Semua kelas</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}">Kelas ${i+1}</option>`).join('')}</select></label><label>Mata pelajaran<select id="library_subject" onchange="BookLibrary.setFilter('subject',this.value)"><option value="">Semua mapel</option></select></label><label>Jenis buku<select id="library_kind" onchange="BookLibrary.setFilter('kind',this.value)"><option value="">Murid & Guru</option><option value="siswa">Buku Murid</option><option value="guru">Panduan Guru</option></select></label><label>Urutan<select id="library_sort" onchange="BookLibrary.setFilter('sort',this.value)"><option value="latest">Terbaru</option><option value="title">Judul A–Z</option><option value="recent">Terakhir dibaca</option></select></label></div></details><div class="library-shelf-head"><div class="library-tabs" aria-label="Rak buku"><button data-view="all" onclick="BookLibrary.setView('all')">Semua buku</button><button data-view="favorites" onclick="BookLibrary.setView('favorites')">${ic('star',14)} Favorit</button><button data-view="recent" onclick="BookLibrary.setView('recent')">Lanjut baca</button><button data-view="notes" onclick="BookLibrary.setView('notes')">Catatan saya</button></div><strong id="libraryCount">Menyiapkan rak…</strong></div><p class="library-source" id="librarySourceDate">Katalog dari Sistem Informasi Perbukuan Indonesia</p><div id="libraryGrid" class="library-grid" aria-live="polite"><div class="library-empty"><span class="ai-spin"></span><p>Menata buku di rak…</p></div></div><div class="library-pager" id="libraryPager"></div><div class="library-foot"><span id="libraryStatus" role="status">Catatan dan penanda disimpan di perangkat ini.</span><div><button class="text-btn" onclick="BookLibrary.exportNotes()">${ic('download',15)} Cadangkan catatan</button><button class="text-btn" onclick="document.getElementById('libraryImport').click()">Pulihkan catatan</button><button class="text-btn" onclick="document.getElementById('libraryLocalPdf').click()">Tambah PDF lokal</button><a class="text-btn" href="${SOURCE}" target="_blank" rel="noopener noreferrer">Katalog resmi ↗</a></div><input type="file" id="libraryImport" accept=".json,application/json" hidden onchange="BookLibrary.importNotes(this)"><input type="file" id="libraryLocalPdf" accept=".pdf,application/pdf" hidden onchange="BookLibrary.importPdf(this)"></div>`;
  }
  async function open(id){try{await load();const book=knownBooks().find(b=>b.id===id);if(!book){toast('Buku belum tersedia dalam katalog ini.');return;}await BookReader.open(book);}catch(error){toast(error.message);}}
  function validPoint(p){return Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1);}
  function validateRecord(value){
    if(!value||typeof value!=='object'||!/^(?:\d+|local-[a-f0-9]{24})$/.test(String(value.bookId))||typeof value.fingerprint!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(value.fingerprint))throw new Error('Identitas catatan tidak valid.');
    const id=editionKey(value.bookId,value.fingerprint);const pages={};let count=0,points=0;
    if(!value.pages||typeof value.pages!=='object'||Array.isArray(value.pages))throw new Error('Format halaman tidak valid.');
    for(const [page,entry] of Object.entries(value.pages)){
      if(!/^\d+$/.test(page)||Number(page)<1||Number(page)>10000||!entry||typeof entry!=='object')throw new Error('Nomor halaman tidak valid.');
      if(entry.annotations&&!Array.isArray(entry.annotations))throw new Error('Daftar anotasi tidak valid.');
      const annotations=(entry.annotations||[]).map(item=>{
        count++;if(count>2000||!item||!['pen','highlight','note'].includes(item.kind)||!/^#[a-f0-9]{6}$/i.test(item.color||''))throw new Error('Format anotasi tidak valid.');
        const result={id:String(item.id||'').slice(0,100),kind:item.kind,color:item.color,width:Math.max(.001,Math.min(.08,Number(item.width)||.004))};
        if(item.kind==='note'){if(!validPoint(item.position)||typeof item.text!=='string'||item.text.length>2000)throw new Error('Catatan teks tidak valid.');result.position=item.position;result.text=item.text;}
        else{if(!Array.isArray(item.points)||item.points.length>6000||!item.points.every(validPoint))throw new Error('Goresan tidak valid.');points+=item.points.length;if(points>250000)throw new Error('Catatan terlalu besar.');result.points=item.points;}
        return result;
      });pages[page]={bookmark:!!entry.bookmark,annotations};
    }
    return {id,bookId:String(value.bookId),fingerprint:value.fingerprint,title:String(value.title||'Buku').slice(0,500),lastPage:Math.max(1,Math.min(10000,Number(value.lastPage)||1)),totalPages:Math.max(1,Math.min(10000,Number(value.totalPages)||1)),pages,updatedAt:new Date().toISOString()};
  }
  function downloadJson(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function exportNotes(){try{const saved=await all('records');downloadJson({format:'AdminGuru-library-notes',version:1,exportedAt:new Date().toISOString(),favorites,records:saved},'AdminGuru-Catatan-Buku-'+todayISO()+'.json');}catch(error){toast('Catatan gagal dicadangkan: '+error.message);}}
  async function importNotes(input){
    const file=input.files[0];input.value='';if(!file)return;
    try{
      if(file.size>12*1024*1024)throw new Error('Cadangan terlalu besar (maksimum 12 MB).');
      const data=JSON.parse(await file.text());
      if(data.format!=='AdminGuru-library-notes'||data.version!==1||!Array.isArray(data.records)||data.records.length>1000)throw new Error('Berkas bukan cadangan catatan AdminGuru.');
      const clean=data.records.map(validateRecord);
      const restoredFavorites=data.favorites===undefined?[]:data.favorites;
      if(!Array.isArray(restoredFavorites)||restoredFavorites.length>2000||!restoredFavorites.every(id=>typeof id==='string'&&/^(?:\d+|local-[a-f0-9]{24})$/.test(id)))throw new Error('Daftar favorit tidak valid.');
      for(const incoming of clean){
        const current=await get('records',incoming.id);
        if(current){for(const [page,entry] of Object.entries(current.pages||{})){
          const target=incoming.pages[page]||{annotations:[],bookmark:false},ids=new Set(target.annotations.map(a=>a.id));
          target.annotations=target.annotations.concat((entry.annotations||[]).filter(a=>!ids.has(a.id)));target.bookmark=target.bookmark||entry.bookmark;incoming.pages[page]=target;
        }}
        await saveRecord(incoming);
      }
      const nextFavorites=[...new Set(favorites.concat(restoredFavorites))].slice(0,2000);
      localStorage.setItem('adminguru_library_favorites_v1',JSON.stringify(nextFavorites));favorites=nextFavorites;
      await refreshRecords();render();status(clean.length+' catatan buku dipulihkan.');toast('Cadangan catatan dipulihkan.');
    }catch(error){toast('Pemulihan gagal: '+error.message);}
  }
  async function importPdf(input){const file=input.files[0];input.value='';if(!file)return;try{if(file.size>100*1024*1024)throw new Error('PDF lokal maksimal 100 MB.');const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,1024)).indexOf('%PDF-')<0)throw new Error('Berkas bukan PDF.');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');const book={id:'local-'+hash.slice(0,24),title:file.name.replace(/\.pdf$/i,''),grade:'',level:'PDF Lokal',subject:'lokal',kind:'siswa',local:true,writer:'',image:'',pdf:'',year:'',source:''};await put('files',{id:book.id,bytes:bytes.buffer});await put('localBooks',book);await refreshRecords();await BookReader.open(book);}catch(error){toast('PDF belum ditambahkan: '+error.message);}}
  if(typeof window!=='undefined'){let narrow=window.innerWidth<=700;window.addEventListener('resize',()=>{const next=window.innerWidth<=700;if(next!==narrow){narrow=next;const panel=document.querySelector('.library-filter-panel');if(panel)panel.open=!narrow;}});}
  return {SOURCE,API,books:knownBooks,load,mount,view,open,refresh,render,setFilter,setView,clearFilters,page,toggleFavorite,subjectLabel,safeUrl,normalize,normalizedList,match,levelLabel,editionKey,get,put,remove,all,saveRecord,refreshRecords,recordFor,validateRecord,exportNotes,importNotes,importPdf,downloadJson};
})();
if(typeof PAGES!=='undefined'){
  PAGES.perpustakaan=()=>BookLibrary.view('all');PAGES.catatanBuku=()=>BookLibrary.view('notes');
  NAV.splice(NAV.findIndex(g=>g.group==='Penilaian'),0,{group:'Perpustakaan',items:[{id:'perpustakaan',label:'Perpustakaan Buku',icon:'book'},{id:'catatanBuku',label:'Catatan & Penanda Buku',icon:'edit'}]});
}
if(typeof module!=='undefined'&&module.exports)module.exports=BookLibrary;
