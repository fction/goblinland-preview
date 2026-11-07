export function createNavigation(){
 const viewHeight=()=>window.R08_LAYOUT?.get().viewportHeight||window.innerHeight;
 const abort=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),state={currentStage:0,targetStage:0,selectedCardId:null,transitionType:'scroll',transitionProgress:1,sceneCoordinate:0,scrollPosition:0,navigationSource:'initial',running:false};
 const previousScrollRestoration=history.scrollRestoration;
 const ids=['Original','Cash','Virtual'],sections=[...document.querySelectorAll('#next-section,#how-it-works,#faq,#contact')],key='goblinSelectorStage';let landing=null;let pending=null,boundaryReentry=false,lastNativeY=scrollY;
 const on=(o,t,f,options={})=>o.addEventListener(t,f,{...options,signal:abort.signal}),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 let frame=0,segment=null,velocity=0,touch=null,idleTimer=0,ready=false,anchors=[],ends=[],gesture={time:0,direction:0,sum:0,fired:false,last:0,peak:0,tail:0},refreshFrame=0;
 function measure(){document.documentElement.style.setProperty('--scroll-step',viewHeight()+'px');const v=viewHeight(),extra=window.R08_LAYOUT?.get().readExtra||0,maximum=Math.max(0,document.documentElement.scrollHeight-v);anchors=[0,v,2*v+extra,3*v+2*extra,...sections.map(e=>Math.min(e.offsetTop,maximum))];ends=anchors.map((x,i)=>i<4?x+(i?extra:0):Math.max(x,Math.min(maximum,sections[i-4].offsetTop+sections[i-4].offsetHeight-v)));}
 function stageAt(y=scrollY){if(landing&&Math.abs(y-landing.y)<.5)return landing.stage;if(landing)landing=null;let i=0;while(i<7&&y>=anchors[i+1]-.5)i++;return i;}
 function coordinate(y){const i=stageAt(y);if(i<4){if(y<=ends[i])return i;return i+(y-ends[i])/Math.max(1,anchors[i+1]-ends[i]);}return i+(y-anchors[i])/Math.max(1,i===7?viewHeight():anchors[i+1]-anchors[i]);}
 function position(){return coordinate(scrollY);}
 function pixels(p){const i=Math.min(7,Math.floor(Math.max(0,p)));return p===i?anchors[i]:(i<4?ends[i]:anchors[i])+(p-i)*(i===7?viewHeight():anchors[i+1]-(i<4?ends[i]:anchors[i]));}
 function sync(){if(!state.running){state.currentStage=state.targetStage=stageAt();state.selectedCardId=ids[state.currentStage-1]||null;}updateCurrent();state.scrollPosition=position();const i=stageAt(),extra=window.R08_LAYOUT?.get().readExtra||0;let reading=0;if(i>0&&i<4){reading=scrollY<=ends[i]?Math.max(0,scrollY-anchors[i]):extra*(1-Math.min(1,(scrollY-ends[i])/Math.max(1,anchors[i+1]-ends[i])));}document.documentElement.style.setProperty('--detail-read-offset',reading+'px');if(!state.running)state.sceneCoordinate=position();if(window.R07?.ready)R07.motion.setScroll(Math.min(4,state.running&&state.transitionType==='scroll'?state.sceneCoordinate:position()));document.querySelectorAll('.stage-navigation [data-step]').forEach(b=>{if(Number(b.dataset.step)===state.currentStage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
 function writeY(y){window.scrollTo({top:y,behavior:'instant'});sync();}
 function write(p){writeY(pixels(p));}
 function announce(type){window.dispatchEvent(new CustomEvent(type,{detail:{...state}}));}
 function complete(){const direct=state.transitionType==='hero-direct-selection';state.running=false;state.currentStage=state.targetStage;state.transitionProgress=1;velocity=0;segment=null;frame=0;if(direct){window.scrollTo({top:anchors[state.targetStage],behavior:'instant'});R07.motion.commitDirect(state.targetStage);}state.transitionType='scroll';state.selectedCardId=ids[state.currentStage-1]||null;sync();window.R08?.sync();announce('goblin-navigation-settled');if(state.currentStage>=4&&['anchor','keyboard','history'].includes(state.navigationSource)){const el=sections[state.currentStage-4];el.tabIndex=-1;el.focus({preventScroll:true});}const next=pending;pending=null;if(next)go(...next);}
 function tick(now){frame=0;if(!segment)return;const t=clamp((now-segment.time)/segment.duration,0,1),t2=t*t,t3=t2*t,delta=segment.to-segment.from,tangent=segment.velocity*segment.duration;
  const p=segment.from+(3*t2-2*t3)*delta+(t3-2*t2+t)*tangent;
  velocity=((6*t-6*t2)*delta+(3*t2-4*t+1)*tangent)/segment.duration;state.transitionProgress=t;
  if(state.transitionType==='hero-direct-selection'){if(segment.to===0&&segment.readOffset){writeY(segment.readStart+segment.readOffset*clamp(p,0,1));}R07.motion.setDirect(state.selectedCardId,clamp(p,0,1));if(t===1){complete();return;}}else{state.sceneCoordinate=segment.phaseFrom+(segment.phaseTo-segment.phaseFrom)*(p-segment.from)/Math.max(.0001,Math.abs(segment.to-segment.from))*Math.sign(segment.to-segment.from);writeY(clamp(p,0,ends[7]));}
  if(t===1){writeY(segment.to);complete();}else frame=requestAnimationFrame(tick);
 }
 function historyState(stage,edge){const {contentAnchor,...rest}=history.state||{};return {...rest,[key]:stage,goblinContentOffset:edge==='end'?Math.max(0,ends[stage]-anchors[stage]):typeof edge==='number'?edge:0};}
 // Explicit destinations settle the existing owner synchronously; no travel segment.
 const hashes=['home','choices','stage-2','stage-3','next-section','how-it-works','faq','contact'];
 function stageFromHash(hash=location.hash){const value=hash.replace(/^#/,''),i=hashes.indexOf(value);if(i>=0)return i;const legacy=/^stage-([0-7])$/.exec(value);return legacy?Number(legacy[1]):null;}
 function updateCurrent(){const hash=hashes[state.currentStage<=3&&state.currentStage>0?1:state.currentStage];document.querySelectorAll('.site-nav a').forEach(a=>{if(a.getAttribute('href')==='#'+hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 function focusStage(stage){const el=stage===0?document.getElementById('home'):stage<4?document.getElementById('detail'):sections[stage-4];if(!el)return;el.classList.add('direct-navigation-target');el.tabIndex=-1;el.focus({preventScroll:true});}
 function jumpToStage(stage,source='direct',push=true,edge='start',focus=true){
  if(!ready)return false;stage=clamp(Math.round(stage),0,7);measure();
  clearTimeout(idleTimer);if(frame)cancelAnimationFrame(frame);if(refreshFrame)cancelAnimationFrame(refreshFrame);
  frame=refreshFrame=0;segment=null;velocity=0;pending=null;touch=null;gesture={time:0,direction:0,sum:0,fired:false,last:0,peak:0,tail:0};
  const targetY=edge==='end'?ends[stage]:typeof edge==='number'?clamp(anchors[stage]+edge,anchors[stage],ends[stage]):anchors[stage];
  landing={stage,y:targetY};Object.assign(state,{currentStage:stage,targetStage:stage,selectedCardId:ids[stage-1]||null,transitionType:'direct-navigation',transitionProgress:1,navigationSource:source,running:false});
  announce('goblin-navigation-jump');
  // setDirect clears additive velocity; commitDirect releases directRoute before setScroll.
  // seek is needed only for exact Hero restoration, including residual hover weights.
  R07.motion.setDirect('Original',0);if(stage===0)R07.motion.seek(0,'Original');R07.motion.commitDirect(Math.min(4,coordinate(targetY)));
  window.scrollTo({top:targetY,behavior:'instant'});sync();window.R08?.sync();
  const url=location.pathname+location.search+'#'+hashes[stage];
  if(push&&(history.state?.[key]!==stage||location.hash!=='#'+hashes[stage]))history.pushState(historyState(stage,Math.max(0,targetY-anchors[stage])),'',url);
  else history.replaceState(historyState(stage,Math.max(0,targetY-anchors[stage])),'',push?url:location.href);
  // Focus before arrival: focus handling must not consume the target entrance wave.
  document.getElementById('stage').inert=stage>=4;if(focus)focusStage(stage);announce('goblin-navigation-settled');return true;
 }
 function go(stage,source='api',push=true,edge='start'){
  stage=clamp(Math.round(stage),0,7);if(!ready)return;if(stage>4||position()>=4&&stage>=4){jumpToStage(stage,source,push,edge);return;}measure();const from=state.running&&state.transitionType==='scroll'?state.sceneCoordinate:position();if(state.running&&stage===state.targetStage&&!reduced.matches)return;
  if(state.running&&state.transitionType==='hero-direct-selection'&&!reduced.matches){pending=[stage,source,push,edge];return;}
  if(state.transitionType==='hero-direct-selection'&&reduced.matches){pending=null;state.targetStage=stage;complete();return;}
  const directIn=source==='card-click'&&from<.001&&!state.running&&stage>=1&&stage<=3;
  const directOut=stage===0&&!state.running&&state.currentStage>=1&&state.currentStage<=3&&Math.abs(from-state.currentStage)<.002&&['return','escape','history','home-link','stage-control'].includes(source);
  const targetY=edge==='end'?ends[stage]:typeof edge==='number'?clamp(anchors[stage]+edge,anchors[stage],ends[stage]):anchors[stage],to=coordinate(targetY);
  clearTimeout(idleTimer);if(frame)cancelAnimationFrame(frame);state.targetStage=stage;state.navigationSource=source;
  if(push&&(history.state?.[key]!==stage||history.state?.goblinContentOffset!==Math.max(0,targetY-anchors[stage])))history.pushState(historyState(stage,edge),'',location.pathname+location.search+(stage>=4?'#'+sections[stage-4].id:'#stage-'+stage));
  if(directIn||directOut){state.transitionType='hero-direct-selection';state.selectedCardId=ids[(directIn?stage:state.currentStage)-1];state.running=true;state.transitionProgress=0;segment={from:directIn?0:1,to:directIn?1:0,time:performance.now(),duration:1400,velocity:0,readStart:anchors[state.currentStage],readOffset:Math.max(0,scrollY-anchors[state.currentStage])};R07.motion.setDirect(state.selectedCardId,segment.from);announce('goblin-navigation-start');if(reduced.matches){complete();return;}frame=requestAnimationFrame(tick);return;}
  state.transitionType='scroll';
  if(reduced.matches||Math.abs(from-to)<.0005){writeY(targetY);complete();return;}
  // Selector stages retain their 1400 ms/unit Hermite trajectory. Static-page
  // travel uses the same owner/curve with a bounded, shorter arrival duration.
  const duration=(from<4&&stage<=4)?Math.max(500,Math.abs(to-from)*1400):Math.min(2400,Math.max(700,Math.abs(targetY-scrollY)/viewHeight()*900));
  state.sceneCoordinate=from;segment={from:scrollY,to:targetY,phaseFrom:from,phaseTo:to,time:performance.now(),duration,velocity:clamp(velocity,-2*viewHeight()/duration,2*viewHeight()/duration)};state.transitionProgress=0;state.running=true;announce('goblin-navigation-start');frame=requestAnimationFrame(tick);
 }
 function step(direction,source){const p=state.transitionType==='hero-direct-selection'?state.targetStage:state.running?state.sceneCoordinate:position();go(direction>0?Math.floor(p+.01)+1:Math.ceil(p-.01)-1,source,true,direction<0&&p>=5?'end':'start');}
 function inSelector(direction=0){const p=state.transitionType==='hero-direct-selection'?state.targetStage:position();return ready&&p>=-.001&&p<4-.001&&!(p<=.001&&direction<0)&&!document.querySelector('dialog[open]');}
 function control(target){return target.closest?.('input,textarea,select,[contenteditable="true"],dialog,[data-native-scroll]');}
 function wheelGesture(dy,now,legacy=false){const dir=Math.sign(dy),m=Math.abs(dy),gap=now-gesture.time;
  const newImpulse=gap>90&&gesture.tail>=3&&m>Math.max(28,gesture.last*2.6)&&!state.running;
  if(dir!==gesture.direction||gap>(legacy?260:340)||(!legacy&&newImpulse))gesture={time:now,direction:dir,sum:0,fired:false,last:m,peak:m,tail:0};
  gesture.sum+=m;gesture.tail=m<gesture.last*.92?gesture.tail+1:gesture.tail;gesture.peak=Math.max(gesture.peak,m);gesture.last=m;gesture.time=now;return gesture;
 }
 on(window,'wheel',e=>{if(!ready||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||control(e.target)||document.querySelector('dialog[open]'))return;
  const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewHeight():1),dir=Math.sign(dy);if(!dir)return;
  const i=stageAt(),reading=i>0&&i<4&&(dir>0?scrollY<ends[i]-.5:scrollY>anchors[i]+.5&&scrollY<=ends[i]+.5);
  if(reading&&!state.running){const edge=dir>0?ends[i]:anchors[i];if((dir>0&&scrollY+dy>edge)||(dir<0&&scrollY+dy<edge)){e.preventDefault();writeY(edge);}return;}
  const selector=inSelector(dir);if(!selector){landing=null;sync();return;}
  const g=wheelGesture(dy,performance.now(),true);e.preventDefault();if(g.fired||g.sum<24)return;if(state.running&&state.transitionType!=='hero-direct-selection'){const travel=Math.sign(state.targetStage-position());if(dir===travel)return;if(g.sum<48)return;}g.fired=true;step(dir,'wheel');
 },{passive:false});
 function nativeSettled(){if(state.running||touch||!ready)return;const p=position();if(p<4){const n=boundaryReentry&&p>3?3:Math.round(p);boundaryReentry=false;if(Math.abs(p-n)>.002||state.currentStage!==n)go(n,'native-settle');else{state.currentStage=state.targetStage=n;history.replaceState(historyState(n,Math.max(0,scrollY-anchors[n])),'',location.href);}}else{const previous=state.currentStage;state.currentStage=state.targetStage=stageAt();if(previous!==state.currentStage)state.transitionType='scroll';state.transitionProgress=1;history.replaceState(historyState(state.currentStage,Math.max(0,scrollY-anchors[state.currentStage])),'',location.href);announce('goblin-navigation-settled');}}
 on(window,'scroll',()=>{if(lastNativeY>=anchors[4]&&scrollY<anchors[4])boundaryReentry=true;lastNativeY=scrollY;sync();if(state.running||touch||!ready)return;clearTimeout(idleTimer);idleTimer=setTimeout(nativeSettled,position()<4?180:160);},{passive:true});
 on(window,'scrollend',()=>{if(position()>=4)nativeSettled();});
 on(window,'touchstart',e=>{if(!ready||!e.touches.length||control(e.target))return;if(state.transitionType==='hero-direct-selection'){touch={y:e.touches[0].clientY,stage:state.targetStage,p:position(),selector:true};return;}const i=stageAt(),extra=window.R08_LAYOUT?.get().readExtra||0;const reading=i>0&&i<4&&extra>0&&scrollY>=anchors[i]-.5&&scrollY<=ends[i]+.5,selector=inSelector()&&!reading;if(frame)cancelAnimationFrame(frame);frame=0;segment=null;velocity=0;state.running=false;touch={y:e.touches[0].clientY,stage:Math.round(position()),p:position(),selector,reading,startY:scrollY};clearTimeout(idleTimer);},{passive:true});
 on(window,'touchmove',e=>{if(state.transitionType==='hero-direct-selection')e.preventDefault();},{passive:false});
 on(window,'touchend',e=>{if(!touch)return;const t=touch;touch=null;const delta=t.y-(e.changedTouches[0]?.clientY??t.y);if(t.reading&&Math.abs(delta)>28){if(delta<0&&t.startY<=anchors[t.stage]+.5)go(t.stage-1,'touch');else if(delta>0&&t.startY>=ends[t.stage]-.5)go(Math.min(4,t.stage+1),'touch');else if(scrollY>ends[t.stage]||scrollY<anchors[t.stage])go(t.stage,'touch-reading',false,delta>0?'end':'start');else idleTimer=setTimeout(nativeSettled,180);}else if(t.selector&&Math.abs(delta)>28&&inSelector())go(clamp(t.stage+Math.sign(delta),0,4),'touch');else idleTimer=setTimeout(nativeSettled,180);},{passive:true});
 on(document,'keydown',e=>{if(!ready||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||control(e.target))return;
  if(e.key==='Escape'&&inSelector()){e.preventDefault();go(0,'escape');return;}
  if(e.target.closest?.('a,button,[role="button"]'))return;
  if(e.key==='Home'||e.key==='End'){e.preventDefault();jumpToStage(e.key==='Home'?0:7,'keyboard',true,e.key==='End'?'end':'start');}
  else if(e.key==='PageDown'||e.key==='PageUp'){const dir=e.key==='PageDown'?1:-1,i=stageAt(),reading=i>0&&i<4&&(dir>0?scrollY<ends[i]-.5:scrollY>anchors[i]+.5&&scrollY<=ends[i]+.5);if(reading){e.preventDefault();writeY(dir>0?ends[i]:anchors[i]);}else if(inSelector()){e.preventDefault();step(dir,'keyboard');}}
 });
 on(document,'click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest?.('a[href^="#"]');if(!a)return;const n=stageFromHash(a.getAttribute('href'));if(n===null)return;if(!ready){if(n===1){e.preventDefault();location.hash='status';const el=document.getElementById('status');el.tabIndex=-1;requestAnimationFrame(()=>{document.getElementById('stage').inert=false;el.focus();});}return;}e.preventDefault();jumpToStage(n,a.classList.contains('skip')?'skip-link':'anchor');});
 on(window,'goblin-navigate',e=>go(e.detail.stage,e.detail.source,e.detail.history!==false));
 on(window,'popstate',e=>jumpToStage(Number.isInteger(e.state?.[key])?e.state[key]:stageFromHash()??0,'history',false,e.state?.goblinContentOffset||0));
 on(window,'hashchange',()=>{const n=stageFromHash();if(n===null)return;if(ready&&(state.currentStage!==n||state.running))jumpToStage(n,'hash',false);else if(!ready){state.currentStage=state.targetStage=n;updateCurrent();}});
 function refresh(){refreshFrame=0;const oldAnchors=anchors.slice(),oldIndex=stageAt(),offset=scrollY-(oldAnchors[oldIndex]||0);measure();document.documentElement.style.setProperty('--scroll-step',viewHeight()+'px');if(!ready)return;if(state.running&&state.transitionType==='hero-direct-selection')return;if(state.running){const target=state.targetStage;if(frame)cancelAnimationFrame(frame);state.running=false;velocity=0;go(target,'resize',false);}else if(oldIndex<4)write(state.scrollPosition);else{scrollTo({top:clamp(anchors[oldIndex]+offset,anchors[oldIndex],ends[oldIndex]),behavior:'instant'});sync();}}
 on(window,'resize',()=>{if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh);});
 on(window,'goblin-layout',()=>{if(refreshFrame)cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(refresh);});
 const ro=new ResizeObserver(()=>{if(ready){measure();if(state.running&&state.targetStage>=4&&segment)segment.to=anchors[state.targetStage];}});sections.forEach(e=>ro.observe(e));
 on(reduced,'change',()=>{if(reduced.matches&&state.running)go(state.targetStage,'reduced-motion',false);});
 on(window,'goblin-ready',()=>{if(!window.R07?.ready)return;ready=true;history.scrollRestoration='manual';measure();document.documentElement.style.setProperty('--scroll-step',viewHeight()+'px');const initial=stageFromHash()??(Number.isInteger(history.state?.[key])?clamp(history.state[key],0,7):Math.round(clamp(position(),0,7)));jumpToStage(initial,'initial',false,history.state?.goblinContentOffset||0,false);});
 measure();if(!ready){state.currentStage=state.targetStage=stageFromHash()??0;updateCurrent();}return {go,jumpToStage,isReady:()=>ready,snapshot(){const s=window.R07?.snapshot();return {...state,anchors:anchors.slice(),ends:ends.slice(),cardOrder:ids.slice(),inputOwner:position()<4?'selector':'native-document',readingExtra:window.R08_LAYOUT?.get().readExtra||0,pendingStage:pending?.[0]??null,activeCard:state.transitionType==='hero-direct-selection'?state.selectedCardId:s?.handoffProof?.activeId||(s?.progress>0?'Original':null),metadata:document.querySelector('#detail-title')?.textContent,historyStage:history.state?.[key],owner:s?.owner};},dispose(){history.scrollRestoration=previousScrollRestoration;abort.abort();ro.disconnect();if(frame)cancelAnimationFrame(frame);if(refreshFrame)cancelAnimationFrame(refreshFrame);clearTimeout(idleTimer);}};
}
