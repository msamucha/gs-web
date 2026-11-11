# Golfsocial website

The production website for [golfsocial.club](https://golfsocial.club) — a static
HTML/CSS/JS site, no build step, deployed with Vercel.

## How it deploys

- Every push to `main` goes live on golfsocial.club.
- Every branch push gets its own Vercel preview URL — share it for approval
  before merging.
- `vercel.json` handles clean URLs (`/privacy-policy` instead of
  `/privacy-policy.html`) and permanent redirects from the old Webflow URLs.

## Who does what

- **Design & structure:** locked. Changes go through Michel.
- **Content (blog posts, stories, copy):** Dan, via his Claude. The rules live
  in `CLAUDE.md` (read automatically by Claude) and `BLOG-GUIDE.md`
  (step-by-step guide + allowed tags + a ready-made prompt).

## File map

```
index.html                                   homepage
5-surprising-social-benefits-...html         blog post (also the article template)
the-future-of-golf-...html                   blog post
dgu-collaboration.html                       blog post
privacy-policy.html                          privacy policy (EN/DA)
styles.css                                   design system — do not edit
article.css                                  article design — do not edit
script.js / article.js                       behaviour — do not edit
images/                                      all images (.webp + logo.svg)
vercel.json                                  hosting config — do not edit
BLOG-GUIDE.md                                how to write an article
CLAUDE.md                                    rules for AI assistants
```

## Local preview

```
python3 -m http.server 8080
```

Open http://localhost:8080. Preview over localhost (not file://) so the
newsletter form works.

## Tests

```
npm ci
npx playwright install chromium
npm test
```

The tests serve this repo on localhost and run against it, so they need no
deploy and no Vercel preview (previews sit behind SSO, which CI cannot log in
to). They run on every pull request.

What they hold in place is the EN/DA contract, which has two sides that pull
against each other:

- the app opens `/terms-of-use?lang=en` and `/privacy-policy?lang=en` in its
  webview and must get English text under `lang="en"`, remembering nothing
  between loads;
- every Danish page must still be served, and stay, Danish under `lang="da"`
  when there is no `?lang`, which is what Google indexes;
- the three English stories keep their masthead switcher;
- `article.js` must never overwrite a `data-en` string that a page ships.

`tests/pages.js` reads the page list off disk, so a new page is covered without
anyone adding it to a list.
