// Condensed facts from the current Features comparison table; one product record.
export const selectorProducts=Object.freeze({
 physical:{name:'Goblin Physical',facts:[['Network','Mastercard'],['Balance','MXN'],['Payments','Chip + contactless'],['Cash','$500 USD/day']]},
 virtual:{name:'Goblin Virtual',facts:[['Network','Visa'],['Balance','USD'],['Payments','Apple Pay + Google Pay'],['Cash','Not currently available']]}
});
// Owner-requested temporary mapping; card geometry/identity stays unchanged.
export const selectorProductForCard=Object.freeze({Original:'physical',Cash:'virtual',Virtual:'virtual'});
export function applySelectorContent(root,id){
 const key=selectorProductForCard[id],product=selectorProducts[key];if(!product)throw Error('Unknown selector card '+id);
 root.querySelector('#detail-title').textContent=product.name;
 const list=root.querySelector('#selector-facts');if(root.dataset.product===key&&list.children.length)return;
 root.dataset.product=key;const fragment=document.createDocumentFragment();
 for(const [label,value]of product.facts){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);fragment.append(row);}list.replaceChildren(fragment);
}
