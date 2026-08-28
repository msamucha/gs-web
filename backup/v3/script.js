(function () {
  'use strict';

  // ─── JS-active flag ──────────────────────────────────────────────────
  // Default state: everything visible. data-js="on" arms the opacity-0
  // starting state for reveals. Print, no-JS, and crawlers see the
  // full layout immediately.
  const root = document.documentElement;
  root.setAttribute('data-js', 'on');

  // ─── Masthead scroll state ───────────────────────────────────────────
  const masthead = document.querySelector('[data-nav]');
  if (masthead) {
    const onScroll = () => {
      if (window.scrollY > 32) masthead.classList.add('is-scrolled');
      else masthead.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile drawer ───────────────────────────────────────────────────
  // Single source of truth: aria-expanded on the burger drives both the
  // burger-X transform (CSS) and the drawer's is-open class.
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
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      setDrawer(!isOpen);
    });

    // Close on link click — drawer is for navigation, dismiss after pick.
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setDrawer(false));
    });

    // Close on escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setDrawer(false);
        burger.focus();
      }
    });

    // Close when crossing the desktop breakpoint, so resize doesn't trap.
    const mq = window.matchMedia('(min-width: 980px)');
    const onBreak = () => { if (mq.matches) setDrawer(false); };
    if (mq.addEventListener) mq.addEventListener('change', onBreak);
    else if (mq.addListener) mq.addListener(onBreak);
  }

  // ─── Reveal-on-intersect ─────────────────────────────────────────────
  // Single observer, single threshold. Each reveal fires once and is
  // unobserved — no perpetual work. prefers-reduced-motion is handled
  // entirely in CSS, so we skip the observer for those users.
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

    // Safety net: anything still hidden after 2s gets shown anyway.
    // Better to skip the animation than ship a blank page.
    setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains('is-in')) el.classList.add('is-in');
      });
    }, 2000);
  } else if (reveals.length) {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // ─── Language toggle ─────────────────────────────────────────────────
  // data-en / data-da on every translatable node. Swap textContent in
  // place; meta descriptions get content attr instead. Choice persists
  // in localStorage.
  const STORAGE_KEY = 'gs.lang';
  const langButton = document.querySelector('[data-lang-toggle]');
  const langEnEl = document.querySelector('.masthead__lang-en');
  const langDaEl = document.querySelector('.masthead__lang-da');

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

    document.title = lang === 'da'
      ? 'Golfsocial — Medlemsappen til den golf I allerede spiller sammen'
      : 'Golfsocial — The members\' app for people who play together';

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
  if (stored === 'da' || stored === 'en') applyLanguage(stored);

  if (langButton) {
    langButton.addEventListener('click', () => {
      const next = root.getAttribute('data-lang') === 'da' ? 'en' : 'da';
      applyLanguage(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* noop */ }
    });
  }

})();
