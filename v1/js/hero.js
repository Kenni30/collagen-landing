/* Arquillena — первый экран: интерактивный выбор вкуса */
(() => {
  'use strict';

  const JOINTS = [
    { icon: 'I–III', title: 'Коллаген', note: '3 типа в одной ложке' },
    { icon: 'Гл', title: 'Глюкозамин', note: '1190 мг на порцию' },
    { icon: 'Хн', title: 'Хондроитин', note: '1360 мг на порцию' },
  ];
  const VEINS = [
    { icon: 'I–III', title: 'Коллаген', note: '3 типа в одной ложке' },
    { icon: 'Рв', title: 'Ресвератрол', note: '425 мг на порцию' },
    { icon: 'ГК', title: 'Гиалуроновая кислота', note: '646 мг на порцию' },
  ];

  const FLAVORS = [
    {
      id: 'apple', name: 'Яблоко', word: 'яблоко', line: 'joints', lineLabel: 'Для суставов', lineShort: 'суставы',
      product: 'Комплекс для суставов, яблоко',
      g1: '#7DB544', g2: '#3B6E1C', accent: '#4A8226', deep: '#3F7420', tint: '#E7F0D6', cube: '#A9D86E',
      chips: JOINTS,
    },
    {
      id: 'cherry', name: 'Вишня', word: 'вишня', line: 'joints', lineLabel: 'Для суставов', lineShort: 'суставы',
      product: 'Комплекс для суставов, вишня',
      g1: '#D73F4B', g2: '#8A1020', accent: '#B3202F', deep: '#8E1222', tint: '#F7E0E1', cube: '#EE5263',
      chips: JOINTS,
    },
    {
      id: 'raspberry', name: 'Малина', word: 'малина', line: 'veins', lineLabel: 'Для вен', lineShort: 'вены',
      product: 'Комплекс для вен, малина',
      g1: '#E3528A', g2: '#9E1549', accent: '#C42563', deep: '#A3184E', tint: '#FAE1EC', cube: '#F472A0',
      chips: VEINS,
    },
    {
      id: 'pomegranate', name: 'Гранат', word: 'гранат', line: 'veins', lineLabel: 'Для вен', lineShort: 'вены',
      product: 'Комплекс для вен, гранат',
      g1: '#AE2955', g2: '#560822', accent: '#8A1338', deep: '#6E0E2C', tint: '#F3DEE5', cube: '#D23A6E',
      chips: VEINS,
    },
  ];

  const AUTOPLAY_MS = 6000;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const root = document.documentElement;
  const hero = $('#hero');
  const stage = $('#stage');
  const panel = $('#panel');
  const word = $('#word');
  const badge = $('#badge');
  const jarSlot = $('#jarSlot');
  const chipsEl = $('#chips');
  const picker = $('#picker');
  const buyName = $('#buyName');
  const cubes = [...stage.querySelectorAll('.cube')];

  let current = -1;
  let elapsed = 0;

  // Анимации через Web Animations API; при «меньше движения» — мгновенно
  const anim = (el, frames, opts) =>
    el.animate(frames, reduceMotion ? { ...opts, duration: 1, delay: 0 } : opts);

  /* ---------- Предзагрузка банок ---------- */
  FLAVORS.forEach(f => { const i = new Image(); i.src = `img/jar-${f.id}.png`; });

  /* ---------- Кнопки выбора вкуса ---------- */
  FLAVORS.forEach((f, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'picker__item';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('aria-label', `${f.name}, комплекс ${f.lineLabel.toLowerCase()}`);
    b.style.setProperty('--fc', f.accent);
    b.innerHTML = `
      <span class="picker__thumb">
        <svg class="picker__ring" viewBox="0 0 56 56" aria-hidden="true">
          <circle class="bg" cx="28" cy="28" r="26"/><circle class="fg" cx="28" cy="28" r="26"/>
        </svg>
        <img src="img/fruit-${f.id}.png" alt="" width="56" height="56">
      </span>
      <span class="picker__name">${f.name}</span>
      <span class="picker__line">${f.lineShort}</span>`;
    b.addEventListener('click', () => userGo(i));
    picker.appendChild(b);
  });
  const pickerItems = [...picker.children];

  picker.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + FLAVORS.length) % FLAVORS.length;
    userGo(next);
    pickerItems[next].focus();
  });

  /* ---------- Переключение ---------- */
  function go(index, dir = 1) {
    if (index === current) return;
    const prev = FLAVORS[current];
    const f = FLAVORS[index];
    const first = current === -1;
    current = index;
    elapsed = 0;

    // Цвета страницы
    root.style.setProperty('--accent', f.accent);
    root.style.setProperty('--accent-deep', f.deep);
    root.style.setProperty('--tint', f.tint);
    root.style.setProperty('--cube', f.cube);

    // Панель: новый цвет «разливается» из-за банки
    const layer = document.createElement('div');
    layer.className = 'panel__layer';
    layer.style.setProperty('--g1', f.g1);
    layer.style.setProperty('--g2', f.g2);
    if (!first && !reduceMotion) {
      layer.classList.add('is-revealing');
      layer.style.setProperty('--ox', dir > 0 ? '60%' : '40%');
      layer.style.setProperty('--oy', '45%');
      layer.addEventListener('animationend', () => {
        layer.classList.remove('is-revealing');
        [...panel.children].forEach(c => { if (c !== layer) c.remove(); });
      }, { once: true });
    } else {
      panel.innerHTML = '';
    }
    panel.appendChild(layer);

    // Банка: старая улетает, новая въезжает с пружиной
    const oldJar = jarSlot.querySelector('img');
    if (oldJar) {
      anim(oldJar, [
        { transform: 'none', opacity: 1 },
        { transform: `translateX(${-dir * 55}%) rotate(${-dir * 16}deg) scale(.72)`, opacity: 0 },
      ], { duration: 480, easing: 'cubic-bezier(.55,0,.75,.2)', fill: 'forwards' })
        .finished.then(() => oldJar.remove());
    }
    const jar = new Image();
    jar.src = `img/jar-${f.id}.png`;
    jar.alt = `Банка Arquillena: коллаген, комплекс ${f.lineLabel.toLowerCase()}, вкус ${f.word}`;
    jar.width = 354; jar.height = 354;
    jarSlot.appendChild(jar);
    if (!first) {
      anim(jar, [
        { transform: `translateX(${dir * 55}%) rotate(${dir * 18}deg) scale(.72)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ], { duration: 900, delay: 160, easing: 'cubic-bezier(.34,1.45,.64,1)', fill: 'backwards' });
    }

    // Слово-вкус: буквы уходят вверх, новые поднимаются снизу
    const oldLetters = [...word.children];
    const outDelay = oldLetters.length && !reduceMotion ? 260 : 0;
    oldLetters.forEach((s, i) => anim(s, [
      { transform: 'none', opacity: 1 },
      { transform: 'translateY(-110%)', opacity: 0 },
    ], { duration: 280, delay: i * 18, easing: 'ease-in', fill: 'forwards' }));
    setTimeout(() => {
      word.innerHTML = '';
      [...f.word].forEach((ch, i) => {
        const s = document.createElement('span');
        s.textContent = ch;
        word.appendChild(s);
        anim(s, [
          { transform: 'translateY(110%) rotate(8deg)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ], { duration: 700, delay: i * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
    }, outDelay);

    // Бейдж линейки
    if (!prev || prev.line !== f.line) {
      badge.textContent = f.lineLabel;
      anim(badge, [
        { transform: 'translateY(8px)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ], { duration: 500, delay: 200, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    }

    // Плашки-факты: перерисовываем при смене линейки, иначе лёгкий «кивок»
    if (!prev || prev.line !== f.line) {
      renderChips(f.chips, !first);
    } else {
      [...chipsEl.children].forEach((c, i) => anim(c, [
        { transform: 'none' }, { transform: 'translateY(-6px) scale(1.03)' }, { transform: 'none' },
      ], { duration: 600, delay: 150 + i * 70, easing: 'ease-in-out' }));
    }

    // Желейные кубики «трясутся»
    if (!first) cubes.forEach((c, i) => anim(c, [
      { scale: '1 1' }, { scale: '1.2 .8' }, { scale: '.9 1.12' }, { scale: '1.05 .96' }, { scale: '1 1' },
    ], { duration: 750, delay: 120 + i * 60, easing: 'ease-out' }));

    // Выбор и покупка
    pickerItems.forEach((b, i) => {
      b.setAttribute('aria-selected', String(i === index));
      b.tabIndex = i === index ? 0 : -1;
      b.style.setProperty('--p', 0);
    });
    buyName.textContent = f.product;
    document.dispatchEvent(new CustomEvent('flavorchange', { detail: { index, flavor: f } }));
  }

  function renderChips(list, animate) {
    chipsEl.innerHTML = list.map((c, i) => `
      <li class="chip chip--${i + 1}">
        <span class="chip__icon">${c.icon}</span>
        <span><b>${c.title}</b><small>${c.note}</small></span>
      </li>`).join('');
    if (!animate) return;
    [...chipsEl.children].forEach((c, i) => anim(c, [
      { transform: 'translateY(16px) scale(.8)', opacity: 0 },
      { transform: 'none', opacity: 1 },
    ], { duration: 600, delay: 300 + i * 90, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' }));
  }

  // Ручное переключение: отсчёт до следующего вкуса начинается заново
  function userGo(index, dir) {
    if (dir === undefined) dir = index > current ? 1 : -1;
    elapsed = 0;
    go(index, dir);
  }
  const step = d => userGo((current + d + FLAVORS.length) % FLAVORS.length, d);

  $('.stage__arrow--prev').addEventListener('click', () => step(-1));
  $('.stage__arrow--next').addEventListener('click', () => step(1));

  /* ---------- Свайп ---------- */
  let startX = null, startY = null;
  stage.addEventListener('pointerdown', e => { startX = e.clientX; startY = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { startX = null; });

  /* ---------- Параллакс за курсором ---------- */
  if (finePointer && !reduceMotion) {
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      stage.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--mx', 0);
      stage.style.setProperty('--my', 0);
    });
  }

  /* ---------- Автопрокрутка с кольцом прогресса ---------- */
  // Не останавливается при наведении; ручной выбор только перезапускает отсчёт

  let last = performance.now();
  function tick(now) {
    const dt = now - last;
    last = now;
    const active = !reduceMotion && !document.hidden && heroVisible;
    if (active) {
      elapsed += dt;
      pickerItems[current]?.style.setProperty('--p', Math.min(elapsed / AUTOPLAY_MS, 1).toFixed(3));
      if (elapsed >= AUTOPLAY_MS) go((current + 1) % FLAVORS.length, 1);
    }
    requestAnimationFrame(tick);
  }

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: .3 }).observe(stage);

  /* ---------- Меню на планшете и мобильном ---------- */
  const burger = $('.header__burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });

  /* ---------- Слово-вкус всегда помещается в ширину плашки ---------- */
  // Меряем реальную ширину самого длинного слова на максимальном кегле и уменьшаем до 90% ширины
  const ruler = document.createElement('span');
  ruler.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-family:var(--f-display);font-weight:800;text-transform:uppercase;letter-spacing:-.03em;line-height:1';
  stage.appendChild(ruler);
  const longest = FLAVORS.reduce((a, f) => (f.word.length > a.length ? f.word : a), '');
  const fitWord = () => {
    const w = stage.clientWidth;
    const max = w > 560 ? 120 : 64;
    ruler.style.fontSize = `${max}px`;
    ruler.textContent = longest;
    const natural = ruler.offsetWidth || 1;
    stage.style.setProperty('--wf', `${Math.floor(Math.min(max, max * (w * 0.9) / natural))}px`);
  };
  fitWord();
  new ResizeObserver(fitWord).observe(stage);
  document.fonts?.ready.then(fitWord);

  // Выбор вкуса из других блоков страницы
  window.arqSelectFlavor = i => userGo(i);

  /* ---------- Старт ---------- */
  go(0);
  requestAnimationFrame(tick);
})();
