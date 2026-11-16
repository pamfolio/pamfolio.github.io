'use strict';

window.TastedPostcard = (() => {
 const width = 900;
 const height = 1260;
 const paper = '#fff8e9';
 const ink = '#303b32';
 const rust = '#a64c34';
 const muted = '#766e60';
 const serif = '"Noto Serif CJK SC","Songti SC","STSong","SimSun",Georgia,serif';
 const sans = '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
 const tiers = {
  hang: ['夯', 'S-Tier', '#f3d9c9', '#943d2a'],
  top: ['顶级', 'Top Tier', '#f6e4bb', '#79551f'],
  elite: ['人上人', 'Solid', '#e6ead6', '#435538'],
  npc: ['NPC', 'NPC', '#ece7dd', '#61584b'],
  la: ['拉', 'Flop', '#f0dedf', '#7a404b'],
  unrated: ['未评级', 'Unrated', '#f0eadf', '#6c6458'],
 };

 function type(ctx, size, face = sans, weight = 400) {
  ctx.font = weight + ' ' + size + 'px ' + face;
 }

 function text(ctx, value, x, y, color = ink) {
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
 }

 function tracking(ctx, value, x, y, spacing) {
  for (const character of value) {
   text(ctx, character, x, y, rust);
   x += ctx.measureText(character).width + spacing;
  }
 }

 function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
 }

 function rule(ctx, y, dashed = false) {
  ctx.strokeStyle = '#d7c7ad';
  ctx.lineWidth = 2;
  ctx.setLineDash(dashed ? [5, 8] : []);
  ctx.beginPath();
  ctx.moveTo(74, y);
  ctx.lineTo(826, y);
  ctx.stroke();
  ctx.setLineDash([]);
 }

 function wrap(ctx, value, maxWidth) {
  const parts = String(value).trim().match(/\p{Script=Han}|[^\s\p{Script=Han}]+|\s+/gu) || [];
  const lines = [];
  let line = '';
  for (const part of parts) {
   const joined = line ? line + part : part.trimStart();
   if (ctx.measureText(joined).width <= maxWidth) {
    line = joined;
    continue;
   }
   if (line.trim()) lines.push(line.trimEnd());
   line = part.trimStart();
   if (ctx.measureText(line).width <= maxWidth) continue;
   let fragment = '';
   for (const character of line) {
    if (fragment && ctx.measureText(fragment + character).width > maxWidth) {
     lines.push(fragment);
     fragment = '';
    }
    fragment += character;
   }
   line = fragment;
  }
  if (line.trim()) lines.push(line.trimEnd());
  if (lines.length <= 5) return lines;
  const last = Array.from(lines[4]);
  while (last.length && ctx.measureText(last.join('') + '…').width > maxWidth) last.pop();
  return [...lines.slice(0, 4), last.join('') + '…'];
 }

 function photoReady(photo) {
  return !!photo?.width && !!photo?.height;
 }

 function landscape(ctx, x, y, w, h) {
  ctx.fillStyle = '#f1e1c3';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#cb8056';
  ctx.beginPath();
  ctx.arc(x + w * .75, y + h * .27, h * .13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a9af91';
  ctx.beginPath();
  ctx.moveTo(x, y + h * .65);
  ctx.bezierCurveTo(x + 130, y + h * .60, x + 148, y + h * .25, x + 258, y + h * .43);
  ctx.bezierCurveTo(x + 420, y + h * .77, x + 514, y + h * .35, x + w, y + h * .49);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fill();

  ctx.fillStyle = '#778f7d';
  ctx.beginPath();
  ctx.moveTo(x, y + h * .81);
  ctx.bezierCurveTo(x + 190, y + h * .64, x + 294, y + h * .91, x + 465, y + h * .72);
  ctx.bezierCurveTo(x + 555, y + h * .61, x + 690, y + h * .71, x + w, y + h * .75);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fill();

  ctx.strokeStyle = '#ebeed9';
  ctx.lineWidth = 2;
  for (const [start, depth, length] of [[95, .85, 125], [250, .93, 108], [470, .86, 170], [600, .93, 98]]) {
   const horizon = y + h * depth;
   ctx.beginPath();
   ctx.moveTo(x + start, horizon);
   ctx.quadraticCurveTo(x + start + length / 2, horizon - 5, x + start + length, horizon);
   ctx.stroke();
  }
 }

 function cover(ctx, photo, y, h) {
  const x = 74;
  const w = 752;
  ctx.save();
  roundedRect(ctx, x, y, w, h, 17);
  ctx.clip();
  if (photoReady(photo)) {
   const scale = Math.max(w / photo.width, h / photo.height);
   const cropWidth = w / scale;
   const cropHeight = h / scale;
   ctx.drawImage(photo, (photo.width - cropWidth) / 2, (photo.height - cropHeight) / 2,
    cropWidth, cropHeight, x, y, w, h);
  } else {
   landscape(ctx, x, y, w, h);
  }
  ctx.restore();
 }

 function stamp(ctx, count, english) {
  ctx.save();
  ctx.translate(739, 173);
  ctx.rotate(-.13);
  ctx.strokeStyle = '#b97d62';
  ctx.lineWidth = 3;
  for (const radius of [69, 61]) {
   ctx.beginPath();
   ctx.arc(0, 0, radius, 0, Math.PI * 2);
   ctx.stroke();
  }
  ctx.textAlign = 'center';
  type(ctx, count > 99 ? 43 : 52, serif, 700);
  text(ctx, String(count), 0, 7, rust);
  type(ctx, 18, sans, 600);
  text(ctx, english ? 'TASTED' : '道已尝', 0, 38, rust);
  ctx.restore();
 }

 function frame(ctx, count, date, english, pageNumber, pageCount) {
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#eadcc4';
  for (let i = 0; i < 1500; i++) {
   const x = (i * 173 + i * i * 7) % width;
   const y = (i * 251 + i * i * 3) % height;
   ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, 1);
  }
  ctx.strokeStyle = '#c99776';
  ctx.lineWidth = 3;
  roundedRect(ctx, 27, 27, 846, 1206, 24);
  ctx.stroke();
  ctx.strokeStyle = '#e1ceb1';
  ctx.lineWidth = 1.5;
  roundedRect(ctx, 40, 40, 820, 1180, 16);
  ctx.stroke();

  type(ctx, 19, sans, 650);
  tracking(ctx, 'SLOW HAIFENG  /  GUANGDONG', 77, 103, 3);
  const title = english ? 'Haifeng Tasting Card' : '海丰吃货纪念卡';
  const titleSize = english ? 57 : 63;
  type(ctx, titleSize, serif, 700);
  const titleWidth = ctx.measureText(title).width;
  if (titleWidth > 590) type(ctx, Math.floor(titleSize * 590 / titleWidth), serif, 700);
  text(ctx, title, 74, 183);
  type(ctx, 24, sans, 500);
  text(ctx, (english ? 'Date  ' : '留念日期  ') + date.replace(/-/g, '.'), 78, 236, muted);
  stamp(ctx, count, english);

  rule(ctx, 1143, true);
  type(ctx, 23, serif, 600);
  text(ctx, english ? 'Slow Haifeng' : '海丰慢慢吃', 78, 1191, rust);
  ctx.textAlign = 'right';
  type(ctx, 20, sans, 500);
  text(ctx, String(pageNumber).padStart(2, '0') + ' / ' + String(pageCount).padStart(2, '0'), 824, 1190, muted);
  ctx.textAlign = 'left';
 }

 function row(ctx, item, y, index, english) {
  const [label, englishLabel, fill, color] = Object.hasOwn(tiers, item.tier) ? tiers[item.tier] : tiers.unrated;
  roundedRect(ctx, 74, y, 752, item.height - 8, 11);
  ctx.fillStyle = index % 2 ? '#f9efdd' : '#f5e9d3';
  ctx.fill();

  type(ctx, 19, sans, 650);
  text(ctx, String(index + 1).padStart(2, '0'), 92, y + 35, rust);
  type(ctx, 29, sans, 550);
  item.lines.forEach((line, lineIndex) => text(ctx, line, 144, y + 36 + lineIndex * 35));
  roundedRect(ctx, 657, y + 9, 150, 37, 17);
  ctx.fillStyle = fill;
  ctx.fill();
  type(ctx, 20, sans, 650);
  ctx.textAlign = 'center';
  text(ctx, english ? englishLabel : label, 732, y + 35, color);
  ctx.textAlign = 'left';
 }

 function render({entries, date, photo, english}) {
  const measure = document.createElement('canvas').getContext('2d');
  type(measure, 29, sans, 550);
  const items = entries.map(entry => {
   const lines = wrap(measure, entry.name, 490);
   return {lines, tier: entry.tier, height: 62 + Math.max(0, lines.length - 1) * 35};
  });
  const firstBites = items.slice(0, 6).reduce((total, item) => total + item.height, 0);
  const extraCoverSpace = Math.min(220, Math.max(0, 410 - firstBites));
  const bandHeight = (photoReady(photo) ? 292 : 211) + extraCoverSpace;
  const firstStart = 294 + bandHeight + 75;
  const continuationStart = 334;
  const pages = [[]];
  let y = firstStart;
  for (const item of items) {
   if (y + item.height > 1127) {
    pages.push([]);
    y = continuationStart;
   }
   pages.at(-1).push(item);
   y += item.height;
  }

  let index = 0;
  return pages.map((itemsOnPage, pageIndex) => {
   const canvas = document.createElement('canvas');
   canvas.width = width;
   canvas.height = height;
   const ctx = canvas.getContext('2d');
   frame(ctx, entries.length, date, english, pageIndex + 1, pages.length);
   if (pageIndex === 0) cover(ctx, photo, 281, bandHeight);
   let rowTop = pageIndex === 0 ? firstStart : continuationStart;
   type(ctx, 25, serif, 700);
   text(ctx, english ? 'THE TASTING LIST' : '这一趟尝过的味道', 76, rowTop - 23, ink);
   type(ctx, 19, sans, 600);
   ctx.textAlign = 'right';
   text(ctx, english ? 'RATING' : '从夯到拉', 807, rowTop - 24, rust);
   ctx.textAlign = 'left';
   for (const item of itemsOnPage) {
    row(ctx, item, rowTop, index++, english);
    rowTop += item.height;
   }
   return canvas;
  });
 }

 function jpeg(canvas) {
  return new Promise((resolve, reject) => {
   canvas.toBlob(blob => {
    if (blob?.type === 'image/jpeg') resolve(blob);
    else reject(new Error('Unable to encode postcard.'));
   }, 'image/jpeg', .91);
  });
 }

 async function pdf(canvases) {
  if (!canvases.length) throw new Error('No postcard pages.');
  const parts = [];
  const offsets = [0];
  const encoder = new TextEncoder();
  let length = 0;

  function append(part) {
   const data = typeof part === 'string' ? encoder.encode(part) : part;
   parts.push(data);
   length += data.size ?? data.byteLength;
  }

  function object(id, ...body) {
   offsets[id] = length;
   append(id + ' 0 obj\n');
   for (const part of body) append(part);
   append('\nendobj\n');
  }

  append('%PDF-1.4\n');
  append(new Uint8Array([37, 226, 227, 207, 211, 10]));
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  const kids = canvases.map((_, i) => (5 + i * 3) + ' 0 R').join(' ');
  object(2, '<< /Type /Pages /Kids [' + kids + '] /Count ' + canvases.length + ' >>');

  for (const [index, canvas] of canvases.entries()) {
   const image = await jpeg(canvas);
   const imageId = 3 + index * 3;
   const contentId = imageId + 1;
   const pageId = imageId + 2;
   object(imageId, '<< /Type /XObject /Subtype /Image /Width ' + canvas.width + ' /Height ' + canvas.height +
    ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + image.size + ' >>\nstream\n',
   image, '\nendstream');
   const content = 'q\n360 0 0 504 0 0 cm\n/Card Do\nQ\n';
   object(contentId, '<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream');
   object(pageId, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 360 504] /Resources << /XObject << /Card ' +
    imageId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>');
  }

  const start = length;
  append('xref\n0 ' + offsets.length + '\n0000000000 65535 f \n');
  for (const offset of offsets.slice(1)) append(String(offset).padStart(10, '0') + ' 00000 n \n');
  append('trailer\n<< /Size ' + offsets.length + ' /Root 1 0 R >>\nstartxref\n' + start + '\n%%EOF\n');
  return new Blob(parts, {type: 'application/pdf'});
 }

 return {render, pdf};
})();
