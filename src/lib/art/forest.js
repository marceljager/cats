// @ts-check
// shared drawing helpers for the night-forest scenes (hero and the closing section)
import { rng } from './random.js';

// a simple cartoon spruce standing at x on the ground line `base`, h tall and w wide: a few
// triangles nested from the tree's top, each reaching lower and wider, so together they make one
// zigzag silhouette, on a bare tapering trunk. Returns the path data, the trunk to draw first and
// the tiers from the bottom up. Every tree is a little different (its randomness comes from its
// position), so the same tree always comes out the same.
/** @param {number} x @param {number} base @param {number} h @param {number} w @returns {{ trunk: string, tiers: string[] }} */
export function pine(x, base, h, w) {
  const r = rng(Math.round(x * 13 + base * 7 + h));
  const f = (n) => n.toFixed(1);
  const top = base - h;
  const crownEnd = base - h * (0.12 + r() * 0.05); // the trunk shows below the lowest tier
  const n = h > 300 ? 4 : 3;
  const gap = (crownEnd - top) / (n + 0.5);
  const tiers = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / n;
    const yTip = top + gap * (i + 1.5);
    const yTop = top;
    const half = (w / 2) * (0.38 + 0.62 * t) * (0.92 + r() * 0.16);
    // the lower edge lifts a little toward the trunk, so the branch ends hang lowest
    const lift = gap * 0.12;
    let d = `M ${f(x)} ${f(yTop)}`;
    d += ` Q ${f(x + half * 0.42)} ${f(yTip - (yTip - yTop) * 0.35)} ${f(x + half)} ${f(yTip)}`;
    d += ` Q ${f(x)} ${f(yTip - lift * 2)} ${f(x - half)} ${f(yTip)}`;
    d += ` Q ${f(x - half * 0.42)} ${f(yTip - (yTip - yTop) * 0.35)} ${f(x)} ${f(yTop)} Z`;
    tiers.push(d);
  }
  const tw = Math.max(2.5, w * 0.05);
  const trunk = `M ${f(x - tw * 0.7)} ${f(top + h * 0.5)} L ${f(x + tw * 0.7)} ${f(top + h * 0.5)} L ${f(x + tw * 1.3)} ${f(base)} L ${f(x - tw * 1.3)} ${f(base)} Z`;
  return { trunk, tiers: tiers.reverse() };
}

// a row of `count` pines spread across span [from, to], standing on the ground line `base` (each a
// little lower, up to 20 units) and between height[0] and height[1] tall; none lands inside a
// `clear` range, e.g. [[860, 960]] keeps a gap for the moon. The same seed gives the same row.
//   layer({ seed: 3, count: 26, span: [-40, 1480], base: 760, height: [200, 330], clear: [[860, 960]] })
/** @param {{ seed: number, count: number, span: [number, number], base: number, height: [number, number], clear?: [number, number][] }} row @returns {{ trunk: string, tiers: string[] }[]} */
export function layer({ seed, count, span: [from, to], base, height: [hMin, hMax], clear = [] }) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = from + ((to - from) * (i + r() * 0.8)) / count;
    if (clear.some(([a, b]) => x > a && x < b)) continue;
    const h = hMin + r() * (hMax - hMin);
    out.push(pine(x, base + r() * 20, h, h * (0.42 + r() * 0.1)));
  }
  return out;
}
