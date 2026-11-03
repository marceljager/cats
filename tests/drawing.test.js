// the seeded randomness and the night forest's pines (random.js, forest.js)
import { expect, test } from 'vitest';
import { rng } from '../src/lib/art/random.js';
import { layer, pine } from '../src/lib/art/forest.js';

test('the same seed gives the same numbers, all between 0 and 1', () => {
  const a = rng(42);
  const b = rng(42);
  const numbers = Array.from({ length: 200 }, a);
  expect(Array.from({ length: 200 }, b)).toEqual(numbers);
  for (const n of numbers) expect(n >= 0 && n < 1).toBe(true);
  expect(rng(43)()).not.toBe(rng(42)());
});

test('a pine has its trunk and three tiers, four once it is tall', () => {
  expect(pine(100, 500, 200, 90).tiers).toHaveLength(3);
  expect(pine(100, 500, 400, 160).tiers).toHaveLength(4);
  expect(pine(100, 500, 200, 90)).toEqual(pine(100, 500, 200, 90));
});

test('a row of pines keeps clear of the gaps it is given', () => {
  const opts = { seed: 3, count: 26, span: [-40, 1480], base: 760, height: [200, 330], clear: [[860, 960]] };
  const row = layer(opts);
  expect(row).toEqual(layer(opts));
  expect(row.length).toBeLessThan(26);
  expect(layer({ ...opts, clear: [] })).toHaveLength(26);
  // every pine path starts at its tip, x first: none stands in the gap
  const tips = row.map((t) => Number(t.tiers[0].split(' ')[1]));
  for (const x of tips) expect(x > 860 && x < 960).toBe(false);
});
