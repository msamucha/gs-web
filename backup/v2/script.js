(function () {
  'use strict';

  // ─── JS-active flag ─────────────────────────────────────────────────
  // Reveal elements are visible by default. Setting data-js="on" arms
  // the opacity-0 starting state in CSS, so reveals only run for users
  // who have JS *and* IntersectionObserver. Print, crawlers, and JS-off
  // visitors see the full layout immediately.
  const root = document.documentElement;
  root.setAttribute('data-js', 'on');

  // ─── Nav scroll state ────────────────────────────────────────────────
  // Background fades in after 40px scroll. One-line decision, no flicker.
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Reveal on intersect ─────────────────────────────────────────────
  // Single observer, single threshold. Each reveal fires once and is
  // unobserved — no perpetual work. prefers-reduced-motion is handled
  // entirely in CSS (reveal class is neutralised), so we skip the
  // observer altogether for those users.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('[data-reveal]');

  if (reveals.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });
    reveals.forEach((el) => observer.observe(el));

    // Safety net: if a reveal is still hidden after 2s (headless, slow
    // network, observer never fires for any reason), show it. Better to
    // skip the animation than to ship a blank page.
    setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains('is-in')) el.classList.add('is-in');
      });
    }, 2000);
  } else if (reveals.length) {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // ─── Language toggle ────────────────────────────────────────────────
  // Two attributes on every translatable node: data-en, data-da.
  // We swap textContent in place. Persist choice in localStorage so the
  // user does not get re-toggled on every visit.
  const STORAGE_KEY = 'gs.lang';
  const langButton = document.querySelector('[data-lang-toggle]');
  const langEnEl = document.querySelector('.nav__lang-en');
  const langDaEl = document.querySelector('.nav__lang-da');

  const applyLanguage = (lang) => {
    const key = lang === 'da' ? 'data-da' : 'data-en';
    root.setAttribute('lang', lang);
    root.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-en][data-da]').forEach((node) => {
      const val = node.getAttribute(key);
      if (val == null) return;
      if (node.tagName === 'META') {
        node.setAttribute('content', val);
      } else {
        node.textContent = val;
      }
    });

    // Page title
    document.title = lang === 'da'
      ? 'Golfsocial — Den sociale side af golf'
      : 'Golfsocial — The social side of golf';

    if (langEnEl && langDaEl) {
      if (lang === 'da') {
        langDaEl.setAttribute('aria-current', 'true');
        langEnEl.removeAttribute('aria-current');
      } else {
        langEnEl.setAttribute('aria-current', 'true');
        langDaEl.removeAttribute('aria-current');
      }
    }
  };

  const stored = (() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  })();

  if (stored === 'da' || stored === 'en') {
    applyLanguage(stored);
  }

  if (langButton) {
    langButton.addEventListener('click', () => {
      const next = root.getAttribute('data-lang') === 'da' ? 'en' : 'da';
      applyLanguage(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* noop */ }
    });
  }
})();
