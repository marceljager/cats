// drawing-templates/: an SVG and a PNG template for every numbered piece on drawings.html, and
// src/drawings/boxes.json: where each template's artboard sits in the piece's own coordinates.
// Every artboard is drawn at 3 pixels per screen pixel on the site, so one stroke width gives the
// same outline everywhere (3x the outline on the site). Needs the dev server (see chrome.js).
//   npm run templates
// Re-run it whenever a piece changes shape, or the drawings will no longer line up. It replaces
// only the templates themselves; the README and the palettes (npm run swatches) stay.
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { openDevPage } from './chrome.js';

const root = new URL('../', import.meta.url);
// vector and bitmap templates in their own folders, so each app imports only its kind
const SVG_DIR = new URL('drawing-templates/svg-vector/', root);
const PNG_DIR = new URL('drawing-templates/png-procreate/', root);
const BOXES = new URL('src/drawings/boxes.json', root);
const SHARP = 3;
const TEMPLATE = /\.(svg|png)$/;

const { browser, tab } = await openDevPage('drawings.html');
await tab.addStyleTag({ content: `
  *, *::before, *::after { animation: none !important; transition: none !important; vector-effect: none !important; }
  .kittens .head, .kittens .breath { display: none !important; }
` });
await new Promise((r) => setTimeout(r, 500));

// the old templates go only once the page is there to make new ones from
for (const dir of [SVG_DIR, PNG_DIR]) {
  await mkdir(dir, { recursive: true });
  for (const f of await readdir(dir)) if (TEMPLATE.test(f)) await rm(new URL(f, dir));
}

// "Celá Praha (M1)" → "cela-praha"
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const round2 = (v) => +v.toFixed(2);

const raster = await browser.newPage();
const ids = await tab.evaluate(() => [...document.querySelectorAll('figure[data-id]')].map((f) => f.dataset.id));
const boxes = {};
const report = [];
for (const id of ids) {
  const piece = await tab.evaluate((id, SHARP) => {
    const fig = document.querySelector(`figure[data-id="${id}"]`);
    const px = +fig.dataset.px;
    const line = +fig.dataset.line;
    const svg = fig.querySelector('svg');
    const drawing = svg.firstElementChild;
    const bounds = drawing.getBBox();
    const pad = Math.max((line / px) * 3, Math.max(bounds.width, bounds.height) * 0.03, 3);
    const box = { x: bounds.x - pad, y: bounds.y - pad, w: bounds.width + pad * 2, h: bounds.height + pad * 2 };
    const scale = px * SHARP;
    const width = Math.round(box.w * scale);
    const height = Math.round(box.h * scale);
    const stroke = Math.round(line * SHARP * 10) / 10;

    // sub-pieces (the two pins, the log), in the drawing's own coordinates
    const toDrawing = drawing.getCTM().inverse();
    const parts = [...fig.querySelectorAll('[data-part]')].sort((a, b) => a.dataset.part - b.dataset.part).map((el) => {
      const own = el.getBBox();
      const m = toDrawing.multiply(el.getCTM());
      const corners = [[own.x, own.y], [own.x + own.width, own.y], [own.x, own.y + own.height], [own.x + own.width, own.y + own.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
      const partPad = Math.max(line / px, 2);
      const left = Math.min(...corners.map((c) => c.x)) - partPad;
      const top = Math.min(...corners.map((c) => c.y)) - partPad;
      return { x: left, y: top, w: Math.max(...corners.map((c) => c.x)) + partPad - left, h: Math.max(...corners.map((c) => c.y)) + partPad - top };
    });

    // the template: computed styles written onto each shape, so any app opens it the same
    const PROPS = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity'];
    const copy = svg.cloneNode(true);
    const originals = [svg, ...svg.querySelectorAll('*')];
    const copies = [copy, ...copy.querySelectorAll('*')];
    originals.forEach((el, i) => {
      const out = copies[i];
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || el.tagName === 'image' || el.tagName === 'text') {
        out.setAttribute('data-drop', '');
        return;
      }
      if (el !== svg && !['defs', 'stop', 'linearGradient', 'radialGradient', 'pattern', 'clipPath'].includes(el.tagName)) {
        for (const prop of PROPS) {
          const v = cs.getPropertyValue(prop);
          if (v && v !== 'normal') out.setAttribute(prop, v.replace(/url\("?#?([^")]*)"?\)/, (m, ref) => `url(#${ref.split('#').pop()})`));
        }
      }
      out.removeAttribute('class');
      out.removeAttribute('style');
      for (const at of [...out.attributes]) if (at.name.startsWith('data-') || at.name.startsWith('aria-')) out.removeAttribute(at.name);
    });
    copy.querySelectorAll('[data-drop]').forEach((e) => e.remove());
    // the outline width, as a short line in the top-left corner
    const unit = 1 / scale;
    const note = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    note.setAttribute('id', 'tloustka-obrysu');
    note.innerHTML = `<path d="M ${box.x + (stroke + 6) * unit} ${box.y + (stroke + 6) * unit} h ${Math.min(120, width * 0.12) * unit}" stroke="#161311" stroke-width="${stroke * unit}" stroke-linecap="round" fill="none" />`;
    copy.append(note);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
    copy.setAttribute('width', width);
    copy.setAttribute('height', height);
    const name = fig.querySelector('figcaption b').textContent;
    return { box, parts, width, height, stroke, name, body: fig.dataset.body, svg: '<?xml version="1.0" encoding="UTF-8"?>\n' + copy.outerHTML };
  }, id, SHARP);

  const file = `${id}-${slug(piece.name)}.svg`;
  await writeFile(new URL(file, SVG_DIR), piece.svg);
  // the same template as a bitmap for Procreate, at the artboard's size (3x the site)
  await raster.setViewport({ width: piece.width, height: piece.height });
  await raster.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${piece.svg.replace(/^<\?xml[^>]*>\n/, '')}`);
  await raster.screenshot({ path: fileURLToPath(new URL(file.replace(/\.svg$/, '.png'), PNG_DIR)), clip: { x: 0, y: 0, width: piece.width, height: piece.height }, omitBackground: true });

  // an SVG piece's box is in its own units; the car is HTML, so its box (and its parts) are in
  // parts of the body's width and height
  const [bw, bh] = piece.body ? piece.body.split(' ').map(Number) : [];
  const place = piece.body
    ? (q) => ({ x: +(q.x / bw).toFixed(4), y: +(q.y / bh).toFixed(4), w: +(q.w / bw).toFixed(4), h: +(q.h / bh).toFixed(4) })
    : (q) => ({ x: round2(q.x), y: round2(q.y), w: round2(q.w), h: round2(q.h) });
  boxes[id] = { ...place(piece.box), ...(piece.parts.length && { parts: piece.parts.map(place) }) };
  report.push(`${file}  ${piece.width}x${piece.height}  stroke ${piece.stroke}`);
}
await writeFile(BOXES, JSON.stringify(boxes, null, 1) + '\n');
console.log(report.join('\n'));
await browser.close();
