// the build's own scripts: the photo queue on the dev server, the prerender, the photo encoder
// (in a folder of its own, never the real photos/)
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
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

describe('the photo encoder', () => {
  test('encodes a new photo, skips it once it is up to date, and clears its files when it goes', async () => {
    const { optimizeImages } = await import('../scripts/encode-photos.js');
    const dir = await mkdtemp(join(tmpdir(), 'photos-'));
    const at = (p) => pathToFileURL(join(dir, p) + (p.endsWith('.json') ? '' : '/'));
    await mkdir(join(dir, 'photos'));
    await sharp({ create: { width: 900, height: 600, channels: 3, background: '#d6332a' } }).jpeg().toFile(join(dir, 'photos', 'red.jpg'));
    const dirs = { src: at('photos'), out: at('out'), manifest: at('photos.json') };
    const log = vi.fn();

    const manifest = await optimizeImages({ ...dirs, log });
    expect(manifest['/photos/red.jpg']).toMatchObject({ w: 900, h: 600, alpha: false, widths: [320, 480, 640, 800], fallback: 'jpg' });
    expect(await readdir(join(dir, 'out'))).toContain('red-640.avif');
    expect(JSON.parse(await readFile(join(dir, 'photos.json'), 'utf8'))).toEqual(manifest);
    expect(log).toHaveBeenCalledOnce();

    log.mockClear();
    expect(await optimizeImages({ ...dirs, log })).toEqual(manifest);
    expect(log).not.toHaveBeenCalled(); // nothing to encode again

    await rm(join(dir, 'photos', 'red.jpg'));
    expect(await optimizeImages({ ...dirs, log })).toEqual({});
    expect(await readdir(join(dir, 'out'))).toEqual([]);
    await rm(dir, { recursive: true });
  }, 60000);

  test('names the photo it could not read', async () => {
    const { optimizeImages } = await import('../scripts/encode-photos.js');
    const dir = await mkdtemp(join(tmpdir(), 'photos-'));
    await mkdir(join(dir, 'photos'));
    await writeFile(join(dir, 'photos', 'broken.jpg'), 'not a photo');
    const dirs = { src: pathToFileURL(join(dir, 'photos') + '/'), out: pathToFileURL(join(dir, 'out') + '/'), manifest: pathToFileURL(join(dir, 'photos.json')) };
    await expect(optimizeImages({ ...dirs, log: () => {} })).rejects.toThrow('photos: broken.jpg:');
    await rm(dir, { recursive: true });
  });
});
