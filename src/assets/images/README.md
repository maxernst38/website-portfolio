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
| Portrait | `portrait-1.jpg` | 4 / 5 | 880 × 1100 | Home hero slideshow |
| Portrait | `portrait-2.jpg` | 4 / 5 | 880 × 1100 | Home hero slideshow |
| Portrait | `portrait-3.jpg` | 4 / 5 | 880 × 1100 | Home hero slideshow |
| Nav card | `card-resume.jpg` | 4 / 3 | 736 × 552 | Home grid |
| Nav card | `card-projects.jpg` | 4 / 3 | 736 × 552 | Home grid |
| Nav card | `card-contact.jpg` | 4 / 3 | 736 × 552 | Home grid |
| Project shot | `project-*.png` | 16 / 9 | 1120 × 630 | Projects page |
| Demo frame | `kasparobot-oblique.jpg` | — | 1000 × 687 | Kasparobot demo |
| Demo frame | `kasparobot-overhead.jpg` | — | 1000 × 1000 | Kasparobot demo |
| Demo frame | `kasparobot-wide.jpg` | — | 1000 × 655 | Kasparobot demo |

The three `kasparobot-*.jpg` frames are the odd ones out: they are not content
slots, so they are not wired up in `site.js`. The demo imports them directly and
reads their pixels, and each one carries its own board-corner calibration in
[`src/demos/kasparobot/frames.js`](../../demos/kasparobot/frames.js), fitted
against **that exact framing**. Replacing a file with a different photo, or
adding a fourth, will render fine and put the grid in the wrong place — the
corners have to be refitted. Only the selected frame is downloaded, so the three
together do not cost a visitor 500 kB.

The hero is a slideshow, so add as many portraits as you like — crop them all
to the same 4/5 frame so they crossfade cleanly instead of jumping. Add or
remove entries in `profile.photos`; with one photo (or none yet) it renders as
a plain image with no controls.

Two more live in `public/` (not here) because they're referenced by URL rather
than imported: `favicon.svg` and `og-image.png` (1200 × 630, the social card).

## Tips

- **JPEG** for photographs, **PNG** for screenshots and anything with text, **SVG** for logos.
- Keep each file under ~300 kB. [Squoosh](https://squoosh.app) is a quick way to compress.
- The gray placeholder boxes on the site show the intended alt text and required
  aspect ratio, so they double as a shooting list.
