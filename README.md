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
