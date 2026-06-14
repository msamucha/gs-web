/* Cookie consent + gated Google Analytics 4.
   GA4 (G-XEBPZS1TT2) loads ONLY after the visitor accepts. Choice is stored
   in localStorage('gs-consent') = 'granted' | 'denied'. Bilingual (DA default,
   EN if gs-lang === 'en'). Self-contained: no dependency on styles.css. */
(function () {
  var GA_ID = 'G-XEBPZS1TT2';
  var KEY = 'gs-consent';

  function loadGA() {
    if (window.__gsGaLoaded) return;
    window.__gsGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === 'granted') { loadGA(); return; }
  if (choice === 'denied') { return; }

  var en = false;
  try { en = localStorage.getItem('gs-lang') === 'en'; } catch (e) {}
  var t = en
    ? { text: 'We use Google Analytics to understand site traffic. It sets cookies.', accept: 'Accept', more: 'Learn more', aria: 'Cookie consent' }
    : { text: 'Vi bruger Google Analytics til at forstå trafikken på sitet. Det sætter cookies.', accept: 'Accepter', more: 'Læs mere', aria: 'Cookie-samtykke' };

  var css = '' +
    '.gs-consent{position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(140%);z-index:9999;' +
    'width:calc(100% - 40px);max-width:680px;background:#123f36;color:#fff;border-radius:18px;padding:20px 22px;' +
    'display:flex;align-items:center;gap:18px;flex-wrap:wrap;box-shadow:0 12px 44px rgba(0,0,0,.30);' +
    "font-family:'Helvetica Neue',Helvetica,'Inter',Arial,sans-serif;opacity:0;" +
    'transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .5s}' +
    '.gs-consent.gs-in{transform:translateX(-50%) translateY(0);opacity:1}' +
    '.gs-consent__text{margin:0;flex:1 1 300px;font-size:15px;line-height:1.5;color:rgba(255,255,255,.9);font-weight:400}' +
    '.gs-consent__link{color:#fff;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}' +
    '.gs-consent__btns{display:flex;gap:10px;flex:0 0 auto}' +
    '.gs-consent__btn{font-family:inherit;font-size:14px;font-weight:500;border-radius:99px;padding:10px 22px;' +
    'cursor:pointer;border:1px solid transparent;transition:opacity .2s,background .2s,border-color .2s;white-space:nowrap}' +
    '.gs-consent__btn--ghost{background:transparent;color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.35)}' +
    '.gs-consent__btn--ghost:hover{color:#fff;border-color:rgba(255,255,255,.65)}' +
    '.gs-consent__btn--solid{background:#fff;color:#123f36}' +
    '.gs-consent__btn--solid:hover{opacity:.85}' +
    '@media(max-width:560px){.gs-consent{flex-direction:column;align-items:stretch;gap:14px}' +
    '.gs-consent__btns{justify-content:flex-end}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.className = 'gs-consent';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', t.aria);
  bar.innerHTML =
    '<p class="gs-consent__text">' + t.text + ' <a class="gs-consent__link" href="privacy-policy">' + t.more + '</a></p>' +
    '<div class="gs-consent__btns">' +
    '<button type="button" class="gs-consent__btn gs-consent__btn--solid" data-act="accept">' + t.accept + '</button>' +
    '</div>';

  function decide(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    bar.classList.remove('gs-in');
    setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 500);
    if (v === 'granted') loadGA();
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    decide(b.getAttribute('data-act') === 'accept' ? 'granted' : 'denied');
  });

  function mount() {
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('gs-in'); });
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
