'use strict';

(() => {
 const dock = document.querySelector('.page-jump-dock');
 const toggle = document.getElementById('page-jump-toc-toggle');
 const panel = document.getElementById('page-jump-toc');
 const close = document.getElementById('page-jump-toc-close');

 function setOpen(open, restoreFocus = false) {
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  if (open) panel.querySelector('a')?.focus({preventScroll: true});
  if (restoreFocus) toggle.focus({preventScroll: true});
 }

 toggle.addEventListener('click', () => setOpen(panel.hidden));
 close.addEventListener('click', () => setOpen(false, true));
 dock.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || panel.hidden || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  setOpen(false);
  if (!panel.contains(link)) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
  target.focus({preventScroll: true});
 });
 document.addEventListener('click', event => {
  if (!panel.hidden && !dock.contains(event.target)) setOpen(false);
 });
 document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || panel.hidden) return;
  event.preventDefault();
  setOpen(false, true);
 });
})();
