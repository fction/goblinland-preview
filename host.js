import {createResponsive} from './responsive.js';
import {siteConfig} from './config.js';
import {destination} from './destinations.js';
import './account.js';
import './sections.js';

import {createNavigation} from './navigation.js';
import {createSelectorControls} from './mobile-carousel.js';
window.R08_LAYOUT=createResponsive();
window.R07_A=performance.now();
document.documentElement.dataset.hostReady='true';
const status=document.querySelector('#status');
status.hidden=true;
const stage=document.querySelector('#stage'),hero=document.querySelector('#hero-copy'),detail=document.querySelector('#detail'),dialog=document.querySelector('#application');
const events=new AbortController();let disposed=false,updates=0;
const on=(target,type,fn)=>target.addEventListener(type,fn,{signal:events.signal});
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
function sync(){if(disposed)return;const s=window.R07?.motion.snapshot();if(!s)return;updates++;const p=s.progress;const scroll=s.scroll||0;const intro=ease(Math.min(1,scroll));const uiProgress=p;const layout=window.R08_LAYOUT.get(),mobile=layout.stack;const heroBottom=hero.offsetTop+hero.offsetHeight;const projectedHeroTop=mobile?innerHeight*.5-innerWidth*.14:innerHeight*.254;const offset=layout.heroOffset;const heroFloor=layout.mobile?layout.height:Math.max(innerHeight,offset+innerHeight*.79+32);const detailFloor=layout.mobile?layout.height:detail.hidden?innerHeight:Math.max(innerHeight,detail.offsetTop+detail.offsetHeight+40);stage.style.setProperty('--host-min-height',`${heroFloor+(detailFloor-heroFloor)*s.controls.master}px`);stage.style.setProperty('--scene-y',`${offset*(1-s.controls.master)}px`);stage.style.setProperty('--detail-glow',String(ease((p-.25)/.65)));stage.style.setProperty('--header-inset',`${12.7-8.9*s.controls.master}%`);stage.style.setProperty('--header-left',`${layout.x+layout.width*(layout.width<=1100?.05:(.127-.089*s.controls.master))}px`);stage.style.setProperty('--header-top',`${15+15*s.controls.master}px`);stage.style.setProperty('--nav-opacity',String(1-ease(uiProgress/.23)));document.body.toggleAttribute('data-nav-inert',uiProgress>=.23);hero.style.opacity=String(1-ease(uiProgress/.23));hero.style.transform=`translateY(${-14*ease(uiProgress/.23)}px)`;hero.inert=uiProgress>0;hero.setAttribute('aria-hidden',String(uiProgress>.23));if(uiProgress>0)delete document.body.dataset.explore;
stage.style.setProperty('--hero-edge-opacity',String(1-Math.max(intro,ease(p/.18))));
const indicator=document.getElementById('card-indicator'),id=s.selectorId||s.selected;indicator.toggleAttribute('data-visible',p>.93&&scroll<4);if(indicator.dataset.active!==id){indicator.dataset.active=id;const label=document.getElementById('detail-title').textContent;indicator.setAttribute('aria-label','Selected card: '+label);for(const dot of indicator.children)dot.toggleAttribute('data-active',dot.dataset.indicator===id);}}

const observer=new MutationObserver(sync);observer.observe(document.body,{attributes:true,attributeFilter:['data-state']});
on(window,'resize',sync);on(window,'goblin-ready',event=>{if(event.detail?.stage==='B')document.documentElement.dataset.heroRendered='true';sync();if(window.R07?.ready)R07.motion.request();});document.fonts.ready.then(sync);
// A cached document keeps its renderer/controllers; disposal is final.
on(window,'pagehide',e=>{if(e.persisted)window.R08.pause();else window.R08.dispose();});
on(window,'pageshow',e=>{if(!e.persisted)return;window.R08_LAYOUT?.update();sync();syncVisibility(true);});
on(document,'visibilitychange',()=>{if(document.hidden)window.R07_LIFECYCLE?.pause();else if(visible)window.R07_LIFECYCLE?.resume();});
on(document.querySelector('#close-dialog'),'click',()=>dialog.close());on(dialog,'keydown',e=>{if(e.key==='Escape')e.stopPropagation();});on(document,'pointerdown',()=>document.body.dataset.input='pointer');on(document,'keydown',()=>document.body.dataset.input='keyboard');
for(const b of document.querySelectorAll('[data-apply]')){const url=destination('application');if(url)b.href=url;on(b,'click',e=>{if(typeof siteConfig.onApply==='function'){e.preventDefault();siteConfig.onApply();}else if(!url){e.preventDefault();dialog.showModal();}});}
let visible=true;
document.documentElement.style.setProperty('--scroll-stages','4');
const navigation=createNavigation();
window.R08_NAV=navigation;
const mobileControls=createSelectorControls(navigation);

for(const b of document.querySelectorAll('[data-step]'))on(b,'click',()=>navigation.jumpToStage(Number(b.dataset.step),'stage-control'));
// IntersectionObserver may retain isIntersecting=true at the exact zero-area
// boundary. Resolve that endpoint with the same lifecycle, without a RAF loop.
function syncVisibility(force=false){const rect=stage.getBoundingClientRect(),next=rect.bottom>0&&rect.top<innerHeight,changed=next!==visible;visible=next;if(!window.R07?.ready||(!changed&&!force))return;if(visible&&!document.hidden)R07.motion.resume();else R07.motion.suspend();}
const visibility=new IntersectionObserver(()=>syncVisibility(true),{threshold:[0,.01]});visibility.observe(stage);
on(window,'scroll',()=>syncVisibility());on(window,'goblin-navigation-settled',()=>syncVisibility(true));on(window,'goblin-ready',()=>syncVisibility(true));
// The existing motion owns keyboard/Back, selected metadata and Detail reveal.
// Every apply writes body.dataset.state, including repeated values. Observe that
// per-frame output, not Detail CSS (which stays constant before reveal).
// Do not patch the timeline or run an idle RAF loop.
window.R08={version:'R08_11',get uiUpdates(){return updates;},sync,dispose(){if(disposed)return;disposed=true;observer.disconnect();visibility.disconnect();events.abort();mobileControls.dispose();window.R08_LAYOUT?.dispose();navigation.dispose();return window.R07_LIFECYCLE?.dispose();},pause(){window.R07_LIFECYCLE?.pause();},resume(){window.R07_LIFECYCLE?.resume();},resize(){window.R07_LIFECYCLE?.resize();}};
(async()=>{await window.GOBLIN_INTRO?.painted;if(disposed)return;return import('./scene.js');})().catch(error=>{if(error.name==='AbortError')return;document.documentElement.dataset.graphics='unavailable';window.R07_ERROR=String(error);window.dispatchEvent(new CustomEvent('goblin-error',{detail:String(error)}));status.hidden=false;status.replaceChildren(document.createTextNode('Interactive cards are unavailable. '));const retry=document.createElement('button');retry.textContent='Retry loading';retry.onclick=()=>location.reload();status.append(retry);console.error(error);});
