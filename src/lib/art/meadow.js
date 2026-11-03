// @ts-check
// what the map is drawn on: grass and pebbles over the land, clouds drifting above it
import { rng } from './random.js';

// grass tufts and pebbles scattered over the land, as path data by colour: each tuft a few tapered
// blades fanning out, its own height and lean, some a darker green, now and then a tiny flower
// on the tallest blade
/** @param {number} w @param {number} h @returns {{ light: string, dark: string, flowers: string, hearts: string, pebbles: string }} */
export function scatterGrass(w, h) {
  const rt = rng(99);
  const f = (n) => n.toFixed(1);
  const dot = (x, y, rx, ry = rx) => ` M ${f(x - rx)} ${f(y)} a ${f(rx)} ${f(ry)} 0 1 0 ${f(rx * 2)} 0 a ${f(rx)} ${f(ry)} 0 1 0 ${f(-rx * 2)} 0 Z`;
  const grass = { light: '', dark: '', flowers: '', hearts: '', pebbles: '' };
  for (let n = 0; n < Math.round(h / 22); n++) {
    const tx = rt() * w;
    const ty = rt() * h;
    const blades = 3 + Math.floor(rt() * 3);
    const tall = 9 + rt() * 5;
    let d = '';
    let top = null;
    for (let b = 0; b < blades; b++) {
      const u = (b / (blades - 1)) * 2 - 1; // -1 left .. 1 right (blades is 3 to 5)
      const bx = tx + u * 5;
      const bh = tall * (1 - Math.abs(u) * 0.35) * (0.85 + rt() * 0.3);
      const lean = u * 5 + (rt() - 0.5) * 2;
      const tipX = bx + lean;
      const tipY = ty - bh;
      d += ` M ${f(bx - 1.5)} ${f(ty)} Q ${f(bx + lean * 0.2 - 0.4)} ${f(ty - bh * 0.6)} ${f(tipX)} ${f(tipY)} Q ${f(bx + lean * 0.3 + 1.3)} ${f(ty - bh * 0.5)} ${f(bx + 1.5)} ${f(ty)} Z`;
      if (!top || tipY < top[1]) top = [tipX, tipY];
    }
    grass[rt() < 0.3 ? 'dark' : 'light'] += d;
    if (rt() < 0.16) {
      grass.flowers += dot(top[0], top[1] - 0.6, 2.1);
      grass.hearts += dot(top[0], top[1] - 0.6, 0.85);
    }
    if (rt() < 0.12) grass.pebbles += dot(tx + 12 + rt() * 6, ty - 1, 2.6 + rt() * 1.4, 1.8);
  }
  return grass;
}

// clouds drifting high above the map, along its edges: { x, y, w, flip, dur, puffs }
/** @param {number} w @param {number} h @param {boolean} wide @returns {{ x: number, y: number, w: number, flip: boolean, dur: number, puffs: number[][] }[]} */
export function driftClouds(w, h, wide) {
  const rc = rng(7);
  const cl = [];
  for (let cy = 260, n = 0; cy < h - 200; cy += wide ? 620 : 560, n++) {
    const left = n % 2 === 0;
    const cw = (wide ? 180 : 120) + rc() * (wide ? 90 : 40);
    const cx = left ? -cw * 0.3 + rc() * w * (wide ? 0.08 : 0.05) : w - cw * 0.7 - rc() * w * (wide ? 0.08 : 0.05);
    // round puffs on a flat base (in the 200 x 92 cloud box), each cloud a little different
    const puffs = [[40, 62, 19], [74, 46, 26], [114, 40, 29], [150, 54, 22], [172, 66, 14]].map(([px, py, pr]) => {
      const k = 0.88 + rc() * 0.24;
      return [px, py + pr * (1 - k), pr * k];
    });
    cl.push({ x: cx, y: cy + rc() * 160, w: cw, flip: !left, dur: 18 + rc() * 10, puffs });
  }
  return cl;
}
