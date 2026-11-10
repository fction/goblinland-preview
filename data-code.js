/* Goblin synthetic field V3. No navigation, scroll ownership or WebGL dependency. */
(()=>{'use strict';
 if(window.GOBLIN_DATA_CODE)return;
 const vocabulary=[['CLIENT_REF','CL••9041'],['ACCESS_TAG','PRIVATE'],['PORTAL_REF','PT••7814'],['ACCOUNT_REF','AC••1704'],['ACCESS_VIEW','MASKED'],['CARD_REF','GC••2817'],['ROUTE_REF','RT••SWF9'],['NETWORK_REF','NW••C204'],['PATH_REF','PA••0418'],['REGION_REF','RG••0021'],['ISSUER_REF','IS••0842'],['LEDGER_REF','LD••4481'],['SETTLEMENT_REF','ST••3318'],['CLEARING_REF','CR••2207'],['LIMIT_PROFILE','LP••P004'],['SPEND_PROFILE','SP••A042'],['AUTH_REF','AU••9138'],['WINDOW_REF','AW••0618'],['FX_ROUTE_REF','FX••0942'],['ASSET_TAG','USD'],['ASSET_TAG','EUR']];
 // V4 presentation only: one vertical envelope per semantic region, never per UI element.
 const specs=document.body.classList.contains('info-page')?({features:[['.page-lead','FEATURES']],pricing:[['.page-lead','PRICING']],faq:[['.page-lead','FAQ']],about:[['.page-about','ABOUT','.origin-story']],contact:[['.page-lead','CONTACT']]}[document.body.dataset.page]||[]):[['#next-section','DELIVERY','.delivery-row'],['#next-section','ACCOUNT','.av4'],['#how-it-works','PROCESS']];
 const presentation={
  DELIVERY:{desktop:{before:32,after:20,peak:.62,stops:[[0,0],[.25,.65],[.48,1],[.68,.72],[1,0]]},mobile:{before:28,after:16,peak:.50,stops:[[0,0],[.22,.65],[.46,1],[.66,.65],[1,0]]}},
  ACCOUNT:{desktop:{before:16,height:640,fraction:.90,peak:.90,stops:[[0,0],[.15,.85],[.32,1],[.56,.65],[.80,.25],[1,0]]},mobile:{before:12,height:800,fraction:.45,peak:.82,stops:[[0,0],[.12,.80],[.34,1],[.62,.52],[.84,.17],[1,0]]}},
  PROCESS:{desktop:{before:0,height:580,fraction:.85,peak:.72,stops:[[0,0],[.17,1],[.35,.82],[.65,.38],[1,0]]},mobile:{before:0,height:680,fraction:.56,peak:.68,stops:[[0,0],[.16,1],[.38,.78],[.72,.28],[1,0]]}},
  PRICING:{"desktop":{"offset":32,"height":210,"peak":0.58,"stops":[[0,0],[0.25,0.8],[0.42,1],[0.67,0.5],[1,0]]},"mobile":{"offset":24,"height":240,"peak":0.52,"stops":[[0,0],[0.25,0.8],[0.42,1],[0.67,0.45],[1,0]]}},
  FAQ:{"desktop":{"offset":24,"height":150,"peak":0.48,"stops":[[0,0],[0.25,0.8],[0.4,1],[0.62,0.5],[1,0]]},"mobile":{"offset":24,"height":190,"peak":0.44,"stops":[[0,0],[0.25,0.8],[0.4,1],[0.62,0.45],[1,0]]}},
  FEATURES:{desktop:{offset:40,height:440,peak:.85,stops:[[0,0],[.28,.85],[.47,1],[.70,.56],[1,0]]},mobile:{offset:24,height:380,peak:.78,stops:[[0,0],[.25,.80],[.46,1],[.72,.45],[1,0]]}},
  CONTACT:{"desktop":{"offset":40,"height":200,"peak":0.66,"stops":[[0,0],[0.18,0.75],[0.35,1],[0.62,0.75],[0.82,0.25],[1,0]]},"mobile":{"offset":32,"height":210,"peak":0.64,"stops":[[0,0],[0.18,0.75],[0.35,1],[0.62,0.7],[0.82,0.25],[1,0]]}},
  ABOUT:{"desktop":{"before":112,"height":224,"peak":0.72,"stops":[[0,0],[0.28,0.8],[0.45,1],[0.66,0.5],[1,0]]},"mobile":{"before":92,"height":184,"peak":0.64,"stops":[[0,0],[0.28,0.8],[0.45,1],[0.66,0.4],[1,0]]}}
 };
 function envelope(f,r,w){const p=presentation[f.mode][w<600?'mobile':'desktop'],a=f.anchor?.getBoundingClientRect()||r,relative=a.top-r.top;let y=0,h=0;
  if(f.mode==='DELIVERY'){y=relative-p.before;h=a.height+p.before+p.after;}
  else if(f.mode==='ACCOUNT'||f.mode==='PROCESS'){y=relative-p.before;h=Math.min(p.height,a.height*p.fraction)+p.before;}
  else if(f.mode==='ABOUT'){y=relative-p.before;h=p.height;}
  else{y=p.offset;h=Math.min(p.height,r.height-y);}
  return{y,h,mask:'linear-gradient(to bottom,'+p.stops.map(([at,alpha])=>`rgba(0,0,0,${alpha*p.peak}) ${at*100}%`).join(',')+')'};
 }
 const fields=[],motion=matchMedia('(prefers-reduced-motion: reduce)'),trace=[];
 let timer=0,layoutTimer=0,suspended=false,destroyed=false,seed=0x6f626c69,ticks=0;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 function rowText(row,columns){let s='',i=0;while(s.length<columns+90){const[k,v]=vocabulary[((row*5+i*8+Math.floor(row/7))%21+21)%21];s+='/'+k+':'+v;i++;}return s.slice(0,columns)}
 function paint(f,slot){const{x,y,char}=slot;f.ctx.clearRect(x-0.5,y-f.font-2,f.pitch+1,16);f.ctx.fillText(char,x,y)}
 function layout(){layoutTimer=0;if(destroyed)return;for(const f of fields){const r=f.host.getBoundingClientRect(),w=document.documentElement.clientWidth,top=r.top+scrollY,{y,h,mask}=envelope(f,r,w);f.effectiveMode=f.mode;
   Object.assign(f.canvas.style,{left:-r.left+'px',top:y+'px',width:w+'px',height:h+'px',maskImage:mask,webkitMaskImage:mask});
   f.top=top+y;f.width=w;f.height=h;f.pitch=w<600?7:8;f.font=w<600?9:11;f.columns=Math.ceil((w+16)/f.pitch)+2;
   const dpr=Math.min(devicePixelRatio||1,1.5);f.canvas.width=Math.ceil(w*dpr);f.canvas.height=Math.ceil(h*dpr);f.ctx.setTransform(dpr,0,0,dpr,0,0);f.ctx.font=f.font+'px "Courier New",monospace';f.ctx.textBaseline='alphabetic';f.ctx.fillStyle='rgba(184,200,190,.14)';f.slots=[];f.mutable=[];f.unique.clear();
   const first=Math.floor((f.top+4)/16);for(let row=first,by=-4+first*16-f.top;by<h+16;by+=16,row++){const text=rowText(row,f.columns),eligible=new Set;for(const m of text.matchAll(/••[A-Z0-9]{4}/g))for(let j=2;j<6;j++)eligible.add(m.index+j);for(let col=0;col<text.length;col++){const s={x:-16+col*f.pitch,y:by,char:text[col],row,col,id:row+':'+col};f.slots.push(s);f.ctx.fillText(s.char,s.x,s.y);if(eligible.has(col)&&s.x>=0&&s.x<w)f.mutable.push(s);}}
 }sync();}
 const queueLayout=()=>{if(!layoutTimer&&!suspended&&!destroyed&&!document.hidden)layoutTimer=setTimeout(layout,80)};
 function visible(f){const top=Math.max(0,scrollY-f.top),bottom=Math.min(f.height,scrollY+innerHeight-f.top);return bottom>top?{top,bottom}:null}
 function active(){return !suspended&&!destroyed&&!document.hidden&&!motion.matches&&fields.some(f=>f.intersecting&&visible(f))}
 function stop(){if(timer){clearTimeout(timer);timer=0}}
 function sync(){if(!active())stop();else if(!timer)timer=setTimeout(update,220+random()*80)}
 function update(){timer=0;if(!active())return;const started=performance.now(),entries=[];for(const f of fields){const v=f.intersecting&&visible(f);if(!v)continue;const slots=f.slots.filter(s=>s.y>=v.top&&s.y<v.bottom&&s.x>=0&&s.x<f.width),eligible=f.mutable.filter(s=>s.y>=v.top&&s.y<v.bottom);if(!eligible.length)continue;const n=Math.max(1,Math.round(slots.length*.008)),selected=new Set,quarters=[0,0,0,0],rows=new Set,ids=[];let attempts=0;while(selected.size<n&&attempts++<n*40){const q=selected.size%4,pool=eligible;const s=pool[Math.floor(random()*pool.length)];if(Math.min(3,Math.floor(s.x/f.width*4))!==q||selected.has(s.id))continue;selected.add(s.id);const alphabet=/\d/.test(s.char)?'0123456789':'ABCDEFGHJKLMNPQRSTUVWXYZ';s.char=alphabet[(alphabet.indexOf(s.char)+1+Math.floor(random()*(alphabet.length-1)))%alphabet.length];paint(f,s);f.unique.add(s.id);quarters[q]++;rows.add(s.row);ids.push(s.id);}entries.push({name:f.name,visibleSlots:slots.length,changes:selected.size,rows:rows.size,quarters,unique:f.unique.size,ids});}ticks++;trace.push({time:performance.now(),duration:performance.now()-started,entries});if(trace.length>80)trace.shift();sync();}
 const io=new IntersectionObserver(entries=>{for(const e of entries){const f=fields.find(f=>f.canvas===e.target);if(f)f.intersecting=e.isIntersecting;}sync()});
 const ro=new ResizeObserver(queueLayout);
 for(const[selector,mode,anchorSelector]of specs){const host=document.querySelector(selector);if(!host)continue;const canvas=document.createElement('canvas');canvas.className='data-code-plane';canvas.setAttribute('aria-hidden','true');canvas.setAttribute('role','presentation');host.classList.add('data-code-host');host.prepend(canvas);const f={host,anchor:anchorSelector?host.querySelector(anchorSelector):null,canvas,ctx:canvas.getContext('2d'),mode,name:anchorSelector||selector,unique:new Set,intersecting:false};fields.push(f);io.observe(canvas);ro.observe(host);}
 function suspend(){suspended=true;stop();clearTimeout(layoutTimer);layoutTimer=0;}
 function resume(){suspended=false;layout();}
 function visibility(){if(document.hidden)stop();else{queueLayout();sync();}}
 function scroll(){sync()}
 addEventListener('resize',queueLayout,{passive:true});addEventListener('scroll',scroll,{passive:true});document.addEventListener('visibilitychange',visibility);addEventListener('pagehide',suspend);addEventListener('pageshow',resume);document.addEventListener('freeze',suspend);document.addEventListener('resume',resume);motion.addEventListener('change',sync);
 window.GOBLIN_DATA_CODE=Object.freeze({snapshot:()=>({timer:!!timer,ticks,suspended,hidden:document.hidden,reduced:motion.matches,fields:fields.map(f=>({name:f.name,mode:f.mode,effectiveMode:f.effectiveMode,top:f.top,width:f.width,height:f.height,pitch:f.pitch,rows:[...new Set(f.slots?.map(s=>s.row))],slots:f.slots?.length,visible:!!visible(f),intersecting:f.intersecting,unique:f.unique.size})),trace:trace.map(t=>({...t,entries:t.entries.map(e=>({...e,ids:[...e.ids]}))}))}),destroy(){if(destroyed)return;destroyed=true;suspend();io.disconnect();ro.disconnect();removeEventListener('resize',queueLayout);removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',visibility);removeEventListener('pagehide',suspend);removeEventListener('pageshow',resume);document.removeEventListener('freeze',suspend);document.removeEventListener('resume',resume);motion.removeEventListener('change',sync);for(const f of fields){f.canvas.remove();f.host.classList.remove('data-code-host');}}});
 layout();document.fonts.ready.then(queueLayout);
})();
