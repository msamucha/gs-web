/* Cookie notice + Google Analytics 4.
   GA4 (G-XEBPZS1TT2) loads on every visit. The banner is an informational
   notice; Accept just dismisses it (stored in localStorage('gs-consent') so it
   only shows once). Bilingual (DA default, EN if gs-lang === 'en'). Self-contained. */
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

  loadGA(); // analytics loads on every visit; the banner below is an informational notice
  var seen = null;
  try { seen = localStorage.getItem(KEY); } catch (e) {}
  if (seen) return;

  var en = false;
  try { en = localStorage.getItem('gs-lang') === 'en'; } catch (e) {}
  var t = en
    ? { text: 'We use cookies to improve your experience.', accept: 'Accept', more: 'Learn more', aria: 'Cookie consent' }
    : { text: 'Vi bruger cookies til at forbedre din oplevelse.', accept: 'Accepter', more: 'Læs mere', aria: 'Cookie-samtykke' };

  var css = '' +
    '.gs-consent{position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(140%);z-index:9999;' +
    'width:calc(100% - 40px);max-width:680px;background:#fff;color:#16221f;border:1px solid rgba(0,0,0,.08);border-radius:18px;padding:20px 22px;' +
    'display:flex;align-items:center;gap:18px;flex-wrap:wrap;box-shadow:0 12px 44px rgba(0,0,0,.16);' +
    "font-family:'Helvetica Neue',Helvetica,'Inter',Arial,sans-serif;opacity:0;" +
    'transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .5s}' +
    '.gs-consent.gs-in{transform:translateX(-50%) translateY(0);opacity:1}' +
    '.gs-consent__text{margin:0;flex:1 1 300px;font-size:15px;line-height:1.5;color:#16221f;font-weight:400}' +
    '.gs-consent__link{color:#16221f;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}' +
    '.gs-consent__btns{display:flex;gap:10px;flex:0 0 auto}' +
    '.gs-consent__btn{font-family:inherit;font-size:14px;font-weight:500;border-radius:99px;padding:10px 22px;' +
    'cursor:pointer;border:1px solid transparent;transition:opacity .2s,background .2s,border-color .2s;white-space:nowrap}' +
    '.gs-consent__btn--ghost{background:transparent;color:rgba(0,0,0,.55);border-color:rgba(0,0,0,.25)}' +
    '.gs-consent__btn--ghost:hover{color:#16221f;border-color:rgba(0,0,0,.5)}' +
    '.gs-consent__btn--solid{background:#123f36;color:#fff}' +
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
