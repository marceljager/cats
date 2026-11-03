// the pictures made by hand (tools/) and the page's entry point (src/main.js)
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { afterEach, expect, test, vi } from 'vitest';
import { cropPhoto, font, ogPage } from '../tools/og.js';
import { touchIcon } from '../tools/icons.js';

test('the iPhone icon is a 180 px square, filled to its corners', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'icons-'));
  const out = join(dir, 'icon.png');
  await touchIcon(fileURLToPath(new URL('../public/favicon.svg', import.meta.url)), out);
  const { data, info } = await sharp(out).raw().toBuffer({ resolveWithObject: true });
  expect([info.width, info.height]).toEqual([180, 180]);
  expect([...data.subarray(0, 3)]).toEqual([0x10, 0x23, 0x3a]); // the top-left corner is the night blue
  await rm(dir, { recursive: true });
});

test("the link preview page shows the site's name and the photo, in the page's own font", async () => {
  const photo = await cropPhoto();
  expect(await sharp(photo).metadata()).toMatchObject({ width: 840, height: 840, format: 'jpeg' });
  const html = ogPage(photo);
  expect(html).toContain('<h1>Velík a&nbsp;Polly hledají domov</h1>');
  expect(html).toContain(`data:image/jpeg;base64,${photo.toString('base64')}`);
  for (const f of ['nunito-latin-wght-normal.woff2', 'nunito-latin-ext-wght-normal.woff2']) expect(existsSync(font(f)), f).toBe(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock('svelte');
  vi.doUnmock('../src/lib/services/track.js');
});

for (const [built, start] of [[true, 'hydrate'], [false, 'mount']]) {
  test(`main.js ${start}s the page ${built ? 'over the prerendered HTML' : 'into the empty dev page'} and starts counting link clicks`, async () => {
    vi.resetModules();
    const target = { firstChild: built ? {} : null };
    vi.stubGlobal('document', { getElementById: (id) => (id === 'app' ? target : null) });
    const svelte = { hydrate: vi.fn(() => 'hydrated'), mount: vi.fn(() => 'mounted') };
    const trackLinks = vi.fn();
    vi.doMock('svelte', async (real) => ({ ...(await real()), ...svelte }));
    vi.doMock('../src/lib/services/track.js', () => ({ trackLinks }));
    const { default: app } = await import('../src/main.js');
    expect(trackLinks).toHaveBeenCalledOnce();
    expect(svelte[start]).toHaveBeenCalledWith(expect.anything(), { target });
    expect(app).toBe(built ? 'hydrated' : 'mounted');
  });
}
