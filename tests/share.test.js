// sending the page on (share.svelte.js): which ways it offers, and what each reports and counts
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { copyLink, linkCopier, options, shareNative, shareWith } from '../src/lib/services/share.svelte.js';
import { site } from '../src/content.js';

let counted;
beforeEach(() => {
  counted = [];
  vi.stubGlobal('location', { href: 'https://example.cz/#cesta' });
  vi.stubGlobal('window', { goatcounter: { count: (e) => counted.push(e.path) } });
  vi.stubGlobal('navigator', {});
});
afterEach(() => vi.unstubAllGlobals());

describe('options', () => {
  test("offers the phone's share sheet first only where there is one", () => {
    expect(options({ native: true })[0].id).toBe('native');
    expect(options({ native: false }).map((o) => o.id)).not.toContain('native');
    expect(options().map((o) => o.id)).not.toContain('native'); // no navigator.share here
  });
  test('links to the page itself, without the section it was on', () => {
    const whatsapp = options().find((o) => o.id === 'whatsapp');
    expect(decodeURIComponent(whatsapp.href)).toContain(`${site.share.text} https://example.cz/`);
    expect(whatsapp.href).not.toContain('cesta');
  });
  test('each option says what it does, and a link names its event and where it opens', () => {
    const all = options({ native: true });
    expect(all.map((o) => o.kind)).toEqual(['native', 'link', 'link', 'link', 'copy']);
    for (const o of all.filter((o) => o.kind === 'link')) expect(o.event).toBe(`sdilet-${o.id}`);
    expect(all.find((o) => o.id === 'whatsapp').target).toBe('_blank');
    expect(all.find((o) => o.id === 'email').target).toBeUndefined();
  });
  test('the e-mail carries the subject and the text', () => {
    const email = options().find((o) => o.id === 'email').href;
    expect(email).toContain(`subject=${encodeURIComponent(site.share.subject)}`);
    expect(email).toContain(encodeURIComponent(site.share.text));
  });
});

describe('shareNative', () => {
  test('counts a share that went out', async () => {
    navigator.share = vi.fn().mockResolvedValue(undefined);
    expect(await shareNative()).toBe('sent');
    expect(counted).toEqual(['sdilet-telefon']);
  });
  test('a sheet the visitor closed is no failure, and no share', async () => {
    navigator.share = vi.fn().mockRejectedValue(Object.assign(new Error('closed'), { name: 'AbortError' }));
    expect(await shareNative()).toBe('closed');
    expect(counted).toEqual([]);
  });
  test('a sheet that could not open fails, so the caller can offer another way', async () => {
    navigator.share = vi.fn().mockRejectedValue(new Error('not allowed'));
    expect(await shareNative()).toBe('failed');
  });
});

describe('shareWith', () => {
  const link = () => ({ copy: vi.fn() });
  test('copies the address for the copy option', async () => {
    const l = link();
    await shareWith(options().find((o) => o.kind === 'copy'), l);
    expect(l.copy).toHaveBeenCalledOnce();
  });
  test('falls back to copying when the share sheet fails, not when it went out', async () => {
    const native = options({ native: true })[0];
    const l = link();
    navigator.share = vi.fn().mockResolvedValue(undefined);
    await shareWith(native, l);
    expect(l.copy).not.toHaveBeenCalled();
    navigator.share = vi.fn().mockRejectedValue(new Error('not allowed'));
    await shareWith(native, l);
    expect(l.copy).toHaveBeenCalledOnce();
  });
});

describe('copyLink', () => {
  test('counts a link that made it to the clipboard', async () => {
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    expect(await copyLink()).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.cz/');
    expect(counted).toEqual(['sdilet-odkaz']);
  });
  test('reports a copy that failed both ways, and counts nothing', async () => {
    navigator.clipboard = { writeText: vi.fn().mockRejectedValue(new Error('denied')) };
    const field = { setAttribute() {}, style: {}, select() {}, remove() {} };
    vi.stubGlobal('document', { activeElement: null, createElement: () => field, body: { append() {} }, execCommand: () => false });
    expect(await copyLink()).toBe(false);
    expect(counted).toEqual([]);
  });
  test('linkCopier shows the outcome for a moment', async () => {
    vi.useFakeTimers();
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    const link = linkCopier(1000);
    await link.copy();
    expect([link.copied, link.failed]).toEqual([true, false]);
    vi.advanceTimersByTime(1000);
    expect(link.copied).toBe(false);
    vi.useRealTimers();
  });
});
