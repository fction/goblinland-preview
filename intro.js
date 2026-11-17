/* R08_09D host-only intro. No scene, shader or motion changes. */
(()=>{'use strict';
 const root=document.documentElement,el=document.getElementById('intro'),liquid=el.querySelector('.intro-liquid'),message=document.getElementById('intro-message'),skip=el.querySelector('button'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const started=performance.now(),history=[],timers=new Set(),abort=new AbortController();let progress=0,finished=false,closing=false,locked=false,priorInert=false,home=null,mode='loading',interval;
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn()},ms);timers.add(id);return id};
 const log=(event,detail={})=>history.push({event,ms:performance.now(),...detail});
 function set(p,stage){p=Math.max(progress,Math.min(p,1));if(p===progress)return;progress=p;liquid.style.setProperty('--intro-level',`${(1-p)*100}%`);log('progress',{value:p,stage});}
 function lock(){if(finished||closing)return;home=document.getElementById('home');if(home&&!locked){priorInert=home.inert;home.inert=true;locked=true;}}
 function unlock(){if(locked&&home){home.inert=priorInert;locked=false;}delete root.dataset.intro;}
 function teardown(reason){if(finished)return;finished=true;mode=reason;clearInterval(interval);for(const id of timers)clearTimeout(id);timers.clear();observer.disconnect();abort.abort();unlock();el.hidden=true;el.remove();log('hidden',{reason});window.dispatchEvent(new CustomEvent('goblin-intro-complete',{detail:{reason,ms:performance.now()}}));}
 function exit(reason){if(closing||finished)return;closing=true;mode=reason;clearInterval(interval);log('exit-start',{reason});if(reason==='ready'||reason==='poster'){set(1,reason==='ready'?'first-valid-frame':'static-cards-presented');el.dataset.finishing='';message.textContent='Goblin Cards ready.';}else message.textContent='Site information is available.';
 later(()=>{el.dataset.exiting='';unlock();later(()=>teardown(reason),reduce.matches?110:230)},reason==='ready'||reason==='poster'?(reduce.matches?80:200):0);}
 function fail(){exit('fallback')}
 function sample(){if(closing||finished)return;if(root.dataset.graphics==='unavailable'||window.R07_ERROR){fail();return;}
  if(window.R08){set(.25,'host-and-controller-initialized');}
  // The frozen R08_09B_FIX graph makes 23 fetchBytes requests; reflection is a separate image.
  const completed=new Set((window.R07_NETWORK||[]).filter(x=>x.complete).map(x=>x.url)).size;
  if(completed)set(.25+.45*Math.min(completed/23,1),'completed-runtime-assets');
  if(window.R07?.objects?.length===3)set(.8,'objects-assembled-shader-preparation');
  if(window.R07?.milestones?.B)set(.9,'hero-frame-presented-detail-preparation');
  if(window.R07?.milestones?.B)exit('ready');
 }
 el.hidden=false;root.dataset.intro='loading';log('shown');set(.15,'parser-bootstrap');
 // Let the small branded SVG paint before the unchanged PMREM/shader startup.
 const painted=new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{log('initial-paint-gate');resolve();})));
 const observer=new MutationObserver(()=>{if(root.dataset.graphics==='unavailable')fail()});observer.observe(root,{attributes:true,attributeFilter:['data-graphics']});
 document.addEventListener('DOMContentLoaded',()=>{
  lock();
  const poster=document.querySelector('.hero-poster img');
  if(!poster)return;
  Promise.all([poster.decode(),document.fonts.ready,painted]).then(()=>{
   if(poster.naturalWidth&&!finished)exit('poster');
  }).catch(()=>{});
 },{once:true,signal:abort.signal});
 window.addEventListener('goblin-ready',()=>queueMicrotask(sample),{signal:abort.signal});window.addEventListener('goblin-error',fail,{signal:abort.signal});
 // Do not queue hidden selector gestures during the final ready/settle interval.
 const covered=()=>!finished&&!el.hasAttribute('data-exiting');
 for(const type of ['wheel','touchstart','touchmove'])window.addEventListener(type,e=>{if(covered()&&!skip.contains(e.target)){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();}},{capture:true,passive:false,signal:abort.signal});
 document.addEventListener('keydown',e=>{if(!covered())return;if(e.target===skip&&['Enter',' '].includes(e.key))return;if(e.key==='Tab'&&!skip.hidden){e.preventDefault();skip.focus();return;}if(['Tab','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Escape'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();}},{capture:true,signal:abort.signal});
 skip.addEventListener('click',()=>{exit('manual-continue');later(()=>home?.focus({preventScroll:true}),0);},{signal:abort.signal});
 later(()=>{if(!closing&&!finished){skip.hidden=false;message.textContent='Still preparing interactive cards. You can continue to the site.';}},1500);
 // Fail open on a stalled module/network without pretending graphics are ready.
 later(()=>exit('watchdog-continue'),3500);
 interval=setInterval(sample,100);
 window.addEventListener('pagehide',e=>{if(!e.persisted)teardown('pagehide')},{signal:abort.signal});
 window.GOBLIN_INTRO={painted,snapshot:()=>({started,progress,mode,finished,closing,history:[...history],activeTimers:timers.size,polling:!finished&&!closing})};
})();
