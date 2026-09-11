# Thai Dinh Chinh — Portfolio

Personal portfolio of **Thai Dinh Chinh — IT Project Manager & Business Analyst**, live at [dinhchinh.work](https://dinhchinh.work).

Plain HTML + CSS + JS. No framework, no build step — edit a file, refresh, push.

## Structure

```
index.html              Home: hero, stats, how I work, featured case studies, experience, skills, education, CTA
portfolio.html          All case studies (with filters) + leadership & community
work/<slug>.html        One page per case study (Context → Problem → My role → Process → Artifacts → Outcome → Learnings)
resume.html             Full resume (experience, education, skills, certifications) + Download PDF / Print
blog.html               Writing — short notes (links to Instagram posts)
contact.html            Contact details + form (FormSubmit → delivered to your inbox, AJAX with no-JS fallback)
404.html                Not-found page (GitHub Pages serves it automatically; uses root-absolute links)
sitemap.xml, robots.txt SEO

assets/css/main.css     Design system ("Liquid Glass"): tokens, glass surfaces, layout, components, light/dark
assets/js/main.js       Theme toggle, mobile nav, cursor light, scroll reveal, filters, case-study TOC, contact form
assets/images/          Optimised images (≤1600px). Originals kept in assets/images/_originals/
                        favicon.svg / favicon-32.png / apple-touch-icon.png — the "overlap" glyph (business ∩ engineering)
assets/files/           CV PDF
CNAME                   Custom domain for GitHub Pages
```

## Editing content

| What | Where |
|---|---|
| Headline, intro, stats, featured work | `index.html` |
| Job history | `resume.html` (full) and `index.html` → "Recent roles" (short) |
| A case study | `work/<slug>.html` — every section is a `<section class="cs-section">` |
| Add a case study | Copy any `work/*.html`, change title/meta/sections, then add a card in `portfolio.html` (and optionally `index.html`). Card tags (`data-tags="pm ba program product"`) drive the filters. |
| Contact details | `contact.html`, the footer in every page, and the form's `action` / `data-endpoint` / `data-to` |
| CV PDF | Replace `assets/files/CV_ThaiDinhChinh.pdf` (same name → no HTML changes) |
| Profile photo | Replace `assets/images/profile.png` (square, ≥800px recommended) |
| Project covers | `assets/images/<slug>-*.jpg`, referenced from the card in `portfolio.html` / `index.html` and the `.cs-cover` in `work/<slug>.html` (16:10 works best) |
| Social-share image | `assets/images/og-cover.jpg` (1200×630) |

The nav and footer are repeated in every page (no templating) — when you change them, search-and-replace across `*.html` and `work/*.html`.

## Theming

All colours, radii, shadows and fonts are CSS custom properties at the top of `assets/css/main.css` (`:root` for light, `[data-theme="dark"]` for dark). The theme follows the OS setting until the visitor uses the toggle; the choice is stored in `localStorage` (`tdc-theme`).

Handy URL flags for testing: `?theme=light` / `?theme=dark` forces a theme; `?nomotion=1` disables reveal animations.

## Run locally

Any static server works:

```bash
python -m http.server 4173
```

or `npm run dev` (uses `npx serve`). Open http://localhost:4173.

## Deploy

GitHub Pages serves the repository root. Push to the branch configured in *Settings → Pages*; `CNAME` points the custom domain.

## Contact form (FormSubmit)

The form posts to [FormSubmit](https://formsubmit.co) — messages land in **lucian03.forwork@gmail.com**, no backend or account needed.

1. **Activate once:** after deploying, submit the form on the live site. FormSubmit emails an activation link to the inbox — click it. Until then nothing is delivered.
2. **Optional — hide the address:** the activation email also gives a random alias (`https://formsubmit.co/el/xxxxxx`). Replace the email in the form's `action`, `data-endpoint` (`https://formsubmit.co/ajax/el/xxxxxx`) in `contact.html` so scrapers can't read the address from the HTML.
3. Hidden fields control delivery: `_subject` (set per message by JS), `_template=table`, `_captcha=false` (a honeypot field `_honey` filters bots instead), `_next` (redirect for the no-JS fallback → `contact.html?sent=1` shows the thank-you card).

JS submits via the AJAX endpoint and shows an inline loading → success / error state; without JS the browser POSTs normally and FormSubmit redirects back.

## Page transitions

Browsers with cross-document View Transitions (Chromium 126+, Safari 18.2+) animate page changes natively via `@view-transition { navigation: auto }` — the nav and background stay put while content cross-fades with a soft scale + blur. Other browsers get the same look from `html.vt-fallback` (set in `<head>`): a CSS enter animation plus a JS fade-out before navigation. A slim gradient progress bar at the top shows navigation/loading. Everything respects `prefers-reduced-motion`.
