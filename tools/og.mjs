// public/og.png, the picture a shared link shows (Facebook, WhatsApp, Messenger…): a polaroid of the two
// of them taped onto the night-blue of the page's first screen, beside one line in the site's own font.
// Drawn as an HTML page and photographed by headless Chrome at 1200×630, so the type is real Nunito.
//   node tools/og.mjs
import { writeFile, rm, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PHOTO = 'photos/kotata-na-dece.jpg';
// a square of the (portrait) photo centred between the two faces, so neither cat gets more of it
const CROP = { left: 250, top: 760, width: 800, height: 800 };

const font = (f) => fileURLToPath(new URL(`node_modules/@fontsource-variable/nunito/files/${f}`, root));
const photo = await sharp(fileURLToPath(new URL(PHOTO, root))).rotate().extract(CROP).resize(840, 840).jpeg({ quality: 88 }).toBuffer();

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family: Nunito; font-weight: 200 1000; src: url("file://${font('nunito-latin-wght-normal.woff2')}") format("woff2"); }
  @font-face { font-family: Nunito; font-weight: 200 1000; src: url("file://${font('nunito-latin-ext-wght-normal.woff2')}") format("woff2"); unicode-range: U+0100-024F, U+1E00-1EFF; }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; display: grid; grid-template-columns: 700px 1fr; align-items: center; background: #10233a; font-family: Nunito, sans-serif; -webkit-font-smoothing: antialiased; }
  /* a few of the hero's stars, so it reads as the same night */
  body::before { content: ""; position: absolute; inset: 0; opacity: .7; background:
      radial-gradient(circle at 6% 12%, #fbfaf5 0 1.6px, transparent 2.4px),
      radial-gradient(circle at 26% 7%, #fbfaf5 0 1.2px, transparent 2px),
      radial-gradient(circle at 44% 16%, #fbfaf5 0 1.4px, transparent 2.2px),
      radial-gradient(circle at 15% 90%, #fbfaf5 0 1.2px, transparent 2px),
      radial-gradient(circle at 40% 86%, #fbfaf5 0 1.6px, transparent 2.4px),
      radial-gradient(circle at 93% 9%, #fbfaf5 0 1.4px, transparent 2.2px),
      radial-gradient(circle at 96% 80%, #fbfaf5 0 1.2px, transparent 2px),
      radial-gradient(circle at 54% 94%, #fbfaf5 0 1.4px, transparent 2.2px); }
  .words { position: relative; display: flex; flex-direction: column; gap: 34px; padding: 0 0 0 64px; color: #fbfaf5; }
  h1 { font-weight: 900; font-size: 90px; line-height: 1; text-wrap: balance; letter-spacing: -0.025em; text-shadow: 0 5px 0 rgba(5, 9, 15, .6); }
  p { align-self: flex-start; padding: 10px 22px 12px; background: #d6332a; border: 4px solid #161311; border-radius: 14px; box-shadow: inset -4px -5px 0 #a8241c; font-weight: 800; font-size: 32px; line-height: 1.1; }
  /* the polaroid: the gallery's print (white card, ink outline, wide bottom strip), a little tilted */
  /* big enough to run off the bottom-right corner, like a print lying on the page */
  .print { position: absolute; top: 70px; right: -34px; width: 540px; padding: 24px 24px 0; background: #fbfaf5; border: 4px solid #161311; border-radius: 10px;
    box-shadow: inset -6px -7px 0 #ebe3cc, 0 26px 30px -14px rgba(0, 0, 0, .65); rotate: 4deg; }
  .shot { display: block; width: 100%; aspect-ratio: 1; background: url("data:image/jpeg;base64,${photo.toString('base64')}") center / cover; border: 3px solid #161311; border-radius: 6px; }
  .print::after { content: ""; display: block; height: 84px; }
  /* a strip of the site's yellow masking tape holding it up */
  .tape { position: absolute; top: -22px; left: 50%; width: 170px; height: 42px; margin-left: -85px; rotate: -6deg; background: #f6d37a; border: 3px solid #161311;
    box-shadow: inset 0 -6px 0 #e0b04a; clip-path: polygon(0 0, 100% 0, 97% 25%, 100% 50%, 97% 75%, 100% 100%, 0 100%, 3% 75%, 0 50%, 3% 25%); opacity: .95; }
</style>
<div class="words">
  <h1>Velík a&nbsp;Polly hledají domov</h1>
  <p>zdarma · Praha</p>
</div>
<figure class="print">
  <span class="tape"></span>
  <span class="shot"></span>
</figure>`;

const page = join(tmpdir(), `og-${process.pid}.html`);
const shot = join(tmpdir(), `og-${process.pid}.png`);
await writeFile(page, html);
try {
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${shot}`, `file://${page}`], { stdio: 'ignore' });
  const out = fileURLToPath(new URL('public/og.png', root));
  // Chrome adds no bottom bar in headless, but trim to the exact size anyway, then squeeze the PNG
  await sharp(await readFile(shot)).extract({ left: 0, top: 0, width: 1200, height: 630 }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(out);
  console.log('og: wrote public/og.png');
} finally {
  await rm(page, { force: true });
  await rm(shot, { force: true });
}
