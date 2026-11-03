// the shared scroll listener, the parallax and the spring actions (viewport.js, parallax.js,
// springs.js), with a fake window: when they run and what they hand on, not how things look
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

let listeners;
let frames;
let reduce;
beforeEach(() => {
  vi.resetModules();
  listeners = {};
  frames = [];
  reduce = false;
  vi.stubGlobal('addEventListener', (type, fn) => (listeners[type] ??= new Set()).add(fn));
  vi.stubGlobal('removeEventListener', (type, fn) => listeners[type]?.delete(fn));
  vi.stubGlobal('requestAnimationFrame', (fn) => frames.push(fn));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('innerHeight', 800);
  vi.stubGlobal('matchMedia', (q) => ({ matches: q.includes('reduce') ? reduce : true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => vi.unstubAllGlobals());
const fire = (type) => listeners[type]?.forEach((fn) => fn());
const nextFrame = () => frames.splice(0).forEach((fn) => fn());

describe('viewport', () => {
  test('any number of scroll events in a frame run each subscriber once', async () => {
    const { onScrollFrame } = await import('../src/lib/motion/viewport.js');
    const seen = vi.fn();
    const stop = onScrollFrame(seen);
    fire('scroll');
    fire('scroll');
    fire('resize');
    nextFrame();
    expect(seen).toHaveBeenCalledTimes(1);
    stop();
    expect(listeners.scroll.size).toBe(0);
  });
  test('onScreen and reducedMotion ask the window', async () => {
    const { onScreen, reducedMotion } = await import('../src/lib/motion/viewport.js');
    const at = (top, bottom) => ({ getBoundingClientRect: () => ({ top, bottom }) });
    expect(onScreen(at(100, 300))).toBe(true);
    expect(onScreen(at(900, 1000))).toBe(false);
    expect(onScreen(at(900, 1000), 200)).toBe(true);
    reduce = true;
    expect(reducedMotion()).toBe(true);
  });
});

describe('parallax', () => {
  const node = (top) => ({ style: {}, getBoundingClientRect: () => ({ top, bottom: top + 100, height: 100 }) });
  test('drifts by its share of the distance from the middle of the screen', async () => {
    const { parallax } = await import('../src/lib/motion/parallax.js');
    const el = node(550); // centre 600, 200 below the middle
    const action = parallax(el, 0.1);
    expect(el.style.translate).toBe('0 20.0px');
    action.update({ speed: -0.05 });
    expect(el.style.translate).toBe('0 -10.0px');
    action.destroy();
    expect(el.style.translate).toBe('');
  });
  test('stays put with reduced motion', async () => {
    reduce = true;
    const { parallax } = await import('../src/lib/motion/parallax.js');
    const el = node(550);
    expect(parallax(el, 0.1)).toEqual({});
    expect(el.style.translate).toBeUndefined();
  });
});

describe('springs', () => {
  const element = () => {
    const on = {};
    return { on, style: {}, offsetWidth: 100, addEventListener: (t, fn) => (on[t] = fn), removeEventListener: (t) => delete on[t], querySelector: () => null, matches: () => false };
  };
  test('swing pushes on pointing and takes new options at once', async () => {
    const animate = vi.fn();
    vi.doMock('motion', () => ({ animate, hover: () => () => {}, press: () => () => {}, scroll: () => () => {}, motionValue: () => ({}) }));
    const { swing } = await import('../src/lib/motion/springs.js');
    const el = element();
    const action = swing(el, { stiffness: 190, cooldown: 0 });
    el.on.pointerenter({ movementX: 4 });
    expect(animate.mock.calls[0][2]).toMatchObject({ type: 'spring', stiffness: 190, velocity: 150 + 4 * 14 });
    action.update({ stiffness: 90, base: 50, cooldown: 0 });
    el.on.pointerenter({ movementX: -2 });
    expect(animate.mock.calls[1][2]).toMatchObject({ stiffness: 90, velocity: -(50 + 2 * 14) });
    action.destroy();
    expect(el.on.pointerenter).toBeUndefined();
    vi.doUnmock('motion');
  });
  test('nothing swings with reduced motion', async () => {
    reduce = true;
    const animate = vi.fn();
    vi.doMock('motion', () => ({ animate, hover: () => () => {}, press: () => () => {}, scroll: () => () => {}, motionValue: () => ({}) }));
    const { swing, pop } = await import('../src/lib/motion/springs.js');
    const el = element();
    swing(el, { cooldown: 0 });
    el.on.pointerenter({ movementX: 4 });
    pop(el, { scale: [1, 1.2, 1] });
    expect(animate).not.toHaveBeenCalled();
    vi.doUnmock('motion');
  });
});
