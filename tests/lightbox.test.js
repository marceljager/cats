// @vitest-environment happy-dom
// the lightbox itself (chrome/Lightbox.svelte), mounted in a browser-like page with reduced motion,
// so it opens and closes without the flight: one photo at a time, arrows that wrap, and the page
// handed back as it was
import { flushSync, mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, expect, test } from 'vitest';
import Lightbox from '../src/lib/chrome/Lightbox.svelte';
import { zoom } from '../src/lib/services/lightbox.js';

let app;
let opener;
const photos = ['a', 'b', 'c'].map((n) => ({ photo: null, alt: n, hint: n, ratio: '4 / 5', caption: `Fotka ${n}` }));
const prints = photos.map(() => document.createElement('div'));
const source = (i) => ({ el: prints[i], tilt: 0 });
const dialog = () => document.querySelector('dialog');
const label = () => dialog().getAttribute('aria-label');
const settle = async () => {
  for (let i = 0; i < 5; i++) {
    flushSync();
    await tick();
    await new Promise((r) => setTimeout(r, 0));
  }
};

beforeEach(() => {
  window.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} });
  window.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  document.body.innerHTML = '';
  opener = document.body.appendChild(document.createElement('button'));
  prints.forEach((p) => document.body.append(p));
  app = mount(Lightbox, { target: document.body.appendChild(document.createElement('div')) });
  flushSync();
});
afterEach(() => unmount(app));

test('opens on the photo asked for, hides it on the page and locks the page scroll', async () => {
  zoom({ items: photos, index: 1, source, opener });
  await settle();
  expect(dialog().open).toBe(true);
  expect(label()).toBe('Fotka 2 z 3: Fotka b');
  expect(prints[1].style.visibility).toBe('hidden');
  expect(document.documentElement.style.overflow).toBe('hidden');
});

test('a second photo asked for while one is open is ignored', async () => {
  zoom({ items: photos, index: 0, source, opener });
  await settle();
  zoom({ items: photos, index: 2, source, opener });
  await settle();
  expect(label()).toBe('Fotka 1 z 3: Fotka a');
});

test('the arrow keys step through the photos and wrap round at either end', async () => {
  zoom({ items: photos, index: 0, source, opener });
  await settle();
  const press = async (key) => {
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await settle();
  };
  await press('ArrowLeft');
  expect(label()).toBe('Fotka 3 z 3: Fotka c');
  expect(prints[2].style.visibility).toBe('hidden');
  expect(prints[0].style.visibility).toBe('');
  await press('ArrowRight');
  expect(label()).toBe('Fotka 1 z 3: Fotka a');
});

test('closing gives the page back: photo shown, scroll unlocked, focus on what opened it', async () => {
  zoom({ items: photos, index: 1, source, opener });
  await settle();
  document.querySelector('.nav.shut button').click();
  await settle();
  dialog().dispatchEvent(new Event('close'));
  await settle();
  expect(dialog().open).toBe(false);
  expect(prints[1].style.visibility).toBe('');
  expect(document.documentElement.style.overflow).toBe('');
  expect(document.activeElement).toBe(opener);
});

test('closed by a click, the photo gets the focus back without its ring; closed by a key, with it', async () => {
  const closeWith = async (how) => {
    zoom({ items: photos, index: 0, source, opener });
    await settle();
    if (how === 'click') dialog().dispatchEvent(new Event('pointerdown', { bubbles: true }));
    else dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.querySelector('.nav.shut button').click();
    await settle();
    dialog().dispatchEvent(new Event('close'));
    await settle();
  };
  await closeWith('click');
  expect(document.activeElement).toBe(opener);
  expect(opener.classList.contains('quiet-focus')).toBe(true);
  // the next key brings the ring back
  dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
  expect(opener.classList.contains('quiet-focus')).toBe(false);
  opener.blur();
  await closeWith('key');
  expect(document.activeElement).toBe(opener);
  expect(opener.classList.contains('quiet-focus')).toBe(false);
});

test('once the lightbox is gone, asking for a photo opens nothing', async () => {
  unmount(app);
  zoom({ items: photos, index: 0, source, opener });
  await settle();
  expect(document.querySelector('dialog')).toBeNull();
  app = mount(Lightbox, { target: document.body.appendChild(document.createElement('div')) });
});
