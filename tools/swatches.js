// drawing-templates/: colour palettes for each section of drawings.html (the map, the night forest,
// the living room), from the colours it actually uses: .ase for Affinity, Illustrator and most
// vector apps (beside the SVG templates), .swatches for Procreate (beside the PNG ones).
// Needs the dev server (see chrome.js).
//   npm run swatches
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { openDevPage } from './chrome.js';

const OUT = fileURLToPath(new URL('../drawing-templates/', import.meta.url));
const NAMES = { M: 'Velík a Polly · mapa', F: 'Velík a Polly · noční les', O: 'Velík a Polly · obývák' };
const INK = [22, 19, 17];
// gradients aren't picked up from the shapes: the night sky and the wallpaper
const GRADIENTS = { F: [[11, 22, 38], [24, 48, 77], [31, 59, 92]], O: [[251, 231, 189], [246, 215, 156]], M: [] };
const MAX_SWATCHES = 30;

// every opaque colour each section uses, as [r, g, b], the most used first (by area for fills)
const { browser, tab } = await openDevPage('drawings.html');
const used = await tab.evaluate((sections) => {
  const result = {};
  for (const section of sections) {
    const weight = new Map();
    const add = (css, w) => {
      const m = css.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
      if (!m || (m[4] !== undefined && +m[4] < 0.9)) return;
      const key = [m[1], m[2], m[3]].map(Number).join(',');
      weight.set(key, (weight.get(key) || 0) + w);
    };
    document.querySelectorAll(`figure[data-id^="${section}"]`).forEach((fig) => {
      fig.querySelectorAll('path,rect,circle,ellipse,polygon').forEach((shape) => {
        const cs = getComputedStyle(shape);
        if (cs.display === 'none') return;
        let area;
        try {
          const box = shape.getBBox();
          area = Math.max(1, Math.sqrt(box.width * box.height));
        } catch {
          area = 1; // not rendered
        }
        if (cs.fill !== 'none') add(cs.fill, area);
        if (cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) add(cs.stroke, 4);
      });
      // the car is HTML: its body and wheels
      fig.querySelectorAll('.body, .wheel').forEach((el) => {
        const cs = getComputedStyle(el);
        add(cs.backgroundColor, 20);
        add(cs.borderTopColor, 4);
      });
    });
    result[section] = [...weight].sort((a, b) => b[1] - a[1]).map(([key]) => key.split(',').map(Number));
  }
  return result;
}, Object.keys(NAMES));
await browser.close();

const similar = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 14;
const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');

// Procreate keeps colours as hue, saturation and brightness, each 0–1
function toHsb([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d) hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue = ((hue * 60 + 360) % 360) / 360;
  return { hue, saturation: max ? d / max : 0, brightness: max, alpha: 1, origin: 0, colorSpace: 0 };
}

// Adobe Swatch Exchange: one group per section, an RGB colour block per swatch
function utf16(text) {
  const buf = Buffer.alloc(2 + (text.length + 1) * 2);
  buf.writeUInt16BE(text.length + 1, 0);
  for (let i = 0; i < text.length; i++) buf.writeUInt16BE(text.charCodeAt(i), 2 + i * 2);
  return buf;
}
function block(type, body) {
  const head = Buffer.alloc(6);
  head.writeUInt16BE(type, 0);
  head.writeUInt32BE(body.length, 2);
  return Buffer.concat([head, body]);
}
function ase(name, colors) {
  const blocks = [block(0xc001, utf16(name))];
  for (const rgb of colors) {
    const value = Buffer.alloc(4 + 12 + 2);
    value.write('RGB ', 0, 'ascii');
    rgb.forEach((v, i) => value.writeFloatBE(v / 255, 4 + i * 4));
    value.writeUInt16BE(2, 16);
    blocks.push(block(0x0001, Buffer.concat([utf16(hex(rgb)), value])));
  }
  blocks.push(block(0xc002, Buffer.alloc(0)));
  const head = Buffer.alloc(12);
  head.write('ASEF', 0, 'ascii');
  head.writeUInt16BE(1, 4);
  head.writeUInt16BE(0, 6);
  head.writeUInt32BE(blocks.length, 8);
  return Buffer.concat([head, ...blocks]);
}

for (const [section, colors] of Object.entries(used)) {
  // the ink first, then the gradients' colours, then the most used ones, leaving out near-repeats
  const palette = [INK];
  for (const rgb of [...GRADIENTS[section], ...colors.filter((c) => c.join() !== '0,0,0')]) {
    if (palette.length >= MAX_SWATCHES) break;
    if (!palette.some((p) => similar(p, rgb))) palette.push(rgb);
  }
  const file = NAMES[section].replace(' · ', ' - ');
  await writeFile(join(OUT, 'svg-vector', `${file}.ase`), ase(NAMES[section], palette));
  // a Procreate palette is a zip holding Swatches.json
  const tmp = await mkdtemp(join(OUT, '.sw-'));
  await writeFile(join(tmp, 'Swatches.json'), JSON.stringify([{ name: NAMES[section], swatches: palette.map(toHsb) }]));
  const swatches = join(OUT, 'png-procreate', `${file}.swatches`);
  await rm(swatches, { force: true });
  execFileSync('zip', ['-j', '-q', swatches, join(tmp, 'Swatches.json')]);
  await rm(tmp, { recursive: true });
  console.log(section, palette.length);
}
