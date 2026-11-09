/* F08: FAQ-only fragment enhancement; the original accordion retains ownership. */
(()=>{
 if(document.body.dataset.page!=='faq')return;
 function revealTarget(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  if(!id)return;
  const target=document.getElementById(id),article=target?.closest('.page-question');
  if(!article)return;
  const button=article.querySelector('button[aria-controls]');
  if(!button||button.disabled)return;
  if(button.getAttribute('aria-expanded')!=='true')button.click();
  requestAnimationFrame(()=>article.scrollIntoView({block:'start',behavior:'auto'}));
 }
 window.addEventListener('hashchange',revealTarget);
 revealTarget();
})();
