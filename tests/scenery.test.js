// the places on the map (scenery.js), which Doodle.svelte draws
import { expect, test } from 'vitest';
import { KINDS, layoutPlace } from '../src/lib/art/scenery.js';

test('every kind of place is laid out from some pieces, the same each time for the same seed', () => {
  for (const kind of KINDS) {
    const items = layoutPlace(kind, { seed: 3 });
    expect(items.length, kind).toBeGreaterThan(0);
    expect(layoutPlace(kind, { seed: 3 }), kind).toEqual(items);
  }
});

test('pieces come back to front', () => {
  for (const kind of KINDS) {
    const depth = layoutPlace(kind, { seed: 5 }).map((it) => it.z ?? it.y ?? -999);
    expect(depth, kind).toEqual([...depth].sort((a, b) => a - b));
  }
});

test('a tree is the same size on screen whatever the scale of its place', () => {
  const size = (scale) => layoutPlace('forest', { seed: 2, scale }).find((it) => it.s).s * scale;
  expect(size(2)).toBeCloseTo(size(1));
  expect(size(0.5)).toBeCloseTo(size(1));
});
