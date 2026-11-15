'use strict';
const PUBLISHED_RESTAURANTS = Object.freeze([]);
function validRestaurantId(value){
 return typeof value==='string'&&/^restaurant-[a-z0-9-]{8,80}$/.test(value);
}
function restaurantRegionAt(address,fallback=''){
 if(!address)return '待确认';
 return window.RouteOrder.regionFromAddress(address)||cleanText(fallback,30)||'待确认';
}
function restaurantForStop(stop){
 if(!stop||stop.foodId)return null;
 if(stop.restaurantId)return PUBLISHED_RESTAURANTS.find(row=>row.id===stop.restaurantId)||null;
 if(!stop.address||stop.name!==stop.shop)return null;
 const matches=PUBLISHED_RESTAURANTS.filter(row=>row.name===stop.name&&row.address===stop.address);
 return matches.length===1?matches[0]:null;
}
function renderRestaurants(){
 const rows=PUBLISHED_RESTAURANTS;
 const html=rows.map(row=>{const source=row.photoUrl;return `<article class="restaurant-card"><div class="restaurant-image">${source?`<img src="${esc(source)}" alt="${esc(row.name)}" loading="lazy" referrerpolicy="no-referrer">`:`<div class="restaurant-no-photo">${icon('bowl')}<span>围桌吃顿好的</span></div>`}</div><div class="restaurant-body"><div class="restaurant-meta"><span class="tag sage">${esc(row.region==='县城'?'海丰县城':row.region)}</span>${row.tags?`<span>${esc(row.tags)}</span>`:''}</div><h4 class="restaurant-name">${esc(row.name)}</h4>${row.dishes?`<p class="restaurant-dishes"><strong>推荐菜</strong>${esc(row.dishes)}</p>`:''}${row.notes?`<p class="restaurant-notes">${esc(row.notes)}</p>`:''}${row.address?`<p class="restaurant-address">${esc(row.address)}</p>`:''}${row.hours?`<p class="restaurant-hours">营业时间：${esc(row.hours)}</p>`:''}<div class="restaurant-actions"><button type="button" class="button primary" data-restaurant-plan="${esc(row.id)}">安排到我的行程</button><a class="text-link" href="${esc(mapUrl({...row,shop:row.name}))}" target="_blank" rel="noopener noreferrer" aria-label="在地图中搜索${esc(row.name)}">地图搜索 ↗</a></div></div></article>`;}).join('');
 $('restaurant-grid').innerHTML=html;$('restaurant-empty').hidden=!!rows.length;$('restaurant-count').textContent=rows.length?rows.length+' 家饭店':'';
}
document.addEventListener('DOMContentLoaded',()=>{
 $('restaurant-grid').addEventListener('click',event=>{
  const plan=event.target.closest('[data-restaurant-plan]');
  if(!plan)return;
  const row=PUBLISHED_RESTAURANTS.find(item=>item.id===plan.dataset.restaurantPlan);
  if(row)openEditor(null,null,row);
 });
 document.addEventListener('error',event=>{if(!(event.target instanceof HTMLImageElement)||!event.target.closest('.restaurant-image'))return;const parent=event.target.parentNode;event.target.remove();const fallback=document.createElement('div');fallback.className='restaurant-no-photo';fallback.textContent='照片待补';parent.prepend(fallback);},true);
});
