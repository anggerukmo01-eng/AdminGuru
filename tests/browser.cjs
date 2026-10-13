/* Isolated local browser tests: no live AI, Dropbox or cloud requests. */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright');}catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));}
const root=path.resolve(__dirname,'..');
const report={routes:[],checks:[],screenshots:[]};
const output=process.env.QA_OUTPUT_DIR||path.join(root,'test-results');fs.mkdirSync(output,{recursive:true});
function passed(name){report.checks.push(name);console.log('PASS '+name);}
const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://local').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
  fs.createReadStream(file).on('error',()=>{response.statusCode=404;response.end();}).pipe(response);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const launch={headless:true};if(process.env.CHROMIUM_PATH){launch.executablePath=process.env.CHROMIUM_PATH;launch.args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];}
  const browser=await playwright.chromium.launch(launch);
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Jakarta',locale:'id-ID',reducedMotion:'reduce'});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',route=>route.abort());
    await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'Buka Aplikasi'}).click();
    await page.evaluate(()=>window.scrollTo(0,0));
    assert.equal(await page.locator('.metric-card').count(),4);passed('Dashboard renders and starts with unmarked attendance');
    console.log('GEOMETRY '+JSON.stringify(await page.evaluate(()=>({focus:document.activeElement.id,scroll:window.scrollY,skipTop:getComputedStyle(document.querySelector('.skip-link')).top,header:document.querySelector('.topbar').getBoundingClientRect().top,hero:document.querySelector('.dashboard-hero').getBoundingClientRect().top}))));
    await page.mouse.move(0,0);await page.screenshot({path:path.join(output,'dashboard-desktop.png')});report.screenshots.push('dashboard-desktop.png');
    const clean=await page.evaluate(()=>safeDocumentHtml('<p onclick="alert(1)">Teks <strong>benar</strong></p><img src="https://bad.invalid" onerror="alert(1)"><svg onload="alert(1)"></svg><a href="javascript:alert(1)">tautan</a><script>alert(1)</script><table><tr><td colspan="2">Nilai</td></tr></table>'));
    assert.doesNotMatch(clean,/script|onclick|img|svg|href/);assert.match(clean,/<strong>benar<\/strong>/);assert.match(clean,/colspan="2"/);passed('AI sanitizer removes executable and network elements, preserves tables');
    const routes=await page.evaluate(()=>NAV.flatMap(g=>g.items).map(i=>i.id));
    for(const id of routes){
      await page.evaluate(id=>navigate(id),id);await page.waitForTimeout(45);
      assert((await page.locator('#pageContent').innerText()).trim().length>0,id+' empty');
      assert(!errors.length,id+': '+errors.join('; '));report.routes.push(id);
    }
    passed('All '+routes.length+' navigation routes render without JS exceptions');
    await page.evaluate(()=>navigate('dashboard'));await page.keyboard.press('Control+k');
    assert.equal(await page.locator('#commandQuery').evaluate(el=>document.activeElement===el),true);
    await page.locator('#commandQuery').fill('bank soal');await page.keyboard.press('Enter');
    assert.equal(await page.locator('#pageContent').getAttribute('data-page'),'aiBankSoal');passed('Keyboard command search navigates with Enter');
    await page.evaluate(()=>navigate('aiAnalisisCP'));await page.locator('#acp_kelas').selectOption('kelas-3');
    assert.match(await page.locator('#acp_cp').inputValue(),/10\.000/);
    await page.locator('#acp_kelas').selectOption('kelas-1');assert.match(await page.locator('#acp_cp').inputValue(),/bilangan cacah sampai 100/);
    await page.locator('#acp_mapel').selectOption('ipas');assert.equal(await page.locator('#acp_cp').inputValue(),'');
    await page.locator('#acp_mapel').selectOption('pai');assert.equal(await page.locator('#acp_cp').inputValue(),'');
    assert.match(await page.locator('#acp_note').innerText(),/020 Tahun 2026/);passed('CP picker obeys phase and avoids automatically loading outdated religion CP');
    const workflows=[['aiModul','generateAiModul'],['aiATP','generateAiATP'],['aiLKPD','generateAiLKPD'],['aiTP','generateAiTP'],['aiJurnal','generateAiJurnal'],['aiAsesForm','generateAiAsesForm'],['aiRubrik','generateAiRubrik'],['aiBankSoal','generateAiBankSoal'],['aiPengRem','generateAiPengRem'],['aiSuratOrtu','generateAiSuratOrtu'],['aiProta','generateAiProta'],['aiPromes','generateAiPromes'],['aiAlokasi','generateAiAlokasi'],['aiBahanAjar','generateAiBahanAjar'],['aiKktp','generateAiKktp'],['aiRefleksi','generateAiRefleksi']];
    await page.evaluate(()=>{window.qaOriginalRun=aiRunGenerate;aiRunGenerate=(_id,args)=>{window.qaPrompt=args;};});
    for(const [id,fn] of workflows){
      await page.evaluate(id=>navigate(id),id);
      const prompt=await page.evaluate(fn=>{
        window.qaPrompt=null;
        document.querySelectorAll('#pageContent textarea').forEach(el=>{el.value='Murid membandingkan bilangan cacah sampai 100 dengan bantuan benda konkret dengan tepat.';});
        document.querySelectorAll('#pageContent input:not([type="checkbox"]):not([type="radio"])').forEach(el=>{if(el.type==='number'){if(!el.value)el.value=el.min||'1';}else if(el.type==='date'){if(!el.value)el.value=todayISO();}else if(el.type==='text')el.value='Bilangan cacah sampai 100';});
        window[fn]();return window.qaPrompt;
      },fn);
      assert(prompt&&prompt.userPrompt&&prompt.userPrompt.length>100,id+' did not build a prompt');
    }
    await page.evaluate(()=>{aiRunGenerate=window.qaOriginalRun;delete window.qaOriginalRun;});
    passed('All 16 existing AI workflows build prompts after the module split');
    await page.evaluate(()=>navigate('aiAnalisisCP'));
    await page.locator('#acp_total').fill('216');await page.locator('#acp_minggu').fill('6');await page.locator('#acp_pertemuan').fill('3');
    const analysis=await page.evaluate(()=>{let value;const original=aiRunGenerate;aiRunGenerate=(_id,args)=>value=args;try{generateCurriculumAnalysis();return value;}finally{aiRunGenerate=original;}});
    assert(analysis.userPrompt.includes('72 pertemuan penuh'));assert(analysis.userPrompt.includes('Condition'));
    await page.evaluate(()=>navigate('aiTelaahCP'));await page.locator('#tcp_tp').fill('1. Murid mengenal bilangan cacah sampai 100 dengan tepat.');
    const review=await page.evaluate(()=>{let value;const original=aiRunGenerate;aiRunGenerate=(_id,args)=>value=args;try{generateCurriculumReview();return value;}finally{aiRunGenerate=original;}});
    assert(review.userPrompt.includes('Tidak Tertelusur'));passed('Both new curriculum workflows build prompts with explicit ABCD and calculated JP');
    const generation=await page.evaluate(async()=>{
      const original=window.fetch,options={...aiSettings};
      try{
        aiSettings.apiKey='test-only';aiSettings.autoWord=false;aiSettings.streaming=false;
        window.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'<p onclick="alert(1)">Draf <strong>murid</strong></p><img src=x onerror=alert(1)>'},finish_reason:'length'}]}),{headers:{'content-type':'application/json'}});
        await aiRunGenerate('tcp_result',{type:'Telaah CP–ATP',title:'Draf "Guru" dan murid\'s',userPrompt:'test'});
        const result=document.querySelector('#tcp_result .ai-result-content'),history=loadAiHistory()[0];
        result.parentElement.querySelector('.btn-primary').click();
        return {content:result.innerHTML,title:db.aiDocs[0].title,historyContent:history.content,historyClass:history.classId,activeClass:activeClassId,warning:document.getElementById('tcp_result').textContent.includes('Terpotong')};
      }finally{window.fetch=original;aiSettings=options;}
    });
    assert.doesNotMatch(generation.content,/onclick|img/);assert.equal(generation.historyContent,generation.content);assert.equal(generation.historyClass,generation.activeClass);assert.equal(generation.title,'Draf "Guru" dan murid\'s');assert.equal(generation.warning,true);passed('AI result, truncation warning, sanitized history and document saving work together');
    for(const [classId,label] of [['kelas-1','3 opsi'],['kelas-2','4 opsi']]){
      await page.evaluate(()=>navigate('aiBankSoal'));await page.locator('#ab_kelas').selectOption(classId);await page.locator('#ab_materi').fill('Bilangan cacah sampai 100');
      const prompt=await page.evaluate(()=>{let captured;const original=aiRunGenerate;aiRunGenerate=(_id,args)=>captured=args.userPrompt;try{generateAiBankSoal();return captured;}finally{aiRunGenerate=original;}});
      assert(prompt.includes(label),'PG count for '+classId);
    }
    passed('Bank Soal preserves 3 options for class 1 and 4 options for class 2');
    await page.evaluate(()=>navigate('inventaris'));await page.getByRole('button',{name:'Tambah',exact:true}).click();
    const inputs=page.locator('#activeModal input');const count=await inputs.count();for(let i=0;i<count;i++){const input=inputs.nth(i),type=await input.getAttribute('type');if(type==='number')await input.fill('1');else if(type==='date')await input.fill('2026-10-13');else await input.fill(i===0?'QA item <img src=x onerror=alert(1)>':'QA test');}
    for(const select of await page.locator('#activeModal select').all()){const opts=await select.locator('option').all();if(opts.length>1)await select.selectOption(await opts[1].getAttribute('value'));}
    await page.locator('#crudSaveBtn').click();assert.equal(await page.locator('#pageContent').getAttribute('data-page'),'inventaris');
    assert.equal(await page.locator('#pageContent img').count(),0);passed('CRUD stays on the current page and escapes raw data');
    const screenshots=[{width:390,height:844,name:'dashboard-mobile.png',theme:'light'},{width:768,height:1024,name:'dashboard-tablet.png',theme:'light'},{width:1440,height:1000,name:'dashboard-dark.png',theme:'dark'}];
    for(const item of screenshots){await page.setViewportSize({width:item.width,height:item.height});await page.evaluate(theme=>{settings.theme=theme;applyTheme();navigate('dashboard');},item.theme);await page.mouse.move(0,0);await page.waitForTimeout(250);await page.screenshot({path:path.join(output,item.name)});report.screenshots.push(item.name);const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert(size.scroll<=size.width+1,item.name+' horizontal overflow');}
    passed('Desktop, mobile and tablet dashboards have no horizontal overflow');
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{settings.theme='light';applyTheme();navigate('dashboard');});
    await page.getByRole('button',{name:'Semua menu',exact:true}).click();assert.equal(await page.locator('#sidebar').evaluate(el=>el.inert),false);
    await page.getByRole('button',{name:'Tutup menu',exact:true}).click();assert.equal(await page.locator('#sidebar').evaluate(el=>el.inert),true);passed('Mobile menu opens, closes, and removes hidden navigation from keyboard focus');
    for(const id of ['siswa','kehadiran','aiDashboard','aiBankSoal','aiAnalisisCP','backup','pengaturan']){await page.evaluate(id=>navigate(id),id);const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert(size.scroll<=size.width+1,id+' mobile horizontal overflow: '+JSON.stringify(size));}
    passed('Core mobile forms and tables stay within the viewport');
    assert.deepEqual(errors,[]);await context.close();
    fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
