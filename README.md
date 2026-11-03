# Velík a Polly hledají domov

One-page story site (Svelte 5 + Vite, static).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static files in dist/
```

## Where to change things

Everything editable lives in `src/content.js`:

- **Contact:** `contact.email`, `contact.instagram`, then set `contact.placeholder` to `false`. That enables the Instagram link and lets search engines index the page: while it's `true` the page carries `noindex, nofollow`. The e-mail button opens a pre-filled message; there is no backend.
- **Photos:** put the original files in `photos/` (project root) and set `photo: '/photos/name.jpg'` on the matching cat, stop or gallery entry. Until then a labelled placeholder shows. Stop and cat photos are 4:5 portrait.
  `scripts/images.js` turns each original into several widths (320–1920 px) in AVIF and WebP, plus a JPEG fallback (PNG for cut-outs with transparency), straightened and with metadata such as GPS stripped. The site loads them through `srcset`, so a phone gets a small file and the opened photo (lightbox) a large one, with the small one shown blurred until it arrives. It runs first in `npm run build` (before Vite) and on `npm run dev` (also when you add a photo while it runs), and only re-encodes changed photos; `npm run images` runs it alone. `public/photos/` and `src/photos.json` are generated: don't edit them.
- **Journey stops:** the `stops` array. Add one object where it belongs in the order; the loopy route, pins, scenery (`doodle`), detours (`detour`), border lines (`country`, `via`) and distance signs redraw automatically. There's a commented-out vet stop to copy.
- **Cat heads:** `cats[].head`. The big bobbling caricature heads (hero, car, package card, living room, stamp, speech tags) all come from one component, `src/lib/CatHead.svelte`. Until you add a photo they show a drawn face. Best is a PNG with a transparent background, just the head with ears (e.g. `/photos/velik-hlava.png`, the file itself in `photos/`); any other photo is cropped to a circle.
- **Cats' lines:** `cats[].says`. These are drafts; rewrite them to match their real personalities.
- **Health:** the `health` array.

## Hand-drawn pieces

The map places, the night-forest layers, the living room and the car can each be replaced by a
hand-drawn picture. `drawings.html` (on the dev server) lists every piece with its number;
`drawing-templates/` holds a template for each (SVG for vector apps, PNG for Procreate) and a
README with the steps. Save a finished drawing in `src/drawings/` under its number, e.g.
`src/drawings/M1-praha.svg`: it takes that piece's place, and anything not drawn yet stays as it
is. `src/drawings/boxes.json` says where each drawing sits; `tools/` re-exports the templates
and that file if a piece changes shape.

- **Link preview and icons:** `public/og.png` (what Facebook, WhatsApp and Messenger show for a shared link) is drawn by `npm run og` from a photo and the page's font, in headless Google Chrome; change the photo, crop or words in `tools/og.mjs`. `public/favicon.svg` is the tab icon; after changing it, `npm run icons` remakes `public/apple-touch-icon.png` for the iPhone home screen.

`kit.html` and `drawings.html` are review pages for the dev server only. The build contains just the landing page (`dist/index.html`); `npm run build` fails if any other page ends up in `dist/`.

## Publishing

Every push to `main` builds the site on GitHub Actions (`.github/workflows/deploy.yml`) and publishes
`dist/` to GitHub Pages at https://marceljager.github.io/cats/. The build uses relative URLs, so the
same files work there and at the root of the CDN domain in front of it.

- GitHub → Settings → Pages → Source: **GitHub Actions** (once).
- GitHub → Settings → Secrets and variables → Actions → Variables: `SITE_URL` = the public address
  (the CDN domain, e.g. `https://velikapolly.cz`). It turns on og:image, canonical and ai-catalog.json.
- CDN: origin `https://marceljager.github.io` with the path `/cats/`, sending the origin's own host
  name. Cache `index.html` for minutes, everything else for long.
- Visits: GoatCounter at https://marceljager.goatcounter.com (the script in `index.html`, no cookies, so
  no consent banner). Besides page views it counts clicks as events, named in `src/lib/track.js`:
  `napsat-email`, `instagram`, `sdilet-*` (WhatsApp, Facebook, e-mail, phone, copied link) and
  `foto` (a photo opened). Visits from localhost aren't counted.
- Purge after deploy: secrets in the `production` environment, `CDN_PURGE_URL` (the CDN's purge-all
  API address, resource ID included) and `CDN_API_TOKEN`. Every deploy ends by clearing the CDN cache.
