# Golfsocial — how to add a blog post

The design is locked. You only ever write **content**, never styling. Follow
the three steps below and the page will always match the rest of the site.

There are two templates:

| Template | File to copy | Use it for |
| --- | --- | --- |
| **Article (with cover)** | `5-surprising-social-benefits-of-playing-golf.html` | Any article with a cover photo |
| **Article (text only)** | `strokes-gained-forklaret.html` | A typography-led article with no cover image |

---

## Step 1 — copy the template

Duplicate the matching file and rename it to your URL slug, lowercase with
hyphens, ending in `.html`:

```
how-to-lower-your-handicap.html
the-2026-season-in-numbers.html
```

That filename becomes the page address (`golfsocial.club/how-to-lower-your-handicap`).

## Step 2 — change the parts marked « EDIT »

Open the file and change only:

1. The `<title>` and `<meta name="description">` in the `<head>` (used by Google and link previews).
2. The header text — **title** and **meta** (read time · author).
3. The cover image: put your image in the `images/` folder and point the `background-image` url at it.
4. The article text, between `<!-- CONTENT START -->` and `<!-- CONTENT END -->`.

Leave everything else exactly as it is — the header, the footer, the `<link>`
and `<script>` tags, and every class name.

## Step 3 — write the content

Inside `CONTENT START / END` you only use these plain tags. The design is
applied automatically, so you never need a class except where noted.

```html
<p class="lead">The opening paragraph. Slightly larger. Use it once, at the top.</p>

<p>A normal paragraph. Write as many as you like.</p>

<h2>A section heading</h2>

<h3>A smaller sub-heading</h3>

<ul>
  <li>A bullet point</li>
  <li>Another bullet point</li>
</ul>

<ol>
  <li>A numbered step</li>
</ol>

<blockquote>A pull-quote that you want to stand out.</blockquote>

<figure>
  <img src="images/your-image.webp" alt="Describe the image" />
  <figcaption>Optional caption under the image.</figcaption>
</figure>

<hr />  <!-- a thin divider line between parts -->

<!-- inside any paragraph -->
<strong>bold</strong>, <em>italic</em>, <a href="https://...">a link</a>
```

### Optional: a green "key points" panel

```html
<div class="callout">
  <h3>What changes for you</h3>
  <ul>
    <li><strong>Point one:</strong> short explanation.</li>
    <li><strong>Point two:</strong> short explanation.</li>
  </ul>
</div>
```

### Optional: a text-only article (no cover image)

For a typography-led post with no photo, copy `strokes-gained-forklaret.html`
instead. The only difference is the header:

- the `<article>` opens with `class="article article--text"`,
- there is no `<figure class="article__media">` cover,
- a short kicker sits above the title:
  `<p class="article__eyebrow" data-da="Dansk kicker">English kicker</p>`.

Everything else (title, meta, the CONTENT block, all the tags above) is
identical. The first letter of the `lead` paragraph becomes a large green
drop-cap automatically.

---

## Rules (so the design never breaks)

- ✅ Use only the tags above, between the CONTENT markers.
- ✅ Keep one `<p class="lead">` at most, as the first paragraph.
- ❌ No `style="..."` attributes, no `<style>` blocks, no new class names.
- ❌ Don't touch the header, footer, `<link>` or `<script>` tags.
- ❌ Don't paste formatting from Word or Google Docs (it brings hidden styles).
  Write or paste plain text and wrap it in the tags above.

### House style

- Sentence case for headlines and labels, never ALL CAPS.
- No em-dashes (—). Use a comma, a colon, or a full stop.
- Images: export as `.webp`, drop them in `images/`, and always add `alt` text.

---

## A prompt you can give your AI

Paste this, then add your article text:

> You are editing a Golfsocial website article. I will give you the article
> text. Put it into a copy of the article template
> (`5-surprising-social-benefits-of-playing-golf.html`). Only edit the parts marked « EDIT » and the content
> between `<!-- CONTENT START -->` and `<!-- CONTENT END -->`. Use only these
> tags: `<p>`, `<p class="lead">` (first paragraph), `<h2>`, `<h3>`, `<ul>/<ol>/<li>`,
> `<blockquote>`, `<figure><img><figcaption>`, `<hr>`, `<strong>`, `<em>`, `<a>`,
> and `<div class="callout">` for a key-points box. Do not add any `style`
> attributes, `<style>` tags or new class names. Do not change the header,
> footer, stylesheet links or scripts. Use sentence case, no ALL CAPS, and no
> em-dashes. Set the `<title>`, the meta description, the title and
> the meta/byline to match the article. Here is the article:
>
> [paste your title, author, and body text here]
