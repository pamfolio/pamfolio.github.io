'use strict';

window.HaifengLanguage = (() => {
 const preference = 'haifeng-language';
 const pageUrl = new URL(location.href);
 const requested = pageUrl.searchParams.get('lang');
 let saved;
 try {
  saved = localStorage.getItem(preference);
  if (requested === 'en' || requested === 'zh') localStorage.setItem(preference, requested);
 } catch {}
 const language = requested === 'en' || requested === 'zh' ? requested : saved;
 const english = language === 'en';
 const source = window.HAIFENG_ENGLISH || {};
 const entries = new Map();
 const templates = [];
 const han = /\p{Script=Han}/u;
 const normalize = text => text.trim().replace(/\s+/g, ' ');
 const attributes = ['aria-label', 'aria-description', 'title', 'alt', 'placeholder'];
 const skipped = 'script, style, textarea, .brand-mark, [data-language-control]';
 const originals = new WeakMap();

 function escapePattern(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 }

 {
  for (const [key, label] of Object.entries(source)) {
   const normalized = normalize(key);
   if (!/\{\d+\}/.test(normalized)) {
    entries.set(normalized, label);
    continue;
   }
   const pieces = normalized.split(/(\{\d+\})/);
   const positions = [];
   const pattern = pieces.map((part, index) => {
    if (index % 2 === 0) return escapePattern(part);
    positions.push(part.slice(1, -1));
    return '(.+?)';
   }).join('');
   const specificity = pieces.filter((_, index) => index % 2 === 0).join('').length;
   templates.push({ match: new RegExp('^' + pattern + '$'), positions, label, specificity });
  }
  templates.sort((a, b) => b.specificity - a.specificity);
 }

 function translateCopy(text) {
  if (!han.test(text)) return text;
  const key = normalize(text);
  if (entries.has(key)) return entries.get(key);
  if (key.length <= 300) {
   for (const {match, positions, label} of templates) {
    const result = key.match(match);
    if (!result) continue;
    const values = Object.fromEntries(positions.map((position, index) => [position, translateCopy(result[index + 1])]));
    return label.replace(/\{(\d+)\}/g, (token, position) => values[position] ?? token);
   }
  }
  const parts = text.split(/(\r?\n| · | \/ | ↗$| ↘$)/);
  return parts.length > 1 ? parts.map(part => translateCopy(part)).join('') : text;
 }

 function translate(text) {
  return english ? translateCopy(text) : text;
 }

 function displayedValue(node, property, text) {
  const original = originals.get(node)?.get(property);
  const sourceText = original?.display === text ? original.source : text;
  const translated = translate(sourceText);
  const leading = sourceText.match(/^\s*/)[0];
  const trailing = sourceText.match(/\s*$/)[0];
  const display = translated === sourceText ? sourceText : leading + translated.trim() + trailing;
  if (display !== sourceText || original) {
   if (!originals.has(node)) originals.set(node, new Map());
   originals.get(node).set(property, {source: sourceText, display});
  }
  return display;
 }

 function translateAttribute(element, attribute) {
  const text = element.getAttribute(attribute);
  if (text === null) return;
  const translated = displayedValue(element, attribute, text);
  if (text !== translated) element.setAttribute(attribute, translated);
 }

 function translateTree(node) {
  if (node.nodeType === Node.TEXT_NODE) {
   const parent = node.parentElement;
   if (!parent || parent.closest(skipped)) return;
   const text = node.data;
   const translated = displayedValue(node, 'text', text);
   if (text === translated) return;
   if (parent instanceof HTMLOptionElement && !parent.hasAttribute('value')) {
    parent.setAttribute('value', parent.value);
   }
   node.data = translated;
   return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE || node.closest(skipped)) return;
  for (const attribute of attributes) translateAttribute(node, attribute);
  for (const child of node.childNodes) translateTree(child);
 }

 document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('language-toggle');
  toggle.hidden = false;
  toggle.textContent = english ? '中文' : 'EN';
  toggle.lang = english ? 'zh-CN' : 'en';
  const switchLabel = english ? 'Switch to Chinese' : '切换为英文';
  toggle.setAttribute('aria-label', switchLabel);
  toggle.title = switchLabel;
  toggle.onclick = () => {
   const next = english ? 'zh' : 'en';
   const url = new URL(location.href);
   url.searchParams.set('lang', next);
   try { localStorage.setItem(preference, next); } catch {}
   location.assign(url.href);
  };

  if (!english) return;
  document.documentElement.lang = 'en';
  document.title = translate(document.title);
  const description = document.querySelector('meta[name="description"]');
  if (description) translateAttribute(description, 'content');
  translateTree(document.body);

  new MutationObserver(changes => {
   for (const change of changes) {
    if (change.type === 'attributes') {
     if (!change.target.closest(skipped)) translateAttribute(change.target, change.attributeName);
    } else if (change.type === 'characterData') {
     translateTree(change.target);
    } else {
     for (const node of change.addedNodes) translateTree(node);
    }
   }
  }).observe(document.body, {
   subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes
  });
 });

 return {
  english,
  translate,
 };
})();
