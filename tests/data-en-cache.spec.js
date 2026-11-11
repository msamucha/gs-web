/* The trap.
   article.js caches an English copy of every [data-da] element so the switcher
   has something to swap back to. On the English stories that cache must be
   filled from the element's own text. On the Danish pages the element's own
   text is Danish, so filling the cache there overwrites the real English
   string with Danish, and ?lang=en then "works" while showing Danish. That is
   exactly what made the obvious fix destructive, so it gets its own test. */
const { test, expect } = require('@playwright/test');
const { danishArticlePages, englishStories, blockThirdParty } = require('./pages');

const readPairs = els => els.map(el => [el.getAttribute('data-da'), el.getAttribute('data-en')]);

/* Same page, JavaScript off: the attributes exactly as the file ships them. */
async function servedPairs(browser, baseURL, url) {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const page = await context.newPage();
  await blockThirdParty(page, { skipAssets: true });
  await page.goto(url);
  const pairs = await page.$$eval('[data-da]', readPairs);
  await context.close();
  return pairs;
}

const SAMPLE = ['/terms-of-use', '/privacy-policy'];

test.describe('Danish pages: the cache must not touch data-en', () => {
  test.beforeEach(async ({ page }) => { await blockThirdParty(page, { skipAssets: true }); });

  for (const url of [...SAMPLE, ...danishArticlePages.slice(0, 3).map(p => p.url)]) {
    for (const query of ['', '?lang=en']) {
      test(`${url}${query} leaves every shipped data-en as written`, async ({ page, browser, baseURL }) => {
        const served = await servedPairs(browser, baseURL, url);
        const shipped = served.map((pair, i) => [i, pair[1]]).filter(([, en]) => en !== null);
        expect(shipped.length, `${url} should ship real English strings`).toBeGreaterThan(10);

        await page.goto(url + query);
        const after = await page.$$eval('[data-da]', readPairs);
        expect(after.length, 'the element list must not change').toBe(served.length);

        // Elements that ship no data-en are legitimately cached from their own
        // text: that is the untranslated fallback. Elements that do ship one
        // hold the real English string and must come out untouched.
        const overwritten = shipped
          .filter(([i, en]) => after[i][1] !== en)
          .map(([i, en]) => ({ danish: served[i][0], shipped: en, became: after[i][1] }));
        expect(overwritten).toEqual([]);
      });
    }
  }

  test('the h1 keeps its English string after ?lang=en', async ({ page }) => {
    await page.goto('/terms-of-use?lang=en');
    const h1 = page.locator('h1').first();
    await expect(h1).toHaveAttribute('data-en', /^terms of use$/i);
    await expect(h1).toHaveAttribute('data-da', 'Vilkår for brug');
  });
});

test.describe('English stories: the cache must still fill', () => {
  test.beforeEach(async ({ page }) => { await blockThirdParty(page, { skipAssets: true }); });

  const story = englishStories[0];

  test(`${story.url} caches its own English text and keeps data-da`, async ({ page, browser, baseURL }) => {
    const served = await servedPairs(browser, baseURL, story.url);
    expect(served.some(([, en]) => en === null), 'the stories ship no data-en of their own').toBe(true);

    await page.goto(story.url);
    const after = await page.$$eval('[data-da]', els =>
      els.map(el => [el.getAttribute('data-da'), el.getAttribute('data-en'), el.textContent]));

    expect(after.map(p => p[0])).toEqual(served.map(p => p[0]));       // Danish untouched
    expect(after.every(([, en]) => en !== null)).toBe(true);           // English cached
    expect(after.filter(([da, en]) => en === da).length).toBeLessThan(after.length / 2);
  });
});
