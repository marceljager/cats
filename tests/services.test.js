// the lightbox's opener and the visit counting (lightbox.js, track.js)
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

let counted;
beforeEach(() => {
  counted = [];
  vi.resetModules();
  vi.stubGlobal('window', { goatcounter: { count: (e) => counted.push(e.path) } });
});
afterEach(() => vi.unstubAllGlobals());

describe('lightbox', () => {
  test('opens nothing, and counts nothing, before the lightbox is on the page', async () => {
    const { zoom } = await import('../src/lib/services/lightbox.js');
    zoom({ items: [], source: () => ({}) });
    expect(counted).toEqual([]);
  });
  test('hands the request to the lightbox and counts the photo', async () => {
    const { setLightbox, zoom } = await import('../src/lib/services/lightbox.js');
    const show = vi.fn();
    setLightbox(show);
    const source = () => ({});
    zoom({ items: [{ photo: 'a' }], index: 0, source });
    expect(show).toHaveBeenCalledWith({ items: [{ photo: 'a' }], index: 0, source, opener: null });
    expect(counted).toEqual(['foto']);
  });
  test('a lone photo flies out at its own shape and tilt', async () => {
    const { setLightbox, zoomPhoto } = await import('../src/lib/services/lightbox.js');
    const show = vi.fn();
    setLightbox(show);
    const el = {};
    zoomPhoto({ el, photo: '/photos/velik.jpg', alt: 'Velík', ratio: '1 / 1', tilt: 3 });
    const req = show.mock.calls[0][0];
    expect(req.items).toEqual([{ photo: '/photos/velik.jpg', alt: 'Velík', hint: '', ratio: '1 / 1', tape: false }]);
    expect(req.source(0)).toEqual({ el, tilt: 3, img: null });
  });
});

describe('trackLinks', () => {
  test('counts a click anywhere inside a link that names its event, and nothing else', async () => {
    let click;
    vi.stubGlobal('document', { addEventListener: (type, fn) => (click = fn) });
    const { trackLinks } = await import('../src/lib/services/track.js');
    trackLinks();
    const on = (name) => click({ target: { closest: (sel) => (sel === '[data-track]' && name ? { getAttribute: () => name } : null) } });
    on('napsat-email');
    on('sdilet-whatsapp');
    on(null); // a link without data-track, e.g. '#cesta'
    expect(counted).toEqual(['napsat-email', 'sdilet-whatsapp']);
  });
});
