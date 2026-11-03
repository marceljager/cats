// Export an SVG and a PNG template for every numbered piece on drawings.html, and write
// src/drawings/boxes.json: where each template's artboard sits in the piece's own coordinates.
//   node templates.mjs <project dir>
// Every artboard is drawn at 3 pixels per screen pixel on the site, so one stroke width gives the
// same outline everywhere (3x the outline on the site).
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
const outDir = path.join(root, 'drawing-templates');
fs.rmSync(outDir, { recursive: true, force: true });
// vector and bitmap templates in their own folders, so each app imports only its kind
const svgDir = path.join(outDir, 'svg-vector');
const pngDir = path.join(outDir, 'png-procreate');
fs.mkdirSync(svgDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });
const SHARP = 3;

const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 900 });
await p.goto('http://localhost:5179/drawings.html', { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: `
  *, *::before, *::after { animation: none !important; transition: none !important; vector-effect: none !important; }
  .kittens .head, .kittens .breath { display: none !important; }
` });
await new Promise((r) => setTimeout(r, 500));

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const raster = await b.newPage();
const ids = await p.evaluate(() => [...document.querySelectorAll('figure[data-id]')].map((f) => f.dataset.id));
const boxes = {};
const list = [];
for (const id of ids) {
  const t = await p.evaluate((id, SHARP) => {
    const fig = document.querySelector(`figure[data-id="${id}"]`);
    const px = +fig.dataset.px;
    const line = +fig.dataset.line;
    const svg = fig.querySelector('svg');
    const g = svg.firstElementChild;
    const bb = g.getBBox();
    const pad = Math.max((line / px) * 3, Math.max(bb.width, bb.height) * 0.03, 3);
    const box = { x: bb.x - pad, y: bb.y - pad, w: bb.width + pad * 2, h: bb.height + pad * 2 };
    const k = px * SHARP;
    const W = Math.round(box.w * k);
    const H = Math.round(box.h * k);
    const stroke = Math.round(line * SHARP * 10) / 10;

    // sub-pieces (the two pins, the log), in the drawing's own coordinates
    const toG = g.getCTM().inverse();
    const parts = [...fig.querySelectorAll('[data-part]')].sort((a, b) => a.dataset.part - b.dataset.part).map((el) => {
      const e = el.getBBox();
      const m = toG.multiply(el.getCTM());
      const pts = [[e.x, e.y], [e.x + e.width, e.y], [e.x, e.y + e.height], [e.x + e.width, e.y + e.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
      const pp = Math.max(line / px, 2);
      const l = Math.min(...pts.map((q) => q.x)) - pp;
      const tp = Math.min(...pts.map((q) => q.y)) - pp;
      return { x: l, y: tp, w: Math.max(...pts.map((q) => q.x)) + pp - l, h: Math.max(...pts.map((q) => q.y)) + pp - tp };
    });

    // the template: computed styles written onto each shape, so any app opens it the same
    const PROPS = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity'];
    const copy = svg.cloneNode(true);
    const a = [svg, ...svg.querySelectorAll('*')];
    const c = [copy, ...copy.querySelectorAll('*')];
    a.forEach((el, i) => {
      const out = c[i];
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || el.tagName === 'image' || el.tagName === 'text') { out.setAttribute('data-drop', ''); return; }
      if (el !== svg && !['defs', 'stop', 'linearGradient', 'radialGradient', 'pattern', 'clipPath'].includes(el.tagName)) {
        for (const k of PROPS) {
          const v = cs.getPropertyValue(k);
          if (v && v !== 'normal') out.setAttribute(k, v.replace(/url\("?#?([^")]*)"?\)/, (m, ref) => `url(#${ref.split('#').pop()})`));
        }
      }
      out.removeAttribute('class');
      out.removeAttribute('style');
      for (const at of [...out.attributes]) if (at.name.startsWith('data-') || at.name.startsWith('aria-')) out.removeAttribute(at.name);
    });
    copy.querySelectorAll('[data-drop]').forEach((e) => e.remove());
    const ns = 'http://www.w3.org/2000/svg';
    const u = 1 / k;
    const note = document.createElementNS(ns, 'g');
    note.setAttribute('id', 'tloustka-obrysu');
    note.innerHTML = `<path d="M ${box.x + (stroke + 6) * u} ${box.y + (stroke + 6) * u} h ${Math.min(120, W * 0.12) * u}" stroke="#161311" stroke-width="${stroke * u}" stroke-linecap="round" fill="none" />`;
    copy.append(note);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
    copy.setAttribute('width', W);
    copy.setAttribute('height', H);
    const name = fig.querySelector('figcaption b').textContent;
    return { box, parts, W, H, stroke, name, body: fig.dataset.body, svg: '<?xml version="1.0" encoding="UTF-8"?>\n' + copy.outerHTML };
  }, id, SHARP);

  const file = `${id}-${slug(t.name)}.svg`;
  fs.writeFileSync(path.join(svgDir, file), t.svg);
  // the same template as a bitmap for Procreate, at the artboard's size (3x the site)
  await raster.setViewport({ width: t.W, height: t.H });
  await raster.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${t.svg.replace(/^<\?xml[^>]*>\n/, '')}`);
  await raster.screenshot({ path: path.join(pngDir, file.replace(/\.svg$/, '.png')), clip: { x: 0, y: 0, width: t.W, height: t.H }, omitBackground: true });
  const r2 = (v) => +v.toFixed(2);
  let entry = { x: r2(t.box.x), y: r2(t.box.y), w: r2(t.box.w), h: r2(t.box.h) };
  if (t.parts.length) entry.parts = t.parts.map((q) => ({ x: r2(q.x), y: r2(q.y), w: r2(q.w), h: r2(q.h) }));
  // the car is HTML: its box in parts of the body's width and height
  if (t.body) {
    const [bw, bh] = t.body.split(' ').map(Number);
    entry = { x: +(t.box.x / bw).toFixed(4), y: +(t.box.y / bh).toFixed(4), w: +(t.box.w / bw).toFixed(4), h: +(t.box.h / bh).toFixed(4) };
  }
  boxes[id] = entry;
  list.push(`${file}  ${t.W}x${t.H}  stroke ${t.stroke}`);
}
fs.writeFileSync(path.join(root, 'src/drawings/boxes.json'), JSON.stringify(boxes, null, 1) + '\n');
console.log(list.join('\n'));
await b.close();
