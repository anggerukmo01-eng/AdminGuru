/* Generated/imported document HTML is data, never executable application code. */
function safeDocumentHtml(html){
  const template = document.createElement("template");
  template.innerHTML = String(html==null ? "" : html);
  const allowed = new Set(["H1","H2","H3","H4","H5","H6","P","DIV","SPAN","UL","OL","LI","TABLE","THEAD","TBODY","TFOOT","TR","TH","TD","CAPTION","COLGROUP","COL","STRONG","B","EM","I","U","S","BR","HR","BLOCKQUOTE","PRE","CODE","SUB","SUP"]);
  const blocked = new Set(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","SVG","MATH","FORM","INPUT","BUTTON","TEXTAREA","SELECT","LINK","META","BASE","TEMPLATE","IMG","VIDEO","AUDIO","SOURCE"]);
  function clean(parent){
    Array.from(parent.childNodes).forEach(node=>{
      if(node.nodeType===8){ node.remove(); return; }
      if(node.nodeType!==1) return;
      if(blocked.has(node.tagName)){ node.remove(); return; }
      clean(node);
      if(!allowed.has(node.tagName)){ node.replaceWith(...node.childNodes); return; }
      const textAlign=node.style.textAlign,breakBefore=node.style.pageBreakBefore,breakAfter=node.style.pageBreakAfter;
      Array.from(node.attributes).forEach(attr=>{
        const numeric = ["colspan","rowspan","span","start","value"].includes(attr.name) && /^\d{1,4}$/.test(attr.value) && Number(attr.value)>0;
        const listType=node.tagName==='OL'&&attr.name==='type'&&/^[1aAiI]$/.test(attr.value);
        const alignment=attr.name==='align'&&/^(left|center|right|justify)$/.test(attr.value);
        if(!numeric&&!listType&&!alignment) node.removeAttribute(attr.name);
      });
      if(['left','center','right','justify'].includes(textAlign))node.style.textAlign=textAlign;
      if(breakBefore==='always')node.style.pageBreakBefore='always';
      if(breakAfter==='always')node.style.pageBreakAfter='always';
    });
  }
  clean(template.content);
  return template.innerHTML;
}

/* Used only for JS literals within an HTML attribute. */
function htmlJsArg(value){ return escapeHtml(JSON.stringify(String(value==null ? "" : value))); }

function attendanceSummary(students, records){
  const result = {H:0,S:0,I:0,A:0,unmarked:0};
  students.forEach(student=>{
    const status = (records||{})[student.id];
    if(["H","S","I","A"].includes(status)) result[status]++;
    else result.unmarked++;
  });
  return result;
}
