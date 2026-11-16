'use strict';
const CATEGORY_LABELS={'粉面主食':'主食 · 粉面粥饭','传统粿点':'传统粿点 · 小吃','肉类海鲜':'肉类 · 海鲜','茶汤综合':'蔬菜 · 茶汤 · 综合','甜品糖水':'甜品 · 糖水','糕饼手信':'传统糕饼 · 手信'};
const cleanText=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const cleanMultiline=(v,max)=>typeof v==='string'?v.replace(/\r\n?/g,'\n').trim().slice(0,max):'';
function safePhotoUrl(v){if(typeof v!=='string'||v.length>2048)return '';try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}}
function foodCopyFields(value,base={}){
 const history=window.FOOD_HISTORY?.[base.id]||{},out={};
 for(const [key,max] of Object.entries({desc:600,story:1600,historyTitle:100,historyText:2000})){const fallback=typeof base[key]==='string'?base[key]:key==='historyTitle'?history.title:key==='historyText'?history.text:'';out[key]=cleanMultiline(typeof value[key]==='string'?value[key]:fallback,max);}
 for(const [key,fallback] of [['source',base.source],['historySourceUrl',typeof base.historySourceUrl==='string'?base.historySourceUrl:history.sourceUrl]])out[key]=safePhotoUrl(typeof value[key]==='string'?value[key]:fallback);
 const duration=Number(Object.hasOwn(value,'duration')?value.duration:base.duration);out.duration=Number.isFinite(duration)&&duration>0?Math.max(10,Math.min(480,Math.round(duration))):30;
 return out;
}
function foodRegionLabel(region){return region==='县城'?'海丰县城':region;}
function foodImage(f){return f.photoUrl||(f.image?'assets/'+f.image:'');}
function renderCatalogFilters(){
 const regions=[...new Set(allFoods().map(f=>f.region))];
 if(!regions.includes(filter.region))filter.region='all';
 $('region-filter').innerHTML='<option value="all">所有片区</option>'+regions.map(r=>`<option value="${esc(r)}">${esc(foodRegionLabel(r))}</option>`).join('');$('region-filter').value=filter.region;
 $('category-filter').innerHTML='<option value="all">六大类别</option>'+Object.entries(CATEGORY_LABELS).map(([v,label])=>`<option value="${v}">${label}</option>`).join('');$('category-filter').value=filter.category;
}
function renderCatalog(){
 renderCatalogFilters();
 const query=filter.query.toLowerCase();
 const language=window.HaifengLanguage;
 const matched=allFoods().filter(f=>{
  if(filter.taste!=='all'&&!f.tastes.includes(filter.taste))return false;
  if(filter.region!=='all'&&f.region!==filter.region)return false;
  if(filter.category!=='all'&&f.category!==filter.category)return false;
  if(!query)return true;
  const fields=[f.name,f.region,f.taste,f.category,f.origin,f.shop,f.address,f.notes].filter(Boolean);
  if(fields.join(' ').toLowerCase().includes(query))return true;
  return language?.english&&fields.map(text=>language.translate(text)).join(' ').toLowerCase().includes(query);
 });
 const visible=filter.expanded?matched:matched.slice(0,8);
 $('food-count').textContent=`${matched.length} 条美食记录 · 想吃 ${state.wish.length} · 吃过 ${state.eaten.length}`;
 $('food-grid').innerHTML=visible.map(f=>{
  const selected=state.wish.includes(f.id),eaten=state.eaten.includes(f.id),photo=foodImage(f);
  return `<article data-food-card="${esc(f.id)}" class="food-card ${selected?'selected':''}"><div class="food-image">${photo?`<img src="${esc(photo)}" alt="${esc(f.name)} · ${f.photoKind==='illustration'?'插画示意':'风味参考照片'}" loading="lazy" referrerpolicy="no-referrer">`:`<div class="note-art"><span class="art-title">${esc(f.art||f.name.slice(0,4))}</span><small>PHOTO TO COME</small></div>`}<span class="location-tag">${icon('pin')}${esc(foodRegionLabel(f.region))}</span>${!photo||f.photoKind==='illustration'?`<span class="photo-kind-badge">${photo?'插画示意':'照片待补'}</span>`:''}<button class="food-heart" data-wish="${f.id}" aria-label="${selected?'移出':'加入'}想吃清单：${esc(f.name)}" aria-pressed="${selected}">${icon('heart')}</button></div><div class="food-body"><div class="food-meta"><span>${esc(f.category)}</span><span>${esc(f.taste)}</span></div><button class="food-name" data-detail="${f.id}">${esc(f.name)}</button><p class="food-description">${esc(f.desc)}</p>${foodShopMarkup(f)}<div class="food-bottom-line"><span class="food-time">${icon('clock')}建议留 ${f.duration} 分钟</span><button class="wish-button" data-wish="${f.id}" aria-pressed="${selected}">${icon(selected?'check':'plus')}${selected?'已加入想吃':'放进想吃清单'}</button></div><button class="eaten-button ${eaten?'eaten':''}" data-eaten="${f.id}" aria-pressed="${eaten}">${icon(eaten?'check':'bowl')}${eaten?'已经尝过这口味道':'吃过了，记一下'}</button></div></article>`;
 }).join('');
 $('food-empty').hidden=matched.length>0;$('more-food').hidden=matched.length<=8;$('more-food').innerHTML=(filter.expanded?'收起其他味道':'再看看其他味道')+icon(filter.expanded?'up':'down');
 document.querySelectorAll('[data-taste]').forEach(b=>{b.classList.toggle('active',b.dataset.taste===filter.taste);b.setAttribute('aria-pressed',String(b.dataset.taste===filter.taste));});
}
function ensureStopRegionOptions(region){const values=[...new Set(['县城','莲花山','大湖','梅陇','公平','可塘','陶河','汕尾市区','红海湾','南澳','其他',...allFoods().map(f=>f.region),region].filter(Boolean))];$('edit-region').innerHTML=values.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('');}
function foodShopMarkup(food,detail=false){
 if(!food.shop&&!food.address&&!food.hours&&!food.notes)return '';
 const fields=[food.shop,food.address,food.hours?'营业时间：'+food.hours:'',food.notes].filter(Boolean);
 if(detail)return `<section class="detail-shop" data-detail-section="shop"><div class="detail-section-heading"><h3>推荐的小店</h3></div>${fields.map(field=>`<p>${esc(field)}</p>`).join('')}</section>`;
 return `<div class="shop-recommendation"><span>推荐小店</span>${fields.map(field=>`<small>${esc(field)}</small>`).join('')}</div>`;
}
function foodHistorySection(food){
 const copy=foodCopyFields(food,food);if(!copy.historyTitle&&!copy.historyText)return '';
 return `<section class="detail-history" data-detail-section="history"><h3>历史与风俗</h3>${copy.historyTitle?`<p class="detail-history-title">${esc(copy.historyTitle)}</p>`:''}${copy.historyText?`<p>${esc(copy.historyText)}</p>`:''}${copy.historySourceUrl?`<a class="detail-history-source" href="${esc(copy.historySourceUrl)}" target="_blank" rel="noopener noreferrer">读一段地方故事 ↗</a>`:''}</section>`;
}
function detailFood(id){
 const f=foodById(id);if(!f)return;const photo=foodImage(f);
 showInfo(f.name,`<div class="info-body">${photo?`<img src="${esc(photo)}" alt="${esc(f.name)}的风味参考" referrerpolicy="no-referrer">`:''}<span class="tag sage">${esc(CATEGORY_LABELS[f.category]||f.category)} · ${esc(f.taste)}</span> <span class="tag sage">${esc(foodRegionLabel(f.region))}</span>${f.story?`<p class="detail-intro">${esc(f.story)}</p>`:''}${foodShopMarkup(f,true)}${nutritionSection(f)}${foodHistorySection(f)}${f.source&&f.source!==foodCopyFields(f,f).historySourceUrl?`<p class="small"><a href="${esc(f.source)}" target="_blank" rel="noopener noreferrer">查看当地介绍 ↗</a></p>`:''}<div class="detail-actions"><button class="button primary" data-detail-add="${esc(id)}">安排到我的行程${icon('arrow')}</button></div></div>`);
}
function chooseLegacyRoute(mode,variant,departure='12:00'){
 const duration=mode===4?'四天三夜':mode===3?'三天两夜':'两天一夜';
 const destination=mode===2?'海丰':variant==='nanao'?'海丰＋南澳':variant==='dahu'?'海丰＋大湖':variant==='shanwei-city'?'海丰＋汕尾市区':'海丰＋汕尾＋红海湾';
 const preview=variant==='nanao'?`第 2 天 ${departure} 从海丰出发，${departure==='14:00'?'晚间抵达后入住、吃晚餐':'下午抵达后入住、附近看海'}。海丰住 1 晚，南澳住 ${mode===4?'2':'1'} 晚。`:'前两天留给海丰老城和莲花山，第 3 天按选定的分支走。';
 showInfo('载入「'+destination+' · '+duration+'」？',`<div class="info-body">${mode>2?`<p>${esc(preview)}</p>`:''}<p>这会替换当前的${duration}行程。想吃清单和其他天数的行程会保留。</p><button class="button primary" data-confirm-route="${mode}" data-variant="${esc(variant)}" data-departure="${esc(departure)}">载入这条推荐路线</button></div>`);
}
function updateRouteChoices(){
 const variant=document.querySelector('[name="b-route"]:checked')?.value||'shanwei';
 const b=$('use-b-route');b.dataset.variant=variant;
 $('b-route-summary').textContent={dahu:'已选：海丰大湖滨海 · 留在海丰，走走高螺湿地',shanwei:'已选：汕尾市区＋红海湾 · 看海与逛吃安排一整天','shanwei-city':'已选：汕尾市区轻松版 · 下午多留一点返程时间'}[variant];
 const mode=Number(document.querySelector('[name="c-duration"]:checked')?.value||3),departure=$('c-departure').value,c=$('use-c-route');
 c.dataset.useRoute=mode;c.dataset.departure=departure;
 $('c-route-summary').innerHTML=`DAY 1 海丰慢逛<br>DAY 2 ${departure==='14:00'?'下午出发，晚间到岛入住':'中午出发，下午到岛入住'}<br>${mode===4?'DAY 3 青澳湾 · 自然之门 · 海边慢游<br>DAY 4 灯塔 · 海岸公路 · 午后返程':'DAY 3 青澳湾 · 灯塔与海岸 · 午后返程'}`;
}
document.addEventListener('change',e=>{if(e.target.matches('[name="b-route"],[name="c-duration"],#c-departure'))updateRouteChoices();});

document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.eaten){
  const id=b.dataset.eaten;
  if(!foodById(id))return;
  const fromLog=b.closest('#tasted-list');
  const wasEaten=state.eaten.includes(id);
  state.eaten=wasEaten?state.eaten.filter(value=>value!==id):[...state.eaten,id];
  if(wasEaten)delete state.tastedRatings[id];
  openTastedRating=wasEaten?'':id;
  refresh();
  const nextFocus=fromLog
   ? fromLog.querySelector('.tasted-remove')||$('tasted-browse')
   : [...$('food-grid').querySelectorAll('[data-eaten]')].find(button=>button.dataset.eaten===id);
  nextFocus?.focus({preventScroll:true});
  toast(wasEaten?'已从吃过手记撤销。':'盖了一枚小章，已记进海丰吃过手记。');
  return;
 }
 if(b.dataset.confirmRoute){const mode=Number(b.dataset.confirmRoute),variant=b.dataset.variant,departure=b.dataset.departure||'12:00';$('info-dialog').close();state.plans[mode]=template(mode,variant,departure);for(const day of state.plans[mode])for(const s of day)if(s.foodId){const f=foodById(s.foodId);if(f){s.name=f.name;s.shop=f.shop||'';s.address=f.address||'';}else delete s.foodId;}state.variant=variant;state.departure=departure;switchMode(mode,true);toast('已载入新版推荐路线，可以继续修改。');}
});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&e.target.closest('.food-image')){const parent=e.target.parentNode;e.target.remove();const fallback=document.createElement('div');fallback.className='note-art';fallback.textContent='照片待补';parent.prepend(fallback);}},true);
document.addEventListener('DOMContentLoaded',()=>{
 updateRouteChoices();
});
