/* The other tests loop over a page list derived from the files on disk. If a
   page silently dropped out of that list the loops would still pass while
   covering nothing, so the derivation is checked on its own. */
const { test, expect } = require('@playwright/test');
const { all, danishArticlePages, englishStories } = require('./pages');

test('every page that loads article.js is classified as Danish or English', () => {
  const usesArticleJs = all.filter(p => p.usesArticleJs);
  const classified = new Set([...danishArticlePages, ...englishStories].map(p => p.file));

  expect(usesArticleJs.filter(p => !classified.has(p.file)).map(p => p.file)).toEqual([]);
  expect(usesArticleJs.length).toBe(danishArticlePages.length + englishStories.length);
});

test('only the three stories carry a language switcher', () => {
  expect(all.filter(p => p.hasSwitcher).map(p => p.file).sort())
    .toEqual(englishStories.map(p => p.file).sort());
});

test('the Danish page count has not collapsed', () => {
  expect(danishArticlePages.length).toBeGreaterThanOrEqual(45);
  expect(englishStories.length).toBe(3);
});
