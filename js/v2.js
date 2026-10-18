/* Arquillena v2 — поведение блоков после первого экрана */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------- Появление при скролле ---------- */
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  revealEls.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    el.style.setProperty('--rd', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  });
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  revealEls.forEach(el => revealIO.observe(el));

  /* ---------- Счётчики ---------- */
  const fmt = (v, d) => v.toFixed(d).replace('.', ',');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const to = parseFloat(el.dataset.count);
      const d = parseInt(el.dataset.decimals || '0', 10);
      if (reduceMotion) { el.textContent = fmt(to, d); return; }
      const start = performance.now();
      const step = now => {
        const t = Math.min((now - start) / 1400, 1);
        el.textContent = fmt(to * (1 - Math.pow(1 - t, 3)), d);
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(0, d);
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Липкая кнопка на мобильном ---------- */
  const sticky = $('#stickyBuy');
  const stickyName = $('#stickyName');
  const stickyLink = sticky.querySelector('a');
  let pastHero = false, atBuy = false;
  const updateSticky = () => {
    const show = pastHero && !atBuy;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', String(!show));
    stickyLink.tabIndex = show ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; updateSticky(); }).observe($('.hero__buy'));
  new IntersectionObserver(([e]) => { atBuy = e.isIntersecting; updateSticky(); }).observe($('#buy'));

  document.addEventListener('flavorchange', e => {
    const f = e.detail.flavor;
    stickyName.textContent = `${f.name} · ${f.lineLabel.toLowerCase()}`;
  });
})();
