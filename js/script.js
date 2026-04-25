// ============================================================
// Golf Social — site interactivity
// ============================================================

// ── Rotating hero word (mirrors login-apple-v2.tsx) ─────────
const WORDS = ['connect', 'share', 'track', 'brag', 'play'];
const wordEl = document.querySelector('[data-rotating-word]');
if (wordEl) {
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % WORDS.length;
    const span = document.createElement('span');
    span.textContent = WORDS[idx];
    wordEl.innerHTML = '';
    wordEl.appendChild(span);
  }, 2500);
}

// ── Mobile nav toggle ───────────────────────────────────────
const toggle = document.querySelector('[data-nav-toggle]');
const drawer = document.querySelector('[data-mobile-nav]');
if (toggle && drawer) {
  toggle.addEventListener('click', () => {
    drawer.classList.toggle('is-open');
    document.body.style.overflow = drawer.classList.contains('is-open') ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    })
  );
}

// ── FAQ accordion ───────────────────────────────────────────
document.querySelectorAll('[data-faq] .faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    item.classList.toggle('is-open');
  });
});

// ── Reveal on scroll ────────────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

// ── Year in footer ──────────────────────────────────────────
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();
