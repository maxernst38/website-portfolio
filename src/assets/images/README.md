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
| Project media | `project-<slug>-1.jpg` | 16 / 9 | 1120 × 630 | Project page gallery |
| Video poster | `project-<slug>-poster.jpg` | 16 / 9 | 1120 × 630 | Project page gallery |

## Project galleries

Each project's page is a write-up plus a gallery — there are no live demos, so
the stills and clips are what show the thing working. Add as many entries as a
project deserves to its `media` array in `site.js`; the **first** one is also
the thumbnail on the /projects grid, so lead with the strongest shot.

Crop them all to 16/9. The first runs full width and the rest sit two-up, and a
mixed set of aspect ratios makes that grid look broken.

Videos go on YouTube rather than in this folder, but their **poster** frame is
an image and belongs here — that is what a visitor sees before pressing play,
and without one they get a plain dark frame.

The three `kasparobot-*.jpg` files are stock studio chessboard photos that the
old interactive demo used as computer-vision test input. They are not pictures
of the robot, so they are not gallery material and nothing imports them now.

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
