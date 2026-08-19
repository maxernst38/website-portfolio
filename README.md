# maxernst.org

Personal portfolio site. React + Vite + Tailwind CSS, deployed on Vercel.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

---

## Filling in the content

**Everything you need to edit lives in one file: [`src/content/site.js`](src/content/site.js).**
The components read from it, so you never have to touch JSX to change words or photos.

### Text

Every placeholder is prefixed with `TODO:`. To see what's left:

```bash
grep -rn "TODO:" src/content/site.js   # list every placeholder
grep -rc "TODO:" src/content/site.js   # count them — aim for 0
```

### Photos

Every photo slot is `src: null`, which renders a grey box at exactly the size
the real image will occupy — so nothing on the page moves when you add one.
Each box shows its intended alt text and required aspect ratio, so the
placeholders double as a shooting list.

To add a photo:

1. Save it into `src/assets/images/` (see [the size table](src/assets/images/README.md))
2. Uncomment its `import` at the top of `site.js`
3. Change that slot's `src: null` to `src: yourImportName`

Photos go in `src/assets/`, **not** `public/`, because Vite content-hashes
imported files (so browsers cache them forever but still pick up replacements)
and a misspelled filename becomes a build error instead of a silent 404.

### Resume PDF

Drop `resume.pdf` into `public/`, then set `profile.resumePdf = '/resume.pdf'`
in `site.js`. A "Download PDF" button appears on the resume page automatically;
while it's `null`, the button stays hidden.

### Social card

Add `public/og-image.png` at 1200 × 630 for link previews, and update the
`og:` tags in [`index.html`](index.html).

---

## Deployment

Pushing to `main` triggers a Vercel deploy. Every branch also gets a preview URL,
which is the right place to check a change before it reaches the live domain.

Two things this repo depends on:

- **[`vercel.json`](vercel.json)** rewrites all paths to `/index.html`. Without it,
  hard-refreshing `maxernst.org/projects` returns a 404 instead of the app,
  because the routes only exist client-side.
- **Vercel project settings** must be Framework Preset `Vite`, Output Directory
  `dist`, Node 22.x or 24.x.

The domain is fronted by Cloudflare. If the site ever returns
`ERR_TOO_MANY_REDIRECTS`, check that Cloudflare's SSL/TLS mode is **Full (Strict)**
— on "Flexible", Cloudflare talks HTTP to Vercel, Vercel upgrades to HTTPS, and
the two bounce the request between them forever.

---

## Notes for future edits

- **Colours** all come from the `@theme` block in
  [`src/styles/index.css`](src/styles/index.css). Editing the ten
  `--color-brand-*` lines re-themes the whole site; nothing references
  Tailwind's `indigo-*` directly.
- **Tailwind v4 only sees class names written out in full.** A class assembled
  at runtime (`` `text-${tone}-600` ``) silently produces no CSS. Variant maps
  in the components are objects of complete literal strings for this reason.
- **Tailwind ignores files listed in `.gitignore`** when scanning for classes.
  If styles ever vanish from a new directory, that's the first thing to check.
- **There is no contact form**, deliberately — see the comment block at the
  bottom of [`src/pages/Contact.jsx`](src/pages/Contact.jsx) for how to add a
  working one via a Vercel Function.
