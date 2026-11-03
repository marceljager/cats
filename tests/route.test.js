// the map's geometry (route.js), which Journey.svelte draws
import { describe, expect, test } from 'vitest';
import { curve, driftClouds, keepDry, kmAt, lengthAt, planRoute, scatterGrass, smooth } from '../src/lib/art/route.js';
import { KINDS, SCENERY } from '../src/lib/art/scenery.js';
import { stops } from '../src/content.js';

describe('curve', () => {
  const pts = [[0, 0], [40, 80], [10, 200], [90, 260]];
  test('runs through every waypoint, one piece between each two', () => {
    const pieces = curve(pts);
    expect(pieces).toHaveLength(pts.length - 1);
    pieces.forEach((piece, i) => expect(piece.endsWith(`${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`)).toBe(true));
  });
  test('smooth() starts it at the first waypoint', () => {
    expect(smooth(pts).startsWith('M 0.0 0.0 C')).toBe(true);
  });
});

describe('lengthAt', () => {
  const keys = [{ y: 0, len: 0 }, { y: 100, len: 50 }, { y: 300, len: 250 }];
  test('interpolates between keypoints', () => {
    expect(lengthAt(keys, 50, 400)).toBe(25);
    expect(lengthAt(keys, 200, 400)).toBe(150);
  });
  test('stays at the start above the first keypoint and runs to the end past the last', () => {
    expect(lengthAt(keys, -40, 400)).toBe(0);
    expect(lengthAt(keys, 900, 400)).toBe(400);
  });
});

describe('kmAt', () => {
  const trip = [{ km: 0 }, { km: 40 }, { km: 330 }];
  const pinLens = [0, 100, 300];
  test('reads the odometer between the pins, in whole kilometres', () => {
    expect(kmAt(pinLens, trip, 50)).toBe(20);
    expect(kmAt(pinLens, trip, 200)).toBe(185);
    expect(kmAt(pinLens, trip, 111)).toBe(56); // 55.95 km
  });
  test('holds at the first and last stop', () => {
    expect(kmAt(pinLens, trip, 0)).toBe(0);
    expect(kmAt(pinLens, trip, 999)).toBe(330);
    expect(kmAt([], trip, 50)).toBe(0);
  });
});

describe('planRoute', () => {
  // stories 700 px apart, alternating sides, as Journey measures them
  const measured = (wide, w) =>
    stops.map((_, i) => {
      const top = 100 + i * 700;
      const x = i % 2 ? w * 0.8 : w * 0.2;
      return { x, top, bottom: top + 400, pinY: top + (wide ? 50 : -40), exitY: top + (wide ? 400 : 430) };
    });
  for (const [wide, w] of [[true, 1200], [false, 390]]) {
    describe(wide ? 'wide screen' : 'phone', () => {
      const geo = measured(wide, w);
      const plan = planRoute({ geo, stops, w, wide });
      test('starts on the first pin and reaches every later one', () => {
        expect(plan.pts[0]).toEqual([geo[0].x, geo[0].pinY]);
        const pins = plan.marks.filter((m) => m.pin);
        expect(pins.map((m) => m.y)).toEqual(geo.slice(1).map((g) => g.pinY));
        for (const m of pins) expect(plan.pts[m.i]).toEqual([geo.find((g) => g.pinY === m.y).x, m.y]);
      });
      test('draws only kinds of place the map knows, and every detour', () => {
        for (const p of plan.places) expect(KINDS).toContain(p.kind);
        for (const s of stops.filter((s) => s.detour)) expect(plan.places).toContainEqual(expect.objectContaining({ kind: s.detour.icon, label: s.detour.label }));
      });
      test('marks a border wherever the country changes', () => {
        const crossings = stops.slice(1).reduce((n, s, i) => {
          const lands = [stops[i].country, ...(s.via ?? []), s.country];
          return n + lands.slice(1).filter((c, k) => c !== lands[k]).length;
        }, 0);
        expect(plan.borders).toHaveLength(crossings);
      });
      test('comes out the same every time', () => {
        expect(planRoute({ geo, stops, w, wide })).toEqual(plan);
      });
    });
  }
});

describe('keepDry', () => {
  // a straight river, sampled every 8 units like the map does
  const sample = (river) => {
    const out = [];
    for (let i = 0; i < river.length - 1; i++) {
      const [[x0, y0], [x1, y1]] = [river[i], river[i + 1]];
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 8);
      for (let k = 0; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
    }
    return out;
  };
  const wet = (place, rivers) => {
    const [l, r, t, b] = SCENERY[place.kind].foot;
    const s = Math.abs(place.scale);
    return rivers.flatMap(sample).some(([x, y]) => x > place.x + l * s - 12 && x < place.x + r * s + 12 && y > place.y + t * s - 12 && y < place.y + b * s + 12);
  };
  test('slides a place off a river', () => {
    const streams = [[[300, 0], [300, 600]]];
    const forest = { kind: 'forest', x: 300, y: 300, scale: 1 };
    expect(wet(forest, streams)).toBe(true);
    keepDry([forest], streams, null, { w: 800, sample });
    expect(wet(forest, streams)).toBe(false);
  });
  test('bends a river round a lookout instead of moving it', () => {
    const streams = [[[300, 0], [300, 600]]];
    const lookout = { kind: 'lookout', x: 300, y: 300, scale: 1 };
    keepDry([lookout], streams, null, { w: 800, sample });
    expect(lookout.x).toBe(300);
    expect(wet(lookout, streams)).toBe(false);
  });
  test('leaves the source lake where it is', () => {
    const streams = [[[300, 0], [300, 600]]];
    const lake = { kind: 'lake', x: 300, y: 10, scale: 0.5 };
    keepDry([lake], streams, lake, { w: 800, sample });
    expect(lake.x).toBe(300);
  });
});

test('grass and clouds come out the same every time, inside the map', () => {
  expect(scatterGrass(1200, 4000)).toEqual(scatterGrass(1200, 4000));
  expect(scatterGrass(1200, 4000).light).not.toBe('');
  const clouds = driftClouds(1200, 4000, true);
  expect(clouds).toEqual(driftClouds(1200, 4000, true));
  for (const c of clouds) expect(c.y).toBeLessThan(4000);
});
