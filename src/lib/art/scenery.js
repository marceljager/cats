// @ts-check
// The map's scenery: every kind of place Doodle.svelte draws, and how each one is laid out.
import { rng } from './random.js';

// every kind of place, in the order the kit shows them, with its footprint around its anchor at
// scale 1, [left, right, top, bottom], which the map keeps out of the rivers (Journey.svelte); the
// city has none, it is drawn around its river
export const SCENERY = {
  forest: { foot: [-84, 81, -55, 31] },
  city: {},
  farm: { foot: [-88, 96, -31, 14] },
  mountains: { foot: [-140, 160, -127, 36] },
  hills: { foot: [-68, 72, -57, 15] },
  lake: { foot: [-60, 75, -47, 27] },
  field: { foot: [-82, 85, -26, 32] },
  lookout: { foot: [-36, 40, -75, 27] },
  rest: { foot: [-42, 43, -40, 27] },
};
/** @typedef {keyof typeof SCENERY} PlaceKind */
export const KINDS = /** @type {PlaceKind[]} */ (Object.keys(SCENERY));

const TREE = 0.85;

// scatter points inside an ellipse, back to front
function scatter(r, n, rx, ry) {
  return Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    return { x: Math.cos(a) * d * rx, y: Math.sin(a) * d * ry };
  });
}

// the pieces a place of this kind is drawn from, each { t: piece type, x, y, … } in the place's
// own units, sorted back to front; the same seed always gives the same place
export function layoutPlace(kind, { seed = 1, scale = 1 } = {}) {
  const r = rng(seed * 9973 + kind.length * 31);
  const out = [];
  // every tree on the map is the same size on screen, whatever the scale of the place it stands in
  const tree = (p) =>
    out.push({ t: r() < 0.45 ? 'pine' : 'tree', x: p.x, y: p.y, s: TREE / scale, sway: r() < 0.35, delay: r() * 3 });

  if (kind === 'forest') {
    // a smaller forest has fewer trees, not smaller ones
    scatter(r, Math.max(6, Math.round(22 * Math.min(1, scale * scale))), 74, 30).forEach((p) => tree(p));
  } else if (kind === 'city') {
    // Prague as one skyline, side-on like the rest of the map. The Vltava runs down the middle
    // (drawn by the map) under Charles Bridge. West bank: Petřín hill with its lookout tower, the
    // castle on its ridge, Malá Strana's terrace below with St. Nicholas rising behind. East bank:
    // the Old Town in two terraces with Týn, the Old Town Hall tower and the Powder Tower rising
    // between them, the square around the pin (46, 12) left open. z sets back to front.
    // everything stands on its bank's shadow: the west bank's hills run down to the ground line,
    // and the Old Town's back row has its own shadow just behind the front one
    out.push({ t: 'foot', x: -76, y: 22, rx: 78, ry: 6, z: -99 });
    out.push({ t: 'foot', x: 76, y: 22, rx: 56, ry: 6, z: -99 });
    out.push({ t: 'foot', x: 81, y: 14, rx: 50, ry: 4, z: -99 });
    out.push({ t: 'petrin', z: 0 });
    out.push({ t: 'hrad', z: 1 });
    [[-112, 4], [-104, 1], [-16, -12]].forEach(([tx, ty]) => {
      tree({ x: tx, y: ty });
      out[out.length - 1].z = 2;
    });
    // a terrace of townhouses side by side, each its own height, color and roof
    /** @param {(x: number) => boolean} [keep] which houses to leave standing, by their x */
    const terrace = (x0, x1, y, h0, h1, z, keep = () => true) => {
      for (let x = x0; x < x1; ) {
        const w = 7 + r() * 3.5;
        const hx = x + w / 2;
        if (keep(hx)) out.push({ t: 'townhouse', x: hx, y, w, h: h0 + r() * (h1 - h0), rh: 4 + r() * 2.5, c: Math.floor(r() * 5), roof: Math.floor(r() * 3), z });
        x += w;
      }
    };
    out.push({ t: 'nicholas', x: -58, y: 10, z: 3 });
    terrace(-124, -38, 22, 10, 15, 4);
    terrace(34, 128, 14, 21, 27, 5);
    out.push({ t: 'tyn', x: 74, y: 14, z: 6 });
    out.push({ t: 'oldhall', x: 104, y: 14, z: 6 });
    out.push({ t: 'powder', x: 124, y: 14, z: 6 });
    terrace(26, 128, 22, 9, 12, 7, (x) => x > 56);
    out.push({ t: 'charles', y: 11, z: 8 });
  } else if (kind === 'farm') {
    // seen from the side: goats on a rolling pasture behind a wooden fence, a red barn with its
    // silo, the farmhouse with its chimney going, round hay bales; z sets back to front
    const pasture = { x: 30, y: 2, w: 112, h: 15 };
    const on = (x) => pasture.y - pasture.h * (0.5 + 0.5 * Math.cos((Math.PI * (x - pasture.x)) / (pasture.w / 2))) + 2.5;
    out.push({ t: 'foot', x: 4, y: 8, rx: 92, ry: 6, z: -99 });
    out.push({ t: 'mound', ...pasture, z: 0 });
    out.push({ t: 'goat', x: 12, y: on(12), c: 0, z: 1 });
    out.push({ t: 'goat', x: 36, y: on(36), c: 1, flip: true, graze: true, z: 1 });
    out.push({ t: 'goat', x: 56, y: on(56), c: 2, z: 1 });
    out.push({ t: 'fence', from: -14, to: 72, y: 5, z: 2 });
    out.push({ t: 'silo', x: -18, y: 4, z: 3 });
    out.push({ t: 'barn', x: -42, y: 6, z: 4 });
    out.push({ t: 'farmhouse', x: 64, y: 9, s: 1, smoke: true, delay: 1, z: 4 });
    out.push({ t: 'hay', x: -74, y: 10, z: 5 });
    out.push({ t: 'hay', x: -64, y: 13, z: 5 });
    tree({ x: 86, y: 8 });
    out[out.length - 1].z = 3;
  } else if (kind === 'mountains') {
    const peaks = [
      [-84, 54], [-46, 82], [-8, 112], [34, 90], [72, 64], [104, 44],
    ];
    peaks
      .map(([px, ph]) => ({ px: px + (r() - 0.5) * 10, ph: ph * (0.85 + r() * 0.3), w: 34 + r() * 16 }))
      .sort((a, b) => b.ph - a.ph)
      .forEach((p, i) =>
        out.push({
          t: 'peak', x: p.px, y: i * 2.5, h: p.ph, w: p.w,
          // the summit leans a little, and some peaks have a shoulder on one flank
          lean: (r() - 0.5) * 0.3,
          shoulder: r() < 0.55 ? (r() < 0.5 ? -1 : 1) : 0,
        }),
      );
    // the whole range stands on one soft shadow at its foot
    out.push({ t: 'foot', x: 10, y: 12.5, rx: 150, ry: 8, z: -99 });
    scatter(r, 4, 110, 8).forEach((p) => tree({ x: p.x, y: p.y + 16 }));
  } else if (kind === 'hills') {
    // two rounded hills, the smaller one in front, with trees standing on their crests; z keeps
    // each hill's trees in front of it and behind the hill before it
    const hills = [{ x: -24, y: 0, w: 80, h: 34 }, { x: 28, y: 9, w: 66, h: 25 }];
    hills.forEach((hl, i) => {
      // each hill stands on its own shadow
      out.push({ t: 'foot', x: hl.x + 3, y: hl.y, rx: hl.w * 0.52, ry: 4.5, z: i * 2 - 0.5 });
      out.push({ t: 'mound', ...hl, z: i * 2 });
      // a point on the hill's surface, dx from its crest
      const on = (dx) => ({ x: hl.x + dx, y: hl.y - hl.h * (0.5 + 0.5 * Math.cos((Math.PI * dx) / (hl.w / 2))) + 2 });
      (i === 0 ? [-8, 6] : [10]).forEach((dx) => {
        const n = out.length;
        tree(on(dx));
        out[n].z = i * 2 + 1;
      });
    });
  } else if (kind === 'lake') {
    out.push({ t: 'lake' });
    // clumps of reeds standing on the shore, at the lake's lower edge
    [[-50, 18], [-40, 23], [44, 18]].forEach(([rx, ry]) => out.push({ t: 'reed', x: rx, y: ry + r() * 2 }));
    tree({ x: 58, y: -10 });
  } else if (kind === 'field') {
    // farmland seen from the side like the rest of the map: two gentle rolling hills, the lower one
    // in front, each a patchwork of crop bands (c: 0 wheat, 1 green, 2 ploughed)
    // each hill stands on its own shadow, the back one drawn first
    out.push({ t: 'foot', x: -13, y: 0, rx: 64, ry: 4.5, z: -1 });
    out.push({ t: 'farmhill', i: 0, x: -16, y: 0, w: 124, h: 24, bands: [[0, 0], [0.3, 1], [0.55, 2], [0.78, 0]], z: 0 });
    out.push({ t: 'foot', x: 35, y: 12, rx: 54, ry: 4.5, z: 1 });
    out.push({ t: 'farmhill', i: 1, x: 32, y: 12, w: 104, h: 17, bands: [[0, 2], [0.26, 0], [0.6, 1]], z: 2 });
  } else if (kind === 'lookout') {
    // a wooden lookout tower on a small grassy knoll, a tree on its slope
    out.push({ t: 'foot', x: 2, y: 1, rx: 38, ry: 4.5, z: -99 });
    out.push({ t: 'mound', x: 0, y: 0, w: 66, h: 13, z: 0 });
    out.push({ t: 'tower', y: -11, z: 1 });
    tree({ x: -24, y: -1 });
    out[out.length - 1].z = 2;
  } else if (kind === 'rest') {
    // a picnic table under a striped parasol, a rest-stop sign beside it, a tree for shade
    out.push({ t: 'foot', x: 2, y: 1, rx: 34, ry: 4.5, z: -99 });
    tree({ x: -30, y: -1 });
    out.push({ t: 'picnic', y: 0 });
  }
  // everything sorted so nearer things overlap farther ones (z, where given, overrides y)
  return out.sort((a, b) => (a.z ?? a.y ?? -999) - (b.z ?? b.y ?? -999));
}
