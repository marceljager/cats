// palettes (.ase for Affinity, Illustrator and most vector apps; .swatches for Procreate) from the colours each
// section of drawings.html actually uses
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 });
await p.goto('http://localhost:5179/drawings.html', { waitUntil: 'networkidle0' });
const sets = await p.evaluate(() => {
  const res = {};
  for (const L of ['M', 'F', 'O']) {
    const count = new Map();
    const add = (c, wgt) => {
      const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
      if (!m || (m[4] !== undefined && +m[4] < 0.9)) return;
      const k = [m[1], m[2], m[3]].map(Number).join(',');
      count.set(k, (count.get(k) || 0) + wgt);
    };
    document.querySelectorAll(`figure[data-id^="${L}"]`).forEach((f) => {
      f.querySelectorAll('path,rect,circle,ellipse,polygon').forEach((e) => {
        const cs = getComputedStyle(e);
        if (cs.display === 'none') return;
        let area = 1; try { const bb = e.getBBox(); area = Math.max(1, Math.sqrt(bb.width * bb.height)); } catch {}
        if (cs.fill !== 'none') add(cs.fill, area);
        if (cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) add(cs.stroke, 4);
      });
      f.querySelectorAll('.body, .wheel').forEach((e) => { const cs = getComputedStyle(e); add(cs.backgroundColor, 20); add(cs.borderTopColor, 4); });
    });
    res[L] = [...count].sort((a, b) => b[1] - a[1]).map(([k]) => k.split(',').map(Number));
  }
  return res;
});
await b.close();
const close = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 14;
const _hsb = ([r, g, bl]) => {
  r /= 255; g /= 255; bl /= 255;
  const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - bl) / d) % 6 : mx === g ? (bl - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360 / 360;
  return { hue: h, saturation: mx ? d / mx : 0, brightness: mx, alpha: 1, origin: 0, colorSpace: 0 };
};
const NAMES = { M: 'Velík a Polly · mapa', F: 'Velík a Polly · noční les', O: 'Velík a Polly · obývák' };
// Adobe Swatch Exchange: a group per section, one RGB colour block per swatch
const str16 = (t) => { const b = Buffer.alloc(2 + (t.length + 1) * 2); b.writeUInt16BE(t.length + 1, 0); for (let i = 0; i < t.length; i++) b.writeUInt16BE(t.charCodeAt(i), 2 + i * 2); return b; };
const block = (type, body) => { const h = Buffer.alloc(6); h.writeUInt16BE(type, 0); h.writeUInt32BE(body.length, 2); return Buffer.concat([h, body]); };
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
function ase(name, colors) {
  const blocks = [block(0xc001, str16(name))];
  for (const c of colors) {
    const v = Buffer.alloc(4 + 12 + 2);
    v.write('RGB ', 0, 'ascii');
    c.forEach((x, i) => v.writeFloatBE(x / 255, 4 + i * 4));
    v.writeUInt16BE(2, 16);
    blocks.push(block(0x0001, Buffer.concat([str16(hex(c)), v])));
  }
  blocks.push(block(0xc002, Buffer.alloc(0)));
  const head = Buffer.alloc(12);
  head.write('ASEF', 0, 'ascii'); head.writeUInt16BE(1, 4); head.writeUInt16BE(0, 6); head.writeUInt32BE(blocks.length, 8);
  return Buffer.concat([head, ...blocks]);
}
for (const [L, list] of Object.entries(sets)) {
  const ink = [22, 19, 17];
  const pick = [ink];
  // gradients are not picked up above: the night sky and the wallpaper
  const extra = { F: [[11, 22, 38], [24, 48, 77], [31, 59, 92]], O: [[251, 231, 189], [246, 215, 156]], M: [] }[L];
  for (const c of [...extra, ...list.filter((c) => c.join() !== '0,0,0')]) { if (pick.length >= 30) break; if (!pick.some((q) => close(q, c))) pick.push(c); }
  const base = `${NAMES[L].replace(' · ', ' - ')}`;
  const file = path.join(out, 'svg-vector', `${base}.ase`);
  fs.writeFileSync(file, ase(NAMES[L], pick));
  // and a Procreate palette: a zip holding Swatches.json, colours in HSB
  const dir = fs.mkdtempSync(path.join(out, '.sw-'));
  fs.writeFileSync(path.join(dir, 'Swatches.json'), JSON.stringify([{ name: NAMES[L], swatches: pick.map(_hsb) }]));
  const sw = path.join(out, 'png-procreate', `${base}.swatches`);
  fs.rmSync(sw, { force: true });
  execFileSync('zip', ['-j', '-q', sw, path.join(dir, 'Swatches.json')]);
  fs.rmSync(dir, { recursive: true });
  console.log(L, pick.length);
}
