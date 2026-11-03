// @ts-check
// The route through the stops and the scenery and rivers around it, worked out without the page:
// Journey.svelte measures where the stories sit and draws what planRoute returns.
import { rng } from './random.js';
import { SCENERY } from './scenery.js';

/** @typedef {{ kind: import('./scenery.js').PlaceKind, x: number, y: number, scale: number, seed?: number, label?: string }} Place a place on the map, as Doodle props */

// which side of the route each story sits on, alternating from the right
export const sideOf = (i) => (i % 2 === 0 ? 'right' : 'left');

// the trip starts on the Velebit pin, up in the mountains: the range around it, and the little
// lake (source) the first river springs from, a mountain stream running off west toward the sea
function startInMountains(g0, w, wide) {
  /** @type {Place[]} */
  const places = [];
  if (wide) {
    // layered back to front, all left of the story card: distant peaks, the main range (the pin
    // on its right flank, its label clear of the route), a smaller range in front
    places.push({ kind: 'mountains', x: g0.x + 120, y: g0.pinY - 50, scale: 0.7, seed: 8 });
    places.push({ kind: 'mountains', x: g0.x - 70, y: g0.pinY + 6, scale: 1.15, seed: 5, label: 'Velebit' });
    places.push({ kind: 'mountains', x: g0.x + 150, y: g0.pinY + 70, scale: 0.6, seed: 13 });
    places.push({ kind: 'forest', x: g0.x - w * 0.12, y: g0.pinY + 150, scale: 0.85, seed: 2 });
  } else {
    places.push({ kind: 'mountains', x: g0.x - 6, y: g0.pinY + 18, scale: 0.95, seed: 5 });
    places.push({ kind: 'mountains', x: w * 0.2, y: g0.pinY - 50, scale: 0.6, seed: 8, label: 'Velebit' });
  }
  const lake = wide ? [g0.x - w * 0.16, g0.pinY + 70] : [w * 0.12, g0.pinY - 4];
  /** @type {Place} */
  const source = { kind: 'lake', x: lake[0], y: lake[1], scale: wide ? 0.55 : 0.4, seed: 17 };
  places.push(source);
  const stream = [[lake[0], lake[1] + 6], [lake[0] + (wide ? 10 : 0), lake[1] + 90], [lake[0] - 10, lake[1] + 260], [-60, lake[1] + 380]];
  return { places, source, stream };
}

// a detour off the road to a labelled spot (to the side s), starting at height ay: the waypoints
// out round the spot in a loop (over its top, its far side, under it) and back, and the spot itself.
// Coming from the spot's side already (fromX), the road heads straight into the loop instead of
// doubling back past the turn-off.
function detourLoop({ detour, fromX, ay, s, w, wide }) {
  const R = wide ? 46 : 34;
  const ax = w * (0.5 + 0.06 * s);
  const tx = ax + s * R * (wide ? 3.6 : 2.5);
  const ty = ay + R;
  const bx = ax + s * R * 0.25;
  const by = ay + R * 2.1;
  const pts = (fromX - ax) * s <= 0 ? [[ax, ay]] : [];
  pts.push([tx - s * R * 0.6, ty - R * 0.85], [tx, ty], [tx - s * R * 0.6, ty + R * 0.85], [bx, by]);
  /** @type {Place} */
  const spot = { kind: detour.icon, x: tx + s * (wide ? 34 : 26), y: ty + 10, label: detour.label, scale: wide ? 1.2 : 0.95 };
  return { pts, spot };
}

// the place of a stop's own (its doodle) next to its pin n: a city is drawn around the pin (which
// sits on its Old Town square) with the map's river running through it as the Vltava, under
// Charles Bridge (river); anything else stands at (x, y), the farm a size up as the whole little
// scene it is. A stop without a place has neither.
function placeOfStop({ kind, n, i, x, y, wide }) {
  if (!kind) return { place: null, river: null };
  if (kind === 'city') {
    const cs = wide ? 1.6 : 1;
    const cx = n.x - 46 * cs;
    const cy = n.pinY - 12 * cs;
    const river = [[2, -110], [-6, -40], [2, 2], [10, 40], [26, 90]].map(([lx, ly]) => [cx + lx * cs, cy + ly * cs]);
    return { place: { kind, x: cx, y: cy, scale: cs, seed: i + 4 }, river };
  }
  return { place: { kind, x, y, scale: (wide ? 1.2 : 0.85) * (kind === 'farm' ? 1.35 : 1), seed: i + 4 }, river: null };
}

// a leg's river comes in from one side, meanders across, swinging round the places on its banks,
// and leaves by the other side; into a city it runs straight on to the line it takes through the
// streets (cityRiver)
function legRiver({ r, s, w, at, cityRiver }) {
  const edge = (side) => (side > 0 ? w + 60 : -60);
  const river = [[edge(s), at(0.12)], [w * (0.5 + s * (0.25 + r() * 0.15)), at(0.3 + r() * 0.1)]];
  const swing = [w * (0.5 - s * (0.3 + r() * 0.15)), at(cityRiver ? 0.45 : 0.62 + r() * 0.1)];
  if (cityRiver) river.push(...cityRiver);
  else river.push(swing, [edge(-s), at(0.92)]);
  return river;
}

// the border lines on a leg, with any countries driven through on the way
function bordersCrossed({ from, to, s, at }) {
  const lands = [from.country, ...(to.via ?? []), to.country];
  const borders = [];
  for (let c = 0; c < lands.length - 1; c++) {
    if (lands[c] === lands[c + 1]) continue;
    borders.push({ y: at((c + 1) / lands.length), from: lands[c], to: lands[c + 1], side: s < 0 ? 'right' : 'left' });
  }
  return borders;
}

// leg i of the trip, from stop `from` (where the route meets it: g) to stop `to` (n): the
// waypoints after g's pin (pts[exit] is where it leaves g's story), the scenery along the way,
// the leg's river (into a city it runs on through the streets: city) and the borders it crosses
function planLeg({ g, n, i, from, to, w, wide }) {
  const pts = [];
  /** @type {Place[]} */
  const places = [];
  // down past the stop's story, wavering a touch
  for (let y = g.pinY + 110, k = i * 7 + 3; y < g.exitY - 40; y += 110, k++) pts.push([g.x + Math.sin(k * 12.9898) * 2.6, y]);
  pts.push([g.x, g.exitY]);
  const exit = pts.length - 1;
  const s = i % 2 ? 1 : -1; // side the detour swings out to

  // leaving the mountains: the road runs straight on down to Gospić, between a few peaks
  if (i === 0) {
    const left = g.x < w / 2;
    places.push({ kind: 'mountains', x: w * (left ? 0.95 : 0.05), y: g.exitY + 60, scale: wide ? 0.9 : 0.55, seed: 21 });
    places.push({ kind: 'mountains', x: w * (left ? 0.05 : 0.95), y: g.exitY + 150, scale: wide ? 0.75 : 0.5, seed: 27 });
  }
  const at = (f) => g.exitY + (n.pinY - g.exitY) * f;

  if (to.detour) {
    const loop = detourLoop({ detour: to.detour, fromX: g.x, ay: at(0.36), s, w, wide });
    pts.push(...loop.pts);
    places.push(loop.spot);
  }
  pts.push([n.x, n.pinY]);

  // scenery along the way
  const far = (f) => w * (0.5 - s * f);
  const near = (f) => w * (0.5 + s * f);
  // the stop's own place sits just before we arrive
  const own = placeOfStop({ kind: to.doodle, n, i, x: far(wide ? 0.32 : 0.26), y: at(0.8), wide });
  if (own.place) places.push(own.place);
  const cityRiver = own.river;
  places.push({ kind: 'field', x: far(wide ? 0.2 : 0.14), y: at(0.5), scale: wide ? 1 : 0.7, seed: i + 2 });
  if (i > 0) {
    places.push({ kind: 'forest', x: near(wide ? 0.3 : 0.26), y: at(0.12), scale: wide ? 1.2 : 0.75, seed: i + 11 });
    places.push({ kind: i % 2 ? 'lake' : 'hills', x: far(wide ? 0.3 : 0.27), y: at(0.18), scale: wide ? 1.1 : 0.75, seed: i + 9 });
  }
  if (!cityRiver) places.push({ kind: 'forest', x: near(wide ? 0.36 : 0.3), y: at(0.9), scale: wide ? 0.9 : 0.6, seed: i + 31 });

  const river = legRiver({ r: rng(i * 131 + 7), s, w, at, cityRiver });
  const borders = bordersCrossed({ from, to, s, at });
  return { pts, exit, places, river, city: Boolean(cityRiver), borders };
}

// wide screens: a little scenery on the outer side of each story too
/** @returns {Place[]} */
function besideStories(geo, w) {
  return geo.map((g, i) => {
    const outer = sideOf(i) === 'right' ? g.x * 0.45 : w - (w - g.x) * 0.45;
    return { kind: i % 2 ? 'hills' : 'forest', x: outer, y: (g.top + g.bottom) / 2, scale: 0.8, seed: i + 51 };
  });
}

// Everything the map draws, worked out from where the route meets each story (geo, measured on the
// page: per stop { x, top, bottom, pinY, exitY }) and the map's width:
//   pts      the route's waypoints, from the first pin to the last (joined by curve() in spline.js, so the
//            route bends in round curves everywhere and still runs exactly through every pin)
//   marks    { y, i, pin? }: the route at waypoint i reaches y, an exit or (pin) a stop's pin
//   places   the scenery, as Doodle props ({ kind, x, y, scale, seed, label? })
//   borders  { y, from, to, side }: border lines between countries
//   streams  each river's waypoints (bent around the scenery by keepDry): the mountain stream,
//            then one per leg crossing the map from side to side
//   source   the lake the first stream springs from
export function planRoute({ geo, stops, w, wide }) {
  const start = startInMountains(geo[0], w, wide);
  const pts = [[geo[0].x, geo[0].pinY]];
  const marks = [];
  /** @type {Place[]} */
  const places = [...start.places];
  const borders = [];
  const streams = [start.stream];
  /** @type {number[][] | null} */
  let vltava = null; // the river that runs on through the city and off the bottom of the map
  for (let i = 0; i < geo.length - 1; i++) {
    const leg = planLeg({ g: geo[i], n: geo[i + 1], i, from: stops[i], to: stops[i + 1], w, wide });
    marks.push({ y: geo[i].exitY, i: pts.length + leg.exit });
    pts.push(...leg.pts);
    marks.push({ y: geo[i + 1].pinY, i: pts.length - 1, pin: true });
    places.push(...leg.places);
    borders.push(...leg.borders);
    streams.push(leg.river);
    if (leg.city) vltava = leg.river;
  }
  if (wide) places.push(...besideStories(geo, w));
  // the Vltava leaves the map past the last stop
  const last = geo[geo.length - 1];
  vltava?.push([w * 0.6, last.exitY + 40], [w + 60, last.exitY + 120]);
  return { pts, marks, places, borders, streams, source: start.source };
}

// keep the scenery out of the water. The lookout and the rest stop sit on the route's detour
// loops, so a river bends around them; anything else slides sideways off the rivers. The
// stream's source lake and the city the Vltava runs through are meant to touch them.
// Moves the places (and bends the streams) in place. sample(river) gives points along the
// river's drawn line, every 8 units (the map measures it in an SVG path).
export function keepDry(dood, streams, source, { w, sample }) {
  const box = (dd, dx = 0) => {
    const [l, r, t, b] = SCENERY[dd.kind].foot;
    const s = Math.abs(dd.scale);
    return [dd.x + dx + l * s, dd.x + dx + r * s, dd.y + t * s, dd.y + b * s];
  };
  const wet = (b, rs, pad = 12) => rs.filter(([x, y]) => x > b[0] - pad && x < b[1] + pad && y > b[2] - pad && y < b[3] + pad);
  const scenery = dood.filter((dd) => dd !== source && SCENERY[dd.kind].foot);

  for (const dd of scenery.filter((dd) => dd.kind === 'lookout' || dd.kind === 'rest')) {
    for (const river of streams) {
      const b = box(dd);
      const hit = wet(b, sample(river));
      if (!hit.length) continue;
      // swing the river past the spot on the side it already runs on
      const mx = hit.reduce((a, [x]) => a + x, 0) / hit.length;
      const x = mx < (b[0] + b[1]) / 2 ? b[0] - 30 : b[1] + 30;
      // its own waypoints alongside the spot give way to two that pass it
      const [y0, y1] = [b[2] - 10, b[3] + 10];
      const at = river.findIndex(([, ry]) => ry >= y0);
      const end = river.findIndex(([, ry]) => ry > y1);
      river.splice(at < 0 ? river.length : at, (end < 0 ? river.length : end) - (at < 0 ? river.length : at), [x, y0], [x, y1]);
    }
  }

  const rs = streams.flatMap(sample);
  for (const dd of scenery.filter((dd) => dd.kind !== 'lookout' && dd.kind !== 'rest')) {
    const hit = wet(box(dd), rs);
    if (!hit.length) continue;
    // slide away from the river first, then the other way, a little further each try
    const away = hit.reduce((a, [x]) => a + x, 0) / hit.length < dd.x ? 1 : -1;
    for (let step = 12; step < w * 0.6; step += 12) {
      const dx = [away * step, -away * step].find((d) => {
        const b = box(dd, d);
        return dd.x + d > 0 && dd.x + d < w && !wet(b, rs).length;
      });
      if (dx !== undefined) {
        dd.x += dx;
        break;
      }
    }
  }
}
