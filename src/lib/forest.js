// shared drawing helpers for the night-forest scenes (hero and the closing section)

// seeded randomness, so the forest looks the same on every visit
export function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a simple cartoon spruce: a few triangles nested from the tree's top, each reaching lower and
// wider, so together they make one zigzag silhouette, on a bare tapering trunk. The tiers are
// listed bottom to top. Every tree is a little different (its own randomness, from its position).
//   trunk  the trunk, drawn first
//   tiers  the tiers, bottom to top
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

// a row of pines between `from` and `to`, skipping any x ranges in keepClear
export function layer(seed, count, from, to, base, hMin, hMax, keepClear = []) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = from + ((to - from) * (i + r() * 0.8)) / count;
    if (keepClear.some(([a, b]) => x > a && x < b)) continue;
    const h = hMin + r() * (hMax - hMin);
    out.push(pine(x, base + r() * 20, h, h * (0.42 + r() * 0.1)));
  }
  return out;
}
