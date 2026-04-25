# Golf Social — Web

Static HTML/CSS/JS prototype for the Golf Social product website.

Design language matches the iOS/Android app prototype (`golfsocial/app/`):
green-dark palette, HelveticaNeue, pill buttons, rounded cards.

## Structure

```
.
├── index.html      Landing page (hero, features, showcases, stats, FAQ, CTA)
├── features.html   Detailed feature grid
├── about.html      Mission, team, values
├── support.html    Help, contact, FAQ, status
├── privacy.html    GDPR-style privacy policy
├── terms.html      Terms of service
├── css/styles.css  Design tokens + components
├── js/script.js    Rotating hero word, mobile drawer, FAQ accordion, scroll-reveal
└── assets/         Images copied from the app prototype
```

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No build step. Pure static files.
