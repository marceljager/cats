// src/photos.json, written by scripts/images.js and read by src/lib/services/images.js: every
// file the site asks for exists, and every photo content.js names has its encoded copies
import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import photos from '../src/photos.json';
import { photoFile, photoInfo, srcset } from '../src/lib/services/images.js';
import { cats, gallery, stops } from '../src/content.js';

// 'photos/velik-640.avif' (relative to the page) → public/photos/velik-640.avif
const served = (path) => existsSync(new URL(`../public/${path}`, import.meta.url));
const files = (set) => set.split(', ').map((entry) => entry.split(' ')[0]);

test('every photo content.js names is in the manifest', () => {
  const named = [...cats.flatMap((c) => [c.photo, c.head]), ...stops.map((s) => s.photo), ...gallery.map((g) => g.photo)].filter(Boolean);
  for (const photo of named) expect(photoInfo(photo), photo).toBeTruthy();
});

describe.each(Object.keys(photos))('%s', (photo) => {
  const p = photos[photo];
  test('has its widths, smallest first, none wider than the photo', () => {
    expect(p.widths.length).toBeGreaterThan(0);
    expect(p.widths).toEqual([...p.widths].sort((a, b) => a - b));
    expect(Math.max(...p.widths)).toBeLessThanOrEqual(p.w);
    for (const w of p.fallbackWidths) expect(p.widths).toContain(w);
    expect(['jpg', 'png']).toContain(p.fallback);
  });
  test('every file its srcset and fallback point at exists', () => {
    for (const fmt of ['avif', 'webp']) for (const f of files(srcset(photo, fmt))) expect(served(f), f).toBe(true);
    const fallback = srcset(photo);
    if (fallback) for (const f of files(fallback)) expect(served(f), f).toBe(true);
    for (const px of [1, 320, 800, 5000]) expect(served(photoFile(photo, px)), `${px}px`).toBe(true);
    expect(served(photoFile(photo, 480, 'webp'))).toBe(true);
  });
});
