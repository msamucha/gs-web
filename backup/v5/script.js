(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     Golfsocial v5 — "Clubhouse" motion controller
     Vanilla JS, no libs. Transform/opacity only. Reduced motion respected.
     ═══════════════════════════════════════════════════════════════════ */

  const root = document.documentElement;
  root.setAttribute('data-js', 'on');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Nav scroll state ─────────────────────────────────────────────── */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    let last = -1;
    const onScroll = () => {
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      nav.classList.toggle('is-scrolled', y > 56);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Mobile drawer ────────────────────────────────────────────────── */
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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setDrawer(false); burger.focus(); }
    });
    const mq = window.matchMedia('(min-width: 940px)');
    const onBreak = () => { if (mq.matches) setDrawer(false); };
    if (mq.addEventListener) mq.addEventListener('change', onBreak);
  }

  /* ─── Stagger index ────────────────────────────────────────────────── */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    group.querySelectorAll(':scope > [data-stagger-item]').forEach((el, i) => {
      el.style.setProperty('--stagger-i', i);
    });
  });

  /* ─── Reveal on intersect ──────────────────────────────────────────── */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
    setTimeout(() => reveals.forEach((el) => el.classList.add('is-in')), 2600);
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ─── Hero entrance ────────────────────────────────────────────────── */
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    if (reduce) hero.classList.add('is-in');
    else requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));
  }

  /* ─── Count-up ─────────────────────────────────────────────────────── */
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const animate = (el) => {
    const raw = el.getAttribute('data-value') || el.textContent.trim();
    const hasComma = /,/.test(raw);
    const hasDecimal = /\.\d/.test(raw);
    const target = parseFloat(raw.replace(/[,\s]/g, ''));
    if (!isFinite(target)) return;
    const duration = hasDecimal ? 1100 : Math.min(1600, 700 + Math.log10(target + 1) * 220);
    const start = performance.now();
    const fmt = (n) => hasDecimal ? n.toFixed(1) : (hasComma ? Math.round(n).toLocaleString('en-US') : String(Math.round(n)));
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = fmt(target * easeOutQuart(t));
      if (t < 1) requestAnimationFrame(tick); else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };
  const counts = document.querySelectorAll('[data-countup]');
  if (counts.length) {
    if (reduce) {
      counts.forEach((el) => { const v = el.getAttribute('data-value'); if (v) el.textContent = v; });
    } else if ('IntersectionObserver' in window) {
      counts.forEach((el) => {
        const raw = el.getAttribute('data-value') || el.textContent.trim();
        el.textContent = /\.\d/.test(raw) ? '0.0' : '0';
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.closest('[data-stagger-item]');
            const i = parent ? parseInt(parent.style.getPropertyValue('--stagger-i') || '0', 10) : 0;
            setTimeout(() => animate(entry.target), 240 + i * 120);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counts.forEach((el) => io.observe(el));
    }
  }

  /* ─── Scroll-driven parallax ───────────────────────────────────────── */
  const pels = document.querySelectorAll('[data-parallax]');
  if (pels.length && !reduce && window.innerWidth >= 760 && 'IntersectionObserver' in window) {
    const tracked = [];
    pels.forEach((el) => tracked.push({ el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.05, inView: false }));
    const vis = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { const t = tracked.find((x) => x.el === entry.target); if (t) t.inView = entry.isIntersecting; });
    }, { rootMargin: '20% 0px 20% 0px' });
    tracked.forEach((t) => vis.observe(t.el));
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      tracked.forEach((t) => {
        if (!t.inView) return;
        const rect = t.el.getBoundingClientRect();
        const delta = ((rect.top + rect.height / 2) - vh / 2) * -t.speed;
        t.el.style.setProperty('--parallax-y', delta.toFixed(2) + 'px');
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ─── Language toggle ──────────────────────────────────────────────── */
  const STORAGE_KEY = 'gs.lang';
  const langBtn = document.querySelector('[data-lang-toggle]');
  const enEl = document.querySelector('.nav__lang-en');
  const daEl = document.querySelector('.nav__lang-da');

  const applyLanguage = (lang) => {
    const key = lang === 'da' ? 'data-da' : 'data-en';
    root.setAttribute('lang', lang);
    root.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-en][data-da]').forEach((node) => {
      const val = node.getAttribute(key);
      if (val == null) return;
      if (node.tagName === 'META') node.setAttribute('content', val);
      else node.textContent = val;
    });
    document.title = lang === 'da'
      ? 'Golfsocial · Dine folk, dine runder, én klub'
      : 'Golfsocial · Your people, your rounds, one clubhouse';
    if (enEl && daEl) {
      enEl.toggleAttribute('aria-current', lang !== 'da');
      daEl.toggleAttribute('aria-current', lang === 'da');
    }
  };

  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* noop */ }
  if (stored === 'da' || stored === 'en') applyLanguage(stored);

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-lang') === 'da' ? 'en' : 'da';
      applyLanguage(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* noop */ }
    });
  }

})();
