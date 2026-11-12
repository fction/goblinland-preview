import {SELECTOR_TIMING,selectorTravelMs} from './selector-timing.js';
import {selectorPathPhase,selectorPathDistance,selectorCurve,sampleSelectorCurve,boundedSelectorCurve} from './selector-easing.js';
export function createNavigation(){
 const mobile=()=>!!window.R08_LAYOUT?.get().mobile;let mobileY=0,layoutMobile=mobile();
 const viewHeight=()=>window.R08_LAYOUT?.get().viewportHeight||window.innerHeight;
 const abort=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),state={currentStage:0,targetStage:0,selectedCardId:null,transitionType:'scroll',transitionProgress:1,sceneCoordinate:0,scrollPosition:0,navigationSource:'initial',running:false};
 const previousScrollRestoration=history.scrollRestoration;
 state.mode='normal';
 const root=document.documentElement,track=document.getElementById('scroll-track'),home=document.getElementById('hero-home'),stage=document.getElementById('stage'),exit=document.getElementById('selector-close');
 let pageY=window.scrollY,entryTop=0,returnId='Original';const background=new Map();
 function readY(){return state.mode==='selector'?(mobile()?mobileY:track.scrollTop):window.scrollY;}
 function scrollToOwner(options){if(state.mode==='selector'){if(mobile())mobileY=options.top??mobileY;else track.scrollTo(options);}else window.scrollTo(options);}
 function syncEntry(){const value=entryTop*(1-(window.R07?.motion.snapshot().controls.master||0));stage.style.transform=Math.abs(value)>.001?'translateY('+value+'px)':'';}
 function enterSelector(){if(state.mode==='selector')return;clearTimeout(idleTimer);touch=null;boundaryReentry=false;gesture={time:0,direction:0,sum:0,fired:false,last:0,peak:0,tail:0};pageY=window.scrollY;entryTop=stage.getBoundingClientRect().top;home.style.minHeight=stage.offsetHeight+'px';root.style.setProperty('--selector-page-gutter',Math.max(0,innerWidth-stage.getBoundingClientRect().width)+'px');state.mode='selector';root.dataset.selectorMode='active';exit.hidden=false;track.setAttribute('role','region');track.setAttribute('aria-label','Card selector');track.setAttribute('aria-description',mobile()?'Swipe left or right to rotate cards. Escape or Close returns to the collection.':'Scroll to rotate cards. Escape or Close returns to the collection.');track.tabIndex=0;track.scrollTop=0;mobileY=0;for(const el of document.querySelectorAll('#next-section,#how-it-works,#faq,#contact,.stage-navigation')){background.set(el,el.inert);el.inert=true;}stage.inert=false;syncEntry();window.R08_LAYOUT?.update();exit.focus({preventScroll:true});}
 function leaveSelector(restoreFocus=true){if(state.mode!=='selector')return;clearTimeout(idleTimer);touch=null;state.mode='normal';entryTop=0;stage.style.transform='';delete root.dataset.selectorMode;exit.hidden=true;track.removeAttribute('role');track.removeAttribute('aria-label');track.removeAttribute('aria-description');track.removeAttribute('tabindex');home.style.minHeight='';for(const[el,inert]of background)el.inert=inert;background.clear();window.scrollTo({top:0,behavior:'instant'});document.documentElement.style.setProperty('--detail-read-offset','0px');if(restoreFocus)window.R07?.renderer.domElement.focus({preventScroll:true});window.R08_LAYOUT?.update();}
 function saveCurrent(){if(!ready)return;const closing=state.mode==='selector'&&(state.running&&state.targetStage===0||pending?.[0]===0),mode=closing?'normal':state.mode,n=closing?0:state.running?(pending?.[0]??state.targetStage):state.currentStage;const next={[key]:n,goblinSelectorMode:mode,goblinPageY:closing?0:state.mode==='selector'?pageY:window.scrollY,goblinSelectorProgress:mode==='selector'?(state.running?(pending?.[0]??state.targetStage):position()):null,goblinContentOffset:n>=4?Math.max(0,window.scrollY-anchors[n]):0};if(Object.entries(next).every(([k,v])=>history.state?.[k]===v))return;history.replaceState({...history.state,...next},'',location.href);}
 function restore(saved,source){if(!ready)return;const selector=saved?.goblinSelectorMode==='selector',n=selector?clamp(saved[key]||1,0,3):stageFromHash()>=4?stageFromHash():saved?.goblinSelectorMode==='normal'?clamp(saved[key]||0,0,7):0;if(!selector){jumpToStage(n>=4?n:0,source,false,saved?.goblinContentOffset||0,false);if(Number.isFinite(saved?.goblinPageY))window.scrollTo({top:saved.goblinPageY,behavior:'instant'});sync();saveCurrent();return;}stop();enterSelector();pageY=Number.isFinite(saved.goblinPageY)?saved.goblinPageY:pageY;entryTop=0;stage.style.transform='';measure();const p=clamp(Number.isFinite(saved.goblinSelectorProgress)?saved.goblinSelectorProgress:n,0,3);Object.assign(state,{currentStage:Math.floor(p),targetStage:Math.floor(p),transitionType:'scroll',transitionProgress:1,navigationSource:source,running:false,sceneCoordinate:p,scrollPosition:p});R07.motion.setDirect('Original',0);R07.motion.commitDirect(p);scrollToOwner({top:pixels(p),behavior:'instant'});sync();window.R08?.sync();announce('goblin-navigation-settled');}
 function stop(){clearTimeout(idleTimer);if(frame)cancelAnimationFrame(frame);if(refreshFrame)cancelAnimationFrame(refreshFrame);frame=refreshFrame=0;segment=null;velocity=0;pending=null;touch=null;}


 const ids=['Original','Cash','Virtual'],sections=[...document.querySelectorAll('#next-section,#how-it-works,#faq,#contact')],key='goblinSelectorStage';let landing=null;let pending=null,boundaryReentry=false,lastNativeY=readY();
 const on=(o,t,f,options={})=>o.addEventListener(t,f,{...options,signal:abort.signal}),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 let frame=0,segment=null,velocity=0,touch=null,idleTimer=0,ready=false,anchors=[],ends=[],gesture={time:0,direction:0,sum:0,fired:false,last:0,peak:0,tail:0},refreshFrame=0;
 function measure(){document.documentElement.style.setProperty('--scroll-step',viewHeight()+'px');const v=viewHeight(),extra=window.R08_LAYOUT?.get().readExtra||0,maximum=Math.max(0,document.documentElement.scrollHeight-v);anchors=[0,v,2*v+extra,3*v+2*extra,...sections.map(e=>Math.min(e.offsetTop,maximum))];ends=anchors.map((x,i)=>i<4?x+(i?extra:0):Math.max(x,Math.min(maximum,sections[i-4].offsetTop+sections[i-4].offsetHeight-v)));}
 function stageAt(y=readY()){if(state.mode==='normal'){if(y<anchors[4]-.5)return 0;let i=4;while(i<7&&y>=anchors[i+1]-.5)i++;return i;}if(landing&&Math.abs(y-landing.y)<.5)return landing.stage;if(landing)landing=null;let i=0;while(i<3&&y>=anchors[i+1]-.5)i++;return i;}
 function coordinate(y){const i=stageAt(y);if(state.mode==='normal'&&i===0)return 0;if(i<4){if(y<=ends[i])return i;return i+(y-ends[i])/Math.max(1,anchors[i+1]-ends[i]);}return i+(y-anchors[i])/Math.max(1,i===7?viewHeight():anchors[i+1]-anchors[i]);}
 function position(){return coordinate(readY());}
 function pixels(p){const i=Math.min(7,Math.floor(Math.max(0,p)));return p===i?anchors[i]:(i<4?ends[i]:anchors[i])+(p-i)*(i===7?viewHeight():anchors[i+1]-(i<4?ends[i]:anchors[i]));}
 function sync(){if(!state.running){state.currentStage=state.targetStage=stageAt();state.selectedCardId=ids[state.currentStage-1]||null;}updateCurrent();state.scrollPosition=position();const i=stageAt(),extra=window.R08_LAYOUT?.get().readExtra||0;let reading=0;if(i>0&&i<4){reading=readY()<=ends[i]?Math.max(0,readY()-anchors[i]):extra*(1-Math.min(1,(readY()-ends[i])/Math.max(1,anchors[i+1]-ends[i])));}document.documentElement.style.setProperty('--detail-read-offset',reading+'px');if(!state.running)state.sceneCoordinate=position();if(window.R07?.ready)R07.motion.setScroll(state.mode==='normal'?0:Math.min(3,state.running&&state.transitionType==='scroll'?state.sceneCoordinate:position()));syncEntry();document.querySelectorAll('.stage-navigation [data-step]').forEach(b=>{if(Number(b.dataset.step)===state.currentStage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
 function writeY(y){scrollToOwner({top:y,behavior:'instant'});sync();}
 function write(p){writeY(pixels(p));}
 function announce(type){window.dispatchEvent(new CustomEvent(type,{detail:{...state}}));}
 function complete(){const direct=state.transitionType==='hero-direct-selection';state.running=false;state.currentStage=state.targetStage;state.transitionProgress=1;velocity=0;segment=null;frame=0;if(direct){scrollToOwner({top:anchors[state.targetStage],behavior:'instant'});R07.motion.commitDirect(state.targetStage);}if(state.currentStage===0&&state.mode==='selector')leaveSelector();else if(direct){entryTop=0;syncEntry();}state.transitionType='scroll';state.selectedCardId=ids[state.currentStage-1]||null;sync();saveCurrent();window.R08?.sync();announce('goblin-navigation-settled');if(state.currentStage>=4&&['anchor','keyboard','history'].includes(state.navigationSource)){const el=sections[state.currentStage-4];el.tabIndex=-1;el.focus({preventScroll:true});}const next=pending;pending=null;if(next)go(...next);}
 function tick(now){frame=0;if(!segment)return;const t=clamp((now-segment.time)/segment.duration,0,1),t2=t*t,t3=t2*t,delta=segment.to-segment.from,tangent=segment.velocity*segment.duration;
  const sample=segment.curve?sampleSelectorCurve(segment.curve,t):null;
  const p=sample?(segment.direct?selectorPathPhase(sample.value):segment.from+delta*sample.value):segment.from+(3*t2-2*t3)*delta+(t3-2*t2+t)*tangent;
  segment.sample=sample;velocity=sample?sample.velocity*(segment.direct?1:delta):((6*t-6*t2)*delta+(3*t2-4*t+1)*tangent)/segment.duration;state.transitionProgress=t;
  if(state.transitionType==='hero-direct-selection'){if(segment.to===0&&segment.readOffset){writeY(segment.readStart+segment.readOffset*clamp(p,0,1));}R07.motion.setDirect(state.selectedCardId,clamp(p,0,1));syncEntry();if(t===1){complete();return;}}else{state.sceneCoordinate=segment.phaseFrom+(segment.phaseTo-segment.phaseFrom)*(p-segment.from)/Math.max(.0001,Math.abs(segment.to-segment.from))*Math.sign(segment.to-segment.from);writeY(clamp(p,0,ends[7]));}
  if(t===1){writeY(segment.to);complete();}else frame=requestAnimationFrame(tick);
 }
 function historyState(stage,edge){const {contentAnchor,...rest}=history.state||{};return {...rest,[key]:stage,goblinSelectorMode:stage>0&&stage<4?'selector':'normal',goblinPageY:stage===0?0:state.mode==='selector'?pageY:window.scrollY,goblinSelectorProgress:stage>0&&stage<4?stage:null,goblinContentOffset:edge==='end'?Math.max(0,ends[stage]-anchors[stage]):typeof edge==='number'?edge:0};}
 // Explicit destinations settle the existing owner synchronously; no travel segment.
 const hashes=['home','choices','stage-2','stage-3',...sections.map(section=>section.id)];
 function stageFromHash(hash=location.hash){const value=hash.replace(/^#/,''),i=hashes.indexOf(value);if(i>=0)return i;const legacy=/^stage-([0-7])$/.exec(value);return legacy?Number(legacy[1]):null;}
 function updateCurrent(){const hash=hashes[state.currentStage<=3&&state.currentStage>0?1:state.currentStage];document.querySelectorAll('.site-nav a').forEach(a=>{if(a.getAttribute('href')==='#'+hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 function focusStage(stage){const el=stage===0?document.getElementById('home'):stage<4?document.getElementById('detail'):sections[stage-4];if(!el)return;el.classList.add('direct-navigation-target');el.tabIndex=-1;el.focus({preventScroll:true});}
 function jumpToStage(stage,source='direct',push=true,edge='start',focus=true){
  if(!ready)return false;stage=clamp(Math.round(stage),0,7);
  if(stage>0&&stage<4&&state.mode==='normal'){if(source==='stage-control'){go(stage,'card-click',push);return true;}document.querySelector('[data-card="Virtual"]').focus();return false;}
  if((stage===0||stage>=4)&&state.mode==='selector'){stop();R07.motion.setDirect('Original',0);R07.motion.seek(0,'Original');R07.motion.commitDirect(0);leaveSelector(false);}measure();
  clearTimeout(idleTimer);if(frame)cancelAnimationFrame(frame);if(refreshFrame)cancelAnimationFrame(refreshFrame);
  frame=refreshFrame=0;segment=null;velocity=0;pending=null;touch=null;gesture={time:0,direction:0,sum:0,fired:false,last:0,peak:0,tail:0};
  const targetY=edge==='end'?ends[stage]:typeof edge==='number'?clamp(anchors[stage]+edge,anchors[stage],ends[stage]):anchors[stage];
  landing={stage,y:targetY};Object.assign(state,{currentStage:stage,targetStage:stage,selectedCardId:ids[stage-1]||null,transitionType:'direct-navigation',transitionProgress:1,navigationSource:source,running:false});
  announce('goblin-navigation-jump');
  // setDirect clears additive velocity; commitDirect releases directRoute before setScroll.
  // seek is needed only for exact Hero restoration, including residual hover weights.
  R07.motion.setDirect('Original',0);if(stage===0)R07.motion.seek(0,'Original');R07.motion.commitDirect(Math.min(4,coordinate(targetY)));
  scrollToOwner({top:targetY,behavior:'instant'});sync();window.R08?.sync();
  const url=location.pathname+location.search+'#'+hashes[stage];
  if(push&&(history.state?.[key]!==stage||location.hash!=='#'+hashes[stage]))history.pushState(historyState(stage,Math.max(0,targetY-anchors[stage])),'',url);
  else history.replaceState(historyState(stage,Math.max(0,targetY-anchors[stage])),'',push?url:location.href);
  // Focus before arrival: focus handling must not consume the target entrance wave.
  document.getElementById('stage').inert=stage>=4;if(focus)focusStage(stage);announce('goblin-navigation-settled');return true;
 }
 function go(stage,source='api',push=true,edge='start'){
  stage=clamp(Math.round(stage),0,7);if(!ready)return;
  if(mobile())window.R07?.motion.resetFlip?.();
  if(stage>0&&stage<4&&source==='card-click'){if(state.mode==='selector'&&state.running)return;returnId=ids[stage-1];enterSelector();}
  if(stage>0&&stage<4&&state.mode!=='selector')return;
  if(state.mode==='selector'&&(state.running&&state.targetStage===0||pending?.[0]===0)&&stage>0&&stage<4)return;
  if(stage===0&&state.mode==='normal'){jumpToStage(0,source,push);return;}
  if(stage>=4){jumpToStage(stage,source,push,edge);return;}
  // One bounded latest-target slot. Closing has priority.
  if(state.running&&!reduced.matches){
   if(state.targetStage===0||pending?.[0]===0)return;
   if(stage===0&&state.transitionType==='hero-direct-selection'){
    const p=R07.motion.snapshot().progress,current=segment.sample||{value:selectorPathDistance(p),velocity:0,acceleration:0},duration=Math.max(240,SELECTOR_TIMING.close*Math.sqrt(current.value));
    const curve=selectorCurve(current.value,0,duration,current.velocity,current.acceleration);
    // At the very end of entry, finish at rest rather than clamp an overshoot.
    if(!boundedSelectorCurve(curve)){pending=[0,source,push,edge];window.dispatchEvent(new CustomEvent('goblin-navigation-queued',{detail:{...state,requestedStage:0,pendingStage:0,source}}));saveCurrent();return;}
    if(frame)cancelAnimationFrame(frame);pending=null;
    state.targetStage=0;state.navigationSource=source;state.transitionProgress=0;
    segment={from:p,to:0,time:performance.now(),duration,velocity:0,direct:true,curve,readStart:0,readOffset:0};
    announce('goblin-navigation-start');saveCurrent();frame=requestAnimationFrame(tick);return;
   }
   pending=stage===state.targetStage?null:[stage,source,push,edge];
   window.dispatchEvent(new CustomEvent('goblin-navigation-queued',{detail:{...state,requestedStage:stage,pendingStage:pending?.[0]??null,source}}));saveCurrent();return;
  }
  measure();const from=state.running&&state.transitionType==='scroll'?state.sceneCoordinate:position();if(state.running&&stage===state.targetStage&&!reduced.matches)return;
  if(state.running&&state.transitionType==='hero-direct-selection'&&!reduced.matches){pending=[stage,source,push,edge];return;}
  if(state.transitionType==='hero-direct-selection'&&reduced.matches){pending=null;state.targetStage=stage;complete();return;}
  const directIn=source==='card-click'&&from<.001&&!state.running&&stage>=1&&stage<=3;
  const directOut=stage===0&&!state.running&&state.currentStage>=1&&state.currentStage<=3&&Math.abs(from-state.currentStage)<.002&&['return','escape','history','home-link','stage-control'].includes(source);
  const targetY=edge==='end'?ends[stage]:typeof edge==='number'?clamp(anchors[stage]+edge,anchors[stage],ends[stage]):anchors[stage],to=coordinate(targetY);
  clearTimeout(idleTimer);if(frame)cancelAnimationFrame(frame);state.targetStage=stage;state.navigationSource=source;
  if(push&&(history.state?.[key]!==stage||history.state?.goblinContentOffset!==Math.max(0,targetY-anchors[stage])))history.pushState(historyState(stage,edge),'',location.pathname+location.search+(stage>=4?'#'+sections[stage-4].id:stage===0?'#home':'#stage-'+stage));
  if(directIn||directOut){state.transitionType='hero-direct-selection';state.selectedCardId=ids[(directIn?stage:state.currentStage)-1];state.running=true;state.transitionProgress=0;segment={from:directIn?0:1,to:directIn?1:0,time:performance.now(),duration:directIn?SELECTOR_TIMING.entry:SELECTOR_TIMING.close,velocity:0,readStart:anchors[state.currentStage],readOffset:Math.max(0,readY()-anchors[state.currentStage])};segment.direct=true;segment.curve=selectorCurve(directIn?0:1,directIn?1:0,segment.duration);R07.motion.setDirect(state.selectedCardId,segment.from);announce('goblin-navigation-start');if(reduced.matches){complete();return;}frame=requestAnimationFrame(tick);return;}
  state.transitionType='scroll';
  if(reduced.matches||Math.abs(from-to)<.0005){writeY(targetY);complete();return;}
  // Selector clocks are independent; static-page travel retains its clock.
  const duration=(from<4&&stage<=4)?selectorTravelMs(to-from):Math.min(2400,Math.max(700,Math.abs(targetY-readY())/viewHeight()*900));
  state.sceneCoordinate=from;segment={from:readY(),to:targetY,phaseFrom:from,phaseTo:to,time:performance.now(),duration,velocity:clamp(velocity,-2*viewHeight()/duration,2*viewHeight()/duration)};if(from<4&&stage<=4)segment.curve=selectorCurve(0,1,duration);state.transitionProgress=0;state.running=true;announce('goblin-navigation-start');frame=requestAnimationFrame(tick);
 }
 function step(direction,source){const p=pending?.[0]??(state.running?state.targetStage:position());go(clamp(direction>0?Math.floor(p+.01)+1:Math.ceil(p-.01)-1,0,3),source,true,direction<0&&p>=5?'end':'start');}
 function inSelector(direction=0){const p=state.transitionType==='hero-direct-selection'?state.targetStage:position();return state.mode==='selector'&&ready&&p>=-.001&&p<4-.001&&!(p<=.001&&direction<0)&&!document.querySelector('dialog[open]');}
 function control(target){return target.closest?.('input,textarea,select,[contenteditable="true"],dialog,[data-native-scroll]');}
 function wheelGesture(dy,now,legacy=false){const dir=Math.sign(dy),m=Math.abs(dy),gap=now-gesture.time;
  const newImpulse=gap>90&&gesture.tail>=3&&m>Math.max(28,gesture.last*2.6)&&!state.running;
  if(dir!==gesture.direction||gap>(legacy?260:340)||(!legacy&&newImpulse))gesture={time:now,direction:dir,sum:0,fired:false,last:m,peak:m,tail:0};
  gesture.sum+=m;gesture.tail=m<gesture.last*.92?gesture.tail+1:gesture.tail;gesture.peak=Math.max(gesture.peak,m);gesture.last=m;gesture.time=now;return gesture;
 }
 on(track,'wheel',e=>{if(mobile())return;if(state.mode!=='selector'||!ready||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||control(e.target)||document.querySelector('dialog[open]'))return;
  const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewHeight():1),dir=Math.sign(dy);if(!dir)return;
  const i=stageAt(),reading=i>0&&i<4&&(dir>0?readY()<ends[i]-.5:readY()>anchors[i]+.5&&readY()<=ends[i]+.5);
  if(reading&&!state.running){const edge=dir>0?ends[i]:anchors[i];if((dir>0&&readY()+dy>edge)||(dir<0&&readY()+dy<edge)){e.preventDefault();writeY(edge);}return;}
  const selector=inSelector(dir);if(!selector){landing=null;sync();return;}
  if(state.running&&state.targetStage===0){e.preventDefault();return;}const g=wheelGesture(dy,performance.now(),true);e.preventDefault();if(g.fired||g.sum<24)return;if(state.running&&state.transitionType!=='hero-direct-selection'){const travel=Math.sign(state.targetStage-position());if(dir!==travel&&g.sum<48)return;}g.fired=true;step(dir,'wheel');
 },{passive:false});
 function nativeSettled(){if(state.mode==='normal'){sync();saveCurrent();announce('goblin-navigation-settled');return;}if(state.running||touch||!ready)return;const p=position();if(p<4){const n=boundaryReentry&&p>3?3:Math.round(p);boundaryReentry=false;if(Math.abs(p-n)>.002||state.currentStage!==n)go(n,'native-settle');else{state.currentStage=state.targetStage=n;saveCurrent();}}else{const previous=state.currentStage;state.currentStage=state.targetStage=stageAt();if(previous!==state.currentStage)state.transitionType='scroll';state.transitionProgress=1;history.replaceState(historyState(state.currentStage,Math.max(0,readY()-anchors[state.currentStage])),'',location.href);announce('goblin-navigation-settled');}}
 function handleScroll(){if(lastNativeY>=anchors[4]&&readY()<anchors[4])boundaryReentry=true;lastNativeY=readY();sync();if(state.running||touch||!ready)return;clearTimeout(idleTimer);idleTimer=setTimeout(nativeSettled,position()<4?180:160);}
 on(window,'scroll',()=>{if(state.mode==='normal')handleScroll()},{passive:true});
 on(track,'scroll',()=>{if(mobile()||layoutMobile||document.documentElement.clientWidth<=1024||innerWidth!==window.R08_LAYOUT.get().viewportWidth)return;if(state.mode==='selector')handleScroll()},{passive:true});
 on(window,'scrollend',()=>{if(state.mode==='normal')nativeSettled();});on(track,'scrollend',()=>{if(state.mode==='selector'&&!state.running)saveCurrent();});
 on(track,'touchstart',e=>{if(mobile()){touch=null;return;}if(e.touches.length!==1){touch=null;return;}if(state.mode!=='selector'||!ready||!e.touches.length||control(e.target))return;if(state.transitionType==='hero-direct-selection'){touch={x:e.touches[0].clientX,y:e.touches[0].clientY,stage:state.targetStage,p:position(),selector:true};return;}const i=stageAt(),extra=window.R08_LAYOUT?.get().readExtra||0;const reading=i>0&&i<4&&extra>0&&readY()>=anchors[i]-.5&&readY()<=ends[i]+.5,selector=inSelector()&&!reading;if(frame)cancelAnimationFrame(frame);frame=0;segment=null;velocity=0;state.running=false;touch={x:e.touches[0].clientX,y:e.touches[0].clientY,stage:Math.round(position()),p:position(),selector,reading,startY:readY()};clearTimeout(idleTimer);},{passive:true});
 on(track,'touchmove',e=>{if(mobile()){touch=null;return;}if(state.mode==='selector'&&e.touches.length===1&&touch&&state.transitionType==='hero-direct-selection'&&Math.abs(e.touches[0].clientY-touch.y)>Math.abs(e.touches[0].clientX-touch.x))e.preventDefault();},{passive:false});
 on(track,'touchend',e=>{if(mobile()){touch=null;return;}if(!touch)return;const t=touch;touch=null;const delta=t.y-(e.changedTouches[0]?.clientY??t.y);if(t.reading&&Math.abs(delta)>28){if(delta<0&&t.startY<=anchors[t.stage]+.5)go(t.stage-1,'touch');else if(delta>0&&t.startY>=ends[t.stage]-.5)go(Math.min(3,t.stage+1),'touch');else if(readY()>ends[t.stage]||readY()<anchors[t.stage])go(t.stage,'touch-reading',false,delta>0?'end':'start');else idleTimer=setTimeout(nativeSettled,180);}else if(t.selector&&Math.abs(delta)>28&&inSelector())go(clamp(t.stage+Math.sign(delta),0,3),'touch');else idleTimer=setTimeout(nativeSettled,180);},{passive:true});
 on(document,'keydown',e=>{if(state.mode!=='selector'||!ready||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||control(e.target))return;
  if(e.key==='Escape'&&inSelector()){e.preventDefault();go(0,'escape');return;}
  if(mobile()&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();go(clamp((pending?.[0]??(state.running?state.targetStage:state.currentStage))+(e.key==='ArrowRight'?1:-1),1,3),'carousel-keyboard');return;}
  if(e.target.closest?.('a,button,[role="button"]'))return;
  if(mobile())return;
  if(e.key==='Home'||e.key==='End'){e.preventDefault();if(e.key==='Home')go(0,'return');else go(3,'keyboard',true,'end');}
  else if(e.key==='PageDown'||e.key==='PageUp'||e.key===' '){const dir=e.key==='PageUp'||e.shiftKey?-1:1,i=stageAt(),reading=i>0&&i<4&&(dir>0?readY()<ends[i]-.5:readY()>anchors[i]+.5&&readY()<=ends[i]+.5);if(reading){e.preventDefault();writeY(dir>0?ends[i]:anchors[i]);}else if(inSelector()){e.preventDefault();step(dir,'keyboard');}}
 });
 on(document,'click',e=>{saveCurrent();if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest?.('a[href]');if(!a)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search)return;const n=url.hash?stageFromHash(url.hash):a.classList.contains('brand')?0:null;if(n===null)return;if(!ready){if(n===1){e.preventDefault();location.hash='status';const el=document.getElementById('status');el.tabIndex=-1;requestAnimationFrame(()=>{document.getElementById('stage').inert=false;el.focus();});}return;}e.preventDefault();jumpToStage(n,a.classList.contains('skip')?'skip-link':'anchor');});
 on(window,'goblin-navigate',e=>go(e.detail.stage,e.detail.source,e.detail.history!==false));
 on(window,'popstate',e=>restore(e.state,'history'));on(window,'pageshow',e=>{if(e.persisted)restore(history.state,'pageshow')});
 on(window,'hashchange',()=>{const n=stageFromHash();if(n===null||n>0&&n<4)return;if(ready)jumpToStage(n,'hash',false);});
 function resumeAfterResize(target){const next=pending;pending=null;go(target,'resize',false);if(next){if(state.running){pending=next;window.dispatchEvent(new CustomEvent('goblin-navigation-queued',{detail:{...state,requestedStage:next[0],pendingStage:next[0],source:'resize-queue'}}));}else go(...next);}}
 function refresh(){refreshFrame=0;const wasMobile=layoutMobile;layoutMobile=mobile();if(state.mode==='selector'&&wasMobile!==layoutMobile){const p=state.scrollPosition,target=state.targetStage,running=state.running;measure();if(running&&state.transitionType==='hero-direct-selection')return;if(running&&segment?.curve){segment.from=pixels(segment.phaseFrom);segment.to=pixels(segment.phaseTo);write(state.sceneCoordinate);return;}if(frame)cancelAnimationFrame(frame);frame=0;segment=null;state.running=false;write(p);if(running)resumeAfterResize(target);return;}const oldAnchors=anchors.slice(),oldIndex=stageAt(),offset=readY()-(oldAnchors[oldIndex]||0);measure();document.documentElement.style.setProperty('--scroll-step',viewHeight()+'px');if(!ready)return;if(state.mode==='normal'){sync();return;}if(state.running&&state.transitionType==='hero-direct-selection')return;if(state.running){if(segment?.curve){segment.from=pixels(segment.phaseFrom);segment.to=pixels(segment.phaseTo);write(state.sceneCoordinate);return;}const target=state.targetStage;if(frame)cancelAnimationFrame(frame);state.running=false;velocity=0;write(state.sceneCoordinate);resumeAfterResize(target);}else if(oldIndex<4)write(state.scrollPosition);else{scrollToOwner({top:clamp(anchors[oldIndex]+offset,anchors[oldIndex],ends[oldIndex]),behavior:'instant'});sync();}}
 on(window,'resize',()=>{clearTimeout(idleTimer);if(mobile()||document.documentElement.clientWidth<=1024||innerWidth!==window.R08_LAYOUT.get().viewportWidth)return;if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh);});
 on(window,'goblin-layout',()=>{if(refreshFrame)cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(refresh);});
 const ro=new ResizeObserver(()=>{if(ready){measure();if(state.running&&state.targetStage>=4&&segment)segment.to=anchors[state.targetStage];}});sections.forEach(e=>ro.observe(e));
 on(reduced,'change',()=>{if(reduced.matches&&state.running){const target=pending?.[0]??state.targetStage;pending=null;go(target,'reduced-motion',false);}});
 on(window,'goblin-ready',()=>{if(!window.R07?.ready||ready)return;ready=true;history.scrollRestoration='manual';measure();restore(history.state,'initial');});
 on(exit,'click',()=>go(0,'return'));
 measure();if(!ready){state.currentStage=state.targetStage=stageFromHash()??0;updateCurrent();}return {go,jumpToStage,isReady:()=>ready,snapshot(){const s=window.R07?.snapshot();return {...state,anchors:anchors.slice(),ends:ends.slice(),cardOrder:ids.slice(),inputOwner:state.mode==='selector'?'selector-region':'native-document',phase:!ready?'intro':state.mode==='normal'?(position()>=4?'normal-page-browsing':'default-collection'):state.running&&state.targetStage===0?'closing-selector':state.running&&state.transitionType==='hero-direct-selection'?'opening-selector':state.running||s?.progress===0?'selector-active':'card-detail',nativePageY:window.scrollY,mobileCarousel:mobile(),selectorY:readY(),selectorProgress:state.mode==='selector'?position():0,readingExtra:window.R08_LAYOUT?.get().readExtra||0,pendingStage:pending?.[0]??null,activeCard:state.transitionType==='hero-direct-selection'?state.selectedCardId:s?.handoffProof?.activeId||(s?.progress>0?'Original':null),metadata:document.querySelector('#detail-title')?.textContent,historyStage:history.state?.[key],owner:s?.owner};},dispose(){if(state.mode==='selector')leaveSelector(false);history.scrollRestoration=previousScrollRestoration;abort.abort();ro.disconnect();if(frame)cancelAnimationFrame(frame);if(refreshFrame)cancelAnimationFrame(refreshFrame);clearTimeout(idleTimer);}};
}
