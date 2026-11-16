'use strict';
const ICONS={arrow:'M4 12h16m-6-6 6 6-6 6',down:'m6 9 6 6 6-6',up:'m6 15 6-6 6 6',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',bowl:'M3 12h18c-1 7-4 10-9 10S4 19 3 12ZM7 2c-3 3 3 4 0 7m5-7c-3 3 3 4 0 7m5-7c-3 3 3 4 0 7',share:'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.7 10.5l6.6-4m-6.6 7 6.6 4',download:'M12 3v12m-5-5 5 5 5-5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',x:'m6 6 12 12M6 18 18 6',check:'m4 12 5 5L20 6',plus:'M12 5v14M5 12h14',edit:'m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5',info:'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]||ICONS.pin}"/></svg>`;
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>globalThis.crypto?.randomUUID?.()||'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const foodSource='https://www.shanwei.gov.cn/shanwei/swly/swtc/content/post_1122072.html';
const photoSource='https://www.shanwei.gov.cn/swtcj/csmp/content/post_212644.html';
const FOODS=[
 {id:'xiaomi',name:'海丰小米',region:'县城',origin:'海丰代表',category:'传统粿点',tastes:['savory'],taste:'咸香 · Q弹',image:'xiaomi.jpg',duration:30,desc:'晶莹的番薯粉皮，包住一口鲜香。',story:'海丰小米是包馅的番薯粉小点。可以先尝一小份，再接着去吃下一家。',source:foodSource},
 {id:'beef',name:'牛肉饼汤',region:'县城',origin:'海丰代表',category:'肉类海鲜',tastes:['savory'],taste:'咸鲜 · 弹牙',image:'beef.jpg',duration:40,desc:'一口弹牙肉饼，一口热汤的满足。',story:'扁扁的牛肉饼很有地方特色，适合配小米一起尝。具体汤底与搭配依各店做法。',source:'https://www.shanwei.gov.cn/shanwei/swly/lysc/content/post_968560.html'},
 {id:'caiguo',name:'梅陇菜包粿',region:'梅陇',origin:'梅陇特色',category:'传统粿点',tastes:['savory'],taste:'咸香 · 软韧',image:'caiguo.jpg',duration:35,desc:'薄薄米皮里，藏着时蔬与肉馅。',story:'梅陇是菜包粿有代表性的寻味地。馅料常有蔬菜、肉或海味，买之前可以问清楚。县城也可先搜索是否有售卖点。',source:foodSource},
 {id:'caicha',name:'海丰菜茶',region:'县城',origin:'海丰代表',category:'茶汤综合',tastes:['savory','tea'],taste:'咸香 · 丰盛',image:'vegetable-tea.jpg',duration:45,desc:'蔬菜、炒米与热汤，盛出一碗热闹。',story:'菜茶比名字听起来更丰盛：时蔬与各式配料铺在碗中，撒炒米、花生后冲入汤水。配料可能含肉或海鲜。',source:foodSource},
 {id:'jelly',name:'狗毛膏',region:'县城',origin:'海陆丰共有',category:'甜品糖水',tastes:['sweet'],taste:'清甜 · 凉滑',image:'jelly.jpg',duration:25,desc:'一碗凉滑的小甜，给胃口换个频道。',story:'当地常见的清凉甜品，又可见“九毛膏”等写法。甜度与配料每家不同，饭后留一点胃来尝尝。',source:photoSource},
 {id:'pancake',name:'咸甜薄饼',region:'县城',origin:'海陆丰共有',category:'传统粿点',tastes:['savory','sweet'],taste:'咸甜皆有 · 薄韧',image:'pancake.jpg',duration:30,desc:'卷起咸香配菜，或糖葱豆酥的甜。',story:'薄饼有咸、甜两种吃法。咸馅常见时蔬、蛋、肉等；甜馅可配糖葱、豆酥。喜欢哪种，点单时说清楚。',source:foodSource},
 {id:'layercake',name:'层糕粿',region:'县城',origin:'海陆丰共有',category:'传统粿点',tastes:['savory','sweet'],taste:'甜咸皆有 · 层叠',image:'layer-cake.jpg',duration:25,desc:'一层层蒸出的耐心，软韧又有米香。',story:'也叫重糕粿，米浆逐层蒸熟，甜咸都能做。小份分着吃，很适合接在一顿正餐之后。',source:foodSource},
 {id:'riceroll',name:'猪肠粉',region:'县城',origin:'本地常见',category:'粉面主食',tastes:['savory'],taste:'咸香 · 软滑',image:'rice-roll.jpg',duration:35,desc:'热气腾腾的米香，开启慢悠悠的早晨。',story:'当地日常早餐的一种选择。“猪肠粉”是传统名称，具体卷法、配料、酱汁和是否含肉须向店家确认。',source:photoSource},
 {id:'salttea',name:'海丰咸茶',region:'县城',origin:'本地常见',category:'茶汤综合',tastes:['savory','tea'],taste:'咸香 · 茶香',image:'salt-tea.jpg',duration:40,desc:'茶香和花生芝麻香，值得坐下来慢尝。',story:'咸茶是当地饮食文化的一部分，做法与配料因人家和店家而异。可以配小点，留一段坐着聊天的时间。',source:photoSource},
 {id:'triangle',name:'公平三角粿',region:'公平',origin:'公平特色',category:'传统粿点',tastes:['savory'],taste:'咸鲜 · 米香',art:'三角粿',duration:30,desc:'换个形状的米粿，也是另一口鲜香。',story:'公平三角粿与梅陇菜包粿同属地方粿点，各有形状与馅料特色。去公平时，可以和当地其他小吃一起安排。',source:foodSource},
 {id:'bowlcake',name:'公平碗粿',region:'公平',origin:'公平特色',category:'传统粿点',tastes:['savory'],taste:'咸香 · 绵软',art:'碗粿',duration:30,desc:'小小一碗米粿，淋上各家的拿手酱汁。',story:'又叫扎头糕，是公平常见的小吃。碗蒸米粿配上馅料与酱汁，适合作为一站小加餐。',source:foodSource},
 {id:'eggwhite',name:'公平蛋清糕',region:'公平',origin:'公平特色',category:'糕饼手信',tastes:['sweet'],taste:'香甜 · 松软',art:'蛋清糕',duration:25,desc:'松软的一块甜，也能带走分享。',story:'公平的地方糕点。可到当地找店尝鲜，购买手信时询问保存方式与保质期。',source:'https://www.shanwei.gov.cn/attachment/0/18/18626/701841.pdf'}
];
const VERIFIED_FOODS=FOODS.map(f=>({...f}));
const oldFoodMap=new Map(VERIFIED_FOODS.map(f=>[f.id,f]));
const mergedLegacy=window.LEGACY_DATA.foods.filter(f=>!f.composite).map(f=>{
 const previous=oldFoodMap.get(f.id)||{};
 return {...previous,...f,duration:previous.duration||30,image:previous.image||'',photoKind:previous.image?'photo':'missing',desc:f.desc||previous.desc||'',story:previous.story||'',art:f.name.replace(/海丰|公平|梅陇/g,'').slice(0,5),source:f.source||previous.source||''};
});
const preferred=VERIFIED_FOODS.map(f=>f.id);
mergedLegacy.sort((a,b)=>(preferred.indexOf(a.id)<0?99:preferred.indexOf(a.id))-(preferred.indexOf(b.id)<0?99:preferred.indexOf(b.id)));
FOODS.splice(0,FOODS.length,{"id":"coconut-chacha","name":"椰奶喳喳","region":"海丰","origin":"自选甜品","category":"甜品糖水","tastes":["sweet"],"taste":"香甜 · 椰香","tags":"椰奶 · 芋头 · 豆香","photoKind":"missing","art":"椰香","duration":25,"desc":"椰香甜汤里，藏着芋头和豆子的绵软。","story":"椰奶搭配芋头、豆类等配料，一勺能尝到椰香与软糯。适合留一点胃，坐下来慢慢吃。","shop":"","address":"","hours":"","notes":"","source":"https://www.ttv.com.tw/cuisine/amp/Detail2.aspx?rid=1404"},{"id":"wuguotang","name":"五果汤","region":"海丰","origin":"本地糖水","category":"甜品糖水","tastes":["sweet"],"taste":"清甜 · 软糯","tags":"传统甜汤 · 配料丰富","photoKind":"missing","art":"五果","duration":25,"desc":"一碗清甜的糖水，慢慢舀起软糯配料。","story":"薏米、莲子、桂圆等配料煮成甜汤，清甜中带着谷物与果干的香气。小碗慢尝，给逛吃留个甜甜的收尾。","shop":"","address":"","hours":"","notes":"","source":"https://m.guokr.com/article/461953"},{id:'tongpan',name:'铜盘粿',region:'海丰',origin:'海丰小吃',category:'传统粿点',tastes:['savory'],taste:'咸香 · 软滑',tags:'米浆蒸制 · 早餐',photoKind:'missing',art:'铜盘粿',duration:30,desc:'铜盘蒸出一层米香，软滑鲜香的一口早餐。',story:'米浆摊入铜盘蒸成薄粿，常搭配肉末、鸡蛋与酱汁。米香软滑，趁热吃更有滋味。',shop:'',address:'',hours:'',notes:'',source:'https://travel.ifeng.com/c/7z21itHHX5U'},...mergedLegacy);
for(const [id,story] of Object.entries({"beef": "扁平的牛肉饼弹牙鲜香，配小米一起尝，是很有地方特色的搭配。", "caiguo": "薄薄的米皮裹住时蔬、肉丁与海味，蒸热后软韧鲜香。", "jelly": "也叫九毛膏，凉滑清甜，适合饭后留一点胃慢慢尝。", "riceroll": "米浆蒸成软滑的粉皮，配酱汁和葱香，是当地日常早餐的一种选择。", "salttea": "茶叶和花生、芝麻交织出咸香，配小点坐下来慢慢聊。", "eggwhite": "公平的地方糕点，松软香甜，也适合带回去分享。"})){const f=FOODS.find(f=>f.id===id);if(f)f.story=story;}
Object.assign(FOODS.find(f=>f.id==='pancake'),{desc:'薄饼卷起咸香配菜，留给小吃的一口胃。',story:'薄饼卷起时蔬与咸香配菜，软韧又有层次。喜欢甜口的话，也可以试试单独收录的甜薄饼。'});
const allFoods=()=>FOODS;
const foodById=id=>FOODS.find(food=>food.id===id);
const dayNames=()=>state.mode===2?['老城烟火','山里慢走']:state.mode===4?['海丰慢逛','出发南澳','海湾慢游','灯塔与返程']:state.variant==='nanao'?['海丰慢逛','出发南澳','海岛慢游']:['老城烟火','山里慢走',state.variant==='dahu'?'大湖滨海':state.variant==='shanwei-city'?'汕尾逛吃':'汕尾与红海湾'];
function defaultFixedTime(name){return /早餐|午餐|晚餐|聚餐|入住|退房|返程|取行李|海丰出发|前往南澳岛/.test(String(name||''));}
function stop(name,region,time,duration,extra={}){return {uid:uid(),name,region,time,duration,fixedTime:defaultFixedTime(name),shop:'',address:'',buffer:20,...extra};}
function legacyTemplate(mode){
 const days=[[
  stop('红宫红场旧址','县城','10:00',80,{buffer:0,address:'海丰红宫红场旧址纪念馆'}),
  stop('海丰小米','县城','11:40',30,{foodId:'xiaomi'}),
  stop('牛肉饼汤','县城','12:30',40,{foodId:'beef'}),
  stop('彭湃烈士故居','县城','14:00',60,{address:'海丰彭湃烈士故居'}),
  stop('海丰菜茶','县城','16:00',45,{foodId:'caicha'}),
  stop('晚餐 · 海鲜或家常菜','县城','18:30',90)
 ],[
  stop('莲花山片区慢走','莲花山','09:30',100,{buffer:0,address:'广东省汕尾市海丰县莲花山森林公园'}),
  stop('鸡鸣寺','莲花山','11:40',60,{address:'海丰鸡鸣寺'}),
  stop('山边午餐','莲花山','13:00',60),
  stop(mode===3?'莲花村 · 喝茶与散步':'县城补买手信 · 准备返程',mode===3?'莲花山':'县城','15:00',60,{buffer:mode===3?30:60,address:mode===3?'海丰莲花村':''})
 ]];
 if(mode===3)days.push([
  stop('县城早餐','县城','08:30',45,{buffer:0}),
  stop('大湖 · 高螺游客服务中心','大湖','10:30',60,{buffer:60,address:'海丰高螺游客服务中心'}),
  stop('大湖午餐','大湖','13:00',60),
  stop('回县城取行李 · 准备返程','县城','15:30',45,{buffer:60})
 ]);
 return days;
}
function template(mode,variant='shanwei',departure='12:00'){
 if(mode===4)variant='nanao';
 const base=legacyTemplate(mode===2?2:3);
 if(mode===2||variant==='dahu')return base;
 if(variant==='nanao'){
  const later=departure==='14:00';
  const islandDays=[base[0],[
   stop('县城早餐与自由活动','县城','09:00',90,{buffer:0}),
   ...(later?[stop('海丰午餐','县城','11:30',90,{buffer:0})]:[]),
   stop('海丰出发 · 自驾前往南澳岛','南澳',later?'14:00':'12:00',270,{buffer:0,address:'汕头南澳岛'}),
   stop(later?'南澳抵达 · 办理入住':'南澳入住 · 附近看海','南澳',later?'19:00':'17:00',later?30:60,{buffer:30,address:'汕头南澳岛'}),
   stop('岛上海鲜晚餐','南澳',later?'19:45':'18:30',90,{buffer:later?15:30})
  ]];
  if(mode===4){
   islandDays.push([
    stop('青澳湾 · 海边早餐与散步','南澳','09:00',120,{buffer:0,address:'南澳青澳湾'}),
    stop('自然之门 · 北回归线广场','南澳','11:30',60,{buffer:30,address:'南澳青澳湾自然之门'}),
    stop('岛上午餐','南澳','13:00',60,{buffer:30}),
    stop('海边咖啡与自由活动','南澳','15:00',120,{buffer:60}),
    stop('南澳晚餐 · 岛上再住一晚','南澳','18:00',90,{buffer:60})
   ],[
    stop('海岛早餐','南澳','08:30',45,{buffer:0}),
    stop('长山尾灯塔 · 沿海岸慢走','南澳','10:00',60,{buffer:45,address:'南澳长山尾灯塔'}),
    stop('环岛公路 · 选喜欢的观景点','南澳','11:30',60,{buffer:30,address:'南澳岛环岛公路'}),
    stop('渔港午餐','南澳','13:00',60,{buffer:30}),
    stop('离岛返程 · 留足过桥与高速时间','南澳','14:30',60,{buffer:30})
   ]);
  }else islandDays.push([
   stop('青澳湾 · 自然之门','南澳','09:00',90,{buffer:0,address:'南澳青澳湾自然之门'}),
   stop('灯塔与环岛公路 · 选一处停靠','南澳','11:00',60,{buffer:30,address:'南澳岛环岛公路'}),
   stop('渔港午餐','南澳','12:30',60,{buffer:30}),
   stop('留足过桥与返程时间','南澳','14:00',60,{buffer:30})
  ]);
  return islandDays;
 }
 base[2]=[
  stop('县城早餐','县城','08:00',40,{buffer:0}),
  stop('金町湾 · 海边散步','汕尾市区','10:00',60,{buffer:80,address:'汕尾金町湾'}),
  stop('二马路 · 逛街与午餐','汕尾市区','12:00',90,{buffer:60,address:'汕尾二马路'}),
  ...(variant==='shanwei-city'?[
   stop('二马路周边 · 咖啡与补买小吃','汕尾市区','14:00',60,{buffer:30,address:'汕尾二马路'}),
   stop('按车次返程','汕尾市区','15:30',30,{buffer:30})
  ]:[
   stop('红海湾遮浪 · 看海与咖啡','红海湾','15:00',90,{buffer:90,address:'汕尾红海湾遮浪旅游区'}),
   stop('按车次与导航返程','红海湾','17:00',30,{buffer:30})
  ])
 ];return base;
}
const DEFAULT=()=>({
 version:1,mode:2,variant:'haifeng',departure:'12:00',
 planOptions:{2:{variant:'haifeng',departure:'12:00'},3:{variant:'shanwei',departure:'12:00'},4:{variant:'nanao',departure:'12:00'}},
 eaten:[],tastedRatings:{},date:'',transport:'drive',wish:['xiaomi','beef','caicha'],wishStops:[],
 plans:{2:template(2),3:template(3),4:template(4,'nanao')}
});
const STORAGE='haifeng-slow-weekend-visitor-v1';
const minutes=t=>{const [h,m]=String(t).split(':').map(Number);return h*60+m;};
const timeLabel=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}${m>=1440?'（次日）':''}`;
const inputTime=m=>timeLabel(Math.min(Math.max(m,0),1439)).slice(0,5);
const validWishStopId=value=>typeof value==='string'&&/^wish-stop-[a-z0-9-]{8,80}$/.test(value);
function sanitizeStopFields(s){
 return {
  name:s.name.slice(0,60),region:typeof s.region==='string'?s.region.slice(0,30):'其他',
  time:/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time||'')?s.time:'10:00',duration:Math.min(480,Math.max(10,Number(s.duration)||30)),
  buffer:Math.min(180,Math.max(0,Number(s.buffer)||0)),fixedTime:typeof s.fixedTime==='boolean'?s.fixedTime:defaultFixedTime(s.name),
  shop:String(s.shop||'').slice(0,80),address:String(s.address||'').slice(0,160)
 };
}
function sanitize(input){
 if(!input||input.version!==1||!input.plans)throw Error('无法识别这份行程');
 const out=DEFAULT();out.mode=[2,3,4].includes(input.mode)?input.mode:2;
 const variants=['shanwei','shanwei-city','nanao','dahu'];
 const legacyVariant=variants.includes(input.variant)?input.variant:'shanwei';
 for(const mode of [2,3,4]){
  const option=input.planOptions?.[mode]||{};
  out.planOptions[mode]={variant:mode===2?'haifeng':mode===4?'nanao':variants.includes(option.variant)?option.variant:legacyVariant,departure:(option.departure||(input.departure))==='14:00'?'14:00':'12:00'};
  out.plans[mode]=template(mode,out.planOptions[mode].variant,out.planOptions[mode].departure);
 }
 out.variant=out.planOptions[out.mode].variant;out.departure=out.planOptions[out.mode].departure;
 const validIds=new Set(FOODS.map(food=>food.id));
 out.eaten=Array.isArray(input.eaten)?[...new Set(input.eaten.filter(id=>validIds.has(id)))]:[];
 out.tastedRatings=sanitizeTastedRatings(input.tastedRatings,out.eaten);
 out.date=/^\d{4}-\d{2}-\d{2}$/.test(input.date||'')?input.date:'';
 out.transport=input.transport==='taxi'?'taxi':'drive';
 out.wish=Array.isArray(input.wish)?[...new Set(input.wish.filter(id=>validIds.has(id)))].slice(0,validIds.size):[];
 const wishStopIds=new Set();
 for(const stop of Array.isArray(input.wishStops)?input.wishStops.slice(0,100):[]){
  if(!stop||!validWishStopId(stop.uid)||wishStopIds.has(stop.uid)||!cleanText(stop.name,60))continue;
  wishStopIds.add(stop.uid);
  out.wishStops.push({uid:stop.uid,...sanitizeStopFields(stop),...(validRestaurantId(stop.restaurantId)?{restaurantId:stop.restaurantId}:{})});
 }
 for(const mode of [2,3,4]){
  const days=input.plans[mode];if(!Array.isArray(days)||days.length!==mode)continue;
  out.plans[mode]=days.map(day=>Array.isArray(day)?day.slice(0,25).filter(s=>s&&typeof s.name==='string').map(s=>({
   uid:uid(),...sanitizeStopFields(s),
   ...(validIds.has(s.foodId)?{foodId:s.foodId}:validRestaurantId(s.restaurantId)?{restaurantId:s.restaurantId}:{}),
   ...(wishStopIds.has(s.wishStopId)?{wishStopId:s.wishStopId}:{})
  })):[]);
 }
 for(const mode of [2,3,4])for(const day of out.plans[mode])for(const stop of day)if(stop.foodId&&!validIds.has(stop.foodId))delete stop.foodId;
 return out;
}
let state=DEFAULT(),activeDay=0,filter={taste:'all',region:'all',category:'all',query:'',expanded:false},pendingFood=null,pendingRestaurant=null,pendingWishStopId=null;
let imported=false;
try{
 const saved=localStorage.getItem(STORAGE);
 if(saved)state=sanitize(JSON.parse(saved));
 if(location.hash.startsWith('#plan=')){
  const shared=JSON.parse(decodeURIComponent(location.hash.slice(6)));
  state=sanitize({...shared,eaten:state.eaten,tastedRatings:state.tastedRatings});
  imported=true;
  history.replaceState(null,'',location.pathname+location.search+'#planner');
 }
}catch(e){state=DEFAULT();setTimeout(()=>toast('这份记录未能读取，已打开参考行程。'),500);}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function persist(){
 try{localStorage.setItem(STORAGE,JSON.stringify(state));$('save-state').textContent='本机自动保存';}
 catch(e){$('save-state').textContent='请分享链接保存计划';return;}
}
function decorate(root=document){root.querySelectorAll('[data-icon]').forEach(node=>{node.innerHTML=icon(node.dataset.icon);});}
function renderFood(){renderCatalog();renderRestaurants();}
const days=()=>state.plans[state.mode];
const current=()=>days()[activeDay];
function placedDay(id){return days().findIndex(day=>day.some(s=>s.foodId===id));}
function wishItem(id,name,region,day,saved=false){
 const action=saved?'schedule-wish-stop':'schedule';
 const remove=saved?'unwish-stop':'unwish';
 return `<div class="wish-item"><div><strong>${esc(name)}</strong><small>${esc(region)} · ${day>=0?'已排在第 '+(day+1)+' 天':'等待安排时间'}</small></div><button data-${action}="${esc(id)}" aria-label="${day>=0?'修改':'安排'}${esc(name)}">${day>=0?icon('check')+' 已安排':'+ 安排'}</button><button class="wish-remove" data-${remove}="${esc(id)}" aria-label="移出想吃清单：${esc(name)}">${icon('x')}</button></div>`;
}
function renderWish(){
 const count=state.wish.length+state.wishStops.length;
 $('wish-count').textContent=count;$('nav-count').textContent=count;$('mobile-count').textContent=count;
 const foods=state.wish.map(id=>{const f=foodById(id);return wishItem(id,f.name,f.region,placedDay(id));});
 const places=state.wishStops.map(stop=>wishItem(stop.uid,stop.name,stop.region,days().findIndex(day=>day.some(s=>s.wishStopId===stop.uid)),true));
 $('wish-list').innerHTML=count?[...foods,...places].join(''):'<p class="wish-empty">还没选好？去美食图鉴里挑几样吧。</p>';
}
function dateLabel(index){if(!state.date)return '未指定出发日期';const date=new Date(state.date+'T12:00:00');date.setDate(date.getDate()+index);return date.toLocaleDateString(window.HaifengLanguage?.english?'en':'zh-CN',{month:'long',day:'numeric',weekday:'long'});}
function mapUrl(s){const city=s.region==='南澳'?'汕头':'汕尾',prefix=s.region==='南澳'?'南澳':s.region==='汕尾市区'?'汕尾':s.region==='红海湾'?'汕尾红海湾':'海丰';const q=s.address||(prefix+' '+(s.shop||s.name));return 'https://uri.amap.com/search?keyword='+encodeURIComponent(q)+'&city='+encodeURIComponent(city)+'&view=map&src=haifengslow';}
function listConflicts(list){const issues=[];list.forEach((s,i)=>{const finish=minutes(s.time)+s.duration;if(finish>=1440)issues.push(`${s.name}结束时间跨到次日`);if(i&&minutes(s.time)<minutes(list[i-1].time)+list[i-1].duration+s.buffer)issues.push(`${s.name}前的时间不足`);});return issues;}
function timelineMarkup(list,readonly=false){
 if(!list.length)return '<div class="empty-day">这一天还留着空白。<br>从想吃清单安排一站，或补上朋友推荐的小店。</div>';
 return list.map((s,i)=>{
  let transfer='';if(i){const previous=list[i-1],gap=minutes(s.time)-minutes(previous.time)-previous.duration,conflict=gap<s.buffer;transfer=`<div class="transfer ${conflict?'conflict':''}">${icon('arrow')}预留 ${readonly?esc(s.buffer):`<input type="number" min="0" max="180" step="5" value="${s.buffer}" data-buffer="${s.uid}" aria-label="${esc(s.name)}之前的转场分钟">`} 分钟转场${conflict?' · 时间不足':''}</div>`;}
  return `${transfer}<div class="timeline-stop"><div class="stop-time">${readonly?esc(s.time):`<input type="time" value="${esc(s.time)}" data-time="${s.uid}" aria-label="${esc(s.name)}开始时间" required>`}</div><article class="stop-card ${s.foodId?'food-stop':''}"><div class="stop-top"><h4>${esc(s.name)}</h4><span class="stop-region">${esc(s.region)}</span></div>${s.shop||s.address?`<p class="stop-shop">${esc([s.shop,s.address].filter(Boolean).join(' · '))}</p>`:`<p class="stop-shop">${s.foodId?'店名待补充 · 点击铅笔填写':'按你的喜好慢慢走'}</p>`}<div class="stop-detail"><label>${icon('clock')}停留 ${readonly?esc(s.duration):`<input type="number" min="10" max="480" step="5" value="${s.duration}" data-duration="${s.uid}" aria-label="${esc(s.name)}停留分钟">`} 分钟</label><a href="${esc(mapUrl(s))}" target="_blank" rel="noopener noreferrer" aria-label="在地图中搜索${esc(s.name)}">${icon('pin')}${s.address?'地图':'地图搜索'}</a>${readonly?(s.fixedTime?'<span class="fixed-time-print">固定时间</span>':''):`<label class="stop-fixed-time"><input type="checkbox" data-fixed-time="${s.uid}" ${s.fixedTime?'checked':''} aria-label="顺路时固定${esc(s.name)}的开始时间">顺路时固定</label><div class="stop-tools"><button data-move="${s.uid}" data-dir="-1" ${i===0?'disabled':''} aria-label="上移${esc(s.name)}">${icon('up')}</button><button data-move="${s.uid}" data-dir="1" ${i===list.length-1?'disabled':''} aria-label="下移${esc(s.name)}">${icon('down')}</button><button data-edit="${s.uid}" aria-label="编辑${esc(s.name)}">${icon('edit')}</button><button data-remove="${s.uid}" aria-label="从行程移除${esc(s.name)}">${icon('trash')}</button></div>`}</div></article></div>`;
 }).join('');
}
function renderPlanner(){
 activeDay=Math.min(activeDay,state.mode-1);
 document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.mode)===state.mode);b.setAttribute('aria-pressed',String(Number(b.dataset.mode)===state.mode));});
 $('trip-date').value=state.date;$('transport').value=state.transport;
 $('day-tabs').innerHTML=days().map((_,i)=>`<button role="tab" aria-selected="${i===activeDay}" aria-controls="timeline" data-day="${i}" id="day-tab-${i}" tabindex="${i===activeDay?'0':'-1'}"><strong>DAY ${String(i+1).padStart(2,'0')}</strong>${dayNames()[i]}</button>`).join('');
 $('timeline').setAttribute('role','tabpanel');$('timeline').setAttribute('aria-labelledby','day-tab-'+activeDay);
 $('day-title').textContent=`第 ${activeDay+1} 天 · ${dayNames()[activeDay]}`;
 $('day-subtitle').textContent=dateLabel(activeDay)+(state.mode>=3&&state.variant==='nanao'&&activeDay>0?' · 南澳岛行程，预留上岛与返程时间':' · 以海丰县城为起点，按自己的节奏来');
 $('timeline').innerHTML=timelineMarkup(current());
 const conflicts=listConflicts(current());$('day-warning').hidden=!conflicts.length;
 $('day-warning').textContent=conflicts.length?`${conflicts.length} 处时间需要调整：${conflicts.slice(0,2).join('；')}。可手动改时间，或点击「顺着排好时间」。`:'';
 const count=current().length,end=count?Math.max(...current().map(s=>minutes(s.time)+s.duration)):0;
 $('day-summary').innerHTML=`<span>今天安排 <strong>${count} 站</strong>，记得给临时发现的小店留点空白。</span><strong>${count?'预计结束 '+timeLabel(end):'自由安排'}</strong>`;
 renderWish();renderPrint();if(typeof renderRouteOrderControls==='function')renderRouteOrderControls();
}
function renderPrint(){
 document.querySelectorAll('.print-day,.print-note').forEach(n=>n.remove());
 days().forEach((list,i)=>{const el=document.createElement('section');el.className='print-day';el.innerHTML=`<div class="day-heading"><div><h3>第 ${i+1} 天 · ${dayNames()[i]}</h3><p>${esc(dateLabel(i))}</p></div></div>${timelineMarkup(list,true)}`;$('planner').append(el);});
 const note=document.createElement('p');note.className='print-note';note.style.display='none';note.textContent='行程时间与转场为参考安排。出行前请核对营业时间、景区开放与实际交通。';$('planner').append(note);
}
function refresh(){persist();renderAreaGuide();renderSeafoodGuide();renderFood();renderTastedLog();renderPlanner();if(typeof renderSights==='function')renderSights();}
function toggleWish(id){
 if(!foodById(id))return;
 if(state.wish.includes(id)){state.wish=state.wish.filter(x=>x!==id);toast('已移出想吃清单；行程里的安排会保留。');}
 else{state.wish.push(id);toast('已加入想吃清单，去「我的行程」安排时间。');}
 refresh();
}
function switchMode(mode,scroll=false){
 if(![2,3,4].includes(mode))return;
 if(scroll)state.planOptions[mode]={variant:mode===2?'haifeng':mode===4?'nanao':state.variant,departure:state.departure==='14:00'?'14:00':'12:00'};
 state.mode=mode;state.variant=state.planOptions[mode].variant;state.departure=state.planOptions[mode].departure;
 activeDay=0;persist();renderPlanner();if(scroll)$('planner').scrollIntoView({behavior:'smooth'});
}
function suggestTime(dayIndex,region){
 const list=days()[dayIndex];if(!list.length)return '10:00';
 const same=list.filter(s=>s.region===region);
 const prev=same.at(-1)||list.at(-1);const end=minutes(prev.time)+prev.duration+30;
 return inputTime(end>1320?1080:end);
}
function editRestaurantRegion(){
 const address=$('edit-address').value.trim();
 const fallback=address===pendingRestaurant.address?pendingRestaurant.region:'';
 const region=restaurantRegionAt(address,fallback);
 $('edit-restaurant-region').value=region==='县城'?'海丰县城':region;
 return region;
}
function showMealStart(){
 $('edit-meal-time-hint').textContent='行程开始 '+$('edit-time').value;
}
function updateEditorSaveLabel(){
 $('edit-save-label').textContent=$('edit-day').value==='undecided'?'加入想吃清单':'保存到我的行程';
}
function openEditor(stopToEdit=null,food=null,restaurant=null,{allowUndecided=false,wishStop=null}={}){
 if(restaurant&&!stopToEdit&&!wishStop){
  wishStop=state.wishStops.find(stop=>stop.restaurantId===restaurant.id);
  if(wishStop)stopToEdit=days().flat().find(stop=>stop.wishStopId===wishStop.uid);
 }
 const saved=stopToEdit||wishStop;
 pendingWishStopId=wishStop?.uid||stopToEdit?.wishStopId||null;
 pendingFood=food?.id||saved?.foodId||null;
 restaurant=restaurant||restaurantForStop(saved);
 const restaurantId=restaurant?.id||saved?.restaurantId;
 const address=restaurantId?(saved?.address??restaurant?.address??''):(saved?.address||food?.address||'');
 const region=saved?.region||restaurant?.region||food?.region||'县城';
 pendingRestaurant=restaurantId?{id:restaurantId,address,region:restaurant?.address===address?restaurant.region:region}:null;
 $('edit-heading').textContent=pendingRestaurant?'给这顿大餐留点时间':stopToEdit?'把这一站安排妥当':food?'把这口味道排进旅程':'补一间小店 / 一个地点';
 $('edit-description').textContent=restaurant?.dishes||(food?food.desc:'填上真实店名和位置，方便自己和朋友找路。');
 const dayOptions=days().map((_,i)=>`<option value="${i}">第 ${i+1} 天 · ${dayNames()[i]}</option>`).join('');
 const canDefer=allowUndecided||pendingRestaurant||pendingWishStopId;
 $('edit-day').innerHTML=dayOptions+(canDefer?'<option value="undecided">还没想好</option>':'');
 const dayIndex=stopToEdit?days().findIndex(day=>day.includes(stopToEdit)):activeDay;
 $('edit-id').value=stopToEdit?.uid||'';$('edit-name').value=saved?.name||restaurant?.name||food?.name||'';
 $('edit-shop').value=restaurantId?(saved?.shop??restaurant?.name??''):(saved?.shop||food?.shop||'');$('edit-address').value=address;
 const isMeal=!!pendingRestaurant;
 $('edit-region-field').hidden=isMeal;$('edit-region').disabled=isMeal;
 $('edit-restaurant-region-field').hidden=!isMeal;
 $('edit-time-field').hidden=isMeal;$('edit-meal-field').hidden=!isMeal;$('edit-meal').disabled=!isMeal;
 if(isMeal)editRestaurantRegion();
 else{ensureStopRegionOptions(region);$('edit-region').value=region;}
 $('edit-day').value=wishStop&&!stopToEdit?'undecided':dayIndex;
 updateEditorSaveLabel();
 const time=saved?.time||(isMeal?'12:00':suggestTime(dayIndex,region));
 $('edit-time').value=time;
 if(isMeal){
  $('edit-meal').value=time<'10:30'?'08:00':time<'16:00'?'12:00':'18:00';
  showMealStart();
 }
 $('edit-duration').value=saved?.duration||restaurant?.duration||food?.duration||45;
 $('edit-fixed-time').checked=saved?.fixedTime??(isMeal||defaultFixedTime(food?.name||''));
 $('edit-dialog').showModal();
}
function showInfo(title,content){$('info-heading').textContent=title;$('info-content').innerHTML=content;$('info-dialog').showModal();$('info-dialog').scrollTop=0;}
function nudge(list){let shifted=0;for(let i=1;i<list.length;i++){const earliest=minutes(list[i-1].time)+list[i-1].duration+list[i].buffer;if(minutes(list[i].time)<earliest){list[i].time=inputTime(earliest);shifted++;}}return shifted;}
function sharePlan(){
 const {version,mode,date,transport,wish,wishStops,variant,departure,planOptions}=state;
 const plans={[mode]:days().map(day=>day.map(({uid:unused,...stop})=>stop))};
 return sharePlanLink({version,mode,date,transport,wish,wishStops,variant,departure,planOptions,plans});
}
async function sharePlanLink(payload){
 const language=window.HaifengLanguage?.english?'?lang=en':'';
 const link=location.href.split(/[?#]/)[0]+language+'#plan='+encodeURIComponent(JSON.stringify(payload));
 try{await navigator.clipboard.writeText(link);toast('行程链接已复制。朋友打开后可修改自己的副本。');}
 catch(e){showInfo('分享你的海丰小旅行','<div class="info-body"><p>复制下面的链接发给朋友。打开的是当前计划副本，彼此修改不会互相覆盖。</p><label>行程链接<input id="share-link-field" class="share-input" readonly></label><button class="button primary" id="copy-share-fallback">复制链接</button></div>');$('share-link-field').value=link;$('copy-share-fallback').onclick=()=>{$('share-link-field').select();document.execCommand('copy');toast('已复制行程链接。');};}
}
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-close')){b.closest('dialog').close();return;}
 if(b.dataset.wish){toggleWish(b.dataset.wish);return;}
 if(b.dataset.unwish){toggleWish(b.dataset.unwish);return;}
 if(b.dataset.scheduleWishStop){
  const wishStop=state.wishStops.find(stop=>stop.uid===b.dataset.scheduleWishStop);
  if(wishStop)openEditor(days().flat().find(stop=>stop.wishStopId===wishStop.uid),null,null,{wishStop});
  return;
 }
 if(b.dataset.unwishStop){
  const id=b.dataset.unwishStop;
  state.wishStops=state.wishStops.filter(stop=>stop.uid!==id);
  for(const plan of Object.values(state.plans))for(const day of plan)for(const stop of day)if(stop.wishStopId===id)delete stop.wishStopId;
  refresh();toast('已移出想吃清单。');
  return;
 }
 if(b.dataset.taste){filter.taste=b.dataset.taste;filter.expanded=false;renderFood();return;}
 if(b.dataset.detail){detailFood(b.dataset.detail);return;}
 if(b.dataset.mode){switchMode(Number(b.dataset.mode));return;}
 if(b.dataset.useRoute){chooseLegacyRoute(Number(b.dataset.useRoute),b.dataset.variant||'shanwei',b.dataset.departure||'12:00');return;}
 if(b.dataset.day!==undefined){activeDay=Number(b.dataset.day);renderPlanner();$('day-tab-'+activeDay).focus({preventScroll:true});return;}
 if(b.dataset.schedule){const id=b.dataset.schedule;const dayIndex=placedDay(id);if(dayIndex>=0)openEditor(days()[dayIndex].find(s=>s.foodId===id));else openEditor(null,foodById(id));return;}
 if(b.dataset.detailAdd){const id=b.dataset.detailAdd;$('info-dialog').close();if(!state.wish.includes(id)){state.wish.push(id);refresh();}const dayIndex=placedDay(id);openEditor(dayIndex>=0?days()[dayIndex].find(s=>s.foodId===id):null,foodById(id));return;}
 if(b.dataset.edit){openEditor(current().find(s=>s.uid===b.dataset.edit));return;}
 if(b.dataset.remove){days()[activeDay]=current().filter(s=>s.uid!==b.dataset.remove);persist();renderPlanner();toast('已移除这一站，想吃清单会保留。');return;}
 if(b.dataset.move){const list=current(),i=list.findIndex(s=>s.uid===b.dataset.move),target=i+Number(b.dataset.dir);if(target<0||target>=list.length)return;const times=list.map(s=>s.time);[list[i],list[target]]=[list[target],list[i]];list.forEach((s,j)=>s.time=times[j]);nudge(list);persist();renderPlanner();return;}
});
document.addEventListener('change',event=>{
 const el=event.target;let item;if(el.dataset.fixedTime){item=current().find(s=>s.uid===el.dataset.fixedTime);if(item){item.fixedTime=el.checked;persist();renderPlanner();}return;}if(el.dataset.time||el.dataset.duration||el.dataset.buffer){const id=el.dataset.time||el.dataset.duration||el.dataset.buffer;item=current().find(s=>s.uid===id);if(!item)return;
  if(el.dataset.time){if(!el.value){el.value=item.time;return;}item.time=el.value;}
  if(el.dataset.duration)item.duration=Math.min(480,Math.max(10,Number(el.value)||30));
  if(el.dataset.buffer)item.buffer=Math.min(180,Math.max(0,Number(el.value)||0));
  persist();renderPlanner();return;
 }
});
$('food-search').addEventListener('input',e=>{filter.query=e.target.value.trim();filter.expanded=false;renderFood();});
$('region-filter').onchange=e=>{filter.region=e.target.value;filter.expanded=false;renderFood();};
$('category-filter').onchange=e=>{filter.category=e.target.value;filter.expanded=false;renderFood();};
$('more-food').onclick=()=>{filter.expanded=!filter.expanded;renderFood();};
$('trip-date').onchange=e=>{state.date=e.target.value;persist();renderPlanner();};
$('transport').onchange=e=>{state.transport=e.target.value;persist();if(state.transport==='taxi')toast('打车时间未实时估算；跨片区请提前约车，并调整转场预留。');};
$('auto-arrange').onclick=()=>{const shifted=nudge(current());persist();renderPlanner();toast(shifted?`已顺延 ${shifted} 站，并保留原有空闲时间。`:'时间已经排好，现有空闲时间会保留。');};
$('add-custom').onclick=()=>openEditor(null,null,null,{allowUndecided:true});
$('edit-day').onchange=updateEditorSaveLabel;
$('edit-address').oninput=()=>{if(pendingRestaurant)editRestaurantRegion();};
$('edit-meal').onchange=event=>{
 $('edit-time').value=event.target.value;
 showMealStart();
};
$('edit-form').onsubmit=event=>{
 event.preventDefault();const form=$('edit-form');if(!form.reportValidity())return;
 const name=$('edit-name').value.trim();if(!name){$('edit-name').setCustomValidity('请填写名称');$('edit-name').reportValidity();return;}
 $('edit-name').setCustomValidity('');
 const id=$('edit-id').value,day=$('edit-day').value;
 const undecided=day==='undecided',dayIndex=Number(day),target=undecided?null:days()[dayIndex];
 if(!undecided&&!target)return;
 const old=days().flat().find(s=>s.uid===id);
 if(target&&target.length>=25&&!target.includes(old)){toast('这一天已有 25 站，留一点时间慢慢吃吧。');return;}
 if(undecided&&!pendingWishStopId&&state.wishStops.length>=100){toast('想吃清单已有 100 个自选饭店或地点。');return;}
 const wishIndex=state.wishStops.findIndex(stop=>stop.uid===pendingWishStopId);
 const details={
  name,shop:$('edit-shop').value.trim(),address:$('edit-address').value.trim(),
  region:pendingRestaurant?editRestaurantRegion():$('edit-region').value,time:$('edit-time').value,
  duration:Number($('edit-duration').value),buffer:old?.buffer??state.wishStops[wishIndex]?.buffer??20,fixedTime:$('edit-fixed-time').checked
 };
 if(pendingRestaurant)details.restaurantId=pendingRestaurant.id;
 let wishStopId=pendingWishStopId;
 if(undecided||wishStopId){
  wishStopId=wishStopId||'wish-stop-'+uid();
  const saved={uid:wishStopId,...details};
  if(wishIndex<0)state.wishStops.push(saved);
  else state.wishStops[wishIndex]=saved;
 }
 if(old)state.plans[state.mode]=days().map(list=>list.filter(stop=>stop.uid!==id));
 if(!undecided){
  days()[dayIndex].push({uid:id||uid(),...details,...(pendingFood?{foodId:pendingFood}:{}),...(wishStopId?{wishStopId}:{})});
  days()[dayIndex].sort((a,b)=>minutes(a.time)-minutes(b.time));
  if(pendingFood&&!state.wish.includes(pendingFood))state.wish.push(pendingFood);
  activeDay=dayIndex;
 }
 $('edit-dialog').close();refresh();toast(undecided?'已加入想吃清单，想好日期后再安排。':'已保存这一站。');
};
$('edit-name').oninput=()=>$('edit-name').setCustomValidity('');
$('share-plan').onclick=sharePlan;
$('print-plan').onclick=()=>{renderPrint();window.print();};
$('reset-plan').onclick=()=>showInfo('恢复这条路线的参考安排？',`<div class="info-body"><p>会替换当前${state.mode===2?'两天一夜':state.mode===4?'四天三夜':'三天两夜'}路线里填写的小店、时间和地点。想吃清单与其他天数的行程会保留。</p><button class="button primary" id="confirm-reset">恢复参考安排</button></div>`);
$('info-dialog').addEventListener('click',e=>{if(e.target.id==='confirm-reset'){state.plans[state.mode]=template(state.mode,state.variant,state.departure);for(const day of state.plans[state.mode])for(const stop of day)if(stop.foodId&&!foodById(stop.foodId))delete stop.foodId;activeDay=0;$('info-dialog').close();refresh();toast('已恢复当前路线示例。');}});
$('sources-button').onclick=()=>showInfo('内容与图片来源',`<div class="info-body"><p>以海丰为起点，汕尾与南澳的延伸路线分别标明。美食片区标签用于寻味，具体路线由你选择的小店地址决定。</p><ol class="source-list"><li><a href="${foodSource}" target="_blank" rel="noopener noreferrer">汕尾市政府《海陆丰传统小吃》</a>：地方名称与饮食介绍，2025-02-08。</li><li><a href="${photoSource}" target="_blank" rel="noopener noreferrer">汕尾市投资促进局《小吃名片》</a>：美食参考照片与类别。</li><li><a href="https://www.shanwei.gov.cn/shanwei/swly/lysc/content/post_968560.html" target="_blank" rel="noopener noreferrer">汕尾市政府 · 高铁游玩攻略</a>：牛肉饼、小米等小吃介绍。</li><li><a href="https://www.shanwei.gov.cn/attachment/0/18/18626/701841.pdf" target="_blank" rel="noopener noreferrer">汕尾市“百道名小吃”名单</a>：公平蛋清糕。</li><li><a href="https://www.shanwei.gov.cn/shanwei/swly/lysc/content/post_1030215.html" target="_blank" rel="noopener noreferrer">汕尾市A级旅游景区信息汇总</a>：海丰红宫红场与莲花山片区。</li><li><a href="https://www.shanwei.gov.cn/swtcj/csmp/content/post_212594.html" target="_blank" rel="noopener noreferrer">汕尾市投资促进局《红宫红场》</a>：历史地标照片。</li><li><a href="https://www.shanwei.gov.cn/shanwei/zwgk/jcxx/zwdt/qxxwa/content/post_1146046.html" target="_blank" rel="noopener noreferrer">汕尾日报 / 汕尾市政府 · 大湖滨海生态旅游区</a>：景点介绍与滨海照片（沈绿洋 文/图）。</li><li><a href="https://k.sina.cn/article_6823516933_196b69b0500100pic4.html" target="_blank" rel="noopener noreferrer">《海丰美食：这几家小米》</a>：首页蒸盘小米照片，2020-06-19。</li></ol><p class="small">行程、停留时长与转场预留为本站规划建议，不代表实时车程、营业时间或已预订安排。美食图片是风味参考，未指定某家店；文字卡片未使用其他食物代图。资料整理：2026-11-05。美食六类条目参考海丰美食图鉴，水彩图为插画。</p></div>`);
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$('day-tabs').addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();activeDay=e.key==='Home'?0:e.key==='End'?state.mode-1:(activeDay+(e.key==='ArrowRight'?1:-1)+state.mode)%state.mode;renderPlanner();$('day-tab-'+activeDay).focus();}});
window.addEventListener('beforeprint',renderPrint);
decorate();persist();renderAreaGuide();renderSeafoodGuide();renderFood();renderTastedLog();renderPlanner();
if(imported)setTimeout(()=>toast('已载入朋友分享的行程副本，可以继续修改。'),500);
