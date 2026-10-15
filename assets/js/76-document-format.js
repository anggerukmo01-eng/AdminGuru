/* One safe semantic document representation for preview, saved history and export. */
const AIDocumentFormat=(function(){
  'use strict';
  const FORMAT_RULES=`FORMAT PENGETIKAN DOKUMEN WORD:
Gunakan HTML semantik yang valid, tanpa pagar kode atau Markdown. Gunakan h2/h3/h4 untuk judul dan subjudul, p untuk paragraf, ul/ol/li untuk daftar, dan table/thead/tbody/tr/th/td untuk matriks. Satu paragraf atau butir per elemen; jangan meratakan dokumen menjadi satu paragraf panjang.
Nomor otomatis: ol untuk nomor, ol type="a" untuk opsi a, b, c (atau d sesuai kelas). Jangan menggandakan label nomor di dalam li. Opsi pilihan ganda harus berada pada baris tersendiri; pertahankan jumlah opsi dan nomor soal yang diminta guru.
Gunakan th pada baris kepala tabel. colspan/rowspan boleh untuk penggabungan yang diperlukan. Jangan memakai spasi berulang atau tab untuk menyusun kolom. Gunakan tabel untuk data berulang, bukan seluruh uraian.
Perataan jika diperlukan hanya style="text-align:center" atau left/right/justify. Font, ukuran, margin dan spasi ditetapkan oleh aplikasi; jangan menambahkan CSS lain, gambar eksternal atau kop sekolah.
Tuliskan seluruh bagian yang diminta. Untuk naskah soal, pisahkan judul KISI-KISI, NASKAH SOAL, KUNCI JAWABAN dan PEDOMAN PENSKORAN agar lembar murid dan lembar guru terstruktur.`;
  function stripWrapper(value,streaming=false){let text=String(value==null?'':value).replace(/^\uFEFF/,'').replace(/<think\b[^>]*>[\s\S]*?(?:<\/think\s*>|$)/gi,'').trim();const wrapped=text.match(/^Berikut[^\n]*\n\s*```html\s*\n([\s\S]*?)\n```\s*$/i);if(wrapped&&/^\s*<(?:h[1-6]|p|div|table|html)\b/i.test(wrapped[1]))return wrapped[1].trim();const match=text.match(/^```(?:html|markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i);if(match)return match[1].trim();if(streaming)text=text.replace(/^```(?:html|markdown|md)\s*\n/i,'').replace(/\n`{1,3}\s*$/,'');return text;}
  function removePrefix(node,count){
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;
    while(count&&(text=walker.nextNode())){const used=Math.min(count,text.textContent.length);text.textContent=text.textContent.slice(used);count-=used;}
  }
  function headingText(text){return String(text).trim().replace(/[‐‑–—]/g,'-').replace(/^(?:[IVXLCDM]+|[A-Z]|\d+)[.)]?\s+/i,'').replace(/\s*[:.]\s*$/,'').toUpperCase();}
  function sectionHeading(text){return /^(?:IDENTITAS(?: MODUL| DOKUMEN)?|INFORMASI UMUM|KOMPETENSI AWAL|TUJUAN PEMBELAJARAN|KEGIATAN PEMBELAJARAN|PENDAHULUAN|KEGIATAN INTI|PENUTUP|ASESMEN(?: FORMATIF| SUMATIF)?|REFLEKSI(?: GURU| MURID| PESERTA DIDIK)?|LAMPIRAN|KISI[\s-]*KISI(?: SOAL)?|NASKAH (?:SOAL|ASESMEN)|KUNCI JAWABAN(?: DAN PEDOMAN PENSKORAN)?|PEDOMAN PENSKORAN|PETUNJUK UMUM|TELAAH MANDIRI)$/.test(headingText(text));}
  function normalize(value,options={}){
    const source=stripWrapper(value,options.streaming);if(!source)return '';
    let html;const equations=[];
    const protectedSource=source.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g,match=>{equations.push(match);return 'ADMGURU_MATH_'+(equations.length-1)+'_TOKEN';});
    if(typeof marked!=='undefined')html=marked.parse(protectedSource,{async:false,gfm:true,breaks:true});
    else html=/<(?:p|h[1-6]|table|ul|ol|div|script|img|svg)\b/i.test(source)?source:'<p>'+escapeHtml(source).replace(/\n/g,'<br>')+'</p>';
    html=html.replace(/ADMGURU_MATH_(\d+)_TOKEN/g,(match,index)=>equations[index]!==undefined?escapeHtml(equations[index]):match);
    const template=document.createElement('template');template.innerHTML=safeDocumentHtml(html);
    // Some providers mix inline Markdown with otherwise valid HTML.
    if(typeof marked!=='undefined'){
      const walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT),texts=[];let node;
      while((node=walker.nextNode()))if(!node.parentElement?.closest('pre,code')&&/\*\*[^*\n]+\*\*/.test(node.textContent))texts.push(node);
      texts.forEach(text=>{const fragment=document.createElement('template');fragment.innerHTML=safeDocumentHtml(marked.parseInline(escapeHtml(text.textContent)));text.replaceWith(fragment.content);});
    }
    template.content.querySelectorAll('ol').forEach(list=>{
      if(typeof AIGuruWord==='undefined')return;
      const items=Array.from(list.children).filter(li=>li.tagName==='LI');
      // Earlier sanitizers removed ol.type; matching visible labels recover its intent.
      if(!list.hasAttribute('type')&&items.length>=2){
        const labels=items.slice(0,2).map(li=>li.textContent.match(/^\s*([0-9]{1,4}|[a-zA-Z]{1,8})[.)]\s+/)?.[1]);
        if(labels.every(Boolean))for(const candidate of ['1','i','I','a','A']){
          const start=candidate==='1'?Number(labels[0]):['a','A'].includes(candidate)&&labels[0].length===1?labels[0].toLowerCase().charCodeAt(0)-96:Array.from({length:99},(_,i)=>i+1).find(n=>AIGuruWord.formatLabel(n,candidate)===labels[0]);
          if(start>0&&start<9999&&AIGuruWord.formatLabel(start,candidate)===labels[0]&&AIGuruWord.formatLabel(start+1,candidate)===labels[1]){list.setAttribute('type',candidate);list.setAttribute('start',String(start));break;}
        }
      }
      const type=list.getAttribute('type')||'1';let number=Number(list.getAttribute('start'))||1;
      items.forEach(li=>{
        number=Number(li.getAttribute('value'))||number;const label=AIGuruWord.formatLabel(number,type),escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        const match=li.textContent.match(new RegExp('^\\s*'+escaped+'[.)]\\s+'));
        if(match)removePrefix(li,match[0].length);
        number++;
      });
    });
    // A pasted or generated paragraph with explicit question/option lines remains separate.
    template.content.querySelectorAll('p').forEach(paragraph=>{
      if(!paragraph.querySelector('br'))return;
      const parts=[],range=document.createRange();range.setStart(paragraph,0);
      const copyRange=()=>{let content=range.cloneContents(),parent=range.commonAncestorContainer;while(parent!==paragraph&&parent.nodeType===1){const wrapper=parent.cloneNode(false);wrapper.append(content);content=wrapper;parent=parent.parentElement;}const part=paragraph.cloneNode(false);part.append(content);return part;};
      paragraph.querySelectorAll('br').forEach(br=>{range.setEndBefore(br);parts.push(copyRange());range.setStartAfter(br);});
      range.setEnd(paragraph,paragraph.childNodes.length);parts.push(copyRange());
      const labels=parts.filter(p=>/^\s*(?:\d+[.)]|[a-d][.)])\s+\S/.test(p.textContent));
      if(labels.length>=2)paragraph.replaceWith(...parts.filter(p=>p.textContent.trim()));
    });
    // Recover real lettered lists without inventing or dropping answer choices.
    template.content.querySelectorAll('p').forEach(first=>{
      if(!first.parentNode||!/^\s*a[.)]\s+\S/.test(first.textContent)||first.querySelector('br'))return;
      const parts=[first];let next=first.nextSibling;
      while(next&&parts.length<26){
        if(next.nodeType===3&&!next.textContent.trim()){next=next.nextSibling;continue;}
        if(next.nodeType!==1||next.tagName!=='P'||next.querySelector('br')||!new RegExp('^\\s*'+String.fromCharCode(97+parts.length)+'[.)]\\s+\\S').test(next.textContent))break;
        parts.push(next);next=next.nextSibling;
      }
      if(parts.length<2)return;
      const list=document.createElement('ol');list.type='a';first.before(list);
      parts.forEach(p=>{const li=document.createElement('li'),prefix=p.textContent.match(/^\s*[a-z][.)]\s+/)[0];removePrefix(p,prefix.length);li.append(p);list.append(li);});
    });
    template.content.querySelectorAll('p').forEach(p=>{
      if(p.closest('li,td,th,pre,code')||p.querySelector('br')||!sectionHeading(p.textContent))return;
      const h=document.createElement('h2');Array.from(p.attributes).forEach(a=>h.setAttribute(a.name,a.value));h.append(...p.childNodes);p.replaceWith(h);
    });
    // Explicit alignment on paragraphs also keeps preview CSS from overriding a parent.
    template.content.querySelectorAll('p,h1,h2,h3,h4,h5,h6,td,th').forEach(node=>{
      for(let parent=node;parent;parent=parent.parentElement){const align=parent.style?.textAlign||parent.getAttribute?.('align');if(align){node.style.textAlign=align;break;}}
    });
    return safeDocumentHtml(template.innerHTML).trim();
  }
  function isExam(type){return type==='Bank Soal'||type==='Asesmen Formatif';}
  function headingKind(text){const value=headingText(text);if(/^KISI[\s-]*KISI\b/.test(value))return 'blueprint';if(/^NASKAH\s+(?:SOAL|ASESMEN)\b/.test(value))return 'exam';if(/^KUNCI\s+JAWABAN\b/.test(value))return 'answers';if(/^PEDOMAN\s+PENSKORAN\b/.test(value))return 'scoring';return '';}
  function fileName(title){const name=String(title||'Dokumen AI').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim().replace(/\.(?:docx?|pdf)$/i,'').slice(0,150).replace(/[. ]+$/,'');return (name||'Dokumen AI')+'.docx';}
  return {FORMAT_RULES,normalize,stripWrapper,sectionHeading,isExam,headingKind,fileName};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AIDocumentFormat;
