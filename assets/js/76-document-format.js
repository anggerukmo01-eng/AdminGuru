/* One safe semantic document representation for preview, saved history and export. */
const AIDocumentFormat=(function(){
  'use strict';
  const FORMAT_RULES=`FORMAT PENGETIKAN DOKUMEN WORD:
Gunakan HTML semantik yang valid, tanpa pagar kode atau Markdown. Gunakan h2/h3/h4 untuk judul dan subjudul, p untuk paragraf, ul/ol/li untuk daftar, dan table/thead/tbody/tr/th/td untuk matriks. Satu paragraf atau butir per elemen; jangan meratakan dokumen menjadi satu paragraf panjang.
Nomor otomatis: ol untuk nomor, ol type="a" untuk opsi a, b, c (atau d sesuai kelas). Jangan menggandakan label nomor di dalam li. Opsi pilihan ganda harus berada pada baris tersendiri; pertahankan jumlah opsi dan nomor soal yang diminta guru.
Gunakan th pada baris kepala tabel. colspan/rowspan boleh untuk penggabungan yang diperlukan. Jangan memakai spasi berulang atau tab untuk menyusun kolom. Gunakan tabel untuk data berulang, bukan seluruh uraian.
Perataan jika diperlukan hanya style="text-align:center" atau left/right/justify. Font, ukuran, margin dan spasi ditetapkan oleh aplikasi; jangan menambahkan CSS lain, gambar eksternal atau kop sekolah.
Tuliskan seluruh bagian yang diminta. Untuk naskah soal, pisahkan judul KISI-KISI, NASKAH SOAL, KUNCI JAWABAN dan PEDOMAN PENSKORAN agar lembar murid dan lembar guru terstruktur.`;
  function stripWrapper(value,streaming=false){let text=String(value==null?'':value).replace(/^\uFEFF/,'').replace(/<think\b[^>]*>[\s\S]*?(?:<\/think\s*>|$)/gi,'').trim();const match=text.match(/^```(?:html|markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i);if(match)return match[1].trim();if(streaming)text=text.replace(/^```(?:html|markdown|md)\s*\n/i,'').replace(/\n`{1,3}\s*$/,'');return text;}
  function normalize(value,options={}){
    const source=stripWrapper(value,options.streaming);if(!source)return '';
    let html;const equations=[];
    const protectedSource=source.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g,match=>{equations.push(match);return 'ADMGURU_MATH_'+(equations.length-1)+'_TOKEN';});
    if(typeof marked!=='undefined')html=marked.parse(protectedSource,{async:false,gfm:true,breaks:true});
    else html=/<(?:p|h[1-6]|table|ul|ol|div|script|img|svg)\b/i.test(source)?source:'<p>'+escapeHtml(source).replace(/\n/g,'<br>')+'</p>';
    html=html.replace(/ADMGURU_MATH_(\d+)_TOKEN/g,(match,index)=>equations[index]!==undefined?escapeHtml(equations[index]):match);
    const template=document.createElement('template');template.innerHTML=safeDocumentHtml(html);
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
        if(match){let count=match[0].length;const walker=document.createTreeWalker(li,NodeFilter.SHOW_TEXT);let text;while(count&&(text=walker.nextNode())){const used=Math.min(count,text.textContent.length);text.textContent=text.textContent.slice(used);count-=used;}}
        number++;
      });
    });
    // A pasted or generated paragraph with explicit question/option lines remains separate.
    template.content.querySelectorAll('p').forEach(paragraph=>{
      if(!paragraph.querySelector('br'))return;
      const parts=[],current=document.createElement('p');let part=current;
      Array.from(paragraph.childNodes).forEach(node=>{if(node.nodeType===1&&node.tagName==='BR'){parts.push(part);part=document.createElement('p');}else part.appendChild(node.cloneNode(true));});parts.push(part);
      const labels=parts.filter(p=>/^\s*(?:\d+[.)]|[a-d][.)])\s+\S/.test(p.textContent));
      if(labels.length>=2){const nodes=parts.filter(p=>p.textContent.trim()).map(p=>{if(paragraph.style.textAlign)p.style.textAlign=paragraph.style.textAlign;return p;});paragraph.replaceWith(...nodes);}
    });
    return safeDocumentHtml(template.innerHTML).trim();
  }
  function isExam(type){return type==='Bank Soal'||type==='Asesmen Formatif';}
  function headingKind(text){const value=String(text).trim().replace(/^(?:[A-Z]|\d+)[.)]\s*/i,'').toUpperCase();if(/^KISI[\s-]*KISI\b/.test(value))return 'blueprint';if(/^NASKAH\s+(?:SOAL|ASESMEN)\b/.test(value))return 'exam';if(/^KUNCI\s+JAWABAN\b/.test(value))return 'answers';if(/^PEDOMAN\s+PENSKORAN\b/.test(value))return 'scoring';return '';}
  function fileName(title){const name=String(title||'Dokumen AI').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim().replace(/\.(?:docx?|pdf)$/i,'').slice(0,150).replace(/[. ]+$/,'');return (name||'Dokumen AI')+'.docx';}
  return {FORMAT_RULES,normalize,stripWrapper,isExam,headingKind,fileName};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AIDocumentFormat;
