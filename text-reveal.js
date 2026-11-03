export function createTextReveal(){
 const roots=[...document.querySelectorAll('#next-section,#how-it-works,#faq,#contact')],abort=new AbortController(),mq=matchMedia('(prefers-reduced-motion: reduce)');
 const selectors=['.section-label','.delivery-copy h2','.delivery-description','.delivery-link','.account-intro h2','.account-description','.account-benefits li>span:last-child','.account-invite p','.invite-links a','.info-label','.how-intro h2','.how-intro>p:last-child','.step-index','.how-step h3','.how-step div>p','.how-links a','.faq-header h2','.faq-header>a','.faq-item h3 button','.footer-brand p','.footer-group h2','.footer-group a','.footer-bottom>p','.footer-bottom h2','.footer-bottom a'];
 const targets=roots.flatMap(root=>[...root.querySelectorAll(selectors.join(','))]),done=new WeakSet(),active=new Map(),layers=new Map(),audit=[],effects=[],effectActive=new Map(),effectDone=new Set(),epochs=new Map(),effectAudit=[];let initialized=false,disposed=false,settleTimer=0,lastScroll=scrollY;
 const on=(o,t,fn)=>o.addEventListener(t,fn,{signal:abort.signal});
 function finish(el){const run=active.get(el);if(run){run.animations.forEach(a=>a.cancel());run.group.remove();active.delete(el);if(!run.layer.children.length){run.layer.remove();layers.delete(run.root);}}el.classList.remove('text-reveal-pending');done.add(el);}
 function finishAll(){targets.forEach(finish);effects.forEach(finishEffect);epochs.clear();}
 function finishSection(root){targets.filter(el=>root.contains(el)).forEach(finish);effects.filter(e=>e.root===root).forEach(finishEffect);epochs.delete(root);}
 function interrupt(){for(const root of roots)if([...active.values(),...effectActive.values()].some(a=>a.root===root))finishSection(root);}
 function boxFor(el){const r=el.getBoundingClientRect();return r.width&&r.height?r:el.querySelector('img,svg')?.getBoundingClientRect()||r;}
 function visible(el){const r=boxFor(el);return r.width>0&&r.height>0&&r.bottom>20&&r.top<innerHeight-20;}
 const fontProps=['font-family','font-size','font-weight','font-style','font-variant','font-stretch','font-feature-settings','font-kerning','font-variation-settings','letter-spacing','word-spacing','text-transform','text-decoration','color','direction'];
 function lineArtwork(el){
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),range=document.createRange(),items=[];let node;
  while(node=walker.nextNode()){
   if(node.parentElement.closest('svg,.entrance-icon'))continue;const style=getComputedStyle(node.parentElement),pieces=[];
   for(const match of node.textContent.matchAll(/\S+/gu)){
    range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);const rects=[...range.getClientRects()].filter(r=>r.width&&r.height);
    if(rects.length===1)pieces.push({start:match.index,end:match.index+match[0].length,rect:rects[0]});
    else{let offset=match.index;for(const c of match[0]){range.setStart(node,offset);range.setEnd(node,offset+c.length);const r=range.getBoundingClientRect();pieces.push({start:offset,end:offset+c.length,rect:r});offset+=c.length;}}
   }
   const runs=[];for(const piece of pieces){const last=runs.at(-1);if(last&&Math.abs(last.rect.top-piece.rect.top)<2)last.end=piece.end;else runs.push({...piece});}
   for(const run of runs){range.setStart(node,run.start);range.setEnd(node,run.end);const r=range.getBoundingClientRect(),span=document.createElement('span');span.className='text-reveal-run';let text=node.textContent.slice(run.start,run.end);if(['normal','nowrap'].includes(style.whiteSpace))text=text.replace(/[ \t\r\n\f]+/g,' ');span.textContent=text;for(const p of fontProps)span.style.setProperty(p,style.getPropertyValue(p));span.style.lineHeight=r.height+'px';items.push({rect:r,element:span,text});}
  }
  for(const original of [...el.querySelectorAll('svg,img,.faq-chevron')].filter(e=>!e.matches('.entrance-icon'))){
   const rect=original.getBoundingClientRect();if(!rect.width||!rect.height)continue;const clone=original.cloneNode(true),style=getComputedStyle(original);clone.removeAttribute('id');clone.classList.add('text-reveal-atom');for(const p of ['color','border','border-radius','background','transform','transform-origin','display'])clone.style.setProperty(p,style.getPropertyValue(p));clone.style.width=rect.width+'px';clone.style.height=rect.height+'px';items.push({rect,element:clone,text:'[ornament]'});
  }
  const lines=[];for(const item of items.sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left)){const r=item.rect;let line=lines.find(l=>Math.min(l.bottom,r.bottom)-Math.max(l.top,r.top)>Math.min(l.bottom-l.top,r.height)*.55);if(!line){line={top:r.top,bottom:r.bottom,left:r.left,right:r.right,items:[]};lines.push(line);}line.top=Math.min(line.top,r.top);line.bottom=Math.max(line.bottom,r.bottom);line.left=Math.min(line.left,r.left);line.right=Math.max(line.right,r.right);line.items.push(item);}return lines.sort((a,b)=>a.top-b.top);
 }
 function choreography(el,root){
  let delay=220,kind='body';const heading=el.matches('h2')&&!el.closest('footer');if(heading)kind='heading';if(el.matches('a,.section-label,.info-label,.step-index')||el.closest('footer'))kind='light';
  if(root.id==='next-section'){
   if(el.matches('.delivery-copy .section-label'))delay=0;else if(el.matches('.delivery-copy h2'))delay=45;else if(el.matches('.delivery-description'))delay=130;else if(el.matches('.account-intro .section-label'))delay=70;else if(el.matches('.account-intro h2'))delay=120;else if(el.matches('.account-description'))delay=300;else if(el.matches('.account-benefits li>span:last-child'))delay=200+[...root.querySelectorAll('.account-benefits li>span:last-child')].indexOf(el)*65;else delay=330;
  }else if(root.id==='how-it-works'){
   if(el.matches('.info-label'))delay=0;else if(el.matches('.how-intro h2'))delay=65;else if(el.matches('.how-intro>p:last-child'))delay=270;else if(el.closest('.how-step')){const step=el.closest('.how-step'),index=[...root.querySelectorAll('.how-step')].indexOf(step);delay=130+index*75+(el.matches('.step-index')?0:el.matches('h3')?35:120);}else delay=360;
  }else if(root.id==='faq'){
   if(el.matches('.info-label'))delay=0;else if(el.matches('h2'))delay=65;else if(el.closest('.faq-item'))delay=190+[...root.querySelectorAll('.faq-item')].indexOf(el.closest('.faq-item'))*60;else delay=300;
  }else{const group=el.closest('.footer-group');delay=el.closest('.footer-brand')?50:group?100+[...root.querySelectorAll('.footer-group')].indexOf(group)*65:300;if(group&&el.matches('a'))delay+=80+[...group.querySelectorAll('a')].indexOf(el)*45;}
  const footer=root.id==='contact';return{delay,duration:footer?1000:kind==='heading'?1250:kind==='body'?1150:1050,stagger:kind==='heading'?135:footer?75:95,blur:footer?7:kind==='heading'?10:8};
 }

 // The same document-timeline epoch schedules all text, rules, icons and media
 // in an eligible section wave. No independent per-element timers.
 function schedule(el,frames,options,epoch){const a=el.animate(frames,options);a.startTime=epoch;return a;}
 function addEffect(selector,role,delay,duration,group,side){
  for(const el of document.querySelectorAll(selector)){
   const root=roots.find(r=>r.contains(el));if(!root)continue;
   const owner=role==='brand'?el.closest('a'):role==='answer'?el.closest('.faq-item'):role==='icon'?el.closest('a,button,li')||el:el;
   const e={el,owner,root,selector,role,delay,duration,group,side};effects.push(e);
   if(role==='icon'){el.style.setProperty('--entrance-icon-color',getComputedStyle(el).color);el.classList.add('entrance-icon');}
  }
 }
 function buildEffects(){
  addEffect('.delivery-row','rule',200,650,'delivery','bottom');
  addEffect('.account-benefits','rule',220,600,'account','left');addEffect('.account-benefits','rule',220,600,'account','top');
  addEffect('.account-invite','rule',430,600,'invite','top');
  addEffect('.dashboard-link','cta',420,800,'account-cta');
  document.querySelectorAll('.account-benefits li').forEach((el,i)=>addEffect(`.account-benefits li:nth-child(${i+1}) .benefit-check`,'icon',650+i*65,500,`benefit-${i+1}`));
  document.querySelectorAll('.how-step').forEach((el,i)=>{
   addEffect(`.how-step:nth-child(${i+1})`,'rule',230+i*75,650,`step-${i+1}`,'top');
   addEffect(`.how-step:nth-child(${i+1}) .step-index`,'rule',230+i*75,550,`step-${i+1}`,'right');
  });
  document.querySelectorAll('.faq-item').forEach((el,i)=>{
   const n=i+1;addEffect(`.faq-item:nth-child(${n})`,'rule',350+i*60,600,`faq-${n}`,'top');
   addEffect(`.faq-item:nth-child(${n}) .faq-chevron`,'icon',840+i*60,450,`faq-${n}`);
   addEffect(`.faq-item:nth-child(${n}) .faq-answer>div`,'answer',1040+i*60,500,`faq-${n}`);
  });
  addEffect('.footer-brand img','brand',50,650,'footer-brand');
  document.querySelectorAll('.footer-group').forEach((el,i)=>addEffect(`.footer-group[aria-label="${el.getAttribute('aria-label')}"]`,'rule',220+i*65,600,`footer-column-${i+1}`,'left'));
  addEffect('.footer-bottom','rule',430,650,'footer-lower','top');addEffect('.footer-contact','rule',430,550,'footer-contact','left');
  addEffect('.footer-terrain','media',100,1250,'footer-landscape');
  // Original inline arrows and social SVGs receive a restrained icon entrance.
  for(const el of document.querySelectorAll('.delivery-link,.invite-links a,.how-links a,.faq-header>a,.footer-bottom a')){
   const root=roots.find(r=>r.contains(el)),t=choreography(el,root),index=[...root.querySelectorAll('a')].indexOf(el);
   for(const icon of el.querySelectorAll('span[aria-hidden],svg')){
    icon.style.setProperty('--entrance-icon-color',getComputedStyle(icon).color);icon.classList.add('entrance-icon');
    effects.push({el:icon,owner:el,root,selector:`#${root.id} link[${index}] icon`,role:'icon',group:'link',delay:t.delay+550,duration:450});
   }
  }
 }
 function armEffect(e){if(e.role==='rule')e.el.classList.add('entrance-border-'+e.side);else{e.el.classList.add('entrance-pending');if(e.role==='cta'||e.role==='brand')e.owner.classList.add('entrance-hit-blocked');}}
 function finishEffect(e){
  const run=effectActive.get(e);if(run){run.animation.cancel();run.visual?.remove();effectActive.delete(e);if(run.layer&&!run.layer.children.length){run.layer.remove();layers.delete(e.root);}}
  e.el.classList.remove('entrance-pending');e.owner.classList.remove('entrance-hit-blocked');if(e.side)e.el.classList.remove('entrance-border-'+e.side);effectDone.add(e);
 }
 function eligible(e){
  if(e.role==='answer'&&!e.el.closest('.faq-item').classList.contains('is-open'))return false;
  return visible(e.owner);
 }
 function revealEffect(e,epoch){
  if(mq.matches||disposed){finishEffect(e);return;}
  try{
   const {el,root,role}=e;let target=el,visual,layer,frames,delay=e.delay;
   if(role==='rule'){
    const cls='entrance-border-'+e.side;el.classList.remove(cls);const c=getComputedStyle(el),cap=e.side[0].toUpperCase()+e.side.slice(1),size=parseFloat(c['border'+cap+'Width']),color=c['border'+cap+'Color'];
    if(!size||color==='rgba(0, 0, 0, 0)'){finishEffect(e);return;}
    const r=el.getBoundingClientRect(),rr=root.getBoundingClientRect(),vertical=['left','right'].includes(e.side);el.classList.add(cls);layer=sectionLayer(root);visual=document.createElement('div');visual.className='entrance-rule';
    Object.assign(visual.style,{position:'absolute',left:r.left-rr.left+(e.side==='right'?r.width-size:0)+'px',top:r.top-rr.top+(e.side==='bottom'?r.height-size:0)+'px',width:(vertical?size:r.width)+'px',height:(vertical?r.height:size)+'px',background:color,transformOrigin:'0 0',pointerEvents:'none'});layer.append(visual);target=visual;
    frames=[{transform:vertical?'scaleY(0)':'scaleX(0)',opacity:0},{transform:vertical?'scaleY(1)':'scaleX(1)',opacity:1}];
   }else{
    // Remove only this element's pending ink, never the semantic parent/layout.
    el.classList.remove('entrance-pending');const base=getComputedStyle(el).transform,rotation=base==='none'?'':base;el.classList.add('entrance-pending');
    if(role==='answer'){
     const q=el.closest('.faq-item').querySelector('button'),entry=[...audit].reverse().find(a=>a.text===q.textContent.trim().slice(0,70));delay+=Math.min(Math.max(0,(entry?.lineCount||1)-1)*95,450);
     frames=[{opacity:0},{opacity:1}];
    }else{const y=role==='media'?60:role==='cta'?64:16;frames=[{transform:`translateY(${y}px) ${rotation}`,opacity:0},{transform:`translateY(0px) ${rotation}`,opacity:1}];if(role==='cta'){frames[0].filter='blur(3px)';frames[1].filter='blur(0px)';}}
   }
   const animation=schedule(target,frames,{duration:e.duration,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'},epoch);const run={root,animation,visual,layer};effectActive.set(e,run);effectAudit.push({section:root.id,role,selector:e.selector,group:e.group,delay,duration:e.duration,epoch});
   animation.finished.catch(()=>{}).then(()=>{if(effectActive.get(e)===run)finishEffect(e);});
  }catch(error){effectAudit.push({error:String(error),selector:e.selector});finishEffect(e);}
 }

 function sectionLayer(root){let layer=layers.get(root);if(layer)return layer;const r=root.getBoundingClientRect();layer=document.createElement('div');layer.className='text-reveal-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;Object.assign(layer.style,{left:r.left+scrollX+'px',top:r.top+scrollY+'px',width:r.width+'px',height:r.height+'px'});document.body.append(layer);layers.set(root,layer);return layer;}
 function reveal(el,epoch){
  if(done.has(el)||active.has(el)||!visible(el))return;if(mq.matches||disposed){finish(el);return;}
  try{
   // Restore color synchronously for measurement, then hide only original ink.
   // Backgrounds, rules, button frames and the semantic layout never move.
   el.classList.remove('text-reveal-pending');const root=roots.find(r=>r.contains(el)),r=root.getBoundingClientRect(),visibleBottom=Math.min(innerHeight,r.bottom),visibleTop=Math.max(0,r.top);
   const lines=lineArtwork(el).filter(l=>l.bottom>visibleTop+10&&(l.top+l.bottom)/2<visibleBottom-18);if(!lines.length){finish(el);return;}
   const timing=choreography(el,root),layer=sectionLayer(root),group=document.createElement('div');group.className='text-reveal-group';layer.append(group);const animations=[],proof=[];
   for(const [i,line] of lines.entries()){
    const h=line.bottom-line.top,center=(line.top+line.bottom)/2,launch=visibleBottom-Math.max(48,h/2+16),travel=Math.max(0,launch-center),visual=document.createElement('div');visual.className='text-reveal-line';Object.assign(visual.style,{left:line.left-r.left+'px',top:line.top-r.top+'px',width:line.right-line.left+'px',height:h+'px'});
    for(const item of line.items){Object.assign(item.element.style,{left:item.rect.left-line.left+'px',top:item.rect.top-line.top+'px'});visual.append(item.element);}group.append(visual);
    const delay=timing.delay+Math.min(i*timing.stagger,450);
    animations.push(schedule(visual,[{transform:`translateY(${travel}px)`,filter:`blur(${timing.blur}px)`,opacity:0},{transform:'translateY(0)',filter:'blur(0px)',opacity:1}],{duration:timing.duration,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'},epoch));
    visual.dataset.travel=travel.toFixed(2);visual.dataset.finalCenter=center.toFixed(2);visual.dataset.launchCenter=launch.toFixed(2);visual.dataset.delay=delay;proof.push({text:line.items.map(x=>x.text).join(' '),finalCenter:center,launchCenter:launch,travel,delay});
   }
   el.classList.add('text-reveal-pending');active.set(el,{root,layer,group,animations});audit.push({section:root.id,text:el.textContent.trim().slice(0,70),lineCount:lines.length,at:performance.now(),duration:timing.duration,lines:proof});
   Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(active.get(el)?.group===group)finish(el);});
  }catch(error){audit.push({error:String(error),text:el.textContent.slice(0,40)});finish(el);}
 }
 function arrive(){
  if(!initialized||disposed||window.R08_NAV?.snapshot().running)return;
  for(const root of roots){
   const text=targets.filter(el=>root.contains(el)&&!done.has(el)&&!active.has(el)&&visible(el)),fx=effects.filter(e=>e.root===root&&!effectDone.has(e)&&!effectActive.has(e)&&eligible(e));
   if(!text.length&&!fx.length)continue;
   if(![...active.values(),...effectActive.values()].some(a=>a.root===root))epochs.set(root,document.timeline.currentTime);
   const epoch=epochs.get(root)??document.timeline.currentTime;
   text.forEach(el=>reveal(el,epoch));fx.forEach(e=>revealEffect(e,epoch));
  }
 }
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(!e.isIntersecting&&active.has(e.target))finishSection(roots.find(r=>r.contains(e.target)));clearTimeout(settleTimer);settleTimer=setTimeout(arrive,130);},{threshold:[0,.05]});
 const resize=new ResizeObserver(()=>{if(initialized){interrupt();clearTimeout(settleTimer);settleTimer=setTimeout(arrive,130);}});
 document.fonts.ready.then(()=>{if(disposed)return;initialized=true;buildEffects();for(const e of effects){if(mq.matches)finishEffect(e);else armEffect(e);observer.observe(e.owner);}for(const el of targets){if(mq.matches)done.add(el);else if(!visible(el))el.classList.add('text-reveal-pending');observer.observe(el);}roots.forEach(r=>resize.observe(r));arrive();});
 on(window,'goblin-navigation-settled',()=>{clearTimeout(settleTimer);arrive();});on(window,'goblin-navigation-start',()=>{interrupt();});
 on(window,'scroll',()=>{if(Math.abs(scrollY-lastScroll)>32){interrupt();lastScroll=scrollY;}clearTimeout(settleTimer);settleTimer=setTimeout(arrive,140);});
 on(window,'resize',()=>{interrupt();});
 on(document,'focusin',e=>{const root=roots.find(r=>r.contains(e.target));if(root)finishSection(root);});on(document,'pointerdown',e=>{const root=roots.find(r=>r.contains(e.target));if(root)finishSection(root);});
 on(document,'click',e=>{if(e.target.closest('.faq-item button'))interrupt();});on(mq,'change',()=>{if(mq.matches)finishAll();});
 return{snapshot:()=>({initialized,pending:targets.filter(e=>e.classList.contains('text-reveal-pending')).length,active:active.size+effectActive.size,textActive:active.size,effectActive:effectActive.size,layers:layers.size,lineAudit:audit.slice(-120),effectAudit:effectAudit.slice(-180),coverage:effects.map(e=>({section:e.root.id,selector:e.selector,role:e.role,group:e.group,delay:e.delay,duration:e.duration,side:e.side||null}))}),finish:finishAll,replay(id){const root=document.getElementById(id);for(const el of targets)if(root?.contains(el)){finish(el);done.delete(el);el.classList.add('text-reveal-pending');}for(const e of effects)if(e.root===root){finishEffect(e);effectDone.delete(e);armEffect(e);}epochs.delete(root);arrive();},dispose(){disposed=true;finishAll();abort.abort();observer.disconnect();resize.disconnect();clearTimeout(settleTimer);}};
}
