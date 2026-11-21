import { createHalftoneRenderer } from './halftone-volume.js';
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const frame = document.createElement('canvas');
const surface = frame.getContext('2d');

const meshResponse=await fetch('assets/section/g-halftone-mesh.json');
const mesh=await meshResponse.json();
const renderLogo=createHalftoneRenderer(mesh);
const atlas=new Image();
atlas.src='assets/section/g-halftone-atlas.png';
await atlas.decode();
let mode='macro', renderMacro, macroError=false;
try { renderMacro=(await import('./logo-macro.js')).createMacro(await (await fetch('assets/section/g-macro-mesh.json')).json()); }
catch(error){ console.warn('Macro renderer unavailable',error); macroError=true;mode='small'; }
let smallStart=performance.now(), spinning=true;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const pose = {};

const specs = [
  ['size','Размер',10,300,100,'%'],
  ['x','Сдвиг X',-50,50,0,'%'],
  ['y','Сдвиг Y',-50,50,0,'%'],
  ['yaw','Поворот',-180,180,0,'°'],
  ['pitch','Наклон',-180,180,0,'°'],
  ['roll','Крен',-180,180,0,'°'], 
  ['dot','Размер точек',10,100,100,'%'], ['density','Плотность',25,200,100,'%']
];
function setPose(key, value) {
  const [, ,min,max] = specs.find(row=>row[0]===key);
  pose[key]=Math.max(min,Math.min(max,Math.round(value)));
  if(mode==='small' && key==='yaw') spinning=false;
  notify(); schedule();
}
let glass=true, moving=false, pending=false;
function notify() { window.dispatchEvent(new Event('logo-study-change')); }
function resetPose() { for(const [key,,,,start] of specs) setPose(key,start); spinning=true;smallStart=performance.now(); }
for(const [key,,,,start] of specs) pose[key]=start;
const saved={};
window.goblinLogoStudy={specs,pose,setPose,resetPose,get mode(){return mode},macroError,
  setMode(next){
    if(next===mode || (next==='macro' && macroError)) return;
    saved[mode]={...pose};mode=next;
    for(const [key,,,,start] of specs) pose[key]=saved[next]?.[key]??start;
    smallStart=performance.now();spinning=pose.yaw===0;notify();schedule();
  },
  get glass(){return glass}, get moving(){return moving},
  toggleGlass(){glass=!glass;notify();schedule()}, toggleMove(){moving=!moving;notify()}
};
window.dispatchEvent(new Event('logo-study-ready'));

function schedule() {
  if (!pending) { pending = true; requestAnimationFrame(draw); }
}
function draw() {
  pending = false;
  const w = canvas.width, h = canvas.height;
  if(mode==='macro'){
    ctx.drawImage(renderMacro(w,h,pose,glass),0,0);return;
  }
  const step = Math.min(w*.78/68,h*.58/57);
  surface.fillStyle='#080b0a';
  surface.fillRect(0,0,w,h);
  const size=112*w/canvas.clientWidth*pose.size/100;
  const yaw=pose.yaw+(spinning&&!reduced.matches?(performance.now()-smallStart)*.06:0);
  const left=w*(.5+pose.x/100)-size/2,topY=h*(.5+pose.y/100)-size/2;
  if(!pose.pitch&&!pose.roll&&pose.dot===100&&pose.density===100){
    const i=((Math.round(yaw/2)%180)+180)%180;
    surface.imageSmoothingEnabled=false;
    surface.drawImage(atlas,(i%15)*112,Math.floor(i/15)*112,112,112,left,topY,size,size);
  }else{
    const sprite=renderLogo(yaw,pose.pitch,pose.roll,pose.density,pose.dot,size*canvas.clientWidth/w);
    surface.drawImage(sprite,left,topY,size,size);
  }
  if(spinning&&!reduced.matches) schedule();
  ctx.drawImage(frame,0,0);
  if (!glass) return;
  // Sample the current pose along the glass lip. No second scene or render loop.
  const top=Math.round(h*.54), lip=Math.max(3,Math.round(step*1.8));
  for(let i=0;i<lip;i++) {
    const bend=Math.pow(1-i/lip,2);
    const shift=Math.round(step*1.7*bend);
    ctx.drawImage(frame,0,top+i+shift,w,1,shift,top+i,w,1);
  }
  ctx.fillStyle='rgba(78,100,88,.15)';ctx.fillRect(0,top,w,h-top);
  const reflection=ctx.createLinearGradient(0,0,w,0);
  reflection.addColorStop(0,'#28332d');reflection.addColorStop(.58,'#95aaa0');reflection.addColorStop(1,'#27332c');
  ctx.fillStyle=reflection;ctx.fillRect(0,top,w,Math.max(1,step*.12));
}
new ResizeObserver(() => {
  const dpr=Math.min(2,devicePixelRatio);
  frame.width=canvas.width=Math.round(canvas.clientWidth*dpr);
  frame.height=canvas.height=Math.round(canvas.clientHeight*dpr);
  schedule();
}).observe(canvas);
let drag;
canvas.onpointerdown=e=>{
  if(drag || e.button!==0) return;
  canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,originX:e.clientX,originY:e.clientY,startX:pose.x,startY:pose.y,yaw:pose.yaw,pitch:pose.pitch};
};
canvas.onpointermove=e=>{
  if(drag?.id!==e.pointerId) return;
  
  if(moving || e.shiftKey) {
    setPose('x',drag.startX+(e.clientX-drag.originX)*100/canvas.clientWidth);
    setPose('y',drag.startY+(e.clientY-drag.originY)*100/canvas.clientHeight);
  } else {
    setPose('yaw',((drag.yaw+(e.clientX-drag.originX)*.65+540)%360)-180);
    setPose('pitch',drag.pitch-(e.clientY-drag.originY)*.45);
  }

};
canvas.onlostpointercapture=()=>{drag=null};
canvas.onkeydown=e=>{
  if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home'].includes(e.key)) return;
  e.preventDefault();
  if(e.key==='Home') resetPose();
  if(e.key==='ArrowRight') setPose('yaw',pose.yaw+2);
  if(e.key==='ArrowLeft') setPose('yaw',pose.yaw-2);
  if(e.key==='ArrowUp') setPose('pitch',pose.pitch+2);
  if(e.key==='ArrowDown') setPose('pitch',pose.pitch-2);
  schedule();
};
canvas.addEventListener('wheel',e=>{e.preventDefault();setPose('size',pose.size+(e.deltaY<0?5:-5))},{passive:false});
