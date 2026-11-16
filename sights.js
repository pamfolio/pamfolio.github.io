'use strict';
const sightFilter={group:'all',type:'all',expanded:false};
const sightNode=id=>document.getElementById(id);
const allSights=()=>window.SIGHTS_DATA?.sights||[];
const sightById=id=>allSights().find(sight=>sight.id===id);

function sightSafeUrl(value){
 try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}
}
function sightImageUrl(value){
 return typeof value==='string'&&/^assets\/[a-zA-Z0-9_./-]+$/.test(value)?value:sightSafeUrl(value);
}
function sightRange(values,unit){
 if(!Array.isArray(values)||values.length!==2||!values.every(value=>Number.isFinite(value)&&value>=0))return '待补充';
 const format=value=>Number(value.toFixed(1)).toLocaleString('zh-CN');
 return (values[0]===values[1]?format(values[0]):format(values[0])+'–'+format(values[1]))+' '+unit;
}
function sightDriveRange(values){
 if(Array.isArray(values)&&values.length===2&&values[0]>=120)return sightRange([Math.floor(values[0]/30)/2,Math.ceil(values[1]/30)/2],'小时');
 return sightRange(values,'分钟');
}
function sightRouteUrl(sight){
 const hotel=window.SIGHTS_DATA?.hotel||{name:'海丰嘉豐国际酒店',address:'海城镇广富路666号'};
 const params=new URLSearchParams({origin:[hotel.name,hotel.address].filter(Boolean).join(' '),destination:sight.mapQuery||sight.address||sight.name,origin_region:'海丰县',destination_region:sight.mapCity||(sight.group==='nanao'?'汕头':'汕尾'),mode:'driving',output:'html',coord_type:'gcj02',src:'webapp.haifengslow.travel'});
 return 'https://api.map.baidu.com/direction?'+params.toString();
}
function sightPhoto(sight,detail=false){
 const image=sightImageUrl(sight.image),alt=sight.imageAlt||sight.name+'实景';
 return image?`<img class="${detail?'sight-detail-photo':'sight-image'}" src="${esc(image)}" alt="${esc(alt)}" loading="${detail?'eager':'lazy'}" decoding="async" referrerpolicy="no-referrer">`:'<div class="sight-photo-placeholder"><span>'+esc(sight.name)+'</span><small>照片待补</small></div>';
}
function renderSights(){
 const grid=sightNode('sight-grid');if(!grid)return;
 const sights=allSights();
 const types=[...new Set(sights.flatMap(sight=>sight.categories||[]))];
 const select=sightNode('sight-type-filter');
 if(!types.includes(sightFilter.type))sightFilter.type='all';
 if(select){select.innerHTML='<option value="all">所有景点类型</option>'+types.map(type=>`<option value="${esc(type)}">${esc(type)}</option>`).join('');select.value=sightFilter.type;}
 const matched=sights.filter(sight=>(sightFilter.group==='all'||sight.group===sightFilter.group)&&(sightFilter.type==='all'||(sight.categories||[]).includes(sightFilter.type)));
 const visible=sightFilter.expanded?matched:matched.slice(0,8);
 grid.innerHTML=visible.map(sight=>`<article class="sight-card" data-sight-card="${esc(sight.id)}"><div class="sight-image-wrap"><button type="button" class="sight-image-button" data-sight-detail="${esc(sight.id)}" aria-label="查看${esc(sight.name)}的照片与介绍">${sightPhoto(sight)}</button></div><div class="sight-card-body"><div class="sight-card-tags"><span class="sight-tag sight-area">${esc(sight.area||sight.region)}</span>${(sight.categories||[]).map(type=>`<span class="sight-tag">${esc(type)}</span>`).join('')}</div><h4><button type="button" class="sight-name" data-sight-detail="${esc(sight.id)}">${esc(sight.name)}</button></h4><p class="sight-summary">${esc(sight.summary||sight.description||'')}</p><p class="sight-hotel-distance"><span>距酒店约 ${esc(sightRange(sight.distanceKm,'公里'))}</span><span>自驾约 ${esc(sightDriveRange(sight.driveMinutes))}</span>${sight.distanceTargetLabel?`<small>${esc(sight.distanceTargetLabel)}</small>`:''}</p><div class="sight-card-actions"><button type="button" data-sight-detail="${esc(sight.id)}">看看介绍 ${icon('arrow')}</button><button type="button" data-sight-schedule="${esc(sight.id)}" aria-label="把${esc(sight.name)}安排到行程">${icon('plus')}安排行程</button></div></div></article>`).join('');
 if(sightNode('sight-count'))sightNode('sight-count').textContent=matched.length+' 个景点 · 点开看看照片与介绍';
 if(sightNode('sight-empty'))sightNode('sight-empty').hidden=matched.length>0;
 const more=sightNode('sight-more');if(more){more.hidden=matched.length<=8;more.innerHTML=(sightFilter.expanded?'收起景点':'展开全部 '+matched.length+' 个景点')+icon(sightFilter.expanded?'up':'down');}
 document.querySelectorAll('[data-sight-group]').forEach(button=>{const selected=button.dataset.sightGroup===sightFilter.group;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
}
function detailSight(id){
 const sight=sightById(id);if(!sight)return;
 const hotel=window.SIGHTS_DATA?.hotel||{name:'海丰嘉豐国际酒店',address:'海城镇广富路666号'};
 const photoCredit=sight.photoCredit;
 const sourceRows=[...(sight.sources||[]),...(hotel.sourceUrl?[{label:'住宿酒店位置',url:hotel.sourceUrl}]:[])];
 const seen=new Set(),sources=sourceRows.filter(source=>{const url=sightSafeUrl(source.url);if(!url||seen.has(url))return false;seen.add(url);return true;});
 const highlights=Array.isArray(sight.highlights)?sight.highlights.filter(value=>typeof value==='string'&&value):[];
 showInfo(sight.name,`<div class="info-body sight-detail">${sightPhoto(sight,true)}<div class="sight-detail-tags"><span class="sight-tag sight-area">${esc(sight.area||sight.region)}</span>${(sight.categories||[]).map(type=>`<span class="sight-tag">${esc(type)}</span>`).join('')}${sight.routeLabels?.length?`<span class="sight-route-label">${esc(sight.routeLabels.join(' / '))} 路线</span>`:''}</div><p class="sight-description">${esc(sight.description||sight.summary||'')}</p><section class="sight-hotel-panel"><div class="sight-hotel-heading"><h3>从${esc(hotel.name)}出发</h3><span>自驾粗估</span></div><p class="sight-hotel-address">${esc(hotel.address)}</p>${sight.distanceTargetLabel?`<p class="sight-distance-target">${esc(sight.distanceTargetLabel)}</p>`:''}<dl class="sight-distance-grid"><div><dt>大致路程</dt><dd>约 ${esc(sightRange(sight.distanceKm,'公里'))}</dd></div><div><dt>大致车程</dt><dd>约 ${esc(sightDriveRange(sight.driveMinutes))}</dd></div></dl></section><section class="sight-location"><h3>在哪儿，怎么逛</h3><dl><div><dt>所在片区</dt><dd>${esc(sight.area||sight.region)}</dd></div><div><dt>地点</dt><dd>${esc(sight.address||sight.mapQuery||sight.name)}</dd></div><div><dt>建议停留</dt><dd>约 ${esc(sightRange(sight.visitMinutes||[sight.duration,sight.duration],'分钟'))}</dd></div></dl></section>${highlights.length?`<section class="sight-highlights"><h3>可以看看这些</h3><ul>${highlights.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></section>`:''}<div class="sight-detail-actions"><a class="button outline" href="${esc(sightRouteUrl(sight))}" target="_blank" rel="noopener noreferrer" aria-label="查看从${esc(hotel.name)}到${esc(sight.name)}的驾车路线">酒店出发 · 地图路线 ↗</a><button type="button" class="button primary" data-sight-schedule="${esc(sight.id)}">安排到我的行程${icon('arrow')}</button></div>${sources.length||photoCredit?`<details class="sight-sources"><summary>资料与照片来源</summary>${photoCredit?`<p>${esc(photoCredit)}</p>`:''}${sources.length?`<ul>${sources.map(source=>`<li><a href="${esc(sightSafeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.label||'景点资料')} ↗</a></li>`).join('')}</ul>`:''}</details>`:''}</div>`);
}
function scheduleSight(id){
 const sight=sightById(id);if(!sight)return;
 sightNode('info-dialog')?.close();
 const existing=days().flat().find(stop=>stop.name===sight.name||(stop.address&&stop.address===sight.mapQuery));
 if(existing){openEditor(existing);sightNode('edit-heading').textContent='修改景点的行程安排';sightNode('edit-description').textContent=sight.summary||sight.description||'';return;}
 openEditor();
 sightNode('edit-heading').textContent='把景点放进行程';
 sightNode('edit-description').textContent=sight.summary||sight.description||'';
 sightNode('edit-name').value=sight.name;sightNode('edit-shop').value='';sightNode('edit-address').value=sight.mapQuery||sight.address||sight.name;
 ensureStopRegionOptions(sight.region);sightNode('edit-region').value=sight.region;
 const selectedDay=Number(sightNode('edit-day').value);sightNode('edit-time').value=suggestTime(selectedDay,sight.region);
 sightNode('edit-duration').value=Number.isFinite(sight.duration)?sight.duration:60;
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-sight-detail')){detailSight(button.dataset.sightDetail);return;}
 if(button.hasAttribute('data-sight-schedule')){scheduleSight(button.dataset.sightSchedule);return;}
 if(button.hasAttribute('data-sight-group')){sightFilter.group=button.dataset.sightGroup;sightFilter.expanded=false;renderSights();return;}
 if(button.id==='sight-more'){sightFilter.expanded=!sightFilter.expanded;renderSights();}
});
document.addEventListener('change',event=>{if(event.target.id==='sight-type-filter'){sightFilter.type=event.target.value;sightFilter.expanded=false;renderSights();}});
document.addEventListener('error',event=>{
 const image=event.target;if(!(image instanceof HTMLImageElement)||!image.matches('.sight-image,.sight-detail-photo'))return;
 const placeholder=document.createElement('div');placeholder.className='sight-photo-placeholder';placeholder.textContent='照片待补';image.replaceWith(placeholder);
},true);
document.addEventListener('DOMContentLoaded',renderSights);
