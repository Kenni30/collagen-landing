/* Arquillena — поведение блоков после первого экрана */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------- Появление при скролле ---------- */
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  // Соседние элементы в одном контейнере появляются лесенкой
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
      const dur = 1400;
      const step = now => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(to * eased, d);
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(0, d);
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Состав: суставы / вены ---------- */
  const ICONS = {
    helix: '<path d="M7 3c0 6 10 6 10 12s-10 6-10 6"/><path d="M17 3c0 6-10 6-10 12"/><path d="M8.5 7h7M8.5 17h7"/>',
    joint: '<path d="M9 3v6a3 3 0 0 0 6 0V3"/><path d="M9 21v-6a3 3 0 0 1 6 0v6"/><path d="M6 12h12"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    leaf: '<path d="M5 19C5 10 11 5 20 4c0 9-6 15-15 15z"/><path d="M5 19l9-9"/>',
    root: '<path d="M12 3v8"/><path d="M12 11c-3 0-5 2-6 5M12 11c3 0 5 2 6 5M12 11v9"/>',
    citrus: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    grape: '<circle cx="9" cy="10" r="2.5"/><circle cx="15" cy="10" r="2.5"/><circle cx="12" cy="14.5" r="2.5"/><circle cx="12" cy="19.5" r="2" /><path d="M12 7V3l3 1"/>',
    nut: '<circle cx="12" cy="13" r="7"/><path d="M8 9c2-2 6-2 8 0"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    spoon: '<ellipse cx="8" cy="8" rx="4" ry="5.5" transform="rotate(-45 8 8)"/><path d="M11 11l9 9"/>',
  };

  const LINES = {
    joints: {
      jar: 'img/jar-apple.png',
      alt: 'Банка Arquillena, комплекс для суставов',
      left: [
        { i: 'helix', name: 'Коллаген I, II, III типов', dose: '', text: 'Строительный белок хрящей, связок и сухожилий' },
        { i: 'joint', name: 'Глюкозамин', dose: '1190 мг', text: 'Питательная поддержка обменных процессов в хрящевой ткани' },
        { i: 'joint', name: 'Хондроитин', dose: '1360 мг', text: 'Способствует образованию внутрисуставной жидкости' },
        { i: 'shield', name: '90% курица · 10% говядина', dose: '', text: 'Источник коллагена' },
      ],
      right: [
        { i: 'root', name: 'Куркума', dose: '425 мг', text: 'Растительный экстракт для подвижности суставов' },
        { i: 'leaf', name: 'Босвеллия', dose: '408 мг', text: 'Растительный экстракт для комфорта движения' },
        { i: 'citrus', name: 'Витамин C', dose: '85 мг', text: 'Участвует в собственном синтезе коллагена' },
        { i: 'drop', name: 'Натуральный сок', dose: '', text: 'В составе натуральный фруктовый или ягодный сок' },
      ],
    },
    veins: {
      jar: 'img/jar-pomegranate.png',
      alt: 'Банка Arquillena, комплекс для вен',
      left: [
        { i: 'helix', name: 'Коллаген I, II, III типов', dose: '', text: 'Строительный белок стенок сосудов' },
        { i: 'drop', name: 'Гиалуроновая кислота', dose: '646 мг', text: 'Увлажняющий компонент' },
        { i: 'shield', name: 'Ресвератрол', dose: '425 мг', text: 'Антиоксидант: поддержка венозной стенки и микроциркуляции' },
        { i: 'shield', name: '90% курица · 10% говядина', dose: '', text: 'Источник коллагена' },
      ],
      right: [
        { i: 'nut', name: 'Конский каштан', dose: '306 мг', text: 'Экстракт для тонуса вен и лёгкости в ногах' },
        { i: 'grape', name: 'Листья красного винограда', dose: '340 мг', text: 'Экстракт для укрепления капилляров' },
        { i: 'citrus', name: 'Витамины C и E', dose: '85 и 8,5 мг', text: 'Антиоксидантная поддержка' },
        { i: 'drop', name: 'Натуральный сок', dose: '', text: 'В составе натуральный фруктовый или ягодный сок' },
      ],
    },
  };

  const comp = $('#composition');
  const compJar = $('#compJar');
  const compLeft = $('#compLeft');
  const compRight = $('#compRight');
  const segBtns = [...comp.querySelectorAll('.seg__btn')];
  let compLine = null;

  const ingHTML = x => `
    <li class="ing">
      <span class="ing__icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[x.i]}</svg></span>
      <div>
        <div class="ing__top"><span class="ing__name">${x.name}</span>${x.dose ? `<span class="ing__dose">${x.dose}</span>` : ''}</div>
        <p class="ing__text">${x.text}</p>
      </div>
    </li>`;

  function setLine(line, animate = true) {
    if (line === compLine) return;
    compLine = line;
    const d = LINES[line];
    comp.dataset.line = line;
    segBtns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.line === line)));
    compLeft.innerHTML = d.left.map(ingHTML).join('');
    compRight.innerHTML = d.right.map(ingHTML).join('');

    if (!animate || reduceMotion) {
      compJar.src = d.jar; compJar.alt = d.alt;
      return;
    }
    compJar.animate([
      { transform: 'none', opacity: 1 },
      { transform: 'scale(.8) rotate(-10deg)', opacity: 0 },
    ], { duration: 220, easing: 'ease-in', fill: 'forwards' });
    setTimeout(() => {
      compJar.src = d.jar; compJar.alt = d.alt;
      compJar.animate([
        { transform: 'scale(.8) rotate(10deg)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ], { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' });
    }, 220);
    [...compLeft.children, ...compRight.children].forEach((li, i) => li.animate([
      { transform: 'translateY(14px)', opacity: 0 },
      { transform: 'none', opacity: 1 },
    ], { duration: 500, delay: 80 + (i % 3) * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
  }

  segBtns.forEach(b => b.addEventListener('click', () => setLine(b.dataset.line)));
  comp.querySelector('.seg').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const next = compLine === 'joints' ? 'veins' : 'joints';
    setLine(next);
    segBtns.find(b => b.dataset.line === next).focus();
  });
  setLine('joints', false);

  /* ---------- Как принимать: активный шаг ---------- */
  const steps = [...document.querySelectorAll('.step')];
  const stepIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('is-active', e.isIntersecting));
  }, { rootMargin: '-40% 0px -40% 0px' });
  steps.forEach(s => stepIO.observe(s));

  /* ---------- Липкая кнопка ---------- */
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
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; updateSticky(); })
    .observe($('.hero__buy'));
  new IntersectionObserver(([e]) => { atBuy = e.isIntersecting; updateSticky(); })
    .observe($('#buy'));

  document.addEventListener('flavorchange', e => {
    const f = e.detail.flavor;
    stickyName.textContent = `${f.name} · ${f.lineLabel.toLowerCase()}`;
  });
})();


