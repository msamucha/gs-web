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

  /* ── language toggle (EN / DA) — swaps every [data-da] element ── */
  var opts = document.querySelectorAll('.lang__opt');
  if (!opts.length) return;
  var nodes = document.querySelectorAll('[data-da]');

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
  if (saved === 'da') setLang('da');
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
