'use strict';
const NUTRITION_FIELDS=[['calories','热量','千卡'],['carbs','碳水化合物','克'],['protein','蛋白质','克'],['fat','脂肪','克'],['fiber','膳食纤维','克'],['sugars','糖分（总糖）','克']];
function nutritionFor(id){return window.FOOD_NUTRITION?.[id];}
function nutritionValues(id,unit='serving'){
 const n=nutritionFor(id);if(!n)return null;
 const scale=unit==='100g'?100/n.portionGrams:1;
 return Object.fromEntries(NUTRITION_FIELDS.map(([key])=>[key,n[key].map(v=>v*scale)]));
}
function nutritionNumber(value,energy=false){
 const step=energy?(value<20?1:10):(value<10?0.1:1);
 return String(Number((Math.round(value/step)*step).toFixed(1)));
}
function nutritionRange(values,energy=false){
 const low=nutritionNumber(values[0],energy),high=nutritionNumber(values[1],energy);
 return low===high?low:low+'–'+high;
}
function nutritionSection(food){
 const n=nutritionFor(food.id);if(!n)return '';
 const values=nutritionValues(food.id),base=FOODS.find(f=>f.id===food.id);
 const fields=NUTRITION_FIELDS;
 return `<section class="food-nutrition" data-nutrition-food="${esc(food.id)}" aria-labelledby="nutrition-title"><div class="nutrition-heading"><h3 id="nutrition-title">大致营养</h3><span>估算值</span></div><div class="nutrition-unit" role="group" aria-label="营养计量单位"><button type="button" data-nutrition-unit="serving" aria-pressed="true">每份</button><button type="button" data-nutrition-unit="100g" aria-pressed="false">每100克</button></div><p class="nutrition-portion">参考一份：${esc(n.portionLabel)}<span>约 ${esc(n.portionGrams)} 克</span></p><p class="nutrition-unit-note" data-nutrition-unit-note>以下按参考一份估算。</p><dl class="nutrition-values" aria-live="polite" aria-atomic="true">${fields.map(([key,label,unit])=>`<div class="${key==='calories'?'nutrition-energy':''}"><dt>${label}</dt><dd><span data-nutrition-value="${key}">${nutritionRange(values[key],key==='calories')}</span><small>${unit}</small></dd></div>`).join('')}</dl><details class="nutrition-method"><summary>配料与估算方式</summary><p><strong>估算对象：</strong>${esc(base?.name||food.name)}。</p><p><strong>参考配料：</strong>${esc(n.ingredients)}</p><p>${esc(n.basis)}</p><p>${esc(n.variation)}</p>${n.fiberSugarBasis?`<p>${esc(n.fiberSugarBasis)}</p>`:''}<p>糖分为食材自带的糖与添加糖之和，不含淀粉。</p><p>“每100克”按同一参考配方及其成品重量折算；汤粥的含水量也会影响结果。</p><ul>${n.sourceUrls.map((url,i)=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${/mext|fooddb/.test(url)?'日本文部科学省 · 食品成分数据库':/usda|nal\.usda/.test(url)?'USDA · 能量与营养成分参考':/cfs\.gov\.hk/.test(url)?'香港食物安全中心 · 食物成分参考':'参考资料 '+(i+1)} ↗</a></li>`).join('')}</ul></details></section>`;
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-nutrition-unit]');if(!button)return;
 const panel=button.closest('[data-nutrition-food]'),unit=button.dataset.nutritionUnit;
 const values=nutritionValues(panel.dataset.nutritionFood,unit);if(!values)return;
 panel.querySelectorAll('[data-nutrition-unit]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 for(const [key,range] of Object.entries(values))panel.querySelector(`[data-nutrition-value="${key}"]`).textContent=nutritionRange(range,key==='calories');
 panel.querySelector('[data-nutrition-unit-note]').textContent=unit==='100g'?'以下按每100克成品折算。':'以下按参考一份估算。';
});
