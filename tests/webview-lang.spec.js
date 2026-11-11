/* The in-app webview contract.
   The app opens the two legal pages with ?lang=en or ?lang=da and expects the
   whole page in that language. Every test here checks the lang attribute AND
   the visible text: a fix that only flips <html lang> would be worse than
   useless, because the app would show Danish terms under an English label. */
const { test, expect } = require('@playwright/test');
const { LEGAL, blockThirdParty } = require('./pages');

const DANISH_H1 = { '/terms-of-use': 'Vilkår for brug', '/privacy-policy': 'Privatlivspolitik' };
const ENGLISH_H1 = { '/terms-of-use': /^terms of use$/i, '/privacy-policy': /^privacy policy$/i };

test.beforeEach(async ({ page }) => { await blockThirdParty(page); });

for (const url of LEGAL) {
  test(`${url}?lang=en renders in English, attribute and text together`, async ({ page }) => {
    await page.goto(`${url}?lang=en`);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('data-lang', 'en');

    const h1 = page.locator('h1').first();
    await expect(h1).toHaveText(ENGLISH_H1[url]);
    await expect(h1).not.toHaveText(DANISH_H1[url]);
  });

  test(`${url}?lang=en translates the whole document, not just the heading`, async ({ page }) => {
    await page.goto(`${url}?lang=en`);

    // Apple needs the legal text itself in English, so on these two pages every
    // translatable element must ship an English string and must be showing it.
    const untranslated = await page.$$eval('[data-da]', els =>
      els.filter(el => !el.hasAttribute('data-en')).map(el => el.getAttribute('data-da')));
    expect(untranslated, 'every [data-da] element on a legal page needs a data-en').toEqual([]);

    const notSwapped = await page.$$eval('[data-da][data-en]', els =>
      els.filter(el => el.textContent !== el.getAttribute('data-en'))
         .map(el => el.getAttribute('data-en')));
    expect(notSwapped, 'these elements still show Danish under ?lang=en').toEqual([]);

    const count = await page.locator('[data-da][data-en]').count();
    expect(count).toBeGreaterThan(20);   // the assertion above must not pass on an empty set
  });

  test(`${url}?lang=da renders in Danish`, async ({ page }) => {
    await page.goto(`${url}?lang=da`);

    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.locator('h1').first()).toHaveText(DANISH_H1[url]);
  });

  test(`${url} ignores a stored language preference`, async ({ page, context }) => {
    // A visitor who once picked EN on one of the English stories must not turn
    // the Danish legal page English, for Google or for the app.
    await context.addInitScript(() => { try { localStorage.setItem('gs-lang', 'en'); } catch (e) {} });

    await page.goto(url);

    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.locator('h1').first()).toHaveText(DANISH_H1[url]);
  });

  test(`${url}?lang=en remembers nothing for the next load`, async ({ page }) => {
    await page.goto(`${url}?lang=en`);
    expect(await page.evaluate(() => localStorage.getItem('gs-lang'))).toBeNull();

    // second load in the same webview, no parameter: back to Danish
    await page.goto(url);
    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.locator('h1').first()).toHaveText(DANISH_H1[url]);
  });
}

test('a junk ?lang value falls back to the served Danish', async ({ page }) => {
  await page.goto('/terms-of-use?lang=de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'da');
  await expect(page.locator('h1').first()).toHaveText('Vilkår for brug');
});
