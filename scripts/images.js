// photos/ (the originals) → public/photos/ (what the site loads): every photo resized to a few widths
// in AVIF, WebP and a JPEG fallback (PNG for cut-outs with transparency), plus src/photos.json, which
// src/lib/services/images.js reads to tell the browser which widths exist, so it can pick the smallest one
// that looks sharp. Runs on its own (`npm run images`), first in `npm run build` (package.json), and
// in the dev server at start and whenever a photo changes (the images plugin, scripts/vite-plugins.js).
// Only photos that are new or changed get encoded again; outputs of deleted photos are removed.
import { readdir, mkdir, rm, writeFile, readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const SRC = new URL('photos/', root);
const OUT = new URL('public/photos/', root);
const MANIFEST = new URL('src/photos.json', root);

// widths to make, never larger than the original; the original's own width is added when the
// largest step below it is noticeably smaller
const WIDTHS = [320, 480, 640, 800, 1080, 1440, 1920];
// browsers without AVIF or WebP are rare, so the JPEG fallback comes in fewer widths; a PNG
// (only for cut-outs with transparency) in just the one
const FALLBACK_WIDTHS = { jpg: [640, 1080, 1440], png: [] };
// the plain /photos/name.jpg stays available (links, anything that doesn't use srcset) at this width
const FALLBACK = 1440;
const QUALITY = { avif: { quality: 50, effort: 5 }, webp: { quality: 78, effort: 5 }, jpeg: { quality: 80, mozjpeg: true }, png: { compressionLevel: 9, palette: false } };
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

const base = (file) => file.replace(IMAGE, '');
const exists = (path) => access(path).then(() => true, () => false);
// a photo is encoded again when its bytes or these settings change (not its file date, which a
// fresh git checkout resets): the hash is kept in src/photos.json
const SETTINGS = JSON.stringify({ WIDTHS, FALLBACK, FALLBACK_WIDTHS, QUALITY, v: 1 });

export async function optimizeImages({ log = console.log } = {}) {
  await mkdir(OUT, { recursive: true });
  const sources = (await readdir(SRC)).filter((f) => IMAGE.test(f)).sort();
  let old = {};
  try {
    old = JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch (err) {
    // no manifest yet (first run, fresh checkout) or a broken one: every photo counts as new
    if (err.code !== 'ENOENT' && !(err instanceof SyntaxError)) throw err;
  }

  const manifest = {};
  const keep = new Set();
  let made = 0;

  for (const file of sources) {
    const src = fileURLToPath(new URL(file, SRC));
    const bytes = await readFile(src);
    const hash = createHash('sha1').update(bytes).update(SETTINGS).digest('hex').slice(0, 16);
    const same = old[`/photos/${file}`]?.hash === hash;
    const meta = await sharp(bytes).metadata();
    // phone photos carry their rotation in EXIF; the encoded copies are turned upright
    const turned = (meta.orientation ?? 1) >= 5;
    const w = turned ? meta.height : meta.width;
    const h = turned ? meta.width : meta.height;
    const alpha = Boolean(meta.hasAlpha);
    const fallback = alpha ? 'png' : 'jpg';
    const widths = WIDTHS.filter((x) => x < w);
    if (!widths.length || w / widths.at(-1) > 1.15) widths.push(w);
    const name = base(file);

    const fallbackWidths = widths.filter((x) => FALLBACK_WIDTHS[fallback].includes(x));
    if (fallback === 'jpg' && !fallbackWidths.length) fallbackWidths.push(widths.at(-1));
    const jobs = [];
    for (const width of widths) {
      for (const fmt of ['avif', 'webp']) jobs.push({ out: `${name}-${width}.${fmt}`, width, fmt });
    }
    for (const width of fallbackWidths) jobs.push({ out: `${name}-${width}.${fallback}`, width, fmt: fallback });
    jobs.push({ out: `${name}.${fallback}`, width: Math.min(FALLBACK, w), fmt: fallback });
    // the address content.js uses (/photos/velik.jpg) keeps working for a .webp/.png original too
    if (`${name}.${fallback}` !== file) jobs.push({ out: file, width: Math.min(FALLBACK, w), fmt: file.split('.').pop().toLowerCase() });

    for (const job of jobs) {
      keep.add(job.out);
      const out = fileURLToPath(new URL(job.out, OUT));
      if (same && (await exists(out))) continue;
      const fmt = job.fmt === 'jpg' ? 'jpeg' : job.fmt;
      // .rotate() turns the photo upright and the encoder drops the rest of the metadata (GPS included)
      await sharp(src).rotate().resize({ width: job.width, withoutEnlargement: true })[fmt](QUALITY[fmt] ?? {}).toFile(out);
      made++;
    }

    manifest[`/photos/${file}`] = { w, h, alpha, widths, fallbackWidths, name: `/photos/${name}`, fallback, hash };
  }

  // whatever is left in public/photos from a photo that's gone
  for (const f of await readdir(OUT)) {
    if (!keep.has(f)) await rm(new URL(f, OUT));
  }

  const json = JSON.stringify(manifest, null, 2) + '\n';
  if (JSON.stringify(old, null, 2) + '\n' !== json) await writeFile(MANIFEST, json);
  if (made) log(`images: ${made} file(s) encoded for ${sources.length} photo(s)`);
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const t = performance.now();
  await optimizeImages();
  console.log(`images: up to date in ${Math.round(performance.now() - t)} ms`);
}
