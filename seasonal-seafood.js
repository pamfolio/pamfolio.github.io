'use strict';

const seafoodData = window.SEAFOOD_CALENDAR_DATA;
const seafoodCopyDefaults = {
 eyebrow: 'A SEAFOOD CALENDAR',
 heading: '把海风端上餐桌',
 intro: '来海丰，给海鲜留一顿。先看看这个月有什么值得留意，再到店里挑几样当天的好货，一桌就有鲜甜、脆嫩和热乎乎的滋味。',
 calendarSeparator: '｜',
 calendarHeading: '海丰全年海鲜月历',
 calendarIntro: '选你到海丰的公历月份，先看时令，再从当天货色里搭几样。点开卡片，看看这口鲜怎么吃。',
 priorityHeading: '这个月先留意',
 marketHeading: '当天有好货就点',
 menuHeading: '点菜参考',
 closing: '',
 sourceHeading: '资料来源与时令说明',
 sourceNote: seafoodData.sourceNote
};

let activeSeafoodMonth = Number(new Intl.DateTimeFormat('en', {month: 'numeric', timeZone: 'Asia/Shanghai'}).format(new Date()));
let renderedSeafoodMonth = 0;

function seafoodMenu(title, menu, question) {
 if (!menu && !question) return '';
 const items = menu.split('\n').filter(line => line.trim());
 return `<div class="seafood-menu">
  <h5>${esc(title)}</h5>
  ${items.length ? `<ul>${items.map(line => `<li>${esc(line)}</li>`).join('')}</ul>` : ''}
  ${question ? `<p class="seafood-market-question"><strong>到店可以问一句</strong><span>“${esc(question)}”</span></p>` : ''}
 </div>`;
}

function seafoodCardMarkup(card, ordinal, open, group) {
 const image = seafoodLineArt(card.art);
 return `<details class="seafood-guide-card" data-seafood-tier="${group}" data-seafood-card="${esc(card.id)}"${open ? ' open' : ''}>
  <summary class="seafood-card-summary">
   <span class="seafood-card-art">${image}<span aria-hidden="true">${String(ordinal).padStart(2, '0')}</span></span>
   <span class="seafood-card-tag">${esc(card.tag)}</span>
   <span class="seafood-card-name">${esc(card.name)}</span>
   <span class="seafood-card-toggle">${icon('down')}<span>介绍与做法</span></span>
  </summary>
  <div class="seafood-card-content">
   ${card.verse ? `<p class="seafood-card-verse">${esc(card.verse)}</p>` : ''}
   <p class="seafood-card-body">${esc(card.body)}</p>
   ${card.prep ? `<div class="seafood-card-prep">${icon('bowl')}<span>${esc(card.prep)}</span></div>` : ''}
  </div>
 </details>`;
}

function renderSeafoodMonth() {
 const {cards, months} = seafoodData;
 const copy = seafoodCopyDefaults;
 const month = months[activeSeafoodMonth - 1];
 const monthName = activeSeafoodMonth + '月';
 const cardsById = new Map(cards.map(card => [card.id, card]));
 const panel = $('seafood-month-panel');
 const select = $('seafood-month-select');
 if (!select.options.length) {
  select.innerHTML = months.map((_, index) => `<option value="${index + 1}">${index + 1}月</option>`).join('');
 }
 select.value = activeSeafoodMonth;
 $('seafood-guide-calendarHeading').textContent = copy.calendarHeading
  ? [month.season, copy.calendarSeparator, copy.calendarHeading].filter(Boolean).join(' ')
  : month.season;
 const open = new Set(renderedSeafoodMonth === activeSeafoodMonth ?
  [...panel.querySelectorAll('[data-seafood-card][open]')].map(card => card.dataset.seafoodCard) :
  [month.priority[0] || month.market[0]]);
 const groups = [
  {tier: 'priority', title: copy.priorityHeading, ids: month.priority},
  {tier: 'market', title: copy.marketHeading, ids: month.market}
 ].filter(group => group.ids.length);
 let ordinal = 0;
 const picks = groups.map(({tier, title, ids}) => `<div class="seafood-pick-group" data-seafood-tier="${tier}">
  <h5>${esc(title)}</h5>
  <div class="seafood-pick-list">${ids.map(id =>
   `<button type="button" class="seafood-chip" data-seafood-pick="${esc(id)}">${esc(cardsById.get(id).name)}</button>`
  ).join('')}</div>
 </div>`).join('');
 const cardGroups = groups.map(({tier, title, ids}) => `<div class="seafood-card-group" data-seafood-tier="${tier}">
  <div class="seafood-group-head"><h5>${esc(title)}</h5><span>${ids.length} 味</span></div>
  <div class="seafood-guide-grid">${ids.map(id => seafoodCardMarkup(cardsById.get(id), ++ordinal, open.has(id), tier)).join('')}</div>
 </div>`).join('');
 panel.innerHTML = `<div class="seafood-month-brief">
  <h5 id="seafood-month-heading">${monthName} ${esc(month.label)}</h5>
  <p class="seafood-panel-intro">${esc(month.intro)}</p>
  ${picks ? `<div class="seafood-month-picks">${picks}</div>` : ''}
  ${seafoodMenu(copy.menuHeading, month.menu, month.question)}
 </div>
 ${cardGroups || '<p class="muted">这个月还没有放入海鲜卡片。</p>'}`;
 renderedSeafoodMonth = activeSeafoodMonth;
}

function renderSeafoodGuide() {
 const copy = seafoodCopyDefaults;
 const {sources} = seafoodData;
 for (const [key, value] of Object.entries(copy)) {
  if (key === 'calendarHeading' || key === 'calendarSeparator') continue;
  const node = $('seafood-guide-' + key);
  if (node) {
   node.textContent = value;
   node.hidden = !value;
  }
 }
 $('seafood-source-links').innerHTML = sources.map(row => `<li><a href="${esc(row.url)}" target="_blank" rel="noopener noreferrer">${esc(row.label)} ↗</a></li>`).join('');
 renderSeafoodMonth();
}

function openSeafoodPick(id) {
 const card = [...$('seafood-month-panel').querySelectorAll('[data-seafood-card]')]
  .find(node => node.dataset.seafoodCard === id);
 if (!card) return;
 card.open = true;
 card.querySelector('summary').focus({preventScroll: true});
 card.scrollIntoView({block: 'start'});
}

document.addEventListener('DOMContentLoaded', () => {
 $('seafood-month-select').onchange = event => {
  activeSeafoodMonth = Number(event.target.value);
  renderSeafoodMonth();
  $('seafood-month-status').textContent = $('seafood-month-heading').textContent;
 };
 $('seasonal-seafood').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button?.dataset.seafoodPick) {
   openSeafoodPick(button.dataset.seafoodPick);
  }
 });
});
