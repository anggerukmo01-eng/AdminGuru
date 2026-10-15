/* Native OOXML via pinned, locally hosted docx. Generated HTML is always sanitized. */
const AIGuruWord=(function(){
  'use strict';
  const MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const VERSION='9.6.1',RELEASE='20261015.1',KEY='adminguru_word_format_v1';
  const DEFAULT={font:'Times New Roman',size:12,line:1.5,paper:'auto',orientation:'auto'};
  const MATRIX_TYPES=new Set(['ATP','TP','Prota','Promes','Alokasi Waktu','KKTP','Rubrik Penilaian','Analisis CP → TP','Telaah CP–ATP']);
  let libraryPromise;
  function cleanSettings(raw={}){return {font:['Times New Roman','Arial','Calibri'].includes(raw.font)?raw.font:DEFAULT.font,size:[11,12,13].includes(Number(raw.size))?Number(raw.size):DEFAULT.size,line:[1,1.15,1.5,2].includes(Number(raw.line))?Number(raw.line):DEFAULT.line,paper:['auto','A4','F4'].includes(raw.paper)?raw.paper:'auto',orientation:['auto','portrait','landscape'].includes(raw.orientation)?raw.orientation:'auto'};}
  function settings(){try{return cleanSettings(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(error){return {...DEFAULT};}}
  function settingsHtml(id){const s=settings(),arg=htmlJsArg(id);return `<details class="word-format-controls"><summary>Format Word DOCX</summary><div class="word-format-grid">${[['font','Huruf',['Times New Roman','Arial','Calibri']],['size','Ukuran teks',[11,12,13]],['line','Spasi paragraf',[1,1.15,1.5,2]],['paper','Kertas',['auto','A4','F4']],['orientation','Orientasi',['auto','portrait','landscape']]].map(([key,label,values])=>`<label for="word_${id}_${key}">${label}<select id="word_${id}_${key}" onchange="AIGuruWord.saveSettingsFrom(${arg})">${values.map(value=>`<option value="${value}" ${String(s[key])===String(value)?'selected':''}>${({auto:'Otomatis',portrait:'Tegak',landscape:'Mendatar'})[value]||value}</option>`).join('')}</select></label>`).join('')}</div><p>Naskah soal: F4; administrasi: A4. Margin 2,5 cm. Orientasi otomatis menyesuaikan tabel lebar; format dapat diubah di atas.</p></details><p class="word-export-status" id="word_status_${id}" role="status"></p>`;}
  function readSettings(id){const s=settings();for(const key of Object.keys(DEFAULT)){const input=document.getElementById('word_'+id+'_'+key);if(input)s[key]=input.value;}return cleanSettings(s);}
  function saveSettingsFrom(id){const s=readSettings(id);try{localStorage.setItem(KEY,JSON.stringify(s));}catch(error){toast('Format dipakai untuk ekspor ini; preferensi belum tersimpan.');}applyPreview(id,s);}
  function applyPreview(id,s=settings()){const el=document.getElementById(id);if(el){el.style.fontFamily=s.font;el.style.fontSize=s.size+'pt';el.style.lineHeight=s.line;}}
  async function engine(){
    if(typeof window!=='undefined'&&window.docx)return window.docx;
    if(libraryPromise)return libraryPromise;
    libraryPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script'),timer=setTimeout(()=>{script.remove();libraryPromise=null;reject(new Error('Mesin DOCX belum termuat. Coba unduh kembali.'));},20000);
      script.src='assets/vendor/docx/docx-'+VERSION+'.min.js?v='+RELEASE;
      script.onload=()=>{clearTimeout(timer);if(window.docx)resolve(window.docx);else{libraryPromise=null;reject(new Error('Mesin DOCX tidak tersedia.'));}};
      script.onerror=()=>{clearTimeout(timer);script.remove();libraryPromise=null;reject(new Error('Berkas pembuat DOCX belum dapat dimuat. Periksa koneksi atau salinan aplikasi.'));};document.head.appendChild(script);
    });return libraryPromise;
  }
  function styleFor(node,parent={}){
    const next={...parent},tag=node.tagName,css=node.style||{};
    if(['STRONG','B'].includes(tag))next.bold=true;if(['EM','I'].includes(tag))next.italics=true;
    if(tag==='U')next.underline=true;if(tag==='S')next.strike=true;
    if(tag==='SUB'){next.subScript=true;next.superScript=false;}if(tag==='SUP'){next.superScript=true;next.subScript=false;}
    if(['CODE','PRE'].includes(tag))next.code=true;
    if(css.fontWeight)next.bold=css.fontWeight==='bold';
    if(css.fontStyle)next.italics=css.fontStyle==='italic';
    if(css.textDecorationLine){next.underline=css.textDecorationLine.includes('underline');next.strike=css.textDecorationLine.includes('line-through');}
    if(css.verticalAlign){next.subScript=css.verticalAlign==='sub';next.superScript=css.verticalAlign==='super';}
    return next;
  }
  function inheritedStyle(node){const parents=[];for(let parent=node;parent?.nodeType===1;parent=parent.parentElement)parents.unshift(parent);return parents.reduce((style,parent)=>styleFor(parent,style),{});}
  function inheritedAlignment(node){for(let parent=node;parent;parent=parent.parentElement){const value=parent.style?.textAlign||parent.getAttribute?.('align');if(value)return value;}return '';}
  function wordAlignment(value,fallback='left'){return value==='justify'?'both':['left','center','right','both'].includes(value)?value:fallback;}
  function inline(nodes,style={}){
    const result=[];Array.from(nodes).forEach(node=>{
      if(node.nodeType===3){const text=node.textContent.replace(/[\t\r\n \u00a0]+/g,' ');if(text)result.push({text,...style});return;}
      if(node.nodeType!==1)return;
      if(node.tagName==='BR'){result.push({break:true});return;}
      result.push(...inline(node.childNodes,styleFor(node,style)));
    });return result;
  }
  function textOf(items){return items.map(item=>item.break?'\n':item.text||'').join('').trim();}
  function paragraph(node){const style=inheritedStyle(node),runs=node.tagName==='PRE'?node.textContent.split(/\r?\n/).flatMap((line,i)=>(i?[{break:true}]:[]).concat({text:line,...style,code:true})):inline(node.childNodes,style),text=textOf(runs);return {kind:'paragraph',runs,text,align:inheritedAlignment(node),breakBefore:node.style?.pageBreakBefore==='always',breakAfter:node.style?.pageBreakAfter==='always',pre:node.tagName==='PRE'};}
  function parse(html){
    const template=document.createElement('template');template.innerHTML=AIDocumentFormat.normalize(html);
    function walk(nodes){const blocks=[],buffer=[];const flush=()=>{if(buffer.length){const parent=buffer[0].parentElement,runs=inline(buffer,inheritedStyle(parent)),text=textOf(runs);if(text)blocks.push({kind:'paragraph',runs,text,align:inheritedAlignment(parent)});buffer.length=0;}};
      Array.from(nodes).forEach(node=>{
        if(node.nodeType===3){buffer.push(node);return;}if(node.nodeType!==1)return;
        if(/^H[1-6]$/.test(node.tagName)){flush();const p=paragraph(node);blocks.push({...p,kind:'heading',level:Math.max(1,Number(node.tagName[1])-1),role:AIDocumentFormat.headingKind(p.text)});}
        else if(['P','PRE'].includes(node.tagName)){flush();const p=paragraph(node);if(p.text)blocks.push(p);}
        else if(['UL','OL'].includes(node.tagName)){flush();blocks.push({kind:'list',ordered:node.tagName==='OL',type:node.getAttribute('type')||'1',start:Math.max(1,Math.min(9999,Number(node.getAttribute('start'))||1)),items:Array.from(node.children).filter(n=>n.tagName==='LI').map(li=>({value:Number(li.getAttribute('value'))||null,blocks:walk(li.childNodes)}))});}
        else if(node.tagName==='TABLE'){
          flush();const occupied=[],rows=[];let columns=0;
          Array.from(node.rows).forEach((row,index)=>{let col=0;const cells=Array.from(row.cells).map(cell=>{while(occupied[col]>0)col++;const span=Math.max(1,Math.min(40,Number(cell.getAttribute('colspan'))||1)),rowSpan=Math.max(1,Math.min(500,Number(cell.getAttribute('rowspan'))||1));const start=col;for(let c=col;c<col+span;c++)occupied[c]=Math.max(occupied[c]||0,rowSpan);col+=span;return {start,span,rowSpan,header:cell.tagName==='TH',blocks:walk(cell.childNodes),text:cell.textContent.trim()};});
            columns=Math.max(columns,col,occupied.length);for(let c=0;c<occupied.length;c++)occupied[c]=Math.max(0,(occupied[c]||0)-1);
            const header=row.parentElement.tagName==='THEAD'||(index===0&&cells.length>0&&cells.every(c=>c.header));rows.push({cells,header});
          });
          if(columns>40||rows.length>1000)throw new Error('Tabel terlalu besar untuk ekspor. Bagi menjadi bagian yang lebih kecil.');
          if(rows.length)blocks.push({kind:'table',rows,columns,caption:node.caption?.textContent?.trim()||''});
        }else if(['DIV','BLOCKQUOTE'].includes(node.tagName)){flush();const children=walk(node.childNodes);if(children.length){if(node.style.pageBreakBefore==='always')children[0].breakBefore=true;if(node.style.pageBreakAfter==='always')children.at(-1).breakAfter=true;}blocks.push(...children);}
        else if(node.tagName==='HR'){flush();}
        else buffer.push(node);
      });flush();return blocks;
    }
    return walk(template.content.childNodes);
  }
  function allTables(blocks){return blocks.flatMap(b=>b.kind==='table'?[b]:b.kind==='list'?b.items.flatMap(item=>allTables(item.blocks)):[]);}
  function widths(table,total){
    const weights=Array(table.columns).fill(1.8),minimum=Array(table.columns).fill(720);
    const header=table.rows.find(r=>r.header)||table.rows[0];header.cells.forEach(cell=>{if(cell.span!==1)return;const label=cell.text.toLowerCase().replace(/[.\s]+/g,' ').trim(),short=/^(no|nomor|kode|kelas|semester|smt|jp|skor|bobot|nilai|level)$/.test(label);weights[cell.start]=short?.65:/tujuan|rumusan|indikator|kegiatan|deskripsi|kriteria|catatan|validasi|konsep|asesmen|materi|kk?tp/.test(label)?3.2:1.8;minimum[cell.start]=short?620:1100;});
    for(let col=0;col<table.columns;col++){if(weights[col]<1)continue;const lengths=table.rows.filter(r=>!r.header).slice(0,30).flatMap(r=>r.cells.filter(c=>c.start===col&&c.span===1).map(c=>c.text.length));const average=lengths.length?lengths.reduce((a,b)=>a+b,0)/lengths.length:0;weights[col]=Math.max(weights[col],Math.min(7,Math.sqrt(average/20)*1.8));}
    let minimumTotal=minimum.reduce((a,b)=>a+b,0);if(minimumTotal>total){const scale=total/minimumTotal;for(let i=0;i<minimum.length;i++)minimum[i]=Math.floor(minimum[i]*scale);minimumTotal=minimum.reduce((a,b)=>a+b,0);}
    const sum=weights.reduce((a,b)=>a+b,0),result=weights.map((weight,i)=>minimum[i]+Math.round((total-minimumTotal)*weight/sum));result[result.length-1]+=total-result.reduce((a,b)=>a+b,0);return result;
  }
  function formatLabel(value,type){if(type==='a'||type==='A'){let text='',n=value;while(n>0){n--;text=String.fromCharCode(97+n%26)+text;n=Math.floor(n/26);}return type==='A'?text.toUpperCase():text;}if(type==='i'||type==='I'){let n=value,text='';for(const [number,label] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=number){text+=label;n-=number;}return type==='i'?text.toLowerCase():text;}return String(value);}
  function stripListLabel(runs,label){const text=runs.map(r=>r.text||'').join(''),escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),match=text.match(new RegExp('^\\s*'+escaped+'[.)]\\s+'));if(!match)return runs;let count=match[0].length;return runs.map(run=>{if(!run.text||!count)return {...run};const used=Math.min(count,run.text.length);count-=used;return {...run,text:run.text.slice(used)};});}
  function mathAst(source){
    if(source.length>2000)throw new Error('Rumus terlalu panjang.');let pos=0;
    const symbols={times:'×',div:'÷',cdot:'·',le:'≤',leq:'≤',ge:'≥',geq:'≥',neq:'≠',pm:'±',pi:'π',quad:' ',qquad:'  '};
    const spaces=()=>{while(/\s/.test(source[pos]||'')&&pos<source.length)pos++;};
    function group(depth){spaces();if(source[pos]!=='{')throw new Error('Bagian rumus belum lengkap.');pos++;return expression('}',depth+1);}
    function expression(end,depth=0){if(depth>20)throw new Error('Rumus terlalu kompleks.');const nodes=[];
      while(pos<source.length){const c=source[pos];if(c===end){pos++;return nodes;}if(c==='}')throw new Error('Kurung rumus tidak sesuai.');
        if(c==='^'||c==='_'){pos++;spaces();const previous=nodes.pop();if(!previous)throw new Error('Pangkat rumus belum lengkap.');if(pos>=source.length)throw new Error('Pangkat rumus belum lengkap.');const argument=source[pos]==='{'?group(depth):[{kind:'text',text:source[pos++]||''}];nodes.push({kind:c==='^'?'power':'sub',base:[previous],argument});continue;}
        if(c==='{'){nodes.push(...group(depth));continue;}
        if(c==='('){pos++;nodes.push({kind:'brackets',children:expression(')',depth+1)});continue;}
        if(c==='\\'){pos++;const command=source.slice(pos).match(/^[a-zA-Z]+/);if(!command){nodes.push({kind:'text',text:source[pos++]||''});continue;}pos+=command[0].length;const name=command[0];
          if(name==='frac'||name==='dfrac'||name==='tfrac'){const numerator=group(depth),denominator=group(depth);nodes.push({kind:'fraction',numerator,denominator});}
          else if(name==='sqrt')nodes.push({kind:'root',children:group(depth)});
          else if(name==='text'||name==='mathrm'){spaces();if(source[pos++]!=='{')throw new Error('Teks rumus belum lengkap.');const close=source.indexOf('}',pos);if(close<0)throw new Error('Teks rumus belum lengkap.');nodes.push({kind:'text',text:source.slice(pos,close)});pos=close+1;}
          else if(name==='left'||name==='right'){}
          else if(Object.hasOwn(symbols,name))nodes.push({kind:'text',text:symbols[name]});
          else throw new Error('Perintah rumus \\'+name+' belum didukung. Gunakan simbol atau superskrip/subskrip HTML untuk bagian ini.');
          continue;
        }
        const chunk=source.slice(pos).match(/^(?:[a-zA-Z]+|\d+(?:[.,]\d+)?|\s+)/);if(chunk){nodes.push({kind:'text',text:chunk[0]});pos+=chunk[0].length;}
        else {nodes.push({kind:'text',text:c});pos++;}
      }if(end)throw new Error('Kurung rumus belum lengkap.');return nodes;
    }return expression();
  }
  function buildNative(lib,blocks,title,type,format,school={},logo){
    const s=cleanSettings(format),exam=AIDocumentFormat.isExam(type),paper=s.paper==='auto'?(exam?'F4':'A4'):s.paper;
    const cm=value=>Math.round(value/2.54*1440),margin=cm(2.5),pageHeight=cm(paper==='F4'?33:29.7),pageWidth=cm(21);
    const textRun={font:s.font,size:s.size*2,color:'000000',language:{value:'id-ID'}};
    const headings={run:{...textRun,bold:true},paragraph:{spacing:{before:200,after:100,line:Math.round(s.line*240)},keepNext:true,keepLines:true}};
    const styles={paragraphStyles:[{id:'Normal',name:'Normal',next:'Normal',quickFormat:true,run:textRun,paragraph:{spacing:{after:120,line:Math.round(s.line*240)},widowControl:true}}],default:{
      document:{run:textRun,paragraph:{spacing:{after:120,line:Math.round(s.line*240)},widowControl:true}},
      title:{run:{...textRun,size:(s.size+2)*2,bold:true,color:'000000'},paragraph:{spacing:{before:0,after:180},keepNext:true}},
      heading1:{...headings,run:{...headings.run,size:(s.size+1)*2}},heading2:headings,heading3:headings,heading4:headings,heading5:headings,heading6:headings,
      listParagraph:{run:textRun,paragraph:{spacing:{after:60,line:Math.round(s.line*240)}}}
    }};
    const numbering=[],groups=[];let sequence=0,hasExamHeader=false;
    const hasWide=allTables(blocks).some(table=>table.columns>=6),wholeMode=s.orientation!=='auto'?s.orientation:(MATRIX_TYPES.has(type)&&hasWide?'landscape':'portrait');
    const group=mode=>{let current=groups.at(-1);if(!current||current.mode!==mode){current={mode,children:[]};groups.push(current);}return current;};
    function nativeMath(nodes){return nodes.map(node=>node.kind==='fraction'?new lib.MathFraction({numerator:nativeMath(node.numerator),denominator:nativeMath(node.denominator)}):node.kind==='root'?new lib.MathRadical({children:nativeMath(node.children)}):node.kind==='power'?new lib.MathSuperScript({children:nativeMath(node.base),superScript:nativeMath(node.argument)}):node.kind==='sub'?new lib.MathSubScript({children:nativeMath(node.base),subScript:nativeMath(node.argument)}):node.kind==='brackets'?new lib.MathRoundBrackets({children:nativeMath(node.children)}):new lib.MathRun(node.text));}
    function runs(items,overrides={}){return items.flatMap(item=>{
      if(item.break)return [new lib.TextRun({break:1})];
      const plain=text=>new lib.TextRun({...textRun,...overrides,text,bold:overrides.bold||item.bold,italics:item.italics,underline:item.underline?{type:lib.UnderlineType.SINGLE}:undefined,strike:item.strike,subScript:item.subScript,superScript:item.superScript,font:item.code?'Consolas':s.font});
      if(item.code)return [plain(item.text||'')];
      const text=item.text||'',pattern=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g,out=[];let offset=0,match;
      while((match=pattern.exec(text))){if(match.index>offset)out.push(plain(text.slice(offset,match.index)));out.push(new lib.Math({children:nativeMath(mathAst(match[1]??match[2]??match[3]??match[4]))}));offset=pattern.lastIndex;}if(offset<text.length||!out.length)out.push(plain(text.slice(offset)));return out;
    });}
    function p(block,context={}){const isHeading=block.kind==='heading',isOption=context.option||(exam&&/^\s*[a-d][.)]\s+/.test(block.text)),isQuestion=exam&&/^\s*\d+[.)]\s+/.test(block.text);return new lib.Paragraph({children:runs(block.runs,{bold:context.header||isHeading,size:isHeading?(s.size+(block.level===1?1:0))*2:s.size*2}),heading:isHeading?lib.HeadingLevel['HEADING_'+Math.min(block.level,6)]:undefined,alignment:wordAlignment(block.align||context.align,isHeading||block.pre||block.runs.some(run=>run.break)||context.table||context.list||exam?'left':'both'),spacing:{before:isHeading?180:0,after:context.table?60:isOption?0:120,line:Math.round((context.table?1.15:s.line)*240)},keepNext:isHeading||context.keepNext||false,keepLines:isHeading||isOption||context.keepNext||false,widowControl:true,pageBreakBefore:block.breakBefore||context.pageBreak||false,indent:context.indent||(isOption&&!context.numbering?{left:cm(.8),hanging:cm(.4)}:isQuestion?{left:cm(.5),hanging:cm(.5)}:undefined),numbering:context.numbering});}
    function list(block,context={},depth=0){
      let reference;const formatMap={'1':'decimal',a:'lowerLetter',A:'upperLetter',i:'lowerRoman',I:'upperRoman'};depth=Math.min(depth,8);
      function configure(start){reference='ag-list-'+(++sequence);numbering.push({reference,levels:Array.from({length:9},(_,level)=>({level,format:block.ordered?formatMap[block.type]||'decimal':'bullet',text:block.ordered?'%'+(level+1)+'.':['•','○','▪'][level%3],start:level===depth?start:1,alignment:'left',style:{run:textRun,paragraph:{indent:{left:720*(level+1),hanging:360}}}}))});}configure(block.start);
      let value=block.start;const out=[];
      block.items.forEach((item,index)=>{let first=true;if(item.value&&item.value!==value){value=item.value;configure(value);}
        const option=exam&&block.ordered&&/^[aA]$/.test(block.type);
        item.blocks.forEach((child,childIndex)=>{if(child.kind==='list'){out.push(...list(child,context,depth+1));return;}if(child.kind==='table'){out.push(table(child,context.width||pageWidth-2*margin));return;}const copy={...child,runs:first&&block.ordered?stripListLabel(child.runs,formatLabel(value,block.type)):child.runs};out.push(p(copy,{...context,list:true,option,keepNext:(option&&(index<block.items.length-1||childIndex<item.blocks.length-1))||item.blocks.slice(childIndex+1).some(b=>b.kind==='list'),numbering:first?{reference,level:depth}:undefined,indent:first?undefined:{left:720*(depth+1)}}));first=false;});value++;
      });return out;
    }
    function table(block,total){
      const columns=widths(block,total),border={style:lib.BorderStyle.SINGLE,size:4,color:'D9D9D9'};
      const rows=block.rows.map(row=>new lib.TableRow({tableHeader:row.header,cantSplit:row.header,children:row.cells.map(cell=>{
        const numeric=cell.blocks.length===1&&cell.blocks[0].kind==='paragraph'&&/^(?:\d+(?:[.,]\d+)?%?|[A-F]\d*(?:[–-][A-F]?\d+)?)$/.test(cell.text),context={table:true,header:row.header||cell.header,align:numeric?'center':'left',width:columns.slice(cell.start,cell.start+cell.span).reduce((a,b)=>a+b,0)};
        const children=cell.blocks.flatMap(b=>b.kind==='list'?list(b,context):b.kind==='table'?[table(b,context.width-200)]:[p(b,context)]);if(!children.length)children.push(new lib.Paragraph({children:[new lib.TextRun(textRun)]}));
        return new lib.TableCell({children,width:{size:context.width,type:lib.WidthType.DXA},columnSpan:cell.span,rowSpan:cell.rowSpan,verticalAlign:lib.VerticalAlign.CENTER,margins:{top:120,bottom:120,left:140,right:140},shading:row.header?{fill:'EAF0F8'}:undefined});
      })}));
      return new lib.Table({rows,width:{size:total,type:lib.WidthType.DXA},columnWidths:columns,layout:lib.TableLayoutType.FIXED,borders:{top:border,bottom:border,left:border,right:border,insideHorizontal:border,insideVertical:border}});
    }
    function kop(mode,isSoal){
      const width=(mode==='landscape'?pageHeight:pageWidth)-2*margin,none={style:lib.BorderStyle.NONE,size:0,color:'FFFFFF'};
      const center=(text,bold=true,size=s.size)=>new lib.Paragraph({children:[new lib.TextRun({...textRun,text,bold,size:size*2})],alignment:'center',spacing:{after:40,line:240},keepNext:true});
      const data=[center('PEMERINTAH KABUPATEN '+String(school.kabupaten||'Banyumas').toUpperCase()),center('DINAS PENDIDIKAN')];
      if(isSoal){data.push(center('KORWILCAM DINDIK '+String(school.kecamatan||'Purwojati').toUpperCase()),center('....',true,s.size+2));}
      else {data.push(center(String(school.namaSekolah||'Sekolah'),true,s.size+2));const address=[school.alamat,school.desa?'Desa '+school.desa:'',school.kecamatan?'Kec. '+school.kecamatan:'',school.kabupaten?'Kab. '+school.kabupaten:'',school.provinsi,school.kodePos].filter(Boolean).join(', ');if(address)data.push(center(address,false,10));}
      const cells=[];if(logo){cells.push(new lib.TableCell({width:{size:cm(1.8),type:lib.WidthType.DXA},borders:{top:none,bottom:none,left:none,right:none},verticalAlign:lib.VerticalAlign.CENTER,children:[new lib.Paragraph({children:[new lib.ImageRun({type:logo.type,data:logo.bytes,transformation:{width:logo.width,height:logo.height},altText:{name:'Logo sekolah',title:'Logo sekolah',description:'Logo sekolah dari pengaturan AdminGuru'}})],alignment:'center'})]}));}
      cells.push(new lib.TableCell({width:{size:width-(logo?cm(1.8):0),type:lib.WidthType.DXA},borders:{top:none,bottom:none,left:none,right:none},children:data}));
      const header=new lib.Table({rows:[new lib.TableRow({cantSplit:true,children:cells})],width:{size:width,type:lib.WidthType.DXA},columnWidths:logo?[cm(1.8),width-cm(1.8)]:[width],borders:{top:none,bottom:none,left:none,right:none,insideHorizontal:none,insideVertical:none}});
      const out=isSoal?[new lib.Paragraph({children:[new lib.TextRun({...textRun,text:'Nama : ........................................................',bold:true})],alignment:'right',spacing:{after:80},keepNext:true})]:[];out.push(header,new lib.Paragraph({text:'',border:{bottom:{style:lib.BorderStyle.SINGLE,size:12,color:'000000'}},spacing:{after:180,before:0,line:80},keepNext:true}));return out;
    }
    const cleanTitle=text=>String(text).toLocaleLowerCase('id').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    const aliases={ATP:['alur tujuan pembelajaran'],TP:['tujuan pembelajaran'],Prota:['program tahunan'],Promes:['program semester'],KKTP:['kriteria ketercapaian tujuan pembelajaran']};
    if(!exam&&blocks[0]?.kind==='heading'&&[cleanTitle(title),cleanTitle(type),...(aliases[type]||[])].includes(cleanTitle(blocks[0].text)))blocks=blocks.slice(1);
    blocks.forEach((block,index)=>{
      const mode=s.orientation!=='auto'?s.orientation:wholeMode==='landscape'?'landscape':block.kind==='table'&&block.columns>=6?'landscape':'portrait';
      if(block.kind==='table'&&mode!==(groups.at(-1)?.mode||mode)&&blocks[index-1]?.kind==='heading'){
        const previous=groups.at(-1),heading=previous?.children.pop();if(previous&&!previous.children.length)groups.pop();const current=group(mode);if(heading)current.children.push(heading);
      }
      const current=group(mode),width=(mode==='landscape'?pageHeight:pageWidth)-2*margin;
      if(block.kind==='heading'&&exam&&block.role==='exam'){
        if(current.children.length)current.children.push(new lib.Paragraph({children:[new lib.TextRun({break:1})],pageBreakBefore:true,spacing:{after:0,line:1}}));
        current.children.push(...kop(mode,true));hasExamHeader=true;
      }
      if(block.kind==='table'){if(block.caption)current.children.push(new lib.Paragraph({text:block.caption,run:textRun,keepNext:true,spacing:{after:80}}));current.children.push(table(block,width),new lib.Paragraph({text:'',spacing:{before:0,after:100,line:80}}));}
      else if(block.kind==='list')current.children.push(...list(block,{width}));
      else current.children.push(p(block,{pageBreak:exam&&['answers','scoring'].includes(block.role)&&current.children.length>0,keepNext:exam&&((blocks[index+1]?.kind==='list'&&blocks[index+1].ordered&&/^[aA]$/.test(blocks[index+1].type))||(/^\s*(?:\d+|[a-d])[.)]\s+/.test(block.text)&&/^\s*[a-d][.)]\s+/.test(blocks[index+1]?.text||'')))}));
      if(block.breakAfter)current.children.push(new lib.Paragraph({children:[new lib.PageBreak()],spacing:{after:0}}));
    });
    if(!groups.length)throw new Error('Dokumen kosong. Buat atau isi dokumen sebelum mengekspor.');
    if(exam&&!hasExamHeader)groups[0].children.unshift(...kop(groups[0].mode,true));
    if(!exam){groups[0].children.unshift(...kop(groups[0].mode,false),new lib.Paragraph({text:String(title||type||'Dokumen AI'),heading:lib.HeadingLevel.TITLE,alignment:'center',keepNext:true}));}
    const footer=()=>new lib.Footer({children:[new lib.Paragraph({children:[new lib.TextRun({...textRun,size:20,text:'Halaman '}),new lib.TextRun({...textRun,size:20,children:[lib.PageNumber.CURRENT]})],alignment:'right'})]});
    const sections=groups.map(g=>({properties:{type:lib.SectionType.NEXT_PAGE,page:{size:{width:pageWidth,height:pageHeight,orientation:g.mode},margin:{top:margin,bottom:margin,left:margin,right:margin,header:560,footer:560}}},footers:{default:footer()},children:g.children}));
    return new lib.Document({compatibility:{doNotExpandShiftReturn:true},creator:'AdminGuru',title:String(title||type||'Dokumen AI'),description:'Dokumen pembelajaran',styles,numbering:{config:numbering},sections});
  }
  async function logoData(school){
    const src=school.logoDataUrl||(typeof LOGO_SEKOLAH!=='undefined'?LOGO_SEKOLAH:'');
    const match=String(src).match(/^data:image\/(png|jpe?g|gif|bmp);base64,([a-zA-Z0-9+/=\s]+)$/i);if(!match||match[2].length>8000000)return null;
    const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));if(!bytes.length)return null;
    let width=66,height=66;if(match[1].toLowerCase()==='png'&&bytes.length>=24){const view=new DataView(bytes.buffer);const w=view.getUint32(16),h=view.getUint32(20);if(w>0&&h>0){const scale=66/Math.max(w,h);width=w*scale;height=h*scale;}}
    return {bytes,type:/jpe?g/i.test(match[1])?'jpg':match[1].toLowerCase(),width,height};
  }
  async function buildBlob(html,title,type='Dokumen AI',options={}){
    const blocks=parse(html),format=cleanSettings(options.format||settings()),school=options.school||structuredClone(typeof db!=='undefined'?db.sekolah||{}:{});
    const logo=await logoData(school),lib=await engine(),doc=buildNative(lib,blocks,title,type,format,school,logo);
    return lib.Packer.toBlob(doc);
  }
  async function download(html,title,type,options={}){const blob=await buildBlob(html,title,type,options),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=AIDocumentFormat.fileName(title);document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return blob;}
  return {MIME,VERSION,DEFAULT,cleanSettings,settings,settingsHtml,saveSettingsFrom,readSettings,applyPreview,wordAlignment,parse,widths,formatLabel,stripListLabel,mathAst,buildNative,buildBlob,download};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AIGuruWord;
