// Framework-neutral, same-origin iframe boundary. Each mounted scene owns one context.
export function mount(container,options={}){
 if(!(container instanceof HTMLElement))throw new TypeError('Expected a container element');
 const frame=document.createElement('iframe');frame.title='Interactive Goblin Cards';
 frame.style.cssText='display:block;width:100%;height:100%;border:0';
 const url=new URL('./index.html',import.meta.url);if(options.mobileCorrection===false)url.searchParams.set('mobileCorrection','0');
 const listeners=new Set();let disposed=false,paused=false,resolveReady,rejectReady;
 const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});ready.catch(()=>{});
 function notify(event){options.onReadiness?.(event.detail);for(const fn of listeners)fn(event.detail);if(event.detail.stage==='C'){if(paused)frame.contentWindow.R07_LIFECYCLE?.pause();resolveReady(api);}}
 frame.addEventListener('load',()=>{if(disposed)return;const w=frame.contentWindow;w.addEventListener('goblin-ready',notify);w.addEventListener('goblin-error',e=>{options.onError?.(e.detail);rejectReady(Error(e.detail));});w.addEventListener('error',e=>options.onError?.(e.message));if(w.R07_ERROR){options.onError?.(w.R07_ERROR);rejectReady(Error(w.R07_ERROR));}else if(w.R07?.ready)notify({detail:{stage:'C',ms:w.R07.milestones.C}});else options.onReadiness?.({stage:'A',ms:w.R07_A});});
 const observer=new ResizeObserver(()=>api.resize());
 const api={element:frame,ready,onReadiness(fn){listeners.add(fn);return()=>listeners.delete(fn);},resize(){frame.contentWindow?.R07_LIFECYCLE?.resize();},pause(){paused=true;frame.contentWindow?.R07_LIFECYCLE?.pause();},resume(){paused=false;frame.contentWindow?.R07_LIFECYCLE?.resume();},get state(){return frame.contentWindow?.R07?.snapshot()||{state:disposed?'disposed':'loading'};},dispose(){if(disposed)return;disposed=true;observer.disconnect();listeners.clear();const result=frame.contentWindow?.R07_LIFECYCLE?.dispose();frame.remove();rejectReady(new DOMException('Mount disposed','AbortError'));return result;}};
 frame.src=url;container.append(frame);observer.observe(container);return api;
}
