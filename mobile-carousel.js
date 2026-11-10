// Shared selector controls + mobile input adapter. Navigation owns all selection.
export function createSelectorControls(nav){
 const abort=new AbortController(),on=(el,type,fn,opts={})=>el.addEventListener(type,fn,{...opts,signal:abort.signal}),mobile=()=>!!window.R08_LAYOUT?.get().mobile;
 const track=document.getElementById('scroll-track'),detail=document.getElementById('detail'),indicator=document.getElementById('card-indicator');
 const controls=document.createElement('div');controls.className='selector-controls mobile-carousel-controls';controls.hidden=true;controls.setAttribute('role','group');controls.setAttribute('aria-label','Choose a card');
 const button=(label,arrow,attr)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.setAttribute(attr,'');b.textContent=arrow;return b;};
 const prev=button('Previous card','←','data-carousel-prev'),next=button('Next card','→','data-carousel-next');controls.append(prev,indicator,next);detail.insertBefore(controls,document.getElementById('return'));let gesture=null;
 const active=()=>nav.isReady()&&nav.snapshot().mode==='selector';
 function step(dir){const s=nav.snapshot(),wanted=s.pendingStage??(s.running?s.targetStage:s.currentStage),n=Math.max(1,Math.min(3,wanted+dir));if(active()&&wanted>0&&n!==wanted)nav.go(n,mobile()?'carousel':'selector-control');}
 on(prev,'click',()=>step(-1));on(next,'click',()=>step(1));
 function sync(){const s=nav.snapshot(),enabled=active();controls.hidden=!enabled;const wanted=s.pendingStage??(s.running?s.targetStage:s.currentStage),closing=wanted===0;prev.disabled=closing||wanted<=1;next.disabled=closing||wanted>=3;for(const dot of indicator.children){dot.disabled=!enabled||closing;dot.tabIndex=enabled?0:-1;dot.setAttribute('aria-label',({Original:'Graphite',Cash:'Acid Green',Virtual:'Silver'})[dot.dataset.indicator]);dot.setAttribute('aria-pressed',String(dot.hasAttribute('data-active')));dot.toggleAttribute('aria-hidden',!enabled);}}
 on(window,'goblin-navigation-start',e=>{if(e.detail.targetStage===0)gesture=null;sync();});on(window,'goblin-navigation-queued',sync);on(window,'goblin-navigation-settled',sync);on(window,'goblin-layout',()=>{gesture=null;sync();});
 const observer=new MutationObserver(sync);observer.observe(indicator,{attributes:true,attributeFilter:['data-active'],subtree:true});
 on(indicator,'click',e=>{const dot=e.target.closest('[data-indicator]');if(dot&&active()&&!(nav.snapshot().running&&nav.snapshot().targetStage===0))nav.go(['Original','Cash','Virtual'].indexOf(dot.dataset.indicator)+1,'carousel-indicator');});
 on(document,'keydown',e=>{if(!mobile()&&active()&&!e.defaultPrevented&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.target.closest?.('input,textarea,select,[contenteditable="true"]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
 on(track,'pointerdown',e=>{if(!mobile()||!active()||(nav.snapshot().running&&nav.snapshot().targetStage===0)||!e.isPrimary||e.pointerType==='mouse'&&e.button!==0||e.clientX<24||e.clientX>innerWidth-24||e.target.closest('button,a,[role="button"],input,textarea,select'))return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),axis:null};},{passive:true});
 on(track,'pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.axis&&Math.hypot(dx,dy)>12){if(Math.abs(dx)>Math.abs(dy)*1.35){gesture.axis='x';track.setPointerCapture(e.pointerId);}else{gesture=null;return;}}});
 on(track,'pointerup',e=>{const g=gesture;gesture=null;if(!g||g.id!==e.pointerId||g.axis!=='x')return;const dx=e.clientX-g.x,dy=e.clientY-g.y,velocity=Math.abs(dx)/Math.max(1,performance.now()-g.t);if(Math.abs(dx)>Math.abs(dy)*1.35&&(Math.abs(dx)>=48||Math.abs(dx)>=24&&velocity>.35))step(dx<0?1:-1);});
 on(track,'pointercancel',()=>gesture=null);on(window,'pagehide',()=>gesture=null);on(window,'pageshow',()=>{gesture=null;sync();});
 sync();return {dispose(){abort.abort();observer.disconnect();controls.remove();gesture=null;}};
}
