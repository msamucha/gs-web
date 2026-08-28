/* The three English stories are the other generation: English is the text in
   the file, Danish sits in data-da, and the masthead switcher is theirs alone.
   The Danish-first work must not take their switcher away. */
const { test, expect } = require('@playwright/test');
const { englishStories, firstH1, attrOnH1, blockThirdParty } = require('./pages');

test.beforeEach(async ({ page }) => { await blockThirdParty(page); });

test('there are exactly three of them and they are served in English', async ({ request }) => {
  expect(englishStories.map(p => p.url).sort()).toEqual([
    '/5-surprising-social-benefits-of-playing-golf',
    '/the-future-of-golf-how-tech-is-changing-the-game',
    '/we-made-threads-for-your-groups'
  ]);

  for (const story of englishStories) {
    const html = await (await request.get(story.url)).text();
    expect(html, `${story.url} must be served lang="en"`).toMatch(/<html[^>]*\slang="en"/);
    expect(firstH1(html)).not.toBe(attrOnH1(html, 'data-da'));
  }
});

for (const story of englishStories) {
  test(`${story.url} keeps a working masthead switcher`, async ({ page }) => {
    const english = firstH1(story.html);
    const danish = attrOnH1(story.html, 'data-da');
    expect(danish, 'the story needs a Danish h1 to switch to').toBeTruthy();

    await page.goto(`${story.url}?lang=en`);

    const opts = page.locator('.lang__opt');
    await expect(opts).toHaveCount(2);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1').first()).toHaveText(english);

    await opts.filter({ hasText: 'DA' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.locator('h1').first()).toHaveText(danish);
    expect(await page.evaluate(() => localStorage.getItem('gs-lang'))).toBe('da');

    await opts.filter({ hasText: 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1').first()).toHaveText(english);
    expect(await page.evaluate(() => localStorage.getItem('gs-lang'))).toBe('en');
  });

  test(`${story.url} honours ?lang=da from a link`, async ({ page }) => {
    await page.goto(`${story.url}?lang=da`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.locator('h1').first()).toHaveText(attrOnH1(story.html, 'data-da'));
  });
}

/* Current behaviour, pinned deliberately rather than assumed: a first visit to
   an English story with no ?lang and no stored preference is switched to
   Danish by article.js, while the served HTML, the <title> and the meta stay
   English. If that is ever changed on purpose, this test is the conversation. */
for (const story of englishStories) {
  test(`${story.url} renders Danish on a first visit, not the English it ships`, async ({ page }) => {
    await page.goto(story.url);
    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.locator('h1').first()).toHaveText(attrOnH1(story.html, 'data-da'));
    expect(await page.title(), 'the title is not translated with the body').toBe(
      (story.html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
  });
}
