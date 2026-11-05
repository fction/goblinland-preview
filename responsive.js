// Shared host geometry. Reads/writes are coalesced; no persistent resize RAF.
export function createResponsive(){
 const root=document.documentElement,abort=new AbortController();let timer=0,frame=0,version=0,state,disposed=false,dprQuery;
 const on=(o,t,f,opts={})=>o?.addEventListener(t,f,{...opts,signal:abort.signal});
 function update(){if(disposed)return;const vw=innerWidth,vh=innerHeight,w=Math.min(vw,1920),h=Math.min(vh,1080),x=(vw-w)/2,y=(vh-h)/2,stack=(w<700&&h>520)||(w<1100&&h>w*.85);root.dataset.layout=stack?'stack':'wide';
 for(const [k,v]of Object.entries({'frame-w':w,'frame-h':h,'frame-x':x,'frame-y':y,'view-h':vh}))root.style.setProperty('--'+k,v+'px');
 const detail=document.querySelector('#detail');let detailHeight=0;
 if(stack){const clone=detail.cloneNode(true);clone.hidden=false;clone.inert=true;clone.dataset.measure='';clone.style.cssText='visibility:hidden!important;opacity:0!important;transform:none!important;pointer-events:none!important';clone.querySelector('#description').textContent='Deep graphite, a restrained gloss pattern, and a crisp silver edge.';document.getElementById('stage').append(clone);detailHeight=clone.getBoundingClientRect().height;clone.remove();}
 const headerBottom=stack?64:60,gap=stack?Math.max(14,Math.min(28,h*.025)):24;
 const portrait=stack?Math.max(80,Math.min(320,h*.38,h-headerBottom-detailHeight-gap*3-16)):Math.min(h*.66,w*.40/.630607);
 const centerY=stack?headerBottom+gap+portrait/2:h*.49,detailTop=stack?centerY+portrait/2+gap:h*.217;
 root.style.setProperty('--detail-top',detailTop+'px');
 const hero=document.getElementById('hero-copy'),heroBottom=hero.getBoundingClientRect().bottom-document.getElementById('stage').getBoundingClientRect().top-y;
 const shortWide=!stack&&h<=520,heroOffset=stack||shortWide?0:h*.225;
 state={version:++version,changedAt:performance.now(),viewportWidth:vw,viewportHeight:vh,width:w,height:h,x,y,stack,shortWide,portrait,centerY,centerX:stack?w/2:w*.26,detailTop,heroOffset,heroBottom,detailHeight,reference:vw===1672&&vh===941};
 window.R08?.sync();window.R07?.motion.request();window.dispatchEvent(new CustomEvent('goblin-layout',{detail:state}));
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;update()})},70)}
 on(window,'resize',schedule);on(window,'orientationchange',schedule);on(window.visualViewport,'resize',schedule);document.fonts.ready.then(()=>{if(!disposed)update()});
 function dprWatch(){dprQuery=matchMedia(`(resolution: ${devicePixelRatio}dppx)`);dprQuery.addEventListener('change',()=>{schedule();dprWatch()},{once:true,signal:abort.signal})}dprWatch();update();
 const toggle=document.getElementById('menu-toggle'),menu=document.querySelector('.site-nav');
 function close(){root.removeAttribute('data-menu-open');toggle.setAttribute('aria-expanded','false')}
 on(toggle,'click',()=>{const open=root.toggleAttribute('data-menu-open');toggle.setAttribute('aria-expanded',String(open))});on(menu,'click',e=>{if(e.target.closest('a'))close()});on(document,'keydown',e=>{if(e.key==='Escape'&&root.hasAttribute('data-menu-open')){close();toggle.focus();e.stopImmediatePropagation()}},{capture:true});on(document,'pointerdown',e=>{if(!e.target.closest('.site-header'))close()});on(window,'goblin-navigation-jump',close);on(window,'goblin-layout',close);
 return{get:()=>state,update,schedule,dispose(){disposed=true;clearTimeout(timer);if(frame)cancelAnimationFrame(frame);abort.abort()}};
}
