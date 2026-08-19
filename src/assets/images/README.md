# Images

Drop photos in this folder, then wire them up in [`src/content/site.js`](../../content/site.js):

1. Save the file here, e.g. `portrait.jpg`
2. Uncomment its `import` at the top of `site.js`
3. Change the matching `src: null` to `src: portrait`

Files here are processed by Vite: they get content-hashed filenames (so browsers
cache them forever but still pick up replacements), and a typo in the filename
becomes a **build error** rather than a silent 404 in production. That is why
photos live here and not in `public/`.

## Sizes to export

Export at 2× the display size so they stay sharp on retina screens.

| Slot | File | Aspect | Export at | Used on |
|---|---|---|---|---|
| Portrait | `portrait.jpg` | 4 / 5 | 880 × 1100 | Home hero |
| Nav card | `card-resume.jpg` | 4 / 3 | 736 × 552 | Home grid |
| Nav card | `card-projects.jpg` | 4 / 3 | 736 × 552 | Home grid |
| Nav card | `card-contact.jpg` | 4 / 3 | 736 × 552 | Home grid |
| Project shot | `project-*.png` | 16 / 9 | 1120 × 630 | Projects page |

Two more live in `public/` (not here) because they're referenced by URL rather
than imported: `favicon.svg` and `og-image.png` (1200 × 630, the social card).

## Tips

- **JPEG** for photographs, **PNG** for screenshots and anything with text, **SVG** for logos.
- Keep each file under ~300 kB. [Squoosh](https://squoosh.app) is a quick way to compress.
- The gray placeholder boxes on the site show the intended alt text and required
  aspect ratio, so they double as a shooting list.
