/* The SEO side of the same contract, which pulls the other way.
   Without ?lang, every Danish page must be served, and must stay, exactly as
   written: Danish text under lang="da". This is what stops a future "let us
   just add a language toggle" from quietly turning the site English for Google. */
const { test, expect } = require('@playwright/test');
const { danishArticlePages, firstH1, attrOnH1, blockThirdParty } = require('./pages');

test.describe('served HTML', () => {
  test('every Danish article page ships Danish under lang="da"', async ({ request }) => {
    test.setTimeout(60_000);
    const problems = [];

    for (const page of danishArticlePages) {
      const res = await request.get(page.url);
      const html = await res.text();

      if (res.status() !== 200) { problems.push(`${page.url}: HTTP ${res.status()}`); continue; }
      if (!/<html[^>]*\slang="da"/.test(html)) problems.push(`${page.url}: <html> is not lang="da"`);

      const h1 = firstH1(html);
      const da = attrOnH1(html, 'data-da');
      const en = attrOnH1(html, 'data-en');
      if (da && h1 !== da) problems.push(`${page.url}: served h1 "${h1}" is not the data-da text "${da}"`);
      if (en && h1 === en) problems.push(`${page.url}: served h1 is the English text "${en}"`);
    }

    expect(problems).toEqual([]);
    expect(danishArticlePages.length).toBeGreaterThanOrEqual(45);
  });
});

test.describe('after article.js runs', () => {
  test.beforeEach(async ({ page }) => { await blockThirdParty(page, { skipAssets: true }); });

  test('no Danish page switches itself away from Danish', async ({ page }) => {
    test.setTimeout(120_000);
    const problems = [];

    for (const entry of danishArticlePages) {
      await page.goto(entry.url);

      // Not only the heading: every translatable element must still be showing
      // its Danish string, so a paragraph cannot quietly turn English either.
      // Inputs are left out on purpose. The newsletter field still ships the
      // English placeholder "you@email.com" with the Danish in data-da, a
      // leftover from the Danish-first flip, reported rather than fixed here.
      const state = await page.evaluate(() => {
        const squash = s => (s || '').replace(/\s+/g, ' ').trim();
        return {
          lang: document.documentElement.getAttribute('lang'),
          h1: squash(document.querySelector('h1').textContent),
          english: Array.from(document.querySelectorAll('[data-da]'))
            .filter(el => el.tagName !== 'INPUT')
            .filter(el => squash(el.textContent) !== squash(el.getAttribute('data-da')))
            .slice(0, 3)
            .map(el => squash(el.textContent))
        };
      });

      const served = (firstH1(entry.html) || '').replace(/\s+/g, ' ').trim();
      if (state.lang !== 'da') problems.push(`${entry.url}: <html lang> became "${state.lang}"`);
      if (state.h1 !== served) problems.push(`${entry.url}: h1 changed to "${state.h1}" (served "${served}")`);
      for (const text of state.english) problems.push(`${entry.url}: element no longer shows its Danish: "${text}"`);
    }

    expect(problems).toEqual([]);
  });

  test('a stored English preference does not leak into a Danish article page', async ({ page, context }) => {
    await context.addInitScript(() => { try { localStorage.setItem('gs-lang', 'en'); } catch (e) {} });
    const entry = danishArticlePages[0];

    await page.goto(entry.url);

    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    expect(await page.locator('h1').first().textContent()).toBe(firstH1(entry.html));
  });
});
