(function () {
  'use strict';

  /* ═════════════════════════════════════════════════════════════════════
     Golfsocial v4 — Motion controller
     Vanilla JS, no libs. All motion is purposeful, accessibility-gated,
     and confined to transform/opacity/filter. Reduced motion is fully
     respected — count-ups jump to final, idle floats are disabled, and
     reveals fall back to instant.

     Designer weighting: Jakub primary (polish, weight) · Emil secondary
     (restraint, durations) · Jhey selectively (count-up precision, the
     language toggle morph).
     ═════════════════════════════════════════════════════════════════════ */

  const root = document.documentElement;
  root.setAttribute('data-js', 'on');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) root.setAttribute('data-reduced-motion', 'on');

  /* ─── Masthead — progressive scroll state ─────────────────────────── */
  /* Two thresholds for a graduated reveal of nav background, not binary. */
  const masthead = document.querySelector('[data-nav]');
  if (masthead) {
    let lastScroll = -1;
    const onScroll = () => {
      const y = window.scrollY;
      if (y === lastScroll) return;
      lastScroll = y;

      /* Progress 0 → 1 across 0–96px scroll. Drives backdrop blur + bg fade. */
      const progress = Math.min(1, Math.max(0, (y - 8) / 88));
      masthead.style.setProperty('--nav-progress', progress.toFixed(3));

      if (y > 32) masthead.classList.add('is-scrolled');
      else masthead.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Mobile drawer ───────────────────────────────────────────────── */
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
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setDrawer(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setDrawer(false);
        burger.focus();
      }
    });
    const mq = window.matchMedia('(min-width: 980px)');
    const onBreak = () => { if (mq.matches) setDrawer(false); };
    if (mq.addEventListener) mq.addEventListener('change', onBreak);
    else if (mq.addListener) mq.addListener(onBreak);
  }

  /* ─── Reveal-on-intersect — generic + staggered children ──────────── */
  /* Sections marked [data-reveal] fade up. Children with [data-stagger]
     within get a per-element delay computed from their index. */
  const reveals = document.querySelectorAll('[data-reveal]');

  if (reveals.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });
    reveals.forEach((el) => revealObserver.observe(el));

    /* Safety net: anything still hidden after 2.4s gets shown anyway. */
    setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains('is-in')) el.classList.add('is-in');
      });
    }, 2400);
  } else if (reveals.length) {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ─── Stagger-index assignment ────────────────────────────────────── */
  /* For any [data-stagger] group, write --stagger-i to each child so CSS
     can compute its delay. Avoids hand-coded nth-child math. */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const items = group.querySelectorAll(':scope > [data-stagger-item]');
    items.forEach((el, i) => {
      el.style.setProperty('--stagger-i', i);
    });
  });

  /* ─── Hero choreography ───────────────────────────────────────────── */
  /* The hero is above the fold and never needs an intersection trigger —
     fire its reveal immediately on next frame, after data-js paints
     the opacity-0 starting state. */
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    if (prefersReducedMotion) {
      hero.classList.add('is-in');
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => hero.classList.add('is-in'));
      });
    }
  }

  /* ─── Count-up — tabular numerals animating to final value ────────── */
  /* Targets: [data-countup] with a data-value attribute. Format hints:
       - integer: '2847', '41206', '312'
       - decimal: '79.4' (one decimal), keeps the format intact
       - percent: handled via separate countup on partners stat */
  const countUpEase = (t) => 1 - Math.pow(1 - t, 4); /* easeOutQuart */
  const formatNumber = (n, hasDecimal, hasComma) => {
    if (hasDecimal) return n.toFixed(1);
    const rounded = Math.round(n);
    if (hasComma) {
      /* Use Danish-friendly thousands. Match the original written format
         (comma for EN, period for DA) by keeping the source string's
         separator. We default to comma which we'll swap below if needed. */
      return rounded.toLocaleString('en-US');
    }
    return String(rounded);
  };

  const animateCountUp = (el) => {
    const raw = el.getAttribute('data-value') || el.textContent.trim();
    /* Detect format from the original string */
    const hasComma = /,/.test(raw);
    const hasDecimal = /\.\d/.test(raw);
    const target = parseFloat(raw.replace(/[,\s]/g, ''));
    if (!isFinite(target)) return;

    /* Pre-set with the starting glyph so layout doesn't jump */
    el.textContent = hasDecimal ? '0.0' : (hasComma ? '0' : '0');

    const duration = hasDecimal ? 1100 : Math.min(1600, 700 + Math.log10(target + 1) * 220);
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = countUpEase(t);
      const current = target * eased;
      el.textContent = formatNumber(current, hasDecimal, hasComma);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw; /* exact final, no rounding artefacts */
    };
    requestAnimationFrame(tick);
  };

  const countUps = document.querySelectorAll('[data-countup]');
  if (countUps.length) {
    if (prefersReducedMotion) {
      /* Reduced motion: jump straight to final values */
      countUps.forEach((el) => {
        const raw = el.getAttribute('data-value');
        if (raw) el.textContent = raw;
      });
    } else if ('IntersectionObserver' in window) {
      /* Pre-fill with the placeholder zero so reveal-anim doesn't read final */
      countUps.forEach((el) => {
        const raw = el.getAttribute('data-value') || el.textContent.trim();
        const hasComma = /,/.test(raw);
        const hasDecimal = /\.\d/.test(raw);
        el.textContent = hasDecimal ? '0.0' : (hasComma ? '0' : '0');
      });
      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            /* Stagger neighbouring count-ups by their stagger-index.
               --stagger-i lives on the [data-stagger-item] parent (set by
               the stagger loop above), so we walk up to find it. */
            const parent = entry.target.closest('[data-stagger-item]') || entry.target;
            const i = parseInt(parent.style.getPropertyValue('--stagger-i') || '0', 10);
            /* Sync to the section's own reveal animation: it lands ~520ms
               into the section's in-view crossing. Count-ups should start
               after the numerals have faded in, not before. */
            const delay = 320 + i * 120;
            setTimeout(() => animateCountUp(entry.target), delay);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countUps.forEach((el) => countObserver.observe(el));
    }
  }

  /* ─── Scroll-driven parallax for hero phone + DGU banner ──────────── */
  /* Lightweight: a single rAF loop reads scroll-relative offsets once
     per frame and writes a single transform value. Disabled for reduced
     motion, mobile (< 760px width avoids motion sickness on small screens
     where parallax exaggerates), and when off-screen. */
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  const enableParallax = parallaxElements.length
    && !prefersReducedMotion
    && window.innerWidth >= 760
    && 'IntersectionObserver' in window;

  if (enableParallax) {
    const tracked = [];
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
      tracked.push({ el, speed, inView: false, rect: null });
    });

    const visObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const t = tracked.find((x) => x.el === entry.target);
        if (t) t.inView = entry.isIntersecting;
      });
    }, { rootMargin: '20% 0px 20% 0px' });
    tracked.forEach((t) => visObserver.observe(t.el));

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      tracked.forEach((t) => {
        if (!t.inView) return;
        const rect = t.el.getBoundingClientRect();
        /* Anchor: when element centre crosses viewport centre, offset = 0.
           Above viewport centre → translateY negative (continues up).
           Below viewport centre → translateY positive (lags behind). */
        const elCentre = rect.top + rect.height / 2;
        const viewportCentre = vh / 2;
        const delta = (elCentre - viewportCentre) * -t.speed;
        t.el.style.setProperty('--parallax-y', `${delta.toFixed(2)}px`);
      });
      ticking = false;
    };
    const onScrollParallax = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    window.addEventListener('resize', onScrollParallax, { passive: true });
    update();
  }

  /* ─── Hero phone — cursor-aware subtle tilt ───────────────────────── */
  /* Only on capable pointers (fine = mouse/trackpad). Touch devices skip. */
  const phone = document.querySelector('[data-phone-tilt]');
  const tiltCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (phone && tiltCapable && !prefersReducedMotion) {
    let raf = null;
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    const updateTilt = () => {
      /* Spring toward target — simple lerp */
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      phone.style.setProperty('--tilt-x', `${currentX.toFixed(2)}deg`);
      phone.style.setProperty('--tilt-y', `${currentY.toFixed(2)}deg`);
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        raf = requestAnimationFrame(updateTilt);
      } else {
        raf = null;
      }
    };

    phone.addEventListener('mousemove', (e) => {
      const rect = phone.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   /* 0–1 */
      const y = (e.clientY - rect.top) / rect.height;
      const maxTilt = 6;                                 /* degrees */
      targetX = (0.5 - y) * maxTilt;                     /* rotateX */
      targetY = (x - 0.5) * maxTilt;                     /* rotateY */
      if (!raf) raf = requestAnimationFrame(updateTilt);
    });

    phone.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(updateTilt);
    });
  }

  /* ─── Language toggle — morphing slider ───────────────────────────── */
  /* Persists across visits. Single source of truth: data-lang on root. */
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
