import {configureLink} from './destinations.js';
// New-content boundary adapter. No changes to the frozen navigation controller.
const section=document.querySelector('#next-section'),stage=document.querySelector('#stage');
for(const link of section.querySelectorAll('[data-destination]'))configureLink(link,link.dataset.destination);
const visibility=new IntersectionObserver(entries=>{stage.inert=entries[0].intersectionRatio<=0;},{threshold:[0,.001]});visibility.observe(stage);
window.addEventListener('pagehide',()=>visibility.disconnect(),{once:true});
