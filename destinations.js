import {siteConfig,accountDestinations,sectionDestinations} from './config.js';
// Authoritative duplicates: account.dashboard, section.order, section.simplex,
// section.telegramSupport. Legacy values are fallback only when canonical is null.
export function safeURL(value){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;return url.href;}catch{return null;}
}
export function destination(key){
 const values={application:sectionDestinations.order??siteConfig.applicationUrl,lockerOrder:accountDestinations.lockerOrder,
 dashboard:accountDestinations.dashboard??sectionDestinations.dashboard,
 order:sectionDestinations.order??siteConfig.applicationUrl,
 telegramInvite:sectionDestinations.telegramSupport??accountDestinations.telegramInvite,
 telegramSupport:sectionDestinations.telegramSupport??accountDestinations.telegramInvite,
 simplexInvite:sectionDestinations.simplex??accountDestinations.simplexInvite,
 simplex:sectionDestinations.simplex??accountDestinations.simplexInvite};
 return safeURL(Object.hasOwn(values,key)?values[key]:sectionDestinations[key]);
}
export function configureLink(link,key){const url=destination(key);if(url){link.href=url;for(const name of ['aria-disabled','aria-describedby','role','tabindex'])link.removeAttribute(name);}else{link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.title='Destination pending owner approval';}link.addEventListener('click',e=>{if(link.getAttribute('aria-disabled')==='true')e.preventDefault();});}
