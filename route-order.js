'use strict';
/* Browser-local route ordering. Positions and transfer estimates are planning aids. */
window.RouteOrder=(()=>{
 const norm=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[\s·•・，,。.!！?？、:：;；/／()（）\[\]【】—–_-]+/g,'');
 const numericPoint=point=>point&&Number.isFinite(point.lat)&&Number.isFinite(point.lng)&&Math.abs(point.lat)<=90&&Math.abs(point.lng)<=180;
 const clone=list=>list.map(stop=>({...stop}));
 const toMinutes=value=>{const match=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value));return match?Number(match[1])*60+Number(match[2]):NaN;};
 const clock=value=>{const rounded=Math.ceil(value);return String(Math.floor(rounded/60)).padStart(2,'0')+':'+String(rounded%60).padStart(2,'0');};
 const transitName=value=>/返程|回程|取行李|入住|退房|离岛|离开海丰|海丰出发|前往南澳|过桥与高速|留足过桥|留足.*返程/.test(String(value||''));
 function pointCopy(point,label,region){return {...point,lat:Number(point.lat),lng:Number(point.lng),quality:point.quality==='place'?'place':'area',label:label||point.label||point.name||region,region:region||point.region||''};}
 function locate(stop){
  if(!stop||transitName(stop.name))return null;
  const geo=window.ROUTE_GEO||{},name=norm(stop.name),address=norm(stop.address),shop=norm(stop.shop),combined=[name,address,shop].filter(Boolean).join('|');
  if(/南京/.test(combined)&&/鸡鸣寺/.test(combined))return null;
  if(stop.foodId&&!address&&!shop)return null;
  const places=(geo.places||[]).filter(numericPoint);
  const exact=places.find(place=>(place.aliases||[]).some(alias=>{const key=norm(alias);return key&&[name,address,shop].includes(key);}));
  if(exact)return pointCopy(exact,exact.name||exact.id,exact.region);
  const partial=places.flatMap(place=>(place.aliases||[]).map(alias=>({place,key:norm(alias)}))).filter(row=>row.key.length>=4&&combined.includes(row.key)).sort((a,b)=>b.key.length-a.key.length)[0];
  if(partial)return pointCopy(partial.place,partial.place.name||partial.place.id,partial.place.region);
  const regions=Object.entries(geo.regions||{}).filter(([,point])=>numericPoint(point));
  // Food origin/taste labels alone are not a selected restaurant location.
  if(stop.foodId&&!address)return null;
  const areaAliases=regions.flatMap(([key,point])=>[key,...(point.aliases||[])].map(alias=>({key,point,alias:norm(alias)}))).filter(row=>row.alias.length>=2);
  const addressAreas=areaAliases.filter(row=>address.includes(row.alias)).sort((a,b)=>b.alias.length-a.alias.length);
  const namedAreas=areaAliases.filter(row=>name.includes(row.alias)).sort((a,b)=>b.alias.length-a.alias.length);
  if(!address&&!namedAreas.length)return null;
  const area=addressAreas[0]||(!address?namedAreas[0]:null)||regions.map(([key,point])=>({key,point})).find(row=>norm(row.key)===norm(stop.region)||(row.point.aliases||[]).some(alias=>norm(alias)===norm(stop.region)));
  return area?pointCopy({...area.point,quality:'area'},area.point.label||area.key,area.key):null;
 }
 function regionFromAddress(value){
  const address=norm(value);
  if(!address)return '';
  if(/红海湾(?!路)|遮浪街道/.test(address))return '红海湾';
  if(/南澳县|后宅镇/.test(address))return '南澳';
  if(/汕尾(?:市)?城区/.test(address))return '汕尾市区';
  const town=address.match(/(大湖|梅陇|公平|可塘|陶河|联安|赤坑)镇/);
  if(town)return town[1];
  if(/莲花山(?:片区|森林公园|度假区)/.test(address))return '莲花山';
  if(/海城镇|城东镇|附城镇/.test(address))return '县城';
  const locality=address.replace(/(?:县城|莲花山|大湖|梅陇|公平|可塘|陶河|红海湾|南澳)(?=[东西南北中]?(?:路|街|巷))/g,'');
  return locate({address:locality})?.region||'';
 }
 function km(a,b){
  if(!numericPoint(a)||!numericPoint(b))return 0;
  const radians=Math.PI/180,dLat=(b.lat-a.lat)*radians,dLng=(b.lng-a.lng)*radians;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*radians)*Math.cos(b.lat*radians)*Math.sin(dLng/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
 }
 function pathCost(order,points,left,right){
  if(!order.length)return left&&right?km(left,right):0;
  let total=left?km(left,points[order[0]]):0;
  for(let i=1;i<order.length;i++)total+=km(points[order[i-1]],points[order[i]]);
  if(right)total+=km(points[order[order.length-1]],right);
  return total;
 }
 function exactOrder(indices,points,left,right){
  const n=indices.length,count=1<<n,table=Array.from({length:count},()=>Array(n).fill(null));
  for(let i=0;i<n;i++)table[1<<i][i]={cost:left?km(left,points[indices[i]]):0,previous:-1};
  for(let mask=1;mask<count;mask++)for(let last=0;last<n;last++){
   const entry=table[mask][last];if(!entry)continue;
   for(let next=0;next<n;next++)if(!(mask&(1<<next))){
    const nextMask=mask|(1<<next),cost=entry.cost+km(points[indices[last]],points[indices[next]]),saved=table[nextMask][next];
    if(!saved||cost<saved.cost-1e-8)table[nextMask][next]={cost,previous:last};
   }
  }
  let last=0,best=Infinity;
  for(let i=0;i<n;i++){const cost=table[count-1][i].cost+(right?km(points[indices[i]],right):0);if(cost<best-1e-8){last=i;best=cost;}}
  const route=[];let mask=count-1;
  while(last>=0){route.push(indices[last]);const previous=table[mask][last].previous;mask^=1<<last;last=previous;}
  return route.reverse();
 }
 function twoOpt(order,points,left,right){
  let current=order.slice(),best=pathCost(current,points,left,right);
  for(let pass=0;pass<20;pass++){
   let improved=false;
   for(let from=0;from<current.length-1;from++)for(let to=from+1;to<current.length;to++){
    const candidate=[...current.slice(0,from),...current.slice(from,to+1).reverse(),...current.slice(to+1)],score=pathCost(candidate,points,left,right);
    if(score<best-1e-8){current=candidate;best=score;improved=true;}
   }
   if(!improved)break;
  }
  return current;
 }
 function orderGap(indices,points,left,right){
  if(indices.length<2)return indices.slice();
  let candidate;
  if(indices.length<=9)candidate=exactOrder(indices,points,left,right);
  else{
   let best=Infinity;candidate=indices.slice();
   const seeds=left?indices.slice().sort((a,b)=>km(left,points[a])-km(left,points[b])||a-b).slice(0,5):indices.filter((_,i)=>i===0||i===indices.length-1||i%Math.ceil(indices.length/4)===0).slice(0,6);
   for(const seed of seeds){
    const order=[seed],remaining=indices.filter(index=>index!==seed);
    while(remaining.length){const current=points[order[order.length-1]];remaining.sort((a,b)=>km(current,points[a])-km(current,points[b])||a-b);order.push(remaining.shift());}
    const sorted=twoOpt(order,points,left,right),score=pathCost(sorted,points,left,right);
    if(score<best-1e-8){candidate=sorted;best=score;}
   }
  }
  return pathCost(candidate,points,left,right)<pathCost(indices,points,left,right)-1e-6?candidate:indices.slice();
 }
 function transferMinutes(a,b){
  if(!a||!b)return 0;
  const distance=km(a,b);if(distance<0.4)return 5;
  const mountain=a.region==='莲花山'||b.region==='莲花山',island=a.region==='南澳'&&b.region==='南澳';
  const speed=mountain||island?32:distance<8?25:50;
  return Math.ceil((distance*1.35/speed*60+8)/5)*5;
 }
 function optimize(input,options={}){
  const original=Array.isArray(input)?clone(input):[],points=original.map(locate),fixed=original.map(stop=>stop.fixedTime===true),stats={moved:0,shifted:0,unknown:points.filter((point,index)=>!point&&!transitName(original[index].name)).length,areaCount:points.filter(point=>point?.quality==='area').length,fixedCount:fixed.filter(Boolean).length,changed:false};
  const fail=reason=>({ok:false,reason,stops:clone(original),stats:{...stats,moved:0,shifted:0,changed:false},originLabel:''});
  if(original.length<2)return fail('当天至少安排两个地点后，再试一键顺路。');
  if(original.length>25)return fail('当天地点较多，请先精简到 25 站以内。');
  if(original.some(stop=>!Number.isFinite(toMinutes(stop.time))||!Number.isFinite(stop.duration)||stop.duration<0||!Number.isFinite(stop.buffer)||stop.buffer<0))return fail('请先补好当天的开始时间、停留和转场分钟。');
  const geo=window.ROUTE_GEO||{},islandOnly=original.every(stop=>norm(stop.region).includes('南澳'))||Boolean(original[0]&&norm(original[0].region).includes('南澳')&&!transitName(original[0].name));
  const useFirst=options.origin==='first'||(options.origin!=='hotel'&&islandOnly)||!numericPoint(geo.hotel),originLabel=useFirst?'当天第一站':'嘉豐酒店片区',origin=useFirst?points[0]:pointCopy(geo.hotel,'嘉豐酒店片区','县城');
  const barrier=original.map((stop,i)=>fixed[i]||!points[i]||(useFirst&&i===0)),permutation=original.map((_,i)=>i);
  let begin=0;
  while(begin<original.length){
   if(barrier[begin]){begin++;continue;}
   let end=begin;while(end<original.length&&!barrier[end])end++;
   const indices=permutation.slice(begin,end),left=begin?points[begin-1]:origin,right=end<original.length?points[end]:null,sorted=orderGap(indices,points,left,right);
   for(let index=begin;index<end;index++)permutation[index]=sorted[index-begin];
   begin=end;
  }
  const stops=permutation.map(index=>({...original[index]}));
  for(let i=0;i<stops.length;i++){
   const source=permutation[i],stop=stops[i],prior=i?stops[i-1]:null,priorSource=i?permutation[i-1]:null;
   if(i&&priorSource!==source-1&&points[priorSource]&&points[source]){
    const estimate=transferMinutes(points[priorSource],points[source]);
    if(estimate>180)return fail('这两站跨城路程较长，请先加入交通安排，或放到不同天。');
    stop.buffer=Math.max(stop.buffer,estimate);
   }
   const earliest=i?toMinutes(prior.time)+prior.duration+stop.buffer:toMinutes(original[0].time);
   if(barrier[i]){
    // Barriers never move in the permutation, so original clock times remain valid references.
    if(i&&earliest>toMinutes(stop.time))return fail(fixed[i]?'顺路重排会挤到固定时间，已保留原安排。可减少停留或调整转场后再试。':'顺路重排会挤到位置待补地点的原定时间，已保留原安排。请先补位置或调整时间。');
   }else{
    if(earliest>=1440)return fail('当天排不下这些地点，请减少停留或拆到另一天。');
    stop.time=clock(earliest);
   }
   if(toMinutes(stop.time)+stop.duration>=1440)return fail('当天安排会跨到次日，请减少停留或拆到另一天。');
  }
  stats.moved=permutation.filter((source,index)=>source!==index).length;
  stats.shifted=stops.filter((stop,index)=>stop.time!==original[permutation[index]].time).length;
  stats.changed=stats.moved>0||stats.shifted>0||stops.some((stop,index)=>stop.buffer!==original[permutation[index]].buffer);
  const reason=stats.changed?'已按地点位置与片区顺路排好。':stats.unknown?'位置待补的地点已保留原安排。':'当前顺序已经比较顺路。';
  return {ok:true,reason,stops,stats,originLabel};
 }
 return {locate,regionFromAddress,optimize};
})();
