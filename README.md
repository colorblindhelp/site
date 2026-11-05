# ColorBlind Helper website

Static marketing site for the ColorBlind Helper Chrome extension (listed on the Chrome Web Store as "Color Blind Mode"). Plain HTML, CSS and JavaScript: no build step and no dependencies, so it can be hosted as-is on GitHub Pages.

## Pages

- `index.html`: home (hero demo, features, how it works, founder, privacy summary, contact)
- `privacy.html`: the full extension privacy policy
- `404.html`: not-found page (GitHub Pages serves it automatically)

## Structure

```
assets/
  css/site.css      All styles: tokens at the top, then components and sections
  js/vision.js      Site-wide color vision preview (header control + status bar)
  js/site.js        Navigation, hero comparison lens, contrast sample, contact form
  fonts/            Self-hosted Poppins (headings) and Inter (body), both SIL OFL
  media/            Logo mark, founder photo, demo video + poster, social image
```

## Color vision preview

The preview applies an SVG `feColorMatrix` filter to the `<html>` element. The filters (`#cbh-protanopia`, `#cbh-deuteranopia`, `#cbh-tritanopia`, `#cbh-monochromacy`) are defined inline at the top of each page's `<body>` and use the Machado, Oliveira & Fernandes (2009) matrices at full severity, computed in linear RGB.

- The selected mode is saved in `localStorage` under `cbh-vision`, applied before first paint by a small inline script in `<head>`, and synced between open tabs.
- A mode can also be linked directly with `?vision=deuteranopia` (or `protanopia`, `tritanopia`, `monochromacy`, `normal`).

If you add a page, copy the `<head>` script, the `<svg class="svg-defs">` block, the header and the `.vision-bar` from an existing page.

## Contact form

The site is static, so the form opens the visitor's email app with a pre-filled message to the developer (`mailto:`). Validation and the success and error states are in `site.js`. To receive messages without the visitor's email app, point the form at a form service (Formspree, Basin, etc.) and replace the `mailto` step in the submit handler.
