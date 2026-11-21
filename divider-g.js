(()=>{
  const pocket=document.documentElement.hasAttribute('data-hero-backdrop-only');
  const slot=document.querySelector('.divider-g');if(!slot)return;
  const canvas=slot.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const atlas=new Image();atlas.src=pocket?'assets/section/g-halftone-pocket.png':'assets/section/g-halftone-atlas.png?v=2';
  let ready=false,visible=false,raf=0,last=0,elapsed=0,frame=-1;
  function draw(){const next=reduce.matches?0:Math.floor(elapsed/1000*30)%180;if(next===frame)return;frame=next;ctx.clearRect(0,0,112,112);ctx.drawImage(atlas,(frame%15)*112,Math.floor(frame/15)*112,112,112,0,0,112,112);}
  function tick(now){raf=0;if(!ready||!visible||document.hidden||reduce.matches)return;if(last)elapsed+=Math.min(now-last,100);last=now;draw();raf=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(ready)draw();if(ready&&visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(slot);
  atlas.onload=()=>{ready=true;slot.dataset.ready='';sync();};
  document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;last=0;});window.addEventListener('pageshow',sync);
})();
