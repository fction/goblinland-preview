/* Static glyph alignment only; never owns scroll, navigation or hero state. */
(()=>{'use strict';if(window.GOBLIN_HEADER)return;const header=document.querySelector('.site-persistent');if(!header)return;const context=document.createElement('canvas').getContext('2d');let timer=0,disposed=false;
 function align(){timer=0;if(disposed||!CSS.supports('text-box-trim:trim-both'))return;const values=[...header.querySelectorAll('.header-label')].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();if(!r.height)return null;context.font=s.font;const m=context.measureText(e.closest('.site-nav')?'H':e.textContent);return[e,(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent-r.height)/2]});for(const[e,y]of values.filter(Boolean))e.style.setProperty('--header-optical-shift',y+'px');}
 function schedule(){clearTimeout(timer);timer=setTimeout(align,80)}
 function pause(){clearTimeout(timer);timer=0}
 const toggle=header.querySelector('#menu-toggle'),observer=new MutationObserver(()=>{if(toggle.getAttribute('aria-expanded')==='true')align()});observer.observe(toggle,{attributes:true,attributeFilter:['aria-expanded']});
 addEventListener('resize',schedule,{passive:true});addEventListener('pageshow',schedule);addEventListener('pagehide',pause);document.fonts.ready.then(align);
 window.GOBLIN_HEADER=Object.freeze({align,destroy(){disposed=true;pause();observer.disconnect();removeEventListener('resize',schedule);removeEventListener('pageshow',schedule);removeEventListener('pagehide',pause);}});
})();
