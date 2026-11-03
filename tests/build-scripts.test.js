// the build's own scripts: the photo queue on the dev server, the prerender, the photo encoder
import { describe, expect, test, vi } from 'vitest';
import { checkOnlyIndex, fill } from '../scripts/prerender.js';

describe('prerender', () => {
  const page = '<html><head><title>x</title></head><body><div id="app"></div></body></html>';
  test('puts the rendered head and body into the built page', () => {
    expect(fill(page, { head: '<meta a>', body: '<main>story</main>' })).toBe('<html><head><title>x</title><meta a></head><body><div id="app"><main>story</main></div></body></html>');
  });
  test('refuses a page without the empty app element', () => {
    expect(() => fill('<html><body></body></html>', { head: '', body: '' })).toThrow('no empty');
  });
  test('lets nothing but the landing page into the upload', () => {
    expect(() => checkOnlyIndex(['index.html', 'assets/a.js'])).not.toThrow();
    expect(() => checkOnlyIndex(['index.html', 'kit.html'])).toThrow('kit.html');
  });
});

describe('the dev server photo plugin', () => {
  test('a failed run is reported and the next photo change still runs', async () => {
    vi.resetModules();
    const optimizeImages = vi.fn().mockRejectedValueOnce(new Error('broken file')).mockResolvedValue({});
    vi.doMock('../scripts/encode-photos.js', () => ({ optimizeImages }));
    const { devPhotos } = await import('../vite/dev-photos.js');
    const handlers = {};
    const errors = [];
    const reloads = [];
    const server = {
      watcher: { add() {}, on(event, fn) { handlers[event] = fn; return this; } },
      config: { logger: { info() {}, error: (m) => errors.push(m) } },
      ws: { send: (m) => reloads.push(m) },
    };
    devPhotos().configureServer(server);
    const photo = new URL('../photos/new.jpg', import.meta.url).pathname;
    await handlers.add(photo);
    expect(errors).toEqual(['images: broken file']);
    expect(reloads).toEqual([]);
    await handlers.change(photo);
    expect(optimizeImages).toHaveBeenCalledTimes(2);
    expect(reloads).toEqual([{ type: 'full-reload' }]);
    vi.doUnmock('../scripts/encode-photos.js');
  });
});

test('the photo encoder, already up to date, gives back the manifest the site reads', async () => {
  const { optimizeImages } = await import('../scripts/encode-photos.js');
  const manifest = await optimizeImages({ log: () => {} });
  const { default: photos } = await import('../src/photos.json');
  expect(manifest).toEqual(photos);
}, 60000);
