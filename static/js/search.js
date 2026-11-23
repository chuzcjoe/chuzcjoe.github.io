(() => {
  const box = document.querySelector('.searchbox'), input = box.querySelector('input'), body = box.querySelector('.searchbox-body');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data, loading, previousFocus, selected = -1;
  const highlight = (value, terms, max = 0) => {
    let text = String(value || '');
    if (max && text.length > max) {
      const match = terms.map(t => text.toLowerCase().indexOf(t)).filter(i => i >= 0).sort((a,b)=>a-b)[0] || 0;
      const start = Math.max(0, match - 30);
      text = (start ? '…' : '') + text.slice(start, start + max) + (start + max < text.length ? '…' : '');
    }
    const lower = text.toLowerCase(), spans = [];
    for (const term of terms) {
      let position = 0, index;
      while ((index = lower.indexOf(term, position)) !== -1) { spans.push([index, index + term.length]); position = index + Math.max(1,term.length); }
    }
    spans.sort((a,b)=>a[0]-b[0]);
    const merged = [];
    for (const span of spans) { const last=merged.at(-1); if(last && span[0]<=last[1])last[1]=Math.max(last[1],span[1]);else merged.push(span); }
    let result = '', cursor = 0;
    for (const [start,end] of merged) { result += escape(text.slice(cursor,start)) + '<em>' + escape(text.slice(start,end)) + '</em>'; cursor = end; }
    return result + escape(text.slice(cursor));
  };
  const render = () => {
    if (!data) return;
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    body.replaceChildren(); selected=-1;
    for (const [type,label,icon,limit] of [['posts','Posts','file',20],['pages','Pages','file',5],['categories','Categories','folder',5],['tags','Tags','tag',5]]) {
      const fields = type==='posts'||type==='pages' ? ['title','text'] : ['name','slug'];
      const score = item => terms.reduce((sum,term)=>sum+fields.reduce((s,f,i)=>s+(String(item[f]||'').toLowerCase().includes(term) ? i===0?3:1 : 0),0),0);
      const matches = data[type].filter(item=>terms.every(term=>fields.some(f=>String(item[f]||'').toLowerCase().includes(term)))).sort((a,b)=>score(b)-score(a)).slice(0,limit);
      if (!matches.length) continue;
      const section=document.createElement('section');section.className='searchbox-result-section';
      const header=document.createElement('header');header.textContent=label;section.append(header);
      for (const item of matches) {
        const a=document.createElement('a');a.className='searchbox-result-item';a.href=item.link;
        a.innerHTML=`<span class="searchbox-result-icon"><i class="fa fa-${icon}"></i></span><span class="searchbox-result-content"><span class="searchbox-result-title">${highlight(item.title||item.name||'(Untitled)',terms)}</span>${item.text?'<span class="searchbox-result-preview">'+highlight(item.text,terms,100)+'</span>':''}</span>`;
        section.append(a);
      }
      body.append(section);
    }
    if(!body.children.length){const p=document.createElement('p');p.className='search-error';p.textContent='No results found.';body.append(p);}
  };
  const ensureData = async () => {
    if(data) return render();
    body.textContent='Loading…';
    try {
      loading ||= fetch('/content.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();});
      data=await loading;render();
    } catch { loading=null;body.textContent='Search could not load. Close and reopen to retry.'; }
  };
  const open = e => { e?.preventDefault();previousFocus=document.activeElement;box.classList.add('show');input.focus();void ensureData(); };
  const close = () => {box.classList.remove('show');previousFocus?.focus();};
  document.querySelector('.navbar-main .search').addEventListener('click',open);
  box.querySelector('.searchbox-close').addEventListener('click',close);
  box.addEventListener('click',e=>{if(e.target===box)close();});
  input.addEventListener('input',render);
  document.addEventListener('keydown',e=>{
    if(!box.classList.contains('show'))return;
    if(e.key==='Escape'){e.preventDefault();close();return;}
    const items=[...body.querySelectorAll('.searchbox-result-item')];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();if(!items.length)return;
      selected=(selected+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;
      items.forEach((a,i)=>a.classList.toggle('active',i===selected));items[selected].scrollIntoView({block:'nearest'});
    }else if(e.key==='Enter'&&selected>=0){e.preventDefault();items[selected]?.click();}
    else if(e.key==='Tab'){
      const focusable=[input,box.querySelector('.searchbox-close'),...items], first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  if(location.hash==='#insight-search')open();
})();
