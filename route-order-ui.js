'use strict';
const routeOrderUndo=new Map(),routeOrderOrigins=new Map();
let routeOrderNotice=null;
const routeOrderKey=()=>state.mode+':'+activeDay;
const routeOrderHash=list=>JSON.stringify(list);
const routeOrderCopy=list=>JSON.parse(JSON.stringify(list));
function renderRouteOrderControls(){
 const button=$('optimize-day');if(!button)return;
 const key=routeOrderKey(),hash=routeOrderHash(current()),entry=routeOrderUndo.get(key);
 if(entry&&entry.after!==hash)routeOrderUndo.delete(key);
 $('undo-route-order').hidden=!routeOrderUndo.has(key);
 $('route-order-origin').value=routeOrderOrigins.get(key)||'auto';
 button.disabled=current().length<2;
 const message=routeOrderNotice?.key===key&&routeOrderNotice.hash===hash?routeOrderNotice.message:'';
 $('route-order-status').textContent=message;$('route-order-status').hidden=!message;
}
function optimizeCurrentDay(){
 if(!window.RouteOrder){toast('顺路功能还在加载，请稍后再试。');return;}
 const key=routeOrderKey(),before=routeOrderCopy(current());
 const result=window.RouteOrder.optimize(before,{origin:routeOrderOrigins.get(key)||'auto',transport:state.transport});
 if(!result.ok){
  const message=result.reason||'这一天暂时排不开，请先调整固定时间或停留时长。';
  routeOrderNotice={key,hash:routeOrderHash(current()),message};renderRouteOrderControls();toast(message);return;
 }
 const ordered=result.stops,originalById=new Map(before.map(stop=>[stop.uid,stop]));
 const moved=ordered.filter((stop,index)=>stop.uid!==before[index]?.uid).length;
 const shifted=ordered.filter(stop=>stop.time!==originalById.get(stop.uid)?.time).length;
 const bufferChanged=ordered.some(stop=>stop.buffer!==originalById.get(stop.uid)?.buffer);
 const unknown=Number(result.stats?.unknown)||0;
 if(!moved&&!shifted&&!bufferChanged){
  const message='当前安排暂时没有更顺的调整。'+(unknown?' '+unknown+' 站位置待补，已保留原位。':'');
  routeOrderNotice={key,hash:routeOrderHash(current()),message};renderRouteOrderControls();toast(message);return;
 }
 state.plans[state.mode][activeDay]=routeOrderCopy(ordered);
 const after=routeOrderHash(current());routeOrderUndo.set(key,{before,after});
 const parts=[moved?'调整了 '+moved+' 站的先后':'保留了原有先后',shifted?'更新了 '+shifted+' 站的时间':''];
 if(result.originLabel)parts.push('从'+result.originLabel+'开始');
 if(unknown)parts.push(unknown+' 站位置待补，保留原位');
 const message=parts.filter(Boolean).join('；')+'。';
 routeOrderNotice={key,hash:after,message};persist();renderPlanner();toast('已顺路排好，可以撤回或继续微调。');
}
function undoCurrentRouteOrder(){
 const key=routeOrderKey(),entry=routeOrderUndo.get(key);if(!entry)return;
 if(entry.after!==routeOrderHash(current())){routeOrderUndo.delete(key);renderRouteOrderControls();toast('你已继续修改这一天，现有安排会保留。');return;}
 state.plans[state.mode][activeDay]=routeOrderCopy(entry.before);routeOrderUndo.delete(key);
 routeOrderNotice={key,hash:routeOrderHash(current()),message:'已恢复这次顺路前的安排。'};persist();renderPlanner();toast('已撤回这次顺路。');
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.id==='optimize-day')optimizeCurrentDay();
 if(button.id==='undo-route-order')undoCurrentRouteOrder();
});
document.addEventListener('change',event=>{if(event.target.id==='route-order-origin')routeOrderOrigins.set(routeOrderKey(),event.target.value);});
