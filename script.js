/* Golfsocial v12 — scroll reveals (progressive enhancement) */
(function () {
  var SELECTOR = [
    '.hero__title', '.hero__sub', '.hero .badges',
    '.statcard__inner',
    '.dgu__text',
    '.inside',
    '.blogs__head', '.bcard',
    '.news',
    '.foot__cta', '.foot__bar'
  ].join(', ');

  var els = document.querySelectorAll(SELECTOR);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();

/* like button — ticks 18 → 19 when the stats card scrolls into view */
(function () {
  var pill = document.querySelector('.reactions .pill');
  if (!pill || !('IntersectionObserver' in window)) return;
  var num = pill.querySelector('.pill__num');
  var icon = pill.querySelector('.pill__icon');
  if (!num) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  num.textContent = '18';
  var fired = false;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !fired) {
        fired = true;
        io.unobserve(entry.target);
        var go = function () {
          num.textContent = '19';
          if (!reduce) pill.classList.add('is-bump');
        };
        reduce ? go() : setTimeout(go, 720);
      }
    });
  }, { threshold: 0.35 });

  io.observe(pill);
})();

/* DGU section — slide the tiles in, then play the connect → sync handicap story */
(function () {
  var gallery = document.querySelector('.dgu__gallery');
  if (!gallery || !('IntersectionObserver' in window)) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var connect = gallery.querySelector('.dgu__tile--connect');
  var story = gallery.querySelector('.dgu__tile--story');
  var items = gallery.querySelectorAll('.dgu__sync-item');
  var last = gallery.querySelector('.dgu__sync-item--3');
  var played = false;

  function play() {
    gallery.classList.add('is-in');           // fade the gallery in
    if (reduce || !story) {
      if (story) { gallery.classList.add('is-slid'); story.classList.add('is-profile'); }
      return;
    }
    setTimeout(function () { if (connect) connect.classList.add('is-tapped'); }, 1400);   // "tap" the button
    setTimeout(function () { gallery.classList.add('is-slid'); }, 1850);                   // connect → slot 1, loading slides into slot 2
    setTimeout(function () { items[0].classList.add('is-in'); }, 2700);                    // load the three lines
    setTimeout(function () { items[1].classList.add('is-in'); }, 3500);
    setTimeout(function () { items[2].classList.add('is-in'); }, 4300);
    setTimeout(function () { if (last) last.classList.add('is-done'); }, 5600);
    setTimeout(function () { story.classList.add('is-profile'); }, 7000);                  // cross-fade to profile (no slide)
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !played) {
        played = true;
        io.unobserve(entry.target);
        play();
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });   // only start once it's properly scrolled into view

  io.observe(gallery);
})();

/* language toggle (EN / DA) — swaps every [data-da] element */
(function () {
  var opts = document.querySelectorAll('.lang__opt');
  if (!opts.length) return;
  var nodes = document.querySelectorAll('[data-da]');

  // cache the original English text / placeholder
  nodes.forEach(function (el) {
    el.setAttribute('data-en', el.tagName === 'INPUT' ? (el.getAttribute('placeholder') || '') : el.textContent);
  });

  function setLang(lang) {
    if (lang !== 'da') lang = 'en';
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    nodes.forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val == null) return;
      if (el.tagName === 'INPUT') el.setAttribute('placeholder', val);
      else el.textContent = val;
    });
    opts.forEach(function (o) {
      o.classList.toggle('is-active', o.textContent.trim().toLowerCase() === lang);
    });
    try { localStorage.setItem('gs-lang', lang); } catch (e) {}
  }

  opts.forEach(function (o) {
    o.addEventListener('click', function () { setLang(o.textContent.trim().toLowerCase()); });
  });

  var saved;
  try { saved = localStorage.getItem('gs-lang'); } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'da');   // Danish is the default
})();

/* newsletter sign-up → MailerLite, with a custom confirmation */
(function () {
  var form = document.querySelector('.news__form[data-ml-form]');
  if (!form) return;
  var email = form.querySelector('.news__email');
  var endpoint = 'https://assets.mailerlite.com/jsonp/1746153/forms/' + form.getAttribute('data-ml-form') + '/subscribe';
  var done = false;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (done) return;
    var val = (email.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
      form.classList.add('is-error');
      email.focus();
      return;
    }
    form.classList.remove('is-error');
    done = true;
    var fd = new FormData();
    fd.append('fields[email]', val);
    fd.append('ml-submit', '1');
    fd.append('anticsrf', 'true');
    fetch(endpoint, { method: 'POST', body: fd }).catch(function () {});
    form.classList.add('is-done');   // optimistic — the double opt-in email is the real confirmation
  });

  email.addEventListener('input', function () { form.classList.remove('is-error'); });
})();

/* "Inside the app" carousel: drag-to-scroll with the mouse (touch already swipes) */
(function () {
  var swipe = document.querySelector('.inside__swipe');
  if (!swipe) return;

  var dragging = false;
  var startX = 0;
  var startScroll = 0;

  swipe.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;   // leave touch/pen to native scroll-snap
    dragging = true;
    startX = e.clientX;
    startScroll = swipe.scrollLeft;
    swipe.style.scrollSnapType = 'none';     // let the drag move freely, snap re-engages on release
    swipe.classList.add('is-dragging');
    swipe.setPointerCapture(e.pointerId);
  });

  swipe.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    swipe.scrollLeft = startScroll - (e.clientX - startX);
  });

  function end() {
    if (!dragging) return;
    dragging = false;
    swipe.style.scrollSnapType = '';         // hand control back to scroll-snap
    swipe.classList.remove('is-dragging');
  }

  swipe.addEventListener('pointerup', end);
  swipe.addEventListener('pointercancel', end);
})();
