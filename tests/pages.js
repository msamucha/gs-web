/* The page inventory is derived from the files on disk, not hard-coded, so a
   page added later is covered by the SEO tests without anyone remembering to
   add it here. tests/inventory.spec.js guards the derivation itself. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const all = fs.readdirSync(ROOT)
  .filter(function (f) { return f.endsWith('.html'); })
  .sort()
  .map(function (file) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const lang = (html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1] || null;
    return {
      file: file,
      url: '/' + file.replace(/\.html$/, '').replace(/^index$/, ''),
      lang: lang,
      usesArticleJs: /<script[^>]+src="article\.js/.test(html),
      hasSwitcher: /class="lang__opt/.test(html),
      html: html
    };
  });

/* Generation B: Danish is the text in the file, English lives in data-en,
   no switcher. This is what Google is served. */
const danishArticlePages = all.filter(function (p) {
  return p.usesArticleJs && p.lang === 'da';
});

/* Generation A: English is the text in the file, Danish lives in data-da,
   switcher in the masthead. */
const englishStories = all.filter(function (p) {
  return p.usesArticleJs && p.lang === 'en';
});

const LEGAL = ['/terms-of-use', '/privacy-policy'];

function firstH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function attrOnH1(html, attr) {
  const m = html.match(new RegExp('<h1[^>]*\\s' + attr + '="([^"]*)"'));
  return m ? m[1] : null;
}

/* Every third-party call is blocked: the tests are about our own markup and
   article.js, and GA / MailerLite would only add latency and flakiness.
   skipAssets also drops images and video, which nothing here looks at. */
const ASSETS = new Set(['image', 'media', 'font']);

async function blockThirdParty(page, options) {
  const skipAssets = !!(options && options.skipAssets);
  await page.route('**/*', function (route) {
    const request = route.request();
    if (skipAssets && ASSETS.has(request.resourceType())) return route.abort();
    const url = new URL(request.url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    return route.abort();
  });
}

module.exports = { ROOT, all, danishArticlePages, englishStories, LEGAL, firstH1, attrOnH1, blockThirdParty };
