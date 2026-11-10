import {applySelectorContent} from './selector-content.js';
// Shared host geometry. Reads/writes are coalesced; no persistent resize RAF.
export function createResponsive(){
 const root=document.documentElement,abort=new AbortController();const safeProbe=document.createElement('div');safeProbe.setAttribute('aria-hidden','true');safeProbe.style.cssText='position:fixed;width:0;height:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)';document.body.append(safeProbe);let timer=0,frame=0,version=0,state,disposed=false,dprQuery,stableWidth=0,stableHeight=0;
 const on=(o,t,f,opts={})=>o?.addEventListener(t,f,{...opts,signal:abort.signal});
 const liveHeight=()=>root.clientWidth<=1024?root.clientHeight:innerHeight,majorHeightChange=()=>Math.abs(liveHeight()-stableHeight)>Math.max(160,stableHeight*.25)&&(window.visualViewport?.scale||1)<=1.01;
 function update(){if(disposed)return;const vw=root.clientWidth<=1024?root.clientWidth:innerWidth,mobile=vw<=1024;
 // Height-only toolbar / visualViewport changes do not own the mobile scene.
 // A changed layout width (including orientation) establishes a new frame.
 if(!mobile||stableWidth!==vw||majorHeightChange()){stableWidth=vw;stableHeight=mobile?root.clientHeight:innerHeight;}
 const vh=mobile?stableHeight:innerHeight,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const growthX=Math.max(0,vw/1920-1),growthY=Math.max(0,vh/1080-1),wide=Math.max(0,Math.log2((vw/vh)/(16/9))),density=clamp((vw-1920)/640,0,1)*clamp((vh-800)/280,0,1);
 const largeScale=Math.min(Math.max(1,vh/1080),1.75,1+.55*Math.sqrt(growthX*growthY)),uiScale=Math.min(1.55,1+.9*(largeScale-1)+.10*wide*density);
 const hero=document.getElementById('hero-copy');
 const compactHeight=mobile&&vh<=520?Math.max(vh,hero.offsetTop+hero.offsetHeight+24):mobile?Math.ceil(hero.offsetTop+hero.offsetHeight+Math.min(vw*.42,320)+104):vh;
 const mobileHeight=root.hasAttribute('data-selector-mode')?vh:compactHeight;
 const w=Math.min(vw,1920*largeScale*(1+.16*wide*density)),h=mobile?mobileHeight:Math.min(vh,1080*largeScale),x=(vw-w)/2,y=mobile?0:(vh-h)/2,stack=(w<700&&h>520)||(w<1100&&h>w*.85),narrow=stack&&w<700,narrowBoost=clamp((700-w)/200,0,1);
 root.toggleAttribute('data-mobile-carousel',mobile);root.style.setProperty('--mobile-stage-height',h+'px');root.dataset.layout=stack?'stack':'wide';root.toggleAttribute('data-large',uiScale>1.00001);root.style.setProperty('--large-scale',String(uiScale));
 for(const [k,v]of Object.entries({'frame-w':w,'frame-h':h,'frame-x':x,'frame-y':y,'view-h':vh}))root.style.setProperty('--'+k,v+'px');
 const detail=document.querySelector('#detail');let detailHeight=0,disclosureHeight=0;
 // Ordinary stacked hero keeps V1 reference metrics; active selector measures only its actual new DOM.
 if(stack||mobile){const clone=detail.cloneNode(true);clone.hidden=false;clone.inert=true;clone.dataset.measure='';clone.style.cssText='visibility:hidden!important;opacity:0!important;transform:none!important;pointer-events:none!important;max-height:none!important';document.getElementById('stage').append(clone);const mobileControls=clone.querySelector(".mobile-carousel-controls");if(mobileControls&&mobile)mobileControls.hidden=false;const heroReference=!mobile&&!root.hasAttribute('data-selector-mode');if(heroReference){const label=document.createElement('p');label.className='eyebrow';label.textContent='THE COLLECTION / 01';clone.prepend(label);const sub=document.createElement('p');sub.id='description';clone.querySelector('#detail-title').after(sub);}for(const id of ['Original','Cash','Virtual']){applySelectorContent(clone,id);if(heroReference){clone.querySelector('#description').textContent=clone.querySelector('#detail-title').textContent;clone.querySelector('#detail-title').textContent=document.querySelector('#choices [data-card="'+id+'"]').textContent.replace(/^\d+\s*/,'');}const note=clone.querySelector('.card-disclosure');note.hidden=true;const baseHeight=clone.getBoundingClientRect().height;detailHeight=Math.max(detailHeight,baseHeight);note.hidden=false;disclosureHeight=Math.max(disclosureHeight,clone.getBoundingClientRect().height-baseHeight);}clone.remove();}
 const safeBottom=parseFloat(getComputedStyle(safeProbe).paddingBottom)||0,header=document.querySelector('.header-layout-anchor')||document.querySelector('.site-header');
 const headerBottom=narrow?header.offsetTop+header.offsetHeight-y+1:stack?64:60,gap=narrow?Math.max(11,Math.min(22,h*.018)):stack?Math.max(14,Math.min(28,h*.025)):24;
 const available=narrow?h-headerBottom-detailHeight-2*gap-safeBottom-8:h-headerBottom-detailHeight-gap*3-16;
 let portrait=narrow?Math.max(80,Math.min(Math.min(320,h*.38)+(Math.min(460,h*.45,w*.74/.630607)-Math.min(320,h*.38))*narrowBoost,available)):stack?Math.max(80,Math.min(320,h*.38,available)):largeScale>1?Math.min(712.8*Math.pow(h/1080,.78)/(1+.20*wide*Math.min(1,growthY*3)),w*.40/.630607):Math.min(h*.66,w*.40/.630607);
 const mobileCardTop=(document.querySelector('.site-persistent')?.getBoundingClientRect().bottom||64)+56;
 if(mobile)portrait=clamp(vh-mobileCardTop-detailHeight-40,180,Math.min(300,vh*.34));
 const centerY=mobile?mobileCardTop+portrait/2:stack?headerBottom+gap+portrait/2:h*.49,detailTop=mobile?mobileCardTop+portrait+20:stack?centerY+portrait/2+gap:h*.217;
 const readExtra=mobile?0:stack?Math.ceil(Math.max(0,detailTop+detailHeight+disclosureHeight+safeBottom+16-vh)):0;root.style.setProperty('--detail-read-extra',readExtra+'px');root.style.setProperty('--detail-top',detailTop+'px');
 const heroBottom=hero.getBoundingClientRect().bottom-document.getElementById('stage').getBoundingClientRect().top-y;
 const shortWide=!stack&&h<=520,heroOffset=mobile||stack||shortWide?0:h*.225;
 state={version:++version,changedAt:performance.now(),viewportWidth:vw,viewportHeight:vh,mobile,width:w,height:h,x,y,stack,narrow,narrowBoost,largeScale,uiScale,wide,safeBottom,headerBottom,gap,available,shortWide,portrait,centerY,centerX:mobile&&!shortWide?w/2:stack?w/2:w*.26,detailTop,readExtra,disclosureHeight,heroOffset,heroBottom,detailHeight,reference:vw===1672&&vh===941};
 window.R08?.sync();window.R07?.motion.request();window.dispatchEvent(new CustomEvent('goblin-layout',{detail:state}));
 }
 function schedule(){if(state?.mobile&&innerWidth===stableWidth&&!majorHeightChange())return;clearTimeout(timer);timer=setTimeout(()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;update()})},70)}
 on(window,'resize',schedule);on(window,'orientationchange',schedule);on(window.visualViewport,'resize',schedule);document.fonts.ready.then(()=>{if(!disposed)update()});
 function dprWatch(){dprQuery=matchMedia(`(resolution: ${devicePixelRatio}dppx)`);dprQuery.addEventListener('change',()=>{schedule();dprWatch()},{once:true,signal:abort.signal})}dprWatch();update();
 const toggle=document.getElementById('menu-toggle'),menu=document.querySelector('.site-nav');
 function close(){root.removeAttribute('data-menu-open');toggle.setAttribute('aria-expanded','false')}
 on(toggle,'click',()=>{const open=root.toggleAttribute('data-menu-open');toggle.setAttribute('aria-expanded',String(open))});on(menu,'click',e=>{if(e.target.closest('a'))close()});on(document,'keydown',e=>{if(e.key==='Escape'&&root.hasAttribute('data-menu-open')){close();toggle.focus();e.stopImmediatePropagation()}},{capture:true});on(document,'pointerdown',e=>{if(!e.target.closest('.site-header'))close()});on(window,'goblin-navigation-jump',close);on(window,'goblin-layout',close);
 return{get:()=>state,update,schedule,dispose(){disposed=true;clearTimeout(timer);if(frame)cancelAnimationFrame(frame);abort.abort();safeProbe.remove()}};
}
