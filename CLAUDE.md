# Golfsocial website — rules for AI assistants

This repo is the **production website** for golfsocial.club. Every merge to `main`
deploys live via Vercel. The design is finished and locked; this repo exists so
content (blog posts, stories, copy fixes) can be added without touching design.

## Hard rules — never break these

1. **Never edit these files:** `styles.css`, `article.css`, `script.js`,
   `article.js`, `vercel.json`. They are the locked design system.
2. **Never** add inline `style="..."` attributes, `<style>` blocks, new CSS
   classes, or new `<script>` tags anywhere.
3. **Never restructure** `index.html` or the shared chrome (masthead, footer,
   newsletter section) on any page.
4. **Never push to `main`.** Work on a branch, push the branch, and share the
   Vercel preview URL for approval. Michel merges.

## What you MAY do

- Create a new blog post by **copying the template file** and editing
  only the parts marked « EDIT » and the content between
  `<!-- CONTENT START -->` and `<!-- CONTENT END -->`.
  - Article template: `5-surprising-social-benefits-of-playing-golf.html`
  - Full instructions + allowed tags: `BLOG-GUIDE.md` (read it before writing)
- Fix typos or update copy in existing articles (inside the content markers).
- Add a new card to the homepage blog row: duplicate an existing
  `<a class="bcard">...</a>` block inside `<div class="blogs__row">` in
  `index.html` and change ONLY its `href`, title text, meta text, and the
  `background-image` url. Change nothing else in `index.html`.
- Add images: export as `.webp`, put them in `images/`, reference them
  relatively (`images/your-image.webp`), always with `alt` text.

## Handing off finished content

When content is ready, open a pull request against `main`. The pull request
IS the handoff: it notifies Michel in Slack, and he reviews and merges from it.

1. Work on a branch named for the content,
   e.g. `post/how-to-lower-your-handicap`.
2. Push the branch and open a PR. Fill in every section of the PR template
   (`.github/PULL_REQUEST_TEMPLATE.md`). Do not replace it with an
   auto-generated body.
3. Vercel comments on the PR with a preview link within a couple of minutes.
   Open it, check the page, then paste the link into the Preview section of
   the PR description.
4. Content is not delivered until the PR is open, the checklist is complete,
   and the preview link works.

## House style

- Sentence case for headings and labels. No ALL CAPS.
- No em-dashes (—) anywhere. Use a comma, colon, or full stop.
- Write content in English. Danish lives in `data-da="..."` attributes on the
  same element (the site's EN/DA toggle swaps them). If you don't have a Danish
  translation, omit `data-da` and the element simply stays English in DA mode.
  If a paragraph contains a link, wrap the translatable text in
  `<span data-da="...">` and keep the `<a>` outside the span.
- Page `<title>` format: `Page name · Golfsocial`.
- Contact email is hello@golfsocial.club.

## URLs

Vercel serves clean URLs: `your-post.html` is reachable as `/your-post`.
Name files as the url slug: lowercase, hyphens, `.html`
(e.g. `how-to-lower-your-handicap.html` → golfsocial.club/how-to-lower-your-handicap).

## Local preview

```
python3 -m http.server 8080
```
Then open http://localhost:8080. (Opening files directly as file:// breaks the
newsletter form, so always preview over localhost.)
