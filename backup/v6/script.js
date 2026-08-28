(function () {
  'use strict';

  const root = document.documentElement;
  root.setAttribute('data-js', 'on');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav scroll state */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    let last = -1;
    const onScroll = () => { const y = window.scrollY; if (y === last) return; last = y; nav.classList.toggle('is-scrolled', y > 64); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Drawer */
  const burger = document.querySelector('[data-burger]');
  const drawer = document.querySelector('[data-drawer]');
  const setDrawer = (open) => {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawer.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (burger && drawer) {
    burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
    const mq = window.matchMedia('(min-width: 920px)');
    if (mq.addEventListener) mq.addEventListener('change', () => { if (mq.matches) setDrawer(false); });
  }

  /* Stagger index */
  document.querySelectorAll('[data-stagger]').forEach((g) => {
    g.querySelectorAll(':scope > [data-stagger-item]').forEach((el, i) => el.style.setProperty('--stagger-i', i));
  });

  /* Reveal */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
    setTimeout(() => reveals.forEach((el) => el.classList.add('is-in')), 2600);
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* Count-up */
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const animate = (el) => {
    const raw = el.getAttribute('data-value') || el.textContent.trim();
    const target = parseFloat(raw.replace(/[,\s]/g, ''));
    if (!isFinite(target)) return;
    const dur = Math.min(1500, 650 + Math.log10(target + 1) * 260);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = String(Math.round(target * easeOutQuart(t)));
      if (t < 1) requestAnimationFrame(tick); else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };
  const counts = document.querySelectorAll('[data-countup]');
  if (counts.length) {
    if (reduce) {
      counts.forEach((el) => { const v = el.getAttribute('data-value'); if (v) el.textContent = v; });
    } else if ('IntersectionObserver' in window) {
      counts.forEach((el) => { el.textContent = '0'; });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const p = e.target.closest('[data-stagger-item]');
            const i = p ? parseInt(p.style.getPropertyValue('--stagger-i') || '0', 10) : 0;
            setTimeout(() => animate(e.target), 200 + i * 120);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.5 });
      counts.forEach((el) => io.observe(el));
    }
  }

  /* Language toggle */
  const KEY = 'gs.lang';
  const btn = document.querySelector('[data-lang-toggle]');
  const enEl = document.querySelector('.nav__lang-en');
  const daEl = document.querySelector('.nav__lang-da');
  const apply = (lang) => {
    const k = lang === 'da' ? 'data-da' : 'data-en';
    root.setAttribute('lang', lang); root.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-en][data-da]').forEach((n) => {
      const v = n.getAttribute(k); if (v == null) return;
      if (n.tagName === 'META') n.setAttribute('content', v); else n.textContent = v;
    });
    document.title = lang === 'da'
      ? 'Golfsocial · Din golfklub, i lommen'
      : 'Golfsocial · Your golf clubhouse, in your pocket';
    if (enEl && daEl) { enEl.toggleAttribute('aria-current', lang !== 'da'); daEl.toggleAttribute('aria-current', lang === 'da'); }
  };
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === 'da' || stored === 'en') apply(stored);
  if (btn) btn.addEventListener('click', () => {
    const next = root.getAttribute('data-lang') === 'da' ? 'en' : 'da';
    apply(next); try { localStorage.setItem(KEY, next); } catch (e) {}
  });

})();
