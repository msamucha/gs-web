/* Golfsocial v12 — article pages (blog posts + stories)
   Reveal-on-scroll + the shared EN/DA language toggle.
   Content authors never need to touch this file. */
(function () {
  /* ── reveal on scroll (progressive enhancement) ── */
  var SEL = [
    '.article__cover', '.story-hero', '.article__foot',
    '.news', '.foot__cta', '.foot__bar'
  ].join(', ');

  var els = document.querySelectorAll(SEL);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── language (EN / DA) — swaps every [data-da] element ──
     Two generations of page share this file:
       A. the three English stories: English is the element's own text, Danish
          sits in data-da, and the .lang__opt switcher is in the masthead;
       B. every Danish page: Danish is the element's own text so that is what
          Google is served, English sits in data-en, and there is no switcher.
     The switcher only runs where it exists. ?lang=en|da is honoured on both,
     which is what the in-app webview and shared links point at. */
  var opts = document.querySelectorAll('.lang__opt');
  var nodes = document.querySelectorAll('[data-da]');
  if (!nodes.length) return;

  nodes.forEach(function (el) {
    if (el.hasAttribute('data-en')) return;  // generation B already ships both languages
    el.setAttribute('data-en', el.tagName === 'INPUT' ? (el.getAttribute('placeholder') || '') : el.textContent);
  });

  function setLang(lang, remember) {
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
    if (remember) { try { localStorage.setItem('gs-lang', lang); } catch (e) {} }
  }

  opts.forEach(function (o) {
    o.addEventListener('click', function () { setLang(o.textContent.trim().toLowerCase(), true); });
  });

  var urlLang = null;
  try { urlLang = new URLSearchParams(location.search).get('lang'); } catch (e) {}

  if (urlLang === 'en' || urlLang === 'da') {
    setLang(urlLang, opts.length > 0);       // ?lang=en|da in the URL wins
  } else if (opts.length) {
    var saved;
    try { saved = localStorage.getItem('gs-lang'); } catch (e) {}
    setLang(saved === 'en' ? 'en' : 'da', false);   // Danish is the default
  }
  /* No switcher and no ?lang: the page is left exactly as it was served, so a
     Danish page stays Danish for the crawler and for everyone else. */
})();

/* newsletter sign-up → MailerLite, with a custom confirmation (same as the homepage) */
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
    var body = new URLSearchParams();
    body.append('fields[email]', val);
    body.append('ml-submit', '1');
    body.append('anticsrf', 'true');
    fetch(endpoint, { method: 'POST', body: body }).catch(function () {});
    form.classList.add('is-done');
  });

  email.addEventListener('input', function () { form.classList.remove('is-error'); });
})();
