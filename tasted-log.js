'use strict';

const TASTED_TIERS = {
 hang: ['夯', '专程再吃'],
 top: ['顶级', '很想二刷'],
 elite: ['人上人', '吃着挺满意'],
 npc: ['NPC', '路过可以吃'],
 la: ['拉', '下次先略过'],
};
let openTastedRating = '';

function sanitizeTastedRatings(value, eaten) {
 const entries = eaten.filter(id => typeof value?.[id] === 'string' && Object.hasOwn(TASTED_TIERS, value[id]));
 return Object.fromEntries(entries.map(id => [id, value[id]]));
}

function tastedFoods() {
 return state.eaten.map(foodById).filter(Boolean).reverse();
}

function renderTastedLog() {
 const foods = tastedFoods();
 const list = $('tasted-list');
 $('tasted-count').textContent = foods.length;
 $('tasted-empty').hidden = foods.length > 0;
 $('tasted-shortcut').hidden = foods.length === 0;
 $('tasted-export-open').disabled = foods.length === 0;
 list.hidden = foods.length === 0;
 list.innerHTML = foods.map(food => {
  const id = esc(food.id);
  const tier = state.tastedRatings[food.id] || '';
  const open = openTastedRating === food.id;
  const options = Object.entries(TASTED_TIERS).map(([key, [label, hint]]) =>
   `<button type="button" data-tasted-tier="${key}" aria-pressed="${tier === key}" title="${hint}">${label}</button>`
  ).join('');
  return `<li data-tasted-food="${id}">
   <div class="tasted-row">
    <button type="button" class="tasted-item" data-detail="${id}">${icon('check')}<span>${esc(food.name)}</span></button>
    <button type="button" class="tasted-rate" data-tasted-rate aria-expanded="${open}" aria-controls="tasted-rating-${id}" title="给这道美食评级" data-tier="${tier}">${TASTED_TIERS[tier]?.[0] || '来打个分'}</button>
    <button type="button" class="tasted-remove" data-eaten="${id}" aria-label="撤销已吃过：${esc(food.name)}" title="撤销已吃过">${icon('x')}</button>
   </div>
   <div id="tasted-rating-${id}" class="tasted-rating-panel" role="group" aria-label="从夯到拉" ${open ? '' : 'hidden'}>
    <p>这口给几档？</p>
    <div class="tasted-rating-options">${options}</div>
    ${tier ? '<button type="button" class="tasted-clear" data-tasted-clear>清除评级</button>' : ''}
   </div>
  </li>`;
 }).join('');
}

function showTastedRating(id, open) {
 openTastedRating = open ? id : '';
 renderTastedLog();
 const row = [...$('tasted-list').children].find(item => item.dataset.tastedFood === id);
 const target = open
  ? row?.querySelector('[aria-pressed="true"]') || row?.querySelector('[data-tasted-tier]')
  : row?.querySelector('[data-tasted-rate]');
 target?.focus({preventScroll: true});
}

function postcardDate() {
 const parts = new Intl.DateTimeFormat('en', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai',
 }).formatToParts(new Date());
 const date = Object.fromEntries(parts.map(({type, value}) => [type, value]));
 return [date.year, date.month, date.day].join('-');
}

document.addEventListener('DOMContentLoaded', () => {
 const list = $('tasted-list');
 list.addEventListener('click', event => {
  const button = event.target.closest('button');
  const id = button?.closest('[data-tasted-food]')?.dataset.tastedFood;
  if (!id || !state.eaten.includes(id)) return;
  if (button.hasAttribute('data-tasted-rate')) {
   showTastedRating(id, openTastedRating !== id);
   return;
  }
  const tier = button.dataset.tastedTier;
  if (Object.hasOwn(TASTED_TIERS, tier)) state.tastedRatings[id] = tier;
  else if (button.hasAttribute('data-tasted-clear')) delete state.tastedRatings[id];
  else return;
  persist();
  showTastedRating(id, false);
 });
 list.addEventListener('keydown', event => {
  const id = event.target.closest('[data-tasted-food]')?.dataset.tastedFood;
  if (event.key === 'Escape' && id && openTastedRating === id) showTastedRating(id, false);
 });

 const dialog = $('tasted-export-dialog');
 const date = $('tasted-export-date');
 const photoFile = $('tasted-export-photo');
 const preview = $('tasted-export-preview');
 const photoRemove = $('tasted-export-remove-photo');
 const status = $('tasted-export-status');
 const pdfButton = $('tasted-export-pdf');
 const imageButton = $('tasted-export-image');
 const prev = $('tasted-export-prev');
 const next = $('tasted-export-next');
 let photo = null, photoRequest = 0, canvases = [], page = 0, saving = false, loadingPhoto = false;

 function renderPage() {
  const canvas = canvases[page];
  if (preview.firstElementChild !== (canvas || null)) preview.replaceChildren(...(canvas ? [canvas] : []));
  $('tasted-export-pages').hidden = canvases.length < 2;
  $('tasted-export-page-number').textContent = (page + 1) + ' / ' + canvases.length;
  prev.disabled = page === 0;
  next.disabled = page >= canvases.length - 1;
  pdfButton.disabled = imageButton.disabled = !canvas || saving || loadingPhoto;
 }

 function generate(resetPage = false) {
  if (!dialog.open) return;
  try {
   const language = window.HaifengLanguage;
   const entries = tastedFoods().map(food => ({
    name: language?.translate(food.name) || food.name,
    tier: state.tastedRatings[food.id] || '',
   }));
   canvases = window.TastedPostcard.render({entries, date: date.value || postcardDate(), photo, english: !!language?.english});
   page = resetPage ? 0 : Math.min(page, canvases.length - 1);
  } catch {
   canvases = [];
   page = 0;
   status.textContent = '纪念卡暂时未生成，请再试一次。';
  }
  renderPage();
 }

 function imageFromBlob(blob) {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
   const image = new Image();
   const finish = callback => {
    clearTimeout(timer);
    URL.revokeObjectURL(url);
    callback();
   };
   const timer = setTimeout(() => finish(() => reject(Error('照片读取超时，请换一张照片再试。'))), 20000);
   image.onload = () => finish(() => resolve(image));
   image.onerror = () => finish(() => reject(Error('照片没能打开，请试试 JPG、PNG 或 WebP。')));
   image.src = url;
  });
 }

 async function postcardPhoto(file) {
  if (file.size > 20 * 1024 * 1024) throw Error('照片超过 20 MB，请换一张较小的照片。');
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  const webp = ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  const heif = ascii(4, 8) === 'ftyp' && /heic|heix|hevc|hevx|mif1|msf1|avif|avis/.test(ascii(8, 32));
  if (!(jpeg || png || webp || heif)) throw Error('请使用 JPG、PNG、WebP 或手机相册里的照片。');

  const image = await imageFromBlob(file);
  const {naturalWidth: width, naturalHeight: height} = image;
  if (width * height > 90000000) throw Error('这张照片尺寸过大，请换一张较小的照片。');

  const scale = Math.min(1, 1280 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw Error('当前浏览器无法处理照片。');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
 }

 function saveFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  dialog.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
 }

 async function download(extension) {
  if (saving || loadingPhoto || !canvases[page]) return;
  const pages = canvases;
  const currentPage = page;
  const name = window.HaifengLanguage?.english ? 'haifeng-tasting-card' : '海丰吃货纪念卡';
  const suffix = extension === 'png' && pages.length > 1 ? '-' + (currentPage + 1) : '';
  const filename = name + '-' + (date.value || postcardDate()) + suffix + '.' + extension;
  saving = true;
  status.textContent = '';
  renderPage();
  try {
   const blob = extension === 'pdf' ? await window.TastedPostcard.pdf(pages)
    : await new Promise(resolve => pages[currentPage].toBlob(resolve, 'image/png'));
   if (!blob) throw Error('empty export');
   saveFile(blob, filename);
  } catch {
   status.textContent = '这次未能导出纪念卡，请重试。';
  } finally {
   saving = false;
   renderPage();
  }
 }

 $('tasted-export-open').onclick = () => {
  if (!tastedFoods().length) return;
  date.value ||= postcardDate();
  status.textContent = '';
  dialog.showModal();
  generate(true);
 };
 date.onchange = () => generate();
 $('tasted-export-add-photo').onclick = () => photoFile.click();
 prev.onclick = () => { page -= 1; renderPage(); };
 next.onclick = () => { page += 1; renderPage(); };
 photoFile.onchange = async () => {
  const file = photoFile.files?.[0];
  photoFile.value = '';
  if (!file) return;
  const request = ++photoRequest;
  loadingPhoto = true;
  status.textContent = '正在放入照片…';
  renderPage();
  try {
   const image = await postcardPhoto(file);
   if (request !== photoRequest) return;
   photo = image;
   photoRemove.hidden = false;
   status.textContent = '';
  } catch (error) {
   if (request === photoRequest) status.textContent = error.message || '照片没能打开，请试试 JPG、PNG 或 WebP。';
  } finally {
   if (request === photoRequest) {
    loadingPhoto = false;
    generate(true);
   }
  }
 };
 photoRemove.onclick = () => {
  photoRequest += 1;
  photo = null;
  loadingPhoto = false;
  photoRemove.hidden = true;
  status.textContent = '';
  generate(true);
 };
 pdfButton.onclick = () => void download('pdf');
 imageButton.onclick = () => void download('png');
});
