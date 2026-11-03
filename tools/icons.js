// public/favicon.svg from the cats' head photos, and public/apple-touch-icon.png (iOS home screen,
// which doesn't take SVG) from it
//   npm run icons
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cats } from '../src/content.js';

const at = (p) => fileURLToPath(new URL(`../public/${p}`, import.meta.url));
const photo = (p) => fileURLToPath(new URL(`..${p}`, import.meta.url));

// where each head sits on the 64-unit tile: the face's centre, its radius and lean (as the two
// ride on the car, Polly a little smaller and tucked behind Velík)
const HEADS = {
  polly: { cx: 45, cy: 33, r: 15, tilt: 8 },
  velik: { cx: 23, cy: 38, r: 18, tilt: -6 },
};

// the two heads on the page's night blue: each head photo shrunk to a small PNG and placed the
// way CatHead.svelte places it, its face (headFrame) where the drawn face would be
export async function faviconSvg() {
  const heads = [];
  for (const id of ['polly', 'velik']) {
    const cat = cats.find((c) => c.id === id);
    const f = cat.headFrame;
    const { cx, cy, r, tilt } = HEADS[id];
    const w = (2 * r) / f.w;
    const h = w / f.ratio;
    const png = await sharp(photo(cat.head)).resize({ width: 128 }).png({ compressionLevel: 9, palette: true }).toBuffer();
    heads.push(
      `  <g transform="translate(${cx} ${cy}) rotate(${tilt})">\n` +
        `    <image href="data:image/png;base64,${png.toString('base64')}" x="${(-f.x * w).toFixed(2)}" y="${(-f.y * h).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"/>\n` +
        `  </g>`,
    );
  }
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    '  <rect width="64" height="64" rx="14" fill="#10233a"/>',
    '  <!-- Polly behind, Velík in front (made by tools/icons.js from the head photos) -->',
    ...heads,
    '</svg>',
    '',
  ].join('\n');
}

// a 180×180 PNG of the SVG icon; iOS rounds the corners itself, so the square is filled edge to
// edge in the page's night blue (no transparent corners)
export function touchIcon(svg, out) {
  return sharp(svg, { density: ((72 * 180) / 64) * 2 })
    .resize(180, 180)
    .flatten({ background: '#10233a' })
    .png({ compressionLevel: 9 })
    .toFile(out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(at('favicon.svg'), await faviconSvg());
  await touchIcon(at('favicon.svg'), at('apple-touch-icon.png'));
  console.log('icons: wrote public/favicon.svg and public/apple-touch-icon.png');
}
