<script>
  import { onMount, tick } from 'svelte';
  import Text from './Text.svelte';
  import Stop from './Stop.svelte';
  import CarCard from './CarCard.svelte';
  import Doodle from './Doodle.svelte';
  import Drawn from './Drawn.svelte';
  import { drawn } from './drawn.js';
  import { parallax } from './parallax.js';
  import { rng } from './random.js';
  import { springTo } from './springs.js';
  import { onScreen, onScrollFrame, reducedMotion } from './viewport.js';

  let { stops } = $props();

  let root;
  let routeEl = $state();
  let measureEl;
  // the pin icon's drop (Icon.svelte), tip at (16, 29) in its 32-unit box
  const PIN = 'M16 29s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15Z';
  let els = $state([]);
  let w = $state(0);
  let h = $state(0);
  let d = $state('');
  let len = $state(0);
  let travelled = $state(0);
  let car = $state({ x: 0, y: 0, tilt: 0, bump: 0 });
  let pins = $state([]);
  let doodles = $state([]);
  let borders = $state([]);
  let paths = $state({ rivers: [], grass: { light: '', dark: '', flowers: '', hearts: '', pebbles: '' } });
  let clouds = $state([]);
  let anchorY = $state(-1);
  let keys = []; // [{ y, len }] route keypoints the car is mapped between
  let pinLens = []; // route length at each stop's pin, for the odometer
  let km = $state(0);
  let moving = $state(false);
  let still = 0;
  let geo = []; // per stop: { pinY, exitY }
  let wide = false;

  const total = $derived(stops[stops.length - 1].km);

  // a story appears when the car arrives at its pin
  const states = $derived(
    anchorY >= 0 && geo.length
      ? stops.map((_, i) => {
          const g = geo[i];
          if (anchorY < g.pinY) return 'upcoming';
          if (i === stops.length - 1) return anchorY > g.pinY + 220 ? 'passed' : 'current';
          return anchorY <= g.exitY ? 'current' : 'passed';
        })
      : stops.map(() => 'upcoming'),
  );

  function sideOf(i) {
    return i % 2 === 0 ? 'right' : 'left';
  }

  // a smooth hand-drawn line through waypoints, for the rivers: a centripetal Catmull-Rom
  // spline, which never overshoots into a loop or a hairpin however unevenly the points are spaced
  function smooth(pts) {
    return `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` + curve(pts).join('');
  }

  // the same spline as a list of pieces, piece i running from point i to point i + 1
  function curve(pts) {
    const f = (n) => n.toFixed(1);
    const dist = (a, b) => Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5, 1e-3);
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      // past either end, extend the line straight on
      const p0 = pts[i - 1] ?? [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
      const p3 = pts[i + 2] ?? [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
      const d1 = dist(p0, p1);
      const d2 = dist(p1, p2);
      const d3 = dist(p2, p3);
      const c1 = [0, 1].map((k) => (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)));
      const c2 = [0, 1].map((k) => (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)));
      out.push(` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`);
    }
    return out;
  }

  function lengthOf(path) {
    measureEl.setAttribute('d', path);
    return measureEl.getTotalLength();
  }

  // each doodle's footprint around its anchor, at scale 1: [left, right, top, bottom]
  const FOOT = {
    mountains: [-140, 160, -127, 36],
    forest: [-84, 81, -55, 31],
    hills: [-68, 72, -57, 15],
    lake: [-60, 75, -47, 27],
    field: [-82, 85, -26, 32],
    farm: [-88, 96, -31, 14],
    lookout: [-36, 40, -75, 27],
    rest: [-42, 43, -40, 27],
  };

  // keep the scenery out of the water. The lookout and the rest stop sit on the route's detour
  // loops, so a river bends around them; anything else slides sideways off the rivers. The
  // stream's source lake and the city the Vltava runs through are meant to touch them.
  function keepDry(dood, streams, source) {
    const box = (dd, dx = 0) => {
      const [l, r, t, b] = FOOT[dd.kind];
      const s = Math.abs(dd.scale);
      return [dd.x + dx + l * s, dd.x + dx + r * s, dd.y + t * s, dd.y + b * s];
    };
    const sample = (river) => {
      measureEl.setAttribute('d', smooth(river));
      const total = measureEl.getTotalLength();
      const out = [];
      for (let l = 0; l < total; l += 8) {
        const q = measureEl.getPointAtLength(l);
        out.push([q.x, q.y]);
      }
      return out;
    };
    const wet = (b, rs, pad = 12) => rs.filter(([x, y]) => x > b[0] - pad && x < b[1] + pad && y > b[2] - pad && y < b[3] + pad);
    const scenery = dood.filter((dd) => dd !== source && FOOT[dd.kind]);

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

  function build() {
    if (!root) return;
    wide = innerWidth >= 760;
    w = root.clientWidth;
    h = root.offsetHeight;
    const base = root.getBoundingClientRect();

    // where the route meets each story
    geo = stops.map((_, i) => {
      const box = els[i].getBoundingClientRect();
      const top = box.top - base.top;
      const bottom = top + box.height;
      const left = box.left - base.left;
      if (wide) {
        const free = sideOf(i) === 'right' ? left : w - (left + box.width);
        const x = sideOf(i) === 'right' ? free / 2 : w - free / 2;
        return { x, top, bottom, pinY: top + 50, exitY: bottom };
      }
      // phones: the car parks above the story, then drives on behind it
      return { x: left + box.width * (i % 2 ? 0.3 : 0.7), top, bottom, pinY: top - 40, exitY: bottom + 30 };
    });

    const g0 = geo[0];
    const dood = [];
    const lines = [];
    const rivers = [];

    // the trip starts on the Velebit pin, up in the mountains
    // the route is a list of waypoints joined by one smooth spline (curve), so it bends in round
    // curves everywhere and still runs exactly through every pin
    const pts = [[g0.x, g0.pinY]];
    const marks = []; // { y, i, pin }: the route at waypoint i reaches this y (an exit or a pin)

    // the Velebit range around the pin, with the little lake the river springs from
    if (wide) {
      // layered back to front, all left of the story card: distant peaks, the main range (the pin
      // on its right flank, its label clear of the route), a smaller range in front
      dood.push({ kind: 'mountains', x: g0.x + 120, y: g0.pinY - 50, scale: 0.7, seed: 8 });
      dood.push({ kind: 'mountains', x: g0.x - 70, y: g0.pinY + 6, scale: 1.15, seed: 5, label: 'Velebit' });
      dood.push({ kind: 'mountains', x: g0.x + 150, y: g0.pinY + 70, scale: 0.6, seed: 13 });
      dood.push({ kind: 'forest', x: g0.x - w * 0.12, y: g0.pinY + 150, scale: 0.85, seed: 2 });
    } else {
      dood.push({ kind: 'mountains', x: g0.x - 6, y: g0.pinY + 18, scale: 0.95, seed: 5 });
      dood.push({ kind: 'mountains', x: w * 0.2, y: g0.pinY - 50, scale: 0.6, seed: 8, label: 'Velebit' });
    }
    const lake = wide ? [g0.x - w * 0.16, g0.pinY + 70] : [w * 0.12, g0.pinY - 4];
    const source = { kind: 'lake', x: lake[0], y: lake[1], scale: wide ? 0.55 : 0.4, seed: 17 };
    dood.push(source);
    // each stretch of the trip has its own river: a mountain stream from the lake under Velebit
    // running off west toward the sea, then one per leg crossing the map from side to side
    const streams = [[[lake[0], lake[1] + 6], [lake[0] + (wide ? 10 : 0), lake[1] + 90], [lake[0] - 10, lake[1] + 260], [-60, lake[1] + 380]]];
    let vltava = null; // the river that runs on through the city and off the bottom of the map

    geo.forEach((g, i) => {
      const n = geo[i + 1];
      if (!n) return; // the trip ends at the last pin
      // down past the stop's story, wavering a touch
      for (let y = g.pinY + 110, k = i * 7 + 3; y < g.exitY - 40; y += 110, k++) pts.push([g.x + Math.sin(k * 12.9898) * 2.6, y]);
      pts.push([g.x, g.exitY]);
      marks.push({ y: g.exitY, i: pts.length - 1 });
      const r = rng(i * 131 + 7);
      const s = i % 2 ? 1 : -1; // side the detour swings out to

      // leaving the mountains: the road runs straight on down to Gospić, between a few peaks
      let sx = g.x;
      let sy = g.exitY;
      if (i === 0) {
        const left = g.x < w / 2;
        dood.push({ kind: 'mountains', x: w * (left ? 0.95 : 0.05), y: g.exitY + 60, scale: wide ? 0.9 : 0.55, seed: 21 });
        dood.push({ kind: 'mountains', x: w * (left ? 0.05 : 0.95), y: g.exitY + 150, scale: wide ? 0.75 : 0.5, seed: 27 });
      }
      const gap = n.pinY - sy;
      const at = (f) => sy + gap * f;
      const detour = stops[i + 1].detour;

      if (detour) {
        const spot = typeof detour === 'string' ? { label: detour, icon: 'lookout' } : detour;
        // pull off the road to look at something, round the spot and come back
        const R = wide ? 46 : 34;
        const ax = w * (0.5 + 0.06 * s);
        const ay = at(0.36);
        const tx = ax + s * R * (wide ? 3.6 : 2.5);
        const ty = ay + R;
        const bx = ax + s * R * 0.25;
        const by = ay + R * 2.1;
        // out to the spot and round it in a loop (over its top, its far side, under it) and back;
        // coming from the spot's side already, we head straight into the loop instead of doubling
        // back past the turn-off
        if ((sx - ax) * s <= 0) pts.push([ax, ay]);
        pts.push([tx - s * R * 0.6, ty - R * 0.85], [tx, ty], [tx - s * R * 0.6, ty + R * 0.85], [bx, by]);
        dood.push({ kind: spot.icon ?? 'lookout', x: tx + s * (wide ? 34 : 26), y: ty + 10, label: spot.label, scale: wide ? 1.2 : 0.95 });
      }
      pts.push([n.x, n.pinY]);
      marks.push({ y: n.pinY, i: pts.length - 1, pin: true });

      // scenery along the way
      const far = (f) => w * (0.5 - s * f);
      const near = (f) => w * (0.5 + s * f);
      // the stop's own place sits just before we arrive
      const kind = stops[i + 1].doodle ?? 'village';
      let cityRiver = null;
      if (kind === 'city') {
        // the city is drawn around the stop: its pin sits on the Old Town square
        const cs = wide ? 1.6 : 1;
        const cx = n.x - 46 * cs;
        const cy = n.pinY - 12 * cs;
        dood.push({ kind, x: cx, y: cy, scale: cs, seed: i + 4 });
        // the map's river runs through it as the Vltava, under Charles Bridge
        cityRiver = [[2, -110], [-6, -40], [2, 2], [10, 40], [26, 90]].map(([lx, ly]) => [cx + lx * cs, cy + ly * cs]);
      } else {
        const vx = far(wide ? 0.32 : 0.26);
        const vy = at(0.8);
        // the farm is a whole little scene (barn, goats, farmhouse), so it gets drawn a size up
        dood.push({ kind, x: vx, y: vy, scale: (wide ? 1.2 : 0.85) * (kind === 'farm' ? 1.35 : 1), seed: i + 4 });
      }
      dood.push({ kind: 'field', x: far(wide ? 0.2 : 0.14), y: at(0.5), scale: wide ? 1 : 0.7, seed: i + 2 });
      if (i > 0) {
        dood.push({ kind: 'forest', x: near(wide ? 0.3 : 0.26), y: at(0.12), scale: wide ? 1.2 : 0.75, seed: i + 11 });
        dood.push({ kind: i % 2 ? 'lake' : 'hills', x: far(wide ? 0.3 : 0.27), y: at(0.18), scale: wide ? 1.1 : 0.75, seed: i + 9 });
      }
      if (!cityRiver) dood.push({ kind: 'forest', x: near(wide ? 0.36 : 0.3), y: at(0.9), scale: wide ? 0.9 : 0.6, seed: i + 31 });
      // this leg's river comes in from one side, meanders across, swinging round the places on
      // its banks, and leaves by the other side; into a city it runs straight on to the line it
      // takes through the streets
      const edge = (side) => (side > 0 ? w + 60 : -60);
      const course = [[edge(s), at(0.12)], [w * (0.5 + s * (0.25 + r() * 0.15)), at(0.3 + r() * 0.1)]];
      const swing = [w * (0.5 - s * (0.3 + r() * 0.15)), at(cityRiver ? 0.45 : 0.62 + r() * 0.1)];
      if (cityRiver) course.push(...cityRiver);
      else course.push(swing, [edge(-s), at(0.92)]);
      streams.push(course);
      if (cityRiver) vltava = course;

      // border crossings, with any countries driven through on the way
      const lands = [stops[i].country, ...(stops[i + 1].via ?? []), stops[i + 1].country];
      for (let c = 0; c < lands.length - 1; c++) {
        if (lands[c] === lands[c + 1]) continue;
        lines.push({ y: at((c + 1) / lands.length), from: lands[c], to: lands[c + 1], side: s < 0 ? 'right' : 'left' });
      }
    });

    // wide screens: scenery beside each story too
    if (wide) {
      geo.forEach((g, i) => {
        const outer = sideOf(i) === 'right' ? g.x * 0.45 : w - (w - g.x) * 0.45;
        dood.push({ kind: i % 2 ? 'hills' : 'forest', x: outer, y: (g.top + g.bottom) / 2, scale: 0.8, seed: i + 51 });
      });
    }

    const last = geo[geo.length - 1];
    // the Vltava leaves the map past the last stop
    vltava?.push([w * 0.6, last.exitY + 40], [w + 60, last.exitY + 120]);
    keepDry(dood, streams, source);
    rivers.push(...streams.map(smooth));

    const pieces = curve(pts);
    const p = `M ${pts[0][0]} ${pts[0][1]}` + pieces.join('');
    const lenAt = (i) => lengthOf(`M ${pts[0][0]} ${pts[0][1]}` + pieces.slice(0, i).join(''));
    keys = [{ y: g0.pinY, len: 0 }, ...marks.map((m) => ({ y: m.y, len: lenAt(m.i) }))];
    pinLens = [0, ...marks.filter((m) => m.pin).map((m) => lenAt(m.i))];
    d = p;
    pins = geo.map((g) => ({ x: g.x, y: g.pinY }));
    doodles = dood;
    borders = lines;
    // grass tufts and pebbles scattered over the land: each tuft a few tapered blades fanning out,
    // its own height and lean, some a darker green, now and then a tiny flower on the tallest blade
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
        const u = blades === 1 ? 0 : (b / (blades - 1)) * 2 - 1; // -1 left .. 1 right
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
    paths = { rivers, grass };

    // clouds drifting high above the map, along its edges
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
    clouds = cl;
    tick().then(() => {
      len = routeEl.getTotalLength();
      update();
    });
  }

  // map the reading line to a length along the route, piecewise between keypoints
  function lengthAt(y) {
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1];
      const b = keys[i];
      if (y <= b.y) {
        const f = b.y === a.y ? 1 : Math.max(0, (y - a.y) / (b.y - a.y));
        return a.len + (b.len - a.len) * f;
      }
    }
    return len;
  }

  function update() {
    if (!routeEl || !len) return;
    const rect = root.getBoundingClientRect();
    // off screen (e.g. still up in the hero): nothing to move
    if (!onScreen(root)) return;
    const target = Math.min(Math.max(window.innerHeight * 0.5 - rect.top, 0), h - 1);
    const L = Math.min(lengthAt(target), len);
    if (L === travelled && target === anchorY) return;
    const pt = routeEl.getPointAtLength(L);
    const ahead = routeEl.getPointAtLength(Math.min(L + 6, len));
    const lean = Math.atan2(ahead.x - pt.x, Math.max(ahead.y - pt.y, 0.01)) * (180 / Math.PI);
    car = {
      x: pt.x,
      y: pt.y,
      tilt: Math.max(-34, Math.min(34, -lean * 0.5)),
      bump: reducedMotion() ? 0 : Math.sin(L / 9) * 1.8,
    };
    travelled = L;
    anchorY = target;
    km = kmAt(L);
  }

  // kilometres from the forest, interpolated between the stops' pins
  function kmAt(L) {
    if (!pinLens.length || L <= pinLens[0]) return stops[0].km;
    for (let i = 1; i < pinLens.length; i++) {
      if (L <= pinLens[i]) {
        const f = (L - pinLens[i - 1]) / (pinLens[i] - pinLens[i - 1] || 1);
        return Math.round(stops[i - 1].km + (stops[i].km - stops[i - 1].km) * f);
      }
    }
    return stops[stops.length - 1].km;
  }

  onMount(() => {
    let lastY = scrollY;
    const follow = () => {
      if (!onScreen(root)) return;
      // the odometer shows while the car is moving (not on a mere resize) and fades once scrolling stops
      if (scrollY !== lastY) {
        lastY = scrollY;
        moving = true;
        clearTimeout(still);
        still = setTimeout(() => (moving = false), 900);
      }
      update();
    };
    const ro = new ResizeObserver(() => build());
    ro.observe(root);
    const stop = onScrollFrame(follow);
    build();
    return () => {
      ro.disconnect();
      stop();
      clearTimeout(still);
    };
  });
</script>

<section class="journey section" id="cesta" aria-labelledby="cesta-h">
  <div class="wrap">
    <Text variant="title" id="cesta-h">Jak jsme dojeli z&nbsp;chorvatských hor až do Prahy</Text>
    <Text variant="lede" class="journey-lede">Celkem cca {total} kilometrů. Řídili lidi, my jsme dělali navigaci.</Text>

    <div class="route" bind:this={root}>
      <svg class="map" width={w} height={h} viewBox="0 0 {w} {h}" aria-hidden="true">
        <defs>
          <mask id="driven" maskUnits="userSpaceOnUse">
            <path
              {d}
              fill="none"
              stroke="#fff"
              stroke-width="16"
              stroke-linecap="round"
              style="stroke-dasharray: {len} {len}; stroke-dashoffset: {len - travelled};"
            />
          </mask>
        </defs>
        <path d="" bind:this={measureEl} class="measure" />
        {#each paths.rivers as rv}
          <path class="river-bank" d={rv} />
          <path class="river" d={rv} />
          <path class="river-current" d={rv} />
        {/each}

        <path class="pebbles" d={paths.grass.pebbles} />
        <path class="grass" d={paths.grass.light} />
        <path class="grass dark" d={paths.grass.dark} />
        <path class="flowers" d={paths.grass.flowers} />
        <path class="hearts" d={paths.grass.hearts} />

        {#each doodles as dd}
          <Doodle {...dd} />
        {/each}

        {#each borders as b}
          <g class="border">
            <path d="M 0 {b.y} C {w * 0.3} {b.y - 14}, {w * 0.6} {b.y + 14}, {w} {b.y - 4}" />
            <text x={b.side === 'right' ? w - 8 : 8} y={b.y - 12} text-anchor={b.side === 'right' ? 'end' : 'start'}>{b.from}</text>
            <text x={b.side === 'right' ? w - 8 : 8} y={b.y + 26} text-anchor={b.side === 'right' ? 'end' : 'start'}>{b.to}</text>
          </g>
        {/each}

        <path class="ahead" {d} />
        <path class="done" bind:this={routeEl} {d} mask="url(#driven)" />

        {#each pins as pin, i}
          {@const k = states[i] === 'upcoming' ? 0 : 1}
          <!-- the site's pin icon (Icon.svelte) at map size, tip on the route: a cream outline
               waiting, red with its cel shade and shine once the car arrives -->
          <g class="pin {states[i]}" transform="translate({pin.x} {pin.y})">
            {#if !drawn('M11')}<ellipse class="pin-ground" cx="0" cy="1" rx="10" ry="3.5" />{/if}
            <g class="pin-body" use:springTo={{ to: { scale: states[i] === 'upcoming' ? 0.85 : 1 }, bounce: 0.55, duration: 0.45 }}>
              <!-- hand-drawn: one sheet with the waiting pin and, 60 to the right, the reached one -->
              <g transform="translate({-60 * k} 0)">
                <Drawn id="M11" part={k}>
                  <g transform="translate({60 * k} 0) scale(1.75) translate(-16 -29)">
                    <clipPath id="pin-clip-{i}"><path d={PIN} /></clipPath>
                    <path class="pin-shade" d={PIN} />
                    <g clip-path="url(#pin-clip-{i})"><path class="pin-fill" d={PIN} transform="translate(-2.2 -2.2)" /></g>
                    <path class="pin-line" d={PIN} />
                    <path class="pin-shine" d="M10.3 12 a6.2 6.2 0 0 1 3 -3.8" />
                    <!-- the cream centre, shaded like the icon's -->
                    <clipPath id="pin-eye-clip-{i}"><path d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" /></clipPath>
                    <path class="pin-eye-shade" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" />
                    <g clip-path="url(#pin-eye-clip-{i})"><path class="pin-eye-fill" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" transform="translate(-2.2 -2.2)" /></g>
                    <path class="pin-eye" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" />
                  </g>
                </Drawn>
              </g>
            </g>
          </g>
        {/each}
      </svg>

      <!-- clouds float above the map and lag behind the scroll, so it reads as seen from up high -->
      {#each clouds as c}
        <div class="cloud" style="left:{c.x}px; top:{c.y}px; width:{c.w}px; --dur:{c.dur}s" use:parallax={0.22}>
          <svg viewBox="0 0 200 92" aria-hidden="true" style={c.flip ? 'scale: -1 1' : ''}>
            <Drawn id="M10">
              <!-- the outline under everything, so it only shows around the silhouette; then the
                   puffs in shade, and again in light a little smaller and up to the left, so the
                   shade only rims the lower right of each puff and the base -->
              <rect class="puff-line" x="20" y="56" width="164" height="26" rx="13" />
              {#each c.puffs as [px, py, pr]}<circle class="puff-line" cx={px} cy={py} r={pr} />{/each}
              <rect class="puff-shade" x="20" y="56" width="164" height="26" rx="13" />
              {#each c.puffs as [px, py, pr]}<circle class="puff-shade" cx={px} cy={py} r={pr} />{/each}
              <rect class="puff" x="22" y="52" width="158" height="22" rx="11" />
              {#each c.puffs as [px, py, pr]}<circle class="puff" cx={px - 3} cy={py - 4} r={pr - 4.5} />{/each}
            </Drawn>
          </svg>
        </div>
      {/each}

      <CarCard {...car} {km} {moving} />

      <div class="stops">
        {#each stops as stop, i (stop.id)}
          <Stop {stop} side={sideOf(i)} state={states[i]} bind:el={els[i]} />
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .journey :global(.journey-lede) {
    margin-top: 14px;
    color: var(--ink-soft);
    max-width: 34ch;
  }
  .route {
    position: relative;
    margin-top: clamp(32px, 6vw, 64px);
    /* room for the Velebit range around the first pin */
    padding-top: 260px;
    padding-bottom: 60px;
  }
  .map {
    position: absolute;
    inset: 0;
    overflow: visible;
    pointer-events: none;
  }
  .measure {
    fill: none;
    stroke: none;
  }
  .map path.ahead,
  .map path.done {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ahead {
    stroke: var(--ink);
    stroke-width: 2.5;
    stroke-dasharray: 1 10;
    opacity: 0.45;
  }
  .done {
    stroke: var(--route);
    stroke-width: 6;
    stroke-dasharray: 16 11;
  }
  /* the rivers are outlined in ink like everything else on the map, with a light current drifting slowly downstream */
  .river-bank {
    fill: none;
    stroke: var(--ink);
    stroke-width: 15;
    stroke-linecap: round;
  }
  .river {
    fill: none;
    stroke: #7fb6e4;
    stroke-width: 11;
    stroke-linecap: round;
  }
  .river-current {
    fill: none;
    stroke: #d4ebfa;
    stroke-width: 2;
    stroke-linecap: round;
    /* uneven glints, so it never reads as road markings */
    stroke-dasharray: 4 22 14 36;
    opacity: 0.85;
    animation: flow 7s linear infinite;
  }
  @keyframes flow {
    to { stroke-dashoffset: -76; }
  }
  .grass {
    fill: #6c9c45;
  }
  .grass.dark {
    fill: #4f7f35;
  }
  .flowers {
    fill: #fdfcf6;
    stroke: rgba(22, 19, 17, 0.35);
    stroke-width: 0.8;
  }
  .hearts {
    fill: #e8b93a;
  }
  .pebbles {
    fill: #b8b79a;
    stroke: rgba(22, 19, 17, 0.35);
    stroke-width: 1;
  }
  .map text {
    font-family: var(--f-marker);
    font-weight: 700;
    font-size: 15px;
    fill: var(--ink-soft);
  }
  .border path {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2;
    stroke-dasharray: 2 6 10 6;
    opacity: 0.55;
  }
  .border text {
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 70;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.75;
  }
  .pin-ground {
    fill: rgba(22, 19, 17, 0.25);
  }
  /* drawn like the icon: the shade underneath, the fill nudged up-left over it, the outline on top */
  .pin-shade {
    fill: #e3d9bf;
    transition: fill 0.3s linear;
  }
  .pin-fill {
    fill: var(--paper);
    transition: fill 0.3s linear;
  }
  .pin-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.8;
    stroke-linejoin: round;
    stroke-dasharray: 3 2.4;
  }
  .pin-shine {
    fill: none;
    stroke: #fff;
    stroke-width: 1.8;
    stroke-linecap: round;
    opacity: 0;
    transition: opacity 0.3s linear;
  }
  .pin-eye-shade {
    fill: #e3d9bf;
  }
  .pin-eye-fill {
    fill: var(--paper);
  }
  .pin-eye {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.8;
  }
  .pin-body {
    transform-box: fill-box;
    transform-origin: 50% 100%;
  }
  /* arrived: the pin pops up, red and shiny */
  .pin.current .pin-shade,
  .pin.passed .pin-shade {
    fill: #b3281f;
  }
  .pin.current .pin-fill,
  .pin.passed .pin-fill {
    fill: #e2483d;
  }
  .pin.current .pin-line,
  .pin.passed .pin-line {
    stroke-dasharray: none;
  }
  .pin.current .pin-shine,
  .pin.passed .pin-shine {
    opacity: 0.8;
  }
  .cloud {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    animation: drift 22s ease-in-out infinite alternate;
    animation-duration: var(--dur);
  }
  .cloud svg {
    display: block;
    width: 100%;
    overflow: visible;
    filter: drop-shadow(0 22px 5px rgba(40, 60, 15, 0.13));
  }
  .puff {
    fill: #fdfcf6;
  }
  .puff-shade {
    fill: #dce4e6;
  }
  /* drawn under the fills at twice the width, so only its outer half shows */
  .puff-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 6;
    vector-effect: non-scaling-stroke;
  }
  @keyframes drift {
    from { transform: translateX(-18px); }
    to { transform: translateX(18px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cloud, .river-current { animation: none; }
  }
  .stops {
    --gap: clamp(280px, 48vh, 440px);
    display: grid;
    gap: var(--gap);
  }
  /* Gospić is just down the mountain: the first leg is shorter than the rest */
  .stops > :global(:nth-child(2)) {
    margin-top: calc(250px - var(--gap));
  }
  @media (min-width: 760px) {
    .route {
      padding-top: 150px;
    }
    /* tablets and an unfolded Duo: the story card takes the larger share, the map the rest */
    .journey {
      --gutter: 38%;
    }
  }
  @media (min-width: 1024px) {
    .journey {
      --gutter: 44%;
    }
  }
</style>
